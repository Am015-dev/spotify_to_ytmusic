// map filter test: real taps on chips at 852x393 (or VW/VH), checks icons drawn per category, tap-through of hidden icons, persistence after reload
const L=require('./lib.js'),R=require('./roam.js');(async()=>{const U=process.argv[2],T=await L(U,process.argv[3]);await R(T);const{ev,tap}=T;
 const drawn=()=>ev(()=>__g9ev(`(()=>{MF.g=1;try{const C={};for(const m of RO.marks)if(markKnown(m)){const c=MF_cat(m)||'other';C[c]=(C[c]||0)+1}return JSON.stringify(C)}finally{MF.g=0}})()`));
 await tap('#roamMini',1500);await T.shot('map_all');console.log('chips',JSON.stringify(await ev(()=>[...document.querySelectorAll('#mfBar button')].map(b=>{const r=b.getBoundingClientRect();return[b.dataset.mf,b.className,r.width|0,r.height|0,parseFloat(getComputedStyle(b).fontSize)]}))));
 console.log('drawn all',await drawn());
 await tap('#mfBar [data-mf="race"]');console.log('races off',await drawn(),JSON.stringify(await ev(()=>__mf.off())));await T.shot('map_noraces');
 await tap('#mfBar [data-mf="all"]');console.log('all off',await drawn());await T.shot('map_none');
 await tap('#mfBar [data-mf="all"]');console.log('all off',await drawn());await tap('#mfBar [data-mf="garage"]');console.log('garages only',await drawn());await T.shot('map_garages');
 // tap where a hidden race icon sits: must not become the waypoint
 const pt=await ev(()=>__g9ev(`(()=>{const m=RO.marks.find(m=>MF_hid(m)&&(()=>{const[x,y]=RO.mapP(m.x,m.z),d=DPR2(),c=document.querySelector('#roamMapC').getBoundingClientRect();return y/d>130&&y/d<c.height-20&&x/d>20&&x/d<c.width-120})());if(!m)return null;const[x,y]=RO.mapP(m.x,m.z),r=document.querySelector('#roamMapC').getBoundingClientRect(),d=DPR2();return JSON.stringify({x:r.left+x/d,y:r.top+y/d,in:x>0&&y>0&&x<r.width*d&&y<r.height*d})})()`));
 console.log('hidden sprint at',pt);if(pt){const p=JSON.parse(pt);if(p.in&&p.y>90){await T.tapXY(p.x,p.y,800);console.log('wp after tap on hidden',await ev(()=>__g9ev("RO.wp?RO.wp.kind:'none'")))}}
 await tap('#roamMapX',800);await T.shot('mini_garages');
 if(!process.env.IFRAME){await T.pg.reload();await T.p.waitForFunction(()=>window.__mf,null,{timeout:120000});console.log('after reload off',JSON.stringify(await ev(()=>__mf.off())))}
 await T.close()})();
