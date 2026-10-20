/* ---------- LAB 'ASSETS' TAB (flag RET.labassets, ?labassets=0 = the old Lab) ----------
   Lets the owner look at EVERY picture the game knows, real or placeholder, and try it in the Lab sandbox before the real art exists.
   Data: media/assets-index.json (written by build.py: assets-manifest.json + every other media file), media/ready.json (painted files),
   media/placeholders.json (hatched placeholder files). Nothing is listed by hand, so the tab cannot go stale.
   Sections: Ships, Weapons, Enemies, Bosses, Pickups, Effects, On-foot, Characters, Achievements, UI/other; each with REAL / PLACEHOLDER / MISSING tiles,
   filters, a detail card (dark and light background), a PREVIEW IN SANDBOX button and a WIRING view (asset -> used by -> wired / hook only / not wired).
   PREVIEW PLACEHOLDERS switch (Lab only, default on): effect hooks may show the placeholder file for an effect whose real file is missing.
   Contract with the effect-picture module (window.FXW, if present): this file sets FXW.preview=true only while the Lab is open and the switch is on, and wraps
   FXW.pic(key) so that, when it returns nothing and FXW.preview is true, the placeholder file fx-<key>.webp is returned instead. A module may also read FXW.preview itself.
   It is false in normal play and is reset when the Lab closes. Nothing here runs outside the Lab. ---------- */
if(RET.labassets===undefined)RET.labassets=!/[?&]labassets=0/.test(location.search);
const LA=window.LABX={S:{sec:'ships',filt:'all',view:'tiles',ph:true},data:null,pv:null,snap:null,loaded:[],phImg:{},page:null,wire:null,host:null,card:null,bar:null};
LA.tabs=()=>RET.labassets?[['assets','ASSETS']]:[];
const LA_SEC=[['ships','SHIPS'],['weapons','WEAPONS'],['enemies','ENEMIES'],['bosses','BOSSES'],['pickups','PICKUPS'],['effects','EFFECTS'],['onfoot','ON FOOT'],['chars','CAST'],['ach','BADGES'],['ui','UI/OTHER']];
const LA_FILT=[['all','ALL'],['REAL','REAL'],['PLACEHOLDER','PLACEHOLDER'],['MISSING','MISSING']];
const LA_ST={REAL:'REAL',PLACEHOLDER:'PLACEHOLDER',MISSING:'MISSING'};
{const st=document.createElement('style');st.textContent=`
#labP.lax{max-height:min(80%,640px)}
#labP.lax .lbody{display:block}
#labP.lapv{display:none!important}
.la{font-family:var(--mono);color:var(--ink);font-size:14px;line-height:1.3}
.la .lat{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:2px 0 6px}
.la .lac,#laCard .lac,#laBar .lac{min-height:44px;min-width:44px;padding:0 10px;font:700 14px var(--mono);color:var(--ink);background:#140c26;border:1px solid #3a2b5c;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;gap:5px;cursor:pointer;white-space:nowrap}
.la .lat.sc .lac{flex:0 0 auto}
.la .lat.sc{flex-wrap:nowrap;overflow-x:auto;touch-action:pan-x;padding-bottom:2px}.la .lac.on,#laCard .lac.on,#laBar .lac.on{background:var(--cyan);color:var(--void);border-color:var(--cyan)}.la .lac.hot,#laCard .lac.hot,#laBar .lac.hot{background:var(--pink);border-color:var(--pink);color:var(--void)}
.la .lasum{font-size:14px;color:var(--amber);flex:1 1 100%}
.la .lagrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:8px}
.la .tile{background:#0f0a1d;border:1px solid #3a2b5c;border-radius:8px;padding:6px;display:flex;flex-direction:column;gap:4px;min-width:0;cursor:pointer}
.la .tile .pic{height:84px;display:flex;align-items:center;justify-content:center;background:repeating-conic-gradient(#1a1230 0 25%,#120c22 0 50%) 0 0/16px 16px;border-radius:5px;overflow:hidden}
.la .tile .pic img,.la .tile .pic canvas{max-width:100%;max-height:84px;object-fit:contain}
.la .tile b{font-size:14px;word-break:break-all;font-weight:700}.la .tile small{font-size:14px;color:var(--dim)}
.la .bd{display:inline-block;font-size:14px;font-weight:700;padding:1px 6px;border-radius:4px;color:#06040c;align-self:flex-start}
.la .bd.REAL{background:#3dff8a}.la .bd.PLACEHOLDER{background:#ffb020}.la .bd.MISSING{background:#ff4a5e}
.la .wire{width:100%;border-collapse:collapse;margin:0 0 10px}.la .wire td,.la .wire th{border-bottom:1px solid #2a1f45;padding:4px 6px;text-align:left;vertical-align:top;font-size:14px;word-break:break-word}
.la .wire .wired{color:#3dff8a}.la .wire .hook{color:#ffb020}.la .wire .not{color:#ff4a5e}.la h4{margin:10px 0 4px;font-size:14px;color:var(--cyan);letter-spacing:.06em}
#laCard{position:absolute;inset:0;z-index:7;background:#07040ff2;overflow:auto;padding:10px;font:14px/1.35 var(--mono);color:var(--ink)}
#laCard .two{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}#laCard .bx{height:150px;display:flex;align-items:center;justify-content:center;border-radius:8px;overflow:hidden}
#laCard .bx img,#laCard .bx canvas{max-width:100%;max-height:146px;object-fit:contain}#laCard dl{display:grid;grid-template-columns:auto 1fr;gap:3px 10px;margin:6px 0}#laCard dt{color:var(--dim)}#laCard dd{margin:0;word-break:break-word}
#laBar{position:absolute;left:0;right:0;bottom:0;z-index:5;display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:6px 8px;background:#07040f;border-top:1px solid #3a2b5c;font:14px var(--mono);color:var(--ink)}
#laBar .nm{flex:1 1 100%;color:var(--amber);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#laFoot{position:absolute;left:0;top:0;width:100%;z-index:3;background:#0a0612}
`;document.head.appendChild(st);}
const laEsc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const laBtn=(host,text,fn,cls,aria)=>{const b=lel('button','lac'+(cls?' '+cls:''),text);b.type='button';if(aria)b.setAttribute('aria-label',aria);b.addEventListener('click',fn);host.append(b);return b;};
const LA_FD='fo'+'ot';   // built from pieces so this file never contains the folder name as a quoted prefix (the wiring scan reads the page text)
/* ----- which section an asset belongs to ----- */
function laSecOf(group,base,dir){const g=(group||'').toLowerCase();
  if(dir===LA_FD)return'onfoot';
  if(/chest|portrait|parallax|medal|difficulty|soon|mechanic|forge|boss gates|ability buttons/.test(g))return'ui';
  if(/ship/.test(g))return'ships';if(/weapon/.test(g))return'weapons';if(/mini-boss|boss/.test(g))return'bosses';if(/enem/.test(g))return'enemies';if(/effect/.test(g))return'effects';
  if(/on-foot/.test(g))return'onfoot';if(/kit|flavour|pickup|power/.test(g))return'pickups';if(/cast|character/.test(g))return'chars';if(/achiev/.test(g))return'ach';
  if(/^(spr-)?ship-/.test(base))return'ships';if(/^(wpmount|wp)-|^fx-fuse/.test(base))return'weapons';if(/^(spr-en|en)-/.test(base))return'enemies';if(/^(boss|spr-boss|anim-boss)-/.test(base))return'bosses';
  if(/^(pk|kit|fl)-/.test(base))return'pickups';if(/^fx-/.test(base))return'effects';if(/^char-/.test(base))return'chars';if(/^ach-/.test(base))return'ach';return'ui';}
