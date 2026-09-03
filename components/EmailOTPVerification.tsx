'use client';

import { useState } from 'react';
import { Mail, KeyRound, CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';

interface EmailOTPVerificationProps {
  onVerified: (email: string) => void;
}

export function EmailOTPVerification({ onVerified }: EmailOTPVerificationProps) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'input_email' | 'input_otp' | 'verified'>('input_email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed to send OTP');
      setStep('input_otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      if (!res.ok) throw new Error('Failed to verify OTP');
      setStep('verified');
      onVerified(email);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Mail className="h-4 w-4 text-indigo-400" /> Email Verification
        </h3>
        <p className="text-xs text-slate-400 mt-1">Verify your email address using an OTP.</p>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-rose-500/10 p-3 text-rose-400 border border-rose-500/20">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="text-xs">{error}</div>
        </div>
      )}

      {step === 'input_email' && (
        <div className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="email" required placeholder="Enter your email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-4 text-sm text-white"
            />
          </div>
          <button type="button" onClick={handleSendOTP} disabled={loading || !email} className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send OTP
          </button>
        </div>
      )}

      {step === 'input_otp' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400 mb-2">OTP sent to <span className="text-white font-medium">{email}</span></div>
          <div className="relative">
            <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text" required maxLength={6} placeholder="Enter 6-digit OTP"
              value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-4 text-sm tracking-widest text-white text-center"
            />
          </div>
          <button type="button" onClick={handleVerifyOTP} disabled={loading || otp.length < 6} className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify OTP'}
          </button>
        </div>
      )}

      {step === 'verified' && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 p-4 border border-emerald-500/20">
          <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
          <div>
            <div className="text-sm font-bold text-emerald-400">Email Verified</div>
            <div className="text-xs text-emerald-500/80">{email}</div>
          </div>
        </div>
      )}
    </div>
  );
}
