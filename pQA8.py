# pQA8 · no giants (every minifig tagged + clamped to 1.85 m if > 2.2 m) and fewer rings in free roam (module qa8.js). See qa8.js header.
exec(open('P.py').read())
R('window.__mho={',open('qa8.js').read()+'\nwindow.__mho={')
save()
