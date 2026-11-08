
(function(){
var A='assets_2/',F=function(n){return[A+n+'.png',0,0,1024,1023]};
var SP={body:F('boy_body'),arm:F('boy_armR'),upper:F('boy_forearmwaveR'),lower:F('boy_lowerarmwaveR'),hand:F('boy_handR'),head:F('boy_head'),hair:F('boy_hair'),ahoge:F('boy_ahoge'),happy:F('boy_happy'),confused:F('boy_confused'),joy:F('boy_joy'),tomato:[A+'tomato.png',0,0,512,512]};
var cv=document.getElementById('c'),ctx=cv.getContext('2d'),W=600,H=800,LEDGE=700,S=.66,PX=295,PY=730,IMG={};
var col={ink:'#1d1b24',wall:'#efe9df'};
var oc=document.createElement('canvas');oc.width=W;oc.height=H;var octx=oc.getContext('2d',{willReadFrequently:true});
function readCol(){var s=getComputedStyle(document.documentElement);col.ink=s.getPropertyValue('--ink').trim()||col.ink;col.wall=s.getPropertyValue('--wall').trim()||col.wall}
var k,toms,wall,bits,st,now=0;

var GI=new Image(),GN={t:9,show:0,tx:300,ty:400},GP={x:560,y:860,s:.42,bx:780,by:860,mx:318,my:188},GA=Math.atan2(GP.my-GP.by,GP.mx-GP.bx);GI.src=A+'holding_gun.png';
function gunRot(){return Math.atan2(GN.ty-GP.y,GN.tx-GP.x)-GA}
function gunMuz(){var r=gunRot(),dx=(GP.mx-GP.bx)*GP.s,dy=(GP.my-GP.by)*GP.s,c=Math.cos(r),s=Math.sin(r);return{x:GP.x+dx*c-dy*s,y:GP.y+dx*s+dy*c}}
function gunShot(px,py){GN.tx=px;GN.ty=py;GN.t=0;noise(.1,5000,.5);tone(320,60,.09,.4,'square');return gunMuz()}
function gunArm(){if(GN.show<.01||!GI.width)return;var r=gunRot(),t=GN.t,rec=Math.exp(-t*16),back=rec*18+(1-GN.show)*170,a=r+GA,m=gunMuz();
 ctx.save();ctx.globalAlpha=Math.min(1,GN.show*2);ctx.translate(GP.x-Math.cos(a)*back,GP.y-Math.sin(a)*back);ctx.rotate(r-rec*.07);ctx.scale(GP.s,GP.s);ctx.drawImage(GI,-GP.bx,-GP.by);ctx.restore();
 if(t<.08){var f=1-t/.08;ctx.save();ctx.translate(m.x,m.y);ctx.rotate(a);ctx.fillStyle='#ffd23f';ctx.strokeStyle='#2b1a1a';ctx.lineWidth=3;ctx.beginPath();for(var i=0;i<10;i++){var q=i%2?9:(28+f*18);ctx.lineTo(Math.cos(i*Math.PI/5)*q+10,Math.sin(i*Math.PI/5)*q)}ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}}
function reset(){k={x:0,y:0,rot:0,tx:0,ty:0,tr:0,hold:0,plan:null,hurt:0,joy:0,wave:0,wv:0,next:now+2,waveEnd:0,splats:[]};toms=[];wall=[];bits=[];st={h:0,d:0,s:0,b:st?st.b:0};hud()}
function hud(){h.textContent=st.h;d.textContent=st.d;s.textContent=st.s;b.textContent=st.b}
function xf(){ctx.translate(PX+k.x,PY+k.y);ctx.rotate(k.rot);ctx.scale(S,S);ctx.translate(-516,-1023)}
function loc(px,py){var x=px-PX-k.x,y=py-PY-k.y,c=Math.cos(-k.rot),s=Math.sin(-k.rot);return[(x*c-y*s)/S+516,(x*s+y*c)/S+1023]}
function solid(px,py){if(px<0||py<0||px>=W||py>=LEDGE)return false;try{return octx.getImageData(px|0,py|0,1,1).data[3]>40}catch(e){var p=loc(px,py);return Math.hypot(p[0]-516,p[1]-300)<165||(p[0]>139&&p[0]<894&&p[1]>430)}}
function zone(px,py,m){return solid(px,py)||(m>0&&[[m,0],[-m,0],[0,m],[0,-m],[m*.7,m*.7],[-m*.7,-m*.7],[m*.7,-m*.7],[-m*.7,m*.7]].some(function(o){return solid(px+o[0],py+o[1])}))}
function throwAt(px,py){
 var wk=rnd?WK[Math.random()*WK.length|0]:cur,aimed=zone(px,py,45)&&k.y<200,gm=wk==='gun'?gunShot(px,py):null;
 toms.push({sx:gm?gm.x:W/2+(px-W/2)*.5,sy:gm?gm.y:H+60,x:px,y:py,t:0,dur:WP[wk].dur,type:wk,aimed:aimed});
 if(aimed&&!k.plan&&now>k.hold&&Math.random()<WP[wk].dp){
  var side=px<PX+k.x?1:-1;if(Math.random()<.3)side=-side;
  var r=Math.random(),type=r<.4?'duck':(side>0?'right':'left');
  k.plan={at:now+.04+Math.random()*.1,type:type}}}
function dodge(){var t=k.plan.type;k.hold=now+.85;k.joy=1.6;
 if(t==='duck'){k.ty=575;k.tx=0;k.tr=0}else{k.tx=t==='left'?-80:80;k.tr=t==='left'?-.34:.34;k.ty=20}k.plan=null}
var PAL={
  tomato:{
    f:'#c4443a',hi:'#d9705e',
    seed:'#e8cf7c',leaf:'#2f7d2f'
  },
  pie:{
    f:'#f6ead0',hi:'#fffaf0',
    seed:'#cf3b4a',leaf:'#e0b068'
  },
  hit:{
    f:'#b83232',hi:'#e45b5b',
    seed:'#b83232',leaf:'#b83232'
  }
};var WP={tomato:{dur:.42,dp:.6},pie:{dur:.5,dp:.6},brick:{dur:.55,dp:.45},gun:{dur:.1,dp:.12}},WK=['tomato','pie','brick','gun'],cur='tomato',rnd=false,X={},SC={pie:.88,brick:.8};
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
 if(sp.pal !== PAL.hit){
  g.fillStyle=pl.hi;
  g.beginPath();
  g.ellipse(-sp.r*.25,-sp.r*.3,sp.r*.3,sp.r*.14,-.5,0,7);
  g.fill();
}
 g.fillStyle=pl.seed;sp.seeds.forEach(function(q){g.beginPath();g.ellipse(q[0],q[1],sp.r*.07,sp.r*.12,q[2],0,7);g.fill()});
 g.fillStyle=pl.leaf;g.beginPath();g.ellipse(sp.r*.3,sp.r*.15,sp.r*.12,sp.r*.05,.8,0,7);g.fill();
 if(sp.pal === PAL.hit){
  g.fillStyle='#171219';
  g.beginPath();
  g.arc(0,0,sp.r*.20,0,Math.PI*2);
  g.fill();
  g.strokeStyle='#521b25';
  g.lineWidth=3;
  g.stroke();
}
 g.restore()}
var AC=null,muted=false;
var SPLA=new Audio('assets_2/tomato splash.mp3');SPLA.preload='auto';
var SFX={};['break brick','pie splat','gunshot'].forEach(function(n){var a=new Audio('assets_2/'+n+'.mp3');a.preload='auto';a.addEventListener('canplaythrough',function(){SFX[n]=a})});
function play(n,vol,rate){var a=SFX[n];if(muted||!a)return false;try{var c=a.cloneNode();c.volume=vol;c.playbackRate=rate||1;var pr=c.play();if(pr&&pr.catch)pr.catch(function(){})}catch(e){return false}return true}
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
function burst(m,c,n,sp){for(var i=0;i<n;i++)bits.push({x:m.x,y:m.y,vx:(Math.random()-.5)*sp,vy:-Math.random()*sp*.8,a:1,c:c})}
function bang(h){noise(h?.1:.07,h?2500:1800,h?.5:.3);tone(h?220:160,50,.1,.35,'square')}
function arrive(m){
 var hit=zone(m.x,m.y,0),ty=m.type||'tomato',sp=ty==='tomato'||ty==='pie';
 if(hit){
  var l=loc(m.x,m.y);k.plan=null;k.joy=0;st.h++;st.s=0;
  if(sp){(ty==='pie'&&play('pie splat',1))||snd(1,ty==='pie'?.8:1);k.splats.push({x:l[0],y:l[1],a:1,dy:0,rt:Math.random()*6.28,o:(Math.random()-.5)*40,sp:mkSplat(85,PAL[ty])});if(k.splats.length>6)k.splats.shift();k.hurt=1.2;burst(m,PAL[ty].f,12,460)}
  else if(ty==='brick'){play('break brick',1)||thud(1);k.hurt=1.8;burst(m,'#b5533c',8,520);burst(m,'#9a968f',10,380);burst(m,'#ffd23f',6,500)}
  else if(ty==='gun'){
  play('gunshot',1)||bang(true);
  k.splats.push({
    x:l[0],
    y:l[1],
    a:1,
    dy:0,
    rt:Math.random()*6.28,
    o:(Math.random()-.5)*20,
    sp:mkSplat(45,PAL.hit)
  });

  if(k.splats.length>6) k.splats.shift();

  k.hurt=1.5;
  burst(m,'#b83232',8,300);
  burst(m,'#ffd23f',9,520);
  burst(m,'#ebebeb',8,360);
} }else{
  if(sp){(ty==='pie'&&play('pie splat',.55,1.15))||snd(0,ty==='pie'?.8:1);wall.push({kind:'splat',x:m.x,y:m.y,a:1,sp:mkSplat(48,PAL[ty]),rt:Math.random()*6.28})}
  else if(ty==='brick'){play('break brick',.5,1.1)||thud(0);wall.push({kind:'crack',x:m.x,y:m.y,a:1,rt:Math.random()*6.28});burst(m,'#9a968f',8,300)}
  else if(ty==='gun'){play('gunshot',.5,1.1)||thud(0);wall.push({kind:'hole',x:m.x,y:m.y,a:1,rt:Math.random()*6.28});burst(m,'#9a968f',6,260)}
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
 GN.t+=dt;GN.show=ease(GN.show,GN.t<.9?1:0,dt,16);
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
  var L=Math.min(s.dy*30,170),x=s.x+s.o;ctx.globalAlpha=s.a;ctx.fillStyle=s.sp.pal.f;var dropY=s.y+35;ctx.fillRect(x-6,dropY,12,L);ctx.beginPath();ctx.arc(x,s.y+L,9,0,7);ctx.fill();ctx.globalAlpha=1});
 ctx.globalCompositeOperation='source-over';ctx.restore();ctx=main;ctx.save();ctx.beginPath();ctx.rect(0,0,W,LEDGE);ctx.clip();ctx.drawImage(oc,0,0);ctx.restore()}
