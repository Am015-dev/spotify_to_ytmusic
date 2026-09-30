import re,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
h=open('head.html').read().replace('/*SHELLCSS*/',open('shell.css').read());b=open('body.html').read()
T='../../../node_modules/three/build/three.min.js'
for f in ['shell.js','three.min.js','data.js','geo.js','engine.js','ai.js','rules-html.js','three3d.js','sound.js','ui.js']:
    tag=f'<script src="{f}"></script>';assert tag in b,f
    src=(lambda t:'!'+t[t.index('),')+2:])(open(T).read()) if f=='three.min.js' else open(f).read()
    b=b.replace(tag,'<script>\n'+src+'\n</script>')
out=h+b
open('../rampart.html','w').write(out)
js='\n'.join(x for x in re.findall(r'<script>(.*?)</script>',out,re.S) if not x.startswith('\n!'))
open('x.js','w').write(js)
print(len(out))
