#!/usr/bin/env node
// W224 probe: one busy stage frame (t=27.5 s) or one boss frame (7 s into the fight), human bot, seed 1, stepped sim (no real time).
// Measures on the displayed canvas: grayscale contrast of each enemy sprite against the ring of pixels around it (WCAG ratio, from three
// renders: all / no enemies / enemies without halo), enemy drawn length / player length, and player shot size. PASS/FAIL + numbers.
//   GAME_DIR=<dir> node qa/w224probe.js   env: W H (390x763) MODE=stage|boss SHOT=<file.png>
const { boot, open, ok, done, sleep } = require('./lib');
(async () => {
  const b = await boot(), Wd = +process.env.W || 390, Hd = +process.env.H || 763, MODE = process.env.MODE || 'stage';
  const p = await open(b.br, b.base, Wd, Hd, '?sim=1&all=1&nomusic=1', 1, Wd < 700);
  const hb = require('fs').readFileSync(require('path').resolve(__dirname, '../humanbot.js'), 'utf8'), a0 = hb.indexOf('const BOT = (o) => {'), a1 = hb.indexOf('\n};\n(async', a0);
  const BOTSRC = hb.slice(a0 + 'const BOT = '.length, a1 + 3);
  const R = await p.evaluate(`(async()=>{const BOT=${BOTSRC};const m=window.__mnr;m.god=true;let bossAt=-1;
    window.__rec=(mm,i)=>{const G=m.G;if(G.boss&&bossAt<0)bossAt=G.t;
      if('${MODE}'==='stage'&&!G.boss&&G.t>=27.5&&G.en.length>=2)throw 'SHOT';
      if('${MODE}'==='boss'&&G.boss&&G.boss.x<${Wd<700?720:1040}&&G.t-bossAt>(+'${process.env.BT||3}'))throw 'SHOT';};
    for(const k in m.ART.ANIM.s)m.ART.anim(k);for(const n of m.ART.pkN)m.ART.load('pk-'+n);for(const k in m.ART.bossN){const nm=m.ART.bossN[k];m.ART.load('spr-boss-'+nm);try{m.SPR.warmBoss(nm);}catch(e){}}await new Promise(r=>setTimeout(r,6000));
    try{BOT({n:1,build:'fresh',bot:'human',seed:1,diff:'normal',MAXT:300});}catch(e){if(e!=='SHOT')throw e;}
    return {t:m.G.t,en:m.G.en.length,boss:!!m.G.boss};})()`);
  const M = await p.evaluate(`(()=>{const m=window.__mnr,G=m.G;G.shake=0;const cv=document.querySelector('canvas'),c=cv.getContext('2d'),w=cv.width,h=cv.height;
    const grab=()=>{m.render(G.t,0);return c.getImageData(0,0,w,h).data;};
    const lum=(d,i)=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};return .2126*f(d[i])+.7152*f(d[i+1])+.0722*f(d[i+2]);};
    const REC={bolt:[],foe:[]};let FL=null;const di=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(){if(FL){const T=this.getTransform(),n=arguments.length,dw=arguments[n-2],dh=arguments[n-1],k=Math.hypot(T.a,T.b);FL.push([Math.round(T.e),Math.round(T.f),Math.round(dw*k),Math.round(dh*k),this.canvas.width]);FL=null;}return di.apply(this,arguments);};
    const pbo=window.PURL.bolt;window.PURL.bolt=function(x,y,L,T){FL=REC.bolt;return pbo.apply(this,arguments);};const pdc=window.PURL.dcel;window.PURL.dcel=function(key,t,sc,kd){if(kd==='b')FL=REC.foe;return pdc.apply(this,arguments);};
    m.render(G.t,0);window.PURL.bolt=pbo;window.PURL.dcel=pdc;CanvasRenderingContext2D.prototype.drawImage=di;
    const A=grab(),en=G.en,fs=G.en.filter(e=>e.type!=='boss'),bs=G.en.filter(e=>e.type==='boss');
    const run=(keep)=>{const sv=G.en;G.en=keep;const pb=G.pb,eb=G.eb,fx=m.ART.fx.slice();G.pb=[];G.eb=[];const B=grab();window.PURL.HALO=0;const C0=grab();window.PURL.HALO=1;G.en=[];const N=grab();G.en=sv;G.pb=pb;G.eb=eb;return{C0,N,B};};
    const comps=(keep)=>{const{C0,N,B}=run(keep),mask=new Uint8Array(w*h);for(let i=0;i<w*h;i++){const j=i*4;if(Math.abs(C0[j]-N[j])+Math.abs(C0[j+1]-N[j+1])+Math.abs(C0[j+2]-N[j+2])>60)mask[i]=1;}
      const seen=new Uint8Array(w*h),out=[];for(let s=0;s<w*h;s++){if(!mask[s]||seen[s])continue;const st=[s],px=[];seen[s]=1;while(st.length){const q=st.pop();px.push(q);const x=q%w,y=(q/w)|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=w||Y>=h)continue;const r=Y*w+X;if(mask[r]&&!seen[r]){seen[r]=1;st.push(r);}}}
        if(px.length<40)continue;let x0=w,x1=0,y0=h,y1=0,sl=0;for(const q of px){const x=q%w,y=(q/w)|0;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);sl+=lum(B,q*4);}sl/=px.length;
        let rl=0,rn=0;const R_=6;for(let y=Math.max(0,y0-R_);y<=Math.min(h-1,y1+R_);y++)for(let x=Math.max(0,x0-R_);x<=Math.min(w-1,x1+R_);x++){const q=y*w+x;if(mask[q])continue;let near=0;for(let d=1;d<=R_&&!near;d+=2)for(const[dx,dy]of[[d,0],[-d,0],[0,d],[0,-d]]){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<w&&Y<h&&mask[Y*w+X]){near=1;break;}}if(near){rl+=lum(B,q*4);rn++;}}
        rl/=rn||1;const hi=Math.max(sl,rl),lo=Math.min(sl,rl);out.push({x0,y0,n:px.length,bw:x1-x0+1,bh:y1-y0+1,sprite:+sl.toFixed(3),ring:+rl.toFixed(3),cr:+((hi+.05)/(lo+.05)).toFixed(2)});}
      return out;};
    const foes=fs.length?comps(fs):[],boss=bs.length?comps(bs).sort((a,b)=>b.n-a.n).slice(0,1):[];
    const pl=window.PURL.pl(),lens=fs.map(e=>e._fs&&window.PURL.sheet(e)?+(e._fs*m.ART.ANIM.s[window.PURL.sheet(e).key][2]/pl).toFixed(2):null).filter(v=>v);
    m.render(G.t,0);return{bt:G.boss&&[G.boss.type,G.boss.x|0,G.boss.hp|0],ty:G.en.map(e=>e.type).join(),bolt:REC.bolt.slice(0,3),foe:REC.foe,P:[m.P?m.P.x|0:0],foes,boss,lens,pl:+pl.toFixed(1),S:typeof S!=='undefined'?S:null,pb:G.pb.length,cw:w,ch:h};})()`);
  if (process.env.SHOT) await p.screenshot({ path: process.env.SHOT });
  console.log(MODE, Wd + 'x' + Hd, 't', R.t.toFixed(1), JSON.stringify(M));
  const cr = M.foes.map(f => f.cr);
  if (MODE === 'stage') { ok('every enemy sprite >= 3:1 grayscale contrast vs its ring (min ' + Math.min(...cr) + ')', cr.length && Math.min(...cr) >= 3, JSON.stringify(cr)); if (Wd < 700) ok('phone enemy length >= 0.8 x player (min ' + Math.min(...M.lens) + ')', M.lens.length && Math.min(...M.lens) >= .8 - 1e-6, JSON.stringify(M.lens)); else console.log('INFO PC enemy length / player', JSON.stringify(M.lens)); }
  else ok('boss body >= 3:1 vs ring (' + (M.boss[0] || {}).cr + ')', M.boss[0] && M.boss[0].cr >= 3);
  await b.close(); done('w224probe');
})();
