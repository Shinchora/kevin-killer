/* throw stuff at kevin */
(function(){
var A='assets_2/',F=function(n){return[A+n+'.png',0,0,1024,1023]};
var SP={body:F('boy_body'),arm:F('boy_armR'),upper:F('boy_forearmwaveR'),lower:F('boy_lowerarmwaveR'),hand:F('boy_handR'),head:F('boy_head'),hair:F('boy_hair'),ahoge:F('boy_ahoge'),happy:F('boy_happy'),confused:F('boy_confused'),joy:F('boy_joy'),tomato:[A+'tomato.png',0,0,512,512]};
var cv=document.getElementById('c'),ctx=cv.getContext('2d'),W=600,H=800,LEDGE=700,S=.66,PX=295,PY=730,IMG={};
var col={ink:'#1d1b24',wall:'#efe9df'};
var oc=document.createElement('canvas');oc.width=W;oc.height=H;var octx=oc.getContext('2d',{willReadFrequently:true});
function readCol(){var s=getComputedStyle(document.documentElement);col.ink=s.getPropertyValue('--ink').trim()||col.ink;col.wall=s.getPropertyValue('--wall').trim()||col.wall}
var k,toms,wall,bits,st,now=0;
function reset(){k={x:0,y:0,rot:0,tx:0,ty:0,tr:0,hold:0,plan:null,hurt:0,joy:0,wave:0,wv:0,next:now+2,waveEnd:0,splats:[]};toms=[];wall=[];bits=[];st={h:0,d:0,s:0,b:st?st.b:0};hud()}
function hud(){h.textContent=st.h;d.textContent=st.d;s.textContent=st.s;b.textContent=st.b}
function xf(){ctx.translate(PX+k.x,PY+k.y);ctx.rotate(k.rot);ctx.scale(S,S);ctx.translate(-516,-1023)}
function loc(px,py){var x=px-PX-k.x,y=py-PY-k.y,c=Math.cos(-k.rot),s=Math.sin(-k.rot);return[(x*c-y*s)/S+516,(x*s+y*c)/S+1023]}
function solid(px,py){if(px<0||py<0||px>=W||py>=LEDGE)return false;try{return octx.getImageData(px|0,py|0,1,1).data[3]>40}catch(e){var p=loc(px,py);return Math.hypot(p[0]-516,p[1]-300)<165||(p[0]>139&&p[0]<894&&p[1]>430)}}
function zone(px,py,m){return solid(px,py)||(m>0&&[[m,0],[-m,0],[0,m],[0,-m],[m*.7,m*.7],[-m*.7,-m*.7],[m*.7,-m*.7],[-m*.7,m*.7]].some(function(o){return solid(px+o[0],py+o[1])}))}
function throwAt(px,py){
 var wk=rnd?WK[Math.random()*4|0]:cur,aimed=zone(px,py,45)&&k.y<200;
 toms.push({sx:W/2+(px-W/2)*.5,sy:H+60,x:px,y:py,t:0,dur:WP[wk].dur,type:wk,aimed:aimed});
 if(aimed&&!k.plan&&now>k.hold&&Math.random()<WP[wk].dp){
  var side=px<PX+k.x?1:-1;if(Math.random()<.3)side=-side;
  var r=Math.random(),type=r<.4?'duck':(side>0?'right':'left');
  k.plan={at:now+.04+Math.random()*.1,type:type}}}
function dodge(){var t=k.plan.type;k.hold=now+.85;k.joy=1.6;
 if(t==='duck'){k.ty=575;k.tx=0;k.tr=0}else{k.tx=t==='left'?-80:80;k.tr=t==='left'?-.34:.34;k.ty=20}k.plan=null}
var PAL={tomato:{f:'#c4443a',hi:'#d9705e',seed:'#e8cf7c',leaf:'#2f7d2f'},pie:{f:'#f6ead0',hi:'#fffaf0',seed:'#cf3b4a',leaf:'#e0b068'}};
var WP={tomato:{dur:.42,dp:.6},pie:{dur:.5,dp:.6},brick:{dur:.55,dp:.45},knife:{dur:.3,dp:.8}},WK=['tomato','pie','brick','knife'],cur='tomato',rnd=false,X={};
function mkSplat(r,pal){var n=16,pts=[],i,a,d;for(i=0;i<n;i++){a=i/n*6.283;d=r*(i%2?.62+Math.random()*.25:.95+Math.random()*.45);pts.push([Math.cos(a)*d,Math.sin(a)*d])}
 var dots=[];for(i=0;i<8;i++){a=Math.random()*6.283;d=r*(1.25+Math.random()*.6);dots.push([Math.cos(a)*d,Math.sin(a)*d,r*(.06+Math.random()*.1)])}
 var seeds=[];for(i=0;i<6;i++){a=Math.random()*6.283;d=r*Math.random()*.6;seeds.push([Math.cos(a)*d,Math.sin(a)*d,a])}
 return{pts:pts,dots:dots,seeds:seeds,r:r,pal:pal}}
function drawSplat(g,sp,al){
 g.save();g.globalAlpha=al;g.lineJoin='round';g.lineWidth=sp.r*.07;g.strokeStyle='#2b1a1a';var pl=sp.pal||PAL.tomato;g.fillStyle=pl.f;
 var p=sp.pts,n=p.length;g.beginPath();g.moveTo((p[0][0]+p[n-1][0])/2,(p[0][1]+p[n-1][1])/2);
 for(var i=0;i<n;i++){var q=p[i],q2=p[(i+1)%n];g.quadraticCurveTo(q[0],q[1],(q[0]+q2[0])/2,(q[1]+q2[1])/2)}
 g.closePath();g.fill();g.stroke();
 sp.dots.forEach(function(q){g.beginPath();g.arc(q[0],q[1],q[2],0,7);g.fill();g.stroke()});
 g.fillStyle=pl.hi;g.beginPath();g.ellipse(-sp.r*.25,-sp.r*.3,sp.r*.3,sp.r*.14,-.5,0,7);g.fill();
 g.fillStyle=pl.seed;sp.seeds.forEach(function(q){g.beginPath();g.ellipse(q[0],q[1],sp.r*.07,sp.r*.12,q[2],0,7);g.fill()});
 g.fillStyle=pl.leaf;g.beginPath();g.ellipse(sp.r*.3,sp.r*.15,sp.r*.12,sp.r*.05,.8,0,7);g.fill();
 g.restore()}
var AC=null,muted=false;
var SPLA=new Audio('assets_2/tomato_splash.mp3');SPLA.preload='auto';
function ac(){try{if(!AC){AC=new(window.AudioContext||window.webkitAudioContext)();}if(AC.state==='suspended')AC.resume()}catch(e){}return AC}
function snd(big,rate){if(muted||!AC)return;try{if(SPLA){var au=SPLA.cloneNode();au.volume=big?1:.55;au.playbackRate=(rate||1)*(big?1:1.2+Math.random()*.15);var pr=au.play();if(pr&&pr.catch)pr.catch(function(){});return}var t=AC.currentTime,len=Math.floor(AC.sampleRate*.28),buf=AC.createBuffer(1,len,AC.sampleRate),dat=buf.getChannelData(0),i;
 for(i=0;i<len;i++)dat[i]=(Math.random()*2-1)*Math.pow(1-i/len,2);
 var n=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();n.buffer=buf;f.type='lowpass';f.frequency.setValueAtTime(big?2400:1400,t);f.frequency.exponentialRampToValueAtTime(300,t+.22);
 g.gain.setValueAtTime(big?.9:.45,t);g.gain.exponentialRampToValueAtTime(.001,t+.28);n.connect(f);f.connect(g);g.connect(AC.destination);n.start(t);
 var o=AC.createOscillator(),og=AC.createGain();o.frequency.setValueAtTime(big?190:140,t);o.frequency.exponentialRampToValueAtTime(45,t+.16);
 og.gain.setValueAtTime(big?.7:.35,t);og.gain.exponentialRampToValueAtTime(.001,t+.2);o.connect(og);og.connect(AC.destination);o.start(t);o.stop(t+.22)}catch(e){}}
function tone(f0,f1,dur,g,type){if(muted||!AC)return;try{var t=AC.currentTime,o=AC.createOscillator(),og=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);og.gain.setValueAtTime(g,t);og.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(og);og.connect(AC.destination);o.start(t);o.stop(t+dur+.02)}catch(e){}}
function noise(dur,fc,g){if(muted||!AC)return;try{var t=AC.currentTime,len=Math.floor(AC.sampleRate*dur),buf=AC.createBuffer(1,len,AC.sampleRate),dat=buf.getChannelData(0),i;for(i=0;i<len;i++)dat[i]=(Math.random()*2-1)*(1-i/len);var n=AC.createBufferSource(),f=AC.createBiquadFilter(),gn=AC.createGain();n.buffer=buf;f.type='lowpass';f.frequency.value=fc;gn.gain.value=g;n.connect(f);f.connect(gn);gn.connect(AC.destination);n.start(t)}catch(e){}}
function thud(big){tone(big?140:110,40,.22,big?.9:.6);noise(.12,big?900:600,big?.5:.35)}
function clink(){tone(2400,1800,.18,.25,'triangle');tone(3600,2800,.12,.15,'triangle')}
function thunk(){tone(300,120,.1,.5,'square');noise(.05,2000,.2)}
function burst(m,c,n,sp){for(var i=0;i<n;i++)bits.push({x:m.x,y:m.y,vx:(Math.random()-.5)*sp,vy:-Math.random()*sp*.8,a:1,c:c})}
function arrive(m){
 var hit=zone(m.x,m.y,0),ty=m.type||'tomato',sp=ty==='tomato'||ty==='pie';
 if(hit){
  var l=loc(m.x,m.y);k.plan=null;k.joy=0;st.h++;st.s=0;
  if(sp){snd(1,ty==='pie'?.8:1);k.splats.push({x:l[0],y:l[1],a:1,dy:0,rt:Math.random()*6.28,o:(Math.random()-.5)*40,sp:mkSplat(85,PAL[ty])});if(k.splats.length>6)k.splats.shift();k.hurt=1.2;burst(m,PAL[ty].f,12,460)}
  else if(ty==='brick'){thud(1);k.hurt=1.8;burst(m,'#b5533c',8,520);burst(m,'#9a968f',10,380);burst(m,'#ffd23f',6,500)}
  else{clink();k.hurt=.8;burst(m,'#e8eef5',10,600);burst(m,'#ffd23f',5,500)}
 }else{
  if(sp){snd(0,ty==='pie'?.8:1);wall.push({kind:'splat',x:m.x,y:m.y,a:1,sp:mkSplat(48,PAL[ty]),rt:Math.random()*6.28})}
  else if(ty==='brick'){thud(0);wall.push({kind:'crack',x:m.x,y:m.y,a:1,rt:Math.random()*6.28});burst(m,'#9a968f',8,300)}
  else{thunk();wall.push({kind:'knife',x:m.x,y:m.y,a:1.8,rt:-.5+Math.random()})}
  if(wall.length>14)wall.shift();
  if(m.aimed){st.d++;st.s++;if(st.s>st.b)st.b=st.s}}
 hud()}
function ease(a,t,dt,r){return a+(t-a)*(1-Math.exp(-dt*r))}
function update(dt){now+=dt;
 if(k.plan&&now>=k.plan.at)dodge();
 if(now>k.hold&&k.hurt<=0){k.tx=0;k.ty=0;k.tr=0}
 if(k.hurt>0){k.hurt-=dt;k.tr=Math.sin(now*40)*.04*Math.min(1,k.hurt)}
 if(k.joy>0)k.joy-=dt;
 k.x=ease(k.x,k.tx,dt,20);k.y=ease(k.y,k.ty,dt,20);k.rot=ease(k.rot,k.tr,dt,20);
 if(k.hurt>0||k.y>100||Math.abs(k.tr)>.1||toms.length||now<k.hold){k.wave=0;k.waveEnd=0}else if(k.waveEnd>now){k.wave=1}else if(now>k.next){k.waveEnd=now+1.8+Math.random()*.8;k.next=k.waveEnd+3+Math.random()*5;k.wave=1}else k.wave=0;
 k.wv=ease(k.wv,k.wave,dt,7);k.splats.forEach(function(s){s.dy+=dt*5;s.a-=dt*.15});k.splats=k.splats.filter(function(s){return s.a>0});
 wall.forEach(function(s){s.a-=dt*.1});wall=wall.filter(function(s){return s.a>0});
 bits.forEach(function(p){p.vy+=900*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.a-=dt*1.6});bits=bits.filter(function(p){return p.a>0});
 for(var i=toms.length-1;i>=0;i--){var m=toms[i];m.t+=dt;if(m.t>=m.dur){arrive(m);toms.splice(i,1)}}}
function img(n,rot,jx,jy){var q=SP[n],im=IMG[n];if(!im)return;ctx.save();if(rot){ctx.translate(jx,jy);ctx.rotate(rot);ctx.drawImage(im,q[1]-jx,q[2]-jy,q[3],q[4])}else ctx.drawImage(im,q[1],q[2],q[3],q[4]);ctx.restore()}
function face(){
 img(k.hurt>0?'confused':(k.joy>0?'joy':'happy'))}
function kevin(){
 var main=ctx;ctx=octx;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);ctx.save();xf();
 var t=now,sw=function(a,f,p){return Math.sin(t*f+p)*a};
 img('body');
 var wv=k.wv,fo=(1-wv)*2.4;
 if(wv<.99){ctx.globalAlpha=1-Math.min(1,wv*2.5);img('arm');ctx.globalAlpha=1}
 if(wv>.01){ctx.globalAlpha=Math.min(1,wv*2.5);
  var wa=sw(.05,5,0)*wv,ha=sw(.15,5,1)*wv;
  ctx.save();ctx.translate(805,500);ctx.rotate((1-wv)*.2);ctx.translate(-805,-500);
  img('upper');ctx.save();ctx.translate(812,990);ctx.rotate(wa+fo);ctx.translate(-812,-990);img('lower');
  img('hand',ha,790,668);ctx.restore();ctx.restore();ctx.globalAlpha=1}
 img('head');face();
 img('hair',sw(.012,2,0)+(k.hurt>0?sw(.03,40,0):0),515,130);
 img('ahoge',sw(.07,3,0)+(k.y>200?sw(.1,12,0):0),430,150);
 ctx.globalCompositeOperation='source-atop';
 k.splats.forEach(function(s){ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.rt);drawSplat(ctx,s.sp,s.a);ctx.restore();
  var L=Math.min(s.dy*30,170),x=s.x+s.o;ctx.globalAlpha=s.a;ctx.fillStyle=s.sp.pal.f;ctx.fillRect(x-6,s.y,12,L);ctx.beginPath();ctx.arc(x,s.y+L,9,0,7);ctx.fill();ctx.globalAlpha=1});
 ctx.globalCompositeOperation='source-over';ctx.restore();ctx=main;ctx.save();ctx.beginPath();ctx.rect(0,0,W,LEDGE);ctx.clip();ctx.drawImage(oc,0,0);ctx.restore()}
