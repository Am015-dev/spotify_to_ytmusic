// Readability test: plays into a real game (vs computer, tutorial skipped) and, at 390x763, 375x553 and 1280x800, screenshots
// the hand, the Great Road kingdom cards, a card inspect, a clash/bid reveal with played cards and the rivals strip, then measures every
// visible card text element: font size (names/numbers >= 11 px, rules text >= 10 px) and contrast of the text colour against the
// REAL rendered pixels behind it (the text is hidden, the box re-shot; fail if the 25th-percentile contrast < 4.5:1).
//   node read-test.js [tag=after] [sizes=390x763,375x553,1280x800]      screenshots -> playtest/read-<tag>-<scene>-<size>.png
// Exit code 1 on any failure; failures are listed.
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'game','thornbound.html'));
const TAG=process.argv[2]||'after';
const SIZES=(process.argv[3]||'390x763,375x553,1280x800').split(',').map(s=>s.split('x').map(Number));
const OUT=path.join(__dirname,'playtest');
const MIN_NAME=11,MIN_RULES=10,MIN_CONTRAST=4.5;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fails=[];

// list every visible text element of a card / the rivals strip with its effective px size, colour and box
const COLLECT=()=>{
  const out=[];const seen=new Set();
  const vis=(el,r)=>{if(r.width<2||r.height<2||r.right<=0||r.bottom<=0||r.left>=innerWidth||r.top>=innerHeight)return false;
    const cs=getComputedStyle(el);if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity===0)return false;
    for(let a=el;a&&a!==document.body;a=a.parentElement){const c=getComputedStyle(a);if(c.display==='none'||c.visibility==='hidden'||+c.opacity===0)return false}
    const cx=Math.min(innerWidth-1,Math.max(0,r.left+r.width/2)),cy=Math.min(innerHeight-1,Math.max(0,r.top+r.height/2));
    const h=document.elementFromPoint(cx,cy);if(!h)return false;
    const own=el.closest('button,.card,.pop,#ppop,.rv,#pc')||el.parentElement;return own&&(own===h||own.contains(h)||h.contains(own))};
  const pop=document.querySelector('#ppop:not([hidden])');
  const add=(el,kind,px,col,op,label)=>{if(pop&&!el.closest('#ppop'))return;const r=el.getBoundingClientRect();if(!vis(el,r))return;
    const id=el;if(seen.has(id))return;seen.add(id);
    const host=el.closest('button,.pop,#ppop,.rv,#pc');
    out.push({kind,px:+px.toFixed(1),col,op,label:(label||'').slice(0,28),x:r.left,y:r.top,w:r.width,h:r.height,
      html:el.outerHTML.slice(0,160),where:(host?(host.id?'#'+host.id:host.className&&String(host.className.baseVal||host.className).split(' ')[0]):'')||'?'});
    el.setAttribute('data-rt',out.length-1)};
  document.querySelectorAll('svg text').forEach(t=>{
    if(!t.closest('.hc,.kcb,.kcth,.card,#ppop,#pc,.pop,.sitec,.picker,#handw,#rivals'))return;
    const m=t.getScreenCTM();if(!m)return;const fs0=parseFloat(t.getAttribute('font-size')||getComputedStyle(t).fontSize);const px=fs0*Math.hypot(m.a,m.b);
    const fam=(t.getAttribute('font-family')||'');const italic=t.getAttribute('font-style')==='italic';
    const sz=fs0;let kind='name';
    if(sz>=20)kind='number';else if(+t.getAttribute('y')>=358||sz<=9)kind='deco';else if(t.getAttribute('letter-spacing')&&sz<=14)kind='rules';else if(italic||/EB|Garamond|serif/i.test(fam)&&!/Cinzel|Display/i.test(fam)&&sz>=12&&!t.getAttribute('letter-spacing'))kind='rules';
    const fill=t.getAttribute('fill')||getComputedStyle(t).fill;
    add(t,kind,px,fill,t.getAttribute('opacity')||1,t.textContent);
  });
  document.querySelectorAll('#rivals *,#handw .kn,#ppop .ob,#ppop h3,#ppop h4,#ppop .lk,.roadrow .kn,#pc .t').forEach(e=>{
    if(e.closest('svg'))return;
    if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))return;
    const cs=getComputedStyle(e);add(e,/^\d+$/.test(e.textContent.trim())?'number':'name',parseFloat(cs.fontSize),cs.color,1,e.textContent);
  });
  return out;
};

