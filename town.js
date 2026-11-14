'use strict';
/* Shoebox Studio: town.js — Make a Level, Little Town (Build and Walk), companions, HUD layer, living town, Handy Notebook. */

/* ================= MAKE A LEVEL + LITTLE TOWN ================= */
const LV={W:3200,G:560,TOP:-240,BOT:800},GW=LV.W/4,GH=(LV.BOT-LV.TOP)/4,TW={W:1600,H:1100};
let LVL=LS.get('level',null),TOWN=LS.get('town',null);
if(!LVL){const it=(toy,x,y,beh)=>({toy:'starter_'+toy,x,y,s:1,flip:1,beh});LVL={start:{x:110,y:560},goal:{x:1620,y:560},items:[it('Cloud',300,150,'scenery'),it('Cloud',950,110,'scenery'),it('Paperblock',400,560,'solid'),it('Paperblock',560,560,'solid'),it('Paperblock',560,496,'solid'),it('Button',400,480,'collect'),it('Button',560,410,'collect'),it('Springpad',800,560,'bouncy'),it('Paperblock',1000,330,'solid'),it('Button',1000,250,'collect'),it('Zigzagspikes',1000,560,'ouch'),it('Greenhill',1350,560,'solid'),it('Button',1350,400,'collect')]}}
ensureShowToys();/* v1.6a: the showcase pieces are in every toy box */
if(!TOWN)TOWN=mkShowTown();/* v1.6a: only a brand-new save gets the showcase town. Old towns are never changed. */
/* The player's house stands in Little Town. Its place is saved with the town (TOWN.house), so old towns just get one added.
   Build mode: tap it to go in, drag it to move it. Walk mode: tap it and the hero walks to the door and goes in. */
if(!TOWN.house)TOWN.house={x:930,y:500};
/* v1.5: the studio is a building in Little Town too. Same rules as the house: walk to it to go in, drag it in build mode to move it. */
if(!TOWN.studio)TOWN.studio={x:600,y:470};
const HDOOR={x:27,y:18},SDOOR={x:0,y:20},BLD={house:{door:HDOOR,hw:88,top:154,scr:'house',name:'My House'},studio:{door:SDOOR,hw:112,top:196,scr:'home',name:'the Studio'},
  /* T032: shops are buildings too. Each shop is one line here (scr:'shop' + its SHOPS id) and one line in SHOPS (look, room). Its place is saved as TOWN[id]. */
  supply:{door:{x:47,y:20},hw:92,top:182,scr:'shop',shop:'supply',name:'the Supply Store'}};
cpAddBlds();/* T034: buildings from the content pack */
/* T032: a building that a town does not have yet gets a free spot near the road (old towns and the showcase town alike; nothing else moves) */
function bldSpot(T,k){const b=BLD[k],roads=(T.items||[]).filter(isRoad),pad=18;let best=null,bd=1e9;
  const clear=p=>{const x0=p.x-b.hw-pad,x1=p.x+b.hw+pad,y0=p.y-b.top-pad,y1=p.y+44;
    for(const it of T.items||[]){const r=itemRect(it);if(r&&r.x<x1&&r.x+r.w>x0&&r.y<y1&&r.y+r.h>y0)return false}
    for(const o in BLD){if(o===k||!T[o])continue;const q=T[o],c=BLD[o];if(q.x-c.hw-pad<x1&&q.x+c.hw+pad>x0&&q.y-c.top<y1&&q.y+44>y0)return false}
    const h=T.hero;return!(h&&h.x>x0-20&&h.x<x1+20&&h.y>y0&&h.y<y1+30)};
  for(let y=TW.H-60;y>=b.top+60;y-=20)for(let x=b.hw+40;x<=TW.W-b.hw-40;x+=20){const p={x,y};if(!clear(p))continue;let d=roads.length?1e9:Math.hypot(x-TW.W/2,y-TW.H/2);for(const r of roads)d=Math.min(d,Math.hypot(r.x-x,r.y-(y+30)));if(d<bd){bd=d;best=p}}
  return best||{x:TW.W-b.hw-60,y:b.top+80}}
function ensureBlds(T){let ch=0;for(const k in BLD)if(!T[k]){T[k]=bldSpot(T,k);ch=1}return ch}
if(ensureBlds(TOWN))LS.set('town',TOWN);
const BLDDRAW=k=>k==='house'?drawTownHouse:k==='studio'?drawTownStudio:/^cp_/.test(k)?cpBldDraw(k):drawTownSupply;/* looked up at draw time, so Art Swap's wrapped versions are used */
function goBld(k){const b=BLD[k];if(b.shop)SHOP_ID=b.shop;go(b.scr)}
function bldAt(w){for(const k in BLD){const p=TOWN[k],b=BLD[k];if(Math.abs(w.x-p.x)<b.hw&&w.y>p.y-b.top&&w.y<p.y+12)return k}return null}
function houseAt(w){return bldAt(w)==='house'}
/* T032: the Supply Store: a cardboard shop front with a striped paper awning, a painted sign and a window full of supplies */
function drawTownSupply(c,p,tag){c.save();c.translate(p.x,p.y);c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(0,2,100,15,0,0,TAU);c.fill();
  c.fillStyle='#e7c48c';rr(c,-82,-128,164,128,5);c.fill();c.strokeStyle='#8b5a3c';c.lineWidth=3;c.stroke();
  c.strokeStyle='rgba(139,90,60,.22)';c.lineWidth=1.5;c.beginPath();for(let x=-72;x<80;x+=11){c.moveTo(x,-124);c.lineTo(x,-4)}c.stroke();
  /* sign board on the roof */
  c.save();c.translate(0,-148);c.rotate(.03);c.fillStyle='#3b6fb6';rr(c,-78,-20,156,34,6);c.fill();c.strokeStyle='#fbf6ea';c.lineWidth=3;c.stroke();c.fillStyle='#fbf6ea';c.font='900 15px ui-rounded,system-ui,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('SUPPLY STORE',0,-3);c.textBaseline='alphabetic';c.restore();
  c.fillStyle='#8b5a3c';c.fillRect(-60,-134,5,8);c.fillRect(55,-134,5,8);
  /* striped awning with a scalloped edge */
  for(let i=0;i<9;i++){c.fillStyle=i%2?'#fbf6ea':'#e8443a';c.beginPath();c.moveTo(-90+i*20,-122);c.lineTo(-70+i*20,-122);c.lineTo(-68+i*20,-98);c.lineTo(-92+i*20,-98);c.closePath();c.fill();c.beginPath();c.arc(-80+i*20,-98,10.5,0,Math.PI);c.fill()}
  c.strokeStyle='rgba(120,30,25,.35)';c.lineWidth=2;c.beginPath();c.moveTo(-92,-98);c.lineTo(88,-98);c.stroke();
  /* shop window: crayons in a cup, paper rolls, a paint pot */
  c.fillStyle='#fbf6ea';rr(c,-72,-78,78,56,4);c.fill();c.fillStyle=nightK()>.35?'#ffe2a0':'#cfe9f4';c.fillRect(-68,-74,70,48);
  ['#e8443a','#f7d23e','#4fb3e8','#5bbf5a','#8b5cb6'].forEach((k,i)=>{c.fillStyle=k;c.fillRect(-62+i*5,-58-(i%2)*4,4,22);c.beginPath();c.moveTo(-62+i*5,-58-(i%2)*4);c.lineTo(-60+i*5,-63-(i%2)*4);c.lineTo(-58+i*5,-58-(i%2)*4);c.fill()});
  c.fillStyle='#8b5a3c';c.fillRect(-64,-40,28,14);
  [['#f191b3',-24],['#62b6e8',-12]].forEach(([k,x])=>{c.fillStyle=k;c.fillRect(x-5,-66,10,40);c.fillStyle='rgba(255,255,255,.5)';c.beginPath();c.ellipse(x,-66,5,2.5,0,0,TAU);c.fill()});
  c.fillStyle='#63b35d';rr(c,-6,-42,10,16,2);c.fill();c.fillStyle='#fbf6ea';c.fillRect(-6,-44,10,3);
  c.fillStyle='#8b5a3c';c.fillRect(-72,-24,78,4);
  /* door with an OPEN card */
  c.fillStyle='#6b4a34';rr(c,22,-80,50,80,6);c.fill();c.fillStyle='#e8443a';rr(c,26,-76,42,76,4);c.fill();c.fillStyle='#cfe9f4';rr(c,32,-70,30,26,3);c.fill();
  c.fillStyle='#fbf6ea';c.fillRect(36,-40,22,10);c.fillStyle='#2d8a57';c.font='900 7px system-ui';c.textAlign='center';c.fillText('OPEN',47,-32.5);c.fillStyle='#f5d142';c.beginPath();c.arc(62,-22,3,0,TAU);c.fill();
  c.fillStyle='#f5d142';c.beginPath();c.ellipse(47,9,24,6,0,0,TAU);c.fill();
  if(tag){c.font='800 13px ui-rounded,system-ui,sans-serif';const t='Supply Store',w=c.measureText(t).width+16;c.translate(0,-196);c.rotate(-.02);c.fillStyle='#fbf6ea';c.shadowColor='rgba(0,0,0,.3)';c.shadowBlur=4;c.shadowOffsetY=2;rr(c,-w/2,-11,w,22,5);c.fill();c.shadowColor='transparent';c.fillStyle='#3b2f2a';c.textAlign='center';c.textBaseline='middle';c.fillText(t,0,1);c.font='700 10.5px system-ui';c.fillStyle='#fff';c.shadowColor='rgba(0,0,0,.6)';c.shadowBlur=3;c.fillText(tag,0,18);c.shadowColor='transparent';c.textBaseline='alphabetic'}
  c.restore()}
function drawTownStudio(c,p,tag){c.save();c.translate(p.x,p.y);c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(0,2,116,16,0,0,TAU);c.fill();
  /* a big cardboard shoebox standing on its side, lid propped up as an awning */
  c.fillStyle='#c98e55';rr(c,-100,-150,200,150,6);c.fill();c.strokeStyle='#7d5233';c.lineWidth=3;c.stroke();
  c.strokeStyle='rgba(125,82,51,.25)';c.lineWidth=1.5;c.beginPath();for(let x=-88;x<96;x+=12){c.moveTo(x,-146);c.lineTo(x,-4)}c.stroke();
  c.save();c.translate(0,-150);c.rotate(-.06);c.fillStyle='#e9b36b';rr(c,-112,-26,224,26,5);c.fill();c.strokeStyle='#7d5233';c.lineWidth=3;c.stroke();
  c.fillStyle='#fbf6ea';c.font='900 15px ui-rounded,system-ui,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('SHOEBOX STUDIO',0,-12);c.restore();
  ['#d9463e','#f5d142','#4f8fdc','#63b35d','#f191b3'].forEach((k,i)=>{c.fillStyle=k;c.beginPath();c.moveTo(-90+i*40,-118);c.lineTo(-70+i*40,-118);c.lineTo(-80+i*40,-104);c.closePath();c.fill()});
  c.fillStyle='#fbf6ea';rr(c,-84,-94,46,38,4);c.fill();c.fillStyle='#ffe9a8';c.fillRect(-80,-90,38,30);c.fillStyle='#d9463e';c.beginPath();c.arc(-61,-75,7,0,TAU);c.fill();
  c.fillStyle='#fbf6ea';rr(c,38,-94,46,38,4);c.fill();c.fillStyle='#ffe9a8';c.fillRect(42,-90,38,30);c.strokeStyle='#4f8fdc';c.lineWidth=3;c.beginPath();c.moveTo(48,-66);c.lineTo(60,-82);c.lineTo(72,-66);c.stroke();
  c.fillStyle='#6b4a34';rr(c,-24,-72,48,72,6);c.fill();c.fillStyle='#4f8fdc';rr(c,-20,-68,40,68,4);c.fill();c.fillStyle='#f5d142';c.beginPath();c.arc(12,-34,3.5,0,TAU);c.fill();c.fillStyle='#d9463e';c.beginPath();c.ellipse(0,9,26,6,0,0,TAU);c.fill();
  if(tag){c.font='800 13px ui-rounded,system-ui,sans-serif';const t='The Studio',w=c.measureText(t).width+16;c.translate(0,-214);c.rotate(.03);c.fillStyle='#fbf6ea';c.shadowColor='rgba(0,0,0,.3)';c.shadowBlur=4;c.shadowOffsetY=2;rr(c,-w/2,-11,w,22,5);c.fill();c.shadowColor='transparent';c.fillStyle='#3b2f2a';c.textAlign='center';c.textBaseline='middle';c.fillText(t,0,1);c.font='700 10.5px system-ui';c.fillStyle='#fff';c.shadowColor='rgba(0,0,0,.6)';c.shadowBlur=3;c.fillText(tag,0,18);c.shadowColor='transparent';c.textBaseline='alphabetic'}
  c.restore()}
