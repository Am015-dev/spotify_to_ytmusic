# Redline Rally: independent review R2 (7 Nov 2026)

Played live (https://am015-dev.github.io/spotify_to_ytmusic/redline-rally/) with real input only:
- Phone 390x763, CDP touch: Sunline Speedway, 1 lap, 4 rivals, Normal. 7 rounds, ~1.5 min, finished 5th of 5.
- PC 1440x860, mouse: Hairpin Hill, 1 lap, 4 rivals, Hard. 11 rounds, ~2 min, finished 4th of 5.
No console errors in either run. Art not judged (placeholders).

Anchor: 7 = a stranger would happily play it again.

| # | Row | Score | Why (screen, what a player would say) |
|---|-----|-------|------|
| 1 | First minute | 7 | Title fits one phone screen, defaults are sane, Play drops you straight on the grid with "Pick 1 more card" and a live speed/corner line. Learnable without the rules drawer. |
| 2 | Clarity of the core decision | 7 | The plan panel line ("Speed 9: you would spin out!", "Speed 5: corner burns 1 heat") makes gear + cards + heat readable before you commit. Corner limits are big numbers on the track. |
| 3 | Original's fun moment lands | 5 | Board, mid race: the "brake late, burn heat, slingshot past" moment shows up once or twice, then the engine hits 0 and stays there (PC run: Engine 0 from round 4 to 9). Player: "After one corner I'm out of heat and just crawl with 1s and Stress cards for six rounds." |
| 4 | Computer opponent quality | 6 | Rivals spin out rarely and slipstream a lot (4-6 per race), so they feel competent, but they all behave alike (HANDOFF says so too) and one rival has the player's own name. Result screen: "Kit Marlow wins ... 5. Kit Marlow (you)": "Wait, did I win or not?" |
| 5 | Pacing | 7 | 1 lap = 7-11 rounds, about 2 minutes; AI moves resolve quickly with readable messages. 2-3 laps on Hard will drag once the hand clogs (see row 3). |
| 6 | Feedback and juice | 5 | Board: cars slide, messages update, but heat burn, spin-out and slipstream have no sound, no shake, no number pop on the car. Player: "Did I just spin? I only noticed in the text strip." The result header has a large empty box under "X wins". |
| 7 | Phone playability | 7 | Gear row, 7-card hand, Boost/Suggest/Go all reachable with the thumb, track keeps 60% of the screen, follow camera works. Cards are big enough. |
| 8 | PC playability | 6 | Board at 1440x860: the hand is a narrow strip in a very wide panel, gear buttons stretch to 330 px each, the canvas shows a darker rectangle on the left third, and after the finish the Stay / Slipstream +2 bar stays visible under the result modal. Player: "Looks like a phone app stretched." |
| 9 | Rules faithfulness | 6 | Gears, heat in deck, corner limits, spin-out, slipstream, adrenaline and boost are there and correct in spirit. Missing as I know the original: the end-of-turn discard of unwanted cards (so Stress/low cards clog the hand forever), and slipstream is offered after you already burned your whole engine. rules-notes marks start deck and penalties as guessed. |
| 10 | Stability | 8 | Two full races, no errors, no stuck states. Only glitch: the slipstream bar left on screen behind the result. |

Average: 6.4. Lowest rows: 3 (fun moment) and 6 (feedback), both 5.

## Top 5 changes (most fun first)

1. Add the end-of-turn discard step: after resolving, let the player tap any non-heat cards to discard before refilling to 7 (AI discards Stress and 1s), so the hand stops clogging and heat management becomes a choice instead of a death spiral.
2. Give every rival a unique name that never matches the player's (rename the player "You" in messages and on the result list) and colour each message with the car's colour.
3. On heat burn, spin-out and slipstream, pop a floating label over the car ("-3 heat", "SPIN!", "+2 draft") with a 300 ms camera nudge, so the key moments are seen on the track and not only in the text strip.
4. Hide the Stay / Slipstream bar and the plan panel when the result modal opens, and remove the empty box under the "X wins" header (put finishing gap or best lap there instead).
5. On wide screens (>1000 px), cap the plan panel at ~720 px centred under the track and make the canvas fill the full width so the dark left rectangle disappears.
