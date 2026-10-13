const E=require('../bc/enter.js');
(async()=>{const T=await E(process.argv[2],{gfx:'normal',tick:0});const{p,tap}=T;await tap('#gbMenuBtn');await p.waitForTimeout(2000);await tap('#r2R [data-r2m="build"]');await p.waitForTimeout(2500);await p.screenshot({path:'g17/fb/0_street_build.png'});
 console.log(await T.ev('JSON.stringify({d:GB_.dist,yaw:GB_.yaw,pit:GB_.pit,L:B25.L})'));await T.b.close()})();
