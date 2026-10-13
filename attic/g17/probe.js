const E=require('../bc/enter.js');
(async()=>{const T=await E(process.argv[2],{gfx:'min',tick:0});const{p,tap}=T;await tap('#gbMenuBtn');await p.waitForTimeout(2000);await tap('#r2R [data-r2m="rides"]');await p.waitForTimeout(1500);
 console.log(await p.evaluate(()=>{const e=document.elementFromPoint(270,358);return e.outerHTML.slice(0,300)+' || '+(e.parentElement&&e.parentElement.outerHTML.slice(0,300))}));await T.b.close()})();
