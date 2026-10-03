import json,re
S=json.load(open('sources.js'));SH={x['id']:x for x in json.load(open('ships.js'))}
P={x['id']:x for x in json.load(open('pilots.js'))};U={x['id']:x for x in json.load(open('upgrades.js'))}
src=[x for x in S if x['id']<=12]
orig={'X-wing':'Rebel Alliance','Y-wing':'Rebel Alliance','A-wing':'Rebel Alliance','YT-1300':'Rebel Alliance','B-wing':'Rebel Alliance','HWK-290':'Rebel Alliance',
'TIE Fighter':'Galactic Empire','TIE Advanced':'Galactic Empire','TIE Interceptor':'Galactic Empire','Firespray-31':'Galactic Empire','Lambda-class Shuttle':'Galactic Empire','TIE Bomber':'Galactic Empire'}
def clean(t):
    t=t or ''
    t=t.replace('<br /><br />',' ').replace('<br />',' ')
    t=re.sub(r'</?strong>','',t)
    return re.sub(r'\s+',' ',t).strip()
out=[]
W=lambda s:out.append(s)
# where things come from
pil_src={};up_src={}
for s in src:
    for k,v in s['contents']['pilots'].items(): pil_src.setdefault(int(k),[]).append(f"{s['name'].replace(' Expansion Pack','')} x{v}")
    for k,v in s['contents']['upgrades'].items(): up_src.setdefault(int(k),[]).append(f"{s['name'].replace(' Expansion Pack','')} x{v}")
W('### 7.0 Product contents (from xwing-data sources.js) [confirmed]\n')
W('| Product | SKU | Wave | Release | Ships (count) |\n|---|---|---|---|---|')
for s in src:
    ships=', '.join(f"{SH[int(k)]['name']} x{v}" for k,v in s['contents']['ships'].items())
    W(f"| {s['name']} | {s['sku']} | {s['wave'] if s['wave'] else 'Core'} | {s['release_date']} | {ships} |")
W('')
cols=['T','B','F','N','Y','K','O']
cname={'T':'Turn L','B':'Bank L','F':'Straight','N':'Bank R','Y':'Turn R','K':'K-turn','O':'Stop'}
shipids=[]
for s in src:
    for k in s['contents']['ships']:
        if int(k) not in shipids: shipids.append(int(k))
for i in shipids:
    sh=SH[i]
    W(f"### {sh['name']}  —  {orig[sh['name']]}, {sh['size']} base [confirmed]\n")
    W(f"- Attack {sh['attack']} / Agility {sh['agility']} / Hull {sh['hull']} / Shields {sh['shields']}")
    W(f"- Actions: {', '.join(sh['actions'])}")
    arcs=sh.get('firing_arcs',[])
    W(f"- Firing arcs: {', '.join(arcs)}" + ("  (primary weapon is a 360° turret)" if 'Turret' in arcs else '') + ("  (auxiliary rear arc: primary weapon may also fire in the rear arc)" if 'Auxiliary Rear' in arcs else ''))
    dial={}
    for d in sh['dial']:
        dial.setdefault(int(d[0]),{})[d[1]]=d[2]
    used=[c for c in cols if any(c in dial[sp] for sp in dial)]
    W('- Dial (G=green, W=white, R=red, . = not available):\n')
    W('| Speed | '+' | '.join(cname[c] for c in used)+' |')
    W('|---|'+'---|'*len(used))
    for sp in sorted(dial,reverse=True):
        W(f'| {sp} | '+' | '.join(dial[sp].get(c,'.') for c in used)+' |')
    W(f"- Raw dial codes: `{' '.join(sh['dial'])}`\n")
    W('| Pilot | Unique | PS | Cost | Upgrade bar | Ability | In product |\n|---|---|---|---|---|---|---|')
    pids=sorted({pid for s in src for pid in map(int,s['contents']['pilots']) if P[pid]['ship']==sh['name']},key=lambda p:-P[p]['skill'])
    for pid in pids:
        p=P[pid]
        ab=clean(p.get('text','')) or '—'
        ov=p.get('ship_override')
        if ov: ab+=f" (STAT OVERRIDE: attack {ov['attack']}, agility {ov['agility']}, hull {ov['hull']}, shields {ov['shields']})"
        W(f"| {p['name']} | {'•' if p.get('unique') else ''} | {p['skill']} | {p['points']} | {', '.join(p['slots']) or '—'} | {ab} | {'; '.join(pil_src[pid])} |")
    W('')
W('### 7.x Upgrades included in Core + Waves 1–3 [confirmed text = xwing-data (latest errata wording)]\n')
W('| Upgrade | Type | Unique | Cost | Atk | Range | Effect | Restriction | In product |\n|---|---|---|---|---|---|---|---|---|')
uids=sorted({u for s in src for u in map(int,s['contents']['upgrades'])},key=lambda u:(U[u]['slot'],U[u]['name']))
for u in uids:
    x=U[u]
    eff=clean(x['text'])
    if x.get('effect'): eff+=' || '+clean(x['effect'])
    restr=[]
    if x.get('faction'): restr.append(x['faction']+' only')
    if x.get('ship'): restr.append(', '.join(x['ship'])+' only')
    if x.get('size'): restr.append('/'.join(x['size'])+' ship only')
    W(f"| {x['name']} | {x['slot']} | {'•' if x.get('unique') else ''} | {x['points']} | {x.get('attack','')} | {x.get('range','')} | {eff} | {'; '.join(restr)} | {'; '.join(up_src[u])} |")
W('')
dd=json.load(open('damage-deck-core.js'))
W(f"### Damage deck: {sum(x['amount'] for x in dd)} cards [confirmed]\n")
W('| Card | Copies | Trait | Effect when faceup |\n|---|---|---|---|')
for x in dd: W(f"| {x['name']} | {x['amount']} | {x['type']} | {clean(x['text'])} |")
open('gen_tables.md','w').write('\n'.join(out))
