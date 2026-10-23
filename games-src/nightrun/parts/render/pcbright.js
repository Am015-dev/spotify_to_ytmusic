// PURPOSE: F4, the PC flight backdrop is readable: lighter grade on the landscape (PC) screen only, the phone portrait screen is not touched
// FLAG: pcbright (?pcbright=1, off by default)
// TEST: qa/pcbright-probe.js (mean luma of the stage 1 frame, PC and phone, before -> after)
/* The PC backdrop is darkened four times (mean luma 23 of 255): the colour is drained by READ.SAT .6, then LGB.DIM .12, the top-to-bottom band LGB.BAND .3
   and DIET.DIM .22 are laid on. With pcbright the four values are lowered and a faint 'screen' lift (PCB.LIFT) raises the shadows for the landscape screen (w === W) only; ships, bullets and the HUD are drawn after the backdrop. */
if(RET.pcbright===undefined)RET.pcbright=/[?&]pcbright=1/.test(location.search);
const PCB=window.PCB={SAT:.25,DIM:.04,BAND:.12,DIET:.04,LIFT:'#1e1a34'};
if(RET.pcbright){
  const d1=READ.dim;READ.dim=function(w,h){if(w!==W)return d1.call(this,w,h);const s=this.SAT,a=LGB.DIM,b=LGB.DIMHC,c=LGB.BAND;this.SAT=PCB.SAT;LGB.DIM=LGB.DIMHC=PCB.DIM;LGB.BAND=PCB.BAND;
    try{d1.call(this,w,h);ctx.save();ctx.globalCompositeOperation='screen';ctx.fillStyle=PCB.LIFT;ctx.fillRect(-40,-40,w+80,h+80);ctx.restore();}finally{this.SAT=s;LGB.DIM=a;LGB.DIMHC=b;LGB.BAND=c;}};
  const g1=drawBG;drawBG=function(){const d=DIET.DIM;DIET.DIM=PCB.DIET;try{return g1.apply(this,arguments);}finally{DIET.DIM=d;}};
}
