'use client';
import { useEffect, useState } from 'react';
import { Volume2, VolumeX, AlertCircle } from 'lucide-react';

interface SpeechAnnouncerProps { socket: any; }

export function SpeechAnnouncer({ socket }: SpeechAnnouncerProps) {
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  // Unlocks the browser's audio engine via direct user interaction
  const initAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const silent = new SpeechSynthesisUtterance(' ');
      silent.volume = 0;
      window.speechSynthesis.speak(silent);
    }
    setAudioInitialized(true);
    setIsEnabled(true);
  };
  
  // Keep utterances in a ref/state to prevent garbage collection in Chrome
  const [activeUtterances, setActiveUtterances] = useState<SpeechSynthesisUtterance[]>([]);
  
  const speakAnnouncement = (englishText: string, hindiText: string) => {
    if (!isEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel(); 
    
    const voices = window.speechSynthesis.getVoices();
    
    // 1. English Utterance
    const engUtterance = new SpeechSynthesisUtterance(englishText);
    engUtterance.rate = 0.9; 
    // Fallback to default if no specific english voice found
    const engVoice = voices.find(v => v.lang.startsWith('en-IN') || v.lang.startsWith('en-GB') || v.lang.startsWith('en-US'));
    if (engVoice) engUtterance.voice = engVoice;
    else engUtterance.lang = 'en-US';
    
    // 2. Hindi Utterance
    const hinUtterance = new SpeechSynthesisUtterance(hindiText);
    hinUtterance.rate = 0.85;
    const hinVoice = voices.find(v => v.lang.startsWith('hi-IN') || v.lang.includes('Hindi'));
    if (hinVoice) {
      hinUtterance.voice = hinVoice;
    } else {
      hinUtterance.lang = 'hi-IN';
    }
    
    // Save to state to prevent Chrome garbage collection
    setActiveUtterances([engUtterance, hinUtterance]);
    
    // Queue both
    window.speechSynthesis.speak(engUtterance);
    window.speechSynthesis.speak(hinUtterance);
  };

  useEffect(() => {
    // Force load voices immediately
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  useEffect(() => {
    if (socket && audioInitialized) {
      socket.on('ticket:called', (payload: any) => {
        if (payload?.ticket && payload?.counter) {
          const formattedToken = payload.ticket.ticketNumber.replace('-', ' ');
          const counterNum = payload.counter.counterNumber;
          
          const eng = `Attention please! Token ${formattedToken}, please proceed to ${counterNum}.`;
          const hin = `Kripya dhyan de. Token ${formattedToken}, ${counterNum} par jaaye.`;
          
          speakAnnouncement(eng, hin);
        }
      });
      return () => socket.off('ticket:called');
    }
  }, [socket, isEnabled, audioInitialized]);

  if (!audioInitialized) {
    return (
      <button 
        onClick={initAudio} 
        className="flex items-center gap-2 rounded-lg bg-amber-500/20 border border-amber-500/50 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/30 transition-all animate-pulse"
      >
        <AlertCircle className="h-4 w-4" /> Click to Enable Voice
      </button>
    );
  }

  return (
    <button onClick={() => setIsEnabled(!isEnabled)} className="text-emerald-400 flex items-center gap-2 text-xs font-bold bg-slate-800/50 px-3 py-1.5 rounded-lg">
      {isEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
      {isEnabled ? 'Voice Callout ON' : <span className="text-slate-500">Voice Muted</span>}
    </button>
  );
}
