import React, { useState, useMemo } from 'react';
import { Letter, LetterCategory } from '../types';
import { LetterCard } from '../components/LetterCard';
import { useLanguage } from '../context/LanguageContext';
import { toBengaliNumber } from '../utils/formatters';
import {
  Search,
  PenTool,
  Filter,
  Sparkles,
  Heart,
  Clock,
  Compass,
  X,
} from 'lucide-react';

interface CommunityPageProps {
  letters: Letter[];
  onOpenLetter: (letter: Letter) => void;
  onBookmarkLetter: (letter: Letter) => void;
  onWriteLetter: () => void;
  bookmarkedIds: Set<string>;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({
  letters,
  onOpenLetter,
  onBookmarkLetter,
  onWriteLetter,
  bookmarkedIds,
}) => {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'unsent'>('latest');

  const categories: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: t.categories.all, icon: '📜' },
    { id: 'love', label: t.categories.love, icon: '💌' },
    { id: 'friendship', label: t.categories.friendship, icon: '🤝' },
    { id: 'family', label: t.categories.family, icon: '🏡' },
    { id: 'apology', label: t.categories.apology, icon: '🕊️' },
    { id: 'memories', label: t.categories.memories, icon: '🕰️' },
    { id: 'motivation', label: t.categories.motivation, icon: '✨' },
    { id: 'unsent', label: t.categories.unsent, icon: '✉️' },
    { id: 'general', label: t.categories.general, icon: '🌿' },
  ];

  const filteredLetters = useMemo(() => {
    return letters
      .filter(l => {
        // Only public, published, non-moderated letters
        if (l.visibility !== 'public' || l.isDraft || l.isModerated) return false;

        // Category filter
        if (selectedCategory !== 'all' && l.category !== selectedCategory) return false;

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = l.title.toLowerCase().includes(q);
          const matchContent = l.content.toLowerCase().includes(q);
          const matchAuthor = l.authorName.toLowerCase().includes(q);
          const matchRecipient = l.recipientUsername?.toLowerCase().includes(q);
          if (!matchTitle && !matchContent && !matchAuthor && !matchRecipient) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') {
          const aReactions = Object.values(a.reactions || {}).reduce((sum, n) => sum + (n || 0), 0);
          const bReactions = Object.values(b.reactions || {}).reduce((sum, n) => sum + (n || 0), 0);
          return bReactions - aReactions;
        }
        if (sortBy === 'unsent') {
          if (a.category === 'unsent' && b.category !== 'unsent') return -1;
          if (b.category === 'unsent' && a.category !== 'unsent') return 1;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [letters, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 select-none">
      {/* Page Title & Intro */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E8DFD0] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#801D2E]/10 text-[#801D2E]">
              <Compass className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900">
              {t.exploreLetters} (Community Letters)
            </h1>
          </div>
          <p className="text-xs font-serif text-stone-600 mt-1">
            {language === 'bn'
              ? 'অচেনা ও চেনা মানুষদের হৃদয়ের গভীর থেকে লেখা আবেগঘন চিঠির উন্মুক্ত জগৎ।'
              : 'Browse public letters written by quiet souls across Bangladesh and worldwide.'}
          </p>
        </div>

        <button
          onClick={onWriteLetter}
          className="px-5 py-2.5 rounded-xl text-xs font-serif font-bold text-white bg-gradient-to-r from-[#801D2E] to-[#601422] hover:from-[#942236] hover:to-[#731829] shadow-md transition-all flex items-center gap-1.5"
        >
          <PenTool className="w-4 h-4" />
          <span>{t.writeALetterBtn}</span>
        </button>
      </div>

      {/* Search Bar & Sorting Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D5C6B0] bg-white text-stone-900 font-serif text-sm focus:outline-none focus:ring-2 focus:ring-[#801D2E]/30 focus:border-[#801D2E]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-serif text-stone-500 whitespace-nowrap hidden sm:inline">
            সাজান:
          </span>
          <button
            onClick={() => setSortBy('latest')}
            className={`px-3 py-1.5 rounded-xl text-xs font-serif font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
              sortBy === 'latest'
                ? 'bg-[#801D2E] text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t.latest}</span>
          </button>

          <button
            onClick={() => setSortBy('popular')}
            className={`px-3 py-1.5 rounded-xl text-xs font-serif font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
              sortBy === 'popular'
                ? 'bg-[#801D2E] text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-300" />
            <span>{t.popular}</span>
          </button>

          <button
            onClick={() => setSortBy('unsent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-serif font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
              sortBy === 'unsent'
                ? 'bg-[#801D2E] text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>না-বলা অনুভূতি (Unsent)</span>
          </button>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-serif font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-[#801D2E] text-amber-50 shadow-sm ring-2 ring-[#801D2E]/20'
                : 'bg-[#F4EDE0] text-stone-700 hover:bg-[#EBE2D2] border border-[#DECDB7]'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Letters Grid */}
      {filteredLetters.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-serif text-stone-500">
            <span>
              {language === 'bn'
                ? `মোট ${toBengaliNumber(filteredLetters.length)} টি চিঠি প্রদর্শিত হচ্ছে`
                : `Showing ${filteredLetters.length} letters`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLetters.map(letter => (
              <LetterCard
                key={letter.id}
                letter={letter}
                onClick={() => onOpenLetter(letter)}
                onBookmark={onBookmarkLetter}
                isBookmarked={bookmarkedIds.has(letter.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 px-4 rounded-2xl bg-white border border-[#E4DAC8] shadow-xs space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-3xl">
            ✉️
          </div>
          <h3 className="text-xl font-serif font-bold text-stone-800">
            {searchQuery
              ? 'আপনার অনুসন্ধানে কোনো চিঠি পাওয়া যায়নি'
              : 'এই ক্যাটাগরিতে এখনও কোনো চিঠি নেই'}
          </h3>
          <p className="text-xs font-serif text-stone-600 leading-relaxed">
            {searchQuery
              ? 'অন্য কোনো অনুভূতি বা শব্দ লিখে চেষ্টা করুন, অথবা নিজেই একটি নতুন চিঠি লিখে ফেলুন।'
              : 'আপনিই হোন প্রথম ব্যক্তি যিনি এই অনুভূতির একটি সুন্দর চিঠি লিখবেন।'}
          </p>
          <button
            onClick={onWriteLetter}
            className="px-6 py-2.5 rounded-xl text-xs font-serif font-bold text-white bg-[#801D2E] hover:bg-[#962337] transition-colors inline-flex items-center gap-1.5"
          >
            <PenTool className="w-4 h-4" />
            <span>একটি নতুন চিঠি লিখুন</span>
          </button>
        </div>
      )}
    </div>
  );
};
