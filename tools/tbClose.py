#!/usr/bin/env python3
# tbClose.py (track-2): close a turtle loop for tools/tbDemo.mjs. Varies free straights (≥ 60 m), arc radii (0.75–1.35×) and arc angles (±20°,
# the last arc takes the heading remainder so the loop turns exactly ±360°), keeping close to the design and to a target length.
# Straights with a 5th element "fix" keep their length. usage: tbClose.py spec.json [targetLen]
import json,sys,math,random
p=sys.argv[1];s=json.load(open(p));T=s['turtle'];tgt=float(sys.argv[2]) if len(sys.argv)>2 else None
arcs=[i for i,c in enumerate(T) if c[0]!='S'];last=arcs[-1]
tot=sum((1 if T[i][0]=='R' else -1)*T[i][2] for i in arcs);H=round(tot/360)*360
O=[list(c) for c in T]
P=[]# (index, field, lo, hi)
for i,c in enumerate(T):
  if c[0]=='S' and not(len(c)>4 and c[4]=='fix'):P.append((i,1,60,min(420,max(120,c[1]*2.2))))
  if c[0]!='S':P.append((i,1,max(60,c[1]*.88),c[1]*1.35))
  if c[0]!='S' and i!=last:P.append((i,2,max(15,c[2]-20),c[2]+20))
def fixlast(T):
  sm=sum((1 if T[i][0]=='R' else -1)*T[i][2] for i in arcs if i!=last);sg=1 if T[last][0]=='R' else -1;T[last][2]=(H-sm)*sg
def run(T):
  x=z=a=0;L=0
  for c in T:
    if c[0]=='S':x+=math.cos(a)*c[1];z+=math.sin(a)*c[1];L+=c[1]
    else:
      R,ang=c[1],math.radians(c[2]);sg=1 if c[0]=='R' else -1;cx=x-math.sin(a)*R*sg;cz=z+math.cos(a)*R*sg;a+=sg*ang;x=cx+math.sin(a)*R*sg;z=cz-math.cos(a)*R*sg;L+=R*abs(ang)
  return x,z,L
def cost(T):
  fixlast(T);x,z,L=run(T);c=x*x+z*z
  if tgt:c+=.3*(L-tgt)**2
  for i,f,lo,hi in P:c+=.02*((T[i][f]-O[i][f])/(1 if f==2 else max(30,O[i][f])*.01))**2*.01
  la=T[last][2]
  if la<15:c+=1e4*(15-la)**2
  return c
best=cost(T);step=1.0
for it in range(6000):
  i,f,lo,hi=random.choice(P);old=T[i][f];T[i][f]=min(hi,max(lo,old+random.gauss(0,(hi-lo)*.08*step)))
  c=cost(T)
  if c<best:best=c
  else:T[i][f]=old
  if it%1000==999:step*=.6
fixlast(T)
for c in T:
  c[1]=round(c[1])
  if c[0]!='S':c[2]=round(c[2],1)
fixlast(T);x,z,L=run(T);print('closed gap',round(x),round(z),'len',round(L),'last arc',round(T[last][2],1))
json.dump(s,open(p,'w'))
