# pQA3 · touch BRAKE: a quick double tap parks the car (60 m/s² stop) even at full speed. Two quick brake taps before a corner are
# a normal human move; on the phone they stopped the car dead mid-street. Park only when the car is already slow (< 15 km/h).
exec(open('P.py').read())
R("if(state==='roam'&&n-(TOUCH.bT||-1e9)<320){parkSet(true);TOUCH.bT=-1e9;return}",
  "if(state==='roam'&&n-(TOUCH.bT||-1e9)<320&&Math.abs(RO.v)<4.2){parkSet(true);TOUCH.bT=-1e9;return}")
save()
