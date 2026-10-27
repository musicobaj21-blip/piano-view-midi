import {
  ChordCandidate,
  ChordRecognitionResult,
  IntervalBreakdown,
} from '../types';
import { INTERVAL_NAMES_EN, INTERVAL_NAMES_ES } from './musicTheory';

export const SHARP_NAMES_EN = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const FLAT_NAMES_EN  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const SHARP_NAMES_ES = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
export const FLAT_NAMES_ES  = ['Do', 'Reb', 'Re', 'Mib', 'Mi', 'Fa', 'Solb', 'Sol', 'Lab', 'La', 'Sib', 'Si'];

export interface ChordFormulaDefinition {
  id: string;
  /** Symbol suffix appended to root (e.g., "", "m", "maj7", "7", "13", "maj13", "m13") */
  suffix: string;
  /** Spanish chord quality name */
  nameEs: string;
  /** English chord quality name */
  nameEn: string;
  /** Spanish harmonic classification */
  classificationEs: string;
  /** English harmonic classification */
  classificationEn: string;
  /** Complete theoretical formula string */
  formula: string;
  /** Ordered interval tokens corresponding to `intervals` */
  tokens: string[];
  /** Semitone offsets mod 12 from root */
  intervals: number[];
  /** Essential semitone offsets mod 12 that MUST be present */
  essential: number[];
  /** Optional semitone offsets mod 12 that may be omitted in real piano voicings */
  optional: number[];
  /** Structural complexity weight */
  complexity: number;
}

/**
 * CATÁLOGO ARMÓNICO COMPLETO DE RUMIE PIANO VIEW MIDI
 * Cubre tríadas, suspendidos, sextas, séptimas, novenas, oncenas,
 * trecenas completas y en voicing de jazz (sin 5ª/9ª/11ª), semidisminuidos con tensión
 * y dominantes alterados.
 */
