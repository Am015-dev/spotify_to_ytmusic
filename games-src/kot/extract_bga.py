# Pull real card names, costs and texts from the BGA King of Tokyo sources into one JSON reference.
# (Numbers and meaning only: every text in the game is rewritten in our own words.)
import re,json
def body(src,fn):
    i=src.index(fn);j=src.find('\n    }',i);return src[i:j]
def cases(b):
    out={}
    for line in b.split('\n'):
        m=re.match(r'\s*((?:case\s+\d+:\s*)+)return\s*(.*)$',line)
        if not m:continue
        ids=[int(x) for x in re.findall(r'\d+',m.group(1))]
        lits=re.findall(r'"((?:[^"\\]|\\.)*)"|\'((?:[^\'\\]|\\.)*)\'|`([^`]*)`',m.group(2))
        t=''.join(a or b or c for a,b,c in lits)
        t=re.sub(r'\[[0-9a-fA-F]{6}\]','',t);t=re.sub(r'<br>',' ',t);t=re.sub(r'<(/?)(strong|i|b|span)[^>]*>','',t)
        for k in ids:out[k]=t.strip()
    return out
c=open('src/cards.ts').read();php=open('modules/php/PowerCardManager.php').read()
cb=php[php.index('$CARD_COST'):];cb=cb[:cb.index('];')]
cost={int(a):int(b) for a,b in re.findall(r'(\d+)\s*=>\s*(\d+)',cb)}
nm=cases(body(c,'private getColoredCardName') if 'private getColoredCardName' in c else c[:c.index('public getCardName')])
ds=cases(body(c,'private getCardDescription'))
cards={k:{'name':nm.get(k),'cost':cost.get(k),'text':v} for k,v in ds.items()}
e=open('src/evolution-cards.ts').read()
en=cases(body(e,'private getColoredCardName'));ed=cases(body(e,'private getCardDescription'))
mat=open('modules/php/material.inc.php').read()
etype={}
for line in mat.split('\n'):
    for a,b in re.findall(r'(\d+)\s*=>\s*(\d)',line):
        if '//' in line and re.search(r'(Penguin|Alienoid|Kitty|King|Zaur|Meka|Hydra|MasterMindbug|Sharky|Kraken|Bunny)',line):etype[int(a)]=int(b)
evo={k:{'name':en.get(k),'text':v,'type':etype.get(k)} for k,v in ed.items()}
cu=open('src/curse-cards.ts').read()
curses={}
names=cases(body(cu,'public getCardName'))
for fn in re.findall(r'(?:public|private) (get\w+Effect)\(',cu):
    for k,v in cases(body(cu,fn)).items():curses.setdefault(k,{})[fn]=v
for k,v in names.items():curses.setdefault(k,{})['name']=v
w=open('src/wickedness-tiles.ts').read()
wn=cases(body(w,'public getCardName'))
wd={}
for fn in re.findall(r'(?:public|private) (get\w*Description\w*)\(',w):wd.update(cases(body(w,fn)))
lvl=body(w,'public getCardLevel')
wick={k:{'name':v,'text':wd.get(k,'')} for k,v in wn.items()}
json.dump({'cards':cards,'evolutions':evo,'curses':curses,'wickedness':wick,'wickLevel':lvl},open('../kot/bga-cards.json','w'),indent=1,ensure_ascii=False)
import collections;g=collections.Counter(k//10 for k in evo)
print('cards',len(cards),'evolutions',len(evo),dict(sorted(g.items())),'curses',len(curses),'wick',len(wick),'wick w/ text',sum(1 for v in wick.values() if v['text']))
