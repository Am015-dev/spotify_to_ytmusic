// Story balance by simulation (headless, jsdom): the "newcomer" seat is played by the computer at a chosen skill, against
// the chapter's rival and twist exactly as the story sets them up. Prints win rate per chapter.
//   node campsim.js [N=60] [chapters=1,2,...] [skill=normal|easy|hard]     (skill of the stand-in for the player)
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync('kot2.html','utf8');
const N=+process.argv[2]||60,CH=(process.argv[3]||'1').split(',').map(Number),SK=process.argv[4]||'normal';
const w=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:false,url:'http://localhost/'}).window;w.eval('ANIM=0;AIDELAY=0;UI.paused=false');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{for(const ch of CH){let win=0,star=0,done=0,turns=0;
  for(let g=0;g<N;g++){
    w.eval(`setSeed(${1000+g*17+ch});UI.intro=false;UI.hints=false;const def=window.CAMPAIGN.chapters[${ch-1}];${process.env.OVR?`Object.assign(def.setup,${process.env.OVR});`:''}campStart(def);UI.intro=false;UI.coach=-1;UI.tour=false;UI.firstGame=false;const me=G.pl.find(p=>p.human);window.__me=me.i;me.human=false;me.lvl='${SK}';G.pl.forEach(p=>{if(p!==me)p.lvl=def.opponent.aiLevel});UI.camp=def;schedule()`);
    for(let t=0;t<4000;t++){if(w.eval('!!(G&&G.winner)'))break;await sleep(0)}
    const r=w.eval('(()=>{const def=UI.camp||window.CAMPAIGN.chapters['+(ch-1)+'];G.pl[window.__me].human=true;const won=campIsWon(G,def);G.pl[window.__me].human=false;return {won,win:G.winner,turn:G.turn}})()');
    if(r.win){done++;turns+=r.turn;if(r.won)win++}}
  console.log('chapter',ch,w.eval(`window.CAMPAIGN.chapters[${ch-1}].title`)+' ·',w.eval(`window.CAMPAIGN.chapters[${ch-1}].opponent.aiLevel`),'rival · stand-in',SK,'· finished',done+'/'+N,'· win',(100*win/Math.max(1,done)).toFixed(0)+'%','· avg turns',(turns/Math.max(1,done)).toFixed(1))}
 process.exit(0)})();
