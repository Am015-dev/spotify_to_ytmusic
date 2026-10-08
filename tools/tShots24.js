// tShots24.js: drive24 review shots at 852×393 (phone layout). Fresh Frankfurt story → Hot Drop: follow Hilde along the GPS route
// with human-like keyboard steering (in-page key events, 0.15 s lag) and shoot (1) the turn cue on the arrow + minimap route when a
// turn is announced, (2) mid-turn, (3) Hilde's tow truck blinking before a corner. Logs the cue texts and console errors.
// usage: node tools/tShots24.js <url> <outdir>
const fs=require('fs');const{chromium,boot}=require('./d24lib');const URL=process.argv[2],OUT=process.argv[3]||'qa24/shots';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const{p,errs,shot}=await boot(b,{city:'fra',url:URL,phone:true});
 const st=await p.evaluate(()=>__g9ev(`JSON.stringify({ch:!!RO.ch,kind:RO.ch&&RO.ch.kind,si:RO.ch&&RO.ch.v2&&RO.ch.v2.si,t:RO.ch&&RO.ch.v2&&RO.ch.v2.L.st[RO.ch.v2.si].t})`));console.log('state',st);
 await shot(OUT+'/s0_start.jpg');
 // in-page driver: follows QV.nav.P (the route the minimap shows); returns when a shot condition is met or after maxF frames
 await p.evaluate(()=>{const kd=(c,on)=>dispatchEvent(new KeyboardEvent(on?'keydown':'keyup',{code:c,key:c,bubbles:true}));const cur={};const set=(c,on)=>{if(!!cur[c]!==on){cur[c]=on;kd(c,on)}};const ad=a=>Math.atan2(Math.sin(a),Math.cos(a));
  window.__d24go=(maxF,want)=>__g9ev(`(()=>{const hist=[];let st=0,f=0,cues=[];while(f<${maxF}){
   if(M1&&M1.cs){M1_csEnd&&M1_csEnd()}const R=RO;hist.push([R.x,R.z,R.h,R.v,R.yr||0]);const o=hist[Math.max(0,hist.length-4)];const N=QV.nav;let c=null;try{c=D24_cue()}catch(e){}
   if(c&&c.t&&(!cues.length||cues[cues.length-1]!==c.txt))cues.push(c.txt);
   const want='${want}';if(want==='cue'&&c&&c.t&&c.d>40&&c.d<120&&R.v>8)return{f,why:'cue',txt:c.txt,cues};if(want==='mid'&&c&&c.t&&c.d<6&&Math.abs(R.yr||0)>.3)return{f,why:'mid',cues};
   if(want==='blink'){const S=RO.ch&&RO.ch.v2&&RO.ch.v2.L.st[RO.ch.v2.si];const b=S&&S.m&&S.m.userData.d24b;if(b&&b.some(q=>q.visible)&&Math.hypot(S.vx-R.x,S.vz-R.z)<45)return{f,why:'blink',cues}}
   let tx=null,tz=null;if(N&&N.P.length>1){const P=N.P;let bi=N.pi,acc=0;const Ld=10+.7*Math.max(0,o[3]);let k=bi+1;tx=P[k][0];tz=P[k][1];acc=Math.hypot(tx-o[0],tz-o[1]);while(k<P.length-1&&acc<Ld){acc+=Math.hypot(P[k+1][0]-P[k][0],P[k+1][1]-P[k][1]);k++;tx=P[k][0];tz=P[k][1]}}
   const S=RO.ch&&RO.ch.v2&&RO.ch.v2.L.st[RO.ch.v2.si];const tg=RO.ch&&RO.ch.v2?qvTgt(RO.ch):null;if(tg&&Math.hypot(tg.x-o[0],tg.z-o[1])<35){tx=tg.x;tz=tg.z}
   if(tx!=null){const e=Math.atan2(Math.sin(Math.atan2(tx-o[0],tz-o[1])-o[2]),Math.cos(Math.atan2(tx-o[0],tz-o[1])-o[2]))-o[4]*.25;if(st===0&&Math.abs(e)>.07)st=e>0?-1:1;else if(st!==0&&(Math.abs(e)<.026||Math.sign(e)===st))st=0}
   let vd=70/3.6;if(c&&c.t&&Math.abs(c.ang)>.5&&c.d<25+1.2*R.v)vd=Math.abs(c.ang)>1.3?45/3.6:60/3.6;if(tg){const d=Math.hypot(tg.x-R.x,tg.z-R.z);if(S&&S.t==='follow'&&d<25)vd=Math.min(vd,Math.max(4,S.cv||8))}
   window.__d24set('ArrowUp',R.v<vd-.5);window.__d24set('ArrowDown',R.v>vd+2.5);window.__d24set('ArrowLeft',st<0);window.__d24set('ArrowRight',st>0);
   for(const s of['#storyGo','#rcGo','.m1go','#tutSkip']){const e=document.querySelector(s);if(e&&!e.hidden&&e.offsetWidth)e.click()}__tick(3);f+=3}return{f,why:'timeout',cues}})()`);
  window.__d24set=set});
 const go=async(maxF,want)=>{const r=await p.evaluate(([m,w])=>__d24go(m,w),[maxF,want]);console.log(want,JSON.stringify(r).slice(0,300));return r};
 let r=await go(60*60,'cue');await shot(OUT+'/s1_mission_turn_cue.jpg');
 r=await go(60*30,'mid');await shot(OUT+'/s2_frankfurt_mid_turn.jpg');
 r=await go(60*60,'blink');await shot(OUT+'/s3_hilde_blinker.jpg');
 r=await go(60*40,'cue');await shot(OUT+'/s4_mission_turn_cue2.jpg');
 console.log('errors',errs.length,errs.slice(0,5));await b.close()})();
