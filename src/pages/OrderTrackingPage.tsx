import React, { useState } from 'react';
import { PhysicalOrder, OrderStatus } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { toBengaliNumber } from '../utils/formatters';
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

interface OrderTrackingPageProps {
  orders: PhysicalOrder[];
  initialTrackingNo?: string;
  onGoToOrder?: (orderId: string) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  orders,
  initialTrackingNo = '',
}) => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState(initialTrackingNo);
  const [searchedOrder, setSearchedOrder] = useState<PhysicalOrder | null>(() => {
    if (initialTrackingNo) {
      return orders.find(o => o.trackingNumber.toLowerCase() === initialTrackingNo.toLowerCase()) || null;
    }
    return orders[0] || null;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const found = orders.find(
      o => o.trackingNumber.toLowerCase() === searchQuery.trim().toLowerCase()
    );
    setSearchedOrder(found || null);
  };

  const statusSteps: { status: OrderStatus; labelBn: string; labelEn: string; desc: string }[] = [
    { status: 'pending', labelBn: 'অর্ডার জমা হয়েছে', labelEn: 'Order Placed', desc: 'অর্ডার রেকর্ড তৈরি হয়েছে, পেমেন্ট ও তথ্য নিরীক্ষা চলছে।' },
    { status: 'confirmed', labelBn: 'অর্ডার নিশ্চিত', labelEn: 'Confirmed', desc: 'চিঠিঘর ডাক বিভাগে অর্ডারটি অনুমোদিত হয়েছে।' },
    { status: 'processing', labelBn: 'চিঠি প্রস্তুত হচ্ছে', labelEn: 'Processing', desc: 'লিনেন কাগজে মুদ্রণ, খাঁটি মোমের সিলমোহর ও সুবাসিত গোলাপের পাপড়ি সংযোজন সম্পন্ন হচ্ছে।' },
    { status: 'dispatched', labelBn: 'কুরিয়ারে প্রেরিত', labelEn: 'Dispatched', desc: 'নিবন্ধিত ডাক বিভাগ বা কুরিয়ার প্রতিনিধির নিকট হস্তান্তর করা হয়েছে।' },
    { status: 'delivered', labelBn: 'সফলভাবে পৌঁছেছে', labelEn: 'Delivered', desc: 'চিঠিটি প্রাপকের হাতে পরম যত্নে পৌঁছে দেওয়া হয়েছে।' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'cancelled') return -1;
    return statusSteps.findIndex(s => s.status === status);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 select-none">
      {/* Page Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#801D2E]/10 text-[#801D2E] text-xs font-serif font-bold">
          <Truck className="w-4 h-4" />
          <span>চিঠিঘর ডাক ট্র্যাকিং সার্ভিস</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900">
          {t.trackOrder} (Postal Order Tracking)
        </h1>
        <p className="text-xs font-serif text-stone-600">
          আপনার অর্ডারের ৬-সংখ্যার ট্র্যাকিং নম্বর (যেমন: CG-849102BD) দিয়ে চিঠির বর্তমান অবস্থা জানুন।
        </p>
      </div>

      {/* Tracking Search Input */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ট্র্যাকিং নম্বর লিখুন (e.g. CG-123456BD)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D5C6B0] bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#801D2E]/30 focus:border-[#801D2E]"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-[#801D2E] hover:bg-[#962337] text-white text-xs font-serif font-bold transition-colors shadow-sm"
        >
          ট্র্যাক করুন
        </button>
      </form>

      {/* Result Section */}
      {searchedOrder ? (
        <div className="rounded-2xl bg-white border border-[#E4DAC8] p-6 sm:p-8 shadow-sm space-y-8 animate-in fade-in">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#801D2E] bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
                {searchedOrder.trackingNumber}
              </span>
              <h2 className="text-xl font-serif font-bold text-stone-900 mt-2">
                চিঠি: {searchedOrder.letterTitle}
              </h2>
              <p className="text-xs font-serif text-stone-500 mt-0.5">
                অর্ডার জমা: {new Date(searchedOrder.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs font-serif text-stone-500">বর্তমান অবস্থা:</span>
              <div className="text-base font-serif font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 inline-block mt-0.5">
                {t.orderStatus[searchedOrder.status] || searchedOrder.status}
              </div>
            </div>
          </div>

          {/* Timeline Visualizer */}
          <div className="space-y-6">
            <h3 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wider">
              ডাক চলাচল অগ্রগতি (Delivery Progression)
            </h3>

            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
              {statusSteps.map((step, idx) => {
                const currentIdx = getStepIndex(searchedOrder.status);
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={step.status} className="relative flex items-start gap-4">
                    {/* Step circle indicator */}
                    <div
                      className={`absolute -left-6 sm:-left-8 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-colors ${
                        isCurrent
                          ? 'bg-[#801D2E] text-white ring-4 ring-[#801D2E]/20'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-200 text-stone-500'
                      }`}
                    >
                      {isPassed && !isCurrent ? '✓' : idx + 1}
                    </div>

                    <div className="space-y-1">
                      <h4
                        className={`text-sm font-serif font-bold ${
                          isCurrent
                            ? 'text-[#801D2E]'
                            : isPassed
                            ? 'text-stone-900'
                            : 'text-stone-400'
                        }`}
                      >
                        {language === 'bn' ? step.labelBn : step.labelEn}
                      </h4>
                      <p className="text-xs font-serif text-stone-600 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Secure Recipient Summary (PII is protected) */}
          <div className="rounded-xl bg-[#FAF5EB] p-4 border border-[#E6DBC9] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-serif">
            <div>
              <span className="text-stone-500">প্রাপক:</span>
              <p className="font-bold text-stone-900">{searchedOrder.recipientName}</p>
            </div>
            <div>
              <span className="text-stone-500">গন্তব্য জেলা:</span>
              <p className="font-bold text-stone-900">{searchedOrder.district}</p>
            </div>
            <div>
              <span className="text-stone-500">পেমেন্ট স্ট্যাটাস:</span>
              <p className="font-bold text-emerald-800">
                {searchedOrder.paymentStatus === 'mock_verified' || searchedOrder.paymentStatus === 'paid'
                  ? 'পরিশোধিত (Verified)'
                  : 'অপেক্ষমাণ (Pending)'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-xl bg-white border border-[#E4DAC8] space-y-3">
          <div className="text-3xl">🔍</div>
          <h3 className="text-lg font-serif font-bold text-stone-800">
            কোনো অর্ডার খুঁজে পাওয়া যায়নি
          </h3>
          <p className="text-xs font-serif text-stone-500">
            অনুগ্রহ করে সঠিক ট্র্যাকিং নম্বরটি প্রবেশ করান, অথবা আপনার ড্যাশবোর্ডে সংরক্ষিত অর্ডার তালিকা দেখুন।
          </p>
        </div>
      )}
    </div>
  );
};
