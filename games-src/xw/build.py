import re,sys
THREE_PATH='../node_modules/three/build/three.min.js'
SRC={'shell.js':'../shell/shell.js','perfhud.js':'../perf/perfhud.js','gameaudio.js':'../audio/gameaudio.js','audio-data.js':'../audio/nebula/audio-data.js','trystero.min.js':'../net/trystero.min.js','netroom.js':'../net/netroom.js'}
h=open('head.html').read()
b=open('body.html').read()
h=h.replace('<link rel="stylesheet" href="shell.css">','<style>\n'+open('../shell/shell.css').read()+'\n</style>')
h=h.replace('<link rel="stylesheet" href="polish.css">','<style>\n'+open('polish.css').read()+'\n</style>')
h=h.replace('</head>','<style>\n'+open('phone.css').read()+'\n'+open('board.css').read()+'\n</style>\n</head>')
for f in ['perfhud.js','gameaudio.js','audio-data.js','trystero.min.js','netroom.js','three.min.js','geo.js','data.js','exp.js','engine.js','ai.js','sound.js','three3d.js','net.js','shell.js','story.js','guide.js','flow.js','ui.js','ui-ph.js','board.js']:
    tag=f'<script src="{f}"></script>'
    if tag not in b: continue
    src=(lambda t:'!'+t[t.index('),')+2:])(open(THREE_PATH).read()) if f=='three.min.js' else open(SRC.get(f,f)).read()
    b=b.replace(tag,'<script>\n'+src+'\n</script>')
out=h+b
open('nebula.html','w').write(out)
js='\n'.join(x for x in re.findall(r'<script>(.*?)</script>',out,re.S) if not x.lstrip().startswith('!function'))
open('x.js','w').write(js)
print(len(out))
