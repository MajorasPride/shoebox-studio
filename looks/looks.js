/* Shoebox Studio — Looks pass (looks test, Nov 13 2026). By MajorasPride.
   Loaded after index.html's main script. It adds, without changing the old code:
   1. Paint that blends: real pigment mixing (spectral.js, MIT, Kubelka-Munk) for paints, markers, pencils and pastels;
      wet paint mixes more (wet-in-wet), brushes pick up the colour under them, a blending stump smudges.
   2. Clay and Yarn as mediums (and Felt, Knit and Clay slab papers), with textures made in Blender.
   3. The Real desk: real art supplies lying on the desk (crayon box, pencil cup, markers, brushes, palette knife,
      mixing palette, water cup, yarn, clay, blending stump, eraser, art tin). The old bottom toolbar stays as "Quick tools".
   4. Desk art style kits made in Blender: Real, Toon, Pixel.
   5. Small craft effects: paint splats, glitter sparkles, paper scraps, clay squish, water ripples.
   6. Pixel UI (Rise of the Polygons style) — the CSS is in looks.css; this file switches it on.
   Everything is set in Settings > Looks. Saved as craftloft_looks. */
(function () {
  'use strict';
  const BASE = (window.LOOKS_BASE || 'looks/');
  const LK = Object.assign({ ui: 1, desk: 'real', art: 'real', blend: 1, fx: 1, water: '#cfe3ee', wells: ['#e8443a', '#f7d23e', '#3767bb', '#ffffff', '#26221f', '#5bbf5a'], mine: [], dish: [] }, LS.get('looks', {}));
  const saveLK = () => LS.set('looks', LK);
  window.LOOKS = LK;
  const SP = window.spectral;
  const now = () => performance.now();

  /* ---------------- colour helpers ---------------- */
  const hx = h => { const c = hexRGB(h); return '#' + c.map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join(''); };
  const MIXC = new Map();
  function mixHex(a, b, t) { // t = how much of b
    if (t <= 0) return hx(a); if (t >= 1) return hx(b);
    a = hx(a); b = hx(b); const k = a + b + (t * 50 | 0); let r = MIXC.get(k); if (r) return r;
    try { r = SP ? SP.mix([new SP.Color(a), 1 - t], [new SP.Color(b), t]).toString() : null; } catch (e) { r = null; }
    if (!r) { const A = hexRGB(a), B = hexRGB(b); r = hx('rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ')'); }
    if (MIXC.size > 4000) MIXC.clear(); MIXC.set(k, r); return r;
  }
  function shade(h, k) { const c = hexRGB(h); return 'rgb(' + c.map(v => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k)).join(',') + ')'; }
  function lumChroma(rgb) { const [r, g, b] = rgb.map(v => v / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return [(mx + mn) / 2, mx - mn]; }

  /* ---------------- assets (Blender style kits) ---------------- */
  const IMG = {}; let ATLAS = null;
  const PROPS = ['crayon', 'crayon_box', 'cpencil', 'pencil', 'pencil_cup', 'marker', 'brush_round', 'brush_flat', 'palette_knife', 'mixing_palette', 'water_cup', 'yarn_ball', 'clay_lump', 'eraser', 'art_tin', 'stump'];
  const TEX = ['tex_clay', 'tex_knit', 'tex_felt', 'tex_yarn_strand'];
  function img(src) { return new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }); }
  async function loadStyle(st) {
    if (IMG[st]) return IMG[st];
    const o = {}; await Promise.all(PROPS.map(async n => { o[n] = await img(BASE + 'assets/' + st + '/' + n + '.png'); if (ATLAS && ATLAS.props[n] && ATLAS.props[n][st] && ATLAS.props[n][st].mask) o[n + '_mask'] = await img(BASE + 'assets/' + st + '/' + n + '_mask.png'); }));
    await Promise.all(TEX.map(async n => { o[n] = await img(BASE + 'assets/real/' + n + '.png'); }));
    IMG[st] = o; return o;
  }
  const ready = (async () => { try { ATLAS = await (await fetch(BASE + 'assets/atlas.json')).json(); } catch (e) { ATLAS = { props: {}, wells: [] }; } await loadStyle(LK.art); })();
  const A = () => IMG[LK.art] || IMG.real || {};
  const TINTC = new Map();
  function tinted(n, col) { // a prop with its tint parts coloured
    const S = A(), im = S[n]; if (!im) return null; const m = S[n + '_mask']; if (!m || !col) return im;
    const k = LK.art + n + col; let c = TINTC.get(k); if (c) return c;
    c = mkCanvas(im.width, im.height); const x = c._x; x.imageSmoothingEnabled = LK.art !== 'pixel';
    x.drawImage(im, 0, 0); const t = mkCanvas(im.width, im.height); t._x.drawImage(m, 0, 0, im.width, im.height); t._x.globalCompositeOperation = 'source-in'; t._x.fillStyle = col; t._x.fillRect(0, 0, im.width, im.height);
    x.globalCompositeOperation = 'multiply'; x.drawImage(t, 0, 0); x.globalCompositeOperation = 'destination-in'; x.drawImage(im, 0, 0);
    if (TINTC.size > 300) TINTC.clear(); TINTC.set(k, c); return c;
  }
  /* relief tile × colour = a texture for strokes and paper */
  const PATC = new Map();
  function texTile(n, col, size) {
    const k = n + col + size; let c = PATC.get(k); if (c) return c; const t = (IMG.real || A())[n]; if (!t) return null;
    const w = size, h = Math.round(size * t.height / t.width); c = mkCanvas(w, h); const x = c._x;
    x.fillStyle = col; x.fillRect(0, 0, w, h); x.globalCompositeOperation = 'overlay'; x.drawImage(t, 0, 0, w, h);
    x.globalCompositeOperation = 'destination-in'; x.drawImage(t, 0, 0, w, h);
    if (PATC.size > 200) PATC.clear(); PATC.set(k, c); return c;
  }

  /* ---------------- new mediums and papers ---------------- */
  Object.assign(MEDIA, {
    clay: { em: '🟤', name: 'Clay', w: 15, a: 1 },
    yarn: { em: '🧶', name: 'Yarn', w: 13, a: 1 },
    blend: { em: '👆', name: 'Blending stump', w: 13, a: .5 }
  });
  Object.assign(STOCKS, {
    felt: { em: '🟫', name: 'Felt', tip: 'Soft fuzzy felt. Yarn and glue love it.' },
    knit: { em: '🧣', name: 'Knitted fabric', tip: 'Stretchy knit stitches, like a sweater.' },
    slab: { em: '🟠', name: 'Clay slab', tip: 'A rolled-out sheet of clay with fingerprints.' }
  });
  const _stockTex = stockTex;
  stockTex = function (art, sk, col, p) {
    const tn = sk === 'felt' ? 'tex_felt' : sk === 'knit' ? 'tex_knit' : sk === 'slab' ? 'tex_clay' : null;
    if (!tn) return _stockTex(art, sk, col, p);
    const x = art._x, t = texTile(tn, col, sk === 'knit' ? 44 : sk === 'slab' ? 240 : 150); if (!t) return;
    x.save(); x.globalCompositeOperation = 'source-atop'; x.fillStyle = x.createPattern(t, 'repeat'); x.fillRect(0, 0, art.width, art.height);
    if (sk === 'slab') { x.strokeStyle = 'rgba(0,0,0,.18)'; x.lineWidth = 6; x.strokeRect(3, 3, art.width - 6, art.height - 6); x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = 2; x.strokeRect(7, 7, art.width - 14, art.height - 14); }
    x.restore();
  };
  // a fresh sheet of felt/knit/slab keeps the player's colour (no fixed colour), so only the texture is new

  /* ---------------- blending: medSeg wrapper ---------------- */
  const _medSeg = medSeg, _medSample = medSample;
  let NOBLEND = 0;
  medSample = function () { NOBLEND++; try { return _medSample.apply(this, arguments); } finally { NOBLEND--; } };
  const BLEND = { water: .5, poster: .22, oil: .35, crayon: .25, cpencil: .3, marker: .5, chalk: .3, gel: .1 };
  const GLAZE = { water: 1, marker: 1 }; // see-through: the colour under shows through (multiply, with a little pigment mixing)
  const BRUSH = { water: 1, poster: 1 };
  const WET = { water: 1, poster: 1, oil: 1 };
  const BL = { load: null, base: null, wetUntil: 0, carry: null };
  function canvasPt(c, q) { const m = c.getTransform(); return { x: m.a * q.x + m.c * q.y + m.e, y: m.b * q.x + m.d * q.y + m.f }; }
  function under(c, q, r) {
    const P = canvasPt(c, q), W2 = c.canvas.width, H2 = c.canvas.height; r = Math.max(1, Math.round(r || 2));
    const x0 = clamp(Math.round(P.x) - r, 0, W2 - 1), y0 = clamp(Math.round(P.y) - r, 0, H2 - 1), w = Math.min(2 * r + 1, W2 - x0), h = Math.min(2 * r + 1, H2 - y0);
    if (w < 1 || h < 1) return null; let d; try { d = c.getImageData(x0, y0, w, h).data; } catch (e) { return null; }
    let R = 0, G = 0, B = 0, Aa = 0; for (let i = 0; i < d.length; i += 4) { const a = d[i + 3]; R += d[i] * a; G += d[i + 1] * a; B += d[i + 2] * a; Aa += a; }
    if (Aa < 1) return null; return { rgb: [R / Aa, G / Aa, B / Aa], a: Aa / (255 * d.length / 4), P };
  }
  // wet map: where paint went down in the last 25 s (per canvas, 12 px cells)
  const WM = new WeakMap();
  const wetKey = P => (P.x / 12 | 0) + ',' + (P.y / 12 | 0);
  function isWet(c, P) { const m = WM.get(c.canvas); const t = m && m.get(wetKey(P)); return t && now() - t < 25000; }
  function markWet(c, P) { let m = WM.get(c.canvas); if (!m) { m = new Map(); WM.set(c.canvas, m); } if (m.size > 6000) m.clear(); m.set(wetKey(P), now()); }

  /* whole-stroke redraw for clay and yarn (so the coil and the twist stay smooth): */
  let STK = null;
  function stkBegin(c, m, col, k) { let snap = null; try { const t = c.getTransform(); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); snap = c.getImageData(0, 0, c.canvas.width, c.canvas.height); c.restore(); c.setTransform(t); } catch (e) { } STK = { cv: c.canvas, snap, m, col, k, pts: [] }; }
  function stkRestore(c) { if (!STK.snap) return; const t = c.getTransform(); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.putImageData(STK.snap, 0, 0); c.restore(); c.setTransform(t); }
  function polyPathTo(c, pts, dx, dy) { c.beginPath(); pts.forEach((q, i) => i ? c.lineTo(q.x + dx, q.y + dy) : c.moveTo(q.x + dx, q.y + dy)); if (pts.length === 1) c.lineTo(pts[0].x + dx + .1, pts[0].y + dy); }
  function drawClay(c, pts, col, k) {
    const w = MEDIA.clay.w * k; c.lineCap = c.lineJoin = 'round';
    c.globalAlpha = .28; c.strokeStyle = '#2b1d16'; c.lineWidth = w * 1.02; polyPathTo(c, pts, w * .12, w * .2); c.stroke();
    c.globalAlpha = 1; c.strokeStyle = shade(col, -.22); c.lineWidth = w; polyPathTo(c, pts, 0, 0); c.stroke();
    const t = texTile('tex_clay', col, Math.round(200 * k)); c.strokeStyle = t ? c.createPattern(t, 'repeat') : col; c.lineWidth = w * .8; polyPathTo(c, pts, -w * .05, -w * .07); c.stroke();
    c.globalAlpha = .5; c.strokeStyle = shade(col, .55); c.lineWidth = w * .16; polyPathTo(c, pts, -w * .2, -w * .24); c.stroke();
    c.globalAlpha = 1;
  }
  function drawYarn(c, pts, col, k) {
    const w = MEDIA.yarn.w * k; c.lineCap = c.lineJoin = 'round';
    c.globalAlpha = .22; c.strokeStyle = '#2b1d16'; c.lineWidth = w; polyPathTo(c, pts, w * .12, w * .2); c.stroke(); c.globalAlpha = 1;
    const t = texTile('tex_yarn_strand', col, Math.round(w * 128 / 66));
    if (!t || pts.length < 2) { c.strokeStyle = col; c.lineWidth = w * .9; polyPathTo(c, pts, 0, 0); c.stroke(); return; }
    c.strokeStyle = shade(col, -.12); c.lineWidth = w * .82; polyPathTo(c, pts, 0, 0); c.stroke(); // core under the plies, so no gaps
    const tw = t.width, th = t.height, step = Math.max(1.5, 1.5 * k); let L = 0;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], d = Math.hypot(b.x - a.x, b.y - a.y); if (d < .01) continue; const ang = Math.atan2(b.y - a.y, b.x - a.x);
      for (let s = 0; s < d; s += step) {
        const u = (L + s) % (tw - 1), sw = Math.min(step + 1, tw - 1 - u);
        c.save(); c.translate(a.x + (b.x - a.x) * s / d, a.y + (b.y - a.y) * s / d); c.rotate(ang); c.drawImage(t, u, 0, sw, th, 0, -w / 2, sw, w); c.restore();
      } L += d;
    }
    c.globalAlpha = .28; c.strokeStyle = '#fff'; c.lineWidth = w * .14; polyPathTo(c, pts, -w * .1, -w * .22); c.stroke(); c.globalAlpha = 1;
  }
  medSeg = function (c, m, col, pts, k, wet) {
    k = k || 1;
    if (m === 'clay' || m === 'yarn') {
      if (pts.length === 1 || !STK || STK.cv !== c.canvas || STK.m !== m) stkBegin(c, m, col, k);
      const last = STK.pts[STK.pts.length - 1];
      pts.forEach(q => { if (!last || q !== last) STK.pts.push({ x: q.x, y: q.y }); });
      if (STK.pts.length > 600) { STK.pts = STK.pts.slice(-2); stkBegin(c, m, col, k); STK.pts = pts.slice(); }
      stkRestore(c); (m === 'clay' ? drawClay : drawYarn)(c, STK.pts, col, k);
      if (m === 'clay') FX.lastClay = { col, at: now() };
      return;
    }
    if (m === 'blend') { // blending stump: carry the colour under it along
      const b = pts[pts.length - 1], U = under(c, b, 3); if (!U) return; const uh = hx('rgb(' + U.rgb.map(Math.round).join(',') + ')');
      if (pts.length === 1 || !BL.carry) { BL.carry = uh; return; }
      const out = mixHex(BL.carry, uh, .5); BL.carry = mixHex(BL.carry, uh, .28);
      c.save(); c.globalAlpha = .45; c.lineCap = c.lineJoin = 'round'; c.lineWidth = MEDIA.blend.w * k; c.strokeStyle = out; polyPathTo(c, pts, 0, 0); c.stroke(); c.restore(); return;
    }
    const M = MEDIA[m]; const bk = BLEND[m];
    if (!LK.blend || NOBLEND || !bk || !M || M.fixed) return _medSeg(c, m, col, pts, k, wet);
    if (BRUSH[m]) { if (BL.base !== col) { BL.base = col; BL.load = col; } }
    const b = pts[pts.length - 1], a0 = pts.length > 1 ? pts[pts.length - 2] : null; let q = b;
    if (a0) { const d = Math.hypot(b.x - a0.x, b.y - a0.y); if (d > .01) { const ah = M.w * k * .6; q = { x: b.x + (b.x - a0.x) / d * ah, y: b.y + (b.y - a0.y) / d * ah }; } } // look just ahead of the tip, not at our own fresh paint
    const U = under(c, q, Math.max(1, M.w * k * .2)); let out = BRUSH[m] ? BL.load : col;
    if (U && U.a > .5) {
      const [l, ch] = lumChroma(U.rgb), uh = hx('rgb(' + U.rgb.map(Math.round).join(',') + ')');
      const paper = l > .9 && ch < .08; // bare white paper: the paint's own see-through look already shows it
      if (!paper) {
        const wetHere = WET[m] && isWet(c, U.P);
        if (GLAZE[m]) { const C1 = hexRGB(out), mul = hx('rgb(' + C1.map((v, i) => Math.round(v * U.rgb[i] / 255)).join(',') + ')'); out = mixHex(mul, mixHex(out, uh, .5), .3); }
        else { let t = bk; if (wetHere) t = Math.min(.62, t + .3); out = mixHex(out, uh, t); }
        if (BRUSH[m]) BL.load = mixHex(BL.load, uh, GLAZE[m] ? (wetHere ? .03 : .01) : wetHere ? .12 : .04); // the brush picks up wet paint and gets dirty
      }
      if (WET[m]) markWet(c, U.P);
    }
    if (m === 'water' && BL.wetUntil > now()) wet = true;
    _medSeg(c, m, out, pts, k, wet);
    if (FX.on() && c.canvas !== FX.skip) FX.onPaint(m, out, pts.length === 1);
  };
  const _medNote = medNote; medNote = function (o, m, col) { if (m === 'blend') return; _medNote(o, m, col); };

  /* ---------------- craft effects (world space on the desk) ---------------- */
  const FX = {
    P: [], lastClay: null, skip: null, wp: null, wasDraw: false,
    on: () => LK.fx && SCR === 'craft',
    add(o) { if (this.P.length < 260) this.P.push(Object.assign({ life: 1, r: 0, vr: 0, vx: 0, vy: 0 }, o)); },
    onPaint(m, col, start) {
      const w = this.wp; if (!w) return;
      if ((m === 'poster' || m === 'water') && start) { for (let i = 0; i < 6; i++) { const a = rnd(TAU), v = rnd(30, 120); this.add({ k: 'drop', x: w.x, y: w.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, s: rnd(2, 5.5), col, dec: 2.2 }); } try { SFX2.splat(); } catch (e) { } }
      if (m === 'glitter' && Math.random() < .45) this.add({ k: 'spark', x: w.x + rnd(-12, 12), y: w.y + rnd(-12, 12), s: rnd(4, 9), col: '#fff', dec: 1.6, vy: -14 });
    },
    squish(w, col) { this.add({ k: 'ring', x: w.x, y: w.y, s: 6, col, dec: 2.4 }); for (let i = 0; i < 4; i++) { const a = rnd(TAU); this.add({ k: 'crumb', x: w.x, y: w.y, vx: Math.cos(a) * 60, vy: Math.sin(a) * 60 - 40, s: rnd(2, 4), col, dec: 1.4, g: 220 }); } try { SFX2.squish(); } catch (e) { } },
    scraps(w, col, n) { for (let i = 0; i < n; i++) this.add({ k: 'scrap', x: w.x, y: w.y, vx: rnd(-80, 80), vy: rnd(-120, -10), g: 300, r: rnd(TAU), vr: rnd(-8, 8), s: rnd(4, 9), col, dec: .7, sh: Math.random() < .5 ? 0 : 1 }); },
    burst(w, n) { for (let i = 0; i < n; i++) this.add({ k: 'spark', x: w.x + rnd(-160, 160), y: w.y + rnd(-200, 200), s: rnd(5, 12), col: ['#fff', '#ffe9a8', '#f9d5ff', '#c9f1ff'][i & 3], dec: rnd(.9, 1.6), vy: -8 }); },
    step(dt) { for (const p of this.P) { p.x += p.vx * dt; p.y += p.vy * dt; if (p.g) p.vy += p.g * dt; else { p.vx *= .9; p.vy *= .9; } p.r += p.vr * dt; p.life -= dt * p.dec; } this.P = this.P.filter(p => p.life > 0); },
    draw(x) {
      for (const p of this.P) {
        const a = clamp(p.life, 0, 1); x.save(); x.translate(p.x, p.y); x.rotate(p.r);
        if (p.k === 'drop') { x.globalAlpha = a; x.fillStyle = p.col; x.beginPath(); x.arc(0, 0, p.s * (.6 + .4 * a), 0, TAU); x.fill(); x.fillStyle = 'rgba(255,255,255,.5)'; x.beginPath(); x.arc(-p.s * .3, -p.s * .3, p.s * .25, 0, TAU); x.fill(); }
        else if (p.k === 'spark') { const s = p.s * Math.sin(a * Math.PI); x.globalAlpha = a; x.fillStyle = p.col; x.beginPath(); x.moveTo(0, -s); x.quadraticCurveTo(0, 0, s, 0); x.quadraticCurveTo(0, 0, 0, s); x.quadraticCurveTo(0, 0, -s, 0); x.quadraticCurveTo(0, 0, 0, -s); x.fill(); }
        else if (p.k === 'ring') { x.globalAlpha = a * .7; x.strokeStyle = shade(p.col, -.3); x.lineWidth = 3; x.beginPath(); x.ellipse(0, 0, p.s + (1 - a) * 26, (p.s + (1 - a) * 26) * .6, 0, 0, TAU); x.stroke(); }
        else if (p.k === 'crumb') { x.globalAlpha = a; x.fillStyle = p.col; x.beginPath(); x.arc(0, 0, p.s, 0, TAU); x.fill(); }
        else if (p.k === 'scrap') { x.globalAlpha = Math.min(1, a * 2); x.fillStyle = p.col; x.strokeStyle = 'rgba(0,0,0,.2)'; x.lineWidth = .8; x.beginPath(); if (p.sh) { x.moveTo(-p.s, -p.s * .4); x.lineTo(p.s, -p.s * .6); x.lineTo(p.s * .2, p.s * .7); } else { x.moveTo(-p.s, 0); x.quadraticCurveTo(0, -p.s, p.s, 0); x.quadraticCurveTo(0, -p.s * .3, -p.s, 0); } x.closePath(); x.fill(); x.stroke(); }
        x.restore();
      }
    }
  };
  window.LOOKS_FX = FX;
  const _drawCraft = drawCraft;
  drawCraft = function () {
    _drawCraft.apply(this, arguments);
    // stroke ended? clay squish at the end of a clay stroke
    const st = C.st, drawing = st && st.k === 'draw';
    if (FX.wasDraw && !drawing && FX.lastClay && now() - FX.lastClay.at < 400 && FX.wp && LK.fx) FX.squish(FX.wp, FX.lastClay.col);
    if (FX.wasDraw && !drawing) { BL.carry = null; STK = null; }
    FX.wasDraw = drawing;
    FX.step(DT || .016); if (!FX.P.length) return;
    const v = C.view, ct = C.ctr || deskCtr(); g.save(); g.translate(ct.x, ct.y); g.scale(v.z, v.z); g.translate(-v.x, -v.y); FX.draw(g); g.restore();
  };
  const trackPt = e => { if (SCR === 'craft') FX.wp = s2w(e.clientX, e.clientY); };
  cv.addEventListener('pointerdown', trackPt, true); cv.addEventListener('pointermove', trackPt, true);
  const _spawnBits = spawnBits; spawnBits = function (w, color, n) { _spawnBits(w, color, n); if (LK.fx) FX.scraps(w, color, Math.ceil(n * .6)); };
  const _afterPlace = afterPlacePaper; afterPlacePaper = function () { _afterPlace(); const p = C.sel; if (LK.fx && p && (AB.stock === 'glit')) FX.burst({ x: p.x, y: p.y }, 26); };
  /* craft sounds */
  const SFX2 = {
    splat() { nz({ f: 700, q: .8, d: .08, g: .22, type: 'lowpass' }); },
    squish() { nz({ f: 380, q: 1.5, d: .14, g: .4, type: 'lowpass' }); tn({ f: 160, f2: 90, d: .12, g: .08, type: 'sine' }); },
    rinse() { for (let i = 0; i < 4; i++) tn({ f: 500 + Math.random() * 500, f2: 1200 + Math.random() * 600, d: .06, g: .05, at: i * .07, type: 'sine' }); nz({ f: 2400, q: .6, d: .25, g: .12 }); },
    pick() { tn({ f: 1300, d: .03, g: .07, type: 'triangle' }); nz({ f: 3000, q: 2, d: .03, g: .08 }); }
  };

  /* ---------------- the Real desk (supplies on the desk) ---------------- */
  const SUP = [
    { id: 'pencil', n: 'Pencil', w: 92, h: 26, pick: () => setMed('pencil') },
    { id: 'crayons', n: 'Crayons', w: 84, h: 70, drawer: 'crayon' },
    { id: 'cpencils', n: 'Coloured pencils', w: 56, h: 72, drawer: 'cpencil' },
    { id: 'markers', n: 'Markers', w: 76, h: 46, drawer: 'marker' },
    { id: 'palette', n: 'Mixing palette', w: 92, h: 66, pick: () => paletteDlg() },
    { id: 'brushR', n: 'Watercolour brush', w: 104, h: 22, pick: () => setMed('water', 1) },
    { id: 'brushF', n: 'Paint brush', w: 104, h: 22, pick: () => setMed('poster', 1) },
    { id: 'knife', n: 'Palette knife', w: 92, h: 20, pick: () => paletteDlg(1) },
    { id: 'water', n: 'Water cup', w: 50, h: 62, pick: () => rinse() },
    { id: 'yarn', n: 'Yarn', w: 64, h: 50, drawer: 'yarn' },
    { id: 'clay', n: 'Clay', w: 56, h: 46, drawer: 'clay' },
    { id: 'stump', n: 'Blending stump', w: 84, h: 20, pick: () => setMed('blend') },
    { id: 'eraser', n: 'Eraser', w: 48, h: 30, pick: () => { C.tool = 'eraser'; renderChips(); } },
    { id: 'tin', n: 'Art tin (more)', w: 68, h: 48, pick: () => artBoxDlg() }
  ];
  const DRW = { crayon: { med: 'crayon', n: 'Crayons' }, cpencil: { med: 'cpencil', n: 'Coloured pencils' }, marker: { med: 'marker', n: 'Markers' }, yarn: { med: 'yarn', n: 'Yarn' }, clay: { med: 'clay', n: 'Clay' } };
  let openDrawer = null;
  function setMed(m, keepCol) { AB.med = m; saveAB(); C.tool = 'pencil'; BL.base = null; try { SFX2.pick(); } catch (e) { } renderChips(); }
  function supOn(id) {
    if (C.tool === 'eraser') return id === 'eraser';
    if (C.tool !== 'pencil') return false; const m = AB.med;
    return ({ pencil: m === 'pencil', crayons: m === 'crayon', cpencils: m === 'cpencil', markers: m === 'marker', brushR: m === 'water', brushF: m === 'poster', yarn: m === 'yarn', clay: m === 'clay', stump: m === 'blend', tin: ['charcoal', 'chalk', 'oil', 'gel', 'glitter', 'glow'].includes(m) })[id] || false;
  }
  const colsFor = () => MCOLS.concat(LK.mine || []);
  function drawSup(cv2, id) {
    const S = A(), dpr = Math.min(2, devicePixelRatio || 1), W2 = cv2.width = Math.round(cv2._w * dpr), H2 = cv2.height = Math.round(cv2._h * dpr), x = cv2.getContext('2d');
    x.imageSmoothingEnabled = LK.art !== 'pixel'; x.clearRect(0, 0, W2, H2);
    const fit = (im, cx, cy, maxW, maxH, rot) => { if (!im) return; const s = Math.min(maxW / im.width, maxH / im.height); x.save(); x.translate(cx, cy); if (rot) x.rotate(rot); x.drawImage(im, -im.width * s / 2, -im.height * s / 2, im.width * s, im.height * s); x.restore(); };
    const col = AB.col;
    switch (id) {
      case 'pencil': fit(S.pencil, W2 / 2, H2 / 2, W2 * .98, H2, -.08); break;
      case 'crayons': { fit(S.crayon_box, W2 / 2, H2 * .56, W2 * .98, H2 * .9); const cs = MCOLS.slice(0, 8); cs.forEach((c, i) => { const im = tinted('crayon', c); fit(im, W2 * (.2 + i * .086), H2 * .52, W2 * .5, H2 * .12, -1.35 + i * .05); }); break; }
      case 'cpencils': { MCOLS.slice(1, 8).forEach((c, i) => fit(tinted('cpencil', c), W2 * (.3 + i * .065), H2 * .34, H2 * .78, H2 * .07, -Math.PI / 2 + (i - 3) * .07)); fit(S.pencil_cup, W2 / 2, H2 * .66, W2 * .8, H2 * .62); break; }
      case 'markers': ['#e8443a', '#3767bb', '#5bbf5a'].forEach((c, i) => fit(tinted('marker', c), W2 / 2, H2 * (.28 + i * .24), W2 * .96, H2 * .3, (i - 1) * .12)); break;
      case 'palette': { fit(S.mixing_palette, W2 / 2, H2 / 2, W2, H2); paintWells(x, W2, H2); break; }
      case 'brushR': fit(tinted('brush_round', (AB.med === 'water' ? (BL.load || col) : '#f4f4f2')), W2 / 2, H2 / 2, W2 * .98, H2, .05); break;
      case 'brushF': fit(tinted('brush_flat', (AB.med === 'poster' ? (BL.load || col) : '#f4f4f2')), W2 / 2, H2 / 2, W2 * .98, H2, -.06); break;
      case 'knife': fit(S.palette_knife, W2 / 2, H2 / 2, W2 * .98, H2, .04); break;
      case 'water': { fit(tinted('water_cup', LK.water), W2 / 2, H2 / 2, W2, H2); x.save(); x.globalCompositeOperation = 'source-atop'; x.globalAlpha = .28; x.fillStyle = LK.water; x.fillRect(0, H2 * .42, W2, H2); x.restore(); break; }
      case 'yarn': fit(tinted('yarn_ball', AB.med === 'yarn' ? col : '#e8443a'), W2 / 2, H2 / 2, W2, H2); break;
      case 'clay': fit(tinted('clay_lump', AB.med === 'clay' ? col : '#5bbf5a'), W2 / 2, H2 / 2, W2, H2); break;
      case 'stump': fit(S.stump, W2 / 2, H2 / 2, W2, H2, -.05); break;
      case 'eraser': fit(S.eraser, W2 / 2, H2 / 2, W2, H2); break;
      case 'tin': fit(S.art_tin, W2 / 2, H2 / 2, W2, H2); break;
    }
  }
  function paintWells(x, W2, H2) {
    const wl = (ATLAS && ATLAS.wells && (ATLAS.wells[LK.art] || ATLAS.wells.real)) || []; const im = A().mixing_palette; if (!im || !wl.length) return;
    const s = Math.min(W2 / im.width, H2 / im.height), iw = im.width * s, ih = im.height * s, ox = (W2 - iw) / 2, oy = (H2 - ih) / 2;
    wl.forEach((w, i) => {
      const cx = ox + w.x * iw, cy = oy + w.y * ih, r = w.r * iw * .78; const c = i < 6 ? LK.wells[i] : dishColor();
      if (!c) return; x.save(); x.globalAlpha = .95; x.fillStyle = c; x.beginPath(); x.ellipse(cx, cy, r, r * .82, 0, 0, TAU); x.fill();
      x.globalAlpha = .45; x.fillStyle = '#fff'; x.beginPath(); x.ellipse(cx - r * .3, cy - r * .3, r * .28, r * .18, -.5, 0, TAU); x.fill(); x.restore();
    });
  }
  function dishColor() { const d = LK.dish || []; if (!d.length) return null; let c = d[0].c, n = d[0].n; for (let i = 1; i < d.length; i++) { c = mixHex(c, d[i].c, d[i].n / (n + d[i].n)); n += d[i].n; } return c; }
  function rinse() {
    const was = BL.load || AB.col; LK.water = mixHex(LK.water, was, .18); saveLK(); BL.load = AB.col; BL.base = AB.col; BL.wetUntil = now() + 9000;
    try { SFX2.rinse(); } catch (e) { } const b = document.querySelector('[data-sup="water"]'); if (b) { b.classList.remove('rip'); void b.offsetWidth; b.classList.add('rip'); }
    toast('Rinsed. Your brush is clean and wet.'); renderChips();
  }
  function drawerHTML(kind) {
    const D = DRW[kind]; return '<div id="ldDrawerIn"><b>' + D.n + '</b>' + colsFor().map(c => '<button class="ldc' + (AB.med === D.med && AB.col === c ? ' on' : '') + '" data-c="' + c + '" aria-label="' + D.n + ' ' + c + '"><canvas></canvas></button>').join('') + '<button class="ldx" aria-label="Close">✕</button></div>';
  }
  function showDrawer(kind) {
    let d = $('#ldDrawer'); if (!d) { d = document.createElement('div'); d.id = 'ldDrawer'; $('#chips').before(d); }
    if (!kind) { d.innerHTML = ''; d.style.display = 'none'; openDrawer = null; return; }
    openDrawer = kind; d.style.display = ''; d.innerHTML = drawerHTML(kind); const D = DRW[kind];
    const im = { crayon: 'crayon', cpencil: 'cpencil', marker: 'marker', yarn: 'yarn_ball', clay: 'clay_lump' }[kind];
    d.querySelectorAll('.ldc').forEach(b => {
      const cc = b.querySelector('canvas'), dpr = Math.min(2, devicePixelRatio || 1), vert = kind === 'crayon' || kind === 'cpencil' || kind === 'marker';
      const w = vert ? 26 : 40, h = vert ? 92 : 36; cc.style.width = w + 'px'; cc.style.height = h + 'px'; cc.width = w * dpr; cc.height = h * dpr; const x = cc.getContext('2d'); x.imageSmoothingEnabled = LK.art !== 'pixel';
      const t = tinted(im, b.dataset.c); if (t) { x.save(); x.translate(cc.width / 2, cc.height / 2); if (vert) x.rotate(-Math.PI / 2); const s = vert ? Math.min(cc.height / t.width, cc.width / t.height) : Math.min(cc.width / t.width, cc.height / t.height); x.drawImage(t, -t.width * s / 2, -t.height * s / 2, t.width * s, t.height * s); x.restore(); }
      b.onclick = () => { AB.col = b.dataset.c; setMed(D.med); };
    });
    d.querySelector('.ldx').onclick = () => { SFX.tick(); showDrawer(null); };
  }
  const _renderChips = renderChips;
  renderChips = function () {
    _renderChips();
    const box = $('#chips'); document.body.classList.toggle('pxui', !!LK.ui);
    const real = LK.desk === 'real' && C.cat === 'draw';
    box.classList.toggle('ldesk', real); document.body.classList.toggle('ldeskOn', real);
    if (!real) { showDrawer(null); return; }
    const rest = [...box.children].filter(b => !/Art box|Pencil|Eraser|Coloured|Crayon|Marker|Watercolour|Poster|Charcoal|Chalk|Oil|Gel|Glitter|Glow|Clay|Yarn|Blending/.test(b.textContent));
    box.innerHTML = ''; const tray = document.createElement('div'); tray.id = 'ldTray';
    SUP.forEach(s => {
      const b = document.createElement('button'); b.className = 'ldi' + (supOn(s.id) ? ' on' : '') + (s.drawer && openDrawer === s.drawer ? ' open' : ''); b.dataset.sup = s.id; b.setAttribute('aria-label', s.n); b.title = s.n;
      const K = innerWidth >= 900 ? 1.4 : innerWidth >= 600 ? 1.2 : 1; // bigger supplies on a tablet or PC
      const cc = document.createElement('canvas'); cc._w = Math.round(s.w * K); cc._h = Math.round(s.h * K); cc.style.width = cc._w + 'px'; cc.style.height = cc._h + 'px'; b.append(cc);
      const lb = document.createElement('small'); lb.textContent = s.n.split(' (')[0]; b.append(lb);
      b.onclick = () => { auInit(); if (s.drawer) { SFX.tick(); showDrawer(openDrawer === s.drawer ? null : s.drawer); renderChips(); } else { showDrawer(null); s.pick(); } };
      tray.append(b); drawSup(cc, s.id);
    });
    const sep = document.createElement('i'); sep.className = 'ldsep'; tray.append(sep);
    rest.forEach(b => tray.append(b)); box.append(tray);
    if (openDrawer) showDrawer(openDrawer);
    const M = MEDIA[AB.med]; setHint(C.tool === 'pencil' ? (M ? M.em + ' ' + M.name + (M.fixed ? '' : ' · tap a supply to change') + (BLEND[AB.med] && LK.blend ? ' · colours blend' : '') : '') : (HINTS[C.tool] || ''));
  };
  // repaint the tray when art loads or style changes
  ready.then(() => { if (SCR === 'craft') renderChips(); });

  /* ---------------- mixing palette ---------------- */
  function paletteDlg(knife) {
    let sel = 0, stir = LK.dish && LK.dish.length > 1 ? 1 : 0;
    dlg('<h2>🎨 Mixing palette</h2><p class="ldp">Tap a well to load your brush. Pick a paint below to fill the selected well. Use the palette knife to put dabs in the dish, then drag in the dish to mix.</p><canvas id="ldPal"></canvas><div id="ldTubes">' + MCOLS.map(c => '<button data-t="' + c + '" style="background:' + c + '" aria-label="paint ' + c + '"></button>').join('') + '</div><div class="btns"><button class="alt" id="ldDab">🔪 Dab in the dish</button><button class="alt" id="ldClr">🧽 Clean dish</button></div><div class="btns"><button id="ldUse">Use this colour</button></div>', d => {
      const cv2 = d.querySelector('#ldPal'), dpr = Math.min(2, devicePixelRatio || 1), CW = Math.min(330, d.clientWidth - 8), CH = Math.round(CW * .7);
      cv2.style.width = CW + 'px'; cv2.style.height = CH + 'px'; cv2.width = CW * dpr; cv2.height = CH * dpr; const x = cv2.getContext('2d');
      const im = A().mixing_palette, wl = (ATLAS && ATLAS.wells && (ATLAS.wells[LK.art] || ATLAS.wells.real)) || [];
      const geo = () => { const s = Math.min(cv2.width / im.width, cv2.height / im.height), iw = im.width * s, ih = im.height * s; return { s, iw, ih, ox: (cv2.width - iw) / 2, oy: (cv2.height - ih) / 2 }; };
      const pick = () => sel < 6 ? LK.wells[sel] : dishColor();
      const paint = () => {
        x.clearRect(0, 0, cv2.width, cv2.height); if (!im) return; const G = geo(); x.imageSmoothingEnabled = LK.art !== 'pixel'; x.drawImage(im, G.ox, G.oy, G.iw, G.ih);
        wl.forEach((w, i) => {
          const cx = G.ox + w.x * G.iw, cy = G.oy + w.y * G.ih, r = w.r * G.iw * .8;
          if (i < 6) { x.fillStyle = LK.wells[i]; x.beginPath(); x.ellipse(cx, cy, r, r * .82, 0, 0, TAU); x.fill(); }
          else { // the dish: dabs swirl into one colour as you stir
            const D = LK.dish || []; const mc = dishColor();
            if (mc) { x.save(); x.beginPath(); x.ellipse(cx, cy, r, r * .82, 0, 0, TAU); x.clip(); x.globalAlpha = Math.min(1, stir); x.fillStyle = mc; x.fillRect(cx - r, cy - r, 2 * r, 2 * r);
              D.forEach((q, j) => { const a = j * 2.1 + stir * 5, rr = r * .45 * (1 - Math.min(1, stir) * .6); x.globalAlpha = 1 - Math.min(.92, stir * .9); x.fillStyle = q.c; x.beginPath(); x.ellipse(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .8, r * .32, r * .22, a, 0, TAU); x.fill();
                x.globalAlpha = .55 * (1 - Math.min(1, stir) * .7); x.strokeStyle = q.c; x.lineWidth = r * .08; x.beginPath(); x.arc(cx, cy, r * (.25 + .12 * j % .6), a, a + 1.6 + stir); x.stroke(); });
              x.restore(); }
          }
          x.globalAlpha = .45; x.fillStyle = '#fff'; x.beginPath(); x.ellipse(cx - r * .3, cy - r * .3, r * .26, r * .16, -.5, 0, TAU); x.fill(); x.globalAlpha = 1;
          if (i === sel) { x.strokeStyle = '#2b1d16'; x.lineWidth = 3 * dpr; x.setLineDash([5 * dpr, 4 * dpr]); x.beginPath(); x.ellipse(cx, cy, r + 4 * dpr, (r + 4 * dpr) * .82, 0, 0, TAU); x.stroke(); x.setLineDash([]); }
        });
        const c = pick(); d.querySelector('#ldUse').style.background = c || ''; d.querySelector('#ldUse').style.color = c && lumChroma(hexRGB(c))[0] < .45 ? '#fff' : '';
      };
      const wellAt = e => { const r = cv2.getBoundingClientRect(), px = (e.clientX - r.left) * dpr, py = (e.clientY - r.top) * dpr, G = geo(); let best = -1, bd = 1e9; wl.forEach((w, i) => { const cx = G.ox + w.x * G.iw, cy = G.oy + w.y * G.ih, dd = Math.hypot(px - cx, py - cy); if (dd < w.r * G.iw * 1.3 && dd < bd) { bd = dd; best = i; } }); return best; };
      let drag = null;
      cv2.onpointerdown = e => { const i = wellAt(e); if (i < 0) return; e.preventDefault(); sel = i; SFX.tick(); if (i === 6) drag = { x: e.clientX, y: e.clientY }; try { cv2.setPointerCapture(e.pointerId); } catch (_) { } paint(); };
      cv2.onpointermove = e => { if (!drag) return; const dd = Math.hypot(e.clientX - drag.x, e.clientY - drag.y); drag = { x: e.clientX, y: e.clientY }; if ((LK.dish || []).length > 1) { stir = Math.min(1.2, stir + dd / 260); if (Math.random() < .25) try { nz({ f: 900, q: 1, d: .05, g: .06 }); } catch (_) { } paint(); } };
      cv2.onpointerup = cv2.onpointercancel = () => { drag = null; };
      d.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { if (sel < 6) { LK.wells[sel] = b.dataset.t; saveLK(); SFX.tick(); paint(); } else toast('Pick one of the small wells to fill it.'); });
      d.querySelector('#ldDab').onclick = () => { const c = sel < 6 ? LK.wells[sel] : null; if (!c) { toast('Pick a well first, then dab it in the dish.'); return; } LK.dish = (LK.dish || []).concat([{ c, n: 1 }]).slice(-6); stir = 0; saveLK(); try { SFX2.squish(); } catch (_) { } sel = 6; paint(); };
      d.querySelector('#ldClr').onclick = () => { LK.dish = []; stir = 0; saveLK(); SFX.tick(); paint(); };
      d.querySelector('#ldUse').onclick = () => {
        const c = pick(); if (!c) { toast('The dish is empty. Dab some paint in it first.'); return; }
        if (sel === 6 && (LK.dish || []).length > 1 && stir < .7) { toast('Give it a stir first: drag round in the dish.'); return; }
        AB.col = c; if (sel === 6 && !MCOLS.includes(c) && !(LK.mine || []).includes(c)) { LK.mine = (LK.mine || []).concat([c]).slice(-6); saveLK(); toast('New colour! It is in your crayons, pencils, yarn and clay too.'); }
        const m = ['water', 'poster', 'oil'].includes(AB.med) ? AB.med : 'poster'; closeDlg(); setMed(m);
      };
      if (knife) sel = 6; paint();
    });
  }

  /* ---------------- settings: Looks ---------------- */
  const setBtn = $('#bSet'), _set = setBtn.onclick;
  setBtn.onclick = function () {
    _set.apply(this, arguments); const box = $('#dlgIn'); if (!box) return;
    const sec = document.createElement('div'); sec.id = 'ldSet';
    const seg = (k, opts) => '<div class="seg3">' + opts.map(([v, t]) => '<button data-k="' + k + '" data-v="' + v + '" class="' + (String(LK[k]) === String(v) ? 'on' : '') + '">' + t + '</button>').join('') + '</div>';
    sec.innerHTML = '<h3>✨ Looks (test)</h3><label>Desk</label>' + seg('desk', [['real', '🖍️ Real desk'], ['quick', '🧰 Quick tools']]) + '<label>Desk art (Blender style kits)</label>' + seg('art', [['real', 'Real'], ['toon', 'Toon'], ['pixel', 'Pixel']]) + '<label>Menus and buttons</label>' + seg('ui', [[1, '👾 Pixel UI'], [0, 'Classic']]) + '<label>Paint colours blend</label>' + seg('blend', [[1, 'On'], [0, 'Off']]) + '<label>Craft effects</label>' + seg('fx', [[1, 'On'], [0, 'Off']]);
    const btns = box.querySelector('.btns'); btns ? btns.before(sec) : box.append(sec);
    sec.querySelectorAll('[data-k]').forEach(b => b.onclick = async () => {
      const k = b.dataset.k, v = b.dataset.v; LK[k] = (k === 'ui' || k === 'blend' || k === 'fx') ? +v : v; saveLK(); SFX.tick();
      sec.querySelectorAll('[data-k="' + k + '"]').forEach(q => q.classList.toggle('on', q === b));
      if (k === 'art') { await loadStyle(v); TINTC.clear(); }
      document.body.classList.toggle('pxui', !!LK.ui); if (SCR === 'craft') { renderChips(); fitDesk(false); }
    });
  };
  document.body.classList.toggle('pxui', !!LK.ui);
  // the tray is taller than the old chips row: refit the desk when it changes
  new ResizeObserver(() => { if (SCR === 'craft') { C.ctr = deskCtr(); } }).observe($('#craftUI'));
  window.LOOKS_API = { mixHex, loadStyle, paletteDlg, rinse, FX, BL, tinted };
})();
