// pack.js <outdir> : builds out/<ver>/xc/<name>.js for every module in src/LAZY ("99c_checklist.js" or "81_story.js:a,b" = exports), prints {name:hash} JSON.
// A chunk file = window.__XC[name]=<module source as a JSON string>; (the page evals it in module scope, src/10z_lazy.js).
// With exports the source gets a last expression ({a,b}) so the eval returns them; the page declares the stubs (see 10z_lazy.js).
const fs=require('fs'),path=require('path'),crypto=require('crypto'),acorn=require('./acorn.js');
const SRC=path.join(__dirname,'../../src'),OUT=path.join(process.argv[2],'xc');fs.mkdirSync(OUT,{recursive:true});
const lines=fs.existsSync(SRC+'/LAZY')?fs.readFileSync(SRC+'/LAZY','utf8').split('\n').map(s=>s.trim()).filter(s=>s&&!s.startsWith('#')):[];
const V={};
for(const l of lines){const[f,ex]=l.split(':'),name=f.replace(/\.js$/,'');let code=fs.readFileSync(path.join(SRC,f),'utf8');
 if(ex)code+='\n;({'+ex+'});\n';
 try{acorn.parse(code,{ecmaVersion:'latest',sourceType:'module',allowHashBang:true})}catch(e){console.error('LAZY pack: '+f+' does not parse: '+e.message);process.exit(1)}
 const out='window.__XC=window.__XC||{};window.__XC['+JSON.stringify(name)+']='+JSON.stringify(code).replace(/[\u0080-\uffff]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'))+';\n';
 fs.writeFileSync(path.join(OUT,name+'.js'),out);V[name]=crypto.createHash('md5').update(out).digest('hex').slice(0,8)}
process.stdout.write(JSON.stringify(V));
