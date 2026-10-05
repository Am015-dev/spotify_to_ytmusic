# pV84_3 · rings: roaming rings/gates ~70 % fewer, at most 3 markers on screen. Event gates/rings only exist while the event runs (OG_start builds them).
# was OG_N=10 markers, one event spot per 105 m; now 3 markers, spacing 190 m (area ~ 1/3.3), fix-up cover 125 -> 230 m.
exec(open('P.py').read())
R("const OG_N=10,OG_R=105,OG_FADE=[150,270];","const OG_N=3,OG_R=190,OG_FADE=[120,210];")
R("for(let pass=0;pass<2;pass++)for(const s of smp){if(nearest(s[0],s[1],125))continue;let b=null,bd=1e9;for(const q of smp){const d=(q[0]-s[0])**2+(q[1]-s[1])**2;if(d<bd&&d<130*130&&ok(q[0],q[1])&&!nearest(q[0],q[1],45)){bd=d;b=q}}if(b)addEv(b)}",
  "for(let pass=0;pass<2;pass++)for(const s of smp){if(nearest(s[0],s[1],240))continue;let b=null,bd=1e9;for(const q of smp){const d=(q[0]-s[0])**2+(q[1]-s[1])**2;if(d<bd&&d<250*250&&ok(q[0],q[1])&&!nearest(q[0],q[1],110)){bd=d;b=q}}if(b)addEv(b)}")
save()
