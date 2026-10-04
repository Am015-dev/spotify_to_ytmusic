// ===================== phone layout: the map is the screen, play by tapping it, choices in pop-ups =====================
// Only active when html.ph is set (short side <= 500 px, or a touch screen <= 600 px; ?phone=1 / ?phone=0 force it). Desktop and tablets never run this code.
const PHN={on:false,land:false,pop:null,info:null,rot:0,strip:'',pops:'',chips:'',bar:'',cards:[],figHide:'',tst:'',tt:0,rec:null,recK:'',gi:0,ng:1,MIN:56,figZ:false,endKey:'',lastTurn:0,np:0,tile:'',mine:null};
function phDetect(){try{const P=new URLSearchParams(location.search);if(P.has('phone'))return P.get('phone')!=='0'}catch(e){}
  const s=Math.min(innerWidth,innerHeight);if(s<=500)return true;let c=false;try{c=matchMedia('(pointer:coarse)').matches}catch(e){}return c&&s<=600}
function phInsets(){try{const P=new URLSearchParams(location.search);if(P.has('safe')){const a=P.get('safe').split(',').map(Number);return {t:a[0]||0,r:a[1]||0,b:a[2]||0,l:a[3]||0}}
  let p=document.getElementById('phprobe');if(!p){p=document.createElement('div');p.id='phprobe';p.setAttribute('aria-hidden','true');p.style.cssText='position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';document.body.appendChild(p)}
  const c=getComputedStyle(p);return {t:parseFloat(c.paddingTop)||0,r:parseFloat(c.paddingRight)||0,b:parseFloat(c.paddingBottom)||0,l:parseFloat(c.paddingLeft)||0}}catch(e){return {t:0,r:0,b:0,l:0}}}
function phApply(){const R=document.documentElement;const was=PHN.on;PHN.on=phDetect();R.classList.toggle('ph',PHN.on);
  if(!PHN.on){R.classList.remove('ph-l','ph-p');for(const k of['--dh','--rw','--sat','--sar','--sab','--sal'])R.style.removeProperty(k);if(was&&typeof V3!=='undefined'){V3.tilt=1.02;if(V3.cam)placeCam()}return was}
  const w=innerWidth,h=innerHeight,I=phInsets();PHN.land=w>h;
  R.classList.toggle('ph-l',PHN.land);R.classList.toggle('ph-p',!PHN.land);
  R.style.setProperty('--dh',Math.round(Math.max(228,Math.min(252,h*.285)))+'px');R.style.setProperty('--rw',Math.round(Math.max(226,Math.min(268,w*.29)))+'px');
  R.style.setProperty('--sat',I.t+'px');R.style.setProperty('--sar',I.r+'px');R.style.setProperty('--sab',I.b+'px');R.style.setProperty('--sal',I.l+'px');
  if(typeof V3!=='undefined'&&V3.tilt!==1.32){V3.tilt=1.32;if(V3.cam){placeCam()}}return true}
phApply();
addEventListener('resize',()=>{const w=PHN.on,l=PHN.land;phApply();if(PHN.on!==w||PHN.land!==l){try{PHN.render(true)}catch(e){}}});
addEventListener('orientationchange',()=>setTimeout(()=>{phApply();try{PHN.render(true)}catch(e){}},200));
const phCap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const PH_IC={minus:'<path d="M5 12h14"/>',target:'<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="1.8"/><path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4"/>',last:'<rect x="4" y="5" width="16" height="14" rx="2.5"/><path d="M9 12l2.2 2.2L15.5 9.5"/>',
  rotl:'<path d="M5 12a7 7 0 1 0 2.4-5.3M5 4v4h4"/>',rotr:'<path d="M19 12a7 7 0 1 1-2.4-5.3M19 4v4h-4"/>',road:'<path d="M8 21L10.5 3M16 21l-2.5-18"/><path d="M12 5v2.5M12 11v2.5M12 17v2.5"/>',
  town:'<path d="M3.5 20.5V8.5l2-.8V5.5h2.4v1.8h2V5.5h2.4v1.8h2V5.5h2.4v2.2l2 .8v12z"/><path d="M10 20.5v-5.5h4v5.5"/>',priory:'<path d="M12 2.8v5M9.8 5h4.4"/><path d="M5.5 21V12.5L12 8.5l6.5 4V21z"/><path d="M10 21v-5.5h4V21"/>',
  close:'<path d="M6 6l12 12M18 6L6 18"/>',star:'<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z" fill="currentColor"/>',more:'<path d="M5 12h.01M12 12h.01M19 12h.01" stroke-width="3.4"/>'};