function tomato(x,y,d,rot){var q=SP.tomato,im=IMG.tomato;if(!im)return;ctx.save();ctx.translate(x,y);ctx.rotate(rot);var w=d*q[3]/407,hh=d*q[4]/407;ctx.drawImage(im,-w/2,-hh/2,w,hh);ctx.restore()}
function weapon(ty,x,y,d,rot){
 if(ty==='tomato'){tomato(x,y,d,rot);return}
 var im=X[ty];ctx.save();ctx.translate(x,y);ctx.rotate(rot);
 if(im){var w=d*512/407*(SC[ty]||1);ctx.drawImage(im,-w/2,-w*im.height/im.width/2,w,w*im.height/im.width)}
 else if(ty==='pie'){var r=d*.5;ctx.lineWidth=4;ctx.strokeStyle='#2b1a1a';ctx.fillStyle='#d9a35f';ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle='#fff3da';ctx.beginPath();ctx.arc(0,0,r*.78,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle='#ffffff';ctx.beginPath();ctx.ellipse(-r*.25,-r*.3,r*.3,r*.12,-.5,0,7);ctx.fill();
  ctx.fillStyle='#cf3b4a';ctx.beginPath();ctx.arc(r*.12,r*.05,r*.15,0,7);ctx.fill();ctx.stroke()}
 else if(ty==='brick'){var bw=d*1.15,bh=d*.58;ctx.lineWidth=4;ctx.strokeStyle='#2b1a1a';ctx.fillStyle='#b5533c';ctx.beginPath();ctx.rect(-bw/2,-bh/2,bw,bh);ctx.fill();ctx.stroke();
  ctx.fillStyle='#8e3d2c';ctx.beginPath();ctx.ellipse(-bw*.18,0,bw*.07,bh*.16,0,0,7);ctx.ellipse(bw*.18,0,bw*.07,bh*.16,0,0,7);ctx.fill();
  ctx.strokeStyle='#d98a72';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-bw*.42,-bh*.32);ctx.lineTo(bw*.3,-bh*.32);ctx.stroke()}

 ctx.restore()}
