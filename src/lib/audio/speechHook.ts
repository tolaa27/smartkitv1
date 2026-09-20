// src/lib/audio/speechHook.ts
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

// Custom event for app-wide subtitle broadcasts
export const SUBTITLE_EVENT = 'smartkids_subtitle_speak';

export interface SubtitleEventDetail {
  text: string;
  durationMs?: number;
}

export function broadcastSubtitle(text: string, durationMs: number = 3200) {
  if (typeof window === 'undefined') return;
  const event = new CustomEvent<SubtitleEventDetail>(SUBTITLE_EVENT, {
    detail: { text, durationMs },
  });
  window.dispatchEvent(event);
}

class ResilientSpeechService {
  private currentAudio: HTMLAudioElement | null = null;
  private isSpeaking: boolean = false;

  public async speak(text: string, onEnd?: () => void): Promise<void> {
    if (typeof window === 'undefined' || !text.trim()) return;

    this.stop();
    this.isSpeaking = true;

    // 1. Always trigger floating animated visual subtitle chip for sensory feedback
    broadcastSubtitle(text);

    // 2. Attempt server-side Edge/Google TTS proxy stream
    try {
      const audioUrl = `/api/tts?text=${encodeURIComponent(text.trim())}`;
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      audio.onended = () => {
        this.isSpeaking = false;
        this.currentAudio = null;
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        // Fallback to client-side Web Speech API
        this.fallbackWebSpeech(text, onEnd);
      };

      await audio.play();
    } catch {
      // Audio playback blocked or network issue -> fallback to Web Speech
      this.fallbackWebSpeech(text, onEnd);
    }
  }

  private fallbackWebSpeech(text: string, onEnd?: () => void): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.isSpeaking = false;
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'km-KH';
      utterance.rate = 0.85;

      // Select Khmer voice if available in browser
      const voices = window.speechSynthesis.getVoices();
      const kmVoice = voices.find(
        (v) => v.lang === 'km-KH' || v.lang.startsWith('km') || v.name.toLowerCase().includes('khmer')
      );
      if (kmVoice) {
        utterance.voice = kmVoice;
      }

      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    }
  }

  public stop(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    this.isSpeaking = false;
  }

  public getSpeakingStatus(): boolean {
    return this.isSpeaking;
  }
}

export const speechService = new ResilientSpeechService();

/**
 * React hook for resilient Khmer speech synthesis
 */
export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const speak = useCallback((text: string) => {
    setIsSpeaking(true);
    speechService.speak(text, () => {
      if (isMountedRef.current) {
        setIsSpeaking(false);
      }
    });
  }, []);

  const stop = useCallback(() => {
    speechService.stop();
    if (isMountedRef.current) {
      setIsSpeaking(false);
    }
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
  };
}