async function measure(p,list,tag,W,pngBuf){
  // contrast: hide each text, re-shoot its box, compare the text colour with the pixels left behind
  const res=[];
  for(let i=0;i<list.length;i++){const t=list[i];
    const x=Math.max(0,Math.floor(t.x)),y=Math.max(0,Math.floor(t.y)),w=Math.min(Math.ceil(t.w),innerW(W)-x),h=Math.min(Math.ceil(t.h),innerH-y);
    if(w<2||h<2)continue;
    let vbuf;try{vbuf=await p.screenshot({clip:{x,y,width:w,height:h}})}catch(e){vbuf=null}
    await p.evaluate(i=>{const e=document.querySelector('[data-rt="'+i+'"]');if(e)e.style.setProperty('visibility','hidden','important')},i);
    let buf;try{buf=await p.screenshot({clip:{x,y,width:w,height:h}})}catch(e){buf=null}
    await p.evaluate(i=>{const e=document.querySelector('[data-rt="'+i+'"]');if(e)e.style.removeProperty('visibility')},i);
    if(!buf||!vbuf)continue;
    // glyph pixels = pixels that change when the text is hidden; the background under them is what the text must beat
    const c=await p.evaluate(async([vb64,b64,col,op])=>{
      const load=async s=>{const img=new Image();img.src='data:image/png;base64,'+s;await img.decode();const cv=document.createElement('canvas');cv.width=img.width;cv.height=img.height;const g=cv.getContext('2d');g.drawImage(img,0,0);return g.getImageData(0,0,cv.width,cv.height).data};
      const d=await load(b64),v=await load(vb64);
      const tc=document.createElement('canvas').getContext('2d');tc.fillStyle=col.indexOf('url(')>=0?'#000':col;tc.fillRect(0,0,1,1);const f=tc.getImageData(0,0,1,1).data;
      const lin=x=>{x/=255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4)};
      const L=(r,g2,b)=>.2126*lin(r)+.7152*lin(g2)+.0722*lin(b);
      const rat=[];for(let k=0;k<d.length;k+=4){if(Math.abs(d[k]-v[k])+Math.abs(d[k+1]-v[k+1])+Math.abs(d[k+2]-v[k+2])<60)continue;
        const a=+op;const r=f[0]*a+d[k]*(1-a),g2=f[1]*a+d[k+1]*(1-a),b=f[2]*a+d[k+2]*(1-a);
        const l1=L(r,g2,b),l2=L(d[k],d[k+1],d[k+2]);rat.push((Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05))}
      if(!rat.length)return {p25:99,min:99,med:99};
      rat.sort((a,b)=>a-b);return {p25:rat[Math.floor(rat.length*.25)],min:rat[0],med:rat[Math.floor(rat.length/2)]}
    },[vbuf.toString('base64'),buf.toString('base64'),t.col,t.op]);
    res.push({...t,contrast:+c.p25.toFixed(2),med:+c.med.toFixed(2)});
  }
  return res;
}
let innerH=0;const innerW=()=>1e5;

function judge(scene,size,rows){
  const phone=+size.split('x')[0]<700;
  for(const r of rows){
    const min=r.kind==='rules'?MIN_RULES:(r.kind==='deco'?0:MIN_NAME);
    if(r.px<min)fails.push(`${size} ${scene}: SIZE ${r.px}px < ${min} ${r.kind} "${r.label}" in ${r.where}`);
    if(r.kind!=='deco'&&r.contrast<MIN_CONTRAST){fails.push(`${size} ${scene}: CONTRAST ${r.contrast}:1 < ${MIN_CONTRAST} ${r.kind} "${r.label}" (${r.px}px) in ${r.where}`);if(process.env.DBG)console.log(r.html,r.col)}
  }
}

