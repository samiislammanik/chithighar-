import React, { useState } from 'react';
import { Letter } from '../types';
import { WaxSealBadge } from './WaxSealBadge';
import { StampBadge } from './StampBadge';
import { playWaxSealBreak, playPaperRustle } from '../utils/sound';
import { useLanguage } from '../context/LanguageContext';
import { getEnvelopeConfig, normalizeEnvelopeId } from '../utils/stationery';

interface EnvelopeAnimationProps {
  letter: Letter;
  isOpenDefault?: boolean;
  onOpen?: () => void;
  children?: React.ReactNode;
}

export const EnvelopeAnimation: React.FC<EnvelopeAnimationProps> = ({
  letter,
  isOpenDefault = false,
  onOpen,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  const [isAnimating, setIsAnimating] = useState(false);
  const { t } = useLanguage();

  const envelopeConfig = getEnvelopeConfig(letter.envelopeColor);

  const handleOpen = () => {
    if (isOpen || isAnimating) return;
    setIsAnimating(true);
    playWaxSealBreak();

    setTimeout(() => {
      setIsOpen(true);
      setIsAnimating(false);
      if (onOpen) onOpen();
    }, 600);
  };

  const handleClose = () => {
    playPaperRustle();
    setIsOpen(false);
  };

  const normalizedColor = normalizeEnvelopeId(letter.envelopeColor);

  return (
    <div className="w-full flex flex-col items-center select-none">
      {!isOpen ? (
        <div
          onClick={handleOpen}
          className="group relative w-full max-w-lg cursor-pointer transform transition-all duration-500 hover:-translate-y-1 select-none"
        >
          {/* Outer envelope container */}
          <div
            className={`relative w-full h-76 sm:h-88 rounded-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden border-2 shadow-2xl transition-all ${envelopeConfig.bgClass}`}
            style={{
              boxShadow:
                '0 24px 48px -12px rgba(25,18,14,0.45), 0 0 1px 1px rgba(255,255,255,0.12) inset',
            }}
          >
            {/* Ambient envelope gradients and paper grain */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/35 via-transparent to-black/35" />

            {/* Subtle vintage envelope inner border frame */}
            <div
              className="absolute inset-3 rounded-xl border border-white/10 pointer-events-none"
              style={{ borderColor: `${envelopeConfig.borderColor}55` }}
            />

            {/* Top row: Stamp & Postmark */}
            <div className="w-full flex justify-between items-start z-10">
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest opacity-85 border-b border-current/20 pb-0.5">
                  CHITHIGHOR POSTAL SERVICE
                </span>
                <span className="text-[11px] font-serif mt-1 italic opacity-90">
                  {envelopeConfig.nameBn} • {letter.category.toUpperCase()}
                </span>
              </div>

              <div className="transform rotate-1 group-hover:rotate-0 transition-transform">
                <StampBadge stamp={letter.stampStyle} size="md" />
              </div>
            </div>

            {/* Recipient Handwritten Label Area */}
            <div className="z-10 my-auto text-center px-5 py-3.5 bg-black/15 backdrop-blur-xs rounded-xl border border-white/10 shadow-xs">
              <span className="text-[11px] opacity-75 uppercase tracking-widest font-mono">
                {t.toRecipient}:
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold drop-shadow-xs tracking-wide mt-0.5">
                {letter.recipientUsername
                  ? `@${letter.recipientUsername}`
                  : letter.title || 'প্রিয় পাঠক'}
              </h3>
              <p className="text-xs opacity-80 mt-1 font-serif italic">
                {letter.isAnonymous ? `প্রেরক: ${t.anonymousSender}` : `প্রেরক: ${letter.authorName}`}
              </p>
            </div>

            {/* Bottom: Instruction prompt */}
            <div className="w-full text-center z-10 flex items-center justify-center gap-2">
              <span className="inline-block w-8 h-[1px] bg-current opacity-30" />
              <span className="text-xs font-serif tracking-wide font-medium group-hover:opacity-100 opacity-85 transition-opacity">
                {isAnimating ? 'সিলমোহর খোলা হচ্ছে...' : t.breakSealToRead}
              </span>
              <span className="inline-block w-8 h-[1px] bg-current opacity-30" />
            </div>

            {/* Wax Seal affixed over flap tip */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 transition-transform duration-500
                ${isAnimating ? 'scale-125 opacity-0' : 'group-hover:scale-110'}`}
            >
              <WaxSealBadge
                seal={letter.waxSeal}
                color={normalizedColor}
                size="lg"
                interactive
              />
            </div>

            {/* Decorative triangular flap fold lines */}
            <div
              className={`absolute -top-1 left-0 right-0 h-0 border-l-[180px] sm:border-l-[256px] border-l-transparent border-r-[180px] sm:border-r-[256px] border-r-transparent border-t-[145px] sm:border-t-[160px] opacity-25 pointer-events-none transition-transform duration-700 origin-top
                ${envelopeConfig.flapBorderColor} ${isAnimating ? '-rotate-x-180' : ''}`}
            />
          </div>
        </div>
      ) : (
        /* Unfolded Letter inside open view */
        <div className="w-full max-w-4xl flex flex-col items-center">
          {/* Close back to envelope button */}
          <div className="w-full flex justify-end mb-3">
            <button
              onClick={handleClose}
              className="inline-flex items-center gap-1.5 text-xs font-serif px-3.5 py-1.5 rounded-full bg-stone-200/90 hover:bg-stone-300 text-stone-800 transition-colors shadow-xs"
              title="চিঠিটি পুনরায় খামে ভরে রাখুন"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span>খামে ভরে রাখুন (Refold Envelope)</span>
            </button>
          </div>

          {/* Letter Paper Body */}
          <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};
