import React, { useState, useEffect } from 'react';
import {
  Letter,
  LetterCategory,
  PaperStyle,
  FontFamily,
  EnvelopeColor,
  WaxSeal,
  StampStyle,
} from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { WaxSealBadge } from '../components/WaxSealBadge';
import { StampBadge } from '../components/StampBadge';
import { EnvelopeAnimation } from '../components/EnvelopeAnimation';
import { LetterPaperRenderer } from '../components/LetterPaperRenderer';
import { StationeryGallery } from '../components/StationeryGallery';
import { PremiumPaymentModal } from '../components/PremiumPaymentModal';
import {
  ENVELOPE_TEMPLATES,
  PAPER_TEMPLATES,
  getEnvelopeConfig,
  getPaperConfig,
  normalizeEnvelopeId,
  normalizePaperId,
  fetchUserTemplateAccess,
  PaperDesignConfig,
  EnvelopeDesignConfig,
} from '../utils/stationery';
import { generateLetterId, countWords, toBengaliNumber } from '../utils/formatters';
import { playWaxSealBreak, playPaperRustle, playStampThud } from '../utils/sound';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import confetti from 'canvas-confetti';
import {
  PenTool,
  Eye,
  Send,
  Save,
  Package,
  Sparkles,
  Shield,
  User,
  Users,
  Link2,
  Lock,
  Globe,
  CheckCircle,
} from 'lucide-react';

interface WriteLetterPageProps {
  onLetterCreated: (letter: Letter) => void;
  onConvertToPhysical?: (letterData: Partial<Letter>) => void;
  draftLetter?: Letter | null;
  onOpenAuthModal?: (mode?: 'signin' | 'signup') => void;
}

