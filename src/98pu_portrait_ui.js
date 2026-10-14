// ---- PU (xform-1, 2026-10-14): PORTRAIT HUD layout fixes for rev-1's rv14/rv-p-* (393×852). Portrait only, landscape untouched. Selectors repeat the id (#x#x#x) to beat older 'html body #roam #x' rules.
// Driving HUD: timer right of pause, route arrow over a lowered minimap, Hilde's bubble on the right (clear of minimap + ⚙), speed readout under the
// minimap (it sat on the car), boost bar under the speed readout (it covered ▶; the bottom row changes per mode). Race: speed block under "2ND" (it overlapped). Mission card: full width (text was a ~85 px column), LET'S GO / LATER in the flow at the end (they floated over the text). Garage: the district chip hides, the bottom tabs keep their width and scroll (labels ran into each other).
{const st=document.createElement('style');st.textContent=`
@media (orientation:portrait){
 html body #raceW#raceW#raceW{left:calc(84px + env(safe-area-inset-left,0px))!important}
 html body #roamMini#roamMini#roamMini{top:calc(84px + env(safe-area-inset-top,0px))!important}
 html body #npcSay#npcSay#npcSay{left:auto!important;right:8px!important;transform:none!important;top:calc(104px + env(safe-area-inset-top,0px))!important;max-width:calc(100vw - 132px)!important}
 html body #roamGauge#roamGauge#roamGauge{left:calc(12px + env(safe-area-inset-left,0px))!important;right:auto!important;transform:none!important;top:calc(196px + env(safe-area-inset-top,0px))!important;bottom:auto!important}
 html body #b2kM#b2kM#b2kM{left:calc(12px + env(safe-area-inset-left,0px))!important;right:auto!important;transform:none!important;top:calc(242px + env(safe-area-inset-top,0px))!important;bottom:auto!important;width:100px!important}
 body #r2C>.r2T{flex:none!important;min-width:max-content!important;padding:0 10px!important}
 html body #hBR#hBR#hBR{top:calc(88px + env(safe-area-inset-top,0px))!important}
 html body #roamCard#roamCard#roamCard{left:calc(12px + env(safe-area-inset-left,0px))!important;right:calc(12px + env(safe-area-inset-right,0px))!important;width:auto!important;max-width:none!important;transform:none!important;top:calc(104px + env(safe-area-inset-top,0px))!important;max-height:calc(100% - 190px)!important;overflow-y:auto!important}
 html body #roamCard#roamCard#roamCard>img{width:56px!important;height:56px!important;flex:none}
 html body #roamCard#roamCard#roamCard .rcb{position:static!important}
 html body #roamCard#roamCard#roamCard .brief>div{grid-template-columns:26px 1fr!important}body #roamCard .brief>div>span{grid-column:1/-1!important}
}
body:has(#gbx:not([hidden])) #ogArea{display:none!important}`;document.head.appendChild(st)}
