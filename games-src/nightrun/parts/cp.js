/* ---------- CHECKPOINTS WITH GRACE (flag RET.cp, off with ?cp=0 = exactly the old game). Test: ret-cp-test.js ----------
   A long stage (>= 150 s: Classic length, a boss with a long approach) gets a checkpoint at about 1/3 and 2/3, bar-aligned, never inside a boss fight and never in the last 15 s.
   Passing one snapshots the run (score, kills, perks, weapons, Neon). Dying after one offers RESUME FROM CHECKPOINT on the run-end screen (one resume per checkpoint, 2 per stage).
   A resume is the normal stage start (same calls as startStory) with the snapshot put back, the stage clock (G.dbar / G.dt) and the song moved to the checkpoint bar, half hull (>= 2),
   3 s of invulnerability with a shimmer and the bullets near the ship cleared. The run is marked ↺: Neon x0.75, stars but no hull-lost star, no Heat medal (it counts as an assist run for
   RET.assistRun), the stage still clears and counts for the story. Arcade 3-minute stages, challenges, Endless and the Lab have none. The stage run emits runStart with {resume:true}. */
if(RET.cp===undefined)RET.cp=!/[?&]cp=0/.test(location.search);
const CHK=window.CHK={min:150,last:15,max:2,grace:3,clr:150,k:.75,plan:[],sn:null,n:0,used:{},marked:false,inRow:false,gt:0,f0:0,sNo:0,
  barS(){const s=ST.def.song,t=TR.by[s],m=SONGM[s],bpm=(t&&t.bpm)||(m&&m.bpm)||BT.bpm||120;return 240/bpm;},
  /* the bars (of the stage clock G.dbar) where the checkpoints sit; [] when this stage has none */
  build(){this.plan=[];if(!RET.cp||!ST.on||ST.ch||G.lab||G.tut)return;
    const bs=this.barS(),boss=ST.def.goal.k==='boss'||ST.def.goal.k==='mini',end=boss?ST.lead:ST.len,dur=ST.len*bs;
    if(dur<this.min||(ARC.active()&&dur<=this.min+.5))return;
    const lim=end-Math.ceil(this.last/bs);
    for(const f of [1/3,2/3]){const b=Math.round(end*f);if(b>=4&&b<=lim&&(!this.plan.length||b-this.plan[this.plan.length-1].bar>=8))this.plan.push({bar:b,end,hit:false});}},
  take(i){const p=this.plan[i];p.hit=true;
    this.sn={i,bar:p.bar,n:ST.n,dt:G.dt,t:G.t,score:G.score,kills:G.kills,perf:G.perf,hits:ST.hits,assist:G.assist|0,pmax:P.max,
      sh:{got:Object.assign({},SH.got),order:SH.order.slice(),sh:SH.sh,spare:SH.spare,neon:SH.neon,earned:SH.earned,acc:SH.acc||0,picks:SH.picks,pits:SH.pits},
      wp:{eq:WP.eq.slice(),lv:Object.assign({},WP.lv),xp:Object.assign({},WP.xp),vc:WP.vc},pwl:Object.assign({},PWL)};
    banner('CHECKPOINT','progress saved',false,1.5);AU.sfx('up');NR.emit('checkpoint',{i,bar:p.bar,n:ST.n});},
  eligible(){const s=this.sn;return !!RET.cp&&!!s&&s.n===ST.n&&!this.used[s.i]&&this.n<this.max;},
  /* the song and the beat clock to the checkpoint bar: BT.t0 moves back by the song position of that bar, the file is started at the same place.
     Both are bar-aligned, so the grid does not move; a file that cannot seek is caught by the normal stream sync (strSync) and the next bar line. */
  seek(bar){const sec=(BT.mode==='file'?BT.off:0)+bar*4*BT.spb;BT.t0-=sec;BT.rev++;return sec;},
  go(){const s=this.sn;if(!this.eligible())return false;
    const n=s.n,b=SH.lastBank|0;this.used[s.i]=true;this.n++;this.marked=true;
    if(b>0){GA.bank=Math.max(0,GA.bank-b);}GA.runs=Math.max(0,GA.runs-1);gsave();   // the death already banked this run; the resumed run banks again at its end
    if(RET.fails&&this.f0!=null){if(this.f0)RET.fails[n]=this.f0;else delete RET.fails[n];RET.saveFails();}   // the death is not a failed try
    pressed={};overEl.hidden=true;pauseEl.hidden=true;resEl.hidden=true;$('stBtn2').hidden=true;
    ST.setLevel(n);ST.on=true;newGame(false);ST.begin();
    SH.got=Object.assign({},s.sh.got);SH.order=s.sh.order.slice();SH.sh=s.sh.sh;SH.spare=s.sh.spare;SH.recalc();   // before runStart: the add-ons read the perks there
    G.live=true;running=true;paused=false;AU.resume();NR.music.rate=1;AU.startStage(ST.def.song);AU.intense(false);
    const t=BT.t0,file=BT.mode==='file',sec=this.seek(s.bar);
    if(file&&AU.a&&AU.cur){AU.strGo(AU.cur,AU.a.currentTime+(t-mnow()),sec,true);}   // the stream starts again at the checkpoint place (same start time as startStage used)
    NR.emit('runStart',{daily:false,story:n,resume:true});
    this.marked=true;
    SH.neon=s.sh.neon;SH.earned=s.sh.earned;SH.acc=s.sh.acc;SH.picks=s.sh.picks;SH.pits=s.sh.pits;SH.live=true;
    WP.eq=s.wp.eq.slice();WP.lv=Object.assign({},s.wp.lv);WP.xp=Object.assign({},s.wp.xp);WP.vc=s.wp.vc;WP.sync();
    for(const k in PWL)delete PWL[k];Object.assign(PWL,s.pwl);
    G.assist=s.assist;G.score=s.score;G.kills=s.kills;G.perf=s.perf;G.t=s.t;G.dt=s.dt;DIR.ldt=G.dt;G.dbar=bpos()/4;ST.hits=s.hits;
    P.max=s.pmax;P.hp=Math.min(P.max,Math.max(2,Math.ceil(P.max/2)));P.inv=Math.max(P.inv,this.grace);this.gt=this.grace;
    G.mult=1;G.waveT=2.4;
    banner('RESUMED','half hull · '+this.grace+' s grace · ↺ no records',false,2.4);G.note={t:5,txt:'↺ RESUMED · Neon ×'+this.k+' · no records'};
    for(const e of this.plan)if(e.bar<=s.bar)e.hit=true;
    FPS.n=0;FPS.t=0;FPS.slow=0;FPS.worst=0;syncUI();return true;}};

