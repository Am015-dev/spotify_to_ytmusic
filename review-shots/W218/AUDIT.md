# W218 audit (impeccable audit lines, one per shot)

- hub-phone.webp (390x763): four doors only (FLIGHT, ON FOOT, SETTINGS, LAB), PLAY-sized primary, 44 px+ targets, no overlap. Kept: the small cyan line above the title (incumbent, not touched).
- hub-pc.webp (1440x860): same four doors, centred column, nothing clipped.
- hud-intro-phone.webp (390x763): one caption in the top slot (stage line); the multiplier caption stands down while it shows, so no text over text.
- hud-play-phone.webp (390x763): score, multiplier and hull in the bar; one free caption row under it; nothing over the play centre.
- hud-play-pc.webp (1440x860): multiplier and its caption sit under the score plate; the caption leaves when a banner, hint or boss bar is up.
- hud-intro-pc.webp: stage banner only.

Fixes behind them: multiplier caption now yields to any banner / hint / first-seen caption / boss bar; CHAIN BROKEN sits in the bar beside the number (dropped if it will not fit) instead of a second row; power card name + LV is one label that shrinks to fit left of the bars text; phone GUARD button no longer lands on BOMB (a relayout used to put BOMB back); the now-playing note is not drawn over the touch buttons; selected-option pink deepened (white text now >= 4.5:1); back arrow centred in its 48 px plate.