const phI=(n,c)=>ico(n,c);
// ---------- camera: top-down-ish, zoom to a tile size that keeps the glowing squares tappable ----------
const phTf=()=>Math.tan(V3.cam.fov*Math.PI/360);
Object.assign(PHN,{
  tilePx(){if(!V3.cam||!V3.r)return 0;return TS*(V3.r.domElement.clientHeight/2)/(V3.dist*phTf())},
  distFor(px){return clampDist(TS*(V3.r.domElement.clientHeight/2)/(px*phTf()))},
  panK(){return 2*V3.dist*phTf()/Math.max(100,V3.r.domElement.clientHeight)},
  cells(){return (G&&me()&&G.step==='place'?UI.cells:[]).map(unkey)},
  // windows of the map that hold as many glowing squares as fit at the minimum tile size
  groups(){const cs=this.cells();if(!cs.length||!V3.r)return [];const R=V3.r.domElement,cw=R.clientWidth/this.MIN-.7,ch=R.clientHeight/(this.MIN*.94)-.7;const last=this.lastXY();let rem=cs.slice();const out=[];
    while(rem.length&&out.length<9){let best=null;for(const c of rem){const inn=rem.filter(q=>Math.abs(q[0]-c[0])<=cw/2&&Math.abs(q[1]-c[1])<=ch/2);const x0=Math.min(...inn.map(q=>q[0])),x1=Math.max(...inn.map(q=>q[0])),y0=Math.min(...inn.map(q=>q[1])),y1=Math.max(...inn.map(q=>q[1]));const cx=(x0+x1)/2,cy=(y0+y1)/2;const d=Math.hypot(cx-last[0],cy-last[1]);
        if(!best||inn.length>best.n||(inn.length===best.n&&d<best.d))best={n:inn.length,d,cx,cy,x0,x1,y0,y1,cells:inn}}
      out.push(best);const s=new Set(best.cells.map(q=>q.join()));rem=rem.filter(q=>!s.has(q.join()))}
    return out},
  lastXY(){const k=G&&G.cur&&G.cur.k&&G.tiles[G.cur.k]?G.cur.k:G&&G.order[G.order.length-1];return k?unkey(k):[0,0]},
  go(look,dist,instant){if(instant){V3.look.copy(look);V3.dist=dist;V3.camTo=null;placeCam()}else V3.camTo={look,dist,t:0};V3.dirty=true},
  focusGroup(i,instant){const gs=this.groups();if(!gs.length||!V3.r)return false;this.ng=gs.length;this.gi=((i%gs.length)+gs.length)%gs.length;const g=gs[this.gi],R=V3.r.domElement;
    const px=Math.max(this.MIN,Math.min(115,R.clientWidth/(g.x1-g.x0+1.5),R.clientHeight/((g.y1-g.y0+1.5)*.94)));this.go(cellWorld(g.cx,g.cy),this.distFor(px),instant);V3.userMoved=false;return true},
  // called by fitAll(): returns true when it framed the map itself (the whole map would make the tiles smaller than MIN px)
  frame(instant,dAll){if(!this.on||!V3.cam||!G)return false;const px=TS*(V3.r.domElement.clientHeight/2)/(dAll*phTf());if(px>=this.MIN)return false;
    if(this.focusGroup(0,instant))return true;const [x,y]=this.lastXY();this.go(cellWorld(x,y),this.distFor(this.MIN),instant);V3.userMoved=false;return true},
  zoom(f){if(!V3.cam)return;const c=V3.camTo;V3.camTo={look:(c?c.look:V3.look).clone(),dist:clampDist((c?c.dist:V3.dist)*f),t:0};V3.userMoved=true},
  spots(){if(!V3.cam)return;const gs=this.groups();if(!gs.length){this.last();return}this.focusGroup(gs.length>1?this.gi+1:0,false)},
  // bring a scored feature into view (only when its middle is off screen)
  focusFeat(r){try{const ks=phFeatKeys(r);if(!V3.on||!ks||!ks.length)return;const xs=ks.map(k=>unkey(k)[0]),ys=ks.map(k=>unkey(k)[1]);const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);const R=V3.r.domElement;
    const vis=[[x0-.5,y0-.5],[x1+.5,y0-.5],[x0-.5,y1+.5],[x1+.5,y1+.5]].every(([x,y])=>{const v=screenOf(cellWorld(x,y));return v.in&&v.x>=0&&v.x<=R.clientWidth&&v.y>=0&&v.y<=R.clientHeight});
    if(!vis){const px=Math.max(this.MIN*.8,Math.min(115,R.clientWidth/(x1-x0+1.6),R.clientHeight/((y1-y0+1.6)*.94)));this.go(cellWorld((x0+x1)/2,(y0+y1)/2),this.distFor(px),false);V3.userMoved=true}}catch(e){}},
  last(){if(!V3.cam||!G)return;const [x,y]=this.lastXY();this.go(cellWorld(x,y),Math.min(V3.camTo?V3.camTo.dist:V3.dist,this.distFor(this.MIN*1.25)),false);V3.userMoved=true},
  figFrame(){if(!V3.cam||!G||!G.cur||!G.cur.k)return;const [x,y]=unkey(G.cur.k),R=V3.r.domElement;const px=Math.min(Math.min(R.clientWidth,R.clientHeight*.94)*.46,150);this.go(cellWorld(x,y),this.distFor(px),false);this.figZ=true}
});
// ---------- what the player sees ----------
function phWhere(k,l){return segWhere(k,l).trim()}
function phFeatName(ty){return ty==='F'?'Farm':phCap(FEAT[ty])}
function phFeatIc(ty){return ty==='F'?'grain':ty==='C'?'town':ty==='R'?'road':'priory'}
function phRecFig(hp){const key=G.turn+':'+G.step+':'+hp.i;if(PHN.recK!==key){PHN.recK=key;try{PHN.rec=bestFigNow(hp.i,'normal')}catch(e){PHN.rec=null}}return PHN.rec}
function phPts(m,F,s,fl){if(m.k==='bld')return 'extra turn when you extend it';if(m.k==='pig')return `+1 per town (${fieldCities(F).size} now)`;
  if(s.ty==='F'){const n=fieldCities(F).size;return `+${fl.end} at the end · ${n} finished town${n===1?'':'s'}`}
  if(F.done||closesNow(F))return `+${fl.now} now, finished by this tile`;if(fl.now===fl.end)return `+${fl.now} · back when finished`;return `+${fl.now} if finished · +${fl.end} if not`}
