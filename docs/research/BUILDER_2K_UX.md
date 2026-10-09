# LEGO 2K Drive Garage / Body Shop builder: UX research (2026-10-08)

Rules: every fact has a URL. **[F]** = I fetched the page and read it. **[S]** = search-snippet only (page blocked or not fetched). "Not found" = searched but no source.
Official 2K pages (2k.com garage, patch-updates) and progameguides returned HTTP 403 to fetch, so anything from them is [S].

## 1. Part palette ("Brick Drawer")

| Fact | Source |
|---|---|
| Name is "Brick Drawer"; "hundreds of bricks to build with, sorted by type and category" | [S] https://lego.2k.com/drive/garage/ |
| Opened with Triangle (PS) in the Body Shop | [F] https://gamesfuze.com/guides/lego-2k-drive-ultimate-garage-building-guide/ ; [F] https://gamertagzero.com/the-ultimate-garage-building-guide-for-lego-2k-drive/ |
| Categories are "based on the shape of the LEGO bricks" | [F] https://gamertagzero.com/the-ultimate-garage-building-guide-for-lego-2k-drive/ |
| Controller: "R1 allows you to switch between categories while R2 shuffles through the Lego pieces inside" (reviewer confused the inputs) | [F] https://waytoomany.games/2023/05/23/review-lego-2k-drive/ |
| Size filter: "filter the available parts by size on a popout grid"; glitchy at times | [F] https://ramblingbrick.com/2023/06/27/lego-2k-drive-review-lego-mario-kart-and-microtransactions-guest-reviewer/ |
| Filter: set length and width, it returns the piece (if unlocked); some parts only findable via filter, not via category tabs; reviewer wanted category labels per part | [F] https://gamermatters.com/lego-2k-drives-vehicle-builder-is-good-enough-to-recreate-actual-lego-sets-but-there-are-limits/ |
| "Favorite tabs" exist in the Garage (only evidence: crash fix "when the player switches between favorite tabs in the Garage", Season 3 / 1.13). What they contain: not found | [F] https://mp1st.com/news/lego-2k-drive-1-13-slides-out-for-season-3-this-dec-13 |
| Part Locator (Season 3): "search for specific Brick types via their respective ID numbers"; shows vehicles that have the part and how to obtain it | [F] https://mp1st.com/news/lego-2k-drive-1-13-slides-out-for-season-3-this-dec-13 |
| "Improved Garage UX" (1.08, no details) | [F] https://mp1st.com/news/lego-2k-drive-update-1-08-for-july-7-brings-improvements-and-more |
| Patch fix: "parts are not mirroring or categorizing correctly in Garage" | [S] https://steamcommunity.com/app/1451810/announcements/ |
| Over 1,000 brick types | [F] https://www.gtplanet.net/lego-2k-drive-review-block-party-20230518/ |
| Text search by name, "Recently used" list, tile grid size / row count | not found |

## 2. Body Shop modes, selection, grouping, visibility

| Fact | Source |
|---|---|
| Body Shop options: Build, Paint, Group, Customize | [F] https://www.touchtapplay.com/how-to-build-a-custom-car-in-lego-2k-drive/ ; [S] https://progameguides.com/lego-2k-drive/how-to-build-your-own-vehicles-in-lego-2k-drive/ |
| Group = "locking bricks together to create one main piece" | [F] https://www.touchtapplay.com/how-to-build-a-custom-car-in-lego-2k-drive/ |
| Group = "lock and band several pieces together so you can move them together", handy for small detail pieces | [S] https://progameguides.com/lego-2k-drive/how-to-build-your-own-vehicles-in-lego-2k-drive/ |
| Group lives in its own selection menu, not in Build; "used to have multiple objects act as a single group" (one forum reply) | [F] https://steamcommunity.com/app/1451810/discussions/0/3812908123793708684/ |
| "Select up" = selects all bricks directly attached to the current selection | [F] https://gamermatters.com/lego-2k-drives-vehicle-builder-is-good-enough-to-recreate-actual-lego-sets-but-there-are-limits/ |
| Multi-select placed bricks, then move or recolour them together | [F] same gamermatters URL ; [F] https://www.gtplanet.net/lego-2k-drive-review-block-party-20230518/ |
| No separate sub-assembly area; workaround = temporary bricks attached far from the car | [F] same gamermatters URL |
| Mirror tool: build one side by hand, "simple mirror-imaging tool" creates the other side in perfect symmetry (dev interview) | [F] https://www.dualshockers.com/interview-lego-2k-drive-customization-garage/ |
| Undo exists | [F] https://www.gtplanet.net/lego-2k-drive-review-block-party-20230518/ |
| Duplicate whole vehicle ("Modify" makes a copy; duplicate designs) | [F] https://candidbricks.com/2023/06/27/lego-2k-drive-a-test-drive-review/ |
| Hide / isolate / show-hide per group, x-ray, hide layers | not found (searched 4 ways) |
| Duplicate / mirror / delete a *group* specifically | not found |

