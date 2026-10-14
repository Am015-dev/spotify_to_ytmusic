'use strict';
// tools/unit/lib.js: shared loaders for the fast unit suite. No browser, no deps. Everything is read from src/ (ORDER), never from out/.
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.resolve(__dirname,'..','..'),SRCD=path.join(ROOT,'src');
const SEED=process.env.UT_SEED||'';           // --selftest: break ONE input on purpose; the matching check must FAIL
const cache={};
const memo=(k,f)=>k in cache?cache[k]:(cache[k]=f());
const rd=f=>fs.readFileSync(path.join(SRCD,f),'utf8');
const ORDER=()=>memo('order',()=>rd('ORDER').split('\n').map(s=>s.trim()).filter(Boolean));
const MODS=()=>memo('mods',()=>{const o={};for(const f of ORDER())o[f]=rd(f);return o});
const LAZYL=()=>memo('lazy',()=>{try{return rd('LAZY').split('\n').map(s=>s.trim().replace(/:.*/,'')).filter(s=>s&&s[0]!=='#')}catch(e){return[]}});   // split-1: modules built as xc/ chunks, not in the page
const PAGE=()=>memo('page',()=>{let s=ORDER().filter(f=>!LAZYL().includes(f)).map(f=>MODS()[f]).join('');if(SEED==='credits')s=s.replace(/by Alex/g,'by Bob');if(SEED==='allopen')s=s.replace('ALL_OPEN=true','ALL_OPEN=false');return s});
const JSCODE=()=>memo('js',()=>{let s=ORDER().filter(f=>f.endsWith('.js')).map(f=>MODS()[f]).join('\n');
  const M={'dmg-sqrt':['15*Math.sqrt((v-25)/25)','15*Math.sqrt((v-25)/9)'],'dmg-light':['if(v<25){','if(v<5){'],'traf-burst':['rel>60||','rel>20||'],'tyre':['const CR_TYRE_Y=.03','const CR_TYRE_Y=.12'],'cam-clear':['clr>=CAM.m&&','clr>=-9&&'],'track-grade':['p:[t=>[0,4*bxRamp(t),24*t]]','p:[t=>[0,9*bxRamp(t),24*t]]'],'track-rail':['const BX_RAIL=[[-7,.14,-7,1.4,-1,0,\'k\'],','const BX_RAIL=[[-7,.14,-7,.2,-1,0,\'k\'],'],'stick':['dm=TUNE.stAng/(1+sp/TUNE.stFall)','dm=TUNE.stAng*(1+sp/TUNE.stFall)']};
  const m=M[SEED];if(m){if(!s.includes(m[0]))throw new Error('seed anchor gone: '+SEED);s=s.replace(m[0],m[1])}return s});
// ---- balanced extraction (strings, template literals, comments; regex literals are assumed absent inside data) ----
function skipStr(s,i){const q=s[i];i++;while(i<s.length){const c=s[i];if(c==='\\'){i+=2;continue}if(c===q)return i+1;if(q==='`'&&c==='$'&&s[i+1]==='{'){i=bal(s,i+1)+1;continue}i++}return i}
function bal(s,i){ // i at an opening ( [ { -> index of the matching closer
  const open=s[i],close={'(':')','[':']','{':'}'}[open];let d=0;
  for(;i<s.length;i++){const c=s[i];
    if(c==='"'||c==="'"||c==='`'){i=skipStr(s,i)-1;continue}
    if(c==='/'&&s[i+1]==='/'){while(i<s.length&&s[i]!=='\n')i++;continue}
    if(c==='/'&&s[i+1]==='*'){i=s.indexOf('*/',i+2)+1;continue}
    if(c==='('||c==='['||c==='{'){d++}else if(c===')'||c===']'||c==='}'){d--;if(d===0)return i}}
  throw new Error('unbalanced');}
function constSrc(name,text){const t=text||JSCODE();const m=new RegExp('^(?:const|let|var)\\s+'+name+'\\s*=\\s*','m').exec(t);if(!m)throw new Error('no const '+name);
  let i=m.index+m[0].length;const c=t[i];if(c==='['||c==='{'){return t.slice(i,bal(t,i)+1)}
  let j=i;while(j<t.length&&t[j]!==';'&&t[j]!=='\n'&&t[j]!==','){if('([{'.includes(t[j])){j=bal(t,j)}else if("'\"`".includes(t[j])){j=skipStr(t,j)-1}j++}return t.slice(i,j)}
