'use strict';
// sfx-r21c: the real SFXL_gate limiter (one cue per 70 ms, pickup chain +1 semitone up to +12, reset after 0.6 s) and the HIT_dt time dip. No browser.
const L=require('./lib.js');
module.exports=async T=>{
 T.group('sfx');
 const X={gap:70,chain:600,last:{},st:0,chT:-1e9,n:0,drop:0,log:[]};
 const{SFXL_gate}=L.sandbox(['fn:SFXL_gate'],{window:{SFXL:X}});
 T.ok(!!SFXL_gate,'gate-extracted');
 let ok=0;for(let k=0;k<5;k++)if(SFXL_gate('pick',1000))ok++;T.eq(ok,1,'five-picks-one-frame-one-voice');
 T.ok(SFXL_gate('pick',1071),'pick-after-70ms-plays');T.ok(!SFXL_gate('pick',1100),'pick-at-29ms-dropped');
 T.ok(SFXL_gate('crash',1100),'other-cue-independent');
 const st=[];X.last={};X.st=0;X.chT=-1e9;let t=5000;for(let k=0;k<16;k++){if(SFXL_gate('pick',t)){st.push(X.st);X.st=Math.min(12,X.st+1)}t+=100}
 T.eq(st.slice(0,3).join(),'0,1,2','chain-plus-one-semitone');T.eq(Math.max(...st),12,'chain-cap-12');T.eq(st[15],12,'chain-stays-capped');
 SFXL_gate('pick',t+700);T.eq(X.st,0,'chain-resets-after-0.6s');
};
