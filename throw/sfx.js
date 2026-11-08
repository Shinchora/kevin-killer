

(function(){
  var C=null,buf={};
  function ctx(){
    if(!C){var A=window.AudioContext||window.webkitAudioContext;if(!A)return null;C=new A()}
    return C;
  }
  function load(name,url){
    var c=ctx();if(!c)return;
    fetch(encodeURI(url)).then(function(r){return r.arrayBuffer()}).then(function(ab){
      return new Promise(function(res,rej){
        var p=c.decodeAudioData(ab,res,rej); 
        if(p&&p.then)p.then(res,rej);
      });
    }).then(function(b){buf[name]=b}).catch(function(e){console.log('sfx load failed:',name,e)});
  }
  
  function unlock(){
    var c=ctx();if(!c)return;
    if(c.state!=='running')c.resume();
    try{var s=c.createBufferSource();s.buffer=c.createBuffer(1,1,22050);s.connect(c.destination);s.start(0)}catch(e){}
  }
  ['pointerdown','pointerup','touchstart','touchend','mousedown','mouseup','click','keydown'].forEach(function(ev){addEventListener(ev,unlock,{passive:true})});
  document.addEventListener('visibilitychange',function(){if(!document.hidden&&C&&C.state!=='running')C.resume()});
  function play(name,vol,rate){
    var c=ctx(),b=buf[name];
    if(!c||!b)return false;
    function start(){
      var s=c.createBufferSource(),g=c.createGain();
      s.buffer=b;s.playbackRate.value=rate||1;g.gain.value=vol==null?1:vol;
      s.connect(g);g.connect(c.destination);s.start(0);
    }
    if(c.state==='running'){start();return true}
    
    var t0=Date.now();
    try{c.resume().then(function(){if(Date.now()-t0<250)start()}).catch(function(){})}catch(e){}
    return true;
  }
  window.Sfx={load:load,play:play,unlock:unlock};
})();
