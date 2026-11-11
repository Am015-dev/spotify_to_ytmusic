import re
h=open('head.html').read();b=open('body.html').read()
T='../../node_modules/three/build/three.min.js'
SRC={'perfhud.js':'../../perf/perfhud.js','gameaudio.js':'../../audio/gameaudio.js','audio-data.js':'../../audio/sands/audio-data.js','trystero.min.js':'../../net/trystero.min.js','netroom.js':'../../net/netroom.js'}
for f in ['shell.js','perfhud.js','gameaudio.js','audio-data.js','trystero.min.js','netroom.js','three.min.js','data.js','djinns.js','engine.js','ai.js','rules-html.js','story.js','art3d.js','three3d.js','sound.js','net.js','ui.js','ui8.js']:
    tag=f'<script src="{f}"></script>';assert tag in b,f
    src=(lambda t:'!'+t[t.index('),')+2:])(open(T).read()) if f=='three.min.js' else open(SRC.get(f,f)).read()
    b=b.replace(tag,'<script>\n'+src+'\n</script>')
out=h+b
open('../sands.html','w').write(out)
js='\n'.join(x for x in re.findall(r'<script>(.*?)</script>',out,re.S) if not x.startswith('\n!'))
open('x.js','w').write(js)
print(len(out))
