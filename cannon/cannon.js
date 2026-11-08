if(document.fonts&&document.fonts.load){document.fonts.load('400 16px "Comic Neue"');document.fonts.load('700 16px "Comic Neue"')}
const DATA={
 "boy_face_confused": "assets/boy_face_confused.png",
 "puller_arm_upper": "assets/puller_arm_upper.png",
 "puller_arm_lower": "assets/puller_arm_lower.png",
 "puller_arm_rest": "assets/puller_arm_rest.png",
 "boy_arm_l": "assets/boy_arm_l.png",
 "boy_arm_r": "assets/boy_arm_r.png",
 "boy_chest": "assets/boy_chest.png",
 "boy_face_dizzy": "assets/boy_face_dizzy.png",
 "boy_face_scared": "assets/boy_face_scared.png",
 "boy_hair_ahoge": "assets/boy_hair_ahoge.png",
 "boy_hair_front": "assets/boy_hair_front.png",
 "boy_head": "assets/boy_head.png",
 "boy_leg_l": "assets/boy_leg_l.png",
 "boy_leg_r": "assets/boy_leg_r.png",
 "face_blink": "assets/face_blink.png",
 "face_effort": "assets/face_effort.png",
 "face_idle": "assets/face_idle.png",
 "face_joy": "assets/face_joy.png",
 "puller_body": "assets/puller_body.png",
 "puller_glasses": "assets/puller_glasses.png",
 "puller_hair_back": "assets/puller_hair_back.png",
 "puller_hair_front": "assets/puller_hair_front.png",
 "puller_head": "assets/puller_head.png",
 "villv_congrats": "assets/villv_congrats.png",
 "villv_disappoint": "assets/villv_disappoint.png",
 "villv_encourage": "assets/villv_encourage.png",
 "villv_happy": "assets/villv_happy.png",
 "bird": "assets/bird.png",
 "wheel": "assets/wheel.png",
 "wall": "assets/wall.png",
 "cannon": "assets/cannon.png"
};

Sfx.load("win","assets/win.mp3");
Sfx.load("cannon","assets/cannon.mp3");
const MAN={boy_face_confused:[407,248,201,138],puller_arm_upper:[606,471,66,116],puller_arm_lower:[622,543,116,185],puller_arm_rest:[408,482,109,283],boy_arm_l:[384,444,66,266],boy_arm_r:[595,438,75,266],boy_chest:[411,383,226,266],boy_face_dizzy:[407,248,201,138],boy_face_scared:[407,248,201,140],boy_hair_ahoge:[327,6,207,133],boy_hair_front:[291,49,422,333],boy_head:[363,63,314,347],boy_leg_l:[415,612,115,376],boy_leg_r:[522,612,118,371],face_blink:[457,271,231,146],face_effort:[461,286,228,144],face_idle:[446,271,250,146],face_joy:[455,263,231,161],puller_body:[383,441,383,524],puller_glasses:[455,281,262,127],puller_hair_back:[159,96,633,765],puller_hair_front:[320,63,437,470],puller_head:[351,89,361,368]};
const W=960,H=540,GY=450,CX=260,PY=GY-62,BAR=90.4,K=.2,MK=.17,PXM=30,Z=.75;
const HK=.2;
const HEAD_R=26*HK/K;
let G=1400/3600,cond=[],pad=null,walls=[],birds=[],fx=[];
let INK='#1d1b24',PAPER='#fbfaf8',MUTE='#7b7886',ACC='#e8486a',lt=0,stiff=0,shots=0,lastS=null,armP=0;
function theme(){const c=getComputedStyle(document.documentElement),g=n=>c.getPropertyValue(n).trim();INK=g('--ink')||INK;PAPER=g('--paper')||PAPER;MUTE=g('--muted')||MUTE;ACC=g('--accent')||ACC}
function shadow(x,w,y){ctx.save();ctx.globalAlpha=.12;ctx.fillStyle=INK;ctx.beginPath();ctx.ellipse(x,(y||GY)+4,w,7,0,0,7);ctx.fill();ctx.restore()}
const CAN={"w": 378, "h": 333, "px": 178.71391805641343, "py": 182.91172700525348, "al": 0.5533145436260666, "dm": 215.26228096069735, "sx": 56.0, "sy": 96.0, "sc": 0.42};
const IM={},cv=document.getElementById('c'),ctx=cv.getContext('2d');
const S=2;cv.width=W*S;cv.height=H*S;
const $=id=>document.getElementById(id);
let phase='aim',cam={x:0,y:0},ang=Math.PI/4,pow=0,drag=null,rag=null,t=0,shake=0,flash=0,smoke=[],best=0,landed=0,still=0,dizzy=false,resT=0,score=0,vT=0,bub='you got this!',bubT=0,AC;
try{best=+localStorage.getItem('kc_best')||0}catch(e){}
const LINES=['you got this!','fire it!!','go go go!','harder!!','I believe in you, dr. MEI','he’s fine. probably', 'kill him.'];
const ptsInit=[0,1,2,3,4,5,6];
const EX=[[5,6,5,1],[1,5,114,1],[1,6,114,1]],C=[[0,1,33,1],[1,2,44,1],[3,1,48,1],[4,1,48,1],[5,2,72,1],[6,2,72,1],[0,2,70,2],[3,4,50,2],[5,6,30,2]];
function boom(){
Sfx.play("cannon",0.8);}
const dirv=()=>({x:Math.cos(ang),y:-Math.sin(ang)});
const muz=()=>{const d=dirv();return{x:d.x*BAR,y:PY+d.y*BAR}};
function spr(n,ox,oy,k){const m=MAN[n];ctx.drawImage(IM[n],ox+m[0]*k,oy+m[1]*k,m[2]*k,m[3]*k)}

