import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Mail,
  Lock,
  User,
  Shield,
  X,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    signInAsGuest,
    formatAuthError,
  } = useAuth();
  const { language, t } = useLanguage();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetFormState = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage(language === 'bn' ? 'ইমেইল ও পাসওয়ার্ড পূরণ করুন।' : 'Please enter email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await signInWithEmail(email, password);
      onClose();
    } catch (err) {
      setErrorMessage(formatAuthError(err, language));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage(language === 'bn' ? 'ইমেইল ও পাসওয়ার্ড পূরণ করুন।' : 'Please enter email and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage(language === 'bn' ? 'পাসওয়ার্ডটি অন্তত ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await signUpWithEmail(
        email,
        password,
        displayName.trim() || 'চিঠিবন্ধু',
        username.trim() ? username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') : undefined
      );
      onClose();
    } catch (err) {
      setErrorMessage(formatAuthError(err, language));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage(language === 'bn' ? 'অনুগ্রহ করে আপনার ইমেইল ঠিকানা দিন।' : 'Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await resetPassword(email);
      setSuccessMessage(
        language === 'bn'
          ? 'পাসওয়ার্ড রিসেট লিঙ্ক আপনার ইমেইলে পাঠানো হয়েছে। আপনার ইনবক্স চেক করুন।'
          : 'Password reset link sent to your email. Please check your inbox.'
      );
    } catch (err) {
      setErrorMessage(formatAuthError(err, language));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        setErrorMessage(
          language === 'bn'
            ? 'লগইন উইন্ডো বন্ধ করা হয়েছে। আবার চেষ্টা করতে পারেন বা নিচের ফর্ম দিয়ে ইমেইলে প্রবেশ করতে পারেন।'
            : 'Google sign-in window was closed. You can retry or sign in with your email below.'
        );
      } else if (err?.code === 'auth/popup-blocked') {
        setErrorMessage(
          language === 'bn'
            ? 'ব্রাউজার পপ-আপ ব্লক করেছে। অনুগ্রহ করে পপ-আপ অনুমোদন করুন অথবা ইমেইল দিয়ে প্রবেশ করুন।'
            : 'Popups are blocked by your browser. Please allow popups or use email sign-in.'
        );
      } else {
        setErrorMessage(formatAuthError(err, language));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="w-full max-w-md rounded-2xl bg-[#FAF7F2] border border-[#E4DAC8] shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-[#801D2E] to-[#450F18] border-2 border-amber-300/40 flex items-center justify-center font-serif text-xl font-bold text-amber-100 shadow-md">
            চি
          </div>
          <h2 className="text-2xl font-serif font-black text-stone-900">
            {mode === 'signin' && (language === 'bn' ? 'চিঠিঘরে প্রবেশ করুন' : 'Sign in to Chithighor')}
            {mode === 'signup' && (language === 'bn' ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create an Account')}
            {mode === 'forgot' && (language === 'bn' ? 'পাসওয়ার্ড পুনরুদ্ধার' : 'Reset Password')}
          </h2>
          <p className="text-xs font-serif text-stone-600">
            {language === 'bn' ? 'কিছু কথা চিঠিতেই সুন্দর' : 'Some words are beautiful only in letters'}
          </p>
        </div>

        {/* Mode Tabs */}
        {mode !== 'forgot' && (
          <div className="flex rounded-xl bg-[#EFE8DC] p-1 border border-[#DDD3C2]">
            <button
              onClick={() => {
                setMode('signin');
                resetFormState();
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-serif font-bold transition-all ${
                mode === 'signin'
                  ? 'bg-white text-[#801D2E] shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {language === 'bn' ? 'প্রবেশ করুন (Sign In)' : 'Sign In'}
            </button>
            <button
              onClick={() => {
                setMode('signup');
                resetFormState();
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-serif font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-white text-[#801D2E] shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {language === 'bn' ? 'নতুন নিবন্ধন (Register)' : 'Register'}
            </button>
          </div>
        )}

        {/* Error / Success Feedback */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-serif flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-serif flex items-start gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Google Sign In Button */}
        {mode !== 'forgot' && (
          <div className="space-y-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-serif font-bold flex items-center justify-center gap-2.5 shadow-2xs transition-all hover:shadow-xs disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
              </svg>
              <span>Google দিয়ে প্রবেশ (Sign in with Google)</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="flex-1 h-[1px] bg-stone-300" />
              <span className="text-[11px] font-serif text-stone-500 uppercase tracking-wider">
                অথবা ইমেইল দিয়ে
              </span>
              <span className="flex-1 h-[1px] bg-stone-300" />
            </div>
          </div>
        )}

        {/* Form: SIGN IN */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-serif font-bold text-stone-800 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-500" />
                <span>ইমেইল ঠিকানা (Email)</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full p-2.5 rounded-xl border border-[#D5C6B0] bg-white text-sm font-sans focus:outline-none focus:border-[#801D2E]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-serif font-bold text-stone-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-stone-500" />
                  <span>পাসওয়ার্ড (Password)</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    resetFormState();
                  }}
                  className="text-[11px] font-serif text-[#801D2E] hover:underline"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 rounded-xl border border-[#D5C6B0] bg-white text-sm font-sans focus:outline-none focus:border-[#801D2E]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#801D2E] to-[#601422] hover:from-[#942236] hover:to-[#731829] text-white text-xs font-serif font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন (Sign In)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Form: SIGN UP */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-serif font-bold text-stone-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-stone-500" />
                <span>আপনার নাম (Display Name)</span>
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="যেমন: অনির্বাণ সেনগুপ্ত"
                className="w-full p-2.5 rounded-xl border border-[#D5C6B0] bg-white text-sm font-serif focus:outline-none focus:border-[#801D2E]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-serif font-bold text-stone-800">
                চিঠিঘর ইউজারনেম (@username)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400 font-mono text-xs">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="anirban_bd"
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-[#D5C6B0] bg-white text-xs font-mono focus:outline-none focus:border-[#801D2E]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-serif font-bold text-stone-800 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-500" />
                <span>ইমেইল ঠিকানা (Email)</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full p-2.5 rounded-xl border border-[#D5C6B0] bg-white text-sm font-sans focus:outline-none focus:border-[#801D2E]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-serif font-bold text-stone-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-stone-500" />
                <span>পাসওয়ার্ড (Password - min 6 chars)</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 rounded-xl border border-[#D5C6B0] bg-white text-sm font-sans focus:outline-none focus:border-[#801D2E]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#801D2E] to-[#601422] hover:from-[#942236] hover:to-[#731829] text-white text-xs font-serif font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'অ্যাকাউন্ট তৈরি করুন (Create Account)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Form: FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-xs font-serif text-stone-600">
              আপনার অ্যাকাউন্টের সাথে নিবন্ধিত ইমেইল ঠিকানাটি লিখুন। আমরা আপনাকে একটি পাসওয়ার্ড রিসেট লিঙ্ক পাঠাব।
            </p>

            <div className="space-y-1">
              <label className="text-xs font-serif font-bold text-stone-800 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-500" />
                <span>ইমেইল ঠিকানা (Email)</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full p-2.5 rounded-xl border border-[#D5C6B0] bg-white text-sm font-sans focus:outline-none focus:border-[#801D2E]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#801D2E] hover:bg-[#962337] text-white text-xs font-serif font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'পাঠানো হচ্ছে...' : 'রিসেট লিঙ্ক পাঠান (Send Reset Link)'}</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  resetFormState();
                }}
                className="text-xs font-serif text-stone-600 hover:text-stone-900"
              >
                ← লগইনে ফিরে যান (Back to Sign In)
              </button>
            </div>
          </form>
        )}

        {/* Guest Demo Fallback Shortcuts */}
        <div className="pt-2 border-t border-stone-200 space-y-2">
          <p className="text-[11px] font-serif text-stone-500 text-center">
            তাৎক্ষণিক ডেমো বা রিভিউ পরীক্ষার জন্য:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                signInAsGuest(false);
                onClose();
              }}
              className="py-1.5 px-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-[11px] font-serif text-stone-700 flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>অতিথি প্রবেশ (Guest)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                signInAsGuest(true);
                onClose();
              }}
              className="py-1.5 px-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-[11px] font-serif text-red-800 flex items-center justify-center gap-1 font-semibold"
            >
              <ShieldAlert className="w-3 h-3 text-red-600" />
              <span>অ্যাডমিন ডেমো (Admin)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
