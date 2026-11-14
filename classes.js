'use strict';
/* Shoebox Studio: classes.js — Art Class (CLASS) and picture examples (EXAMPLES). */

/* ================= ART CLASS: a learning tree, small steps first ================= */
/* Each lesson is a list of steps. c = which tab to open, tl = which tool, f = fold type. Add branches and lessons here. */
const CLASS=[
 {id:'draw',name:'✏️ Drawing',about:'Lines, shapes, faces and creatures. Start small, then go big.',lessons:[
  {id:'d1',name:'Straight lines and shapes',sub:'Ruler and triangle',steps:[
   {t:'Tap Paper and pick a colour. A hand sets your sheet on the desk.',c:'paper'},
   {t:'This is the Draw tab. Tap Ruler. Slide the ruler with the round + grip and turn it with the ↻ grips.',c:'draw',tl:'pencil'},
   {t:'Put your pencil down right beside the ruler edge and pull along it. The line comes out straight.',c:'draw',tl:'pencil'},
   {t:'Turn the ruler and draw three more lines to close a square. The top marks are inches, the bottom marks are centimetres.',c:'draw',tl:'pencil'},
   {t:'Tap Triangle. Its corner is a perfect right angle (a square corner). Trace two of its sides to get a neat corner.',c:'draw',tl:'pencil'},
   {t:'Your turn: draw a house with only straight lines. A square, a triangle roof, a door. Any way you like.',c:'draw',tl:'pencil'}]},
  {id:'d2',name:'Circles',sub:'Compass and stencil',steps:[
   {t:'Put down a sheet of paper if the desk is empty.',c:'paper'},
   {t:'Tap Compass. Press where the middle of the circle should be, drag outward, and let go. The compass draws the circle.',c:'draw',tl:'compass'},
   {t:'Bigger drag, bigger circle. Draw a big one, then a smaller one sitting on top of it.',c:'draw',tl:'compass'},
   {t:'Tap the Circle stencil. Start your pencil on the inside edge of the hole and go around. The stencil stays put while you draw.',c:'draw',tl:'pencil'},
   {t:'Your turn: turn your circles into a snowman, a caterpillar or a planet with rings.',c:'draw',tl:'pencil'}]},
  {id:'d3',name:'How to draw a face',sub:'The egg and the guide lines',steps:[
   {t:'Put down a light sheet of paper so your pencil shows well.',c:'paper'},
   {t:'Draw a tall egg shape with the pencil, narrow end down. That is the head. Wobbly is fine.',c:'draw',tl:'pencil'},
   {t:'Use the ruler to draw a light line down the middle, and one across the middle. Surprise: the eyes sit halfway down the head, not near the top.',c:'draw',tl:'pencil'},
   {t:'Draw the two eyes on the across line. Leave a gap one eye wide between them.',c:'draw',tl:'pencil'},
   {t:'The bottom of the nose is halfway between the eye line and the chin. The mouth is about a third of the way from the nose to the chin.',c:'draw',tl:'pencil'},
   {t:'Ears go on the sides, from the eye line down to the nose line. Hair starts above the forehead and goes past the egg.',c:'draw',tl:'pencil'},
   {t:'Tap Eraser and rub out the guide lines.',c:'draw',tl:'eraser'},
   {t:'Your turn: draw a second face on a different head shape, round, square or long, and see how the feeling changes.',c:'draw',tl:'pencil'}]},
  {id:'d4',name:'A creature from one shape',sub:'Round, boxy or spiky',steps:[
   {t:'Game creatures usually start as one simple body shape: a ball, a bean, a box or a drop. Put down a sheet of paper.',c:'paper'},
   {t:'Trace the Circle stencil (or use the compass) for a ball body.',c:'draw',tl:'pencil'},
   {t:'Give it two eyes close together, low on the body. Big eyes set low look cute.',c:'draw',tl:'pencil'},
   {t:'Add two small feet at the bottom and ONE special thing: a horn, a leaf, a tail or wings. One clear idea is easier to remember.',c:'draw',tl:'pencil'},
   {t:'Shape feelings: round shapes look friendly, square shapes look tough, pointy shapes look dangerous.',c:'draw',tl:'pencil'},
   {t:'Tap Cut, then Teacher cuts, and tap the outline you drew. The teacher cuts it out for you.',c:'cut',tl:'teacher'},
   {t:'Tap your creature, then the Toy box tab. Now it can go in a level or in Little Town.',c:'hand',tl:'hand'},
   {t:'Your turn: make three creatures, one round, one boxy, one spiky.',c:'draw',tl:'pencil'}]},
  {id:'d5',name:'Draw a house',sub:'Square, triangle, door, windows',steps:[/* T021 (Q039) */
   {t:'Put down a sheet of paper. A light colour shows your pencil best.',c:'paper'},
   {t:'Draw a square for the walls. Use the Ruler for straight sides, or go freehand.',c:'draw',tl:'pencil'},
   {t:'Draw a triangle roof on top. Let it stick out a little past the walls on both sides.',c:'draw',tl:'pencil'},
   {t:'Draw a door in the middle of the bottom edge: a tall rectangle standing on the ground.',c:'draw',tl:'pencil'},
   {t:'Draw two windows, one on each side of the door, with a line down the middle of each.',c:'draw',tl:'pencil'},
   {t:'Add a chimney on the roof, and a path that gets wider as it comes toward you.',c:'draw',tl:'pencil'},
   {t:'Colour it in. Tap the 🎨 Art box chip, pick any medium (crayons, markers, watercolour...) and a colour, and fill each part.',c:'draw',tl:'pencil'},
   {t:'Tap your house, then the Toy box tab, and save it.',c:'hand',tl:'hand'},
   {t:'Go to Little Town, tap Build and put your house on the table. Now it is part of your town.',c:'hand',tl:'hand'}]}]},
 {id:'paper',name:'📃 Paper and folding',about:'Folding, cutting and building with construction paper.',lessons:[
  {id:'p1',name:'Fold and cut a heart',sub:'Symmetry',steps:[
   {t:'Pick a red or pink paper.',c:'paper'},
   {t:'Fold tab: drag the top left corner onto the top right corner. The paper folds in half.',c:'fold',tl:'fold',f:'valley'},
   {t:'Rub your finger along the glowing fold to press the crease.',c:'fold',tl:'fold',f:'valley'},
   {t:'Draw HALF a heart with the pencil. Start on the folded edge and end on the folded edge.',c:'draw',tl:'pencil'},
   {t:'Tap Teacher cuts and tap your line. Or pick the scissors and cut it yourself.',c:'cut',tl:'teacher'},
   {t:'Tap the heart piece, then Fold, then Unfold all.',c:'fold',tl:'fold',f:'valley'},
   {t:'Both sides match because one cut went through two layers. That is called symmetry.',c:'hand',tl:'hand'},
   {t:'Your turn: use the same trick for a butterfly, a tree or a person.',c:'paper'}]},
  {id:'p2',name:'Paper chain',sub:'Fan fold',steps:[
   {t:'Put down a sheet of paper.',c:'paper'},
   {t:'Draw a straight line across the paper with the ruler, about a third of the way down.',c:'draw',tl:'pencil'},
   {t:'Tap Teacher cuts and tap the line. You now have a strip. Tap the strip.',c:'cut',tl:'teacher'},
   {t:'Fold tab: tap Fan fold. The strip folds back and forth like a fan.',c:'fold',tl:'fold',f:'valley'},
   {t:'Cut bites out of the top and bottom with the scissors. The rule: leave part of BOTH folded sides uncut, or the chain falls apart.',c:'cut',tl:'regular'},
   {t:'Tap the folded stack, then Fold, then Unfold all. A chain of matching shapes!',c:'fold',tl:'fold',f:'valley'},
   {t:'Your turn: try a chain of people holding hands. The hands must reach the folded sides.',c:'paper'}]},
  {id:'p3',name:'Paper snowflake',sub:'Fold twice, snip, open',steps:[
   {t:'Pick a white or blue paper.',c:'paper'},
   {t:'Fold it in half: drag the top left corner onto the top right corner. Press the crease.',c:'fold',tl:'fold',f:'valley'},
   {t:'Fold it in half again: drag the top corner onto the bottom corner. Press the crease.',c:'fold',tl:'fold',f:'valley'},
   {t:'Cut small bites out of every edge. Try the zigzag and wavy scissors, and the hole punch.',c:'cut',tl:'zigzag'},
   {t:'Tap the folded paper, then Fold, then Unfold all.',c:'fold',tl:'fold',f:'valley'},
   {t:'Every snip shows up four times. More folds give more repeats.',c:'hand',tl:'hand'}]},
  {id:'p4',name:'Swinging puppet',sub:'Brass fasteners',steps:[
   {t:'Put down a sheet of paper and cut out a body and two arms. Simple strips are fine.',c:'cut',tl:'regular'},
   {t:'Move tab: drag each arm so one end lies on top of the body.',c:'hand',tl:'hand'},
   {t:'Stick tab: tap Fastener, then tap where an arm overlaps the body. Do both arms.',c:'stick',tl:'pin'},
   {t:'Move tab: drag an arm. It swings around its pin.',c:'hand',tl:'hand'},
   {t:'Tap the body, then the Toy box tab. Put the puppet in Little Town and tap Walk around to watch it wave.',c:'hand',tl:'hand'}]}]},
 {id:'color',name:'🎨 Colour',about:'Colour theory with paper instead of paint.',lessons:[
  {id:'c1',name:'The colour wheel',sub:'Primary and secondary colours',steps:[
   {t:'Red, yellow and blue are the primary colours. Put down a red sheet.',c:'paper'},
   {t:'Trace the Circle stencil, then tap Teacher cuts and tap the circle. Bin the leftover paper with Move, then Bin.',c:'draw',tl:'pencil'},
   {t:'Do the same with a yellow sheet and a blue sheet. Use Move to set the three circles in a triangle.',c:'paper'},
   {t:'Secondary colours are made from two primaries: orange (red + yellow), green (yellow + blue), purple (blue + red). Cut one circle of each.',c:'paper'},
   {t:'Place each secondary colour between its two parents. You made a colour wheel.',c:'hand',tl:'hand'},
   {t:'Colours straight across the wheel are complementary: red and green, blue and orange, yellow and purple. Side by side they look their brightest.',c:'hand',tl:'hand'},
   {t:'Your turn: glue the wheel onto a white sheet and keep it in the toy box.',c:'stick',tl:'gluestick'}]},
  {id:'c2',name:'Warm, cool and contrast',sub:'How colours feel',steps:[
   {t:'Warm colours (red, orange, yellow) feel close, sunny and lively. Cool colours (green, blue, purple) feel calm and far away.',c:'paper'},
   {t:'Put down a blue sheet for a cool background.',c:'paper'},
   {t:'Cut a sun from yellow or orange paper and lay it on the blue. The warm shape jumps forward.',c:'cut',tl:'regular'},
   {t:'Contrast is the difference between light and dark. Light on dark, or dark on light, is easy to see. Try a white cloud and a black bird.',c:'paper'},
   {t:'Your turn: make a calm picture with only cool colours and one small warm spot. Your eye goes straight to the warm spot.',c:'paper'}]}]},
 {id:'design',name:'📐 Design',about:'How to place things so a picture looks right.',lessons:[
  {id:'g1',name:'The golden rectangle',sub:'About 1 to 1.6',steps:[
   {t:'The golden ratio is about 1 to 1.618. Artists and designers have used it for hundreds of years. Put down a sheet of paper.',c:'paper'},
   {t:'With the ruler, draw a rectangle 5 inches by 8 inches. 8 divided by 5 is 1.6, which is very close.',c:'draw',tl:'pencil'},
   {t:'Draw a line that makes a 5 by 5 square at one end. The piece left over is 3 by 5: the same shape again, turned on its side.',c:'draw',tl:'pencil'},
   {t:'Do it again in the leftover piece: a 3 by 3 square leaves 2 by 3. Each leftover is a smaller golden rectangle.',c:'draw',tl:'pencil'},
   {t:'With the compass, draw a curve through each square, corner to corner. Together the curves make a spiral.',c:'draw',tl:'compass'},
   {t:'How to use it: put the most important thing where the spiral ends, not in the dead centre.',c:'hand',tl:'hand'}]},
  {id:'g2',name:'A poster in thirds',sub:'Graphic design basics',steps:[
   {t:'Put down a sheet. It is 9 inches wide and 12 inches tall.',c:'paper'},
   {t:'With the ruler, draw light lines at 3 and 6 inches across, and at 4 and 8 inches down. Now the page is in thirds.',c:'draw',tl:'pencil'},
   {t:'The four spots where the lines cross are strong places. Put your main shape on one of them.',c:'hand',tl:'hand'},
   {t:'Use three sizes: one big shape, one medium, a few small. Big is what people see first.',c:'cut',tl:'regular'},
   {t:'Leave empty space. A page that is not full is easier to read.',c:'hand',tl:'hand'},
   {t:'Your turn: make a poster for your Little Town.',c:'paper'}]}]}];
