# Builds tidewake.html (the playable game, one self-contained file) and x.js (all our scripts, for node --check).
# The kit (../kit/kit.js) is never edited: KIT_PATCHES are string replaces applied to the COPY inlined here (each warns if its anchor is gone).
import re,os,sys
D=os.path.dirname(os.path.abspath(__file__))
SP=os.path.abspath(os.path.join(D,'..','..'))
def rd(p):return open(p,encoding='utf-8').read()
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
]
kit=rd(os.path.join(SP,'tidewake','kit','kit.js'))
miss=[a for a,_ in KIT_PATCHES if a not in kit]
if miss:print('WARNING kit patch anchors not found:',miss,file=sys.stderr)
for a,z in KIT_PATCHES:kit=kit.replace(a,z)
# ui.js is the join of ui1..ui5.js (kept in parts for editing)
open(os.path.join(D,'ui.js'),'w',encoding='utf-8').write(''.join(rd(os.path.join(D,'ui%d.js'%i)) for i in range(1,10)))
T=os.path.join(SP,'node_modules','three','build','three.min.js')
SRC={'shell.js':os.path.join(SP,'shell','shell.js'),'gx-viewport.js':os.path.join(SP,'shell','gx-viewport.js'),'gx-help.js':os.path.join(SP,'shell','gx-help.js'),'gx-campaign.js':os.path.join(SP,'shell','gx-campaign.js'),'campaign-data.js':'','perfhud.js':os.path.join(SP,'perf','perfhud.js'),
     'gameaudio.js':os.path.join(SP,'audio','gameaudio.js'),'audio-data.js':os.path.join(SP,'tidewake','audio','audio-data.js'),
     'data.js':os.path.join(D,'src','data.js'),'engine.js':os.path.join(D,'src','engine.js'),'ai.js':os.path.join(D,'src','ai.js'),'netstrip.js':os.path.join(D,'src','netstrip.js'),
     'trystero.min.js':os.path.join(SP,'net','trystero.min.js'),'netroom.js':os.path.join(SP,'net','netroom.js')}
ORDER=['shell.js','gx-viewport.js','gx-help.js','gx-campaign.js','campaign-data.js','perfhud.js','trystero.min.js','netroom.js','three.min.js','kit.js','data.js','engine.js','ai.js','netstrip.js','texts.js','gameaudio.js','audio-data.js','sound.js','net.js','ui.js']
h=rd(os.path.join(D,'head.html')).replace('/*SHELL_CSS*/',rd(os.path.join(SP,'shell','shell.css'))).replace('</head>','<style>\n'+rd(os.path.join(SP,'shell','gx-campaign.css'))+'\n'+rd(os.path.join(SP,'shell','gx-help.css'))+'\n</style>\n</head>',1)
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
