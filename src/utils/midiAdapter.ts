import { MidiConnectionStatus, MidiDeviceInfo, ParsedMidiEvent } from '../types';

export type MidiEventCallback = (event: ParsedMidiEvent) => void;
export type MidiStatusChangeCallback = (
  status: MidiConnectionStatus,
  devices: MidiDeviceInfo[],
  selectedDeviceId: string | null,
  errorReason?: string
) => void;

/**
 * Pure MIDI Message Parser
 * Separates raw byte decoding from hardware I/O.
 * - Treats Note On (0x90) with velocity 0 as Note Off.
 * - Supports MIDI velocity 1..127.
 * - Handles Sustain Pedal CC64 (value >= 64 = ON, < 64 = OFF).
 * - Handles All Sound Off (CC120) and All Notes Off (CC123).
 * - Filters out system real-time clock/sensing bytes (>= 0xF0).
 */
export function parseRawMidiMessage(
  data: Uint8Array | number[],
  timestamp: number = performance.now()
): ParsedMidiEvent | null {
  if (!data || data.length < 2) return null;

  const status = data[0];
  // Ignore System Common and System Real-Time messages (Clock 0xF8, Active Sensing 0xFE, etc.)
  if (status >= 0xf0) return null;

  const command = status & 0xf0;
  const channel = (status & 0x0f) + 1; // MIDI channels 1..16
  const data1 = data[1] & 0x7f;        // Note number or CC number (0..127)
  const data2 = data.length > 2 ? data[2] & 0x7f : 0; // Velocity or CC value (0..127)

  // Note On (0x90)
  if (command === 0x90) {
    if (data2 === 0) {
      // Standard MIDI specification: Note On with velocity 0 is Note Off
      return {
        type: 'noteoff',
        note: data1,
        velocity: 0,
        normalizedVelocity: 0,
        channel,
        timestamp,
      };
    }

    const clampedVelocity = Math.max(1, Math.min(127, data2));
    return {
      type: 'noteon',
      note: data1,
      velocity: clampedVelocity,
      normalizedVelocity: clampedVelocity / 127,
      channel,
      timestamp,
    };
  }

  // Note Off (0x80)
  if (command === 0x80) {
    return {
      type: 'noteoff',
      note: data1,
      velocity: data2,
      normalizedVelocity: data2 / 127,
      channel,
      timestamp,
    };
  }

  // Control Change (0xB0)
  if (command === 0xb0) {
    // CC 64: Sustain Pedal (Damper)
    if (data1 === 64) {
      return {
        type: 'sustain',
        sustainDown: data2 >= 64,
        channel,
        timestamp,
      };
    }

    // CC 120 (All Sound Off) or CC 123 (All Notes Off)
    if (data1 === 120 || data1 === 123) {
      return {
        type: 'allnotesoff',
        channel,
        timestamp,
      };
    }
  }

  return null;
}

/**
 * Decoupled & Reusable Web MIDI Hardware Adapter
 * Manages Web MIDI API permissions, input device enumeration,
 * hot-plug detection (onstatechange), and single-listener lifecycle.
 */
export class RumieMidiAdapter {
  private midiAccess: MIDIAccess | null = null;
  private activeInput: MIDIInput | null = null;
  private selectedDeviceId: string | null = null;
  private status: MidiConnectionStatus = 'disconnected';
  private onMidiEvent: MidiEventCallback | null = null;
  private onStatusChange: MidiStatusChangeCallback | null = null;

  constructor(
    onMidiEvent: MidiEventCallback,
    onStatusChange: MidiStatusChangeCallback
  ) {
    this.onMidiEvent = onMidiEvent;
    this.onStatusChange = onStatusChange;
  }

  /**
   * Checks if the current browser environment supports Web MIDI API
   */
  public static isWebMidiSupported(): boolean {
    return typeof navigator !== 'undefined' && typeof navigator.requestMIDIAccess === 'function';
  }

  /**
   * Requests MIDI permissions and initializes hardware discovery
   */
  public async initialize(): Promise<void> {
    if (!RumieMidiAdapter.isWebMidiSupported()) {
      this.status = 'unsupported';
      this.notifyStatusChange('unsupported');
      return;
    }

    this.status = 'connecting';
    this.notifyStatusChange();

    try {
      const access = await navigator.requestMIDIAccess({ sysex: false });
      this.midiAccess = access;

      // Ensure only a single statechange listener is attached
      this.midiAccess.onstatechange = this.handleStateChange;

      this.syncDevicesAndConnection();
    } catch (err) {
      this.status = 'permission_denied';
      const msg = err instanceof Error ? err.message : 'MIDI permission denied';
      this.notifyStatusChange(msg);
    }
  }