cpAddLessons();/* T034: lessons from the content pack */
const CLASS_SOON=['Clay and pottery','Painting: acrylic and watercolour','Crayons, markers and shading','Yarn: crochet and knitting','Sewing and fabric patterns','Cardboard and 3D paper builds','Cutting machine and vinyl (T-shirts, stickers)','Beads and jewellery','Stamps and printing','Origami','Plants and flowers','Wood and model kits','Lettering'];
const DONE=LS.get('class',{});
let LES=null;
function renderClass(){const box=$('#classIn');box.innerHTML='<div class="cnote">Pick a lesson. It opens the School Desk and walks you through it one step at a time. You can stop any time and make whatever you like.</div>';
  CLASS.forEach(b=>{const d=document.createElement('div');d.className='branch';d.innerHTML='<h3>'+b.name+'</h3><p>'+b.about+'</p>';b.lessons.forEach((l,i)=>{const bt=document.createElement('button');bt.className='les';bt.innerHTML='<canvas></canvas><span>'+(i+1)+'. '+l.name+'<small>'+l.sub+' · '+l.steps.length+' steps</small></span><i>'+(DONE[l.id]?'⭐':'▶')+'</i>';exInto(bt.querySelector('canvas'),exFind(l.id,0),112,84);/* T021 */bt.onclick=()=>{auInit();SFX.tick();startLesson(l)};d.append(bt)});box.append(d)});
  const s=document.createElement('div');s.className='branch';s.innerHTML='<h3>More classes on the way</h3><p>Each one arrives with its craft station.</p><div class="soonb">'+CLASS_SOON.map(x=>'<span>'+x+'</span>').join('')+'</div>';box.append(s)}
