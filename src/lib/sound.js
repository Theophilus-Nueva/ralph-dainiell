// Web Audio Synthesizers for Split-Flap and UI interactions

// 1. Split-flap mechanical sound engine (synthesized clacks, no audio files)
export const FSX = (() => {
  const VOL = 0.5;
  let ctx = null;
  let bus = null;
  let bufs = [];
  let lastT = 0;
  let live = 0;
  let muted = false;

  const rnd = (a, b) => a + Math.random() * (b - a);
  const TAU = 6.283185307179586;

  const render = () => {
    if (!ctx) return;
    const sr = ctx.sampleRate;
    const N = Math.floor(sr * 0.075);
    bufs = [];

    for (let v = 0; v < 6; v++) {
      const b = ctx.createBuffer(1, N, sr);
      const d = b.getChannelData(0);
      const f1 = rnd(2300, 3500);
      const f0 = rnd(170, 260);
      const gap = Math.floor(sr * rnd(0.006, 0.0095));
      const lp = rnd(0.25, 0.45);
      let hp = 0;
      let prev = 0;
      let lpv = 0;

      const hit = (t0, amp) => {
        for (let i = 0; i < N - t0; i++) {
          const t = i / sr;
          const nz = Math.random() * 2 - 1;
          hp = 0.82 * (hp + nz - prev);
          prev = nz;
          let s = hp * Math.exp(-t / 0.0022) * 0.9;
          s +=
            Math.sin(TAU * f1 * t) * Math.exp(-t / 0.0045) * 0.32 +
            Math.sin(TAU * f1 * 2.76 * t) * Math.exp(-t / 0.0028) * 0.18 +
            Math.sin(TAU * f1 * 5.4 * t) * Math.exp(-t / 0.0016) * 0.08;
          lpv += lp * (nz - lpv);
          s +=
            Math.sin(TAU * f0 * (1 - 0.25 * Math.min(1, t / 0.03)) * t) * Math.exp(-t / 0.016) * 0.55 +
            lpv * Math.exp(-t / 0.007) * 0.5;
          d[t0 + i] += s * amp;
        }
      };

      hit(0, 1);
      hit(gap, 0.38);

      let pk = 0;
      const fo = Math.floor(sr * 0.005);
      for (let i = 0; i < N; i++) {
        d[i] *= Math.min(1, i / (sr * 0.0004)) * (i > N - fo ? (N - i) / fo : 1);
        pk = Math.max(pk, Math.abs(d[i]));
      }
      for (let i = 0; i < N; i++) d[i] = (d[i] / (pk || 1)) * 0.9;
      bufs.push(b);
    }
  };

  const build = () => {
    if (typeof window === 'undefined') return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;

    try {
      ctx = new AC({ latencyHint: 'interactive' });
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 5;
      comp.attack.value = 0.002;
      comp.release.value = 0.08;

      bus = ctx.createGain();
      bus.gain.value = muted ? 0 : VOL;
      bus.connect(comp);
      comp.connect(ctx.destination);

      render();
      ctx.onstatechange = () => {
        if (ctx.state !== 'running' && !document.hidden) ctx.resume().catch(() => {});
      };
    } catch {
      // AudioContext blocked
    }
  };

  const wake = () => {
    if (!ctx) build();
    if (ctx && ctx.state !== 'running') ctx.resume().catch(() => {});
  };

  if (typeof window !== 'undefined') {
    ['pointerdown', 'click', 'keydown', 'touchend'].forEach((ev) =>
      window.addEventListener(ev, wake, { passive: true })
    );
    try {
      build();
      if (ctx) ctx.resume().catch(() => {});
    } catch {
      // ignored
    }
  }

  return {
    wake,
    mute(m) {
      muted = !!m;
      if (bus && ctx) bus.gain.setTargetAtTime(muted ? 0 : VOL, ctx.currentTime, 0.03);
    },
    pan(el) {
      if (!el || typeof window === 'undefined') return 0;
      const r = el.getBoundingClientRect();
      return Math.max(-0.7, Math.min(0.7, ((r.left + r.width / 2) / window.innerWidth - 0.5) * 1.4));
    },
    click(pan = 0) {
      if (!VOL || muted || typeof document === 'undefined' || document.hidden || !ctx || ctx.state !== 'running' || !bufs.length)
        return;
      const t = ctx.currentTime;
      if (t - lastT < 0.0025 || live > 28) return;
      lastT = t;

      try {
        const s = ctx.createBufferSource();
        const g = ctx.createGain();
        const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        s.buffer = bufs[(Math.random() * bufs.length) | 0];
        s.playbackRate.value = rnd(0.9, 1.12);
        g.gain.value = rnd(0.55, 1);
        s.connect(g);

        if (p) {
          p.pan.value = pan || 0;
          g.connect(p);
          p.connect(bus);
        } else {
          g.connect(bus);
        }

        live++;
        s.onended = () => {
          live--;
        };
        s.start(t + 0.002);
      } catch {
        // audio playback failure ignored
      }
    },
  };
})();

