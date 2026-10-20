/* ---------- INVENTORY + LOADOUT (Garage tab FORGE, flag RET.forge; forge.js holds the data and the actions). Phone first: tiles >= 44 px, text >= 14 px.
   Tap an item, then tap a slot (or use the item's buttons); tap a slot first to filter the grid to what fits it. 4 slots: 2 weapons (weapon or hybrid,
   with 2 / 1 mod sockets), 1 ability core, 1 passive. 3 named presets; the pit stop shows a quick preset row. */
const INV=window.INV={f:'all',sort:'type',sel:null,msg:'',a:null,b:null};
{const st=document.createElement('style');st.textContent=`
#gaCards.fgbox{display:block!important;overflow-y:auto;-webkit-overflow-scrolling:touch;font-size:14px}
#gaCards.fgbox .fgs{margin:0 0 12px;padding:8px;border:1px solid rgba(140,134,184,.35);border-radius:10px}
#gaCards.fgbox h4{margin:0 0 6px;font:700 14px var(--mono,monospace);letter-spacing:.08em;color:#19e3ff}
#gaCards.fgbox .fgrow{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
#gaCards.fgbox button.fb{min-height:44px;min-width:44px;padding:4px 10px;font:700 14px var(--mono,monospace);color:#e6e1ff;background:rgba(25,227,255,.08);border:1px solid rgba(25,227,255,.5);border-radius:8px}
#gaCards.fgbox button.fb.on{background:#19e3ff;color:#0b0820}
#gaCards.fgbox button.fb[disabled]{opacity:.45}
#gaCards.fgbox .fglo{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px}
#gaCards.fgbox .fgslot{display:flex;flex-direction:column;gap:4px;padding:6px;border:1px dashed rgba(230,225,255,.4);border-radius:10px;min-height:44px}
#gaCards.fgbox .fgslot.hot{border-style:solid;border-color:#ffe14d}
#gaCards.fgbox .fgslot>button{display:flex;align-items:center;gap:8px;text-align:left;min-height:52px;background:none;border:0;color:#e6e1ff;font:14px var(--mono,monospace);padding:0}
#gaCards.fgbox .fgslot small,#gaCards.fgbox .fgt small{display:block;font-size:14px;color:#a9a3cf;line-height:1.2}
#gaCards.fgbox .fggrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:6px}
#gaCards.fgbox button.fgt{display:flex;flex-direction:column;align-items:center;gap:2px;min-height:96px;min-width:44px;padding:6px 4px;background:rgba(11,8,32,.6);border:1px solid rgba(140,134,184,.45);border-radius:10px;color:#e6e1ff;font:14px var(--mono,monospace);line-height:1.15;overflow-wrap:anywhere;text-align:center}
#gaCards.fgbox button.fgt.sel{border-color:#ffe14d;box-shadow:0 0 0 2px #ffe14d inset}
#gaCards.fgbox button.fgt.no{opacity:.55;border-style:dashed}
#gaCards.fgbox .fgd{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:8px;padding:8px;border-radius:10px;background:rgba(255,225,77,.07)}
#gaCards.fgbox .fgd .tx{flex:1 1 180px;min-width:0}
#gaCards.fgbox select,#gaCards.fgbox input{min-height:44px;font:14px var(--mono,monospace);background:#0b0820;color:#e6e1ff;border:1px solid rgba(140,134,184,.6);border-radius:8px;padding:0 6px;max-width:100%}
#gaCards.fgbox input{width:9.5em}
#gaCards.fgbox small{display:block;font-size:14px;color:#a9a3cf;line-height:1.2}
#gaCards.fgbox .fgmsg{min-height:20px;color:#ffe14d}
#shop .fgq{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center;font:14px var(--mono,monospace);color:#a9a3cf}
#shop .fgq button{min-height:44px;min-width:44px;padding:2px 10px;font:700 14px var(--mono,monospace)}`;document.head.appendChild(st);}
const fgEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
INV.items=function(){const s=FG.st(),L=[];
  for(const id of WP_IDS)if(WP.has(id))L.push({it:'w:'+id,ty:'w',n:WPD[id].n,lv:WP.permOf(id),d:WPD[id].tx,own:1});
  for(const R of FGR)if(s.hy[R[2]])L.push({it:'h:'+R[2],ty:'h',n:R[3].toUpperCase(),lv:FG.hlv(R[2]),d:R[5]+' ('+WPD[R[0]].s+' + '+WPD[R[1]].s+')',own:1});
  for(const M of FGM)L.push({it:'m:'+M[0],ty:'m',n:M[1],lv:s.mods[M[0]]|0,d:M[4],own:(s.mods[M[0]]|0)>0});
  for(const K of FGK)L.push({it:'k:'+K[0],ty:'k',n:K[1],lv:s.cores[K[0]]?1:0,d:K[3]+' (when no power-up runs)',own:!!s.cores[K[0]]});
  for(const p of FGP)L.push({it:'p:'+p[0],ty:'p',n:p[1],lv:s.pas[p[0]]?1:0,d:p[2],own:!!s.pas[p[0]]});
  const f=this.f,F=L.filter(x=>f==='all'||(f==='k'?x.ty==='k'||x.ty==='p':x.ty===f)),O='whmkp';
  F.sort(this.sort==='name'?(a,b)=>a.n.localeCompare(b.n):this.sort==='level'?(a,b)=>b.lv-a.lv||O.indexOf(a.ty)-O.indexOf(b.ty):(a,b)=>O.indexOf(a.ty)-O.indexOf(b.ty)||(b.own-a.own));return F;};
