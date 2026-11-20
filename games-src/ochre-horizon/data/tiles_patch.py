# Post-edit: give the pool the original's tile structure (2 off-map cities, 1 reserved city site, special tiles). Run after author.py.
import json,os
P=os.path.join(os.path.dirname(os.path.abspath(__file__)),'cards.json')
c=json.load(open(P,encoding='utf-8'));C={x['id']:x for x in c}
def tile(i,t,where=None,cost=0,text=None,vp='keep'):
    x=C[i];op={"op":"tile","t":t}
    if where:op["where"]=where
    x['play']=[o for o in x.get('play',[]) if o.get('op')!='tile'];x['play'].insert(0,op);x['cost']+=cost
    if vp!='keep':x['vp']=vp
    if text:x['text']=text
tile('p043','city','offmap:m1',text='Place a city on Lantern Moon Port, off the map. Raise titanium production 1.')
tile('p074','city','offmap:m2',text='Place a city on Far-Moon Habitat, off the map. Raise credits production 2.')
tile('p059','city','noctis',cost=2,text='Place a city on the Rift City Site. Raise credits production 2.')
tile('p050','special',cost=2,text='Place a special tile: the obelisk.')
tile('p052','special',text='Place a special tile. Raise credits production 1.')
tile('p056','special',vp={"per":"adjOcean"},text='Place a special tile. 1 VP per ocean next to it.')
tile('p058','special',cost=2,text='Place a special tile. Gain 3 steel.')
tile('p029','special','volcanic',cost=2,text='Place a special tile on a volcano. Raise heat production 3, energy production 1.')
tile('p143','special','isolated',cost=2,text=C['p143']['text'].rstrip('.')+'. Place a special tile with no neighbours.')
tile('p096','special',cost=2,text='Place a special tile. Raise energy production 2, steel production 1.')
tile('p057','special',cost=2,vp={"per":"cityAdj","t":"city"},text='Place a special tile. Raise credits production 2. 1 VP per city next to it.')
json.dump(c,open(P,'w',encoding='utf-8'),indent=1,ensure_ascii=False)
print('tiles patched')
