// ---------- look: the same navy courtyard, terracotta kilns, sand courtyard and cream board as the 3D table ----------
(function(){const s=document.createElement('style');s.id='bf-css';s.textContent=`
html.bf .gx-app,html.bf #ph-z{display:none!important}
html.bf body{background:#13234d;overflow:hidden}
#bf{position:fixed;inset:0;z-index:30;display:flex;flex-direction:column;box-sizing:border-box;padding:var(--sat,0px) var(--sar,0px) var(--sab,0px) var(--sal,0px);
  background:radial-gradient(ellipse at 50% 30%,#2a4a94 0%,#1a2f68 45%,#101d44 100%);color:#fff6e0;font-family:var(--ff);-webkit-user-select:none;user-select:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent;overflow:hidden}
#bf[hidden]{display:none}
#bf.empty .bf-side{visibility:hidden}
#bf::before{content:'';position:absolute;inset:0;pointer-events:none;opacity:.22;background-image:radial-gradient(circle at 20% 30%,#ffe7a0 1px,transparent 1.6px),radial-gradient(circle at 70% 80%,#ffe7a0 1px,transparent 1.6px);background-size:46px 46px,58px 58px}
.bf-top{position:relative;height:44px;flex:none;display:flex;align-items:center;gap:4px;padding:0 2px;background:linear-gradient(#0c1838,#15275a);border-bottom:2px solid #c99a3e;box-shadow:0 2px 8px rgba(0,0,0,.4);z-index:2}
.bf-ib{width:44px;height:44px;flex:none;border:0;padding:0;background:none;color:#ffe3a0;display:grid;place-items:center;cursor:pointer;font:700 18px var(--ff)}
.bf-ib .ic{width:24px;height:24px}
.bf-chips{flex:1;display:flex;gap:4px;min-width:0}
.bf-chip{flex:1 1 0;min-width:0;height:36px;border-radius:18px;border:2px solid rgba(255,255,255,.12);background:rgba(255,255,255,.07);color:#fff6e0;display:flex;align-items:center;gap:4px;padding:0 8px;font:800 14px var(--ff);white-space:nowrap;overflow:hidden;cursor:pointer;transition:background .2s,border-color .2s,box-shadow .2s}
.bf-chip i{width:10px;height:10px;border-radius:50%;background:var(--pc);flex:none;box-shadow:0 0 0 2px rgba(255,255,255,.5)}
.bf-chip b{overflow:hidden;text-overflow:ellipsis;min-width:0}.bf-chip b:empty{display:none}
html.bf-land .bf-say{font-size:15px}
.bf-chip em{font-style:normal;color:#ffd24a}
.bf-chip .bf-sc{margin-left:auto;font-size:16px;color:#ffd66b;flex:none}.bf-pj{flex:none;margin-left:3px;font:900 13px var(--ff);padding:1px 4px;border-radius:8px;background:#2f8a4a;color:#fff}.bf-pj.dn{background:#c0392b}
.bf-chip.cur{border-color:var(--pc);background:rgba(255,255,255,.17);box-shadow:0 0 14px var(--pc)}
.bf-chip.hit{animation:bfHit .5s}
@keyframes bfHit{30%{transform:scale(1.12)}}
.bf-mid{position:relative;flex:1;min-height:0;display:flex;flex-direction:column}
.bf-table{position:relative;flex:1;min-height:0;margin:2px 6px 0}
.bf-side{flex:none;display:flex;flex-direction:column;align-items:center;padding:0 6px 6px;position:relative;z-index:1}
html.bf-land .bf-mid{flex-direction:row}
html.bf-land .bf-table{margin:4px 0 4px 6px}
html.bf-land .bf-side{justify-content:center;padding:4px 8px}
.bf-hint{height:44px;flex:none;display:flex;align-items:center;justify-content:center;gap:6px;width:100%;max-width:100%}
.bf-say{display:flex;align-items:center;gap:6px;min-width:0;flex:0 1 auto;overflow:hidden;font:800 17px var(--ff);color:#fff1c8;text-shadow:0 1px 2px #000;white-space:nowrap}
.bf-say>span{overflow:hidden;text-overflow:ellipsis}
.bf-tipl{color:#ffe08a;font-size:15px;white-space:normal;line-height:1.1;animation:bfTipIn .3s}
.bf-n{display:inline-flex;align-items:center;gap:2px;flex:none}.bf-n svg{width:24px;height:24px}.bf-n b{font-size:15px;color:#ffd66b}
.bf-bulb{width:44px;height:44px;border-radius:22px;background:rgba(255,214,107,.16);box-shadow:inset 0 0 0 2px rgba(255,214,107,.45)}
.bf-pz{height:34px;min-width:52px;border-radius:17px;border:2px solid #b9a8dc;background:rgba(255,255,255,.1);color:#fff;display:flex;align-items:center;gap:2px;padding:0 6px;font:800 15px var(--ff)}
.bf-pz svg{width:22px;height:22px}.bf-pz.on{background:rgba(185,168,220,.35)}
.bf-b{height:38px;padding:0 14px;border-radius:19px;border:0;background:#e0a948;color:#2a1a08;font:800 15px var(--ff)}
/* your board */
.bf-me{--g:2px;background:linear-gradient(#f6ead0,#ead9b4);border-radius:12px;padding:6px 6px 5px;box-shadow:0 6px 18px rgba(0,0,0,.5),inset 0 0 0 2px #b88a4c;color:#3a2410;transition:box-shadow .3s}
.bf-me.turn{box-shadow:0 6px 18px rgba(0,0,0,.5),inset 0 0 0 2px #b88a4c,0 0 0 3px var(--pc)}
.bf-me.shake{animation:bfShake .45s}
@keyframes bfShake{20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}
.bf-row{display:flex;align-items:center;margin-bottom:var(--g);border-radius:8px;cursor:pointer;transition:opacity .2s}
.bf-rack,.bf-wall,.bf-fl{display:flex;gap:var(--g);position:relative}
.bf-rack{border-radius:8px;padding:1px}
.bf-c{width:var(--cs);height:var(--cs);border-radius:6px;position:relative;flex:none;display:block}
.bf-rack .bf-c{background:#d6c29a;box-shadow:inset 0 0 0 2px #9a7a4e,inset 0 3px 4px rgba(0,0,0,.18)}
.bf-rack .bf-c.no{background:none;box-shadow:none}
.bf-ar{width:calc(var(--cs)*.4);height:calc(var(--cs)*.5);margin:0 3px;flex:none;background:#a07040;opacity:.55;clip-path:polygon(0 0,100% 50%,0 100%)}
.bf-wall .bf-c{background:#fffaf0;box-shadow:inset 0 0 0 1px #cdb995}
html.gray .bf-wall .bf-c{background:#bdb5a8}
.bf-c .pr{position:absolute;inset:10%;opacity:.55;display:block;filter:grayscale(.2)}
.bf-c .pr svg{width:100%;height:100%;display:block}
.bf-t{position:absolute;display:block;cursor:pointer}
.bf-c>.bf-t{inset:1px}
.bf-t svg{width:100%;height:100%;display:block;filter:drop-shadow(0 1.5px 1px rgba(0,0,0,.4))}
.bf-t.hid{visibility:hidden}
.bf-t.gh{opacity:.42;animation:bfGh 1.1s ease-in-out infinite}
@keyframes bfGh{50%{opacity:.22}}
.bf-row.ok .bf-rack{box-shadow:0 0 0 3px #ffc63a,0 0 14px 2px rgba(255,198,58,.8);animation:bfGlow 1.1s ease-in-out infinite}
@keyframes bfGlow{50%{box-shadow:0 0 0 3px #fff2b0,0 0 22px 6px rgba(255,214,90,.95)}}
.bf-row.dim{opacity:.5}
.bf-row.no{animation:bfShake .4s}
.bf-row.wq .bf-wall{box-shadow:0 0 0 3px #ffc63a;border-radius:6px}
.bf-bd{position:absolute;left:2px;top:50%;transform:translateY(-50%);z-index:2;min-width:22px;height:22px;border-radius:11px;padding:0 5px;font:900 13px/22px var(--ff);text-align:center;color:#fff;box-shadow:0 1px 3px rgba(0,0,0,.4)}
.bf-bd.rec{background:#e0a020;color:#fff;font-size:12px}.bf-bd.r2{left:44px}
.bf-bd.bad{background:#c0392b}.bf-bd.good{background:#2f8a4a}
.bf-c em{position:absolute;inset:0;display:grid;place-items:center;font:900 calc(var(--cs)*.42) var(--ff);font-style:normal;color:#1d5a2a;text-shadow:0 0 3px #fff,0 0 3px #fff;z-index:2}
.bf-c.clash{box-shadow:inset 0 0 0 3px #e0402a,0 0 10px #ff6a50;z-index:2}
.bf-row.dim.rclash .bf-rack .bf-c:not(.no){box-shadow:inset 0 0 0 2px #e0402a}
.bf-c.ready{animation:bfReady 1.2s ease-in-out infinite}@keyframes bfReady{50%{box-shadow:0 0 0 2px #ffe680,0 0 12px 3px #ffd24a}}
.bf-c.tgt{box-shadow:inset 0 0 0 2px #2f8a4a,0 0 8px #6fd38a}
.bf-c.pick{cursor:pointer;box-shadow:inset 0 0 0 3px #ffb400,0 0 12px #ffd24a;animation:bfGlow 1.1s infinite}
.bf-c.lit{animation:bfLit .55s ease-out both;animation-delay:var(--d,0ms);z-index:3}
@keyframes bfLit{0%{box-shadow:0 0 0 0 #fff}40%{transform:scale(1.18);box-shadow:0 0 0 3px #fff,0 0 18px 6px #ffd24a}100%{transform:scale(1.05);box-shadow:0 0 0 3px #ffe680,0 0 12px 3px #ffd24a}}
.bf-floor{display:flex;align-items:center;gap:6px;margin-top:4px;border-radius:8px;cursor:pointer}
.bf-floor .bf-fl{padding:1px;border-radius:8px}
.bf-floor .bf-c{background:#ecd3c7;box-shadow:inset 0 0 0 2px #a8493a}
.bf-floor .bf-c span{position:absolute;inset:0;display:grid;place-items:center;font:900 calc(var(--cs)*.42) var(--ff);color:#a8302a}
.bf-floor.ok .bf-fl{box-shadow:0 0 0 3px #ff7a4a,0 0 12px 2px rgba(255,110,70,.7)}
.bf-floor{position:relative}.bf-bd.fbd{left:auto;right:2px}.bf-bd.fbr{left:auto;right:34px}
.bf-fll{font:italic 700 13px var(--ff);color:#8a4a2a}
.bf-t.cr::after{content:'';position:absolute;inset:0;background:no-repeat center/100% url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M18 0 L44 38 L30 56 L58 100 M44 38 L82 26 L100 34 M30 56 L6 70' stroke='%23fff' stroke-width='6' fill='none' stroke-linejoin='round'/%3E%3Cpath d='M18 0 L44 38 L30 56 L58 100 M44 38 L82 26 L100 34 M30 56 L6 70' stroke='%23000' stroke-opacity='.5' stroke-width='2' fill='none'/%3E%3C/svg%3E")}
.bf-t.crash{animation:bfCrash .6s cubic-bezier(.3,.6,.4,1)}
@keyframes bfCrash{0%{transform:translateY(-40%) rotate(-8deg)}35%{transform:translateY(8%) rotate(10deg) scale(1.08)}55%{transform:translateX(-10%) rotate(-9deg)}75%{transform:translateX(6%) rotate(5deg)}100%{transform:none}}
.bf-t.gone{animation:bfGone .6s ease-in both;animation-delay:var(--d,0ms)}
@keyframes bfGone{30%{transform:scale(1.15) rotate(-6deg)}100%{transform:translateY(160%) rotate(40deg) scale(.5);opacity:0}}
/* the table */
.bf-k{position:absolute;border-radius:50%;background:radial-gradient(circle at 42% 36%,#e07a52,#b44a2c 55%,#8a3420);box-shadow:0 0 0 3px #e7b660,0 0 0 5px #7a4a20,0 5px 12px rgba(0,0,0,.55);cursor:pointer}
.bf-k::before{content:'';position:absolute;inset:9%;border-radius:50%;border:1.5px dashed rgba(255,230,180,.45)}
.bf-k.can{box-shadow:0 0 0 3px #ffd66b,0 0 0 5px #7a4a20,0 0 18px 4px rgba(255,214,107,.6)}
.bf-k.empty{opacity:.55}
.bf-pool{position:absolute;border-radius:46%;background:radial-gradient(ellipse at 50% 45%,#f6e6c4,#e0c08e 70%,#c99a62);box-shadow:inset 0 0 0 3px #a0703e,inset 0 0 18px rgba(120,70,20,.4),0 4px 12px rgba(0,0,0,.45);cursor:pointer}
.bf-pool::after{content:'';position:absolute;inset:12%;border-radius:50%;background:repeating-conic-gradient(rgba(160,100,40,.18) 0 8deg,transparent 8deg 22.5deg);pointer-events:none}
.bf-pool.can{box-shadow:inset 0 0 0 3px #ffd66b,0 0 18px 4px rgba(255,214,107,.55)}
.bf-table .bf-t{transition:transform .22s cubic-bezier(.3,1.6,.5,1),opacity .2s,filter .2s}
.bf-table .bf-t.up{transform:translateY(-16%) scale(1.2);z-index:4;filter:drop-shadow(0 0 6px #fff7b0) drop-shadow(0 6px 4px rgba(0,0,0,.5))}
.bf-table .bf-t.nud{transform:translate(var(--nx),var(--ny)) scale(.9);opacity:.6}
.bf-t.nofit>svg{opacity:.5;filter:grayscale(.6)}
.bf-t.nofit::after{content:'✗';position:absolute;right:-12%;top:-12%;width:46%;height:46%;border-radius:50%;background:#c0392b;color:#fff;font:900 11px/1 var(--ff);display:grid;place-items:center;box-shadow:0 0 0 1.5px #fff}
.bf-t.adv{outline:3px solid #ffd24a;outline-offset:1px;border-radius:4px;animation:bfReady 1.2s ease-in-out infinite}
.bf-t.adv::before{content:none;position:absolute;left:-10%;top:-14%;z-index:2;font:900 13px/1 var(--ff);color:#ffd24a;text-shadow:0 0 3px #000,0 0 2px #000}
.bf-t.sun{border-radius:50%;box-shadow:0 0 0 2px #fff6c0,0 0 10px #ffd24a}
.bf-t.deal{animation:bfDeal .5s cubic-bezier(.3,1.5,.5,1) both}
@keyframes bfDeal{0%{transform:translateY(-70%) scale(1.5);opacity:0}100%{transform:none;opacity:1}}
.bf-flyl{position:fixed;inset:0;pointer-events:none;z-index:60}
.bf-fly{position:fixed!important;z-index:61;will-change:transform}
.bf-pop{position:fixed;z-index:62;pointer-events:none;font:900 24px var(--ff);color:#ffe36b;text-shadow:0 2px 0 #7a3d14,0 0 10px rgba(0,0,0,.9);white-space:nowrap;transform:translate(-50%,-50%)}
.bf-pop.big{font-size:34px}.bf-pop.cnt{font-size:16px}.bf-pop.chip{font-size:18px}.bf-pop.bad{color:#ff8a7a;text-shadow:0 2px 0 #5a0e08,0 0 10px rgba(0,0,0,.9)}.bf-pop.good{color:#b8ffb0;text-shadow:0 2px 0 #14501f,0 0 10px rgba(0,0,0,.9)}
.bf-rvw{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:15;width:min(62%,220px);padding:8px;border-radius:14px;background:linear-gradient(#fcf6e8,#f1e3c4);color:#3a2410;box-shadow:0 0 0 2px #c99a3e,0 12px 30px rgba(0,0,0,.55)}
.bf-rvw svg{width:100%;height:auto;display:block}.bf-rvw .bf-ph{font-size:15px;margin-bottom:4px}
.bf-ban{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);z-index:20;text-align:center;pointer-events:none}
.bf-ban b{display:inline-block;padding:6px 22px;border-radius:14px;background:rgba(10,20,50,.78);font:700 34px var(--ff-h);color:#ffe3a0;box-shadow:0 0 0 2px #c99a3e,0 8px 24px rgba(0,0,0,.5)}
.bf-ban small{display:block;margin-top:6px;font:800 16px var(--ff);color:#fff;text-shadow:0 1px 3px #000}
.bf-tip{position:fixed;left:50%;top:var(--tipy,60%);transform:translate(-50%,-100%);z-index:25;max-width:min(230px,60vw);padding:6px 12px;border-radius:14px;background:#fff4d6;color:#3a2410;font:800 14px/1.25 var(--ff);text-align:center;box-shadow:0 0 0 2px #c99a3e,0 8px 20px rgba(0,0,0,.45);pointer-events:none;animation:bfTipIn .35s ease-out}
@keyframes bfTipIn{from{transform:translateY(8px);opacity:0}}
.bf-fing{position:fixed;z-index:63;pointer-events:none;transform-origin:37% 7%;animation:bfTap 1.15s ease-in-out infinite;filter:drop-shadow(0 4px 6px rgba(0,0,0,.6));transition:left .45s ease,top .45s ease}
.bf-fing svg{width:100%;height:100%;display:block}
@keyframes bfTap{0%,100%{transform:translate(10px,14px) scale(1)}45%{transform:translate(0,0) scale(.92)}55%{transform:translate(0,0) scale(.92)}}
/* pop-ups */
.bf-ov{position:absolute;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(8,14,36,.55)}
.bf-ov[hidden]{display:none}
.bf-card{background:linear-gradient(#fcf6e8,#f1e3c4);color:#3a2410;border-radius:16px;box-shadow:0 0 0 2px #c99a3e,0 20px 50px rgba(0,0,0,.6);padding:12px;max-width:min(420px,100%);max-height:100%;overflow:auto;box-sizing:border-box}
.bf-menu{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%}
.bf-mi{min-height:48px;border:0;border-radius:12px;background:#fff;box-shadow:inset 0 0 0 1.5px #d3bc92;color:#3a2410;display:flex;align-items:center;gap:8px;padding:0 10px;font:800 15px var(--ff);text-align:left}
.bf-mi .ic{width:22px;height:22px;flex:none}
.bf-peek{width:100%}.bf-peek svg{width:100%;height:auto;display:block}
.bf-ph{display:flex;align-items:center;gap:8px;font:800 18px var(--ff);margin-bottom:6px}.bf-ph i{width:12px;height:12px;border-radius:50%;background:var(--pc)}.bf-ph span{margin-left:auto;color:#a0701a}.bf-ph .bf-ib{color:#3a2410;width:40px;height:40px}
.bf-pn{font:700 14px var(--ff);color:#2f7d46;text-align:center;margin-top:4px}
.bf-res{width:100%}
.bf-rt{display:flex;align-items:center;justify-content:center;gap:8px;font:700 30px var(--ff-h);color:#1d4aa3;margin:2px 0 10px}.bf-rt .ic{width:30px;height:30px}
.bf-rr,.bf-rk{display:grid;grid-template-columns:12px 1fr 46px 50px 46px 62px;align-items:center;gap:4px;font:800 16px var(--ff);padding:6px 4px;border-bottom:1px solid #e0cba0}
.bf-rr i{width:12px;height:12px;border-radius:50%;background:var(--pc)}.bf-rr .g{color:#2f7d46;text-align:right}.bf-rr .r{color:#b0302a;text-align:right}.bf-rr .t{text-align:right;color:#a0701a;font-size:19px}
.bf-rk{border:0;font:700 12px var(--ff);color:#8a6a3a;padding:0 4px}.bf-rk span:nth-child(1){grid-column:3;text-align:right}.bf-rk span{text-align:right}
.bf-btns{display:flex;gap:8px;margin-top:12px}
.bf-go{flex:1;min-height:48px;border:0;border-radius:14px;background:linear-gradient(#d9673e,#b04424);color:#fff;font:800 17px var(--ff);box-shadow:0 3px 0 #7a2a12}
.bf-go.ghost{background:#fff;color:#3a2410;box-shadow:inset 0 0 0 2px #c99a3e}
.bf-more{margin:10px 0}.bf-more summary{font-weight:800;cursor:pointer;padding:8px 0}
.bf-story .q{font-size:1.35rem;text-align:center}
`;document.head.appendChild(s)})();
// ===================== part 9: board-first phone table (play on the board, not in menus) =====================
// On phones the whole screen is the table: kilns around the courtyard on top, your racks + mosaic + breakage at the bottom.
// Tap a colour on a kiln: every tile of it lifts and the racks that can take it glow. Tap a rack: the tiles fly in, the rest
// of the kiln slides to the courtyard, overflow crashes onto the breakage line. The engine runs unchanged; this layer keeps a
// mirror of it (BF.disp) and plays each engine event (take, tiling, breakage, refill, end bonus) as an animation, one at a time.
// ?bf=0 turns it off (the older phone panel comes back).
const BF={on:false,root:null,disp:null,gk:'',q:[],busy:false,fast:false,hide:new Set(),menu:false,peek:null,resHide:false,say:'',actor:-1,
  tw:360,th:300,cs:32,seen:{},fingerOn:false,adv:null,advK:'',idleT:null,lastWarn:0,anims:[],errs:[],tipT:null};
