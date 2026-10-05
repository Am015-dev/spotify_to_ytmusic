// ===================== part 2: the kingdom map (TBKit.map with 6 locations = 3 regions x 2, plus the throne) =====================
const MAP={m:null,sig:'',ov:null,pan:null,hl:[],busyHerald:{},shown:{}};
const LOCPOS=[[290,205],[710,205],[165,610],[165,850],[835,610],[835,850]];
// region labels sit just above the dashed panel of the two side regions: the location circle (and its highlight ring) at the top of the panel used to cover them
const REGBOX=[{x:195,y:110,w:610,h:250,lab:[500,345]},{x:92,y:520,w:280,h:420,lab:[232,504]},{x:628,y:520,w:280,h:420,lab:[768,504]}];
// slot centre of each region strip (the slots belong to the REGION, the kit stores them on the region's first location)
const STRIP=[{cx:500,cy:222,cols:4},{cx:305,cy:730,cols:2},{cx:695,cy:730,cols:2}];
function mapOpts(){const L=[0,1,2,3,4,5].map(i=>({id:LOCID[i],name:LOCN[i],type:LOC_TYPE[i],x:LOCPOS[i][0],y:LOCPOS[i][1],links:[LOCID[i^1],'throne']}));
  return {players:G.pl.map(p=>({faction:FK[p.fac],name:p.name})),locations:L,w:1000,h:1000,trackLen:40,compact:!!UI.phone,quality:(UI.lowGfx||UI.phone)?'low':undefined,seed:7,onTap:mapTap}}
function buildMap(){const wrap=$('#mapwrap');if(!wrap)return;
  let box=$('#mapbox');if(!box){box=document.createElement('div');box.id='mapbox';wrap.appendChild(box)}
  if(!$('#spots')){const sp=document.createElement('div');sp.id='spots';box.appendChild(sp)}
  if(MAP.m){try{MAP.m.destroy()}catch(e){}}
  box.querySelectorAll('svg.tb-map').forEach(e=>e.remove());
  MAP.m=TBKit.map(Object.assign({container:box},mapOpts()));
  box.insertBefore(MAP.m.el,box.firstChild);
  MAP.sig=G.pl.map(p=>p.fac).join()+'|'+(UI.phone?1:0);MAP.ov=null;MAP.pan=null;MAP.shown={};MAP.busyHerald={};
  const svg=MAP.m.el;svg.setAttribute('aria-label','Map of the kingdom: three regions of two locations, and the throne');
  const NSS='http://www.w3.org/2000/svg';
  MAP.pan=document.createElementNS(NSS,'g');MAP.pan.setAttribute('class','tbx-pan');svg.insertBefore(MAP.pan,svg.querySelector('.tb-m-locs'));
  MAP.ov=document.createElementNS(NSS,'g');MAP.ov.setAttribute('class','tbx-ov');MAP.ov.setAttribute('pointer-events','none');svg.appendChild(MAP.ov);
  MAP.sg=document.createElementNS(NSS,'g');MAP.sg.setAttribute('class','tbx-selname');MAP.sg.setAttribute('pointer-events','none');svg.appendChild(MAP.sg);
  svg.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest||t.closest('.tb-loc'))return;const g=t.closest('[data-reg]');if(g&&G&&UI.started)regionTap(+g.getAttribute('data-reg'))});
  drawPanels();relayoutSlots();
  // heralds start "at court" (dimmed, on the throne) until placed
  for(let s=0;s<G.np;s++)MAP.m.setHerald(s,'throne');
  MAP.infl={};for(let s=0;s<G.np;s++){MAP.m.setInfluence(s,G.pl[s].inf,{immediate:true})}
  MAP.heraldAt={};MAP.slotSig={};MAP.slotPrev=null}
function drawPanels(){const f=[];
  REGBOX.forEach((b,r)=>{f.push('<g data-reg="'+r+'"><rect x="'+b.x+'" y="'+b.y+'" width="'+b.w+'" height="'+b.h+'" rx="34" fill="#f4e6b8" fill-opacity=".13" stroke="#e8c867" stroke-opacity=".55" stroke-width="3" stroke-dasharray="4 10" stroke-linecap="round"/>'+
    '<text x="'+b.lab[0]+'" y="'+b.lab[1]+'" text-anchor="middle" font-family="'+TBKit.fonts.display+'" font-weight="700" font-size="22" letter-spacing="3" fill="#f6e6b4" fill-opacity=".85" stroke="#000" stroke-opacity=".6" stroke-width="3" paint-order="stroke">'+esc(REG[r].toUpperCase())+'</text></g>')});
  MAP.pan.innerHTML=f.join('')}
