# v87e changelog entry (pART9 release): prepended to OD_CHANGELOG; skipped when already there
exec(open('P.py').read())
if "{v:'v87e'" not in s:
    R("const OD_CHANGELOG=[\n","const OD_CHANGELOG=[\n {v:'v87e',date:'7 Oct 2026',items:[{t:'FIXED',s:'TODO'}]},\n")
save()