/* a new stage run (not a resume): plan the checkpoints, forget the last run */
NR.on('runStart',d=>{if(d&&d.resume)return;CHK.sn=null;CHK.n=0;CHK.used={};CHK.marked=false;CHK.gt=0;CHK.plan=[];
  if(!RET.cp||!d||!d.story)return;CHK.f0=RET.fails?(RET.fails[d.story]|0):0;CHK.build();});
NR.on('tick',dt=>{if(!RET.cp||!running||!ST.on||!G.live)return;
  if(CHK.gt>0&&!G.dead){CHK.gt=Math.max(0,CHK.gt-dt);P.inv=Math.max(P.inv,Math.min(CHK.gt,.5)+.05);   // the grace: nothing can hurt the ship
    for(let i=G.eb.length-1;i>=0;i--){const b=G.eb[i];if(Math.hypot(b.x-P.x,b.y-P.y)<CHK.clr)G.eb.splice(i,1);}}
  if(G.dead||G.boss||ST.over||SH.active||!CHK.plan.length)return;
  for(let i=0;i<CHK.plan.length;i++){const p=CHK.plan[i];if(!p.hit&&G.dbar>=p.bar&&G.dbar<p.end){CHK.take(i);break;}}});
/* marked run: counts like an assist run (no Heat medal, no records), pays 75%, no hull-lost star */
{const ar=RET.assistRun;RET.assistRun=()=>ar()||(RET.cp&&CHK.marked&&!CHK.inRow);
 const rr=RET.resultRow;RET.resultRow=function(){CHK.inRow=true;let s;try{s=rr.call(this);}finally{CHK.inRow=false;}
   return s+(RET.cp&&CHK.marked?'<div class="sr"><span class="sg">↺</span> Resumed run · Neon ×'+CHK.k+', no records</div>':'');};
 const pc=RET.payClear;RET.payClear=function(n,sum){const pay=pc.call(this,n,sum);if(!RET.cp||!CHK.marked||!(pay>0))return pay;
   const cut=Math.round(pay*(1-CHK.k));GA.bank=Math.max(0,GA.bank-cut);gsave();if(this.last)this.last.pay=pay-cut;return pay-cut;};}