function drawTownHouse(c,p,tag){c.save();c.translate(p.x,p.y);c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(0,2,92,14,0,0,TAU);c.fill();
  c.fillStyle='#b5523b';c.fillRect(38,-146,18,40);c.fillStyle='#8b3a28';c.fillRect(35,-150,24,7);
  c.fillStyle='#d6a868';rr(c,-70,-94,140,94,4);c.fill();c.strokeStyle='#8b5a3c';c.lineWidth=3;c.stroke();c.strokeStyle='rgba(139,90,60,.28)';c.lineWidth=1.5;c.beginPath();for(let y=-80;y<-6;y+=13){c.moveTo(-66,y);c.lineTo(66,y)}c.stroke();
  c.beginPath();c.moveTo(-88,-88);c.lineTo(0,-152);c.lineTo(88,-88);c.closePath();c.strokeStyle='#fff';c.lineWidth=5;c.lineJoin='round';c.stroke();c.fillStyle='#d9463e';c.fill();c.strokeStyle='rgba(120,30,25,.4)';c.lineWidth=2.5;c.setLineDash([10,7]);c.beginPath();c.moveTo(-52,-108);c.lineTo(52,-108);c.moveTo(-24,-128);c.lineTo(24,-128);c.stroke();c.setLineDash([]);
  c.fillStyle='#fbf6ea';rr(c,-56,-66,42,36,4);c.fill();c.fillStyle=nightK()>.35?'#ffd98a':'#bfe3f0';c.fillRect(-52,-62,34,28);c.fillStyle='#fbf6ea';c.fillRect(-36.5,-62,3,28);c.fillRect(-52,-49.5,34,3);c.fillStyle='#63b35d';c.fillRect(-58,-31,46,7);['#f191b3','#f5d142','#f191b3'].forEach((k,i)=>{c.fillStyle=k;c.beginPath();c.arc(-48+i*13,-33,4,0,TAU);c.fill()});
  c.fillStyle='#6b4a34';rr(c,6,-62,42,62,5);c.fill();c.fillStyle='#63b35d';rr(c,10,-58,34,58,3);c.fill();c.fillStyle='#bfe3f0';c.beginPath();c.arc(27,-40,8,0,TAU);c.fill();c.fillStyle='#f5d142';c.beginPath();c.arc(38,-24,3,0,TAU);c.fill();c.fillStyle='#d9463e';c.beginPath();c.ellipse(27,9,22,6,0,0,TAU);c.fill();
  if(tag){c.font='800 13px ui-rounded,system-ui,sans-serif';const t='My House',w=c.measureText(t).width+16;c.translate(0,-188);c.rotate(-.03);c.fillStyle='#fbf6ea';c.shadowColor='rgba(0,0,0,.3)';c.shadowBlur=4;c.shadowOffsetY=2;rr(c,-w/2,-11,w,22,5);c.fill();c.shadowColor='transparent';c.fillStyle='#3b2f2a';c.textAlign='center';c.textBaseline='middle';c.fillText(t,0,1);c.font='700 10.5px system-ui';c.fillStyle='#fff';c.shadowColor='rgba(0,0,0,.6)';c.shadowBlur=3;c.fillText(tag,0,18);c.shadowColor='transparent';c.textBaseline='alphabetic'}
  c.restore()}
const ST={kind:'level',d:LVL,cam:{x:0,y:0},z:1,sel:null,arm:null,play:false,walk:false,st:null,hero:null,keys:{l:0,r:0,j:0,jb:0},acc:0,got:new Set(),grid:null,won:false,tgt:null,th:{face:1,ph:0}};
function stageZoom(){ST.z=ST.kind==='level'?Math.max(H/600,W/700):clamp(W/460,.8,1.25)}
function enterStage(kind){ST.kind=kind;ST.d=kind==='level'?LVL:TOWN;ST.d.items=ST.d.items.filter(i=>toyById(i.toy));ST.sel=null;ST.arm=null;ST.play=false;ST.walk=false;ST.tgt=null;ST.hop=null;ST.th.z=0;ST.layer='world';ST.hsel=null;PET.ok=false;stageZoom();
  if(kind==='level'){ST.cam.x=-20;ST.cam.y=LV.G-(H-215)/ST.z}else{ST.cam.x=TOWN.hero.x-W/2/ST.z;ST.cam.y=TOWN.hero.y-H*.42/ST.z}buildStageUI()}
const sw=(sx,sy)=>({x:ST.cam.x+sx/ST.z,y:ST.cam.y+sy/ST.z});
function saveStage(){if(!LS.set(ST.kind,ST.d))toast('Could not save. Storage is full.')}
function itemRect(it){const t=toyById(it.toy);if(!t)return null;const w=t.w*it.s,h=t.h*it.s;return{x:it.x-w/2,y:it.y-h,w,h,t}}
const ordY=it=>isRoad(it)?it.y-1e7:it.y;
function drawOrder(){return ST.kind==='town'?ST.d.items.slice().sort((a,b)=>ordY(a)-ordY(b)):ST.d.items}
function itemAt(w){const arr=drawOrder();for(let i=arr.length-1;i>=0;i--){const r=itemRect(arr[i]);if(r&&w.x>=r.x&&w.x<=r.x+r.w&&w.y>=r.y&&w.y<=r.y+r.h)return arr[i]}return null}
function drawItem(c,it,t,swing){const toy=toyById(it.toy);if(!toy)return;c.save();c.translate(it.x,it.y);c.scale(it.s*it.flip,it.s);c.translate(-toy.w/2,-toy.h);drawToy(c,toy,t,swing);c.restore()}
function clampCam(){const vw=W/ST.z,vh=H/ST.z;if(ST.kind==='level'){ST.cam.x=clamp(ST.cam.x,-120,Math.max(-120,LV.W+120-vw));ST.cam.y=clamp(ST.cam.y,LV.TOP-60,LV.G-vh*.4)}else{ST.cam.x=clamp(ST.cam.x,-260,Math.max(-260,TW.W+260-vw));ST.cam.y=clamp(ST.cam.y,-260,Math.max(-260,TW.H+420-vh))}}
/* T029: which way a town piece faces in Retro 3D, in 8 steps (0 = front, toward you in 2D; 2 = right; 4 = back; 6 = left).
   it.rot is set by Build mode's Turn button and saved with the piece. Without it, the piece faces the nearest road (within 160), else the front. */
const FACE_NAMES=['the front','front-right','the right','back-right','the back','back-left','the left','front-left'];
function faceStep(it){if(typeof it.rot==='number')return((it.rot%8)+8)%8;let best=null,bd=160;for(const o of TOWN.items){if(o===it||!isRoad(o))continue;const t=toyById(o.toy);if(!t)continue;const ry=o.y-t.h*(o.s||1)/2,d=Math.hypot(o.x-it.x,ry-it.y);if(d<bd){bd=d;best={x:o.x,y:ry}}}
  if(!best||bd<8)return 0;return((Math.round(Math.atan2(best.x-it.x,best.y-it.y)/(Math.PI/4))%8)+8)%8}
function fixItem(it){if(ST.kind==='level'){it.x=clamp(it.x,0,LV.W);if(it.y>LV.G-10)it.y=LV.G;it.y=Math.max(LV.TOP+40,it.y)}else{it.x=clamp(it.x,20,TW.W-20);it.y=clamp(it.y,40,TW.H-10);if(it.s===1&&isRoad(it)){it.x=clamp(Math.round(it.x/100)*100,0,TW.W);it.y=clamp(Math.round((it.y-70)/100)*100+70,170,TW.H-30)}}}
function sDown(e){const w=sw(e.clientX,e.clientY);if(ST.play)return;if(ST.kind==='level'&&ST.layer==='hud'){hudDown(e);return}if(ST.walk){const dI=ST.kind==='town'&&itemAt(w);if(dI&&dI.act==='door'){dI.open=!dI.open;SFX.clack();saveStage();toast(dI.open?'Open':'Closed');return}const bk=ST.kind==='town'?bldAt(w):null;if(bk){const p=TOWN[bk],dr=BLD[bk].door;ST.tgt={x:p.x+dr.x,y:p.y+dr.y};ST.pendH=bk;ST.st={k:'toHouse'};return}ST.pendH=0;ST.tgt={x:clamp(w.x,20,TW.W-20),y:clamp(w.y,40,TW.H-10)};ST.st={k:'walk'};return}
  if(ST.arm){const t=toyById(ST.arm);if(!t){ST.arm=null;return}if(ST.d.items.length>=120){toast('That is a lot of pieces! Remove some first.');return}const s=Math.min(1,150/Math.max(t.w,t.h)),it={toy:t.id,x:w.x,y:w.y+t.h*s/2,s,flip:1,beh:t.beh||'solid'};if(ST.kind==='town'){it.act=t.act||'none';if(t.road||it.act==='vehicle')it.tb='pass'}fixItem(it);ST.d.items.push(it);ST.sel=it;SFX.thwap();ST.st={k:'drag',it,ox:w.x-it.x,oy:w.y-it.y};updItemBar();return}
  if(ST.kind==='level')for(const k of['goal','start']){const o=ST.d[k];if(Math.abs(w.x-o.x)<36&&w.y>o.y-92&&w.y<o.y+16){ST.st={k:'spec',o,ox:w.x-o.x,oy:w.y-o.y};ST.sel=null;updItemBar();return}}
  const it=itemAt(w);if(it){ST.sel=it;ST.st={k:'drag',it,ox:w.x-it.x,oy:w.y-it.y};SFX.tick()}else if(ST.kind==='town'&&bldAt(w)){const bk=bldAt(w);ST.sel=null;ST.st={k:'house',b:bk,sx:e.clientX,sy:e.clientY,ox:w.x-TOWN[bk].x,oy:w.y-TOWN[bk].y,mv:0}}else{ST.sel=null;ST.st={k:'pan',sx:e.clientX,sy:e.clientY,cx:ST.cam.x,cy:ST.cam.y}}updItemBar()}
