import re
h=open('head.html').read();b=open('body.html').read()
T='../node_modules/three/build/three.min.js'
SRC={'perfhud.js':'../perf/perfhud.js','gameaudio.js':'../audio/gameaudio.js','audio-data.js':'../audio/shipwreck/audio-data.js'}  # the shared speed tool and the shared audio player + this game's samples
for f in ['shell.js','perfhud.js','three.min.js','data-gen.js','data.js','cards-ev.js','cards-adv.js','text.js','rules-html.js','engine.js','phases.js','scen.js','moves.js','ai.js','flavor.js','story.js','flow.js','advisor.js','plan-ui.js','three3d.js','gameaudio.js','audio-data.js','sound.js','ui.js']:
    tag=f'<script src="{f}"></script>';assert tag in b,f
    src=(lambda t:'!'+t[t.index('),')+2:])(open(T).read()) if f=='three.min.js' else open(SRC.get(f,f)).read()
    b=b.replace(tag,'<script>\n'+src+'\n</script>')
out=h+b
open('shipwreck.html','w').write(out)
js='\n'.join(x for x in re.findall(r'<script>(.*?)</script>',out,re.S) if not x.startswith('\n!'))
open('x.js','w').write(js)
print(len(out))