INV.say=function(m){this.msg=m||'';};
INV.act=function(fn){const m=fn();this.say(m||'');gaDraw();};
INV.tapSlot=function(sl){const x=this.sel,ty=x&&x.split(':')[0],id=x&&x.split(':')[1];
  if(x&&(sl===0||sl===1)&&(ty==='w'||ty==='h'))return this.act(()=>FG.equip(sl,ty==='w'?id:x));
  if(x&&(sl===0||sl===1)&&ty==='m')return this.act(()=>FG.socket(sl,id));
  if(x&&sl==='core'&&ty==='k')return this.act(()=>FG.st().cores[id]?FG.equip('core',id):'Craft it first');
  if(x&&sl==='pas'&&ty==='p')return this.act(()=>FG.st().pas[id]?FG.equip('pas',id):'Craft it first');
  this.f=sl==='core'?'k':sl==='pas'?'k':x&&ty==='m'?'m':'all';this.sel=null;this.say(sl==='core'||sl==='pas'?'Pick a core or passive below':'Pick a weapon, hybrid or mod below, then tap the slot');gaDraw();};
INV.slotHtml=function(sl){const s=FG.st(),lo=s.lo;let it=null,n='EMPTY',sub=sl===0?'WEAPON SLOT 1':sl===1?'WEAPON SLOT 2':sl==='core'?'ABILITY CORE':'PASSIVE';
  if(sl===0||sl===1){const w=lo.w[sl];if(w){it=w.startsWith('h:')?w:'w:'+w;n=w.startsWith('h:')?FG.rid(w.slice(2))[3].toUpperCase()+' LV'+FG.hlv(w.slice(2)):WPD[w].n;}}
  else{const id=sl==='core'?lo.core:lo.pas;if(id){it=(sl==='core'?'k:':'p:')+id;n=(sl==='core'?FGK:FGP).find(x=>x[0]===id)[1];}}
  return{it,n,sub};};
