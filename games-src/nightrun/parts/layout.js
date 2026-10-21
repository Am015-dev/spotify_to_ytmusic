// PURPOSE: phone layout pass: centred one-colour section pills, centred result / pause buttons, controls below the field, stage card beside its node
// FLAG: layout (?layout=0)
// TEST: layout-test.js
/* ---------- LAYOUT (flag RET.layout, default ON; ?layout=0 = the screens exactly as before). Strict review 8, fixes 20-23. CSS and wrappers only, no new art.
   20 MISSIONS / TRAINING / PROFILE: every pill the same colour and width, centred, the block centred in the screen.
   21 result (#over, #stres) and pause (#pausem): one title, centred equal buttons.
   22 (flag RET.layoutStrip, ?strip=1, default OFF) b.js fit(): on a phone the buttons always sit in a strip BELOW the field (never a column over its edge); the x~NNs label sits above its button.
   23 stage map: a stage card beside the selected node (name, goal, real length), the district plate never covers that node, the bottom sheet is at most half the screen,
      ARCADE / CLASSIC show the real length in minutes:seconds instead of "~3 MIN". ---------- */
if(RET.layout===undefined)RET.layout=!/[?&]layout=0/.test(location.search);
if(RET.layoutStrip===undefined)RET.layoutStrip=/[?&]strip=1/.test(location.search);   // fix 22 (controls strip below the field): default OFF until the HUD diet lands, 375x553 HUD cover is 21.0% with it (max 20%)
if(RET.layout){
  document.documentElement.classList.add('lay');
  {const st=document.createElement('style');st.textContent=`
.lay .hubScr .hubBody{gap:14px;padding-top:8px}
.lay .hubScr .hubBody>:first-child{margin-top:auto}.lay .hubScr .hubBody>:last-child{margin-bottom:auto}   /* centred, but a tall list still scrolls from its top */
.lay .hubScr .hubAct,.lay .hubScr .hubMore{width:min(100%,440px);box-sizing:border-box;margin-left:auto;margin-right:auto}
.lay .hubScr .hubAct{min-height:64px}
.lay .hubScr .hubMore{align-self:center}
.lay #over .in,.lay #stres .in,.lay #pausem .in{align-items:center;text-align:center}
.lay #over .row,.lay #stres .row,.lay #pausem .row{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:min(100%,360px);margin:0 auto;justify-items:stretch}
.lay #over .row>button,.lay #stres .row>button,.lay #pausem .row>button{width:100%;min-width:0;margin:0;box-sizing:border-box}
.lay #over .row>button:first-child,.lay #stres .row>button:first-child,.lay #pausem .row>button:first-child{grid-column:1/-1}
.lay #over .row>button:last-child:nth-child(even),.lay #stres .row>button:last-child:nth-child(even),.lay #pausem .row>button:last-child:nth-child(even){grid-column:1/-1}
.lay #over .row>button,.lay #stres .row>button,.lay #pausem .row>button{background-size:100% 100%!important;background-position:center!important;background-repeat:no-repeat!important}
.lay #pausem .eyebrow{display:none}
.lay #pStats{max-width:340px}
.lay #touch button#bEmp[data-t]::before{top:-15px;bottom:auto}
.lay #stsel #stDet{max-height:50%;overflow-y:auto}
.lay #stDet .stl{flex-direction:row;flex-wrap:wrap;gap:2px 12px;font-size:14px}
.lay #stsel .ban.lyhb{visibility:hidden}
.lay #stsel .nd.sel .meta{visibility:hidden}
.lyCard{position:absolute;z-index:3;box-sizing:border-box;width:176px;padding:5px 8px;border:1px solid var(--c,#8c86b8);border-radius:8px;background:#05030cee;color:var(--ink);font:600 14px/1.25 var(--mono)}
.lyCard b{display:block;font:700 15px/1.15 var(--display);letter-spacing:.05em}
.lyCard i{display:block;color:var(--cyan);font-style:normal}
.lyCard u{text-decoration:none;color:#ffe14d}
`;document.head.appendChild(st);}
  const lyBpm=s=>{const t=TR.by[s.song],m=SONGM[s.song];return(t&&t.bpm)||(m&&m.bpm)||120;};
  const lyLen=(s,full)=>{const t=Math.round((full?stLenC(s):stLen(s))*240/lyBpm(s)),m=Math.floor(t/60);return '~'+m+':'+String(t%60).padStart(2,'0');};
  window.LAY={len:lyLen};
  function lyMap(n){const box=$('stRows'),old=box&&box.querySelector('.lyCard');if(old)old.remove();if(!box)return;
    for(const b of box.querySelectorAll('.ban'))b.classList.remove('lyhb');
    if(!(n>0))return;const s=STAGES[n-1];
    const a=$('arcA'),c=$('arcC');if(a&&a.querySelector('small'))a.querySelector('small').textContent=lyLen(s,false);if(c&&c.querySelector('small'))c.querySelector('small').textContent=lyLen(s,true);
    const nd=box.querySelector('.nd[data-n="'+n+'"]'),mp=box.querySelector('.mp');if(!nd||!mp)return;
    const x=parseFloat(nd.style.left),y=parseFloat(nd.style.top),right=x<mp.offsetWidth/2,k=sSave.stars[n]|0,ok=unlocked(n);
    const e=document.createElement('div');e.className='lyCard';e.style.setProperty('--c',DISTRICTS[s.di].a);
    e.innerHTML='<b>'+(s.n<=MAIN?s.n+' · ':'')+s.name+'</b><i>'+goalTxt(s)+'</i><u>'+(ok?'★'.repeat(k)+'☆'.repeat(3-k)+' ':'')+(s.ch?'':(ARC.active()?lyLen(s,false):lyLen(s,true)))+'</u>';
    mp.append(e);const ew=e.offsetWidth,eh=e.offsetHeight;e.style.top=Math.max(2,y-eh/2)+'px';e.style.left=(right?x+34:Math.max(2,x-34-ew))+'px';
    const er=nd.getBoundingClientRect();for(const b of box.querySelectorAll('.ban')){const r=b.getBoundingClientRect();if(r.left<er.right&&r.right>er.left&&r.top<er.bottom&&r.bottom>er.top)b.classList.add('lyhb');}}
  {const md=mapDetail;mapDetail=function(n){const r=md.apply(this,arguments);try{lyMap(n);}catch(e){}return r;};}
  /* section sheets: one colour (the hub gives the first pill the bright style) */
  setTimeout(()=>{for(const b of document.querySelectorAll('.hubScr .hubAct'))b.classList.add('dim');},0);
  setTimeout(()=>{if(typeof fit==='function')fit();},0);
}
