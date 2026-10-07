/* Story clips + cast portraits. The manifest (games/crown-city-smash/media/media.json, inlined at build as
   window.CC_MEDIA) lists the files that exist; anything not listed is skipped and the game is unchanged.
   Clips: muted, playsinline, 9:16 first (contain => letterbox in landscape), tap to skip, once per chapter. */
(function(){
  const M=window.CC_MEDIA||{},BASE='media/',clips=M.clips||[],pics=M.portraits||[];
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
      v.addEventListener('playing',()=>{mark(key);box.classList.add('on')});
      const T=setTimeout(()=>{if(!box.classList.contains('on'))end()},6000); // never stuck if the clip cannot start
      document.body.appendChild(box);
      v.src=BASE+key+'.mp4';
      const p=v.play();if(p&&p.catch)p.catch(end);
    });
  }
  const chapKey=(def,suffix)=>'crown-'+(suffix?'ch'+String(def.id).replace(/\D/g,'')+'-'+suffix:'ch'+String(def.id).replace(/\D/g,'')+'-intro');
  window.CCMedia={
    has,play,
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
