'use strict';
/* Shoebox Studio: stations.js — the studio, house and shop rooms (STATIONS, HOUSE, STATION_DRAW), pixel UI kit, Toy Box library, projector, VHS, console save, 3D hooks, start-up and Art Swap. Loaded last. */

/* ================= THE SHOEBOX STUDIO LOBBY (walk-around menu) ================= */
/* To add a station later: add one line to STATIONS and one draw function to STATION_DRAW.
   A station does one of: go:'screen' (switch screen), act:()=>... (run something, like openTool), or soon:1 (coming soon).
   The same walk-around code runs every room. RM is the room you are in: LOB (the studio) or HOUSE (the house in Little Town). */
const LOB={key:'lobby',W:900,H:790,vw:600,cam:{x:0,y:0},z:1,hero:LS.get('lobby',null)||{x:450,y:500},tgt:null,pend:null,face:1,ph:0,near:null};
const STATIONS=[
  {id:'studio',name:'Art Studio',x:120,y:210,wall:1,soon:1},
  {id:'cork',name:'Cork Board',x:270,y:210,wall:1,soon:1},
  {id:'board',name:'Art Class',sub:'Learn step by step',x:450,y:210,wall:1,go:'class',verb:'Go to Art Class'},
  {id:'door',name:'Little Town',sub:'Door',x:770,y:210,wall:1,act:()=>leaveHouse('studio'),verb:'Go out to Little Town'},
  {id:'desk',name:'School Desk',sub:'Craft',x:210,y:400,go:'craft',verb:'Sit at the School Desk'},
  {id:'chest',name:'Toy Chest',sub:'Levels and Toy Box',x:690,y:420,act:()=>chestMenu(),verb:'Open the Toy Chest'},
  {id:'kit',name:'Pixel UI Kit',sub:'Game-kit pegboard',x:620,y:610,go:'kit',verb:'Use the Pixel UI Kit',tagY:-150},
  {id:'shelf',name:'Bookshelf',sub:'Story Shelf',x:822,y:530,h:172,act:()=>openTool('shelf'),verb:'Open Story Shelf',tagY:-194},
  {id:'proj',name:'Projector',sub:'Flipbooks',x:110,y:545,act:()=>projMenu(),verb:'Use the projector',tagY:-96},
  {id:'vhs',name:'VHS Shelf',sub:'Tapes and player',x:232,y:590,act:()=>vhsMenu(),verb:'Use the VHS shelf',tagY:-112},/* T020 */
  {id:'pets',name:'Pet Basket',sub:'Pick a companion',x:300,y:715,act:()=>petMenu(),verb:'Pick a companion',tagY:-62},
  {id:'fridge',name:'Fridge Gallery',sub:'Example wall',x:110,y:690,act:()=>fridgeOpen(),verb:'Look at the fridge'},/* T021 */
  {id:'artswap',name:'Art Swap',sub:'Use your own art',x:635,y:742,act:()=>artSwapOpen(),verb:'Open the Art Swap board',tagY:-112},/* T022 (Q041: its own station) */
  {id:'mirror',name:'Dress-up Mirror',x:800,y:728,soon:1}];
LOB.stn=STATIONS;
/* ---- the house (a small room you enter from Little Town). Add things to it the same way: one line here, one draw function. ---- */
const HOUSE={key:'househero',W:560,H:600,fit:1,cam:{x:0,y:0},z:1,hero:{x:460,y:262},tgt:null,pend:null,face:1,ph:0,near:null,stn:[
  {id:'hdoor',name:'Front Door',sub:'Back to Little Town',x:460,y:210,wall:1,act:()=>leaveHouse('house'),verb:'Go out to Little Town'},
  {id:'deco',name:'Display Shelf',x:290,y:210,wall:1,soon:1,tagY:-150},
  {id:'tv',name:'Game Console',sub:'Beat Bop Doodle',x:140,y:340,act:()=>openTool('bbd'),verb:'Play Beat Bop Doodle',tagY:-182},
  {id:'beds',name:'Pet Beds',x:150,y:548,soon:1,tagY:-50}]};
/* ---- T032: SHOPS. Every shop is a building in Little Town (BLD, drawTown*) with a small room inside (mkShopRoom).
   To add a shop (T027): one line in BLD, one draw function for its building, one entry here with its room stations. ---- */
let SHOP_ID='supply';
function mkShopRoom(id,stn){return{key:'shophero_'+id,shop:id,W:560,H:600,fit:1,cam:{x:0,y:0},z:1,hero:{x:280,y:300},tgt:null,pend:null,face:1,ph:0,near:null,stn}}
const SHOPS={supply:{id:'supply',name:'Supply Store',room:mkShopRoom('supply',[
  {id:'sdoor',out:'supply',name:'Shop Door',sub:'Back to Little Town',x:460,y:210,wall:1,act:()=>leaveHouse('supply'),verb:'Go out to Little Town'},
  Object.assign({id:'sshelf',name:'Supply Shelves',x:128,y:210,wall:1,tagY:-196},cpStockOpt('supply','Look at the shelves')),/* T034: pack shop stock shows here; coming soon without it */
  {id:'shop',name:'Supply Counter',sub:'Buy art supplies',x:280,y:470,soon:1,tagY:-150}])}};
cpAddShops();/* T034 */
const shopRoom=()=>(SHOPS[SHOP_ID]||SHOPS.supply).room;
const isRoomScr=x=>x==='home'||x==='house'||x==='shop';
let RM=LOB;
const standPt=s=>({x:s.x,y:s.wall?s.y+38:s.y+34});
const STATION_DRAW={
  /* The Bookshelf opens Story Shelf. BOOK NOOKS: the two dotted gaps (middle shelf and bottom shelf) are left empty on purpose.
     They are the spots for book nooks, the tiny dioramas you will make later and slide in between the books. Draw them there. */
  shelf(c){c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(0,4,74,12,0,0,TAU);c.fill();c.fillStyle='#8b5a3c';rr(c,-64,-168,128,170,7);c.fill();c.strokeStyle='#6b4a34';c.lineWidth=3;c.stroke();c.fillStyle='#5c3d2a';c.fillRect(-55,-159,110,152);
    const bk=(x,b,w,h,col,tilt)=>{c.save();c.translate(x,b);if(tilt)c.rotate(tilt);c.fillStyle=col;c.fillRect(0,-h,w,h);c.fillStyle='rgba(255,255,255,.55)';c.fillRect(1.5,-h+5,w-3,2.5);c.fillStyle='rgba(0,0,0,.16)';c.fillRect(w-1.5,-h,1.5,h);c.restore()},
      nook=(x,b,w,h)=>{c.fillStyle='rgba(0,0,0,.22)';c.fillRect(x,b-h,w,h);c.strokeStyle='rgba(251,246,234,.7)';c.lineWidth=1.6;c.setLineDash([4,4]);c.strokeRect(x+2,b-h+2,w-4,h-4);c.setLineDash([]);c.fillStyle='rgba(251,246,234,.75)';c.fillRect(x+w/2-5,b-h/2-1,10,2);c.fillRect(x+w/2-1,b-h/2-5,2,10)};
    [[-53,10,38,'#d9463e'],[-42,8,33,'#f5d142'],[-33,12,41,'#3767bb'],[-20,9,36,'#63b35d'],[-10,11,30,'#f191b3'],[2,8,39,'#f08a2e'],[11,10,34,'#8b5cb6'],[22,9,37,'#62b6e8']].forEach(b=>bk(b[0],-112,b[1],b[2],b[3]));bk(36,-112,9,34,'#f6f2e9',.22);
    [[-53,9,34,'#62b6e8'],[-43,11,38,'#d9463e'],[-31,8,30,'#f5d142']].forEach(b=>bk(b[0],-62,b[1],b[2],b[3]));nook(-20,-62,42,40);[[25,9,36,'#2f7d4f'],[35,8,31,'#f191b3'],[44,9,38,'#f08a2e']].forEach(b=>bk(b[0],-62,b[1],b[2],b[3]));
    nook(-53,-12,46,40);[[-4,10,36,'#8b5cb6'],[7,9,31,'#63b35d'],[17,11,38,'#3767bb'],[29,8,33,'#f5d142']].forEach(b=>bk(b[0],-12,b[1],b[2],b[3]));bk(42,-12,9,32,'#d9463e',.2);
    c.fillStyle='#a8703f';[-112,-62,-12].forEach(y=>c.fillRect(-58,y,116,6));c.fillStyle='#a8703f';rr(c,-68,-174,136,10,4);c.fill();c.strokeStyle='#6b4a34';c.lineWidth=2;c.stroke()},
  /* T020: the VHS spot. A cardboard shelf with the saved tapes as spines, and a tape player on top (a tape sticks out while one is in it). */
  vhs(c){c.save();c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(0,4,50,10,0,0,TAU);c.fill();c.fillStyle='#c98e55';rr(c,-44,-62,88,64,4);c.fill();c.strokeStyle='#7d5233';c.lineWidth=2;c.stroke();c.fillStyle='#8b5a34';c.fillRect(-38,-56,76,24);c.fillRect(-38,-28,76,24);
    const L=tapeList();for(let k=0;k<Math.min(16,L.length);k++){const r=Math.floor(k/8),i=k%8,x0=-37+i*9.4,y0=r?-27:-55,lb=L[k].data.label,P=lb&&!lb.toy?TAPE_LABELS[lb.p||0]:null;c.fillStyle='#24201e';c.fillRect(x0,y0,8.4,22);c.fillStyle=P?P.bg:'#fbf6ea';c.fillRect(x0+1.6,y0+4,5.2,14);if(P&&P.line){c.fillStyle=P.line;c.fillRect(x0+1.6,y0+14,5.2,1.5)}}
    if(!L.length){c.strokeStyle='rgba(251,246,234,.65)';c.lineWidth=1.4;c.setLineDash([3,3]);c.strokeRect(-35,-53,26,18);c.setLineDash([])}
    c.fillStyle='#4a4440';rr(c,-40,-88,80,26,4);c.fill();c.strokeStyle='#2b2422';c.lineWidth=2;c.stroke();c.fillStyle='#1d1a18';c.fillRect(-32,-80,40,5);if(VHS.in){c.fillStyle='#24201e';c.fillRect(-28,-85,36,6);c.fillStyle='#f1e3bd';c.fillRect(-22,-84,24,3)}
    c.fillStyle='#132a14';c.fillRect(14,-82,20,10);c.fillStyle='#7dff8a';c.fillRect(17,-78,3,2);c.fillRect(22,-78,3,2);c.fillRect(27,-78,3,2);c.fillStyle='#ff9a3c';c.beginPath();c.arc(-34,-68,2,0,TAU);c.fill();c.restore()},
  /* v1.6a: the projector, a small cardboard box with two film reels. It plays flipbooks on the pull-down screen. */
  proj(c){c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(0,4,46,10,0,0,TAU);c.fill();c.fillStyle='#6b4a34';c.fillRect(-30,-14,5,16);c.fillRect(25,-14,5,16);c.fillStyle='#c98e55';rr(c,-38,-50,76,38,5);c.fill();c.strokeStyle='#7d5233';c.lineWidth=2.5;c.stroke();c.strokeStyle='rgba(125,82,51,.3)';c.lineWidth=1.2;c.beginPath();for(let x=-30;x<36;x+=9){c.moveTo(x,-47);c.lineTo(x,-15)}c.stroke();
    c.fillStyle='#3b2f2a';c.beginPath();c.arc(38,-31,9,0,TAU);c.fill();c.fillStyle='#fff7d6';c.beginPath();c.arc(39,-31,4.5,0,TAU);c.fill();
    [-17,15].forEach((x,i)=>{c.save();c.translate(x,-64);c.rotate(NOW/(i?700:900));c.fillStyle='#3a3f4b';c.beginPath();c.arc(0,0,15,0,TAU);c.fill();c.fillStyle='#d5d2c8';for(let k=0;k<5;k++){const a=k*TAU/5;c.beginPath();c.arc(Math.cos(a)*8,Math.sin(a)*8,3,0,TAU);c.fill()}c.restore()});c.strokeStyle='#3a3f4b';c.lineWidth=2;c.beginPath();c.moveTo(-17,-50);c.lineTo(-30,-64);c.moveTo(15,-50);c.lineTo(28,-64);c.stroke()},
  /* ---- house things ---- */
  hdoor(c){STATION_DRAW.door(c)},
  /* T032: the Supply Store's own door (the studio door with an OPEN card and a bell) and its wall shelves */
  sdoor(c){STATION_DRAW.door(c);c.fillStyle='#fbf6ea';c.fillRect(-20,-118,40,16);c.strokeStyle='#8b5a3c';c.lineWidth=1.5;c.strokeRect(-20,-118,40,16);c.fillStyle='#2d8a57';c.font='900 10px system-ui';c.textAlign='center';c.fillText('OPEN',0,-106);c.fillStyle='#f5d142';c.beginPath();c.arc(30,-150,7,Math.PI,TAU);c.lineTo(37,-146);c.lineTo(23,-146);c.fill()},
  sshelf(c){c.fillStyle='#a8703f';[-150,-104,-58].forEach(y=>{rr(c,-88,y,176,8,3);c.fill()});c.fillStyle='#8b5a3c';c.fillRect(-86,-170,6,120);c.fillRect(80,-170,6,120);
    const K=['#e8443a','#f28a2e','#f7d23e','#5bbf5a','#4fb3e8','#3767bb','#8b5cb6','#f38bb3'];
    K.forEach((k,i)=>{c.fillStyle=k;c.fillRect(-78+i*9,-174,7,24);c.beginPath();c.moveTo(-78+i*9,-174);c.lineTo(-74.5+i*9,-181);c.lineTo(-71+i*9,-174);c.fill()});
    c.fillStyle='#fbf6ea';rr(c,10,-176,30,26,3);c.fill();c.fillStyle='#d6a868';rr(c,46,-172,30,22,3);c.fill();
    ['#f191b3','#62b6e8','#f5d142','#63b35d','#fbf6ea'].forEach((k,i)=>{c.fillStyle=k;c.beginPath();c.ellipse(-70+i*16,-114,7,10,0,0,TAU);c.fill()});
    ['#e8443a','#4fb3e8','#f7d23e'].forEach((k,i)=>{c.fillStyle='#fbf6ea';rr(c,14+i*24,-126,18,22,3);c.fill();c.fillStyle=k;c.fillRect(14+i*24,-122,18,6)});
    ['#d9463e','#3767bb','#5bbf5a','#f28a2e'].forEach((k,i)=>{c.fillStyle=k;c.beginPath();c.arc(-66+i*20,-70,8,0,TAU);c.fill();c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.arc(-66+i*20,-70,2,0,TAU);c.fill()});
    c.fillStyle='#caa76c';rr(c,16,-82,64,22,3);c.fill();c.fillStyle='#8b5a3c';c.font='800 9px system-ui';c.textAlign='center';c.fillText('PAPER',48,-68)},
  /* The console by the TV opens the in-game copy of Beat Bop Doodle. */
  tv(c){c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(0,6,84,14,0,0,TAU);c.fill();
    c.fillStyle='#8b5a3c';c.fillRect(-66,-66,8,40);c.fillRect(58,-66,8,40);c.fillStyle='#b98552';rr(c,-74,-80,148,40,6);c.fill();c.strokeStyle='#6b4a34';c.lineWidth=3;c.stroke();c.fillStyle='#6b4a34';c.fillRect(-58,-62,50,6);c.fillRect(8,-62,50,6);
    c.fillStyle='#6b6f7a';c.beginPath();c.moveTo(-12,-132);c.lineTo(-30,-158);c.moveTo(12,-132);c.lineTo(26,-160);c.strokeStyle='#6b6f7a';c.lineWidth=3;c.stroke();
    c.fillStyle='#caa76c';rr(c,-52,-136,104,60,9);c.fill();c.strokeStyle='#6b4a34';c.lineWidth=3;c.stroke();c.fillStyle='#22283c';rr(c,-45,-129,72,46,7);c.fill();
    const k=Math.floor(NOW/420)%4;['#e8443a','#f5c542','#7fd34a','#62b6e8'].forEach((col,i)=>{const hh=8+((i*2+k)%4)*7;c.fillStyle=col;c.fillRect(-38+i*15,-90-hh,10,hh)});c.fillStyle='rgba(255,255,255,.14)';c.fillRect(-41,-126,22,6);
    c.fillStyle='#6b4a34';c.beginPath();c.arc(39,-120,4,0,TAU);c.arc(39,-106,4,0,TAU);c.fill();c.fillStyle='#63b35d';c.fillRect(36,-93,6,3);
    c.strokeStyle='#3a3f4b';c.lineWidth=2;c.beginPath();c.moveTo(-30,-12);c.quadraticCurveTo(-58,4,-36,14);c.stroke();
    c.fillStyle='#d5d2c8';rr(c,-36,-30,72,24,3);c.fill();c.strokeStyle='#6b6f7a';c.lineWidth=2.5;c.stroke();c.fillStyle='#5b6272';c.fillRect(-35,-15,70,8);c.fillStyle='#b9b6ac';c.fillRect(-26,-27,34,9);c.fillStyle='#d9463e';c.fillRect(-28,-13,9,4);c.fillStyle='#3a3f4b';c.fillRect(14,-13,7,4);c.fillRect(24,-13,7,4);c.fillStyle=Math.floor(NOW/700)%2?'#ff5a4a':'#b5301f';c.fillRect(-14,-13,4,4);
    c.fillStyle='#d5d2c8';rr(c,-52,8,34,15,3);c.fill();c.strokeStyle='#6b6f7a';c.lineWidth=2;c.stroke();c.fillStyle='#3a3f4b';c.fillRect(-48,14,8,3);c.fillRect(-45.5,11.5,3,8);c.fillStyle='#d9463e';c.beginPath();c.arc(-29,16,2.4,0,TAU);c.arc(-23,13,2.4,0,TAU);c.fill()},
  /* Empty wall shelf: the spot for decorations made in the game (crafts, dioramas, trophies). The dotted shapes are the free places. */
  deco(c){c.fillStyle='#a8703f';rr(c,-66,-96,132,9,3);c.fill();c.strokeStyle='#6b4a34';c.lineWidth=2;c.stroke();c.fillStyle='#8b5a3c';c.beginPath();c.moveTo(-50,-87);c.lineTo(-50,-72);c.lineTo(-38,-87);c.moveTo(50,-87);c.lineTo(50,-72);c.lineTo(38,-87);c.fill();
    c.strokeStyle='rgba(139,90,60,.8)';c.lineWidth=2;c.setLineDash([5,5]);c.strokeRect(-54,-126,26,28);c.beginPath();c.arc(0,-112,14,0,TAU);c.stroke();c.beginPath();c.moveTo(30,-98);c.lineTo(43,-128);c.lineTo(56,-98);c.closePath();c.stroke();c.setLineDash([])},
  /* Pet beds: one bed is made, the dotted ovals are the spots for the other companions' beds. Later the pets can nap here. */
  beds(c){c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.ellipse(-56,5,32,8,0,0,TAU);c.fill();c.fillStyle='#a8703f';c.beginPath();c.ellipse(-56,-8,32,15,0,0,TAU);c.fill();c.strokeStyle='#6b4a34';c.lineWidth=2.5;c.stroke();c.fillStyle='#f191b3';c.beginPath();c.ellipse(-56,-11,24,9.5,0,0,TAU);c.fill();c.strokeStyle='#fbf6ea';c.lineWidth=1.5;c.setLineDash([4,4]);c.beginPath();c.ellipse(-56,-11,18,6,0,0,TAU);c.stroke();
    c.strokeStyle='rgba(251,246,234,.75)';c.lineWidth=2.5;c.setLineDash([7,6]);[8,72].forEach(x=>{c.beginPath();c.ellipse(x,-6,28,12,0,0,TAU);c.stroke()});c.setLineDash([])},
  pets(c){c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(0,4,46,10,0,0,TAU);c.fill();c.fillStyle='#a8703f';c.beginPath();c.ellipse(0,-14,44,20,0,0,TAU);c.fill();c.strokeStyle='#6b4a34';c.lineWidth=3;c.stroke();c.fillStyle='#62b6e8';c.beginPath();c.ellipse(0,-18,34,13,0,0,TAU);c.fill();c.strokeStyle='#6b4a34';c.lineWidth=2;for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(i*11,-2);c.lineTo(i*12,6-Math.abs(i)*2.5);c.stroke()}},
  desk(c){c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(0,4,86,14,0,0,TAU);c.fill();c.fillStyle='#8b5a3c';c.fillRect(-72,-40,10,42);c.fillRect(62,-40,10,42);c.fillStyle='#dcae70';rr(c,-84,-82,168,50,8);c.fill();c.strokeStyle='#8b5a3c';c.lineWidth=3;c.stroke();
    c.save();c.translate(-22,-58);c.rotate(-.12);c.fillStyle='#d9463e';c.fillRect(-26,-16,52,32);c.restore();c.save();c.translate(38,-58);c.rotate(.5);c.fillStyle='#f5d142';c.fillRect(-22,-3,40,6);c.fillStyle='#f191b3';c.fillRect(-28,-3,6,6);c.restore();c.strokeStyle='#f08a2e';c.lineWidth=3;c.beginPath();c.arc(60,-66,6,0,TAU);c.arc(60,-52,6,0,TAU);c.stroke()},
  chest(c){c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(0,4,70,13,0,0,TAU);c.fill();c.fillStyle='#b5523b';rr(c,-60,-58,120,60,8);c.fill();c.strokeStyle='#6b2e20';c.lineWidth=3;c.stroke();c.fillStyle='#c9654b';rr(c,-65,-84,130,32,12);c.fill();c.stroke();
    c.fillStyle='#f5d142';c.beginPath();for(let i=0;i<10;i++){const r=i%2?6:14,a=-Math.PI/2+i*Math.PI/5;c.lineTo(Math.cos(a)*r,-28+Math.sin(a)*r)}c.closePath();c.fill();c.strokeStyle='#f5d142';c.lineWidth=4;c.beginPath();c.moveTo(34,-84);c.lineTo(34,-118);c.stroke();c.fillStyle='#d9463e';c.beginPath();c.moveTo(36,-118);c.lineTo(60,-110);c.lineTo(36,-102);c.fill()},
  board(c){c.fillStyle='#8b5a3c';rr(c,-104,-184,208,122,6);c.fill();c.fillStyle='#2f6b4f';c.fillRect(-95,-175,190,104);c.fillStyle='rgba(255,255,255,.9)';c.font='900 24px ui-rounded,system-ui,sans-serif';c.textAlign='center';c.fillText('Art Class',0,-140);c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=2.5;c.beginPath();c.arc(-58,-100,14,0,TAU);c.moveTo(-14,-86);c.lineTo(2,-114);c.lineTo(18,-86);c.closePath();c.rect(40,-114,28,28);c.stroke();c.fillStyle='#a8703f';c.fillRect(-104,-66,208,8);c.fillStyle='#fff';c.fillRect(-60,-70,16,5);c.fillStyle='#f5d142';c.fillRect(-36,-70,14,5)},
  door(c,col){c.fillStyle='#d9463e';c.beginPath();c.ellipse(0,18,46,12,0,0,TAU);c.fill();c.fillStyle='#6b4a34';rr(c,-48,-156,96,158,6);c.fill();c.fillStyle=col||'#63b35d';rr(c,-41,-149,82,149,4);c.fill();c.fillStyle='#bfe3f0';c.beginPath();c.arc(0,-108,19,0,TAU);c.fill();c.strokeStyle='#6b4a34';c.lineWidth=4;c.stroke();if(!col){c.fillStyle='#86c486';c.beginPath();c.arc(0,-90,19,Math.PI*1.15,Math.PI*1.85);c.fill()}c.fillStyle='#f5d142';c.beginPath();c.arc(28,-70,5,0,TAU);c.fill()},
  studio(c){STATION_DRAW.door(c,'#8b5cb6')},
  kit(c){c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(0,4,82,13,0,0,TAU);c.fill();c.fillStyle='#4a505c';c.fillRect(-70,-44,9,46);c.fillRect(61,-44,9,46);c.fillStyle='#8b5a3c';c.fillRect(-60,-132,7,70);c.fillRect(53,-132,7,70);
    c.fillStyle='#d6a868';rr(c,-66,-136,132,66,4);c.fill();c.strokeStyle='#8b5a3c';c.lineWidth=3;c.stroke();c.fillStyle='rgba(90,55,25,.45)';for(let j=0;j<5;j++)for(let i=0;i<11;i++){c.beginPath();c.arc(-55+i*11,-127+j*12,1.7,0,TAU);c.fill()}
    const px=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};[[1,0],[2,0],[4,0],[5,0],[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[1,3],[2,3],[3,3],[4,3],[5,3],[2,4],[3,4],[4,4],[3,5]].forEach(q=>px(-56+q[0]*4,-124+q[1]*4,4,4,'#e8443a'));px(-52,-120,4,4,'#ff9a8a');
    px(-14,-122,62,14,'#1a0b0b');px(-12,-120,58,10,'#3b1414');px(-12,-120,38,10,'#e8443a');px(-12,-120,38,2,'#ff8a78');px(-14,-122,4,4,'#c9a24a');px(44,-122,4,4,'#c9a24a');
    px(-14,-100,22,22,'#c9a24a');px(-12,-98,18,18,'#2b2235');px(-8,-94,10,10,'#7fd34a');px(14,-100,22,22,'#7fb2d9');px(16,-98,18,18,'#1b2440');px(20,-94,10,8,'#f5c542');
    c.fillStyle='#5b6272';rr(c,-80,-70,160,28,6);c.fill();c.strokeStyle='#2b2f3a';c.lineWidth=3;c.stroke();c.fillStyle='#3a3f4b';rr(c,-30,-64,60,16,8);c.fill();c.fillStyle='#f5d142';c.fillRect(-22,-58,10,4);c.fillRect(-19,-61,4,10);c.fillStyle='#d9463e';c.beginPath();c.arc(14,-56,3,0,TAU);c.arc(22,-60,3,0,TAU);c.fill()},
  cork(c){c.fillStyle='#8b5a3c';rr(c,-58,-176,116,96,5);c.fill();c.fillStyle='#d2a56c';c.fillRect(-51,-169,102,82);[['#f5d142',-40,-160,.1],['#62b6e8',-2,-164,-.08],['#f191b3',-34,-124,-.1],['#f6f2e9',6,-126,.06]].forEach(n=>{c.save();c.translate(n[1]+16,n[2]+14);c.rotate(n[3]);c.fillStyle=n[0];c.fillRect(-16,-14,32,28);c.fillStyle='#d9463e';c.beginPath();c.arc(0,-10,2.5,0,TAU);c.fill();c.restore()})},
  fridge(c){c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(0,4,46,10,0,0,TAU);c.fill();c.fillStyle='#f6f2e9';rr(c,-38,-126,76,128,10);c.fill();c.strokeStyle='#b9bcc2';c.lineWidth=3;c.stroke();c.beginPath();c.moveTo(-38,-82);c.lineTo(38,-82);c.stroke();c.fillStyle='#b9bcc2';c.fillRect(24,-112,5,22);c.fillRect(24,-74,5,30);
    /* T021: the example wall, finished examples held by magnets */const at=[[-24,-118,.08],[-2,-116,-.1],[-24,-76,-.06],[0,-74,.1],[-24,-44,.05],[0,-42,-.08]],mg=['#d9463e','#3767bb','#5bbf5a','#f5d142','#f38bb3','#8b5cb6'];
    if(typeof EXFRIDGE!=='undefined')EXFRIDGE.forEach((f,i)=>{const a=at[i],cv=exCanvas(exFind('fridge',i),40,40);c.save();c.translate(a[0]+11,a[1]+15);c.rotate(a[2]);c.fillStyle='#fff';c.fillRect(-11,-14,22,28);c.drawImage(cv,-10,-10,20,20);c.fillStyle=mg[i];c.beginPath();c.arc(0,-13,3,0,TAU);c.fill();c.restore()})},
  artswap(c){/* T022: an easel with a board of pinned art cards and a swap arrow */c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(0,4,48,10,0,0,TAU);c.fill();c.strokeStyle='#8b5a3c';c.lineWidth=6;c.lineCap='round';c.beginPath();c.moveTo(-30,2);c.lineTo(-12,-92);c.moveTo(30,2);c.lineTo(12,-92);c.moveTo(0,-30);c.lineTo(0,2);c.stroke();c.fillStyle='#caa76c';rr(c,-44,-96,88,62,4);c.fill();c.strokeStyle='#8b5a3c';c.lineWidth=3;c.stroke();[['#f6f2e9',-38,-90,-.08],['#62b6e8',-12,-92,.06],['#f191b3',14,-89,-.05]].forEach(n=>{c.save();c.translate(n[1]+11,n[2]+14);c.rotate(n[3]);c.fillStyle=n[0];c.fillRect(-11,-13,22,26);c.fillStyle='#d9463e';c.beginPath();c.arc(0,-11,2.2,0,TAU);c.fill();c.restore()});c.strokeStyle='#2f6b4f';c.lineWidth=3.2;c.beginPath();c.arc(0,-52,10,Math.PI*1.1,Math.PI*1.9);c.stroke();c.beginPath();c.arc(0,-52,10,Math.PI*.1,Math.PI*.9);c.stroke();c.fillStyle='#2f6b4f';c.beginPath();c.moveTo(9,-58);c.lineTo(13,-50);c.lineTo(4,-52);c.fill();c.beginPath();c.moveTo(-9,-46);c.lineTo(-13,-54);c.lineTo(-4,-52);c.fill();c.fillStyle='#8b5a3c';c.fillRect(-46,-36,92,5)},
  shop(c){c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(0,4,80,12,0,0,TAU);c.fill();c.fillStyle='#8b5a3c';c.fillRect(-72,-112,6,114);c.fillRect(66,-112,6,114);c.fillStyle='#caa76c';rr(c,-76,-50,152,50,5);c.fill();for(let i=0;i<8;i++){c.fillStyle=i%2?'#f6f2e9':'#d9463e';c.fillRect(-80+i*20,-128,20,28)}['#f5d142','#62b6e8','#f191b3','#63b35d'].forEach((k,i)=>{c.fillStyle=k;c.fillRect(-58+i*30,-66,22,16)})},
  mirror(c){c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(0,4,30,8,0,0,TAU);c.fill();c.fillStyle='#8b5a3c';c.fillRect(-4,-30,8,32);c.fillStyle='#caa76c';c.beginPath();c.ellipse(0,-78,34,54,0,0,TAU);c.fill();c.fillStyle='#cfe8f2';c.beginPath();c.ellipse(0,-78,27,47,0,0,TAU);c.fill();c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=4;c.beginPath();c.moveTo(-12,-100);c.lineTo(4,-116);c.stroke()}};
