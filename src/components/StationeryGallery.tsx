import React, { useState, useEffect } from 'react';
import {
  EnvelopeColor,
  PaperStyle,
  TemplatePurchase,
} from '../types';
import {
  ENVELOPE_TEMPLATES,
  PAPER_TEMPLATES,
  EnvelopeDesignConfig,
  PaperDesignConfig,
  normalizeEnvelopeId,
  normalizePaperId,
  fetchUserTemplateAccess,
  fetchTemplatePurchases,
} from '../utils/stationery';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { toBengaliNumber } from '../utils/formatters';
import { playWaxSealBreak, playPaperRustle } from '../utils/sound';
import { PremiumPaymentModal } from './PremiumPaymentModal';
import {
  Sparkles,
  Check,
  X,
  CreditCard,
  Lock,
  Layers,
  Mail,
  FileText,
  Search,
  Clock,
  ShieldCheck,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface StationeryGalleryProps {
  selectedEnvelope: EnvelopeColor;
  selectedPaper: PaperStyle;
  onSelectEnvelope: (id: EnvelopeColor) => void;
  onSelectPaper: (id: PaperStyle) => void;
  isOpenModal?: boolean;
  onCloseModal?: () => void;
  onOpenAuthModal?: (mode?: 'signin' | 'signup') => void;
}

export const StationeryGallery: React.FC<StationeryGalleryProps> = ({
  selectedEnvelope,
  selectedPaper,
  onSelectEnvelope,
  onSelectPaper,
  isOpenModal = false,
  onCloseModal,
  onOpenAuthModal,
}) => {
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'paper' | 'envelope'>('paper');
  const [filterPrice, setFilterPrice] = useState<'all' | 'free' | 'premium'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [userPurchases, setUserPurchases] = useState<TemplatePurchase[]>([]);

  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedForPayment, setSelectedForPayment] = useState<{
    template: PaperDesignConfig | EnvelopeDesignConfig;
    type: 'paper' | 'envelope';
  } | null>(null);

  // Large Preview Modal
  const [previewDesign, setPreviewDesign] = useState<{
    template: PaperDesignConfig | EnvelopeDesignConfig;
    type: 'paper' | 'envelope';
  } | null>(null);

  const [showMyPurchases, setShowMyPurchases] = useState(false);

  // Load user's unlocked access and purchases
  useEffect(() => {
    if (user) {
      fetchUserTemplateAccess(user.uid).then(setUnlockedIds);
      fetchTemplatePurchases(user.uid).then(setUserPurchases);
    } else {
      setUnlockedIds(new Set());
      setUserPurchases([]);
    }
  }, [user]);

  const normalizedCurrentEnvelope = normalizeEnvelopeId(selectedEnvelope);
  const normalizedCurrentPaper = normalizePaperId(selectedPaper);

  // Check if a template is unlocked for the current user
  const isTemplateUnlocked = (template: PaperDesignConfig | EnvelopeDesignConfig) => {
    if (template.isFree) return true;
    return unlockedIds.has(template.id);
  };

  // Get active purchase status for a template
  const getPurchaseForTemplate = (templateId: string) => {
    return userPurchases.find((p) => p.templateId === templateId) || null;
  };

  const filteredEnvelopes = ENVELOPE_TEMPLATES.filter((env) => {
    if (filterPrice === 'free' && !env.isFree) return false;
    if (filterPrice === 'premium' && env.isFree) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = env.name.toLowerCase().includes(q) || env.nameBn.includes(q);
      const matchDesc = env.description.toLowerCase().includes(q) || env.descriptionBn.includes(q);
      return matchName || matchDesc;
    }
    return true;
  });

  const filteredPapers = PAPER_TEMPLATES.filter((paper) => {
    if (filterPrice === 'free' && !paper.isFree) return false;
    if (filterPrice === 'premium' && paper.isFree) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = paper.name.toLowerCase().includes(q) || paper.nameBn.includes(q);
      const matchDesc = paper.description.toLowerCase().includes(q) || paper.descriptionBn.includes(q);
      return matchName || matchDesc;
    }
    return true;
  });

  const handleSelectEnv = (env: EnvelopeDesignConfig) => {
    if (!env.isFree && !isTemplateUnlocked(env)) {
      setSelectedForPayment({ template: env, type: 'envelope' });
      setPaymentModalOpen(true);
      return;
    }
    playWaxSealBreak();
    onSelectEnvelope(env.id);
  };

  const handleSelectPaper = (paper: PaperDesignConfig) => {
    if (!paper.isFree && !isTemplateUnlocked(paper)) {
      setSelectedForPayment({ template: paper, type: 'paper' });
      setPaymentModalOpen(true);
      return;
    }
    playPaperRustle();
    onSelectPaper(paper.id);
  };

  const handlePurchaseSubmitted = (purchase: TemplatePurchase) => {
    setUserPurchases((prev) => [purchase, ...prev.filter((p) => p.id !== purchase.id)]);
  };

  const content = (
    <div className="space-y-6">
      {/* Top Controls: Type Tabs, Price Filter & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-stone-200">
        {/* Main Tabs (Papers / Envelopes) */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-stone-100 border border-stone-200">
          <button
            type="button"
            onClick={() => {
              playPaperRustle();
              setActiveTab('paper');
              setShowMyPurchases(false);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-2 ${
              activeTab === 'paper' && !showMyPurchases
                ? 'bg-white text-[#801D2E] shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>চিঠির কাগজ ({toBengaliNumber(PAPER_TEMPLATES.length)})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playWaxSealBreak();
              setActiveTab('envelope');
              setShowMyPurchases(false);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-2 ${
              activeTab === 'envelope' && !showMyPurchases
                ? 'bg-white text-[#801D2E] shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>চিঠির খাম ({toBengaliNumber(ENVELOPE_TEMPLATES.length)})</span>
          </button>

          {user && (
            <button
              type="button"
              onClick={() => setShowMyPurchases(true)}
              className={`px-3 py-2 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-1.5 ${
                showMyPurchases
                  ? 'bg-white text-[#801D2E] shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>আমার ক্রয়সমূহ ({toBengaliNumber(userPurchases.length)})</span>
            </button>
          )}
        </div>

        {/* Search & Pricing filter */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder={language === 'bn' ? 'ডিজাইন খুঁজুন...' : 'Search designs...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-stone-200 text-xs font-serif focus:outline-hidden focus:ring-1 focus:ring-[#801D2E]"
            />
          </div>

          {/* Pricing filter */}
          <div className="flex items-center gap-1 text-xs font-serif bg-stone-100 p-1 rounded-lg border border-stone-200">
            {(['all', 'free', 'premium'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setFilterPrice(mode)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  filterPrice === mode
                    ? 'bg-stone-800 text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {mode === 'all'
                  ? 'সবগুলো'
                  : mode === 'free'
                  ? 'বিনামূল্যে (১০টি)'
                  : 'প্রিমিয়াম — ৳২০ (৫টি)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notice regarding pricing & authenticity */}
      {!showMyPurchases && (
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs font-serif flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">
              {language === 'bn'
                ? '১৫টি দৃষ্টিনন্দন ভিন্টেজ চিঠির কাগজ (১০টি বিনামূল্যে, ৫টি প্রিমিয়াম)'
                : '15 Distinct Vintage Letter Papers (10 Free, 5 Premium Locked)'}
            </p>
            <p className="text-[11px] text-amber-800">
              {language === 'bn'
                ? 'পুরাতন পার্চমেন্ট, ছেঁড়া কিনারা, বোটানিক্যাল ফার্ন, গোলাপের পাপড়ি ও ডাকঘরের সিলমোহর। প্রিমিয়াম ডিজাইনগুলো বিকাশ ও নগদে মাত্র ৳২০ টাকায় যাচাই সাপেক্ষে স্থায়ীভাবে আনলকযোগ্য।'
                : 'Antique parchment, torn deckle edges, botanical foliage, dried roses, and postmarks. Premium designs unlocked via verified bKash/Nagad.'}
            </p>
          </div>
        </div>
      )}

      {/* User's Purchases Tab view */}
      {showMyPurchases ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-serif font-bold text-stone-900">
              আপনার সাবমিট করা প্রিমিয়াম ক্রয়সমূহ (My Purchase Requests)
            </h4>
            <button
              type="button"
              onClick={() => setShowMyPurchases(false)}
              className="text-xs text-[#801D2E] hover:underline font-serif"
            >
              গ্যালারিতে ফিরুন ←
            </button>
          </div>

          {userPurchases.length === 0 ? (
            <div className="p-8 text-center text-xs font-serif text-stone-500 bg-white rounded-2xl border border-stone-200">
              আপনি এখনো কোনো প্রিমিয়াম ডিজাইনের জন্য পেমেন্ট জমা দেননি।
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userPurchases.map((pur) => (
                <div
                  key={pur.id}
                  className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2 text-xs font-serif"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-stone-700">
                      ID: {pur.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        pur.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : pur.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {pur.status === 'approved'
                        ? 'অনুমোদিত ✓'
                        : pur.status === 'rejected'
                        ? 'বাতিল ✗'
                        : 'অপেক্ষমাণ ⏳'}
                    </span>
                  </div>

                  <h5 className="font-bold text-stone-900 text-sm">{pur.templateName}</h5>
                  <div className="text-[11px] font-mono text-stone-500 space-y-0.5">
                    <div>পেমেন্ট: {pur.paymentMethod} (৳{toBengaliNumber(pur.amountBdt)})</div>
                    <div>TrxID: {pur.transactionId}</div>
                    <div>তারিখ: {new Date(pur.createdAt).toLocaleDateString('bn-BD')}</div>
                  </div>

                  {pur.status === 'rejected' && (
                    <p className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-100">
                      কারণ: {pur.rejectionReason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'paper' ? (
        /* Paper Styles Gallery: Exactly 15 Vintage Designs */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPapers.map((paper) => {
            const isSelected = normalizedCurrentPaper === paper.id;
            const isUnlocked = isTemplateUnlocked(paper);
            const purchaseInfo = getPurchaseForTemplate(paper.id);

            return (
              <div
                key={paper.id}
                onClick={() => handleSelectPaper(paper)}
                className={`group relative rounded-2xl p-4 border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? 'border-[#801D2E] ring-2 ring-[#801D2E]/25 shadow-md scale-[1.01]'
                    : 'border-stone-200 hover:border-stone-400 bg-white shadow-2xs hover:shadow-xs'
                }`}
              >
                {/* Visual Paper Card Mockup */}
                <div
                  className={`w-full h-36 rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden border ${paper.bgClass} ${paper.textClass} ${paper.borderClass}`}
                  style={{
                    backgroundImage: paper.ruledLines
                      ? `repeating-linear-gradient(transparent, transparent 15px, ${paper.lineColor || 'rgba(0,0,0,0.06)'} 15px, ${paper.lineColor || 'rgba(0,0,0,0.06)'} 16px)`
                      : undefined,
                  }}
                >
                  {/* Subtle inner border */}
                  <div className={`absolute inset-2 rounded-lg border pointer-events-none ${paper.innerFrameBorder}`} />

                  {/* Header */}
                  <div className="flex justify-between items-center z-10 text-[9px] font-mono opacity-70">
                    <span className="uppercase">{paper.category.replace('_', ' ')}</span>
                    <span className="text-[8px] font-mono">CHITHIGHOR</span>
                  </div>

                  {/* Center mock text */}
                  <div className="z-10 text-center my-auto px-1">
                    <span className="text-xs font-serif font-bold block drop-shadow-xs">
                      {paper.nameBn}
                    </span>
                    <span className="text-[10px] opacity-75 font-mono block">
                      {paper.name}
                    </span>
                    <p className="text-[9px] opacity-65 font-serif italic mt-0.5 line-clamp-1">
                      {paper.textureDetails}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="z-10 flex justify-between items-center text-[10px] font-mono">
                    <span className="font-bold">
                      {paper.isFree
                        ? 'FREE (বিনামূল্যে)'
                        : isUnlocked
                        ? 'UNLOCKED ✓'
                        : `৳${toBengaliNumber(paper.priceBdt)} BDT`}
                    </span>
                    <span className="opacity-50 text-[9px]">ঐতিহ্য ডাক</span>
                  </div>

                  {/* Lock overlay if locked premium */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-stone-900/35 backdrop-blur-2xs flex flex-col items-center justify-center text-white z-20 space-y-1">
                      <span className="p-1.5 rounded-full bg-amber-500 text-stone-950 shadow-md">
                        <Lock className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-stone-950/80">
                        PREMIUM — ৳{toBengaliNumber(paper.priceBdt)}
                      </span>
                      {purchaseInfo?.status === 'pending' && (
                        <span className="text-[9px] font-mono text-amber-300">
                          যাচাই প্রক্রিয়াধীন ⏳
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Metadata & Controls */}
                <div className="mt-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-serif font-bold text-stone-900 flex items-center gap-1.5">
                      <span>{paper.nameBn}</span>
                      {isSelected && (
                        <span className="p-0.5 rounded-full bg-[#801D2E] text-white">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </h4>

                    {/* Price / Free badge */}
                    {paper.isFree ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        বিনামূল্যে
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> আনলকড
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> ৳{toBengaliNumber(paper.priceBdt)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-serif text-stone-600 line-clamp-2 leading-relaxed">
                    {language === 'bn' ? paper.descriptionBn : paper.description}
                  </p>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewDesign({ template: paper, type: 'paper' });
                      }}
                      className="text-[11px] font-serif text-stone-500 hover:text-[#801D2E] flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>প্রিভিউ</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPaper(paper);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all shadow-2xs flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#801D2E] text-white'
                          : !isUnlocked
                          ? 'bg-amber-600 text-white hover:bg-amber-700'
                          : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
                      }`}
                    >
                      {isSelected ? (
                        <span>নির্বাচিত ✓</span>
                      ) : !isUnlocked ? (
                        <>
                          <Lock className="w-3 h-3" />
                          <span>আনলক করুন</span>
                        </>
                      ) : (
                        <span>নির্বাচন করুন</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Envelopes Gallery: 10 Distinct Royal Envelopes */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEnvelopes.map((env) => {
            const isSelected = normalizedCurrentEnvelope === env.id;
            const isUnlocked = isTemplateUnlocked(env);
            const purchaseInfo = getPurchaseForTemplate(env.id);

            return (
              <div
                key={env.id}
                onClick={() => handleSelectEnv(env)}
                className={`group relative rounded-2xl p-4 border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? 'border-[#801D2E] ring-2 ring-[#801D2E]/25 shadow-md scale-[1.01]'
                    : 'border-stone-200 hover:border-stone-400 bg-white shadow-2xs hover:shadow-xs'
                }`}
              >
                {/* Visual Envelope Mockup */}
                <div
                  className={`w-full h-36 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden border ${env.bgClass}`}
                  style={{
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)',
                  }}
                >
                  {/* Flap fold triangle */}
                  <div
                    className={`absolute -top-1 left-0 right-0 h-0 border-l-[110px] sm:border-l-[130px] border-l-transparent border-r-[110px] sm:border-r-[130px] border-r-transparent border-t-[70px] opacity-25 pointer-events-none origin-top ${env.flapBorderColor}`}
                  />

                  {/* Top Bar of mini envelope */}
                  <div className="flex justify-between items-center z-10 text-[9px] font-mono opacity-80 uppercase tracking-wider">
                    <span>CHITHIGHOR</span>
                    <span>{env.ornamentStyle}</span>
                  </div>

                  {/* Center mock text */}
                  <div className="z-10 text-center my-auto py-1 px-2 rounded-md bg-black/20 backdrop-blur-2xs">
                    <span className="text-xs font-serif font-bold block drop-shadow-xs">
                      {env.nameBn}
                    </span>
                    <span className="text-[10px] opacity-75 font-mono block">
                      {env.name}
                    </span>
                  </div>

                  {/* Bottom seal dot */}
                  <div className="z-10 flex justify-between items-center text-[10px]">
                    <span className="font-mono text-[9px] opacity-80 font-bold">
                      {env.isFree ? 'FREE' : isUnlocked ? 'UNLOCKED' : `৳${toBengaliNumber(env.priceBdt)}`}
                    </span>
                    <div className="w-5 h-5 rounded-full bg-amber-500/80 border border-amber-300/40 shadow-xs flex items-center justify-center text-[8px] text-white">
                      ★
                    </div>
                  </div>

                  {/* Lock overlay if locked premium */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-2xs flex flex-col items-center justify-center text-white z-20 space-y-1">
                      <span className="p-1.5 rounded-full bg-amber-500 text-stone-950 shadow-md">
                        <Lock className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-stone-950/80">
                        PREMIUM — ৳{toBengaliNumber(env.priceBdt)}
                      </span>
                      {purchaseInfo?.status === 'pending' && (
                        <span className="text-[9px] font-mono text-amber-300">
                          যাচাই প্রক্রিয়াধীন ⏳
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Metadata & Controls */}
                <div className="mt-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-serif font-bold text-stone-900 flex items-center gap-1.5">
                      <span>{env.nameBn}</span>
                      {isSelected && (
                        <span className="p-0.5 rounded-full bg-[#801D2E] text-white">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </h4>

                    {env.isFree ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        বিনামূল্যে
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> আনলকড
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> ৳{toBengaliNumber(env.priceBdt)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-serif text-stone-600 line-clamp-2 leading-relaxed">
                    {language === 'bn' ? env.descriptionBn : env.description}
                  </p>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewDesign({ template: env, type: 'envelope' });
                      }}
                      className="text-[11px] font-serif text-stone-500 hover:text-[#801D2E] flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>প্রিভিউ</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectEnv(env);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all shadow-2xs flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#801D2E] text-white'
                          : !isUnlocked
                          ? 'bg-amber-600 text-white hover:bg-amber-700'
                          : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
                      }`}
                    >
                      {isSelected ? (
                        <span>নির্বাচিত ✓</span>
                      ) : !isUnlocked ? (
                        <>
                          <Lock className="w-3 h-3" />
                          <span>আনলক করুন</span>
                        </>
                      ) : (
                        <span>নির্বাচন করুন</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dedicated bKash / Nagad Payment Modal */}
      {paymentModalOpen && selectedForPayment && (
        <PremiumPaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          template={selectedForPayment.template}
          type={selectedForPayment.type}
          existingPurchase={getPurchaseForTemplate(selectedForPayment.template.id)}
          onPurchaseSubmitted={handlePurchaseSubmitted}
          onOpenAuthModal={onOpenAuthModal}
        />
      )}

      {/* Large Preview Modal */}
      {previewDesign && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-stone-300 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="text-lg font-serif font-bold text-stone-900">
                  {previewDesign.template.nameBn}
                </h4>
                <p className="text-xs text-stone-500 font-serif">
                  {previewDesign.template.name} •{' '}
                  {previewDesign.template.isFree
                    ? 'বিনামূল্যে'
                    : `প্রিমিয়াম — ৳${toBengaliNumber(previewDesign.template.priceBdt)} BDT`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDesign(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className={`w-full min-h-[260px] rounded-2xl p-6 sm:p-8 border-2 flex flex-col justify-between ${
                previewDesign.type === 'paper'
                  ? `${(previewDesign.template as PaperDesignConfig).bgClass} ${(previewDesign.template as PaperDesignConfig).textClass} ${(previewDesign.template as PaperDesignConfig).borderClass}`
                  : (previewDesign.template as EnvelopeDesignConfig).bgClass
              }`}
            >
              <div className="flex justify-between items-center text-xs font-mono opacity-70">
                <span>চিঠিঘর স্টেশনারি</span>
                <span>{previewDesign.type === 'paper' ? 'LETTER PAPER' : 'ROYAL ENVELOPE'}</span>
              </div>

              <div className="text-center my-auto space-y-2 py-6">
                <h3 className="text-xl sm:text-2xl font-serif font-bold">
                  {previewDesign.template.nameBn}
                </h3>
                <p className="text-xs sm:text-sm font-serif max-w-md mx-auto opacity-80 leading-relaxed">
                  {previewDesign.template.descriptionBn}
                </p>
                <p className="text-[11px] font-mono opacity-60">
                  বাংলা ও ইংরেজি উভয় হস্তাক্ষরে চমৎকার পঠনযোগ্যতা
                </p>
              </div>

              <div className="flex justify-between items-center text-[11px] font-mono opacity-75 border-t border-current/15 pt-3">
                <span>ID: {previewDesign.template.id}</span>
                <span>
                  {previewDesign.template.isFree
                    ? 'বিনামূল্যে ব্যবহারযোগ্য'
                    : `মূল্য: ৳${toBengaliNumber(previewDesign.template.priceBdt)} BDT`}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewDesign(null)}
                className="px-4 py-2 rounded-xl text-stone-600 font-serif text-xs hover:bg-stone-100"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={() => {
                  if (previewDesign.type === 'paper') {
                    handleSelectPaper(previewDesign.template as PaperDesignConfig);
                  } else {
                    handleSelectEnv(previewDesign.template as EnvelopeDesignConfig);
                  }
                  setPreviewDesign(null);
                }}
                className="px-6 py-2 rounded-xl bg-[#801D2E] text-white font-serif text-xs font-bold hover:bg-[#962337]"
              >
                {previewDesign.template.isFree || isTemplateUnlocked(previewDesign.template)
                  ? 'এই ডিজাইন প্রয়োগ করুন'
                  : 'আনলক করতে এগিয়ে যান'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isOpenModal) {
    return (
      <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
        <div className="relative w-full max-w-5xl bg-stone-50 rounded-3xl p-6 sm:p-8 border border-stone-300 shadow-2xl max-h-[92vh] overflow-y-auto space-y-6">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-[#801D2E]/10 text-[#801D2E]">
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-xl font-serif font-bold text-stone-900">
                  চিঠিঘর স্টেশনারি ও ভিন্টেজ কালেকশন
                </h3>
                <p className="text-xs font-serif text-stone-500">
                  ১৫টি প্রাচীন চিঠির পাতা এবং ১০টি রাজকীয় খামের সমৃদ্ধ সমাহার
                </p>
              </div>
            </div>

            {onCloseModal && (
              <button
                type="button"
                onClick={onCloseModal}
                className="p-2 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {content}

          {/* Modal Footer */}
          <div className="border-t border-stone-200 pt-4 flex justify-end">
            <button
              type="button"
              onClick={onCloseModal}
              className="px-6 py-2.5 rounded-xl bg-[#801D2E] text-white font-serif text-xs font-bold hover:bg-[#962337] transition-colors shadow-xs"
            >
              সম্পন্ন করুন (Apply & Close)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return content;
};
