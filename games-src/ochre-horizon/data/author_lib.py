# helpers for author.py: op builders, text describer, curve value (mirrors validate.js)
import math
PV={'mc':5,'steel':8,'ti':12,'plant':8,'energy':7.5,'heat':4}
GV={'mc':1,'steel':2,'ti':3,'plant':1.5,'energy':1.2,'heat':0.8,'microbe':1.5,'animal':3,'science':2,'fighter':4}
RN={'mc':'credits','steel':'steel','ti':'titanium','plant':'plants','energy':'energy','heat':'heat'}
TN={'building':'building','space':'space','science':'science','power':'power','earth':'earth','jovian':'jovian','plant':'plant','microbe':'microbe','animal':'animal','city':'city','event':'event'}
def P(r,n): return {"op":"prod","r":r,"n":n}
def G(r,n): return {"op":"gain","r":r,"n":n}
def L(r,n): return {"op":"lose","r":r,"n":n}
def RP(r,n): return {"op":"rprod","r":r,"n":n}
def RR(r,n): return {"op":"rres","r":r,"n":n}
def TEMP(n=1): return {"op":"temp","n":n}
def OXY(n=1): return {"op":"oxy","n":n}
def OC(n=1): return {"op":"ocean","n":n}
def TR(n=1): return {"op":"tr","n":n}
def CITY(where=None):
    o={"op":"tile","t":"city"}
    if where: o["where"]=where
    return o
def GREEN(where=None):
    o={"op":"tile","t":"greenery"}
    if where: o["where"]=where
    return o
def SPEC(where=None):
    o={"op":"tile","t":"special"}
    if where: o["where"]=where
    return o
def DRAW(n,tag=None):
    o={"op":"draw","n":n}
    if tag: o["tag"]=tag
    return o
def ADD(n,to="self",kind=None):
    o={"op":"addres","n":n,"to":to}
    if kind: o["kind"]=kind
    return o
def GP(r,n,per,div=None):
    o={"op":"gainper","r":r,"n":n,"per":per}
    if div: o["div"]=div
    return o
def PP(r,n,per,div=None):
    o={"op":"prodper","r":r,"n":n,"per":per}
    if div: o["div"]=div
    return o
def CH(*opts): return {"op":"choose","opts":[list(o) for o in opts]}
def USE(n=1): return {"op":"useres","n":n}
def R(tmin=None,tmax=None,omin=None,omax=None,cmin=None,cmax=None,tags=None,prod=None,cities=None,greeneries=None):
    q={}
    if tmin is not None: q["temp"]={"min":tmin}
    if tmax is not None: q["temp"]={"max":tmax}
    if omin is not None: q["oxy"]={"min":omin}
    if omax is not None: q["oxy"]={"max":omax}
    if cmin is not None: q["ocean"]={"min":cmin}
    if cmax is not None: q["ocean"]={"max":cmax}
    if tags: q["tags"]=tags
    if prod: q["prod"]=prod
    if cities: q["cities"]={"min":cities}
    if greeneries: q["greeneries"]={"min":greeneries}
    return q
# effects
def DISC(n,tag=None):
    e={"e":"disc","n":n}
    if tag: e["tag"]=tag
    return e
def ONTAG(tag,do,any=False):
    e={"e":"onTag","tag":tag,"do":do}
    if any: e["any"]=True
    return e
def ONTILE(t,do,any=False):
    e={"e":"onTile","t":t,"do":do}
    if any: e["any"]=True
    return e
def EFF(e,**k):
    d={"e":e}; d.update(k); return d
def ACT(cost,do): return {"cost":list(cost),"do":list(do)}

def opval(o,card):
    k=o['op']; n=o.get('n',0)
    if k=='choose': return max(sum_ops(l,card) for l in o['opts'])
    if k=='prod': return n*PV[o['r']]
    if k=='gain': return n*GV[o['r']]
    if k=='lose': return -n*GV[o['r']]
    if k=='rprod': return n*PV[o['r']]*.5
    if k=='rres': return n*GV[o['r']]*.4
    if k in('temp','oxy'): return n*8
    if k=='ocean': return n*10
    if k=='tr': return n*7
    if k=='tile': return {'city':12,'greenery':15}.get(o['t'],6)
    if k=='draw': return n*3.5
    if k=='addres': return n*GV.get(o.get('kind') or card.get('res'),1)
    if k=='gainper': return n*3*GV[o['r']]/(o.get('div') or 1)
    if k=='prodper': return n*2.5*PV[o['r']]/(o.get('div') or 1)
    return 0
def sum_ops(ops,card): return sum(opval(o,card) for o in ops)
def curve_value(c):
    v=sum_ops(c.get('play',[]),c)
    for e in c.get('effect',[]):
        v+= 3*sum_ops(e['do'],c) if 'do' in e else 12
    for a in c.get('action',[]):
        cst=sum(o['n']*GV[o['r']] if o['op']=='lose' else (o['n']*GV.get(c.get('res'),1) if o['op']=='useres' else 0) for o in a['cost'])
        v+=max(0,sum_ops(a['do'],c)-cst)*5
    vp=c.get('vp')
    if isinstance(vp,(int,float)): v+=vp*5
    elif vp: v+=6
    req=c.get('req') or {}
    pen=0
    for k,q in req.items():
        pen+=3 if k in('temp','oxy','ocean') else 2
    return v+pen+len(c.get('tags',[]))*1.5
