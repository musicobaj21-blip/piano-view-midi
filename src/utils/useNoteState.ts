import { useState, useCallback, useEffect, useRef } from 'react';
import { pianoSynth } from './audioEngine';

export interface NoteOrderEntry {
  midiNote: number;
  timestamp: number;
}

export interface UseNoteStateReturn {
  /** Notes currently physically pressed (virtual key or physical MIDI key) */
  activeNotes: Set<number>;
  /** Notes released physically but held sounding by Sustain Pedal (CC64) */
  sustainedNotes: Set<number>;
  /** Chronological order of currently active/sustained notes with timestamps */
  noteOrder: NoteOrderEntry[];
  /** Whether Sustain Pedal (CC64) is currently depressed */
  sustainActive: boolean;
  /** Most recent MIDI velocity (1-127) */
  lastVelocity: number | null;
  /** Trigger Note On (accepts velocity 0..1 normalized OR 1..127 MIDI velocity) */
  noteOn: (midiNote: number, velocity?: number) => void;
  /** Trigger Note Off */
  noteOff: (midiNote: number) => void;
  /** Update Sustain Pedal CC64 state */
  setSustainPedal: (isDown: boolean) => void;
  /** Panic / Release all physically pressed and sustained notes immediately */
  allNotesOff: () => void;
  /** Helper to check if a note is physically pressed */
  isNoteActive: (midiNote: number) => boolean;
}

/**
 * Centralized Note State Engine
 * Single source of truth for both the virtual keyboard and physical MIDI controllers.
 * Strictly separates physically pressed keys (`activeNotes`) from pedal-sustained notes (`sustainedNotes`),
 * ensuring CC64 sustain never corrupts the visual state of physically pressed keys.
 */
