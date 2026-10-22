import React, { useState } from 'react';
import { Letter } from '../types';
import { EnvelopeAnimation } from '../components/EnvelopeAnimation';
import { LetterCard } from '../components/LetterCard';
import { useLanguage } from '../context/LanguageContext';
import { toBengaliNumber } from '../utils/formatters';
import {
  PenTool,
  Compass,
  Package,
  Heart,
  Mail,
  ShieldCheck,
  Sparkles,
  MapPin,
  Clock,
  Feather,
  ArrowRight,
  Send,
} from 'lucide-react';

interface HomePageProps {
  letters: Letter[];
  setCurrentTab: (tab: string) => void;
  onOpenLetter: (letter: Letter) => void;
  onBookmarkLetter: (letter: Letter) => void;
  bookmarkedIds: Set<string>;
}

export const HomePage: React.FC<HomePageProps> = ({
  letters,
  setCurrentTab,
  onOpenLetter,
  onBookmarkLetter,
  bookmarkedIds,
}) => {
  const { t, language } = useLanguage();

  // Featured sample letter for interactive hero envelope
  const heroLetter: Letter = letters[0] || {
    id: 'chithi-hero',
    title: 'মেঘবালিকা, তুমি কেমন আছো?',
    content: `প্রিয় মেঘবালিকা,\n\nঅনেক বছর পর আজ হঠাৎ বৃষ্টি নামলো। জানালার কাঁচ ছুঁয়ে বৃষ্টির ফোঁটাগুলো যখন নিচে গড়িয়ে পড়ছিল, আমার কেন যেন পুরোনো সেই বিশ্ববিদ্যালয় ক্যাম্পাসের করিডোরটার কথা মনে পড়ে গেল।\n\nকিছু কথা সামনাসামনি বলা যায় না, কিছু অনুভূতি কোনোদিন পুরনো হয় না। তুমি যেখানেই থাকো, ভালো থেকো।\n\nইতি,\nএকজন অচেনা পথচারী`,
    authorId: 'hero_author',
    authorName: 'অচেনা পথচারী',
    isAnonymous: true,
    recipientType: 'public',
    visibility: 'public',
    category: 'love',
    paperStyle: 'vintage-parchment',
    fontFamily: 'noto-serif',
    envelopeColor: 'burgundy',
    waxSeal: 'rose',
    stampStyle: 'dhaka-vintage',
    reactions: { heart: 124, crying: 12, hug: 68, rose: 95, feather: 41 },
    viewsCount: 890,
    savesCount: 112,
    isDraft: false,
    createdAt: new Date().toISOString(),
  };

  const publicLetters = letters.filter(l => l.visibility === 'public' && !l.isDraft && !l.isModerated).slice(0, 6);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-12 px-4 sm:px-6 lg:px-8 border-b border-[#E8DFD0] bg-gradient-to-b from-[#F7F2E8]/60 via-[#FAF7F2] to-[#FAF7F2]">
        {/* Soft radial glow in background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Emotional Epistolary Hook */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#801D2E]/10 border border-[#801D2E]/20 text-[#801D2E] text-xs font-serif font-medium">
              <Feather className="w-3.5 h-3.5" />
              <span>{t.heroBadge}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-[#2B1B17] leading-[1.18]">
              {language === 'bn' ? (
                <>
                  কিছু কথা <span className="text-[#801D2E] underline decoration-amber-400/40 decoration-wavy underline-offset-8">চিঠিতেই সুন্দর</span>
                </>
              ) : (
                <>
                  Some words are beautiful <span className="text-[#801D2E] underline decoration-amber-400/40 decoration-wavy underline-offset-8">only in letters</span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg font-serif text-[#5E4C40] leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {t.heroSubheading}
            </p>

            {/* Nostalgic quote callout */}
            <blockquote className="p-4 rounded-xl bg-[#F4EDE0]/80 border-l-4 border-[#801D2E] text-stone-800 font-serif text-sm italic max-w-xl mx-auto lg:mx-0">
              {t.heroQuote}
              <footer className="text-right text-xs not-italic text-stone-500 mt-1 font-sans">
                {t.heroQuoteAuthor}
              </footer>
            </blockquote>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <button
                onClick={() => setCurrentTab('write')}
                className="px-6 py-3.5 rounded-xl text-base font-serif font-bold text-white bg-gradient-to-r from-[#801D2E] to-[#601422] hover:from-[#942236] hover:to-[#731829] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <PenTool className="w-5 h-5" />
                <span>{t.writeALetterBtn}</span>
              </button>

              <button
                onClick={() => setCurrentTab('community')}
                className="px-6 py-3.5 rounded-xl text-base font-serif font-semibold border-2 border-[#D6C4AD] bg-[#FAF5EC] hover:bg-[#F3ECE0] text-stone-800 shadow-xs hover:shadow-md transition-all duration-300 flex items-center gap-2"
              >
                <Compass className="w-5 h-5 text-[#801D2E]" />
                <span>{t.exploreCommunityBtn}</span>
              </button>

              <button
                onClick={() => setCurrentTab('physical')}
                className="px-5 py-3.5 rounded-xl text-sm font-serif font-medium text-emerald-950 bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-300/60 shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Package className="w-4 h-4 text-emerald-800" />
                <span>{t.sendPhysicalBtn}</span>
              </button>
            </div>

            {/* Micro Trust Indicators */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs font-serif text-stone-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#801D2E]" />
                <span>সম্পূর্ণ পরিচয় গোপন রাখা যায়</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>সারাদেশে ৬৪ জেলায় ডাক সেবা</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Envelope Demonstration */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-md">
              <div className="text-center mb-3">
                <span className="text-xs font-serif text-amber-900 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200">
                  ✨ খামটিতে ক্লিক করে চিঠিটি এখনই খুলে দেখুন:
                </span>
              </div>

              <EnvelopeAnimation
                letter={heroLetter}
                onOpen={() => {}}
              >
                {/* When opened, preview paper */}
                <div className="rounded-xl p-6 bg-[#FAF4E8] border border-[#DFD1B8] shadow-xl text-[#382C24] font-serif space-y-4">
                  <div className="flex justify-between items-start border-b border-stone-300/60 pb-3">
                    <h3 className="text-xl font-bold text-stone-900">{heroLetter.title}</h3>
                    <span className="text-xs text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                      প্রেম ও ভালোবাসা
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-line text-stone-800">
                    {heroLetter.content}
                  </p>
                  <div className="pt-3 border-t border-stone-300/60 flex justify-between items-center text-xs text-stone-500">
                    <span>প্রেরক: অচেনা পথচারী</span>
                    <button
                      onClick={() => onOpenLetter(heroLetter)}
                      className="text-[#801D2E] font-bold hover:underline flex items-center gap-1"
                    >
                      <span>সম্পূর্ণ চিঠি পড়ুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </EnvelopeAnimation>
            </div>
          </div>
        </div>
      </section>

      {/* Live Community Postbox Counter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl p-6 sm:p-8 bg-[#2C221E] text-[#EDE4DA] border-2 border-[#7A3644] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-950/30 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-serif font-black text-amber-200">
                {toBengaliNumber(1420)}+
              </span>
              <p className="text-xs font-serif text-stone-300">চিঠি লেখা হয়েছে (Letters Sent)</p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-serif font-black text-amber-200">
                {toBengaliNumber(8930)}+
              </span>
              <p className="text-xs font-serif text-stone-300">খাম খোলা হয়েছে (Envelopes Read)</p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-serif font-black text-amber-200">
                {toBengaliNumber(64)}
              </span>
              <p className="text-xs font-serif text-stone-300">জেলায় ডাকযোগে প্রেরণ (BD Districts)</p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-serif font-black text-amber-200">
                {toBengaliNumber(100)}%
              </span>
              <p className="text-xs font-serif text-stone-300">গোপনীয়তা রক্ষা (Anonymity Kept)</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (৩টি সহজ পদক্ষেপে চিঠিঘরের গল্প) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[#801D2E] font-bold">
            HOW CHITHIGHOR WORKS
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-stone-900">
            ৩টি সহজ ধাপে মনের চিঠি পৌঁছে দিন
          </h2>
          <p className="text-sm font-serif text-stone-600">
            ডিজিটাল মাধ্যমেই হোক কিংবা ডাকপিয়নের আসল খামে—আপনার না-বলা কথা পৌঁছে যাবে আপন ঠিকানায়।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="rounded-xl p-6 bg-[#FAF4E8] border border-[#E2D5BE] space-y-4 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-[#801D2E] text-amber-100 flex items-center justify-center font-serif font-bold text-lg shadow-sm">
              ১
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900">
              মন খুলে মনের কথা লিখুন
            </h3>
            <p className="text-xs font-serif text-stone-600 leading-relaxed">
              ভালোবাসা, ক্ষমা, পুরোনো স্মৃতি বা না-বলা অভিমান—যে কোনো অনুভূতি লিখে ফেলুন। নিজের নাম উন্মুক্ত রাখতে পারেন কিংবা অচেনা প্রেরক হিসেবে সম্পূর্ণ পরিচয় গোপন রাখতে পারেন।
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl p-6 bg-[#FAF4E8] border border-[#E2D5BE] space-y-4 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-[#2D5A46] text-emerald-100 flex items-center justify-center font-serif font-bold text-lg shadow-sm">
              ২
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900">
              কাগজ, খাম ও সিলমোহর সাজান
            </h3>
            <p className="text-xs font-serif text-stone-600 leading-relaxed">
              ভিন্টেজ পার্চমেন্ট, ক্রিম লিনেন পাতা, লাল মোমের সিল এবং ডাকঘরের স্মারক ডাকটিকিট নির্বাচন করে চিঠিটিকে রূপ দিন এক অমূল্য স্মৃতিপত্রে।
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl p-6 bg-[#FAF4E8] border border-[#E2D5BE] space-y-4 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-[#9E651E] text-amber-100 flex items-center justify-center font-serif font-bold text-lg shadow-sm">
              ৩
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900">
              ডিজিটাল লিঙ্ক বা আসল ডাকযোগে পাঠান
            </h3>
            <p className="text-xs font-serif text-stone-600 leading-relaxed">
              চিঠিটি গোপন ডিজিটাল লিঙ্কের মাধ্যমে প্রিয়জনকে হোয়াটসঅ্যাপ বা ইনবক্সে দিন, কিংবা আমাদের প্রিমিয়াম কুরিয়ারের মাধ্যমে সুগন্ধি আসল কাগজের খামে পাঠিয়ে দিন ৬৪ জেলার যে কোনো প্রান্তে!
            </p>
          </div>
        </div>
      </section>

      {/* Featured Community Letters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-baseline gap-4 mb-8 border-b border-stone-300/60 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900">
              {t.latest} (Letters from the Soul)
            </h2>
            <p className="text-xs font-serif text-stone-600 mt-1">
              চিঠিঘরের উন্মুক্ত মেলায় অচেনা মানুষের অকপট অনুভূতির সমাহার
            </p>
          </div>

          <button
            onClick={() => setCurrentTab('community')}
            className="text-xs font-serif font-bold text-[#801D2E] hover:underline flex items-center gap-1"
          >
            <span>সবগুলো চিঠি পড়ুন (View All)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicLetters.map(letter => (
            <LetterCard
              key={letter.id}
              letter={letter}
              onClick={() => onOpenLetter(letter)}
              onBookmark={onBookmarkLetter}
              isBookmarked={bookmarkedIds.has(letter.id)}
            />
          ))}
        </div>
      </section>

      {/* Physical Delivery Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-[#241B17] via-[#33221B] to-[#1E1613] text-[#EDE4DA] p-8 sm:p-12 border-2 border-amber-900/40 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl text-center lg:text-left">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-bold bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800">
              বাস্তবের আসল কাগজের চিঠি • 64 DISTRICTS COURIER
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-amber-50">
              ডিজিটাল যুগে ফিরে আসুক হাতে ছোঁয়া কাগজের চিঠি
            </h2>
            <p className="text-sm font-serif text-[#C8BEB4] leading-relaxed">
              আপনার লেখা প্রতিটি চিঠি আমরা উন্নতমানের লিনেন কাগজে সুন্দর ফন্টে প্রিন্ট করে, খাঁটি মোম গলিয়ে সিলমোহর দিয়ে, প্রাকৃতিক শুকনো গোলাপের পাপড়িসহ প্রিয়জনের বাসার ঠিকানায় পৌঁছে দেব।
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => setCurrentTab('physical')}
                className="px-6 py-3 rounded-xl text-sm font-serif font-bold text-[#241B17] bg-gradient-to-r from-amber-200 to-amber-300 hover:from-amber-100 hover:to-amber-200 shadow-lg transition-transform transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span>কাগজের চিঠি অর্ডার করুন (৳১২০ থেকে শুরু)</span>
              </button>
              <button
                onClick={() => setCurrentTab('order-tracking')}
                className="px-5 py-3 rounded-xl text-sm font-serif text-amber-100 hover:text-white border border-stone-600 hover:border-amber-300 transition-colors"
              >
                {t.trackOrder}
              </button>
            </div>
          </div>

          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl bg-stone-900/80 border border-amber-500/20 p-4 flex flex-col items-center justify-center text-center shadow-inner shrink-0 rotate-2 hover:rotate-0 transition-transform">
            <span className="text-4xl mb-2">💌</span>
            <span className="text-xs font-serif font-bold text-amber-200">
              সুগন্ধি কাঠের ডাকবাক্স ও খাঁটি মোমের সিল
            </span>
            <span className="text-[10px] text-stone-400 font-mono mt-1">
              EXPRESS 48H DELIVERY
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
