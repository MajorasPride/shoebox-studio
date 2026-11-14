/* Shoebox Studio T025: Physics and Water for Retro 3D. By MajorasPride.
   Loaded only by r3d.js (so only when 3D opens). The physics engine itself (Rapier, Apache 2.0, lib/rapier3d-compat/, pinned 0.14.0)
   is loaded from here only when Settings > 3D physics is on. 2D never loads either file.
   What is in here:
   - MATERIAL_PHYS: the one table that says how each material behaves (weight, bounce, drag, what water does to it).
   - physKey(toy): which row of the table a Toy Box piece uses, from its medium tags (toy.med), paper stock and Make it 3D style.
   - create(scene): the physics world for one 3D scene: fixed ground and walls, one body per loose piece, pick up / drop / throw.
   - Water: a height-field surface that ripples and splashes (no fluid simulation), a few particle drops, the watering can,
     soggy paper that dries, things that float or sink.
   Sizes: the game works in pixels; Rapier works in metres. K turns one into the other (50 px = 1 m, so the player's eye is about 1.3 m up). */
import * as THREE from './lib/three.module.min.js';

export const K = 1 / 50;
const GRAV = 9.81 * 1.6; /* a little heavier than real: toys on a table feel better that way */

/* ---------- the material table ----------
   density: weight for its size (water = 1).   bounce: 0 = thud, 1 = super ball.   friction: 0 = ice, 1 = rubber.
   drag / spin: how fast the air slows it down (moving / turning).   grav: 1 = normal fall, less = floats down.
   soak: how soggy water makes it (0 = not at all).   floats: 1 = floats in a pond, 0 = sinks.   flutter: drifts side to side as it falls.
   To add a material: one new row here, and a line in MEDIUM_PHYS or STOCK_PHYS (or set toy.phys to its name). */
export const MATERIAL_PHYS = {
  paper:     { name: 'Paper',      density: .10, bounce: .04, friction: .55, drag: 3.2, spin: 2.6, grav: .30, soak: 1,  floats: 1, flutter: 1 },
  card:      { name: 'Cardstock',  density: .28, bounce: .12, friction: .6,  drag: 1.3, spin: 1.4, grav: .65, soak: .8, floats: 1, flutter: .4 },
  cardboard: { name: 'Cardboard',  density: .45, bounce: .18, friction: .7,  drag: .45, spin: .8,  grav: 1,   soak: .5, floats: 1 },
  clay:      { name: 'Clay',       density: 2.4, bounce: 0,   friction: .95, drag: .05, spin: .9,  grav: 1,   soak: 0,  floats: 0 },
  yarn:      { name: 'Yarn',       density: .32, bounce: .45, friction: .9,  drag: .9,  spin: 1.8, grav: .9,  soak: 0,  floats: 1 },
  felt:      { name: 'Felt',       density: .38, bounce: .22, friction: .95, drag: 1.1, spin: 2,   grav: .9,  soak: 0,  floats: 1 },
  rubber:    { name: 'Rubber',     density: .6,  bounce: .82, friction: .8,  drag: .08, spin: .3,  grav: 1,   soak: 0,  floats: 1 },
  plastic:   { name: 'Plastic',    density: .7,  bounce: .4,  friction: .5,  drag: .1,  spin: .4,  grav: 1,   soak: 0,  floats: 1 }
};
/* paper stock (toy.med.stock, the STOCKS ids in mediums.js) -> material */
export const STOCK_PHYS = { con: 'paper', sketch: 'paper', lined: 'paper', trace: 'paper', black: 'paper', water: 'paper', card: 'card', board: 'cardboard', kraft: 'cardboard' };
/* medium tags (toy.med.m) that change the material. Drawing mediums (pencil, paint...) do not: the paper decides. Yarn and felt are ready for T041. */
export const MEDIUM_PHYS = { yarn: 'yarn', felt: 'felt', clay: 'clay', glitter: 'card' };
/* the built-in physics and water pieces in the Toy Box (made in stations.js, mkPhysToys) */
export const PHYS_PIECES = {
  phys_clay: { phys: 'clay', ball: 1 }, phys_yarn: { phys: 'yarn', ball: 1 }, phys_ball: { phys: 'rubber', ball: 1 },
  phys_puddle: { water: 'puddle' }, phys_pond: { water: 'pond' }, phys_fountain: { water: 'fountain' }
};
export function pieceInfo(toy) { return (toy && PHYS_PIECES[toy.id]) || {}; }
export function physKey(toy) {
  const info = pieceInfo(toy); if (info.phys) return info.phys;
  if (toy.phys && MATERIAL_PHYS[toy.phys]) return toy.phys;
  const med = toy.med || {};
  for (const m of med.m || []) if (MEDIUM_PHYS[m] && m !== 'glitter') return MEDIUM_PHYS[m];
  if (toy.m3d === 'clay') return 'clay'; /* Puff: it looks like clay or a pillow, so it weighs like clay */
  if (med.gl) return 'card'; /* glitter card is like cardstock */
  if (med.stock && STOCK_PHYS[med.stock]) return STOCK_PHYS[med.stock];
  return toy.starter || toy.show || /^(starter_|show_|cp_|cps_)/.test(toy.id || '') ? 'cardboard' : 'paper'; /* the built-in pieces are cardboard; what you make starts as paper */
}
export function physOf(toy) { return MATERIAL_PHYS[physKey(toy)] || MATERIAL_PHYS.cardboard; }

