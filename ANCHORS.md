# AU (audio + polish) — merge anchors

Patch order: `./reapply.sh pAU1.py pAU2.py` → REAPPLY_OK. Both are independent of each other.

## pAU1.py — one code anchor
| anchor (exact) | count | what happens |
|---|---|---|
| `window.__mho={` | 1 | the whole of `au.js` is inserted immediately **before** it (same spot m1.js uses; inserted text never contains the anchor). |

All CSS is injected at runtime from au.js (a `<style>` tag). No HTML anchors.

### Runtime re-bindings (no text anchors; they need these names to stay reassignable functions / object methods)
`AU.sched` (replaced: adaptive music), `AU.engine` and `AU.sfx` (wrapped), `studBurst`, `smashCheck`, `comboAdd`, `roamCam`, `showResults`, `chEnd` (wrapped, fall straight through).
Read-only globals: AU, SET, state, paused, RO, pl, ships, CID, M1 (optional), M1_scene/M1_csEnd, HUB, V3, clamp, shake, fovKick, hitPop, comboMult, OTG_GOAL, OTG_HI, openSettings.
New globals are prefixed `AU_` (plus `window.__au` test handle). localStorage: reuses the existing `mho_portok` key (portrait hint seen).

## pAU2.py — English UI text (exact string-literal swaps)
| old (exact) | new | count |
|---|---|---|
| `npcSay(e,'Los geht’s!')` | `npcSay(e,'Let’s go!')` | 1 |
| `feed('BAUSTELLE'` | `feed('ROADWORKS'` | 1 |
| `edgeT:'TELOS TOU CHARTI'` | `edgeT:'EDGE OF THE MAP'` | 1 |
| `edgeT:'ENDE DER KARTE'` | `edgeT:'EDGE OF THE MAP'` | 1 |
| `ch:'Kefalaio'` | `ch:'Chapter'` | 1 |
| `ch:'Kapitel'` | `ch:'Chapter'` | 1 |
| `fb:['Athina','Attiki']` | `fb:['Athens','Attica']` | 1 |
| `fb:['Frankfurt','Umland']` | `fb:['Frankfurt','Outskirts']` | 1 |
| `title:'Kalos irthes stin Athina'` | `title:'Welcome to Athens'` | 1 |
| `title:'Ta stena tis Plakas'` | `title:'The Alleys of Plaka'` | 1 |
| `title:'O Drakos'` | `title:'Drakos'` | 1 |
| `title:'Neu in Mainhattan'` | `title:'New in Mainhattan'` | 1 |
| `title:'Die Hafenbande'` | `title:'The Harbour Gang'` | 1 |
| `title:'Chapter 2 · Die Hafenbande'` | `title:'Chapter 2 · The Harbour Gang'` | 1 |
| `title:'Kaisers Schatten'` | `title:'Kaiser’s Shadow'` | 1 |
| `title:'Das Finale'` | `title:'The Finale'` | 1 |
| `name:'Feierabend'` | `name:'After Hours'` | 1 |
| `name:'Rushhour'` | `name:'Rush Hour'` | 1 |
| `name:'Brücke gesperrt'` | `name:'Bridge Closed'` | 1 |
| `name:'Letzte Bahn'` | `name:'Last Train'` | 1 |
| `name:'Takedown-Rausch'` | `name:'Takedown Frenzy'` | 1 |
| `name:'Nachtfinale'` | `name:'Night Finale'` | 1 |
| `name:'Hügel Cup'` | `name:'Hill Cup'` | 1 |
| `name:'Brückensprint'` | `name:'Bridge Sprint'` | 1 |
| `'Landeanflug auf Fraport…'` | `'Approaching Fraport…'` | 1 |
| `'Hinauf in den Taunus…'` | `'Up into the Taunus…'` | 1 |
| `'Ankunft im Kurpark Bad Homburg…'` | `'Arriving at the Bad Homburg spa park…'` | 1 |
| `'Einfahrt nach Bad Vilbel…'` | `'Driving into Bad Vilbel…'` | 1 |
| `'Über die Felder der Wetterau…'` | `'Across the Wetterau fields…'` | 1 |
| `'Einlaufen in den Hafen Offenbach…'` | `'Sailing into Offenbach harbour…'` | 1 |
| `'Industriepark Höchst…'` | `'Höchst industrial park…'` | 1 |
| `'Kräne am Osthafen…'` | `'Cranes at the Osthafen…'` | 1 |
| `'Durch den Stadtwald…'` | `'Through the Stadtwald…'` | 1 |
| `'Zubringer A` | `'Feeder road A` | 6 |
| `'Danke! You saved my Sunday.'` | `'Thanks! You saved my Sunday.'` | 1 |
| `'Clear streets! Danke.'` | `'Clear streets! Thanks.'` | 1 |
| `'Ach, I’ll call the ADAC then.'` | `'Oh well, I’ll call the ADAC then.'` | 1 |
| `'Ach, I will walk then.'` | `'Oh well, I will walk then.'` | 1 |
| `'Efcharistó! You are a hero.'` | `'Thank you! You are a hero.'` | 1 |
| `'Ach! I forgot the sorrel.` | `'Oh no! I forgot the sorrel.` | 1 |
| `'Ach! The barrels!` | `'Oh no! The barrels!` | 1 |
| `win:'Wunderbar! Not a single` | `win:'Wonderful! Not a single` | 1 |
| `lose:'Ach nein… the pigeons` | `lose:'Oh no… the pigeons` | 1 |
| `'Siga siga… too slow!'` | `'Easy, easy… too slow!'` | 1 |
| `'Siga siga… too slow.'` | `'Easy, easy… too slow.'` | 1 |
| `'Ela! You are fast.'` | `'Wow! You are fast.'` | 1 |
| `My yiayia drives faster` | `My grandma drives faster` | 2 |
| `e_police:['Astynomia'` | `e_police:['Athens Police'` | 1 |
| `e_police:['Polizei Frankfurt'` | `e_police:['Frankfurt Police'` | 1 |
| `Kalimera, champion` | `Good morning, champion` | 2 |
| `'Opa! Beautiful!'` | `'Yes! Beautiful!'` | 1 |
| `'Opa! The party is saved!'` | `'Hooray! The party is saved!'` | 1 |
| `in Athens! Opa! This is for you.` | `in Athens! Cheers! This is for you.` | 1 |
| `'The band is complete! Opa!'` | `'The band is complete! Let’s dance!'` | 1 |
| `flatten the old tower. Opa!'` | `flatten the old tower. Go!'` | 1 |
| `'Smash! Smash! Opa!'` | `'Smash! Smash! Smash!'` | 1 |
| `'The tower! Full speed! OPA!'` | `'The tower! Full speed! GO!'` | 1 |
| `win:'OPA! Best plate-smashing ever!'` | `win:'YES! Best plate-smashing ever!'` | 1 |
| `txt:"Opa! The Akropolis Cup` | `txt:"Bravo! The Akropolis Cup` | 1 |
| `'Clear streets! Efcharistó.'` | `'Clear streets! Thank you.'` | 1 |
