// ===================== Short Fuse: minimal 2D debug view (stage 2 replaces it) =====================
UI.sim=0;UI.view=-1;UI.auto=0;AIDELAY=350;
const $=id=>document.getElementById(id);
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c])}
function startGame(){const n=+$('job').value,np=+$('np').value;const M=MISSIONS[n];if(!M.pl.includes(np)){alert('Job '+n+' needs '+M.pl.join('/')+' players');return}
  const seed=$('seed').value?+$('seed').value:null;if(seed!=null){setSeed(seed);setAiSeed(seed)}const human=+$('human').value;
  newGame({np,mission:n,level:$('lv').value,seats:[...Array(np).keys()].map(i=>i===human?'human':'ai')});UI.view=human>=0&&human<np?human:-1;$('viewas').value=String(UI.view);refresh()}
function chip(x,seeIt){const tone=x.v==null?'hid':x.v==='R'?'red':x.v==='Y'?'yel':'blu';const lab=x.v==null?'?':x.v==='R'?'R'+(x.s!=null?x.s:''):x.v==='Y'?'Y'+(x.s!=null?x.s:''):x.v;
  return `<span class="w ${tone} ${x.cut?'cut':''}" title="slot uid ${x.u}${x.not.length?' | not '+x.not.join(','):''}">${esc(lab)}${x.x?'<i>X</i>':''}${x.flip?'<i>~</i>':''}${x.tok.map(t=>`<b>${t.t}${t.v!=null?t.v:''}</b>`).join('')}</span>`}
function refresh(){if(!G)return;const seat=UI.view;const K=knowledge(seat<0?0:seat);
  // god view shows true values; seat view shows only that seat's knowledge
  const stands=G.st.map(s=>{const owner=ownerOf(s.i);const row=s.w.map((sl,k)=>{const x=seat<0?{u:sl.u,cut:sl.cut,x:sl.x,flip:sl.flip,tok:sl.tok,not:sl.not,v:cv(sl.id),s:sv(sl.id)}:K.stands[s.i].slots[k];return chip(x)}).join('');
    const side=s.side.map(t=>`<b class="side">${t.t}${t.v}${t.mean==='none'?'∅':''}</b>`).join('');
    return `<div class="st ${owner===G.actor?'act':''}"><span class="who">${esc(SP(owner).nm)}${standsOf(owner).length>1?' #'+(s.i+1):''}${owner===G.captain?' (foreman)':''}${SP(owner).human?' [you]':''}</span>${row}${side}</div>`}).join('');
  const eq=G.eq.map(e=>`<span class="eq ${e.st}">${e.down?'face-down card':esc(EQUIP[e.id].n)} <small>${e.down?'':EQUIP[e.id].v+(EQUIP[e.id].need===4?'x4':'')} ${e.st}${e.cover?' cover '+e.cover:''}</small></span>`).join(' ');
  const crew=G.seats.map(q=>`<span>${esc(q.nm)}: ${q.ch&&!q.chDown?esc(CHARS[q.ch].n+' / '+ITEMS[CHARS[q.ch].item].n)+(q.chUsed?' (used)':''):'no tool'}${q.con?' | restriction '+(UI.view<0||UI.view===q.i||!G.ms.mole?q.con+(q.conDown?' (down)':''):'?'):''}${q.ox?' | oxygen '+q.ox:''}${q.cards.length&&(UI.view<0||UI.view===q.i||G.mission===65)?' | cards '+q.cards.join(','):''}</span>`).join('<br>');
  const ms=Object.entries(K.ms).map(([k,v])=>`<div><b>${k}</b> ${esc(JSON.stringify(v))}</div>`).join('');
  $('board').innerHTML=`<div class="top">Job ${G.mission} <b>${esc(MISSIONS[G.mission].nm)}</b> - ${esc(MISSIONS[G.mission].text)}</div>
    <div class="top">Fuse <b>${G.dial==null?'robot':G.dial}</b> | turn ${G.turn} round ${G.round} | clock ${Math.round(G.clock)}s ${G.prompt?'| <i>'+esc(G.prompt.say)+'</i>':''} | validation ${G.valid.join(' ')}</div>${stands}<div class="eqs">${eq||'no equipment'}</div><div class="crew">${crew}</div><div class="ms">${ms}</div>`;
  const s=sideToAct();let dock='';
  if(G.over)dock=`<h3>${esc(G.winText)}</h3>`;
  else if(s>=0&&SP(s).human){const vm=validMoves(s);dock=`<b>${esc(SP(s).nm)}</b>: ${G.q?esc(G.q.title):'your action'}<br><select id="mvs" size="8">${vm.slice(0,400).map((m,i)=>`<option value="${i}">${esc(describeMove(m))}</option>`).join('')}</select><br><button id="doit">Do it</button>`;UI.vm=vm;UI.vs=s}
  else dock=`Waiting for ${s>=0?esc(SP(s).nm):'-'}${G.q?' ('+esc(G.q.title)+')':''}`;
  $('dock').innerHTML=dock;{const b=$('doit');if(b)b.onclick=()=>{const i=+$('mvs').value;const r=performMove(UI.vm[i],UI.vs);if(!r.success)alert(r.error)}}
  $('log').innerHTML=G.log.slice(0,60).map(l=>`<div class="${l.c}">${esc(l.t)}</div>`).join('');
  if(UI.view>=0&&$('wwk').checked){const W=whatWeKnow(UI.view,40);$('help').innerHTML=`<b>What ${esc(SP(UI.view).nm)} knows</b> (${W.samples} deals sampled${W.consistent?'':', approximate'})<br>`+
    W.slots.filter(x=>x.owner!==UI.view||true).map(x=>`stand ${x.st+1} slot ${x.k+1}: ${Object.entries(x.prob).sort((a,b)=>b[1]-a[1]).map(([v,p])=>v+' '+Math.round(p*100)+'%').join(', ')}`).join('<br>')+(W.suggestion?`<p><b>Suggestion:</b> ${esc(W.suggestion.text)} - ${esc(W.suggestion.why)}</p>`:'')}else $('help').innerHTML='';
  if(UI.auto&&!G.over)setTimeout(stepAI,AIDELAY)}
function stepAI(){if(!G||G.over)return;const st=aiStep();if(!st){UI.auto=0;return}const r=performMove(st.m,st.seat);if(!r.success){UI.auto=0;console.error(r.error)}}
window.addEventListener('DOMContentLoaded',()=>{const j=$('job');for(let n=1;n<=66;n++)j.insertAdjacentHTML('beforeend',`<option value="${n}">${n} ${esc(MISSIONS[n].nm)}</option>`);
  $('new').onclick=startGame;$('step').onclick=stepAI;$('auto').onclick=()=>{UI.auto=!UI.auto;$('auto').textContent=UI.auto?'Pause':'Auto-play';if(UI.auto)stepAI()};
  $('viewas').onchange=()=>{UI.view=+$('viewas').value;refresh()};$('wwk').onchange=refresh;
  $('tick').onclick=()=>tick(10);startGame()});