function phOptHTML(m,hp,rec){const T=G.tiles[G.cur.k],s=TSEG[T.t][m.l],r=find(T.s0+m.l),F=G.fd[r],fl=featLine(s.ty,F,figsIn(r),hp.i);const w=phWhere(G.cur.k,m.l);
  const kind=m.k==='f'?'':m.k==='big'?'Champion · ':m.k==='bld'?'Mason · ':'Hog · ';
  return `<button class="pb opt${rec?' rec':''}" data-mv='${esc(JSON.stringify(m))}' aria-label="${esc(kind+phFeatName(s.ty)+(w?' '+w:'')+', '+phPts(m,F,s,fl)+(rec?', suggested':''))}"><span class="oi">${phI(m.k==='f'?phFeatIc(s.ty):m.k==='big'?'champ':m.k==='bld'?'mason':'hog')}</span><span class="ot"><b>${kind}${phFeatName(s.ty)}${w?' <small>'+esc(w)+'</small>':''}${rec?`<em class="star">${phI('star')}</em>`:''}</b><small>${esc(phPts(m,F,s,fl))}</small></span></button>`}
function phFigPopup(hp){const ms=figMoves(hp.i).filter(m=>m.act==='fig');const kinds=[...new Set(ms.map(m=>m.k))];const rec=phRecFig(hp)||{act:'skip'};const many=kinds.length>2;
  const tabs=kinds.length>1?`<div class="ph-tabs${many?' icons':''}">${kinds.map(k=>{const nm={f:'Follower',big:'Champion',bld:'Mason',pig:'Hog'}[k];return `<button class="pb tab${UI.kind===k?' on':''}" data-kind="${k}" aria-pressed="${UI.kind===k}" aria-label="${nm}${rec.k===k&&rec.act==='fig'?' (suggested)':''}">${phI({f:'meeple',big:'champ',bld:'mason',pig:'hog'}[k])}<span>${nm}</span>${rec.k===k&&rec.act==='fig'?`<em class="star">${phI('star')}</em>`:''}</button>`}).join('')}</div>`:'';
  return `<div class="ph-head${tabs?' hastabs':''}"><div class="ph-ht"><b>Follower?</b><small>${G.cur.bonus?'extra turn · ':''}<em class="star">${phI('star')}<span class="sg"> suggested</span></em></small></div>${tabs}<button class="pb skip${rec.act==='skip'?' rec':''}" data-mv='{"act":"skip"}'>${rec.act==='skip'?`<em class="star">${phI('star')}</em>`:''}Skip</button><button class="ph-x" data-ph="figx" aria-label="Close">${phI('close')}</button></div>
   <p class="ph-why"><em class="star">${phI('star')}</em> ${esc(figAdviceText(rec,hp.i))}</p>
   <div class="ph-opts">${ms.filter(m=>m.k===UI.kind).map(m=>phOptHTML(m,hp,rec.act==='fig'&&same(rec,m))).join('')}</div>`}
function phPlacePopup(hp){const gh=UI.ghost,t=G.cur.t;const pv=placementPreview(t,gh.r,...unkey(gh.k),hp.i);const multi=gh.rots.length>1;const adv=UI.advice&&UI.advice.place&&same({x:UI.advice.place.x,y:UI.advice.place.y,r:UI.advice.place.r},{x:unkey(gh.k)[0],y:unkey(gh.k)[1],r:gh.r});
  return `<div class="ph-head"><b>${adv?'Suggested spot':'Place here?'}</b><button class="ph-x" data-ui="cancel" aria-label="Cancel">${phI('close')}</button></div>
   <div class="ph-row"><div class="ps-tile">${tileCard(t,gh.r,1)}</div><div class="ph-rb"><button class="pb sq" data-ui="rotl" aria-label="Turn left"${multi?'':' disabled'}>${phI('rotl')}</button><button class="pb sq" data-ui="rotr" aria-label="Turn right"${multi?'':' disabled'}>${phI('rotr')}</button></div><button class="pb pri place" data-ui="confirm">Place</button></div>
   <p class="ph-note">${UI.advice&&UI.advice.text?'<b>Advice:</b> '+esc(UI.advice.text)+' ':''}${multi?`Fits ${gh.rots.length} ways: turn it, or tap the tile again.`:'Fits one way.'}${pv.length?' '+pv.map(esc).join(' · '):''}</p>`}
function phMenuPopup(){const sb=document.getElementById('sndbtn'),mb=document.getElementById('musbtn');const on=x=>x&&x.getAttribute('aria-pressed')==='true';const sp={0.5:'slow',1:'normal',3:'fast'}[UI.speed]||'normal';
  const it=(a,ic,l)=>`<button class="pb mi" ${a}>${phI(ic)}<span>${l}</span></button>`;
  const tg=(a,ic,l,st,pr)=>`<button class="pb tg${pr?' on':''}" ${a} aria-label="${l}: ${st}"${pr!=null?` aria-pressed="${pr}"`:''}>${phI(ic)}<span>${l}</span><small>${st}</small></button>`;
  return `<div class="ph-head"><b>Menu</b><button class="ph-x" data-ph="pclose" aria-label="Close">${phI('close')}</button></div>
    <div class="ph-tgs">${tg('data-a="guide"','guide','Guide',UI.guide?'on':'off',UI.guide)}${tg('data-a="snd"',on(sb)?'snd':'sndoff','Sound',on(sb)?'on':'off',on(sb))}${tg('data-a="mus"',on(mb)?'mus':'musoff','Music',on(mb)?'on':'off',on(mb))}${tg('data-a="speed"','ff','Speed',sp,null)}</div>
    <div class="ph-menu">${it('data-gx="plrd"','players','Scores')}${it('data-gx="logd"','scroll','Log')}${it('data-gx="refd"','tile','Tiles')}${it('data-gx="rulesd"','book','Rules')}${it('data-gx="setd"','gear','Settings')}${it('data-a="new"','plus','New game')}</div>`}
