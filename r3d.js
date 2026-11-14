/* Shoebox Studio v1.6c + T029: Retro 3D. By MajorasPride. Loaded only when you open 3D (index.html: open3D, m3dDlg).
   Little Town, the studio and the house are low-poly shoebox dioramas built from the same save data as 2D
   (TOWN, LOB, HOUSE, the Toy Box). Crafted pieces stand up as cardboard cutouts, or as papercraft / puffy clay
   when you used Make it 3D (toy.m3d). First-person walk: thumb joystick + drag to look (WASD + mouse on a PC).
   T029: only moving things (cars) turn to face you; everything else keeps the facing set in Build mode (it.rot, see faceStep in index.html).
   Stationary cutouts have a cardboard edge so they never vanish side-on (thickCut). Signs are small cardboard plaques on the front of
   their object, sized to it (signBox). Walls and solid things stop the camera (three-mesh-bvh, lib/three-mesh-bvh.module.min.js, MIT).
   T033: Make it 3D menu: Standee (default), Puff ('clay'), Fold ('paper'), Two sides ('two', backCanvas); a Mythic Forge model comes later.
   Uses three.js r160 (MIT, lib/three.module.min.js). All art is made in code or taken from the game's own drawings.
   T025: Physics and Water (physics.js): loose pieces fall, roll, stack and bounce by what they are made of; pick up, put down, throw;
   puddle, pond, fountain and the watering can; Keep where it landed. Settings > 3D physics turns the engine off.
   This file reads the game's globals (TOWN, TW, toyById, drawToy, sprite, STATION_DRAW, nightK, ...) directly. */
import * as THREE from './lib/three.module.min.js';
import { MeshBVH } from './lib/three-mesh-bvh.module.min.js';
import * as PHY from './physics.js'; /* T025: physics and water. Small; the Rapier engine itself loads from there only when 3D physics is on */

const EYE = 64, SPEED = 175, RAD = 15, CR = 22 /* the camera stays this far off walls and solid things */, THICK = 8 /* cardboard edge */;
let R = null; /* the running 3D view */

/* ---------- small helpers ---------- */
const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
function texOf(c, opt = {}) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = opt.near ? THREE.NearestFilter : THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 2; if (opt.rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(opt.rep[0], opt.rep[1]); } return t; }
function whenReady(toy) { return new Promise(res => { const s = sprite(toy); const tick = n => { if (s.ready || n > 60) res(s.ready); else setTimeout(() => tick(n + 1), 60); }; tick(0); }); }
/* the toy as one picture (max 512 px), drawn with the game's own drawToy */
const TOYC = new Map();
async function toyCanvas(toy) {
  if (TOYC.has(toy.id)) return TOYC.get(toy.id);
  await whenReady(toy); const k = Math.min(1.5, 512 / Math.max(toy.w, toy.h)), c = cvs(toy.w * k + 4, toy.h * k + 4), x = c.getContext('2d');
  x.translate(2, 2); x.scale(k, k); drawToy(x, toy, 0, 0); TOYC.set(toy.id, c); return c;
}
/* T033: the back of a Two sides piece, drawn the size of the front picture c and flipped left to right, so from behind it reads the right way
   round and its shape lines up with the front. Source: the Flip-paper back (toy.sheet.back, stored as seen when turned over), else a Toy Box
   piece picked in the menu (toy.m3dBack, fitted into the front's shape), else plain cardboard in the front's shape. */
const loadImg = src => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
async function backCanvas(toy, c) {
  const key = 'back:' + toy.id + ':' + (toy.m3dBack || ''); if (TOYC.has(key)) return TOYC.get(key);
  const b = cvs(c.width, c.height), x = b.getContext('2d'); let src = null;
  if (toy.sheet && toy.sheet.back) src = await loadImg(toy.sheet.back);
  else if (toy.m3dBack && typeof toyById === 'function' && toyById(toy.m3dBack)) src = await toyCanvas(toyById(toy.m3dBack));
  x.save(); x.translate(b.width, 0); x.scale(-1, 1);
  if (src) { const pw = b.width - 4, ph = b.height - 4; if (toy.sheet) x.drawImage(src, 2, 2, pw, ph); else { const k = Math.max(pw / src.width, ph / src.height); x.drawImage(src, 2 + (pw - src.width * k) / 2, 2 + (ph - src.height * k) / 2, src.width * k, src.height * k); } }
  else { x.fillStyle = '#d9c29a'; x.fillRect(0, 0, b.width, b.height); }
  x.restore();
  /* keep only the front's shape: after the flip the back lines up with the front's outline */
  x.globalCompositeOperation = 'destination-in'; x.drawImage(c, 0, 0); x.globalCompositeOperation = 'source-over';
  TOYC.set(key, b); return b;
}
function silhouette(c, col) { const s = cvs(c.width, c.height), x = s.getContext('2d'); x.drawImage(c, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, s.width, s.height); return s; }
function glowTex() { const c = cvs(64, 64), x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,240,190,1)'); g.addColorStop(.35, 'rgba(255,220,140,.55)'); g.addColorStop(1, 'rgba(255,200,120,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return texOf(c); }
function blobTex() { const c = cvs(64, 64), x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(0,0,0,.42)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return texOf(c); }
function sparkTex() { const c = cvs(32, 32), x = c.getContext('2d'); x.fillStyle = '#fff'; x.beginPath(); x.moveTo(16, 0); x.quadraticCurveTo(16, 16, 32, 16); x.quadraticCurveTo(16, 16, 16, 32); x.quadraticCurveTo(16, 16, 0, 16); x.quadraticCurveTo(16, 16, 16, 0); x.fill(); return texOf(c); }
let GLOW, BLOB, SPARK;
const lam = (o) => new THREE.MeshLambertMaterial(o);
/* T029: a name plaque made of cardboard (a thin box): the name on the front, plain cardboard everywhere else, sized to its object */
function labelCanvas(text, sub) {
  const S = 2, m = cvs(8, 8).getContext('2d'); m.font = '900 34px system-ui,sans-serif'; let tw = m.measureText(text).width; if (sub) { m.font = '700 22px system-ui,sans-serif'; tw = Math.max(tw, m.measureText(sub).width); }
  const pw = Math.min(300, tw + 34), ph = sub ? 92 : 60, c = cvs(pw * S, ph * S), x = c.getContext('2d'); x.scale(S, S);
  x.fillStyle = '#fbf6ea'; x.fillRect(0, 0, pw, ph); x.strokeStyle = 'rgba(90,60,30,.35)'; x.lineWidth = 3; x.strokeRect(1.5, 1.5, pw - 3, ph - 3);
  x.fillStyle = '#3b2f2a'; x.textAlign = 'center'; x.font = '900 34px system-ui,sans-serif'; x.fillText(text, pw / 2, 42, pw - 20); if (sub) { x.font = '700 22px system-ui,sans-serif'; x.globalAlpha = .7; x.fillText(sub, pw / 2, 76, pw - 20); }
  return c;
}
function signBox(text, sub, width) {
  const c = labelCanvas(text, sub), sw = width, sh = sw * c.height / c.width, card = lam({ color: 0xb98d58 }), front = lam({ map: texOf(c) });
  const m = new THREE.Mesh(new THREE.BoxGeometry(sw, sh, 3), [card, card, card, card, front, card]); m.userData.sign = { w: sw, h: sh }; return m;
}
/* T029: a cutout with a cardboard edge. The drawing's shape is traced on a small grid and the edge is built along it (chunky, retro),
   the drawing is on the front and, a little darker, on the back, so a cutout seen from the side never disappears and from behind is still a tree, not a blank card. */
