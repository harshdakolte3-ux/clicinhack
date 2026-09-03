'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { Clock, Users, CheckCircle2, AlertCircle, Volume2, ShieldAlert, ArrowLeft, Radio } from 'lucide-react';
import Link from 'next/link';

interface TicketData {
  id: string;
  ticketNumber: string;
  customerName: string;
  type: string;
  priority: string;
  status: string;
  estimatedWait: number;
  calledAt: string | null;
  completedAt: string | null;
  service: {
    name: string;
    prefix: string;
  };
  counter?: {
    counterNumber: string;
    staffName: string | null;
  } | null;
}

interface QueueInfo {
  estimatedWaitMinutes: number;
  positionInQueue: number;
  activeCountersCount: number;
  averageServiceMinutes: number;
}

export default function TicketPassPage() {
  const params = useParams();
  const ticketId = params.id as string;
  const { socket, isConnected } = useSocket();

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [queueInfo, setQueueInfo] = useState<QueueInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioAlertPlayed, setAudioAlertPlayed] = useState(false);

  // Play audio chime synthesiser when called
  const playCallChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn('Audio chime failed:', e);
    }
  };

  const fetchTicketDetails = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`);
      const data = await res.json();
      if (data.success && data.ticket) {
        setTicket(data.ticket);
        setQueueInfo(data.queueInfo);

        if (data.ticket.status === 'CALLED' && !audioAlertPlayed) {
          playCallChime();
          setAudioAlertPlayed(true);
        }
      } else {
        setError(data.error || 'Ticket not found.');
      }
      setLoading(false);
    } catch (err: any) {
      setError('Failed to fetch ticket info.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();

    const interval = setInterval(() => {
      fetchTicketDetails();
    }, 10000); // Polling backup every 10s

    return () => clearInterval(interval);
  }, [ticketId]);

  // WebSocket Listener
  useEffect(() => {
    if (socket && ticketId) {
      socket.emit('join:ticket', ticketId);

      socket.on('ticket:updated', (updatedTicket: TicketData) => {
        if (updatedTicket.id === ticketId) {
          setTicket(updatedTicket);
          if (updatedTicket.status === 'CALLED') {
            playCallChime();
          }
        }
      });

      socket.on('ticket:called', (payload: any) => {
        if (payload.ticket && payload.ticket.id === ticketId) {
          setTicket(payload.ticket);
          playCallChime();
        }
      });

      return () => {
        socket.off('ticket:updated');
        socket.off('ticket:called');
      };
    }
  }, [socket, ticketId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center text-slate-400 flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <span>Loading your digital queue pass...</span>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-400">
          <AlertCircle className="mx-auto h-12 w-12 mb-3" />
          <h2 className="text-lg font-bold">Ticket Not Found</h2>
          <p className="mt-1 text-xs">{error || 'Invalid ticket ID.'}</p>
          <Link
            href="/queue/join"
            className="mt-4 inline-block rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white"
          >
            Get New Token
          </Link>
        </div>
      </div>
    );
  }

  const isCalled = ticket.status === 'CALLED';
  const isInService = ticket.status === 'IN_SERVICE';
  const isCompleted = ticket.status === 'COMPLETED';

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      {/* Back link */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      {/* Called Banner Alert */}
      {isCalled && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 p-5 text-white shadow-xl animate-ring-glow text-center">
          <div className="flex items-center justify-center gap-2 font-black text-lg">
            <Volume2 className="h-6 w-6 animate-bounce" />
            IT'S YOUR TURN NOW!
          </div>
          <p className="mt-1 text-sm font-semibold opacity-90">
            Please proceed to <span className="underline font-extrabold">{ticket.counter?.counterNumber || 'Counter'}</span> immediately.
          </p>
        </div>
      )}

      {/* Main Ticket Card */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Connection Indicator */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold tracking-wider text-slate-400 uppercase">
            {ticket.service?.name}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300">
            <Radio className={`h-3 w-3 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            {isConnected ? 'Live Connected' : 'Connecting...'}
          </span>
        </div>

        {/* Big Token Display */}
        <div className="mt-6 text-center">
          <div className="inline-block rounded-2xl bg-blue-600/10 px-6 py-2 border border-blue-500/20 text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
            Your Digital Token
          </div>
          <div className="text-6xl sm:text-7xl font-black tracking-tight text-white font-mono bg-gradient-to-b from-white via-slate-100 to-blue-200 bg-clip-text text-transparent drop-shadow-md">
            {ticket.ticketNumber}
          </div>
          <div className="mt-2 text-sm font-medium text-slate-300">
            Passenger / Visitor: <span className="font-bold text-white">{ticket.customerName}</span>
          </div>
        </div>

        {/* Priority & Type Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {ticket.priority === 'EMERGENCY' && (
            <span className="flex items-center gap-1 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-400 border border-rose-500/30">
              <ShieldAlert className="h-3.5 w-3.5" /> Emergency Priority
            </span>
          )}
          {ticket.priority === 'SENIOR_CITIZEN' && (
            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
              Senior Citizen / Priority
            </span>
          )}
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 border border-slate-700">
            {ticket.type === 'APPOINTMENT' ? '📅 Appointment' : '🚶 Walk-in'}
          </span>
        </div>

        <hr className="my-6 border-slate-800" />

        {/* Queue Metrics & Wait Time */}
        {ticket.status === 'WAITING' && (
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-800">
              <Users className="mx-auto h-5 w-5 text-blue-400 mb-1" />
              <div className="text-2xl font-black text-white">
                {queueInfo?.positionInQueue ? `#${queueInfo.positionInQueue}` : '1'}
              </div>
              <div className="text-xs text-slate-400">Position in Line</div>
            </div>

            <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-800">
              <Clock className="mx-auto h-5 w-5 text-indigo-400 mb-1" />
              <div className="text-2xl font-black text-white">
                ~{queueInfo?.estimatedWaitMinutes ?? ticket.estimatedWait} <span className="text-xs font-normal">mins</span>
              </div>
              <div className="text-xs text-slate-400">Est. Wait Time</div>
            </div>
          </div>
        )}

        {/* Counter Info if Called or In Service */}
        {(isCalled || isInService) && (
          <div className="rounded-2xl bg-emerald-500/10 p-5 text-center border border-emerald-500/30">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Assigned Counter</div>
            <div className="mt-1 text-3xl font-black text-white">
              {ticket.counter?.counterNumber || 'Counter 1'}
            </div>
            {ticket.counter?.staffName && (
              <div className="mt-1 text-xs text-slate-300">Staff: {ticket.counter.staffName}</div>
            )}
          </div>
        )}

        {/* Completed State */}
        {isCompleted && (
          <div className="rounded-2xl bg-slate-800/80 p-5 text-center border border-slate-700">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400 mb-2" />
            <div className="text-lg font-bold text-white">Service Completed</div>
            <div className="text-xs text-slate-400 mt-1">Thank you for visiting! Your token is fulfilled.</div>
          </div>
        )}

        {/* Dynamic AI Wait Time Notice */}
        <div className="mt-6 text-center text-[11px] text-slate-500">
          💡 Wait time updates dynamically based on live counter speed & active officers.
        </div>
      </div>
    </div>
  );
}