function phFeatAt(k,w){const T=G.tiles[k];if(!T||!w)return null;let best=-1,bd=1e9;TSEG[T.t].forEach((s,l)=>{const q=spotWorld(k,l);const d=Math.hypot(q.x-w.x,q.z-w.z);if(d<bd){bd=d;best=l}});return best<0?null:{k,l:best}}
function phInfoPopup(){const I=PHN.info;if(!I||!G.tiles[I.k])return null;const T=G.tiles[I.k],s=TSEG[T.t][I.l],r=find(T.s0+I.l),F=G.fd[r],figs=figsIn(r);const hp=me();const fl=featLine(s.ty,F,figs,hp?hp.i:-1);const w=phWhere(I.k,I.l);
  const fg=figs.length?figs.map(f=>`<span class="pcz" style="--pc:${PCOL[f.p]}">${esc(P(f.p).nm)}’s ${f.k==='f'?ROLE[s.ty]:FIGN[f.k]}</span>`).join(' '):'nobody here yet';
  const pts=F.done?(s.ty==='M'?'Finished: 9 points were scored.':'Finished and scored.'):s.ty==='F'?`At the end: +${fl.end} for whoever has most farmers (3 per finished town${hp&&G.ex.tb?', 4 with a hog':''}).`:`Finished: ${fl.now} points. Left open at the end: ${fl.end}.`;
  return `<div class="ph-head"><span class="oi big">${phI(phFeatIc(s.ty))}</span><b>${phFeatName(s.ty)}${w?' <small>'+esc(w)+'</small>':''}</b><button class="ph-x" data-ph="pclose" aria-label="Close">${phI('close')}</button></div>
   <div class="ph-body"><p>${esc(phCap(fl.size))}.</p><p>${esc(pts)}</p><p><b>Held by:</b> ${fg}${figs.length?' · '+esc(fl.who):''}</p></div>`}
// ---------- cards: scoring events, coach tips, the final count. One at a time, each with Continue ----------
// whose turn a card belongs to, in the reader's words
const PH_TOP=()=>document.documentElement.classList.contains('ph-p');
function phWho(i,pos){const p=P(i);const mine=p.human&&(!NET.on||i===NET.mySeat)&&G.pl.filter(q=>q.human).length===1;return mine?(pos?'Your':'You'):esc(p.nm)+(pos?'’s':'')}
function phSumLine(F,pts){const n=F.tiles?F.tiles.length:0,pl=k=>k>1?'s':'';
  if(F.ty==='C'){const m=F.cat?3:2;return `${n} tile${pl(n)} × ${m}${F.pen?` + ${F.pen} banner${pl(F.pen)} × ${m}`:''} = ${pts}${F.cat?' (basilica)':''}`}
  if(F.ty==='R'){const m=F.inn?2:1;return `${n} tile${pl(n)} × ${m} = ${pts}${F.inn?' (tavern)':''}`}
  return `surrounded by 8 tiles = ${pts}`}
// holders of a feature: who has how many followers there (a champion counts 2), and who wins it
function phHolders(fs,win,pts){const by={};for(const [p,k] of fs){if(k==='bld'||k==='pig')continue;by[p]=(by[p]||0)+(k==='big'?2:1)}
  return Object.keys(by).map(Number).sort((a,b)=>by[b]-by[a]).map(i=>`<div class="pc-row${win.includes(i)?'':' lose'}" style="--pc:${PCOL[i]}"><i></i><b>${esc(P(i).nm)}</b><small>${by[i]} follower${by[i]>1?'s':''}</small><span>${win.includes(i)?'+'+pts:'0'}</span></div>`).join('')}
function phScoreCard(x){const F=G.fd[x.r];if(!F)return null;const ty=F.ty,by=x.by!=null?x.by:x.win[0],fs=x.fs||x.win.map(i=>[i,'f']);
  const lose=fs.some(([p,k])=>!x.win.includes(p)&&k!=='bld'&&k!=='pig');
  return {id:'s'+x.r+':'+G.turn,root:x.r,by,hl:phFeatKeys(x.r),h:`<div class="pc-in"><div class="pc-h">${phI(phFeatIc(ty),'big')}<div><b>${phWho(by,1)} tile finished a ${FEAT[ty]}</b><small>${esc(phSumLine(F,x.pts))}</small></div></div>
   <div class="pc-rows">${phHolders(fs,x.win,x.pts)}</div><p class="pc-t">${ty==='C'&&F.pen?`Each banner (the little flag) adds ${F.cat?3:2}. `:''}${lose?'Most followers there wins it (a tie pays everyone tied). ':''}Followers in it come home.</p>
   <button class="pb pri cont" data-ph="cont">Continue</button></div>`}}
