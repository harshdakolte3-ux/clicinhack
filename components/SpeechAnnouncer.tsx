'use client';

import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface SpeechAnnouncerProps {
  socket: any;
}

export function SpeechAnnouncer({ socket }: SpeechAnnouncerProps) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [lastSpoken, setLastSpoken] = useState<string | null>(null);

  const speakAnnouncement = (text: string) => {
    if (!isEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Cancel any active speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for clear waiting room callout
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Select natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
      );
      if (preferredVoice) utterance.voice = preferredVoice;

      window.speechSynthesis.speak(utterance);
      setLastSpoken(text);
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on('ticket:called', (payload: any) => {
        if (payload && payload.ticket && payload.counter) {
          // Format token numbers clearly for TTS (e.g. "A 102" instead of "A-102")
          const formattedToken = payload.ticket.ticketNumber.replace('-', ' ');
          const counterNum = payload.counter.counterNumber;
          const announcement = `Attention please! Token ${formattedToken}, please proceed to ${counterNum}.`;
          
          speakAnnouncement(announcement);
        }
      });

      return () => {
        socket.off('ticket:called');
      };
    }
  }, [socket, isEnabled]);

  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-1.5 backdrop-blur-md">
      <button
        onClick={() => setIsEnabled(!isEnabled)}
        className={`flex items-center gap-2 text-xs font-bold transition-all ${
          isEnabled ? 'text-emerald-400' : 'text-slate-500'
        }`}
      >
        {isEnabled ? <Volume2 className="h-4 w-4 text-emerald-400 animate-pulse" /> : <VolumeX className="h-4 w-4" />}
        <span>{isEnabled ? 'Voice Callout ON' : 'Voice Callout Muted'}</span>
      </button>

      {lastSpoken && isEnabled && (
        <span className="hidden sm:inline-block text-[11px] text-slate-400 italic truncate max-w-xs border-l border-slate-800 pl-2">
          "{lastSpoken}"
        </span>
      )}
    </div>
  );
}
