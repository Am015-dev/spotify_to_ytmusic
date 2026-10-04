# DR probe: measurement API (window.__dr), no behaviour change
exec(open('P.py').read())
R('window.__mho={', open('drp.js').read()+'\nwindow.__mho={')
save()
