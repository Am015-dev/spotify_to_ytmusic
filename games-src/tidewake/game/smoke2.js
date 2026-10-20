const {JSDOM,VirtualConsole}=require('../../node_modules/jsdom');const fs=require('fs');
const html=fs.readFileSync(__dirname+'/tidewake.html','utf8');
const vc=new VirtualConsole();vc.on('jsdomError',e=>console.log('JSDOM',e.message.slice(0,300)));vc.on('error',(...a)=>console.log('ERR',a.join(' ').slice(0,500)));
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://gns.test/',virtualConsole:vc});const w=dom.window,d=w.document;
w.addEventListener('load',()=>{w.eval('AIDELAY=0;ANIM=0;setSeed(5);setAiSeed(5)');
 console.log('t0');w.eval('startGuided()');console.log('t1 started',w.eval('G.phase'),w.eval('sideToAct()'));
 console.log(w.eval('JSON.stringify(aiStep())'));console.log('t2');
 w.eval('aiAct()');console.log('t3',w.eval('G.phase'),w.eval('sideToAct()'));process.exit(0)});
