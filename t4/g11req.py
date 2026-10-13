# write t4/g11/iter/req.js from the CURRENT src template code (G9_sc/G9_f1/G9_mt + G9_T) so g9iter renders exactly what src builds
import re,sys
s=open('src/98y_garage_collection.js').read()
a=s.index('function G9_sc');b=s.index('// off-road template')
code=s[a:b].replace('const G9_T=','const T=')
only=sys.argv[1:] 
pick='T.filter(t=>!%s||%s.includes(t.id))'%(repr(only and 1 or 0).lower() if False else ('false' if not only else 'true'), str(only))
req="(()=>{"+code+";const o={};for(const t of T)o[t.id.slice(2)]={A:t.car()};o.beast={A:G9_mt({B:'#0d2a6b',AZ:'#36aebf'})};"+("const K=%s;for(const k in o)if(!K.includes(k))delete o[k];"%str(only) if only else "")+"return o})()"
open('t4/g11/iter/req.js','w').write(req)
