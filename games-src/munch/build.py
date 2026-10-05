import re
h=open('head.html').read()
b=open('body.html').read()
h=h.replace('<style>','<style>\n'+open('../shell/shell.css').read()+'\n',1)
h=h.replace('</style>','\n'+open('bf.css').read()+'\n</style>',1)  # board-first layer, last so it wins
SRC={'shell.js':'../shell/shell.js','trystero.min.js':'../net/trystero.min.js','netroom.js':'../net/netroom.js','perfhud.js':'../perf/perfhud.js','gameaudio.js':'../audio/gameaudio.js','audio-data.js':'../audio/doorkick/audio-data.js','gx-campaign.js':'../shell/gx-campaign.js'}  # the shared speed tool and the shared audio player + this game's samples
for f in ['trystero.min.js','netroom.js','shell.js','gx-campaign.js','campaign-data.js','perfhud.js','cards.js','rules-html.js','art.js','gfx.js','engine.js','ai.js','gameaudio.js','audio-data.js','sound.js','coach.js','net.js','ui.js','ph.js','bf.js','campaign.js']:
    tag=f'<script src="{f}"></script>'
    assert tag in b,f
    src=('window.CAMPAIGN='+open('campaign.json').read().strip()+';') if f=='campaign-data.js' else open(SRC.get(f,f)).read()
    b=b.replace(tag,'<script>\n'+src+'\n</script>')
h=h.replace('</head>','<style>\n'+open('../shell/gx-campaign.css').read()+'\n</style>\n</head>',1)  # the shared story-campaign screens
out=h+b
open('doorkick.html','w').write(out)
js='\n'.join(re.findall(r'<script>(.*?)</script>',out,re.S))
open('x.js','w').write(js)
print(len(out))
