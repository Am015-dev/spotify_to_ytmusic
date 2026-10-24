#!/usr/bin/env node
// W227 probe: the W224 measures at MANY moments, not one. Human bot, seed 1, stepped sim. At 8 random stage-1 moments (t 10-120 s, no boss)
// and 6 s into the boss fight it measures, on the displayed canvas: grayscale contrast of each enemy sprite vs a 6 px ring (WCAG ratio),
// enemy drawn length / player length, the boss body contrast, text drawn in the play field outside the HUD, the power-up card's screen
// box, and grade-letter pops. Reports the MINIMUMS. GAME_DIR=<dir> node qa/w227probe.js   env: W H (390x763) SEED (random moments) SHOT=<prefix>
const { boot, open, ok, done } = require('./lib');
(async () => {
  const b = await boot(), Wd = +process.env.W || 390, Hd = +process.env.H || 763, ph = Wd < 700;
  let sd = +process.env.SEED || 227; const rr = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const TS = Array.from({ length: 8 }, () => +(10 + 110 * rr()).toFixed(1)).sort((a, b) => a - b), SHOTT = process.env.SHOTT ? +process.env.SHOTT : -1;
  const p = await open(b.br, b.base, Wd, Hd, '?sim=1&all=1&nomusic=1', 1, ph);
  const hb = require('fs').readFileSync(require('path').resolve(__dirname, '../humanbot.js'), 'utf8'), a0 = hb.indexOf('const BOT = (o) => {'), a1 = hb.indexOf('\n};\n(async', a0);
  const BOTSRC = hb.slice(a0 + 'const BOT = '.length, a1 + 3);
  await p.exposeFunction('__snap', async () => { });
  const R = await p.evaluate(`(async()=>{const BOT=${BOTSRC};const m=window.__mnr;m.god=true;let bossAt=-1;const TS=${JSON.stringify(TS)};const out=[];let pops=0,ti=0,bossDone=0;
    const rp=m.RET.pop;m.RET.pop=function(L){if(m.G.live&&!m.G.dead){const e=document.getElementById('retPop');pops++;}return rp.apply(this,arguments);};
    const cv=document.querySelector('canvas'),c=cv.getContext('2d'),w=cv.width,h=cv.height;
    const lum=(d,i)=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};return .2126*f(d[i])+.7152*f(d[i+1])+.0722*f(d[i+2]);};
    const LOW=[];let CUT=0;const TOPB=${ph ? 42 : 64},BOTB=${Hd}-78*${ph ? 1 : Hd / 540};const M=(kind)=>{const G=m.G,sh=G.shake;G.shake=0;const grab=()=>{m.render(G.t,0);return c.getImageData(0,0,w,h).data;};
      const TX=[],CARD=[];const ft=CanvasRenderingContext2D.prototype.fillText,fr=CanvasRenderingContext2D.prototype.fillRect;let inCard=0;
      CanvasRenderingContext2D.prototype.fillText=function(s,x,y){const T=this.getTransform();if(!(window.PB&&PB.hud))TX.push(String(s));if(inCard)CARD.push(T.f+T.d*y);return ft.apply(this,arguments);};
      CanvasRenderingContext2D.prototype.fillRect=function(x,y,ww,hh){if(inCard){const T=this.getTransform();CARD.push(T.f+T.b*x+T.d*y,T.f+T.b*(x+ww)+T.d*(y+hh));}return fr.apply(this,arguments);};
      const ph_=m.PW.hud;m.PW.hud=function(){inCard++;try{return ph_.apply(this,arguments);}finally{inCard--;}};
      const A=grab();CanvasRenderingContext2D.prototype.fillText=ft;CanvasRenderingContext2D.prototype.fillRect=fr;m.PW.hud=ph_;
      const fs=G.en.filter(e=>e.type!=='boss'&&e.type!=='gate'),bs=G.en.filter(e=>e.type==='boss');
      const run=(keep)=>{const sv=G.en;G.en=keep;const pb=G.pb,eb=G.eb;G.pb=[];G.eb=[];const B=grab();PURL.HALO=0;const C0=grab();PURL.HALO=1;G.en=[];const N=grab();G.en=sv;G.pb=pb;G.eb=eb;return{C0,N,B};};
      const comps=(keep)=>{const{C0,N,B}=run(keep),mask=new Uint8Array(w*h);for(let i=0;i<w*h;i++){const j=i*4;if(Math.abs(C0[j]-N[j])+Math.abs(C0[j+1]-N[j+1])+Math.abs(C0[j+2]-N[j+2])>60)mask[i]=1;}
        const seen=new Uint8Array(w*h),o=[];for(let s=0;s<w*h;s++){if(!mask[s]||seen[s])continue;const st=[s],px=[];seen[s]=1;while(st.length){const q=st.pop();px.push(q);const x=q%w,y=(q/w)|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=w||Y>=h)continue;const r=Y*w+X;if(mask[r]&&!seen[r]){seen[r]=1;st.push(r);}}}
          if(px.length<40)continue;let x0=w,x1=0,y0=h,y1=0,sl=0;for(const q of px){const x=q%w,y=(q/w)|0;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);sl+=lum(B,q*4);}sl/=px.length;
          let rl=0,rn=0;const R_=6;for(let y=Math.max(0,y0-R_);y<=Math.min(h-1,y1+R_);y++)for(let x=Math.max(0,x0-R_);x<=Math.min(w-1,x1+R_);x++){const q=y*w+x;if(mask[q])continue;let near=0;for(let d=1;d<=R_&&!near;d+=2)for(const[dx,dy]of[[d,0],[-d,0],[0,d],[0,-d]]){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<w&&Y<h&&mask[Y*w+X]){near=1;break;}}if(near){rl+=lum(B,q*4);rn++;}}
          rl/=rn||1;const hi=Math.max(sl,rl),lo=Math.min(sl,rl);o.push({cut:x0<=0||x1>=w-1||y0<TOPB||y1>BOTB,n:px.length,cr:+((hi+.05)/(lo+.05)).toFixed(2)});}
        return o;};
      // one contrast per enemy: each foe alone (its largest blob), so overlapping foes do not merge
      const fc=fs.filter(e=>e.x>0&&e.x<960&&e.y>0&&e.y<540).map(e=>{const o=comps([e]).sort((a,b)=>b.n-a.n)[0];if(o&&o.cut){CUT++;return null;}if(o&&o.cr<3)LOW.push({ty:e.type,id:m.FOEART?m.FOEART.id(e):0,x:e.x|0,y:e.y|0,r:e.r,sh:!!PURL.sheet(e),n:o.n,cr:o.cr});return o?o.cr:null;}).filter(v=>v!=null);
      const bc=bs.length?(comps(bs).sort((a,b)=>b.n-a.n)[0]||{}).cr:null,pl=PURL.pl();
      const lens=fs.map(e=>e._fs&&PURL.sheet(e)?+(e._fs*m.ART.ANIM.s[PURL.sheet(e).key][2]/pl).toFixed(2):null).filter(v=>v);
      const pop=document.getElementById('retPop');m.render(G.t,0);G.shake=sh;
      return{kind,t:+G.t.toFixed(1),n:fs.length,fc,bc,lens,tx:TX.slice(0,6),card:CARD.length?[Math.round(Math.min(...CARD)),Math.round(Math.max(...CARD))]:null,popOn:!!(pop&&pop.classList.contains('on'))};};
    window.__rec=(mm,i)=>{const G=m.G;if(G.boss&&bossAt<0)bossAt=G.t;
      if(${SHOTT}>0&&!G.boss&&G.t>=${SHOTT}&&G.en.length>=2)throw 'SHOT';
      if(!G.boss&&ti<TS.length&&G.t>=TS[ti]&&G.en.some(e=>e.type!=='gate'&&e.x<960&&e.x>0)){out.push(M('stage'));ti++;}
      if(G.boss&&!bossDone&&G.boss.x<${ph ? 720 : 1040}&&G.t-bossAt>6){out.push(M('boss'));bossDone=1;if(${SHOTT}===-2)throw 'SHOT';}
      if(bossDone&&${SHOTT}===-1)throw 'SHOT';};
    for(const k in m.ART.ANIM.s)m.ART.anim(k);for(const n of m.ART.pkN)m.ART.load('pk-'+n);for(const k in m.ART.bossN){const nm=m.ART.bossN[k];m.ART.load('spr-boss-'+nm);try{m.SPR.warmBoss(nm);}catch(e){}}await new Promise(r=>setTimeout(r,6000));
    try{BOT({n:1,build:'fresh',bot:'human',seed:1,diff:'normal',MAXT:300});}catch(e){if(e!=='SHOT')throw e;}
    return {out,pops,bossAt,t:m.G.t,LOW,CUT};})()`);
  if (process.env.SHOT) { await p.evaluate(() => window.__mnr.render(window.__mnr.G.t, 0)); await p.screenshot({ path: process.env.SHOT }); }
  console.log('LOW', JSON.stringify(R.LOW), 'foes under a HUD strip or off the edge, not gated:', R.CUT);
  const dev = ph ? 'phone' : 'PC', st = R.out.filter(o => o.kind === 'stage'), bo = R.out.find(o => o.kind === 'boss');
  for (const o of R.out) console.log(dev, o.kind, 't', o.t, 'foes', o.n, 'contrast', JSON.stringify(o.fc), 'len', JSON.stringify(o.lens), 'boss', o.bc, 'card', JSON.stringify(o.card), 'text', JSON.stringify(o.tx), 'pop', o.popOn);
  const fcs = st.flatMap(o => o.fc), ls = st.flatMap(o => o.lens), lim = ph ? .8 : .7, minc = Math.min(...fcs), minl = Math.min(...ls);
  console.log(dev, 'moments', st.length, 'bossAt', R.bossAt, 'MIN enemy contrast', minc, 'MIN enemy length', minl, 'boss contrast', bo && bo.bc, 'grade pops in run', R.pops);
  if (process.env.SHOTT) { console.log('shot only'); await b.close(); return; }
  ok(dev + ' 8 stage moments measured', st.length >= 8, st.length);
  ok(dev + ' min enemy contrast >= 3.0 (' + minc + ')', fcs.length && minc >= 3);
  ok(dev + ' min enemy length >= ' + lim + ' x player (' + minl + ')', ls.length && minl >= lim - 1e-6);
  ok(dev + ' boss body contrast >= 3.0 (' + (bo && bo.bc) + ')', bo && bo.bc >= 3);
  ok(dev + ' 0 grade letters in the field', R.pops === 0 && !R.out.some(o => o.popOn));
  ok(dev + ' 0 text drawn in the field outside the HUD', !R.out.some(o => o.tx.length), JSON.stringify(R.out.map(o => o.tx)));
  const fieldBot = Hd - 78 * (ph ? 1 : Hd / 540) - 1;
  ok(dev + ' power-up card outside the field (top >= ' + Math.round(fieldBot) + ')', !R.out.some(o => o.card && o.card[0] < fieldBot), JSON.stringify(R.out.map(o => o.card)));
  await b.close(); done('w227probe ' + dev);
})();
