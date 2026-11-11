# Fit logistic regression for the AI weights: P(win) = sigmoid(-(w . f)), ridge towards the hand-set prior. Usage: LAM=200 python3 fit.py out.js data1.jsonl ...
import sys, json, os, numpy as np
out = sys.argv[1]; files = sys.argv[2:]
FN = ['pairA_n','pairA_f','pairE_n','pairE_f','sched','planes','imminent','flaps','gear','brake','intern','axisBal','fuel','tab','overload','coffee','coffeeLate','reroll','bias']
W0={'pairA_n':1,'pairA_f':1,'pairE_n':1,'pairE_f':1,'sched':1,'planes':1,'imminent':0.5,'flaps':1,'gear':1,'brake':1,'intern':1,'axisBal':1,'fuel':1,'tab':1,'overload':0.9,'coffee':-0.1,'coffeeLate':-0.05,'reroll':-0.15,'bias':0}
X=[];Y=[]
for f in files:
    for line in open(f):
        line=line.strip()
        if not line: continue
        d=json.loads(line); X.append(d['f']); Y.append(d['y'])
X=np.array(X,dtype=float); Y=np.array(Y,dtype=float); n,k=X.shape
print('samples',n,'win rate',round(Y.mean(),4))
prior=np.array([-W0[x] for x in FN]); lam=float(os.environ.get('LAM','200'))/n
sd=X.std(axis=0); sd[sd<1e-6]=1.0; sd[-1]=1.0; mu=np.zeros(k)       # no centering (bias is a column of ones)
Z=X/sd; th=prior*sd; pri=prior*sd
m=np.zeros(k); v=np.zeros(k); lr=0.03
def loss(th):
    z=np.clip(Z@th,-30,30); p=1/(1+np.exp(-z)); return -np.mean(Y*np.log(p+1e-9)+(1-Y)*np.log(1-p+1e-9))+0.5*lam*np.sum((th-pri)[:-1]**2)
for it in range(1,4001):
    z=np.clip(Z@th,-30,30); p=1/(1+np.exp(-z)); g=Z.T@(p-Y)/n+lam*(th-pri)*np.r_[np.ones(k-1),0]
    m=0.9*m+0.1*g; v=0.999*v+0.001*g*g; th-=lr*(m/(1-0.9**it))/(np.sqrt(v/(1-0.999**it))+1e-8)
    if it%1000==0: print('it',it,'loss',round(loss(th),4))
w=th/sd
z=np.clip(X@w,-30,30); p=1/(1+np.exp(-z)); ll=-np.mean(Y*np.log(p+1e-9)+(1-Y)*np.log(1-p+1e-9)); base=-np.mean(Y*np.log(Y.mean())+(1-Y)*np.log(1-Y.mean()))
print('logloss',round(ll,4),'baseline',round(base,4))
res={FN[i]: round(float(-w[i]),4) for i in range(k)}
for kx,v_ in res.items(): print(kx.ljust(12),v_)
open(out,'w').write("(function (g) { var FA = g.FA = g.FA || {}; FA.AIW = { w: %s }; })(typeof globalThis !== 'undefined' ? globalThis : this);\n" % json.dumps(res))
