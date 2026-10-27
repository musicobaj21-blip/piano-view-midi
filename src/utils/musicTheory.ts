import { KeyCount, KeyData, Language } from '../types';

export const PITCH_NAMES_EN = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const PITCH_NAMES_ES = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];

export const INTERVAL_NAMES_ES: Record<number, { name: string; short: string }> = {
  0: { name: 'Unísono / Tónica', short: 'T' },
  1: { name: 'Segunda menor', short: '2m' },
  2: { name: 'Segunda mayor', short: '2M' },
  3: { name: 'Tercera menor', short: '3m' },
  4: { name: 'Tercera mayor', short: '3M' },
  5: { name: 'Cuarta justa', short: '4J' },
  6: { name: 'Tritono / 5ª disminuida', short: 'b5' },
  7: { name: 'Quinta justa', short: '5J' },
  8: { name: 'Quinta aumentada / 6ª menor', short: '#5' },
  9: { name: 'Sexta mayor', short: '6M' },
  10: { name: 'Séptima menor', short: '7m' },
  11: { name: 'Séptima mayor', short: '7M' },
  12: { name: 'Octava justa', short: '8J' },
  13: { name: 'Novena menor', short: 'b9' },
  14: { name: 'Novena mayor', short: '9' },
};

export const INTERVAL_NAMES_EN: Record<number, { name: string; short: string }> = {
  0: { name: 'Unison / Root', short: 'R' },
  1: { name: 'Minor 2nd', short: 'b2' },
  2: { name: 'Major 2nd', short: '2' },
  3: { name: 'Minor 3rd', short: 'b3' },
  4: { name: 'Major 3rd', short: '3' },
  5: { name: 'Perfect 4th', short: '4' },
  6: { name: 'Tritone / Flat 5th', short: 'b5' },
  7: { name: 'Perfect 5th', short: '5' },
  8: { name: 'Minor 6th / Sharp 5th', short: '#5' },
  9: { name: 'Major 6th', short: '6' },
  10: { name: 'Minor 7th', short: 'b7' },
  11: { name: 'Major 7th', short: '7' },
  12: { name: 'Perfect Octave', short: '8' },
  13: { name: 'Minor 9th', short: 'b9' },
  14: { name: 'Major 9th', short: '9' },
};

// Generates piano keys depending on the chosen key count:
// 25 keys: C3 (48) to C5 (72)
// 49 keys: C2 (36) to C6 (84)
// 61 keys: C2 (36) to C7 (96)
// 76 keys: E1 (28) to G7 (103)
// 88 keys: A0 (21) to C8 (108)
export function getKeyboardRange(keyCount: KeyCount): { startNote: number; endNote: number } {
  switch (keyCount) {
    case 25:
      return { startNote: 48, endNote: 72 };
    case 49:
      return { startNote: 36, endNote: 84 };
    case 61:
      return { startNote: 36, endNote: 96 };
    case 76:
      return { startNote: 28, endNote: 103 };
    case 88:
    default:
      return { startNote: 21, endNote: 108 };
  }
}

export function formatActiveNotes(midiNotes: number[], language: Language): string[] {
  const sorted = [...midiNotes].sort((a, b) => a - b);
  return sorted.map((n) => {
    const p = ((n % 12) + 12) % 12;
    const oct = Math.floor(n / 12) - 1;
    return language === 'ES' ? `${PITCH_NAMES_ES[p]}${oct}` : `${PITCH_NAMES_EN[p]}${oct}`;
  });
}

export function generatePianoKeys(keyCount: KeyCount, octaveShift: number = 0): KeyData[] {
  const { startNote, endNote } = getKeyboardRange(keyCount);
  const keys: KeyData[] = [];

  for (let note = startNote; note <= endNote; note++) {
    const effectiveNote = note + (octaveShift * 12);
    const pitchIndex = ((effectiveNote % 12) + 12) % 12;
    const octave = Math.floor(effectiveNote / 12) - 1;
    const isBlack = [1, 3, 6, 8, 10].includes(pitchIndex);
    const frequency = 440 * Math.pow(2, (effectiveNote - 69) / 12);

    const pitchNameEn = PITCH_NAMES_EN[pitchIndex];
    const pitchNameEs = PITCH_NAMES_ES[pitchIndex];

    keys.push({
      midiNote: note,
      pitchNameEn,
      pitchNameEs,
      octave,
      isBlack,
      frequency,
      labelEn: `${pitchNameEn}${octave}`,
      labelEs: `${pitchNameEs}${octave}`,
    });
  }

  return keys;
}

