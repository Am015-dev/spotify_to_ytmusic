// env-1: a varied, painted environment (docs/ENV_REVIEW.md items 1-5 + 7a). Colour/shader only: no heights, no new textures, +0 draw calls.
// ENV_ground: world-space fbm colour patches with per-city/biome palettes (meadow + buttercup/daisy flower tint (smooth, no dots: dots alias into streaks), dry grass, dirt/sand, Wetterau field stripes),
//   slope rock + height bands on hills (forest band, meadow, alpine crown; Taunus), distance haze toward the fog colour.
// ENV_water: shallow turquoise -> deep ramp from the bank distance (aBank), fresnel sky, moving foam bands at the shore.
// Phone low tier: 2 octaves, no flowers/strata/foam noise. ?env1=0 (or TUNE.env1=0) = the old look.
function ENV_on(){if(ENV_on.v!==undefined)return ENV_on.v;let v=true;try{const q=new URLSearchParams(location.search).get('env1');if(q!==null)v=q!=='0';else if(typeof TUNE!=='undefined'&&TUNE.env1===0)v=false}catch(e){}return ENV_on.v=v}
function ENV_lo(){try{if(typeof LK_lvl==='function'&&LK_lvl()==='low')return true;return typeof SET!=='undefined'&&SET.q==='low'}catch(e){return false}}
// smooth value noise in JS (replaces the 250 m cell hash of the outer-land vertex colour)
function ENV_vn(x,z){const h=(a,b)=>{const v=Math.sin(a*127.1+b*311.7)*43758.5453;return v-Math.floor(v)},i=Math.floor(x),j=Math.floor(z);let fx=x-i,fz=z-j;fx=fx*fx*(3-2*fx);fz=fz*fz*(3-2*fz);
  const a=h(i,j),b=h(i+1,j),c=h(i,j+1),d=h(i+1,j+1);return a+(b-a)*fx+(c-a)*fz+(a-b-c+d)*fx*fz}
function ENV_pal(kind){const fra=CID==='fra';
  // [base, lush/dark, sun-dry, clover/yellow, dirt-sand] (sRGB hex, converted to linear by THREE.Color)
  const P=kind==='lawn'?(fra?['#6ab035','#4f9a2c','#8fc44a','#a6c84a','#b8a46a']:['#98a85a','#7f9a4a','#a9b565','#b9b070','#c9a066'])
    :kind==='hill'?(fra?['#5fae3a','#3f8f30','#9fc24c','#c8c455','#a08a62']:['#8a9a4e','#6b8a3e','#b9b070','#d2b673','#cfc4a8'])
    :(fra?['#7cb646','#3a8432','#cdbf5c','#a8c84e','#a9885c']:['#9aa656','#7f9a5a','#b9b070','#d2b673','#c9a066']);
  return P.map(h=>new THREE.Color(h))}
