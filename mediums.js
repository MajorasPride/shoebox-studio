'use strict';
/* Shoebox Studio: mediums.js — the medium engine: MEDIUMS recipes, grain painters, colour mixing, paper stocks and medium tags. */

/* ================= ART MEDIUMS AND PAPER STOCKS (v1.6b; medium engine T024) ================= */
/* Every medium is a brush made in code. The pencil tool draws with C.med in colour C.mcol (saved as craftloft_artbox).
   Grain mediums (coloured pencils, crayons, chalk, charcoal, oil pastels) use a tinted texture fixed to the paper, so the paper's tooth shows through.
   Each piece remembers what made it in p.med = {m:[medium ids], stock, glow:'#colour', gl:1 (glitter)}. Toys keep it as toy.med.
   In Little Town, glow pieces glow at night (nightK) and glitter pieces sparkle. */
/* ---- T024: the medium engine. Every art medium is one recipe in MEDIUMS. The game reads everything from the recipe:
     em, name     how it shows in menus
     w, a         width (paper pixels) and opacity of the main stroke
     grain        a texture painter from GRAIN (the paper's tooth shows through); leave out for a smooth stroke
     fixed, lift  one fixed colour (pencil, charcoal) or a paler version of the picked colour (chalk, glow)
     wet          0 to 1: how much the stroke smears and picks up the paint under it
     mix          'spectral' = wet paint, mixes like real paint (spectral.js) / 'stack' = dry, lies on top
     paper        how each STOCKS paper reacts: {spread: wider, soak: bigger wash and blooms, tooth: rougher}.
                  always:1 = also when "Paint mixes" is off (the v1.6b look). The rest only shows with it on.
     press        S Pen pressure: [width at lightest, width at hardest, curve]
     sound        which rub sound plays (RUBS in core.js)
     steps        three small class steps (shown in the Art box under "How to use it")
     halo, bloom, shine, aura, sparkle   extra looks; glows / glitters tag the piece for Little Town at night
   To add a medium: add one recipe here (plus a GRAIN painter if it needs its own texture). Nothing else. */
const MEDIUMS={
  pencil:{em:'✏️',name:'Pencil',w:2.4,a:.86,fixed:'rgb(50,50,58)',wet:0,mix:'stack',press:[.55,1.6,1.3],sound:'pencil',paper:{sketch:{tooth:.8},board:{tooth:1.35},kraft:{tooth:1.2}},
    steps:['Hold it lightly and sketch with soft lines first.','Press harder for dark lines. Go over the ones you like.','Shade by laying lines side by side.']},
  cpencil:{em:'🌈',name:'Coloured pencils',w:3.2,a:.95,grain:'fine',wet:0,mix:'stack',press:[.6,1.5,1.2],sound:'pencil',paper:{sketch:{tooth:.8},board:{tooth:1.35},kraft:{tooth:1.2}},
    steps:['Colour lightly in one direction.','Go over it again to make the colour deeper.','Lay one colour over another: the top one sits on the first.']},
  marker:{em:'🖊️',name:'Markers',w:7,a:.72,wet:.15,mix:'stack',press:[.85,1.15,1],sound:'marker',paper:{water:{spread:1.12},board:{spread:1.08},kraft:{spread:1.08}},
    steps:['Draw the outline in one steady line.','Fill with strokes that all go the same way.','Going over a spot twice makes it darker.']},
  crayon:{em:'🖍️',name:'Crayons',w:8,a:1,grain:'wax',wet:0,mix:'stack',press:[.7,1.3,1],sound:'crayon',paper:{sketch:{tooth:.85},board:{tooth:1.4},kraft:{tooth:1.25},water:{tooth:1.2}},
    steps:['Rub lightly: the paper shows through the wax.','Press hard for bright, solid colour.','Bumpy paper gives more speckles.']},
  water:{em:'💧',name:'Watercolour',w:15,a:.13,wet:1,mix:'spectral',press:[.5,1.5,1],sound:'brush',halo:{a:.05,w:1.6},bloom:{p:.15,r:.8,a:.07},paper:{water:{spread:1.35,soak:1,always:1},sketch:{soak:.3},card:{spread:.92},board:{spread:.9,soak:.5},kraft:{soak:.4}},
    steps:['Brush a pale wash first. Watercolour is see-through.','Go over it to build the colour up in layers.','Paint one colour over another: blue over yellow turns green.']},
  poster:{em:'🎨',name:'Poster paint',w:11,a:1,wet:.7,mix:'spectral',press:[.6,1.4,1],sound:'brush',shine:{a:.18,w:2,dx:-2.5,dy:-2.5},paper:{water:{spread:1.1},board:{spread:.95}},
    steps:['Poster paint is thick and covers what is under it.','Drag the brush through another colour and it smears along.','Mix two colours on the palette to make a new one.']},
  charcoal:{em:'⚫',name:'Charcoal',w:9,a:.9,grain:'char',fixed:'#26221f',wet:0,mix:'stack',press:[.5,1.5,1],sound:'chalk',paper:{sketch:{tooth:.85},board:{tooth:1.3},kraft:{tooth:1.2},water:{tooth:1.25}},
    steps:['Use the side for big soft shadows.','Use the tip for dark lines.','Leave the paper bare for the light parts.']},
  chalk:{em:'☁️',name:'Chalk pastels',w:11,a:.92,grain:'chalk',lift:.3,wet:0,mix:'stack',press:[.6,1.4,1],sound:'chalk',paper:{black:{tooth:.9},board:{tooth:1.3},kraft:{tooth:1.2}},
    steps:['Chalk is soft and dusty. Colour with light strokes.','It shows best on dark paper. Try black art paper.','Layer a light colour over a dark one.']},
  oil:{em:'🧈',name:'Oil pastels',w:10,a:1,grain:'oil',wet:.1,mix:'stack',press:[.7,1.3,1],sound:'crayon',shine:{a:.35,w:2,lift:.45,dx:-2,dy:-1.5},paper:{board:{tooth:1.2}},
    steps:['Press firmly: oil pastels are thick and bright.','Fill a shape with solid colour.','Add a second colour on top for a bold edge.']},
  gel:{em:'🖋️',name:'Gel pen',w:3.4,a:1,wet:0,mix:'stack',press:[.7,1.35,1],sound:'pencil',shine:{a:.4,w:1,dx:-.7,dy:-.7},
    steps:['Gel pens make smooth, shiny lines.','They show up well on dark paper.','Use them last, for details on top.']},
  glitter:{em:'✨',name:'Glitter pen',w:5,a:.55,wet:0,mix:'stack',press:[.8,1.25,1],sound:'marker',sparkle:1,glitters:1,
    steps:['Draw slowly so the sparkles spread out.','Use it for stars, crowns and treasure.','Glitter pieces twinkle in Little Town.']},
  glow:{em:'🌟',name:'Glow pen',w:6,a:.95,lift:.45,wet:0,mix:'stack',press:[.8,1.25,1],sound:'marker',aura:{a:.14,w:2.6},glows:1,
    steps:['Glow pens draw a bright line with a soft halo.','Try them on black art paper.','Glow pieces light up in Little Town at night.']},
  /* Phase 2 (Nov 23): yarn and clay on the desk. Yarn lays a twisted strand; clay is thick, matte, soft and smears into the clay under it. */
  yarn:{em:'🧶',name:'Yarn',w:9,a:1,grain:'twist',wet:0,mix:'stack',press:[.8,1.25,1],sound:'crayon',edge:{a:.32,w:1.25},shine:{a:.28,w:2,lift:.45,dx:-1.6,dy:-1.6},paper:{felt:{tooth:1.1},knit:{tooth:1.1}},
    steps:['Lay the yarn down slowly in one long line, like gluing string.','Curl it round and round to fill a shape, like a snail shell.','Lay a second colour right next to the first so the strands touch.']},
  clay:{em:'🟤',name:'Clay',w:13,a:1,grain:'clay',wet:.35,mix:'spectral',press:[.7,1.45,1],sound:'glue',edge:{a:.22,w:1.18},shine:{a:.2,w:3,lift:.5,dx:-2.5,dy:-2.5},paper:{clayslab:{spread:1.1},board:{tooth:1.1}},
    steps:['Press the clay on with your thumb: it goes on thick and soft.','Smear one colour into another and they mix, like real clay.','Leave a few thumbprints. Clay looks best a little bumpy.']}};
