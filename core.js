'use strict';
/* Shoebox Studio: core.js — the loop, saves (LS), helpers, sound, Toy Box data, screens and input, the game clock, the room engine and the content pack loader. Loaded first. */

/* Shoebox Studio (was Craft Loft) v1.6c + T020 VHS spot + T021 picture examples + T022 Art Swap — by MajorasPride. All art, sound and music are made in code. No outside assets. */
const $=s=>document.querySelector(s);
const cv=$('#cv'),g=cv.getContext('2d');
let W=0,H=0,DPR=1,NOW=0,DT=0,SCR='title',FROM='',RESUMING=0;
/* v1.5: the game remembers where you left off (the studio, your house or Little Town) and starts you there. New players start in the studio. */
function resume(){const wh=(typeof LS!=='undefined'&&LS.get('where',null))||{s:'home'};const s=['home','house','town','shop'].includes(wh.s)?wh.s:'home';if(s==='house'){const hh=LS.get('househero',null);if(hh)HOUSE.hero=hh}if(s==='shop'){if(wh.shop&&SHOPS[wh.shop])SHOP_ID=wh.shop;const sh=LS.get(shopRoom().key,null);if(sh)shopRoom().hero=sh}RESUMING=1;try{go(s)}finally{RESUMING=0}if(s==='town'&&wh.walk){ST.walk=true;ST.cam.x=TOWN.hero.x-W/2/ST.z;ST.cam.y=TOWN.hero.y-H*.45/ST.z;buildStageUI();LS.set('where',{s:'town',walk:1})}}
const TAU=Math.PI*2,clamp=(v,a,b)=>v<a?a:v>b?b:v,rnd=(a=1,b)=>b===undefined?Math.random()*a:a+Math.random()*(b-a);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR)}
addEventListener('resize',()=>{resize();if(SCR==='craft')fitDesk(false);if(SCR==='level'||SCR==='town')stageZoom();if(isRoomScr(SCR)){lobZoom();lobCam(true)}if(SCR==='kit')kitSize()});
const LS={get(k,d){try{const v=localStorage.getItem('craftloft_'+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem('craftloft_'+k,JSON.stringify(v));return true}catch(e){return false}}};
/* ================= BUILT-IN TOOLS (Story Shelf, Beat Bop Doodle) ================= */
/* Each tool is its own page in a folder of this repo. openTool() shows it full screen in a frame, with a Back button on top.
   To add a tool: put its page in a folder, add one line to TOOLS, then call openTool('id') from a station. */
const TOOLS={shelf:{src:'story-shelf/index.html',name:'Story Shelf'},bbd:{src:'beat-bop-doodle/index.html',name:'Beat Bop Doodle'}};
let OVL=null;
function openTool(id){const t=TOOLS[id];if(!t||OVL)return;OVL=id;$('#ovlSave').style.display=id==='bbd'?'':'none';closeDlg();$('#ovlTtl').textContent=t.name;$('#ovlBack').textContent=SCR==='house'?'◀ Back to the house':SCR==='shop'?'◀ Back to the store':'◀ Back to the studio';$('#ovlOut').href=t.src;
  const f=document.createElement('iframe');f.title=t.name;f.setAttribute('allow','autoplay; fullscreen; clipboard-write');f.src=t.src;$('#ovlBox').append(f);$('#ovl').classList.add('on');$('#lobGo').style.display='none';setVol();
  try{history.pushState({sbsTool:id},'')}catch(e){}}
function closeTool(fromBack){if(!OVL)return;if(OVL==='proj'){projClose(fromBack);return}if(OVL==='vhs'){vhsClose(fromBack);return}if(OVL==='r3d'){if(R3&&R3.isOpen())R3.close();else OVL=null;if(!fromBack){try{if(history.state&&history.state.sbsTool)history.back()}catch(e){}}return}OVL=null;$('#ovl').classList.remove('on');$('#ovlBox').innerHTML='';setVol();RM.near=undefined;try{SFX.tick()}catch(e){}
  if(!fromBack){try{if(history.state&&history.state.sbsTool)history.back()}catch(e){}}}
addEventListener('popstate',()=>{if(OVL)closeTool(true)});/* the phone's Back button closes the tool too */
const SET=Object.assign({music:true,mv:.5,sv:.8,hand:1},LS.get('settings',{}));
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
/* ---- matrices: [a,b,c,d,e,f] like canvas ---- */
const I=[1,0,0,1,0,0];
const mul=(m,n)=>[m[0]*n[0]+m[2]*n[1],m[1]*n[0]+m[3]*n[1],m[0]*n[2]+m[2]*n[3],m[1]*n[2]+m[3]*n[3],m[0]*n[4]+m[2]*n[5]+m[4],m[1]*n[4]+m[3]*n[5]+m[5]];
const inv=m=>{const d=m[0]*m[3]-m[1]*m[2];return[m[3]/d,-m[1]/d,-m[2]/d,m[0]/d,(m[2]*m[5]-m[3]*m[4])/d,(m[1]*m[4]-m[0]*m[5])/d]};
const ap=(m,p)=>({x:m[0]*p.x+m[2]*p.y+m[4],y:m[1]*p.x+m[3]*p.y+m[5]});
function reflM(P,d){const a=2*d.x*d.x-1,b=2*d.x*d.y,dd=2*d.y*d.y-1;return[a,b,b,dd,P.x-(a*P.x+b*P.y),P.y-(b*P.x+dd*P.y)]}
/* ---- canvas helpers ---- */
function mkCanvas(w,h,rf){const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));c._x=c.getContext('2d',rf?{willReadFrequently:true}:undefined);return c}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function polyPath(c,p){c.beginPath();for(let i=0;i<p.length;i++)i?c.lineTo(p[i].x,p[i].y):c.moveTo(p[i].x,p[i].y);c.closePath()}
function inPoly(p,poly){let ins=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)ins=!ins}return ins}
function polyArea(p){let s=0;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];s+=a.x*b.y-b.x*a.y}return s/2}
function distSeg(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,l2=dx*dx+dy*dy||1,f=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/l2,0,1);return{d:Math.hypot(p.x-a.x-dx*f,p.y-a.y-dy*f),f}}
function alphaAt(c,x,y){x=Math.floor(x);y=Math.floor(y);if(x<0||y<0||x>=c.width||y>=c.height)return 0;return c._x.getImageData(x,y,1,1).data[3]}
/* polylines (for rulers and stencils) */
function plPrep(pts,closed){const n=pts.length,seg=closed?n:n-1,cum=[0];for(let i=0;i<seg;i++){const a=pts[i],b=pts[(i+1)%n];cum.push(cum[i]+Math.hypot(b.x-a.x,b.y-a.y))}return{pts,closed,cum,len:cum[seg],seg}}
function plAt(pl,t){if(pl.closed)t=((t%pl.len)+pl.len)%pl.len;else t=clamp(t,0,pl.len);let i=0;while(i<pl.seg-1&&pl.cum[i+1]<t)i++;const a=pl.pts[i],b=pl.pts[(i+1)%pl.pts.length],L=pl.cum[i+1]-pl.cum[i]||1,f=(t-pl.cum[i])/L;return{x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f}}
function plProj(pl,p,near){let best=null;for(let i=0;i<pl.seg;i++){const a=pl.pts[i],b=pl.pts[(i+1)%pl.pts.length],r=distSeg(p,a,b),t=pl.cum[i]+r.f*(pl.cum[i+1]-pl.cum[i]);if(near!=null){let dt=Math.abs(t-near);if(pl.closed)dt=Math.min(dt,pl.len-dt);if(dt>90)continue}if(!best||r.d<best.d)best={d:r.d,t}}return best}
function plPath(pl,t0,t1){let d=t1-t0;if(pl.closed){if(d>pl.len/2)d-=pl.len;else if(d<-pl.len/2)d+=pl.len}const n=Math.max(1,Math.ceil(Math.abs(d)/1.5)),out=[];for(let i=0;i<=n;i++)out.push(plAt(pl,t0+d*i/n));return out}
/* ---- textures made in code ---- */
const TEX=(()=>{const c=mkCanvas(160,160),x=c._x;for(let i=0;i<3200;i++){x.fillStyle=Math.random()<.5?'rgba(255,255,255,'+rnd(.02,.11)+')':'rgba(0,0,0,'+rnd(.02,.08)+')';x.fillRect(rnd(160),rnd(160),rnd(1,3),1)}for(let i=0;i<150;i++){x.strokeStyle='rgba(255,255,255,'+rnd(.03,.09)+')';x.lineWidth=.7;const px=rnd(160),py=rnd(160),a=rnd(TAU);x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(a)*rnd(3,9),py+Math.sin(a)*rnd(3,9));x.stroke()}return c})();
const WOOD=(()=>{const c=mkCanvas(256,256),x=c._x;x.fillStyle='#c99a62';x.fillRect(0,0,256,256);for(let i=0;i<90;i++){const y=rnd(256),k=1+Math.floor(rnd(3)),ph=rnd(TAU),am=rnd(1,5);x.strokeStyle=Math.random()<.6?'rgba(120,72,30,'+rnd(.05,.2)+')':'rgba(255,225,170,'+rnd(.05,.16)+')';x.lineWidth=rnd(.6,2.4);x.beginPath();for(let px=0;px<=256;px+=8){const yy=y+Math.sin(px/256*TAU*k+ph)*am;px?x.lineTo(px,yy):x.moveTo(px,yy)}x.stroke()}return c})();
const KRAFT=(()=>{const c=mkCanvas(128,128),x=c._x;x.fillStyle='#d9bd8a';x.fillRect(0,0,128,128);for(let i=0;i<1800;i++){x.fillStyle=Math.random()<.5?'rgba(255,240,200,'+rnd(.05,.2)+')':'rgba(110,70,30,'+rnd(.04,.14)+')';x.fillRect(rnd(128),rnd(128),rnd(1,3),1)}return c})();
const PAPERS=['#d9463e','#f08a2e','#f5d142','#63b35d','#2f7d4f','#62b6e8','#3767bb','#8b5cb6','#f191b3','#8b5a3c','#3b3b40','#f6f2e9','#caa76c'];
const HANDS=['#f6d7bd','#e8b98f','#c98f62','#9a623c','#6b4226'];
/* ---- toast, dialog ---- */
let toastT=0;
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),2300)}
function dlg(html,mount){$('#dlgIn').innerHTML=html;$('#dlg').classList.add('on');if(mount)mount($('#dlgIn'))}
function closeDlg(){if(M3STOP){try{M3STOP()}catch(e){}M3STOP=null}$('#dlg').classList.remove('on');$('#dlgIn').innerHTML=''}
$('#dlg').addEventListener('pointerdown',e=>{if(e.target.id==='dlg')closeDlg()});
function ask(title,text,yes,fn){dlg('<h2>'+title+'</h2><p>'+text+'</p><div class="btns"><button class="alt" id="dNo">Keep it</button><button class="bad" id="dYes">'+yes+'</button></div>',d=>{d.querySelector('#dNo').onclick=closeDlg;d.querySelector('#dYes').onclick=()=>{closeDlg();fn()}})}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* ================= SOUND (all made in code) ================= */
const AU={c:null,rubT:0};
function auInit(){if(AU.c){if(AU.c.state==='suspended')AU.c.resume();return}const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const c=AU.c=new AC();AU.sfx=c.createGain();AU.mus=c.createGain();const cp=c.createDynamicsCompressor();AU.sfx.connect(cp);AU.mus.connect(cp);cp.connect(c.destination);
  const b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;AU.nb=b;
  const s=c.createBufferSource();s.buffer=b;s.loop=true;AU.ff=c.createBiquadFilter();AU.ff.type='bandpass';AU.fg=c.createGain();AU.fg.gain.value=0;s.connect(AU.ff);AU.ff.connect(AU.fg);AU.fg.connect(AU.sfx);s.start();setVol();startMusic()}