function drawWall(s){var al=Math.min(1,s.a);ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.rt);
 if(s.kind==='crack'){ctx.globalAlpha=al*.8;ctx.strokeStyle='#4a4038';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();for(var i=0;i<7;i++){var a=i*.9,l=18+((i*37)%30);ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*l*.6,Math.sin(a)*l*.6);ctx.lineTo(Math.cos(a+.3)*l,Math.sin(a+.3)*l)}ctx.stroke();ctx.fillStyle='#4a4038';ctx.beginPath();ctx.arc(0,0,5,0,7);ctx.fill()}
 else if(s.kind==='hole'){ctx.globalAlpha=al*.9;ctx.fillStyle='#2b1a1a';ctx.beginPath();ctx.arc(0,0,6,0,7);ctx.fill();ctx.strokeStyle='#4a4038';ctx.lineWidth=2;ctx.lineCap='round';ctx.beginPath();for(var i=0;i<5;i++){var a=i*1.26;ctx.moveTo(Math.cos(a)*6,Math.sin(a)*6);ctx.lineTo(Math.cos(a)*(14+i*3),Math.sin(a)*(14+i*3))}ctx.stroke()}
 else drawSplat(ctx,s.sp,al*.9);
 ctx.restore()}
function draw(){
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=col.wall;ctx.fillRect(0,0,W,H);
 ctx.strokeStyle=col.ink;ctx.globalAlpha=.07;ctx.lineWidth=2;for(var y=60;y<LEDGE;y+=70){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}ctx.globalAlpha=1;
 wall.forEach(drawWall);
 kevin();
 ctx.fillStyle=col.wall;ctx.fillRect(0,LEDGE,W,H-LEDGE);ctx.strokeStyle=col.ink;ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,LEDGE);ctx.lineTo(W,LEDGE);ctx.stroke();
 wall.forEach(function(s){if(s.y>LEDGE)drawWall(s)});
 toms.forEach(function(m){
 if(m.type==='gun'){var q=m.t/m.dur,x=m.sx+(m.x-m.sx)*q,y=m.sy+(m.y-m.sy)*q,L=Math.hypot(m.x-m.sx,m.y-m.sy)||1,ux=(m.x-m.sx)/L,uy=(m.y-m.sy)/L;ctx.save();ctx.lineCap='round';ctx.strokeStyle='#ffd23f';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x-ux*70,y-uy*70);ctx.lineTo(x,y);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-ux*40,y-uy*40);ctx.lineTo(x,y);ctx.stroke();ctx.restore();return}
 var p=m.t/m.dur,e=1-Math.pow(1-p,1.6);weapon(m.type||'tomato',m.sx+(m.x-m.sx)*e,m.sy+(m.y-m.sy)*e-Math.sin(Math.PI*p)*110,130-70*p,m.t*14)});
 bits.forEach(function(q){ctx.globalAlpha=q.a;ctx.fillStyle=q.c||'#c4443a';ctx.beginPath();ctx.arc(q.x,q.y,6,0,7);ctx.fill()});ctx.globalAlpha=1;gunArm()}
