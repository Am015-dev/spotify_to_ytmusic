// ---------- NetRoom: free peer-to-peer game rooms (WebRTC through Trystero, MIT) ----------
// Players find each other through public Nostr relays; after that the moves go browser to browser.
// The room object has the same shape as the claude.ai "room" capability, so a game's net code runs on either:
//   lobby.join(name) -> room {presence(o), on(type,fn), emit(type,data), onPeers(fn), onConnection(fn), leave()}
//   messages: {peer, data, isMe:false, by}   peers: {peer, isMe, sameTab, kind:'viewer', presence, by, guest:false}
// Tests can point it at a local relay with window.NETROOM_RELAYS=['ws://127.0.0.1:17700'].
const NetRoom=(()=>{
  const APP='game-night-shelf-v1';
  const rand=n=>{const a='abcdefghijkmnpqrstuvwxyz23456789',u=new Uint8Array(n);crypto.getRandomValues(u);return [...u].map(x=>a[x%a.length]).join('')};
  const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
  let myUid=null;
  function uid(){if(myUid)return myUid;myUid=store.get('gns-uid');if(!myUid){myUid='p'+rand(15);store.set('gns-uid',myUid)}return myUid}
  function name(){return (store.get('gns-name')||'').slice(0,24)}
  function setName(n){n=String(n||'').replace(/[<>&"]/g,'').trim().slice(0,24);store.set('gns-name',n);return n}
  function available(){return typeof Trystero!=='undefined'&&typeof RTCPeerConnection!=='undefined'&&!!(window.crypto&&crypto.subtle)}
  // invite codes: 5 letters/digits without look-alikes
  function newCode(){return rand(5)}
  function cleanCode(c){return String(c||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,10)}
  function lobby(game){return {join:async roomName=>makeRoom(game,String(roomName))}}
  function makeRoom(game,roomName){
    const cfg={appId:APP,password:game+'/'+roomName,relayConfig:{redundancy:6,warnOnRelayFailure:false}};
    if(window.NETROOM_RELAYS)cfg.relayConfig.urls=window.NETROOM_RELAYS;
    if(window.NETROOM_ICE)cfg.rtcConfig={iceServers:window.NETROOM_ICE};
    if(window.NETROOM_TURN)cfg.turnConfig=window.NETROOM_TURN;
    const tr=Trystero.joinRoom(cfg,game+'/'+roomName);
    const me=Trystero.selfId,by=uid();
    let pres={name:name()},left=false;
    const remote=new Map(),handlers={},peerFns=[],connFns=[];
    const gA=tr.makeAction('g'),pA=tr.makeAction('p');
    const entry=(p,v)=>({peer:p,isMe:false,sameTab:false,kind:'viewer',presence:v.presence,by:v.by,guest:false});
    const list=()=>[{peer:me,isMe:true,sameTab:true,kind:'viewer',presence:pres,by,guest:false},...[...remote].map(([p,v])=>entry(p,v))];
    const fire=(joined,gone)=>{const ch={peers:list(),joined,left:gone};peerFns.forEach(f=>{try{f(ch)}catch(e){console.error(e)}})};
    const sendPres=target=>{try{pA.send({pr:pres,by},target?{target}:undefined)}catch(e){}};
    const gone=new Set();
    tr.onPeerJoin=p=>{gone.delete(p);sendPres(p)};
    tr.onPeerLeave=p=>{gone.add(p);const v=remote.get(p);if(!v)return;remote.delete(p);fire([],[entry(p,v)])};
    pA.onMessage=(d,info)=>{const p=info&&info.peerId;if(!p||gone.has(p)||!d||typeof d!=='object')return;
      const pr=d.pr&&typeof d.pr==='object'&&!Array.isArray(d.pr)?Object.assign({},d.pr):{};if('name' in pr)pr.name=String(pr.name||'').replace(/[<>&"]/g,'').slice(0,24);
      const v={presence:pr,by:typeof d.by==='string'?d.by.slice(0,40):null};
      const old=remote.get(p);remote.set(p,v);if(!old){sendPres(p);fire([entry(p,v)],[]);return}
      // presence is re-sent every few seconds in case one was lost; only a real change is reported
      if(JSON.stringify(old)!==JSON.stringify(v))fire([],[])};
    gA.onMessage=(d,info)=>{const p=info&&info.peerId;if(!p||!d||typeof d.t!=='string')return;
      // a message can arrive just before that peer's presence does
      const v=remote.get(p)||{presence:{},by:null};(handlers[d.t]||[]).forEach(f=>{try{f({peer:p,data:d.d,isMe:false,by:v.by})}catch(e){console.error(e)}})};
    setTimeout(()=>connFns.forEach(f=>f(true)),0);
    const hb=setInterval(()=>{if(!left)sendPres()},5000);
    // closing the tab tells the others at once, instead of after WebRTC's ~10 s timeout
    const bye=()=>{if(left)return;left=true;clearInterval(hb);try{tr.leave()}catch(e){}};window.addEventListener('pagehide',bye);
    return {
      self:me,
      presence(o){pres=Object.assign({},pres,o||{});sendPres();fire([],[]);return Promise.resolve()},
      on(t,f){(handlers[t]=handlers[t]||[]).push(f)},
      emit(t,d){if(left)return Promise.resolve();try{return Promise.resolve(gA.send({t,d})).then(()=>{},()=>{})}catch(e){return Promise.resolve()}},
      sendTo(peer,t,d){if(left)return Promise.resolve();try{return Promise.resolve(gA.send({t,d},{target:peer})).then(()=>{},()=>{})}catch(e){return Promise.resolve()}},
      onPeers(f){peerFns.push(f);setTimeout(()=>f({peers:list(),joined:[],left:[]}),0)},
      onConnection(f){connFns.push(f)},
      peerCount(){return remote.size},
      leave(){window.removeEventListener('pagehide',bye);left=true;clearInterval(hb);try{return Promise.resolve(tr.leave())}catch(e){return Promise.resolve()}}};
  }
  // an invite link opens the game with the code filled in: …/game/#join-abcde
  function linkCode(){const m=/^#join-([a-z0-9]{3,10})$/i.exec(location.hash||'');return m?m[1].toLowerCase():''}
  function inviteLink(code){return location.href.split('#')[0]+'#join-'+code}
  return {available,lobby,uid,name,setName,newCode,cleanCode,linkCode,inviteLink};
})();
