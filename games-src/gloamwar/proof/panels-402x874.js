// node proof/panels-402x874.js : screenshots of main screen + each panel at phone size, checks X size, scrim-close, text and tap sizes
const {chromium}=require('playwright');const path=require('path');const D=__dirname;
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:402,height:874},hasTouch:true,isMobile:true,deviceScaleFactor:2});const p=await c.newPage();const err=[];p.on('pageerror',e=>err.push(e.message));
await p.goto('file://'+path.join(D,'..','gloamwar.html')+'?fast=1');await p.waitForTimeout(500);await p.tap('#playD');await p.waitForTimeout(600);
if(await p.$('#goalGo'))await p.tap('#goalGo');await p.waitForTimeout(600);
const shot=n=>p.screenshot({path:path.join(D,n+'.png')});
const bad=async(tag)=>{const r=await p.evaluate(()=>{const o=[];document.querySelectorAll('button,.tab,.act,.die,.chip,.ib').forEach(e=>{const r=e.getBoundingClientRect();if(!r.width||!r.height||getComputedStyle(e).visibility==='hidden')return;if(e.closest('.sheet:not(.on)'))return;if(r.height<43.5||r.width<43.5)o.push('small '+(e.id||e.className)+' '+Math.round(r.width)+'x'+Math.round(r.height))});document.querySelectorAll('#msg,#acts *,#top *,.sheet.on *,.gwb *').forEach(e=>{if(e.children.length||!e.textContent.trim())return;const f=parseFloat(getComputedStyle(e).fontSize);const r=e.getBoundingClientRect();if(r.width&&f<13)o.push('text '+f+' '+e.textContent.slice(0,20))});return o});console.log(tag,r.length?r.slice(0,6):'ok')};
await shot('1-main');await bad('main');
for(const [sel,name] of [['#tCards','2-cards'],['#tNat','3-nations'],['#tComp','4-company'],['#logB','5-log'],['#helpB','6-rules']]){
 await p.tap(sel);await p.waitForTimeout(500);await shot(name);await bad(name);
 const x=await p.$('.sheet.on .x, .gxh-x, [aria-label=Close]');if(x){const bb=await x.boundingBox();console.log(name,'X',bb&&Math.round(bb.width)+'x'+Math.round(bb.height))}
 await p.touchscreen.tap(200,30);await p.waitForTimeout(500);const open=await p.evaluate(()=>!!document.querySelector('.sheet.on,.gxh-sheet.on,.gx-sheet.on'));console.log(name,'open after tap outside:',open);
 if(open){const x2=await p.$('.sheet.on .x,[aria-label=Close]');if(x2)await x2.tap();await p.waitForTimeout(400)}}
console.log('errors',err);await b.close()})();