NR.on('stageClear',()=>{if(RET.cp&&CHK.marked&&ST.stars)ST.stars[2]=0;});
NR.on('banked',()=>{if(!RET.cp||!CHK.marked||!(SH.lastBank>0))return;const cut=Math.round(SH.lastBank*(1-CHK.k));GA.bank=Math.max(0,GA.bank-cut);SH.lastBank-=cut;SH.lastTotal=GA.bank;gsave();});

/* the run-end button */
{const st=document.createElement('style');st.textContent=`
#cpBox{width:100%;max-width:min(92%,420px);margin:.4em auto .2em;text-align:center}
#cpBox button{display:block;width:100%;min-height:56px;font-size:clamp(17px,min(4.6vw,3vh),22px);padding:.5em .8em;border:2px solid #ffe14d;background:#2a2008;color:#ffe14d;border-radius:12px;font-weight:700;letter-spacing:.04em}
#cpBox p{margin:.4em 0 0;font:14px/1.35 var(--mono,monospace);color:#e9e6ff}`;document.head.appendChild(st);}
function chkBox(){let e=$('cpBox');if(!e){const host=$('over').querySelector('.in');e=document.createElement('div');e.id='cpBox';e.hidden=true;
  e.innerHTML='<button type="button" id="cpResume">↺ RESUME FROM CHECKPOINT</button><p id="cpNote"></p>';host.insertBefore(e,host.querySelector('.row'));
  $('cpResume').addEventListener('click',()=>{if(!overlayReady)return;CHK.go();});}return e;}
NR.on('runEnd',d=>{if(!RET.cp)return;const e=chkBox();
  if(CHK.marked&&d&&d.story&&!d.quit){const el=$('oNeon');if(el){const a=SH.lastBank|0;el.innerHTML=a?'Banked '+neonI+' <strong>+'+a+'</strong> · garage '+GA.bank:'Banked nothing';}retShow();}
  const on=!!d&&!!d.story&&!d.cleared&&!d.quit&&CHK.eligible();e.hidden=!on;
  if(on){$('cpNote').textContent='Half hull, '+CHK.grace+' s safe. Marked ↺: Neon ×'+CHK.k+', no records.';setTimeout(()=>{if(!overEl.hidden&&!e.hidden)$('cpResume').focus();},700);}});

/* the flags on the progress bar (landscape: the bar under the stage name; portrait: the hairline on the top edge) and the shimmer round the ship */
{const flag=(x,y,h,col,s)=>{ctx.fillStyle=col;ctx.fillRect(x-s*.5,y,s,h);ctx.beginPath();ctx.moveTo(x+s*.5,y);ctx.lineTo(x+s*.5+h*.55,y+h*.3);ctx.lineTo(x+s*.5,y+h*.6);ctx.closePath();ctx.fill();};
 const hud=drawHUD;drawHUD=function(t){hud(t);if(!RET.cp||!ST.on||!CHK.plan.length)return;
   ctx.save();ctx.translate(W,0);ctx.scale(HKL,HKL);ctx.translate(-W,0);const pw=180,px=W-18-pw;
   for(const p of CHK.plan)flag(px+pw*Math.min(1,p.bar/p.end),31,13,p.hit?'#19e3ff':'#ffe14d',2);ctx.restore();};
 const hudp=drawHUDP;drawHUDP=function(t){hudp(t);if(!RET.cp||!ST.on||!CHK.plan.length)return;
   ctx.save();const k=HK,w=PW_;for(const p of CHK.plan)flag(w*Math.min(1,p.bar/p.end),0,12*k,p.hit?'#19e3ff':'#ffe14d',2.5*k);ctx.restore();};
 const dpk=drawPickups;drawPickups=function(t){dpk(t);if(!RET.cp||!(CHK.gt>0)||G.dead||!running)return;
   const f=Math.min(1,CHK.gt/CHK.grace),pulse=SET.reduce?1:.75+.25*Math.sin(t*22);
   ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#7df9ff';ctx.fillStyle='#7df9ff';
   ctx.globalAlpha=.16*f;ctx.beginPath();ctx.arc(P.x,P.y,34,0,7);ctx.fill();
   ctx.globalAlpha=.85*pulse*Math.min(1,f*2.5);ctx.lineWidth=3;ctx.setLineDash([10,7]);ctx.lineDashOffset=-t*60;ctx.beginPath();ctx.arc(P.x,P.y,34,0,7);ctx.stroke();ctx.restore();};}
