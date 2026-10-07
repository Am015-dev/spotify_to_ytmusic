
function drawHUD(t){const D=DISTRICTS[G.di];ctx.save();
  const sc=String(G.score).padStart(8,'0'),mu='×'+G.mult.toFixed(1),bs=String(Math.max(best.score,G.score)).padStart(8,'0');
  const hb=Math.floor(G.bp),bi=((hb%4)+4)%4;
  Object.assign(HUDLOG,{score:sc,mult:mu,best:bs,hp:P.hp,hpMax:P.max,heat:Math.round(P.heat),emp:P.emp,wl:P.wl,combo:C.n,district:D.name+(G.loop?' +'+G.loop:''),boss:!!G.boss,bossHp:G.boss?Math.round(G.boss.hp):0,beat:bi,frame:HUDLOG.frame+1});
  ctx.font='700 22px "Chakra Petch",sans-serif';ctx.fillStyle='#fff';ctx.textAlign='left';ctx.fillText(sc,18,32);
  ctx.font='16px "Share Tech Mono",monospace';ctx.fillStyle=D.b;ctx.fillText(mu,138,31);
  ctx.fillStyle='#8c86b8';ctx.font='12px "Share Tech Mono",monospace';ctx.fillText((G.daily?'DAILY ':'BEST ')+(G.daily?String(Math.max(dailyBest.score,G.score)).padStart(8,'0'):bs),18,48);
  ctx.textAlign='right';ctx.font='700 15px "Chakra Petch",sans-serif';ctx.fillStyle=D.a;ctx.fillText(D.name+(G.loop?' +'+G.loop:''),W-18,28);
  const pw=180,px=W-18-pw;ctx.fillStyle='#ffffff18';ctx.fillRect(px,36,pw,4);ctx.fillStyle=G.boss?'#ff3040':D.b;ctx.fillRect(px,36,pw*(G.boss||G.bossDone?1:Math.min(1,G.dt/DIST_LEN)),4);
  ctx.font='11px "Share Tech Mono",monospace';ctx.fillStyle='#8c86b8';ctx.fillText(G.boss?'BOSS':G.bossDone?'CLEAR':'→ '+D.bossName,W-18,54);
  // bottom-left
  const by=H-20;ctx.textAlign='left';ctx.font='11px "Share Tech Mono",monospace';ctx.fillStyle='#8c86b8';ctx.fillText('HULL',18,by-14);
  for(let i=0;i<P.max;i++){ctx.fillStyle=i<P.hp?(P.hp<=1?'#ff3040':'#3dffb0'):'#ffffff1a';ctx.fillRect(18+i*16,by-8,12,8);}
  ctx.fillStyle='#8c86b8';ctx.fillText('HEAT',112,by-14);ctx.fillStyle='#ffffff1a';ctx.fillRect(112,by-8,90,8);
  ctx.fillStyle=P.over?(SET.reduce||Math.floor(t*10)%2?'#ff3040':'#ff304066'):P.heat>70?'#ffa02d':D.b;ctx.fillRect(112,by-8,90*P.heat/100,8);
  ctx.fillStyle='#8c86b8';ctx.fillText('DASH',214,by-14);ctx.fillStyle=P.dashCd<=0?D.a:'#ffffff1a';ctx.fillRect(214,by-8,36*(1-P.dashCd),8);
  ctx.fillStyle='#8c86b8';ctx.fillText('EMP',262,by-14);for(let i=0;i<3;i++){ctx.fillStyle=i<P.emp?'#ffb020':'#ffffff1a';ctx.beginPath();ctx.arc(268+i*14,by-4,4.5,0,7);ctx.fill();}
  ctx.fillStyle='#8c86b8';ctx.fillText('LV'+P.wl,312,by-2);
  // bottom-centre: beat pips (the bright one is the beat you are on) and the combo meter
  ctx.textAlign='center';
  for(let i=0;i<4;i++){const on=i===bi,pr=on?PUL:0;ctx.fillStyle=i===0?D.a:D.b;ctx.globalAlpha=on?.55+.45*pr:.22;const r=(i===0?4.5:3.5)+(on?2.5*pr*FX():0);ctx.beginPath();ctx.arc(W/2-27+i*18,by-4,r,0,7);ctx.fill();}
  ctx.globalAlpha=1;
  if(C.n>=2){ctx.font='700 14px "Chakra Petch",sans-serif';ctx.fillStyle='#ffe14d';ctx.fillText('COMBO '+C.n+'  ×'+comboK().toFixed(2),W/2,by-20);
    const left=clamp(1-(G.bc-C.lb+PHF)/8,0,1);ctx.fillStyle='#ffffff22';ctx.fillRect(W/2-40,by-17,80,3);ctx.fillStyle='#ffe14d';ctx.fillRect(W/2-40,by-17,80*left,3);}
  if(G.note.t>0&&G.note.txt){ctx.globalAlpha=clamp(G.note.t,0,1);ctx.textAlign='right';ctx.font='12px "Share Tech Mono",monospace';ctx.fillStyle='#8c86b8';ctx.fillText(G.note.txt,W-18,H-12);ctx.globalAlpha=1;}
  if(G.hint.t>0&&G.hint.txt&&G.banner.t<=0){ctx.globalAlpha=clamp(G.hint.t,0,1);ctx.textAlign='center';ctx.font='700 15px "Chakra Petch",sans-serif';ctx.fillStyle='#ffffff';ctx.fillText(G.hint.txt,W/2,H-62);ctx.globalAlpha=1;}
  // boss bar
  if(G.boss&&G.boss.x<W){const b=G.boss;ctx.fillStyle='#00000088';ctx.fillRect(W/2-200,30,400,8);ctx.fillStyle='#ff3040';ctx.fillRect(W/2-200,30,400*clamp(b.hp/b.max,0,1),8);
    ctx.textAlign='center';ctx.font='700 12px "Chakra Petch",sans-serif';ctx.fillStyle='#fff';ctx.fillText(DISTRICTS[G.di].bossName+(b.ph>1?'  ·  PHASE '+b.ph:''),W/2,24);}
  // banner
  if(G.banner.t>0){const k=G.banner.t,m=G.banner.m,a=Math.min(1,k*2,(m-k)*4);ctx.globalAlpha=Math.max(0,a);ctx.textAlign='center';
    ctx.fillStyle='#05030cbb';ctx.fillRect(0,H/2-58,W,96);const col=G.banner.warn?'#ff3040':D.a;
    ctx.fillStyle=col;ctx.fillRect(0,H/2-58,W,2);ctx.fillRect(0,H/2+36,W,2);
    ctx.font='700 54px "Chakra Petch",sans-serif';ctx.fillStyle=G.banner.warn&&!SET.reduce&&Math.floor(t*6)%2?'#ffffff':col;ctx.fillText(G.banner.a,W/2+(1-a)*40,H/2+4);
    ctx.font='15px "Share Tech Mono",monospace';ctx.fillStyle='#e9e6ff';ctx.fillText(G.banner.b,W/2,H/2+26);ctx.globalAlpha=1;}
  ctx.restore();}

