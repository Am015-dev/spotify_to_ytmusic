/* ---------- G: owner test checklist, first-tap buttons, power-up levels, weapons (2 slots, LV1-5), fairness net.
   Loaded after lagfix.js and before c.js; everything here hooks in through wrappers or the DOM, like upgrades.js. ---------- */

/* ===== 1. TEST CHECKLIST (same pattern as the other game: PASS / FAIL + note per item, saved on the device, COPY RESULTS) =====
   Add the items of every new version at the top; NR_VER is the newest version. Results live in localStorage 'mnr_chk'. */
const NR_VER='H1';
const NR_CHECKLIST=[
 {ver:'H1',id:'afk',text:'Stop moving with your best guns: within about 30 seconds (20 on Hard) a red lane locks on your row and a beam hits you, and enemies shoot faster. Moving away always dodges it.'},
 {ver:'H1',id:'afk-score',text:'Standing still pays less and less: kills score far fewer points and your multiplier melts. Keep moving to keep the score.'},
 {ver:'H1',id:'fewer',text:'The screen has far fewer enemy bullets (25 at most on Normal, 35 on Hard, 18 on a phone), each one aimed at you and glowing a beat before it fires.'},
 {ver:'H1',id:'quiet-shots',text:'Your own shots are thinner and dimmer, so the lime enemy bullets stand out clearly.'},
 {ver:'H1',id:'dying-beat',text:'With 2 hull left the song slows a little and drops in pitch, with 1 hull left more; heal and it speeds back up. The beat cue still matches the music.'},
 {ver:'H1',id:'death-stop',text:'When you die the music winds down like a tape stopping.'},
 {ver:'H1',id:'caps',text:'Damage, crit, double-shot and drone perks stack only up to a limit, so the garage descriptions now match what you really get.'},
 {ver:'G1',id:'btn-first-tap',text:'Open the game and tap ENDLESS, STORY, DAILY RUN or SETTINGS the moment they appear (they now show up about a second after loading, and no longer move). Each reacts on the first tap, every time. Try it a few times, reloading each time.'},
 {ver:'G1',id:'btn-menus',text:'Pause, FLY AGAIN, TITLE, RESUME and the pit-stop buttons all react on the first tap, with no double action.'},
 {ver:'G1',id:'lvl-garage',text:'Garage TUNE: Shield, Hull, Dash, Drone and Revive go up to level 5 (Shield Regen to 6), the other perks to 10 or 12. Each level costs more than the last.'},
 {ver:'G1',id:'lvl-pit',text:'Pit stop: every upgrade card shows level pips and what the next level does. Buying the same upgrade again raises it up to level 5.'},
 {ver:'G1',id:'lvl-power',text:'Collect the same power-up twice in one run. The second time its HUD icon shows LV2 and it lasts longer. A third pickup shows LV3, and so on up to LV5.'},
 {ver:'G1',id:'wp-explain',text:'At your first pit stop the WEAPONS sheet opens by itself: four weapons, each with a small looping demo and a few words.'},
 {ver:'G1',id:'wp-equip',text:'Pit stop > WEAPONS: tap a weapon to put it in one of the 2 slots (tap again to take it out). The pit-stop timer waits while you choose. The next stage fires what you chose.'},
 {ver:'G1',id:'wp-title',text:'Title screen > WEAPONS: pick your two weapons before you launch. They are still equipped on your next run.'},
 {ver:'G1',id:'wp-xp',text:'Collect the pink weapon pickups (gunships, turrets, bosses drop them). The weapon with the lower level gains a level and you see it bottom left (for example PULSE 2).'},
 {ver:'G1',id:'wp-feel',text:'The four weapons feel different: Pulse is a wide spread, Lance is one long piercing beam, Swarm missiles chase enemies, Cannon fires a heavy shell on every beat.'},
 {ver:'G1',id:'fair-hit',text:'After a hit the ship blinks for about one second and nothing can hurt it in that time.'},
 {ver:'G1',id:'fair-spawn',text:'Nothing hits you the moment it appears. Every shot and enemy is visible and has a warning first.'},
 {ver:'G1',id:'fair-boss',text:'Boss fight on a phone: the bullets stay readable and there is always a gap to fly through.'},
 {ver:'G1',id:'fair-hard',text:'Normal feels fair but not easy and gets harder through the stage. Hard is still hard.'},
 {ver:'G1',id:'songs-continue',text:'Songs carry on from stage to stage: the next song fades in, no silence and no restart from the beginning.'},
 {ver:'G1',id:'no-lag',text:'On desktop a whole stage plays without stutter (turn on the FPS counter in settings if you want to see it).'},
 {ver:'G1',id:'endless',text:'Keep playing past the last stage (endless): there is still new content, such as mutators and mini-bosses, not the same stage again.'},
 {ver:'G1',id:'boss-music',text:'Each boss fight switches to its own boss music and the normal song comes back afterwards.'},
 {ver:'G1',id:'checklist',text:'This CHECKLIST opens from the title screen and from settings. PASS and FAIL stay after a reload, and COPY RESULTS copies the text.'}];
{const KEY='mnr_chk',esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
 const ld=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}},sv=s=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}};
 const k=it=>it.ver+'/'+it.id,cur=()=>NR_CHECKLIST.filter(it=>it.ver===NR_VER);
 const left=()=>{const s=ld();return cur().filter(it=>!(s[k(it)]&&s[k(it)].st)).length};
 const st=document.createElement('style');st.textContent=`#nrChk{position:fixed;inset:0;z-index:9100;display:flex;align-items:center;justify-content:center;background:rgba(5,3,12,.78);padding:8px;box-sizing:border-box;-webkit-user-select:none;user-select:none}#nrChk[hidden]{display:none}
#nrChk .cc{width:min(720px,100%);max-height:100%;display:flex;flex-direction:column;background:#0d0820;border:2px solid var(--cyan);border-radius:14px;color:var(--ink);font:600 13px var(--display)}
#nrChk .ch{display:flex;align-items:center;gap:8px;padding:6px 10px;border-bottom:1px solid #3a2b5c}#nrChk .ch b{font:700 18px var(--display);letter-spacing:.12em;color:var(--cyan)}#nrChk .ch small{color:var(--dim);font-size:12px}
#nrChk button{font:700 13px var(--display);min-width:44px;min-height:44px;border-radius:8px;border:2px solid var(--cyan);background:#1a1033;color:#fff;padding:0 10px;cursor:pointer}#nrChk .ch [data-c=copy]{margin-left:auto}
#nrChk .cb{overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding:4px 10px 10px}#nrChk .ci{display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid #ffffff14;flex-wrap:wrap}
#nrChk .ci p{flex:1 1 280px;margin:0;line-height:1.35;font-size:13px;font-weight:500}#nrChk .ci .pa.on{background:#3dffb0;border-color:#3dffb0;color:#0d0820}#nrChk .ci .fa.on{background:#ff3050;border-color:#ff3050}
#nrChk .ci input{flex:1 1 100%;min-height:36px;font:13px var(--display);background:#140c26;color:#fff;border:1px solid #19e3ff55;border-radius:8px;padding:4px 8px;-webkit-user-select:text;user-select:text}
#nrChk .msg{color:var(--amber);font-size:12px;white-space:pre-wrap}`;document.head.appendChild(st);
 const ov=document.createElement('div');ov.id='nrChk';ov.hidden=true;document.body.appendChild(ov);
 const text=()=>{const s=ld();return 'Mainhattan Nightrun checklist '+NR_VER+'\n'+NR_CHECKLIST.map(it=>{const r=s[k(it)]||{};return `${it.ver} ${it.id}: ${r.st||'-'}${r.n?' · '+r.n:''}`}).join('\n')};
 const badge=()=>{const n=left();document.querySelectorAll('.ckB').forEach(b=>b.textContent='CHECKLIST'+(n?` (${n})`:''))};
 const render=msg=>{const s=ld();let h=`<div class="cc"><div class="ch"><b>CHECKLIST</b><small>${esc(NR_VER)} · ${left()} to test</small><button data-c="copy" type="button">COPY RESULTS</button><button data-c="x" type="button" aria-label="Close">✕</button></div><div class="cb">${msg?`<div class="msg">${esc(msg)}</div>`:''}`;
  for(const it of NR_CHECKLIST){const r=s[k(it)]||{};h+=`<div class="ci" data-k="${esc(k(it))}"><p>${it.ver===NR_VER?'':`<small>${esc(it.ver)} · </small>`}${esc(it.text)}</p><button class="pa ${r.st==='PASS'?'on':''}" data-c="PASS" type="button">PASS</button><button class="fa ${r.st==='FAIL'?'on':''}" data-c="FAIL" type="button">FAIL</button><input type="text" placeholder="note (optional)" value="${esc(r.n||'')}"></div>`}
  ov.innerHTML=h+'</div></div>';badge()};
 const copy=()=>{const t=text(),done=()=>render('Copied. Paste it into the chat.');
  const fb=()=>{const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;left:0;top:0;opacity:0';document.body.appendChild(a);a.select();let ok=false;try{ok=document.execCommand('copy')}catch(e){}a.remove();ok?done():render('Copy was blocked here. Select this text and copy it:\n'+t)};
  try{navigator.clipboard.writeText(t).then(done,fb)}catch(e){fb()}};
 const shut=()=>{ov.hidden=true};
 ov.addEventListener('click',e=>{if(e.target===ov){shut();return}const b=e.target.closest('button');if(!b)return;const c=b.dataset.c;try{AU.sfx('pick')}catch(er){}
  if(c==='x')shut();else if(c==='copy')copy();else if(c==='PASS'||c==='FAIL'){const key=b.closest('.ci').dataset.k,s=ld();s[key]=Object.assign(s[key]||{},{st:s[key]&&s[key].st===c?'':c});sv(s);const sc=ov.querySelector('.cb').scrollTop;render();ov.querySelector('.cb').scrollTop=sc}});
 ov.addEventListener('change',e=>{const i=e.target;if(i.tagName!=='INPUT')return;const key=i.closest('.ci').dataset.k,s=ld();s[key]=Object.assign(s[key]||{},{n:i.value.slice(0,200)});sv(s)});
 for(const ev of['touchstart','touchmove','touchend','pointerdown','mousedown','wheel'])ov.addEventListener(ev,e=>e.stopPropagation(),{passive:true});
 addEventListener('keydown',e=>{if(ov.hidden)return;if(e.code==='Escape'){shut();e.stopImmediatePropagation();e.preventDefault();return;}
   if(e.target&&e.target.tagName==='INPUT')return;if(e.code==='Enter'||e.code==='Space')e.stopImmediatePropagation();},true);   // Enter / Space inside the sheet never starts the game
 window.nrChkOpen=()=>{render();ov.hidden=false};
 const mk=()=>{const b=document.createElement('button');b.type='button';b.className='go dim ckB';b.addEventListener('click',e=>{e.stopPropagation();nrChkOpen()});return b};
 const trow=document.querySelector('#title .row');
 {const sb=document.getElementById('setBody');if(sb){const w=document.createElement('div');w.style.cssText='margin:10px 0 4px';w.appendChild(mk());sb.appendChild(w);}}   // top of the settings list: the footer is too narrow for a third button on a small phone
 if(trow){const r2=document.createElement('div');r2.className='row';r2.id='titleRow2';r2.appendChild(mk());trow.after(r2);}
 badge();
 window.__chk={open:()=>nrChkOpen(),text,items:NR_CHECKLIST,left,ver:NR_VER};}