function sMove(e){const st=ST.st;if(!st)return;const w=sw(e.clientX,e.clientY);
  if(st.k==='hud'){st.el.fx=clamp((e.clientX-st.ox)/W,0,1);st.el.fy=clamp((e.clientY-st.oy)/H,0,1);st.moved=1}
  else if(st.k==='drag'){st.it.x=w.x-st.ox;st.it.y=w.y-st.oy;fixItem(st.it)}
  else if(st.k==='spec'){st.o.x=clamp(w.x-st.ox,30,LV.W-30);st.o.y=w.y-st.oy;if(st.o.y>LV.G-12)st.o.y=LV.G;st.o.y=Math.max(LV.TOP+100,st.o.y)}
  else if(st.k==='pan'){ST.cam.x=st.cx-(e.clientX-st.sx)/ST.z;ST.cam.y=st.cy-(e.clientY-st.sy)/ST.z;clampCam()}
  else if(st.k==='house'){if(!st.mv&&Math.hypot(e.clientX-st.sx,e.clientY-st.sy)>10)st.mv=1;if(st.mv){const b=TOWN[st.b];b.x=clamp(w.x-st.ox,120,TW.W-120);b.y=clamp(w.y-st.oy,230,TW.H-40)}}
  else if(st.k==='walk')ST.tgt={x:clamp(w.x,20,TW.W-20),y:clamp(w.y,40,TW.H-10)}}
function sUp(e,pin){const st=ST.st;ST.st=null;if(st&&st.k==='house'){if(st.mv)saveStage();else if(!pin){SFX.tick();goBld(st.b)}return}if(st&&(st.k==='drag'||st.k==='spec'||(st.k==='hud'&&st.moved)))saveStage()}
function sPinch(pz){if(pz.cx0===undefined){pz.cx0=ST.cam.x;pz.cy0=ST.cam.y}ST.cam.x=pz.cx0-(pz.cx-pz.mx)/ST.z;ST.cam.y=pz.cy0-(pz.cy-pz.my)/ST.z;clampCam()}
/* ---- play ---- */
function buildGrid(){const gr=new Uint8Array(GW*GH);[['solid',1],['bouncy',3],['ouch',5]].forEach(([beh,bit])=>{const c=mkCanvas(GW,GH,true),x=c._x;x.scale(.25,.25);x.translate(0,-LV.TOP);LVL.items.forEach(it=>{if(it.beh===beh)drawItem(x,it,0,0)});const d=x.getImageData(0,0,GW,GH).data;for(let i=0;i<GW*GH;i++)if(d[i*4+3]>90)gr[i]|=bit});ST.grid=gr}
function rf(x0,y0,x1,y1){let f=0;if(y1>LV.G+.001||x0<0||x1>LV.W)f|=1;const gx0=Math.max(0,Math.floor(x0/4)),gx1=Math.min(GW-1,Math.floor((x1-.01)/4)),gy0=Math.max(0,Math.floor((y0-LV.TOP)/4)),gy1=Math.min(GH-1,Math.floor((y1-LV.TOP-.01)/4));for(let gy=gy0;gy<=gy1;gy++)for(let gx=gx0;gx<=gx1;gx++)f|=ST.grid[gy*GW+gx];return f}
const hf=(x,y)=>rf(x-10,y-36,x+10,y);
function respawn(){ST.hero={x:LVL.start.x,y:LVL.start.y,vx:0,vy:0,on:false,face:1,ph:0,coy:0};petSnap(LVL.start.x,LVL.start.y)}
function startPlay(){if(LVL.items.some(it=>!sprite(toyById(it.toy)).ready)){toast('One moment, still unpacking the toy box');return}buildGrid();ST.play=true;ST.won=false;ST.got=new Set();ST.inv=[];ST.invT=0;ST.hpMax=LVL.hud&&LVL.hud.bar?Math.max(1,LVL.hud.bar.part.set.max||10):0;ST.hp=ST.hpMax;ST.layer='world';ST.hsel=null;ST.sel=null;ST.arm=null;ST.keys={l:0,r:0,j:0,jb:0};respawn();showScr();updHud();SFX.tick();if(LVL.music)songPlay(LVL.music.song,true)}
function stopPlay(){songStop();ST.play=false;ST.cam.y=LV.G-(H-215)/ST.z;clampCam();showScr();buildStageUI()}
function updHud(){const tot=LVL.items.filter(i=>i.beh==='collect').length;$('#hud').textContent='🔘 '+ST.got.size+' / '+tot}
function die(){SFX.ouch();respawn()}
function step(dt){const h=ST.hero,k=ST.keys,ax=k.r-k.l;h.vx+=(ax*200-h.vx)*Math.min(1,dt*14);if(ax)h.face=ax;h.vy=Math.min(900,h.vy+1500*dt);k.jb-=dt;h.coy-=dt;
  if(k.jb>0&&(h.on||h.coy>0)){h.vy=-570;h.on=false;h.coy=0;k.jb=0;SFX.jump()}if(!k.j&&h.vy<-220)h.vy=-220;
  const nx=h.x+h.vx*dt;if(!(hf(nx,h.y)&1))h.x=nx;else{let ok=false;for(let s=4;s<=12;s+=4)if(!(hf(nx,h.y-s)&1)){h.y-=s;h.x=nx;ok=true;break}if(!ok)h.vx=0}
  const ny=h.y+h.vy*dt;if(hf(h.x,ny)&1){if(h.vy>0){let y=h.y;while(y<ny&&!(hf(h.x,y+1)&1))y+=1;h.y=y}h.vy=0}else h.y=ny;
  h.on=!!(hf(h.x,h.y+1)&1);if(h.on){h.coy=.1;if(rf(h.x-10,h.y,h.x+10,h.y+3)&2){h.vy=-780;h.on=false;h.coy=0;SFX.bounce()}}
  if(Math.abs(h.vx)>20&&h.on)h.ph+=dt*14;
  if(ST.invT>0)ST.invT-=dt;
  const fell=h.y>LV.BOT-50;if(rf(h.x-12,h.y-38,h.x+12,h.y+2)&4||fell){if(!ST.hpMax){die();return}if(hurt(fell))return}
  for(const it of LVL.items){if(it.beh!=='collect'||ST.got.has(it))continue;const r=itemRect(it);if(r&&h.x+10>r.x&&h.x-10<r.x+r.w&&h.y>r.y&&h.y-36<r.y+r.h){ST.got.add(it);invAdd(it.toy);SFX.collect();updHud()}}
  const gl=LVL.goal;if(!ST.won&&Math.abs(h.x-gl.x)<28&&h.y>gl.y-80&&h.y<gl.y+12){ST.won=true;songStop();SFX.win();const tot=LVL.items.filter(i=>i.beh==='collect').length;
    dlg('<h2>You made it! 🎉</h2><p>Buttons found: '+ST.got.size+' of '+tot+'</p><div class="btns"><button class="alt" id="dA">Play again</button><button id="dB">Back to building</button></div>',d=>{d.querySelector('#dA').onclick=()=>{closeDlg();startPlay()};d.querySelector('#dB').onclick=()=>{closeDlg();stopPlay()}})}}
function updStage(){ST.t=(ST.t||0)+DT;if(ST.kind==='town')townActs(DT);
  if(ST.play&&!ST.won){ST.acc+=DT;let n=0;while(ST.acc>1/120&&n++<8){step(1/120);ST.acc-=1/120}const h=ST.hero,vw=W/ST.z,vh=H/ST.z;petFollow(h.x,h.y,0,24);ST.cam.x=clamp(h.x-vw/2,-20,Math.max(-20,LV.W+20-vw));const base=LV.G-(H-165)/ST.z,ty=Math.min(base,h.y-vh*.45);ST.cam.y+=(ty-ST.cam.y)*Math.min(1,DT*6)}
  if(ST.kind==='town'&&ST.walk){const hr=TOWN.hero;
    if(ST.hop){const h=ST.hop;h.t+=DT/.5;const k=Math.min(1,h.t);hr.x=h.x0+(h.x1-h.x0)*k;hr.y=h.y0+(h.y1-h.y0)*k;ST.th.z=Math.sin(k*Math.PI)*h.ht;ST.th.ph+=DT*10;if(k>=1){ST.hop=null;ST.th.z=0;SFX.step()}}
    else if(ST.tgt){const dx=ST.tgt.x-hr.x,dy=ST.tgt.y-hr.y,d=Math.hypot(dx,dy);if(d>4){const v=Math.min(d,175*DT),ux=dx/d,uy=dy/d,nx=hr.x+ux*v,ny=hr.y+uy*v,cur=townHit(hr.x,hr.y),free=(x,y)=>{const h=townHit(x,y);return !h||h===cur},hit=townHit(nx,ny);let moved=true;
        if(hit&&hit!==cur){moved=false;if((hit.tb||'block')==='climb'){let sd=10,ex=0,ey=0;for(;sd<420;sd+=8){ex=hr.x+ux*sd;ey=hr.y+uy*sd;if(townHit(ex,ey)!==hit)break}ex+=ux*8;ey+=uy*8;if(sd<420&&!townHit(ex,ey)&&ex>20&&ex<TW.W-20&&ey>40&&ey<TW.H-10){const r=itemRect(hit);ST.hop={x0:hr.x,y0:hr.y,x1:ex,y1:ey,t:0,ht:Math.min(90,r.h*.7+24)};SFX.jump()}else ST.tgt=null}
          else if(free(nx,hr.y)&&Math.abs(ux)>.2){hr.x=nx;moved=true}else if(free(hr.x,ny)&&Math.abs(uy)>.2){hr.y=ny;moved=true}else if(ST.pendH&&d<190){const bk=ST.pendH;ST.pendH=0;ST.tgt=null;SFX.tick();goBld(bk);return}else{ST.tgt=null;ST.pendH=0;if(!ST.bumpT||NOW-ST.bumpT>900){ST.bumpT=NOW;SFX.thud()}}}
        else{hr.x=nx;hr.y=ny}
        if(moved){if(Math.abs(dx)>2)ST.th.face=dx>0?1:-1;const p0=ST.th.ph;ST.th.ph+=DT*14;if(Math.floor(p0/Math.PI)!==Math.floor(ST.th.ph/Math.PI))SFX.step()}}else{ST.tgt=null;LS.set('town',TOWN);if(ST.pendH){const bk=ST.pendH;ST.pendH=0;SFX.tick();goBld(bk);return}}}
    petFollow(hr.x,hr.y,ST.th.z||0,40);
    const vw=W/ST.z,vh=H/ST.z;ST.cam.x+=(hr.x-vw/2-ST.cam.x)*Math.min(1,DT*5);ST.cam.y+=(hr.y-vh*.45-ST.cam.y)*Math.min(1,DT*5)}}