let PUL=0,PHF=0,FD=0;
function render(t,dt){FD=dt;ctx.setTransform(S,0,0,S,0,0);const sh=G.shake;ctx.save();if(sh)ctx.translate(rnd(-sh,sh)*.5,rnd(-sh,sh)*.5);
  drawBG(bgFor(G.di),t,dt,G.scroll);
  // rain back
  ctx.strokeStyle='rgba(170,190,255,.18)';ctx.lineWidth=1;ctx.beginPath();for(const r of rain){if(!paused){r.y+=r.s*dt;r.x-=r.s*.25*dt;if(r.y>H){r.y=-20;r.x=rnd(0,W+100);}}ctx.moveTo(r.x,r.y);ctx.lineTo(r.x-r.l*.25,r.y+r.l);}ctx.stroke();
  drawPickups(t);
  for(const e of G.en)drawEnemy(e,t);
  // player bullets
  ctx.globalCompositeOperation='lighter';const D=DISTRICTS[G.di];
  for(const b of G.pb){ctx.fillStyle=b.big?'#ffffff':b.pf?'#ffe14d':D.b;ctx.fillRect(b.x-10,b.y-1.5,b.big?22:16,b.big?4:3);G_(b.x,b.y,b.big?12:8,b.pf?'#ffe14d':D.b,.6);}
  for(const p of G.pt){const a=p.l/p.m;if(p.ghost){G_(p.x,p.y,p.sz*2,p.c,a*.5);}else{ctx.globalAlpha=a;ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,p.sz,p.sz);}}
  ctx.globalAlpha=1;
  for(const b of G.eb)G_(b.x,b.y,b.r*3.2,b.c,.9);
  ctx.globalCompositeOperation='source-over';
  ctx.fillStyle='#fff';for(const b of G.eb){ctx.beginPath();ctx.arc(b.x,b.y,b.r*.55,0,7);ctx.fill();}
  drawPlayer(t);
  if(running&&SET.guide&&!G.dead){const r=18+(1-PHF)*36;ctx.strokeStyle=P.dashCd<=0?'#19e3ff':'#8c86b8';ctx.globalAlpha=.12+.4*PHF;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(P.x,P.y,r,0,7);ctx.stroke();ctx.globalAlpha=1;}
  for(const r of G.rings){const k=1-r.l/r.m;ctx.strokeStyle=r.c;ctx.globalAlpha=1-k;ctx.lineWidth=3*(1-k)+1;ctx.beginPath();ctx.arc(r.x,r.y,18+k*52,0,7);ctx.stroke();ctx.globalAlpha=1;}
  ctx.textAlign='center';ctx.font='700 13px "Chakra Petch",sans-serif';for(const f of G.fl){ctx.globalAlpha=Math.min(1,f.l*2);ctx.fillStyle=f.c;ctx.fillText(f.txt,f.x,f.y);}ctx.globalAlpha=1;
  ctx.restore();
  if(G.empT>0){ctx.strokeStyle='#ffb020';ctx.lineWidth=6*G.empT;ctx.beginPath();ctx.arc(P.x,P.y,(0.6-G.empT)*1400,0,7);ctx.stroke();}
  if(G.flash>0){ctx.fillStyle=`rgba(255,255,255,${G.flash*.5})`;ctx.fillRect(0,0,W,H);}
  if(G.glitch>0){for(let i=0;i<6;i++){const y=rnd(0,H),h=rnd(4,26);ctx.drawImage(cv,0,y*S,cv.width,h*S,rnd(-20,20),y,W,h);}ctx.fillStyle=`rgba(255,40,80,${G.glitch*.25})`;ctx.fillRect(0,0,W,H);}
  ctx.drawImage(scan,0,0,W,H);
  if(running)drawHUD(t);}

