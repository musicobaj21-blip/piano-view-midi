import {
  DiatonicChordFunction,
  ScaleAnalysisResult,
  ScaleId,
  ScaleNoteInfo,
  TwoNoteIntervalAnalysis,
} from '../types';
import { NoteOrderEntry } from './useNoteState';

// Base natural notes (diatonic letters 0..6)
const NATURAL_PCS = [0, 2, 4, 5, 7, 9, 11];
const NATURAL_EN = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NATURAL_ES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];

// Default root spellings for the 12 pitch classes
export const ROOT_OPTIONS: {
  pc: number;
  labelEs: string;
  labelEn: string;
  letterIndex: number;
  preferFlats: boolean;
}[] = [
  { pc: 0, labelEs: 'Do', labelEn: 'C', letterIndex: 0, preferFlats: false },
  { pc: 1, labelEs: 'Do# / Reb', labelEn: 'C# / Db', letterIndex: 1, preferFlats: true },
  { pc: 2, labelEs: 'Re', labelEn: 'D', letterIndex: 1, preferFlats: false },
  { pc: 3, labelEs: 'Mib / Re#', labelEn: 'Eb / D#', letterIndex: 2, preferFlats: true },
  { pc: 4, labelEs: 'Mi', labelEn: 'E', letterIndex: 2, preferFlats: false },
  { pc: 5, labelEs: 'Fa', labelEn: 'F', letterIndex: 3, preferFlats: true },
  { pc: 6, labelEs: 'Fa# / Solb', labelEn: 'F# / Gb', letterIndex: 3, preferFlats: false },
  { pc: 7, labelEs: 'Sol', labelEn: 'G', letterIndex: 4, preferFlats: false },
  { pc: 8, labelEs: 'Lab / Sol#', labelEn: 'Ab / G#', letterIndex: 5, preferFlats: true },
  { pc: 9, labelEs: 'La', labelEn: 'A', letterIndex: 5, preferFlats: false },
  { pc: 10, labelEs: 'Sib / La#', labelEn: 'Bb / A#', letterIndex: 6, preferFlats: true },
  { pc: 11, labelEs: 'Si', labelEn: 'B', letterIndex: 6, preferFlats: false },
];

export interface ScaleDefinition {
  id: ScaleId;
  nameEs: string;
  nameEn: string;
  stepFormulaEs: string;
  stepFormulaEn: string;
  semitones: number[];
  degreeTokens: string[];
  romanTokens: string[];
  /** Diatonic letter offset (0..6) for each note relative to root's letter */
  letterOffsets: number[];
  /** Characteristic degree indices (0-based) for pedagogical highlighting */
  characteristicIndices: number[];
}

