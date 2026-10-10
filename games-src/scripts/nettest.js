#!/usr/bin/env node
// Online multiplayer test: host + clients in separate jsdom windows over a mock `room` capability.
const {JSDOM}=require('jsdom');const fs=require('fs');const {TextEncoder,TextDecoder}=require('util');
const file=process.argv[2];const html=fs.readFileSync(file,'utf8');const NCL=+(process.argv[3]||1);const DROP=+(process.env.DROP||0);
const rooms={};let nextPeer=1;
function mkRoom(name){return rooms[name]=rooms[name]||{members:new Map()}}
function mkClaude(uid,errs){const peer='p'+(nextPeer++);
  const mkNamed=(name)=>{const R=mkRoom(name);const me={peer,uid,presence:{},handlers:{},peerFns:[]};R.members.set(peer,me);
    const snap=(viewer)=>[...R.members.values()].map(m=>Object.freeze({peer:m.peer,by:m.uid,isMe:m.peer===viewer,sameTab:m.peer===viewer,kind:'viewer',guest:false,presence:m.presence,updatedAt:Date.now()}));
    const notify=(joined,left)=>{for(const m of R.members.values()){const ps=snap(m.peer);m.peerFns.forEach(f=>setTimeout(()=>{try{f({peers:ps,joined:joined?ps.filter(p=>p.peer===joined):[],left:left?[{peer:left}]:[],updated:[]})}catch(e){errs.push('onPeers '+e.stack)}},1))}};
    setTimeout(()=>notify(peer),1);
    return {name,emit:async(topic,data)=>{const s=JSON.stringify(data);if(s.length>4096)errs.push('EMIT TOO BIG '+topic+' '+s.length);
        for(const m of R.members.values()){if(DROP&&m.peer!==peer&&Math.random()<DROP)continue;(m.handlers[topic]||[]).forEach(f=>setTimeout(()=>{try{f({topic,data:JSON.parse(s),peer,by:uid,isMe:m.peer===peer,sameTab:m.peer===peer,kind:'viewer',guest:false})}catch(e){errs.push('on '+topic+' '+e.stack)}},1+Math.random()*4))}},
      on:(t,f)=>{(me.handlers[t]=me.handlers[t]||[]).push(f);return()=>{}},
      presence:async(patch)=>{Object.assign(me.presence=Object.assign({},me.presence),patch);notify()},
      peers:()=>snap(peer),onPeers:(f)=>{me.peerFns.push(f);return()=>{}},connected:()=>true,onConnection:(f)=>{setTimeout(()=>f(true),1);return()=>{}},
      leave:async()=>{R.members.delete(peer);notify(null,peer)}}};
  const room={join:async(n)=>mkNamed(n)};
  const user={id:async()=>uid,profiles:async(ids)=>Object.fromEntries([].concat(ids).map(i=>[i,{id:i,name:'Player '+i.slice(-1),avatarUrl:'',color:'#888',email:null,isMe:i===uid,guest:false}])),canEdit:async()=>true,isOwner:async()=>false,can:async()=>true,me:async()=>({id:uid,name:'Player '+uid.slice(-1)})};
  return {use:async(n)=>n==='room'?room:n==='user'?user:null}}
