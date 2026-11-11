# M3: Frankfurt chapters 3+4 and the Kaiser finale (m3.js), inserted right after m1.js, before the test/debug API object
exec(open('P.py').read())
R('window.__mho={',open('m3.js').read()+'\nwindow.__mho={')
save()