const lw=(sx,sy)=>({x:RM.cam.x+sx/RM.z,y:RM.cam.y+sy/RM.z});
/* v1.5.1: Move things mode. Drag any station in the studio or the house. Wall things slide along the wall, floor things go anywhere on the floor. Saved per room (craftloft_stnpos_lobby / _househero). */
let MOVE=null;
function drawLobbyRoom(){
  g.fillStyle='#6b4a34';g.fillRect(-400,-900,LOB.W+800,900);g.fillStyle=g.createPattern(WOOD,'repeat');g.fillRect(-400,200,LOB.W+800,LOB.H+700);g.fillStyle='rgba(40,22,10,.45)';g.fillRect(-400,200,400,LOB.H+700);g.fillRect(LOB.W,200,400,LOB.H+700);g.fillRect(0,LOB.H,LOB.W,700);g.fillStyle='rgba(60,35,15,.12)';for(let x=0;x<LOB.W;x+=90)g.fillRect(x,200,2,LOB.H-200);
  g.fillStyle='#f1e2c2';g.fillRect(0,0,LOB.W,210);g.fillStyle='#e3cfa4';g.fillRect(0,150,LOB.W,60);g.fillStyle='#8b5a3c';g.fillRect(0,148,LOB.W,5);g.fillRect(0,206,LOB.W,7);
  g.fillStyle='#6b4a34';g.beginPath();g.moveTo(0,0);g.lineTo(300,0);g.lineTo(0,110);g.fill();g.beginPath();g.moveTo(LOB.W,0);g.lineTo(LOB.W-300,0);g.lineTo(LOB.W,110);g.fill();g.fillRect(0,0,LOB.W,12);
  g.fillStyle=skyCol();g.beginPath();g.arc(620,84,36,0,TAU);g.fill();drawWinSky(620,84,36);g.strokeStyle='#8b5a3c';g.lineWidth=6;g.beginPath();g.arc(620,84,36,0,TAU);g.stroke();g.beginPath();g.moveTo(584,84);g.lineTo(656,84);g.moveTo(620,48);g.lineTo(620,120);g.lineWidth=3;g.stroke();
  /* v1.6a: the rolled-up projector screen under the window */
  g.fillStyle='#e9e4d6';rr(g,566,128,108,12,6);g.fill();g.strokeStyle='#8b5a3c';g.lineWidth=2;g.stroke();g.fillStyle='#8b5a3c';g.fillRect(618,140,4,6);g.beginPath();g.arc(620,149,4,0,TAU);g.stroke();
  for(let i=0;i<9;i++){const x=330+i*30,y=26+Math.sin(i/8*Math.PI)*16;g.fillStyle=PAPERS[i%9];g.beginPath();g.moveTo(x-9,y);g.lineTo(x+9,y);g.lineTo(x,y+16);g.fill()}
  g.fillStyle='#f191b3';g.beginPath();g.ellipse(450,500,190,92,0,0,TAU);g.fill();g.strokeStyle='#fbf6ea';g.lineWidth=5;g.setLineDash([12,10]);g.beginPath();g.ellipse(450,500,170,78,0,0,TAU);g.stroke();g.setLineDash([]);
}
/* the house room: drawn like a shoebox diorama with the front cut away */
function drawHouseRoom(){const R=HOUSE,Wd=R.W;g.fillStyle='#4a3324';g.fillRect(-600,-900,Wd+1200,1100);
  g.fillStyle='#8b5a3c';g.fillRect(Wd-150,-118,44,90);g.fillStyle='#6b4a34';g.fillRect(Wd-156,-126,56,12);
  g.beginPath();g.moveTo(-26,2);g.lineTo(Wd/2,-150);g.lineTo(Wd+26,2);g.closePath();g.fillStyle='#d9463e';g.fill();g.strokeStyle='#fbf6ea';g.lineWidth=5;g.lineJoin='round';g.stroke();
  g.strokeStyle='rgba(120,30,25,.35)';g.lineWidth=3;for(let i=1;i<4;i++){const y=-150+i*38,hw=(Wd/2+26)*(i*38)/152;g.beginPath();g.setLineDash([16,10]);g.moveTo(Wd/2-hw+14,y);g.lineTo(Wd/2+hw-14,y);g.stroke()}g.setLineDash([]);
  g.fillStyle=g.createPattern(WOOD,'repeat');g.fillRect(-600,200,Wd+1200,R.H+700);g.fillStyle='rgba(40,22,10,.55)';g.fillRect(-600,200,600,R.H+700);g.fillRect(Wd,200,600,R.H+700);g.fillRect(0,R.H,Wd,700);g.fillStyle='rgba(60,35,15,.12)';for(let x=0;x<Wd;x+=80)g.fillRect(x,200,2,R.H-200);
  g.fillStyle='#f3e3c3';g.fillRect(0,0,Wd,210);g.fillStyle='rgba(98,182,232,.2)';for(let x=14;x<Wd;x+=44)g.fillRect(x,12,16,138);g.fillStyle='#dcc296';g.fillRect(0,150,Wd,60);g.fillStyle='#8b5a3c';g.fillRect(0,148,Wd,5);g.fillRect(0,206,Wd,7);g.fillRect(0,0,Wd,12);g.fillRect(-8,0,8,R.H);g.fillRect(Wd,0,8,R.H);
  /* window with yarn-tied curtains */
  g.fillStyle='#8b5a3c';rr(g,84,40,112,92,6);g.fill();g.fillStyle=skyCol();g.fillRect(92,48,96,76);g.fillStyle=nightK()>.5?'#2f4a3a':'#86c486';g.beginPath();g.ellipse(140,128,62,22,0,Math.PI,TAU);g.fill();g.fillStyle=nightK()>.5?'#f3efd8':'#f5d142';g.beginPath();g.arc(166,68,10,0,TAU);g.fill();g.fillStyle='#8b5a3c';g.fillRect(138,48,4,76);g.fillRect(92,84,96,4);
  g.fillStyle='#f191b3';[[1,84],[-1,196]].forEach(([k,x])=>{g.beginPath();g.moveTo(x,40);g.lineTo(x+k*30,40);g.quadraticCurveTo(x+k*26,90,x+k*6,104);g.lineTo(x+k*12,132);g.lineTo(x,132);g.closePath();g.fill()});g.fillStyle='#8b5a3c';g.fillRect(76,34,128,7);
  /* a kid's drawing taped to the wall */
  g.save();g.translate(382,96);g.rotate(.05);g.fillStyle='#fbf6ea';g.fillRect(-20,-26,40,34);g.fillStyle='#f5d142';g.beginPath();g.arc(-8,-14,6,0,TAU);g.fill();g.fillStyle='#63b35d';g.fillRect(-20,-2,40,10);g.fillStyle='#d9463e';g.beginPath();g.moveTo(2,-2);g.lineTo(9,-14);g.lineTo(16,-2);g.fill();g.fillStyle='rgba(250,240,190,.9)';g.fillRect(-8,-31,16,8);g.restore();
  /* yarn rug */
  g.fillStyle='#62b6e8';g.beginPath();g.ellipse(310,430,150,74,0,0,TAU);g.fill();g.strokeStyle='#fbf6ea';g.lineWidth=5;g.setLineDash([12,10]);g.beginPath();g.ellipse(310,430,132,61,0,0,TAU);g.stroke();g.strokeStyle='#f5d142';g.lineWidth=4;g.beginPath();g.ellipse(310,430,96,40,0,0,TAU);g.stroke();g.setLineDash([]);
  /* floor cushion in front of the TV */
  g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(140,420,34,11,0,0,TAU);g.fill();g.fillStyle='#f08a2e';g.beginPath();g.ellipse(140,413,32,13,0,0,TAU);g.fill();g.fillStyle='#d9761f';g.beginPath();g.arc(140,412,3,0,TAU);g.fill();
  /* DECORATION SPOT: a masking-tape outline on the floor. Things made in the game (clay pots, plants, dioramas) can stand here later. */
  g.save();g.translate(440,520);g.strokeStyle='rgba(250,240,190,.85)';g.lineWidth=5;g.setLineDash([18,9]);g.strokeRect(-56,-34,112,62);g.setLineDash([]);g.rotate(-.04);g.fillStyle='rgba(250,240,190,.92)';g.fillRect(-46,-9,92,18);g.fillStyle='#8b5a3c';g.font='800 10.5px ui-rounded,system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('decoration spot',0,1);g.textBaseline='alphabetic';g.restore()}
/* T032: inside a shop: a little store with a striped wall, a paper banner and a checkered floor mat */
function drawShopRoom(){const R=RM.shop?RM:shopRoom(),Wd=R.W;g.fillStyle='#3e2a1e';g.fillRect(-600,-900,Wd+1200,1100);
  g.fillStyle=g.createPattern(WOOD,'repeat');g.fillRect(-600,200,Wd+1200,R.H+700);g.fillStyle='rgba(40,22,10,.55)';g.fillRect(-600,200,600,R.H+700);g.fillRect(Wd,200,600,R.H+700);g.fillRect(0,R.H,Wd,700);g.fillStyle='rgba(60,35,15,.12)';for(let x=0;x<Wd;x+=80)g.fillRect(x,200,2,R.H-200);
  for(let x=0;x<Wd;x+=28){g.fillStyle=(x/28)%2?'#f6efe0':'#cfe3ef';g.fillRect(x,0,28,210)}g.fillStyle='#dcc296';g.fillRect(0,150,Wd,60);g.fillStyle='#8b5a3c';g.fillRect(0,148,Wd,5);g.fillRect(0,206,Wd,7);g.fillRect(0,0,Wd,12);g.fillRect(-8,0,8,R.H);g.fillRect(Wd,0,8,R.H);
  for(let i=0;i<14;i++){const x=24+i*37,y=24+Math.sin(i/13*Math.PI)*12;g.fillStyle=PAPERS[i%9];g.beginPath();g.moveTo(x-11,y);g.lineTo(x+11,y);g.lineTo(x,y+18);g.fill()}
  g.save();g.translate(312,92);g.rotate(-.02);g.fillStyle='#3b6fb6';rr(g,-88,-19,176,38,8);g.fill();g.strokeStyle='#fbf6ea';g.lineWidth=3;g.stroke();g.fillStyle='#fbf6ea';g.font='900 16px ui-rounded,system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText((SHOPS[R.shop]||SHOPS.supply).name.toUpperCase(),0,1);g.textBaseline='alphabetic';g.restore();
  for(let j=0;j<2;j++)for(let i=0;i<8;i++){g.fillStyle=(i+j)%2?'rgba(232,68,58,.55)':'rgba(251,246,234,.6)';g.fillRect(Wd/2-160+i*40,500+j*36,40,36)}g.strokeStyle='rgba(120,30,25,.3)';g.lineWidth=3;g.strokeRect(Wd/2-160,500,320,72)}
for(const k in SHOPS)SHOPS[k].room.bg=drawShopRoom;
LOB.bg=drawLobbyRoom;
HOUSE.bg=drawHouseRoom;
stnLoad(LOB);
stnLoad(HOUSE);
for(const k in SHOPS)stnLoad(SHOPS[k].room);
/* ================= PIXEL UI KIT: pixel parts on a pixel grid ================= */
const UI_GRID=16; // base pixel grid in px. Change this one number to change the grid in the kit, the presets and the HUD.
const UIK={frame:{em:'🖼️',name:'Frame',about:'A 9-slice panel border. The corners stay sharp and the edges stretch to any size.'},bar:{em:'❤️',name:'Bar',about:'A health or energy bar: a frame, a fill colour and a number.'},slot:{em:'🎒',name:'Item slot',about:'A square slot with an icon, a count and a coloured border.'},banner:{em:'🏷️',name:'Banner',about:'A nameplate with a name in pixel letters and an optional flame trim.'}};
const FLAMES={ember:['#7a1d0e','#d9431e','#f7931e','#ffd23f','#fff3b0'],frost:['#173a6b','#2f7fd1','#5fc3f0','#bff0ff','#ffffff'],moss:['#1e4a14','#3f9a2a','#7fd34a','#d7f57a','#f8ffd0']};
/* a tiny 3 x 5 pixel font, drawn for Shoebox Studio */
const PXF={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111101101101',N:'110101101101101',O:'010101101101010',P:'110101110100100',Q:'010101101110011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101101111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111',
  0:'111101101101111',1:'010110010010111',2:'110001010100111',3:'110001010001110',4:'101101111001001',5:'111100110001110',6:'011100111101111',7:'111001010010010',8:'111101111101111',9:'111101111001110',' ':'000000000000000','/':'001001010100100','-':'000000111000000','!':'010010010000010','?':'110001010000010','.':'000000000000010',':':'000010000010000','+':'000010111010000',"'":'010010000000000','&':'010101010101011'};
const pxTextW=s=>s.length?s.length*4-1:0;
function pxRaw(c,s,x,y,k){for(let i=0;i<s.length;i++){const gl=PXF[s[i]]||PXF['?'];for(let b=0;b<15;b++)if(gl[b]==='1')c.fillRect(x+(i*4+b%3)*k,y+Math.floor(b/3)*k,k,k)}}
function pxText(c,s,x,y,k,col,sh){s=String(s).toUpperCase();if(sh){c.fillStyle=sh;pxRaw(c,s,x+k,y+k,k)}c.fillStyle=col;pxRaw(c,s,x,y,k)}
const pxName=v=>String(v||'').toUpperCase().split('').filter(ch=>PXF[ch]).join('').slice(0,14);
function shade(hex,a){const n=parseInt(hex.slice(1),16);let r=n>>16,gg=n>>8&255,b=n&255;const f=v=>Math.round(a>0?v+(255-v)*a:v*(1+a));return'#'+[f(r),f(gg),f(b)].map(v=>clamp(v,0,255).toString(16).padStart(2,'0')).join('')}
const isHex=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
/* pixels: one character per pixel, an index into the part's own palette, '.' is see-through */
const UISRC=new Map();
function uiSrc(p){const key=p.pal.join(',')+'|'+p.px;let c=UISRC.get(key);if(c)return c;const N=UI_GRID;c=mkCanvas(N,N);const im=c._x.createImageData(N,N);
  for(let i=0;i<N*N;i++){const ch=p.px[i];if(!ch||ch==='.')continue;const h=p.pal[+ch];if(!h)continue;const v=parseInt(h.slice(1),16);im.data[i*4]=v>>16;im.data[i*4+1]=v>>8&255;im.data[i*4+2]=v&255;im.data[i*4+3]=255}
  c._x.putImageData(im,0,0);if(UISRC.size>80)UISRC.clear();UISRC.set(key,c);return c}
/* 9-slice: corners stay the same, edges and middle stretch with sharp pixels */
function nine(c,src,s,x,y,w,h,k){const N=UI_GRID;s=clamp(Math.round(s),1,Math.floor(N/2)-1);w=Math.max(w,2*s);h=Math.max(h,2*s);const mw=w-2*s,mh=h-2*s,ms=N-2*s,cols=[[0,s,0,s],[s,ms,s,mw],[N-s,s,w-s,s]];
  for(const r of[[0,s,0,s],[s,ms,s,mh],[N-s,s,h-s,s]])for(const q of cols){if(q[3]<=0||r[3]<=0)continue;c.drawImage(src,q[0],r[0],q[1],r[1],x+q[2]*k,y+r[2]*k,q[3]*k,r[3]*k)}}
function uiSize(p,o={}){const N=UI_GRID,s=p.set||{};if(p.kind==='bar')return{w:N*4,h:N,top:0};if(p.kind==='slot')return{w:N+8,h:N+8,top:0};
  if(p.kind==='banner'){const t=pxName(o.name!=null?o.name:s.name);return{w:Math.max(N*2,pxTextW(t)+2*(s.slice||5)+6),h:N,top:s.flame?7:0}}
  return{w:Math.max(4,Math.round(o.w||(s.pw||8)*N/2)),h:Math.max(4,Math.round(o.h||(s.ph||5)*N/2)),top:0}}
function flameTrim(c,x,y,w,k,t,pal){for(let i=1;i<w-1;i++){const n=(Math.sin(i*1.31+t*9.1)+Math.sin(i*.57-t*6.3)+Math.sin(i*2.9+t*3.7)*.5+2.5)/5,hg=Math.max(1,Math.round(1+n*5.4));
    for(let j=0;j<hg;j++){c.fillStyle=pal[clamp(4-Math.floor(j/hg*5),0,4)];c.fillRect(x+i*k,y-(j+1)*k,k,k)}
    if(Math.sin(i*7.7+t*13)>.93){c.fillStyle=pal[3];c.fillRect(x+i*k,y-(hg+2)*k,k,k)}}}
/* draw a part with its top-left at x,y (a flame trim goes above y). k = screen pixels per art pixel */
function uiDraw(c,p,x,y,k,o={}){const s=p.set||{},N=UI_GRID,sz=uiSize(p,o),src=uiSrc(p);c.save();c.imageSmoothingEnabled=false;x=Math.round(x);y=Math.round(y);
  if(p.kind==='frame')nine(c,src,s.slice||5,x,y,sz.w,sz.h,k);
  else if(p.kind==='bar'){const pad=s.pad||2,max=Math.max(1,o.max!=null?o.max:s.max||10),val=clamp(o.val!=null?o.val:(s.val!=null?s.val:max),0,max),iw=sz.w-2*pad,ih=sz.h-2*pad,fw=Math.round(iw*val/max),fc=s.fill||'#e8443a';
    c.fillStyle=s.back||'#222';c.fillRect(x+pad*k,y+pad*k,iw*k,ih*k);if(fw>0){c.fillStyle=fc;c.fillRect(x+pad*k,y+pad*k,fw*k,ih*k);c.fillStyle=shade(fc,.4);c.fillRect(x+pad*k,y+pad*k,fw*k,k);c.fillStyle=shade(fc,-.3);c.fillRect(x+pad*k,y+(pad+ih-1)*k,fw*k,k)}
    nine(c,src,s.slice||4,x,y,sz.w,sz.h,k);if(s.num!==false){const t=Math.round(val)+'/'+max;pxText(c,t,x+Math.floor((sz.w-pxTextW(t))/2)*k,y+Math.floor((sz.h-5)/2)*k,k,s.text||'#fff','rgba(0,0,0,.6)')}}
  else if(p.kind==='slot'){const w=sz.w,bd=s.border||'#c9a24a',bg=s.bg||'#2b2235';c.fillStyle='rgba(0,0,0,.65)';c.fillRect(x,y,w*k,w*k);c.fillStyle=bd;c.fillRect(x+k,y+k,(w-2)*k,(w-2)*k);c.fillStyle=shade(bd,.4);c.fillRect(x+k,y+k,(w-2)*k,k);c.fillRect(x+k,y+k,k,(w-2)*k);c.fillStyle=shade(bd,-.35);c.fillRect(x+k,y+(w-2)*k,(w-2)*k,k);c.fillRect(x+(w-2)*k,y+k,k,(w-2)*k);
    c.fillStyle=bg;c.fillRect(x+3*k,y+3*k,(w-6)*k,(w-6)*k);c.fillStyle=shade(bg,-.4);c.fillRect(x+3*k,y+3*k,(w-6)*k,k);
    if(o.icon)o.icon(c,x+4*k,y+4*k,N*k);else{if(o.empty)c.globalAlpha=.28;c.drawImage(src,x+4*k,y+4*k,N*k,N*k);c.globalAlpha=1}
    const n=o.count!=null?o.count:s.count;if(n>0){const t=String(Math.min(99,n));pxText(c,t,x+(w-3-pxTextW(t))*k,y+(w-8)*k,k,s.text||'#fff','rgba(0,0,0,.75)')}}
  else{const name=pxName(o.name!=null?o.name:s.name);nine(c,src,s.slice||5,x,y,sz.w,sz.h,k);pxText(c,name,x+Math.floor((sz.w-pxTextW(name))/2)*k,y+Math.floor((sz.h-5)/2)*k,k,s.text||'#fff','rgba(0,0,0,.55)');if(s.flame)flameTrim(c,x,y,sz.w,k,o.t||0,FLAMES[s.flameCol]||FLAMES.ember)}
  c.restore();return sz}
function uiFit(cvs,p,pad,t){const c=cvs.getContext('2d'),o={t:t||.4};const sz=uiSize(p,o),k=Math.max(1,Math.floor(Math.min((cvs.width-pad*2)/sz.w,(cvs.height-pad*2)/(sz.h+sz.top))));c.clearRect(0,0,cvs.width,cvs.height);uiDraw(c,p,(cvs.width-sz.w*k)/2,(cvs.height-(sz.h+sz.top)*k)/2+sz.top*k,k,o)}
function uiThumbInto(cvs,p){cvs.width=cvs.height=168;uiFit(cvs,p,8)}
function uiThumbURL(p){const c=mkCanvas(96,96);uiFit(c,p,4);return c.toDataURL()}
/* ---- presets: original designs, all made in code ---- */
const G16=16;
function bev(L,D){return(x,y,d)=>(y===d&&x<15-d)||(x===d&&y<15-d)?L:D}
function ringPx(rings,round){const a=[];for(let y=0;y<G16;y++)for(let x=0;x<G16;x++){const d=Math.min(x,y,15-x,15-y);let ch=rings[Math.min(d,rings.length-1)];if(typeof ch==='function')ch=ch(x,y,d);a.push(ch)}if(round)[[0,0],[15,0],[0,15],[15,15]].forEach(([x,y])=>a[y*16+x]='.');return a}
function shapePx(inside,col,out){const a=new Array(256).fill('.');for(let y=0;y<16;y++)for(let x=0;x<16;x++)if(inside(x,y))a[y*16+x]=col(x,y);if(out!=null)for(let y=0;y<16;y++)for(let x=0;x<16;x++){if(a[y*16+x]==='.')continue;const e=[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>{const X=x+dx,Y=y+dy;return X<0||Y<0||X>15||Y>15||!inside(X,Y)});if(e)a[y*16+x]=out}return a}
function pxFinish(a){if(UI_GRID===16)return a.join('');const N=UI_GRID,o=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++)o.push(a[Math.floor(y*16/N)*16+Math.floor(x*16/N)]);return o.join('')}
function pxResample(px,n){const N=UI_GRID,o=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++)o.push(px[Math.floor(y*n/N)*n+Math.floor(x*n/N)]);return o.join('')}
const UI_PRESETS={
  frame:[
    {name:'Oak panel',pal:['#2a1a10','#a8692f','#d89a52','#6b3f1c','#f1deb4','#e3c993'],px:()=>ringPx(['0',bev('2','3'),'1',bev('3','5'),'4'],1),set:{slice:5,pw:8,ph:5}},
    {name:'Slate panel',pal:['#1d1f26','#5b6272','#8a93a6','#3a3f4b','#c9a24a','#2b2f3a'],px:()=>{const a=ringPx(['0',bev('2','3'),'1','3','5'],1);[[2,2],[13,2],[2,13],[13,13]].forEach(([x,y])=>a[y*16+x]='4');return a},set:{slice:5,pw:8,ph:5}},
    {name:'Moss rune',pal:['#13241a','#2f6b4f','#5fae6e','#1d4231','#e8c25a','#244a37'],px:()=>{const a=ringPx(['0',bev('2','3'),'1','4','5']);[[1,1],[12,1],[1,12],[12,12]].forEach(([sx,sy])=>{for(let j=0;j<3;j++)for(let i=0;i<3;i++)a[(sy+j)*16+sx+i]='4';a[(sy+1)*16+sx+1]='0'});return a},set:{slice:5,pw:8,ph:5}}],
  bar:[
    {name:'Ember bar',pal:['#1a0b0b','#c9a24a','#7a2a1a','#f3d27a'],px:()=>{const a=ringPx(['0',bev('3','2'),'.']);[[1,1],[14,1],[1,14],[14,14]].forEach(([x,y])=>a[y*16+x]='1');return a},set:{slice:4,pad:2,fill:'#e8443a',back:'#3b1414',text:'#fff7e0',max:10,val:10,num:true}},
    {name:'Spark bar',pal:['#0d1424','#7fb2d9','#3d6a94','#d9f0ff'],px:()=>ringPx(['0',bev('3','2'),'.']),set:{slice:4,pad:2,fill:'#ffd23f',back:'#1b2440',text:'#ffffff',max:20,val:14,num:true}},
    {name:'Sprout bar',pal:['#10200f','#8a5a2b','#5e3a1c','#c08a4a','#7fd34a'],px:()=>{const a=ringPx(['0',bev('3','2'),'.']);[[3,0],[4,0],[11,0],[12,0]].forEach(([x,y])=>a[y*16+x]='4');return a},set:{slice:4,pad:2,fill:'#6bd25b',back:'#20301a',text:'#f4ffe0',max:5,val:5,num:true}}],
  slot:[
    {name:'Berry slot',pal:['#2a0f14','#d9314a','#ff8a9a','#3c9a3c','#7ad36a','#8b1a2e'],px:()=>{const a=shapePx((x,y)=>Math.hypot(x-7.5,y-9)<5.3,(x,y)=>x+y>19?'5':'1','0');[[5,7],[6,6],[5,8]].forEach(([x,y])=>a[y*16+x]='2');a[3*16+8]='0';a[4*16+8]='0';[[9,2],[10,2],[9,3],[10,3],[11,3],[11,2]].forEach(([x,y],i)=>a[y*16+x]=i%2?'4':'3');return a},set:{border:'#c9a24a',bg:'#2b2235',text:'#ffffff',count:3}},
    {name:'Key slot',pal:['#2b1d05','#f5c542','#fff0a8','#b8860b'],px:()=>{const ins=(x,y)=>{const d=Math.hypot(x-4.5,y-7.5);return(d<3.9&&d>1.5)||(x>=7&&x<=14&&y>=7&&y<=8)||(x===11&&y>=9&&y<=10)||(x>=13&&x<=14&&y>=9&&y<=11)};const a=shapePx(ins,(x,y)=>y<=7&&x>=7?'2':x+y>14?'3':'1','0');a[5*16+3]='2';a[4*16+4]='2';return a},set:{border:'#7fb2d9',bg:'#1b2440',text:'#ffffff',count:1}},
    {name:'Gem slot',pal:['#1b0d2b','#9b5de5','#d0a8ff','#5a2a99','#ffffff'],px:()=>{const R={3:[5,10],4:[4,11],5:[3,12],6:[3,12],7:[4,11],8:[5,10],9:[6,9],10:[6,9],11:[7,8],12:[7,8]},ins=(x,y)=>R[y]&&x>=R[y][0]&&x<=R[y][1];const a=shapePx(ins,(x,y)=>y<=5?(x<8?'2':'1'):(x<8?'1':'3'),'0');a[4*16+6]='4';a[5*16+5]='4';return a},set:{border:'#e06fa0',bg:'#2a1830',text:'#ffffff',count:12}}],
  banner:[
    {name:'Torch plate',pal:['#120a08','#3a2a24','#5a443a','#e2733a','#ffb347','#24180f'],px:()=>{const a=ringPx(['0','3',bev('2','5'),'1'],1);[[1,1],[14,1],[1,14],[14,14]].forEach(([x,y])=>a[y*16+x]='4');return a},set:{slice:5,name:'HERO',text:'#ffe9b0',flame:true,flameCol:'ember'}},
    {name:'Ribbon',pal:['#3a0d10','#c8333b','#ef6b6b','#8a1f26','#f7d36b'],px:()=>{const notch=(x,y)=>{const e=Math.min(x,15-x);return e<3-Math.abs(y-7.5)*.75};const a=shapePx((x,y)=>y>=1&&y<=14&&!notch(x,y),(x,y)=>y===2?'2':y===3||y===12?'4':y===13?'3':'1','0');return a},set:{slice:5,name:'PIP',text:'#fff4d6',flame:false,flameCol:'ember'}},
    {name:'Stone plaque',pal:['#1a1c22','#6c7385','#9aa3b8','#454b59','#2e323d'],px:()=>ringPx(['0',bev('2','3'),'1',bev('3','2'),'4'],1),set:{slice:5,name:'KNIGHT',text:'#e8f4ff',flame:true,flameCol:'frost'}}]};
