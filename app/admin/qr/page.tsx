'use client';

import { useState } from 'react';
import { Printer, ArrowLeft, Ticket, Sparkles, QrCode } from 'lucide-react';
import Link from 'next/link';

export default function QRPosterPage() {
  const [venueName, setVenueName] = useState('City Care Super-Specialty Hospital');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 print:hidden">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Staff Dashboard
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all"
        >
          <Printer className="h-4 w-4" /> Print Venue QR Poster
        </button>
      </div>

      {/* Printable Poster Container */}
      <div className="rounded-3xl border-2 border-blue-500/30 bg-slate-900 p-8 sm:p-12 shadow-2xl text-center print:border-black print:bg-white print:text-black">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-bold text-blue-400 border border-blue-500/20 mb-6 print:hidden">
          <Sparkles className="h-4 w-4" /> Official Virtual Queue Check-In
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white print:text-black">
          {venueName}
        </h1>

        <p className="mt-3 text-lg font-medium text-slate-300 print:text-slate-700">
          Scan QR Code to Join Digital Queue on your Phone
        </p>

        {/* QR Code SVG Graphic */}
        <div className="my-8 flex justify-center">
          <div className="rounded-3xl bg-white p-6 shadow-2xl border-4 border-blue-500/20">
            <svg
              className="h-64 w-64 text-slate-950"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              {/* Decorative QR Code Representation */}
              <rect x="5" y="5" width="30" height="30" rx="4" fill="#0f172a" />
              <rect x="10" y="10" width="20" height="20" fill="#ffffff" />
              <rect x="15" y="15" width="10" height="10" fill="#0f172a" />

              <rect x="65" y="5" width="30" height="30" rx="4" fill="#0f172a" />
              <rect x="70" y="10" width="20" height="20" fill="#ffffff" />
              <rect x="75" y="15" width="10" height="10" fill="#0f172a" />

              <rect x="5" y="65" width="30" height="30" rx="4" fill="#0f172a" />
              <rect x="10" y="70" width="20" height="20" fill="#ffffff" />
              <rect x="15" y="75" width="10" height="10" fill="#0f172a" />

              {/* Data matrix dots */}
              <rect x="40" y="10" width="8" height="8" fill="#2563eb" />
              <rect x="50" y="20" width="8" height="8" fill="#0f172a" />
              <rect x="40" y="30" width="8" height="8" fill="#0f172a" />
              <rect x="10" y="40" width="8" height="8" fill="#0f172a" />
              <rect x="25" y="45" width="8" height="8" fill="#2563eb" />
              <rect x="45" y="45" width="10" height="10" fill="#0f172a" />
              <rect x="60" y="40" width="8" height="8" fill="#0f172a" />
              <rect x="75" y="45" width="8" height="8" fill="#2563eb" />
              <rect x="40" y="65" width="8" height="8" fill="#0f172a" />
              <rect x="50" y="75" width="8" height="8" fill="#0f172a" />
              <rect x="65" y="65" width="10" height="10" fill="#2563eb" />
              <rect x="80" y="75" width="8" height="8" fill="#0f172a" />
            </svg>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 text-slate-300 print:border-slate-300 print:bg-slate-100 print:text-black">
          <div className="font-bold text-sm text-blue-400 print:text-blue-700">
            No Mobile App Download Required!
          </div>
          <div className="text-xs text-slate-400 mt-1 print:text-slate-600">
            Scan with your phone camera ➔ Select department ➔ Track your queue ticket in real-time.
          </div>
        </div>
      </div>
    </div>
  );
}
