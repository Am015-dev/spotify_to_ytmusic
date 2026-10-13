import json,sys,glob
K=['menu_ready','menu_heapMB','roam_enter_s','roam_heapMB','roam_after_drive_heapMB','garage_open_s','garage_heapMB','race_enter_s','race_heapMB','ctx_menu','ctx_garage']
for c in ['fra','ath']:
    fs=sorted(glob.glob(f'probe_{c}_min_*.json'));D={f.split('_min_')[1][:-5]:json.load(open(f)) for f in fs}
    print('==',c,'|'.join(D))
    for k in K: print(f'{k:24}',' | '.join(str(D[v].get(k)) for v in D))
    for g in ['menu_gl','roam_idle_gl','garage_gl','race_gl']:
        print(f'{g:24}',' | '.join(str({x:D[v].get(g,{}).get(x) for x in ('calls','progs')} if D[v].get(g) else None) for v in D))
    print('drive progs/calls', ' | '.join(str([s.get('calls') for s in D[v].get('drive',[])]) for v in D), ' errs',[D[v].get('errs') for v in D])