const FACE_CROP={boy_face_confused:[102,60,50,36]};
function kHead(face,x,y,rot,s){
  s=s||HK;
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(rot);
  ctx.scale(s,s);
  ctx.translate(-520,-236);
  for(const n of['boy_head','boy_hair_front',face,'boy_hair_ahoge']){
    const m=MAN[n],c=FACE_CROP[n];
    if(c)ctx.drawImage(IM[n],c[0],c[1],c[2],c[3],m[0],m[1],m[2],m[3]);
    else ctx.drawImage(IM[n],m[0],m[1],m[2],m[3]);
  }
  ctx.restore();
}

function limb(n,a,b,L){const m=MAN[n],dx=b.x-a.x,dy=b.y-a.y,l=L||Math.hypot(dx,dy)||1;ctx.save();ctx.translate(a.x,a.y);ctx.rotate(Math.atan2(dy,dx)-Math.PI/2);ctx.drawImage(IM[n],-m[2]*K/2,0,m[2]*K,l);ctx.restore()}
function arm(tx,ty){const S=[630,485],E0=[652,568],G0=[712,708],L1=Math.hypot(E0[0]-S[0],E0[1]-S[1]),L2=Math.hypot(G0[0]-E0[0],G0[1]-E0[1]),dx=tx-S[0],dy=ty-S[1],d=Math.hypot(dx,dy)||1,dc=Math.min(Math.max(d,Math.abs(L1-L2)+2),L1+L2-.5),a=(L1*L1-L2*L2+dc*dc)/(2*dc),hh=Math.sqrt(Math.max(0,L1*L1-a*a));let ux=dx/d,uy=dy/d,px=-uy,py=ux;if(py<0){px=-px;py=-py}
 const E=[S[0]+ux*a+px*hh,S[1]+uy*a+py*hh],G=[S[0]+ux*dc,S[1]+uy*dc],a1=Math.atan2(E[1]-S[1],E[0]-S[0])-Math.atan2(E0[1]-S[1],E0[0]-S[0]),a2=Math.atan2(G[1]-E[1],G[0]-E[0])-Math.atan2(G0[1]-E0[1],G0[0]-E0[0]);
 for(const[n,P,P0,r]of[['puller_arm_lower',E,E0,a2],['puller_arm_upper',S,S,a1]]){const m=MAN[n];ctx.save();ctx.translate(P[0],P[1]);ctx.rotate(r);ctx.drawImage(IM[n],m[0]-P0[0],m[1]-P0[1],m[2],m[3]);ctx.restore()}return G}
