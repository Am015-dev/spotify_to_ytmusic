# CAR8: mission HUD = one objective line + a small timer. The quest card (HOT DROP · P1/5) merges into the objective pill,
# stage/stars boxes hide, ↺ / ✕ move into the pause menu (RESTART / ABANDON). Needs pCAR5.
exec(open('P.py').read())
if 'CR_mhud' in s:
    print('OK');raise SystemExit
assert 'CR_hud' in s, 'apply pCAR5 first'
JS=r'''
(()=>{const st=document.createElement('style');st.textContent=`
body.crQ #qTrk{display:none!important}body.crQ #raceW .cp,body.crQ #raceW .lst{display:none!important}
body.crQ #raceW .tm{font-size:15px!important;padding:2px 10px!important;min-width:0!important}body.crQ #raceW{top:calc(6px + env(safe-area-inset-top,0px))!important}
body.crQ #roamArrow{top:calc(44px + env(safe-area-inset-top,0px))!important;transform:translateX(-50%)!important;background:rgba(20,20,19,.86);border:2px solid #ffd400;border-radius:18px;padding:3px 12px}
#roamPause [data-p=evr],#roamPause [data-p=eva]{display:flex!important;align-items:center;justify-content:center;white-space:nowrap!important;word-break:normal!important;overflow-wrap:normal!important;font-size:clamp(12px,2.4vw,17px)!important}
body.crQ #m1Hp{top:calc(82px + env(safe-area-inset-top,0px))!important;bottom:auto!important}
#roamArrow .crQn{font:900 12px system-ui;color:#fff;white-space:nowrap;margin-right:4px}`;document.head.appendChild(st)})();
function CR_mhud(){const q=document.getElementById('qTrk'),a=document.getElementById('roamArrow');const on=!!q&&!q.hidden&&q.textContent.trim().length>0&&getComputedStyle(q).display!=='none'||document.body.classList.contains('crQ')&&!!q&&!q.hidden&&q.textContent.trim().length>0;
 document.body.classList.toggle('crQ',!!on);if(a){let n=a.querySelector('.crQn');if(on){if(!n){n=document.createElement('b');n.className='crQn';a.insertBefore(n,a.firstChild)}const b=q.querySelector('.qh b'),sp=q.querySelector('.qh .qs');n.textContent=((b?b.textContent.trim():'')+(sp?' · '+sp.textContent.trim():'')+' ·')}else if(n)n.remove()}
 const pz=document.getElementById('roamPause');if(!pz)return;for(const[k,id]of[['evr','qRst'],['eva','qAbn']]){const b=pz.querySelector(`[data-p="${k}"]`);if(!b)continue;if(on){b.hidden=false;b.dataset.crq=1}else if(b.dataset.crq){b.hidden=true;delete b.dataset.crq}
  if(!b.dataset.crb){b.dataset.crb=1;b.addEventListener('click',e=>{if(!document.body.classList.contains('crQ'))return;e.stopImmediatePropagation();const r=pz.querySelector('[data-p="resume"]');r&&r.click();setTimeout(()=>{const t=document.getElementById(id);t&&t.click()},60)},true)}}}
setInterval(CR_mhud,250);
'''
i=s.index('const GB_PRE=[')
s=s[:i]+JS+'\n'+s[i:]
# review fixes: snap the look direction too after a teleport/cutscene (camera was looking the old way), short pause labels,
# other activity markers (icon + beam) hidden while a mission runs
R("const k=camSnap?1:Math.min(1,dt*6);camSnap=false;","const sn=camSnap,k=sn?1:Math.min(1,dt*6);camSnap=false;")
R("RO.camL=camSnap||RO.camL==null?vt","RO.camL=sn||RO.camL==null?vt")
R("RO.camR=(RO.camR||0)+","RO.camR=sn?0:(RO.camR||0)+")
R("const busyEv=RO.ch||RO.sp;","const busyEv=RO.ch||RO.sp||document.body.classList.contains('crQ');")
R("B.sp.visible=dc>28","B.sp.visible=dc>28&&!document.body.classList.contains('crQ')")
R(">↺ RESTART EVENT</button>",">↺ Restart</button>")
R(">✕ ABANDON EVENT</button>",">✕ Abandon</button>")
save()
print('OK')
