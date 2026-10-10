// Desktop layout shots + flicker watch: node desk-shots.js [tag=before] [sizes=1920x940,...]  -> playtest/desk-<tag>-<scene>-<size>.png
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'game','thornbound.html'));
const TAG=process.argv[2]||'before';
const SIZES=(process.argv[3]||'1920x940,1440x900,1280x800,1366x768').split(',').map(s=>s.split('x').map(Number));
const OUT=path.join(__dirname,'playtest');const sleep=ms=>new Promise(r=>setTimeout(r,ms));const fails=[];
async function run(b,W,H){const size=W+'x'+H;const ctx=await b.newContext({viewport:{width:W,height:H}});
  await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
  const p=await ctx.newPage();p.on('pageerror',e=>fails.push(size+' PAGE ERROR '+e.message));
  await p.goto('https://gns.test/');await sleep(1200);
  await p.evaluate(()=>{try{localStorage.clear()}catch(e){}AIDELAY=0;ANIM=0;newGame('me',{np:3,seed:5,length:'short'});UI.guide='off';if(window.GXH)GXH.setEnabled(false)});await sleep(600);
  // flicker watch: record #handw/.hc visibility changes
  await p.evaluate(()=>{window.__fl=[];let last='';setInterval(()=>{const h=document.querySelector('#handw');const c=h&&h.querySelector('.hc,.kcb');const r=c&&c.getBoundingClientRect();const s=(h?getComputedStyle(h).visibility+(h.hidden?'H':'')+(r?Math.round(r.width)+'x'+Math.round(r.height):'-'):'none')+'|'+(G&&G.q?G.q.kind:'');if(s!==last){window.__fl.push(s);last=s}},30)});
  const done=new Set();const snap=async s=>{if(done.has(s))return;done.add(s);await sleep(350);await p.screenshot({path:path.join(OUT,`desk-${TAG}-${s}-${size}.png`)});if(process.env.DBG)console.log(s,await p.evaluate(()=>[document.querySelector('#handw').clientWidth,document.querySelector('.gx-dock').clientWidth,getComputedStyle(document.documentElement).getPropertyValue('--cw'),[...document.querySelectorAll('.hc')].map(b=>(r=>Math.round(r.left)+'-'+Math.round(r.right)+'x'+Math.round(r.height))(b.getBoundingClientRect())).join(' ')].join(' ; ')))};
  for(let i=0;i<80&&done.size<3;i++){
    const st=await p.evaluate(()=>({k:G.q&&G.q.kind,card:UI.card&&UI.card.kind,over:!!G.over,s:viewSeatForQ()}));if(st.over)break;
    if(st.card){await p.evaluate(()=>{const b=document.querySelector('#pc [data-a=evok],#pc [data-a=tipok],#pc [data-a=take]');b&&b.click()})}
    else if(st.s!=null){
      if(st.k==='bid'){await snap('bid');await p.evaluate(()=>{window.__hold=1;const o=window.bfAuto;window.bfAuto=function(c,ms){if(window.__hold&&c&&c.ev&&/^(bids|clash)$/.test(c.ev.t)){window.__held=c.ev.t;return}return o.apply(this,arguments)}})}
      if(st.k==='bidRes')await snap('road');
      await p.evaluate(()=>{const r=UI._rec||suggest(viewSeatForQ());const mv=legal(viewSeatForQ());const m=(r&&mv.find(x=>x.k===r.k))||mv[0];humanMove(m.k)});
    }
    if(await p.evaluate(()=>!!window.__held)){await snap('clash');await p.evaluate(()=>{window.__hold=0;window.__held=0;evDone()})}
    await sleep(60);}
  const fl=await p.evaluate(()=>window.__fl);console.log(size,'scenes',[...done].join(','));console.log('  handw states:',fl.slice(0,40).join(' ; '));
  await ctx.close()}
(async()=>{fs.mkdirSync(OUT,{recursive:true});const b=await PW.chromium.launch();for(const [W,H] of SIZES)await run(b,W,H);await b.close();console.log(fails.length?fails.join('\n'):'no page errors')})();
