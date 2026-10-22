import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Heart, Sparkles, Shield, Send } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#241E1A] text-[#EDE4DA] pt-16 pb-12 border-t-4 border-[#801D2E] transition-colors select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#801D2E] to-[#450F18] border border-[#A83246] flex items-center justify-center font-serif font-bold text-amber-100 shadow-sm">
                চি
              </div>
              <span className="text-2xl font-serif font-black tracking-tight text-amber-50">
                {t.appName}
              </span>
            </div>
            <p className="text-xs font-serif leading-relaxed text-[#C8BEB4]">
              {t.footerAbout}
            </p>
            <div className="p-3 rounded-lg bg-stone-900/60 border border-stone-800 text-[11px] font-serif text-amber-200/90 italic">
              “রানার চলেছে খবরের বোঝা হাতে, রানার চলেছে, রানার! দিগন্ত হতে দিগন্তে...”
              <br />
              <span className="text-stone-400 not-italic text-[10px]">— সুকান্ত ভট্টাচার্য</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 font-serif">
            <h4 className="text-sm font-bold text-amber-200 uppercase tracking-widest font-mono text-[11px]">
              চিঠিঘরের পথচলা
            </h4>
            <ul className="space-y-2 text-xs text-[#C8BEB4]">
              <li>
                <button
                  onClick={() => setCurrentTab('home')}
                  className="hover:text-amber-100 transition-colors"
                >
                  {t.home} (Home)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('community')}
                  className="hover:text-amber-100 transition-colors"
                >
                  {t.exploreLetters} (Community Letters)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('write')}
                  className="hover:text-amber-100 transition-colors"
                >
                  {t.writeLetter} (Write Digital Letter)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('physical')}
                  className="hover:text-amber-100 transition-colors flex items-center gap-1.5"
                >
                  <span>{t.physicalLetters} (Real Paper Mail)</span>
                  <span className="text-[10px] px-1 bg-[#801D2E] text-white rounded">
                    Popular
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('order-tracking')}
                  className="hover:text-amber-100 transition-colors"
                >
                  {t.trackOrder} (Track Order)
                </button>
              </li>
            </ul>
          </div>

          {/* Community & Safety */}
          <div className="space-y-3 font-serif">
            <h4 className="text-sm font-bold text-amber-200 uppercase tracking-widest font-mono text-[11px]">
              শালীনতা ও নীতি
            </h4>
            <ul className="space-y-2 text-xs text-[#C8BEB4]">
              <li>
                <button
                  onClick={() => setCurrentTab('about')}
                  className="hover:text-amber-100 transition-colors"
                >
                  আমাদের গল্প (About Us)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('guidelines')}
                  className="hover:text-amber-100 transition-colors"
                >
                  {t.communityGuidelines} (Guidelines)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('privacy')}
                  className="hover:text-amber-100 transition-colors"
                >
                  গোপনীয়তা নীতি (Privacy Policy)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('terms')}
                  className="hover:text-amber-100 transition-colors"
                >
                  {t.termsNotice} (Terms of Service)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('contact')}
                  className="hover:text-amber-100 transition-colors"
                >
                  যোগাযোগ ও ডাকঘর (Contact Us)
                </button>
              </li>
            </ul>
          </div>

          {/* Postal Newsletter / Note */}
          <div className="space-y-3 font-serif">
            <h4 className="text-sm font-bold text-amber-200 uppercase tracking-widest font-mono text-[11px]">
              চিঠিঘরের শুভবার্তা
            </h4>
            <p className="text-xs text-[#C8BEB4] leading-relaxed">
              সপ্তাহের সেরা কিছু চিঠি ও নির্বাচিত আবেগ সরাসরি পড়তে আপনার চিঠিঘরের ডাকবাক্সে যুক্ত থাকুন।
            </p>
            <div className="relative">
              <input
                type="text"
                placeholder="আপনার ডাকনাম বা ইমেইল..."
                className="w-full text-xs px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => alert('চিঠিঘরের শুভবার্তায় আপনাকে স্বাগত!')}
                className="absolute right-1 top-1 bottom-1 px-3 bg-[#801D2E] hover:bg-[#992237] text-white rounded-md text-xs flex items-center justify-center transition-colors"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-stone-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>১০০% স্প্যামমুক্ত এবং নিভৃত গোপনীয়তা</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-serif text-stone-400">
          <p>© {new Date().getFullYear()} {t.copyright} “{t.tagline}”</p>
          <div className="flex items-center gap-1.5 text-stone-300">
            <span>হৃদয়ের কালিতে ভালোবাসায় রচিত</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current animate-pulse" />
            <span>বাংলাদেশ ও বিশ্বজুড়ে</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