function startLesson(l){LES={l,i:0,hide:false};go('craft');showLesson(true)}
function showLesson(apply){const on=!!LES&&SCR==='craft';$('#lesson').classList.toggle('on',on&&!LES.hide);$('#lesPill').classList.toggle('on',on&&LES.hide);if(!on)return;const l=LES.l,s=l.steps[LES.i],last=LES.i===l.steps.length-1;
  $('#lesT').textContent='Art Class · '+l.name;$('#lesS').textContent=s.t;$('#lesN').textContent='Step '+(LES.i+1)+' of '+l.steps.length;$('#lesX').textContent=last?'Done ⭐':'Next ▶';$('#lesP').style.visibility=LES.i?'':'hidden';$('#lesPill').textContent='📘 Step '+(LES.i+1)+' of '+l.steps.length;exLessonPics();
  if(apply&&s.c){C.cat=s.c;C.tool=s.tl||CATS.find(c=>c.id===s.c).tool;if(s.f)C.foldType=s.f;renderTabs()}}
$('#lesX').onclick=()=>{SFX.tick();if(LES.i<LES.l.steps.length-1){LES.i++;showLesson(true)}else{DONE[LES.l.id]=1;LS.set('class',DONE);SFX.win();toast('⭐ Lesson done: '+LES.l.name);LES=null;showLesson()}};
$('#lesP').onclick=()=>{SFX.tick();if(LES.i>0){LES.i--;showLesson(true)}};
$('#lesPicFW').onclick=()=>{if(LES){SFX.tick();exBig(exFind(LES.l.id,0),LES.l.name+': finished')}};
$('#lesPicSW').onclick=()=>{if(LES){SFX.tick();exBig(exFind(LES.l.id,LES.i+1),'Step '+(LES.i+1)+' of '+LES.l.steps.length)}};/* T021 */
$('#lesH').onclick=()=>{LES.hide=true;showLesson()};
$('#lesPill').onclick=()=>{LES.hide=false;showLesson()};
$('#lesQ').onclick=()=>{LES=null;showLesson();toast('Lesson closed. Make whatever you like.')};

/* ================= PICTURE EXAMPLES (T021) =================
   Every Art Class lesson has a finished example picture (step 0). The Drawing lessons also have one picture per step,
   showing the drawing built up to that step. The Fridge Gallery (the example wall) holds finished example pieces (lesson 'fridge').
   All of it lives in ONE list, EXAMPLES: {id, lesson, step, draw(c,w,h)}. Pictures are drawn in a 240 x 180 box and scaled.
   To swap a picture for hand-made art later, change that entry's draw function (or hook exDraw). */
