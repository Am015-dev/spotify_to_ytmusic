/* ---------- MUSICPACK: the 2026-10 polish cues played by context (flag RET.musicpack, default on; ?musicpack=0 = the old music, byte for byte) ----------
   The cues are plain tracks of the existing engine: registered in TR.by (file media/mp-<id>.mp3, listed in media/ready.json), so loading, the 5 stream slots, the iOS unlock, the bar-line cross-fade, the beat grid
   and the mute setting all stay the engine's. A cue whose file is not listed (or fails to load) is simply not registered: the old songs play and nothing errors.
   Contexts: stage = district pools (new cues first, then the old songs; Athens gets athA/athB), boss = boss-dN with its ~b take on every boss phase, endless3 = the last district of the loop (and Ostend from the 2nd loop),
   fever = the cue of the stage's tempo band (combo tier 4 = one band up), pit = pit, on foot = street1 / -lock / -boss(~b) / -clear, stingers = AU.stg buffers (clear, fail, unlock, boss defeat, ...).
   bpm / offset are MEASURED on the encoded files (README prompts are only a target): the pulse and the beat windows follow them. Data: [bpm, offsetMs, seconds, bars, energy per bar, fever band]. ---------- */
if(RET.musicpack===undefined)RET.musicpack=!/[?&]musicpack=0/.test(location.search);
const MP=RET.MP={on:()=>!!RET.musicpack,T:{"d1a":[97.99,569,160.59,65,"76666664200000110000000246656666556655566654553569999999999999987",120],"d1b":[129.99,772,203.64,109,"0025888889999999999999999999999999999999999630100000111000036899999999999999999999999999999999999999999999999",120],"d2a":[90.0,2325,274.69,102,"000111222100013433212355678999999999999974101244432234556798888889999999999888896300124543223456789965",128],"d2b":[109.33,914,246.64,111,"000000011221346556787786667777778866677677765566677889977778788899765666778876556777678665566677886645666778530",128],"d3a":[123.99,669,157.85,81,"000012332333334444542113566777778741133434567788989776667522456665566667776665310",128],"d3b":[132.0,1816,150.09,81,"555555677665556788888888888888520012333432469999889999999974479999999999999963000",128],"d4a":[125.99,217,232.29,121,"0000000112211113577666677777777777777777878888888999999999999998878888888888888889999999999999999999999999999999888777743",132],"d4b":[120.0,744,198.76,99,"112222245555565678987677899988863100000245322113477776667999988632221102467666666677665311233432000",132],"athA":[123.35,180,247.2,126,"000000000111345444467888888888988899988999998787778888888888877788888888889876667677877777888888878888888888877777888788878520",120],"athB":[90.0,1934,213.39,79,"0011000001121223333446799999888999998644444456899999888999998644444446899999853",120],"boss-d1":[126.99,1432,238.05,125,"00000000000010101111212111356677777899999999999999999999999631110125777777889999999765666678999999999999999999999999999999953"],"boss-d1~b":[116.0,514,201.22,97,"7777777888899999999999999999999999999996300000036999999999999999999999963025799999999999999753321"],"boss-d2":[110.0,1355,217.15,98,"00000012344444567888888899999999888888852000002589999999999999964355666556899998888999999999999999"],"boss-d2~b":[94.99,560,186.18,73,"4455556678888888999999889999999999999996300000036999999999999997421112211"],"boss-d3":[108.0,499,192.17,86,"00000003577888888889999999999999999999999999988888899999999998999999999999988888888520"],"boss-d3~b":[159.99,921,187.25,124,"1022312343323134533242223566767787777677644453233333323342434355544343224677768887777677744453223343432246777688877776775200"],"boss-d4":[127.99,186,221.43,117,"222222346666666666666666777776677888888888888888888888863000000012212236899999999999999999999999888888888888888885200"],"boss-d4~b":[135.0,139,211.72,119,"00000014688989999999999630011214698999999999999863232325699999999999999987676778999999985323234799999999999999852000000"],"fever-120":[139.99,1460,247.66,143,"00000024677777778888887410111025888888999999998778888888888888888889998520011025888889999999998888999988888888888899998520111036998889999999999"],"fever-128":[127.99,1016,195.09,103,"0000000000000023444455555444555565666666666665410001235799999999999999964112234332211136898888888999888"],"fever-132":[141.33,258,150.7,88,"0000012210012210112468898988888888889999999999889999999999986556799999999999999999898988"],"endless3":[160.01,1252,193.56,128,"00000000000001222222468888888888899888888888888999998877777777899999899999866699999999999999999989999999999989999999999999998510"],"pit":[89.99,75,189.52,71,"00035889899999853011222369999999899999999996312232136999999999999999741"],"street1":[105.0,130,192.03,83,"00000000000112233344556789999999999999999888888888777777665666678999999999999999853"],"street1-lock":[139.99,186,127.01,73,"7777774569999989999999666999995669999999999999666989996669999966699999630"],"street1-boss":[157.99,751,109.41,71,"66666667999999999999999999999986200000112122467999999999999999999999999"],"street1-boss~b":[150.01,165,156.46,97,"0000000001112213599999999999999999999996411112135999989999999999989999964111221368999999999999964"],"street1-clear":[126.0,127,173.69,91,"6789989999999997779999988899999777999996300000003699999888999997879999988899999887999998510"]},ST:['tierup1','tierup2','tierup3','perfect','boss-in','phase','clear','fail','unlock'],
  reg:{},pool:{},dead:{},back:null,fv:false,bph:0,pitPre:false,log:[],ready:null};
