import React, { useEffect, useRef } from 'react';
import { SECTIONS } from '../data/portfolioData';
import { SFX } from '../lib/sound';

const M = SECTIONS.length - 1;
const N = M * 10 + 1; // 41 ticks

export default function RailNav({ onNavigate, pulseRef }) {
  const railRef = useRef(null);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = [];

    // Clear and build ticks
    rail.innerHTML = '';
    for (let i = 0; i < N; i++) {
      const isMajor = i % 10 === 0;
      const d = document.createElement('div');
      d.className = 't' + (isMajor ? ' major' : '');
      d.innerHTML = (isMajor ? `<b>${SECTIONS[i / 10].name}</b>` : '') + '<i></i>';
      rail.appendChild(d);
      els.push({ d, i: d.querySelector('i'), isMajor, label: isMajor ? SECTIONS[i / 10].name : '' });
    }

    const sec = (k) => document.getElementById(SECTIONS[k].id);
    const maxY = () => document.documentElement.scrollHeight - window.innerHeight;
    const SLACK = 48;
    const tall = (k) => (sec(k)?.offsetHeight || 0) > window.innerHeight + SLACK;
    const lo = (k) => Math.min(sec(k)?.offsetTop || 0, maxY());
    const hi = (k) =>
      tall(k)
        ? Math.min(Math.max(lo(k), (sec(k)?.offsetTop || 0) + (sec(k)?.offsetHeight || 0) - window.innerHeight), maxY())
        : lo(k);

    function scrollPos() {
      const max = maxY();
      const y = window.scrollY;
      if (max <= 0) return 0;
      const tops = SECTIONS.map((s) => Math.min(document.getElementById(s.id)?.offsetTop || 0, max));
      let k = 0;
      for (let j = 0; j < tops.length; j++) {
        if (y >= tops[j] - 1) k = j;
      }
      const a = tops[k];
      const b = tops[k + 1];
      return b !== undefined && b > a ? k + Math.min(1, Math.max(0, (y - a) / (b - a))) : k;
    }

    function railPos() {
      const p = scrollPos();
      if (p <= M - 1) return p;
      if (p < M) return M - 1 + (p - (M - 1)) * 0.5;
      const a = lo(M);
      const b = hi(M);
      return M - 0.5 + 0.5 * Math.min(1, Math.max(0, b > a ? (window.scrollY - a) / (b - a) : 1));
    }

    let hover = null;
    let target = railPos();
    let cur = target;
    let vel = 0;
    let amp = 24;
    let avel = 0;
    let raf = 0;
    let last = -1;
    let lastHov = -1;
    let pulse = null;
    const t0 = performance.now();
    const INTRO = N * 18 + 700;

    if (pulseRef) {
      pulseRef.current = (c) => {
        pulse = { c, t: performance.now() };
        kick();
      };
    }

    function render(now) {
      els.forEach((e, idx) => {
        const p = reduce ? 1 : Math.min(1, Math.max(0, (now - t0 - idx * 18) / 700));
        const ease = 1 - Math.pow(1 - p, 3);
        const dd = idx / 10 - cur;
        const g = Math.exp(-(dd * dd) / (2 * 0.25 * 0.25));
        const here = e.isMajor && idx / 10 === last;
        let pw = 0;

        if (pulse && !reduce) {
          const t = (now - pulse.t) / 900;
          if (t < 1) {
            const dist = Math.abs(idx - pulse.c) - t * 16;
            pw = Math.exp((-dist * dist) / 9.7) * (1 - t) * 18;
          }
        }

        const hb = here && !(last === M && cur < M - 0.3);
        e.i.style.width = ((e.isMajor ? 14 : 8) + amp * g + (hb ? 10 : 0) + pw) * ease + 'px';
        e.i.style.opacity = (Math.max(0.28 + 0.72 * g, hb ? 0.9 : 0, pw > 2 ? 0.85 : 0) * ease).toFixed(2);
        e.d.classList.toggle('on', e.isMajor && (hover !== null ? Math.abs(dd) < 0.3 : here));
        e.d.classList.toggle('here', here);
      });
    }

    function tick(now) {
      raf = 0;
      const ampT = hover !== null ? 46 : 24;
      if (reduce) {
        cur = target;
        amp = ampT;
        vel = avel = 0;
      } else {
        vel += (target - cur) * 0.14;
        vel *= 0.76;
        cur += vel;
        avel += (ampT - amp) * 0.14;
        avel *= 0.76;
        amp += avel;
      }
      render(now);
      const busy =
        Math.abs(target - cur) > 0.002 ||
        Math.abs(vel) > 0.002 ||
        Math.abs(ampT - amp) > 0.2 ||
        Math.abs(avel) > 0.05 ||
        now - t0 < INTRO ||
        (pulse && now - pulse.t < 900);
      if (busy) raf = requestAnimationFrame(tick);
    }

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    let sleepT = 0;
    let scr = null;

    function stopScr() {
      if (!scr) return;
      cancelAnimationFrame(scr.raf);
      clearTimeout(scr.end);
      scr.items.forEach((it) => {
        it.el.textContent = it.txt;
      });
      scr = null;
    }

    function scramble() {
      const items = [...rail.querySelectorAll('.t.major b')].map((el) => ({
        el,
        txt: el.textContent,
      }));
      if (reduce || !items.length) {
        rail.classList.remove('awake');
        return;
      }
      const G = '01ABCDEF#$%&@*+<>/|=?';
      const T = 320;
      const st = performance.now();

      items.forEach((it) => {
        it.o = [...it.txt];
        it.sp = it.o.map((c) => {
          const sp = document.createElement('span');
          sp.textContent = c;
          sp.style.display = 'inline-block';
          return sp;
        });
        it.el.textContent = '';
        it.sp.forEach((sp) => it.el.appendChild(sp));
        it.sp.forEach((sp) => {
          sp.style.width = sp.getBoundingClientRect().width + 'px';
          sp.style.textAlign = 'center';
        });
        it.at = it.o.map((_, i) => i * 15 + Math.random() * 40);
      });

      scr = { items, raf: 0, end: 0 };
      let lastU = 0;

      const step = (now) => {
        const t = now - st;
        if (now - lastU > 32) {
          lastU = now;
          items.forEach((it) =>
            it.sp.forEach((sp, i) => {
              if (t > it.at[i]) sp.textContent = G[(Math.random() * G.length) | 0];
            })
          );
        }
        if (t < T) {
          scr.raf = requestAnimationFrame(step);
        }
      };

      scr.raf = requestAnimationFrame(step);
      scr.end = setTimeout(() => {
        rail.classList.remove('awake');
        scr.end = setTimeout(stopScr, 250);
      }, T);
    }

    function wake(hold) {
      stopScr();
      rail.classList.add('awake');
      clearTimeout(sleepT);
      if (!hold) sleepT = setTimeout(scramble, 600);
    }

    function sync() {
      const k = Math.min(M, Math.floor(scrollPos() + 1 - 0.55));
      if (k !== last) {
        last = k;
        wake(false);
        rail.setAttribute('aria-valuenow', String(k));
        rail.setAttribute('aria-valuetext', SECTIONS[k].name);
      }
      if (hover === null) {
        target = railPos();
        kick();
      }
    }

    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);

    function hoverFrom(ev) {
      const a = els[0].d.getBoundingClientRect();
      const b = els[N - 1].d.getBoundingClientRect();
      const span = b.top - a.top;
      const raw = span > 0 ? Math.min(M, Math.max(0, ((ev.clientY - a.top) / span) * M)) : 0;
      const r = Math.round(raw);
      hover = Math.abs(raw - r) < 0.25 ? raw + (r - raw) * 0.6 : raw;
      target = hover;
      if (r !== lastHov) {
        lastHov = r;
        if (typeof SFX?.tick === 'function') SFX.tick();
        else if (typeof SFX === 'function') SFX();
      }
      kick();
      wake(true);
    }

    const onPointerMove = (e) => hoverFrom(e);
    const onPointerDown = (e) => hoverFrom(e);

    const onPointerLeave = () => {
      hover = null;
      lastHov = -1;
      target = railPos();
      kick();
      wake(false);
    };

    function sectionFromY(clientY) {
      if (!els.length) return 0;
      const a = els[0].d.getBoundingClientRect();
      const b = els[N - 1].d.getBoundingClientRect();
      const span = b.top - a.top;
      if (span <= 0) return 0;
      const raw = Math.min(M, Math.max(0, ((clientY - a.top) / span) * M));
      return Math.round(raw);
    }

    const onClick = (e) => {
      let targetSec = -1;
      const tick = e.target.closest('.t');
      if (tick) {
        const idx = els.findIndex((item) => item.d === tick);
        if (idx !== -1) {
          targetSec = Math.round(idx / 10);
        }
      }
      if (targetSec === -1 && typeof e.clientY === 'number') {
        targetSec = sectionFromY(e.clientY);
      }
      if (targetSec === -1 && hover !== null) {
        targetSec = Math.round(hover);
      }

      if (targetSec >= 0 && targetSec <= M && onNavigate) {
        if (typeof SFX?.tick === 'function') SFX.tick();
        else if (typeof SFX === 'function') SFX();
        onNavigate(targetSec);
      }
    };

    const onKeyDown = (e) => {
      const k = Math.min(M, Math.floor(scrollPos() + 1 - 0.55));
      const n = { ArrowUp: k - 1, ArrowLeft: k - 1, ArrowDown: k + 1, ArrowRight: k + 1, Home: 0, End: M }[e.key];
      if (n === undefined) return;
      e.preventDefault();
      wake(false);
      if (onNavigate) onNavigate(Math.min(M, Math.max(0, n)));
    };

    rail.addEventListener('pointermove', onPointerMove);
    rail.addEventListener('pointerdown', onPointerDown);
    rail.addEventListener('pointerleave', onPointerLeave);
    rail.addEventListener('click', onClick);
    rail.addEventListener('keydown', onKeyDown);

    sync();
    kick();
    wake(false);

    return () => {
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
      rail.removeEventListener('pointermove', onPointerMove);
      rail.removeEventListener('pointerdown', onPointerDown);
      rail.removeEventListener('pointerleave', onPointerLeave);
      rail.removeEventListener('click', onClick);
      rail.removeEventListener('keydown', onKeyDown);
      clearTimeout(sleepT);
      stopScr();
      cancelAnimationFrame(raf);
    };
  }, [onNavigate, pulseRef]);

  return (
    <nav
      id="rail"
      ref={railRef}
      role="slider"
      tabIndex={0}
      aria-label="Page sections"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={M}
      aria-valuenow={0}
      aria-valuetext="HOME"
    />
  );
}
