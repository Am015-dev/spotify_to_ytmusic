'use strict';
// tools/strip.js: drop full-line // comments and own-line /* */ blocks from JS source (built page only; the dev/hot path and src/ stay untouched).
// A small scanner tracks strings, template literals (with ${} nesting), regex literals and comments, so only real comments on lines of their own go.
// Comments mentioning licence/copyright and /*! */ banners are kept. Never renames or minifies anything.
// Usage: require('./strip.js').strip(text) -> text;  CLI: node tools/strip.js file... > out
const KEEP=/licen[sc]e|copyright|\(c\)|@preserve|^\/\*!/i;
const KW=/^(return|typeof|instanceof|in|of|new|delete|void|throw|case|do|else|yield|await)$/;
function strip(s){
 const n=s.length,cut=[];            // cut: [start,end) ranges of own-line comments, end includes the trailing newline
 let i=0,prev='',prevWord='';        // prev: last significant char; prevWord: last identifier if prev is an identifier char
 const tpl=[];                       // stack of brace depths for open ${ inside templates
 let depth=0;
 const lineStart=p=>{let k=p;while(k>0&&s[k-1]!=='\n'){k--}return k};
 const onlyWs=(a,b)=>/^[ \t\r]*$/.test(s.slice(a,b));
 function comment(a,b){const t=s.slice(a,b);if(KEEP.test(t))return;const ls=lineStart(a);if(!onlyWs(ls,a))return;let e=b;while(e<n&&s[e]!=='\n'&&(s[e]===' '||s[e]==='\t'||s[e]==='\r'))e++;if(e<n&&s[e]!=='\n')return;cut.push([ls,e<n?e+1:e])}
 function template(){ // i is just after the opening ` or after a } closing ${ ; scan to the next ${ or closing `
  while(i<n){const c=s[i];if(c==='\\'){i+=2;continue}if(c==='`'){i++;prev='`';prevWord='';return}if(c==='$'&&s[i+1]==='{'){i+=2;tpl.push(depth);depth++;prev='{';prevWord='';return}i++}
 }
 while(i<n){
  const c=s[i];
  if(c==='/'&&s[i+1]==='/'){let e=s.indexOf('\n',i);if(e<0)e=n;comment(i,e);i=e;continue}
  if(c==='/'&&s[i+1]==='*'){let e=s.indexOf('*/',i+2);e=e<0?n:e+2;comment(i,e);i=e;continue}
  if(c==='\''||c==='"'){i++;while(i<n&&s[i]!==c){if(s[i]==='\\')i++;i++}i++;prev='"';prevWord='';continue}
  if(c==='`'){i++;template();continue}
  if(c==='/'){ // regex or division
   const rx=prev===''||(!/[\w$)\]"`}]/.test(prev)&&true)||(/[\w$]/.test(prev)&&KW.test(prevWord))||(prev==='}'&&false);
   if(rx){i++;let cls=false;while(i<n&&s[i]!=='\n'){const d=s[i];if(d==='\\'){i+=2;continue}if(d==='[')cls=true;else if(d===']')cls=false;else if(d==='/'&&!cls)break;i++}i++;while(i<n&&/[a-z]/i.test(s[i]))i++;prev='"';prevWord='';continue}
   i++;prev='/';prevWord='';continue
  }
  if(c==='{'){depth++;prev=c;prevWord='';i++;continue}
  if(c==='}'){depth--;i++;if(tpl.length&&tpl[tpl.length-1]===depth){tpl.pop();template();continue}prev='}';prevWord='';continue}
  if(/[\w$]/.test(c)){let k=i;while(k<n&&/[\w$]/.test(s[k]))k++;prevWord=s.slice(i,k);prev=s[k-1];i=k;continue}
  if(c===' '||c==='\t'||c==='\n'||c==='\r'){i++;continue}
  prev=c;prevWord='';i++
 }
 if(!cut.length)return s;
 let o='',p=0;for(const[a,b]of cut){o+=s.slice(p,a);p=b}return o+s.slice(p)
}
module.exports={strip};
if(require.main===module){const fs=require('fs');process.stdout.write(process.argv.slice(2).map(f=>{const t=fs.readFileSync(f,'utf8');return f.endsWith('.js')?strip(t):t}).join(''))}