/* little town: what you cannot walk through */
const TBEH={block:{em:'🧱',name:'Blocks the way'},pass:{em:'👣',name:'Walk through'},climb:{em:'🧗',name:'Climb over'}};
function foot(it){const r=itemRect(it);if(!r)return null;const d=clamp(r.h*.25,10,34),hw=r.w*.4;return{x0:it.x-hw-9,x1:it.x+hw+9,y0:it.y-d,y1:it.y+6}}
function townHit(x,y){const hp=TOWN.house;if(x>hp.x-80&&x<hp.x+80&&y>hp.y-46&&y<hp.y+5)return hp;const sp=TOWN.studio;if(x>sp.x-104&&x<sp.x+104&&y>sp.y-50&&y<sp.y+5)return sp;for(const k in BLD){if(k==='house'||k==='studio')continue;const q=TOWN[k],b=BLD[k];if(q&&x>q.x-b.hw+6&&x<q.x+b.hw-6&&y>q.y-48&&y<q.y+5)return q}for(const it of TOWN.items){if((it.tb||'block')==='pass'||it.act==='vehicle'||(it.act==='door'&&it.open)||isRoad(it))continue;const f=foot(it);if(f&&x>f.x0&&x<f.x1&&y>f.y0&&y<f.y1)return it}return null}
/* ---- the placeholder hero: a little paper pal with a folded hat ---- */
function drawHero(c,x,y,face,ph,air){c.save();c.translate(x,y);c.scale(face,1);const s=Math.sin(ph)*(air?.25:.7),part=(fn,col)=>{fn();c.strokeStyle='#fff';c.lineWidth=4;c.lineJoin='round';c.stroke();fn();c.fillStyle=col;c.fill()};
  for(const k of[-1,1]){c.save();c.translate(k*4.5,-13);c.rotate(k*s);part(()=>rr(c,-3.5,0,7,13,3),'#3767bb');c.restore()}
  c.save();c.translate(-7,-25);c.rotate(-s*.8+.2);part(()=>rr(c,-3,0,6,12,3),'#62b6e8');c.restore();
  part(()=>rr(c,-10,-29,20,18,6),'#62b6e8');
  c.save();c.translate(7,-25);c.rotate(s*.8-.2);part(()=>rr(c,-3,0,6,12,3),'#62b6e8');c.restore();
  part(()=>{c.beginPath();c.arc(0,-37,10,0,TAU)},'#f5d142');part(()=>{c.beginPath();c.moveTo(-12,-44);c.lineTo(12,-44);c.lineTo(1,-59);c.closePath()},'#d9463e');
  c.fillStyle='#3b2f2a';c.beginPath();c.arc(2,-38,1.7,0,TAU);c.arc(7,-38,1.7,0,TAU);c.fill();c.strokeStyle='#3b2f2a';c.lineWidth=1.3;c.beginPath();c.arc(4.5,-34.5,3,.2,Math.PI-.2);c.stroke();c.restore()}
function hillY(x,k){return Math.sin(x*.004*k+k)*30+Math.sin(x*.011*k+2*k)*14}
function drawStage(){const z=ST.z,cam=ST.cam,t=ST.t||0,lvl=ST.kind==='level';
  if(lvl){g.fillStyle='#bfe3f0';g.fillRect(0,0,W,H);const gy=(LV.G-cam.y)*z;
    g.fillStyle='#f5d142';g.beginPath();g.arc(W-70,96,34,0,TAU);g.fill();g.strokeStyle='#fff';g.lineWidth=4;g.stroke();g.fillStyle='rgba(250,240,190,.7)';g.save();g.translate(W-70,62);g.rotate(-.2);g.fillRect(-22,-8,44,16);g.restore();
    [['#a9d8a3',.25,150,1],['#86c486',.5,80,1.7]].forEach(([col,par,up,k])=>{g.fillStyle=col;g.beginPath();g.moveTo(-20,H+20);for(let x=-20;x<=W+20;x+=20)g.lineTo(x,gy-up*z-hillY(x+cam.x*z*par,k)*z);g.lineTo(W+20,H+20);g.closePath();g.fill();g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=3;g.stroke()})}
  else{g.fillStyle=g.createPattern(WOOD,'repeat');g.save();g.translate(-cam.x*z%256,-cam.y*z%256);g.fillRect(-256,-256,W+512,H+512);g.restore();g.fillStyle='rgba(60,35,15,.25)';g.fillRect(0,0,W,H);asCover('room_town',g,0,0,W,H)/* T022 */}
  g.save();g.scale(z,z);g.translate(-cam.x,-cam.y);
  if(lvl){g.fillStyle=g.createPattern(KRAFT,'repeat');g.fillRect(0,LV.G,LV.W,500);g.fillStyle='rgba(120,80,40,.5)';g.fillRect(0,LV.G,LV.W,5);g.strokeStyle='rgba(120,80,40,.35)';g.lineWidth=2;g.beginPath();const x0=Math.max(0,Math.floor(cam.x/9)*9),x1=Math.min(LV.W,cam.x+W/z);for(let x=x0;x<=x1;x+=9){g.moveTo(x,LV.G+9);g.lineTo(x,LV.G+22)}g.stroke();g.fillStyle='rgba(120,80,40,.5)';g.fillRect(0,LV.G+26,LV.W,3);
    g.fillStyle='rgba(40,25,10,.35)';g.fillRect(-600,LV.TOP-400,600,2000);g.fillRect(LV.W,LV.TOP-400,600,2000);
    for(const it of LVL.items){if(ST.play&&ST.got.has(it))continue;drawItem(g,it,t,ST.play?1:0)}
    const s=LVL.start;g.strokeStyle='#f5d142';g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(s.x-14,s.y);g.lineTo(s.x-14,s.y-74);g.stroke();g.fillStyle='#d9463e';g.strokeStyle='#fff';g.lineWidth=3;g.beginPath();g.moveTo(s.x-12,s.y-74);g.lineTo(s.x+26,s.y-62);g.lineTo(s.x-12,s.y-48);g.closePath();g.stroke();g.fill();
    const gl=LVL.goal;g.strokeStyle='#8b5a3c';g.lineWidth=5;g.beginPath();g.moveTo(gl.x,gl.y);g.lineTo(gl.x,gl.y-40);g.stroke();g.save();g.translate(gl.x,gl.y-56);g.rotate(Math.sin(t*2)*.15);g.beginPath();for(let i=0;i<10;i++){const r=i%2?12:27,a=-Math.PI/2+i*Math.PI/5;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.strokeStyle='#fff';g.lineWidth=5;g.lineJoin='round';g.stroke();g.fillStyle='#f5d142';g.fill();g.restore();
    if(ST.play){const h=ST.hero;drawPet(g,PET.x,PET.y);if(!(ST.invT>0&&Math.floor(ST.invT*12)%2))drawHero(g,h.x,h.y,h.face,h.ph,!h.on)}}
  else{g.fillStyle='rgba(0,0,0,.3)';g.fillRect(8,10,TW.W,TW.H);g.fillStyle=g.createPattern(KRAFT,'repeat');g.fillRect(0,0,TW.W,TW.H);g.strokeStyle='rgba(90,60,30,.13)';g.lineWidth=1.5;g.beginPath();for(let x=100;x<TW.W;x+=100){g.moveTo(x,0);g.lineTo(x,TW.H)}for(let y=100;y<TW.H;y+=100){g.moveTo(0,y);g.lineTo(TW.W,y)}g.stroke();
    g.fillStyle='rgba(250,240,190,.75)';[[0,0],[TW.W,0],[0,TW.H],[TW.W,TW.H]].forEach((p,i)=>{g.save();g.translate(p[0],p[1]);g.rotate(Math.PI/4+i*Math.PI/2);g.fillRect(-45,-13,90,26);g.restore()});
    g.fillStyle='rgba(90,60,30,.45)';g.font='900 40px system-ui';g.textAlign='center';g.fillText('Little Town',TW.W/2,70);
    const hr=TOWN.hero,hz=ST.th.z||0,arr=drawOrder().map(it=>({y:ordY(it),it})).concat([{y:hz?1e9:hr.y,hero:1},{y:PET.z>2?1e9-1:PET.y-.1,pet:1},{y:TOWN.house.y,house:1},{y:TOWN.studio.y,studio:1}].concat(Object.keys(BLD).filter(k=>k!=='house'&&k!=='studio'&&TOWN[k]).map(k=>({y:TOWN[k].y,bk:k})))).sort((a,b)=>a.y-b.y);if(!PET.ok)petSnap(hr.x,hr.y);
    for(const o of arr){if(o.bk){BLDDRAW(o.bk)(g,TOWN[o.bk],ST.arm?'':ST.walk?'tap to go in':'tap to go in · drag to move')}else if(o.studio){drawTownStudio(g,TOWN.studio,ST.arm?'':ST.walk?'tap to go in':'tap to go in · drag to move')}else if(o.house){drawTownHouse(g,TOWN.house,ST.arm?'':ST.walk?'tap to go in':'tap to go in · drag to move')}else if(o.pet){if(PET.kind!=='none'){g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(PET.x,PET.y,12,4,0,0,TAU);g.fill();drawPet(g,PET.x,PET.y-PET.z)}}else if(o.hero){g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(hr.x,hr.y,14,5,0,0,TAU);g.fill();drawHero(g,hr.x,hr.y-hz,ST.th.face,ST.th.ph,hz>0)}else{const r=itemRect(o.it);if(!r)continue;if(!isRoad(o.it)){g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(o.it.x,o.it.y,r.w*.45,Math.min(12,r.w*.12),0,0,TAU);g.fill()}drawTownItem(o.it,r,t)}}
    townNight();
    if(ST.walk&&ST.tgt){g.strokeStyle='rgba(217,70,62,.8)';g.lineWidth=3;g.beginPath();g.arc(ST.tgt.x,ST.tgt.y,9+Math.sin(t*8)*2,0,TAU);g.stroke()}}
  if(!ST.play&&!ST.walk){
    if(lvl)for(const it of LVL.items){if(it.beh==='solid')continue;const r=itemRect(it);if(!r)continue;g.font=(15/z)+'px system-ui';g.textAlign='left';g.textBaseline='bottom';g.fillText(BEH[it.beh].em,r.x,r.y+2)}
    if(ST.sel){const r=itemRect(ST.sel);if(r){g.strokeStyle='#fff';g.lineWidth=2.5/z;g.setLineDash([8/z,6/z]);g.lineDashOffset=-NOW/60;g.strokeRect(r.x-4,r.y-4,r.w+8,r.h+8);g.setLineDash([]);
      /* T029: a small arrow at its feet shows which way it faces in 3D (moving things always face you there) */
      const it=ST.sel;if(ST.kind==='town'&&it.act!=='vehicle'&&!isRoad(it)){const a=faceStep(it)*Math.PI/4,dx=Math.sin(a),dy=Math.cos(a),L=34/z,x0=it.x,y0=it.y;g.strokeStyle='#fff';g.fillStyle='#d9463e';g.lineWidth=5/z;g.beginPath();g.moveTo(x0,y0);g.lineTo(x0+dx*L,y0+dy*L*.5);g.stroke();g.strokeStyle='#d9463e';g.lineWidth=2.5/z;g.stroke();g.beginPath();const hx=x0+dx*L,hy=y0+dy*L*.5;g.arc(hx,hy,5/z,0,TAU);g.fill()}}}}
  g.restore();if(lvl)drawHUD()}
const BEH={solid:{em:'🧱',name:'Solid'},scenery:{em:'🎨',name:'Scenery'},bouncy:{em:'🦘',name:'Bouncy'},collect:{em:'🔘',name:'Collect'},ouch:{em:'💥',name:'Ouch'}};
/* ================= COMPANIONS that follow the hero ================= */
/* To add a companion: add its name to PETS and a branch in drawPet. */
const PETS={none:['🚫','No companion'],dog:['🐶','Dog'],chicken:['🐔','Chicken'],cat:['🐱','Cat']};
const PET={kind:LS.get('pet','dog'),x:0,y:0,z:0,face:1,ph:0,path:[],ok:false};
function petSnap(x,y){PET.x=x-34;PET.y=y;PET.z=0;PET.path=[];PET.ok=true;PET.face=1}
function petFollow(hx,hy,hz,stop){if(PET.kind==='none')return;if(!PET.ok||Math.hypot(hx-PET.x,hy-PET.y)>420){petSnap(hx,hy);return}const P=PET.path,l=P[P.length-1];if(!l||Math.hypot(hx-l.x,hy-l.y)>5)P.push({x:hx,y:hy,z:hz});if(P.length>240)P.shift();
  let bud=250*DT,moved=false;while(bud>0&&P.length&&Math.hypot(hx-PET.x,hy-PET.y)>stop){const t=P[0],dx=t.x-PET.x,dy=t.y-PET.y,d=Math.hypot(dx,dy);if(d<=bud){PET.x=t.x;PET.y=t.y;PET.z=t.z;P.shift();bud-=d}else{PET.x+=dx/d*bud;PET.y+=dy/d*bud;PET.z+=(t.z-PET.z)*.3;bud=0}if(Math.abs(dx)>1)PET.face=dx>0?1:-1;moved=true}
  if(moved)PET.ph+=DT*16;else{PET.z*=.8;if(Math.abs(hx-PET.x)>6)PET.face=hx>=PET.x?1:-1}}
function drawPet(c,x,y){const k=PET.kind;if(k==='none'||!PET.ok)return;c.save();c.translate(x,y);c.scale(PET.face,1);const s=Math.sin(PET.ph),part=(fn,col)=>{fn();c.strokeStyle='#fff';c.lineWidth=3.5;c.lineJoin='round';c.stroke();fn();c.fillStyle=col;c.fill()},leg=(lx,col,sg)=>{c.save();c.translate(lx,-9);c.rotate(s*.55*sg);part(()=>rr(c,-2.5,0,5,10,2),col);c.restore()},dot=(dx,dy,r)=>{c.beginPath();c.arc(dx,dy,r,0,TAU);c.fill()};
  if(k==='dog'){const b='#caa76c',d='#8b5a3c';leg(-8,d,1);leg(8,d,-1);c.save();c.translate(-13,-17);c.rotate(-.9+s*.55);part(()=>rr(c,-2,-11,4,12,2),d);c.restore();part(()=>rr(c,-14,-20,28,13,6),b);part(()=>{c.beginPath();c.arc(13,-23,8,0,TAU)},b);part(()=>rr(c,6,-30,5,11,2.5),d);c.fillStyle='#3b2f2a';dot(15,-24,1.5);dot(20.5,-21,1.9)}
  else if(k==='cat'){const b='#f08a2e',d='#d9761f';leg(-8,d,1);leg(8,d,-1);c.save();c.translate(-12,-17);c.rotate(-.35+s*.3);part(()=>rr(c,-2,-17,4,18,2),b);c.restore();part(()=>rr(c,-13,-19,26,12,6),b);part(()=>{c.beginPath();c.moveTo(5,-27);c.lineTo(7,-36);c.lineTo(12,-30);c.closePath()},d);part(()=>{c.beginPath();c.moveTo(13,-30);c.lineTo(18,-36);c.lineTo(20,-27);c.closePath()},d);part(()=>{c.beginPath();c.arc(12.5,-23,7.5,0,TAU)},b);c.fillStyle='#3b2f2a';dot(11,-24,1.4);dot(16,-24,1.4);c.strokeStyle='#3b2f2a';c.lineWidth=.9;c.beginPath();c.moveTo(18,-21);c.lineTo(25,-22);c.moveTo(18,-20);c.lineTo(25,-19);c.stroke()}
  else{c.strokeStyle='#f08a2e';c.lineWidth=2.5;c.lineCap='round';for(const q of[-3,4]){c.beginPath();c.moveTo(q,-8);c.lineTo(q+s*3*(q<0?1:-1),0);c.stroke()}part(()=>{c.beginPath();c.moveTo(-9,-18);c.lineTo(-19,-27);c.lineTo(-8,-25);c.closePath()},'#f6f2e9');part(()=>{c.beginPath();c.arc(0,-17,10.5,0,TAU)},'#f6f2e9');part(()=>{c.beginPath();c.arc(8,-29+s*1.2,6,0,TAU)},'#f6f2e9');c.fillStyle='#d9463e';dot(6,-35+s*1.2,2.6);dot(9.5,-36+s*1.2,2.6);dot(11,-25+s*1.2,2);c.fillStyle='#f5d142';c.beginPath();c.moveTo(13,-31+s*1.2);c.lineTo(19,-28.5+s*1.2);c.lineTo(13,-27+s*1.2);c.fill();c.fillStyle='#3b2f2a';dot(9.5,-30+s*1.2,1.3)}
  c.restore()}
function petMenu(){dlg('<h2>Pick a companion</h2><p>It follows you in the loft, in Little Town and in your levels.</p>'+Object.keys(PETS).map(k=>'<button class="les" data-p="'+k+'" style="margin-top:8px;'+(PET.kind===k?'background:var(--yellow)':'')+'"><span>'+PETS[k][0]+' '+PETS[k][1]+'</span><i>'+(PET.kind===k?'✓':'')+'</i></button>').join(''),d=>d.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{PET.kind=b.dataset.p;LS.set('pet',PET.kind);PET.ok=false;SFX.collect();closeDlg();toast(PET.kind==='none'?'No companion for now':'Your '+PETS[PET.kind][1].toLowerCase()+' will follow you')}))}
/* ================= HUD LAYER in Make a Level ================= */
function hudOf(){if(!LVL.hud)LVL.hud={bar:null,slots:[],plate:null,panels:[]};const h=LVL.hud;h.slots=h.slots||[];h.panels=h.panels||[];return h}
function hudK(){return clamp(Math.round(Math.min(W,H)/140),2,4)}
function hudEls(){const hd=LVL.hud;if(!hd)return[];const k=hudK(),out=[],put=(el,kind,sz)=>{const w=sz.w*k,h=(sz.h+sz.top)*k,x=clamp(Math.round(el.fx*W),4,Math.max(4,W-w-4)),y=clamp(Math.round(el.fy*H),48,Math.max(48,H-h-4));out.push({el,kind,x,y,w,h,k,sz})};
  (hd.panels||[]).forEach(p=>put(p,'panel',uiSize(p.part,{w:p.w,h:p.h})));if(hd.bar)put(hd.bar,'bar',uiSize(hd.bar.part));(hd.slots||[]).forEach(s=>put(s,'slot',uiSize(s.part)));return out}
