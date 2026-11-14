'use strict';
/* Shoebox Studio: mediums.js — art mediums, paper stocks and medium tags. */

/* ================= v1.6b: ART MEDIUMS, PAPER STOCKS, HANDY NOTEBOOK ================= */
/* Every medium is a brush made in code. The pencil tool draws with C.med in colour C.mcol (saved as craftloft_artbox).
   Grain mediums (coloured pencils, crayons, chalk, charcoal, oil pastels) use a tinted texture fixed to the paper, so the paper's tooth shows through.
   Each piece remembers what made it in p.med = {m:[medium ids], stock, glow:'#colour', gl:1 (glitter)}. Toys keep it as toy.med.
   In Little Town, glow pieces glow at night (nightK) and glitter pieces sparkle. */
const MEDIA={
  pencil:{em:'✏️',name:'Pencil',w:2.4,a:.86,fixed:'rgb(50,50,58)'},
  cpencil:{em:'🌈',name:'Coloured pencils',w:3.2,a:.95,grain:'fine'},
  marker:{em:'🖊️',name:'Markers',w:7,a:.72},
  crayon:{em:'🖍️',name:'Crayons',w:8,a:1,grain:'wax'},
  water:{em:'💧',name:'Watercolour',w:15,a:.13},
  poster:{em:'🎨',name:'Poster paint',w:11,a:1},
  charcoal:{em:'⚫',name:'Charcoal',w:9,a:.9,grain:'char',fixed:'#26221f'},
  chalk:{em:'☁️',name:'Chalk pastels',w:11,a:.92,grain:'chalk',lift:.3},
  oil:{em:'🧈',name:'Oil pastels',w:10,a:1,grain:'oil'},
  gel:{em:'🖋️',name:'Gel pen',w:3.4,a:1},
  glitter:{em:'✨',name:'Glitter pen',w:5,a:.55},
  glow:{em:'🌟',name:'Glow pen',w:6,a:.95,lift:.45}};
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
  glowp:{em:'🌙',name:'Glow paper',tip:'Pale green. Glows in Little Town at night.',col:'#d8f5c2'}};
const AB=Object.assign({med:'pencil',col:'#26221f',stock:'con'},LS.get('artbox',{}));
if(!MEDIA[AB.med])AB.med='pencil';
if(!STOCKS[AB.stock])AB.stock='con';
const saveAB=()=>LS.set('artbox',AB);
function hexRGB(h){const m=/^#?([0-9a-f]{6})$/i.exec(h||'');if(!m){const r=/(\d+)\D+(\d+)\D+(\d+)/.exec(h||'');return r?[+r[1],+r[2],+r[3]]:[60,60,60]}const n=parseInt(m[1],16);return[n>>16,n>>8&255,n&255]}
function liftCol(h,k){const c=hexRGB(h);return'rgb('+c.map(v=>Math.round(v+(255-v)*k)).join(',')+')'}
/* grain masks: alpha noise, 64x64, made once */
const GRAIN={};
(()=>{const R=mulberry(1606);const mk=(fn)=>{const c=mkCanvas(64,64),x=c._x,d=x.createImageData(64,64);for(let y=0;y<64;y++)for(let i=0;i<64;i++)d.data[(y*64+i)*4+3]=clamp(fn(i,y,R)*255,0,255);x.putImageData(d,0,0);return c};
  GRAIN.fine=mk((i,y,R)=>R()<.3?0:.45+R()*.55);
  const rows=[...Array(64)].map(()=>R());GRAIN.wax=mk((i,y,R)=>{const s=rows[(y+(i>>3))&63];return R()<.22+s*.3?0:.7+R()*.3});
  GRAIN.chalk=mk((i,y,R)=>R()<.45?0:.5+R()*.5);
  GRAIN.char=mk((i,y,R)=>R()<.3?R()*.25:.55+R()*.45);
  GRAIN.oil=mk((i,y,R)=>R()<.1?.2:.85+R()*.15)})();
const GPAT={};
function grainPat(c,gk,col){const k=gk+col;let t=GPAT[k];if(!t){t=mkCanvas(64,64);t._x.fillStyle=col;t._x.fillRect(0,0,64,64);t._x.globalCompositeOperation='destination-in';t._x.drawImage(GRAIN[gk],0,0);GPAT[k]=t}return c.createPattern(t,'repeat')}
/* draw one bit of a stroke (pts in the canvas's own space). k scales the width. wet: the paper soaks (watercolour paper). */
function medSeg(c,m,col,pts,k,wet){const M=MEDIA[m]||MEDIA.pencil;k=k||1;col=M.fixed||(M.lift?liftCol(col,M.lift):col);c.lineCap=c.lineJoin='round';
  const path=(dx,dy)=>{c.beginPath();pts.forEach((q,i)=>i?c.lineTo(q.x+dx,q.y+dy):c.moveTo(q.x+dx,q.y+dy));if(pts.length===1)c.lineTo(pts[0].x+dx+.1,pts[0].y+dy)};
  const b=pts[pts.length-1];c.globalAlpha=M.a;c.lineWidth=M.w*k*(m==='water'&&wet?1.35:1);c.strokeStyle=M.grain?grainPat(c,M.grain,col):col;path(0,0);c.stroke();
  if(m==='water'){c.globalAlpha=.05;c.lineWidth=M.w*k*(wet?2.2:1.6);c.strokeStyle=col;path(0,0);c.stroke();if(Math.random()<(wet?.3:.15)){const r=M.w*k*(.6+Math.random()*(wet?1.4:.8)),gr=c.createRadialGradient(b.x,b.y,0,b.x,b.y,r);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.75,col);gr.addColorStop(1,'rgba(0,0,0,0)');c.globalAlpha=.07;c.fillStyle=gr;c.beginPath();c.arc(b.x,b.y,r,0,TAU);c.fill()}}
  else if(m==='gel'){c.globalAlpha=.4;c.lineWidth=1*k;c.strokeStyle='#fff';path(-.7*k,-.7*k);c.stroke()}
  else if(m==='oil'){c.globalAlpha=.35;c.lineWidth=2*k;c.strokeStyle=liftCol(col,.45);path(-2*k,-1.5*k);c.stroke()}
  else if(m==='poster'){c.globalAlpha=.18;c.lineWidth=2*k;c.strokeStyle='#fff';path(-2.5*k,-2.5*k);c.stroke()}
  else if(m==='glow'){c.globalAlpha=.14;c.lineWidth=M.w*k*2.6;c.strokeStyle=col;path(0,0);c.stroke()}
  else if(m==='glitter'){const sp=[ '#fff',liftCol(col,.6),col,'#ffe9a8'];for(let i=0;i<4;i++){const a=Math.random()*TAU,r=Math.random()*M.w*k*.9;c.globalAlpha=.75+Math.random()*.25;c.fillStyle=sp[i];c.beginPath();c.arc(b.x+Math.cos(a)*r,b.y+Math.sin(a)*r,(.5+Math.random()*1.1)*k,0,TAU);c.fill()}}
  c.globalAlpha=1}
