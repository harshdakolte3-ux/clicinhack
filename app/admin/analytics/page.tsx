'use client';

import { useEffect, useState } from 'react';
import { Shield, Clock, Users, CheckCircle2, RotateCcw, TrendingUp, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AnalyticsData {
  summary: {
    totalTickets: number;
    completedTickets: number;
    waitingTickets: number;
    inServiceTickets: number;
    noShowTickets: number;
    avgHandlingTimeMinutes: number;
  };
  serviceStats: Array<{
    id: string;
    name: string;
    prefix: string;
    total: number;
    waiting: number;
    completed: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      if (data.success) {
        setAnalytics(data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleResetDemo = async () => {
    if (!confirm('Are you sure you want to reset the database and seed fresh demo data?')) return;
    setResetting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMessage('✅ Database successfully reset and seeded with fresh demo data!');
        fetchAnalytics();
      } else {
        setMessage('Failed to reset demo data.');
      }
    } catch (err) {
      setMessage('Error executing reset.');
    } finally {
      setResetting(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center text-slate-400 flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <span>Loading Operations Analytics...</span>
        </div>
      </div>
    );
  }

  const { summary, serviceStats } = analytics;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <Link href="/admin/dashboard" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Staff Dashboard
          </Link>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            Operations Analytics Command Center
          </h1>
          <p className="text-sm text-slate-400">Real-time queue performance, handling speeds, and service throughput</p>
        </div>

        {/* Demo Seed Button */}
        <button
          onClick={handleResetDemo}
          disabled={resetting}
          className="flex items-center gap-2 rounded-xl bg-rose-600/20 border border-rose-500/30 px-4 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50 shadow-md"
        >
          <RotateCcw className={`h-4 w-4 ${resetting ? 'animate-spin' : ''}`} />
          {resetting ? 'Resetting Demo Data...' : 'Reset & Seed Demo Data'}
        </button>
      </div>

      {message && (
        <div className="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-semibold text-emerald-400">
          {message}
        </div>
      )}

      {/* KPI Cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Tickets</span>
            <Users className="h-5 w-5 text-blue-400" />
          </div>
          <div className="mt-3 text-4xl font-black text-white">{summary.totalTickets}</div>
          <div className="mt-1 text-xs text-slate-500">Processed today</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Visits</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="mt-3 text-4xl font-black text-emerald-400">{summary.completedTickets}</div>
          <div className="mt-1 text-xs text-slate-500">Successfully served</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Currently Waiting</span>
            <Clock className="h-5 w-5 text-amber-400" />
          </div>
          <div className="mt-3 text-4xl font-black text-amber-400">{summary.waitingTickets}</div>
          <div className="mt-1 text-xs text-slate-500">Active in queue</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Handling Time</span>
            <Clock className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="mt-3 text-4xl font-black text-indigo-400">
            ~{summary.avgHandlingTimeMinutes} <span className="text-sm font-normal text-slate-400">mins</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">Per customer visit</div>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-4">Department & Service Breakdown</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs font-bold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Service Name</th>
                <th className="py-3.5 px-4">Prefix</th>
                <th className="py-3.5 px-4">Total Tokens</th>
                <th className="py-3.5 px-4">Waiting</th>
                <th className="py-3.5 px-4">Completed</th>
                <th className="py-3.5 px-4">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {serviceStats.map((s) => {
                const rate = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
                return (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="py-4 px-4 font-semibold text-white">{s.name}</td>
                    <td className="py-4 px-4 font-mono font-bold text-blue-400">{s.prefix}</td>
                    <td className="py-4 px-4 font-bold text-white">{s.total}</td>
                    <td className="py-4 px-4 text-amber-400 font-bold">{s.waiting}</td>
                    <td className="py-4 px-4 text-emerald-400 font-bold">{s.completed}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${rate}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-300">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
