const near=s=>pl&&Math.abs(s.dist-pl.dist)<250;
const active=s=>!s.eliminated;
function stepSim(){const racing=state==='race'||state==='menu'||state==='finished';
  for(const s of ships){if(s.eliminated)continue;if(s.dead>0){s.dead-=H;if(s.dead<=0&&RC.type==='arena'&&s.lives<=0){eliminate(s,true);continue}if(s.dead<=0){s.dead=0;s.wreck=null;restoreParts(s);s.hull=s.hull<=0?100:Math.max(s.hull,60);s.v=s.stats.top*.35;s.x=0;s.yaw=s.beta=s.yawRate=0;s.inv=2}continue}
    s.turbo=Math.max(0,s.turbo-H);s.boost=Math.max(0,s.boost-H);s.shield=Math.max(0,s.shield-H);s.inv=Math.max(0,s.inv-H);
    if(s.stormT>0){s.stormT-=H;s.v=Math.min(s.v,s.stats.top*.72)}
    if(s.magnet>0){s.magnet-=H;let tgt=null,bd=320;for(const o of ships){if(o===s||o.dead>0||o.eliminated)continue;const dd=tdd(o.dist,s.dist);if(dd>4&&dd<bd){bd=dd;tgt=o}}
      if(tgt){s.v=Math.max(s.v,Math.min(tgt.v+30,s.stats.top*1.25));s.x+=clamp(tgt.x-s.x,-9*H,9*H);if(s.mesh&&R()<.4){const at=s.mesh.position.clone().add(s.mesh.userData.m.position);emit(SPARK,at,V3(rr(-3,3),rr(0,3),rr(-3,3)),.3,new THREE.Color(2.6,.5,1))}
        if(bd<9){s.magnet=0;s.bm=Math.min(100,s.bm+35);tgt.bm=Math.max(0,(tgt.bm||0)-35);hitShip(tgt,8,.2,(R()-.5)*2,s);if(s.isPlayer)award(s,'BOOST STOLEN',0,400,'#ff3b6b')}}}
    if(RC.type!=='zone'&&raceT-s.lastHit>(RC.derby?6:2.5)&&s.hull<100)s.hull=Math.min(100,s.hull+(RC.derby?2:5)*H);
    if(!racing)continue;
    if(s.isPlayer&&!s.finished){const c=ctlPlayer();if(s.stall>0){c.thr=0;s.stall-=H}physPlayer(s,c);CTL=c;if(TOUCH.used)drawStInd(TOUCH.steer);if(pressed.fire){useItem(s);pressed.fire=false}}
    else if(s.isPlayer&&s.finished){s.rubber=1;physAI(s);s.nitro=false}
    else{if(pl&&!pl.finished&&RC.type!=='tt'){const gap=pl.dist-s.dist;if(R15_on()&&RC.type!=='arena'){let ld=s.dist;for(const o of ships)if(!o.eliminated&&o.dist>ld)ld=o.dist;
        // R17: the 38 m tracks at ×1.2 strung the field out (1st→last 630 m at 60 s vs live ~220 m): a stronger pull toward the player and toward the leader
        s.rubber=RF_rub(s,gap,ld)}else s.rubber=1+(gap>0?Math.min(.06,gap/400*.06):-Math.min(.03,Math.max(0,-gap-150)/600*.03))}else s.rubber=1;physAI(s);
      if(s.item){s.aiFire-=H;if(s.aiFire<=0){let use=false;const it=s.item;
        if(it==='turbo')use=Math.abs(kAt(TD,s.dist+100))<1/900;else if(it==='shield')use=raceT-s.lastHit<.5||R()<.002;else if(it==='mines'||it==='wall'||it==='oil')use=ships.some(o=>o!==s&&s.dist-o.dist>10&&s.dist-o.dist<150);else if(it==='magnet')use=ships.some(o=>o!==s&&!o.dead&&o.dist-s.dist>30&&o.dist-s.dist<300);else if(it==='storm')use=ships.some(o=>o!==s&&!o.dead&&o.dist>s.dist+10);
        else use=ships.some(o=>o!==s&&!o.dead&&!o.eliminated&&o.dist-s.dist>15&&o.dist-s.dist<(it==='missile'||it==='tornado'||it==='web'?500:160)&&(it==='missile'||it==='tornado'||it==='web'||Math.abs(o.x-s.x)<5));
        if(use)useItem(s);s.aiFire=.3}}}
    if(!s.air)for(const p of pads){const dd=mod(s.dist-p.s+10,TD.L)-10;if(dd>=0&&dd<s.v*H+.01&&Math.abs(s.x-p.x)<(p.type==='boost'?5:4)){
      if(p.type==='boost'){s.boost=1.3;if(s.isPlayer){AU.sfx('boost');fovKick=Math.max(fovKick,6);award(s,'BOOST PAD',15,50,'#ffd12c')}}
      else if(!s.item&&!(p.cd>0)){if(R15I.im)R15_pop(p,s);s.item=pickItem(s);s.aiFire=rr(.6,2.5)*(s.style==='gunner'?.6:1);if(s.isPlayer){AU.sfx('pick');itemSpinUntil=performance.now()+950;if(PK.has('refill'))s.bm=Math.min(100,s.bm+35)}}}}}
  if(racing){stepTraffic();stepProps()}
  for(let i=0;i<ships.length;i++)for(let j=i+1;j<ships.length;j++){const a=ships[i],b=ships[j];if(a.dead||b.dead||a.eliminated||b.eliminated||a.air||b.air)continue;const dd=b.dist-a.dist,dx=b.x-a.x;
    if(Math.abs(dd)<5.4&&Math.abs(dx)<2.5){if(a.isPlayer)b.pushT=raceT;if(b.isPlayer)a.pushT=raceT;const push=(2.5-Math.abs(dx))*.5*(dx>=0?1:-1);a.x-=push;b.x+=push;const back=dd>0?a:b,front=dd>0?b:a;if(back.v>front.v){const dv=back.v-front.v;back.v-=dv*.6;front.v+=dv*.3}
      if(RC.derby&&state==='race'&&(a.bumpT2||0)<raceT&&(b.bumpT2||0)<raceT){a.bumpT2=b.bumpT2=raceT+.35;const hard=Math.abs(b.v-a.v)*.35+3;if(!a.isPlayer&&!b.isPlayer){damage(front,hard)}else{const V=a.isPlayer?a:b,O=a.isPlayer?b:a;if(O.aggr!==0&&R()<.6)damage(V,hard*.8)}}
      if(a.isPlayer||b.isPlayer){const P=a.isPlayer?a:b,O=a.isPlayer?b:a;const toward=Math.sign(O.x-P.x)||1;const latV=P.v*Math.sin(P.beta)+(P.rollT>ROLL_T-.32?P.rollDir*CR_LGV:0);
        const OB=R15_b(O,O.x),pinned=O.x>=OB[1]-1.2||O.x<=OB[0]+1.2;const rearRam=(O.dist-P.dist)>0&&P.nitro&&(P.v-O.v)>14;
        if(state==='race'&&!P.finished&&P.rollT>ROLL_T-.4&&P.rollDir===toward&&!P.rollHit&&O.dead<=0){P.rollHit=true;CR_lgHit(P,O,toward)}
        else if(RC.derby&&state==='race'&&!P.finished){if((P.bumpT||0)<raceT){P.bumpT=raceT+.3;const imp=Math.abs(latV)*.9+Math.max(0,P.v-O.v)*.5+4;AU.sfx('crash');shake=Math.max(shake,.45);damage(O,imp);if(O.dead>0){P.takedowns++;award(P,'DERBY KO',30,1500,'#ff2d95');crashCam(O,1.6)}else award(P,'HIT',4,Math.round(imp*20),'#ffd12c')}}
        else{if((P.bumpT||0)<raceT){AU.sfx('bump');P.bumpT=raceT+.25;shake=Math.max(shake,.25)}
          if(O.attackT>0&&P.rollT<=0){P.x-=toward*1.2;const PB=R15_b(P,P.x+toward*1.2);if(P.x>=PB[1]-.3||P.x<=PB[0]+.3){damage(P,14/P.stats.hull);feed('SIDESWIPED',0,'#ff3b55');flashHud();O.attackT=0}}}}
      for(const s of[a,b]){s.x=R15_cx(s,s.x);if(s.isPlayer)s.beta*=.7}}}
  if(racing)for(const s of ships){if(s.dead||s.eliminated||s.air)continue;for(const c of traffic){if(c.wreck)continue;const dd=tdd(c.dist,s.dist),dx=c.x-s.x;
    if(Math.abs(dd)<c.len/2+3.4&&Math.abs(dx)<c.wid/2+2){
      if(s.isPlayer&&RC.jn){if(state==='race'){wreckTraffic(c,s,1.4);explode(s,'CRASH!')}}
      else if(s.isPlayer){if(s.shield>0||s.rollT>0){wreckTraffic(c,s,1.2);if(s.isPlayer)CR_smashHit();s.v*=.97;award(s,'SMASH',8,300,'#ffd12c');AU.sfx('crash');shake=.5}
        else{const rel=Math.max(0,s.v-c.v);if(0){wreckTraffic(c,s,.8);s.v=Math.min(s.v,c.v+8)*.9;damage(s,(6+rel*.25)/s.stats.hull);AU.sfx('crash');shake=.9;flashHud();feed('CRASH',0,'#ff3b55')}else{if((s.crBmp||0)<raceT){s.crBmp=raceT+.4;AU.sfx('bump');shake=Math.max(shake,.25);s.v=Math.min(s.v,c.v+rel*.55)}s.x=R15_cx(s,s.x-Math.sign(dx||1)*.9);c.x=clamp(c.x+Math.sign(dx||1)*.6,-MARGIN,MARGIN)}}}
      else{const rel=Math.max(0,s.v-c.v),pushed=pl&&raceT-(s.pushT||-9)<2.2;
        if(state==='race'&&(rel>CR_SMASHV||pushed&&rel>14)){wreckTraffic(c,s,.8);s.v=Math.min(s.v,c.v*.55);s.x=R15_cx(s,s.x-Math.sign(dx||1)*1.6);if(s.inv<=0&&s.shield<=0)damage(s,(10+rel*.4)/s.stats.hull);if(pushed&&s.dead<=0&&rel>CR_SMASHV)explode(s,null);
          if(pushed){if(s.dead>0){pl.takedowns++;award(pl,'TRAFFIC CHECK',40,1800,'#ff2d95');AU.sfx('takedown');crashCam(s,1.6);rivalHit(s,'hurt')}else{award(pl,'SHOVED INTO TRAFFIC',8,400,'#ffd12c');s.pushT=-9}}}
        else{s.v=Math.min(s.v,c.v*.95);s.x=clamp(s.x-Math.sign(dx||1)*.8,-MARGIN,MARGIN)}}
      c.prev=null;continue}
    if(s.isPlayer){const ahead=dd>0;if(c.prev===true&&!ahead&&Math.abs(dx)<c.wid/2+5.4&&s.v-c.v>12&&state==='race'){s.nearMiss++;award(s,'NEAR MISS',PK.has('slip')?18:9,200+Math.round((s.v-c.v)*4),'#4ceaff');AU.sfx('near')}c.prev=ahead}}}
  for(let i=projs.length-1;i>=0;i--){const p=projs[i];p.life-=H;p.dist+=p.v*H;
    if(p.type==='tornado'){p.ph+=H*2;p.x=clamp(p.x+Math.sin(p.ph)*6*H,-MARGIN+3,MARGIN-3);for(const s of ships){if(s===p.owner||s.dead||s.eliminated||s.air||p.hits.has(s))continue;if(Math.abs(s.dist-p.dist)<6&&Math.abs(s.x-p.x)<5.5){p.hits.add(s);hitShip(s,10,.6,(R()<.5?-1:1)*7,p.owner);if(s.isPlayer)feed('CAUGHT IN THE TORNADO',0,'#b48cff')}}if(p.life<=0){wfxDrop(p);projs.splice(i,1)}continue}
    if(p.type==='missile'&&p.target&&!p.target.dead){p.x+=clamp(p.target.x-p.x,-30*H,30*H);p.v=Math.max(p.v,p.target.v+45)}
    let hit=false;for(const s of ships){if(s===p.owner||s.dead||s.eliminated||s.air)continue;if(Math.abs(s.dist-p.dist)<4.5&&Math.abs(s.x-p.x)<3.4){hitShip(s,(p.type==='missile'?30:16)*(s.isPlayer&&PK.has('armor')?.5:1),p.type==='missile'?.45:.25,(R()-.5)*3,p.owner);hit=true;
      const f=frameAt(TD,p.dist,F2);burst(FIRE,f.p.clone().addScaledVector(f.r,p.x).addScaledVector(f.u,1.2),30,22,.7,new THREE.Color(2,1,.3));break}}
    if(hit||p.life<=0||Math.abs(p.x)>(R15_at(p.dist)?HALF+R15_ISL+R15_CW+2:HALF+2))projs.splice(i,1)}
  for(let i=mines.length-1;i>=0;i--){const m=mines[i];m.life-=H;m.arm-=H;let hit=false;
    if(m.arm<=0)for(const s of ships){if(s.dead||s.eliminated||s.air)continue;if(Math.abs(s.dist-m.dist)<3.4&&Math.abs(s.x-m.x)<(m.w||3)){if(s.isPlayer&&PK.has('mines')&&m.type!=='wall')continue;if(m.type==='oil'){if(m.hits.has(s))continue;m.hits.add(s);if(s.shield<=0){s.v*=.75;s.yawRate+=(R()<.5?-1:1)*6;if(s.isPlayer){feed('OIL!',0,'#5dffb0');AU.sfx('hit')}}continue}
      if(m.type==='wall'){hitShip(s,18,.6,(R()-.5)*3,m.owner);hit=true;const f=frameAt(TD,m.dist,F2);const at=f.p.clone().addScaledVector(f.r,m.x).addScaledVector(f.u,1.4);debris(at,(s._fw||V3()).clone().multiplyScalar(s.v*.4).add(V3(0,6,0)),14,[new THREE.Color('#ff8a3c'),new THREE.Color('#c0392b'),new THREE.Color('#ffd12c')],.9,f.p.y);AU.sfx('brick');break}
      hitShip(s,24,.5,(R()-.5)*4,m.owner);hit=true;const f=frameAt(TD,m.dist,F2);burst(FIRE,f.p.clone().addScaledVector(f.r,m.x).addScaledVector(f.u,1),36,26,.8,new THREE.Color(2,.6,.4));break}}
    if(hit||m.life<=0){wfxDrop(m);mines.splice(i,1)}}
  if(RC.type==='zone'&&state==='race'&&pl&&pl.dist>=RC.zone.next)zoneUp();
  if(pl&&RC.type==='duel'&&state==='race'&&Math.floor(raceT*20)*2>=duelRec.length)duelRec.push(Math.round(pl.dist*100)/100,Math.round(pl.x*100)/100);
  if(RC.type==='arena'&&state==='race'){RC.time-=H;if(RC.time<=0&&pl&&!pl.eliminated){RC.time=0;pl.finished=true;pl.finishTime=raceT;state='finished';finishT=1.5;AU.sfx('finish');lapLogic();say('TIME',ord(pl.place)+' PLACE',2.4)}}
  if(state==='race'&&pl&&RC.type!=='attract'){if(prevPlace&&pl.place>prevPlace&&raceT>8&&raceT>radioCd&&R()<.6){const o=ships.find(x=>!x.isPlayer&&x.place===pl.place-1);if(o){radio(o,'pass');radioCd=raceT+14}}prevPlace=pl.place}
  if(RC.jn&&state==='race'&&pl){const J=RC.jn;if(pl.dead>0){J.endT=(J.endT??5.2)-H;if(J.endT<=0)endJunction()}else if(pl.dist>J.end)endJunction()}
  if(RC.type==='elim'&&state==='race'){elimT-=H;if(elimT<=0){elimT=20;const act=ships.filter(active);if(act.length>1)eliminate([...act].sort((a,b)=>a.dist-b.dist)[0])}}}