function medNote(o,m,col){o.m=o.m||[];if(!o.m.includes(m))o.m.push(m);if(m==='glow')o.glow=liftCol(col,.45);if(m==='glitter')o.gl=1}
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
  else if(sk==='glowp'){x.fillStyle='rgba(255,255,255,.12)';x.fillRect(0,0,W2,H2);p.med.glow='#d8ffb0'}
  x.restore()}
function stockPaper(color){const S=STOCKS[AB.stock]||STOCKS.con;return S.col||color}
function afterPlacePaper(){const p=C.sel;if(!p)return;p.med={m:[],stock:AB.stock};if(AB.stock!=='con')stockTex(p.art,AB.stock,p.color,p);p.art._url=null;p.dirty=true}
/* sample strokes for the art box */
function medSample(cvs,m,col,stockCol){const w=cvs.width,h=cvs.height,x=cvs.getContext('2d');x.fillStyle=stockCol||'#fbf6ea';x.fillRect(0,0,w,h);let last=null;for(let i=0;i<=40;i++){const t=i/40,q={x:10+t*(w-20),y:h/2+Math.sin(t*TAU*1.2)*h*.22};medSeg(x,m,col,last?[last,q]:[q],h/60);last=q}}
function artBoxDlg(){const S=STOCKS[AB.stock];
  dlg('<h2>🎨 Art box</h2><p style="margin:2px 0 6px;font-size:13px">Pick what to draw with, then a colour.</p><div class="mgrid">'+Object.keys(MEDIA).map(m=>'<button class="mbtn'+(AB.med===m?' on':'')+'" data-m="'+m+'"><canvas width="150" height="44"></canvas><span>'+MEDIA[m].em+' '+MEDIA[m].name+'</span></button>').join('')+'</div><div class="mcols">'+MCOLS.map(c=>'<button class="mcol'+(AB.col===c?' on':'')+'" data-c="'+c+'" style="background:'+c+'" aria-label="colour '+c+'"></button>').join('')+'</div><p id="abNote" style="font-size:12px;opacity:.8;margin:6px 0 0"></p><div class="btns"><button id="dYes">Draw with it</button></div>',d=>{
    const paint=()=>{d.querySelectorAll('.mbtn').forEach(b=>{medSample(b.querySelector('canvas'),b.dataset.m,AB.col,AB.stock==='black'?'#1f1f27':null);b.classList.toggle('on',b.dataset.m===AB.med)});d.querySelectorAll('.mcol').forEach(b=>b.classList.toggle('on',b.dataset.c===AB.col));const M=MEDIA[AB.med];d.querySelector('#abNote').textContent=M.fixed?M.name+' only comes in one colour.':''};
    d.querySelectorAll('.mbtn').forEach(b=>b.onclick=()=>{AB.med=b.dataset.m;saveAB();SFX.tick();paint()});d.querySelectorAll('.mcol').forEach(b=>b.onclick=()=>{AB.col=b.dataset.c;saveAB();SFX.tick();paint()});
    d.querySelector('#dYes').onclick=()=>{closeDlg();C.tool='pencil';renderChips()};paint()})}
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
