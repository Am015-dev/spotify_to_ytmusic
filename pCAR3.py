# CAR3: garage paint fix. The builder opens with the car you drive (default HOT ROD bricks), so the paint tool has parts to hit,
# and SAVE & DRIVE never falls back to the jet. "🎨 BODY" recolours the main body colour in one tap. Needs pCAR1.
exec(open('P.py').read())
if 'CR_paintBody' in s:
    print('OK');raise SystemExit
assert 'CR_SPEED' in s, 'apply pCAR1 first'
R("GB.d.on=true;\n  $('#gbx').hidden=false;","GB.d.on=true;if(!(GB.d.bricks&&GB.d.bricks.length)){GB.d.bricks=CR_DEF().map(b=>({...b}));GB.d.bp=1}\n  $('#gbx').hidden=false;")
R('<button data-a="paint" title="Recolour">🖌</button>','<button data-a="paint" title="Recolour one part">🖌</button><button data-a="pbody" title="Paint the whole body">🎨 BODY</button>')
R("else if(a==='done')GB_exit();GB_ui()};","else if(a==='pbody')CR_paintBody();else if(a==='done')GB_exit();GB_ui()};")
i=s.index('const GB_PRE=[')
s=s[:i]+r'''function CR_paintBody(){const L=GB_list();if(!L.length)return 0;const hx=c=>String(GB_BC[c]||c).toLowerCase(),skip=new Set(['#1b2a34','#d8dde4','#2a2f36','#c9ced6']),n={};
 for(const b of L){const h=hx(b.c);if(!skip.has(h))n[h]=(n[h]||0)+1}const top=Object.keys(n).sort((a,b)=>n[b]-n[a])[0];if(!top)return 0;GB_snap();let k=0;for(const b of L)if(hx(b.c)===top){b.c=GB_.col;k++}
 GB_refresh();try{AU.sfx('pick')}catch(e){}GB_msg&&GB_msg('Body painted · '+k+' parts');return k}
'''+s[i:]
save()
print('OK')
