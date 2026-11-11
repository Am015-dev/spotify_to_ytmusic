import sys,subprocess,numpy as np,imageio_ffmpeg,glob,os
FF=imageio_ffmpeg.get_ffmpeg_exe()
def load(f,sr=22050):
    b=subprocess.run([FF,'-v','quiet','-i',f,'-ac','1','-ar',str(sr),'-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(b,np.float32)
def contour(x,sr=22050):
    n=2048;h=512;P=[];E=[]
    for i in range(0,len(x)-n,h):
        w=x[i:i+n]*np.hanning(n);S=np.abs(np.fft.rfft(w));E.append((w**2).mean())
        f=np.fft.rfftfreq(n,1/sr);m=(f>80)&(f<2000);P.append(f[m][S[m].argmax()])
    return np.array(P),np.array(E)
for f in sorted(glob.glob(sys.argv[1])):
    x=load(f);P,E=contour(x);act=E>E.max()*0.05
    p=P[act];
    if len(p)<4: continue
    k=max(1,len(p)//4)
    a=np.median(p[:k]);z=np.median(p[-k:])
    print(f"{os.path.basename(f):22s} {len(x)/22050:5.2f}s start~{a:6.0f}Hz end~{z:6.0f}Hz ratio {z/a:4.2f} {'UP' if z/a>1.12 else 'DOWN' if z/a<0.89 else '='}")
