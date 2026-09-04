'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Ticket, Calendar, Shield, Home, TrendingUp, Printer, Layers, LogIn, LogOut } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [staffUser, setStaffUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('staffUser');
      if (storedUser) {
        try {
          setStaffUser(JSON.parse(storedUser));
        } catch (e) {}
      } else {
        setStaffUser(null);
      }
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('staffUser');
    setStaffUser(null);
    router.push('/admin/login');
  };

  // Hide the global Navbar on Kiosk, Staff Dashboard, and QR pages, as they have their own integrated layouts
  if (pathname === '/kiosk' || pathname.startsWith('/admin/dashboard') || pathname.startsWith('/admin/qr')) {
    return null;
  }

  const isStaffArea = pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md print:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo - ALWAYS links back to Client Webpage (/) */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-500/30 group-hover:bg-blue-500 transition-all">
            Q
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-white group-hover:text-blue-400 transition-all">SmartQueue</span>
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold border ${
                isStaffArea
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}
            >
              {isStaffArea ? 'Staff Portal' : 'Customer Portal'}
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {!isStaffArea ? (
            <>
              {/* CLIENT PORTAL NAVBAR */}
              <Link
                href="/"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  pathname === '/'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>

              <Link
                href="/queue/join"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  pathname === '/queue/join'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Ticket className="h-4 w-4" />
                <span>Join Queue</span>
              </Link>

              <Link
                href="/book"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  pathname === '/book'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Calendar className="h-4 w-4 text-indigo-400" />
                <span>Book Slot</span>
              </Link>

              <div className="ml-2 border-l border-slate-800 pl-2 hidden sm:block">
                <Link
                  href="/admin/login"
                  className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 border border-slate-700 hover:bg-slate-700"
                >
                  <Shield className="h-3.5 w-3.5 text-amber-400" />
                  Staff Login
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* STAFF PORTAL NAVBAR */}
              <Link
                href="/admin/dashboard"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  pathname === '/admin/dashboard'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Counter Panel</span>
              </Link>

              <Link
                href="/admin/services"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  pathname === '/admin/services'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">Services & Presets</span>
              </Link>

              <Link
                href="/admin/analytics"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  pathname === '/admin/analytics'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </Link>

              <Link
                href="/admin/qr"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  pathname === '/admin/qr'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Print QR</span>
              </Link>

              {staffUser ? (
                <div className="flex items-center gap-2 ml-2 border-l border-slate-800 pl-2">
                  <span className="hidden md:inline-block text-xs font-semibold text-amber-400 truncate max-w-[120px]">
                    {staffUser.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    title="Logout Staff"
                    className="flex items-center gap-1 rounded-lg bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-xs font-bold text-rose-400 hover:bg-rose-600 hover:text-white transition-all"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="ml-2 border-l border-slate-800 pl-2">
                  <Link
                    href="/admin/login"
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-md"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Login</span>
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
