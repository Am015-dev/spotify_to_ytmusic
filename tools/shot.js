// shot.js: the shot library (docs/shots/library). One view = one ID, re-shot in place, never a new name.
//   node tools/shot.js <ID> <base url> [--shows "text"] [--build X] [--gap "BENCH_2K row"]   live 852x393 touch shot of ?test=<city>
//   node tools/shot.js <ID> --from <image> [same flags]                                    import an existing image (any format) at 852 wide
//   node tools/shot.js --list [city|category|source ...]   |   --md   (regenerate INDEX.md from index.json)
// ID = <source>_<city>_<category>_<subject>_<nn>; source ref2k|ours|sbs, city fra|ath|any, category from CATS. JPEG <= 150 KB.
const fs=require('fs'),cp=require('child_process'),path=require('path');
const LIB=path.join(__dirname,'..','docs','shots','library'),IDX=LIB+'/index.json';
const CATS=['environment','freeroam','race','boost','smash','cars','traffic','street-life','hud','popups','reveal','terrain'],SRC=['ref2k','ours','sbs'],CITY=['fra','ath','any'];
const args=process.argv.slice(2),flag=n=>{const i=args.indexOf('--'+n);if(i<0)return;const v=args[i+1];args.splice(i,2);return v};
const load=()=>JSON.parse(fs.readFileSync(IDX,'utf8'));
const md=db=>{const e=s=>String(s).replace(/\|/g,'/');
 const rows=db.shots.slice().sort((a,b)=>a.city.localeCompare(b.city)||CATS.indexOf(a.category)-CATS.indexOf(b.category)||a.id.localeCompare(b.id));
 fs.writeFileSync(LIB+'/INDEX.md',`# Shot library (${rows.length} views)\n\nOne canonical view per ID: \`docs/shots/library/<city>/<category>/<ID>.jpg\`. Reuse an ID and re-shoot it with \`node tools/shot.js <ID> <url>\`; never invent a new name for the same view. Generated from index.json by tools/shot.js (do not hand-edit the table).\n\nID = \`<source>_<city>_<category>_<subject>_<nn>\`. source: ref2k (LEGO 2K Drive reference) | ours | sbs (side by side). city: fra | ath | any. Categories: ${CATS.join(', ')}.\nGap column = row of docs/BENCH_2K.md the view serves. "Ours" builds are listed per row; ours shots are 852x393 phone touch unless the ID says portrait.\n\n| ID | File | Source | City | Category | Shows | Build / date | BENCH_2K gap |\n|---|---|---|---|---|---|---|---|\n`+rows.map(s=>`| ${s.id} | [${s.file}](${s.file}) | ${s.source} | ${s.city} | ${s.category} | ${e(s.shows)} | ${e(s.build)} (${s.date}) | ${e(s.gap)} |`).join('\n')+'\n')};
const enc=(src,dst)=>{const w=/\.(png|jpe?g|webp)$/i.test(src)&&+cp.execSync(`identify -format %w "${src}[0]"`)>1600?'-resize 852x':'';
 for(let q=82;;q-=6){cp.execSync(`convert "${src}[0]" ${w} -strip -interlace Plane -quality ${q} "${dst}"`);if(fs.statSync(dst).size<=150000||q<=50)return}};
(async()=>{
 if(args[0]==='--md'){md(load());return console.log('INDEX.md written')}
 if(args[0]==='--list'){const f=args.slice(1);return load().shots.filter(s=>f.every(x=>[s.city,s.category,s.source].includes(x))).forEach(s=>console.log(s.id.padEnd(40),s.build,'|',s.shows))}
 const shows=flag('shows'),build=flag('build'),gap=flag('gap'),from=flag('from');
 const [id,base]=args;if(!id)return console.log('usage: see header of tools/shot.js'),process.exit(2);
 const [source,city,category,subject,nn]=id.split('_');
 if(!SRC.includes(source)||!CITY.includes(city)||!CATS.includes(category)||!subject||!/^\d\d$/.test(nn||''))throw new Error(`bad ID ${id}: <${SRC}>_<${CITY}>_<${CATS}>_<subject>_<nn>`);
 const db=load(),old=db.shots.find(s=>s.id===id);if(!old&&!shows)throw new Error('new ID needs --shows "what it shows"');
 const dir=`${LIB}/${city}/${category}`;fs.mkdirSync(dir,{recursive:true});const dst=`${dir}/${id}.jpg`;let tmp=from;
 if(!from){ // live shot: same recipe as the lane shot tools (SwiftShader, phone touch 852x393)
  if(!base)throw new Error('need a base url or --from');
  const {chromium}=require('/opt/node22/lib/node_modules/playwright');
  const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const p=await(await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true})).newPage();p.setDefaultTimeout(400000);
  await p.goto(base+'?test='+(city==='any'?'fra':city));await p.waitForFunction(()=>window.__chk&&window.__tq&&__tq.ready,null,{timeout:400000});await p.waitForTimeout(3000);
  tmp=dst+'.tmp.png';await p.screenshot({path:tmp});await b.close()}
 enc(tmp,dst);if(!from)fs.unlinkSync(tmp);
 const [w,h]=cp.execSync(`identify -format "%w %h" "${dst}"`).toString().split(' ').map(Number);
 const row={id,file:`${city}/${category}/${id}.jpg`,source,city,category,subject,shows:shows||old.shows,build:build||(old&&old.build)||'unknown',date:new Date().toISOString().slice(0,10),gap:gap||(old&&old.gap)||'-',w,h,bytes:fs.statSync(dst).size};
 db.shots=db.shots.filter(s=>s.id!==id).concat(row);fs.writeFileSync(IDX,JSON.stringify(db,null,1)+'\n');md(db);
 console.log(`${old?'updated':'added'} ${id} ${w}x${h} ${(row.bytes/1024)|0} KB`);
})().catch(e=>{console.error(e.message);process.exit(1)});