export const CHORD_FORMULA_CATALOG: ChordFormulaDefinition[] = [
  // ===========================================================================
  // 1. TRÍADAS Y CUATRIADAS BÁSICAS
  // ===========================================================================
  {
    id: 'maj',
    suffix: '',
    nameEs: 'Mayor',
    nameEn: 'Major',
    classificationEs: 'Tríada mayor',
    classificationEn: 'Major triad',
    formula: '1 – 3 – 5',
    tokens: ['1', '3', '5'],
    intervals: [0, 4, 7],
    essential: [0, 4, 7],
    optional: [],
    complexity: 1.0,
  },
  {
    id: 'min',
    suffix: 'm',
    nameEs: 'menor',
    nameEn: 'Minor',
    classificationEs: 'Tríada menor',
    classificationEn: 'Minor triad',
    formula: '1 – b3 – 5',
    tokens: ['1', 'b3', '5'],
    intervals: [0, 3, 7],
    essential: [0, 3, 7],
    optional: [],
    complexity: 1.0,
  },
  {
    id: 'dim',
    suffix: 'dim',
    nameEs: 'disminuido',
    nameEn: 'Diminished',
    classificationEs: 'Tríada disminuida',
    classificationEn: 'Diminished triad',
    formula: '1 – b3 – b5',
    tokens: ['1', 'b3', 'b5'],
    intervals: [0, 3, 6],
    essential: [0, 3, 6],
    optional: [],
    complexity: 1.3,
  },
  {
    id: 'aug',
    suffix: 'aug',
    nameEs: 'aumentado',
    nameEn: 'Augmented',
    classificationEs: 'Tríada aumentada',
    classificationEn: 'Augmented triad',
    formula: '1 – 3 – #5',
    tokens: ['1', '3', '#5'],
    intervals: [0, 4, 8],
    essential: [0, 4, 8],
    optional: [],
    complexity: 1.4,
  },

  // ===========================================================================
  // 2. SUSPENDIDOS (SUS2 / SUS4)
  // ===========================================================================
  {
    id: 'sus2',
    suffix: 'sus2',
    nameEs: 'suspendido en segunda (sus2)',
    nameEn: 'Suspended 2nd',
    classificationEs: 'Acorde suspendido (sus2)',
    classificationEn: 'Suspended 2nd chord',
    formula: '1 – 2 – 5',
    tokens: ['1', '2', '5'],
    intervals: [0, 2, 7],
    essential: [0, 2, 7],
    optional: [],
    complexity: 1.5,
  },
  {
    id: 'sus4',
    suffix: 'sus4',
    nameEs: 'suspendido en cuarta (sus4)',
    nameEn: 'Suspended 4th',
    classificationEs: 'Acorde suspendido (sus4)',
    classificationEn: 'Suspended 4th chord',
    formula: '1 – 4 – 5',
    tokens: ['1', '4', '5'],
    intervals: [0, 5, 7],
    essential: [0, 5, 7],
    optional: [],
    complexity: 1.5,
  },

  // ===========================================================================
  // 3. ACORDES DE SÉPTIMA (MAJ7, 7, M7, M7B5, DIM7, M(MAJ7), 7SUS4)
  // ===========================================================================
  {
    id: 'maj7',
    suffix: 'maj7',
    nameEs: 'séptima mayor',
    nameEn: 'Major 7th',
    classificationEs: 'Séptima mayor',
    classificationEn: 'Major seventh',
    formula: '1 – 3 – 5 – 7',
    tokens: ['1', '3', '5', '7'],
    intervals: [0, 4, 7, 11],
    essential: [0, 4, 11],
    optional: [7],
    complexity: 1.7,
  },
  {
    id: '7',
    suffix: '7',
    nameEs: 'séptima dominante',
    nameEn: 'Dominant 7th',
    classificationEs: 'Séptima dominante',
    classificationEn: 'Dominant seventh',
    formula: '1 – 3 – 5 – b7',
    tokens: ['1', '3', '5', 'b7'],
    intervals: [0, 4, 7, 10],
    essential: [0, 4, 10],
    optional: [7],
    complexity: 1.7,
  },
  {
    id: 'm7',
    suffix: 'm7',
    nameEs: 'menor séptima',
    nameEn: 'Minor 7th',
    classificationEs: 'Séptima menor',
    classificationEn: 'Minor seventh',
    formula: '1 – b3 – 5 – b7',
    tokens: ['1', 'b3', '5', 'b7'],
    intervals: [0, 3, 7, 10],
    essential: [0, 3, 10],
    optional: [7],
    complexity: 1.7,
  },
  {
    id: 'm7b5',
    suffix: 'm7(b5)',
    nameEs: 'semidisminuido',
    nameEn: 'Half-Diminished 7th',
    classificationEs: 'Semidisminuido (Ø7)',
    classificationEn: 'Half-diminished seventh',
    formula: '1 – b3 – b5 – b7',
    tokens: ['1', 'b3', 'b5', 'b7'],
    intervals: [0, 3, 6, 10],
    essential: [0, 3, 6, 10],
    optional: [],
    complexity: 1.8,
  },
  {
    id: 'dim7',
    suffix: '°7',
    nameEs: 'disminuido séptima',
    nameEn: 'Diminished 7th',
    classificationEs: 'Disminuido séptima',
    classificationEn: 'Diminished seventh',
    formula: '1 – b3 – b5 – bb7',
    tokens: ['1', 'b3', 'b5', 'bb7'],
    intervals: [0, 3, 6, 9],
    essential: [0, 3, 6, 9],
    optional: [],
    complexity: 1.8,
  },
  {
    id: 'mmaj7',
    suffix: 'm(maj7)',
    nameEs: 'menor con séptima mayor',
    nameEn: 'Minor-Major 7th',
    classificationEs: 'Menor con séptima mayor',
    classificationEn: 'Minor-major seventh',
    formula: '1 – b3 – 5 – 7',
    tokens: ['1', 'b3', '5', '7'],
    intervals: [0, 3, 7, 11],
    essential: [0, 3, 11],
    optional: [7],
    complexity: 2.0,
  },
  {
    id: 'maj7sharp5',
    suffix: 'maj7(#5)',
    nameEs: 'séptima mayor con quinta aumentada',
    nameEn: 'Augmented Major 7th',
    classificationEs: 'Séptima mayor aumentada',
    classificationEn: 'Augmented major seventh',
    formula: '1 – 3 – #5 – 7',
    tokens: ['1', '3', '#5', '7'],
    intervals: [0, 4, 8, 11],
    essential: [0, 4, 8, 11],
    optional: [],
    complexity: 2.1,
  },
  {
    id: '7sus4',
    suffix: '7sus4',
    nameEs: 'séptima dominante sus4',
    nameEn: 'Dominant 7th sus4',
    classificationEs: 'Dominante suspendido (7sus4)',
    classificationEn: 'Suspended dominant seventh',
    formula: '1 – 4 – 5 – b7',
    tokens: ['1', '4', '5', 'b7'],
    intervals: [0, 5, 7, 10],
    essential: [0, 5, 10],
    optional: [7],
    complexity: 1.9,
  },
  {
    id: '7sus2',
    suffix: '7sus2',
    nameEs: 'séptima dominante sus2',
    nameEn: 'Dominant 7th sus2',
    classificationEs: 'Dominante suspendido (7sus2)',
    classificationEn: 'Suspended 2nd dominant seventh',
    formula: '1 – 2 – 5 – b7',
    tokens: ['1', '2', '5', 'b7'],
    intervals: [0, 2, 7, 10],
    essential: [0, 2, 10],
    optional: [7],
    complexity: 2.0,
  },

  // ===========================================================================
  // 4. ACORDES DE SEXTA Y 6/9 (Sin 7ª presente)
  // ===========================================================================
  {
    id: '6',
    suffix: '6',
    nameEs: 'Mayor con sexta',
    nameEn: 'Major 6th',
    classificationEs: 'Acorde con sexta mayor',
    classificationEn: 'Major sixth chord',
    formula: '1 – 3 – 5 – 6',
    tokens: ['1', '3', '5', '6'],
    intervals: [0, 4, 7, 9],
    essential: [0, 4, 7, 9],
    optional: [],
    complexity: 2.1,
  },
  {
    id: 'm6',
    suffix: 'm6',
    nameEs: 'menor con sexta',
    nameEn: 'Minor 6th',
    classificationEs: 'Acorde menor con sexta',
    classificationEn: 'Minor sixth chord',
    formula: '1 – b3 – 5 – 6',
    tokens: ['1', 'b3', '5', '6'],
    intervals: [0, 3, 7, 9],
    essential: [0, 3, 7, 9],
    optional: [],
    complexity: 2.1,
  },
  {
    id: '69',
    suffix: '6/9',
    nameEs: 'Mayor sexta con novena',
    nameEn: 'Six-Nine (6/9)',
    classificationEs: 'Sexta y novena (6/9)',
    classificationEn: 'Six-nine chord',
    formula: '1 – 3 – 5 – 6 – 9',
    tokens: ['1', '3', '5', '6', '9'],
    intervals: [0, 4, 7, 9, 2],
    essential: [0, 4, 9, 2],
    optional: [7],
    complexity: 2.2,
  },
  {
    id: 'm69',
    suffix: 'm6/9',
    nameEs: 'menor sexta con novena',
    nameEn: 'Minor Six-Nine (m6/9)',
    classificationEs: 'Menor con sexta y novena',
    classificationEn: 'Minor six-nine chord',
    formula: '1 – b3 – 5 – 6 – 9',
    tokens: ['1', 'b3', '5', '6', '9'],
    intervals: [0, 3, 7, 9, 2],
    essential: [0, 3, 9, 2],
    optional: [7],
    complexity: 2.2,
  },

  // ===========================================================================
  // 5. NOVENAS Y ADD9 / ADD4 (Tensión 9)
  // ===========================================================================
  {
    id: 'add9',
    suffix: 'add9',
    nameEs: 'Mayor con novena añadida',
    nameEn: 'Major add9',
    classificationEs: 'Novena añadida (add9)',
    classificationEn: 'Added ninth',
    formula: '1 – 3 – 5 – 9',
    tokens: ['1', '3', '5', '9'],
    intervals: [0, 4, 7, 2],
    essential: [0, 4, 7, 2],
    optional: [],
    complexity: 2.0,
  },
  {
    id: 'madd9',
    suffix: 'm(add9)',
    nameEs: 'menor con novena añadida',
    nameEn: 'Minor add9',
    classificationEs: 'Menor con novena añadida',
    classificationEn: 'Minor added ninth',
    formula: '1 – b3 – 5 – 9',
    tokens: ['1', 'b3', '5', '9'],
    intervals: [0, 3, 7, 2],
    essential: [0, 3, 7, 2],
    optional: [],
    complexity: 2.0,
  },
  {
    id: 'maj9',
    suffix: 'maj9',
    nameEs: 'novena mayor',
    nameEn: 'Major 9th',
    classificationEs: 'Tensión de 9ª Mayor',
    classificationEn: 'Major ninth',
    formula: '1 – 3 – 5 – 7 – 9',
    tokens: ['1', '3', '5', '7', '9'],
    intervals: [0, 4, 7, 11, 2],
    essential: [0, 4, 11, 2],
    optional: [7],
    complexity: 2.1,
  },
  {
    id: '9',
    suffix: '9',
    nameEs: 'novena dominante',
    nameEn: 'Dominant 9th',
    classificationEs: 'Tensión de 9ª Dominante',
    classificationEn: 'Dominant ninth',
    formula: '1 – 3 – 5 – b7 – 9',
    tokens: ['1', '3', '5', 'b7', '9'],
    intervals: [0, 4, 7, 10, 2],
    essential: [0, 4, 10, 2],
    optional: [7],
    complexity: 2.1,
  },
  {
    id: 'm9',
    suffix: 'm9',
    nameEs: 'menor novena',
    nameEn: 'Minor 9th',
    classificationEs: 'Tensión de 9ª Menor',
    classificationEn: 'Minor ninth',
    formula: '1 – b3 – 5 – b7 – 9',
    tokens: ['1', 'b3', '5', 'b7', '9'],
    intervals: [0, 3, 7, 10, 2],
    essential: [0, 3, 10, 2],
    optional: [7],
    complexity: 2.1,
  },
  {
    id: 'mmaj9',
    suffix: 'm(maj9)',
    nameEs: 'menor con séptima mayor y novena',
    nameEn: 'Minor-Major 9th',
    classificationEs: 'Menor-Mayor con 9ª',
    classificationEn: 'Minor-major ninth',
    formula: '1 – b3 – 5 – 7 – 9',
    tokens: ['1', 'b3', '5', '7', '9'],
    intervals: [0, 3, 7, 11, 2],
    essential: [0, 3, 11, 2],
    optional: [7],
    complexity: 2.2,
  },
  {
    id: 'm9b5',
    suffix: 'm9(b5)',
    nameEs: 'semidisminuido con novena',
    nameEn: 'Half-Diminished 9th',
    classificationEs: 'Semidisminuido con 9ª',
    classificationEn: 'Half-diminished ninth',
    formula: '1 – b3 – b5 – b7 – 9',
    tokens: ['1', 'b3', 'b5', 'b7', '9'],
    intervals: [0, 3, 6, 10, 2],
    essential: [0, 3, 6, 10, 2],
    optional: [],
    complexity: 2.2,
  },
  {
    id: '9sus4',
    suffix: '9sus4',
    nameEs: 'novena dominante sus4',
    nameEn: 'Dominant 9th sus4',
    classificationEs: 'Dominante 9ª suspendido',
    classificationEn: 'Suspended dominant ninth',
    formula: '1 – 4 – 5 – b7 – 9',
    tokens: ['1', '4', '5', 'b7', '9'],
    intervals: [0, 5, 7, 10, 2],
    essential: [0, 5, 10, 2],
    optional: [7],
    complexity: 2.1,
  },

  // ===========================================================================
  // 6. ONCENAS Y #11 (Tensión 11 y #11)
  // ===========================================================================
  {
    id: 'add11',
    suffix: 'add11',
    nameEs: 'Mayor con oncena añadida',
    nameEn: 'Major add11',
    classificationEs: 'Oncena añadida (add11)',
    classificationEn: 'Added eleventh',
    formula: '1 – 3 – 5 – 11',
    tokens: ['1', '3', '5', '11'],
    intervals: [0, 4, 7, 5],
    essential: [0, 4, 7, 5],
    optional: [],
    complexity: 2.2,
  },
  {
    id: 'madd11',
    suffix: 'm(add11)',
    nameEs: 'menor con oncena añadida',
    nameEn: 'Minor add11',
    classificationEs: 'Menor con oncena añadida',
    classificationEn: 'Minor added eleventh',
    formula: '1 – b3 – 5 – 11',
    tokens: ['1', 'b3', '5', '11'],
    intervals: [0, 3, 7, 5],
    essential: [0, 3, 7, 5],
    optional: [],
    complexity: 2.2,
  },
  {
    id: 'm11',
    suffix: 'm11',
    nameEs: 'menor oncena',
    nameEn: 'Minor 11th',
    classificationEs: 'Tensión de 11ª Menor',
    classificationEn: 'Minor eleventh',
    formula: '1 – b3 – 5 – b7 – 9 – 11',
    tokens: ['1', 'b3', '5', 'b7', '9', '11'],
    intervals: [0, 3, 7, 10, 2, 5],
    essential: [0, 3, 10, 5],
    optional: [7, 2],
    complexity: 2.2,
  },
  {
    id: '11',
    suffix: '11',
    nameEs: 'oncena dominante',
    nameEn: 'Dominant 11th',
    classificationEs: 'Tensión de 11ª Dominante',
    classificationEn: 'Dominant eleventh',
    formula: '1 – 3 – 5 – b7 – 9 – 11',
    tokens: ['1', '3', '5', 'b7', '9', '11'],
    intervals: [0, 4, 7, 10, 2, 5],
    essential: [0, 10, 5],
    optional: [4, 7, 2],
    complexity: 2.3,
  },
  {
    id: 'maj11',
    suffix: 'maj11',
    nameEs: 'oncena mayor',
    nameEn: 'Major 11th',
    classificationEs: 'Tensión de 11ª Mayor',
    classificationEn: 'Major eleventh',
    formula: '1 – 3 – 5 – 7 – 9 – 11',
    tokens: ['1', '3', '5', '7', '9', '11'],
    intervals: [0, 4, 7, 11, 2, 5],
    essential: [0, 4, 11, 5],
    optional: [7, 2],
    complexity: 2.3,
  },
  {
    id: 'm11b5',
    suffix: 'm11(b5)',
    nameEs: 'semidisminuido con oncena',
    nameEn: 'Half-Diminished 11th',
    classificationEs: 'Semidisminuido con 11ª',
    classificationEn: 'Half-diminished eleventh',
    formula: '1 – b3 – b5 – b7 – 9 – 11',
    tokens: ['1', 'b3', 'b5', 'b7', '9', '11'],
    intervals: [0, 3, 6, 10, 2, 5],
    essential: [0, 3, 6, 10, 5],
    optional: [2],
    complexity: 2.3,
  },
  {
    id: 'maj7sharp11',
    suffix: 'maj7(#11)',
    nameEs: 'séptima mayor con oncena aumentada',
    nameEn: 'Major 7th (#11)',
    classificationEs: 'Mayor Lidio (#11)',
    classificationEn: 'Lydian major seventh (#11)',
    formula: '1 – 3 – 5 – 7 – #11',
    tokens: ['1', '3', '5', '7', '#11'],
    intervals: [0, 4, 7, 11, 6],
    essential: [0, 4, 11, 6],
    optional: [7],
    complexity: 2.2,
  },
  {
    id: 'maj9sharp11',
    suffix: 'maj9(#11)',
    nameEs: 'novena mayor con oncena aumentada',
    nameEn: 'Major 9th (#11)',
    classificationEs: 'Novena Mayor Lidia (#11)',
    classificationEn: 'Lydian major ninth (#11)',
    formula: '1 – 3 – 5 – 7 – 9 – #11',
    tokens: ['1', '3', '5', '7', '9', '#11'],
    intervals: [0, 4, 7, 11, 2, 6],
    essential: [0, 4, 11, 2, 6],
    optional: [7],
    complexity: 2.3,
  },
  {
    id: '7sharp11',
    suffix: '7(#11)',
    nameEs: 'séptima dominante con oncena aumentada',
    nameEn: 'Dominant 7th (#11)',
    classificationEs: 'Dominante Lidio (#11)',
    classificationEn: 'Lydian dominant (#11)',
    formula: '1 – 3 – 5 – b7 – #11',
    tokens: ['1', '3', '5', 'b7', '#11'],
    intervals: [0, 4, 7, 10, 6],
    essential: [0, 4, 10, 6],
    optional: [7],
    complexity: 2.2,
  },
  {
    id: '9sharp11',
    suffix: '9(#11)',
    nameEs: 'novena dominante con oncena aumentada',
    nameEn: 'Dominant 9th (#11)',
    classificationEs: 'Novena Dominante (#11)',
    classificationEn: 'Dominant ninth (#11)',
    formula: '1 – 3 – 5 – b7 – 9 – #11',
    tokens: ['1', '3', '5', 'b7', '9', '#11'],
    intervals: [0, 4, 7, 10, 2, 6],
    essential: [0, 4, 10, 2, 6],
    optional: [7],
    complexity: 2.3,
  },

  // ===========================================================================
  // 7. TRECENAS COMPLETAS Y VOICINGS REALES DE PIANO (13, MAJ13, M13, 13SUS4, 13ALT)
  //    Aceptan tanto el acorde de 7 notas (con 5ª, 9ª y 11ª) como los voicings
  //    estándar de Jazz/Pop (1 - 3 - 7 - 13) y (1 - 3 - 7 - 9 - 13).
  // ===========================================================================
  {
    id: '13',
    suffix: '13',
    nameEs: 'trecena dominante',
    nameEn: 'Dominant 13th',
    classificationEs: 'Tensión de 13ª Dominante',
    classificationEn: 'Dominant thirteenth',
    formula: '1 – 3 – 5 – b7 – 9 – 11 – 13',
    tokens: ['1', '3', '5', 'b7', '9', '11', '13'],
    intervals: [0, 4, 7, 10, 2, 5, 9],
    essential: [0, 4, 10, 9],
    optional: [7, 2, 5],
    complexity: 2.15,
  },
  {
    id: 'maj13',
    suffix: 'maj13',
    nameEs: 'trecena mayor',
    nameEn: 'Major 13th',
    classificationEs: 'Tensión de 13ª Mayor',
    classificationEn: 'Major thirteenth',
    formula: '1 – 3 – 5 – 7 – 9 – 11 – 13',
    tokens: ['1', '3', '5', '7', '9', '11', '13'],
    intervals: [0, 4, 7, 11, 2, 5, 9],
    essential: [0, 4, 11, 9],
    optional: [7, 2, 5],
    complexity: 2.15,
  },
  {
    id: 'm13',
    suffix: 'm13',
    nameEs: 'menor trecena',
    nameEn: 'Minor 13th',
    classificationEs: 'Tensión de 13ª Menor',
    classificationEn: 'Minor thirteenth',
    formula: '1 – b3 – 5 – b7 – 9 – 11 – 13',
    tokens: ['1', 'b3', '5', 'b7', '9', '11', '13'],
    intervals: [0, 3, 7, 10, 2, 5, 9],
    essential: [0, 3, 10, 9],
    optional: [7, 2, 5],
    complexity: 2.15,
  },
  {
    id: 'mmaj13',
    suffix: 'm(maj13)',
    nameEs: 'menor con séptima mayor y trecena',
    nameEn: 'Minor-Major 13th',
    classificationEs: 'Menor-Mayor con 13ª',
    classificationEn: 'Minor-major thirteenth',
    formula: '1 – b3 – 5 – 7 – 9 – 11 – 13',
    tokens: ['1', 'b3', '5', '7', '9', '11', '13'],
    intervals: [0, 3, 7, 11, 2, 5, 9],
    essential: [0, 3, 11, 9],
    optional: [7, 2, 5],
    complexity: 2.3,
  },
  {
    id: '13sus4',
    suffix: '13sus4',
    nameEs: 'trecena dominante sus4',
    nameEn: 'Dominant 13th sus4',
    classificationEs: 'Dominante 13ª suspendido (13sus4)',
    classificationEn: 'Suspended dominant thirteenth',
    formula: '1 – 4 – 5 – b7 – 9 – 13',
    tokens: ['1', '4', '5', 'b7', '9', '13'],
    intervals: [0, 5, 7, 10, 2, 9],
    essential: [0, 5, 10, 9],
    optional: [7, 2],
    complexity: 2.2,
  },
  {
    id: 'maj13sharp11',
    suffix: 'maj13(#11)',
    nameEs: 'trecena mayor con oncena aumentada',
    nameEn: 'Major 13th (#11)',
    classificationEs: 'Trecena Mayor Lidia (#11)',
    classificationEn: 'Lydian major thirteenth (#11)',
    formula: '1 – 3 – 5 – 7 – 9 – #11 – 13',
    tokens: ['1', '3', '5', '7', '9', '#11', '13'],
    intervals: [0, 4, 7, 11, 2, 6, 9],
    essential: [0, 4, 11, 6, 9],
    optional: [7, 2],
    complexity: 2.3,
  },
  {
    id: '13sharp11',
    suffix: '13(#11)',
    nameEs: 'trecena dominante con oncena aumentada',
    nameEn: 'Dominant 13th (#11)',
    classificationEs: 'Trecena Dominante Lidia (#11)',
    classificationEn: 'Lydian dominant thirteenth (#11)',
    formula: '1 – 3 – 5 – b7 – 9 – #11 – 13',
    tokens: ['1', '3', '5', 'b7', '9', '#11', '13'],
    intervals: [0, 4, 7, 10, 2, 6, 9],
    essential: [0, 4, 10, 6, 9],
    optional: [7, 2],
    complexity: 2.3,
  },
  {
    id: '13b9',
    suffix: '13(b9)',
    nameEs: 'trecena dominante con novena menor',
    nameEn: 'Dominant 13th (b9)',
    classificationEs: 'Trecena Dominante con b9',
    classificationEn: 'Dominant thirteenth (b9)',
    formula: '1 – 3 – 5 – b7 – b9 – 13',
    tokens: ['1', '3', '5', 'b7', 'b9', '13'],
    intervals: [0, 4, 7, 10, 1, 9],
    essential: [0, 4, 10, 1, 9],
    optional: [7],
    complexity: 2.3,
  },
  {
    id: '13sharp9',
    suffix: '13(#9)',
    nameEs: 'trecena dominante con novena aumentada',
    nameEn: 'Dominant 13th (#9)',
    classificationEs: 'Trecena Dominante con #9',
    classificationEn: 'Dominant thirteenth (#9)',
    formula: '1 – 3 – 5 – b7 – #9 – 13',
    tokens: ['1', '3', '5', 'b7', '#9', '13'],
    intervals: [0, 4, 7, 10, 3, 9],
    essential: [0, 4, 10, 3, 9],
    optional: [7],
    complexity: 2.3,
  },

  // ===========================================================================
  // 8. DOMINANTES ALTERADOS (b5, #5, b9, #9, b13 y Combinados)
  // ===========================================================================
  {
    id: '7b5',
    suffix: '7(b5)',
    nameEs: 'séptima dominante con quinta disminuida',
    nameEn: 'Dominant 7th (b5)',
    classificationEs: 'Dominante alterado (b5)',
    classificationEn: 'Altered dominant (b5)',
    formula: '1 – 3 – b5 – b7',
    tokens: ['1', '3', 'b5', 'b7'],
    intervals: [0, 4, 6, 10],
    essential: [0, 4, 6, 10],
    optional: [],
    complexity: 2.1,
  },
  {
    id: '7sharp5',
    suffix: '7(#5)',
    nameEs: 'séptima dominante con quinta aumentada',
    nameEn: 'Augmented Dominant 7th (#5)',
    classificationEs: 'Dominante alterado (#5)',
    classificationEn: 'Altered dominant (#5)',
    formula: '1 – 3 – #5 – b7',
    tokens: ['1', '3', '#5', 'b7'],
    intervals: [0, 4, 8, 10],
    essential: [0, 4, 8, 10],
    optional: [],
    complexity: 2.1,
  },
  {
    id: '7b9',
    suffix: '7(b9)',
    nameEs: 'séptima dominante con novena menor',
    nameEn: 'Dominant 7th (b9)',
    classificationEs: 'Dominante con b9',
    classificationEn: 'Dominant seventh (b9)',
    formula: '1 – 3 – 5 – b7 – b9',
    tokens: ['1', '3', '5', 'b7', 'b9'],
    intervals: [0, 4, 7, 10, 1],
    essential: [0, 4, 10, 1],
    optional: [7],
    complexity: 2.2,
  },
  {
    id: '7sharp9',
    suffix: '7(#9)',
    nameEs: 'séptima dominante con novena aumentada',
    nameEn: 'Dominant 7th (#9)',
    classificationEs: 'Dominante con #9 (Hendrix)',
    classificationEn: 'Dominant seventh (#9)',
    formula: '1 – 3 – 5 – b7 – #9',
    tokens: ['1', '3', '5', 'b7', '#9'],
    intervals: [0, 4, 7, 10, 3],
    essential: [0, 4, 10, 3],
    optional: [7],
    complexity: 2.2,
  },
  {
    id: '7b13',
    suffix: '7(b13)',
    nameEs: 'séptima dominante con trecena menor',
    nameEn: 'Dominant 7th (b13)',
    classificationEs: 'Dominante con b13',
    classificationEn: 'Dominant seventh (b13)',
    formula: '1 – 3 – 5 – b7 – b13',
    tokens: ['1', '3', '5', 'b7', 'b13'],
    intervals: [0, 4, 7, 10, 8],
    essential: [0, 4, 10, 8],
    optional: [7],
    complexity: 2.2,
  },
  {
    id: '9b13',
    suffix: '9(b13)',
    nameEs: 'novena dominante con trecena menor',
    nameEn: 'Dominant 9th (b13)',
    classificationEs: 'Novena Dominante con b13',
    classificationEn: 'Dominant ninth (b13)',
    formula: '1 – 3 – 5 – b7 – 9 – b13',
    tokens: ['1', '3', '5', 'b7', '9', 'b13'],
    intervals: [0, 4, 7, 10, 2, 8],
    essential: [0, 4, 10, 2, 8],
    optional: [7],
    complexity: 2.35,
  },
  {
    id: '7b9b13',
    suffix: '7(b9,b13)',
    nameEs: 'séptima dominante alterada (b9, b13)',
    nameEn: 'Altered Dominant 7th (b9, b13)',
    classificationEs: 'Dominante alterado (b9, b13)',
    classificationEn: 'Altered dominant (b9, b13)',
    formula: '1 – 3 – 5 – b7 – b9 – b13',
    tokens: ['1', '3', '5', 'b7', 'b9', 'b13'],
    intervals: [0, 4, 7, 10, 1, 8],
    essential: [0, 4, 10, 1, 8],
    optional: [7],
    complexity: 2.4,
  },
  {
    id: '7sharp9b13',
    suffix: '7(#9,b13)',
    nameEs: 'séptima dominante alterada (#9, b13)',
    nameEn: 'Altered Dominant 7th (#9, b13)',
    classificationEs: 'Dominante alterado (#9, b13)',
    classificationEn: 'Altered dominant (#9, b13)',
    formula: '1 – 3 – 5 – b7 – #9 – b13',
    tokens: ['1', '3', '5', 'b7', '#9', 'b13'],
    intervals: [0, 4, 7, 10, 3, 8],
    essential: [0, 4, 10, 3, 8],
    optional: [7],
    complexity: 2.4,
  },
  {
    id: '7b9sharp11',
    suffix: '7(b9,#11)',
    nameEs: 'séptima dominante alterada (b9, #11)',
    nameEn: 'Altered Dominant 7th (b9, #11)',
    classificationEs: 'Dominante alterado (b9, #11)',
    classificationEn: 'Altered dominant (b9, #11)',
    formula: '1 – 3 – 5 – b7 – b9 – #11',
    tokens: ['1', '3', '5', 'b7', 'b9', '#11'],
    intervals: [0, 4, 7, 10, 1, 6],
    essential: [0, 4, 10, 1, 6],
    optional: [7],
    complexity: 2.4,
  },
  {
    id: '7sharp9sharp11',
    suffix: '7(#9,#11)',
    nameEs: 'séptima dominante alterada (#9, #11)',
    nameEn: 'Altered Dominant 7th (#9, #11)',
    classificationEs: 'Dominante alterado (#9, #11)',
    classificationEn: 'Altered dominant (#9, #11)',
    formula: '1 – 3 – 5 – b7 – #9 – #11',
    tokens: ['1', '3', '5', 'b7', '#9', '#11'],
    intervals: [0, 4, 7, 10, 3, 6],
    essential: [0, 4, 10, 3, 6],
    optional: [7],
    complexity: 2.4,
  },
];

