import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'bn' | 'en';

export interface Translations {
  appName: string;
  tagline: string;
  home: string;
  exploreLetters: string;
  writeLetter: string;
  physicalLetters: string;
  myLetterbox: string;
  adminDesk: string;
  signIn: string;
  signOut: string;
  demoAccount: string;
  writeALetterBtn: string;
  exploreCommunityBtn: string;
  sendPhysicalBtn: string;
  heroBadge: string;
  heroHeading: string;
  heroSubheading: string;
  heroQuote: string;
  heroQuoteAuthor: string;
  openLetterAction: string;
  breakSealToRead: string;
  categories: Record<string, string>;
  paperStyles: Record<string, string>;
  envelopeColors: Record<string, string>;
  waxSeals: Record<string, string>;
  stamps: Record<string, string>;
  searchPlaceholder: string;
  latest: string;
  popular: string;
  allCategories: string;
  anonymousSender: string;
  toRecipient: string;
  publishedOn: string;
  wordsCount: string;
  reactionsText: string;
  writeReply: string;
  commentPlaceholder: string;
  sendReplyBtn: string;
  shareLetter: string;
  copyLink: string;
  linkCopied: string;
  reportContent: string;
  reportReason: string;
  submitReport: string;
  physicalDeliveryTitle: string;
  physicalDeliverySubtitle: string;
  selectPackage: string;
  deliveryAddress: string;
  recipientName: string;
  recipientPhone: string;
  district: string;
  orderSummary: string;
  confirmOrder: string;
  trackOrder: string;
  orderStatus: Record<string, string>;
  letterDetails: string;
  visibility: {
    public: string;
    unlisted: string;
    private: string;
  };
  recipientModes: {
    public: string;
    username: string;
    linkOnly: string;
  };
  footerAbout: string;
  privacyNotice: string;
  termsNotice: string;
  communityGuidelines: string;
  copyright: string;
}

