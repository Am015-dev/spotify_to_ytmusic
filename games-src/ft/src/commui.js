// ---------- Hadiya's commissions: the page side (W624). Learn to play = six commissions (comm.js); every tap is a real move ----------
// One bubble, always next to what it talks about (UI-BAR rule 10): the brief beside the key tile, a just-in-time rule beside the
// track / tile / action it explains, and what your last choice did. The debrief names the consequence and the lesson: Try again or Next.
const CU={i:-1,told:{},lastN:0,said:''};
function commOn(){return !!(G&&G.comm)}
function commStart(i){try{GX.close()}catch(e){}clearTimeout(aiTimer);aiTimer=null;clearTimeout(UI.autoT);UI.autoT=0;UI.modal=null;UI.fx.length=0;UI.fxSeen=0;
  try{guideEnd()}catch(e){}try{coachEnd()}catch(e){}resetScene();commNew(i);CU.i=i;CU.told={};CU.lastN=G.logN;CU.said='';UI.snap=null;document.body.classList.add('comm');refresh();render();schedule()}
function commLeave(){document.body.classList.remove('comm');const b=document.getElementById('commb');if(b)b.hidden=true;const d=document.getElementById('commd');if(d)d.remove()}
// the line for this moment: brief first, then the rule the decision needs (once), then what your last choice did
function commMoment(){const c=COMMS[G.commI];const mine=sideToAct()===0;const ph=G.phase==='bid'?'bid':G.step==='move'?'move':G.step==='tribe'?'tribe':G.step==='tile'?(G.act&&G.board[G.act.tile].k==='sacred'&&c.tips.djinn&&CU.told.tile?'djinn':'tile'):G.step==='sell'?'sell':'';
  const fresh=G.log.filter(e=>e.i>CU.lastN&&/^You\b/.test(e.t)).map(e=>e.t.replace(/^You (\w+)s\b/,'You $1').replace(/^You's/,'Your'));
  if(!CU.told.brief)return {k:'brief',el:tileEl(c.key),html:`<b>${esc(c.title)}</b><span>${esc(c.story)}</span><em>Goal: ${esc(c.goal)}</em>`};
  if(mine&&c.tips[ph]&&!CU.told[ph])return {k:ph,el:commTarget(ph),html:`${fresh.length?`<span class="cu-did">${esc(fresh[fresh.length-1])}</span>`:''}<span>${esc(c.tips[ph])}</span>`};
  if(fresh.length)return {k:'did'+G.logN,el:commTarget(ph||'move'),html:`<span class="cu-did">${esc(fresh[fresh.length-1])}</span><em>Goal: ${esc(c.goal)}</em>`};
  return null}
function commTarget(ph){const q=s=>document.querySelector(s);if(ph==='bid')return q('[data-mv*="\\"bid\\""]')||q('#acts');if(ph==='move'){const c=COMMS[G.commI];return G.move?tileEl(G.move.at!=null?G.move.at:c.key):tileEl(c.key)}return q('#acts button')||q('#acts')}
function commBubble(m){let b=document.getElementById('commb');if(!b){b=document.createElement('div');b.id='commb';b.className='commb';b.setAttribute('role','status');document.body.appendChild(b)}
  if(!m){return}b.hidden=false;b.innerHTML=`<i aria-hidden="true">${COMM_STORY.face}</i><div>${m.html}</div><s class="cu-arrow"></s>`;
  const el=m.el;const W=innerWidth,H=innerHeight;const bw=Math.min(300,W-32);b.style.width=bw+'px';
  if(!el){b.style.left='16px';b.style.top='72px';b.dataset.side='none';return}
  const r=el.getBoundingClientRect();const bh=b.offsetHeight;let side=r.top-bh-14>8?'above':(r.bottom+bh+14<H-8?'below':'above');
  let top=side==='above'?r.top-bh-12:r.bottom+12;top=Math.max(8,Math.min(H-bh-8,top));let left=r.left+r.width/2-bw/2;left=Math.max(16,Math.min(W-bw-16,left));
  b.style.left=left+'px';b.style.top=top+'px';b.dataset.side=side;const a=b.querySelector('.cu-arrow');a.style.left=Math.max(14,Math.min(bw-28,r.left+r.width/2-left-7))+'px'}
function commDraw(){if(!commOn()){const b=document.getElementById('commb');if(b)b.hidden=true;return}
  if(G.over)return commDebrief();
  const m=commMoment();if(m){CU.cur=m}else if(CU.cur&&CU.cur.k==='brief'){}const show=m||CU.cur;if(show){show.el=show.k==='brief'?tileEl(COMMS[G.commI].key):(m?m.el:commTarget('move'));commBubble(show)}}
// a real move tells the brief and the rule as read (the tap itself is the lesson's decision)
function commMoved(){if(!commOn())return;const st=G.phase==='bid'?'bid':G.step;if(CU.cur){CU.told[CU.cur.k==='did'+G.logN?'x':CU.cur.k]=1;CU.told.brief=1}}
function commDebrief(){const b=document.getElementById('commb');if(b)b.hidden=true;if(document.getElementById('commd'))return;const r=commResult();const i=G.commI,n=COMMS.length;
  const d=document.createElement('div');d.id='commd';d.className='commd';d.setAttribute('role','dialog');d.setAttribute('aria-label','Commission debrief');
  d.innerHTML=`<div class="commd-box ${r.won?'won':'lost'}"><p class="cu-k">Commission ${i+1} of ${n}</p><h2>${r.won?'Done. Hadiya nods.':'Not this time.'}</h2>
  <p class="cu-why">${esc(r.why)}</p><p class="cu-les"><b>Lesson</b> ${esc(r.lesson)}</p>
  <div class="cu-acts">${r.won?(i+1<n?`<button class="btn go big" data-cu="next">Next: ${esc(COMMS[i+1].title)}</button>`:`<button class="btn go big" data-cu="play">Play a real game</button>`)+`<button class="btn" data-cu="retry">Play it again</button>`
   :`<button class="btn go big" data-cu="retry">Try again</button>`+(i+1<n?`<button class="btn" data-cu="next">Skip to commission ${i+2}</button>`:'')}<button class="btn" data-cu="quit">Back to menu</button></div></div>`;
  document.body.appendChild(d);
  d.addEventListener('click',ev=>{const a=ev.target.closest('[data-cu]');if(!a)return;const k=a.dataset.cu;d.remove();
    if(k==='retry')commStart(i);else if(k==='next')commStart(i+1);else{commLeave();G=null;resetScene();render();if(k==='play')uiAct('start')}})}
(function(){const o=render;render=function(){o.apply(this,arguments);try{commDraw()}catch(e){console.error(e)}}})();
(function(){const og=go;go=function(m){const before=commOn()&&sideToAct()===0;if(before){commMoved();CU.lastN=G.logN}const r=og.apply(this,arguments);return r}})();
window.GXCOMM={get on(){return commOn()},get i(){return G&&G.comm?G.commI:-1},get over(){return !!(G&&G.over)},result(){return G&&G.comm?commResult():null},start:commStart};
