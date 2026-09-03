'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { TVDisplayBoard } from '@/components/TVDisplayBoard';
import {
  Shield,
  Volume2,
  CheckCircle2,
  XCircle,
  Users,
  Play,
  UserCheck,
  TrendingUp,
  Printer,
  Layers,
  LogOut,
  Home
} from 'lucide-react';
import Link from 'next/link';

interface Counter {
  id: string;
  counterNumber: string;
  staffName: string | null;
  status: string;
  serviceId: string | null;
  service?: {
    name: string;
    prefix: string;
  };
  currentTicket?: Ticket | null;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerPhone?: string;
  type: string;
  priority: string;
  status: string;
  serviceId: string;
  estimatedWait: number;
  joinedAt: string;
  calledAt?: string | null;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { socket, isConnected } = useSocket();

  const [staffUser, setStaffUser] = useState<any>(null);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [selectedCounterId, setSelectedCounterId] = useState<string>('');
  const [waitingTickets, setWaitingTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Authentication check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('staffUser');
      if (!stored) {
        router.push('/admin/login');
      } else {
        try {
          setStaffUser(JSON.parse(stored));
        } catch (e) {}
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('staffUser');
    setStaffUser(null);
    router.push('/admin/login');
  };

  const fetchDashboardData = async () => {
    try {
      const [counterRes, ticketRes] = await Promise.all([
        fetch('/api/counters'),
        fetch('/api/tickets?status=WAITING'),
      ]);

      const counterData = await counterRes.json();
      const ticketData = await ticketRes.json();

      if (counterData.counters) {
        setCounters(counterData.counters);
        if (!selectedCounterId && counterData.counters.length > 0) {
          setSelectedCounterId(counterData.counters[0].id);
        }
      }

      if (ticketData.tickets) {
        setWaitingTickets(ticketData.tickets);
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Socket.io Real-Time Event Listener
  useEffect(() => {
    if (socket) {
      socket.emit('join:counter', selectedCounterId);

      socket.on('ticket:created', () => fetchDashboardData());
      socket.on('ticket:updated', () => fetchDashboardData());
      socket.on('counter:state_changed', () => fetchDashboardData());

      return () => {
        socket.off('ticket:created');
        socket.off('ticket:updated');
        socket.off('counter:state_changed');
      };
    }
  }, [socket, selectedCounterId]);

  const activeCounter = counters.find((c) => c.id === selectedCounterId) || counters[0];
  const currentTicket = activeCounter?.currentTicket;

  // Dispatch Next Ticket to Counter
  const handleCallNext = async () => {
    if (!selectedCounterId) return;
    setActionLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/counters/${selectedCounterId}/next`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setMessage(`📢 Dispatched Ticket ${data.ticket.ticketNumber} to ${activeCounter.counterNumber}`);
        fetchDashboardData();
      } else {
        setMessage(data.message || data.error || 'No waiting tickets found for this counter service.');
      }
    } catch (err: any) {
      setMessage('Failed to dispatch next ticket.');
    } finally {
      setActionLoading(false);
    }
  };

  // Update Ticket Status Action
  const handleUpdateStatus = async (ticketId: string, status: string) => {
    setActionLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, counterId: selectedCounterId }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Ticket ${data.ticket.ticketNumber} updated to ${status}.`);
        fetchDashboardData();
      } else {
        setMessage(data.error || 'Failed to update status.');
      }
    } catch (err) {
      setMessage('Error updating ticket status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center text-slate-400 flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <span>Loading Staff Control Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Status Bar */}
      {message && (
        <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-3 text-xs font-semibold text-blue-400">
          {message}
        </div>
      )}

      {/* 1. GIANT TOP CONTAINER: Groups "Current Ticket" and "Counter/Queue" together */}
      <div className="rounded-[2rem] border border-slate-800 bg-[#0A1128] p-6 sm:p-10 shadow-2xl overflow-hidden relative">
        
        {/* A. Current Ticket Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-500 drop-shadow-md">
                {activeCounter?.counterNumber} • {activeCounter?.service?.name}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Current Ticket in Service</h2>
            </div>
            {/* Optional Staff indicator, hidden in original img to keep clean but useful */}
            <span className="hidden sm:flex rounded-full bg-slate-800/50 px-3.5 py-1 text-xs font-bold text-slate-300 border border-slate-700 items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5" />
              {staffUser?.name || activeCounter?.staffName || 'Officer'}
            </span>
          </div>

          {currentTicket ? (
            <div className="rounded-2xl bg-[#0F172A] p-6 border border-slate-800/80 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-5xl font-black text-white font-mono tracking-tight">
                    {currentTicket.ticketNumber}
                  </div>
                  <div className="mt-2 text-base font-semibold text-slate-200">
                    {currentTicket.customerName}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                    <span className="rounded bg-slate-800 px-2 py-0.5 font-semibold text-slate-300">
                      {currentTicket.priority}
                    </span>
                    <span>•</span>
                    <span>Joined {new Date(currentTicket.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-1">
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                    {currentTicket.status}
                  </span>
                  {currentTicket.calledAt && (
                    <span className="text-[11px] text-slate-500">
                      Called at {new Date(currentTicket.calledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>

              {/* Tactile Actions Bar */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <button
                  onClick={() => handleUpdateStatus(currentTicket.id, 'IN_SERVICE')}
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-all disabled:opacity-50"
                >
                  <Play className="h-4 w-4" /> Start Service
                </button>

                <button
                  onClick={() => handleUpdateStatus(currentTicket.id, 'COMPLETED')}
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" /> Complete
                </button>

                <button
                  onClick={() => handleUpdateStatus(currentTicket.id, 'CALLED')}
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 py-3 text-xs font-bold text-white shadow-md hover:bg-amber-500 transition-all disabled:opacity-50"
                >
                  <Volume2 className="h-4 w-4" /> Recall Token
                </button>

                <button
                  onClick={() => handleUpdateStatus(currentTicket.id, 'NO_SHOW')}
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-3 text-xs font-bold text-white shadow-md hover:bg-rose-500 transition-all disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" /> No-Show
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-[#060B19] py-16 px-6 text-center shadow-inner flex flex-col items-center justify-center mb-6">
              <div className="h-12 w-12 rounded-full border-[3px] border-slate-700/50 flex items-center justify-center mb-4">
                 <div className="h-6 w-6 animate-pulse rounded-full bg-slate-600/40" />
              </div>
              <p className="text-sm font-semibold text-slate-500">Click below to dispatch the next ticket in queue.</p>
            </div>
          )}

          {/* Primary Action Button: CALL NEXT TICKET FOR COUNTER X */}
          <div className="mt-6">
            <button
              onClick={handleCallNext}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 rounded-[1rem] bg-[#FF6B00] py-4 text-base font-black text-white shadow-xl shadow-orange-900/20 hover:bg-[#FF8533] transition-all disabled:opacity-50"
            >
              <Volume2 className="h-5 w-5 fill-current" />
              <span>CALL NEXT TICKET FOR {activeCounter?.counterNumber?.toUpperCase()}</span>
            </button>
          </div>
        </div>

        {/* B. Middle Row Section (Counters & Queue inside the same giant container) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: SELECT OPERATING COUNTER (7 Cols) */}
          <div className="lg:col-span-7">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              SELECT OPERATING COUNTER
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {counters.map((c) => {
                const isSelected = c.id === selectedCounterId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCounterId(c.id)}
                    className={`flex flex-col items-start rounded-2xl border p-4 text-left transition-all h-full ${
                      isSelected
                        ? 'border-amber-600/50 bg-[#2D1B0F] shadow-lg ring-1 ring-amber-500/30'
                        : 'border-slate-800/50 bg-[#0F172A] hover:border-slate-700'
                    }`}
                  >
                    <span className={`font-extrabold text-sm ${isSelected ? 'text-white' : 'text-white'}`}>
                      {c.counterNumber}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate w-full mt-0.5 leading-tight">
                      {c.service?.name}
                    </span>
                    <div className="mt-auto pt-3 w-full">
                      <span className={`inline-block rounded-md px-2 py-1 text-[10px] font-bold w-full truncate ${isSelected ? 'bg-[#1E293B] text-slate-200' : 'bg-[#1E293B] text-slate-300'}`}>
                        {c.currentTicket ? `Active: ${c.currentTicket.ticketNumber}` : 'Idle'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Live Waiting Queue Stream (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-800/60 bg-[#0F172A] p-5 h-full flex flex-col shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-500" />
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">
                      Live Waiting Queue
                    </h3>
                    <p className="text-[11px] text-slate-400">{waitingTickets.length} customers in line</p>
                  </div>
                </div>
                <span className="rounded bg-amber-900/30 px-2 py-1 text-[10px] font-bold text-amber-500 border border-amber-700/30 flex items-center gap-1 text-center leading-tight max-w-[80px]">
                  Sorted by Priority
                </span>
              </div>

              {waitingTickets.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 flex-1 flex items-center justify-center">
                  Queue is empty
                </div>
              ) : (
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 flex-1">
                  {waitingTickets.map((t, idx) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between rounded-xl bg-[#1E293B] p-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-700 font-mono text-[10px] font-bold text-slate-300">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="font-mono font-bold text-sm text-white leading-none">{t.ticketNumber}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[100px] sm:max-w-[120px]">{t.customerName}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {t.priority === 'EMERGENCY' && (
                          <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-400 border border-rose-500/30">
                            EMERGENCY
                          </span>
                        )}
                        {t.priority === 'SENIOR_CITIZEN' && (
                          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-500/30">
                            SENIOR
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500">~{t.estimatedWait}m</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. STAFF NAVIGATION TOOLBAR (Full Width, breaking out of the container styling) */}
      <div className="bg-[#0B0F19] border-y border-slate-800/80 p-3 flex flex-wrap items-center justify-between gap-3 shadow-xl -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 font-bold text-white text-xs">
              Q
            </div>
            <span className="text-sm font-bold text-white">SmartQueue</span>
          </Link>
          <span className="rounded bg-amber-900/40 px-2 py-0.5 text-[10px] font-bold text-amber-500 border border-amber-700/50">
            Staff Portal
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1.5 rounded-lg bg-[#2D1B0F] px-3 py-1.5 text-xs font-bold text-amber-500 border border-amber-700/30"
          >
            <Shield className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Counter Panel</span>
          </Link>

          <Link
            href="/admin/services"
            className="flex items-center gap-1.5 rounded-lg px-2 sm:px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white"
          >
            <Layers className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Services & Presets</span>
          </Link>

          <Link
            href="/admin/analytics"
            className="flex items-center gap-1.5 rounded-lg px-2 sm:px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white"
          >
            <TrendingUp className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Analytics</span>
          </Link>

          <Link
            href="/admin/qr"
            className="flex items-center gap-1.5 rounded-lg px-2 sm:px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white"
          >
            <Printer className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Print QR</span>
          </Link>

          {staffUser && (
            <div className="flex items-center gap-2 ml-1 sm:ml-2 border-l border-slate-800 pl-2 sm:pl-3">
              <span className="text-[10px] sm:text-xs font-bold text-amber-500 uppercase tracking-wider max-w-[80px] sm:max-w-none truncate">
                {staffUser.name}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 rounded bg-rose-500/10 border border-rose-500/20 px-2 py-1 text-[10px] sm:text-xs font-bold text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
              >
                <LogOut className="h-3 w-3" /> <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. BOTTOM SECTION: Embedded Live TV Display Board */}
      <div className="pt-4">
        <TVDisplayBoard />
      </div>
    </div>
  );
}
