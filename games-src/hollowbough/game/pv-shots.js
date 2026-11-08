// W457 shots of the Play view: title, first turn, mid-game, city full, result at 390x844 and 1440x900.  node pv-shots.js [outdir]
const PW=require('/home/user/spotify_to_ytmusic/games-src/node_modules/playwright');
const fs=require('fs');const html=fs.readFileSync(__dirname+'/hollowbough.html');const out=process.argv[2]||__dirname+'/../playable-shots/w457';fs.mkdirSync(out,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function run(b,W,H){const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:W<500,hasTouch:W<500});
  const LIVE=__dirname+'/../../../games/hollowbough';await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.host!=='gns.test')return r.abort();const f=LIVE+decodeURIComponent(u.pathname);if(u.pathname!=='/'&&fs.existsSync(f)&&fs.statSync(f).isFile())return r.fulfill({status:200,path:f});return r.fulfill({status:200,contentType:'text/html',body:html})});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('https://gns.test/');await sleep(500);await p.evaluate(()=>{localStorage.clear();localStorage.setItem('hb_played','1');localStorage.setItem('hb_offer','1');localStorage.setItem('gxt-hollowbough',JSON.stringify({done:1}))});await p.reload();await sleep(1200);
  await p.screenshot({path:`${out}/${W}_1_title.png`});
  await p.evaluate(()=>{AIDELAY=60;UI.noRec=true;newGame('vs')});await sleep(1500);
  await p.evaluate(()=>{while(UI.cards.length)nextCard()});await sleep(500);
  await p.screenshot({path:`${out}/${W}_2_first_turn.png`});
  await p.evaluate(()=>{pvSetTab('meadow')});await sleep(400);await p.screenshot({path:`${out}/${W}_2b_meadow.png`});
  // play on by the AI for the human until mid-game / city full / over
  const step=async n=>{for(let i=0;i<n;i++){const st=await p.evaluate(()=>{if(G.phase==='over')return 'over';while(UI.cards.length&&UI.cards[0].kind!=='over')nextCard();if(UI.animBusy)return 'busy';const a=HB.actor(G);if(G.players[a].ai)return 'ai';act(HB.AI.choose(G,a,'normal'));return 'me'}).catch(e=>'err '+e.message);if(st==='over')return 'over';await sleep(st==='me'?250:120)}return 'run'};
  await step(40);await p.evaluate(()=>{while(UI.cards.length&&UI.cards[0].kind!=='over')nextCard()});await sleep(900);await p.screenshot({path:`${out}/${W}_3_mid.png`});
  await p.evaluate(()=>pvSetTab('city'));await sleep(300);await p.screenshot({path:`${out}/${W}_3b_city.png`});
  let r='run';for(let k=0;k<20&&r!=='over';k++){r=await step(40);const n=await p.evaluate(()=>G.players[0].city.length);if(n>=15&&!fs.existsSync(`${out}/${W}_4_city_full.png`)){await p.evaluate(()=>pvSetTab('city'));await sleep(300);await p.screenshot({path:`${out}/${W}_4_city_full.png`})}}
  await sleep(2500);await p.screenshot({path:`${out}/${W}_5_result.png`});
  console.log(W,'errors:',errs.length?errs.slice(0,3).join(' | '):'none','phase',await p.evaluate(()=>G.phase));await ctx.close()}
(async()=>{const b=await PW.chromium.launch();const only=process.argv[3];if(!only||only==='390')await run(b,390,844);if(!only||only==='1440')await run(b,1440,900);await b.close()})();
