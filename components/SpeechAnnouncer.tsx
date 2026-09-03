'use client';
import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface SpeechAnnouncerProps { socket: any; }

export function SpeechAnnouncer({ socket }: SpeechAnnouncerProps) {
  const [isEnabled, setIsEnabled] = useState(true);
  
  const speakAnnouncement = (text: string) => {
    if (!isEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; 
    utterance.pitch = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;
    
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (socket) {
      socket.on('ticket:called', (payload: any) => {
        if (payload?.ticket && payload?.counter) {
          const formattedToken = payload.ticket.ticketNumber.replace('-', ' ');
          const counterNum = payload.counter.counterNumber;
          speakAnnouncement(`Attention please! Token ${formattedToken}, please proceed to ${counterNum}.`);
        }
      });
      return () => socket.off('ticket:called');
    }
  }, [socket, isEnabled]);

  return (
    <button onClick={() => setIsEnabled(!isEnabled)} className="text-emerald-400 flex items-center gap-2">
      {isEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      {isEnabled ? 'Voice Callout ON' : 'Voice Callout Muted'}
    </button>
  );
}
