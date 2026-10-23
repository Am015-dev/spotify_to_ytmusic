// PURPOSE: polish music cues played by context
// FLAG: musicpack (?musicpack=0)
// TEST: musicpack-test.js
/* ---------- MUSICPACK: the 2026-10 polish cues played by context (flag RET.musicpack, default on; ?musicpack=0 = the old music, byte for byte) ----------
   The cues ADD to the old songs, they never replace them. Setting "Music" (SET.mus): mix (default) = old and new together / classic = the old music only (= ?musicpack=0) / new = the pack cues only.
   Mix: stage pool = old and new songs interleaved, a seeded shuffle per run (alternating families, never one of the last 2 songs); boss = old track or boss-dN (~b) by turns; endless = endless / endless2 / endless3 rotate;
   on foot = stage2 and street1 by turns (lock / boss / clear cues are extras); fever cue on every other stage; stingers alternate the old synth sound and the pack file.
   The cues are plain tracks of the existing engine: registered in TR.by (file media/mp-<id>.mp3, listed in media/ready.json), so loading, the 5 stream slots, the iOS unlock, the bar-line cross-fade, the beat grid
   and the mute setting all stay the engine's. A cue whose file is not listed (or fails to load) is simply not registered: the old songs play and nothing errors.
   Contexts: stage = district pools (new cues first, then the old songs; Athens gets athA/athB), boss = boss-dN with its ~b take on every boss phase, endless3 = the last district of the loop (and Ostend from the 2nd loop),
   fever = the cue of the stage's tempo band (combo tier 4 = one band up), pit = pit, on foot = street1 / -lock / -boss(~b) / -clear, stingers = AU.stg buffers (clear, fail, unlock, boss defeat, ...).
   bpm / offset are MEASURED on the encoded files (README prompts are only a target): the pulse and the beat windows follow them. Data: [bpm, offsetMs, seconds, bars, energy per bar, fever band]. ---------- */