function relayoutSlots(){const m=MAP.m;if(!m)return;const CP=!!UI.phone,sw=CP?44:38,sh=CP?62:54,gap=CP?6:6,n=G.np;
  for(let r=0;r<3;r++){const a=LOCID[2*r],b=LOCID[2*r+1],pa=m.locPos(a),S=STRIP[r];
    const cols=S.cols>=n?n:S.cols,rows=Math.ceil(n/cols);const tw=cols*sw+(cols-1)*gap,th=rows*sh+(rows-1)*gap;
    for(let s=0;s<n;s++){const el=m.slotEl(a,s),el2=m.slotEl(b,s);if(el2)el2.style.display='none';if(!el)continue;
      const c=s%cols,rw=Math.floor(s/cols);const x=S.cx-tw/2+c*(sw+gap),y=S.cy-th/2+rw*(sh+gap);
      el.setAttribute('transform','translate('+Math.round(x-pa.x)+' '+Math.round(y-pa.y)+')');
      el.setAttribute('data-reg',r);el.style.cursor='pointer'}
    const lf=m.locEl(a)&&m.locEl(a).querySelector('.tb-lfx');if(lf)lf.setAttribute('transform','translate('+Math.round(S.cx-pa.x)+' '+Math.round(S.cy-pa.y+ (rows*sh)/2+22)+')')}}
function mapTap(id,info){if(!G||!UI.started)return;
  if(UI.card&&UI.card.kind!=='pass'&&UI.card.kind!=='tip'){bfSkip();return}
  if(UI.pop){closePop(true)}
  if(id==='throne'){openPop('kingdom');return}
  const l=LOCID.indexOf(id);if(l<0)return;
  if(info&&info.seat!=null){regionTap(regOfLoc(l));return}
  locTap(l)}
// ---------------------------------------------------------------- slot content from the (stripped) view
const ownerOf=id=>id<0?-id-1:(id/100)|0;
function slotState(V,r,s){const R=V.reg[r];const up=R.up.filter(id=>ownerOf(id)===s),down=R.down.filter(id=>ownerOf(id)===s);
  const rs=UI.clashRes[r];
  if(up.length){let tot=0;for(const id of up)tot+=TB.cardInfo(G,id).strength;const st={count:up.length,value:tot,faceDown:false};
    if(rs&&rs.winner!=null){if(rs.winner===s)st.winner=true;else if(rs.winner>=0)st.loser=true}return st}
  if(down.length){const st={count:down.length,faceDown:true};const mine=down.find(id=>id>=0);if(mine!=null&&s===vs()){st.card=cardSpec(mine);st.mineId=mine}return st}
  return null}
function renderMap(){if(!G||!UI.started)return;const wrap=$('#mapwrap');if(!wrap)return;
  const sig=G.pl.map(p=>p.fac).join()+'|'+(UI.phone?1:0);
  if(!MAP.m||MAP.sig!==sig||UI.mapReset){buildMap();UI.mapReset=false}
  const m=MAP.m,V=UI.V;
  m.setRound(Math.max(1,G.round),G.rounds);
  // influence
  for(let s=0;s<G.np;s++){const v=G.pl[s].inf;if(m.influence(s)!==v){const p=ANIM&&!UI.noAnim?m.setInfluence(s,v):m.setInfluence(s,v,{immediate:true});if(ANIM&&p&&p.then){UI.busy=true;p.then(()=>{UI.busy=false})}}}
  // heralds (public). unplaced = at court (dimmed)
  for(let s=0;s<G.np;s++){const l=G.pl[s].herald,id=l>=0?LOCID[l]:'throne';const el=m.el.querySelector('.tb-herald[data-seat="'+s+'"]');
    if(MAP.heraldAt[s]!==id){const from=MAP.heraldAt[s];MAP.heraldAt[s]=id;
      if(ANIM&&from&&id!=='throne'&&from!==id&&!UI.noAnim){m.moveHerald(s,id,{hop:260})}else m.setHerald(s,id)}
    if(el)el.style.opacity=l>=0?'1':'.5'}
  // card slots
  let sig2='';const ss=[];for(let r=0;r<3;r++)for(let s=0;s<G.np;s++){const st=slotState(V,r,s);ss.push([r,s,st]);sig2+=JSON.stringify(st)+'|'}
  sig2+=JSON.stringify(UI.clashRes);
  if(sig2!==MAP.slotSig||MAP.slotDirty){MAP.slotSig=sig2;MAP.slotDirty=false;
    const first=!MAP.slotPrev;MAP.slotPrev=MAP.slotPrev||{};
    for(const [r,s,st] of ss){const a=LOCID[2*r];const key=r+'|'+s,js=JSON.stringify(st);if(!first&&MAP.slotPrev[key]!==js&&typeof bfSlot==='function'){try{bfSlot(r,s,MAP.slotPrev[key]?JSON.parse(MAP.slotPrev[key]):null,st)}catch(e){}}MAP.slotPrev[key]=js;m.setSlot(a,s,st);const el=m.slotEl(a,s);if(el){if(st&&st.mineId!=null){el.setAttribute('data-owner',s);el.setAttribute('data-up','1')}else{el.removeAttribute('data-owner');el.removeAttribute('data-up')}}}}
  drawOverlay();applyHl()}
