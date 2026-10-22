/* ---------- districts ---------- */
const SIGNS=['APFELWEIN','IMBISS','24/7 KIOSK','WECHSELSTUBE','ZEIL','SPIELHALLE','KRONOS BANK','HELIX FINANZ','GRÜNE SOSSE','ÄPPLER','U4','S-BAHN','HAUPTWACHE','DATENHAFEN','KONSTABLER','BAR','SPÄTI','HOTEL','PFAND','NEUROWARE'];
const DISTRICTS=[
  {name:'BANKENVIERTEL',sub:'Taunusanlage · 23:47',sky:['#070417','#1d0a36','#4b1250'],a:'#ff2d95',b:'#19e3ff',win:['#ffd27a','#19e3ff','#ff8ad0'],
   lm:['main','commerz','opera'],near:'rail',ad:'KRONOS BANK — IHR LEBEN. UNSERE ZINSEN.',root:45,
   waves:['droneLine','droneV','droneSine','droneSine','turret','chargers'],boss:0,bossName:'SEK-ADLER',bossSub:'Police interceptor, eagle class'},
  {name:'MAINUFER',sub:'Eiserner Steg · 00:12',sky:['#020816','#0a1f3d','#174a70'],a:'#19e3ff',b:'#ffb020',win:['#ffcf6a','#9fe8ff','#ffb020'],
   lm:['dom','roemer','main'],near:'river',ad:'HELIX FINANZ · SCHULDEN SIND FREIHEIT',root:43,
   waves:['droneSine','chargers','chargers','turret','droneV','gunship'],boss:1,bossName:'FLUSSKRAKE',bossSub:'River patrol, hydra rig'},
  {name:'OSTEND',sub:'EZB-Sperrzone · 00:40',sky:['#02100e','#062a28','#0e5049'],a:'#3dffb0',b:'#ff4060',win:['#b8fff0','#3dffb0','#ff4060'],
   lm:['ezb','grossmarkt'],near:'rail',ad:'ZENTRALBANK · STABILITÄT DURCH KONTROLLE',root:41,
   waves:['gate','gate','turret','droneLine','chargers','gunship','droneSine'],boss:2,bossName:'ZENTRAL-ICE',bossSub:'Intrusion countermeasure'},
  {name:'MESSE',sub:'Hammering Man · 01:15',sky:['#10030a','#330818','#6e1a22'],a:'#ff5a2d',b:'#ffd23d',win:['#ffd23d','#ff9a5a','#ff5a2d'],
   lm:['messe','hammer','europa'],near:'street',ad:'MESSE 2099 · ALLES IST ZU VERKAUFEN',root:40,
   waves:['droneV','droneSine','turret','chargers','gate','gunship','gunship','droneLine'],boss:3,bossName:'KRONOS',bossSub:'Corporate warship, flagship'}
];
const DIST_LEN=58;

const BGC={};function bgFor(i){return BGC[i]||(BGC[i]={D:DISTRICTS[i],stub:1,lms:[]});}   // painted backdrops only (owner, 22 Oct 2026): no procedural skyline fallback

// Scanlines + vignette: rebuilt at the canvas's own pixel size (1 canvas pixel per output pixel, no scaling pass) and drawn as one image a frame.
const SCN={l:null,p:null};
function scanFor(port){const w=cv.width,h=cv.height,o=SCN[port?'p':'l'],cp=window.COM&&COM.scanP(),ck=cp?cp.a+'|'+cp.v:'';if(o&&o.width===w&&o.height===h&&(o.ck||'')===ck)return o;   // comfort.js: softer lines, lighter vignette
  const c=o||document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),u=port?VS:S,SW=port?PW_:W,SH_=port?PH_:H;g.setTransform(u,0,0,u,0,0);
  if(cp){if(cp.a){g.fillStyle='rgba(0,0,0,'+cp.a+')';for(let y=0;y<SH_;y+=cp.pitch)g.fillRect(0,y,SW,1);}}else{g.fillStyle=port?'rgba(0,0,0,.16)':'rgba(0,0,0,.18)';for(let y=0;y<SH_;y+=3)g.fillRect(0,y,SW,1);}
  const v=port?g.createRadialGradient(SW/2,SH_/2,SH_*.3,SW/2,SH_/2,SH_*.75):g.createRadialGradient(SW/2,SH_/2,SH_*.35,SW/2,SH_/2,SH_*.95);
  v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,cp?'rgba(0,0,0,'+cp.v+')':port?'rgba(0,0,0,.55)':'rgba(0,0,0,.6)');g.fillStyle=v;g.fillRect(0,0,SW,SH_);c.ck=ck;SCN[port?'p':'l']=c;return c;}
