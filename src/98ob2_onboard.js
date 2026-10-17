// onboard-2: 2K-style first screen (rv2k2/menu). First launch = one big PLAY; returning = CONTINUE + RACES/GARAGE/BUILD/MORE; the rest under MORE. ?ob2=0 = old menu.
if(!/[?&]ob2=0/.test(location.search)){
  const st=document.createElement('style');st.textContent=`#ob2{display:none}
#menu.home.ob2 #ob2{display:flex;flex-direction:column;align-items:center;gap:clamp(8px,2vh,16px);margin-top:70px;width:min(92vw,560px);z-index:2}
#menu.home.ob2:not(.ob2more) :is(.hcards,.hfoot,.ob2back){display:none}
#menu.home.ob2more :is(.ob2m,.ob2by){display:none}
#menu.home.ob2more #ob2{margin-top:0;position:absolute;left:12px;bottom:12px;width:auto}
#ob2 button{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;justify-content:center;background:#fff;border:4px solid #141413;border-radius:999px;box-shadow:0 5px 0 #141413;font:italic 900 clamp(14px,2.2vw,18px) var(--hud);color:#141413;min-height:48px;padding:0 22px}
#ob2 .ob2play{width:100%;min-height:30vh;background:#ffd400;border-width:6px;border-radius:22px;box-shadow:0 10px 0 #141413;font-size:clamp(34px,7vw,64px)}
#ob2 small{display:block;font-size:14px}
#ob2 .ob2row{display:flex;gap:10px;width:100%}#ob2 .ob2row button{flex:1 1 20%;padding:0 10px}
#ob2 .ob2by{font:italic 800 12px var(--hud);color:#0b1626}
#home .hlogo .hby,#home .hc small,#topBtns button{font-size:12px!important}
body.ob2home :is(#odPin,#qaBugTop,#tuG){display:none!important}
#menu.home.ob2:not(.ob2more):not([hidden]) ~ #topBtns{display:none}
body #odNew{top:auto;bottom:8px;right:max(10px,env(safe-area-inset-right));padding:1px 4px 1px 10px;gap:6px;font-size:12px;border-width:2px}
@media (max-width:500px) and (orientation:portrait){#home .hbar h2{margin-left:150px!important}#menu.home.ob2 #ob2{margin-top:90px}.ob2row{flex-wrap:wrap}#ob2 .ob2row button{flex:1 1 40%}}`;
  document.head.appendChild(st);
  const M=document.getElementById('menu'),$$=s=>document.querySelector(s),bar=document.createElement('div');bar.id='ob2';
  bar.innerHTML=`<button class="ob2play ob2m" id="ob2Play"><span>▶ PLAY<small></small></span></button><div class="ob2row ob2m" id="ob2Row"><button data-k="#home .hc[data-a=quick]">🏁 RACES</button><button data-k="#gbMenuBtn">🔧 GARAGE</button><button data-k="#bxMenuBtn">🏗 BUILD</button><button>⋯ MORE</button></div><button class="ob2back" id="ob2Back">◀ BACK</button><div class="ob2by">Made with ❤ by Alex · 3D models by Alex</div>`;
  $$('#home').appendChild(bar);M.classList.add('ob2');
  const more=v=>{M.classList.toggle('ob2more',v);try{AU.sfx('pick')}catch(e){}};
  $$('#ob2Play').onclick=()=>$$('#hcStory').click();$$('#ob2Back').onclick=()=>more(false);
  $$('#ob2Row').onclick=e=>{const b=e.target.closest('button'),k=b&&b.dataset.k;if(!b)return;if(!k)return more(true);try{AU.sfx('pick')}catch(e){}$$(k).click()};
  let was=0,shown=0;
  const sync=()=>{const on=M.classList.contains('home')&&!M.hidden;
    if(on&&!was){M.classList.remove('ob2more');let sv=0;for(let n=1;n<=3;n++)try{if(slotInfo(n))sv=1}catch(e){}$$('#ob2Play span').firstChild.nodeValue=sv?'▶ CONTINUE':'▶ PLAY';$$('#ob2Play small').textContent=sv?'Back to Mainhattan':'Hot Drop · your first drive';
      $$('#ob2Row').style.display=sv?'':'none';$$('#home .hbar h2').textContent=sv?'WELCOME BACK':'WELCOME';
      if(!shown++)setTimeout(()=>{try{localStorage.setItem('mho_seenVer',OD_VER)}catch(e){}},7000)}
    was=on;document.body.classList.toggle('ob2home',on&&!M.classList.contains('ob2more'))};
  new MutationObserver(sync).observe(M,{attributes:true,attributeFilter:['class','hidden']});sync();window.__ob2={more};
}
