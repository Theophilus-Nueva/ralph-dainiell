import React, { useEffect, useRef } from 'react';
import ParticlesBackground from '../../components/ParticlesBackground';
import {
  CN_TEXT,
  CN_SUB,
  SCHEDULE_URL,
  SCHED_MAIL,
  CN_URL,
} from '../../data/portfolioData';
import githubLogo from '../../assets/logos/connect-github.png';
import gmailLogo from '../../assets/logos/connect-gmail.png';
import linkedinLogo from '../../assets/logos/connect-linkedin.png';

export default function ConnectSection({ connectData }) {
  const cnText = connectData?.text && connectData.text.length > 0 ? connectData.text : CN_TEXT;
  const cnSub = connectData?.sub || CN_SUB;
  const cnUrl = { ...CN_URL, ...(connectData?.url || {}) };
  const schedUrl = connectData?.scheduleUrl || SCHEDULE_URL;
  const isSchedOk = !/YOUR_USERNAME/.test(schedUrl);

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

      const q = reduce ? 0 : 1 - fB;
      icons.forEach((a, i) => {
        const d = (i - ic) * 2;
        const sc = 0.75 + 0.25 * fB;
        a.style.transform =
          q < 0.0005
            ? 'none'
            : `translate(${(d * 50 * q).toFixed(1)}px, ${(Math.abs(d) * 50 * q).toFixed(1)}px) scale(${sc.toFixed(3)})`;
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
          <h2 style={{ margin: 0, display: 'contents' }} aria-label={cnText.join(' ')}>
            {cnText.map((ln) => (
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
          <p className="csub">{cnSub}</p>

          <div className="cic">
            {/* GitHub */}
            <a href={cnUrl.github} aria-label="GitHub" target="_blank" rel="noopener">
              <span className="cic-icon">
                <img src={githubLogo} alt="GitHub" draggable={false} />
              </span>
              <span className="cn" aria-hidden="true">
                GitHub
              </span>
            </a>

            {/* Gmail */}
            <a href={cnUrl.email} aria-label="Gmail">
              <span className="cic-icon">
                <img src={gmailLogo} alt="Gmail" draggable={false} />
              </span>
              <span className="cn" aria-hidden="true">
                Gmail
              </span>
            </a>

            {/* LinkedIn */}
            <a href={cnUrl.linkedin} aria-label="LinkedIn" target="_blank" rel="noopener">
              <span className="cic-icon">
                <img src={linkedinLogo} alt="LinkedIn" draggable={false} />
              </span>
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
                    href={isSchedOk ? schedUrl : SCHED_MAIL}
                    {...(isSchedOk ? { target: '_blank', rel: 'noopener' } : {})}
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
