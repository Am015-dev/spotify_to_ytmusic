# Redline Rally: story

All text lives in two data files: `src/story.js` (tutorial prologue, quick-game flavour, turn captions) and `campaign.json` (Story-mode chapter intros and outros, cast).
Original names only.

## Cast
- **Coach Mara**: guide. Ex-driver, dry humour, speaks in short warm lines. Narrates the prologue and Story chapter 1.
- **Kit Marlow** (red, the rival of the prologue): smooth and patient. Wants the one open seat at the Sunline team, so he wants your seat.
- **Juno Vega**, **Dax Orrin** (hates traffic, boss of act 1), **Pia Rask** (lives in the slipstream), **Oto Lind** (cold engine, calm head), **Bex Hollis** (all gas, no fear).
- Portraits: code-drawn colour discs with the driver's initial until art exists (`portrait-<id>` slots).

## Prologue (the tutorial): "The Sunline Seat"
One real 30-space lap on the Practice Loop against Kit and Juno, six chapters, one round each, ending on the result screen with a payoff line.
1. Your first turn: Mara hands you the keys. Gear, cards, speed, Go.
2. The wet corner: rain makes the limit 5. Push and see the burn, brake and stay clean.
3. Heat is fuel: Kit pulls away, you pay one heat to catch him.
4. Cool down, catch up: dead heat cards, gear 1 cools, a stress card, adrenaline for the car in last place.
5. Tuck in behind Kit: shift two gears for one heat, end right behind him, slipstream.
6. The line: boost for the last three spaces, cross first. "The seat is yours."

## Story mode arc (9 chapters, 3 acts; text in campaign.json)
- Act 1 Warm-up Laps (c1-c3): learn the car, beat Dax at the Sunline Opener. Stake: a place on the team.
- Act 2 Midseason (c4-c6): slipstreams, upgrade day, the Hairpin Showdown (boss rule: every limit 1 lower). Stake: the sponsor's second seat.
- Act 3 The Championship (c7-c9): hard rivals, the Grand Final starting with 4 heat (boss rule). Stake: the title and Kit's rematch.
Every chapter has an intro scene (Mara or the rival, who/what/the twist rule) and an outro that leads to the next; bosses talk before and after (taunt and praise lines).