function plateRect(){const hd=LVL.hud;if(!hd||!hd.plate)return null;const z=ST.z,k=Math.max(2,hudK()-1),pt=ST.play&&ST.hero?ST.hero:LVL.start,sz=uiSize(hd.plate.part,{name:hd.plate.name}),w=sz.w*k,h=(sz.h+sz.top)*k,sx=(pt.x-ST.cam.x)*z,sy=(pt.y-ST.cam.y)*z-(ST.play?64:84)*z;return{x:Math.round(sx-w/2),y:Math.round(sy-h),w,h,k,sz}}
function drawToyIn(c,id,x,y,s){const t=toyById(id);if(!t)return;c.save();c.imageSmoothingEnabled=true;const sc=Math.min(s/t.w,s/t.h)*.92;c.translate(x+(s-t.w*sc)/2,y+(s-t.h*sc)/2);c.scale(sc,sc);drawToy(c,t,0,0);c.restore()}
function drawHUD(){const hd=LVL.hud;if(!hd)return;const edit=!ST.play,on=ST.layer==='hud',t=ST.t||0;g.save();g.globalAlpha=edit&&!on?.5:1;
  const sel=r=>{if(edit&&on&&ST.hsel===r.el){g.strokeStyle='#fff';g.lineWidth=2.5;g.setLineDash([8,6]);g.lineDashOffset=-NOW/60;g.strokeRect(r.x-4,r.y-4,r.w+8,r.h+8);g.setLineDash([])}};
  for(const r of hudEls()){const o={t};if(r.kind==='panel'){o.w=r.el.w;o.h=r.el.h}if(r.kind==='bar'&&ST.play){o.val=ST.hp;o.max=ST.hpMax}
    if(r.kind==='slot'&&ST.play){const inv=ST.inv[hd.slots.indexOf(r.el)];if(inv){o.count=inv.n;o.icon=(c,x,y,s)=>drawToyIn(c,inv.toy,x,y,s)}else{o.count=0;o.empty=true}}
    uiDraw(g,r.el.part,r.x,r.y+r.sz.top*r.k,r.k,o);sel(r)}
  if(hd.plate){const r=plateRect();if(r&&!(ST.play&&ST.invT>0&&Math.floor(ST.invT*12)%2)){uiDraw(g,hd.plate.part,r.x,r.y+r.sz.top*r.k,r.k,{t,name:hd.plate.name});r.el=hd.plate;sel(r)}}
  g.restore()}
function hudDown(e){const x=e.clientX,y=e.clientY,els=hudEls(),inR=r=>x>=r.x-6&&x<=r.x+r.w+6&&y>=r.y-6&&y<=r.y+r.h+6;
  for(let i=els.length-1;i>=0;i--){const r=els[i];if(inR(r)){ST.hsel=r.el;ST.st={k:'hud',el:r.el,ox:x-r.x,oy:y-r.y,moved:0};SFX.tick();updItemBar();return}}
  const pr=plateRect();if(pr&&inR(pr)){ST.hsel=LVL.hud.plate;ST.st=null;SFX.tick();updItemBar();return}
  ST.hsel=null;updItemBar();ST.st={k:'pan',sx:x,sy:y,cx:ST.cam.x,cy:ST.cam.y}}
function hudPlace(a){const hd=hudOf(),p=uiClean(a.data);if(!p){toast('That part cannot be used');return}const k=hudK(),N=UI_GRID;
  if(p.kind==='bar'){const old=hd.bar;hd.bar={part:p,aid:a.id,fx:old?old.fx:10/W,fy:old?old.fy:104/H};ST.hsel=hd.bar;toast('Health bar placed. Drag it where you like. It holds '+(p.set.max||10)+'.')}
  else if(p.kind==='slot'){if(hd.slots.length>=5){toast('Five slots is the most');return}const sw=(N+8)*k,last=hd.slots[hd.slots.length-1];let fx=10/W,fy=(104+N*k+12)/H;if(last){fx=last.fx+(sw+6)/W;fy=last.fy;if(fx*W+sw>W-4){fx=10/W;fy=last.fy+(sw+6)/H}}const s={part:p,aid:a.id,fx,fy};hd.slots.push(s);ST.hsel=s;toast('Item slot placed. Pickups you collect show up here.')}
  else if(p.kind==='banner'){hd.plate={part:p,aid:a.id,name:p.set.name||'HERO'};ST.hsel=hd.plate;toast('Nameplate placed over the hero')}
  else{if(hd.panels.length>=3){toast('Three panels is the most');return}const s={part:p,aid:a.id,fx:.5-((p.set.pw||8)*N/2*k)/2/W,fy:.25,w:(p.set.pw||8)*N/2,h:(p.set.ph||5)*N/2};hd.panels.push(s);ST.hsel=s;toast('Panel placed. Drag it, or make it bigger with ➕')}
  SFX.thwap();saveStage();updItemBar()}
