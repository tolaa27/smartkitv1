// src/components/audio/AudioProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { soundSynthesizer } from '@/lib/audio/SoundSynthesizer';
import { speechService, SUBTITLE_EVENT, SubtitleEventDetail } from '@/lib/audio/speechHook';
import { Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AudioContextType {
  soundEnabled: boolean;
  toggleSound: () => boolean;
  speak: (text: string) => void;
  stopSpeech: () => void;
  playSuccess: () => void;
  playError: () => void;
  playPop: () => void;
  playCoin: () => void;
  playFanfare: () => void;
  playClick: () => void;
  activeSubtitle: string | null;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);
  const subtitleTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleSubtitle = (e: Event) => {
      const detail = (e as CustomEvent<SubtitleEventDetail>).detail;
      if (detail && detail.text) {
        if (subtitleTimeoutRef.current) {
          clearTimeout(subtitleTimeoutRef.current);
        }
        setActiveSubtitle(detail.text);
        subtitleTimeoutRef.current = setTimeout(() => {
          setActiveSubtitle(null);
        }, detail.durationMs || 3500);
      }
    };

    window.addEventListener(SUBTITLE_EVENT, handleSubtitle);
    return () => {
      window.removeEventListener(SUBTITLE_EVENT, handleSubtitle);
      if (subtitleTimeoutRef.current) {
        clearTimeout(subtitleTimeoutRef.current);
      }
    };
  }, []);

  const toggleSound = useCallback(() => {
    const next = soundSynthesizer.toggleSound();
    setSoundEnabled(next);
    return next;
  }, []);

  const speak = useCallback((text: string) => {
    speechService.speak(text);
  }, []);

  const stopSpeech = useCallback(() => {
    speechService.stop();
  }, []);

  return (
    <AudioContext.Provider
      value={{
        soundEnabled,
        toggleSound,
        speak,
        stopSpeech,
        playSuccess: () => soundSynthesizer.playSuccess(),
        playError: () => soundSynthesizer.playError(),
        playPop: () => soundSynthesizer.playPop(),
        playCoin: () => soundSynthesizer.playCoin(),
        playFanfare: () => soundSynthesizer.playFanfare(),
        playClick: () => soundSynthesizer.playClick(),
        activeSubtitle,
      }}
    >
      {children}

      {/* Floating Animated Visual Subtitle Chip (Zero-Failure Phonics Feedback) */}
      <AnimatePresence>
        {activeSubtitle && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none max-w-xl w-[90vw]"
          >
            <div className="bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-indigo-400/40 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Volume2 className="w-4 h-4 text-white" />
              </div>
              <p className="text-base sm:text-lg font-medium font-kantumruy leading-relaxed text-indigo-100 break-words flex-1">
                &ldquo;{activeSubtitle}&rdquo;
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AudioContext.Provider>
  );
};

export function useAudio(): AudioContextType {
  const context = useContext(AudioContext);
  if (!context) {
    // Fallback safe dummy context if outside AudioProvider
    return {
      soundEnabled: true,
      toggleSound: () => true,
      speak: (t) => speechService.speak(t),
      stopSpeech: () => speechService.stop(),
      playSuccess: () => soundSynthesizer.playSuccess(),
      playError: () => soundSynthesizer.playError(),
      playPop: () => soundSynthesizer.playPop(),
      playCoin: () => soundSynthesizer.playCoin(),
      playFanfare: () => soundSynthesizer.playFanfare(),
      playClick: () => soundSynthesizer.playClick(),
      activeSubtitle: null,
    };
  }
  return context;
}
