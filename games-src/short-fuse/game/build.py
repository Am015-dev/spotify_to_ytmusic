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

# ---------- the game ----------
SRC={'shell.js':os.path.join(SP,'shell','shell.js'),'gx-campaign.js':os.path.join(SP,'shell','gx-campaign.js'),'gx-viewport.js':os.path.join(SP,'shell','gx-viewport.js'),'gx-help.js':os.path.join(SP,'shell','gx-help.js'),'perfhud.js':os.path.join(SP,'perf','perfhud.js'),
     'gameaudio.js':os.path.join(SP,'audio','gameaudio.js'),'audio-data.js':os.path.join(SP,'short-fuse','audio','audio-data.js'),
     'data.js':os.path.join(D,'src','data.js'),'engine.js':os.path.join(D,'src','engine.js'),'ai.js':os.path.join(D,'src','ai.js'),'netstrip.js':os.path.join(D,'src','netstrip.js'),
     'trystero.min.js':os.path.join(SP,'net','trystero.min.js'),'netroom.js':os.path.join(SP,'net','netroom.js')}
ORDER=['shell.js','gx-viewport.js','gx-help.js','gx-campaign.js','campaign-data.js','perfhud.js','trystero.min.js','netroom.js','data.js','engine.js','ai.js','netstrip.js','texts.js','hlp.js','gameaudio.js','audio-data.js','sound.js','net.js','ui.js','tbl.js','start.js']
import json
h=rd(os.path.join(D,'head.html')).replace('/*SHELL_CSS*/',rd(os.path.join(SP,'shell','shell.css'))+'\n'+rd(os.path.join(SP,'shell','gx-help.css'))).replace('/*TABLE_CSS*/',rd(os.path.join(SP,'shell','gx-campaign.css'))+'\n'+rd(os.path.join(D,'table.css')))
body=rd(os.path.join(D,'body.html'))
body=body.replace('<!--CREDITS-->',rd(os.path.join(SP,'short-fuse','audio','credits.html')))
for f in ORDER:
    tag=f'<script src="{f}"></script>';assert tag in body,f
    if f=='campaign-data.js':src='window.CAMPAIGN = '+json.dumps(json.load(open(os.path.join(SP,'short-fuse','campaign.json'),encoding='utf-8')),separators=(',',':'),ensure_ascii=False)+';'
    else:src=rd(SRC.get(f,os.path.join(D,f)))
    src=src.replace('</script','<\\/script')
    body=body.replace(tag,'<script>\n'+src+'\n</script>')
out=h+body
open(os.path.join(D,'shortfuse.html'),'w',encoding='utf-8').write(out)
js='\n'.join(x for x in re.findall(r'<script>(.*?)</script>',out,re.S))
open(os.path.join(D,'x.js'),'w',encoding='utf-8').write(js)
print('shortfuse.html',len(out.encode('utf-8')),'bytes')
