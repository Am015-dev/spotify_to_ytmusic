// probe: which descendant of pl.mesh carries the roam heading rotation
module.exports=({p,tick,down,up,center,res})=>{global.SCEN=async()=>{const g=await center('#tG');await down('gas',g);await tick(120);
 res.ax=await p.evaluate(()=>{const T=__dbg.THREE,m=__mho.pl.mesh,R=__mho.RO;m.updateMatrixWorld(true);const out=[];const q=new T.Quaternion(),e=new T.Euler();
  const walk=(o,d,path)=>{if(d>3)return;o.matrixWorld.decompose(new T.Vector3(),q,new T.Vector3());e.setFromQuaternion(q,'YXZ');out.push({path,type:o.type,name:o.name,n:o.children.length,vis:o.visible,yaw:+e.y.toFixed(2),mau:o.matrixAutoUpdate});o.children.slice(0,6).forEach((c,i)=>walk(c,d+1,path+'/'+i))};
  walk(m,0,'mesh');return{h:+R.h.toFixed(2),parent:m.parent&&m.parent.type,nodes:out.slice(0,30)}});await up('gas')}};
