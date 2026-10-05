# CAR9: traffic sills, underbody, bumpers and other near-black parts get the matte tyre material (no rainbow clearcoat sheen);
# windows keep their gloss. Needs pCAR6.
exec(open('P.py').read())
if 'CR_isDark' in s:
    print('OK');raise SystemExit
assert 'CR_cab' in s, 'apply pCAR6 first'
JS=r'''
const CR_WIN=new THREE.Color('#1d2630');
function CR_isDark(g){const c=g.attributes.color;if(!c)return false;const r=c.getX(0),gg=c.getY(0),b=c.getZ(0);if(Math.abs(r-CR_WIN.r)+Math.abs(gg-CR_WIN.g)+Math.abs(b-CR_WIN.b)<.004)return false;return .2126*r+.7152*gg+.0722*b<.035}
'''
i=s.index('const GB_PRE=[')
s=s[:i]+JS+'\n'+s[i:]
R("const body=mergeGeometries(M.concat(L)),wheels=mergeGeometries(Wg),glass=CR_G.length?mergeGeometries(CR_G):null;",
  "const MD=M.filter(CR_isDark),MB=M.filter(g=>!CR_isDark(g));const body=mergeGeometries(MB.concat(L)),wheels=mergeGeometries(Wg),glass=(CR_G.length||MD.length)?mergeGeometries(CR_G.concat(MD)):null;")
R("const gl=new THREE.InstancedMesh(G.glass,CR_GM,n);","const gl=new THREE.InstancedMesh(G.glass,CR_WM||(CR_WM=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,metalness:0,envMapIntensity:.5})),n);")
save()
print('OK')
