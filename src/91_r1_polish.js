// ===== R1 (v88b): quick polish. Hilde's radio card (#npcSay) and the tutorial card (#roamTut) share ONE fixed HUD slot: top centre under the
// objective pill, clear of the car and the touch controls (was: the radio card floated just above the car mid-turn, and the tutorial card sat on
// the boost bar between ◀▶ and BRAKE). The tutorial card steps aside while a radio line is up. Garage stat chips + weight badge styles.
{const st=document.createElement('style');st.id='r1Css';st.textContent=`
html body #roam #npcSay,html body #roam #roamTut{left:50%!important;right:auto!important;bottom:auto!important;transform:translateX(-50%)!important;
 top:calc(84px + env(safe-area-inset-top,0px))!important;max-width:min(420px,48vw)!important;box-sizing:border-box}
html body #roam #npcSay>div{border:0!important;background:none!important;min-width:0!important;padding:0 34px 2px 0!important;box-shadow:none!important}
html body #roam:has(#npcSay:not([hidden])) #roamTut{visibility:hidden!important}
@media (orientation:landscape) and (max-height:500px){
 html body #roam #npcSay,html body #roam #roamTut{top:calc(80px + env(safe-area-inset-top,0px))!important;max-width:min(400px,47vw)!important}
 html body #roam #npcSay b{font-size:12px!important;padding:1px 8px!important}
 html body #roam #npcSay img{width:38px!important;height:38px!important;border-width:2px!important}
 html body #roam #npcSay p{font-size:12px!important;line-height:1.25!important}}
#gbStats .r1C i{display:flex;gap:2px;background:none!important;height:9px;overflow:visible}
#gbStats .r1C i b{flex:1;height:100%;border-radius:2px;background:rgba(255,255,255,.14)!important}
#gbStats .r1C i b:nth-child(3){margin-right:4px}
#gbStats .r1C i b.up{background:#3fd46a!important}#gbStats .r1C i b.dn{background:#ff4d4d!important}
#gbStats .r1C em{font:900 italic 14px system-ui;text-align:center;border-radius:6px;padding:0 6px;background:rgba(255,255,255,.12);color:#fff}
#gbStats .r1C em.up{background:#1f9a45}#gbStats .r1C em.dn{background:#c8302a}
#gbStats .r1W{display:inline-block;margin-left:6px;padding:1px 8px;border-radius:6px;background:#ffd12c;color:#141413;font:900 italic 12px system-ui;letter-spacing:.04em;vertical-align:1px}`;
document.head.appendChild(st)}