function setVol(){if(!AU.c)return;AU.sfx.gain.value=SET.sv;AU.mus.gain.value=SET.music&&!OVL?SET.mv*.55:0}
function nz(o){const c=AU.c;if(!c)return;const t=c.currentTime+(o.at||0),s=c.createBufferSource();s.buffer=AU.nb;const f=c.createBiquadFilter();f.type=o.type||'bandpass';f.frequency.setValueAtTime(o.f||2000,t);if(o.f2)f.frequency.exponentialRampToValueAtTime(o.f2,t+o.d);f.Q.value=o.q||1;const gn=c.createGain();gn.gain.setValueAtTime(.0001,t);gn.gain.linearRampToValueAtTime(o.g||.4,t+(o.a||.004));gn.gain.exponentialRampToValueAtTime(.0001,t+o.d);s.connect(f);f.connect(gn);gn.connect(AU.sfx);s.start(t,Math.random()*1.5);s.stop(t+o.d+.05)}
function tn(o){const c=AU.c;if(!c)return;const t=c.currentTime+(o.at||0),s=c.createOscillator();s.type=o.type||'sine';s.frequency.setValueAtTime(o.f,t);if(o.f2)s.frequency.exponentialRampToValueAtTime(o.f2,t+o.d);const gn=c.createGain();gn.gain.setValueAtTime(.0001,t);gn.gain.linearRampToValueAtTime(o.g||.2,t+(o.a||.004));gn.gain.exponentialRampToValueAtTime(.0001,t+o.d);s.connect(gn);gn.connect(o.mus?AU.mus:AU.sfx);s.start(t);s.stop(t+o.d+.05)}
const SFX={
  tick(){tn({f:900,d:.03,g:.1,type:'triangle'})},
  snip(k){const hi=k==='safety'?3600:k==='zigzag'?4300:5200;nz({f:hi,q:1.2,d:.045,g:.5});nz({f:hi*.55,q:.8,d:.06,g:.32,at:.028});nz({f:1700,q:.5,d:.09,g:.16});tn({f:k==='safety'?1500:2600,d:.018,g:.05,type:'square',at:.045});if(k==='zigzag'||k==='scallop')nz({f:2400,q:2,d:.03,g:.25,at:.05})},
  tear(){nz({f:rnd(1100,3600),q:.7,d:rnd(.04,.08),g:rnd(.2,.4)})},
  crumple(n=14){for(let i=0;i<n;i++)nz({f:rnd(1500,5000),q:rnd(1,4),d:rnd(.03,.09),g:rnd(.15,.45),at:rnd(.5*n/14)})},
  rustle(){for(let i=0;i<5;i++)nz({f:rnd(2500,6000),q:.8,d:rnd(.04,.1),g:rnd(.06,.16),at:rnd(.22)})},
  thwap(){nz({type:'lowpass',f:1400,d:.12,g:.55});nz({f:3600,q:.5,d:.22,g:.1})},
  squish(){nz({type:'lowpass',f:900,f2:240,d:.24,g:.55,q:5});tn({f:320,f2:110,d:.18,g:.2});tn({f:500,f2:950,d:.05,g:.07,at:.17})},
  tape(){nz({f:1400,f2:3300,q:7,d:.28,g:.5});for(let i=0;i<8;i++)nz({f:2600,q:3,d:.02,g:.28,at:i*.032});nz({f:4200,d:.03,g:.5,at:.3})},
  clack(){tn({f:850,d:.05,g:.38,type:'triangle'});tn({f:1320,d:.035,g:.22});nz({f:2500,q:.7,d:.02,g:.4});tn({f:900,d:.04,g:.14,type:'triangle',at:.09});nz({f:2500,q:.7,d:.015,g:.16,at:.09})},
  punch(){tn({f:160,f2:55,d:.09,g:.6});nz({f:3000,d:.025,g:.5});tn({f:1900,d:.02,g:.08,type:'square',at:.05})},
  pin(){tn({f:3100,d:.09,g:.14});tn({f:4650,d:.05,g:.07});nz({f:1500,d:.03,g:.25})},
  crease(){nz({f:2400,f2:6200,q:2,d:.17,g:.42})},
  fold(){nz({type:'lowpass',f:1800,d:.14,g:.3});SFX.rustle()},
  thud(){tn({f:140,f2:70,d:.14,g:.6,type:'triangle'});nz({type:'lowpass',f:500,d:.08,g:.4});for(let i=0;i<4;i++)nz({f:rnd(1500,3000),q:2,d:.03,g:.12,at:.08+rnd(.15)})},
  peel(){nz({f:900,f2:2800,q:3,d:.2,g:.4});SFX.rustle()},
  jump(){nz({f:900,f2:2600,q:1.5,d:.14,g:.22})},
  collect(){tn({f:1320,d:.09,g:.16});tn({f:1760,d:.16,g:.16,at:.07})},
  bounce(){tn({f:220,f2:560,d:.2,g:.32});tn({f:440,f2:1100,d:.12,g:.08})},
  ouch(){SFX.crumple(6);tn({f:210,f2:90,d:.2,g:.25,type:'triangle'})},
  win(){[587,740,880,1175].forEach((f,i)=>tn({f,d:.3,g:.16,at:i*.11,type:'triangle'}))},
  step(){nz({type:'lowpass',f:700,d:.04,g:.1})}
};
const RUBS={pencil:{f:3300,q:.9,g:.2},eraser:{f:700,q:.6,g:.24},glue:{f:420,q:.6,g:.34},crease:{f:4300,q:1.6,g:.2},tape:{f:2100,q:6,g:.3},compass:{f:3900,q:1.4,g:.14}};
function rub(kind,speed){if(!AU.c)return;const r=RUBS[kind],t=AU.c.currentTime;AU.ff.frequency.setTargetAtTime(r.f*rnd(.9,1.1),t,.01);AU.ff.Q.setTargetAtTime(r.q,t,.01);AU.fg.gain.setTargetAtTime(r.g*clamp(speed/500,.2,1),t,.015);AU.rubT=performance.now()}
function auTick(){if(AU.c&&AU.rubT&&performance.now()-AU.rubT>70){AU.fg.gain.setTargetAtTime(0,AU.c.currentTime,.03);AU.rubT=0}}
/* gentle music box loop, written for Shoebox Studio */
function startMusic(){if(AU.mt)return;const mf=m=>440*Math.pow(2,(m-69)/12);let step=0,next=AU.c.currentTime+.2,mi=4;
  const chords=[[50,57,62,66],[47,54,59,62],[43,50,55,59],[45,52,57,61]],pent=[62,64,66,69,71,74,76,78,81],pat=[0,2,1,2,3,2,1,2];
  const pluck=(m,t,gn,d)=>{const c=AU.c,o=c.createOscillator(),lp=c.createBiquadFilter(),e=c.createGain();o.type='triangle';o.frequency.value=mf(m);lp.type='lowpass';lp.frequency.value=1700;e.gain.setValueAtTime(.0001,t);e.gain.linearRampToValueAtTime(gn,t+.006);e.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(lp);lp.connect(e);e.connect(AU.mus);o.start(t);o.stop(t+d+.05)};
  AU.mt=setInterval(()=>{const c=AU.c;if(!SET.music||c.state!=='running'||document.hidden||AU.song){next=c.currentTime+.2;return}
    while(next<c.currentTime+.45){const bar=Math.floor(step/8)%4,k=step%8,ch=chords[bar];pluck(ch[pat[k]],next,.085,.7);if(k===0)pluck(ch[0]-12,next,.13,1.3);
      if(Math.random()<(k%2===0?.5:.18)){mi=clamp(mi+Math.round(rnd(-2.4,2.4)),0,pent.length-1);const f=mf(pent[mi]);tn({f,d:1.1,g:.06,at:next-c.currentTime,mus:1});tn({f:f*2.005,d:.5,g:.02,at:next-c.currentTime,mus:1})}
      next+=60/84/2;step++}},110)}