function ENV_glsl(){return`
float evH(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float evN(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(evH(i),evH(i+vec2(1.,0.)),f.x),mix(evH(i+vec2(0.,1.)),evH(i+vec2(1.)),f.x),f.y);}`}
// opt: {kind:'land'|'hill'|'lawn', s:[3 scales m], tint:true -> keep the biome vertex colour as a tint relative to base}
function ENV_ground(m,opt){if(!m||!ENV_on()||m.userData.env1)return;m.userData.env1=opt.kind;const lo=ENV_lo(),P=ENV_pal(opt.kind),s=opt.s||[900,260,70],base=new THREE.Color(opt.base||'#ffffff');
  if(opt.kind==='hill')m.flatShading=false;if(opt.kind==='land')ENV_state.land=1;
  const U={uEvP:{value:P},uEvB:{value:base}},v3=c=>`vec3(${c.r.toFixed(4)},${c.g.toFixed(4)},${c.b.toFixed(4)})`,C=h=>v3(new THREE.Color(h));
  const ob=m.onBeforeCompile,ck=m.customProgramCacheKey;
  m.onBeforeCompile=function(sh,r){if(ob)ob.call(this,sh,r);Object.assign(sh.uniforms,U);
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vEvP;varying vec3 vEvN;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\nvEvP=(modelMatrix*vec4(transformed,1.)).xyz;vEvN=normalize(mat3(modelMatrix)*objectNormal);');
    const fra=CID==='fra',K=opt.kind;
    let f=`{vec3 p=vEvP;float dist=length(p-cameraPosition);
 float n=${lo?`.62*evN(p.xz/${s[0].toFixed(1)})+.38*evN(p.xz/${s[1].toFixed(1)}+17.)`:`.5*evN(p.xz/${s[0].toFixed(1)})+.3*evN(p.xz/${s[1].toFixed(1)}+17.)+.2*evN(p.xz/${s[2].toFixed(1)}+31.)`};n=clamp((n-.5)*2.4+.5,0.,1.);
 float n2=clamp((evN(p.xz/${(s[1]*.8).toFixed(1)}+53.)-.5)*1.8+.5,0.,1.);
 vec3 pal=uEvP[0];pal=mix(pal,uEvP[1],1.-smoothstep(.22,.40,n));pal=mix(pal,uEvP[3],smoothstep(.55,.66,n)*.8);pal=mix(pal,uEvP[2],smoothstep(.70,.82,n));
 pal=mix(pal,uEvP[4],smoothstep(.72,.84,n2)*${K==='lawn'?'.35':'.8'});`;
    // texture detail kept as a luminance ratio (the neon dab texture no longer sets the hue); the biome vertex colour as a soft tint
    f+=`
 #ifdef USE_MAP
 vec3 evT=texture2D(map,vMapUv).rgb,evA=texture2D(map,vMapUv,10.).rgb;float dl=dot(evT,vec3(.3,.59,.11))/max(dot(evA,vec3(.3,.59,.11)),.02);dl=mix(1.,dl,.55);
 #else
 float dl=1.;
 #endif
 vec3 tint=vec3(1.);
 #ifdef USE_COLOR
 ${opt.tint?'tint=clamp(vColor.rgb/max(uEvB,vec3(.01)),.55,1.6);tint=mix(vec3(1.),tint,.6);':''}
 #endif
 vec3 c=pal*dl*tint;`;
    if(fra&&K==='land')f+=`
 float fw=smoothstep(3400.,3600.,p.z);if(fw>0.){vec2 d1=vec2(.8,.6);float id=floor(dot(p.xz,d1)/40.)+floor(dot(p.xz,vec2(-.6,.8))/260.)*37.;float hs=evH(vec2(id,7.));
  vec3 fc=hs<.25?${C('#d9c45a')}:hs<.33?${C('#f2d22e')}:hs<.58?${C('#8fbf3f')}:hs<.75?${C('#b58a55')}:${C('#6fbf3a')};c=mix(c,fc*dl,fw*.7);}`;
    if(!lo&&K!=='hill')f+=`
 float fl=smoothstep(.62,.8,evN(p.xz/14.+5.))*smoothstep(.45,.62,evN(p.xz/45.+3.));c=mix(c,mix(${C('#e8d95a')},${C('#f4f0e0')},step(.5,evH(floor(p.xz/40.)))),fl*.32);`;
    if(K==='lawn')f+=`
 c*=1.+.06*(step(.5,fract(dot(p.xz,vec2(.7071,.7071))/6.))-.5);`;
    // slope rock with strata + height bands (Taunus) / limestone (Athens)
    f+=`
 float slope=1.-clamp(normalize(vEvN).y,0.,1.);`;
    if(K==='hill')f+=fra?`
 float y=p.y;c=mix(c,${C('#3f7a3a')}*dl,smoothstep(6.,14.,y)*(1.-smoothstep(38.,50.,y+n*8.))*.55);
 c=mix(c,${C('#8cbf4a')}*dl,smoothstep(44.,56.,y+n*8.)*(1.-smoothstep(70.,80.,y))*.6);
 c=mix(c,${C('#e8e2cc')}*dl,smoothstep(76.,90.,y+n*10.));
 float rk=clamp(smoothstep(.12,.30,slope+.12*(n-.5))+smoothstep(.74,.86,n2)*smoothstep(35.,70.,y),0.,1.);`:`
 float rk=smoothstep(.16,.36,slope+.12*(n-.5));`;
    else f+=`
 float rk=smoothstep(.30,.52,slope+.15*(n-.5))*smoothstep(2.,8.,p.y);`;
    f+=`
 vec3 rc=${fra?`mix(${C('#8c8478')},${C('#a69d8a')},n)`:`mix(${C('#cfc4a8')},${C('#e2d8c0')},n)`};${lo?'':'rc*=1.-.1*step(.5,fract(p.y/9.+n*.6));'}c=mix(c,rc*mix(1.,dl,.5),rk);`;
    // aerial perspective: far land washes toward the fog colour before the fog itself
    f+=`
 #ifdef USE_FOG
 c=mix(c,fogColor*1.05,smoothstep(600.,3000.,dist)*.5);
 #endif
 diffuseColor.rgb=c;}`;
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vEvP;varying vec3 vEvN;uniform vec3 uEvP[5];uniform vec3 uEvB;'+ENV_glsl())
      .replace('#include <color_fragment>','#include <color_fragment>\n'+f)};
  m.customProgramCacheKey=function(){return(ck?ck.call(this):'')+'|env1'+opt.kind+(lo?'l':'')};m.needsUpdate=true}
