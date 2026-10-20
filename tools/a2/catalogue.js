// node tools/a2/catalogue.js <table.json> > docs/ASSET_CATALOGUE.md   (table.json = window.__a2.table() from `node tools/a2/probe.js <url> ath table`)
const T=JSON.parse(require('fs').readFileSync(process.argv[2],'utf8'));
const set=c=>T.filter(t=>t.city===c||t.city==='both').map(t=>t.id).join(', ');
console.log(`# Asset catalogue (assets-r21p, batch 1): ${T.length} part-list props

Source of truth: \`A2_DEF\` in \`src/98a2_assets2.js\` (each prop = a small parts list of bricks, cylinders and gable slopes in palette colours, the garage-builder approach). \`window.__a2.table()\` prints the rows below; regenerate with \`tools/a2/probe.js <url> ath table\` + \`tools/a2/catalogue.js\`.
Every prop is merged into ONE vertex-coloured geometry (shared palette \`A2_PAL\`), drawn instanced with ONE shared material. Limits (GO assets2/catalogue): ≤ 400 triangles, ≤ 3 palette colours, 1 material. All brick-built by us, so no external licence.
Placement is OFF unless \`?assets2=1\` (coordinator flips the default). Roam: kerb slots (Athens pool = Athens/both props only, Frankfurt = Frankfurt/both only), ≤ 5 instanced draws. Race: all race props of a track baked into one static mesh (1 draw).
**Collider** column is the record for the collision lane: \`c\` = circle of radius \`cr\` m around the origin (trunk/pole), \`b\` = footprint box (the \`box\` w×d, centred at \`off\` from the origin), \`none\` = decoration. Roam solids already get a plain push-out in A2 (no smash).

| id | name | category | city tag | tris | colours | box w×h×d (m) | box centre off x,z | collider |
|---|---|---|---|---|---|---|---|---|
${T.map(t=>`| ${t.id} | ${t.name} | ${t.cat} | ${t.city} | ${t.tris} | ${t.cols} | ${t.box.join('×')} | ${t.off.join(',')} | ${t.collider}${t.cr?' r='+t.cr:''} |`).join('\n')}

City sets: **Athens** (ath + both): ${set('ath')}. **Frankfurt** (fra + both): ${set('fra')}. **Race** (both cities): ${set('race')}.
Palette keys: ${Object.entries(JSON.parse(process.env.PAL||'{}')).map(([k,v])=>k+' '+v).join(', ')||'see A2_PAL'}.
`)