/* ================= TOY BOX DATA ================= */
let TOYS=LS.get('toys',null);
const SPR={};
function saveToys(){return LS.set('toys',TOYS)}
function toyById(id){return TOYS.find(t=>t.id===id)}
function sprite(toy){let s=SPR[toy.id];if(!s){s=SPR[toy.id]={ready:false,parts:[],order:toy.parts.map((p,i)=>i).sort((a,b)=>toy.parts[a].z-toy.parts[b].z)};let n=toy.parts.length;toy.parts.forEach((pt,i)=>{const im=new Image();im.onload=()=>{const c=mkCanvas(pt.w,pt.h,true),x=c._x;x.drawImage(im,0,0,c.width,c.height);x.globalCompositeOperation='source-atop';x.fillStyle=x.createPattern(TEX,'repeat');x.fillRect(0,0,c.width,c.height);s.parts[i]=c;if(--n===0)s.ready=true};im.src=pt.src})}return s}
/* draw a toy with its top-left at 0,0. swing>0 makes pinned parts sway */
function drawToy(c,toy,t,swing){const s=sprite(toy);if(!s.ready)return false;const M=[];toy.parts.forEach((pt,i)=>{if(pt.parent<0)M[i]=I;else{const a=swing?Math.sin(t*2.2+i*1.7)*.3*swing:0,co=Math.cos(a),si=Math.sin(a);M[i]=mul(M[pt.parent],[co,si,-si,co,pt.px-co*pt.px+si*pt.py,pt.py-si*pt.px-co*pt.py])}});
  for(const i of s.order){const pt=toy.parts[i];c.save();c.transform(...M[i]);c.drawImage(s.parts[i],pt.x,pt.y);c.restore()}return true}
function thumb(cvs,toy){const k=2;cvs.width=cvs.height=96*k;const x=cvs.getContext('2d');const go=()=>{const s=sprite(toy);if(!s.ready){setTimeout(go,120);return}x.clearRect(0,0,cvs.width,cvs.height);const sc=Math.min(cvs.width*.88/toy.w,cvs.height*.88/toy.h);x.save();x.translate((cvs.width-toy.w*sc)/2,(cvs.height-toy.h*sc)/2);x.scale(sc,sc);x.shadowColor='rgba(0,0,0,.3)';x.shadowBlur=6;x.shadowOffsetY=3;drawToy(x,toy,0,0);x.restore()};go()}
function mkStarters(){const mk=(name,w,h,beh,fn)=>{const c=mkCanvas(w,h);fn(c._x,w,h);return{id:'starter_'+name.replace(/\W/g,''),name,w,h,beh,starter:true,parts:[{src:c.toDataURL(),x:0,y:0,w,h,parent:-1,px:0,py:0,z:0}]}};
  return[
    mk('Paper block',180,64,'solid',(x,w,h)=>{x.fillStyle='#caa76c';rr(x,1,1,w-2,h-2,7);x.fill();x.strokeStyle='rgba(90,60,30,.35)';x.lineWidth=2;for(let i=14;i<w;i+=22){x.beginPath();x.moveTo(i,6);x.lineTo(i-8,h-6);x.stroke()}}),
    mk('Green hill',280,120,'solid',(x,w,h)=>{x.fillStyle='#63b35d';x.beginPath();x.moveTo(0,h);for(let i=0;i<=40;i++){const a=Math.PI*i/40;x.lineTo(w/2-Math.cos(a)*w/2,h-Math.sin(a)*(h-4)+Math.sin(i*1.7)*2)}x.closePath();x.fill();x.fillStyle='rgba(255,255,255,.25)';for(let i=0;i<9;i++){x.beginPath();x.arc(40+i*25,h-18-Math.sin(i/8*Math.PI)*60,4,0,TAU);x.fill()}}),
    mk('Cloud',200,110,'scenery',(x)=>{x.fillStyle='#f6f2e9';[[55,70,36],[100,50,46],[145,68,38],[100,80,40]].forEach(c=>{x.beginPath();x.arc(c[0],c[1],c[2],0,TAU);x.fill()})}),
    mk('Button',46,46,'collect',(x)=>{x.fillStyle='#d9463e';x.beginPath();x.arc(23,23,22,0,TAU);x.fill();x.strokeStyle='rgba(0,0,0,.25)';x.lineWidth=3;x.beginPath();x.arc(23,23,15,0,TAU);x.stroke();x.globalCompositeOperation='destination-out';[[17,17],[29,17],[17,29],[29,29]].forEach(p=>{x.beginPath();x.arc(p[0],p[1],3.2,0,TAU);x.fill()})}),
    mk('Zigzag spikes',150,46,'ouch',(x,w,h)=>{x.fillStyle='#3b3b40';x.beginPath();x.moveTo(0,h);for(let i=0;i<=10;i++)x.lineTo(i*w/10,i%2?2:h-10);x.lineTo(w,h);x.closePath();x.fill()}),
    mk('Spring pad',96,44,'bouncy',(x,w,h)=>{x.fillStyle='#f191b3';rr(x,2,2,w-4,12,5);x.fill();x.strokeStyle='#8b5cb6';x.lineWidth=7;x.lineJoin='round';x.beginPath();x.moveTo(16,14);x.lineTo(w-16,22);x.lineTo(16,30);x.lineTo(w-16,38);x.stroke();x.fillStyle='#8b5cb6';rr(x,8,h-8,w-16,8,3);x.fill()})
  ]}
if(!TOYS){TOYS=mkStarters();saveToys()}
function lobZoom(){RM.z=RM.fit?clamp(Math.min(W/RM.W,(H-70)/RM.H),.4,1.7):clamp(Math.max(W/RM.W,Math.min(W/RM.vw,H/(RM.H+10))),.4,1.7)}
function lobCam(snap){const vw=W/RM.z,vh=H/RM.z,h=RM.hero,tx=vw>=RM.W?(RM.W-vw)/2:clamp(h.x-vw/2,0,RM.W-vw),ty=vh>=RM.H?(RM.H-vh)/2:clamp(h.y-vh*.55,0,RM.H-vh),k=snap?1:Math.min(1,DT*5);RM.cam.x+=(tx-RM.cam.x)*k;RM.cam.y+=(ty-RM.cam.y)*k}
function stnAt(w){for(const s of RM.stn){if(s.wall?(Math.abs(w.x-s.x)<70&&w.y<s.y+10&&w.y>s.y-190):(Math.abs(w.x-s.x)<80&&w.y<s.y+12&&w.y>s.y-(s.h||130)))return s}return null}
function enterStn(s){if(s.act){SFX.tick();s.act()}else if(s.soon){toast(s.name+' is coming in a later pass');SFX.tick()}else{SFX.tick();go(s.go)}}
function stnSave(){const o={};for(const t of RM.stn)o[t.id]={x:Math.round(t.x),y:Math.round(t.y)};LS.set('stnpos_'+RM.key,o)}
function stnLoad(R){const o=LS.get('stnpos_'+R.key,null);if(!o)return;for(const t of R.stn){const p=o[t.id];if(p){t.x=p.x;if(!t.wall)t.y=p.y}}}
function setMove(on){MOVE=on?{d:null}:null;$('#lobMove').classList.toggle('on',!!on);$('#lobMove').textContent=on?'✓ Done moving':'✋ Move things';RM.tgt=null;RM.pend=null;if(on){RM.near=null;$('#lobGo').style.display='none';toast('Drag anything to move it. Tap Done when finished.')}else stnSave()}
function lUp(){if(MOVE&&MOVE.d){MOVE.d=null;stnSave();SFX.tick()}}
function lDown(e){const w=lw(e.clientX,e.clientY),s=stnAt(w);if(MOVE){if(s){MOVE.d={s,ox:w.x-s.x,oy:w.y-s.y};SFX.tick()}return}if(s){RM.tgt=standPt(s);RM.pend=s}else{RM.tgt={x:clamp(w.x,30,RM.W-30),y:clamp(w.y,236,RM.H-16)};RM.pend=null}}
function lMove(e){if(MOVE){if(MOVE.d){const w=lw(e.clientX,e.clientY),t=MOVE.d.s;t.x=clamp(w.x-MOVE.d.ox,60,RM.W-60);if(!t.wall)t.y=clamp(w.y-MOVE.d.oy,300,RM.H-40)}return}if(RM.pend)return;const w=lw(e.clientX,e.clientY);RM.tgt={x:clamp(w.x,30,RM.W-30),y:clamp(w.y,236,RM.H-16)}}
function updLobby(){const R=RM,h=R.hero;if(R.tgt){const dx=R.tgt.x-h.x,dy=R.tgt.y-h.y,d=Math.hypot(dx,dy);if(d>5){const v=Math.min(d,210*DT);h.x+=dx/d*v;h.y+=dy/d*v;if(Math.abs(dx)>2)R.face=dx>0?1:-1;const p0=R.ph;R.ph+=DT*14;if(Math.floor(p0/Math.PI)!==Math.floor(R.ph/Math.PI))SFX.step()}else{R.tgt=null;if(R.key)LS.set(R.key,h);if(R.pend){const s=R.pend;R.pend=null;enterStn(s);return}}}
  petFollow(h.x,h.y,0,40);
  let near=null,bd=95;for(const s of R.stn){const d=dist(standPt(s),h);if(d<bd){bd=d;near=s}}
  if(near!==R.near){R.near=near;const b=$('#lobGo');if(!MOVE&&near&&!near.soon){b.textContent=near.verb+' ▶';b.style.display='block'}else b.style.display='none'}
  lobCam(false)}
