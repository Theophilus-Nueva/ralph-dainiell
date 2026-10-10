import React, { useEffect, useRef } from 'react';

const DENSITY = 5000;
const EASE = 80;
const STATICITY = 50;
const SIZE = 0.4;
const NB = 24;

export default function ParticlesBackground({ containerRef }) {
  const boxRef = useRef(null);
  const cvRef = useRef(null);

  useEffect(() => {
    const box = boxRef.current;
    const cv = cvRef.current;
    if (!box || !cv) return;

    const host = containerRef?.current || box.parentElement;
    if (!host) return;

    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let dpr = 1;
    let W = 0;
    let H = 0;
    let bw = 0;
    let bh = 0;
    let rgb = '255,255,255';
    let cs = [];
    let loop = false;
    let on = false;
    let tmr = 0;
    let dens = 0;
    const mouse = { x: 0, y: 0 };

    const getTone = () => {
      const sec = host.closest('section') || host;
      const m = getComputedStyle(sec).backgroundColor.match(/[\d.]+/g) || [0, 0, 0];
      return (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) / 255 > 0.5 ? '0,0,0' : '255,255,255';
    };

    const mk = () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      tx: 0,
      ty: 0,
      size: Math.floor(Math.random() * 2) + SIZE,
      a: 0,
      ta: +(Math.random() * 0.6 + 0.1).toFixed(2),
      dx: (Math.random() - 0.5) * 0.1,
      dy: (Math.random() - 0.5) * 0.1,
      mg: 0.1 + Math.random() * 4,
    });

    const bk = Array.from({ length: NB + 1 }, () => []);
    let fills = [];
    let fRgb = '';

    const alloc = (shrink) => {
      const nd = Math.min(1.5, window.devicePixelRatio || 1);
      const w = Math.ceil(W / 64) * 64;
      const need = Math.ceil(H / 64) * 64;
      if (shrink) {
        if (nd === dpr && bw === w && bh <= need + 64 && bh >= need) return false;
      } else if (nd === dpr && bw >= w && bh >= need) {
        return false;
      }
      dpr = nd;
      bw = w;
      bh = shrink ? need : need + 384;
      cv.width = bw * dpr;
      cv.height = bh * dpr;
      cv.style.width = bw + 'px';
      cv.style.height = bh + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    };

    const step = () => {
      ctx.clearRect(0, 0, bw, bh);
      if (fRgb !== rgb) {
        fRgb = rgb;
        fills = Array.from({ length: NB + 1 }, (_, k) => 'rgba(' + rgb + ',' + (k / NB).toFixed(3) + ')');
      }
      for (let k = 0; k <= NB; k++) bk[k].length = 0;

      const mx = mouse.x;
      const my = mouse.y;

      for (let i = 0; i < cs.length; i++) {
        const c = cs[i];
        const px = c.x + c.tx;
        const py = c.y + c.ty;
        const sz = c.size;
        const edge = Math.min(px - sz, W - px - sz, py - sz, H - py - sz);
        const r = edge > 0 ? edge / 20 : 0;

        if (reduce) c.a = c.ta;
        else if (r > 1) c.a = Math.min(c.a + 0.02, c.ta);
        else c.a = c.ta * r;

        if (!reduce) {
          c.x += c.dx;
          c.y += c.dy;
          c.tx += (mx / (STATICITY / c.mg) - c.tx) / EASE;
          c.ty += (my / (STATICITY / c.mg) - c.ty) / EASE;
        }

        const level = Math.max(0, Math.min(NB, (c.a * NB + 0.5) | 0));
        bk[level].push(c);

        if (c.x < -sz || c.x > W + sz || c.y < -sz || c.y > H + sz) {
          cs[i] = mk();
        }
      }

      for (let k = 1; k <= NB; k++) {
        const g = bk[k];
        if (!g.length) continue;
        ctx.fillStyle = fills[k];
        ctx.beginPath();
        for (let j = 0; j < g.length; j++) {
          const c = g[j];
          const x = c.x + c.tx;
          const y = c.y + c.ty;
          ctx.moveTo(x + c.size, y);
          ctx.arc(x, y, c.size, 0, 6.2831853);
        }
        ctx.fill();
      }
    };

    let rafId = 0;
    const frame = () => {
      if (!on) {
        loop = false;
        return;
      }
      step();
      rafId = requestAnimationFrame(frame);
    };

    const size = () => {
      const oW = W;
      const oH = H;
      W = host.clientWidth;
      H = host.clientHeight;
      if (bw && W === oW && H === oH) return;

      alloc(false);
      rgb = getTone();

      if (!dens || !oW || !oH) {
        const n = Math.min(300, Math.max(60, Math.round((W * H) / DENSITY)));
        dens = n / Math.max(1, W * H);
        cs = Array.from({ length: n }, mk);
      } else {
        cs = cs.filter((c) => c.x <= W + c.size && c.y <= H + c.size);
        const n = Math.max(60, Math.round(dens * W * H));
        if (cs.length > n) cs.length = n;
        while (cs.length < n) {
          const c = mk();
          c.a = c.ta;
          for (let t = 0; t < 30 && c.x < oW && c.y < oH; t++) {
            c.x = Math.random() * W;
            c.y = Math.random() * H;
          }
          cs.push(c);
        }
      }

      step();
      clearTimeout(tmr);
      tmr = setTimeout(() => {
        if (alloc(true)) step();
      }, 400);
    };

    const resizeObs = new ResizeObserver(size);
    resizeObs.observe(host);

    const interObs = new IntersectionObserver(
      (entries) => {
        on = entries[0]?.isIntersecting;
        if (on && !loop) {
          loop = true;
          rafId = requestAnimationFrame(frame);
        }
      },
      { threshold: 0.05 }
    );
    interObs.observe(host);

    const handlePointerMove = (e) => {
      if (!on) return;
      const r = box.getBoundingClientRect();
      const x = e.clientX - r.left - W / 2;
      const y = e.clientY - r.top - H / 2;
      if (x < W / 2 && x > -W / 2 && y < H / 2 && y > -H / 2) {
        mouse.x = x;
        mouse.y = y;
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      resizeObs.disconnect();
      interObs.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      clearTimeout(tmr);
      cancelAnimationFrame(rafId);
    };
  }, [containerRef]);

  return (
    <div ref={boxRef} className="ptc" aria-hidden="true">
      <canvas ref={cvRef} />
    </div>
  );
}
