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
  if(MAP.m){try{MAP.m.destroy()}catch(e){}}
  wrap.innerHTML='';
  MAP.m=TBKit.map(Object.assign({container:wrap},mapOpts()));
  MAP.sig=G.pl.map(p=>p.fac).join()+'|'+(UI.phone?1:0);MAP.ov=null;MAP.pan=null;MAP.shown={};MAP.busyHerald={};
  const svg=MAP.m.el;svg.setAttribute('aria-label','Map of the kingdom: three regions of two locations, and the throne');
  const NSS='http://www.w3.org/2000/svg';
  MAP.pan=document.createElementNS(NSS,'g');MAP.pan.setAttribute('class','tbx-pan');svg.insertBefore(MAP.pan,svg.querySelector('.tb-m-locs'));
  MAP.ov=document.createElementNS(NSS,'g');MAP.ov.setAttribute('class','tbx-ov');MAP.ov.setAttribute('pointer-events','none');svg.appendChild(MAP.ov);
  MAP.sg=document.createElementNS(NSS,'g');MAP.sg.setAttribute('class','tbx-selname');MAP.sg.setAttribute('pointer-events','none');svg.appendChild(MAP.sg);
  drawPanels();relayoutSlots();
  // heralds start "at court" (dimmed, on the throne) until placed
  for(let s=0;s<G.np;s++)MAP.m.setHerald(s,'throne');
  MAP.infl={};for(let s=0;s<G.np;s++){MAP.m.setInfluence(s,G.pl[s].inf,{immediate:true})}
  MAP.heraldAt={};MAP.slotSig={}}
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
  if(UI.card&&UI.card.kind!=='pass'){return}
  if(id==='throne'){openPop('kingdom');return}
  const l=LOCID.indexOf(id);if(l<0)return;
  if(info&&info.seat!=null){openPop('region',{r:regOfLoc(l)});return}
  openPop('loc',{l})}
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
    for(const [r,s,st] of ss){const a=LOCID[2*r];m.setSlot(a,s,st);const el=m.slotEl(a,s);if(el){if(st&&st.mineId!=null){el.setAttribute('data-owner',s);el.setAttribute('data-up','1')}else{el.removeAttribute('data-owner');el.removeAttribute('data-up')}}}}
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
  for(let r=0;r<3;r++){const S=STRIP[r],B=REGBOX[r];const ci=V.cord?V.cord.indexOf(r):-1;
    if(ci>=0){const done=V.reg[r].done,cur=V.clash&&V.clash.r===r;const x=r===0?B.x+34:(r===1?B.x+34:B.x+B.w-34),y=r===0?B.y+34:B.y+34;
      f.push('<g transform="translate('+x+' '+y+')"><circle r="22" fill="'+(cur?'#e8c867':done?'#3a3a3a':'#7c1b2c')+'" stroke="#fff3c4" stroke-width="2.6"/><text y="8.5" text-anchor="middle" font-family="'+TBKit.fonts.display+'" font-weight="700" font-size="24" fill="'+(cur?'#2b1808':'#fff3c4')+'">'+['I','II','III'][ci]+'</text></g>')}
    // supporters: little discs in the faction colour under each slot
    const n=G.np,cols=S.cols>=n?n:S.cols,rows=Math.ceil(n/cols),sw=UI.phone?44:38,sh=UI.phone?62:54,gap=6,tw=cols*sw+(cols-1)*gap,th=rows*sh+(rows-1)*gap;
    for(let s=0;s<n;s++){const sp=V.pl[s].supp,cnt=sp.r[r]+sp.x[r];if(!cnt)continue;const c=s%cols,rw=Math.floor(s/cols);const x=S.cx-tw/2+c*(sw+gap)+sw/2,y=S.cy-th/2+rw*(sh+gap)+sh+(UI.phone?10:9);
      f.push('<g transform="translate('+x+' '+y+')"><circle r="'+(UI.phone?11:10)+'" fill="'+fcol(s)+'" stroke="#fff3c4" stroke-width="2"/><text y="5" text-anchor="middle" font-size="14" font-weight="700" fill="#fff" font-family="'+TBKit.fonts.display+'">'+cnt+'</text></g>')}}
  if(UI.phone&&(UI.bs||0)>=250){ // phones: the kit's banners are hidden, so every location gets a short name tag of its own
    for(let l=0;l<6;l++){const P=LOCPOS[l],name=LOCN[l],fs=36,words=name.split(' ');const lines=name.length>8&&words.length>1?[words[0],words.slice(1).join(' ')]:[name];
      const wd=Math.max(...lines.map(t=>t.length))*fs*.6+18,ht=lines.length*fs+8;const cx=Math.max(wd/2+4,Math.min(996-wd/2,P[0])),top=P[1]+52;
      f.push('<g class="locname"><rect x="'+Math.round(cx-wd/2)+'" y="'+top+'" width="'+Math.round(wd)+'" height="'+ht+'" rx="10" fill="#1d120b" fill-opacity=".82"/>'+lines.map((t,i)=>'<text x="'+Math.round(cx)+'" y="'+Math.round(top+(i+1)*fs-4)+'" text-anchor="middle" font-family="'+TBKit.fonts.display+'" font-weight="700" font-size="'+fs+'" fill="#f6e6b4">'+esc(t)+'</text>').join('')+'</g>')}}
  ov.innerHTML=f.join('')}
