/**
 * Original ocarina-style ambient loop synthesised with WebAudio (no audio
 * files, no copyrighted melody). Soft sine voice with vibrato + echo over a
 * gentle drone. Starts only on a user click (browser autoplay rules).
 */
type Listener = (on: boolean) => void;

// [semitones from D5, beats]; null = rest. An original wandering pentatonic tune.
const TUNE: Array<[number | null, number]> = [
  [0, 1], [3, 1], [7, 2], [5, 1], [3, 1], [0, 2],
  [-2, 1], [0, 1], [3, 1], [5, 1], [3, 3], [null, 1],
  [7, 1], [10, 1], [12, 2], [10, 1], [7, 1], [5, 2],
  [3, 1], [5, 1], [3, 1], [0, 1], [0, 3], [null, 1],
];
const BPM = 76;
const D5 = 587.33;

class AmbientMusic {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: number | null = null;
  private drone: OscillatorNode[] = [];
  private volume = Number(localStorage.getItem('studio3d.music.volume') ?? 0.5);
  private listeners = new Set<Listener>();

  isPlaying() { return this.timer !== null; }
  getVolume() { return this.volume; }
  subscribe(l: Listener) { this.listeners.add(l); return () => { this.listeners.delete(l); }; }
  private emit() { this.listeners.forEach((l) => l(this.isPlaying())); }

  setVolume(v: number) {
    this.volume = v;
    localStorage.setItem('studio3d.music.volume', String(v));
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(v * 0.35, this.ctx.currentTime, 0.1);
  }

  start() {
    if (this.timer !== null) return;
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    this.ctx = this.ctx ?? new AC();
    const ctx = this.ctx;
    void ctx.resume();
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.gain.setTargetAtTime(this.volume * 0.35, ctx.currentTime, 0.6);
    // echo
    const delay = ctx.createDelay(1); delay.delayTime.value = 0.38;
    const fb = ctx.createGain(); fb.gain.value = 0.32;
    delay.connect(fb).connect(delay);
    this.master.connect(ctx.destination);
    delay.connect(this.master);
    const voiceBus = ctx.createGain(); voiceBus.connect(this.master); voiceBus.connect(delay);

    // soft drone (D3 + A3)
    this.drone = [146.83, 220].map((f) => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const g = ctx.createGain(); g.gain.value = 0.05; o.connect(g).connect(this.master!); o.start();
      return o;
    });

    const beat = 60 / BPM;
    let next = ctx.currentTime + 0.2;
    let idx = 0;
    const schedule = () => {
      while (next < ctx.currentTime + 1.2) {
        const [semi, beats] = TUNE[idx % TUNE.length];
        const dur = beats * beat;
        if (semi !== null) {
          const f = D5 * Math.pow(2, semi / 12) / 2;
          const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
          const vib = ctx.createOscillator(); vib.frequency.value = 5.2;
          const vibG = ctx.createGain(); vibG.gain.value = f * 0.006;
          vib.connect(vibG).connect(o.frequency);
          const breath = ctx.createOscillator(); breath.type = 'triangle'; breath.frequency.value = f * 2;
          const bG = ctx.createGain(); bG.gain.value = 0.08; breath.connect(bG);
          const env = ctx.createGain(); env.gain.value = 0;
          o.connect(env); bG.connect(env); env.connect(voiceBus);
          env.gain.setTargetAtTime(0.5, next, 0.04);
          env.gain.setTargetAtTime(0, next + dur * 0.85, 0.08);
          [o, vib, breath].forEach((n) => { n.start(next); n.stop(next + dur + 0.6); });
        }
        next += dur;
        idx++;
      }
    };
    schedule();
    this.timer = window.setInterval(schedule, 300);
    this.emit();
  }

  stop() {
    if (this.timer === null) return;
    window.clearInterval(this.timer);
    this.timer = null;
    const ctx = this.ctx, m = this.master;
    if (ctx && m) {
      m.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
      const drone = this.drone;
      setTimeout(() => { drone.forEach((o) => { try { o.stop(); } catch { /* */ } }); m.disconnect(); }, 900);
    }
    this.drone = [];
    this.master = null;
    this.emit();
  }
}

export const ambientMusic = new AmbientMusic();
