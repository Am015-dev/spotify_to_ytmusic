/* Story clips + cast portraits. The manifest (games/crown-city-smash/media/media.json, inlined at build as
   window.CC_MEDIA) lists the files that exist; anything not listed is skipped and the game is unchanged.
   Clips: muted, playsinline, 9:16 first (contain => letterbox in landscape), tap to skip, once per chapter. */
(function(){
  const M=window.CC_MEDIA||{},BASE='media/',clips=M.clips||[],pics=M.portraits||[];
  /* ?preview=1 : open every chapter and let the clips play again (for checking). Normal play is untouched. */
  try{if(/[?&]preview=1/.test(location.search)&&window.CAMPAIGN){
    const K='gns-campaign-crown';let P={};try{P=JSON.parse(localStorage.getItem(K)||'{}')}catch(e){}
    if(!P||P.v!==1)P={v:1,ch:{},unlocked:[],last:null};P.ch=P.ch||{};P.unlocked=P.unlocked||[];
    window.CAMPAIGN.chapters.slice(0,-1).forEach(c=>{const r=P.ch[c.id]||(P.ch[c.id]={beaten:false,stars:0,best:null,tries:0,losses:0,easy:false});if(!r.beaten){r.beaten=true;r.stars=Math.max(r.stars||0,1)}});
    localStorage.setItem(K,JSON.stringify(P));localStorage.removeItem('crown-clips-seen')}}catch(e){}
  const has=k=>clips.indexOf(k)>=0;
  const KEY='crown-clips-seen';
  const seen=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}};
  const mark=k=>{try{const s=seen();s[k]=1;localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}};
  function play(key){
    return new Promise(done=>{
      if(!has(key)||seen()[key]||!document.body)return done();
      let fin=false,v,box;
      const end=()=>{if(fin)return;fin=true;clearTimeout(T);try{v.pause();v.removeAttribute('src');v.load()}catch(e){}if(box.parentNode)box.parentNode.removeChild(box);done()};
      box=document.createElement('div');box.className='ccclip';box.setAttribute('data-clip',key);
      v=document.createElement('video');v.muted=true;v.defaultMuted=true;v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('muted','');v.preload='auto';v.autoplay=true;
      const hint=document.createElement('div');hint.className='ccclip-skip';hint.textContent='Tap to skip';
      box.appendChild(v);box.appendChild(hint);
      box.addEventListener('click',end);
      v.addEventListener('ended',end);v.addEventListener('error',end);
      v.addEventListener('playing',()=>{mark(key);box.classList.add('on');if(!box._ban)slam(box,key,()=>fin)});
      const T=setTimeout(()=>{if(!box.classList.contains('on'))end()},6000); // never stuck if the clip cannot start
      document.body.appendChild(box);
      v.src=BASE+key+'.mp4';
      const p=v.play();if(p&&p.catch)p.catch(end);
    });
  }
  /* boss clips only: after half a second a BOSS banner slams in with the boss's name, a flash, a shake and a hit sound */
  function slam(box,key,isDone){
    const m=/^crown-ch(\d+)-boss$/.exec(key);if(!m)return;box._ban=1;
    setTimeout(()=>{if(isDone()||!box.parentNode)return;
      let name='';try{const c=window.CAMPAIGN.chapters.find(x=>x.id==='c'+m[1]);name=(window.CAMPAIGN.cast[c.opponent.cast]||{}).name||c.opponent.name||''}catch(e){}
      const ban=document.createElement('div');ban.className='ccclip-ban';ban.innerHTML='<i>BOSS</i><b></b>';ban.lastChild.textContent=name;
      const fl=document.createElement('div');fl.className='ccclip-flash';box.appendChild(fl);box.appendChild(ban);box.classList.add('shake');
      try{if(typeof sfx==='function'){sfx('smash');setTimeout(()=>sfx('roar'),180)}}catch(e){}
      setTimeout(()=>{box.classList.remove('shake');if(fl.parentNode)fl.parentNode.removeChild(fl)},700)},500)}
  const chapKey=(def,suffix)=>'crown-'+(suffix?'ch'+String(def.id).replace(/\D/g,'')+'-'+suffix:'ch'+String(def.id).replace(/\D/g,'')+'-intro');
  const CUT=['voltusk','squidrik','magmaw','shroomhulk','boltbox','glacyx','cortexa','clampede','bramblebat']; // MONS order
  window.CCMedia={
    has,play,
    avatar:m=>{const f='cut-'+CUT[m]+'.webp';return (M.avatars||[]).indexOf(f)>=0?f:null}, // transparent character for the player bars
    cutout:m=>{const f='cut-'+CUT[m]+'.webp';return (M.cutouts||[]).indexOf(f)>=0?f:null}, // transparent board figure, or null => the built model
    portrait:c=>{const f=c&&c.portrait;return f&&pics.indexOf(f)>=0?f:null}, // file next to index.html; null => emoji
    install(){
      if(typeof GXC==='undefined'||this.done)return;this.done=true;
      const scene=GXC.scene,boss=GXC.bossCard;
      GXC.scene=function(lines,opts){
        const def=opts&&opts.def,a=arguments,self=this;let k=null;
        try{if(def&&window.CAMPAIGN){const c=window.CAMPAIGN.chapters.find(x=>x.id===def.id);
          if(c&&lines===c.intro)k=chapKey(def,'intro');else if(c&&lines===c.outro&&def.id==='c10')k='crown-win'}}catch(e){}
        return k?play(k).catch(()=>{}).then(()=>scene.apply(self,a)):scene.apply(self,a)};
      GXC.bossCard=function(def){const a=arguments,self=this;
        return (def&&def.boss?play(chapKey(def,'boss')):Promise.resolve()).catch(()=>{}).then(()=>boss.apply(self,a))};
    }
  };
  CCMedia.install();
})();