function endJunction(){state='finished';finishT=1.5;pl.finished=true;pl.finishTime=raceT;AU.sfx('finish');say('DAMAGE',eur(RC.jn.value),2.4)}
function eliminate(s,quiet){s.elimPlace=ships.filter(active).length;s.eliminated=true;s.elimAt=raceT;if(!quiet)explode(s);s.dead=0;s.mesh.visible=false;AU.sfx('elim');
  if(s.isPlayer){say('ELIMINATED','',2);state='finished';finishT=1.5}else{feed('OUT · '+s.name,0,'#ff3b55');if(ships.filter(active).length===1&&pl&&!pl.eliminated){pl.finished=true;pl.finishTime=raceT;state='finished';finishT=0;AU.sfx('finish');say('LAST ONE FLYING','',2.4)}}}
let CTL={steer:0,thr:0,brk:0,abL:0,abR:0,boost:0};

/* ---- race flow ---- */
function lapLogic(){const laps=RC.laps;for(const s of ships){if(s.eliminated)continue;const lap=Math.floor(s.dist/TD.L);
  if(lap>s.lap&&s.dist>0){const lt=raceT-s.lapStart;if(lap>=1){s.laps.push(lt);if(lt<s.best)s.best=lt}s.lapStart=raceT;s.lap=lap;
    if(s.isPlayer&&lap>=1&&state==='race'){if(TRK.fire)athFire(lap>=laps);if(lapAttack())saveGhost(lt);
      else if(lap>=laps)finishPlayer();else{AU.sfx('lap');if(lap===laps-1){AU.sfx('final');say('FINAL LAP',fmt2(lt),1.4)}else say('LAP '+(lap+1),fmt2(lt),1.2)}}
    if(!s.isPlayer&&RC.type!=='elim'&&lap>=laps&&!s.finished){s.finished=true;s.finishTime=raceT}}
  else if(lap<s.lap)s.lap=lap}
  const order=RC.type==='arena'?ships.filter(active).sort((a,b)=>(b.lives-a.lives)||(b.takedowns-a.takedowns)||(b.hull-a.hull)):ships.filter(active).sort((a,b)=>(b.finished&&a.finished)?a.finishTime-b.finishTime:(b.finished-a.finished)||(b.dist-a.dist));order.forEach((s,i)=>s.place=i+1)}