function laMk(m,ready,ph){const file=m.file,i=file.lastIndexOf('/'),dir=i<0?'':file.slice(0,i),base=file.slice(i+1).replace(/\.webp$/,''),real=ready.has(file),isPh=!!ph[file];
  return{file,stem:file.replace(/\.webp$/,''),dir,base,w:m.w||0,h:m.h||0,group:m.group||'Other media files',mstat:m.status||'',where:m.where||'core game art, loaded by the game',notes:m.notes||'',kind:m.kind||'',why:m.why||'',prompt:m.prompt||'',man:!!m.file&&m.man!==0,
    sec:laSecOf(m.group,base,dir),state:real?'REAL':m.man===0?'REAL':isPh?'PLACEHOLDER':'MISSING'};}
LA.load=()=>{if(LA.p)return LA.p;const b=ART.base,j=(u,d)=>fetch(u).then(r=>r.ok?r.json():d).catch(()=>d);
  LA.p=Promise.all([j(b+'assets-index.json',null),j(b+'ready.json',[]),j(b+'placeholders.json',{}),fetch(location.href.split(/[?#]/)[0]).then(r=>r.ok?r.text():null).catch(()=>null)]).then(([ix,rd,ph,txt])=>{
    const ready=new Set(Array.isArray(rd)?rd:[]),pl=ph&&typeof ph==='object'?ph:{},man=ix&&ix.manifest||[],ex=ix&&ix.extra||[],all=[];
    for(const m of man)if(m&&m.file)all.push(laMk(m,ready,pl));
    for(const f of ex)all.push(laMk({file:f,man:0},ready,pl));
    LA.data={all,ready,ok:!!ix};LA.page=txt;LA.tok=null;return LA.data;});
  return LA.p;};
/* tokens the page text quotes (names and name prefixes); path suffixes are added too, so 'media/x/y' also gives 'x/y' and 'y' */
function laTokens(){if(LA.tok)return LA.tok;const s=new Set(),t=LA.page||'',re=/['"`\/]([a-z][a-z0-9_\-\/]{2,})/g;let m;
  while((m=re.exec(t))){const w=m[1];s.add(w);let k=w.indexOf('/');while(k>=0){s.add(w.slice(0,k+1));s.add(w.slice(k+1));k=w.indexOf('/',k+1);}}
  return LA.tok=s;}
/* wired = the file name (or its folder + name) is quoted in the page; hook only = only a name pattern ('prefix-' + something) matches and the manifest says reserved/planned; not wired = nothing */
LA.wireOf=e=>{if(e.wr)return e.wr;if(LA.page==null)return e.wr='unknown';const T=laTokens();
  if(T.has(e.stem)||T.has(e.base))return e.wr='wired';
  const parts=e.base.split('-'),pre=[];for(let i=parts.length-1;i>=1;i--){const p=(e.dir?e.dir+'/':'')+parts.slice(0,i).join('-')+'-';if(p.length>=4)pre.push(p);}if(e.dir)pre.push(e.dir+'/');
  const dyn=pre.some(p=>T.has(p));
  if(!dyn)return e.wr='not wired';
  return e.wr=(/RESERVED/i.test(e.mstat)||/planned/i.test(e.where))?'hook only':'wired';};
/* ----- tiles that are not files: on-foot enemies and bosses (from FOOT_ENEMIES / FA), power-ups without a pk file ----- */
LA.virt=()=>{const v=[],D=LA.data?LA.data.all:[],fa=window.FA,fe=window.FOOT_ENEMIES,fb=window.FOOT_BOSS;
  if(fa||fe){const ids=new Set([...(fe?Object.keys(fe):[]),...(fa&&fa.WHO?fa.WHO.filter(w=>w!=='kai'&&w!=='warden'):[])]);
    for(const who of ids)v.push({virt:'foot',who,sec:'enemies',name:'ON-FOOT '+who,state:fa&&fa.has&&fa.has(who,'idle')?'REAL':'PLACEHOLDER',where:'parts/footen.js FOOT_ENEMIES.'+who+' (drawn by FA.draw)',group:'On-foot enemies',notes:'Every pose has its own picture: see the ON FOOT section.',w:1024,h:1024});}
  if(fb||fa)for(const who of new Set([...(fb?Object.keys(fb):[]),...(fa&&fa.WHO&&fa.WHO.includes('warden')?['warden']:[])]))v.push({virt:'foot',boss:1,who,sec:'bosses',name:'GROUND BOSS '+who,state:fa&&fa.has&&fa.has(who,'idle')?'REAL':'PLACEHOLDER',where:'parts/footen.js FOOT_BOSS.'+who+' (drawn by FA.draw)',group:'Ground boss placeholders',notes:'Placeholder humanoid drawn in code until the painted poses exist.',w:1024,h:1024});
  if(typeof PWK!=='undefined')for(const k of Object.keys(PWK)){if(D.some(e=>e.base==='pk-'+k))continue;v.push({virt:'power',pk:k,sec:'pickups',name:'POWER-UP '+PWK[k].n,state:ART.isReal&&ART.isReal('pk-'+k)?'REAL':'PLACEHOLDER',where:'parts/power.js PW.coin (a coloured hexagon coin drawn in code)',group:'Power-ups (drawn in code)',notes:'No picture file yet: pk-'+k+'.webp 128x128 transparent would replace the coin.',w:128,h:128,c:PWK[k].c});}
  return v;};
LA.list=sec=>(LA.data?LA.data.all.filter(e=>e.sec===sec):[]).concat(LA.virt().filter(e=>e.sec===sec));
LA.count=sec=>{const o={REAL:0,PLACEHOLDER:0,MISSING:0};for(const e of LA.data.all)if(!sec||e.sec===sec)o[e.state]++;return o;};
const laCountTxt=o=>o.REAL+' real, '+o.PLACEHOLDER+' placeholder'+(o.MISSING?', '+o.MISSING+' missing':'');
/* ----- the picture as the game draws it now ----- */
function laFootPic(who,pose,px){const c=document.createElement('canvas');c.width=c.height=px;try{if(window.FA&&FA.draw){const g=c.getContext('2d');FA.draw(g,who,pose,px/2,px*.94,px*.86,false,.3);}}catch(err){}return c;}
function laPic(e,px){px=px||84;
  if(e.virt==='foot')return laFootPic(e.who,'idle',px*2);
  if(e.virt==='power'){const s=lel('span');s.style.cssText='width:'+px*.7+'px;height:'+px*.7+'px;border-radius:50%;border:3px solid '+e.c+';display:flex;align-items:center;justify-content:center;font-weight:700;color:'+e.c;s.textContent=e.pk.slice(0,2).toUpperCase();return s;}
  if(e.dir===LA_FD&&window.FA&&FA.draw){const m=e.base.match(/^(.+?)-(idle|run-a|run-b|jump|fall|shoot|melee|hit|die|crouch-shoot|crouch|attack2|enrage)$/);if(m&&FA.WHO&&FA.WHO.includes(m[1]))return laFootPic(m[1],m[2],px*2);}
  const im=new Image();im.alt='';im.decoding='async';im.loading='lazy';im.src=ART.base+e.file;im.onerror=()=>{if(e.state!=='MISSING'){e.state='MISSING';LA.refresh();}};return im;}
/* ----- build the tab ----- */
function laBuild(body){const host=lel('div','la');LA.host=host;body.append(host);host.textContent='loading the asset list...';
  LA.load().then(()=>{if(LA.host===host)LA.render();});LA.apply();}
LA.build={assets:laBuild};
LA.refresh=()=>{if(LA.host&&LA.host.isConnected&&!LA.pv)LA.render();};
LA.render=()=>{const host=LA.host,S=LA.S,D=LA.data;if(!host)return;host.textContent='';if(!D||!D.ok){host.textContent='asset list not found (media/assets-index.json): run parts/build.py';return;}
  const top=lel('div','lat');host.append(top);const tot=LA.count(),wc={wired:0,'hook only':0,'not wired':0,unknown:0};if(LA.page!=null)for(const e of D.all)wc[LA.wireOf(e)]++;
  const sum=lel('div','lasum',D.all.length+' assets: '+laCountTxt(tot)+(LA.page!=null?' | wiring: '+wc.wired+' wired, '+wc['hook only']+' hook only, '+wc['not wired']+' not wired':''));sum.id='laSum';top.append(sum);
  const ph=laBtn(top,'PREVIEW PLACEHOLDERS: '+(S.ph?'ON':'OFF'),()=>{LA.setPh(!S.ph);LA.render();},S.ph?'on':'');ph.id='laPh';
  const vw=laBtn(top,S.view==='tiles'?'WIRING VIEW':'TILE VIEW',()=>{S.view=S.view==='tiles'?'wiring':'tiles';LA.render();});vw.id='laView';
  const secs=lel('div','lat sc');secs.id='laSecs';host.append(secs);
  for(const [id,nm] of LA_SEC){const b=laBtn(secs,nm+' '+(LA.data.all.filter(e=>e.sec===id).length+LA.virt().filter(e=>e.sec===id).length),()=>{S.sec=id;LA.render();},S.sec===id?'on':'');b.dataset.sec=id;}
  const fl=lel('div','lat sc');fl.id='laFilt';host.append(fl);
  for(const [id,nm] of LA_FILT){const b=laBtn(fl,nm,()=>{S.filt=id;LA.render();},S.filt===id?'on':'');b.dataset.filt=id;}
  const cn=lel('div','lasum',laCountTxt(LA.count(S.sec)));cn.id='laCount';host.append(cn);
  const L=LA.list(S.sec).filter(e=>S.filt==='all'||e.state===S.filt);
  if(S.view==='wiring'){LA.renderWire(host,L);return;}
  const grid=lel('div','lagrid');grid.id='laGrid';host.append(grid);
  if(!L.length)grid.append(lel('div','lasum','nothing here with this filter'));
  for(const e of L){const t=lel('div','tile');t.dataset.file=e.file||e.name;t.tabIndex=0;const p=lel('div','pic');p.append(laPic(e));t.append(p);
    t.append(lel('b','',e.name||e.base+(e.dir?' ('+e.dir+')':'')));
    t.append(lel('small','',(e.virt?'no file':e.w+'x'+e.h)));const bd=lel('span','bd '+e.state,LA_ST[e.state]);t.append(bd);
    if(LA.plan(e))laBtn(t,'PREVIEW IN SANDBOX',ev=>{ev.stopPropagation();LA.preview(e);},'hot');
    t.addEventListener('click',()=>LA.detail(e));grid.append(t);}};
LA.renderWire=(host,L)=>{if(LA.page==null){host.append(lel('div','lasum','page text not readable here: wiring unknown'));return;}
  const by={};for(const e of L)(by[e.group]=by[e.group]||[]).push(e);
  for(const g of Object.keys(by)){host.append(lel('h4','',g.toUpperCase()+' ('+by[g].length+')'));const tb=lel('table','wire'),th=lel('tr');for(const h of ['asset','used by','state'])th.append(lel('th','',h));tb.append(th);
    for(const e of by[g]){const tr=lel('tr'),st=e.virt?'in code':LA.wireOf(e),c=st==='wired'||st==='in code'?'wired':st==='hook only'?'hook':'not';
      tr.append(lel('td','',e.file||e.name),lel('td','',e.where),lel('td',c,st));tb.append(tr);}host.append(tb);}};
/* ----- detail card ----- */
LA.detail=e=>{LA.closeCard();const c=lel('div');c.id='laCard';LA.card=c;stage.appendChild(c);
  const st=lel('div','lat');laBtn(st,'CLOSE',()=>LA.closeCard(),'on');if(LA.plan(e))laBtn(st,'PREVIEW IN SANDBOX',()=>{LA.closeCard();LA.preview(e);},'hot');
  if(e.sec==='ships'&&LA.plan(e)){laBtn(st,'PREVIEW UNARMED',()=>{LA.closeCard();LA.preview(e,{unarmed:true});});}
  c.append(st,lel('b','',e.name||e.file));const two=lel('div','two');
  for(const bg of ['#0a0612','#e8e8f0']){const bx=lel('div','bx');bx.style.background=bg;bx.append(laPic(e,146));two.append(bx);}c.append(two);
  const nat=lel('span','',e.virt?'-':'measuring...'),tr=lel('span','',e.virt?'-':'measuring...'),dl=lel('dl');
  const row=(k,v)=>{const d=lel('dd');if(typeof v==='string')d.textContent=v;else d.append(v);dl.append(lel('dt','',k),d);};
  const g=(a,b)=>b?g2(a,b):a,g2=(a,b)=>g(b,a%b);
  row('state',e.state+(e.state==='PLACEHOLDER'?' (drawn in code or a hatched placeholder file)':''));row('save as',e.file?'media/'+e.file:'(none yet)');
  row('size',e.w?e.w+' x '+e.h+' px'+(e.w&&e.h?', ratio '+(e.w/g(e.w,e.h))+':'+(e.h/g(e.w,e.h)):''):'-');row('file on disk',nat);row('transparent',tr);row('kind',e.kind||'-');
  row('what to paint',e.notes||'-');if(e.why)row('why',e.why);if(e.prompt)row('prompt',e.prompt);row('used by',e.where);row('group',e.group);row('wiring',e.virt?'in code':LA.wireOf(e));c.append(dl);
  if(!e.virt){const im=new Image();im.onload=()=>{nat.textContent=im.naturalWidth+' x '+im.naturalHeight+' px';try{const k=document.createElement('canvas');k.width=k.height=32;const x=k.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0,32,32);const d=x.getImageData(0,0,32,32).data;let a=0;for(const q of [3,31*4+3,31*128+3,31*128+31*4+3])a+=d[q]<250?1:0;
      tr.textContent=a>=3?'yes (corners are see-through)':'no (solid corners'+(/^fx-/.test(e.base)?'; light-on-black effects are fine, the game turns black clear':'')+')';}catch(err){tr.textContent='unknown';}};
    im.onerror=()=>{nat.textContent='not found';tr.textContent='-';};im.src=ART.base+e.file;}};
LA.closeCard=()=>{if(LA.card){LA.card.remove();LA.card=null;}};
/* ----- what each asset does in the sandbox ----- */
LA.plan=e=>{if(e.virt==='foot')return{k:'foot',who:e.who,pose:'idle'};if(e.virt==='power')return{k:'pickup',pk:e.pk};
  const b=e.base||'',d=e.dir||'';let m;
  if(d===LA_FD){if((m=b.match(/^bg-(.+)$/)))return{k:'footbg',layer:m[1]};if((m=b.match(/^pk-(.+)$/)))return{k:'footpk',id:m[1]};if((m=b.match(/^sc-(.+)$/)))return{k:'footsc',id:m[1]};
    if((m=b.match(/^(.+?)-(idle|run-a|run-b|jump|fall|shoot|melee|hit|die|crouch-shoot|crouch|attack2|enrage)$/)))return{k:'foot',who:m[1],pose:m[2]};return null;}
  if(typeof WP_IDS==='undefined')return null;
  if((m=b.match(/^fx-fuse-tag-([a-z]+)-([a-z]+)$/))){const a=WP_IDS.find(id=>(WTAG[id]||[]).includes(m[1])),c=WP_IDS.find(id=>id!==a&&(m[2]==='any'||(WTAG[id]||[]).includes(m[2])));return{k:'weapon',eq:[a||'pulse',c||'laser']};}
  if((m=b.match(/^fx-fuse-([a-z]+)-([a-z]+)$/))&&WPD[m[1]]&&WPD[m[2]])return{k:'weapon',eq:[m[1],m[2]]};
  if((m=b.match(/^wp-([a-z]+)$/))&&WPD[m[1]])return{k:'weapon',eq:[m[1],null]};
  if(/^wpmount-/.test(b)){const id=WP_IDS.find(w=>b.startsWith('wpmount-'+w));if(id)return{k:'weapon',eq:[id,null],mount:1};}
  if((m=b.match(/^(?:spr-)?ship-([a-z0-9]+)$/))&&SHIPS.some(s=>s.id===m[1]))return{k:'weapon',eq:['pulse','laser'],ship:m[1],mount:1};
  if((m=b.match(/^fx-shot-(std|hv|ec|perfect)$/)))return{k:'weapon',eq:['pulse',null],ship:m[1]==='perfect'?'std':m[1]};
  if((m=b.match(/^fx-(explosion-small|explosion-big|explosion-boss|shockwave|hit-spark|muzzle|engine)$/)))return{k:'boom',key:m[1]};
  if(/^fx-bullet-/.test(b))return{k:'foe',type:'turret'};if(b==='fx-orb-homing')return{k:'foe',type:'gunship'};if(b==='fx-crown'||b==='fx-shield-link')return{k:'foe',type:'leader'};
  if((m=b.match(/^(?:spr-)?en-(.+)$/)))return{k:'foe',type:m[1].replace(/^turret-.*/,'turret')};
  if((m=b.match(/^(?:boss|spr-boss|anim-boss)-(.+)$/)))return LAB_B.some(B=>B.art===m[1])?{k:'boss',art:m[1]}:null;
  if((m=b.match(/^pk-(.+)$/)))return{k:'pickup',pk:m[1]};
  if(/^fx-/.test(b))return{k:'boom',key:b.replace(/^fx-/,''),gen:1};
  return null;};
const laAlive=t=>G.en.filter(x=>x.type===t&&x.hp>0&&x.x>-40).length;
function laClear(){G.en=[];G.eb=[];G.pb=[];G.pk=[];G.boss=null;G.bossDone=false;G.transT=-1;G.force=false;G.delayed=[];if(window.ZOO){ZOO.bombs=[];ZOO.mines=[];}P.hp=P.max;}
function laFoe(t){const y=H/2;
  try{if(window.ZOO&&ZOO.ID&&ZOO.ID.includes(t))return ZOO.mk(t,{x:W-110,y});
    if(window.LEAK&&LEAK.GT&&LEAK.GT[t])return LEAK.mk(t,W-110);
    if(t==='leader'){const e=en('drone',{x:W-90,y,amp:0});e.ldr=1;e.lc=0;e.r=Math.round(e.r*1.35);e.hp=Math.round(e.hp*3.5);e.max=e.hp;return e;}
    if(t==='gate')return en('gate',{x:W-90,gy:y,gap:130});if(t==='flank')return en('flank',{x:W-260,y:-22,ty:y,side:-1,t:0});if(t==='turret')return en('turret',{x:W-90,y,stop:W-250});
    if(t==='swarm'){for(let i=0;i<8;i++)en('swarm',{x:W-60+i*34,y,by:y,amp:50,ph:i*.55});return;}if(t==='mine')return en('mine',{x:W-90,y,by:y,ph:0});
    return en(t,{x:W-90,y,amp:0});}catch(err){labNote('cannot spawn '+t);}}
function laDrop(pk){const y=H/2,PKA2={shard:1,hp:1,up:1,emp:1},p={t:PKA2[pk]?pk:'pw',x:W-220,y,vx:-60,vy:0,bob:0};if(!PKA2[pk])p.k=pk;G.pk=[p];}
/* equip, restore: everything a preview changes is remembered once and put back when the preview ends */
function laSnap(){if(LA.snap)return;LA.snap={ship:GA.ship,eq:WP.eq.slice(),pl:Object.assign({},WP.pl),auto:SET.auto,rig:RIG.on};}
function laRestore(){const s=LA.snap;if(!s)return;GA.ship=s.ship;WP.eq=s.eq;WP.pl=s.pl;WP._fk=null;SET.auto=s.auto;RIG.on=s.rig;LA.snap=null;try{SH.recalc();}catch(err){}}
function laEquip(eq,ship){laSnap();if(ship&&SHIPS.some(s=>s.id===ship))GA.ship=ship;WP.eq=eq.slice();for(const id of eq)if(id)WP.pl[id]=Math.max(WP.pl[id]|0,1);WP._fk=null;SET.auto=true;try{SH.recalc();}catch(err){}}
LA.phLoad=e=>{if(!LA.S.ph||e.state==='REAL'||e.virt||e.dir)return;const n=e.stem;if(n in ART.bm)return;ART.load(n);LA.loaded.push(n);};
LA.phDrop=()=>{if(!LA.loaded.length)return;for(const n of LA.loaded){delete ART.bm[n];delete ART.err[n];}LA.loaded=[];ART.sc={};};
LA.phPic=k=>{const f=/^fx-/.test(k)?k:'fx-'+k;let r=LA.phImg[f];if(!r){r=LA.phImg[f]={im:new Image(),ok:0};r.im.onload=()=>{r.ok=1;};r.im.src=ART.base+f+'.webp';}return r.ok?r.im:null;};
/* the placeholder switch: only inside the Lab; leaves FXW (if it exists) exactly as it was outside */
LA.apply=()=>{if(!RET.labassets)return;const on=!!(RET.labassets&&running&&G&&G.lab&&LA.S.ph),F=window.FXW;LA.fxOn=on;
  if(F&&typeof F==='object'){if(on&&!F._labWrap&&typeof F.pic==='function'){const p=F.pic;F.pic=function(k){const r=p.apply(this,arguments);if(r||!F.preview)return r;return LA.phPic(String(k));};F._labWrap=1;}F.preview=on;}};
LA.setPh=on=>{LA.S.ph=!!on;LA.apply();LA.phDrop();if(LA.pv&&LA.pv.e)LA.phLoad(LA.pv.e);};
/* ----- the preview ----- */
LA.preview=(e,o)=>{if(!(running&&G&&G.lab)){return;}const pl=LA.plan(e);if(!pl)return;LA.stop(true);o=o||{};laClear();P.x=Math.round(W*.2);P.y=Math.round(H/2);
  LA.pv={e,pl,o,t0:performance.now()};LA.phLoad(e);LA.apply();
  document.getElementById('labP').classList.add('lapv');
  const bar=lel('div');bar.id='laBar';LA.bar=bar;stage.appendChild(bar);
  const nm=lel('div','nm',(e.name||e.file)+' | '+LA_ST[e.state]+' | '+pl.k);nm.id='laBarName';bar.append(nm);
  laBtn(bar,'REPLAY',()=>LA.again(true),'hot');
  if(pl.mount)laBtn(bar,'MOUNTS: '+(o.unarmed?'OFF':'ON'),ev=>{o.unarmed=!o.unarmed;ev.target.textContent='MOUNTS: '+(o.unarmed?'OFF':'ON');LA.go();});
  const sw=laBtn(bar,'PLACEHOLDERS: '+(LA.S.ph?'ON':'OFF'),()=>{LA.setPh(!LA.S.ph);sw.textContent='PLACEHOLDERS: '+(LA.S.ph?'ON':'OFF');});
  laBtn(bar,'BACK TO LIST',()=>LA.stop(),'on');
  LA.go();LA.pv.iv=setInterval(()=>LA.again(false),1500);};
LA.go=()=>{const v=LA.pv;if(!v)return;const pl=v.pl;
  if(pl.k==='weapon'){laEquip(pl.eq,pl.ship);RIG.on=!v.o.unarmed;}
  else if(pl.k==='boss'){const i=LAB_B.findIndex(B=>B.art===pl.art);LAB.bi=i;LAB.di=LAB_B[i].home;LAB.phase=0;LAB.pat=null;LAB.pose=null;labSpawn();}
  else if(pl.k==='foot'||pl.k==='footbg'||pl.k==='footpk'||pl.k==='footsc')LA.footStart();
  LA.again(true);};
LA.again=force=>{const v=LA.pv;if(!v||!running||!G||!G.lab)return;const pl=v.pl;
  if(pl.k==='weapon'){let n=0;for(const x of G.en)if(x.type!=='boss'&&x.hp>0)n++;for(let i=n;i<2;i++)en('drone',{x:W-110,y:H/2+(i%2?80:-80),amp:0});}
  else if(pl.k==='boom'){const sz={'explosion-small':[76,.4],'explosion-big':[170,.6],'explosion-boss':[300,1],shockwave:[230,.6],'hit-spark':[64,.3],muzzle:[56,.25],engine:[70,.5]}[pl.key]||[150,.7];ART.boom(pl.key,W*.6,H/2,sz[0],sz[1]);}
  else if(pl.k==='foe'){if(force||!laAlive(pl.type))laFoe(pl.type);}
  else if(pl.k==='pickup'){if(force||!G.pk.length)laDrop(pl.pk);}
  else if(pl.k==='boss'){if(!G.boss)labSpawn();}};
LA.stop=quiet=>{const v=LA.pv;if(!v)return;clearInterval(v.iv);LA.pv=null;LA.footStop();if(LA.bar){LA.bar.remove();LA.bar=null;}laRestore();LA.phDrop();LA.apply();
  document.getElementById('labP').classList.remove('lapv');if(!quiet){if(running&&G&&G.lab)laClear();LA.render();}};
/* ----- on-foot preview: a canvas over the arena, a walk, a shot, then every pose ----- */
LA.footStart=()=>{LA.footStop();const v=LA.pv,pl=v.pl,fa=window.FA,cv=document.createElement('canvas');cv.id='laFoot';stage.appendChild(cv);LA.cv=cv;
  const size=()=>{const r=stage.getBoundingClientRect(),bh=LA.bar?LA.bar.offsetHeight:56;cv.width=Math.max(120,Math.round(r.width));cv.height=Math.max(120,Math.round(r.height-bh));cv.style.height=cv.height+'px';};size();
  const t0=performance.now();let cam=0;
  const POS=fa&&fa.WHO?(fa.MACHINES&&fa.MACHINES.includes(pl.who)?['idle','shoot','hit','die']:(pl.who==='warden'?fa.POSES_BOSS:fa.POSES)):[];
  const seq=[];if(pl.k==='foot'){seq.push({pose:pl.pose,d:1.6,hold:1});seq.push({pose:'run',d:2.6,mv:1});seq.push({pose:'shoot',d:1.4,fire:1});for(const p of POS)if(p!==pl.pose)seq.push({pose:p,d:.8});}
  else seq.push({pose:'run',d:3,mv:1},{pose:'shoot',d:1.4,fire:1});
  const tot=seq.reduce((a,s)=>a+s.d,0),who=pl.who||'kai';
  const frame=()=>{if(LA.cv!==cv)return;size();const g=cv.getContext('2d'),w=cv.width,h=cv.height,tt=(performance.now()-t0)/1000,u=tt%tot;let acc=0,sg=seq[0],su=0;for(const s of seq){if(u<acc+s.d){sg=s;su=u-acc;break;}acc+=s.d;}
    const fy=fa&&fa.floorY?fa.floorY(h):Math.round(h*.8),hh=Math.round(h*.34);cam=tt*140;g.clearRect(0,0,w,h);
    try{if(fa&&fa.bg){const L=pl.k==='footbg'?['sky','far','mid','near','floor']:['sky','far','mid','near'];for(const l of L)fa.bg(g,l,cam,w,h);}else{g.fillStyle='#14102a';g.fillRect(0,0,w,h);g.fillStyle='#2a2150';g.fillRect(0,fy,w,h-fy);}}catch(err){}
    let x=w*.3,lab=sg.pose;
    try{if(pl.k==='footpk'&&fa.pickup){fa.pickup(g,pl.id,w/2,fy-hh*.6,hh*.9,tt);lab='pickup '+pl.id;}
      else if(pl.k==='footsc'&&fa.scenery){fa.scenery(g,pl.id,w/2,fy,hh*1.4);lab='scenery '+pl.id;}
      else if(fa&&fa.draw){if(sg.mv)x=w*(.15+.55*(su/sg.d));let pose=sg.pose,yy=fy;if(pose==='run')pose=Math.floor(tt*6)%2?'run-b':'run-a';if(pose==='jump')yy-=hh*.5*Math.sin(Math.PI*Math.min(1,su/sg.d));if(pose==='die')su=su;
        const who2=pl.k==='foot'?who:'kai';fa.draw(g,who2,pose,x,yy,hh*(who2==='warden'?1.5:1),false,pose==='die'?su:tt);
        if(sg.fire){const bx=x+hh*.5+((su*500)%(w-x-hh));g.fillStyle='#ffd23d';g.fillRect(bx,fy-hh*.55,18,4);g.fillRect(x+hh*.4,fy-hh*.55,10,6);}}}catch(err){}
    g.fillStyle='#ffffffcc';g.font='700 16px monospace';g.fillText((pl.who||pl.id||pl.layer||'')+' | '+lab,10,22);LA.raf=requestAnimationFrame(frame);};
  LA.raf=requestAnimationFrame(frame);};
LA.footStop=()=>{if(LA.raf)cancelAnimationFrame(LA.raf);LA.raf=0;if(LA.cv){LA.cv.remove();LA.cv=null;}};
/* leaving the Lab (any way) resets everything this file touched */
NR.on('runStart',d=>{if(d&&d.lab)LA.apply();});
/* safety net: the placeholder preview must never survive outside the Lab (quit paths that skip runEnd) */
NR.on('tick',()=>{const F=window.FXW;if(F&&typeof F==='object'&&F.preview&&!(running&&G&&G.lab)){F.preview=false;LA.fxOn=false;}});
setInterval(()=>{const F=window.FXW;if(F&&typeof F==='object'&&F.preview&&!(running&&G&&G.lab)){F.preview=false;LA.fxOn=false;}},500);
NR.on('runEnd',()=>{LA.stop(true);LA.closeCard();LA.S.ph=true;LA.fxOn=false;if(window.FXW&&typeof FXW==='object'&&FXW._labWrap)FXW.preview=false;LA.host=null;});   // (apply() would still see running+G.lab here)
NR.on('tick',()=>{if(!G||!G.lab||!RET.labassets)return;if((G.frameLab||0)%60===0)LA.apply();});
