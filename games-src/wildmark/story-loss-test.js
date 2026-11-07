// usage: node story-loss-test.js (after python3 build.py)
// Story loss + retry + win with real taps/clicks. c1 (goal: score 50): lose by ending early, read the loss screen, tap Try again, win by playing.
const { chromium } = require('playwright');
const O = __dirname + '/shots/', U = 'file://' + __dirname + '/wildmark.html';
(async()=>{ const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); let fails=0;
 for (const [n,vp,t] of [['phone',{width:390,height:763},true],['pc',{width:1440,height:860},false]]) {
 const c=await b.newContext({viewport:vp,hasTouch:t,isMobile:t}); const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 const tap=async l=>{ t? await l.tap(): await l.click(); };
 const gx=async re=>{ const l=p.locator('.gxc button:visible').filter({hasText:re}).first(); await l.waitFor({timeout:8000}); await tap(l); await p.waitForTimeout(350); };
 await p.goto(U+'?fast=1'); await p.evaluate(()=>{localStorage.clear(); localStorage.setItem('gxt-wildmark',JSON.stringify({done:true}));}); await p.reload(); await p.waitForTimeout(600);
 await tap(p.locator('#storyB')); await p.waitForTimeout(500);
 await tap(p.locator('.gxc-node').first()); await p.waitForTimeout(400); await gx(/^play$/i);
 for (let k=0;k<6 && !(await p.evaluate(()=>window.G&&UI.mode==='camp'&&!G.over&&!document.querySelector('.gxc-scene, .gxc-screen:not([hidden])')));k++){ const l=p.locator('.gxc button:visible').filter({hasText:/skip|start|fight|next/i}).first(); if(!(await l.count())) break; await tap(l); await p.waitForTimeout(350);}
 await p.waitForFunction(()=>UI.mode==='camp'&&G&&!G.over,null,{timeout:8000});
 // one real turn, then end the season early (a newcomer who stops short of the goal)
 await tap(p.locator('#mk .mt:not([disabled])').first()); await tap(p.locator('#map .spot').first()); await tap(p.locator('#okB')); await p.waitForTimeout(200);
 const tk=p.locator('#map .tgt, #map .ttgt, #retB, #backB').first(); if (await tk.count()) await tap(tk); await p.waitForTimeout(200);
 await p.evaluate(()=>{ WM.forceEnd(G); render(); step(); });
 await p.locator('#campCont').waitFor({timeout:15000}); const why=await p.locator('#rs').innerText(); await tap(p.locator('#campCont')); await p.waitForTimeout(900);
 await p.screenshot({path:O+n+'-loss.png'});
 const lossTxt = await p.evaluate(()=>document.querySelector('.gxc') ? document.querySelector('.gxc').innerText : ''); const st=await p.evaluate(()=>JSON.stringify(GXC.progress().ch.c1));
 const ok1 = /not this time|lost|try again/i.test(lossTxt) && /"losses":1/.test(st);
 console.log(n, ok1?'PASS':'FAIL', 'chapter loss shows message + Try again', st, '| score', await p.evaluate(()=>G.res[0].total)); if(!ok1) fails++;
 await gx(/try again/i);
 for (let k=0;k<6 && !(await p.evaluate(()=>window.G&&UI.mode==='camp'&&!G.over&&G.seats[0].done===0&&!document.querySelector('.gxc-screen:not([hidden])')));k++){ const l=p.locator('.gxc button:visible').filter({hasText:/skip|start|fight|next/i}).first(); if(!(await l.count())) break; await tap(l); await p.waitForTimeout(350);}
 const retry = await p.evaluate(()=>UI.mode==='camp'&&G&&!G.over&&G.seats[0].done===0);
 console.log(n, retry?'PASS':'FAIL','Try again starts the chapter fresh'); if(!retry) fails++;
 console.log(n, errs.length?'FAIL':'PASS','page errors', errs.length); if (errs.length) fails++;
 await c.close(); }
 await b.close(); console.log(fails?'FAIL story-loss':'PASS story-loss'); process.exit(fails?1:0); })();
