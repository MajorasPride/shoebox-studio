'use strict';
/* Shoebox Studio: desk.js — the School Desk (craft table), Paper Studio, tabs and chips, flip paper. */

/* ================= CRAFT TABLE: School Desk ================= */
const SW=450,SH=600; // one sheet of construction paper, 9 x 12 inches at 50 px per inch
const C={pieces:[],bonds:[],sel:null,cat:'paper',tool:'hand',color:PAPERS[0],foldType:'valley',view:{x:0,y:0,z:.7},guides:[],bits:[],anims:[],undo:[],st:null,handA:null,gid:0,saveT:0,ctr:null,ptr:null};
let UID=0;
const SCIS={regular:'#f08a2e',safety:'#3767bb',zigzag:'#d9463e',wavy:'#8b5cb6',scallop:'#2f7d4f',tear:null};
function newPiece(art,x,y,rot,color){return{id:++UID,art,w:art.width,h:art.height,x,y,rot:rot||0,color,layers:null,hist:[],creases:[],deco:[],strokes:[],soft:null,pend:null,crumple:0,dirty:true,cow:false,comp:null}}
const pieceById=id=>C.pieces.find(p=>p.id===id);
function deskCtr(){const bh=$('#craftUI').offsetHeight||130;return{x:W/2,y:46+(H-46-bh)/2,h:H-46-bh}}
function fitDesk(reset){C.ctr=deskCtr();if(reset!==false){C.view.z=clamp(Math.min((W-14)/500,(C.ctr.h-8)/(dsOn()?900:650)),.35,1.6)/* T024: the Real desk zooms out a little so the supplies above and below the paper show */;C.view.x=0;C.view.y=0}}
function s2w(sx,sy){const c=C.ctr||deskCtr(),v=C.view;return{x:(sx-c.x)/v.z+v.x,y:(sy-c.y)/v.z+v.y}}
function toLocal(p,wx,wy){const dx=wx-p.x,dy=wy-p.y,c=Math.cos(p.rot),s=Math.sin(p.rot);return{x:dx*c+dy*s+p.w/2,y:-dx*s+dy*c+p.h/2}}
function toWorld(p,l){const x=l.x-p.w/2,y=l.y-p.h/2,c=Math.cos(p.rot),s=Math.sin(p.rot);return{x:p.x+x*c-y*s,y:p.y+x*s+y*c}}
function pm(p){const c=Math.cos(p.rot),s=Math.sin(p.rot);return[c,s,-s,c,p.x-c*p.w/2+s*p.h/2,p.y-s*p.w/2-c*p.h/2]}
/* ---- undo (copy-on-write snapshots) ---- */
function checkpoint(){C.undo.push({pieces:C.pieces.map(p=>({...p,creases:p.creases.map(c=>({...c})),deco:p.deco.map(d=>({...d})),hist:p.hist.slice(),strokes:p.strokes.slice(),comp:null,dirty:true})),bonds:C.bonds.map(b=>({...b})),sel:C.sel&&C.sel.id});C.pieces.forEach(p=>p.cow=true);if(C.undo.length>14)C.undo.shift()}
function undo(){const s=C.undo.pop();if(!s){toast('Nothing to undo');return}C.pieces=s.pieces;C.pieces.forEach(p=>{p.cow=true;p.dirty=true;p.comp=null});C.bonds=s.bonds;C.sel=C.pieces.find(p=>p.id===s.sel)||null;C.st=null;SFX.rustle();saveDeskSoon()}
function mutArt(p){if(p.cow){const c=mkCanvas(p.w,p.h,true);c._x.drawImage(p.art,0,0);p.art=c;p.cow=false}p.art._url=null;p.dirty=true}
/* ---- how a piece looks ---- */
function drawCrumple(x,p){const r=mulberry(Math.floor(p.crumple*1e6));for(let i=0;i<34;i++){const ax=r()*p.w,ay=r()*p.h,s=30+r()*90;x.fillStyle=r()<.5?'rgba(255,255,255,'+(.04+r()*.1)+')':'rgba(0,0,0,'+(.03+r()*.09)+')';x.beginPath();x.moveTo(ax,ay);x.lineTo(ax+(r()-.5)*s*2,ay+(r()-.5)*s*2);x.lineTo(ax+(r()-.5)*s*2,ay+(r()-.5)*s*2);x.closePath();x.fill()}
  x.lineWidth=1.2;for(let i=0;i<24;i++){const ax=r()*p.w,ay=r()*p.h,a=r()*TAU,s=20+r()*70;x.strokeStyle=r()<.5?'rgba(0,0,0,.13)':'rgba(255,255,255,.22)';x.beginPath();x.moveTo(ax,ay);x.lineTo(ax+Math.cos(a)*s,ay+Math.sin(a)*s);x.stroke()}}
function flatSkin(p,tex){const c=mkCanvas(p.w,p.h),x=c._x;x.drawImage(p.art,0,0);if(p.side==='back'&&p.back&&p.back.width===p.w&&p.back.height===p.h){x.save();x.globalAlpha=.22;x.globalCompositeOperation='source-atop';x.translate(p.w,0);x.scale(-1,1);x.drawImage(p.back,0,0);x.restore()}/* v1.6a: the front shows through the back a little */x.globalCompositeOperation='source-atop';if(p.crumple)drawCrumple(x,p);
  for(const cr of p.creases){const dx=cr.b.x-cr.a.x,dy=cr.b.y-cr.a.y,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,v=cr.type==='mountain';x.lineWidth=1.4;x.strokeStyle=v?'rgba(255,255,255,.4)':'rgba(0,0,0,.2)';x.beginPath();x.moveTo(cr.a.x,cr.a.y);x.lineTo(cr.b.x,cr.b.y);x.stroke();x.strokeStyle=v?'rgba(0,0,0,.13)':'rgba(255,255,255,.28)';x.beginPath();x.moveTo(cr.a.x+nx*1.4,cr.a.y+ny*1.4);x.lineTo(cr.b.x+nx*1.4,cr.b.y+ny*1.4);x.stroke()}
  if(tex){x.fillStyle=x.createPattern(TEX,'repeat');x.fillRect(0,0,p.w,p.h)}return c}
function growPoly(poly,k){let cx=0,cy=0;poly.forEach(q=>{cx+=q.x;cy+=q.y});cx/=poly.length;cy/=poly.length;return poly.map(q=>{const dx=q.x-cx,dy=q.y-cy,l=Math.hypot(dx,dy)||1;return{x:q.x+dx/l*k,y:q.y+dy/l*k}})}
function composite(p,tex){const f=flatSkin(p,tex);if(!p.layers)return{c:f,ox:0,oy:0};let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(const L of p.layers)for(const q of L.poly){const u=ap(L.T,q);if(u.x<x0)x0=u.x;if(u.x>x1)x1=u.x;if(u.y<y0)y0=u.y;if(u.y>y1)y1=u.y}
  x0=Math.floor(x0)-1;y0=Math.floor(y0)-1;const c=mkCanvas(Math.ceil(x1-x0)+2,Math.ceil(y1-y0)+2,true),x=c._x;x.translate(-x0,-y0);
  for(const L of p.layers){x.save();x.transform(...L.T);polyPath(x,growPoly(L.poly,.6));x.clip();x.drawImage(f,0,0);x.globalCompositeOperation='source-atop';if(L.flip){x.fillStyle='rgba(0,0,0,.07)';x.fillRect(0,0,p.w,p.h)}x.strokeStyle='rgba(0,0,0,.2)';x.lineWidth=2;polyPath(x,L.poly);x.stroke();x.restore()}
  return{c,ox:x0,oy:y0}}
function ensureSkin(p){if(p.dirty||!p.comp){p.comp=composite(p,true);p.dirty=false}return p.comp}
function hitPiece(p,wx,wy){const l=toLocal(p,wx,wy);if(!p.layers)return alphaAt(p.art,l.x,l.y)>40;const k=ensureSkin(p);return alphaAt(k.c,l.x-k.ox,l.y-k.oy)>40}
function topPieceAt(wx,wy,skip){for(let i=C.pieces.length-1;i>=0;i--){const p=C.pieces[i];if(p!==skip&&hitPiece(p,wx,wy))return p}return null}
function topLayer(p,l){for(let i=p.layers.length-1;i>=0;i--){const L=p.layers[i],u=ap(inv(L.T),l);if(inPoly(u,L.poly)&&alphaAt(p.art,u.x,u.y)>40)return L}return null}
/* draw onto the paper itself. coordinates are the piece's own (folded) frame */
function artLayerDraw(p,L,fn){mutArt(p);const c=p.art._x;c.save();if(L){polyPath(c,growPoly(L.poly,1));c.clip();c.transform(...inv(L.T))}fn(c);c.restore()}
function eachLayerDraw(p,fn){if(!p.layers)artLayerDraw(p,null,fn);else for(const L of p.layers)artLayerDraw(p,L,fn)}
function drawDeco(c,p,bake){const now=performance.now();for(const d of p.deco){
    if(d.type==='stick'){if(d.used||bake)continue;const age=(now-d.t0)/1000;c.strokeStyle='rgba(170,115,225,'+Math.max(.14,.5*(1-age/6))+')';c.lineWidth=16;c.lineCap=c.lineJoin='round';c.beginPath();d.pts.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));if(d.pts.length===1)c.lineTo(d.pts[0].x+.1,d.pts[0].y);c.stroke()}
    else if(d.type==='glue'){if(d.used||bake)continue;const age=(now-d.t0)/1000,wet=clamp(1-(age-4)/8,0,1);for(const q of d.dots){c.fillStyle='rgba(255,255,255,'+(.3+.65*wet)+')';c.beginPath();c.arc(q.x,q.y,q.r,0,TAU);c.fill();c.fillStyle='rgba(255,255,255,.9)';c.beginPath();c.arc(q.x-q.r*.3,q.y-q.r*.35,q.r*.25,0,TAU);c.fill();c.strokeStyle='rgba(120,120,130,.25)';c.lineWidth=1;c.beginPath();c.arc(q.x,q.y,q.r,0,TAU);c.stroke()}}
    else if(d.type==='tape')drawTape(c,d.a,d.b);
    else if(d.type==='pin'){c.fillStyle='#d8b24a';c.strokeStyle='#8a6a1c';c.lineWidth=1.5;c.beginPath();c.arc(d.x,d.y,7,0,TAU);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.7)';c.beginPath();c.arc(d.x-2,d.y-2.5,2.2,0,TAU);c.fill()}}}
function drawTape(c,a,b){const dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1;c.save();c.translate(a.x,a.y);c.rotate(Math.atan2(dy,dx));c.fillStyle='rgba(250,240,190,.62)';c.beginPath();c.moveTo(0,-11);c.lineTo(l,-11);for(let i=0;i<=4;i++)c.lineTo(l+(i%2?3:0),-11+i*5.5);c.lineTo(0,11);for(let i=4;i>=0;i--)c.lineTo(i%2?-3:0,-11+i*5.5);c.closePath();c.fill();c.fillStyle='rgba(255,255,255,.3)';c.fillRect(0,-8,l,4);c.restore()}
function drawPiece(c,p){let k=ensureSkin(p),fs=1;if(p.flipA){const u=(NOW-p.flipA.t0)/360;if(u>=1)delete p.flipA;else{fs=Math.max(.03,Math.abs(Math.cos(Math.PI*u)));if(u<.5)k=p.flipA.old}}c.save();c.transform(...pm(p));if(fs!==1){c.translate(p.w/2,p.h/2);c.scale(fs,1);c.translate(-p.w/2,-p.h/2)}c.shadowColor='rgba(0,0,0,.3)';c.shadowBlur=7*DPR*C.view.z;c.shadowOffsetY=3*DPR*C.view.z;c.drawImage(k.c,k.ox,k.oy);c.shadowColor='transparent';drawDeco(c,p,false);
  if(p.soft){const t=.5+.5*Math.sin(NOW/160);c.strokeStyle='rgba(255,255,255,'+(.55+.4*t)+')';c.lineWidth=4;c.setLineDash([10,8]);c.lineCap='round';c.beginPath();c.moveTo(p.soft.a.x,p.soft.a.y);c.lineTo(p.soft.b.x,p.soft.b.y);c.stroke();c.setLineDash([]);
    const n=p.soft.bins.length;c.strokeStyle='rgba(245,209,66,.95)';c.lineWidth=5;for(let i=0;i<n;i++)if(p.soft.bins[i]){c.beginPath();c.moveTo(p.soft.a.x+(p.soft.b.x-p.soft.a.x)*i/n,p.soft.a.y+(p.soft.b.y-p.soft.a.y)*i/n);c.lineTo(p.soft.a.x+(p.soft.b.x-p.soft.a.x)*(i+1)/n,p.soft.a.y+(p.soft.b.y-p.soft.a.y)*(i+1)/n);c.stroke()}}
  c.restore()}
/* ---- folding ---- */
function polyClip(poly,P,n,sgn){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=sgn*((a.x-P.x)*n.x+(a.y-P.y)*n.y),db=sgn*((b.x-P.x)*n.x+(b.y-P.y)*n.y);if(da>=0)out.push({x:a.x,y:a.y});if((da>=0)!==(db>=0)){const t=da/(da-db);out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,cut:1})}}return out}
function baseLayers(p){return p.layers||[{poly:[{x:0,y:0},{x:p.w,y:0},{x:p.w,y:p.h},{x:0,y:p.h}],T:I,flip:false}]}
/* fold every layer over the line through P along d. moveSgn says which side moves. */
function doFold(layers,P,d,moveSgn,type){const n={x:-d.y,y:d.x},R=reflM(P,d),stay=[],mov=[],segs=[];let t0=1e9,t1=-1e9;
  for(const L of layers){const pf=L.poly.map(q=>ap(L.T,q)),s=polyClip(pf,P,n,-moveSgn),m=polyClip(pf,P,n,moveSgn),iT=inv(L.T),sa=Math.abs(polyArea(s)),ma=Math.abs(polyArea(m));
    if(sa>2)stay.push({poly:s.map(q=>ap(iT,q)),T:L.T,flip:L.flip});
    if(ma>2)mov.push({poly:m.map(q=>ap(iT,q)),T:mul(R,L.T),flip:!L.flip});
    if(sa>2&&ma>2){const c=m.filter(q=>q.cut);if(c.length>=2){segs.push({a:ap(iT,c[0]),b:ap(iT,c[1]),type});for(const q of c){const t=(q.x-P.x)*d.x+(q.y-P.y)*d.y;if(t<t0)t0=t;if(t>t1)t1=t}}}}
  if(!mov.length||!stay.length||!segs.length)return null;mov.reverse();
  return{layers:type==='mountain'?mov.concat(stay):stay.concat(mov),segs,soft:{a:{x:P.x+d.x*t0,y:P.y+d.y*t0},b:{x:P.x+d.x*t1,y:P.y+d.y*t1}}}}
