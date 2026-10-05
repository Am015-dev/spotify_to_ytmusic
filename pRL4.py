# RL4 (release integration): phone HUD. otg2's event panel (#ogHud, fixed at 142 px) and result banner (#ogRes) sat on top of the district
# plate and the NEXT card in portrait (three unreadable layers). While an otg2 panel is showing, the plate and NEXT card are hidden;
# they come back when the event ends. In portrait the panel is right-aligned so it clears the minimap. Applied after pOG1.
exec(open('P.py').read())
R("body.og-map #ogHud,body.og-map #ogArea{display:none}`",
  "body.og-map #ogHud,body.og-map #ogArea{display:none}body:has(#ogHud:not([hidden])) #m1Next,body:has(#ogHud:not([hidden])) #roamPlate,body:has(#ogRes:not([hidden])) #m1Next,body:has(#ogRes:not([hidden])) #roamPlate{visibility:hidden}@media (orientation:portrait){#ogHud,#ogRes{left:auto;right:calc(10px + env(safe-area-inset-right,0px));transform:none;min-width:0;max-width:calc(100vw - 140px)}}`")
save()
