# split_km.py <in.html> <outdir> : moves the embedded Kenney model blob (const KM_BIN='...') into km.js
import sys,re,os
src,out=sys.argv[1],sys.argv[2];s=open(src).read()
m=re.search(r'const KM_BIN="([^"]*)"',s);assert m,'KM_BIN not found'
blob=m.group(1);s=s[:m.start()]+"const KM_BIN=window.__KM_BIN||''"+s[m.end():]
assert s.count('<script type="module">')==1
s=s.replace('<script type="module">','<script src="km.js"></script>\n<script type="module">',1)
os.makedirs(out,exist_ok=True);open(os.path.join(out,'overdrive.html'),'w').write(s)
open(os.path.join(out,'km.js'),'w').write("window.__KM_BIN='"+blob+"';\n")
print('page',len(s),'km.js',len(blob)+25)
