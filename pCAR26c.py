exec(open('P.py').read())
# v87b changelog entry (prepended)
R("const OD_CHANGELOG=[\n",
"const OD_CHANGELOG=[\n {v:'v87b',date:'6 Oct 2026',items:[{t:'FIXED',s:'Double-tap ◀ or ▶ to SMASH works with a normal thumb double-tap, flashes the arrow and shows SMASH! even when nothing is hit.'},{t:'CHANGED',s:'Races have no civilian traffic blocking the track any more; rivals stay.'},{t:'CHANGED',s:'Cars drive like real cars: they lean in corners and dip under braking, grip runs out gradually, and they slide a little if you brake hard into a turn. Rivals use the same physics.'}]},\n")
# race timer clears the pause button on touch (reviewer follow-up)
R("body.v85 #tP{left:max(28px,calc(10px + env(safe-area-inset-left,0px)))!important}",
  "body.v85 #tP{left:max(28px,calc(10px + env(safe-area-inset-left,0px)))!important}body.v85.touch #hTime{left:calc(max(28px,calc(10px + env(safe-area-inset-left,0px))) + 58px)!important}")
save()
