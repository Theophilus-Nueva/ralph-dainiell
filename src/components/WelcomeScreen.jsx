import React, { useEffect, useRef, useState } from 'react';
import { shouldShowWelcome } from '../lib/utils';

const WORDS = ["Welcome", "Mabuhay", "欢迎", "ようこそ", "欢迎光临"];
const HOLD = [450, 230, 250, 250, 350];
const TYPE = 50;
const TYPE_CJK = 85;

export default function WelcomeScreen({ onComplete }) {
  const rootRef = useRef(null);
  const txtRef = useRef(null);
  const barRef = useRef(null);
  const [isRendered, setIsRendered] = useState(() => shouldShowWelcome());

  useEffect(() => {
    if (!shouldShowWelcome()) {
      window.WCB = false;
      document.documentElement.classList.remove('wc-hide', 'wc-lock');
      return;
    }

    const root = rootRef.current;
    const txt = txtRef.current;
    const bar = barRef.current;
    const de = document.documentElement;
    if (!root || !txt || !bar) return;

    window.WCB = true;
    de.classList.add('wc-lock', 'wc-hide');
    window.scrollTo(0, 0);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const cjk = (w) => /[\u3000-\u9fff]/.test(w);

    let over = false;
    let tok = 0;
    let rafId = null;

    const release = () => {
      window.WCB = false;
      de.classList.remove('wc-hide');
      const hm = document.getElementById('home');
      if (hm) hm.classList.add('in');
      if (onComplete) onComplete();
    };

    const end = () => {
      if (over) return;
      over = true;
      tok++;
      if (txt) txt.classList.remove('typ');
      root.classList.add('out');

      setTimeout(() => root.classList.add('clear'), reduce ? 0 : 120);
      setTimeout(release, reduce ? 0 : 300);
      setTimeout(() => {
        de.classList.remove('wc-lock');
        setIsRendered(false);
      }, reduce ? 500 : 700);
    };

    const skip = () => end();
    root.addEventListener('pointerdown', skip, { once: true });
    window.addEventListener('keydown', skip, { once: true });

    // Typing sequence schedule
    const EV = [];
    let T = 0;
    WORDS.forEach((s, w) => {
      const isC = cjk(s);
      const step = isC ? TYPE_CJK : TYPE;
      const er = isC ? 35 : 18;
      for (let i = 1; i <= s.length; i++) {
        EV.push([T, s.slice(0, i), 1]);
        T += step + Math.random() * 16 - 5;
      }
      EV.push([T, s, 0]);
      T += HOLD[w];
      if (w < WORDS.length - 1) {
        for (let i = s.length - 1; i >= 0; i--) {
          EV.push([T, s.slice(0, i), 1]);
          T += er;
        }
        EV.push([T, '', 0]);
        T += 50;
      }
    });

    const total = T;

    const go = async () => {
      await sleep(180);
      if (over) return;
      if (reduce) {
        if (txt) txt.textContent = WORDS[0];
        setTimeout(end, 1100);
        return;
      }

      bar.style.transition = `transform ${total}ms linear`;
      requestAnimationFrame(() => {
        bar.style.transform = 'scaleX(1)';
      });

      const my = ++tok;
      let t0 = null;
      let k = 0;
      let last = -1;

      const f = (now) => {
        if (my !== tok) return;
        if (t0 === null) t0 = now;
        const e = now - t0;

        while (k < EV.length && EV[k][0] <= e) k++;
        if (k !== last) {
          last = k;
          if (k > 0) {
            const ev = EV[k - 1];
            if (txt && txt.textContent !== ev[1]) txt.textContent = ev[1];
            if (txt) txt.classList.toggle('typ', !!ev[2]);
          }
        }

        if (e >= total) {
          end();
          return;
        }
        rafId = requestAnimationFrame(f);
      };

      rafId = requestAnimationFrame(f);
    };

    Promise.race([
      document.fonts && document.fonts.load ? document.fonts.load('400 1em "Geist Pixel"') : 0,
      sleep(900),
    ]).then(go, go);

    return () => {
      over = true;
      if (rafId) cancelAnimationFrame(rafId);
      root.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
    };
  }, [onComplete]);

  if (!isRendered) return null;

  return (
    <div id="wc" ref={rootRef} role="status" aria-label="Welcome">
      <p id="wct" ref={txtRef} aria-hidden="true"></p>
      <p id="wcs" aria-hidden="true">
        <span className="ms">click or press any key to skip</span>
        <span className="tp">tap to skip</span>
      </p>
      <i id="wcp" ref={barRef}></i>
    </div>
  );
}
