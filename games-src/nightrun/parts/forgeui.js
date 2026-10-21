/* ---------- FORGE SCREEN, step by step (flag RET.forgeui, default ON; ?forgeui=0 = the old inventory.js screen). Owner, 21 Oct 2026: "Forge of weapons is very
   confusing, needs better user interface." Same rules, costs and data as forge.js (24 hybrids, 12 mods, cores, passives, presets); this file only draws.
   Three zones: FORGE (slot A + slot B = output, live preview, MERGE, UNDO), INVENTORY (big cards, chips: type / equipped / sort by tier), LOADOUT (2 weapon
   slots with mod sockets, core, passive, presets). Tap a card, then a slot; or tap a slot first, then a card. The selected card gets an action bar with
   every action spelled out. UNDO gives back the exact cost of the last merge (until the next run starts). Stable hooks for lessons (lessons.js, W63):
   data-lesson = forge-zone, forge-slot-a, forge-slot-b, forge-out, forge-merge, forge-undo, forge-preview, forge-inventory, forge-filter, loadout, loadout-slot.
   Placeholder shapes only (FG.icon); picture ids in ASSETS-NEEDED-3.md (fgui-*). Test: nightrun/forgeui-test.js. */
if(RET.forgeui===undefined)RET.forgeui=!/[?&]forgeui=0/.test(location.search);
/* what each trait / weapon is good against (one short phrase each) and which stage roster kinds (dir.js ROSTER.kinds) it answers */
const FU_GOOD={px:'foes in a line',rc:'foes at the edges',hk:'fast dodgers',seeds:'swarms',burst:'swarms',nova:'packed groups',ring:'foes close to you',grav:'scattered packs',
  trail:'foes that chase you',zp:'packs of weak foes',zp2:'packs of weak foes',sp:'big crowds',wob:'weaving foes',rad:'small fast foes'};
const FU_WGOOD={pulse:'swarms',laser:'foes in a line',swarm:'fast dodgers',beat:'tough single foes',arc:'packs of weak foes',orbit:'foes that get close',disc:'foes at the edges',
  mine:'foes that chase you',frost:'fast chargers',flame:'foes up close',wave:'bullet storms',shell:'swarms',drone:'any foe, twice',well:'scattered packs',rail:'tough single foes',storm:'foes behind you'};
const FU_KIND={swarm:{t:'seeds burst nova ring sp rad zp zp2',w:'pulse arc flame shell wave storm'},charger:{t:'px nova trail grav',w:'laser beat rail mine well frost'},
  flank:{t:'rc hk wob',w:'swarm orbit disc drone'},mine:{t:'px rc zp',w:'laser arc frost rail'}};