/* ---------- menus, settings, flow ---------- */
const titleEl=$('title'),overEl=$('over'),pauseEl=$('pausem'),setEl=$('setm');
const HUDLOG={frame:0};
function showBest(){$('bestT').innerHTML=(best.score?`Best run <strong>${best.score.toLocaleString('de-DE')}</strong> · ${best.dist}`:'No runs logged yet')
  +` &nbsp;·&nbsp; Daily <strong>${dailyBest.score?dailyBest.score.toLocaleString('de-DE'):'—'}</strong>`;}
showBest();
function syncUI(){$('touch').hidden=!(running&&touchUI&&!paused);}
function syncSet(){$('sMusic').value=Math.round(SET.music*100);$('vMusic').textContent=Math.round(SET.music*100)+'%';
  $('sSfx').value=Math.round(SET.sfx*100);$('vSfx').textContent=Math.round(SET.sfx*100)+'%';
  $('sSync').value=SET.sync;$('vSync').textContent=(SET.sync>0?'+':'')+SET.sync+' ms';
  $('sReduce').checked=SET.reduce;$('sGuide').checked=SET.guide;$('sMute').checked=SET.mute;}
let setFrom='title';
function openSettings(from){setFrom=from;setEl.hidden=false;titleEl.hidden=true;pauseEl.hidden=true;syncSet();$('setBack').focus();}
function closeSettings(){setEl.hidden=true;if(setFrom==='pause'){pauseEl.hidden=false;$('resumeBtn').focus();}else titleEl.hidden=false;}
$('sMusic').addEventListener('input',e=>{SET.music=+e.target.value/100;saveSet();AU.vol();syncSet();});
$('sSfx').addEventListener('input',e=>{SET.sfx=+e.target.value/100;saveSet();AU.vol();syncSet();});
$('sSync').addEventListener('input',e=>{SET.sync=+e.target.value;saveSet();syncSet();});
$('sReduce').addEventListener('change',e=>{SET.reduce=e.target.checked;saveSet();});
$('sGuide').addEventListener('change',e=>{SET.guide=e.target.checked;saveSet();});
$('sMute').addEventListener('change',e=>{SET.mute=e.target.checked;saveSet();AU.vol();});
$('setBack').addEventListener('click',closeSettings);
$('setBtn').addEventListener('click',()=>openSettings('title'));
$('pSetBtn').addEventListener('click',()=>openSettings('pause'));

function setPause(on){if(!running||on===paused)return;paused=on;pauseEl.hidden=!on;
  if(on){AU.suspend();touch=null;touchFire=false;for(const k in K)K[k]=false;}else{AU.resume();pressed={};}
  syncUI();if(on)$('resumeBtn').focus();}
