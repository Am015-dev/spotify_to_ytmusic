import re
h=open('head.html').read()
b=open('body.html').read()
h=h.replace('<style>','<style>\n'+open('shell.css').read()+'\n',1)
SRC={'trystero.min.js':'../net/trystero.min.js','netroom.js':'../net/netroom.js','perfhud.js':'../perf/perfhud.js','gameaudio.js':'../audio/gameaudio.js','audio-data.js':'../audio/doorkick/audio-data.js'}  # the shared speed tool and the shared audio player + this game's samples
for f in ['trystero.min.js','netroom.js','shell.js','perfhud.js','cards.js','rules-html.js','art.js','gfx.js','engine.js','ai.js','gameaudio.js','audio-data.js','sound.js','coach.js','net.js','ui.js']:
    tag=f'<script src="{f}"></script>'
    assert tag in b,f
    b=b.replace(tag,'<script>\n'+open(SRC.get(f,f)).read()+'\n</script>')
out=h+b
open('doorkick.html','w').write(out)
js='\n'.join(re.findall(r'<script>(.*?)</script>',out,re.S))
open('x.js','w').write(js)
print(len(out))