function win(uid){const errs=[];const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/',beforeParse(w){w.claude=mkClaude(uid,errs);w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder}});
  const w=dom.window;w.addEventListener('error',e=>errs.push(e.message));w.console.error=(...a)=>errs.push(a.join(' '));w.eval('ANIM=0;AIDELAY=0');w.localStorage.setItem('ccs_tour2','1');return {w,errs,d:w.document,uid}}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const H=win('u_host1');const C=[];for(let i=0;i<NCL;i++)C.push(win('u_cli'+(i+2)));
  await sleep(200);
  H.w.eval(`UI.n=${Math.max(4,NCL+1)};UI.lvl='normal';UI.xp='trial';UI.evo=true;UI.ex=${JSON.stringify(process.env.EX?Object.fromEntries(process.env.EX.split(',').map(k=>[k,true])):{})};`);
  await H.w.eval("netJoin('host','abcde')");for(const c of C){c.w.eval("UI.mon=2");await c.w.eval("netJoin('client','abcde')")}
  await sleep(300);
  const lobbyOK=C.every(c=>c.w.eval('NET.inLobby&&NET.peers.length')>=NCL+1);
  H.w.eval('netStart()');await sleep(600);
  const started=C.every(c=>c.w.eval('!!G&&G.pl.length'));
  const seats=C.map(c=>c.w.eval('NET.mySeat'));
  const all=[H,...C];const t0=Date.now();let last='',stall=0,clicks=0,remoteClicks=0;const seen=new Set();
  const click=(x,el)=>el.dispatchEvent(new x.w.MouseEvent('click',{bubbles:true}));const rnd=a=>a[Math.floor(Math.random()*a.length)];
  const KILL=+(process.env.KILL||0);let killed=false,HW=H,migratedAt=null;const SILENT=!!process.env.SILENT;
  while(Date.now()-t0<Number(process.env.T||150000)){await sleep(15);
    if(KILL&&!killed&&Date.now()-t0>KILL){killed=true;H.dead=true;const st=H.w.eval('JSON.stringify({ph:G.phase,ch:UI.choice&&UI.choice.title,turn:G.turn})');
      if(SILENT){H.w.eval('NET.room._e=NET.room.emit;NET.room.emit=async()=>{};NET.on=false')}else{await H.w.eval('NET.room.leave()');H.w.eval('NET.on=false')}H.killState=st}
    if(process.env.BACK&&killed&&!H.back&&migratedAt&&Date.now()-t0>migratedAt+3000){H.back=true;H.dead=false;H.w.eval('NET.room.emit=NET.room._e;NET.on=true');}
    const live=all.filter(x=>!x.dead);const nh=live.find(x=>x.w.eval('isHost()'));if(!nh){continue}if(nh!==HW){HW=nh;migratedAt=Date.now()-t0}
    const G=HW.w.eval('G');if(!G)break;if(G.winner)break;
    for(const x of live){const ch=x.d.getElementById('choice');const m=ch&&!ch.classList.contains('hidden')?ch:x.d.getElementById('modal');
      if(m&&!m.classList.contains('hidden')){const bs=[...m.querySelectorAll('button[data-opt]:not([disabled])')].filter(b=>b.dataset.opt!=='x');if(bs.length){const h=m.querySelector('h2');seen.add((x===H?'H ':'C ')+'modal:'+(h&&h.textContent));click(x,rnd(bs));clicks++;if(x!==H)remoteClicks++;continue}}
      if(!x.w.eval('humanTurn()'))continue;
      const cards=[...x.d.querySelectorAll('[data-card]:not([disabled])')];if(cards.length&&Math.random()<.4){click(x,rnd(cards));clicks++;if(x!==H)remoteClicks++;seen.add((x===H?'H':'C')+' buy');continue}
      const dice=[...x.d.querySelectorAll('.die[data-die]:not([disabled])')];if(dice.length&&Math.random()<.3){click(x,rnd(dice));clicks++;if(x!==H)remoteClicks++;continue}
      const acts=[...x.d.querySelectorAll('#prompt [data-act]:not([disabled])')].filter(b=>b.dataset.act!=='hint');if(acts.length){const b=rnd(acts);seen.add((x===H?'H ':'C ')+'act:'+b.dataset.act.split(':')[0]);click(x,b);clicks++;if(x!==H)remoteClicks++}}
    const sig=JSON.stringify([G.turn,G.active,G.dice,G.log.length]);if(sig===last)stall++;else{stall=0;last=sig}if(stall>1500){HW.errs.push('STALL '+HW.w.eval('JSON.stringify({ht:humanTurn(),my:NET.mySeat,act:G.active,human:G.pl[G.active].human,phase:G.phase,choice:UI.choice&&UI.choice.title,who:UI.choice&&UI.choice.who,busy:UI.busy,info:UI.info,lobby:NET.inLobby,peer:NET.peer,peers:G.pl.map(p=>p.peer),prompt:document.getElementById("prompt").innerHTML.slice(0,400),modal:document.getElementById("modal").className+document.getElementById("modal").innerHTML.slice(0,200)})'));break}}
  await sleep(+(process.env.ENDW||900));
  const hg=HW.w.eval('G');const res={oldHost:H.back?H.w.eval('JSON.stringify({role:NET.role,seat:NET.mySeat,human:G.pl[NET.mySeat]&&G.pl[NET.mySeat].human,t:G.turn,w:G.winner})'):null,killAt:KILL||null,killState:H.killState||null,newHost:all.indexOf(HW),migratedAt,hostCount:all.filter(x=>!x.dead&&x.w.eval('isHost()')).length,lobbyOK,started,seats,hostSeat:H.w.eval('NET.mySeat'),humans:hg.pl.filter(p=>p.human).length,turn:hg.turn,winner:hg.winner,clicks,remoteClicks,
    diag:C.filter(c=>c!==HW).map(c=>c.w.eval('JSON.stringify({t:G&&G.turn,w:G&&G.winner,ep:NET.ep,hp:NET.hostPeer,role:NET.role,ap:NET.applied,lr:Date.now()-NET.lastRx})')).concat([HW.w.eval('JSON.stringify({peer:NET.peer,ep:NET.ep,seq:NET.seq})')]),clientsAgree:C.filter(c=>c!==HW).map(c=>{const g=c.w.eval('G');return !!g&&g.winner===hg.winner&&g.turn===hg.turn}),seen:[...seen].sort(),
    errors:all.flatMap((x,i)=>x.errs.map(e=>(i?'C'+i:'H')+': '+String(e).slice(0,300)))};
  console.log(JSON.stringify(res,null,1));process.exit(0)})();
