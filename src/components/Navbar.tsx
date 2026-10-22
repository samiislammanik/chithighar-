import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { isSoundEnabled, setSoundEnabled, playPaperRustle } from '../utils/sound';
import { AuthModal } from './AuthModal';
import {
  PenTool,
  Mail,
  Compass,
  Package,
  Inbox,
  ShieldAlert,
  Volume2,
  VolumeX,
  Languages,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  KeyRound,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuthModal?: (mode?: 'signin' | 'signup' | 'forgot') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenAuthModal }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, profile, isAdmin, signOut, signInWithGoogle, signInAsGuest } = useAuth();
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  const handleToggleSound = () => {
    const newState = !soundOn;
    setSoundOn(newState);
    setSoundEnabled(newState);
    if (newState) playPaperRustle();
  };

  const navigateTo = (tab: string) => {
    playPaperRustle();
    setCurrentTab(tab);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFD0] transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div
            onClick={() => navigateTo('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            {/* Wax seal insignia logo */}
            <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-[#852335] via-[#6B1B29] to-[#450F18] border-2 border-[#A83246]/60 shadow-md flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
              <span className="font-serif font-bold text-amber-100 text-lg">চি</span>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-600 border border-white flex items-center justify-center text-[8px] text-white">
                ✉
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-serif font-black tracking-tight text-[#4A1620] group-hover:text-[#801D2E] transition-colors">
                  {t.appName}
                </span>
                <span className="text-[10px] font-mono tracking-widest text-stone-500 uppercase hidden sm:inline">
                  CHITHIGHOR
                </span>
              </div>
              <span className="text-[11px] font-serif text-[#7A6453] tracking-wide italic">
                “{t.tagline}”
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => navigateTo('home')}
              className={`px-3 py-2 rounded-lg text-sm font-serif transition-colors flex items-center gap-1.5 ${
                currentTab === 'home'
                  ? 'text-[#801D2E] font-bold bg-[#EFE7D8]/80'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-[#F3ECE0]'
              }`}
            >
              <span>{t.home}</span>
            </button>

            <button
              onClick={() => navigateTo('community')}
              className={`px-3 py-2 rounded-lg text-sm font-serif transition-colors flex items-center gap-1.5 ${
                currentTab === 'community'
                  ? 'text-[#801D2E] font-bold bg-[#EFE7D8]/80'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-[#F3ECE0]'
              }`}
            >
              <Compass className="w-4 h-4 opacity-75" />
              <span>{t.exploreLetters}</span>
            </button>

            <button
              onClick={() => navigateTo('physical')}
              className={`px-3 py-2 rounded-lg text-sm font-serif transition-colors flex items-center gap-1.5 ${
                currentTab === 'physical'
                  ? 'text-[#801D2E] font-bold bg-[#EFE7D8]/80'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-[#F3ECE0]'
              }`}
            >
              <Package className="w-4 h-4 text-[#801D2E]" />
              <span>{t.physicalLetters}</span>
              <span className="bg-[#801D2E]/10 text-[#801D2E] text-[10px] font-mono px-1.5 py-0.2 rounded-full border border-[#801D2E]/20">
                BD 64
              </span>
            </button>

            <button
              onClick={() => navigateTo('stationery')}
              className={`px-3 py-2 rounded-lg text-sm font-serif transition-colors flex items-center gap-1.5 ${
                currentTab === 'stationery'
                  ? 'text-[#801D2E] font-bold bg-[#EFE7D8]/80'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-[#F3ECE0]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>স্টেশনারি (Stationery)</span>
            </button>

            {profile && (
              <button
                onClick={() => navigateTo('dashboard')}
                className={`px-3 py-2 rounded-lg text-sm font-serif transition-colors flex items-center gap-1.5 ${
                  currentTab === 'dashboard'
                    ? 'text-[#801D2E] font-bold bg-[#EFE7D8]/80'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-[#F3ECE0]'
                }`}
              >
                <Inbox className="w-4 h-4 opacity-75" />
                <span>{t.myLetterbox}</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => navigateTo('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-serif transition-colors flex items-center gap-1.5 ${
                  currentTab === 'admin'
                    ? 'text-red-900 font-bold bg-red-100/90'
                    : 'text-stone-700 hover:text-red-900 hover:bg-red-50'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-red-700" />
                <span>{t.adminDesk}</span>
              </button>
            )}
          </nav>

          {/* Right Actions: Sound, Lang, Write CTA, Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-[#F3ECE0] transition-colors"
              title={soundOn ? 'শব্দ বন্ধ করুন (Mute sound)' : 'শব্দ চালু করুন (Enable paper sounds)'}
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-stone-700" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-lg border border-[#DACFBE] bg-[#F7F2E8] hover:bg-[#EFE8DC] text-xs font-serif font-medium text-stone-800 transition-colors flex items-center gap-1.5 shadow-2xs"
              title="ভাষা পরিবর্তন করুন / Change Language"
            >
              <Languages className="w-3.5 h-3.5 text-[#801D2E]" />
              <span className="font-bold">{language === 'bn' ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Write Letter Primary CTA */}
            <button
              onClick={() => navigateTo('write')}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-serif font-semibold text-white bg-gradient-to-r from-[#801D2E] to-[#601422] hover:from-[#942236] hover:to-[#731829] shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 select-none"
            >
              <PenTool className="w-4 h-4" />
              <span>{t.writeLetter}</span>
            </button>

            {/* User Profile / Auth Area */}
            {profile ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-[#DED4C3] bg-[#FBF8F2] hover:bg-[#F3ECE0] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[#801D2E] text-amber-100 flex items-center justify-center font-serif text-xs font-bold shadow-2xs">
                    {profile.displayName.slice(0, 1)}
                  </div>
                  <span className="hidden lg:inline text-xs font-serif font-medium text-stone-800 max-w-[110px] truncate">
                    {profile.displayName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-[#E4DAC8] shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-bold text-stone-900 truncate font-serif">
                        {profile.displayName}
                      </p>
                      <p className="text-[11px] font-mono text-stone-500 truncate">
                        @{profile.username}
                      </p>
                      {isAdmin && (
                        <span className="inline-block mt-1 text-[10px] font-mono uppercase bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold">
                          Admin Officer
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => navigateTo('profile')}
                      className="w-full text-left px-4 py-2 text-xs font-serif text-stone-700 hover:bg-[#FAF6EE] flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>প্রোফাইল ও ডাকঠিকানা (Profile)</span>
                    </button>

                    <button
                      onClick={() => navigateTo('dashboard')}
                      className="w-full text-left px-4 py-2 text-xs font-serif text-stone-700 hover:bg-[#FAF6EE] flex items-center gap-2"
                    >
                      <Inbox className="w-3.5 h-3.5" />
                      <span>{t.myLetterbox}</span>
                    </button>

                    <button
                      onClick={() => navigateTo('order-tracking')}
                      className="w-full text-left px-4 py-2 text-xs font-serif text-stone-700 hover:bg-[#FAF6EE] flex items-center gap-2"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>{t.trackOrder}</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => navigateTo('admin')}
                        className="w-full text-left px-4 py-2 text-xs font-serif text-red-700 hover:bg-red-50 flex items-center gap-2"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>{t.adminDesk}</span>
                      </button>
                    )}

                    <div className="border-t border-stone-100 my-1" />

                    <button
                      onClick={async () => {
                        await signOut();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-serif text-rose-700 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.signOut}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => {
                    if (onOpenAuthModal) {
                      onOpenAuthModal('signin');
                    } else {
                      setAuthModalMode('signin');
                      setIsAuthModalOpen(true);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-serif font-semibold border border-[#D5C6AF] bg-[#FAF5EC] hover:bg-[#F3ECE0] text-stone-800 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <User className="w-3.5 h-3.5 text-[#801D2E]" />
                  <span>{t.signIn}</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 md:hidden rounded-lg text-stone-700 hover:bg-[#F3ECE0] transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8DFD0] bg-[#FAF7F2] px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top-4 duration-300">
          <button
            onClick={() => navigateTo('home')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-serif text-stone-800 hover:bg-[#EFE7D8]"
          >
            {t.home}
          </button>
          <button
            onClick={() => navigateTo('community')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-serif text-stone-800 hover:bg-[#EFE7D8] flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            <span>{t.exploreLetters}</span>
          </button>
          <button
            onClick={() => navigateTo('write')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-serif text-white bg-[#801D2E] hover:bg-[#942236] flex items-center gap-2 font-semibold"
          >
            <PenTool className="w-4 h-4" />
            <span>{t.writeLetter}</span>
          </button>
          <button
            onClick={() => navigateTo('physical')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-serif text-stone-800 hover:bg-[#EFE7D8] flex items-center gap-2"
          >
            <Package className="w-4 h-4 text-[#801D2E]" />
            <span>{t.physicalLetters}</span>
          </button>
          {profile && (
            <button
              onClick={() => navigateTo('dashboard')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-serif text-stone-800 hover:bg-[#EFE7D8] flex items-center gap-2"
            >
              <Inbox className="w-4 h-4" />
              <span>{t.myLetterbox}</span>
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => navigateTo('admin')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-serif text-red-800 hover:bg-red-50 flex items-center gap-2 font-semibold"
            >
              <ShieldAlert className="w-4 h-4 text-red-700" />
              <span>{t.adminDesk}</span>
            </button>
          )}
          {!profile && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (onOpenAuthModal) {
                  onOpenAuthModal('signin');
                } else {
                  setAuthModalMode('signin');
                  setIsAuthModalOpen(true);
                }
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-serif text-[#801D2E] hover:bg-[#EFE7D8] flex items-center gap-2 font-bold"
            >
              <User className="w-4 h-4" />
              <span>{t.signIn} (Login / Register)</span>
            </button>
          )}
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </header>
  );
};
