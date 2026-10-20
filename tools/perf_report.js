#!/usr/bin/env node
// perf_report: one-screen table of the worst offenders vs budgets from exported `perf` docs.
// usage: node tools/perf_report.js <export.json|dir> [...]   (ArtifactData export files: a JSON array, {docs:[...]}, or one doc per file/line)
// Budgets: boot ≤ 6 s, no gap > 100 ms after reveal, p95 ≤ 33 ms, no long frame in the first 3 s. Reads kind=session (latest seq per sid), boot and freeze docs.
const fs=require('fs'),path=require('path');
const BUD={bootMs:6000,gapMs:100,p95:33,long3:0};
function load(p,out){const st=fs.statSync(p);if(st.isDirectory()){for(const f of fs.readdirSync(p))load(path.join(p,f),out);return}
  const t=fs.readFileSync(p,'utf8').trim();if(!t)return;let j;try{j=JSON.parse(t)}catch(e){j=t.split('\n').map(l=>{try{return JSON.parse(l)}catch(e){return null}}).filter(Boolean)}
  const arr=Array.isArray(j)?j:Array.isArray(j.docs)?j.docs:Array.isArray(j.items)?j.items:[j];for(const d of arr){const x=d&&d.data&&typeof d.data==='object'?Object.assign({id:d.id},d.data):d;if(x&&typeof x==='object')out.push(x)}}
function rows(docs){const S=new Map(),rest=[];for(const d of docs){if(d.kind==='session'&&d.sid){const o=S.get(d.sid);if(!o||(d.seq||0)>=(o.seq||0))S.set(d.sid,d)}else rest.push(d)}
  const R=[];for(const d of S.values()){const p95=Math.max(d.roam&&d.roam.p95||0,d.race&&d.race.p95||0);
    R.push({src:'session',build:d.build,dev:dev(d),city:d.city,boot:d.bootMs,phase:d.phase,gap:d.gapMs,gs:d.gapState,p95,long3:d.long3,err:d.errN||0,prog:d.prog})}
  for(const d of rest){if(d.kind==='boot')R.push({src:'boot',build:d.build,dev:dev(d),city:d.city,boot:d.bootMs});else if(d.kind==='freeze')R.push({src:'freeze',build:d.build,dev:dev(d),city:d.city,gap:d.gapMs,gs:d.state})}
  return R}
function dev(d){const u=d.ua||'';const m=/iPhone|iPad/.test(u)?'iPhone':/Android/.test(u)?'Android':/Macintosh|Windows|Linux|X11/.test(u)?'PC':'?';return m+' '+(d.vp||'')+'@'+(d.dpr||'')}
function viol(r){const v=[];if(r.boot>BUD.bootMs)v.push('boot '+(r.boot/1000).toFixed(1)+'s');if(r.gap>BUD.gapMs)v.push('gap '+Math.round(r.gap)+'ms'+(r.gs?' '+r.gs:''));if(r.p95>BUD.p95)v.push('p95 '+r.p95+'ms');if(r.long3>BUD.long3)v.push('long3 '+r.long3);if(r.err)v.push(r.err+' err');return v}
function main(args){const docs=[];for(const a of args)load(a,docs);const R=rows(docs);
  const pad=(s,n)=>String(s==null?'-':s).slice(0,n).padEnd(n);
  console.log(`perf_report: ${docs.length} docs → ${R.length} rows · budgets boot ≤ ${BUD.bootMs/1000}s · gap ≤ ${BUD.gapMs}ms · p95 ≤ ${BUD.p95}ms · long3 = 0`);
  console.log(pad('src',8)+pad('build',14)+pad('device',24)+pad('city',5)+pad('boot s',7)+pad('fetch/eval/build/reveal s',26)+pad('gap ms',8)+pad('p95',6)+pad('l3',4)+'over budget');
  const bad=R.map(r=>({r,v:viol(r)})).sort((a,b)=>b.v.length-a.v.length||(b.r.gap||0)-(a.r.gap||0)).slice(0,15);
  for(const {r,v} of bad){const ph=r.phase?['fetch','eval','build','reveal'].map(k=>(r.phase[k]/1000).toFixed(1)).join('/'):'-';
    console.log(pad(r.src,8)+pad(r.build,14)+pad(r.dev,24)+pad(r.city,5)+pad(r.boot?(r.boot/1000).toFixed(1):'-',7)+pad(ph,26)+pad(r.gap!=null?Math.round(r.gap):'-',8)+pad(r.p95||'-',6)+pad(r.long3,4)+(v.length?v.join(', '):'ok'))}
  const n=R.filter(r=>viol(r).length).length;console.log(`${n}/${R.length} rows over budget`);return n}
if(require.main===module){if(process.argv.length<3){console.error('usage: node tools/perf_report.js <export.json|dir> ...');process.exit(2)}main(process.argv.slice(2))}
module.exports={rows,viol,load,BUD};
