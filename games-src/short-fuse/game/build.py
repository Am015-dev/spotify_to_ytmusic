# Builds shortfuse.html (the playable game, one self-contained file) and x.js (all our scripts, for node --check).
# Also keeps building debug.html from src/ (the stage-1 debug page).
# Kit: kit.js is copied from ../kit (never edited there); a few small patches are applied to the COPY here (see KIT_PATCHES and UI-REPORT.md).
import re,os,sys
D=os.path.dirname(os.path.abspath(__file__))
SP=os.path.abspath(os.path.join(D,'..','..'))
def rd(p):return open(p,encoding='utf-8').read()

# ---------- debug page (unchanged from stage 1) ----------
b=rd(os.path.join(D,'src','debug.html'))
for f in ['data.js','engine.js','ai.js','debug-ui.js']:
    tag=f'<script src="{f}"></script>';assert tag in b,f
    b=b.replace(tag,'<script>\n'+rd(os.path.join(D,'src',f))+'\n</script>')
open(os.path.join(D,'debug.html'),'w',encoding='utf-8').write(b)

# ---------- kit patches (applied to our copy only) ----------
KIT_PATCHES=[
 # 1-2. route the render loop through PerfHUD (frame timing + idle saver)
 ("K.loopOn = true; requestAnimationFrame(loop);","K.loopOn = true; (global.PerfHUD ? PerfHUD.raf : requestAnimationFrame)(loop);"),
 ("if (!K.loopOn) return; requestAnimationFrame(loop);","if (!K.loopOn) return; (global.PerfHUD ? PerfHUD.raf : requestAnimationFrame)(loop);"),
 # 3. PerfHUD owns the automatic step-down (the kit's own watchdog would fight it)
 ("if (K.pref === 'auto' && fr.hist.length >= 60)","if (!global.PerfHUD && K.pref === 'auto' && fr.hist.length >= 60)"),
 # 4. pixel ratio through PerfHUD's cap
 ("r.setPixelRatio(Math.min(global.devicePixelRatio || 1, c.dpr));","r.setPixelRatio(global.PerfHUD ? PerfHUD.pixelRatio(Math.min(global.devicePixelRatio || 1, c.dpr)) : Math.min(global.devicePixelRatio || 1, c.dpr));"),
 # 5. Auto = Low on a software GPU (SwiftShader / llvmpipe); the game sets SF_SOFTGPU before init
 ("function autoQ() { var small = false;","function autoQ() { if (global.SF_SOFTGPU) return 'low'; var small = false;"),
 # 6. expose apply-only quality (PerfHUD's auto/test changes must not be saved)
 ("SFKit.getQuality = function () {","SFKit._applyQ = function (q) { if (K.on && GFX[q]) applyQ(q); };\nSFKit.getQuality = function () {"),
 # 7-8. my own wires are face up only when I know them (own flipped wires in jobs 38/56/64; the neutral hot-seat view)
 ("rec.cell = cellOf(t, mine || t.known || t.cut);","rec.cell = cellOf(t, (mine && t.known !== false) || t.known || t.cut);"),
 ("var up = mine || t.known || t.cut; var c = t.color || 'blue', cls","var up = (mine && t.known !== false) || t.known || t.cut; var c = t.color || 'blue', cls"),
 # 9. 2D seat plate: use the name we pass (watch mode has no "you")
 ("esc(mine ? 'You' : (names[s] || 'Crew ' + (s + 1)))","esc(names[s] || (mine ? 'You' : 'Crew ' + (s + 1)))"),
 # 10. false tokens ("not 10") need three characters
 ("return 'info:' + s.slice(0, 2);","return 'info:' + s.slice(0, 3);"),
 # 12. portrait boards use the tall 'column' layout up to a squarer aspect (a phone sheet leaves a nearly square board); SF_COLAT is set by the game
 ("aspect < .82 ?","aspect < (global.SF_COLAT || .82) ?"),
 # 11. 3D seat plate: the name we pass ("You" in solo, "Name (you)" in hot-seat)
 ("var label = me ? 'YOU' : name.toUpperCase();","var label = name.toUpperCase();"),
 # ---- phone pass (window.SF_PHONE, set by phone.js before the kit starts; every change is inert on desktop) ----
 # 13. compact detonator board on phones: fuse dial + defuse track + briefing cards only (mission card and gear cards become chips in the strip)
 ("function boardLayout(mode) {","function boardLayout(mode) {\n  if (global.SF_PHONE) return { W: 12.4, D: 7.0, track: { x0: -4.5, x1: 4.5, z: -1.5, r: .37 }, dial: { x: -4.0, z: 1.6, s: .9 }, mission: { x: 0, z: 40, w: 2.3, h: 3.1 }, extras: { x0: -2.1, x1: 5.2, z: 1.55, h: 1.6 }, equip: { x0: -2.9, x1: 2.9, z: 40, w: 1.75, h: 2.55 }, oxy: { x: -1.4, z: 1.6 } };"),
 ("var e = BL.equip; plate(e.x0 - .3, e.z - e.h / 2 - .55, e.x1 + .3, e.z + e.h / 2 + .45, 'GEAR');","var e = BL.equip; if (!global.SF_PHONE) plate(e.x0 - .3, e.z - e.h / 2 - .55, e.x1 + .3, e.z + e.h / 2 + .45, 'GEAR');"),
 ("var ms = BL.mission; plate(ms.x - ms.w / 2 - .3, ms.z - ms.h / 2 - .5, ms.x + ms.w / 2 + .3, ms.z + ms.h / 2 + .3, 'MISSION');","var ms = BL.mission; if (!global.SF_PHONE) plate(ms.x - ms.w / 2 - .3, ms.z - ms.h / 2 - .5, ms.x + ms.w / 2 + .3, ms.z + ms.h / 2 + .3, 'MISSION');"),
 ("for (var s = 0; s < 5; s++) { var sx = e.x0 + e.w / 2 + s","for (var s = 0; s < (global.SF_PHONE ? 0 : 5); s++) { var sx = e.x0 + e.w / 2 + s"),
 ("var a2 = P(ms.x - ms.w / 2, ms.z - ms.h / 2), b2 = P(ms.x + ms.w / 2, ms.z + ms.h / 2); rr(x, a2[0]","var a2 = P(ms.x - ms.w / 2, ms.z - ms.h / 2), b2 = P(ms.x + ms.w / 2, ms.z + ms.h / 2); if (!global.SF_PHONE) rr(x, a2[0]"),
 ("K.eqCards = K.eqCards || {}; var want = {}, BL = K.layout.BL, e = BL.equip,","K.eqCards = K.eqCards || {}; if (global.SF_PHONE) { for (var k0 in K.eqCards) K.gCards.remove(K.eqCards[k0]); K.eqCards = {}; K.dirty = true; return; } var want = {}, BL = K.layout.BL, e = BL.equip,"),
 ("  if (M.mission) { var md = M.mission;","  if (M.mission && !global.SF_PHONE) { var md = M.mission;"),
 ("K.chCards = K.chCards || {}; var want = {};","K.chCards = K.chCards || {}; if (global.SF_PHONE) { for (var kc in K.chCards) K.gCards.remove(K.chCards[kc]); K.chCards = {}; K.dirty = true; return; } var want = {};"),
 # 14. my own rack is the strip under the board on phones: no 3D rack, sign or crew card for my seat; the crew card and seat sign of the others shrink / go
 ("sts = standsOf(s), rows = [];","sts = (global.SF_HIDEME && (s - my + n) % n === 0) ? [] : standsOf(s), rows = [];"),
 ("oppS = clamp((BL.W + .4) / (ml + 2.6), .5, .8); }","oppS = clamp((BL.W + .4) / (ml + (global.SF_PHONE ? .5 : 2.6)), .5, global.SF_PHONE ? .98 : .8); }"),
 ("    S.foot.push(obb(S.charPos[0], S.charPos[1], .85 * sc, 1.2 * sc, 0));","    if (!global.SF_PHONE) S.foot.push(obb(S.charPos[0], S.charPos[1], .85 * sc, 1.2 * sc, 0));"),
 ("    S.foot.push(obb(S.signPos[0], S.signPos[1], .55 * sc, .35 * sc, rot));","    if (!global.SF_PHONE) S.foot.push(obb(S.signPos[0], S.signPos[1], .55 * sc, .35 * sc, rot));"),
 ("if (needAux(S.seat)) S.foot.push(obb(S.auxPos[0], S.auxPos[1], .9 * sc, 1.1 * sc, 0));","if (needAux(S.seat) && !(global.SF_PHONE && S.mine)) S.foot.push(obb(S.auxPos[0], S.auxPos[1], .9 * sc, 1.1 * sc, 0));"),
 ("    S.foot.push(obb(S.charPos[0], S.charPos[1], .5, .7, 0)); S.foot.push(obb(S.signPos[0], S.signPos[1], .5, .25, 0));","    if (!global.SF_PHONE) { S.foot.push(obb(S.charPos[0], S.charPos[1], .5, .7, 0)); S.foot.push(obb(S.signPos[0], S.signPos[1], .5, .25, 0)); }"),
 ("    me.foot.push(obb(me.charPos[0], me.charPos[1], .85, 1.2, 0)); me.foot.push(obb(me.signPos[0], me.signPos[1], .6, .3, 0));","    if (!global.SF_PHONE) { me.foot.push(obb(me.charPos[0], me.charPos[1], .85, 1.2, 0)); me.foot.push(obb(me.signPos[0], me.signPos[1], .6, .3, 0)); }"),
 ("if (needAux(me.seat)) me.foot.push(","if (needAux(me.seat) && !global.SF_PHONE) me.foot.push("),
 ("  L.seats.forEach(function (S) {\n    var g = new THREE.Group(); var sc = S.mine ? 1 : S.scale;","  L.seats.forEach(function (S) {\n    if (global.SF_PHONE) return;\n    var g = new THREE.Group(); var sc = S.mine ? 1 : S.scale;"),
 ("g.add(post, base, board); g.scale.setScalar(sc);","g.add(post, base, board); g.scale.setScalar(sc * (global.SF_PHONE ? .62 : 1));"),
 ("var xs = [Math.max(B.x0 - .3, T.x0), Math.min(B.x1 + .3, T.x1)], zs = [Math.max(B.z0 - .3, T.z0), Math.min(B.z1 + .3, T.z1)];","var pm_ = global.SF_PHONE ? .08 : .3; var xs = [Math.max(B.x0 - pm_, T.x0), Math.min(B.x1 + pm_, T.x1)], zs = [Math.max(B.z0 - pm_, T.z0), Math.min(B.z1 + pm_, T.z1)];"),
 ("pts.push(new THREE.Vector3(x, 1.9, z)); }); });","pts.push(new THREE.Vector3(x, global.SF_PHONE && col && z === zs[1] ? .5 : 1.9, z)); }); });"),
 ("var mt = (ins.top || 0) / K.h * 2 + .04, mb = (ins.bottom || 0) / K.h * 2 + .04, ml = (ins.left || 0) / K.w * 2 + .03, mr = (ins.right || 0) / K.w * 2 + .03;","var pg_ = global.SF_PHONE ? .4 : 1; var mt = (ins.top || 0) / K.h * 2 + .04 * pg_, mb = (ins.bottom || 0) / K.h * 2 + .04 * pg_, ml = (ins.left || 0) / K.w * 2 + .03 * pg_, mr = (ins.right || 0) / K.w * 2 + .03 * pg_;"),
 ("if (mode === 'column' && mine && m > 10) per =","if (mode === 'column' && mine && m > 10 && !global.SF_PHONE) per ="),
 ("me.rows.forEach(function (row) { var len = rowLen(row.m); var rail = c2 - U0; row.px = 0; row.pz = rail; row.rot = 0; row.s = 1; row.len = len; row.mine = true; row.M = m4(0, rail, 0, 1); me.foot.push(obb(0, rail + (U0 + U1) / 2, len / 2, RDEPTH / 2, 0)); c2 = rail + U1 + me.gap; maxHalf = Math.max(maxHalf, len / 2); });",
  "me.rows.forEach(function (row) { var len = rowLen(row.m); var ms_ = global.SF_PHONE ? Math.min(1, (BL.W + .2) / (len + .5)) : 1; var rail = c2 - U0 * ms_; row.px = 0; row.pz = rail; row.rot = 0; row.s = ms_; row.len = len; row.mine = true; row.M = m4(0, rail, 0, ms_); me.foot.push(obb(0, rail + (U0 + U1) / 2 * ms_, len * ms_ / 2, RDEPTH * ms_ / 2, 0)); c2 = rail + U1 * ms_ + me.gap * ms_; maxHalf = Math.max(maxHalf, len * ms_ / 2); });"),
 # 15. phone camera; the phone module can take over the camera (zoom to one rack) and gets a callback after every refit
 ("var el = (col ? 60 : 54) * Math.PI / 180;","var el = (global.SF_PHONE ? (col ? (K.st.n >= 5 ? 58 : 72) : 64) : col ? 60 : 54) * Math.PI / 180;"),
 ("if (K.focusT && !instant) {","if (K.phCam && !instant) { K.camState.ready = true; K.phCam(); applyCam(); return; } if (K.focusT && !instant) {"),
 # 16. the fonts are embedded in the page (../fonts, SIL OFL): never add the font-server stylesheet; still wait for the fonts before painting labels
 ("if (!document.querySelector('link[data-sf-fonts]')) {","if (false) {"),
]
kit=rd(os.path.join(SP,'short-fuse','kit','kit.js'))
miss=[a for a,_ in KIT_PATCHES if a not in kit]
if miss:print('WARNING kit patch anchors not found:',miss,file=sys.stderr)
for a,z in KIT_PATCHES:kit=kit.replace(a,z)