function drawTag(c,s){const t=s.name,soon=s.soon;c.font='800 13px ui-rounded,system-ui,sans-serif';const w=c.measureText(t).width+16,y=s.tagY?s.tagY:s.wall?-204:(s.id==='desk'?-106:s.id==='chest'?-136:-150);c.save();c.translate(0,y);c.rotate(-.03);c.fillStyle=soon?'#e9dfc6':'#fbf6ea';c.shadowColor='rgba(0,0,0,.3)';c.shadowBlur=4;c.shadowOffsetY=2;rr(c,-w/2,-11,w,22,5);c.fill();c.shadowColor='transparent';c.fillStyle='#3b2f2a';c.textAlign='center';c.textBaseline='middle';c.fillText(t,0,1);
  if(soon){c.font='800 10px system-ui';c.fillStyle='#8b5a3c';c.fillText('coming soon',0,17)}else if(s.sub){c.font='700 10.5px system-ui';c.fillStyle='#fff';c.shadowColor='rgba(0,0,0,.6)';c.shadowBlur=3;c.fillText(s.sub,0,18)}c.restore();c.textBaseline='alphabetic'}
function leaveHouse(k){k=k||'house';go('town');const p=TOWN[k],dr=BLD[k].door;TOWN.hero.x=p.x+dr.x;TOWN.hero.y=p.y+dr.y;ST.walk=true;LS.set('where',{s:'town',walk:1});ST.th.face=1;ST.cam.x=TOWN.hero.x-W/2/ST.z;ST.cam.y=TOWN.hero.y-H*.45/ST.z;LS.set('town',TOWN);buildStageUI()}
function drawLobby(){const z=RM.z,cam=RM.cam;g.fillStyle='#3e2a1e';g.fillRect(0,0,W,H);g.save();g.scale(z,z);g.translate(-cam.x,-cam.y);RM.bg();
  const h=RM.hero,list=RM.stn.map(s=>({y:s.wall?-1:s.y,s})).concat([{y:h.y,hero:1},{y:PET.y-.1,pet:1}]).sort((a,b)=>a.y-b.y);
  for(const o of list){if(o.pet){if(PET.kind!=='none'&&PET.ok){g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(PET.x,PET.y,15,5,0,0,TAU);g.fill();g.save();g.translate(PET.x,PET.y);g.scale(1.3,1.3);drawPet(g,0,0);g.restore()}}else if(o.hero){g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(h.x,h.y,17,6,0,0,TAU);g.fill();g.save();g.translate(h.x,h.y);g.scale(1.35,1.35);drawHero(g,0,0,RM.face,RM.ph,false);g.restore()}
    else{const s=o.s;g.save();g.translate(s.x,s.y);if(s.soon)g.globalAlpha=.78;STATION_DRAW[s.id](g);g.globalAlpha=1;drawTag(g,s);if(MOVE){g.strokeStyle=MOVE.d&&MOVE.d.s===s?'rgba(245,209,66,1)':'rgba(255,255,255,.75)';g.lineWidth=3;g.setLineDash([7,6]);g.lineDashOffset=-NOW/60;g.beginPath();g.ellipse(0,s.wall?30:6,46,14,0,0,TAU);g.stroke();g.setLineDash([])}if(RM.near===s&&!s.soon){const sp=standPt(s);g.strokeStyle='rgba(245,209,66,.95)';g.lineWidth=4;g.setLineDash([8,7]);g.lineDashOffset=-NOW/50;g.beginPath();g.ellipse(0,sp.y-s.y,30,11,0,0,TAU);g.stroke();g.setLineDash([])}g.restore()}}
  if(RM.tgt&&!RM.pend){g.strokeStyle='rgba(217,70,62,.8)';g.lineWidth=3;g.beginPath();g.arc(RM.tgt.x,RM.tgt.y,9+Math.sin(NOW/120)*2,0,TAU);g.stroke()}
  g.restore()}
function updBadge(){$('#nBox').textContent=LIB?LIB.length:TOYS.length}
/* ---- screens ---- */
let craftSeen=false;
function showScr(){const m={lobbyUI:isRoomScr(SCR),classUI:SCR==='class',craftUI:SCR==='craft',stageUI:(SCR==='level'||SCR==='town')&&!ST.play,playUI:SCR==='level'&&ST.play,boxUI:SCR==='box',kitUI:SCR==='kit',lvlBar:SCR==='level'&&!ST.play};for(const k in m)$('#'+k).classList.toggle('on',m[k]);$('#top').style.display=SCR==='title'?'none':'flex';$('#bUndo').style.display=SCR==='craft'||SCR==='kit'?'':'none';$('#bHome').style.visibility=SCR==='home'?'hidden':'';$('#bBox').style.display=SCR==='box'||(SCR==='level'&&ST.play)?'none':'';$('#ttl').textContent={home:'Shoebox Studio',craft:'School Desk',level:'Make a Level',town:'Little Town',house:'My House',box:'Toy Box',class:'Art Class',kit:'Pixel UI Kit',title:''}[SCR];$('#bClock').style.display=isRoomScr(SCR)||SCR==='town'?'':'none';showLesson()}
function go(s){if(KIT.pg&&s!=='kit')kitPageEnd();nbClose();FROM=SCR;songStop();if(FROM==='town')LS.set('town',TOWN);if(MOVE)setMove(false);if(SCR==='craft')saveDesk();if(SCR==='kit')kitDraft(true);ST.play=false;ST.pendH=0;SCR=s;closeDlg();showScr();updBadge();if(s!=='title')LS.set('where',{s:s==='house'||s==='town'||s==='shop'?s:'home',walk:s==='town'?ST.walk:0,shop:s==='shop'?SHOP_ID:undefined});
  if(s==='craft'){renderTabs();fitDesk(!craftSeen);if(!craftSeen&&!C.pieces.length&&!(LS.get('desk',{}).pieces||[]).length&&!LES)setTimeout(()=>{if(SCR==='craft'&&!C.pieces.length)placePaper(PAPERS[0])},350);craftSeen=true}
  else if(s==='level'||s==='town')enterStage(s);else if(s==='box')renderBox();else if(s==='kit')renderKit();else if(s==='class')renderClass();else if(isRoomScr(s)){RM=s==='house'?HOUSE:s==='shop'?shopRoom():LOB;if(!RESUMING){if(s==='house')HOUSE.hero={x:460,y:262};else if(s==='shop'){const d=RM.stn.find(t=>t.out);RM.hero=standPt(d)}else if(FROM==='town'){const d=STATIONS.find(t=>t.id==='door');LOB.hero=standPt(d)}}PET.ok=false;RM.tgt=null;RM.pend=null;RM.near=undefined;lobZoom();lobCam(true)}}
function quickMenu(){const items=[['craft','✂️','School Desk','Craft with paper, scissors, folding and glue'],['class','📘','Art Class','Step by step lessons'],['level','🚩','Make a Level','Place your pieces, then play'],['town','🏡','Little Town','Build on the tabletop and walk around'],['house','🛋️','My House','A cozy room in Little Town, with a game console'],['shelf','📚','Bookshelf','Story Shelf: plan stories, worlds and characters'],['shop','🛒','Supply Store','Its own store in Little Town (T032)'],['box','🧸','Toy Box','Asset Library: '+LIB.length+' saved, search, export and import'],['kit','👾','Pixel UI Kit','Pixel health bars, item slots, frames and nameplates'],['pet',PETS[PET.kind][0],'Companion','Pick who follows you: dog, chicken or cat'],['artswap','🖼️','Art Swap','Replace the default art with your own']];/* T022 */
  dlg('<h2>Quick jump</h2>'+items.map(i=>'<button class="les" data-q="'+i[0]+'" style="margin-top:8px"><span>'+i[1]+' '+i[2]+'<small>'+i[3]+'</small></span><i>▶</i></button>').join('')+'<div class="btns"><button class="alt" id="dNo">Stay in the loft</button></div>',d=>{d.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{SFX.tick();if(b.dataset.q==='pet')petMenu();else if(b.dataset.q==='artswap')artSwapOpen();else if(b.dataset.q==='shelf')openTool('shelf');else if(b.dataset.q==='shop'){SHOP_ID='supply';go('shop')}else go(b.dataset.q)});d.querySelector('#dNo').onclick=closeDlg})}