/* MEDIA is the old v1.6b name. It is the same list, kept so older code and saves keep working. */
const MEDIA=MEDIUMS;
const MCOLS=['#26221f','#e8443a','#f28a2e','#f7d23e','#5bbf5a','#2d8a57','#4fb3e8','#3767bb','#8b5cb6','#f38bb3','#8b5a3c','#ffffff'];
const STOCKS={
  con:{em:'📄',name:'Construction paper',tip:'Bright and soft. Good for everything.'},
  sketch:{em:'📝',name:'Sketch paper',tip:'Smooth with a fine tooth. Great for pencils.',col:'#fbf8f0'},
  water:{em:'💧',name:'Watercolour paper',tip:'Bumpy and thirsty. Paint spreads wider.',col:'#fdfbf4'},
  card:{em:'🗂️',name:'Cardstock',tip:'Thick and stiff, with a crisp edge.'},
  lined:{em:'📓',name:'Lined notebook paper',tip:'Blue lines and a red margin, like school.',col:'#fdfcf7'},
  board:{em:'📦',name:'Cardboard',tip:'Corrugated box cardboard. Sturdy.',col:'#c9a06a'},
  kraft:{em:'🛍️',name:'Kraft paper',tip:'Brown paper-bag fibres show through.'},
  black:{em:'🌑',name:'Black art paper',tip:'Made for chalk, gel pens and glow.',col:'#1f1f27'},
  trace:{em:'🪟',name:'Tracing paper',tip:'See-through. Lay it on top to copy.'},
  glit:{em:'💎',name:'Glitter card',tip:'Sparkles all over.'},
  glowp:{em:'🌙',name:'Glow paper',tip:'Pale green. Glows in Little Town at night.',col:'#d8f5c2'},
  felt:{em:'🟩',name:'Felt',tip:'Soft, fuzzy fabric. Great with yarn.'},
  knit:{em:'🧣',name:'Knitted fabric',tip:'Little knit stitches, like a cosy sweater.'},
  clayslab:{em:'🟫',name:'Clay slab',tip:'A rolled-out slab of clay. Press clay onto it.'}};
