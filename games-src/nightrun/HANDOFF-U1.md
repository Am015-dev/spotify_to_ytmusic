# HANDOFF U1 (ui2)
Done: parts/menus/ui2.js (flag ui2, ON, ?ui2=0 old). Review per screen: UI2-REVIEW.md.
Left: (1) native enemy sheets (gunship, kamikaze, fleet via SPR.foe), bosses and pickups are not on the size ladder (only ENEMY_ART k-mapped enemies).
(2) the painted map panels (story/map.js ui-panel border-image) and the canvas HUD plates (uikit.js) keep their art.
(3) fingerprint boss scenario is order-dependent (state differs in the full 8-scenario run with ui2 on or off, passes alone).