INV.draw=function(box){const s=FG.st(),lo=s.lo;FG.sync();box.innerHTML='';const sec=(t,h)=>{const d=document.createElement('div');d.className='fgs';d.innerHTML='<h4>'+t+'</h4>'+(h||'');box.appendChild(d);return d;};
  const top=sec('FORGE · SCRAP '+s.scrap,'<div class="fgmsg" id="fgMsg">'+fgEsc(this.msg||'Forge two weapons into a hybrid, slot mods, save builds.')+'</div>');top.id='fgTop';
  // loadout
  const L=sec('LOADOUT');const g=document.createElement('div');g.className='fglo';L.appendChild(g);
  for(const sl of[0,1,'core','pas']){const q=this.slotHtml(sl),d=document.createElement('div');d.className='fgslot';d.dataset.slot=sl;
    const b=document.createElement('button');b.type='button';b.className='fgsb';b.innerHTML=`<canvas width="44" height="44" style="width:44px;height:44px;flex:0 0 44px"></canvas><span><small>${q.sub}</small>${fgEsc(q.n)}</span>`;
    if(q.it)FG.icon(b.querySelector('canvas').getContext('2d'),q.it,44);b.addEventListener('click',()=>this.tapSlot(sl));d.appendChild(b);
    if(sl===0||sl===1){const r=document.createElement('div');r.className='fgrow';const n=FG.sockets(lo.w[sl]);
      for(let i=0;i<n;i++){const m=(lo.m[sl]||[])[i],k=document.createElement('button');k.type='button';k.className='fb';k.textContent=m?FGM.find(x=>x[0]===m)[1]:'+ MOD';
        k.addEventListener('click',()=>{if(m)this.act(()=>FG.socket(sl,m));else{this.f='m';this.sel=null;this.say('Pick a mod, then tap SOCKET '+(sl+1));gaDraw();}});r.appendChild(k);}d.appendChild(r);}
    g.appendChild(d);}
  // presets
  const Pr=sec('PRESETS');for(let i=0;i<3;i++){const p=s.pre[i],r=document.createElement('div');r.className='fgrow';r.style.marginBottom='4px';
    r.innerHTML=`<input maxlength="14" aria-label="preset ${i+1} name" value="${fgEsc(p?p.n:'BUILD '+(i+1))}"><button type="button" class="fb" data-a="load"${p?'':' disabled'}>LOAD</button><button type="button" class="fb" data-a="save">SAVE</button>`;
    r.querySelector('[data-a=load]').addEventListener('click',()=>this.act(()=>FG.usePre(i)||(this.say((p?p.n:'')+' loaded'),this.msg)));
    r.querySelector('[data-a=save]').addEventListener('click',()=>{const n=r.querySelector('input').value;this.act(()=>FG.savePre(i,n)||'Saved to '+(n||'BUILD '+(i+1)));});Pr.appendChild(r);}
  // forge
  const own=WP_IDS.filter(id=>WP.has(id));if(!own.includes(this.a))this.a=own[0];if(!own.includes(this.b)||this.b===this.a)this.b=own.find(id=>id!==this.a&&FG.rec(this.a,id))||own.find(id=>id!==this.a)||null;
  const Fo=sec('FORGE A HYBRID ('+Object.keys(s.hy).length+'/'+FGR.length+')');const opt=(sel,ex)=>own.map(id=>`<option value="${id}"${id===sel?' selected':''}>${WPD[id].n}${ex&&id!==ex&&FG.rec(ex,id)?' ★':''}</option>`).join('');
  const R=this.a&&this.b?FG.rec(this.a,this.b):null,why=FG.canForge(this.a,this.b);
  Fo.insertAdjacentHTML('beforeend',`<div class="fgrow"><select id="fgA" aria-label="first weapon">${opt(this.a)}</select><span>+</span><select id="fgB" aria-label="second weapon">${opt(this.b,this.a)}</select></div>
    <div class="fgd"><canvas width="56" height="56" id="fgPrev" style="width:56px;height:56px"></canvas><div class="tx">${R?'<b>'+R[3].toUpperCase()+'</b><small>'+R[5]+'</small><small>'+FG_COST.scrap+' scrap + '+FG_COST.neon+' Neon · parents stay</small>':'<small>No recipe for this pair. ★ marks partners with a recipe.</small>'}</div><button type="button" class="fb" id="fgGo"${why?' disabled':''}>FORGE</button></div>`);
  if(R)FG.icon(Fo.querySelector('#fgPrev').getContext('2d'),'h:'+R[2],56);
  Fo.querySelector('#fgA').addEventListener('change',e=>{this.a=e.target.value;this.b=null;gaDraw();});Fo.querySelector('#fgB').addEventListener('change',e=>{this.b=e.target.value;gaDraw();});
  Fo.querySelector('#fgGo').addEventListener('click',()=>this.act(()=>FG.forge(this.a,this.b)||(R[3]+' forged: tap it below, then a weapon slot')));
  if(why&&R)Fo.insertAdjacentHTML('beforeend','<small>'+why+'</small>');
  // inventory grid
  const I=sec('INVENTORY');const fr=document.createElement('div');fr.className='fgrow';fr.style.marginBottom='6px';
  for(const[k,l]of[['all','ALL'],['w','WEAPONS'],['h','HYBRIDS'],['m','MODS'],['k','CORES']]){const b=document.createElement('button');b.type='button';b.className='fb'+(this.f===k?' on':'');b.textContent=l;b.addEventListener('click',()=>{this.f=k;gaDraw();});fr.appendChild(b);}
  const so=document.createElement('button');so.type='button';so.className='fb';so.textContent='SORT: '+this.sort.toUpperCase();so.addEventListener('click',()=>{this.sort={type:'level',level:'name',name:'type'}[this.sort];gaDraw();});fr.appendChild(so);I.appendChild(fr);
  const grid=document.createElement('div');grid.className='fggrid';I.appendChild(grid);const items=this.items();
  for(const x of items){const b=document.createElement('button');b.type='button';b.className='fgt'+(this.sel===x.it?' sel':'')+(x.own?'':' no');b.dataset.it=x.it;
    const sub=x.ty==='m'?(x.own?'x'+x.lv+(FG.used(x.it.slice(2))?' · '+FG.used(x.it.slice(2))+' in use':''):'CRAFT '+FG_MODC):(x.ty==='k'||x.ty==='p')?(x.own?'OWNED':'CRAFT '+FG_CORC):'LV'+x.lv;
    b.innerHTML=`<canvas width="40" height="40" style="width:40px;height:40px"></canvas><span>${fgEsc(x.n)}</span><small>${sub}</small>`;FG.icon(b.querySelector('canvas').getContext('2d'),x.it,40);
    b.addEventListener('click',()=>{this.sel=this.sel===x.it?null:x.it;this.say('');gaDraw();});grid.appendChild(b);}
  // detail of the selected item
  const x=items.find(q=>q.it===this.sel)||(this.sel&&this.items.call({f:'all',sort:'type'}).find(q=>q.it===this.sel));
  if(x){const d=document.createElement('div');d.className='fgd';d.id='fgDet';const ty=x.ty,id=x.it.slice(2),B=[];
    if(ty==='w'||ty==='h'){B.push(['TO SLOT 1',()=>FG.equip(0,ty==='w'?id:x.it)],['TO SLOT 2',()=>FG.equip(1,ty==='w'?id:x.it)]);
      if(ty==='h'){const lv=FG.hlv(id);if(lv<FG_MAXLV)B.push(['LEVEL UP ('+FG.lvCost(id)+')',()=>FG.levelUp(id)]);B.push(['SCRAP +'+(1+lv),()=>FG.scrapIt('h',id)]);}}
    else if(ty==='m'){if(x.own)B.push(['SOCKET 1',()=>FG.socket(0,id)],['SOCKET 2',()=>FG.socket(1,id)],['SELL +30',()=>FG.scrapIt('m',id)]);B.push(['CRAFT ('+FG_MODC+')',()=>FG.craft('m',id)]);}
    else{if(x.own)B.push([(ty==='k'?FG.st().lo.core:FG.st().lo.pas)===id?'UNEQUIP':'EQUIP',()=>FG.equip(ty==='k'?'core':'pas',id)],['SCRAP +2',()=>FG.scrapIt(ty,id)]);else B.push(['CRAFT ('+FG_CORC+')',()=>FG.craft(ty,id)]);}
    d.innerHTML=`<div class="tx"><b>${fgEsc(x.n)}</b><small>${fgEsc(x.d)}</small></div>`;
    for(const[l,f]of B){const b=document.createElement('button');b.type='button';b.className='fb';b.textContent=l;b.addEventListener('click',()=>this.act(f));d.appendChild(b);}
    I.insertBefore(d,grid);}
  for(const d of box.querySelectorAll('.fgslot'))d.classList.toggle('hot',!!this.sel);};
