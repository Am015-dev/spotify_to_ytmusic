# OG: open-world density module (og.js) inserted before the test/debug API object — the only anchor.
exec(open('P.py').read())
R('window.__mho={', open('og.js').read()+'\nwindow.__mho={')
save()
