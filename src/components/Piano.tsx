import React, { useMemo, useRef, useEffect, useCallback } from 'react';
import {
  DegreeDisplayMode,
  KeyCount,
  KeyData,
  Language,
  NamingConvention,
  ScaleAnalysisResult,
  ScaleDisplayMode,
  ScaleNoteInfo,
} from '../types';
import { generatePianoKeys } from '../utils/musicTheory';
import {
  CHROMATIC_DEGREE_LABELS,
  CHROMATIC_INTERVAL_SHORT_EN,
  CHROMATIC_INTERVAL_SHORT_ES,
} from '../utils/ScaleAndHarmonyEngine';

interface PianoProps {
  keyCount: KeyCount;
  onKeyCountChange: (count: KeyCount) => void;
  activeNotes: Set<number>;
  onNoteDown: (midiNote: number) => void;
  onNoteUp: (midiNote: number) => void;
  showNoteNames: boolean;
  namingConvention: NamingConvention;
  showDegrees: boolean;
  showIntervals: boolean;
  octaveShift: number;
  scaleAnalysis?: ScaleAnalysisResult;
  scaleDisplayMode?: ScaleDisplayMode;
  degreeDisplayMode?: DegreeDisplayMode;
  language: Language;
}

export const Piano: React.FC<PianoProps> = ({
  keyCount,
  onKeyCountChange,
  activeNotes,
  onNoteDown,
  onNoteUp,
  showNoteNames,
  namingConvention,
  showDegrees,
  showIntervals,
  octaveShift,
  scaleAnalysis,
  scaleDisplayMode = 'full',
  degreeDisplayMode = 'scale_degrees',
  language,
}) => {
  const isEs = language === 'ES';

  const pointerMap = useRef<Map<number, number>>(new Map());

  const keys = useMemo(() => {
    return generatePianoKeys(keyCount, octaveShift);
  }, [keyCount, octaveShift]);

  const { whiteKeys, blackKeys, totalWhiteCount } = useMemo(() => {
    const whites: (KeyData & { whiteIndex: number; effectiveMidi: number })[] = [];
    const blacks: (KeyData & {
      precedingWhiteIndex: number;
      offsetFraction: number;
      effectiveMidi: number;
    })[] = [];

    let currentWhiteIndex = 0;

    keys.forEach((key) => {
      const effectiveMidi = Math.max(
        0,
        Math.min(127, key.midiNote + octaveShift * 12)
      );

      if (!key.isBlack) {
        whites.push({
          ...key,
          effectiveMidi,
          whiteIndex: currentWhiteIndex,
        });
        currentWhiteIndex++;
      } else {
        const pitchMod = ((key.midiNote % 12) + 12) % 12;
        let offset = 0.0;
        if (pitchMod === 1) offset = -0.06; // C#
        else if (pitchMod === 3) offset = 0.06; // D#
        else if (pitchMod === 6) offset = -0.08; // F#
        else if (pitchMod === 8) offset = 0.0; // G#
        else if (pitchMod === 10) offset = 0.08; // A#

        blacks.push({
          ...key,
          effectiveMidi,
          precedingWhiteIndex: currentWhiteIndex - 1,
          offsetFraction: offset,
        });
      }
    });

    return {
      whiteKeys: whites,
      blackKeys: blacks,
      totalWhiteCount: currentWhiteIndex,
    };
  }, [keys, octaveShift]);

  useEffect(() => {
    const handleGlobalPointerUp = (e: PointerEvent) => {
      const activeMidi = pointerMap.current.get(e.pointerId);
      if (activeMidi !== undefined) {
        onNoteUp(activeMidi);
        pointerMap.current.delete(e.pointerId);
      }
    };

    const handleGlobalPointerCancel = (e: PointerEvent) => {
      const activeMidi = pointerMap.current.get(e.pointerId);
      if (activeMidi !== undefined) {
        onNoteUp(activeMidi);
        pointerMap.current.delete(e.pointerId);
      }
    };

    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerCancel);

    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerCancel);
    };
  }, [onNoteUp]);

  const handleKeyPointerDown = useCallback(
    (e: React.PointerEvent, midiNote: number) => {
      e.preventDefault();
      const prev = pointerMap.current.get(e.pointerId);
      if (prev !== undefined && prev !== midiNote) {
        onNoteUp(prev);
      }
      pointerMap.current.set(e.pointerId, midiNote);
      onNoteDown(midiNote);
    },
    [onNoteDown, onNoteUp]
  );

  const handleKeyPointerUp = useCallback(
    (e: React.PointerEvent, midiNote: number) => {
      e.preventDefault();
      const mapped = pointerMap.current.get(e.pointerId) ?? midiNote;
      onNoteUp(mapped);
      pointerMap.current.delete(e.pointerId);
    },
    [onNoteUp]
  );

  const handleKeyPointerLeave = useCallback(
    (e: React.PointerEvent, midiNote: number) => {
      if (pointerMap.current.get(e.pointerId) === midiNote) {
        onNoteUp(midiNote);
        pointerMap.current.delete(e.pointerId);
      }
    },
    [onNoteUp]
  );

  const handleKeyPointerEnter = useCallback(
    (e: React.PointerEvent, midiNote: number) => {
      if (e.buttons === 1) {
        const prev = pointerMap.current.get(e.pointerId);
        if (prev !== undefined && prev !== midiNote) {
          onNoteUp(prev);
        }
        pointerMap.current.set(e.pointerId, midiNote);
        onNoteDown(midiNote);
      }
    },
    [onNoteDown, onNoteUp]
  );

  const getKeyScaleInfo = (effectiveMidi: number): ScaleNoteInfo | null => {
    if (!scaleAnalysis || scaleDisplayMode === 'hidden') return null;
    const pc = ((effectiveMidi % 12) + 12) % 12;
    const info = scaleAnalysis.pitchClassMap.get(pc) || null;
    if (!info) return null;
    if (scaleDisplayMode === 'tonic_only' && info.role !== 'tonic') return null;
    return info;
  };

  const getNoteBadgeText = (key: KeyData & { effectiveMidi: number }) => {
    const isSolfege = namingConvention === 'solfege';
    const pc = ((key.effectiveMidi % 12) + 12) % 12;
    if (scaleAnalysis && scaleAnalysis.pitchClassMap.has(pc)) {
      const scNote = scaleAnalysis.pitchClassMap.get(pc)!;
      return isSolfege ? scNote.noteEs : scNote.noteEn;
    }
    return isSolfege ? key.pitchNameEs : key.pitchNameEn;
  };

  const getKeyTheorySubLabel = (
    effectiveMidi: number,
    scInfo: ScaleNoteInfo | null
  ): string | null => {
    if (!showDegrees && !showIntervals) return null;
    if (!scaleAnalysis) return null;

    const pc = ((effectiveMidi % 12) + 12) % 12;
    const semiFromTonic = (pc - scaleAnalysis.rootPc + 12) % 12;

    const parts: string[] = [];

    if (showDegrees) {
      if (degreeDisplayMode === 'chromatic_degrees') {
        parts.push(CHROMATIC_DEGREE_LABELS[semiFromTonic]);
      } else if (scInfo) {
        parts.push(scInfo.degreeFormula);
      }
    }

    if (showIntervals) {
      if (scInfo) {
        parts.push(isEs ? scInfo.intervalShortEs : scInfo.intervalShortEn);
      } else if (degreeDisplayMode === 'chromatic_degrees') {
        parts.push(
          isEs
            ? CHROMATIC_INTERVAL_SHORT_ES[semiFromTonic]
            : CHROMATIC_INTERVAL_SHORT_EN[semiFromTonic]
        );
      }
    }

    return parts.length > 0 ? parts.join('·') : null;
  };

  const availableKeyCounts: KeyCount[] = [25, 49, 61, 76, 88];

  return (
    <section className="w-full bg-[#111217] rounded-xl pt-1 flex flex-col select-none">
      {/* Top Piano Case Header & Key Count Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between pb-2.5 mb-2 gap-2 border-b border-[#1c1e28] px-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f25100] shadow-[0_0_8px_#f25100]" />
            <span className="text-xs font-extrabold tracking-wider text-white uppercase font-sans">
              {isEs
                ? 'TECLADO DE PIANO INTERACTIVO'
                : 'INTERACTIVE PIANO KEYBOARD'}
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 font-medium">
            {keyCount} {isEs ? 'teclas' : 'keys'} (MIDI{' '}
            {keys[0]?.midiNote + octaveShift * 12} –{' '}
            {keys[keys.length - 1]?.midiNote + octaveShift * 12})
          </span>
          {scaleAnalysis && scaleDisplayMode !== 'hidden' && (
            <span className="text-[11px] font-mono font-extrabold px-2.5 py-0.5 rounded-lg bg-[#161720] border border-[#252736] text-[#f25100]">
              {scaleDisplayMode === 'tonic_only'
                ? isEs
                  ? `Tónica: ${scaleAnalysis.rootNameEs}`
                  : `Tonic: ${scaleAnalysis.rootNameEn}`
                : isEs
                ? `Escala: ${scaleAnalysis.scaleNameEs}`
                : `Scale: ${scaleAnalysis.scaleNameEn}`}
            </span>
          )}
        </div>

        {/* Right: Key Count Selector (25, 49, 61, 76, 88) */}
        <div className="flex items-center gap-1 bg-[#161720] p-0.5 rounded-xl border border-[#242634]">
          <span className="text-[10px] uppercase font-bold text-zinc-400 px-2">
            {isEs ? 'Teclas:' : 'Keys:'}
          </span>
          {availableKeyCounts.map((count) => {
            const isActive = keyCount === count;
            return (
              <button
                key={count}
                type="button"
                onClick={() => onKeyCountChange(count)}
                className={`px-2.5 py-1 text-xs font-extrabold rounded-lg transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#f25100] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#20222f]'
                }`}
              >
                {count}
              </button>
            );
          })}
        </div>
      </div>

      {/* Piano Instrument Enclosure */}
      <div className="w-full overflow-x-auto pb-1 touch-none">
        <div
          className="relative mx-auto rounded-xl overflow-hidden border border-[#232534] bg-[#0c0d12] shadow-2xl"
          style={{
            minWidth:
              keyCount === 88
                ? '1080px'
                : keyCount === 76
                ? '960px'
                : keyCount === 61
                ? '820px'
                : '100%',
          }}
        >
          {/* Acoustic Orange/Red Felt Strip at Key Roots */}
          <div className="w-full h-1.5 bg-gradient-to-r from-[#b91c1c] via-[#f25100] to-[#b91c1c] border-b border-black/50" />

          {/* Interactive Keyboard Canvas */}
          <div className="relative w-full h-[195px] sm:h-[215px] md:h-[225px] bg-[#0c0d12] touch-none">
            {/* White Keys Layer (Fondo blanco permanente sin transiciones que dejen la tecla negra al soltar) */}
            {whiteKeys.map((key) => {
              const isActive = activeNotes.has(key.effectiveMidi);
              const scInfo = getKeyScaleInfo(key.effectiveMidi);
              const isTonic = scInfo?.role === 'tonic';
              const widthPct = (1 / totalWhiteCount) * 100;
              const leftPct = (key.whiteIndex / totalWhiteCount) * 100;
              const badgeText = getNoteBadgeText(key);
              const theoryLabel = getKeyTheorySubLabel(
                key.effectiveMidi,
                scInfo
              );

              return (
                <div
                  key={key.midiNote}
                  onPointerDown={(e) =>
                    handleKeyPointerDown(e, key.effectiveMidi)
                  }
                  onPointerUp={(e) => handleKeyPointerUp(e, key.effectiveMidi)}
                  onPointerLeave={(e) =>
                    handleKeyPointerLeave(e, key.effectiveMidi)
                  }
                  onPointerEnter={(e) =>
                    handleKeyPointerEnter(e, key.effectiveMidi)
                  }
                  onPointerCancel={(e) =>
                    handleKeyPointerUp(e, key.effectiveMidi)
                  }
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    background: isActive
                      ? 'linear-gradient(180deg, #ff7733 0%, #f25100 55%, #d64200 100%)'
                      : 'linear-gradient(180deg, #ffffff 0%, #f8f8fa 88%, #e4e4e7 100%)',
                    boxShadow: isActive
                      ? 'inset 0 0 12px rgba(255,255,255,0.35)'
                      : 'inset 0 -4px 0 rgba(0,0,0,0.08)',
                  }}
                  className={`absolute top-0 bottom-0 cursor-pointer rounded-b-md border-r flex flex-col justify-end items-center pb-2 select-none overflow-hidden transition-none ${
                    isActive ? 'border-[#9a2e00] z-10' : 'border-[#d4d4d8]'
                  }`}
                >
                  {/* Subtle hairline right border */}
                  <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-black/15 z-10 pointer-events-none" />

                  {/* Indicador de Escala (Solo Naranja para Tónica y Grafito Oscuro para notas diatónicas) */}
                  {!isActive && scInfo && (
                    <div
                      className={`relative z-10 mb-1 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold font-mono leading-none shadow-sm ${
                        isTonic
                          ? 'bg-[#f25100] text-white ring-2 ring-[#f25100]/40'
                          : 'bg-[#181922] text-white border border-[#2c3040]'
                      }`}
                    >
                      {showNoteNames ? badgeText : scInfo.degreeFormula}
                    </div>
                  )}

                  {/* Medallón Blanco de Alto Contraste sobre la Tecla Naranja cuando está activa */}
                  {isActive && (
                    <div className="relative z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-[#f25100] shadow-lg flex items-center justify-center text-[11px] sm:text-xs font-black leading-none mb-0.5">
                      {badgeText}
                    </div>
                  )}

                  {/* Sub-etiqueta de Grado / Intervalo en la Tecla */}
                  {theoryLabel && (
                    <span
                      className={`relative z-10 text-[9px] font-mono font-extrabold leading-tight mt-0.5 ${
                        isActive
                          ? 'text-white'
                          : isTonic
                          ? 'text-[#f25100]'
                          : scInfo
                          ? 'text-zinc-700'
                          : 'text-zinc-400'
                      }`}
                    >
                      {theoryLabel}
                    </span>
                  )}

                  {/* Nombre de la nota cuando no pertenece a la escala */}
                  {!isActive && !scInfo && showNoteNames && (
                    <span className="relative z-10 text-[10px] font-semibold text-zinc-400 font-mono">
                      {badgeText}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Black Keys Layer */}
            {blackKeys.map((key) => {
              const isActive = activeNotes.has(key.effectiveMidi);
              const scInfo = getKeyScaleInfo(key.effectiveMidi);
              const isTonic = scInfo?.role === 'tonic';
              const blackWidth = (0.64 / totalWhiteCount) * 100;
              const centerSeam =
                ((key.precedingWhiteIndex + 1 + key.offsetFraction) /
                  totalWhiteCount) *
                100;
              const leftPct = centerSeam - blackWidth / 2;
              const badgeText = getNoteBadgeText(key);
              const theoryLabel = getKeyTheorySubLabel(
                key.effectiveMidi,
                scInfo
              );

              return (
                <div
                  key={key.midiNote}
                  onPointerDown={(e) =>
                    handleKeyPointerDown(e, key.effectiveMidi)
                  }
                  onPointerUp={(e) => handleKeyPointerUp(e, key.effectiveMidi)}
                  onPointerLeave={(e) =>
                    handleKeyPointerLeave(e, key.effectiveMidi)
                  }
                  onPointerEnter={(e) =>
                    handleKeyPointerEnter(e, key.effectiveMidi)
                  }
                  onPointerCancel={(e) =>
                    handleKeyPointerUp(e, key.effectiveMidi)
                  }
                  style={{
                    left: `${leftPct}%`,
                    width: `${blackWidth}%`,
                    height: '62%',
                    background: isActive
                      ? 'linear-gradient(180deg, #ff8547 0%, #f25100 70%, #b83700 100%)'
                      : 'linear-gradient(180deg, #272832 0%, #15161c 75%, #090a0d 100%)',
                    boxShadow: isActive
                      ? '0 4px 14px rgba(242,81,0,0.85), inset 0 1px 5px rgba(255,255,255,0.45)'
                      : '0 4px 6px rgba(0,0,0,0.5), inset 0 -3px 0 rgba(255,255,255,0.06)',
                  }}
                  className={`absolute top-0 z-20 cursor-pointer rounded-b-[5px] border-x border-b flex flex-col justify-end items-center pb-1.5 select-none overflow-hidden transition-none ${
                    isActive ? 'border-[#ff9d6b]' : 'border-[#272832]'
                  }`}
                >
                  {/* Indicador de Escala en Tecla Negra (Naranja para Tónica, Grafito para Diatónica) */}
                  {!isActive && scInfo && (
                    <div
                      className={`relative z-10 mb-0.5 px-1 py-0.5 rounded-md text-[8px] font-extrabold font-mono leading-none shadow ${
                        isTonic
                          ? 'bg-[#f25100] text-white ring-1 ring-white/50'
                          : 'bg-[#252836] text-zinc-100 border border-zinc-600/60'
                      }`}
                    >
                      {showNoteNames ? badgeText : scInfo.degreeFormula}
                    </div>
                  )}

                  {/* Medallón en tecla negra activa */}
                  {isActive && (
                    <div className="relative z-10 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white text-[#f25100] flex items-center justify-center text-[9px] sm:text-[10px] font-black leading-none shadow-md">
                      {badgeText}
                    </div>
                  )}

                  {/* Sub-etiqueta de Grado / Intervalo en Tecla Negra */}
                  {theoryLabel && (
                    <span
                      className={`relative z-10 text-[8px] font-mono font-extrabold leading-none mt-0.5 ${
                        isActive
                          ? 'text-white'
                          : isTonic
                          ? 'text-[#ff7b3d]'
                          : scInfo
                          ? 'text-zinc-300'
                          : 'text-zinc-500'
                      }`}
                    >
                      {theoryLabel}
                    </span>
                  )}

                  {!isActive && !scInfo && showNoteNames && (
                    <span className="relative z-10 text-[8px] sm:text-[9px] font-bold font-mono text-zinc-500">
                      {badgeText}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom keybed dark lip */}
          <div className="w-full h-2.5 bg-gradient-to-b from-[#111218] to-[#070709] border-t border-[#1d1f2b]" />
        </div>
      </div>
    </section>
  );
};