export const SCALE_CATALOG: ScaleDefinition[] = [
  {
    id: 'major',
    nameEs: 'Mayor',
    nameEn: 'Major',
    stepFormulaEs: 'T – T – S – T – T – T – S',
    stepFormulaEn: 'W – W – H – W – W – W – H',
    semitones: [0, 2, 4, 5, 7, 9, 11],
    degreeTokens: ['1', '2', '3', '4', '5', '6', '7'],
    romanTokens: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'],
    letterOffsets: [0, 1, 2, 3, 4, 5, 6],
    characteristicIndices: [2, 6],
  },
  {
    id: 'natural_minor',
    nameEs: 'Menor natural',
    nameEn: 'Natural Minor',
    stepFormulaEs: 'T – S – T – T – S – T – T',
    stepFormulaEn: 'W – H – W – W – H – W – W',
    semitones: [0, 2, 3, 5, 7, 8, 10],
    degreeTokens: ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
    romanTokens: ['I', 'II', 'bIII', 'IV', 'V', 'bVI', 'bVII'],
    letterOffsets: [0, 1, 2, 3, 4, 5, 6],
    characteristicIndices: [2, 5, 6],
  },
  {
    id: 'harmonic_minor',
    nameEs: 'Menor armónica',
    nameEn: 'Harmonic Minor',
    stepFormulaEs: 'T – S – T – T – S – 1½T – S',
    stepFormulaEn: 'W – H – W – W – H – 1½W – H',
    semitones: [0, 2, 3, 5, 7, 8, 11],
    degreeTokens: ['1', '2', 'b3', '4', '5', 'b6', '7'],
    romanTokens: ['I', 'II', 'bIII', 'IV', 'V', 'bVI', 'VII'],
    letterOffsets: [0, 1, 2, 3, 4, 5, 6],
    characteristicIndices: [5, 6],
  },
  {
    id: 'melodic_minor',
    nameEs: 'Menor melódica',
    nameEn: 'Melodic Minor',
    stepFormulaEs: 'T – S – T – T – T – T – S',
    stepFormulaEn: 'W – H – W – W – W – W – H',
    semitones: [0, 2, 3, 5, 7, 9, 11],
    degreeTokens: ['1', '2', 'b3', '4', '5', '6', '7'],
    romanTokens: ['I', 'II', 'bIII', 'IV', 'V', 'VI', 'VII'],
    letterOffsets: [0, 1, 2, 3, 4, 5, 6],
    characteristicIndices: [2, 5, 6],
  },
  {
    id: 'ionian',
    nameEs: 'Modo Jónico',
    nameEn: 'Ionian Mode',
    stepFormulaEs: 'T – T – S – T – T – T – S',
    stepFormulaEn: 'W – W – H – W – W – W – H',
    semitones: [0, 2, 4, 5, 7, 9, 11],
    degreeTokens: ['1', '2', '3', '4', '5', '6', '7'],
    romanTokens: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'],
    letterOffsets: [0, 1, 2, 3, 4, 5, 6],
    characteristicIndices: [3, 6],
  },
  {
    id: 'dorian',
    nameEs: 'Modo Dórico',
    nameEn: 'Dorian Mode',
    stepFormulaEs: 'T – S – T – T – T – S – T',
    stepFormulaEn: 'W – H – W – W – W – H – W',
    semitones: [0, 2, 3, 5, 7, 9, 10],
    degreeTokens: ['1', '2', 'b3', '4', '5', '6', 'b7'],
    romanTokens: ['I', 'II', 'bIII', 'IV', 'V', 'VI', 'bVII'],
    letterOffsets: [0, 1, 2, 3, 4, 5, 6],
    characteristicIndices: [5], // 6M characteristic note of Dorian
  },
  {
    id: 'phrygian',
    nameEs: 'Modo Frigio',
    nameEn: 'Phrygian Mode',
    stepFormulaEs: 'S – T – T – T – S – T – T',
    stepFormulaEn: 'H – W – W – W – H – W – W',
    semitones: [0, 1, 3, 5, 7, 8, 10],
    degreeTokens: ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'],
    romanTokens: ['I', 'bII', 'bIII', 'IV', 'V', 'bVI', 'bVII'],
    letterOffsets: [0, 1, 2, 3, 4, 5, 6],
    characteristicIndices: [1], // b2 characteristic note of Phrygian
  },
  {
    id: 'lydian',
    nameEs: 'Modo Lidio',
    nameEn: 'Lydian Mode',
    stepFormulaEs: 'T – T – T – S – T – T – S',
    stepFormulaEn: 'W – W – W – H – W – W – H',
    semitones: [0, 2, 4, 6, 7, 9, 11],
    degreeTokens: ['1', '2', '3', '#4', '5', '6', '7'],
    romanTokens: ['I', 'II', 'III', '#IV', 'V', 'VI', 'VII'],
    letterOffsets: [0, 1, 2, 3, 4, 5, 6],
    characteristicIndices: [3], // #4 characteristic note of Lydian
  },
  {
    id: 'mixolydian',
    nameEs: 'Modo Mixolidio',
    nameEn: 'Mixolydian Mode',
    stepFormulaEs: 'T – T – S – T – T – S – T',
    stepFormulaEn: 'W – W – H – W – W – H – W',
    semitones: [0, 2, 4, 5, 7, 9, 10],
    degreeTokens: ['1', '2', '3', '4', '5', '6', 'b7'],
    romanTokens: ['I', 'II', 'III', 'IV', 'V', 'VI', 'bVII'],
    letterOffsets: [0, 1, 2, 3, 4, 5, 6],
    characteristicIndices: [6], // b7 characteristic note of Mixolydian
  },
  {
    id: 'aeolian',
    nameEs: 'Modo Eólico',
    nameEn: 'Aeolian Mode',
    stepFormulaEs: 'T – S – T – T – S – T – T',
    stepFormulaEn: 'W – H – W – W – H – W – W',
    semitones: [0, 2, 3, 5, 7, 8, 10],
    degreeTokens: ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
    romanTokens: ['I', 'II', 'bIII', 'IV', 'V', 'bVI', 'bVII'],
    letterOffsets: [0, 1, 2, 3, 4, 5, 6],
    characteristicIndices: [5],
  },
  {
    id: 'locrian',
    nameEs: 'Modo Locrio',
    nameEn: 'Locrian Mode',
    stepFormulaEs: 'S – T – T – S – T – T – T',
    stepFormulaEn: 'H – W – W – H – W – W – W',
    semitones: [0, 1, 3, 5, 6, 8, 10],
    degreeTokens: ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'],
    romanTokens: ['I', 'bII', 'bIII', 'IV', 'bV', 'bVI', 'bVII'],
    letterOffsets: [0, 1, 2, 3, 4, 5, 6],
    characteristicIndices: [1, 4], // b2 and b5
  },
  {
    id: 'pentatonic_major',
    nameEs: 'Pentatónica mayor',
    nameEn: 'Major Pentatonic',
    stepFormulaEs: 'T – T – 1½T – T – 1½T',
    stepFormulaEn: 'W – W – 1½W – W – 1½W',
    semitones: [0, 2, 4, 7, 9],
    degreeTokens: ['1', '2', '3', '5', '6'],
    romanTokens: ['I', 'II', 'III', 'V', 'VI'],
    letterOffsets: [0, 1, 2, 4, 5],
    characteristicIndices: [2, 4],
  },
  {
    id: 'pentatonic_minor',
    nameEs: 'Pentatónica menor',
    nameEn: 'Minor Pentatonic',
    stepFormulaEs: '1½T – T – T – 1½T – T',
    stepFormulaEn: '1½W – W – W – 1½W – W',
    semitones: [0, 3, 5, 7, 10],
    degreeTokens: ['1', 'b3', '4', '5', 'b7'],
    romanTokens: ['I', 'bIII', 'IV', 'V', 'bVII'],
    letterOffsets: [0, 2, 3, 4, 6],
    characteristicIndices: [1, 4],
  },
  {
    id: 'blues',
    nameEs: 'Blues',
    nameEn: 'Blues Scale',
    stepFormulaEs: '1½T – T – S – S – 1½T – T',
    stepFormulaEn: '1½W – W – H – H – 1½W – W',
    semitones: [0, 3, 5, 6, 7, 10],
    degreeTokens: ['1', 'b3', '4', 'b5', '5', 'b7'],
    romanTokens: ['I', 'bIII', 'IV', 'bV', 'V', 'bVII'],
    letterOffsets: [0, 2, 3, 4, 4, 6],
    characteristicIndices: [3], // Blue note b5
  },
  {
    id: 'diminished_wh',
    nameEs: 'Disminuida tono-semitono',
    nameEn: 'Diminished (Whole-Half)',
    stepFormulaEs: 'T – S – T – S – T – S – T – S',
    stepFormulaEn: 'W – H – W – H – W – H – W – H',
    semitones: [0, 2, 3, 5, 6, 8, 9, 11],
    degreeTokens: ['1', '2', 'b3', '4', 'b5', 'b6', '6', '7'],
    romanTokens: ['I', 'II', 'bIII', 'IV', 'bV', 'bVI', 'VI', 'VII'],
    letterOffsets: [0, 1, 2, 3, 4, 5, 5, 6],
    characteristicIndices: [4, 6],
  },
  {
    id: 'diminished_hw',
    nameEs: 'Disminuida semitono-tono',
    nameEn: 'Diminished (Half-Whole)',
    stepFormulaEs: 'S – T – S – T – S – T – S – T',
    stepFormulaEn: 'H – W – H – W – H – W – H – W',
    semitones: [0, 1, 3, 4, 6, 7, 9, 10],
    degreeTokens: ['1', 'b2', '#2', '3', '#4', '5', '6', 'b7'],
    romanTokens: ['I', 'bII', '#II', 'III', '#IV', 'V', 'VI', 'bVII'],
    letterOffsets: [0, 1, 1, 2, 3, 4, 5, 6],
    characteristicIndices: [1, 2, 4],
  },
  {
    id: 'whole_tone',
    nameEs: 'Tonos enteros',
    nameEn: 'Whole Tone',
    stepFormulaEs: 'T – T – T – T – T – T',
    stepFormulaEn: 'W – W – W – W – W – W',
    semitones: [0, 2, 4, 6, 8, 10],
    degreeTokens: ['1', '2', '3', '#4', '#5', 'b7'],
    romanTokens: ['I', 'II', 'III', '#IV', '#V', 'bVII'],
    letterOffsets: [0, 1, 2, 3, 4, 6],
    characteristicIndices: [3, 4],
  },
  {
    id: 'chromatic',
    nameEs: 'Cromática',
    nameEn: 'Chromatic',
    stepFormulaEs: 'S × 12 (12 semitonos)',
    stepFormulaEn: 'H × 12 (12 semitones)',
    semitones: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    degreeTokens: ['1', 'b2', '2', 'b3', '3', '4', '#4/b5', '5', 'b6', '6', 'b7', '7'],
    romanTokens: ['I', 'bII', 'II', 'bIII', 'III', 'IV', '#IV/bV', 'V', 'bVI', 'VI', 'bVII', 'VII'],
    letterOffsets: [0, 1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 6],
    characteristicIndices: [],
  },
];

