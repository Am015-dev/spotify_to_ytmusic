import json,os,sys,urllib.request
API='https://api.polyhaven.com'
import subprocess
def J(u): return json.loads(subprocess.run(['curl','-sSfL','-m','60','-A','Mozilla/5.0',u],check=True,capture_output=True).stdout)
def get(u,dest):
    os.makedirs(os.path.dirname(dest),exist_ok=True)
    if os.path.exists(dest): return
    import subprocess;subprocess.run(['curl','-sSfL','-m','120','-A','Mozilla/5.0','-o',dest,u],check=True)
def model(name,res='2k'):
    d=J(f'{API}/files/{name}')
    g=d['gltf'][res]['gltf']
    base=f'assets/models/{name}/'
    get(g['url'],base+os.path.basename(g['url']))
    for p,i in g['include'].items(): get(i['url'],base+p)
    info=J(f'{API}/info/{name}')
    json.dump(info,open(base+'info.json','w'),indent=1)
    print('model',name,os.path.basename(g['url']))
def tex(name,res='2k',maps=('Diffuse','nor_gl','Rough')):
    d=J(f'{API}/files/{name}')
    base=f'assets/tex/{name}/'
    for m in maps:
        if m in d:
            u=d[m][res]['jpg']['url'];get(u,base+m+'.jpg')
    info=J(f'{API}/info/{name}')
    json.dump(info,open(base+'info.json','w'),indent=1)
    print('tex',name)
def hdri(name,res='1k'):
    d=J(f'{API}/files/{name}')
    u=d['hdri'][res]['hdr']['url'];get(u,f'assets/hdri/{name}_{res}.hdr')
    info=J(f'{API}/info/{name}')
    json.dump(info,open(f'assets/hdri/{name}.json','w'),indent=1)
    print('hdri',name)
if __name__=='__main__':
    kind=sys.argv[1]
    for n in sys.argv[2:]:
        {'model':model,'tex':tex,'hdri':hdri}[kind](n)