function fnSrc(name,text){const t=text||JSCODE();const m=new RegExp('(?:^|\\n)\\s*(?:async\\s+)?function\\s+'+name+'\\s*\\(','').exec(t);if(!m)throw new Error('no function '+name);
  const p=t.indexOf('(',m.index+m[0].length-1),pe=bal(t,p);let b=pe+1;while(/\s/.test(t[b]))b++;return t.slice(m.index+(t[m.index]==='\n'?1:0),bal(t,b)+1).trim()}
const lineSrc=name=>{const m=new RegExp('^(?:const|let|var)\\s+'+name+'\\s*=.*$','m').exec(JSCODE());if(!m)throw new Error('no line '+name);return m[0]};
const ev=(src,ctx)=>vm.runInNewContext('('+src+')',ctx||{},{timeout:2000});
// ---- data ----
const jsonBlock=id=>memo('j'+id,()=>{const m=new RegExp('<script type="application/json" id="'+id+'">(.*?)</script>','s').exec(MODS()['02_data_json.html']);return JSON.parse(m[1])});
const FRA=()=>memo('fra',()=>{const d=JSON.parse(JSON.stringify(jsonBlock('rf-data')));if(SEED==='fra-dead')d.streets[0][4].push([99999,99999]);if(SEED==='fra-zero')d.streets[1][4].splice(1,0,d.streets[1][4][0].slice());return d});
const ATH=()=>memo('ath',()=>jsonBlock('ath-data'));
const CHANGELOG=()=>memo('cl',()=>{const a=ev(constSrc('OD_CHANGELOG'));if(SEED==='changelog')a[0].items=[{t:'WRONG',s:''}];return a});
const CHECKLIST=()=>memo('ck',()=>{const a=ev(constSrc('OD_CHECKLIST'));if(SEED==='checklist'){a.push({ver:a[0].ver,id:a[0].id,text:'x'})}return a});
// LDraw chunks: models/<id>.js = __LDC(id, meshes, models); needs a build (out/<ver>/models) -> newest dir that has models/ ; else null
function modelsDir(){return memo('md',()=>{const d=path.join(require('os').tmpdir(),'od_unit_models');fs.mkdirSync(d,{recursive:true});
  const r=require('child_process').spawnSync('python3',[path.join(ROOT,'tools/ld/mkmodels.py'),d],{encoding:'utf8'});return r.status===0&&fs.existsSync(path.join(d,'models'))?d:null})}
function loadModels(){return memo('models',()=>{const d=modelsDir();if(!d)return null;const out={};
  const sb={__LDC:(id,M,D)=>{out[id]={M,D}}};vm.createContext(sb);
  for(const f of fs.readdirSync(path.join(d,'models')))if(f.endsWith('.js'))vm.runInContext(fs.readFileSync(path.join(d,'models',f),'utf8'),sb);
  return {dir:d,chunks:out}})}
// sandbox: run the REAL source of the named consts/functions in a fresh vm context with the given globals (THREE etc.) -> object of the named things
function sandbox(names,globals,extraSrc,preSrc){const parts=preSrc?[preSrc]:[];
  for(const n of names){const isFn=n.startsWith('fn:'),nm=isFn?n.slice(3):n;
    if(isFn)parts.push(fnSrc(nm));else{let c;try{c=constSrc(nm)}catch(e){const m=new RegExp('^(?:const|let|var) [^\\n]*?[,\\s]'+nm+'=([^,;]+)','m').exec(JSCODE());if(!m)throw e;c=m[1]}parts.push('const '+nm+'='+c+';')}}
  const ctx=vm.createContext(Object.assign({Math,JSON,Map,Set,Array,Object,Number,isFinite,console,performance:{now:()=>0}},globals||{}));
  const out=names.map(n=>n.replace(/^fn:/,''));
  vm.runInContext(parts.join('\n')+'\n'+(extraSrc||'')+'\n__out={'+out.join(',')+'};',ctx,{timeout:5000});return Object.assign(ctx.__out,{ctx})}
let THREEp=null;const THREE=()=>THREEp||(THREEp=(fs.existsSync(path.join(ROOT,'node_modules/three/build/three.module.js'))?import(require('url').pathToFileURL(path.join(ROOT,'node_modules/three/build/three.module.js')).href):Promise.resolve(null)));
module.exports={lineSrc,sandbox,THREE,ROOT,SRCD,SEED,ORDER,MODS,PAGE,JSCODE,constSrc,fnSrc,ev,bal,FRA,ATH,CHANGELOG,CHECKLIST,loadModels,modelsDir,rd,jsonBlock};