function maskOf(c, n) {
  const k = n / Math.max(c.width, c.height), nx = Math.max(2, Math.round(c.width * k)), ny = Math.max(2, Math.round(c.height * k)), s = cvs(nx, ny), x = s.getContext('2d');
  x.drawImage(c, 0, 0, nx, ny); const a = x.getImageData(0, 0, nx, ny).data, m = new Uint8Array(nx * ny); for (let i = 0; i < m.length; i++) m[i] = a[i * 4 + 3] > 115 ? 1 : 0; return { nx, ny, m };
}
function edgeGeom(c, w, h, d, ox = 0, oy = 0) {
  const { nx, ny, m } = maskOf(c, 72), cw = w / nx, ch = h / ny, P = [], N = [], z0 = -d / 2, z1 = d / 2;
  const at = (i, j) => i >= 0 && j >= 0 && i < nx && j < ny ? m[j * nx + i] : 0, X = i => ox - w / 2 + i * cw, Y = j => oy + h - j * ch;
  const quad = (a, b, cc, dd, n) => { P.push(...a, ...b, ...cc, ...a, ...cc, ...dd); for (let t = 0; t < 6; t++) N.push(...n); };
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    if (!at(i, j)) continue; const xa = X(i), xb = X(i + 1), ya = Y(j), yb = Y(j + 1);
    if (!at(i - 1, j)) quad([xa, ya, z0], [xa, yb, z0], [xa, yb, z1], [xa, ya, z1], [-1, 0, 0]);
    if (!at(i + 1, j)) quad([xb, ya, z1], [xb, yb, z1], [xb, yb, z0], [xb, ya, z0], [1, 0, 0]);
    if (!at(i, j - 1)) quad([xa, ya, z1], [xb, ya, z1], [xb, ya, z0], [xa, ya, z0], [0, 1, 0]);
    if (!at(i, j + 1)) quad([xa, yb, z0], [xb, yb, z0], [xb, yb, z1], [xa, yb, z1], [0, -1, 0]);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); return g;
}
function thickCut(c, frontMat, w, h, d, edgeCol, ox = 0, oy = 0) {
  const grp = new THREE.Group(), plane = () => new THREE.PlaneGeometry(w, h).translate(ox, oy + h / 2, 0);
  const front = new THREE.Mesh(plane().translate(0, 0, d / 2 + .05), frontMat);
  const back = new THREE.Mesh(plane().translate(0, 0, -d / 2 - .05), lam({ map: frontMat.map || texOf(c), color: 0xd2bd9a, alphaTest: .5, side: THREE.DoubleSide }) /* the back shows the drawing a little darker, like it is printed through the card */);
  const edge = new THREE.Mesh(edgeGeom(c, w, h, d, ox, oy), lam({ color: edgeCol, side: THREE.DoubleSide }));
  grp.add(front, back, edge); grp.userData.edgeMats = [back.material, edge.material]; return grp;
}

/* ---------- 3D pieces: cutout, papercraft, puffy clay ---------- */
async function pieceMesh(toy, style, opt = {}) {
  const c = await toyCanvas(toy), w = toy.w, h = toy.h, tex = texOf(c), grp = new THREE.Group();
  style = style || toy.m3d || 'flat'; const glow = toy.med && toy.med.glow;
  const mat = (o = {}) => lam(Object.assign({ map: tex, alphaTest: .5, side: THREE.DoubleSide, emissive: glow ? new THREE.Color(glow) : new THREE.Color(0), emissiveMap: glow ? tex : null, emissiveIntensity: 0 }, o));
  const mats = [];
  if (style === 'clay') {
    const front = puffyGeom(c, w, h, 1), back = puffyGeom(c, w, h, -1);
    /* T033: the picture is grown a few pixels past its edge, so the seam where the two halves meet shows no pinholes */
    const dc = cvs(c.width, c.height), dx = dc.getContext('2d'), gr = Math.max(2, Math.round(c.width / 48)); for (let a = 0; a < 8; a++) dx.drawImage(c, Math.round(Math.cos(a * Math.PI / 4) * gr), Math.round(Math.sin(a * Math.PI / 4) * gr)); dx.drawImage(c, 0, 0);
    const ptex = texOf(dc);
    const m = new THREE.MeshStandardMaterial({ map: ptex, alphaTest: .5, roughness: .88, metalness: 0, emissive: glow ? new THREE.Color(glow) : new THREE.Color(0), emissiveMap: glow ? ptex : null, emissiveIntensity: 0 }); mats.push(m);
    grp.add(new THREE.Mesh(front, m), new THREE.Mesh(back, m));
  } else if (style === 'paper') {
    const d = Math.max(6, Math.min(26, Math.min(w, h) * .12)), N = 7, plane = new THREE.PlaneGeometry(w, h).translate(0, h / 2, 0), edge = texOf(silhouette(c, '#f4ecdc'));
    const layers = []; for (let i = 0; i < N; i++) { const outer = i === 0 || i === N - 1, m = outer ? mat() : lam({ map: edge, alphaTest: .5, side: THREE.DoubleSide, color: i % 2 ? 0xe9dfca : 0xf7f0e2 }); mats.push(m); const me = new THREE.Mesh(plane, m); me.userData.k = (i / (N - 1) - .5) * d; layers.push(me); grp.add(me); }
    /* the fold-out stand tab behind */
    const tab = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(w * .3, 60), h * .55).translate(0, h * .275, 0), lam({ color: 0xe9dfca, side: THREE.DoubleSide })); tab.position.z = -d / 2; tab.rotation.x = -.5; grp.add(tab);
    grp.userData.fold = { layers, t: opt.instant ? 1 : 0, tab };
    foldStep(grp, opt.instant ? 1 : 0);
  } else if (style === 'two') {
    /* T033 Two sides: the drawing in front, the back of the paper (toy.sheet.back, or a Toy Box piece toy.m3dBack) behind, on a cardboard edge */
    const m = mat(); mats.push(m); const d = Math.max(3, Math.min(THICK, Math.min(w, h) * .12)), bc = await backCanvas(toy, c), cut = thickCut(c, m, w, h, d, 0xe6d8bc);
    const bm = cut.userData.edgeMats[0]; bm.map = texOf(bc); bm.color.set(0xffffff); bm.alphaTest = .5; bm.needsUpdate = true; mats.push(bm); grp.add(cut);
    if (!opt.noFoot) { const foot = new THREE.Mesh(new THREE.BoxGeometry(Math.min(w * .5, 70), 5, 18), lam({ color: 0xb48a58 })); foot.position.set(0, 2.5, -9 - d / 2); grp.add(foot); }
  } else {
    const m = mat(); mats.push(m); const d = opt.thick ? Math.max(3, Math.min(THICK, Math.min(w, h) * .12)) : 0;
    if (d) grp.add(thickCut(c, m, w, h, d, 0xe6d8bc)); else grp.add(new THREE.Mesh(new THREE.PlaneGeometry(w, h).translate(0, h / 2, 0), m));
    if (!opt.noFoot) { const foot = new THREE.Mesh(new THREE.BoxGeometry(Math.min(w * .5, 70), 5, 18), lam({ color: 0xb48a58 })); foot.position.set(0, 2.5, -9 - d / 2); grp.add(foot); }
  }
  grp.userData.mats = mats; grp.userData.glow = glow; grp.userData.toy = toy; grp.userData.style = style;
  if (toy.med && toy.med.gl) grp.add(sparkles(w, h, style === 'flat' ? 0 : 1));
  return grp;
}
/* T025: the ball pieces (clay lump, yarn ball, play ball) are real low-poly balls, so they roll */
async function ballMesh(toy) {
  const c = await toyCanvas(toy), r = Math.min(toy.w, toy.h) / 2, grp = new THREE.Group(), m = lam({ map: texOf(c, { near: 1 }), flatShading: true });
  /* wrap the middle of the drawing round the ball */
  m.map.repeat.set(.5, .5); m.map.offset.set(.25, .25);
  grp.add(new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9).translate(0, r, 0), m)); grp.userData.mats = [m]; grp.userData.toy = toy; grp.userData.style = 'ball'; return grp;
}
function foldStep(grp, t) { const f = grp.userData.fold; if (!f) return; f.t = t; const e = 1 - Math.pow(1 - Math.min(1, t), 3); f.layers.forEach(m => { m.position.z = m.userData.k * e; }); f.tab.rotation.x = -.5 * e; f.tab.visible = e > .05; }
/* a puffy pillow over the drawing's shape: height grows with the distance from the edge */
function puffyGeom(c, w, h, side) {
  const N = 64, nx = w >= h ? N : Math.max(8, Math.round(N * w / h)), ny = w >= h ? Math.max(8, Math.round(N * h / w)) : N;
  const s = cvs(nx + 1, ny + 1), x = s.getContext('2d'); x.drawImage(c, 0, 0, nx + 1, ny + 1); const a = x.getImageData(0, 0, nx + 1, ny + 1).data;
  const inside = new Float32Array((nx + 1) * (ny + 1)); for (let i = 0; i < inside.length; i++) inside[i] = a[i * 4 + 3] > 100 ? 1e6 : 0;
  /* two-pass distance transform */
  const W1 = nx + 1, at = (i, j) => inside[j * W1 + i];
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) { const k = j * W1 + i; if (!inside[k]) continue; let v = inside[k]; if (i > 0) v = Math.min(v, at(i - 1, j) + 1); else v = 1; if (j > 0) v = Math.min(v, at(i, j - 1) + 1); else v = Math.min(v, 1); if (i > 0 && j > 0) v = Math.min(v, at(i - 1, j - 1) + 1.414); inside[k] = v; }
  for (let j = ny; j >= 0; j--) for (let i = nx; i >= 0; i--) { const k = j * W1 + i; if (!inside[k]) continue; let v = inside[k]; if (i < nx) v = Math.min(v, at(i + 1, j) + 1); else v = 1; if (j < ny) v = Math.min(v, at(i, j + 1) + 1); else v = Math.min(v, 1); if (i < nx && j < ny) v = Math.min(v, at(i + 1, j + 1) + 1.414); inside[k] = v; }
  let dm = 1; for (const v of inside) if (v < 1e5 && v > dm) dm = v;
  /* T033 Puff, after Monster Mash's inflate idea (our own code): a round cross-section from the distance to the edge, then a few smoothing
     passes so the ridge along the middle of long shapes becomes a soft pillow instead of a crease. Thin parts stay thin, wide parts get fat. */
  const H = Math.min(w, h) * .3, g = new THREE.PlaneGeometry(w, h, nx, ny).translate(0, h / 2, 0), p = g.attributes.position, Z = new Float32Array(inside.length);
  /* the rim (inside points next to the outside) sits at zero, so the front and back halves meet with no gap */
  const rim = new Uint8Array(Z.length); for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) { const k = j * W1 + i; if (!inside[k]) continue; if (i === 0 || j === 0 || i === nx || j === ny || !inside[k - 1] || !inside[k + 1] || !inside[k - W1] || !inside[k + W1]) rim[k] = 1; }
  for (let k = 0; k < Z.length; k++) { const d = inside[k]; const t = d > 0 && d < 1e5 && !rim[k] ? Math.min(1, (d - .7) / Math.max(1, dm - .7)) : 0; Z[k] = H * Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t))); }
  const Zb = new Float32Array(Z.length);
  for (let pass = 0; pass < 6; pass++) { for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) { const k = j * W1 + i; if (!Z[k]) { Zb[k] = 0; continue; } const n = (i > 0 ? Z[k - 1] : 0) + (i < nx ? Z[k + 1] : 0) + (j > 0 ? Z[k - W1] : 0) + (j < ny ? Z[k + W1] : 0); Zb[k] = rim[k] ? 0 : Math.max(Z[k] * .5 + n * .125, Z[k] * .8); } Z.set(Zb); }
  for (let k = 0; k < Z.length; k++) p.setZ(k, Z[k] * side);
  if (side < 0) { const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i]; ix[i] = ix[i + 1]; ix[i + 1] = t; } }
  g.computeVertexNormals(); return g;
}
function sparkles(w, h, depth) { const n = 8, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - .5) * w * .8; pos[i * 3 + 1] = h * (.15 + Math.random() * .75); pos[i * 3 + 2] = (depth ? Math.min(w, h) * .2 : 1) * (Math.random() < .5 ? 1 : -1); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const m = new THREE.PointsMaterial({ map: SPARK, size: 14, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }); const pt = new THREE.Points(g, m); pt.userData.spark = 1; return pt; }

