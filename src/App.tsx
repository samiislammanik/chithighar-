import React, { useState, useEffect } from 'react';
import { Letter, PhysicalOrder, ContentReport, OrderStatus } from './types';
import { SAMPLE_LETTERS, DEFAULT_DELIVERY_PACKAGES } from './utils/sampleData';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { WriteLetterPage } from './pages/WriteLetterPage';
import { CommunityPage } from './pages/CommunityPage';
import { LetterViewPage } from './pages/LetterViewPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { PhysicalDeliveryPage } from './pages/PhysicalDeliveryPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { AdminPage } from './pages/AdminPage';
import { InfoPages } from './pages/InfoPages';
import { StationeryGallery } from './components/StationeryGallery';
import { AuthModal } from './components/AuthModal';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';

function MainApp() {
  const { user, profile } = useAuth();
  const { language } = useLanguage();

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [letters, setLetters] = useState<Letter[]>(SAMPLE_LETTERS);
  const [activeLetter, setActiveLetter] = useState<Letter | null>(null);
  const [draftLetter, setDraftLetter] = useState<Letter | null>(null);
  const [physicalLetterData, setPhysicalLetterData] = useState<Partial<Letter> | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [trackingNumberSearch, setTrackingNumberSearch] = useState<string>('');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  const handleOpenAuthModal = (mode: 'signin' | 'signup' | 'forgot' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Sample initial orders for demo & tracking verification
  const [physicalOrders, setPhysicalOrders] = useState<PhysicalOrder[]>([
    {
      id: 'ord_sample_1',
      userId: 'system_sample_1',
      letterTitle: 'মেঘবালিকা, তুমি কেমন আছো?',
      letterContent: 'প্রিয় মেঘবালিকা...',
      paperStyle: 'vintage-parchment',
      envelopeColor: 'burgundy',
      waxSeal: 'rose',
      packageType: 'vintage_wax_box',
      priceBdt: 280,
      senderName: 'অচেনা পথচারী',
      recipientName: 'তানিয়া রহমান',
      recipientPhone: '01711-223344',
      recipientAddress: 'বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা',
      district: 'Dhaka (ঢাকা)',
      postalCode: '1205',
      status: 'processing',
      trackingNumber: 'CG-849201BD',
      paymentStatus: 'mock_verified',
      paymentMethod: 'bKash',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'ord_sample_2',
      userId: 'system_sample_2',
      letterTitle: 'মাকে না-বলা একটি চিঠি',
      letterContent: 'মাগো, আজকাল অফিসে এত কাজের চাপ...',
      paperStyle: 'cream-linen',
      envelopeColor: 'forest-green',
      waxSeal: 'heart',
      packageType: 'standard',
      priceBdt: 120,
      senderName: 'স্নেহের সন্তান',
      recipientName: 'মোসাম্মৎ আয়েশা বেগম',
      recipientPhone: '01819-334455',
      recipientAddress: 'সবুজবাগ, কুমারপাড়া, সিলেট সদর',
      district: 'Sylhet (সিলেট)',
      postalCode: '3100',
      status: 'dispatched',
      trackingNumber: 'CG-582049BD',
      paymentStatus: 'mock_verified',
      paymentMethod: 'Nagad',
      notes: 'নিবন্ধিত ডাকযোগে প্রেরণ করা হয়েছে। রসিদ নং: BD-POST-941',
      createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    },
  ]);

  const [reports, setReports] = useState<ContentReport[]>([
    {
      id: 'rep_1',
      targetType: 'letter',
      targetId: 'chithi-103',
      reportedBy: 'user_anonymous',
      reason: 'personal_apology_inquiry',
      details: 'চিঠিটির সত্যতা ও শালীনতা যাচাইয়ের জন্য অনুরোধ।',
      status: 'pending',
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
  ]);

  // Load letters from Firestore or local storage on boot
  useEffect(() => {
    const fetchFirestoreLetters = async () => {
      try {
        // Query public published letters compliant with security rules
        const qPublic = query(
          collection(db, 'letters'),
          where('visibility', '==', 'public'),
          where('isDraft', '==', false)
        );
        const querySnap = await getDocs(qPublic);
        const dbLetters: Letter[] = [];
        querySnap.forEach(d => {
          dbLetters.push(d.data() as Letter);
        });

        // If user is logged in, also fetch user's own drafts & private letters
        if (user) {
          try {
            const qUser = query(collection(db, 'letters'), where('authorId', '==', user.uid));
            const userSnap = await getDocs(qUser);
            userSnap.forEach(d => {
              if (!dbLetters.some(l => l.id === d.id)) {
                dbLetters.push(d.data() as Letter);
              }
            });
          } catch {
            // Non-fatal
          }
        }

        if (dbLetters.length > 0) {
          const existingIds = new Set(dbLetters.map(l => l.id));
          const combined = [...dbLetters, ...SAMPLE_LETTERS.filter(s => !existingIds.has(s.id))];
          setLetters(combined);
        } else {
          // Check local letters
          const localSaved = localStorage.getItem('chithighor_local_letters');
          if (localSaved) {
            try {
              const parsed: Letter[] = JSON.parse(localSaved);
              const existingIds = new Set(parsed.map(l => l.id));
              setLetters([...parsed, ...SAMPLE_LETTERS.filter(s => !existingIds.has(s.id))]);
            } catch {
              // Ignore
            }
          }
        }
      } catch (err) {
        console.warn('Firestore load notice (using initial seed data):', err);
        const localSaved = localStorage.getItem('chithighor_local_letters');
        if (localSaved) {
          try {
            const parsed: Letter[] = JSON.parse(localSaved);
            const existingIds = new Set(parsed.map(l => l.id));
            setLetters([...parsed, ...SAMPLE_LETTERS.filter(s => !existingIds.has(s.id))]);
          } catch {
            // Ignore
          }
        }
      }
    };

    fetchFirestoreLetters().then(() => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const letterParam = params.get('letter');
        if (letterParam) {
          const target = letters.find(l => l.id === letterParam) || SAMPLE_LETTERS.find(s => s.id === letterParam);
          if (target) {
            setActiveLetter(target);
            setCurrentTab('letter-view');
          }
        }
      }
    });
  }, [user]);

  // Load user bookmarks from Firestore
  useEffect(() => {
    if (!user) return;
    const loadBookmarks = async () => {
      try {
        const snap = await getDocs(collection(db, 'users', user.uid, 'bookmarks'));
        const ids = new Set<string>();
        snap.forEach(d => ids.add(d.id));
        setBookmarkedIds(ids);
      } catch (err) {
        console.warn('Bookmarks load notice:', err);
      }
    };
    loadBookmarks();
  }, [user]);

  // Load user orders from Firestore
  useEffect(() => {
    if (!user) return;
    const loadOrders = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'orders'), where('userId', '==', user.uid)));
        if (!snap.empty) {
          const dbOrders: PhysicalOrder[] = [];
          snap.forEach(d => dbOrders.push(d.data() as PhysicalOrder));
          setPhysicalOrders(prev => {
            const existing = new Set(dbOrders.map(o => o.id));
            return [...dbOrders, ...prev.filter(p => !existing.has(p.id))];
          });
        }
      } catch (err) {
        console.warn('Orders load notice:', err);
      }
    };
    loadOrders();
  }, [user]);

  // Sync active letter with browser URL
  const handleOpenLetter = (letter: Letter) => {
    // Increment view count
    setLetters(prev =>
      prev.map(l => (l.id === letter.id ? { ...l, viewsCount: (l.viewsCount || 0) + 1 } : l))
    );
    setActiveLetter({ ...letter, viewsCount: (letter.viewsCount || 0) + 1 });
    setCurrentTab('letter-view');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `?letter=${letter.id}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookmarkToggle = async (letter: Letter) => {
    const isCurrentlyBookmarked = bookmarkedIds.has(letter.id);
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (isCurrentlyBookmarked) {
        next.delete(letter.id);
      } else {
        next.add(letter.id);
      }
      return next;
    });

    if (user) {
      const bookmarkRef = doc(db, 'users', user.uid, 'bookmarks', letter.id);
      try {
        if (isCurrentlyBookmarked) {
          await deleteDoc(bookmarkRef);
        } else {
          await setDoc(bookmarkRef, {
            letterId: letter.id,
            savedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Bookmark sync notice:', err);
      }
    }
  };

  const handleLetterCreated = (newLetter: Letter) => {
    setLetters(prev => [newLetter, ...prev]);
    setActiveLetter(newLetter);
    setCurrentTab('letter-view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditDraft = (draft: Letter) => {
    setDraftLetter(draft);
    setCurrentTab('write');
  };

  const handleDeleteLetter = async (letterId: string) => {
    setLetters(prev => prev.filter(l => l.id !== letterId));
    if (activeLetter?.id === letterId) {
      setActiveLetter(null);
      setCurrentTab('community');
    }

    if (user) {
      try {
        await deleteDoc(doc(db, 'letters', letterId));
      } catch (err) {
        console.warn('Letter delete sync note:', err);
      }
    }
    // Also remove from local storage
    const localSaved = localStorage.getItem('chithighor_local_letters');
    if (localSaved) {
      try {
        const parsed: Letter[] = JSON.parse(localSaved);
        const filtered = parsed.filter(l => l.id !== letterId);
        localStorage.setItem('chithighor_local_letters', JSON.stringify(filtered));
      } catch {
        // Ignore
      }
    }
  };

  const handleModerateLetter = async (letterId: string, isModerated: boolean) => {
    setLetters(prev =>
      prev.map(l => (l.id === letterId ? { ...l, isModerated } : l))
    );
    if (user) {
      try {
        await updateDoc(doc(db, 'letters', letterId), { isModerated });
      } catch (err) {
        console.warn('Moderation sync note:', err);
      }
    }
  };

  const handleResolveReport = (reportId: string, action: 'resolved' | 'dismissed') => {
    setReports(prev =>
      prev.map(r => (r.id === reportId ? { ...r, status: action } : r))
    );
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    trackingNotes?: string
  ) => {
    setPhysicalOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status, notes: trackingNotes || o.notes } : o))
    );
    if (user) {
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          status,
          notes: trackingNotes,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Order status update sync note:', err);
      }
    }
  };

  const handleOrderCreated = (order: PhysicalOrder) => {
    setPhysicalOrders(prev => [order, ...prev]);
  };

  const handleConvertToPhysical = (letterData: Partial<Letter>) => {
    setPhysicalLetterData(letterData);
    setCurrentTab('physical');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToTracking = (trackingNo: string) => {
    setTrackingNumberSearch(trackingNo);
    setCurrentTab('order-tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2C241E]">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={tab => {
          if (tab === 'write') setDraftLetter(null);
          setCurrentTab(tab);
          if (typeof window !== 'undefined' && tab !== 'letter-view') {
            window.history.pushState({}, '', window.location.pathname);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuthModal={handleOpenAuthModal}
      />

      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            letters={letters}
            setCurrentTab={setCurrentTab}
            onOpenLetter={handleOpenLetter}
            onBookmarkLetter={handleBookmarkToggle}
            bookmarkedIds={bookmarkedIds}
          />
        )}

        {currentTab === 'write' && (
          <WriteLetterPage
            onLetterCreated={handleLetterCreated}
            onConvertToPhysical={handleConvertToPhysical}
            draftLetter={draftLetter}
            onOpenAuthModal={handleOpenAuthModal}
          />
        )}

        {currentTab === 'community' && (
          <CommunityPage
            letters={letters}
            onOpenLetter={handleOpenLetter}
            onBookmarkLetter={handleBookmarkToggle}
            onWriteLetter={() => {
              setDraftLetter(null);
              setCurrentTab('write');
            }}
            bookmarkedIds={bookmarkedIds}
          />
        )}

        {currentTab === 'letter-view' && activeLetter && (
          <LetterViewPage
            letter={activeLetter}
            onBack={() => setCurrentTab('community')}
            onBookmarkToggle={handleBookmarkToggle}
            isBookmarked={bookmarkedIds.has(activeLetter.id)}
            onOpenAuthModal={handleOpenAuthModal}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage
            letters={letters}
            physicalOrders={physicalOrders}
            onOpenLetter={handleOpenLetter}
            onEditDraft={handleEditDraft}
            onDeleteLetter={handleDeleteLetter}
            onTrackOrder={order => handleGoToTracking(order.trackingNumber)}
            onWriteLetter={() => {
              setDraftLetter(null);
              setCurrentTab('write');
            }}
            bookmarkedIds={bookmarkedIds}
            onBookmarkLetter={handleBookmarkToggle}
            onOpenAuthModal={handleOpenAuthModal}
          />
        )}

        {currentTab === 'profile' && <ProfilePage />}

        {currentTab === 'stationery' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 select-none">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono tracking-widest uppercase text-[#801D2E] bg-[#801D2E]/10 px-3 py-1 rounded-full font-bold">
                HERITAGE STATIONERY & PAPERS
              </span>
              <h1 className="text-3xl font-serif font-black text-stone-900">
                চিঠিঘর ভিন্টেজ স্টেশনারি ও খাম সংগ্রহ
              </h1>
              <p className="text-sm font-serif text-stone-600 leading-relaxed">
                ১৫টি দৃষ্টিনন্দন প্রাচীন চিঠির পাতা এবং ১০টি রাজকীয় খাম। আপনার পছন্দের স্টেশনারি বেছে নিয়ে সরাসরি চিঠি লিখুন অথবা বিকাশ/নগদে প্রিমিয়াম ডিজাইন আনলক করুন।
              </p>
            </div>

            <StationeryGallery
              selectedEnvelope="classic-ivory"
              selectedPaper="antique-rose-parchment"
              onSelectEnvelope={() => setCurrentTab('write')}
              onSelectPaper={() => setCurrentTab('write')}
              onOpenAuthModal={handleOpenAuthModal}
            />
          </div>
        )}

        {currentTab === 'physical' && (
          <PhysicalDeliveryPage
            onOrderCreated={handleOrderCreated}
            initialLetterData={physicalLetterData}
            onGoToTracking={handleGoToTracking}
          />
        )}

        {currentTab === 'order-tracking' && (
          <OrderTrackingPage
            orders={physicalOrders}
            initialTrackingNo={trackingNumberSearch}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPage
            letters={letters}
            physicalOrders={physicalOrders}
            reports={reports}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onModerateLetter={handleModerateLetter}
            onDeleteLetter={handleDeleteLetter}
            onResolveReport={handleResolveReport}
          />
        )}

        {['about', 'guidelines', 'privacy', 'terms', 'contact'].includes(currentTab) && (
          <InfoPages pageType={currentTab as 'about' | 'guidelines' | 'privacy' | 'terms' | 'contact'} />
        )}
      </main>

      <Footer setCurrentTab={setCurrentTab} />

      {/* Global Real Firebase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
