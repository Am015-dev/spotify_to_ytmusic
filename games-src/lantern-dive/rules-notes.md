# Lantern Dive: rules notes (own words)

Source material (rulebook PDF, the retailer's logbook page, community job-card tables) is kept only in
`/home/user/game-night-private/lantern-dive-research/` (including `tasks-ref.json`, which maps every job card to its source wording).
Nothing from it is copied here. The game follows the published rules; every name, every job text and all art are original.

## What the box really contains (corrects the brief)
* 40 big cards, 5 reminder cards, 96 small job cards, 5 sonar tokens, 1 distress token, 1 commander token and a logbook.
* The logbook has **32 dives** (missions) plus a "keep going" challenge. The **96** is the number of **job cards**, not of dives.
  Each dive draws job cards until their difficulty values add up to the dive's number, so the 96 cards give a huge variety of dives.
* Lantern Dive therefore ships: the 32 logbook dives, the open-ended Deep Dive challenge (difficulty 18 and up), a Free dive (any
  difficulty, any crew size, any signalling rule) and **Job practice**: all 96 job cards, one at a time.

## Cards and crews
* Suits: Coral, Tide, Kelp, Sunstar (values 1 to 9 each) and the four trump Lanterns (1 to 4). 40 cards.
* 3, 4 or 5 divers: all 40 cards are dealt out. With 3 divers one diver has 14 cards and one card is never played (13 tricks).
  4 divers play 10 tricks, 5 divers 8 tricks.
* The diver who holds Lantern 4 is the **Commander** for this attempt. He or she leads the first trick and starts picking jobs.
* 2 divers: see "Two divers and the drone" below.

## A trick
* The leader plays any card; everyone follows the suit of the first card if they can (Lanterns are a suit, too). If you cannot follow
  you may play anything.
* Lanterns beat every colour. The highest card of the led suit wins when no Lantern was played; with several Lanterns the highest Lantern wins.
  A colour that is not the led suit never wins. You are never forced to win.
* The winner collects the trick and leads the next one.

## Signalling (the ping)
* Once per attempt each diver may show one **colour** card face up (it stays in the hand). It must be the diver's highest card of that suit,
  or the lowest, or the only one. The token marks which: top = highest, middle = only, bottom = lowest. Lanterns can never be shown.
* Allowed only after the jobs are taken and only **between** tricks, never in the middle of one. The token stays where it was put.
* Our rule for a card that is the only one of its suit: the mark is "only" (the highest/lowest marks are for suits with 2+ cards). (Guess,
  see below.)
* Special signalling rules from the dives:
  * **Murky water**: show the card as usual, but the token is put beside it, spent side up, without a mark; the crew must work out whether it is the
    highest, lowest or only card.
  * **Deep narcosis**: there are two fewer tokens than crew members, in the middle. Anybody can take one at any time between tricks, silently,
    and signals at once. One diver may use several.
  * **Unknown waters**: draw a colour card first: 1-3 normal signalling, 4-6 murky, 7-9 narcosis.
  * **No signalling** (the no-clock version of the Leak dive).

## Job cards
* A job belongs to one diver (the one who took it) and is a condition on the tricks that diver wins. A job is done when it is met and can no
  longer fail; the dive is won when every job is done. One failed job loses the attempt at once.
* Each card has three difficulty numbers, for 3, 4 and 5 divers (only one counts). Jobs are drawn until the numbers add up exactly to the
  dive's difficulty; cards that would overshoot are skipped. Two jobs that two different divers could never both do (same trick, same card)
  are re-drawn.
* Taking the jobs: the Commander picks first, then clockwise, one job per turn, until all are taken. With fewer jobs than divers a diver may
  pass, but every job must be taken within one round. The three jobs that compare with the Commander may not be taken by the Commander.
* A failed attempt: reshuffle and deal again; keep the same jobs or draw new ones. An impossible deal (some Lantern jobs) is re-dealt without
  counting. An impossible job set is re-drawn.
* The kinds of job cards (all 96 are in `src/data.js`):
  trick counts compared with others or the Commander; win a trick whose cards are all low / high / even / odd / adding to a total; win with a
  given value, win a given value with another; win specific cards, win value or colour totals (exactly or at least); win none of a colour or value;
  win all of a colour, one of each colour; Lantern counts and Lanterns that win a given card; never lead some colours; none of the first
  N tricks; the first, the first two or three, the last, first and last, only the first, only the last trick; exactly N tricks, N in a row;
  predict your exact trick count (open or secret); equal numbers of two colours (overall or inside one trick); more of one colour than another.

## Distress flare
* Before any signalling the crew may light the flare: every diver passes one colour card (no Lanterns) to the neighbour on the left, or all to the right.
  All pass or none does. The flare stays lit until the dive is won; at the start of every later attempt the crew may pass again (or not).
* The dive then counts one extra attempt in the logbook.

## Dive rules (the 32 logbook dives)
* Commander's call (dives 10 and 13): the Commander takes every job or hands them all to a diver who agrees; if handed over, all signalling
  happens before the first trick.
* One diver takes all jobs (dive 6, by crew vote; dives 14 to 16 by volunteering in turn, answers are only yes or no; the Commander is the
  last resort). Two volunteers take them in dive 26 and share them, at least one each.
* Open briefing (dives 17, 28 to 31 and the Deep Dive): the crew may talk freely about who takes which job, never about cards.
* Dive 19: the Commander takes the hardest job first. Dive 25: the Commander never takes a job.
* Limits: dive 8 no diver may ever have won two more 9s than another diver; dives 20 and 21 the same for 1s; dive 12 no trick may be led
  with Coral or a Lantern; dive 23 the winner of the first trick must always have more tricks than everyone else and signalling waits until
  just before trick 2; dive 27 the Sunstar 5 must be the very last card played.
* Real-time dives (14, 15, 16, 26): with a clock (3:30 / 3:00 / 2:30 / 5:00 from the moment jobs are taken) or without a clock using murky
  water / narcosis / no signalling / difficulty 12.
* Dive 32 uses four fixed jobs. Deep Dive: difficulty 18 and +1 for every success, open briefing, only note whether the flare was used.

## Two divers and the drone
* Lantern 4 is set aside; 14 of the other 39 cards form the drone's double row (7 face-down, 7 face-up on top); Lantern 4 is shuffled back
  into the remaining 25 and each diver gets 13.
* The drone is a third crew member (3-diver numbers apply). The Commander (always a diver) takes jobs for it, plays its face-up cards for it
  and decides without discussion. A face-down card turns up only after the card on top of it was played and only after a trick.

## Confirmed vs guessed
Confirmed from the rulebook text: everything in sections Cards, A trick, Signalling (except the "only" detail), Job cards (rules of choosing,
drawing, failing, re-drawing, the three Commander-comparison cards), Distress flare, Two divers and the drone, the list of special dive rules,
the unknown waters mapping, the real-time alternatives, the 32 dives and the Deep Dive start of 18.
Confirmed from the logbook text: dive numbers 1-3, 5-7, 9-11, 13, 16-20, 22, 24-26 and 28-31 have their difficulty readable; the rule
sentences of every dive; dive 32's four fixed jobs.
Job cards: the **96 difficulty triples and the wording of each job were taken from two independent public community tables** that agree
entry by entry; they were not checked against a physical card. The rulebook confirms the categories, several example texts and thresholds.

Guessed (the sources do not say; chosen to be fair and to keep the real game's feel):
1. Difficulty of dives **4, 8, 12, 14, 15, 21, 23 and 27** could not be read (they are symbols in the logbook): 4, 6, 6, 4, 5, 10, 11 and 12
   (`guess:1` in `src/data.js`). Dive 14 and 15 follow the increasing real-time pattern 4, 5, 6.
2. (now confirmed by the retailer logbook text, audit row 15) Dive 21 has the same "two more 1s" limit as dive 20.
3. A card that is the only one of its suit may only be shown with the "only" mark.
4. Following suit for the drone uses only its face-up cards.
5. The distress pass with two divers is a swap between the two divers (the drone does not take part).
6. In a 2-diver game narcosis has one token (3 seats minus 2): the audit keeps this (the drone counts as a crew member for jobs; with 0 tokens narcosis dives would allow no signalling).
7. Free briefing is played as: each diver in turn may take any number of jobs and then ends the turn; a full round of passes forces the next diver to take one.
8. The crew vote (dive 6): every diver votes, the computer votes for itself when the jobs fit its hand, ties go to the Commander's vote.
9. Jobs that compare with the Commander are never drawn in dives where one diver must take everything (the Commander could be forced to). The audit keeps this filter (stricter than the rules for dives 6, 10, 13, 26, but it keeps 14-16 playable).
10. Ruled by the audit (rulebook p.18): every job that looks at the total value of a trick (more than, less than AND exactly 22 or 23) allows no Lantern in the trick; so do the parity jobs. Job 49's text says so.
11. REVERSED (audit, rulebook p.10): the dive is won the moment every job is done. Only dive 27 is still played to its final card (its Sunstar 5 rule needs it). Dives 8, 12, 20, 21, 23 end as soon as the last job is done.
12. When a dive says "all communication before the first trick" (dives 10/13 after a hand-over) pings are blocked once the first trick is complete.
13. The first trick's signal round is played in turn from the Commander (each diver pings or passes) instead of free-form; later tricks allow a
    ping any time between tricks for any diver (hot-seat: only for the diver whose turn it is to lead).
14. A job counts as failed the moment it can no longer be met from public information (e.g. its card was won by someone else), so the dive stops at once.

## Rulings added after the independent audit (AUDIT-RULES.md)
- Job 49 allows no Lantern in the trick (row 1). Jobs 51/52 are done when the named Lantern is won, even if the card never played in a 3-diver dive is another Lantern (row 2).
- Dive 19: the Commander is offered the hardest job he or she may take, never a Commander-comparison job (row 3).
- Jobs 57/58 ("win card X using a Lantern"): re-deal, no attempt counted, if one diver holds all four Lanterns and card X (row 4, p.17).
- Impossible job pairs are replaced at draw time: two "most tricks" jobs, two "fewest tricks" jobs, any two jobs that together need more than four copies of one value or of the Lanterns (3+ nines with exactly two nines, exactly 2 with exactly 3 Lanterns), as well as the older shared-position / shared-card pairs. With fewer jobs than divers every job goes to a different diver, so no conflicting pair may be drawn at all (row 5).
- A job the dive's own limit makes impossible is never drawn (dive 8: jobs 21 and 23, job 25 at 4+ divers, the owner needs n copies and each other diver n - gap + 1) (row 6).
- The drone may not be given a Commander-comparison job (row 8).
