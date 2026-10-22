import React, { useState, useEffect, useRef } from 'react';
import {
  Letter,
  ReactionType,
  LetterComment,
  ContentReport,
} from '../types';
import { WaxSealBadge } from '../components/WaxSealBadge';
import { StampBadge } from '../components/StampBadge';
import { EnvelopeAnimation } from '../components/EnvelopeAnimation';
import { LetterPaperRenderer } from '../components/LetterPaperRenderer';
import { PremiumPaymentModal } from '../components/PremiumPaymentModal';
import { exportLetterToPng } from '../utils/pngExport';
import { getEnvelopeConfig, getPaperConfig, fetchUserTemplateAccess } from '../utils/stationery';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatRelativeTime, toBengaliNumber, countWords, getShareableUrl, generateLetterId } from '../utils/formatters';
import { playWaxSealBreak, playPaperRustle, playStampThud } from '../utils/sound';
import { updateLetterSEO, resetDefaultSEO } from '../utils/seo';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  collection,
  addDoc,
  getDocs,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  Heart,
  Share2,
  Bookmark,
  Flag,
  MessageSquare,
  ArrowLeft,
  Copy,
  Check,
  Eye,
  Send,
  Download,
  Printer,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface LetterViewPageProps {
  letter: Letter;
  onBack: () => void;
  onBookmarkToggle?: (letter: Letter) => void;
  isBookmarked?: boolean;
  onOpenAuthModal?: (mode?: 'signin' | 'signup') => void;
}