function foldCands(layers){const out=[];for(const L of layers){const pf=L.poly.map(q=>ap(L.T,q));pf.forEach((a,i)=>{const b=pf[(i+1)%pf.length];out.push(a,{x:(a.x+b.x)/2,y:(a.y+b.y)/2})})}return out}
function snapTo(cands,l,r,not){let best=null,bd=r;for(const c of cands){if(not&&dist(c,not)<4)continue;const d=dist(c,l);if(d<bd){bd=d;best=c}}return best}
function settle(p){if(p&&p.soft){p.creases.push(...p.pend);p.soft=null;p.pend=null;p.dirty=true}}
const isBonded=p=>C.bonds.some(b=>b.a===p.id||b.b===p.id);
function actUnfold(all){const p=C.sel;if(!p||!p.layers){toast('Tap a folded paper first');return}if(isBonded(p)){toast('Unstick it first, then unfold');return}checkpoint();settle(p);
  do{p.layers=p.hist.pop()||null}while(all&&p.layers);p.deco=[];p.strokes=[];p.dirty=true;SFX.rustle();if(!p.layers){p.hist=[];const out=splitPiece(p,true);if(out.length>1)toast('It opened into '+out.length+' pieces')}saveDeskSoon()}
function actAccordion(){const p=C.sel;if(!p){toast('Tap a paper first');return}if(isBonded(p)){toast('Unstick it first, then fold');return}checkpoint();settle(p);const prev=p.layers;let lay=baseLayers(p),x0=1e9,x1=-1e9;
  for(const L of lay)for(const q of L.poly){const u=ap(L.T,q);if(u.x<x0)x0=u.x;if(u.x>x1)x1=u.x}
  const n=6,w=(x1-x0)/n,segs=[];if(w<14){C.undo.pop();toast('Too small to fan-fold');return}
  for(let k=1;k<n;k++){const right=k%2===1,res=doFold(lay,{x:right?x0+w:x0,y:0},{x:0,y:1},right?-1:1,'valley');if(!res)break;res.segs.forEach(s=>s.type=k%2?'valley':'mountain');segs.push(...res.segs);lay=res.layers;if(lay.length>40)break;setTimeout(()=>SFX.crease(),k*90)}
  p.hist.push(prev);p.layers=lay;p.strokes=[];p.creases.push(...segs);p.dirty=true;toast('Fan fold! Cut a shape, then Unfold for a paper chain');saveDeskSoon()}
/* ---- cutting: find the separate pieces after a cut ---- */
function shiftLocal(p,dx,dy){if(!dx&&!dy)return;p.strokes=p.strokes.map(s=>({pts:s.pts.map(q=>({x:q.x+dx,y:q.y+dy}))}));const sh=q=>{q.x+=dx;q.y+=dy};p.creases.forEach(c=>{sh(c.a);sh(c.b)});p.deco.forEach(d=>{if(d.pts)d.pts.forEach(sh);if(d.dots)d.dots.forEach(sh);if(d.a){sh(d.a);sh(d.b)}if(d.type==='pin')sh(d)});C.bonds.forEach(b=>{if(b.la&&b.a===p.id)sh(b.la);if(b.lb&&b.b===p.id)sh(b.lb)})}
function removePiece(p){C.pieces=C.pieces.filter(q=>q!==p);const gone=C.bonds.filter(b=>b.a===p.id||b.b===p.id).map(b=>b.gid);C.bonds=C.bonds.filter(b=>b.a!==p.id&&b.b!==p.id);C.pieces.forEach(q=>q.deco=q.deco.filter(d=>!gone.includes(d.gid)));if(C.sel===p)C.sel=null}
function spawnBits(w,color,n){for(let i=0;i<n;i++)C.bits.push({x:w.x,y:w.y,vx:rnd(-60,60),vy:rnd(-90,10),r:rnd(TAU),vr:rnd(-6,6),s:rnd(3,7),color,life:1})}
function splitPiece(p,forceCrop){const w=p.w,h=p.h,d=p.art._x.getImageData(0,0,w,h).data,N=w*h,lab=new Int32Array(N),st=new Int32Array(N),TH=100,comps=[];
  for(let i=0;i<N;i++){if(lab[i]||d[i*4+3]<=TH)continue;const id=comps.length+1;let sp=0,area=0,x0=w,x1=0,y0=h,y1=0,sx=0,sy=0;st[sp++]=i;lab[i]=id;
    while(sp){const j=st[--sp],x=j%w,y=(j-x)/w;area++;sx+=x;sy+=y;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;
      if(x>0&&!lab[j-1]&&d[(j-1)*4+3]>TH){lab[j-1]=id;st[sp++]=j-1}if(x<w-1&&!lab[j+1]&&d[(j+1)*4+3]>TH){lab[j+1]=id;st[sp++]=j+1}
      if(y>0&&!lab[j-w]&&d[(j-w)*4+3]>TH){lab[j-w]=id;st[sp++]=j-w}if(y<h-1&&!lab[j+w]&&d[(j+w)*4+3]>TH){lab[j+w]=id;st[sp++]=j+w}}
    comps.push({id,area,x0,x1,y0,y1,cx:sx/area,cy:sy/area})}
  const big=comps.filter(c=>c.area>=90).sort((a,b)=>b.area-a.area),crumbs=comps.filter(c=>c.area<90),M=pm(p),folded=!!p.layers;
  if(!folded)crumbs.slice(0,10).forEach(c=>spawnBits(ap(M,{x:c.cx,y:c.cy}),p.color,2));
  if(!big.length){spawnBits({x:p.x,y:p.y},p.color,8);removePiece(p);return[]}
  if(big.length===1&&!crumbs.length){const b=big[0];if(folded||!forceCrop||(b.x0<=1&&b.y0<=1&&b.x1>=w-2&&b.y1>=h-2))return[p]}
  const lab2=new Int32Array(lab);for(let i=0;i<N;i++){if(lab[i]||d[i*4+3]===0)continue;const x=i%w;let l=0;if(x>0)l=lab[i-1];if(!l&&x<w-1)l=lab[i+1];if(!l&&i>=w)l=lab[i-w];if(!l&&i<N-w)l=lab[i+w];lab2[i]=l}
  const out=[],back0=p.back,side0=p.side,idx=C.pieces.indexOf(p),cr0=p.creases.map(c=>({a:{...c.a},b:{...c.b},type:c.type})),st0=p.strokes,rot=p.rot,co=Math.cos(rot),si=Math.sin(rot);
  big.forEach((c,k)=>{let L=null;if(folded){const cs=[{x:c.x0,y:c.y0},{x:c.x1,y:c.y0},{x:c.x1,y:c.y1},{x:c.x0,y:c.y1}];L=p.layers.find(l=>{const gp=growPoly(l.poly,2.5);return cs.every(q=>inPoly(q,gp))})||null}
    const crop=!folded||L,bx=crop?Math.max(0,c.x0-1):0,by=crop?Math.max(0,c.y0-1):0,bw=crop?Math.min(w,c.x1+2)-bx:w,bh=crop?Math.min(h,c.y1+2)-by:h,cvs=mkCanvas(bw,bh,true),o=cvs._x.createImageData(bw,bh),od=o.data,mir=L&&L.flip;
    for(let y=0;y<bh;y++)for(let x=0;x<bw;x++){const si2=(y+by)*w+x+bx;if(lab2[si2]===c.id){const di=(y*bw+(mir?bw-1-x:x))*4,s4=si2*4;od[di]=d[s4];od[di+1]=d[s4+1];od[di+2]=d[s4+2];od[di+3]=d[s4+3]}}
    cvs._x.putImageData(o,0,0);const Mt=L?mul(M,L.T):M,ctr=ap(Mt,{x:bx+bw/2,y:by+bh/2}),r=L?(L.flip?Math.atan2(-Mt[1],-Mt[0]):Math.atan2(Mt[1],Mt[0])):rot;let q;
    if(k===0){q=p;if(L){p.layers=null;p.hist=[];p.creases=[];p.deco=[];p.strokes=[];p.soft=null}else shiftLocal(p,-bx,-by);p.art=cvs;p.cow=false;p.w=bw;p.h=bh;p.x=ctr.x;p.y=ctr.y;p.rot=r}
    else{q=newPiece(cvs,ctr.x,ctr.y,r,p.color);q.crumple=p.crumple;q.med=medCopy(p.med);if(!L){q.strokes=st0.map(s2=>({pts:s2.pts.map(u=>({x:u.x-bx,y:u.y-by}))}));q.layers=p.layers;q.hist=p.hist.slice();q.creases=cr0.map(cc=>({a:{x:cc.a.x-bx,y:cc.a.y-by},b:{x:cc.b.x-bx,y:cc.b.y-by},type:cc.type}))}
      let dx=c.cx-big[0].cx,dy=c.cy-big[0].cy;const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const sc=folded?rnd(8,26):9,ja=folded?rnd(-1,1):0,ca=Math.cos(rot+ja),sa=Math.sin(rot+ja);q.x+=(dx*ca-dy*sa)*sc;q.y+=(dx*sa+dy*ca)*sc;C.pieces.splice(idx+k,0,q)}
    if(back0&&!folded){const nb=mkCanvas(bw,bh,true);nb._x.drawImage(back0,w-bx-bw,by,bw,bh,0,0,bw,bh);q.back=nb;q.side=side0}else if(folded){q.back=null;q.side='front'}/* v1.6a: the back is cut the same way */
    q.dirty=true;q.comp=null;out.push(q)});
  return out}
/* ---- sticking pieces together ---- */
function groups(){const rig=new Map(),comp=new Map();C.pieces.forEach(p=>{rig.set(p.id,p.id);comp.set(p.id,p.id)});const find=(m,i)=>{while(m.get(i)!==i)i=m.get(i);return i},uni=(m,a,b)=>{a=find(m,a);b=find(m,b);if(a!==b)m.set(a,b)};
  for(const b of C.bonds){if(!rig.has(b.a)||!rig.has(b.b))continue;if(b.type!=='pin')uni(rig,b.a,b.b);uni(comp,b.a,b.b)}
  const r2=new Map(),c2=new Map();C.pieces.forEach(p=>{r2.set(p.id,find(rig,p.id));c2.set(p.id,find(comp,p.id))});return{rig:r2,comp:c2}}
/* work out what moves when you grab piece p: the whole thing, or a pinned part that swings */
function plan(p){const{rig,comp}=groups(),cr=comp.get(p.id),members=C.pieces.filter(q=>comp.get(q.id)===cr),pins=C.bonds.filter(b=>b.type==='pin'&&comp.get(b.a)===cr&&rig.get(b.a)!==rig.get(b.b));
  const area=new Map();members.forEach(q=>area.set(rig.get(q.id),(area.get(rig.get(q.id))||0)+q.w*q.h));let body=null;area.forEach((a,k)=>{if(body===null||a>area.get(body))body=k});
  const order=[body],par=new Map([[body,null]]);for(let i=0;i<order.length;i++){const c=order[i];for(const b of pins){const ra=rig.get(b.a),rb=rig.get(b.b),o=ra===c?rb:rb===c?ra:null;if(o!==null&&!par.has(o)){par.set(o,{from:c,b});order.push(o)}}}
  const res={mode:'move',set:members,members,rig,body,par,order,area};const me=rig.get(p.id);if(!pins.length||me===body||!par.has(me))return res;
  const sub=new Set([me]);let ch=true;while(ch){ch=false;par.forEach((v,k)=>{if(v&&sub.has(v.from)&&!sub.has(k)){sub.add(k);ch=true}})}
  const b=par.get(me).b;res.mode='swing';res.set=members.filter(q=>sub.has(rig.get(q.id)));res.pivot=toWorld(pieceById(b.a),b.la);return res}
function rotateSet(set,piv,a){const c=Math.cos(a),s=Math.sin(a);set.forEach(p=>{const dx=p.x-piv.x,dy=p.y-piv.y;p.x=piv.x+dx*c-dy*s;p.y=piv.y+dx*s+dy*c;p.rot+=a})}
function raise(set){const ids=new Set(set.map(p=>p.id));C.pieces=C.pieces.filter(p=>!ids.has(p.id)).concat(C.pieces.filter(p=>ids.has(p.id)))}
function tryBond(set){const ids=new Set(set.map(p=>p.id));let done=false;
  for(const A of C.pieces){if(ids.has(A.id))continue;const ai=C.pieces.indexOf(A);for(const d of A.deco){if(d.used||(d.type!=='stick'&&d.type!=='glue'))continue;const pts=d.type==='stick'?d.pts:d.dots;let hit=null;
      for(let i=0;i<pts.length&&!hit;i+=2){const q=toWorld(A,pts[i]);for(const B of set)if(C.pieces.indexOf(B)>ai&&hitPiece(B,q.x,q.y)){hit=B;break}}
      if(hit){C.bonds.push({a:A.id,b:hit.id,type:'glue',gid:++C.gid});d.used=true;done=true}}}
  if(done){SFX.squish();toast('Stuck!')}}
/* ---- rulers, triangle, stencils ---- */
const TRI=[{x:-90,y:-90},{x:170,y:-90},{x:-90,y:170}];
const STN={};
function stencilPts(s){if(STN[s])return STN[s];const o=[];
  if(s==='circle')for(let i=0;i<72;i++)o.push({x:Math.cos(i/72*TAU),y:Math.sin(i/72*TAU)});
  else if(s==='star')for(let i=0;i<10;i++){const r=i%2?.42:1,a=-Math.PI/2+i*Math.PI/5;o.push({x:Math.cos(a)*r,y:Math.sin(a)*r})}
  else if(s==='heart')for(let i=0;i<80;i++){const t=i/80*TAU;o.push({x:16*Math.pow(Math.sin(t),3)/17,y:-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))/17-.08})}
  else for(let i=0;i<96;i++){const a=i/96*TAU,r=.78+.22*Math.cos(6*a);o.push({x:Math.cos(a)*r,y:Math.sin(a)*r})}
  return STN[s]=o}