// the tiles to light up for a feature (a priory lights its 3x3 block)
function phFeatKeys(r){const F=G.fd[r];if(!F)return null;if(F.ty==='M'){const o=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const k=key(F.x+dx,F.y+dy);if(G.tiles[k])o.push(k)}return o}return F.tiles?F.tiles.slice():null}
function phGoodsCard(pi){const l=G.log.find(e=>e.t&&e.t.indexOf('🧺')===0);return {id:'g'+G.turn+':'+pi,by:pi,h:`<div class="pc-in"><div class="pc-h">${phI('wine','big')}<div><b>Goods</b><small>${esc(P(pi).nm)} closed the town</small></div></div><p class="pc-t">${esc(l?l.t.replace('🧺 ',''):'')}</p><button class="pb pri cont" data-ph="cont">Continue</button></div>`}}
function phCoachCard(id,txt){return {id:'c'+id,coach:1,h:`<div class="pc-in"><div class="pc-h">${phI('guide','big')}<div><b>Tip</b></div></div><p class="pc-t">${txt}</p><button class="pb pri cont" data-ph="cont">Got it</button></div>`}}
function phEndCards(){const out=[];const {add,det}=finalScores();const nm=i=>esc(P(i).nm);const open=det.filter(d=>d.ty!=='F');const farms=det.filter(d=>d.ty==='F'&&d.n);
  const skip=`<button class="pb skipall" data-ph="skipall">Skip to the result</button>`;
  if(open.length)out.push({id:'e-open',end:1,h:`<div class="pc-in"><div class="pc-h">${phI('scroll','big')}<div><b>Unfinished features</b><small>they score a little at the end</small></div></div><div class="pc-rows">${G.pl.map(p=>{const t=open.filter(d=>d.win.includes(p.i)).reduce((a,d)=>a+d.pts,0);return `<div class="pc-row" style="--pc:${PCOL[p.i]}"><i></i><b>${nm(p.i)}</b><small>all unfinished</small><span>+${t}</span></div>`}).join('')}${open.map(d=>{const F=G.fd[d.r];const z=d.pts===0?' <small>(0: tavern or basilica left open)</small>':'';return `<div class="pc-row2"><span>${phCap(FEAT[d.ty])} (${d.ty==='M'?nbrCount(F.x,F.y)+' of 9 tiles':F.tiles.length+' tile'+(F.tiles.length>1?'s':'')})${z}</span><span>${d.win.map(i=>`<b style="color:${PCOL[i]}">${nm(i)}</b> +${d.pts}`).join(', ')}</span></div>`}).join('')}</div><div class="pc-b"><button class="pb pri cont" data-ph="cont">Continue</button>${skip}</div></div>`});
  farms.forEach((d,i)=>{const pig=w=>figsIn(d.r).some(f=>f.p===w&&f.k==='pig');out.push({id:'e-f'+d.r,end:1,root:d.r,hl:phFeatKeys(d.r),h:`<div class="pc-in"><div class="pc-h">${phI('grain','big')}<div><b>Farm ${i+1} of ${farms.length}</b><small>${d.n} finished town${d.n>1?'s':''} beside it × 3 = ${d.n*3}</small></div></div><div class="pc-rows">${phFarmRows(d,pig)}</div><p class="pc-t">The glowing field: whoever has the most farmers in it scores.</p>${d.win.some(pig)?'<p class="pc-t">The hog is worth 4 per town instead of 3.</p>':''}<div class="pc-b"><button class="pb pri cont" data-ph="cont">Continue</button>${skip}</div></div>`})});
  if(G.ex.tb&&G.pl.some(p=>p.end&&p.end.goods))out.push({id:'e-goods',end:1,h:`<div class="pc-in"><div class="pc-h">${phI('wine','big')}<div><b>Goods</b><small>10 points for the most of each kind</small></div></div><div class="pc-rows">${G.pl.filter(p=>p.end.goods).map(p=>`<div class="pc-row" style="--pc:${PCOL[p.i]}"><i></i><b>${esc(p.nm)}</b><span>+${p.end.goods}</span></div>`).join('')}</div><div class="pc-b"><button class="pb pri cont" data-ph="cont">Continue</button>${skip}</div></div>`});
  out.push(phResultCard());return out}
function phFarmRows(d,pig){const by={};for(const f of figsIn(d.r)){if(f.k==='pig')continue;by[f.p]=(by[f.p]||0)+(f.k==='big'?2:1)}
  return Object.keys(by).map(Number).sort((a,b)=>by[b]-by[a]).map(i=>`<div class="pc-row${d.win.includes(i)?'':' lose'}" style="--pc:${PCOL[i]}"><i></i><b>${esc(P(i).nm)}</b><small>${by[i]} farmer${by[i]>1?'s':''}</small><span>${d.win.includes(i)?'+'+d.n*(pig(i)?4:3):'0'}</span></div>`).join('')}
function phResultCard(){const top=Math.max(...G.pl.map(p=>p.score));const order=G.pl.slice().sort((a,b)=>b.score-a.score);
  return {id:'e-result',end:1,final:1,h:`<div class="pc-in"><div class="pc-h">${phI('trophy','big')}<div><b>${esc(G.winText||'Game over')}</b></div></div><div class="pc-rows">${order.map(p=>{const e=p.end||{};const fin=(e.road||0)+(e.town||0)+(e.priory||0),fa=e.field||0,gd=e.goods||0;return `<div class="pc-row${p.score===top?' win':''}" style="--pc:${PCOL[p.i]}"><i></i><b>${esc(p.nm)}</b><small>${p.score-fin-fa-gd} in play + ${fin} unfinished + ${fa} farms${G.ex.tb?' + '+gd+' goods':''}</small><span>${p.score}</span></div>`}).join('')}</div><div class="pc-b"><button class="pb pri cont" data-ph="cont">Close</button><button class="pb" data-a="new">New game</button></div></div>`}}