const AB=Object.assign({med:'pencil',col:'#26221f',stock:'con'},LS.get('artbox',{}));
if(!MEDIA[AB.med])AB.med='pencil';
if(!STOCKS[AB.stock])AB.stock='con';
const saveAB=()=>LS.set('artbox',AB);
function hexRGB(h){const m=/^#?([0-9a-f]{6})$/i.exec(h||'');if(!m){const r=/(\d+)\D+(\d+)\D+(\d+)/.exec(h||'');return r?[+r[1],+r[2],+r[3]]:[60,60,60]}const n=parseInt(m[1],16);return[n>>16,n>>8&255,n&255]}
function liftCol(h,k){const c=hexRGB(h);return'rgb('+c.map(v=>Math.round(v+(255-v)*k)).join(',')+')'}
/* grain masks: alpha noise, 64x64, made once, the first time a grain medium is used (T024: not at start-up, so the page opens faster) */
const GRAIN={};
function grainInit(){if(GRAIN.fine)return;const R=mulberry(1606);const mk=(fn)=>{const c=mkCanvas(64,64),x=c._x,d=x.createImageData(64,64);for(let y=0;y<64;y++)for(let i=0;i<64;i++)d.data[(y*64+i)*4+3]=clamp(fn(i,y,R)*255,0,255);x.putImageData(d,0,0);return c};
  GRAIN.fine=mk((i,y,R)=>R()<.3?0:.45+R()*.55);
  const rows=[...Array(64)].map(()=>R());GRAIN.wax=mk((i,y,R)=>{const s=rows[(y+(i>>3))&63];return R()<.22+s*.3?0:.7+R()*.3});
  GRAIN.chalk=mk((i,y,R)=>R()<.45?0:.5+R()*.5);
  GRAIN.char=mk((i,y,R)=>R()<.3?R()*.25:.55+R()*.45);
  GRAIN.oil=mk((i,y,R)=>R()<.1?.2:.85+R()*.15)}
/* ---- T024: yarn and felt textures, from Mythic Forge's materials.js (same owner, repo MajorasPride/titan-clash, myth-forge/materials.js).
   The four painters are copied from there (felt, knit, stitched, burlap) and turned into grain masks. They are made the first time a recipe asks for them. */
const GRAIN_PAINT={
  felt(x,S,R){x.fillStyle='#cfcfcf';x.fillRect(0,0,S,S);x.lineCap='round';for(let i=0;i<14000;i++){const px=R(0,S),py=R(0,S),a=R(0,7),l=R(3,9),v=(R(150,245))|0;x.strokeStyle='rgba('+v+','+v+','+v+',.35)';x.lineWidth=R(.6,1.4);x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+R(-4,4),py+R(-4,4),px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke()}},
  knit(x,S,R){x.fillStyle='#9a9a9a';x.fillRect(0,0,S,S);const w=32,h=28;for(let j=0;j<S/h;j++)for(let i=0;i<S/w;i++){const cx=i*w+w/2,cy=j*h;for(const s of[-1,1]){const g=x.createLinearGradient(cx,cy,cx+s*w*.45,cy+h);g.addColorStop(0,'#e8e8e8');g.addColorStop(1,'#a8a8a8');x.fillStyle=g;x.beginPath();x.ellipse(cx+s*w*.24,cy+h*.55,w*.22,h*.62,s*-.5,0,7);x.fill();x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=1.5;x.stroke()}}},
  burlap(x,S,R){x.fillStyle='#a8a8a8';x.fillRect(0,0,S,S);for(let i=0;i<S;i+=10){const v=(R(170,230))|0;x.fillStyle='rgb('+v+','+v+','+v+')';x.fillRect(i+R(-1,1),0,R(5,7),S)}for(let j=0;j<S;j+=10)for(let i=0;i<S;i+=20){const v=(R(160,225))|0;x.fillStyle='rgb('+v+','+v+','+v+')';x.fillRect(i+((j/10)%2)*10,j+R(-1,1),10,R(5,7))}for(let i=0;i<1200;i++){x.strokeStyle='rgba(255,255,255,.18)';x.lineWidth=.7;const px=R(0,S),py=R(0,S);x.beginPath();x.moveTo(px,py);x.lineTo(px+R(-8,8),py+R(-8,8));x.stroke()}},
  stitched(x,S,R){GRAIN_PAINT.felt(x,S,R);x.setLineDash([12,8]);x.strokeStyle='rgba(255,255,255,.85)';x.lineWidth=3.5;for(const y of[64,192,320,448]){x.beginPath();x.moveTo(0,y);for(let xx=0;xx<=S;xx+=64)x.lineTo(xx,y+Math.sin(xx*.05)*6);x.stroke()}x.setLineDash([]);for(let i=0;i<6;i++){const px=R(40,S-40),py=R(40,S-40);x.strokeStyle='rgba(0,0,0,.4)';x.lineWidth=3;for(const d of[-1,1]){x.beginPath();x.moveTo(px-9,py-9*d);x.lineTo(px+9,py+9*d);x.stroke()}}},
  /* Phase 2: the twisted ply of a yarn strand (light bands with dark grooves, on a slant) */
  twist(x,S,R){x.fillStyle='#d8d8d8';x.fillRect(0,0,S,S);x.save();x.translate(S/2,S/2);x.rotate(-.75);for(let i=-S;i<S;i+=26){const g=x.createLinearGradient(i,0,i+26,0);g.addColorStop(0,'#8a8a8a');g.addColorStop(.25,'#f2f2f2');g.addColorStop(.7,'#c4c4c4');g.addColorStop(1,'#7a7a7a');x.fillStyle=g;x.fillRect(i,-S,26,S*2)}x.restore();for(let i=0;i<2600;i++){const v=(R(170,250))|0;x.strokeStyle='rgba('+v+','+v+','+v+',.35)';x.lineWidth=R(.5,1.1);const px=R(0,S),py=R(0,S);x.beginPath();x.moveTo(px,py);x.lineTo(px+R(-5,5),py+R(-5,5));x.stroke()}},
  /* Phase 2: clay: matte and soft, with thumbprint dents and a few tool marks */
  clay(x,S,R){x.fillStyle='#e2e2e2';x.fillRect(0,0,S,S);for(let i=0;i<60;i++){const px=R(0,S),py=R(0,S),r=R(14,46),g=x.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,'rgba(150,150,150,.5)');g.addColorStop(1,'rgba(150,150,150,0)');x.fillStyle=g;x.beginPath();x.arc(px,py,r,0,7);x.fill()}for(let f=0;f<5;f++){const px=R(60,S-60),py=R(60,S-60),a=R(0,7);x.strokeStyle='rgba(120,120,120,.35)';x.lineWidth=1.6;for(let k=1;k<9;k++){x.beginPath();x.ellipse(px,py,k*3.2,k*2.4,a,0,7);x.stroke()}}for(let i=0;i<1800;i++){const v=(R(200,255))|0;x.fillStyle='rgba('+v+','+v+','+v+',.4)';x.fillRect(R(0,S),R(0,S),R(1,2.4),R(1,2.4))}}};
