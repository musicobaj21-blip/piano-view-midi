import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RotateCcw,
  RefreshCw,
  Volume2,
  VolumeX,
  Usb,
  Play,
  Square,
  Minus,
  Plus,
  Radio,
  ChevronDown,
} from 'lucide-react';
import { Language, MidiConnectionStatus, MidiDeviceInfo } from '../types';
import {
  pianoSynth,
  PianoInstrumentId,
  PIANO_INSTRUMENTS,
} from '../utils/audioEngine';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  audioActive: boolean;
  onToggleAudio: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  midiStatus: MidiConnectionStatus;
  midiDevices: MidiDeviceInfo[];
  selectedMidiDeviceId: string | null;
  onSelectMidiDevice: (id: string | null) => void;
  onRefreshMidi: () => void;
  onReleaseAllNotes: () => void;
  hasActiveOrSustainedNotes: boolean;
  sustainActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  audioActive,
  onToggleAudio,
  volume,
  onVolumeChange,
  midiStatus,
  midiDevices,
  selectedMidiDeviceId,
  onSelectMidiDevice,
  onRefreshMidi,
  onReleaseAllNotes,
  hasActiveOrSustainedNotes,
  sustainActive,
}) => {
  const isEs = language === 'ES';
  const isConnected = midiStatus === 'connected' && midiDevices.length > 0;

  const [selectedInstrument, setSelectedInstrument] =
    useState<PianoInstrumentId>('grand_piano');

  const [metroActive, setMetroActive] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(90);
  const [bpmInput, setBpmInput] = useState<string>('90');
  const [beatsPerBar, setBeatsPerBar] = useState<number>(4);
  const [currentBeat, setCurrentBeat] = useState<number>(0);

  // Cambia el instrumento en silencio sin disparar ninguna nota automática
  const handleSelectInstrument = (inst: PianoInstrumentId) => {
    setSelectedInstrument(inst);
    pianoSynth.setInstrument(inst);
  };

  const handleToggleMetronome = () => {
    if (metroActive) {
      pianoSynth.stopMetronome();
      setMetroActive(false);
      setCurrentBeat(0);
    } else {
      setMetroActive(true);
      pianoSynth.startMetronome(bpm, beatsPerBar, (beatIdx) => {
        setCurrentBeat(beatIdx);
      });
    }
  };

  const applyBpmValue = (nextBpm: number) => {
    const clamped = Math.max(30, Math.min(260, Math.round(nextBpm)));
    setBpm(clamped);
    setBpmInput(String(clamped));
    pianoSynth.updateMetronomeParams(clamped, beatsPerBar);
  };

  const handleBpmInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setBpmInput(raw);

    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed >= 30 && parsed <= 260) {
      setBpm(parsed);
      pianoSynth.updateMetronomeParams(parsed, beatsPerBar);
    }
  };

  const handleBpmInputBlur = () => {
    const parsed = parseInt(bpmInput, 10);
    if (isNaN(parsed)) {
      setBpmInput(String(bpm));
    } else {
      applyBpmValue(parsed);
    }
  };

  const handleBpmKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      applyBpmValue(bpm + 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      applyBpmValue(bpm - 1);
    }
  };

  const handleChangeBeatsPerBar = (nextBeats: number) => {
    setBeatsPerBar(nextBeats);
    pianoSynth.updateMetronomeParams(bpm, nextBeats);
  };

  useEffect(() => {
    return () => {
      pianoSynth.stopMetronome();
    };
  }, []);

  return (
    <header className="w-full bg-[#090a0d] border-b border-[#1c1e28] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none shrink-0">
      {/* Izquierda: Logo Rumie Piano View MIDI */}
      <div className="flex items-center gap-3.5">
        <div className="w-[42px] h-[42px] rounded-xl bg-[#f25100] flex items-center justify-center shadow-[0_0_18px_rgba(242,81,0,0.38)] shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-baseline gap-2 leading-none">
            <span>Rumie Piano View</span>
            <span className="font-light text-zinc-400">MIDI</span>
          </h1>
          <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-zinc-400 mt-1.5 leading-none">
            {isEs
              ? 'APRENDE, COMPRENDE Y CREA MÚSICA'
              : 'LEARN, UNDERSTAND AND CREATE MUSIC'}
          </p>
        </div>
      </div>

      {/* Centro-Derecha: Selector Desplegable de 5 Pianos HD + Metrónomo + MIDI + Audio + Idioma */}
      <div className="flex flex-wrap items-center gap-2">
        {/* 1. SELECTOR COMPACTO DESPLEGABLE DE LOS 5 SAMPLES DE PIANO HD */}
        <div className="relative h-9 shrink-0">
          <Radio className="w-3.5 h-3.5 text-[#f25100] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={selectedInstrument}
            onChange={(e) => {
              const newInst = e.target.value as PianoInstrumentId;
              e.currentTarget.blur();
              handleSelectInstrument(newInst);
            }}
            title={
              isEs
                ? 'Seleccionar timbre de piano / teclado'
                : 'Select piano / keyboard sound'
            }
            className="h-9 pl-7 pr-6 rounded-xl bg-[#14151c] hover:bg-[#1a1c26] border border-[#232634] hover:border-[#f25100]/60 text-[11px] font-extrabold uppercase tracking-wider text-zinc-100 appearance-none cursor-pointer focus:outline-none focus:border-[#f25100] transition-colors"
          >
            {PIANO_INSTRUMENTS.map((inst) => (
              <option
                key={inst.id}
                value={inst.id}
                className="bg-[#111217] text-zinc-100 font-sans font-bold"
              >
                {isEs ? inst.labelEs : inst.labelEn}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* 2. CONSOLA DE METRÓNOMO CON INPUT DE TEMPO EDITABLE */}
        <div className="flex items-center gap-1.5 bg-[#14151c] border border-[#232634] rounded-xl px-2.5 h-9">
          <button
            type="button"
            onClick={handleToggleMetronome}
            title={
              isEs ? 'Iniciar / Detener Metrónomo' : 'Start / Stop Metronome'
            }
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              metroActive
                ? 'bg-[#f25100] text-white shadow-[0_0_8px_rgba(242,81,0,0.5)]'
                : 'bg-[#1c1e28] text-zinc-300 hover:text-white'
            }`}
          >
            {metroActive ? (
              <Square className="w-3 h-3 fill-current" />
            ) : (
              <Play className="w-3 h-3 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => applyBpmValue(bpm - 1)}
            title="-1 BPM"
            className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <Minus className="w-3 h-3" />
          </button>

          <div className="flex items-center gap-1 bg-[#0e0f14] border border-[#252836] focus-within:border-[#f25100] rounded-lg px-2 py-0.5">
            <input
              type="text"
              inputMode="numeric"
              aria-label="BPM"
              value={bpmInput}
              onChange={handleBpmInputChange}
              onBlur={handleBpmInputBlur}
              onKeyDown={handleBpmKeyDown}
              onFocus={(e) => e.currentTarget.select()}
              className="w-9 bg-transparent text-center text-xs font-mono font-black text-white outline-none tabular-nums select-text"
            />
            <span className="text-[9px] font-mono font-bold text-zinc-500">
              BPM
            </span>
          </div>

          <button
            type="button"
            onClick={() => applyBpmValue(bpm + 1)}
            title="+1 BPM"
            className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
          </button>

          <select
            aria-label={
              isEs ? 'Compás del metrónomo' : 'Metronome time signature'
            }
            value={beatsPerBar}
            onChange={(e) => handleChangeBeatsPerBar(Number(e.target.value))}
            className="bg-[#1c1e28] text-[10px] font-mono font-extrabold text-zinc-200 rounded-md px-1.5 py-0.5 border border-[#2a2d3d] outline-none cursor-pointer"
          >
            <option value={4}>4/4</option>
            <option value={3}>3/4</option>
            <option value={2}>2/4</option>
            <option value={6}>6/8</option>
          </select>

          <span
            className={`w-2 h-2 rounded-full transition-all ${
              !metroActive
                ? 'bg-zinc-700'
                : currentBeat === 0
                ? 'bg-[#f25100] scale-125 shadow-[0_0_8px_#f25100]'
                : 'bg-zinc-200'
            }`}
          />
        </div>

        {/* 3. SELECTOR DE DISPOSITIVO MIDI */}
        <div className="flex items-center gap-1.5 bg-[#14151c] border border-[#232634] rounded-xl px-2.5 py-1 h-9">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isConnected
                ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                : midiStatus === 'unsupported' ||
                  midiStatus === 'permission_denied'
                ? 'bg-[#f25100]'
                : 'bg-zinc-500'
            }`}
          />
          <Usb className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <select
            aria-label={isEs ? 'Dispositivo MIDI' : 'MIDI Device'}
            value={selectedMidiDeviceId ?? ''}
            onChange={(e) => onSelectMidiDevice(e.target.value || null)}
            className="bg-transparent text-xs font-bold text-zinc-200 outline-none cursor-pointer max-w-[115px] truncate"
          >
            {midiDevices.length === 0 ? (
              <option value="" className="bg-[#14151c] text-zinc-400">
                {isEs ? 'Sin MIDI' : 'No MIDI'}
              </option>
            ) : (
              midiDevices.map((dev) => (
                <option
                  key={dev.id}
                  value={dev.id}
                  className="bg-[#14151c] text-white"
                >
                  {dev.name}
                </option>
              ))
            )}
          </select>
          <button
            type="button"
            onClick={onRefreshMidi}
            title={isEs ? 'Actualizar puertos MIDI' : 'Refresh MIDI ports'}
            className="p-1 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        {/* 4. BOTÓN LIBERAR NOTAS / MIDI PANIC */}
        <button
          type="button"
          onClick={onReleaseAllNotes}
          title={
            isEs
              ? 'Liberar notas / Resetear pedal (MIDI Panic)'
              : 'Release notes / Reset sustain (MIDI Panic)'
          }
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            hasActiveOrSustainedNotes || sustainActive
              ? 'bg-[#f25100] text-white border-[#ff7733] shadow-[0_0_10px_rgba(242,81,0,0.4)]'
              : 'bg-[#14151c] text-zinc-400 border-[#232634] hover:text-white hover:border-zinc-600'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* 5. CONTROL INTEGRADO DE AUDIO */}
        <div className="flex items-center gap-2 bg-[#14151c] border border-[#232634] rounded-xl px-2.5 h-9">
          <button
            type="button"
            onClick={onToggleAudio}
            title={
              audioActive
                ? isEs
                  ? 'Silenciar audio'
                  : 'Mute audio'
                : isEs
                ? 'Activar audio'
                : 'Enable audio'
            }
            className={`transition-colors cursor-pointer ${
              audioActive
                ? 'text-[#f25100] hover:text-[#ff7733]'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {audioActive && volume > 0 ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={audioActive ? volume : 0}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            aria-label={isEs ? 'Volumen maestro' : 'Master volume'}
            className="w-14 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#f25100]"
          />

          <span className="text-[10px] font-mono font-bold text-zinc-400 w-7 text-right">
            {audioActive ? `${Math.round(volume * 100)}%` : 'OFF'}
          </span>
        </div>

        {/* 6. SELECTOR DE IDIOMA ES / EN */}
        <div className="flex items-center bg-[#14151c] p-0.5 rounded-xl border border-[#232634] h-9">
          <button
            type="button"
            onClick={() => onLanguageChange('ES')}
            className={`px-2 h-full rounded-lg text-[10px] font-extrabold transition-colors cursor-pointer ${
              language === 'ES'
                ? 'bg-[#f25100] text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            ES
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('EN')}
            className={`px-2 h-full rounded-lg text-[10px] font-extrabold transition-colors cursor-pointer ${
              language === 'EN'
                ? 'bg-[#f25100] text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
};