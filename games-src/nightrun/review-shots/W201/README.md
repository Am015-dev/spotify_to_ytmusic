# W201 flight look: before / after (flight stage 1)

The before shots use `?flylook=0` and the after shots use the default. All 16 are WebP q82 at 390x763 (phone) and 1440x860 (PC). They were taken with `qa/flylook-shots.js`, in real time with god mode and the same seeded random numbers, so the waves match but the exact positions differ between runs. The orchestrator drops this folder at merge.

| shot | what it shows | before → after |
|---|---|---|
| `*-5s-*` | first wave enters | ships are tinted toward the city's violet and get a neon top light and dark undersides; the rail deck at the bottom sits in haze instead of a hard dark band |
| `*-20s-*` | mixed wave and kills | warm brass/olive ships turn mauve; the kill blasts are a flash, a fireball, smoke and sparks instead of a flat white additive cloud |
| `*-40s-*` | the armoured carrier set piece (PC); a busy wave (phone) | the slate polygon with a flat pink disc becomes a shaded hull with a lit edge and a glossy, glowing core |
| `*-boom-*` | one big blast (a gunship's kill event set off at 12 s, shot 0.06 s later) | before: a bright additive blob; after: the painted fire sheet with its dark smoke and debris, plus streaks |

## Strict comparison with the benchmark (FLIGHT-BAR.md)

References are two well-regarded side-scrolling shooters' store pages, with screenshots in the page gallery. They are links only, nothing is downloaded, and no names are given here:
- https://store.steampowered.com/app/1856900 (2022, 94% positive user reviews)
- https://www.siliconera.com/gothic-shmup-deathsmiles-now-steam/

Caveat: this session could not open the gallery images (the tools only return text), so the comparison below is against what this genre's reference screenshots typically show and the FLIGHT-BAR rules. The owner should look at both galleries next to these shots.

- **Layering.** The references draw every layer in one consistent pixel style and resolution. The parallax steps are clearly different, the far layer moves, and the foreground silhouettes are dark and crisp. **Ours is still worse.** The far skyline is baked into the sky picture and barely moves (0.03), so the mid skyline does all the parallax work, and the painted backdrop is much more detailed than the small ship sprites. W201 only softened the rail-deck edge (the brightness jump there is down from about 7.7 to 0.5).
- **Depth.** The references use contrast falloff: the far layers are low-contrast and the play layer is bright. Ours is closer after W201 (haze at the deck, ships shaded from below), but the whole backdrop is still as busy and as bright as the play layer, so ships do not pop. **Still worse.**
- **Palette.** The references keep the sprites and the stage in one limited palette. After W201 the ships share the city's violet (colour distance to the backdrop is down from 53.9 to about 24), which removes the "sticker" look. The trade-off is that the gunships now read mauve-pink and slightly muddy. This is better than before, but not yet at their level.
- **Explosions.** The references have big, multi-frame blasts with a white core, debris and lingering smoke, and the screen reacts. After W201 the blasts show real fire, smoke and sparks instead of a flat white cloud. But in `after-boom-pc` the blast is dim and has no strong bright core at that instant: it is **less punchy than the old additive blob**, though more believable. A brighter, longer core flash is the next step.

**Verdict:** this is better than before on palette, the carrier and how explosions read. It is **still clearly below the reference standard** on layering and depth (the backdrop competes with the play layer) and on explosion punch. Not ready to call "good-looking"; the remaining fixes are in `../../HANDOFF-W201.md`.
