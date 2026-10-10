import React, { useEffect, useRef, useState } from 'react';
import ParticlesBackground from '../components/ParticlesBackground';
import { CERT, LOGO, SHOW_CERTS } from '../data/portfolioData';

export default function CertificateSection() {
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isPing, setIsPing] = useState(false);
  const btnRef = useRef(null);

  const initialCerts = CERT.slice(0, SHOW_CERTS);
  const extraCerts = CERT.slice(SHOW_CERTS);

  // 1. Certificate card viewport blur easing
  useEffect(() => {
    const sec = containerRef.current;
    if (!sec) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cards = [...sec.querySelectorAll('.cd')];
    const states = cards.map(() => ({ b: 0, o: 1, s: 1 }));
    let rafId = 0;

    const sm = (a, b, x) => {
      const v = Math.min(1, Math.max(0, (x - a) / (b - a)));
      return v * v * (3 - 2 * v);
    };

    const tick = () => {
      rafId = 0;
      const vh = window.innerHeight;
      const k = reduce ? 1 : 0.14;
      let busy = false;

      cards.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const cy = (r.top + r.bottom) / 2 / vh;
        const t = Math.max(sm(0.82, 0.99, cy), sm(0.2, 0.05, cy));
        const q = states[i];
        if (!q) return;
        const tb = 7 * t;
        const to = 1 - 0.5 * t;
        const ts = 1 - 0.04 * t;

        q.b += (tb - q.b) * k;
        q.o += (to - q.o) * k;
        q.s += (ts - q.s) * k;

        if (Math.abs(tb - q.b) > 0.02 || Math.abs(to - q.o) > 0.004) busy = true;

        c.style.filter = q.b > 0.05 ? `blur(${q.b.toFixed(2)}px)` : 'none';
        c.style.setProperty('--o', q.o.toFixed(3));
        c.style.setProperty('--s', q.s.toFixed(4));
        c.style.pointerEvents = t > 0.7 ? 'none' : '';
      });

      if (busy) rafId = requestAnimationFrame(tick);
    };

    const kick = () => {
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    kick();

    return () => {
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', kick);
      cancelAnimationFrame(rafId);
    };
  }, [isOpen]);

  // 2. Intersection observer for section entrance
  useEffect(() => {
    const sec = containerRef.current;
    if (!sec) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.target.classList.toggle('in', e.isIntersecting));
      },
      { threshold: 0.12 }
    );

    observer.observe(sec);
    return () => observer.disconnect();
  }, []);

  const handleToggle = () => {
    setIsPing(true);
    const willOpen = !isOpen;
    setIsOpen(willOpen);
    setIsDone(willOpen);
    window.dispatchEvent(new Event('resize'));
  };

  const renderCard = ([l, t, issuer, u], n) => {
    const hasLink = u !== '#';
    const Tag = hasLink ? 'a' : 'div';
    return (
      <div
        key={`${t}-${n}`}
        className="cw rv"
        style={{
          '--d': (n % 4) * 0.5 + Math.floor(n / 4) * 0.8 + 1,
          '--k': Math.max(0, n - SHOW_CERTS),
        }}
      >
        <Tag
          className={`cd p-${l}`}
          {...(hasLink
            ? {
                href: u,
                target: '_blank',
                rel: 'noopener',
                'aria-label': `Verify ${t} by ${issuer}`,
              }
            : {})}
        >
          <div className="ci">
            <img className="lo" src={LOGO[l]} alt="" draggable="false" />
            <h3>{t}</h3>
            <p>{issuer}</p>
            <span className="vt" aria-hidden="true">
              Verify
            </span>
          </div>
        </Tag>
      </div>
    );
  };

  return (
    <section id="certificate" ref={containerRef} className="dk">
      <ParticlesBackground containerRef={containerRef} />
      <div className="cwrap">
        <div className="chd rv">
          <h2>Certificate &amp; Achievements</h2>
          <p>
            Continuous learning drives my development process. Here are the verified credentials and academic milestones that shape my approach to technology.
          </p>
        </div>

        {/* Initial Cards */}
        <div className="cgrid" id="cgrid">
          {initialCerts.map((cert, n) => renderCard(cert, n))}
        </div>

        {/* Collapsible Drawer for Extra Cards */}
        {extraCerts.length > 0 && (
          <div
            id="cmx"
            className={`cmx ${isOpen ? 'open' : ''} ${isDone ? 'done' : ''}`}
            aria-hidden={!isOpen}
            inert={!isOpen ? '' : undefined}
          >
            <div className="cmi">
              <div className="cgrid cg2">
                {extraCerts.map((cert, n) => renderCard(cert, SHOW_CERTS + n))}
              </div>
            </div>
          </div>
        )}

        {/* See All / See Less Button */}
        {extraCerts.length > 0 && (
          <div className="cmore">
            <button
              ref={btnRef}
              type="button"
              className={`cbtn ${isPing ? 'ping' : ''}`}
              aria-expanded={isOpen}
              aria-controls="cmx"
              onClick={handleToggle}
              onAnimationEnd={() => setIsPing(false)}
            >
              <span>{isOpen ? 'See less' : 'See all'}</span>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 6l5 5 5-5" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