function start(daily){if(running)return;AU.unlock();pressed={};titleEl.hidden=true;overEl.hidden=true;pauseEl.hidden=true;setEl.hidden=true;
  newGame(daily);G.live=true;running=true;paused=false;AU.resume();AU.startStage(stageFor(0,false));
  FPS.n=0;FPS.t=0;FPS.slow=0;FPS.worst=0;syncUI();}
function restart(){const dl=G.daily;running=false;paused=false;start(dl);}
function quitToTitle(){running=false;paused=false;pauseEl.hidden=true;overEl.hidden=true;titleEl.hidden=false;newGame();G.banner.t=0;P.x=-200;AU.resume();AU.menuMusic();syncUI();showBest();}
function gameOver(){if(!running)return;running=false;const D=DISTRICTS[G.di];const dist=D.name+(G.loop?' +'+G.loop:'');let eye='Signal lost';
  if(G.daily){if(G.score>dailyBest.score){dailyBest={n:todayN(),score:G.score};save('mnr_daily',dailyBest);eye='New daily best';}else eye='Daily run over';}
  else if(G.score>best.score){best={score:G.score,dist};save('mnr_best',best);eye='New best run';}
  $('overEyebrow').textContent=eye;
  $('oScore').textContent=G.score.toLocaleString('de-DE');$('oDist').textContent=dist;$('oPerf').textContent=G.perf;
  $('oBest').innerHTML=G.daily?`Daily best <strong>${dailyBest.score.toLocaleString('de-DE')}</strong>`:`Best <strong>${best.score.toLocaleString('de-DE')}</strong> · ${best.dist}`;
  overEl.hidden=false;overlayReady=false;syncUI();AU.menuMusic();setTimeout(()=>{overlayReady=true;if(!overEl.hidden)$('againBtn').focus();},600);showBest();
  G.over=true;lastDaily=G.daily;}
let lastDaily=false;
$('startBtn').addEventListener('click',()=>start(false));
$('dailyBtn').addEventListener('click',()=>start(true));
$('againBtn').addEventListener('click',()=>start(lastDaily));
$('menuBtn').addEventListener('click',quitToTitle);
$('resumeBtn').addEventListener('click',()=>setPause(false));
$('restartBtn').addEventListener('click',restart);
$('quitBtn').addEventListener('click',quitToTitle);

// attract mode: demo background behind title
newGame();G.banner.t=0;P.x=-200;
let last=performance.now();
function loop(now){const raw=now-last;let dt=Math.min(.05,raw/1000);last=now;
  if(!paused)fbT+=dt;
  if(running&&!paused){update(dt);if(raw<1000&&!document.hidden){FPS.n++;FPS.t+=raw;if(raw>FPS.worst)FPS.worst=raw;if(raw>40)FPS.slow++;}}
  else if(!running){G.t+=dt;G.scroll+=60*dt;for(const p of G.pt){p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;}G.pt=G.pt.filter(p=>p.l>0);}
  if(!running&&!G.dead&&!G.over){G.attract=(G.attract||0)+dt;if(G.attract>9){G.attract=0;const n=(G.di+1)%DISTRICTS.length;G.di=n;bgFor(n);}}
  const bp=bpos(),fr=bp-Math.floor(bp);PHF=fr;PUL=Math.pow(1-fr,2.5)*(((Math.floor(bp)%4)+4)%4===0?1:.65);
  render(G.t,paused?0:dt);requestAnimationFrame(loop);}
fit();requestAnimationFrame(loop);
document.fonts&&document.fonts.ready.then(()=>{for(const k in BGC)delete BGC[k];});
[1500,2300,3100].forEach((ms,i)=>setTimeout(()=>{if(!running)bgFor(i+1);},ms));        // build the other districts' skylines while the title is up
window.__mnr={get G(){return G},get P(){return P},get C(){return C},get BT(){return BT},get TR(){return TR},get SET(){return SET},get J(){return J},get HUD(){return HUDLOG},
  get MSGS(){return MSGS},get FPS(){return FPS},get running(){return running},get paused(){return paused},get rotMode(){return rotMode},get touchUI(){return touchUI},
  get god(){return godMode},set god(v){godMode=!!v;},bpos,judge,mnow,audible,AU,
  skipTo(i){if(!running)return;G.loop=G.loop;G.en=[];G.eb=[];enterDistrict(i);},
  bossNow(){if(running&&!G.boss&&!G.bossDone){G.dt=DIST_LEN;G.en=[];}}};
})();
</script>

</body></html>
