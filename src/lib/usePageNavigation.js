import { useEffect, useState, useCallback } from 'react';
import { SECTIONS } from '../data/portfolioData';

const M = SECTIONS.length - 1;

export function usePageNavigation({ onSectionChange, pulseRef }) {
  const [activeIdx, setActiveIdx] = useState(0);

  const sec = useCallback((k) => {
    if (k < 0 || k > M) return null;
    return document.getElementById(SECTIONS[k].id);
  }, []);

  const curSec = useCallback(() => {
    const y = window.scrollY;
    let k = 0;
    for (let j = 0; j <= M; j++) {
      const el = sec(j);
      if (el && y >= el.offsetTop - window.innerHeight * 0.4) {
        k = j;
      }
    }
    return k;
  }, [sec]);

  // Smooth navigation to a specific section index (0 to M)
  const navigateTo = useCallback(
    (k) => {
      if (k < 0 || k > M) return;
      const el = sec(k);
      if (!el) return;
      if (pulseRef?.current) pulseRef.current(k * 10);
      el.scrollIntoView({ behavior: 'smooth' });
    },
    [sec, pulseRef]
  );

  // Connect button flow: scrolls smoothly to the last section (CONNECT)
  const connectFlow = useCallback(() => {
    const el = sec(M);
    if (!el) return;
    if (pulseRef?.current) pulseRef.current(M * 10);
    el.scrollIntoView({ behavior: 'smooth' });
  }, [sec, pulseRef]);

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

    // 2. Keyboard navigation
    const onKeyDown = (e) => {
      if (
        e.defaultPrevented ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)
      )
        return;

      const k = curSec();
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        navigateTo(Math.min(M, k + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        navigateTo(Math.max(0, k - 1));
      } else if (e.key === 'Home') {
        e.preventDefault();
        navigateTo(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        navigateTo(M);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    // 3. Section in-view awareness via IntersectionObserver
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
      { threshold: 0.35 }
    );

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });

    return () => {
      window.removeEventListener('resize', fit);
      window.removeEventListener('keydown', onKeyDown);
      io.disconnect();
    };
  }, [curSec, navigateTo, onSectionChange]);

  return {
    activeIdx,
    navigateTo,
    connectFlow,
  };
}
