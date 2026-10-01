#!/usr/bin/env python3
"""Build kit.js (concat parts/*) and demo.html (inline three.min.js r158 + kit.js into demo-src.html)."""
import os, glob
HERE = os.path.dirname(os.path.abspath(__file__))
SP = os.path.abspath(os.path.join(HERE, '..', '..'))
parts = sorted(glob.glob(os.path.join(HERE, 'parts', 'p*.js')), key=lambda f: int(os.path.basename(f)[1:-3]))
if os.environ.get('NOPARTS') != '1':
    open(os.path.join(HERE, 'kit.js'), 'w', encoding='utf-8').write(''.join(open(f, encoding='utf-8').read() for f in parts))
three = open(os.path.join(SP, 'node_modules', 'three', 'build', 'three.min.js'), encoding='utf-8').read()
three = three.replace('console.warn(\'Scripts "build/three.js" and "build/three.min.js" are deprecated', 'void(\'Scripts "build/three.js" and "build/three.min.js" are deprecated', 1)
kit = open(os.path.join(HERE, 'kit.js'), encoding='utf-8').read()
src = open(os.path.join(HERE, 'demo-src.html'), encoding='utf-8').read()
for name, code in (('THREE', three), ('KIT', kit)):
    code = code.replace('</script', '<\\/script')
    src = src.replace('<script>/*%s*/</script>' % name, '<script>\n' + code + '\n</script>', 1)
out = os.path.join(HERE, 'demo.html')
open(out, 'w', encoding='utf-8').write(src)
print('wrote', out, round(len(src.encode('utf-8')) / 1024), 'KB')