# ---------- the game ----------
# three.js r158 from games-src/node_modules (npm i); THREE_JS=<path to three.min.js> points the build at another copy
T=os.environ.get('THREE_JS') or os.path.join(SP,'node_modules','three','build','three.min.js')
SRC={'shell.js':os.path.join(SP,'shell','shell.js'),'gx-kit.js':os.path.join(SP,'shell','gx-kit.js'),'refdata.js':os.path.join(D,'refdata.js'),'kitsf.js':os.path.join(D,'kitsf.js'),'perfhud.js':os.path.join(SP,'perf','perfhud.js'),
     'gameaudio.js':os.path.join(SP,'audio','gameaudio.js'),'audio-data.js':os.path.join(SP,'short-fuse','audio','audio-data.js'),
     'data.js':os.path.join(D,'src','data.js'),'engine.js':os.path.join(D,'src','engine.js'),'ai.js':os.path.join(D,'src','ai.js'),'netstrip.js':os.path.join(D,'src','netstrip.js'),
     'trystero.min.js':os.path.join(SP,'net','trystero.min.js'),'netroom.js':os.path.join(SP,'net','netroom.js')}
ORDER=['shell.js','gx-kit.js','perfhud.js','trystero.min.js','netroom.js','three.min.js','kit.js','data.js','engine.js','ai.js','netstrip.js','texts.js','refdata.js','gameaudio.js','audio-data.js','sound.js','net.js','ui.js','phone.js','kitsf.js']
# fonts (SIL OFL, files and licences in ../fonts): embedded so the page never calls a font server and looks the same offline
import base64
def font_css():
    F=os.path.join(SP,'short-fuse','fonts');out=[]
    for fam,fn,w in [('Lilita One','lilita-one-latin-400-normal.woff2','400'),('Nunito','nunito-latin-wght-normal.woff2','200 1000')]:
        b64=base64.b64encode(open(os.path.join(F,fn),'rb').read()).decode('ascii')
        out.append("@font-face{font-family:'%s';font-style:normal;font-weight:%s;font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2')}"%(fam,w,b64))
    return '\n'.join(out)
