// jsdom check of debug.html: loads, plays a full AI game through the Step button, then a game with a human seat through the dock
const {JSDOM}=require('../../../node_modules/jsdom');const fs=require('fs');
const html=fs.readFileSync(__dirname+'/../debug.html','utf8');const errs=[];
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:new (require('../../../node_modules/jsdom').VirtualConsole)().on('jsdomError',e=>errs.push(e.message)).on('error',e=>errs.push(String(e)))});
const w=dom.window;w.alert=m=>errs.push('alert '+m);
setTimeout(()=>{const d=w.document;const G=()=>w.eval('G');w.eval('AIDELAY=0');
  for(const [job,np] of [[1,4],[38,3],[66,4],[42,2]]){d.getElementById('job').value=String(job);d.getElementById('np').value=String(np);d.getElementById('human').value='-1';d.getElementById('new').click();
    let k=0;while(!G().over&&k++<3000)d.getElementById('step').click();console.log('job',job,np,'over',!!G().over,G().winText,'steps',k)}
  d.getElementById('job').value='4';d.getElementById('np').value='3';d.getElementById('human').value='0';d.getElementById('new').click();d.getElementById('wwk').checked=true;d.getElementById('viewas').value='0';d.getElementById('viewas').dispatchEvent(new w.Event('change'));
  let k=0;while(!G().over&&k++<3000){const b=d.getElementById('doit');if(b){const sel=d.getElementById('mvs');sel.value=String(Math.floor(Math.random()*Math.min(5,sel.options.length)));b.click()}else d.getElementById('step').click()}
  console.log('human game over',!!G().over,'help panel',d.getElementById('help').textContent.length>0,'errors',errs.length,errs.slice(0,3));},50);
