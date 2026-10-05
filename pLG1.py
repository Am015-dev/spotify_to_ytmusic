# LG1: garage LEGO presets on a blank wireframe baseplate (2K-Drive style start) + 6 themed designs.
# Builder starts from an empty 8x12 stud baseplate on 4 wheels; the jet hull is hidden while a design uses it.
# Presets EBBELWOI, SKYLINE, ATHENS TAXI, AEGEAN, POLICE, FIRE; preset buttons moved to a 12 px side column; CHASSIS button toggles hull/baseplate.
exec(open('P.py').read())
if 'GB_BPLATE' in s:
    print('OK');raise SystemExit
PRE=r'''const GB_BPLATE=1;
const GB_PRE=(()=>{const G=(t,c,xs,zs,r=0)=>xs.flatMap(x=>zs.map(z=>[t,x,z,r,c])),B=c=>G('b24',c,[-4,-2],[-6,-2,2]);return[
 ['EBBELWOI',[...B(0),...G('b12',9,[-4,-1],[-6,-2,2]),...G('b12',11,[-4,-1],[-4,0,4]),...G('b24',9,[-3],[-6,-2,2]),
  ...G('slope',9,[-4,-2],[-6]),...G('slope',9,[-4,-2],[4],2),...G('b24',9,[-4,-2],[-4,0]),...G('tile',0,[-1],[-4,-2,0,2]),['light',-1,-5,0,2]]],
 ['SKYLINE',[...B(10),...G('b24',6,[-4,-2],[-2,2]),...G('b22',5,[-1],[-2,0]),...G('b22',6,[-1],[-2,0]),...G('b22',5,[-1],[-2,0]),...G('b22',6,[-1],[-2,0]),
  ...G('b12',10,[-2],[-2,0]),...G('b12',10,[-2],[-2,0]),...G('b12',10,[-2],[-2,0]),...G('b12',10,[-2],[-2,0]),...G('b12',10,[-2],[-2,0]),...G('wedge',10,[-4],[-6]),
  ['round',-4,4,0,10],['round',-4,4,0,10],['round',-4,4,0,10],['spoiler',-2,4,0,6],['light',-1,-6,0,9]]],
 ['ATHENS TAXI',[...B(2),...G('tile',11,[-4],[-6,-2,2]),...G('tile',9,[-4],[-4,0,4]),...G('b22',2,[-3,-1],[-2,0]),...G('b22',11,[-3,-1],[-4,2]),
  ['b12',-1,-1,1,9],['b12',-1,-1,1,9],['light',-2,-6,0,9],['light',-4,5,0,0]]],
 ['AEGEAN',[...B(6),...B(9),...B(6),...G('b24',9,[-4,-2],[-2]),...G('b12',6,[-4,-2],[2,4]),['flag',-4,5,0,6],['light',-2,-6,0,9]]],
 ['POLICE',[...B(9),...G('b24',6,[-4],[-6,-2,2]),...G('b24',9,[-2],[-6,2]),...G('b24',11,[-2],[-2]),...G('b24',9,[-2],[-2]),
  ['light',-2,-1,0,6],['light',-1,-1,0,0],['light',-4,-6,0,0],['light',-1,-6,0,6]]],
 ['FIRE',[...B(0),...B(0),...G('tile',9,[-4],[-6,-4,-2,0,2,4]),...G('tile',10,[-2],[-6,-4,-2,0,2,4]),
  ...G('tile',10,[-1],[-6,-5,-4,-3,-2,-1,0,1,2,3,4,5],1).filter((e,i)=>i%2==0),['light',-3,-6,0,0],['light',-1,-6,0,2],['round',-4,3,0,10],['round',-4,1,0,10]]]]})();
function GB_preset'''
i,j=between('const GB_PRE=[','function GB_preset')
s=s[:i]+PRE+s[j+len('function GB_preset'):]
# preset also switches to the baseplate; cell lookups fall back harmlessly
R("function GB_preset(k){const P=GB_PRE[k];if(!P||!GB_.base)return 0;GB_snap();GB.d.bricks=[];",
  "function GB_preset(k){const P=GB_PRE[k];if(!P||!GB_.base)return 0;GB_snap();GB.d.bricks=[];if(!GB.d.bp){GB.d.bp=1;GB_scanBase();GB_gridMesh()}")
# baseplate base grid
R("function GB_scanBase(){GB.mesh.updateMatrixWorld(true);",
  "function GB_scanBase(){GB.mesh.updateMatrixWorld(true);if(GB.d.bp){GB_.hull=[];const B={};for(let i=-4;i<=3;i++)for(let j=-6;j<=5;j++)B[i+','+j]=0;GB_.base=B;return}")