/* ---------- buildings: the 2D facade on a cardboard box (how real shoebox dioramas are made) ---------- */
function facade(draw, wd, ht, base) { const k = 2, c = cvs(wd * k, ht * k), x = c.getContext('2d'); x.scale(k, k); draw(x, { x: wd / 2, y: base }, false); return c; }
function building(kind) {
  const p = TOWN[kind], b = BLD[kind], wd = b.hw * 2 + 40, ht = b.top + 30, base = b.top + 6, grp = new THREE.Group();
  const c = facade(BLDDRAW(kind), wd, ht, base);
  /* scrub the painted ground shadow: the 3D blob shadow takes its place */
  const x = c.getContext('2d'); x.clearRect(0, (base + 1) * 2, c.width, c.height);
  const front = new THREE.Mesh(new THREE.PlaneGeometry(wd, ht).translate(0, ht / 2 - (ht - base), 0), lam({ map: texOf(c), alphaTest: .5, side: THREE.DoubleSide, emissive: 0xffd27a, emissiveMap: texOf(c), emissiveIntensity: 0 }));
  front.position.z = 2; grp.add(front);
  const shop = !!b.shop, bw = b.hw * 1.7, bh = b.top * (kind === 'house' ? .55 : shop ? .66 : .8), dp = kind === 'house' ? 120 : shop ? 130 : 150;
  const body = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, dp), lam({ color: kind === 'house' ? 0xe8cfa0 : shop ? 0xe0bb80 : 0xc49a62 })); body.position.set(0, bh / 2, -dp / 2); grp.add(body);
  if (kind === 'house') { const rh = b.top * .34, sh = new THREE.Shape(); sh.moveTo(-bw / 2 - 10, 0); sh.lineTo(bw / 2 + 10, 0); sh.lineTo(0, rh); sh.closePath(); const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: dp + 8, bevelEnabled: false }), lam({ color: 0xc8463a, flatShading: true })); roof.position.set(0, bh, -dp - 4); grp.add(roof); }
  else if (shop) { /* T032: a shop is a flat-roofed cardboard box; the striped awning sticks out over the door */
    const roof = new THREE.Mesh(new THREE.BoxGeometry(bw + 8, 6, dp + 8), lam({ color: 0xb08850 })); roof.position.set(0, bh + 3, -dp / 2); grp.add(roof);
    const ac = cvs(64, 8), ax = ac.getContext('2d'); for (let i = 0; i < 8; i++) { ax.fillStyle = i % 2 ? '#fbf6ea' : '#e8443a'; ax.fillRect(i * 8, 0, 8, 8); }
    const aw = new THREE.Mesh(new THREE.BoxGeometry(bw + 14, 3, 34), lam({ map: texOf(ac) })); aw.position.set(0, b.top * .58, 16); aw.rotation.x = .32; grp.add(aw); }
  else { const lid = new THREE.Mesh(new THREE.BoxGeometry(bw + 20, 6, 60), lam({ color: 0xd8b07a })); lid.position.set(0, bh + 4, 6); lid.rotation.x = -.25; grp.add(lid); }
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(bw * 1.4, dp * 1.5), new THREE.MeshBasicMaterial({ map: BLOB, transparent: true, depthWrite: false })); blob.rotation.x = -Math.PI / 2; blob.position.set(0, .6, -dp / 2 + 10); grp.add(blob);
  /* T029: the name sign stands on top of the front, sized to the building (was a big floating label) */
  const tag = signBox(kind === 'house' ? 'My House' : kind === 'studio' ? 'The Studio' : SHOPS[b.shop].name, 'walk to the door', Math.max(80, Math.min(150, bw * .6))); tag.position.set(0, base + 2 + tag.userData.sign.h / 2, 3); grp.add(tag);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); glow.scale.set(bw * 1.3, bh * 1.3, 1); glow.position.set(0, bh * .55, 14); grp.add(glow);
  grp.position.set(p.x, 0, p.y); grp.userData = { kind, glow, front, door: { x: p.x + b.door.x, z: p.y + b.door.y }, box: { x0: p.x - bw / 2, x1: p.x + bw / 2, z0: p.y - dp, z1: p.y + 4 }, solid: { x: p.x, z: p.y - dp / 2 + 3, w: Math.max(bw, b.hw * 1.9), d: dp + 6, h: 240 } };
  return grp;
}

