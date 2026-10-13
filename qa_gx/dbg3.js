const E=require('../bc/enter.js');
(async()=>{const T=await E(process.argv[2],{gfx:'min'});const{p}=T;const W=t=>p.waitForTimeout(t);
 await T.roamApi();for(let i=0;i<16;i++){let hit=0;for(const l of[p.getByText('SKIP',{exact:false}),p.getByText('TAP TO CONTINUE')]){const e=l.first();if(await e.count()&&await e.isVisible()){await T.tapEl(await e.elementHandle());hit=1;break}}if(!hit&&i>3)break;await W(1500)}await W(3000);
 console.log(await p.evaluate(()=>{const P=document.getElementById('odPin');P.style.visibility='hidden';const out=[];for(const y of[50,60,70]){let e=document.elementFromPoint(380,y);const ch=[];while(e&&ch.length<5){const r=e.getBoundingClientRect();ch.push((e.id||'')+'.'+String(e.className).slice(0,20)+' '+[r.left|0,r.top|0,r.width|0,r.height|0]);e=e.parentElement}out.push(y+': '+ch.join(' < '))}P.style.visibility='';return out.join('\n')}));
 await T.b.close()})();
