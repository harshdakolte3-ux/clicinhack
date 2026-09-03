'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSocket } from '@/hooks/useSocket';
import { SpeechAnnouncer } from '@/components/SpeechAnnouncer';
import { Monitor, Clock, Radio, Users, Volume2, ArrowLeft } from 'lucide-react';

interface Counter {
  id: string;
  counterNumber: string;
  staffName: string | null;
  status: string;
  service?: {
    name: string;
    prefix: string;
  };
  currentTicket?: {
    id: string;
    ticketNumber: string;
    customerName: string;
    status: string;
    priority: string;
  } | null;
}

interface WaitingTicket {
  id: string;
  ticketNumber: string;
  customerName: string;
  priority: string;
}

export default function TVKioskDisplayPage() {
  const { socket, isConnected } = useSocket();

  const [counters, setCounters] = useState<Counter[]>([]);
  const [waitingTickets, setWaitingTickets] = useState<WaitingTicket[]>([]);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [flashingCounterId, setFlashingCounterId] = useState<string | null>(null);
  const [latestCallout, setLatestCallout] = useState<{ token: string; counter: string } | null>(null);

  const fetchKioskData = async () => {
    try {
      const [counterRes, ticketRes] = await Promise.all([
        fetch('/api/counters'),
        fetch('/api/tickets?status=WAITING'),
      ]);

      const counterData = await counterRes.json();
      const ticketData = await ticketRes.json();

      if (counterData.counters) setCounters(counterData.counters);
      if (ticketData.tickets) setWaitingTickets(ticketData.tickets);
    } catch (err) {
      console.error('Failed to fetch kiosk data:', err);
    }
  };

  useEffect(() => {
    fetchKioskData();
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    const interval = setInterval(fetchKioskData, 10000);

    return () => {
      clearInterval(timer);
      clearInterval(interval);
    };
  }, []);

  // Socket.io Real-Time Event Listener
  useEffect(() => {
    if (socket) {
      socket.emit('join:tv');

      socket.on('ticket:called', (payload: any) => {
        if (payload && payload.ticket && payload.counter) {
          setFlashingCounterId(payload.counter.id);
          setLatestCallout({
            token: payload.ticket.ticketNumber,
            counter: payload.counter.counterNumber,
          });

          fetchKioskData();

          setTimeout(() => {
            setFlashingCounterId(null);
          }, 8000);
        }
      });

      socket.on('counter:state_changed', () => fetchKioskData());
      socket.on('ticket:updated', () => fetchKioskData());

      return () => {
        socket.off('ticket:called');
        socket.off('counter:state_changed');
        socket.off('ticket:updated');
      };
    }
  }, [socket]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans">
      {/* Top Navigation & Header Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Portal</span>
          </Link>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/30 font-black text-xl">
            Q
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              City Care Super-Specialty Hospital
            </h1>
            <p className="text-xs font-semibold text-blue-400">
              Live Token Callout & Counter Status Board
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* TTS Speech Announcer */}
          <SpeechAnnouncer socket={socket} />

          {/* Clock */}
          <div className="flex items-center gap-2 rounded-2xl bg-slate-950 border border-slate-800 px-4 py-2 text-base font-mono font-bold text-slate-200">
            <Clock className="h-4 w-4 text-blue-400" />
            {currentTime || '10:00 AM'}
          </div>
        </div>
      </header>

      {/* Latest Callout Banner (Flashing) */}
      {latestCallout && (
        <div className="mt-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 p-6 text-center text-white shadow-2xl animate-ring-glow">
          <div className="flex items-center justify-center gap-3 text-2xl sm:text-4xl font-black">
            <Volume2 className="h-8 w-8 animate-bounce" />
            TOKEN {latestCallout.token} ➔ PLEASE PROCEED TO {latestCallout.counter.toUpperCase()}
          </div>
        </div>
      )}

      {/* Main Active Counters Matrix */}
      <main className="mt-6 flex-1">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {counters.map((c) => {
            const isFlashing = c.id === flashingCounterId;
            const currentTicket = c.currentTicket;

            return (
              <div
                key={c.id}
                className={`relative overflow-hidden rounded-3xl border p-6 transition-all duration-500 flex flex-col justify-between min-h-[260px] ${
                  isFlashing
                    ? 'border-emerald-400 bg-gradient-to-b from-emerald-950/80 to-slate-900 ring-4 ring-emerald-500/50 scale-105 shadow-2xl'
                    : currentTicket
                    ? 'border-blue-500/40 bg-slate-900/90 shadow-xl'
                    : 'border-slate-800 bg-slate-900/40 opacity-75'
                }`}
              >
                {/* Counter Header */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black tracking-wider text-white uppercase">
                    {c.counterNumber}
                  </span>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300 border border-slate-700">
                    {c.service?.prefix ? `Prefix ${c.service.prefix}` : 'General'}
                  </span>
                </div>

                <div className="text-xs text-slate-400 mt-1 font-semibold truncate">
                  {c.staffName || c.service?.name}
                </div>

                {/* Big Token Number Display */}
                <div className="my-6 text-center">
                  {currentTicket ? (
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">
                        NOW SERVING
                      </div>
                      <div className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-white drop-shadow-lg">
                        {currentTicket.ticketNumber}
                      </div>
                      <div className="mt-2 text-sm font-semibold text-slate-300 truncate">
                        {currentTicket.customerName}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl font-extrabold text-slate-600 font-mono">---</div>
                      <div className="mt-2 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                        COUNTER AVAILABLE
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Service Name */}
                <div className="border-t border-slate-800/80 pt-3 text-center text-xs font-semibold text-blue-400 truncate">
                  {c.service?.name || 'General Service'}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Bottom Upcoming Waiting Tokens Ticker */}
      <footer className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-300 whitespace-nowrap">
            <Users className="h-5 w-5 text-blue-400" />
            Upcoming Tokens Waiting:
          </div>

          <div className="flex flex-wrap items-center gap-2 overflow-x-auto">
            {waitingTickets.length === 0 ? (
              <span className="text-xs text-slate-500 italic">No waiting tickets in line</span>
            ) : (
              waitingTickets.slice(0, 8).map((t, idx) => (
                <span
                  key={t.id}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-mono font-bold ${
                    t.priority === 'EMERGENCY'
                      ? 'border-rose-500/40 bg-rose-500/10 text-rose-400'
                      : t.priority === 'SENIOR_CITIZEN'
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                      : 'border-slate-800 bg-slate-950 text-slate-300'
                  }`}
                >
                  <span className="text-[10px] text-slate-500 font-sans">#{idx + 1}</span>
                  {t.ticketNumber}
                </span>
              ))
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