# attach: hide hull + draw plate
R("function GB_attach(g,bricks,fig,cache){const U=g.userData,host=U.carG||U.m;for(const o of U.gbM||[]){host.remove(o);if(!o.userData.gbc)o.geometry.dispose()}U.gbM=[];if(!(bricks&&bricks.length)&&!fig)return;\n const key=JSON.stringify([bricks,fig]);",
  """function GB_plate(){const M=[],u=GB_U,P='#3b4452';M.push(GB_box(-4*u,4*u,-.2,0,-6*u,6*u,P));M.push(GB_box(-4*u+.05,4*u-.05,-.05,.0,-6*u+.05,-6*u+.12,'#ffd12c'));
 for(const sx of[-1,1])for(const sz of[-1,1]){const w=GB_cyl(.44,.34,0,-.17,0,'#15181d',14);w.rotateZ(Math.PI/2);w.translate(sx*(4*u+.08),-.12,sz*3.1);M.push(w);const h=GB_cyl(.2,.4,0,-.2,0,'#c9ced6',10);h.rotateZ(Math.PI/2);h.translate(sx*(4*u+.1),-.12,sz*3.1);M.push(h)}return mergeGeometries(M)}
function GB_attach(g,bricks,fig,cache,bp){const U=g.userData,host=U.carG||U.m;for(const o of U.gbM||[]){host.remove(o);if(!o.userData.gbc)o.geometry.dispose()}U.gbM=[];for(const o of U.gbHid||[])o.visible=true;U.gbHid=[];
 if(bp)host.traverse(o=>{if(o.isMesh&&o.visible&&!o.userData.gb&&!o.userData.gbG){o.visible=false;U.gbHid.push(o)}});
 if(bp){const o=new THREE.Mesh(GB_plate(),GB_MAT);o.userData.gb=1;host.add(o);U.gbM.push(o)}
 if(!(bricks&&bricks.length)&&!fig)return;
 const key=JSON.stringify([bricks,fig]);""")
R("GB_attach(g,team.gbB,team.gbF,true)","GB_attach(g,team.gbB,team.gbF,true,team.gbP)")
R("t.gbB=br;","t.gbB=br;t.gbP=!!(b&&b.on&&b.bp);")
R("GB_attach(GB.mesh,GB_list(),GB_figGet(),false);","GB_attach(GB.mesh,GB_list(),GB_figGet(),false,!!GB.d.bp);")
# new designs start blank on the baseplate
R("GB_.yaw=GB.rot;GB_scanBase();","if(GB.d.bp==null&&!GB_list().length)GB.d.bp=1;GB_.yaw=GB.rot;GB_scanBase();")
# toolbar: presets in a 12 px side column, CHASSIS toggle
R("${GB_PRE.map((p,i)=>`<button data-a=\"pre${i}\">${p[0]}</button>`).join('')}<button data-a=\"clr\">CLEAR</button>",
  "<button data-a=\"bp\" title=\"Blank baseplate or jet chassis\">⬛ BASE</button><button data-a=\"clr\">CLEAR</button><div id=\"gbBkS\">${GB_PRE.map((p,i)=>`<button data-a=\"pre${i}\">${p[0]}</button>`).join('')}</div>")
R("else if(a==='clr'){GB_snap();GB.d.bricks=[];GB_refresh()}",
  "else if(a==='clr'){GB_snap();GB.d.bricks=[];GB_refresh()}else if(a==='bp'){GB_snap();GB.d.bricks=[];GB.d.bp=GB.d.bp?0:1;GB_scanBase();GB_gridMesh();GB_refresh()}")
R("#gbBkT>*{pointer-events:auto}",
  "#gbBkT>*{pointer-events:auto}#gbBkS{position:fixed;right:8px;top:calc(96px + env(safe-area-inset-top,0px));display:grid;grid-template-columns:auto auto;gap:5px}#gbBkS button{height:30px!important;padding:0 8px!important;font-size:12px!important;letter-spacing:0!important;white-space:nowrap}")
R("GB_attach=(f=>function(g,b,fig,cache){SC_S.drv=!!cache&&SC_S.on;try{return f(g,b,fig,cache)}finally{SC_S.drv=false}})(GB_attach);","GB_attach=(f=>function(g,b,fig,cache,bp){SC_S.drv=!!cache&&SC_S.on;try{return f(g,b,fig,cache,bp)}finally{SC_S.drv=false}})(GB_attach);")
R("window.__gb={GB_,","window.__gb={mesh:()=>GB.mesh,GB_,")
save()
print('OK')
