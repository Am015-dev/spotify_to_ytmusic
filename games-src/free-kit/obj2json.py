import sys,json,glob,os,re
out={}
for p in glob.glob('raw/x/*/*/OBJ/*.obj'):
    name=os.path.basename(p)[:-4].replace(' ','_').lower()
    mtl={}
    mp=p[:-4]+'.mtl'
    if os.path.exists(mp):
        cur=None
        for l in open(mp):
            t=l.split()
            if not t: continue
            if t[0]=='newmtl': cur=t[1]
            elif t[0]=='Kd' and cur: mtl[cur]=[float(x) for x in t[1:4]]
    V=[];pos=[];col=[];c=[.7,.7,.7]
    for l in open(p):
        t=l.split()
        if not t: continue
        if t[0]=='v': V.append([float(x) for x in t[1:4]])
        elif t[0]=='usemtl': c=mtl.get(t[1],[.7,.7,.7])
        elif t[0]=='f':
            idx=[int(x.split('/')[0])-1 for x in t[1:]]
            for i in range(1,len(idx)-1):
                for k in (idx[0],idx[i],idx[i+1]): pos+=V[k]; col+=c
    out[name]={'pos':pos,'col':col}
    print(name,len(pos)//9,'tris',len(mtl),'mats')
json.dump(out,open('raw/animals.json','w'))
