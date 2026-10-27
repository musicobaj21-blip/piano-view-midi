import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { Header } from './components/Header';
import { RecognitionPanel } from './components/RecognitionPanel';
import { ScaleExplorerPanel } from './components/ScaleExplorerPanel';
import { Piano } from './components/Piano';
import { BottomToolbar } from './components/BottomToolbar';
import {
  DegreeDisplayMode,
  KeyCount,
  Language,
  MidiConnectionStatus,
  MidiDeviceInfo,
  NamingConvention,
  ParsedMidiEvent,
  ScaleDisplayMode,
  ScaleId,
} from './types';
import { useNoteState } from './utils/useNoteState';
import { pianoSynth } from './utils/audioEngine';
import { RumieMidiAdapter } from './utils/midiAdapter';
import { ScaleAndHarmonyEngine } from './utils/ScaleAndHarmonyEngine';
import { initBrowserShield, AppErrorBoundary } from './utils/browserShield';

initBrowserShield();

export default function App() {
  const [language, setLanguage] = useState<Language>('ES');
  const [audioActive, setAudioActive] = useState<boolean>(true);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [keyCount, setKeyCount] = useState<KeyCount>(61);

  const [scaleRootPc, setScaleRootPc] = useState<number>(0);
  const [selectedScaleId, setSelectedScaleId] = useState<ScaleId>('major');
  const [scaleDisplayMode, setScaleDisplayMode] = useState<ScaleDisplayMode>('full');
  const [degreeDisplayMode, setDegreeDisplayMode] = useState<DegreeDisplayMode>('tonal_functions');

  const [midiStatus, setMidiStatus] = useState<MidiConnectionStatus>('disconnected');
  const [midiDevices, setMidiDevices] = useState<MidiDeviceInfo[]>([]);
  const [selectedMidiDeviceId, setSelectedMidiDeviceId] = useState<string | null>(null);
  const midiAdapterRef = useRef<RumieMidiAdapter | null>(null);
  const playbackTimeoutsRef = useRef<number[]>([]);

  const [showNoteNames, setShowNoteNames] = useState<boolean>(true);
  const [namingConvention, setNamingConvention] = useState<NamingConvention>('solfege');
  const [showDegrees, setShowDegrees] = useState<boolean>(true);
  const [showIntervals, setShowIntervals] = useState<boolean>(false);
  const [octaveShift, setOctaveShift] = useState<number>(0);
  const [transpose, setTranspose] = useState<number>(0);

  const scaleAnalysis = useMemo(() => {
    return ScaleAndHarmonyEngine.analyzeScale(scaleRootPc, selectedScaleId);
  }, [scaleRootPc, selectedScaleId]);

  const {
    activeNotes,
    sustainedNotes,
    noteOrder,
    sustainActive,
    lastVelocity,
    noteOn,
    noteOff,
    setSustainPedal,
    allNotesOff,
  } = useNoteState(audioActive, octaveShift);

  const clearScheduledPlayback = useCallback(() => {
    playbackTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
    playbackTimeoutsRef.current = [];
  }, []);

  const handleReleaseAll = useCallback(() => {
    clearScheduledPlayback();
    allNotesOff();
  }, [clearScheduledPlayback, allNotesOff]);

  const effectivePianoActiveNotes = useMemo(() => {
    if (sustainedNotes.size === 0) return activeNotes;
    const merged = new Set<number>(activeNotes);
    sustainedNotes.forEach((n) => merged.add(n));
    return merged;
  }, [activeNotes, sustainedNotes]);

  const handleMidiEvent = useCallback(
    (event: ParsedMidiEvent) => {
      switch (event.type) {
        case 'noteon':
          if (event.note !== undefined) {
            noteOn(event.note, event.velocity ?? 100);
          }
          break;
        case 'noteoff':
          if (event.note !== undefined) {
            noteOff(event.note);
          }
          break;
        case 'sustain':
          if (event.sustainDown !== undefined) {
            setSustainPedal(event.sustainDown);
          }
          break;
        case 'allnotesoff':
          handleReleaseAll();
          break;
      }
    },
    [noteOn, noteOff, setSustainPedal, handleReleaseAll]
  );

  const handleMidiStatusChange = useCallback(
    (
      status: MidiConnectionStatus,
      devices: MidiDeviceInfo[],
      selectedId: string | null
    ) => {
      setMidiStatus(status);
      setMidiDevices(devices);
      setSelectedMidiDeviceId(selectedId);
    },
    []
  );

  useEffect(() => {
    const adapter = new RumieMidiAdapter(handleMidiEvent, handleMidiStatusChange);
    midiAdapterRef.current = adapter;
    adapter.initialize();

    return () => {
      clearScheduledPlayback();
      adapter.dispose();
      midiAdapterRef.current = null;
    };
  }, [handleMidiEvent, handleMidiStatusChange, clearScheduledPlayback]);

  const handleSelectMidiDevice = useCallback(
    (deviceId: string | null) => {
      handleReleaseAll();
      if (midiAdapterRef.current) {
        midiAdapterRef.current.selectDevice(deviceId);
      }
    },
    [handleReleaseAll]
  );

  const handleRefreshMidi = useCallback(() => {
    handleReleaseAll();
    if (midiAdapterRef.current) {
      midiAdapterRef.current.initialize();
    }
  }, [handleReleaseAll]);

  const handleVolumeChange = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolumeState(clamped);
    pianoSynth.setVolume(clamped);
    if (clamped > 0 && !audioActive) {
      setAudioActive(true);
      pianoSynth.setEnabled(true);
    }
  }, [audioActive]);

  const handleToggleAudio = useCallback(() => {
    const nextState = !audioActive;
    setAudioActive(nextState);
    pianoSynth.setEnabled(nextState);
  }, [audioActive]);

  const handleOctaveChange = useCallback((delta: number) => {
    handleReleaseAll();
    setOctaveShift(prev => Math.max(-2, Math.min(2, prev + delta)));
  }, [handleReleaseAll]);

  const handleOctaveReset = useCallback(() => {
    handleReleaseAll();
    setOctaveShift(0);
  }, [handleReleaseAll]);

  const handleTransposeChange = useCallback((delta: number) => {
    handleReleaseAll();
    setTranspose(prev => Math.max(-12, Math.min(12, prev + delta)));
  }, [handleReleaseAll]);

  const handleTransposeReset = useCallback(() => {
    handleReleaseAll();
    setTranspose(0);
  }, [handleReleaseAll]);

  const handleTestNote = useCallback((midiNote: number) => {
    clearScheduledPlayback();
    noteOn(midiNote, 105);
    const tid = window.setTimeout(() => {
      noteOff(midiNote);
    }, 650);
    playbackTimeoutsRef.current.push(tid);
  }, [clearScheduledPlayback, noteOn, noteOff]);

  const handleAuditionNotes = useCallback((notes: number[], sequential = false) => {
    handleReleaseAll();
    if (sequential && notes.length === 2) {
      noteOn(notes[0], 100);
      const t1 = window.setTimeout(() => {
        noteOn(notes[1], 100);
      }, 420);
      const t2 = window.setTimeout(() => {
        notes.forEach(n => noteOff(n));
      }, 1600);
      playbackTimeoutsRef.current.push(t1, t2);
    } else {
      notes.forEach(n => noteOn(n, 100));
      const tEnd = window.setTimeout(() => {
        notes.forEach(n => noteOff(n));
      }, 1350);
      playbackTimeoutsRef.current.push(tEnd);
    }
  }, [handleReleaseAll, noteOn, noteOff]);

  const handlePlayScale = useCallback(() => {
    handleReleaseAll();
    const baseMidi = 60 + scaleAnalysis.rootPc;
    const sequence = [
      ...scaleAnalysis.notes.map(n => baseMidi + n.semitonesFromRoot),
      baseMidi + 12,
    ];
    const stepMs = 520;
    const gateMs = 470;

    sequence.forEach((midi, idx) => {
      const isLast = idx === sequence.length - 1;
      const tOn = window.setTimeout(() => {
        noteOn(midi, 100);
        const tOff = window.setTimeout(
          () => {
            noteOff(midi);
          },
          isLast ? 800 : gateMs
        );
        playbackTimeoutsRef.current.push(tOff);
      }, idx * stepMs);
      playbackTimeoutsRef.current.push(tOn);
    });
  }, [handleReleaseAll, scaleAnalysis, noteOn, noteOff]);

  const isEs = language === 'ES';
  const hasActiveOrSustainedNotes = activeNotes.size > 0 || sustainedNotes.size > 0 || sustainActive;

  return (
    <AppErrorBoundary>
      <div className="min-h-screen bg-[#090a0d] text-zinc-100 flex flex-col justify-between selection:bg-[#f25100] selection:text-white">
      
      {/* 1. Header Superior Compacto */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        audioActive={audioActive}
        onToggleAudio={handleToggleAudio}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        midiStatus={midiStatus}
        midiDevices={midiDevices}
        selectedMidiDeviceId={selectedMidiDeviceId}
        onSelectMidiDevice={handleSelectMidiDevice}
        onRefreshMidi={handleRefreshMidi}
        onReleaseAllNotes={handleReleaseAll}
        hasActiveOrSustainedNotes={hasActiveOrSustainedNotes}
        sustainActive={sustainActive}
      />

      {/* Vista Principal Sin Scroll */}
      <main className="flex-1 max-w-[1780px] w-full mx-auto px-3 sm:px-5 py-2 flex flex-col gap-2.5 justify-between">

        {(midiStatus === 'unsupported' || midiStatus === 'permission_denied') && (
          <div className="w-full bg-[#14151c] border border-amber-500/30 rounded-xl px-3 py-1.5 flex items-center justify-between gap-3 text-xs text-amber-300/90">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {midiStatus === 'unsupported'
                  ? isEs
                    ? 'Navegador sin soporte Web MIDI API. El teclado virtual interactivo está 100% disponible.'
                    : 'Browser without Web MIDI API support. The interactive virtual keyboard is 100% available.'
                  : isEs
                  ? 'Permiso MIDI denegado en el navegador. El teclado virtual sigue disponible.'
                  : 'MIDI permission denied in browser. The virtual keyboard remains available.'}
              </span>
            </div>
            {midiStatus === 'permission_denied' && (
              <button
                type="button"
                onClick={handleRefreshMidi}
                className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold whitespace-nowrap transition-colors"
              >
                {isEs ? 'Reintentar MIDI' : 'Retry MIDI'}
              </button>
            )}
          </div>
        )}

        {/* BLOQUE 1 SUPERIOR: ESCALA Y CAMPO ARMÓNICO */}
        <ScaleExplorerPanel
          scaleRootPc={scaleRootPc}
          onChangeScaleRoot={setScaleRootPc}
          selectedScaleId={selectedScaleId}
          onChangeScaleId={setSelectedScaleId}
          scaleDisplayMode={scaleDisplayMode}
          onChangeScaleDisplayMode={setScaleDisplayMode}
          degreeDisplayMode={degreeDisplayMode}
          onChangeDegreeDisplayMode={setDegreeDisplayMode}
          showDegrees={showDegrees}
          onToggleDegrees={() => setShowDegrees(prev => !prev)}
          showIntervals={showIntervals}
          onToggleIntervals={() => setShowIntervals(prev => !prev)}
          scaleAnalysis={scaleAnalysis}
          onPlayScale={handlePlayScale}
          onAuditionNotes={handleAuditionNotes}
          language={language}
        />

        {/* BLOQUE 2 INFERIOR: CONSOLA INTEGRADA DE TECLADO + PANTALLA LED DE RECONOCIMIENTO */}
        <div className="w-full bg-[#111217] border border-[#1e202b] rounded-2xl p-2.5 shadow-2xl flex flex-col gap-2">
          <RecognitionPanel
            activeNotes={activeNotes}
            sustainedNotes={sustainedNotes}
            noteOrder={noteOrder}
            sustainActive={sustainActive}
            lastVelocity={lastVelocity}
            transpose={transpose}
            scaleAnalysis={scaleAnalysis}
            language={language}
            onTestNote={handleTestNote}
            onTestChord={(notes) => handleAuditionNotes(notes, notes.length === 2)}
          />

          <Piano
            keyCount={keyCount}
            onKeyCountChange={setKeyCount}
            activeNotes={effectivePianoActiveNotes}
            onNoteDown={noteOn}
            onNoteUp={noteOff}
            showNoteNames={showNoteNames}
            namingConvention={namingConvention}
            showDegrees={showDegrees}
            showIntervals={showIntervals}
            octaveShift={octaveShift}
            scaleAnalysis={scaleAnalysis}
            scaleDisplayMode={scaleDisplayMode}
            degreeDisplayMode={degreeDisplayMode}
            language={language}
          />
        </div>

        {/* Barra Inferior Compacta */}
        <BottomToolbar
          showNoteNames={showNoteNames}
          onToggleNoteNames={() => setShowNoteNames(prev => !prev)}
          namingConvention={namingConvention}
          onToggleNamingConvention={() =>
            setNamingConvention(prev => (prev === 'standard' ? 'solfege' : 'standard'))
          }
          showDegrees={showDegrees}
          onToggleDegrees={() => setShowDegrees(prev => !prev)}
          showIntervals={showIntervals}
          onToggleIntervals={() => setShowIntervals(prev => !prev)}
          octaveShift={octaveShift}
          onChangeOctave={handleOctaveChange}
          onResetOctave={handleOctaveReset}
          transpose={transpose}
          onChangeTranspose={handleTransposeChange}
          onResetTranspose={handleTransposeReset}
          onClearNotes={handleReleaseAll}
          activeNotesCount={activeNotes.size}
          sustainedNotesCount={sustainedNotes.size}
          sustainActive={sustainActive}
          lastVelocity={lastVelocity}
          language={language}
        />

      </main>

      </div>
    </AppErrorBoundary>
  );
}