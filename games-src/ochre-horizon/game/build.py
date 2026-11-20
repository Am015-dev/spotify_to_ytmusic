# Builds ochre-horizon.html (one self-contained file) and x.js (all our scripts, for node --check).
import re,os,base64,subprocess,sys
D=os.path.dirname(os.path.abspath(__file__))
SP=os.path.abspath(os.path.join(D,'..','..'))   # games-src
OHD=os.path.abspath(os.path.join(D,'..'))
def rd(p):return open(p,encoding='utf-8').read()
subprocess.run([sys.executable,os.path.join(D,'gen-data.py')],check=True,stdout=subprocess.DEVNULL)
parts=sorted((f for f in os.listdir(os.path.join(D,'src')) if re.match(r'ui\d+\.js$',f)),key=lambda f:int(re.findall(r'\d+',f)[0]))
ui=''.join(rd(os.path.join(D,'src',f)) for f in parts)
open(os.path.join(D,'ui.js'),'w',encoding='utf-8').write(ui)
SRC={'gx-scenario.js':os.path.join(SP,'shell','gx-scenario.js'),'scn.js':os.path.join(D,'scn.js'),'gx-viewport.js':os.path.join(SP,'shell','gx-viewport.js'),
 'map.js':os.path.join(D,'src','map.js'),'data.js':os.path.join(D,'src','data.js'),'engine.js':os.path.join(D,'src','engine.js'),'ai.js':os.path.join(D,'src','ai.js'),'art.js':os.path.join(D,'src','art.js'),'ui.js':os.path.join(D,'ui.js')}
def face(fam,f,w):return "@font-face{font-family:'%s';font-weight:%s;font-style:normal;font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2')}"%(fam,w,base64.b64encode(open(os.path.join(OHD,'fonts',f),'rb').read()).decode())
fonts=face('Righteous','righteous-400.woff2','400')+face('Space Grotesk','space-grotesk.woff2','300 700')
h=rd(os.path.join(D,'head.html')).replace('/*FONTS*/',fonts)
body=rd(os.path.join(D,'body.html'))
for f,p in SRC.items():
    tag='<script src="%s"></script>'%f
    assert tag in body,f
    body=body.replace(tag,'<script>\n'+rd(p).replace('</script','<\\/script')+'\n</script>')
out=h+body
open(os.path.join(D,'ochre-horizon.html'),'w',encoding='utf-8').write(out)
js='\n'.join(re.findall(r'<script>(.*?)</script>',out,re.S))
open(os.path.join(D,'x.js'),'w',encoding='utf-8').write(js)
print('ochre-horizon.html',len(out.encode('utf-8')),'bytes')