/* ===== 2. FIRST-TAP BUTTONS =====
   The first tap on a phone could be lost: the page re-laid itself out on the first touch, so the button moved between finger down and finger up and no click came.
   (b.js now knows a phone from the start.) On top of that every button fires on pointer UP over the button it was pressed on (judged by where it was when pressed),
   once; the browser's own click that follows is swallowed, so nothing runs twice. Keyboard clicks (detail 0) and the on-screen DASH/EMP/PAUSE pads (their own pointerdown) are left alone. */
{let dn=null,lastUp=-1e9,synth=false;
 const btnOf=t=>{const b=t&&t.closest&&t.closest('button');return b&&!b.disabled&&b.id!=='calPad'&&!b.closest('#touch')?b:null;};
 const shown=b=>b.isConnected&&b.getClientRects().length>0;
 addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0){dn=null;return;}const b=btnOf(e.target);dn=b?{b,x:e.clientX,y:e.clientY,r:b.getBoundingClientRect(),id:e.pointerId}:null;},true);
 addEventListener('pointercancel',()=>{dn=null;},true);
 addEventListener('pointerup',e=>{const d=dn;dn=null;if(!d||d.id!==e.pointerId||!shown(d.b))return;
   if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>16)return;                                  // a drag or a scroll, not a tap
   const r=d.r,inside=e.clientX>=r.left-4&&e.clientX<=r.right+4&&e.clientY>=r.top-4&&e.clientY<=r.bottom+4;
   if(!inside&&btnOf(document.elementFromPoint(e.clientX,e.clientY))!==d.b)return;
   lastUp=e.timeStamp;synth=true;try{d.b.click();}finally{synth=false;}},true);
 addEventListener('click',e=>{if(synth||!e.isTrusted||e.detail===0)return;if(e.timeStamp-lastUp<900&&btnOf(e.target)){e.stopImmediatePropagation();e.preventDefault();}},true);
 window.__tap={get last(){return lastUp}};}

