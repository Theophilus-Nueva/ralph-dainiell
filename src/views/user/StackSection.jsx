import React, { useEffect, useRef } from 'react';
import ParticlesBackground from '../../components/ParticlesBackground';
import { STACK, GH_USER, GH_COL, GH_R, GH_SNAP } from '../../data/portfolioData';

export default function StackSection({ stack }) {
  const stackList = stack && stack.length > 0 ? stack : STACK;
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
    const PL = new Float32Array(8);

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
    const riseAt = (t, wk, wks, dy) =>
      eo3((t - ((wks > 1 ? wk / (wks - 1) : 0) * 0.36 + (dy / 6) * 0.06)) / (1 - WAVE));

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
      const kq = sm(0.15, 0.7, e);
      const base = (l) => GC[l];
      const rg = (c, f) =>
        'rgb(' +
        Math.round(c[0] * f) +
        ',' +
        Math.round(c[1] * f) +
        ',' +
        Math.round(c[2] * f) +
        ')';

      // Plinth (solid base of a GitHub Skyline model)
      if (sk3 > 0.01) {
        const xa = -PM;
        const xb = COLS + PM;
        const ya = -PM;
        const yb = ROWS + PM;
        const P = (x, y, z) => [px(x, y), py(x, y, z)];
        const FL = [P(xa, yb, 0), P(xb, yb, 0), P(xb + PS, yb + PS, -PH), P(xa - PS, yb + PS, -PH)];
        const EN = [P(xb, ya, 0), P(xb, yb, 0), P(xb + PS, yb + PS, -PH), P(xb + PS, ya - PS, -PH)];
        const TP = [P(xa, ya, 0), P(xb, ya, 0), P(xb, yb, 0), P(xa, yb, 0)];

        const poly = (pt, fill) => {
          ox.beginPath();
          ox.moveTo(pt[0][0], pt[0][1]);
          for (let j = 1; j < pt.length; j++) ox.lineTo(pt[j][0], pt[j][1]);
          ox.closePath();
          ox.fillStyle = fill;
          ox.fill();
        };

        ox.save();
        ox.globalAlpha = sk3;
        ox.shadowColor = 'rgba(0,0,0,.32)';
        ox.shadowBlur = 16 * sk3;
        ox.shadowOffsetY = 9 * sk3;
        poly([FL[3], FL[2], EN[2], EN[3], TP[1], TP[0], TP[3]], '#1b1b1f');
        ox.shadowColor = 'transparent';

        let g = ox.createLinearGradient(0, FL[0][1], 0, FL[3][1]);
        g.addColorStop(0, '#56565e');
        g.addColorStop(1, '#1f1f23');
        poly(FL, g);

        g = ox.createLinearGradient(0, EN[0][1], 0, EN[2][1]);
        g.addColorStop(0, '#2c2c31');
        g.addColorStop(1, '#141417');
        poly(EN, g);

        poly(TP, '#2a2a2f');
        ox.strokeStyle = 'rgba(255,255,255,.14)';
        ox.lineWidth = 0.8;
        ox.beginPath();
        ox.moveTo(TP[3][0], TP[3][1]);
        ox.lineTo(TP[2][0], TP[2][1]);
        ox.lineTo(TP[1][0], TP[1][1]);
        ox.stroke();

        // Engraved text on the front face
        if (sk3 > 0.5) {
          const yf = yb + PS * 0.5;
          const zf = -PH * 0.5;
          const kk = 0.1;
          const mono =
            (getComputedStyle(document.documentElement).getPropertyValue('--mono') || '').trim() ||
            'ui-monospace,Menlo,monospace';
          ox.translate(0, 0);
          ox.setTransform(
            dpr * cs * S,
            dpr * sn * se * S,
            0,
            dpr * ce * S,
            dpr * (OX - yf * sn * S),
            dpr * (OY + yf * cs * se * S)
          );
          ox.font = '700 10px ' + mono;
          ox.textBaseline = 'middle';
          ox.globalAlpha = (sk3 - 0.5) * 2;
          const put = (txt, x, al) => {
            ox.save();
            ox.scale(kk, kk);
            ox.textAlign = al;
            ox.fillStyle = 'rgba(255,255,255,.28)';
            ox.fillText(txt, x / kk + 0.4, -zf / kk + 0.4);
            ox.fillStyle = 'rgba(0,0,0,.78)';
            ox.fillText(txt, x / kk, -zf / kk);
            ox.restore();
          };
          ox.letterSpacing = '2px';
          put(`@${GH_USER.toUpperCase()}`, 2.2, 'left');
          put(String(new Date().getFullYear()), COLS - 2.2, 'right');
        }
        ox.restore();
        ox.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      const cell1 = (i, q) => {
        const c = (i / ROWS) | 0;
        const r = i % ROWS;
        const l = q.l;
        const col = base(l);
        const w = lerp(2 * GH_R[l], 0.9, e);
        const off = (1 - w) / 2;
        const x0 = c + off;
        const y0 = r + off;
        const x1 = x0 + w;
        const y1 = y0 + w;
        const z = ZS[i];
        const rad = lerp(w / 2, 0.08, kq) * S;
        const tall = z * ce * S;

        if (tall > 0.35) {
          if (w * cs * S > 0.35) {
            const yT = py(x0, y1, z);
            const yB = py(x0, y1, 0);
            const g = ox.createLinearGradient(0, yT, 0, yB);
            g.addColorStop(0, rg(col, 0.9));
            g.addColorStop(1, rg(col, 0.58));
            PL[0] = px(x0, y1);
            PL[1] = yB;
            PL[2] = px(x1, y1);
            PL[3] = py(x1, y1, 0);
            PL[4] = px(x1, y1);
            PL[5] = py(x1, y1, z);
            PL[6] = px(x0, y1);
            PL[7] = yT;
            ox.beginPath();
            qpath(ox, PL, 0);
            ox.fillStyle = g;
            ox.fill();
          }
          if (w * sn * S > 0.35) {
            const yT = py(x1, y0, z);
            const yB = py(x1, y0, 0);
            const g = ox.createLinearGradient(0, yT, 0, yB);
            g.addColorStop(0, rg(col, 0.68));
            g.addColorStop(1, rg(col, 0.4));
            PL[0] = px(x1, y0);
            PL[1] = yB;
            PL[2] = px(x1, y1);
            PL[3] = py(x1, y1, 0);
            PL[4] = px(x1, y1);
            PL[5] = py(x1, y1, z);
            PL[6] = px(x1, y0);
            PL[7] = yT;
            ox.beginPath();
            qpath(ox, PL, 0);
            ox.fillStyle = g;
            ox.fill();
          }
        }

        PL[0] = px(x0, y0);
        PL[1] = py(x0, y0, z);
        PL[2] = px(x1, y0);
        PL[3] = py(x1, y0, z);
        PL[4] = px(x1, y1);
        PL[5] = py(x1, y1, z);
        PL[6] = px(x0, y1);
        PL[7] = py(x0, y1, z);
        ox.beginPath();
        qpath(ox, PL, rad);
        ox.fillStyle = rg(col, 1);
        ox.fill();

        if (tall > 1.2 && sk3 > 0.05) {
          ox.strokeStyle = 'rgba(255,255,255,' + (0.3 * sk3).toFixed(3) + ')';
          ox.lineWidth = 0.7;
          ox.stroke();
        }
        if (i === TODAY && e < 0.4) {
          ox.strokeStyle = 'rgba(255,255,255,' + (1 - e / 0.4).toFixed(2) + ')';
          ox.lineWidth = 1;
          ox.beginPath();
          ox.arc(px(c + 0.5, r + 0.5), py(c + 0.5, r + 0.5, z), (w / 2) * S + 2, 0, 6.2831853);
          ox.stroke();
        }
      };

      ox.globalAlpha = 1 - sk3;
      for (let k = 0; k < n; k++) {
        const i = ORD[k];
        const q = D[i];
        if (q.n === 0) cell1(i, q);
      }
      ox.globalAlpha = 1;

      if (sk3 > 0.02) {
        ox.beginPath();
        for (let k = 0; k < n; k++) {
          const i = ORD[k];
          const q = D[i];
          const z = ZS[i];
          if (q.n <= 0 || z < 0.5) continue;
          const c = (i / ROWS) | 0;
          const r = i % ROWS;
          const x0 = c + 0.05;
          const y0 = r + 0.05;
          const x1 = c + 0.95;
          const y1 = r + 0.95;
          const dx = z * 0.3;
          const dy = z * 0.1;
          const pts = [
            [x0, y0],
            [x1, y0],
            [x1, y1],
            [x0, y1],
            [x0 + dx, y0 + dy],
            [x1 + dx, y0 + dy],
            [x1 + dx, y1 + dy],
            [x0 + dx, y1 + dy],
          ]
            .map(([X, Y]) => [px(X, Y), py(X, Y, 0)])
            .sort((a, b) => a[0] - b[0] || a[1] - b[1]);

          const cr2 = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
          const lo = [];
          const up = [];
          for (const p of pts) {
            while (lo.length > 1 && cr2(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
            lo.push(p);
          }
          for (let j = pts.length - 1; j >= 0; j--) {
            const p = pts[j];
            while (up.length > 1 && cr2(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop();
            up.push(p);
          }
          const h = lo.slice(0, -1).concat(up.slice(0, -1));
          ox.moveTo(h[0][0], h[0][1]);
          for (let j = 1; j < h.length; j++) ox.lineTo(h[j][0], h[j][1]);
          ox.closePath();
        }
        ox.fillStyle = 'rgba(0,0,0,' + (0.34 * sk3).toFixed(3) + ')';
        ox.fill();
      }

      for (let k = 0; k < n; k++) {
        const i = ORD[k];
        const q = D[i];
        if (q.n > 0) cell1(i, q);
      }
      ox.globalAlpha = 1;
    }

    // Magnifying Lens canvas directly appended to .gh
    const LR = 46;
    const Z = 2.6;
    const lens = document.createElement('canvas');
    const lx = lens.getContext('2d');
    lens.className = 'ghl';
    lens.setAttribute('aria-hidden', 'true');
    cv.parentElement.appendChild(lens);

    function sizeLens() {
      lens.style.width = `${2 * LR}px`;
      lens.style.height = `${2 * LR}px`;
      lens.width = Math.round(2 * LR * dpr);
      lens.height = Math.round(2 * LR * dpr);
    }

    function drawLens() {
      if (lc < 0) return;
      sx += (tx - sx) * 0.32;
      sy += (ty - sy) * 0.32;
      if (Math.abs(tx - sx) < 0.04) sx = tx;
      if (Math.abs(ty - sy) < 0.04) sy = ty;
      lens.style.transform = `translate(${(cv.offsetLeft + sx - LR).toFixed(1)}px,${(cv.offsetTop + sy - LR).toFixed(1)}px)`;

      lx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lx.clearRect(0, 0, 2 * LR, 2 * LR);
      lx.fillStyle = '#0e0e0f';
      lx.fillRect(0, 0, 2 * LR, 2 * LR);
      lx.save();
      lx.beginPath();
      lx.arc(LR, LR, LR, 0, 6.2831853);
      lx.clip();

      const r0 = LR / Z / cell + 1;
      const c0 = Math.max(0, Math.floor(sx / cell - r0));
      const c1 = Math.min(COLS - 1, Math.ceil(sx / cell + r0));
      const w0 = Math.max(0, Math.floor(sy / cell - r0));
      const w1 = Math.min(ROWS - 1, Math.ceil(sy / cell + r0));

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
              <canvas id="ghc" ref={cvRef} tabIndex={0} aria-label={`GitHub contribution graph for @${GH_USER}`} />
              <div className="gf">
                <span id="ghn" ref={ghnRef}></span>
              </div>
            </div>
          </div>
        </div>

        {/* Stack Groups */}
        {stackList.map(([g, items, tight], i) => (
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
