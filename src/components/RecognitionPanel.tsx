import React, { useMemo, useState } from 'react';
import {
  Music,
  Hash,
  Layers,
  GitCommit,
  MoveHorizontal,
  ArrowUpRight,
} from 'lucide-react';
import { Language, ScaleAnalysisResult } from '../types';
import { ChordRecognitionEngine } from '../utils/ChordRecognitionEngine';
import { ScaleAndHarmonyEngine } from '../utils/ScaleAndHarmonyEngine';
import { NoteOrderEntry } from '../utils/useNoteState';

interface RecognitionPanelProps {
  activeNotes: Set<number>;
  sustainedNotes?: Set<number>;
  noteOrder?: NoteOrderEntry[];
  sustainActive?: boolean;
  lastVelocity?: number | null;
  transpose?: number;
  scaleAnalysis?: ScaleAnalysisResult;
  language: Language;
  onTestNote?: (midiNote: number) => void;
  onTestChord?: (notes: number[]) => void;
}

export const RecognitionPanel: React.FC<RecognitionPanelProps> = ({
  activeNotes,
  sustainedNotes = new Set(),
  noteOrder = [],
  sustainActive = false,
  lastVelocity = null,
  transpose = 0,
  scaleAnalysis,
  language,
}) => {
  const isEs = language === 'ES';
  const [enharmonicMode, setEnharmonicMode] = useState<'scale' | 'sharp' | 'flat'>('scale');

  const effectiveHarmonicNotes = useMemo(() => {
    const combined = new Set<number>(activeNotes);
    sustainedNotes.forEach((n) => combined.add(n));
    return Array.from(combined).sort((a, b) => a - b);
  }, [activeNotes, sustainedNotes]);

  const recognition = useMemo(() => {
    return ChordRecognitionEngine.recognize(effectiveHarmonicNotes, transpose);
  }, [effectiveHarmonicNotes, transpose]);

  const twoNoteInterval = useMemo(() => {
    if (effectiveHarmonicNotes.length !== 2 || !scaleAnalysis) return null;
    const transposedNotes = effectiveHarmonicNotes.map((n) => n + transpose);
    const transposedOrder = noteOrder.map((e) => ({
      midiNote: e.midiNote + transpose,
      timestamp: e.timestamp,
    }));
    return ScaleAndHarmonyEngine.analyzeTwoNoteInterval(
      transposedNotes,
      transposedOrder,
      scaleAnalysis,
      enharmonicMode
    );
  }, [effectiveHarmonicNotes, noteOrder, scaleAnalysis, transpose, enharmonicMode]);

  const matchedDiatonicFunction = useMemo(() => {
    if (!recognition.primary || !scaleAnalysis) return null;
    const primaryRoot = recognition.primary.rootEn;
    return (
      scaleAnalysis.diatonicChords.find((dc) => dc.chordNotesEn[0] === primaryRoot) || null
    );
  }, [recognition.primary, scaleAnalysis]);

  const primary = recognition.primary;

  return (
    <div className="w-full bg-[#14151c] border border-[#252836] rounded-xl px-3.5 py-2 select-none">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
        
        {/* 1. PANTALLA DE ACORDE / INTERVALO DETECTADO (4 cols - Altura fija estricta h-[60px]) */}
        <div className="md:col-span-4 flex items-center justify-between gap-3 bg-[#0d0e13] border border-[#222432] rounded-xl px-3.5 h-[60px] overflow-hidden">
          <div className="flex items-center gap-3 min-w-0 w-full">
            <div className="w-8 h-8 rounded-lg bg-[#f25100]/15 border border-[#f25100]/40 flex items-center justify-center shrink-0">
              <Music className="w-4 h-4 text-[#f25100]" />
            </div>

            {recognition.status === 'empty' && (
              <div className="truncate min-w-0 flex-1">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 leading-tight">
                  {isEs ? 'ACORDE DETECTADO' : 'DETECTED CHORD'}
                </div>
                <div className="text-sm font-mono font-bold text-zinc-500 truncate leading-tight mt-0.5">
                  {isEs ? 'Toca el teclado...' : 'Play keys...'}
                </div>
              </div>
            )}

            {twoNoteInterval && (
              <div className="truncate min-w-0 flex-1">
                <div className="flex items-center gap-2 leading-tight">
                  <span className="text-base font-black text-white truncate">
                    {isEs ? twoNoteInterval.intervalNameEs : twoNoteInterval.intervalNameEn}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#181a24] text-white border border-[#2c3040] shrink-0">
                    {isEs ? twoNoteInterval.shortNameEs : twoNoteInterval.shortNameEn} · {twoNoteInterval.semitones}st
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 truncate leading-tight mt-0.5">
                  {isEs ? twoNoteInterval.diatonicDistanceEs : twoNoteInterval.diatonicDistanceEn}
                </div>
              </div>
            )}

            {!twoNoteInterval && recognition.status === 'recognized' && primary && (
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono leading-none shrink-0">
                  {primary.symbolInternational}
                </span>
                <div className="truncate min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 leading-tight">
                    <span className="text-xs font-extrabold text-zinc-100 truncate">
                      {isEs ? primary.nameEs : primary.nameEn}
                    </span>
                    <span className="text-[10px] font-mono font-extrabold px-1.5 rounded bg-[#f25100]/20 text-[#f25100] border border-[#f25100]/40 shrink-0">
                      {matchedDiatonicFunction ? matchedDiatonicFunction.romanNumeral : primary.degreeEs}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#f25100] font-semibold truncate leading-tight mt-0.5">
                    {isEs ? primary.classificationEs : primary.classificationEn}
                  </div>
                </div>
              </div>
            )}

            {!twoNoteInterval &&
              (recognition.status === 'insufficient' || recognition.status === 'unrecognized') && (
                <div className="truncate min-w-0 flex-1">
                  <div className="text-sm font-extrabold text-white font-mono truncate leading-tight">
                    {isEs
                      ? recognition.pitchClassNamesEs.join(' – ')
                      : recognition.pitchClassNamesEn.join(' – ')}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate leading-tight mt-0.5">
                    {isEs ? recognition.messageEs : recognition.messageEn}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* 2. NOTAS ACTIVAS EN EL TECLADO (3 cols - Altura fija estricta h-[60px]) */}
        <div className="md:col-span-3 bg-[#0d0e13] border border-[#222432] rounded-xl px-3 h-[60px] flex flex-col justify-center overflow-hidden">
          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 h-4 shrink-0">
            <span className="flex items-center gap-1 truncate">
              <Hash className="w-3 h-3 text-[#f25100] shrink-0" />
              {isEs ? 'NOTAS EN TECLADO' : 'ACTIVE NOTES'}
            </span>
            {twoNoteInterval ? (
              <div className="flex items-center gap-0.5 bg-[#1b1d28] px-1 rounded border border-[#2b2e40] text-[9px] font-mono shrink-0">
                {(['scale', 'sharp', 'flat'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setEnharmonicMode(m)}
                    className={`px-1 rounded cursor-pointer ${
                      enharmonicMode === m ? 'bg-[#f25100] text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {m === 'scale' ? (isEs ? 'Esc' : 'Scl') : m === 'sharp' ? '#' : 'b'}
                  </button>
                ))}
              </div>
            ) : (
              <span className="font-mono text-zinc-500 shrink-0">
                {lastVelocity !== null && lastVelocity > 0 ? `VEL ${lastVelocity}` : ''}
                {sustainActive ? ' · SUS' : ''}
              </span>
            )}
          </div>

          <div className="h-6 flex items-center overflow-hidden mt-0.5">
            {twoNoteInterval ? (
              <div className="flex items-center justify-between w-full text-xs font-mono font-extrabold text-white truncate">
                <span className="truncate">
                  {isEs
                    ? `${twoNoteInterval.fromNoteEs} → ${twoNoteInterval.toNoteEs}`
                    : `${twoNoteInterval.fromNoteEn} → ${twoNoteInterval.toNoteEn}`}
                </span>
                <span className="text-[10px] text-white flex items-center gap-0.5 shrink-0 ml-1">
                  <ArrowUpRight className="w-3 h-3 text-[#f25100]" />
                  {isEs ? twoNoteInterval.directionLabelEs : twoNoteInterval.directionLabelEn}
                </span>
              </div>
            ) : effectiveHarmonicNotes.length > 0 ? (
              <div className="flex flex-nowrap gap-1 items-center overflow-x-auto scrollbar-none w-full">
                {(isEs
                  ? recognition.playedNotesWithOctaveEs
                  : recognition.playedNotesWithOctaveEn
                ).map((note, index) => (
                  <span
                    key={`active-${index}`}
                    className="inline-flex items-center justify-center font-extrabold text-[11px] h-5 px-2 rounded bg-[#f25100]/20 text-[#f25100] border border-[#f25100]/40 shrink-0 leading-none"
                  >
                    {note}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-xs font-mono text-zinc-600 leading-none">-- – -- – --</div>
            )}
          </div>
        </div>

        {/* 3. FÓRMULA, INVERSIÓN Y FUNCIÓN (5 cols - Altura fija estricta h-[60px]) */}
        <div className="md:col-span-5 grid grid-cols-3 gap-2">
          
          {/* FÓRMULA */}
          <div className="bg-[#0d0e13] border border-[#222432] rounded-xl px-2.5 h-[60px] flex flex-col justify-center overflow-hidden">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1 h-4">
              <MoveHorizontal className="w-3 h-3 text-[#f25100] shrink-0" />
              {isEs ? 'FÓRMULA' : 'FORMULA'}
            </span>
            <div className="font-mono text-xs sm:text-sm font-black text-white h-5 flex items-center truncate mt-0.5">
              {twoNoteInterval
                ? isEs
                  ? `1 – ${twoNoteInterval.shortNameEs}`
                  : `1 – ${twoNoteInterval.shortNameEn}`
                : recognition.status === 'recognized' && primary
                ? primary.formula
                : '--'}
            </div>
          </div>

          {/* INVERSIÓN Y BAJO */}
          <div className="bg-[#0d0e13] border border-[#222432] rounded-xl px-2.5 h-[60px] flex flex-col justify-center overflow-hidden">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1 h-4">
              <Layers className="w-3 h-3 text-[#f25100] shrink-0" />
              {isEs ? 'INVERSIÓN' : 'INVERSION'}
            </span>
            <div className="font-bold text-xs text-[#f25100] h-5 flex items-center truncate mt-0.5">
              {effectiveHarmonicNotes.length > 0
                ? recognition.status === 'recognized' && primary
                  ? isEs
                    ? primary.inversionEs
                    : primary.inversionEn
                  : isEs
                  ? `Bajo: ${recognition.bassNoteEs}`
                  : `Bass: ${recognition.bassNoteEn}`
                : '--'}
            </div>
          </div>

          {/* FUNCIÓN TONAL */}
          <div className="bg-[#0d0e13] border border-[#222432] rounded-xl px-2.5 h-[60px] flex flex-col justify-center overflow-hidden">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1 h-4">
              <GitCommit className="w-3 h-3 text-[#f25100] shrink-0" />
              {isEs ? 'FUNCIÓN' : 'FUNCTION'}
            </span>
            <div className="text-xs font-mono font-black text-white h-5 flex items-center truncate mt-0.5">
              {recognition.status === 'recognized' && primary
                ? matchedDiatonicFunction
                  ? `${matchedDiatonicFunction.romanNumeral} (${
                      isEs
                        ? matchedDiatonicFunction.tonalFunctionEs
                        : matchedDiatonicFunction.tonalFunctionEn
                    })`
                  : isEs
                  ? primary.degreeEs
                  : primary.degreeEn
                : '--'}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};