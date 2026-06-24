'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, ShieldAlert, ArrowRight, Home } from 'lucide-react';
import { loginAdmin, checkAdminSession } from '@/lib/actions';

export default function AdminLogin() {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect directly to dashboard
    checkAdminSession().then((isAuth) => {
      if (isAuth) {
        router.push('/admin');
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.debug('AdminLogin: handleSubmit invoked');
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter a passcode');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await loginAdmin(passcode);
      if (result.success) {
        router.push('/admin');
      } else {
        setError(result.error || 'Invalid Passcode');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-brand-dark flex flex-col justify-center items-center p-4">
      {/* Background glow orbs */}
      <div className="absolute inset-0 z-0">
        <div className="glow-orb glow-orb-primary absolute top-[25%] left-[20%] h-[300px] w-[300px] opacity-15" />
        <div className="glow-orb glow-orb-secondary absolute bottom-[25%] right-[20%] h-[300px] w-[300px] opacity-10" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/5 border border-white/10 rounded-[35px] p-8 shadow-2xl backdrop-blur-md animate-scaleUp">

        {/* Header Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange border border-brand-orange/25 mb-4">
            <KeyRound className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display uppercase">
            Secure Choice
          </h1>
          <p className="text-xs text-gray-400 font-semibold tracking-wider mt-1 uppercase">
            Admin Portal Access
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-400 font-semibold">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">
              Passcode
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="••••••••"
              className="w-full text-center tracking-widest rounded-full border border-white/10 bg-white/5 py-3.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="sunset-gradient w-full rounded-full py-3.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-98 focus:outline-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <>
                Unlock Dashboard
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            Back to Public Website
          </a>
        </div>

      </div>
    </div>
  );
}