const EXW=240,EXH=180;
function exRnd(s){let x=Math.sin(s*999.7)*43758.5453;return x-Math.floor(x)}
/* a slightly wobbly hand-drawn line through points */
function exLn(c,pts,col,w,close){c.save();c.strokeStyle=col||'#3b3a40';c.lineWidth=w||2.2;c.lineCap='round';c.lineJoin='round';c.beginPath();pts.forEach((p,i)=>{const j=(exRnd(p[0]*7+p[1]*13+i)-.5)*.9;if(i)c.lineTo(p[0]+j,p[1]-j);else c.moveTo(p[0],p[1])});if(close)c.closePath();c.stroke();c.restore()}
function exCirc(c,x,y,r,col,w,fill){c.save();c.beginPath();for(let i=0;i<=36;i++){const a=i/36*TAU,rr2=r*(1+(exRnd(x+y+i)-.5)*.03);c.lineTo(x+Math.cos(a)*rr2,y+Math.sin(a)*rr2)}c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(col!==null){c.strokeStyle=col||'#3b3a40';c.lineWidth=w||2.2;c.stroke()}c.restore()}
/* crayon fill: a flat colour plus waxy diagonal strokes */
function exWax(c,path,col){c.save();path();c.clip();c.fillStyle=col;c.globalAlpha=.75;c.fillRect(0,0,EXW,EXH);c.globalAlpha=.35;c.strokeStyle=col;c.lineWidth=3;for(let i=-EXH;i<EXW;i+=5){c.beginPath();c.moveTo(i,EXH);c.lineTo(i+EXH*.8,0);c.stroke()}c.globalAlpha=.18;c.fillStyle='#fff';for(let i=0;i<160;i++)c.fillRect(exRnd(i)*EXW,exRnd(i+.5)*EXH,1.6,1.6);c.restore()}
/* the sheet of paper on the desk */
function exSheet(c,col){c.fillStyle='#e9dcc4';c.fillRect(0,0,EXW,EXH);c.save();c.shadowColor='rgba(0,0,0,.25)';c.shadowBlur=6;c.shadowOffsetY=3;c.fillStyle=col||'#fbf8f0';c.fillRect(22,12,196,156);c.restore()}
function exRuler(c,x,y,a){c.save();c.translate(x,y);c.rotate(a);c.fillStyle='#f2c94c';c.fillRect(-70,-9,140,18);c.strokeStyle='#8b6d1f';c.lineWidth=1;for(let i=-66;i<=66;i+=6){c.beginPath();c.moveTo(i,-9);c.lineTo(i,i%18===0?-2:-5);c.stroke()}c.restore()}
function exCard(c,draw){c.fillStyle='#8b5a3c';c.fillRect(0,0,EXW,EXH);c.save();c.shadowColor='rgba(0,0,0,.35)';c.shadowBlur=6;c.fillStyle='#f6f0e2';rr(c,70,16,100,140,8);c.fill();c.restore();c.save();c.translate(120,72);c.scale(.5,.5);c.translate(-120,-90);draw();c.restore();c.fillStyle='#3b2f2a';c.font='800 11px system-ui';c.textAlign='center';c.fillText('in the Toy Box',120,146)}
const EXH2={sky:'#bfe3f2'};
/* ---- Drawing lessons: one function per lesson, k = step number (0 = finished) ---- */
const EXL={
 d1(c,k){exSheet(c,'#cfe3f5');if(k===0)k=6;
  if(k===2||k===3)exRuler(c,120,96,-.08);
  if(k>=3)exLn(c,[[70,92],[170,84]]);
  if(k>=4){exLn(c,[[70,92],[72,150]]);exLn(c,[[72,150],[170,150]]);exLn(c,[[170,84],[170,150]])}
  if(k===5){c.save();c.fillStyle='rgba(120,200,240,.55)';c.strokeStyle='#3b7fa6';c.lineWidth=1.5;c.beginPath();c.moveTo(170,150);c.lineTo(170,100);c.lineTo(122,150);c.closePath();c.fill();c.stroke();c.restore()}
  if(k>=6){exLn(c,[[64,92],[120,40],[176,84]]);exLn(c,[[108,150],[108,116],[132,116],[132,150]])}},
 d2(c,k){exSheet(c);if(k===0)k=5;
  if(k===2){exCirc(c,120,96,46);c.save();c.strokeStyle='#777';c.lineWidth=3;c.beginPath();c.moveTo(120,96);c.lineTo(140,40);c.lineTo(166,96);c.stroke();c.restore()}
  if(k===3||k===5){exCirc(c,120,124,36);exCirc(c,120,66,24)}
  if(k===4){c.save();c.fillStyle='rgba(140,200,140,.6)';c.fillRect(50,40,140,110);c.globalCompositeOperation='destination-out';c.beginPath();c.arc(120,95,36,0,TAU);c.fill();c.restore();exCirc(c,120,95,35)}
  if(k===5){c.fillStyle='#3b3a40';[[112,62],[128,62],[120,110],[120,124],[120,138]].forEach(p=>{c.beginPath();c.arc(p[0],p[1],2.6,0,TAU);c.fill()});exLn(c,[[112,74],[120,78],[128,74]]);exLn(c,[[86,116],[60,98]]);exLn(c,[[154,116],[180,98]])}},
 d3(c,k){exSheet(c);if(k===0)k=7;const g=k>=3&&k<7;
  const egg=(x,y,s)=>{c.save();c.beginPath();c.ellipse(x,y,38*s,50*s,0,0,TAU);c.strokeStyle='#3b3a40';c.lineWidth=2.2;c.stroke();c.restore()};
  if(k>=2&&k<8)egg(120,90,1);
  if(g){exLn(c,[[120,36],[120,144]],'rgba(60,60,70,.45)',1.4);exLn(c,[[78,90],[162,90]],'rgba(60,60,70,.45)',1.4)}
  const face=(x,y,s,round)=>{c.fillStyle='#3b3a40';if(k>=4||k===0){c.beginPath();c.ellipse(x-14*s,y,5*s,4*s,0,0,TAU);c.ellipse(x+14*s,y,5*s,4*s,0,0,TAU);c.fill()}
    if(k>=5){exLn(c,[[x-4*s,y+20*s],[x,y+24*s],[x+4*s,y+20*s]]);exLn(c,[[x-10*s,y+33*s],[x,y+37*s],[x+10*s,y+33*s]])}
    if(k>=6){exLn(c,[[x-38*s,y],[x-44*s,y+8*s],[x-40*s,y+22*s]]);exLn(c,[[x+38*s,y],[x+44*s,y+8*s],[x+40*s,y+22*s]]);exLn(c,[[x-36*s,y-22*s],[x-30*s,y-44*s],[x,y-54*s],[x+30*s,y-44*s],[x+36*s,y-22*s]])}};
  if(k>=4&&k<8)face(120,90,1);
  if(k>=8){c.save();c.beginPath();c.arc(80,92,42,0,TAU);c.strokeStyle='#3b3a40';c.lineWidth=2.2;c.stroke();c.restore();c.save();c.beginPath();c.ellipse(166,92,28,52,0,0,TAU);c.strokeStyle='#3b3a40';c.lineWidth=2.2;c.stroke();c.restore();face(80,96,.8);face(166,92,.6)}},
 d4(c,k){if(k===7){exCard(c,()=>{exSheet(c);exL4(c,8,true)});return}exSheet(c);if(k===0)k=8;exL4(c,k,false)},
 d5(c,k){if(k===8){exCard(c,()=>{exSheet(c);exHouse(c,7)});return}
  if(k===9){c.fillStyle='#c79a63';c.fillRect(0,0,EXW,EXH);c.fillStyle='#d8c4a0';c.fillRect(10,110,220,60);c.fillStyle='#4a4a50';c.fillRect(10,140,220,22);c.fillStyle='#f5d142';for(let i=20;i<230;i+=28)c.fillRect(i,150,14,3);c.save();c.translate(60,8);c.scale(.6,.6);exHouse(c,7,true);c.restore();c.fillStyle='#63b35d';exCirc(c,190,96,22,null,0,'#63b35d');c.fillStyle='#8b5a3c';c.fillRect(186,112,8,22);return}
  exSheet(c);if(k===0)k=7;exHouse(c,k)}};
