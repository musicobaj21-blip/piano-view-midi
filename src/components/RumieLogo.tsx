import React from 'react';

interface RumieLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RumieLogo: React.FC<RumieLogoProps> = ({ className = '', size = 'md' }) => {
  const iconSize = size === 'sm' ? 32 : size === 'lg' ? 44 : 38;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Rumie Studio Pro Rounded Orange Icon with Star Sparkle Motif (Exact match to screenshot) */}
      <div 
        className="relative flex items-center justify-center rounded-xl bg-[#f25100] text-white shadow-md shadow-[#f25100]/25 shrink-0"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          width={iconSize * 0.58}
          height={iconSize * 0.58}
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 4-pointed star / sparkle emblem */}
          <path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z" fill="white" />
          <circle cx="18.5" cy="5.5" r="1.5" fill="white" />
        </svg>
      </div>

      {/* Brand typography matching screenshot */}
      <div className="flex flex-col text-left">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold tracking-tight text-white font-sans">
            Rumie Piano View
          </span>
          <span className="text-xl font-light text-zinc-400">
            MIDI
          </span>
        </div>
        <span className="text-[9.5px] font-semibold tracking-[0.18em] text-zinc-400 uppercase mt-0.5">
          APRENDE, COMPRENDE Y CREA MÚSICA
        </span>
      </div>
    </div>
  );
};