h=rd(os.path.join(D,'head.html')).replace('/*SF_FONTS*/',font_css()).replace('/*SHELL_CSS*/',rd(os.path.join(SP,'shell','shell.css'))+'\n'+rd(os.path.join(SP,'shell','gx-kit.css')))
body=rd(os.path.join(D,'body.html'))
body=body.replace('<!--CREDITS-->',rd(os.path.join(SP,'short-fuse','audio','credits.html')))
for f in ORDER:
    tag=f'<script src="{f}"></script>';assert tag in body,f
    if f=='three.min.js':
        t=rd(T);src='!'+t[t.index('),')+2:]
        src=src.replace('console.warn(\'Scripts "build/three.js" and "build/three.min.js" are deprecated','void(\'Scripts "build/three.js" and "build/three.min.js" are deprecated',1)
    elif f=='kit.js':src=kit
    else:src=rd(SRC.get(f,os.path.join(D,f)))
    src=src.replace('</script','<\\/script')
    body=body.replace(tag,'<script>\n'+src+'\n</script>')
out=h+body
open(os.path.join(D,'shortfuse.html'),'w',encoding='utf-8').write(out)
js='\n'.join(x for x in re.findall(r'<script>(.*?)</script>',out,re.S) if not x.startswith('\n!'))
open(os.path.join(D,'x.js'),'w',encoding='utf-8').write(js)
print('shortfuse.html',len(out.encode('utf-8')),'bytes')
