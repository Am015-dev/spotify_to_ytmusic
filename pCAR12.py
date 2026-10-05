# CAR12: one objective pill only (the pill/NEXT merge runs every frame, not every 250 ms, so they never show together);
# the "TAP TO OPEN" prompt sits bottom-centre above the speed readout, between the touch controls, never on the car.
exec(open('P.py').read())
if 'crPrompt' in s:
    print('OK');raise SystemExit
assert 'CR_hud' in s, 'apply pCAR5 first'
JS=r'''
(()=>{const st=document.createElement('style');st.id='crPrompt';st.textContent=`
html body.touch #roamPrompt#roamPrompt{left:50%!important;right:auto!important;top:auto!important;bottom:calc(46px + env(safe-area-inset-bottom,0px))!important;transform:translateX(-50%)!important;max-width:min(240px,30vw)!important;padding:3px 12px!important;font-size:12px!important}
html body #roamPrompt#roamPrompt *{font-size:12px!important;line-height:1.2!important}
body.crMerge #roamArrow{display:none!important}`;document.head.appendChild(st)})();
'''
import re
m=re.search(r'<script type="module">(.*?)</script>',s,re.S)
s=s[:m.end(1)]+JS+"\nroamPose=(f=>function(s,dt){f(s,dt);if(s===pl&&state==='roam'&&((CR_hudS.f=(CR_hudS.f||0)+1)&1))try{CR_hud()}catch(e){}})(roamPose);\n"+s[m.end(1):]
save()
print('OK')