// 2. Global UI interaction sound engine (hover tick & noise buffer for portrait)
export const SFX = (() => {
  let SFX_VOL = 0.35;
  let ctx = null;
  let bus = null;
  let noiseBuf = null;
  let lastT = 0;

  const build = () => {
    if (typeof window === 'undefined') return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;

    try {
      ctx = new AC({ latencyHint: 'interactive' });
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -12;
      comp.ratio.value = 4;

      bus = ctx.createGain();
      bus.connect(comp);
      comp.connect(ctx.destination);

      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

      // Inaudible (-70 dB) keep-alive hiss to prevent system audio chip sleep
      const al = ctx.createBufferSource();
      const ag = ctx.createGain();
      al.buffer = noiseBuf;
      al.loop = true;
      ag.gain.value = 0.0003;
      al.connect(ag);
      ag.connect(ctx.destination);
      al.start();

      ctx.onstatechange = () => {
        if (ctx.state !== 'running') ctx.resume().catch(() => {});
      };
    } catch {
      // AudioContext blocked
    }
  };

  const wake = () => {
    if (!ctx) build();
    if (ctx && ctx.state !== 'running') ctx.resume().catch(() => {});
  };

  if (typeof window !== 'undefined') {
    ['pointerdown', 'pointerup', 'click', 'keydown', 'touchend'].forEach((ev) =>
      window.addEventListener(ev, wake, { passive: true })
    );
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && ctx && ctx.state !== 'running') ctx.resume().catch(() => {});
    });
  }

  const tick = () => {
    if (!SFX_VOL || !ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime + 0.005;
    if (t - lastT < 0.06) return;
    lastT = t;

    try {
      const o = ctx.createOscillator();
      const og = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(300, t);
      o.frequency.exponentialRampToValueAtTime(160, t + 0.045);
      og.gain.setValueAtTime(0.0001, t);
      og.gain.linearRampToValueAtTime(SFX_VOL * 1.65, t + 0.001);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
      o.connect(og);
      og.connect(bus);
      o.start(t);
      o.stop(t + 0.07);

      const n = ctx.createBufferSource();
      const f = ctx.createBiquadFilter();
      const ng = ctx.createGain();
      n.buffer = noiseBuf;
      f.type = 'bandpass';
      f.frequency.value = 2500;
      f.Q.value = 1;
      ng.gain.setValueAtTime(0.0001, t);
      ng.gain.linearRampToValueAtTime(SFX_VOL * 1.5, t + 0.001);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.016);
      n.connect(f);
      f.connect(ng);
      ng.connect(bus);
      n.start(t);
      n.stop(t + 0.04);
    } catch {
      // tick audio failure ignored
    }
  };

  return {
    ctx: () => ctx,
    bus: () => bus,
    nb: () => noiseBuf,
    get vol() {
      return SFX_VOL;
    },
    set: (v) => {
      SFX_VOL = v;
      if (bus && ctx) bus.gain.setTargetAtTime(v ? 1 : 0, ctx.currentTime, 0.03);
    },
    tick,
    wake,
  };
})();

// Expose on window for components/handlers expecting window.SFX
if (typeof window !== 'undefined') {
  window.SFX = SFX;
  window.FSX = FSX;
}