Object.assign(PHN,{
  blocking(){return this.on&&!NET.on&&human()&&this.cards.length>0},
  add(c){if(!c||!this.on)return;if(!human()&&!c.end)return;if(this.cards.some(x=>x.id===c.id))return;this.cards.push(c)},
  fx(f){if(!this.on||!G)return;if(f.t==='score'&&f.x)this.add(phScoreCard(f.x));else if(f.t==='goods'&&typeof f.x==='number')this.add(phGoodsCard(f.x))},
  cont(){this.cards.shift();this.render(true);if(typeof schedule==='function')schedule()},
  toast(t){this.tst=t;clearTimeout(this.tt);this.tt=setTimeout(()=>{this.tst='';this.render()},3200);this.render()},
  reset(){this.cards=[];this.pop=null;this.info=null;this.rot=0;this.figHide='';this.tst='';this.endKey='';this.figZ=false;this.rec=null;this.recK=''},
  // taps on the map: info for a feature, closing pop-ups. Returns true when the tap was used.
  tap(k,w){if(!this.on||!G)return false;if(this.cards.length)return true;
    if(this.pop==='menu'||this.pop==='info'){this.pop=null;this.info=null;this.render(true);return true}
    if(!k||!G.tiles[k])return false;const hp=me();
    if(hp&&G.step==='fig'&&k===G.cur.k&&UI.spotOpts.length&&w){let bd=.45;for(const o of UI.spotOpts){const q=spotWorld(G.cur.k,o.l);const d=Math.hypot(q.x-w.x,q.z-w.z);if(d<bd)bd=d}if(bd<.45)return false}
    if(!w)return false;const f=phFeatAt(k,w);if(!f)return false;this.info=f;this.pop='info';this.render(true);return true}
});
// ---------- strip, chips, bar ----------
function phChips(){if(!G)return '';const cur=sideToAct();let add=null;try{add=finalScores().add}catch(e){}const long=G.pl.length<=3;
  return G.pl.map(p=>{const a=add&&add[p.i];const proj=p.score+(a?a.road+a.town+a.priory+a.field+a.goods:0);
    return `<button class="pchip${cur===p.i&&!G.over?' cur':''}" style="--pc:${PCOL[p.i]}" data-gx="plrd" aria-label="${esc(p.nm)}${NET.on&&p.i===NET.mySeat?' (you)':''}: ${p.score} points, ${proj} if the game ended now, ${p.sup.f} followers left. Tap for all scores"><span class="pn"><i></i>${esc(long?p.nm:p.nm.charAt(0))}</span><b>${p.score}</b><span class="pf">${ico('meeple')}${p.sup.f}</span>${G.over?'':`<small class="pe">${long?'if it ended: ':'end '}${proj}</small>`}</button>`}).join('')}
function phBarHTML(){if(!G)return '';const c0=PHN.cards[0];const s=c0&&c0.by!=null&&!G.over?c0.by:sideToAct();const ns=NET.on&&!NET.inLobby?`<span class="netst${NET.hostGone?' bad':''}" title="Online">${esc(netStatus())}</span>`:'';
  const tl=tilesLeft()||(G.step==='place'&&!G.over?'last':0);return `<span class="pb-n" aria-label="${tilesLeft()} tiles left after this one">${ico('tile')}<b>${tl}</b></span>`+(G.over?'<span class="pb-t"><b>Game over</b></span>':s>=0?`<span class="pb-t"><i style="background:${PCOL[s]}"></i><b>${esc(P(s).nm)}</b>${NET.on&&s===NET.mySeat?' <small>(you)</small>':''}</span>`:'')+ns}
function phZoomRow(){if(!V3.on)return '';const g=PHN.groups();const lab=g.length>1?`<small>${PHN.gi+1}/${g.length}</small>`:'';
  return `<div class="ps-zoom"><button class="pb sq" data-ph="zout" aria-label="Zoom out">${phI('minus')}</button><button class="pb sq" data-ph="zin" aria-label="Zoom in">${phI('plus')}</button><button class="pb sq" data-ph="all" aria-label="Show the whole valley">${phI('fit')}</button>${me()&&G.step==='place'?`<button class="pb sq wide" data-ph="spots" aria-label="Go to the glowing squares${g.length>1?', group '+(PHN.gi+1)+' of '+g.length:''}">${phI('target')}<span>${g.length>1?'Next':'Spots'}</span>${lab}</button>`:''}<button class="pb sq wide" data-ph="last" aria-label="Go to the last tile">${phI('last')}<span>Last</span></button></div>`}
