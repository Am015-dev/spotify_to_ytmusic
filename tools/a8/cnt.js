(()=>{const D=__dbg;let n=0,v=0;D.scene.traverse(o=>{if(o.isMesh&&o.userData.trG){n++;v+=o.geometry.attributes.position.count}});return JSON.stringify({trGmeshes:n,trGverts:v})})()
