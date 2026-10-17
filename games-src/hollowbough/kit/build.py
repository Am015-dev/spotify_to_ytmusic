#!/usr/bin/env python3
"""Concatenate parts/p*.js -> kit.js, inline into demo-src.html -> demo.html"""
import os, glob
H = os.path.dirname(os.path.abspath(__file__))
parts = sorted(glob.glob(os.path.join(H, 'parts', 'p*.js')), key=lambda f: int(os.path.basename(f)[1:-3]))
kit = ''.join(open(f, encoding='utf-8').read() for f in parts)
open(os.path.join(H, 'kit.js'), 'w', encoding='utf-8').write(kit)
src = open(os.path.join(H, 'demo-src.html'), encoding='utf-8').read()
src = src.replace('<script>/*KIT*/</script>', '<script>\n' + kit.replace('</script', '<\\/script') + '\n</script>', 1)
open(os.path.join(H, 'demo.html'), 'w', encoding='utf-8').write(src)
print('kit.js', len(kit) // 1024, 'KB; demo.html', len(src) // 1024, 'KB')