/* ---------- scenes ---------- */
function skyCols() { const k = nightK(); const day = new THREE.Color(0xa9d9f2), night = new THREE.Color(0x1d2652), dusk = new THREE.Color(0xf2a774); const c = day.clone().lerp(night, k); if (k > .05 && k < .95) c.lerp(dusk, .35 * Math.sin(k * Math.PI)); return { c, k }; }
function baseScene() {
  const sc = new THREE.Scene(); const hemi = new THREE.HemisphereLight(0xffffff, 0x8a6a48, 1.4), sun = new THREE.DirectionalLight(0xfff2dc, 1.6); sun.position.set(-400, 900, 600); sc.add(hemi, sun); sc.userData.L = { hemi, sun };
  sc.fog = new THREE.Fog(0xa9d9f2, 700, 2600); return sc;
}
function woodPlane(size) { const t = texOf(WOOD, { rep: [size / 256, size / 256] }); const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), lam({ map: t })); m.rotation.x = -Math.PI / 2; return m; }
async function buildTown() {
  const sc = baseScene(), col = [], solids = [], waters = [];
  const wood = woodPlane(6000); wood.position.set(TW.W / 2, -3, TW.H / 2); sc.add(wood);
  /* the town paper: same kraft, grid, tape corners and title as 2D */
  const k = .64, c = cvs(TW.W * k, TW.H * k), x = c.getContext('2d'); x.scale(k, k); x.fillStyle = x.createPattern(KRAFT, 'repeat'); x.fillRect(0, 0, TW.W, TW.H); x.strokeStyle = 'rgba(90,60,30,.13)'; x.lineWidth = 2; x.beginPath(); for (let i = 100; i < TW.W; i += 100) { x.moveTo(i, 0); x.lineTo(i, TW.H); } for (let j = 100; j < TW.H; j += 100) { x.moveTo(0, j); x.lineTo(TW.W, j); } x.stroke();
  x.fillStyle = 'rgba(250,240,190,.75)'; [[0, 0], [TW.W, 0], [0, TW.H], [TW.W, TW.H]].forEach((p, i) => { x.save(); x.translate(p[0], p[1]); x.rotate(Math.PI / 4 + i * Math.PI / 2); x.fillRect(-45, -13, 90, 26); x.restore(); });
  x.fillStyle = 'rgba(90,60,30,.45)'; x.font = '900 40px system-ui'; x.textAlign = 'center'; x.fillText('Little Town', TW.W / 2, 70);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(TW.W, TW.H), lam({ map: texOf(c) })); floor.rotation.x = -Math.PI / 2; floor.position.set(TW.W / 2, 0, TW.H / 2); sc.add(floor);
  /* shoebox walls around the town, open at the top */
  const wallM = lam({ color: 0xc9a46a }), lipM = lam({ color: 0xb08850 }), WH = 150;
  [[TW.W / 2, -6, TW.W + 24, 12], [TW.W / 2, TW.H + 6, TW.W + 24, 12], [-6, TW.H / 2, 12, TW.H], [TW.W + 6, TW.H / 2, 12, TW.H]].forEach(([cx, cz, w, d]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, WH, d), wallM); m.position.set(cx, WH / 2 - 4, cz); sc.add(m); solids.push({ x: cx, z: cz, w, d, h: WH }); const lip = new THREE.Mesh(new THREE.BoxGeometry(w + 4, 6, d + 4), lipM); lip.position.set(cx, WH - 2, cz); sc.add(lip); });
  /* buildings */
  const blds = Object.keys(BLD).filter(k => TOWN[k]).map(building); blds.forEach(b => { sc.add(b); solids.push(b.userData.solid); });
  /* pieces */
  const items = [];
  for (const it of TOWN.items) {
    const toy = toyById(it.toy); if (!toy) continue; const s = it.s || 1;
    if (toy.road) { const c2 = await toyCanvas(toy), m = new THREE.Mesh(new THREE.PlaneGeometry(toy.w * s, toy.h * s), lam({ map: texOf(c2), alphaTest: .4, polygonOffset: true, polygonOffsetFactor: -1 })); m.rotation.x = -Math.PI / 2; m.position.set(it.x, .4 + items.length * .002, it.y - toy.h * s / 2); sc.add(m); continue; }
    /* T025: water pieces lie on the ground as rippling water; ball pieces are balls */
    const pinfo = PHY.pieceInfo(toy); if (pinfo.water) { waters.push({ it, toy, kind: pinfo.water }); continue; }
    /* T029: only things that move turn to face you (cars, the Drives behavior); everything else keeps its facing (faceStep: Build mode's Turn button, or toward the nearest road) */
    const moving = it.act === 'vehicle', yaw = moving ? 0 : faceStep(it) * Math.PI / 4;
    const g = pinfo.ball ? await ballMesh(toy) : await pieceMesh(toy, null, { instant: 1, thick: !moving }); g.scale.set(s * (it.flip < 0 ? -1 : 1), s, s); g.position.set(it.x, 0, it.y); g.rotation.y = yaw;
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(toy.w * s * .9, Math.min(60, toy.w * s * .3)), new THREE.MeshBasicMaterial({ map: BLOB, transparent: true, depthWrite: false })); blob.rotation.x = -Math.PI / 2; blob.position.set(it.x, .7, it.y);
    sc.add(g, blob); const rec = { it, g, blob, toy, moving, yaw };
    if (it.act === 'light') { const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); gl.scale.set(150 * s, 150 * s, 1); gl.position.set(it.x, toy.h * s * .85, it.y + 4); sc.add(gl); rec.light = gl; }
    if (it.act === 'door') rec.door = 1;
    items.push(rec);
    if (it.act === 'door') { if (toy.w * s > 26) col.push({ x0: it.x - toy.w * s * .42, x1: it.x + toy.w * s * .42, z0: it.y - 12, z1: it.y + 10, it }); } /* doors open and close, so they keep the simple box check */
    else if (!moving && !pinfo.ball && (it.tb || 'block') !== 'pass' && toy.w * s > 26 && toy.h * s > 26) solids.push({ x: it.x, z: it.y - 2, w: toy.w * s * .84, d: 20, h: toy.h * s, yaw, it });
  }
  return { sc, col, items, blds, solids, waters, kind: 'town', bvh: solidBVH(solids), bounds: { x0: 18, x1: TW.W - 18, z0: 18, z1: TW.H - 18 } };
}
/* the studio or the house: the room's 2D background becomes the floor and back wall; stations stand up as cutouts */
async function buildRoom(R) {
  const sc = baseScene(), col = [], solids = [], WALLZ = 222, WH = 250;
  /* paint the room's own background once, on the paused main canvas, then copy it */
  const k = Math.min(cv.width / R.W, cv.height / (R.H + 40), 1.4), bgc = cvs(R.W * k, R.H * k);
  g.save(); g.setTransform(k, 0, 0, k, 0, 0); g.clearRect(0, 0, R.W, R.H); try { const RM0 = RM; RM = R; R.bg(); RM = RM0; } catch (e) { } g.restore(); bgc.getContext('2d').drawImage(cv, 0, 0, R.W * k, R.H * k, 0, 0, bgc.width, bgc.height);
  const crop = (y0, y1) => { const c = cvs(R.W * k, (y1 - y0) * k); c.getContext('2d').drawImage(bgc, 0, y0 * k, R.W * k, (y1 - y0) * k, 0, 0, c.width, c.height); return c; };
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(R.W, R.H - WALLZ), lam({ map: texOf(crop(WALLZ, R.H)) })); floor.rotation.x = -Math.PI / 2; floor.position.set(R.W / 2, 0, (R.H + WALLZ) / 2); sc.add(floor);
  const wtop = Math.max(0, WALLZ - 230), wall = new THREE.Mesh(new THREE.PlaneGeometry(R.W, WH), lam({ map: texOf(crop(wtop, WALLZ)) })); wall.position.set(R.W / 2, WH / 2, WALLZ); sc.add(wall);
  const side = lam({ color: 0xc9a46a }); [[-6, 12], [R.W + 6, 12]].forEach(([x0]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(12, WH, R.H - WALLZ + 12), side); m.position.set(x0, WH / 2, (R.H + WALLZ) / 2); sc.add(m); solids.push({ x: x0, z: (R.H + WALLZ) / 2, w: 12, d: R.H - WALLZ + 12, h: WH }); });
  const front = new THREE.Mesh(new THREE.BoxGeometry(R.W + 24, 40, 12), side); front.position.set(R.W / 2, 20, R.H + 6); sc.add(front);
  solids.push({ x: R.W / 2, z: WALLZ - 6, w: R.W + 24, d: 12, h: WH }, { x: R.W / 2, z: R.H + 6, w: R.W + 24, d: 12, h: WH });
  const wood = woodPlane(4000); wood.position.set(R.W / 2, -3, R.H / 2); sc.add(wood);
  const stns = [];
  for (const s of R.stn) {
    const fn = STATION_DRAW[s.id]; if (!fn) continue; const S = 2, c = cvs(300 * S, 300 * S), x = c.getContext('2d'); x.scale(S, S); x.translate(150, 262); if (s.soon) x.globalAlpha = .82; try { fn(x, 0); } catch (e) { }
    /* trim to what was drawn */
    const d = x.getImageData(0, 0, c.width, c.height).data; let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0; for (let j = 0; j < c.height; j += 2) for (let i = 0; i < c.width; i += 2) if (d[(j * c.width + i) * 4 + 3] > 20) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (j < y0) y0 = j; if (j > y1) y1 = j; }
    if (x1 <= x0) continue; const tc = cvs(x1 - x0 + 2, y1 - y0 + 2); tc.getContext('2d').drawImage(c, -x0, -y0);
    const w = tc.width / S, h = tc.height / S, base = (262 * S - y0) / S, ox = (x0 / S - 150) + w / 2;
    /* T029: every station is a cardboard cutout with a real edge (wall ones are thinner), so none vanish side-on */
    const th = s.wall ? 4 : THICK, z = s.wall ? WALLZ + th / 2 + 1 : s.y;
    const m = thickCut(tc, lam({ map: texOf(tc), alphaTest: .45, side: THREE.DoubleSide }), w, h, th, 0xc49a62, ox, base - h); m.position.set(s.x, 0, z); sc.add(m);
    /* the name sign stands on the top edge of the station's front, sized to it, kept inside the room and under the ceiling line */
    /* size and place it by the solid part of the drawing (faint glows and shadows don't count) */
    const sd = tc.getContext('2d').getImageData(0, 0, tc.width, tc.height).data, rows = new Uint16Array(tc.height); let oy0 = tc.height, ox0 = tc.width, ox1 = 0; for (let j = 0; j < tc.height; j += 2) for (let i = 0; i < tc.width; i += 2) if (sd[(j * tc.width + i) * 4 + 3] > 115) { rows[j]++; if (i < ox0) ox0 = i; if (i > ox1) ox1 = i; }
    /* its top is the first row that is at least a third as wide as the drawing, so thin bits (a flagpole, a lamp cord) don't lift the sign */
    for (let j = 0; j < tc.height; j += 2) if (rows[j] * 2 >= (ox1 - ox0) / 3) { oy0 = j; break; }
    const top = oy0 < tc.height ? base - oy0 / S : base, ow = ox1 > ox0 ? (ox1 - ox0) / S : w, ocx = ox1 > ox0 ? s.x + ox - w / 2 + (ox0 + ox1) / 2 / S : s.x + ox;
    const tag = signBox(s.name, s.soon ? 'coming soon' : (s.sub || ''), Math.max(56, Math.min(112, ow * .75))), sw = tag.userData.sign.w, sh = tag.userData.sign.h;
    const tx = Math.max(sw / 2 + 4, Math.min(R.W - sw / 2 - 4, ocx)), ty = Math.min(WH - sh / 2 - 4, top + 2 + sh / 2);
    tag.position.set(tx, ty, z + th / 2 + 2); sc.add(tag); /* in front of its own drawing, so it is never inside a wall */
    const sp = standPt(s); stns.push({ s, at: { x: sp.x, z: sp.y } });
    if (!s.wall && w > 30) solids.push({ x: s.x + ox, z: z - 6, w: w * .84, d: th + 24, h });
  }
  return { sc, col, items: [], blds: [], stns, solids, waters: [], kind: R === HOUSE ? 'house' : R.shop ? 'shop' : 'home', R, bvh: solidBVH(solids), bounds: { x0: 22, x1: R.W - 22, z0: WALLZ + 26, z1: R.H - 20 } };
}