/* the title buttons appear once the page has been built, the fonts are in and the layout has stopped moving (head.html hides them until then) */
{const go=()=>setTimeout(()=>requestAnimationFrame(()=>document.documentElement.classList.add('rdy')),400);
 Promise.race([document.fonts&&document.fonts.ready,new Promise(r=>setTimeout(r,1500))]).then(go,go);}

/* ===== 3. POWER-UP LEVELS: picking the same power-up again levels it (up to LV5): longer, and stronger where it can be ===== */
const PWL={};
const PW_LV_MAX=5;
NR.on('runStart',()=>{for(const k in PWL)delete PWL[k];});
{const give=PW.give;
 PW.give=function(kind,ob){const lv=Math.min(PW_LV_MAX,(PWL[kind]||0)+1),r=give.call(this,kind,ob);if(!r)return r;PWL[kind]=lv;
   if(kind==='fix'){if(lv>=3&&P.hp<P.max)P.hp++;}
   else if(kind!=='drop'){const a=this.st().act.find(x=>x.k===kind);if(a){a.lv=lv;a.d*=1+.2*(lv-1);}}
   if(lv>1){floater(P.x,P.y-60,PWK[kind].n.split(' ')[0]+' LV'+lv,PWK[kind].c);G.hint={t:3,txt:say(PWK[kind].tip+' · LV'+lv)};}
   return r;};
 const tk=PW.tick;PW.tick=function(dt){const s=this.st(),before=G.score,ls=s.ls,a=s.act.find(x=>x.k==='tempo');tk.call(this,dt);
   if(a&&a.lv>1&&before>ls){G.score+=Math.round((before-ls)*.25*(a.lv-1));s.ls=G.score;}};          // Tempo Up: score x2.0, x2.25 ... x3.0
 const bl=PW.blast;PW.blast=function(ob){bl.call(this,ob);const lv=PWL.drop||1;if(lv>1)for(const e of G.en){if(e.type==='boss'){if(e.x<W-20)e.hp-=4*(lv-1);}else e.hp-=7*(lv-1);}};   // Drop: a harder blast
 const hd=PW.hud;PW.hud=function(t,x0,y0,k){hd.call(this,t,x0,y0,k);const s=G.pw;if(!s)return;k=k||1;x0=x0==null?18:x0;let y=y0==null?112:y0;
   for(const a of s.act){if(a.lv>1){ctx.save();ctx.translate(x0,y);ctx.scale(k,k);ctx.font='700 10px "Share Tech Mono",monospace';ctx.textAlign='center';ctx.fillStyle=PWK[a.k].c;ctx.fillText('LV'+a.lv,14,18);ctx.restore();}y+=46*k;}};}
