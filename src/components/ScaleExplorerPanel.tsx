import React from 'react';
import {
  Compass,
  Eye,
  EyeOff,
  Target,
  Play,
  GitCommit,
  MoveHorizontal,
  Layers,
} from 'lucide-react';
import {
  DegreeDisplayMode,
  Language,
  ScaleAnalysisResult,
  ScaleDisplayMode,
  ScaleId,
} from '../types';
import {
  CHROMATIC_DEGREE_LABELS,
  CHROMATIC_INTERVAL_SHORT_EN,
  CHROMATIC_INTERVAL_SHORT_ES,
  ROOT_OPTIONS,
  SCALE_CATALOG,
} from '../utils/ScaleAndHarmonyEngine';

interface ScaleExplorerPanelProps {
  scaleRootPc: number;
  onChangeScaleRoot: (pc: number) => void;
  selectedScaleId: ScaleId;
  onChangeScaleId: (id: ScaleId) => void;
  scaleDisplayMode: ScaleDisplayMode;
  onChangeScaleDisplayMode: (mode: ScaleDisplayMode) => void;
  degreeDisplayMode: DegreeDisplayMode;
  onChangeDegreeDisplayMode: (mode: DegreeDisplayMode) => void;
  showDegrees: boolean;
  onToggleDegrees: () => void;
  showIntervals: boolean;
  onToggleIntervals: () => void;
  scaleAnalysis: ScaleAnalysisResult;
  onPlayScale: () => void;
  onAuditionNotes: (notes: number[], sequential?: boolean) => void;
  language: Language;
}

