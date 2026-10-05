# pQA4 · story missions winnable by a normal driver (2K-Drive feel: first or second try)
# tPlay (human-like driver, phone touch): Frankfurt Hot Drop 6/6 "A GETAWAY CAR ESCAPED", Athens Koulouri Rush 7/7 "THE VAN ESCAPED".
# Getaway goons ran 34–40 m/s and the van 40–45 m/s whenever you were close — faster than a player on a street with corners.
# Now both rubber-band to the player's speed (never slower than 12–14 m/s), slow down in the last 300 m, the van's ram window is wider,
# and every timed mission stage gets 30 % more time.
exec(open('P.py').read())
R("v=(d>220?0:d>120?16:d<40?40:34)*(g.bst>0?1.25:1)*(g.stall>0?.3:1)*(L-g.s<200?.75:1)",
  "v=(d>220?0:d>120?Math.min(16,Math.max(8,Math.abs(RO.v)*.5)):Math.min(d<40?40:34,Math.max(12,Math.abs(RO.v)*(d<40?.8:.7))))*(g.bst>0?1.15:1)*(g.stall>0?.3:1)*(L-g.s<300?.55:1)")
R("let v=dP<40?45:dP>320?30:40;if(S.stall>0){S.stall-=dt;v=12}else if(S.bst>0){S.bst-=dt;v=62}",
  "let v=dP<40?Math.min(45,Math.max(14,Math.abs(RO.v)*.82)):dP>320?18:Math.min(40,Math.max(14,Math.abs(RO.v)*.78));if(L-S.s<300)v*=.6;if(S.stall>0){S.stall-=dt;v=10}else if(S.bst>0){S.bst-=dt;v=Math.min(48,v+16)}")
R("if(dP<7.5&&S.cd<=0&&Math.abs(RO.v)>18)","if(dP<9.5&&S.cd<=0&&Math.abs(RO.v)>12)")
R('window.__mho={','''// QA4: 30 % more time on every timed story / quest stage
qvEnter=(f=>function(ch,i){const r=f.apply(this,arguments);try{const V=ch&&ch.v2,S=V&&V.L.st[V.si];if(S&&S.T&&V.left>0&&!S.qaT){S.qaT=1;V.left*=1.3}}catch(e){}return r})(qvEnter);
window.__mho={''')
save()
