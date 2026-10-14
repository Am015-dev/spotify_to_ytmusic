// tStart (sink-1, 2026-10-14): the REAL game start as a fresh player gets it (no ?test, no GO, no warp).
//   node tools/sink/tStart.js <page url> <outdir> [fra|ath] [phone|desk] [secs=15] [gas=0|1]
// Taps STORY → NEW GAME (real touch/click), waits for the first roam frame, then measures with the in-game test's SKS_sample (src/98sk_start_sink.js:
// tyres vs groundAt AND vs the drawn surface; traffic + other wheels ≤ 60 m) every 100 ms for <secs> s from touchdown (5 s idle, 4 s GAS).
// PASS/FAIL line: g 0..0.05 (≥ -0.02; traffic ≤ 0.10) above groundAt, v ≥ -0.08 vs the drawn road (same rule as SKS_bad). Writes <outdir>/start_<city>_<prof>.json + shots. ~4-6 min in software GL.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const [URL,OUT='qa_sink',CITY='fra',PROF='phone',SECS='15',GAS='0']=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ph=PROF==='phone',ctx=await b.newContext(ph?{viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true}:{viewport:{width:1280,height:720}});
 if(CITY==='ath')await ctx.addInitScript(()=>{try{localStorage.setItem('mho_city@1','ath')}catch(e){}});
 const p=await ctx.newPage();p.setDefaultTimeout(180000);p.on('crash',()=>console.log('PAGE CRASH'));p.on('close',()=>console.log('PAGE CLOSE'));const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
 // module-scope eval hook (window.__ev) appended to the page's module script via the network: the built page itself is untouched otherwise
 await p.route(u=>u.pathname.endsWith('/index.html')||u.pathname.endsWith('.html'),async r=>{const res=await r.fetch();let t=await res.text();const i=t.indexOf('<script type="module">');if(i>=0){const j=t.indexOf('</script>',i);t=t.slice(0,j)+'\n;window.__ev=__s=>eval(__s);\n'+t.slice(j)}await r.fulfill({response:res,body:t})});
 const T0=Date.now();await p.goto(URL,{waitUntil:'commit'});console.log('goto ok');
 // log what the player sees; at the menu tap STORY like a player (real touch), then wait for roam
 const st=()=>p.evaluate(()=>{try{if(!window.__ev)return{st:window.__mho&&__mho.state,noev:1};return __ev(`({st:__mho.state,roam:typeof RO!=='undefined'&&!!RO.on,cs:typeof M1!=='undefined'&&!!M1.cs,fr:typeof RO!=='undefined'&&!!RO.frozen,foot:typeof RO!=='undefined'&&RO.foot})`)}catch(e){return{e:String(e).slice(0,60)}}}).catch(e=>({e:'nav'}));
 const seen=[];let tapped=0;for(let i=0;Date.now()-T0<300000;i++){const s=await st();const k=JSON.stringify(s);if(seen[seen.length-1]!==k){seen.push(k);console.log(((Date.now()-T0)/1000).toFixed(1)+'s '+k)}
  if(s.st==='menu'&&!tapped){await p.waitForTimeout(800);await p.screenshot({path:`${OUT}/s_menu_${CITY}_${PROF}.jpg`,type:'jpeg',quality:60});const h=p.locator('#hcStory');if(ph)await h.tap();else await h.click();tapped=1;console.log('TAP STORY');await p.waitForTimeout(1200)}
  if(tapped===1){const ng=p.locator('button:visible',{hasText:'NEW GAME'}).first();if(await ng.count()){await p.screenshot({path:`${OUT}/s_slots_${CITY}_${PROF}.jpg`,type:'jpeg',quality:60});if(ph)await ng.tap();else await ng.click();tapped=2;console.log('TAP NEW GAME')}}
  if(s.roam&&s.st==='roam')break;await p.waitForTimeout(250)}
 await p.screenshot({path:`${OUT}/s0_${CITY}_${PROF}.jpg`,type:'jpeg',quality:70});
 // the same measure as the in-game test (src/98sk_start_sink.js SKS_sample); injected into builds that predate it (e.g. beta.56)
 await p.evaluate(c=>{if(__ev('typeof SKS_sample')!=='function')__ev(c)},fs.readFileSync(__dirname+'/../../src/98sk_start_sink.js','utf8'));
 // from the first roam frame: wait for touchdown (Hot Drop parachute) or control; sample through the rest of the scene and <secs> s after control:
 // 5 s no input, GAS (ArrowUp, real key) 4 s, release. t in the JSON = s since touchdown
 const S=await p.evaluate(secs=>new Promise(res=>{const out=[],t0=performance.now();let td=null,tc=null,gas=0;const id=setInterval(()=>{const t=(performance.now()-t0)/1000;
   const st=JSON.parse(__ev(`JSON.stringify({cs:!!(typeof M1!=='undefined'&&M1.cs),fr:!!RO.frozen,air:!!(pl&&pl.air),y:pl&&pl.mesh.position.y,g:groundAt(RO.x,RO.z,99),x:RO.x,z:RO.z,v:RO.v})`));
   if(td==null&&(st.y<=st.g+.01||(!st.cs&&!st.fr)))td=t;if(td==null){if(t>420){clearInterval(id);res(out)}return}if(tc==null&&!st.cs&&!st.fr)tc=t;const tt=t-td,ct=tc==null?-1:t-tc;
   if(ct>=0){if(ct>=5&&ct<9&&!gas){__ev("SKS_key('ArrowUp',1)");gas=1}else if(ct>=9&&gas===1){__ev("SKS_key('ArrowUp',0)");gas=2}}
   const o=st.air?{air:1}:__ev('SKS_sample('+(out.length%10===0?2:0)+')');const r=a=>a.map(q=>({g:+q.g.toFixed(3),v:q.v==null?null:+q.v.toFixed(3),x:Math.round(q.x),z:Math.round(q.z),pk:q.pk?1:0}));
   out.push({t:+tt.toFixed(1),cs:st.cs,v:+st.v.toFixed(1),air:!!st.air,pl:o.pl&&r(o.pl),tr:o.tr&&r(o.tr),ot:o.ot&&r(o.ot)});if(ct>=secs||t>600){clearInterval(id);res(out)}},100)}),+SECS);
 await p.screenshot({path:`${OUT}/s1_${CITY}_${PROF}.jpg`,type:'jpeg',quality:70});
 const W={},bad=[];for(const s of S){if(s.air)continue;for(const k of['pl','tr','ot'])for(const q of s[k]||[]){const w=W[k]=W[k]||{gMin:9,gMax:-9,vMin:9,n:0};w.n++;w.gMin=Math.min(w.gMin,q.g);w.gMax=Math.max(w.gMax,q.g);if(q.v!=null&&!(k==='tr'&&q.pk))w.vMin=Math.min(w.vMin,q.v);
   if((q.g<-.02||q.g>(k==='tr'?.1:.05)||(q.v!=null&&q.v<(k==='tr'?-.12:-.08)&&!(k==='tr'&&q.pk)))&&bad.length<8)bad.push(k+'@'+q.x+','+q.z+' t'+s.t+(s.cs?'cs':'')+' g'+q.g+' v'+q.v)}}
 fs.writeFileSync(`${OUT}/start_${CITY}_${PROF}.json`,JSON.stringify({seen,S,errs},null,0));
 console.log((bad.length?'FAIL ':!S.length?'INCONCLUSIVE (no samples: touchdown/control never reached) ':'PASS ')+JSON.stringify({city:CITY,prof:PROF,samples:S.length,W,bad,errors:errs.length,firstErr:errs[0],boot_s:(Date.now()-T0)/1000|0}));
 await b.close()})();
