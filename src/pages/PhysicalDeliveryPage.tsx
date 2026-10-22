import React, { useState } from 'react';
import {
  DeliveryPackage,
  PhysicalOrder,
  PaperStyle,
  EnvelopeColor,
  WaxSeal,
  OrderStatus,
} from '../types';
import { DEFAULT_DELIVERY_PACKAGES, BD_DISTRICTS } from '../utils/sampleData';
import { WaxSealBadge } from '../components/WaxSealBadge';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { generateTrackingNumber, generateLetterId, toBengaliNumber } from '../utils/formatters';
import { playWaxSealBreak, playStampThud, playPaperRustle } from '../utils/sound';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import confetti from 'canvas-confetti';
import {
  Package,
  Truck,
  ShieldCheck,
  Check,
  ArrowRight,
  Clock,
  MapPin,
  Phone,
  User,
  CreditCard,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface PhysicalDeliveryPageProps {
  onOrderCreated: (order: PhysicalOrder) => void;
  initialLetterData?: {
    title?: string;
    content?: string;
    paperStyle?: PaperStyle;
    envelopeColor?: EnvelopeColor;
    waxSeal?: WaxSeal;
  } | null;
  onGoToTracking: (orderId: string) => void;
}

export const PhysicalDeliveryPage: React.FC<PhysicalDeliveryPageProps> = ({
  onOrderCreated,
  initialLetterData,
  onGoToTracking,
}) => {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();

  const [packages] = useState<DeliveryPackage[]>(DEFAULT_DELIVERY_PACKAGES);
  const [selectedPackage, setSelectedPackage] = useState<DeliveryPackage>(packages[1] || packages[0]);

  // Step wizard: 1. Package, 2. Letter & Wax, 3. Address, 4. Payment & Confirm
  const [step, setStep] = useState<1 | 2 | 3 | 4>(initialLetterData?.content ? 3 : 1);

  // Letter content
  const [letterTitle, setLetterTitle] = useState(initialLetterData?.title || '');
  const [letterContent, setLetterContent] = useState(initialLetterData?.content || '');
  const [paperStyle, setPaperStyle] = useState<PaperStyle>(initialLetterData?.paperStyle || 'vintage-parchment');
  const [envelopeColor, setEnvelopeColor] = useState<EnvelopeColor>(initialLetterData?.envelopeColor || 'burgundy');
  const [waxSeal, setWaxSeal] = useState<WaxSeal>(initialLetterData?.waxSeal || 'rose');

  // Recipient details
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [district, setDistrict] = useState(BD_DISTRICTS[0]);
  const [postalCode, setPostalCode] = useState('');

  // Sender details
  const [senderName, setSenderName] = useState(profile?.displayName || 'অচেনা শুভাকাঙ্ক্ষী');
  const [isAnonymousCover, setIsAnonymousCover] = useState(false);
  const [senderPhone, setSenderPhone] = useState('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Card'>('bKash');
  const [txId, setTxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<PhysicalOrder | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreateOrder = async (isDemoVerified = false) => {
    if (!recipientName.trim() || !recipientPhone.trim() || !recipientAddress.trim()) {
      setErrorMsg('অনুগ্রহ করে প্রাপকের নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা প্রদান করুন।');
      return;
    }
    if (!letterTitle.trim() || !letterContent.trim()) {
      setErrorMsg('অনুগ্রহ করে চিঠির সম্বোধন ও বক্তব্য লিখুন।');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const orderId = `order_${generateLetterId()}`;
    const trackingNo = generateTrackingNumber();
    const currentUserId = user ? user.uid : (profile?.id || 'guest_buyer');

    const newOrder: PhysicalOrder = {
      id: orderId,
      userId: currentUserId,
      letterTitle: letterTitle.trim(),
      letterContent: letterContent.trim(),
      paperStyle,
      envelopeColor,
      waxSeal,
      packageType: selectedPackage.id as 'standard' | 'vintage_wax_box' | 'keepsake_deluxe',
      priceBdt: selectedPackage.priceBdt,
      senderName: isAnonymousCover ? 'অচেনা শুভাকাঙ্ক্ষী (Anonymous)' : senderName.trim(),
      senderPhone: senderPhone.trim() || undefined,
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.trim(),
      recipientAddress: recipientAddress.trim(),
      district,
      postalCode: postalCode.trim() || undefined,
      status: 'confirmed',
      trackingNumber: trackingNo,
      paymentStatus: isDemoVerified ? 'mock_verified' : (txId.trim() ? 'mock_verified' : 'unpaid'),
      paymentMethod,
      paymentTxId: txId.trim() || (isDemoVerified ? `DEMO-TRX-${Math.floor(100000 + Math.random() * 900000)}` : undefined),
      notes: isAnonymousCover ? 'খামের ওপর প্রেরকের নাম মুদ্রিত হবে না।' : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (user) {
        await setDoc(doc(db, 'orders', orderId), newOrder);
      } else {
        const localOrders = JSON.parse(localStorage.getItem('chithighor_local_orders') || '[]');
        localOrders.unshift(newOrder);
        localStorage.setItem('chithighor_local_orders', JSON.stringify(localOrders));
      }

      playStampThud();
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#801D2E', '#C5A059', '#1E3F31'],
        });
      } catch {
        // Ignore
      }

      setOrderConfirmed(newOrder);
      onOrderCreated(newOrder);
    } catch (err) {
      console.warn('Order save notice:', err);
      // Fallback local
      const localOrders = JSON.parse(localStorage.getItem('chithighor_local_orders') || '[]');
      localOrders.unshift(newOrder);
      localStorage.setItem('chithighor_local_orders', JSON.stringify(localOrders));
      setOrderConfirmed(newOrder);
      onOrderCreated(newOrder);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 select-none">
      {/* Title & Postal Trust Badge */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-serif font-bold">
          <Truck className="w-4 h-4 text-emerald-700" />
          <span>সারাদেশে ৬৪ জেলায় বিশ্বস্ত ডাক ও কুরিয়ার ডেলিভারি</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-900">
          {t.physicalDeliveryTitle}
        </h1>
        <p className="text-sm font-serif text-stone-600 leading-relaxed">
          {t.physicalDeliverySubtitle}
        </p>
      </div>

      {orderConfirmed ? (
        /* Order Confirmed View */
        <div className="max-w-2xl mx-auto rounded-2xl bg-white border border-[#E4DAC8] p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl">
            ✓
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-black text-stone-900">
              অর্ডার সফলভাবে গৃহীত হয়েছে!
            </h2>
            <p className="text-xs font-serif text-stone-600">
              আপনার চিঠিটি আমাদের ডাকঘরে যত্নসহকারে প্রিন্ট, সুগন্ধি মিশ্রণ ও খাঁটি মোমের সিলমোহর লাগিয়ে পাঠানো হচ্ছে।
            </p>
          </div>

          {/* Tracking Box */}
          <div className="p-4 rounded-xl bg-[#FAF5EB] border border-[#E6DBC9] space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-500">
              আপনার ট্র্যাকিং নম্বর (Tracking Number)
            </span>
            <div className="text-2xl font-mono font-black text-[#801D2E] tracking-wider">
              {orderConfirmed.trackingNumber}
            </div>
            <p className="text-[11px] font-serif text-stone-600">
              প্রাপক: <strong>{orderConfirmed.recipientName}</strong> • জেলা: {orderConfirmed.district}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <button
              onClick={() => onGoToTracking(orderConfirmed.trackingNumber)}
              className="px-6 py-3 rounded-xl bg-[#801D2E] hover:bg-[#962337] text-white text-xs font-serif font-bold transition-colors shadow-md"
            >
              চিঠিটি ট্র্যাক করুন (Track Order)
            </button>
            <button
              onClick={() => setOrderConfirmed(null)}
              className="px-6 py-3 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-serif font-semibold transition-colors"
            >
              আরেকটি চিঠি পাঠান
            </button>
          </div>
        </div>
      ) : (
        /* Step-by-Step Order Flow */
        <div className="space-y-8">
          {/* Progress Steps Header */}
          <div className="flex items-center justify-between max-w-xl mx-auto text-xs font-serif">
            {[
              { num: 1, label: 'প্যাকেজ বাছাই' },
              { num: 2, label: 'চিঠির কথা ও খাম' },
              { num: 3, label: 'প্রাপকের ঠিকানা' },
              { num: 4, label: 'পেমেন্ট ও নিশ্চিতকরণ' },
            ].map(s => (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num as 1 | 2 | 3 | 4)}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  step === s.num ? 'text-[#801D2E] font-bold' : 'text-stone-400'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                    step === s.num
                      ? 'bg-[#801D2E] text-white shadow-xs'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {s.num}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            ))}
          </div>

          {/* STEP 1: Package Selection */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="text-center">
                <h2 className="text-xl font-serif font-bold text-stone-900">
                  ১. আপনার পছন্দের ডাকচিঠি প্যাকেজ নির্বাচন করুন
                </h2>
                <p className="text-xs font-serif text-stone-600 mt-1">
                  প্রতিটি প্যাকেজে থাকে চিঠিঘরের স্বকীয় আন্তরিকতা ও হস্তনির্মিত শৈলী।
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packages.map(pkg => (
                  <div
                    key={pkg.id}
                    onClick={() => {
                      playPaperRustle();
                      setSelectedPackage(pkg);
                    }}
                    className={`rounded-2xl p-6 border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                      selectedPackage.id === pkg.id
                        ? 'border-[#801D2E] bg-white shadow-xl ring-2 ring-[#801D2E]/20 scale-102'
                        : 'border-[#E4DAC8] bg-[#FAF5EB] hover:border-stone-400'
                    }`}
                  >
                    {pkg.badge && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#801D2E] text-amber-100 text-[10px] font-serif font-bold px-3 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                        {pkg.badge}
                      </span>
                    )}

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-serif font-bold text-stone-900">
                          {language === 'bn' ? pkg.nameBn : pkg.name}
                        </h3>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl font-mono font-bold text-emerald-800">
                            ৳{toBengaliNumber(pkg.priceBdt)}
                          </span>
                          <span className="text-xs font-serif text-stone-500">BDT</span>
                        </div>
                        <span className="text-[11px] font-mono text-stone-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          ডেলিভারি: {pkg.estimatedDays}
                        </span>
                      </div>

                      <div className="border-t border-stone-200/80 pt-3">
                        <ul className="space-y-2 text-xs font-serif text-stone-700">
                          {(language === 'bn' ? pkg.featuresBn : pkg.features).map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        type="button"
                        className={`w-full py-2.5 rounded-xl text-xs font-serif font-bold transition-colors ${
                          selectedPackage.id === pkg.id
                            ? 'bg-[#801D2E] text-white shadow-xs'
                            : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                        }`}
                      >
                        {selectedPackage.id === pkg.id ? 'নির্বাচিত হয়েছে ✓' : 'প্যাকেজটি বেছে নিন'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl bg-[#801D2E] hover:bg-[#962337] text-white text-xs font-serif font-bold flex items-center gap-2 shadow-md"
                >
                  <span>পরবর্তী ধাপ: চিঠির কথা ও খাম সাজান</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Letter Content & Wax Styling */}
          {step === 2 && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in">
              <div className="text-center">
                <h2 className="text-xl font-serif font-bold text-stone-900">
                  ২. কাগজের চিঠির সম্বোধন ও বক্তব্য লিখুন
                </h2>
                <p className="text-xs font-serif text-stone-600 mt-1">
                  আপনার দেওয়া কথাগুলো সুন্দর ক্যালিগ্রাফি হরফে নির্বাচিত কাগজে প্রিন্ট করা হবে।
                </p>
              </div>

              <div className="space-y-4 rounded-2xl bg-white p-6 border border-[#E4DAC8] shadow-xs">
                <div className="space-y-1">
                  <label className="text-xs font-serif font-bold text-stone-800">
                    চিঠির সম্বোধন (Greeting) *
                  </label>
                  <input
                    type="text"
                    value={letterTitle}
                    onChange={e => setLetterTitle(e.target.value)}
                    placeholder="যেমন: প্রিয় বাবা / প্রিয় অনুসূয়া / প্রিয় বন্ধু..."
                    className="w-full p-3 rounded-xl border border-[#D5C6B0] text-sm font-serif focus:outline-none focus:border-[#801D2E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-serif font-bold text-stone-800">
                    চিঠির মূল বক্তব্য (Letter Body) *
                  </label>
                  <textarea
                    rows={8}
                    value={letterContent}
                    onChange={e => setLetterContent(e.target.value)}
                    placeholder="আপনার চিঠিটি এখানে লিখুন..."
                    className="w-full p-4 rounded-xl border border-[#D5C6B0] text-sm font-serif leading-relaxed focus:outline-none focus:border-[#801D2E]"
                  />
                </div>

                {/* Paper & Wax choices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-serif font-bold text-stone-800">
                      কাগজের ধরন
                    </label>
                    <select
                      value={paperStyle}
                      onChange={e => setPaperStyle(e.target.value as PaperStyle)}
                      className="w-full p-2.5 rounded-lg border border-[#D5C6B0] text-xs font-serif bg-stone-50"
                    >
                      <option value="vintage-parchment">ভিন্টেজ পার্চমেন্ট (পোড়ামাটি ভাব)</option>
                      <option value="cream-linen">প্রিমিয়াম ক্রিম লিনেন কাগজ</option>
                      <option value="rose-petal">গোলাপের পাপড়ির সুবাসিত পাতা</option>
                      <option value="classic-kraft">বাদামি ক্লাসিক ক্রাফট কাগজ</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-serif font-bold text-stone-800">
                      খাম ও মোমের সিলমোহর
                    </label>
                    <div className="flex items-center gap-3 pt-1">
                      <WaxSealBadge seal={waxSeal} color={envelopeColor} size="md" />
                      <select
                        value={waxSeal}
                        onChange={e => {
                          playWaxSealBreak();
                          setWaxSeal(e.target.value as WaxSeal);
                        }}
                        className="flex-1 p-2 rounded-lg border border-[#D5C6B0] text-xs font-serif bg-stone-50"
                      >
                        <option value="rose">লাল গোলাপ সিলমোহর</option>
                        <option value="heart">হৃদয়ের মোহর</option>
                        <option value="bird">মুক্ত পাখি</option>
                        <option value="anchor">দৃঢ় নোঙর</option>
                        <option value="monogram">চিঠিঘর মনোগ্রাম</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl border text-xs font-serif text-stone-600 hover:bg-stone-50"
                >
                  ← আগের ধাপ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!letterTitle.trim() || !letterContent.trim()) {
                      alert('অনুগ্রহ করে চিঠির সম্বোধন ও বক্তব্য লিখুন।');
                      return;
                    }
                    setStep(3);
                  }}
                  className="px-6 py-3 rounded-xl bg-[#801D2E] hover:bg-[#962337] text-white text-xs font-serif font-bold flex items-center gap-2 shadow-md"
                >
                  <span>পরবর্তী ধাপ: প্রাপকের ঠিকানা দিন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Delivery Address Form */}
          {step === 3 && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in">
              <div className="text-center">
                <h2 className="text-xl font-serif font-bold text-stone-900">
                  ৩. প্রাপক ও প্রেরকের ডাকঠিকানা
                </h2>
                <p className="text-xs font-serif text-stone-600 mt-1">
                  ঠিকানা কখনোই জনসমক্ষে উন্মুক্ত করা হবে না। এটি কঠোরভাবে গোপন ও সুরক্ষিত।
                </p>
              </div>

              <div className="space-y-6 rounded-2xl bg-white p-6 sm:p-8 border border-[#E4DAC8] shadow-xs">
                {/* Recipient Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-700" />
                    <span>প্রাপকের তথ্য (Recipient Information) *</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-serif font-bold text-stone-800">
                        প্রাপকের পুরো নাম *
                      </label>
                      <input
                        type="text"
                        value={recipientName}
                        onChange={e => setRecipientName(e.target.value)}
                        placeholder="যেমন: তানিয়া রহমান"
                        className="w-full p-2.5 rounded-lg border border-[#D5C6B0] text-sm font-serif focus:outline-none focus:border-[#801D2E]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-serif font-bold text-stone-800">
                        প্রাপকের সচল মোবাইল নম্বর *
                      </label>
                      <input
                        type="text"
                        value={recipientPhone}
                        onChange={e => setRecipientPhone(e.target.value)}
                        placeholder="017xxxxxxxx"
                        className="w-full p-2.5 rounded-lg border border-[#D5C6B0] text-sm font-mono focus:outline-none focus:border-[#801D2E]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-serif font-bold text-stone-800">
                        জেলা (District) *
                      </label>
                      <select
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-[#D5C6B0] text-xs font-serif bg-stone-50"
                      >
                        {BD_DISTRICTS.map(d => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-serif font-bold text-stone-800">
                        পোস্টাল কোড (ঐচ্ছিক)
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={e => setPostalCode(e.target.value)}
                        placeholder="যেমন: ১২০৫"
                        className="w-full p-2.5 rounded-lg border border-[#D5C6B0] text-sm font-mono focus:outline-none focus:border-[#801D2E]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-serif font-bold text-stone-800">
                      বিস্তারিত ঠিকানা (বাড়ি, রোড, এলাকা, থানা) *
                    </label>
                    <textarea
                      rows={2}
                      value={recipientAddress}
                      onChange={e => setRecipientAddress(e.target.value)}
                      placeholder="বাড়ি নং, ফ্ল্যাট, রোড, এলাকা, পোস্ট অফিস ও থানা..."
                      className="w-full p-2.5 rounded-lg border border-[#D5C6B0] text-xs font-serif focus:outline-none focus:border-[#801D2E]"
                    />
                  </div>
                </div>

                {/* Sender Details */}
                <div className="space-y-4 pt-4 border-t border-stone-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wider">
                      প্রেরকের তথ্য (Sender Details)
                    </h3>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-serif text-amber-900 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                      <input
                        type="checkbox"
                        checked={isAnonymousCover}
                        onChange={e => setIsAnonymousCover(e.target.checked)}
                        className="rounded text-[#801D2E] focus:ring-[#801D2E]"
                      />
                      <span>খামের ওপর প্রেরকের নাম গোপন রাখুন</span>
                    </label>
                  </div>

                  {!isAnonymousCover && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-serif font-bold text-stone-800">
                          প্রেরকের নাম
                        </label>
                        <input
                          type="text"
                          value={senderName}
                          onChange={e => setSenderName(e.target.value)}
                          placeholder="আপনার নাম বা ডাকনাম"
                          className="w-full p-2.5 rounded-lg border border-[#D5C6B0] text-sm font-serif"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-serif font-bold text-stone-800">
                          আপনার মোবাইল নম্বর (ডেলিভারি আপডেটের জন্য)
                        </label>
                        <input
                          type="text"
                          value={senderPhone}
                          onChange={e => setSenderPhone(e.target.value)}
                          placeholder="017xxxxxxxx"
                          className="w-full p-2.5 rounded-lg border border-[#D5C6B0] text-sm font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl border text-xs font-serif text-stone-600 hover:bg-stone-50"
                >
                  ← আগের ধাপ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!recipientName.trim() || !recipientPhone.trim() || !recipientAddress.trim()) {
                      alert('অনুগ্রহ করে প্রাপকের নাম, মোবাইল নম্বর এবং ঠিকানা পূরণ করুন।');
                      return;
                    }
                    setStep(4);
                  }}
                  className="px-6 py-3 rounded-xl bg-[#801D2E] hover:bg-[#962337] text-white text-xs font-serif font-bold flex items-center gap-2 shadow-md"
                >
                  <span>পরবর্তী ধাপ: পেমেন্ট ও অর্ডার নিশ্চিতকরণ</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Payment & Review Confirmation */}
          {step === 4 && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in">
              <div className="text-center">
                <h2 className="text-xl font-serif font-bold text-stone-900">
                  ৪. অর্ডার পর্যালোচনা ও পেমেন্ট
                </h2>
                <p className="text-xs font-serif text-stone-600 mt-1">
                  স্বচ্ছ ও নিরাপদ পেমেন্ট যাচাইকরণের মাধ্যমে আপনার চিঠির অর্ডার সম্পন্ন করুন।
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-serif">
                  {errorMsg}
                </div>
              )}

              {/* Order Summary Receipt */}
              <div className="rounded-2xl bg-white p-6 border border-[#E4DAC8] shadow-sm space-y-4">
                <h3 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wider border-b pb-2">
                  অর্ডারের সারসংক্ষেপ (Receipt)
                </h3>

                <div className="space-y-2 text-xs font-serif">
                  <div className="flex justify-between">
                    <span className="text-stone-600">নির্বাচিত প্যাকেজ:</span>
                    <strong className="text-stone-900">{selectedPackage.nameBn}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">চিঠির শিরোনাম:</span>
                    <strong className="text-stone-900">{letterTitle}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">প্রাপক:</span>
                    <strong className="text-stone-900">{recipientName} ({district})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">ডেলিভারি ঠিকানা:</span>
                    <span className="text-stone-700 max-w-xs text-right truncate">
                      {recipientAddress}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">প্রেরকের রূপ:</span>
                    <strong className="text-stone-900">
                      {isAnonymousCover ? 'নাম গোপন রাখা হয়েছে' : senderName}
                    </strong>
                  </div>
                  <div className="border-t border-dashed my-2 pt-2 flex justify-between text-sm font-bold">
                    <span>সর্বমোট প্রদেয় বিল:</span>
                    <span className="font-mono text-emerald-800 text-base">
                      ৳{toBengaliNumber(selectedPackage.priceBdt)} BDT
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="rounded-2xl bg-[#FAF5EB] p-6 border border-[#E4DAC8] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wider">
                    পেমেন্ট মেথড নির্বাচন করুন
                  </h3>
                  <span className="text-[11px] font-mono text-stone-500 bg-stone-200 px-2 py-0.5 rounded">
                    Manual/Sandbox Trx Verification
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'bKash', name: 'বিকাশ (bKash)', color: 'border-pink-500 bg-pink-50 text-pink-700' },
                    { id: 'Nagad', name: 'নগদ (Nagad)', color: 'border-orange-500 bg-orange-50 text-orange-700' },
                    { id: 'Rocket', name: 'রকেট (Rocket)', color: 'border-purple-500 bg-purple-50 text-purple-700' },
                    { id: 'Card', name: 'কার্ড (Visa/Master)', color: 'border-blue-500 bg-blue-50 text-blue-700' },
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPaymentMethod(p.id as 'bKash' | 'Nagad' | 'Rocket' | 'Card')}
                      className={`p-3 rounded-xl border text-xs font-serif font-bold text-center transition-all ${
                        paymentMethod === p.id
                          ? `${p.color} ring-2 ring-stone-900/10 shadow-xs`
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                {/* Instructions per provider */}
                <div className="p-3 rounded-xl bg-white border border-[#DECDB7] text-xs font-serif space-y-1.5 text-stone-700">
                  <p>
                    <strong>{paymentMethod} মার্চেন্ট নম্বর:</strong>{' '}
                    <span className="font-mono font-bold text-stone-900">01700-000000 (Chithighor Postal Desk)</span>
                  </p>
                  <p className="text-[11px] text-stone-500">
                    ৳{selectedPackage.priceBdt} টাকা Send Money / Payment করে প্রাপ্ত Transaction ID (TrxID) নিচে প্রদান করুন:
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-serif font-bold text-stone-800">
                    ট্রানজেকশন আইডি (Transaction ID / TrxID)
                  </label>
                  <input
                    type="text"
                    value={txId}
                    onChange={e => setTxId(e.target.value)}
                    placeholder="যেমন: 9J382XLM"
                    className="w-full p-2.5 rounded-lg border border-[#D5C6B0] text-sm font-mono focus:outline-none focus:border-[#801D2E]"
                  />
                </div>

                {/* Demo verification bypass button */}
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-serif flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-amber-900">
                    <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>টেস্টিং বা ডেমো মোডে সরাসরি যাচাই করে অর্ডার জমা দিতে চান?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCreateOrder(true)}
                    className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-[11px] shrink-0"
                  >
                    ডেমো যাচাই করে অর্ডার দিন
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 rounded-xl border text-xs font-serif text-stone-600 hover:bg-stone-50"
                >
                  ← আগের ধাপ
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleCreateOrder(false)}
                  className="px-8 py-3.5 rounded-xl bg-[#801D2E] hover:bg-[#962337] text-white text-xs font-serif font-bold flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isSubmitting ? 'অর্ডার প্রসেস হচ্ছে...' : 'অর্ডার নিশ্চিত করুন (Place Order)'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
