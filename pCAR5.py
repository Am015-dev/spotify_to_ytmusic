# CAR5: phone HUD = one objective line. The NEXT card absorbs the distance pill (pill hidden while NEXT shows); the zone banner
# fades 2 s after it changes and while the tutorial card is up, and sits clear of the minimap ring. Pause + 5 driving buttons unchanged.
exec(open('P.py').read())
if 'CR_hud' in s:
    print('OK');raise SystemExit
JS=r'''
// ---------- CAR5 HUD: one objective line
(()=>{const st=document.createElement('style');st.textContent=`
#m1Next b,#m1Next small{display:none!important}#m1Next{border-radius:18px!important;padding:3px 12px 3px 8px!important;gap:6px!important}#m1Next span{font-size:13px!important;max-width:min(300px,46vw)!important}
#m1Next .crD{display:block;flex:none;font:800 12px system-ui;color:#4ceaff;white-space:nowrap}body.crMerge #roamArrow{visibility:hidden!important}
body.crMerge #m1Next{top:calc(54px + env(safe-area-inset-top,0px))!important}@media (max-height:520px){body.crMerge #m1Next{top:calc(26px + env(safe-area-inset-top,0px))!important}}
#roamPlate{transition:opacity .45s}#roamPlate.crHide{opacity:0!important}
body.touch #roamPlate{left:calc(114px + env(safe-area-inset-left,0px))!important}`;document.head.appendChild(st)})();
const CR_hudS={k:'',t:0};
function CR_hud(){const n=document.getElementById('m1Next'),a=document.getElementById('roamArrow'),pl=document.getElementById('roamPlate'),tu=document.getElementById('roamTut');
 const vis=e=>!!e&&!e.hidden&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden'&&e.getClientRects().length>0;
 const m=vis(n)&&!!a;document.body.classList.toggle('crMerge',m);
 if(m){let d=n.querySelector('.crD');if(!d){d=document.createElement('em');d.className='crD';n.appendChild(d)}const sp=a.querySelector('span');d.textContent=sp?sp.textContent.trim():''}
 if(pl){const k=pl.textContent;const now=performance.now();if(k!==CR_hudS.k){CR_hudS.k=k;CR_hudS.t=now}pl.classList.toggle('crHide',now-CR_hudS.t>2000||vis(tu))}}
setInterval(CR_hud,250);
// tutorial card: keep >= 8 px clear of the touch controls (between ▶ and BRAKE)
function CR_tutFit(){const t=document.getElementById('roamTut');if(!t||!document.body.classList.contains('touch')||t.hidden||!t.getClientRects().length){return}
 const bs=[...document.querySelectorAll('button,.tbtn,div')].filter(e=>/^(▶|BRAKE)$/.test((e.textContent||'').trim())&&e.getClientRects().length&&e.offsetWidth>30&&e.offsetWidth<160);
 const rb=bs.find(e=>e.textContent.trim()==='▶'),bk=bs.find(e=>e.textContent.trim()==='BRAKE');if(!rb||!bk)return;const L=rb.getBoundingClientRect().right+18,Rr=bk.getBoundingClientRect().left-18;
 if(Rr-L<200)return;const S=(k,v)=>t.style.setProperty(k,v,'important');S('left',L+'px');S('right','auto');S('transform','none');S('max-width',(Rr-L)+'px');S('box-sizing','border-box')}
setInterval(CR_tutFit,300);
'''
i=s.index('const GB_PRE=[')
s=s[:i]+JS+'\n'+s[i:]
# wording: it's a car, not a ship
s=s.replace("Drive! Your ship accelerates by itself","Drive! Your car accelerates by itself").replace("your ship is the weapon","your car is the weapon")
save()
print('OK')
