import React from 'react';

interface WuishLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showSubtitle?: boolean;
}

export const WuishLogo: React.FC<WuishLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return { w: 'w-7 h-7', text: 'text-base', sub: 'text-[9px]' };
      case 'md':
        return { w: 'w-9 h-9', text: 'text-xl', sub: 'text-[10px]' };
      case 'lg':
        return { w: 'w-12 h-12', text: 'text-2xl', sub: 'text-xs' };
      case 'hero':
        return { w: 'w-24 h-24', text: 'text-4xl', sub: 'text-xs' };
    }
  };

  const dim = getDimensions();

  if (size === 'hero') {
    return (
      <div className={`flex flex-col items-center justify-center text-center ${className}`}>
        <div className="relative group">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-[#ffd56d]/25 blur-2xl rounded-full transform group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
          
          {/* Vector 3D Geometric W Brandmark */}
          <div className="relative w-44 h-24 sm:w-56 sm:h-28 flex items-center justify-center">
            <svg viewBox="0 0 200 110" className="w-full h-full drop-shadow-[0_10px_25px_rgba(229,184,66,0.45)]">
              <defs>
                <linearGradient id="goldGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fff2c5" />
                  <stop offset="45%" stopColor="#ffd56d" />
                  <stop offset="100%" stopColor="#aa8214" />
                </linearGradient>
                <linearGradient id="goldGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffea9f" />
                  <stop offset="60%" stopColor="#e5b842" />
                  <stop offset="100%" stopColor="#775a00" />
                </linearGradient>
                <linearGradient id="goldGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#fff9e0" />
                </linearGradient>
              </defs>
              {/* Left Wing */}
              <polygon points="15,20 45,20 70,95 40,95" fill="url(#goldGrad1)" />
              <polygon points="45,20 75,70 60,95 40,95" fill="url(#goldGrad2)" opacity="0.85" />
              {/* Center V */}
              <polygon points="65,95 100,25 125,25 90,95" fill="url(#goldGrad3)" />
              <polygon points="100,25 135,95 110,95 85,45" fill="url(#goldGrad1)" />
              {/* Right Wing */}
              <polygon points="130,95 160,20 190,20 155,95" fill="url(#goldGrad2)" />
              <polygon points="160,20 175,55 155,95 140,95" fill="url(#goldGrad1)" opacity="0.9" />
            </svg>
          </div>
        </div>

        <div className="mt-2 flex flex-col items-center">
          <span className="font-display font-extrabold text-2xl sm:text-3xl tracking-[0.28em] text-[#ffd56d] uppercase drop-shadow-[0_2px_8px_rgba(255,213,109,0.3)]">
            W U I S H
          </span>
          <div className="flex items-center gap-2 mt-1 opacity-75">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-[#d1c5af] font-medium">
              We Unite Ideas • Strategy • Horizons
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`${dim.w} rounded-lg bg-[#201f21] border border-[#ffd56d]/30 flex items-center justify-center p-1.5 shadow-[inset_0_1px_1px_rgba(255,213,109,0.25)] shrink-0`}>
        <svg viewBox="0 0 100 60" className="w-full h-full">
          <defs>
            <linearGradient id="miniGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff2c5" />
              <stop offset="50%" stopColor="#ffd56d" />
              <stop offset="100%" stopColor="#aa8214" />
            </linearGradient>
          </defs>
          <polygon points="5,10 22,10 38,50 20,50" fill="url(#miniGold)" />
          <polygon points="35,50 55,15 70,15 50,50" fill="url(#miniGold)" opacity="0.9" />
          <polygon points="65,50 82,10 98,10 80,50" fill="url(#miniGold)" />
        </svg>
      </div>

      <div className="flex flex-col text-left leading-tight">
        <span className={`font-display font-bold ${dim.text} tracking-wider text-white uppercase`}>
          WUISH
        </span>
        {showSubtitle && (
          <span className={`${dim.sub} tracking-[0.16em] uppercase text-[#ffd56d]/80 font-medium`}>
            Enterprise Suite
          </span>
        )}
      </div>
    </div>
  );
};
