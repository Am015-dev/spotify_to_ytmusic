# pSM5: per-frame costs that grew with the one-map Athens (235k props, 13k cull entries, 34k street nodes) stay flat:
# - the GPS street graph (qvGraphGen) and the minimap base are finished inside the loading screen (time-sliced, with the
#   loading bar), not on the first driving frame (that was an 8 s freeze right after the loader in the seamless build);
# - propRespawn walks the prop list in strides (each prop every K frames with K x dt) instead of all 235k props per frame;
# - hubCullStep re-tests 1/8 of the cull list per frame (same 8-frame period as before), a full pass only after a jump.
# All three are no-ops for small maps (Frankfurt, split districts) except the loader work, which only moves earlier.
exec(open('P.py').read())
R("async function SM_upload(a,b){","""async function SM_qvLoad(a,b){const N=HUB.nodes;if(!N||!N.length||(QV.g&&QV.g.N===N))return;if(!QV.gi||QV.giN!==N){QV.gi=qvGraphGen(N);QV.giN=N}
  let t=performance.now();const t0=t;while(!(QV.g&&QV.g.N===N)){if(QV.gi.next().done)break;if(performance.now()-t>12){ldSet(a+(b-a)*Math.min(1,(performance.now()-t0)/6000),'Mapping every street');await nextFrame();t=performance.now()}}
  SM3.qvMs=Math.round(performance.now()-t0);try{if(!MINI&&HUB.built){const t1=performance.now();MINI=miniBase();SM3.miniMs=Math.round(performance.now()-t1)}}catch(e){}}
async function SM_upload(a,b){""")
R("await ldPrewarm(.82,.95);await SM_upload(.95,.99);","await SM_qvLoad(.82,.86);await ldPrewarm(.86,.95);await SM_upload(.95,.99);")
R("function propRespawn(dt){for(const p of HUB.props){","""function propRespawn(dt){const PP=HUB.props;if(PP.length>20000){const K=Math.ceil(PP.length/12000),o=HUB.prK=((HUB.prK||0)+1)%K,d=dt*K;
    for(let i=o;i<PP.length;i+=K){const p=PP[i];if(p.alive)continue;p.rt-=d;if(p.rt<=0&&Math.hypot(p.x-RO.x,p.z-RO.z)>80)propRevive(p)}return}
  for(const p of PP){""")
R("p.alive=true;_m.compose(V3(p.x,p.y,p.z),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),p.ry),_ts.set(1,1,1));p.im.setMatrixAt(p.i,_m);",
  "propRevive(p)}}}\nfunction propRevive(p){{{p.alive=true;_m.compose(V3(p.x,p.y,p.z),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),p.ry),_ts.set(1,1,1));p.im.setMatrixAt(p.i,_m);")
R("function hubCullStep(){if(!HUB.cull)hubCullInit();","""function hubCullStep(){if(!HUB.cull)hubCullInit();if(HUB.cull.length>4000){const C=HUB.cull,cx=camera.position.x,cz=camera.position.z,R2=SET.q==='high'?2100:1600,
    jump=!HUB.cpos||Math.hypot(cx-HUB.cpos[0],cz-HUB.cpos[1])>150,f=HUB.cf=((HUB.cf||0)+1)%8;if(jump)HUB.cpos=[cx,cz];else if(f===0)HUB.cpos=[cx,cz];
    for(let i=jump?0:f;i<C.length;i+=jump?1:8){const c=C[i];c.o.visible=Math.hypot(c.x-cx,c.z-cz)-c.r<(c.o.userData.cd||(c.small?750:R2))}return}""")
save()