$('#ovlBack').onclick=()=>closeTool();
$('#lobQuick').onclick=()=>{auInit();SFX.tick();quickMenu()};
$('#lob3d').onclick=()=>{auInit();SFX.tick();if(MOVE)setMove(false);open3D(SCR==='house'?'house':SCR==='shop'?'shop':'home')};
$('#lobMove').onclick=()=>{auInit();SFX.tick();setMove(!MOVE)};
$('#lobGo').onclick=()=>{auInit();if(RM.near)enterStn(RM.near)};
$('#bHome').onclick=()=>{auInit();SFX.tick();go('home')};
$('#bBox').onclick=()=>{auInit();SFX.tick();go('box')};
$('#bUndo').onclick=()=>{auInit();if(SCR==='kit')kitUndo();else undo()};
/* ---- stage UI ---- */
function buildStageUI(){const tray=$('#tray');tray.innerHTML='';tray.style.display=ST.walk?'none':'';$('#layW').classList.toggle('on',ST.layer!=='hud');$('#layH').classList.toggle('on',ST.layer==='hud');if(ST.kind==='level'&&ST.layer==='hud'){buildHudUI();return}if(!TOYS.length)tray.innerHTML='<div id="trayEmpty">Your toy box is empty. Make something in Craft first!</div>';
  TOYS.forEach(t=>{const b=document.createElement('button');b.className='tit'+(ST.arm===t.id?' on':'');const c=document.createElement('canvas'),s=document.createElement('span');thumb(c,t);s.textContent=t.name;b.append(c,s);b.onclick=()=>{auInit();SFX.tick();ST.arm=ST.arm===t.id?null:t.id;ST.sel=null;updItemBar();[...tray.children].forEach(x=>x.classList.remove('on'));if(ST.arm){b.classList.add('on');toast('Tap where it should go')}};tray.append(b)});
  const sb=$('#stageBtns');sb.innerHTML='<button class="alt" id="sClr" '+(ST.walk?'style="visibility:hidden"':'')+'>🧹 Clear</button>'+(ST.kind==='level'?'<button class="alt" id="sSave">💾 Save</button><button id="sMus" aria-label="Level music" title="Level music">🎵</button><button id="sPlay">▶ Play</button>':(ST.walk?'':'<button class="alt" id="sShow" aria-label="Reset to showcase town" title="Reset to showcase town">🏙️ Showcase</button>')+'<button class="alt" id="s3d" aria-label="Retro 3D" title="Retro 3D">🧊 3D</button><button class="alt" id="sNote" aria-label="Handy Notebook" title="Handy Notebook">📓</button><button id="sWalk">'+(ST.walk?'🔨 Build':'🚶 Walk around')+'</button>');
  sb.querySelector('#sClr').onclick=()=>ask('Clear everything?','This takes every piece off the '+(ST.kind==='level'?'level':'table')+'. Your toy box stays as it is.','Clear it',()=>{ST.d.items=[];ST.sel=null;saveStage();updItemBar();SFX.crumple()});
  if(ST.kind==='level'){sb.querySelector('#sMus').onclick=()=>{auInit();SFX.tick();levelMusicDlg()};updMusBtn();sb.querySelector('#sPlay').onclick=()=>{auInit();startPlay()};sb.querySelector('#sSave').onclick=()=>{auInit();SFX.tick();saveLevelAsset()}}else{if(!ST.walk)sb.querySelector('#sShow').onclick=()=>{auInit();SFX.tick();resetShowTown()}}if(ST.kind!=='level')sb.querySelector('#sWalk').onclick=()=>{auInit();SFX.tick();ST.walk=!ST.walk;LS.set('where',{s:'town',walk:ST.walk?1:0});ST.sel=null;ST.arm=null;ST.tgt=null;if(ST.walk)toast('Tap or drag where you want to walk');buildStageUI()};
  {const nb=sb.querySelector('#sNote');if(nb)nb.onclick=()=>{SFX.tick();nbOpen()};const b3=sb.querySelector('#s3d');if(b3)b3.onclick=()=>{SFX.tick();open3D('town')}}/* v1.6c *//* v1.6b */
  updItemBar()}
function updItemBar(){if(ST.kind==='level'&&ST.layer==='hud'){updHudBar();return}const bar=$('#itemBar'),it=ST.sel;if(!it||ST.walk||ST.play){bar.classList.remove('on');bar.innerHTML='';return}bar.classList.add('on');
  bar.innerHTML='<button data-a="sm">➖</button><button data-a="bg">➕</button><button data-a="fl">↔️</button>'+(ST.kind==='level'?'<button data-a="bh">'+BEH[it.beh].em+' '+BEH[it.beh].name+'</button>':'')+(ST.kind==='level'?'<button data-a="up">⬆️</button><button data-a="dn">⬇️</button>':(it.act==='vehicle'?'':'<button data-a="ro" title="Turn: which way it faces in 3D">🔄 Turn</button>')+'<button data-a="tb">'+TBEH[it.tb||'block'].em+' '+TBEH[it.tb||'block'].name+'</button><button data-a="ac">'+TACT[it.act||'none'].em+' '+TACT[it.act||'none'].name+'</button>')+'<button data-a="rm">🗑️</button>';
  bar.querySelectorAll('button').forEach(b=>b.onclick=()=>{const a=b.dataset.a,arr=ST.d.items,i=arr.indexOf(it);SFX.tick();if(a==='sm')it.s=Math.max(.08,it.s/1.15);else if(a==='bg')it.s=Math.min(3,it.s*1.15);else if(a==='fl')it.flip=-it.flip;else if(a==='ro'){it.rot=(faceStep(it)+1)%8;toast('In 3D it faces '+FACE_NAMES[it.rot])}else if(a==='bh'){const ks=Object.keys(BEH);it.beh=ks[(ks.indexOf(it.beh)+1)%ks.length];toast({solid:'Solid: you can stand on it',scenery:'Scenery: just for looks',bouncy:'Bouncy: boing!',collect:'Collect: grab it for a point',ouch:'Ouch: touching it sends you back'}[it.beh])}else if(a==='tb'){const ks=Object.keys(TBEH);it.tb=ks[(ks.indexOf(it.tb||'block')+1)%ks.length]}else if(a==='ac'){const ks=Object.keys(TACT);it.act=ks[(ks.indexOf(it.act||'none')+1)%ks.length];it.open=false;VEH.delete(it);toast(TACT_TIP[it.act])}else if(a==='up'){arr.splice(i,1);arr.push(it)}else if(a==='dn'){arr.splice(i,1);arr.unshift(it)}else if(a==='rm'){arr.splice(i,1);ST.sel=null;SFX.crumple(5)}saveStage();updItemBar()})}
$('#pStop').onclick=()=>stopPlay();
[['#pL','l'],['#pR','r'],['#pJ','j']].forEach(([id,k])=>{const b=$(id),dn=e=>{e.preventDefault();auInit();ST.keys[k]=1;if(k==='j')ST.keys.jb=.13;b.classList.add('dn');try{b.setPointerCapture(e.pointerId)}catch(_){}},up=()=>{ST.keys[k]=0;b.classList.remove('dn')};b.addEventListener('pointerdown',dn);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up)});
addEventListener('keydown',e=>{if(!ST.play||e.repeat)return;const k=e.key;if(k==='ArrowLeft'||k==='a')ST.keys.l=1;else if(k==='ArrowRight'||k==='d')ST.keys.r=1;else if(k===' '||k==='ArrowUp'||k==='w'){ST.keys.j=1;ST.keys.jb=.13}});
addEventListener('keyup',e=>{const k=e.key;if(k==='ArrowLeft'||k==='a')ST.keys.l=0;else if(k==='ArrowRight'||k==='d')ST.keys.r=0;else if(k===' '||k==='ArrowUp'||k==='w')ST.keys.j=0});
/* ---- toy box screen: see ASSET LIBRARY below ---- */
/* ---- settings ---- */
/* v1.5.2: full screen. The button toggles it; if you left it on, tapping the title screen turns it back on (browsers need a tap first). Hidden where the browser can't do it (iPhone Safari). */
const FS={can:!!(document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen),on:()=>!!(document.fullscreenElement||document.webkitFullscreenElement),
  enter(){const d=document.documentElement;try{const p=(d.requestFullscreen||d.webkitRequestFullscreen).call(d,{navigationUI:'hide'});if(p&&p.catch)p.catch(()=>{})}catch(e){}},
  exit(){try{const p=(document.exitFullscreen||document.webkitExitFullscreen).call(document);if(p&&p.catch)p.catch(()=>{})}catch(e){}}};
