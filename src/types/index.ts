export type Language = 'ES' | 'EN';

export type KeyCount = 25 | 49 | 61 | 76 | 88;

export type NamingConvention = 'standard' | 'solfege'; // standard: C, D, E | solfege: Do, Re, Mi

export type MidiConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'unsupported'
  | 'permission_denied';

export interface MidiDeviceInfo {
  id: string;
  name: string;
  manufacturer: string;
  state: 'connected' | 'disconnected';
  connection: 'open' | 'closed' | 'pending';
}

export interface ParsedMidiEvent {
  type: 'noteon' | 'noteoff' | 'sustain' | 'allnotesoff';
  note?: number;          // 0 - 127
  velocity?: number;      // 1 - 127 (raw MIDI velocity)
  normalizedVelocity?: number; // 0.0 - 1.0
  channel: number;        // 1 - 16
  sustainDown?: boolean;  // CC64 >= 64
  timestamp: number;
}

export interface KeyData {
  midiNote: number;
  pitchNameEn: string; // e.g. "C", "C#", "Db"
  pitchNameEs: string; // e.g. "Do", "Do#", "Reb"
  octave: number;
  isBlack: boolean;
  frequency: number;
  labelEn: string; // e.g. "C4"
  labelEs: string; // e.g. "Do4"
  blackIndex?: number; // 0, 1, 3, 4, 5 for black key spacing
}

export interface IntervalBreakdown {
  fromNote: string;
  toNote: string;
  semitones: number;
  intervalNameEn: string;
  intervalNameEs: string;
  shortName: string;
}

export interface ChordAnalysis {
  chordName: string;
  rootNameEn: string;
  rootNameEs: string;
  typeEn: string;
  typeEs: string;
  notesEn: string[];
  notesEs: string[];
  intervalsFormulaEn: string;
  intervalsFormulaEs: string;
  inversionEn: string;
  inversionEs: string;
  intervalsBreakdown: IntervalBreakdown[];
  degreeEn: string;
  degreeEs: string;
  descriptionEn: string;
  descriptionEs: string;
}

export interface ChordCandidate {
  /** International symbol, e.g., "Cmaj7", "Bm7(b5)", "C°7", "C/E" */
  symbolInternational: string;
  /** Full name in Spanish, e.g., "Do séptima mayor", "Do Mayor (1ª Inversión)" */
  nameEs: string;
  /** Full name in English, e.g., "C Major 7th", "C Major (1st Inversion)" */
  nameEn: string;
  /** Classification in Spanish, e.g., "Séptima mayor", "Tríada mayor", "Semidisminuido" */
  classificationEs: string;
  /** Classification in English, e.g., "Major 7th", "Major triad", "Half-diminished" */
  classificationEn: string;
  /** Root note name in English (with proper enharmonic spelling) */
  rootEn: string;
  /** Root note name in Spanish (with proper enharmonic spelling) */
  rootEs: string;
  /** Bass note name in English */
  bassEn: string;
  /** Bass note name in Spanish */
  bassEs: string;
  /** Bass note with octave, e.g., "Do3 (C3)" */
  bassWithOctaveEs: string;
  bassWithOctaveEn: string;
  /** Ordered chord note names in Spanish (e.g., ["Do", "Mi", "Sol", "Si"]) */
  chordNotesEs: string[];
  /** Ordered chord note names in English (e.g., ["C", "E", "G", "B"]) */
  chordNotesEn: string[];
  /** Intervallic formula string, e.g., "1 – 3 – 5 – 7" */
  formula: string;
  /** Inversion description in Spanish */
  inversionEs: string;
  /** Inversion description in English */
  inversionEn: string;
  /** Degree / Roman numeral representation */
  degreeEs: string;
  degreeEn: string;
  /** Whether optional intervals (like 5th) were omitted */
  omittedIntervals: string[];
  /** Confidence/ranking score */
  score: number;
}

export interface ChordRecognitionResult {
  status: 'empty' | 'insufficient' | 'interval' | 'recognized' | 'unrecognized';
  /** Primary best chord match (null if status !== 'recognized') */
  primary: ChordCandidate | null;
  /** Alternative valid harmonic interpretations */
  alternatives: ChordCandidate[];
  /** All played notes formatted with octave */
  playedNotesWithOctaveEs: string[];
  playedNotesWithOctaveEn: string[];
  /** Unique pitch class names in order from bass */
  pitchClassNamesEs: string[];
  pitchClassNamesEn: string[];
  /** Lowest sounding note (bass) */
  bassNoteEs: string;
  bassNoteEn: string;
  /** Interval breakdown from bass/adjacent notes */
  intervalsBreakdown: IntervalBreakdown[];
  /** Explanatory message when status is 'insufficient', 'interval', or 'unrecognized' */
  messageEs?: string;
  messageEn?: string;
}