export function useNoteState(audioEnabled: boolean, octaveShift: number = 0): UseNoteStateReturn {
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const [sustainedNotes, setSustainedNotes] = useState<Set<number>>(new Set());
  const [noteOrder, setNoteOrder] = useState<NoteOrderEntry[]>([]);
  const [sustainActive, setSustainActive] = useState<boolean>(false);
  const [lastVelocity, setLastVelocity] = useState<number | null>(null);

  // Refs for synchronous access inside high-frequency MIDI & pointer callbacks
  const pressedNotesRef = useRef<Set<number>>(new Set());
  const sustainedNotesRef = useRef<Set<number>>(new Set());
  const noteOrderRef = useRef<NoteOrderEntry[]>([]);
  const sustainActiveRef = useRef<boolean>(false);
  const octaveShiftRef = useRef<number>(octaveShift);
  const audioEnabledRef = useRef<boolean>(audioEnabled);

  useEffect(() => {
    octaveShiftRef.current = octaveShift;
  }, [octaveShift]);

  useEffect(() => {
    audioEnabledRef.current = audioEnabled;
    if (!audioEnabled) {
      pianoSynth.allNotesOff();
    }
  }, [audioEnabled]);

  /**
   * Central Note On
   * Supports both normalized velocity (0.01 - 1.0) and MIDI velocity (1 - 127).
   */
  const noteOn = useCallback((midiNote: number, velocity: number = 100) => {
    const validMidi = Math.max(0, Math.min(127, Math.round(midiNote)));
    const now = performance.now();

    // Normalize velocity: if > 1, treat as MIDI 1..127; if <= 1, treat as 0..1 normalized
    const isRawMidiVelocity = velocity > 1;
    const midiVel127 = isRawMidiVelocity
      ? Math.max(1, Math.min(127, Math.round(velocity)))
      : Math.max(1, Math.min(127, Math.round(velocity * 127)));
    const normalizedVel = midiVel127 / 127;

    setLastVelocity(midiVel127);

    // Add to physically pressed notes
    pressedNotesRef.current.add(validMidi);
    setActiveNotes(new Set(pressedNotesRef.current));

    // Record chronological order
    noteOrderRef.current = [
      ...noteOrderRef.current.filter((e) => e.midiNote !== validMidi),
      { midiNote: validMidi, timestamp: now },
    ];
    setNoteOrder([...noteOrderRef.current]);

    // If this note was previously in sustainedNotes, remove it from sustained Set
    // since it is now physically pressed again
    if (sustainedNotesRef.current.has(validMidi)) {
      sustainedNotesRef.current.delete(validMidi);
      setSustainedNotes(new Set(sustainedNotesRef.current));
    }

    if (audioEnabledRef.current) {
      pianoSynth.noteOn(validMidi, normalizedVel);
    }
  }, []);

  /**
   * Central Note Off
   * Immediately updates physically pressed state (`activeNotes`).
   * If Sustain Pedal (CC64) is active, transfers the note to `sustainedNotes`
   * without cutting the audio voice until the pedal is released.
   */
  const noteOff = useCallback((midiNote: number) => {
    const validMidi = Math.max(0, Math.min(127, Math.round(midiNote)));

    if (pressedNotesRef.current.has(validMidi)) {
      pressedNotesRef.current.delete(validMidi);
      setActiveNotes(new Set(pressedNotesRef.current));
    }

    if (sustainActiveRef.current) {
      // Pedal is down: keep audio ringing and record in sustainedNotes
      sustainedNotesRef.current.add(validMidi);
      setSustainedNotes(new Set(sustainedNotesRef.current));
    } else {
      // Pedal is up: stop audio voice immediately
      if (sustainedNotesRef.current.has(validMidi)) {
        sustainedNotesRef.current.delete(validMidi);
        setSustainedNotes(new Set(sustainedNotesRef.current));
      }
      noteOrderRef.current = noteOrderRef.current.filter((e) => e.midiNote !== validMidi);
      setNoteOrder([...noteOrderRef.current]);
      pianoSynth.noteOff(validMidi);
    }
  }, []);

  /**
   * Sustain Pedal (CC64) Handler
   * When released (isDown = false), dampens all sustained notes that are not physically pressed.
   */
  const setSustainPedal = useCallback((isDown: boolean) => {
    sustainActiveRef.current = isDown;
    setSustainActive(isDown);

    if (!isDown && sustainedNotesRef.current.size > 0) {
      sustainedNotesRef.current.forEach((note) => {
        // Only stop audio if the key is not currently physically held down
        if (!pressedNotesRef.current.has(note)) {
          pianoSynth.noteOff(note);
        }
      });
      sustainedNotesRef.current.clear();
      setSustainedNotes(new Set());
      noteOrderRef.current = noteOrderRef.current.filter((e) =>
        pressedNotesRef.current.has(e.midiNote)
      );
      setNoteOrder([...noteOrderRef.current]);
    }
  }, []);

  /**
   * Central All Notes Off (LIBERAR NOTAS / Panic / Blur)
   * Releases all physically pressed notes, sustained notes, pedal state, and audio voices.
   */
  const allNotesOff = useCallback(() => {
    pressedNotesRef.current.clear();
    sustainedNotesRef.current.clear();
    noteOrderRef.current = [];
    sustainActiveRef.current = false;

    setActiveNotes(new Set());
    setSustainedNotes(new Set());
    setNoteOrder([]);
    setSustainActive(false);
    pianoSynth.allNotesOff();
  }, []);

  const isNoteActive = useCallback((midiNote: number) => {
    return activeNotes.has(midiNote);
  }, [activeNotes]);

  // Global Window Listeners to prevent stuck notes on window blur or tab switch
  useEffect(() => {
    const handleGlobalBlur = () => {
      allNotesOff();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        allNotesOff();
      }
    };

    window.addEventListener('blur', handleGlobalBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', handleGlobalBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [allNotesOff]);

  return {
    activeNotes,
    sustainedNotes,
    noteOrder,
    sustainActive,
    lastVelocity,
    noteOn,
    noteOff,
    setSustainPedal,
    allNotesOff,
    isNoteActive,
  };
}

