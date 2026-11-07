const {chromium}=require('/home/user/spotify_to_ytmusic/games-src/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const P=process.argv[2];
for(const f of ['malePerson','femalePerson','maleAdventurer','femaleAdventurer','robot','zombie']){
 const p=await b.newPage({viewport:{width:864,height:640},deviceScaleFactor:4});
 await p.goto('file://'+P+`/r/toon_${f}.svg`);
 await p.screenshot({path:`${P}/r/toonsheet_${f}.png`,omitBackground:true}); await p.close();}
await b.close()})()