function gLocal(G,w){const dx=w.x-G.x,dy=w.y-G.y,c=Math.cos(G.rot),s=Math.sin(G.rot);return{x:dx*c+dy*s,y:-dx*s+dy*c}}
function gWorld(G,l){const c=Math.cos(G.rot),s=Math.sin(G.rot);return{x:G.x+l.x*c-l.y*s,y:G.y+l.x*s+l.y*c}}
function guidePls(G){const m=a=>a.map(q=>gWorld(G,q));if(G.type==='ruler')return[plPrep(m([{x:-300,y:-23},{x:300,y:-23}]),false),plPrep(m([{x:-300,y:23},{x:300,y:23}]),false)];if(G.type==='tri')return[plPrep(m(TRI),true)];const r=G.size*.36;return[plPrep(m(stencilPts(G.shape).map(q=>({x:q.x*r,y:q.y*r}))),true)]}
function guideAt(w){const thr=19/C.view.z,hand=C.tool==='hand';for(let i=C.guides.length-1;i>=0;i--){const G=C.guides[i],l=gLocal(G,w);
    if(G.type==='ruler'){if(Math.abs(l.x)<=300&&Math.abs(l.y)<=23)return{g:G,mode:Math.abs(Math.abs(l.x)-270)<24?'rot':Math.abs(l.x)<26||hand?'move':'body'}}
    else if(G.type==='tri'){if(inPoly(l,TRI))return{g:G,mode:Math.hypot(l.x+52,l.y+52)<24?'rot':Math.hypot(l.x+8,l.y+8)<24||hand?'move':'body'}}
    else{const h=G.size/2;if(Math.abs(l.x)<=h&&Math.abs(l.y)<=h){if(Math.hypot(l.x-(h-18),l.y-(h-18))<24)return{g:G,mode:'size'};if(Math.hypot(l.x+(h-18),l.y+(h-18))<24)return{g:G,mode:'move'};const r=G.size*.36;if(!inPoly({x:l.x/r,y:l.y/r},stencilPts(G.shape)))return{g:G,mode:hand?'move':'body'}}}
    let best=null;for(const pl of guidePls(G)){const r=plProj(pl,w);if(r&&r.d<thr&&(!best||r.d<best.d))best={g:G,mode:'snap',pl,t:r.t,d:r.d}}if(best)return best}
  return null}