async function run(browser,W,H){
  const size=W+'x'+H;
  const ctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:W<700,hasTouch:W<700});
  await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
  const p=await ctx.newPage();p.setDefaultTimeout(15000);innerH=H;
  p.on('pageerror',e=>fails.push(size+' PAGE ERROR '+e.message));
  await p.goto('https://gns.test/'+(W<700?'?phone=1':''));await sleep(1200);
  await p.evaluate(()=>{try{localStorage.clear()}catch(e){}AIDELAY=0;ANIM=0;newGame('me',{np:3,seed:5,length:'short'});UI.guide='off';if(window.GXH)GXH.setEnabled(false)});
  await sleep(600);
  const done=new Set();
  const snap=async(scene)=>{
    if(done.has(scene))return;done.add(scene);await sleep(350);
    const file=path.join(OUT,`read-${TAG}-${scene}-${size}.png`);await p.screenshot({path:file});
    const list=await p.evaluate(COLLECT);
    const rows=await measure(p,list,TAG,W);
    judge(scene,size,rows);
    console.log(`${size} ${scene}: ${rows.length} texts, ${rows.filter(r=>r.px<(r.kind==='rules'?MIN_RULES:MIN_NAME)&&r.kind!=='deco').length} too small, ${rows.filter(r=>r.kind!=='deco'&&r.contrast<MIN_CONTRAST).length} low contrast`);
  };
  for(let i=0;i<80&&done.size<7;i++){
    const st=await p.evaluate(()=>({k:G.q&&G.q.kind,card:UI.card&&UI.card.kind,ev:UI.card&&UI.card.ev&&UI.card.ev.t,over:!!G.over,s:viewSeatForQ(),pop:UI.pop}));
    if(st.over)break;
    if(st.card){
      await p.evaluate(()=>{const b=document.querySelector('#pc [data-a=evok],#pc [data-a=tipok],#pc [data-a=take]');b&&b.click()});
    }else if(st.s!=null){
      if(st.k==='bid'){await snap('hand');await snap('rivals');
        await p.evaluate(()=>{const id=document.querySelector('#handw .hc')&&+document.querySelector('#handw .hc').dataset.id;openPop('card',{id})});await snap('inspect-hand');await p.evaluate(()=>closePop());}
      if(st.k==='bidRes'){await snap('road');
        {const m=await p.evaluate(()=>[...document.querySelectorAll('#handw .kcb')].map(b=>{const c=b.querySelector('svg,.card,[class*=kc]'),r=(c||b).getBoundingClientRect(),n=b.querySelector('.kn'),nr=n.getBoundingClientRect();return {sh:n.scrollHeight,ch:n.clientHeight,nw:Math.round(nr.width),bb:Math.round(nr.bottom),w:Math.round(r.width),fs:parseFloat(getComputedStyle(n).fontSize),clip:n.scrollHeight>n.clientHeight+5,over:nr.bottom>innerHeight||b.getBoundingClientRect().bottom>innerHeight+1,name:n.textContent}}));
          const land=W>=H*1.15;console.log(size,'road kcards',m.map(x=>x.w+'px/'+x.fs.toFixed(1)).join(' '));
          if(!m.length)fails.push(size+' road: no kingdom cards');
          for(const x of m){if(!land&&x.w<(H<600?42:52))fails.push(size+' road: kingdom card only '+x.w+'px wide ('+x.name+')');if(x.fs<11.5)fails.push(size+' road: name '+x.fs+'px ('+x.name+')');if(x.clip)fails.push(size+' road: name clipped ('+x.name+') sh'+x.sh+' ch'+x.ch+' nw'+x.nw+' bottom'+x.bb);if(x.over)fails.push(size+' road: card runs off screen ('+x.name+')')}}
        await p.evaluate(()=>{const b=document.querySelector('#handw .kcb');if(b)openPop('kc',{n:+b.dataset.n})});await snap('inspect-kc');await p.evaluate(()=>closePop());}
      if(st.k==='bid'&&!done.has('clash')){ // hold the reveal on screen so the played cards can be shot
        await p.evaluate(()=>{window.__hold=1;const o=window.bfAuto;window.bfAuto=function(c,ms){if(window.__hold&&c&&c.ev&&/^(bids|clash)$/.test(c.ev.t)){window.__held=c.ev.t;return}return o.apply(this,arguments)}});}
      await p.evaluate(()=>{const r=UI._rec||suggest(viewSeatForQ());const mv=legal(viewSeatForQ());const m=(r&&mv.find(x=>x.k===r.k))||mv[0];humanMove(m.k)});
    }
    if(await p.evaluate(()=>!!window.__held)){await snap('clash');await p.evaluate(()=>{window.__hold=0;window.__held=0;evDone()})}
    await sleep(60);
  }
  for(const s of ['hand','rivals','road','inspect-hand','inspect-kc','clash'])if(!done.has(s))fails.push(size+' scene never reached: '+s);
  await ctx.close();
}

(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  const b=await PW.chromium.launch();
  for(const [W,H] of SIZES)await run(b,W,H);
  await b.close();
  const uniq=[...new Set(fails)];
  console.log('\nFAILURES: '+uniq.length);uniq.forEach(f=>console.log(' - '+f));
  process.exit(uniq.length?1:0);
})();
