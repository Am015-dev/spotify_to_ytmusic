// hr-mstart (lazy chunk, loads after drivable): a quest start shows ONE objective of <= 6 words; the long briefing is one tap on the card away (docs/HITRUN_GAP.md gap 4).
// qvStart (41_career_quests.js) falls back to the old long card until this chunk is loaded.
// hr-mstart: <= 6-word objective, long briefing one tap away
function qvShort(t){let w=String(t||'').replace(/<[^>]*>|\s*\(\d+\/\d+\)/g,'').trim().split(/\s+/);const i=w.length>6?w.findIndex((x,k)=>k>1&&/^(in|to|before|from|at|near)$/i.test(x)):-1;return(i>1?w.slice(0,i):w).slice(0,6).join(' ')}
function qvIntro(q,txt,more){const t=qvShort(txt);npcSay(q,t,{must:1});const el=$('#npcSay'),b=el.querySelector('b'),p=el.querySelector('p');el.dataset.more=more;b.textContent=q.npc+' ▸ tap for more';el.onclick=()=>{if(!el.dataset.more)return;p.innerHTML=more;b.textContent=q.npc;delete el.dataset.more;clearTimeout(npcSay.t);npcSay.t=setTimeout(()=>el.hidden=true,9000)}}
({qvIntro,qvShort})