if(!FS.can)$('#bFull').style.display='none';
$('#bFull').onclick=()=>{auInit();SFX.tick();if(FS.on()){FS.exit();LS.set('fs',0)}else{FS.enter();LS.set('fs',1)}};
const fsIcon=()=>{$('#bFull').textContent=FS.on()?'🗗':'⛶'};
document.addEventListener('fullscreenchange',fsIcon);
document.addEventListener('webkitfullscreenchange',fsIcon);
$('#bSet').onclick=()=>{auInit();SFX.tick();dlg('<h2>Settings</h2><div class="row"><label>Music</label><button class="tog'+(SET.music?' on':'')+'" id="sM" aria-label="Music on or off"></button></div><div class="row"><label>Music volume</label><input type="range" id="sMV" min="0" max="1" step="0.05" value="'+SET.mv+'"></div><div class="row"><label>Craft sounds</label><input type="range" id="sSV" min="0" max="1" step="0.05" value="'+SET.sv+'"></div><div class="row"><label>Hand colour</label>'+HANDS.map((h,i)=>'<button class="hsw'+(SET.hand===i?' on':'')+'" data-h="'+i+'" style="background:'+h+'" aria-label="hand colour"></button>').join('')+'</div><p style="font-size:12.5px;opacity:.8">Turn the music off and the craft sounds up for a quiet "just the sounds" desk. Every picture and sound in Shoebox Studio is made in code.</p><div class="btns"><button class="alt" id="sSt">Bring back starter pieces</button><button class="bad" id="sCl">Clear the desk</button><button id="sOk">Done</button></div>',d=>{const sv=()=>{LS.set('settings',SET);setVol()};
    d.querySelector('#sM').onclick=e=>{SET.music=!SET.music;e.target.classList.toggle('on',SET.music);sv()};d.querySelector('#sMV').oninput=e=>{SET.mv=+e.target.value;sv()};d.querySelector('#sSV').oninput=e=>{SET.sv=+e.target.value;sv()};d.querySelector('#sSV').onchange=()=>SFX.snip('regular');
    d.querySelectorAll('.hsw').forEach(b=>b.onclick=()=>{SET.hand=+b.dataset.h;d.querySelectorAll('.hsw').forEach(x=>x.classList.toggle('on',x===b));sv()});
    d.querySelector('#sSt').onclick=()=>{mkStarters().forEach(s=>{if(!toyById(s.id))TOYS.push(s)});saveToys();libSync();updBadge();closeDlg();toast('Starter pieces are in the toy box');if(SCR==='box')renderBox();if(SCR==='level'||SCR==='town')buildStageUI()};
    d.querySelector('#sCl').onclick=()=>ask('Clear the desk?','Every paper on the School Desk goes in the bin. Your toy box stays as it is.','Clear it',()=>{if(C.pieces.length)checkpoint();C.pieces=[];C.bonds=[];C.sel=null;C.guides=[];saveDesk();SFX.crumple()});
    d.querySelector('#sOk').onclick=closeDlg})};
/* ---- touch / pen / mouse on the canvas ---- */
const PT=new Map();
let pinch=null,plock=false;
const NOP=()=>{},handler=()=>SCR==='craft'?{d:cDown,m:cMove,u:cUp,p:cPinch}:(SCR==='level'||SCR==='town')?{d:sDown,m:sMove,u:sUp,p:sPinch}:isRoomScr(SCR)?{d:lDown,m:lMove,u:lUp,p:NOP}:SCR==='title'?{d:NOP,m:NOP,u:()=>{if(FS.can&&LS.get('fs',0)&&!FS.on())FS.enter();resume()},p:NOP}:null;
cv.addEventListener('pointerdown',e=>{auInit();const h=handler();if(!h)return;e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}PT.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(PT.size===1&&!plock)h.d(e);else if(PT.size===2){h.u(e,true);plock=true;const[a,b]=[...PT.values()];pinch={d0:Math.hypot(a.x-b.x,a.y-b.y)||1,d:1,mx:(a.x+b.x)/2,my:(a.y+b.y)/2}}});
cv.addEventListener('pointermove',e=>{const h=handler();if(!h||!PT.has(e.pointerId))return;PT.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinch&&PT.size>=2){const[a,b]=[...PT.values()];pinch.d=Math.hypot(a.x-b.x,a.y-b.y)||1;pinch.cx=(a.x+b.x)/2;pinch.cy=(a.y+b.y)/2;h.p(pinch)}
  else if(!plock){const evs=SCR==='craft'&&e.getCoalescedEvents?e.getCoalescedEvents():[];if(evs.length>1)evs.forEach(h.m);else h.m(e)}});
const pEnd=e=>{if(!PT.has(e.pointerId))return;const h=handler();PT.delete(e.pointerId);if(PT.size<2)pinch=null;if(PT.size===0){if(!plock&&h)h.u(e,false);plock=false}};
cv.addEventListener('pointerup',pEnd);
cv.addEventListener('pointercancel',pEnd);
cv.addEventListener('wheel',e=>{if(SCR!=='craft')return;e.preventDefault();const w=s2w(e.clientX,e.clientY),v=C.view;v.z=clamp(v.z*(e.deltaY<0?1.1:.9),.3,3);const c=C.ctr;v.x=w.x-(e.clientX-c.x)/v.z;v.y=w.y-(e.clientY-c.y)/v.z;clampView()},{passive:false});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&SCR==='craft')saveDesk()});
/* ---- home screen ---- */
const SCRAPS=(()=>{const r=mulberry(7),o=[];for(let i=0;i<16;i++)o.push({x:r(),y:r(),s:14+r()*30,a:r()*TAU,c:PAPERS[Math.floor(r()*PAPERS.length)],k:Math.floor(r()*3)});return o})();
function drawBack(dim){g.fillStyle=g.createPattern(WOOD,'repeat');g.fillRect(0,0,W,H);for(const s of SCRAPS){g.save();g.translate(s.x*W,s.y*H);g.rotate(s.a);g.fillStyle=s.c;g.shadowColor='rgba(0,0,0,.25)';g.shadowBlur=4*DPR;g.shadowOffsetY=2*DPR;g.beginPath();if(s.k===0)g.rect(-s.s/2,-s.s/3,s.s,s.s*.66);else if(s.k===1){g.moveTo(0,-s.s/2);g.lineTo(s.s/2,s.s/2);g.lineTo(-s.s/2,s.s/3)}else g.arc(0,0,s.s/2.4,0,TAU);g.fill();g.restore()}if(dim){g.fillStyle='rgba(50,30,15,'+dim+')';g.fillRect(0,0,W,H)}}
function drawHome(){if(!asCover('room_title',g,0,0,W,H))drawBack(.12);/* T022 */const rows=['SHOEBOX','STUDIO'],ts=Math.min(54,W/8.6,H*.34/2.9),top=Math.max(54,H*.38/2-ts*1.25);g.textAlign='center';g.textBaseline='middle';
  rows.forEach((row,ri)=>{const n=row.length,x0=W/2-(n-1)*ts*1.08/2;for(let i=0;i<n;i++){const k=ri*7+i,a=Math.sin(k*2.3)*.13+Math.sin(NOW/900+k)*.015;g.save();g.translate(x0+i*ts*1.08,top+ri*ts*1.22+ts/2+Math.sin(k*1.7)*3);g.rotate(a);g.shadowColor='rgba(0,0,0,.35)';g.shadowBlur=6*DPR;g.shadowOffsetY=3*DPR;g.fillStyle='#fbf6ea';g.fillRect(-ts/2,-ts/2,ts,ts);g.shadowColor='transparent';g.fillStyle=PAPERS[(k*3+ri)%9];g.fillRect(-ts/2+3,-ts/2+3,ts-6,ts-6);g.fillStyle=((k*3+ri)%9===2)?'#3b2f2a':'#fff';g.font='900 '+(ts*.72)+'px ui-rounded,system-ui,sans-serif';g.fillText(row[i],0,ts*.04);g.restore()}});
  g.save();g.translate(W/2,top+ts*2.62);g.rotate(-.025);g.fillStyle='rgba(250,240,190,.92)';const tw=Math.min(W-40,250);g.fillRect(-tw/2,-13,tw,26);g.fillStyle='#3b2f2a';g.font='800 13.5px ui-rounded,system-ui,sans-serif';g.fillText('Cut  ·  Paste  ·  Play',0,1);g.restore();
  g.fillStyle='#fff';g.font='900 20px ui-rounded,system-ui,sans-serif';g.globalAlpha=.65+.35*Math.sin(NOW/400);g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=6;g.fillText('Tap to start',W/2,H*.68);g.globalAlpha=1;g.font='700 12px system-ui';g.fillText('v1.6c · made by MajorasPride',W/2,H-26);g.shadowColor='transparent'}
/* ================= v1.6a: LIVING TOWN, FLIP PAPER, PROJECTOR, CONSOLE SAVE (Nov 13, 2026, ticket T013) ================= */
/* ---- the game clock: one shared clock for Little Town, the studio window and the house window ----
   CLK.m = minutes into the game day (0..1440). One game day = 8 real minutes (DAYSEC). CLK.sp = 1 normal, 2 fast, 0 paused.
   Saved as craftloft_clock. Dawn 5:00-7:00, day 7:00-17:00, dusk 17:00-19:30, night 19:30-5:00. */
