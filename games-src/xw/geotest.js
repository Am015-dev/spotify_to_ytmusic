const fs=require('fs'),vm=require('vm');const C={console};vm.createContext(C);vm.runInContext(fs.readFileSync('geo.js','utf8'),C);
vm.runInContext(`const p0={x:0,y:0,h:0},r=p=>'('+p.x.toFixed(1)+','+p.y.toFixed(1)+','+(p.h*180/Math.PI).toFixed(0)+'°)';
for(const m of [{s:1,t:'S',d:0},{s:3,t:'S',d:0},{s:1,t:'B',d:-1},{s:1,t:'B',d:1},{s:2,t:'T',d:-1},{s:3,t:'T',d:1},{s:4,t:'K',d:0}])console.log(JSON.stringify(m),r(finalPose(p0,40,m)),'q=40:',r(poseAt(p0,40,m,40)),'q=40.01',r(poseAt(p0,40,m,40.01)));
console.log('roll L',r(rollPose(p0,40,-1,0)),'roll R fwd',r(rollPose(p0,40,1,1)));
const a={x:0,y:0,h:0};for(const d of [{x:120,y:0,h:Math.PI},{x:250,y:150,h:0},{x:-100,y:0,h:0},{x:60,y:60,h:0}]){const rr=arcReach(a,40,d,40,'F');console.log('def',JSON.stringify(d),'arc',rr&&rr.d.toFixed(1),'range',rr&&rangeOf(rr.d),'base',baseDist(a,40,d,40).toFixed(1))}`,C);
