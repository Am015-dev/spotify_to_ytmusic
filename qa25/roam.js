// enter free roam (Frankfurt) by the test hook, then clear the intro cutscene / tutorial with real taps
module.exports=async(T)=>{const{ev}=T;await ev(()=>__g9ev(`(()=>{if(state!=='roam')enterRoam();return 1})()`));
 await T.p.waitForFunction(()=>{try{return __g9ev("state==='roam'&&RO.on&&RO.marks.length>0")}catch(e){return false}},null,{timeout:180000});
 for(let i=0;i<30;i++){await T.pg.waitForTimeout(1500);if(await ev(()=>document.querySelector('#roamMapBtn').getBoundingClientRect().width>0))break;
  for(const s of['#m1Skip','#tutSkip','#storyGo']){const v=await ev(s=>{const e=document.querySelector(s);return !!e&&e.getBoundingClientRect().width>0},s);if(v){await T.tap(s,800);break}}}
 await T.pg.waitForTimeout(1500)};