function holeW(){const r=-(ang-CAN.al),c=Math.cos(r),sn=Math.sin(r),x=(CAN.sx-CAN.px)*CAN.sc,y=(CAN.sy-CAN.py)*CAN.sc;return{x:x*c-y*sn,y:PY+x*sn+y*c}}
function drawMei(wx){const k=MK,ox=wx-574*k,oy=GY-965*k+(phase==='aim'?Math.sin(t*.1)*2:0);
 armP+=((phase==='light'?1:0)-armP)*.14;
 let f=(drag&&pow>.08)||phase==='light'?'face_effort':(phase==='fly'?'face_joy':(Math.sin(t*.04)>.97?'face_blink':'face_idle'));if(phase==='dead')f=score>25?'face_joy':'face_idle';
 const T=holeW(),psi=-1.05+armP*1.84,len=60,hl={x:T.x-Math.cos(.785)*len,y:T.y-Math.sin(.785)*len},hi={x:ox+630*k+14,y:oy+485*k+12},hx=hi.x+(hl.x-hi.x)*armP,hy=hi.y+(hl.y-hi.y)*armP;
 shadow(wx,60);ctx.save();ctx.translate(ox,oy);ctx.scale(k,k);
 spr('puller_hair_back',0,0,1);const G=arm((hx-ox)/k,(hy-oy)/k);
 for(const n of['puller_body','puller_arm_rest','puller_head','puller_hair_front',f,'puller_glasses'])spr(n,0,0,1);
 ctx.restore();
 const gx=ox+G[0]*k,gy=oy+G[1]*k,tx=gx+Math.cos(psi)*len,ty=gy+Math.sin(psi)*len;
 ctx.save();ctx.lineCap='round';ctx.strokeStyle='#6a4b38';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(tx,ty);ctx.stroke();
 ctx.fillStyle='#f28a30';ctx.beginPath();ctx.arc(tx,ty,5+Math.sin(t*.5)*1.2,0,7);ctx.fill();ctx.fillStyle='#ffd36b';ctx.beginPath();ctx.arc(tx,ty,2.2,0,7);ctx.fill();
 if(armP>.8){ctx.strokeStyle='#ffd36b';ctx.lineWidth=2;for(let i=0;i<4;i++){const q=t*.9+i*1.7;ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx+Math.cos(q)*11,ty+Math.sin(q)*11);ctx.stroke()}}ctx.restore()}
function ink(w){ctx.strokeStyle=INK;ctx.fillStyle=PAPER;ctx.lineWidth=w;ctx.lineCap=ctx.lineJoin='round'}
function drawVillv(x,y,s,o){o=o||{};ctx.save();ctx.translate(x,y+(o.bob||0));ctx.scale(s,s);ink(5);
 ctx.beginPath();ctx.rect(-28,-52,56,52);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.moveTo(-28,-45);ctx.lineTo(-42,-20);ctx.stroke();
 ctx.beginPath();ctx.moveTo(28,-45);if(o.thumb){ctx.lineTo(48,-78);ctx.stroke();ctx.beginPath();ctx.roundRect(41,-104,13,28,5);ctx.fill();ctx.stroke()}else if(o.cheer){ctx.lineTo(46,-88);ctx.stroke();ctx.beginPath();ctx.arc(46,-95,8,0,7);ctx.fill();ctx.stroke()}else{ctx.lineTo(42,-20);ctx.stroke()}
 ctx.beginPath();ctx.moveTo(-44,-50);ctx.lineTo(-46,-105);ctx.quadraticCurveTo(-46,-152,0,-152);ctx.quadraticCurveTo(46,-152,46,-105);ctx.lineTo(44,-50);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.moveTo(-40,-118);ctx.lineTo(40,-118);ctx.lineTo(30,-132);ctx.stroke();
 ctx.beginPath();ctx.arc(-16,-96,10,0,7);ctx.stroke();ctx.beginPath();ctx.moveTo(-6,-96);ctx.lineTo(6,-96);ctx.stroke();
 if(o.wink){ctx.beginPath();ctx.arc(16,-93,8,Math.PI*1.1,Math.PI*1.9);ctx.stroke()}else{ctx.beginPath();ctx.arc(16,-96,10,0,7);ctx.stroke()}
 ctx.beginPath();ctx.arc(0,-80,10,.15*Math.PI,.85*Math.PI);ctx.stroke();ctx.restore()}
