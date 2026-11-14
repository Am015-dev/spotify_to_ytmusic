# Lantern Dive: rules checklist

Every rule of the published game that this version must follow, numbered. `logic-test.js` has one assertion per number (`node logic-test.js`). Rules 1 to N cover setup, play, signalling, the distress flare, hand-out, winning and losing, dive limits and the variants; the last 96 rules are the 96 job cards, each judged by an independent oracle on complete random dives.

Source: the publisher's rulebook and logbook as summarised in `rules-notes.md` (no wording copied), plus the playing rules as commonly known. Items the sources do not settle are listed at the end.


## A. Cards and deck

1. The deck has 40 cards: four colours (Coral, Tide, Kelp, Sunstar) numbered 1 to 9, plus four trump cards (the Lanterns) numbered 1 to 4.
2. Every colour has each number 1 to 9 exactly once.
3. The Lanterns are numbered 1, 2, 3, 4 and form their own suit.
4. The Lantern 4 is the highest card of the Lantern suit (a Lantern 4 beats every other Lantern in a trick).

## B. Setup and dealing

5. 3 divers: all 40 cards are dealt, 14 / 13 / 13 (one diver has 14 cards).
6. 4 divers: all 40 cards are dealt, 10 each.
7. 5 divers: all 40 cards are dealt, 8 each.
8. A deal uses each of the 40 cards exactly once (no card lost or doubled).
9. The number of tricks in a dive is 13 / 10 / 8 for 3 / 4 / 5 divers.
10. With 3 divers one card is never played: the dive has 13 tricks of 3 cards = 39 cards.
11. The diver holding Lantern 4 is the Commander.
12. The Commander leads the first trick.
13. The job cards are shown to everybody before any card is played (assign phase comes first, cards cannot be played).
14. Hands are hidden: another diver's cards are not visible in the state shown to a seat.

## C. Two divers and the drone

15. 2 divers: Lantern 4 is set aside, 14 of the other cards form the drone's hand, the divers get 13 cards each and one of them holds Lantern 4.
16. 2 divers: the drone's 14 cards lie in 7 stacks of two (one face-up card on top of one face-down card).
17. 2 divers: the drone counts as a third crew member: 3 crew values on job cards and 13 tricks.
18. 2 divers: the Commander plays the drone's cards (the Commander is the one asked to act when it is the drone's turn).
19. 2 divers: the drone may play only its face-up cards.
20. 2 divers: a face-down drone card turns face up after the face-up card on top of it was played and the trick is over.
21. 2 divers: the drone cannot be given a job that compares with the Commander (jobs 3, 4, 5).

## D. Job cards: drawing and handing out