function exL4(c,k,cut){
  if(k===5){exCirc(c,62,96,26);exLn(c,[[100,70],[146,70],[146,120],[100,120]],null,2.2,true);exLn(c,[[160,122],[182,66],[204,122]],null,2.2,true);c.fillStyle='#3b3a40';c.font='700 10px system-ui';c.textAlign='center';c.fillText('friendly',62,140);c.fillText('tough',123,140);c.fillText('danger',182,140);return}
  const one=(x,y,s,horn,fill)=>{if(fill)exCirc(c,x,y,40*s,null,0,fill);if(k>=2)exCirc(c,x,y,40*s);if(k>=3){c.fillStyle='#3b3a40';c.beginPath();c.arc(x-10*s,y+8*s,5*s,0,TAU);c.arc(x+10*s,y+8*s,5*s,0,TAU);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(x-8*s,y+6*s,1.6*s,0,TAU);c.arc(x+12*s,y+6*s,1.6*s,0,TAU);c.fill()}
   if(k>=4){exLn(c,[[x-18*s,y+38*s],[x-18*s,y+48*s],[x-6*s,y+48*s]]);exLn(c,[[x+18*s,y+38*s],[x+18*s,y+48*s],[x+30*s,y+48*s]]);if(horn==='horn')exLn(c,[[x-8*s,y-38*s],[x,y-62*s],[x+8*s,y-38*s]]);else if(horn==='leaf')exLn(c,[[x,y-40*s],[x+6*s,y-58*s],[x+22*s,y-60*s],[x+10*s,y-44*s],[x,y-40*s]]);else exLn(c,[[x+38*s,y],[x+54*s,y-12*s],[x+50*s,y+8*s]])}};
  if(k>=8&&!cut){one(52,92,.62,'leaf','#a9dd8f');c.save();c.translate(0,0);const s=.62,x=122,y=92;exLn(c,[[x-26,y-24],[x+26,y-24],[x+26,y+24],[x-26,y+24]],null,2.2,true);c.fillStyle='#3b3a40';c.beginPath();c.arc(x-8,y,3,0,TAU);c.arc(x+8,y,3,0,TAU);c.fill();exLn(c,[[x-14,y+24],[x-14,y+32]]);exLn(c,[[x+14,y+24],[x+14,y+32]]);c.restore();exLn(c,[[170,120],[178,70],[186,88],[194,62],[202,90],[210,74],[214,120]],null,2.2,true);c.fillStyle='#3b3a40';c.beginPath();c.arc(186,104,3,0,TAU);c.arc(200,104,3,0,TAU);c.fill();return}
  if(cut){one(120,96,1,'horn','#f6c6d6');return}
  one(120,96,1,'horn');
  if(k===6){c.save();c.setLineDash([5,4]);c.strokeStyle='#d9463e';c.lineWidth=2;c.beginPath();c.arc(120,92,50,0,TAU);c.stroke();c.restore();c.font='22px system-ui';c.fillText('✂️',158,52)}}
function exHouse(c,k,town){
  const wall=()=>{c.beginPath();c.rect(72,84,96,72)},roof=()=>{c.beginPath();c.moveTo(62,86);c.lineTo(120,36);c.lineTo(178,86);c.closePath()};
  if(k>=7){exWax(c,wall,'#e8443a');exWax(c,roof,'#8b5a3c');exWax(c,()=>{c.beginPath();c.rect(108,116,24,40)},'#f7d23e');exWax(c,()=>{c.beginPath();c.rect(82,98,18,16);c.rect(140,98,18,16)},'#4fb3e8');exWax(c,()=>{c.beginPath();c.rect(146,46,12,26)},'#6b4a3a');if(!town)exWax(c,()=>{c.beginPath();c.moveTo(112,156);c.lineTo(128,156);c.lineTo(150,168);c.lineTo(100,168);c.closePath()},'#c9a06a')}
  if(k>=2)exLn(c,[[72,84],[168,84],[168,156],[72,156]],null,2.2,true);
  if(k>=3)exLn(c,[[62,86],[120,36],[178,86]]);
  if(k>=4)exLn(c,[[108,156],[108,116],[132,116],[132,156]]);
  if(k>=5){exLn(c,[[82,98],[100,98],[100,114],[82,114]],null,2,true);exLn(c,[[140,98],[158,98],[158,114],[140,114]],null,2,true);exLn(c,[[91,98],[91,114]],null,1.4);exLn(c,[[149,98],[149,114]],null,1.4)}
  if(k>=6){exLn(c,[[146,72],[146,46],[158,46],[158,62]]);if(!town){exLn(c,[[112,156],[100,168]]);exLn(c,[[128,156],[150,168]])}}}
