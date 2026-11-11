// rotate a running game portrait <-> landscape: layout follows, no scroll, board hit-testing, 0 console errors
const L=require('./phlib.js');(async()=>{const br=await L.launch();let bad=0;
const {pg,errs}=await L.open(br,390,844,'',{file:process.argv[2]||'sands.html'});await L.startGame(pg,{});await pg.waitForFunction(()=>G&&me(),null,{timeout:90000});
for(const [w,h] of [[844,390],[390,844],[740,360],[360,740]]){await pg.setViewportSize({width:w,height:h});await L.sleep(1500);
  const r=await pg.evaluate(()=>{const bd=document.querySelector('.gx-board').getBoundingClientRect(),cv=V3.r.domElement,rc=cv.getBoundingClientRect();V3.cam.updateMatrixWorld();let hit=0;
    for(let i=0;i<G.W*G.H;i++){const p=tilePos(i),v=new THREE.Vector3(p.x,TH,p.z).project(V3.cam),x=rc.left+(v.x+1)/2*rc.width,y=rc.top+(1-v.y)/2*rc.height;if(document.elementFromPoint(x,y)===cv)hit++}
    return {cls:document.documentElement.className,board:[bd.width,bd.height].map(Math.round),canvas:[rc.width,rc.height].map(Math.round),sc:[document.documentElement.scrollWidth,document.documentElement.scrollHeight],vw:innerWidth,vh:innerHeight,hit,n:G.W*G.H}});
  const ok=r.hit===r.n&&r.sc[0]<=r.vw&&r.sc[1]<=r.vh&&(w>h?/ph-l/:/ph-p/).test(r.cls)&&Math.abs(r.canvas[0]-r.board[0])<2&&Math.abs(r.canvas[1]-r.board[1])<2;if(!ok)bad++;console.log(w+'x'+h,ok?'ok':'FAIL',JSON.stringify(r))}
if(errs.length){bad++;console.log('errors',errs.slice(0,3))}console.log('PROBLEMS',bad);await br.close()})()
