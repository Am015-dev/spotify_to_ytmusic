# Stitchwise Story: The Quilter's Year (campaign design)

Premise: Aunt Wren lends the player her thimble for one year of county fairs. Three fairs, three champion quilters. Every stage is the real game (9x9 quilt, 33 patches, time track) with ONE twist or goal; the normal rules never change.

| Act | Fair | AI level | Hints | Teaches |
|---|---|---|---|---|
| 1 | Parish Fair (c1-c3) | easy, boss normal | on | buying, placing, advancing, button spots |
| 2 | County Fair (c4-c6) | normal | off | tempo, income engine, working around damage |
| 3 | Grand Fair (c7-c10) | hard | off | tidy quilts, counting, tight finishes |

Stage 1 is preceded by the guided tutorial (offered on first launch, and as "Chapter 0" of Story until finished once).

## Stages
| id | title | opponent | goal | twist |
|---|---|---|---|---|
| c1 | First Stitches | Dame Poppy (easy) | win | none |
| c2 | Pennies and Patches | Tilly Thimble (easy) | finish with -5 or more and win | none |
| c3 | The Parish Champion (boss) | Granny Fernsby (normal) | win | boss-buttons +3 |
| c4 | County Gate | Odette Loom (normal) | win by 5 or more | none |
| c5 | Moth Season | Bram Seam (normal) | win | torn-squares 3 (your quilt) |
| c6 | The County Champion (boss) | Marguerite Bodkin (normal) | win | boss-buttons +4 |
| c7 | Grand Gates | Ivo Selvage (hard) | win | none |
| c8 | Head Start | Hester Pinwheel (hard) | win with 5 or more points | boss-patched 3 (her quilt) |
| c9 | The Tidy Quilt | Tobias Quillon (hard) | win with at most 6 empty squares | none |
| c10 | The Queen of Quilts (boss) | Queen Aurelia (hard) | win with 10 or more points | boss-buttons +3 |

## Twists (the game's own menu, `applyTwist` in `src/ui2.js`)
- `boss-buttons` N: the boss seat starts with N extra buttons.
- `torn-squares` N: your quilt starts with N torn squares that cannot be covered and count as empty (board value 99).
- `boss-patched` N: the boss quilt starts with N leather squares already sewn on (board value 100).

## Stars (checked on `metrics(G)`: won, score, margin, empty, bonus, income)
Star 1 is the stage goal; stars 2 and 3 push for a bigger margin, a tidier quilt (few empty squares), the 7x7 bonus or more income. After 2 losses the intro offers "Make it a bit easier" (AI one level down, twist off, at most 2 stars).

Unlocks: portraits of each opponent, act openings, and the title "Grand Champion". Nothing gives a gameplay advantage.

Bosses: Granny Fernsby, Marguerite Bodkin and Queen Aurelia carry a taunt (when they win) and praise (when they lose) shown on the result screen.