/* ---------- Rapier, loaded on demand ---------- */
let RAPIER = null;
export async function loadEngine() {
  if (RAPIER) return RAPIER;
  const m = await import('./lib/rapier3d-compat/rapier.es.js'); const R = m.default && m.default.init ? m.default : m;
  await R.init(); RAPIER = R; return R;
}
export function engineLoaded() { return !!RAPIER; }

/* ---------- water looks ---------- */
const WATER = {
  puddle:   { surf: 2.2, rim: 0,  n: 20, col: 0x6fc3ea },
  pond:     { surf: 22,  rim: 25, n: 28, col: 0x4aa9dc },
  fountain: { surf: 20,  rim: 24, n: 22, col: 0x5cb8e6, jet: 1 }
};
function waterTex(blobby) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.beginPath(); for (let i = 0; i <= 48; i++) { const a = i / 48 * Math.PI * 2, r = 60 * (blobby ? 1 - .1 * (Math.sin(a * 3 + 1) * .5 + .5) - .05 * (Math.sin(a * 5) * .5 + .5) : 1); x.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); } x.closePath();
  const g = x.createRadialGradient(64, 64, 6, 64, 64, 62); g.addColorStop(0, '#ffffff'); g.addColorStop(.7, '#e6f6ff'); g.addColorStop(1, '#bfe6fb'); x.fillStyle = g; x.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; return { t, c };
}

