// utils/speech.ts
// Bulletproof Dual-Tier Speech & Audio Subsystem for Cambodian Primary EdTech (MoEYS Grades 1-3)

export class SpeechEngine {
  private static synth: SpeechSynthesis | null =
    typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static audioCtx: AudioContext | null = null;
  private static fallbackAudio: HTMLAudioElement | null = null;
  private static isInitialized: boolean = false;
  private static subtitleListener: ((text: string | null, isSpeaking: boolean) => void) | null = null;
  private static subtitleTimeout: NodeJS.Timeout | null = null;

  // Initialize AudioContext on first user interaction to unlock browser autoplay
  public static init() {
    if (typeof window === 'undefined') return;

    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    if (!this.isInitialized) {
      this.isInitialized = true;
      // Unlock on first click/touch if not already unlocked
      const unlock = () => {
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume().catch(() => {});
        }
      };
      window.addEventListener('click', unlock, { once: true, passive: true });
      window.addEventListener('touchstart', unlock, { once: true, passive: true });
    }
  }

  // Register visual subtitle chip listener
  public static setSubtitleListener(
    listener: ((text: string | null, isSpeaking: boolean) => void) | null
  ) {
    this.subtitleListener = listener;
  }

  private static notifySubtitle(text: string | null, isSpeaking: boolean, durationMs: number = 3000) {
    if (this.subtitleTimeout) {
      clearTimeout(this.subtitleTimeout);
      this.subtitleTimeout = null;
    }
    if (this.subtitleListener) {
      this.subtitleListener(text, isSpeaking);
    }
    if (isSpeaking && text) {
      this.subtitleTimeout = setTimeout(() => {
        if (this.subtitleListener) {
          this.subtitleListener(null, false);
        }
      }, durationMs);
    }
  }

  // Primary speech dispatch: Tier 1 (Native) -> Tier 2 (Khmer TTS Fallback) -> Tier 3 (Melodic Hint)
  public static speak(
    text: string,
    onSubtitleOrLang?: ((text: string | null) => void) | 'km-KH' | 'en-US',
    langParam?: 'km-KH' | 'en-US'
  ) {
    if (!text || typeof window === 'undefined') return;
    this.init();

    let onSubtitle: ((text: string | null) => void) | null = null;
    let lang: 'km-KH' | 'en-US' = 'km-KH';

    if (typeof onSubtitleOrLang === 'function') {
      onSubtitle = onSubtitleOrLang;
      if (langParam) lang = langParam;
    } else if (typeof onSubtitleOrLang === 'string') {
      lang = onSubtitleOrLang;
    }

    // Auto-detect Khmer characters
    const containsKhmer = /[\u1780-\u17FF]/.test(text);
    const targetLang = lang || (containsKhmer ? 'km-KH' : 'en-US');

    // Notify UI subtitle chip & optional callback
    if (onSubtitle) {
      onSubtitle(text);
    }
    this.notifySubtitle(text, true, Math.max(2500, text.length * 90));

    // 1. Chrome queue unlock: cancel any hung utterances
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {}
    }

    // 2. Check if a valid native voice exists for the target language
    const voices = this.synth ? this.synth.getVoices() : [];
    const hasNativeKhmer = voices.some(
      v =>
        v.lang.toLowerCase().includes('km') ||
        v.lang.toLowerCase().includes('kh') ||
        v.name.toLowerCase().includes('khmer')
    );

    if (targetLang === 'km-KH' && !hasNativeKhmer) {
      // Tier 2 Fallback: Stream via reliable Khmer TTS endpoint
      this.speakFallbackURL(text, 'km-KH');
      return;
    }

    // Tier 1: Native SpeechSynthesis
    if (this.synth) {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = targetLang;
        utterance.rate = targetLang === 'km-KH' ? 0.85 : 0.9; // Calibrated for early elementary learners
        utterance.pitch = 1.1;

        const matchedVoice = voices.find(v =>
          targetLang === 'km-KH'
            ? v.lang.toLowerCase().includes('km') || v.name.toLowerCase().includes('khmer')
            : v.lang.toLowerCase().includes('en-us') || v.lang.toLowerCase().includes('en')
        );
        if (matchedVoice) utterance.voice = matchedVoice;

        utterance.onend = () => {
          this.notifySubtitle(null, false);
        };

        // Handle Chrome garbage-collection bug on long utterances
        utterance.onerror = () => {
          this.speakFallbackURL(text, targetLang);
        };

        this.synth.speak(utterance);
      } catch {
        this.speakFallbackURL(text, targetLang);
      }
    } else {
      this.speakFallbackURL(text, targetLang);
    }
  }

  // Tier 2 Fallback: Google Translate TTS stream for Khmer & English
  private static speakFallbackURL(text: string, lang: 'km-KH' | 'en-US' = 'km-KH') {
    try {
      if (!this.fallbackAudio) {
        this.fallbackAudio = new Audio();
      }

      this.fallbackAudio.pause();
      const encoded = encodeURIComponent(text.slice(0, 180));
      const tl = lang === 'km-KH' ? 'km' : 'en';
      this.fallbackAudio.src =
        lang === 'km-KH'
          ? `/api/tts?text=${encoded}`
          : `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${tl}&client=tw-ob`;

      this.fallbackAudio.onended = () => {
        this.notifySubtitle(null, false);
      };

      this.fallbackAudio.onerror = () => {
        // Tier 3 Safety: Play melodic hint tone so learner still receives sensory feedback
        this.playMelodicHint();
      };

      const playPromise = this.fallbackAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback to Tier 3 melodic hint if autoplay blocked or network fails
          this.playMelodicHint();
        });
      }
    } catch {
      this.playMelodicHint();
    }
  }

  // Tier 3 Sensory Safety Fallback: Melodic Hint Tone via Web Audio API
  public static playMelodicHint() {
    this.init();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;
      // Friendly marimba-like double chime (G5: 784Hz -> C6: 1046Hz)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(783.99, now);
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  // Convenience helper for Khmer speech
  public static speakKhmer(text: string) {
    this.speak(text, 'km-KH');
  }

  // Stop all active utterances and fallback streams
  public static stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {}
    }
    if (this.fallbackAudio) {
      try {
        this.fallbackAudio.pause();
        this.fallbackAudio.currentTime = 0;
      } catch {}
    }
    this.notifySubtitle(null, false);
  }
}
