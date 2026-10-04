# DR fixes: breakables off the driving line, smash speed floor, traffic halved + outer lane, solid blocks, compact touch mission card
exec(open('P.py').read())
R('window.__mho={', open('dr.js').read()+'\nwindow.__mho={')
save()
