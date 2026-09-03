'use client';

import { useState, useEffect } from 'react';
import { Printer, ArrowLeft, Sparkles, QrCode, UserCircle, Users } from 'lucide-react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

interface Service {
  id: string;
  name: string;
  prefix: string;
}

export default function QRPosterPage() {
  const [venueName] = useState('City Care Super-Specialty Hospital');
  const [services, setServices] = useState<Service[]>([]);
  const [qrType, setQrType] = useState<'PATIENT' | 'STAFF'>('PATIENT');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        if (data.services) {
          setServices(data.services);
          if (data.services.length > 0) {
            setSelectedServiceId(data.services[0].id);
          }
        }
      });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const getQRUrl = () => {
    if (!baseUrl) return '';
    if (qrType === 'PATIENT') {
      return `${baseUrl}/queue/join`;
    } else {
      const selectedService = services.find(s => s.id === selectedServiceId);
      if (!selectedService) return baseUrl;
      const staffEmail = `staff.${selectedService.prefix.toLowerCase()}@smartqueue.com`;
      return `${baseUrl}/admin/login?email=${encodeURIComponent(staffEmail)}`;
    }
  };

  const qrUrl = getQRUrl();

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
          <Printer className="h-4 w-4" /> Print QR Poster
        </button>
      </div>

      {/* QR Settings Panel (Hidden on Print) */}
      <div className="mb-8 rounded-2xl bg-slate-900 border border-slate-800 p-6 print:hidden">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <QrCode className="h-4 w-4 text-blue-400" /> QR Code Generator Settings
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Target Audience</label>
            <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800">
              <button
                onClick={() => setQrType('PATIENT')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${qrType === 'PATIENT' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                <Users className="h-4 w-4" /> Patients
              </button>
              <button
                onClick={() => setQrType('STAFF')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${qrType === 'STAFF' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                <UserCircle className="h-4 w-4" /> Staff Only
              </button>
            </div>
          </div>

          {qrType === 'STAFF' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Select Department</label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-4 text-sm font-semibold text-white focus:border-amber-500 focus:outline-none"
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name} Operator</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Printable Poster Container */}
      <div className="rounded-3xl border-2 border-blue-500/30 bg-slate-900 p-8 sm:p-12 shadow-2xl text-center print:border-black print:bg-white print:text-black">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-bold text-blue-400 border border-blue-500/20 mb-6 print:hidden">
          <Sparkles className="h-4 w-4" /> {qrType === 'PATIENT' ? 'Official Virtual Queue Check-In' : 'Authorized Staff Login Portal'}
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white print:text-black">
          {qrType === 'PATIENT' ? venueName : (services.find(s => s.id === selectedServiceId)?.name || 'Staff Panel')}
        </h1>

        <p className="mt-3 text-lg font-medium text-slate-300 print:text-slate-700">
          {qrType === 'PATIENT' ? 'Scan QR Code to Join Digital Queue on your Phone' : 'Scan to access Counter Dashboard & Controls'}
        </p>

        {/* Real QR Code Graphic */}
        <div className="my-8 flex justify-center">
          <div className="rounded-3xl bg-white p-6 shadow-2xl border-4 border-blue-500/20">
            {qrUrl ? (
              <QRCodeSVG value={qrUrl} size={256} fgColor="#0f172a" />
            ) : (
              <div className="h-64 w-64 flex items-center justify-center bg-slate-100 text-slate-400 rounded-xl">Generating...</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 text-slate-300 print:border-slate-300 print:bg-slate-100 print:text-black">
          <div className="font-bold text-sm text-blue-400 print:text-blue-700">
            {qrType === 'PATIENT' ? 'No Mobile App Download Required!' : 'Authorized Personnel Only'}
          </div>
          <div className="text-xs text-slate-400 mt-1 print:text-slate-600">
            {qrType === 'PATIENT' 
              ? 'Scan with your phone camera -> Select department -> Track your queue ticket in real-time.' 
              : `Point your iPad or Phone camera here to instantly login to the ${services.find(s => s.id === selectedServiceId)?.name || ''} counter.`}
          </div>
        </div>
      </div>
    </div>
  );
}
