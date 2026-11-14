// POP-TEXT TEST (R25): plays full games in the real page (seat 0 = the human, played by the computer's own pick; seat 1 = the rival)
// and checks EVERY labelled score pop against the real score change of that render:
//  - the headline number and sign ("You score 5 pts" / "Teal loses 3 pts") equal the seat's total change;
//  - a listed reason ("palaces +5, coins −3") adds up to that change; a single coin reason ("spent 3 coins") equals it;
//  - plain grammar: "You score/lose", "<Name> scores/loses", "1 pt" vs "N pts", no "gains"/"1 camels".
//   node pop-text-test.js [games=6] [file=sands.html]     exit 1 on any mismatch or page error
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs'),path=require('path');const N=+process.argv[2]||6;const FILE=path.resolve(__dirname,process.argv[3]||'sands.html');
(async()=>{const html=fs.readFileSync(FILE,'utf8');const b=await PW.chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.route('**/*',r=>{const u=r.request().url();if(u.startsWith('https://pop.test/'))return r.fulfill({status:200,contentType:'text/html',body:html});return r.abort()});
 await p.goto('https://pop.test/');await p.waitForTimeout(800);
 const res=await p.evaluate(async N=>{ANIM=0;AIDELAY=0;const bad=[],seen=[];let pops=[];
  const op=plPop;plPop=function(i,d,why){pops.push([i,d,why]);return op.apply(this,arguments)};
  let last=null,lastSeed=null;const or=render;render=function(){pops=[];or.apply(this,arguments);if(!G||!G.pl)return;   // the change since the previous render, as the pop layer sees it
   const after=G.pl.map(q=>shownTotal(q));const before=lastSeed===G.seed?last:null;last=after;lastSeed=G.seed;if(!before){if(pops.length)bad.push('pop on first render');return}
   for(const [i,d,why] of pops){seen.push(why);const real=after[i]-before[i];const w=String(why);
     const m=/^(You|.+?) (score|scores|lose|loses) (\d+) (pt|pts)\b(.*)$/.exec(w);if(!m){bad.push('unparsed: '+w);continue}
     const n=+m[3],sg=/score/.test(m[2])?1:-1;if(sg*n!==real||d!==real)bad.push(`headline ${sg*n} vs real ${real}: ${w}`);
     if((n===1)!==(m[4]==='pt'))bad.push('plural: '+w);if((m[1]==='You')!==(m[2]==='score'||m[2]==='lose'))bad.push('grammar: '+w);
     const rest=m[5];const nums=[...rest.matchAll(/ ([+−])(\d+)/g)];
     if(nums.length){const s=nums.reduce((t,x)=>t+(x[1]==='+'?1:-1)*(+x[2]),0);if(s!==real)bad.push(`parts add to ${s} vs ${real}: ${w}`)}
     const c=/(spent|earned) (\d+) coins?/.exec(rest);if(c&&(c[1]==='spent'?-1:1)*(+c[2])!==real)bad.push(`coins ${c[2]} vs ${real}: ${w}`);
     if(/\d/.test(rest)&&!nums.length&&!c)bad.push('unchecked number: '+w);if(/\bgains\b|\b1 camels\b|\b1 coins\b/.test(w))bad.push('grammar: '+w)}};
  for(let g=0;g<N;g++){DEFSEED=1000+g;newGame({np:2,seats:['human','ai']});UI.modal=null;render();let k=0;
   while(!G.over&&k++<4000){const s=sideToAct();if(s<0)break;const m=aiMove(s);if(!m)break;performMove(m,s);render()}
   if(!G.over)bad.push('game '+g+' did not finish')}
  return {bad,n:seen.length,sample:seen.filter((x,j)=>j%Math.max(1,Math.floor(seen.length/8))===0).slice(0,8)}},N);
 console.log('pops checked:',res.n);console.log('samples:\n  '+res.sample.join('\n  '));
 if(errs.length)console.log('PAGE ERRORS',errs.slice(0,5));if(res.bad.length)console.log('MISMATCH ('+res.bad.length+'):\n  '+res.bad.slice(0,15).join('\n  '));
 const ok=!errs.length&&!res.bad.length&&res.n>20;console.log(ok?'POP-TEXT PASS':'POP-TEXT FAIL');await b.close();process.exit(ok?0:1)})();
