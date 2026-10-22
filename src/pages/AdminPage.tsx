import React, { useState, useEffect } from 'react';
import {
  Letter,
  PhysicalOrder,
  ContentReport,
  OrderStatus,
  DeliveryPackage,
  StationeryTemplate,
  TemplatePurchase,
  AppSettings,
} from '../types';
import { DEFAULT_DELIVERY_PACKAGES } from '../utils/sampleData';
import {
  fetchStationeryTemplates,
  saveStationeryTemplate,
  syncDefaultStationeryToFirestore,
  generateDefaultStationeryTemplates,
  fetchTemplatePurchases,
  approveTemplatePurchase,
  rejectTemplatePurchase,
  fetchAppSettings,
  saveAppSettings,
  DEFAULT_APP_SETTINGS,
} from '../utils/stationery';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { toBengaliNumber } from '../utils/formatters';
import { db } from '../firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import {
  ShieldAlert,
  Package,
  Flag,
  FileText,
  DollarSign,
  CheckCircle,
  XCircle,
  Truck,
  Edit,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Layers,
  Sparkles,
  Save,
  CreditCard,
  Clock,
  Settings,
  Copy,
  Check,
  Lock,
} from 'lucide-react';

interface AdminPageProps {
  letters: Letter[];
  physicalOrders: PhysicalOrder[];
  reports: ContentReport[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, trackingNotes?: string) => void;
  onModerateLetter: (letterId: string, isModerated: boolean) => void;
  onDeleteLetter: (letterId: string) => void;
  onResolveReport: (reportId: string, action: 'resolved' | 'dismissed') => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  letters,
  physicalOrders,
  reports,
  onUpdateOrderStatus,
  onModerateLetter,
  onDeleteLetter,
  onResolveReport,
}) => {
  const { isAdmin, user, profile } = useAuth();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<
    'orders' | 'purchases' | 'stationery' | 'settings' | 'reports' | 'letters' | 'packages'
  >('orders');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('confirmed');
  const [trackingNotes, setTrackingNotes] = useState('');

  // Stationery Management State
  const [stationeryList, setStationeryList] = useState<StationeryTemplate[]>(() =>
    generateDefaultStationeryTemplates()
  );
  const [stationeryTypeFilter, setStationeryTypeFilter] = useState<'all' | 'envelope' | 'paper'>('all');
  const [editingTemplate, setEditingTemplate] = useState<StationeryTemplate | null>(null);
  const [isSyncingStationery, setIsSyncingStationery] = useState(false);
  const [stationeryNotice, setStationeryNotice] = useState<string | null>(null);

  // Purchases & Payment Management State
  const [purchases, setPurchases] = useState<TemplatePurchase[]>([]);
  const [purchaseFilter, setPurchaseFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [rejectingPurchaseId, setRejectingPurchaseId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Settings State
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsNotice, setSettingsNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchStationeryTemplates().then((list) => {
      if (list && list.length > 0) {
        setStationeryList(list);
      }
    });

    fetchTemplatePurchases().then(setPurchases);
    fetchAppSettings().then(setSettings);
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Access guard
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-2xl bg-white border border-rose-200 text-center space-y-4 shadow-sm select-none">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-3xl">
          🔒
        </div>
        <h2 className="text-xl font-serif font-bold text-stone-900">
          প্রবেশাধিকার সংরক্ষিত (Restricted Desk)
        </h2>
        <p className="text-xs font-serif text-stone-600">
          চিঠিঘরের এই অংশটি শুধুমাত্র অনুমোদিত ডাক কর্মকর্তাদের জন্য সংরক্ষিত।
        </p>
      </div>
    );
  }

  // Calculate Metrics
  const totalLetters = letters.length;
  const publicLetters = letters.filter((l) => l.visibility === 'public' && !l.isDraft).length;
  const pendingReports = reports.filter((r) => r.status === 'pending');
  const totalRevenue = physicalOrders.reduce((sum, o) => sum + (o.priceBdt || 0), 0);
  const pendingPurchases = purchases.filter((p) => p.status === 'pending');
  const approvedPurchases = purchases.filter((p) => p.status === 'approved');
  const stationeryRevenue = approvedPurchases.reduce((sum, p) => sum + (p.amountBdt || 0), 0);

  const filteredOrders = physicalOrders.filter((o) => {
    if (selectedStatusFilter === 'all') return true;
    return o.status === selectedStatusFilter;
  });

  const filteredPurchases = purchases.filter((p) => {
    if (purchaseFilter === 'all') return true;
    return p.status === purchaseFilter;
  });

  const handleSaveOrderStatus = (orderId: string) => {
    onUpdateOrderStatus(orderId, newStatus, trackingNotes);
    setEditingOrderId(null);
  };

  const handleApprovePurchase = async (purchase: TemplatePurchase) => {
    setIsProcessingAction(true);
    const adminIdentifier = user?.email || 'admin@chithighor.com';
    const result = await approveTemplatePurchase(purchase, adminIdentifier);
    setIsProcessingAction(false);
    if (result.success) {
      setPurchases((prev) =>
        prev.map((p) =>
          p.id === purchase.id
            ? { ...p, status: 'approved', approvedBy: adminIdentifier, approvedAt: new Date().toISOString() }
            : p
        )
      );
      setStationeryNotice(`অর্ডার ${purchase.id} অনুমোদিত হয়েছে এবং ডিজাইন আনলক করা হয়েছে! ✓`);
      setTimeout(() => setStationeryNotice(null), 3500);
    } else {
      alert(`অনুমোদন ব্যর্থ হয়েছে: ${result.error}`);
    }
  };

  const handleRejectPurchase = async () => {
    if (!rejectingPurchaseId) return;
    setIsProcessingAction(true);
    const adminIdentifier = user?.email || 'admin@chithighor.com';
    const result = await rejectTemplatePurchase(
      rejectingPurchaseId,
      rejectionReasonInput.trim(),
      adminIdentifier
    );
    setIsProcessingAction(false);
    if (result.success) {
      setPurchases((prev) =>
        prev.map((p) =>
          p.id === rejectingPurchaseId
            ? {
                ...p,
                status: 'rejected',
                rejectionReason: rejectionReasonInput.trim() || 'Payment could not be verified.',
                approvedBy: adminIdentifier,
              }
            : p
        )
      );
      setRejectingPurchaseId(null);
      setRejectionReasonInput('');
      setStationeryNotice('পেমেন্ট আবেদন বাতিল করা হয়েছে।');
      setTimeout(() => setStationeryNotice(null), 3000);
    } else {
      alert(`বাতিলকরণ ব্যর্থ হয়েছে: ${result.error}`);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    await saveAppSettings(settings, user?.email || 'admin');
    setIsSavingSettings(false);
    setSettingsNotice('পেমেন্ট ও প্রশাসনিক সেটিংস সফলভাবে সংরক্ষিত হয়েছে! ✓');
    setTimeout(() => setSettingsNotice(null), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E8DFD0] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-100 text-red-800">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900">
              চিঠিঘর প্রশাসন ও ডাক নিয়ন্ত্রণ কক্ষ
            </h1>
          </div>
          <p className="text-xs font-serif text-stone-600 mt-1">
            মডারেশন, বিকাশ/নগদ পেমেন্ট ভেরিফিকেশন, স্টেশনারি মূল্য ও ডেলিভারি নিয়ন্ত্রণ
          </p>
        </div>

        <div className="text-xs font-mono text-stone-500 bg-stone-100 px-3 py-1.5 rounded-lg border">
          Admin: {user?.email || profile?.displayName}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-[#E4DAC8] shadow-2xs space-y-1">
          <span className="text-xs font-serif text-stone-500">মোট চিঠি (Total Letters)</span>
          <p className="text-2xl font-serif font-bold text-stone-900">{toBengaliNumber(totalLetters)}</p>
          <span className="text-[11px] font-mono text-emerald-700">সার্বজনীন: {toBengaliNumber(publicLetters)}</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#E4DAC8] shadow-2xs space-y-1">
          <span className="text-xs font-serif text-stone-500">পেমেন্ট রিকোয়েস্ট (Purchases)</span>
          <p className="text-2xl font-serif font-bold text-stone-900">{toBengaliNumber(purchases.length)}</p>
          <span className="text-[11px] font-mono text-amber-700">
            অপেক্ষমাণ: {toBengaliNumber(pendingPurchases.length)} টি
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#E4DAC8] shadow-2xs space-y-1">
          <span className="text-xs font-serif text-stone-500">স্টেশনারি আয় (Design Revenue)</span>
          <p className="text-2xl font-mono font-bold text-emerald-800">
            ৳{toBengaliNumber(stationeryRevenue)} BDT
          </p>
          <span className="text-[11px] font-serif text-stone-400">বিকাশ ও নগদ ভেরিফাইড</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#E4DAC8] shadow-2xs space-y-1">
          <span className="text-xs font-serif text-stone-500">বিচারাধীন অভিযোগ (Reports)</span>
          <p className="text-2xl font-serif font-bold text-rose-700">
            {toBengaliNumber(pendingReports.length)}
          </p>
          <span className="text-[11px] font-serif text-stone-500">মডারেশন প্রয়োজন</span>
        </div>
      </div>

      {/* Global Notice Bar if any */}
      {stationeryNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-serif flex items-center justify-between">
          <span>{stationeryNotice}</span>
          <button onClick={() => setStationeryNotice(null)} className="text-emerald-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8DFD0] overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('purchases')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-serif font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'purchases'
              ? 'border-b-2 border-red-700 text-red-800 bg-white'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>পেমেন্ট ও আনলক রিকোয়েস্ট ({toBengaliNumber(pendingPurchases.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('stationery')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-serif font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'stationery'
              ? 'border-b-2 border-red-700 text-red-800 bg-white'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>স্টেশনারি ও টেমপ্লেট মূল্য ({toBengaliNumber(stationeryList.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-serif font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-b-2 border-red-700 text-red-800 bg-white'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>পেমেন্ট ও সাধারণ সেটিংস</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-serif font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-b-2 border-red-700 text-red-800 bg-white'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>কাগজের চিঠির অর্ডার ({toBengaliNumber(physicalOrders.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-serif font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'reports'
              ? 'border-b-2 border-red-700 text-red-800 bg-white'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>অভিযোগ ডেস্ক ({toBengaliNumber(pendingReports.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('letters')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-serif font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'letters'
              ? 'border-b-2 border-red-700 text-red-800 bg-white'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>চিঠিপত্র সংযম</span>
        </button>

        <button
          onClick={() => setActiveTab('packages')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-serif font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'packages'
              ? 'border-b-2 border-red-700 text-red-800 bg-white'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>ডেলিভারি প্যাকেজ</span>
        </button>
      </div>

      {/* TAB 1: Payment Verification & Unlocks Management */}
      {activeTab === 'purchases' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-stone-200">
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                বিকাশ ও নগদ পেমেন্ট যাচাইকরণ ও ডিজাইন আনলক
              </h3>
              <p className="text-xs font-serif text-stone-500">
                ব্যবহারকারীর প্রেরিত Transaction ID (TrxID) মার্চেন্ট অ্যাকাউন্টে নিশ্চিত করে অনুমোদন প্রদান করুন
              </p>
            </div>

            {/* Status filters */}
            <div className="flex items-center gap-1.5 text-xs font-serif bg-stone-100 p-1 rounded-lg border">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setPurchaseFilter(filter)}
                  className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    purchaseFilter === filter
                      ? 'bg-stone-900 text-white font-bold'
                      : 'text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {filter === 'all'
                    ? 'সবগুলো'
                    : filter === 'pending'
                    ? `অপেক্ষমাণ (${pendingPurchases.length})`
                    : filter === 'approved'
                    ? 'অনুমোদিত'
                    : 'বাতিল'}
                </button>
              ))}
            </div>
          </div>

          {filteredPurchases.length === 0 ? (
            <div className="p-12 text-center text-xs font-serif text-stone-500 bg-white rounded-2xl border">
              কোনো পেমেন্ট আবেদন পাওয়া যায়নি।
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredPurchases.map((pur) => (
                <div
                  key={pur.id}
                  className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-serif"
                >
                  <div className="space-y-2 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2.5 py-0.5 rounded-md">
                        Order ID: {pur.id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
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
                          : 'যাচাই প্রয়োজন ⏳'}
                      </span>
                      <span className="text-stone-400 font-mono">•</span>
                      <span className="font-mono text-stone-500">
                        {new Date(pur.createdAt).toLocaleString('bn-BD')}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-stone-900">
                        {pur.templateName} ({pur.templateType === 'paper' ? 'চিঠির কাগজ' : 'খাম'})
                      </h4>
                      <p className="text-stone-600 text-[11px] mt-0.5">
                        ক্রেতা: <strong>{pur.userDisplayName}</strong> (@{pur.userUsername}) • ইউজার ID:{' '}
                        <span className="font-mono">{pur.userId.slice(0, 8)}...</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <div>
                        <span className="text-stone-500">মাধ্যম:</span>{' '}
                        <strong className="text-stone-800">{pur.paymentMethod}</strong>
                      </div>
                      <div>
                        <span className="text-stone-500">প্রেরক ফোন:</span>{' '}
                        <strong className="text-stone-800">{pur.senderPhone}</strong>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-stone-500">TrxID:</span>{' '}
                        <strong className="text-red-800 font-black tracking-wider">
                          {pur.transactionId}
                        </strong>
                        <button
                          type="button"
                          onClick={() => handleCopy(pur.transactionId, pur.id)}
                          className="text-stone-400 hover:text-stone-800"
                          title="Copy TrxID"
                        >
                          {copiedId === pur.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <div>
                        <span className="text-stone-500">মূল্য:</span>{' '}
                        <strong className="text-emerald-700">৳{toBengaliNumber(pur.amountBdt)} BDT</strong>
                      </div>
                    </div>

                    {pur.status === 'approved' && pur.approvedBy && (
                      <p className="text-[11px] text-emerald-800 font-mono">
                        অনুমোদনকারী: {pur.approvedBy} ({new Date(pur.approvedAt || '').toLocaleDateString('bn-BD')})
                      </p>
                    )}

                    {pur.status === 'rejected' && (
                      <p className="text-[11px] text-rose-800 bg-rose-50 p-2 rounded-lg border border-rose-100 font-serif">
                        বাতিলের কারণ: {pur.rejectionReason}
                      </p>
                    )}
                  </div>

                  {/* Actions for pending requests */}
                  <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full md:w-auto">
                    {pur.status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          disabled={isProcessingAction}
                          onClick={() => handleApprovePurchase(pur)}
                          className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-serif font-bold text-xs hover:bg-emerald-800 transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>অনুমোদন ও আনলক করুন</span>
                        </button>

                        <button
                          type="button"
                          disabled={isProcessingAction}
                          onClick={() => {
                            setRejectingPurchaseId(pur.id);
                            setRejectionReasonInput('');
                          }}
                          className="px-4 py-2 rounded-xl bg-rose-100 text-rose-800 font-serif font-bold text-xs hover:bg-rose-200 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>বাতিল করুন</span>
                        </button>
                      </>
                    ) : (
                      <div className="text-right text-[11px] font-mono text-stone-400">
                        {pur.status === 'approved' ? 'অ্যাক্সেস সক্রিয়' : 'নিষ্পন্ন'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rejection Reason Modal */}
          {rejectingPurchaseId && (
            <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white rounded-2xl p-6 border shadow-2xl space-y-4">
                <h4 className="text-base font-serif font-bold text-stone-900">
                  পেমেন্ট আবেদন বাতিলের কারণ লিখুন
                </h4>
                <p className="text-xs font-serif text-stone-600">
                  ক্রেতা তার প্যানেলে এই কারণটি দেখতে পারবেন এবং প্রয়োজনে সঠিক TrxID দিয়ে আবেদন করতে পারবেন।
                </p>

                <textarea
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="যেমন: প্রদত্ত TrxID বিকাশ স্টেটমেন্টে খুঁজে পাওয়া যায়নি অথবা টাকার পরিমাণ অমিল।"
                  rows={3}
                  className="w-full p-3 border rounded-xl text-xs font-serif focus:ring-1 focus:ring-rose-500"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectingPurchaseId(null)}
                    className="px-4 py-2 rounded-lg border text-xs font-serif text-stone-700"
                  >
                    ফিরে যান
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingAction}
                    onClick={handleRejectPurchase}
                    className="px-5 py-2 rounded-lg bg-rose-700 text-white text-xs font-serif font-bold hover:bg-rose-800"
                  >
                    বাতিলকরণ নিশ্চিত করুন
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Stationery Templates Management & Central Pricing */}
      {activeTab === 'stationery' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-stone-200">
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                কেন্দ্রীয় স্টেশনারি ও টেমপ্লেট ব্যবস্থাপনা (Templates & Pricing)
              </h3>
              <p className="text-xs font-serif text-stone-500">
                ১৫টি ভিন্টেজ চিঠির পাতা ও ১০টি রাজকীয় খামের মূল্য ও তথ্য সরাসরি ডাটাবেজে হালনাগাদ করুন
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isSyncingStationery}
                onClick={async () => {
                  setIsSyncingStationery(true);
                  try {
                    const count = await syncDefaultStationeryToFirestore();
                    setStationeryNotice(`মোট ${count}টি স্টেশনারি টেমপ্লেট সফলভাবে ফায়ারবেসে সংরক্ষিত হয়েছে! ✓`);
                    const fresh = await fetchStationeryTemplates();
                    setStationeryList(fresh);
                  } catch (err) {
                    console.error('Stationery sync err:', err);
                    setStationeryNotice('ডাটাবেজ সিঙ্কে সমস্যা হয়েছে।');
                  } finally {
                    setIsSyncingStationery(false);
                    setTimeout(() => setStationeryNotice(null), 4000);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-serif font-bold hover:bg-black transition-all flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingStationery ? 'animate-spin' : ''}`} />
                <span>ডিফল্ট টেমপ্লেট ফায়ারবেসে সিঙ্ক করুন</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 text-xs font-serif">
            <span className="text-stone-500">ধরন:</span>
            {(['all', 'paper', 'envelope'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStationeryTypeFilter(filter)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  stationeryTypeFilter === filter
                    ? 'bg-stone-900 text-white font-bold'
                    : 'bg-white border text-stone-700 hover:bg-stone-50'
                }`}
              >
                {filter === 'all'
                  ? 'সব স্টেশনারি'
                  : filter === 'paper'
                  ? 'চিঠির কাগজ (১৫টি)'
                  : 'খাম (১০টি)'}
              </button>
            ))}
          </div>

          {/* Stationery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stationeryList
              .filter((item) => {
                if (stationeryTypeFilter === 'all') return true;
                return item.type === stationeryTypeFilter;
              })
              .map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm bg-stone-100 text-stone-700">
                        {item.type === 'paper' ? 'LETTER PAPER' : 'ENVELOPE'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {item.isFree ? (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            বিনামূল্যে (৳০)
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> ৳{toBengaliNumber(item.priceBdt)} BDT
                          </span>
                        )}
                        {!item.isActive && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                            নিষ্ক্রিয়
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-base font-serif font-bold text-stone-900">{item.nameBn}</h4>
                      <span className="text-xs font-mono text-stone-500 block">{item.name}</span>
                    </div>

                    <p className="text-xs font-serif text-stone-600 line-clamp-2 leading-relaxed">
                      {item.descriptionBn || item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-stone-400">ID: {item.templateId}</span>

                    <button
                      type="button"
                      onClick={() => setEditingTemplate(item)}
                      className="px-3.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-serif font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>মূল্য ও তথ্য সম্পাদনা</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Modal / Editor for Stationery Template */}
          {editingTemplate && (
            <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-stone-300 shadow-2xl space-y-5 animate-in fade-in max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="text-base font-serif font-bold text-stone-900">
                    টেমপ্লেট মূল্য ও তথ্য সম্পাদনা
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingTemplate(null)}
                    className="p-1 rounded-full text-stone-500 hover:bg-stone-100"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs font-serif">
                  <div>
                    <label className="text-stone-500 font-mono block">টেমপ্লেট নাম (বাংলা)</label>
                    <input
                      type="text"
                      value={editingTemplate.nameBn}
                      onChange={(e) =>
                        setEditingTemplate({ ...editingTemplate, nameBn: e.target.value })
                      }
                      className="w-full mt-1 p-2 border rounded-lg text-stone-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-stone-500 font-mono block">ইংরেজি নাম</label>
                    <input
                      type="text"
                      value={editingTemplate.name}
                      onChange={(e) =>
                        setEditingTemplate({ ...editingTemplate, name: e.target.value })
                      }
                      className="w-full mt-1 p-2 border rounded-lg text-stone-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-stone-500 font-mono block">বিবরণ (বাংলা)</label>
                    <textarea
                      value={editingTemplate.descriptionBn || ''}
                      onChange={(e) =>
                        setEditingTemplate({ ...editingTemplate, descriptionBn: e.target.value })
                      }
                      rows={2}
                      className="w-full mt-1 p-2 border rounded-lg text-stone-900"
                    />
                  </div>

                  {/* Free vs Paid Toggle */}
                  <div className="p-3 rounded-xl bg-stone-50 border flex items-center justify-between">
                    <div>
                      <span className="font-bold text-stone-800 block">বিনামূল্যে অ্যাক্সেস (Free Template)</span>
                      <span className="text-[11px] text-stone-500">
                        অন থাকলে ব্যবহারকারীরা কোনো ফি ছাড়াই ব্যবহার করতে পারবেন
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={editingTemplate.isFree}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            isFree: e.target.checked,
                            priceBdt: e.target.checked ? 0 : editingTemplate.priceBdt || 20,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
                    </label>
                  </div>

                  {/* Price in BDT */}
                  {!editingTemplate.isFree && (
                    <div>
                      <label className="text-stone-700 font-bold block">মূল্য (Price in BDT ৳)</label>
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={editingTemplate.priceBdt}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            priceBdt: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full mt-1 p-2 border rounded-lg text-stone-900 font-mono text-sm font-bold"
                      />
                    </div>
                  )}

                  {/* Badge */}
                  <div>
                    <label className="text-stone-700 font-bold block">ব্যাজ (Badge)</label>
                    <select
                      value={editingTemplate.badge || 'none'}
                      onChange={(e) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          badge: e.target.value as any,
                        })
                      }
                      className="w-full mt-1 p-2 border rounded-lg text-stone-900"
                    >
                      <option value="none">সাধারণ (None)</option>
                      <option value="featured">সেরা (Featured)</option>
                      <option value="popular">জনপ্রিয় (Popular)</option>
                      <option value="new">নতুন (New)</option>
                    </select>
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-stone-700 font-bold">সক্রিয় স্ট্যাটাস (Active in App)</span>
                    <input
                      type="checkbox"
                      checked={editingTemplate.isActive}
                      onChange={(e) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          isActive: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-[#801D2E] rounded"
                    />
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end gap-2 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingTemplate(null)}
                    className="px-4 py-2 rounded-lg border text-stone-700 hover:bg-stone-50 text-xs font-serif font-semibold"
                  >
                    বাতিল
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!editingTemplate) return;
                      try {
                        await saveStationeryTemplate(editingTemplate);
                        setStationeryList((prev) =>
                          prev.map((t) => (t.id === editingTemplate.id ? editingTemplate : t))
                        );
                        setEditingTemplate(null);
                        setStationeryNotice(`'${editingTemplate.nameBn}' সফলভাবে ফায়ারবেসে সংরক্ষিত হয়েছে! ✓`);
                        setTimeout(() => setStationeryNotice(null), 3500);
                      } catch (err) {
                        console.error('Save template error:', err);
                        setStationeryNotice('সংরক্ষণে সমস্যা হয়েছে।');
                      }
                    }}
                    className="px-5 py-2 rounded-lg bg-[#801D2E] text-white hover:bg-[#962337] text-xs font-serif font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>সংরক্ষণ করুন</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Payment & General System Settings */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                বিকাশ ও নগদ মার্চেন্ট অ্যাকাউন্ট ও সাধারণ কনফিগারেশন
              </h3>
              <p className="text-xs font-serif text-stone-500">
                ব্যবহারকারীদের পেমেন্ট করার সময় এই নম্বর ও নির্দেশনাসমূহ প্রদর্শিত হবে
              </p>
            </div>

            {settingsNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-serif flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{settingsNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-serif">
              <div>
                <label className="text-stone-700 font-bold block mb-1">
                  বিকাশ মার্চেন্ট / পার্সোনাল নম্বর (bKash Number)
                </label>
                <input
                  type="text"
                  value={settings.bkashMerchantNumber}
                  onChange={(e) => setSettings({ ...settings, bkashMerchantNumber: e.target.value })}
                  required
                  className="w-full p-2.5 border rounded-xl font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-stone-700 font-bold block mb-1">
                  নগদ মার্চেন্ট / পার্সোনাল নম্বর (Nagad Number)
                </label>
                <input
                  type="text"
                  value={settings.nagadMerchantNumber}
                  onChange={(e) => setSettings({ ...settings, nagadMerchantNumber: e.target.value })}
                  required
                  className="w-full p-2.5 border rounded-xl font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-stone-700 font-bold block mb-1">
                  ডিফল্ট প্রিমিয়াম ডিজাইন মূল্য (Default BDT)
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={settings.defaultPremiumPriceBdt}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultPremiumPriceBdt: Number(e.target.value) || 20 })
                  }
                  required
                  className="w-full p-2.5 border rounded-xl font-mono text-sm font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="text-stone-700 font-bold block mb-1">
                  গ্রাহক সহায়তা ও হেল্পলাইন (Support Contact)
                </label>
                <input
                  type="text"
                  value={settings.supportContact}
                  onChange={(e) => setSettings({ ...settings, supportContact: e.target.value })}
                  required
                  className="w-full p-2.5 border rounded-xl font-mono text-sm"
                />
              </div>
            </div>

            <div className="text-xs font-serif space-y-4">
              <div>
                <label className="text-stone-700 font-bold block mb-1">
                  পেমেন্ট নির্দেশনা (বাংলা - Payment Instructions)
                </label>
                <textarea
                  value={settings.paymentInstructionsBn}
                  onChange={(e) => setSettings({ ...settings, paymentInstructionsBn: e.target.value })}
                  rows={3}
                  className="w-full p-3 border rounded-xl text-xs font-serif leading-relaxed"
                />
              </div>

              <div>
                <label className="text-stone-700 font-bold block mb-1">
                  Payment Instructions (English)
                </label>
                <textarea
                  value={settings.paymentInstructionsEn}
                  onChange={(e) => setSettings({ ...settings, paymentInstructionsEn: e.target.value })}
                  rows={3}
                  className="w-full p-3 border rounded-xl text-xs font-mono leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-6 py-2.5 rounded-xl bg-[#801D2E] text-white text-xs font-serif font-bold hover:bg-[#962337] transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingSettings ? 'সংরক্ষিত হচ্ছে...' : 'সেটিংস সংরক্ষণ করুন'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: Physical Orders Manager (Preserved) */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-serif">
            <span className="text-stone-500 whitespace-nowrap">ফিল্টার:</span>
            {['all', 'pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                    selectedStatusFilter === st
                      ? 'bg-stone-900 text-white font-bold'
                      : 'bg-white border text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {st === 'all' ? 'সব অর্ডার' : t.orderStatus[st] || st}
                </button>
              )
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-2xl bg-white border border-[#E4DAC8] shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-serif"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-900">ID: {order.id}</span>
                    <span className="text-stone-400 font-mono">•</span>
                    <span className="font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                      {order.trackingNumber}
                    </span>
                    <span className="text-stone-400 font-mono">•</span>
                    <span className="text-stone-500">
                      {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-stone-900">
                    চিঠি: {order.letterTitle || 'শিরোনামহীন'}
                  </h4>

                  <p className="text-stone-600">
                    প্রাপক: <strong>{order.recipientName}</strong> • {order.recipientAddress},{' '}
                    {order.district} • ফোন: {order.recipientPhone}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-stone-500 pt-1">
                    <span>প্যাকেজ: {order.packageType}</span>
                    <span>•</span>
                    <span className="font-bold text-emerald-700">
                      ৳{toBengaliNumber(order.priceBdt)} BDT
                    </span>
                    <span>•</span>
                    <span>মাধ্যম: {order.paymentMethod}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1 rounded-full font-mono text-[11px] font-bold bg-amber-100 text-amber-900">
                    {t.orderStatus[order.status] || order.status}
                  </span>

                  <button
                    onClick={() => {
                      setEditingOrderId(order.id);
                      setNewStatus(order.status);
                      setTrackingNotes(order.notes || '');
                    }}
                    className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editingOrderId && (
            <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white rounded-2xl p-6 border shadow-2xl space-y-4">
                <h4 className="text-base font-serif font-bold text-stone-900">
                  অর্ডার স্ট্যাটাস হালনাগাদ
                </h4>

                <div>
                  <label className="text-xs font-serif font-bold text-stone-700 block mb-1">
                    স্ট্যাটাস পরিবর্তন করুন:
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className="w-full p-2 border rounded-xl text-xs font-serif"
                  >
                    <option value="pending">বিচারাধীন (Pending)</option>
                    <option value="confirmed">নিশ্চিতকৃত (Confirmed)</option>
                    <option value="processing">প্রস্তুত হচ্ছে (Processing)</option>
                    <option value="dispatched">প্রেরিত (Dispatched)</option>
                    <option value="delivered">ডেলিভার্ড (Delivered)</option>
                    <option value="cancelled">বাতিল (Cancelled)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-serif font-bold text-stone-700 block mb-1">
                    ডাক ট্র্যাকিং নোট বা চালানের রসিদ:
                  </label>
                  <textarea
                    value={trackingNotes}
                    onChange={(e) => setTrackingNotes(e.target.value)}
                    rows={3}
                    className="w-full p-2 border rounded-xl text-xs font-serif"
                    placeholder="যেমন: রেজিস্টার্ড ডাক রসিদ নং: BD-9281"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingOrderId(null)}
                    className="px-4 py-2 rounded-lg border text-xs font-serif text-stone-700"
                  >
                    বাতিল
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveOrderStatus(editingOrderId)}
                    className="px-5 py-2 rounded-lg bg-[#801D2E] text-white text-xs font-serif font-bold"
                  >
                    সংরক্ষণ করুন
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Reports Moderation (Preserved) */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200">
            <h3 className="text-base font-serif font-bold text-stone-900">
              অভিযোগ পর্যালোচনা ও কমিউনিটি সংযম
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-5 rounded-2xl bg-white border border-rose-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-serif"
              >
                <div className="space-y-1">
                  <span className="font-mono text-stone-500">ID: {rep.id}</span>
                  <h4 className="text-sm font-bold text-rose-900">
                    লক্ষ্য: {rep.targetType} ({rep.targetId})
                  </h4>
                  <p className="text-stone-700">কারণ: {rep.reason}</p>
                  {rep.details && <p className="text-stone-500 italic">"{rep.details}"</p>}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onResolveReport(rep.id, 'resolved')}
                    className="px-3 py-1.5 rounded-lg bg-rose-700 text-white font-bold"
                  >
                    নিষ্পত্তি করুন
                  </button>
                  <button
                    onClick={() => onResolveReport(rep.id, 'dismissed')}
                    className="px-3 py-1.5 rounded-lg border text-stone-700"
                  >
                    বাতিল করুন
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: Letters Moderation (Preserved) */}
      {activeTab === 'letters' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200">
            <h3 className="text-base font-serif font-bold text-stone-900">
              প্রকাশিত চিঠি সংযম ও পর্যবেক্ষণ
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {letters.map((letter) => (
              <div
                key={letter.id}
                className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-serif"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-700">{letter.id}</span>
                    <span>•</span>
                    <span className="text-stone-500">{letter.category}</span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900">{letter.title}</h4>
                  <p className="text-stone-600 line-clamp-1">{letter.content}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onModerateLetter(letter.id, !letter.isModerated)}
                    className={`px-3 py-1.5 rounded-lg font-bold ${
                      letter.isModerated
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {letter.isModerated ? 'অনুমোদন দিন' : 'হাইড করুন'}
                  </button>
                  <button
                    onClick={() => onDeleteLetter(letter.id)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: Packages Pricing (Preserved) */}
      {activeTab === 'packages' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200">
            <h3 className="text-base font-serif font-bold text-stone-900">
              শারীরিক চিঠি প্যাকেজ মূল্য ও কনফিগারেশন
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DEFAULT_DELIVERY_PACKAGES.map((pkg) => (
              <div key={pkg.id} className="p-5 rounded-2xl bg-white border shadow-2xs space-y-3">
                <h4 className="font-serif font-bold text-base text-stone-900">{pkg.nameBn}</h4>
                <div className="text-2xl font-mono font-bold text-[#801D2E]">
                  ৳{toBengaliNumber(pkg.priceBdt)}
                </div>
                <p className="text-xs text-stone-600 font-serif">{pkg.estimatedDays}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
