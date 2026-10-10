import React, { useEffect, useRef } from 'react';
import ParticlesBackground from '../components/ParticlesBackground';
import { STACK, GH_USER, GH_COL, GH_R, GH_SNAP } from '../data/portfolioData';

export default function StackSection() {
  const containerRef = useRef(null);
  const cvRef = useRef(null);
  const ghhRef = useRef(null);
  const ghnRef = useRef(null);

  // GitHub contribution graph + 3D Skyline Morph Intro
  useEffect(() => {
    const cv = cvRef.current;
    const hEl = ghhRef.current;
    const nEl = ghnRef.current;
    if (!cv || !hEl || !nEl) return;

    const cx = cv.getContext('2d');
    if (!cx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ROWS = 7;
    let dly = 0;
    let pend = false;
    let stab = 0;
    let lt = null;
    let ll = 0;
    const COLS = 53;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let cell = 0;
    let mx = -999;
    let my = -999;
    let t0 = 0;
    let on = false;
    let loop = false;
    let D = [];
    let hv = -1;
    let MAP = {};
    let END = null;
    let TODAY = -1;
    let lc = -1;
    let sx = -999;
    let sy = -999;
    let tx = -999;
    let ty = -999;
    let kb = false;

    const pad = (n) => String(n).padStart(2, '0');
    const key = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const parse = (q) => {
      const a = q.split('-');
      return new Date(+a[0], +a[1] - 1, +a[2]);
    };

    function build() {
      D = [];
      TODAY = -1;
      const st = new Date(END);
      st.setDate(END.getDate() - END.getDay() - (COLS - 1) * 7);
      let tot = 0;
      for (let c = 0; c < COLS; c++) {
        for (let w = 0; w < ROWS; w++) {
          const d = new Date(st);
          d.setDate(st.getDate() + c * 7 + w);
          const m = MAP[key(d)];
          const n = d > END ? -1 : m ? m[0] : 0;
          if (n >= 0) TODAY = D.length;
          if (n > 0) tot += n;
          D.push({ d, n, l: m ? m[1] : 0 });
        }
      }
      nEl.innerHTML = `<b>${tot.toLocaleString()}</b> contributions in the last year`;
    }

    function load(list, end) {
      MAP = {};
      list.forEach((x) => (MAP[x[0]] = [x[1], x[2]]));
      END = parse(end);
      build();
    }

    const sd = parse(GH_SNAP.start);
    load(
      GH_SNAP.c.map((n, i) => {
        const d = new Date(sd);
        d.setDate(sd.getDate() + i);
        return [key(d), n, +GH_SNAP.l[i]];
      }),
      GH_SNAP.end
    );

    // Live API fetch
    fetch(`https://github-contributions-api.jogruber.de/v4/${GH_USER}?y=last`)
      .then((r) => r.json())
      .then((j) => {
        const A = j && j.contributions;
        if (!A || !A.length) return;
        const end = A.reduce((m, x) => (x.date > m ? x.date : m), A[0].date);
        load(
          A.map((x) => [x.date, x.count, x.level]),
          end
        );
      })
      .catch(() => {});

    function size() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = cv.clientWidth;
      cell = W / COLS;
      H = Math.round(cell * ROWS);
      cv.style.height = `${H}px`;
      cv.width = W * dpr;
      cv.height = H * dpr;
    }

    function draw(t) {
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx.clearRect(0, 0, W, H);
      if (intro) return;

      for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS; r++) {
          const i = c * ROWS + r;
          const q = D[i];
          if (!q || q.n < 0) continue;
          const x = (c + 0.5) * cell;
          const y = (r + 0.5) * cell;
          const p = reduce ? 1 : Math.min(1, Math.max(0, (t - t0 - dly - c * 14 - r * 6) / 520));
          const e = 1 - Math.pow(1 - p, 3);
          const dd = Math.hypot(x - sx, y - sy);
          const f = dd < cell * 4.5 ? Math.pow(1 - dd / (cell * 4.5), 2) : 0;
          const R = Math.max(cell * GH_R[q.l] * (1 + f * 0.55) * e, 0);

          cx.fillStyle = GH_COL[q.l];
          cx.beginPath();
          cx.arc(x, y, R, 0, 6.2831853);
          cx.fill();

          if (i === TODAY && p >= 1) {
            cx.strokeStyle = '#fff';
            cx.lineWidth = 1;
            cx.beginPath();
            cx.arc(x, y, R + 2, 0, 6.2831853);
            cx.stroke();
          }
        }
      }
    }

    // 3D Skyline Morph Intro
    const ENT = 2000;
    const HOLD = ENT + 1100;
    const MORPH = 1800;
    const END_AT = HOLD + MORPH;
    const YAW3 = (34 * Math.PI) / 180;
    const ELEV3 = (34 * Math.PI) / 180;
    const WAVE = 0.42;

    const ov = document.createElement('canvas');
    const ox = ov.getContext('2d');
    ov.className = 'ghi';
    ov.setAttribute('aria-hidden', 'true');
    cv.parentElement.appendChild(ov);

    let intro = false;
    let OW = 0;
    let OH = 0;
    let ORD = [];
    let ZS = new Float32Array(0);

    const lerp = (a, b, t) => a + (b - a) * t;
    const cl = (x) => (x > 0 ? (x < 1 ? x : 1) : 0);
    const eo3 = (x) => 1 - Math.pow(1 - cl(x), 3);
    const eio3 = (x) => {
      x = cl(x);
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    };
    const sm = (a, b, x) => {
      const t = cl((x - a) / (b - a));
      return t * t * (3 - 2 * t);
    };
    const rgb = (h) => {
      const n = parseInt(h.slice(1), 16);
      return [n >> 16, (n >> 8) & 255, n & 255];
    };
    const GC = GH_COL.map(rgb);
    const mix = (a, b, t, f) =>
      `rgb(${Math.round(lerp(a[0], b[0], t) * f)},${Math.round(lerp(a[1], b[1], t) * f)},${Math.round(
        lerp(a[2], b[2], t) * f
      )})`;
    const riseAt = (t, wk, wks, dy) => eo3((t - ((wks > 1 ? wk / (wks - 1) : 0) * 0.36 + (dy / 6) * 0.06)) / (1 - WAVE));

    function sizeOv() {
      const g = ov.parentElement;
      if (!g) return;
      OW = g.clientWidth + 170;
      OH = g.clientHeight + 60;
      ov.width = OW * dpr;
      ov.height = OH * dpr;
    }

    function qpath(c, p, r) {
      if (r < 0.3) {
        c.moveTo(p[0], p[1]);
        c.lineTo(p[2], p[3]);
        c.lineTo(p[4], p[5]);
        c.lineTo(p[6], p[7]);
        c.closePath();
        return;
      }
      c.moveTo((p[6] + p[0]) / 2, (p[7] + p[1]) / 2);
      for (let k = 0; k < 4; k++) {
        const b = (k + 1) % 4;
        c.arcTo(p[k * 2], p[k * 2 + 1], p[b * 2], p[b * 2 + 1], r);
      }
      c.closePath();
    }

    function drawIntro(t) {
      const el = t - t0;
      ox.setTransform(dpr, 0, 0, dpr, 0, 0);
      ox.clearRect(0, 0, OW, OH);
      if (!intro) return;

      if (el >= END_AT) {
        intro = false;
        ov.style.display = 'none';
        ov.parentElement?.classList.remove('gi');
        return;
      }

      if (el >= HOLD + MORPH * 0.2) ov.parentElement?.classList.remove('gi');

      const tt = el < ENT ? el / ENT : el < HOLD ? 1 : 1 - cl((el - HOLD) / MORPH);
      const tb = tt;
      const e = eio3(tt);
      const cam = { yaw: lerp(0, YAW3, e), elev: lerp(Math.PI / 2, ELEV3, e) };
      const cs = Math.cos(cam.yaw);
      const sn = Math.sin(cam.yaw);
      const se = Math.sin(cam.elev);
      const ce = Math.cos(cam.elev);

      const n = D.length;
      if (ZS.length !== n) {
        ZS = new Float32Array(n);
        ORD = Array.from({ length: n }, (_, i) => i);
      }

      let mxN = 1;
      for (const q of D) if (q.n > mxN) mxN = q.n;
      const hOf = (q) => (q.n > 0 ? 0.5 + Math.pow(q.n / mxN, 0.85) * 9 : 0.2);

      for (let i = 0; i < n; i++) {
        const c = (i / ROWS) | 0;
        const r = i % ROWS;
        ZS[i] = riseAt(tb, c, COLS, r) * hOf(D[i]);
      }

      const sk3 = sm(0.35, 1, e);
      const PM = 0.9 * sk3;
      const PH = 2.8 * sk3;
      const PS = 0.7 * sk3;
      const pad = 8;
      const cr = { left: cv.offsetLeft + 90, top: cv.offsetTop + 34 };
      const cellV = cell;
      const fa = sm(0.3, 0.85, e);

      const bbox = (cs_, sn_, se_, ce_, useZ) => {
        let a = 1e9,
          b = -1e9,
          c2 = 1e9,
          d = -1e9;
        for (let i = 0; i < n; i++) {
          const w0 = lerp(2 * GH_R[D[i].l], 0.9, useZ ? e : 0);
          const o = (1 - w0) / 2;
          const x = ((i / ROWS) | 0) + o;
          const y = (i % ROWS) + o;
          const z = useZ ? ZS[i] : 0;
          for (const [X, Y, Z] of [
            [x, y, z],
            [x + w0, y, z],
            [x, y + w0, z],
            [x + w0, y + w0, 0],
            [x, y + w0, 0],
            [x + w0, y, 0],
          ]) {
            const u = X * cs_ - Y * sn_;
            const v = (X * sn_ + Y * cs_) * se_ - Z * ce_;
            if (u < a) a = u;
            if (u > b) b = u;
            if (v < c2) c2 = v;
            if (v > d) d = v;
          }
        }
        if (useZ && sk3 > 0.001) {
          for (const [X, Y, Z] of [
            [-PM, -PM, 0],
            [COLS + PM, -PM, 0],
            [COLS + PM, ROWS + PM, 0],
            [-PM, ROWS + PM, 0],
            [COLS + PM + PS, ROWS + PM + PS, -PH],
            [-PM - PS, ROWS + PM + PS, -PH],
            [COLS + PM + PS, -PM - PS, -PH],
          ]) {
            const u = X * cs_ - Y * sn_;
            const v = (X * sn_ + Y * cs_) * se_ - Z * ce_;
            if (u < a) a = u;
            if (u > b) b = u;
            if (v < c2) c2 = v;
            if (v > d) d = v;
          }
        }
        return { a, b, c2, d };
      };

      const fl = bbox(1, 0, 1, 0, false);
      const cu = bbox(cs, sn, se, ce, true);
      const AL = lerp(cr.left + fl.a * cellV, pad + 40, fa);
      const AT = lerp(cr.top + fl.c2 * cellV, pad, fa);
      const aw = lerp((fl.b - fl.a) * cellV, OW - 2 * pad - 40, fa);
      const ah = lerp((fl.d - fl.c2) * cellV, OH - 2 * pad - 18, fa);
      const bw = cu.b - cu.a;
      const bh = cu.d - cu.c2;
      const S = Math.min(aw / bw, ah / bh);
      const OX = AL + (aw - bw * S) / 2 - cu.a * S;
      const OY = AT + (ah - bh * S) / 2 - cu.c2 * S;
      const px = (x, y) => OX + (x * cs - y * sn) * S;
      const py = (x, y, z) => OY + ((x * sn + y * cs) * se - z * ce) * S;

      ORD.sort(
        (a, b) =>
          (((a / ROWS) | 0) + 0.5) * sn +
          (a % ROWS + 0.5) * cs -
          ((((b / ROWS) | 0) + 0.5) * sn + (b % ROWS + 0.5) * cs)
      );

      ox.globalAlpha = 1;
      const crd = sm(0.65, 0.1, e) * 0.5;
      const PL = new Float32Array(8);

      for (const i of ORD) {
        const q = D[i];
        if (!q || q.n < 0) continue;
        const c = (i / ROWS) | 0;
        const r = i % ROWS;
        const z = ZS[i];
        const w0 = lerp(2 * GH_R[q.l], 0.9, e);
        const o = (1 - w0) / 2;
        const x = c + o;
        const y = r + o;
        const lev = q.l;
        const gc = GC[lev];
        const sc_ = SKY[lev] || SKY[0];

        // Top cap
        PL[0] = px(x, y);
        PL[1] = py(x, y, z);
        PL[2] = px(x + w0, y);
        PL[3] = py(x + w0, y, z);
        PL[4] = px(x + w0, y + w0);
        PL[5] = py(x + w0, y + w0, z);
        PL[6] = px(x, y + w0);
        PL[7] = py(x, y + w0, z);

        ox.fillStyle = mix(gc, sc_, e, 1);
        ox.beginPath();
        qpath(ox, PL, (w0 * S) * crd);
        ox.fill();
      }
    }

    // Magnetic Lens over contribution dots
    const lens = document.createElement('div');
    lens.className = 'ghl';
    const lxCv = document.createElement('canvas');
    const lx = lxCv.getContext('2d');
    lens.appendChild(lxCv);
    cv.parentElement.appendChild(lens);

    const LR = 32;
    const Z = 2.4;

    function sizeLens() {
      lxCv.width = LR * 2 * dpr;
      lxCv.height = LR * 2 * dpr;
      lxCv.style.width = `${LR * 2}px`;
      lxCv.style.height = `${LR * 2}px`;
    }

    function drawLens() {
      if (!lens.classList.contains('on')) return;
      const k = reduce ? 1 : 0.28;
      sx += (tx - sx) * k;
      sy += (ty - sy) * k;
      lens.style.transform = `translate3d(${(sx - LR).toFixed(1)}px, ${(sy - LR).toFixed(1)}px, 0)`;

      lx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lx.clearRect(0, 0, 2 * LR, 2 * LR);
      lx.save();
      lx.beginPath();
      lx.arc(LR, LR, LR, 0, 6.2831853);
      lx.clip();
      lx.fillStyle = '#0e0e0f';
      lx.fillRect(0, 0, 2 * LR, 2 * LR);

      const span = (LR / Z) * 1.4;
      const c0 = Math.max(0, Math.floor((sx - span) / cell));
      const c1 = Math.min(COLS - 1, Math.ceil((sx + span) / cell));
      const w0 = Math.max(0, Math.floor((sy - span) / cell));
      const w1 = Math.min(ROWS - 1, Math.ceil((sy + span) / cell));

      for (let c = c0; c <= c1; c++) {
        for (let r = w0; r <= w1; r++) {
          const i = c * ROWS + r;
          const q = D[i];
          if (!q || q.n < 0) continue;
          const X = LR + ((c + 0.5) * cell - sx) * Z;
          const Y = LR + ((r + 0.5) * cell - sy) * Z;
          const R = cell * GH_R[q.l] * Z * (i === hv ? 1.18 : 1);
          lx.fillStyle = GH_COL[q.l];
          lx.beginPath();
          lx.arc(X, Y, R, 0, 6.2831853);
          lx.fill();

          if (i === TODAY) {
            lx.strokeStyle = '#fff';
            lx.lineWidth = 1.2;
            lx.beginPath();
            lx.arc(X, Y, R + 3, 0, 6.2831853);
            lx.stroke();
          }
          if (i === lc) {
            lx.strokeStyle = 'rgba(255,255,255,.9)';
            lx.lineWidth = 1.3;
            lx.beginPath();
            lx.arc(X, Y, Math.max(R, cell * 0.34 * Z) + (i === TODAY ? 6.5 : 4), 0, 6.2831853);
            lx.stroke();
          }
        }
      }

      const g = lx.createRadialGradient(LR * 0.7, LR * 0.55, 2, LR, LR, LR);
      g.addColorStop(0, 'rgba(255,255,255,.10)');
      g.addColorStop(0.55, 'rgba(255,255,255,0)');
      g.addColorStop(1, 'rgba(255,255,255,.05)');
      lx.fillStyle = g;
      lx.fillRect(0, 0, 2 * LR, 2 * LR);
      lx.restore();

      lx.strokeStyle = 'rgba(255,255,255,.3)';
      lx.lineWidth = 1;
      lx.beginPath();
      lx.arc(LR, LR, LR - 0.5, 0, 6.2831853);
      lx.stroke();
    }

    let rafId = 0;
    const frame = (t) => {
      if (!on) {
        loop = false;
        return;
      }
      if (pend) {
        const r = cv.getBoundingClientRect();
        stab = lt !== null && Math.abs(r.top - lt) < 0.5 && Math.abs(r.left - ll) < 0.5 ? stab + 1 : 0;
        lt = r.top;
        ll = r.left;
        if (stab >= 10) {
          pend = false;
          t0 = t;
          intro = true;
          sizeOv();
          ov.style.display = '';
          ov.parentElement?.classList.add('gi');
          clearLock();
        }
      }
      drawIntro(t);
      draw(t);
      drawLens();
      rafId = requestAnimationFrame(frame);
    };

    size();
    sizeLens();
    sizeOv();

    function nearest(c, r) {
      c = Math.min(COLS - 1, Math.max(0, c));
      r = Math.min(ROWS - 1, Math.max(0, r));
      let i = c * ROWS + r;
      while (i > 0 && D[i] && D[i].n < 0) i--;
      return i;
    }

    function setLock(i, pull) {
      const q = D[i];
      if (!q || q.n < 0) return;
      const ch = lc !== i;
      lc = hv = i;
      const c = (i / ROWS) | 0;
      const r = i % ROWS;
      const X = (c + 0.5) * cell;
      const Y = (r + 0.5) * cell;
      tx = pull ? X + (mx - X) * 0.14 : X;
      ty = pull ? Y + (my - Y) * 0.14 : Y;
      if (!lens.classList.contains('on')) {
        sx = tx;
        sy = ty;
      }
      lens.classList.add('on');
      if (ch) {
        hEl.textContent = `${q.d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })} · ${q.n} contribution${q.n === 1 ? '' : 's'}`;
      }
    }

    function clearLock() {
      lc = hv = -1;
      mx = my = sx = sy = tx = ty = -999;
      lens.classList.remove('on');
      hEl.textContent = '';
    }

    const onPointerMove = (e) => {
      if (intro) return;
      kb = false;
      const b = cv.getBoundingClientRect();
      mx = e.clientX - b.left;
      my = e.clientY - b.top;
      if (e.pointerType === 'touch') return;
      if (lc >= 0) {
        const c = (lc / ROWS) | 0;
        const r = lc % ROWS;
        if (Math.max(Math.abs(mx - (c + 0.5) * cell), Math.abs(my - (r + 0.5) * cell)) < cell * 0.7) {
          setLock(lc, true);
          return;
        }
      }
      setLock(nearest(Math.floor(mx / cell), Math.floor(my / cell)), true);
    };

    const onPointerLeave = () => {
      if (!kb) clearLock();
    };

    const onKeyDown = (e) => {
      const m = { ArrowLeft: -ROWS, ArrowRight: ROWS, ArrowUp: -1, ArrowDown: 1 }[e.key];
      if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        kb = true;
        if (TODAY >= 0) setLock(TODAY, false);
        return;
      }
      if (!m) return;
      e.preventDefault();
      kb = true;
      const i = (lc < 0 ? TODAY : lc) + m;
      if (i >= 0 && i < D.length && D[i].n >= 0) setLock(i, false);
    };

    const onBlur = () => {
      if (kb) {
        kb = false;
        clearLock();
      }
    };

    cv.addEventListener('pointermove', onPointerMove);
    cv.addEventListener('pointerleave', onPointerLeave);
    cv.tabIndex = 0;
    cv.addEventListener('keydown', onKeyDown);
    cv.addEventListener('blur', onBlur);

    const onResize = () => {
      size();
      sizeLens();
      sizeOv();
      clearLock();
    };
    window.addEventListener('resize', onResize);

    const obs = new IntersectionObserver(
      (entries) => {
        const v = entries[0].isIntersecting;
        if (!v) pend = false;
        if (v && !on) {
          t0 = performance.now();
          dly = 0;
          intro = false;
          ov.style.display = 'none';
          ov.parentElement?.classList.remove('gi');
          if (!reduce) {
            pend = true;
            stab = 0;
            lt = null;
          }
        }
        on = v;
        if (on && !loop) {
          loop = true;
          rafId = requestAnimationFrame(frame);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(cv);

    return () => {
      cv.removeEventListener('pointermove', onPointerMove);
      cv.removeEventListener('pointerleave', onPointerLeave);
      cv.removeEventListener('keydown', onKeyDown);
      cv.removeEventListener('blur', onBlur);
      window.removeEventListener('resize', onResize);
      obs.disconnect();
      cancelAnimationFrame(rafId);
      ov.remove();
      lens.remove();
    };
  }, []);

  return (
    <section id="stack" ref={containerRef} className="dk">
      <ParticlesBackground containerRef={containerRef} />
      <div className="stk">
        {/* Header with Title and GitHub Graph */}
        <div className="sth">
          <div className="shd rv">
            <h2>TECH STACK</h2>
            <p>
              A well-chosen stack is the foundation of success. Here are the platforms I trust to build seamlessly and secure fiercely.
            </p>
          </div>

          <div className="ghw rv" style={{ '--d': 1 }}>
            <div className="gh">
              <div className="gt">
                <span>
                  github <span id="ghh" ref={ghhRef}></span>
                </span>
                <a href={`https://github.com/${GH_USER}`} target="_blank" rel="noopener">
                  @{GH_USER.toUpperCase()}
                </a>
              </div>
              <canvas id="ghc" ref={cvRef} aria-label={`GitHub contribution graph for @${GH_USER}`} />
              <div className="gf">
                <span id="ghn" ref={ghnRef}></span>
              </div>
            </div>
          </div>
        </div>

        {/* Stack Groups */}
        {STACK.map(([g, items, tight], i) => (
          <div key={g} className={`grp rv ${tight ? 'tight' : ''}`} style={{ '--d': i }}>
            <h3
              dangerouslySetInnerHTML={{
                __html: g.replace('&', '&amp;').replace('\n', '<br>'),
              }}
            />
            <div className="bd">
              {items.map(([name, w, fs, fw, bg, c, gl]) => (
                <span
                  key={name}
                  className={`b ${c === 'grad' ? 'grad' : c === 'ic' ? 'ic' : ''}`}
                  style={{
                    '--w': `${w}px`,
                    '--fs': `${fs}px`,
                    '--fw': fw,
                    background: bg,
                    '--c': c === 'grad' || c === 'ic' ? '#fff' : c,
                    '--g': gl,
                  }}
                >
                  <i>{name}</i>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
