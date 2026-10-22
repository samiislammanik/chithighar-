import React from 'react';
import { Letter } from '../types';
import { WaxSealBadge } from './WaxSealBadge';
import { StampBadge } from './StampBadge';
import { formatRelativeTime, toBengaliNumber, countWords } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';
import { Eye, Heart, MessageSquare, Bookmark } from 'lucide-react';

interface LetterCardProps {
  letter: Letter;
  onClick: () => void;
  onBookmark?: (letter: Letter) => void;
  isBookmarked?: boolean;
}

export const LetterCard: React.FC<LetterCardProps> = ({
  letter,
  onClick,
  onBookmark,
  isBookmarked = false,
}) => {
  const { language, t } = useLanguage();

  const totalReactions = Object.values(letter.reactions || {}).reduce(
    (acc, val) => acc + (val || 0),
    0
  );

  const wordCount = countWords(letter.content);
  const snippet =
    letter.content.length > 170
      ? letter.content.slice(0, 170) + '...'
      : letter.content;

  const categoryLabels: Record<string, { label: string; bg: string; text: string }> = {
    love: { label: t.categories.love, bg: 'bg-rose-100/90', text: 'text-rose-900 border-rose-200' },
    friendship: { label: t.categories.friendship, bg: 'bg-amber-100/90', text: 'text-amber-900 border-amber-200' },
    family: { label: t.categories.family, bg: 'bg-emerald-100/90', text: 'text-emerald-900 border-emerald-200' },
    apology: { label: t.categories.apology, bg: 'bg-purple-100/90', text: 'text-purple-900 border-purple-200' },
    memories: { label: t.categories.memories, bg: 'bg-orange-100/90', text: 'text-orange-900 border-orange-200' },
    motivation: { label: t.categories.motivation, bg: 'bg-sky-100/90', text: 'text-sky-900 border-sky-200' },
    unsent: { label: t.categories.unsent, bg: 'bg-stone-200/90', text: 'text-stone-900 border-stone-300' },
    general: { label: t.categories.general, bg: 'bg-yellow-100/90', text: 'text-yellow-900 border-yellow-200' },
  };

  const catStyle = categoryLabels[letter.category] || categoryLabels.general;

  // Paper styling class for card
  const cardPaperStyles: Record<string, string> = {
    'vintage-parchment': 'bg-[#FAF4E8] border-[#DFD1B8] text-[#382C24]',
    'cream-linen': 'bg-[#FBF8F2] border-[#E8DFD0] text-[#2C241E]',
    'rose-petal': 'bg-[#FFF5F5] border-[#F0D5D5] text-[#3E2528]',
    'night-sky': 'bg-[#212836] border-[#364259] text-[#EDE8DF]',
    'classic-kraft': 'bg-[#EFE5D3] border-[#D6C5A9] text-[#34271A]',
    'tear-stained': 'bg-[#F4F4F4] border-[#DCDCDC] text-[#2F2F2F]',
  };

  const paperClass = cardPaperStyles[letter.paperStyle] || cardPaperStyles['cream-linen'];
  const isDarkPaper = letter.paperStyle === 'night-sky';

  return (
    <article
      onClick={onClick}
      className={`group relative rounded-xl border p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden transform hover:-translate-y-1.5 select-none ${paperClass}`}
      style={{
        boxShadow:
          '0 3px 10px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06), inset 0 0 40px rgba(0,0,0,0.015)',
      }}
    >
      {/* Postal postmark watermark background */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full border border-current opacity-[0.05] pointer-events-none" />

      {/* Top Header: Category, Date, Bookmark */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`text-[11px] font-medium font-serif px-2.5 py-0.5 rounded-full border ${catStyle.bg} ${catStyle.text}`}
          >
            {catStyle.label}
          </span>

          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-serif ${isDarkPaper ? 'text-stone-400' : 'text-stone-500'}`}
            >
              {formatRelativeTime(letter.createdAt, language)}
            </span>

            {onBookmark && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmark(letter);
                }}
                className={`p-1 rounded-full transition-colors ${
                  isBookmarked
                    ? 'text-amber-600 bg-amber-100/60'
                    : isDarkPaper
                    ? 'text-stone-400 hover:text-white'
                    : 'text-stone-400 hover:text-stone-700'
                }`}
                title={isBookmarked ? 'সংরক্ষিত চিঠি' : 'সংরক্ষণ করুন'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Recipient line */}
        <div className="mb-2">
          <span
            className={`text-xs font-mono tracking-wider uppercase ${isDarkPaper ? 'text-stone-400' : 'text-stone-500'}`}
          >
            {t.toRecipient}:{' '}
            <strong className={`${isDarkPaper ? 'text-stone-200' : 'text-stone-800'} font-semibold font-serif`}>
              {letter.recipientUsername ? `@${letter.recipientUsername}` : (letter.recipientType === 'public' ? 'সবার উদ্দেশ্যে (Everyone)' : 'গোপন প্রাপক')}
            </strong>
          </span>
        </div>

        {/* Letter Title */}
        <h3
          className={`text-lg sm:text-xl font-serif font-bold tracking-tight mb-2.5 group-hover:text-[#801D2E] transition-colors leading-snug ${
            isDarkPaper ? 'group-hover:text-amber-200 text-stone-100' : 'text-stone-900'
          }`}
        >
          {letter.title}
        </h3>

        {/* Letter Content Snippet */}
        <p
          className={`text-sm font-serif leading-relaxed line-clamp-3 mb-4 whitespace-pre-line ${
            isDarkPaper ? 'text-stone-300' : 'text-stone-700'
          }`}
        >
          {snippet}
        </p>
      </div>

      {/* Footer Area: Author signature & reaction stats */}
      <div
        className={`pt-3.5 border-t flex items-center justify-between gap-3 text-xs font-serif ${
          isDarkPaper ? 'border-stone-700/60 text-stone-400' : 'border-stone-300/60 text-stone-600'
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <WaxSealBadge seal={letter.waxSeal} color={letter.envelopeColor} size="sm" />
          <span className="truncate italic">
            {letter.isAnonymous ? t.anonymousSender : letter.authorName}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1 font-mono text-[11px]" title="মোট অনুভূতি">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
            {toBengaliNumber(totalReactions)}
          </span>

          <span className="flex items-center gap-1 font-mono text-[11px]" title="পাঠক সংখ্যা">
            <Eye className="w-3.5 h-3.5" />
            {toBengaliNumber(letter.viewsCount || 0)}
          </span>
        </div>
      </div>
    </article>
  );
};
