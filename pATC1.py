# ATC: Athens campaign "Drakos' Akropolis" — embeds atc.js (one anchor, after m1.js, before the test/debug API object)
exec(open('P.py').read())
R('window.__mho={athPts', open('atc.js').read()+'\nwindow.__mho={athPts')
save()