function saveGhost(lt){const prev=ghost?ghost.t:Infinity;
  if(lt<prev&&ghostRec.length){ghost={t:lt,team:teamIdx,f:ghostRec.map(v=>Math.round(v*100)/100)};store.set(ghostKey(),ghost);say('NEW BEST LAP',fmt2(lt),1.6);AU.sfx('finish')}
  else{AU.sfx('lap');say('LAP',fmt2(lt)+(isFinite(prev)?'  ('+(lt-prev>=0?'+':'')+(lt-prev).toFixed(2)+')':''),1.4)}
  const rec=store.get(recKey(),{});if(!rec.lap||lt<rec.lap){rec.lap=lt;rec.team=TEAMS[teamIdx].name;store.set(recKey(),rec)}ghostRec=[]}
function finishPlayer(){pl.finished=true;pl.finishTime=raceT;state='finished';finishT=0;AU.sfx('finish');lapLogic();say(RC.type==='tt'?fmt2(raceT):ord(pl.place),'FINISH',2.5)}
const speedTxt=v=>(typeof SET!=='undefined'&&SET.units==='mph'?Math.round(v*2.237)+' mph':Math.round(v*3.6)+' kph');
const eur=v=>Math.round(v).toLocaleString('de-DE')+' €';
const modeName=()=>RC.daily?'Daily '+RC.daily:RC.derby?'Derby':RC.boss?'Grand Arena':RC.rival?'Rival race':{junction:'Crash Junction',race:'Race',tt:'Time trial',zone:'Zone',arena:'Arena',duel:'Ghost duel',elim:'Eliminator'}[RC.type]||'Race';
const setLabel=()=>`${modeName()} · ${TRK.short}${mirror?' (mirror)':''} · ${MOOD.name} · ${cls.name}`;
function statRow(rows){$('#resStats').innerHTML=rows.map(([a,b])=>`<div><b>${b}</b><span>${a}</span></div>`).join('')}
function modeResults(){const T=RC.type;$('#medal').hidden=true;$('#resEy').textContent=setLabel();let note='';
  if(T==='zone'){const Z=RC.zone,km=pl.zoneKm??pl.dist/1000,key=zoneKey(),best=store.get(key,{zone:0,km:0});const nb=Z.k>best.zone||(Z.k===best.zone&&km>best.km);if(nb)store.set(key,{zone:Z.k,km});
    RC._st=Z.k>=6?3:Z.k>=4?2:Z.k>=2?1:0;$('#resTitle').textContent='ZONE '+Z.k;statRow([['Distance',km.toFixed(2)+' km'],['Top speed',speedTxt(pl.maxSpeed)],['Near misses',pl.nearMiss],['Style',pl.style.toLocaleString('de-DE')]]);
    $('#resTable').innerHTML=`<tr><th>Record on ${TRK.short}</th><th class="n">Zone</th><th class="n">Distance</th></tr><tr class="me"><td>This run</td><td class="n">${Z.k}</td><td class="n">${km.toFixed(2)} km</td></tr><tr><td>Best</td><td class="n">${Math.max(best.zone,Z.k)}</td><td class="n">${(nb?km:best.km).toFixed(2)} km</td></tr>`;note=nb?'New zone record.':'';}
  else if(T==='duel'){const g=duelGhost,t=pl.finishTime,fin=pl.finished;let title,nb=false;
    if(!fin)title='DNF';else if(!g){title='GHOST SET';nb=true}else if(t<g.t){title='BEAT THE GHOST';nb=true}else title='+'+(t-g.t).toFixed(2)+' BEHIND';
    if(nb&&fin&&duelRec.length)store.set(duelKey(),{t,team:teamIdx,f:duelRec});RC._st=!fin?0:g&&t<g.t?3:1;$('#resTitle').textContent=title;
    statRow([['Race',fin?fmt2(t):'—'],['Ghost',g?fmt2(g.t):'—'],['Best lap',fmt2(pl.best)],['Top speed',speedTxt(pl.maxSpeed)]]);
    $('#resTable').innerHTML=`<tr><th>Lap</th><th class="n">Time</th></tr>`+pl.laps.map((x,i)=>`<tr><td>${i+1}</td><td class="n">${fmt2(x)}</td></tr>`).join('');note=nb&&g?'New ghost saved: '+fmt2(t)+'.':nb?'Race again to duel this ghost.':'';}
  else if(T==='arena'){lapLogic();const alive=ships.filter(active),out=ships.filter(s=>s.eliminated).sort((a,b)=>b.elimAt-a.elimAt),order=[...alive.sort((a,b)=>a.place-b.place),...out];const me=order.indexOf(pl)+1;
    RC._st=me===1?3:me<=3?2:me<=5?1:0;$('#resTitle').textContent=me===1?'1ST · LAST ONE FLYING':ord(me)+' PLACE';statRow([['KOs',pl.takedowns],['Lives left',Math.max(0,pl.lives)],['Survived',fmt(pl.eliminated?pl.elimAt:raceT)],['Style',pl.style.toLocaleString('de-DE')]]);
    $('#resTable').innerHTML='<tr><th>Pos</th><th>Pilot</th><th>Team</th><th class="n">Lives</th><th class="n">KOs</th></tr>'+order.map((s,i)=>`<tr class="${s===pl?'me':''} ${s.eliminated?'out':''}"><td>${i+1}</td><td>${avImg(s)}${s.name}</td><td>${s.team.name}</td><td class="n">${s.eliminated?'OUT':'▲'.repeat(Math.max(0,s.lives))}</td><td class="n">${s.takedowns||0}</td></tr>`).join('');
    const key=`mho_${RC.derby?'derby':'arena'}_${TRK.id}`,best=store.get(key,99);if(me<best){store.set(key,me);note='New arena best: '+ord(me)+'.'}}
  else if(T==='junction'){const J=RC.jn,v=J.value,md=v>=320000?'GOLD':v>=200000?'SILVER':v>=100000?'BRONZE':'';RC._st=md==='GOLD'?3:md==='SILVER'?2:md?1:0;$('#resTitle').textContent=eur(v);
    statRow([['Vehicles wrecked',J.cars],['Chain reactions',J.chain],['Aftertouch KOs',pl.takedowns],['Medal',md||'—']]);note=md?md+' · next: '+(md==='GOLD'?'beat your best':eur(md==='SILVER'?320000:200000)):'Bronze at '+eur(100000)+'. Crash into the biggest trucks, then steer the wreck.';
    const key=`mho_jn_${TRK.id}`,best=store.get(key,0);if(v>best){store.set(key,v);note+=' · New best.'}}
  else return false;
  if(RC.daily){const k='mho_daily_'+RC.daily,prev=store.get(k,null);let score,txt;
    if(T==='zone'){score=RC.zone.k*1e5+pl.dist;txt='zone '+RC.zone.k}else if(T==='tt'){score=pl.finished?-pl.finishTime:-1e9;txt=pl.finished?fmt2(pl.finishTime):'DNF'}else{score=pl.finished?-pl.place*1e4-pl.finishTime:-1e9;txt=pl.finished?ord(pl.place)+' · '+fmt2(pl.finishTime):'DNF'}
    if(!prev||score>prev.score){store.set(k,{score,txt});note+=' Best today: '+txt+'.'}else note+=' Best today: '+prev.txt+'.'}
  starAward(RC._st||0);RC._st=0;$('#resNote').textContent=note.trim();$('#againBtn').focus({preventScroll:true});return true}
