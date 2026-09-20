'use client';

import React, { useState, useEffect } from 'react';
import { SpeechEngine } from '@/utils/speech';
import { Volume2, X } from 'lucide-react';

export const SubtitleBanner: React.FC = () => {
  const [subtitle, setSubtitle] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    SpeechEngine.setSubtitleListener((text, speaking) => {
      setSubtitle(text);
      setIsSpeaking(speaking);
    });

    return () => {
      SpeechEngine.setSubtitleListener(null);
    };
  }, []);

  if (!isSpeaking || !subtitle) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 max-w-xl w-[90%] sm:w-auto bg-amber-950/95 text-amber-50 px-5 py-3 rounded-2xl shadow-2xl border-2 border-amber-300 backdrop-blur-md flex items-center justify-between gap-3.5 animate-bounce-short pointer-events-auto transition-all"
    >
      <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
        <Volume2 className="w-4 h-4 animate-pulse" />
      </div>

      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-bold text-amber-300 block uppercase tracking-wider">
          សំឡេងអាន (Voice Subtitle)
        </span>
        <p className="text-xs sm:text-sm font-black font-khmer text-amber-50 leading-relaxed overflow-visible py-0.5 line-clamp-2">
          {subtitle}
        </p>
      </div>

      <button
        onClick={() => SpeechEngine.stop()}
        className="p-1 rounded-lg bg-white/20 hover:bg-white/30 text-amber-200 hover:text-white transition-colors shrink-0"
        title="បិទសំឡេង (Stop audio)"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