/* ---------- the world for one scene ---------- */
/* S: the scene record from r3d.js ({sc, solids, items, kind, bounds}).  opt: {physics: true/false, onFree(rec), sfx:{thud, splash, drip}} */
export function create(S, opt = {}) {
  const R = opt.physics !== false ? RAPIER : null;
  const P = {
    on: !!R, world: null, bodies: [], waters: [], held: null, t: 0, acc: 0, q: 0, awake: 0,
    cfg: { dry: 60, maxBodies: 60, far: 1100, loose: 165, reach: 92 },
    S, opt, drops: null, can: false, canT: 0, wadeT: 0
  };
  if (R) {
    P.world = new R.World({ x: 0, y: -GRAV, z: 0 }); P.world.timestep = 1 / 60;
    /* fixed: the ground, then every wall, building and station (the same shapes the camera collides with, T029) */
    const b = S.bounds, cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2;
    P.world.createCollider(R.ColliderDesc.cuboid(200, 1, 200).setTranslation(cx * K, -1, cz * K).setFriction(.8).setRestitution(.2));
    for (const s of S.solids) { if (s.it || !(s.w > 0) || !(s.d > 0)) continue; P.world.createCollider(boxDesc(R, s.w, s.h || 120, s.d).setTranslation(s.x * K, (s.h || 120) / 2 * K, s.z * K).setRotation(yawQ(s.yaw || 0))); }
  }
  /* particle drops: one pool for the watering can, splashes and the fountain */
  const N = 160, pos = new Float32Array(N * 3).fill(-9999), geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xbfe9ff, size: 5, sizeAttenuation: true, transparent: true, opacity: .9, depthWrite: false })); pts.frustumCulled = false; S.sc.add(pts);
  P.drops = { N, pos, geo, pts, vel: new Float32Array(N * 3), life: new Float32Array(N), kind: new Uint8Array(N), next: 0 };

  P.addPiece = rec => addPiece(P, R, rec);
  /* a piece that never moves (a street light, a door) is still something to bounce off */
  P.addFixed = s => { if (P.on && s.w > 0 && s.d > 0) P.world.createCollider(boxDesc(R, s.w, s.h || 120, s.d).setTranslation(s.x * K, (s.h || 120) / 2 * K, s.z * K).setRotation(yawQ(s.yaw || 0))); };
  P.addWater = (rec, kind) => addWater(P, R, rec, kind);
  P.step = (dt, cam) => step(P, R, dt, cam);
  P.nearest = (p, yaw) => nearest(P, p, yaw);
  P.pick = b => pick(P, R, b);
  P.drop = () => release(P, R, 0);
  P.toss = dir => release(P, R, 1, dir);
  P.wet = (b, k) => wet(P, b, k);
  P.ripple = (x, z, amt) => { for (const w of P.waters) if (inWater(w, x, z)) disturb(w, x, z, amt); };
  P.setCan = on => { P.can = !!on; };
  P.dispose = () => { if (P.world) { try { P.world.free(); } catch (e) { } P.world = null; } P.bodies.length = 0; P.waters.length = 0; };
  return P;
}
const yawQ = y => ({ x: 0, y: Math.sin(y / 2), z: 0, w: Math.cos(y / 2) });
const boxDesc = (R, w, h, d) => R.ColliderDesc.cuboid(Math.max(.5, w / 2) * K, Math.max(.5, h / 2) * K, Math.max(.5, d / 2) * K);

/* a body for one town piece. Its collider comes from its 3D shape: a thin cardboard box for a standee (T029), a deeper box for Fold,
   a simple hull around the pillow for Puff (T033), a ball for the ball pieces. */
function addPiece(P, R, rec) {
  if (!P.on) return null;
  const { toy, it, g } = rec, s = it.s || 1, w = toy.w * s, h = toy.h * s, key = physKey(toy), mat = MATERIAL_PHYS[key], info = pieceInfo(toy), style = g.userData.style;
  const fixed = P.bodies.filter(b => !b.fixed).length >= P.cfg.maxBodies;
  let desc, hh = h / 2, thick = 8, shape = 'box';
  if (info.ball || toy.ball) { const r = Math.min(w, h) / 2; desc = R.ColliderDesc.ball(r * K); hh = r; thick = r * 2; shape = 'ball'; }
  else if (style === 'clay') {
    const pts = []; g.updateMatrixWorld(true);
    g.traverse(o => { if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return; const a = o.geometry.attributes.position, st = Math.max(1, Math.floor(a.count / 90)); for (let i = 0; i < a.count; i += st) { const z = a.getZ(i); if (Math.abs(z) < .5 && i % (st * 3)) continue; pts.push(a.getX(i) * s * K * .94, (a.getY(i) * s - hh) * K, z * s * K); } });
    desc = pts.length >= 12 ? R.ColliderDesc.convexHull(new Float32Array(pts)) : null; thick = Math.min(w, h) * .6; shape = 'hull';
    if (!desc) { desc = boxDesc(R, w * .8, h, thick * .7); shape = 'box'; }
  } else { thick = style === 'paper' ? Math.max(6, Math.min(26, Math.min(toy.w, toy.h) * .12)) * s : Math.max(12, Math.min(16, Math.min(w, h) * .16)); desc = boxDesc(R, w * .84, h, thick); } /* a little thicker than the cardboard looks, so standees stand up and blocks stack */
  desc.setDensity(mat.density * 1000).setRestitution(mat.bounce).setFriction(mat.friction)
    .setRestitutionCombineRule(mat.bounce === 0 ? R.CoefficientCombineRule.Min : R.CoefficientCombineRule.Max);
  const bd = (fixed ? R.RigidBodyDesc.fixed() : R.RigidBodyDesc.dynamic()).setTranslation(it.x * K, hh * K + .002, it.y * K).setRotation(yawQ(rec.yaw || 0))
    .setLinearDamping(mat.drag).setAngularDamping(mat.spin).setGravityScale(mat.grav).setCanSleep(true).setCcdEnabled(shape === 'ball');
  const body = P.world.createRigidBody(bd); P.world.createCollider(desc, body);
  if (!fixed) body.sleep();
  const b = { rec, body, mat, key, hh, w, h, thick, shape, fixed, size: Math.max(w, h), home: { x: it.x, z: it.y }, pos: { x: it.x, y: 0, z: it.y }, moved: false, wet: 0, soak: 0, inW: null, name: toy.name || 'piece', mass: fixed ? 0 : body.mass() };
  rec.body = b; P.bodies.push(b); return b;
}

