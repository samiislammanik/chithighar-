import React, { useState } from 'react';
import { Letter, PhysicalOrder } from '../types';
import { LetterCard } from '../components/LetterCard';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { toBengaliNumber, getShareableUrl } from '../utils/formatters';
import {
  Inbox,
  Send,
  FileText,
  Bookmark,
  Package,
  Copy,
  Check,
  PenTool,
  Trash2,
  ExternalLink,
  Lock,
  Globe,
  Link2,
} from 'lucide-react';

interface DashboardPageProps {
  letters: Letter[];
  physicalOrders: PhysicalOrder[];
  onOpenLetter: (letter: Letter) => void;
  onEditDraft: (letter: Letter) => void;
  onDeleteLetter: (letterId: string) => void;
  onTrackOrder: (order: PhysicalOrder) => void;
  onWriteLetter: () => void;
  bookmarkedIds: Set<string>;
  onBookmarkLetter: (letter: Letter) => void;
  onOpenAuthModal?: (mode?: 'signin' | 'signup') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  letters,
  physicalOrders,
  onOpenLetter,
  onEditDraft,
  onDeleteLetter,
  onTrackOrder,
  onWriteLetter,
  bookmarkedIds,
  onBookmarkLetter,
  onOpenAuthModal,
}) => {
  const { profile, user } = useAuth();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'sent' | 'received' | 'drafts' | 'saved' | 'orders'>('sent');
  const [copiedBoxUrl, setCopiedBoxUrl] = useState(false);

  const currentUserId = user?.uid || profile?.id;
  const currentUsername = profile?.username;

  // Categorize letters
  const sentLetters = letters.filter(
    l => (l.authorId === currentUserId || l.ownerUid === currentUserId) && !l.isDraft
  );
  const draftLetters = letters.filter(
    l => (l.authorId === currentUserId || l.ownerUid === currentUserId) && l.isDraft
  );
  const receivedLetters = letters.filter(
    l => l.recipientUsername && l.recipientUsername.toLowerCase() === currentUsername?.toLowerCase()
  );
  const savedLetters = letters.filter(l => bookmarkedIds.has(l.id));
  const userOrders = physicalOrders.filter(o => o.userId === currentUserId);

  const letterboxUrl = currentUsername ? `https://chithighor.me/@${currentUsername}` : '';

  const handleCopyBoxUrl = () => {
    if (!letterboxUrl) return;
    navigator.clipboard.writeText(letterboxUrl);
    setCopiedBoxUrl(true);
    setTimeout(() => setCopiedBoxUrl(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 select-none">
      {/* Top Banner: User's Personal Letterbox */}
      <div className="rounded-2xl p-6 sm:p-8 bg-[#2C221E] text-[#EDE4DA] border-2 border-[#7A3644] shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#801D2E] to-[#450F18] border-2 border-amber-300/40 flex items-center justify-center font-serif text-2xl font-bold text-amber-100 shadow-md">
            {profile?.displayName?.slice(0, 1) || 'চি'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-black text-amber-50">
                {profile?.displayName || 'আমার চিঠিঘর'}
              </h1>
              <span className="text-xs font-mono bg-stone-800 text-amber-200 px-2 py-0.5 rounded-full border border-stone-700">
                @{profile?.username || 'user'}
              </span>
            </div>
            <p className="text-xs font-serif text-stone-300 mt-1">
              {profile?.bio || 'কিছু না-বলা কথা হৃদয়ে জমা থাকে...'}
            </p>
          </div>
        </div>

        {/* Shareable Letterbox link button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleCopyBoxUrl}
            className="px-4 py-2 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700 text-xs font-serif text-amber-100 flex items-center justify-center gap-1.5 transition-colors"
            title="অন্যদের চিঠি পাঠাতে এই লিঙ্ক শেয়ার করুন"
          >
            {copiedBoxUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-300" />}
            <span>{copiedBoxUrl ? 'ডাকবাক্স লিঙ্ক কপি হয়েছে!' : 'আমার ডাকবাক্স লিঙ্ক কপি'}</span>
          </button>

          <button
            onClick={onWriteLetter}
            className="px-5 py-2 rounded-xl bg-[#801D2E] hover:bg-[#962337] text-white text-xs font-serif font-bold flex items-center justify-center gap-1.5 shadow-md"
          >
            <PenTool className="w-4 h-4" />
            <span>নতুন চিঠি লিখুন</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E4DAC8] shadow-2xs space-y-1">
          <span className="text-xs font-serif text-stone-500">পাঠানো চিঠি (Sent)</span>
          <p className="text-2xl font-serif font-bold text-stone-900">
            {toBengaliNumber(sentLetters.length)}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#E4DAC8] shadow-2xs space-y-1">
          <span className="text-xs font-serif text-stone-500">পাওয়া চিঠি (Received)</span>
          <p className="text-2xl font-serif font-bold text-stone-900">
            {toBengaliNumber(receivedLetters.length)}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#E4DAC8] shadow-2xs space-y-1">
          <span className="text-xs font-serif text-stone-500">সংরক্ষিত চিঠি (Bookmarks)</span>
          <p className="text-2xl font-serif font-bold text-stone-900">
            {toBengaliNumber(savedLetters.length)}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#E4DAC8] shadow-2xs space-y-1">
          <span className="text-xs font-serif text-stone-500">কাগজের চিঠি অর্ডার (Orders)</span>
          <p className="text-2xl font-serif font-bold text-stone-900">
            {toBengaliNumber(userOrders.length)}
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-[#E8DFD0] overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-serif font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'sent'
              ? 'border-b-2 border-[#801D2E] text-[#801D2E] bg-white'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>পাঠানো চিঠি ({toBengaliNumber(sentLetters.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-serif font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'received'
              ? 'border-b-2 border-[#801D2E] text-[#801D2E] bg-white'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>পাওয়া চিঠি ({toBengaliNumber(receivedLetters.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('drafts')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-serif font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'drafts'
              ? 'border-b-2 border-[#801D2E] text-[#801D2E] bg-white'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>খসড়া ({toBengaliNumber(draftLetters.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-serif font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'saved'
              ? 'border-b-2 border-[#801D2E] text-[#801D2E] bg-white'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>সংরক্ষিত চিঠি ({toBengaliNumber(savedLetters.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-serif font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-b-2 border-[#801D2E] text-[#801D2E] bg-white'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>কাগজের চিঠি অর্ডার ({toBengaliNumber(userOrders.length)})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'sent' && (
        <div className="space-y-4">
          {sentLetters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sentLetters.map(letter => (
                <div key={letter.id} className="relative group">
                  <LetterCard
                    letter={letter}
                    onClick={() => onOpenLetter(letter)}
                    onBookmark={onBookmarkLetter}
                    isBookmarked={bookmarkedIds.has(letter.id)}
                  />
                  {/* Delete button */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (confirm('আপনি কি নিশ্চিত যে এই চিঠিটি মুছে ফেলতে চান?')) {
                        onDeleteLetter(letter.id);
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/80 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors shadow-2xs z-20"
                    title="চিঠি মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-xl bg-white border border-[#E4DAC8] space-y-3">
              <span className="text-3xl">📭</span>
              <h3 className="text-lg font-serif font-bold text-stone-800">
                আপনি এখনও কোনো চিঠি পাঠাননি
              </h3>
              <p className="text-xs font-serif text-stone-500">
                মনের না-বলা কথা প্রকাশ করতে একটি চিঠি লিখুন।
              </p>
              <button
                onClick={onWriteLetter}
                className="px-5 py-2 rounded-xl bg-[#801D2E] text-white text-xs font-serif font-bold"
              >
                চিঠি লিখুন
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'received' && (
        <div className="space-y-4">
          {receivedLetters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {receivedLetters.map(letter => (
                <LetterCard
                  key={letter.id}
                  letter={letter}
                  onClick={() => onOpenLetter(letter)}
                  onBookmark={onBookmarkLetter}
                  isBookmarked={bookmarkedIds.has(letter.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-xl bg-white border border-[#E4DAC8] space-y-3">
              <span className="text-3xl">💌</span>
              <h3 className="text-lg font-serif font-bold text-stone-800">
                আপনার ডাকবাক্সে এখনও কোনো চিঠি আসেনি
              </h3>
              <p className="text-xs font-serif text-stone-500 max-w-sm mx-auto">
                বন্ধুদের সাথে আপনার চিঠিঘরের লিঙ্ক (@{currentUsername}) শেয়ার করুন, যাতে তারা আপনাকে গোপন বা চেনা চিঠি পাঠাতে পারে।
              </p>
              <button
                onClick={handleCopyBoxUrl}
                className="px-5 py-2 rounded-xl bg-stone-800 text-amber-200 text-xs font-serif font-bold"
              >
                ডাকবাক্স লিঙ্ক কপি করুন
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'drafts' && (
        <div className="space-y-4">
          {draftLetters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {draftLetters.map(letter => (
                <div
                  key={letter.id}
                  onClick={() => onEditDraft(letter)}
                  className="p-5 rounded-xl bg-[#FAF5EB] border-2 border-dashed border-[#D5C6B0] hover:border-[#801D2E] cursor-pointer transition-all space-y-3"
                >
                  <div className="flex justify-between items-center text-xs font-serif text-amber-800">
                    <span className="font-bold bg-amber-100 px-2 py-0.5 rounded">খসড়া (Draft)</span>
                    <span>{new Date(letter.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-stone-900">
                    {letter.title || 'শিরোনামহীন খসড়া'}
                  </h3>
                  <p className="text-xs font-serif text-stone-600 line-clamp-2">
                    {letter.content || 'কোনো লেখা নেই...'}
                  </p>
                  <div className="pt-2 flex justify-between items-center text-xs font-serif text-[#801D2E] font-bold">
                    <span>সম্পাদনা ও প্রকাশ করুন →</span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onDeleteLetter(letter.id);
                      }}
                      className="text-stone-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-xl bg-white border border-[#E4DAC8] space-y-2">
              <span className="text-2xl">📝</span>
              <p className="text-xs font-serif text-stone-500">আপনার কোনো সংরক্ষিত খসড়া চিঠি নেই।</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedLetters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedLetters.map(letter => (
                <LetterCard
                  key={letter.id}
                  letter={letter}
                  onClick={() => onOpenLetter(letter)}
                  onBookmark={onBookmarkLetter}
                  isBookmarked={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-xl bg-white border border-[#E4DAC8] space-y-2">
              <span className="text-2xl">🔖</span>
              <p className="text-xs font-serif text-stone-500">
                চিঠির মেলা থেকে যে কোনো চিঠি বুকমার্ক করে এখানে সংরক্ষণ করতে পারেন।
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {userOrders.length > 0 ? (
            <div className="space-y-3">
              {userOrders.map(order => (
                <div
                  key={order.id}
                  onClick={() => onTrackOrder(order)}
                  className="p-5 rounded-xl bg-white border border-[#E4DAC8] shadow-2xs hover:shadow-md cursor-pointer transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#801D2E] bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
                        {order.trackingNumber}
                      </span>
                      <span className="text-xs font-serif text-stone-500">
                        প্যাকেজ: {order.packageType === 'standard' ? 'সাধারণ ডাকচিঠি' : (order.packageType === 'vintage_wax_box' ? 'হাতে ছোঁয়া ভিন্টেজ' : 'রয়াল স্মৃতি ডাকবাক্স')}
                      </span>
                    </div>
                    <h4 className="text-base font-serif font-bold text-stone-900">
                      চিঠির শিরোনাম: {order.letterTitle}
                    </h4>
                    <p className="text-xs font-serif text-stone-600">
                      প্রাপক: {order.recipientName} • জেলা: {order.district}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                    <span className="text-sm font-mono font-bold text-emerald-800">
                      ৳{order.priceBdt} BDT
                    </span>
                    <span className="text-xs font-serif px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                      {t.orderStatus[order.status] || order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-xl bg-white border border-[#E4DAC8] space-y-3">
              <span className="text-3xl">📦</span>
              <h3 className="text-lg font-serif font-bold text-stone-800">
                আপনার কোনো কাগজের চিঠি অর্ডার নেই
              </h3>
              <p className="text-xs font-serif text-stone-500">
                ৬৪ জেলার যেকোনো ঠিকানায় আসল কাগজের চিঠি পাঠাতে অর্ডার করুন।
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