NR.on('beat',()=>{if(!G.live||G.dead||SH.active||!PW.on('drum'))return;const a=G.pw.act.find(x=>x.k==='drum'),lv=a&&a.lv||1;if(lv<3)return;     // Drum Burst LV3+: a wider burst on every beat
  const x=P.x+22,y=P.y;G.pb.push({x,y:y-10,vx:880,vy:-150,dm:1,pf:0},{x,y:y+10,vx:880,vy:150,dm:1,pf:0});if(lv>=5)G.pb.push({x,y:y-14,vx:860,vy:-260,dm:1,pf:0},{x,y:y+14,vx:860,vy:260,dm:1,pf:0});});
NR.on('fire',f=>{if(!PW.on('tri'))return;const a=G.pw.act.find(x=>x.k==='tri'),lv=a&&a.lv||1;if(lv<3)return;                                    // Triple Shot LV3+: another pair of side shots
  G.pb.push({x:f.x,y:f.y-12,vx:840,vy:-300,dm:.7*tpDmg(),pf:0},{x:f.x,y:f.y+12,vx:840,vy:300,dm:.7*tpDmg(),pf:0});});
NR.on('tick',()=>{if(!G.live||G.dead)return;if(PW.on('nr')){const a=G.pw.act.find(x=>x.k==='nr');SH.nx=TP.nx0*(2+.5*((a&&a.lv||1)-1));}});   // Neon Rain pays x2.0 ... x4.0