/* a puddle, pond or fountain: a grid of heights that ripples, with a cardboard rim for the deep ones */
function addWater(P, R, rec, kind) {
  const { toy, it } = rec, s = it.s || 1, def = WATER[kind] || WATER.puddle, rx = toy.w * s / 2 * (def.rim ? .9 : 1), rz = Math.max(toy.h * s / 2 * (def.rim ? .9 : 1), rx * .55), cx = it.x, cz = it.y - toy.h * s / 2;
  const n = def.n, n1 = n + 1, geo = new THREE.PlaneGeometry(rx * 2, rz * 2, n, n).rotateX(-Math.PI / 2), tex = waterTex(!def.rim);
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: tex.t, color: def.col, transparent: true, opacity: .86, alphaTest: .3, flatShading: true, emissive: 0x16425e, emissiveIntensity: .5 }));
  mesh.position.set(cx, def.surf, cz); mesh.userData.water = 1; P.S.sc.add(mesh);
  const inside = new Uint8Array(n1 * n1); for (let j = 0; j < n1; j++) for (let i = 0; i < n1; i++) { const u = i / n * 2 - 1, v = j / n * 2 - 1; inside[j * n1 + i] = u * u + v * v < .82 ? 1 : 0; }
  const w = { kind, def, cx, cz, rx, rz, n, n1, mesh, inside, h: new Float32Array(n1 * n1), v: new Float32Array(n1 * n1), surf: def.surf, deep: def.rim > 0, live: 0, tick: 0, jetT: 0, rec };
  if (def.rim) {
    /* the tray: a low cardboard ring and a painted bed */
    const seg = 16, ring = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.04, def.rim, seg, 1, true), new THREE.MeshLambertMaterial({ color: 0xc49a62, side: THREE.DoubleSide, flatShading: true })); ring.scale.set(rx / .9, 1, rz / .9); ring.position.set(cx, def.rim / 2, cz); P.S.sc.add(ring);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(1, .035, 4, seg).rotateX(Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0xb08850, flatShading: true })); lip.scale.set(rx / .9, 28, rz / .9); lip.position.set(cx, def.rim, cz); P.S.sc.add(lip);
    const bed = new THREE.Mesh(new THREE.CircleGeometry(1, seg).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0x2f6f96 })); bed.scale.set(rx / .9, 1, rz / .9); bed.position.set(cx, .8, cz); P.S.sc.add(bed);
    if (P.on) for (let i = 0; i < seg; i++) { const a = (i + .5) / seg * Math.PI * 2, px = cx + Math.cos(a) * rx / .9, pz = cz + Math.sin(a) * rz / .9, len = 2 * Math.PI * Math.max(rx, rz) / .9 / seg + 4, ta = Math.atan2(Math.cos(a) * rz, -Math.sin(a) * rx); P.world.createCollider(boxDesc(R, len, def.rim, 5).setTranslation(px * K, def.rim / 2 * K, pz * K).setRotation(yawQ(-ta)).setFriction(.7)); }
  }
  if (def.jet) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(5, 8, 44, 8), new THREE.MeshLambertMaterial({ color: 0xd8c7a6, flatShading: true })); post.position.set(cx, 22, cz); P.S.sc.add(post);
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(15, 5, 8, 8), new THREE.MeshLambertMaterial({ color: 0xc9b48e, flatShading: true })); bowl.position.set(cx, 46, cz); P.S.sc.add(bowl);
    if (P.on) P.world.createCollider(R.ColliderDesc.cylinder(25 * K, 8 * K).setTranslation(cx * K, 25 * K, cz * K));
    w.jet = { x: cx, y: 52, z: cz };
  }
  P.waters.push(w); return w;
}
function inWater(w, x, z) { const u = (x - w.cx) / w.rx, v = (z - w.cz) / w.rz; return u * u + v * v < .82; }
function disturb(w, x, z, amt) {
  const i = Math.round(((x - w.cx) / w.rx + 1) / 2 * w.n), j = Math.round(((z - w.cz) / w.rz + 1) / 2 * w.n);
  for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const a = i + di, b = j + dj; if (a < 1 || b < 1 || a >= w.n || b >= w.n) continue; const k = b * w.n1 + a; if (w.inside[k]) w.v[k] -= amt * (di || dj ? .5 : 1); }
  w.live = 6; /* keep simulating for a few seconds after the last touch */
}
function waterStep(P, w, dt) {
  if (w.live <= 0) return; w.live -= dt; w.tick++;
  if (P.q && w.tick % (P.q + 1)) return; /* frame rate dropped: the ripples are worked out every second frame, then every third */
  const { n1, h, v, inside } = w, len = h.length, lo = -Math.min(7, w.surf - .7), hi = w.deep ? 7 : 3.5; let amp = 0; /* a puddle is shallow: its ripples stay small and never dip under the ground */
  for (let k = n1 + 1; k < len - n1 - 1; k++) { if (!inside[k]) continue; v[k] += ((h[k - 1] + h[k + 1] + h[k - n1] + h[k + n1]) * .25 - h[k]) * .42; v[k] *= .972; }
  const p = w.mesh.geometry.attributes.position;
  for (let k = 0; k < len; k++) { if (!inside[k]) continue; let y = h[k] + v[k]; y = y > hi ? hi : y < lo ? lo : y; h[k] = y; p.setY(k, y); const a = y < 0 ? -y : y; if (a > amp) amp = a; }
  p.needsUpdate = true; w.amp = amp; if (amp < .02 && w.live < 5) w.live = 0;
}