function medalFor(){const ev=RC.ev;if(!ev)return 0;const m=ev.m;let v;
  if(ev.med==='place'){v=RC.type==='elim'?(pl.eliminated?pl.elimPlace:1):pl.place;if(RC.type!=='elim'&&!pl.finished)return 0;return v<=m[0]?3:v<=m[1]?2:v<=m[2]?1:0}
  if(ev.med==='time'){if(!pl.finished)return 0;v=pl.finishTime;return v<=m[0]?3:v<=m[1]?2:v<=m[2]?1:0}
  if(ev.med==='takedowns'){if(!pl.finished)return 0;v=pl.takedowns;return v>=m[0]?3:v>=m[1]?2:v>=m[2]?1:0}return 0}
function worldResults(order){$('#roamBack').hidden=false;$('#nextBtn').hidden=true;const ev=RC.world,me=order.indexOf(pl)+1,F=flags(),won=me===1;let note;if(ev===ATH_BOSS_EV||ATH_TRK_EV.includes(ev))return athWorldRes(ev,me,F,won);
  if(RC.boss){if(won){F.SKYCUP=1;note='YOU BEAT VEX KAISER! The Mainhattan Sky Cup is yours. Unlocked: the Kaiserkrone and Kaiser’s Crown perk.';$('#resTitle').textContent='SKY CUP CHAMPION'}else note=`Kaiser wins again. ${ord(me)} place. Upgrade, then come back.`}
  else{if(won){const nw=!F[ev.p];F[ev.p]=1;const rv=TEAMS.find(t=>t.own===ev.p),rp=PERKS.find(p=>p.flag===ev.p);note=(nw?`FLAG WON: ${PD[ev.p].full}! New vehicle: ${rv?rv.name:''}. New perk: ${rp?rp.name:''}. `:'Rematch won. ')+`${RIVAL_EV.filter(e=>F[e.p]).length}/8 flags.`;$('#resTitle').textContent=nw?'FLAG WON':'1ST · WINNER'}else note=`${PD[ev.p].full} keeps the flag. Beat them one-on-one.`}
  const nf=RIVAL_EV.filter(e=>F[e.p]).length;if(!RC.boss&&nf>=BOSS_EV.need&&!F.SKYCUP)note+=' The GRAND ARENA is open: Vex Kaiser awaits.';
  store.set('mho_flags',F);$('#resEy').textContent=(RC.boss?'Grand Arena · ':'Rival race · ')+PD[ev.p].full+' · '+TRK.short;$('#resNote').textContent=note}