/* ===== 4. WEAPONS: four weapons, two slots, equipped in the pit stop (or on the title screen), each LV1-5 =====
   Pickups ("up" drops) give XP to the equipped weapon with the lower level. The base guns of the ship are unchanged; weapons add to them. */
const WPD={
  pulse:{n:'PULSE SPREAD',s:'PULSE',c:'#ff8ad8',tx:'Wide spread. Best against crowds.'},
  laser:{n:'LASER LANCE',s:'LANCE',c:'#7dffd8',tx:'One beam pierces every enemy in line.'},
  swarm:{n:'HOMING SWARM',s:'SWARM',c:'#ffb020',tx:'Missiles hunt the nearest enemy.'},
  beat:{n:'BEAT CANNON',s:'CANNON',c:'#ffe14d',tx:'A heavy shell on every beat.'}};
const WP_IDS=Object.keys(WPD),WP_NEED=[2,3,4,5];                // pickups to go from LV1 to LV2, LV2 to LV3, ...
const WP={eq:['pulse',null],lv:{},xp:{},vc:0,open:false,mode:'pit',seen:!!load('mnr_wpseen',false),
  lvOf(id){return this.lv[id]||1;},
  eqIds(){return this.eq.filter(Boolean);},
  canGain(){return this.eqIds().some(id=>this.lvOf(id)<5);},
  maxLv(){let m=1;for(const id of this.eqIds())m=Math.max(m,this.lvOf(id));return m;},
  sync(){if(typeof P!=='undefined'&&P)P.wl=this.maxLv();},
  save(){save('mnr_wp',{eq:this.eq});},
  reset(){this.lv={};this.xp={};this.vc=0;this.sync();},
  gain(){const ids=this.eqIds().filter(id=>this.lvOf(id)<5);if(!ids.length){P.emp=Math.min(3,P.emp+1);floater(P.x,P.y-24,'EMP +1','#ffb020');return;}
    ids.sort((a,b)=>this.lvOf(a)-this.lvOf(b));const id=ids[0],d=WPD[id];this.xp[id]=(this.xp[id]||0)+1;
    if(this.xp[id]>=WP_NEED[this.lvOf(id)-1]){this.xp[id]=0;this.lv[id]=this.lvOf(id)+1;floater(P.x,P.y-24,d.s+' LV'+this.lv[id],d.c);G.rings.push({x:P.x,y:P.y,l:.5,m:.5,c:d.c});}
    else floater(P.x,P.y-24,d.s+' '+this.xp[id]+'/'+WP_NEED[this.lvOf(id)-1],d.c);
    this.sync();if(this.open)this.draw();},
  // the shots of the equipped weapons, called inside the ship's volley so every upgrade (damage, crits, piercing...) applies to them too
  shots(std,pf){this.vc++;
    for(const id of this.eq){if(!id)continue;const L=this.lvOf(id);
      if(id==='pulse'){const d=.8+.05*(L-1),v=[130];if(L>=2)v.push(240);if(L>=3)v.push(60);if(L>=5)v.push(330);
        for(const a of v){std(870,-a,d,{col:'#ff8ad8',len:12});std(870,a,d,{col:'#ff8ad8',len:12});}}
      else if(id==='laser'){if(this.vc%2===0)std(1500,0,1.5+.5*L,{big:1,px:new Set(),pn:99,col:'#7dffd8',len:90,th:3.5});}
      else if(id==='swarm'){if(this.vc%2===1){const n=1+(L>=2)+(L>=4),d=.75+.12*L;for(let i=0;i<n;i++)std(520,(i-(n-1)/2)*300+rnd(-60,60),d,{hk:2.6+.6*L,col:'#ffb020',len:10,th:4});}}}},
  beat(){if(!G.live||G.dead||SH.active||P.over||!this.eq.includes('beat'))return;const L=this.lvOf('beat'),dm=(7+3*(L-1))*tpDmg();
    G.pb.push({x:P.x+28,y:P.y,vx:760,vy:0,dm,pf:1,big:1,rad:8,px:new Set(),pn:Math.floor((L-1)/2),col:'#ffe14d',len:40,th:9});
    if(L>=4)G.pb.push({x:P.x+20,y:P.y-8,vx:740,vy:-130,dm:dm*.55,pf:1,big:1,px:new Set(),pn:0,col:'#ffe14d',len:24,th:6},{x:P.x+20,y:P.y+8,vx:740,vy:130,dm:dm*.55,pf:1,big:1,px:new Set(),pn:0,col:'#ffe14d',len:24,th:6});
    G.rings.push({x:P.x+24,y:P.y,l:.25,m:.25,c:'#ffe14d'});AU.sfx('shot');},
  // short text for the HUD: "PULSE 2 · LANCE 1"
  hud(c,x,y,k){c.save();c.font=`${Math.round(11*(k||1))}px "Share Tech Mono",monospace`;c.textAlign='left';let xx=x;
    for(const id of this.eq){const d=id&&WPD[id],t=d?d.s+' '+this.lvOf(id):'-';c.fillStyle=d?d.c:'#8c86b8';c.fillText(t,xx,y);xx+=c.measureText(t).width+10*(k||1);}c.restore();},
  toggle(id){const i=this.eq.indexOf(id);let m;
    if(i>=0){if(this.eqIds().length<2){this.msg('Keep one weapon equipped');return;}this.eq[i]=null;m=WPD[id].s+' removed';}
    else{let j=this.eq.indexOf(null);if(j<0)j=this.lvOf(this.eq[0])<this.lvOf(this.eq[1])?0:1;this.eq[j]=id;m=WPD[id].s+' in slot '+(j+1);}
    this.save();this.sync();AU.sfx('up');this.msg(m);this.draw();},
  msg(t){const el=$('wpMsg');if(el)el.textContent=t;}};
{const ld=load('mnr_wp',null);if(ld&&Array.isArray(ld.eq)){WP.eq=[WP_IDS.includes(ld.eq[0])?ld.eq[0]:null,WP_IDS.includes(ld.eq[1])&&ld.eq[1]!==ld.eq[0]?ld.eq[1]:null];if(!WP.eqIds().length)WP.eq=['pulse',null];}}
window.__wp=Object.assign(WP,{lvl(id,n){this.lv[id]=n;}});          // test hook
NR.on('runStart',()=>WP.reset());NR.on('tick',()=>WP.sync());NR.on('beat',()=>WP.beat());

