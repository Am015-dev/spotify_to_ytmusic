import re
h=open('head.html').read()
b=open('body.html').read()
h=h.replace('<style>','<style>\n'+open('shell.css').read()+'\n',1)
for f in ['shell.js','cards.js','rules-html.js','art.js','gfx.js','engine.js','ai.js','sound.js','coach.js','ui.js']:
    tag=f'<script src="{f}"></script>'
    assert tag in b,f
    b=b.replace(tag,'<script>\n'+open(f).read()+'\n</script>')
out=h+b
open('doorkick.html','w').write(out)
js='\n'.join(re.findall(r'<script>(.*?)</script>',out,re.S))
open('x.js','w').write(js)
print(len(out))