function athWorldRes(ev,me,F,won){let note;
  if(RC.boss){if(won){F.AKROCUP=1;note='YOU BEAT THANOS DRAKOS! The Akropolis Cup stays in Athens.';$('#resTitle').textContent='AKROPOLIS CUP CHAMPION'}else note=`Drakos keeps the cup. ${ord(me)} place. Upgrade, then come back.`}
  else{if(won){const nw=!F[ev.p];F[ev.p]=1;note=(nw?`FLAG WON: ${PD[ev.p].full}! `:'Rematch won. ')+`${athNF(F)}/6 Athens flags.`;$('#resTitle').textContent=nw?'FLAG WON':'1ST · WINNER'}else note=`${PD[ev.p].full} keeps the flag. Beat them one-on-one.`}
  if(!RC.boss&&athNF(F)>=ATH_BOSS_EV.need&&!F.AKROCUP)note+=' The AKROPOLIS CUP FINAL is open: Thanos Drakos awaits in the Kallimarmaro.';
  store.set('mho_flags',F);$('#resEy').textContent=(RC.boss?'Akropolis Cup Final · ':'Rival race · ')+PD[ev.p].full+' · '+TRK.short;$('#resNote').textContent=note}
function standings(S){const keys=['YOU',...seasonRoster(S.L)];return keys.map(k=>({k,p:S.pts[k]||0})).sort((a,b)=>b.p-a.p)}
function seasonResults(order){const S=season(),L=S.L,r0=S.r,rd=seasonRound(L,r0),mult=rd.dbl?2:1;const gain={};
  order.forEach((s,i)=>{const k=s.isPlayer?'YOU':s.pid;if(!k)return;gain[k]=SPTS[i]*mult;S.pts[k]=(S.pts[k]||0)+gain[k]});
  const me=order.indexOf(pl)+1,cr=Math.round(SCRED[me-1]*(1+.5*L)/10)*10+pl.takedowns*400;S.cr+=cr;
  let note=`+${cr.toLocaleString('de-DE')} credits${pl.takedowns?` (incl. ${pl.takedowns} takedown bonus)`:''}. `,title=null;const st=standings(S),pos=st.findIndex(e=>e.k==='YOU')+1;
  if(r0===4){if(pos<=3){const prize=[20000,12000,8000][pos-1]*(1+.5*L);S.cr+=prize;title=pos===1?'CHAMPION':ord(pos)+' IN THE CHAMPIONSHIP';const up=L<4;S.max=Math.max(S.max,Math.min(4,L+1));
      note+=`${LEAGUES[L].name}: ${ord(pos)} overall. Prize ${prize.toLocaleString('de-DE')} credits. `+(up?`Promoted to the ${LEAGUES[L+1].name}!`:'You are the Mainhattan champion!');if(up)S.L=L+1}
    else{title=ord(pos)+' IN THE CHAMPIONSHIP';note+=`${LEAGUES[L].name}: ${ord(pos)} overall. Top 3 to promote. Upgrade in the Garage and go again.`}
    S.champ.push({L,pos});S.r=0;S.pts={}}
  else{S.r=r0+1;note+=`Championship: ${ord(pos)} with ${S.pts.YOU||0} pts after round ${r0+1}/5.`}
  saveSeason(S);$('#resEy').textContent=`Season · ${LEAGUES[L].name} · Round ${r0+1}/5 · ${rd.name}${rd.dbl?' · double points':''}`;if(title)$('#resTitle').textContent=title;$('#resNote').textContent=note;
  $('#resTable').innerHTML='<tr><th>Pos</th><th>Pilot</th><th>Team</th><th class="n">+Pts</th><th class="n">Total</th></tr>'+order.map((s,i)=>{const k=s.isPlayer?'YOU':s.pid;return`<tr class="${s===pl?'me':''} ${s.eliminated?'out':''}"><td>${i+1}</td><td>${avImg(s)}${s.name}${s.nem?' <span class="nem">NEMESIS</span>':''}</td><td>${s.team.name}</td><td class="n">+${gain[k]||0}</td><td class="n">${r0===4?'—':S.pts[k]||0}</td></tr>`}).join('');
  $('#nextBtn').textContent=r0===4?'NEW SEASON':'NEXT ROUND';$('#nextBtn').hidden=false}