// Chromatic intervals from tonic (0..11)
export const CHROMATIC_INTERVAL_SHORT_ES = [
  'T', '2m', '2M', '3m', '3M', '4J', '4A/5d', '5J', '6m', '6M', '7m', '7M',
];
export const CHROMATIC_INTERVAL_SHORT_EN = [
  'R', 'm2', 'M2', 'm3', 'M3', 'P4', 'A4/d5', 'P5', 'm6', 'M6', 'm7', 'M7',
];
export const CHROMATIC_DEGREE_LABELS = [
  '1', 'b2', '2', 'b3', '3', '4', '#4/b5', '5', 'b6', '6', 'b7', '7',
];

const SHARP_NOTES_EN = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NOTES_EN  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const SHARP_NOTES_ES = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
const FLAT_NOTES_ES  = ['Do', 'Reb', 'Re', 'Mib', 'Mi', 'Fa', 'Solb', 'Sol', 'Lab', 'La', 'Sib', 'Si'];

/**
 * Spells a note given a target pitch class (0-11) and a desired diatonic letter index (0-6)
 */
function spellNoteByLetter(
  targetPc: number,
  letterIndex: number,
  fallbackFlats: boolean
): { en: string; es: string } {
  const normLetter = ((letterIndex % 7) + 7) % 7;
  const naturalPc = NATURAL_PCS[normLetter];
  const baseEn = NATURAL_EN[normLetter];
  const baseEs = NATURAL_ES[normLetter];

  // Signed shortest semitone difference (-6 to +6)
  let diff = (targetPc - naturalPc + 12) % 12;
  if (diff > 6) diff -= 12;

  if (diff === 0) return { en: baseEn, es: baseEs };
  if (diff === 1) return { en: `${baseEn}#`, es: `${baseEs}#` };
  if (diff === -1) return { en: `${baseEn}b`, es: `${baseEs}b` };
  if (diff === 2) return { en: `${baseEn}x`, es: `${baseEs}x` };
  if (diff === -2) return { en: `${baseEn}bb`, es: `${baseEs}bb` };

  // Fallback for chromatic/octatonic scales where multiple notes share a letter
  return fallbackFlats
    ? { en: FLAT_NOTES_EN[targetPc], es: FLAT_NOTES_ES[targetPc] }
    : { en: SHARP_NOTES_EN[targetPc], es: SHARP_NOTES_ES[targetPc] };
}

/**
 * Determines root letter index (0..6) and flat preference based on root Pc and scale quality
 */