function drawOverlay(){const ov=MAP.ov,m=MAP.m;if(!ov||!m)return;const V=UI.V,f=[];
  // location reward coins (+1 / +2) and a favour disc marker
  for(let l=0;l<6;l++){const p=m.locPos(LOCID[l]),inf=DD.LOCS[l][2],k=UI.phone?1.2:1;
    f.push('<g transform="translate('+(p.x+40*k)+' '+(p.y-40*k)+')"><circle r="'+(UI.phone?19:17)+'" fill="#1b0b10" stroke="#e8c867" stroke-width="2.6"/><text y="8" text-anchor="middle" font-family="'+TBKit.fonts.display+'" font-weight="700" font-size="'+(UI.phone?24:22)+'" fill="#fff0b8">+'+inf+'</text></g>');
    // council marker / favour
    if(l===2){const h=V.fav.h;const col=h>=0?fcol(h):'#e8c867';f.push('<g transform="translate('+(p.x-40*k)+' '+(p.y-40*k)+')"><circle r="'+(UI.phone?18:16)+'" fill="'+col+'" stroke="#fff3c4" stroke-width="2.6"/><path d="M0 -9 L2.6 -2.6 9 -2.6 3.8 1.6 5.8 8 0 4 -5.8 8 -3.8 1.6 -9 -2.6 -2.6 -2.6Z" fill="#fff6d0" stroke="#4a3208" stroke-width="1"/></g>')}
    // Kingdom Cards that sit on a Location
    const kl=V.loc[l].kc.length;if(kl)f.push('<g transform="translate('+(p.x)+' '+(p.y+52)+')"><rect x="-17" y="-12" width="34" height="24" rx="5" fill="#2a1c10" stroke="#e8c867" stroke-width="2"/><text y="7" text-anchor="middle" font-size="18" font-weight="700" fill="#f6e6b4" font-family="'+TBKit.fonts.display+'">K</text></g>')}
  // clash order markers, supporters
  for(let r=0;r<3;r++){const S=STRIP[r],B=REGBOX[r];let ci=V.cord?V.cord.indexOf(r):-1;const oi=(UI.ord||[]).indexOf(r);if(oi>=0&&G.q&&G.q.kind==='clashOrder')ci=oi;
    if(ci>=0){const done=V.reg[r].done,cur=V.clash&&V.clash.r===r;const x=r===0?B.x+34:(r===1?B.x+34:B.x+B.w-34),y=r===0?B.y+34:B.y+34;
      f.push('<g transform="translate('+x+' '+y+')"><circle r="22" fill="'+(cur?'#e8c867':done?'#3a3a3a':'#7c1b2c')+'" stroke="#fff3c4" stroke-width="2.6"/><text y="8.5" text-anchor="middle" font-family="'+TBKit.fonts.display+'" font-weight="700" font-size="24" fill="'+(cur?'#2b1808':'#fff3c4')+'">'+['I','II','III'][ci]+'</text></g>')}
    // supporters: little discs in the faction colour under each slot
    const n=G.np,cols=S.cols>=n?n:S.cols,rows=Math.ceil(n/cols),sw=UI.phone?44:38,sh=UI.phone?62:54,gap=6,tw=cols*sw+(cols-1)*gap,th=rows*sh+(rows-1)*gap;
    for(let s=0;s<n;s++){const sp=V.pl[s].supp,cnt=sp.r[r]+sp.x[r];if(!cnt)continue;const c=s%cols,rw=Math.floor(s/cols);const x=S.cx-tw/2+c*(sw+gap)+sw/2,y=S.cy-th/2+rw*(sh+gap)+sh+(UI.phone?10:9);
      f.push('<g transform="translate('+x+' '+y+')"><circle r="'+(UI.phone?11:10)+'" fill="'+fcol(s)+'" stroke="#fff3c4" stroke-width="2"/><text y="5" text-anchor="middle" font-size="14" font-weight="700" fill="#fff" font-family="'+TBKit.fonts.display+'">'+cnt+'</text></g>')}}
  regionChips(f);
  if(UI.phone&&(UI.bs||0)>=250){ // phones: the kit's banners are hidden, so every location gets a short name tag of its own
    for(let l=0;l<6;l++){const P=LOCPOS[l],name=LOCN[l],fs=36,words=name.split(' ');const lines=name.length>8&&words.length>1?[words[0],words.slice(1).join(' ')]:[name];
      const wd=Math.max(...lines.map(t=>t.length))*fs*.6+18,ht=lines.length*fs+8;const cx=Math.max(wd/2+4,Math.min(996-wd/2,P[0])),top=P[1]+52;
      f.push('<g class="locname"><rect x="'+Math.round(cx-wd/2)+'" y="'+top+'" width="'+Math.round(wd)+'" height="'+ht+'" rx="10" fill="#1d120b" fill-opacity=".82"/>'+lines.map((t,i)=>'<text x="'+Math.round(cx)+'" y="'+Math.round(top+(i+1)*fs-4)+'" text-anchor="middle" font-family="'+TBKit.fonts.display+'" font-weight="700" font-size="'+fs+'" fill="#f6e6b4">'+esc(t)+'</text>').join('')+'</g>')}}
  ov.innerHTML=f.join('')}
