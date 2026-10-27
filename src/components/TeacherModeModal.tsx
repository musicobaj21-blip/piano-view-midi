import React, { useMemo } from 'react';
import {
  GraduationCap,
  X,
  Eye,
  EyeOff,
  Target,
  GitCommit,
  SlidersHorizontal,
  Music2,
  Compass,
} from 'lucide-react';
import { Language, ScaleAnalysisResult, ScaleDisplayMode } from '../types';
import { formatActiveNotes } from '../utils/musicTheory';
import { ChordRecognitionEngine } from '../utils/ChordRecognitionEngine';

interface TeacherModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeNotes: Set<number>;
  scaleAnalysis: ScaleAnalysisResult;
  scaleDisplayMode: ScaleDisplayMode;
  onChangeScaleDisplayMode: (mode: ScaleDisplayMode) => void;
  showDegrees: boolean;
  onToggleDegrees: () => void;
  showIntervals: boolean;
  onToggleIntervals: () => void;
  language: Language;
}

export const TeacherModeModal: React.FC<TeacherModeModalProps> = ({
  isOpen,
  onClose,
  activeNotes,
  scaleAnalysis,
  scaleDisplayMode,
  onChangeScaleDisplayMode,
  showDegrees,
  onToggleDegrees,
  showIntervals,
  onToggleIntervals,
  language,
}) => {
  if (!isOpen) return null;
  const isEs = language === 'ES';

  const notesArray = useMemo(() => Array.from(activeNotes).sort((a, b) => a - b), [activeNotes]);
  const formattedActiveNotes = useMemo(
    () => formatActiveNotes(notesArray, language),
    [notesArray, language]
  );
  const chordRecognition = useMemo(
    () => ChordRecognitionEngine.recognize(notesArray, 0),
    [notesArray]
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="teacher-mode-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn"
    >
      <div className="relative w-full max-w-3xl bg-[#0d0e13] border border-[#2c3042] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-[#171922] via-[#1f2230] to-[#171922] border-b border-[#292d3e] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#f25100]/20 border border-[#f25100]/40 text-[#f25100]">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="teacher-mode-title"
                className="text-base font-bold text-white tracking-wide uppercase font-sans"
              >
                {isEs
                  ? 'Modo Enseñanza · Controles de Visualización Docente'
                  : 'Teaching Mode · Teacher Visualization Controls'}
              </h2>
              <p className="text-xs text-zinc-400">
                {isEs
                  ? 'Herramienta de visualización musical para proyectar escalas, intervalos, grados y acordes'
                  : 'Musical visualization tool to project scales, intervals, degrees, and chords'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#202330] hover:bg-[#2c3042] text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title={isEs ? 'Cerrar Modo Docente' : 'Close Teacher Mode'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* 5 Mandatory Modo Enseñanza Controls */}
          <div className="bg-[#12141c] border border-[#2b2f42] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#f25100] flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                {isEs
                  ? 'CONTROLES RÁPIDOS DE VISUALIZACIÓN EN EL TECLADO'
                  : 'QUICK KEYBOARD VISUALIZATION CONTROLS'}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                {isEs ? scaleAnalysis.scaleNameEs : scaleAnalysis.scaleNameEn}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => onChangeScaleDisplayMode('full')}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  scaleDisplayMode === 'full'
                    ? 'bg-[#f25100] text-white border-[#f25100]'
                    : 'bg-[#171923] text-zinc-300 border-[#282c3e] hover:border-zinc-500'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>{isEs ? 'Mostrar escala completa' : 'Show full scale'}</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeScaleDisplayMode('hidden')}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  scaleDisplayMode === 'hidden'
                    ? 'bg-zinc-700 text-white border-zinc-400'
                    : 'bg-[#171923] text-zinc-300 border-[#282c3e] hover:border-zinc-500'
                }`}
              >
                <EyeOff className="w-4 h-4" />
                <span>{isEs ? 'Ocultar escala' : 'Hide scale'}</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeScaleDisplayMode('tonic_only')}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  scaleDisplayMode === 'tonic_only'
                    ? 'bg-[#f25100] text-white border-[#f25100]'
                    : 'bg-[#171923] text-zinc-300 border-[#282c3e] hover:border-zinc-500'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>{isEs ? 'Mostrar solo tónica' : 'Show tonic only'}</span>
              </button>

              <button
                type="button"
                onClick={onToggleIntervals}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  showIntervals
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                    : 'bg-[#171923] text-zinc-300 border-[#282c3e] hover:border-zinc-500'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{isEs ? 'Mostrar intervalos' : 'Show intervals'}</span>
              </button>

              <button
                type="button"
                onClick={onToggleDegrees}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  showDegrees
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                    : 'bg-[#171923] text-zinc-300 border-[#282c3e] hover:border-zinc-500'
                }`}
              >
                <GitCommit className="w-4 h-4" />
                <span>{isEs ? 'Mostrar grados' : 'Show degrees'}</span>
              </button>
            </div>
          </div>

          {/* Main Projection Card */}
          <div className="bg-[#12141c] border border-[#2b2f42] rounded-xl p-6 text-center relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-bold text-[#f25100] uppercase font-mono mb-4">
              <span className="flex items-center gap-1.5">
                <Music2 className="w-4 h-4" />
                {isEs ? 'Proyección en Aula en Tiempo Real' : 'Real-Time Classroom Projection'}
              </span>
              <span className="text-zinc-400">
                {isEs
                  ? `Fórmula escala: ${scaleAnalysis.intervalFormula}`
                  : `Scale formula: ${scaleAnalysis.intervalFormula}`}
              </span>
            </div>

            <div className="my-4">
              {formattedActiveNotes.length > 0 ? (
                <div className="space-y-2">
                  {chordRecognition.status === 'recognized' && chordRecognition.primary && (
                    <div className="text-3xl sm:text-4xl font-extrabold text-[#f25100] font-mono">
                      {chordRecognition.primary.symbolInternational} —{' '}
                      {isEs ? chordRecognition.primary.nameEs : chordRecognition.primary.nameEn}
                    </div>
                  )}
                  <div className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
                    {formattedActiveNotes.join(' · ')}
                  </div>
                </div>
              ) : (
                <div className="py-4 space-y-2">
                  <div className="text-2xl font-bold text-white">
                    {isEs ? scaleAnalysis.scaleNameEs : scaleAnalysis.scaleNameEn}
                  </div>
                  <div className="text-lg font-mono text-sky-300">
                    {scaleAnalysis.notes
                      .map((n) => `${isEs ? n.noteEs : n.noteEn} (${n.degreeFormula})`)
                      .join('  ·  ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#101117] border-t border-[#232738] px-6 py-3 flex items-center justify-between text-xs text-zinc-500">
          <span>Rumie Piano View MIDI · {isEs ? 'Modo Enseñanza' : 'Teaching Mode'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#f25100] hover:bg-[#ff5d0d] text-white font-bold transition-colors cursor-pointer"
          >
            {isEs ? 'Aplicar y Volver al Teclado' : 'Apply & Return to Keyboard'}
          </button>
        </div>
      </div>
    </div>
  );
};