function tomato(x,y,d,rot){var q=SP.tomato,im=IMG.tomato;if(!im)return;ctx.save();ctx.translate(x,y);ctx.rotate(rot);var w=d*q[3]/407,hh=d*q[4]/407;ctx.drawImage(im,-w/2,-hh/2,w,hh);ctx.restore()}
function drawKnife(g,L){g.lineJoin='round';g.lineWidth=4;g.strokeStyle='#2b1a1a';
 g.fillStyle='#4a3426';g.beginPath();g.rect(-L/2,-L*.05,L*.36,L*.1);g.fill();g.stroke();
 g.fillStyle='#8a8f99';g.beginPath();g.rect(-L*.14,-L*.09,L*.05,L*.18);g.fill();g.stroke();
 g.fillStyle='#dfe6ee';g.beginPath();g.moveTo(-L*.09,-L*.06);g.lineTo(L*.34,-L*.06);g.quadraticCurveTo(L*.46,-L*.04,L*.5,L*.03);g.lineTo(-L*.09,L*.06);g.closePath();g.fill();g.stroke();
 g.strokeStyle='#fff';g.lineWidth=3;g.beginPath();g.moveTo(-L*.04,-L*.02);g.lineTo(L*.32,-L*.02);g.stroke()}
function weapon(ty,x,y,d,rot){
 if(ty==='tomato'){tomato(x,y,d,rot);return}
 var im=X[ty];ctx.save();ctx.translate(x,y);ctx.rotate(rot);
 if(im){var w=d*512/407;ctx.drawImage(im,-w/2,-w*im.height/im.width/2,w,w*im.height/im.width)}
 else if(ty==='pie'){var r=d*.5;ctx.lineWidth=4;ctx.strokeStyle='#2b1a1a';ctx.fillStyle='#d9a35f';ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle='#fff3da';ctx.beginPath();ctx.arc(0,0,r*.78,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle='#ffffff';ctx.beginPath();ctx.ellipse(-r*.25,-r*.3,r*.3,r*.12,-.5,0,7);ctx.fill();
  ctx.fillStyle='#cf3b4a';ctx.beginPath();ctx.arc(r*.12,r*.05,r*.15,0,7);ctx.fill();ctx.stroke()}
 else if(ty==='brick'){var bw=d*1.15,bh=d*.58;ctx.lineWidth=4;ctx.strokeStyle='#2b1a1a';ctx.fillStyle='#b5533c';ctx.beginPath();ctx.rect(-bw/2,-bh/2,bw,bh);ctx.fill();ctx.stroke();
  ctx.fillStyle='#8e3d2c';ctx.beginPath();ctx.ellipse(-bw*.18,0,bw*.07,bh*.16,0,0,7);ctx.ellipse(bw*.18,0,bw*.07,bh*.16,0,0,7);ctx.fill();
  ctx.strokeStyle='#d98a72';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-bw*.42,-bh*.32);ctx.lineTo(bw*.3,-bh*.32);ctx.stroke()}
 else drawKnife(ctx,d*1.6);
 ctx.restore()}