const FU_FX=['seeds','trail','ring','nova','burst','zp','zp2','sp','grav','wob','rad'];
const FGU=window.FGU={a:null,b:null,arm:null,undo:null,
  ty(it){return it?it.split(':')[0]:'';},id(it){return it?it.slice(it.indexOf(':')+1):'';},
  name(it){const t=this.ty(it),id=this.id(it);return t==='w'?WPD[id].n:t==='h'?FG.rid(id)[3].toUpperCase():t==='m'?FGM.find(x=>x[0]===id)[1]:t==='k'?FGK.find(x=>x[0]===id)[1]:FGP.find(x=>x[0]===id)[1];},
  // display stats of a weapon or hybrid item (no mods): damage %, pierce, bounce, seeking, extra effects
  stats(it){const o={dmg:100,px:0,rc:0,hk:0,fx:0};if(!it)return o;if(this.ty(it)!=='h')return o;const R=FG.rid(this.id(it));if(!R)return o;
    o.dmg=Math.round(FG.hk(R)*100);const t=R[4];o.px=t.px|0;o.rc=t.rc|0;o.hk=t.hk?1:0;for(const k of FU_FX)if(t[k])o.fx++;return o;},
  good(it){const t=this.ty(it),id=this.id(it);if(t==='w')return FU_WGOOD[id]||'';if(t!=='h')return'';const R=FG.rid(id);if(!R)return'';
    const L=[];for(const k in R[4])if(FU_GOOD[k]&&!L.includes(FU_GOOD[k]))L.push(FU_GOOD[k]);return L.slice(0,2).join(', ');},
  // the next story stage without stars, and the items that answer its two enemy kinds best (badge on the cards)
  stage(){if(typeof sSave!=='object')return 0;for(let n=1;n<=40;n++)if(!sSave.stars[n])return n;return 40;},
  recs(){const n=this.stage(),key=n+'/'+FG.ver+'/'+Object.keys(WP.pl||{}).join();if(this._rk===key)return this._rs;this._rk=key;this._rs=new Set();
    if(!n||!window.ROSTER||!ROSTER.kinds)return this._rs;const K=ROSTER.kinds(n),s=FG.st(),sc=[];
    const score=(w,tr)=>K.reduce((a,k,i)=>{const q=FU_KIND[k];if(!q)return a;let v=0;if(w&&q.w.split(' ').includes(w))v+=1;for(const t in tr||{})if(q.t.split(' ').includes(t))v+=1;return a+v*(i?1:2);},0);
    for(const id of WP_IDS)if(WP.has(id))sc.push(['w:'+id,score(id,null)]);
    for(const R of FGR)if(s.hy[R[2]])sc.push(['h:'+R[2],score(R[0],R[4])+.5]);
    sc.sort((a,b)=>b[1]-a[1]);for(const[it,v]of sc.slice(0,3))if(v>=2)this._rs.add(it);return this._rs;},
  // the slot the forged hybrid would fire from (it fires its first weapon's volley): the slot holding weapon A, else slot 1
  cmpSlot(a){const lo=FG.st().lo;for(let i=0;i<2;i++)if(FG.owner(lo.w[i])===a)return i;return 0;},
  slotItem(i){const w=FG.st().lo.w[i];return w?(w.startsWith('h:')?w:'w:'+w):null;},
  // why MERGE is off, in plain words ('' = ready)
  why(){const a=this.a,b=this.b,s=FG.st();if(!a&&!b)return'Pick 2 weapons: tap a weapon card, then slot A';if(!a||!b)return'Needs 2 weapons: fill slot '+(a?'B':'A');
    if(a===b)return'Needs 2 different weapons';const R=FG.rec(a,b);if(!R)return'No recipe for '+WPD[a].s+' + '+WPD[b].s+': try a ★ partner';if(s.hy[R[2]])return R[3]+' is already forged';
    if(!WP.has(a)||!WP.has(b))return'Own both weapons first (Garage > WEAPONS)';
    if(GA.bank<FG_COST.neon)return'Not enough Neon: '+GA.bank+' of '+FG_COST.neon;if(s.scrap<FG_COST.scrap)return'Not enough scrap: '+s.scrap+' of '+FG_COST.scrap+' (clear districts and bosses)';
    return FG.canForge(a,b);},
  merge(){const m=this.why();if(m)return m;const s=FG.st(),R=FG.rec(this.a,this.b),lo=JSON.parse(JSON.stringify(s.lo)),bank=GA.bank,scrap=s.scrap;
    const r=FG.forge(this.a,this.b);if(r)return r;this.undo={rid:R[2],bank:bank-GA.bank,scrap:scrap-s.scrap,lo,a:this.a,b:this.b};
    INV.sel='h:'+R[2];this.arm=null;return R[3].toUpperCase()+' forged. Tap SLOT 1 or SLOT 2 below to equip it.';},
  // undo the last merge: the exact cost back, the hybrid gone, the loadout as it was (only while the hybrid was not levelled)
  unmerge(){const u=this.undo,s=FG.st();if(!u)return'Nothing to undo';this.undo=null;if(s.hy[u.rid]!==1)return'Cannot undo: the hybrid was levelled or scrapped';
    delete s.hy[u.rid];s.made=Math.max(0,(s.made|0)-1);if(FG.stat.forged>0)FG.stat.forged--;s.scrap+=u.scrap;GA.bank+=u.bank;try{gsave();}catch(e){}
    s.lo=u.lo;for(let i=0;i<2;i++)if(s.lo.w[i]==='h:'+u.rid)s.lo.w[i]=FG.owner('h:'+u.rid);FG.apply();if(INV.sel==='h:'+u.rid)INV.sel=null;this.a=u.a;this.b=u.b;
    return FG.rid(u.rid)[3]+' undone: '+u.scrap+' scrap and '+u.bank+' Neon back';},
  put(where,it){const t=this.ty(it),id=this.id(it);
    if(where==='a'||where==='b'){if(t!=='w')return'Only plain weapons go in the forge';if(where==='a'){this.a=id;if(this.b===id)this.b=null;}else{this.b=id;if(this.a===id)this.a=null;}
      INV.sel=null;this.arm=null;return this.a&&this.b?'':'Now fill slot '+(this.a?'B':'A');}
    if(where===0||where===1){if(t==='w'||t==='h'){this.arm=null;return FG.equip(where,t==='w'?id:it)||this.name(it)+' in SLOT '+(where+1);}if(t==='m'){this.arm=null;return FG.socket(where,id)||this.name(it)+' socketed in SLOT '+(where+1);}return'Only weapons, hybrids and mods fit here';}
    if(where==='core'){if(t!=='k')return'Only cores fit here';if(!FG.st().cores[id])return'Craft it first';this.arm=null;return FG.equip('core',id);}
    if(where==='pas'){if(t!=='p')return'Only passives fit here';if(!FG.st().pas[id])return'Craft it first';this.arm=null;return FG.equip('pas',id);}
    return'';},
  equipped(it){const lo=FG.st().lo,t=this.ty(it),id=this.id(it);if(t==='w')return lo.w.includes(id);if(t==='h')return lo.w.includes(it);if(t==='m')return FG.used(id)>0;if(t==='k')return lo.core===id;if(t==='p')return lo.pas===id;return false;}};
{const st=document.createElement('style');st.textContent=`
#gaCards.fgbox.fu{font-size:14px;color:#efeaff;padding-bottom:4px}
#gaCards.fu .fu-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:12px}
#gaCards.fu .fu-z{padding:12px;border:1px solid rgba(160,154,210,.45);border-radius:12px;background:rgba(11,8,32,.72);min-width:0}
#gaCards.fu .fu-z>h4{margin:0 0 8px;font:700 16px var(--mono,monospace);letter-spacing:.06em;color:#5cecff;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}
#gaCards.fu .fu-z>h4 span{color:#d6d0f5;font-weight:400;font-size:14px;letter-spacing:0}
#gaCards.fu .fu-steps{display:flex;gap:6px;margin:0 0 8px;flex-wrap:wrap}
#gaCards.fu .fu-steps span{flex:1 1 0;min-width:96px;padding:6px 8px;border-radius:8px;background:#1a1440;color:#d6d0f5;font:700 14px var(--mono,monospace);text-align:center}
#gaCards.fu .fu-steps span.on{background:#ffe14d;color:#0b0820}
#gaCards.fu .fu-msg{min-height:22px;margin:0 0 8px;color:#ffe14d;font-size:14px;line-height:1.35}
#gaCards.fu .fu-wal{color:#d6d0f5;font-size:14px;margin:0 0 8px}
#gaCards.fu .fu-wal b{color:#fff}
#gaCards.fu .fu-forge{display:grid;grid-template-columns:minmax(0,1fr) 22px minmax(0,1fr) 22px minmax(0,1fr);align-items:center;gap:4px}
#gaCards.fu .fu-op{text-align:center;font:700 20px var(--mono,monospace);color:#d6d0f5}
#gaCards.fu button.fu-slot{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:104px;min-width:44px;padding:6px 4px;border:2px dashed #8c86b8;border-radius:12px;background:#120d2e;color:#efeaff;font:700 14px var(--mono,monospace);line-height:1.2;text-align:center;overflow-wrap:anywhere}
#gaCards.fu button.fu-slot.full{border-style:solid;border-color:#5cecff}
#gaCards.fu button.fu-slot.arm{border-style:solid;border-color:#ffe14d;box-shadow:0 0 0 2px #ffe14d inset}
#gaCards.fu button.fu-slot.out{border-color:#3dffb0}
#gaCards.fu .fu-slot small{font:400 14px var(--mono,monospace);color:#d6d0f5}
#gaCards.fu .fu-prev{margin-top:10px;padding:10px;border-radius:10px;background:#1a1440}
#gaCards.fu .fu-prev .hd{display:flex;gap:10px;align-items:center}
#gaCards.fu .fu-prev .hd b{display:block;font-size:16px;color:#fff}
#gaCards.fu .fu-prev small,#gaCards.fu .fu-card small,#gaCards.fu .fu-bar small{display:block;font-size:14px;color:#d6d0f5;line-height:1.3}
#gaCards.fu .fu-st{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:4px 10px;margin:8px 0;padding:0;list-style:none}
#gaCards.fu .fu-st li{display:flex;justify-content:space-between;gap:6px;font-size:14px;color:#efeaff}
#gaCards.fu .up{color:#3dffb0;font-weight:700}#gaCards.fu .dn{color:#ff8fa8;font-weight:700}#gaCards.fu .eq0{color:#d6d0f5}
#gaCards.fu .fu-good{color:#5cecff;font-size:14px}
#gaCards.fu .fu-cost{margin:8px 0 0;font-size:14px;color:#efeaff}
#gaCards.fu .fu-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:8px}
#gaCards.fu button.fu-b{min-height:44px;min-width:44px;padding:4px 12px;border-radius:10px;border:1px solid #5cecff;background:#16304a;color:#fff;font:700 14px var(--mono,monospace)}
#gaCards.fu button.fu-b.on{background:#5cecff;color:#0b0820}
#gaCards.fu button.fu-b[disabled]{border-color:#6a6490;background:#241e44;color:#c9c3e6;cursor:not-allowed}
#gaCards.fu button.fu-go{flex:1 1 100%;min-height:56px;border-radius:12px;border:0;background:#3dffb0;color:#0b0820;font:700 18px var(--mono,monospace);letter-spacing:.08em}
#gaCards.fu button.fu-go[disabled]{background:#2a2450;color:#d6d0f5;border:1px dashed #8c86b8}
#gaCards.fu .fu-why{color:#ffd0da;font-size:14px;line-height:1.35;margin-top:6px}
#gaCards.fu .fu-chips{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}
#gaCards.fu .fu-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
#gaCards.fu button.fgt.fu-card{display:grid;grid-template-columns:48px minmax(0,1fr);grid-template-rows:auto;align-items:start;gap:4px 8px;min-height:92px;min-width:44px;padding:8px;border-radius:12px;border:1px solid #6a6490;background:#120d2e;color:#efeaff;font:14px var(--mono,monospace);line-height:1.25;text-align:left;overflow-wrap:anywhere}
#gaCards.fu button.fgt.fu-card.sel{border-color:#ffe14d;box-shadow:0 0 0 2px #ffe14d inset}
#gaCards.fu button.fgt.fu-card.no{border-style:dashed;background:#0d0a22}
#gaCards.fu .fu-card canvas{width:48px;height:48px}
#gaCards.fu .fu-card .n{font-weight:700;color:#fff}
#gaCards.fu .fu-tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:2px}
#gaCards.fu .fu-tag{padding:1px 6px;border-radius:6px;font:700 14px var(--mono,monospace);background:#2a2450;color:#efeaff}
#gaCards.fu .fu-tag.eq{background:#5cecff;color:#0b0820}#gaCards.fu .fu-tag.rec{background:#ffe14d;color:#0b0820}
#gaCards.fu .fu-bar{position:sticky;bottom:0;z-index:2;margin-top:10px;padding:10px;border-radius:12px;background:#231a52;border:2px solid #ffe14d}
#gaCards.fu .fu-bar b{color:#fff}
#gaCards.fu .fu-lo{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}
#gaCards.fu .fgslot.fu-ls{display:flex;flex-direction:column;gap:6px;padding:8px;border:1px dashed #8c86b8;border-radius:12px;min-width:0}
#gaCards.fu .fgslot.fu-ls.arm{border-style:solid;border-color:#ffe14d}
#gaCards.fu .fgslot.fu-ls>button{display:flex;align-items:center;gap:8px;text-align:left;min-height:56px;min-width:44px;background:none;border:0;color:#efeaff;font:700 14px var(--mono,monospace);padding:0;overflow-wrap:anywhere}
#gaCards.fu .fgslot.fu-ls>button small{display:block;font-weight:400;color:#d6d0f5;font-size:14px}
#gaCards.fu input{min-height:44px;font:14px var(--mono,monospace);background:#0b0820;color:#efeaff;border:1px solid #8c86b8;border-radius:8px;padding:0 6px;width:9.5em;max-width:100%}
@media (min-width:900px){#gaCards.fu .fu-grid{grid-template-columns:minmax(0,1.25fr) minmax(0,1fr)}#gaCards.fu .fu-inv{grid-column:1;grid-row:1/span 2}#gaCards.fu .fu-fz{grid-column:2}#gaCards.fu .fu-lz{grid-column:2}
}
@media (min-width:1024px){#gaCards.fgbox.fu,#gaCards.fu *{font-size:16px!important}}`;document.head.appendChild(st);}
/* the screen */
FGU.draw=function(box){const s=FG.st(),lo=s.lo,U=this,own=WP_IDS.filter(id=>WP.has(id));FG.sync();box.classList.add('fu');box.innerHTML='';
  if(this.a&&!own.includes(this.a))this.a=null;if(this.b&&!own.includes(this.b))this.b=null;
  if(!this.a&&!this.b&&!this._init){this._init=1;this.a=own[0]||null;}                              // first visit: weapon 1 already in slot A
  const el=(tag,cls,html,attrs)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;for(const k in attrs||{})e.setAttribute(k,attrs[k]);return e;};
  const btn=(cls,html,fn,attrs)=>{const b=el('button',cls,html,Object.assign({type:'button'},attrs||{}));b.addEventListener('click',fn);return b;};
  const ic=(cv,it,S)=>{if(it)FG.icon(cv.getContext('2d'),it,S);};
  const act=f=>{INV.say(f()||'');gaDraw();};
  const why=this.why(),R=this.a&&this.b&&this.a!==this.b?FG.rec(this.a,this.b):null;
  const step=!this.a||!this.b?1:2;
  const grid=el('div','fu-grid');box.appendChild(grid);
  // ---- FORGE zone
  const Z=el('section','fu-z fu-fz',null,{'data-lesson':'forge-zone',id:'fuForge'});grid.appendChild(Z);
  Z.appendChild(el('h4',null,'FORGE <span>'+Object.keys(s.hy).length+' of '+FGR.length+' hybrids made</span>'));
  const sp=el('div','fu-steps');sp.innerHTML=['1 PICK 2 WEAPONS','2 MERGE','3 EQUIP'].map((t,i)=>'<span class="'+(i+1===step||(i===2&&INV.sel&&INV.sel.startsWith('h:')&&!why)?'on':'')+'">'+t+'</span>').join('');Z.appendChild(sp);
  Z.appendChild(el('div','fu-wal','You have <b id="fuScrap">'+s.scrap+'</b> scrap · <b>'+GA.bank+'</b> Neon'));
  Z.appendChild(el('div','fu-msg',fgEsc(INV.msg||'Tap a weapon card below, then slot A or B. Or tap a slot first.'),{id:'fgMsg',role:'status','aria-live':'polite'}));
  const fr=el('div','fu-forge');Z.appendChild(fr);
  const fslot=(k)=>{const id=k==='a'?this.a:this.b,b=btn('fu-slot'+(id?' full':'')+(this.arm===k?' arm':''),'',()=>{const x=INV.sel;
      if(x&&this.ty(x)==='w')return act(()=>this.put(k,x));if(x)return act(()=>'Only plain weapons go in the forge');
      if(id&&this.arm!==k){if(k==='a')this.a=null;else this.b=null;this.arm=k;return act(()=>'Slot '+k.toUpperCase()+' cleared: tap a weapon card');}
      this.arm=this.arm===k?null:k;INV.f='w';act(()=>this.arm?'Now tap a weapon card for slot '+k.toUpperCase():'');},{id:'fuSlot'+k.toUpperCase(),'data-lesson':'forge-slot-'+k,'aria-label':'forge slot '+k.toUpperCase()});
    b.innerHTML=(id?'<canvas width="48" height="48" style="width:48px;height:48px"></canvas>':'')+'<span>'+(id?fgEsc(WPD[id].s):'SLOT '+k.toUpperCase())+'</span><small>'+(id?'tap to change':'tap, then a weapon')+'</small>';
    if(id)ic(b.querySelector('canvas'),'w:'+id,48);return b;};
  fr.appendChild(fslot('a'));fr.appendChild(el('div','fu-op','+'));fr.appendChild(fslot('b'));fr.appendChild(el('div','fu-op','='));
  const ob=btn('fu-slot out'+(R?' full':''),'',()=>{if(R&&s.hy[R[2]]){INV.sel='h:'+R[2];act(()=>R[3]+' selected: tap SLOT 1 or SLOT 2 in LOADOUT');}else act(()=>why||'Press MERGE to make it');},{id:'fuOut','data-lesson':'forge-out','aria-label':'forge output'});
  ob.innerHTML=R?'<canvas width="48" height="48" style="width:48px;height:48px"></canvas><span>'+fgEsc(R[3].toUpperCase())+'</span><small>'+(s.hy[R[2]]?'owned':'new hybrid')+'</small>':'<span>?</span><small>result</small>';
  if(R)ic(ob.querySelector('canvas'),'h:'+R[2],48);fr.appendChild(ob);
  // partners with a recipe for weapon A
  if(this.a){const P=own.filter(id=>id!==this.a&&FG.rec(this.a,id)),lock=WP_IDS.filter(id=>id!==this.a&&!WP.has(id)&&FG.rec(this.a,id)).length;
    const row=el('div','fu-row');row.appendChild(el('small',null,P.length?'★ Partners for '+fgEsc(WPD[this.a].s)+':':'No owned partner has a recipe with '+fgEsc(WPD[this.a].s)+(lock?' ('+lock+' locked: buy in WEAPONS)':'')));
    for(const id of P){const R2=FG.rec(this.a,id);row.appendChild(btn('fu-b'+(this.b===id?' on':''),'★ '+fgEsc(WPD[id].s)+(s.hy[R2[2]]?' ✓':''),()=>act(()=>this.put('b','w:'+id)),{'aria-label':'partner '+WPD[id].s}));}
    Z.appendChild(row);}
  // live preview
  const pv=el('div','fu-prev',null,{id:'fuPrev','data-lesson':'forge-preview'});Z.appendChild(pv);
  if(R){const it='h:'+R[2],cs=this.cmpSlot(R[0]),cur=this.slotItem(cs),a=this.stats(it),c=this.stats(cur);
    const d=(k,lab,fmt)=>{const v=a[k]-c[k],cl=v>0?'up':v<0?'dn':'eq0';return'<li><span>'+lab+' '+fmt(a[k])+'</span><span class="'+cl+'" data-delta="'+k+'">'+(v>0?'▲ +':v<0?'▼ ':'= ')+(v||'')+(k==='dmg'&&v?'%':'')+'</span></li>';};
    pv.innerHTML='<div class="hd"><canvas width="56" height="56" style="width:56px;height:56px"></canvas><div><b>'+fgEsc(R[3].toUpperCase())+'</b><small>Recipe: '+fgEsc(WPD[R[0]].s+' + '+WPD[R[1]].s)+' · fires like '+fgEsc(WPD[R[0]].s)+'</small></div></div>'
      +'<small>'+fgEsc(R[5])+'</small><small>Compared with SLOT '+(cs+1)+': '+fgEsc(cur?this.name(cur):'empty')+'</small>'
      +'<ul class="fu-st">'+d('dmg','DAMAGE',x=>x+'%')+d('px','PIERCE',x=>x)+d('rc','BOUNCE',x=>x)+d('hk','SEEKING',x=>x?'yes':'no')+d('fx','EFFECTS',x=>x)+'</ul>'
      +'<div class="fu-good">Good against: '+fgEsc(this.good(it))+'</div>';
    ic(pv.querySelector('canvas'),it,56);}
  else pv.innerHTML='<small>'+(this.a&&this.b&&this.a!==this.b?'These two do not merge. ★ marks partners that do.':'Put 2 weapons in A and B to see the hybrid, its stats and what it is good against.')+'</small>';
  pv.appendChild(el('div','fu-cost','Cost: <b>'+FG_COST.scrap+' scrap + '+FG_COST.neon+' Neon</b> · both weapons stay'));
  const gr=el('div','fu-row');pv.appendChild(gr);
  const go=btn('fu-go','MERGE',()=>act(()=>this.merge()),{id:'fuMerge','data-lesson':'forge-merge'});if(why){go.disabled=true;go.setAttribute('aria-describedby','fuWhy');}gr.appendChild(go);
  if(why)pv.appendChild(el('div','fu-why',fgEsc(why),{id:'fuWhy'}));
  if(this.undo){const u=FG.rid(this.undo.rid);gr.appendChild(btn('fu-b','UNDO '+fgEsc(u[3].toUpperCase())+' (get '+this.undo.scrap+' scrap + '+this.undo.bank+' Neon back)',()=>act(()=>this.unmerge()),{id:'fuUndo','data-lesson':'forge-undo'}));}
  // ---- INVENTORY zone
  const I=el('section','fu-z fu-inv',null,{'data-lesson':'forge-inventory',id:'fuInv'});grid.appendChild(I);
  I.appendChild(el('h4',null,'INVENTORY <span>tap a card</span>'));
  const ch=el('div','fu-chips',null,{'data-lesson':'forge-filter'});I.appendChild(ch);
  for(const[k,l]of[['all','ALL'],['w','WEAPONS'],['h','HYBRIDS'],['m','MODS'],['k','CORES'],['eq','EQUIPPED']])ch.appendChild(btn('fu-b'+(INV.f===k?' on':''),l,()=>{INV.f=k;gaDraw();},{'aria-pressed':String(INV.f===k),'data-f':k}));
  ch.appendChild(btn('fu-b','SORT: '+({type:'TYPE',level:'TIER',name:'NAME'})[INV.sort],()=>{INV.sort={type:'level',level:'name',name:'type'}[INV.sort];gaDraw();},{'data-f':'sort'}));
  const rec=this.recs(),stg=this.stage(),all=INV.items.call({f:'all',sort:INV.sort}),items=INV.f==='eq'?all.filter(x=>this.equipped(x.it)):INV.f==='all'?all:INV.items();
  const cg=el('div','fu-cards');I.appendChild(cg);
  if(!items.length)cg.appendChild(el('small',null,'Nothing here yet.'));
  for(const x of items){const eq=this.equipped(x.it),b=btn('fgt fu-card'+(INV.sel===x.it?' sel':'')+(x.own?'':' no'),'',()=>{
      if(this.arm!=null&&x.own){const w=this.arm;return act(()=>this.put(w,x.it));}INV.sel=INV.sel===x.it?null:x.it;act(()=>'');},{'data-it':x.it,'aria-pressed':String(INV.sel===x.it)});
    const sub=x.ty==='m'?(x.own?'owned x'+x.lv:'craft: '+FG_MODC+' scrap'):(x.ty==='k'||x.ty==='p')?(x.own?'owned':'craft: '+FG_CORC+' scrap'):'tier LV'+x.lv;
    const g=this.good(x.it);
    b.innerHTML='<canvas width="48" height="48"></canvas><span><span class="n">'+fgEsc(x.n)+'</span><small>'+sub+(g?' · vs '+fgEsc(g):'')+'</small><span class="fu-tags">'
      +(eq?'<span class="fu-tag eq">EQUIPPED</span>':'')+(rec.has(x.it)?'<span class="fu-tag rec" title="good for the next stage">★ STAGE '+stg+'</span>':'')+'</span></span>';
    ic(b.querySelector('canvas'),x.it,48);cg.appendChild(b);}
  // ---- LOADOUT zone
  const L=el('section','fu-z fu-lz',null,{'data-lesson':'loadout',id:'fuLoad'});grid.appendChild(L);
  L.appendChild(el('h4',null,'LOADOUT <span>on your ship</span>'));const lg=el('div','fu-lo');L.appendChild(lg);
  for(const sl of[0,1,'core','pas']){const q=INV.slotHtml(sl),d=el('div','fgslot fu-ls'+(this.arm===sl?' arm':''),null,{'data-slot':String(sl),'data-lesson':'loadout-slot'});
    const b=btn('fgsb','<canvas width="44" height="44" style="width:44px;height:44px;flex:0 0 44px"></canvas><span><small>'+q.sub+'</small>'+fgEsc(q.n)+'</span>',()=>{const x=INV.sel;
      if(x)return act(()=>{const m=this.put(sl,x);if(!/^Only|^Craft/.test(m||''))INV.sel=null;return m;});
      this.arm=this.arm===sl?null:sl;INV.f=sl==='core'||sl==='pas'?'k':'w';act(()=>this.arm!=null?'Now tap a card for '+q.sub:'');},{'aria-label':q.sub});
    ic(b.querySelector('canvas'),q.it,44);d.appendChild(b);
    if(sl===0||sl===1){const r=el('div','fu-row');const n=FG.sockets(lo.w[sl]);
      for(let i=0;i<n;i++){const m=(lo.m[sl]||[])[i];r.appendChild(btn('fu-b',m?FGM.find(x=>x[0]===m)[1]+' ✕':'+ MOD',()=>{if(m)act(()=>FG.socket(sl,m)||'Mod taken out');else{INV.f='m';this.arm=sl;act(()=>'Tap a mod card for SLOT '+(sl+1));}},{'aria-label':m?'remove mod '+m:'add mod to slot '+(sl+1)}));}
      d.appendChild(r);}
    lg.appendChild(d);}
  const pr=el('div',null,null,{id:'fuPre'});L.appendChild(pr);pr.appendChild(el('small',null,'Saved builds'));
  for(let i=0;i<3;i++){const p=s.pre[i],r=el('div','fu-row');r.innerHTML='<input maxlength="14" aria-label="build '+(i+1)+' name" value="'+fgEsc(p?p.n:'BUILD '+(i+1))+'">';
    const ld=btn('fu-b','LOAD',()=>act(()=>FG.usePre(i)||(p.n+' loaded')));if(!p)ld.disabled=true;r.appendChild(ld);
    r.appendChild(btn('fu-b','SAVE',()=>{const n=r.querySelector('input').value;act(()=>FG.savePre(i,n)||'Saved as '+(n||'BUILD '+(i+1)));}));pr.appendChild(r);}
  // ---- action bar for the selected card
  const x=all.find(q=>q.it===INV.sel);
  if(x){const bar=el('div','fu-bar',null,{id:'fuBar','data-lesson':'forge-actions'}),ty=x.ty,id=x.it.slice(2),B=[];
    if(ty==='w')B.push(['TO FORGE A',()=>this.put('a',x.it)],['TO FORGE B',()=>this.put('b',x.it)]);
    if(ty==='w'||ty==='h')B.push(['EQUIP SLOT 1',()=>{INV.sel=null;return this.put(0,x.it);}],['EQUIP SLOT 2',()=>{INV.sel=null;return this.put(1,x.it);}]);
    if(ty==='h'){const lv=FG.hlv(id);if(lv<FG_MAXLV)B.push(['LEVEL UP: '+FG.lvCost(id)+' scrap',()=>FG.levelUp(id)||'Now LV'+FG.hlv(id)]);B.push(['SCRAP IT: +'+(1+lv)+' scrap',()=>{INV.sel=null;return FG.scrapIt('h',id)||'Scrapped';}]);}
    if(ty==='m'){if(x.own)B.push(['SOCKET SLOT 1',()=>FG.socket(0,id)],['SOCKET SLOT 2',()=>FG.socket(1,id)],['SELL: +30 Neon',()=>FG.scrapIt('m',id)]);B.push(['CRAFT: '+FG_MODC+' scrap',()=>FG.craft('m',id)||'Crafted']);}
    if(ty==='k'||ty==='p'){if(x.own)B.push([(ty==='k'?lo.core:lo.pas)===id?'UNEQUIP':'EQUIP',()=>FG.equip(ty==='k'?'core':'pas',id)],['SCRAP IT: +2 scrap',()=>{INV.sel=null;return FG.scrapIt(ty,id)||'Scrapped';}]);else B.push(['CRAFT: '+FG_CORC+' scrap',()=>FG.craft(ty,id)||'Crafted']);}
    bar.innerHTML='<b>'+fgEsc(x.n)+'</b><small>'+fgEsc(x.d)+'</small>';const r=el('div','fu-row');bar.appendChild(r);
    for(const[l,f]of B)r.appendChild(btn('fu-b',l,()=>act(f)));r.appendChild(btn('fu-b','CLOSE',()=>{INV.sel=null;act(()=>'');},{'aria-label':'deselect'}));
    box.appendChild(bar);}};
{const d0=INV.draw;INV.draw=function(box){if(!RET.forgeui){box.classList.remove('fu');return d0.call(this,box);}return FGU.draw(box);};
 if(RET.forgeui&&INV.f==='all')INV.f='w';}
{const g1=gaDraw;gaDraw=function(){if(GA.tab!=='forge')$('gaCards').classList.remove('fu');return g1.apply(this,arguments);};}
NR.on('runStart',()=>{FGU.undo=null;FGU.arm=null;});
window.__fgu=FGU;
