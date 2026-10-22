import React from 'react';
import { StampStyle } from '../types';

interface StampBadgeProps {
  stamp?: StampStyle;
  size?: 'sm' | 'md' | 'lg';
  showPostmark?: boolean;
  className?: string;
}

export const StampBadge: React.FC<StampBadgeProps> = ({
  stamp = 'dhaka-vintage',
  size = 'md',
  showPostmark = true,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'w-14 h-18 p-1',
    md: 'w-20 h-24 p-1.5',
    lg: 'w-28 h-34 p-2',
  };

  const stampData = {
    'dhaka-vintage': {
      titleBn: 'ঢাকা জিপিও',
      titleEn: 'DHAKA GPO',
      price: '২৫ প.',
      colorBg: 'bg-[#F2E8D5]',
      borderCol: 'border-[#7D3C28]',
      accentCol: 'text-[#853424]',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 opacity-85">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      ),
    },
    'post-runner': {
      titleBn: 'রানার',
      titleEn: 'RUNNER',
      price: '৫০ প.',
      colorBg: 'bg-[#EAE4DC]',
      borderCol: 'border-[#3D5240]',
      accentCol: 'text-[#2D4532]',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 opacity-85">
          <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7" />
        </svg>
      ),
    },
    'water-lily': {
      titleBn: 'শাপলা',
      titleEn: 'SHAPLA',
      price: '১.০০',
      colorBg: 'bg-[#F5EDEB]',
      borderCol: 'border-[#823348]',
      accentCol: 'text-[#823348]',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 opacity-85">
          <path d="M12 2c.5 3 2.5 5 5 6-3 1-4 3-5 7-1-4-2-6-5-7 2.5-1 4.5-3 5-6zm-8 16c2-1 4-1 6 0 1 .5 2 .5 3 0 2-1 4-1 6 0-3 2-6 2-7.5.5-1.5 1.5-4.5 1.5-7.5-.5z" />
        </svg>
      ),
    },
    'bengal-tiger': {
      titleBn: 'বাঘ',
      titleEn: 'BENGAL TIGER',
      price: '২.০০',
      colorBg: 'bg-[#F5EAD4]',
      borderCol: 'border-[#9E651E]',
      accentCol: 'text-[#9E651E]',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 opacity-85">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5a2.5 2.5 0 0 1-5 0c0-1.5 2.5-4 2.5-4s2.5 2.5 2.5 4zm4-5.5a1.5 1.5 0 1 1 1.5-1.5A1.5 1.5 0 0 1 17 11zm-10 0A1.5 1.5 0 1 1 8.5 9.5 1.5 1.5 0 0 1 7 11z" />
        </svg>
      ),
    },
    'tea-garden': {
      titleBn: 'চা বাগান',
      titleEn: 'TEA GARDEN',
      price: '৫.০০',
      colorBg: 'bg-[#E8EDE5]',
      borderCol: 'border-[#2F5938]',
      accentCol: 'text-[#2F5938]',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 opacity-85">
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5c1-1 3-2 5-2 4 0 6 2 7 3" />
        </svg>
      ),
    },
  };

  const item = stampData[stamp] || stampData['dhaka-vintage'];

  return (
    <div className={`relative inline-block select-none ${className}`}>
      {/* Postal Stamp with perforated serrated edges styling */}
      <div
        className={`relative ${sizeStyles[size]} ${item.colorBg} border-2 border-dashed ${item.borderCol} rounded-xs shadow-md flex flex-col justify-between items-center text-center overflow-hidden`}
        style={{
          boxShadow: '0 2px 6px rgba(0,0,0,0.12), inset 0 0 10px rgba(0,0,0,0.04)',
        }}
      >
        {/* Top Header */}
        <div className="w-full flex items-center justify-between text-[8px] font-bold tracking-wider px-1 text-stone-700 uppercase">
          <span>BANGLADESH</span>
          <span className="font-mono text-[9px]">{item.price}</span>
        </div>

        {/* Motif icon */}
        <div className={`my-auto flex flex-col items-center justify-center ${item.accentCol}`}>
          {item.icon}
          <span className="font-serif text-[9px] font-semibold mt-0.5 tracking-tight">
            {item.titleBn}
          </span>
        </div>

        {/* Bottom Label */}
        <div className="w-full text-[7px] text-stone-600 font-mono tracking-widest uppercase border-t border-dashed border-stone-400/50 pt-0.5">
          {item.titleEn}
        </div>
      </div>

      {/* Postmark / Postal Cancellation Ring */}
      {showPostmark && (
        <div
          className="absolute -bottom-3 -right-3 w-16 h-16 pointer-events-none rounded-full border border-stone-800/40 flex flex-col items-center justify-center -rotate-12 select-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, transparent 60%, rgba(44,36,30,0.08) 61%)',
          }}
        >
          <div className="text-[6px] font-mono text-stone-800/60 uppercase tracking-widest">
            DHAKA GPO
          </div>
          <div className="w-10 h-[1px] bg-stone-800/40 my-0.5"></div>
          <div className="text-[7px] font-mono font-bold text-stone-800/70 tracking-tighter">
            21.OCT.2026
          </div>
          <div className="text-[5px] font-mono text-stone-800/50 uppercase">
            POSTAGE PAID
          </div>
        </div>
      )}
    </div>
  );
};