export type ScaleId =
  | 'major'
  | 'natural_minor'
  | 'harmonic_minor'
  | 'melodic_minor'
  | 'ionian'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'aeolian'
  | 'locrian'
  | 'pentatonic_major'
  | 'pentatonic_minor'
  | 'blues'
  | 'diminished_wh'
  | 'diminished_hw'
  | 'whole_tone'
  | 'chromatic';

/** Teaching Mode Scale Visualization State */
export type ScaleDisplayMode = 'full' | 'tonic_only' | 'hidden';

/** Degree Visualization Mode */
export type DegreeDisplayMode =
  | 'scale_degrees'      // Grados de escala (1, 2, 3, 4, 5, 6, 7)
  | 'tonic_intervals'    // Intervalos respecto de la tónica (T, 2M, 3M, 4J, 5J, 6M, 7M)
  | 'chromatic_degrees'  // Grados cromáticos (1, b2, 2, b3, 3, 4, #4/b5, 5, b6, 6, b7, 7)
  | 'tonal_functions';   // Funciones tonales de acordes diatónicos (Tónica, Subdominante, Dominante)

export interface ScaleNoteInfo {
  pitchClass: number;
  semitonesFromRoot: number;
  noteEn: string;
  noteEs: string;
  degreeFormula: string;      // e.g., "1", "2", "b3", "#4"
  romanDegree: string;        // e.g., "I", "II", "bIII", "#IV"
  intervalShortEs: string;    // e.g., "T", "2M", "3m", "4A"
  intervalShortEn: string;    // e.g., "R", "M2", "m3", "A4"
  role: 'tonic' | 'mediant_dominant' | 'scale_note' | 'characteristic';
}

export interface DiatonicChordFunction {
  degreeNumber: number;       // 1..7
  romanNumeral: string;       // e.g., "I", "ii", "iii", "IV", "V", "vi", "vii°"
  rootPc: number;
  chordSymbolEn: string;      // e.g., "C", "Dm", "Em", "F", "G", "Am", "Bdim"
  chordSymbolEs: string;      // e.g., "Do", "Rem", "Mim", "Fa", "Sol", "Lam", "Sidim"
  chordNotesEs: string[];
  chordNotesEn: string[];
  midiVoicing: number[];      // Sample playable MIDI voicing around octave 4
  tonalFunctionEs: 'Tónica' | 'Subdominante' | 'Dominante';
  tonalFunctionEn: 'Tonic' | 'Subdominant' | 'Dominant';
  functionCode: 'T' | 'SD' | 'D';
  roleDescriptionEs: string;
  roleDescriptionEn: string;
}

export interface ScaleAnalysisResult {
  scaleId: ScaleId;
  rootPc: number;
  rootNameEn: string;
  rootNameEs: string;
  scaleNameEs: string;
  scaleNameEn: string;
  stepFormulaEs: string;      // e.g., "T – T – S – T – T – T – S"
  stepFormulaEn: string;      // e.g., "W – W – H – W – W – W – H"
  intervalFormula: string;    // e.g., "1 – 2 – 3 – 4 – 5 – 6 – 7"
  notes: ScaleNoteInfo[];
  pitchClassMap: Map<number, ScaleNoteInfo>;
  diatonicChords: DiatonicChordFunction[];
}

export interface TwoNoteIntervalAnalysis {
  lowMidi: number;
  highMidi: number;
  firstMidi: number;
  secondMidi: number;
  semitones: number;
  octaves: number;
  simpleSemitones: number;
  direction: 'ascending' | 'descending' | 'harmonic';
  directionLabelEs: string;
  directionLabelEn: string;
  /** Written note names based on current tonal/enharmonic context */
  fromNoteEs: string;
  toNoteEs: string;
  fromNoteEn: string;
  toNoteEn: string;
  /** Primary interval name according to musical spelling */
  intervalNameEs: string;
  intervalNameEn: string;
  shortNameEs: string;
  shortNameEn: string;
  /** Diatonic distance (e.g., "3ª diatónica (Grado I → III)") when determinable */
  diatonicDistanceEs: string;
  diatonicDistanceEn: string;
  /** Enharmonic equivalent distinction (e.g., "4ª Aumentada (Do–Fa#) vs 5ª Disminuida (Do–Solb)") */
  enharmonicAltEs: string | null;
  enharmonicAltEn: string | null;
}

export interface ViewSettings {
  language: Language;
  keyCount: KeyCount;
  showNoteNames: boolean;
  namingConvention: NamingConvention;
  showDegrees: boolean;
  showIntervals: boolean;
  octaveShift: number; // -2 to +2
  transpose: number; // -12 to +12
  audioEnabled: boolean;
  teacherMode: boolean;
}