/* a grain mask by name: the v1.6b ones are made at start-up (above); painter ones (512 px grey tiles) are shrunk to 128 px and their brightness becomes the mask */
function grainMask(gk){grainInit();if(GRAIN[gk])return GRAIN[gk];const P=GRAIN_PAINT[gk];if(!P)return GRAIN.fine;const S=512,big=mkCanvas(S,S),r0=mulberry(2024+gk.length*31),R=(a,b)=>a+r0()*(b-a);P(big._x,S,R);
  const c=mkCanvas(128,128,true),x=c._x;x.drawImage(big,0,0,128,128);const d=x.getImageData(0,0,128,128);for(let i=0;i<d.data.length;i+=4){const v=(d.data[i]+d.data[i+1]+d.data[i+2])/3;d.data[i+3]=clamp((v-70)*1.5,0,255);d.data[i]=d.data[i+1]=d.data[i+2]=0}x.putImageData(d,0,0);return GRAIN[gk]=c}
const GPAT={};
function grainPat(c,gk,col){const k=gk+col;let t=GPAT[k];if(!t){const G=grainMask(gk);t=mkCanvas(G.width,G.height);t._x.fillStyle=col;t._x.fillRect(0,0,G.width,G.height);t._x.globalCompositeOperation='destination-in';t._x.drawImage(G,0,0);GPAT[k]=t}return c.createPattern(t,'repeat')}
/* ---- T024: colours that really mix (spectral.js, MIT, lib/spectral.js). Wet mediums (mix:'spectral') mix with the paint under them and smear it along the stroke.
   Settings > Paint mixes turns it off: then every medium draws exactly as in v1.6b. */
function blendOn(){return SET.blend!==false}
const SMIXC=new Map();
/* mix two colours [r,g,b] like paint. t = how much of b (0 to 1). */
function smix(a,b,t){if(t<=.004)return a;if(t>=.996)return b;if(typeof spectral==='undefined')return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
  const q=v=>clamp(Math.round(v/3)*3,0,255),A=[q(a[0]),q(a[1]),q(a[2])],B=[q(b[0]),q(b[1]),q(b[2])],T=Math.round(t*24)/24,k=A.join()+'|'+B.join()+'|'+T;let r=SMIXC.get(k);
  if(!r){try{r=spectral.mix([new spectral.Color(A),1-T],[new spectral.Color(B),T]).sRGB.slice(0,3)}catch(e){r=[A[0]+(B[0]-A[0])*T,A[1]+(B[1]-A[1])*T,A[2]+(B[2]-A[2])*T]}if(SMIXC.size>6000)SMIXC.clear();SMIXC.set(k,r)}return r}