/* ----- the WEAPONS sheet: one card per weapon with a 2-second looping demo and a few words ----- */
{const st=document.createElement('style');st.textContent=`
#wpm .slots{display:flex;gap:8px;flex-wrap:wrap;margin-left:auto;font-family:var(--mono);font-size:clamp(11px,calc(var(--u)*3.2),15px);color:var(--dim)}
#wpm .slots b{color:var(--ink);font-weight:400;border:1px solid #3a2b5c;background:#140c26;border-radius:4px;padding:2px 8px}
#wpL{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));grid-auto-rows:min-content;gap:calc(var(--u)*2);overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;flex:1 1 0;min-height:0;padding:4px 2px}
#wpL .card{flex-direction:row;text-align:left;justify-content:flex-start;gap:10px;padding:8px 10px;min-height:76px;position:relative}
#wpL .card canvas{width:108px;height:52px;flex:0 0 auto;background:#0a0618;border-radius:6px}
#wpL .card .tx{flex:1 1 0}#wpL .card .slot{position:absolute;top:4px;right:8px;font-family:var(--mono);font-size:11px;color:var(--c);letter-spacing:.06em}
#wpL .card .pp{display:flex;gap:2px;margin-top:3px}#wpL .card .pp i{display:block;width:clamp(8px,calc(var(--u)*3),14px);height:5px;border-radius:1px;background:#ffffff22}#wpL .card .pp i.on{background:var(--c)}
#wpL .card.sel{background:#22123f}
#shWpRow{display:flex;gap:10px;align-items:center;flex:0 0 auto;min-height:44px}#shWpRow button{flex:0 0 auto;min-width:44px;padding:.4em 1em}#shWpRow span{font-family:var(--mono);color:var(--dim);font-size:clamp(11px,calc(var(--u)*3.2),15px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#titleRow2{margin-top:2px}#titleRow2 .go{font-size:clamp(12px,min(1.6vw,2.8vh),16px)}`;document.head.appendChild(st);}
const wpEl=document.createElement('div');wpEl.id='wpm';wpEl.className='ov solid pg';wpEl.hidden=true;
wpEl.innerHTML='<div class="top"><span class="ttl">WEAPONS</span><span class="slots" id="wpSl"></span></div><div id="wpL"></div><div class="msg" id="wpMsg"></div><div class="bot"><button class="go alt" id="wpGo" type="button">DONE</button></div>';
stage.appendChild(wpEl);
{const DEMO=(id,c,t,col)=>{                                       // t: 0..2 seconds, the demo loops
   c.clearRect(0,0,108,52);const sy=26;c.fillStyle='#ffffff';c.beginPath();c.moveTo(6,sy-6);c.lineTo(18,sy);c.lineTo(6,sy+6);c.closePath();c.fill();
   const foe=(x,y,hit)=>{c.fillStyle=hit?'#ffffff':'#ff3050';c.beginPath();c.arc(x,y,5,0,7);c.fill();};
   c.strokeStyle=col;c.fillStyle=col;c.lineWidth=2;c.lineCap='round';
   if(id==='pulse'){foe(98,12,0);foe(98,26,0);foe(98,40,0);const p=(t%.5)/.5;for(const a of[-.45,-.2,0,.2,.45]){const d=20+p*78;c.beginPath();c.moveTo(18+Math.cos(a)*(d-8),sy+Math.sin(a)*(d-8));c.lineTo(18+Math.cos(a)*d,sy+Math.sin(a)*d);c.stroke();}}
   else if(id==='laser'){const p=(t%1)/1,len=Math.min(1,p*1.6)*84;foe(50,sy,p*84>32);foe(72,sy,p*84>54);foe(94,sy,p*84>76);c.lineWidth=3;c.beginPath();c.moveTo(20,sy);c.lineTo(20+len,sy);c.stroke();c.globalAlpha=.3;c.lineWidth=7;c.stroke();c.globalAlpha=1;}
   else if(id==='swarm'){const p=(t%1)/1,tg=[[96,10],[100,28],[94,44]];tg.forEach((q,i)=>foe(q[0],q[1],p>.92));
     tg.forEach((q,i)=>{const dir=i===1?0:(i===0?-1:1),x=18+(q[0]-18)*p,y=sy+(q[1]-sy)*p-dir*Math.sin(p*Math.PI)*-16;c.beginPath();c.arc(x,y,2.6,0,7);c.fill();});}
   else{const p=(t%1)/1,ring=(t%1)<.3?(t%1)/.3:0;c.globalAlpha=1-ring;c.beginPath();c.arc(20,sy,4+ring*14,0,7);c.stroke();c.globalAlpha=1;foe(94,sy,p>.8&&p<.95);
     const x=20+p*70;c.fillRect(x-8,sy-4,18,8);}
 };
 let raf=0;const loop=()=>{raf=0;if(wpEl.hidden)return;const t=(performance.now()/1000)%2;for(const cv of wpEl.querySelectorAll('canvas')){const c=cv.getContext('2d');DEMO(cv.dataset.id,c,t,WPD[cv.dataset.id].c);}raf=requestAnimationFrame(loop);};
 WP.draw=function(){const box=$('wpL');box.innerHTML='';
   for(const id of WP_IDS){const d=WPD[id],L=this.lvOf(id),slot=this.eq.indexOf(id),b=document.createElement('button');b.type='button';b.className='card'+(slot>=0?' sel':'');b.style.setProperty('--c',d.c);b.dataset.id=id;
     b.innerHTML=`<canvas width="108" height="52" data-id="${id}"></canvas><div class="tx"><div class="n">${d.n}</div><div class="t">${d.tx}</div><div class="pp">${[1,2,3,4,5].map(i=>`<i class="${i<=L?'on':''}"></i>`).join('')}</div></div><span class="slot">${slot>=0?'SLOT '+(slot+1):'TAP TO EQUIP'}</span>`;
     b.addEventListener('click',()=>this.toggle(id));box.appendChild(b);}
   $('wpSl').innerHTML=this.eq.map((id,i)=>`<b>${i+1}: ${id?WPD[id].s+' '+this.lvOf(id):'empty'}</b>`).join('');
   if(!raf)raf=requestAnimationFrame(loop);
   const row=$('shWpTx');if(row)row.textContent=this.eq.map(id=>id?WPD[id].s+' '+this.lvOf(id):'-').join(' · ');};
 WP.show=function(mode){this.mode=mode||'pit';this.open=true;this.seen=true;save('mnr_wpseen',true);this.msg('');this.draw();wpEl.hidden=false;try{AU.sfx('pick')}catch(e){}};
 WP.hide=function(){if(!this.open)return;this.open=false;wpEl.hidden=true;if(this.mode==='pit'&&typeof SH!=='undefined'&&SH.active)SH.draw();this.draw();};
 $('wpGo').addEventListener('click',()=>WP.hide());
 addEventListener('keydown',e=>{if(!WP.open)return;if(e.code==='Escape'||e.code==='Enter'||e.code==='Space'){WP.hide();e.stopImmediatePropagation();e.preventDefault();}},true);}
