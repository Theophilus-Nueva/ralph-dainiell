import React, { useEffect, useRef } from 'react';
import ParticlesBackground from '../components/ParticlesBackground';
import {
  CN_TEXT,
  CN_SUB,
  SCHEDULE_URL,
  SCHED_OK,
  SCHED_MAIL,
  CN_URL,
} from '../data/portfolioData';

// iOS superellipse shape
const CN_SQ = (() => {
  let d = '';
  for (let i = 0; i <= 180; i++) {
    const t = (i / 180) * 6.2831853;
    const c = Math.cos(t);
    const n = Math.sin(t);
    d +=
      (i ? 'L' : 'M') +
      (50 + 50 * Math.sign(c) * Math.pow(Math.abs(c), 0.4)).toFixed(2) +
      ' ' +
      (50 + 50 * Math.sign(n) * Math.pow(Math.abs(n), 0.4)).toFixed(2);
  }
  return d + 'Z';
})();

const cnIcon = (k, defs, bg, glyph) => (
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <defs>
      <path id={`sq${k}`} d={CN_SQ} />
      <linearGradient id={`sh${k}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity=".30" />
        <stop offset=".5" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity=".07" />
      </linearGradient>
      <linearGradient id={`ed${k}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity=".65" />
        <stop offset=".4" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#fff" stopOpacity=".18" />
      </linearGradient>
      <clipPath id={`cp${k}`}>
        <use href={`#sq${k}`} />
      </clipPath>
      {defs}
    </defs>
    <use href={`#sq${k}`} fill={bg} />
    <g clipPath={`url(#cp${k})`}>
      {glyph}
      <use href={`#sq${k}`} fill={`url(#sh${k})`} />
    </g>
    <use
      href={`#sq${k}`}
      fill="none"
      stroke={`url(#ed${k})`}
      strokeWidth="1.1"
      transform="translate(50 50) scale(.989) translate(-50 -50)"
    />
  </svg>
);

export default function ConnectSection() {
  const containerRef = useRef(null);
  const cstRef = useRef(null);
  const aRef = useRef(null);
  const bRef = useRef(null);
  const rcRef = useRef(null);

  useEffect(() => {
    const sec = containerRef.current;
    const cst = cstRef.current;
    const A = aRef.current;
    const B = bRef.current;
    const rc = rcRef.current;
    if (!sec || !cst || !A || !B) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lines = [...A.querySelectorAll('.cl')];
    const chars = lines.flatMap((l) => [...l.children]);
    const cc = Math.floor(chars.length / 2);
    const icons = [...B.querySelectorAll('.cic a')];
    const ic = (icons.length - 1) / 2;
    const RCK = rc ? [...rc.querySelectorAll('.rc-t, .rc-hr, .rc-p, .rc-b')] : [];
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

    const GAP = 34;
    const LEN = 2.1;
    const CA = 1.05;
    const CB = 2.15;
    const TRAVEL = 1.55;
    const REST = 0.55;
    const LEAD = 1;
    let raf = 0;

    function layoutRc(h) {
      if (!rc) return;
      const sub = B.querySelector('.csub');
      const row = B.querySelector('.cic');
      const hB = (sub?.offsetHeight || 0) + 20 + (row?.offsetHeight || 0);
      const hC = rc.offsetHeight;
      if (!hC) return;
      const P = Math.max(0, Math.min(hC + GAP, h - hB - 32));
      B.style.paddingBottom = `${P}px`;
      rc.style.top = `${((h - P) / 2 + hB / 2 + GAP).toFixed(1)}px`;
    }

    function size() {
      const h = window.innerHeight;
      sec.style.height = `${h * LEN}px`;
      cst.style.height = `${h}px`;
      layoutRc(h);
    }

    function draw() {
      raf = 0;
      const h = window.innerHeight;
      const in_ = window.scrollY - sec.offsetTop;
      const P = clamp(1 + in_ / h);
      const S = clamp(in_, 0, h * (LEN - 1)) / h + REST - (1 - P) * LEAD;
      const yA = CA - S - 0.5;
      const yB = CB - S - 0.5;

      A.style.transform = `translate3d(0, ${(yA * h).toFixed(1)}px, 0)`;
      B.style.transform = `translate3d(0, ${(yB * h).toFixed(1)}px, 0)`;

      const fA = reduce ? 1 : clamp(1 - yA / TRAVEL);
      const fB = reduce ? 1 : clamp(1 - yB / TRAVEL);
      const r = 1 - fA;

      chars.forEach((c, i) => {
        const d = i - cc;
        c.style.transform =
          r < 0.0005 ? 'none' : `translateX(${(d * 50 * r).toFixed(1)}px) rotateX(${(d * 50 * r).toFixed(1)}deg)`;
      });

      const q = 1 - fB;
      icons.forEach((a, i) => {
        const d = (i - ic) * 2;
        const sc = 0.75 + 0.25 * fB;
        a.style.transform = `translate(${(d * 50 * q).toFixed(1)}px, ${(Math.abs(d) * 50 * q).toFixed(1)}px) scale(${sc.toFixed(3)})`;
      });

      if (rc) {
        const p = reduce ? 1 : clamp((fB - 0.5) / 0.5);
        const e = 1 - Math.pow(1 - p, 3);
        const pp = rc.querySelector('.rcp');
        if (pp) {
          pp.style.transform =
            e >= 0.999 ? 'none' : `translate3d(0, ${((1 - e) * 36).toFixed(1)}px, 0) scale(${+(0.96 + 0.04 * e).toFixed(4)})`;
        }
        rc.style.opacity = e.toFixed(3);
        rc.style.visibility = e < 0.004 ? 'hidden' : 'visible';

        RCK.forEach((el, i) => {
          const t = reduce ? 1 : clamp((e - 0.18 - i * 0.14) / 0.44);
          const k = 1 - Math.pow(1 - t, 3);
          el.style.opacity = k.toFixed(3);
          el.style.translate = k >= 0.999 ? 'none' : `0 ${((1 - k) * 12).toFixed(1)}px`;
          if (el.tagName === 'HR') {
            el.style.transformOrigin = 'center';
            el.style.transform = k >= 0.999 ? 'none' : `scaleX(${k.toFixed(3)})`;
          }
        });
        rc.style.pointerEvents = e > 0.9 ? 'auto' : 'none';
      }
    }

    const kickC = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    size();
    draw();

    window.addEventListener('scroll', kickC, { passive: true });
    window.addEventListener('resize', () => {
      size();
      kickC();
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        size();
        kickC();
      });
    }

    return () => {
      window.removeEventListener('scroll', kickC);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="connect" ref={containerRef} className="lt">
      <div className="cst" ref={cstRef}>
        <ParticlesBackground containerRef={cstRef} />

        {/* Block A: 3D Converging Headline */}
        <div className="cly" id="cA" ref={aRef}>
          <h2 style={{ margin: 0, display: 'contents' }} aria-label={CN_TEXT.join(' ')}>
            {CN_TEXT.map((ln) => (
              <div key={ln} className="cl" aria-hidden="true">
                {[...ln].map((ch, ci) =>
                  ch === ' ' ? (
                    <span key={ci} className="sp" />
                  ) : (
                    <span key={ci}>{ch}</span>
                  )
                )}
              </div>
            ))}
          </h2>
        </div>

        {/* Block B: Subtext, Converging App Icons, Receipt Card, Footer */}
        <div className="cly" id="cB" ref={bRef}>
          <p className="csub">{CN_SUB}</p>

          <div className="cic">
            {/* Instagram */}
            <a href={CN_URL.instagram} aria-label="Instagram" target="_blank" rel="noopener">
              {cnIcon(
                'i',
                <>
                  <radialGradient id="ig1" cx=".3" cy="1.07" r="1.15">
                    <stop offset="0" stopColor="#fd5" />
                    <stop offset=".1" stopColor="#fd5" />
                    <stop offset=".5" stopColor="#ff543e" />
                    <stop offset="1" stopColor="#c837ab" />
                  </radialGradient>
                  <radialGradient id="ig2" cx="-.17" cy=".07" r=".8">
                    <stop offset="0" stopColor="#3771c8" />
                    <stop offset=".128" stopColor="#3771c8" />
                    <stop offset="1" stopColor="#60f" stopOpacity="0" />
                  </radialGradient>
                </>,
                'url(#ig1)',
                <>
                  <use href="#sqi" fill="url(#ig2)" />
                  <rect x="22" y="22" width="56" height="56" rx="17" fill="none" stroke="#fff" strokeWidth="5.4" />
                  <circle cx="50" cy="50" r="13.2" fill="none" stroke="#fff" strokeWidth="5.4" />
                  <circle cx="66.6" cy="33.4" r="3.7" fill="#fff" />
                </>
              )}
              <span className="cn" aria-hidden="true">
                Instagram
              </span>
            </a>

            {/* GitHub */}
            <a href={CN_URL.github} aria-label="GitHub" target="_blank" rel="noopener">
              {cnIcon(
                'g',
                <linearGradient id="gg1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#2b3138" />
                  <stop offset="1" stopColor="#0d1117" />
                </linearGradient>,
                'url(#gg1)',
                <g transform="translate(19 19) scale(3.875)">
                  <path
                    fill="#fff"
                    d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
                  />
                </g>
              )}
              <span className="cn" aria-hidden="true">
                GitHub
              </span>
            </a>

            {/* Resume */}
            <a href={CN_URL.resume} aria-label="Resume" target="_blank" rel="noopener">
              {cnIcon(
                'd',
                <>
                  <linearGradient id="dbg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#2c2c30" />
                    <stop offset="1" stopColor="#0c0c0d" />
                  </linearGradient>
                  <radialGradient id="dpp" cx=".5" cy=".42" r=".78">
                    <stop offset="0" stopColor="#f6f6f6" />
                    <stop offset=".62" stopColor="#ececec" />
                    <stop offset="1" stopColor="#d8d8d8" />
                  </radialGradient>
                  <linearGradient id="dfl" gradientUnits="userSpaceOnUse" x1="44" y1="60" x2="48" y2="85">
                    <stop offset="0" stopColor="#fbfbfb" />
                    <stop offset=".22" stopColor="#e3e3e3" />
                    <stop offset=".55" stopColor="#b3b3b3" />
                    <stop offset=".82" stopColor="#d2d2d2" />
                    <stop offset="1" stopColor="#efefef" />
                  </linearGradient>
                  <linearGradient id="dfs" gradientUnits="userSpaceOnUse" x1="15" y1="0" x2="78" y2="0">
                    <stop offset="0" stopColor="#000" stopOpacity=".10" />
                    <stop offset=".12" stopColor="#000" stopOpacity="0" />
                    <stop offset=".88" stopColor="#000" stopOpacity="0" />
                    <stop offset="1" stopColor="#000" stopOpacity=".10" />
                  </linearGradient>
                  <filter id="dsh" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1.1" stdDeviation="1.5" floodColor="#000" floodOpacity=".22" />
                  </filter>
                  <filter id="dsf" x="-20%" y="-30%" width="140%" height="170%">
                    <feDropShadow dx="0" dy="-.6" stdDeviation="1.6" floodColor="#000" floodOpacity=".30" />
                  </filter>
                </>,
                'url(#dbg)',
                <>
                  <rect x="21" y="20.7" width="56.6" height="56" rx=".6" fill="url(#dpp)" filter="url(#dsh)" />
                  <rect x="25.2" y="28.8" width="9.3" height="1.1" rx=".55" fill="#858585" />
                  <rect x="25.2" y="35.5" width="43.2" height="1.0" rx=".55" fill="#9a9a9a" />
                  <rect x="25.2" y="38.8" width="44.8" height="1.0" rx=".55" fill="#9a9a9a" />
                  <rect x="25.2" y="42.3" width="41.5" height="1.0" rx=".55" fill="#9a9a9a" />
                  <rect x="25.2" y="45.7" width="45.5" height="1.0" rx=".55" fill="#9a9a9a" />
                  <rect x="25.2" y="49.0" width="44.0" height="1.0" rx=".55" fill="#9a9a9a" />
                  <rect x="25.2" y="52.4" width="43.0" height="1.0" rx=".55" fill="#9a9a9a" />
                  <rect x="25.2" y="55.7" width="40.0" height="1.0" rx=".55" fill="#9a9a9a" />
                  <rect x="25.2" y="62.5" width="44.0" height="1.0" rx=".55" fill="#9a9a9a" />
                  <rect x="25.2" y="65.8" width="38.0" height="1.0" rx=".55" fill="#9a9a9a" />
                  <rect x="25.2" y="69.2" width="14.0" height="1.0" rx=".55" fill="#9a9a9a" />
                  <path
                    d="M15.8 73.2C28 69.3 45 64.3 57 62.6 64 61.6 70 60.3 74.6 60.2 76.4 60.2 77.3 61 77.4 62.8L77.9 76.2C77.9 76.8 77.6 77.2 77 77.3L20.6 83.9C19.3 84 18.7 83.5 18.5 82.6L15.2 74.6C15 73.9 15.2 73.4 15.8 73.2Z"
                    fill="url(#dfl)"
                    filter="url(#dsf)"
                  />
                  <path
                    d="M15.8 73.2C28 69.3 45 64.3 57 62.6 64 61.6 70 60.3 74.6 60.2 76.4 60.2 77.3 61 77.4 62.8L77.9 76.2C77.9 76.8 77.6 77.2 77 77.3L20.6 83.9C19.3 84 18.7 83.5 18.5 82.6L15.2 74.6C15 73.9 15.2 73.4 15.8 73.2Z"
                    fill="url(#dfs)"
                  />
                  <path
                    d="M16.4 73.6C29 69.8 45.5 64.9 57.2 63.2 64.2 62.2 70 61 74.4 60.9"
                    fill="none"
                    stroke="#fff"
                    strokeOpacity=".75"
                    strokeWidth=".6"
                    strokeLinecap="round"
                  />
                </>
              )}
              <span className="cn" aria-hidden="true">
                Resume
              </span>
            </a>

            {/* Email */}
            <a href={CN_URL.email} aria-label="Email">
              {cnIcon(
                'm',
                null,
                '#fff',
                <g transform="scale(2.0833)">
                  <rect x="9" y="14" width="5.5" height="21" fill="#4285F4" />
                  <rect x="33.5" y="14" width="5.5" height="21" fill="#34A853" />
                  <path d="M14.5 14v6.8L9 16.7V15.6c0-2.6 3-4.1 5.1-2.5z" fill="#C5221F" />
                  <path d="M33.5 14v6.8l5.5-4.1V15.6c0-2.6-3-4.1-5.1-2.5z" fill="#FBBC04" />
                  <path d="M14.5 14.2L24 21.3l9.5-7.1v6.6L24 28l-9.5-7.2z" fill="#EA4335" />
                </g>
              )}
              <span className="cn" aria-hidden="true">
                Email
              </span>
            </a>

            {/* LinkedIn */}
            <a href={CN_URL.linkedin} aria-label="LinkedIn" target="_blank" rel="noopener">
              {cnIcon(
                'l',
                null,
                '#0A66C2',
                <g transform="translate(-1 0) scale(2.0833)">
                  <circle cx="15" cy="15.2" r="3.2" fill="#fff" />
                  <rect x="11.9" y="20.4" width="6.2" height="16.6" fill="#fff" />
                  <path
                    fill="#fff"
                    d="M22.2 20.4h5.9v2.3c.9-1.6 2.9-2.8 5.4-2.8 5.3 0 6.5 3.3 6.5 7.7V37h-6.1v-8.5c0-2-.1-3.8-2.4-3.8s-2.8 1.8-2.8 3.7V37h-6.5z"
                  />
                </g>
              )}
              <span className="cn" aria-hidden="true">
                LinkedIn
              </span>
            </a>
          </div>

          {/* Receipt Card */}
          <div className="rcw" id="rcw" ref={rcRef}>
            <div className="rcm">
              <div className="rcp">
                <div className="rc">
                  <p className="rc-t">What is up to me now?</p>
                  <hr className="rc-hr" />
                  <p className="rc-p">
                    I am currently completing my thesis and actively seeking internship opportunities in the cybersecurity field. Please feel free to reach out via my social media links above, or schedule a call with me.
                  </p>
                  <a
                    className="rc-b"
                    id="sched"
                    href={SCHED_OK ? SCHEDULE_URL : SCHED_MAIL}
                    {...(SCHED_OK ? { target: '_blank', rel: 'noopener' } : {})}
                  >
                    <span className="rc-bt">Schedule a call</span>
                    <span className="rc-ba" aria-hidden="true">
                      <svg className="a1" viewBox="0 0 24 24">
                        <path d="M6.5 17.5L17.5 6.5M8 6.5h9.5V16" />
                      </svg>
                      <svg className="a2" viewBox="0 0 24 24">
                        <path d="M6.5 17.5L17.5 6.5M8 6.5h9.5V16" />
                      </svg>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <p className="cft">&copy; Ralph Dainiell Gonzaga {new Date().getFullYear()}.</p>
        </div>
      </div>
    </section>
  );
}
