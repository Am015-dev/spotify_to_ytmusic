// tRect: boot ?test=fra in a 393×852 touch page, run checklist GO <id>, wait <ms>, print the screen rect + key CSS of the given element ids (portrait UI work).
//   node tools/tRect.js <url> <go id> <ms> id1,id2,...
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [U,GO,MS,IDS]=process.argv.slice(2);const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await (await b.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:1})).newPage();
 await p.goto(U+'?test=fra&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__chk,null,{polling:250,timeout:120000});
 if(GO&&GO!=='-')await p.evaluate(k=>__chk.go(k),GO);await p.waitForTimeout(+MS||3000);
 const r=await p.evaluate(ids=>ids.split(',').map(id=>{const e=document.getElementById(id);if(!e)return id+' MISSING';const R=e.getBoundingClientRect(),c=getComputedStyle(e);
  return `${id} ${c.display==='none'||e.hidden?'HIDDEN ':''}[${Math.round(R.left)},${Math.round(R.top)} ${Math.round(R.width)}×${Math.round(R.height)}] pos=${c.position} t=${c.top} b=${c.bottom} l=${c.left} r=${c.right} tf=${c.transform==='none'?'-':c.transform.slice(0,30)} z=${c.zIndex}`}).join('\n'),IDS);
 console.log(r);if(process.env.ALL)console.log(await p.evaluate(()=>[...document.querySelectorAll('[id]')].filter(e=>{const R=e.getBoundingClientRect(),c=getComputedStyle(e);return R.width>4&&R.height>4&&c.visibility!=='hidden'&&+c.opacity>0&&(c.position==='absolute'||c.position==='fixed')&&R.width<393&&R.top<852}).map(e=>{const R=e.getBoundingClientRect();return e.id+' ['+Math.round(R.left)+','+Math.round(R.top)+' '+Math.round(R.width)+'×'+Math.round(R.height)+']'}).join('\n')));
 if(process.env.EV)console.log('EV',await p.evaluate(s=>{window.__dbg=1;try{return JSON.stringify(__oc.ev(s))}catch(e){return 'ERR '+e}},process.env.EV));console.log('said',await p.evaluate(()=>__chk.said()));await b.close()})();