export const LetterViewPage: React.FC<LetterViewPageProps> = ({
  letter,
  onBack,
  onBookmarkToggle,
  isBookmarked = false,
  onOpenAuthModal,
}) => {
  const { user, profile, isAdmin } = useAuth();
  const { language, t } = useLanguage();

  const [reactions, setReactions] = useState(letter.reactions || {
    heart: 0,
    crying: 0,
    hug: 0,
    rose: 0,
    feather: 0,
  });
  const [userReacted, setUserReacted] = useState<ReactionType | null>(null);
  const [comments, setComments] = useState<LetterComment[]>([
    {
      id: 'c1',
      letterId: letter.id,
      authorId: 'reader_1',
      authorName: 'মেঘের ওপার',
      content: 'চিঠির প্রতিটি শব্দ যেন আমার নিজের মনের কথা বলে গেল... ভালো থাকুন প্রিয় অচেনা মানুষ।',
      isAnonymous: false,
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
  ]);
  const [newComment, setNewComment] = useState('');
  const [commentIsAnonymous, setCommentIsAnonymous] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Fetch real comments from Firestore
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const snap = await getDocs(collection(db, 'letters', letter.id, 'comments'));
        if (!snap.empty) {
          const loaded: LetterComment[] = [];
          snap.forEach(d => {
            loaded.push({ id: d.id, ...d.data() } as LetterComment);
          });
          loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setComments(loaded);
        }
      } catch (err) {
        console.warn('Comments fetch notice:', err);
      }
    };
    fetchComments();
  }, [letter.id]);

  // Fetch current user reaction from Firestore
  useEffect(() => {
    if (!user) {
      setUserReacted(null);
      return;
    }
    const checkReaction = async () => {
      try {
        const snap = await getDoc(doc(db, 'letters', letter.id, 'reactions', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data && data.reactionType) {
            setUserReacted(data.reactionType as ReactionType);
          }
        }
      } catch (err) {
        console.warn('Reaction check notice:', err);
      }
    };
    checkReaction();
  }, [letter.id, user]);

  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserTemplateAccess(user.uid).then(setUnlockedIds);
    } else {
      setUnlockedIds(new Set());
    }
  }, [user]);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const letterPaperRef = useRef<HTMLDivElement>(null);
  const envelopeConfig = getEnvelopeConfig(letter.envelopeColor);
  const paperConfig = getPaperConfig(letter.paperStyle);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('inappropriate');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const shareUrl = getShareableUrl(letter.id);
  const wordCount = countWords(letter.content);

  const handleDownloadPng = async () => {
    if (!letterPaperRef.current) return;

    // Verify whether this paper template is premium and unlocked
    const currentPaper = getPaperConfig(letter.paperStyle);
    if (!currentPaper.isFree) {
      const isUnlocked =
        (user && unlockedIds.has(currentPaper.id)) ||
        isAdmin ||
        (user && user.uid === letter.authorId);

      if (!isUnlocked) {
        setIsPaymentModalOpen(true);
        setExportFeedback(
          language === 'bn'
            ? 'এই চিঠিটির ভিন্টেজ পেপার ডিজাইনটি প্রিমিয়াম। পিএনজি সংরক্ষণে অনুগ্রহ করে বিকাশ/নগদে আনলক করুন।'
            : 'This letter paper design is premium. Please unlock it via bKash/Nagad to download.'
        );
        return;
      }
    }

    setIsExportingPng(true);
    setExportFeedback(
      language === 'bn'
        ? 'উচ্চ-রেজোলিউশন পিএনজি প্রস্তুত হচ্ছে...'
        : 'Rendering high-resolution letter PNG...'
    );

    try {
      const fileName = `chithighor-${letter.id}.png`;
      const result = await exportLetterToPng(letterPaperRef.current, {
        fileName,
        authorUsername: letter.isAnonymous ? 'anonymous' : letter.authorName,
        isAnonymous: letter.isAnonymous,
        scale: 2,
      });

      if (result.success) {
        setExportFeedback(
          language === 'bn'
            ? 'চিঠিটি পিএনজি ইমেজ হিসেবে সফলভাবে ডাউনলোড হয়েছে! ✓'
            : 'Letter PNG saved successfully! ✓'
        );
        setTimeout(() => setExportFeedback(null), 3500);
      } else {
        setExportFeedback(
          language === 'bn' ? 'পিএনজি ডাউনলোডে সমস্যা হয়েছে।' : 'Failed to export letter image.'
        );
        setTimeout(() => setExportFeedback(null), 3000);
      }
    } catch (err) {
      console.error('PNG export error:', err);
      setExportFeedback(
        language === 'bn' ? 'পিএনজি ডাউনলোডে সমস্যা হয়েছে।' : 'Failed to export letter image.'
      );
      setTimeout(() => setExportFeedback(null), 3000);
    } finally {
      setIsExportingPng(false);
    }
  };

  // Reaction types definition with nostalgic Bengali labels
  const reactionConfig: { type: ReactionType; icon: string; labelBn: string; labelEn: string; color: string }[] = [
    { type: 'heart', icon: '❤️', labelBn: 'ভালোবাসা', labelEn: 'Love', color: 'hover:bg-rose-100 text-rose-600' },
    { type: 'hug', icon: '🫂', labelBn: 'পাশে আছি', labelEn: 'Comfort', color: 'hover:bg-amber-100 text-amber-700' },
    { type: 'rose', icon: '🥀', labelBn: 'পুরোনো স্মৃতি', labelEn: 'Memories', color: 'hover:bg-red-100 text-red-700' },
    { type: 'feather', icon: '🕊️', labelBn: 'শান্তি', labelEn: 'Peace', color: 'hover:bg-sky-100 text-sky-700' },
    { type: 'crying', icon: '💧', labelBn: 'চোখের জল', labelEn: 'Tears', color: 'hover:bg-blue-100 text-blue-600' },
  ];

  const handleReaction = async (type: ReactionType) => {
    playStampThud();
    if (!user) {
      setShareFeedback(language === 'bn' ? 'অনুভূতি জানাতে অনুগ্রহ করে সাইন-ইন করুন।' : 'Please sign in to react.');
      setTimeout(() => setShareFeedback(null), 3000);
      if (onOpenAuthModal) onOpenAuthModal('signin');
      return;
    }

    const isAdding = userReacted !== type;
    const prevType = userReacted;

    setUserReacted(isAdding ? type : null);
    setReactions(prev => {
      const next = { ...prev };
      if (prevType) next[prevType] = Math.max(0, (next[prevType] || 0) - 1);
      if (isAdding) next[type] = (next[type] || 0) + 1;
      return next;
    });

    try {
      const letterRef = doc(db, 'letters', letter.id);
      const updates: Record<string, unknown> = {};
      if (prevType) updates[`reactions.${prevType}`] = increment(-1);
      if (isAdding) updates[`reactions.${type}`] = increment(1);
      await updateDoc(letterRef, updates);

      const reactionRef = doc(db, 'letters', letter.id, 'reactions', user.uid);
      if (isAdding) {
        await setDoc(reactionRef, {
          userId: user.uid,
          reactionType: type,
          createdAt: new Date().toISOString(),
        });
      } else {
        await deleteDoc(reactionRef);
      }
    } catch (err) {
      console.warn('Reaction update sync notice:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!user) {
      setShareFeedback(language === 'bn' ? 'মন্তব্য করতে অনুগ্রহ করে সাইন-ইন করুন।' : 'Please sign in to reply.');
      setTimeout(() => setShareFeedback(null), 3000);
      if (onOpenAuthModal) onOpenAuthModal('signin');
      return;
    }

    setIsSubmittingComment(true);
    const commentId = generateLetterId();
    const authorDisplayName = commentIsAnonymous
      ? (language === 'bn' ? 'অচেনা শুভানুধ্যায়ী' : 'Anonymous Well-Wisher')
      : (profile?.displayName || 'চিঠিবন্ধু');

    const commentObj: LetterComment = {
      id: commentId,
      letterId: letter.id,
      authorId: user.uid,
      authorName: authorDisplayName,
      content: newComment.trim(),
      isAnonymous: commentIsAnonymous,
      createdAt: new Date().toISOString(),
    };

    setComments(prev => [commentObj, ...prev]);
    setNewComment('');
    playPaperRustle();

    try {
      await setDoc(doc(db, 'letters', letter.id, 'comments', commentId), commentObj);
    } catch (err) {
      console.warn('Comment sync note:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const handleNativeShare = async () => {
    const shareData = {
      title: `${letter.title} — চিঠিঘর (Chithighor)`,
      text: `“${letter.title}” — চিঠিঘর থেকে একটি আবেগঘন চিঠি পড়ুন:`,
      url: shareUrl,
    };

    // Check if Web Share API is supported and can share this data
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        setShareFeedback(language === 'bn' ? 'চিঠিটি শেয়ার করা হয়েছে! ✓' : 'Shared successfully! ✓');
        setTimeout(() => setShareFeedback(null), 3500);
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          // User dismissed the native share sheet
          return;
        }
        console.warn('Web Share API error or cancelled, falling back to clipboard copy:', err);
      }
    }

    // Fallback: Copy unique URL to clipboard
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedLink(true);
        setShareFeedback(
          language === 'bn'
            ? 'চিঠির অনন্য লিঙ্ক ক্লিপবোর্ডে কপি করা হয়েছে! ✓'
            : 'Letter link copied to clipboard! ✓'
        );
        setTimeout(() => {
          setCopiedLink(false);
          setShareFeedback(null);
        }, 3500);
        return;
      }
    } catch (clipErr) {
      console.warn('Clipboard write failed:', clipErr);
    }

    // If both Web Share and direct clipboard write fail, open the detailed share modal
    setIsShareModalOpen(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setShareFeedback(
        language === 'bn'
          ? 'চিঠির গোপন লিঙ্ক কপি করা হয়েছে!'
          : 'Letter link copied to clipboard!'
      );
      setTimeout(() => {
        setCopiedLink(false);
        setShareFeedback(null);
      }, 3000);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (onOpenAuthModal) onOpenAuthModal('signin');
      return;
    }

    const reportId = generateLetterId();
    const reportObj: ContentReport = {
      id: reportId,
      targetType: 'letter',
      targetId: letter.id,
      reportedBy: user.uid,
      reason: reportReason,
      details: reportDetails,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'reports', reportId), reportObj);
      setReportSuccess(true);
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSuccess(false);
      }, 2000);
    } catch (err) {
      console.warn('Report submit note:', err);
    }
  };

  const paperStyles: Record<string, string> = {
    'vintage-parchment': 'bg-[#FAF4E8] text-[#382C24] border-[#DFD1B8]',
    'cream-linen': 'bg-[#FBF8F2] text-[#2C241E] border-[#E8DFD0]',
    'rose-petal': 'bg-[#FFF5F5] text-[#3E2528] border-[#F0D5D5]',
    'night-sky': 'bg-[#212836] text-[#EDE8DF] border-[#364259]',
    'classic-kraft': 'bg-[#EFE5D3] text-[#34271A] border-[#D6C5A9]',
    'tear-stained': 'bg-[#F4F4F4] text-[#2F2F2F] border-[#DCDCDC]',
  };

  const fontStyles: Record<string, string> = {
    'noto-serif': 'font-serif',
    'hind-siliguri': 'font-sans',
    kalam: 'font-handwriting',
    playfair: 'font-serif italic',
  };

  const isDarkPaper = letter.paperStyle === 'night-sky';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 select-none">
      {/* Share / Export / Feedback Toast Notification */}
      {(shareFeedback || exportFeedback) && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-stone-900 text-amber-100 border border-amber-300/40 text-xs font-serif shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{shareFeedback || exportFeedback}</span>
        </div>
      )}

      {/* Back button & top utilities */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-serif font-bold text-stone-800 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>চিঠিঘরের প্রচ্ছদে ফিরুন (Back)</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {onBookmarkToggle && (
            <button
              onClick={() => onBookmarkToggle(letter)}
              className={`p-2 rounded-xl border transition-colors ${
                isBookmarked
                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                  : 'bg-white border-stone-300 text-stone-600 hover:text-stone-900'
              }`}
              title={isBookmarked ? 'সংরক্ষিত চিঠি' : 'চিঠিটি সংগ্রহে রাখুন (Bookmark)'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          )}

          {/* Download as High-Res PNG Button */}
          <button
            onClick={handleDownloadPng}
            disabled={isExportingPng}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-serif font-bold text-stone-800 transition-all shadow-2xs hover:border-[#801D2E] disabled:opacity-60"
            title="চিঠির পেপারটি ওয়াটারমার্ক ও লেখকের ইউজারনেমসহ হাই-রেজোলিউশন পিএনজি আকারে ডাউনলোড করুন"
          >
            <Download className="w-4 h-4 text-[#801D2E]" />
            <span>{isExportingPng ? 'পিএনজি প্রস্তুত হচ্ছে...' : 'পিএনজি ডাউনলোড (PNG)'}</span>
          </button>

          {/* Web Share / Copy Link Button */}
          <button
            onClick={handleNativeShare}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#801D2E]/30 bg-white hover:bg-rose-50/50 text-xs font-serif font-bold text-[#801D2E] transition-all shadow-2xs group hover:border-[#801D2E]"
            title="Web Share API দিয়ে চিঠিটি শেয়ার করুন অথবা লিঙ্ক কপি করুন"
          >
            <Share2 className="w-4 h-4 text-[#801D2E] group-hover:scale-110 transition-transform" />
            <span>{copiedLink ? 'লিঙ্ক কপি হয়েছে! ✓' : 'শেয়ার (Share)'}</span>
          </button>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="p-2 rounded-xl border border-stone-300 bg-white hover:bg-rose-50 text-stone-500 hover:text-rose-600 transition-colors"
            title="আপত্তিকর অভিযোগ জানান (Report)"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stationery Template Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] font-mono text-stone-600">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-[#FAF4E8] border border-[#E2D5BE] text-stone-800">
            ✉ খাম: {envelopeConfig.nameBn}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#FAF4E8] border border-[#E2D5BE] text-stone-800">
            📜 কাগজ: {paperConfig.nameBn}
          </span>
        </div>
        <span className="text-stone-400">
          ওয়াটারমার্ক ও লেখক সনাক্তকরণ সুরক্ষিত
        </span>
      </div>

      {/* Envelope Opening Experience Wrapper */}
      <EnvelopeAnimation letter={letter} isOpenDefault={true}>
        {/* Render High-Res Letter Paper with Reference for PNG capture */}
        <div className="w-full">
          <LetterPaperRenderer ref={letterPaperRef} letter={letter} />
        </div>
      </EnvelopeAnimation>

      {/* Dedicated Web Share Callout Banner */}
      <div className="rounded-2xl p-5 bg-[#FAF4E8] border border-[#E2D5BE] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-full bg-[#801D2E]/10 text-[#801D2E] flex items-center justify-center shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-serif font-bold text-stone-900">
              চিঠিটি কাউকে পাঠাতে চান? (Share this Letter)
            </h4>
            <p className="text-xs font-serif text-stone-600">
              Web Share API-র সাহায্যে সোশ্যাল মিডিয়া ও মেসেঞ্জারে সহজে শেয়ার করুন অথবা গোপন লিঙ্ক কপি করুন।
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={handleDownloadPng}
            disabled={isExportingPng}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-serif font-bold flex items-center justify-center gap-2 shadow-2xs transition-all disabled:opacity-60"
          >
            <Download className="w-4 h-4 text-[#801D2E]" />
            <span>{isExportingPng ? 'পিএনজি প্রস্তুত হচ্ছে...' : 'পিএনজি ছবি ডাউনলোড'}</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#801D2E] to-[#601422] hover:from-[#942236] hover:to-[#731829] text-white text-xs font-serif font-bold flex items-center justify-center gap-2 shadow-sm transition-all transform active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>সরাসরি শেয়ার (Web Share)</span>
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-serif font-semibold"
            title="শেয়ারের অন্যান্য বিকল্প"
          >
            অন্যান্য...
          </button>
        </div>
      </div>

      {/* Tactile Emotional Reactions Bar */}
      <div className="rounded-2xl p-6 bg-white border border-[#E4DAC8] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif font-bold text-stone-900 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-600" />
            <span>চিঠির প্রতি আপনার অনুভূতি প্রকাশ করুন (Reactions)</span>
          </h3>
          <span className="text-xs font-serif text-stone-500">
            মোট প্রতিক্রিয়া: {toBengaliNumber(Object.values(reactions).reduce((a, b) => a + b, 0))}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {reactionConfig.map(r => {
            const count = reactions[r.type] || 0;
            const isSelected = userReacted === r.type;

            return (
              <button
                key={r.type}
                type="button"
                onClick={() => handleReaction(r.type)}
                className={`p-3 rounded-xl border text-center transition-all transform active:scale-95 flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'border-[#801D2E] bg-rose-50 ring-2 ring-[#801D2E]/20 scale-105 shadow-sm'
                    : 'border-stone-200 bg-[#FAF7F2] hover:bg-stone-100'
                } ${r.color}`}
              >
                <span className="text-2xl drop-shadow-xs">{r.icon}</span>
                <span className="text-xs font-serif font-bold text-stone-800">
                  {language === 'bn' ? r.labelBn : r.labelEn}
                </span>
                <span className="text-xs font-mono font-bold text-stone-600">
                  {toBengaliNumber(count)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Warm Community Comments & Responses Section */}
      <section className="rounded-2xl p-6 sm:p-8 bg-[#FAF5EB] border border-[#E6DBC9] space-y-6">
        <div className="flex items-center justify-between border-b border-[#DECDB7] pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#801D2E]" />
            <h3 className="text-lg font-serif font-bold text-stone-900">
              আন্তরিক প্রতিক্রিয়া ও উত্তর ({toBengaliNumber(comments.length)})
            </h3>
          </div>
          <span className="text-xs font-serif text-stone-500">
            শালীন ও মার্জিত ভাষা ব্যবহার কাম্য
          </span>
        </div>

        {/* Comment input form */}
        <form onSubmit={handleAddComment} className="space-y-3">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            maxLength={1500}
            rows={3}
            placeholder={t.commentPlaceholder}
            className="w-full p-4 rounded-xl border border-[#D5C6B0] bg-white text-stone-900 font-serif text-sm focus:outline-none focus:ring-2 focus:ring-[#801D2E]/40 focus:border-[#801D2E]"
          />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-serif text-stone-700">
              <input
                type="checkbox"
                checked={commentIsAnonymous}
                onChange={e => setCommentIsAnonymous(e.target.checked)}
                className="rounded border-stone-300 text-[#801D2E] focus:ring-[#801D2E]"
              />
              <span>মন্তব্যে নিজের নাম গোপন রাখুন (Anonymous response)</span>
            </label>

            <button
              type="submit"
              disabled={isSubmittingComment || !newComment.trim()}
              className="px-5 py-2 rounded-xl font-serif text-xs font-bold text-white bg-[#801D2E] hover:bg-[#962337] transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t.sendReplyBtn}</span>
            </button>
          </div>
        </form>

        {/* Existing comments list */}
        <div className="space-y-4 pt-2">
          {comments.map(c => (
            <div
              key={c.id}
              className="p-4 rounded-xl bg-white border border-[#E4DAC8] shadow-2xs space-y-2 animate-in fade-in"
            >
              <div className="flex items-center justify-between text-xs font-serif text-stone-500">
                <strong className="text-stone-900 font-bold">
                  {c.isAnonymous ? 'অচেনা শুভানুধ্যায়ী' : c.authorName}
                </strong>
                <span>{formatRelativeTime(c.createdAt, language)}</span>
              </div>
              <p className="text-sm font-serif text-stone-800 leading-relaxed whitespace-pre-line">
                {c.content}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 border border-stone-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-serif font-bold text-stone-900">
                {t.shareLetter}
              </h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs font-serif text-stone-600">
              চিঠিটি কাউকে সরাসরি পাঠাতে বা সোশ্যাল মিডিয়ায় শেয়ার করতে নিচের গোপন লিঙ্কটি কপি করুন:
            </p>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-100 border border-stone-200">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-transparent text-xs font-mono text-stone-700 focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-[#801D2E] text-white text-xs font-serif font-bold flex items-center gap-1 shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'কপি হয়েছে' : 'কপি'}</span>
              </button>
            </div>

            {/* Native Web Share Trigger */}
            <button
              onClick={() => {
                setIsShareModalOpen(false);
                handleNativeShare();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#801D2E] to-[#601422] hover:from-[#942236] hover:to-[#731829] text-white text-xs font-serif font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Share2 className="w-4 h-4 text-amber-200" />
              <span>মোবাইলের শেয়ার মেনুতে পাঠান (Native Web Share)</span>
            </button>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `চিঠিঘর থেকে একটি মন ছোঁয়া চিঠি: "${letter.title}" — পড়ুন: ${shareUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-serif text-center flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>হোয়াটসঅ্যাপে শেয়ার</span>
              </a>

              <button
                onClick={() => {
                  window.print();
                }}
                className="py-2 px-3 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-serif text-center flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>চিঠি প্রিন্ট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Moderation Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 border border-stone-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2 text-rose-700">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-base font-serif font-bold text-stone-900">
                  {t.reportContent}
                </h3>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-sm"
              >
                ✕
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-serif text-center">
                আপনার অভিযোগ চিঠিঘর প্রশাসন কক্ষে জমা হয়েছে। দ্রুত ব্যবস্থা গ্রহণ করা হবে।
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <p className="text-xs font-serif text-stone-600">
                  যদি এই চিঠিতে কোনো অশ্লীলতা, ব্যক্তিগত আক্রমণ, ক্ষতিকর তথ্য বা নীতিমালা লঙ্ঘন থাকে তবে জানান:
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-serif font-bold text-stone-800">
                    অভিযোগের কারণ
                  </label>
                  <select
                    value={reportReason}
                    onChange={e => setReportReason(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300 text-xs font-serif text-stone-800 focus:outline-none"
                  >
                    <option value="harassment">ব্যক্তিগত আক্রমণ বা হয়রানি (Harassment)</option>
                    <option value="hate_speech">ঘৃণামূলক বক্তব্য (Hate Speech)</option>
                    <option value="inappropriate">অশালীন বা কুরুচিপূর্ণ উপাদান (Inappropriate Content)</option>
                    <option value="privacy_violation">ব্যক্তিগত তথ্য বা ফোন নম্বর ফাঁস (Doxxing / Privacy)</option>
                    <option value="spam">স্প্যাম বা অপ্রাসঙ্গিক বিজ্ঞাপন (Spam)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-serif font-bold text-stone-800">
                    অতিরিক্ত বিবরণ (ঐচ্ছিক)
                  </label>
                  <textarea
                    value={reportDetails}
                    onChange={e => setReportDetails(e.target.value)}
                    rows={3}
                    placeholder="কেন এই চিঠিটি অপসারণযোগ্য..."
                    className="w-full p-2.5 rounded-lg border border-stone-300 text-xs font-serif focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="px-4 py-2 rounded-lg border text-xs font-serif text-stone-600 hover:bg-stone-50"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-serif font-bold"
                  >
                    {t.submitReport}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Premium Stationery Payment Modal */}
      {isPaymentModalOpen && (
        <PremiumPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          template={paperConfig}
          type="paper"
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
