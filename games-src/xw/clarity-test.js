// Clarity-pass checks (Oct 2026): bugs the blind playtesters hit. node clarity-test.js
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync('nebula.html','utf8');
function fresh(sq,players,ex){const w=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'}).window;w.eval('ANIM=0;AIDELAY=0;setSeed(7)');
  w.__sq=sq;w.__ex=Object.assign({w1:true,w2:true,w3:true,noRocks:true},ex||{});w.eval(`newGame({fac:[0,1],players:${JSON.stringify(players||[{human:false},{human:false}])},squads:window.__sq,ex:window.__ex})`);return w}
const E=(w,c)=>{try{return w.eval(c)}catch(e){return 'ERR '+e.message}};
let ok=0,bad=0;const T=(n,c,x)=>{if(c)ok++;else{bad++;console.log('FAIL',n,x===undefined?'':JSON.stringify(x))}};

// 1. The ★ suggested maneuver never flies into an asteroid or off the mat when a clean move exists (both testers were flown into rocks).
{const w=fresh([[{p:'kael',u:[]},{p:'wren',u:[]}],[{p:'slate',u:[]},{p:'knife',u:[]}]]);
  const r=E(w,`(()=>{setSeed(11);const bad=[];let n=0;
    for(let t=0;t<160;t++){G.rocks=[];for(let i=0;i<6;i++){const o=rockShape();o.x=120+rnd(674);o.y=120+rnd(674);G.rocks.push(o)}
      G.ships.forEach(s=>{s.x=60+rnd(794);s.y=60+rnd(794);s.h=rnd(628)/100;s.stress=rnd(3)?0:1});G.phase='plan';UI.sugCache=null;UI.rhC=null;UI.draft={};
      for(const s of G.ships.filter(x=>x.side===0)){const d=dialOf(s);const clean=i=>rockHits(s,d[i])===0&&!offBoard(finalPose(s,B(s),d[i]),B(s))&&!(s.stress&&exColor(s,d[i]).c==='r');
        if(!d.some((m,i)=>clean(i)))continue;n++;const sg=suggestDial(s);if(!clean(sg))bad.push([t,s.id,sg,rockHits(s,d[sg])])}}
    return {n,bad:bad.slice(0,5),nb:bad.length}})()`);
  T('suggestion avoids asteroids, the edge and blocked reds ('+r.n+' cases)',r.nb===0,r)}

// 2. The win line is written for the player who reads it ("Iron Armada wins: every enemy ship is destroyed" read like a win to the loser).
{const w=fresh([[{p:'kael',u:[]}],[{p:'slate',u:[]}]],[{human:true},{human:false}]);
  const r=E(w,`(()=>{G.ships[0].alive=false;G.phase='combat';checkWin();return [G.winner,winLine()]})()`);
  T('loss reads as a loss',/^You lose/.test(r[1]),r);
  const r2=E(fresh([[{p:'kael',u:[]}],[{p:'slate',u:[]}]],[{human:true},{human:false}]),`(()=>{G.ships[1].alive=false;G.phase='combat';checkWin();return winLine()})()`);
  T('win reads as a win',/^You win/.test(r2),r2)}

// 3. The round summary counts every point of damage, not only attack results (a crit card's fire and asteroid hits were missing: "0 damage taken").
{const w=fresh([[{p:'kael',u:[]}],[{p:'slate',u:[]}]],[{human:true},{human:false}]);
  const r=E(w,`(()=>{G.round=1;G.phase='plan';hpMark();const s=G.ships[0];s.sh-=1;lg(0,sname(s)+' flies through an asteroid: rolls hit.');lg(-1,'End of round 1.');G.round=2;hpMark();UI.sumSeen=0;return summaryHTML()})()`);
  T('summary damage taken includes non-attack damage',/<b>1<\/b><span>damage taken/.test(r),r.slice(0,400));
  T('summary lists the asteroid hit',/asteroid/.test(r))}

// 4. A ship's hull and shields are on its board tag (testers never saw their health until they died).
{const w=fresh([[{p:'kael',u:[]}],[{p:'slate',u:[]}]],[{human:true},{human:false}]);
  const r=E(w,`(()=>{const s=G.ships[0];s.sh=1;return hpText(s)})()`);
  T('hp text shows hull and shields',/3/.test(r)&&/1/.test(r),r)}

console.log('clarity checks: ok',ok,'failed',bad);process.exit(bad?1:0);