function resolveRootSpelling(
  rootPc: number,
  scaleId: ScaleId
): { rootLetter: number; preferFlats: boolean; rootEn: string; rootEs: string } {
  const isMinorFamily = [
    'natural_minor',
    'harmonic_minor',
    'melodic_minor',
    'dorian',
    'phrygian',
    'aeolian',
    'locrian',
    'pentatonic_minor',
    'blues',
  ].includes(scaleId);

  switch (rootPc) {
    case 0:
      return { rootLetter: 0, preferFlats: isMinorFamily, rootEn: 'C', rootEs: 'Do' };
    case 1:
      return isMinorFamily
        ? { rootLetter: 0, preferFlats: false, rootEn: 'C#', rootEs: 'Do#' }
        : { rootLetter: 1, preferFlats: true, rootEn: 'Db', rootEs: 'Reb' };
    case 2:
      return { rootLetter: 1, preferFlats: isMinorFamily, rootEn: 'D', rootEs: 'Re' };
    case 3:
      return { rootLetter: 2, preferFlats: true, rootEn: 'Eb', rootEs: 'Mib' };
    case 4:
      return { rootLetter: 2, preferFlats: false, rootEn: 'E', rootEs: 'Mi' };
    case 5:
      return { rootLetter: 3, preferFlats: true, rootEn: 'F', rootEs: 'Fa' };
    case 6:
      return { rootLetter: 3, preferFlats: false, rootEn: 'F#', rootEs: 'Fa#' };
    case 7:
      return {
        rootLetter: 4,
        preferFlats: isMinorFamily || scaleId === 'mixolydian',
        rootEn: 'G',
        rootEs: 'Sol',
      };
    case 8:
      return isMinorFamily
        ? { rootLetter: 4, preferFlats: false, rootEn: 'G#', rootEs: 'Sol#' }
        : { rootLetter: 5, preferFlats: true, rootEn: 'Ab', rootEs: 'Lab' };
    case 9:
      return { rootLetter: 5, preferFlats: false, rootEn: 'A', rootEs: 'La' };
    case 10:
      return { rootLetter: 6, preferFlats: true, rootEn: 'Bb', rootEs: 'Sib' };
    case 11:
    default:
      return { rootLetter: 6, preferFlats: false, rootEn: 'B', rootEs: 'Si' };
  }
}

export class ScaleAndHarmonyEngine {
  /**
   * Builds full scale analysis, note spellings, degree tags, and diatonic harmonic field
   */
  public static analyzeScale(rootPc: number, scaleId: ScaleId): ScaleAnalysisResult {
    const normRoot = ((rootPc % 12) + 12) % 12;
    const def = SCALE_CATALOG.find((s) => s.id === scaleId) || SCALE_CATALOG[0];
    const { rootLetter, preferFlats, rootEn, rootEs } = resolveRootSpelling(normRoot, scaleId);

    const notes: ScaleNoteInfo[] = [];
    const pitchClassMap = new Map<number, ScaleNoteInfo>();

    const isHeptatonic = def.semitones.length === 7;

    def.semitones.forEach((semi, idx) => {
      const pc = (normRoot + semi) % 12;
      const degToken = def.degreeTokens[idx] || `${idx + 1}`;
      const romToken = def.romanTokens[idx] || `${idx + 1}`;
      const targetLetter = (rootLetter + (def.letterOffsets[idx] ?? idx)) % 7;

      let spelled: { en: string; es: string };
      if (idx === 0) {
        spelled = { en: rootEn, es: rootEs };
      } else if (isHeptatonic || def.id.startsWith('pentatonic')) {
        spelled = spellNoteByLetter(pc, targetLetter, preferFlats || degToken.startsWith('b'));
      } else {
        const useFlat = degToken.startsWith('b') || (preferFlats && !degToken.startsWith('#'));
        spelled = {
          en: useFlat ? FLAT_NOTES_EN[pc] : SHARP_NOTES_EN[pc],
          es: useFlat ? FLAT_NOTES_ES[pc] : SHARP_NOTES_ES[pc],
        };
      }

      // Interval short label
      let intShortEs = CHROMATIC_INTERVAL_SHORT_ES[semi];
      let intShortEn = CHROMATIC_INTERVAL_SHORT_EN[semi];
      if (semi === 6) {
        if (degToken.includes('#4')) {
          intShortEs = '4A';
          intShortEn = 'A4';
        } else {
          intShortEs = '5d';
          intShortEn = 'd5';
        }
      }

      let role: ScaleNoteInfo['role'] = 'scale_note';
      if (idx === 0) {
        role = 'tonic';
      } else if (def.characteristicIndices.includes(idx)) {
        role = 'characteristic';
      } else if (semi === 3 || semi === 4 || semi === 7) {
        role = 'mediant_dominant';
      }

      const info: ScaleNoteInfo = {
        pitchClass: pc,
        semitonesFromRoot: semi,
        noteEn: spelled.en,
        noteEs: spelled.es,
        degreeFormula: degToken,
        romanDegree: romToken,
        intervalShortEs: intShortEs,
        intervalShortEn: intShortEn,
        role,
      };

      notes.push(info);
      pitchClassMap.set(pc, info);
    });

    // Generate Diatonic Harmonic Field (Tonal Functions vs Scale Degrees)
    const diatonicChords = this.buildDiatonicHarmonicField(normRoot, scaleId, notes);

    return {
      scaleId: def.id,
      rootPc: normRoot,
      rootNameEn: rootEn,
      rootNameEs: rootEs,
      scaleNameEs: `${rootEs} ${def.nameEs}`,
      scaleNameEn: `${rootEn} ${def.nameEn}`,
      stepFormulaEs: def.stepFormulaEs,
      stepFormulaEn: def.stepFormulaEn,
      intervalFormula: def.degreeTokens.join(' – '),
      notes,
      pitchClassMap,
      diatonicChords,
    };
  }

