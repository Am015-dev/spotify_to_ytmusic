# QA contact sheets (W659)

Method: `games-src/scripts/contact-sheet.js <slug> phone|pc` for 23 games (46 sheets, /tmp/sheets), each sheet read with the Read tool, suspicious
cells zoomed from the cell png, `*-flags.txt` read. Skipped: deep-signal, mainhattan-*.
Flag caveat: nearly every PC cell is flagged "offscreen" by the script. Those are closed drawers parked off-canvas, not bugs, so they are ignored below.
Real findings come from the images. Sheet thumbnails are small: a "tiny text" entry means it is hard to read at sheet scale and was confirmed
from the flag file or a zoom where noted. Severity: high = unreadable, overlapping, cropped or broken; med = ugly/dead-looking; low = polish.
"bad cells" count = distinct cell ids (phone and pc counted separately) listed as high or med for that game.
Games owned by other workers (perch-and-plume, sands-of-qamar, thornbound, wildmark): logged only, NOT touched.

## cauldron-fair  (bad cells: 4)
| cell | mode | what is wrong | sev |
|---|---|---|---|
| cf-zoom | phone | market zoom: score bars empty and half the screen is flat dark panels; little reads as a market | med |
| cf-art / cf-board | phone | wheel ring overlaps the left edge (numbers cut at the screen edge) and the draw-bag hint sits on the HUD | low |
| story-scene | pc | speaker text and buttons very small on a huge empty brown field | low |
| cf-help | pc | tutorial card tiny against the dimmed board | low |
| cf-zoom, menu | pc | dim backdrop plus small cards; text under 13px in the market panel | med |

## crown-city-smash  (bad cells: 6)
| cell | mode | what is wrong | sev |
|---|---|---|---|
| cc-board / cc-market / cc-art | phone | the top 40% is empty orange sunburst while the market cards are tiny; "EMPTY!" panel with no content | med |
| cc-end-turn | pc | market cards slide over the monster row and hide the monster stats (verified full size) | high |
| cc-market | pc | the effect bubble (+1 energy / smashes) sits on the Harbor panel and covers its "CLOSED" text | high |
| cc-market | pc | same overlap: three market cards cover the dice tray and part of the current monster | high |
| cc-zoom | pc | market cards cover the dice tray | high |
| cc-board, cc-dice-end, cc-smash, cc-uibar | pc | right panel text is tiny (roughly 10px) and the round table is cramped | med |
| cc-art | phone | clipped crown glyph (flag) | low |
| start / menu | pc | start card tiny, centred over a blurred 3D scene | low |

## doorkick-dungeon  (bad cells: 9)
| cell | mode | what is wrong | sev |
|---|---|---|---|
| dk-win-grub, dk-win-morwen, dk-win-pip, dk-win-tansy | phone | a green floating "+9 Lv" lands on the "VICTORY! You are a Level 10 Legend" headline (text over text) | high |
| dk-win-* (4 cells) | pc | same floater over the win dialog | high |
| dk-tut-help | phone | "+2 Lv" floaters sit on the "Skip tutorial" button and the progress bar | high |
| dk-tut-help | pc | same | high |
| dk-art | phone | card names wrap and clip ("Backstabber's Shiv", "Blazing Breastplate"); level badge goes offscreen | med |
| dk-fight-bonus, dk-tut-help | pc | class labels 5-10px (flag: small 5.5px "class", 8.5px "monster") | med |
| menu | pc | cell is almost all black: a sliver of the menu drawer at the right edge and nothing else | med |
| dk-win-* | phone | stats table headers 12.8px | low |

## emberclimb  (bad cells: 6)
| cell | mode | what is wrong | sev |
|---|---|---|---|
| ec-fight-two | phone | enemy intent chips cut off at the right edge ("8 -> Sable", "8 -> Io") and the second enemy is cropped | high |
| ec-split-two, ec-split | phone | the "Slimes!" banner covers the enemies; enemy name/HP rows 12px | med |
| ec-fight-two, ec-fight | phone | hand cards overlap, card text clipped ("Cloak Guard", "Quick Cut") | med |
| ec-event | phone | bottom 40% empty parchment, three buttons float high | low |
| ec-event, ec-reward, ec-result, ec-shop | pc | right-hand panel is an empty dark column with three grey empty circles | med |
| ec-map | pc | route nodes dark-on-wood, hard to see; map occupies a quarter of the canvas | med |

## final-approach  (bad cells: 5)
| cell | mode | what is wrong | sev |
|---|---|---|---|
| fa-board, fa-end, fa-buttons, fa-ui | pc | the cockpit panel ends mid-screen and leaves a big empty dark block under it | med |
| fa-board | phone | PILOT / CO-PILOT dice trays are two flat grey-blue blobs (look disabled, no slots) | med |
| fa-brief, fa-zoom | phone | clipboard sheet crops the briefing body at the bottom edge | low |
| fa-title | phone | "New here?" link is a plain white bar that ignores the game style | low |
| fa-board | pc | HUD text under 13px | low |

## hollowbough  (bad cells: 5)
| cell | mode | what is wrong | sev |
|---|---|---|---|
| story-scene | phone+pc | "Next" button label is white on pale orange (about 1.8:1), reads as a dead button | high |
| ui-log, ui-rivals | phone | drawer opens full height with 80% empty cream | med |
| hb-hand-chips | phone | hand cards have 2px-high text rows (tiny) | med |
| hb-art / hb-board | pc | right-hand "My city" grid is a big empty dark block | low |

