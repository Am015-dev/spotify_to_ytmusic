// ==== ART step 6 · road surfaces follow the physics ground (module art5.js; patch pART5.py): filler-grid streets and crossing squares were flat planes at y=.035,
// so on hills the ground covered them (green "grass" streets) or they floated; their vertices are now draped onto groundY + offset
function ART_gy(x,z){try{return groundY(x,z)}catch(e){return 0}}
function ART_drape(g,off){const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,ART_gy(p.getX(i),p.getZ(i))+off);p.needsUpdate=true;g.computeVertexNormals();return g}
