import React, { useEffect, useRef, useState } from 'react';
import ParticlesBackground from '../../components/ParticlesBackground';
import { WORKS_TABS, APPS, LAB } from '../../data/portfolioData';

const TL_SVGS = {
  Swift: '<svg class="tl" viewBox="0 0 128 128" aria-label="Swift"><path d="M117 84C98 111 61 123 31 113c23-11 39-29 44-42-17 6-41 2-53-7 19-3 36-12 47-24C52 41 38 30 20 23c29 0 54 13 69 29C83 34 70 17 52 7c32 10 59 34 71 63 2 4 4 9 4 14z" fill="#f05138"/></svg>',
  SwiftUI: '<svg class="tl" viewBox="0 0 128 128" aria-label="SwiftUI"><defs><linearGradient id="tsu" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#007aff"/><stop offset="1" stop-color="#00c7be"/></linearGradient></defs><rect width="128" height="128" rx="28" fill="url(#tsu)"/><path d="M96 72c-15 22-44 32-68 24 18-9 31-23 35-34-14 5-33 2-42-6 15-2 29-10 38-19C45 37 34 28 20 22c23 0 43 10 55 23-5-6-15-20-30-28 26 8 47 27 57 50 1 3 3 7 4 11z" fill="#fff"/></svg>',
  CoreData: '<span class="tl tx">CoreData</span>',
  MapKit: '<span class="tl tx">MapKit</span>',
  Realm: '<span class="tl tx">Realm</span>',
  Supabase: '<svg class="tl" viewBox="130 20 610 610" aria-label="Supabase"><defs><linearGradient id="tsb" x1="450" y1="280" x2="680" y2="400" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#249361"/><stop offset="1" stop-color="#3ecf8e"/></linearGradient></defs><path d="M405 58L178 352 L432 385Z" fill="#3ecf8e" stroke="#3ecf8e" stroke-width="44" stroke-linejoin="round"/><path d="M432 262H660L690 300 L460 585 L437 565Z" fill="url(#tsb)" stroke="url(#tsb)" stroke-width="44" stroke-linejoin="round"/></svg>',
};