cv.addEventListener('pointerdown',function(e){e.preventDefault();ac();var r=cv.getBoundingClientRect();throwAt((e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height)});
document.getElementById('rs').addEventListener('click',function(){reset();this.blur()});
function pick(w){rnd=w==='random';if(!rnd)cur=w;[].forEach.call(document.querySelectorAll('#pk button'),function(b){b.classList.toggle('on',b.dataset.w===(rnd?'random':cur))})}
(function(){var pk=document.getElementById('pk'),bs=pk.querySelectorAll('button'),g=document.createElement('button');g.type='button';g.dataset.w='gun';pk.insertBefore(g,bs[bs.length-1]);[].forEach.call(pk.querySelectorAll('button'),function(b,i){b.textContent=(i+1)+' '+b.dataset.w});var h=document.querySelector('.hint');if(h)h.textContent=h.textContent.replace('1-4','1-5')})();
[].forEach.call(document.querySelectorAll('#pk button'),function(b){b.addEventListener('click',function(){pick(b.dataset.w);b.blur()})});
['pie','brick'].forEach(function(n){var im=new Image();im.onload=function(){X[n]=im};im.src=A+n+'.png'});  
pick('tomato');
function tglSnd(){muted=!muted;document.getElementById('sn').textContent='Sound: '+(muted?'off':'on')}
document.getElementById('sn').addEventListener('click',function(){ac();tglSnd();this.blur()});
addEventListener('keydown',function(e){if(e.key==='m'||e.key==='M')tglSnd();var kk=e.key.toLowerCase();if('12345'.indexOf(e.key)>-1&&e.key.length===1)pick(['tomato','pie','brick','gun','random'][+e.key-1]);if(kk==='d'){var r0=document.documentElement,dk=r0.getAttribute('data-theme')?r0.getAttribute('data-theme')==='dark':matchMedia('(prefers-color-scheme: dark)').matches;r0.setAttribute('data-theme',dk?'light':'dark')}if(kk==='escape'||kk==='q')location.href='index.html';if(e.key==='r'||e.key==='R')reset()});
var last=0;function frame(t){var dt=Math.min(.05,(t-last)/1000||0);last=t;readCol();update(dt);draw();requestAnimationFrame(frame)}
var n=0,keys=Object.keys(SP);
keys.forEach(function(key){var im=new Image();im.onload=im.onerror=function(){if(++n===keys.length){reset();requestAnimationFrame(frame)}};IMG[key]=im;im.src=SP[key][0]});
})();