  /**
   * Builds the 7 Diatonic Triads and their Tonal Functions (Tónica, Subdominante, Dominante)
   * Explicitly distinguishes Harmonic Function from Melodic Scale Degree.
   */
  private static buildDiatonicHarmonicField(
    rootPc: number,
    scaleId: ScaleId,
    scaleNotes: ScaleNoteInfo[]
  ): DiatonicChordFunction[] {
    // Use the 7-note scale if heptatonic; otherwise derive from Major or Natural Minor of rootPc
    let sevenNotes = scaleNotes;
    if (scaleNotes.length !== 7) {
      const isMinorLike = ['pentatonic_minor', 'blues'].includes(scaleId);
      const fallback = this.analyzeScale(rootPc, isMinorLike ? 'natural_minor' : 'major');
      sevenNotes = fallback.notes;
    }

    const chords: DiatonicChordFunction[] = [];

    for (let i = 0; i < 7; i++) {
      const n1 = sevenNotes[i];
      const n3 = sevenNotes[(i + 2) % 7];
      const n5 = sevenNotes[(i + 4) % 7];

      const int3 = (n3.pitchClass - n1.pitchClass + 12) % 12;
      const int5 = (n5.pitchClass - n1.pitchClass + 12) % 12;

      let suffixEn = '';
      let suffixEs = '';
      let romanBase = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][i];

      // Add accidental prefix to Roman numeral if lowered/raised relative to major scale
      const majorSemitones = [0, 2, 4, 5, 7, 9, 11];
      const diffFromMajor = n1.semitonesFromRoot - majorSemitones[i];
      const prefix = diffFromMajor === -1 ? 'b' : diffFromMajor === 1 ? '#' : '';

      if (int3 === 4 && int5 === 7) {
        // Major triad
        romanBase = `${prefix}${romanBase}`;
        suffixEn = '';
        suffixEs = '';
      } else if (int3 === 3 && int5 === 7) {
        // Minor triad
        romanBase = `${prefix}${romanBase.toLowerCase()}`;
        suffixEn = 'm';
        suffixEs = 'm';
      } else if (int3 === 3 && int5 === 6) {
        // Diminished triad
        romanBase = `${prefix}${romanBase.toLowerCase()}°`;
        suffixEn = 'dim';
        suffixEs = 'dim';
      } else if (int3 === 4 && int5 === 8) {
        // Augmented triad
        romanBase = `${prefix}${romanBase}+`;
        suffixEn = 'aug';
        suffixEs = 'aum';
      }

      // Assign Tonal Function (Tónica, Subdominante, Dominante)
      // Degree 1 (I/i), Degree 3 (iii/bIII), Degree 6 (vi/bVI) -> Tónica family
      // Degree 2 (ii/ii°), Degree 4 (IV/iv) -> Subdominante family
      // Degree 5 (V/v), Degree 7 (vii°/bVII) -> Dominante family
      let tonalFunctionEs: DiatonicChordFunction['tonalFunctionEs'] = 'Tónica';
      let tonalFunctionEn: DiatonicChordFunction['tonalFunctionEn'] = 'Tonic';
      let functionCode: DiatonicChordFunction['functionCode'] = 'T';
      let roleDescriptionEs = 'Reposo / Centro tonal';
      let roleDescriptionEn = 'Rest / Tonal center';

      if (i === 0) {
        tonalFunctionEs = 'Tónica';
        tonalFunctionEn = 'Tonic';
        functionCode = 'T';
        roleDescriptionEs = 'Tónica principal (Reposo)';
        roleDescriptionEn = 'Primary Tonic (Rest)';
      } else if (i === 1) {
        tonalFunctionEs = 'Subdominante';
        tonalFunctionEn = 'Subdominant';
        functionCode = 'SD';
        roleDescriptionEs = 'Supertónica (Subdominante relativo)';
        roleDescriptionEn = 'Supertonic (Relative Subdominant)';
      } else if (i === 2) {
        tonalFunctionEs = 'Tónica';
        tonalFunctionEn = 'Tonic';
        functionCode = 'T';
        roleDescriptionEs = 'Mediante (Prolongación de Tónica)';
        roleDescriptionEn = 'Mediant (Tonic prolongation)';
      } else if (i === 3) {
        tonalFunctionEs = 'Subdominante';
        tonalFunctionEn = 'Subdominant';
        functionCode = 'SD';
        roleDescriptionEs = 'Subdominante principal (Alejamiento medio)';
        roleDescriptionEn = 'Primary Subdominant (Moderate tension)';
      } else if (i === 4) {
        tonalFunctionEs = 'Dominante';
        tonalFunctionEn = 'Dominant';
        functionCode = 'D';
        roleDescriptionEs = 'Dominante principal (Tensión hacia la Tónica)';
        roleDescriptionEn = 'Primary Dominant (Tension resolving to Tonic)';
      } else if (i === 5) {
        tonalFunctionEs = 'Tónica';
        tonalFunctionEn = 'Tonic';
        functionCode = 'T';
        roleDescriptionEs = 'Submediante (Tónica relativa)';
        roleDescriptionEn = 'Submediant (Relative Tonic)';
      } else if (i === 6) {
        tonalFunctionEs = 'Dominante';
        tonalFunctionEn = 'Dominant';
        functionCode = 'D';
        roleDescriptionEs = 'Sensible / Subtónica (Función Dominante)';
        roleDescriptionEn = 'Leading Tone / Subtonic (Dominant function)';
      }

      // Build playable MIDI voicing in Octave 4
      const baseMidi = 60 + n1.pitchClass;
      const thirdMidi = baseMidi + int3;
      const fifthMidi = baseMidi + int5;

      chords.push({
        degreeNumber: i + 1,
        romanNumeral: romanBase,
        rootPc: n1.pitchClass,
        chordSymbolEn: `${n1.noteEn}${suffixEn}`,
        chordSymbolEs: `${n1.noteEs}${suffixEs}`,
        chordNotesEs: [n1.noteEs, n3.noteEs, n5.noteEs],
        chordNotesEn: [n1.noteEn, n3.noteEn, n5.noteEn],
        midiVoicing: [baseMidi, thirdMidi, fifthMidi],
        tonalFunctionEs,
        tonalFunctionEn,
        functionCode,
        roleDescriptionEs,
        roleDescriptionEn,
      });
    }

