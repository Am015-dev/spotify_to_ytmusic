// drive26 quick-review UI shots at 852x393 touch: ⚙ drawer Steer + Grip tabs (drive26 knobs), checklist (v88g items), console errors
const L=require('../qa25/lib.js');(async()=>{const T=await L(process.argv[2],process.argv[3]);const{ev,tap,shot,pg}=T;await pg.waitForTimeout(1500);
 await tap('#tuG',800);await tap('[data-g="Steer"]',600);await shot('tune_steer');
 await tap('[data-g="Grip"]',600);await ev(()=>{const r=[...document.querySelectorAll('#tuD *')].find(e=>/GAS\+BRAKE drift: hold/.test(e.textContent)&&e.children.length<3);r&&r.scrollIntoView({block:'center'})});await shot('tune_grip');
 console.log('D26',JSON.stringify(await ev(()=>window.__d26&&__d26())));
 await tap('#tuD .ckB',800);await shot('chk_open');console.log('CHK',JSON.stringify(await ev(()=>__chk.text().split('\n').filter(l=>/v88g/.test(l)))));await T.close()})();
