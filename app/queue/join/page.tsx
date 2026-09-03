'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket, User, Phone, Layers, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { AadhaarVerification } from '@/components/AadhaarVerification';
import { EmailOTPVerification } from '@/components/EmailOTPVerification';
import { GeofenceVerification } from '@/components/GeofenceVerification';

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
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isLocationVerified, setIsLocationVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [symptoms, setSymptoms] = useState('');
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<{ reasoning: string; serviceName?: string; priority?: string } | null>(null);

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

  const handleRunTriage = async () => {
    if (!symptoms.trim() || services.length === 0) return;
    setTriageLoading(true);
    setTriageResult(null);
    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms, services })
      });
      const data = await res.json();
      let matchedServiceName = '';
      if (data.serviceId) {
        setSelectedServiceId(data.serviceId);
        matchedServiceName = services.find(s => s.id === data.serviceId)?.name || '';
      }
      if (data.priority) setPriority(data.priority);
      if (data.reasoning) {
        setTriageResult({ 
          reasoning: data.reasoning, 
          serviceName: matchedServiceName, 
          priority: data.priority 
        });
      }
    } catch (err) {
      console.error('Triage failed', err);
    } finally {
      setTriageLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !selectedServiceId) {
      setError('Please provide your name and select a department.');
      return;
    }
    
    if (!isAadhaarVerified || !isEmailVerified || !isLocationVerified) {
      setError('Please complete identity and location verification.');
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
          customerEmail: verifiedEmail,
          serviceId: selectedServiceId,
          type: 'WALK_IN',
          priority,
        }),
      });

      const data = await res.json();
      if (data.success && data.ticket) {
        if (data.emailSent) {
          alert('Queue Pass Generated! A confirmation email has been sent to ' + verifiedEmail);
        }
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
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Ticket className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Join Digital Queue</h1>
              <p className="text-xs text-slate-400">Get your instant digital token on your phone</p>
            </div>
          </div>
          {/* HACKATHON DEMO SHORTCUT */}
          <button
            type="button"
            onClick={() => {
              setCustomerName('Rahul Sharma');
              setCustomerPhone('9876543210');
              setSymptoms('I have a severe toothache and my gums are bleeding.');
              setVerifiedEmail('judge@hackathon.com');
              setIsAadhaarVerified(true);
              setIsEmailVerified(true);
              setIsLocationVerified(true);
            }}
            className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-[10px] font-bold uppercase text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="h-3 w-3" /> Auto-Fill Demo
          </button>
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

          {/* AI SYMPTOM TRIAGE */}
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4 shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none">
              <Sparkles className="h-16 w-16 text-indigo-400" />
            </div>
            <label className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-indigo-400 mb-3">
              <Sparkles className="h-4 w-4" /> AI Smart Triage
            </label>
            <p className="text-xs text-indigo-200/70 mb-3 font-medium pr-10">
              Not sure which department? Describe your symptoms and our AI will automatically assign you to the correct specialist and set your priority.
            </p>
            <div className="flex gap-2">
              <textarea
                rows={2}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="E.g. My chest hurts and my left arm is numb..."
                className="flex-1 rounded-xl border border-indigo-500/30 bg-slate-900/80 p-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-none"
              />
              <button
                type="button"
                onClick={handleRunTriage}
                disabled={triageLoading || !symptoms.trim()}
                className="flex flex-col items-center justify-center rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white shadow-lg shadow-indigo-900/20 hover:bg-indigo-500 transition-all disabled:opacity-50 min-w-[80px]"
              >
                {triageLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mb-1" />
                    <span>Analyze</span>
                  </>
                )}
              </button>
            </div>
            
            {triageResult && (
              <div className="mt-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 p-3 flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-emerald-400 mb-1">
                    AI Triage Complete
                  </div>
                  <div className="bg-emerald-900/40 rounded p-2 mb-1 border border-emerald-500/20">
                    <span className="text-[10px] uppercase text-emerald-300 font-bold block mb-0.5">Assigned To:</span>
                    <span className="text-xs text-white font-bold block">{triageResult.serviceName || 'General Medicine'}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded inline-block mt-1 ${triageResult.priority === 'EMERGENCY' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      PRIORITY: {triageResult.priority}
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-100/70">{triageResult.reasoning}</div>
                </div>
              </div>
            )}
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

          <div className="border-t border-slate-800 my-6 pt-6 space-y-5">
            <h3 className="text-sm font-bold text-white mb-4">Identity & Location Verification</h3>
            <GeofenceVerification onVerified={() => setIsLocationVerified(true)} />
            <AadhaarVerification onVerified={() => setIsAadhaarVerified(true)} />
            <EmailOTPVerification onVerified={(email) => { setIsEmailVerified(true); setVerifiedEmail(email); }} />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !isAadhaarVerified || !isEmailVerified || !isLocationVerified}
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