  /**
   * Enumerates currently connected physical/virtual MIDI input ports
   */
  public getConnectedInputs(): MidiDeviceInfo[] {
    if (!this.midiAccess) return [];

    const list: MidiDeviceInfo[] = [];
    this.midiAccess.inputs.forEach((input) => {
      if (input.state === 'connected') {
        list.push({
          id: input.id,
          name: input.name || `MIDI Input (${input.id})`,
          manufacturer: input.manufacturer || 'Generic MIDI',
          state: input.state,
          connection: input.connection,
        });
      }
    });

    return list;
  }

  /**
   * Selects a specific MIDI input device by ID (or null/'' to disconnect)
   * Cleans up previous input listener before attaching to the new device.
   */
  public selectDevice(deviceId: string | null): void {
    // 1. Detach listener from any previously selected device
    this.detachActiveInput();

    if (!deviceId || !this.midiAccess) {
      this.selectedDeviceId = null;
      this.status = 'disconnected';
      this.emitAllNotesOff();
      this.notifyStatusChange();
      return;
    }

    const targetInput = this.midiAccess.inputs.get(deviceId);

    // Do not mark connected if the hardware device does not exist or is disconnected
    if (!targetInput || targetInput.state !== 'connected') {
      this.selectedDeviceId = null;
      this.status = 'disconnected';
      this.emitAllNotesOff();
      this.notifyStatusChange();
      return;
    }

    // 2. Attach single listener to the verified connected device
    this.activeInput = targetInput;
    this.selectedDeviceId = targetInput.id;
    this.activeInput.onmidimessage = this.handleMidiMessage;
    this.status = 'connected';
    this.notifyStatusChange();
  }

  /**
   * Handles hot-plugging (connecting or disconnecting USB MIDI devices)
   */
  private handleStateChange = (_event: MIDIConnectionEvent): void => {
    this.syncDevicesAndConnection();
  };

  /**
   * Synchronizes available devices and validates active device state
   */
  private syncDevicesAndConnection(): void {
    if (!this.midiAccess) return;

    const availableDevices = this.getConnectedInputs();

    // Check if the currently selected device is still connected
    if (this.selectedDeviceId) {
      const stillPresent = availableDevices.some((d) => d.id === this.selectedDeviceId);
      if (!stillPresent) {
        // Selected controller was unplugged! Clean up and release any held notes
        this.detachActiveInput();
        this.selectedDeviceId = null;
        this.status = 'disconnected';
        this.emitAllNotesOff();
      }
    }

    // Auto-select first available controller if none is currently selected and at least one exists
    if (!this.selectedDeviceId && availableDevices.length > 0) {
      this.selectDevice(availableDevices[0].id);
      return;
    }

    // If no devices exist at all, guarantee status is disconnected
    if (availableDevices.length === 0) {
      this.detachActiveInput();
      this.selectedDeviceId = null;
      this.status = 'disconnected';
    }

    this.notifyStatusChange();
  }

  /**
   * Raw MIDI Message callback bound to the active MIDIInput only
   */
  private handleMidiMessage = (event: MIDIMessageEvent): void => {
    if (!event.data || !this.onMidiEvent) return;
    const parsed = parseRawMidiMessage(event.data, event.timeStamp);
    if (parsed) {
      this.onMidiEvent(parsed);
    }
  };

  /**
   * Safely removes listener from the active MIDIInput to prevent duplicate handlers
   */
  private detachActiveInput(): void {
    if (this.activeInput) {
      this.activeInput.onmidimessage = null;
      this.activeInput = null;
    }
  }

  private emitAllNotesOff(): void {
    if (this.onMidiEvent) {
      this.onMidiEvent({
        type: 'allnotesoff',
        channel: 1,
        timestamp: performance.now(),
      });
    }
  }

  private notifyStatusChange(errorReason?: string): void {
    if (!this.onStatusChange) return;
    const devices = this.getConnectedInputs();
    // Strict safety check: never report 'connected' if selectedDeviceId is null or not in devices
    const isTrulyConnected =
      this.status === 'connected' &&
      this.selectedDeviceId !== null &&
      devices.some((d) => d.id === this.selectedDeviceId);

    const effectiveStatus: MidiConnectionStatus = isTrulyConnected
      ? 'connected'
      : this.status === 'connected'
      ? 'disconnected'
      : this.status;

    this.onStatusChange(
      effectiveStatus,
      devices,
      isTrulyConnected ? this.selectedDeviceId : null,
      errorReason
    );
  }

  /**
   * Full cleanup on component unmount
   */
  public dispose(): void {
    this.detachActiveInput();
    if (this.midiAccess) {
      this.midiAccess.onstatechange = null;
      this.midiAccess = null;
    }
    this.onMidiEvent = null;
    this.onStatusChange = null;
  }
}