function mkPart(kind,i){const pr=UI_PRESETS[kind][i||0];return{kind,name:pr.name,pal:pr.pal.slice(),px:pxFinish(pr.px()),set:Object.assign({},pr.set)}}
/* make a part safe to use (saves, imports) */
function uiClean(p){if(!p||typeof p!=='object'||!UIK[p.kind]||!Array.isArray(p.pal)||typeof p.px!=='string')return null;const pal=p.pal.filter(isHex).slice(0,10);if(!pal.length)return null;
  let px=p.px.replace(/[^0-9.]/g,'.');const n=Math.round(Math.sqrt(px.length));if(n<4||n>64||n*n!==px.length)return null;if(n!==UI_GRID)px=pxResample(px,n);px=px.split('').map(ch=>ch!=='.'&&+ch>=pal.length?'.':ch).join('');
  const s=p.set&&typeof p.set==='object'?p.set:{},d=UI_PRESETS[p.kind][0].set,o={},num=(k,a,b)=>{const v=s[k];o[k]=typeof v==='number'&&isFinite(v)?clamp(Math.round(v),a,b):d[k]};
  ['slice','pw','ph','pad','max','val','count'].forEach(k=>{if(k in d)num(k,k==='val'||k==='count'?0:1,k==='slice'?Math.floor(UI_GRID/2)-1:k==='pad'?6:99)});['fill','back','text','border','bg'].forEach(k=>{if(k in d)o[k]=isHex(s[k])?s[k]:d[k]});
  if('num'in d)o.num=s.num!==false;if('flame'in d){o.flame=!!s.flame;o.flameCol=FLAMES[s.flameCol]?s.flameCol:'ember'}if('name'in d)o.name=pxName(s.name!=null?s.name:d.name);if(o.val!=null&&o.max!=null)o.val=Math.min(o.val,o.max);
  return{kind:p.kind,name:String(p.name||UIK[p.kind].name).slice(0,24),pal,px,set:o}}
/* ---- the kit screen ---- */
const KIT={part:null,tool:'pen',ci:1,mirror:false,undo:[],aid:null,cs:22,drag:null,saveT:0};
function kitNew(kind,i){KIT.part=mkPart(kind,i);KIT.aid=null;KIT.ci=Math.min(1,KIT.part.pal.length-1);KIT.tool='pen'}
function kitLoad(){const d=LS.get('kitdraft',null),p=d&&uiClean(d.part);if(p){KIT.part=p;KIT.aid=d.aid&&LIB.some(a=>a.id===d.aid)?d.aid:null}else kitNew('bar',0)}
function kitDraft(now){if(KIT.pg)return;clearTimeout(KIT.saveT);const f=()=>{if(KIT.part)LS.set('kitdraft',{part:KIT.part,aid:KIT.aid})};if(now)f();else KIT.saveT=setTimeout(f,500)}
function kitCheckpoint(){KIT.undo.push(JSON.stringify({part:KIT.part,aid:KIT.aid}));if(KIT.undo.length>40)KIT.undo.shift()}
function kitUndo(){const s=KIT.undo.pop();if(!s){toast('Nothing to undo');return}const o=JSON.parse(s);KIT.part=o.part;KIT.aid=o.aid;KIT.ci=Math.min(KIT.ci,KIT.part.pal.length-1);SFX.tick();renderKit();kitDraft()}
function renderKit(){if(!KIT.part)kitLoad();const p=KIT.part,s=p.set,N=UI_GRID,box=$('#kitIn');
  const R=(lab,inp)=>'<div class="row"><label>'+lab+'</label>'+inp+'</div>',rng=(k,a,b)=>'<input type="range" data-s="'+k+'" min="'+a+'" max="'+b+'" step="1" value="'+s[k]+'" aria-label="'+k+'"><output id="o_'+k+'">'+s[k]+'</output>',col=k=>'<input type="color" data-s="'+k+'" value="'+s[k]+'" aria-label="'+k+' colour">',tog=k=>'<button class="tog'+(s[k]?' on':'')+'" data-t="'+k+'" aria-label="'+k+'"></button>';
  let set='';const maxS=Math.floor(N/2)-1;
  if(p.kind==='frame')set=R('Corner size',rng('slice',2,maxS))+R('Stretch wide',rng('pw',2,16))+R('Stretch tall',rng('ph',2,10));
  else if(p.kind==='bar')set=R('Fill colour',col('fill'))+R('Empty colour',col('back'))+R('Number colour',col('text'))+R('Most',rng('max',1,99))+R('Now',rng('val',0,s.max))+R('Show number',tog('num'))+R('Corner size',rng('slice',2,maxS))+R('Inset',rng('pad',1,5));
  else if(p.kind==='slot')set=R('Border colour',col('border'))+R('Inside colour',col('bg'))+R('Count colour',col('text'))+R('Count',rng('count',0,99));
  else set=R('Name','<input type="text" data-s="name" maxlength="14" value="'+esc(s.name)+'" aria-label="name">')+R('Letter colour',col('text'))+R('Flame trim',tog('flame'))+R('Flame colour','<div class="krow">'+Object.keys(FLAMES).map(f=>'<button class="kb'+(s.flameCol===f?' on':'')+'" data-fc="'+f+'" style="color:'+FLAMES[f][1]+'">'+f[0].toUpperCase()+f.slice(1)+'</button>').join('')+'</div>')+R('Corner size',rng('slice',2,maxS));
  box.innerHTML='<div class="kcap">1. Pick a part</div><div class="krow sc" id="kKinds">'+Object.keys(UIK).map(k=>'<button class="kb'+(p.kind===k?' on':'')+'" data-k="'+k+'">'+UIK[k].em+' '+UIK[k].name+'</button>').join('')+'</div>'+
    '<div class="kcap">2. Start from a preset</div><div class="krow sc" id="kPre">'+UI_PRESETS[p.kind].map((pr,i)=>'<button class="kb" data-i="'+i+'">'+pr.name+'</button>').join('')+'</div>'+
    '<canvas id="kitPv" aria-label="Preview"></canvas><div class="knote">'+esc(p.name)+(KIT.aid?' · editing a saved part':'')+' · '+UIK[p.kind].about+'</div>'+
    '<div class="kcap">3. Edit the pixels ('+N+' × '+N+' grid'+(p.kind==='slot'?', this is the icon':p.kind==='bar'?', see-through middle shows the fill':'')+')</div><canvas id="kitGrid"></canvas>'+
    '<div class="krow sc" id="kTools">'+[['pen','✏️','Pen'],['eraser','🧽','Eraser'],['fill','🪣','Fill'],['pick','💧','Pick']].map(t=>'<button class="kb'+(KIT.tool===t[0]?' on':'')+'" data-tool="'+t[0]+'">'+t[1]+' '+t[2]+'</button>').join('')+'<button class="kb'+(KIT.mirror?' on':'')+'" id="kMir">↔️ Mirror</button><button class="kb" id="kClr">🧹 Clear</button></div>'+
    '<div class="krow sc" id="kPal">'+p.pal.map((h,i)=>'<button class="ksw'+(KIT.ci===i&&KIT.tool!=='eraser'?' on':'')+'" data-c="'+i+'" style="background:'+h+'" aria-label="colour '+(i+1)+'"></button>').join('')+'<label class="kb">🎨 Change<input type="color" id="kPalC" value="'+p.pal[KIT.ci]+'" aria-label="Change this colour"></label>'+(p.pal.length<10?'<button class="kb" id="kPalAdd" aria-label="Add a colour">➕</button>':'')+'</div>'+
    '<div class="kcap">4. Colours and numbers</div><div class="kcard" id="kSet">'+set+'</div>'+
    '<div class="krow"><button class="kb big" id="kSave">💾 '+(KIT.aid?'Save changes':'Save to Toy Box')+'</button>'+(KIT.aid?'<button class="kb big alt" id="kSaveNew">Save as new</button>':'')+'</div><div class="knote">Pixels stay sharp at every size. Saved parts go in the Toy Box as UI parts, ready for the HUD in Make a Level.</div>';
  box.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{if(b.dataset.k===p.kind)return;kitCheckpoint();kitNew(b.dataset.k,0);SFX.tick();renderKit();kitDraft()});
  box.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{kitCheckpoint();const keep=KIT.aid;kitNew(p.kind,+b.dataset.i);KIT.aid=keep;SFX.clack();renderKit();kitDraft();toast('Preset: '+KIT.part.name+'. Now make it yours.')});
  box.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{KIT.tool=b.dataset.tool;SFX.tick();renderKit()});
  $('#kMir').onclick=()=>{KIT.mirror=!KIT.mirror;SFX.tick();renderKit()};
  $('#kClr').onclick=()=>{kitCheckpoint();p.px='.'.repeat(N*N);SFX.crumple(5);renderKit();kitDraft();toast('Cleared. Undo brings it back.')};
  box.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{KIT.ci=+b.dataset.c;if(KIT.tool==='eraser'||KIT.tool==='pick')KIT.tool='pen';SFX.tick();renderKit()});
  const pc=$('#kPalC');pc.addEventListener('pointerdown',kitCheckpoint);pc.oninput=()=>{p.pal[KIT.ci]=pc.value;const sw=box.querySelector('[data-c="'+KIT.ci+'"]');if(sw)sw.style.background=pc.value;kitDrawGrid();kitDraft()};
  if($('#kPalAdd'))$('#kPalAdd').onclick=()=>{kitCheckpoint();p.pal.push(shade(p.pal[KIT.ci]||'#888888',.35));KIT.ci=p.pal.length-1;KIT.tool='pen';SFX.tick();renderKit();kitDraft()};
  box.querySelectorAll('[data-s]').forEach(inp=>{inp.addEventListener('pointerdown',kitCheckpoint);inp.addEventListener('focus',()=>{if(inp.type==='text')kitCheckpoint()});inp.oninput=()=>{const k=inp.dataset.s;if(inp.type==='range')s[k]=+inp.value;else if(inp.type==='text'){s[k]=pxName(inp.value)}else s[k]=inp.value;const o=$('#o_'+k);if(o)o.textContent=s[k];
    if(k==='max'){const v=box.querySelector('[data-s="val"]');s.val=Math.min(s.val,s.max);if(v){v.max=s.max;v.value=s.val;$('#o_val').textContent=s.val}}if(k==='slice')kitDrawGrid();kitDraft()}});
  box.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{kitCheckpoint();const k=b.dataset.t;s[k]=!s[k];b.classList.toggle('on',s[k]);SFX.tick();kitDraft()});
  box.querySelectorAll('[data-fc]').forEach(b=>b.onclick=()=>{kitCheckpoint();s.flameCol=b.dataset.fc;s.flame=true;SFX.tick();renderKit();kitDraft()});
  $('#kSave').onclick=()=>{auInit();kitSave(false)};if($('#kSaveNew'))$('#kSaveNew').onclick=()=>{auInit();kitSave(true)};if(KIT.pg)kitPageUI(box);
  kitGridInput();kitSize()}
function kitSize(){const gr=$('#kitGrid'),pv=$('#kitPv');if(!gr||!pv)return;const N=UI_GRID,avail=Math.min($('#kitIn').clientWidth||W-24,420);KIT.cs=Math.max(8,Math.floor(avail/N));const sz=KIT.cs*N;gr.style.width=gr.style.height=sz+'px';gr.width=gr.height=Math.round(sz*DPR);pv.width=Math.round(pv.clientWidth*DPR);pv.height=Math.round(132*DPR);kitDrawGrid();kitTick()}
function kitDrawGrid(){const gr=$('#kitGrid');if(!gr||!KIT.part)return;const c=gr.getContext('2d'),p=KIT.part,N=UI_GRID,cs=gr.width/N;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,gr.width,gr.height);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const ch=p.px[y*N+x],X=Math.floor(x*cs),Y=Math.floor(y*cs),S=Math.ceil(cs);if(ch==='.'||!p.pal[+ch]){c.fillStyle='#ffffff';c.fillRect(X,Y,S,S);c.fillStyle='#e4dccb';c.fillRect(X,Y,S/2,S/2);c.fillRect(X+S/2,Y+S/2,S/2,S/2)}else{c.fillStyle=p.pal[+ch];c.fillRect(X,Y,S,S)}}
  c.strokeStyle='rgba(0,0,0,.14)';c.lineWidth=1;c.beginPath();for(let i=1;i<N;i++){const v=Math.round(i*cs)+.5;c.moveTo(v,0);c.lineTo(v,gr.height);c.moveTo(0,v);c.lineTo(gr.width,v)}c.stroke();
  if(p.kind!=='slot'){const sl=clamp(p.set.slice||4,1,N/2-1);c.strokeStyle='rgba(217,70,62,.9)';c.lineWidth=Math.max(1.5,DPR*1.5);c.setLineDash([6*DPR,4*DPR]);c.beginPath();[sl,N-sl].forEach(q=>{const v=Math.round(q*cs);c.moveTo(v,0);c.lineTo(v,gr.height);c.moveTo(0,v);c.lineTo(gr.width,v)});c.stroke();c.setLineDash([])}
  if(KIT.mirror){c.strokeStyle='rgba(55,103,187,.9)';c.lineWidth=2*DPR;c.beginPath();c.moveTo(gr.width/2,0);c.lineTo(gr.width/2,gr.height);c.stroke()}}
