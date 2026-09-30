import re
h=open('head.html').read()
extra=open('extra.css').read()+'\n'+open('shell.css').read()+'\n'+open('layout.css').read()+'\n'+open('polish.css').read()
h=h.replace('</style>',extra+'\n</style>')
b=open('body2.html').read()
for f in ['shell.js','data.js','engine.js','ai.js','three.min.js','exp.js','art.js','three3d.js','sound.js','net.js','story.js','ui.js']:
    b=b.replace(f'<script src="{f}"></script>','<script>\n'+((lambda t:'!'+t[t.index('),')+2:])(open('../node_modules/three/build/three.min.js').read()) if f=='three.min.js' else open(f).read())+'\n</script>')
out=h+b
open('kot2.html','w').write(out)
js='\n'.join(x for x in re.findall(r'<script>(.*?)</script>',out,re.S) if 'three.module' not in x[:300] and not x.lstrip().startswith('/**'))
open('x.js','w').write(js)
print(len(out))
