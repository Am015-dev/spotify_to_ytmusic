const {chromium}=require('/home/user/spotify_to_ytmusic/games-src/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1400,height:1000},deviceScaleFactor:4});
for(const [f,o] of [['racing-pack/Vector/vector_objects.svg','objects'],['racing-pack/Vector/vector_roads.svg','roads']]){
 await p.goto('file://'+process.argv[2]+'/'+f);
 const bb=await p.evaluate(()=>{const r=document.documentElement.getBBox?document.documentElement.getBBox():null;return r?[r.x,r.y,r.width,r.height]:null});
 console.log(o,bb);
 const [x,y,w,h]=bb; await p.setViewportSize({width:Math.ceil(x+w)+20,height:Math.ceil(y+h)+20});
 await p.screenshot({path:process.argv[2]+'/r/'+o+'4.png',omitBackground:true});}
await b.close()})()