MP.has=k=>!!MP.reg[k]&&!!TR.by[k];
MP.file=k=>'mp-'+k.replace('~','_')+'.mp3';
MP.ctx=()=>{try{return G&&G.live&&G.boss&&!G.boss.mini&&!ST.on?stageFor(G.di,true):stageFor(G.di,false);}catch(e){return null;}};
MP.register=function(list){const rows=[];
  for(const k in MP.T){const t=MP.T[k],f=MP.file(k);if(!list.has(f)||TR.by[k]||MP.dead[k])continue;
    TR.by[k]={file:'../media/'+f,bpm:t[0],offsetMs:t[1],gapMs:24,title:'',stage:k};TR.list.push(TR.by[k]);MP.reg[k]=1;DEF_BPM[k]=t[0];
    SONGM[k]={dur:t[2],bpm:t[0],off:t[1],bars:t[3],e:t[4]};if(t[5]&&!/^(boss|fever|pit|street|endless)/.test(k))MP.pool[k]=1;}
  if(!DP.rows.some(r=>r.k==='athA')){DP.rows.push({k:'athA',bpm:MP.T.athA[0],d:[4]},{k:'athB',bpm:MP.T.athB[0],d:[4]});}   // Athens had no row: its two cues join the pool
  };
// the district pool: pack cues first (a stage takes the next pool song), then the songs of before
{const po=DP.pool;DP.pool=function(di){const o=po.call(this,di);if(!MP.on())return o;return o.filter(k=>MP.pool[k]).concat(o.filter(k=>!MP.pool[k]));};
 const eo=DP.endless;DP.endless=function(di,loop){if(MP.on()&&MP.has('endless3')){const p=posOf(di);if(p===4||(loop>=1&&p===2))return 'endless3';}return eo.apply(this,arguments);};}
