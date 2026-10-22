# Hangar screenshot review, 1440x860 (PC), 22 Oct 2026, live build after ui2

Owner: "hangar is still unreadable on PC; do one screenshot for each category and review seriously". One screenshot per tab, read by the orchestrator. Verdict: FAIL on every tab. H1 (hangar2) is checked against this list before it can go live.

| Tab | What is wrong |
|---|---|
| all | No ship anywhere. The header (HANGAR title, tabs) vanishes on FORGE and PILOT, so they look like other apps. Two currencies (Neon ◆, scrap) with no explanation. Text 11-13 px on a 1440 px screen; grey-on-navy labels are hard to read. |
| SHIP | Each ship is a 40 px round icon in a 700 px wide empty card. The row of beat dots means nothing to a player. Every card has a huge empty "Need 80 more" button. 'AFFORDABLE 0' chip is noise. |
| WEAPONS | 4 weapons show debug placeholder images with text ("wp-flame 256x256": Frost Beam, Flame Arc, Plasma Wave, Shrapnel Shell). "unlocks at 1.00x" / "power 1.00x -> 1.07x" is developer language. Every card has its own border colour. |
| FORGE | Separate layout with its own tabs (WEAPONS/MODS/PRESETS); hangar tabs gone. 30 px weapon icon in a 130x240 card; half the screen empty; "Tap 2 weapon cards: they fill A and B" instruction text instead of a clear merge screen. |
| PILOT | Header gone. Class icons are plain shapes (triangle, circle, square, diamond, dot), no pilot portraits. Stats are 3 tiny bars labelled PWR/SPD/GRD. Skills are grey rows that read as disabled. Two thirds of the screen empty. |
| UPGRADES | Long empty cards with 24 px icons, a different border colour per card, 13 px text, big empty "Need 10 more" buttons, filter chips like a web shop. |

## What a pass looks like
Ship art large in the centre with stat bars; equipment slots around it; one detail panel with a big icon, plain-words effect, level and one buy button; the same header and 3-4 tabs on every page; tiles not rows; text >= 16 px on PC, >= 14 css px on phone; no placeholder or debug text; one accent colour per category.