const STAR_PAY={boss:[4500,250],rival:[2200,150],challenge:[1700,120],mode:[1300,100],sprint:[1700,130],season:[800,80],quick:[300,40]};
// reward parts: the first 3-star finish of an event unlocks a random garage item you have not bought yet
function logDone(key,name,kind,stars,detail){if(!stars)return;const L=store.get('mho_log',{}),o=L[key]||{n:name,k:kind,s:0,first:Date.now()};o.n=name;o.k=kind;o.s=Math.max(o.s,stars);o.last=Date.now();if(detail)o.d=detail;L[key]=o;store.set('mho_log',L)}
function rewardItem(){const own=gbOwn(),pool=[];for(const c in GB_PARTS)for(const q of GB_PARTS[c])if(q[2]&&q[2].cost&&!own.includes(q[0]))pool.push([q[0],q[1]]);for(const q of GB_PATS)if(q[2]&&q[2].cost&&!own.includes('pat_'+q[0]))pool.push(['pat_'+q[0],q[1]+' livery']);for(const q of GB_HORNS)if(q[2]&&q[2].cost&&!own.includes('horn_'+q[0]))pool.push(['horn_'+q[0],q[1]+' horn']);if(!pool.length)return'';const p=pool[Math.floor(R()*pool.length)];own.push(p[0]);store.set('mho_gbown',own);return p[1]}
function starAward(stars){stars=clamp(stars|0,0,3);const ctx=RC.boss?'boss':RC.world?'rival':RC.season?'season':RC.ev?'challenge':RO.sprId?'sprint':RO.fromRoam?'mode':'quick';
  const key=ctx+':'+(RO.sprId&&ctx==='sprint'?RO.sprId:RC.world?RC.world.p:RC.ev?RC.ev.id:RC.type+(RC.derby?'D':'')+'_'+TRK.id),all=store.get('mho_stars',{}),best=all[key]||0,[pay,xp]=STAR_PAY[ctx];
  const fresh=Math.max(0,stars-best),rep=Math.min(stars,best),cr=Math.round(pay*fresh+pay*(best>=3?.2:.3)*rep)+(pl?pl.takedowns*100:0),x=Math.round(xp*(fresh+(best>=3?.1:.25)*rep));
  if(stars>best){all[key]=stars;store.set('mho_stars',all)}if(cr){const S=season();S.cr+=cr;saveSeason(S)}if(x)addXP(x);const gift=stars===3&&best<3&&ctx!=='quick'?rewardItem():'';if(ctx!=='quick')logDone(key,RC.world?(PD[RC.world.p]||{}).full||'Rival':RC.ev?RC.ev.name:RC.boss?'Grand Arena':(TRK.name||'Event'),ctx,stars);
  const el=$('#resStars');el.hidden=false;el.innerHTML=`<span class="st">${'★'.repeat(stars)}<i>${'★'.repeat(3-stars)}</i></span><span>+<b>${cr.toLocaleString('de-DE')}</b> studs · +<b>${x}</b> XP${fresh?` · ${fresh} new ★`:best>=3&&stars?' · mastered ★★★ · studs only':stars?' · replay (30%)':''}${pl&&pl.takedowns?` · incl. ${pl.takedowns} KO bonus`:''}${gift?`<br>🎁 <b>NEW GARAGE PART: ${gift}</b>`:''}</span>`;if(stars===3)AU.sfx('finish')}
function showResults(){$('#roamBack').hidden=!RO.fromRoam;$('#resStars').hidden=true;state='results';$('#results').hidden=false;$('#hud').hidden=true;$('#touch').hidden=true;$('#nextBtn').hidden=true;
  if(RC.type==='zone'||RC.type==='duel'||RC.type==='arena'||RC.type==='junction'){if(modeResults())return}
  const est=s=>s.eliminated?1e6-s.elimAt:s.finished?s.finishTime:raceT+Math.max(0,(RC.laps*TD.L-s.dist))/Math.max(40,s.v||60);
  const order=[...ships].sort((a,b)=>est(a)-est(b));const me=RC.type==='elim'&&pl.eliminated?pl.elimPlace:order.indexOf(pl)+1;
  if(RC.type!=='tt'&&RC.type!=='attract'&&order.length>1){const o2=order[me===1?1:0];RC.adapt=adaptAfter(me,order.length,me===1?est(o2)-est(pl):0)}
  const ev=RC.ev;$('#resEy').textContent=ev?`Career · Event ${EVENTS.indexOf(ev)+1} · ${ev.name}`:`${cls.name} · ${dir==='rev'?'Reverse':'Normal'} · ${TEAMS[teamIdx].name}`;
  $('#resTitle').textContent=RC.type==='tt'?(pl.finished?fmt2(pl.finishTime):'DNF'):me===1?'1ST · WINNER':ord(me)+' PLACE';
  const md=medalFor(),md0=ev?(career()[ev.id]||0):0;
  if(ev){const names=['NO MEDAL','BRONZE','SILVER','GOLD'],cols=['#4a6a80','var(--bronze)','var(--silver)','var(--gold)'];$('#medal').innerHTML=`<i style="color:${cols[md]}"></i><span>${names[md]}${md>md0?' · NEW BEST':''}</span>`;$('#medal').hidden=false;
    if(md>md0){const c=career();c[ev.id]=md;store.set('mho_career',c)}}else $('#medal').hidden=true;
  $('#resStats').innerHTML=[['Style',pl.style.toLocaleString('de-DE')],['Near misses',pl.nearMiss],['Takedowns',pl.takedowns],['Top speed',speedTxt(pl.maxSpeed)]].map(([a,b])=>`<div><b>${b}</b><span>${a}</span></div>`).join('');
  $('#resTable').innerHTML=RC.type==='tt'?`<tr><th>Lap</th><th class="n">Time</th></tr>`+pl.laps.map((t,i)=>`<tr><td>${i+1}</td><td class="n">${fmt2(t)}</td></tr>`).join(''):
    '<tr><th>Pos</th><th>Pilot</th><th>Team</th><th class="n">Time</th><th class="n">Best lap</th></tr>'+order.map((s,i)=>`<tr class="${s===pl?'me':''} ${s.eliminated?'out':''}"><td>${i+1}</td><td>${avImg(s)}${s.name}</td><td>${s.team.name}</td><td class="n">${s.eliminated?'OUT':s.finished?fmt2(s.finishTime):'~'+fmt2(est(s))}</td><td class="n">${fmt2(s.best)}</td></tr>`).join('');
  const rec=store.get(recKey(),{});let note='';if(pl.finished&&(!rec.race||pl.finishTime<rec.race)){rec.race=pl.finishTime;note='New record for this event. '}if(isFinite(pl.best)&&(!rec.lap||pl.best<rec.lap)){rec.lap=pl.best;note+='New lap record. '}
  if(!rec.style||pl.style>rec.style)rec.style=pl.style;store.set(recKey(),rec);
  const seen=store.get('mho_seen_unlock',[]);const unl=TEAMS.filter(t=>t.unlock>0&&t.unlock<=medalPts()&&!seen.includes(t.id));if(unl.length){note+=`Unlocked: ${unl.map(t=>t.name).join(', ')}.`;store.set('mho_seen_unlock',[...seen,...unl.map(t=>t.id)])}
  $('#resNote').textContent=note||(rec.race?`Record: ${fmt2(rec.race)}`:'');if(!RC.ev)$('#resEy').textContent=setLabel();
  if(RC.daily){const k='mho_daily_'+RC.daily,prev=store.get(k,null),score=RC.type==='tt'?(pl.finished?-pl.finishTime:-1e9):(pl.finished?-pl.place*1e4-pl.finishTime:-1e9),txt=pl.finished?(RC.type==='tt'?fmt2(pl.finishTime):ord(me)+' · '+fmt2(pl.finishTime)):'DNF';if(!prev||score>prev.score)store.set(k,{score,txt});$('#resNote').textContent+=' Best today: '+(prev&&prev.score>=score?prev.txt:txt)+'.'}
  if(!RC.cup){let st;const n=ships.length;if(ev)st=md;else if(RC.type==='tt')st=pl.finished?(note.includes('lap record')?2:1):0;else if(RC.world&&!RC.boss)st=me===1?3:pl.finished?1:0;else st=me===1?3:me<=3?2:me<=Math.max(5,Math.ceil(n*.6))?1:0;starAward(st)}
  const nx=ev&&EVENTS[EVENTS.indexOf(ev)+1];$('#nextBtn').hidden=!(nx&&(career()[ev.id]||0)>0);$('#nextBtn').textContent='NEXT EVENT';if(RC.season)seasonResults(order);if(RC.world)worldResults(order);if(RC.cup)cupResults(order);($('#nextBtn').hidden?$('#againBtn'):$('#nextBtn')).focus({preventScroll:true})}

