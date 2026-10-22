import React from 'react';
import { WaxSeal, EnvelopeColor } from '../types';

interface WaxSealBadgeProps {
  seal?: WaxSeal;
  color?: EnvelopeColor;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const WaxSealBadge: React.FC<WaxSealBadgeProps> = ({
  seal = 'heart',
  color = 'burgundy',
  size = 'md',
  interactive = false,
  onClick,
  className = '',
}) => {
  if (seal === 'none') return null;

  const colorStyles: Record<EnvelopeColor, { bg: string; border: string; shadow: string; text: string }> = {
    'classic-ivory': {
      bg: 'bg-gradient-to-br from-[#D9CEBA] via-[#BAAE98] to-[#918572]',
      border: 'border-[#EAE1D0]/80',
      shadow: 'shadow-[0_4px_12px_rgba(145,133,114,0.45)]',
      text: 'text-[#4A4031]',
    },
    'burgundy-velvet': {
      bg: 'bg-gradient-to-br from-[#8A2435] via-[#6B1B29] to-[#4A101C]',
      border: 'border-[#9E2E42]/60',
      shadow: 'shadow-[0_4px_12px_rgba(107,27,41,0.45)]',
      text: 'text-[#FAD4D8]',
    },
    'midnight-blue': {
      bg: 'bg-gradient-to-br from-[#2C497F] via-[#1D3258] to-[#111F36]',
      border: 'border-[#436BB5]/60',
      shadow: 'shadow-[0_4px_12px_rgba(29,50,88,0.45)]',
      text: 'text-[#D8E4FC]',
    },
    'vintage-letter': {
      bg: 'bg-gradient-to-br from-[#BD5338] via-[#943F28] to-[#692C1C]',
      border: 'border-[#D96B4E]/60',
      shadow: 'shadow-[0_4px_12px_rgba(148,63,40,0.45)]',
      text: 'text-[#FCE4DC]',
    },
    'rose-garden': {
      bg: 'bg-gradient-to-br from-[#A8324C] via-[#85233A] to-[#5C1425]',
      border: 'border-[#C24461]/60',
      shadow: 'shadow-[0_4px_12px_rgba(133,35,58,0.45)]',
      text: 'text-[#FFE0E6]',
    },
    'minimal-modern': {
      bg: 'bg-gradient-to-br from-[#4A525A] via-[#353A40] to-[#202327]',
      border: 'border-[#606973]/60',
      shadow: 'shadow-[0_4px_12px_rgba(32,35,39,0.45)]',
      text: 'text-[#E2E6EA]',
    },
    'royal-gold': {
      bg: 'bg-gradient-to-br from-[#C6923C] via-[#9E7227] to-[#6E4F18]',
      border: 'border-[#E0A94E]/60',
      shadow: 'shadow-[0_4px_12px_rgba(158,114,39,0.45)]',
      text: 'text-[#FFF1D6]',
    },
    'botanical-green': {
      bg: 'bg-gradient-to-br from-[#2E6B4B] via-[#1F4A33] to-[#123020]',
      border: 'border-[#3D8A61]/60',
      shadow: 'shadow-[0_4px_12px_rgba(31,74,51,0.45)]',
      text: 'text-[#D0F0DE]',
    },
    'romantic-blush': {
      bg: 'bg-gradient-to-br from-[#BA5D73] via-[#994559] to-[#6E2C3B]',
      border: 'border-[#D1798E]/60',
      shadow: 'shadow-[0_4px_12px_rgba(153,69,89,0.45)]',
      text: 'text-[#FFE8ED]',
    },
    'midnight-romance': {
      bg: 'bg-gradient-to-br from-[#2E1820] via-[#1E0D13] to-[#0F0408]',
      border: 'border-[#4D2836]/60',
      shadow: 'shadow-[0_4px_12px_rgba(15,4,8,0.55)]',
      text: 'text-[#FFD1DC]',
    },
    // Backward compatibility
    burgundy: {
      bg: 'bg-gradient-to-br from-[#8A2435] via-[#6B1B29] to-[#4A101C]',
      border: 'border-[#9E2E42]/60',
      shadow: 'shadow-[0_4px_12px_rgba(107,27,41,0.45)]',
      text: 'text-[#FAD4D8]',
    },
    'forest-green': {
      bg: 'bg-gradient-to-br from-[#2E6B4B] via-[#1F4A33] to-[#123020]',
      border: 'border-[#3D8A61]/60',
      shadow: 'shadow-[0_4px_12px_rgba(31,74,51,0.45)]',
      text: 'text-[#D0F0DE]',
    },
    terracotta: {
      bg: 'bg-gradient-to-br from-[#BD5338] via-[#943F28] to-[#692C1C]',
      border: 'border-[#D96B4E]/60',
      shadow: 'shadow-[0_4px_12px_rgba(148,63,40,0.45)]',
      text: 'text-[#FCE4DC]',
    },
    navy: {
      bg: 'bg-gradient-to-br from-[#2C497F] via-[#1D3258] to-[#111F36]',
      border: 'border-[#436BB5]/60',
      shadow: 'shadow-[0_4px_12px_rgba(29,50,88,0.45)]',
      text: 'text-[#D8E4FC]',
    },
    'gold-sand': {
      bg: 'bg-gradient-to-br from-[#C6923C] via-[#9E7227] to-[#6E4F18]',
      border: 'border-[#E0A94E]/60',
      shadow: 'shadow-[0_4px_12px_rgba(158,114,39,0.45)]',
      text: 'text-[#FFF1D6]',
    },
  };

  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-11 h-11 text-xs',
    lg: 'w-16 h-16 text-sm',
    xl: 'w-20 h-20 text-base',
  };

  const style = colorStyles[color] || colorStyles.burgundy;

  const renderIcon = () => {
    switch (seal) {
      case 'rose':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-1/2 h-1/2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 0 0 9-9c0-3-2-6-5-7-2-1-4 0-4 2 0 1-1 2-2 2s-2-1-2-2c0-2-2-3-4-2-3 1-5 4-5 7a9 9 0 0 0 9 9Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          </svg>
        );
      case 'bird':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-1/2 h-1/2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 4s1 3-1 5c-3 3-8 3-10 7-1 2 0 4 2 4s7-3 10-6c2-2 3-5 3-7 0-1-2-3-4-3Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 13c1 0 3-1 4-3" />
          </svg>
        );
      case 'anchor':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-1/2 h-1/2">
            <circle cx="12" cy="5" r="2.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5V20M8 10h8M4 14a8 8 0 0 0 16 0" />
          </svg>
        );
      case 'monogram':
        return (
          <span className="font-serif font-bold tracking-tighter select-none scale-110">
            চি
          </span>
        );
      case 'heart':
      default:
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-1/2 h-1/2">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        );
    }
  };

  return (
    <div
      onClick={interactive ? onClick : undefined}
      className={`relative inline-flex items-center justify-center rounded-full border-2 select-none transition-all duration-300
        ${style.bg} ${style.border} ${style.shadow} ${style.text} ${sizeClasses[size]}
        ${interactive ? 'cursor-pointer hover:scale-105 active:scale-95 hover:brightness-110' : ''}
        ${className}`}
      title="চিঠিঘরের খাঁটি মোমের সিলমোহর"
    >
      {/* Organic wax irregular edge accents */}
      <span className="absolute -inset-0.5 rounded-full border border-white/20 pointer-events-none" />
      <span className="absolute inset-1 rounded-full border border-black/20 pointer-events-none" />
      {/* Outer seal rim */}
      <div className="relative z-10 flex items-center justify-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
        {renderIcon()}
      </div>
    </div>
  );
};
