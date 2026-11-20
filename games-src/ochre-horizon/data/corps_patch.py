# Post-edit: corporations redesigned so none reproduces an original corporation's power. Run after author.py.
import json,os
P=os.path.join(os.path.dirname(os.path.abspath(__file__)),'corps.json')
k=json.load(open(P,encoding='utf-8'));K={c['id']:c for c in k}
def S(i,**kw):
    for x in ('effect','action','start'):K[i].pop(x,None)
    K[i].update(kw)
S('c02',mc=40,start=[{"op":"gain","r":"steel","n":4}],effect=[{"e":"steelVal","n":1}],text="Start with 4 steel. Your steel is worth 1 more.")
S('c03',mc=44,start=[{"op":"prod","r":"plant","n":1}],effect=[{"e":"onTile","t":"greenery","do":[{"op":"gain","r":"mc","n":3}]}],text="Start with 1 plant production. Gain 3 credits each time you place a greenery.")
S('c05',mc=46,start=[{"op":"prod","r":"mc","n":1}],effect=[{"e":"onTag","tag":"event","do":[{"op":"gain","r":"mc","n":2}]}],text="Start with 1 credit production. Gain 2 credits each time you play an event.")
S('c06',mc=42,start=[{"op":"prod","r":"heat","n":2}],action=[{"cost":[{"op":"lose","r":"heat","n":5}],"do":[{"op":"gain","r":"ti","n":1},{"op":"gain","r":"mc","n":1}]}],text="Start with 2 heat production. Action: pay 5 heat for 1 titanium and 1 credit.")
S('c07',mc=40,start=[{"op":"draw","n":4}],effect=[{"e":"disc","n":1,"tag":"science"}],text="Draw 4 extra cards. Your science cards cost 1 less.")
S('c08',mc=42,start=[{"op":"prod","r":"ti","n":1}],effect=[{"e":"onTag","tag":"space","do":[{"op":"gain","r":"mc","n":2}]}],text="Start with 1 titanium production. Gain 2 credits each time you play a space tag.")
S('c10',mc=44,start=[{"op":"gain","r":"steel","n":2}],effect=[{"e":"onTile","t":"city","do":[{"op":"gain","r":"steel","n":3}]}],text="Start with 2 steel. Gain 3 steel each time you place a city.")
S('c11',mc=40,start=[{"op":"prod","r":"energy","n":2}],effect=[{"e":"stdDisc","n":5,"which":"city"}],text="Start with 2 energy production. Your City project costs 5 less.")
json.dump(k,open(P,'w',encoding='utf-8'),indent=1,ensure_ascii=False)
print('corps patched')
