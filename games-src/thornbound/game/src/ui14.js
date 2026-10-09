// ===================== part 14: music per screen + the Music picker =====================
// Slots: tavern = title/menu, main = the game, fight = the last round, victory / defeat = the end card. Each has a saved choice: a, b, shuffle or off.
const MSLOTS=[['tavern','Menu'],['main','Game'],['fight','Final round'],['victory','Victory'],['defeat','Defeat']];
const MTITLE={'tavern-a':'The Gilded Hall at Midnight','tavern-b':'Whispers Beneath the Throne','main-a':'The Quiet Ledger','main-b':'Velvet Daggers','fight-a':'Siege of the Glass Kingdom','fight-b':'Thornfield Advance','victory-a':'All Hail the Victor','victory-b':'Fanfare for a New King','defeat-a':'Lanterns in the Frostwood','defeat-b':'A Lullaby for Empty Halls'};
const MDEF={tavern:'a',main:'a',fight:'a',victory:'a',defeat:'a'};
const MS={pick:Object.assign({},MDEF),res:{},sh:{},want:null,wslot:null,prev:null,prevT:0,last:null,since:0};
// 'all' = shuffle through every looping song (menu, game and final-round tracks), a new one every ~2.5 min
const MLOOPS=['tavern','main','fight'],MALL=Object.keys(MTITLE).filter(k=>MLOOPS.includes(k.split('-')[0])),MALL_MS=150000;
try{Object.assign(MS.pick,JSON.parse(localStorage.getItem('tb_mpick')||'{}'))}catch(e){}
function musicWant(){const st=$('#start');if(!G||!UI.started||(st&&!st.hidden))return ['tavern',0];
  if(G.over){const me=vs(),single=NET.on||humans().length===1,won=single?G.over.winner===me:humans().length!==0;return [won?'victory':'defeat',1]}
  return [G.round>=G.rounds?'fight':'main',0]}
function musicName(slot){const c=MS.pick[slot]||MDEF[slot];if(c==='off')return '-';
  if(c==='all'){if(!MS.res[slot]){const pool=MALL.filter(k=>k!==MS.last);MS.res[slot]=pool[Math.floor(Math.random()*pool.length)]}return MS.res[slot]}
  if(c==='shuffle'){if(!MS.res[slot]){MS.sh[slot]=MS.sh[slot]===undefined?(Math.random()<.5?0:1):1-MS.sh[slot];MS.res[slot]=slot+'-'+'ab'[MS.sh[slot]]}return MS.res[slot]}
  return slot+'-'+(c==='b'?'b':'a')}
function musicPick(slot,c){MS.pick[slot]=c;MS.res[slot]=null;try{localStorage.setItem('tb_mpick',JSON.stringify(MS.pick))}catch(e){}
  if(window.GA&&c!=='off'&&c!=='shuffle'&&c!=='all')try{GA.preload(musicName(slot))}catch(e){}
  if(MS.wslot===slot&&!MS.prev){MS.want=null;musicSync()}}
// one cross-faded track at a time; called from a slow tick, the first tap, and after the music button or a pick
function musicSync(){try{PX.tick()}catch(e){}
  if(!window.GA||!UI.music||MS.prev)return;const w=musicWant();if(MS.wslot!==w[0]){MS.wslot=w[0];MS.res[w[0]]=null}
  else if(MS.pick[w[0]]==='all'&&!w[1]&&MS.since&&Date.now()-MS.since>MALL_MS)MS.res[w[0]]=null;
  const n=musicName(w[0]);if(MS.want===n)return;MS.want=n;MS.since=Date.now();if(n!=='-')MS.last=n;
  if(n==='-'){GA.music(null,{fade:1});return}
  GA.music(n,{fade:w[1]?.6:1,once:!!w[1]});
  if(w[0]==='tavern'||w[0]==='main'){setTimeout(()=>{try{const nx=w[0]==='tavern'?'main':'fight',c=MS.pick[nx];if(c!=='off'&&c!=='shuffle'&&c!=='all')GA.preload(musicName(nx))}catch(e){}},4000)}}
function musicPreview(slot){if(!window.GA||!UI.music||MS.wslot===slot)return;try{GA.unlock()}catch(e){}const n=musicName(slot);if(n==='-')return;
  clearTimeout(MS.prevT);MS.prev=slot;MS.want=null;GA.music(n,{fade:.5,once:true});
  MS.prevT=setTimeout(()=>{MS.prev=null;MS.want=null;musicSync();renderMusic()},8000)}
function musicPreviewStop(){if(!MS.prev)return;clearTimeout(MS.prevT);MS.prev=null;MS.want=null;musicSync()}
function renderMusic(){const b=$('#musbody');if(!b)return;const on=UI.music;let vol=.5;try{vol=GA.state().musVol}catch(e){}
  const rows=MSLOTS.map(([k,nm])=>{const cur=MS.pick[k],act=MS.wslot===k&&on&&cur!=='off';
    const ch=['a','b'].map(v=>'<button class="mchip'+(cur===v?' on':'')+'" data-a="mpick" data-s="'+k+'" data-c="'+v+'">'+esc(MTITLE[k+'-'+v])+'</button>');
    ch.push('<button class="mchip'+(cur==='shuffle'?' on':'')+'" data-a="mpick" data-s="'+k+'" data-c="shuffle">⇄ Shuffle</button>',(MLOOPS.includes(k)?'<button class="mchip'+(cur==='all'?' on':'')+'" data-a="mpick" data-s="'+k+'" data-c="all">⇄ All songs</button>':''),'<button class="mchip'+(cur==='off'?' on':'')+'" data-a="mpick" data-s="'+k+'" data-c="off">Off</button>');
    const pv=MS.prev===k?'<button class="mchip prev" data-a="mprevx" data-s="'+k+'">■ Stop preview</button>':(!act&&cur!=='off'&&on?'<button class="mchip prev" data-a="mprev" data-s="'+k+'">▶ Preview</button>':'');
    return '<div class="mrow2"><h5>'+nm+(act?' <small>playing now</small>':'')+'</h5><div class="mchips">'+ch.join('')+pv+'</div></div>'}).join('');
  const h='<div class="music"><div class="mtop"><button class="mchip'+(on?' on':'')+'" data-a="mmus">Music: '+(on?'on':'off')+'</button><label class="mvol">Volume <input type="range" id="mvol" min="0" max="1" step="0.05" value="'+vol+'" aria-label="Music volume"></label></div><div class="mtop"><button class="mchip'+(MLOOPS.every(k=>MS.pick[k]==='all')?' on':'')+'" data-a="mall">⇄ Shuffle all songs</button></div>'+rows+'</div>';
  if(b._h!==h){b._h=h;b.innerHTML=h}}
document.addEventListener('input',e=>{if(e.target&&e.target.id==='mvol'&&window.GA)GA.setVolume('music',+e.target.value)});
