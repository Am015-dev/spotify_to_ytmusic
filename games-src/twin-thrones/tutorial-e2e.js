// Tutorial-to-end driver: node tutorial-e2e.js p|d  (p = 390x763 touch, d = 1440x860 mouse). Taps the centre of each spotlit element, asserts every step id was shown and the result screen is reached. PASS/FAIL line.
const path = require('path'); const PW = require('path').resolve(__dirname, '..', 'node_modules', 'playwright'); const HTML = 'file://' + path.resolve(__dirname, 'twin-thrones.html');
const fs=require('fs'); fs.mkdirSync(process.env.SHOTS||'/tmp/ttshots',{recursive:true});
const LIB=(function(){// shared driver: taps only visible UI. exports play(pg, touch, opts)
const T = async (pg, touch, loc) => { await loc.scrollIntoViewIfNeeded().catch(()=>{}); return touch ? loc.tap({timeout:4000}) : loc.click({timeout:4000}); };
async function dt(pg){ return (await pg.locator('#dt').textContent().catch(()=>'')||'').trim(); }
async function playToResult(pg, touch, o={}) {
  const t0 = Date.now(); let turns = 0, shots = o.shots||{};
  while (Date.now()-t0 < (o.max||240000)) {
    if (o.stopAt && await o.stopAt(pg)) return {turns, ok:true};
    if (await pg.locator('#res:not([hidden])').count()) return {turns, ok:true, result:true};
    if (o.story && await pg.locator('.gxc-result, .gxc-res, [data-gxc-result]').count()) return {turns, ok:true, result:true};
    if ((await dt(pg)) !== 'Your move') { await pg.waitForTimeout(120); continue; }
    if (await pg.locator('.wcard.go').count()) { await T(pg,touch,pg.locator('.wcard.go').first()); continue; }
    if (await pg.locator('[data-first]').count()) { await T(pg,touch,pg.locator('[data-first]').first()); continue; }
    if (await pg.locator('.picker .tk').count()) { await T(pg,touch,pg.locator('.picker .tk').first()); continue; }
    const av = pg.locator('#pyr .card.av:not(.dim)');
    if (await av.count()) {
      if (!(await pg.locator('#zoom:not([hidden])').count())) { await T(pg,touch,av.nth(Math.floor(Math.random()*Math.min(3,await av.count())))); await pg.waitForTimeout(150); }
      const b = pg.locator('#zoom [data-a="build"]:not([disabled])');
      if (await b.count()) await T(pg,touch,b.first()); else await T(pg,touch,pg.locator('#zoom [data-a="discard"]').first());
      turns++; continue;
    }
    await pg.waitForTimeout(120);
  }
  return {turns, ok:false};
}


return { T, dt, playToResult };})();
const { chromium } = require(PW);
const { T } = LIB;
const sizes = { p:[{width:390,height:763},true], d:[{width:1440,height:860},false] };
const which = process.argv[2]||'p'; const out = process.argv[3]||(process.env.SHOTS||'/tmp/ttshots');
(async()=>{
  const [vp,touch]=sizes[which];
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});
  const c = await b.newContext({viewport:vp,hasTouch:touch,isMobile:touch}); const pg = await c.newPage();
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>m.type()==='error'&&errs.push(m.text()));
  await pg.goto(HTML);
  await pg.evaluate(()=>{window.AIDELAY=90});
  await pg.waitForTimeout(500);
  await T(pg,touch,pg.locator('[data-gxt-open]').first());
  const log=[]; let guard=0, lastId='', stuck=0, shots=0;
  const t0=Date.now();
  while(Date.now()-t0<420000){
    // scene screens (story beats): tap Next
    const sc = pg.locator('.gxc-scene .gxc-btn.go:visible');
    if (await sc.count() && !(await pg.evaluate(()=>GXT.state().shown))) { await (touch?sc.first().tap({timeout:3000}):sc.first().click({timeout:3000})).catch(e=>console.log('SCFAIL')); await pg.waitForTimeout(150); continue; }
    const st = await pg.evaluate(()=>{ const s=GXT.state(); return {a:s.active,id:s.id,shown:s.shown,wait:s.wait,hole:s.hole,phase:s.phase,say:s.say,end:!!document.querySelector('.gxt-end [data-gxt-end]')}; });
    const endBtn = pg.locator('.gxt-end [data-gxt-end]');
    if (await endBtn.count()) { const id = await endBtn.first().getAttribute('data-gxt-end'); log.push('end:'+id); if (shots<9){await pg.screenshot({path:`${out}/${which}-t-end${shots++}.png`});} if(id==='next'){await (touch?endBtn.first().tap():endBtn.first().click()); await pg.waitForTimeout(300); continue;} else { await (touch?endBtn.first().tap():endBtn.first().click()); break; } }
    if (!st.a || !st.shown) { await pg.waitForTimeout(150); continue; }
    if (st.id!==lastId) { lastId=st.id; stuck=0; log.push(st.id); console.log('step',st.id); if(['pyramid','take-free','build-red','token','scoring'].includes(st.id) && shots<12) await pg.screenshot({path:`${out}/${which}-t-${st.id}.png`}); }
    // coverage: elementFromPoint at the target centre must be the target (or inside it)
    const h = st.hole; const cx=h.cx??(h.left+h.width/2), cy=h.cy??(h.top+h.height/2);
    const cover = await pg.evaluate(([x,y])=>{ const e=document.elementFromPoint(x,y); return e? (e.className&&String(e.className)||e.tagName)+'|'+(e.closest('[data-help]')?'kit':'') : 'none'; },[cx,cy]);
    if (st.wait && (cover.includes('gxt-cell')||cover.includes('gxt-bub'))) log.push('COVERED '+st.id+' '+cover);
    if (st.wait) { if(touch) await pg.touchscreen.tap(cx,cy); else await pg.mouse.click(cx,cy); }
    else { await (touch?pg.locator('.gxt-next').first().tap({timeout:3000}):pg.locator('.gxt-next').first().click({timeout:3000})).catch(e=>console.log('NEXTFAIL',st.id,String(e).slice(0,300))); }
    await pg.waitForTimeout(250); if (++stuck>60) { log.push('STUCK '+st.id); break; }
  }
  await pg.waitForTimeout(500);
  const cov = await pg.evaluate(()=>TT_TUTOR.coverage());
  const missing = cov.all.filter(x=>!cov.seen.includes(x));
  const okAll = !missing.length && !errs.length && log.includes('end:play') && !log.some(x=>x.startsWith('STUCK')||x.startsWith('COVERED'));
  console.log((okAll?'PASS ':'FAIL ')+'tutorial-to-end', which, 'steps seen', log.filter(x=>!x.startsWith('end')&&!x.startsWith('COV')&&!x.startsWith('STUCK')).length, 'missing', JSON.stringify(missing), 'errors', JSON.stringify(errs.slice(0,3)));
  console.log(log.join(' > ').slice(0,1500));
  await b.close();
})();
