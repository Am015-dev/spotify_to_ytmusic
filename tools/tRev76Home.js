// tRev76Home: node tools/tRev76Home.js <base url> <outdir>  -> first/ret x land/port home-screen shots + credits check
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const ret of[0,1])for(const por of[0,1]){
  const c=await b.newContext({viewport:por?{width:393,height:852}:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.setDefaultTimeout(300000);p.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,160)));
  if(ret)await p.addInitScript(()=>{try{localStorage.setItem('mho_prof@1',JSON.stringify({xp:250}));localStorage.setItem('mho_seenVer','x')}catch(e){}});
  await p.goto(BASE);await p.waitForTimeout(25000);
  const n=(ret?'ret':'first')+'_'+(por?'port':'land');await p.screenshot({path:OUT+'/'+n+'.png'});
  console.log(n,await p.evaluate(()=>{const t=document.body.innerText;return JSON.stringify({play:/PLAY|CONTINUE/.test(t),cr:/Made with .* by Alex/.test(t),m3d:/3D models by Alex/.test(t)})}));
  await c.close()}
 await b.close()})();
