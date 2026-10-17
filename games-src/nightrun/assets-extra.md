
## Garage perk icons still drawn as plain line icons (added 10 Oct 2026)

The 13 base perks have no painting yet (the 15 kit perks do). Each is 128x128, transparent, same painted style as `kit-*.webp`. Save as `games/mainhattan-nightrun/media/kit-<id>.webp`; the game picks it up with no code change (the line icon shows until then).

Style block (paste in front of every prompt): Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers

| file | what to paint |
|---|---|
| `kit-dmg.webp` | Power Core: a glowing red-orange reactor core with a lightning crack. |
| `kit-rof.webp` | Rapid Coil: a coil of copper wire charged with yellow sparks, two forward chevrons behind it. |
| `kit-shd.webp` | Shield Plating: a cyan shield made of layered armour plates. |
| `kit-rgn.webp` | Shield Regen: a cyan shield with a circular refill arrow around it. |
| `kit-hul.webp` | Hull Plating: a riveted steel hull plate with a green plus cut into it. |
| `kit-dsh.webp` | Dash Capacitor: a capacitor cylinder with a bright motion streak behind it. |
| `kit-mag.webp` | Magnet Coil: a coil magnet pulling small neon crystals toward it. |
| `kit-ckp.webp` | Combo Keeper: a padlock holding a glowing orange multiplier flame. |
| `kit-pwd.webp` | Power Amp: a speaker amplifier cone with magenta shock rings. |
| `kit-crt.webp` | Critical Core: a faceted red crystal with a white starburst at its heart. |
| `kit-drn.webp` | Wingman Drone: a small round gunmetal drone with two thrusters and a cyan eye. |
| `kit-rev.webp` | Revive Token: a golden coin with a heartbeat glow, a thin halo above it. |
| `kit-nmn.webp` | Neon Mining: a pickaxe striking a cluster of neon crystals. |

Also still code-drawn (no painting exists): the garage colour-theme swatches, the HUD hull/shield bars, and the DROP-moment screen effects (all procedural on purpose; paint only if you want them replaced).

## Enemy bullet kinds (added 10 Oct 2026)

The orange shells and gold needles are now the painted lime orb turned orange or stretched; the rocket is still a drawn shape. Paint these three and the game uses them with no code change (light on black, drawn additively). Style block: Painted neon cyberpunk game effect, light on a pure black background (drawn additively), same look as the other Nightrun fx pictures, no text

| file | size | what to paint |
|---|---|---|
| `fx-bullet-rocket.webp` | 256x128 | a glowing missile flying RIGHT, pale blue-white body, red nose, orange exhaust flame trailing left, light on black. |
| `fx-bullet-shell.webp` | 128x128 | a big round orange energy shell, hot white core, molten orange glow, a thin darker ring, light on black. |
| `fx-bullet-needle.webp` | 256x64 | a thin fast lime-yellow energy needle pointing RIGHT with a short fading tail, light on black. |
