import React, { useEffect, useRef } from 'react';
import ParticlesBackground from '../../components/ParticlesBackground';
import { PHOTO, HERO_WORDS, HERO_COLS, HERO_SET } from '../../data/portfolioData';
import { FSX, SFX } from '../../lib/sound';

const SEQ = [..." ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"];

export default function HomeSection({ heroWords, photo, name }) {
  const words = heroWords && heroWords.length > 0 ? heroWords : HERO_WORDS;
  const photoSrc = photo || PHOTO;
  const homeName = name || 'Ralph Dainiell Gonzaga';

  const containerRef = useRef(null);
  const phRef = useRef(null);
  const row1Ref = useRef(null);
  const row2Ref = useRef(null);
  const tagRef = useRef(null);

  // Split-flap name controller
  const nameFlapsRef = useRef([]);
  // Hero split-flap board controller
  const boardRef = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Build Split-Flap Name Cells
    const createFlapCells = (el, text, baseDelay) => {
      el.innerHTML = '';
      return [...text].map((c, n) => {
        const d = document.createElement('span');
        d.className = 'sf';
        d.setAttribute('aria-hidden', 'true');
        d.innerHTML =
          '<b class="rs"> </b><span class="h t"><i></i></span><span class="h b"><i></i></span><span class="h t f"><i></i></span><span class="h b f"><i></i></span>';
        el.appendChild(d);
        const k = {
          d,
          c,
          cur: ' ',
          rs: d.firstChild,
          i: [...d.querySelectorAll('i')],
          a: [],
          tm: 0,
          at: baseDelay + n * 45,
        };
        if (reduce) k.rs.textContent = c;
        return k;
      });
    };

    const flipFlap = (k, next, dur) => {
      const [t, b, ft, fb] = k.i;
      const old = k.cur;
      k.cur = next;
      t.textContent = next;
      b.textContent = old;
      ft.textContent = old;
      fb.textContent = next;

      k.a.forEach((a) => a.cancel());
      k.d.classList.add('fl');
      const h = dur / 2;
      k.a = [
        ft.parentNode.animate(
          [
            { transform: 'rotateX(0)', filter: 'brightness(1)' },
            { transform: 'rotateX(-90deg)', filter: 'brightness(.5)' },
          ],
          { duration: h, easing: 'ease-in', fill: 'both' }
        ),
        fb.parentNode.animate(
          [
            { transform: 'rotateX(90deg)', filter: 'brightness(.5)' },
            { transform: 'rotateX(0)', filter: 'brightness(1)' },
          ],
          { duration: h, delay: h, easing: 'ease-out', fill: 'both' }
        ),
      ];
      k.a[1].onfinish = () => {
        k.rs.textContent = next;
        k.d.classList.remove('fl');
      };
    };

    const flapRoll = (k) => {
      const ti = SEQ.indexOf(k.c);
      if (ti < 1) {
        k.rs.textContent = k.c;
        return;
      }
      const idx = [];
      for (let i = Math.max(1, ti - 12); i <= ti; i++) idx.push(i);
      let n = 0;
      const step = () => {
        flipFlap(k, SEQ[idx[n]], n === idx.length - 1 ? 300 : 50);
        n++;
        if (n < idx.length) k.tm = setTimeout(step, 55);
      };
      k.tm = setTimeout(step, k.at);
    };

    if (row1Ref.current && row2Ref.current) {
      nameFlapsRef.current = [
        createFlapCells(row1Ref.current, 'RALPH DAINIELL', 120),
        createFlapCells(row2Ref.current, 'GONZAGA', 300),
      ];
    }

    // 2. Build Hero Tag Board (Train board mechanical simulation)
    const tag = tagRef.current;
    if (tag) {
      tag.innerHTML = '';
      const row = document.createElement('div');
      row.className = 'tbrow';
      const cells = [];
      let gen = 0;
      let idx = 0;
      let hov = false;

      const showCell = (c, ch) => {
        c.cur = ch;
        c.bt.textContent = c.bb.textContent = ch;
      };

      const mkCell = (i) => {
        const el = document.createElement('div');
        el.className = 'tbc';
        el.innerHTML =
          '<div class="tbh tbt"><span></span></div><div class="tbh tbb"><span></span></div><div class="tbh tbt tbf tbft"><span></span></div><div class="tbh tbb tbf tbfb"><span></span></div>';
        const q = el.querySelectorAll('span');
        const c = { el, bt: q[0], bb: q[1], ft: q[2], fb: q[3], cur: ' ', i };
        showCell(c, ' ');
        return c;
      };

      const layoutBoard = () => {
        if (!cells.length) return;
        const cell = cells[0].el;
        const fs = parseFloat(getComputedStyle(cell).fontSize);
        const h = cell.offsetHeight;
        const ctx = document.createElement('canvas').getContext('2d');
        if (!ctx) return;
        ctx.font = `${fs}px "VT323", monospace`;
        const m = ctx.measureText('Cbdgjpy');
        const fa = m.fontBoundingBoxAscent || fs * 0.8;
        const fd = m.fontBoundingBoxDescent || fs * 0.2;
        const aa = m.actualBoundingBoxAscent || fs * 0.55;
        const ad = m.actualBoundingBoxDescent || fs * 0.15;
        const yb = h / 2 + (aa - ad) / 2;
        tag.style.setProperty('--lh', `${fa + fd}px`);
        tag.style.setProperty('--ty', `${yb - fa}px`);
        tag.style.setProperty('--tyb', `${yb - fa - h / 2}px`);
      };

      const flipCell = (c, next, done, g) => {
        if (hov) FSX.click((c.i / (HERO_COLS - 1) - 0.5) * 1.2);
        c.bt.textContent = next;
        c.bb.textContent = c.cur;
        c.ft.textContent = c.cur;
        c.fb.textContent = next;
        c.el.classList.remove('go');
        void c.el.offsetWidth;
        c.el.classList.add('go');
        setTimeout(() => {
          if (g !== gen) return;
          c.el.classList.remove('go');
          showCell(c, next);
          done();
        }, 82);
      };

      const pathSeq = (from, to) => {
        const a = Math.max(0, HERO_SET.indexOf(from));
        const b = Math.max(0, HERO_SET.indexOf(to));
        const d = (b - a + HERO_SET.length) % HERO_SET.length;
        if (d === 0) return [];
        const n = Math.min(d, 4);
        const out = [];
        for (let k = 1; k < n; k++) out.push(HERO_SET[(a + Math.round((d * k) / n)) % HERO_SET.length]);
        out.push(to);
        return out;
      };

      const goWord = (word, cb, g) => {
        const target = word.padEnd(HERO_COLS, ' ');
        let left = HERO_COLS;
        row.style.transform = `translateX(calc(var(--p) * ${(HERO_COLS - word.length) / 2}))`;
        cells.forEach((c, i) => {
          const steps = pathSeq(c.cur, target[i]);
          const finish = () => {
            if (--left === 0 && cb) cb();
          };
          if (reduce || !steps.length) {
            showCell(c, target[i]);
            finish();
            return;
          }
          let j = 0;
          const nx = () => {
            if (g !== gen) return;
            if (j >= steps.length) {
              finish();
              return;
            }
            flipCell(c, steps[j++], nx, g);
          };
          setTimeout(nx, i * 15);
        });
      };

      const loopWords = (g) => {
        const t0 = performance.now();
        goWord(
          words[idx % words.length],
          () => {
            if (g !== gen) return;
            idx++;
            setTimeout(
              () => {
                if (g === gen) loopWords(g);
              },
              Math.max(150, 1700 - (performance.now() - t0))
            );
          },
          g
        );
      };

      tag.addEventListener('pointerenter', () => {
        hov = true;
      });
      tag.addEventListener('pointerleave', () => {
        hov = false;
      });

      for (let i = 0; i < HERO_COLS; i++) {
        const c = mkCell(i);
        cells.push(c);
        row.appendChild(c.el);
      }
      tag.appendChild(row);
      layoutBoard();
      window.addEventListener('resize', layoutBoard);
      if (document.fonts && document.fonts.load) {
        document.fonts.load('40px "VT323"').then(layoutBoard, layoutBoard);
      }

      boardRef.current = {
        reset() {
          gen++;
          idx = 0;
          row.style.transform = '';
          cells.forEach((c) => {
            c.el.classList.remove('go');
            showCell(c, ' ');
          });
        },
        play() {
          this.reset();
          const g = gen;
          if (reduce) {
            goWord(words[0], null, g);
            return;
          }
          setTimeout(() => {
            if (g === gen) loopWords(g);
          }, 900);
        },
      };
    }

    const playFlaps = () => {
      if (boardRef.current) boardRef.current.play();
      nameFlapsRef.current.flat().forEach((k) => {
        if (reduce) k.rs.textContent = k.c;
        else flapRoll(k);
      });
    };

    const resetFlaps = () => {
      if (boardRef.current) boardRef.current.reset();
      nameFlapsRef.current.flat().forEach((k) => {
        clearTimeout(k.tm);
        k.a.forEach((a) => a.cancel());
        k.a = [];
        k.cur = ' ';
        k.d.classList.remove('fl');
        k.rs.textContent = reduce ? k.c : ' ';
      });
    };

    window.__playHeroFlaps = playFlaps;
    window.__resetHeroFlaps = resetFlaps;

    // Observe home section intersection
    const homeEl = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (window.WCB) return;
          e.target.classList.toggle('in', e.isIntersecting);
          if (e.isIntersecting) {
            playFlaps();
          } else {
            resetFlaps();
          }
        });
      },
      { threshold: 0.55 }
    );

    if (homeEl) observer.observe(homeEl);

    // 3. Build X-Ray Lens with Audio Synthesis
    const ph = phRef.current;
    let cleanupLens = () => {};

    if (ph && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
      let xr = ph.querySelector('.xr');
      let xrr = ph.querySelector('.xrr');
      if (!xr) {
        xr = document.createElement('div');
        xr.className = 'xr';
        xr.setAttribute('aria-hidden', 'true');
        xr.innerHTML = `<img src="${photoSrc}" alt="" class="xs" draggable="false"><img src="${photoSrc}" alt="" class="xn" draggable="false">`;
        ph.appendChild(xr);
      }
      if (!xrr) {
        xrr = document.createElement('div');
        xrr.className = 'xrr';
        xrr.setAttribute('aria-hidden', 'true');
        ph.appendChild(xrr);
      }

      let x = 0;
      let y = 0;
      let r = 0;
      let tx = 0;
      let ty = 0;
      let px = -1;
      let py = -1;
      let inside = false;
      let was = false;
      let raf = 0;
      let lastTime = 0;

      // Portrait SFX Synthesizer
      const S = { in: false, spd: 0, n: null, f: null, g: null, p: null, k: 1 };
      let lpx = 0;
      let lpy = 0;

      const au = () => {
        const s = SFX;
        if (!s || !s.vol) return null;
        const c = s.ctx();
        const bus = s.bus();
        if (!c || !bus || c.state !== 'running') return null;
        return { c, bus, nb: s.nb(), k: s.vol / 0.35 };
      };

      const panOf = () => {
        const b = ph.getBoundingClientRect();
        return Math.max(-1, Math.min(1, ((px - b.left) / b.width) * 2 - 1)) * 0.6;
      };

      const mkSnd = (a) => {
        const c = a.c;
        const out = c.createGain();
        const t = c.currentTime + 0.005;
        if (c.createStereoPanner) {
          const p = c.createStereoPanner();
          p.pan.value = panOf();
          out.connect(p);
          p.connect(a.bus);
        } else {
          out.connect(a.bus);
        }

        const osc = (f0, f1, t0, att, dec, g) => {
          const o = c.createOscillator();
          const e = c.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(f0, t0);
          o.frequency.exponentialRampToValueAtTime(f1, t0 + dec);
          e.gain.setValueAtTime(0.0001, t0);
          e.gain.linearRampToValueAtTime(g * a.k, t0 + att);
          e.gain.exponentialRampToValueAtTime(0.0001, t0 + dec);
          o.connect(e);
          e.connect(out);
          o.start(t0);
          o.stop(t0 + dec + 0.03);
        };

        const air = (f0, f1, Q, t0, att, dur, g) => {
          const n = c.createBufferSource();
          const f = c.createBiquadFilter();
          const e = c.createGain();
          n.buffer = a.nb;
          f.type = 'bandpass';
          f.Q.value = Q;
          f.frequency.setValueAtTime(f0, t0);
          f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
          e.gain.setValueAtTime(0.0001, t0);
          e.gain.linearRampToValueAtTime(g * a.k, t0 + att);
          e.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
          n.connect(f);
          f.connect(e);
          e.connect(out);
          n.start(t0, Math.random() * 0.5);
          n.stop(t0 + dur + 0.03);
        };

        return { t, osc, air };
      };

      const sOpen = () => {
        const a = au();
        if (!a) return;
        const v = mkSnd(a);
        const t = v.t;
        const c = a.c;
        v.air(500, 5200, 3.5, t, 0.025, 0.34, 0.5);
        v.osc(1240, 1318.5, t, 0.006, 0.5, 0.22);
        v.osc(1860, 1975.5, t + 0.025, 0.006, 0.45, 0.14);
        v.osc(2480, 2637, t + 0.05, 0.006, 0.4, 0.09);
        v.osc(150, 62, t, 0.002, 0.12, 0.45);

        const n = c.createBufferSource();
        const f = c.createBiquadFilter();
        const g = c.createGain();
        const p = c.createStereoPanner ? c.createStereoPanner() : null;
        n.buffer = a.nb;
        n.loop = true;
        f.type = 'bandpass';
        f.Q.value = 1.8;
        f.frequency.value = 1800;
        g.gain.value = 0;
        n.connect(f);
        f.connect(g);
        if (p) {
          p.pan.value = panOf();
          g.connect(p);
          p.connect(a.bus);
        } else {
          g.connect(a.bus);
        }
        n.start(0, Math.random() * 0.5);
        S.n = n;
        S.f = f;
        S.g = g;
        S.p = p;
        S.k = a.k;
      };

      const sClose = () => {
        const a = au();
        if (S.g) {
          const now = S.g.context.currentTime;
          const n = S.n;
          S.g.gain.cancelScheduledValues(now);
          S.g.gain.setTargetAtTime(0, now, 0.04);
          setTimeout(() => {
            try {
              if (n) n.stop();
            } catch {}
          }, 400);
          S.n = S.g = S.f = S.p = null;
        }
        S.spd = 0;
        if (!a) return;
        const v = mkSnd(a);
        const t = v.t;
        v.air(4200, 450, 3, t, 0.01, 0.26, 0.3);
        v.osc(1760, 830, t, 0.004, 0.2, 0.22);
        v.osc(110, 55, t, 0.002, 0.1, 0.3);
      };

      const sUpd = (dt) => {
        S.spd *= Math.exp(-dt * 5);
        if (!S.g) return;
        const now = S.g.context.currentTime;
        const vv = SFX.vol;
        S.g.gain.setTargetAtTime(vv ? (S.spd * 0.2 * vv) / 0.35 : 0, now, 0.05);
        S.f.frequency.setTargetAtTime(1300 + S.spd * 3400, now, 0.06);
        if (S.p) S.p.pan.setTargetAtTime(panOf(), now, 0.08);
      };

      const snd = (inn) => {
        if (inn && !S.in) {
          S.in = true;
          lpx = px;
          lpy = py;
          sOpen();
        } else if (!inn && S.in) {
          S.in = false;
          sClose();
        } else if (inn) {
          S.spd = Math.min(1, S.spd + Math.hypot(px - lpx, py - lpy) / 70);
          lpx = px;
          lpy = py;
        }
      };

      const tickLens = (now) => {
        raf = 0;
        if (window.WCB) return;
        const dt = lastTime ? Math.min(0.1, (now - lastTime) / 1000) : 0.016;
        lastTime = now;

        const b = ph.getBoundingClientRect();
        const tr = inside ? Math.max(54, b.width * 0.2) : 0;
        const k = inside ? 0.15 : 0.22;
        x += (tx - x) * k;
        y += (ty - y) * k;
        r += (tr - r) * k;

        if (r < 0.3 && !inside) {
          r = 0;
          xr.style.clipPath = 'circle(0px at 50% 50%)';
          xrr.style.opacity = '0';
          if (was) {
            was = false;
            snd(false);
          }
          return;
        }

        xr.style.clipPath = `circle(${r.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`;
        const D = r * 2;
        xrr.style.width = `${D.toFixed(1)}px`;
        xrr.style.height = `${D.toFixed(1)}px`;
        xrr.style.transform = `translate3d(${(x - r).toFixed(1)}px, ${(y - r).toFixed(1)}px, 0)`;
        xrr.style.opacity = Math.min(1, r / 16).toFixed(2);

        if (!was && inside) {
          was = true;
          snd(true);
        }
        snd(inside);
        sUpd(dt);

        raf = requestAnimationFrame(tickLens);
      };

      const kickLens = () => {
        if (!raf) raf = requestAnimationFrame(tickLens);
      };

      const handlePointerMove = (e) => {
        if (window.WCB) return;
        px = e.clientX;
        py = e.clientY;
        const b = ph.getBoundingClientRect();
        inside = px >= b.left && px <= b.right && py >= b.top && py <= b.bottom;
        if (inside) {
          tx = px - b.left;
          ty = py - b.top;
          if (!r) {
            x = tx;
            y = ty;
          }
        }
        kickLens();
      };

      const handlePointerLeave = () => {
        inside = false;
        kickLens();
      };

      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', handlePointerLeave);

      cleanupLens = () => {
        if (raf) cancelAnimationFrame(raf);
        window.removeEventListener('pointermove', handlePointerMove);
        document.documentElement.removeEventListener('pointerleave', handlePointerLeave);
        if (S.in) sClose();
      };
    }

    return () => {
      observer.disconnect();
      cleanupLens();
    };
  }, []);

  return (
    <section id="home" ref={containerRef} className="lt">
      <ParticlesBackground containerRef={containerRef} />
      <div className="home">
        <div className="ph" ref={phRef}>
          <img src={photoSrc} alt={homeName} />
        </div>
        <div className="hx">
          <h1 className="nm" aria-label="RALPH DAINIELL GONZAGA">
            <span className="row" ref={row1Ref}></span>
            <span className="row" ref={row2Ref}></span>
          </h1>
          <p className="tag" ref={tagRef} role="img" aria-label="Cybersecurity and iOS Engineer"></p>
          <p className="bio rv" style={{ '--d': 7 }}>
            I build modern native iOS apps, and these days
            <br />
            I’m focus on cybersecurity and asset protection.
          </p>
        </div>
      </div>
    </section>
  );
}