function kitTick(){const pv=$('#kitPv');if(!pv||!KIT.part||!pv.width)return;const c=pv.getContext('2d'),p=KIT.part,o={t:NOW/1000};c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,pv.width,pv.height);
  const sz=uiSize(p,o),k=Math.max(1,Math.floor(Math.min((pv.width-20)/sz.w,(pv.height-16)/(sz.h+sz.top)))),x=(pv.width-sz.w*k)/2,y=(pv.height-(sz.h+sz.top)*k)/2+sz.top*k;uiDraw(c,p,x,y,k,o)}
function kitGridInput(){const gr=$('#kitGrid'),N=UI_GRID;const cell=e=>{const r=gr.getBoundingClientRect(),x=Math.floor((e.clientX-r.left)/r.width*N),y=Math.floor((e.clientY-r.top)/r.height*N);return x>=0&&y>=0&&x<N&&y<N?{x,y}:null};
  const put=(x,y)=>{const p=KIT.part,ch=KIT.tool==='eraser'?'.':String(KIT.ci),set=(X,Y)=>{const i=Y*N+X;if(p.px[i]!==ch)p.px=p.px.slice(0,i)+ch+p.px.slice(i+1)};set(x,y);if(KIT.mirror)set(N-1-x,y)};
  const line=(a,b)=>{let x0=a.x,y0=a.y;const dx=Math.abs(b.x-x0),dy=-Math.abs(b.y-y0),sx=x0<b.x?1:-1,sy=y0<b.y?1:-1;let er=dx+dy;for(let n=0;n<64;n++){put(x0,y0);if(x0===b.x&&y0===b.y)break;const e2=2*er;if(e2>=dy){er+=dy;x0+=sx}if(e2<=dx){er+=dx;y0+=sy}}};
  gr.onpointerdown=e=>{e.preventDefault();auInit();const c=cell(e);if(!c)return;try{gr.setPointerCapture(e.pointerId)}catch(_){}const p=KIT.part;
    if(KIT.tool==='pick'){const ch=p.px[c.y*N+c.x];if(ch!=='.'){KIT.ci=+ch;KIT.tool='pen';SFX.tick();renderKit()}else toast('That pixel is see-through');return}
    kitCheckpoint();if(KIT.tool==='fill'){const from=p.px[c.y*N+c.x],to=String(KIT.ci);if(from===to){KIT.undo.pop();return}const a=p.px.split(''),st=[[c.x,c.y]];while(st.length){const[x,y]=st.pop();if(x<0||y<0||x>=N||y>=N||a[y*N+x]!==from)continue;a[y*N+x]=to;st.push([x+1,y],[x-1,y],[x,y+1],[x,y-1])}p.px=a.join('');SFX.squish();kitDrawGrid();kitDraft();return}
    KIT.drag={last:c};put(c.x,c.y);SFX.tick();kitDrawGrid()};
  gr.onpointermove=e=>{if(!KIT.drag)return;const c=cell(e);if(!c)return;line(KIT.drag.last,c);KIT.drag.last=c;rub('pencil',300);kitDrawGrid()};
  const up=()=>{if(KIT.drag){KIT.drag=null;kitDraft()}};gr.onpointerup=up;gr.onpointercancel=up}
function kitSave(asNew){const p=KIT.part,ex=!asNew&&KIT.aid?LIB.find(a=>a.id===KIT.aid):null,nm=ex?ex.name:(p.kind==='banner'?(p.set.name||'Name')+' plate':p.name);
  dlg('<h2>'+(ex?'Save changes':'Save to the Toy Box')+'</h2><canvas class="pv" id="pv"></canvas><label class="lb" for="an">Name</label><input type="text" id="an" maxlength="24" value="'+esc(nm)+'"><label class="lb" for="atg">Tags (comma between)</label><input type="text" id="atg" maxlength="80" value="'+esc(ex?(ex.tags||[]).join(', '):UIK[p.kind].name.toLowerCase())+'"><div class="btns"><button class="alt" id="dNo">Not yet</button><button id="dYes">💾 Save</button></div>',d=>{uiThumbInto(d.querySelector('#pv'),p);d.querySelector('#dNo').onclick=closeDlg;
    d.querySelector('#dYes').onclick=()=>{const a=ex||{id:newAid(),type:'ui'};a.name=(d.querySelector('#an').value||nm).trim().slice(0,24)||nm;a.tags=parseTags(d.querySelector('#atg').value);a.date=Date.now();a.data=uiClean(JSON.parse(JSON.stringify(p)));a.data.name=a.name;a.thumb=uiThumbURL(p);
      if(!ex)LIB.push(a);if(!saveLib()){if(!ex)LIB.pop();toast('Storage is full. Remove something from the Toy Box first.');return}KIT.aid=a.id;kitDraft(true);closeDlg();SFX.thud();updBadge();renderKit();toast(a.name+' is in the Toy Box')}})}
/* ================= ASSET LIBRARY (lives in the Toy Box) ================= */
/* Assets: {id,name,type,tags,date,thumb} plus ref (a toy id in craftloft_toys) or data (a UI part or a level). craftloft_toys stays the store for paper toys. */
const ATYPES={piece:{em:'📄',name:'Piece'},creature:{em:'🐾',name:'Creature'},tile:{em:'🧱',name:'Tile'},sticker:{em:'🏷️',name:'Sticker'},ui:{em:'🎛️',name:'UI part'},level:{em:'🚩',name:'Level'},animation:{em:'🎞️',name:'Animation'},music:{em:'🎵',name:'Music'},tape:{em:'📼',name:'VHS tape'}};/* T020: tape *//* v1.6a: sticker, animation, music */
let LIB=null;
const BOXF={q:'',t:'all'};
const newAid=()=>'a'+Date.now().toString(36)+Math.floor(Math.random()*46656).toString(36);
const parseTags=v=>String(v||'').split(',').map(t=>t.trim().toLowerCase().slice(0,20)).filter(Boolean).slice(0,8);
const fmtDate=d=>{try{const t=new Date(d),y=t.getFullYear()!==new Date().getFullYear();return t.toLocaleDateString(undefined,y?{day:'numeric',month:'short',year:'numeric'}:{day:'numeric',month:'short'})}catch(e){return''}};
function saveLib(){return LS.set('library',{v:1,assets:LIB})}
function toyDate(t){const m=/^t([0-9a-z]{7,9})$/.exec(t.id||'');if(m){const n=parseInt(m[1],36);if(n>1.4e12&&n<4.2e12)return n}return Date.now()}
function libInit(){const s=LS.get('library',null);LIB=s&&Array.isArray(s.assets)?s.assets.filter(a=>a&&a.id&&ATYPES[a.type]):[];libSync()}
/* every toy in craftloft_toys gets a library card; nothing in craftloft_toys is changed or removed here */
function libSync(){let ch=false;const have=new Set(LIB.filter(a=>a.ref).map(a=>a.ref));
  TOYS.forEach(t=>{if(have.has(t.id))return;LIB.push({id:'a_'+t.id,ref:t.id,name:t.name,type:'piece',tags:t.starter?['starter',t.beh||'solid']:[],date:toyDate(t)});have.add(t.id);ch=true});
  const n0=LIB.length;LIB=LIB.filter(a=>!a.ref||toyById(a.ref));if(LIB.length!==n0)ch=true;
  LIB.forEach(a=>{if(a.ref){const t=toyById(a.ref);if(t&&a.name!==t.name){a.name=t.name;ch=true}}});if(ch)saveLib();setTimeout(libThumbs,600)}
function libThumbs(){const a=LIB.find(x=>x.ref&&!x.thumb&&!x._tw);if(!a)return;a._tw=1;const t=toyById(a.ref);if(!t)return;const s=sprite(t),go2=()=>{if(!s.ready){setTimeout(go2,150);return}const c=mkCanvas(96,96),x=c._x,sc=Math.min(86/t.w,86/t.h);x.translate((96-t.w*sc)/2,(96-t.h*sc)/2);x.scale(sc,sc);drawToy(x,t,0,0);a.thumb=c.toDataURL();delete a._tw;saveLib();setTimeout(libThumbs,40)};go2()}
function libAddToy(toy,type){LIB.push({id:'a_'+toy.id,ref:toy.id,name:toy.name,type:['piece','creature','tile','sticker'].includes(type)?type:'piece',tags:[],date:Date.now()});saveLib();setTimeout(libThumbs,300)}
function assetThumb(cvs,a){if(a.ref){const t=toyById(a.ref);if(t){thumb(cvs,t);return}}if(a.type==='ui'&&a.data){uiThumbInto(cvs,a.data);return}cvs.width=cvs.height=168;const x=cvs.getContext('2d');if(a.thumb&&/^data:image\//.test(a.thumb)){const im=new Image();im.onload=()=>{x.imageSmoothingEnabled=a.type!=='ui';x.drawImage(im,0,0,168,168)};im.src=a.thumb}else{x.font='90px system-ui';x.textAlign='center';x.textBaseline='middle';x.fillText(ATYPES[a.type].em,84,90)}}
function renderBox(){const types=$('#boxTypes'),cnt=t=>LIB.filter(a=>t==='all'||a.type===t).length;types.innerHTML=['all'].concat(Object.keys(ATYPES)).map(t=>'<button data-ty="'+t+'" class="'+(BOXF.t===t?'on':'')+'">'+(t==='all'?'All':ATYPES[t].em+' '+ATYPES[t].name)+' · '+cnt(t)+'</button>').join('');
  types.querySelectorAll('[data-ty]').forEach(b=>b.onclick=()=>{BOXF.t=b.dataset.ty;SFX.tick();renderBox()});boxMedRow();if($('#boxQ').value!==BOXF.q)$('#boxQ').value=BOXF.q;renderBoxGrid()}
function renderBoxGrid(){const gr=$('#boxGrid'),q=BOXF.q.trim().toLowerCase();gr.innerHTML='';const list=LIB.filter(a=>(BOXF.t==='all'||a.type===BOXF.t)&&boxMedOk(a)&&(!q||a.name.toLowerCase().includes(q)||(a.tags||[]).some(t=>t.includes(q))||ATYPES[a.type].name.toLowerCase().includes(q))).sort((a,b)=>(b.date||0)-(a.date||0));
  $('#boxNote').textContent=!LIB.length?'Nothing here yet. Make something at the School Desk or the Pixel UI Kit.':list.length?'Tap something to rename, tag, copy, export or remove it. '+list.length+' shown.':'Nothing matches. Try another word or type.';
  list.forEach(a=>{const b=document.createElement('button');b.className='toy';b.dataset.aid=a.id;const c=document.createElement('canvas'),s=document.createElement('span'),m=document.createElement('small');assetThumb(c,a);s.textContent=a.name;const md=assetMed(a);m.textContent=ATYPES[a.type].em+' '+ATYPES[a.type].name+' · '+fmtDate(a.date)+(md&&md.m&&md.m.length?' · '+md.m.map(x=>MEDIA[x]?MEDIA[x].em:'').join(''):'');b.append(c,s,m);b.onclick=()=>{SFX.tick();assetDlg(a)};gr.append(b)})}
$('#boxQ').addEventListener('input',e=>{BOXF.q=e.target.value;renderBoxGrid()});
$('#bxExp').onclick=()=>{auInit();SFX.tick();if(!LIB.length){toast('The Toy Box is empty');return}download('shoebox-studio-library-'+new Date().toISOString().slice(0,10)+'.json',libPack(LIB))};
$('#bxImp').onclick=()=>{auInit();SFX.tick();importDlg()};
function assetDlg(a){const toy=a.ref&&toyById(a.ref),types=toy?['piece','creature','tile','sticker']:[a.type],use=toy?['dD','✂️ Copy to desk']:a.type==='ui'?['dK','🎨 Edit in UI Kit']:a.type==='level'?['dL','🚩 Open in Make a Level']:a.type==='animation'?['dP','▶ Play on projector']:a.type==='tape'?['dV','📼 Play on the VHS']:a.type==='music'?['dM','▶ Listen']:null;
  dlg('<h2>'+ATYPES[a.type].em+' '+esc(a.name)+'</h2><canvas class="pv" id="pv"></canvas><label class="lb" for="an">Name</label><input type="text" id="an" maxlength="24" value="'+esc(a.name)+'"><label class="lb" for="aty">Type</label><select id="aty"'+(types.length<2?' disabled':'')+'>'+types.map(t=>'<option value="'+t+'"'+(t===a.type?' selected':'')+'>'+ATYPES[t].em+' '+ATYPES[t].name+'</option>').join('')+'</select>'+(toy&&!toy.road?'<label class="lb" for="aac">In Little Town it...</label><select id="aac">'+actOpts(toy.act)+'</select>':'')+assetMedHTML(a)+'<label class="lb" for="atg">Tags (comma between)</label><input type="text" id="atg" maxlength="80" value="'+esc((a.tags||[]).join(', '))+'"><p style="font-size:12px;opacity:.75">Saved '+esc(fmtDate(a.date))+'</p><div class="btns"><button id="dS">💾 Save</button>'+(use?'<button class="alt" id="'+use[0]+'">'+use[1]+'</button>':'')+(toy?'<button class="alt" id="dZ">🧊 Make it 3D</button>':'')+'<button class="alt" id="dU">👯 Duplicate</button><button class="alt" id="dE">⬇️ Export</button><button class="bad" id="dR">🗑️ Delete</button></div>',d=>{assetThumb(d.querySelector('#pv'),a);const q=k=>d.querySelector(k);assetMedMount(d);
    q('#dS').onclick=()=>{const nm=(q('#an').value||a.name).trim().slice(0,24)||a.name;a.name=nm;a.tags=parseTags(q('#atg').value);if(types.length>1)a.type=q('#aty').value;if(toy){toy.name=nm;assetMedSave(d,toy);if(q('#aac'))toy.act=q('#aac').value;saveToys()}if(a.data&&a.type==='ui')a.data.name=nm;saveLib();SFX.tick();closeDlg();renderBox();toast('Saved')};
    q('#dU').onclick=()=>{closeDlg();libDuplicate(a)};if(toy)q('#dZ').onclick=()=>{SFX.tick();m3dDlg(toy)};
    q('#dE').onclick=()=>{download('shoebox-studio-'+a.name.replace(/[^\w-]+/g,'-').toLowerCase()+'.json',libPack([a]))};
    q('#dR').onclick=()=>ask('Delete '+esc(a.name)+'?',a.type==='ui'?'It leaves the Toy Box. HUDs that already use it keep their copy.':toy?'It leaves the Toy Box and any level or town that uses it. This cannot be undone.':'It leaves the Toy Box. This cannot be undone.','Delete it',()=>libDelete(a));
    if(use)q('#'+use[0]).onclick=()=>{if(toy){closeDlg();go('craft');toyToDesk(toy);C.cat='hand';C.tool='hand';renderTabs();toast('A copy is on your desk')}else if(a.type==='ui'){const p=uiClean(a.data);if(!p){toast('This part cannot be opened');return}KIT.part=p;KIT.aid=a.id;KIT.undo=[];kitDraft(true);go('kit')}else if(a.type==='tape'){vhsPlay(a)}else if(a.type==='animation'){projPlay(a)}else if(a.type==='music'){if(AU.song){songStop();q('#dM').textContent='▶ Listen'}else{songPlay(a.data,false);q('#dM').textContent='■ Stop'}}else{const L=lvlClean(a.data);if(!L){toast('This level cannot be opened');return}ask('Open '+esc(a.name)+'?','It replaces the level on your table. Save that one first if you want to keep it.','Open it',()=>{LVL=L;LS.set('level',LVL);go('level');toast(a.name+' is ready')})}}})}
function libDelete(a){LIB=LIB.filter(x=>x!==a);if(a.ref){cpForget(a.ref);/* T034 */TOYS=TOYS.filter(t=>t.id!==a.ref);saveToys();delete SPR[a.ref]}if(KIT.aid===a.id)KIT.aid=null;saveLib();SFX.crumple(6);updBadge();if(SCR==='box')renderBox();toast(a.name+' was deleted')}
function libDuplicate(a){const nm=(a.name+' copy').slice(0,24),b={id:newAid(),name:nm,type:a.type,tags:(a.tags||[]).slice(),date:Date.now(),thumb:a.thumb};
  if(a.ref){const t=toyById(a.ref);if(!t)return;const nt=JSON.parse(JSON.stringify(t));nt.id='t'+Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36);nt.name=nm;delete nt.starter;TOYS.push(nt);if(!saveToys()){TOYS.pop();toast('Storage is full. Remove something first.');return}b.ref=nt.id;b.id='a_'+nt.id}
  else b.data=JSON.parse(JSON.stringify(a.data));LIB.push(b);if(!saveLib()){LIB.pop();if(b.ref){TOYS=TOYS.filter(t=>t.id!==b.ref);saveToys()}toast('Storage is full. Remove something first.');return}SFX.thwap();updBadge();if(SCR==='box')renderBox();toast(nm+' made')}
/* ---- export and import (JSON files) ---- */
function libPack(list){const toys=new Map();const add=id=>{const t=toyById(id);if(t)toys.set(t.id,t)};const assets=list.map(a=>{if(a.ref)add(a.ref);if(a.type==='level'&&a.data&&a.data.items)a.data.items.forEach(it=>add(it.toy));if(a.type==='animation'&&a.data&&a.data.frames)a.data.frames.forEach(add);if(a.type==='tape'&&a.data){(a.data.frames||[]).forEach(add);if(a.data.label&&a.data.label.toy)add(a.data.label.toy)}const o=Object.assign({},a);delete o._tw;return o});
  return{format:'craftloft-library',version:1,app:'Shoebox Studio v1.3',grid:UI_GRID,exported:new Date().toISOString(),assets,toys:[...toys.values()]}}
function download(name,obj){const txt=JSON.stringify(obj);try{const b=new Blob([txt],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),8000)}catch(e){}
  SFX.thud();dlg('<h2>Export ready</h2><p>'+esc(name)+' should be downloading now ('+Math.max(1,Math.round(txt.length/1024))+' KB). If nothing happened, copy the text and keep it safe. Import takes the file or the text.</p><textarea id="ex" readonly aria-label="Library as text"></textarea><div class="btns"><button class="alt" id="dC">📋 Copy text</button><button id="dNo">Done</button></div>',d=>{const t=d.querySelector('#ex');t.value=txt.length>2e6?'(Too big to show here. Use the downloaded file.)':txt;
    d.querySelector('#dC').onclick=()=>{const fb=()=>{t.select();try{document.execCommand('copy');toast('Copied')}catch(e){toast('Select the text and copy it')}};try{navigator.clipboard.writeText(txt).then(()=>toast('Copied'),fb)}catch(e){fb()}};d.querySelector('#dNo').onclick=closeDlg})}
function importDlg(){dlg('<h2>Import to the Toy Box</h2><p>Pick a Shoebox Studio library file (.json). Things you already have are kept as they are.</p><div class="btns"><button id="dF">📂 Pick a file</button></div><label class="lb" for="ip">Or paste library text</label><textarea id="ip" aria-label="Paste library text"></textarea><div class="btns"><button class="alt" id="dNo">Cancel</button><button id="dP">Import text</button></div>',d=>{
  d.querySelector('#dF').onclick=()=>{const f=$('#fileIn');f.value='';f.click()};d.querySelector('#dNo').onclick=closeDlg;d.querySelector('#dP').onclick=()=>doImport(d.querySelector('#ip').value)})}
$('#fileIn').addEventListener('change',e=>{const f=e.target.files&&e.target.files[0];if(!f)return;if(f.size>20e6){toast('That file is too big');return}const r=new FileReader();r.onload=()=>doImport(String(r.result||''));r.onerror=()=>toast('Could not read that file');r.readAsText(f)});
function doImport(txt){let o;try{o=JSON.parse(txt)}catch(e){toast('That is not a Shoebox Studio library file');return}const res=libImport(o);if(!res){toast('That is not a Shoebox Studio library file');return}closeDlg();if(res.full){toast('Not enough room to import. Remove something first.');return}
  SFX.win();updBadge();if(SCR==='box')renderBox();else go('box');toast('Imported '+res.added+(res.added===1?' thing':' things')+(res.skipped?' · '+res.skipped+' already here':''))}
const num=(v,d)=>typeof v==='number'&&isFinite(v)?v:d;
function toyClean(t){if(!t||typeof t.id!=='string'||!Array.isArray(t.parts)||!t.parts.length||t.parts.length>40)return null;const parts=[];for(const p of t.parts){if(!p||typeof p.src!=='string'||!/^data:image\/(png|webp|jpeg);base64,/.test(p.src))return null;parts.push({src:p.src,x:num(p.x,0),y:num(p.y,0),w:clamp(num(p.w,10),1,2000),h:clamp(num(p.h,10),1,2000),parent:Math.floor(num(p.parent,-1)),px:num(p.px,0),py:num(p.py,0),z:num(p.z,0)})}
  const o={id:t.id.slice(0,40),name:String(t.name||'Piece').slice(0,24),w:clamp(num(t.w,10),1,2000),h:clamp(num(t.h,10),1,2000),beh:BEH[t.beh]?t.beh:'solid',parts};if(typeof t.color==='string'&&isHex(t.color))o.color=t.color;if(t.starter)o.starter=true;if(TACT[t.act])o.act=t.act;if(t.road)o.road=1;if(t.side==='back')o.side='back';const pngU=v=>typeof v==='string'&&/^data:image\/png;base64,/.test(v);if(t.sheet&&pngU(t.sheet.front)&&pngU(t.sheet.back))o.sheet={front:t.sheet.front,back:t.sheet.back};return o}
function lvlClean(d){if(!d||!Array.isArray(d.items))return null;const pt=(q,x,y)=>({x:num(q&&q.x,x),y:num(q&&q.y,y)});const o={start:pt(d.start,110,560),goal:pt(d.goal,1620,560),items:d.items.filter(i=>i&&typeof i.toy==='string').slice(0,120).map(i=>({toy:i.toy,x:num(i.x,0),y:num(i.y,0),s:clamp(num(i.s,1),.05,3),flip:i.flip===-1?-1:1,beh:BEH[i.beh]?i.beh:'solid'}))};
  if(d.music&&d.music.song){const S=songClean(d.music.song);if(S)o.music={aid:String(d.music.aid||'').slice(0,48),name:String(d.music.name||'Song').slice(0,24),song:S}}
  if(d.hud&&typeof d.hud==='object'){const h=d.hud,el=e=>{const p=e&&uiClean(e.part);return p?{part:p,aid:typeof e.aid==='string'?e.aid:null,fx:clamp(num(e.fx,.03),0,1),fy:clamp(num(e.fy,.12),0,1)}:null};
    o.hud={bar:el(h.bar),slots:(Array.isArray(h.slots)?h.slots:[]).map(el).filter(Boolean).slice(0,5),panels:(Array.isArray(h.panels)?h.panels:[]).map(x=>{const r=el(x);if(r){r.w=clamp(num(x.w,64),8,400);r.h=clamp(num(x.h,40),8,400)}return r}).filter(Boolean).slice(0,3),plate:null};
    if(h.plate){const p=uiClean(h.plate.part);if(p)o.hud.plate={part:p,aid:null,name:pxName(h.plate.name!=null?h.plate.name:p.set.name)}}}return o}