export default function WorksSection({ apps, lab }) {
  const appList = apps && apps.length > 0 ? apps : APPS;
  const labData = lab || LAB;

  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0); // 0 = iOS App, 1 = CyberSec Lab
  const [activeApp, setActiveApp] = useState(0);

  const tabListRef = useRef(null);
  const sliderRef = useRef(null);
  const dockRef = useRef(null);
  const dockInnerRef = useRef(null);
  const dockItemsRef = useRef([]);

  // 1. Sliding segmented tab indicator
  useEffect(() => {
    const updateSlider = () => {
      const tabList = tabListRef.current;
      const slider = sliderRef.current;
      if (!tabList || !slider) return;

      const buttons = tabList.querySelectorAll('button');
      const activeBtn = buttons[activeTab];
      if (activeBtn) {
        slider.style.width = `${activeBtn.offsetWidth}px`;
        slider.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
      }
    };

    updateSlider();
    window.addEventListener('resize', updateSlider);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateSlider);
    }
    return () => window.removeEventListener('resize', updateSlider);
  }, [activeTab]);

  // 2. MacOS Dock with Cosine Magnification
  useEffect(() => {
    const dk = dockRef.current;
    const di = dockInnerRef.current;
    const items = dockItemsRef.current;
    if (!dk || !di || !items.length) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const PAD = 10;
    let B = 46;
    let MS = 1.7;
    let EW = 240;
    let mx = null;
    let sc = items.map(() => 1);
    let run = false;
    let rafId = 0;

    const gap = () => Math.max(4, B * 0.08);

    const conf = () => {
      const m = Math.min(window.innerWidth, window.innerHeight);
      B = m < 480 ? 32 : m < 768 ? 36 : 38;
      MS = reduce ? 1 : m < 480 ? 1.4 : 1.7;
      EW = m < 480 ? 160 : 240;
      items.forEach((e) => {
        if (e) e.style.fontSize = `${Math.round(B * 0.28)}px`;
      });
    };

    const lay = () => {
      let x = 0;
      const g = gap();
      items.forEach((e, i) => {
        if (!e) return;
        const w = B * sc[i];
        e.style.left = `${x}px`;
        e.style.width = `${w}px`;
        e.style.height = `${w}px`;
        e.style.zIndex = Math.round(sc[i] * 10);
        x += w + g;
      });
      di.style.height = `${B}px`;
      dk.style.width = `${x - g + PAD * 2}px`;
    };

    const tick = () => {
      const g = gap();
      let busy = mx !== null;
      sc = sc.map((v, i) => {
        let t = 1;
        if (mx !== null) {
          const c = i * (B + g) + B / 2;
          const lo = mx - EW / 2;
          if (c >= lo && c <= mx + EW / 2) {
            t = 1 + ((1 - Math.cos(((c - lo) / EW) * 2 * Math.PI)) / 2) * (MS - 1);
          }
        }
        const d = t - v;
        if (Math.abs(d) > 0.002) busy = true;
        return v + d * (mx !== null ? 0.2 : 0.12);
      });

      lay();
      if (busy) rafId = requestAnimationFrame(tick);
      else run = false;
    };

    const kick = () => {
      if (!run) {
        run = true;
        rafId = requestAnimationFrame(tick);
      }
    };

    const onPointerMove = (e) => {
      mx = e.clientX - dk.getBoundingClientRect().left - PAD;
      kick();
    };

    const onPointerLeave = () => {
      mx = null;
      kick();
    };

    const onResize = () => {
      conf();
      kick();
    };

    dk.addEventListener('pointermove', onPointerMove);
    dk.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('resize', onResize);

    conf();
    lay();

    return () => {
      dk.removeEventListener('pointermove', onPointerMove);
      dk.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleAppClick = (index, e) => {
    setActiveApp(index);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (e.currentTarget.animate && !reduce) {
      e.currentTarget.animate(
        [{ transform: 'translateY(0)' }, { transform: 'translateY(-12px)' }, { transform: 'translateY(0)' }],
        { duration: 420, easing: 'ease-out' }
      );
    }
  };

  const currentApp = appList[activeApp] || appList[0];
  const appScreens = currentApp[5] || [];

  return (
    <section id="works" ref={containerRef} className="dk">
      <ParticlesBackground containerRef={containerRef} />
      <div className="wk">
        <div className="wkh rv">
          <h2>Works</h2>
          <p>Specializing in both product creation and security defense across iOS and SOC environments.</p>
        </div>

        {/* Segmented Tab Switch */}
        <div className="wkt rv" style={{ '--d': 1 }} role="tablist" ref={tabListRef}>
          <i className="wks" ref={sliderRef} />
          {WORKS_TABS.map((w, i) => (
            <button
              key={w}
              role="tab"
              aria-selected={activeTab === i}
              data-i={i}
              onClick={() => setActiveTab(i)}
            >
              {w}
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        <div className="wkp rv" style={{ '--d': 2 }}>
          {/* iOS App Tab */}
          <article className={`wkc ${activeTab === 0 ? 'on' : ''}`} role="tabpanel">
            <div className="wkl2 apb">
              <div className="aih">
                <span className="aic big">
                  {currentApp[0] ? (
                    <img src={currentApp[0]} alt="" draggable="false" />
                  ) : (
                    <b>
                      APP
                      <br />
                      ICON
                      <br />
                      HERE
                    </b>
                  )}
                </span>
                <h3>{currentApp[1]}</h3>
              </div>
              <p className="ad">{currentApp[2]}</p>
              <div className="tg">
                {currentApp[3]?.map((tag) => (
                  <span
                    key={tag}
                    dangerouslySetInnerHTML={{
                      __html: TL_SVGS[tag] || `<span class="tl tx">${tag}</span>`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="wkv">
              <div className="pcol">
                <div className="phs">
                  <div className="phn p1">
                    <div className="pscr">
                      {appScreens[0] && <img src={appScreens[0]} alt="" draggable="false" />}
                    </div>
                  </div>
                  <div className="phn p2">
                    <div className="pscr">
                      {appScreens[1] && <img src={appScreens[1]} alt="" draggable="false" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* CyberSec Lab Tab */}
          <article className={`wkc lab ${activeTab === 1 ? 'on' : ''}`} role="tabpanel">
            <div className="lbt">
              <h3>{labData.title}</h3>
              <p>{labData.desc}</p>
              <div className="lbb">
                {labData.badge ? (
                  <img src={labData.badge} alt="" draggable="false" />
                ) : (
                  <svg viewBox="0 0 142 172" role="img" aria-label="TryHackMe Certified SAL1 badge">
                    <defs>
                      <linearGradient id="lbo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#5aa4ff" />
                        <stop offset="1" stopColor="#2a74f0" />
                      </linearGradient>
                      <linearGradient id="lbi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#0d4fb3" />
                        <stop offset=".6" stopColor="#07306e" />
                        <stop offset="1" stopColor="#041a42" />
                      </linearGradient>
                      <clipPath id="lbc">
                        <path d="M13 25Q71 9 129 25V104L71 159 13 104Z" />
                      </clipPath>
                    </defs>
                    <path d="M6 19Q71-1 136 19V108L71 168 6 108Z" fill="url(#lbo)" />
                    <path d="M13 25Q71 9 129 25V104L71 159 13 104Z" fill="url(#lbi)" />
                    <g clipPath="url(#lbc)">
                      <rect x="0" y="100" width="142" height="32" fill="#3f8cff" />
                    </g>
                    <path
                      d="M60 47a7 7 0 0 1 3-13 10 10 0 0 1 19 2 7 7 0 0 1 0 11z"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                    <g fontFamily="JetBrains Mono,monospace" fontSize="5" fill="#fff" textAnchor="middle">
                      <text x="71" y="42">
                        10 10
                      </text>
                      <text x="71" y="48">
                        1110
                      </text>
                      <text x="71" y="54" fill="#ff5a4d">
                        0101
                      </text>
                    </g>
                    <text
                      x="71"
                      y="77"
                      textAnchor="middle"
                      fontFamily="Space Grotesk,Arial,sans-serif"
                      fontWeight="700"
                      fontSize="12.5"
                      fill="#fff"
                    >
                      TryHackMe
                    </text>
                    <text
                      x="71"
                      y="91"
                      textAnchor="middle"
                      fontFamily="Space Grotesk,Arial,sans-serif"
                      fontWeight="500"
                      fontSize="8.5"
                      letterSpacing="2"
                      fill="#d6e5ff"
                    >
                      CERTIFIED
                    </text>
                    <text
                      x="71"
                      y="126"
                      textAnchor="middle"
                      fontFamily="Space Grotesk,Arial,sans-serif"
                      fontWeight="700"
                      fontSize="29"
                      fill="#052a66"
                    >
                      SAL1
                    </text>
                  </svg>
                )}
              </div>
              <div className="lbl">
                {labData.links?.map((f) =>
                  f[1] !== '#' ? (
                    <a key={f[0]} className="try" href={f[1]} target="_blank" rel="noopener">
                      {f[0]}
                      <i>↗</i>
                    </a>
                  ) : (
                    <span key={f[0]} className="try" title="Link coming soon">
                      {f[0]}
                      <i>↗</i>
                    </span>
                  )
                )}
              </div>
            </div>
            <div className="wkv">
              <div className="lbm">
                {labData.media ? (
                  /\.(mp4|webm|mov)(\?|$)/i.test(labData.media) ? (
                    <video src={labData.media} autoPlay muted loop playsInline />
                  ) : (
                    <img src={labData.media} alt="" draggable="false" />
                  )
                ) : (
                  <span>screenshot or the video of the screenrecord here</span>
                )}
              </div>
            </div>
          </article>
        </div>

        {/* macOS Dock Container (hidden when CyberSec Lab is active) */}
        <div className={`dw rv ${activeTab !== 0 ? 'hid' : ''}`} style={{ '--d': 3 }}>
          <div className="mdock" role="tablist" aria-label="Choose an app" ref={dockRef}>
            <div className="mdi" ref={dockInnerRef}>
              {appList.map((a, n) => (
                <button
                  key={a[1] + n}
                  ref={(el) => (dockItemsRef.current[n] = el)}
                  type="button"
                  className={`mdk ${activeApp === n ? 'on' : ''}`}
                  title={a[1]}
                  aria-label={a[1]}
                  onClick={(e) => handleAppClick(n, e)}
                >
                  <span className="aic">
                    {a[0] ? (
                      <img src={a[0]} alt="" draggable="false" />
                    ) : (
                      <b>{a[1].slice(-2)}</b>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