if(RET.musicpack===undefined)RET.musicpack=!/[?&]musicpack=0/.test(location.search);
const MP=RET.MP={on:()=>MP.mode()!=='classic',T:{"d1a":[97.99,569,160.59,65,"76666664200000110000000246656666556655566654553569999999999999987",120],"d1b":[129.99,772,203.64,109,"0025888889999999999999999999999999999999999630100000111000036899999999999999999999999999999999999999999999999",120],"d2a":[90.0,2325,274.69,102,"000111222100013433212355678999999999999974101244432234556798888889999999999888896300124543223456789965",128],"d2b":[109.33,914,246.64,111,"000000011221346556787786667777778866677677765566677889977778788899765666778876556777678665566677886645666778530",128],"d3a":[123.99,669,157.85,81,"000012332333334444542113566777778741133434567788989776667522456665566667776665310",128],"d3b":[132.0,1816,150.09,81,"555555677665556788888888888888520012333432469999889999999974479999999999999963000",128],"d4a":[125.99,217,232.29,121,"0000000112211113577666677777777777777777878888888999999999999998878888888888888889999999999999999999999999999999888777743",132],"d4b":[120.0,744,198.76,99,"112222245555565678987677899988863100000245322113477776667999988632221102467666666677665311233432000",132],"athA":[123.35,180,247.2,126,"000000000111345444467888888888988899988999998787778888888888877788888888889876667677877777888888878888888888877777888788878520",120],"athB":[90.0,1934,213.39,79,"0011000001121223333446799999888999998644444456899999888999998644444446899999853",120],"boss-d1":[126.99,1432,238.05,125,"00000000000010101111212111356677777899999999999999999999999631110125777777889999999765666678999999999999999999999999999999953"],"boss-d1~b":[116.0,514,201.22,97,"7777777888899999999999999999999999999996300000036999999999999999999999963025799999999999999753321"],"boss-d2":[110.0,1355,217.15,98,"00000012344444567888888899999999888888852000002589999999999999964355666556899998888999999999999999"],"boss-d2~b":[94.99,560,186.18,73,"4455556678888888999999889999999999999996300000036999999999999997421112211"],"boss-d3":[108.0,499,192.17,86,"00000003577888888889999999999999999999999999988888899999999998999999999999988888888520"],"boss-d3~b":[159.99,921,187.25,124,"1022312343323134533242223566767787777677644453233333323342434355544343224677768887777677744453223343432246777688877776775200"],"boss-d4":[127.99,186,221.43,117,"222222346666666666666666777776677888888888888888888888863000000012212236899999999999999999999999888888888888888885200"],"boss-d4~b":[135.0,139,211.72,119,"00000014688989999999999630011214698999999999999863232325699999999999999987676778999999985323234799999999999999852000000"],"fever-120":[139.99,1460,247.66,143,"00000024677777778888887410111025888888999999998778888888888888888889998520011025888889999999998888999988888888888899998520111036998889999999999"],"fever-128":[127.99,1016,195.09,103,"0000000000000023444455555444555565666666666665410001235799999999999999964112234332211136898888888999888"],"fever-132":[141.33,258,150.7,88,"0000012210012210112468898988888888889999999999889999999999986556799999999999999999898988"],"endless3":[160.01,1252,193.56,128,"00000000000001222222468888888888899888888888888999998877777777899999899999866699999999999999999989999999999989999999999999998510"],"pit":[89.99,75,189.52,71,"00035889899999853011222369999999899999999996312232136999999999999999741"],"street1":[105.0,130,192.03,83,"00000000000112233344556789999999999999999888888888777777665666678999999999999999853"],"street1-lock":[139.99,186,127.01,73,"7777774569999989999999666999995669999999999999666989996669999966699999630"],"street1-boss":[157.99,751,109.41,71,"66666667999999999999999999999986200000112122467999999999999999999999999"],"street1-boss~b":[150.01,165,156.46,97,"0000000001112213599999999999999999999996411112135999989999999999989999964111221368999999999999964"],"street1-clear":[126.0,127,173.69,91,"6789989999999997779999988899999777999996300000003699999888999997879999988899999887999998510"]},ST:['tierup1','tierup2','tierup3','perfect','boss-in','phase','clear','fail','unlock'],
  reg:{},pool:{},dead:{},back:null,fv:false,bph:0,pitPre:false,log:[],ready:null,bp:{},lastBoss:null,fvAlt:0,stOld:{},packSt:{},fbase:null,lastFoot:null,seed:(Math.random()*4294967296)>>>0,cnt:0,lastMode:'mix'};
MP.any=()=>{for(const k in MP.reg)return true;return false;};
MP.mode=()=>!RET.musicpack?'classic':SET.mus==='classic'||SET.mus==='new'?SET.mus:'mix';
if(SET.mus===undefined)SET.mus='mix';DEFS.mus='mix';   // saved with the other settings (mnr_set)
MP.rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
MP.R=()=>MP.rng(MP.seed+(++MP.cnt)*7919)();
MP.reseed=function(){MP.seed=(Math.random()*4294967296)>>>0;MP.cnt=0;MP.bp={};MP.fvAlt=0;MP.fbase=null;DP.sc=null;};
MP.has=k=>!!MP.reg[k]&&!!TR.by[k];
MP.file=k=>'mp-'+k.replace('~','_')+'.mp3';
MP.ctx=()=>{try{return G&&G.live&&G.boss&&!G.boss.mini&&!ST.on?stageFor(G.di,true):stageFor(G.di,false);}catch(e){return null;}};
MP.register=function(list){const rows=[];
  for(const k in MP.T){const t=MP.T[k],f=MP.file(k);if(!list.has(f)||TR.by[k]||MP.dead[k])continue;
    TR.by[k]={file:'../media/'+f,bpm:t[0],offsetMs:t[1],gapMs:24,title:'',stage:k};TR.list.push(TR.by[k]);MP.reg[k]=1;DEF_BPM[k]=t[0];
    SONGM[k]={dur:t[2],bpm:t[0],off:t[1],bars:t[3],e:t[4]};if(t[5]&&!/^(boss|fever|pit|street|endless)/.test(k))MP.pool[k]=1;}
  if(!DP.rows.some(r=>r.k==='athA')){DP.rows.push({k:'athA',bpm:MP.T.athA[0],d:[4]},{k:'athB',bpm:MP.T.athB[0],d:[4]});}   // Athens had no row: its two cues join the pool
  };
