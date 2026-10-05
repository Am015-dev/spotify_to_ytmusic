# pQA6 · phone: ❚❚ opens the pause menu (restart / abandon / map / garage) like MENU does, not Settings; HUD text ≥ 12 px on touch
# (tPlay found 8–9 px labels: KM/H, NEXT, the chapter line, event split timers, TAP TO OPEN).
exec(open('P.py').read())
R("function togglePause(force){if(state==='roam'){if($('#settings').hidden){RO.frozen=true;openSettings()}else closeSettings();return}",
  "function togglePause(force){if(state==='roam'){if(!$('#settings').hidden){closeSettings();return}if($('#roamPause')){if($('#roamPause').hidden)roamPauseOpen();else roamPauseClose();return}RO.frozen=true;openSettings();return}")
R('</style>','''
/* QA6: readable phone HUD text (>= 12 px) */
body.touch #roamGauge small,body.touch #roamPlate small,body.touch #m1Next b,body.touch #m1Next small,body.touch #roamPrompt span,body.touch #roamStuds,
body.touch #ogHud,body.touch #ogHud *,body.touch #qTrk .qd,body.touch #qTrk .qtw,body.touch #qTrk p,body.touch #roamArrow,body.touch #roamArrow span,body.touch #roamTut p,body.touch #roamPop,body.touch #roamPop *,body.touch #roamCard p,body.touch #roamCard small{font-size:max(12px,1em)!important}
body.touch #roamPlate small{white-space:nowrap}
</style>''')
save()
