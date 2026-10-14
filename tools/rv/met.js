(()=>{const o={st:state,foot:RO.foot||null};try{o.carDy=+(RO.y-groundAt(RO.x,RO.z,RO.y+3)).toFixed(2)}catch(e){}
 try{if(OF.on||RO.foot==='walk'){o.footDy=+(OF.y-groundAt(OF.x,OF.z,OF.y+2)).toFixed(2);o.footInWall=!!roamHit(OF.x,OF.z,.3,OF.y+1)}}catch(e){}
 try{const k=OF_parkChk();if(k)o.tyre=k.tyre.map(g=>+g.toFixed(2))}catch(e){}
 try{const L=OF_cars(true).filter(c=>Math.hypot(c.x-RO.x,c.z-RO.z)<40);o.cars=L.map(c=>+(c.y-groundAt(c.x,c.z,c.y+3)).toFixed(2)).filter(d=>Math.abs(d)>.15)}catch(e){}
 return o})()