// the districts: classic hides the pack cues from the engine's own pool / boss lookups (= the old picks); mix = old and new interleaved; new = pack cues only
{const hv=DP.have;DP.have=function(k){return MP.reg[k]&&MP.mode()==='classic'?false:hv.apply(this,arguments);};
 const po=DP.pool;DP.pool=function(di){const o=po.call(this,di),m=MP.mode();if(m==='classic')return o;const nw=o.filter(k=>MP.pool[k]),od=o.filter(k=>!MP.pool[k]);
  if(m==='new')return nw.length?nw:o;const r=[];for(let i=0;i<Math.max(nw.length,od.length);i++){if(i<od.length)r.push(od[i]);if(i<nw.length)r.push(nw[i]);}return r;};
 // the pick for each step: families (old / new) alternate from a seeded start, each family is a shuffled bag; never one of the last 2 songs, never the same twice in a row
 const pk=DP.pick;DP.pick=function(dis){if(!MP.on()||!MP.any())return pk.apply(this,arguments);const R=MP.rng(MP.seed),out=[],bags={};let f=R()<.5?1:0;
  for(let s=0;s<dis.length;s++){const di=dis[s],p=DP.pool(di),fam=[p.filter(k=>!MP.pool[k]),p.filter(k=>!!MP.pool[k])];let w=f;if(!fam[w].length)w=1-w;f=1-w;
   if(!fam[w].length){out.push(p[0]);continue;}
   const bk=di+':'+w;let bag=bags[bk];if(!bag||!bag.length){bag=fam[w].slice();for(let i=bag.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}bags[bk]=bag;}
   const l2=out.slice(-2),prev=out[s-1];let i=bag.findIndex(k=>!l2.includes(k));if(i<0)i=bag.findIndex(k=>k!==prev);if(i<0)i=0;out.push(bag.splice(i,1)[0]);
   if(bags[bk]&&!bags[bk].length)delete bags[bk];}
  return out;};
 // story stages (owner 22 Oct: "you mixed up the selections very badly"): the song of a stage no longer changes between loads or while the pack registers.
 // Classic = the stage's original song (s.song0). Mix = the stage keeps its own song until it is cleared; a replay of a cleared stage plays a new pack song of its district (fixed per stage, never the stage's own). New = pack pool with a fixed seed.
 {const ds=DP.stage;DP.stage=function(n){const s=STAGES[n-1];if(!s||!s.song0)return ds.apply(this,arguments);const m=MP.mode(),own=s.song0;
   if(m==='classic'||!MP.any())return own;
   if(m==='new'){const sv=MP.seed;MP.seed=0x2f6e2b1;try{return ds.apply(this,arguments);}finally{MP.seed=sv;}}
   if(!(typeof sSave!=="undefined"&&sSave.stars[n]>0))return own;
   const nw=DP.pool(s.di).filter(k=>MP.pool[k]&&k!==own);return nw.length?nw[n%nw.length]:own;};}
 // endless (loop 2+): the last three districts take endless / endless2 / endless3 in turn (a shuffle per loop), the others their pool
 const eo=DP.endless;DP.endless=function(di,loop){if(MP.on()&&MP.has('endless3')&&loop>=1){const p=posOf(di);if(p>=2){
   if(MP.mode()==='new')return 'endless3';
   const T=['endless','endless2','endless3'].filter(k=>TR.by[k]),R=MP.rng(MP.seed+loop*131);for(let i=T.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[T[i],T[j]]=[T[j],T[i]];}
   let k=T[(p-2)%T.length];const pv=p>=1?DP.endless(ORDER[p-1],loop):'';if(k===pv)k=T[(p-1)%T.length];return k;}}
  return eo.apply(this,arguments);};
 // bosses: each boss entry takes the old track or boss-dN (+ its ~b take on the phases) by turns, the first one at random; the pick is kept from the preload to the fight
 const bo=DP.boss;DP.boss=function(k){if(!MP.on())return bo.call(this,k);const a=DP.bossT[k];if(!a)return null;
  const nw=a.find(s=>MP.reg[s]&&TR.by[s]),od=a.find(s=>!MP.T[s]&&(DP.have(s)||/^boss\d?$/.test(s)));if(!nw||!od)return bo.call(this,k);
  if(MP.mode()==='new')return nw;if(MP.bp[k]===undefined){MP.bp[k]=MP.lastBoss===null?MP.R()<.5:!MP.lastBoss;MP.lastBoss=MP.bp[k];}return MP.bp[k]?nw:od;};
 NR.on('runStart',()=>{MP.bp={};});
 NR.on('stageClear',()=>{MP.fvAlt++;MP.bp={};});
 {const ng=newGame;newGame=function(){if(!ST.on)MP.reseed();return ng.apply(this,arguments);};}}
