import re
h=open('head.html').read()
extra=open('extra.css').read()+'\n'+open('../shell/shell.css').read()+'\n'+open('layout.css').read()+'\n'+open('polish.css').read()
extra+='\n'+open('phone.css').read()+'\n'+open('board.css').read()+'\n'+open('../shell/gx-campaign.css').read()+'\n'+open('campaign.css').read()
h=h.replace('</style>',extra+'\n</style>')
h=h.replace('</head>','<script>\n'+open('phboot.js').read()+'\n</script>\n</head>',1)
b=open('body2.html').read()
SRC={'shell.js':'../shell/shell.js','perfhud.js':'../perf/perfhud.js','gameaudio.js':'../audio/gameaudio.js','audio-data.js':'../audio/crown/audio-data.js','trystero.min.js':'../net/trystero.min.js','netroom.js':'../net/netroom.js','gx-campaign.js':'../shell/gx-campaign.js'}
for f in ['shell.js','gx-campaign.js','campaign-data.js','perfhud.js','data.js','engine.js','ai.js','three.min.js','exp.js','art.js','three3d.js','gameaudio.js','audio-data.js','sound.js','trystero.min.js','netroom.js','net.js','story.js','ui.js','ui-ph.js','board.js','brief.js','campaign.js']:
    b=b.replace(f'<script src="{f}"></script>','<script>\n'+(('window.CAMPAIGN = '+__import__('json').dumps(__import__('json').load(open('campaign.json',encoding='utf-8')),separators=(',',':'),ensure_ascii=False)+';') if f=='campaign-data.js' else (lambda t:'!'+t[t.index('),')+2:])(open('../node_modules/three/build/three.min.js').read()) if f=='three.min.js' else open(SRC.get(f,f)).read())+'\n</script>')
out=h+b
open('kot2.html','w').write(out)
js='\n'.join(x for x in re.findall(r'<script>(.*?)</script>',out,re.S) if 'three.module' not in x[:300] and not x.lstrip().startswith('/**'))
open('x.js','w').write(js)
print(len(out))
