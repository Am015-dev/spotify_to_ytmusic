#!/usr/bin/env python3
# life-2: cut one submodel of an OMR .mpd into part groups (base / rotor / ...) as plain .ldr files for tools/ld/ld2garage.py.
# usage: ldsplit.py <set.mpd> <submodel substring> <out prefix> group=part,part ... [rest=<group>] [top=sub,sub]   (part = LDraw part id without .dat,
#  @sub = every part inside submodels whose name contains sub; top= keeps only those top-level submodels)
# Embedded part files ("3681 - 4779.dat") are mapped to the library part (4779.dat). Nested submodels are flattened with their transforms.
import sys,re,numpy as np
mpd,sub,pre=sys.argv[1:4];G={};rest='base';TOP=[]
for a in sys.argv[4:]:
  k,v=a.split('=');
  if k=='rest':rest=v
  elif k=='top':TOP=[t.lower() for t in v.split(',')]
  else:
    for p in v.split(','):G[p.lower()]=k
files={};cur=None
for l in open(mpd,encoding='utf8',errors='replace'):
  if l.startswith('0 FILE '):cur=l[7:].strip().lower();files[cur]=[];continue
  if cur is not None:files[cur].append(l.rstrip('\n'))
def libname(n):return re.sub(r'^(\S+ - )+','',n.strip().lower().replace('\\','/'))
def walk(name,M,c0,out,gin=None,lvl=0):
  for l in files[name]:
    p=l.split()
    if len(p)<15 or p[0]!='1':continue
    c=c0 if p[1] in('16',) else p[1];x,y,z=map(float,p[2:5]);R=np.array(list(map(float,p[5:14]))).reshape(3,3);ref=' '.join(p[14:]).lower()
    T=np.eye(4);T[:3,:3]=R;T[:3,3]=[x,y,z];W=M@T
    if ref in files and ref.endswith('.ldr'):
      if lvl==0 and TOP and not any(t in ref for t in TOP):continue
      g2=gin or next((G[k] for k in G if k.startswith('@') and k[1:] in ref),None);walk(ref,W,c,out,g2,lvl+1);continue
    pid=libname(ref);out.append((gin or G.get(pid[:-4],rest),c,W,pid))
key=[k for k in files if sub.lower() in k][0];out=[];walk(key,np.eye(4),'16',out)
grp={}
for g,c,W,pid in out:grp.setdefault(g,[]).append('1 %s %s %s %s'%(c,' '.join('%g'%v for v in W[:3,3]),' '.join('%g'%v for v in W[:3,:3].ravel()),pid))
for g,L in grp.items():
  open(pre+'_'+g+'.ldr','w').write('0 FILE %s\n0 Author: see %s\n0 !LICENSE Redistributable under CCAL version 2.0\n'%(g,mpd)+'\n'.join(L)+'\n');print(g,len(L))