const rgbCss=c=>'rgb('+Math.round(c[0])+','+Math.round(c[1])+','+Math.round(c[2])+')';
const rgbHex=c=>'#'+c.map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');
const cdist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
/* the colour of a medium as it lands on paper (pencil and charcoal are fixed, chalk and glow are paler) */
function medCol(m,col){const M=MEDIUMS[m]||MEDIUMS.pencil;return M.fixed||(M.lift?liftCol(col,M.lift):col)}
/* start a stroke: B is what is on the tip. paper = the sheet's colour (so bare paper does not count as paint), tip = a brush shape from the desk, dirt = old paint left on a brush. */
function strokeStart(m,col,paper,tip,dirt){let base=hexRGB(medCol(m,col));if(dirt&&blendOn())base=smix(base,dirt,.3);return{m,base,load:base.slice(),paper:paper?hexRGB(paper):null,tip:tip||null,pick:null,amt:0,picked:0}}
/* what is on the canvas at a point (in the canvas's own drawing space): {c:[r,g,b], a:0..1} */
function underAt(c,q){try{const T=c.getTransform(),x=Math.round(T.a*q.x+T.c*q.y+T.e),y=Math.round(T.b*q.x+T.d*q.y+T.f),d=c.getImageData(x-1,y-1,3,3).data;let r=0,g2=0,b=0,n=0;for(let i=0;i<36;i+=4){const a=d[i+3];if(a>20){r+=d[i]*a;g2+=d[i+1]*a;b+=d[i+2]*a;n+=a}}return n?{c:[r/n,g2/n,b/n],a:Math.min(1,n/(255*5))}:null}catch(e){return null}}
/* is the paint under the tip just a paler wash of the tip's own colour? Then it is not mixed or picked up: going over your own wash builds the colour up, as before. */
function samePaint(u,B){if(!B.paper)return cdist(u,B.base)<26;const d=[B.base[0]-B.paper[0],B.base[1]-B.paper[1],B.base[2]-B.paper[2]],v=[u[0]-B.paper[0],u[1]-B.paper[1],u[2]-B.paper[2]],dd=d[0]*d[0]+d[1]*d[1]+d[2]*d[2];if(dd<1)return false;const t=(v[0]*d[0]+v[1]*d[1]+v[2]*d[2])/dd;return t>-.1&&t<1.25&&Math.hypot(v[0]-t*d[0],v[1]-t*d[1],v[2]-t*d[2])<20}
/* one step of a wet stroke: look just ahead of the tip, pick some of that paint up (smear), and give back the colour to lay down */
function blendStep(c,M,B,pts,w){const b=pts[pts.length-1],a=pts.length>1?pts[pts.length-2]:null;let q=b;if(a){const d=Math.hypot(b.x-a.x,b.y-a.y)||1,f=(w/2+2)/d;q={x:b.x+(b.x-a.x)*f,y:b.y+(b.y-a.y)*f}}
  const u=underAt(c,q);let s=0;if(u){s=u.a;if(B.paper)s*=clamp((cdist(u.c,B.paper)-26)/80,0,1);if(cdist(u.c,B.load)<12||samePaint(u.c,B))s=0}
  /* B.pick = the paint picked up so far, B.amt = how much of the tip it covers. It wears off as the stroke goes on. */
  if(s>0){const add=(1-B.amt)*M.wet*.3*s,n=B.amt+add,f=add/n;B.pick=B.pick?[0,1,2].map(i=>B.pick[i]+(u.c[i]-B.pick[i])*f):u.c.slice();B.amt=n;if(s>.25)B.picked=1}
  B.amt*=1-(.06+(1-M.wet)*.2);if(B.amt<.012)B.amt=0;
  B.load=B.amt>0?smix(B.base,B.pick,B.amt):B.base;
  B.s=s;/* how strongly this step is mixing: thin paints (watercolour) go on a bit heavier there, so the new colour shows */
  return rgbCss(s>0?smix(B.load,u.c,M.wet*.5*s):B.load)}
function medPaper(M,stock,real){if(stock===true)stock='water';const R=M.paper&&stock&&M.paper[stock];return R&&(real||R.always)?R:null}
/* S Pen pressure (0 to 1) to a width factor, from the recipe */
function pressK(m,p){const M=MEDIUMS[m]||MEDIUMS.pencil,pr=M.press||[.7,1.3,1];return pr[0]+(pr[1]-pr[0])*Math.pow(clamp(p,0,1),pr[2]||1)}
/* draw one bit of a stroke (pts in the canvas's own space). k scales the width. stock: the paper's stock id (true = watercolour paper, the old call).
   B (from strokeStart) turns on real mixing, brush shapes and paper feel when Paint mixes is on. Without B, or with it off, this draws exactly as v1.6b did. */