export const ScaleExplorerPanel: React.FC<ScaleExplorerPanelProps> = ({
  scaleRootPc,
  onChangeScaleRoot,
  selectedScaleId,
  onChangeScaleId,
  scaleDisplayMode,
  onChangeScaleDisplayMode,
  degreeDisplayMode,
  onChangeDegreeDisplayMode,
  showDegrees,
  onToggleDegrees,
  showIntervals,
  onToggleIntervals,
  scaleAnalysis,
  onPlayScale,
  onAuditionNotes,
  language,
}) => {
  const isEs = language === 'ES';

  return (
    <section className="w-full bg-[#111217] border border-[#1e202b] rounded-2xl p-3.5 shadow-xl select-none">
      
      {/* Barra Superior minimalista unificada con Guitar Chords Pro (Solo Naranja, Blanco y Grafito) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#1c1e28]">
        
        {/* Izquierda: Selectores directos de Tónica, Escala y Botón Play */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#181922] border border-[#242634] flex items-center justify-center text-[#f25100]">
            <Compass className="w-4 h-4 text-[#f25100]" />
          </div>

          {/* Selector de Tónica */}
          <div className="flex items-center bg-[#161720] border border-[#252736] rounded-xl px-3 py-1 gap-2 h-8">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
              {isEs ? 'TÓNICA' : 'ROOT'}
            </span>
            <select
              aria-label={isEs ? 'Seleccionar tónica' : 'Select root'}
              value={scaleRootPc}
              onChange={(e) => onChangeScaleRoot(Number(e.target.value))}
              className="bg-transparent text-xs font-extrabold text-[#f25100] outline-none cursor-pointer"
            >
              {ROOT_OPTIONS.map((r) => (
                <option key={r.pc} value={r.pc} className="bg-[#121318] text-white">
                  {isEs ? `${r.labelEs} (${r.labelEn})` : `${r.labelEn} (${r.labelEs})`}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Escala */}
          <div className="flex items-center bg-[#161720] border border-[#252736] rounded-xl px-3 py-1 gap-2 h-8">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
              {isEs ? 'ESCALA' : 'SCALE'}
            </span>
            <select
              aria-label={isEs ? 'Seleccionar escala' : 'Select scale'}
              value={selectedScaleId}
              onChange={(e) => {
                onChangeScaleId(e.target.value as ScaleId);
                if (scaleDisplayMode === 'hidden') {
                  onChangeScaleDisplayMode('full');
                }
              }}
              className="bg-transparent text-xs font-extrabold text-white outline-none cursor-pointer"
            >
              {SCALE_CATALOG.map((sc) => (
                <option key={sc.id} value={sc.id} className="bg-[#121318] text-white">
                  {isEs ? sc.nameEs : sc.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Botón Escuchar Escala */}
          <button
            type="button"
            onClick={onPlayScale}
            title={isEs ? 'Escuchar escala en el piano' : 'Play scale on piano'}
            className="h-8 px-3.5 rounded-xl bg-[#f25100] hover:bg-[#ff5d0d] text-white text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isEs ? 'Escala' : 'Play'}</span>
          </button>
        </div>

        {/* Derecha: Botonera Sobria (Sin azul ni amarillo; activo = Naranja Rumie) */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-[#161720] p-1 rounded-xl border border-[#252736] h-8">
            <button
              type="button"
              onClick={() => onChangeScaleDisplayMode('full')}
              title={isEs ? 'Mostrar escala completa en el teclado' : 'Show full scale on keyboard'}
              className={`h-full px-2.5 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                scaleDisplayMode === 'full'
                  ? 'bg-[#f25100] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onChangeScaleDisplayMode('tonic_only')}
              title={isEs ? 'Mostrar solo la nota tónica' : 'Show tonic note only'}
              className={`h-full px-2.5 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                scaleDisplayMode === 'tonic_only'
                  ? 'bg-[#f25100] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onChangeScaleDisplayMode('hidden')}
              title={isEs ? 'Ocultar ayudas de escala en el teclado' : 'Hide scale helpers on keyboard'}
              className={`h-full px-2.5 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                scaleDisplayMode === 'hidden'
                  ? 'bg-[#252736] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleDegrees}
            title={isEs ? 'Mostrar/Ocultar Grados (1–7)' : 'Toggle Degrees (1–7)'}
            className={`h-8 px-3 rounded-xl text-[11px] font-extrabold border flex items-center gap-1.5 transition-all cursor-pointer ${
              showDegrees
                ? 'bg-[#f25100] text-white border-[#ff7433]'
                : 'bg-[#161720] text-zinc-400 border-[#252736] hover:text-white'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>1–7</span>
          </button>

          {/* Botón de Intervalos con ícono MoveHorizontal (<-> distancia entre notas) */}
          <button
            type="button"
            onClick={onToggleIntervals}
            title={isEs ? 'Mostrar/Ocultar Intervalos' : 'Toggle Intervals'}
            className={`h-8 px-3 rounded-xl text-[11px] font-extrabold border flex items-center gap-1.5 transition-all cursor-pointer ${
              showIntervals
                ? 'bg-[#f25100] text-white border-[#ff7433]'
                : 'bg-[#161720] text-zinc-400 border-[#252736] hover:text-white'
            }`}
          >
            <MoveHorizontal className="w-3.5 h-3.5" />
            <span>Int</span>
          </button>
        </div>

      </div>

      {/* Grilla Principal: Izquierda = Notas de la Escala (6 cols) | Derecha = Campo Armónico (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* Bloque Izquierdo: Notas de la Escala (Idéntico a las tarjetas de Guitar Chords Pro) */}
        <div className="lg:col-span-6 bg-[#14151c] border border-[#222430] rounded-xl px-4 py-3 flex flex-col justify-between gap-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-black text-white tracking-tight">
              {isEs ? scaleAnalysis.scaleNameEs : scaleAnalysis.scaleNameEn}
            </span>

            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="text-zinc-400 font-bold">
                {isEs ? scaleAnalysis.stepFormulaEs : scaleAnalysis.stepFormulaEn}
              </span>
              <span className="text-zinc-600">|</span>
              <strong className="text-[#f25100] font-extrabold">
                {scaleAnalysis.intervalFormula}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {scaleAnalysis.notes.map((n, idx) => {
              const isTonic = n.role === 'tonic';

              const badgeStyle = isTonic
                ? 'bg-[#f25100] text-white border-[#ff7433] shadow-[0_0_12px_rgba(242,81,0,0.35)]'
                : 'bg-[#161720] text-zinc-200 border-[#252736] hover:border-[#f25100]/50 hover:bg-[#1c1e2a] hover:text-white';

              return (
                <button
                  key={`${n.pitchClass}-${idx}`}
                  type="button"
                  onPointerDown={() => onAuditionNotes([60 + n.pitchClass], false)}
                  className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 ${badgeStyle}`}
                >
                  <span className="text-xs sm:text-sm font-black font-mono leading-tight">
                    {isEs ? n.noteEs : n.noteEn}
                  </span>
                  <span
                    className={`text-[10px] font-mono mt-0.5 ${
                      isTonic ? 'text-orange-100 font-bold' : 'text-zinc-400'
                    }`}
                  >
                    {n.degreeFormula} · {isEs ? n.intervalShortEs : n.intervalShortEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bloque Derecho: Campo Armónico (Misma estética sobria Grafito + Naranja de Guitar Chords) */}
        <div className="lg:col-span-6 bg-[#14151c] border border-[#222430] rounded-xl px-4 py-3 flex flex-col justify-between gap-2.5">
          
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#f25100]" />
              {isEs ? 'CAMPO ARMÓNICO' : 'HARMONIC FIELD'}
            </span>

            <div className="flex items-center gap-1 bg-[#161720] p-1 rounded-xl border border-[#252736]">
              <button
                type="button"
                onClick={() => onChangeDegreeDisplayMode('tonal_functions')}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer ${
                  degreeDisplayMode === 'tonal_functions'
                    ? 'bg-[#f25100] text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {isEs ? 'Acordes' : 'Chords'}
              </button>
              <button
                type="button"
                onClick={() => onChangeDegreeDisplayMode('scale_degrees')}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer ${
                  degreeDisplayMode === 'scale_degrees'
                    ? 'bg-[#f25100] text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {isEs ? 'Grados' : 'Degrees'}
              </button>
              <button
                type="button"
                onClick={() => onChangeDegreeDisplayMode('tonic_intervals')}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer ${
                  degreeDisplayMode === 'tonic_intervals'
                    ? 'bg-[#f25100] text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {isEs ? 'Intervalos' : 'Intervals'}
              </button>
              <button
                type="button"
                onClick={() => onChangeDegreeDisplayMode('chromatic_degrees')}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer ${
                  degreeDisplayMode === 'chromatic_degrees'
                    ? 'bg-[#f25100] text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                12st
              </button>
            </div>
          </div>

          {degreeDisplayMode === 'tonal_functions' && (
            <div className="grid grid-cols-7 gap-1.5">
              {scaleAnalysis.diatonicChords.map((ch, idx) => {
                const isFirstDegree = idx === 0;

                return (
                  <button
                    key={ch.degreeNumber}
                    type="button"
                    onPointerDown={() => onAuditionNotes(ch.midiVoicing, false)}
                    className={`rounded-xl py-1.5 px-1 text-center border transition-all cursor-pointer active:scale-95 ${
                      isFirstDegree
                        ? 'border-[#ff7433] bg-[#f25100] text-white shadow-[0_0_12px_rgba(242,81,0,0.3)]'
                        : 'border-[#252736] bg-[#161720] hover:border-[#f25100]/50 hover:bg-[#1c1e2a] text-zinc-200'
                    }`}
                  >
                    <div
                      className={`text-[10px] font-mono font-extrabold ${
                        isFirstDegree ? 'text-orange-100' : 'text-[#f25100]'
                      }`}
                    >
                      {ch.romanNumeral}
                    </div>
                    <div className="text-xs sm:text-sm font-black text-white truncate">
                      {isEs ? ch.chordSymbolEs : ch.chordSymbolEn}
                    </div>
                    <div
                      className={`text-[9px] font-mono font-bold uppercase ${
                        isFirstDegree ? 'text-orange-100' : 'text-zinc-400'
                      }`}
                    >
                      {ch.functionCode}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {(degreeDisplayMode === 'scale_degrees' || degreeDisplayMode === 'tonic_intervals') && (
            <div className="grid grid-cols-7 gap-1.5">
              {scaleAnalysis.notes.slice(0, 7).map((n, i) => {
                const isFirst = i === 0;
                return (
                  <button
                    key={i}
                    type="button"
                    onPointerDown={() => onAuditionNotes([60 + n.pitchClass], false)}
                    className={`rounded-xl py-2 px-1 text-center border transition-all cursor-pointer active:scale-95 ${
                      isFirst
                        ? 'bg-[#f25100] border-[#ff7433] text-white'
                        : 'bg-[#161720] hover:bg-[#1c1e2a] border-[#252736] hover:border-[#f25100]/50 text-white'
                    }`}
                  >
                    <div
                      className={`text-[10px] font-mono font-bold ${
                        isFirst ? 'text-orange-100' : 'text-[#f25100]'
                      }`}
                    >
                      {degreeDisplayMode === 'scale_degrees'
                        ? `${i + 1}º (${n.degreeFormula})`
                        : isEs
                        ? n.intervalShortEs
                        : n.intervalShortEn}
                    </div>
                    <div className="text-xs sm:text-sm font-black font-mono text-white mt-0.5">
                      {isEs ? n.noteEs : n.noteEn}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {degreeDisplayMode === 'chromatic_degrees' && (
            <div className="grid grid-cols-6 gap-1">
              {CHROMATIC_DEGREE_LABELS.map((deg, semi) => {
                const pc = (scaleAnalysis.rootPc + semi) % 12;
                const inScale = scaleAnalysis.pitchClassMap.has(pc);
                const intLabel = isEs
                  ? CHROMATIC_INTERVAL_SHORT_ES[semi]
                  : CHROMATIC_INTERVAL_SHORT_EN[semi];
                return (
                  <div
                    key={semi}
                    className={`rounded-lg px-1 py-1 text-center border text-[10px] font-mono ${
                      semi === 0
                        ? 'bg-[#f25100] border-[#ff7433] text-white font-extrabold'
                        : inScale
                        ? 'bg-[#161720] border-[#f25100]/40 text-zinc-200 font-bold'
                        : 'bg-[#12131a] border-[#1f212d] text-zinc-500'
                    }`}
                  >
                    <span>{deg}</span> <span className="text-[9px] opacity-75">({intLabel})</span>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </section>
  );
};