function bubble(lines,x,y,big){ctx.save();ink(big?5:3);ctx.font=(big?'bold 40px':'16px')+' "Comic Sans MS","Comic Neue","Chalkboard SE",sans-serif';ctx.textAlign='center';
 const w=Math.max(...lines.map(l=>ctx.measureText(l.t).width))+30,h=lines.length*(big?46:22)+16;
 ctx.beginPath();ctx.roundRect(x-w/2,y-h,w,h,h/2>30?30:h/2);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.moveTo(x+w*.15,y-2);ctx.lineTo(x+w*.28,y+(big?30:16));ctx.lineTo(x+w*.32,y-2);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.moveTo(x+w*.14,y-ctx.lineWidth);ctx.lineTo(x+w*.33,y-ctx.lineWidth);ctx.strokeStyle=PAPER;ctx.stroke();
 ctx.fillStyle=INK;lines.forEach((l,i)=>{const ty=y-h+(i+1)*(big?46:22)+(big?-2:-2);ctx.font=(l.s||(big?'bold 40px':'16px'))+' "Comic Sans MS","Comic Neue","Chalkboard SE",sans-serif';ctx.fillText(l.t,x,ty);if(l.u){const tw=ctx.measureText(l.u).width;ctx.fillRect(x-tw/2,ty+5,tw,4)}});ctx.restore()}
function drawCannon(){const d=dirv();
 shadow(0,50);
 ctx.save();ctx.translate(0,PY);ctx.rotate(-(ang-CAN.al));ctx.drawImage(IM.cannon,-CAN.px*CAN.sc,-CAN.py*CAN.sc,CAN.w*CAN.sc,CAN.h*CAN.sc);ctx.restore();ctx.drawImage(IM.wheel,-35,GY-70,70,70);
 if(phase==='aim'||phase==='light'){
   const m=muz();
   kHead('boy_face_confused',m.x+d.x*18,m.y+d.y*18,(Math.PI/2-ang)*.4);
 }}
function drawRag(){shadow(rag[1].x,Math.max(14,46-(GY-rag[1].y)*.08));const[h,n,p,hl,hr,fl,fr]=rag,u={x:(p.x-n.x),y:(p.y-n.y)},ul=Math.hypot(u.x,u.y)||1;
 limb('boy_arm_r',n,hr);limb('boy_leg_r',p,fr);
 limb('boy_chest',{x:n.x-u.x/ul*8,y:n.y-u.y/ul*8},p,MAN.boy_chest[3]*K);
 limb('boy_leg_l',p,fl);
 kHead(dizzy?'boy_face_scared':'boy_face_confused',h.x,h.y,Math.atan2(h.y-n.y,h.x-n.x)+Math.PI/2);
 limb('boy_arm_l',n,hl)}
function fire(){phase='fly';const v=(350+1150*pow)/60,d=dirv(),m=muz(),pr={x:-d.y,y:d.x};
 const mk=(x,y)=>({x,y,px:x-d.x*v,py:y-d.y*v});
 const hx=m.x+d.x*14,hy=m.y+d.y*14,nx=hx-d.x*33,ny=hy-d.y*33,px=nx-d.x*44,py=ny-d.y*44;
 rag=[mk(hx,hy),mk(nx,ny),mk(px,py),mk(nx-d.x*40+pr.x*18,ny-d.y*40+pr.y*18),mk(nx-d.x*40-pr.x*18,ny-d.y*40-pr.y*18),mk(px-d.x*70+pr.x*2.5,py-d.y*70+pr.y*2.5),mk(px-d.x*70-pr.x*2.5,py-d.y*70-pr.y*2.5)];
 rag[0].r=HEAD_R;for(let i=1;i<7;i++)rag[i].r=6;
 landed=0;still=0;dizzy=false;stiff=42;shots++;shake=10;flash=1;for(let i=0;i<16;i++)smoke.push({x:m.x+d.x*(10+i*5)+(Math.random()-.5)*14,y:m.y+d.y*(10+i*5)+(Math.random()-.5)*14,r:10+Math.random()*8,l:1,vx:d.x*(1.2+Math.random()*1.6)+(Math.random()-.5),vy:d.y*1.2-Math.random()*.8});boom()}