function medSeg(c,m,col,pts,k,stock,B){const M=MEDIUMS[m]||MEDIUMS.pencil,real=!!(B&&blendOn()),R=medPaper(M,stock,real),tip=real&&B.tip,tk=tip?tip.k:1,spread=R&&R.spread||1,soak=R&&R.soak||0;k=k||1;col=medCol(m,col);
  if(real&&M.mix==='spectral')col=blendStep(c,M,B,pts,M.w*k*spread*tk);else if(real&&cdist(B.base,hexRGB(col))>2)col=rgbCss(B.base);
  c.lineCap=tip&&tip.flat?'square':'round';c.lineJoin='round';
  const path=(dx,dy)=>{c.beginPath();pts.forEach((q,i)=>i?c.lineTo(q.x+dx,q.y+dy):c.moveTo(q.x+dx,q.y+dy));if(pts.length===1)c.lineTo(pts[0].x+dx+.1,pts[0].y+dy)};
  const b=pts[pts.length-1],W0=M.w*k*tk;c.globalAlpha=Math.min(1,M.a*(real&&R&&R.tooth>1?clamp(1/R.tooth,.55,1):1)*(real&&M.mix==='spectral'&&B.s?1+B.s*1.3:1));c.lineWidth=W0*spread;c.strokeStyle=M.grain?grainPat(c,real&&R&&R.tooth>1.3&&M.grain==='fine'?'wax':M.grain,col):col;path(0,0);c.stroke();
  if(tip&&tip.flat){c.globalAlpha=tip.knife?.22:.12;c.lineWidth=Math.max(1,W0*.08);c.strokeStyle=tip.knife?'#fff':liftCol(col,.5);const n=pts.length>1?Math.atan2(b.y-pts[0].y,b.x-pts[0].x)+Math.PI/2:0;for(const o of[-.3,.05,.32]){path(Math.cos(n)*W0*o,Math.sin(n)*W0*o);c.stroke()}c.lineCap='round'}
  if(M.edge){const E=M.edge,gc=c.globalCompositeOperation;c.globalCompositeOperation='destination-over';c.globalAlpha=E.a;c.lineWidth=W0*spread*E.w;c.strokeStyle='rgba(40,25,15,.9)';path(.6*k,.9*k);c.stroke();c.globalCompositeOperation=gc}/* Phase 2: yarn and clay sit on the paper with a soft dark edge */
  if(M.halo){c.globalAlpha=M.halo.a;c.lineWidth=W0*(M.halo.w+soak*.6);c.strokeStyle=col;path(0,0);c.stroke()}
  if(M.bloom&&Math.random()<M.bloom.p*(1+soak)){const r=W0*(.6+Math.random()*(M.bloom.r+soak*.6)),gr=c.createRadialGradient(b.x,b.y,0,b.x,b.y,r);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.75,col);gr.addColorStop(1,'rgba(0,0,0,0)');c.globalAlpha=M.bloom.a;c.fillStyle=gr;c.beginPath();c.arc(b.x,b.y,r,0,TAU);c.fill()}
  if(M.shine){const S=M.shine;c.globalAlpha=S.a;c.lineWidth=S.w*k;c.strokeStyle=S.lift?liftCol(col,S.lift):'#fff';path(S.dx*k,S.dy*k);c.stroke()}
  if(M.aura){c.globalAlpha=M.aura.a;c.lineWidth=W0*M.aura.w;c.strokeStyle=col;path(0,0);c.stroke()}
  if(M.sparkle){const sp=[ '#fff',liftCol(col,.6),col,'#ffe9a8'];for(let i=0;i<4;i++){const a=Math.random()*TAU,r=Math.random()*M.w*k*.9;c.globalAlpha=.75+Math.random()*.25;c.fillStyle=sp[i];c.beginPath();c.arc(b.x+Math.cos(a)*r,b.y+Math.sin(a)*r,(.5+Math.random()*1.1)*k,0,TAU);c.fill()}}
  c.globalAlpha=1}
