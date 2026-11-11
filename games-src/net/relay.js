// Minimal local Nostr relay for offline tests of the peer-to-peer rooms (ephemeral events only, no storage).
// node relay.js [port]
const {WebSocketServer}=require('../node_modules/ws');
const port=+process.argv[2]||17700;const wss=new WebSocketServer({port});const subs=new Map();let n=0;
function match(f,e){if(f.kinds&&!f.kinds.includes(e.kind))return false;if(f.ids&&!f.ids.includes(e.id))return false;if(f.authors&&!f.authors.includes(e.pubkey))return false;
  for(const k in f){if(k[0]==='#'){const t=k.slice(1);if(!e.tags.some(x=>x[0]===t&&f[k].includes(x[1])))return false}}if(f.since&&e.created_at<f.since)return false;return true}
wss.on('connection',ws=>{const id=++n;ws.on('message',raw=>{let m;try{m=JSON.parse(raw)}catch(e){return}
  if(m[0]==='EVENT'){const e=m[1];ws.send(JSON.stringify(['OK',e.id,true,'']));for(const [key,s] of subs){if(s.ws.readyState!==1)continue;if(s.filters.some(f=>match(f,e)))s.ws.send(JSON.stringify(['EVENT',s.sub,e]))}}
  else if(m[0]==='REQ'){subs.set(id+':'+m[1],{ws,sub:m[1],filters:m.slice(2)});ws.send(JSON.stringify(['EOSE',m[1]]))}
  else if(m[0]==='CLOSE'){subs.delete(id+':'+m[1])}});
  ws.on('close',()=>{for(const k of [...subs.keys()])if(k.startsWith(id+':'))subs.delete(k)})});
console.log('relay on',port);