function bfWanted(){try{const q=new URLSearchParams(location.search);if(q.has('bf'))return q.get('bf')!=='0'}catch(e){}return true}
const bfUse=c=>`<svg viewBox="0 0 100 100" aria-hidden="true"><use href="#${c===SUN?'gzsun':'gz'+c}"/></svg>`;
const bfQ=s=>BF.root&&BF.root.querySelector(s);
const bfEl=k=>bfQ(`[data-k="${k}"]`);
const bfSlot=k=>bfQ(`[data-s="${k}"]`)||bfEl(k);
function bfR(el){if(!el)return null;const r=el.getBoundingClientRect();return r.width>0?{left:r.left,top:r.top,width:r.width,height:r.height}:null}
function bfTile(c,key,cls){return `<i class="bf-t${cls?' '+cls:''}${key&&BF.hide.has(key)?' hid':''}"${key?` data-k="${key}"`:''}>${bfUse(c)}</i>`}
function bfClone(g){return JSON.parse(JSON.stringify({fac:g.fac,ctr:g.ctr,markerIn:g.markerIn,round:g.round,phase:g.phase,first:g.first,np:g.np,ex:g.ex,lid:[],
  pl:g.pl.map(p=>({i:p.i,nm:p.nm,score:p.score,lines:p.lines,wall:p.wall,floor:p.floor}))}))}
