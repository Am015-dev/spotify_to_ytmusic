// art/probe.js <url> [fra|ath]: enter roam, print map features for picking liveliness spots
const enter=require('../bc/enter.js');
(async()=>{const city=process.argv[3]||'fra';const seed=`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));`+(city==='ath'?`localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{},"tut":1}');localStorage.setItem('mho_story.ath@1','{"seen":1}')`:'');
 const t0=Date.now();const E=await enter(process.argv[2],{gfx:'normal',seed});await E.roamApi();console.log('roam in',(Date.now()-t0)/1000|0,'s');
 const r=await E.ev(`(()=>{const o={};o.ro=[RO.x|0,RO.z|0];o.parks=(typeof PARKS!=='undefined'?PARKS:[]).slice(0,12).map(p=>JSON.stringify(p).slice(0,90));o.plazas=(typeof PLAZAS!=='undefined'?PLAZAS:[]).slice(0,6).map(p=>JSON.stringify(p).slice(0,90));
 o.marks=(typeof MARKPOS!=='undefined'?Object.entries(MARKPOS).slice(0,12).map(([k,v])=>k+':'+JSON.stringify(v).slice(0,40)):[]);o.ab=(typeof AB_AUTO!=='undefined'?AB_AUTO.slice(0,4).map(z=>z.name+' '+z.pts[0].map(v=>v|0)):[]);
 o.biomes=typeof BIOMES!=='undefined'?JSON.stringify(BIOMES).slice(0,600):'';o.nodes=HUB.nodes.length;o.props=(HUB.props||[]).length;const ty={};for(const q of HUB.props||[])ty[q.t]=(ty[q.t]||0)+1;o.ptypes=ty;
 o.bbox=(()=>{let a=1e9,b=-1e9,c=1e9,d=-1e9;for(const n of HUB.nodes){if(!n)continue;a=Math.min(a,n.x);b=Math.max(b,n.x);c=Math.min(c,n.z);d=Math.max(d,n.z)}return[a|0,b|0,c|0,d|0]})();return JSON.stringify(o)})()`);
 console.log(r);console.log('errs',E.errs.length,E.errs.slice(0,3).join('|').slice(0,300));await E.b.close()})();
