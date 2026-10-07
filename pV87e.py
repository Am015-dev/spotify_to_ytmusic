# v87e changelog entry (pART9 release): prepended to OD_CHANGELOG; skipped when already there
exec(open('P.py').read())
if "{v:'v87e'" not in s:
    R("const OD_CHANGELOG=[\n","const OD_CHANGELOG=[\n {v:'v87e',date:'7 Oct 2026',items:[{t:'FIXED',s:'The crates the getaway van drops are real LEGO crates now, not a big brown box on the road.'},{t:'FIXED',s:'Your car stays crisp and solid in races; the cyan glow no longer washes over it when you SMASH.'},{t:'CHANGED',s:'City trucks keep white cargo boxes and cars keep black windows and trim; only the body is coloured.'}]},\n")
save()
