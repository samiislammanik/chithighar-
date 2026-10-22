import React, { useState, useEffect } from 'react';
import {
  TemplatePurchase,
  AppSettings,
  PaymentMethod,
} from '../types';
import {
  DEFAULT_APP_SETTINGS,
  fetchAppSettings,
  submitTemplatePurchase,
  PaperDesignConfig,
  EnvelopeDesignConfig,
} from '../utils/stationery';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { toBengaliNumber } from '../utils/formatters';
import {
  X,
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  Copy,
  Check,
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface PremiumPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: PaperDesignConfig | EnvelopeDesignConfig | null;
  type: 'paper' | 'envelope';
  existingPurchase?: TemplatePurchase | null;
  onPurchaseSubmitted?: (purchase: TemplatePurchase) => void;
  onOpenAuthModal?: (mode?: 'signin' | 'signup') => void;
}

export const PremiumPaymentModal: React.FC<PremiumPaymentModalProps> = ({
  isOpen,
  onClose,
  template,
  type,
  existingPurchase,
  onPurchaseSubmitted,
  onOpenAuthModal,
}) => {
  const { user, profile } = useAuth();
  const { language, t } = useLanguage();

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bKash');
  const [senderPhone, setSenderPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successPurchase, setSuccessPurchase] = useState<TemplatePurchase | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Generate a distinct order reference ID
  const [referenceId] = useState(
    () => `CG-${type === 'paper' ? 'PAP' : 'ENV'}-${Math.floor(10000 + Math.random() * 90000)}`
  );

  useEffect(() => {
    if (isOpen) {
      fetchAppSettings().then(setSettings);
      setErrorMessage(null);
      setSuccessPurchase(null);
      if (existingPurchase) {
        setSenderPhone(existingPurchase.senderPhone);
        setTransactionId(existingPurchase.transactionId);
        setPaymentMethod(existingPurchase.paymentMethod);
      }
    }
  }, [isOpen, existingPurchase]);

  if (!isOpen || !template) return null;

  const currentPrice = template.priceBdt || settings.defaultPremiumPriceBdt || 20;
  const merchantNumber =
    paymentMethod === 'bKash' ? settings.bkashMerchantNumber : settings.nagadMerchantNumber;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (onOpenAuthModal) onOpenAuthModal('signin');
      return;
    }

    if (!senderPhone.trim()) {
      setErrorMessage(language === 'bn' ? 'অনুগ্রহ করে আপনার বিকাশ/নগদ নম্বরটি লিখুন।' : 'Please enter your payment phone number.');
      return;
    }

    if (!transactionId.trim() || transactionId.trim().length < 6) {
      setErrorMessage(
        language === 'bn'
          ? 'অনুগ্রহ করে সঠিক ট্রানজ্যাকশন আইডি (TrxID) লিখুন (কমপক্ষে ৬ অক্ষর)।'
          : 'Please enter a valid Transaction ID (at least 6 characters).'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await submitTemplatePurchase({
      userId: user.uid,
      userUsername: profile?.username || user.email?.split('@')[0] || 'reader',
      userDisplayName: profile?.displayName || user.displayName || 'সম্মানিত পাঠক',
      templateId: template.id,
      templateName: template.name,
      templateType: type,
      amountBdt: currentPrice,
      paymentMethod,
      senderPhone: senderPhone.trim(),
      transactionId: transactionId.trim().toUpperCase(),
    });

    setIsSubmitting(false);

    if (result.success && result.purchaseId) {
      const created: TemplatePurchase = {
        id: result.purchaseId,
        userId: user.uid,
        userUsername: profile?.username || 'reader',
        templateId: template.id,
        templateName: template.name,
        templateType: type,
        amountBdt: currentPrice,
        paymentMethod,
        senderPhone: senderPhone.trim(),
        transactionId: transactionId.trim().toUpperCase(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      setSuccessPurchase(created);
      if (onPurchaseSubmitted) onPurchaseSubmitted(created);
    } else {
      setErrorMessage(result.error || 'Failed to submit payment verification request.');
    }
  };

  const activePurchase = successPurchase || existingPurchase;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-xl bg-stone-50 rounded-3xl p-6 sm:p-8 border border-stone-300 shadow-2xl max-h-[92vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-amber-100 text-amber-800">
              <Lock className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-xl font-serif font-bold text-stone-900">
                প্রিমিয়াম স্টেশনারি আনলক (Unlock Stationery)
              </h3>
              <p className="text-xs font-serif text-stone-500">
                বিকাশ বা নগদ-এর মাধ্যমে ভেরিফাইড পেমেন্ট প্রক্রিয়া
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Template Card Summary */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono tracking-wider uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded-sm font-semibold">
              PREMIUM {type === 'paper' ? 'LETTER PAPER' : 'ENVELOPE'}
            </span>
            <h4 className="text-base font-serif font-bold text-stone-900">
              {template.nameBn} <span className="text-xs text-stone-500 font-normal">({template.name})</span>
            </h4>
            <p className="text-xs font-serif text-stone-600 line-clamp-1">
              {language === 'bn' ? template.descriptionBn : template.description}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] font-serif text-stone-500 block">নির্ধারিত মূল্য</span>
            <span className="text-xl font-mono font-bold text-[#801D2E]">
              ৳{toBengaliNumber(currentPrice)} BDT
            </span>
          </div>
        </div>

        {/* Auth prompt if not logged in */}
        {!user && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
            <p className="text-xs font-serif text-rose-900">
              প্রিমিয়াম ডিজাইন কেনা এবং আপনার অ্যাকাউন্টে স্থায়ীভাবে যুক্ত করতে প্রথমে সাইন ইন করুন।
            </p>
            <button
              type="button"
              onClick={() => {
                if (onOpenAuthModal) onOpenAuthModal('signin');
              }}
              className="px-5 py-2 rounded-xl bg-[#801D2E] text-white text-xs font-serif font-bold hover:bg-[#962337] transition-all"
            >
              লগইন / সাইন আপ করুন
            </button>
          </div>
        )}

        {/* If user already has an active or pending purchase */}
        {activePurchase && (
          <div
            className={`p-4 rounded-2xl border space-y-2 text-xs font-serif ${
              activePurchase.status === 'approved'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : activePurchase.status === 'rejected'
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {activePurchase.status === 'approved' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>পেমেন্ট অনুমোদিত হয়েছে (Unlocked)!</span>
                </>
              ) : activePurchase.status === 'rejected' ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>পেমেন্ট আবেদন বাতিল হয়েছে (Rejected)</span>
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 text-amber-600 animate-spin" />
                  <span>আবেদন পর্যালোচনায় রয়েছে (Pending Verification)</span>
                </>
              )}
            </div>

            <p className="leading-relaxed">
              {activePurchase.status === 'approved'
                ? 'অভিনন্দন! অ্যাডমিন কর্তৃক আপনার লেনদেন যাচাই সম্পন্ন হয়েছে। আপনি এখন এই ডিজাইনটি দিয়ে চিঠি লিখতে ও ডাউনলোড করতে পারেন।'
                : activePurchase.status === 'rejected'
                ? `বাতিলের কারণ: ${activePurchase.rejectionReason || 'প্রদত্ত TrxID পেমেন্ট রেকর্ডের সাথে মিলছে না।'}`
                : 'আপনার সাবমিট করা TrxID টি অ্যাডমিন ভেরিফিকেশনের অপেক্ষায় আছে। অ্যাডমিন কর্তৃক অনুমোদিত হলেই এটি স্বয়ংক্রিয়ভাবে আনলক হয়ে যাবে।'}
            </p>

            <div className="pt-1 text-[11px] font-mono opacity-80 flex flex-wrap gap-x-4 gap-y-1">
              <span>Order ID: {activePurchase.id}</span>
              <span>TrxID: {activePurchase.transactionId}</span>
              <span>মাধ্যম: {activePurchase.paymentMethod}</span>
              <span>মূল্য: ৳{toBengaliNumber(activePurchase.amountBdt)}</span>
            </div>

            {activePurchase.status === 'approved' && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-emerald-700 text-white font-serif font-bold hover:bg-emerald-800 transition-colors"
                >
                  ডিজাইনটি প্রয়োগ করুন (Use Design Now)
                </button>
              </div>
            )}
          </div>
        )}

        {/* If purchase is rejected or not yet submitted, show the payment form */}
        {(!activePurchase || activePurchase.status === 'rejected') && user && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-serif font-bold text-stone-700 block">
                পেমেন্ট মাধ্যম বেছে নিন (Select Payment Gateway):
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bKash')}
                  className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2.5 transition-all ${
                    paymentMethod === 'bKash'
                      ? 'border-[#E2136E] bg-pink-50 text-[#E2136E] font-bold shadow-2xs'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-[#E2136E]" />
                  <span className="text-sm font-bold">bKash (বিকাশ)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Nagad')}
                  className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2.5 transition-all ${
                    paymentMethod === 'Nagad'
                      ? 'border-[#F7941D] bg-amber-50 text-[#F7941D] font-bold shadow-2xs'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-[#F7941D]" />
                  <span className="text-sm font-bold">Nagad (নগদ)</span>
                </button>
              </div>
            </div>

            {/* Merchant Details Box */}
            <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 space-y-3 text-xs font-serif">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-mono text-[11px] uppercase">
                  {paymentMethod} MERCHANT / PAYMENT NUMBER:
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(merchantNumber, 'number')}
                  className="flex items-center gap-1 text-[11px] text-[#801D2E] hover:underline font-mono"
                >
                  {copiedField === 'number' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'number' ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-stone-300 font-mono text-base font-bold text-stone-900 tracking-wider flex items-center justify-between">
                <span>{merchantNumber}</span>
                <span className="text-xs font-serif text-stone-500 font-normal">Send Money / Payment</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-stone-500 font-mono text-[11px] uppercase">
                  PAYMENT REFERENCE (রেফারেন্স):
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(referenceId, 'ref')}
                  className="flex items-center gap-1 text-[11px] text-[#801D2E] hover:underline font-mono"
                >
                  {copiedField === 'ref' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'ref' ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                </button>
              </div>

              <div className="p-2 rounded-lg bg-stone-50 border font-mono text-xs font-bold text-stone-800">
                {referenceId}
              </div>

              {/* Step instructions */}
              <div className="pt-1 text-stone-700 space-y-1 text-[11px] leading-relaxed">
                <p className="font-semibold text-stone-800">পেমেন্ট ধাপসমূহ:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-stone-600">
                  <li>আপনার {paymentMethod} অ্যাপ ওপেন করে উপরের নম্বরে ৳{toBengaliNumber(currentPrice)} টাকা পাঠান।</li>
                  <li>রেফারেন্স ফিল্ডে <span className="font-mono font-bold text-stone-800">{referenceId}</span> লিখুন।</li>
                  <li>পেমেন্ট শেষে SMS বা অ্যাপে পাওয়া Transaction ID নিচে লিখুন।</li>
                </ol>
              </div>
            </div>

            {/* Input Form: Phone & TrxID */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-serif font-bold text-stone-800 block mb-1">
                  যে নম্বর থেকে টাকা পাঠিয়েছেন ({paymentMethod} Sender Number):
                </label>
                <input
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-[#801D2E]"
                />
              </div>

              <div>
                <label className="text-xs font-serif font-bold text-stone-800 block mb-1">
                  ট্রানজ্যাকশন আইডি (Transaction ID / TrxID):
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. BKE928XKP7"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 font-mono text-sm uppercase focus:outline-hidden focus:ring-2 focus:ring-[#801D2E]"
                />
              </div>
            </div>

            {/* Error message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-serif flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Manual Verification Disclaimer */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] font-serif text-amber-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p>
                <strong>নিরাপত্তা ও যাচাইকরণ নীতি:</strong> এটি একটি ম্যানুয়াল পেমেন্ট ভেরিফিকেশন প্রক্রিয়া। TrxID জমা দেওয়ার পর ডাক প্রশাসক লেনদেনটি সংশ্লিষ্ট {paymentMethod} একাউন্টের সাথে মিলিয়ে দেখে অনুমোদন প্রদান করবেন।
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-stone-600 font-serif text-xs hover:bg-stone-200 transition-colors"
              >
                বাতিল করুন
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#801D2E] text-white font-serif text-xs font-bold hover:bg-[#962337] transition-all disabled:opacity-50 flex items-center gap-2 shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>যাচাইয়ের জন্য পাঠানো হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <span>পেমেন্ট ভেরিফিকেশন জমা দিন</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Customer Support Footer */}
        <div className="border-t border-stone-200 pt-3 text-center text-[11px] font-serif text-stone-500">
          কোনো সমস্যা বা সহায়তার জন্য: {settings.supportContact}
        </div>
      </div>
    </div>
  );
};