// a WEAPONS button + the loadout in the pit stop (above GO), and on the title screen
{const row=document.createElement('div');row.id='shWpRow';row.innerHTML='<button class="go dim" id="shWp" type="button">WEAPONS</button><span id="shWpTx"></span>';$('shMsg').after(row);
 $('shWp').addEventListener('click',()=>WP.show('pit'));
 const t2=document.getElementById('titleRow2'),b=document.createElement('button');b.type='button';b.className='go dim';b.id='wpBtn';b.textContent='WEAPONS';b.addEventListener('click',()=>WP.show('title'));
 if(t2)t2.insertBefore(b,t2.firstChild);}
// the pit-stop clock waits while the sheet is open; the first pit stop opens it by itself (not under test automation, which drives the shop buttons)
{const tk=SH.tick;SH.tick=function(dt){if(WP.open){pressed={};return;}tk.call(this,dt);};
 const pit=SH.pit;SH.pit=function(cb){pit.call(this,cb);if(this.active&&!WP.seen&&!navigator.webdriver)WP.show('pit');WP.draw();};}
WP.draw();

/* ===== 5. FAIR NET (b.js has the rest: bodies hurt only on screen, the bullet cap) =====
   Leaving the pit stop gives 1.2 s of safety, so the first shots of the next district never meet a ship that was still deciding. */
{const close=SH.close;SH.close=function(){const was=this.active;close.call(this);if(was&&P)P.inv=Math.max(P.inv||0,1.2);};}
// Hard: the safety blink after a hit is shorter (1 s instead of 1.5 s), so Hard stays hard while Normal and Easy are kinder
{const h0=hurt;hurt=function(){const hp0=P.hp;h0();if(HARD&&P.hp<hp0)P.inv=Math.min(P.inv,1);};}