# text
def rn(r,n): return {'mc':'credit','plant':'plant'}[r] if (n==1 and r in('mc','plant')) else RN[r]
def w(n,s,p): return s if n==1 else p
def d_op(o,card=None):
    k=o['op']; n=o.get('n',0); r=o.get('r')
    if k=='prod': return ("Raise %s production %d."%(RN[r],n)) if n>0 else ("Lower %s production %d."%(RN[r],-n)) if False else ("Lose %d %s production."%(-n,RN[r]))
    if k=='gain': return "Gain %d %s."%(n,rn(r,n))
    if k=='lose': return "Pay %d %s."%(n,RN[r])
    if k=='rprod': return "Rival loses %d %s production."%(n,rn(r,n))
    if k=='rres': return "Rival loses up to %d %s."%(n,RN[r])
    if k=='temp': return "Raise temperature %d step%s."%(n,w(n,'','s'))
    if k=='oxy': return "Raise oxygen %d."%n
    if k=='ocean': return "Place %s ocean%s."%({1:'an',2:'2',3:'3'}.get(n,str(n)) if n==1 else n,w(n,'','s')) if n>1 else "Place an ocean."
    if k=='tr': return "Gain %d terraform rating."%n
    if k=='tile':
        wh=o.get('where'); t=o['t']
        base={'city':'a city','greenery':'a greenery','special':'a special tile'}[t]
        ex={'any':' anywhere','volcanic':' on a volcanic space','isolated':' on an isolated space','nextToOwn':' next to your tiles','ocean':' on an ocean space'}.get(wh,'')
        if wh and wh.startswith('offmap'): ex=' off-map'
        if wh and wh.startswith('reserved'): ex=' on the reserved space'
        return "Place %s%s."%(base,ex)
    if k=='draw':
        return "Draw %d %scard%s."%(n,(o['tag']+' ') if o.get('tag') else '',w(n,'','s'))
    if k=='addres':
        kind=o.get('kind') or (card or {}).get('res') or 'resource'
        if o['to']=='self': return "Add %d %s%s to this card."%(n,kind,w(n,'','s'))
        return "Add %d %s%s to any of your cards."%(n,kind,w(n,'','s'))
    if k in('gainper','prodper'):
        per=o['per']; dv=o.get('div')
        pm={'cities':'city you own','citiesAll':'city in play','oceans':'ocean','greeneries':'greenery you own','greeneriesAll':'greenery in play'}
        if per.startswith('tag:'): pt=per[4:]+' tag you have'
        elif per.startswith('tagAll:'): pt=per[7:]+' tag in play'
        else: pt=pm[per]
        who="Gain %d %s"%(n,RN[r]) if k=='gainper' else "Raise %s production %d"%(RN[r],n)
        if dv: return "%s per %d %ss."%(who,dv,pt) if False else "%s for every %d %s."%(who,dv,pt) if False else "%s per %d of: %s."%(who,dv,pt) if False else "%s per %s (every %d)."%(who,pt,dv)
        return "%s per %s."%(who,pt)
    if k=='choose': return "Choose: "+" Or: ".join(" ".join(d_op(x,card) for x in l).rstrip('.') for l in o['opts'])+"."
    if k=='useres': return "Spend %d resource%s from here."%(n,w(n,'','s'))
    return ''
def d_ops(ops,card=None): return " ".join(d_op(o,card) for o in ops)
def d_eff(e,card):
    k=e['e']
    if k=='disc': return "Your %scards cost %d less."%((e['tag']+' ') if e.get('tag') else '',e['n'])
    if k=='onTag':
        who='any player plays' if e.get('any') else 'you play'
        return "Each time %s a %s tag: %s"%(who,e['tag'],d_ops(e['do'],card).lower() if False else d_ops(e['do'],card))
    if k=='onTile': return "Each time %s places a %s: %s"%('anyone' if e.get('any') else 'you',e['t'],d_ops(e['do'],card))
    if k=='steelVal': return "Steel is worth %d more to you."%e['n']
    if k=='tiVal': return "Titanium is worth %d more to you."%e['n']
    if k=='reqSlack': return "Global requirements are %d easier for you."%e['n']
    if k=='stdDisc': return "Standard projects%s cost %d less."%(('(%s) '%e['which']) if e.get('which') and e['which']!='all' else '',e['n'])
    if k=='greenCost': return "Greeneries cost %d plants."%e['n']
    if k=='heatAsMc': return "Heat counts as credits for you."
    if k=='onPay': return "Each time you play a card costing %d+: %s"%(e['min'],d_ops(e['do'],card))
    return ''
def d_act(a,card):
    cs=" and ".join((("pay %d %s"%(o['n'],RN[o['r']])) if o['op']=='lose' else ("spend %d resource%s here"%(o['n'],w(o['n'],'','s')))) for o in a['cost'])
    s=("Action: "+cs+": " if cs else "Action: ")+d_ops(a['do'],card)
    return s
def text_for(c):
    parts=[]
    if c.get('play'): parts.append(d_ops(c['play'],c))
    for e in c.get('effect',[]): parts.append(d_eff(e,c))
    acts=c.get('action',[])
    if len(acts)==1: parts.append(d_act(acts[0],c))
    elif len(acts)>1: parts.append("Action, pick one: "+" OR ".join(d_act(a,c)[8:].rstrip('.') for a in acts)+".")
    return " ".join(parts)
