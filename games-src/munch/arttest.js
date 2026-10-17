const fs=require('fs');eval(fs.readFileSync('art.js','utf8')+';global.monsterArt=monsterArt;global.itemArt=itemArt;global.heroArt=heroArt;global.curseArt=curseArt');
let o='<html><body style="background:#f8f9fa">';
for(let i=0;i<8;i++)o+=`<svg width="140" height="140" viewBox="-60 -60 120 120">${monsterArt('mon'+i,i*2+1)}</svg>`;
o+='<br>';for(const s of ['head','armor','foot','1h','2h','big','potion','scroll','level'])o+=`<svg width="120" height="120" viewBox="-60 -60 120 120">${itemArt('x'+s,s)}</svg>`;
o+='<br>';for(const k of ['elf','dwarf','half','wizard','warrior','thief','cleric','human'])o+=`<svg width="120" height="120" viewBox="-60 -60 120 120">${heroArt('h'+k,k)}</svg>`;o+=`<svg width="120" height="120" viewBox="-60 -60 120 120">${curseArt('c')}</svg>`;
fs.writeFileSync('arttest.html',o);
