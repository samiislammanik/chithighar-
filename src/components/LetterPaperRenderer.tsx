import React, { forwardRef } from 'react';
import { Letter, FontFamily } from '../types';
import { WaxSealBadge } from './WaxSealBadge';
import { StampBadge } from './StampBadge';
import { getPaperConfig, normalizePaperId, PaperOrnamentStyle } from '../utils/stationery';
import { useLanguage } from '../context/LanguageContext';
import { toBengaliNumber, countWords } from '../utils/formatters';

interface LetterPaperRendererProps {
  letter: Letter;
  id?: string;
  isExportMode?: boolean;
}

export const LetterPaperRenderer = forwardRef<HTMLDivElement, LetterPaperRendererProps>(
  ({ letter, id = 'letter-paper-content', isExportMode = false }, ref) => {
    const { language, t } = useLanguage();
    const paperConfig = getPaperConfig(letter.paperStyle);
    const wordCount = countWords(letter.content);

    const fontStyles: Record<FontFamily, string> = {
      'noto-serif': 'font-serif',
      'hind-siliguri': 'font-sans',
      kalam: 'font-handwriting',
      playfair: 'font-serif italic',
    };

    const activeFont = fontStyles[letter.fontFamily] || 'font-serif';
    const isDark = normalizePaperId(letter.paperStyle) === 'celestial-moonlit-night';

    // Renders custom SVG artwork corner ornaments for the 15 distinct designs
    const renderCornerOrnament = (
      ornament: PaperOrnamentStyle,
      position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    ) => {
      const posClasses = {
        'top-left': 'top-2.5 left-2.5',
        'top-right': 'top-2.5 right-2.5 rotate-90',
        'bottom-left': 'bottom-2.5 left-2.5 -rotate-90',
        'bottom-right': 'bottom-2.5 right-2.5 rotate-180',
      }[position];

      switch (ornament) {
        case 'vintage_rose_bouquet':
          return (
            <div className={`absolute ${posClasses} pointer-events-none opacity-85`} aria-hidden="true">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Botanical Leaves */}
                <path d="M4 4C14 10 20 22 22 34C18 26 12 18 4 4Z" fill="#4B6347" opacity="0.45" />
                <path d="M4 4C10 14 22 20 34 22C26 18 18 12 4 4Z" fill="#3D533A" opacity="0.4" />
                {/* Vintage Rose Bud */}
                <circle cx="15" cy="15" r="7.5" fill="#8C2B3B" opacity="0.75" />
                <path d="M11 15C13 11 18 11 20 15C17 19 12 18 11 15Z" fill="#AA3A4D" opacity="0.9" />
                <path d="M13 13C15 10 17 12 16 15" stroke="#F6D3DA" strokeWidth="0.8" strokeLinecap="round" />
                <circle cx="21" cy="9" r="3.5" fill="#752230" opacity="0.7" />
                <path d="M4 4L24 24" stroke="#8A6642" strokeWidth="0.8" opacity="0.6" strokeDasharray="1.5 1.5" />
              </svg>
            </div>
          );

        case 'torn_deckle_edge':
          return (
            <div className={`absolute ${posClasses} pointer-events-none opacity-70`} aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Torn paper rough edge stitches */}
                <path d="M2 38L4 28L2 20L5 12L2 2L12 5L20 2L28 4L38 2" stroke="#876847" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="18" cy="18" r="9" stroke="#7A5633" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />
                <text x="18" y="19" textAnchor="middle" fontSize="5" fontFamily="monospace" fill="#7A5633" opacity="0.8">GPO</text>
              </svg>
            </div>
          );

        case 'botanical_fern':
          return (
            <div className={`absolute ${posClasses} pointer-events-none opacity-80`} aria-hidden="true">
              <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3C12 8 18 20 20 36" stroke="#2B4D31" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
                {/* Fern leaflets */}
                <path d="M6 10C12 9 14 14 10 16" fill="#3D6844" opacity="0.5" />
                <path d="M10 6C9 12 14 14 16 10" fill="#4B7A53" opacity="0.5" />
                <path d="M12 18C18 17 20 22 16 24" fill="#3D6844" opacity="0.45" />
                <path d="M18 12C17 18 22 20 24 16" fill="#4B7A53" opacity="0.45" />
                <circle cx="7" cy="7" r="1.5" fill="#2B4D31" />
              </svg>
            </div>
          );

        case 'classic_gold_filigree':
        case 'victorian_gold_leaf':
          return (
            <div className={`absolute ${posClasses} pointer-events-none opacity-85`} aria-hidden="true">
              <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 2H28C28 16 16 28 2 28V2Z" stroke="#B88A38" strokeWidth="1.4" fill="none" opacity="0.75" />
                <path d="M6 6H22C22 14 14 22 6 22V6Z" stroke="#D4AF37" strokeWidth="1" fill="none" />
                <path d="M2 2L18 18" stroke="#B88A38" strokeWidth="1.2" />
                <circle cx="12" cy="12" r="2.5" fill="#D4AF37" opacity="0.9" />
                <path d="M18 6C18 12 12 18 6 18" stroke="#E2C268" strokeWidth="0.8" />
              </svg>
            </div>
          );

        case 'monarch_butterfly':
          return (
            <div className={`absolute ${posClasses} pointer-events-none opacity-85`} aria-hidden="true">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Monarch Butterfly Wings */}
                <path d="M6 6C16 4 28 8 28 20C22 24 14 20 6 6Z" fill="#C46E31" opacity="0.65" />
                <path d="M6 6C4 16 8 28 20 28C24 22 20 14 6 6Z" fill="#B05B20" opacity="0.6" />
                <path d="M12 12C20 10 24 16 22 22C16 24 10 20 12 12Z" stroke="#3D2012" strokeWidth="0.8" fill="none" opacity="0.7" />
                <circle cx="7" cy="7" r="1.5" fill="#2E170B" />
                <line x1="2" y1="2" x2="30" y2="2" stroke="#8F643B" strokeWidth="0.8" />
                <line x1="2" y1="2" x2="2" y2="30" stroke="#8F643B" strokeWidth="0.8" />
              </svg>
            </div>
          );

        case 'romantic_lace_hearts':
          return (
            <div className={`absolute ${posClasses} pointer-events-none opacity-80`} aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Intertwined Heart Lace */}
                <path d="M12 6C8 2 2 8 6 14L14 22L22 14C26 8 20 2 16 6C15 7 13 7 12 6Z" fill="#A8324A" opacity="0.5" />
                <circle cx="8" cy="8" r="4" stroke="#D16D83" strokeWidth="0.8" fill="none" />
                <path d="M2 30V2H30" stroke="#C4576F" strokeWidth="0.8" strokeDasharray="2 1.5" />
              </svg>
            </div>
          );

        case 'newspaper_chronicle':
          return (
            <div className={`absolute ${posClasses} pointer-events-none opacity-60`} aria-hidden="true">
              <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="34" height="34" stroke="#806951" strokeWidth="1" fill="none" strokeDasharray="3 2" />
                <line x1="2" y1="12" x2="36" y2="12" stroke="#806951" strokeWidth="0.8" />
                <line x1="2" y1="24" x2="36" y2="24" stroke="#806951" strokeWidth="0.8" />
                <line x1="12" y1="2" x2="12" y2="36" stroke="#806951" strokeWidth="0.8" />
              </svg>
            </div>
          );

        case 'minimal_sepia_corner':
          return (
            <div className={`absolute ${posClasses} pointer-events-none opacity-60`} aria-hidden="true">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 28V2H28" stroke="#7A6348" strokeWidth="1.2" fill="none" />
                <path d="M6 28V6H28" stroke="#9E8569" strokeWidth="0.7" fill="none" />
                <circle cx="6" cy="6" r="1.5" fill="#7A6348" />
              </svg>
            </div>
          );

        case 'pressed_lavender':
          return (
            <div className={`absolute ${posClasses} pointer-events-none opacity-80`} aria-hidden="true">
              <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 38L28 14" stroke="#4A5C43" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
                {/* Lavender florets */}
                <ellipse cx="26" cy="12" rx="3" ry="5" fill="#7E527A" opacity="0.65" transform="rotate(25 26 12)" />
                <ellipse cx="22" cy="16" rx="2.5" ry="4.5" fill="#6A3F66" opacity="0.6" transform="rotate(-25 22 16)" />
                <ellipse cx="30" cy="8" rx="2.5" ry="4" fill="#8F638B" opacity="0.7" transform="rotate(30 30 8)" />
                <ellipse cx="18" cy="20" rx="2" ry="4" fill="#7E527A" opacity="0.5" transform="rotate(-30 18 20)" />
              </svg>
            </div>
          );

        case 'heritage_postmark':
          return (
            <div className={`absolute ${posClasses} pointer-events-none opacity-75`} aria-hidden="true">
              <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="14" stroke="#7A5636" strokeWidth="1.2" strokeDasharray="3 1.5" />
                <circle cx="18" cy="18" r="11" stroke="#9E7550" strokeWidth="0.7" />
                <line x1="2" y1="2" x2="38" y2="2" stroke="#7A5636" strokeWidth="1" />
                <line x1="2" y1="2" x2="2" y2="38" stroke="#7A5636" strokeWidth="1" />
                <path d="M12 18H24M18 12V24" stroke="#7A5636" strokeWidth="0.8" />
              </svg>
            </div>
          );

        case 'celestial_moon_stars':
          return (
            <div className={`absolute ${posClasses} pointer-events-none opacity-90`} aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Golden Crescent Moon */}
                <path d="M18 6C11 12 11 24 18 30C10 28 6 18 12 10C13 8 16 6 18 6Z" fill="#E8C35E" opacity="0.85" />
                {/* Stars */}
                <polygon points="28,10 29.5,14 34,14 30.5,17 32,21 28,18 24,21 25.5,17 22,14 26.5,14" fill="#F4E09B" opacity="0.8" />
                <circle cx="36" cy="24" r="1.5" fill="#E8C35E" opacity="0.9" />
                <circle cx="24" cy="32" r="1" fill="#FFFFFF" opacity="0.8" />
                <path d="M2 2H38" stroke="#5A7199" strokeWidth="0.8" opacity="0.6" />
                <path d="M2 2V38" stroke="#5A7199" strokeWidth="0.8" opacity="0.6" />
              </svg>
            </div>
          );

        case 'rose_envelope_collage':
          return (
            <div className={`absolute ${posClasses} pointer-events-none opacity-85`} aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Overlapping mini envelope & dried rose */}
                <rect x="8" y="8" width="24" height="16" rx="2" stroke="#8A5A40" strokeWidth="1" fill="#EFE5D5" fillOpacity="0.4" />
                <path d="M8 8L20 18L32 8" stroke="#8A5A40" strokeWidth="0.9" />
                <circle cx="20" cy="28" r="6" fill="#872230" opacity="0.7" />
                <circle cx="20" cy="28" r="4" stroke="#F1B6C0" strokeWidth="0.8" />
                <path d="M2 2L42 2" stroke="#8A5A40" strokeWidth="1" />
                <path d="M2 2L2 42" stroke="#8A5A40" strokeWidth="1" />
              </svg>
            </div>
          );

        case 'crimson_velvet_vines':
          return (
            <div className={`absolute ${posClasses} pointer-events-none opacity-90`} aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Burgundy Velvet Corner Frame */}
                <path d="M2 2H34C34 14 14 34 2 34V2Z" fill="#5F1623" opacity="0.3" />
                <path d="M4 4H26C26 12 12 26 4 26V4Z" stroke="#B88A38" strokeWidth="1.2" fill="none" />
                {/* Ivy vine curves */}
                <path d="M4 4C14 10 20 20 22 34" stroke="#D4AF37" strokeWidth="1" strokeLinecap="round" />
                <circle cx="16" cy="16" r="2.5" fill="#8C2537" />
                <circle cx="16" cy="16" r="1.2" fill="#E0C068" />
              </svg>
            </div>
          );

        case 'ancient_cartography_compass':
          return (
            <div className={`absolute ${posClasses} pointer-events-none opacity-80`} aria-hidden="true">
              <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* 16-point Compass Rose */}
                <circle cx="18" cy="18" r="14" stroke="#8C6F49" strokeWidth="1.2" strokeDasharray="3 2" />
                <polygon points="18,4 20,16 32,18 20,20 18,32 16,20 4,18 16,16" fill="#8C6F49" opacity="0.5" />
                <circle cx="18" cy="18" r="2.5" fill="#4A341E" />
                <path d="M2 2H40M2 2V40" stroke="#8C6F49" strokeWidth="1" />
                <text x="18" y="2" textAnchor="middle" fontSize="5" fontFamily="serif" fill="#694C2B">N</text>
              </svg>
            </div>
          );

        default:
          return (
            <div className={`absolute ${posClasses} pointer-events-none opacity-40`} aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 22V2H22" stroke="currentColor" strokeWidth="1" fill="none" />
              </svg>
            </div>
          );
      }
    };

    return (
      <article
        ref={ref}
        id={id}
        className={`relative w-full rounded-2xl p-6 sm:p-12 md:p-16 border-2 transition-all overflow-hidden ${
          paperConfig.bgClass
        } ${paperConfig.textClass} ${paperConfig.borderClass} ${activeFont}`}
        style={{
          boxShadow: isExportMode
            ? 'none'
            : isDark
            ? '0 20px 50px -10px rgba(10,14,24,0.7), inset 0 0 100px rgba(0,0,0,0.5)'
            : '0 20px 45px -10px rgba(44,36,30,0.18), 0 0 1px 1px rgba(0,0,0,0.06), inset 0 0 80px rgba(0,0,0,0.02)',
          backgroundImage: paperConfig.ruledLines
            ? `repeating-linear-gradient(transparent, transparent 31px, ${paperConfig.lineColor || 'rgba(0,0,0,0.06)'} 31px, ${paperConfig.lineColor || 'rgba(0,0,0,0.06)'} 32px)`
            : undefined,
          backgroundAttachment: 'local',
        }}
      >
        {/* Subtle authentic inner decorative framing */}
        <div
          className={`absolute inset-3 sm:inset-5 rounded-xl border pointer-events-none ${paperConfig.innerFrameBorder}`}
        />

        {/* 4 Authentic Corner Ornaments */}
        {renderCornerOrnament(paperConfig.cornerOrnament, 'top-left')}
        {renderCornerOrnament(paperConfig.cornerOrnament, 'top-right')}
        {renderCornerOrnament(paperConfig.cornerOrnament, 'bottom-left')}
        {renderCornerOrnament(paperConfig.cornerOrnament, 'bottom-right')}

        {/* Center Nostalgic Watermark */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
          aria-hidden="true"
        >
          <div className="transform -rotate-12 text-center opacity-10">
            <span className="text-4xl sm:text-6xl font-serif font-black tracking-widest uppercase block">
              চিঠিঘর
            </span>
            <span className="text-xs sm:text-sm font-mono tracking-widest uppercase block mt-1">
              CHITHIGHOR POSTAL HERITAGE
            </span>
          </div>
        </div>

        {/* Top Header: Metadata, Category, Postal Stamp, Wax Seal */}
        <header className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-current/15 pb-6 mb-8">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs tracking-wider uppercase opacity-75 font-mono px-2 py-0.5 rounded-sm bg-black/5">
                {t.categories[letter.category] || letter.category}
              </span>
              <span className="text-xs opacity-60 font-mono">•</span>
              <span className="text-xs opacity-85 font-serif font-bold">
                {paperConfig.nameBn}
              </span>
              {!paperConfig.isFree && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-sm bg-amber-400/20 text-amber-700">
                  PREMIUM
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight pt-1">
              {letter.title || 'শিরোনামহীন চিঠি'}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs opacity-75 font-mono pt-1">
              <span>
                {new Date(letter.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span>•</span>
              <span>
                {toBengaliNumber(wordCount)} {t.wordsCount}
              </span>
              {!isExportMode && letter.viewsCount !== undefined && (
                <>
                  <span>•</span>
                  <span>{toBengaliNumber(letter.viewsCount)} বার পঠিত</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <StampBadge stamp={letter.stampStyle} size="sm" showPostmark={true} />
            <WaxSealBadge seal={letter.waxSeal} color={letter.envelopeColor} size="md" />
          </div>
        </header>

        {/* Letter Body Content */}
        <main className="relative z-10 text-base sm:text-lg leading-[2.1] sm:leading-[2.3] whitespace-pre-line tracking-wide my-8 min-h-[160px]">
          {letter.content}
        </main>

        {/* Letter Footer: Addressee & Author Username / Sign-off */}
        <footer className="relative z-10 border-t border-current/15 pt-6 mt-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-sm">
          {/* Left: Recipient */}
          <div className="space-y-0.5 opacity-90">
            <span className="text-xs opacity-70 block font-mono">{t.toRecipient}:</span>
            <strong className="text-base font-semibold">
              {letter.recipientUsername
                ? `@${letter.recipientUsername}`
                : letter.recipientType === 'public'
                ? 'সবার উদ্দেশ্যে (To Everyone)'
                : 'গোপন প্রাপক (Private)'}
            </strong>
          </div>

          {/* Right: Author Sign-off + Author Username */}
          <div className="text-left sm:text-right space-y-1">
            <span className="text-xs italic opacity-75 block font-serif">ইতি,</span>
            <strong className="text-base sm:text-lg font-bold block">
              {letter.isAnonymous ? t.anonymousSender : letter.authorName}
            </strong>
            {/* Show author username or anonymous stamp */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/5 text-[11px] font-mono opacity-85">
              <span>লেখক:</span>
              <span className="font-semibold">
                {letter.isAnonymous ? 'গোপন পরিচয় (Anonymous)' : `@${letter.authorName.toLowerCase().replace(/\s+/g, '_')}`}
              </span>
            </div>
          </div>
        </footer>

        {/* Persistent Bottom Watermark Footer Bar */}
        <div className="relative z-10 mt-8 pt-4 border-t border-current/10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] font-mono opacity-65">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#801D2E] inline-block" />
            <span>চিঠিঘর • Chithighor — Digital Heritage Postal Service</span>
          </div>
          <div>
            <span>ID: {letter.id}</span>
          </div>
        </div>
      </article>
    );
  }
);

LetterPaperRenderer.displayName = 'LetterPaperRenderer';
