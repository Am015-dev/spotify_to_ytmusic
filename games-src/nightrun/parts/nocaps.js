// PURPOSE: no caption, hint bubble or info box while a stage is played; a new thing is taught by ONE pre-stage card that offers its Flight School drill
// FLAG: nocaps (?nocaps=0)
// TEST: nocaps-test.js
/* ---------- NC (flag RET.nocaps, default ON; ?nocaps=0 = captions in the stage as before). Owner, 22 Oct 2026: "While playing the game many distracting info
   boxes: these should go to the drills as scenarios and not in the game; the drill should appear only the first time to explain to the user but never
   inside the stage; very distracting and annoying."
   1 in a stage (story, endless, weekly, Legend; not a drill, not the Lab) nothing is drawn that explains: explain.js captions, zonehint.js ring caption,
     HINT bubbles (rule cards, "NEW ATTACK", "CHOOSE", ability tips), the old speech bubble, the power-up chip "TAP: use X now", the "KEEP MOVING" floater,
     rule banners and the first30 story cards. Button word labels, the stage title banner, score pops and grade letters stay (they are labels, not boxes).
     Every suppressed id is still recorded (NC.sup) and goes to the pause screen list WHAT'S ON SCREEN (explain.js), which stays as the reference.
   2 before a stage starts: if it brings a thing this profile was never offered (NC.TAB[stage] = ids measured by nocaps-test.js MEASURE=1; NC.THING = words + drill),
     ONE card "NEW: <thing>. Try the 30 s drill?" with PLAY DRILL / SKIP. Shown on the first visit of a stage only, one thing per thing per profile
     (localStorage mnr_nocaps). PLAY DRILL runs that Flight School drill (school.js __school.runThen) and the stage starts when it ends or is skipped.
     Automation (webdriver) gets no card unless ?nocapscard=1. ---------- */
if(RET.nocaps===undefined)RET.nocaps=!/[?&]nocaps=0/.test(location.search);
const NC=window.NC={get on(){return!!RET.nocaps;},sup:{},card:null,last:null,
  auto:!navigator.webdriver||/[?&]nocapscard=1/.test(location.search),
  THING:{beat:['the beat rings on your ship','dash'],hull:['your hull squares','dodge'],btn:['the charge numbers on the buttons','emp'],chain:['the CHAIN bonus','graze'],
    grade:['the grade letter','shoot'],edge:['the red screen edges','dodge'],lane:['red laser lanes','gate'],supply:['supply drops','pick'],gaterun:['yellow gate rings','gate'],
    leak:['enemies that get past you','shoot'],warn:['danger marks at the screen edge','dodge'],tell:['pink attack rings','charger'],counter:['red threat rings','l-counter'],
    fence:['the laser fence','gate'],hpbar:['enemy health bars','shoot'],tough:['tougher enemies','shoot'],flank:['flank arrows','charger'],still:['the standing still warning','move'],
    secret:['gold secrets','shoot'],shield:['shielded enemies','shield'],bill:['falling signs','dodge'],hail:['meteor lanes','dodge'],rescue:['rescue capsules','pick'],
    gust:['wind gusts','move'],blackout:['blackouts','dodge'],zh_rule:['the gravity well','well'],zh_boss:['the gravity well','well'],power:['music power-ups','pick']},
  TAB:{"s1":["beat","hull","btn","chain","grade","leak","tough","hpbar","tell","fence"],"s2":["beat","hull","btn","grade","leak","tough","hpbar","tell","bill","blackout","zh_rule","rule:well"],"s3":["beat","hull","btn","chain","grade","leak","tough","hpbar","tell","warn","counter","secret","blackout","zh_rule","rule:well"],"s4":["beat","hull","btn","chain","grade","leak","tough","hpbar","tell","warn","counter","secret","gaterun","zh_rule","rule:well"],"s5":["beat","hull","btn","chain","grade","leak","tough","hpbar","tell","warn","counter","rescue","rule:lane"],"s6":["beat","hull","btn","chain","grade","leak","tough","hpbar","tell","warn","counter","shield","secret","gust","rule:lane"],"s7":["beat","hull","btn","chain","grade","leak","tough","hpbar","tell","warn","counter","secret","blackout","zh_rule","rule:lane"],"s8":["beat","hull","btn","chain","grade","leak","tough","hpbar","tell","warn","counter","secret","blackout","rule:echo"],"s9":["beat","hull","btn","chain","grade","leak","tough","hpbar","tell","warn","counter","secret","gaterun","rule:echo"],"s10":["beat","hull","btn","chain","grade","leak","tough","hpbar","tell","warn","counter","shield","secret","supply","lane","bill","rule:echo"],"s11":["beat","hull","btn","chain","grade","leak","tough","hpbar","tell","warn","counter","shield","secret","gaterun","blackout","rule:gold"],"s12":["beat","hull","btn","chain","grade","leak","tough","hpbar","tell","warn","counter","shield","secret","hail","rule:gold"],"endless":["beat","hull","btn","chain","grade","leak","tough","hpbar","tell","warn","zh_rule","rule:well"]},   // stage key ('s1'..'s12', 'endless') -> thing ids in the order they first appear (filled by nocaps-test.js MEASURE=1)
  in(){return!!RET.nocaps&&running&&!!G&&!G.dead&&!G.tut&&!G.lab&&!(window.TUT&&TUT.on)&&!(window.LS&&LS.m);},
  rec(k){this.sup[k]=(this.sup[k]||0)+1;},
  profile(){const o=load('mnr_nocaps',null)||{};o.off=o.off||{};o.vis=o.vis||{};return o;},
  thing(k){if(this.THING[k])return this.THING[k];const m=/^rule:(.+)$/.exec(k);if(m&&window.RU&&RU.T&&RU.T[m[1]]){const D=RU.T[m[1]];return[(D.n||m[1]).toLowerCase(),m[1]==='well'?'well':'dodge'];}return null;},
  /* the card to show before stage `key`, or null: first visit of the stage only, the first thing not yet offered */
  pick(key){const o=this.profile();if(o.vis[key])return null;o.vis[key]=1;let pick=null;
    for(const k of this.TAB[key]||[]){const t=this.thing(k);if(!t||o.off[t[1]+':'+t[0]]||o.off[k])continue;pick={k,name:t[0],drill:t[1]};o.off[k]=1;o.off[t[1]+':'+t[0]]=1;break;}
    save('mnr_nocaps',o);return pick;},
  hide(){if(this.card)this.card.hidden=true;},
  ask(pk,go){if(!this.card){const c=this.card=document.createElement('div');c.id='ncCard';c.setAttribute('role','dialog');c.setAttribute('aria-label','New in this stage');
    c.style.cssText='position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;background:#05030cd9;padding:16px';
    c.innerHTML='<div style="max-width:min(92vw,360px);background:#0d0720;border:2px solid #19e3ff;border-radius:14px;padding:18px 16px;text-align:center;color:#fff;font:700 17px/1.35 var(--display,sans-serif)">'
      +'<div id="ncT" style="margin-bottom:14px"></div><div style="display:flex;gap:10px;justify-content:center"><button type="button" class="go" id="ncPlay" style="min-height:48px;flex:1">PLAY DRILL</button>'
      +'<button type="button" class="go alt dim" id="ncSkip" style="min-height:48px;flex:1">SKIP</button></div></div>';document.body.appendChild(c);}
    const c=this.card;c.querySelector('#ncT').textContent='NEW: '+pk.name+'. Try the 30 s drill?';c.hidden=false;this.last={k:pk.k,drill:pk.drill,name:pk.name,done:false};
    const fin=()=>{if(this.last.done)return;this.last.done=true;c.hidden=true;go();};
    c.querySelector('#ncSkip').onclick=fin;
    c.querySelector('#ncPlay').onclick=()=>{if(this.last.done)return;c.hidden=true;this.last.played=true;const S=window.__school;if(S&&S.runThen){S.runThen(pk.drill,()=>{if(!this.last.done){this.last.done=true;go();}});}else fin();};}};
