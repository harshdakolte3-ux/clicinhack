'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, User, Phone, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AadhaarVerification } from '@/components/AadhaarVerification';
import { EmailOTPVerification } from '@/components/EmailOTPVerification';

interface Service {
  id: string;
  name: string;
  prefix: string;
  avgServiceDuration: number;
}

export default function BookAppointmentPage() {
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('10:30 AM');
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeSlots = ['09:00 AM', '10:00 AM', '10:30 AM', '11:15 AM', '02:00 PM', '03:30 PM', '04:15 PM'];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !selectedServiceId) {
      setError('Please fill in required fields.');
      return;
    }
    
    if (!isAadhaarVerified || !isEmailVerified) {
      setError('Please complete identity verification.');
      return;
    }

    setSubmitting(true);
    setError(null);

    // Compute ISO datetime string for today + selected slot
    const now = new Date();
    const scheduledTime = new Date(now.toDateString() + ' ' + selectedTimeSlot).toISOString();

    try {
      const res = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail: verifiedEmail,
          serviceId: selectedServiceId,
          type: 'APPOINTMENT',
          priority: 'REGULAR',
          scheduledTime,
        }),
      });

      const data = await res.json();
      if (data.success && data.ticket) {
        if (data.emailSent) {
          alert('Booking Confirmed! A confirmation email has been sent to ' + verifiedEmail);
        }
        router.push(`/ticket/${data.ticket.id}`);
      } else {
        setError(data.error || 'Failed to book appointment.');
        setSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred.');
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Book Advance Appointment</h1>
            <p className="text-xs text-slate-400">Pre-schedule your visit to skip walk-in delays</p>
          </div>
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
                placeholder="e.g. Priya Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Customer Phone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Department Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Department *
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 px-4 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (Prefix {s.prefix})
                </option>
              ))}
            </select>
          </div>

          {/* Time Slot Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Available Time Slot Today
            </label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setSelectedTimeSlot(slot)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                    selectedTimeSlot === slot
                      ? 'border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800 my-6 pt-6 space-y-5">
            <h3 className="text-sm font-bold text-white mb-4">Identity Verification</h3>
            <AadhaarVerification onVerified={() => setIsAadhaarVerified(true)} />
            <EmailOTPVerification onVerified={(email) => { setIsEmailVerified(true); setVerifiedEmail(email); }} />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !isAadhaarVerified || !isEmailVerified}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <span>Reserving Appointment Slot...</span>
            ) : (
              <>
                <span>Confirm Appointment Booking</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
