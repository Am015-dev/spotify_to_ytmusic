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
const PAGE=()=>memo('page',()=>{let s=ORDER().map(f=>MODS()[f]).join('');if(SEED==='credits')s=s.replace(/by Alex/g,'by Bob');if(SEED==='allopen')s=s.replace('ALL_OPEN=true','ALL_OPEN=false');return s});
const JSCODE=()=>memo('js',()=>ORDER().filter(f=>f.endsWith('.js')).map(f=>MODS()[f]).join('\n'));
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
  let i=m.index+m[0].length;const c=t[i];if(c==='['||c==='{'||c==='('){return t.slice(i,bal(t,i)+1)}
  let j=i;while(j<t.length&&t[j]!==';'&&t[j]!=='\n')j++;return t.slice(i,j)}
function fnSrc(name,text){const t=text||JSCODE();const m=new RegExp('(?:^|\\n)\\s*(?:async\\s+)?function\\s+'+name+'\\s*\\(','').exec(t);if(!m)throw new Error('no function '+name);
  const p=t.indexOf('(',m.index+m[0].length-1),pe=bal(t,p);let b=pe+1;while(/\s/.test(t[b]))b++;return t.slice(m.index+(t[m.index]==='\n'?1:0),bal(t,b)+1).trim()}
const ev=(src,ctx)=>vm.runInNewContext('('+src+')',ctx||{},{timeout:2000});
// ---- data ----
const jsonBlock=id=>memo('j'+id,()=>{const m=new RegExp('<script type="application/json" id="'+id+'">(.*?)</script>','s').exec(MODS()['02_data_json.html']);return JSON.parse(m[1])});
const FRA=()=>memo('fra',()=>{const d=JSON.parse(JSON.stringify(jsonBlock('rf-data')));if(SEED==='fra-dead')d.streets[0][4].push([99999,99999]);if(SEED==='fra-zero')d.streets[1][4].splice(1,0,d.streets[1][4][0].slice());return d});
const ATH=()=>memo('ath',()=>jsonBlock('ath-data'));
const CHANGELOG=()=>memo('cl',()=>{const a=ev(constSrc('OD_CHANGELOG'));if(SEED==='changelog')a[0].items=[{t:'WRONG',s:''}];return a});
const CHECKLIST=()=>memo('ck',()=>{const a=ev(constSrc('OD_CHECKLIST'));if(SEED==='checklist'){a.push({ver:a[0].ver,id:a[0].id,text:'x'})}return a});
// LDraw chunks: models/<id>.js = __LDC(id, meshes, models); needs a build (out/<ver>/models) -> newest dir that has models/ ; else null
function modelsDir(){return memo('md',()=>{const o=path.join(ROOT,'out');if(!fs.existsSync(o))return null;
  const L=fs.readdirSync(o).map(n=>({n,t:fs.existsSync(path.join(o,n,'models'))?fs.statSync(path.join(o,n,'models')).mtimeMs:0})).filter(x=>x.t).sort((a,b)=>b.t-a.t);return L[0]?path.join(o,L[0].n):null})}
function loadModels(){return memo('models',()=>{const d=modelsDir();if(!d)return null;const out={};
  const sb={__LDC:(id,M,D)=>{out[id]={M,D}}};vm.createContext(sb);
  for(const f of fs.readdirSync(path.join(d,'models')))if(f.endsWith('.js'))vm.runInContext(fs.readFileSync(path.join(d,'models',f),'utf8'),sb);
  return {dir:d,chunks:out}})}
module.exports={ROOT,SRCD,SEED,ORDER,MODS,PAGE,JSCODE,constSrc,fnSrc,ev,bal,FRA,ATH,CHANGELOG,CHECKLIST,loadModels,modelsDir,rd,jsonBlock};
