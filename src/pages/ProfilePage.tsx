import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { toBengaliNumber } from '../utils/formatters';
import { User, Copy, Check, Save, ShieldCheck, Mail, Edit3, Heart } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { profile, updateProfile, user, isAdmin } = useAuth();
  const { language, t } = useLanguage();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const letterboxUrl = profile?.username ? `https://chithighor.me/@${profile.username}` : '';

  const handleCopyLink = () => {
    if (!letterboxUrl) return;
    navigator.clipboard.writeText(letterboxUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      displayName: displayName.trim(),
      bio: bio.trim(),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 select-none">
      {/* Top Profile Card */}
      <div className="rounded-2xl p-6 sm:p-8 bg-white border border-[#E4DAC8] shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#801D2E] to-[#450F18] border-2 border-[#A83246] text-amber-100 flex items-center justify-center font-serif text-3xl font-black shadow-md shrink-0">
          {profile?.displayName?.slice(0, 1) || 'চি'}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-serif font-black text-stone-900">
                {profile?.displayName || 'চিঠিবন্ধু'}
              </h1>
              <p className="text-xs font-mono text-stone-500">
                @{profile?.username || 'user'}
              </p>
            </div>

            {isAdmin && (
              <span className="inline-block text-xs font-serif font-bold text-red-800 bg-red-100 px-3 py-1 rounded-full border border-red-200">
                চিঠিঘর প্রধান প্রশাসক (Admin)
              </span>
            )}
          </div>

          <p className="text-sm font-serif text-stone-600 leading-relaxed italic">
            &ldquo;{profile?.bio || 'কিছু না-বলা কথা হৃদয়ে জমা থাকে...'}&rdquo;
          </p>

          <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-4 text-xs font-serif text-stone-500">
            <span>সদস্য হয়েছেন: {new Date(profile?.createdAt || Date.now()).toLocaleDateString()}</span>
            <span>•</span>
            <span>চিঠি লিখেছেন: {toBengaliNumber(profile?.lettersCount || 0)} টি</span>
          </div>
        </div>
      </div>

      {/* Shareable Personal Letterbox Link */}
      <div className="rounded-2xl p-6 bg-[#FAF5EB] border border-[#E6DBC9] space-y-3">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#801D2E]" />
          <h2 className="text-sm font-serif font-bold text-stone-900">
            আপনার ব্যক্তিগত ডাকবাক্স লিংক (Personal Letterbox Link)
          </h2>
        </div>
        <p className="text-xs font-serif text-stone-600 leading-relaxed">
          এই লিঙ্কটি আপনার ফেসবুক, ইনস্টাগ্রাম বা বায়োতে যুক্ত করতে পারেন। যে কেউ এই লিঙ্কে গিয়ে আপনাকে বেনামী বা পরিচিত চিঠি পাঠাতে পারবে, যা সরাসরি আপনার ডাকবাক্সে জমা হবে।
        </p>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#D5C6B0]">
          <input
            type="text"
            readOnly
            value={letterboxUrl}
            className="w-full text-xs font-mono text-stone-700 bg-transparent focus:outline-none"
          />
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-1.5 rounded-lg bg-[#801D2E] text-white text-xs font-serif font-bold flex items-center gap-1 shrink-0 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
          </button>
        </div>
      </div>

      {/* Profile Edit Form */}
      <div className="rounded-2xl p-6 sm:p-8 bg-white border border-[#E4DAC8] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-stone-600" />
            <span>প্রোফাইল তথ্য পরিবর্তন করুন</span>
          </h2>
          {isSaved && (
            <span className="text-xs font-serif text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded">
              সফলভাবে সংরক্ষিত হয়েছে! ✓
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-serif font-bold text-stone-800">
              প্রদর্শিত নাম (Display Name)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={80}
              className="w-full p-2.5 rounded-lg border border-[#D5C6B0] text-sm font-serif focus:outline-none focus:border-[#801D2E]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-serif font-bold text-stone-800">
              বায়ো / সংক্ষিপ্ত পরিচিতি (Bio)
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={300}
              placeholder="আপনার মনের একটি লাইন লিখুন..."
              className="w-full p-2.5 rounded-lg border border-[#D5C6B0] text-sm font-serif focus:outline-none focus:border-[#801D2E]"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#801D2E] hover:bg-[#962337] text-white text-xs font-serif font-bold flex items-center gap-2 shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>পরিবর্তন সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