/* ---------- particle drops ---------- */
function spawn(P, x, y, z, vx, vy, vz, kind, life = 2) { const d = P.drops, i = d.next; d.next = (i + 1) % d.N; d.pos[i * 3] = x; d.pos[i * 3 + 1] = y; d.pos[i * 3 + 2] = z; d.vel[i * 3] = vx; d.vel[i * 3 + 1] = vy; d.vel[i * 3 + 2] = vz; d.life[i] = life; d.kind[i] = kind; }
function splash(P, x, y, z, n, power) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, sp = power * (.3 + Math.random() * .7); spawn(P, x, y + 1, z, Math.cos(a) * sp * .5, sp * (1 + Math.random()), Math.sin(a) * sp * .5, 1, 1.2); } }
/* kind 0 = watering can or fountain water (wets things, ripples water), kind 1 = splash spray (only looks) */
function dropsStep(P, dt) {
  const d = P.drops; let any = false;
  for (let i = 0; i < d.N; i++) {
    if (d.life[i] <= 0) continue; any = true; d.life[i] -= dt; const k = i * 3; d.vel[k + 1] -= 620 * dt; d.pos[k] += d.vel[k] * dt; d.pos[k + 1] += d.vel[k + 1] * dt; d.pos[k + 2] += d.vel[k + 2] * dt;
    const x = d.pos[k], y = d.pos[k + 1], z = d.pos[k + 2]; let dead = d.life[i] <= 0;
    if (!dead && d.kind[i] === 0 && d.vel[k + 1] < 0) {
      for (const w of P.waters) if (y <= w.surf + 1 && inWater(w, x, z)) { disturb(w, x, z, 1.5); if (Math.random() < .25) splash(P, x, w.surf, z, 1, 40); if (P.opt.sfx && Math.random() < .12) P.opt.sfx.drip(); dead = true; break; }
      if (!dead) for (const b of P.bodies) { const r = Math.max(10, b.size * .42); if (Math.abs(x - b.pos.x) < r && Math.abs(z - b.pos.z) < r && y < b.pos.y + b.hh * 2 && y > b.pos.y - 4) { wet(P, b, .34); dead = true; break; } }
    }
    if (y <= 0) dead = true;
    if (dead) { d.life[i] = 0; d.pos[k + 1] = -9999; }
  }
  if (any || d.dirty) { d.geo.attributes.position.needsUpdate = true; d.dirty = any; }
}

