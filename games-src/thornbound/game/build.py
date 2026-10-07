# Builds thornbound.html (single self-contained file) and x.js (all scripts, for node --check). Kit is read-only.
import re,os
D=os.path.dirname(os.path.abspath(__file__));S=os.path.join(D,'src');SP=os.path.abspath(os.path.join(D,'..','..'))
rd=lambda p:open(p,encoding='utf-8').read()
open(os.path.join(S,'ui.js'),'w',encoding='utf-8').write(''.join(rd(os.path.join(S,'ui%d.js'%i)) for i in range(1,13)))
ai=os.path.join(S,'ai.js')
SRC={'shell.js':SP+'/shell/shell.js','gx-viewport.js':SP+'/shell/gx-viewport.js','gx-help.js':SP+'/shell/gx-help.js','gx-tutor.js':SP+'/shell/gx-tutor.js','perfhud.js':SP+'/perf/perfhud.js','kit.js':SP+'/thornbound/kit/kit.js','gameaudio.js':SP+'/audio/gameaudio.js','audio-data.js':SP+'/audio/thornbound/audio-data.js',
 'data.js':S+'/data.js','engine.js':S+'/engine.js','ai.js':ai if os.path.exists(ai) else None,'trystero.min.js':SP+'/net/trystero.min.js','netroom.js':SP+'/net/netroom.js','netstrip.js':S+'/netstrip.js','net.js':S+'/net.js','ui.js':S+'/ui.js','gx-campaign.js':SP+'/shell/gx-campaign.js','campaign.js':None}
h=rd(S+'/head.html').replace('/*SHELL_CSS*/',rd(SP+'/shell/shell.css'));h=h.replace('</style>',rd(SP+'/shell/gx-campaign.css')+rd(SP+'/shell/gx-help.css')+rd(SP+'/shell/gx-tutor.css')+'</style>',1);body=rd(S+'/body.html')
for f,p in SRC.items():
    tag='<script src="%s"></script>'%f;assert tag in body,f
    src=rd(p).replace('</script','<\\/script') if p else ('window.CAMPAIGN = '+__import__('json').dumps(__import__('json').load(open(SP+'/thornbound/campaign.json',encoding='utf-8')),ensure_ascii=False).replace('</','<\\/')+';' if f=='campaign.js' else '/* ai.js not present yet */')
    body=body.replace(tag,'<script>\n'+src+'\n</script>')
out=h+body;open(D+'/thornbound.html','w',encoding='utf-8').write(out)
open(D+'/x.js','w',encoding='utf-8').write('\n'.join(re.findall(r'<script>(.*?)</script>',out,re.S)))
print('thornbound.html',len(out.encode()),'bytes',('(with ai.js)' if p else ''))