/* is this spot covered by a ruler, the triangle or a stencil plate? the pencil cannot draw there */
function underGuide(w,skip){for(const G of C.guides){if(G===skip)continue;const l=gLocal(G,w);if(G.type==='ruler'){if(Math.abs(l.x)<=300&&Math.abs(l.y)<=23)return true}else if(G.type==='tri'){if(inPoly(l,TRI))return true}else{const h=G.size/2,r=G.size*.36;if(Math.abs(l.x)<=h&&Math.abs(l.y)<=h&&!inPoly({x:l.x/r,y:l.y/r},stencilPts(G.shape)))return true}}return false}
function grip(c,x,y,kind,col){c.fillStyle=col;c.beginPath();c.arc(x,y,13,0,TAU);c.fill();c.strokeStyle='#fff';c.fillStyle='#fff';c.lineWidth=2;c.lineCap='round';if(kind==='move'){c.beginPath();c.moveTo(x-7,y);c.lineTo(x+7,y);c.moveTo(x,y-7);c.lineTo(x,y+7);c.stroke();[[7,0],[-7,0],[0,7],[0,-7]].forEach(d=>{c.beginPath();c.arc(x+d[0],y+d[1],1.8,0,TAU);c.fill()})}else{c.font='900 15px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(kind==='rot'?'↻':'⤡',x,y+1);c.textBaseline='alphabetic'}}
function toggleGuide(type,shape){const ex=C.guides.find(G=>G.type===type),v=C.view;if(ex&&(type!=='stencil'||ex.shape===shape)){C.guides=C.guides.filter(G=>G!==ex);SFX.clack();return false}
  if(ex){ex.shape=shape}else C.guides.push(type==='ruler'?{type,x:v.x,y:v.y-150,rot:0}:type==='tri'?{type,x:v.x-40,y:v.y+20,rot:0}:{type,shape,x:v.x,y:v.y,rot:0,size:230});SFX.clack();return true}
function drawGuides(c){for(const G of C.guides){c.save();c.translate(G.x,G.y);c.rotate(G.rot);c.shadowColor='rgba(0,0,0,.25)';c.shadowBlur=5*DPR*C.view.z;c.shadowOffsetY=2*DPR*C.view.z;
    if(G.type==='ruler'){c.fillStyle='#e6bd7c';c.fillRect(-300,-23,600,46);c.shadowColor='transparent';c.strokeStyle='rgba(140,90,40,.25)';c.lineWidth=1;for(let i=0;i<5;i++){c.beginPath();c.moveTo(-300,-15+i*8);c.lineTo(300,-15+i*8+(i%2?2:-2));c.stroke()}c.strokeStyle='#9a6a35';c.lineWidth=1.5;c.strokeRect(-300,-23,600,46);
      c.strokeStyle='#4a321c';c.fillStyle='#4a321c';c.lineWidth=1;c.font='700 11px system-ui';c.textAlign='center';c.beginPath();for(let i=0;i<=96;i++){const x=-300+i*6.25,l=i%8===0?13:i%4===0?9:i%2===0?6:3.5;c.moveTo(x,-23);c.lineTo(x,-23+l)}for(let i=0;i<=60;i++){const x=-300+i*9.8425;c.moveTo(x,23);c.lineTo(x,23-(i%2===0?9:5))}c.stroke();
      for(let i=1;i<12;i++)c.fillText(i,-300+i*50,-23+23);c.font='600 7.5px system-ui';for(let i=2;i<30;i+=2)c.fillText(i,-300+i*19.685,23-11);
      grip(c,-270,0,'rot','rgba(120,70,30,.55)');grip(c,270,0,'rot','rgba(120,70,30,.55)');grip(c,0,0,'move','rgba(120,70,30,.55)')}
    else if(G.type==='tri'){polyPath(c,TRI);c.fillStyle='rgba(90,205,195,.38)';c.fill();c.shadowColor='transparent';c.strokeStyle='rgba(20,130,120,.9)';c.lineWidth=2;c.stroke();polyPath(c,[{x:-40,y:-40},{x:60,y:-40},{x:-40,y:60}]);c.strokeStyle='rgba(20,130,120,.5)';c.stroke();
      c.strokeStyle='rgba(10,90,85,.8)';c.lineWidth=1;c.beginPath();for(let i=1;i<20;i++){const l=i%4===0?10:5;c.moveTo(-90+i*12.5,-90);c.lineTo(-90+i*12.5,-90+l);c.moveTo(-90,-90+i*12.5);c.lineTo(-90+l,-90+i*12.5)}c.stroke();
      grip(c,-52,-52,'rot','rgba(10,110,100,.6)');grip(c,-8,-8,'move','rgba(10,110,100,.6)')}
    else{const h=G.size/2,r=G.size*.36,sp=stencilPts(G.shape);c.beginPath();c.moveTo(-h+14,-h);c.arcTo(h,-h,h,h,14);c.arcTo(h,h,-h,h,14);c.arcTo(-h,h,-h,-h,14);c.arcTo(-h,-h,h,-h,14);c.closePath();sp.forEach((q,i)=>i?c.lineTo(q.x*r,q.y*r):c.moveTo(q.x*r,q.y*r));c.closePath();c.fillStyle='rgba(120,205,110,.5)';c.fill('evenodd');c.shadowColor='transparent';c.strokeStyle='rgba(40,120,40,.9)';c.lineWidth=2;c.stroke();
      grip(c,h-18,h-18,'size','rgba(30,110,30,.65)');grip(c,-h+18,-h+18,'move','rgba(30,110,30,.65)')}
    c.restore()}}
/* ---- new paper, with the hand that puts it down ---- */
function placePaper(color){if(C.handA)return;if(C.pieces.length>=40){toast('The desk is full. Put some pieces in the toy box or the bin.');return}checkpoint();color=stockPaper(color);/* v1.6b */const art=mkCanvas(SW,SH,true);art._x.fillStyle=color;art._x.fillRect(0,0,SW,SH);const n=C.pieces.filter(p=>Math.abs(p.x-C.view.x)<60&&Math.abs(p.y-C.view.y)<60).length;
  const p=newPiece(art,C.view.x+n*16,C.view.y+n*12,rnd(-.03,.03),color);p.y-=1100;C.pieces.push(p);C.sel=p;C.handA={p,t:0,ty:p.y+1100,snd:false};C.color=color;afterPlacePaper()}
function drawHand(c,x,y,press){const sk=HANDS[SET.hand]||HANDS[1];c.save();c.translate(x,y);c.shadowColor='rgba(0,0,0,.3)';c.shadowBlur=(press?4:12)*DPR*C.view.z;c.shadowOffsetY=(press?2:9)*DPR*C.view.z;
  c.fillStyle='#3767bb';c.fillRect(-52,-760,104,700);c.fillStyle='#2d5499';rr(c,-58,-78,116,34,10);c.fill();c.shadowColor='transparent';
  c.fillStyle=sk;c.strokeStyle='rgba(0,0,0,.28)';c.lineWidth=2.5;const fl=[50,60,56,44],fx=[-42,-20,2,24];fx.forEach((f,i)=>{rr(c,f,18,19,fl[i]+14,9.5);c.fill();c.stroke()});
  c.save();c.translate(-44,-14);c.rotate(.75);rr(c,-10,-4,21,54,10);c.fill();c.stroke();c.restore();rr(c,-46,-50,92,84,26);c.fill();c.stroke();c.fillRect(-42,10,82,22);c.restore()}
/* ---- actions on the picked piece ---- */
function needSel(){if(!C.sel)toast('Tap a piece first');return C.sel}
function actOrder(front){const p=needSel();if(!p)return;const set=plan(p).members,ids=new Set(set.map(q=>q.id)),rest=C.pieces.filter(q=>!ids.has(q.id));C.pieces=front?rest.concat(set):set.concat(rest);SFX.rustle();saveDeskSoon()}
function actFlip(){const p=needSel();if(!p)return;if(p.layers||isBonded(p)){toast('Flip works on a flat, loose piece');return}checkpoint();const c=mkCanvas(p.w,p.h,true);c._x.translate(p.w,0);c._x.scale(-1,1);c._x.drawImage(p.art,0,0);p.art=c;p.cow=false;p.creases.forEach(cr=>{cr.a.x=p.w-cr.a.x;cr.b.x=p.w-cr.b.x});p.strokes=p.strokes.map(s2=>({pts:s2.pts.map(u=>({x:p.w-u.x,y:u.y}))}));p.dirty=true;SFX.thwap();saveDeskSoon()}
function actCopy(){const p=needSel();if(!p)return;if(C.pieces.length>=40){toast('The desk is full');return}checkpoint();settle(p);const c=mkCanvas(p.w,p.h,true);c._x.drawImage(p.art,0,0);const q=newPiece(c,p.x+26,p.y+26,p.rot,p.color);q.med=medCopy(p.med);q.layers=p.layers;q.hist=p.hist.slice();q.creases=p.creases.map(cr=>({a:{...cr.a},b:{...cr.b},type:cr.type}));q.crumple=p.crumple;q.strokes=p.strokes.slice();q.back=p.back;q.side=p.side;C.pieces.push(q);C.sel=q;SFX.thwap();saveDeskSoon()}
function actCrumple(){const p=needSel();if(!p)return;checkpoint();p.crumple=p.crumple?0:rnd(.1,1);p.dirty=true;SFX.crumple();saveDeskSoon()}
function actBin(){const p=needSel();if(!p)return;checkpoint();SFX.crumple(9);spawnBits({x:p.x,y:p.y},p.color,10);removePiece(p);saveDeskSoon()}
/* ---- toy box: bake the picked build into a toy ---- */
function bakeToy(P,name){C.pieces.forEach(settle);const pl=plan(P),{rig,par,order,members}=pl,cl=new Map();members.forEach(q=>{const r=rig.get(q.id);if(!cl.has(r))cl.set(r,{ps:[],z:0});const o=cl.get(r);o.ps.push(q);o.z=C.pieces.indexOf(q)});
  cl.forEach((o,k)=>{if(!par.has(k)){par.set(k,{from:pl.body,b:null});order.push(k)}});const pad=4,A={x0:1e9,y0:1e9,x1:-1e9,y1:-1e9};
  order.forEach(k=>{const o=cl.get(k);o.b={x0:1e9,y0:1e9,x1:-1e9,y1:-1e9};o.ps.forEach(q=>{const s=ensureSkin(q),M=pm(q);[[s.ox,s.oy],[s.ox+s.c.width,s.oy],[s.ox,s.oy+s.c.height],[s.ox+s.c.width,s.oy+s.c.height]].forEach(cn=>{const u=ap(M,{x:cn[0],y:cn[1]});o.b.x0=Math.min(o.b.x0,u.x);o.b.y0=Math.min(o.b.y0,u.y);o.b.x1=Math.max(o.b.x1,u.x);o.b.y1=Math.max(o.b.y1,u.y)})});
    o.b.x0-=pad;o.b.y0-=pad;o.b.x1+=pad;o.b.y1+=pad;A.x0=Math.min(A.x0,o.b.x0);A.y0=Math.min(A.y0,o.b.y0);A.x1=Math.max(A.x1,o.b.x1);A.y1=Math.max(A.y1,o.b.y1)});
  const aw=A.x1-A.x0,ah=A.y1-A.y0,sc=Math.min(1,480/Math.max(aw,ah));
  const parts=order.map(k=>{const o=cl.get(k),c=mkCanvas((o.b.x1-o.b.x0)*sc,(o.b.y1-o.b.y0)*sc),x=c._x;x.scale(sc,sc);x.translate(-o.b.x0,-o.b.y0);o.ps.forEach(q=>{const s=composite(q,false);x.save();x.transform(...pm(q));x.drawImage(s.c,s.ox,s.oy);drawDeco(x,q,true);x.restore()});
    const pr=par.get(k);let px=0,py=0,parent=-1;if(pr){parent=order.indexOf(pr.from);if(pr.b){const pv=toWorld(pieceById(pr.b.a),pr.b.la);px=(pv.x-A.x0)*sc;py=(pv.y-A.y0)*sc}else{px=(o.b.x0-A.x0)*sc;py=(o.b.y0-A.y0)*sc}}
    return{src:c.toDataURL(),x:(o.b.x0-A.x0)*sc,y:(o.b.y0-A.y0)*sc,w:c.width,h:c.height,parent,px,py,z:o.z}});
  return{toy:{id:'t'+Date.now().toString(36),name,w:Math.round(aw*sc),h:Math.round(ah*sc),beh:'solid',color:P.color,parts},members}}
function actToyBox(){const p=C.sel;if(!p){toast('Tap the piece you finished, then tap Toy box');return}const n=TOYS.filter(t=>!t.starter).length+1,two=plan(p).members.some(q=>q.back);let b=bakeSide(p,'','front');
  dlg('<h2>Put it in the toy box?</h2><canvas class="pv" id="pv"></canvas><p>Give it a name:</p><input type="text" id="tn" maxlength="24" value="My piece '+n+'"><label class="lb" for="tty">What is it?</label><select id="tty"><option value="piece">📄 Piece</option><option value="creature">🐾 Creature</option><option value="tile">🧱 Tile</option><option value="sticker">🏷️ Sticker</option></select>'+(two?'<label class="lb" for="tsd">Which side?</label><select id="tsd"><option value="front">Front</option><option value="back">Back</option></select>':'')+'<label class="lb" for="tact">In Little Town it...</label><select id="tact">'+actOpts('none')+'</select><div class="btns"><button class="alt" id="dNo">Not yet</button><button id="dYes">Into the toy box</button></div>',d=>{thumb(d.querySelector('#pv'),b.toy);d.querySelector('#dNo').onclick=()=>{delete SPR[b.toy.id];closeDlg()};if(two)d.querySelector('#tsd').onchange=e=>{delete SPR[b.toy.id];b=bakeSide(p,'',e.target.value);thumb(d.querySelector('#pv'),b.toy)};
    d.querySelector('#dYes').onclick=()=>{b.toy.name=(d.querySelector('#tn').value||'My piece '+n).trim().slice(0,24);b.toy.act=d.querySelector('#tact').value;b.toy.med=medMerge(b.members);if(two){b.toy.side=d.querySelector('#tsd').value;if(b.members.length===1){const sh=sheetOf(b.members[0]);if(sh)b.toy.sheet=sh}}TOYS.push(b.toy);if(!saveToys()){TOYS.pop();toast('The toy box is full. Remove a toy first.');return}libAddToy(b.toy,d.querySelector('#tty').value);b.members.forEach(removePiece);C.sel=null;C.undo=[];SFX.thud();closeDlg();updBadge();toast(b.toy.name+' is in the toy box');saveDeskSoon();asAfterSave(b.toy)/* T022 */}})}
function toyToDesk(toy){if(toy.sheet&&toy.parts.length===1){sheetToDesk(toy);return}/* v1.6a: a two-sided sheet comes back with both sides */const ps=[];let n=toy.parts.length;const v=C.view;toy.parts.forEach((pt,i)=>{const im=new Image();im.onload=()=>{const a=mkCanvas(pt.w,pt.h,true);a._x.drawImage(im,0,0,a.width,a.height);ps[i]=newPiece(a,v.x-toy.w/2+pt.x+pt.w/2,v.y-toy.h/2+pt.y+pt.h/2,0,toy.color||'#f6f2e9');ps[i].med=medCopy(toy.med);
      if(--n===0){toy.parts.map((q,j)=>j).sort((a2,b2)=>toy.parts[a2].z-toy.parts[b2].z).forEach(j=>C.pieces.push(ps[j]));toy.parts.forEach((q,j)=>{if(q.parent>=0){const pw={x:v.x-toy.w/2+q.px,y:v.y-toy.h/2+q.py},A=ps[q.parent],B=ps[j];C.bonds.push({a:A.id,b:B.id,type:'pin',la:toLocal(A,pw.x,pw.y),lb:toLocal(B,pw.x,pw.y),gid:++C.gid})}});C.sel=ps[0];saveDeskSoon()}};im.src=pt.src})}
/* ---- keep the desk between visits ---- */
function saveDeskSoon(){clearTimeout(C.saveT);C.saveT=setTimeout(saveDesk,1200)}
function saveDesk(){try{const data={uid:UID,gid:C.gid,bonds:C.bonds,pieces:C.pieces.map(p=>({id:p.id,src:p.art._url||(p.art._url=p.art.toDataURL()),x:p.x,y:p.y,rot:p.rot,color:p.color,layers:p.layers,hist:p.hist,creases:p.creases,crumple:p.crumple,strokes:p.strokes.map(s2=>s2.pts.map(u=>[Math.round(u.x),Math.round(u.y)])),deco:p.deco.filter(d=>d.type==='tape'||d.type==='pin'),back:p.back?(p.back._url||(p.back._url=p.back.toDataURL())):null,side:p.side||'front',med:p.med}))};LS.set('desk',data)}catch(e){}}
function loadDesk(){const d=LS.get('desk',null);if(!d||!d.pieces)return;UID=d.uid||0;C.gid=d.gid||0;C.bonds=d.bonds||[];d.pieces.forEach((pp,i)=>{const im=new Image();im.onload=()=>{const a=mkCanvas(im.width,im.height,true);a._x.drawImage(im,0,0);const keep=UID,p=newPiece(a,pp.x,pp.y,pp.rot,pp.color);UID=Math.max(keep,pp.id);Object.assign(p,{id:pp.id,layers:pp.layers||null,hist:pp.hist||[],creases:pp.creases||[],crumple:pp.crumple||0,strokes:(pp.strokes||[]).map(a=>({pts:a.map(u=>({x:u[0],y:u[1]}))})),deco:pp.deco||[],_ord:i,side:pp.side==='back'?'back':'front',med:pp.med});if(pp.back){const bi=new Image();bi.onload=()=>{const B=mkCanvas(bi.width,bi.height,true);B._x.drawImage(bi,0,0);B._url=pp.back;p.back=B;p.dirty=true};bi.src=pp.back}C.pieces.push(p);C.pieces.sort((x,y)=>(x._ord||0)-(y._ord||0))};im.src=pp.src})}
/* ================= pointer: what each tool does ================= */
function knobPos(p){const k=ensureSkin(p);return ap(pm(p),{x:k.ox+k.c.width/2,y:k.oy-34/C.view.z})}
function cutOff(st){const s=st.s;switch(st.kind){case'safety':st.rw=clamp(st.rw+rnd(-.5,.5),-1.5,1.5);return 1.8*Math.sin(s*.09)+st.rw;case'zigzag':{const u=s/16;return(2*Math.abs(2*(u-Math.floor(u+.5)))-1)*6.5}case'wavy':return 6*Math.sin(s*TAU/30);case'scallop':return 5-10*Math.abs(Math.sin(s*Math.PI/24));case'tear':st.rw=clamp(st.rw+rnd(-1.6,1.6),-5,5);return st.rw;default:return 0}}
function drawSeg(st,pts){const p=st.p;if(st.er){const b=pts[pts.length-1];p.strokes=p.strokes.filter(s2=>!s2.pts.some(u=>dist(u,b)<11))}else if(st.rec){const r=st.rec[st.rec.length-1];for(const q of pts)if(!r.length||dist(r[r.length-1],q)>=2.5)r.push({x:q.x,y:q.y})}if(!st.er)medMark(p);artLayerDraw(p,st.L,c=>{c.globalCompositeOperation='source-atop';if(!st.er){medSeg(c,AB.med,AB.col,pts,st.pk||1,p.med&&p.med.stock,st.B);return}/* v1.6b: every medium; T024: st.B mixes, st.pk is pen pressure */c.strokeStyle=p.color;c.lineWidth=15;c.lineCap=c.lineJoin='round';c.beginPath();pts.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));if(pts.length===1)c.lineTo(pts[0].x+.1,pts[0].y);c.stroke()})}
function cDown(e){const w=s2w(e.clientX,e.clientY),z=C.view.z,t=C.tool;C.ptr=w;C.hp=w;if(C.handA||C.tcut)return;let gh=guideAt(w);if(dsDown(w,gh,t))return;/* T024: desk supplies */
  if(gh&&gh.mode==='body'){if(t==='pencil'||t==='eraser'){if(!C.tipG){C.tipG=1;toast('Rulers and stencils stay put while you draw. Slide them with the round + grip.')}return}gh=null}
  if(gh&&gh.mode!=='snap'){C.st={k:'guide',g:gh.g,mode:gh.mode,w0:w,gx:gh.g.x,gy:gh.g.y,off:gh.g.rot-Math.atan2(w.y-gh.g.y,w.x-gh.g.x)};return}
  if(t==='hand'){if(C.sel&&dist(knobPos(C.sel),w)<24/z){checkpoint();const pl=plan(C.sel),piv=pl.mode==='swing'?pl.pivot:{x:C.sel.x,y:C.sel.y};C.st={k:'rot',set:pl.set,piv,a0:Math.atan2(w.y-piv.y,w.x-piv.x),moved:1};return}
    const p=topPieceAt(w.x,w.y);if(p){checkpoint();C.sel=p;const pl=plan(p);raise(pl.members);C.st=pl.mode==='swing'?{k:'rot',set:pl.set,piv:pl.pivot,a0:Math.atan2(w.y-pl.pivot.y,w.x-pl.pivot.x),moved:0}:{k:'move',set:pl.set,last:w,moved:0}}
    else{C.sel=null;C.st={k:'pan',sx:e.clientX,sy:e.clientY,vx:C.view.x,vy:C.view.y}}return}
  if(t==='pencil'||t==='eraser'){let p=null,snap=null,l;
    if(t==='pencil'&&gh){const q=plAt(gh.pl,gh.t);p=topPieceAt(q.x,q.y)||topPieceAt(w.x,w.y)||C.sel;if(p){const pl=plPrep(gh.pl.pts.map(u=>toLocal(p,u.x,u.y)),gh.pl.closed);snap={pl,t:gh.t,g:gh.g};l=plAt(pl,gh.t)}}
    else{p=topPieceAt(w.x,w.y);if(p)l=toLocal(p,w.x,w.y)}
    if(!p){toast(t==='pencil'?'The pencil draws on paper. Put a sheet down first.':'Rub the eraser over a pencil line.');return}
    checkpoint();settle(p);C.sel=p;let L=null;if(p.layers){L=topLayer(p,l)||topLayer(p,toLocal(p,w.x,w.y))||p.layers[p.layers.length-1]}
    C.st={k:'draw',p,L,last:l,snap,er:t==='eraser',rec:[[]],lw:w,lt:performance.now()};drawStart(C.st,e,t);/* T024 */drawSeg(C.st,[l]);return}
  if(t==='teacher'){const b=teacherAt(w);if(!b)toast('Draw a pencil line first. Then tap the line and the teacher cuts along it.');else startTeacher(b);return}
  if(t==='compass'){C.st={k:'compass',c:w,r:0,w,target:topPieceAt(w.x,w.y)||C.sel};return}
  if(t==='punch'){const p=topPieceAt(w.x,w.y);if(!p){toast('Punch a hole in a paper');return}checkpoint();settle(p);const l=toLocal(p,w.x,w.y);eachLayerDraw(p,c=>{c.globalCompositeOperation='destination-out';c.beginPath();c.arc(l.x,l.y,8,0,TAU);c.fill()});SFX.punch();spawnBits(w,p.color,p.layers?p.layers.length:1);C.sel=p;splitPiece(p);saveDeskSoon();return}
  if(t in SCIS){C.st={k:'cut',kind:t,target:null,all:[],sm:w,s:0,rem:0,lastC:null,sd:0,rw:0,ang:0};return}
  if(t==='fold'){const p=topPieceAt(w.x,w.y)||C.sel;if(!p){toast('Put a paper down, then drag a corner or edge to fold it');return}if(isBonded(p)){toast('Unstick it first, then fold');return}const l=toLocal(p,w.x,w.y);C.sel=p;
    if(p.soft&&distSeg(l,p.soft.a,p.soft.b).d<28/z){C.st={k:'press',p,lw:w,lt:performance.now()};return}
    settle(p);checkpoint();const base=baseLayers(p),A=snapTo(foldCands(base),l,30/z)||l;C.st={k:'fold',p,base,prev:p.layers,A,B:A,ok:false};SFX.rustle();return}
  if(t==='gluestick'||t==='glue'){const p=topPieceAt(w.x,w.y);if(!p){toast('Put the glue on a paper, then lay another piece on top');return}checkpoint();const l=toLocal(p,w.x,w.y),d=t==='glue'?{type:'glue',dots:[{x:l.x,y:l.y,r:5}],t0:performance.now()}:{type:'stick',pts:[l],t0:performance.now()};p.deco.push(d);C.st={k:t,p,d,lw:w,lt:performance.now()};if(t==='glue')SFX.squish();return}
  if(t==='tape'){C.st={k:'tape',a:w,b:w,lw:w,lt:performance.now()};return}
  if(t==='pin'){const hits=[];for(let i=C.pieces.length-1;i>=0&&hits.length<2;i--)if(hitPiece(C.pieces[i],w.x,w.y))hits.push(C.pieces[i]);if(hits.length<2){toast('Lay one piece on another, then push the fastener through both');return}checkpoint();const[top,bot]=hits,l=toLocal(top,w.x,w.y);C.bonds.push({a:bot.id,b:top.id,type:'pin',la:toLocal(bot,w.x,w.y),lb:l,gid:++C.gid});top.deco.push({type:'pin',x:l.x,y:l.y,gid:C.gid});SFX.pin();toast('Pinned! Drag the top piece to swing it');C.sel=top;saveDeskSoon();return}
  if(t==='unstick'){const p=topPieceAt(w.x,w.y);if(!p||!isBonded(p)){toast('Tap a piece that is stuck to another');return}checkpoint();const gone=C.bonds.filter(b=>b.a===p.id||b.b===p.id).map(b=>b.gid);C.bonds=C.bonds.filter(b=>b.a!==p.id&&b.b!==p.id);C.pieces.forEach(q=>q.deco=q.deco.filter(d=>!gone.includes(d.gid)));SFX.peel();p.x+=8;p.y+=8;C.sel=p;saveDeskSoon()}}