const bfFocus=()=>{try{return focusSeat()}catch(e){return 0}};
// ---------- timing: tap anywhere during an animation to speed it up ----------
function bfAnimOK(){return !!ANIM&&typeof Element!=='undefined'&&!!Element.prototype.animate&&!/jsdom/i.test(navigator.userAgent)}
function bfD(ms){return ms*(BF.fast?.22:1)/(UI.speed>=3?1.7:UI.speed<1?.75:1)}
function bfWait(ms){return bfAnimOK()&&ms>0?new Promise(r=>setTimeout(r,bfD(ms))):Promise.resolve()}
function bfTrack(a){BF.anims.push(a);if(BF.fast)a.playbackRate=4;const done=()=>{const i=BF.anims.indexOf(a);if(i>=0)BF.anims.splice(i,1)};a.finished.then(done,done);return a}
function bfSpeedUp(){if(BF.fast)return;BF.fast=true;for(const a of BF.anims)try{a.playbackRate=4}catch(e){}}
// a copy of a tile flies from one screen rect to another (a little arc, a little bigger mid-air)
function bfFly(c,from,to,o){o=o||{};if(!bfAnimOK()||!from||!to)return Promise.resolve();const d=document.createElement('i');d.className='bf-t bf-fly';d.innerHTML=bfUse(c);
  Object.assign(d.style,{left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px'});BF.fl.appendChild(d);
  const dx=to.left+to.width/2-(from.left+from.width/2),dy=to.top+to.height/2-(from.top+from.height/2),s=to.width/from.width,lift=o.lift==null?42:o.lift;
  const a=bfTrack(d.animate([{transform:'translate(0,0) scale(1)'},{transform:`translate(${dx*.5}px,${dy*.5-lift}px) scale(${Math.max(1.12,(1+s)/2*1.18)}) rotate(${o.rot||0}deg)`,offset:.5},{transform:`translate(${dx}px,${dy}px) scale(${s}) rotate(0deg)`}],
    {duration:bfD(o.dur||540),delay:bfD(o.delay||0),easing:'cubic-bezier(.35,.05,.25,1)',fill:'forwards'}));
  return a.finished.then(()=>d.remove(),()=>d.remove())}
// a tile drops off the board (to the shard box)
function bfDrop(c,from,o){o=o||{};if(!bfAnimOK()||!from)return Promise.resolve();const d=document.createElement('i');d.className='bf-t bf-fly';d.innerHTML=bfUse(c);
  Object.assign(d.style,{left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px'});BF.fl.appendChild(d);const rot=(Math.random()-.5)*70;
  const a=bfTrack(d.animate([{transform:'none',opacity:1},{transform:`translate(${(Math.random()-.5)*30}px,${from.height*2.2}px) rotate(${rot}deg) scale(.6)`,opacity:0}],{duration:bfD(o.dur||520),delay:bfD(o.delay||0),easing:'cubic-bezier(.5,0,.9,.5)',fill:'forwards'}));
  return a.finished.then(()=>d.remove(),()=>d.remove())}
function bfFlip(el,old){if(!bfAnimOK()||!el||!old)return;const r=bfR(el);if(!r)return;const dx=old.left-r.left,dy=old.top-r.top,s=old.width/r.width;if(Math.abs(dx)<1&&Math.abs(dy)<1&&Math.abs(s-1)<.02)return;
  bfTrack(el.animate([{transform:`translate(${dx}px,${dy}px) scale(${s})`,transformOrigin:'0 0'},{transform:'none',transformOrigin:'0 0'}],{duration:bfD(380),easing:'ease-out'}))}
function bfShow(k){const el=bfEl(k);if(el)el.classList.remove('hid');BF.hide.delete(k)}
// floating numbers where points are earned or lost
function bfPop(txt,at,cls,big){if(!at||!BF.fl)return;const d=document.createElement('div');d.className='bf-pop '+(cls||'');if(big)d.classList.add('big');d.textContent=txt;
  d.style.left=(at.left+at.width/2)+'px';d.style.top=(at.top+at.height/2)+'px';BF.fl.appendChild(d);
  if(!bfAnimOK()){setTimeout(()=>d.remove(),10);return}
  bfTrack(d.animate([{transform:'translate(-50%,-50%) scale(.4)',opacity:0},{transform:'translate(-50%,-80%) scale(1.25)',opacity:1,offset:.25},{transform:'translate(-50%,-160%) scale(1)',opacity:0}],{duration:bfD(big?1500:1150),easing:'ease-out',fill:'forwards'})).finished.then(()=>d.remove(),()=>d.remove())}
function bfChipR(i){return bfR(bfQ(`[data-bfchip="${i}"]`))}
function bfChipPop(i,txt,cls){const el=bfQ(`[data-bfchip="${i}"]`);if(!el)return;const r=bfR(el);if(r)r.top+=r.height*.9;bfPop(txt,r,(cls||'')+' chip');el.classList.remove('hit');void el.offsetWidth;el.classList.add('hit')}
function bfScore(i,v){const el=bfQ(`[data-bfsc="${i}"]`);if(el)el.textContent='★'+v}
function bfBanner(t,sub){const tb=BF.tbl;if(!tb)return;const d=document.createElement('div');d.className='bf-ban';d.innerHTML=`<b>${esc(t)}</b>${sub?`<small>${esc(sub)}</small>`:''}`;tb.appendChild(d);
  if(!bfAnimOK()){d.remove();return}
  bfTrack(d.animate([{opacity:0,transform:'translateY(-50%) scale(.7)'},{opacity:1,transform:'translateY(-50%) scale(1.05)',offset:.18},{opacity:1,transform:'translateY(-50%) scale(1)',offset:.8},{opacity:0,transform:'translateY(-50%) scale(1)'}],{duration:bfD(1500),fill:'forwards'})).finished.then(()=>d.remove(),()=>d.remove())}
// one idea at a time, in two short lines at most, above the action (guided game only, each once)
const BF_TIPS={nofit:'Red ✗ colours fit no row.',slide:'Leftovers slid to the middle.',tiling:'Full rows slide onto the wall!',chain:'Touching tiles score more!',
  floor:'Extra tiles break: minus points.',sun:'☀ costs 1, but you start next.',bonus:'Full column +7 at the end!',
  end:'A full wall row ends the game.',keep:'Unfinished rows wait for next round.'};
function bfTip(k,force){if((!UI.coach&&!force)||BF.seen['tip_'+k])return;BF.seen['tip_'+k]=1;BF.tip=BF_TIPS[k];bfHintSet();
  clearTimeout(BF.tipT);BF.tipT=setTimeout(()=>{BF.tip=null;bfHintSet()},4200)}
function bfHintSet(){if(!BF.hint||!BF.disp||!G)return;BF.hint.innerHTML=bfHintHTML(BF.disp,BF.busy?null:me())}
// ---------- the engine's events go into a queue; each is played on the board in turn ----------
function bfSync(){if(!G)return false;const gk=G.seed+':'+(G.gid||'');if(gk!==BF.gk){BF.gk=gk;BF.q.length=0;BF.disp=bfClone(G);BF.seen={};BF.resHide=false;BF.menu=false;BF.peek=null;BF.lastWarn=0;BF.adv=null;BF.advK='';BF.fingerOn=false;BF.deal=true;return true}return false}
function bfFx(f){if(!G)return;bfSync();const x=f.x;let e=null;
  if(f.t==='take')e={t:'take',x:Object.assign({},x)};else if(f.t==='wallphase')e={t:'wallphase'};else if(f.t==='wall')e={t:'wall',x:Object.assign({},x)};
  else if(f.t==='round')e={t:'round',fac:JSON.parse(JSON.stringify(G.fac)),round:G.round,first:G.first};else if(f.t==='win')e={t:'win'};
  if(e)BF.q.push(e)}
const bfHold=()=>BF.on&&(BF.busy||BF.q.length>0);
async function bfRun(){if(BF.busy)return;BF.busy=true;const gk=BF.gk;clearTimeout(BF.idleT);BF.fingerOn=false;bfFinger(null);
  try{while(BF.q.length&&BF.gk===gk){const e=BF.q.shift();try{await bfStep(e)}catch(err){BF.errs.push(String(err&&err.message||err));BF.q.length=0;break}}}
  finally{BF.busy=false;BF.rv=null;BF.fast=false;BF.say='';BF.actor=-1;BF.hide.clear();if(BF.fl)BF.fl.innerHTML='';BF.anims.length=0;if(G&&BF.gk===gk)BF.disp=bfClone(G);bfDraw();try{schedule()}catch(e){}}}
async function bfStep(e){const S=BF.disp;
  if(e.t==='take')return bfTake(e.x);
  if(e.t==='wallphase'){BF.r0=S.pl.map(p=>p.score);S.phase='wall';BF.say='Round over: tiling!';bfDraw();bfBanner('Round over','Full rows tile the wall');sfx('turn');bfTip('tiling');await bfWait(1350);return}
  if(e.t==='wall')return bfWall(e.x);
  if(e.t==='round'){if(S.phase==='wall'||S.pl.some(p=>p.floor.length))await bfFloors();
    S.fac=e.fac;S.ctr=[];S.round=e.round;S.phase='offer';S.markerIn='ctr';S.first=e.first;BF.say='';const first=BF.deal&&e.round===1;BF.deal=false;
    bfDraw({deal:true});bfBanner('Round '+e.round,first?'Most ★ wins':'');sfx('round');if(e.round===2){const fp=S.pl[bfFocus()];setTimeout(()=>bfTip(fp&&fp.lines.some(l=>l.length)?'keep':'bonus'),bfD(1600))}if(e.round===3)setTimeout(()=>bfTip('bonus'),bfD(1600));
    await bfWait(Math.min(1500,500+S.fac.length*4*45));return}
  if(e.t==='win'){await bfFloors();await bfBonus();sfx('win');return}}
async function bfTake(x){const S=BF.disp;const a=x.src<0?S.ctr:S.fac[x.src];if(!a)throw Error('take: no source');
  const m={src:x.src,c:x.c,j:(x.nj||x.c===PRISM)?1:0,line:x.line};const pre=x.src<0?'c':'f'+x.src;const picked=[],rest=[];
  a.forEach((t,k)=>((t===m.c||(t===PRISM&&m.j))?picked:rest).push({t,k,key:pre+'_'+k}));if(picked.length!==x.n)throw Error('take: out of step');
  const focus=x.p===bfFocus(),pl=P(x.p);BF.actor=x.p;
  if(!focus||!pl||!pl.human||NET.on){BF.say=`${S.pl[x.p].nm} takes ${x.n} ${x.c===PRISM?'Prism':TNAME[x.c]}`;bfDraw()}
  // 1. the tiles lift (the player's own selection is already up)
  let lifted=false;for(const o of picked){const el=bfEl(o.key);if(el&&!el.classList.contains('up')){el.classList.add('up');lifted=true}}
  for(const o of rest){const el=bfEl(o.key);if(el&&x.src>=0)el.classList.add('nud')}
  if(lifted){sfx('select');await bfWait(focus?620:900)}
  picked.forEach(o=>o.r=bfR(bfEl(o.key)));rest.forEach(o=>o.r=bfR(bfEl(o.key)));const ctrOld=S.ctr.map((t,k)=>bfR(bfEl('c_'+k)));const sunR=bfR(bfEl('sun'));
  // 2. the engine's take on the mirror; work out where each tile lands (glazes before prisms, rack first, then breakage)
  const p=S.pl[x.p];const f0=p.floor.length,L0=x.line<5?p.lines[x.line].length:0,c0=S.ctr.length;const hadSun=x.src<0&&S.markerIn==='ctr';
  applyTake(S,x.p,m);
  const got=picked.slice().sort((u,v)=>u.t-v.t);let li=L0,fi=hadSun?Math.min(7,f0+1):f0;const sunKey=hadSun?`x${x.p}_${Math.min(6,f0)}`:null;
  for(const o of got){if(x.line<5&&li<cap(x.line))o.to=`l${x.p}_${x.line}_${li++}`;else if(fi<7){o.to=`x${x.p}_${fi++}`;o.brk=1}else{o.to=null;o.brk=1}}
  const restTo=x.src>=0?rest.map((o,i)=>'c_'+(c0+i)):[];
  BF.hide=new Set([...got.map(o=>o.to).filter(Boolean),...restTo,...(sunKey?[sunKey]:[])]);bfDraw();
  // the courtyard re-packs: old tiles glide to their new places
  if(x.src<0)rest.forEach((o,i)=>bfFlip(bfEl('c_'+i),o.r));else ctrOld.forEach((r,k)=>bfFlip(bfEl('c_'+k),r));
  // 3. fly: chosen tiles to the rack (or to a rival's chip), the rest slides to the middle
  const chip=bfChipR(x.p);const fl=[];sfx('take');
  got.forEach((o,i)=>fl.push(bfFly(o.t,o.r,focus&&o.to?bfR(bfSlot(o.to)):chip,{delay:i*(focus?70:140),dur:focus?600:760,rot:o.brk?18:0}).then(()=>{if(o.to)bfShow(o.to)})));
  rest.forEach((o,i)=>{if(!restTo[i])return;fl.push(bfFly(o.t,o.r,bfR(bfSlot(restTo[i])),{delay:200+i*60,dur:520,lift:12}).then(()=>{bfShow(restTo[i]);const el=bfEl(restTo[i]);if(el&&bfAnimOK())el.animate([{transform:'scale(1.25)'},{transform:'scale(.92)'},{transform:'scale(1)'}],{duration:bfD(260)});sfx('place')}))});
  if(hadSun)fl.push(bfFly(SUN,sunR,focus?bfR(bfSlot(sunKey)):chip,{dur:600,lift:60}).then(()=>bfShow(sunKey)));
  await Promise.all(fl);BF.hide.clear();sfx('place');
  if(x.src>=0&&rest.length&&focus&&pl&&pl.human)bfTip('slide');
  if(focus&&x.line<5&&p.lines[x.line].length===cap(x.line)){const rr=bfR(bfQ(`[data-bfrow="${x.line}"] .bf-rack`));bfPop(x.line===4?'Big row full!':'Row full!',rr,'good');sfx('wall',4)}
  // 4. overflow crashes onto the breakage line
  const brk=got.filter(o=>o.brk);const pen=floorPenalty(p.floor.length)-floorPenalty(f0);
  if(brk.length||hadSun){if(focus){for(const o of brk){const el=o.to&&bfEl(o.to);if(el){el.classList.remove('crash');void el.offsetWidth;el.classList.add('crash')}}
      const fr=bfR(bfQ('.bf-fl'));if(pen)bfPop(String(pen).replace('-','−'),fr,'bad',true);const me=bfQ('.bf-me');if(me&&brk.length){me.classList.remove('shake');void me.offsetWidth;me.classList.add('shake')}}
    else if(pen)bfChipPop(x.p,String(pen).replace('-','−'),'bad');
    if(brk.length)sfx('floor');if(hadSun){sfx('sun');if(focus&&pl&&pl.human)bfTip('sun')}if(brk.length&&focus&&pl&&pl.human)bfTip('floor');await bfWait(brk.length?820:420)}
  else if(!focus){bfChipPop(x.p,x.line<5?'row '+(x.line+1):'',x.line<5?'':'bad');await bfWait(260)}
  if(focus&&pl&&pl.human)BF.seen.took=1}
// end of round: each full rack sends one tile to the wall; the lines it joins light up and the points pop
function bfRun1(w,r,c){const o=[[r,c]];for(let x=c-1;x>=0&&w[r][x]>=0;x--)o.push([r,x]);for(let x=c+1;x<5&&w[r][x]>=0;x++)o.push([r,x]);
  for(let y=r-1;y>=0&&w[y][c]>=0;y--)o.push([y,c]);for(let y=r+1;y<5&&w[y][c]>=0;y++)o.push([y,c]);return o}
async function bfWall(x){const S=BF.disp,p=S.pl[x.p];const L=p.lines[x.r];if(!L||L.length!==cap(x.r))throw Error('wall: rack not full');
  const focus=x.p===bfFocus();const lc=lineColour(L);const k=L.indexOf(PRISM);const v=k>=0?(lc>=0?10+lc:S.ex.gray?15:10+WALLC(x.r,x.c)):lc;const mc=v<5?v:PRISM;
  const from=[];for(let i=0;i<L.length;i++)from.push({t:L[i],r:bfR(bfEl(`l${x.p}_${x.r}_${i}`))});
  p.wall[x.r][x.c]=v;p.lines[x.r]=[];const wk=`w${x.p}_${x.r}_${x.c}`;BF.say=focus?`Row ${x.r+1}: +${x.pts}`:`${p.nm} tiles row ${x.r+1}`;
  if(!focus){bfDraw();BF.rv=BF.rv&&BF.rv.p===x.p?BF.rv:{p:x.p,marks:[]};BF.rv.marks.push({r:x.r,c:x.c,pts:x.pts});bfRival();bfChipPop(x.p,'+'+x.pts,'good');p.score+=x.pts;bfScore(x.p,p.score);sfx('wall',Math.min(3,x.pts));await bfWait(650);return}
  BF.rv=null;BF.hide=new Set([wk]);bfDraw();
  const mover=from[0],others=from.slice(1);
  const fl=[bfFly(mc,mover.r,bfR(bfSlot(wk)),{dur:620,lift:28})];others.forEach((o,i)=>fl.push(bfDrop(o.t,o.r,{delay:240+i*60})));
  await fl[0];bfShow(wk);await Promise.all(fl);
  const run=bfRun1(p.wall,x.r,x.c);const step=run.length>1?260:0;
  for(let i=0;i<run.length;i++){const [r,c]=run[i];const el=bfSlot(`w${x.p}_${r}_${c}`);if(el){el.style.setProperty('--d','0ms');el.classList.add('lit')}
    const v=Math.max(1,Math.round((i+1)*x.pts/run.length));if(run.length>1&&i<run.length-1)bfPop('+'+v,bfR(el),'good cnt');sfx('wall',Math.min(8,i+1));if(i<run.length-1)await bfWait(step)}
  bfPop('+'+x.pts,bfR(bfSlot(wk)),'good',true);if(x.pts>1)bfTip('chain');if(x.pts>=3){bfBanner(x.pts>=6?'Great chain! +'+x.pts:'Chain +'+x.pts,'');const me=bfQ('.bf-me');if(me){me.classList.remove('shake');void me.offsetWidth;me.classList.add('shake')}}
  await bfWait(700);p.score+=x.pts;bfScore(x.p,p.score);bfChipPop(x.p,'+'+x.pts,'good');await bfWait(520);
  for(const [r,c] of run){const el=bfSlot(`w${x.p}_${r}_${c}`);if(el)el.classList.remove('lit')}}
function bfRival(){const tb=BF.tbl;if(!tb||!BF.rv)return;let el=tb.querySelector('.bf-rvw');if(!el){el=document.createElement('div');el.className='bf-rvw';tb.appendChild(el)}const p=BF.disp.pl[BF.rv.p];
  el.innerHTML=`<div class="bf-ph" style="--pc:${PCOL[p.i]}"><i></i><b>${esc(p.nm)}</b><span>★${p.score}</span></div>${phWallSVG(p,{marks:BF.rv.marks})}`}
async function bfFloors(){BF.rv=null;const S=BF.disp;BF.say='Broken tiles cost points';
  const ls=S.pl.filter(p=>p.floor.length).map(p=>({p,l:Math.min(p.score,-floorPenalty(p.floor.length))})).filter(o=>o.l);

  for(const p of S.pl){if(!p.floor.length)continue;const pen=floorPenalty(p.floor.length);const loss=Math.min(p.score,-pen);const focus=p.i===bfFocus();
    if(focus){bfDraw();const fr=bfR(bfQ('.bf-fl'));p.floor.forEach((t,k)=>{const el=bfEl(`x${p.i}_${k}`);if(el){el.style.setProperty('--d',bfD(k*70)+'ms');el.classList.add('gone')}});
      if(loss)bfPop('−'+loss,fr,'bad',true);sfx('floor');await bfWait(1500)}
    else if(loss){bfChipPop(p.i,'−'+loss+' broken','bad');sfx('floor');await bfWait(800)}
    p.score-=loss;bfScore(p.i,p.score);if(p.floor.includes(SUN))S.first=p.i;p.floor=[]}
  S.markerIn='ctr';bfDraw();
  if(BF.r0){const d=S.pl.map((p,i)=>p.score-(BF.r0[i]||0));BF.r0=null;const f=n=>(n>=0?'+':'−')+Math.abs(n);bfBanner('Round score',S.pl.map((p,i)=>(isYou(p.i)?'You ':S.pl.length>2?'':p.nm+' ')+f(d[i])).join('  ·  '));await bfWait(1300)}
  await bfWait(200)}
async function bfBonus(){const S=BF.disp;BF.say='End bonuses';
  for(const p of S.pl){const b=endBonus(p);const add=b.rows*BONUS.row+b.cols*BONUS.col+b.colours*BONUS.colour;if(!add)continue;const focus=p.i===bfFocus();
    if(!focus){bfChipPop(p.i,'+'+add,'good');p.score+=add;bfScore(p.i,p.score);await bfWait(500);continue}
    bfDraw();const lite=(cells,txt)=>{cells.forEach(([r,c],i)=>{const el=bfSlot(`w${p.i}_${r}_${c}`);if(el){el.style.setProperty('--d',bfD(i*70)+'ms');el.classList.add('lit')}});
      const last=cells[cells.length-1];bfPop(txt,bfR(bfSlot(`w${p.i}_${last[0]}_${last[1]}`)),'good',true);sfx('wall',6)};
    const clear=()=>{for(const el of BF.root.querySelectorAll('.bf-c.lit'))el.classList.remove('lit')};
    for(let r=0;r<5;r++)if(p.wall[r].every(v=>v>=0)){lite([0,1,2,3,4].map(c=>[r,c]),'+'+BONUS.row);await bfWait(900);clear()}
    for(let c=0;c<5;c++)if(p.wall.every(row=>row[c]>=0)){lite([0,1,2,3,4].map(r=>[r,c]),'+'+BONUS.col);await bfWait(900);clear()}
    for(let k=0;k<NC;k++){const cells=[];for(let r=0;r<5;r++)for(let c=0;c<5;c++)if(p.wall[r][c]===k)cells.push([r,c]);if(cells.length===5){lite(cells,'+'+BONUS.colour);await bfWait(900);clear()}}
    p.score+=add;bfScore(p.i,p.score);bfChipPop(p.i,'+'+add,'good');await bfWait(300)}}
// ---------- drawing ----------
function bfEnsure(){if(BF.root)return BF.root;const r=document.createElement('div');r.id='bf';r.setAttribute('aria-label','The table');
  r.innerHTML=`<div class="bf-top"></div><div class="bf-mid"><div class="bf-table"></div><div class="bf-side"><div class="bf-hint" role="status" aria-live="polite"></div><div class="bf-me"></div></div></div><div class="bf-tip" hidden></div><div class="bf-ov" hidden></div><div class="bf-flyl" aria-hidden="true"></div><div class="bf-fing" hidden aria-hidden="true"><svg viewBox="0 0 48 56"><path d="M18 4c2.8 0 5 2.2 5 5v15l2-.4V18c0-2.6 2-4.6 4.6-4.6S34 15.4 34 18v6.6l1.4-.2c2.4 0 4.4 2 4.4 4.4V40c0 8-6 14-14 14h-4c-5 0-8-2.6-10.4-6.2L4.8 38c-1.6-2.4-1-5.4 1.2-7 2.2-1.6 5.2-1 6.8 1.2l.2.4V9c0-2.8 2.2-5 5-5z" fill="#fff" stroke="#3a2a1a" stroke-width="2.4"/></svg></div>`;
  document.body.appendChild(r);BF.root=r;BF.top=r.querySelector('.bf-top');BF.tbl=r.querySelector('.bf-table');BF.hint=r.querySelector('.bf-hint');BF.me=r.querySelector('.bf-me');BF.ov=r.querySelector('.bf-ov');BF.fl=r.querySelector('.bf-flyl');
  r.addEventListener('click',bfClick);r.addEventListener('pointerdown',()=>{if(BF.busy)bfSpeedUp()});return r}
function bfSizes(){const I=phInsets();const W=innerWidth-I.l-I.r,H=innerHeight-I.t-I.b;const land=W>H*1.1;document.documentElement.classList.toggle('bf-land',land);
  let cs=land?Math.min((H-44-44-24)/6.5,(W*.52-60)/10.45,46):Math.min((W-52)/10.45,(H-44-44)*.43/6.5,48);cs=Math.max(18,Math.floor(cs));BF.cs=cs;BF.root.style.setProperty('--cs',cs+'px');
  const tb=BF.tbl;BF.tw=tb.clientWidth||(land?W*.5:W);BF.th=tb.clientHeight||(land?H-44:H-44-38-6.5*cs-40)}
function bfRing(W,H,n){const cx=W/2,cy=H/2;let ks=Math.min(W,H)*(n<=5?.32:n<=7?.26:.22);ks=Math.max(44,Math.min(ks,W*(n<=5?.3:n<=7?.25:.21),H*(n<=5?.34:.28),130));
  const ax=Math.max(10,W/2-ks/2-6),ay=Math.max(10,H/2-ks/2-6);const K=[];for(let i=0;i<n;i++){const a=-Math.PI/2+i*2*Math.PI/n;K.push({x:cx+Math.cos(a)*ax,y:cy+Math.sin(a)*ay})}
  return {ks,K,cx,cy,pw:Math.max(70,2*(ax-ks*.6)),ph:Math.max(54,2*(ay-ks*.6))}}
function bfTableHTML(S,hp,o){const R=bfRing(BF.tw,BF.th,S.fac.length);const ts=R.ks*.33;const live=!BF.busy;const sel=live&&hp&&G.phase==='offer'?UI.sel:null;const can=live&&hp&&G.phase==='offer'&&!sel;
  const am=can&&UI.coach&&BF.seen.took?bfAdvice(hp):null;const isAdv=(src,t)=>am&&am.act==='take'&&am.src===src&&(t===am.c);
  const nofit=new Set();if(can)for(let c=0;c<NC;c++){let ok=false;for(let r=0;r<5;r++)if(lineOk(G,hp,r,c))ok=true;if(!ok)nofit.add(c)}const nf=t=>nofit.has(t)?' nofit':'';
  let h=`<div class="bf-pool${can&&S.ctr.length?' can':''}" data-bfsrc="-1" style="left:${R.cx-R.pw/2}px;top:${R.cy-R.ph/2}px;width:${R.pw}px;height:${R.ph}px"></div>`;
  S.fac.forEach((a,i)=>{const K=R.K[i];const dx=R.cx-K.x,dy=R.cy-K.y,dl=Math.hypot(dx,dy)||1;
    h+=`<div class="bf-k${can&&a.length?' can':''}${a.length?'':' empty'}" data-bfsrc="${i}" style="left:${K.x-R.ks/2}px;top:${K.y-R.ks/2}px;width:${R.ks}px;height:${R.ks}px">`;
    a.forEach((t,k)=>{const key=`f${i}_${k}`;const x=(k%2?.56:-.56)*ts,y=(k<2?-.56:.56)*ts;const up=sel&&sel.src===i&&(t===sel.c||(t===PRISM&&sel.j));const nud=sel&&sel.src===i&&!up;
      h+=`<i class="bf-t${up?' up':''}${nud?' nud':''}${nf(t)}${isAdv(i,t)?' adv':''}${o.deal?' deal':''}${BF.hide.has(key)?' hid':''}" data-k="${key}" role="button" aria-label="${TNAME[t]}" style="left:${R.ks/2+x-ts/2}px;top:${R.ks/2+y-ts/2}px;width:${ts}px;height:${ts}px;--nx:${dx/dl*ts*.3}px;--ny:${dy/dl*ts*.3}px;${o.deal?`animation-delay:${(i*4+k)*45}ms;`:''}">${bfUse(t)}</i>`});
    h+='</div>'});
  const items=S.ctr.map((t,k)=>({t,k})).sort((u,v)=>u.t-v.t||u.k-v.k);if(S.markerIn==='ctr')items.unshift({t:SUN,k:'sun'});const N=items.length;
  if(N){let b=null;for(let c=1;c<=N;c++){const rr=Math.ceil(N/c);const s=Math.min(ts*1.05,R.pw*.9/c,R.ph*.84/rr);if(!b||s>b.s)b={c,rr,s}}const p=b.s,gx=R.cx-b.c*p/2,gy=R.cy-b.rr*p/2;
    items.forEach((it,j)=>{const x=gx+(j%b.c)*p,y=gy+Math.floor(j/b.c)*p;const key=it.k==='sun'?'sun':'c_'+it.k;const up=sel&&sel.src<0&&(it.t===SUN||it.t===sel.c||(it.t===PRISM&&sel.j));
      h+=`<i class="bf-t${up?' up':''}${it.t===SUN?' sun':nf(it.t)+(isAdv(-1,it.t)?' adv':'')}${BF.hide.has(key)?' hid':''}" data-k="${key}"${it.t===SUN?' title="Sun token"':` role="button" aria-label="${TNAME[it.t]}"`} style="left:${x+p*.05}px;top:${y+p*.05}px;width:${p*.9}px;height:${p*.9}px">${bfUse(it.t)}</i>`})}
  return h}
function bfBoardHTML(S,p,hp){const pi=p.i,live=!BF.busy;const sel=live&&hp&&hp.i===pi&&G.phase==='offer'?UI.sel:null;const ok={};
  if(sel)for(const m of movesFor(sel)){try{ok[m.line]={m,X:phNow(m,pi)}}catch(e){ok[m.line]={m,X:null}}}
  let rec=-1;if(sel&&UI.coach){try{const ms=movesFor(sel);if(ms.length>1){const a=bfAdvice(hp);if(a&&a.act==='take'&&a.src===sel.src&&a.c===sel.c&&ms.some(m=>m.line===a.line))rec=a.line;else{const R=phRec(ms,pi);if(R)rec=R.m.line}}}catch(e){}}
  const wq=live&&hp&&hp.i===pi&&G.phase==='wall'&&G.wt&&G.wt.q&&G.wt.q.p===pi?G.wt.q:null;let h='';
  for(let r=0;r<5;r++){const o=ok[r],X=o&&o.X;let rk='';
    for(let col=0;col<5;col++){const k=4-col;if(k>=cap(r)){rk+='<b class="bf-c no"></b>';continue}const key=`l${pi}_${r}_${k}`;const t=p.lines[r][k];let inner='';
      if(t!=null)inner=bfTile(t,key);else if(X){const g=X.pv.ghost.find(g=>g.sl===key);if(g)inner=bfTile(g.k,null,'gh')}rk+=`<b class="bf-c" data-s="${key}">${inner}</b>`}
    const badge=(rec===r?'<span class="bf-bd rec">best</span>':'')+(X&&X.tp?`<span class="bf-bd ${X.net<0?'bad':'good'}${rec===r?' r2':''}">${X.net<0?'−'+(-X.net):'+'+X.net}</span>`:'');
    const tc=X&&X.pv.full&&!S.ex.gray?(()=>{const c0=sel.c<NC?sel.c:lineColour(p.lines[r]);return c0>=0?WALLCOL(c0,r):-1})():-1;
    const blk=sel&&!o?phReason(p,r,sel.c):'';const clashC=blk.startsWith('mosaic')&&sel.c<NC?WALLCOL(sel.c,r):-1;
    let wl='';for(let c=0;c<5;c++){const key=`w${pi}_${r}_${c}`;const v=p.wall[r][c];let inner=v>=0?bfTile(v<5?v:PRISM,key):S.ex.gray?'':`<i class="pr">${bfUse(WALLC(r,c))}</i>`;let cls='';
      if(c===tc&&v<0){cls=' tgt';if(!X.tp)inner+=`<em>+${X.pv.pts}</em>`}
      else if(v<0&&!S.ex.gray&&p.lines[r].length===cap(r)&&lineColour(p.lines[r])>=0&&WALLCOL(lineColour(p.lines[r]),r)===c){cls=' ready';inner=bfTile(lineColour(p.lines[r]),null,'gh')}
      if(S.ex.gray?(blk.startsWith('mosaic')&&v>=0&&(v<5?v:v-10)===sel.c):c===clashC)cls=' clash';
      if(wq&&wq.r===r&&wq.cells.includes(c)){cls=' pick';inner+=`<em>+${adjPts2(p.wall,r,c)}</em>`}
      wl+=`<b class="bf-c${cls}" data-s="${key}"${cls===' pick'?` data-bfcell="${r},${c}" role="button" aria-label="Row ${r+1}, column ${c+1}"`:''}>${inner}</b>`}
    h+=`<div class="bf-row${sel?(o?' ok':' dim'):''}${blk.startsWith('holds')?' rclash':''}${wq&&wq.r===r?' wq':''}" data-bfrow="${r}"${o?` role="button" aria-label="Rack ${r+1}"`:''}><div class="bf-rack">${badge}${rk}</div><i class="bf-ar"></i><div class="bf-wall">${wl}</div></div>`}
  let fl='';for(let k=0;k<7;k++){const key=`x${pi}_${k}`;const t=p.floor[k];fl+=`<b class="bf-c" data-s="${key}">${t!=null?bfTile(t,key,t===SUN?'':'cr'):`<span>${String(FLOOR[k]).replace('-','−')}</span>`}</b>`}
  let fb=p.floor.length&&!sel?`<span class="bf-bd bad fbd">${String(floorPenalty(Math.min(7,p.floor.length))).replace('-','−')}</span>`:'';if(rec===5)fb+='<span class="bf-bd rec fbr">best</span>';if(sel){const m5=movesFor(sel).find(m=>m.line===5);if(m5){try{const pv=preview(m5,pi);fb=`<span class="bf-bd bad fbd">${String(pv.pen).replace('-','−')}</span>`}catch(e){}}}
  h+=`<div class="bf-floor${sel?' ok':''}" data-bfrow="5"${sel?' role="button" aria-label="Floor: break them"':''}><div class="bf-fl">${fl}</div><span class="bf-fll">floor</span>${fb}</div>`;return h}
// what each score will be after this round's tiling and breakage, so the round end is never a surprise
function bfProj(S,p){let pts=0;if(!S.ex.gray){const w=p.wall.map(r=>r.slice());for(let r=0;r<5;r++){const L=p.lines[r];if(L.length!==cap(r))continue;const lc=lineColour(L);if(lc<0)continue;const c=WALLCOL(lc,r);if(w[r][c]>=0)continue;pts+=adjPts2(w,r,c);w[r][c]=lc}}
  return Math.max(0,p.score+pts+floorPenalty(Math.min(7,p.floor.length)))}
function bfTopHTML(S){const s=BF.busy?BF.actor:sideToAct();
  return `<button class="bf-ib" data-bf="menu" aria-label="Menu">${IC('menu')}</button><div class="bf-chips">${S.pl.map(p=>`<button class="bf-chip${p.i===s?' cur':''}" data-bfchip="${p.i}" style="--pc:${PCOL[p.i]}" aria-label="${esc(p.nm)}: ${p.score} points"><i></i><b>${isYou(p.i)?'You':S.pl.length>=4?'':esc(p.nm)}</b>${S.markerIn===p.i?'<em>☀</em>':''}<span class="bf-sc" data-bfsc="${p.i}">★${p.score}</span>${(()=>{if(BF.busy||S.phase!=='offer'||G.over)return '';const v=bfProj(S,p);return v===p.score?'':`<span class="bf-pj ${v<p.score?'dn':'up'}">${v<p.score?'−'+(p.score-v):'+'+(v-p.score)}</span>`})()}</button>`).join('')}</div><button class="bf-ib" data-gx="rulesd" aria-label="How to play">${IC('rules')}</button>`}
function bfWinLine(){if(!G.over)return '';const w=G.over.win.map(i=>P(i));const sc=G.over.scores.map(s=>s.s.total);const you=w.some(p=>isYou(p.i));
  return (you?(w.length>1?'You share the win':'You win'):w.map(p=>p.nm).join(' & ')+(w.length>1?' share it':' wins'))+' '+sc.slice(0,2).join(' to ')+'!'}
function bfHintHTML(S,hp){let say='',chip='',tg='';const live=!BF.busy;
  if(!live)say=BF.say||'';
  else if(G.over)say=bfWinLine();
  else if(hp&&G.phase==='wall')say='Tap a glowing wall space';
  else if(hp&&UI.sel){const a=UI.sel.src<0?G.ctr:G.fac[UI.sel.src]||[];const n=a.filter(t=>t===UI.sel.c||(t===PRISM&&UI.sel.j)).length;chip=`<span class="bf-n">${bfUse(UI.sel.c)}<b>×${n}</b></span>`;say=movesFor(UI.sel).every(m=>m.line===5)?'No room: tap the floor':'Tap a glowing row';
    const nj=a.filter(t=>t===PRISM).length;if(UI.sel.c<NC&&nj)tg=`<button class="bf-pz${UI.sel.j?' on':''}" data-bf="prism" aria-pressed="${!!UI.sel.j}" aria-label="Also take the prism tiles">${bfUse(PRISM)}${UI.sel.j?'✓':'✗'}</button>`}
  else if(hp){const allBad=BF.tbl&&!BF.tbl.querySelector('.bf-t[role=button]:not(.nofit)');say=(G.pl.filter(q=>q.human).length>1&&!NET.on?hp.nm+': ':'')+(allBad?'No fit: take the fewest':BF.seen.took?'Your turn: tap a colour':'Tap a colour to grab every tile');}
  else{const s=sideToAct();say=s>=0?(NET.on&&P(s).human?'Waiting for '+P(s).nm+'…':P(s).nm+' is choosing…'):''}
  if(BF.tip){say=BF.tip;chip='';tg=''}
  return `<span class="bf-say${BF.tip?' bf-tipl':''}">${chip}<span>${esc(say)}</span></span>${tg}${live&&hp&&!G.over?`<button class="bf-ib bf-bulb" data-bf="hint" aria-label="Show me a good move">${IC('bulb')}</button>`:''}${live&&G.over&&BF.resHide?`<button class="bf-b" data-bf="res">Result</button>`:''}`}
function bfOvHTML(){if(BF.busy||!G)return '';
  if(BF.menu){const nh=!human();const b=(ic,lab,attr)=>`<button class="bf-mi" ${attr}>${IC(ic)}<span>${lab}</span></button>`;
    return `<div class="bf-card bf-menu" role="dialog" aria-label="Menu">${b('rules','How to play','data-gx="rulesd"')}${b('guide','Guide: '+(UI.coach?'on':'off'),'data-a="coach"')}${b(SND.on?'snd':'mute','Sound: '+(SND.on?'on':'off'),'data-a="snd"')}${b(SND.music?'music':'nomusic','Music: '+(SND.music?'on':'off'),'data-a="mus"')}${b('speed','Speed: '+({0.5:'slow',1:'normal',3:'fast'}[UI.speed]||'normal'),'data-a="speed"')}${nh?b(UI.pause?'play':'pause',UI.pause?'Resume':'Pause','data-a="pause"'):''}${b('log','Every move','data-gx="logd"')}${b('tiles','Tile list','data-gx="refd"')}${b('new','New game','data-a="new"')}</div>`}
  if(BF.peek!=null&&P(BF.peek)){const p=P(BF.peek);return `<div class="bf-card bf-peek" role="dialog" aria-label="${esc(p.nm)}'s board"><div class="bf-ph" style="--pc:${PCOL[p.i]}"><i></i><b>${isYou(p.i)?'You':esc(p.nm)}</b><span>★${p.score}</span>${G.markerIn===p.i?'<em>☀</em>':''}<button class="bf-ib" data-bf="close" aria-label="Close">✕</button></div>${phBoardSVG(p)}${phBonus(p)?`<div class="bf-pn">End bonus so far +${phBonus(p)}</div>`:''}</div>`}
  if(G.over&&!BF.resHide){const L=G.over.scores;const you=G.over.win.some(i=>isYou(i));
    return `<div class="bf-card bf-res" role="dialog" aria-label="Result"><div class="bf-rt">${IC('trophy')}<b>${esc(you?(G.over.win.length>1?'You share the win!':'You win!'):G.winner+(G.over.win.length>1?' share the win':' wins'))}</b></div>
      <div class="bf-rk"><span>tiles</span><span>broken</span><span>bonus</span></div>
      ${L.map(r=>{const p=P(r.p),s=r.s;const bon=s.rows+s.cols+s.colours;return `<div class="bf-rr" style="--pc:${PCOL[r.p]}"><i></i><b>${isYou(r.p)?'You':esc(p.nm)}</b><span class="g">+${s.place}</span><span class="r">${s.floor?String(s.floor).replace('-','−'):'0'}</span><span class="g">${bon?'+'+bon:''}</span><b class="t">★${s.total}</b></div>`}).join('')}
      <div class="bf-btns">${isClient()?'':'<button class="bf-go" data-a="new">Play again</button>'}<button class="bf-go ghost" data-bf="close">See boards</button></div></div>`}
  return ''}
function bfDraw(o){o=o||{};if(!BF.on)return;bfEnsure();if(!G||!BF.disp){BF.root.classList.add('empty');BF.top.innerHTML='';BF.tbl.innerHTML='';BF.me.innerHTML='';BF.hint.innerHTML='';BF.ov.hidden=true;bfFinger(null);return}
  BF.root.classList.remove('empty');bfSizes();const S=BF.disp,live=!BF.busy,hp=live?me():null;const f=bfFocus();const fp=S.pl[f]||S.pl[0];
  BF.top.innerHTML=bfTopHTML(S);BF.tbl.innerHTML=bfTableHTML(S,hp,o);if(BF.rv&&BF.busy)bfRival();BF.hint.innerHTML=bfHintHTML(S,hp);BF.me.innerHTML=bfBoardHTML(S,fp,hp);
  BF.me.style.setProperty('--pc',PCOL[fp.i]);BF.me.classList.toggle('turn',!!hp);
  const ov=bfOvHTML();BF.ov.innerHTML=ov;BF.ov.hidden=!ov;
  if(live)bfGuide(hp)}
// ---------- the ghost finger: first move of the guided game, the bulb, or after a long pause ----------
function bfAdvice(hp){const k=G.logN+':'+G.phase+':'+hp.i;if(BF.advK===k)return BF.adv;BF.advK=k;BF.adv=null;if(isClient())return null;try{const a=adviceFor(hp.i);BF.adv=a?a.m:null}catch(e){}return BF.adv}
function bfFingerTarget(hp){const m=bfAdvice(hp);
  if(G.phase==='wall'){const q=G.wt&&G.wt.q;if(!q)return null;const c=m&&m.act==='wall'?m.c:q.cells[0];return bfSlot(`w${hp.i}_${q.r}_${c}`)}
  if(!UI.sel){if(!m||m.act!=='take')return null;const a=m.src<0?G.ctr:G.fac[m.src];const k=a.findIndex(t=>t===m.c||(m.c===PRISM&&t===PRISM));return k<0?null:bfEl((m.src<0?'c':'f'+m.src)+'_'+k)}
  const ms=movesFor(UI.sel);let line=null;if(m&&m.act==='take'&&UI.sel.src===m.src&&UI.sel.c===m.c&&ms.some(x=>x.line===m.line))line=m.line;else{try{const R=phRec(ms,hp.i);if(R)line=R.m.line}catch(e){}}
  if(line==null)return null;return line<5?bfQ(`[data-bfrow="${line}"] .bf-rack`):bfQ('.bf-fl')}
function bfFinger(el){const f=bfQ('.bf-fing');if(!f)return;const r=bfR(el);if(!r){f.hidden=true;return}f.hidden=false;const s=Math.max(.8,Math.min(1.2,BF.cs/34));
  f.style.width=48*s+'px';f.style.height=56*s+'px';f.style.left=(r.left+r.width/2-18*s)+'px';f.style.top=(r.top+r.height/2-4*s)+'px'}
function bfGuide(hp){clearTimeout(BF.idleT);
  const guided=UI.coach&&!BF.seen.took&&hp&&G.phase==='offer'&&!G.over;
  if(hp&&!G.over&&(guided||BF.fingerOn))bfFinger(bfFingerTarget(hp));else bfFinger(null);
  if(hp&&!G.over&&!BF.fingerOn&&!guided)BF.idleT=setTimeout(()=>{if(!BF.busy&&me()){BF.fingerOn=true;bfDraw()}},UI.coach?9000:16000);
  if(hp&&G.phase==='offer'&&!G.over){try{if(phLast()&&BF.lastWarn!==G.round){BF.lastWarn=G.round;bfBanner('Last round!','A wall row will be full');bfTip('end',true)}}catch(e){}
    if(G.markerIn==='ctr'&&G.ctr.length&&BF.seen.took)bfTip('sun');else if(BF.seen.took&&BF.tbl&&BF.tbl.querySelector('.nofit'))bfTip('nofit')}}
// ---------- input: everything is a tap on the thing itself ----------
function bfShake(el){if(!el)return;el.classList.remove('no');void el.offsetWidth;el.classList.add('no')}
function bfClick(e){const t=e.target;const a=t.closest('[data-bf]');if(a){e.preventDefault();return bfAct(a.dataset.bf)}
  if(t.closest('[data-a],[data-gx],[data-ui]')){if(BF.menu){BF.menu=false;setTimeout(()=>{if(!BF.busy)bfDraw()},0)}return}
  if(BF.busy){bfSpeedUp();return}
  if(BF.menu||BF.peek!=null){BF.menu=false;BF.peek=null;bfDraw();return}
  if(t.closest('.bf-ov')){if(G&&G.over){BF.resHide=true;bfDraw()}return}
  const chip=t.closest('[data-bfchip]');if(chip){BF.peek=+chip.dataset.bfchip;sfx('click');bfDraw();return}
  if(!G||G.over)return;const hp=me();if(!hp)return;BF.fingerOn=false;
  if(G.phase==='wall'){const c=t.closest('[data-bfcell]');if(c){const [r,cc]=c.dataset.bfcell.split(',').map(Number);const m=validMoves(hp.i).find(m=>m.r===r&&m.c===cc);if(m)return go(m)}sfx('bad');BF.fingerOn=true;bfDraw();return}
  if(G.phase!=='offer')return;
  let tile=t.closest('[data-k]');
  if(!tile&&e.clientX!=null){const sc=t.closest('[data-bfsrc]');if(sc){const i=+sc.dataset.bfsrc;let best=null,bd=1e9,tw=0;// a tap anywhere on a kiln (or near a courtyard tile) takes the nearest tile
      for(const el of BF.tbl.querySelectorAll(`[data-k^="${i<0?'c_':'f'+i+'_'}"]`)){const r=el.getBoundingClientRect();const d=Math.hypot(r.left+r.width/2-e.clientX,r.top+r.height/2-e.clientY);if(d<bd){bd=d;best=el;tw=r.width}}
      if(best&&(i>=0||bd<tw*1.7))tile=best}}
  const k=tile&&tile.dataset.k;
  if(k&&(k[0]==='f'||k[0]==='c')&&k!=='sun'){const s=slotSel(k);if(s){if(s.c<NC){const ar=s.src<0?G.ctr:G.fac[s.src];if(ar.includes(PRISM))s.j=UI.sel&&UI.sel.src===s.src&&UI.sel.c===s.c?UI.sel.j:1}
      if(UI.sel&&UI.sel.src===s.src&&UI.sel.c===s.c){UI.sel=null;UI.tgt=null;UI.adv=null;sfx('click');upd();return}UI.sel=null;pickSel(s);return}}
  const src=t.closest('[data-bfsrc]');if(src){const i=+src.dataset.bfsrc;const ar=i<0?G.ctr:G.fac[i];if(ar&&ar.length){const ks=[...new Set(ar)].filter(c=>c<NC);
      if(ks.length===1&&!(UI.sel&&UI.sel.src===i)){UI.sel=null;return pickSel({src:i,c:ks[0],j:ar.includes(PRISM)?1:0})}if(!ks.length&&!(UI.sel&&UI.sel.src===i)){UI.sel=null;return pickSel({src:i,c:PRISM,j:1})}}
    if(UI.sel&&UI.sel.src===i)return;}
  const row=t.closest('[data-bfrow]');if(row){const r=+row.dataset.bfrow;if(!UI.sel){sfx('bad');BF.fingerOn=true;bfDraw();return}const m=movesFor(UI.sel).find(m=>m.line===r);if(m)return go(m);sfx('bad');bfShake(row);if(r<5){const why=phReason(hp,r,UI.sel.c);bfPop(why==='full'?'Row is full':why.startsWith('holds')?'Row holds another colour':'Wall row has it',bfR(row),'bad')}return}
  if(UI.sel){UI.sel=null;UI.tgt=null;UI.adv=null;upd()}}
function bfAct(a){switch(a){
  case 'menu':BF.menu=!BF.menu;BF.peek=null;sfx('click');bfDraw();return;
  case 'close':BF.menu=false;BF.peek=null;if(G&&G.over)BF.resHide=true;bfDraw();return;
  case 'res':BF.resHide=false;bfDraw();return;
  case 'hint':if(isClient()&&G.phase==='offer'){advise()}BF.fingerOn=true;sfx('select');bfDraw();return;
  case 'prism':uiAct('prism');return}}
// ---------- wiring into the rest of the page ----------
function bfApply(){const on=PHN.on&&bfWanted();const was=BF.on;BF.on=on;document.documentElement.classList.toggle('bf',on);if(on){bfEnsure();if(G&&!BF.busy){bfSync();BF.disp=bfClone(G)}bfDraw()}else if(was&&BF.root)BF.root.hidden=true;if(on&&BF.root)BF.root.hidden=false}
try{if(!localStorage.getItem('sgz_guided'))UI.setup.lv=UI.setup.lv.map(()=>'easy')}catch(e){}
BF.on=PHN.on&&bfWanted();document.documentElement.classList.toggle('bf',BF.on);
{const _i3=init3D;init3D=function(){if(BF.on)return false;return _i3.apply(this,arguments)};
 const _pr=phRender;phRender=function(){if(BF.on)return bfRender();return _pr.apply(this,arguments)};
 const _pf=phFx;phFx=function(f){if(BF.on)return bfFx(f);return _pf.apply(this,arguments)};
 const _mp=renderMap2D;renderMap2D=function(){if(BF.on){const el=document.getElementById('map2d');if(el)el.hidden=true;return}return _mp.apply(this,arguments)};
 const _st=storyHtml;storyHtml=function(){if(!BF.on)return _st.apply(this,arguments);return `<div class="mbox story bf-story">${storyPic()}<p class="q">Tile the king’s palace wall.<br><b>Most ★ wins.</b></p><div class="acts"><button class="btn go" data-ui="story-ok">Play ▶</button></div></div>`};
 const _sh=startHtml;startHtml=function(){let h=_sh.apply(this,arguments);if(!BF.on)return h;const i=h.indexOf('<h3>Variants</h3>'),j=h.indexOf('</div>',h.indexOf('class="exs"'));if(i<0||j<0)return h;return h.slice(0,i)+'<details class="bf-more"><summary>Options</summary>'+h.slice(i+17,j+6)+'</details>'+h.slice(j+6)};
 const _to=toast;toast=function(t){if(!BF.on)return _to.apply(this,arguments)}}
function bfRender(){if(!BF.on)return;bfEnsure();if(!G){BF.disp=null;bfDraw();return}const fresh=bfSync();
  if(BF.q.length&&!BF.busy&&!UI.modal){bfRun();return}
  if(!BF.busy){BF.disp=bfClone(G);bfDraw(fresh&&G.turn===0?{deal:true}:{})}}
addEventListener('resize',()=>{try{const was=BF.on;bfApply();if(was&&!BF.on&&G)render()}catch(e){}});
