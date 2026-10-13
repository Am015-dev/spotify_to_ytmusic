// Runs the reference game's own vehicle class (extracted verbatim from its bundle) on a flat asphalt plane.
const fs=require('fs');// ref_core.js = lines 470-1286 of the prettified bundle (not committed: third-party code). Re-create: curl the game's _app/index-*.js, prettier, sed -n 470,1286p.
const src=fs.readFileSync(process.env.REF_CORE||__dirname+'/ref_core.js','utf8');
const mod=new Function(src+'\nreturn {el,Kc};')();
const spec={id:'hero_supercar',blurb:'',topSpeedKmh:330,zeroToHundred:3,grip:1.15,mass:1450,wheels:{front:1.365,rear:-1.36,track:.84,radius:.36,width:.3}};
const dims={length:4.6,width:1.95,height:1.15};
const ground={bounds:1e6,height:()=>0,surface:()=>'asphalt'};
function run(kmh,mode,assist=true){const st={position:{x:0,y:0,z:0},velocity:{x:0,y:0,z:0},yaw:0,impact:0};const car=new mod.el(spec,ground,dims,st);car.reset(0,0,0);
 const v=kmh/3.6;st.velocity.z=v;car.gear=4;const dt=1/120;
 // settle at speed 1 s
 const ctl={throttle:0,brake:0,steer:0,handbrake:false};
 for(let i=0;i<240;i++){ctl.throttle=st.speed<v?1:0;st.velocity.x=0;car.yawRate=0;st.yaw=0;car.step(dt,ctl);}
 const h0=st.yaw;let t=0,mx=0,sum=0,n=0,tr=[];
 for(;t<6;t+=dt){let thr=st.speed<v?1:0;ctl.brake=mode==='brakeTap'&&t<.4?1:0;if(ctl.brake)thr=0;ctl.handbrake=mode==='drift';ctl.steer=mode==='half'?.5:1;
  // reference assist, part that acts while steering: throttle cut when |slip| > 0.06 rad (speed > 5 m/s, no handbrake)
  if(assist&&!ctl.handbrake&&st.speed>5){const s=Math.abs(st.slipAngle);if(s>.06)thr=Math.min(thr,thr*Math.max(0,Math.min(1,1-(s-.06)*7)))}
  ctl.throttle=thr;car.step(dt,ctl);const sl=Math.abs(st.slipAngle)*180/Math.PI;const turned=Math.abs(Math.atan2(Math.sin(st.yaw-h0),Math.cos(st.yaw-h0)))*180/Math.PI;
  mx=Math.max(mx,sl);sum+=sl;n++;if(n%12==0)tr.push([+t.toFixed(2),+sl.toFixed(2),+car.yawRate.toFixed(3),+(st.speed*3.6).toFixed(1),+turned.toFixed(1),+car.steerAngle.toFixed(3)]);if(turned>=90)break}
 const vel=Math.atan2(st.velocity.x,st.velocity.z)*180/Math.PI;
 return{kmh,mode,t90:+t.toFixed(2),maxSlip:+mx.toFixed(1),meanSlip:+(sum/n).toFixed(1),vEnd:+(st.speed*3.6).toFixed(1),velTurned:+vel.toFixed(1),maxSteer:+car.maxSteerAngle(v).toFixed(3),trace:tr}}
const out=[];for(const k of[50,80])for(const m of['full','brakeTap','half','drift']){const r=run(k,m);out.push(r);console.log(JSON.stringify({...r,trace:undefined}))}
fs.writeFileSync(process.argv[2]||'refsim.json',JSON.stringify(out));
