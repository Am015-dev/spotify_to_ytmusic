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

  /* 3D characters: models/<name>.glb (one mesh, one JPEG texture, feet on y=0, centred, longest side 1). Tiny built-in GLB reader:
     the bundled three.js has no glTF loader. A monster whose file is missing or broken keeps its built model. ?old3d=1 forces the built models. */
  const SIZE={voltusk:[2.1,3.1],squidrik:[3.0,2.8],magmaw:[2.0,3.1],shroomhulk:[3.0,2.8],boltbox:[3.2,2.6],glacyx:[2.2,3.1],cortexa:[2.8,2.6],clampede:[2.2,3.1],bramblebat:[2.2,3.1]}; // [height, widest footprint] in board units
  const YAW={voltusk:Math.PI,glacyx:-Math.PI/2}; // the file's front is -Z (voltusk) or +X (glacyx); the board wants +Z
  function parseGLB(buf){
    const dv=new DataView(buf);if(dv.getUint32(0,true)!==0x46546C67)throw new Error('not a GLB');
    let off=12,json=null,bin=null;
    while(off<buf.byteLength){const len=dv.getUint32(off,true),type=dv.getUint32(off+4,true),data=buf.slice(off+8,off+8+len);
      if(type===0x4E4F534A)json=JSON.parse(new TextDecoder().decode(data));else if(type===0x004E4942)bin=data;off+=8+len}
    const T={5126:Float32Array,5123:Uint16Array,5125:Uint32Array,5121:Uint8Array,5122:Int16Array},N={SCALAR:1,VEC2:2,VEC3:3,VEC4:4};
    const acc=i=>{const a=json.accessors[i],bv=json.bufferViews[a.bufferView],C=T[a.componentType],n=N[a.type],st=bv.byteStride,start=(bv.byteOffset||0)+(a.byteOffset||0);
      if(st&&st!==n*C.BYTES_PER_ELEMENT){const out=new C(a.count*n),src=new C(bin,bv.byteOffset||0,Math.floor((bv.byteLength)/C.BYTES_PER_ELEMENT)),step=st/C.BYTES_PER_ELEMENT,b0=(a.byteOffset||0)/C.BYTES_PER_ELEMENT;
        for(let k=0;k<a.count;k++)for(let c=0;c<n;c++)out[k*n+c]=src[b0+k*step+c];return out}
      return new C(bin.slice(start,start+a.count*n*C.BYTES_PER_ELEMENT))};
    return {json,acc,bin};
  }
  function loadGLB(url,m){
    return fetch(url).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.arrayBuffer()}).then(buf=>{
      const {json,acc,bin}=parseGLB(buf),grp=new THREE.Group();
      let tex=null;
      const mat0=json.materials&&json.materials[0],ti=mat0&&mat0.pbrMetallicRoughness&&mat0.pbrMetallicRoughness.baseColorTexture;
      if(ti!=null){const im=json.images[json.textures[ti.index].source],bv=json.bufferViews[im.bufferView];
        const blob=new Blob([bin.slice(bv.byteOffset||0,(bv.byteOffset||0)+bv.byteLength)],{type:im.mimeType||'image/jpeg'});
        const img=new Image();tex=new THREE.Texture(img);tex.flipY=false;tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
        img.onload=()=>{tex.needsUpdate=true;URL.revokeObjectURL(img.src)};img.src=URL.createObjectURL(blob)}
      const material=new THREE.MeshStandardMaterial({map:tex,roughness:.62,metalness:0,color:0xffffff});
      for(const mesh of json.meshes)for(const p of mesh.primitives){
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(acc(p.attributes.POSITION),3));
        if(p.attributes.NORMAL!=null)g.setAttribute('normal',new THREE.BufferAttribute(acc(p.attributes.NORMAL),3));
        if(p.attributes.TEXCOORD_0!=null)g.setAttribute('uv',new THREE.BufferAttribute(acc(p.attributes.TEXCOORD_0),2));
        if(p.indices!=null)g.setIndex(new THREE.BufferAttribute(acc(p.indices),1));
        if(p.attributes.NORMAL==null)g.computeVertexNormals();
        const me=new THREE.Mesh(g,material);me.castShadow=true;grp.add(me)}
      grp.rotation.y=YAW[CUT[m]]||0;grp.updateMatrixWorld(true);
      const box=new THREE.Box3().setFromObject(grp),sz=box.getSize(new THREE.Vector3()),S=SIZE[CUT[m]]||[2.4,3];
      const k=Math.min(S[0]/Math.max(sz.y,1e-6),S[1]/Math.max(sz.x,sz.z,1e-6));
      grp.scale.setScalar(k);grp.position.y=-box.min.y*k;
      const wrap=new THREE.Group();wrap.add(grp);return wrap});
  }
  window.CCMedia={
    has,play,
    model:m=>{if(/[?&]old3d=1/.test(location.search))return null;return (M.models||[]).indexOf(CUT[m])>=0?'models/'+CUT[m]+'.glb':null},
    loadGLB,
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