/* ============================================================ 12 · visuals per frame */
const fw=V3(),rs=V3(),us=V3(),Yup=V3(0,1,0);
function posShip(s,dt,snap){if(s.wreck&&s.dead>0){wreckStep(s,dt);return}vehMode(s,dt);frameAt(TD,s.dist,F);s.bob+=dt*7;const bk=s.boatK=(s.boatK||0)+((s.boatMode?1:0)-(s.boatK||0))*Math.min(1,dt*14),hover=1.6-1.05*bk-.25*(s.dirtK||0)+Math.sin(s.dist*.31)*.18*(s.dirtK||0)+Math.sin(s.bob)*.14*SHIP_K+Math.sin(s.bob*.55+s.dist*.05)*.32*bk;
  {const wk=s.dirtK=(s.dirtK||0)+((s.dirtMode?1:0)-(s.dirtK||0))*Math.min(1,dt*6),wg=s.mesh.userData.wheels;if(wg&&wg.visible)for(const w of wg.children)if(w.geometry===WHEEL)w.rotation.x-=s.v*dt/1.05;
    if(wk>.5&&s.v>15&&!s.air&&(s.isPlayer||near(s))&&R()<.5)puff(s.mesh.position.clone().addScaledVector(F.t,-4),1,_tipC.setRGB(.42,.3,.18),2,7,1.1,.5,1.6,2)}
  {if(bk>.5&&s.v>15&&!s.air&&(s.isPlayer||near(s))&&R()<.35){const at=s.mesh.position.clone().addScaledVector(F.t,-3.5);at.y-=.6;emit(WATER,at.clone().addScaledVector(F.r,rr(-2.6,2.6)),V3(rr(-3,3),rr(4,9),rr(-3,3)).addScaledVector(F.t,-s.v*.15),.6,_tipC.setRGB(.3,.5,.85))}}
  // damped roll spring from lateral motion + steering, like a craft leaning into the air
  const target=clamp(-(s.latV||0)*.035-(s.isPlayer?CTL.steer*.18+(CTL.abR-CTL.abL)*.12:0),-.55,.55);
  if(snap){s.roll=target;s.rollV=0}else{const w=13,z=.62;s.rollV+=(-2*z*w*s.rollV-w*w*(s.roll-target))*dt;s.roll+=s.rollV*dt}
  const cy=Math.cos(s.yaw),sy=Math.sin(s.yaw);fw.copy(F.t).multiplyScalar(cy).addScaledVector(F.r,sy);rs.copy(F.r).multiplyScalar(cy).addScaledVector(F.t,-sy);us.copy(F.u);
  let roll=s.roll;if(s.rollT>0){const p=1-s.rollT/ROLL_T;roll+=s.rollDir*-.1*Math.sin(Math.PI*p)}
  const cr=Math.cos(roll),sr=Math.sin(roll);let r2=rs.clone().multiplyScalar(cr).addScaledVector(us,sr),u2=us.clone().multiplyScalar(cr).addScaledVector(rs,-sr),f2=fw.clone();
  if(s.air){const pa=clamp(Math.atan2(s.air.vy,Math.max(10,s.v))*.7,-.45,.45);const f3=f2.clone().multiplyScalar(Math.cos(pa)).addScaledVector(u2,Math.sin(pa));u2=u2.multiplyScalar(Math.cos(pa)).addScaledVector(f2,-Math.sin(pa));f2=f3}
  const ud=s.mesh.userData;ud.m.quaternion.setFromRotationMatrix(_m.makeBasis(r2,u2,f2.clone().negate()));
  s.mesh.position.copy(F.p).addScaledVector(F.r,s.x);if(s.air)s.mesh.position.y=s.air.y+(s.air.off||0);
  s.mesh.quaternion.identity();ud.m.position.copy(F.u).multiplyScalar(s.air?0:hover);
  // decals lie flat on the road under the craft
  const gq=new THREE.Quaternion().setFromRotationMatrix(_m.makeBasis(rs,us,fw.clone().negate()));ud.under.quaternion.copy(gq).multiply(new THREE.Quaternion().setFromAxisAngle(V3(1,0,0),-Math.PI/2));ud.shadow.quaternion.copy(ud.under.quaternion);
  ud.under.position.copy(F.u).multiplyScalar(.12);ud.shadow.position.copy(F.u).multiplyScalar(.1);ud.under.visible=ud.shadow.visible=!s.air;
  s.mesh.visible=!s.eliminated&&!(s.dead>0)&&!(s.inv>0&&Math.floor(s.inv*12)%2)&&!(s.isPlayer&&camMode===1&&state!=='menu');
  ud.shield.visible=s.shield>0;ud.shield.position.copy(ud.m.position);
  const thr=s.isPlayer?Math.max(.25,CTL.thr):(s.v>5?.9:.3),spd=s.v/s.stats.top0,hot=s.nitro||s.turbo>0||s.boost>0;
  const len=Math.min(19,(3+thr*6+spd*9)*(hot?1.3:1));for(const rb of ud.ribbons){rb.scale.z=len;rb.material.uniforms.uT.value=T;rb.material.uniforms.uCol.value.set(s.nitro?'#7fe8ff':s.team.trail);rb.material.uniforms.uA.value=.55+thr*.45}
  for(const f of ud.flares){const k=(1.7+thr*.5+(hot?.8:0))*(1+Math.random()*.08);f.scale.set(k,k,1)}
  ud.under.material.opacity=.22+.26*thr;s._fw=fw.clone();if(dt>0)damageFx(s,dt)}
