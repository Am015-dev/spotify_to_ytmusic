import re,os,json
os.chdir(os.path.dirname(os.path.abspath(__file__)))
SP=os.path.abspath('../../..')   # games-src
rd=lambda p:open(p,encoding='utf-8').read()
h=rd('head.html').replace('/*GXCCSS*/',rd(SP+'/shell/gx-campaign.css'));h=h.replace('</style>',''+rd(SP+'/shell/gx-help.css')+rd(SP+'/shell/gx-tutor.css')+'\n:root{--gxh-btn:#b5532f;--gxh-accent:#e0a83a;--gxh-bg:#f6ead2;--gxh-font:var(--ff)}</style>',1);b=rd('body.html')
SRC={'gx-viewport.js':SP+'/shell/gx-viewport.js','gx-help.js':SP+'/shell/gx-help.js','gx-tutor.js':SP+'/shell/gx-tutor.js','gx-campaign.js':SP+'/shell/gx-campaign.js','perfhud.js':SP+'/perf/perfhud.js','gameaudio.js':SP+'/audio/gameaudio.js','audio-data.js':SP+'/audio/rampart/audio-data.js'}
for f in ['gx-viewport.js','gx-help.js','gx-tutor.js','gx-campaign.js','campaign-data.js','perfhud.js','gameaudio.js','audio-data.js','data.js','geo.js','engine.js','ai.js','icons.js','hlp.js','sound.js','tutor.js','bf.js','camp.js','paint.js']:
    tag=f'<script src="{f}"></script>';assert tag in b,f
    if f=='campaign-data.js':src='window.CAMPAIGN = '+json.dumps(json.load(open('../../campaign.json',encoding='utf-8')),separators=(',',':'),ensure_ascii=False)+';'
    else:src=rd(SRC.get(f,f))
    b=b.replace(tag,'<script>\n'+src.replace('</script','<\\/script')+'\n</script>')
out=h+b
open('../rampart.html','w',encoding='utf-8').write(out)
js='\n'.join(re.findall(r'<script>(.*?)</script>',out,re.S))
open('x.js','w',encoding='utf-8').write(js)
print(len(out))