/* ---- finished pictures for the other branches (step 0 only) ---- */
const EXF={
 p1(c){exSheet(c,'#f6d7df');c.save();c.beginPath();c.moveTo(120,150);c.bezierCurveTo(40,100,60,30,120,62);c.bezierCurveTo(180,30,200,100,120,150);c.fillStyle='#e8443a';c.shadowColor='rgba(0,0,0,.2)';c.shadowBlur=4;c.fill();c.restore();c.save();c.setLineDash([4,4]);c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=1.5;c.beginPath();c.moveTo(120,62);c.lineTo(120,148);c.stroke();c.restore()},
 p2(c){exSheet(c,'#fdf6e6');for(let i=0;i<5;i++){const x=40+i*40;c.fillStyle=i%2?'#f28a2e':'#f7d23e';c.beginPath();c.arc(x,62,11,0,TAU);c.fill();c.beginPath();c.moveTo(x-14,76);c.lineTo(x+14,76);c.lineTo(x+16,118);c.lineTo(x+8,118);c.lineTo(x+6,146);c.lineTo(x-6,146);c.lineTo(x-8,118);c.lineTo(x-16,118);c.closePath();c.fill();c.fillRect(x-20,82,40,9)}c.save();c.setLineDash([3,3]);c.strokeStyle='rgba(0,0,0,.25)';for(let i=1;i<5;i++){c.beginPath();c.moveTo(20+i*40,50);c.lineTo(20+i*40,150);c.stroke()}c.restore()},
 p3(c){exSheet(c,'#3767bb');c.save();c.translate(120,90);c.fillStyle='#fff';for(let a=0;a<6;a++){c.save();c.rotate(a*TAU/6);c.beginPath();c.moveTo(-6,0);c.lineTo(-5,-62);c.lineTo(5,-62);c.lineTo(6,0);c.fill();c.fillRect(-16,-46,32,6);c.fillRect(-11,-30,22,6);c.restore()}c.beginPath();c.arc(0,0,20,0,TAU);c.fill();c.fillStyle='#3767bb';c.beginPath();c.arc(0,0,6,0,TAU);c.fill();c.restore()},
 p4(c){exSheet(c,'#fdf6e6');c.fillStyle='#62b6e8';rr(c,96,62,48,72,8);c.fill();c.fillStyle='#f3c9a0';c.beginPath();c.arc(120,46,18,0,TAU);c.fill();c.fillStyle='#3b3a40';c.beginPath();c.arc(114,44,2.4,0,TAU);c.arc(126,44,2.4,0,TAU);c.fill();c.save();c.translate(100,72);c.rotate(.9);c.fillStyle='#f28a2e';rr(c,-6,0,12,52,5);c.fill();c.restore();c.save();c.translate(140,72);c.rotate(-1.3);c.fillStyle='#f28a2e';rr(c,-6,0,12,52,5);c.fill();c.restore();c.fillStyle='#c9a24a';[[100,72],[140,72]].forEach(p=>{c.beginPath();c.arc(p[0],p[1],4,0,TAU);c.fill()});c.fillStyle='#3767bb';c.fillRect(100,132,14,26);c.fillRect(126,132,14,26)},
 c1(c){exSheet(c);const cols=['#e8443a','#f28a2e','#f7d23e','#5bbf5a','#3767bb','#8b5cb6'];cols.forEach((k,i)=>{const a=-Math.PI/2+i*TAU/6;exCirc(c,120+Math.cos(a)*52,90+Math.sin(a)*52,20,null,0,k)});c.fillStyle='#3b3a40';c.font='700 10px system-ui';c.textAlign='center';c.fillText('colour wheel',120,94)},
 c2(c){exSheet(c,'#3767bb');exCirc(c,160,56,24,null,0,'#f7d23e');c.save();c.strokeStyle='#f28a2e';c.lineWidth=3;for(let i=0;i<10;i++){const a=i/10*TAU;c.beginPath();c.moveTo(160+Math.cos(a)*30,56+Math.sin(a)*30);c.lineTo(160+Math.cos(a)*38,56+Math.sin(a)*38);c.stroke()}c.restore();[[60,70,16],[78,62,20],[96,70,16]].forEach(p=>exCirc(c,p[0],p[1],p[2],null,0,'#fff'));exLn(c,[[70,124],[82,116],[92,124],[102,116],[114,124]],'#1d1d22',4)},
 g1(c){exSheet(c);const x=40,y=40,W=160,H=100;exLn(c,[[x,y],[x+W,y],[x+W,y+H],[x,y+H]],null,2.2,true);exLn(c,[[x+100,y],[x+100,y+H]],null,1.6);exLn(c,[[x+100,y+60],[x+W,y+60]],null,1.6);exLn(c,[[x+124,y+60],[x+124,y+H]],null,1.6);c.save();c.strokeStyle='#e8443a';c.lineWidth=2.4;c.beginPath();c.arc(x+100,y+H,100,Math.PI,1.5*Math.PI);c.stroke();c.beginPath();c.arc(x+100,y+60,60,1.5*Math.PI,2*Math.PI);c.stroke();c.beginPath();c.arc(x+124,y+60,36,0,.5*Math.PI);c.stroke();c.restore()},
 g2(c){exSheet(c,'#fdf6e6');c.save();c.strokeStyle='rgba(60,60,70,.3)';c.lineWidth=1;[[87,12,87,168],[153,12,153,168],[22,64,218,64],[22,116,218,116]].forEach(l=>{c.beginPath();c.moveTo(l[0],l[1]);c.lineTo(l[2],l[3]);c.stroke()});c.restore();exCirc(c,87,64,34,null,0,'#e8443a');c.fillStyle='#3767bb';c.fillRect(140,104,28,24);exCirc(c,180,140,7,null,0,'#f7d23e');exCirc(c,60,140,5,null,0,'#f7d23e');c.fillStyle='#3b3a40';c.font='900 13px system-ui';c.fillText('MY TOWN',122,40)}};