export const WriteLetterPage: React.FC<WriteLetterPageProps> = ({
  onLetterCreated,
  onConvertToPhysical,
  draftLetter,
  onOpenAuthModal,
}) => {
  const { user, profile, isAdmin } = useAuth();
  const { t, language } = useLanguage();

  const [title, setTitle] = useState(draftLetter?.title || '');
  const [content, setContent] = useState(draftLetter?.content || '');
  const [isAnonymous, setIsAnonymous] = useState(draftLetter?.isAnonymous ?? true);
  const [recipientType, setRecipientType] = useState<'public' | 'username' | 'link_only'>(
    draftLetter?.recipientType || 'public'
  );
  const [recipientUsername, setRecipientUsername] = useState(draftLetter?.recipientUsername || '');
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>(
    draftLetter?.visibility || 'public'
  );
  const [category, setCategory] = useState<LetterCategory>(draftLetter?.category || 'love');
  const [paperStyle, setPaperStyle] = useState<PaperStyle>(
    normalizePaperId(draftLetter?.paperStyle || 'classic-ivory-paper')
  );
  const [fontFamily, setFontFamily] = useState<FontFamily>(draftLetter?.fontFamily || 'noto-serif');
  const [envelopeColor, setEnvelopeColor] = useState<EnvelopeColor>(
    normalizeEnvelopeId(draftLetter?.envelopeColor || 'classic-ivory')
  );
  const [waxSeal, setWaxSeal] = useState<WaxSeal>(draftLetter?.waxSeal || 'rose');
  const [stampStyle, setStampStyle] = useState<StampStyle>(draftLetter?.stampStyle || 'dhaka-vintage');

  const [previewTab, setPreviewTab] = useState<'editor' | 'preview_envelope' | 'preview_paper'>('editor');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [paymentModalData, setPaymentModalData] = useState<{
    template: PaperDesignConfig | EnvelopeDesignConfig;
    type: 'paper' | 'envelope';
  } | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserTemplateAccess(user.uid).then(setUnlockedIds);
    } else {
      setUnlockedIds(new Set());
    }
  }, [user]);

  const wordCount = countWords(content);

  // Synchronize visibility with recipientType
  const handleRecipientTypeChange = (type: 'public' | 'username' | 'link_only') => {
    setRecipientType(type);
    if (type === 'public') {
      setVisibility('public');
    } else if (type === 'link_only') {
      setVisibility('unlisted');
    } else {
      setVisibility('private');
    }
  };

  const handleSave = async (isDraftMode: boolean) => {
    if (!title.trim()) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে চিঠির একটি শিরোনাম বা সম্বোধন দিন।' : 'Please enter a title or greeting for the letter.');
      return;
    }
    if (!content.trim()) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে চিঠির মূল কথাটি লিখুন।' : 'Please enter the content of your letter.');
      return;
    }

    // Verify if chosen paper is premium and unlocked
    const currentPaper = getPaperConfig(paperStyle);
    if (!currentPaper.isFree && !unlockedIds.has(currentPaper.id) && !isAdmin) {
      setErrorMsg(
        language === 'bn'
          ? 'আপনার নির্বাচিত ভিন্টেজ পেপার ডিজাইনটি প্রিমিয়াম। এটি দিয়ে চিঠি পাঠাতে অনুগ্রহ করে প্রথমে বিকাশ বা নগদে আনলক করুন।'
          : 'The selected paper design is premium. Please unlock it via bKash or Nagad before sending.'
      );
      setPaymentModalData({ template: currentPaper, type: 'paper' });
      return;
    }

    setIsSubmitting(true);
    if (!user) {
      setErrorMsg(
        language === 'bn'
          ? 'চিঠিটি সরাসরি ফায়ারবেস ক্লাউড স্টোরেজে সুরক্ষিতভাবে সংরক্ষণ করতে আপনার অ্যাকাউন্টে সাইন-ইন বা একটি নতুন অ্যাকাউন্ট খুলুন।'
          : 'Please sign in or register to securely save and publish your letter to Firebase Cloud Firestore.'
      );
      if (onOpenAuthModal) {
        onOpenAuthModal('signin');
      }
      setIsSubmitting(false);
      return;
    }

    const letterId = draftLetter?.id || generateLetterId();
    const currentAuthorId = user.uid;
    const authorDisplayName = isAnonymous
      ? (language === 'bn' ? 'অচেনা লেখক' : 'Anonymous Writer')
      : (profile?.displayName || 'চিঠিবন্ধু');

    const newLetter: Letter = {
      id: letterId,
      title: title.trim(),
      content: content.trim(),
      body: content.trim(),
      authorId: currentAuthorId,
      ownerUid: currentAuthorId,
      authorName: authorDisplayName,
      isAnonymous,
      anonymous: isAnonymous,
      recipientType,
      recipientUsername: recipientType === 'username' ? recipientUsername.trim() : null,
      visibility,
      category,
      language,
      paperStyle,
      fontFamily,
      envelopeColor,
      waxSeal,
      stampStyle,
      reactions: draftLetter?.reactions || { heart: 0, crying: 0, hug: 0, rose: 0, feather: 0 },
      viewsCount: draftLetter?.viewsCount || 0,
      savesCount: draftLetter?.savesCount || 0,
      isDraft: isDraftMode,
      status: isDraftMode ? 'draft' : 'published',
      isReported: false,
      isModerated: false,
      createdAt: draftLetter?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'letters', letterId), newLetter);

      playStampThud();
      if (!isDraftMode) {
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#801D2E', '#C5A059', '#2D5A46'],
          });
        } catch {
          // Ignore
        }
      }

      setSuccessMsg(
        isDraftMode
          ? (language === 'bn' ? 'খসড়া হিসেবে ফায়ারবেসে সংরক্ষিত হয়েছে!' : 'Draft saved to Firebase successfully!')
          : (language === 'bn' ? 'চিঠি সফলভাবে প্রেরণ ও প্রকাশ করা হয়েছে!' : 'Letter sealed and published to Firebase!')
      );

      setTimeout(() => {
        onLetterCreated(newLetter);
      }, 1200);
    } catch (err) {
      console.error('Save letter Firestore error:', err);
      setErrorMsg(
        language === 'bn'
          ? 'চিঠি সংরক্ষণে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট সংযোগ পরীক্ষা করুন।'
          : 'Failed to save letter to Firestore. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPreviewLetter: Letter = {
    id: 'preview_temp',
    title: title || (language === 'bn' ? 'প্রিয় মেঘবালিকা,' : 'Dear Quiet Friend,'),
    content: content || (language === 'bn' ? 'এখানে আপনার না-বলা কথাগুলো কাগজের পাতায় জীবন্ত হয়ে উঠবে...' : 'Your heartfelt words will breathe on this stationery...'),
    authorId: user?.uid || 'preview_user',
    authorName: isAnonymous ? t.anonymousSender : (profile?.displayName || 'চিঠিবন্ধু'),
    isAnonymous,
    recipientType,
    recipientUsername: recipientUsername || null,
    visibility,
    category,
    paperStyle,
    fontFamily,
    envelopeColor,
    waxSeal,
    stampStyle,
    reactions: { heart: 0, crying: 0, hug: 0, rose: 0, feather: 0 },
    viewsCount: 1,
    savesCount: 0,
    isDraft: false,
    createdAt: new Date().toISOString(),
  };

  const fontClassNames: Record<FontFamily, string> = {
    'noto-serif': 'font-serif',
    'hind-siliguri': 'font-sans',
    kalam: 'font-handwriting',
    playfair: 'font-serif italic',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E8DFD0] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#801D2E]/10 text-[#801D2E]">
              <PenTool className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900">
              {t.writeLetter}
            </h1>
          </div>
          <p className="text-xs font-serif text-stone-600 mt-1">
            {language === 'bn'
              ? 'শব্দে রূপ দিন আপনার জমে থাকা অনুভূতির। খাম ও মোমের সিল সাজিয়ে পাঠান আপন ঠিকানায়।'
              : 'Pen your thoughts, choose the paper and seal, and send an unforgettable letter.'}
          </p>
        </div>

        {/* View Switcher Tabs (Editor / Envelope Preview / Paper Preview) + Gallery Button */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#F0EAE0] border border-[#DDD3C2]">
          <button
            onClick={() => setPreviewTab('editor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-serif font-semibold transition-colors flex items-center gap-1 ${
              previewTab === 'editor'
                ? 'bg-white text-[#801D2E] shadow-2xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>চিঠি লিখুন (Editor)</span>
          </button>

          <button
            onClick={() => {
              playWaxSealBreak();
              setPreviewTab('preview_envelope');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-serif font-semibold transition-colors flex items-center gap-1 ${
              previewTab === 'preview_envelope'
                ? 'bg-white text-[#801D2E] shadow-2xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>খামের রূপ (Envelope)</span>
          </button>

          <button
            onClick={() => {
              playPaperRustle();
              setPreviewTab('preview_paper');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-serif font-semibold transition-colors flex items-center gap-1 ${
              previewTab === 'preview_paper'
                ? 'bg-white text-[#801D2E] shadow-2xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>কাগজের রূপ (Paper)</span>
          </button>

          <button
            onClick={() => setIsGalleryOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-1.5 bg-[#801D2E] text-white hover:bg-[#962337] shadow-2xs"
            title="১০টি খাম ও ১০টি কাগজের পূর্ণাঙ্গ স্টেশনারি গ্যালারি খুলুন"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>স্টেশনারি গ্যালারি (Gallery)</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-serif flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-sm font-serif">
          {errorMsg}
        </div>
      )}

      {!user && (
        <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-300 text-amber-950 text-xs font-serif flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              {language === 'bn'
                ? 'চিঠিটি স্থায়ীভাবে ফায়ারবেস ক্লাউড স্টোরেজে রাখতে এবং যেকোনো ডিভাইস থেকে দেখতে আপনার অ্যাকাউন্টে সাইন-ইন বা নিবন্ধন করুন।'
                : 'Sign in or create an account to permanently save drafts and letters to Firebase Cloud Firestore.'}
            </span>
          </div>
          {onOpenAuthModal && (
            <button
              type="button"
              onClick={() => onOpenAuthModal('signin')}
              className="px-3.5 py-1.5 rounded-lg bg-[#801D2E] text-white text-xs font-serif font-bold whitespace-nowrap hover:bg-[#962337] transition-colors shrink-0"
            >
              {language === 'bn' ? 'সাইন ইন / নিবন্ধন' : 'Sign In / Register'}
            </button>
          )}
        </div>
      )}

      {previewTab === 'editor' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Writing Canvas (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title / Addressee */}
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-bold text-stone-800 uppercase tracking-wider">
                চিঠির সম্বোধন বা শিরোনাম (Title / Greeting) *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={150}
                placeholder="যেমন: মেঘবালিকা, তুমি কেমন আছো? / প্রিয় বন্ধু / মাকে লেখা চিঠি..."
                className="w-full px-4 py-3 rounded-xl border border-[#D8CCBA] bg-white text-stone-900 font-serif text-lg focus:outline-none focus:ring-2 focus:ring-[#801D2E]/40 focus:border-[#801D2E]"
              />
            </div>

            {/* Content Textarea with styled paper preview border */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-serif text-stone-600">
                <label className="font-bold uppercase tracking-wider text-stone-800">
                  চিঠির কথা (Letter Words) *
                </label>
                <span className="font-mono text-[11px]">
                  {wordCount} {t.wordsCount} | {content.length}/10000
                </span>
              </div>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                maxLength={10000}
                rows={12}
                placeholder="এখানে আপনার মনের কথাগুলো লিখুন... কোনো তাড়া নেই, শব্দগুলো সাজিয়ে নিন নিজের মতো করে..."
                className={`w-full p-6 rounded-2xl border-2 leading-relaxed text-base focus:outline-none focus:ring-2 focus:ring-[#801D2E]/40 transition-colors shadow-xs ${
                  getPaperConfig(paperStyle).bgClass
                } ${getPaperConfig(paperStyle).textClass} ${getPaperConfig(paperStyle).borderClass} ${fontClassNames[fontFamily]}`}
                style={{ minHeight: '320px' }}
              />
            </div>

            {/* Recipient Mode Options */}
            <div className="p-5 rounded-xl bg-[#FAF5EB] border border-[#E6DBC9] space-y-4">
              <h3 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wider">
                প্রাপক ও প্রকাশনার ধরন (Recipient & Visibility)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleRecipientTypeChange('public')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    recipientType === 'public'
                      ? 'border-[#801D2E] bg-white text-[#801D2E] shadow-2xs'
                      : 'border-[#DECDB7] bg-[#F7F2E6] text-stone-700 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold font-serif mb-1">
                    <Globe className="w-3.5 h-3.5" />
                    <span>সার্বজনীন চিঠি</span>
                  </div>
                  <p className="text-[11px] font-serif text-stone-500 leading-snug">
                    চিঠিঘরের উন্মুক্ত মেলায় সবার পড়ার জন্য প্রকাশ পাবে।
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleRecipientTypeChange('username')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    recipientType === 'username'
                      ? 'border-[#801D2E] bg-white text-[#801D2E] shadow-2xs'
                      : 'border-[#DECDB7] bg-[#F7F2E6] text-stone-700 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold font-serif mb-1">
                    <User className="w-3.5 h-3.5" />
                    <span>নির্দিষ্ট কাউকে</span>
                  </div>
                  <p className="text-[11px] font-serif text-stone-500 leading-snug">
                    চিঠিঘরের কোনো নির্দিষ্ট ব্যবহারকারীকে (@username)।
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleRecipientTypeChange('link_only')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    recipientType === 'link_only'
                      ? 'border-[#801D2E] bg-white text-[#801D2E] shadow-2xs'
                      : 'border-[#DECDB7] bg-[#F7F2E6] text-stone-700 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold font-serif mb-1">
                    <Link2 className="w-3.5 h-3.5" />
                    <span>গোপন লিঙ্ক</span>
                  </div>
                  <p className="text-[11px] font-serif text-stone-500 leading-snug">
                    তালিকাভুক্ত হবে না; শুধু লিঙ্ক থাকা ব্যক্তিই পড়তে পারবেন।
                  </p>
                </button>
              </div>

              {recipientType === 'username' && (
                <div className="pt-2 animate-in fade-in">
                  <label className="text-xs font-serif font-bold text-stone-800">
                    প্রাপকের চিঠিঘর ইউজারনেম (@username)
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2.5 text-stone-500 font-mono text-sm">@</span>
                    <input
                      type="text"
                      value={recipientUsername}
                      onChange={e => setRecipientUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                      placeholder="যেমন: rohim_bd"
                      className="w-full pl-8 pr-4 py-2 rounded-lg border border-[#D5C6B0] bg-white text-sm font-mono focus:outline-none focus:border-[#801D2E]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Anonymity Toggle */}
            <div className="p-4 rounded-xl bg-[#F4EDE0] border border-[#DECDB7] flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#801D2E]" />
                  <span className="text-sm font-serif font-bold text-stone-900">
                    নাম গোপন রাখুন (Keep Anonymous)
                  </span>
                </div>
                <p className="text-xs font-serif text-stone-600">
                  চিঠিতে প্রেরকের নাম হিসেবে প্রদর্শিত হবে &quot;{t.anonymousSender}&quot;। আপনার আসল পরিচয় কখনো সাধারণ পাঠকদের কাছে প্রকাশ পাবে না।
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#801D2E]" />
              </label>
            </div>
          </div>

          {/* Right Configuration Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Category Selector */}
            <div className="p-5 rounded-xl bg-white border border-[#E4DAC8] shadow-xs space-y-3">
              <h3 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wider">
                চিঠির অনুভূতি / ক্যাটাগরি
              </h3>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as LetterCategory)}
                className="w-full p-2.5 rounded-lg border border-[#D5C6B0] bg-[#FAF7F2] font-serif text-sm text-stone-900 focus:outline-none focus:border-[#801D2E]"
              >
                <option value="love">{t.categories.love}</option>
                <option value="friendship">{t.categories.friendship}</option>
                <option value="family">{t.categories.family}</option>
                <option value="apology">{t.categories.apology}</option>
                <option value="memories">{t.categories.memories}</option>
                <option value="motivation">{t.categories.motivation}</option>
                <option value="unsent">{t.categories.unsent}</option>
                <option value="general">{t.categories.general}</option>
              </select>
            </div>

            {/* Paper Style Selector - 10 Premium Papers */}
            <div className="p-5 rounded-xl bg-white border border-[#E4DAC8] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wider">
                  কাগজের ধরন ({toBengaliNumber(PAPER_TEMPLATES.length)} Paper Styles)
                </h3>
                <button
                  type="button"
                  onClick={() => setIsGalleryOpen(true)}
                  className="text-[11px] font-serif text-[#801D2E] hover:underline font-bold"
                >
                  গ্যালারি খুলুন →
                </button>
              </div>

              {/* Selected Paper Info */}
              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between text-xs font-serif">
                <span className="font-bold text-stone-900">
                  {getPaperConfig(paperStyle).nameBn}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  getPaperConfig(paperStyle).isFree
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-900 font-bold'
                }`}>
                  {getPaperConfig(paperStyle).isFree ? 'বিনামূল্যে' : `৳${toBengaliNumber(getPaperConfig(paperStyle).priceBdt)} BDT`}
                </span>
              </div>

              {/* Quick Select Grid for 10 Paper Templates */}
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {PAPER_TEMPLATES.map(p => {
                  const isSelected = normalizePaperId(paperStyle) === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        playPaperRustle();
                        setPaperStyle(p.id);
                      }}
                      className={`p-2 rounded-lg border text-left text-xs font-serif transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#801D2E] ring-2 ring-[#801D2E]/20 bg-rose-50/40 font-bold'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <span className="truncate text-[11px]">{p.nameBn}</span>
                      <span className="text-[9px] font-mono opacity-70">
                        {p.isFree ? 'Free' : `৳${p.priceBdt}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Envelope Color Selector - 10 Premium Envelopes */}
            <div className="p-5 rounded-xl bg-white border border-[#E4DAC8] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wider">
                  খামের রূপ ({toBengaliNumber(ENVELOPE_TEMPLATES.length)} Envelopes)
                </h3>
                <button
                  type="button"
                  onClick={() => setIsGalleryOpen(true)}
                  className="text-[11px] font-serif text-[#801D2E] hover:underline font-bold"
                >
                  গ্যালারি খুলুন →
                </button>
              </div>

              {/* Selected Envelope Info */}
              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between text-xs font-serif">
                <span className="font-bold text-stone-900">
                  {getEnvelopeConfig(envelopeColor).nameBn}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  getEnvelopeConfig(envelopeColor).isFree
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-900 font-bold'
                }`}>
                  {getEnvelopeConfig(envelopeColor).isFree ? 'বিনামূল্যে' : `৳${toBengaliNumber(getEnvelopeConfig(envelopeColor).priceBdt)} BDT`}
                </span>
              </div>

              {/* Swatches Grid for 10 Envelope Templates */}
              <div className="grid grid-cols-5 gap-2 pt-1">
                {ENVELOPE_TEMPLATES.map(env => {
                  const isSelected = normalizeEnvelopeId(envelopeColor) === env.id;
                  return (
                    <button
                      key={env.id}
                      type="button"
                      onClick={() => {
                        playWaxSealBreak();
                        setEnvelopeColor(env.id);
                      }}
                      className={`relative w-full aspect-square rounded-xl border-2 transition-transform overflow-hidden shadow-2xs ${
                        isSelected
                          ? 'scale-110 border-white ring-2 ring-[#801D2E] z-10'
                          : 'border-transparent hover:scale-105 opacity-90 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: env.borderColor }}
                      title={`${env.nameBn} (${env.isFree ? 'Free' : `৳${env.priceBdt} BDT`})`}
                    >
                      {/* Inner accent dot */}
                      <div
                        className="w-2.5 h-2.5 rounded-full mx-auto my-auto mt-2"
                        style={{ backgroundColor: env.innerBgColor }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Wax Seal Selector */}
            <div className="p-5 rounded-xl bg-white border border-[#E4DAC8] shadow-xs space-y-3">
              <h3 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wider">
                মোমের সিলমোহর (Wax Seal)
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                {(['rose', 'heart', 'bird', 'anchor', 'monogram', 'none'] as WaxSeal[]).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      playWaxSealBreak();
                      setWaxSeal(s);
                    }}
                    className={`p-1.5 rounded-full border transition-all ${
                      waxSeal === s
                        ? 'border-[#801D2E] bg-rose-50 ring-2 ring-[#801D2E]/30'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                    title={s}
                  >
                    {s === 'none' ? (
                      <span className="w-8 h-8 rounded-full border border-dashed border-stone-400 flex items-center justify-center text-[10px] text-stone-500 font-serif">
                        None
                      </span>
                    ) : (
                      <WaxSealBadge seal={s} color={envelopeColor} size="sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Postal Stamp Selector */}
            <div className="p-5 rounded-xl bg-white border border-[#E4DAC8] shadow-xs space-y-3">
              <h3 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wider">
                স্মারক ডাকটিকিট (Postage Stamp)
              </h3>
              <select
                value={stampStyle}
                onChange={e => {
                  playStampThud();
                  setStampStyle(e.target.value as StampStyle);
                }}
                className="w-full p-2.5 rounded-lg border border-[#D5C6B0] bg-[#FAF7F2] font-serif text-xs text-stone-900 focus:outline-none focus:border-[#801D2E]"
              >
                <option value="dhaka-vintage">ঢাকা জিপিও ১৯৭১ (Dhaka GPO 1971)</option>
                <option value="post-runner">রানার - রাত নির্জন (The Post Runner)</option>
                <option value="water-lily">জাতীয় শাপলা ফুল (Water Lily)</option>
                <option value="bengal-tiger">রয়েল বেঙ্গল টাইগার (Royal Bengal Tiger)</option>
                <option value="tea-garden">শ্রীমঙ্গল চা বাগান (Sreemangal Tea)</option>
              </select>
            </div>

            {/* Actions: Send & Save Draft */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSave(false)}
                className="w-full py-3.5 rounded-xl font-serif font-bold text-white bg-gradient-to-r from-[#801D2E] to-[#601422] hover:from-[#942236] hover:to-[#731829] shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'চিঠি সিলমোহর করা হচ্ছে...' : 'চিঠি পাঠান ও প্রকাশ করুন (Send)'}</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSave(true)}
                className="w-full py-2.5 rounded-xl font-serif font-semibold border border-stone-300 hover:bg-[#F5EFE4] text-stone-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>খসড়া হিসেবে রাখুন (Save Draft)</span>
              </button>

              {onConvertToPhysical && (
                <button
                  type="button"
                  onClick={() => {
                    onConvertToPhysical({
                      title,
                      content,
                      paperStyle,
                      envelopeColor,
                      waxSeal,
                    });
                  }}
                  className="w-full py-2.5 rounded-xl font-serif font-medium text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors flex items-center justify-center gap-2 text-xs"
                >
                  <Package className="w-4 h-4 text-emerald-700" />
                  <span>বাস্তবের কাগজের চিঠিতে রূপান্তর করুন</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : previewTab === 'preview_envelope' ? (
        /* Envelope Preview Tab */
        <div className="py-12 flex flex-col items-center space-y-6">
          <div className="text-center max-w-md space-y-1">
            <h2 className="text-xl font-serif font-bold text-stone-900">
              খামের বাহ্যিক রূপ (Envelope Preview)
            </h2>
            <p className="text-xs font-serif text-stone-600">
              প্রাপক যখন চিঠিটি পাবেন, তখন খামটি ঠিক এমন দেখাবে:
            </p>
          </div>

          <div className="w-full max-w-lg">
            <EnvelopeAnimation letter={currentPreviewLetter} />
          </div>

          <button
            onClick={() => setPreviewTab('editor')}
            className="text-xs font-serif font-semibold text-[#801D2E] hover:underline"
          >
            ← পুনরায় লেখায় ফিরে যান (Back to Editor)
          </button>
        </div>
      ) : (
        /* Paper Preview Tab */
        <div className="py-8 flex flex-col items-center space-y-6">
          <div className="text-center max-w-md space-y-1">
            <h2 className="text-xl font-serif font-bold text-stone-900">
              চিঠির ভেতরের রূপ (Unfolded Stationery Preview)
            </h2>
            <p className="text-xs font-serif text-stone-600">
              খাম খোলার পর আপনার চিঠিটি কাগজের পাতায় এভাবে প্রদর্শিত হবে:
            </p>
          </div>

          <div className="w-full max-w-3xl">
            <LetterPaperRenderer letter={currentPreviewLetter} />
          </div>

          <button
            onClick={() => setPreviewTab('editor')}
            className="text-xs font-serif font-semibold text-[#801D2E] hover:underline"
          >
            ← পুনরায় লেখায় ফিরে যান (Back to Editor)
          </button>
        </div>
      )}

      {/* Full Stationery Gallery Modal */}
      {isGalleryOpen && (
        <StationeryGallery
          isOpenModal={true}
          onCloseModal={() => {
            setIsGalleryOpen(false);
            if (user) {
              fetchUserTemplateAccess(user.uid).then(setUnlockedIds);
            }
          }}
          selectedEnvelope={envelopeColor}
          selectedPaper={paperStyle}
          onSelectEnvelope={(id) => setEnvelopeColor(id)}
          onSelectPaper={(id) => setPaperStyle(id)}
          onOpenAuthModal={onOpenAuthModal}
        />
      )}

      {/* Dedicated Premium Payment Modal */}
      {paymentModalData && (
        <PremiumPaymentModal
          isOpen={!!paymentModalData}
          onClose={() => setPaymentModalData(null)}
          template={paymentModalData.template}
          type={paymentModalData.type}
          onOpenAuthModal={onOpenAuthModal}
          onPurchaseSubmitted={() => {
            if (user) {
              fetchUserTemplateAccess(user.uid).then(setUnlockedIds);
            }
          }}
        />
      )}
    </div>
  );
};