const bnTranslations: Translations = {
  appName: 'চিঠিঘর',
  tagline: 'কিছু কথা চিঠিতেই সুন্দর',
  home: 'প্রচ্ছদ',
  exploreLetters: 'চিঠির মেলা',
  writeLetter: 'চিঠি লিখুন',
  physicalLetters: 'বাস্তবের চিঠি',
  myLetterbox: 'আমার ডাকবাক্স',
  adminDesk: 'প্রশাসন কক্ষ',
  signIn: 'প্রবেশ করুন',
  signOut: 'বেরিয়ে যান',
  demoAccount: 'অতিথি প্রবেশ',
  writeALetterBtn: 'একটি চিঠি লিখুন',
  exploreCommunityBtn: 'চিঠিগুলো পড়ুন',
  sendPhysicalBtn: 'কাগজের চিঠি পাঠান',
  heroBadge: 'ডাক পিয়নের স্মৃতি ও ডিজিটাল আবেগ',
  heroHeading: 'কিছু কথা চিঠিতেই সুন্দর',
  heroSubheading: 'না-বলা অনুভূতি, গোপন ক্ষমা কিংবা গভীর ভালোবাসা—নাম গোপন রেখে বা আপনজনের ঠিকানায় পাঠিয়ে দিন ডিজিটাল চিঠি অথবা খামে মোড়া আসল কাগজের চিঠি।',
  heroQuote: '“চিঠি লেখা মানে তো দূর থেকে ছুঁয়ে দেওয়া, যেখানে শব্দের ভেতরেও নিশ্বাস শোনা যায়।”',
  heroQuoteAuthor: '— চিঠিঘর স্মৃতিলেখা',
  openLetterAction: 'খামটি খুলুন',
  breakSealToRead: 'সিল ভেঙে চিঠি পড়ুন',
  categories: {
    all: 'সব চিঠি',
    love: 'প্রেম ও ভালোবাসা',
    heartbreak: 'বিরহ ও ভাঙা মন',
    family: 'পরিবার ও আপনজন',
    friendship: 'বন্ধুত্ব ও সহযাত্রী',
    life_stories: 'জীবনের গল্প',
    poetry: 'কবিতা ও পঙ্‌ক্তিমালা',
    anonymous: 'বেনামী চিঠি',
    apology: 'ক্ষমা ও অনুশোচনা',
    memories: 'পুরোনো স্মৃতি',
    motivation: 'অনুপ্রেরণা ও সাহস',
    unsent: 'না-বলা অনুভূতি',
    general: 'সাধারণ ভাবনা',
  },
  paperStyles: {
    'vintage-parchment': 'ভিন্টেজ পার্চমেন্ট',
    'cream-linen': 'ক্রিম লিনেন কাগজ',
    'rose-petal': 'গোলাপের পাপড়ি পাতা',
    'night-sky': 'নীল রাতের আকাশ',
    'classic-kraft': 'বাদামি ক্রাফট কাগজ',
    'tear-stained': 'স্মৃতির ভেজা পাতা',
  },
  envelopeColors: {
    burgundy: 'রক্তিম বারগান্ডি',
    'forest-green': 'ডাকঘরের গাঢ় সবুজ',
    terracotta: 'মাটির পোড়ানো টেরাকোটা',
    navy: 'গভীর নীল সমুদ্র',
    'gold-sand': 'সোনালি বালি',
  },
  waxSeals: {
    heart: 'হৃদয়ের মোহর',
    rose: 'লাল গোলাপ',
    bird: 'মুক্ত ডানা পাখি',
    anchor: 'স্থির নোঙর',
    monogram: 'চিঠিঘর মনোগ্রাম',
    none: 'সিল ছাড়া',
  },
  stamps: {
    'dhaka-vintage': 'ঢাকা জিপিও ১৯৭১',
    'post-runner': 'রানার (রাত নির্জন)',
    'water-lily': 'জাতীয় শাপলা ফুল',
    'bengal-tiger': 'রয়েল বেঙ্গল টাইগার',
    'tea-garden': 'শ্রীমঙ্গল চা বাগান',
  },
  searchPlaceholder: 'শিরোনাম, অনুভূতি বা কিওয়ার্ড দিয়ে চিঠি খুঁজুন...',
  latest: 'সাম্প্রতিক চিঠি',
  popular: 'প্রিয় চিঠিগুলো',
  allCategories: 'সব ক্যাটাগরি',
  anonymousSender: 'অচেনা লেখক',
  toRecipient: 'প্রাপক',
  publishedOn: 'লেখা হয়েছে',
  wordsCount: 'শব্দ',
  reactionsText: 'অনুভূতি প্রকাশ',
  writeReply: 'একটি আন্তরিক মন্তব্য বা উত্তর দিন',
  commentPlaceholder: 'আপনার আন্তরিক অনুভূতির কথা লিখুন (শালীনতা বজায় রাখুন)...',
  sendReplyBtn: 'উত্তর পাঠান',
  shareLetter: 'চিঠিটি শেয়ার করুন',
  copyLink: 'লিঙ্ক কপি করুন',
  linkCopied: 'চিঠির গোপন লিঙ্ক কপি করা হয়েছে!',
  reportContent: 'অভিযোগ দায়ের করুন',
  reportReason: 'অভিযোগের কারণ',
  submitReport: 'অভিযোগ পাঠান',
  physicalDeliveryTitle: 'বাস্তবের খামে কাগজের চিঠি',
  physicalDeliverySubtitle: 'আপনার লেখা চিঠিটিকে রাজকীয় খামে, খাঁটি মোমের সিল ও সুগন্ধি পাতার আবহে পৌঁছে দিই বাংলাদেশের যেকোনো প্রান্তে।',
  selectPackage: 'প্যাকেজ নির্বাচন করুন',
  deliveryAddress: 'প্রাপকের ঠিকানা',
  recipientName: 'প্রাপকের পুরো নাম',
  recipientPhone: 'প্রাপকের সচল মোবাইল নম্বর',
  district: 'জেলা',
  orderSummary: 'অর্ডারের বিবরণ',
  confirmOrder: 'অর্ডার নিশ্চিত করুন',
  trackOrder: 'অর্ডার ট্র্যাকিং',
  orderStatus: {
    pending: 'অপেক্ষমাণ',
    confirmed: 'গৃহীত হয়েছে',
    processing: 'চিঠি প্রস্তুত হচ্ছে',
    dispatched: 'কুরিয়ারে প্রেরিত',
    delivered: 'সফলভাবে পৌঁছেছে',
    cancelled: 'বাতিল',
  },
  letterDetails: 'চিঠির বিস্তারিত',
  visibility: {
    public: 'সার্বজনীন (চিঠির মেলায় প্রকাশিত হবে)',
    unlisted: 'তালিকাভুক্ত নয় (শুধুমাত্র লিঙ্ক থাকা ব্যক্তি পড়তে পারবেন)',
    private: 'ব্যক্তিগত (শুধুমাত্র প্রেরক ও নির্দিষ্ট প্রাপক দেখতে পাবেন)',
  },
  recipientModes: {
    public: 'চিঠিঘরের মেলায় সবার জন্য উন্মুক্ত',
    username: 'নির্দিষ্ট ব্যবহারকারীকে (@ইউজারনেম)',
    linkOnly: 'গোপন গোপনীয় লিঙ্ক (কাউকে সরাসরি পাঠাতে)',
  },
  footerAbout: 'চিঠিঘর হলো বাংলা ভাষাভাষীদের মন খুলে না-বলা কথা লিখে প্রকাশ করার এক উষ্ণ, নিরাপদ ও আবেগঘন নিকেতন। ডাক পিয়নের স্মৃতির মতো প্রতিটি চিঠি এখানে অমূল্য।',
  privacyNotice: 'আপনার গোপনীয়তা আমাদের পবিত্র আমানত। নাম গোপন রাখা চিঠিতে পরিচয় কখনো উন্মুক্ত করা হয় না।',
  termsNotice: 'ব্যবহারের শর্তাবলী',
  communityGuidelines: 'সম্প্রদায়ের শালীনতা ও নির্দেশিকা',
  copyright: 'চিঠিঘর (Chithighor) সর্বস্বত্ব সংরক্ষিত।',
};

