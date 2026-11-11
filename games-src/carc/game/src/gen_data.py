#!/usr/bin/env python3
"""Turn ../../tiles.json (research file, real names) into data.js for the page (original names only).
Sides: 0=N 1=E 2=S 3=W. Halves: 0=NL 1=NR 2=EL 3=ER 4=SL 5=SR 6=WL 7=WR (clockwise from the NW corner)."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, '..', '..', 'tiles.json')))
S = {'N': 0, 'E': 1, 'S': 2, 'W': 3}
H = {k: i for i, k in enumerate(['NL', 'NR', 'EL', 'ER', 'SL', 'SR', 'WL', 'WR'])}
SETMAP = {'base': 'base', 'river': 'river', 'inns_cathedrals': 'ic', 'traders_builders': 'tb'}
# original names (the tile's look, in plain words)
NAMES = {
 'BA_L': 'Priory in the fields', 'BA_LR': 'Priory at the lane end', 'BA_RCr_start': 'Starting tile: town edge over a road',
 'BA_RCr': 'Town edge over a straight road', 'BA_Ccccp': 'Walled heart (banner)', 'BA_CccRp': 'Town gate (banner)', 'BA_CccR': 'Town gate',
 'BA_CFcp': 'Town bridge (banner)', 'BA_CFc_1': 'Town bridge', 'BA_Cc_1': 'Corner town', 'BA_CcG': 'Corner town with herb garden',
 'BA_Ccp': 'Corner town (banner)', 'BA_CcpG': 'Corner town (banner, herb garden)', 'BA_CcRr': 'Corner town with a bending road',
 'BA_CcRrp': 'Corner town with a bending road (banner)', 'BA_Ccc': 'Three-sided town', 'BA_CccG': 'Three-sided town with herb garden',
 'BA_Cccp': 'Three-sided town (banner)', 'BA_CRr': 'Town edge, road bending east to south', 'BA_CRRR': 'Town edge over a three-way junction',
 'BA_RrC': 'Town edge, road bending south to west', 'BA_C': 'Town edge', 'BA_CG': 'Town edge with herb garden',
 'BA_CFC_2': 'Two town edges facing', 'BA_CFCG': 'Two town edges facing, herb garden', 'BA_CC_2': 'Two town edges at a corner',
 'BA_CCG': 'Two town edges at a corner, herb garden', 'BA_RRRR': 'Four-way crossroads', 'BA_RRR': 'Three-way junction',
 'BA_Rr': 'Bend in the road', 'BA_RrG': 'Bend in the road, herb garden', 'BA_RFr': 'Straight road', 'BA_RFrG': 'Straight road, herb garden',
 'IC_Cccc_c': 'Basilica town', 'IC_LRFR': 'Priory between two lanes', 'IC_CCCCG': 'Four town edges round a green',
 'IC_CCC': 'Three town edges', 'IC_CRCR': 'Two town edges and a gate tower', 'IC_CCcp': 'Corner town beside a town edge (banner)',
 'IC_Cx': 'Town edge with a hedged field', 'IC_CFR': 'Lane up to a town gate', 'IC_CcR': 'Corner town with a lane to its gate',
 'IC_CRcRp': 'Town band between two lanes (banner)', 'IC_RCc_i': 'Corner town, tavern lane', 'IC_RrC_i': 'Town edge, tavern on the bend',
 'IC_CcRrp_i': 'Corner town, tavern on the bend (banner)', 'IC_RRR_i': 'Tavern at a junction', 'IC_RFr_iG': 'Tavern on a straight road',
 'IC_Rr_i': 'Tavern on a bend', 'IC_RrRr': 'Two bends that never meet',
 'TB_Cc_g': 'Corner town with grain', 'TB_Cc_w': 'Corner town with wine', 'TB_CCc_c': 'Town bridge and edge (cloth)',
 'TB_CCc_w': 'Town bridge and edge (wine)', 'TB_Ccc_g': 'Three-sided town (grain)', 'TB_CcCC_c': 'Corner town and two edges (cloth)',
 'TB_CcRRx_c': 'Corner town, two lanes and a hedge (cloth)', 'TB_CcRR_wG': 'Corner town with two lanes (wine)',
 'TB_CcRC_c': 'Corner town, lane and town edge (cloth)', 'TB_CcRC_g': 'Corner town, lane and town edge (grain)',
 'TB_CcR_cG': 'Corner town with a lane (cloth)', 'TB_CcRx_w': 'Corner town, lane and hedge (wine)', 'TB_CccR_w': 'Town gate (wine)',
 'TB_CcCc_w': 'Two corner towns (wine)', 'TB_CFc_w': 'Town bridge (wine)', 'TB_CR': 'Town edge with a lane to its gate',
 'TB_CRc_g': 'Town bridge with a lane (grain)', 'TB_CRc_w': 'Town bridge with a lane (wine)', 'TB_CRcR_w': 'Town band between two lanes (wine)',
 'TB_LRRR': 'Priory at a three-way junction', 'TB_RCc_g': 'Corner town, lane to the gate (grain)', 'TB_RCcx_g': 'Corner town, lane and hedge (grain)',
 'TB_RRC': 'Town edge, two lanes meet at its gate', 'TB_RRrr': 'Crossing with a bridge (roads do not meet)',
 'RI_s': 'River spring', 'RI_1_I_e': 'River mouth pond', 'RI_1_CICI': 'River between two town edges', 'RI_1_CIRI': 'River, town edge and a bridge lane',
 'RI_1_LIRI': 'River with a priory and a bridge lane', 'RI_1_RIrI': 'River under a road bridge', 'RI_1_IFI': 'Straight river',
 'RI_1_CcII': 'River bending round a corner town', 'RI_1_RrII': 'River bend and a road bend', 'RI_1_II': 'River bend', 'RI_1_IIG': 'River bend with herb garden',
}
out = []
for t in D['tiles']:
    o = {'id': t['id'], 'set': SETMAP[t['set']], 'n': NAMES[t['id']], 'c': t['count'],
         'e': [t['edges'][k][0].upper() if t['edges'][k] != 'river' else 'V' for k in 'NESW']}
    o['C'] = []
    for c in t['cities']:
        d = {'e': [S[x] for x in c['edges']]}
        if c['pennants']: d['p'] = c['pennants']
        if c.get('goods'): d['g'] = c['goods']
        if c.get('cathedral'): d['cat'] = 1
        o['C'].append(d)
    o['R'] = []
    for r in t['roads']:
        d = {'e': [S[x] for x in r['edges']]}
        if r.get('inn'): d['inn'] = 1
        o['R'].append(d)
    o['V'] = [[S[x] for x in r['edges']] for r in t['rivers']]
    o['F'] = []
    for f in t['fields']:
        d = {'h': [H[x] for x in f['halfEdges']], 'ac': f['adjacentCities']}
        if f.get('inner'): d['in'] = 1
        o['F'].append(d)
    if t.get('monastery'): o['mon'] = 1
    if t.get('garden'): o['gar'] = 1
    if t.get('start'): o['start'] = 1
    if t['id'] == 'RI_s': o['spring'] = 1
    if t['id'] == 'RI_1_I_e': o['lake'] = 1
    out.append(o)
tot = {}
for o in out: tot[o['set']] = tot.get(o['set'], 0) + o['c']
assert tot == {'base': 72, 'river': 12, 'ic': 18, 'tb': 24}, tot
js = '// generated by gen_data.py from the research tile file. Sides 0..3 = N,E,S,W; halves 0..7 = NL,NR,EL,ER,SL,SR,WL,WR.\n'
js += 'const TT=' + json.dumps(out, separators=(',', ':')) + ';\n'
open(os.path.join(HERE, 'data.js'), 'w').write(js)
print(len(out), tot)
