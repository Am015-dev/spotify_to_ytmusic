# hot.py <build dir> <out dir>: copy a build with window.__hot (module-scope eval) for rv probes
import shutil,os,sys
s,d=sys.argv[1].rstrip('/')+'/',sys.argv[2].rstrip('/')+'/'
if os.path.exists(d):shutil.rmtree(d)
shutil.copytree(s,d)
h=open(s+'index.html',encoding='utf-8').read();k='window.__mho={'
assert k in h
open(d+'index.html','w',encoding='utf-8').write(h.replace(k,'window.__hot=__hs=>eval(__hs);\n'+k,1))
print('HOT_OK',d)
