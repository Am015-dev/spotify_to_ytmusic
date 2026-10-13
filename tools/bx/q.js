// quick probe: node tools/bx/q.js "<js expr run after boot>"
const L=require('./lib.js');(async()=>{const {b,p,E}=await L.launch();const r=await p.evaluate(x=>{try{return JSON.stringify(eval(x))}catch(e){return 'EXC '+e.message}},process.argv[2]);console.log(r);await L.sleep(1500);
 console.log(await p.evaluate(()=>JSON.stringify({on:__bx.BX.on,mode:__bx.BX.mode,pal:!!document.querySelector('#bxPal'),n:__bx.st().n})));console.log(E.join('\n')||'NO_ERRORS');await b.close()})();
