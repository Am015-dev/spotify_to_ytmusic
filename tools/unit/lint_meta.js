'use strict';
// META lint: page size, ALL_OPEN, credits, ORDER, changelog, checklist. Pure text/data, no browser.
const L=require('./lib.js'),fs=require('fs'),path=require('path');
module.exports=T=>{
 T.group('page');
 const P=L.PAGE(),mods=L.MODS(),order=L.ORDER();
 T.ok(/ALL_OPEN=true/.test(P),'all-open','ALL_OPEN=true missing');
 T.ok(!/ALL_OPEN=false/.test(P),'all-open-not-false');
 T.ok(/[Mm]ade with (<b>)?❤(<\/b>)? by Alex/.test(P),'credits-made','"Made with ❤ by Alex" missing');
 T.ok(/3D models by Alex/.test(P),'credits-models','"3D models by Alex" missing');
 T.ok(/by Alex/.test(P),'credits-by');
 const sz=Buffer.byteLength(P);T.ok(sz<3.6e6,'size-3.6MB','page '+sz+' B >= 3.6 MB cap');T.ok(sz<3.5e6,'size-headroom','page '+sz+' B within 3% of the 3.6 MB cap');
 T.ok(Buffer.byteLength(P)>1e6,'size-sane','page suspiciously small');
 const files=fs.readdirSync(L.SRCD).filter(f=>/\.(js|html)$/.test(f)),listed=new Set(order);
 for(const f of files){const inM=fs.readFileSync(path.join(L.SRCD,'MODELS'),'utf8').split('\n').includes(f);
   T.ok(listed.has(f)||inM,'order-has-'+f,f+' not in src/ORDER or src/MODELS')}
 for(const f of order){T.ok(fs.existsSync(path.join(L.SRCD,f)),'order-file-'+f,'listed but missing');
   T.ok(Buffer.byteLength(mods[f]||'')<=200*1024||/^(00_|02_|10b_|50_|52_)/.test(f),'mod-size-'+f,f+' over 200 KB')}
 T.ok(order.indexOf('99_api.js')>=0&&order.indexOf('99_api.js')>order.indexOf('10_core.js'),'order-api-after-core');
 T.ok(new Set(order).size===order.length,'order-unique');
 T.ok(/<\/script>\s*$/.test(P.trim())||/<\/script>/.test(mods['99_api.js']),'api-closes-script');
 // no model names in game files (CLAUDE.md standing order)
 const bad=/\b(sonnet|opus|haiku|fable|anthropic)\b/i.exec(P.replace(/https?:\/\/\S+/g,''));T.ok(!bad,'no-model-names','"'+(bad&&bad[0])+'" found in game source');
 T.ok(/<title>[^<]*<\/title>/.test(mods['00_page.html']),'has-title');
 T.ok(!/\bdebugger\b/.test(L.JSCODE().replace(/\/\/.*$/mg,'')),'no-debugger');
 T.ok(!/console\.log\(\s*['"]TODO/.test(P),'no-todo-log');
 // ---- changelog ----
 T.group('changelog');
 const C=L.CHANGELOG();T.ok(Array.isArray(C)&&C.length>0,'exists');
 const MON='Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
 const vkey=v=>{const m=/^v(\d+)([a-z]?)(?:-beta\.(\d+))?/.exec(v);return m?m:null};
 const e0=C[0];
 T.ok(/^v\d+[a-z]?(-beta\.\d+)?$/.test(e0.v||''),'top-version','top v="'+e0.v+'"');
 T.ok(/^\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) 20\d\d$/.test(e0.date||''),'top-date','date="'+e0.date+'"');
 T.ok(Array.isArray(e0.items)&&e0.items.length>=1&&e0.items.length<=4,'top-items-1to4','items='+(e0.items&&e0.items.length));
 for(const [i,e] of C.slice(0,40).entries()){
   T.ok(vkey(e.v||''),'v-form-'+i,'entry '+i+' v='+e.v);
   T.ok(/^\d{1,2} \w{3} 20\d\d$/.test(e.date||'')&&MON.includes((e.date||'').split(' ')[1]),'date-form-'+i,'entry '+e.v+' date='+e.date);
   T.ok(Array.isArray(e.items)&&e.items.length>0,'items-'+i,e.v+' has no items');
   for(const [j,it] of (e.items||[]).entries()){T.ok(['FIXED','NEW','CHANGED'].includes(it.t),'tag-'+i+'-'+j,e.v+' tag='+it.t);
     T.ok(typeof it.s==='string'&&it.s.length>=12&&it.s.length<=320,'text-'+i+'-'+j,e.v+' item '+j+' length '+(it.s&&it.s.length));
     T.ok(!/[{}<>]|=>|\bfunction\b|undefined|NaN/.test(it.s||''),'plain-'+i+'-'+j,e.v+' item not plain English: '+(it.s||'').slice(0,50))}}
 T.ok(new Set(C.map(e=>e.v)).size===C.length,'versions-unique');
 const ts=C.map(e=>{const p=(e.date||'').split(' ');return Date.UTC(+p[2],MON.indexOf(p[1]),+p[0])});let mono=true,bi=-1;for(let i=1;i<ts.length;i++)if(ts[i]>ts[i-1]+864e5){mono=false;bi=i;break}
 T.ok(mono,'newest-first','dates not newest-first at entry '+bi);
 // ---- checklist ----
 T.group('checklist');
 const K=L.CHECKLIST(),goSrc=L.JSCODE();T.ok(K.length>=100,'count','only '+K.length+' items');
 const keyOf=q=>q.ver+'/'+q.id,keys=K.map(keyOf);
 const dup=keys.filter((k,i)=>keys.indexOf(k)!==i);T.ok(!dup.length,'unique-keys','duplicate '+dup.slice(0,3).join(','));
 let nGo=0;const explicit=new Set();{const re=/['"]([\w.-]+\/[\w.-]+)['"]\s*:\s*\[\s*\{/g;let m;const src=mods['99c_checklist.js'];while((m=re.exec(src)))explicit.add(m[1])}
 const latest=K[0].ver;const recent=new Set(K.map(q=>q.ver).filter((v,i,a)=>a.indexOf(v)===i).slice(0,2));
 for(const q of K){const k=keyOf(q);
   T.ok(/^v\d+[a-z0-9.-]*$|^[a-z]{2,6}[A-Za-z0-9]*$/.test(q.ver||''),'ver-'+k,'bad ver');
   T.ok(/^[\w-]+$/.test(q.id||''),'id-'+k,'bad id');
   T.ok(typeof q.text==='string'&&q.text.length>=40,'passline-len-'+k,'pass line too short ('+(q.text||'').length+')');
   T.ok(!/\b(TODO|TBD|XXX|lorem)\b/i.test(q.text||''),'no-placeholder-'+k);
   if(q.go!==undefined)T.ok(Array.isArray(q.go),'go-shape-'+k,'go must be an array');
   if(recent.has(q.ver)&&/📍|GO\b/.test(q.text))T.ok(explicit.has(k)||(q.go&&q.go.length),'go-explicit-'+k,'text promises a GO but no GO target is registered')}
 T.ok(/const GO=\{/.test(mods['99c_checklist.js']),'go-table-exists');
 T.ok(/for\(const it of OD_CHECKLIST\)\{if\(GO\[k\(it\)\]\)continue/.test(mods['99c_checklist.js']),'go-default-for-all','default GO fallback missing: items without a target would have no 📍');
 // rv: reviewer FAILs must carry an area + pass line
 for(const q of K.filter(q=>/rv:/.test(JSON.stringify(q))))T.ok(q.text.length>40,'rv-passline-'+keyOf(q));
 T.ok(K.length===new Set(K.map(q=>q.text)).size,'no-dup-text','two items share one pass line');
};
