import React from 'react';
import { Type, GitCommit, SlidersHorizontal, ArrowUpDown, RotateCcw, ChevronLeft, ChevronRight, Disc } from 'lucide-react';
import { Language, NamingConvention } from '../types';

interface BottomToolbarProps {
  showNoteNames: boolean;
  onToggleNoteNames: () => void;
  namingConvention: NamingConvention;
  onToggleNamingConvention: () => void;
  showDegrees: boolean;
  onToggleDegrees: () => void;
  showIntervals: boolean;
  onToggleIntervals: () => void;
  octaveShift: number;
  onChangeOctave: (delta: number) => void;
  onResetOctave: () => void;
  transpose: number;
  onChangeTranspose: (delta: number) => void;
  onResetTranspose: () => void;
  onClearNotes: () => void;
  activeNotesCount: number;
  sustainedNotesCount?: number;
  sustainActive?: boolean;
  lastVelocity?: number | null;
  language: Language;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  showNoteNames,
  onToggleNoteNames,
  namingConvention,
  onToggleNamingConvention,
  showDegrees,
  onToggleDegrees,
  showIntervals,
  onToggleIntervals,
  octaveShift,
  onChangeOctave,
  onResetOctave,
  transpose,
  onChangeTranspose,
  onResetTranspose,
  onClearNotes,
  activeNotesCount,
  sustainedNotesCount = 0,
  sustainActive = false,
  lastVelocity = null,
  language,
}) => {
  const isEs = language === 'ES';
  const hasNotesOrSustain = activeNotesCount > 0 || sustainedNotesCount > 0 || sustainActive;

  return (
    <nav aria-label={isEs ? 'Barra inferior de controles' : 'Bottom controls toolbar'} className="w-full bg-[#111217] border border-[#1e202b] rounded-2xl p-3.5 sm:p-4 shadow-xl select-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Group 1: Note display toggles */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Note Names Toggle & Convention */}
          <div className="flex items-center rounded-xl bg-[#161720] border border-[#242634] p-0.5">
            <button
              type="button"
              onClick={onToggleNoteNames}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                showNoteNames
                  ? 'bg-[#f25100] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1f202b]'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>{isEs ? 'Nombres de Notas' : 'Note Names'}</span>
            </button>

            {showNoteNames && (
              <button
                type="button"
                onClick={onToggleNamingConvention}
                className="px-2.5 py-1 text-xs font-mono font-bold text-zinc-300 hover:text-white border-l border-[#242634] transition-colors"
                title={isEs ? 'Alternar Do-Re-Mi / C-D-E' : 'Toggle Do-Re-Mi / C-D-E'}
              >
                {namingConvention === 'solfege' ? 'Do-Re-Mi' : 'C-D-E'}
              </button>
            )}
          </div>

          {/* Degrees Toggle (Mostrar Grados) */}
          <button
            type="button"
            onClick={onToggleDegrees}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              showDegrees
                ? 'bg-[#f25100] text-white border-[#f25100] shadow-sm'
                : 'bg-[#161720] text-zinc-400 border-[#242634] hover:text-zinc-200 hover:bg-[#1f202b]'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>{isEs ? 'Mostrar Grados' : 'Show Degrees'}</span>
          </button>

          {/* Intervals Toggle (Mostrar Intervalos) */}
          <button
            type="button"
            onClick={onToggleIntervals}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              showIntervals
                ? 'bg-[#f25100] text-white border-[#f25100] shadow-sm'
                : 'bg-[#161720] text-zinc-400 border-[#242634] hover:text-zinc-200 hover:bg-[#1f202b]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isEs ? 'Mostrar Intervalos' : 'Show Intervals'}</span>
          </button>

          {/* Sustain Pedal CC64 & Velocity Status Pill */}
          <div className="flex items-center bg-[#161720] border border-[#242634] rounded-xl px-3 py-1.5 gap-2.5">
            <div className="flex items-center gap-1.5">
              <Disc className={`w-3.5 h-3.5 ${sustainActive ? 'text-[#f25100]' : 'text-zinc-500'}`} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Sustain CC64:
              </span>
              <span
                className={`font-mono text-xs font-bold ${
                  sustainActive ? 'text-[#f25100]' : 'text-zinc-500'
                }`}
              >
                {sustainActive ? (isEs ? 'ACTIVO' : 'ON') : 'OFF'}
              </span>
              {sustainedNotesCount > 0 && (
                <span className="text-[10px] font-mono text-zinc-400">
                  ({sustainedNotesCount})
                </span>
              )}
            </div>
            <span className="text-zinc-700">|</span>
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                VEL:
              </span>
              <span className="font-mono text-xs font-bold text-white w-7 text-center tabular-nums">
                {lastVelocity !== null ? lastVelocity : '--'}
              </span>
            </div>
          </div>

        </div>

        {/* Group 2: Octave, Transpose, and LIBERAR NOTAS */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Octavas Modifier */}
          <div className="flex items-center bg-[#161720] border border-[#242634] rounded-xl px-2.5 py-1 gap-1.5">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mr-1">
              {isEs ? 'Octavas' : 'Octaves'}:
            </span>
            <button
              type="button"
              onClick={() => onChangeOctave(-1)}
              disabled={octaveShift <= -2}
              className="p-1 rounded-lg bg-[#20222e] hover:bg-[#282a39] disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300 transition-colors"
              title={isEs ? 'Bajar octava' : 'Octave down'}
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="font-mono text-xs font-bold text-white w-6 text-center tabular-nums">
              {octaveShift > 0 ? `+${octaveShift}` : octaveShift}
            </span>
            <button
              type="button"
              onClick={() => onChangeOctave(1)}
              disabled={octaveShift >= 2}
              className="p-1 rounded-lg bg-[#20222e] hover:bg-[#282a39] disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300 transition-colors"
              title={isEs ? 'Subir octava' : 'Octave up'}
            >
              <ChevronRight className="w-3 h-3" />
            </button>
            {octaveShift !== 0 && (
              <button
                type="button"
                onClick={onResetOctave}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 ml-1"
                title={isEs ? 'Restablecer octava' : 'Reset octave'}
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Transposición Modifier */}
          <div className="flex items-center bg-[#161720] border border-[#242634] rounded-xl px-2.5 py-1 gap-1.5">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-[#f25100]" />
              {isEs ? 'Transposición' : 'Transpose'}:
            </span>
            <button
              type="button"
              onClick={() => onChangeTranspose(-1)}
              disabled={transpose <= -12}
              className="p-1 rounded-lg bg-[#20222e] hover:bg-[#282a39] disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300 transition-colors"
              title={isEs ? 'Bajar semitono' : 'Transpose down'}
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="font-mono text-xs font-bold text-white w-7 text-center tabular-nums">
              {transpose > 0 ? `+${transpose}` : transpose}
            </span>
            <button
              type="button"
              onClick={() => onChangeTranspose(1)}
              disabled={transpose >= 12}
              className="p-1 rounded-lg bg-[#20222e] hover:bg-[#282a39] disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300 transition-colors"
              title={isEs ? 'Subir semitono' : 'Transpose up'}
            >
              <ChevronRight className="w-3 h-3" />
            </button>
            {transpose !== 0 && (
              <button
                type="button"
                onClick={onResetTranspose}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 ml-1"
                title={isEs ? 'Restablecer transposición' : 'Reset transpose'}
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* LIBERAR NOTAS Button (MIDI Panic & Clear Notes) */}
          <button
            type="button"
            onClick={onClearNotes}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              hasNotesOrSustain
                ? 'bg-[#f25100] text-white border-[#f25100] shadow-[0_0_12px_rgba(242,81,0,0.3)] hover:bg-[#e04800]'
                : 'bg-[#161720] text-zinc-300 border-[#242634] hover:bg-[#20222f] hover:text-white'
            }`}
            title={isEs ? 'Liberar todas las notas y desactivar pedal sustain' : 'Release all notes and sustain pedal'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">{isEs ? 'LIBERAR NOTAS' : 'RELEASE NOTES'}</span>
          </button>

        </div>

      </div>
    </nav>
  );
};

