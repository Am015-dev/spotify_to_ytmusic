// PURPOSE: pictures load when the game first needs them, not all at once on the title screen
// FLAG: lazyart (?lazyart=0 = the old background preload of every picture in media/ready.json)
// TEST: qa/loadgate.js (Kai and ship sheets in time), qa/perfload.js (requests and CPU in the first 15 s on the title)
/* ---------- LAZY: owner, 22 Oct 2026: "makes an extremely fast computer super slow when loading". Measured on the title screen (1440x860):
   600 image requests and 24 MB in 15 s, 17.5 s of main-thread work in 15 s: shapes.js queued all ~800 files of ready.json for a background
   preload and each full-size picture was downloaded and decoded. Now the bulk queue never runs; a picture is loaded the first time any code reads
   ART.bm[id] (a Proxy on the bitmap table) and it is listed in ready.json. Stage art is still warmed before a stage (ART.warm, street3 preload). ---------- */
if(RET.lazyart===undefined)RET.lazyart=!/[?&]lazyart=0/.test(location.search);
if(RET.lazyart){const raw=ART.bm;
  ART.bm=new Proxy(raw,{get(t,k){if(typeof k==='string'&&!(k in t)&&ART.rd&&ART.rd.has(k+'.webp'))ART.load(k);return t[k];}});
  ART.pump=function(){ART.q.length=0;};}
/* the title, hub, map and Lab menus cover the play canvas, but the loop kept drawing the whole attract scene under them at 60-80 fps (and it pulled in
   ~60 effect pictures). lagfix.js only knew the in-run screens. Outside a run: when the centre of the screen is not the play canvas, draw at most 2 frames a second. */
if(RET.lazyart){const lc0=lagCovered;let chk=0,cov=false,lastDraw=0;
  lagCovered=function(now){if(running)return lc0(now);
    if(now-chk>300){chk=now;const e=document.elementFromPoint(innerWidth/2,innerHeight/2);cov=!!e&&e!==cv&&!(typeof wcv!=='undefined'&&e===wcv)&&e.tagName!=='CANVAS';}
    if(!cov)return lc0(now);if(now-lastDraw<500)return true;lastDraw=now;return false;};}