function libImport(o){if(Array.isArray(o))o={assets:[],toys:o};if(!o||typeof o!=='object'||(!Array.isArray(o.assets)&&!Array.isArray(o.toys)))return null;const T0=TOYS.slice(),L0=LIB.slice();let added=0,skipped=0;
  (Array.isArray(o.toys)?o.toys:[]).forEach(t=>{const c=toyClean(t);if(!c||toyById(c.id))return;TOYS.push(c)});
  (Array.isArray(o.assets)?o.assets:[]).forEach(a=>{if(!a||typeof a.id!=='string'||!ATYPES[a.type]){skipped++;return}if(LIB.some(x=>x.id===a.id)||(a.ref&&LIB.some(x=>x.ref===a.ref))){skipped++;return}
    const b={id:a.id.slice(0,48),name:String(a.name||'Imported').slice(0,24),type:a.type,tags:Array.isArray(a.tags)?parseTags(a.tags.join(',')):[],date:num(a.date,Date.now())};if(typeof a.thumb==='string'&&/^data:image\/(png|webp|jpeg);base64,/.test(a.thumb)&&a.thumb.length<400000)b.thumb=a.thumb;
    if(a.ref){if(typeof a.ref!=='string'||!toyById(a.ref)){skipped++;return}b.ref=a.ref;if(!['piece','creature','tile','sticker'].includes(b.type))b.type='piece';const t=toyById(a.ref);t.name=b.name}
    else if(a.type==='ui'){const p=uiClean(a.data);if(!p){skipped++;return}b.data=p}else if(a.type==='level'){const L=lvlClean(a.data);if(!L){skipped++;return}b.data=L}else if(a.type==='animation'){const A=animClean(a.data);if(!A){skipped++;return}b.data=A}else if(a.type==='music'){const S=songClean(a.data);if(!S){skipped++;return}b.data=S}else if(a.type==='tape'){const T=tapeClean(a.data);if(!T){skipped++;return}b.data=T}else{skipped++;return}LIB.push(b);added++});
  const before=LIB.length;libSync();added+=LIB.length-before;
  if(!saveToys()||!saveLib()){TOYS=T0;LIB=L0;saveToys();saveLib();return{full:true}}return{added,skipped}}
/* ---- the toy chest: levels or the toy box ---- */
function chestMenu(){dlg('<h2>The Toy Chest</h2><p>What do you want to open?</p><button class="les" data-c="level" style="margin-top:8px"><span>🚩 Make a Level<small>Place pieces and a HUD, then play</small></span><i>▶</i></button><button class="les" data-c="box" style="margin-top:8px"><span>🧸 Toy Box<small>Asset Library: '+LIB.length+' saved</small></span><i>▶</i></button><div class="btns"><button class="alt" id="dNo">Close</button></div>',d=>{d.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{SFX.tick();go(b.dataset.c)});d.querySelector('#dNo').onclick=closeDlg})}

/* ================= THE PROJECTOR: flipbooks on a pull-down wall screen ================= */
/* An animation asset: {type:'animation', data:{frames:[toy ids in order], fps:4..12, loop:true|false}}. Pages are paper pieces from the Toy Box. */
function animClean(d){if(!d||!Array.isArray(d.frames))return null;const fr=d.frames.filter(f=>typeof f==='string').map(f=>f.slice(0,40)).slice(0,60);if(!fr.length)return null;return{frames:fr,fps:clamp(Math.round(num(d.fps,8)),4,12),loop:d.loop!==false}}
const animList=()=>LIB.filter(a=>a.type==='animation'&&a.data);
function animThumb(a){const t=toyById(a.data.frames[0]);if(!t)return;whenReady(t,()=>{const c=mkCanvas(96,96),x=c._x;x.fillStyle='#2b2422';x.fillRect(0,0,96,96);x.fillStyle='#fbf6ea';for(let i=0;i<6;i++){x.fillRect(6+i*15,4,8,6);x.fillRect(6+i*15,86,8,6)}x.fillStyle='#f2eee2';x.fillRect(6,14,84,68);fitToy(x,t,10,18,76,60);x.fillStyle='#d9463e';x.font='900 12px system-ui';x.textAlign='right';x.fillText(a.data.frames.length+'p',90,80);a.thumb=c.toDataURL();saveLib();if(SCR==='box')renderBoxGrid()})}
function projMenu(){const L=animList();dlg('<h2>🎞️ Projector</h2><p>'+(L.length?'Pick a flipbook to show on the wall screen.':'No flipbooks yet. Make one from pieces in your Toy Box: each piece is one page.')+'</p>'+L.map(a=>'<button class="les" data-pa="'+esc(a.id)+'"><span>🎞️ '+esc(a.name)+'<small>'+a.data.frames.length+' pages · '+a.data.fps+' a second'+(a.data.loop?' · loops':'')+'</small></span><i>▶</i></button>').join('')+'<div class="btns"><button class="alt" id="dNo">Close</button>'+(L.length?'<button class="alt" id="dTp">📼 Save to tape</button>':'')+'<button id="dMk">🎞️ Make a flipbook</button></div>',d=>{if(d.querySelector('#dTp'))d.querySelector('#dTp').onclick=()=>{SFX.tick();tapeFromFlipbookDlg()};
  d.querySelectorAll('[data-pa]').forEach(b=>b.onclick=()=>{const a=LIB.find(x=>x.id===b.dataset.pa);if(a)projPlay(a)});d.querySelector('#dNo').onclick=closeDlg;d.querySelector('#dMk').onclick=()=>{SFX.tick();flipbookDlg()}})}
const FB={frames:[],fps:8,loop:true,name:''};
function flipbookDlg(){const pages=TOYS.filter(t=>!t.road);FB.frames=FB.frames.filter(id=>toyById(id));if(!FB.name)FB.name='My flipbook '+(animList().length+1);
  dlg('<h2>🎞️ Make a flipbook</h2><p>Tap pieces in the order the pages should play. Tap a page in the strip to take it out.</p><label class="lb" for="fbN">Name</label><input type="text" id="fbN" maxlength="24" value="'+esc(FB.name)+'"><label class="lb">Pages in order (<span id="fbC">0</span>)</label><div class="fbGrid" id="fbSeq"></div><label class="lb">Your pieces</label><div class="fbGrid" id="fbPick"></div><label class="lb" for="fbS">Speed: <span id="fbSv">'+FB.fps+'</span> pages a second</label><input type="range" id="fbS" min="4" max="12" step="1" value="'+FB.fps+'" style="width:100%"><div class="row"><input type="checkbox" id="fbL"'+(FB.loop?' checked':'')+' style="width:22px;height:22px"><label for="fbL">Loop it (play again and again)</label></div><div class="btns"><button class="alt" id="dNo">Close</button><button class="alt" id="fbX">🧹 Clear pages</button><button class="alt" id="fbP">▶ Preview</button><button class="alt" id="fbPx">👾 Draw a pixel page</button><button class="alt" id="fbT">📼 Save to tape</button><button id="fbOk">💾 Save to Toy Box</button></div>',d=>{
  const q=s=>d.querySelector(s),seq=q('#fbSeq'),pick=q('#fbPick'),card=(t,n)=>{const b=document.createElement('button'),c=document.createElement('canvas');c.width=c.height=104;whenReady(t,()=>{fitToy(c.getContext('2d'),t,4,4,96,96)});b.append(c);const s=document.createElement('span');s.textContent=t.name;b.append(s);if(n){const i=document.createElement('i');i.textContent=n;b.append(i)}return b};
  const draw=()=>{seq.innerHTML='';FB.frames.forEach((id,i)=>{const t=toyById(id);if(!t)return;const b=card(t,i+1);b.onclick=()=>{FB.frames.splice(i,1);SFX.tick();draw()};seq.append(b)});if(!FB.frames.length)seq.innerHTML='<p style="font-size:12px;margin:6px">No pages yet.</p>';q('#fbC').textContent=FB.frames.length};
  pages.forEach(t=>{const b=card(t);b.onclick=()=>{if(FB.frames.length>=60){toast('That is a lot of pages! 60 is the most.');return}FB.frames.push(t.id);SFX.tick();draw();seq.scrollTop=seq.scrollHeight};pick.append(b)});draw();
  q('#fbN').oninput=e=>{FB.name=e.target.value};q('#fbS').oninput=e=>{FB.fps=+e.target.value;q('#fbSv').textContent=FB.fps};q('#fbL').onchange=e=>{FB.loop=e.target.checked};
  q('#dNo').onclick=closeDlg;q('#fbX').onclick=()=>{FB.frames=[];draw()};
  q('#fbP').onclick=()=>{if(FB.frames.length<2){toast('Pick at least 2 pages');return}projPlay({id:'',name:(FB.name||'Preview').trim(),data:{frames:FB.frames.slice(),fps:FB.fps,loop:FB.loop}},true)};
  q('#fbPx').onclick=()=>{if(FB.frames.length>=60){toast('That is a lot of pages! 60 is the most.');return}SFX.tick();kitPageStart()};/* T020 */
  q('#fbT').onclick=()=>{if(FB.frames.length<2){toast('Pick at least 2 pages');return}const nm=(FB.name||'My flipbook').trim().slice(0,24)||'My flipbook',a={id:newAid(),name:nm,type:'animation',tags:['flipbook'],date:Date.now(),data:{frames:FB.frames.slice(),fps:FB.fps,loop:FB.loop}};LIB.push(a);if(!saveLib()){LIB.pop();toast('Storage is full. Remove something first.');return}animThumb(a);FB.frames=[];FB.name='';VHS.lastPx=null;updBadge();saveTapeStart(a)};/* T020: saves the flipbook, then makes the tape from it */
  q('#fbOk').onclick=()=>{if(FB.frames.length<2){toast('Pick at least 2 pages');return}const nm=(FB.name||'My flipbook').trim().slice(0,24)||'My flipbook',a={id:newAid(),name:nm,type:'animation',tags:['flipbook'],date:Date.now(),data:{frames:FB.frames.slice(),fps:FB.fps,loop:FB.loop}};LIB.push(a);if(!saveLib()){LIB.pop();toast('Storage is full. Remove something first.');return}animThumb(a);FB.frames=[];FB.name='';SFX.win();updBadge();
    dlg('<h2>🎞️ '+esc(nm)+' is in the Toy Box</h2><p>Show it on the projector in the studio any time.</p><div class="btns"><button class="alt" id="dNo">Later</button><button class="alt" id="dTp">📼 Save to tape</button><button id="dPl">▶ Play it now</button></div>',d2=>{d2.querySelector('#dNo').onclick=closeDlg;d2.querySelector('#dPl').onclick=()=>projPlay(a);d2.querySelector('#dTp').onclick=()=>{SFX.tick();saveTapeStart(a)}})}})}
/* full-screen player: a dark room, a screen that rolls down from a roller, a beam from the little cardboard projector, then the pages */
const PJ={a:null,fr:[],t0:0,raf:0,end:false};
function projPlay(a,preview){const fr=a.data.frames.map(toyById).filter(Boolean);if(!fr.length){toast('The pages of this flipbook are not in the Toy Box any more');return}if(OVL)return;closeDlg();fr.forEach(t=>sprite(t));
  OVL='proj';PJ.a=a;PJ.fr=fr;PJ.preview=!!preview;PJ.t0=performance.now();PJ.end=false;$('#projTtl').textContent=a.name+(preview?' (preview)':'');$('#projAgain').style.display='none';$('#proj').classList.add('on');$('#lobGo').style.display='none';setVol();
  try{history.pushState({sbsTool:'proj'},'')}catch(e){}try{SFX.rustle()}catch(e){}cancelAnimationFrame(PJ.raf);PJ.raf=requestAnimationFrame(projFrame)}