/* ---- the example wall on the Fridge Gallery: finished pieces in several mediums (code-made toys, ids ex_*) ---- */
const EXFRIDGE=[
 {key:'house',name:'Paper house',made:'Construction paper, cut and glued in layers.',how:'Cut a square and a triangle, glue on a door and windows.',med:{m:[],stock:'con'},w:200,h:180,draw(c){c.save();c.translate(-20,-6);c.shadowColor='rgba(0,0,0,.25)';c.shadowBlur=3;c.shadowOffsetY=2;c.fillStyle='#e8443a';c.fillRect(72,84,96,72);c.fillStyle='#8b5a3c';c.beginPath();c.moveTo(60,88);c.lineTo(120,34);c.lineTo(180,88);c.closePath();c.fill();c.fillStyle='#f7d23e';c.fillRect(108,116,24,40);c.fillStyle='#4fb3e8';c.fillRect(82,98,18,16);c.fillRect(140,98,18,16);c.fillStyle='#6b4a3a';c.fillRect(146,44,12,24);c.restore()}},
 {key:'dog',name:'Clay dog',made:'Puffy clay, rolled into balls and pressed together.',how:'Roll a big ball for the body, a smaller one for the head, four little logs for legs.',made3d:'clay',med:{m:[],stock:'con'},w:200,h:160,draw(c){const blob=(x,y,rx,ry,col)=>{const g=c.createRadialGradient(x-rx*.35,y-ry*.4,2,x,y,Math.max(rx,ry));g.addColorStop(0,'#e7b98a');g.addColorStop(1,col);c.fillStyle=g;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill()};
   [[64,128],[86,132],[124,132],[146,128]].forEach(p=>blob(p[0],p[1],9,18,'#9b6a3f'));blob(104,98,56,34,'#a8733f');blob(160,64,30,28,'#a8733f');blob(136,50,9,18,'#7d522c');blob(182,52,9,18,'#7d522c');blob(186,74,10,8,'#c48a55');c.fillStyle='#2b2220';c.beginPath();c.arc(152,58,3.5,0,TAU);c.arc(170,58,3.5,0,TAU);c.arc(192,72,4,0,TAU);c.fill();blob(46,82,7,16,'#a8733f')}},
 {key:'tree',name:'Yarn tree',made:'Yarn, wrapped and looped (crochet look).',how:'Wrap brown yarn round a stick for the trunk, loop green yarn into a ball for the leaves.',med:{m:[],stock:'con'},w:160,h:200,draw(c){c.save();c.lineCap='round';c.strokeStyle='#7d522c';c.lineWidth=4;for(let y=120;y<196;y+=5){c.beginPath();c.moveTo(66,y);c.quadraticCurveTo(80,y+4,94,y);c.stroke()}const g=['#2d8a57','#5bbf5a','#3fa35a'];for(let i=0;i<70;i++){const a=exRnd(i)*TAU,r=exRnd(i+.3)*52;c.strokeStyle=g[i%3];c.lineWidth=3.2;c.beginPath();c.arc(80+Math.cos(a)*r,68+Math.sin(a)*r*.85,6+exRnd(i+.7)*4,0,TAU);c.stroke()}c.restore()}},
 {key:'sun',name:'Crayon sun',made:'Crayons on construction paper.',how:'Colour a circle hard in yellow, then pull orange rays out from the edge.',med:{m:['crayon'],stock:'con'},w:180,h:180,draw(c){c.save();c.translate(-30,0);exWax(c,()=>{c.beginPath();c.arc(120,90,46,0,TAU)},'#f7d23e');c.strokeStyle='#f28a2e';c.lineWidth=7;c.lineCap='round';for(let i=0;i<12;i++){const a=i/12*TAU;c.beginPath();c.moveTo(120+Math.cos(a)*54,90+Math.sin(a)*54);c.lineTo(120+Math.cos(a)*78,90+Math.sin(a)*78);c.stroke()}c.fillStyle='#3b3a40';c.beginPath();c.arc(106,82,4,0,TAU);c.arc(134,82,4,0,TAU);c.fill();exLn(c,[[104,104],[120,112],[136,104]],'#3b3a40',3);c.restore()}},
 {key:'flower',name:'Watercolour flower',made:'Watercolour on watercolour paper.',how:'Wet blobs of pink for petals, a dot of yellow in the middle, a green stem with one leaf.',med:{m:['water'],stock:'water'},w:160,h:200,draw(c){c.save();c.globalAlpha=.55;c.strokeStyle='#2d8a57';c.lineWidth=6;c.beginPath();c.moveTo(80,92);c.quadraticCurveTo(74,150,82,196);c.stroke();c.fillStyle='#5bbf5a';c.beginPath();c.ellipse(98,150,22,9,-.5,0,TAU);c.fill();for(let i=0;i<6;i++){const a=i/6*TAU;for(let j=0;j<3;j++){c.fillStyle=j?'#f38bb3':'#e8649a';c.beginPath();c.ellipse(80+Math.cos(a)*28,66+Math.sin(a)*28,22-j*4,14-j*3,a,0,TAU);c.fill()}}c.globalAlpha=.9;c.fillStyle='#f7d23e';c.beginPath();c.arc(80,66,12,0,TAU);c.fill();c.restore()}},
 {key:'star',name:'Glitter-pen star',made:'Glitter pen on a cut-out card star.',how:'Draw a star with the Star stencil, cut it out, then go round it with the glitter pen.',med:{m:['glitter'],stock:'con'},w:180,h:180,draw(c){const st=()=>{c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?32:80;c.lineTo(90+Math.cos(a)*r,94+Math.sin(a)*r)}c.closePath()};c.fillStyle='#3767bb';st();c.fill();c.save();st();c.clip();for(let i=0;i<260;i++){c.fillStyle=['#fff','#f7d23e','#f38bb3','#bfe3f2'][i%4];c.fillRect(exRnd(i)*180,exRnd(i+.4)*180,2.2,2.2)}c.restore();c.save();c.setLineDash([2,3]);c.strokeStyle='#f7d23e';c.lineWidth=4;st();c.stroke();c.restore()}}];
