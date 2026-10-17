# 3D asset prompts (Meshy, Tripo, Rodin, ComfyUI Hunyuan3D-2 / TRELLIS / Stable Fast 3D)

Rules (keep it ours): describe our own characters only; never name the original games, publishers
or their characters; don't feed in scans or screenshots of the original products.
Check the tool's licence for public, tip-supported use (some free tiers require a credit line
or are non-commercial). Tell me the licence of each file you send.

## Best workflow
1. **Image first, then 3D.** Make a clean concept image (same style block as the 2D prompts, but
   "3/4 front view, single object, plain light-grey background, even soft light, no shadow on the
   ground"), then run **image-to-3D**. It gives far better results than text-to-3D.
2. For characters, also make a **front + side + back** sheet ("character turnaround, T-pose or A-pose")
   if the tool takes multiple views.
3. Ask for (or decimate to) the web budget below, export **GLB**.

## Output spec
- GLB, Y-up, real-world-ish scale (1 unit = 1 m; a game piece ~0.03–0.1), origin at the base centre,
  facing +Z, applied transforms.
- Web budget: props **≤ 5k triangles**, characters/ships **≤ 15k**, hero pieces ≤ 30k.
- PBR textures: base colour (+ roughness/metal, normal) at **1024²** (2048² only for hero pieces),
  no baked lighting or shadows in the colour map.
- One object per file, no ground plane, no background, no text/logos.
- Characters: closed mouth or simple mouth shape, separate eyes if possible (for blinking), and say
  if it's rigged. Name files like `crown-voltusk.glb`.

## Style suffixes (pick one per game, add to every prompt)
- **Toy figure (Crown City, Kaiten)**: "stylised vinyl toy figure, chunky rounded shapes, soft
  matte painted finish, bold readable silhouette, game-ready low-poly"
- **Painted miniature (Shipwreck, Thornbound, Hollowbough)**: "hand-painted tabletop miniature,
  slightly exaggerated proportions, crisp edges, matte acrylic paint look, game-ready"
- **Sci-fi model kit (Nebula Aces)**: "sleek sci-fi starfighter scale model, clean panel lines,
  weathered paint, small decals without text, game-ready hard-surface"

## Crown City Smash — monsters (toy figure)
| File | Prompt |
|---|---|
| crown-voltusk.glb | a stocky yellow boar monster with lightning-bolt tusks and a blue lightning crest, angry grin, short arms, standing |
| crown-squidrik.glb | a purple one-eyed squid monster standing on curling tentacles, big single eye, smug look |
| crown-magmaw.glb | a red-orange crab monster with huge claws held high and glowing magma cracks on its shell, eyes on stalks |
| crown-shroomhulk.glb | a hulking green mushroom monster with a red spotted cap, heavy brow, fists |
| crown-boltbox.glb | a boxy blue robot monster with green screen eyes, an antenna and a grille mouth, short legs |
| crown-glacyx.glb | a pale-blue crystal ice monster made of faceted shards, fierce face, icy glow |
| crown-tower.glb | a stylised downtown skyscraper prop with neon signs (no words) and a rooftop crown spire, low-poly |

## Kaiten Kitchen — table pieces (toy figure)
| File | Prompt |
|---|---|
| kk-plate.glb | a round ceramic sushi plate, plain glaze with a coloured rim, shallow, top-down friendly |
| kk-cloche.glb | a small brass serving cloche dome with a round knob handle |
| kk-belt.glb | a straight segment of a sushi conveyor belt, brushed steel sides, cream slats, tiles end to end |
| kk-prawn.glb … | each card food from games-src/kaiten/ART-PROMPTS.md as a small figure on its plate (e.g. "a proud golden battered prawn character puffing out its chest, curled tail") |

## Nebula Aces — starfighters (sci-fi model kit)
| File | Prompt |
|---|---|
| na-dart.glb | a nimble arrow-shaped light fighter with forward-swept wings, twin engines, white and orange paint |
| na-wedge.glb | an angular wedge interceptor with a central cockpit pod and two vertical wing blades, dark grey and crimson |
| na-hammer.glb | a heavy blocky gunship with a long nose cannon and four engines, olive and tan |
| na-rock.glb | a lumpy space asteroid, cratered, dusty brown-grey, 3 variations |

## Shipwreck Isle — survival pieces (painted miniature)
| File | Prompt |
|---|---|
| sw-carpenter.glb | a castaway carpenter figure with rolled sleeves, hammer on belt, sturdy pose, base disc |
| sw-cook.glb | a castaway cook figure with apron and ladle, cheerful, base disc |
| sw-explorer.glb | a castaway explorer with spyglass and torn coat, base disc |
| sw-friday.glb | a loyal island companion figure with woven bag, friendly, base disc |
| sw-shelter.glb | a palm-leaf lean-to shelter on poles |
| sw-palisade.glb | a short wooden stake palisade wall segment |

## Living room — props (realistic)
For the room, realistic CC0 models (Poly Haven) are already used. If you want extras:
"realistic PBR [object], game-ready, 2–8k triangles": e.g. a fabric sofa, a record player on a
side table, a floor cushion, a stack of board-game boxes without labels, a sleeping ginger cat
(curled up, low-poly fur cards), a houseplant in a woven basket.

## ComfyUI settings
- Image-to-3D: **Hunyuan3D-2** (best shapes + texture) or **TRELLIS**; Stable Fast 3D for quick props.
- Feed a 1024² concept image with a clean light-grey background; remove the background first
  (BiRefNet node).
- Then decimate (e.g. to 10k) and bake textures at 1024² in Blender, check the scale, export GLB.

Send the GLB files (Drive folder) and I'll check triangle counts and textures, light them, and swap
them into the games behind a quality toggle so slower phones keep the light version.
