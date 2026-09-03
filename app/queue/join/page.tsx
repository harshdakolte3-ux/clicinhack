'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket, User, Phone, Layers, ArrowRight, ShieldAlert } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  prefix: string;
  avgServiceDuration: number;
  waitingTicketsCount: number;
}

export default function JoinQueuePage() {
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [priority, setPriority] = useState<string>('REGULAR');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        if (data.services && data.services.length > 0) {
          setServices(data.services);
          setSelectedServiceId(data.services[0].id);
        }
      })
      .catch((err) => setError('Failed to load services.'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !selectedServiceId) {
      setError('Please provide your name and select a department.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          serviceId: selectedServiceId,
          type: 'WALK_IN',
          priority,
        }),
      });

      const data = await res.json();
      if (data.success && data.ticket) {
        router.push(`/ticket/${data.ticket.id}`);
      } else {
        setError(data.error || 'Failed to create queue token.');
        setSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred.');
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Ticket className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Join Digital Queue</h1>
            <p className="text-xs text-slate-400">Get your instant digital token on your phone</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Customer Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Customer Phone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Mobile Phone (for Audio / Notification alerts)
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* DYNAMIC DROPDOWN SELECT: Services added by Admin */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Department / Service *
            </label>
            <div className="relative">
              <Layers className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <select
                required
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm font-semibold text-white focus:border-blue-500 focus:outline-none"
              >
                {services.length === 0 ? (
                  <option value="">No services available</option>
                ) : (
                  services.map((s) => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                      Prefix {s.prefix} - {s.name} ({s.waitingTicketsCount} waiting)
                    </option>
                  ))
                )}
              </select>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Only displaying active services configured by establishment admin.
            </p>
          </div>

          {/* DYNAMIC DROPDOWN SELECT: Priority Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Ticket Priority Tier
            </label>
            <div className="relative">
              <ShieldAlert className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm font-semibold text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="REGULAR" className="bg-slate-900 text-white">
                  Regular Walk-in (Standard queue)
                </option>
                <option value="SENIOR_CITIZEN" className="bg-slate-900 text-amber-400 font-bold">
                  Senior Citizen / Differently Abled (50% Faster Priority)
                </option>
                <option value="EMERGENCY" className="bg-slate-900 text-rose-400 font-bold">
                  Urgent / Emergency Priority (Immediate Triage Override)
                </option>
                <option value="VIP" className="bg-slate-900 text-purple-400 font-bold">
                  VIP / Express Pass
                </option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-sm font-bold text-white shadow-xl shadow-blue-600/30 hover:bg-blue-500 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <span>Generating Queue Token...</span>
            ) : (
              <>
                <span>Generate Queue Pass</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
