import React, { useEffect, useRef } from 'react';
import { SFX } from '../lib/sound';

const DARK_SECTIONS = {
  home: false,
  works: true,
  certificate: true,
  stack: false,
  connect: false,
};

export default function CustomCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;

    const cur = cursorRef.current;
    if (!cur) return;

    let lastH = null;

    const handlePointerMove = (e) => {
      cur.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      cur.classList.add('on');

      const target = e.target;
      if (!target || !target.closest) return;

      const sec = target.closest('section');
      cur.classList.toggle('dk', !!(sec && DARK_SECTIONS[sec.id]));

      const h = target.closest('.cd, a, button, #rail');
      const hs = target.closest('.cd, .b, a, button, #rail');
      cur.classList.toggle('hov', !!h);
      cur.classList.toggle('gone', !!target.closest('#ghc, .ghl'));

      if (hs !== lastH) {
        lastH = hs;
        if (hs) SFX.tick();
      }
    };

    const handlePointerDown = () => cur.classList.add('dn');
    const handlePointerUp = () => cur.classList.remove('dn');
    const handlePointerLeave = () => {
      cur.classList.remove('on');
      lastH = null;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    document.documentElement.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.documentElement.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  return <div id="cur" ref={cursorRef} aria-hidden="true" />;
}