function rootPrefersFlats(rootPc: number, suffix: string): boolean {
  if ([1, 3, 5, 8, 10].includes(rootPc)) {
    if ((rootPc === 1 || rootPc === 8) && (suffix.startsWith('m') || suffix.includes('°') || suffix.includes('dim'))) {
      return false;
    }
    return true;
  }
  if ([0, 2, 7].includes(rootPc) && (suffix.startsWith('m') || suffix.includes('°') || suffix.includes('dim') || suffix.startsWith('7') || suffix.startsWith('9') || suffix.startsWith('11') || suffix.startsWith('13'))) {
    return true;
  }
  return false;
}

export function spellPitchClassForInterval(
  pitchClass: number,
  token: string | undefined,
  preferFlats: boolean
): { en: string; es: string } {
  const pc = ((pitchClass % 12) + 12) % 12;

  if (token) {
    if (token.startsWith('b')) {
      return { en: FLAT_NAMES_EN[pc], es: FLAT_NAMES_ES[pc] };
    }
    if (token.startsWith('#')) {
      return { en: SHARP_NAMES_EN[pc], es: SHARP_NAMES_ES[pc] };
    }
  }

  return preferFlats
    ? { en: FLAT_NAMES_EN[pc], es: FLAT_NAMES_ES[pc] }
    : { en: SHARP_NAMES_EN[pc], es: SHARP_NAMES_ES[pc] };
}