/* ---------- the view: overlay, controls, loop ---------- */
function ui() {
  /* a fresh overlay every time: a canvas whose WebGL context was released cannot start a new one */
  let o = document.getElementById('r3d'); if (o) o.remove();
  o = document.createElement('div'); o.id = 'r3d';
  o.innerHTML = '<canvas id="r3cv"></canvas><div id="r3top"><button id="r3back">◀ Back to 2D</button><b id="r3ttl"></b><button id="r3keep" aria-label="Keep the pieces where they landed">📌 Keep</button><button id="r3can" aria-label="Watering can">🚿</button><button id="r3clk" aria-label="Clock">☀️</button></div><button id="r3drop">⬇️ Put down</button><div id="r3stick"><i></i></div><button id="r3act"></button><div id="r3hint">Left thumb: walk · Drag: look around</div><div id="r3fade"></div>';
  /* T025: the new buttons carry their own style, so index.html's CSS stays as it was */
  const st = document.createElement('style'); st.textContent = '#r3keep{display:none}#r3keep.on{display:block;background:var(--yellow)}#r3can.on{background:#bfe9ff;box-shadow:0 2px 0 #0006,0 0 0 3px #4aa9dc inset}#r3top button{padding:0 11px}#r3drop{position:absolute;right:16px;bottom:calc(122px + env(safe-area-inset-bottom));display:none;padding:10px 14px;border-radius:22px;background:var(--paper);color:var(--ink);font-weight:900;font-size:14px;box-shadow:0 3px 0 #0006}#r3drop.on{display:block}'; o.append(st);
  document.body.append(o); return o;
}
function setTitle() { const t = { town: 'Little Town · 3D', home: 'Shoebox Studio · 3D', house: 'My House · 3D', shop: (SHOPS[SHOP_ID] || SHOPS.supply).name + ' · 3D' }[R.S.kind]; document.getElementById('r3ttl').textContent = t; }
export async function open(where) {
  if (R) return; GLOW = GLOW || glowTex(); BLOB = BLOB || blobTex(); SPARK = SPARK || sparkTex();
  const o = ui(), canvas = o.querySelector('#r3cv');
  let renderer; try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'low-power' }); } catch (e) { toast('3D needs WebGL, and this browser has it turned off.'); return false; }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  R = { renderer, cam: new THREE.PerspectiveCamera(72, 1, 2, 5000), yaw: 0, pitch: -.08, pos: { x: 0, z: 0 }, keys: {}, stick: { x: 0, y: 0, id: null }, look: null, t: 0, last: performance.now(), near: null, raf: 0, busy: false };
  o.classList.add('on'); o.querySelector('#r3fade').classList.add('on');
  const fit = () => { const w = innerWidth, h = innerHeight, k = Math.min(1, 640 / Math.max(w, h)); renderer.setPixelRatio(k); renderer.setSize(w, h, true); R.cam.aspect = w / h; /* keep about 80 degrees across, but no more than 96 up and down on a tall phone */ R.cam.fov = Math.max(62, Math.min(96, 2 * Math.atan(Math.tan(40 * Math.PI / 180) / R.cam.aspect) * 180 / Math.PI)); R.cam.updateProjectionMatrix(); };
  R.fit = fit; fit(); addEventListener('resize', fit);
  bindControls(o);
  await goScene(where);
  R.raf = requestAnimationFrame(loop);
  return true;
}
async function goScene(where, at) {
  R.busy = true; const f = document.getElementById('r3fade'); f.classList.add('on');
  if (R.P) { R.P.dispose(); R.P = null; } if (R.S) disposeScene(R.S.sc);
  R.S = where === 'town' ? await buildTown() : await buildRoom(where === 'house' ? HOUSE : where === 'shop' ? shopRoom() : LOB);
  if (where === 'town') { const h = at || TOWN.hero; R.pos = { x: h.x, z: h.y }; /* face the middle of town, so the first look is the town and not a wall */ R.yaw = at && at.yaw != null ? at.yaw : Math.atan2(-(TW.W / 2 - h.x), -(TW.H * .55 - h.y)); }
  else { const R0 = R.S.R; /* start in the open middle of the floor (or further back if that is where you stood), looking at the back wall */ const h = R0.hero || { x: R0.W / 2, y: 0 }, open = R.S.bounds.z0 + (R.S.bounds.z1 - R.S.bounds.z0) * .5; R.pos = { x: Math.max(R.S.bounds.x0 + 30, Math.min(R.S.bounds.x1 - 30, h.x)), z: Math.max(open, h.y) }; R.yaw = 0; }
  await startPhysics(R.S);
  R.pitch = -.08; setTitle(); LS.set('where', { s: where === 'town' ? 'town' : where, walk: 1, shop: where === 'shop' ? SHOP_ID : undefined });
  requestAnimationFrame(() => { f.classList.remove('on'); R.busy = false; });
}
/* ---------- T025: physics and water for the scene ---------- */
const physOn = () => typeof SET === 'undefined' || SET.phys !== false;
const PSFX = { /* made from the game's own sound helpers (nz = noise, tn = tone) */
  thud(key, v) { try { if (key === 'clay') { nz({ type: 'lowpass', f: 170, d: .2, g: .8 * v }); tn({ f: 90, f2: 55, d: .16, g: .3 * v }); } else if (key === 'paper' || key === 'card') nz({ f: 4200, q: .8, d: .05, g: .1 * v }); else if (key === 'yarn' || key === 'felt') nz({ type: 'lowpass', f: 420, d: .12, g: .28 * v }); else if (key === 'rubber') tn({ f: 260, f2: 150, d: .1, g: .3 * v }); else { nz({ type: 'lowpass', f: 1100, d: .1, g: .45 * v }); } } catch (e) { } },
  splash(p) { try { nz({ f: 1700, q: .6, d: .28, g: Math.min(.5, .12 * p) }); nz({ type: 'lowpass', f: 520, d: .2, g: Math.min(.4, .1 * p) }); } catch (e) { } },
  drip() { try { tn({ f: 1300 + Math.random() * 500, f2: 2300, d: .04, g: .035 }); } catch (e) { } }
};
async function startPhysics(S) {
  let eng = false; S.freed = new Set();
  if (physOn()) { try { await PHY.loadEngine(); eng = true; } catch (e) { console.warn(e); toast('3D physics could not load, so things stay still this time.'); } }
  const P = R.P = PHY.create(S, { physics: eng, onFree: freeRec, sfx: PSFX });
  for (const r of S.items) { const still = r.moving || r.door || r.light; if (!still) { const b = P.addPiece(r); if (b && !b.fixed) r.dyn = 1; } }
  if (eng) for (const s of S.solids) if (s.it && !S.items.some(r => r.it === s.it && r.body)) P.addFixed(s);
  for (const w of S.waters) P.addWater(w, w.kind);
  /* the watering can, shown bottom right while it is out */
  const can = new THREE.Group(), cm = lam({ color: 0x58b7a6, flatShading: true }); can.add(new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.6, 8, 8), cm));
  const sp = new THREE.Mesh(new THREE.CylinderGeometry(.9, 1.3, 9, 6), cm); sp.rotation.x = -1.1; sp.position.set(0, 1.5, -6.5); const rose = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 1, 1.6, 8), cm); rose.rotation.x = -1.1; rose.position.set(0, 3.8, -10.8);
  const hd = new THREE.Mesh(new THREE.TorusGeometry(3.4, .7, 4, 8, Math.PI), cm); hd.rotation.set(0, Math.PI / 2, -Math.PI / 2); hd.position.set(0, 0, 4.6); can.add(sp, rose, hd); can.visible = false; S.sc.add(can); S.can = can;
  syncPhysUI();
}
/* a piece that was picked up or knocked over no longer blocks the way where it used to stand */
function freeRec(rec) { const S = R && R.S; if (!S || S.freed.has(rec.it)) return; S.freed.add(rec.it); S.bvh = solidBVH(S.solids.filter(o => !o.it || !S.freed.has(o.it))); syncPhysUI(); }
function syncPhysUI() {
  const S = R.S, P = R.P, k = document.getElementById('r3keep'), c = document.getElementById('r3can'), d = document.getElementById('r3drop'); if (!k) return;
  k.classList.toggle('on', !!(S && S.kind === 'town' && S.freed && S.freed.size)); c.classList.toggle('on', !!(P && P.can)); d.classList.toggle('on', !!(P && P.held)); if (S && S.can) S.can.visible = !!(P && P.can);
}
/* Keep where it landed: only this writes physics positions into the saved town */
function keepLanded() {
  const S = R.S, P = R.P; if (!S || !P || S.kind !== 'town') return; let n = 0; const b = S.bounds;
  for (const body of P.bodies) { if (!body.moved || body === P.held) continue; const it = body.rec.it; it.x = Math.round(Math.max(b.x0, Math.min(b.x1, body.pos.x))); it.y = Math.round(Math.max(b.z0, Math.min(b.z1, body.pos.z))); body.home = { x: it.x, z: it.y }; body.moved = false; body.kept = 1; n++; }
  S.freed.clear(); LS.set('town', TOWN); syncPhysUI(); toast(n ? 'Kept: ' + (n === 1 ? '1 piece stays where it landed' : n + ' pieces stay where they landed') : 'Nothing has moved');
}
function setCan(on) { if (!R.P) return; R.P.setCan(on); syncPhysUI(); if (on) toast('Watering can out: aim and it pours. Tap 🚿 again to put it away.'); }
function disposeScene(sc) { sc.traverse(o => { if (o.geometry) o.geometry.dispose(); const m = o.material; if (m) (Array.isArray(m) ? m : [m]).forEach(x => { if (x.map && x.map !== GLOW && x.map !== BLOB && x.map !== SPARK) x.map.dispose(); x.dispose(); }); }); }
export function close(toScreen) {
  if (!R) return; cancelAnimationFrame(R.raf); const kind = R.S && R.S.kind, p = R.pos;
  if (kind === 'town') { TOWN.hero.x = p.x; TOWN.hero.y = p.z; LS.set('town', TOWN); } else if (kind === 'house') { HOUSE.hero = { x: p.x, y: p.z }; LS.set('househero', HOUSE.hero); } else if (kind === 'shop') { const r = R.S.R; r.hero = { x: p.x, y: p.z }; LS.set(r.key, r.hero); } else if (kind === 'home') { LOB.hero = { x: p.x, y: p.z }; LS.set('lobby', LOB.hero); }
  removeEventListener('resize', R.fit); R.unbind && R.unbind(); if (R.P) { R.P.dispose(); R.P = null; } if (R.S) disposeScene(R.S.sc); R.renderer.dispose(); try { R.renderer.forceContextLoss(); } catch (e) { }
  document.getElementById('r3d').classList.remove('on'); R = null; OVL = null; setVol && setVol();
  const scr = toScreen || (kind === 'town' ? 'town' : kind === 'house' ? 'house' : kind === 'shop' ? 'shop' : 'home');
  if (scr === 'town') { go('town'); ST.walk = true; ST.cam.x = TOWN.hero.x - W / 2 / ST.z; ST.cam.y = TOWN.hero.y - H * .45 / ST.z; buildStageUI(); LS.set('where', { s: 'town', walk: 1 }); }
  else if (scr === 'house' || scr === 'home' || scr === 'shop') { RESUMING = 1; try { go(scr); } finally { RESUMING = 0; } }
}
export function isOpen() { return !!R; }

