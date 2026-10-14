// Lazy-chunk scanner. usage: node tools/lazy/scan.js <module.js> [more modules...]
// Lists the module's top-level names and, for every OTHER src module, each reference to them: "TOP" = runs at boot (not inside a function), "fn" = inside a function.
const fs=require('fs'),path=require('path'),acorn=require('./acorn.js');
const SRC=path.join(__dirname,'../../src');
const order=fs.readFileSync(path.join(SRC,'ORDER'),'utf8').split('\n').filter(f=>f.endsWith('.js'));
const parse=t=>acorn.parse(t,{ecmaVersion:'latest',sourceType:'module',allowHashBang:true,locations:true});
function topNames(ast){const n=new Map();
 const pat=(p,k)=>{if(p.type==='Identifier')n.set(p.name,k);else if(p.type==='ObjectPattern')p.properties.forEach(q=>pat(q.value||q.argument,k));else if(p.type==='ArrayPattern')p.elements.forEach(q=>q&&pat(q,k));else if(p.type==='AssignmentPattern')pat(p.left,k);else if(p.type==='RestElement')pat(p.argument,k)};
 for(const s of ast.body){if(s.type==='VariableDeclaration')s.declarations.forEach(d=>pat(d.id,s.kind));else if(s.type==='FunctionDeclaration')n.set(s.id.name,'function');else if(s.type==='ClassDeclaration')n.set(s.id.name,'class')}
 return n}
function walk(node,fn,anc=[]){if(!node||typeof node.type!=='string')return;fn(node,anc);anc.push(node);for(const k in node){const v=node[k];if(Array.isArray(v))v.forEach(c=>c&&walk(c,fn,anc));else if(v&&typeof v.type==='string')walk(v,fn,anc)}anc.pop()}
module.exports={parse,topNames,walk,order,SRC};
if(require.main===module){
 const targets=process.argv.slice(2);const names=new Map();
 for(const t of targets){const ast=parse(fs.readFileSync(path.join(SRC,t),'utf8'));for(const[k,v]of topNames(ast))names.set(k,{kind:v,mod:t})}
 console.log('names:',names.size,[...names].map(([k,v])=>k+':'+v.kind[0]).join(' ').slice(0,1500));
 const lets=[...names].filter(([k,v])=>v.kind==='let'||v.kind==='var');if(lets.length)console.log('WARN let/var:',lets.map(l=>l[0]).join(','));
 for(const f of order){if(targets.includes(f))continue;let ast;try{ast=parse(fs.readFileSync(path.join(SRC,f),'utf8'))}catch(e){console.log('PARSE FAIL',f,e.message);continue}
  const out=[];walk(ast,(nd,anc)=>{if(nd.type==='Identifier'&&names.has(nd.name)){const p=anc[anc.length-1];if(p&&((p.type==='MemberExpression'&&p.property===nd&&!p.computed)||(p.type==='Property'&&p.key===nd&&!p.computed&&!p.shorthand)))return;
    const inFn=anc.some(a=>/Function/.test(a.type));const asg=p&&((p.type==='AssignmentExpression'&&p.left===nd)||p.type==='UpdateExpression');out.push((inFn?'fn ':'TOP ')+(asg?'ASSIGN ':'')+nd.name+'@'+nd.loc.start.line)}});
  if(out.length)console.log(f+': '+out.join(' '))}
}