function drawWall(s){var al=Math.min(1,s.a);ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.rt);
 if(s.kind==='crack'){ctx.globalAlpha=al*.8;ctx.strokeStyle='#4a4038';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();for(var i=0;i<7;i++){var a=i*.9,l=18+((i*37)%30);ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*l*.6,Math.sin(a)*l*.6);ctx.lineTo(Math.cos(a+.3)*l,Math.sin(a+.3)*l)}ctx.stroke();ctx.fillStyle='#4a4038';ctx.beginPath();ctx.arc(0,0,5,0,7);ctx.fill()}
 else if(s.kind==='knife'){ctx.globalAlpha=al;ctx.translate(-120,0);drawKnife(ctx,240)}
 else drawSplat(ctx,s.sp,al*.9);
 ctx.restore()}
function draw(){
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=col.wall;ctx.fillRect(0,0,W,H);
 ctx.strokeStyle=col.ink;ctx.globalAlpha=.07;ctx.lineWidth=2;for(var y=60;y<LEDGE;y+=70){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}ctx.globalAlpha=1;
 wall.forEach(drawWall);
 kevin();
 ctx.fillStyle=col.wall;ctx.fillRect(0,LEDGE,W,H-LEDGE);ctx.strokeStyle=col.ink;ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,LEDGE);ctx.lineTo(W,LEDGE);ctx.stroke();
 wall.forEach(function(s){if(s.y>LEDGE)drawWall(s)});
 toms.forEach(function(m){var p=m.t/m.dur,e=1-Math.pow(1-p,1.6);weapon(m.type||'tomato',m.sx+(m.x-m.sx)*e,m.sy+(m.y-m.sy)*e-Math.sin(Math.PI*p)*110,130-70*p,m.t*14)});
 bits.forEach(function(q){ctx.globalAlpha=q.a;ctx.fillStyle=q.c||'#c4443a';ctx.beginPath();ctx.arc(q.x,q.y,6,0,7);ctx.fill()});ctx.globalAlpha=1}