function projClose(fromBack){if(OVL!=='proj')return;OVL=null;cancelAnimationFrame(PJ.raf);$('#proj').classList.remove('on');setVol();RM.near=undefined;try{SFX.tick()}catch(e){}if(!fromBack){try{if(history.state&&history.state.sbsTool)history.back()}catch(e){}}if(PJ.preview)setTimeout(flipbookDlg,60)}
function projFrame(ts){if(OVL!=='proj')return;const cv2=$('#projCv'),x=cv2.getContext('2d'),dpr=Math.min(2,devicePixelRatio||1),w=innerWidth,h=innerHeight;if(cv2.width!==Math.round(w*dpr)||cv2.height!==Math.round(h*dpr)){cv2.width=Math.round(w*dpr);cv2.height=Math.round(h*dpr)}
  x.setTransform(dpr,0,0,dpr,0,0);const t=ts-PJ.t0,a=PJ.a,n=PJ.fr.length;
  const bg=x.createRadialGradient(w/2,h*.4,20,w/2,h*.4,Math.max(w,h)*.8);bg.addColorStop(0,'#3a2a1e');bg.addColorStop(1,'#120c08');x.fillStyle=bg;x.fillRect(0,0,w,h);
  const sw=Math.min(w-28,(h-170)*4/3,760),sh=sw*.75,sx=(w-sw)/2,top=Math.max(64,(h-sh-90)/2),u=Math.min(1,t/750),ease=1-Math.pow(1-u,3),cur=sh*ease;
  /* roller */
  x.fillStyle='#6b4a34';rr(x,sx-14,top-14,sw+28,16,8);x.fill();x.fillStyle='#8b5a3c';x.fillRect(sx-10,top-10,sw+20,5);
  /* the cloth screen: a piece of cloth pulled down, with soft folds */
  x.fillStyle='#efe9da';x.fillRect(sx,top,sw,cur);x.fillStyle='rgba(120,100,70,.07)';for(let i=1;i<9;i++){const fx=sx+sw*i/9+Math.sin(i*1.7)*6;x.fillRect(fx,top,3,cur)}
  x.fillStyle='#4a3324';rr(x,sx-6,top+cur-4,sw+12,10,5);x.fill();x.strokeStyle='#caa76c';x.lineWidth=2;x.beginPath();x.arc(w/2,top+cur+12,7,0,TAU);x.stroke();
  /* the beam */
  const px=w/2,py=h-26;x.save();x.globalCompositeOperation='lighter';const bm=x.createLinearGradient(px,py,px,top);bm.addColorStop(0,'rgba(255,240,200,.16)');bm.addColorStop(1,'rgba(255,240,200,.03)');x.fillStyle=bm;if(u>=1){x.beginPath();x.moveTo(px-14,py);x.lineTo(sx+8,top+8);x.lineTo(sx+sw-8,top+8);x.lineTo(px+14,py);x.closePath();x.fill();
    for(let i=0;i<14;i++){const k=(i*97+t*.012*(1+i%3))%100/100,mx=px+(Math.sin(i*3.1+t/2400)*.5)*sw*k*.9,my=py-(py-top)*k;x.fillStyle='rgba(255,245,220,.22)';x.fillRect(mx,my,2,2)}}x.restore();
  /* the little cardboard projector */
  x.fillStyle='#c98e55';rr(x,px-30,py-18,60,30,5);x.fill();x.strokeStyle='#7d5233';x.lineWidth=2;x.stroke();x.fillStyle='#3b2f2a';x.beginPath();x.arc(px,py-18,7,0,TAU);x.fill();x.fillStyle='#fff7d6';x.beginPath();x.arc(px,py-18,3.5,0,TAU);x.fill();
  /* the pages */
  if(u>=1){const ft=t-750,idx=Math.floor(ft/1000*a.data.fps);let k=idx;if(a.data.loop)k=idx%n;else if(idx>=n){k=n-1;if(!PJ.end){PJ.end=true;$('#projAgain').style.display=''}}
    const tf=PJ.fr[k];if(tf&&sprite(tf).ready){x.save();x.beginPath();x.rect(sx,top,sw,sh);x.clip();x.globalAlpha=.9+.07*Math.sin(t/37)*Math.sin(t/71);fitToy(x,tf,sx+sw*.08,top+sh*.08,sw*.84,sh*.84);x.globalAlpha=1;x.fillStyle='rgba(255,226,160,.10)';x.fillRect(sx,top,sw,sh);
      const vg=x.createRadialGradient(w/2,top+sh/2,sh*.3,w/2,top+sh/2,sw*.7);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(40,25,10,.35)');x.fillStyle=vg;x.fillRect(sx,top,sw,sh);x.restore()}
    x.fillStyle='rgba(251,246,234,.75)';x.font='800 12px system-ui';x.textAlign='center';x.fillText('page '+(k+1)+' of '+n+(PJ.end?' · the end':''),w/2,top+sh+34)}
  PJ.raf=requestAnimationFrame(projFrame)}
$('#projBack').onclick=()=>projClose();
$('#projAgain').onclick=()=>{PJ.t0=performance.now()-750;PJ.end=false;$('#projAgain').style.display='none';SFX.tick()};
/* ================= VHS SPOT (ticket T020, Nov 13, 2026): tapes, a cardboard VHS shelf and a tape player beside the projector ================= */
/* A tape asset: {type:'tape', data:{aid: the flipbook (animation asset) it came from, frames:[toy ids], fps, loop, label:{p:0..2} (a code-made label) or {toy: toy id} (a piece he made)}}.
   The pages are a copy of the flipbook's, so a tape still plays if the flipbook is deleted. Old libraries have no tapes and load as before.
   The shelf and player are one studio station ('vhs'). A tape plays full screen on a hanging cloth backdrop (#vhs, OVL='vhs', vhsPlay), apart from the projector's pull-down screen.
   Pages can be drawn NES style on the Pixel UI Kit grid (kitPageStart: the same editor in "page mode"; the kit's own draft is kept aside and comes back after). */
const VHS={in:null,lastPx:null};
const TAPE_LABELS=[{name:'Masking tape',bg:'#f1e3bd',ink:'#3b2f2a',line:'#d9463e'},{name:'Rainbow sticker',bg:'#fbf6ea',ink:'#2b2422',stripes:['#d9463e','#f08a2e','#f5d142','#63b35d','#3767bb','#8b5cb6']},{name:'Star paper',bg:'#3767bb',ink:'#fff7d6',stars:'#f5d142'}];
function tapeClean(d){const A=animClean(d);if(!A)return null;const o={frames:A.frames,fps:A.fps,loop:A.loop,aid:typeof d.aid==='string'?d.aid.slice(0,48):'',label:{p:0}};const l=d.label;if(l&&typeof l.toy==='string')o.label={toy:l.toy.slice(0,40)};else if(l&&typeof l.p==='number'&&isFinite(l.p))o.label={p:clamp(Math.round(l.p),0,TAPE_LABELS.length-1)};return o}
const tapeList=()=>LIB?LIB.filter(a=>a.type==='tape'&&a.data):[];
const labelToy=lb=>lb&&lb.toy?toyById(lb.toy):null;
/* the label: a piece he made, or one of the 3 code-made labels with the tape's name written on it */
function drawLabel(x,lb,name,bx,by,bw,bh){x.save();x.beginPath();x.rect(bx,by,bw,bh);x.clip();const t=labelToy(lb);
  if(t){x.fillStyle='#fbf6ea';x.fillRect(bx,by,bw,bh);if(sprite(t).ready)fitToy(x,t,bx+2,by+2,bw-4,bh-4);x.restore();return}
  const LP=lb&&lb.p!=null?lb.p:0,L0=TAPE_LABELS[LP]||TAPE_LABELS[0],LSW=asReady('vhs_label_'+LP),L=LSW?{bg:'#fbf6ea',ink:'#2b2422'}:L0;x.fillStyle=L.bg;x.fillRect(bx,by,bw,bh);if(LSW)asCover('vhs_label_'+LP,x,bx,by,bw,bh);/* T022 */
  if(L.line){x.fillStyle=L.line;x.fillRect(bx,by+bh*.78,bw,Math.max(1.5,bh*.06));x.fillStyle='rgba(120,90,50,.18)';for(let i=0;i<5;i++)x.fillRect(bx+bw*(i*.21+.03),by,1,bh)}
  if(L.stripes){const n=L.stripes.length,sh=bh*.16;L.stripes.forEach((c,i)=>{x.fillStyle=c;x.fillRect(bx+bw*i/n,by+bh-sh,bw/n+1,sh)})}
  if(L.stars){x.fillStyle=L.stars;for(let i=0;i<7;i++){const sx=bx+bw*((i*37%100)/100),sy=by+bh*((i*53%90)/100+.05);x.beginPath();for(let k=0;k<10;k++){const r=k%2?1.4:3.4,a=k*Math.PI/5-Math.PI/2;x.lineTo(sx+Math.cos(a)*r,sy+Math.sin(a)*r)}x.fill()}}
  const fs=Math.max(7,Math.min(bh*.42,bw/Math.max(4,String(name).length)*1.5));x.fillStyle=L.ink;x.font='700 '+fs+'px "Comic Sans MS","Chalkboard SE",ui-rounded,system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.translate(bx+bw/2,by+bh*.45);x.rotate(-.03);x.fillText(String(name).slice(0,24),0,0,bw-6);x.restore()}
/* a whole cassette, seen from the front */
function tapeArt(x,lb,name,W2,H2){const u=W2/150;x.fillStyle='#24201e';rr(x,4*u,22*u,142*u,96*u,8*u);x.fill();x.fillStyle='#3a3431';rr(x,10*u,28*u,130*u,84*u,5*u);x.fill();
  drawLabel(x,lb,name,16*u,32*u,118*u,38*u);
  x.fillStyle='#14110f';rr(x,36*u,76*u,78*u,26*u,12*u);x.fill();[55,95].forEach(cx=>{x.fillStyle='#fbf6ea';x.beginPath();x.arc(cx*u,89*u,9*u,0,TAU);x.fill();x.fillStyle='#14110f';for(let k=0;k<6;k++){const a=k*Math.PI/3;x.fillRect(cx*u+Math.cos(a)*5*u-1*u,89*u+Math.sin(a)*5*u-1*u,2*u,2*u)}x.beginPath();x.arc(cx*u,89*u,2.5*u,0,TAU);x.fill()});
  x.fillStyle='#5a524d';[[12,30],[136,30],[12,110],[136,110]].forEach(([a,b])=>{x.beginPath();x.arc(a*u,b*u,2.2*u,0,TAU);x.fill()})}
function tapeThumb(a){const lt=labelToy(a.data.label),mk=()=>{const c=mkCanvas(96,96);tapeArt(c._x,a.data.label,a.name,96,96);a.thumb=c.toDataURL();saveLib();if(SCR==='box')renderBoxGrid()};if(lt)whenReady(lt,mk);else mk()}
/* a spine on the shelf: the label runs along it */
function spineArt(cv,a){cv.width=88;cv.height=300;const x=cv.getContext('2d'),lb=a.data.label;x.fillStyle='#24201e';x.fillRect(0,0,88,300);x.fillStyle='#3a3431';x.fillRect(6,0,4,300);x.fillRect(78,0,4,300);
  const draw=()=>{x.save();x.translate(44,150);x.rotate(-Math.PI/2);drawLabel(x,lb,a.name,-126,-26,252,52);x.restore();x.fillStyle='#fbf6ea';x.font='800 15px system-ui';x.textAlign='center';x.fillText('VHS',44,288)};const lt=labelToy(lb);if(lt)whenReady(lt,draw);else draw()}
/* ---- Save to tape (from the projector's flipbook screens) ---- */
const TP={anim:null,name:'',label:{p:0},edit:null};
function saveTapeStart(anim){TP.anim=anim;TP.edit=null;TP.name=String(anim.name||'My tape').slice(0,24);TP.label={p:(tapeList().length)%TAPE_LABELS.length};tapeDlg()}
function tapeDlg(){const T=TP,nm=T.edit?T.edit.name:T.name;
  dlg('<h2>📼 '+(T.edit?'Change the label':'Save to tape')+'</h2><canvas class="pv" id="pv"></canvas>'+(T.edit?'':'<label class="lb" for="tpN">Tape name</label><input type="text" id="tpN" maxlength="24" value="'+esc(nm)+'">')+
    '<label class="lb">Label</label><div class="krow sc">'+TAPE_LABELS.map((l,i)=>'<button class="kb'+(!T.label.toy&&T.label.p===i?' on':'')+'" data-lp="'+i+'">'+l.name+'</button>').join('')+'<button class="kb'+(T.label.toy?' on':'')+'" id="tpPc">🧸 A piece I made</button></div>'+
    '<button class="les" id="tpDr" style="margin-top:8px"><span>✏️ Draw a label at the School Desk<small>'+(T.edit?'Draw it on a small sheet, save it to the Toy Box, then pick it here':'The tape goes on the shelf first. Draw the label on a small sheet, save it to the Toy Box, then pick it with 🏷️ Change a label')+'</small></span><i>▶</i></button>'+
    '<div class="btns"><button class="alt" id="dNo">Cancel</button><button id="dYes">📼 '+(T.edit?'Save label':'Put it on the shelf')+'</button></div>',d=>{const q=s=>d.querySelector(s),pv=q('#pv');
    const paint=()=>{pv.width=pv.height=300;const x=pv.getContext('2d');x.clearRect(0,0,300,300);x.save();x.translate(0,10);tapeArt(x,T.label,T.edit?T.edit.name:T.name,300,300);x.restore()};const lt=labelToy(T.label);if(lt)whenReady(lt,paint);else paint();
    if(q('#tpN'))q('#tpN').oninput=e=>{T.name=e.target.value;paint()};
    d.querySelectorAll('[data-lp]').forEach(b=>b.onclick=()=>{T.label={p:+b.dataset.lp};SFX.tick();tapeDlg()});
    q('#tpPc').onclick=()=>{SFX.tick();labelPieceDlg()};
    q('#tpDr').onclick=()=>{SFX.tick();if(!T.edit){const a=tapeSave();if(!a)return}closeDlg();go('craft');toast('Draw your label on a sheet (cut it small if you like), then put it in the Toy Box. Back at the VHS shelf: 🏷️ Change a label.')};
    q('#dNo').onclick=()=>{closeDlg();if(T.edit)vhsMenu()};
    q('#dYes').onclick=()=>{if(T.edit){T.edit.data.label=T.label;saveLib();tapeThumb(T.edit);SFX.tick();closeDlg();toast('New label on '+T.edit.name);setTimeout(vhsMenu,60);return}const a=tapeSave();if(!a)return;SFX.win();
      dlg('<h2>📼 '+esc(a.name)+' is on the VHS shelf</h2><p>The shelf and tape player stand next to the projector in the studio. The tape is in the Toy Box too.</p><div class="btns"><button class="alt" id="dNo">Later</button><button id="dPl">▶ Play it now</button></div>',d2=>{d2.querySelector('#dNo').onclick=closeDlg;d2.querySelector('#dPl').onclick=()=>vhsPlay(a)})}})}
function tapeSave(){const T=TP,A=T.anim,nm=(T.name||'My tape').trim().slice(0,24)||'My tape',a={id:newAid(),name:nm,type:'tape',tags:['vhs'],date:Date.now(),data:{aid:A.id||'',frames:A.data.frames.slice(),fps:A.data.fps,loop:A.data.loop,label:T.label}};
  LIB.push(a);if(!saveLib()){LIB.pop();toast('Storage is full. Remove something first.');return null}tapeThumb(a);updBadge();return a}
function labelPieceDlg(){const pages=TOYS.filter(t=>!t.road);dlg('<h2>🧸 Pick a label</h2><p>Any piece from your Toy Box can be the label.</p><div class="fbGrid" id="lpG"></div><div class="btns"><button class="alt" id="dNo">Back</button></div>',d=>{const gr=d.querySelector('#lpG');
  pages.forEach(t=>{const b=document.createElement('button'),c=document.createElement('canvas');c.width=c.height=104;whenReady(t,()=>fitToy(c.getContext('2d'),t,4,4,96,96));b.append(c);const s=document.createElement('span');s.textContent=t.name;b.append(s);b.onclick=()=>{TP.label={toy:t.id};SFX.tick();tapeDlg()};gr.append(b)});
  if(!pages.length)gr.innerHTML='<p style="font-size:12px;margin:6px">No pieces yet.</p>';d.querySelector('#dNo').onclick=()=>tapeDlg()})}
function tapeFromFlipbookDlg(){const L=animList();dlg('<h2>📼 Save to tape</h2><p>Pick the flipbook to put on a tape.</p>'+L.map(a=>'<button class="les" data-ta="'+esc(a.id)+'"><span>🎞️ '+esc(a.name)+'<small>'+a.data.frames.length+' pages · '+a.data.fps+' a second</small></span><i>📼</i></button>').join('')+'<div class="btns"><button class="alt" id="dNo">Back</button></div>',d=>{
  d.querySelectorAll('[data-ta]').forEach(b=>b.onclick=()=>{const a=LIB.find(x=>x.id===b.dataset.ta);if(a){SFX.tick();saveTapeStart(a)}});d.querySelector('#dNo').onclick=()=>projMenu()})}
/* ---- the shelf ---- */
function vhsMenu(labelMode){const L=tapeList(),inT=VHS.in&&LIB.find(a=>a.id===VHS.in);
  dlg('<h2>📼 VHS shelf</h2><p>'+(L.length?(labelMode?'Tap the tape that gets a new label.':'Tap a tape to put it in the player.'):'No tapes yet. Make a flipbook at the projector, then tap 📼 Save to tape.')+'</p>'+(inT&&!labelMode?'<button class="les" id="vIn"><span>▶ Play the tape in the player<small>'+esc(inT.name)+'</small></span><i>📼</i></button>':'')+
    (L.length?'<div class="vhsShelf" id="vSh"></div>':'')+'<div class="btns"><button class="alt" id="dNo">'+(labelMode?'Back':'Close')+'</button>'+(L.length&&!labelMode?'<button class="alt" id="vLb">🏷️ Change a label</button>':'')+(labelMode?'':'<button id="vMk">📼 Make a tape</button>')+'</div>',d=>{const q=s=>d.querySelector(s),sh=q('#vSh');
    if(sh)L.forEach(a=>{const b=document.createElement('button'),c=document.createElement('canvas');spineArt(c,a);b.append(c);b.title=a.name;b.setAttribute('aria-label',a.name);b.onclick=()=>{SFX.tick();if(labelMode){TP.edit=a;TP.label=JSON.parse(JSON.stringify(a.data.label||{p:0}));tapeDlg()}else vhsPlay(a)};sh.append(b)});
    if(q('#vIn'))q('#vIn').onclick=()=>vhsPlay(inT);q('#dNo').onclick=()=>{if(labelMode)vhsMenu();else closeDlg()};if(q('#vLb'))q('#vLb').onclick=()=>{SFX.tick();vhsMenu(true)};if(q('#vMk'))q('#vMk').onclick=()=>{SFX.tick();animList().length?tapeFromFlipbookDlg():flipbookDlg()}})}
/* ---- the player: a hanging cloth backdrop, a warm light cone from the tape player, tracking lines, a wobble and a tape counter ---- */
const VH={a:null,fr:[],pos:0,st:'play',last:0,t0:0,raf:0};
function vhsPlay(a){const fr=(a.data.frames||[]).map(toyById).filter(Boolean);if(!fr.length){toast('The pages of this tape are not in the Toy Box any more');return}if(OVL)return;closeDlg();fr.forEach(t=>sprite(t));
  OVL='vhs';VHS.in=a.id;VH.a=a;VH.fr=fr;VH.pos=0;VH.st='play';VH.t0=VH.last=performance.now();$('#vhsTtl').textContent=a.name;vhsBtns();$('#vhs').classList.add('on');$('#lobGo').style.display='none';setVol();
  try{history.pushState({sbsTool:'vhs'},'')}catch(e){}try{SFX.clack()}catch(e){}cancelAnimationFrame(VH.raf);VH.raf=requestAnimationFrame(vhsFrame)}
function vhsClose(fromBack,eject){if(OVL!=='vhs')return;OVL=null;cancelAnimationFrame(VH.raf);$('#vhs').classList.remove('on');setVol();RM.near=undefined;if(!fromBack){try{if(history.state&&history.state.sbsTool)history.back()}catch(e){}}
  if(eject){VHS.in=null;try{SFX.clack()}catch(e){}setTimeout(()=>vhsMenu(),80)}else try{SFX.tick()}catch(e){}}
function vhsBtns(){$('#vhsPlay').textContent=VH.st==='play'?'⏸ Pause':'▶ Play';$('#vhsRew').classList.toggle('on',VH.st==='rew')}
$('#vhsBack').onclick=()=>vhsClose();
$('#vhsEj').onclick=()=>vhsClose(false,true);
$('#vhsPlay').onclick=()=>{const n=VH.fr.length,end=n/VH.a.data.fps;if(VH.st==='play')VH.st='pause';else{if(VH.st==='stop'||(!VH.a.data.loop&&VH.pos>=end-.01))VH.pos=0;VH.st='play'}try{SFX.tick()}catch(e){}vhsBtns()};
$('#vhsRew').onclick=()=>{VH.st=VH.st==='rew'?'pause':'rew';try{SFX.rustle()}catch(e){}vhsBtns()};
function vhsFrame(ts){if(OVL!=='vhs')return;const dt=Math.min(.1,(ts-VH.last)/1000);VH.last=ts;const a=VH.a,n=VH.fr.length,fps=a.data.fps,end=n/fps;
  if(VH.st==='play'){VH.pos+=dt;if(!a.data.loop&&VH.pos>=end){VH.pos=end;VH.st='stop';vhsBtns()}}else if(VH.st==='rew'){VH.pos-=dt*6;if(VH.pos<=0){VH.pos=0;VH.st='pause';vhsBtns();try{SFX.clack()}catch(e){}}}
  const cv2=$('#vhsCv'),x=cv2.getContext('2d'),dpr=Math.min(2,devicePixelRatio||1),w=innerWidth,h=innerHeight;if(cv2.width!==Math.round(w*dpr)||cv2.height!==Math.round(h*dpr)){cv2.width=Math.round(w*dpr);cv2.height=Math.round(h*dpr)}
  x.setTransform(dpr,0,0,dpr,0,0);const t=ts-VH.t0,bg=x.createRadialGradient(w/2,h*.42,20,w/2,h*.42,Math.max(w,h)*.8);bg.addColorStop(0,'#33241a');bg.addColorStop(1,'#0e0906');x.fillStyle=bg;x.fillRect(0,0,w,h);
  const cw=Math.min(w-36,(h-220)*4/3,760),ch=cw*.75,cx=(w-cw)/2,top=Math.max(72,(h-ch-130)/2),N=22,sway=k=>Math.sin(t/1300+k*.35)*cw*.006*(1+k*.2),wave=i=>Math.sin(i*1.3+t/700)*3;
  /* the rod and its loops */
  x.fillStyle='#6b4a34';rr(x,cx-22,top-16,cw+44,12,6);x.fill();x.fillStyle='#caa76c';x.beginPath();x.arc(cx-22,top-10,8,0,TAU);x.arc(cx+cw+22,top-10,8,0,TAU);x.fill();
  /* the cloth: strips that sway a little more toward the bottom, with soft folds */
  const fold=i=>.5+.5*Math.sin(i*.95+Math.sin(t/1600)*.7);
  for(let i=0;i<N;i++){const x0=cx+cw*i/N,x1=cx+cw*(i+1)/N,s=sway(1);x.fillStyle='#efe6d2';x.beginPath();x.moveTo(x0,top);x.lineTo(x1+.6,top);x.lineTo(x1+.6+s,top+ch+wave(i+1));x.lineTo(x0+s,top+ch+wave(i));x.closePath();x.fill()}
  for(let i=0;i<8;i++){const lx=cx+cw*(i+.5)/8;x.fillStyle='#e8dcc2';x.beginPath();x.arc(lx,top-6,5,0,TAU);x.fill()}
  asCover('vhs_cloth',x,cx,top,cw,ch);/* T022 */
  /* the picture on the cloth */
  const s1=sway(1),idx=Math.floor(VH.pos*fps-1e-6),k=n?(a.data.loop?((idx%n)+n)%n:clamp(idx,0,n-1)):0,tf=VH.fr[Math.max(0,k)];
  x.save();x.beginPath();x.moveTo(cx,top);x.lineTo(cx+cw,top);x.lineTo(cx+cw+s1,top+ch);x.lineTo(cx+s1,top+ch);x.closePath();x.clip();
  if(tf&&sprite(tf).ready){const jx=Math.sin(t/53)*1.4+(VH.st==='pause'?Math.sin(t/9)*1.2:0)+(VH.st==='rew'?Math.sin(t/5)*4:0),jy=Math.cos(t/71)*1;x.save();x.translate(cx+cw/2+s1*.5+jx,top+ch/2+jy);x.rotate(Math.sin(t/430)*.007);x.globalAlpha=.86+.06*Math.sin(t/37);fitToy(x,tf,-cw*.42,-ch*.42,cw*.84,ch*.84);x.restore();x.globalAlpha=1}
  x.fillStyle='rgba(255,214,150,.12)';x.fillRect(cx-10,top,cw+20,ch);
  /* tracking lines: a few thin bands rolling down, more when paused or rewinding */
  const bands=VH.st==='rew'?7:VH.st==='pause'?4:2;for(let b=0;b<bands;b++){const yy=top+((t*(VH.st==='rew'?.35:.045)+b*ch/bands+b*61)%ch),hh=2+((b*7)%5);x.fillStyle='rgba(255,255,255,'+(VH.st==='play'?.08:.16)+')';x.fillRect(cx-10,yy,cw+20,hh);x.fillStyle='rgba(0,0,0,.10)';x.fillRect(cx-10,yy+hh,cw+20,1);
    for(let j=0;j<10;j++){const sx=cx+((j*97+Math.floor(t/60)*31)%100)/100*cw;x.fillStyle='rgba(255,255,255,.22)';x.fillRect(sx,yy+((j*3)%hh),6+(j%3)*5,1)}}
  /* folds drawn over the picture so it sits on the cloth */
  for(let i=0;i<N;i++){const f=fold(i),x0=cx+cw*i/N;x.fillStyle='rgba(95,70,40,'+(f*.13).toFixed(3)+')';x.fillRect(x0+s1*.5,top,cw/N+.6,ch+4);if(f>.85){x.fillStyle='rgba(255,250,235,.10)';x.fillRect(x0+s1*.5,top,cw/N*.4,ch+4)}}
  const vg=x.createRadialGradient(w/2,top+ch/2,ch*.3,w/2,top+ch/2,cw*.72);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(40,25,10,.38)');x.fillStyle=vg;x.fillRect(cx-10,top,cw+20,ch+6);x.restore();
  /* the on-screen words and the tape counter, VCR style */
  const sec=Math.floor(VH.pos),cnt=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0'),osd={play:'▶ PLAY',pause:'❚❚ PAUSE',rew:'◀◀ REW',stop:'■ STOP'}[VH.st];
  x.font='900 '+Math.round(Math.max(13,cw*.032))+'px ui-monospace,Menlo,Consolas,monospace';x.textBaseline='top';x.shadowColor='rgba(0,0,0,.6)';x.shadowBlur=3;x.fillStyle='#f4fff0';x.textAlign='left';if(VH.st!=='play'||t<2500)x.fillText(osd,cx+14+s1*.3,top+12);x.textAlign='right';x.fillText(cnt,cx+cw-14+s1,top+12);x.shadowBlur=0;x.textBaseline='alphabetic';
  /* the warm light cone from the tape player */
  const px=w/2,py=h-74;x.save();x.globalCompositeOperation='lighter';const bm=x.createLinearGradient(px,py,px,top);bm.addColorStop(0,'rgba(255,200,130,.18)');bm.addColorStop(1,'rgba(255,220,160,.04)');x.fillStyle=bm;x.beginPath();x.moveTo(px-10,py);x.lineTo(cx+10,top+6);x.lineTo(cx+cw-10+s1,top+6);x.lineTo(px+10,py);x.closePath();x.fill();
    for(let i=0;i<12;i++){const kk=(i*97+t*.011*(1+i%3))%100/100,mx=px+Math.sin(i*3.1+t/2400)*.5*cw*kk*.9,my=py-(py-top)*kk;x.fillStyle='rgba(255,236,200,.2)';x.fillRect(mx,my,2,2)}x.restore();
  /* the little tape player */
  x.fillStyle='#4a4440';rr(x,px-46,py-10,92,30,5);x.fill();x.strokeStyle='#2b2422';x.lineWidth=2;x.stroke();x.fillStyle='#1d1a18';x.fillRect(px-36,py-2,46,6);x.fillStyle='#24201e';x.fillRect(px-32,py-6,38,5);
  x.fillStyle='#132a14';x.fillRect(px+14,py-3,26,13);x.fillStyle='#7dff8a';x.font='700 9px ui-monospace,monospace';x.textAlign='center';x.fillText(cnt,px+27,py+7);x.fillStyle='#ff9a3c';x.beginPath();x.arc(px-40,py+12,2.2,0,TAU);x.fill();
  VH.raf=requestAnimationFrame(vhsFrame)}
/* ---- NES-style pages on the Pixel UI Kit grid ---- */
const NES_PAL=['#5c94fc','#000000','#fcfcfc','#7c7c7c','#d82800','#fc9838','#f8b800','#00a800','#0058f8','#ac7c00'];
function kitPageStart(){KIT.pgSave={part:KIT.part,aid:KIT.aid,undo:KIT.undo,ci:KIT.ci,tool:KIT.tool,mirror:KIT.mirror};KIT.pg={n:FB.frames.length+1};
  KIT.part={kind:'slot',name:'Tape page',pal:NES_PAL.slice(),px:VHS.lastPx||'0'.repeat(UI_GRID*UI_GRID),set:Object.assign({},UI_PRESETS.slot[0].set)};KIT.aid=null;KIT.undo=[];KIT.ci=1;KIT.tool='pen';KIT.mirror=false;closeDlg();go('kit');
  if(VHS.lastPx)toast('This page starts as a copy of your last one. Change what moves.')}
function kitPageEnd(){const s=KIT.pgSave;KIT.pg=null;KIT.pgSave=null;if(s){KIT.part=s.part;KIT.aid=s.aid;KIT.undo=s.undo||[];KIT.ci=s.ci;KIT.tool=s.tool;KIT.mirror=s.mirror}}
function kitPageUI(box){const caps=box.querySelectorAll('.kcap');[0,1,3].forEach(i=>{if(caps[i])caps[i].style.display='none'});if(caps[2])caps[2].textContent='Draw page '+KIT.pg.n+' of your tape (16 × 16 pixels, NES style)';
  ['#kKinds','#kPre','#kitPv','#kSet'].forEach(s=>{const e=box.querySelector(s);if(e)e.style.display='none'});box.querySelectorAll('.knote').forEach(e=>e.style.display='none');
  const hd=document.createElement('div');hd.className='knote';hd.style.fontWeight='800';hd.textContent='👾 Tape page: a pixel page for your flipbook. Small palette, big pixels. Save page puts it in the flipbook.';box.prepend(hd);
  const sv=$('#kSave');sv.textContent='💾 Save page';sv.onclick=()=>{auInit();kitPageSave()};const cx=document.createElement('button');cx.className='kb big alt';cx.textContent='✖ Back to the flipbook';cx.onclick=()=>{SFX.tick();kitPageEnd();go('home');setTimeout(flipbookDlg,80)};sv.parentNode.append(cx)}
function kitPageSave(){const p=KIT.part,N=UI_GRID,S=8;if(!/[^.]/.test(p.px)){toast('Draw something first');return}const c=mkCanvas(N*S,N*S),x=c._x;for(let i=0;i<N*N;i++){const ch=p.px[i];if(ch==='.')continue;x.fillStyle=p.pal[+ch]||'#000';x.fillRect((i%N)*S,Math.floor(i/N)*S,S,S)}
  const n=TOYS.filter(t=>/^Pixel page/.test(t.name)).length+1,toy={id:'t'+Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36),name:'Pixel page '+n,w:N*S,h:N*S,beh:'scenery',act:'none',parts:[{src:c.toDataURL(),x:0,y:0,w:N*S,h:N*S,parent:-1,px:0,py:0,z:0}]};
  TOYS.push(toy);if(!saveToys()){TOYS.pop();toast('Storage is full. Remove something first.');return}libAddToy(toy,'piece');const la=LIB.find(a=>a.ref===toy.id);if(la){la.tags=['pixel page'];saveLib()}
  VHS.lastPx=p.px;FB.frames.push(toy.id);SFX.collect();kitPageEnd();go('home');setTimeout(flipbookDlg,80);toast(toy.name+' is page '+FB.frames.length+' of your flipbook')}

/* ================= CONSOLE SAVE: the house console's Beat Bop Doodle saves songs (music) and screenshots (stickers) to the Toy Box ================= */
/* Beat Bop Doodle's own song format (its save key ds_song2, function songData()): {len, bpm, notes:[[step,row,'inst' or 'inst#'/'instb' joined by +]], rep, times, barRep}.
   A step is an eighth note: 30000/bpm ms. Rows are notes C6 (row 0) down to G3 (row 17). We keep that format as is. */
const BROWS=[84,83,81,79,77,76,74,72,71,69,67,65,64,62,60,59,57,55];
function songClean(d){if(!d||!Array.isArray(d.notes))return null;const notes=d.notes.filter(n=>Array.isArray(n)&&n.length>=3&&Number.isInteger(n[0])&&Number.isInteger(n[1])&&n[0]>=0&&n[0]<512&&n[1]>=0&&n[1]<BROWS.length&&typeof n[2]==='string'&&/^[a-z]+[#b]?(\+[a-z]+[#b]?)*$/.test(n[2])).slice(0,4000).map(n=>[n[0],n[1],n[2]]);if(!notes.length)return null;
  const o={len:clamp(Math.round(num(d.len,32)),16,512),bpm:clamp(Math.round(num(d.bpm,120)),40,300),notes,times:num(d.times,1)};['rep','barRep'].forEach(k=>{if(d[k]&&typeof d[k]==='object'&&!Array.isArray(d[k]))o[k]=JSON.parse(JSON.stringify(d[k]))});return o}
const songSecs=s=>Math.round(s.len*30/s.bpm);
function musicThumb(s){const c=mkCanvas(96,96),x=c._x;x.fillStyle='#f6f2e9';x.fillRect(0,0,96,96);x.fillStyle='#62b6e8';x.fillRect(0,0,96,18);x.fillStyle='#fff';x.font='900 13px system-ui';x.textAlign='center';x.fillText('♪ ♫ ♪',48,14);x.strokeStyle='rgba(59,47,42,.25)';x.lineWidth=1;for(let i=0;i<5;i++){x.beginPath();x.moveTo(6,34+i*12);x.lineTo(90,34+i*12);x.stroke()}
  const L=Math.max(16,s.len);s.notes.forEach(n=>{x.fillStyle=['#d9463e','#f5d142','#63b35d','#3767bb','#8b5cb6'][n[1]%5];x.beginPath();x.arc(6+n[0]/L*84,26+n[1]*3.6,2.6,0,TAU);x.fill()});return c.toDataURL()}
const BINST={guitar:'sawtooth',trumpet:'square',cat:'square',frog:'square',duck:'square',coin:'square',zap:'sawtooth',rocket:'sawtooth',dog:'sawtooth',flute:'sine',organ:'sine',bell:'sine',heart:'sine',ghost:'sine',spring:'sine'};
function songNote(inst,m,t,d){const c=AU.c,f=440*Math.pow(2,(m-69)/12);if(inst==='drum'){nz({f:f*3,d:.12,g:.3,at:Math.max(0,t-c.currentTime)});return}const o=c.createOscillator(),e=c.createGain(),ty=BINST[inst]||'triangle',dd=Math.max(.2,d*1.6);o.type=ty;o.frequency.value=f;e.gain.setValueAtTime(.0001,t);e.gain.linearRampToValueAtTime(ty==='square'||ty==='sawtooth'?.05:.13,t+.01);e.gain.exponentialRampToValueAtTime(.0001,t+dd);o.connect(e);e.connect(AU.mus);o.start(t);o.stop(t+dd+.05)}
/* plays a song through the music volume. The music box loop stays quiet while a song plays. */
function songPlay(s,loop){songStop();if(!s||!Array.isArray(s.notes)||!s.notes.length)return;auInit();if(!AU.c)return;const cols={};s.notes.forEach(n=>{(cols[n[0]]=cols[n[0]]||[]).push(n)});
  const P=AU.song={step:0,next:AU.c.currentTime+.15,cols,dur:30/(s.bpm||120),len:s.len||32,loop:!!loop};
  P.iv=setInterval(()=>{const c=AU.c;if(AU.song!==P)return;while(P.next<c.currentTime+.3){(P.cols[P.step]||[]).forEach(nn=>String(nn[2]).split('+').forEach(part=>{const ac=part.slice(-1),acc=ac==='#'?1:ac==='b'?-1:0;songNote(acc?part.slice(0,-1):part,(BROWS[nn[1]]||60)+acc,P.next,P.dur)}));P.next+=P.dur;P.step++;
    if(P.step>=P.len){if(P.loop)P.step=0;else{clearInterval(P.iv);setTimeout(()=>{if(AU.song===P)AU.song=null},P.dur*1000+500);break}}}},60)}
function songStop(){if(AU.song){clearInterval(AU.song.iv);AU.song=null}}
const musicList=()=>LIB.filter(a=>a.type==='music'&&a.data);
function bbdWin(){const f=$('#ovlBox iframe');try{return f&&f.contentWindow&&f.contentDocument?f:null}catch(e){return null}}
function consoleSaveDlg(){dlg('<h2>💾 Save to Studio</h2><p>Keep something from the console in your Toy Box.</p><button class="les" id="csS"><span>🎵 Save this song<small>The song in Beat Bop Doodle now, as music for your levels</small></span><i>▶</i></button><button class="les" id="csP"><span>📸 Snap the screen<small>A picture of the game screen, as a sticker</small></span><i>▶</i></button><div class="btns"><button class="alt" id="dNo">Close</button></div>',d=>{d.querySelector('#csS').onclick=()=>{SFX.tick();saveConsoleSong()};d.querySelector('#csP').onclick=()=>{SFX.tick();snapConsole()};d.querySelector('#dNo').onclick=closeDlg})}
function readConsoleSong(){const f=bbdWin();let s=null;try{if(f&&typeof f.contentWindow.songData==='function')s=f.contentWindow.songData()}catch(e){}if(!s){try{s=JSON.parse(localStorage.getItem('ds_song2')||'null')}catch(e){}}return songClean(s)}
function saveConsoleSong(){const s=readConsoleSong();if(!s){toast('This song has no notes yet. Make a song first!');closeDlg();return}const n=musicList().length+1;
  dlg('<h2>🎵 Save this song</h2><p>'+s.notes.length+' notes · '+s.bpm+' beats a minute · about '+songSecs(s)+' seconds</p><label class="lb" for="msN">Name</label><input type="text" id="msN" maxlength="24" value="Console song '+n+'"><div class="btns"><button class="alt" id="dNo">Cancel</button><button id="dYes">💾 Into the Toy Box</button></div>',d=>{d.querySelector('#dNo').onclick=closeDlg;d.querySelector('#dYes').onclick=()=>{const nm=(d.querySelector('#msN').value||'Console song '+n).trim().slice(0,24);
    const a={id:newAid(),name:nm,type:'music',tags:['console'],date:Date.now(),data:s,thumb:musicThumb(s)};LIB.push(a);if(!saveLib()){LIB.pop();toast('Storage is full. Remove something first.');return}SFX.collect();updBadge();closeDlg();toast(nm+' is in the Toy Box. Pick it as level music in Make a Level.')}})}
/* the screenshot: the biggest visible game canvas in the console (canvases stacked on the same spot are combined), framed as a sticker */
function snapConsole(){const f=bbdWin();if(!f){toast('Open the console first');closeDlg();return}let groups=new Map();try{const doc=f.contentDocument;[...doc.querySelectorAll('canvas')].forEach(c=>{const r=c.getBoundingClientRect();if(r.width<40||r.height<30||!c.offsetParent||c.width<2)return;const st=f.contentWindow.getComputedStyle(c);if(st.visibility==='hidden'||+st.opacity===0)return;const k=[r.left,r.top,r.width,r.height].map(Math.round).join(',');if(!groups.has(k))groups.set(k,{r,cs:[]});groups.get(k).cs.push(c)})}catch(e){groups=new Map()}
  let best=null;groups.forEach(gp=>{if(!best||gp.r.width*gp.r.height>best.r.width*best.r.height)best=gp});if(!best){toast('There is no game screen to snap here. Open a screen with a picture.');closeDlg();return}
  const sc=Math.min(2,340/Math.max(best.r.width,best.r.height)),iw=Math.round(best.r.width*sc),ih=Math.round(best.r.height*sc),B=8,c=mkCanvas(iw+B*2,ih+B*2),x=c._x;
  try{x.fillStyle='#fff';rr(x,0,0,iw+B*2,ih+B*2,10);x.fill();x.save();rr(x,B,B,iw,ih,4);x.clip();x.fillStyle='#000';x.fillRect(B,B,iw,ih);x.imageSmoothingEnabled=false;best.cs.forEach(cc=>x.drawImage(cc,B,B,iw,ih));x.restore();var src=c.toDataURL()}catch(e){toast('Could not snap this screen');closeDlg();return}
  const n=TOYS.filter(t=>/^Console shot/.test(t.name)).length+1,toy={id:'t'+Date.now().toString(36),name:'Console shot '+n,w:c.width,h:c.height,beh:'scenery',act:'none',parts:[{src,x:0,y:0,w:c.width,h:c.height,parent:-1,px:0,py:0,z:0}]};
  dlg('<h2>📸 Snap the screen</h2><canvas class="pv" id="pv"></canvas><label class="lb" for="ssN">Name</label><input type="text" id="ssN" maxlength="24" value="'+esc(toy.name)+'"><div class="btns"><button class="alt" id="dNo">Cancel</button><button id="dYes">🏷️ Make it a sticker</button></div>',d=>{thumb(d.querySelector('#pv'),toy);d.querySelector('#dNo').onclick=()=>{delete SPR[toy.id];closeDlg()};
    d.querySelector('#dYes').onclick=()=>{toy.name=(d.querySelector('#ssN').value||toy.name).trim().slice(0,24);TOYS.push(toy);if(!saveToys()){TOYS.pop();toast('Storage is full. Remove something first.');return}libAddToy(toy,'sticker');SFX.collect();updBadge();closeDlg();toast(toy.name+' is in the Toy Box as a sticker')}})}
$('#ovlSave').onclick=()=>{auInit();SFX.tick();consoleSaveDlg()};

/* ================= v1.6c: RETRO 3D ================= */
/* The 3D code lives in r3d.js and three.js (lib/), loaded only the first time you open 3D, so 2D stays as light as before. */
var R3=null,M3STOP=null;
function r3dLoad(){return R3?Promise.resolve(R3):import('./r3d.js').then(m=>(R3=m))}
function open3D(where){if(OVL)return;auInit();nbClose();closeDlg();OVL='r3d';setVol();$('#lobGo').style.display='none';toast('Opening Retro 3D…');
  r3dLoad().then(m=>m.open(where)).then(ok=>{if(ok===false){OVL=null;return}try{history.pushState({sbsTool:'r3d'},'')}catch(e){}}).catch(e=>{console.warn(e);OVL=null;setVol();toast('Retro 3D could not load. Check the connection and try again.')})}
/* Make it 3D (T033): every piece stands up in Retro 3D as a thick cardboard standee with no extra steps. The menu turns it into more 3D:
   Standee (default, toy.m3d unset), Puff (inflated like clay or a pillow, 'clay'), Fold (papercraft, 'paper'), Two sides ('two': the front drawing
   in front and the Flip-paper back behind; a one-sided piece borrows a back from the Toy Box, toy.m3dBack = its id). A greyed Mythic Forge model
   choice waits for the Forge station. The ids 'paper' and 'clay' are kept from v1.6c so old saves keep their look. Little Town 3D uses it. */
const M3D={flat:{em:'🪧',name:'Standee',tip:'A thick cardboard stand-up. Every piece starts like this.'},clay:{em:'🫓',name:'Puff',tip:'Puffs up like clay or a pillow: round in the middle, thin at the edges.'},paper:{em:'📦',name:'Fold',tip:'Folds up out of the paper into a thick layered papercraft with a stand.'},two:{em:'🔄',name:'Two sides',tip:'Your drawing in front, the back of the paper behind.'},forge:{em:'🐉',name:'Mythic Forge',tip:'Coming with the Forge station: a model made in Mythic Forge.',off:1}};
function m3dDlg(toy){let st=M3D[toy.m3d]&&!M3D[toy.m3d].off?toy.m3d:'flat',back=toy.m3dBack||'';
  const backs=()=>TOYS.filter(t=>t.id!==toy.id&&!t.road&&t.parts&&t.parts.length),
    tipOf=k=>k==='two'?(toy.sheet?'Your drawing in front, the back of the paper (Flip) behind.':'This piece has one side. Pick a back from the Toy Box, or flip the paper at the School Desk and draw on the back.'):M3D[k].tip;
  const show=()=>{if(M3STOP){M3STOP();M3STOP=null}const c=$('#pv3');if(!c)return;const n=c.cloneNode();c.replaceWith(n);const t2=Object.assign({},toy,{m3dBack:back||undefined});r3dLoad().then(m=>m.preview(n,t2,st)).then(stop=>{if($('#pv3')===n)M3STOP=stop;else stop()}).catch(()=>toast('3D could not load'))};
  const pick='<div id="m3back" style="display:'+(st==='two'&&!toy.sheet?'block':'none')+';margin-top:6px"><select id="m3bs" style="width:100%;padding:8px;border-radius:10px;font-weight:800"><option value="">Back: plain cardboard</option>'+backs().map(t=>'<option value="'+t.id+'"'+(t.id===back?' selected':'')+'>Back: '+esc(t.name)+'</option>').join('')+'</select></div>';
  dlg('<h2>🧊 Make it 3D</h2><canvas class="pv3" id="pv3"></canvas><div class="m3s">'+Object.keys(M3D).map(k=>'<button data-s="'+k+'" class="'+(k===st?'on':'')+(M3D[k].off?' off':'')+'"'+(M3D[k].off?' aria-disabled="true"':'')+'>'+M3D[k].em+'<br>'+M3D[k].name+'</button>').join('')+'</div>'+pick+'<p id="m3tip" style="font-size:12.5px;margin:6px 0 0">'+tipOf(st)+'</p><p style="font-size:12px;opacity:.75;margin:4px 0 0">You see it this way in Retro 3D, in town. 2D stays the same.</p><div class="btns"><button class="alt" id="dNo">Cancel</button><button id="dYes">Save</button></div>',d=>{
    d.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{const k=b.dataset.s;if(M3D[k].off){SFX.tick();d.querySelector('#m3tip').textContent=M3D[k].tip;return}st=k;SFX.tick();d.querySelectorAll('[data-s]').forEach(x=>x.classList.toggle('on',x===b));d.querySelector('#m3tip').textContent=tipOf(st);d.querySelector('#m3back').style.display=st==='two'&&!toy.sheet?'block':'none';show()});
    d.querySelector('#m3bs').onchange=e=>{back=e.target.value;SFX.tick();show()};
    d.querySelector('#dNo').onclick=closeDlg;d.querySelector('#dYes').onclick=()=>{if(st==='flat')delete toy.m3d;else toy.m3d=st;if(st==='two'&&!toy.sheet&&back)toy.m3dBack=back;else delete toy.m3dBack;if(R3&&R3.forget)R3.forget(toy.id);saveToys();closeDlg();SFX.thud();toast(toy.name+': '+M3D[st].name+' in Retro 3D')};setTimeout(show,30)})}

/* ================= START-UP (runs once every file above is loaded; Art Swap below wraps the draw functions afterwards, as before the split) ================= */

resize();
loadDesk();
cpEnsureToys();
libInit();
cpLib();
/* T034 */
SCR='title';
showScr();
updBadge();
requestAnimationFrame(frame);

/* ================= ART SWAP (T022) =================
   A checklist of every piece of default art (ART_SLOTS), each with a template (Make it), a way to swap in a Toy Box piece
   (Use a piece), and an art pack export/import. Swaps are saved as ONE map, craftloft_artswap = {slot id: copy of the toy},
   so deleting a Toy Box piece never breaks a swap. Order when drawing: the player's own swap, then art/default-pack.json
   (if the repo has one), then the code-made art. Every slotted drawing goes through the hooks below (asFit / asCover).
   RULE for later orders: any order that adds default art also adds an Art Swap slot for it (see HANDOFF.md). */
const AS={mine:{},ok:LS.get('artswap_ok',{}),def:{},prev:{},guide:null,box:{},th:{},f:'all'};
(()=>{const m=LS.get('artswap',{});if(m&&typeof m==='object')for(const k in m){const t=asClean(m[k],k);if(t)AS.mine[k]=t}})();
function asClean(t,id){const c=toyClean(t);if(!c)return null;c.id='sw_'+id;c.name=String(t.name||'Swap').slice(0,24);if(t.med)c.med=medCopy(t.med);if(typeof t.uipx==='string'&&t.uipx.length===256)c.uipx=t.uipx;delete c.starter;delete c.show;return c}
function asGet(id){return AS.mine[id]||AS.def[id]||null}
function asReady(id){const t=asGet(id);return !!(t&&sprite(t).ready)}
/* fit the swapped piece in a box: 'contain' sits it on the bottom edge (things that stand), 'cover' fills the box (backgrounds) */
function asFit(id,c,x,y,w,h,mode){const t=asGet(id);if(!t||!sprite(t).ready)return false;const sc=mode==='cover'?Math.max(w/t.w,h/t.h):Math.min(w/t.w,h/t.h);c.save();if(mode==='cover'){c.beginPath();c.rect(x,y,w,h);c.clip()}c.translate(x+(w-t.w*sc)/2,mode==='mid'||mode==='cover'?y+(h-t.h*sc)/2:y+h-t.h*sc);c.scale(sc,sc);_asDrawToy(c,t,NOW/1000,0);c.restore();return true}
const asCover=(id,c,x,y,w,h)=>asFit(id,c,x,y,w,h,'cover');
/* the box an original drawing fills, measured from the code (origin = the thing's feet) */
function asMeasure(fn){const S=760,c=mkCanvas(S,S,true),x=c._x;x.translate(S/2,S*.72);try{fn(x)}catch(e){}const d=x.getImageData(0,0,S,S).data;let x0=S,y0=S,x1=-1,y1=-1;for(let yy=0;yy<S;yy+=2)for(let xx=0;xx<S;xx+=2)if(d[(yy*S+xx)*4+3]>10){if(xx<x0)x0=xx;if(xx>x1)x1=xx;if(yy<y0)y0=yy;if(yy>y1)y1=yy}if(x1<0)return{x:-40,y:-80,w:80,h:80};return{x:x0-S/2-1,y:y0-S*.72-1,w:x1-x0+3,h:y1-y0+3}}
function asBox(id,fn){return AS.box[id]||(AS.box[id]=asMeasure(fn))}
/* ---- the hooks: every slotted drawing goes through one of these ---- */
const _asDrawToy=drawToy;
drawToy=function(c,toy,t,swing){if(toy&&typeof toy.id==='string'&&/^(starter_|show_|cp_|cps_)/.test(toy.id)){const sw=asGet(toy.id);/* T034: cp_ and cps_ are content pack pieces */if(sw&&sprite(sw).ready){const sc=Math.min(toy.w/sw.w,toy.h/sw.h);c.save();c.translate((toy.w-sw.w*sc)/2,toy.road?(toy.h-sw.h*sc)/2:toy.h-sw.h*sc);c.scale(sc,sc);_asDrawToy(c,sw,t,swing);c.restore();return true}}return _asDrawToy(c,toy,t,swing)};
const AS_STN={};
Object.keys(STATION_DRAW).forEach(k=>{const o=AS_STN[k]=STATION_DRAW[k];STATION_DRAW[k]=function(c){const id='stn_'+k;if(asGet(id)&&asReady(id)){const b=asBox(id,o);c.save();c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(b.x+b.w/2,3,b.w*.45,9,0,0,TAU);c.fill();c.restore();asFit(id,c,b.x,b.y,b.w,b.h);return}o(c)}});
const _asTS=drawTownStudio,_asTH=drawTownHouse,_asTSu=drawTownSupply;
function asBld(id,o,c,p,tag){if(!asReady(id))return false;const b=asBox(id,x=>o(x,{x:0,y:0},''));c.save();c.translate(p.x,p.y);c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(0,2,b.w*.45,14,0,0,TAU);c.fill();asFit(id,c,b.x,b.y,b.w,b.h);if(tag){c.font='800 12px system-ui';c.textAlign='center';c.fillStyle='rgba(0,0,0,.55)';c.fillText(tag,0,22)}c.restore();return true}
drawTownStudio=function(c,p,tag){if(!asBld('bld_studio',_asTS,c,p,tag))_asTS(c,p,tag)};
drawTownHouse=function(c,p,tag){if(!asBld('bld_house',_asTH,c,p,tag))_asTH(c,p,tag)};
drawTownSupply=function(c,p,tag){if(!asBld('bld_supply',_asTSu,c,p,tag))_asTSu(c,p,tag)};/* T032 */
const _asLB=LOB.bg,_asHB=HOUSE.bg;
LOB.bg=function(){if(asReady('room_lobby')){g.fillStyle='#3e2a1e';g.fillRect(-600,-900,LOB.W+1200,LOB.H+1300);asCover('room_lobby',g,0,0,LOB.W,LOB.H)}else _asLB()};
HOUSE.bg=function(){if(asReady('room_house')){g.fillStyle='#4a3324';g.fillRect(-600,-900,HOUSE.W+1200,HOUSE.H+1300);asCover('room_house',g,0,0,HOUSE.W,HOUSE.H)}else _asHB()};
for(const k in SHOPS){const R=SHOPS[k].room,o=R.bg,id='room_shop_'+k;R.bg=function(){if(asReady(id)){g.fillStyle='#3e2a1e';g.fillRect(-600,-900,R.W+1200,R.H+1300);asCover(id,g,0,0,R.W,R.H)}else o()}}/* T032 */
const _asHero=drawHero;
drawHero=function(c,x,y,face,ph,air){if(!asReady('char_hero'))return _asHero(c,x,y,face,ph,air);const b=asBox('char_hero',q=>_asHero(q,0,0,1,0,false));c.save();c.translate(x,y);c.scale(face,1);c.rotate(Math.sin(ph||0)*(air?.03:.09));asFit('char_hero',c,b.x,b.y,b.w,b.h);c.restore()};
const _asPet=drawPet;
drawPet=function(c,x,y){const k=PET.kind,id='char_'+k;if(k==='none'||!PET.ok||!asReady(id))return _asPet(c,x,y);const b=asBox(id,q=>asPetAs(k,()=>_asPet(q,0,0)));c.save();c.translate(x,y);c.scale(PET.face,1);c.rotate(Math.sin(PET.ph||0)*.09);asFit(id,c,b.x,b.y,b.w,b.h);c.restore()};
function asPetAs(k,fn){const o={kind:PET.kind,ok:PET.ok,face:PET.face,ph:PET.ph};PET.kind=k;PET.ok=true;PET.face=1;PET.ph=0;try{fn()}finally{Object.assign(PET,o)}}
const _asHand=drawHand;
drawHand=function(c,x,y,press){if(!asReady('char_hand'))return _asHand(c,x,y,press);const b=asBox('char_hand',q=>_asHand(q,0,0,false));c.save();c.translate(x,y+(press?3:0));asFit('char_hand',c,b.x,b.y,b.w,b.h,'mid');c.restore()};
const _asHome=drawHome;
drawHome=function(){_asHome();if(Object.keys(AS.def).length){g.save();g.font='800 13px system-ui';g.textAlign='center';g.textBaseline='alphabetic';g.fillStyle='rgba(255,255,255,.85)';g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=3;g.fillText('Art by MajorasPride',W/2,H-40);g.restore()}};
const _asMkPart=mkPart;
mkPart=function(kind,i){const p=_asMkPart(kind,i),t=asGet('ui_'+kind+'_'+(i||0));if(t&&t.uipx)p.px=pxFinish(t.uipx.split(''));return p};
const _asEx=exDraw;
exDraw=function(e,c,w,h){if(asReady(e.id)){c.save();c.fillStyle='#fbf8f0';if(e.lesson!=='fridge')c.fillRect(0,0,w,h);asFit(e.id,c,0,0,w,h,'mid');c.restore();return}_asEx(e,c,w,h)};
/* a quantized copy of a swap, for the Pixel UI Kit presets (16 x 16, the preset's own palette) */
function asUiPx(t,pal){const N=16,c=mkCanvas(N,N,true),x=c._x,s=sprite(t);if(!s.ready)return null;const sc=Math.min(N/t.w,N/t.h);x.translate((N-t.w*sc)/2,(N-t.h*sc)/2);x.scale(sc,sc);_asDrawToy(x,t,0,0);const d=x.getImageData(0,0,N,N).data,P=pal.map(hexRGB);let o='';for(let i=0;i<N*N;i++){if(d[i*4+3]<110){o+='.';continue}let b=0,bd=1e9;P.forEach((q,j)=>{const dd=(q[0]-d[i*4])**2+(q[1]-d[i*4+1])**2+(q[2]-d[i*4+2])**2;if(dd<bd){bd=dd;b=j}});o+=String(b)}return o}
/* draw a room or screen the way Retro 3D does: on the main canvas for a moment, then copy it */
function asSnap(fn,RW,RH,c,w,h){const k=Math.min(cv.width/RW,cv.height/RH,1);g.save();g.setTransform(k,0,0,k,0,0);g.clearRect(0,0,RW,RH);try{fn()}catch(e){}g.restore();c.drawImage(cv,0,0,RW*k,RH*k,0,0,w,h)}
/* ---- the list of slots, built from the code ---- */
let ART_SLOTS=null;
function asSlots(){if(ART_SLOTS)return ART_SLOTS;const L=[],add=o=>L.push(o);
  const toyDraw=t=>(c,w,h)=>{const sc=Math.min(w/t.w,h/t.h);c.save();c.translate((w-t.w*sc)/2,(h-t.h*sc)/2);c.scale(sc,sc);drawToy(c,t,0,0);c.restore()};
  mkStarters().forEach(t=>{const tt=toyById(t.id)||t;add({id:t.id,name:t.name,group:'Starter pieces',kind:'toy',toy:tt,w:t.w,h:t.h,where:'Starter piece in the Toy Box, levels and Little Town',draw:toyDraw(tt)})});
  mkShowToys().forEach(t=>{const tt=toyById(t.id)||t;add({id:t.id,name:t.name,group:'Showcase town',kind:'toy',toy:tt,w:t.w,h:t.h,where:'The showcase town in Little Town',draw:toyDraw(tt)})});
  const stn=(list,grp,where)=>list.forEach(s=>{const id='stn_'+s.id;if(L.some(x=>x.id===id)||!AS_STN[s.id])return;const b=asBox(id,AS_STN[s.id]);add({id,name:s.name,group:grp,kind:'station',w:b.w,h:b.h,where,draw:(c,w,h)=>{c.save();c.scale(w/b.w,h/b.h);c.translate(-b.x,-b.y);STATION_DRAW[s.id](c);c.restore()}})});
  stn(STATIONS,'Studio stations','The studio, and the studio in Retro 3D');stn(HOUSE.stn,'House stations','My House, and the house in Retro 3D');for(const k in SHOPS)stn(SHOPS[k].room.stn,SHOPS[k].name+' stations','Inside the '+SHOPS[k].name+', and in Retro 3D');/* T032 */
  [['bld_studio','Shoebox Studio building',_asTS,drawTownStudio],['bld_house','My House building',_asTH,drawTownHouse],['bld_supply','Supply Store building',_asTSu,drawTownSupply]].forEach(([id,name,o,cur])=>{const b=asBox(id,x=>o(x,{x:0,y:0},''));add({id,name,group:'Buildings in town',kind:'building',w:b.w,h:b.h,where:'Little Town, 2D and Retro 3D',draw:(c,w,h)=>{c.save();c.scale(w/b.w,h/b.h);c.translate(-b.x,-b.y);cur(c,{x:0,y:0},'');c.restore()}})});
  const wood=(c,w,h,dim)=>{c.fillStyle=c.createPattern(WOOD,'repeat');c.fillRect(0,0,w,h);if(dim){c.fillStyle='rgba(60,35,15,'+dim+')';c.fillRect(0,0,w,h)}};
  add({id:'room_lobby',name:'Studio room',group:'Rooms and backgrounds',kind:'room',w:LOB.W,h:LOB.H,where:'The studio walls and floor (2D and 3D)',draw:(c,w,h)=>asSnap(()=>{const R0=RM;RM=LOB;LOB.bg();RM=R0},LOB.W,LOB.H,c,w,h)});
  add({id:'room_house',name:'House room',group:'Rooms and backgrounds',kind:'room',w:HOUSE.W,h:HOUSE.H,where:'Inside My House (2D and 3D)',draw:(c,w,h)=>asSnap(()=>{const R0=RM;RM=HOUSE;HOUSE.bg();RM=R0},HOUSE.W,HOUSE.H,c,w,h)});
  for(const k in SHOPS){const R=SHOPS[k].room;add({id:'room_shop_'+k,name:SHOPS[k].name+' room',group:'Rooms and backgrounds',kind:'room',w:R.W,h:R.H,where:'Inside the '+SHOPS[k].name+' (2D and 3D)',draw:(c,w,h)=>asSnap(()=>{const R0=RM;RM=R;R.bg();RM=R0},R.W,R.H,c,w,h)})}/* T032 */
  add({id:'room_desk',name:'School Desk table',group:'Rooms and backgrounds',kind:'room',w:1320,h:1600,where:'The table top at the School Desk',draw:(c,w,h)=>{if(!asCover('room_desk',c,0,0,w,h))wood(c,w,h)}});
  add({id:'room_title',name:'Title screen',group:'Rooms and backgrounds',kind:'room',w:800,h:600,where:'Behind the SHOEBOX STUDIO title',draw:(c,w,h)=>{if(!asCover('room_title',c,0,0,w,h)){wood(c,w,h,.12);c.fillStyle='#fff';c.font='900 '+Math.round(h*.16)+'px ui-rounded,system-ui';c.textAlign='center';c.fillText('SHOEBOX',w/2,h*.42);c.fillText('STUDIO',w/2,h*.62)}}});
  add({id:'room_town',name:'Little Town table',group:'Rooms and backgrounds',kind:'room',w:1000,h:700,where:'The wooden table around Little Town',draw:(c,w,h)=>{if(!asCover('room_town',c,0,0,w,h))wood(c,w,h,.25)}});
  const ch=(id,name,where,fn)=>{const b=asBox(id,fn);add({id,name,group:'Characters',kind:'character',w:b.w,h:b.h,where,draw:(c,w,h)=>{c.save();c.scale(w/b.w,h/b.h);c.translate(-b.x,-b.y);if(id==='char_hero')drawHero(c,0,0,1,0,false);else if(id==='char_hand')drawHand(c,0,0,false);else asPetAs(id.slice(5),()=>drawPet(c,0,0));c.restore()}})};
  ch('char_hero','Hero','You, walking around the studio, house and town',q=>_asHero(q,0,0,1,0,false));
  ['dog','chicken','cat'].forEach(k=>ch('char_'+k,PETS[k][1],'Your companion when you pick the '+PETS[k][1].toLowerCase(),q=>asPetAs(k,()=>_asPet(q,0,0))));
  ch('char_hand','Player Hand','The hand that sets paper on the School Desk',q=>_asHand(q,0,0,false));
  Object.keys(UI_PRESETS).forEach(kind=>UI_PRESETS[kind].forEach((pr,i)=>add({id:'ui_'+kind+'_'+i,name:pr.name,group:'Pixel UI Kit presets',kind:'ui',w:128,h:128,pal:pr.pal,where:'Pixel UI Kit, preset '+(i+1)+' for '+kind+' parts',draw:(c,w,h)=>{const t=asGet('ui_'+kind+'_'+i),px=t&&t.uipx?t.uipx:pr.px().join(''),cs=Math.min(w,h)/16;c.save();c.imageSmoothingEnabled=false;for(let j=0;j<256;j++){const ch2=px[j];if(ch2==='.'||ch2==null)continue;c.fillStyle=pr.pal[+ch2]||'#000';c.fillRect((j%16)*cs,Math.floor(j/16)*cs,Math.ceil(cs),Math.ceil(cs))}c.restore()}})));
  const exName=e=>{const l=CLASS.flatMap(b=>b.lessons).find(x=>x.id===e.lesson);return l?l.name:e.lesson};
  EXAMPLES.forEach(e=>{if(e.lesson==='fridge'){const f=EXFRIDGE[e.step];add({id:e.id,name:f.name,group:'Fridge Gallery examples',kind:'example',w:f.w,h:f.h,where:'On the fridge in the studio',draw:(c,w,h)=>exDraw(e,c,w,h)})}
    else add({id:e.id,name:e.step?exName(e)+', step '+e.step:exName(e),group:e.step?'Lesson step pictures':'Lesson pictures',kind:'example',w:EXW,h:EXH,where:e.step?'Art Class, '+exName(e)+', the picture for step '+e.step:'Art Class, the finished picture for '+exName(e),draw:(c,w,h)=>exDraw(e,c,w,h)})});
  add({id:'vhs_cloth',name:'Cloth backdrop',group:'VHS spot',kind:'vhs',w:400,h:300,where:'The hanging cloth the VHS tapes play on',draw:(c,w,h)=>{if(!asCover('vhs_cloth',c,0,0,w,h)){c.fillStyle='#efe6d2';c.fillRect(0,0,w,h);c.fillStyle='rgba(120,90,50,.12)';for(let i=0;i<8;i++)c.fillRect(w*(i+.4)/8,0,w*.03,h)}}});
  TAPE_LABELS.forEach((lb,i)=>add({id:'vhs_label_'+i,name:lb.name+' label',group:'VHS spot',kind:'vhs',w:160,h:44,where:'Tape labels on the VHS shelf and player',draw:(c,w,h)=>drawLabel(c,{p:i},'My tape',0,0,w,h)}));
  cpSlots(add,toyDraw);/* T034 */
  ART_SLOTS=L;return L}
const asDone=id=>!!(AS.mine[id]||AS.ok[id]);
function asSave(){if(!LS.set('artswap',AS.mine)){toast('Storage is full. Remove something first.');return false}LS.set('artswap_ok',AS.ok);return true}
function asClearCaches(id){for(const k in EXC)if(!id||k.startsWith(id+'_'))delete EXC[k];for(const k in EXTOY)delete EXTOY[k];delete AS.th[id];if(id)delete SPR['sw_'+id]}
function asWait(t){return new Promise(r=>{const s=sprite(t),tk=n=>{if(s.ready||n>80)r(s.ready);else setTimeout(()=>tk(n+1),60)};tk(0)})}
async function asSet(id,toy){const sl=asSlots().find(s=>s.id===id);if(!sl)return;const c=asClean(JSON.parse(JSON.stringify(toy)),id);if(!c){toast('That piece cannot be used');return}const old=AS.mine[id];AS.prev[id]=old||null;delete SPR[c.id];AS.mine[id]=c;await asWait(c);if(sl.kind==='ui'){const px=asUiPx(c,sl.pal);if(px)c.uipx=px}if(!asSave()){if(old)AS.mine[id]=old;else delete AS.mine[id];return}asClearCaches(id);SFX.thwap();toast(sl.name+' now uses '+c.name)}
function asUnset(id,toPrev){const p=AS.prev[id];if(toPrev&&p)AS.mine[id]=p;else delete AS.mine[id];delete AS.prev[id];asSave();asClearCaches(id)}
/* the default pack from the repo (art/default-pack.json), if there is one */
function asLoadDefault(){try{fetch('art/default-pack.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(o=>{if(!o||o.format!=='shoebox-art-pack'||!o.swaps)return;const d={};for(const k in o.swaps){const t=asClean(o.swaps[k],k);if(t)d[k]=t}AS.def=d;Object.values(d).forEach(t=>asWait(t).then(()=>asClearCaches()))}).catch(()=>{})}catch(e){}}
asLoadDefault();
Object.values(AS.mine).forEach(t=>asWait(t).then(()=>{for(const k in EXC)delete EXC[k];for(const k in EXTOY)delete EXTOY[k]}));
/* ---- the Art Swap board (its own station in the studio, plus Quick jump) ---- */
function asThumb(sl,cvs){const W2=112,H2=84;cvs.width=W2;cvs.height=H2;const x=cvs.getContext('2d');if(AS.th[sl.id]){x.drawImage(AS.th[sl.id],0,0);return}
  if(sl.kind==='toy'){thumb(cvs,sl.toy);return}const t=mkCanvas(W2,H2);const sc=Math.min(W2/sl.w,H2/sl.h),w=sl.w*sc,h=sl.h*sc;t._x.save();t._x.translate((W2-w)/2,(H2-h)/2);try{sl.draw(t._x,w,h)}catch(e){}t._x.restore();if(!(asGet(sl.id)&&!asReady(sl.id)))AS.th[sl.id]=t;x.drawImage(t,0,0)}
function artSwapOpen(){const S=asSlots(),done=S.filter(s=>asDone(s.id)).length,groups=[...new Set(S.map(s=>s.group))],show=s=>AS.f==='all'||(AS.f==='done')===asDone(s.id);
  dlg('<h2>🖼️ Art Swap</h2><p style="margin:0 0 6px;font-size:13px">Every piece of default art in the game. Make your own over a template, or swap in a piece from your Toy Box. Your art pack can become the art every new player starts with.</p><div class="asTop"><b>'+done+' of '+S.length+' replaced</b><span class="asF">'+[['all','All'],['todo','To do'],['done','Done']].map(f=>'<button data-f="'+f[0]+'" class="'+(AS.f===f[0]?'on':'')+'">'+f[1]+'</button>').join('')+'</span></div><div class="asB">'+
    groups.map(gn=>{const l=S.filter(s=>s.group===gn&&show(s));if(!l.length)return'';return'<h3>'+esc(gn)+' <small>'+S.filter(s=>s.group===gn&&asDone(s.id)).length+'/'+S.filter(s=>s.group===gn).length+'</small></h3><div class="asRow">'+l.map(s=>'<button data-s="'+s.id+'"><i></i><canvas></canvas><span>'+esc(s.name)+'</span>'+(asDone(s.id)?'<b>✓</b>':'')+'</button>').join('')+'</div>'}).join('')+
    '</div><div class="btns"><button class="alt" id="asX">⬇️ Export my art pack</button><button class="alt" id="asI">⬆️ Import art pack</button><button class="bad" id="asR">Reset all</button><button id="dNo">Back to the studio</button></div>',d=>{
    d.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{AS.f=b.dataset.f;SFX.tick();artSwapOpen()});
    const btns=[...d.querySelectorAll('[data-s]')];let i=0;const step=()=>{if(!d.isConnected||$('#dlgIn')!==d)return;for(let n=0;n<6&&i<btns.length;n++,i++){const b=btns[i];asThumb(S.find(s=>s.id===b.dataset.s),b.querySelector('canvas'))}if(i<btns.length)setTimeout(step,16)};step();
    btns.forEach(b=>b.onclick=()=>{SFX.tick();asCard(S.find(s=>s.id===b.dataset.s))});
    d.querySelector('#asX').onclick=()=>{if(!Object.keys(AS.mine).length){toast('Nothing swapped yet');return}download('shoebox-art-pack.json',asPack())};
    d.querySelector('#asI').onclick=()=>{SFX.tick();asImportDlg()};
    d.querySelector('#asR').onclick=()=>ask('Reset all the art?','Every swap you made goes back to the default art. Your Toy Box pieces stay.','Reset all',()=>{AS.mine={};AS.ok={};AS.prev={};asSave();asClearCaches();AS.th={};toast('All art is back to the default');artSwapOpen()});
    d.querySelector('#dNo').onclick=closeDlg})}
function asCard(sl){const mine=!!AS.mine[sl.id],def=!!AS.def[sl.id];
  dlg('<h2>'+esc(sl.name)+'</h2><canvas class="pv" id="pv"></canvas><p style="margin:6px 0 2px;font-size:12.5px"><b>Shows in:</b> '+esc(sl.where)+'</p><p style="margin:0 0 4px;font-size:12.5px;opacity:.8">'+(mine?'Using your piece: '+esc(AS.mine[sl.id].name):def?'Using the default art pack':'Using the code-made art')+'</p>'+
   '<div class="btns"><button id="aM">✏️ Make it</button><button class="alt" id="aU">🧸 Use a piece</button>'+(mine?'<button class="alt" id="aZ">↩️ Undo swap</button>':'')+(mine&&def?'<button class="alt" id="aD">Reset to default</button>':'')+'<button class="alt" id="aK">'+(AS.ok[sl.id]?'☑️ Happy with this one':'⬜ I\'m happy with this one')+'</button><button class="alt" id="aB">◀ Board</button></div>',d=>{
   const pv=d.querySelector('#pv');if(sl.kind==='toy')thumb(pv,sl.toy);else{const sc=Math.min(320/sl.w,240/sl.h,3);pv.width=Math.max(40,sl.w*sc);pv.height=Math.max(30,sl.h*sc);sl.draw(pv.getContext('2d'),pv.width,pv.height)}
   d.querySelector('#aM').onclick=()=>{SFX.tick();asMake(sl)};d.querySelector('#aU').onclick=()=>{SFX.tick();asPick(sl)};
   if(mine)d.querySelector('#aZ').onclick=()=>{asUnset(sl.id,true);SFX.tick();toast('Swap undone');asCard(sl)};
   if(mine&&def)d.querySelector('#aD').onclick=()=>{asUnset(sl.id,false);SFX.tick();toast('Back to the default art');asCard(sl)};
   d.querySelector('#aK').onclick=()=>{if(AS.ok[sl.id])delete AS.ok[sl.id];else AS.ok[sl.id]=1;asSave();SFX.tick();asCard(sl)};
   d.querySelector('#aB').onclick=()=>{SFX.tick();artSwapOpen()}})}
/* Use a piece: any Toy Box piece, with the medium filter */
function asPick(sl,med){const list=LIB.filter(a=>a.ref&&toyById(a.ref)&&!/^(starter_|show_)/.test(a.ref)),used=[...new Set(list.flatMap(a=>{const t=toyById(a.ref);return t.med&&t.med.m?t.med.m:[]}))].filter(m=>MEDIA[m]),sh=list.filter(a=>!med||((toyById(a.ref).med||{}).m||[]).includes(med));
  dlg('<h2>Use a piece for '+esc(sl.name)+'</h2>'+(used.length?'<div class="asF" style="margin-bottom:8px"><button data-m="" class="'+(med?'':'on')+'">All</button>'+used.map(m=>'<button data-m="'+m+'" class="'+(med===m?'on':'')+'">'+MEDIA[m].em+' '+MEDIA[m].name+'</button>').join('')+'</div>':'')+(sh.length?'<div class="asRow asWrap">'+sh.map(a=>'<button data-r="'+a.ref+'"><canvas></canvas><span>'+esc(a.name)+'</span></button>').join('')+'</div>':'<p>No pieces yet. Make one at the School Desk, or tap Make it.</p>')+'<div class="btns"><button class="alt" id="aB">◀ Back</button></div>',d=>{
   d.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{SFX.tick();asPick(sl,b.dataset.m||null)});
   d.querySelectorAll('[data-r]').forEach(b=>{const t=toyById(b.dataset.r);thumb(b.querySelector('canvas'),t);b.onclick=async()=>{await asSet(sl.id,t);asCard(sl)}});
   d.querySelector('#aB').onclick=()=>asCard(sl)})}
/* Make it: a tracing sheet cut to the slot's size, with the current art faint underneath and its outline dotted */
function asMake(sl){dlg('<h2>✏️ Make it: '+esc(sl.name)+'</h2><p style="font-size:13.5px">A sheet of tracing paper the same shape as this piece goes on your desk, with the art that is there now showing faintly through it and its outline dotted.</p><p style="font-size:13.5px"><b>It shows in:</b> '+esc(sl.where)+'.</p><p style="font-size:13.5px">Draw or craft over it with any medium and paper, or start fresh. When you save it to the Toy Box, the game asks to use it for this slot.</p><div class="btns"><button class="alt" id="aB">◀ Back</button><button id="aG">Go to the desk</button></div>',d=>{
  d.querySelector('#aB').onclick=()=>asCard(sl);d.querySelector('#aG').onclick=()=>{closeDlg();go('craft');setTimeout(()=>asSheet(sl),250)}})}
async function asSheet(sl){if(SCR!=='craft')return;if(sl.kind==='toy')await asWait(sl.toy);if(C.pieces.length>=40){toast('The desk is full. Put some pieces in the toy box or the bin.');return}checkpoint();const k=Math.min(450/sl.w,450/sl.h),w=Math.max(60,Math.round(sl.w*k)),h=Math.max(60,Math.round(sl.h*k)),art=mkCanvas(w,h,true);art._x.fillStyle='#ffffff';art._x.fillRect(0,0,w,h);
  const p=newPiece(art,C.view.x,C.view.y,0,'#ffffff');p.y-=1100;C.pieces.push(p);C.sel=p;C.handA={p,t:0,ty:p.y+1100,snd:false};p.med={m:[],stock:'trace'};stockTex(p.art,'trace','#ffffff',p);p.art._url=null;p.dirty=true;
  const gc=mkCanvas(w,h,true);try{sl.draw(gc._x,w,h)}catch(e){}const ring=mkCanvas(w,h,true),rx=ring._x,sil=mkCanvas(w,h,true);sil._x.drawImage(gc,0,0);sil._x.globalCompositeOperation='source-in';sil._x.fillStyle='#2b2f3a';sil._x.fillRect(0,0,w,h);
  [[-2,0],[2,0],[0,-2],[0,2],[-2,-2],[2,2],[-2,2],[2,-2]].forEach(o=>rx.drawImage(sil,o[0],o[1]));rx.globalCompositeOperation='destination-out';rx.drawImage(sil,0,0);for(let i=-h;i<w;i+=8){rx.beginPath();rx.moveTo(i,0);rx.lineTo(i+h,h);rx.lineWidth=3.5;rx.stroke()}
  AS.guide={id:sl.id,p,art:gc,ring};C.cat='draw';C.tool='pencil';renderTabs();toast('Tracing sheet for '+sl.name+' is on the desk')}
function asGuide(c){const G=AS.guide;if(!G||!C.pieces.includes(G.p))return;c.save();c.transform(...pm(G.p));c.globalAlpha=.26;c.drawImage(G.art,0,0,G.p.w,G.p.h);c.globalAlpha=.8;c.drawImage(G.ring,0,0,G.p.w,G.p.h);c.restore()}
function asAfterSave(toy){const G=AS.guide;if(!G)return;const sl=asSlots().find(s=>s.id===G.id);if(!sl)return;
  dlg('<h2>Use it for '+esc(sl.name)+'?</h2><canvas class="pv" id="pv"></canvas><p style="font-size:13px">It was made on the tracing sheet for this slot. It shows in: '+esc(sl.where)+'.</p><div class="btns"><button class="alt" id="dNo">Not now</button><button id="dYes">Use it for this slot</button></div>',d=>{thumb(d.querySelector('#pv'),toy);d.querySelector('#dNo').onclick=closeDlg;d.querySelector('#dYes').onclick=async()=>{closeDlg();AS.guide=null;await asSet(sl.id,toy)}})}
/* art pack export and import */
function asPack(){return{format:'shoebox-art-pack',version:1,app:'Shoebox Studio',exported:new Date().toISOString(),swaps:AS.mine}}
function asImportDlg(){dlg('<h2>Import an art pack</h2><p>Pick a shoebox-art-pack.json file, or paste its text.</p><div class="btns"><button id="aF">📂 Pick a file</button></div><label class="lb" for="aip">Or paste art pack text</label><textarea id="aip" aria-label="Paste art pack text"></textarea><div class="btns"><button class="alt" id="dNo">Cancel</button><button id="aP">Import text</button></div>',d=>{
  d.querySelector('#aF').onclick=()=>{let f=$('#asFile');if(!f){f=document.createElement('input');f.type='file';f.id='asFile';f.accept='.json,application/json';f.style.display='none';document.body.append(f);f.addEventListener('change',()=>{const x=f.files&&f.files[0];if(!x)return;if(x.size>20e6){toast('That file is too big');return}const r=new FileReader();r.onload=()=>asImport(String(r.result||''));r.readAsText(x)})}f.value='';f.click()};
  d.querySelector('#dNo').onclick=()=>artSwapOpen();d.querySelector('#aP').onclick=()=>asImport(d.querySelector('#aip').value)})}
function asImport(txt){let o;try{o=JSON.parse(txt)}catch(e){o=null}if(!o||o.format!=='shoebox-art-pack'||!o.swaps||typeof o.swaps!=='object'){toast('That is not a Shoebox Studio art pack');return}const ids=new Set(asSlots().map(s=>s.id)),inc={};for(const k in o.swaps){if(!ids.has(k))continue;const t=asClean(o.swaps[k],k);if(t)inc[k]=t}const n=Object.keys(inc).length;if(!n){toast('No art in that pack fits this game');return}const rep=Object.keys(inc).filter(k=>AS.mine[k]).length;
  ask('Import '+n+' piece'+(n===1?'':'s')+' of art?',rep?rep+' of your own swaps will be replaced by the ones in the pack.':'None of your own swaps are replaced.','Import',async()=>{const old=AS.mine;AS.mine=Object.assign({},AS.mine,inc);for(const k in inc){delete SPR[inc[k].id];await asWait(inc[k]);const sl=asSlots().find(s=>s.id===k);if(sl&&sl.kind==='ui'&&!inc[k].uipx){const px=asUiPx(inc[k],sl.pal);if(px)inc[k].uipx=px}}if(!asSave()){AS.mine=old;return}asClearCaches();AS.th={};SFX.win();toast('Imported '+n+' piece'+(n===1?'':'s')+' of art');artSwapOpen()})}

/* T024: every file is loaded. Taps and keys work from here on (see READY in core.js). Keep this the last line of the last file. */
READY=1;
