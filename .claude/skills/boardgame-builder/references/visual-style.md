# Visual style

Graphics were the second most common complaint ("horrible", "ugly"). The fixes that worked:

## Process
1. Ask once (ask_user_input_v0) for an art direction with 3–4 options fitted to the theme. Don't guess and don't keep swapping.
2. Build a small design-token set in CSS (`--paper`, `--ink`, side colours, accent, fonts) and use only those.
3. Draw everything in inline SVG so it scales and needs no external images (published pages block remote images).
4. Render with `scripts/render.js` and actually `view` the PNG after every visual change.

## What looked good (parchment example, see assets/parchment-head.html)
- Background texture from `feTurbulence` noise multiplied into the paper colour; double ink border frame; compass rose.
- Small hand-drawn icons per location type (castle, city, tree) instead of plain circles.
- Unit stacks as "wax seals": radial-gradient disc + `feDisplacementMap` rough edge + drop shadow, count in the middle, a pill badge for elites/leaders/special pieces.
- Region ownership as soft tinted circles per region under a rough filter, at 15–20% opacity.
- Google Fonts with fallbacks: IM Fell English (display) + Cormorant Garamond (body) for a period feel.
- Warning markers (red "!") for threatened spots; dashed ring for captured spots.

## What looked bad (avoid)
- Default blue/red flat circles on white; unstyled buttons.
- Convex-hull nation "blobs": they balloon across the whole map and overlap each other.
- Tokens near the edge: keep every node ≥60px from the viewBox edge so seals and badges aren't clipped.
- Labels under tokens: place faction labels in empty space and check the render.

## Readability rules
- Every piece count readable at phone width. Minimum font 11px in SVG units at 1000px width.
- Colour is never the only signal (add icons, text or badges).
- Show dice results as real dice faces in a modal with a Continue button; auto-continue only in watch mode.

## Other themes
Pick tokens that fit: a monster dice game-style dice games suit bold comic outlines, halftone dots, chunky dice with symbol faces, a central "city" arena with monster portraits drawn as original SVG creatures. Keep the same discipline: tokens, icons, textures, render-check.
