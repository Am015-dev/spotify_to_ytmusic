#!/usr/bin/env node
'use strict';
// node tools/unit/run.js [--selftest] [--list] [filter]   (target < 10 s; exit 1 on any NEW FAIL)
// One line per FAIL + a summary. KNOWN = failure listed in tools/unit/known.json (pre-existing data/game problem, ratchet: new ones fail,
// fixed ones are reported as FIXED so the entry can be deleted). Seed mode (UT_SEED=<name>) breaks one input; --selftest proves each seed is caught.
const fs=require('fs'),path=require('path'),cp=require('child_process');
const T0=Date.now();
if(process.argv.includes('--selftest')){
  const S=require('./seeds.js');let bad=0;
  for(const s of S){const r=cp.spawnSync(process.execPath,[__filename,'--quiet'],{env:{...process.env,UT_SEED:s.seed},encoding:'utf8'});
    const hit=new RegExp(s.expect).test(r.stdout)&&r.status===1;if(!hit)bad++;console.log((hit?'SEED_CAUGHT ':'SEED_MISSED ')+s.seed+'  -> '+s.expect)}
  console.log(bad?'SELFTEST FAIL: '+bad+' seed(s) not caught':'SELFTEST OK: '+S.length+' seeded breaks all caught');process.exit(bad?1:0)}
const quiet=process.argv.includes('--quiet'),filt=process.argv.slice(2).filter(a=>!a.startsWith('--'))[0]||'';
let known={};try{known=JSON.parse(fs.readFileSync(path.join(__dirname,'known.json'),'utf8'))}catch(e){}
const R={pass:0,fail:0,known:0,fixed:[],lines:[],group:'',seen:new Set(),times:{},kn:[]};
const upd=process.argv.includes('--update-known');
const T={group(n){R.group=n},
  ok(cond,id,msg){const key=R.group+'/'+id;R.seen.add(key);
    if(cond){if(known[key])R.fixed.push(key);R.pass++;return}
    if(known[key]&&!upd){R.known++;return}R.fail++;R.kn.push([key,(msg||'').slice(0,160)]);R.lines.push('FAIL '+key+(msg?': '+msg:''))},
  eq(a,b,id,msg){this.ok(a===b,id,(msg||'')+' got '+a+' want '+b)},
  near(a,b,tol,id,msg){this.ok(Math.abs(a-b)<=tol,id,(msg||'')+' got '+(+a).toFixed(3)+' want '+b+' ±'+tol)}};
const suites=fs.readdirSync(__dirname).filter(f=>/^(lint|logic)_.*\.js$/.test(f)).sort();
(async()=>{
for(const f of suites){if(filt&&!f.includes(filt))continue;const t=Date.now();
  try{await require('./'+f)(T)}catch(e){R.fail++;R.lines.push('FAIL '+f+'/crash: '+(e.message||e).toString().slice(0,200))}
  R.times[f]=Date.now()-t}
if(upd){const o={...known};for(const [k,m] of R.kn)o[k]=m;fs.writeFileSync(path.join(__dirname,'known.json'),JSON.stringify(o,null,1)+'\n');console.log('known.json updated: +'+R.kn.length);process.exit(0)}
for(const l of R.lines)console.log(l);
for(const k of R.fixed)console.log('FIXED '+k+' (remove from known.json)');
const ms=Date.now()-T0,n=R.pass+R.fail+R.known;
console.log(`UNIT ${R.fail?'FAIL':'OK'}: ${n} assertions · ${R.pass} pass · ${R.fail} FAIL · ${R.known} known · ${ms} ms`+(quiet?'':'  ['+Object.entries(R.times).map(([k,v])=>k.replace(/^(lint|logic)_|\.js$/g,'')+' '+v).join(', ')+']'));
process.exit(R.fail?1:0);
})();
