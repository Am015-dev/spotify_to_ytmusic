/* ---------- music power-ups: glowing enemies drop them, collecting one exactly on the beat gives +50% time ----------
   DRUM BURST  drum layer + an auto-shot on every beat, on-beat presses fire double
   TEMPO UP    music x1.25, score x2, more enemies
   SLOW GROOVE music x0.75, enemy bullets slower
   DROP        the music cuts for one bar, then a screen-clearing blast on the next downbeat
   Durations are counted in bars of the music, not seconds. Works with the song files and with the synth. */
const PWK={
  drum:{n:'DRUM BURST',tip:'Auto-fire on every beat',c:'#ffe14d',bars:8,w:3},
  tempo:{n:'TEMPO UP',tip:'Faster beat · score ×2',c:'#ff7a3d',bars:8,w:3,rate:1.25},
  slow:{n:'SLOW GROOVE',tip:'Slower beat and bullets',c:'#5b8cff',bars:8,w:2,rate:.75},
  drop:{n:'DROP',tip:'Blast on the downbeat',c:'#b36bff',bars:2,w:2}};
const PW={bs:1,dstep:-1,drate:0,drev:-1,stat:{auto:0,dbl:0,blast:0,given:0,ended:0},log:[],
  st(){return G.pw||(G.pw={act:[],drop:null,ls:G.score,cnt:16,wv:0});},
  on(k){return !!(G&&G.pw&&G.pw.act.some(a=>a.k===k));},
  cur(){return G.bc+PHF;},                                // position in beats that never jumps when the song changes
  pick(){const s=this.st(),ks=Object.keys(PWK).filter(k=>!this.on(k)&&!(k==='drop'&&s.drop));let t=0;for(const k of ks)t+=PWK[k].w;let r=gx(0,t);for(const k of ks){r-=PWK[k].w;if(r<=0)return k;}return ks[0]||'drum';},
  give(kind,ob){const s=this.st(),K=PWK[kind];this.stat.given++;
    if(kind==='drop'){if(s.drop)return false;const p=bpos();let cutB=Math.ceil(p/4)*4;if((cutB-p)*BT.spb<.1)cutB+=4;
      s.drop={cutB,blastB:cutB+4,b0:p,rev:BT.rev,ob,cs:0,rs:0};}
    else{for(let i=s.act.length-1;i>=0;i--){const a=s.act[i];if(a.k===kind||(K.rate&&PWK[a.k].rate)){s.act.splice(i,1);this.off(a.k);}}   // one tempo power at a time
      s.act.push({k:kind,s:this.cur(),d:K.bars*4*(ob?1.5:1),ob,w:performance.now()});
      if(kind==='slow'){this.bs=.6;for(const b of G.eb)if(!b.sl){b.vx*=.6;b.vy*=.6;b.sl=true;}}}
    floater(P.x,P.y-24,K.n,K.c);if(ob)floater(P.x,P.y-42,'ON BEAT +50% TIME','#ffe14d');
    G.hint={t:3,txt:say(K.tip)};AU.sfx('up');return true;},
  off(kind){if(kind==='slow'){this.bs=1;for(const b of G.eb)if(b.sl){b.vx/=.6;b.vy/=.6;b.sl=false;}}},
  reset(){this.bs=1;this.dstep=-1;try{const a=AU.a;if(a&&AU.cutg){const g=AU.cutg.gain;g.cancelScheduledValues(a.currentTime);g.setTargetAtTime(1,a.currentTime,.01);}}catch(e){}
    if(G)G.pw=null;if(BT.stage&&NR.music.rate!==1)NR.music.setRate(1);},
  tick(dt){const s=this.st(),cur=this.cur();
    for(let i=s.act.length-1;i>=0;i--){const a=s.act[i];if(cur-a.s>=a.d){s.act.splice(i,1);this.stat.ended++;this.log.push({k:a.k,beats:cur-a.s,d:a.d,ob:a.ob,ms:performance.now()-a.w,spb:BT.spb});if(this.log.length>40)this.log.shift();this.off(a.k);}}
    const tp=s.act.find(a=>a.k==='tempo');if(tp){if(G.score>s.ls)G.score+=G.score-s.ls;if(G.waveT>0&&!G.waveWait)G.waveT-=dt*.5;}   // score x2, waves come 1.5x as fast
    s.ls=G.score;
    const rt=s.act.find(a=>PWK[a.k].rate),want=rt?PWK[rt.k].rate:1;if(NR.music.rate!==want)NR.music.setRate(want);   // asks again if a song swap blocked it
    if(s.drop)this.dropTick(s);
    if(s.wv>0)s.wv-=dt;},
  dropTick(s){const d=s.drop,a=AU.a,p=bpos(),R=B=>BT.t0+BT.off+B*BT.spb;
    if(d.rev!==BT.rev){this.reset2();this.blast(d.ob);s.drop=null;return;}   // the song was swapped under the Drop: fire now
    if(a&&a.state==='running'&&BT.src){
      if(!d.cs&&(d.cutB-p)*BT.spb<.15){d.cs=1;const g=AU.cutg.gain,T=Math.max(a.currentTime,R(d.cutB)-.01);g.setTargetAtTime(0,T,.012);
        AU.osc(T,'sawtooth',110,4*BT.spb,.1,AU.fx,1400,2500);AU.noise(T,4*BT.spb,.12,3000,AU.fx);}   // a riser fills the silent bar
      if(!d.rs&&(d.blastB-p)*BT.spb<.15){d.rs=1;const T=Math.max(a.currentTime,R(d.blastB)-.004);AU.cutg.gain.setTargetAtTime(1,T,.008);
        AU.noise(T,.9,.9,300,AU.fx,'lowpass');AU.osc(T,'sine',150,.7,1,AU.fx,28);AU.noise(T,.25,.5,5000,AU.fx);}}
    if(p>=d.blastB){this.blast(d.ob);s.drop=null;}},
  reset2(){try{const a=AU.a;if(a&&AU.cutg){const g=AU.cutg.gain;g.cancelScheduledValues(a.currentTime);g.setTargetAtTime(1,a.currentTime,.01);}}catch(e){}},
  blast(ob){const s=this.st();this.stat.blast++;
    for(const b of G.eb)G.score+=5;G.eb=[];
    for(const e of G.en){if(e.type==='boss'){if(e.x<W-20){e.hp-=ob?55:40;e.flash=.2;e.lasers=[];}}else{e.hp-=ob?40:30;e.flash=.2;}}
    G.flash=Math.max(G.flash,.45*FX());s.wv=.7;floater(P.x,P.y-24,'DROP!','#b36bff');},
  drums(){const a=AU.a;if(!a||a.state!=='running'||!running||paused||!G||G.dead||!this.on('drum')){this.dstep=-1;return;}
    const s16=BT.spb/4,now=a.currentTime;
    if(this.dstep<0||BT.rev!==this.drev||NR.music.rate!==this.drate){this.drev=BT.rev;this.drate=NR.music.rate;this.dstep=Math.ceil((now-BT.t0)/s16);}   // song or speed changed: restart the pattern on the new grid
    while(BT.t0+this.dstep*s16<now+.12){const t=BT.t0+this.dstep*s16;if(t>=now-.01)this.hit(this.dstep,t);this.dstep++;}},
  hit(n,t){const s=((n%16)+16)%16,bar=Math.floor(n/16),D=AU.musv;
    if(s%4===0)AU.osc(t,'sine',165,.3,1.1,D,42);
    if(s===10)AU.osc(t,'sine',150,.2,.5,D,45);
    if(s===4||s===12){AU.noise(t,.2,.7,1800,D,'bandpass');AU.osc(t,'triangle',210,.12,.35,D,120);}
    if(s%2===0&&s%4!==0)AU.noise(t,.05,.3,7500,D);
    if(bar%4===3&&s>=12)AU.osc(t,'sine',240-(s-12)*30,.15,.5,D,110);},   // tom fill at the end of every fourth bar
  /* ----- drawing ----- */
  glyph(k,r,c){ctx.save();ctx.scale(r/11,r/11);ctx.strokeStyle=c;ctx.fillStyle=c;ctx.lineWidth=2;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
    if(k==='drum'){ctx.moveTo(-6,-2);ctx.lineTo(-6,4);ctx.quadraticCurveTo(0,8,6,4);ctx.lineTo(6,-2);ctx.moveTo(6,-2);ctx.ellipse(0,-2,6,2.5,0,0,7);ctx.moveTo(-6,-9);ctx.lineTo(-1,-3.5);ctx.moveTo(6,-9);ctx.lineTo(1,-3.5);}
    else if(k==='tempo'){ctx.moveTo(-6,5);ctx.lineTo(0,0);ctx.lineTo(6,5);ctx.moveTo(-6,-2);ctx.lineTo(0,-7);ctx.lineTo(6,-2);}
    else if(k==='slow'){ctx.moveTo(-6,-5);ctx.lineTo(0,0);ctx.lineTo(6,-5);ctx.moveTo(-6,2);ctx.lineTo(0,7);ctx.lineTo(6,2);}
    else{ctx.moveTo(0,-8);ctx.lineTo(0,3);ctx.moveTo(-5,-2);ctx.lineTo(0,4);ctx.lineTo(5,-2);ctx.moveTo(-6,8);ctx.lineTo(6,8);}
    ctx.stroke();ctx.restore();},
  coin(k,r){const K=PWK[k];ctx.fillStyle='#0a0612';ctx.strokeStyle=K.c;ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<6;i++){const q=i*Math.PI/3+Math.PI/6;ctx.lineTo(Math.cos(q)*r*1.1,Math.sin(q)*r*1.1);}ctx.closePath();ctx.fill();ctx.stroke();this.glyph(k,r*.8,K.c);},
  marker(e,t){const K=PWK[e.pw];ctx.save();ctx.globalCompositeOperation='lighter';G_(0,0,e.r*2.1,K.c,.32+.15*Math.sin(t*3));ctx.globalCompositeOperation='source-over';
    ctx.strokeStyle=K.c;ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.lineDashOffset=-t*18;ctx.beginPath();ctx.arc(0,0,e.r+9,0,7);ctx.stroke();ctx.setLineDash([]);
    ctx.translate(0,-e.r-24);this.coin(e.pw,10);ctx.restore();},
  pickup(p,y,t){const K=PWK[p.k];ctx.save();ctx.translate(p.x,y);ctx.globalCompositeOperation='lighter';G_(0,0,30,K.c,.7);ctx.globalCompositeOperation='source-over';
    ctx.strokeStyle=K.c;ctx.globalAlpha=.7;ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.lineDashOffset=-t*16;ctx.beginPath();ctx.arc(0,0,19,0,7);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
    this.coin(p.k,13);ctx.font='700 10px "Chakra Petch",sans-serif';ctx.textAlign='center';ctx.fillStyle=K.c;wtxt(K.n.split(' ')[0],0,32);ctx.restore();},
  draw(t){const s=G.pw;if(!s)return;
    const d=s.drop;if(d&&bpos()>=d.cutB){ctx.fillStyle='rgba(8,2,20,.28)';ctx.fillRect(0,0,W,H);}   // the bar without music
    if(s.wv>0){const k=1-s.wv/.7;ctx.strokeStyle='#b36bff';ctx.globalAlpha=1-k;ctx.lineWidth=14*(1-k)+2;ctx.beginPath();ctx.arc(P.x,P.y,k*1300,0,7);ctx.stroke();ctx.globalAlpha=1;}},
  hud(t,x0,y0,k){const s=G.pw;if(!s)return;k=k||1;x0=x0==null?18:x0;const cur=this.cur(),items=s.act.map(a=>({k:a.k,rem:a.d-(cur-a.s),tot:a.d,txt:null}));
    if(s.drop){const d=s.drop,p=bpos();items.push({k:'drop',rem:d.blastB-p,tot:d.blastB-d.b0,txt:p<d.cutB?'CUT ON THE DOWNBEAT':'BLAST IN '+Math.max(1,Math.ceil((d.blastB-p)/4))+' BAR'});}
    let y=y0==null?76:y0;
    for(const it of items){const K=PWK[it.k],n=Math.round(it.tot/4),bw=132,sw=bw/n;ctx.save();ctx.translate(x0,y);ctx.scale(k,k);
      ctx.fillStyle='#05030cb0';ctx.fillRect(-6,-20,232,40);
      ctx.translate(14,0);this.coin(it.k,11);ctx.translate(-14,0);
      ctx.textAlign='left';ctx.font='700 14px "Chakra Petch",sans-serif';ctx.fillStyle=K.c;ctx.fillText(K.n,32,-3);
      ctx.textAlign='right';ctx.font='12px "Share Tech Mono",monospace';ctx.fillStyle='#e9e6ff';ctx.fillText(it.txt||Math.max(1,Math.ceil(it.rem/4))+(Math.ceil(it.rem/4)>1?' BARS':' BAR'),220,-3);
      for(let i=0;i<n;i++){const f=clamp(it.rem/4-i,0,1);ctx.fillStyle='#ffffff26';ctx.fillRect(32+i*sw,8,sw-2,5);ctx.fillStyle=K.c;ctx.fillRect(32+i*sw,8,(sw-2)*f,5);}
      ctx.restore();y+=46*k;}}
};
NR.on('spawn',e=>{if(!G.live||e.type==='gate'||G.dead)return;const s=PW.st();if(--s.cnt>0)return;s.cnt=Math.round(gx(22,34));e.pw=PW.pick();});
NR.on('kill',({e})=>{if(!G.live)return;if(e.pw||e.type==='boss')G.pk.push({t:'pw',k:e.pw||PW.pick(),x:e.x,y:e.y,vx:-30,vy:0,bob:0});});
NR.on('pickup',p=>{PW.give(p.k,judge(performance.now()).ok);});
NR.on('tick',dt=>{PW.tick(dt);});
NR.on('beat',()=>{if(!G.live||G.dead||!PW.on('drum'))return;const x=P.x+22,y=P.y;PW.stat.auto++;
  G.pb.push({x,y:y-6,vx:900,vy:-60,dm:1,pf:0},{x,y:y+6,vx:900,vy:60,dm:1,pf:0},{x,y,vx:900,vy:0,dm:1,pf:0});});
NR.on('fire',f=>{if(f.pf&&PW.on('drum')){PW.stat.dbl++;G.pb.push({x:f.x,y:f.y-14,vx:900,vy:-70,dm:1,pf:1},{x:f.x,y:f.y+14,vx:900,vy:70,dm:1,pf:1});}});
NR.on('runStart',()=>PW.reset());NR.on('runEnd',()=>PW.reset());
setInterval(()=>PW.drums(),25);