function setHl(ids){MAP.hl=ids||[]}
function applyHl(){const m=MAP.m;if(!m)return;const sel=UI.pop==='loc'&&UI.popArg?LOCID[UI.popArg.l]:null;m.highlight(MAP.hl.map(l=>LOCID[l]));m.select(sel);drawSelName()}
// Phones: the kit's name banners are hidden (they were clipped and overlapped the region labels and reward coins). A tapped location shows its name here instead, in a spot with nothing else: below the circle in the top row and the upper half of the side columns, above it in the lower half.
function drawSelName(){const g=MAP.sg;if(!g)return;if(UI.phone){g.innerHTML='';return}if(!UI.phone||UI.pop!=='loc'||!UI.popArg||UI.popArg.l==null){g.innerHTML='';return}
  const l=UI.popArg.l,P=LOCPOS[l],name=LOCN[l],fs=34,words=name.split(' ');let lines=[name];if(name.length>9&&words.length>1){const h=Math.ceil(words.length/2);lines=[words.slice(0,h).join(' '),words.slice(h).join(' ')]}
  const wd=Math.max(...lines.map(t=>t.length))*fs*.66+30,ht=lines.length*(fs+8)+14,below=l<2||l===2||l===4;let cx=P[0];cx=Math.max(wd/2+8,Math.min(1000-wd/2-8,cx));const top=below?P[1]+60:P[1]-60-ht;
  g.innerHTML='<g><rect x="'+Math.round(cx-wd/2)+'" y="'+Math.round(top)+'" width="'+Math.round(wd)+'" height="'+ht+'" rx="14" fill="#1d120b" fill-opacity=".92" stroke="#e8c867" stroke-width="3"/>'+lines.map((t,i)=>'<text x="'+Math.round(cx)+'" y="'+Math.round(top+7+(i+1)*(fs+8)-6)+'" text-anchor="middle" font-family="'+TBKit.fonts.display+'" font-weight="700" font-size="'+fs+'" fill="#f6e6b4">'+esc(t)+'</text>').join('')+'</g>'}
// brief flourish when the region's cards are flipped (kit reveal on the region's slots)
function mapReveal(ev){if(!MAP.m||!ANIM)return Promise.resolve();const a=LOCID[2*ev.r];const ents=ev.parts.filter(s=>ev.cardsF&&ev.cardsF[s]&&ev.cardsF[s].length).map(s=>{const ids=ev.cardsF[s];let tot=0;for(const id of ids)tot+=TB.cardInfo(G,id).strength;return {seat:s,value:tot,winner:ev.winner===s}});
  if(!ents.length)return Promise.resolve();try{return MAP.m.revealSlots(a,ents,{stagger:140}).catch(()=>{})}catch(e){return Promise.resolve()}}
function mapResetReveal(r){try{MAP.m&&MAP.m.resetReveal(LOCID[2*r])}catch(e){}MAP.slotDirty=true}