NR.on('runStart',()=>{NC.sup={};});
/* 1: nothing explains in a stage */
if(window.EXP){const sh=EXP.show;EXP.show=function(k){if(NC.in()){NC.rec(k);if(window.EX10&&EX10.later&&this.TXT[k])EX10.later(k);return false;}return sh.apply(this,arguments);};
  const dr=EXP.draw;EXP.draw=function(){if(NC.in()){this.cap=null;this.cbox=null;return;}return dr.apply(this,arguments);};}
if(window.ZH){const zs=ZH.start;ZH.start=function(k){if(NC.in()){NC.rec('zh_'+k);if(window.EX10&&EX10.later)EX10.later('zh_'+k);return;}return zs.apply(this,arguments);};
  const zd=ZH.draw;ZH.draw=function(){if(NC.in()){this.cap=null;return;}return zd.apply(this,arguments);};}
if(window.HINT){const hs=HINT.show;HINT.show=function(txt){if(NC.in()){NC.rec('hint');return false;}return hs.apply(this,arguments);};
  const hd=HINT.draw;HINT.draw=function(){if(NC.in()){this.box=null;return;}return hd.apply(this,arguments);};}
{const fl=floater;floater=function(x,y,txt){if(NC.in()&&txt==='KEEP MOVING'){NC.rec('still');return;}return fl.apply(this,arguments);};}
if(typeof banner==='function'&&window.CALM&&CALM.isRule){const bn=banner;banner=function(a,b,warn,t){if(NC.in()&&!warn&&CALM.isRule(a)){NC.rec('rulebanner');return;}return bn.apply(this,arguments);};}
NR.on('tick',()=>{const on=NC.in();document.documentElement.classList.toggle('nc',on);
  if(on){if(G.hint)G.hint.t=0;if(window.HINT){HINT.cur=null;HINT.q.length=0;}if(window.EXP){EXP.cap=null;EXP.q.length=0;}if(window.ZH)ZH.cap=null;}});
{const st=document.createElement('style');st.textContent='html.nc #bPwr .cp,html.nc #sgCard.live{display:none!important}';document.head.appendChild(st);}
/* 2: the pre-stage card (story stage n, endless, weekly: every way a stage starts goes through startStory or start) */
{const ss=startStory;startStory=function(n){if(running||!NC.on||!NC.auto||NC.card&&!NC.card.hidden)return ss.apply(this,arguments);const a=arguments,pk=NC.pick('s'+n);
  if(!pk)return ss.apply(this,a);NC.ask(pk,()=>{if(!running)ss.apply(this,a);});};
  const s0=start;start=function(){if(running||!NC.on||!NC.auto||NC.card&&!NC.card.hidden||(typeof ST!=='undefined'&&ST.on))return s0.apply(this,arguments);const a=arguments,pk=NC.pick('endless');
    if(!pk)return s0.apply(this,a);NC.ask(pk,()=>{if(!running)s0.apply(this,a);});};}
