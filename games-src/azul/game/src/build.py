import re,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
h=open('head.html').read();b=open('body.html').read()
T='../../../node_modules/three/build/three.min.js'
SRC={'shell.js':'../../../shell/shell.js','gx-viewport.js':'../../../shell/gx-viewport.js','gx-help.js':'../../../shell/gx-help.js','gx-tutor.js':'../../../shell/gx-tutor.js','gx-campaign.js':'../../../shell/gx-campaign.js','perfhud.js':'../../../perf/perfhud.js','gameaudio.js':'../../../audio/gameaudio.js','audio-data.js':'../../../audio/sunglaze/audio-data.js','trystero.min.js':'../../../net/trystero.min.js','netroom.js':'../../../net/netroom.js','gx-music.js':'../../../shell/gx-music.js'}
for f in ['shell.js','gx-viewport.js','gx-help.js','gx-tutor.js','gx-music.js','gx-campaign.js','campaign-data.js','perfhud.js','gameaudio.js','audio-data.js','trystero.min.js','netroom.js','three.min.js','data.js','art.js','engine.js','ai.js','rules-html.js','three3d.js','sound.js','net.js','ui.js','ui8.js','ui9.js','campaign.js','media.js','hlp.js','tutor.js']:
    tag=f'<script src="{f}"></script>';assert tag in b,f
    src=(lambda t:'!'+t[t.index('),')+2:])(open(T).read()) if f=='three.min.js' else ('window.CAMPAIGN='+open('../../campaign.json').read().strip()+';') if f=='campaign-data.js' else open(SRC.get(f,f)).read()
    b=b.replace(tag,'<script>\n'+src+'\n</script>')
h=h.replace('</head>','<style>\n'+open('../../../shell/gx-campaign.css').read()+open('../../../shell/gx-help.css').read()+open('../../../shell/gx-tutor.css').read()+open('extra.css').read()+'\n</style>\n</head>',1)  # the shared story-campaign screens
out=h+b
open('../sunglaze.html','w').write(out)
js='\n'.join(x for x in re.findall(r'<script>(.*?)</script>',out,re.S) if not x.startswith('\n!'))
open('x.js','w').write(js)
print(len(out))
