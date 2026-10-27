export type PianoInstrumentId =
  | 'grand_piano'
  | 'bright_piano'
  | 'stage_layer'
  | 'vintage_ep'
  | 'fm_ep'
  | 'rhodes'
  | 'electric_piano';

export interface PianoInstrumentOption {
  id: PianoInstrumentId;
  labelEs: string;
  labelEn: string;
  badge: string;
}

export const PIANO_INSTRUMENTS: PianoInstrumentOption[] = [
  {
    id: 'grand_piano',
    labelEs: 'Grand Piano HD',
    labelEn: 'Grand Piano HD',
    badge: 'Concert Grand',
  },
  {
    id: 'bright_piano',
    labelEs: 'Bright Studio Piano',
    labelEn: 'Bright Studio Piano',
    badge: 'Studio Acoustic',
  },
  {
    id: 'stage_layer',
    labelEs: 'Stage Layer (Piano + EP)',
    labelEn: 'Stage Layer (Piano + EP)',
    badge: 'Warm Layer',
  },
  {
    id: 'vintage_ep',
    labelEs: 'Vintage Tine EP',
    labelEn: 'Vintage Tine EP',
    badge: '70s Tine Electric',
  },
  {
    id: 'fm_ep',
    labelEs: 'FM Crystal EP',
    labelEn: 'FM Crystal EP',
    badge: '80s Digital EP',
  },
];

interface ActiveVoice {
  stop: (immediate?: boolean) => void;
}

const MUSYNG_CDN = 'https://gleitz.github.io/midi-js-soundfonts/MusyngKite';

type BankKey = 'grand_piano' | 'bright_piano' | 'vintage_ep' | 'fm_ep';

function buildPianoZoneMap(folderName: string): Record<number, string> {
  return {
    36: `${MUSYNG_CDN}/${folderName}-mp3/C2.mp3`,
    39: `${MUSYNG_CDN}/${folderName}-mp3/Eb2.mp3`,
    42: `${MUSYNG_CDN}/${folderName}-mp3/Gb2.mp3`,
    45: `${MUSYNG_CDN}/${folderName}-mp3/A2.mp3`,
    48: `${MUSYNG_CDN}/${folderName}-mp3/C3.mp3`,
    51: `${MUSYNG_CDN}/${folderName}-mp3/Eb3.mp3`,
    54: `${MUSYNG_CDN}/${folderName}-mp3/Gb3.mp3`,
    57: `${MUSYNG_CDN}/${folderName}-mp3/A3.mp3`,
    60: `${MUSYNG_CDN}/${folderName}-mp3/C4.mp3`,
    63: `${MUSYNG_CDN}/${folderName}-mp3/Eb4.mp3`,
    66: `${MUSYNG_CDN}/${folderName}-mp3/Gb4.mp3`,
    69: `${MUSYNG_CDN}/${folderName}-mp3/A4.mp3`,
    72: `${MUSYNG_CDN}/${folderName}-mp3/C5.mp3`,
    75: `${MUSYNG_CDN}/${folderName}-mp3/Eb5.mp3`,
    78: `${MUSYNG_CDN}/${folderName}-mp3/Gb5.mp3`,
    81: `${MUSYNG_CDN}/${folderName}-mp3/A5.mp3`,
    84: `${MUSYNG_CDN}/${folderName}-mp3/C6.mp3`,
    96: `${MUSYNG_CDN}/${folderName}-mp3/C7.mp3`,
  };
}

const PIANO_SAMPLE_BANKS_URLS: Record<BankKey, Record<number, string>> = {
  grand_piano: buildPianoZoneMap('acoustic_grand_piano'),
  bright_piano: buildPianoZoneMap('bright_acoustic_piano'),
  vintage_ep: buildPianoZoneMap('electric_piano_1'),
  fm_ep: buildPianoZoneMap('electric_piano_2'),
};

class PianoSynthesizerEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private dryBus: GainNode | null = null;
  private reverbConvolver: ConvolverNode | null = null;
  private reverbWetGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private activeVoices: Map<number, ActiveVoice> = new Map();
  private enabled: boolean = true;
  private volume: number = 1.0;
  private instrument: PianoInstrumentId = 'grand_piano';

  private sampleBanks: Record<BankKey, Map<number, AudioBuffer>> = {
    grand_piano: new Map(),
    bright_piano: new Map(),
    vintage_ep: new Map(),
    fm_ep: new Map(),
  };

  private loadingPromises: Partial<Record<BankKey, Promise<void>>> = {};

  // Estado del Metrónomo
  private metroPlaying: boolean = false;
  private metroBpm: number = 90;
  private metroBeatsPerBar: number = 4;
  private metroCurrentBeat: number = 0;
  private metroTimerId: number | null = null;
  private metroBeatCallback: ((beat: number) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      setTimeout(() => this.preloadAllPianoBanks(), 80);
    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtx({ latencyHint: 'interactive' });

      this.dryBus = this.ctx.createGain();
      this.dryBus.gain.setValueAtTime(1.2, this.ctx.currentTime);

      this.reverbConvolver = this.createStereoRoomImpulse(1.5, 3.5);
      this.reverbWetGain = this.ctx.createGain();
      this.reverbWetGain.gain.setValueAtTime(0.15, this.ctx.currentTime);

      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-1.5, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(2.0, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(20, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.001, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.08, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(
        this.enabled ? this.volume * 1.2 : 0,
        this.ctx.currentTime
      );

      this.dryBus.connect(this.compressor);
      this.dryBus.connect(this.reverbWetGain);
      this.reverbWetGain.connect(this.reverbConvolver);
      this.reverbConvolver.connect(this.compressor);

      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
      this.noiseBuffer = this.ctx.createBuffer(
        1,
        bufferSize,
        this.ctx.sampleRate
      );
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }

      this.preloadAllPianoBanks();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  private createStereoRoomImpulse(
    durationSec: number,
    decay: number
  ): ConvolverNode {
    const ctx = this.ctx!;
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * durationSec);
    const impulse = ctx.createBuffer(2, length, rate);

    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        const t = i / rate;
        if (t < 0.012) {
          data[i] = 0;
        } else {
          const env = Math.pow(1 - i / length, decay);
          data[i] = (Math.random() * 2 - 1) * env * 0.22;
        }
      }
    }

    const convolver = ctx.createConvolver();
    convolver.buffer = impulse;
    return convolver;
  }

  private normalizeBufferByLoudness(
    buffer: AudioBuffer,
    targetRms: number = 0.26,
    maxAllowedPeak: number = 0.88
  ): AudioBuffer {
    const rate = buffer.sampleRate;
    const ch0 = buffer.getChannelData(0);

    let startIdx = 0;
    for (let i = 0; i < ch0.length; i++) {
      if (Math.abs(ch0[i]) > 0.008) {
        startIdx = i;
        break;
      }
    }

    const windowLength = Math.min(
      ch0.length - startIdx,
      Math.floor(rate * 0.55)
    );

    if (windowLength <= 100) return buffer;

    let sumSquares = 0;
    let totalSamples = 0;
    let currentPeak = 0;

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < data.length; i++) {
        const abs = Math.abs(data[i]);
        if (abs > currentPeak) currentPeak = abs;
        if (i >= startIdx && i < startIdx + windowLength) {
          sumSquares += data[i] * data[i];
          totalSamples++;
        }
      }
    }

    const rms = Math.sqrt(sumSquares / Math.max(1, totalSamples));
    if (rms < 0.0005 || currentPeak < 0.0005) return buffer;

    let gainFactor = Math.min(6.5, Math.max(0.3, targetRms / rms));

    if (currentPeak * gainFactor > maxAllowedPeak) {
      gainFactor = maxAllowedPeak / currentPeak;
    }

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < data.length; i++) {
        data[i] = data[i] * gainFactor;
      }
    }

    return buffer;
  }

  public async preloadAllPianoBanks(): Promise<void> {
    await Promise.allSettled([
      this.loadSampleBank('grand_piano'),
      this.loadSampleBank('bright_piano'),
      this.loadSampleBank('vintage_ep'),
      this.loadSampleBank('fm_ep'),
    ]);
  }

  private async loadSampleBank(bankKey: BankKey): Promise<void> {
    if (this.sampleBanks[bankKey].size > 0) return;
    if (this.loadingPromises[bankKey]) {
      return this.loadingPromises[bankKey];
    }

    const urlMap = PIANO_SAMPLE_BANKS_URLS[bankKey];
    // +2 dB adicionales en el banco de Grand Piano HD (targetRms 0.32 y techo 0.96)
    const isGrand = bankKey === 'grand_piano';
    const targetRms = isGrand ? 0.32 : 0.26;
    const maxPeak = isGrand ? 0.96 : 0.88;

    const promise = (async () => {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const entries = Object.entries(urlMap);

      await Promise.allSettled(
        entries.map(async ([midiStr, url]) => {
          try {
            const resp = await fetch(url);
            if (!resp.ok) return;
            const arrayBuf = await resp.arrayBuffer();
            const decoded = await ctx.decodeAudioData(arrayBuf);
            const normalized = this.normalizeBufferByLoudness(
              decoded,
              targetRms,
              maxPeak
            );
            this.sampleBanks[bankKey].set(Number(midiStr), normalized);
          } catch {
            // Ignorar errores de red aislados
          }
        })
      );
    })();

    this.loadingPromises[bankKey] = promise;
    return promise;
  }

  private findClosestBuffer(
    bank: Map<number, AudioBuffer>,
    targetMidi: number
  ): { buffer: AudioBuffer; playbackRate: number } | null {
    if (bank.size === 0) return null;

    let closestMidi = 60;
    let minDiff = Infinity;

    bank.forEach((_, sampleMidi) => {
      const diff = Math.abs(targetMidi - sampleMidi);
      if (diff < minDiff) {
        minDiff = diff;
        closestMidi = sampleMidi;
      }
    });

    const buffer = bank.get(closestMidi);
    if (!buffer) return null;

    const playbackRate = Math.pow(2, (targetMidi - closestMidi) / 12);
    return { buffer, playbackRate };
  }

  public setInstrument(inst: PianoInstrumentId): void {
    const normalizedInst: PianoInstrumentId =
      inst === 'rhodes'
        ? 'vintage_ep'
        : inst === 'electric_piano'
        ? 'fm_ep'
        : inst;

    this.instrument = normalizedInst;

    if (normalizedInst === 'stage_layer') {
      this.loadSampleBank('grand_piano');
      this.loadSampleBank('vintage_ep');
    } else if (
      normalizedInst === 'grand_piano' ||
      normalizedInst === 'bright_piano' ||
      normalizedInst === 'vintage_ep' ||
      normalizedInst === 'fm_ep'
    ) {
      this.loadSampleBank(normalizedInst);
    }
  }

  public getInstrument(): PianoInstrumentId {
    return this.instrument;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this.enabled ? this.volume * 1.2 : 0,
        this.ctx.currentTime,
        0.015
      );
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.allNotesOff();
    }
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this.enabled ? this.volume * 1.2 : 0,
        this.ctx.currentTime,
        0.015
      );
    }
  }

  private spawnBufferedVoice(
    ctx: AudioContext,
    buffer: AudioBuffer,
    playbackRate: number,
    gainLevel: number,
    warmthDb: number,
    brillianceDb: number,
    pan: number
  ): { stop: (immediate?: boolean) => void } {
    const now = ctx.currentTime;
    const dest = this.dryBus || this.compressor!;

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.playbackRate.setValueAtTime(playbackRate, now);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(gainLevel, now + 0.003);
    env.gain.exponentialRampToValueAtTime(gainLevel * 0.65, now + 0.75);
    env.gain.exponentialRampToValueAtTime(0.0005, now + 4.8);

    let lastNode: AudioNode = src;

    if (warmthDb !== 0) {
      const lowShelf = ctx.createBiquadFilter();
      lowShelf.type = 'lowshelf';
      lowShelf.frequency.setValueAtTime(280, now);
      lowShelf.gain.setValueAtTime(warmthDb, now);
      lastNode.connect(lowShelf);
      lastNode = lowShelf;
    }

    if (brillianceDb !== 0) {
      const highShelf = ctx.createBiquadFilter();
      highShelf.type = 'highshelf';
      highShelf.frequency.setValueAtTime(3000, now);
      highShelf.gain.setValueAtTime(brillianceDb, now);
      lastNode.connect(highShelf);
      lastNode = highShelf;
    }

    lastNode.connect(env);

    if (ctx.createStereoPanner && pan !== 0) {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-0.65, Math.min(0.65, pan)), now);
      env.connect(panner);
      panner.connect(dest);
    } else {
      env.connect(dest);
    }

    src.start(now);

    let isStopped = false;
    return {
      stop: (immediate = false) => {
        if (isStopped) return;
        isStopped = true;
        const t = ctx.currentTime;
        const releaseSec = immediate ? 0.025 : 0.22;
        try {
          env.gain.cancelScheduledValues(t);
          env.gain.setValueAtTime(Math.max(0.0001, env.gain.value), t);
          env.gain.exponentialRampToValueAtTime(0.0001, t + releaseSec);
          src.stop(t + releaseSec + 0.02);
        } catch {}
      },
    };
  }

  public noteOn(midiNote: number, velocity: number = 100): void {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.compressor) return;

    this.noteOff(midiNote, true);

    const velNorm = Math.max(0.25, Math.min(1, velocity / 127));
    const baseGain = 0.98 * Math.pow(velNorm, 0.65);
    const stereoPan = ((midiNote - 62) / 36) * 0.35;

    const inst = this.instrument;

    if (inst === 'stage_layer') {
      this.loadSampleBank('grand_piano');
      this.loadSampleBank('vintage_ep');
      const grandMatch = this.findClosestBuffer(
        this.sampleBanks.grand_piano,
        midiNote
      );
      const epMatch = this.findClosestBuffer(
        this.sampleBanks.vintage_ep,
        midiNote
      );

      if (grandMatch && epMatch) {
        const v1 = this.spawnBufferedVoice(
          ctx,
          grandMatch.buffer,
          grandMatch.playbackRate,
          baseGain * 0.72,
          1.2,
          0.5,
          stereoPan - 0.12
        );
        const v2 = this.spawnBufferedVoice(
          ctx,
          epMatch.buffer,
          epMatch.playbackRate,
          baseGain * 0.44,
          1.5,
          1.0,
          stereoPan + 0.12
        );
        this.activeVoices.set(midiNote, {
          stop: (imm) => {
            v1.stop(imm);
            v2.stop(imm);
          },
        });
        return;
      }
    }

    const targetBankKey: BankKey =
      inst === 'bright_piano'
        ? 'bright_piano'
        : inst === 'vintage_ep' || inst === 'rhodes'
        ? 'vintage_ep'
        : inst === 'fm_ep' || inst === 'electric_piano'
        ? 'fm_ep'
        : 'grand_piano';

    this.loadSampleBank(targetBankKey);
    const match =
      this.findClosestBuffer(this.sampleBanks[targetBankKey], midiNote) ||
      this.findClosestBuffer(this.sampleBanks.grand_piano, midiNote) ||
      this.findClosestBuffer(this.sampleBanks.bright_piano, midiNote) ||
      this.findClosestBuffer(this.sampleBanks.vintage_ep, midiNote);

    if (match) {
      // +2 dB extra de ganancia directa (x1.28) para el Grand Piano HD
      const instGainBoost = targetBankKey === 'grand_piano' ? 1.28 : 1.0;

      const warmth =
        targetBankKey === 'grand_piano'
          ? 2.2
          : targetBankKey === 'vintage_ep'
          ? 2.0
          : 0.5;
      const brilliance =
        targetBankKey === 'bright_piano'
          ? 2.5
          : targetBankKey === 'fm_ep'
          ? 2.0
          : targetBankKey === 'grand_piano'
          ? 1.0
          : 0.5;

      const voice = this.spawnBufferedVoice(
        ctx,
        match.buffer,
        match.playbackRate,
        baseGain * instGainBoost,
        warmth,
        brilliance,
        stereoPan
      );
      this.activeVoices.set(midiNote, voice);
    }
  }

  public noteOff(midiNote: number, immediate: boolean = false): void {
    const active = this.activeVoices.get(midiNote);
    if (active) {
      active.stop(immediate);
      this.activeVoices.delete(midiNote);
    }
  }

  public allNotesOff(): void {
    this.activeVoices.forEach((v) => v.stop(true));
    this.activeVoices.clear();
  }

  public playMetronomeClick(isAccent: boolean): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.compressor) return;

    const now = ctx.currentTime;

    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';

    const startFreq = isAccent ? 660 : 470;
    const endFreq = isAccent ? 240 : 180;
    bodyOsc.frequency.setValueAtTime(startFreq, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.024);

    const peak = isAccent ? 0.24 : 0.15;
    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.linearRampToValueAtTime(peak, now + 0.0015);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(this.compressor);

    bodyOsc.start(now);
    bodyOsc.stop(now + 0.032);

    if (this.noiseBuffer) {
      const stickNoise = ctx.createBufferSource();
      stickNoise.buffer = this.noiseBuffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(isAccent ? 1100 : 850, now);
      bandpass.Q.setValueAtTime(2.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(isAccent ? 0.06 : 0.035, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

      stickNoise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(this.compressor);
      stickNoise.start(now);
    }
  }

  public startMetronome(
    bpm: number,
    beatsPerBar: number,
    onBeat?: (beatIndex: number) => void
  ): void {
    this.stopMetronome();
    this.metroBpm = Math.max(30, Math.min(260, bpm));
    this.metroBeatsPerBar = beatsPerBar;
    this.metroBeatCallback = onBeat || null;
    this.metroPlaying = true;
    this.metroCurrentBeat = 0;

    const tick = () => {
      if (!this.metroPlaying) return;
      const isAccent = this.metroCurrentBeat === 0;
      this.playMetronomeClick(isAccent);
      if (this.metroBeatCallback) {
        this.metroBeatCallback(this.metroCurrentBeat);
      }
      this.metroCurrentBeat =
        (this.metroCurrentBeat + 1) % this.metroBeatsPerBar;
      const intervalMs = (60 / this.metroBpm) * 1000;
      this.metroTimerId = window.setTimeout(tick, intervalMs);
    };

    tick();
  }

  public updateMetronomeParams(bpm: number, beatsPerBar: number): void {
    this.metroBpm = Math.max(30, Math.min(260, bpm));
    this.metroBeatsPerBar = beatsPerBar;
  }

  public stopMetronome(): void {
    this.metroPlaying = false;
    if (this.metroTimerId !== null) {
      window.clearTimeout(this.metroTimerId);
      this.metroTimerId = null;
    }
  }
}

export const pianoSynth = new PianoSynthesizerEngine();