function bindControls(o) {
  const cvx = o.querySelector('#r3cv'), stick = o.querySelector('#r3stick'), knob = stick.querySelector('i');
  const sd = e => { e.preventDefault(); auInit(); const r = stick.getBoundingClientRect(); R.stick.id = e.pointerId; R.stick.cx = r.left + r.width / 2; R.stick.cy = r.top + r.height / 2; try { stick.setPointerCapture(e.pointerId); } catch (_) { } sm(e); };
  const sm = e => { if (R.stick.id !== e.pointerId) return; const dx = e.clientX - R.stick.cx, dy = e.clientY - R.stick.cy, m = 46, d = Math.hypot(dx, dy), k = d > m ? m / d : 1; R.stick.x = dx * k / m; R.stick.y = dy * k / m; knob.style.transform = `translate(${dx * k}px,${dy * k}px)`; };
  const su = e => { if (R.stick.id !== e.pointerId) return; R.stick.id = null; R.stick.x = R.stick.y = 0; knob.style.transform = ''; };
  stick.addEventListener('pointerdown', sd); stick.addEventListener('pointermove', sm); stick.addEventListener('pointerup', su); stick.addEventListener('pointercancel', su);
  const ld = e => { auInit(); R.look = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 }; try { cvx.setPointerCapture(e.pointerId); } catch (_) { } document.getElementById('r3hint').classList.add('off'); };
  const lm = e => { const L = R.look; if (!L || L.id !== e.pointerId) return; const dx = e.clientX - L.x, dy = e.clientY - L.y; L.moved += Math.abs(dx) + Math.abs(dy); L.x = e.clientX; L.y = e.clientY; R.yaw -= dx * .0062; R.pitch = Math.max(-1.1, Math.min(.9, R.pitch - dy * .005)); };
  const lu = e => { const L = R.look; if (!L || L.id !== e.pointerId) return; R.look = null; if (L.moved < 8 && performance.now() - L.t < 350 && R.near) act(); };
  cvx.addEventListener('pointerdown', ld); cvx.addEventListener('pointermove', lm); cvx.addEventListener('pointerup', lu); cvx.addEventListener('pointercancel', lu);
  const kd = e => { R.keys[e.key.toLowerCase()] = 1; if ((e.key === 'Enter' || e.key === 'e') && R.near) act(); if (e.key === 'f' && R.P && R.P.held) { R.P.drop(); syncPhysUI(); } if (e.key === 'c' && R.P) setCan(!R.P.can); if (e.key === 'Escape') close(); }, ku = e => { R.keys[e.key.toLowerCase()] = 0; };
  addEventListener('keydown', kd); addEventListener('keyup', ku);
  o.querySelector('#r3back').onclick = () => { SFX.tick(); close(); };
  o.querySelector('#r3act').onclick = () => act();
  o.querySelector('#r3drop').onclick = () => { if (R.P && R.P.held) { SFX.tick(); R.P.drop(); syncPhysUI(); } };
  o.querySelector('#r3can').onclick = () => { SFX.tick(); if (R.P) setCan(!R.P.can); };
  o.querySelector('#r3keep').onclick = () => { SFX.tick(); keepLanded(); };
  o.querySelector('#r3clk').onclick = () => { SFX.tick(); CLK.m = nightK() > .5 ? 600 : 1320; LS.set('clock', CLK); };
  R.unbind = () => { removeEventListener('keydown', kd); removeEventListener('keyup', ku); };
}
function act() {
  const n = R.near; if (!n || R.busy) return; SFX.tick();
  if (n.held) { const cp = Math.cos(R.pitch); R.P.toss({ x: -Math.sin(R.yaw) * cp, y: Math.sin(R.pitch), z: -Math.cos(R.yaw) * cp }); syncPhysUI(); return; }
  if (n.pick) { R.P.pick(n.pick); syncPhysUI(); return; }
  if (n.bld) { const b = BLD[n.bld]; if (b.shop) SHOP_ID = b.shop; goScene(b.scr); return; }
  if (n.door) { n.door.it.open = !n.door.it.open; LS.set('town', TOWN); return; }
  if (n.stn) { const s = n.stn.s; if (s.id === 'door' || s.id === 'hdoor' || s.out) { const k = s.out || (s.id === 'door' ? 'studio' : 'house'), b = TOWN[k], d = BLD[k].door; goScene('town', { x: b.x + d.x, y: b.y + d.y + 40, yaw: Math.PI }); return; }
    if (s.soon) { toast(s.name + ' is coming in a later pass'); return; }
    close(R.S.kind); setTimeout(() => enterStn(s), 60); }
}
/* T029: everything solid (walls, buildings, stations, pieces that block) as one collision mesh with a BVH, so the camera stops CR short of it */
function solidBVH(list) {
  const P = [], mt = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
  for (const b of list) { if (!b || !(b.w > 0) || !(b.d > 0)) continue; const g = new THREE.BoxGeometry(b.w, b.h || 120, b.d).toNonIndexed(); mt.compose(new THREE.Vector3(b.x, (b.h || 120) / 2, b.z), q.setFromAxisAngle(up, b.yaw || 0), new THREE.Vector3(1, 1, 1)); g.applyMatrix4(mt); P.push(...g.attributes.position.array); g.dispose(); }
  if (!P.length) return null; const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); return new MeshBVH(geo);
}
const _cp = new THREE.Vector3(), _hit = {};
function collideBVH(p) {
  const bvh = R.S.bvh; if (!bvh) return;
  for (let pass = 0; pass < 3; pass++) { let moved = false;
    for (const y of [22, EYE]) { _cp.set(p.x, y, p.z); const h = bvh.closestPointToPoint(_cp, _hit, 0, CR); if (!h || h.distance >= CR) continue;
      let dx = p.x - h.point.x, dz = p.z - h.point.z, l = Math.hypot(dx, dz); if (l < .01) continue; const k = (CR - l) / l + .001; p.x += dx * k; p.z += dz * k; moved = true; }
    if (!moved) break; }
}
function collide(p) {
  collideBVH(p);
  const b = R.S.bounds; p.x = Math.max(b.x0, Math.min(b.x1, p.x)); p.z = Math.max(b.z0, Math.min(b.z1, p.z));
  for (const c of R.S.col) { if (c.it && c.it.act === 'door' && c.it.open) continue; if (p.x > c.x0 - RAD && p.x < c.x1 + RAD && p.z > c.z0 - RAD && p.z < c.z1 + RAD) { const dl = p.x - (c.x0 - RAD), dr = c.x1 + RAD - p.x, du = p.z - (c.z0 - RAD), dd = c.z1 + RAD - p.z, m = Math.min(dl, dr, du, dd); if (m === dl) p.x = c.x0 - RAD; else if (m === dr) p.x = c.x1 + RAD; else if (m === du) p.z = c.z0 - RAD; else p.z = c.z1 + RAD; } }
  if (R.S.kind === 'town') for (const r of R.S.items) if (r.it.act === 'vehicle') { const dx = p.x - r.it.x, dz = p.z - r.it.y, d = Math.hypot(dx, dz), m = 36; if (d < m && d > .01) { p.x = r.it.x + dx / d * m; p.z = r.it.y + dz / d * m; } }
}
function loop(ts) {
  if (!R) return; R.raf = requestAnimationFrame(loop); const dt = Math.min(.05, (ts - R.last) / 1000 || 0); R.last = ts; R.t += dt; const S = R.S; if (!S) return;
  /* walk */
  const K = R.keys; let mx = R.stick.x + ((K.d || K.arrowright) ? 1 : 0) - ((K.a || K.arrowleft) ? 1 : 0), mz = R.stick.y + ((K.s || K.arrowdown) ? 1 : 0) - ((K.w || K.arrowup) ? 1 : 0); const ml = Math.hypot(mx, mz); if (ml > 1) { mx /= ml; mz /= ml; }
  if (K.q) R.yaw += dt * 2; if (K.r) R.yaw -= dt * 2;
  const sy = Math.sin(R.yaw), cy = Math.cos(R.yaw), p = R.pos; if (ml > .05 && !R.busy) { p.x += (mx * cy + mz * sy) * SPEED * dt; p.z += (-mx * sy + mz * cy) * SPEED * dt; R.bob = (R.bob || 0) + dt * 9 * Math.min(1, ml); } collide(p);
  /* the world keeps living: cars drive, the clock runs (clkTick runs in the game's frame) */
  if (S.kind === 'town') { TOWN.hero.x = p.x; TOWN.hero.y = p.z; try { townActs(dt); } catch (e) { } }
  if (R.P) R.P.step(dt, { pos: p, yaw: R.yaw, pitch: R.pitch, eye: EYE, moving: ml > .05 && !R.busy });
  const { c, k } = skyCols(); R.renderer.setClearColor(c); S.sc.fog.color.copy(c); S.sc.userData.L.hemi.intensity = 1.5 - k * 1.0; S.sc.userData.L.sun.intensity = 1.6 * (1 - k) + .1; S.sc.userData.L.hemi.color.setHex(k > .5 ? 0x8fa0ff : 0xffffff);
  for (const r of S.items) {
    const s = r.it.s || 1; r.g.scale.x = s * (r.it.flip < 0 ? -1 : 1);
    if (r.dyn) { /* T025: physics places it */ if (r.g.userData.glow) r.g.userData.mats.forEach(m => { m.emissiveIntensity = k * 1.1; }); continue; }
    r.g.position.set(r.it.x, 0, r.it.y); r.blob.position.set(r.it.x, .7, r.it.y);
    if (r.door) r.g.rotation.y = r.yaw + (r.it.open ? -1.25 : 0);
    else if (r.moving && r.g.userData.style === 'flat') r.g.rotation.y = Math.atan2(p.x - r.it.x, p.z - r.it.y); /* T029: only moving things turn to face you */
    else r.g.rotation.y = r.yaw;
    if (r.light) { r.light.material.opacity = Math.min(1, k * 1.3) * (.85 + .15 * Math.sin(R.t * 3 + r.it.x)); }
    if (r.g.userData.glow) r.g.userData.mats.forEach(m => { m.emissiveIntensity = k * 1.1; });
  }
  S.sc.traverse(o => { if (o.userData.spark) o.material.opacity = .5 + .5 * Math.sin(R.t * 4 + o.id); });
  for (const b of S.blds) { b.userData.glow.material.opacity = k * .55; b.userData.front.material.emissiveIntensity = k * .25; }
  /* what's close enough to use */
  let near = null, bd = 1e9;
  if (S.kind === 'town') { for (const b of S.blds) { const d = Math.hypot(p.x - b.userData.door.x, p.z - b.userData.door.z); if (d < 70 && d < bd) { bd = d; near = { bld: b.userData.kind, txt: '🚪 Go into ' + BLD[b.userData.kind].name }; } }
    for (const r of S.items) if (r.door) { const d = Math.hypot(p.x - r.it.x, p.z - r.it.y); if (d < 60 && d < bd) { bd = d; near = { door: r, txt: r.it.open ? '🚪 Close' : '🚪 Open' }; } } }
  else for (const n of S.stns) { const d = Math.hypot(p.x - n.at.x, p.z - n.at.z); if (d < 64 && d < bd) { bd = d; const s = n.s; near = { stn: n, txt: s.soon ? '🔒 ' + s.name + ' (soon)' : (s.id === 'door' || s.id === 'hdoor' || s.out ? '🚪 ' : '👉 ') + (s.verb || s.name) }; } }
  /* T025: a loose piece close in front of you can be picked up; a held one can be thrown */
  if (R.P && R.P.held) near = { held: R.P.held, txt: '🤾 Throw ' + R.P.held.name };
  else if (R.P && (!near || bd > 34)) { const b = R.P.nearest(p, R.yaw); if (b) near = { pick: b, txt: '✋ Pick up ' + b.name }; }
  if ((near && near.txt) !== (R.near && R.near.txt)) { const b = document.getElementById('r3act'); b.textContent = near ? near.txt : ''; b.classList.toggle('on', !!near); }
  R.near = near;
  /* camera */
  const bob = ml > .05 ? Math.sin(R.bob) * 1.6 : 0; R.cam.position.set(p.x, EYE + bob, p.z); R.cam.rotation.order = 'YXZ'; R.cam.rotation.set(R.pitch, R.yaw, 0);
  document.getElementById('r3clk').textContent = k > .5 ? '🌙' : '☀️';
  if (S.can && S.can.visible) { const cp = Math.cos(R.pitch), fx = -Math.sin(R.yaw) * cp, fz = -Math.cos(R.yaw) * cp, rx = Math.cos(R.yaw), rz = -Math.sin(R.yaw); S.can.position.set(p.x + fx * 24 + rx * 11, EYE - 9 + Math.sin(R.pitch) * 24, p.z + fz * 24 + rz * 11); S.can.rotation.order = 'YXZ'; S.can.rotation.set(R.pitch - .35, R.yaw, 0); }
  R.renderer.render(S.sc, R.cam);
  /* T025: watch the frame rate (logged every 5 s); when it stays under 26 the water ripples are turned down, and back up when it recovers */
  if (dt > 0) { R.fps = R.fps ? R.fps * .95 + (1 / dt) * .05 : 1 / dt; R.fT = (R.fT || 0) + dt; R.lowT = R.fps < 26 ? (R.lowT || 0) + dt : 0; R.okT = R.fps > 40 ? (R.okT || 0) + dt : 0;
    if (R.P) { if (R.lowT > 2 && R.P.q < 2) { R.P.q++; R.lowT = 0; } else if (R.okT > 6 && R.P.q > 0) { R.P.q--; R.okT = 0; } }
    if (R.fT >= 5) { R.fT = 0; console.log('[Retro 3D] ' + Math.round(R.fps) + ' fps, ' + (R.P && R.P.on ? R.P.bodies.length + ' bodies (' + R.P.awake + ' moving), ' : 'physics off, ') + 'water detail ' + (R.P ? 2 - R.P.q : '-')); } }
}