function spd(st,w){const now=performance.now(),v=dist(w,st.lw)*C.view.z/Math.max(4,now-st.lt)*1000;st.lw=w;st.lt=now;return v}
function cMove(e){const st=C.st;if(!st)return;const w=s2w(e.clientX,e.clientY),z=C.view.z;C.ptr=w;C.hp=w;
  switch(st.k){
    case'pan':C.view.x=st.vx-(e.clientX-st.sx)/z;C.view.y=st.vy-(e.clientY-st.sy)/z;clampView();break;
    case'guide':{const G=st.g;if(st.mode==='move'){G.x=st.gx+w.x-st.w0.x;G.y=st.gy+w.y-st.w0.y}else if(st.mode==='rot')G.rot=Math.atan2(w.y-G.y,w.x-G.x)+st.off;else{const d=dist(w,G);G.size=clamp((d/Math.SQRT2+18)*2,90,440);G.rot=Math.atan2(w.y-G.y,w.x-G.x)-Math.PI/4}st.moved=1;break}
    case'move':{const dx=w.x-st.last.x,dy=w.y-st.last.y;st.set.forEach(p=>{p.x+=dx;p.y+=dy});st.last=w;st.moved+=Math.abs(dx)+Math.abs(dy);break}
    case'rot':{const a=Math.atan2(w.y-st.piv.y,w.x-st.piv.x);rotateSet(st.set,st.piv,a-st.a0);st.moved+=Math.abs(a-st.a0)*50;st.a0=a;break}
    case'draw':{const p=st.p;if(st.snap){const pj=plProj(st.snap.pl,toLocal(p,w.x,w.y),st.snap.t);if(pj){const pts=plPath(st.snap.pl,st.snap.t,pj.t),e=toWorld(p,pts[pts.length-1]);if(underGuide(e,st.snap.g)){if(st.rec[st.rec.length-1].length)st.rec.push([])}else drawSeg(st,pts);st.snap.t=pj.t;st.last=pts[pts.length-1]}}else{const l=toLocal(p,w.x,w.y);if(underGuide(w)){st.last=null;if(st.rec[st.rec.length-1].length)st.rec.push([])}else{drawFree(st,l,e);/* T024 */st.last=l}}rub(st.er?'eraser':medSound(AB.med),spd(st,w));break}
    case'compass':st.r=dist(w,st.c);st.w=w;break;
    case'cut':cutMove(st,w);break;
    case'fold':{const p=st.p,l=toLocal(p,w.x,w.y),B=snapTo(foldCands(st.base),l,20/z,st.A)||l;st.B=B;st.ok=false;p.layers=st.prev;p.dirty=true;if(dist(st.A,B)<10)break;
      const P={x:(st.A.x+B.x)/2,y:(st.A.y+B.y)/2},dv={x:(B.x-st.A.x),y:(B.y-st.A.y)},len=Math.hypot(dv.x,dv.y),d={x:-dv.y/len,y:dv.x/len},res=doFold(st.base,P,d,1,C.foldType);
      if(res){if(res.layers.length>24){st.thick=true;break}st.thick=false;p.layers=res.layers;st.res=res;st.ok=true;st.P=P;st.d=d}break}
    case'press':{const p=st.p;if(!p.soft){C.st=null;break}const r=distSeg(toLocal(p,w.x,w.y),p.soft.a,p.soft.b);if(r.d<30/z){p.soft.bins[Math.min(9,Math.floor(r.f*10))]=1;rub('crease',spd(st,w));if(p.soft.bins.reduce((a,b)=>a+b,0)>=7){settle(p);SFX.crease();toast('Nice crease!');C.st=null;saveDeskSoon()}}break}
    case'gluestick':{const l=toLocal(st.p,w.x,w.y);if(hitPiece(st.p,w.x,w.y)&&dist(l,st.d.pts[st.d.pts.length-1])>5)st.d.pts.push(l);rub('glue',spd(st,w));break}
    case'glue':{const l=toLocal(st.p,w.x,w.y),last=st.d.dots[st.d.dots.length-1];if(dist(l,last)>16&&hitPiece(st.p,w.x,w.y)){st.d.dots.push({x:l.x,y:l.y,r:5});if(Math.random()<.4)SFX.squish()}break}
    case'tape':st.b=w;if(dist(st.a,w)>230){const a=Math.atan2(w.y-st.a.y,w.x-st.a.x);st.b={x:st.a.x+Math.cos(a)*230,y:st.a.y+Math.sin(a)*230}}rub('tape',spd(st,w));break}}
function cutMove(st,w){const prev=st.sm;st.sm={x:prev.x+(w.x-prev.x)*.6,y:prev.y+(w.y-prev.y)*.6};if(dist(prev,st.sm)>.5)st.ang=Math.atan2(st.sm.y-prev.y,st.sm.x-prev.x);
  if(!st.target||!hitPiece(st.target,st.sm.x,st.sm.y)){const t=topPieceAt(st.sm.x,st.sm.y);if(t&&t!==st.target){if(!st.all.length)checkpoint();settle(t);st.target=t;st.all.push(t);C.sel=t;st.lastC=null}if(!st.target)return}
  const p=st.target,a=toLocal(p,prev.x,prev.y),b=toLocal(p,st.sm.x,st.sm.y),dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);if(len<.5)return;
  const nx=-dy/len,ny=dx/len,pts=st.lastC?[st.lastC]:[];let t=st.rem;while(t<=len){st.s+=2;const off=cutOff(st);pts.push({x:a.x+dx*t/len+nx*off,y:a.y+dy*t/len+ny*off});t+=2}st.rem=t-len;
  if(pts.length>1){st.lastC=pts[pts.length-1];const tear=st.kind==='tear',kerf=tear?3.6:st.kind==='safety'?3.2:2.8;
    eachLayerDraw(p,c=>{c.lineCap='round';c.lineJoin=st.kind==='zigzag'?'miter':'round';const path=()=>{c.beginPath();pts.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y))};
      if(tear){c.globalCompositeOperation='source-atop';c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=10;path();c.stroke()}
      c.globalCompositeOperation='destination-out';c.lineWidth=kerf;path();c.stroke()})}
  st.sd+=len;if(st.sd>(st.kind==='tear'?7:20)){st.sd=0;if(hitPiece(p,st.sm.x,st.sm.y)||hitPiece(p,prev.x,prev.y)){st.kind==='tear'?SFX.tear():SFX.snip(st.kind)}}}
function cUp(e,cancel){const st=C.st;C.st=null;if(!st)return;const w=C.ptr;
  switch(st.k){
    case'guide':if(st.moved&&st.g.type!=='stencil')SFX.clack();else if(st.moved)SFX.tick();break;
    case'move':case'rot':if(st.moved<2)C.undo.pop();else{tryBond(st.set);saveDeskSoon()}break;
    case'draw':penFlush(st,true);dsStrokeEnd(st);/* T024 */if(!st.er)st.rec.forEach(r=>{if(r.length>1)st.p.strokes.push({pts:r})});saveDeskSoon();break;
    case'compass':if(st.r>8){const p=st.target;if(!p){toast('Put the compass point on a paper');break}checkpoint();settle(p);const c=toLocal(p,st.c.x,st.c.y),L=p.layers?(topLayer(p,c)||p.layers[p.layers.length-1]):null;C.anims.push({p,L,c,r:st.r,a0:Math.atan2(st.w.y-st.c.y,st.w.x-st.c.x)-p.rot,t:0,prev:0});const cp=[];for(let i=0;i<=56;i++)cp.push({x:c.x+Math.cos(i/56*TAU)*st.r,y:c.y+Math.sin(i/56*TAU)*st.r});p.strokes.push({pts:cp});C.sel=p}break;
    case'cut':if(st.target){let n=0;st.all.forEach(p=>{if(C.pieces.includes(p))n+=splitPiece(p).length-1});if(n>0)SFX.thwap();saveDeskSoon()}else toast(st.kind==='tear'?'Drag across the paper to tear it':'Drag the scissors across the paper');break;
    case'fold':{const p=st.p;if(st.ok&&!cancel){p.strokes=[];p.hist.push(st.prev);p.pend=st.res.segs;p.soft={a:st.res.soft.a,b:st.res.soft.b,bins:new Array(10).fill(0)};p.dirty=true;SFX.fold();setHint('Now rub along the glowing fold to press the crease');saveDeskSoon()}else{p.layers=st.prev;p.dirty=true;C.undo.pop();if(st.thick)toast('Too thick to fold again!')}break}
    case'gluestick':case'glue':saveDeskSoon();break;
    case'tape':{if(dist(st.a,st.b)<24)break;const found=[];for(let i=0;i<=4;i++){const q={x:st.a.x+(st.b.x-st.a.x)*i/4,y:st.a.y+(st.b.y-st.a.y)*i/4},p=topPieceAt(q.x,q.y);if(p&&!found.includes(p))found.push(p)}
      if(!found.length){toast('Stretch the tape across your paper pieces');break}checkpoint();const owner=found.reduce((a,b)=>C.pieces.indexOf(b)>C.pieces.indexOf(a)?b:a),gid=++C.gid;owner.deco.push({type:'tape',a:toLocal(owner,st.a.x,st.a.y),b:toLocal(owner,st.b.x,st.b.y),gid});
      const{rig}=groups();for(let i=1;i<found.length;i++)if(rig.get(found[i].id)!==rig.get(found[0].id))C.bonds.push({a:found[0].id,b:found[i].id,type:'tape',gid});SFX.tape();if(found.length>1)toast('Taped together!');saveDeskSoon();break}}}
function teacherAt(w){let best=null;const thr=26/C.view.z;for(let i=C.pieces.length-1;i>=0;i--){const p=C.pieces[i],l=toLocal(p,w.x,w.y);for(const s2 of p.strokes)for(let j=1;j<s2.pts.length;j++){const r=distSeg(l,s2.pts[j-1],s2.pts[j]);if(r.d<thr&&(!best||r.d<best.d))best={d:r.d,p,s:s2}}}return best}
function startTeacher(b){const p=b.p,s2=b.s;checkpoint();settle(p);const pts=s2.pts.map(q=>({x:q.x,y:q.y})),n=pts.length,ext=(a,o)=>{const l=dist(a,o)||1;return{x:a.x+(a.x-o.x)/l*12,y:a.y+(a.y-o.y)/l*12}};
  if(dist(pts[0],pts[n-1])<18&&n>6)pts.push(pts[0],pts[1]);else{const a0=ext(pts[0],pts[Math.min(3,n-1)]),a1=ext(pts[n-1],pts[Math.max(0,n-4)]);pts.unshift(a0);pts.push(a1)}
  p.strokes=p.strokes.filter(x=>x!==s2);C.sel=p;C.tcut={p,pts,i:0,pos:pts[0],ang:0,sd:0,s:0}}
function updTeacher(){const t=C.tcut;let d=320*DT;const seg=[t.pos];t.sd+=d;t.s+=d;while(d>0&&t.i<t.pts.length-1){const b=t.pts[t.i+1],l=dist(t.pos,b);if(l>.01)t.ang=Math.atan2(b.y-t.pos.y,b.x-t.pos.x);if(l<=d){d-=l;t.pos=b;t.i++}else{t.pos={x:t.pos.x+(b.x-t.pos.x)*d/l,y:t.pos.y+(b.y-t.pos.y)*d/l};d=0}seg.push(t.pos)}
  if(seg.length>1)eachLayerDraw(t.p,c=>{c.globalCompositeOperation='destination-out';c.lineWidth=2.8;c.lineCap=c.lineJoin='round';c.beginPath();seg.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));c.stroke()});
  if(t.sd>22){t.sd=0;SFX.snip('regular')}
  if(t.i>=t.pts.length-1){C.tcut=null;const out=C.pieces.includes(t.p)?splitPiece(t.p):[];if(out.length>1)SFX.thwap();toast(out.length>1?'The teacher cut it out for you':'Cut done. A piece comes free when the line reaches an edge or closes up.');saveDeskSoon()}}
function cPinch(pz){const c=C.ctr,v=C.view;if(!pz.z0){pz.z0=v.z;pz.wm={x:(pz.mx-c.x)/v.z+v.x,y:(pz.my-c.y)/v.z+v.y}}v.z=clamp(pz.z0*pz.d/pz.d0,.3,3);v.x=pz.wm.x-(pz.cx-c.x)/v.z;v.y=pz.wm.y-(pz.cy-c.y)/v.z;clampView()}
function clampView(){C.view.x=clamp(C.view.x,-640,640);C.view.y=clamp(C.view.y,-780,780)}
/* ================= every frame ================= */
function updCraft(){C.ctr=deskCtr();if(C.tcut)updTeacher();
  if(C.handA){const h=C.handA;h.t+=DT/1.25;const e=clamp(h.t/.5,0,1),k=1-Math.pow(1-e,3);h.p.y=h.ty-1100*(1-k);if(h.t>.5&&!h.snd){h.snd=true;SFX.thwap()}if(h.t>=1){h.p.y=h.ty;C.handA=null;saveDeskSoon()}}
  if(C.st&&C.st.k==='glue'){const d=C.st.d.dots,q=d[d.length-1];q.r=Math.min(13,q.r+DT*12)}
  for(const a of C.anims){a.t=Math.min(1,a.t+DT/.5);const ang=a.t*TAU;artLayerDraw(a.p,a.L,c=>{c.globalCompositeOperation='source-atop';c.strokeStyle='rgba(50,50,58,.86)';c.lineWidth=2.2;c.lineCap='round';c.beginPath();c.arc(a.c.x,a.c.y,a.r,a.a0+a.prev-.02,a.a0+ang);c.stroke()});a.prev=ang;rub('compass',400);if(a.t>=1)saveDeskSoon()}
  C.anims=C.anims.filter(a=>a.t<1);
  for(const b of C.bits){b.x+=b.vx*DT;b.y+=b.vy*DT;b.vy+=260*DT;b.r+=b.vr*DT;b.life-=DT*.9}C.bits=C.bits.filter(b=>b.life>0)}
