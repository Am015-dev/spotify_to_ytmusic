# Builds tidewake.html (the playable game, one self-contained file) and x.js (all our scripts, for node --check).
# The kit (../kit/kit.js) is never edited: KIT_PATCHES are string replaces applied to the COPY inlined here (each warns if its anchor is gone).
import re,os,sys
D=os.path.dirname(os.path.abspath(__file__))
SP=os.path.abspath(os.path.join(D,'..','..'))
def rd(p):return open(p,encoding='utf-8').read()
GLB_BLOCK=r'''
/* ---- GLB junk + leviathan (High / Medium 3D only; Low and the 2D board keep their drawings, the 2D leviathan gets the thumbnail). Preloaded once from models/*.glb, cloned per use. ---- */
var GLBK = { ok: false, p: null, junk: null, lev: null };
function glbLoadK() {
  if (GLBK.p || !global.GXGLB) return;
  GLBK.p = Promise.all([GXGLB.load('models/junk.glb'), GXGLB.load('models/leviathan.glb')]).then(function (r) {
    GLBK.junk = GXGLB.prep(r[0], { len: .76, ground: true, env: .8 }); GLBK.lev = GXGLB.prep(r[1], { h: .58, ground: true, env: .8 }); GLBK.ok = true; glbRefresh();
  }).catch(function () { GLBK.p = null; });
}
function glbRefresh() {
  if (!K.on || !GLBK.ok) return;
  Object.keys(S.ships).forEach(function (k) { var s = S.ships[k]; if (!s.g) return; var vis = s.g.visible; K.gShips.remove(s.g); if (s.wake) { K.gShips.remove(s.wake); s.wake.geometry.dispose(); } if (s.ring) K.gShips.remove(s.ring); s.g = null; buildShip3D(s); s.g.visible = vis; });
  Object.keys(S.levs).forEach(function (k) { var L = S.levs[k]; if (!L.group) return; var vis = L.group.visible, p = L.group.position.clone(); K.gMisc.remove(L.group); L.group = buildLevCreature(L); L.group.position.copy(p); L.group.scale.setScalar(1.55); L.group.visible = vis; K.gMisc.add(L.group); if (L.mesh) L.mesh.group = L.group; });
  K.dirty = true;
}
function glbDressShip(s, g, col) {
  g.children.forEach(function (c) { c.visible = false; });
  var m = GLBK.junk.clone(true); g.add(m);
  var h = GLBK.junk.userData.size.y, flag = new THREE.Mesh(new THREE.PlaneGeometry(.1, .05, 4, 1), new THREE.MeshStandardMaterial({ color: col.sail, side: THREE.DoubleSide, roughness: .8, emissive: col.sail, emissiveIntensity: .3 }));
  flag.position.set(-.06, h + .035, 0); g.add(flag); s.flag = flag; s.sails.length = 0;
  var pole = new THREE.Mesh(new THREE.CylinderGeometry(.004, .004, .07, 5), new THREE.MeshStandardMaterial({ color: '#5a3b22' })); pole.position.set(-.01, h, 0); g.add(pole);
  var ring = new THREE.Mesh(new THREE.TorusGeometry(.3, .011, 6, 36), new THREE.MeshStandardMaterial({ color: col.sail, emissive: col.sail, emissiveIntensity: .35, roughness: .5 })); ring.rotation.x = Math.PI / 2; ring.position.y = .02; g.add(ring);
}
function glbDressLev(L, g) {
  g.children.forEach(function (c) { c.visible = false; });
  var hold = new THREE.Group(); hold.add(GLBK.lev.clone(true)); g.add(hold); L.glb = hold; hold.position.y = -.02;
}
function updLevGLB(L, t) {
  var h = L.glb, r = Math.max(.02, L.rise); h.scale.set(.6 + .4 * r, r, .6 + .4 * r); h.scale.multiplyScalar(1 + .1 * L.roar); h.rotation.y = Math.sin(t * .5 + L.ph) * .2 + L.a0; h.position.y = -.34 * (1 - r) - .02;
}
'''
KIT_PATCHES=[
 # 1. route the render loop through PerfHUD (frame timing + idle saver)
 ("function raf(fn) { return (global.requestAnimationFrame ||","function raf(fn) { return ((global.PerfHUD && global.PerfHUD.raf) || global.requestAnimationFrame ||"),
 # 2. PerfHUD owns the automatic step-down (the kit's own watchdog would fight it)
 ("if (K.pref === 'auto' && fr.hist.length >= 60)","if (!global.PerfHUD && K.pref === 'auto' && fr.hist.length >= 60)"),
 # 3. pixel ratio through PerfHUD's cap
 ("r.setPixelRatio(Math.min(global.devicePixelRatio || 1, c.dpr));","r.setPixelRatio(global.PerfHUD ? PerfHUD.pixelRatio(Math.min(global.devicePixelRatio || 1, c.dpr)) : Math.min(global.devicePixelRatio || 1, c.dpr));"),
 # 4. Auto = Low on a software GPU (the game sets TW_SOFTGPU before init)
 ("function autoQ() { var small = false;","function autoQ() { if (global.TW_SOFTGPU) return 'low'; var small = false;"),
 # 5. apply-only quality (PerfHUD's auto / test changes must not be saved)
 ("TWKit.getQuality = function () {","TWKit._applyQ = function (q) { if (K.on && GFX[q]) applyQ(q); };\nTWKit.getQuality = function () {"),
 # 6. FRAMING: the whole board (frame, edge numbers, ships on the start marks and the raised creatures) must fit; the default region cropped the sides and the top row
 ("var x0 = -HALF - .12, x1 = HALF + .12, z0 = -HALF - .08, z1 = HALF + .1;","var x0 = -HALF - (global.TW_PADX || .55), x1 = HALF + (global.TW_PADX || .55), z0 = -HALF - (global.TW_PADT || 1.0), z1 = HALF + (global.TW_PADB || .5);"),

 # 7. GLB junk and leviathan (see the GLB block): loader + helpers
 ("var hullG = null;",GLB_BLOCK+"var hullG = null;"),
 ("g.traverse(function (o) { if (o.isMesh) { o.castShadow = q.shadows; } });\n  s.g = g;","if (GLBK.ok && K.q !== 'low') glbDressShip(s, g, col);\n  g.traverse(function (o) { if (o.isMesh) { o.castShadow = q.shadows; } });\n  s.g = g;"),
 ("g.traverse(function (o) { if (o.isMesh) o.castShadow = true; });\n  return g;\n}\nfunction levPoint","if (GLBK.ok && K.q !== 'low') glbDressLev(L, g); else L.glb = null;\n  g.traverse(function (o) { if (o.isMesh) o.castShadow = true; });\n  return g;\n}\nfunction levPoint"),
 ("if (!L.group || !L.group.visible) return; var tube = L.tube;","if (!L.group || !L.group.visible) return; if (L.glb) return updLevGLB(L, t); var tube = L.tube;"),
 ("function applyQ(q, first) {\n  K.q = q;","function applyQ(q, first) {\n  var lo0 = K.q === 'low'; K.q = q; if (q !== 'low') glbLoadK(); if (!first && GLBK.ok && lo0 !== (q === 'low')) glbRefresh();"),
 # 8. the 2D board: the leviathan tile shows the painted thumbnail
 ("L.node = el('g', { 'pointer-events': 'none', filter: 'url(#tw2sh)' }, R2.gTiles, s);","L.node = el('g', { 'pointer-events': 'none', filter: 'url(#tw2sh)' }, R2.gTiles, s);\n    var lvg = L.node.querySelector('.lv'); if (lvg) lvg.innerHTML = '<image href=\"models/leviathan.webp\" x=\"' + (cx - .47) + '\" y=\"' + (cy - .56) + '\" width=\".94\" height=\".94\"/>';"),
]
kit=rd(os.path.join(SP,'tidewake','kit','kit.js'))
miss=[a for a,_ in KIT_PATCHES if a not in kit]
if miss:print('WARNING kit patch anchors not found:',miss,file=sys.stderr)
for a,z in KIT_PATCHES:kit=kit.replace(a,z)
# ui.js is the join of ui1..ui5.js (kept in parts for editing)
open(os.path.join(D,'ui.js'),'w',encoding='utf-8').write(''.join(rd(os.path.join(D,'ui%d.js'%i)) for i in range(1,11)))
T=os.path.join(SP,'node_modules','three','build','three.min.js')
SRC={'shell.js':os.path.join(SP,'shell','shell.js'),'gx-viewport.js':os.path.join(SP,'shell','gx-viewport.js'),'gx-help.js':os.path.join(SP,'shell','gx-help.js'),'gx-glb.js':os.path.join(SP,'shell','gx-glb.js'),'gx-tutor.js':os.path.join(SP,'shell','gx-tutor.js'),'gx-campaign.js':os.path.join(SP,'shell','gx-campaign.js'),'campaign-data.js':'','perfhud.js':os.path.join(SP,'perf','perfhud.js'),
     'gameaudio.js':os.path.join(SP,'audio','gameaudio.js'),'audio-data.js':os.path.join(SP,'tidewake','audio','audio-data.js'),
     'data.js':os.path.join(D,'src','data.js'),'engine.js':os.path.join(D,'src','engine.js'),'ai.js':os.path.join(D,'src','ai.js'),'tutscript.js':os.path.join(D,'src','tutscript.js'),'netstrip.js':os.path.join(D,'src','netstrip.js'),
     'trystero.min.js':os.path.join(SP,'net','trystero.min.js'),'netroom.js':os.path.join(SP,'net','netroom.js'),'gx-music.js':os.path.join(SP,'shell','gx-music.js'),'media.js':os.path.join(D,'media.js')}