// ready.json lists the files that really exist; nothing is registered before it is read (a failed read = the old music)
if(RET.musicpack&&location.protocol!=='file:')fetch('media/ready.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(j=>{if(!Array.isArray(j))return;MP.ready=new Set(j.filter(x=>typeof x==='string'&&/^mp-.*\.mp3$/.test(x)));MP.register(MP.ready);}).catch(()=>{});
// a cue that listed but fails to load is dropped, and the song of the context takes over
setInterval(()=>{if(!MP.on())return;for(const k in MP.reg){const i=TR.by[k];if(!i||!TR.bad[i.file])continue;
  delete TR.by[k];delete MP.reg[k];delete MP.pool[k];MP.dead[k]=1;const j=TR.list.indexOf(i);if(j>=0)TR.list.splice(j,1);MP.log.push('dead '+k);
  if(running&&(BT.stage===k||AU.want===k||(BT.pend&&BT.pend.v.stage===k))){const c=MP.ctx();if(c&&c!==k)AU.startStage(c);}}},1000);
const mpBand=()=>{const t=MP.T[BT.stage],b=t&&t[5]?t[5]:[120,128,132].reduce((a,x)=>Math.abs(x-BT.bpm)<Math.abs(a-BT.bpm)?x:a,120),bands=[120,128,132],i=Math.min(2,bands.indexOf(b)+((AU.tier|0)>=4?1:0));return bands[i];};
MP.feverKey=()=>'fever-'+mpBand();
// fever: the cue of the stage's tempo band while FEVER is armed / on; back to the song that played before when it ends
NR.on('beat',()=>{if(!MP.on()||!running)return;const f=!!AU.fever;
  if(f&&!MP.fv){MP.fv=true;if(!G.boss&&BT.stage&&!/^fever|^pit/.test(BT.stage)){const k=MP.feverKey();if(MP.has(k)){MP.back=BT.stage;AU.switchTo(k);}}}
  else if(!f&&MP.fv){MP.fv=false;if(MP.back&&(/^fever/.test(BT.stage)||/^fever/.test(AU.want||'')||(BT.pend&&/^fever/.test(BT.pend.v.stage)))){const b=MP.back;MP.back=null;AU.switchTo(TR.by[b]?b:(MP.ctx()||b));}MP.back=null;}});
NR.on('tier',d=>{if(MP.on()&&d&&d.tier>=3&&running&&!MP.fv){const k=MP.feverKey();if(MP.has(k))loadTrack(k);}});   // the next cue only: fever is next once the combo is high
// bosses: boss-dN on entry (the engine switches), its ~b take on every phase change, a/b alternating
NR.on('bossIn',d=>{MP.bph=0;});
NR.on('bossPhase',()=>{if(!MP.on()||!running)return;const cur=AU.want||(BT.pend&&BT.pend.v.stage)||BT.stage||'',base=cur.replace('~b','');
  if(!/^boss-d\d$/.test(base)||!MP.has(base+'~b'))return;MP.bph++;AU.switchTo(MP.bph%2?base+'~b':base);});
NR.on('kill',d=>{if(!MP.on()||!d||!d.boss||!d.e||d.e.mini)return;
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
  try{fetch('media/mp-st-'+n+'.mp3').then(r=>r.ok?r.arrayBuffer():null).then(b=>b?a.decodeAudioData(b):null).then(buf=>{if(buf)AU.stg[n]=buf;}).catch(()=>{});}catch(e){}};
{const so=AU.sting;AU.sting=function(n){if(MP.on())MP.loadSt(n);return so.apply(this,arguments);};}
// on foot: run / arena lock / boss (a/b per boss phase) / clear, read from the stage state twice a second; the stage plays stage2 until its cue is there
MP.foot=function(){const F=window.FOOT;if(!MP.on()||!F||!F.on||!F.S)return;const S=F.S;
  let k=S.end&&S.end.cleared?'street1-clear':S.bossOn||S.boss?'street1-boss':S.lock?'street1-lock':'street1';
  if(k==='street1-boss'&&MP.fb)k='street1-boss~b';
  if(!MP.has(k)||MP.fk===k)return;MP.fk=k;loadTrack(k);AU.startStage(k);};
NR.on('footStart',()=>{MP.fk=null;MP.fb=0;if(MP.on()&&MP.has('street1')){MP.fk='street1';AU.startStage('street1');}});
NR.on('footPhase',()=>{MP.fb=MP.fb?0:1;MP.fk=null;});
setInterval(MP.foot,500);
window.__mp=MP;
