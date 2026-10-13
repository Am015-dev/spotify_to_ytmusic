import json,sys
# facing check: steering wheel should be in front of the seat / model centre; front = -z
for f in sys.argv[1:]:
    B=json.load(open(f))['bricks']; z=lambda b:b['z']+b.get('oz',0)
    zs=[z(b) for b in B]; mz=(min(zs)+max(zs))/2
    st=[z(b) for b in B if b['t'].startswith('stw')]; se=[z(b) for b in B if b['t'].startswith('ld4079') or 'seat' in b['t']]
    v='?'
    if st and se: v='OK' if min(st)<max(se) else 'BACKWARDS'
    elif st: v='OK?' if st[0]<mz else 'BACKWARDS?'
    print(f.split('/')[-1], 'stw',st,'seat',se,'mid %.1f'%mz, v)