function drawScissors(c,x,y,ang,open,col){c.save();c.translate(x,y);c.rotate(ang);c.translate(-52,0);for(const s of[-1,1]){c.save();c.rotate(s*open/2);c.fillStyle='#cfd5dd';c.strokeStyle='#7c858f';c.lineWidth=1;c.beginPath();c.moveTo(52,0);c.lineTo(0,-5*s);c.lineTo(-4,1*s);c.closePath();c.fill();c.stroke();c.strokeStyle=col;c.lineWidth=6;c.beginPath();c.ellipse(-22,-11*s,15,9,0,0,TAU);c.stroke();c.restore()}c.fillStyle='#555';c.beginPath();c.arc(0,0,3,0,TAU);c.fill();c.restore()}
function drawCraft(){const v=C.view,ct=C.ctr||deskCtr(),z=v.z;g.fillStyle='#5b3d2b';g.fillRect(0,0,W,H);g.save();g.translate(ct.x,ct.y);g.scale(z,z);g.translate(-v.x,-v.y);
  g.fillStyle='rgba(0,0,0,.35)';rr(g,-648,-788,1316,1596,26);g.fill();g.fillStyle=g.createPattern(WOOD,'repeat');rr(g,-660,-800,1320,1600,24);g.fill();asCover('room_desk',g,-660,-800,1320,1600);/* T022 */g.strokeStyle='rgba(90,55,25,.6)';g.lineWidth=5;g.stroke();
  g.fillStyle='rgba(70,40,15,.35)';rr(g,-230,-770,460,36,18);g.fill();g.save();g.translate(-150,-752);g.fillStyle='#f5d142';g.fillRect(0,-6,250,12);g.fillStyle='#f191b3';g.fillRect(-22,-6,22,12);g.fillStyle='#b9bcc2';g.fillRect(-4,-6,8,12);g.fillStyle='#e8c9a0';g.beginPath();g.moveTo(250,-6);g.lineTo(272,0);g.lineTo(250,6);g.fill();g.fillStyle='#333';g.beginPath();g.moveTo(264,-2.2);g.lineTo(272,0);g.lineTo(264,2.2);g.fill();g.restore();
  dsDraw(g);/* T024 */for(const p of C.pieces){if(C.handA&&C.handA.p===p)continue;drawPiece(g,p)}asGuide(g);/* T022 */
  if(C.sel&&!(C.handA&&C.handA.p===C.sel)){const p=C.sel,k=ensureSkin(p);g.save();g.transform(...pm(p));g.strokeStyle='rgba(255,255,255,.95)';g.lineWidth=2.2/z;g.setLineDash([9/z,7/z]);g.lineDashOffset=-NOW/60;g.strokeRect(k.ox-5,k.oy-5,k.c.width+10,k.c.height+10);g.setLineDash([]);g.restore();
    if(C.tool==='hand'){const kp=knobPos(p);g.fillStyle='#fff';g.strokeStyle='#3b2f2a';g.lineWidth=2/z;g.beginPath();g.arc(kp.x,kp.y,14/z,0,TAU);g.fill();g.stroke();g.fillStyle='#3b2f2a';g.font='900 '+(17/z)+'px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText('↻',kp.x,kp.y+1/z)}}
  drawGuides(g);
  for(const b of C.bits){g.save();g.translate(b.x,b.y);g.rotate(b.r);g.globalAlpha=clamp(b.life,0,1);g.fillStyle=b.color;g.fillRect(-b.s/2,-b.s/2,b.s,b.s*.8);g.restore()}
  const st=C.st;if(st){
    if(st.k==='compass'&&st.r>2){g.strokeStyle='rgba(50,50,58,.5)';g.lineWidth=1.5/z;g.setLineDash([6/z,5/z]);g.beginPath();g.arc(st.c.x,st.c.y,st.r,0,TAU);g.stroke();g.setLineDash([]);const mx=(st.c.x+st.w.x)/2,my=(st.c.y+st.w.y)/2-Math.max(60,st.r*.9);g.strokeStyle='#8a8f98';g.lineWidth=5/z;g.lineCap='round';g.beginPath();g.moveTo(st.c.x,st.c.y);g.lineTo(mx,my);g.lineTo(st.w.x,st.w.y);g.stroke();g.fillStyle='#d9463e';g.beginPath();g.arc(mx,my,8/z,0,TAU);g.fill();g.fillStyle='#333';g.beginPath();g.arc(st.c.x,st.c.y,3/z,0,TAU);g.fill()}
    if(st.k==='tape'&&dist(st.a,st.b)>4)drawTape(g,st.a,st.b);
    if(st.k==='cut'){if(st.kind==='tear'){g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(st.sm.x,st.sm.y,10/z,0,TAU);g.fill()}else drawScissors(g,st.sm.x,st.sm.y,st.ang,.15+.5*Math.abs(Math.sin(st.s*.08)),SCIS[st.kind])}
    if(st.k==='fold'&&st.ok){const p=st.p;g.save();g.transform(...pm(p));g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=2.5/z;g.setLineDash([8/z,6/z]);g.beginPath();g.moveTo(st.res.soft.a.x,st.res.soft.a.y);g.lineTo(st.res.soft.b.x,st.res.soft.b.y);g.stroke();g.setLineDash([]);g.restore()}}
  if(C.tcut){const t=C.tcut;g.save();g.transform(...pm(t.p));drawScissors(g,t.pos.x,t.pos.y,t.ang,.15+.5*Math.abs(Math.sin(t.s*.08)),'#2f7d4f');g.restore()}
  if(C.handA){const h=C.handA,p=h.p;drawPiece(g,p);const out=clamp((h.t-.68)/.32,0,1);drawHand(g,p.x+10,p.y-70-out*out*1300,h.t>.5&&h.t<.68)}
  dsDrawHeld(g);/* T024 */
  g.restore()}

/* ================= REAL DESK SUPPLIES AND THE PAINTING KIT (T024) =================
   Settings > Drawing tools: "Real desk" shows supplies on the School Desk; "Quick tools" hides them (the Art box works in both).
   A crayon box, a pencil cup and a marker tray sit above and below the paper; the painting kit (palette, brushes, palette knife, water cup) sits to the right.
   Tap one to pick it up: it shows in the Player Hand and the Pencil tool draws with it (it sets the Art box: AB.med, AB.col).
   Tap the bare desk with the Pencil tool to put it down: it stays where you left it. Saved as craftloft_desksupplies:
   {out:{id:[x,y,rot]} supplies lying on the desk, held: id in the hand, pal:{a,b,t,paint} the palette, bcol: paint on the brush, dirt:[r,g,b] old paint on a dirty brush, cup:[r,g,b] the water}.
   To add a supply: one more entry in DS_LIST (kind, medium, colour, home spot). */
const DS_CR={x:-262,y:-446,w:288,h:118},DS_CUP={x:150,y:-331},DS_TRAY={x:-150,y:318,w:300,h:112},DS_PAL={x:420,y:-150,rx:122,ry:92},DS_REST={x:326,y:8,w:196,h:156},DS_WAT={x:420,y:268,r:52};
const DS_TIPS={br_round:{k:1},br_flat:{k:1.7,flat:1},br_fine:{k:.35},knife:{k:1.8,flat:1,knife:1}};
const DSV=Object.assign({out:{},held:null,pal:{a:'#3767bb',b:'#f7d23e',t:.5,paint:'poster'},bcol:null,dirt:null,cup:null},LS.get('desksupplies',{}));
if(!DSV.out||typeof DSV.out!=='object')DSV.out={};
if(!DSV.pal||!MEDIUMS[DSV.pal.paint])DSV.pal={a:'#3767bb',b:'#f7d23e',t:.5,paint:'poster'};
const DS_LIST=[];
/* a pencil standing in the cup: its back end sits in the cup, the point fans out above it */
function dsCupHome(i){const r=i*.075,L=92;return{x:DS_CUP.x+i*5+Math.sin(r)*L,y:DS_CUP.y-4-Math.cos(r)*L,r}}
MCOLS.forEach((c,i)=>DS_LIST.push({id:'crayon_'+i,kind:'crayon',med:'crayon',col:c,name:'crayon',len:96,grp:'cr',home:{x:DS_CR.x+19+i*22.7,y:DS_CR.y+12,r:0}}));
DS_LIST.push({id:'pencil',kind:'pencil',med:'pencil',col:'#26221f',name:'pencil',len:92,grp:'cup',home:dsCupHome(-6)});
MCOLS.forEach((c,i)=>DS_LIST.push({id:'cpencil_'+i,kind:'pencil',med:'cpencil',col:c,name:'coloured pencil',len:92,grp:'cup',home:dsCupHome(i-5)}));
MCOLS.forEach((c,i)=>DS_LIST.push({id:'marker_'+i,kind:'marker',med:'marker',col:c,name:'marker',len:96,grp:'tray',home:{x:DS_TRAY.x+13+i*24.9,y:DS_TRAY.y+9,r:0}}));
[['br_round','round brush'],['br_flat','flat brush'],['br_fine','fine brush'],['knife','palette knife']].forEach((b,i)=>DS_LIST.push({id:b[0],kind:b[0]==='knife'?'knife':'brush',name:b[1],len:132,grp:'rest',home:{x:DS_REST.x+30+i*45,y:DS_REST.y+12,r:0}}));
if(DSV.held&&!DS_LIST.some(s=>s.id===DSV.held))DSV.held=null;
const DS={back:null};
function dsOn(){return SET.tools==='real'}
function dsSave(){LS.set('desksupplies',DSV)}
function dsById(id){return DS_LIST.find(s=>s.id===id)}
function dsHeld(){return dsOn()&&DSV.held?dsById(DSV.held):null}
function dsIsBrush(s){return!!s&&(s.kind==='brush'||s.kind==='knife')}
function dsPalCol(){const P=DSV.pal;return rgbHex(smix(hexRGB(P.a),hexRGB(P.b),P.t))}
function dsPos(s){const o=DSV.out[s.id];return o?{x:o[0],y:o[1],r:o[2]}:s.home}
/* the tip-up end of a supply (r = 0 points up the desk); the body runs from (x,y) down along its length */
function dsTail(s,p){return{x:p.x-Math.sin(p.r)*s.len,y:p.y+Math.cos(p.r)*s.len}}
/* brush shape and old paint for the stroke being started (null with Quick tools) */
function dsTip(){const s=dsHeld();return s&&DS_TIPS[s.id]||null}
function dsDirt(){const s=dsHeld();return dsIsBrush(s)&&DSV.dirt||null}
function dsStrokeEnd(st){if(st.er||!st.B)return;const s=dsHeld();if(!dsIsBrush(s))return;DSV.bcol=AB.col;if(st.B.picked&&st.B.pick&&blendOn())DSV.dirt=st.B.pick.map(v=>Math.round(v));dsSave()}
function medSound(m){const M=MEDIUMS[m];return M&&M.sound&&RUBS[M.sound]?M.sound:'pencil'}
/* draw one supply. Local space: the drawing end is at (0,0), the body runs to (0,len). */
function dsItem(c,s,loadCol){const L=s.len,col=s.col;c.lineJoin='round';
  if(s.kind==='crayon'){c.fillStyle=col;c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1.2;c.beginPath();c.moveTo(-3,0);c.lineTo(3,0);c.lineTo(8,16);c.lineTo(8,L);c.lineTo(-8,L);c.lineTo(-8,16);c.closePath();c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.55)';c.fillRect(-8,30,16,46);c.strokeStyle='rgba(0,0,0,.3)';c.strokeRect(-8,30,16,46);c.fillStyle=col;c.fillRect(-8,48,16,10);c.fillStyle='rgba(255,255,255,.25)';c.fillRect(-6,16,3,L-16)}
  else if(s.kind==='pencil'){const lead=s.med==='pencil'?'#3a3a42':col,body=s.med==='pencil'?'#f5d142':col;c.fillStyle='#e8c9a0';c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1;c.beginPath();c.moveTo(0,0);c.lineTo(4.5,15);c.lineTo(-4.5,15);c.closePath();c.fill();c.stroke();c.fillStyle=lead;c.beginPath();c.moveTo(0,0);c.lineTo(1.9,6);c.lineTo(-1.9,6);c.closePath();c.fill();c.fillStyle=body;c.fillRect(-4.5,15,9,L-15);c.strokeRect(-4.5,15,9,L-15);c.fillStyle='rgba(255,255,255,.3)';c.fillRect(-3,15,2,L-15);if(s.med==='pencil'){c.fillStyle='#b9bcc2';c.fillRect(-4.5,L-13,9,5);c.fillStyle='#f191b3';c.fillRect(-4.5,L-8,9,8);c.strokeRect(-4.5,L-8,9,8)}}
  else if(s.kind==='marker'){c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1.2;c.fillStyle=col;c.beginPath();c.moveTo(-3,0);c.lineTo(3,0);c.lineTo(5,10);c.lineTo(-5,10);c.closePath();c.fill();c.stroke();rr(c,-9,10,18,34,4);c.fill();c.stroke();c.fillStyle='#f4f1ea';rr(c,-8,44,16,L-44,4);c.fill();c.stroke();c.fillStyle=col;c.fillRect(-8,60,16,8);c.fillStyle='rgba(255,255,255,.3)';c.fillRect(-6,12,3,30)}
  else if(s.kind==='brush'){const T=DS_TIPS[s.id],bw=T.flat?9:T.k<1?2.6:6,bl=T.flat?18:T.k<1?16:22,pc=loadCol||'#c9b79a';c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1;c.fillStyle=pc;c.beginPath();if(T.flat){c.rect(-bw,0,bw*2,bl)}else{c.moveTo(0,0);c.quadraticCurveTo(bw*1.3,bl*.55,bw*.8,bl);c.lineTo(-bw*.8,bl);c.quadraticCurveTo(-bw*1.3,bl*.55,0,0)}c.fill();c.stroke();c.fillStyle='#b9bcc2';c.fillRect(-Math.max(3.4,bw*.8),bl,Math.max(6.8,bw*1.6),16);c.strokeRect(-Math.max(3.4,bw*.8),bl,Math.max(6.8,bw*1.6),16);c.fillStyle=s.id==='br_flat'?'#2f7d4f':s.id==='br_fine'?'#3767bb':'#d9463e';c.beginPath();c.moveTo(-4,bl+16);c.lineTo(4,bl+16);c.lineTo(2.4,L);c.lineTo(-2.4,L);c.closePath();c.fill();c.stroke()}
  else{c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=1;c.fillStyle=loadCol||'#d5dae0';c.beginPath();c.moveTo(0,0);c.lineTo(9,26);c.lineTo(3,56);c.lineTo(-3,56);c.lineTo(-9,26);c.closePath();c.fill();c.stroke();c.fillStyle='#b9bcc2';c.fillRect(-2.5,56,5,14);c.fillStyle='#8b5a3c';rr(c,-6,70,12,L-70,5);c.fill();c.stroke()}}
function dsLoadCol(s){if(!dsIsBrush(s))return null;if(DSV.held===s.id&&(DSV.bcol||DSV.dirt))return DSV.dirt?rgbCss(smix(hexRGB(AB.col),DSV.dirt,.4)):AB.col;return null}
/* the desk furniture and every supply that is not in the hand (drawn under the paper) */
function dsDraw(c){if(!dsOn())return;c.save();c.lineJoin='round';
  /* crayon box */
  let B=DS_CR;c.fillStyle='rgba(0,0,0,.22)';rr(c,B.x+5,B.y+7,B.w,B.h,10);c.fill();c.fillStyle='#f0b429';rr(c,B.x,B.y,B.w,B.h,10);c.fill();c.strokeStyle='rgba(90,55,25,.7)';c.lineWidth=3;c.stroke();c.fillStyle='#3a2a1c';rr(c,B.x+8,B.y+6,B.w-16,B.h-12,6);c.fill();
  /* marker tray */
  B=DS_TRAY;c.fillStyle='rgba(0,0,0,.22)';rr(c,B.x+5,B.y+7,B.w,B.h,12);c.fill();c.fillStyle='#8fa3b5';rr(c,B.x,B.y,B.w,B.h,12);c.fill();c.strokeStyle='rgba(40,55,70,.7)';c.lineWidth=3;c.stroke();c.fillStyle='#5f7284';rr(c,B.x+7,B.y+5,B.w-14,B.h-10,8);c.fill();
  /* brush rest */
  B=DS_REST;c.fillStyle='rgba(0,0,0,.2)';rr(c,B.x+5,B.y+7,B.w,B.h,12);c.fill();c.fillStyle='#e9dcc0';rr(c,B.x,B.y,B.w,B.h,12);c.fill();c.strokeStyle='rgba(90,55,25,.6)';c.lineWidth=3;c.stroke();c.fillStyle='rgba(90,55,25,.25)';c.fillRect(B.x+8,B.y+62,B.w-16,10);
  /* palette */
  const P=DS_PAL,pal=DSV.pal;c.fillStyle='rgba(0,0,0,.22)';c.beginPath();c.ellipse(P.x+5,P.y+8,P.rx,P.ry,0,0,TAU);c.fill();c.fillStyle='#d8b07a';c.beginPath();c.ellipse(P.x,P.y,P.rx,P.ry,0,0,TAU);c.fill();c.strokeStyle='rgba(90,55,25,.7)';c.lineWidth=3;c.stroke();c.fillStyle='#5b3d2b';c.beginPath();c.ellipse(P.x-74,P.y+38,17,13,0,0,TAU);c.fill();
  const blob=(x,y,r,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,r,r*.8,0,0,TAU);c.fill();c.fillStyle='rgba(255,255,255,.3)';c.beginPath();c.ellipse(x-r*.3,y-r*.3,r*.3,r*.18,-.6,0,TAU);c.fill()};
  blob(P.x-52,P.y-38,24,pal.a);blob(P.x+8,P.y-52,24,pal.b);blob(P.x+48,P.y+14,38,dsPalCol());c.fillStyle='rgba(60,35,15,.75)';c.font='900 15px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('Palette',P.x-18,P.y+66);
  /* water cup */
  const Wc=DS_WAT;c.fillStyle='rgba(0,0,0,.22)';c.beginPath();c.arc(Wc.x+5,Wc.y+8,Wc.r,0,TAU);c.fill();c.fillStyle='#e8eef2';c.beginPath();c.arc(Wc.x,Wc.y,Wc.r,0,TAU);c.fill();c.strokeStyle='rgba(60,80,100,.7)';c.lineWidth=3;c.stroke();c.fillStyle=rgbCss(DSV.cup||[178,220,244]);c.beginPath();c.arc(Wc.x,Wc.y,Wc.r-9,0,TAU);c.fill();c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=2.5;c.beginPath();c.arc(Wc.x-6,Wc.y-6,Wc.r-22,3.4,4.6);c.stroke();c.fillStyle='rgba(30,50,70,.75)';c.fillText('Water',Wc.x,Wc.y+Wc.r+14);
  /* the supplies: pencils first (they stand behind the cup), then the cup, then everything else */
  const one=s=>{if(DSV.held===s.id)return;const p=dsPos(s);c.save();c.translate(p.x,p.y);c.rotate(p.r);if(DSV.out[s.id]){c.shadowColor='rgba(0,0,0,.3)';c.shadowBlur=5;c.shadowOffsetY=3}dsItem(c,s,dsLoadCol(s));c.restore()};
  DS_LIST.forEach(s=>{if(s.grp==='cup'&&!DSV.out[s.id])one(s)});
  const U=DS_CUP;c.fillStyle='rgba(0,0,0,.22)';rr(c,U.x-50,U.y-22,108,58,12);c.fill();c.fillStyle='#d9463e';rr(c,U.x-54,U.y-28,108,58,12);c.fill();c.strokeStyle='rgba(90,25,20,.7)';c.lineWidth=3;c.stroke();c.fillStyle='rgba(255,255,255,.25)';rr(c,U.x-46,U.y-22,14,46,6);c.fill();
  DS_LIST.forEach(s=>{if(s.grp!=='cup'||DSV.out[s.id])one(s)});
  /* front lips, so things look tucked in */
  B=DS_CR;c.fillStyle='#f0b429';rr(c,B.x,B.y+B.h-38,B.w,38,10);c.fill();c.strokeStyle='rgba(90,55,25,.7)';c.lineWidth=3;c.stroke();c.fillStyle='rgba(60,35,15,.8)';c.font='900 17px system-ui';c.fillText('CRAYONS',B.x+B.w/2,B.y+B.h-18);
  B=DS_TRAY;c.fillStyle='#8fa3b5';rr(c,B.x,B.y+B.h-30,B.w,30,12);c.fill();c.strokeStyle='rgba(40,55,70,.7)';c.stroke();c.fillStyle='rgba(25,40,55,.8)';c.fillText('MARKERS',B.x+B.w/2,B.y+B.h-14);
  c.restore()}
/* the supply in the hand: drawn on top of everything, with the Player Hand holding it */
function dsDrawHeld(c){const s=dsHeld();if(!s||SCR!=='craft')return;const hp=C.hp||{x:C.view.x+120,y:C.view.y+150},down=!!(C.st&&C.st.k==='draw');
  c.save();c.translate(hp.x,hp.y);c.rotate(Math.PI+.22);dsItem(c,s,dsLoadCol(s));c.restore();
  c.save();c.globalAlpha=down?.45:1;drawHand(c,hp.x+12,hp.y-112,down);c.restore()}
/* what a tap on the bare desk hits: a supply, the palette or the water cup */
function dsHit(w){const z=C.view.z,near=14+10/z;let best=null,bd=1e9;
  for(const s of DS_LIST){if(DSV.held===s.id)continue;const p=dsPos(s),d=distSeg(w,p,dsTail(s,p)).d;if(d<bd){bd=d;best=s}}
  if(best&&bd<near)return{s:best,d:bd};
  const P=DS_PAL;if(Math.pow((w.x-P.x)/P.rx,2)+Math.pow((w.y-P.y)/P.ry,2)<1)return{pal:1};
  if(dist(w,DS_WAT)<DS_WAT.r+6)return{cup:1};
  return null}
/* how far apart the supplies in a holder are, in screen pixels: too close and the first tap zooms in instead */
function dsCrowd(s){if(DSV.out[s.id])return 99;const sp={cr:22.7,cup:11,tray:24.9,rest:45}[s.grp];return sp*C.view.z}
function dsDown(w,gh,t){if(!dsOn()||gh||topPieceAt(w.x,w.y))return false;const h=dsHit(w);
  if(!h){if(DSV.held&&t==='pencil'){dsPutDown(w);return true}return false}
  auInit();
  if(h.pal){paletteDlg();return true}
  if(h.cup){dsRinse();return true}
  const s=h.s;if(dsCrowd(s)<27){DS.back={x:C.view.x,y:C.view.y,z:C.view.z};const p=s.home,sp={cr:22.7,cup:11,tray:24.9,rest:45}[s.grp];C.view.z=clamp(32/sp,1,3);C.view.x=clamp(w.x,-560,560);C.view.y=p.y+s.len*.45;toast('Tap the '+s.name+' you want');SFX.tick();return true}
  dsPick(s);return true}
function dsPick(s){DSV.held=s.id;delete DSV.out[s.id];
  if(dsIsBrush(s)){AB.med=s.kind==='knife'?'poster':DSV.pal.paint;AB.col=dsPalCol()}else{AB.med=s.med;AB.col=s.col;}
  saveAB();dsSave();C.cat='draw';C.tool='pencil';if(DS.back){Object.assign(C.view,DS.back);DS.back=null}renderTabs();SFX.tick();
  toast(dsIsBrush(s)?'You picked up the '+s.name+'. Tap the palette to mix a colour.':'You picked up a '+s.name+'. Tap the bare desk to put it down.')}
function dsPutDown(w){const s=dsHeld();if(!s)return;const r=+(rnd(-.5,.5)+(Math.random()<.5?1.57:-1.57)).toFixed(2);DSV.out[s.id]=[Math.round(w.x+Math.sin(r)*s.len/2),Math.round(w.y-Math.cos(r)*s.len/2),r];/* it lies with its middle where you tapped */DSV.held=null;dsSave();SFX.clack();renderChips();toast('You put the '+s.name+' down. It stays there until you pick it up.')}
/* back in its box (the Art box took over) */
function dsPutAway(){if(!DSV.held)return;DSV.held=null;dsSave()}
function dsRinse(){const s=dsHeld();if(!dsIsBrush(s)){toast('The water cup rinses a paintbrush. Pick up a brush first.');return}const old=DSV.dirt||(DSV.bcol?hexRGB(DSV.bcol):null);if(!old){toast('The brush is already clean.');return}
  DSV.cup=smix(DSV.cup||[178,220,244],old,.35).map(v=>Math.round(v));DSV.dirt=null;DSV.bcol=null;dsSave();SFX.squish();toast('Swish! The brush is clean.')}
/* the palette: mix two paints (spectral.js), then the mix goes on the brush */
function paletteDlg(){const P=Object.assign({},DSV.pal),row=(id,cur)=>'<div class="mcols" id="'+id+'">'+MCOLS.map(c=>'<button class="mcol'+(cur===c?' on':'')+'" data-c="'+c+'" style="background:'+c+'" aria-label="colour '+c+'"></button>').join('')+'</div>';
  dlg('<h2>🎨 Palette</h2><p style="margin:2px 0 6px;font-size:13px">Pick two paints and slide to mix them. The mix goes on your brush.</p><div class="pseg" id="pPaint"><button data-p="poster">🎨 Poster paint</button><button data-p="water">💧 Watercolour</button></div><label class="lb">First paint</label>'+row('pA',P.a)+'<label class="lb">Second paint</label>'+row('pB',P.b)+'<canvas id="pMix" width="280" height="56" style="width:100%;height:56px;border-radius:10px;margin-top:10px"></canvas><input type="range" id="pT" min="0" max="1" step="0.04" value="'+P.t+'" aria-label="How much of the second paint" style="width:100%"><div class="btns"><button class="alt" id="dNo">Close</button><button id="dYes">🖌️ Load the brush</button></div>',d=>{
    const paint=()=>{d.querySelectorAll('#pPaint button').forEach(b=>b.classList.toggle('on',b.dataset.p===P.paint));d.querySelectorAll('#pA .mcol').forEach(b=>b.classList.toggle('on',b.dataset.c===P.a));d.querySelectorAll('#pB .mcol').forEach(b=>b.classList.toggle('on',b.dataset.c===P.b));
      const cv2=d.querySelector('#pMix'),x=cv2.getContext('2d'),A=hexRGB(P.a),Bc=hexRGB(P.b);for(let i=0;i<28;i++){x.fillStyle=rgbCss(smix(A,Bc,i/27));x.fillRect(i*10,0,10,56)}const mx=P.t*270+5;x.fillStyle=rgbCss(smix(A,Bc,P.t));x.strokeStyle='#fff';x.lineWidth=4;x.beginPath();x.arc(mx,28,20,0,TAU);x.fill();x.stroke();x.strokeStyle='#3b2f2a';x.lineWidth=1.5;x.beginPath();x.arc(mx,28,22,0,TAU);x.stroke()};
    d.querySelectorAll('#pPaint button').forEach(b=>b.onclick=()=>{P.paint=b.dataset.p;SFX.tick();paint()});d.querySelectorAll('#pA .mcol').forEach(b=>b.onclick=()=>{P.a=b.dataset.c;SFX.tick();paint()});d.querySelectorAll('#pB .mcol').forEach(b=>b.onclick=()=>{P.b=b.dataset.c;SFX.tick();paint()});d.querySelector('#pT').oninput=e=>{P.t=+e.target.value;paint()};
    d.querySelector('#dNo').onclick=closeDlg;d.querySelector('#dYes').onclick=()=>{DSV.pal=P;closeDlg();dsLoadBrush()};paint()})}
function dsLoadBrush(){let s=dsHeld();if(!dsIsBrush(s)){s=dsById('br_round');DSV.held=s.id;delete DSV.out[s.id]}const col=dsPalCol();
  if(DSV.bcol&&DSV.bcol!==col){const old=hexRGB(DSV.bcol);DSV.dirt=DSV.dirt?smix(DSV.dirt,old,.5).map(v=>Math.round(v)):old}
  AB.med=s.kind==='knife'?'poster':DSV.pal.paint;AB.col=col;saveAB();dsSave();C.cat='draw';C.tool='pencil';renderTabs();SFX.squish();
  toast(DSV.dirt?'The brush still has old paint on it. It tints the new colour until you dip it in the water cup.':'Paint is on the '+s.name+'. Paint on the paper.')}
/* Draw tab chip: jump to the painting kit and back */
function dsPaintsChip(box){const b=document.createElement('button'),at=C.view.x>250;b.className='chip'+(at?' on':'');b.innerHTML='🖌️<small>'+(at?'Paper':'Paints')+'</small>';b.onclick=()=>{auInit();SFX.tick();if(C.view.x>250)fitDesk();else{C.view.x=420;C.view.y=46;C.view.z=clamp(Math.min((W-14)/300,((C.ctr||deskCtr()).h-8)/650),.35,1.6)}renderChips()};box.append(b)}
/* S Pen: perfect-freehand (MIT, lib/perfect-freehand.js) smooths the line and its pressure; the recipe's press curve turns pressure into width */
function drawStart(st,e,t){st.B=t==='pencil'?strokeStart(AB.med,AB.col,st.p.color,dsTip(),dsDirt()):null;if(t==='pencil'&&e&&e.pointerType==='pen'&&!st.snap&&typeof perfectFreehand!=='undefined'){const pr=e.pressure>0?e.pressure:.5;st.pen={pts:[[st.last.x,st.last.y,pr]],n:1};st.pk=pressK(AB.med,pr)}}
function drawFree(st,l,e){if(!st.pen){drawSeg(st,st.last?[st.last,l]:[l]);return}const P=st.pen;if(!st.last){P.pts=[];P.n=1}P.pts.push([l.x,l.y,e&&e.pressure>0?e.pressure:.5]);if(P.pts.length>=3)penFlush(st,false)}
function penFlush(st,end){const P=st.pen;if(!P||P.pts.length<2)return;const sp=perfectFreehand.getStrokePoints(P.pts,{size:8,streamline:.4,simulatePressure:false,last:end}),n=end?sp.length:sp.length-1;
  for(let i=Math.max(1,P.n);i<n;i++){st.pk=pressK(AB.med,sp[i].pressure);drawSeg(st,[{x:sp[i-1].point[0],y:sp[i-1].point[1]},{x:sp[i].point[0],y:sp[i].point[1]}])}P.n=Math.max(P.n,n);if(end)st.pen=null}

/* ================= UI: tabs, chips, screens, input ================= */
const svg=(d,fill)=>'<svg viewBox="0 0 40 20"><path d="'+d+'" fill="'+(fill||'none')+'" stroke="#3b2f2a" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CATS=[{id:'paper',em:'📄',name:'Paper',tool:'hand'},{id:'hand',em:'✋',name:'Move',tool:'hand'},{id:'draw',em:'✏️',name:'Draw',tool:'pencil'},{id:'cut',em:'✂️',name:'Cut',tool:'regular'},{id:'fold',em:'📃',name:'Fold',tool:'fold'},{id:'stick',em:'🧴',name:'Stick',tool:'gluestick'},{id:'done',em:'🧸',name:'Toy box'}];
const CHIPS={
  hand:[{tool:'hand',em:'✋',name:'Move'},{act:()=>actOrder(true),em:'⬆️',name:'To front'},{act:()=>actOrder(false),em:'⬇️',name:'To back'},{act:actTurn,em:'🔄',name:'Flip'},{act:actFlip,em:'↔️',name:'Mirror'},{act:actCopy,em:'👯',name:'Copy'},{act:actCrumple,em:'🫳',name:'Crumple'},{act:actBin,em:'🗑️',name:'Bin'}],
  draw:[{tool:'pencil',em:'✏️',name:'Pencil'},{tool:'eraser',em:'🧽',name:'Eraser'},{guide:'ruler',em:'📏',name:'Ruler'},{guide:'tri',em:'📐',name:'Triangle'},{tool:'compass',svg:svg('M20 2 L10 17 M20 2 L30 17 M12 18 Q20 13 28 18'),name:'Compass'},
    {guide:'stencil',shape:'circle',svg:svg('M20 2 a8 8 0 1 0 .01 0Z'),name:'Circle'},{guide:'stencil',shape:'star',svg:svg('M20 1 L22.6 7.4 L29.5 7.9 L24.2 12.3 L25.9 19 L20 15.3 L14.1 19 L15.8 12.3 L10.5 7.9 L17.4 7.4Z'),name:'Star'},{guide:'stencil',shape:'heart',svg:svg('M20 18 C6 9 11 1 20 6 C29 1 34 9 20 18Z'),name:'Heart'},{guide:'stencil',shape:'flower',svg:svg('M20 10 m-3 -8 q3 -2 6 0 q4 0 4 4 q3 3 0 6 q0 4 -4 4 q-3 3 -6 0 q-4 0 -4 -4 q-3 -3 0 -6 q0 -4 4 -4Z'),name:'Flower'},{act:actTurn,em:'🔄',name:'Flip'}],
  cut:[{tool:'regular',em:'✂️',name:'Scissors'},{tool:'safety',svg:svg('M2 10 Q11 6 20 10 T38 10'),name:'Safety'},{tool:'zigzag',svg:svg('M2 14 L6 6 L10 14 L14 6 L18 14 L22 6 L26 14 L30 6 L34 14 L38 6'),name:'Zigzag'},{tool:'wavy',svg:svg('M2 10 Q6.5 2 11 10 T20 10 T29 10 T38 10'),name:'Wavy'},{tool:'scallop',svg:svg('M2 7 Q6.5 19 11 7 Q15.5 19 20 7 Q24.5 19 29 7 Q33.5 19 38 7'),name:'Scallop'},{tool:'teacher',em:'🧑‍🏫',name:'Teacher cuts'},{tool:'punch',svg:svg('M20 4 a6 6 0 1 0 .01 0Z','#3b2f2a'),name:'Hole punch'},{tool:'tear',svg:svg('M2 9 L7 12 L10 7 L15 13 L19 8 L24 12 L27 6 L32 11 L38 8'),name:'Tear'}],
  fold:[{fold:'valley',svg:svg('M4 4 L20 16 L36 4'),name:'Valley fold'},{fold:'mountain',svg:svg('M4 16 L20 4 L36 16'),name:'Mountain fold'},{act:actAccordion,svg:svg('M2 16 L8 4 L14 16 L20 4 L26 16 L32 4 L38 16'),name:'Fan fold'},{act:()=>actUnfold(false),em:'↩️',name:'Unfold'},{act:()=>actUnfold(true),em:'📄',name:'Unfold all'}],
  stick:[{tool:'gluestick',em:'🖍️',name:'Glue stick'},{tool:'glue',em:'🧴',name:'School glue'},{tool:'tape',em:'🩹',name:'Tape'},{tool:'pin',em:'📍',name:'Fastener'},{tool:'unstick',em:'🫴',name:'Unstick'}]};
const HINTS={hand:'Drag a piece to move it. Turn it with the ↻ knob. Two fingers move and zoom the desk.',paper:'Pick a colour and a hand puts the sheet on your desk.',pencil:'Draw on the paper. Start beside a ruler edge or on a stencil edge to trace it. Rulers and stencils stay put: slide them with the + grip.',teacher:'Tap a pencil line and the teacher cuts exactly along it for you.',eraser:'Rub over pencil lines to erase them.',compass:'Press for the middle, drag out, let go for a circle.',
  regular:'Drag the scissors right across the paper, edge to edge.',safety:'Safety scissors: round and a little wobbly.',zigzag:'Zigzag edge. Cut all the way across.',wavy:'Wavy edge. Cut all the way across.',scallop:'Scallop edge. Cut all the way across.',punch:'Tap the paper to punch a hole.',tear:'Drag to tear the paper by hand.',
  fold:'Drag a corner or edge onto another to fold. Then rub the fold to press the crease.',gluestick:'Rub glue on a piece, then use Move to lay another piece on top.',glue:'Squeeze dots of glue on a piece, then lay another piece on top.',tape:'Drag a strip of tape across two pieces.',pin:'Tap where two pieces overlap to pin them. Pinned parts can swing.',unstick:'Tap a stuck piece to peel it off.'};
function setHint(t){$('#hint').textContent=t}
function renderTabs(){const tabs=$('#tabs');tabs.innerHTML='';CATS.forEach(c=>{const b=document.createElement('button');b.className='tab'+(C.cat===c.id?' on':'');b.innerHTML=c.em+'<small>'+c.name+'</small>';b.onclick=()=>{auInit();SFX.tick();if(c.id==='done'){actToyBox();return}C.cat=c.id;C.tool=c.tool;renderTabs()};tabs.append(b)});renderChips()}
function renderChips(){const box=$('#chips');box.innerHTML='';
  if(C.cat==='paper'){{const S=STOCKS[AB.stock],b=document.createElement('button');b.className='chip';b.innerHTML=S.em+'<small>'+S.name.split(' ')[0]+' ▾</small>';b.onclick=()=>{auInit();SFX.tick();stockDlg()};box.append(b)}/* v1.6b: paper stock */(STOCKS[AB.stock].col?[STOCKS[AB.stock].col]:PAPERS).forEach(col=>{const b=document.createElement('button');b.className='chip sw'+(C.color===col?' on':'');b.style.background=col;b.setAttribute('aria-label','paper');b.onclick=()=>{auInit();placePaper(col);renderChips()};box.append(b)});setHint(HINTS.paper);return}
  if(C.cat==='draw'){const b=document.createElement('button');b.className='chip';b.innerHTML='🎨<small>Art box</small>';b.onclick=()=>{auInit();SFX.tick();artBoxDlg()};box.append(b);if(dsOn())dsPaintsChip(box)/* T024 */}/* v1.6b */
  (CHIPS[C.cat]||[]).forEach(ch=>{const b=document.createElement('button');const on=ch.tool?C.tool===ch.tool:ch.fold?C.tool==='fold'&&C.foldType===ch.fold:ch.guide?C.guides.some(G=>G.type===ch.guide&&(!ch.shape||G.shape===ch.shape)):false;b.className='chip'+(on?' on':'');b.innerHTML=ch.tool==='pencil'?MEDIA[AB.med].em+'<small style="border-bottom:3px solid '+(MEDIA[AB.med].fixed||AB.col)+'">'+MEDIA[AB.med].name.split(' ')[0]+'</small>':(ch.svg||ch.em)+'<small>'+ch.name+'</small>';
    b.onclick=()=>{auInit();if(ch.tool){C.tool=ch.tool;SFX.tick()}else if(ch.fold){C.tool='fold';C.foldType=ch.fold;SFX.tick()}else if(ch.guide){if(toggleGuide(ch.guide,ch.shape))C.tool='pencil'}else if(ch.act)ch.act();renderChips()};box.append(b)});
  setHint(HINTS[C.tool]||'')}

/* ---- Flip paper: every sheet has a front and a back. p.art = the side you see, p.back = the other side, p.side = 'front' or 'back'.
   Both sides are stored in the side's own view (so the back's shape is the mirror of the front's). Turning over swaps them with a card-flip.
   The back shows a faint mirrored see-through of the front (see flatSkin). The desk save keeps both sides; toys can use either side. */
function mirDeco(d,w){const m=q=>({...q,x:w-q.x}),o={...d};if(d.pts)o.pts=d.pts.map(m);if(d.dots)o.dots=d.dots.map(m);if(d.a){o.a=m(d.a);o.b=m(d.b)}if(d.type==='pin')o.x=w-d.x;return o}
function turnOver(p){const w=p.w,h=p.h,mr=mkCanvas(w,h,true);mr._x.translate(w,0);mr._x.scale(-1,1);mr._x.drawImage(p.art,0,0);
  const nb=mkCanvas(w,h,true),x=nb._x;if(p.back&&p.back.width===w&&p.back.height===h)x.drawImage(p.back,0,0);else{x.fillStyle=p.color||'#f6f2e9';x.fillRect(0,0,w,h)}x.globalCompositeOperation='destination-in';x.drawImage(mr,0,0);x.globalCompositeOperation='source-over';
  p.back=p.art;p.art=nb;p.cow=false;p.side=p.side==='back'?'front':'back';p.creases=p.creases.map(c=>({a:{x:w-c.a.x,y:c.a.y},b:{x:w-c.b.x,y:c.b.y},type:c.type}));p.strokes=p.strokes.map(s2=>({pts:s2.pts.map(u=>({x:w-u.x,y:u.y}))}));p.deco=p.deco.map(d=>mirDeco(d,w));p.dirty=true;p.comp=null}
function actTurn(){const p=needSel();if(!p)return;if(p.layers||isBonded(p)){toast('Flip works on a flat, loose piece. Unfold or unstick it first.');return}checkpoint();const old=ensureSkin(p);turnOver(p);p.flipA={t0:NOW,old};SFX.peel();toast(p.side==='back'?'Back side. Draw on it too!':'Front side');saveDeskSoon()}
/* bake a toy from one side: pieces that show the other side are turned over for the bake, then turned back */
function bakeSide(p,name,side){const ms=plan(p).members.filter(q=>q.back&&(q.side||'front')!==side&&!q.layers&&!isBonded(q));ms.forEach(turnOver);let b;try{b=bakeToy(p,name)}finally{ms.forEach(turnOver)}return b}
function sheetOf(q){if(!q||!q.back)return null;const fr=q.side==='back'?q.back:q.art,bk=q.side==='back'?q.art:q.back;return{front:fr.toDataURL(),back:bk.toDataURL()}}
function sheetToDesk(toy){const v=C.view,a=new Image(),b=new Image();let n=2;const done=()=>{if(--n)return;const A=mkCanvas(a.width,a.height,true);A._x.drawImage(a,0,0);const B=mkCanvas(b.width,b.height,true);B._x.drawImage(b,0,0);const p=newPiece(A,v.x,v.y,0,toy.color||'#f6f2e9');p.med=medCopy(toy.med);p.back=B;p.side='front';C.pieces.push(p);C.sel=p;saveDeskSoon()};a.onload=done;b.onload=done;a.src=toy.sheet.front;b.src=toy.sheet.back}

/* ---- small helpers for thumbnails ---- */
function whenReady(t,fn){const s=sprite(t),go2=()=>{if(!s.ready){setTimeout(go2,120);return}fn()};go2()}
function fitToy(x,t,bx,by,bw,bh){const sc=Math.min(bw/t.w,bh/t.h);x.save();x.translate(bx+(bw-t.w*sc)/2,by+(bh-t.h*sc)/2);x.scale(sc,sc);drawToy(x,t,0,0);x.restore()}