/* ---------- soggy paper ---------- */
function wet(P, b, k = 1) {
  if (!b || !b.mat.soak) return; const first = b.wet <= 0; b.soak = Math.min(1, b.soak + k * b.mat.soak); b.wet = P.cfg.dry;
  if (first && !b.fixed && b.body) { b.body.setLinearDamping(b.mat.drag * 2.5 + 1.2); b.body.setAngularDamping(b.mat.spin * 2.5 + 1); b.body.setGravityScale(1, true); }
  look(b);
}
/* darker and droopy while wet; back to normal as it dries */
function look(b) {
  const g = b.rec.g, k = b.soak * Math.min(1, b.wet > 0 ? b.wet / 8 : 0); b.droop = k;
  g.traverse(o => { const m = o.material; if (!m || o.userData.spark) return; (Array.isArray(m) ? m : [m]).forEach(x => { if (!x.color) return; if (!x.userData.c0) x.userData.c0 = x.color.clone(); x.color.copy(x.userData.c0).multiplyScalar(1 - .5 * k); }); });
}
function dryStep(P, b, dt) {
  if (b.wet <= 0) return; if (b.inW) { b.wet = P.cfg.dry; return; } /* it does not dry while it sits in water */
  b.wet -= dt;
  if (b.wet <= 0) { b.wet = 0; b.soak = 0; if (!b.fixed && b.body) { b.body.setLinearDamping(b.mat.drag); b.body.setAngularDamping(b.mat.spin); b.body.setGravityScale(b.mat.grav, true); } look(b); }
  else if (b.wet < 8) look(b);
}

/* ---------- pick up, drop, throw ---------- */
function nearest(P, p, yaw) {
  if (!P.on || P.held) return null; let best = null, bd = P.cfg.reach; const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
  for (const b of P.bodies) { if (b.fixed || b.size > P.cfg.loose) continue; const dx = b.pos.x - p.x, dz = b.pos.z - p.z, d = Math.hypot(dx, dz); if (d >= bd) continue; if (d > 24 && (dx * fx + dz * fz) / d < .25) continue; bd = d; best = b; }
  return best;
}
function pick(P, R, b) { if (!P.on || !b || b.fixed) return false; P.held = b; b.body.setBodyType(R.RigidBodyType.KinematicPositionBased, true); b.moved = true; if (P.opt.onFree) P.opt.onFree(b.rec); return true; }
function release(P, R, toss, dir) {
  const b = P.held; if (!b) return null; P.held = null; b.body.setBodyType(R.RigidBodyType.Dynamic, true); b.body.setLinvel({ x: 0, y: 0, z: 0 }, true); b.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
  if (toss && dir) { /* nearly the same swing for everything: the air stops paper at once, a ball flies, clay lobs */
    const v = 9 * (1 - .35 * Math.min(1, b.mat.density / 2.4)); b.body.setLinvel({ x: dir.x * v, y: dir.y * v + 2.2, z: dir.z * v }, true);
    if (b.shape !== 'ball') b.body.setAngvel({ x: (Math.random() - .5) * 5, y: (Math.random() - .5) * 3, z: (Math.random() - .5) * 5 }, true); }
  return b;
}