function phLastOther(){const r=UI.recap;return r&&r.n>=G.turn-G.pl.length?'<b>Last:</b> '+(r.short||r.html):''}
function phStripHTML(){if(!G)return '';const hp=me(),s=sideToAct(),p=s>=0?P(s):null;const hint=PHN.tst;
  if(G.over)return `<div class="ps-row"><div class="ps-msg"><b>Game over</b><span>${esc(G.winText||'')}</span></div></div><div class="ps-row"><button class="pb pri" data-ph="results">Result</button><button class="pb" data-a="new">New game</button></div>${phZoomRow()}`;
  if(NET.on&&NET.hostGone)return `<div class="ps-row"><div class="ps-msg"><b>The host left</b><span>The game is over.</span></div></div><div class="ps-row"><button class="pb pri" data-net="leave">Back to the start</button></div>`;
  if(!hp){const wait=NET.on&&p&&p.human?(p.i===NET.mySeat?'Sending your move…':'Waiting for '+esc(p.nm)+'…'):'';
    return `<div class="ps-row"><div class="ps-msg"><b>${p?`<i class="dot" style="background:${PCOL[p.i]}"></i>${esc(p.nm)} is ${G.step==='place'?'placing':'choosing'}…`:''}</b><span>${wait||(UI.recap?UI.recap.html:'')}</span></div>${human()?'':`<button class="pb sq" data-a="pause" aria-label="${UI.pause?'Resume':'Pause'}">${ico(UI.pause?'play':'pause')}</button>`}</div>${phZoomRow()}`}
  if(G.step==='place'){const gh=UI.ghost,t=G.cur.t,r=gh?gh.r:PHN.rot,n=UI.cells.length;
    return `<div class="ps-row r1"><div class="ps-tile">${tileCard(t,r,1)}</div><div class="ps-mid"><b>${esc(phCap(tileWords(t)))}</b><span>${n} spot${n===1?'':'s'} fit${n===1?'s':''}${V3.on&&PHN.groups().length>1?` (${PHN.groups().length} places: tap Next)`:''} · ${tilesLeft()?tilesLeft()+' more after this':'last tile!'}${G.cur.bonus?' · mason’s extra turn':''}</span></div><div class="ph-rb"><button class="pb sq" data-ph="rot" data-d="-1" aria-label="Turn tile left">${phI('rotl')}</button><button class="pb sq" data-ph="rot" data-d="1" aria-label="Turn tile right">${phI('rotr')}</button></div></div>${phZoomRow()}<div class="ps-hint">${hint?esc(hint):phLastOther()||'Tap a glowing square to try your tile there.'}</div>`}
  if(G.step==='fig')return `<div class="ps-row"><div class="ps-msg"><b>Place a follower?</b><span>${hp.sup.f} left${G.cur.bonus?' · extra turn':''}</span></div><button class="pb pri" data-ph="figshow">Choose</button><button class="pb" data-mv='{"act":"skip"}'>Skip</button></div>${phZoomRow()}<div class="ps-hint">${hint?esc(hint):''}</div>`;
  return ''}
function phPopHTML(){if(!G)return '';if(PHN.cards.length)return '';const hp=me();
  if(PHN.pop==='menu')return phMenuPopup();if(PHN.pop==='info')return phInfoPopup()||'';
  if(hp&&G.step==='place'&&UI.ghost)return phPlacePopup(hp);
  if(hp&&G.step==='fig'&&PHN.figHide!==G.turn+':'+G.step)return phFigPopup(hp);return ''}
function phCoachTip(){if(!UI.guide||!G||!me()||UI.modal||PHN.cards.length)return;const hp=me(),k=(x)=>'ph_'+x;const tk=G.turn+':'+G.step;const once=(key,txt)=>{if(UI.seen[k(key)]||PHN.tipK===tk)return false;PHN.tipK=tk;UI.seen[k(key)]=G.turn;saveSeen();PHN.add(phCoachCard(key,txt));return true};
  if(G.step==='place'){once('place',`<b>Goal:</b> most points when the tiles run out (“end” = the score if it ended now). Tap a glowing square to try your tile: edges must match${G.rv?', river to river':''}.`);
    if(hp.sup.f===0)once('nof','<b>No followers left.</b> They come home when their road, town or priory is finished (farmers never do), so try to finish what you started.')}
  else if(G.step==='fig'){once('fig','You may put ONE follower on the tile you just laid, only where nobody stands yet. It scores and comes home when its road, town or priory is finished. Skip if you want to keep it.');
    const ms=figMoves(hp.i).filter(m=>m.act==='fig');if(ms.some(m=>TSEG[G.tiles[G.cur.k].t][m.l].ty==='F'))once('farm','<b>Farmers</b> never come home. At the end a field pays 3 per finished town it touches to whoever has most farmers there.');
    if(ms.some(m=>m.k==='big'))once('big','<b>Champion:</b> counts as two followers.');if(ms.some(m=>m.k==='bld'))once('bld','<b>Mason:</b> goes where you already have a follower; extend that road or town later for an extra turn.');if(ms.some(m=>m.k==='pig'))once('pig','<b>Hog:</b> joins your farmer; the field pays 4 per town instead of 3.');
    if(hp.sup.f>0&&hp.sup.f<=2)once('few','You have only '+hp.sup.f+' follower'+(hp.sup.f>1?'s':'')+' left: keep one for a road or town you can finish soon.')}}
