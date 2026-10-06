# v87d changelog entry (pART8 release): prepended to OD_CHANGELOG; skipped when already there
exec(open('P.py').read())
if "{v:'v87d'" not in s:
    R("const OD_CHANGELOG=[\n","const OD_CHANGELOG=[\n {v:'v87d',date:'6 Oct 2026',items:[{t:'FIXED',s:'Roads no longer flicker to grass while you drive.'},{t:'CHANGED',s:'Cars cast crisp, car-shaped shadows on the ground.'}]},\n")
save()
