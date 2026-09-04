'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { SpeechAnnouncer } from '@/components/SpeechAnnouncer';
import { Monitor, Clock, Radio, Users, Volume2 } from 'lucide-react';

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

export function TVDisplayBoard() {
  const { socket, isConnected } = useSocket();

  const [counters, setCounters] = useState<Counter[]>([]);
  const [waitingTickets, setWaitingTickets] = useState<WaitingTicket[]>([]);
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
    const interval = setInterval(fetchKioskData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Real-time WebSockets Listener
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
      socket.on('queue:updated', () => fetchKioskData());

      return () => {
        socket.off('ticket:called');
        socket.off('counter:state_changed');
        socket.off('ticket:updated');
        socket.off('queue:updated');
      };
    }
  }, [socket]);

  return (
    <div className="rounded-3xl border border-purple-500/30 bg-slate-900/90 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30">
            <Monitor className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              Live TV Display Board
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                <Radio className={`h-2.5 w-2.5 ${isConnected ? 'animate-pulse text-emerald-400' : 'text-slate-500'}`} />
                Live
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Waiting room token callouts & active counter status</p>
          </div>
        </div>

        {/* TTS Announcer Controls */}
        <SpeechAnnouncer socket={socket} />
      </div>

      {/* Flashing Callout Banner */}
      {latestCallout && (
        <div className="mb-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 p-3 text-center text-white shadow-lg animate-ring-glow">
          <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-black">
            <Volume2 className="h-5 w-5 animate-bounce" />
            TOKEN {latestCallout.token} ➔ PROCEED TO {latestCallout.counter.toUpperCase()}
          </div>
        </div>
      )}

      {/* Counters Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {counters.map((c) => {
          const isFlashing = c.id === flashingCounterId;
          const currentTicket = c.currentTicket;

          return (
            <div
              key={c.id}
              className={`rounded-2xl border p-3.5 transition-all duration-300 flex flex-col justify-between min-h-[140px] ${
                isFlashing
                  ? 'border-emerald-400 bg-emerald-950/80 ring-2 ring-emerald-500 shadow-lg scale-105'
                  : currentTicket
                  ? 'border-blue-500/30 bg-slate-950 shadow-md'
                  : 'border-slate-800 bg-slate-950/40 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-200 uppercase">{c.counterNumber}</span>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                  {c.service?.prefix || 'A'}
                </span>
              </div>

              <div className="my-2 text-center">
                {currentTicket ? (
                  <div>
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-0.5 animate-pulse">
                      Now Serving
                    </div>
                    <div className="text-4xl font-black text-white font-mono tracking-tight drop-shadow-md">
                      {currentTicket.ticketNumber}
                    </div>
                    <div className="text-[11px] text-slate-300 font-medium truncate px-2 mt-1">
                      {currentTicket.customerName}
                    </div>
                  </div>
                ) : c.status === 'ON_BREAK' ? (
                  <div>
                    <div className="text-2xl font-bold text-amber-500/50 font-mono">---</div>
                    <div className="text-[10px] text-amber-500 font-bold uppercase mt-1">PAUSED - ON BREAK</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold text-slate-600 font-mono">---</div>
                    <div className="text-[10px] text-slate-500 font-medium uppercase mt-1">AVAILABLE</div>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Upcoming Tokens Footer Ticker */}
      <div className="mt-4 border-t border-slate-800/80 pt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 whitespace-nowrap">
          <Users className="h-3.5 w-3.5 text-blue-400" />
          Upcoming:
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {waitingTickets.length === 0 ? (
            <span className="text-[11px] text-slate-500 italic">No tickets waiting</span>
          ) : (
            waitingTickets.slice(0, 6).map((t, idx) => (
              <span
                key={t.id}
                className="rounded-lg bg-slate-950 px-2 py-0.5 text-[11px] font-mono font-bold text-slate-300 border border-slate-800"
              >
                #{idx + 1} {t.ticketNumber}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