/* the Garage tab and the gaDraw route */
{const tb=garageEl.querySelector('.tabs'),b=document.createElement('button');b.className='go dim';b.dataset.t='forge';b.type='button';b.textContent='FORGE';b.hidden=!FG.on;
 b.addEventListener('click',()=>{GA.tab='forge';gaDraw();});tb.appendChild(b);
 const g0=gaDraw;gaDraw=function(){const box=$('gaCards');if(GA.tab!=='forge'||!FG.on){box.classList.remove('fgbox');return g0.apply(this,arguments);}
   if(garageEl.hidden&&typeof labEl!=='undefined'&&labEl&&!labEl.hidden){garageDirty=true;return;}
   $('gaBank').innerHTML=neonI+' <b id="gaBankN">'+GA.bank+'</b>';for(const q of garageEl.querySelectorAll('.tabs button'))q.classList.toggle('on',q.dataset.t===GA.tab);
   const gp=$('gaPic');if(gp)gp.style.display='none';box.classList.remove('tune','wpt');box.classList.add('fgbox');const y=box.scrollTop;INV.draw(box);box.scrollTop=y;};}
/* pit stop: quick preset swap */
{const q=document.createElement('div');q.className='fgq';q.id='fgQuick';q.hidden=true;const bot=shopEl.querySelector('.bot');shopEl.insertBefore(q,bot);
 INV.pit=function(){const s=FG.st();q.hidden=!FG.on||!s.pre.some(Boolean);if(q.hidden)return;q.innerHTML='<span>BUILD</span>';
   s.pre.forEach((p,i)=>{if(!p)return;const b=document.createElement('button');b.type='button';b.className='go dim';b.textContent=p.n;b.addEventListener('click',e=>{e.stopPropagation();const m=FG.usePre(i);if(typeof floater==='function'&&!m)floater(P.x,P.y-30,p.n,'#ffe14d');for(const o of q.querySelectorAll('button'))o.classList.toggle('on',o===b);});q.appendChild(b);});};
 NR.on('pitStart',()=>INV.pit());}
window.__inv={INV,draw:()=>gaDraw(),open:f=>openGarage(f),close:()=>closeGarage()};          // test hook