const DAYSEC=480,CLK=Object.assign({m:540,sp:1},LS.get('clock',{}));
if(!(CLK.m>=0&&CLK.m<1440))CLK.m=540;
if(![0,1,2].includes(CLK.sp))CLK.sp=1;
let clkSaveT=0,clkKey='';
function clkSave(){LS.set('clock',{m:Math.round(CLK.m*10)/10,sp:CLK.sp})}
function clkTick(dt){if(CLK.sp)CLK.m=(CLK.m+dt*CLK.sp*1440/DAYSEC)%1440;clkSaveT+=dt;if(clkSaveT>5){clkSaveT=0;clkSave()}updClockBtn()}
function dayPhase(){const m=CLK.m;return m>=300&&m<420?'dawn':m>=420&&m<1020?'day':m>=1020&&m<1170?'dusk':'night'}
function nightK(){const m=CLK.m;if(m>=420&&m<1020)return 0;if(m>=1020&&m<1170)return(m-1020)/150;if(m>=300&&m<420)return 1-(m-300)/120;return 1}
const PHEM={dawn:'🌅',day:'☀️',dusk:'🌇',night:'🌙'};
function lerpC(a,b,t){return a.map((v,i)=>Math.round(v+(b[i]-v)*t))}
function tintRGBA(){const t=nightK();if(t<=0)return null;const warm=dayPhase()==='dawn'?[255,165,160]:[255,138,70],c=lerpC(warm,[16,24,68],Math.min(1,t*1.15)),a=.5*t+.16*Math.sin(Math.PI*t);return'rgba('+c.join(',')+','+a.toFixed(3)+')'}
function skyCol(){const t=nightK(),day=[191,227,240],warm=dayPhase()==='dawn'?[246,190,190]:[247,170,110],night=[29,37,71],c=t<.5?lerpC(day,warm,t*2):lerpC(warm,night,(t-.5)*2);return'rgb('+c.join(',')+')'}
function timeStr(){const m=Math.floor(CLK.m),h=Math.floor(m/60),mm=m%60;return((h+11)%12+1)+':'+(mm<10?'0':'')+mm+(h<12?' am':' pm')}
function updClockBtn(){const b=$('#bClock');if(!b)return;const ph=dayPhase(),k=ph+CLK.sp;if(k===clkKey)return;clkKey=k;b.firstChild.textContent=PHEM[ph];const bd=b.querySelector('b');bd.textContent=CLK.sp===0?'⏸':CLK.sp===2?'2x':'';bd.style.display=CLK.sp===1?'none':''}
function clockDlg(){const ph=dayPhase();dlg('<h2>'+PHEM[ph]+' Game clock</h2><p>It is '+timeStr()+' in the game ('+ph+').'+(CLK.sp===0?' The clock is paused.':CLK.sp===2?' Running at 2x speed.':'')+'</p><p style="font-size:12px;opacity:.75">One game day takes 8 real minutes. Lights in Little Town come on at dusk and go off at dawn.</p><div class="btns"><button class="alt" id="ckP">'+(CLK.sp?'⏸ Pause':'▶ Run')+'</button><button class="alt" id="ckF">'+(CLK.sp===2?'1x speed':'⏩ 2x speed')+'</button></div><div class="btns"><button id="ckD">☀️ Jump to day</button><button id="ckN">🌙 Jump to night</button></div><div class="btns"><button class="alt" id="dNo">Close</button></div>',d=>{
  const q=s=>d.querySelector(s),done=m=>{clkSave();SFX.tick();closeDlg();updClockBtn();if(m)toast(m)};
  q('#ckP').onclick=()=>{CLK.sp=CLK.sp?0:1;done(CLK.sp?'The clock is running':'The clock is paused')};q('#ckF').onclick=()=>{CLK.sp=CLK.sp===2?1:2;done(CLK.sp===2?'2x speed':'Normal speed')};
  q('#ckD').onclick=()=>{CLK.m=540;done('Good morning! It is day')};q('#ckN').onclick=()=>{CLK.m=1320;done('Good night! The lights are on')};q('#dNo').onclick=closeDlg})}
$('#bClock').onclick=()=>{auInit();SFX.tick();clockDlg()};
/* ---- main loop ---- */
function frame(ts){DT=Math.min(.05,(ts-NOW)/1000||0);NOW=ts;clkTick(DT);if(OVL){requestAnimationFrame(frame);return}g.setTransform(DPR,0,0,DPR,0,0);
  if(SCR==='title')drawHome();else if(isRoomScr(SCR)){updLobby();if(isRoomScr(SCR))drawLobby()}else if(SCR==='craft'){updCraft();drawCraft()}else if(SCR==='level'||SCR==='town'){updStage();drawStage()}else{drawBack(.3);if(SCR==='kit')kitTick()}
  auTick();requestAnimationFrame(frame)}
addEventListener('pagehide',()=>{clkSave();if(SCR==='town')LS.set('town',TOWN)});

/* ================= CONTENT PACK (T034) =================
   content/default-pack.json is made with creator.html (the owner's Creator Mode page, not linked from the game).
   It ships new default things to every player: items and town pieces (Toy Box, and the showcase town if he placed them),
   buildings (Little Town, with a shop room inside), shop stock (shop shelves, with a price for T027) and Art Class lessons.
   Order: the player's own stuff, then the content pack, then the code-made defaults. Pack toys have ids cp_<key>,
   stock cps_<key>, buildings cp_<key> in BLD and SHOPS. Each one gets an Art Swap slot, so the player's own swap wins.
   ?pack=try uses the pack that creator.html's "Try it in the game" saved in this browser (craftloft_creator_try) instead. */
/* var, not const: these run early in the script (the showcase town, BLD, SHOPS and CLASS call them before this block is reached) */
var _CP,CP_CHANGED,CPT;
function cpMem(){if(!CPT)CPT={};if(!CP_CHANGED)CP_CHANGED=[]}
function cpData(){if(_CP!==undefined)return _CP;_CP=null;let o=null;
  try{if(/[?&]pack=try\b/.test(location.search))o=LS.get('creator_try',null)}catch(e){o=null}
  if(!o){try{const r=new XMLHttpRequest();r.open('GET','content/default-pack.json?v='+Date.now(),false);r.send();if(r.status===200)o=JSON.parse(r.responseText)}catch(e){o=null}}
  try{_CP=cpClean(o)}catch(e){_CP=null}return _CP}
/* only plain checks here: this runs early in the script, before BEH, TACT and MEDIA exist */
function cpClean(o){if(!o||o.format!=='shoebox-content-pack'||!Array.isArray(o.entries))return null;const seen=new Set(),E=[];
  const s=(v,n)=>String(v==null?'':v).slice(0,n),n=(v,d,a,b)=>typeof v==='number'&&isFinite(v)?Math.min(b,Math.max(a,v)):d,toy=t=>t&&typeof t==='object'&&Array.isArray(t.parts)?t:null;
  for(const e of o.entries.slice(0,400)){if(!e||!['item','town','building','shop','lesson'].includes(e.kind))continue;const key=s(e.key,32).toLowerCase().replace(/[^a-z0-9_]/g,'');if(!key||seen.has(e.kind+key))continue;seen.add(e.kind+key);
    const c={key,kind:e.kind,name:s(e.name,24)||'New thing',toy:toy(e.toy),med:/^[a-z]{1,12}$/.test(e.med||'')?e.med:'',price:n(e.price,0,0,99999)};
    if(e.kind==='item'||e.kind==='town'){if(!c.toy)continue;c.beh=/^[a-z]{1,12}$/.test(e.beh||'')?e.beh:(e.kind==='town'?'solid':'solid');c.act=/^[a-z]{1,12}$/.test(e.act||'')?e.act:'none';c.tb=e.tb==='pass'?'pass':'block';
      if(e.show&&typeof e.show==='object')c.show={x:n(e.show.x,800,60,1540),y:n(e.show.y,560,60,1060)}}
    else if(e.kind==='building'){if(!c.toy)continue;c.bw=n(e.bw,180,80,420);c.counter=s(e.counter,24)||(c.name+' Counter');c.sub=s(e.sub,30)||'Coming soon'}
    else if(e.kind==='shop'){if(!c.toy)continue;c.shop=s(e.shop,40).replace(/[^a-z0-9_]/g,'')||'supply'}
    else{c.branch=s(e.branch,12).replace(/[^a-z0-9_]/g,'')||'pack';c.sub=s(e.sub,40)||'A new lesson';c.steps=(Array.isArray(e.steps)?e.steps:[]).slice(0,30).map(q=>({t:s(q&&q.t,300)||'…',c:['paper','hand','draw','cut','fold','stick','done'].includes(q&&q.c)?q.c:'',toy:toy(q&&q.toy)}));if(!c.steps.length)continue}
    E.push(c)}
  return E.length?{name:s(o.name,40),made:n(o.made,0,0,1e14),entries:E}:null}
function cpList(...k){const d=cpData();return d?d.entries.filter(e=>k.includes(e.kind)):[]}
/* a pack picture as a clean toy (made when first needed, after toyClean's helpers exist) */
function cpToy(t,id,name,e){cpMem();if(!t)return null;if(CPT[id])return CPT[id];const c=toyClean(Object.assign({},t,{id}));if(!c)return null;c.id=id;if(name)c.name=name;c.cpack=1;
  if(e){if(BEH[e.beh])c.beh=e.beh;if(TACT[e.act]&&e.act!=='none')c.act=e.act;else delete c.act;if(e.tb==='pass')c.tb='pass';if(e.price)c.price=e.price;if(e.med)c.med={m:[e.med]};c.cpk=e.kind}
  return CPT[id]=c}
