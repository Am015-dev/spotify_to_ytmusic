# pQA7 · rotation-proof touch controls (module qa7.js before window.__mho={). See the header of qa7.js.
exec(open('P.py').read())
R('window.__mho={',open('qa7.js').read()+'\nwindow.__mho={')
save()