function getInversionLabels(
  rootPc: number,
  bassPc: number,
  tokenInBass: string | undefined
): { inversionEs: string; inversionEn: string; bassBonus: number } {
  if (rootPc === bassPc) {
    return {
      inversionEs: 'Posición Fundamental',
      inversionEn: 'Root Position',
      bassBonus: 48,
    };
  }

  const semi = (bassPc - rootPc + 12) % 12;

  if (semi === 3 || semi === 4 || tokenInBass === '3' || tokenInBass === 'b3') {
    return {
      inversionEs: '1ª Inversión (3ª en el bajo)',
      inversionEn: '1st Inversion (3rd in bass)',
      bassBonus: 18,
    };
  }

  if (semi === 7 || semi === 6 || semi === 8 || tokenInBass === '5' || tokenInBass === 'b5' || tokenInBass === '#5') {
    return {
      inversionEs: '2ª Inversión (5ª en el bajo)',
      inversionEn: '2nd Inversion (5th in bass)',
      bassBonus: 14,
    };
  }

  if (
    semi === 9 ||
    semi === 10 ||
    semi === 11 ||
    tokenInBass === '7' ||
    tokenInBass === 'b7' ||
    tokenInBass === 'bb7' ||
    tokenInBass === '6'
  ) {
    return {
      inversionEs: '3ª Inversión (7ª/6ª en el bajo)',
      inversionEn: '3rd Inversion (7th/6th in bass)',
      bassBonus: 10,
    };
  }

  return {
    inversionEs: `Inversión (${tokenInBass || 'tensión'} en el bajo)`,
    inversionEn: `Inversion (${tokenInBass || 'extension'} in bass)`,
    bassBonus: 2,
  };
}