function medNote(o,m,col){const M=MEDIUMS[m]||{};o.m=o.m||[];if(!o.m.includes(m))o.m.push(m);if(M.glows)o.glow=liftCol(col,.45);if(M.glitters)o.gl=1}
function medMark(p){if(!p.med)p.med={m:[]};medNote(p.med,AB.med,AB.col)}
function medCopy(o){return o?JSON.parse(JSON.stringify(o)):undefined}
function medMerge(list){const o={m:[]};list.forEach(q=>{const s=q&&q.med;if(!s)return;(s.m||[]).forEach(m=>{if(!o.m.includes(m))o.m.push(m)});if(s.glow&&!o.glow)o.glow=s.glow;if(s.gl)o.gl=1;if(s.stock&&!o.stock)o.stock=s.stock});return o.m.length||o.stock||o.glow||o.gl?o:undefined}
function medLabel(o){if(!o)return'';const a=(o.m||[]).map(m=>MEDIA[m]?MEDIA[m].name:m);if(o.stock&&o.stock!=='con'&&STOCKS[o.stock])a.push('on '+STOCKS[o.stock].name.toLowerCase());return a.join(', ')}
/* paper stocks: texture laid on a fresh sheet */
function stockTex(art,sk,col,p){const x=art._x,W2=art.width,H2=art.height,R=mulberry(W2*7+H2);x.save();
  if(sk==='sketch'){for(let i=0;i<W2*H2/40;i++){x.fillStyle=R()<.5?'rgba(0,0,0,.035)':'rgba(255,255,255,.08)';x.fillRect(R()*W2,R()*H2,1,1)}}
  else if(sk==='water'){for(let i=0;i<W2*H2/140;i++){const px=R()*W2,py=R()*H2,r=2+R()*5;x.fillStyle=R()<.5?'rgba(0,0,0,.035)':'rgba(255,255,255,.12)';x.beginPath();x.arc(px,py,r,0,TAU);x.fill()}x.strokeStyle='rgba(0,0,0,.05)';x.lineWidth=3;for(let i=0;i<14;i++){x.beginPath();x.moveTo(R()*W2,0);x.lineTo(R()*W2,H2);x.stroke()}}
  else if(sk==='card'){x.strokeStyle='rgba(0,0,0,.14)';x.lineWidth=5;x.strokeRect(2.5,2.5,W2-5,H2-5);const gr=x.createLinearGradient(0,0,W2,H2);gr.addColorStop(0,'rgba(255,255,255,.16)');gr.addColorStop(.5,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(0,0,0,.06)');x.fillStyle=gr;x.fillRect(0,0,W2,H2)}
  else if(sk==='lined'){x.strokeStyle='rgba(80,140,210,.45)';x.lineWidth=1.4;for(let y=46;y<H2;y+=22){x.beginPath();x.moveTo(0,y);x.lineTo(W2,y);x.stroke()}x.strokeStyle='rgba(220,80,80,.6)';x.lineWidth=1.6;x.beginPath();x.moveTo(42,0);x.lineTo(42,H2);x.stroke()}
  else if(sk==='board'){for(let i=0;i<W2;i+=7){x.fillStyle=i%14?'rgba(90,55,20,.08)':'rgba(255,235,200,.1)';x.fillRect(i,0,3.5,H2)}for(let i=0;i<W2*H2/300;i++){x.fillStyle='rgba(70,40,10,.12)';x.fillRect(R()*W2,R()*H2,1+R()*2,1)}x.strokeStyle='rgba(90,55,20,.35)';x.lineWidth=4;x.strokeRect(2,2,W2-4,H2-4)}
  else if(sk==='kraft'){x.globalCompositeOperation='multiply';x.fillStyle='#d2ab73';x.fillRect(0,0,W2,H2);x.globalCompositeOperation='source-over';for(let i=0;i<W2*H2/260;i++){const px=R()*W2,py=R()*H2,a=R()*TAU,l=3+R()*9;x.strokeStyle=R()<.5?'rgba(90,55,20,.22)':'rgba(255,240,210,.22)';x.lineWidth=.8;x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke()}}
  else if(sk==='black'){for(let i=0;i<W2*H2/60;i++){x.fillStyle='rgba(255,255,255,.04)';x.fillRect(R()*W2,R()*H2,1,1)}}
  else if(sk==='trace'){x.clearRect(0,0,W2,H2);x.fillStyle=liftCol(col,.35);x.globalAlpha=.62;x.fillRect(0,0,W2,H2);x.globalAlpha=1;x.fillStyle='rgba(255,255,255,.18)';x.fillRect(0,0,W2,H2)}
  else if(sk==='glit'){for(let i=0;i<W2*H2/55;i++){x.globalAlpha=.35+R()*.6;x.fillStyle=['#fff','#ffe9a8','#f9d5ff','#c9f1ff'][i&3];x.fillRect(R()*W2,R()*H2,1+R()*1.6,1+R()*1.6)}p.med.gl=1}
  else if(sk==='felt'){x.globalAlpha=.16;x.fillStyle=grainPat(x,'felt','#000');x.fillRect(0,0,W2,H2);x.globalAlpha=.22;x.fillStyle=grainPat(x,'felt','#fff');x.translate(3,2);x.fillRect(-3,-2,W2,H2);x.translate(-3,-2);x.globalAlpha=1}
  else if(sk==='knit'){x.globalAlpha=.26;x.fillStyle=grainPat(x,'knit','#000');x.fillRect(0,0,W2,H2);x.globalAlpha=1}
  else if(sk==='clayslab'){x.globalAlpha=.2;x.fillStyle=grainPat(x,'clay','#000');x.fillRect(0,0,W2,H2);x.globalAlpha=1;x.strokeStyle='rgba(60,35,15,.25)';x.lineWidth=6;x.strokeRect(3,3,W2-6,H2-6)}
  else if(sk==='glowp'){x.fillStyle='rgba(255,255,255,.12)';x.fillRect(0,0,W2,H2);p.med.glow='#d8ffb0'}
  x.restore()}
function stockPaper(color){const S=STOCKS[AB.stock]||STOCKS.con;return S.col||color}
function afterPlacePaper(){const p=C.sel;if(!p)return;p.med={m:[],stock:AB.stock};if(AB.stock!=='con')stockTex(p.art,AB.stock,p.color,p);p.art._url=null;p.dirty=true}
/* sample strokes for the art box */
function medSample(cvs,m,col,stockCol){const w=cvs.width,h=cvs.height,x=cvs.getContext('2d');x.fillStyle=stockCol||'#fbf6ea';x.fillRect(0,0,w,h);let last=null;for(let i=0;i<=40;i++){const t=i/40,q={x:10+t*(w-20),y:h/2+Math.sin(t*TAU*1.2)*h*.22};medSeg(x,m,col,last?[last,q]:[q],h/60);last=q}}
function artBoxDlg(){const S=STOCKS[AB.stock];
  dlg('<h2>🎨 Art box</h2><p style="margin:2px 0 6px;font-size:13px">Pick what to draw with, then a colour.</p><div class="mgrid">'+Object.keys(MEDIA).map(m=>'<button class="mbtn'+(AB.med===m?' on':'')+'" data-m="'+m+'"><canvas width="150" height="44"></canvas><span>'+MEDIA[m].em+' '+MEDIA[m].name+'</span></button>').join('')+'</div><div class="mcols">'+MCOLS.map(c=>'<button class="mcol'+(AB.col===c?' on':'')+'" data-c="'+c+'" style="background:'+c+'" aria-label="colour '+c+'"></button>').join('')+'</div><p id="abNote" style="font-size:12px;opacity:.8;margin:6px 0 0"></p><div class="btns"><button id="dYes">Draw with it</button></div>',d=>{
    const paint=()=>{d.querySelectorAll('.mbtn').forEach(b=>{medSample(b.querySelector('canvas'),b.dataset.m,AB.col,AB.stock==='black'?'#1f1f27':null);b.classList.toggle('on',b.dataset.m===AB.med)});d.querySelectorAll('.mcol').forEach(b=>b.classList.toggle('on',b.dataset.c===AB.col));const M=MEDIA[AB.med];d.querySelector('#abNote').innerHTML=(M.fixed?esc(M.name)+' only comes in one colour.<br>':'')+(M.steps?'<b>How to use it</b><br>'+M.steps.map((t,i)=>(i+1)+'. '+esc(t)).join('<br>'):'')};
    d.querySelectorAll('.mbtn').forEach(b=>b.onclick=()=>{AB.med=b.dataset.m;saveAB();SFX.tick();paint()});d.querySelectorAll('.mcol').forEach(b=>b.onclick=()=>{AB.col=b.dataset.c;saveAB();SFX.tick();paint()});
    d.querySelector('#dYes').onclick=()=>{closeDlg();dsPutAway();/* T024: the Art box takes over from a desk supply */C.tool='pencil';renderChips()};paint()})}
function stockDlg(){dlg('<h2>📄 Paper stock</h2><p style="margin:2px 0 6px;font-size:13px">The next sheet comes out on this paper. Then pick a colour.</p>'+Object.keys(STOCKS).map(k=>'<button class="les'+(AB.stock===k?' on':'')+'" data-k="'+k+'"><span>'+STOCKS[k].em+' '+STOCKS[k].name+'<small>'+STOCKS[k].tip+'</small></span><i>'+(AB.stock===k?'✔':'▶')+'</i></button>').join('')+'<div class="btns"><button class="alt" id="dNo">Close</button></div>',d=>{d.querySelector('#dNo').onclick=closeDlg;d.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{AB.stock=b.dataset.k;saveAB();SFX.tick();closeDlg();renderChips();toast(STOCKS[AB.stock].name+': pick a colour')})})}
/* ---- Little Town: glow at night, glitter sparkles ---- */
function townFx(it,r,t){const toy=toyById(it.toy),o=toy&&toy.med;if(!o)return;
  if(o.glow){const k=nightK();if(k>.08){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,k)*.6*(.9+.1*Math.sin(t*2+it.x));g.shadowColor=o.glow;g.shadowBlur=26;drawItem(g,it,t,0);g.restore()}}
  if(o.gl){g.save();for(let i=0;i<7;i++){const h=Math.sin(it.x*12.9898+it.y*78.233+i*37.719)*43758.5453,u=h-Math.floor(h),v=(h*7.13)-Math.floor(h*7.13),tw=Math.sin(t*(2.2+u*2)+i*2.1);if(tw<.35)continue;const a=(tw-.35)/.65,sx=r.x+r.w*(.12+u*.76),sy=r.y+r.h*(.12+v*.76),s=(3+5*a)*Math.max(.6,it.s);g.globalAlpha=a;g.fillStyle='#fff';g.beginPath();g.moveTo(sx,sy-s);g.quadraticCurveTo(sx,sy,sx+s,sy);g.quadraticCurveTo(sx,sy,sx,sy+s);g.quadraticCurveTo(sx,sy,sx-s,sy);g.quadraticCurveTo(sx,sy,sx,sy-s);g.fill()}g.restore()}}
