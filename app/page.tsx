'use client';

import Link from 'next/link';
import { TVDisplayBoard } from '@/components/TVDisplayBoard';
import { Ticket, Calendar, Monitor, ArrowRight, Sparkles } from 'lucide-react';

export default function ClientHomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Panel 1: Full-Width Welcome Banner & Side-By-Side Action Cards */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 p-6 sm:p-10 border border-blue-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-400 border border-blue-500/20 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Customer & Visitor Digital Queue Portal
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Skip Physical Lines. <br />
            <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Track Your Live Queue on Mobile.
            </span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-3xl">
            Join live walk-in queues remotely or pre-book advance appointment slots. Get instant voice callouts and real-time position updates straight to your device.
          </p>

          {/* Primary Action Cards - STRICT SIDE-BY-SIDE HORIZONTAL LAYOUT */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 w-full">
            {/* Left Card: Walk-In Queue Token */}
            <Link
              href="/queue/join"
              className="group relative overflow-hidden flex flex-col justify-between rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-5 sm:p-7 text-white shadow-xl shadow-blue-600/25 border border-blue-400/30 hover:from-blue-500 hover:to-blue-600 transition-all hover:scale-[1.01]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/20 text-white shadow-md">
                    <Ticket className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">
                    Walk-in Token
                  </span>
                </div>
                <h3 className="mt-4 sm:mt-6 text-lg sm:text-2xl font-black">Join Digital Queue</h3>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-blue-100 leading-relaxed">
                  Get an instant walk-in token number & track your live position in queue on your phone.
                </p>
              </div>
              <div className="mt-6 sm:mt-8 flex items-center gap-2 text-xs sm:text-sm font-extrabold">
                <span>Get Token Now</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Right Card: Advance Slot Booking */}
            <Link
              href="/book"
              className="group relative overflow-hidden flex flex-col justify-between rounded-2xl bg-slate-900/90 border border-slate-700/80 p-5 sm:p-7 text-white shadow-xl hover:border-indigo-500/60 hover:bg-slate-850 transition-all hover:scale-[1.01]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] sm:text-xs font-extrabold text-indigo-400 border border-indigo-500/20">
                    Scheduled Slot
                  </span>
                </div>
                <h3 className="mt-4 sm:mt-6 text-lg sm:text-2xl font-black">Book Appointment</h3>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Select your preferred date & time slot to bypass waiting lines completely.
                </p>
              </div>
              <div className="mt-6 sm:mt-8 flex items-center gap-2 text-xs sm:text-sm font-extrabold text-indigo-400">
                <span>Select Time Slot</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Panel 2: Full-Width Embedded Live TV Display Board */}
      <div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Monitor className="h-4 w-4 text-purple-400" />
          Live Waiting Room TV Display Board (Full Screen Width)
        </div>
        <TVDisplayBoard />
      </div>
    </div>
  );
}
