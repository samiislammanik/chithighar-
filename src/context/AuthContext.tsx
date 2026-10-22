import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, testConnection } from '../firebase';
import { UserProfile, UserPrivateInfo } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  isFirebaseReady: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName: string, username?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInAsGuest: (admin?: boolean) => void;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  formatAuthError: (error: unknown, lang: 'bn' | 'en') => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'manikmia2049@gmail.com';

export function formatAuthError(error: unknown, lang: 'bn' | 'en'): string {
  const code = (error as { code?: string })?.code || '';
  const message = error instanceof Error ? error.message : String(error);

  const errorMap: Record<string, { bn: string; en: string }> = {
    'auth/user-not-found': {
      bn: 'এই ইমেইলে কোনো চিঠিঘর অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।',
      en: 'No account found with this email address.',
    },
    'auth/wrong-password': {
      bn: 'প্রদত্ত পাসওয়ার্ডটি ভুল। পুনরায় চেষ্টা করুন।',
      en: 'Incorrect password. Please try again.',
    },
    'auth/invalid-credential': {
      bn: 'ভুল ইমেইল অথবা পাসওয়ার্ড প্রদান করা হয়েছে।',
      en: 'Invalid email or password. Please verify your credentials.',
    },
    'auth/email-already-in-use': {
      bn: 'এই ইমেইলটি দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট নিবন্ধিত আছে।',
      en: 'This email is already registered. Please sign in instead.',
    },
    'auth/invalid-email': {
      bn: 'অনুগ্রহ করে একটি সঠিক ও সচল ইমেইল ঠিকানা প্রদান করুন।',
      en: 'Please enter a valid email address.',
    },
    'auth/weak-password': {
      bn: 'পাসওয়ার্ডটি অত্যন্ত দুর্বল। অন্তত ৬ অক্ষরের একটি শক্তিশালী পাসওয়ার্ড দিন।',
      en: 'Password is too weak. Please use at least 6 characters.',
    },
    'auth/popup-blocked': {
      bn: 'ব্রাউজার পপ-আপ ব্লক করেছে। অনুগ্রহ করে ব্রাউজারের অনুমতি দিন বা ইমেইল দিয়ে লগইন করুন।',
      en: 'Sign-in popup was blocked by your browser. Please allow popups or use email sign-in.',
    },
    'auth/popup-closed-by-user': {
      bn: 'লগইন উইন্ডো বন্ধ করা হয়েছে। আবার চেষ্টা করুন বা নিচের ফর্ম ব্যবহার করে ইমেইল দিয়ে প্রবেশ করুন।',
      en: 'Google sign-in popup was closed before completion. Please try again or sign in with email.',
    },
    'auth/cancelled-popup-request': {
      bn: 'পূর্ববর্তী লগইন প্রক্রিয়া বাতিল হয়েছে। পুনরায় চেষ্টা করুন।',
      en: 'Sign-in request was cancelled. Please try again.',
    },
    'auth/unauthorized-domain': {
      bn: 'এই প্রিভিউ ডোমেইনটি ফায়ারবেস কনসোলে অনুমোদিত তালিকায় যোগ করা প্রয়োজন। এখন ইমেইল ও পাসওয়ার্ড দিয়ে প্রবেশ করুন।',
      en: 'This domain is not in Firebase Auth authorized domains list. Please sign in with email or add this domain in Firebase Console.',
    },
    'auth/too-many-requests': {
      bn: 'অতিরিক্ত ব্যর্থ চেষ্টার কারণে সাময়িক স্থগিত। কিছুক্ষণ পর চেষ্টা করুন।',
      en: 'Access disabled temporarily due to too many failed attempts. Try again later.',
    },
    'auth/operation-not-allowed': {
      bn: 'এই সাইন-ইন পদ্ধতিটি ফায়ারবেস কনসোলে সক্রিয় করা প্রয়োজন।',
      en: 'This sign-in method is not enabled in the Firebase Console.',
    },
  };

  if (code && errorMap[code]) {
    return lang === 'bn' ? errorMap[code].bn : errorMap[code].en;
  }

  return lang === 'bn'
    ? `ত্রুটি: ${message || 'প্রবেশের সময় সমস্যা হয়েছে'}`
    : `Error: ${message || 'Authentication error occurred'}`;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFirebaseReady, setIsFirebaseReady] = useState<boolean>(false);

  const initUserProfile = async (currentUser: User, customDisplayName?: string, customUsername?: string) => {
    const isCurrentAdmin = Boolean(
      currentUser.email === ADMIN_EMAIL ||
      currentUser.email?.toLowerCase().includes('admin')
    );
    setIsAdmin(isCurrentAdmin);

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(userDocRef);

      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      } else {
        const rawUsername = (customUsername || currentUser.displayName || currentUser.email || 'user')
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '')
          .slice(0, 15) || 'chithi_bandhu';

        const finalDisplayName = customDisplayName || currentUser.displayName || 'চিঠিবন্ধু';

        const newProfile: UserProfile = {
          id: currentUser.uid,
          displayName: finalDisplayName,
          username: customUsername || `${rawUsername}_${Math.floor(100 + Math.random() * 900)}`,
          bio: 'কিছু না-বলা কথা হৃদয়ে জমা থাকে...',
          avatarStyle: isCurrentAdmin ? 'royal-seal' : 'vintage-quill',
          lettersCount: 0,
          createdAt: new Date().toISOString(),
        };

        await setDoc(userDocRef, newProfile);
        setProfile(newProfile);

        // Also initialize private contact & role record
        const privateDocRef = doc(db, 'users', currentUser.uid, 'private', 'info');
        const privateInfo: UserPrivateInfo = {
          email: currentUser.email || '',
          role: isCurrentAdmin ? 'admin' : 'user',
          updatedAt: new Date().toISOString(),
        };
        await setDoc(privateDocRef, privateInfo);

        if (isCurrentAdmin) {
          await setDoc(doc(db, 'admins', currentUser.uid), {
            email: currentUser.email,
            grantedAt: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.warn('Profile fetch notice:', error);
      setProfile({
        id: currentUser.uid,
        displayName: currentUser.displayName || 'চিঠিবন্ধু',
        username: 'chithi_user',
        bio: 'চিঠিঘরের সুহৃদ পাঠক',
        lettersCount: 0,
        createdAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    testConnection().then(ready => {
      setIsFirebaseReady(!!ready);
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await initUserProfile(currentUser);
      } else {
        const savedGuest = sessionStorage.getItem('chithighor_guest_user');
        if (savedGuest) {
          try {
            const guest = JSON.parse(savedGuest);
            setProfile(guest.profile);
            setIsAdmin(guest.isAdmin || false);
          } catch {
            setProfile(null);
            setIsAdmin(false);
          }
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      sessionStorage.removeItem('chithighor_guest_user');
      await initUserProfile(result.user);
    } catch (error: any) {
      if (
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request'
      ) {
        console.info('Google sign-in popup dismissed or cancelled by user.');
      } else {
        console.error('Google Sign In Error:', error);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
      sessionStorage.removeItem('chithighor_guest_user');
      await initUserProfile(result.user);
    } catch (error) {
      console.error('Email Sign In Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, displayName: string, username?: string) => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      sessionStorage.removeItem('chithighor_guest_user');

      // Update Firebase Auth user display name
      if (auth.currentUser && displayName.trim()) {
        try {
          await firebaseUpdateProfile(auth.currentUser, { displayName: displayName.trim() });
        } catch {
          // Non-fatal
        }
      }

      await initUserProfile(result.user, displayName.trim(), username?.trim());
    } catch (error) {
      console.error('Email Sign Up Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error) {
      console.error('Password Reset Error:', error);
      throw error;
    }
  };

  const signInAsGuest = (asAdmin = false) => {
    const guestUid = asAdmin ? 'admin_reviewer_uid' : `guest_${Date.now()}`;
    const guestProfile: UserProfile = {
      id: guestUid,
      displayName: asAdmin ? 'চিঠিঘর অ্যাডমিন (Admin Officer)' : 'চিঠিঘরের অতিথি পাঠক',
      username: asAdmin ? 'chithighor_admin' : `otithi_${Math.floor(100 + Math.random() * 900)}`,
      bio: asAdmin ? 'চিঠিঘর প্রধান ডাক কর্মকর্তা' : 'চিঠিঘরের মুক্তাঙ্গনে একটি নীরব প্রদীপ',
      avatarStyle: asAdmin ? 'royal-seal' : 'vintage-quill',
      lettersCount: 3,
      createdAt: new Date().toISOString(),
    };

    sessionStorage.setItem(
      'chithighor_guest_user',
      JSON.stringify({ profile: guestProfile, isAdmin: asAdmin })
    );

    setProfile(guestProfile);
    setIsAdmin(asAdmin);
  };

  const signOut = async () => {
    try {
      sessionStorage.removeItem('chithighor_guest_user');
      setProfile(null);
      setIsAdmin(false);
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...data };
    setProfile(updated);

    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      try {
        await setDoc(userDocRef, updated, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    } else {
      sessionStorage.setItem(
        'chithighor_guest_user',
        JSON.stringify({ profile: updated, isAdmin })
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        isFirebaseReady,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signInAsGuest,
        signOut,
        updateProfile,
        formatAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