function buildHudUI(){const tray=$('#tray'),parts=LIB.filter(a=>a.type==='ui'&&a.data).sort((a,b)=>(b.date||0)-(a.date||0));
  if(!parts.length){tray.innerHTML='<div id="trayEmpty">No UI parts yet. Make a health bar, slots or a nameplate at the Pixel UI Kit.</div><button class="tit" id="toKit"><span style="font-size:24px">👾</span><span>UI Kit</span></button>';$('#toKit').onclick=()=>go('kit')}
  parts.forEach(a=>{const b=document.createElement('button');b.className='tit';const c=document.createElement('canvas'),s=document.createElement('span');uiThumbInto(c,a.data);s.textContent=a.name;b.append(c,s);b.onclick=()=>{auInit();hudPlace(a)};tray.append(b)});
  const sb=$('#stageBtns');sb.innerHTML='<button class="alt" id="sClr">🧹 Clear HUD</button><button class="alt" id="sSave">💾 Save</button><button id="sPlay">▶ Play</button>';
  sb.querySelector('#sClr').onclick=()=>ask('Clear the HUD?','This takes the health bar, slots, panels and nameplate off this level. Your Toy Box stays as it is.','Clear it',()=>{LVL.hud={bar:null,slots:[],plate:null,panels:[]};ST.hsel=null;saveStage();updItemBar();SFX.crumple()});
  sb.querySelector('#sPlay').onclick=()=>{auInit();startPlay()};sb.querySelector('#sSave').onclick=()=>{auInit();SFX.tick();saveLevelAsset()};updItemBar()}
function updHudBar(){const bar=$('#itemBar'),el=ST.hsel,hd=LVL.hud;if(!el||ST.play||!hd){bar.classList.remove('on');bar.innerHTML='';return}bar.classList.add('on');const isP=hd.panels&&hd.panels.includes(el),isPl=hd.plate===el,isB=hd.bar===el;
  bar.innerHTML=(isP?'<button data-a="sm">➖</button><button data-a="bg">➕</button>':'')+(isPl?'<button data-a="nm">✏️ Name</button>':'')+(isB?'<button data-a="hp">❤️ Holds '+(el.part.set.max||10)+'</button>':'')+'<button data-a="rm">🗑️ Remove</button>';
  bar.querySelectorAll('button').forEach(b=>b.onclick=()=>{const a=b.dataset.a,N=UI_GRID;SFX.tick();if(a==='sm'){el.w=Math.max(N,el.w-N/2);el.h=Math.max(N,el.h-N/4)}else if(a==='bg'){el.w=Math.min(N*16,el.w+N/2);el.h=Math.min(N*10,el.h+N/4)}else if(a==='hp'){toast('Change how much it holds at the Pixel UI Kit (Most)');return}
    else if(a==='nm'){dlg('<h2>Name over the hero</h2><input type="text" id="pn" maxlength="14" value="'+esc(el.name)+'" style="text-transform:uppercase"><div class="btns"><button class="alt" id="dNo">Cancel</button><button id="dYes">Save</button></div>',d=>{d.querySelector('#dNo').onclick=closeDlg;d.querySelector('#dYes').onclick=()=>{el.name=pxName(d.querySelector('#pn').value)||el.name;saveStage();closeDlg()}});return}
    else if(a==='rm'){if(isB)hd.bar=null;else if(isPl)hd.plate=null;else if(isP)hd.panels=hd.panels.filter(x=>x!==el);else hd.slots=hd.slots.filter(x=>x!==el);ST.hsel=null;SFX.crumple(5)}saveStage();updItemBar()})}
$('#layW').onclick=()=>{SFX.tick();ST.layer='world';ST.hsel=null;buildStageUI()};
$('#layH').onclick=()=>{SFX.tick();ST.layer='hud';ST.sel=null;ST.arm=null;hudOf();buildStageUI();toast('HUD layer: tap a UI part below to place it')};
$('#mode2d').onclick=()=>{SFX.tick();toast('2D paper mode is on')};
$('#mode3d').onclick=()=>{SFX.tick();if(ST.kind==='level'){toast('Retro 3D is for Little Town, the studio and your house. Levels come later.');return}open3D('town')};/* v1.6c */
/* ---- play: getting hurt and picking things up ---- */
function hurt(fell){const h=ST.hero,dmg=Math.max(1,Math.round(ST.hpMax/5));if(fell){ST.hp-=dmg;SFX.ouch();if(ST.hp<=0){ST.hp=ST.hpMax;toast('Out of health! Back to the start.')}respawn();ST.invT=1;return true}
  if(ST.invT>0)return false;ST.hp=Math.max(0,ST.hp-dmg);ST.invT=1.1;SFX.ouch();h.vy=-520;h.on=false;h.coy=0;h.vx=-h.face*260;
  if(ST.hp<=0){ST.hp=ST.hpMax;toast('Out of health! Back to the start.');respawn();return true}return false}
function invAdd(id){const hd=LVL.hud;if(!hd||!hd.slots||!hd.slots.length)return;let i=ST.inv.findIndex(v=>v&&v.toy===id);if(i<0)i=hd.slots.findIndex((s,j)=>!ST.inv[j]);if(i<0)return;if(!ST.inv[i])ST.inv[i]={toy:id,n:0};ST.inv[i].n++}
/* ---- keep a level in the toy box ---- */
function lvlThumbURL(L){const c=mkCanvas(96,96),x=c._x;x.fillStyle='#bfe3f0';x.fillRect(0,0,96,96);const xr=Math.max(L.goal.x+120,900),sc=96/xr,gy=70;x.fillStyle='#d9bd8a';x.fillRect(0,gy,96,26);x.save();x.translate(0,gy-LV.G*sc);x.scale(sc,sc);for(const it of L.items){const t=toyById(it.toy);if(t&&sprite(t).ready)drawItem(x,it,0,0)}x.restore();x.fillStyle='#d9463e';x.fillRect(L.start.x*sc,gy-12,4,8);x.fillStyle='#f5d142';x.fillRect(L.goal.x*sc-3,gy-14,7,7);return c.toDataURL()}
function saveLevelAsset(){const n=LIB.filter(a=>a.type==='level').length+1;dlg('<h2>Keep this level</h2><p>A copy goes in the Toy Box. You can open it again, share it as a file, or keep building.</p><label class="lb" for="an">Name</label><input type="text" id="an" maxlength="24" value="My level '+n+'"><label class="lb" for="atg">Tags (comma between)</label><input type="text" id="atg" maxlength="80" value="level"><div class="btns"><button class="alt" id="dNo">Not yet</button><button id="dYes">💾 Save</button></div>',d=>{d.querySelector('#dNo').onclick=closeDlg;
  d.querySelector('#dYes').onclick=()=>{const a={id:newAid(),type:'level',name:(d.querySelector('#an').value||'My level '+n).trim().slice(0,24)||'My level',tags:parseTags(d.querySelector('#atg').value),date:Date.now(),data:lvlClean(JSON.parse(JSON.stringify(LVL)))};try{a.thumb=lvlThumbURL(LVL)}catch(e){}LIB.push(a);if(!saveLib()){LIB.pop();toast('Storage is full. Remove something first.');return}closeDlg();SFX.thud();updBadge();toast(a.name+' is in the Toy Box')}})}

/* ---- things behave like what they are: a behavior tag on each town item (it.act) and on each toy (toy.act) ----
   vehicle: drives along road pieces, turns around at road ends, stops for the hero.
   light: switches on at dusk and off at dawn with a soft glow.  door: opens and closes on tap (walk mode).  none: just sits.
   Road pieces are toys with road:1. They lie flat under everything, the hero walks over them, and vehicles follow them. */
const TACT={none:{em:'◻️',name:'Just sits'},vehicle:{em:'🚗',name:'Drives'},light:{em:'💡',name:'Lights up'},door:{em:'🚪',name:'Door'}};
const TACT_TIP={none:'Just sits: it stays where you put it',vehicle:'Drives: it follows road pieces and stops for you',light:'Lights up: it glows at night',door:'Door: tap it in walk mode to open or close it'};
const actOpts=cur=>Object.keys(TACT).map(k=>'<option value="'+k+'"'+(k===(cur||'none')?' selected':'')+'>'+TACT[k].em+' '+TACT[k].name+'</option>').join('');
function isRoad(it){const t=toyById(it.toy);return!!(t&&t.road)}
const LITE=new WeakMap()/* how bright each light is now (not saved) */,VEH=new Map(),CARY=12,CARV=70;
let vehSaveT=0,BLDL=0;
function roadNodes(){const o=[];for(const it of TOWN.items){const t=toyById(it.toy);if(t&&t.road)o.push({it,x:it.x,y:it.y-t.h*it.s/2,r:Math.max(t.w,t.h)*it.s})}return o}
function townActs(dt){const nodes=roadNodes(),hr=TOWN.hero;let moved=false;
  for(const it of TOWN.items){if(it.act!=='vehicle')continue;if(ST.st&&ST.st.it===it){VEH.delete(it);continue}
    let s=VEH.get(it);const P={x:it.x,y:it.y-CARY};
    if(!s){let best=null,bd=170;for(const n of nodes){const d=Math.hypot(n.x-P.x,n.y-P.y);if(d<bd){bd=d;best=n}}if(!best)continue;s={to:best.it,prev:null,stop:0,dx:it.flip<0?-1:1,dy:0};VEH.set(it,s)}
    const to=nodes.find(n=>n.it===s.to);if(!to){VEH.delete(it);continue}
    const dx=to.x-P.x,dy=to.y-P.y,d=Math.hypot(dx,dy);
    if(d<2){const nb=nodes.filter(n=>n!==to&&Math.hypot(n.x-to.x,n.y-to.y)<Math.max(n.r,to.r)*1.22),pv=s.prev&&nodes.find(n=>n.it===s.prev);let cand=nb.filter(n=>n!==pv);
      if(!cand.length)cand=pv?[pv]:[];if(!cand.length)continue;/* a lone road piece: the car parks */
      const al=n=>((n.x-to.x)*s.dx+(n.y-to.y)*s.dy)/(Math.hypot(n.x-to.x,n.y-to.y)||1);cand.sort((a,b)=>al(b)-al(a));s.prev=to.it;s.to=cand[0].it;continue}
    const ux=dx/d,uy=dy/d;s.dx=ux;s.dy=uy;
    /* stop for the hero: someone is standing just ahead of the car */
    const hd=Math.hypot(hr.x-(P.x+ux*46),hr.y-(P.y+uy*46)),hd0=Math.hypot(hr.x-P.x,hr.y-P.y);if(hd<58||hd0<44){s.stop=1;continue}s.stop=0;
    const v=Math.min(d,CARV*dt);it.x+=ux*v;it.y+=uy*v;if(Math.abs(ux)>.3)it.flip=ux>0?1:-1;moved=true}
  if(moved){vehSaveT+=dt;if(vehSaveT>8){vehSaveT=0;LS.set('town',TOWN)}}}