cv.addEventListener('pointerdown',function(e){e.preventDefault();ac();var r=cv.getBoundingClientRect();throwAt((e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height)});
document.getElementById('rs').addEventListener('click',function(){reset();this.blur()});
function pick(w){rnd=w==='random';if(!rnd)cur=w;[].forEach.call(document.querySelectorAll('#pk button'),function(b){b.classList.toggle('on',b.dataset.w===(rnd?'random':cur))})}
[].forEach.call(document.querySelectorAll('#pk button'),function(b){b.addEventListener('click',function(){pick(b.dataset.w);b.blur()})});
['pie','brick','knife'].forEach(function(n){var im=new Image();im.onload=function(){X[n]=im};im.src=A+n+'.png'});  /* optional: drop your own pie.png / brick.png / knife.png in assets_2 */
pick('tomato');
function tglSnd(){muted=!muted;document.getElementById('sn').textContent='Sound: '+(muted?'off':'on')}
document.getElementById('sn').addEventListener('click',function(){ac();tglSnd();this.blur()});
addEventListener('keydown',function(e){if(e.key==='m'||e.key==='M')tglSnd();var kk=e.key.toLowerCase();if('12345'.indexOf(e.key)>-1&&e.key.length===1)pick(['tomato','pie','brick','knife','random'][+e.key-1]);if(kk==='d'){var r0=document.documentElement,dk=r0.getAttribute('data-theme')?r0.getAttribute('data-theme')==='dark':matchMedia('(prefers-color-scheme: dark)').matches;r0.setAttribute('data-theme',dk?'light':'dark')}if(kk==='escape'||kk==='q')location.href='index.html';if(e.key==='r'||e.key==='R')reset()});
var last=0;function frame(t){var dt=Math.min(.05,(t-last)/1000||0);last=t;readCol();update(dt);draw();requestAnimationFrame(frame)}
var n=0,keys=Object.keys(SP);
keys.forEach(function(key){var im=new Image();im.onload=im.onerror=function(){if(++n===keys.length){reset();requestAnimationFrame(frame)}};IMG[key]=im;im.src=SP[key][0]});
})();
