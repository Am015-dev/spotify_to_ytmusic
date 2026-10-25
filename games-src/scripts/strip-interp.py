#!/usr/bin/env python3
# Expand a sprite strip with computed in-between frames (optical flow, no new art). Prototype used for the owner review of 25 Oct:
#   python3 games-src/scripts/strip-interp.py <who> <act> <k in-betweens per pair> <outdir>   (run from the repo root; needs opencv-python-headless)
# Writes a before/after PNG and old/new GIFs only. Originals are never touched; a worker builds the real strips from the same functions.
from PIL import Image
def split(path,n,w,h):
    im=np.array(Image.open(path).convert('RGBA')).astype(np.float32)/255
    return [im[:,i*w:(i+1)*w] for i in range(n)]
def pm(f): a=f[...,3:4]; return np.concatenate([f[...,:3]*a,a],-1)
def unpm(f): a=np.clip(f[...,3:4],0,1); rgb=np.where(a>1e-3,f[...,:3]/np.maximum(a,1e-3),0); return np.concatenate([np.clip(rgb,0,1),a],-1)
def gray(f): 
    g=0.6*(0.299*f[...,0]+0.587*f[...,1]+0.114*f[...,2])+0.4*f[...,3]
    return (np.clip(g,0,1)*255).astype(np.uint8)
def mid(a,b,t):
    A,B=pm(a),pm(b);h,w=A.shape[:2]
    dis=cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    F=dis.calc(gray(A),gray(B),None)
    gx,gy=np.meshgrid(np.arange(w,dtype=np.float32),np.arange(h,dtype=np.float32))
    m0=cv2.remap(A,gx-t*F[...,0],gy-t*F[...,1],cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT)
    m1=cv2.remap(B,gx+(1-t)*F[...,0],gy+(1-t)*F[...,1],cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT)
    return unpm((1-t)*m0+t*m1)
def expand(frames,k,loop=True):
    out=[];n=len(frames)
    for i in range(n):
        out.append(frames[i])
        if i==n-1 and not loop: break
        j=(i+1)%n
        for s in range(1,k+1): out.append(mid(frames[i],frames[j],s/(k+1)))
    return out
def onwhite(f): a=f[...,3:4]; return (np.concatenate([f[...,:3]*a+(1-a),np.ones_like(a)],-1)*255).astype(np.uint8)
if __name__=='__main__':
    who,act,k=sys.argv[1],sys.argv[2],int(sys.argv[3]); sp=sys.argv[4]
    j=json.load(open(f'games-src/anims/mainhattan-nightrun/sheets/{who}/{act}-strip.json'))
    fr=split(f'games/mainhattan-nightrun/media/anim/{who}/{act}-strip.webp',j['frames'],j['w'],j['h'])
    new=expand(fr,k,loop=act in('idle','run','hover','flame','loop','spin'))
    sc=2
    def sheet(L): return np.concatenate([cv2.resize(onwhite(f),None,fx=sc,fy=sc,interpolation=cv2.INTER_CUBIC) for f in L],1)
    old_s,new_s=sheet(fr),sheet(new)
    W=max(old_s.shape[1],new_s.shape[1]);H=old_s.shape[0]
    canvas=np.full((H*2+10,W,3),255,np.uint8);canvas[:H,:old_s.shape[1]]=old_s[...,:3];canvas[H+10:,:new_s.shape[1]]=new_s[...,:3]
    Image.fromarray(canvas).save(f'{sp}/{who}-{act}-{k}.png')
    gif=lambda L,fps,p:[Image.fromarray(onwhite(f)[...,:3]).resize((j['w']*sc,j['h']*sc)) for f in L][0].save(p,save_all=True,append_images=[Image.fromarray(onwhite(f)[...,:3]).resize((j['w']*sc,j['h']*sc)) for f in L][1:],duration=int(1000/fps),loop=0)
    gif(fr,j['fps'],f'{sp}/{who}-{act}-old.gif');gif(new,j['fps']*(k+1),f'{sp}/{who}-{act}-new.gif')
    print(who,act,len(fr),'->',len(new),'frames @',j['fps'],'->',j['fps']*(k+1),'fps')
