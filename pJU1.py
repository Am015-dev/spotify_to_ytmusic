# JU · moment-to-moment feel: insert ju.js as one module before window.__mho (single anchor)
exec(open('P.py').read())
R('window.__mho={', open('ju.js').read()+'\nwindow.__mho={')
save()
