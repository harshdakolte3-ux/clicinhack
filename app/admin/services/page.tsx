'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers, Plus, Trash2, Building, Shield, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  prefix: string;
  avgServiceDuration: number;
  waitingTicketsCount: number;
  organization?: {
    name: string;
    category: string;
  };
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [name, setName] = useState('');
  const [prefix, setPrefix] = useState('A');
  const [avgServiceDuration, setAvgServiceDuration] = useState('10');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      if (data.services) setServices(data.services);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load services:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !prefix) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/services/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, prefix, avgServiceDuration }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        setName('');
        setPrefix('D');
        fetchServices();
      } else {
        setMessage(data.error || 'Failed to add service.');
      }
    } catch (err) {
      setMessage('Error creating service.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteService = async (id: string, serviceName: string) => {
    if (!confirm(`Are you sure you want to delete service '${serviceName}'?`)) return;

    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage(`Deleted service '${serviceName}'.`);
        fetchServices();
      }
    } catch (err) {
      setMessage('Failed to delete service.');
    }
  };

  // 1-Click Multi-Establishment Template Presets
  const applyEstablishmentPreset = async (presetName: string, presetServices: Array<{ name: string; prefix: string; duration: number }>) => {
    if (!confirm(`Apply preset for '${presetName}'? This will configure departments for ${presetName}.`)) return;
    setSubmitting(true);
    setMessage(null);

    try {
      for (const s of presetServices) {
        await fetch('/api/services/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: s.name, prefix: s.prefix, avgServiceDuration: s.duration }),
        });
      }
      setMessage(`✅ Configured departments for ${presetName}!`);
      fetchServices();
    } catch (err) {
      setMessage('Failed to apply preset.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <Link href="/admin/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Staff Dashboard
          </Link>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Layers className="h-8 w-8 text-amber-500" />
            Service & Department Management
          </h1>
          <p className="text-sm text-slate-400">
            Configure dynamic departments & services for any Institution, Bank, Hospital, School, or Retail Store
          </p>
        </div>
      </div>

      {message && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs font-semibold text-amber-400">
          {message}
        </div>
      )}

      {/* Multi-Establishment Presets Bar */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          Quick Institution Presets (1-Click Setup for Any Shop / Bank / Facility)
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            onClick={() =>
              applyEstablishmentPreset('National Bank', [
                { name: 'Cash Deposit & Withdrawal', prefix: 'A', duration: 5 },
                { name: 'Loan & Credit Services', prefix: 'B', duration: 15 },
                { name: 'Forex & Accounts', prefix: 'C', duration: 10 },
              ])
            }
            className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-left hover:border-amber-500/40 transition-all"
          >
            <div className="text-lg">🏦</div>
            <div className="font-bold text-sm text-white mt-1">Bank / Finance</div>
            <div className="text-[11px] text-slate-500">Cash, Loans, Forex</div>
          </button>

          <button
            onClick={() =>
              applyEstablishmentPreset('City Hospital', [
                { name: 'General Medicine OPD', prefix: 'A', duration: 8 },
                { name: 'Pediatrics & Vaccination', prefix: 'B', duration: 12 },
                { name: 'Pharmacy & Billing', prefix: 'C', duration: 5 },
              ])
            }
            className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-left hover:border-amber-500/40 transition-all"
          >
            <div className="text-lg">🏥</div>
            <div className="font-bold text-sm text-white mt-1">Hospital / Clinic</div>
            <div className="text-[11px] text-slate-500">OPD, Pediatrics, Pharmacy</div>
          </button>

          <button
            onClick={() =>
              applyEstablishmentPreset('Retail Store / Service Center', [
                { name: 'Billing & Checkout Counter', prefix: 'A', duration: 4 },
                { name: 'Customer Support & Returns', prefix: 'B', duration: 10 },
                { name: 'Device Repair Service', prefix: 'C', duration: 20 },
              ])
            }
            className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-left hover:border-amber-500/40 transition-all"
          >
            <div className="text-lg">🛍️</div>
            <div className="font-bold text-sm text-white mt-1">Shop / Retail Store</div>
            <div className="text-[11px] text-slate-500">Checkout, Support, Repairs</div>
          </button>

          <button
            onClick={() =>
              applyEstablishmentPreset('Government Facilitation Center', [
                { name: 'Passport & Identity Verification', prefix: 'A', duration: 12 },
                { name: 'Driving License Issue', prefix: 'B', duration: 15 },
                { name: 'Public Grievance Desk', prefix: 'C', duration: 10 },
              ])
            }
            className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-left hover:border-amber-500/40 transition-all"
          >
            <div className="text-lg">🏛️</div>
            <div className="font-bold text-sm text-white mt-1">Govt Office / Public</div>
            <div className="text-[11px] text-slate-500">Passports, Licenses</div>
          </button>
        </div>
      </div>

      {/* Main Grid: Add Service Form (5 cols) + Active Services List (7 cols) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Add Service Form */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-amber-500/30 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Plus className="h-5 w-5 text-amber-400" />
              Add Custom Service / Department
            </h3>

            <form onSubmit={handleAddService} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Service / Department Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Account Clearance / Dental OPD"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 px-4 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Token Prefix *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    placeholder="e.g. A, B, C"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 px-4 text-sm text-white font-mono uppercase focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Avg Visit Duration (Mins)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={avgServiceDuration}
                    onChange={(e) => setAvgServiceDuration(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 px-4 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-600/30 hover:bg-amber-500 transition-all disabled:opacity-50"
              >
                {submitting ? 'Creating Service...' : 'Add Department to System'}
              </button>
            </form>
          </div>
        </div>

        {/* Active Services List Table */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-4">
              Active Services Added by Admin ({services.length})
            </h3>

            {services.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No services added yet. Add a service above or select a preset!
              </div>
            ) : (
              <div className="space-y-3">
                {services.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 font-mono text-sm font-bold text-amber-400 border border-amber-500/20">
                        {s.prefix}
                      </span>
                      <div>
                        <div className="font-semibold text-sm text-white">{s.name}</div>
                        <div className="text-xs text-slate-500">~{s.avgServiceDuration} mins average duration</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-300">
                        {s.waitingTicketsCount} waiting
                      </span>
                      <button
                        onClick={() => handleDeleteService(s.id, s.name)}
                        className="rounded-lg bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-600 hover:text-white transition-all"
                        title="Delete Service"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