## 3. Camera, snapping, limits

| Fact | Source |
|---|---|
| Bricks "auto-snap in a satisfying manner"; any legal snap allowed | [F] gamermatters URL above |
| Snap stud-to-tube; rotate and flip pieces | [S] https://progameguides.com/lego-2k-drive/how-to-build-your-own-vehicles-in-lego-2k-drive/ |
| "Each block can be manipulated for orientation in exactly the same way it could if it were in your hands" | [F] https://www.gtplanet.net/lego-2k-drive-review-block-party-20230518/ |
| Rotating/placing with controller "a bit fiddly"; mouse+keyboard "quite fiddly", often several tries to place | [F] gamermatters URL ; [F] ramblingbrick URL above |
| Yellow arrow on the platform marks the car front | [F] gamesfuze URL above |
| ~350 parts per vehicle | [F] https://www.dualshockers.com/interview-lego-2k-drive-customization-garage/ |
| Build volume ~20 studs wide, 30 long, 12 tall | [F] https://www.gtplanet.net/lego-2k-drive-review-block-party-20230518/ |
| Build Limit bar fills with bricks, colours and decorations | [F] gamesfuze URL above |
| Camera orbit/zoom/focus-on-selection controls, build-mode key bindings | not found (DefKey lists only driving keys: https://defkey.com/lego-2k-drive-shortcuts [S]) |

## 4. Comparable builders (reference only)

| Tool | Feature | Source |
|---|---|---|
| BrickLink Studio | Hide (L) hides bricks or sub-models; "Show All" button top-right restores | [F] https://brickbanter.com/2023/11/22/getting-started-with-lego-bricklink-studio/ |
| Studio | Select by Colour / Type / Type+Colour / Invert Selection; Clone (C); Hinge (H); grid snap coarse/medium/fine | [F] same URL |
| Studio | Submodel: select bricks, Ctrl+G, name it; moves as one object; double-click edits in place (rest shown as wireframe); copies are linked; "copy and mirror" makes a mirrored clone | [F] https://brickbanter.com/2023/05/15/tutorial-lego-bricklink-studio-using-submodels-to-build-better/ |
| Studio | Palette tabs Shapes / BL Categories / Colors; custom folders; search by ID or text; custom palettes | [S] https://studiohelp.bricklink.com/hc/en-us/articles/6502499385111 ; https://studiohelp.bricklink.com/hc/en-us/articles/5428782263447 |
| Studio | Isolate command | not found (invert selection + hide is the workaround, my inference) |
| Mecabricks | Groups to reselect bricks easily; temporary hide/show elements; Clone (D); snapping "most important function" | [F] https://brickset.com/article/52336/let-s-build-in-mecabricks! |
| LEGO Worlds | Build camera focuses on the build, ghost "shadow" of current brick, view can rotate/zoom; bricks snap | [S] https://www.playstationcountry.com/?p=6179 |

## What we copy

| Ours | Grounded in | Note |
|---|---|---|
| **(a) Bigger palette + category chips + Recent + Favourites** | 2K: categories by shape, R1/R2 category→part cycling, size grid filter, "favorite tabs", Part Locator; Studio: Shapes/Categories tabs, search | Chips = shape categories; add a W×L size filter (2K's most-praised palette feature); Favourites tab is in 2K (contents unknown); **Recent is our addition** (not found in 2K). Show category label on each tile (reviewer complaint). |
| **(b) Named groups, eye show/hide, select/move/duplicate/mirror/delete per group** | 2K: Group mode = move as one; "Select up" connected-select; mirror tool for symmetry; Studio: named submodels (Ctrl+G), Hide/Show All, copy-and-mirror; Mecabricks: groups for reselect + hide/show | Names + eye toggle come from Studio/Mecabricks, **not 2K** (no 2K hide found). Add "select connected" like 2K Select up. Mirror per group = Studio "copy and mirror". |
| **(c) Hide layers above** | not found in 2K or the others | Our own feature; closest refs: Studio Hide + Show All, Mecabricks hide to reach the inside of a build. Keep a one-tap "show all". |
| Also | 2K snapping praised, rotation called fiddly on pad and mouse | Prioritise forgiving snap + one-tap rotate/flip; undo always visible. |