/* ---------- one frame ---------- */
const _q = new THREE.Quaternion(), _v = new THREE.Vector3(), _e = new THREE.Euler();
function step(P, R, dt, cam) {
  P.t += dt;
  const p = cam.pos, fx = -Math.sin(cam.yaw) * Math.cos(cam.pitch), fy = Math.sin(cam.pitch), fz = -Math.cos(cam.yaw) * Math.cos(cam.pitch);
  const sdt = Math.min(1 / 30, Math.max(1 / 240, dt));
  if (P.on && P.world) {
    /* the held piece rides in front of the Player Hand */
    const hb = P.held; if (hb) { const d = 66 + hb.size * .55, y = Math.max(hb.hh + 2, cam.eye - 14 + fy * d); hb.body.setNextKinematicTranslation({ x: (p.x + fx * d) * K, y: y * K, z: (p.z + fz * d) * K }); /* look down and a flat piece is held lying flat, so you can lay it on top of another one (stacking) */
      const flat = hb.shape === 'box' && cam.pitch < -.5; _e.set(flat ? -Math.PI / 2 : 0, cam.yaw, 0, 'YXZ'); _q.setFromEuler(_e); hb.body.setNextKinematicRotation({ x: _q.x, y: _q.y, z: _q.z, w: _q.w }); }
    /* water pushes on what is in it */
    for (const b of P.bodies) {
      if (b.fixed) continue; let w = null; const bot = b.pos.y;
      for (const x of P.waters) if (bot < x.surf && inWater(x, b.pos.x, b.pos.z)) { w = x; break; }
      if (w && !b.inW && b !== hb) { const lv = b.body.linvel(), sp = Math.hypot(lv.x, lv.y, lv.z) / K; if (sp > 25) { const pw = Math.min(5, .8 + sp / 90); disturb(w, b.pos.x, b.pos.z, pw); splash(P, b.pos.x, w.surf, b.pos.z, Math.min(10, 3 + (sp / 60 | 0)), 60 + sp * .25); if (P.opt.sfx) P.opt.sfx.splash(pw); } else disturb(w, b.pos.x, b.pos.z, .6); }
      b.inW = w; if (!w || b === hb) continue;
      if (b.mat.soak && (b.soak < b.mat.soak || b.wet < P.cfg.dry - 1)) wet(P, b, 1);
      if (w.deep && !b.body.isSleeping()) { const top = b.pos.y + Math.min(b.hh * 2, b.thick), sub = Math.max(0, Math.min(1, (w.surf - bot) / Math.max(2, top - bot))), lv = b.body.linvel();
        /* floating things are pushed up harder the deeper they sit, so they settle part way out of the water; the water also slows everything */
        const up = b.mat.floats ? GRAV * (b.wet > 0 ? 1 : b.mat.grav) * Math.max(1.3, Math.min(3.2, 1 / (b.mat.density * .5 + .1))) * sub * sdt : 0, dk = Math.pow(.02, sdt);
        b.body.setLinvel({ x: lv.x * dk, y: lv.y * (b.mat.floats ? dk : Math.pow(.004, sdt)) + up, z: lv.z * dk }, true); if (Math.abs(lv.y) > .15) disturb(w, b.pos.x, b.pos.z, .25); }
    }
    /* light paper flutters as it falls */
    for (const b of P.bodies) if (!b.fixed && b.mat.flutter && b !== hb && b.wet <= 0 && !b.body.isSleeping() && b.pos.y > 6) { const lv = b.body.linvel(); if (lv.y < -.2) { const f = b.mat.flutter * sdt, av = b.body.angvel(); b.body.setLinvel({ x: lv.x + Math.sin(P.t * 3.1 + b.home.x) * f * 2.2, y: lv.y, z: lv.z + Math.cos(P.t * 2.6 + b.home.z) * f * 2.2 }, true); b.body.setAngvel({ x: av.x + Math.sin(P.t * 3.7) * f * 3, y: av.y, z: av.z + Math.cos(P.t * 4.9) * f * 3 }, true); } }
    /* one step per frame, as long as the frame took (so it runs in real time from 30 fps up, and only slows a little below that) */
    P.world.timestep = sdt; P.world.step();
    /* copy the bodies back onto the pictures */
    let awake = 0; const far = P.cfg.far;
    for (const b of P.bodies) {
      if (b.fixed) continue; const sl = b.body.isSleeping(); if (sl && !b.dirty) { dryStep(P, b, dt); continue; } b.dirty = !sl; awake++;
      const t = b.body.translation(), r = b.body.rotation(), g = b.rec.g; _q.set(r.x, r.y, r.z, r.w); _v.set(0, -b.hh, 0).applyQuaternion(_q);
      const x = t.x / K, y = t.y / K, z = t.z / K; g.quaternion.copy(_q); g.position.set(x + _v.x, y + _v.y, z + _v.z); b.pos.x = x; b.pos.y = y - b.hh; b.pos.z = z;
      const s = b.rec.it.s || 1; g.scale.y = s * (1 - .2 * (b.droop || 0)); g.scale.z = s;
      if (b.rec.blob) { b.rec.blob.position.set(x, .7, z); b.rec.blob.material.opacity = Math.max(.15, 1 - (y - b.hh) / 160); }
      if (!b.moved && (Math.abs(x - b.home.x) > 6 || Math.abs(z - b.home.z) > 6 || (!b.kept && b.shape !== 'ball' && Math.abs(_v.y + b.hh) > b.hh * .5))) { b.moved = true; if (P.opt.onFree) P.opt.onFree(b.rec); }
      /* a hard landing makes its sound: clay thuds, paper barely whispers */
      const lv = b.body.linvel(), vy = lv.y; if (b.vy < -2.2 && vy > b.vy * .3 && P.opt.sfx && b !== hb && !b.inW) P.opt.sfx.thud(b.key, Math.min(1, -b.vy / 9) * Math.min(1, .25 + b.mass)); b.vy = vy;
      if (y < -40) { b.body.setTranslation({ x: b.home.x * K, y: (b.hh + 30) * K, z: b.home.z * K }, true); b.body.setLinvel({ x: 0, y: 0, z: 0 }, true); } /* fell out of the box: back where it started */
      if (!sl && b !== hb && Math.hypot(x - p.x, z - p.z) > far) b.body.sleep(); /* far things rest */
      dryStep(P, b, dt);
    }
    P.awake = awake;
  }
  /* watering can: a stream of drops from the spout */
  if (P.can) { P.canT += dt; while (P.canT > .035) { P.canT -= .035; const rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw), j = () => (Math.random() - .5) * 26; spawn(P, p.x + fx * 30 + rx * 12, cam.eye - 20, p.z + fz * 30 + rz * 12, fx * 120 + j(), 40 + fy * 150 + j(), fz * 120 + j(), 0, 2.5); } }
  /* fountains run; wading makes ripples */
  for (const w of P.waters) {
    if (w.jet && Math.hypot(w.cx - p.x, w.cz - p.z) < 900) { w.jetT += dt; const gap = .06 * (1 + P.q); while (w.jetT > gap) { w.jetT -= gap; const a = Math.random() * 6.283, sp = 14 + Math.random() * 22; spawn(P, w.jet.x, w.jet.y, w.jet.z, Math.cos(a) * sp, 150 + Math.random() * 40, Math.sin(a) * sp, 0, 2); } }
    waterStep(P, w, dt);
  }
  if (cam.moving) { P.wadeT -= dt; if (P.wadeT <= 0) { P.wadeT = .16; for (const w of P.waters) if (inWater(w, p.x, p.z)) { disturb(w, p.x, p.z, w.deep ? 1.6 : .9); if (w.deep && Math.random() < .5) splash(P, p.x, w.surf, p.z, 2, 50); } } }
  dropsStep(P, dt);
}