const enTranslations: Translations = {
  appName: 'Chithighor',
  tagline: 'Some words are beautiful only in letters',
  home: 'Home',
  exploreLetters: 'Explore Letters',
  writeLetter: 'Write a Letter',
  physicalLetters: 'Physical Letters',
  myLetterbox: 'My Letterbox',
  adminDesk: 'Admin Desk',
  signIn: 'Sign In',
  signOut: 'Sign Out',
  demoAccount: 'Guest Access',
  writeALetterBtn: 'Write a Letter',
  exploreCommunityBtn: 'Read Letters',
  sendPhysicalBtn: 'Send Physical Mail',
  heroBadge: 'Nostalgic Postbox & Digital Emotions',
  heroHeading: 'Some words are beautiful only in letters',
  heroSubheading: 'Unspoken feelings, heartfelt apologies, or timeless affection—send anonymous or named digital letters, or deliver genuine wax-sealed paper letters anywhere in Bangladesh.',
  heroQuote: '“To write a letter is to touch someone from afar, where each quiet breath is heard between the ink lines.”',
  heroQuoteAuthor: '— The Chithighor Chronicle',
  openLetterAction: 'Open Envelope',
  breakSealToRead: 'Break seal to read',
  categories: {
    all: 'All Letters',
    love: 'Love & Romance',
    heartbreak: 'Heartbreak & Grief',
    family: 'Family & Roots',
    friendship: 'Friendship & Kin',
    life_stories: 'Life Stories',
    poetry: 'Poetry & Verses',
    anonymous: 'Anonymous Letters',
    apology: 'Apology & Regret',
    memories: 'Old Memories',
    motivation: 'Hope & Courage',
    unsent: 'Unsent Letters',
    general: 'Musings',
  },
  paperStyles: {
    'vintage-parchment': 'Vintage Parchment',
    'cream-linen': 'Cream Linen Paper',
    'rose-petal': 'Rose Petal Paper',
    'night-sky': 'Midnight Sky Paper',
    'classic-kraft': 'Classic Kraft Paper',
    'tear-stained': 'Tear Stained Sheets',
  },
  envelopeColors: {
    burgundy: 'Burgundy Crimson',
    'forest-green': 'Postbox Forest Green',
    terracotta: 'Earthen Terracotta',
    navy: 'Deep Ocean Navy',
    'gold-sand': 'Golden Sand',
  },
  waxSeals: {
    heart: 'Heart Crest',
    rose: 'Red Rose',
    bird: 'Free Feathered Bird',
    anchor: 'Anchor of Hope',
    monogram: 'Chithighor Monogram',
    none: 'Without Wax Seal',
  },
  stamps: {
    'dhaka-vintage': 'Dhaka GPO 1971',
    'post-runner': 'The Post Runner (Sukanta)',
    'water-lily': 'National Water Lily',
    'bengal-tiger': 'Royal Bengal Tiger',
    'tea-garden': 'Sreemangal Tea Estates',
  },
  searchPlaceholder: 'Search letters by title, emotion, or keyword...',
  latest: 'Latest Letters',
  popular: 'Most Loved',
  allCategories: 'All Categories',
  anonymousSender: 'Anonymous Writer',
  toRecipient: 'To',
  publishedOn: 'Written on',
  wordsCount: 'words',
  reactionsText: 'Reactions',
  writeReply: 'Leave a warm response',
  commentPlaceholder: 'Write your gentle words (please remain courteous)...',
  sendReplyBtn: 'Send Response',
  shareLetter: 'Share this letter',
  copyLink: 'Copy Secret Link',
  linkCopied: 'Secret letter link copied to clipboard!',
  reportContent: 'Report Content',
  reportReason: 'Reason for report',
  submitReport: 'Submit Report',
  physicalDeliveryTitle: 'Real Paper Letters in Wax-Sealed Envelopes',
  physicalDeliverySubtitle: 'We print, scent, wax-seal, and courier your digital letter anywhere across all 64 districts of Bangladesh.',
  selectPackage: 'Choose Package',
  deliveryAddress: 'Recipient Delivery Address',
  recipientName: 'Recipient Full Name',
  recipientPhone: 'Recipient Mobile Number',
  district: 'District',
  orderSummary: 'Order Summary',
  confirmOrder: 'Confirm & Place Order',
  trackOrder: 'Track Postal Order',
  orderStatus: {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Letter Being Prepared',
    dispatched: 'Dispatched with Courier',
    delivered: 'Delivered Safely',
    cancelled: 'Cancelled',
  },
  letterDetails: 'Letter Configuration',
  visibility: {
    public: 'Public (Appears on community feed)',
    unlisted: 'Unlisted (Only accessible via secret link)',
    private: 'Private (Visible only to sender and designated recipient)',
  },
  recipientModes: {
    public: 'Open to the public community feed',
    username: 'Direct to specific user (@username)',
    linkOnly: 'Secret link only (for private sharing)',
  },
  footerAbout: 'Chithighor is a sanctuary for Bengali speakers worldwide to share unspoken emotions, anonymous reflections, and nostalgic postal connections.',
  privacyNotice: 'Your privacy is sacred. Anonymous letters will never reveal the writer’s real identity.',
  termsNotice: 'Terms of Use',
  communityGuidelines: 'Community Guidelines',
  copyright: 'Chithighor. All rights reserved.',
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('chithighor_lang');
    return (saved === 'en' ? 'en' : 'bn') as Language;
  });

  useEffect(() => {
    localStorage.setItem('chithighor_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'bn' ? 'en' : 'bn'));
  };

  const t = language === 'bn' ? bnTranslations : enTranslations;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
