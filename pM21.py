# M2: Frankfurt Chapter 2 "Die Hafenbande" — embeds m2.js (registers into the M1 story system) right before the debug API object.
exec(open('P.py').read())
R('window.__mho={', open('m2.js').read()+'\nwindow.__mho={')
save()
