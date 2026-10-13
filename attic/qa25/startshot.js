const L=require('./lib.js');(async()=>{const T=await L(process.argv[2],process.argv[3]);await T.pg.waitForTimeout(2000);await T.shot(process.env.IFRAME?'start_iframe':'start');await T.close()})();
