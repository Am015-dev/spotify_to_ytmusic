#!/usr/bin/env python3
"""Build demo.html: inline three.min.js (r158 UMD) and kit.js into demo-src.html."""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
SP = os.path.abspath(os.path.join(HERE, '..', '..'))
three = open(os.path.join(SP, 'node_modules', 'three', 'build', 'three.min.js'), encoding='utf-8').read()
# silence the r150+ deprecation warning printed by the UMD build
three = three.replace('console.warn(\'Scripts "build/three.js" and "build/three.min.js" are deprecated', 'void(\'Scripts "build/three.js" and "build/three.min.js" are deprecated', 1)
kit = open(os.path.join(HERE, 'kit.js'), encoding='utf-8').read()
src = open(os.path.join(HERE, 'demo-src.html'), encoding='utf-8').read()
for name, code in (('THREE', three), ('KIT', kit)):
    code = code.replace('</script', '<\\/script')
    src = src.replace('<script>/*%s*/</script>' % name, '<script>\n' + code + '\n</script>', 1)
out = os.path.join(HERE, 'demo.html')
open(out, 'w', encoding='utf-8').write(src)
print('wrote', out, round(len(src.encode('utf-8')) / 1024), 'KB')
