import { useEffect, useRef, useState, useCallback } from 'react';
import { SECTIONS } from '../data/portfolioData';

const M = SECTIONS.length - 1;
const SW = 0.55;
const TH = 60; // Sensitive enough for laptop trackpads
const ACC_MS = 400;
const CX_GO = 650;
const CX_HOLD = 1000; // 1-second stop at "We've exhausted the pleasantries."
const CX_GLIDE = 800;

export function usePageNavigation({ onSectionChange, pulseRef }) {
  const [activeIdx, setActiveIdx] = useState(0);

  const cxRunRef = useRef(false);
  const navBusyRef = useRef(false);
  const lockWRef = useRef(false);
  const lastWRef = useRef(0);
  const accRef = useRef(0);
  const accTRef = useRef(0);
  const sTRef = useRef(null);
  const sRafRef = useRef(0);
  const twRef = useRef(0);
  const tyRef = useRef(0);
  const stTRef = useRef(0);

  const sec = useCallback((k) => document.getElementById(SECTIONS[k].id), []);
  const maxY = useCallback(
    () => document.documentElement.scrollHeight - window.innerHeight,
    []
  );

  const SLACK = 48;
  const tall = useCallback(
    (k) => (sec(k)?.offsetHeight || 0) > window.innerHeight + SLACK,
    [sec]
  );

  const lo = useCallback(
    (k) => Math.min(sec(k)?.offsetTop || 0, maxY()),
    [sec, maxY]
  );

  const hi = useCallback(
    (k) =>
      tall(k)
        ? Math.min(
            Math.max(lo(k), (sec(k)?.offsetTop || 0) + (sec(k)?.offsetHeight || 0) - window.innerHeight),
            maxY()
          )
        : lo(k),
    [tall, lo, sec, maxY]
  );

  const curSec = useCallback(() => {
    let k = 0;
    const y = window.scrollY;
    for (let j = 0; j <= M; j++) {
      if (y >= lo(j) - 40) k = j;
    }
    return k;
  }, [lo]);

  const wcOn = useCallback(
    () => cxRunRef.current || document.documentElement.classList.contains('wc-lock'),
    []
  );

  // Smooth intra-page scrolling
  const sStep = useCallback(function step() {
    sRafRef.current = 0;
    if (sTRef.current === null) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const d = sTRef.current - window.scrollY;
    if (reduce || Math.abs(d) < 0.6) {
      window.scrollTo({ top: sTRef.current, behavior: 'instant' });
      sTRef.current = null;
      return;
    }
    let st = d * 0.13;
    if (Math.abs(st) < 1) st = Math.sign(d) * Math.min(1, Math.abs(d));
    window.scrollTo({ top: window.scrollY + st, behavior: 'instant' });
    sRafRef.current = requestAnimationFrame(step);
  }, []);

  const smoothTo = useCallback(
    (y) => {
      sTRef.current = Math.max(0, Math.min(maxY(), y));
      if (!sRafRef.current) {
        sRafRef.current = requestAnimationFrame(sStep);
      }
    },
    [maxY, sStep]
  );

  const tweenTo = useCallback(
    (y, slow, ms) => {
      cancelAnimationFrame(sRafRef.current);
      sRafRef.current = 0;
      sTRef.current = null;
      cancelAnimationFrame(twRef.current);

      const targetY = Math.max(0, Math.min(maxY(), y));
      const y0 = window.scrollY;
      const d = targetY - y0;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduce || Math.abs(d) < 2) {
        window.scrollTo({ top: targetY, behavior: 'instant' });
        navBusyRef.current = false;
        return;
      }

      const T = ms || (slow ? 1400 : Math.min(1100, 520 + (Math.abs(d) / window.innerHeight) * 200));
      const st = performance.now();
      navBusyRef.current = true;

      const f = (now) => {
        const p = Math.min(1, (now - st) / T);
        const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        window.scrollTo({ top: y0 + (targetY - y0) * e, behavior: 'instant' });
        if (p < 1) {
          twRef.current = requestAnimationFrame(f);
        } else {
          navBusyRef.current = false;
        }
      };

      twRef.current = requestAnimationFrame(f);
    },
    [maxY]
  );

  const rel = useCallback(function release() {
    if (navBusyRef.current) {
      setTimeout(release, 50);
    } else {
      lockWRef.current = false;
      accRef.current = 0;
    }
  }, []);

  const cxIdle = useCallback(
    () =>
      new Promise((r) => {
        const t = () => (navBusyRef.current ? requestAnimationFrame(t) : r());
        requestAnimationFrame(t);
      }),
    []
  );

  const cxWait = (ms) => new Promise((r) => setTimeout(r, ms));

  const connectFlow = useCallback(async () => {
    if (cxRunRef.current || wcOn()) return;
    cxRunRef.current = true;
    navBusyRef.current = true;
    lockWRef.current = true;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    try {
      if (pulseRef?.current) pulseRef.current(M * 10);
      tweenTo(lo(M), false, CX_GO);
      await cxIdle();
      await cxWait(reduce ? 700 : CX_HOLD);
      tweenTo(hi(M), true, CX_GLIDE);
      await cxIdle();
    } finally {
      cxRunRef.current = false;
      navBusyRef.current = false;
      lockWRef.current = false;
      accRef.current = 0;
    }
  }, [wcOn, pulseRef, tweenTo, lo, hi, cxIdle]);

  const navTo = useCallback(
    (n, dir) => {
      lockWRef.current = true;
      if (pulseRef?.current) pulseRef.current(n * 10);
      if (n === M && dir > 0) {
        connectFlow();
        return;
      }
      tweenTo(dir < 0 ? hi(n) : lo(n), (dir > 0 && n === 4) || (dir < 0 && n === 3));
      setTimeout(rel, 300);
    },
    [hi, lo, pulseRef, tweenTo, rel, connectFlow]
  );

  const stepPage = useCallback(
    (dir, dy, big = true) => {
      const k = curSec();
      const y = sTRef.current !== null ? sTRef.current : window.scrollY;

      // When at Connect (section M):
      if (k === M) {
        const a = lo(M);
        const b = hi(M);
        // Scroll down toward the bottom of Connect
        if (dir > 0 && y < b - 15) {
          if (big) {
            accRef.current = 0;
            lockWRef.current = true;
            tweenTo(b, true);
            setTimeout(rel, 300);
          }
          return;
        }
        // Scroll up from bottom of Connect back to top of Connect
        if (dir < 0 && y > a + 15) {
          if (big) {
            accRef.current = 0;
            lockWRef.current = true;
            tweenTo(a, true);
            setTimeout(rel, 300);
          }
          return;
        }
      }

      const amt = dir * (Math.abs(dy) < 1 ? 40 : Math.abs(dy)) * 1.3;
      if (dir > 0 && y < hi(k) - 15) {
        smoothTo(Math.min(y + amt, hi(k)));
        return;
      }
      if (dir < 0 && y > lo(k) + 15) {
        if (tall(k)) {
          smoothTo(Math.max(y + amt, lo(k)));
        } else if (big) {
          accRef.current = 0;
          lockWRef.current = true;
          if (pulseRef?.current) pulseRef.current(k * 10);
          tweenTo(lo(k));
          setTimeout(rel, 300);
        }
        return;
      }

      // Cross sections
      if (big) {
        const n = k + dir;
        if (n >= 0 && n <= M) {
          accRef.current = 0;
          navTo(n, dir);
        }
      }
    },
    [curSec, lo, hi, tall, tweenTo, smoothTo, navTo, rel, pulseRef]
  );

  const navigateTo = useCallback(
    (k) => {
      if (wcOn()) return;
      if (k === M) {
        connectFlow();
        return;
      }
      const c = curSec();
      if (pulseRef?.current) pulseRef.current(k * 10);
      tweenTo(lo(k), (c === 3 && k === 4) || (c === 4 && k === 3));
    },
    [wcOn, curSec, pulseRef, tweenTo, lo, connectFlow]
  );

  // Main input events: wheel, touch, keys, settle, fit
  useEffect(() => {
    // 1. Viewport scaler --u
    const fit = () => {
      const w = Math.min(1, (window.innerWidth - 96) / 560);
      const h = window.innerWidth > 900 ? (window.innerHeight - 590) / 414 : 1;
      document.documentElement.style.setProperty(
        '--u',
        Math.max(0.55, Math.min(w, h)).toFixed(3)
      );
    };
    fit();
    window.addEventListener('resize', fit);

    // 2. Wheel gesture listener
    const onWheel = (e) => {
      if (e.ctrlKey) return;
      e.preventDefault();
      if (wcOn() || navBusyRef.current || lockWRef.current) return;

      const now = performance.now();
      lastWRef.current = now;

      const d = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
      if (Math.abs(d) < 1) return;

      const dir = d > 0 ? 1 : -1;
      if (now - accTRef.current > ACC_MS || Math.sign(accRef.current) !== dir) {
        accRef.current = 0;
      }
      accRef.current += d;
      accTRef.current = now;
      const big = Math.abs(accRef.current) >= TH;

      stepPage(
        dir,
        Math.max(-140, Math.min(140, d)),
        big
      );
    };

    // 3. Touch listeners
    const onTouchStart = (e) => {
      tyRef.current = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      if ((wcOn() || curSec() === M) && e.cancelable) {
        e.preventDefault();
      }
    };

    const onTouchEnd = (e) => {
      const dy = tyRef.current - e.changedTouches[0].clientY;
      if (Math.abs(dy) < 40 || navBusyRef.current || lockWRef.current || wcOn()) return;
      const d = dy > 0 ? 1 : -1;
      stepPage(d, 0, true);
    };

    // 4. Keyboard navigation
    const onKeyDown = (e) => {
      if (
        e.defaultPrevented ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)
      )
        return;

      const K = {
        ArrowDown: [1, 100],
        PageDown: [1, window.innerHeight * 0.85],
        ArrowUp: [-1, -100],
        PageUp: [-1, -window.innerHeight * 0.85],
        Home: [0],
        End: [2],
      };
      const a = e.key === ' ' ? (e.shiftKey ? K.PageUp : K.PageDown) : K[e.key];
      if (!a) return;
      e.preventDefault();
      if (navBusyRef.current || lockWRef.current || wcOn()) return;

      if (a[0] === 0) navigateTo(0);
      else if (a[0] === 2) navigateTo(M);
      else stepPage(a[0], a[1], true);
    };

    // 5. Settle step
    function settle() {
      if (navBusyRef.current || lockWRef.current || cxRunRef.current) return;
      const y = window.scrollY;
      let best = y;
      let bd = 1e9;
      for (let k = 0; k <= M; k++) {
        const a = lo(k);
        const b = hi(k);
        if (y >= a - 1 && y <= b + 1) return;
        [a, b].forEach((q) => {
          const d = Math.abs(q - y);
          if (d < bd) {
            bd = d;
            best = q;
          }
        });
      }
      tweenTo(best);
    }

    const later = () => {
      clearTimeout(stTRef.current);
      stTRef.current = setTimeout(settle, 180);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', later, { passive: true });
    window.addEventListener('resize', later);

    // Section in-view awareness
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.target.id === 'home' && window.WCB) return;
          e.target.classList.toggle('in', e.isIntersecting);
          if (e.isIntersecting) {
            const idx = SECTIONS.findIndex((s) => s.id === e.target.id);
            if (idx !== -1) {
              setActiveIdx(idx);
              if (onSectionChange) onSectionChange(idx);
            }
          }
        });
      },
      { threshold: SW }
    );

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });

    return () => {
      window.removeEventListener('resize', fit);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', later);
      window.removeEventListener('resize', later);
      clearTimeout(stTRef.current);
      io.disconnect();
    };
  }, [wcOn, curSec, hi, lo, tall, stepPage, navigateTo, tweenTo, onSectionChange]);

  return {
    activeIdx,
    navigateTo,
    connectFlow,
  };
}
