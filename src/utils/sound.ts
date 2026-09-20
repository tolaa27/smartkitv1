// utils/sound.ts
// Production Web Audio API Synthesizer & Web Speech API Engine

import { SpeechEngine } from './speech';

export class SoundFX {
  private static ctx: AudioContext | null = null;
  private static isUnlocked: boolean = false;
  private static soundEnabled: boolean = true;

  public static init(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (!this.isUnlocked) {
      this.isUnlocked = true;
      const unlock = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
      };
      window.addEventListener('click', unlock, { once: true, passive: true });
      window.addEventListener('touchstart', unlock, { once: true, passive: true });
    }

    return this.ctx;
  }

  public static toggleSound(enabled?: boolean): boolean {
    this.soundEnabled = enabled !== undefined ? enabled : !this.soundEnabled;
    return this.soundEnabled;
  }

  public static isEnabled(): boolean {
    return this.soundEnabled;
  }

  // 1. Correct Answer Chime: Arpeggiated pentatonic chord (C5: 523.25Hz, E5: 659.25Hz, G5: 783.99Hz, C6: 1046.50Hz)
  public static playSuccess(): void {
    if (!this.soundEnabled) return;
    const ctx = this.init();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        const startTime = now + idx * 0.08;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.48);
      });
    } catch {}
  }

  // 2. Soft Error Cue: Gentle, non-punitive warm low thud (180Hz -> 75Hz)
  public static playGentleError(): void {
    if (!this.soundEnabled) return;
    const ctx = this.init();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.18);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.24);
    } catch {}
  }

  // 3. Star Fanfare / Level Complete Sound: Celebratory multi-tone cascade
  public static playStar(): void {
    if (!this.soundEnabled) return;
    const ctx = this.init();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        const startTime = now + idx * 0.07;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.22, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.55);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.6);
      });
    } catch {}
  }

  // 4. Coin Collect Sound: High double-frequency chime (B5 987Hz -> E6 1318Hz)
  public static playCoin(): void {
    if (!this.soundEnabled) return;
    const ctx = this.init();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.07);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  // 5. Pop / Click Tactile Feedback
  public static playPop(): void {
    if (!this.soundEnabled) return;
    const ctx = this.init();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {}
  }

  // 6. Tactile Snap Feedback (Letter snaps, slot placements)
  public static playSnap(): void {
    if (!this.soundEnabled) return;
    const ctx = this.init();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1600, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  // 7. Water Splash Sound
  public static playWater(): void {
    if (!this.soundEnabled) return;
    const ctx = this.init();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.14);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {}
  }

  // 8. Train Whistle
  public static playTrainWhistle(): void {
    if (!this.soundEnabled) return;
    const ctx = this.init();
    if (!ctx) return;

    try {
      const freqs = [440, 554.37];
      const now = ctx.currentTime;

      freqs.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.42);
      });
    } catch {}
  }

  // 9. Magnetic Clink
  public static playMagnet(): void {
    if (!this.soundEnabled) return;
    const ctx = this.init();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  // 10. Fraction Slice Swoosh
  public static playSlice(): void {
    if (!this.soundEnabled) return;
    const ctx = this.init();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {}
  }

  // 11. Balance Scale Pivot Tilt
  public static playBalanceTilt(): void {
    if (!this.soundEnabled) return;
    const ctx = this.init();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }

  // 12. Frog Jump Boing
  public static playFrogJump(): void {
    if (!this.soundEnabled) return;
    const ctx = this.init();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.12);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  // 13. Soap Scrub
  public static playSoapScrub(): void {
    if (!this.soundEnabled) return;
    const ctx = this.init();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700 + Math.random() * 200, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.05);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {}
  }

  // 14. Cambodian Market Cash Drawer
  public static playCashDrawer(): void {
    if (!this.soundEnabled) return;
    const ctx = this.init();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.38);

      setTimeout(() => this.playCoin(), 70);
    } catch {}
  }
}

class SoundSystem {
  public toggleSound(enabled?: boolean): boolean {
    return SoundFX.toggleSound(enabled);
  }

  public isEnabled(): boolean {
    return SoundFX.isEnabled();
  }

  public setSubtitleListener(listener: ((text: string) => void) | null) {
    if (listener) {
      SpeechEngine.setSubtitleListener((text) => {
        if (text) listener(text);
      });
    } else {
      SpeechEngine.setSubtitleListener(null);
    }
  }

  // Aliases for unified interface
  public playSuccess(): void {
    SoundFX.playSuccess();
  }
  public playSuccessChime(): void {
    SoundFX.playSuccess();
  }
  public playGentleError(): void {
    SoundFX.playGentleError();
  }
  public playErrorThud(): void {
    SoundFX.playGentleError();
  }
  public playWrong(): void {
    SoundFX.playGentleError();
  }
  public playStarCelebration(): void {
    SoundFX.playStar();
  }
  public playStar(): void {
    SoundFX.playStar();
  }
  public playCoinSound(): void {
    SoundFX.playCoin();
  }
  public playCoin(): void {
    SoundFX.playCoin();
  }
  public playPop(): void {
    SoundFX.playPop();
  }
  public playBalloonPop(): void {
    SoundFX.playPop();
  }
  public playSnap(): void {
    SoundFX.playSnap();
  }
  public playWaterSplash(): void {
    SoundFX.playWater();
  }
  public playWater(): void {
    SoundFX.playWater();
  }
  public playSun(): void {
    SoundFX.playPop();
  }
  public playDrop(): void {
    SoundFX.playPop();
  }
  public playTrainWhistle(): void {
    SoundFX.playTrainWhistle();
  }
  public playMagnetClink(): void {
    SoundFX.playMagnet();
  }
  public playSlice(): void {
    SoundFX.playSlice();
  }
  public playBalanceTilt(): void {
    SoundFX.playBalanceTilt();
  }
  public playFrogJump(): void {
    SoundFX.playFrogJump();
  }
  public playSoapScrub(): void {
    SoundFX.playSoapScrub();
  }
  public playCashDrawer(): void {
    SoundFX.playCashDrawer();
  }

  // Speech integration
  public speak(text: string, preferredLang?: 'km-KH' | 'en-US'): void {
    if (!this.isEnabled()) return;
    SpeechEngine.speak(text, preferredLang);
  }

  public speakKhmer(text: string): void {
    this.speak(text, 'km-KH');
  }

  public playMelodicHint(): void {
    if (!this.isEnabled()) return;
    SpeechEngine.playMelodicHint();
  }

  public stopSpeech(): void {
    SpeechEngine.stop();
  }
}

export const sound = new SoundSystem();
export { SpeechEngine } from './speech';

