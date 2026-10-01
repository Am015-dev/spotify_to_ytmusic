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
 # 11. 3D seat plate: the name we pass ("You" in solo, "Name (you)" in hot-seat)
 ("var label = me ? 'YOU' : name.toUpperCase();","var label = name.toUpperCase();"),
]
kit=rd(os.path.join(SP,'bb','kit','kit.js'))
miss=[a for a,_ in KIT_PATCHES if a not in kit]
if miss:print('WARNING kit patch anchors not found:',miss,file=sys.stderr)
for a,z in KIT_PATCHES:kit=kit.replace(a,z)

# ---------- the game ----------
T=os.path.join(SP,'node_modules','three','build','three.min.js')
SRC={'shell.js':os.path.join(SP,'shell','shell.js'),'perfhud.js':os.path.join(SP,'perf','perfhud.js'),
     'gameaudio.js':os.path.join(SP,'audio','gameaudio.js'),'audio-data.js':os.path.join(SP,'audio','shortfuse','audio-data.js'),
     'data.js':os.path.join(D,'src','data.js'),'engine.js':os.path.join(D,'src','engine.js'),'ai.js':os.path.join(D,'src','ai.js'),'netstrip.js':os.path.join(D,'src','netstrip.js'),
     'trystero.min.js':os.path.join(SP,'net','trystero.min.js'),'netroom.js':os.path.join(SP,'net','netroom.js')}
ORDER=['shell.js','perfhud.js','trystero.min.js','netroom.js','three.min.js','kit.js','data.js','engine.js','ai.js','netstrip.js','texts.js','gameaudio.js','audio-data.js','sound.js','net.js','ui.js']
h=rd(os.path.join(D,'head.html')).replace('/*SHELL_CSS*/',rd(os.path.join(SP,'shell','shell.css')))
body=rd(os.path.join(D,'body.html'))
body=body.replace('<!--CREDITS-->',rd(os.path.join(SP,'audio','shortfuse','credits.html')))
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