function drawTownItem(it,r,t){if(it.act==='door'&&it.open){g.fillStyle='rgba(30,20,12,.55)';g.fillRect(r.x+r.w*.08,r.y+r.h*.06,r.w*.84,r.h*.94);g.save();g.translate(r.x,0);g.scale(.24,1);g.translate(-r.x,0);drawItem(g,it,t,0);g.restore();return}drawItem(g,it,t,ST.walk?1:.35);townFx(it,r,t)}
function glow(x,y,rad,k){const gr=g.createRadialGradient(x,y,0,x,y,rad);gr.addColorStop(0,'rgba(255,228,150,'+(.6*k).toFixed(3)+')');gr.addColorStop(.3,'rgba(255,200,110,'+(.26*k).toFixed(3)+')');gr.addColorStop(1,'rgba(255,190,90,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,rad,0,TAU);g.fill()}
/* night tint over Little Town, then the lights on top */
function townNight(){const t=nightK(),tc=tintRGBA(),on=t>.35,k=Math.min(1,DT*1.6);if(tc){g.fillStyle=tc;g.fillRect(ST.cam.x-30,ST.cam.y-30,W/ST.z+60,H/ST.z+60)}
  BLDL+=((on?1:0)-BLDL)*k;g.save();g.globalCompositeOperation='lighter';
  for(const it of TOWN.items){if(it.act!=='light')continue;const l=(LITE.get(it)||0)+((on?1:0)-(LITE.get(it)||0))*k;LITE.set(it,l);if(l<.02)continue;const r=itemRect(it);if(!r)continue;const ly=r.y+r.h*.12,rad=Math.max(70,r.w*1.8)*(.95+.05*Math.sin(NOW/310+it.x));glow(it.x,ly,rad,l);g.fillStyle='rgba(255,246,210,'+(.9*l).toFixed(3)+')';g.beginPath();g.arc(it.x,ly,Math.max(4,r.w*.12),0,TAU);g.fill()}
  if(BLDL>.02){const hp=TOWN.house,sp=TOWN.studio;[[hp.x-35,hp.y-48],[hp.x+27,hp.y-40],[sp.x-61,sp.y-75],[sp.x+61,sp.y-75]].forEach(p=>glow(p[0],p[1],48,BLDL*.85));if(TOWN.supply){const q=TOWN.supply;glow(q.x-33,q.y-50,52,BLDL*.85)}}
  g.restore()}
function drawWinSky(x,y,r){const t=nightK();if(t>.55){g.fillStyle='rgba(243,239,216,'+Math.min(1,(t-.55)*3)+')';g.beginPath();g.arc(x+r*.35,y-r*.3,r*.2,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.8)';[[-.4,-.2],[-.1,.35],[.45,.3]].forEach(s=>g.fillRect(x+s[0]*r,y+s[1]*r,2,2))}}

/* ---- the showcase town: made only of make-your-own style pieces (all drawn in code, like the starters) ----
   Only a brand-new save gets it. A town a player already has is never changed. Build mode has a "Showcase" button that resets to it (with a backup). */
function mkShowToys(){const mk=(key,name,w,h,o,fn)=>{const c=mkCanvas(w,h);fn(c._x,w,h);return Object.assign({id:'show_'+key,name,w,h,beh:'scenery',act:'none',starter:true,show:1,parts:[{src:c.toDataURL(),x:0,y:0,w,h,parent:-1,px:0,py:0,z:0}]},o)};
  const road=(x,w,h,dash)=>{x.fillStyle='#c9a46a';x.fillRect(0,0,w,h);x.fillStyle='#6d6762';x.fillRect(4,4,w-8,h-8);x.fillStyle='rgba(255,255,255,.07)';for(let i=0;i<14;i++)x.fillRect((i*37)%w,(i*53)%h,9,3);x.fillStyle='#f6e7a6';if(dash==='h')for(let i=6;i<w;i+=26)x.fillRect(i,h/2-3,14,6);else if(dash==='v')for(let i=6;i<h;i+=26)x.fillRect(w/2-3,i,6,14);else{x.strokeStyle='#f6e7a6';x.lineWidth=4;x.setLineDash([8,8]);x.strokeRect(22,22,w-44,h-44);x.setLineDash([])}};
  const car=(x,w,h,body,roof)=>{x.fillStyle=body;x.beginPath();x.moveTo(6,h-16);x.lineTo(6,26);x.quadraticCurveTo(8,20,16,20);x.lineTo(26,20);x.lineTo(36,4);x.lineTo(66,4);x.lineTo(78,20);x.lineTo(w-8,22);x.quadraticCurveTo(w-2,24,w-2,32);x.lineTo(w-2,h-16);x.closePath();x.fill();x.strokeStyle='rgba(0,0,0,.25)';x.lineWidth=2;x.stroke();
    x.fillStyle=roof;x.beginPath();x.moveTo(30,20);x.lineTo(39,8);x.lineTo(50,8);x.lineTo(50,20);x.closePath();x.fill();x.beginPath();x.moveTo(54,20);x.lineTo(54,8);x.lineTo(64,8);x.lineTo(73,20);x.closePath();x.fill();
    x.fillStyle='#f5d142';x.fillRect(w-8,26,6,7);x.fillStyle='#d9463e';x.fillRect(6,26,5,7);x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=2;x.setLineDash([4,4]);x.beginPath();x.moveTo(12,h-22);x.lineTo(w-10,h-22);x.stroke();x.setLineDash([]);
    [24,w-24].forEach(cx=>{x.fillStyle='#2e2a2a';x.beginPath();x.arc(cx,h-14,12,0,TAU);x.fill();x.fillStyle='#d5d2c8';x.beginPath();x.arc(cx,h-14,5,0,TAU);x.fill()})};
  return[
    mk('road','Road',100,100,{road:1},(x,w,h)=>road(x,w,h,'h')),
    mk('roadup','Road (up)',100,100,{road:1},(x,w,h)=>road(x,w,h,'v')),
    mk('roadx','Road corner',100,100,{road:1},(x,w,h)=>road(x,w,h,'x')),
    mk('car1','Red paper car',100,56,{act:'vehicle'},(x,w,h)=>car(x,w,h,'#d9463e','#bfe3f0')),
    mk('car2','Blue box car',100,56,{act:'vehicle'},(x,w,h)=>{car(x,w,h,'#4f8fdc','#fbf6ea');x.strokeStyle='rgba(125,82,51,.35)';x.lineWidth=1.5;for(let i=14;i<w-10;i+=10){x.beginPath();x.moveTo(i,24);x.lineTo(i,h-26);x.stroke()}}),
    mk('lamp','Street light',40,150,{act:'light',beh:'solid'},(x,w,h)=>{x.fillStyle='#4a5a52';x.fillRect(17,22,6,h-30);x.fillStyle='#3a463f';x.fillRect(9,h-10,22,10);x.beginPath();x.moveTo(6,22);x.lineTo(34,22);x.lineTo(28,8);x.lineTo(12,8);x.closePath();x.fill();x.fillStyle='#fbf3cf';x.beginPath();x.arc(20,23,7,0,Math.PI);x.fill();x.fillStyle='#d9463e';x.fillRect(16,2,8,6)}),
    mk('tree','Paper tree',110,150,{beh:'solid'},(x,w,h)=>{x.fillStyle='#8b5a3c';x.fillRect(48,80,16,h-80);x.fillStyle='#63b35d';[[55,50,40],[30,66,28],[80,66,28],[55,26,26]].forEach(c=>{x.beginPath();x.arc(c[0],c[1],c[2],0,TAU);x.fill()});x.fillStyle='rgba(255,255,255,.22)';[[40,40],[70,54],[52,70],[30,62]].forEach(p=>{x.beginPath();x.arc(p[0],p[1],5,0,TAU);x.fill()});x.fillStyle='#d9463e';[[44,52],[72,40],[62,78]].forEach(p=>{x.beginPath();x.arc(p[0],p[1],4,0,TAU);x.fill()})}),
    mk('bench','Park bench',110,60,{beh:'solid'},(x,w,h)=>{x.fillStyle='#6b4a34';x.fillRect(12,30,6,h-30);x.fillRect(w-18,30,6,h-30);x.fillStyle='#c98e55';x.fillRect(4,4,w-8,10);x.fillRect(4,18,w-8,10);x.fillRect(2,32,w-4,9);x.strokeStyle='rgba(0,0,0,.2)';x.lineWidth=1.5;x.strokeRect(4,4,w-8,10);x.strokeRect(4,18,w-8,10)}),
    mk('flowers','Flower bed',120,50,{tb:'pass'},(x,w,h)=>{x.fillStyle='#8b5a3c';x.beginPath();x.ellipse(w/2,h-12,w/2-2,12,0,0,TAU);x.fill();x.fillStyle='#4f9a4a';for(let i=0;i<9;i++){x.fillRect(12+i*12,14,3,h-26)}['#f191b3','#f5d142','#fbf6ea','#8b5cb6','#f08a2e'].forEach((k,i)=>{for(let j=0;j<2;j++){x.fillStyle=k;x.beginPath();x.arc(14+i*22+j*11,12+((i+j)%2)*6,6,0,TAU);x.fill()}})}),
    mk('sign','Town sign',190,110,{beh:'solid'},(x,w,h)=>{x.fillStyle='#8b5a3c';x.fillRect(w/2-5,60,10,h-60);x.save();x.translate(w/2,36);x.rotate(-.03);x.fillStyle='#fbf6ea';rr(x,-88,-32,176,64,6);x.fill();x.strokeStyle='#d9463e';x.lineWidth=4;x.stroke();x.fillStyle='#3b2f2a';x.textAlign='center';x.textBaseline='middle';x.font='800 15px ui-rounded,system-ui,sans-serif';x.fillText('Made in',0,-12);x.font='900 18px ui-rounded,system-ui,sans-serif';x.fillText('Shoebox Studio',0,12);x.restore();x.fillStyle='rgba(250,240,190,.9)';x.fillRect(10,2,30,10);x.fillRect(w-40,2,30,10)}),
    mk('gate','Garden gate',90,80,{act:'door',beh:'solid'},(x,w,h)=>{x.fillStyle='#fbf6ea';for(let i=0;i<5;i++){x.beginPath();x.moveTo(6+i*17,h);x.lineTo(6+i*17,14);x.lineTo(14+i*17,4);x.lineTo(22+i*17,14);x.lineTo(22+i*17,h);x.closePath();x.fill()}x.fillStyle='#e3cfa4';x.fillRect(2,26,w-4,8);x.fillRect(2,h-22,w-4,8);x.fillStyle='#f5d142';x.beginPath();x.arc(w-14,h/2,4,0,TAU);x.fill()})]}
function ensureShowToys(){let add=false;mkShowToys().forEach(t=>{if(!toyById(t.id)){TOYS.push(t);add=true}});if(add)saveToys()}
function mkShowTown(){const items=[],put=(k,x,y,o)=>{const t=toyById('show_'+k);items.push(Object.assign({toy:'show_'+k,x,y,s:1,flip:1,beh:t?t.beh:'scenery',act:t&&t.act||'none',tb:t&&(t.road||t.act==='vehicle')?'pass':t&&t.tb||'block'},o))};
  for(let x=300;x<=1300;x+=100){const k=x===300||x===1300?'roadx':'road';put(k,x,670);put(k,x,970)}[300,1300].forEach(x=>{put('roadup',x,770);put('roadup',x,870)});
  put('tree',430,820);put('tree',1170,820);put('bench',620,780);put('flowers',620,862);put('flowers',960,775);put('gate',1040,870);put('sign',800,862);
  [[420,560],[1180,560],[420,1062],[1180,1062]].forEach(p=>put('lamp',p[0],p[1]));
  put('car1',500,632);put('car2',1100,932,{flip:-1});/* 12 = CARY: a car's wheels sit 12 px below the middle of the road */
  cpShowItems(items);/* T034 */
  return{items,hero:{x:780,y:545},house:{x:930,y:500},studio:{x:600,y:470},show:1}}
function resetShowTown(){ask('Reset to showcase town?','Little Town goes back to the showcase town: a road loop with two cars, street lights, a park and a sign. Your town now is kept as a backup. Your toy box stays as it is.','Reset town',()=>{ensureShowToys();LS.set('town_backup',{date:Date.now(),town:TOWN});const T=mkShowTown();ensureBlds(T);TOWN=T;ST.d=T;VEH.clear();ST.sel=null;ST.arm=null;LS.set('town',TOWN);libSync();buildStageUI();ST.cam.x=TOWN.hero.x-W/2/ST.z;ST.cam.y=TOWN.hero.y-H*.42/ST.z;clampCam();SFX.win();toast('Showcase town is back. Your old town is saved as a backup.')})}

/* ---- level music: Make a Level can play a music asset while you play the level (LVL.music = {aid, name, song}) ---- */
function levelMusicDlg(){const L=musicList(),cur=LVL.music&&LVL.music.aid;dlg('<h2>🎵 Level music</h2><p>'+(L.length?'Pick the song that plays while you play this level.':'No music yet. Make a song on the console in your house, then tap Save to Studio.')+'</p><button class="les" data-lm=""><span>'+(cur?'':'✅ ')+'🔇 No music</span><i>▶</i></button>'+L.map(a=>'<button class="les" data-lm="'+esc(a.id)+'"><span>'+(cur===a.id?'✅ ':'')+'🎵 '+esc(a.name)+'<small>about '+songSecs(a.data)+' seconds</small></span><i>▶</i></button>').join('')+'<div class="btns"><button class="alt" id="dNo">Close</button></div>',d=>{
  d.querySelectorAll('[data-lm]').forEach(b=>b.onclick=()=>{const a=LIB.find(x=>x.id===b.dataset.lm);if(a)LVL.music={aid:a.id,name:a.name,song:JSON.parse(JSON.stringify(a.data))};else delete LVL.music;LS.set('level',LVL);SFX.tick();closeDlg();updMusBtn();toast(a?a.name+' plays in this level':'This level has no music')});d.querySelector('#dNo').onclick=()=>{songStop();closeDlg()}})}
function updMusBtn(){const b=$('#sMus');if(b)b.classList.toggle('alt',!LVL.music)}
/* ---- Handy Notebook: a quick sketch pad you can use while walking around Little Town ---- */
const NB=Object.assign({pages:[],i:0},LS.get('notebook',{}));
const NBW=720,NBH=480;
let NBC=null,NBundo=[],NBst=null,NBsaveT=0;
function nbPage(){if(!NB.pages.length)NB.pages.push({src:'',med:{m:[]}});NB.i=clamp(NB.i,0,NB.pages.length-1);return NB.pages[NB.i]}
function nbSave(){const pg=nbPage();pg.src=nbBlank()?'':NBC.toDataURL();if(!LS.set('notebook',NB))toast('The notebook is full. Make stickers and clear some pages.')}
function nbBlank(){const d=NBC._x.getImageData(0,0,NBW,NBH).data;for(let i=3;i<d.length;i+=16)if(d[i])return false;return true}
function nbLoad(){const x=NBC._x;x.clearRect(0,0,NBW,NBH);NBundo=[];const pg=nbPage();if(pg.src){const im=new Image();im.onload=()=>x.drawImage(im,0,0);im.src=pg.src}nbUI()}
function nbUI(){const s=$('#nb');if(!s)return;s.querySelector('#nbPg').textContent='Page '+(NB.i+1)+' of '+NB.pages.length;s.querySelectorAll('[data-nm]').forEach(b=>b.classList.toggle('on',b.dataset.nm===AB.med));s.querySelectorAll('[data-nc]').forEach(b=>b.classList.toggle('on',b.dataset.nc===AB.col));s.querySelector('#nbMed').textContent=MEDIA[AB.med].name}
function nbOpen(){auInit();let s=$('#nb');if(!s){s=document.createElement('div');s.id='nb';s.innerHTML='<div id="nbBar"><b>📓 <span class="nbT">Handy Notebook</span></b><span id="nbPg"></span><button id="nbPrev" aria-label="Page before">◀</button><button id="nbNext" aria-label="Next page">▶</button><button id="nbNew">＋ Quick sketch</button><button id="nbX" aria-label="Close the notebook">✕</button></div><div id="nbPaper"><canvas id="nbCv" width="'+NBW+'" height="'+NBH+'"></canvas></div><div id="nbTools"><div id="nbMeds">'+Object.keys(MEDIA).map(m=>'<button data-nm="'+m+'" title="'+MEDIA[m].name+'">'+MEDIA[m].em+'</button>').join('')+'</div><div id="nbCols">'+MCOLS.map(c=>'<button data-nc="'+c+'" style="background:'+c+'" aria-label="colour"></button>').join('')+'</div></div><div id="nbAct"><span id="nbMed"></span><button id="nbUndo">↩ Undo</button><button id="nbClr">🧽 Clear</button><button id="nbStk">🏷️ Make a sticker</button></div>';document.body.append(s);
    const cv2=s.querySelector('#nbCv');NBC=cv2;cv2._x=cv2.getContext('2d',{willReadFrequently:true});
    const at=e=>{const r=cv2.getBoundingClientRect();return{x:(e.clientX-r.left)*NBW/r.width,y:(e.clientY-r.top)*NBH/r.height}};
    cv2.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();try{cv2.setPointerCapture(e.pointerId)}catch(_){}NBundo.push(cv2._x.getImageData(0,0,NBW,NBH));if(NBundo.length>12)NBundo.shift();const q=at(e);NBst={last:q};medSeg(cv2._x,AB.med,AB.col,[q],1.5);medNote(nbPage().med,AB.med,AB.col);try{SFX.tick()}catch(_){}});
    cv2.addEventListener('pointermove',e=>{if(!NBst)return;e.preventDefault();const q=at(e);if(dist(q,NBst.last)<2)return;medSeg(cv2._x,AB.med,AB.col,[NBst.last,q],1.5);NBst.last=q});
    const up=()=>{if(!NBst)return;NBst=null;clearTimeout(NBsaveT);NBsaveT=setTimeout(nbSave,400)};cv2.addEventListener('pointerup',up);cv2.addEventListener('pointercancel',up);
    s.querySelectorAll('[data-nm]').forEach(b=>b.onclick=()=>{AB.med=b.dataset.nm;saveAB();SFX.tick();nbUI();toast(MEDIA[AB.med].name)});
    s.querySelectorAll('[data-nc]').forEach(b=>b.onclick=()=>{AB.col=b.dataset.nc;saveAB();SFX.tick();nbUI()});
    s.querySelector('#nbX').onclick=nbClose;
    s.querySelector('#nbPrev').onclick=()=>{nbSave();NB.i=Math.max(0,NB.i-1);SFX.rustle&&SFX.rustle();nbLoad()};
    s.querySelector('#nbNext').onclick=()=>{nbSave();NB.i=Math.min(NB.pages.length-1,NB.i+1);SFX.rustle&&SFX.rustle();nbLoad()};
    s.querySelector('#nbNew').onclick=()=>{nbSave();if(NB.pages.length>=24){toast('The notebook has 24 pages. Clear one to draw more.');return}const blank=NB.pages.findIndex(p=>!p.src);if(blank>=0&&blank===NB.i){toast('This page is still empty');return}NB.pages.push({src:'',med:{m:[]}});NB.i=NB.pages.length-1;SFX.rustle&&SFX.rustle();nbLoad()};
    s.querySelector('#nbUndo').onclick=()=>{const u=NBundo.pop();if(u){NBC._x.putImageData(u,0,0);nbSave();SFX.tick()}};
    s.querySelector('#nbClr').onclick=()=>{if(nbBlank())return;NBundo.push(NBC._x.getImageData(0,0,NBW,NBH));NBC._x.clearRect(0,0,NBW,NBH);nbPage().med={m:[]};nbSave();SFX.crumple()};
    s.querySelector('#nbStk').onclick=nbSticker}
  s.classList.add('on');nbLoad();try{SFX.rustle()}catch(e){}}
function nbClose(){const s=$('#nb');if(!s||!s.classList.contains('on'))return;nbSave();s.classList.remove('on');try{SFX.tick()}catch(e){}}
/* the drawing, cut out with a white sticker edge, goes into the Toy Box as a sticker */
function nbSticker(){if(nbBlank()){toast('Draw something first');return}const d=NBC._x.getImageData(0,0,NBW,NBH).data;let x0=NBW,y0=NBH,x1=0,y1=0;for(let y=0;y<NBH;y++)for(let x=0;x<NBW;x++)if(d[(y*NBW+x)*4+3]>8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  const B=10,w=x1-x0+1,h=y1-y0+1,sc=Math.min(1,320/Math.max(w,h)),cw=Math.round(w*sc)+B*2,ch=Math.round(h*sc)+B*2,ink=mkCanvas(cw,ch),ix=ink._x;ix.drawImage(NBC,x0,y0,w,h,B,B,cw-B*2,ch-B*2);
  const c=mkCanvas(cw,ch),x=c._x;for(let a=0;a<16;a++){x.drawImage(ink,Math.cos(a/16*TAU)*7,Math.sin(a/16*TAU)*7)}x.globalCompositeOperation='source-in';x.fillStyle='#fff';x.fillRect(0,0,cw,ch);x.globalCompositeOperation='source-over';x.drawImage(ink,0,0);
  const n=TOYS.filter(t=>/^Sketch /.test(t.name)).length+1,toy={id:'t'+Date.now().toString(36),name:'Sketch '+n,w:cw,h:ch,beh:'scenery',act:'none',med:medCopy(nbPage().med),parts:[{src:c.toDataURL(),x:0,y:0,w:cw,h:ch,parent:-1,px:0,py:0,z:0}]};
  dlg('<h2>🏷️ Make a sticker</h2><canvas class="pv" id="pv"></canvas><label class="lb" for="nbN">Name</label><input type="text" id="nbN" maxlength="24" value="'+esc(toy.name)+'"><p style="font-size:12px;margin:4px 0 0">'+esc(medLabel(toy.med))+'</p><div class="btns"><button class="alt" id="dNo">Cancel</button><button id="dYes">Into the toy box</button></div>',dd=>{thumb(dd.querySelector('#pv'),toy);dd.querySelector('#dNo').onclick=()=>{delete SPR[toy.id];closeDlg()};
    dd.querySelector('#dYes').onclick=()=>{toy.name=(dd.querySelector('#nbN').value||toy.name).trim().slice(0,24)||toy.name;TOYS.push(toy);if(!saveToys()){TOYS.pop();toast('The toy box is full. Remove a toy first.');return}libAddToy(toy,'sticker');closeDlg();updBadge();if(SCR==='town'||SCR==='level')buildStageUI();SFX.thud();toast(toy.name+' is in the toy box')}})}
