'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, History, Users, ArrowLeft, Search, Filter } from 'lucide-react';
import Link from 'next/link';

interface Ticket {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerPhone: string;
  type: string;
  priority: string;
  status: string;
  joinedAt: string;
  calledAt: string | null;
  completedAt: string | null;
  serviceId: string;
  service?: { name: string };
  counter?: { counterNumber: string };
}

interface Service {
  id: string;
  name: string;
}

export default function HistoryPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [staffUser, setStaffUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('staffUser');
    if (storedUser) {
      try {
        setStaffUser(JSON.parse(storedUser));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketRes, serviceRes] = await Promise.all([
          fetch('/api/tickets?status=COMPLETED'),
          fetch('/api/services')
        ]);
        const ticketData = await ticketRes.json();
        const serviceData = await serviceRes.json();

        if (ticketData.tickets) {
          // Sort by completedAt descending
          const sorted = ticketData.tickets.sort((a: any, b: any) => 
            new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime()
          );
          setTickets(sorted);
        }
        if (serviceData.services) {
          setServices(serviceData.services);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter logic
  const filteredTickets = tickets.filter(t => {
    // Service filter
    if (selectedServiceId !== 'ALL' && t.serviceId !== selectedServiceId) return false;
    
    // Auto-filter by staff role if not master/admin
    const isMaster = staffUser?.name?.toLowerCase().includes('billing');
    if (staffUser?.serviceId && !isMaster && selectedServiceId === 'ALL') {
      if (t.serviceId !== staffUser.serviceId) return false;
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        t.customerName.toLowerCase().includes(search) ||
        t.ticketNumber.toLowerCase().includes(search) ||
        (t.customerPhone && t.customerPhone.includes(search))
      );
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/admin/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Staff Dashboard
          </Link>
          <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
            <History className="h-8 w-8 text-amber-500" /> Patient Visit History
          </h1>
          <p className="mt-1 text-sm text-slate-400">View completed appointments and walk-in records.</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search name, phone, or token..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-10 pr-4 text-sm font-semibold text-white focus:border-amber-500 focus:outline-none"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-10 pr-4 text-sm font-semibold text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold">Token</th>
                <th className="px-6 py-4 font-bold">Patient Name</th>
                <th className="px-6 py-4 font-bold">Contact</th>
                <th className="px-6 py-4 font-bold">Department</th>
                <th className="px-6 py-4 font-bold">Counter</th>
                <th className="px-6 py-4 font-bold">Wait Time</th>
                <th className="px-6 py-4 font-bold">Completed On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500 italic">Loading history...</td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500 italic">No patient history found.</td>
                </tr>
              ) : (
                filteredTickets.map((t) => {
                  let waitTime = '-';
                  if (t.calledAt) {
                    const joined = new Date(t.joinedAt).getTime();
                    const called = new Date(t.calledAt).getTime();
                    const diffMins = Math.round((called - joined) / 60000);
                    waitTime = diffMins > 0 ? `${diffMins} mins` : '< 1 min';
                  }

                  return (
                    <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-white bg-slate-800 px-2 py-1 rounded">
                          {t.ticketNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-200">
                        {t.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                        {t.customerPhone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-amber-400/90 font-medium">
                        {t.service?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                        {t.counter?.counterNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                        {waitTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                          {t.completedAt ? new Date(t.completedAt).toLocaleString() : 'Done'}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
