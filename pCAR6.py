# CAR6: traffic cabins in Speed Champions style: no glass bubble. Body-coloured A/C pillars, flat slanted dark windscreen,
# flat dark side/rear windows, tile roof (hood -> cabin -> trunk steps); smoother tyres (20 segments). Needs pCAR4.
exec(open('P.py').read())
if 'CR_cab' in s:
    print('OK');raise SystemExit
assert 'CR_cityGeo' in s, 'apply pCAR4 first'
JS=r'''
function CR_cab(A){const ar=A.find(e=>e[0]==='arch'),B=ar?ar[4]:'#ffffff',D='#1d2630',out=A.filter(e=>!['ws6','ws4','bubble'].includes(e[0])&&!((e[0]==='T6x2'||e[0]==='T2x2')&&e[5]>=11));
 for(const e of out)if(e[5]>=12&&e[0]!=='T6x6')e[5]-=2;
 const add=(t,x,z,c,y)=>out.push([t,x,z,0,c,y]);
 add('s21',-3,-3,B,6);add('s21',2,-3,B,6);add('s22',-2,-3,D,6);add('s22',0,-3,D,6);
 add('B1x3',-3,-1,D,6);add('B1x3',2,-1,D,6);add('P1x3',-3,-1,D,9);add('P1x3',2,-1,D,9);
 add('B1x1',-3,2,B,6);add('B1x1',2,2,B,6);add('P1x1',-3,2,B,9);add('P1x1',2,2,B,9);add('B4x1',-2,2,D,6);add('P4x1',-2,2,D,9);
 add('P1x1',-3,-2,B,9);add('P1x1',2,-2,B,9);add('P4x1',-2,-2,D,9);add('T6x5',-3,-2,B,10);return out}
'''
i=s.index('const GB_PRE=[')
s=s[:i]+JS+'\n'+s[i:]
R("if(['sedan','sedan-sports','taxi','police','suv'].includes(nm))A.push(","if(['sedan','sedan-sports','taxi','police','suv'].includes(nm))A=CR_cab(A);if(['sedan','sedan-sports','taxi','police','suv'].includes(nm))A.push(")
R("a=new THREE.CylinderGeometry(W.r,W.r,W.w,12);a.rotateZ(Math.PI/2);const b=new THREE.CylinderGeometry(W.rim,W.rim,W.w*1.04,10);b.rotateZ(Math.PI/2);const h=new THREE.CylinderGeometry(W.rim*.35,W.rim*.35,W.w*1.08,8);",
  "a=new THREE.CylinderGeometry(W.r,W.r,W.w,20);a.rotateZ(Math.PI/2);const b=new THREE.CylinderGeometry(W.rim,W.rim,W.w*1.04,16);b.rotateZ(Math.PI/2);const h=new THREE.CylinderGeometry(W.rim*.35,W.rim*.35,W.w*1.08,12);")
# race traffic cars (k0/k1) get the same cabin
R("let A=k===0?CR_car({body:Wt,acc:Wt,wing:CR_K,noWing:1}):k===1?CR_car({body:Wt,acc:CR_K,noWing:1,x:[['sign',-1,-1,0,'#ffd12c',13]]}):","let A=k===0?CR_cab(CR_car({body:Wt,acc:Wt,wing:CR_K,noWing:1})):k===1?CR_cab(CR_car({body:Wt,acc:CR_K,noWing:1,x:[['sign',-1,-1,0,'#ffd12c',13]]})):")
save()
print('OK')
