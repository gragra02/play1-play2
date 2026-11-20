import type { SpeakerId } from './types';

export type MusicMode = 'off' | 'club' | 'slow_romantic' | 'funk' | 'afternoon_warm';

class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private musicTimer: number | null = null;
  private stepIdx = 0;
  private mode: MusicMode = 'off';

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined' || this.muted) return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock(): void {
    this.ensureContext();
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) {
      this.stopMusicLoop();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  public setMusicMode(nextMode: MusicMode): void {
    if (this.mode === nextMode && (nextMode === 'off' || this.musicTimer !== null)) {
      return;
    }
    this.mode = nextMode;
    this.stepIdx = 0;
    this.stopMusicLoop();
    if (nextMode !== 'off' && !this.muted) {
      this.startMusicLoop();
    }
  }

  private stopMusicLoop(): void {
    if (this.musicTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private startMusicLoop(): void {
    if (typeof window === 'undefined' || this.muted || this.mode === 'off') return;

    if (this.mode === 'slow_romantic') {
      // Original 1990s slow romantic Brazilian discoteca instrumental (~68 BPM)
      const slowChords: number[][] = [
        [174.61, 220.0, 261.63, 329.63], // Fmaj7
        [146.83, 220.0, 261.63, 349.23], // Dm7
        [116.54, 174.61, 220.0, 293.66], // Bbmaj7
        [130.81, 196.0, 261.63, 349.23], // C7sus4
      ];
      const slowMelody = [523.25, 440.0, 392.0, 440.0, 349.23, 392.0, 440.0, 523.25];

      this.musicTimer = window.setInterval(() => {
        if (this.muted || this.mode !== 'slow_romantic') return;
        const ctx = this.ensureContext();
        if (!ctx || ctx.state !== 'running') return;

        const chordIdx = Math.floor(this.stepIdx / 4) % slowChords.length;
        const arpIdx = this.stepIdx % 4;
        const chord = slowChords[chordIdx];

        if (arpIdx === 0) {
          this.playTone(chord[0] / 2, 1.45, 'sine', 0.048);
          this.playTone(chord[1], 1.25, 'sine', 0.022);
          this.playTone(chord[2], 1.25, 'sine', 0.018);
        }

        const arpNote = chord[arpIdx];
        this.playTone(arpNote * 2, 0.54, 'triangle', 0.022);

        if (this.stepIdx % 2 === 0) {
          const melNote = slowMelody[(this.stepIdx / 2) % slowMelody.length];
          this.playTone(melNote, 0.68, 'sine', 0.025);
        }

        this.stepIdx++;
      }, 430);
      return;
    }

    if (this.mode === 'funk') {
      // 1990s Brazilian / Miami-Bass Funk groove (~126 BPM) for the Roda de Breakdance
      const funkBass = [
        82.41, 0, 82.41, 98.0, 0, 82.41, 110.0, 98.0,
        73.42, 0, 73.42, 82.41, 0, 98.0, 110.0, 0,
      ];
      const funkStab = [
        329.63, 0, 0, 392.0, 0, 0, 440.0, 0,
        293.66, 0, 0, 329.63, 0, 392.0, 0, 0,
      ];
      const kickPattern = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0];
      const snarePattern = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1];

      this.musicTimer = window.setInterval(() => {
        if (this.muted || this.mode !== 'funk') return;
        const ctx = this.ensureContext();
        if (!ctx || ctx.state !== 'running') return;

        const idx = this.stepIdx % 16;
        if (kickPattern[idx]) {
          this.playKick(0.085);
        }
        if (snarePattern[idx]) {
          this.playTone(215, 0.055, 'sawtooth', 0.022);
          this.playTone(940, 0.035, 'square', 0.012);
        }
        const bass = funkBass[idx];
        if (bass > 0) {
          this.playTone(bass, 0.12, 'sawtooth', 0.038);
        }
        const stab = funkStab[idx];
        if (stab > 0) {
          this.playTone(stab, 0.09, 'square', 0.014);
          this.playTone(stab * 1.25, 0.08, 'triangle', 0.012);
        }

        this.stepIdx++;
      }, 118);
      return;
    }

    if (this.mode === 'afternoon_warm') {
      // Warm sunlit Stardew-inspired nostalgic 90s neighborhood theme (~92 BPM)
      const warmChords: number[][] = [
        [196.0, 246.94, 293.66, 369.99], // Gmaj7
        [164.81, 196.0, 246.94, 293.66], // Em7
        [130.81, 196.0, 246.94, 329.63], // Cmaj7
        [146.83, 220.0, 293.66, 369.99], // D6
      ];
      const warmMelody = [392.0, 440.0, 493.88, 587.33, 493.88, 440.0, 392.0, 329.63];

      this.musicTimer = window.setInterval(() => {
        if (this.muted || this.mode !== 'afternoon_warm') return;
        const ctx = this.ensureContext();
        if (!ctx || ctx.state !== 'running') return;

        const chordIdx = Math.floor(this.stepIdx / 4) % warmChords.length;
        const beat = this.stepIdx % 4;
        const chord = warmChords[chordIdx];

        if (beat === 0) {
          this.playTone(chord[0] / 2, 0.95, 'triangle', 0.044);
          this.playTone(chord[1], 0.65, 'sine', 0.02);
        }
        this.playTone(chord[beat] * 2, 0.28, 'triangle', 0.022);

        if (this.stepIdx % 2 === 0) {
          const mel = warmMelody[(this.stepIdx / 2) % warmMelody.length];
          this.playTone(mel, 0.36, 'sine', 0.024);
        }

        this.stepIdx++;
      }, 310);
      return;
    }

    // 1995 energetic discoteca club background groove
    const clubBass = [110, 110, 130.81, 146.83, 98, 98, 123.47, 130.81];
    const clubLead = [440, 0, 523.25, 493.88, 392, 0, 440, 329.63];

    this.musicTimer = window.setInterval(() => {
      if (this.muted || this.mode !== 'club') return;
      const ctx = this.ensureContext();
      if (!ctx || ctx.state !== 'running') return;

      const idx = this.stepIdx % 8;
      const bassFreq = clubBass[idx];
      const leadFreq = clubLead[idx];

      this.playTone(bassFreq, 0.14, 'triangle', 0.036);
      if (leadFreq > 0) {
        this.playTone(leadFreq, 0.11, 'square', 0.012);
      }

      this.stepIdx++;
    }, 260);
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    delay = 0,
  ): void {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.03);
  }

  private playKick(volume: number): void {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(145, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.11);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playBootChime(): void {
    if (this.muted) return;
    // Nostalgic 16-bit console startup chime when "1995" appears
    this.playTone(523.25, 0.18, 'triangle', 0.055, 0);
    this.playTone(659.25, 0.18, 'triangle', 0.055, 0.09);
    this.playTone(783.99, 0.24, 'triangle', 0.055, 0.18);
    this.playTone(1046.5, 0.45, 'sine', 0.06, 0.27);
  }

  public playSpeechBlip(speaker: SpeakerId): void {
    if (this.muted) return;
    const baseFreq: Record<SpeakerId, number> = {
      grazi: 540,
      grazi_thought: 460,
      grazi_adult: 510,
      laura: 610,
      ariel: 340,
      ariel_adult: 315,
      cristian: 690,
      nani: 575,
      bar_man: 270,
      leo: 300,
      junior: 310,
      dj: 280,
      bartender: 360,
      vendor: 350,
      clerk: 390,
      bboy: 325,
      teen_group: 410,
      friend: 330,
      narrator: 420,
    };
    const pitchJitter = 0.94 + Math.random() * 0.12;
    this.playTone((baseFreq[speaker] ?? 440) * pitchJitter, 0.045, 'square', 0.02);
  }

  public playInteract(): void {
    if (this.muted) return;
    this.playTone(523.25, 0.07, 'triangle', 0.05, 0);
    this.playTone(659.25, 0.09, 'triangle', 0.05, 0.06);
  }

  public playSlowDanceChime(): void {
    if (this.muted) return;
    this.playTone(523.25, 0.25, 'sine', 0.045, 0);
    this.playTone(659.25, 0.3, 'sine', 0.045, 0.09);
  }

  public playStageClear(): void {
    if (this.muted) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.22, 'triangle', 0.065, idx * 0.12);
    });
  }
}

export const retroAudio = new RetroAudioEngine();
