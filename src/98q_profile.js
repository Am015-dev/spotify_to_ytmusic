// ---- GPF: 2K-style driver PROFILE (slice 3). Extends the pause-menu profile (71 profileOpen): driver portrait, VEHICLES collection with
// Neat…Super Awesome rarity, owned/locked and upgrade pips, perk slots with what unlocks next, and a COLLECTION grid. Also opens from the title menu.
function GPF_veh(){const G=GAR_get();return GAR_SETS.map(S=>{const own=GAR_owned(S),[tn,tc]=GAR_TIER[S.tier],u=GAR_ups(S.id),lv=GAR_UP.reduce((a,[k])=>a+u[k],0);
 return`<div class="gpfV ${own?'':'lk'}" style="--tc:${tc}"><em>${tn}</em><b>${own?'':'🔒 '}${S.n}</b><small>${(typeof GPK_GRP!=='undefined'&&GPK_GRP[S.id])||''}${S.id===G.sel?' · driving':''}</small><small>${own?'Upgrades '+'●'.repeat(Math.ceil(lv/4))+'○'.repeat(3-Math.ceil(lv/4))+' '+lv+'/12':gbReqTxt(S.req)}</small></div>`}).join('')}
function GPF_col(){const nOwn=GAR_SETS.filter(GAR_owned).length,lv=GB_PATS.filter(([id,,r])=>gbReq(r,'pat_'+id)).length,hn=GB_HORNS.filter(([id,,r])=>gbReq(r,'horn_'+id)).length,
 parts=Object.values(GB_PARTS).reduce((a,l)=>a+l.length,0),pOwn=Object.values(GB_PARTS).reduce((a,l)=>a+l.filter(([id,,r])=>gbReq(r,id)).length,0),pk=store.get('mho_packs',[]).length,pu=PERKS.filter(perkUnlocked).length;
 const t=(i,n,v,m)=>`<div class="gpfC"><i>${i}</i><b>${v}/${m}</b><small>${n}</small></div>`;
 return t('🚗','vehicles',nOwn,GAR_SETS.length)+t('🧑','drivers',GAR_PRE.length,GAR_PRE.length)+t('⭐','perks',pu,PERKS.length)+t('🎨','liveries',lv,GB_PATS.length)+t('📯','horns',hn,GB_HORNS.length)+t('🔧','parts',pOwn,parts)+t('📦','brick packs',pk,12)}
function GPF_perks(){const L=carStat().lvl,n=perkSlots(),e=perkEq0(),nx=PERKS.filter(p=>p.lvl&&p.lvl>L).sort((a,b)=>a.lvl-b.lvl)[0];
 return`<h5>PERKS · CLASS ${drvClass()} · ${n}/3 SLOTS</h5><div class="pperks">${[0,1,2].map(i=>{const p=e[i]&&PERKS.find(q=>q.id===e[i]);return i<n?(p?`<span><i>${p.icon}</i>${p.name}</span>`:'<span class="gpfE">＋ empty</span>'):`<span class="gpfE">🔒 level ${i===1?10:20}</span>`}).join('')}</div><small>${nx?`Next: ${nx.icon} ${nx.name} at level ${nx.lvl}. `:''}Equip perks in the garage (RIDES tab).</small>`}
profileOpen=(f=>function(){f();const B=$('#pfBody');if(!B)return;
 const d=B.querySelector('.pcard.drv');if(d&&!d.querySelector('.gpfFig')){const im=document.createElement('img');im.className='gpfFig';im.src=GB_portrait();d.insertBefore(im,d.firstChild)}
 for(const c of B.querySelectorAll('.pcard')){const h=(c.querySelector('h5')||{}).textContent||'';
  if(h.startsWith('CAR ·'))c.innerHTML=`<h5>VEHICLES · ${GAR_SETS.filter(GAR_owned).length}/${GAR_SETS.length} OWNED</h5><div class="gpfVs">${GPF_veh()}</div><small class="pnote">Buy, drive and upgrade them in the garage (RIDES).</small>`;
  else if(h.startsWith('PERKS'))c.innerHTML=GPF_perks();
  else if(h.startsWith('COLLECTION'))c.innerHTML=`<h5>COLLECTION</h5><div class="gpfCs">${GPF_col()}</div>`}
 // phone fold: the PERKS card (slots + Next unlock) goes to the top of its column, above VEHICLES
 const pc=[...B.querySelectorAll('.pcard')].find(c=>((c.querySelector('h5')||{}).textContent||'').startsWith('PERKS')),vc=[...B.querySelectorAll('.pcard')].find(c=>((c.querySelector('h5')||{}).textContent||'').startsWith('VEHICLES'));
 if(pc&&vc&&vc.parentNode&&pc.compareDocumentPosition(vc)&Node.DOCUMENT_POSITION_PRECEDING)vc.parentNode.insertBefore(pc,vc)
 const P=$('#profile');if(state!=='roam'){P.classList.add('gpfMenu')}else P.classList.remove('gpfMenu')})(profileOpen);
{const P=$('#profile');document.body.appendChild(P);
 const st=document.createElement('style');st.textContent=`#profile{position:fixed!important;z-index:40!important}.gpfFig{width:64px;height:64px;border-radius:12px;border:3px solid #141413;background:#cfe8ff;flex:none}
.gpfVs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.gpfV{border:3px solid var(--tc);border-radius:10px;padding:4px 8px;background:#f6f4ff}.gpfV.lk{opacity:.6}
.gpfV em{display:block;font:900 12px system-ui;font-style:normal;color:var(--tc);letter-spacing:.04em}.gpfV b{display:block;font:900 13px system-ui}
.gpfCs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.gpfC{text-align:center;border:2px solid #141413;border-radius:10px;padding:4px 2px;background:#fff7d1}.gpfC i{font-style:normal;font-size:18px;display:block}.gpfC b{display:block;font:900 14px system-ui}
.gpfE{opacity:.6}#profile .pstats small,#profile .lvl small{font-size:12px!important}`;document.head.appendChild(st);
 const tb=$('#topBtns');if(tb){const b=document.createElement('button');b.id='gpfBtn';b.textContent='👤 PROFILE';b.onclick=()=>{try{AU.sfx('pick')}catch(e){}profileOpen()};tb.insertBefore(b,tb.firstChild)}}
// the "New in vX" bubble (z 8999) covered the garage tabs and the profile ✕ on the phone: hide it while the garage or profile is open
{const upd=()=>document.body.classList.toggle('gpfHideNew',!$('#gbx').hidden||!$('#profile').hidden),mo=new MutationObserver(upd);for(const s of['#gbx','#profile'])mo.observe($(s),{attributes:true,attributeFilter:['hidden']});
 const st=document.createElement('style');st.textContent='body.gpfHideNew #odNew{display:none!important}';document.head.appendChild(st);upd()}
