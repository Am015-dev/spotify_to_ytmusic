// enter free roam (Frankfurt, or ATH=1 Athens) then run fn
module.exports=async(T,ath)=>{const{ev}=T;await ev(a=>__g9ev(`(()=>{if(state!=='roam')enterRoam();return 1})()`),ath);
 await T.p.waitForFunction(()=>{try{return __g9ev("state==='roam'&&RO.on&&RO.marks.length>0&&document.querySelector('#roamMapBtn').offsetParent!==null")}catch(e){return false}},null,{timeout:180000});await T.pg.waitForTimeout(3000)};