Object.assign(PHN,{
  render(force){if(!this.on)return;const ps=document.getElementById('ps');if(!ps)return;
    if(!G){return}
    if(G.turn<this.lastTurn||G.pl.length!==this.np){this.reset()}this.lastTurn=G.turn;this.np=G.pl.length;
    // end of game: the final count as cards, once
    const ek=(G.over?G.turn+':'+G.winText:'');if(ek&&this.endKey!==ek){this.endKey=ek;for(const c of phEndCards())this.add(c)}
    if(UI.ghost)this.rot=UI.ghost.r;
    // a new decision for me closes an info / menu pop-up left open from before
    {const sk=me()?G.turn+':'+G.step:'';if(sk&&this.stepK!==sk&&this.pop){this.pop=null;this.info=null}this.stepK=sk}
    // pop-ups that no longer apply close by themselves
    if(this.pop==='info'&&(!this.info||!G.tiles[this.info.k]))this.pop=null;
    if(G.step!=='fig'||!me()){if(this.figHide)this.figHide=''}
    // my turn: bring the new tile's spots / rings into view
    const hp=me();const fk=hp&&G.step==='fig'?G.turn+':fig':'';if(fk&&this.figK!==fk&&V3.on&&!this.cards.length){this.figK=fk;this.figFrame()}if(!fk)this.figK='';
    if(hp&&G.step==='place'&&this.figZ&&V3.on){this.figZ=false;this.gi=0;fitAll(false)}
    if(hp&&G.step==='place'&&!UI.ghost&&!this.cards.length){const L=legalPlacements(G.cur.t);if(L.length&&L.every(q=>q.x===L[0].x&&q.y===L[0].y)){const k=key(L[0].x,L[0].y);UI.ghost={k,r:L[0].r,rots:L.map(q=>q.r),t:G.cur.t,turn:G.turn};if(typeof syncOverlays==='function'&&V3.on)syncOverlays()}}
    phCoachTip();
    const card=this.cards[0];const ch=card?card.h:'';const pc=document.getElementById('pc');
    if(card&&card.root!=null&&this.focusK!==card.id){this.focusK=card.id;this.focusFeat(card.root)}if(!card)this.focusK='';
    {const hl=card&&card.hl||null;if(JSON.stringify(hl)!==JSON.stringify(UI.hl||null)){UI.hl=hl;if(typeof syncOverlays==='function'&&V3.on){syncOverlays();V3.dirty=true}}}
    {const tall=!!(me()&&G.step==='fig'&&!this.cards.length&&this.pop==null&&PHN.figHide!==G.turn+':'+G.step&&figMoves(me().i).filter(m=>m.act==='fig'&&m.k===UI.kind).length>2);document.documentElement.classList.toggle('ph-tall',tall)}
    {const pcs=document.getElementById('pchips');if(pc&&pcs&&PH_TOP()&&card&&card.by!=null){pc.style.top=pcs.offsetHeight+'px'}else if(pc)pc.style.top=''}
    if(ch!==this.cardH||force){if(ch&&ch!==this.cardH)this.cardAt=Date.now();this.cardH=ch;pc.innerHTML=ch;pc.hidden=!ch;pc.classList.toggle('in',!!ch)}
    const chips=phChips();if(chips!==this.chips){this.chips=chips;document.getElementById('pchips').innerHTML=chips}
    const bar=phBarHTML();if(bar!==this.bar){this.bar=bar;document.getElementById('pbar').innerHTML=bar}
    const sh=phStripHTML();if(sh!==this.strip){this.strip=sh;ps.innerHTML=sh}
    const pp=document.getElementById('ppop');const ph=phPopHTML();if(ph!==this.pops){const fresh=!this.pops;this.pops=ph;pp.innerHTML=ph;pp.hidden=!ph;pp.classList.toggle('in',fresh&&!!ph)}
    const ab=document.getElementById('advbtn');if(ab){ab.setAttribute('aria-label','What would the computer do?')}
  },
  init(){Object.assign(ICP,PH_IC);if(!this.on)return;this.render(true)}
});
document.addEventListener('click',e=>{if(!PHN.on)return;const b=e.target.closest('[data-ph],.ph-menu .mi,#ppop [data-gx]');if(!b)return;const a=b.dataset.ph;
  if(!a){if(b.closest('.ph-menu'))setTimeout(()=>{PHN.pop=null;PHN.render(true)},0);return}
  if(a==='menu'){PHN.pop=PHN.pop==='menu'?null:'menu';PHN.info=null;PHN.render(true)}
  else if(a==='pclose'){PHN.pop=null;PHN.info=null;PHN.render(true)}
  else if(a==='figx'){PHN.figHide=G.turn+':'+G.step;PHN.render(true)}
  else if(a==='figshow'){PHN.figHide='';PHN.render(true)}
  else if(a==='cont'){if(AIDELAY>0&&Date.now()-(PHN.cardAt||0)<450)return;PHN.cont()}
  else if(a==='skipall'){PHN.cards=PHN.cards.filter(c=>!c.end||c.final);PHN.render(true)}
  else if(a==='results'){PHN.add(phResultCard());PHN.render(true)}
  else if(a==='rot'){const d=+b.dataset.d;if(UI.ghost)rotGhost(d);else{PHN.rot=(PHN.rot+d+4)%4;PHN.render(true)}}
  else if(a==='zin'){PHN.zoom(1/1.4)}else if(a==='zout'){PHN.zoom(1.4)}else if(a==='all'){fitAll(false,true)}else if(a==='spots')PHN.spots();else if(a==='last')PHN.last()});
document.addEventListener('keydown',e=>{if(!PHN.on||e.key!=='Escape')return;if(GX.open)return;if(PHN.cards.length)return;
  if(PHN.pop){PHN.pop=null;PHN.info=null;PHN.render(true);e.stopImmediatePropagation();return}
  if(G&&me()&&G.step==='fig'&&PHN.figHide!==G.turn+':'+G.step){PHN.figHide=G.turn+':'+G.step;PHN.render(true);e.stopImmediatePropagation()}},true);