ORDER=['shell.js','gx-viewport.js','gx-help.js','gx-tutor.js','gx-music.js','gx-campaign.js','campaign-data.js','perfhud.js','trystero.min.js','netroom.js','three.min.js','gx-glb.js','kit.js','data.js','engine.js','ai.js','tutscript.js','netstrip.js','texts.js','gameaudio.js','audio-data.js','sound.js','net.js','ui.js','media.js']
h=rd(os.path.join(D,'head.html')).replace('/*SHELL_CSS*/',rd(os.path.join(SP,'shell','shell.css'))).replace('</head>','<style>\n'+rd(os.path.join(SP,'shell','gx-campaign.css'))+'\n'+rd(os.path.join(SP,'shell','gx-help.css'))+'\n'+rd(os.path.join(SP,'shell','gx-tutor.css'))+'\n</style>\n</head>',1)
body=rd(os.path.join(D,'body.html')).replace('<!--CREDITS-->',rd(os.path.join(SP,'tidewake','audio','credits.html')))
for f in ORDER:
    tag=f'<script src="{f}"></script>';assert tag in body,f
    if f=='three.min.js':
        t=rd(T);src='!'+t[t.index('),')+2:]
        src=src.replace('console.warn(\'Scripts "build/three.js" and "build/three.min.js" are deprecated','void(\'Scripts "build/three.js" and "build/three.min.js" are deprecated',1)
    elif f=='kit.js':src=kit
    elif f=='campaign-data.js':
        import json;src='window.CAMPAIGN = '+json.dumps(json.load(open(os.path.join(SP,'tidewake','campaign.json'),encoding='utf-8')),separators=(',',':'),ensure_ascii=False)+';'
    else:src=rd(SRC.get(f,os.path.join(D,f)))
    src=src.replace('</script','<\\/script')
    body=body.replace(tag,'<script>\n'+src+'\n</script>')
out=h+body
open(os.path.join(D,'tidewake.html'),'w',encoding='utf-8').write(out)
js='\n'.join(x for x in re.findall(r'<script>(.*?)</script>',out,re.S) if not x.startswith('\n!'))
open(os.path.join(D,'x.js'),'w',encoding='utf-8').write(js)
print('tidewake.html',len(out.encode('utf-8')),'bytes')
