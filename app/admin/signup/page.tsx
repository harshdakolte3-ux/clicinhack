'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, Mail, User, ArrowRight, ArrowLeft } from 'lucide-react';

export default function StaffSignupPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [counterAssignment, setCounterAssignment] = useState('Counter 1');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, counterAssignment }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('staffUser', JSON.stringify(data.user));
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Failed to create staff account.');
        setSubmitting(false);
      }
    } catch (err) {
      setError('Error creating account.');
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:px-6">
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
            <h1 className="text-2xl font-black text-white">Staff Registration</h1>
            <p className="text-xs text-slate-400">Create new counter operator account</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                placeholder="e.g. Dr. Rajesh Verma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Work Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="rajesh@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Primary Counter Assignment
            </label>
            <select
              value={counterAssignment}
              onChange={(e) => setCounterAssignment(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 px-4 text-sm text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="Counter 1">Counter 1 (General OPD)</option>
              <option value="Counter 2">Counter 2 (General OPD)</option>
              <option value="Counter 3">Counter 3 (Pediatrics)</option>
              <option value="Counter 4">Counter 4 (Pharmacy & Billing)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
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
            {submitting ? 'Creating Account...' : 'Complete Staff Registration'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link href="/admin/login" className="font-bold text-amber-400 underline">
            Staff Login
          </Link>
        </div>
      </div>
    </div>
  );
}