function step(){const vin=[],vxin=[],sh2=[];if(stiff>0)stiff--;birdHit();
 for(const p of rag){const vx=(p.x-p.px)*.999,vy=(p.y-p.py)*.999;p.px=p.x;p.py=p.y;p.x+=vx;p.y+=vy+G;vin.push(vy+G);vxin.push(vx)}
 const con=[];for(let i=0;i<7;i++)con[i]=false;
 for(let it=0;it<8;it++){for(const[a,b,L,ty]of(stiff>0?C.concat(EX):C)){const A=rag[a],B=rag[b];let dx=B.x-A.x,dy=B.y-A.y,d=Math.hypot(dx,dy)||.01;if(ty===2&&d>=L)continue;const f=(d-L)/d*.5;A.x+=dx*f;A.y+=dy*f;B.x-=dx*f;B.y-=dy*f}
  rag.forEach((p,i)=>{let wl=null;for(const w of walls)if(Math.abs(p.x-w.x)<w.w/2+p.r){wl=w;break}const top=wl&&p.py<GY-wl.h,lim=top?GY-wl.h-p.r:GY-p.r;if(p.y>lim){p.y=lim;con[i]=true}if(wl&&!top&&p.y>GY-wl.h){p.x=p.px<wl.x?wl.x-wl.w/2-p.r:wl.x+wl.w/2+p.r;sh2[i]=true}})}
 rag.forEach((p,i)=>{if(sh2[i]){p.px=p.x+vxin[i]*.3;stiff=0}});let e=0;rag.forEach((p,i)=>{if(con[i]){if(!landed){landed=1;dizzy=true}stiff=0;if(vin[i]>2)dizzy=true;const onP=pad&&p.x>pad.x-pad.w/2&&p.x<pad.x+pad.w/2;p.py=onP&&vin[i]>.8?p.y+vin[i]*1.15:(vin[i]>.9?p.y+vin[i]*.35:p.y);p.px=p.x-(p.x-p.px)*(onP?1:.8)}e+=Math.abs(p.x-p.px)+Math.abs(p.y-p.py)});
 if(landed){landed++;still=e<.7?still+1:0;if(still>40||landed>900)finish()}}
function finish() {
  phase = 'dead';
  resT = 0;
  score = Math.max(0, rag[1].x / PXM);
  dizzy = true;
  lastS = score;

  if (score > best) {
    best = score;
    try {
      localStorage.setItem('kc_best', best);
    } catch(e) {}
  }
  if (score >= 20) {
    setTimeout(() => {
      Sfx.play("win",0.8);
    }, 700);
  }
}

function newRound(){cond=[];G=1400/3600;fx=[];pad=null;walls=[];birds=[];
 if(Math.random()<.55){const n=Math.random()<.55?1:(Math.random()<.7?2:3);let x=(13+Math.random()*6)*PXM;for(let i=0;i<n;i++){const tall=Math.random()<.5;walls.push({x,w:50,h:Math.round(tall?170+Math.random()*45:110+Math.random()*30)});x+=(7+Math.random()*6)*PXM}cond.push(n>1?'brick walls':'brick wall')}
 if(Math.random()<.45){const n=3+(Math.random()*3|0);for(let i=0;i<n;i++)birds.push({x:(14+Math.random()*34)*PXM,y:GY-130-Math.random()*190,vx:(Math.random()-.5)*1.2,ph:Math.random()*6,a:true});cond.push('birds')}}