function setHl(ids,regs,rec){MAP.hl=ids||[];MAP.hlR=regs||[];MAP.rec=rec||{};applyHl()}
function applyHl(){const m=MAP.m;if(!m)return;const sel=null;m.highlight(MAP.hl.map(l=>LOCID[l]));m.select(sel);
  for(let l=0;l<6;l++){const g=m.locEl(LOCID[l]);if(g){const on=MAP.hl.includes(l);g.classList.toggle('glow',on);g.classList.toggle('rec',on&&MAP.rec.loc===l)}}
  if(MAP.pan)MAP.pan.querySelectorAll('[data-reg]').forEach(g=>{const r=+g.getAttribute('data-reg');const on=(MAP.hlR||[]).includes(r);g.classList.toggle('rglow',on);g.classList.toggle('rrec',on&&MAP.rec.reg===r)});
  drawSelName()}
// Phones: the kit's name banners are hidden (they were clipped and overlapped the region labels and reward coins). A tapped location shows its name here instead, in a spot with nothing else: below the circle in the top row and the upper half of the side columns, above it in the lower half.
function drawSelName(){const g=MAP.sg;if(!g)return;if(UI.phone){g.innerHTML='';return}if(!UI.phone||UI.pop!=='loc'||!UI.popArg||UI.popArg.l==null){g.innerHTML='';return}
  const l=UI.popArg.l,P=LOCPOS[l],name=LOCN[l],fs=34,words=name.split(' ');let lines=[name];if(name.length>9&&words.length>1){const h=Math.ceil(words.length/2);lines=[words.slice(0,h).join(' '),words.slice(h).join(' ')]}
  const wd=Math.max(...lines.map(t=>t.length))*fs*.66+30,ht=lines.length*(fs+8)+14,below=l<2||l===2||l===4;let cx=P[0];cx=Math.max(wd/2+8,Math.min(1000-wd/2-8,cx));const top=below?P[1]+60:P[1]-60-ht;
  g.innerHTML='<g><rect x="'+Math.round(cx-wd/2)+'" y="'+Math.round(top)+'" width="'+Math.round(wd)+'" height="'+ht+'" rx="14" fill="#1d120b" fill-opacity=".92" stroke="#e8c867" stroke-width="3"/>'+lines.map((t,i)=>'<text x="'+Math.round(cx)+'" y="'+Math.round(top+7+(i+1)*(fs+8)-6)+'" text-anchor="middle" font-family="'+TBKit.fonts.display+'" font-weight="700" font-size="'+fs+'" fill="#f6e6b4">'+esc(t)+'</text>').join('')+'</g>'}