function cpItemToy(e){return cpToy(e.toy,'cp_'+e.key,e.name,e)}
/* Toy Box: put the pack's items and town pieces in (or refresh them when the pack changed). A pack piece the player deleted stays deleted.
   A pack piece that is no longer in the pack is taken out (only when a pack did load). */
function cpEnsureToys(){cpMem();const d=cpData();if(!d)return;const gone=new Set(LS.get('cpack_gone',[])),want=new Set();let ch=false;
  cpList('item','town').forEach(e=>{const t=cpItemToy(e);if(!t)return;want.add(t.id);if(gone.has(t.id))return;const i=TOYS.findIndex(x=>x.id===t.id),nt=JSON.parse(JSON.stringify(t));
    if(i<0){TOYS.push(nt);ch=true;CP_CHANGED.push(t.id)}else if(TOYS[i].cpack&&JSON.stringify(TOYS[i])!==JSON.stringify(nt)){TOYS[i]=nt;delete SPR[t.id];ch=true;CP_CHANGED.push(t.id)}});
  const n0=TOYS.length;TOYS=TOYS.filter(t=>!(t.cpack&&!want.has(t.id)));if(TOYS.length!==n0)ch=true;if(ch)saveToys()}
function cpLib(){cpMem();if(!LIB||!cpData())return;let ch=false;LIB.forEach(a=>{if(!a.ref||!/^cp_/.test(a.ref))return;const t=toyById(a.ref);if(!t)return;
  if(!a.tags||!a.tags.length){a.tags=['content pack',t.cpk==='town'?'town piece':'item'].concat(t.med&&t.med.m?t.med.m:[]);ch=true}if(CP_CHANGED.includes(a.ref)&&a.thumb){delete a.thumb;ch=true}});if(ch)saveLib()}
function cpForget(id){if(!/^cp_/.test(id||''))return;const g=LS.get('cpack_gone',[]);if(!g.includes(id)){g.push(id);LS.set('cpack_gone',g)}}
/* the showcase town (new saves and Reset to showcase town): pack pieces he placed there */
function cpShowItems(items){cpList('item','town').forEach(e=>{if(!e.show)return;items.push({toy:'cp_'+e.key,x:e.show.x,y:e.show.y,s:1,flip:1,beh:e.beh,act:e.act||'none',tb:e.tb==='pass'||e.act==='vehicle'?'pass':'block'})})}
/* buildings: one BLD entry each (a shop with a room inside) */
function cpAddBlds(){cpList('building').forEach(e=>{const k='cp_'+e.key,t=e.toy,w=e.bw,h=Math.max(60,Math.round(w*(+t.h||100)/(+t.w||100)));BLD[k]={door:{x:0,y:20},hw:Math.round(w/2),top:h,scr:'shop',shop:k,name:'the '+e.name,cp:1}})}
function cpBldRaw(k){return function(c,p,tag){const e=cpList('building').find(x=>'cp_'+x.key===k),b=BLD[k];if(!e||!b)return;const t=cpToy(e.toy,'cpb_'+e.key,e.name);if(!t)return;
  const w=b.hw*2,sc=w/t.w;c.save();c.translate(p.x,p.y);c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(0,2,w*.45,14,0,0,TAU);c.fill();c.save();c.translate(-w/2,-t.h*sc);c.scale(sc,sc);if(!_asDrawToy(c,t,0,0)){c.restore();c.fillStyle='#e0bb80';c.fillRect(-w/2,-b.top,w,b.top)}else c.restore();
  if(tag){c.font='800 12px system-ui';c.textAlign='center';c.fillStyle='rgba(0,0,0,.55)';c.fillText(tag,0,22)}c.restore()}}
function cpBldDraw(k){const raw=cpBldRaw(k);return function(c,p,tag){if(!asBld('bld_'+k,raw,c,p,tag))raw(c,p,tag)}}
/* shops: each pack building gets a room with its door and a counter. Shop stock shows on the counter (Supply Store: the shelves). Buying comes with T027. */
function cpStock(shop){return cpList('shop').filter(e=>e.shop===shop)}
function cpStockOpt(shop,verb){return cpStock(shop).length?{act:()=>cpShelf(shop),verb}:{soon:1}}
function cpAddShops(){cpList('building').forEach(e=>{const k='cp_'+e.key;SHOPS[k]={id:k,name:e.name,cp:1,room:mkShopRoom(k,[
  {id:'sdoor',out:k,name:'Shop Door',sub:'Back to Little Town',x:460,y:210,wall:1,act:()=>leaveHouse(k),verb:'Go out to Little Town'},
  Object.assign({id:'shop',name:e.counter,sub:e.sub,x:280,y:470,tagY:-150},cpStockOpt(k,'Look at what is for sale'))])}})}
function cpShelf(shop){const L=cpStock(shop),nm=(SHOPS[shop]||{}).name||'the shop';
  dlg('<h2>On the shelves</h2><p>Coming to '+esc(nm)+'. Buying arrives with the shops update.</p><div id="cpSt" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px;margin-top:8px"></div><div class="btns"><button id="dNo">Back</button></div>',d=>{
    const box=d.querySelector('#cpSt');L.forEach(e=>{const t=cpToy(e.toy,'cps_'+e.key,e.name,e);if(!t)return;const q=document.createElement('div');q.style.cssText='background:#fbf6ea;border-radius:8px;padding:6px;text-align:center;color:#3b2f2a;font:700 12px system-ui';q.innerHTML='<canvas style="width:72px;height:72px"></canvas><div>'+esc(t.name)+'</div><div>'+(e.price?'🪙 '+e.price:'Free')+'</div>';box.append(q);thumb(q.querySelector('canvas'),t)});d.querySelector('#dNo').onclick=closeDlg})}
/* lessons: into their Art Class branch (or a "New lessons" branch) */
function cpAddLessons(){cpList('lesson').forEach(e=>{let b=CLASS.find(x=>x.id===e.branch);if(!b){b=CLASS.find(x=>x.id==='pack');if(!b){b={id:'pack',name:'⭐ New lessons',about:'New lessons, made by MajorasPride.',lessons:[]};CLASS.push(b)}}
  b.lessons.push({id:'cp_'+e.key,name:e.name,sub:e.sub,cp:1,steps:e.steps.map(s=>s.c?{t:s.t,c:s.c}:{t:s.t})})})}
/* lesson pictures: the finished picture is step 0, then one per step if he gave one. They are EXAMPLES, so they get Art Swap slots too. */
function cpAddExamples(){const W0=[];cpList('lesson').forEach(e=>{const L='cp_'+e.key,pics=[e.toy].concat(e.steps.map(s=>s.toy));pics.forEach((p,k)=>{const t=cpToy(p,'cpx_'+e.key+'_'+k,e.name);if(!t)return;W0.push(t);
  EXAMPLES.push({id:'ex_'+L+'_'+k,lesson:L,step:k,draw:(c,w,h)=>{const sc=Math.min(w/t.w,h/t.h)*.92;c.save();c.fillStyle='#fbf8f0';c.fillRect(0,0,w,h);c.translate((w-t.w*sc)/2,(h-t.h*sc)/2);c.scale(sc,sc);_asDrawToy(c,t,0,0);c.restore()}})})});
  /* pictures load a moment later: drop any blank copies made before they were ready */
  W0.forEach(t=>{const s=sprite(t),tk=n=>{if(s.ready){for(const k in EXC)if(k.startsWith('ex_cp_'))delete EXC[k];if(SCR==='class')renderClass()}else if(n<80)setTimeout(()=>tk(n+1),60)};tk(0)})}
/* Art Swap slots for everything in the pack */
function cpSlots(add,toyDraw){cpList('item','town').forEach(e=>{const t=toyById('cp_'+e.key)||cpItemToy(e);if(!t)return;add({id:t.id,name:t.name,group:'Content pack',kind:'toy',toy:t,w:t.w,h:t.h,where:e.kind==='town'?'Town piece in the Toy Box'+(e.show?' and the showcase town':''):'Toy Box piece',draw:toyDraw(t)})});
  cpList('shop').forEach(e=>{const t=cpToy(e.toy,'cps_'+e.key,e.name,e);if(!t)return;add({id:t.id,name:t.name,group:'Content pack',kind:'toy',toy:t,w:t.w,h:t.h,where:'For sale in '+((SHOPS[e.shop]||{}).name||'a shop'),draw:toyDraw(t)})});
  cpList('building').forEach(e=>{const k='cp_'+e.key,id='bld_'+k,raw=cpBldRaw(k),b=asBox(id,x=>raw(x,{x:0,y:0},''));add({id,name:e.name+' building',group:'Buildings in town',kind:'building',w:b.w,h:b.h,where:'Little Town, 2D and Retro 3D',draw:(c,w,h)=>{c.save();c.scale(w/b.w,h/b.h);c.translate(-b.x,-b.y);BLDDRAW(k)(c,{x:0,y:0},'');c.restore()}})})}