/* ---- Toy Box: medium tags and filter ---- */
function assetMed(a){const t=a.ref&&toyById(a.ref);return t?t.med:a.med}
function boxMedRow(){let row=$('#boxMed');if(!row){row=document.createElement('div');row.id='boxMed';$('#boxTypes').after(row)}const have=new Set();LIB.forEach(a=>{const o=assetMed(a);(o&&o.m||[]).forEach(m=>have.add(m))});
  if(!have.size){row.innerHTML='';row.style.display='none';if(BOXF.m)BOXF.m='';return}row.style.display='';if(BOXF.m&&!have.has(BOXF.m))BOXF.m='';
  row.innerHTML='<b>Medium</b>'+['']. concat(Object.keys(MEDIA).filter(m=>have.has(m))).map(m=>'<button data-md="'+m+'" class="'+((BOXF.m||'')===m?'on':'')+'">'+(m?MEDIA[m].em+' '+MEDIA[m].name:'Any')+'</button>').join('');
  row.querySelectorAll('[data-md]').forEach(b=>b.onclick=()=>{BOXF.m=b.dataset.md;SFX.tick();renderBox()})}
function boxMedOk(a){if(!BOXF.m)return true;const o=assetMed(a);return!!(o&&o.m&&o.m.includes(BOXF.m))}
function assetMedHTML(a){const t=a.ref&&toyById(a.ref);if(!t)return'';const o=t.med||{m:[]};return'<label class="lb">Medium (tap to tag)</label><div class="mtags">'+Object.keys(MEDIA).map(m=>'<button type="button" data-mt="'+m+'" class="'+((o.m||[]).includes(m)?'on':'')+'">'+MEDIA[m].em+' '+MEDIA[m].name+'</button>').join('')+'</div>'+(o.stock&&o.stock!=='con'?'<p style="font-size:12px;margin:4px 0 0">Paper: '+STOCKS[o.stock].em+' '+STOCKS[o.stock].name+'</p>':'')}
function assetMedMount(d){d.querySelectorAll('[data-mt]').forEach(b=>b.onclick=()=>{b.classList.toggle('on');SFX.tick()})}
function assetMedSave(d,toy){const bs=d.querySelectorAll('[data-mt]');if(!bs.length)return;const m=[...bs].filter(b=>b.classList.contains('on')).map(b=>b.dataset.mt);const o=toy.med||{};o.m=m;if(!m.includes('glow')&&o.stock!=='glowp')delete o.glow;else if(!o.glow)o.glow='#d8ffb0';if(!m.includes('glitter')&&o.stock!=='glit')delete o.gl;else o.gl=1;toy.med=o}