    return chords;
  }

  /**
   * Analyzes a two-note interval with diatonic distance, ascending/descending direction,
   * and enharmonic spelling distinction.
   */
  public static analyzeTwoNoteInterval(
    midiNotes: number[],
    noteOrder: NoteOrderEntry[],
    scaleAnalysis: ScaleAnalysisResult,
    enharmonicMode: 'scale' | 'sharp' | 'flat' = 'scale'
  ): TwoNoteIntervalAnalysis | null {
    if (midiNotes.length !== 2) return null;

    const sorted = [...midiNotes].sort((a, b) => a - b);
    const lowMidi = sorted[0];
    const highMidi = sorted[1];
    const semitones = highMidi - lowMidi;
    const octaves = Math.floor(semitones / 12);
    const simpleSemitones = semitones % 12;

    // Determine chronological order (Ascending vs Descending vs Harmonic)
    let firstMidi = lowMidi;
    let secondMidi = highMidi;
    let direction: TwoNoteIntervalAnalysis['direction'] = 'harmonic';

    const orderFiltered = noteOrder.filter(
      (e) => e.midiNote === lowMidi || e.midiNote === highMidi
    );
    if (orderFiltered.length === 2) {
      firstMidi = orderFiltered[0].midiNote;
      secondMidi = orderFiltered[1].midiNote;
      const timeDiff = Math.abs(orderFiltered[1].timestamp - orderFiltered[0].timestamp);
      if (timeDiff < 35) {
        direction = 'harmonic';
      } else if (secondMidi > firstMidi) {
        direction = 'ascending';
      } else {
        direction = 'descending';
      }
    }

    const directionLabelEs =
      direction === 'ascending'
        ? 'Ascendente (↑)'
        : direction === 'descending'
        ? 'Descendente (↓)'
        : 'Armónico / Simultáneo (↑↓)';

    const directionLabelEn =
      direction === 'ascending'
        ? 'Ascending (↑)'
        : direction === 'descending'
        ? 'Descending (↓)'
        : 'Harmonic / Simultaneous (↑↓)';

    // Spell both notes according to scale context or chosen enharmonic mode
    const spellNoteWithLetter = (midi: number) => {
      const pc = ((midi % 12) + 12) % 12;
      const oct = Math.floor(midi / 12) - 1;

      if (enharmonicMode === 'scale' && scaleAnalysis.pitchClassMap.has(pc)) {
        const scInfo = scaleAnalysis.pitchClassMap.get(pc)!;
        const baseLetterEn = scInfo.noteEn[0];
        const letterIdx = NATURAL_EN.indexOf(baseLetterEn);
        return {
          en: `${scInfo.noteEn}${oct}`,
          es: `${scInfo.noteEs}${oct}`,
          pitchEn: scInfo.noteEn,
          pitchEs: scInfo.noteEs,
          letterIdx: letterIdx >= 0 ? letterIdx : 0,
          inScale: true,
          degreeRoman: scInfo.romanDegree,
        };
      }

      const useFlats =
        enharmonicMode === 'flat' ||
        (enharmonicMode === 'scale' && [1, 3, 5, 8, 10].includes(scaleAnalysis.rootPc));

      const pitchEn = useFlats ? FLAT_NOTES_EN[pc] : SHARP_NOTES_EN[pc];
      const pitchEs = useFlats ? FLAT_NOTES_ES[pc] : SHARP_NOTES_ES[pc];
      const letterIdx = NATURAL_EN.indexOf(pitchEn[0]);

      return {
        en: `${pitchEn}${oct}`,
        es: `${pitchEs}${oct}`,
        pitchEn,
        pitchEs,
        letterIdx: letterIdx >= 0 ? letterIdx : 0,
        inScale: scaleAnalysis.pitchClassMap.has(pc),
        degreeRoman: scaleAnalysis.pitchClassMap.get(pc)?.romanDegree,
      };
    };

    const lowSpelled = spellNoteWithLetter(lowMidi);
    const highSpelled = spellNoteWithLetter(highMidi);

    const fromSpelled = direction === 'descending' ? highSpelled : lowSpelled;
    const toSpelled = direction === 'descending' ? lowSpelled : highSpelled;

    // Compute diatonic letter steps between lowNote and highNote (1 = Unison/Prime, 2 = 2nd, 3 = 3rd, etc.)
    const letterStepSimple = ((highSpelled.letterIdx - lowSpelled.letterIdx + 7) % 7) + 1;
    const totalDiatonicNumber = letterStepSimple + octaves * 7;

    // Determine exact interval name & quality based on letterStepSimple and simpleSemitones
    const {
      nameEs,
      nameEn,
      shortEs,
      shortEn,
      enharmonicEs,
      enharmonicEn,
    } = this.resolveIntervalNameAndEnharmonics(
      semitones,
      simpleSemitones,
      letterStepSimple,
      totalDiatonicNumber,
      lowSpelled.pitchEs,
      highSpelled.pitchEs,
      lowSpelled.pitchEn,
      highSpelled.pitchEn
    );

    const diatonicDistanceEs =
      lowSpelled.inScale && highSpelled.inScale
        ? `${totalDiatonicNumber}ª diatónica en ${scaleAnalysis.scaleNameEs} (${lowSpelled.degreeRoman} → ${highSpelled.degreeRoman})`
        : `${totalDiatonicNumber}ª según escritura musical (${lowSpelled.pitchEs} → ${highSpelled.pitchEs})`;

    const diatonicDistanceEn =
      lowSpelled.inScale && highSpelled.inScale
        ? `Diatonic ${totalDiatonicNumber}th in ${scaleAnalysis.scaleNameEn} (${lowSpelled.degreeRoman} → ${highSpelled.degreeRoman})`
        : `Written ${totalDiatonicNumber}th (${lowSpelled.pitchEn} → ${highSpelled.pitchEn})`;

    return {
      lowMidi,
      highMidi,
      firstMidi,
      secondMidi,
      semitones,
      octaves,
      simpleSemitones,
      direction,
      directionLabelEs,
      directionLabelEn,
      fromNoteEs: fromSpelled.es,
      toNoteEs: toSpelled.es,
      fromNoteEn: fromSpelled.en,
      toNoteEn: toSpelled.en,
      intervalNameEs: nameEs,
      intervalNameEn: nameEn,
      shortNameEs: shortEs,
      shortNameEn: shortEn,
      diatonicDistanceEs,
      diatonicDistanceEn,
      enharmonicAltEs: enharmonicEs,
      enharmonicAltEn: enharmonicEn,
    };
  }

  private static resolveIntervalNameAndEnharmonics(
    totalSemitones: number,
    simpleSemitones: number,
    letterNumber: number,
    compoundNumber: number,
    lowEs: string,
    highEs: string,
    lowEn: string,
    highEn: string
  ): {
    nameEs: string;
    nameEn: string;
    shortEs: string;
    shortEn: string;
    enharmonicEs: string | null;
    enharmonicEn: string | null;
  } {
    if (totalSemitones === 0) {
      return {
        nameEs: 'Unísono justo',
        nameEn: 'Perfect Unison',
        shortEs: '1J',
        shortEn: 'P1',
        enharmonicEs: null,
        enharmonicEn: null,
      };
    }

    if (totalSemitones === 12) {
      return {
        nameEs: 'Octava justa',
        nameEn: 'Perfect Octave',
        shortEs: '8J',
        shortEn: 'P8',
        enharmonicEs: null,
        enharmonicEn: null,
      };
    }

    // Standard semitone table with enharmonic awareness based on letterNumber (1..7)
    const isCompound = totalSemitones > 12;
    const compoundTagEs = isCompound ? ` (${compoundNumber}ª compuesta)` : '';
    const compoundTagEn = isCompound ? ` (Compound ${compoundNumber}th)` : '';

    switch (simpleSemitones) {
      case 0:
        return {
          nameEs: `Octava múltiple (${totalSemitones} semitonos)`,
          nameEn: `Multi-Octave (${totalSemitones} semitones)`,
          shortEs: `${compoundNumber}J`,
          shortEn: `P${compoundNumber}`,
          enharmonicEs: null,
          enharmonicEn: null,
        };
      case 1:
        if (letterNumber === 1) {
          return {
            nameEs: `Unísono aumentado (${lowEs}–${highEs})${compoundTagEs}`,
            nameEn: `Augmented Unison (${lowEn}–${highEn})${compoundTagEn}`,
            shortEs: '1A',
            shortEn: 'A1',
            enharmonicEs: 'Enarmónico: Segunda menor (2m)',
            enharmonicEn: 'Enharmonic: Minor 2nd (m2)',
          };
        }
        return {
          nameEs: `Segunda menor${compoundTagEs}`,
          nameEn: `Minor 2nd${compoundTagEn}`,
          shortEs: '2m',
          shortEn: 'm2',
          enharmonicEs: 'Enarmónico: Unísono aumentado (1A)',
          enharmonicEn: 'Enharmonic: Augmented Unison (A1)',
        };
      case 2:
        return {
          nameEs: `Segunda mayor${compoundTagEs}`,
          nameEn: `Major 2nd${compoundTagEn}`,
          shortEs: '2M',
          shortEn: 'M2',
          enharmonicEs: 'Enarmónico: Tercera disminuida (3d)',
          enharmonicEn: 'Enharmonic: Diminished 3rd (d3)',
        };
      case 3:
        if (letterNumber === 2) {
          return {
            nameEs: `Segunda aumentada (${lowEs}–${highEs})${compoundTagEs}`,
            nameEn: `Augmented 2nd (${lowEn}–${highEn})${compoundTagEn}`,
            shortEs: '2A',
            shortEn: 'A2',
            enharmonicEs: 'Enarmónico: Tercera menor (3m)',
            enharmonicEn: 'Enharmonic: Minor 3rd (m3)',
          };
        }
        return {
          nameEs: `Tercera menor${compoundTagEs}`,
          nameEn: `Minor 3rd${compoundTagEn}`,
          shortEs: '3m',
          shortEn: 'm3',
          enharmonicEs: 'Enarmónico: Segunda aumentada (2A)',
          enharmonicEn: 'Enharmonic: Augmented 2nd (A2)',
        };
      case 4:
        if (letterNumber === 4) {
          return {
            nameEs: `Cuarta disminuida (${lowEs}–${highEs})${compoundTagEs}`,
            nameEn: `Diminished 4th (${lowEn}–${highEn})${compoundTagEn}`,
            shortEs: '4d',
            shortEn: 'd4',
            enharmonicEs: 'Enarmónico: Tercera mayor (3M)',
            enharmonicEn: 'Enharmonic: Major 3rd (M3)',
          };
        }
        return {
          nameEs: `Tercera mayor${compoundTagEs}`,
          nameEn: `Major 3rd${compoundTagEn}`,
          shortEs: '3M',
          shortEn: 'M3',
          enharmonicEs: 'Enarmónico: Cuarta disminuida (4d)',
          enharmonicEn: 'Enharmonic: Diminished 4th (d4)',
        };
      case 5:
        return {
          nameEs: `Cuarta justa${compoundTagEs}`,
          nameEn: `Perfect 4th${compoundTagEn}`,
          shortEs: '4J',
          shortEn: 'P4',
          enharmonicEs: 'Enarmónico: Tercera aumentada (3A)',
          enharmonicEn: 'Enharmonic: Augmented 3rd (A3)',
        };
      case 6:
        if (letterNumber === 4) {
          return {
            nameEs: `Cuarta aumentada / Tritono (${lowEs}–${highEs})${compoundTagEs}`,
            nameEn: `Augmented 4th / Tritone (${lowEn}–${highEn})${compoundTagEn}`,
            shortEs: '4A',
            shortEn: 'A4',
            enharmonicEs: 'Enarmónico: Quinta disminuida (5d)',
            enharmonicEn: 'Enharmonic: Diminished 5th (d5)',
          };
        }
        return {
          nameEs: `Quinta disminuida / Tritono (${lowEs}–${highEs})${compoundTagEs}`,
          nameEn: `Diminished 5th / Tritone (${lowEn}–${highEn})${compoundTagEn}`,
          shortEs: '5d',
          shortEn: 'd5',
          enharmonicEs: 'Enarmónico: Cuarta aumentada (4A)',
          enharmonicEn: 'Enharmonic: Augmented 4th (A4)',
        };
      case 7:
        return {
          nameEs: `Quinta justa${compoundTagEs}`,
          nameEn: `Perfect 5th${compoundTagEn}`,
          shortEs: '5J',
          shortEn: 'P5',
          enharmonicEs: 'Enarmónico: Sexta disminuida (6d)',
          enharmonicEn: 'Enharmonic: Diminished 6th (d6)',
        };
      case 8:
        if (letterNumber === 5) {
          return {
            nameEs: `Quinta aumentada (${lowEs}–${highEs})${compoundTagEs}`,
            nameEn: `Augmented 5th (${lowEn}–${highEn})${compoundTagEn}`,
            shortEs: '5A',
            shortEn: 'A5',
            enharmonicEs: 'Enarmónico: Sexta menor (6m)',
            enharmonicEn: 'Enharmonic: Minor 6th (m6)',
          };
        }
        return {
          nameEs: `Sexta menor${compoundTagEs}`,
          nameEn: `Minor 6th${compoundTagEn}`,
          shortEs: '6m',
          shortEn: 'm6',
          enharmonicEs: 'Enarmónico: Quinta aumentada (5A)',
          enharmonicEn: 'Enharmonic: Augmented 5th (A5)',
        };
      case 9:
        if (letterNumber === 7) {
          return {
            nameEs: `Séptima disminuida (${lowEs}–${highEs})${compoundTagEs}`,
            nameEn: `Diminished 7th (${lowEn}–${highEn})${compoundTagEn}`,
            shortEs: '7d',
            shortEn: 'd7',
            enharmonicEs: 'Enarmónico: Sexta mayor (6M)',
            enharmonicEn: 'Enharmonic: Major 6th (M6)',
          };
        }
        return {
          nameEs: `Sexta mayor${compoundTagEs}`,
          nameEn: `Major 6th${compoundTagEn}`,
          shortEs: '6M',
          shortEn: 'M6',
          enharmonicEs: 'Enarmónico: Séptima disminuida (7d)',
          enharmonicEn: 'Enharmonic: Diminished 7th (d7)',
        };
      case 10:
        if (letterNumber === 6) {
          return {
            nameEs: `Sexta aumentada (${lowEs}–${highEs})${compoundTagEs}`,
            nameEn: `Augmented 6th (${lowEn}–${highEn})${compoundTagEn}`,
            shortEs: '6A',
            shortEn: 'A6',
            enharmonicEs: 'Enarmónico: Séptima menor (7m)',
            enharmonicEn: 'Enharmonic: Minor 7th (m7)',
          };
        }
        return {
          nameEs: `Séptima menor${compoundTagEs}`,
          nameEn: `Minor 7th${compoundTagEn}`,
          shortEs: '7m',
          shortEn: 'm7',
          enharmonicEs: 'Enarmónico: Sexta aumentada (6A)',
          enharmonicEn: 'Enharmonic: Augmented 6th (A6)',
        };
      case 11:
      default:
        return {
          nameEs: `Séptima mayor${compoundTagEs}`,
          nameEn: `Major 7th${compoundTagEn}`,
          shortEs: '7M',
          shortEn: 'M7',
          enharmonicEs: 'Enarmónico: Octava disminuida (8d)',
          enharmonicEn: 'Enharmonic: Diminished 8th (d8)',
        };
    }
  }
}
