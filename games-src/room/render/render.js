const {chromium}=require('/tmp/claude-0/-home-user-spotify-to-ytmusic/5a36d2af-8697-5203-aeea-a0f2a3329615/scratchpad/node_modules/playwright');
const fs=require('fs'),serve=require('./server.js');
(async()=>{const [mode,out,w,layer,extra]=[process.argv[2]||'day',process.argv[3]||'out.png',process.argv[4]||'1920',process.argv[5]||'back',process.argv[6]||''];
const s=await serve(8124);const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:+w,height:Math.round(+w/1.6)}});p.on('console',m=>console.log('C',m.text()));p.on('pageerror',e=>console.log('E',e.message));
await p.goto(`http://localhost:8124/scene.html?mode=${mode}&w=${w}&layer=${layer}&${extra}`);await p.waitForFunction('window.__done',null,{timeout:280000});
const url=await p.evaluate(()=>document.querySelector('canvas').toDataURL('image/png'));fs.writeFileSync(out,Buffer.from(url.split(',')[1],'base64'));
fs.writeFileSync(out.replace(/\.png$/,'.json'),JSON.stringify(await p.evaluate('window.__meta'),null,1));await b.close();s.close()})();
