# pART3 · LEGO look step 3+4: contact shadows under cars, blue boost lines + FOV kick, HUD skin (module art3.js)
exec(open('P.py').read())
if 'ART step 3+4' in s:
    print('already');save();raise SystemExit
R('window.__mho={',open('art3.js').read()+'\nwindow.__mho={')
save()
