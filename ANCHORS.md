# ANCHORS — seamless Athens (pSM1–pSM6)
Base: `overdrive.html` of branch alex/od-release-82. Apply order: pSM1 pSM2 pSM3 pSM4 pSM5 pSM6 (last). Every anchor below is an exact string with count 1 at its turn.

## pSM1.py
- `const ATHD=(()=>{`
- `function athDistCfg(){const R=ATH_DIST[ATHD].r,`
- `const inCity=(x,z,m=0)=>x>HX0-m&&x<HX1+m&&z>HZT-m&&z<HZN+m;`
- `if(!pts.some(([x,z])=>x>WX0&&x<WX1&&z>WZS&&z<WZN))continue;`
- `const TR_SET=(TR_DATA[CID==='fra'?'fra':'ath'+ATHD]||{})`
- `function TR_real(e,n){`
- `if(r[0]>HX0-60&&r[1]<HX1+60&&r[2]>HZS-60&&r[3]<HZN+60)continue;`
- `[oe,on]=RW(o.x,o.z),to=athDistAt(oe,on);if(!to||to===ATHD)continue;`
- `typeof ATHD!=='undefined'&&ATHD>'B'`
- `return A.filter(s=>athIn(ATHD,...RW(s[0],s[1])))`
- `RO.gbs=spots.slice(0,30)`
- `function roamCatalog(){const GL=GARAGES.filter(g=>CID==='fra'||(g.x==null?ATHD==='A':athIn(ATHD,...RW(g.x,g.z))))`
- `if(CID!=='fra')return ATHD==='A'?[...GL,FL]:GL`
- `function athDistStep(){`
- `function athDistPick(d){`
- `function PIN_away(){`
- `{g.save();g.beginPath();g.rect(0,0,W,Hh);for(const r of ATH_DIST[ATHD].r)`
- `g.fillText(d+' · '+D.name.toUpperCase()+' ▶',tx,tz)`
- `function ATC_mkMark(id){const D=ATC_DEF[id],a=D.d0===ATHD`
- `if(ATC_DEF[id].d0===ATHD)ATC_mkMark(id)`
- `if(D.d0!==ATHD)return{ic:'🗺'`
- `if(D.d0!==ATHD){const L=qvPreview(m)`
- `function ATC_gateSetup(ch,S){const G=(HUB.gates||[])`
- `function ATC_transfer(ch,S){`
- `fm||RO.marks.find(m=>m.kind==='garage')`
- `athGates:()=>HUB.gates||[]`
- `window.__mho={`
- `typeof ATHD!=='undefined'&&ATHD>'B'` (first of 2 sites, via `s.replace(...,1)`)

## pSM2.py
- `let TR_sst=0;`

## pSM3.py
- `async function roamLoad(atMark){`
- `ldSet(.8,'Painting the sky');await nextFrame();await ldPrewarm(.82,.98);`
- `window.__mho={`

## pSM4.py
- `mat=def.mat||new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5,metalness:.08})`

## pSM5.py
- `async function SM_upload(a,b){`
- `await ldPrewarm(.82,.95);await SM_upload(.95,.99);`
- `function propRespawn(dt){for(const p of HUB.props){`
- `p.alive=true;_m.compose(V3(p.x,p.y,p.z),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),p.ry),_ts.set(1,1,1));p.im.set`
- `function hubCullStep(){if(!HUB.cull)hubCullInit();`

## pSM6.py
- `async function SM_qvLoad(a,b){`
- `try{if(!MINI&&HUB.built){const t1=performance.now();MINI=miniBase();SM3.miniMs=Math.round(performance.now()-t1)}}catch(e`
- `inC=RO.x-HX0>rr&&HX1-RO.x>rr&&RO.z-HZT>rr&&HZN-RO.z>rr;`
- `window.__sm3=SM3;`

Anchors that other patches also use: `window.__mho={` (pSM1 test hooks), `async function roamLoad(atMark){` (pSM3), `function propRespawn`, `function hubCullStep` (pSM5).
