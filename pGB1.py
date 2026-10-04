# GB1: embed gb.js (LEGO brick builder + driver minifig) before the test/debug API object. One anchor.
exec(open('P.py').read())
R('window.__mho={', open('gb.js').read()+'\nwindow.__mho={')
save()
