# Emberclimb: design fix list (D1, 8 Nov 2026)
Shots: `design-shots/emberclimb_{390,1440}_*.png`. Reached: title, tutorial step 1-2 (enemy intent, first card), Goal card. NOT reached: a
played turn, mid-game and result (the run stopped at the Goal card on the map: the Climb button was never tapped). The worker must shoot them.

## Scores (1-10)
| Row | Score |
|---|---|
| Hierarchy / focus | 7 |
| Layout and spacing | 7 |
| Typography and readability | 6 |
| Colour and contrast | 7 |
| Art and aesthetic fit | 7 |
| Goal clarity | 9 |
| Interaction states and touch targets | 6 |
| Responsive | 7 |
Overall 7.0. Rows below 7: type, touch.

## Fixes, highest impact first
1. **Hand cards are unreadable** (390 `2learn`: five cards 70px wide, name 11px, text 11px, "Vulnerable 2." wraps and overlaps the Attack tag).
   Make cards 96x136 with a horizontal scroll or two-line fan, name 14px/700, effect 13px minimum (14 preferred, drop flavour), cost badge 28px.
   File: card CSS inside `emberclimb.html` (`.card`, `.hand`).
2. **Coach card covers the enemy** (step 1: "Gnawer" art hidden behind the card at 390). Anchor it at y>=60% and point at the intent chip "Hits 4";
   or place it under the enemy. 16px text, "Next" button 44px.
3. **Hero and energy are cramped**: `Garrick 80/80` bar is at 30% opacity while the tutorial dims it; keep the player block at full brightness
   at all times, HP bar 14px high with the number inside at 14px, energy orb 64px. The status chips (`Draw 5`, `Used 0`, `Turn 1`) are 11px: raise to 14px or drop `Used`.
4. **Title shares its art with Doorkick Dungeon** (same door-kick picture). Give Emberclimb its own tower/ember picture or darken the same one
   with an ember gradient; drop the subtitle's black pill, use text-shadow `0 2px 8px #000`.
5. **Title buttons**: Quick game, How to play, Settings, Story are four equal 44px dark buttons, and the sound icon sits on top of the barrels.
   Primary "New here?" button is good (orange, 98px). Reduce the other four to a 2-column grid of 48px, move the sound toggle into Settings.
6. **Map nodes** (route screen, 48px): glowing fight nodes are 48px with 5px gaps. Make nodes 56px with 12px gaps, label the next
   choice ("Fight", "Rest", "?") in 14px under each node.
7. **Goal card is good, keep it**: raise bullets from 11px to 15px, heading `Goal` stays 20px; ensure "Climb" button is the only action.
8. **Bottom hint bar** ("Tap a glowing card to pick it...", 12px grey on near-black, ~3.2:1): 14px, colour `#e8dcc4`.
9. **End turn button is dark red on dark** when not primary (~2:1). Disabled: outline style; when no plays are left, copper fill + pulse once.
10. **1440x900**: node map spreads across the full width with 275px gaps; cap the map column at 640px and centre it.
