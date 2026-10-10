// su/thumbs.js <url> <outdir> [ids]: big offscreen renders of templates (front 3/4, side, rear 3/4, low side) via G9C_render — fast look-dev loop
const E=require('../bc/enter.js');const fs=require('fs');const OUT=process.argv[3]||'su/th';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const T=await E(process.argv[2],{gfx:'normal',tick:0});const ids=(process.argv[4]||'t_su,t_su_mid,t_su_gt,t_su_wide,t_su_sky,t_su_pink,t_su_v8').split(',');
 for(const id of ids)for(const [n,ry] of [['f',2.35],['s',1.5708],['r',-2.35+6.283]]){
  const u=await T.ev(`(()=>{G9C.ry=${ry};G9C.th.clear();const S=GAR_set('${id}');const u=G9C_render(S,'car',852,393);G9C.ry=2.35;G9C.th.clear();return u})()`);
  if(u)fs.writeFileSync(`${OUT}/${id}_${n}.png`,Buffer.from(u.split(',')[1],'base64'));else console.log('no render',id)}
 console.log('errs',T.errs.length,JSON.stringify(T.errs.slice(0,5)));await T.b.close()})().catch(e=>{console.log('FAIL',e);process.exit(1)});
