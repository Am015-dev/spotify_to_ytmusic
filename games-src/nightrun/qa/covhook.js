// NODE_OPTIONS="--require games-src/nightrun/qa/covhook.js" COVDIR=<dir> node <any test>: attaches Chromium precise function coverage to every page of every playwright chromium launch, merges counts into $COVDIR/<pid>.json (read by qa/deadfns.py)
const fs=require('fs'),path=require('path');
const DIR=process.env.COVDIR; if(!DIR) return;
let PW; try{PW=require('playwright');}catch(e){return;}
const acc={}; let src={};   // key url#len -> {fnkey: count}
function merge(res){for(const e of res.result){if(!/index\.html/.test(e.url))continue;const top=e.functions[0];const len=top.ranges[0].endOffset;const k=e.url.split('?')[0]+'#'+len;const a=acc[k]||(acc[k]={});
  for(const f of e.functions){const r=f.ranges[0];const fk=r.startOffset+'-'+r.endOffset+'|'+f.functionName;a[fk]=(a[fk]||0)+r.count;}}}
function flush(){try{fs.writeFileSync(path.join(DIR,process.pid+'.json'),JSON.stringify(acc));}catch(e){}}
async function attach(page){
  try{const c=await page.context().newCDPSession(page);await c.send('Profiler.enable');await c.send('Profiler.startPreciseCoverage',{callCount:true,detailed:false});
    let on=true;const take=async()=>{if(!on)return;try{merge(await c.send('Profiler.takePreciseCoverage'));}catch(e){on=false;}};
    const iv=setInterval(()=>take().then(flush),4000);page.on('close',()=>{on=false;clearInterval(iv);});
    page.on('framenavigated',()=>{});
    page.__covtake=take;const pc=page.close.bind(page);page.close=async(...x)=>{await take();flush();return pc(...x);};
  }catch(e){}
}
function wrapCtx(ctx){ctx.on('page',attach);const np=ctx.close.bind(ctx);ctx.close=async(...a)=>{for(const p of ctx.pages())if(p.__covtake)await p.__covtake();flush();return np(...a);};ctx.pages().forEach(attach);}
const ob=PW.chromium.launch.bind(PW.chromium);
PW.chromium.launch=async(...a)=>{const b=await ob(...a);const nc=b.newContext.bind(b);b.newContext=async(...x)=>{const c=await nc(...x);wrapCtx(c);return c;};
  const np=b.newPage.bind(b);b.newPage=async(...x)=>{const p=await np(...x);wrapCtx(p.context());return p;};
  const bc=b.close.bind(b);b.close=async(...x)=>{for(const c of b.contexts())for(const p of c.pages())if(p.__covtake)await p.__covtake();flush();return bc(...x);};return b;};
process.on('exit',flush);