export class ChordRecognitionEngine {
  public static recognize(
    midiNotes: number[],
    transpose: number = 0
  ): ChordRecognitionResult {
    if (!midiNotes || midiNotes.length === 0) {
      return {
        status: 'empty',
        primary: null,
        alternatives: [],
        playedNotesWithOctaveEs: [],
        playedNotesWithOctaveEn: [],
        pitchClassNamesEs: [],
        pitchClassNamesEn: [],
        bassNoteEs: '--',
        bassNoteEn: '--',
        intervalsBreakdown: [],
      };
    }

    const sortedMidi = [...midiNotes].map((n) => n + transpose).sort((a, b) => a - b);
    const lowestMidi = sortedMidi[0];
    const lowestOctave = Math.floor(lowestMidi / 12) - 1;
    const bassPc = ((lowestMidi % 12) + 12) % 12;

    const distinctPitchClasses: number[] = [];
    for (const midi of sortedMidi) {
      const pc = ((midi % 12) + 12) % 12;
      if (!distinctPitchClasses.includes(pc)) {
        distinctPitchClasses.push(pc);
      }
    }

    const defaultFlats = [1, 3, 5, 8, 10].includes(bassPc);
    const formatMidiNote = (midi: number, useFlats: boolean) => {
      const pc = ((midi % 12) + 12) % 12;
      const oct = Math.floor(midi / 12) - 1;
      return {
        en: `${useFlats ? FLAT_NAMES_EN[pc] : SHARP_NAMES_EN[pc]}${oct}`,
        es: `${useFlats ? FLAT_NAMES_ES[pc] : SHARP_NAMES_ES[pc]}${oct}`,
      };
    };

    const playedNotesWithOctaveEn = sortedMidi.map((m) => formatMidiNote(m, defaultFlats).en);
    const playedNotesWithOctaveEs = sortedMidi.map((m) => formatMidiNote(m, defaultFlats).es);
    const pitchClassNamesEn = distinctPitchClasses.map((pc) =>
      defaultFlats ? FLAT_NAMES_EN[pc] : SHARP_NAMES_EN[pc]
    );
    const pitchClassNamesEs = distinctPitchClasses.map((pc) =>
      defaultFlats ? FLAT_NAMES_ES[pc] : SHARP_NAMES_ES[pc]
    );

    const bassNoteEn = `${defaultFlats ? FLAT_NAMES_EN[bassPc] : SHARP_NAMES_EN[bassPc]}${lowestOctave}`;
    const bassNoteEs = `${defaultFlats ? FLAT_NAMES_ES[bassPc] : SHARP_NAMES_ES[bassPc]}${lowestOctave}`;

    const intervalsBreakdown: IntervalBreakdown[] = [];
    for (let i = 1; i < sortedMidi.length; i++) {
      const diff = sortedMidi[i] - sortedMidi[0];
      const mod = ((diff % 12) + 12) % 12;
      intervalsBreakdown.push({
        fromNote: playedNotesWithOctaveEn[0],
        toNote: playedNotesWithOctaveEn[i],
        semitones: diff,
        intervalNameEn: INTERVAL_NAMES_EN[mod]?.name || `${diff} semitones`,
        intervalNameEs: INTERVAL_NAMES_ES[mod]?.name || `${diff} semitonos`,
        shortName: INTERVAL_NAMES_EN[mod]?.short || `${diff}st`,
      });
    }

    if (distinctPitchClasses.length === 1) {
      const noteLabelEs = defaultFlats ? FLAT_NAMES_ES[bassPc] : SHARP_NAMES_ES[bassPc];
      const noteLabelEn = defaultFlats ? FLAT_NAMES_EN[bassPc] : SHARP_NAMES_EN[bassPc];
      return {
        status: 'insufficient',
        primary: null,
        alternatives: [],
        playedNotesWithOctaveEs,
        playedNotesWithOctaveEn,
        pitchClassNamesEs,
        pitchClassNamesEn,
        bassNoteEs: `${noteLabelEs} (${bassNoteEs})`,
        bassNoteEn: `${noteLabelEn} (${bassNoteEn})`,
        intervalsBreakdown,
        messageEs: `Nota única (${noteLabelEs}): agrega más notas para formar un intervalo o acorde.`,
        messageEn: `Single note (${noteLabelEn}): add more notes to form an interval or chord.`,
      };
    }

    if (distinctPitchClasses.length === 2) {
      const semi = (distinctPitchClasses[1] - distinctPitchClasses[0] + 12) % 12;
      const intEs = INTERVAL_NAMES_ES[semi]?.name || `${semi} semitonos`;
      const intEn = INTERVAL_NAMES_EN[semi]?.name || `${semi} semitones`;
      const shortInt = INTERVAL_NAMES_EN[semi]?.short || `${semi}`;
      const rEs = pitchClassNamesEs[0];
      const rEn = pitchClassNamesEn[0];

      return {
        status: 'interval',
        primary: null,
        alternatives: [],
        playedNotesWithOctaveEs,
        playedNotesWithOctaveEn,
        pitchClassNamesEs,
        pitchClassNamesEn,
        bassNoteEs: `${rEs} (${bassNoteEs})`,
        bassNoteEn: `${rEn} (${bassNoteEn})`,
        intervalsBreakdown,
        messageEs: `Intervalo de ${intEs} (1 – ${shortInt}).`,
        messageEn: `Interval of ${intEn} (1 – ${shortInt}).`,
      };
    }

    // =========================================================================
    // EVALUACIÓN AVANZADA DE CANDIDATOS CON SOPORTE DE TENSIONES Y VOICINGS (9, 11, 13, ALT)
    // =========================================================================
    const candidates: ChordCandidate[] = [];
    const degreesRoman = ['I', 'bII', 'II', 'bIII', 'III', 'IV', 'bV', 'V', 'bVI', 'VI', 'bVII', 'VII'];

    for (const candidateRoot of distinctPitchClasses) {
      const activeIntervals = distinctPitchClasses.map(
        (pc) => (pc - candidateRoot + 12) % 12
      );
      const activeIntervalSet = new Set(activeIntervals);

      for (const def of CHORD_FORMULA_CATALOG) {
        const formulaSet = new Set(def.intervals);

        // Regla A: Todas las notas presionadas deben pertenecer a la fórmula del acorde
        const hasForeignNote = activeIntervals.some((intv) => !formulaSet.has(intv));
        if (hasForeignNote) continue;

        // Regla B: Todos los intervalos esenciales deben estar presentes
        const hasAllEssential = def.essential.every((req) => activeIntervalSet.has(req));
        if (!hasAllEssential) continue;

        // Regla C: Cualquier intervalo omitido debe estar permitido en `def.optional`
        const omittedSemitones = def.intervals.filter((intv) => !activeIntervalSet.has(intv));
        const allOmittedAreOptional = omittedSemitones.every((intv) =>
          def.optional.includes(intv)
        );
        if (!allOmittedAreOptional) continue;

        const omittedTokens = omittedSemitones.map((semi) => {
          const idx = def.intervals.indexOf(semi);
          return idx >= 0 ? def.tokens[idx] : `${semi}`;
        });

        const preferFlats = rootPrefersFlats(candidateRoot, def.suffix);
        const rootSpelled = spellPitchClassForInterval(candidateRoot, '1', preferFlats);

        const bassInterval = (bassPc - candidateRoot + 12) % 12;
        const bassTokenIdx = def.intervals.indexOf(bassInterval);
        const bassToken = bassTokenIdx >= 0 ? def.tokens[bassTokenIdx] : undefined;
        const bassSpelled = spellPitchClassForInterval(bassPc, bassToken, preferFlats);

        const chordNotesEn: string[] = [];
        const chordNotesEs: string[] = [];
        const presentTokens: string[] = [];

        def.intervals.forEach((semi, idx) => {
          if (activeIntervalSet.has(semi)) {
            const pc = (candidateRoot + semi) % 12;
            const tok = def.tokens[idx];
            const sp = spellPitchClassForInterval(pc, tok, preferFlats);
            chordNotesEn.push(sp.en);
            chordNotesEs.push(sp.es);
            presentTokens.push(tok);
          }
        });

        const { inversionEs, inversionEn, bassBonus } = getInversionLabels(
          candidateRoot,
          bassPc,
          bassToken
        );

        // ---------------------------------------------------------------------
        // SISTEMA DE PUNTUACIÓN INTELIGENTE PARA TENSIONES (9, 11, 13, ALT)
        // En el piano, omitir la 5ª ('5') o la 9ª/11ª en acordes de 13ª es el voicing
        // estándar profesional: no debe ser penalizado como si fuera un error!
        // ---------------------------------------------------------------------
        let score = 100;

        if (omittedTokens.length === 0) {
          score += 24;
        } else {
          for (const omTok of omittedTokens) {
            if (omTok === '5') {
              // Omitir la 5ª justa en un acorde de 7ª, 9ª, 11ª o 13ª es práctica estándar (-2 pts)
              score -= 2;
            } else if ((omTok === '9' || omTok === '11') && def.tokens.includes('13')) {
              // En un acorde de 13ª (ej. 1 - 3 - b7 - 13), omitir la 11ª o la 9ª es el voicing más común (-3 pts)
              score -= 3;
            } else if (omTok === '9' && def.tokens.includes('11')) {
              // En un acorde de 11ª (ej. m11: 1 - b3 - b7 - 11), omitir la 9ª es muy común (-4 pts)
              score -= 4;
            } else {
              score -= 14;
            }
          }

          if (candidateRoot !== bassPc) {
            score -= 18;
          }
        }

        // Bonus extra cuando la nota de 13ª, 11ª o 9ª está físicamente en la parte aguda del voicing
        if (def.tokens.includes('13')) {
          const highestMidi = sortedMidi[sortedMidi.length - 1];
          const highestSemiFromRoot = ((highestMidi - candidateRoot) % 12 + 12) % 12;
          if (highestSemiFromRoot === 9) {
            score += 12; // La 13ª brilla en la voz superior (melodía/top note)
          }
        }

        score += bassBonus;
        score -= def.complexity * 3;

        const isSlash = candidateRoot !== bassPc;
        const slashEn = isSlash ? `/${bassSpelled.en}` : '';
        const slashEs = isSlash ? ` / ${bassSpelled.es}` : '';

        // Símbolo principal limpio (ej. "C13", "Cmaj13", "Dm11") sin ensuciarlo con "(no5,no11)"
        const symbolInternational = `${rootSpelled.en}${def.suffix}${slashEn}`;
        const nameEs = `${rootSpelled.es} ${def.nameEs}${slashEs}`;
        const nameEn = `${rootSpelled.en} ${def.nameEn}${slashEn}`;

        const formulaDisplay = presentTokens.join(' – ');
        const rom = degreesRoman[candidateRoot];

        candidates.push({
          symbolInternational,
          nameEs,
          nameEn,
          classificationEs: def.classificationEs,
          classificationEn: def.classificationEn,
          rootEn: rootSpelled.en,
          rootEs: rootSpelled.es,
          bassEn: bassSpelled.en,
          bassEs: bassSpelled.es,
          bassWithOctaveEs: `${bassSpelled.es}${lowestOctave} (${bassSpelled.en}${lowestOctave})`,
          bassWithOctaveEn: `${bassSpelled.en}${lowestOctave} (${bassSpelled.es}${lowestOctave})`,
          chordNotesEs,
          chordNotesEn,
          formula: formulaDisplay,
          inversionEs,
          inversionEn,
          degreeEs: `${rom}${def.suffix}`,
          degreeEn: `${rom}${def.suffix}`,
          omittedIntervals: omittedTokens,
          score,
        });
      }
    }

    candidates.sort((a, b) => b.score - a.score);

    const uniqueCandidates: ChordCandidate[] = [];
    const seenSymbols = new Set<string>();
    for (const c of candidates) {
      if (!seenSymbols.has(c.symbolInternational)) {
        seenSymbols.add(c.symbolInternational);
        uniqueCandidates.push(c);
      }
    }

    if (uniqueCandidates.length === 0) {
      return {
        status: 'unrecognized',
        primary: null,
        alternatives: [],
        playedNotesWithOctaveEs,
        playedNotesWithOctaveEn,
        pitchClassNamesEs,
        pitchClassNamesEn,
        bassNoteEs: `${pitchClassNamesEs[0]} (${bassNoteEs})`,
        bassNoteEn: `${pitchClassNamesEn[0]} (${bassNoteEn})`,
        intervalsBreakdown,
        messageEs: 'Poliacorde o disposición abierta fuera del catálogo estándar.',
        messageEn: 'Polychord or open voicing outside standard catalog.',
      };
    }

    const primary = uniqueCandidates[0];
    const alternatives = uniqueCandidates.slice(1, 5);

    const primaryPreferFlats = rootPrefersFlats(
      distinctPitchClasses.find(
        (pc) =>
          SHARP_NAMES_EN[pc] === primary.rootEn || FLAT_NAMES_EN[pc] === primary.rootEn
      ) ?? bassPc,
      primary.symbolInternational
    );

    const MapPcToChordSpelling = new Map<number, { en: string; es: string }>();
    distinctPitchClasses.forEach((pc) => {
      const idx = primary.chordNotesEn.findIndex((noteName) => {
        const sharpIdx = SHARP_NAMES_EN.indexOf(noteName);
        const flatIdx = FLAT_NAMES_EN.indexOf(noteName);
        return sharpIdx === pc || flatIdx === pc;
      });
      if (idx >= 0) {
        MapPcToChordSpelling.set(pc, {
          en: primary.chordNotesEn[idx],
          es: primary.chordNotesEs[idx],
        });
      } else {
        MapPcToChordSpelling.set(pc, {
          en: primaryPreferFlats ? FLAT_NAMES_EN[pc] : SHARP_NAMES_EN[pc],
          es: primaryPreferFlats ? FLAT_NAMES_ES[pc] : SHARP_NAMES_ES[pc],
        });
      }
    });

    const refinedPlayedEn = sortedMidi.map((m) => {
      const pc = ((m % 12) + 12) % 12;
      const oct = Math.floor(m / 12) - 1;
      const sp = MapPcToChordSpelling.get(pc);
      return `${sp ? sp.en : SHARP_NAMES_EN[pc]}${oct}`;
    });

    const refinedPlayedEs = sortedMidi.map((m) => {
      const pc = ((m % 12) + 12) % 12;
      const oct = Math.floor(m / 12) - 1;
      const sp = MapPcToChordSpelling.get(pc);
      return `${sp ? sp.es : SHARP_NAMES_ES[pc]}${oct}`;
    });

    const refinedPcNamesEn = distinctPitchClasses.map(
      (pc) => MapPcToChordSpelling.get(pc)?.en || SHARP_NAMES_EN[pc]
    );
    const refinedPcNamesEs = distinctPitchClasses.map(
      (pc) => MapPcToChordSpelling.get(pc)?.es || SHARP_NAMES_ES[pc]
    );

    return {
      status: 'recognized',
      primary,
      alternatives,
      playedNotesWithOctaveEs: refinedPlayedEs,
      playedNotesWithOctaveEn: refinedPlayedEn,
      pitchClassNamesEs: refinedPcNamesEs,
      pitchClassNamesEn: refinedPcNamesEn,
      bassNoteEs: primary.bassWithOctaveEs,
      bassNoteEn: primary.bassWithOctaveEn,
      intervalsBreakdown,
    };
  }
}