let shake=0;const attractCam={t:0,ship:0,kind:0,side:1};
const camPos=V3(),camLook=V3(),camUp=V3(0,1,0),camLat=V3();
function updateCam(dt,snap){let s=pl;
  if(CC&&CC.s&&!snap){const w=CC.s,c=w.mesh.position.clone().add(w.mesh.userData.m.position),k=CC.t/CC.dur,a=CC.a0+CC.dir*k*1.9,r=11+k*9;
    camera.position.set(c.x+Math.cos(a)*r,c.y+3+k*5,c.z+Math.sin(a)*r);camera.up.set(0,1,0);camera.lookAt(c);camera.fov+=(48-camera.fov)*.25;camera.updateProjectionMatrix();camPos.copy(camera.position);camLook.copy(c);
    speedLines.mesh.material.opacity=0;FX.uniforms.uSpeed.value*=.9;return}
  if(state==='menu'||!pl){attractCam.t-=dt;if(attractCam.t<=0||snap){attractCam.t=rr(5,8);attractCam.ship=Math.floor(R()*ships.length);attractCam.kind=(attractCam.kind+1)%3;attractCam.side=R()<.5?-1:1}s=ships[attractCam.ship]||ships[0]}
  if(!s)return;frameAt(TD,s.dist,F2);const sp=s.mesh.position.clone().add(s.mesh.userData.m.position),top=s.stats.top0,spd=clamp(s.v/top,0,1.4);shipKey.position.copy(sp).addScaledVector(F2.u,11).addScaledVector(F2.t,4);
  const kind=state==='menu'?attractCam.kind:(camMode===1?3:0);const up=V3().copy(s.air?Yup:F2.u).lerp(Yup,.35).normalize();let want,look;
  if(kind===0){const tall=camera.aspect<1?1.3:1;const cd={close:.85,normal:1,far:1.2}[SET.camd],back=10.5*tall*cd-(s.nitro?.5:0)-CR_SPDCAM.b*clamp(spd,0,1.2),ahead=50*(1+.35*spd);const lead=clamp((s.latV||0)*.06,-3,3),leadL=clamp((s.latV||0)*.14,-8,8);
    want=sp.clone().addScaledVector(F2.t,-back).addScaledVector(up,3.4*tall*cd-(s.nitro?.25:0)-CR_SPDCAM.h*clamp(spd,0,1.2)).addScaledVector(F2.r,-lead*.8);look=sp.clone().addScaledVector(F2.t,ahead).addScaledVector(up,2).addScaledVector(F2.r,leadL);look.lerp(sp.clone().addScaledVector(up,1.2),.42)}
  else if(kind===1){want=sp.clone().addScaledVector(F2.t,18).addScaledVector(F2.r,attractCam.side*11).addScaledVector(F2.u,2.6);look=sp.clone().addScaledVector(F2.u,1)}
  else if(kind===2){want=sp.clone().addScaledVector(F2.t,-30).addScaledVector(F2.u,16).addScaledVector(F2.r,attractCam.side*8);look=sp.clone().addScaledVector(F2.t,24)}
  else{want=sp.clone().addScaledVector(s._fw||F2.t,.5).addScaledVector(F2.u,1.25);look=sp.clone().addScaledVector(s._fw||F2.t,60).addScaledVector(F2.u,1)}
  // lock along-track position to the craft; smooth only the lateral/vertical offset
  const kf=snap?1:1-Math.exp(-dt*(kind===3?40:kind===0?6:5));
  if(kind===0){const rel=want.clone().sub(sp);camLat.lerp(rel,kf);if(snap)camLat.copy(rel);camPos.copy(sp).add(camLat)}else camPos.lerp(want,kf);
  camLook.lerp(look,snap?1:1-Math.exp(-dt*16));camUp.lerp(up,snap?1:1-Math.exp(-dt*5)).normalize();if(snap){camPos.copy(want);camLook.copy(look)}
  {const al=camPos.clone().sub(F2.p).dot(F2.t),CF=updateCam.f||(updateCam.f=mkF());frameAt(TD,s.dist+al,CF);if(CF.p.y<-12){const rel=camPos.clone().sub(CF.p),l=rel.dot(CF.r),u=rel.dot(CF.u),R0=HALF+6,lc=clamp(l,-(R0-3),R0-3),ce=Math.pow(Math.max(.02,Math.sqrt(1-(lc/R0)**2)),.22)*20-3;if(u>ce||l!==lc)camPos.copy(CF.p).addScaledVector(CF.t,rel.dot(CF.t)).addScaledVector(CF.r,lc).addScaledVector(CF.u,Math.min(u,ce))}}const jit=Math.max(0,shake-.3)*1.6*fxK();camera.position.copy(camPos);if(jit>0){camera.position.x+=rr(-.5,.5)*jit;camera.position.y+=rr(-.5,.5)*jit}camera.up.copy(camUp);camera.lookAt(camLook);
  if(kind===0&&state!=='menu')camera.rotateZ(-(s.roll||0)*.16);
  fovKick*=Math.exp(-9*dt);const fov=(kind===3?74:{narrow:56,normal:62,wide:70}[SET.fov])+26*Math.pow(clamp(spd,0,1.25),1.2)+(s.nitro||s.turbo>0?7*TUNE.fxFov:0)+fovKick;camera.fov+=(pFov(fov)-camera.fov)*Math.min(1,(dt||.016)*3);camera.updateProjectionMatrix();
  FX.uniforms.uSpeed.value=lerp(FX.uniforms.uSpeed.value,(state==='menu'?.2:0)*fxK(),Math.min(1,dt*4));FX.uniforms.uBoost.value=lerp(FX.uniforms.uBoost.value,(s.nitro&&state!=='menu'?.3:(s.turbo>0?.3:0))*fxK()*TUNE.fxGlow,Math.min(1,dt*6));
  speedLines.mesh.material.opacity=state==='menu'?0:(clamp((spd-.45)*.7,0,.32)+(s.nitro?.12*TUNE.fxLines:0))*fxK()}
function cycleCam(){camMode=(camMode+1)%2}

let winT=0;