function birdHit(){for(const b of birds){if(!b.a)continue;const h=rag[0];if(Math.hypot(h.x-b.x,h.y-b.y)<36){b.a=false;for(const p of rag){p.px=p.x-(p.x-p.px)*.4;p.py=p.y+4}stiff=0;fx.push({x:b.x,y:b.y-20,vx:0,vy:-.6,l:1.4,t:'squawk!'});for(let i=0;i<8;i++)fx.push({x:b.x,y:b.y,vx:(Math.random()-.5)*5,vy:-Math.random()*3,l:1})}}}
function reset(){newRound();phase='aim';rag=null;vT=0;drag=null;pow=0;smoke=[];bub=LINES[Math.random()*LINES.length|0]}
function comment(s){return s<8?'that’s not even a flight!':s<20?'you can do better!':s<35?'not bad, not bad':s<50?'now THAT’S a launch!':'LEGENDARY. kevin left orbit'}
function pos(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
cv.addEventListener('pointerdown',e=>{try{AC=AC||new AudioContext();AC.resume()}catch(x){}
 if(phase==='dead'&&vT>.9){reset();return}if(phase!=='aim')return;const p=pos(e);drag={sx:p.x,sy:p.y};cv.setPointerCapture(e.pointerId)});
cv.addEventListener('pointermove',e=>{if(!drag||phase!=='aim')return;const p=pos(e),dx=p.x-drag.sx,dy=p.y-drag.sy,l=Math.hypot(dx,dy);if(l>8){ang=Math.max(.1,Math.min(1.45,Math.atan2(dy,-dx)));pow=Math.min(l/170,1)}else pow=0});
const up=()=>{if(drag&&phase==='aim'){const d=drag;drag=null;if(pow>.08){phase='light';lt=0}else pow=0}};
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
$('again').onclick=reset;addEventListener('keydown',e=>{if(e.key==='d'||e.key==='D'){const r=document.documentElement,dk=(r.dataset.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'))==='dark';r.dataset.theme=dk?'light':'dark';theme()}});
addEventListener('keydown',e=>{if(e.key==='r'||e.key==='R'||(e.key===' '&&phase==='dead'))reset()});
function preview(){const d=dirv(),m=muz(),v=(350+1150*pow)/60;let x=m.x+d.x*14,y=m.y+d.y*14,vx=d.x*v,vy=d.y*v;ctx.save();ctx.fillStyle=INK;for(let i=0;i<120;i++){vy+=G;x+=vx;y+=vy;if(y>GY)break;if(i%5===0){ctx.beginPath();ctx.arc(x,y,4,0,7);ctx.fill()}}
 ctx.font='bold 18px "Comic Sans MS","Comic Neue",sans-serif';ctx.textAlign='center';ctx.fillText(Math.round(pow*100)+'%',m.x+d.x*50,m.y+d.y*50-10);ctx.restore()}
function draw(){
 const idle=phase==='aim'||phase==='light',tx=idle?0:Math.max(0,rag[0].x-330),ty=idle?0:Math.max(0,110-Math.min(rag[0].y,rag[1].y));
 cam.x+=(tx-cam.x)*(idle?.15:.12);cam.y+=(ty-cam.y)*.1;
 ctx.setTransform(S,0,0,S,0,0);ctx.clearRect(0,0,W,H);ctx.save();
 const sh=shake>0?(Math.random()-.5)*shake:0;if(shake>0)shake--;
 ctx.translate(CX-cam.x*Z+sh,GY-GY*Z+cam.y*Z+sh);ctx.scale(Z,Z);
 const L=cam.x-CX/Z-40,R=cam.x+W/Z;ink(8);ctx.beginPath();ctx.moveTo(L,GY);ctx.lineTo(R,GY);ctx.stroke();
 ctx.fillStyle=INK;ctx.textAlign='center';ctx.font='bold 16px "Comic Sans MS","Comic Neue",sans-serif';
 for(let m=Math.ceil(L/PXM/5)*5;m*PXM<R;m+=5){if(m<0)continue;const x=m*PXM;ctx.fillRect(x-2,GY,4,m%10?10:20);if(m%10===0&&m>0)ctx.fillText(m+'m',x,GY+40)}
 if(best>0){const bx=best*PXM;ctx.save();ctx.strokeStyle=ACC;ctx.lineWidth=4;ctx.setLineDash([8,8]);ctx.beginPath();ctx.moveTo(bx,GY-150);ctx.lineTo(bx,GY);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=ACC;ctx.fillText('best',bx,GY-158);ctx.restore()}
 for(const w of walls){const im=IM.wall,k=w.w/im.width,sh=Math.min(im.height,w.h/k);ctx.drawImage(im,0,im.height-sh,im.width,sh,w.x-w.w/2,GY-sh*k,w.w,sh*k)}
 for(const b of birds){if(!b.a)continue;const im=IM.bird,bw=58,bh=bw*im.height/im.width;ctx.save();ctx.translate(b.x,b.y+Math.sin(t*.1+b.ph)*5);if(b.vx>0)ctx.scale(-1,1);ctx.rotate(Math.sin(t*.1+b.ph)*.12);ctx.drawImage(im,-bw/2,-bh/2,bw,bh);ctx.restore()}
 for(const f of fx){ctx.save();ctx.globalAlpha=Math.min(1,f.l);if(f.t){ctx.fillStyle=INK;ctx.font='bold 20px \"Comic Sans MS\",\"Comic Neue\",sans-serif';ctx.textAlign='center';ctx.fillText(f.t,f.x,f.y)}else{ink(2);ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x+f.vx*2,f.y+4);ctx.stroke()}ctx.restore()}
 const bob=phase==='aim'?Math.abs(Math.sin(t*.12))*-8:0,cheer=phase==='aim'||phase==='fly';
 shadow(-210,45);{const vk=phase==='fly'||phase==='dead'?'villv_happy':'villv_encourage',vh=170,vw=vh*IM[vk].width/IM[vk].height;ctx.drawImage(IM[vk],-210-vw/2,GY-vh+bob,vw,vh)}
 if(phase==='aim'||phase==='light'){bubT++;if(bubT>200){bubT=0;bub=LINES[Math.random()*LINES.length|0]}bubble([{t:bub}],-210,GY-175+bob,false)}
 drawMei(-110);drawCannon();
 if(drag&&pow>.08)preview();
 if(rag)drawRag();
 if(flash>0){const m=muz(),s=flash*60;ctx.save();ctx.translate(m.x,m.y);ctx.rotate(-ang);ctx.fillStyle='#f28a30';ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.beginPath();for(let i=0;i<10;i++){const r=i%2?s*.5:s*1.4;ctx.lineTo(Math.cos(i*Math.PI/5)*r+20,Math.sin(i*Math.PI/5)*r)}ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();flash-=.08}
 for(const s of smoke){const a=Math.max(0,s.l)*.5,g=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r);g.addColorStop(0,'rgba(135,135,142,'+a+')');g.addColorStop(1,'rgba(135,135,142,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,7);ctx.fill();s.x+=s.vx;s.y+=s.vy-.15;s.vx*=.97;s.vy*=.97;s.r+=.55;s.l-=.011}
 smoke=smoke.filter(s=>s.l>0);ctx.restore();
 ctx.save();ctx.fillStyle=MUTE;ctx.font='16px "Comic Sans MS","Comic Neue",sans-serif';ctx.textAlign='left';ctx.fillText('today: '+(cond.join(' + ')||'clear skies'),16,26);ctx.restore();
 if (phase === 'dead') {
  resT += 1/60;

  if (resT > 0.7) {
    vT = Math.min(1, (resT - 0.7) * 2.5);
  }

  if (vT > 0) {
    const e = 1 - Math.pow(1-vT, 3);
    const x = W + 170 - e*340;

    ctx.save();

    const im = IM[score < 20 ? 'villv_disappoint' : 'villv_congrats'];
    const hh = 450;
    const ww = hh * im.width / im.height;

    const sc = Math.round(score*10)/10;
    bubble(
      [{t:sc+'m!',u:sc+'m!'}, {t:comment(score),s:'20px'}],
      x-230, 190, true
    );

    ctx.drawImage(im, x-ww/2, H-hh+10, ww, hh);

    ctx.restore();
  }

  if (vT > .9) {
    ctx.save();
    ctx.fillStyle = MUTE;
    ctx.font = '18px "Comic Sans MS","Comic Neue",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('tap or press space to go again',16,H-16);
    ctx.restore();
  }
 }
 if(phase==='aim'&&!drag&&t<600){ctx.save();ctx.fillStyle=MUTE;ctx.font='20px "Comic Sans MS","Comic Neue",sans-serif';ctx.textAlign='center';ctx.fillText('drag back anywhere, then let go',W/2+120,60);ctx.restore()}
 $('vD').textContent=(rag?(phase==='dead'?score:Math.max(0,rag[1].x/PXM)):0).toFixed(1);$('vB').textContent=best?best.toFixed(1):'-';$('vS').textContent=shots;$('vL').textContent=lastS==null?'-':lastS.toFixed(1);$('pw').style.transform='scaleX('+(drag&&phase==='aim'?pow:0)+')';if(t%20===0)theme()}
let acc=0,last=performance.now();
function loop(n){acc+=Math.min(n-last,100);last=n;while(acc>=1000/60){acc-=1000/60;t++;for(const b of birds)b.x+=b.vx;for(const f of fx){f.x+=f.vx;f.y+=f.vy;f.vy+=.1;f.l-=.02}fx=fx.filter(f=>f.l>0);if(phase==='light'&&++lt>=26)fire();if(phase==='fly')step()}draw();requestAnimationFrame(loop)}
reset();theme();let cnt=0;const names=Object.keys(DATA);
names.forEach(k=>{const i=new Image();i.onload=()=>{if(++cnt===names.length)requestAnimationFrame(loop)};i.src=DATA[k];IM[k]=i});
