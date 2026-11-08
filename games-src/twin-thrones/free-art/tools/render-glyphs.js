// game-icons.net glyphs (CC BY 3.0) -> dark-ink PNG 256px, used ONLY as tiny badges inside medallions. usage: node render-glyphs.js $PACKS
const {chromium}=require('/home/user/spotify_to_ytmusic/games-src/node_modules/playwright'); const fs=require('fs');
const P=process.argv[2]; const G={'sci-wheel':'lorc/cog','sci-scale':'lorc/scales','sci-quill':'lorc/quill-ink','sci-mortar':'delapouite/mortar','sci-sundial':'lorc/sundial','sci-globe':'lorc/globe','sci-law':'lorc/stone-tablet','icon-shield':'willdabeast/round-shield','icon-vp':'lorc/laurels'};
(async()=>{const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:256,height:256}}); fs.mkdirSync(P+'/glyph',{recursive:true});
 for(const [k,v] of Object.entries(G)){ let s=fs.readFileSync(`${P}/gi/${v}.svg`,'utf8').replace(/<path d="M0 0h512v512H0z"\/>/,'').replace('<svg ','<svg width="256" height="256" fill="#2b1d0e" ');
  await pg.setContent(`<body style="margin:0;background:transparent">${s}</body>`); await pg.screenshot({path:`${P}/glyph/${k}.png`,omitBackground:true}); }
 await b.close(); console.log('glyphs ok');})();