22. Job cards are drawn until the difficulty numbers for the crew size add up exactly to the dive's difficulty (dives 1-31, 3, 4 and 5 divers).
23. Every job card shows three numbers (3, 4 and 5 divers) and there are 96 job cards.
24. A drawn card that would push the total above the dive's difficulty is not used.
25. Dive 32 uses four fixed job cards: no tricks at all, three tricks in a row, two tricks in a row, first and last trick.
26. Hand-out: the Commander chooses a job first.
27. Hand-out: then clockwise, one job per turn.
28. Hand-out: with at least as many jobs as divers nobody may pass.
29. Hand-out: with fewer jobs than divers a diver may pass, but every job is taken within one round.
30. Hand-out: the Commander may not take the three jobs that compare tricks with the Commander (more / fewer / same).
31. Dive 19: the Commander takes the most difficult job first.
32. Dive 25: the Commander never takes a job (skipped every round).
33. Dives 10 and 13: the Commander takes every job or hands them all to a diver who agrees; if handed over, all signalling happens before the first trick.
34. Dives 10 and 13: if nobody accepts, the Commander keeps every job.
35. Dive 6: the crew agrees on one diver who takes every job (vote, ties to the Commander's choice).
36. Dives 14, 15, 16: one volunteer takes all jobs; volunteers are asked in turn with yes/no; the Commander is the last resort.
37. Dive 26: two volunteers take all the jobs and share them, at least one job each.
38. Dives 17, 28-31 (open briefing): a diver may take more than one job; every job is taken in the end.
39. Two jobs that two different divers could never both do (e.g. both "win the first trick") are never dealt together.
40. Jobs that cannot be done in the current deal (win a card using a Lantern when one diver holds all four Lanterns and the card) trigger a re-deal that does not count as an attempt.
41. Re-deal: "Win exactly one Lantern" / "exactly three Lanterns" are re-dealt when one diver holds all four Lanterns; "exactly two Lanterns" when one diver holds Lanterns 2, 3 and 4.
42. After a failed attempt the crew can keep the same job cards or draw new ones; the deal is always new.
43. Predictions: before the first card a diver with a prediction job states an exact trick count (job 89 visible to all, job 90 kept secret).
44. Predictions: a job "predict your exact number of tricks" is met only if the diver wins exactly that many tricks.

## E. Distress flare (card passing)

45. The distress flare is offered after the jobs are taken and before any signalling or card play.
46. The flare is optional: declining goes straight on to the next step with no cards passed.
47. Lighting the flare: every diver passes exactly one card to the neighbour on the same side; the receiver gets that card.
48. Passing keeps every hand the same size.
49. A Lantern can never be passed.
50. Lantern 4 cannot be passed, so the Commander does not change after passing.
51. The flare stays lit until the dive is won (it counts one extra attempt) and passing is offered again in every later attempt.
52. The distress token is recorded in the result (attempts and flare used) for the logbook.

## F. Communication (sonar signals)

53. No signalling while the jobs are still being handed out.
54. A diver may signal with a colour card that is the highest, the lowest or the only card of its colour in hand; a middle card cannot be shown.
55. A Lantern can never be shown.
56. The token marks highest (top), only card (middle) and lowest (bottom).
57. Each diver may signal once per attempt.
58. The signalled card stays in the diver's hand (the token does not remove it) and is shown to everybody.
59. Signalling is allowed only between tricks, never while a trick is in progress.
60. Signalling is allowed before the first trick and between later tricks (any diver, not only the leader).
61. A new attempt gives every diver a fresh signal.
62. Murky water: the card is shown but the token carries no mark (the crew must work out highest / lowest / only).
63. Deep narcosis: there are (divers - 2) shared tokens; any diver can take one at any time between tricks; one diver may use several.
64. Deep narcosis with 3 / 5 divers: 1 / 3 tokens.
65. Signals have no fixed order: before trick 1 any diver may signal, out of turn and in any order, and the leader need not wait.
66. Signals are never allowed during a trick: once the lead card is down nobody can signal until the trick is over.
67. No-signalling dives: nobody can signal at all.
68. Unknown waters (dives 20-27): a colour card is drawn at random; value 1-3 = normal signalling, 4-6 = murky water, 7-9 = deep narcosis.
69. Dive 9 is played in murky water, dive 11 in deep narcosis.
70. Dives 10 and 13 after a hand-over: all signalling must be done before the first trick ends.
71. Dive 23: no signalling until just before the second trick.

## G. Playing a trick

72. The leader may play any card from the hand.
73. Play passes clockwise: the next diver (seat + 1) plays after the leader.
74. Followers must play a card of the led colour when they have one.
75. A diver without the led colour may play any card, including a Lantern.
76. A Lantern may not be played on a colour lead while the diver still holds that colour.
77. A Lantern lead must be followed with a Lantern if the diver has one (a Lantern is a suit).
78. After a Lantern lead, a diver with no Lantern may play anything.
79. The highest card of the led colour wins when no Lantern was played.
80. A card of another colour never wins, however high.
81. A Lantern beats every colour card, even the led colour's 9.
82. When several Lanterns are played the highest Lantern wins.
83. A diver is never forced to win: following with a lower card of the led colour is allowed.
84. The winner of a trick leads the next one.
85. The winner collects the trick (the won cards count for that diver's jobs): the trick record keeps all four cards and the winner.
86. A played card leaves the hand and cannot be played twice.
87. Only the diver whose turn it is can play.
88. A card that is not in the diver's hand cannot be played.
89. The dive has exactly 13 / 10 / 8 tricks (all cards of a 4 / 5 diver game are played; 3 divers leave one card).

## H. Winning and losing a dive

90. The dive is won at once when every job is done (it does not have to be played to the end).
91. The dive is lost at once when a job can no longer be done.
92. Only the owner's tricks count for a job: winning the trick by another diver does not complete it.
93. A job finished early stays finished: with several jobs the dive goes on until all are done.
94. Every job must be done: if one job of several fails, the whole attempt is lost even if the others are done.
95. A failed attempt allows another one: attempts are counted from 1.
96. There is no point scoring and no tie: the result is only success or failure of the crew.
97. Real-time dives 14, 15, 16, 26 with the clock: 3:30, 3:00, 2:30, 5:00 from the moment the jobs are taken; time running out loses the attempt.
98. Real-time dives without the clock: dive 14 murky water, 15 deep narcosis, 16 no signalling, 26 difficulty 12.

## I. Dive limits (special rules of single dives)

99. Dive 8: no diver may have won two more 9s than another diver; the attempt is lost the moment this happens.
100. Dive 8: winning one more 9 than the others is allowed.
101. Dives 20 and 21: the same limit for the 1s.
102. Dive 12: no trick may be led with a Coral card or a Lantern (if a diver can lead something else, those cards are not offered).
103. Dive 12: a diver who has only Coral and Lantern cards must lead one and the attempt is lost.
104. Dive 23: the winner of the first trick must always have more tricks than every other diver; the attempt is lost as soon as that is no longer true.
105. Dive 27: the Sunstar 5 must be the very last card played in the dive; playing it earlier loses.
106. Dive 27: the dive is not won early; it is played to the last card, and succeeds when that card is the Sunstar 5.

## J. Variants shipped with the game

107. Deep Dive (after dive 32): starts at difficulty 18 and rises by 1 for every success.
108. The logbook has 32 dives, numbered 1 to 32, with increasing difficulty overall (dive 1 = 1, dive 31 = 17).
109. Free dive: any difficulty can be chosen and the jobs are drawn to that exact total.
110. Job practice: the chosen job cards are used exactly as selected.

## K. The 96 job cards (independent oracle: each card judged on complete random dives)

111. Job 0: "Win more tricks than every other diver." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
112. Job 1: "Win more tricks than all other divers together." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
113. Job 2: "Win fewer tricks than every other diver." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
114. Job 3: "Win more tricks than the Commander does." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
115. Job 4: "Win fewer tricks than the Commander does." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
116. Job 5: "Win exactly as many tricks as the Commander does." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
117. Job 6: "Win a trick where every card is below 7. No Lanterns." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
118. Job 7: "Win a trick where every card is above 5." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
119. Job 8: "Win a trick by playing a 6." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
120. Job 9: "Win a trick by playing a 5." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
121. Job 10: "Win a trick by playing a 3." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
122. Job 11: "Win a 5 using your 7." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
123. Job 12: "Win an 8 using your 4." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
124. Job 13: "Win a 6 using your own 6." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
125. Job 14: "Win a trick by playing a 2." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
126. Job 15: "Win the Coral 3." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
127. Job 16: "Win the Sunstar 1." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
128. Job 17: "Win the Tide 4." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
129. Job 18: "Win the Kelp 6." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
130. Job 19: "Win all four 3s." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
131. Job 20: "Win at least three 5s." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
132. Job 21: "Win at least three 9s." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
133. Job 22: "Win at least two 7s." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
134. Job 23: "Win all four 9s." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
135. Job 24: "Win exactly three 6s." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
136. Job 25: "Win exactly two 9s." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
137. Job 26: "Win the Tide 1, 2 and 3." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
138. Job 27: "Win the Tide 6 and the Sunstar 7." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
139. Job 28: "Win the Coral 5 and the Sunstar 6." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
140. Job 29: "Win the Kelp 5 and the Tide 8." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
141. Job 30: "Win the Tide 5 and the Coral 8." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
142. Job 31: "Win the Coral 9 and the Sunstar 8." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
143. Job 32: "Win the Coral 1 and the Kelp 7." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
144. Job 33: "Win the Sunstar 9 and the Tide 7." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
145. Job 34: "Win the Kelp 3, the Sunstar 4 and the Sunstar 5." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
146. Job 35: "Win the Kelp 2 in the very last trick." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
147. Job 36: "Win exactly one Coral card and exactly one Kelp card." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
148. Job 37: "Win at least seven Sunstar cards." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
149. Job 38: "Win at least five Coral cards." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
150. Job 39: "Win exactly two Kelp cards." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
151. Job 40: "Win exactly two Tide cards." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
152. Job 41: "Win exactly one Coral card." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
153. Job 42: "Win no Coral cards." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
154. Job 43: "Win a card of every colour. Lanterns do not count." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
155. Job 44: "Win every card of at least one colour." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
156. Job 45: "Win a trick with only even numbers (2, 4, 6, 8)." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
157. Job 46: "Win a trick with only odd numbers (1, 3, 5, 7, 9)." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
158. Job 47: "Win a trick over 23 (3 divers), 28 (4) or 31 (5). No Lanterns." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
159. Job 48: "Win a trick under 8 (3 divers), 12 (4) or 16 (5). No Lanterns." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
160. Job 49: "Win a trick that adds up to 22 or 23. No Lanterns." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
161. Job 50: "Win exactly one Lantern." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
162. Job 51: "Win the Lantern 1 and no other Lantern." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
163. Job 52: "Win the Lantern 2 and no other Lantern." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
164. Job 53: "Win the Lantern 3." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
165. Job 54: "Win exactly two Lanterns." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
166. Job 55: "Win exactly three Lanterns." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
167. Job 56: "Win no Lanterns." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
168. Job 57: "Win the Coral 7 with a Lantern." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
169. Job 58: "Win the Kelp 9 with a Lantern." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
170. Job 59: "Never lead a trick with Coral, Sunstar or Tide." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
171. Job 60: "Never lead a trick with Coral or Kelp." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
172. Job 61: "Win no Kelp cards." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
173. Job 62: "Win no Sunstar cards." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
174. Job 63: "Win no Coral and no Tide cards." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
175. Job 64: "Win no Sunstar and no Kelp cards." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
176. Job 65: "Win no 8s and no 9s." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
177. Job 66: "Win no 9s." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
178. Job 67: "Win no 5s." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
179. Job 68: "Win no 1s." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
180. Job 69: "Win no 1s, 2s or 3s." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
181. Job 70: "Win none of the first four tricks." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
182. Job 71: "Win none of the first three tricks." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
183. Job 72: "Win none of the first five tricks." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
184. Job 73: "Win no tricks at all." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
185. Job 74: "Never win two tricks in a row." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
186. Job 75: "Win the very last trick." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
187. Job 76: "Win the first three tricks." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
188. Job 77: "Win the first two tricks." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
189. Job 78: "Win the first trick." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
190. Job 79: "Win both the first and the last trick." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
191. Job 80: "Win the last trick and no other trick." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
192. Job 81: "Win the first trick and no other trick." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
193. Job 82: "Win exactly one trick." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
194. Job 83: "Win exactly two tricks." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
195. Job 84: "Win two tricks in a row." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
196. Job 85: "Win three tricks in a row." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
197. Job 86: "Win exactly four tricks." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
198. Job 87: "Win exactly three tricks, one straight after the other." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
199. Job 88: "Win exactly two tricks, in a row." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
200. Job 89: "Say how many tricks you will win. Win exactly that many." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
201. Job 90: "Pick a secret number of tricks. Win exactly that many." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
202. Job 91: "Win equal Coral and Sunstar cards. At least one of each." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
203. Job 92: "Win a trick with equal Kelp and Sunstar cards. At least one each." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
204. Job 93: "Win a trick with equal Coral and Tide cards. At least one each." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
205. Job 94: "Win more Sunstar than Tide cards. Zero Tide is fine." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
206. Job 95: "Win more Coral than Kelp cards. Zero Kelp is fine." (judged against the oracle on 3-, 4- and 5-diver dives; a finished job must be satisfied in every continuation, a failed job in none)
