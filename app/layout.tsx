import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Smart Appointment & Virtual Queue Management System',
  description: 'Eliminate waiting lines with real-time digital passes, dynamic wait time estimation, and smart counter operations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-800 bg-slate-900/50 py-6 text-center text-xs text-slate-500">
          <div className="mx-auto max-w-7xl px-4">
            Smart Appointment & Virtual Queue Management System (FSD 3) • Built for Hackathon
          </div>
        </footer>
      </body>
    </html>
  );
}
