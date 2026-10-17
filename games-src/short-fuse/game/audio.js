// Audio check (SP/BRIEF-perf-audio.md part 3): with sound on, play a full turn through the page; GA must decode the samples and play
// without errors. Logs which events fired and whether each used a sample or the synth fallback; checks main -> tension music.
const PW=require((process.env.PW||require('child_process').execSync('npm root -g').toString().trim()+'/playwright'));
const fs=require('fs'),path=require('path');const HERE=__dirname;const html=fs.readFileSync(path.join(HERE,'shortfuse.html'));
(async()=>{const b=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});let bad=0;
 const ctx=await b.newContext({viewport:{width:1366,height:768}});await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
 const p=await ctx.newPage();p.setDefaultTimeout(150000);const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/net::|Failed to load/.test(m.text())&&errs.push(m.text()));
 await p.goto('https://gns.test/');await p.waitForTimeout(1500);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}setSeed(3);setAiSeed(3);AIDELAY=300});
 const before=await p.evaluate(()=>({snd:SND.on,mus:SND.music,ga:GA.state()}));console.log('before gesture',JSON.stringify(before));
 await p.click('[data-a=job][data-n="4"]');await p.click('[data-a=preset][data-v=solo]');await p.click('[data-a=start]');
 for(let i=0;i<40;i++){await p.waitForTimeout(500);const s=await p.evaluate(()=>GA.state());if(s.decoded>=s.total)break}
 const st=await p.evaluate(()=>GA.state());console.log('GA after the first clicks',JSON.stringify(st));if(!st.audio||st.decoded<st.total-1){bad++;console.log('DECODE problem')}
 // one full turn: opening token, wait for my turn, the suggestion, snip
 for(let k=0;k<6;k++){const q=await p.$('#main [data-a=q]');if(!q)break;await q.click();await p.waitForTimeout(400)}
 for(let k=0;k<60;k++){if(await p.evaluate(()=>!!(UI.V&&UI.V.legal)))break;await p.waitForTimeout(400)}
 const sg=await p.$('[data-a=sugg]');if(sg){await sg.click();await p.waitForTimeout(300)}const go=await p.$('#main [data-a=dual]:not([disabled])');if(go)await go.click();await p.waitForTimeout(2500);
 // open and close a popup (open/close sounds), then a forced miss and the last-life music
 await p.click('.gx-bar [data-gx=logd]');await p.waitForTimeout(500);await p.keyboard.press('Escape');await p.waitForTimeout(300);
 const music1=await p.evaluate(()=>GA.playing());
 await p.evaluate(()=>{G.dial=1;refresh()});await p.waitForTimeout(2500);const music2=await p.evaluate(()=>GA.playing());
 await p.evaluate(()=>{sfx('wrong');sfx('boom');sfx('phew');sfx('win');sfx('validate');sfx('gadget');sfx('scanner');sfx('info');sfx('tick_last');sfx('dial')});await p.waitForTimeout(800);
 const fired=await p.evaluate(()=>SND.fired);const MAP=await p.evaluate(()=>SND_MAP);console.log('events fired:');let synth=0;for(const k in fired){const m=MAP[k];console.log('  ',k.padEnd(12),fired[k],m&&m.s?'-> sample '+m.s:'(synth only)');if(fired[k]!=='sample')synth++}
 console.log('music: at start',music1,'| on the last fuse step',music2);if(music1!=='main'||music2!=='tension'){bad++;console.log('MUSIC cross-fade problem')}
 const miss=Object.keys(MAP).length;console.log('SND_MAP events',miss,'fired',Object.keys(fired).length,'used the synth',synth);
 console.log('errors',JSON.stringify(errs.slice(0,5)));bad+=errs.length;console.log('AUDIO PROBLEMS',bad);await b.close()})().catch(e=>{console.error('FATAL',e);process.exit(1)});