## kaiten-kitchen  (bad cells: 3)
| cell | mode | what is wrong | sev |
|---|---|---|---|
| story-scene | phone+pc | "Next" button label is white on pale salmon (illegible) | high |
| kk-board, kk-uibar | pc | right panel bottom half empty brown; plates tiny | med |
| kk-board | phone | three "Nothing served yet" banners dominate the screen while the dishes are small | low |

## lantern-dive  (bad cells: 3)
| cell | mode | what is wrong | sev |
|---|---|---|---|
| story-scene | phone+pc | "Next" button label is white on tan, illegible | high |
| ld-board / ld-art | phone | table is a big empty sea with one card; rival tags tiny | med |
| ld-board | pc | rival tags and trick counters are small | low |

## nebula-aces  (bad cells: 3)
| cell | mode | what is wrong | sev |
|---|---|---|---|
| nb-board, nb-help, nb-tail | phone | disabled "Plan your ships first" button is dark red on dark blue, looks dead, "Auto" also grey | high |
| nb-zoom | pc | the bottom sheet (Plan tab) covers the player ship while it is being planned | high |
| nb-art | phone | squad drawer overflows the right edge | low |
| start | pc | start card small and cluttered, flag "small 0px" labels | low |

## rampart-and-vine  (bad cells: 3)
| cell | mode | what is wrong | sev |
|---|---|---|---|
| start, menu, ui-start | phone+pc | six empty bordered slots under "Play vs computer" (player/difficulty grid) look like dead buttons | med |
| rv-art | pc | stray empty white box at the top right | med |
| rv-board (all) | phone | tiles are small on a huge wood table, mostly empty | low |

## redline-rally  (bad cells: 6)
| cell | mode | what is wrong | sev |
|---|---|---|---|
| rr-board, rr-corner, rr-lights, rr-play, rr-preview, rr-spin | pc | the 6-7 card hand does not fit its column and runs under the gear box ("1 card / 2 cards" labels hidden) and under the Go and Suggest buttons | high |
| rr-result | pc | podium panel small, standings text tiny | low |
| rr-board | pc | track view only fills 60% of height | low |

## shipwreck-isle  (bad cells: 5)
| cell | mode | what is wrong | sev |
|---|---|---|---|
| story-scene | phone+pc | "Next" button label white on coral, low contrast | high |
| story-scene | phone | "CHAPTER 1" heading is cut by the torn frame; portrait is a flat brown disc with a letter | med |
| menu | pc | cell is mostly black with the how-to-play drawer clipped at the right edge | med |
| si-board, rc-uibar | phone | three empty grey slots at the right and an empty white box next to Start day | med |
| si-zoom | phone | event tags 12px | low |
| si-board, si-art, si-help | phone | "Hammer and Nails" clipped in the roster | low |

## short-fuse  (bad cells: 3)
| cell | mode | what is wrong | sev |
|---|---|---|---|
| story-scene | phone+pc | speaker name and speech text are dark ink on a dark blue bubble (about 2:1) | high |
| sf-art..sf-zoom | phone | player name chips and "Job 1 Setup" strip are tiny; rows of blue wires leave a large flat area | med |
| menu | phone | how-to-play text dense, small | low |

## stitchwise  (bad cells: 4)
| cell | mode | what is wrong | sev |
|---|---|---|---|
| sw-result | phone | confetti covers the "Play again" label | med |
| menu | pc | cell is mostly empty navy with the menu drawer at the edge | med |
| sw-board family | phone | patch cards at the bottom use 8-10px text and the quilt grid is a blank cream block | med |
| sw-zoom | pc | zoom drawer over a washed-out empty board | low |

## sunglaze  (bad cells: 3)
| cell | mode | what is wrong | sev |
|---|---|---|---|
| menu | phone+pc | "Round 1" banner is half transparent and sits on top of a factory plate | med |
| sg-board, sg-buttons | pc | the left player card is small with tiny score grid; right board OK | low |
| story-scene | phone+pc | "Next" is white on orange, about 2.7:1 | med |

## tidewake  (bad cells: 2)
| cell | mode | what is wrong | sev |
|---|---|---|---|
| tw-art..tw-zoom | pc | right panel is two thin rows and a huge empty teal area | med |
| tw-art..tw-zoom | phone | bottom 40% is an empty teal block under two small player chips | med |

## twin-thrones  (bad cells: 2)
Re-checked at full size: the sheet thumbnail made the PC layout look tiny and the "Rival"/"You" flag looks like a false positive (labels are whole on screen). Not fixed.
| cell | mode | what is wrong | sev |
|---|---|---|---|
| tt-result | phone | portrait picture is a blank hex map with a tiny avatar (looks broken) | med |
| menu | pc | cell is empty brown with the drawer at the right | med |
| tt-board | phone | pyramid cards 8px text | low |
| tt-board, tt-select, tt-result | phone | flag: "Rival" and "You" scrollWidth > clientWidth by a few px, no visible cut | low |

## vale-of-banners  (bad cells: 2)
| cell | mode | what is wrong | sev |
|---|---|---|---|
| vb-board, vb-chain | pc | market tiles at the left are tiny and hard to read next to the large hex board | med |
| vb-board | phone | "About" link past the edge (flag), market cards 10px | low |

## vinegrave  (bad cells: 2)
| cell | mode | what is wrong | sev |
|---|---|---|---|
| vg-board family | phone | guardian/ruin cards 8-9px text; resources strip dense | med |
| vg-board, vg-market | pc | market panel cards tiny, ruin cards dark on dark | med |

## Other workers' games (logged only)
- perch-and-plume: start screen empty bottom third (phone); board rows dense text. wildmark: story map unfinished "locked" rows; result table "no pairs yet" filler. sands-of-qamar: 5x6 tile grid with 9px labels (phone), start card small. thornbound: menu drawer overlaps board on phone, card zoom very dense.