/* ---------- Make it 3D preview (a spinning piece in a small canvas) ---------- */
export async function preview(canvas, toy, style) {
  GLOW = GLOW || glowTex(); BLOB = BLOB || blobTex(); SPARK = SPARK || sparkTex();
  let r; try { r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { return () => { }; }
  r.outputColorSpace = THREE.SRGBColorSpace; r.setPixelRatio(Math.min(2, devicePixelRatio || 1)); r.setSize(canvas.clientWidth || 260, canvas.clientHeight || 220, false);
  const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xffffff, 0x8a6a48, 1.5)); const sun = new THREE.DirectionalLight(0xfff2dc, 1.7); sun.position.set(-300, 500, 600); sc.add(sun);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 24), lam({ color: 0xc9a46a })); sc.add(base);
  const grp = await pieceMesh(toy, style, { noFoot: 1 }); sc.add(grp);
  const box = new THREE.Box3().setFromObject(grp), sz = box.getSize(new THREE.Vector3()), R0 = Math.max(sz.x, sz.y, sz.z);
  base.scale.set(R0 * .45, 6, R0 * .45); base.position.y = -3;
  const cam = new THREE.PerspectiveCamera(38, (canvas.clientWidth || 260) / (canvas.clientHeight || 220), 1, R0 * 20); cam.position.set(0, sz.y * .55, R0 * 1.9); cam.lookAt(0, sz.y * .45, 0);
  let raf = 0, t0 = performance.now(), live = true;
  const tick = now => { if (!live) return; raf = requestAnimationFrame(tick); const t = (now - t0) / 1000; grp.rotation.y = Math.sin(t * .9) * 1.1 + t * .25; if (grp.userData.fold) foldStep(grp, t / .9); grp.traverse(o => { if (o.userData.spark) o.material.opacity = .5 + .5 * Math.sin(t * 4 + o.id); }); r.render(sc, cam); };
  raf = requestAnimationFrame(tick);
  return () => { live = false; cancelAnimationFrame(raf); disposeScene(sc); r.dispose(); try { r.forceContextLoss(); } catch (e) { } };
}
export function forget(id) { TOYC.delete(id); for (const k of [...TOYC.keys()]) if (typeof k === 'string' && k.startsWith('back:' + id + ':')) TOYC.delete(k); }
/* for the Playwright tests: the live view's state (position, scene, what's near) */
export function _state() { return R; }
export const _phy = PHY;