function ENV_water(m){if(!m||!ENV_on()||m.userData.env1)return;m.userData.env1='water';ENV_state.water=1;const lo=ENV_lo(),ob=m.onBeforeCompile,ck=m.customProgramCacheKey,C=h=>{const c=new THREE.Color(h);return`vec3(${c.r.toFixed(4)},${c.g.toFixed(4)},${c.b.toFixed(4)})`};
  m.onBeforeCompile=function(sh,r){if(ob)ob.call(this,sh,r);
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>'+ENV_glsl()+'\nfloat evFr=0.;')
      .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
{float b=vBank;vec3 wc=mix(${C('#5ad1c8')},${C('#2fa3c9')},smoothstep(2.,18.,b));wc=mix(wc,${C('#12487a')},smoothstep(20.,55.,b));
 ${lo?'':'normal=normalize(normal+vec3(evN(vWP.xz*.35+uT*.4)-.5,0.,evN(vWP.xz*.3-uT*.35+9.)-.5)*.10);'}
 float fo2=smoothstep(6.,0.,b+sin(vWP.x*.35+uT*2.)*1.4);float cr=smoothstep(.45,.7,wvH(vWP.xz,uT)/.79*.5+.5);
 float fb=smoothstep(.80,.95,sin((b${lo?'':'+evN(vWP.xz*.08)*6.'})*.9-uT*1.8)*.5+.5)*(1.-smoothstep(4.,16.,b))${lo?'':'*smoothstep(.25,.6,evN(vWP.xz*.15+uT*.05))'};
 wc=mix(wc,vec3(.95,.98,1.),clamp(max(fo2*.85,cr*.3)+fb*.7,0.,1.));
 evFr=pow(1.-clamp(dot(normalize(normal),normalize(vViewPosition)),0.,1.),3.);diffuseColor.rgb=wc*(1.-evFr*.2);}`)
      .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vec3(.62,.80,.98)*evFr*.16;');
    if(!sh.fragmentShader.includes('float wvH'))sh.fragmentShader=sh.fragmentShader.replace('varying vec3 vWP;','varying vec3 vWP;\nfloat wvH(vec2 p,float t){return .38*sin(p.x*.045+t*1.6)+.26*sin(p.y*.09+p.x*.021-t*1.9)+.15*sin((p.x+p.y)*.13+t*2.7);}')};
  m.customProgramCacheKey=function(){return(ck?ck.call(this):'')+'|env1w'+(lo?'l':'')};m.needsUpdate=true}
// hooks: water via the waterMat factory, city lawns + Taunus via ART_hub (after the city materials exist); outer land in worldGroundBuild
waterMat=(f=>function(){const m=f.apply(this,arguments);try{ENV_water(m)}catch(e){console.warn('env1 water',e)}return m})(waterMat);
ART_hub=(f=>function(){const r=f.apply(this,arguments);try{if(ENV_on()&&HUB){if(HUB.M)ENV_ground(HUB.M.grass,{kind:'lawn',s:[300,80,22]});ENV_ground(HUB.tauMat,{kind:'hill',s:[700,200,60]})}}catch(e){console.warn('env1',e)}return r})(ART_hub);
// state for the checklist GO (env1/*): which materials are patched + a JS mirror of the palette mix (luminance spread of 200 outer-land points)
function ENV_state(){const mats={};try{mats.lawn=!!(HUB.M&&HUB.M.grass&&HUB.M.grass.userData.env1);mats.hill=!!(HUB.tauMat&&HUB.tauMat.userData.env1);mats.land=!!ENV_state.land;mats.water=!!ENV_state.water}catch(e){}
  const P=ENV_pal('land'),L=[],cl=new Set();for(let i=0;i<200;i++){const x=-7000+(i*7919%14000),z=-7000+(i*104729%14000),n=.5*ENV_vn(x/900,z/900)+.3*ENV_vn(x/260+17,z/260+17)+.2*ENV_vn(x/70+31,z/70+31),ss=(a,b,t)=>{t=Math.min(1,Math.max(0,(t-a)/(b-a)));return t*t*(3-2*t)};
   n=Math.min(1,Math.max(0,(n-.5)*2.4+.5));const c=P[0].clone().lerp(P[1],1-ss(.22,.40,n)).lerp(P[3],ss(.55,.66,n)*.8).lerp(P[2],ss(.70,.82,n));const hsl={};c.getHSL(hsl);cl.add(Math.round(hsl.h*24)+'/'+Math.round(hsl.l*6));L.push(.2126*c.r+.7152*c.g+.0722*c.b)}
  const mu=L.reduce((a,b)=>a+b,0)/L.length,sd=Math.sqrt(L.reduce((a,b)=>a+(b-mu)*(b-mu),0)/L.length);return{on:ENV_on(),lo:ENV_lo(),mats,lumSd:+sd.toFixed(3),relSd:+(sd/mu).toFixed(3),clusters:cl.size}}
function ENV_go(kind){const s=ENV_state(),ok=b=>b?' ✅':' ❌';if(!s.on)return'📍 env-1 is OFF (?env1=0) ❌';
  if(kind==='ground')return`ground: outer land ${s.mats.land?'patched':'NOT patched'}, lawns ${s.mats.lawn?'patched':'NOT patched'}; colour spread ${Math.round(s.relSd*100)} % (≥ 12 %), ${s.clusters} colour clusters (≥ 4)`+ok(s.mats.land&&s.mats.lawn&&s.relSd>=.12&&s.clusters>=4);
  if(kind==='hills')return CID==='fra'?`hills: Taunus slope/height shader ${s.mats.hill?'on':'OFF'} (smooth shading ${HUB.tauMat&&!HUB.tauMat.flatShading?'yes':'no'})`+ok(s.mats.hill&&!HUB.tauMat.flatShading):`hills: Athens land slope shader ${s.mats.land?'on':'OFF'}`+ok(s.mats.land);
  if(kind==='water')return CID==='fra'?`water: Main shader (bank ramp, fresnel, foam bands) ${s.mats.water?'on':'OFF'}`+ok(s.mats.water):'water: Athens has no water mesh (nothing to shade) ✅';return'?'}
window.__env={state:ENV_state,go:ENV_go};