const EXAMPLES=[];
CLASS.forEach(b=>b.lessons.forEach(l=>{if(EXL[l.id]){for(let k=0;k<=l.steps.length;k++)EXAMPLES.push({id:'ex_'+l.id+'_'+k,lesson:l.id,step:k,draw:(c,w,h)=>{c.save();c.scale(w/EXW,h/EXH);EXL[l.id](c,k);c.restore()}})}else if(EXF[l.id])EXAMPLES.push({id:'ex_'+l.id+'_0',lesson:l.id,step:0,draw:(c,w,h)=>{c.save();c.scale(w/EXW,h/EXH);EXF[l.id](c);c.restore()}})}));
EXFRIDGE.forEach((f,i)=>EXAMPLES.push({id:'ex_'+f.key,lesson:'fridge',step:i,w:f.w,h:f.h,draw:(c,w,h)=>{c.save();c.scale(w/f.w,h/f.h);f.draw(c);c.restore()}}));
cpAddExamples();/* T034 */
function exFind(lesson,step){return EXAMPLES.find(e=>e.lesson===lesson&&e.step===step)}
function exDraw(e,c,w,h){e.draw(c,w,h)}/* one place every example picture is drawn through */
const EXC={};
function exCanvas(e,w,h){const k=e.id+'_'+w+'x'+h;if(!EXC[k]){const cv=mkCanvas(w,h);exDraw(e,cv._x,w,h);EXC[k]=cv}return EXC[k]}
function exInto(cvs,e,w,h){cvs.width=w;cvs.height=h;const x=cvs.getContext('2d');x.clearRect(0,0,w,h);if(e)x.drawImage(exCanvas(e,w,h),0,0)}
/* the example pieces as toys (not in the Toy Box until Keep) */
const EXTOY={};
function exToy(f){if(EXTOY[f.key])return EXTOY[f.key];const e=exFind('fridge',EXFRIDGE.indexOf(f)),cv=mkCanvas(f.w,f.h);exDraw(e,cv._x,f.w,f.h);const t={id:'ex_'+f.key,name:f.name,w:f.w,h:f.h,beh:'scenery',act:'none',med:JSON.parse(JSON.stringify(f.med)),parts:[{src:cv.toDataURL(),x:0,y:0,w:f.w,h:f.h,parent:-1,px:0,py:0,z:0}]};if(f.made3d)t.m3d=f.made3d;EXTOY[f.key]=t;return t}
/* lesson pictures in the Art Class panel: the finished picture at the top, and for Drawing lessons this step's picture */
function exLessonPics(){const l=LES&&LES.l,box=$('#lesPic');if(!l||!box)return;const fin=exFind(l.id,0),st=exFind(l.id,LES.i+1);box.style.display=fin?'flex':'none';if(!fin)return;
  exInto($('#lesPicF'),fin,120,90);const sb=$('#lesPicSW');sb.style.display=st?'':'none';if(st)exInto($('#lesPicS'),st,120,90)}
function exBig(e,title){const cv='<canvas id="exBigC" style="width:100%;max-width:480px;border-radius:8px;display:block;margin:0 auto"></canvas>';dlg('<h2>'+esc(title)+'</h2>'+cv+'<div class="btns"><button id="dNo">Close</button></div>',d=>{exInto(d.querySelector('#exBigC'),e,480,360);d.querySelector('#dNo').onclick=closeDlg})}
/* ---- the Fridge Gallery station ---- */
function fridgeOpen(){dlg('<h2>🧲 Fridge Gallery</h2><p style="margin:0 0 8px;font-size:13px">Finished examples, stuck on with magnets. Tap one to see what it is made of, open it at the School Desk to see how it was made, or keep it.</p><div class="exfr">'+EXFRIDGE.map((f,i)=>'<button data-i="'+i+'"><i style="background:'+['#d9463e','#3767bb','#5bbf5a','#f5d142','#f38bb3','#8b5cb6'][i%6]+'"></i><canvas></canvas><span>'+esc(f.name)+'</span></button>').join('')+'</div><div class="btns"><button id="dNo">Back to the studio</button></div>',d=>{
  d.querySelectorAll('.exfr [data-i]').forEach(b=>{const f=EXFRIDGE[+b.dataset.i];exInto(b.querySelector('canvas'),exFind('fridge',+b.dataset.i),f.w,f.h);b.onclick=()=>{SFX.tick();fridgeCard(f)}});d.querySelector('#dNo').onclick=closeDlg})}
function fridgeCard(f){const t=exToy(f),have=!!toyById(t.id);dlg('<h2>'+esc(f.name)+'</h2><canvas class="pv" id="pv"></canvas><p style="margin:6px 0 2px;font-size:13.5px"><b>Made of:</b> '+esc(f.made)+'</p><p style="margin:0 0 4px;font-size:13.5px"><b>How:</b> '+esc(f.how)+'</p><div class="btns"><button id="dD">✂️ Open at the School Desk</button><button class="alt" id="dK">'+(have?'✓ In your Toy Box':'🧸 Keep')+'</button><button class="alt" id="dB">◀ Fridge</button></div>',d=>{thumb(d.querySelector('#pv'),t);
  d.querySelector('#dD').onclick=()=>{closeDlg();go('craft');toyToDesk(t);C.cat='hand';C.tool='hand';renderTabs();toast('A copy of the '+f.name.toLowerCase()+' is on your desk')};
  d.querySelector('#dK').onclick=()=>{if(toyById(t.id)){toast('It is already in your Toy Box');return}const k=JSON.parse(JSON.stringify(t));TOYS.push(k);if(!saveToys()){TOYS.pop();toast('Storage is full. Remove something first.');return}libAddToy(k,'piece');const a=LIB.find(x=>x.ref===k.id);if(a){a.tags=['example'];saveLib()}updBadge();SFX.thwap();toast(f.name+' is in your Toy Box');fridgeCard(f)};
  d.querySelector('#dB').onclick=()=>{SFX.tick();fridgeOpen()}})}
