#!/usr/bin/env node
// Render the board SVG to PNG for a visual check. Usage: node render.js <game.html> [out.png] [mode=F] [svgId=map] [setupJS]
// Needs: npm i jsdom@24 @resvg/resvg-js. CSS variables are resolved from :root in the page's <style>.
const {JSDOM}=require('jsdom');const fs=require('fs');const {Resvg}=require('@resvg/resvg-js');
const [,,file,out='board.png',mode='F',id='map',setup='']=process.argv;const html=fs.readFileSync(file,'utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'});const w=dom.window;
w.eval('ANIM=0;AIDELAY=0');w.eval(`newGame('${mode}');UI.choice=null;UI.info=false;${setup};render()`);
const vars={};const root=(html.match(/:root\s*{([^}]*)}/)||[])[1]||'';root.replace(/--([\w-]+)\s*:\s*([^;]+);/g,(m,k,v)=>{vars[k]=v.trim()});
const el=w.document.getElementById(id);const vb=(el.getAttribute('viewBox')||'0 0 1000 660').split(/\s+/).map(Number);
let svg=el.outerHTML.replace('<svg',`<svg xmlns="http://www.w3.org/2000/svg" width="${vb[2]}" height="${vb[3]}"`);
for(let i=0;i<3;i++)svg=svg.replace(/var\(--([\w-]+)\)/g,(m,k)=>vars[k]||'#888');
fs.writeFileSync(out,new Resvg(svg,{fitTo:{mode:'width',value:1500},font:{loadSystemFonts:true}}).render().asPng());console.log('wrote',out);
