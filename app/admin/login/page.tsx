'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, Mail, ArrowRight, Sparkles, ArrowLeft, UserCheck } from 'lucide-react';

export default function StaffLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    // Read pre-filled email from URL if present (from QR Code)
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(emailParam);

    fetch('/api/services')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.services) {
          setServices(data.services);
        }
      })
      .catch(() => {});
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your Staff Email and Password.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('staffUser', JSON.stringify(data.user));
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Invalid staff credentials.');
        setSubmitting(false);
      }
    } catch (err: any) {
      setError('Failed to authenticate.');
      setSubmitting(false);
    }
  };

  // Select a Department to log in
  const selectDepartment = (service: any) => {
    const demoEmail = `staff.${service.prefix.toLowerCase()}@smartqueue.com`;
    setEmail(demoEmail);
    setPassword('');
    // Wait for user to enter their specific password
    document.getElementById('passwordInput')?.focus();
  };

  const selectMaster = () => {
    setEmail('billing@smartqueue.com');
    setPassword('');
    document.getElementById('passwordInput')?.focus();
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      {/* Back to Client Portal Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-4 transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Customer Portal
      </Link>

      <div className="rounded-3xl border border-amber-500/30 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Staff Operator Login</h1>
            <p className="text-xs text-slate-400">Access counter dashboard & queue controls</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Staff Email / ID
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="staff@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                id="passwordInput"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-600/30 hover:bg-amber-500 transition-all disabled:opacity-50"
          >
            {submitting ? 'Authenticating...' : 'Login to Staff Panel'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

          {/* Quick Demo Login Presets */}
          <div className="mt-6 border-t border-slate-800 pt-6">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Select Department to Log In:
            </div>
            
            <div className="grid grid-cols-1 gap-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
              {/* MASTER BILLING ADMIN */}
              <button
                type="button"
                onClick={selectMaster}
                className="flex items-center gap-3 rounded-xl border border-amber-500/50 bg-amber-900/20 p-3 text-left hover:bg-amber-900/40 transition-all group shadow-md shadow-amber-900/10"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-amber-500/20 font-mono text-xs font-bold text-amber-400 border border-amber-500/50">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-400">
                    Master Billing Staff
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Global view of all counters & queues
                  </div>
                </div>
                <UserCheck className="h-4 w-4 text-amber-500 ml-auto" />
              </button>

              {services.length === 0 ? (
                <div className="text-center text-xs text-slate-500 italic py-2 mt-2">
                  No other departments added yet.
                </div>
              ) : (
                services.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => selectDepartment(s)}
                    className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 text-left hover:border-amber-500/40 hover:bg-slate-900 transition-all group"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-amber-500/10 font-mono text-xs font-bold text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20">
                      {s.prefix}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                        {s.name} Operator
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Login as staff for {s.name} Counter
                      </div>
                    </div>
                    <UserCheck className="h-4 w-4 text-slate-600 ml-auto group-hover:text-amber-400 transition-colors" />
                  </button>
                ))
              )}
            </div>
          </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          Need a new staff account?{' '}
          <Link href="/admin/signup" className="font-bold text-amber-400 underline">
            Register New Staff
          </Link>
        </div>
      </div>
    </div>
  );
}