// Sky gradient + glow pre-rendered at the canvas's own pixel size: one drawImage a frame instead of a full-screen gradient fill, a gradient object and a glow sprite.
// One slot per orientation (the current district only), rebuilt when the district or the canvas size changes.
const SKYS={l:null,p:null};
function skyFor(bg,port){const w=cv.width,h=cv.height,s=SKYS[port?'p':'l'];if(s&&s.bg===bg&&s.c.width===w&&s.c.height===h)return s.c;
  const D=bg.D,c=s?s.c:document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),u=port?VS:S,SW=port?PW_:W,SH_=port?PH_:H;g.setTransform(u,0,0,u,0,0);
  const k=g.createLinearGradient(0,0,0,SH_);if(port){k.addColorStop(0,D.sky[2]);k.addColorStop(.5,D.sky[1]);k.addColorStop(1,D.sky[0]);}else{k.addColorStop(0,D.sky[0]);k.addColorStop(.55,D.sky[1]);k.addColorStop(1,D.sky[2]);}
  g.fillStyle=k;g.fillRect(0,0,SW,SH_);
  const gx=port?SW*.3:SW*.72,gy=port?SH_*.25:SH_*.28,r=260;g.globalCompositeOperation='lighter';g.globalAlpha=port?.12:.18;g.drawImage(glow(D.a),gx-r,gy-r,r*2,r*2);
  SKYS[port?'p':'l']={bg,c};return c;}

function drawBG(bg,t,dt,scroll){
  if(ART.paintBG(bg,t,scroll))return;                    // painted backdrop + painted parallax strips (art.js)
  ctx.drawImage(skyFor(bg,false),0,0,W,H);}               // art still loading or missing: the plain sky gradient

/* ---------- portrait backdrop: the city seen from above, scrolling toward the ship (drawn upright on the visible canvas, 540 x 960 units) ---------- */
const PW_=H,PH_=W;                                       // portrait screen in world units
const BGPC={};function bgpFor(i){return BGPC[i]||(BGPC[i]={stub:1});}

function drawBGP(bg,t,dt,scroll){const D=bg.D;let L=bgpFor(DISTRICTS.indexOf(D));
  const PA=ART.paintP(bg,scroll);if(!PA)ctx.drawImage(skyFor(bg,true),0,0,PW_,PH_);   // painted phone backdrop, the roofs on top fainter
  if(PA){const lb=ART.bm['ly-phone-'+ART.dn[DISTRICTS.indexOf(D)]];if(lb){const lh=PW_*lb.height/lb.width,off=(scroll*(RET.legible&&window.LGB?LGB.PX.roof:.5))%(2*lh);ctx.globalAlpha=.5;   // the painted rooftops seen from above, mirrored tiles so there is no seam
      for(let j=-2;j*lh+off<PH_;j++){const y=j*lh+off;if(y+lh<=0)continue;if(j&1){ctx.save();ctx.translate(0,y+lh);ctx.scale(1,-1);ctx.drawImage(lb,0,0,PW_,lh);ctx.restore();}else ctx.drawImage(lb,0,y,PW_,lh);}}}
  ctx.globalAlpha=1;
  if(D.near==='river'&&!PA){const g=ctx.createLinearGradient(0,0,PW_,0);g.addColorStop(0,'#08203a00');g.addColorStop(.5,'#0a2a4acc');g.addColorStop(1,'#08203a00');ctx.fillStyle=g;ctx.fillRect(PW_*.3,0,PW_*.4,PH_);}   // the river runs down the middle
  ctx.globalCompositeOperation='lighter';
  ctx.globalCompositeOperation='source-over';
  const hz=bg.hzP||(bg.hzP=(()=>{const q=ctx.createLinearGradient(0,PH_-260,0,PH_);q.addColorStop(0,D.a+'00');q.addColorStop(1,D.a+'30');return q;})());ctx.fillStyle=hz;ctx.fillRect(0,PH_-260,PW_,260);
}