// ready.json lists the files that really exist; nothing is registered before it is read (a failed read = the old music)
if(RET.musicpack&&location.protocol!=='file:')fetch('media/ready.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(j=>{if(!Array.isArray(j))return;MP.ready=new Set(j.filter(x=>typeof x==='string'&&/^mp-.*\.mp3$/.test(x)));MP.register(MP.ready);}).catch(()=>{});
// a cue that listed but fails to load is dropped, and the song of the context takes over
setInterval(()=>{const m=MP.mode();if(m!==MP.lastMode){MP.lastMode=m;MP.bp={};DP.sc=null;}if(!MP.on())return;for(const k in MP.reg){const i=TR.by[k];if(!i||!TR.bad[i.file])continue;
  delete TR.by[k];delete MP.reg[k];delete MP.pool[k];MP.dead[k]=1;const j=TR.list.indexOf(i);if(j>=0)TR.list.splice(j,1);MP.log.push('dead '+k);
  if(running&&(BT.stage===k||AU.want===k||(BT.pend&&BT.pend.v.stage===k))){const c=MP.ctx();if(c&&c!==k)AU.startStage(c);}}},1000);
const mpBand=()=>{const t=MP.T[BT.stage],b=t&&t[5]?t[5]:[120,128,132].reduce((a,x)=>Math.abs(x-BT.bpm)<Math.abs(a-BT.bpm)?x:a,120),bands=[120,128,132],i=Math.min(2,bands.indexOf(b)+((AU.tier|0)>=4?1:0));return bands[i];};
MP.feverKey=()=>'fever-'+mpBand();
MP.feverOK=()=>MP.mode()==='new'||MP.fvAlt%2===0;   // mix: the old fever behaviour (the song stays) on one stage, the fever cue on the next
// fever: the cue of the stage's tempo band while FEVER is armed / on; back to the song that played before when it ends
NR.on('beat',()=>{if(!MP.on()||!running)return;const f=!!AU.fever;
  if(f&&!MP.fv){MP.fv=true;if(MP.feverOK()&&!G.boss&&BT.stage&&!/^fever|^pit/.test(BT.stage)){const k=MP.feverKey();if(MP.has(k)){MP.back=BT.stage;AU.switchTo(k);}}}
  else if(!f&&MP.fv){MP.fv=false;if(MP.back&&(/^fever/.test(BT.stage)||/^fever/.test(AU.want||'')||(BT.pend&&/^fever/.test(BT.pend.v.stage)))){const b=MP.back;MP.back=null;AU.switchTo(TR.by[b]?b:(MP.ctx()||b));}MP.back=null;}});
NR.on('tier',d=>{if(MP.on()&&d&&d.tier>=3&&running&&!MP.fv){const k=MP.feverKey();if(MP.feverOK()&&MP.has(k))loadTrack(k);}});   // the next cue only: fever is next once the combo is high
// bosses: boss-dN on entry (the engine switches), its ~b take on every phase change, a/b alternating
NR.on('bossIn',d=>{MP.bph=0;});
NR.on('bossPhase',()=>{if(!MP.on()||!running)return;const cur=AU.want||(BT.pend&&BT.pend.v.stage)||BT.stage||'',base=cur.replace('~b','');
  if(!/^boss-d\d$/.test(base)||!MP.has(base+'~b'))return;MP.bph++;AU.switchTo(MP.bph%2?base+'~b':base);});
NR.on('kill',d=>{if(!MP.on()||!d||!d.boss||!d.e||d.e.mini)return;MP.bp={};MP.fvAlt++;
  if(!ST.on&&RET.sting)AU.sting('clear');                               // boss defeated (story stages fire stageClear themselves)
  if(!ST.on&&MP.has('pit')&&!MP.pitPre){MP.pitPre=true;loadTrack('pit');}});   // the pit stop follows: preload its cue
NR.on('runStart',()=>{MP.pitPre=false;MP.fv=false;MP.back=null;if(MP.on())for(const n of MP.ST)MP.loadSt(n);});
NR.on('weaponUp',()=>{if(MP.on()&&RET.sting)AU.sting('unlock');});
// pit stop
NR.on('pitStart',()=>{if(!MP.on()||!running||!MP.has('pit')||BT.stage==='pit')return;MP.back=(BT.pend&&BT.pend.v.stage)||BT.stage||MP.ctx();AU.switchTo('pit');});
{const cl=SH.close;SH.close=function(){const was=this.active,r=cl.apply(this,arguments);
  if(was&&MP.on()){const tg=(BT.pend&&BT.pend.v.stage)||AU.want||BT.stage;if(tg==='pit'){const b=MP.back;MP.back=null;AU.switchTo(b&&b!=='pit'&&TR.by[b]?b:(MP.ctx()||'stage1'));}}return r;};}
// stingers: decoded once into the engine's own buffer table (AU.stg), tiny mono files; a miss keeps the synth stand-in
MP.loadSt=function(n){const a=AU.a;if(!a||!MP.ready||!MP.ready.has('mp-st-'+n+'.mp3')||AU.stg[n]!==undefined)return;AU.stg[n]=0;
  try{fetch('media/mp-st-'+n+'.mp3').then(r=>r.ok?r.arrayBuffer():null).then(b=>b?a.decodeAudioData(b):null).then(buf=>{if(buf){AU.stg[n]=buf;MP.packSt[n]=buf;}}).catch(()=>{});}catch(e){}};
// the old sound of an event is the engine's synth: mix plays it and the pack file by turns, classic only the synth, new only the file
{const so=AU.sting;AU.sting=function(n){const m=MP.mode();if(m!=='classic')MP.loadSt(n);
  const had=AU.stg[n],pack=!!had&&had===MP.packSt[n],old=pack&&(m==='classic'||(m==='mix'&&MP.stOld[n]));if(old)AU.stg[n]=0;
  let r;try{r=so.apply(this,arguments);}finally{if(old)AU.stg[n]=had;}
  if(r&&m==='mix'&&pack)MP.stOld[n]=!MP.stOld[n];return r;};}
// on foot: the run plays stage2 or street1 by turns (new only: street1); lock / boss (a/b per boss phase) / clear are extras, read from the stage state twice a second
MP.foot=function(){const F=window.FOOT;if(!MP.on()||!F||!F.on||!F.S||!sndOn('f_mcue'))return;   // Lab SOUND > ON FOOT: the song switches are off unless switched onconst S=F.S;
  let k=S.end&&S.end.cleared?'street1-clear':S.bossOn||S.boss?'street1-boss':S.lock?'street1-lock':MP.fbase||'street1';
  if(k==='street1-boss'&&MP.fb)k='street1-boss~b';
  if(!(k==='stage2'?TR.by.stage2:MP.has(k))||MP.fk===k)return;MP.fk=k;loadTrack(k);AU.startStage(k);};
NR.on('footStart',d=>{MP.fk=null;MP.fb=0;if(RET.streetsong&&window.FOOT&&FOOT.S&&FOOT.S.st&&FOOT.S.st.s3)return;if(!MP.on()||!MP.has('street1')||!sndOn('f_mcue'))return;
  if(!(d&&d.cp)||!MP.fbase){const nw=MP.mode()==='new'||(MP.lastFoot===null?MP.R()<.5:!MP.lastFoot);MP.lastFoot=nw;MP.fbase=nw?'street1':'stage2';}
  MP.fk=MP.fbase;if(MP.fbase==='street1')AU.startStage('street1');});   // stage2 is what the stage already started
NR.on('footPhase',()=>{MP.fb=MP.fb?0:1;MP.fk=null;});
setInterval(MP.foot,500);
window.__mp=MP;