// brief flourish when the region's cards are flipped (kit reveal on the region's slots)
function mapReveal(ev){if(!MAP.m||!ANIM)return Promise.resolve();const a=LOCID[2*ev.r];const ents=ev.parts.filter(s=>ev.cardsF&&ev.cardsF[s]&&ev.cardsF[s].length).map(s=>{const ids=ev.cardsF[s];let tot=0;for(const id of ids)tot+=TB.cardInfo(G,id).strength;return {seat:s,value:tot,winner:ev.winner===s}});
  if(!ents.length)return Promise.resolve();try{return MAP.m.revealSlots(a,ents,{stagger:140}).catch(()=>{})}catch(e){return Promise.resolve()}}
function mapResetReveal(r){try{MAP.m&&MAP.m.resetReveal(LOCID[2*r])}catch(e){}MAP.slotDirty=true}
// strength chips per region: what you know of each side (your hidden cards, revealed cards, Supporters; a rival's hidden card is "?"),
// the live preview during a Clash, and the final totals (crown = winner) once it is fought
const CHIPPOS=[[500,312],[296,822],[704,822]];
function regionChips(f){if(!G||!UI.V||G.phase==='setup')return;const V=UI.V,me=vs();const live=G.clash&&['day','night','tally'].includes(G.step)?preview(V):null;
  for(let r=0;r<3;r++){const R=V.reg[r];const res=UI.clashRes[r];const anySup=V.pl.some(p=>p.supp.r[r]);if(!R.down.length&&!R.up.length&&!anySup&&!res)continue;if(R.done&&!res)continue;
    const seats=youFirst(V.pl.map(p=>p.seat));const pills=[];
    for(const s of seats){let txt,win=false;
      if(res&&res.tot&&res.tot[s]!=null){txt=String(res.tot[s]);win=res.winner===s}
      else if(live&&live.r===r&&live.tot[s]!=null){txt=String(live.tot[s]);win=live.win.length===1&&live.win[0]===s}
      else{let known=0,unk=0;for(const id of R.up)if(ownerOf(id)===s&&!R.took.includes(id))known+=TB.cardInfo(G,id).strength;for(const id of R.down)if(ownerOf(id)===s){if(id>=0)known+=TB.cardInfo(G,id).strength;else unk++}
        const sp=V.pl[s].supp.r[r]*(G.rm&&G.rm.masonry&&G.rm.masonry.includes(s)?2:1);if(!unk&&!known&&!sp)continue;txt=unk?'?'+(known+sp?'+'+(known+sp):''):String(known+sp)}
      pills.push({s,txt,win})}
    if(!pills.length)continue;const fs=pills.length<=2?76:pills.length===3?62:52,pw=p=>Math.max(fs*1.3,p.txt.length*fs*.62+fs*.55),ph=Math.round(fs*1.28),gap=8;const tot=pills.reduce((a,p)=>a+pw(p),0)+gap*(pills.length-1);
    let x=CHIPPOS[r][0]-tot/2;const y=CHIPPOS[r][1];
    f.push('<g class="rchip" data-reg="'+r+'">'+pills.map(p=>{const w=pw(p);const g='<g transform="translate('+Math.round(x)+' '+(y-ph/2)+')"><rect width="'+Math.round(w)+'" height="'+ph+'" rx="'+ph/2+'" fill="'+fcol(p.s)+'" stroke="'+(p.win?'#ffd24a':'#fff3c4')+'" stroke-width="'+(p.win?8:3)+'"/>'+
      '<text x="'+Math.round(w/2)+'" y="'+(ph/2+fs*.36)+'" text-anchor="middle" font-family="'+TBKit.fonts.display+'" font-weight="700" font-size="'+fs+'" fill="#fff" stroke="#000" stroke-opacity=".45" stroke-width="3" paint-order="stroke">'+esc(p.txt)+(p.s===me?'':'')+'</text></g>';x+=w+gap;return g}).join('')+'</g>')}}
