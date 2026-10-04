import json
OUT='../../missions.json'
M=[]
ALL=[2,3,4,5]
def box(n):
    return 'base' if n<=8 else '9-19' if n<=19 else '20-30' if n<=30 else '31-42' if n<=42 else '43-54' if n<=54 else '55-66'
def W(count=None,keep=None,of=None,candidates=None,fixed=None,dealing='shuffled'):
    if fixed is not None: return {'mode':'fixed','values':fixed,'count':len(fixed),'dealing':dealing}
    if count==0 or (count is None and keep is None): return {'mode':'none','count':0}
    if keep is not None: d={'mode':'out_of','keep':keep,'of':of}
    else: d={'mode':'exact','count':count}
    if candidates: d['candidates']=candidates
    d['dealing']=dealing
    return d
NONE=W(0)
def m(n,name,_unused,red,yellow,rules,blue=None,two=None,players=ALL,detonator='players',equipment=None,characters=None,info=None,
      components=None,structured=None,gaps=None,doc='full',audio=None,timer=None,sources=None,notes=None,setup=None):
    M.append(dict(
        number=n,name=name,box=box(n),players=players,
        wires={'blue':blue or {'values':'1-12','count':48},'red':red,'yellow':yellow},
        two_player_overrides=two or {},
        detonator={'start':detonator},
        equipment=equipment or {'count':'players','exclude':[]},
        characters=characters or {'mode':'standard'},
        setup_info_tokens=info or {'mode':'standard'},
        components=components or [],
        timer=timer, audio=audio,
        setup_changes=setup or [],
        special_rules=structured or [],
        rules=rules, gaps=gaps or [], documentation=doc,
        sources=sources or ['CARD m%02d front/back'%n], notes=notes or []))

# ---------------- Training (base box) ----------------
m(1,'Boot Camp I',None,NONE,NONE,
  'Tutorial. Only blue wires 1-6 (24 tiles); no equipment. Introduces the two cut actions: a dual cut (name a value, point at one teammate wire; on success both wires are cut in place, on failure the dial advances and the teammate shows the true value with an info token, and the active player never reveals which of their own wires they meant) and a solo cut (all the remaining wires of a value are in your hand: cut all 4, or the last 2). Also sets the defaults for every later mission: dial set for player count, one character each with a once-per-mission Twin Probe, opening info tokens placed clockwise from the Captain.',
  blue={'values':'1-6','count':24},equipment={'count':0,'exclude':[]})
m(2,'Boot Camp II',None,NONE,W(2,candidates='1.1-7.1'),
  'Blue 1-8 (32 tiles) plus 2 yellow drawn from 1.1-7.1. No equipment. Yellows share the single value "yellow": to cut one you must hold one and call "yellow". A wrong call on a yellow wire gets the yellow info token. The yellow token cannot be used for the opening info placement.',
  blue={'values':'1-8','count':32},equipment={'count':0,'exclude':[]})
m(3,'Boot Camp III',None,W(1,candidates='1.5-9.5'),NONE,
  'Blue 1-10 (40 tiles) plus 1 red drawn from 1.5-9.5. Pointing at a red in a cut ends the mission at once. A player whose remaining wires are all red must reveal them at the start of their turn, and takes no further part. Equipment is introduced: one random card per player, but cards 2 and 12 are put back and replaced. A card unlocks when 2 wires of its value are cut, and works once.',
  blue={'values':'1-10','count':40},equipment={'count':'players','exclude':['eq2','eq12']},
  structured=[{'kind':'forced_reveal_red_at_turn_start'}])
m(4,'Field Day One',None,W(1),W(2),
  'From here on all 48 blue wires are used. 1 red, 2 yellow. Recap mission, with no new rules.',
  two={'red':W(1),'yellow':W(4)})
m(5,'Field Day Two',None,W(1),W(keep=2,of=3),
  'Introduces "2 out of 3": draw 3 yellows, mark their slots with "?" markers, secretly keep 2 in the pool and set 1 aside unseen.',
  two={'red':W(2),'yellow':W(keep=2,of=3)})
m(6,'Field Day Three',None,W(1),W(4),
  'Four yellows in play. They are cut two at a time by dual cuts, or by a solo cut if one player holds all the remaining yellows (all 4, or the last 2).',
  two={'red':W(2),'yellow':W(4)})
m(7,'Last Lesson',None,W(keep=1,of=2),NONE,
  'Introduces "1 out of 2" for red: 2 candidate values are marked, and only 1 red is actually in play.',
  two={'red':W(keep=1,of=3)})
m(8,'Graduation',None,W(keep=1,of=2),W(keep=2,of=3),
  'No special rules. Winning unlocks box 9-19.',
  two={'red':W(keep=1,of=3),'yellow':W(4)})

# ---------------- Box 9-19 ----------------
m(9,'Pecking Order',None,W(1),W(2),
  'Draw 3 Number cards face up in a row (a, b, c) and put the sequence card (side A) over the first one. No b-value wire may be cut until at least 2 a-value wires are cut. No c-value wire may be cut until at least 2 a and 2 b wires are cut. Once 2 a wires are cut, flip a face down and move the sequence card to b, and so on. Values not on the three cards are free.',
  two={'red':W(2),'yellow':W(4)},components=['number_cards','sequence_card_A'],
  structured=[{'kind':'cut_order_gate','cards':3,'required_per_step':2,'sequence_side':'A'}],
  notes=['FAQ: a player whose only remaining wires cannot legally be cut causes the bomb to explode.'],sources=['CARD m09','FAQ mission 9'])
m(10,'No Coffee Today',None,W(1),W(4),
  'Real-time. Start a 15-minute timer after setup (12 minutes with 2 players). There is no fixed turn order: when the previous turn is over, anyone may call "Snip!" and take the next turn. No one may take two turns in a row, except with 2 players or when they are the only player with wires left (FAQ). Card 11 is replaced if drawn.',
  timer={'seconds':900,'two_player_seconds':720,'on_expire':'explode'},equipment={'count':'players','exclude':['eq11']},
  structured=[{'kind':'free_turn_order','claim':'shout_snip','no_consecutive_turns':True,'exceptions':['2_players','only_player_with_wires']}],
  sources=['CARD m10','FAQ mission 10'],gaps=['A digital build needs a claim-the-turn UI; this assumes the expired timer is a loss (the card says you must finish before time runs out).'])
m(11,'Colourblind',None,NONE,W(2),
  'Draw one Number card at random and lay it face up on the mission card. The four blue wires of that value act as red: cutting one explodes the bomb, and a player can only get rid of them by revealing them when they are the only wires (with any reds) left in hand, as with Reveal Reds. With 2 players: 4 yellow, and the Captain places no opening info token.',
  two={'yellow':W(4),'captain_no_opening_info':True},components=['number_cards'],
  structured=[{'kind':'blue_value_acts_as_red','source':'random_number_card','count_values':1}])
m(12,'Paperwork',None,W(1),W(4),
  'Put one face-up Number card over each equipment card in play, leaving the equipment value visible. An equipment card unlocks only after 2 wires of its own value AND 2 wires of the covering Number card value are cut. When a pair matching a covering Number card is cut, discard that Number card. One pair may satisfy both an equipment card and a Number card (FAQ).',
  two={'red':W(2),'yellow':W(4)},components=['number_cards'],
  structured=[{'kind':'equipment_extra_lock','lock':'number_card_per_equipment','required':2}],sources=['CARD m12','FAQ mission 12'])
m(13,'Triple Trouble',None,W(3,dealing='one_per_player_from_captain'),NONE,
  'The 3 reds are not shuffled in: deal one face down to each player starting with the Captain and going clockwise (with 2 players the Captain gets 2, one per stand; with 4-5 players some players get none), then deal the blues. Opening info tokens are drawn at random rather than chosen: place yours in front of a matching wire, or face up beside your hand if you have none; redraw a yellow token. New action: cut the 3 reds at once by pointing at 3 uncut wires anywhere on the table; if any of them is not red, the bomb explodes. With 4-5 players a player without a red may still try this. A player holding only reds must take this action and cannot Reveal Reds. Equipment and detectors cannot target reds (FAQ). With 2 players the Captain places no opening info token.',
  two={'captain_no_opening_info':True},info={'mode':'random_draw','no_match':'beside_stand','redraw_yellow':True},
  structured=[{'kind':'special_action_multi_cut','colour':'red','count':3,'scope':'all_uncut_wires','fail':'explode','allowed_without_holding':'4-5_players','forced_if_only_reds':True,'replaces_reveal_red':True}],
  sources=['CARD m13','FAQ mission 13'],gaps=['Whether the 3 pointed wires may include your own: the card says "among ALL the wires that have not been cut", so yes.'])
m(14,'The Rookie',None,W(2),W(keep=2,of=3),
  'Shuffle the character cards and deal one face down to each player. Whoever gets the Captain card is "the rookie" for this mission. If the rookie fails a dual cut, the bomb explodes at once. The rookie may not use the damper (card 9).',
  two={'red':W(3),'yellow':W(4)},characters={'mode':'random_deal','role':'rookie=captain_card_holder'},
  structured=[{'kind':'role_failed_dual_cut_explodes','role':'rookie'},{'kind':'role_equipment_ban','role':'rookie','equipment':['eq9']}],
  gaps=['Whether the rookie also takes over as turn-order Captain is not stated; assume the Captain still goes first and the rookie is only a role.'])
m(15,'Lost in Translation',None,W(keep=1,of=3),NONE,
  'Draw the usual number of equipment cards but lay them face down without looking. Shuffle the 12 Number cards into a face-down deck and turn the top one up. When all 4 wires of the face-up Number value are cut, turn one equipment card face up: it is immediately usable whatever its number. Then turn up the next Number card. A Number card whose value is already finished is discarded and replaced, without gaining equipment.',
  two={'red':W(keep=2,of=3)},equipment={'count':'players','exclude':[],'face':'down','unlock':'by_number_deck'},components=['number_cards'],
  structured=[{'kind':'equipment_reveal_by_number_deck','required':4}],
  gaps=['Which face-down equipment card is flipped (leftmost, or the players\' choice) is not stated; the card picture suggests left to right.'])
m(16,'Groundhog Day',None,W(1),W(keep=2,of=3),
  'Like mission 9 but with sequence side B: all 4 wires of value a must be cut before any b-value wire, and all 4 a and all 4 b before any c-value wire. Other values are free.',
  two={'red':W(2),'yellow':W(4)},components=['number_cards','sequence_card_B'],
  structured=[{'kind':'cut_order_gate','cards':3,'required_per_step':4,'sequence_side':'B'}])
m(17,'Fibber',None,W(keep=2,of=3),NONE,
  'Deal the characters at random; the Captain-card holder is the liar. At setup the liar places 2 info tokens, both of which must be FALSE (the value does not match the wire it points at) and neither in front of a red. All of the liar\'s tokens mean "this wire is NOT this value". When a dual cut aimed at the liar\'s hand fails, the liar places a token showing the value that was called (which is therefore false). The liar cannot use equipment cards but can take part in the handsets (2) and sweep (8) effects.',
  two={'red':W(3)},characters={'mode':'random_deal','role':'liar=captain_card_holder'},info={'mode':'standard','liar':{'count':2,'must_be_false':True,'not_on_red':True}},
  structured=[{'kind':'false_info_tokens','who':'liar'},{'kind':'role_equipment_ban','role':'liar','equipment':'all','except_participation':['eq2','eq8']}])
m(18,'Bat-Signal',None,W(2),NONE,
  'No random equipment: only the sweep card (8) is on the board, permanently available. Shuffle the Number cards into a face-down deck. No opening info tokens. Each turn the active player turns up the top Number card, runs a sweep on that value, then picks a player (possibly themselves) who must make a cut action using that value. Reshuffle the deck when empty. A Number card is discarded once its 4 wires are cut. A player holding only reds at the start of their turn must Reveal Reds. Play passes to the left of the active player, not of the chosen cutter (FAQ).',
  two={'red':W(3)},equipment={'count':0,'fixed':['eq8'],'permanent':True},info={'mode':'none'},components=['number_cards'],
  structured=[{'kind':'turn_script','steps':['reveal_number','sweep_value','designate_cutter']}],sources=['CARD m18','FAQ mission 18'],
  gaps=['What the chosen cutter does if they hold no wire of the value is not stated; assume a dual cut is impossible, so they must still act (a deliberately failed cut?) or the turn is lost. Needs a ruling; suggest a dial step as in missions 45/51.'])
m(19,'Cave Lair',None,W(1),W(keep=2,of=3),
  'Audio and real-time mission. The track is the clock: the villain announces a 15-minute self-destruct, but halfway through he jumps the countdown, so the real limit is about 11 minutes of play. If the bomb is not defused when his countdown hits zero, it explodes. After the opening info tokens, play the Mission 19 track. Whenever the alert sound plays, stop and listen until it plays again; the narration never counts toward any time. See audio_script.',
  audio={'track':'Mission 19','url':'https://www.pegasusna.com/bombbusters-en'},timer={'seconds':668,'source':'audio','displayed_fake':'15:00 jumping to 5:00 after 337 s'},components=['audio'],doc='partial',
  sources=['CARD m19','AUDIO m19 (machine transcript)'])
# ---------------- Box 20-30 ----------------
m(20,'Odd One Out',None,W(2),W(2),
  'When dealing, the last wire dealt to each stand is not sorted: it goes at the far right whatever its value, with an X token in front. Equipment cards and personal items cannot be used on X wires at all, and X wires are ignored by the full scan (5) and the sweep (8). Card 2 is replaced if drawn.',
  two={'red':W(keep=2,of=3),'yellow':W(4)},equipment={'count':'players','exclude':['eq2']},components=['x_tokens'],
  setup=[{'kind':'unsorted_last_wire','per':'stand','position':'far_right','token':'X'}],
  structured=[{'kind':'x_wires_immune_to_equipment'}],gaps=['The X wire may be any colour (red included).'])
m(21,'Even Stevens',None,W(keep=1,of=2),NONE,
  'Replace the info tokens with even/odd tokens for the whole mission: in setup, on failed cuts and with the sticky note (4). They show only whether a wire is even or odd.',
  two={'red':W(2)},components=['even_odd_tokens'],structured=[{'kind':'info_token_replacement','type':'parity'}],
  gaps=['Which token marks a yellow wire on a failed cut is not stated; assume the yellow info token is still used.'])
m(22,'Ruled Out',None,W(1),W(4),
  'Setup: instead of an opening info token, each player takes 2 tokens for values they do NOT hold and lays them beside their stand (yellow allowed; 2-stand players put one by each stand; fewer if fewer values are missing). When the first 2 yellows are cut, each player in turn from the Captain picks an info token from the supply and gives it to their left neighbour, who places it truthfully (or beside the stand if they hold no such wire).',
  info={'mode':'negative','count':2,'yellow_allowed':True},
  structured=[{'kind':'trigger','on':'first_yellow_pair_cut','effect':'each_player_gifts_info_token_left'}])
m(23,'Small Town',None,W(keep=1,of=3),NONE,
  'No equipment on the board: make a face-down deck of 7 random equipment cards instead. Lay a random Number card face up. The 4 wires of that value can only be cut together, by a special action: point at all 4 (no equipment or Twin Probe); success cuts them, failure explodes the bomb. Until it succeeds, discard the top equipment card at the end of every round (before the Captain\'s turn). Once it succeeds, every equipment card left in the deck goes face up and is usable at once.',
  two={'red':W(keep=2,of=3)},equipment={'count':0,'deck':7,'deck_burn':'end_of_round_until_special_done'},components=['number_cards'],
  structured=[{'kind':'special_action_multi_cut','target':'number_card_value','count':4,'fail':'explode','no_equipment':True,'reward':'unlock_remaining_equipment_deck'}],
  gaps=['Whether the 4 targets may include your own wires: yes by analogy with mission 39 ("even if you have none").'])
m(24,'Head Count',None,W(2),NONE,
  'Replace the info tokens with ×1/×2/×3 tokens everywhere (setup, failures, sticky note). A token says how many times that value appears on that stand, counting cut wires; ×2 and ×3 may go on any wire of that value. Never place them in front of a red. With the sticky note they may tag a cut wire. If a tagged wire is swapped with the handsets, its token is discarded (FAQ).',
  two={'red':W(3)},components=['count_tokens'],structured=[{'kind':'info_token_replacement','type':'count_on_stand'}],sources=['CARD m24','FAQ mission 24'],
  gaps=['What a failed cut on a yellow wire shows (assume a count of yellows on that stand).'])
m(25,'Big Ears',None,W(2),NONE,
  'Nobody may say a wire number aloud; express it some other way (spell it, hold up fingers, mime, describe it). Every slip advances the dial 1.',
  two={'red':W(3)},structured=[{'kind':'speech_ban','what':'numbers','penalty':{'dial_advance':1}}],
  notes=['Physical-table rule; a digital build can drop it or use a symbol-only UI.'])
m(26,'Dwindling Options',None,W(2),NONE,
  'Lay all 12 Number cards face up. On your turn first turn over one face-up Number card of your choice, then you must cut (dual or solo) that value. When none are face up, turn them all up again. When a value is finished, remove its card. If you hold no wire matching any face-up card, skip your turn with no penalty. Card 10 is replaced if drawn.',
  equipment={'count':'players','exclude':['eq10']},components=['number_cards'],
  structured=[{'kind':'declare_value_each_turn','pool':'face_up_number_cards','refresh':'when_empty','skip_if_none':'no_penalty'}],
  gaps=['The card has no 2-player adjustment line.'])
m(27,'Putty',None,W(1),W(4),
  'Determine the Captain as usual, then turn all character cards face down: no personal items this mission. Card 7 is replaced if drawn. When the first 2 yellows are cut, draw as many info tokens at random as there are players and lay them in a row; from the Captain clockwise each player takes one and places it truthfully (or face up beside their stand if they lack it). With 2 players the Captain places no opening info token.',
  two={'captain_no_opening_info':True},characters={'mode':'no_personal_items'},equipment={'count':'players','exclude':['eq7']},
  structured=[{'kind':'trigger','on':'first_yellow_pair_cut','effect':'draft_random_info_tokens'}])
m(28,'Butterfingers',None,W(2),W(4),
  'The Captain puts their character card back in the box: no Twin Probe. The Captain cannot use any equipment or personal item. If the Captain fails a dual cut the bomb explodes. The Captain may still take part in the handsets (2) and sweep (8) effects.',
  two={'red':W(3),'yellow':W(4)},characters={'mode':'captain_has_none'},
  structured=[{'kind':'role_failed_dual_cut_explodes','role':'captain'},{'kind':'role_equipment_ban','role':'captain','equipment':'all','except_participation':['eq2','eq8']}])
m(29,'Read My Mind',None,W(3),NONE,
  'Deal 2 Number cards face down to each player (3 to the player on the Captain\'s right); the rest form a deck. Each turn: (1) the player to the active player\'s right lays one of their Number cards face down; (2) the active player takes their turn; (3) the card is revealed, and if the active player has just cut that value the dial advances 1; (4) the active player takes the revealed card into their hand. A Number card is discarded once its value is finished. A player down to 1 card draws from the deck until they get a value not yet finished. When only one value remains, discard the last Number card at once. With 2 players the Captain places no opening info token.',
  two={'captain_no_opening_info':True},components=['number_cards'],
  structured=[{'kind':'hidden_forbidden_value_each_turn','placed_by':'right_neighbour','penalty':{'dial_advance':1}}],
  notes=['FAQ: with multi-wire detectors only the wire actually cut counts; players with no wires put their cards under the deck; if the right neighbour has no card, the next player to the right plays one; coffee-break interplay is described.'],
  sources=['CARD m29','FAQ mission 29'])
m(30,'Runaway Bus',None,W(keep=1,of=2),W(4),
  'Audio and real-time mission. Shuffle the Number cards into a deck, then play the Mission 30 track before the first turn. The narration calls timed phases in which given values must be cut. See audio_script.',
  audio={'track':'Mission 30'},components=['number_cards','audio'],doc='partial',sources=['CARD m30','AUDIO m30 (machine transcript)'])
# ---------------- Box 31-42 ----------------
m(31,'Handicap',None,W(keep=2,of=3),NONE,
  'Lay out constraint cards A-E face up. Before the info tokens, from the Captain clockwise, each player picks one and lays it in front of them; discard the rest. Each player must obey their constraint. A player who cannot obey it at the start of their turn turns it face down and plays freely for the rest of the mission (even if things later change, per FAQ). With 2 players, avoid pairing A with B or C with D.',
  components=['constraint_cards_A-E'],structured=[{'kind':'personal_constraint','pick':'draft','pool':'A-E','drop_when_unplayable':True}],sources=['CARD m31','FAQ mission 31'])
m(32,'Clown Tricks',None,W(2),NONE,
  'Shuffle all 12 constraints into a deck and turn one up. Everyone must obey the face-up constraint. At the start of each turn, the Captain may (after discussion) replace it with the next card. A player blocked by it says so and skips their turn (the dial does not move). Constraints never affect Reveal Reds. An empty deck means no constraint (FAQ).',
  two={'red':W(3)},components=['constraint_cards_A-L'],structured=[{'kind':'global_constraint','deck':'A-L','replace':'captain_option_each_turn','blocked':'skip_no_penalty'}],sources=['CARD m32','FAQ mission 32'])
m(33,'Casino Royale',None,W(keep=2,of=3),NONE,
  'Even/odd tokens replace info tokens throughout (setup, failed cuts, mistakes, sticky note).',
  two={'red':W(3)},components=['even_odd_tokens'],structured=[{'kind':'info_token_replacement','type':'parity'}])
m(34,'Mole Hunt',None,W(1),NONE,
  'Choose the Captain normally, then shuffle all character cards (the Captain card included) and deal them face down; shuffle constraints A-E and deal one face down to each player. Everyone looks at their own two cards. Whoever holds the Captain card is secretly the weak link, and only they must obey their constraint, without revealing it. While the characters are hidden, nobody has a personal item. If the weak link is blocked by their constraint, the dial advances 2 and everyone discards their constraint and character cards. At the start of their own turn, any other player may accuse: name the weak link and describe their constraint, without discussion. If the accusation is wrong in either part, the dial advances 1. If it is right, all characters turn face up, the constraints are discarded and personal items become usable. Not playable with 2 players.',
  players=[3,4,5],characters={'mode':'hidden_random_deal','role':'weak_link=captain_card_holder'},components=['constraint_cards_A-E'],
  structured=[{'kind':'hidden_traitor_constraint'},{'kind':'accusation','penalty_wrong':{'dial_advance':1},'reward_right':'reveal_and_enable_items'},{'kind':'blocked_penalty','dial_advance':2,'then':'discard_all_constraints_and_characters'}])
m(35,'Hard-Wired',None,W(keep=2,of=3),W(4),
  'Before the red and yellow wires are shuffled in, give each player one blue wire face down per stand: it goes unsorted at the far right with an X token. Then shuffle and deal the rest normally. X wires can be cut normally (dual or solo), but only after all 4 yellows are cut. Equipment and personal items cannot touch X wires (full scan 5 and sweep 8 included). Card 2 is replaced if drawn.',
  two={'red':W(3),'yellow':W(4)},equipment={'count':'players','exclude':['eq2']},components=['x_tokens'],
  setup=[{'kind':'unsorted_extra_blue','per':'stand','position':'far_right','token':'X','dealt_before_shuffle':True}],
  structured=[{'kind':'x_wires_immune_to_equipment'},{'kind':'x_wires_locked_until','condition':'all_yellow_cut'}])
m(36,'Beach Panic',None,W(keep=1,of=3),W(2),
  'Deal 5 Number cards face up in a row without reordering them. The Captain alone chooses which end the sequence card (side A) goes at, arrow pointing in. Values on the row must be cut in order starting from the sequence-card end: when 2 wires of the card next to the sequence card are cut, remove that card, and the player who cut them alone chooses whether the sequence card stays or moves to the other end. Values not in the row are free.',
  two={'red':W(keep=2,of=3),'yellow':W(4)},components=['number_cards','sequence_card_A'],
  structured=[{'kind':'cut_order_line','cards':5,'required_per_step':2,'ends':'chooser_may_flip'}])
m(37,'Moving Goalposts',None,W(2),NONE,
  'Constraint deck (all 12), one face up; everyone obeys it. Each time a value is finished (4 wires cut), replace the face-up constraint with the next card. A blocked player says so and skips (no dial step), but if nobody can play for a whole round, the dial advances 1 and the constraint is replaced. An empty deck means no more constraints. Reveal Reds is never constrained.',
  two={'red':W(3)},components=['constraint_cards_A-L'],structured=[{'kind':'global_constraint','deck':'A-L','replace':'on_value_finished','full_round_blocked':{'dial_advance':1,'replace':True}}])
m(38,'Blind Spot',None,W(2),NONE,
  'After the deal, the Captain turns one of their wires around without looking at it and puts it at the far right; the teammates can see its value. Only the Captain may cut that wire, with an ordinary cut but no equipment or Twin Probe, and if that cut fails the bomb explodes. Nobody else may cut it; a player whose only option would be to cut it skips their turn and the dial advances 1. If it is red, the Captain reveals it when only reds remain (FAQ).',
  two={'red':W(3)},setup=[{'kind':'flipped_wire','who':'captain','count':1,'position':'far_right'}],
  structured=[{'kind':'flipped_wire_rules','owner_only':True,'fail':'explode','no_equipment':True,'others_blocked_penalty':{'dial_advance':1}}],sources=['CARD m38','FAQ mission 38'],
  gaps=['How the Captain "cuts it themselves": we read it as using the flipped wire as their own matching wire in a dual cut (naming a value for a teammate wire, guided only by what teammates may legally convey) or in a solo cut. Exact procedure not spelled out.'])
m(39,'The Noble Four',None,W(keep=2,of=3),W(4),
  'No equipment cards. Put any Number card face up in the first equipment slot, and make a face-down deck of 8 random Number cards. Opening info tokens are drawn at random (place truthfully or beside the stand; redraw yellow). The 4 wires of the face-up value must be cut together by a special action: point at all 4 (no personal items), even if you hold none; failure explodes the bomb. Until it is done, discard the top deck card at the end of each round (before the Captain\'s turn). Afterwards, deal the remaining deck cards face down evenly from the Captain clockwise; each player places one info token for a value from their cards near their stand (ignore it if no token of that value is left).',
  two={'red':W(3),'yellow':W(4)},equipment={'count':0},info={'mode':'random_draw','no_match':'beside_stand','redraw_yellow':True},components=['number_cards'],
  structured=[{'kind':'special_action_multi_cut','target':'number_card_value','count':4,'fail':'explode','no_personal_items':True,'allowed_without_holding':True,'reward':'deal_remaining_number_cards_as_info'}],
  gaps=['"Near their tile stand" probably means in front of a matching wire (truthfully), or beside the stand if none; it is ambiguous.','Who chooses the face-up Number card ("any"): assume random.'])
m(40,'Yippee-Ki-Yay',None,W(3),NONE,
  'Count tokens (×1/×2/×3) replace info tokens everywhere, as in mission 24; the opening token is a count token too. With the sticky note a token may go on a cut wire. With 2 players the Captain places no opening token.',
  two={'captain_no_opening_info':True},components=['count_tokens'],structured=[{'kind':'info_token_replacement','type':'count_on_stand'}])
m(41,'Tripwire Tango',None,W(keep=1,of=3),W(count='players_max_4',dealing='one_per_player_from_captain_skip_captain_at_5'),
  'Yellows equal to the player count (maximum 4) are tripwires: deal one face down to each player (with 5 players the Captain gets none) instead of shuffling them in. The dial starts on the last space before the skull. Opening info tokens are drawn at random (truthful or beside the stand). Card Y (yellow) is replaced if drawn. Tripwires are never cut normally; they go one at a time by a special action: point at a teammate\'s tripwire; if right, it is revealed and the dial moves BACK 1; if wrong, an info token is placed and the dial advances 1. A player left with only their own tripwire (plus any reds) skips their turn. With 2 players: 2 of 3 red, 2 yellow. If the pointed wire is red, the bomb explodes (FAQ).',
  two={'red':W(keep=2,of=3),'yellow':W(2,dealing='one_per_player_from_captain')},detonator=1,equipment={'count':'players','exclude':['eqY']},info={'mode':'random_draw','no_match':'beside_stand'},
  structured=[{'kind':'tripwire_single_cut','success':{'dial_advance':-1},'fail':{'dial_advance':1,'info_token':True},'red':'explode','skip_if_only_own_tripwire':True}],sources=['CARD m41','FAQ mission 41'],
  gaps=['With 2 players each player has 2 stands but there are 2 yellows: assume one per player.'])
m(42,'Big Top',None,W(keep=1,of=3),W(4),
  'Audio mission with no time limit. Play the Mission 42 track before the first round; it calls circus "acts" that disrupt the table. See audio_script.',
  audio={'track':'Mission 42'},components=['audio'],doc='partial',sources=['CARD m42','AUDIO m42 (machine transcript)'])
# ---------------- Box 43-54 ----------------
m(43,'Robo-Pal',None,W(3),NONE,
  'Put the robot on space 1 of the board track and deal it some wires face down, unseen (2p 5, 3-4p 4, 5p 3). At the end of every turn the robot moves 1 space; at 12 it turns round and walks back down (11, 10, ...). Whenever the active player cuts wires of the value the robot is standing on, they take one wire from the robot without showing it and sort it into their hand (a 2-stand player picks the stand). To win, every wire must be cut (or red revealed), the robot\'s included. The coffee break (11) does not stop the robot. With 2 players the Captain draws their opening info token at random.',
  two={'captain_random_opening_info':True},components=['robot_standee'],
  setup=[{'kind':'robot_hand','wires':{'2':5,'3':4,'4':4,'5':3},'start_space':1}],
  structured=[{'kind':'robot_patrol','move':'end_of_each_turn','bounce_at':[1,12]},{'kind':'robot_gift','trigger':'cut_value_equals_robot_space','effect':'active_takes_one_robot_wire'}],
  gaps=['Which robot wire is taken (random, or chosen blind) is not stated; assume random.','Whether it bounces again at 1 (assume ping-pong).'])
m(44,'Deep Dive',None,W(keep=1,of=3),NONE,
  'Put 2 oxygen tokens per player in the reserve (drawn on the card). Card 10 is replaced, and the two-value-probe character is not allowed. Before any cut action, take oxygen from the reserve according to the value\'s depth: 1-4 cost 1, 5-8 cost 2, 9-12 cost 3. At the start of the Captain\'s turn all oxygen returns to the reserve. A player who cannot afford a cut skips their turn and the dial advances 1. No talking; the only allowed signal is a thumbs-up meaning "I need oxygen". FAQ: you may pass voluntarily for 1 dial step; the damper (9) can cancel that step, or fake a depth-1 cut.',
  equipment={'count':'players','exclude':['eq10']},characters={'mode':'standard','exclude':['ch_new4']},components=['oxygen_tokens'],
  structured=[{'kind':'oxygen','pool':'shared_reserve','initial':'2*players','cost':{'1-4':1,'5-8':2,'9-12':3},'reset':'start_of_captain_turn','cannot_pay':{'skip':True,'dial_advance':1},'voluntary_pass':{'dial_advance':1}},{'kind':'speech_ban','what':'all','allowed_signal':'thumbs_up_need_oxygen'}],
  sources=['CARD m44','FAQ mission 44'],gaps=['Oxygen cost of a yellow cut is not given (no yellows in this mission at default; none at 2p either). Mission has no 2-player line.','The taken oxygen presumably stays with the player until the reset.'])
m(45,'Volunteers',None,W(2),NONE,
  'No clockwise order. Shuffle the Number cards into a deck. Each turn the Captain turns one up, and the first player (the Captain included) to call "Snip!" must cut that value. Discard a Number card once its value is finished; reshuffle when the deck runs out. Calling "Snip!" without holding the value, or saying anything else (such as "not me"), advances the dial 1. If nobody volunteers, the Captain names a player (or themselves); if that player lacks the value, they place one info token of their choice in front of their stand and the dial advances 1. A player holding only reds may call "Snip!" at any time to Reveal Reds. Cards 10 and 11 are replaced; no two-value-probe character.',
  two={'red':W(3)},equipment={'count':'players','exclude':['eq10','eq11']},characters={'mode':'standard','exclude':['ch_new4']},components=['number_cards'],
  structured=[{'kind':'volunteer_turns','value_source':'number_deck','claim':'shout_snip','false_claim':{'dial_advance':1},'no_volunteer':'captain_designates','designee_lacks':{'info_token_choice':True,'dial_advance':1}}],
  gaps=['A digital build needs a claim mechanic (first click) and a timeout before the Captain designates.','"Info token of their choice" probably means a true token on one of their own wires.'])
m(46,'Double-Oh',None,NONE,W(fixed=[5.1,6.1,7.1,8.1]),
  'No red wires. 4 yellows with the fixed values 5.1, 6.1, 7.1 and 8.1. The four 7s must be cut last. Special action: a player who has only 7s left at the start of their turn must cut all four 7s at once; if that fails, the bomb explodes. Finding a 7 earlier is handled like an ordinary failed cut (info token plus 1 dial step). Card 7 is replaced. With 2 players the Captain places no opening token.',
  two={'captain_no_opening_info':True},equipment={'count':'players','exclude':['eq7']},
  structured=[{'kind':'value_must_be_last','value':7},{'kind':'special_action_multi_cut','target_value':7,'count':4,'trigger':'only_7s_left_at_turn_start','fail':'explode'}],
  gaps=['A 7 "found earlier" by a successful dual cut on 7: we read it as forbidden (it counts as a failure, info token plus dial).','"Only 7s left": presumably reds/yellows count as other wires (there are no reds).'])
m(47,'Mental Math',None,W(keep=2,of=3),NONE,
  'Lay all 12 Number cards face up. To cut, pick 2 available Number cards and add or subtract them to get the value you must cut (for example 3+9 = 12, or 10-3 = 7), then discard both. When none are left, lay all 12 out again. If you cannot, or do not want to, play, the dial advances 1. Card 10 is replaced; no two-value-probe character.',
  two={'red':W(3)},equipment={'count':'players','exclude':['eq10']},characters={'mode':'standard','exclude':['ch_new4']},components=['number_cards'],
  structured=[{'kind':'value_by_arithmetic','cards':2,'ops':['+','-'],'refresh':'when_empty','cannot_or_wont':{'dial_advance':1}}],
  gaps=['Whether the result must be 1-12 (presumably yes); whether yellow can ever be cut (presumably via a solo cut or with no cards); whether the cards are discarded on a failed cut (presumably yes); with an odd count of 1 card left, presumably refresh.'])
m(48,'Three Amigos',None,W(2),W(3,dealing='one_per_player_from_captain'),
  'The 3 yellows are dealt one each, clockwise from the Captain (with 2 players the Captain takes 2, one per stand), then everything else is dealt. Yellows are not cut normally: a special action cuts all 3 at once by pointing at 3 wires; with 4-5 players even a player without a yellow may try. On failure, every pointed wire gets an info token, but the dial advances only 1.',
  two={'red':W(3),'yellow':W(3,dealing='one_per_player_from_captain_captain_gets_2')},structured=[{'kind':'special_action_multi_cut','colour':'yellow','count':3,'allowed_without_holding':'4-5_players','fail':{'dial_advance':1,'info_on_all_pointed':True}}],
  gaps=['Red among the 3 pointed wires: presumably explodes (mission 13 analogy) - not stated.'])
m(49,'Bottle Post',None,W(2),NONE,
  'Everyone keeps oxygen tokens in view: 2p 7 each, 3p 6, 4p 5, 5p 4. To try a cut of value V you must first give V oxygen tokens to any one teammate (not necessarily the one you target). A player who cannot afford a cut skips their turn and the dial advances 1. No talking; only the thumbs-up signal. Card 10 is replaced; no two-value-probe character. FAQ: a player who empties their stand or reveals reds loses their remaining oxygen; you may pass voluntarily for 1 dial step.',
  two={'red':W(3)},equipment={'count':'players','exclude':['eq10']},characters={'mode':'standard','exclude':['ch_new4']},components=['oxygen_tokens'],
  structured=[{'kind':'oxygen','pool':'per_player','initial':{'2':7,'3':6,'4':5,'5':4},'cost':'value','payment':'give_to_one_teammate','cannot_pay':{'skip':True,'dial_advance':1},'voluntary_pass':{'dial_advance':1},'eliminated_player_oxygen':'removed'},{'kind':'speech_ban','what':'all','allowed_signal':'thumbs_up_need_oxygen'}],
  sources=['CARD m49','FAQ mission 49'],gaps=['Cost of a solo cut (assume the value once).'])
m(50,'Lights Out',None,W(2),W(2),
  'Remove the validation tokens and the red/yellow markers. Before shuffling, everyone looks at the red and yellow wires in play. Opening info: point at your wire, then lay the token beside your stand rather than in front of the wire. Failed cuts also put the info token beside the stand rather than in front of the wire. Nobody may share what they remember. Equipment works normally.',
  two={'red':W(3),'yellow':W(4)},info={'mode':'memory','placement':'beside_stand_after_pointing'},
  structured=[{'kind':'memory_mode','validation_tokens':False,'markers':False,'info_tokens':'beside_stand'}],
  notes=['A digital build should hide the token-to-wire link after a short reveal.'])
m(51,'Yes, Sir!',None,W(1),NONE,
  'Shuffle the Number cards into a deck. The dial starts one step further back, as if there were one more player. Each turn the active player becomes "Sir/Ma\'am": turns up the top Number card and alone chooses who (possibly themselves) must make a cut with that value; that player answers "Yes, Sir/Ma\'am!" and does it. The next Sir/Ma\'am is the player to the left of the last one. If the chosen player lacks the value, they place one info token of their choice in front of their stand and the dial advances 1. Discard a Number card once its value is finished; reshuffle when empty. A player holding only reds at the start of their turn must Reveal Reds. Card 10 is replaced; no two-value-probe character. With 2 players: 2 red, and the Captain places no opening token.',
  two={'red':W(2),'captain_no_opening_info':True},detonator='players+1',equipment={'count':'players','exclude':['eq10']},characters={'mode':'standard','exclude':['ch_new4']},components=['number_cards'],
  structured=[{'kind':'turn_script','steps':['reveal_number','designate_cutter_no_consult']},{'kind':'designee_lacks','effect':{'info_token_choice':True,'dial_advance':1}}])
m(52,'Two-Faced',None,W(3),NONE,
  'Every info token in this mission is false: it means "this wire is NOT this value". At setup each player places 2 false tokens (pointing at blue or red wires). When a dual cut fails, the owner of the targeted wire places a token showing the value that was called. Cards 1 and 12 are replaced.',
  two={'red':W(3),'yellow':W(4)},equipment={'count':'players','exclude':['eq1','eq12']},info={'mode':'false','count':2,'may_point_at_red':True},
  structured=[{'kind':'false_info_tokens','who':'everyone'}],gaps=['How the sticky note (4) works here (presumably also false).'])
m(53,'Robo-Rogue',None,W(2),NONE,
  'No detonator dial; the robot replaces it. Put it just before space 1 of the track. At the end of each turn it moves: +1 after a successful cut, -1 after a successful cut whose value equals the space it is on, +2 after a failed cut. If it reaches 12, the bomb explodes. Cards 6 and 9 are replaced.',
  two={'red':W(3)},detonator=None,equipment={'count':'players','exclude':['eq6','eq9']},components=['robot_standee'],
  structured=[{'kind':'robot_fuse','start':0,'explode_at':12,'moves':{'success':+1,'success_value_matches_space':-1,'fail':+2}}],
  gaps=['Movement after Reveal Reds or a skipped turn (assume none).','Whether anything else that would advance the dial (constraint L, etc.) moves the robot (assume +1 per step).'])
m(54,'Red Tide',None,W(11,dealing='facedown_pile_not_dealt'),NONE,
  'Real-time audio mission (10 minutes). All 11 reds are kept out of the deal in a face-down pile; the audio makes players draw them into their hands. Oxygen in view: 2p 9 each, 3p 6, 4p 3, 5p 2; the rest is the central reserve. A cut costs oxygen by depth (1-4 = 1, 5-8 = 2, 9-12 = 3), paid to the reserve. A player who cannot afford any cut at the start of their turn skips it and the dial advances 1 (if you can play, you must, per FAQ). Each time a validation token is placed, every player takes 1 oxygen from the reserve. Card 10 is replaced; no two-value-probe character. Play the Mission 54 track before the first round. Winning opens box 55-66.',
  two={'red':W(11,dealing='facedown_pile_not_dealt')},equipment={'count':'players','exclude':['eq10']},characters={'mode':'standard','exclude':['ch_new4']},
  components=['oxygen_tokens','audio','red_pile'],audio={'track':'Mission 54'},timer={'seconds':600,'source':'audio'},
  structured=[{'kind':'oxygen','pool':'per_player_plus_reserve','initial':{'2':9,'3':6,'4':3,'5':2},'cost':{'1-4':1,'5-8':2,'9-12':3},'payment':'to_reserve','income':{'per_validation_token':1,'each_player':True},'cannot_pay':{'skip':True,'dial_advance':1}}],
  doc='partial',sources=['CARD m54','FAQ mission 54','AUDIO m54 (machine transcript)'])
# ---------------- Box 55-66 ----------------
m(55,'Nope Dares You',None,W(2),NONE,
  'Turn up as many challenge cards as there are players. The dial starts on the last space before the skull. Completing a challenge discards it and moves the dial back 1. A challenge is a condition, either about one stand\'s layout or about a team sequence of cuts.',
  two={'red':W(keep=2,of=3)},detonator=1,components=['challenge_cards'],
  structured=[{'kind':'challenges','count':'players','reward':{'dial_advance':-1}}],
  notes=['From mission 55 (rule sticker C) the double-number equipment joins the random pile.'])
m(56,'Haywire',None,W(keep=2,of=3),NONE,
  'After the deal, each player turns one of their own wires around without looking and puts it at the far right; only the teammates see its value. Each player must cut their own flipped wire themselves with an ordinary cut, without equipment or Twin Probe, and failure explodes the bomb. A player may also dual-cut a teammate\'s flipped wire, but doing so (even successfully) advances the dial 1. The setup panel shows a Number card, but the FAQ erratum says Number cards are NOT used. A flipped red is revealed with Reveal Reds (FAQ).',
  two={'red':W(3)},setup=[{'kind':'flipped_wire','who':'each_player','count':1,'position':'far_right'}],
  structured=[{'kind':'flipped_wire_rules','owner_must_cut':True,'fail_owner':'explode','no_equipment':True,'teammate_dual_cut_cost':{'dial_advance':1}}],
  sources=['CARD m56','FAQ mission 56 (erratum)'],gaps=['As mission 38: the exact way an owner "cuts" a wire they cannot see.','Whether the extra dial step applies to a failed teammate cut on a flipped wire as well (presumably 1 extra on top of the failure).'])
m(57,'Self-Destruct',None,W(1),NONE,
  'Lay all 12 Number cards face up and pair each with a random face-up constraint card. Each time a validation token is placed, the constraint paired with that number becomes active on the board (on top of any previous one; only one is active at a time). Everyone must obey the active constraint. A blocked player says so and skips (no dial step), but if nobody can play for a whole round, the bomb explodes. Reveal Reds is never constrained. Card 10-10 is replaced.',
  two={'red':W(2)},equipment={'count':'players','exclude':['eq1010']},components=['number_cards','constraint_cards_A-L'],
  structured=[{'kind':'global_constraint','source':'paired_with_validated_value','full_round_blocked':'explode'}],
  gaps=['The card names card 10 as "Vaporiser" (our name), which is the 10-10 campaign card; whether the base card 10 is also excluded is unclear - assume only 10-10.'])
m(58,'Probe Party',None,W(2),NONE,
  'Put every info token back in the box: no opening tokens and no tokens on failures, so failed cuts give no information. In exchange, every player\'s Twin Probe can be used on every turn, without limit. Cards 4 and 7 are replaced; no new characters (everyone must have a Twin Probe).',
  two={'red':W(3)},equipment={'count':'players','exclude':['eq4','eq7']},characters={'mode':'base_only'},info={'mode':'none'},
  structured=[{'kind':'no_info_tokens'},{'kind':'unlimited_personal_item','item':'double_probe'}])
m(59,'Robot Guide',None,W(keep=2,of=3),NONE,
  'Lay the 12 Number cards face up in a random line. Stand the robot on card 7, facing the longer side. To cut: (1) leave the robot where it is, or move it forward (never back) to a Number card matching a value in your hand; (2) cut using the value the robot is on; (3) turn the robot around or leave it facing the same way. If no cut is possible with the values under or ahead of the robot, skip your turn, the dial advances 1, and turn the robot around. When a value is finished, turn its card face down. The coffee break (11) skips a whole turn. Card 10 is replaced; no two-value-probe character.',
  two={'red':W(3)},equipment={'count':'players','exclude':['eq10']},characters={'mode':'standard','exclude':['ch_new4']},components=['number_cards','robot_standee'],
  structured=[{'kind':'robot_line','start_card':7,'start_facing':'longer_side','move':'forward_to_held_value_or_stay','cut_value':'robot_card','then':'optional_turnaround','stuck':{'skip':True,'dial_advance':1,'turnaround':True}}],
  gaps=['Whether the robot may stop on, or pass over, face-down (finished) cards (presumably pass over, not stop).','Yellow wires cannot be cut here (there are none).'])
m(60,'Nope Returns',None,W(keep=2,of=3),NONE,
  'Same as mission 55: challenges equal to the player count, the dial on the last space before the skull, and each completed challenge moves the dial back 1.',
  two={'red':W(3)},detonator=1,components=['challenge_cards'],structured=[{'kind':'challenges','count':'players','reward':{'dial_advance':-1}}])
m(61,'Pass It On',None,W(1),NONE,
  'Each player gets a random face-up constraint from A-E. With 2 players, put 2 more A-E cards face up on the table, one at the Captain\'s left and one at the right; with 3 players, 1 extra at the Captain\'s left. Each player must obey their own constraint; a blocked player skips (no dial step), but if nobody can play for a whole round, the bomb explodes. Every round, before the Captain\'s turn, the team may agree to rotate all constraint cards one seat, clockwise or counter-clockwise. At any time a player may swap their constraint for a random card from F-L by advancing the dial 1. Reveal Reds is never constrained.',
  two={'red':W(2)},components=['constraint_cards_A-L'],
  structured=[{'kind':'personal_constraint','pick':'random','pool':'A-E','extra_cards':{'2':2,'3':1},'rotation':'team_vote_each_round','swap_for_F-L':{'dial_advance':1},'full_round_blocked':'explode'}],
  gaps=['How the extra table cards sit in the rotation (presumably as empty "seats").'])
m(62,'Meteor Run',None,W(2),NONE,
  'Turn up as many Number cards as there are players. The dial starts on the last space before the skull. Each time all 4 wires of a face-up Number value are cut, the dial moves back 1.',
  two={'red':W(3)},detonator=1,components=['number_cards'],structured=[{'kind':'dial_reward','on':'number_card_value_finished','dial_advance':-1}])
m(63,'Unsinkable',None,W(2),NONE,
  'The Captain starts with all the oxygen: 2p 14, 3p 18, 4p 24, 5p 30. To try a cut of value V, put V oxygen in the reserve on the card. At the end of your turn hand all your remaining oxygen to your left neighbour. After each round the Captain starts their turn by taking all the oxygen from the reserve. A player who cannot afford a cut skips and the dial advances 1 (you must play if you can, per FAQ). No talking; only the thumbs-up signal. Card 10 is replaced; no two-value-probe character.',
  two={'red':W(3)},equipment={'count':'players','exclude':['eq10']},characters={'mode':'standard','exclude':['ch_new4']},components=['oxygen_tokens'],
  structured=[{'kind':'oxygen','pool':'travelling_bundle','initial_captain':{'2':14,'3':18,'4':24,'5':30},'cost':'value','payment':'to_reserve','pass':'all_to_left_at_end_of_turn','refill':'captain_takes_reserve_at_round_start','cannot_pay':{'skip':True,'dial_advance':1}},{'kind':'speech_ban','what':'all','allowed_signal':'thumbs_up_need_oxygen'}],
  sources=['CARD m63','FAQ mission 63'])
m(64,'Double Haywire',None,W(1),NONE,
  'After the deal, each player turns 2 of their wires around without looking. Following the teammates\' directions, the lower one goes to the far left and the higher one to the far right. A 2-stand player flips only 2 in total: the lowest goes far left of stand 1, the highest far right of stand 2 (FAQ). Owners must cut their own flipped wires themselves with ordinary cuts, without equipment or Twin Probe, and failure explodes. Dual-cutting a teammate\'s flipped wire is allowed but costs 1 dial step.',
  two={'red':W(2)},setup=[{'kind':'flipped_wire','who':'each_player','count':2,'position':'lowest_far_left_highest_far_right'}],
  structured=[{'kind':'flipped_wire_rules','owner_must_cut':True,'fail_owner':'explode','no_equipment':True,'teammate_dual_cut_cost':{'dial_advance':1}}],
  sources=['CARD m64','FAQ mission 64'],gaps=['Same procedural gap as missions 38 and 56.'])
m(65,'Hot Potato',None,W(3),NONE,
  'Deal all 12 Number cards out as evenly as possible, face up in front of the players (with 5 players the Captain and their left neighbour get 3, the others 2). Every cut you attempt must be of a value matching one of your Number cards. If you hold no wire matching any of your cards, skip your turn and the dial advances 1. At the end of every turn the active player gives one of their Number cards to a teammate of their choice. When a value is finished, turn its card face down (face-down cards stay but are never given). The coffee break (11) just lets you skip. Card 10 is replaced; no two-value-probe character. Not playable with 2 players.',
  players=[3,4,5],equipment={'count':'players','exclude':['eq10']},characters={'mode':'standard','exclude':['ch_new4']},components=['number_cards'],
  structured=[{'kind':'value_hand','source':'number_cards_dealt_faceup','must_cut_from_hand':True,'none':{'skip':True,'dial_advance':1},'end_of_turn':'give_one_card_to_teammate'}],
  gaps=['Whether face-down cards may be given ("faceup = numbers you can give" implies only face-up ones may be).'])
m(66,'Bunker Showdown',None,W(2),W(2),
  'Final mission: audio, real-time, with a movement board. Put the bunker card near the board, ground floor up, with the hero standee on the helicopter square. Shuffle constraints A-E: lay 4 face up, one against each side of the bunker card, and the fifth face up as the ACTION constraint. After every cut action, successful or not, you MUST move the standee one square toward a side whose constraint your cut satisfied (for example cutting a 10 lets you move toward an "even" side or a "7-12" side). Walls block; if every allowed move is blocked, stay put. Yellows may only be cut when the audio says so. On a striped square, a successful cut that also satisfies the ACTION constraint performs that square\'s action (the audio explains it), and you do not move. On the stairs square, flip the bunker card to the other floor, put the standee on that floor\'s stairs and keep the N orientation. A trap icon advances the dial 1. A solo cut of 4 counts as 2 cuts (2 moves or actions). Play the Mission 66 track before the first round.',
  components=['bunker_card','hero_standee','constraint_cards_A-E','audio'],audio={'track':'Mission 66'},doc='partial',sources=['CARD m66','CARD bunker front/back','FAQ mission 66','AUDIO m66 (machine transcript)'])

def find(n): return next(x for x in M if x['number']==n)

# ---------- audio scripts (summaries in our own words, order as heard) ----------
find(30)['audio_script']={
 'reliability':'machine transcript (whisper small.en); wording paraphrased; timings approximate; the final ~3 minutes were not transcribed (assumed music/outro)',
 'framing':'Before starting: do setup through the opening info tokens. When the alert tone sounds, stop and listen until it sounds again; narration time never counts. Story: a bus that must not slow down.',
 'phases':[
  {'t':'~1:40','do':'Turn up a Number card. At least 2 wires of that value must be cut within 20 s (already cut is fine; other cuts may come first).'},
  {'t':'~2:35','check':'If the value was not cut: dial +1.','do':'Discard; turn up a new Number card; same 20 s target.'},
  {'t':'~3:20','check':'No reward or penalty this time.','do':'Discard; new card; 20 s.'},
  {'t':'~3:56','check':'If not cut: discard the face-up (available) equipment card with the lowest number.','do':'Replace the Number card; 20 s.'},
  {'t':'~4:36','check':'If cut: reward, every player announces how many yellow wires they hold.','do':'Replace the card; now 15 s.'},
  {'t':'~5:14','check':'If not cut: the active player may only mime from now on; each slip advances the dial 1.','do':'Replace the card; 15 s.'},
  {'t':'~5:36','check':'If cut: the active player draws a Number card and says whether they hold that value.','do':'Replace the card; 15 s.'},
  {'t':'~6:31','check':'If cut: the active player may at once cut the other 2 wires of that value if still uncut.','do':'Discard and turn up 3 Number cards side by side. No other value may be cut until all 4 wires of all three values are cut; a player holding none of them says so and skips. 2 minutes.'},
  {'t':'~9:20','check':'If all three values are finished: the bomb is defused (win). Otherwise the active player must immediately cut all remaining yellows in one go: failure explodes; success discards the 3 cards and gives 2 minutes to cut everything else.'}],
 'gaps':['What happens at the end of the last 2 minutes (presumably explosion if not finished).','Whether the 20 s windows are strict real time across several turns (yes: turns continue during the window).']}
find(42)['audio_script']={
 'reliability':'machine transcript (two passes); act order is reliable; the content of music-only stretches is unknown',
 'framing':'No time limit; disruptive circus acts interrupt play. When the tone sounds, stop and listen.',
 'acts_in_order':[
  'Magician: everyone else closes their eyes; the active player takes one pair of cut wires of the same value and puts them back, uncut, on their original stands; says the magic word; the wires count as uncut again; next player\'s turn.',
  'Tamer: the active player raises a hand; at the whip crack everyone moves one seat to the LEFT without moving the stands (so they now play someone else\'s hand); the tamer lowers the hand and finishes their turn.',
  'Juggler: the active player swaps the positions of two of their already-cut wires with different values (to confuse the others), then finishes their turn.',
  'Tamer again: seat change one place to the RIGHT.',
  'Knife thrower: the active player tosses all of their cut wires, one by one, into the game box; uncut wires stay put.',
  'Rule from now on: whoever cuts a wire must shout "ta-da!" (forgetting is punished later).',
  'Magician again (one pair of cut wires returned to the stands).',
  'Juggler again.',
  'Clouds: remove all validation tokens from the board and from the supply.',
  'Trampoline: the active player says "boing!", then everyone else in clockwise order; then a check: did the last cutter say "ta-da!"? If not, dial +1.',
  'Magician again; trampoline again.',
  'Tamer: seat change one place to the RIGHT.',
  'One more trampoline round; then applause and the end of the track (~16 min).'],
 'gaps':['End of the track; penalties for missing "ta-da!" beyond the single check; what "uncut" means for validation tokens already placed.']}
find(54)['audio_script']={
 'reliability':'machine transcript; event order reliable, exact timings approximate',
 'framing':'10-minute real-time limit after the intro. Recap of the oxygen rules.',
 'events_in_order':[
  'Leak: the active player draws a red from the pile without showing it and sorts it into their stand; everyone sees where it went.',
  'Extra turn: the active player takes another turn immediately.',
  'Bottle: the active player takes 1 oxygen from the reserve.',
  'Leak (draw a red).',
  'Transfer: the active player may give oxygen to, or take oxygen from, one teammate of their choice.',
  'Bottle.',
  'Leak.',
  'Extra turn.',
  'Leak.',
  'Transfer.',
  'Leak.',
  'Leak.',
  'Transfer (with a minutes-left warning).',
  'Finale: everyone must hold their breath while finishing the mission (a table stunt).'],
 'gaps':['Exact cue times (between ~2:10 and ~14:00).','Fewer than 11 leak events were heard (7), so some reds stay in the pile; confirm.']}
find(66)['audio_script']={
 'reliability':'machine transcript; the first objective line is garbled; the structure is clear',
 'framing':'Briefing over a headset. Each objective has a time limit; missing one means mission failure. Between objectives, stop and wait.',
 'objectives':[
  {'limit_s':80,'goal':'Reach the key square (ground floor). Then wait.'},
  {'limit_s':75,'goal':'With the door now open, reach the guard square and perform its ACTION (a successful cut meeting the ACTION constraint while standing there). Then wait.'},
  {'limit_s':60,'goal':'Reach the stairs square and flip the bunker card to the basement. Then wait.'},
  {'limit_s':90,'goal':'A yellow laser bars the way. Reach the lever square, then cut the 2 yellow wires there (the active player may attempt this even with no yellow in hand) to switch the laser off.'},
  {'limit_s':10,'goal':'Bonus: you may rearrange the five constraint cards.'},
  {'limit_s':105,'goal':'Reach the Doctor square and perform its ACTION (handcuff him).'},
  {'limit_s':20,'goal':'Finish cutting every wire. All cut = victory; otherwise failure.'}],
 'failure_rule':'At each "Stop" check, an unmet objective ends the mission in failure.',
 'gaps':['Whether the time limits are strict real time (yes, the narration says the timer is running).','What "reaching" the key square requires: it is striped, so probably a successful ACTION-constraint cut on it.','How the yellow cut at the lever works (probably like the mission 48 special action: point at both yellows).','The key square: the narration says to cut wires matching the ACTION constraint there (confirmed in the second pass).']}
find(66)['bunker']={
 'grid':'3 columns x 4 rows per floor; row 1 = top edge of the card as printed; a compass mark "N" sits bottom-right with an arrow pointing to the card\'s LEFT edge',
 'ground_floor':{'r1c1':'stairs (up arrow)','wall':['between r1c1 and r1c2','between row 2 and row 3 under c1 and c2'],'door':'between r2c3 and r3c3 (grey segment; opens with the key per audio)','r1c2':'striped: guard (action square)','r3c1':'bushes (decoration, assumed passable)','r3c3':'striped: key (action square)','r4c1':'helicopter (start)','other':'plain'},
 'basement':{'r1c1':'stairs (down arrow)','wall':['between r1c1 and r1c2'],'laser':'between row 2 and row 3, full width; impassable until the lever is pulled','r1c2':'trap (dial +1)','r1c3':'striped yellow: lever (action square)','r3c1':'trap (dial +1)','r3c3':'trap (dial +1)','r4c1':'striped red: Doctor with bomb (action square)','other':'plain'},
 'confidence':'read from card art; how the walls, door and decorations are interpreted is our best guess'}

# M19 audio script filled in below
import os
p='m19.json'
if os.path.exists(p): find(19)['audio_script']=json.load(open(p))

assert len(M)==66 and [x['number'] for x in M]==list(range(1,67))
meta={
 'game':'Short Fuse (adaptation of the original game)','mission_count':66,
 'conventions':{
  'name':'our own short name',
  'players':'allowed player counts',
  'dial_advance':'steps toward the skull (negative = move back)','wires.red/yellow':'mode exact {count} | out_of {keep, of}: draw `of` at random, mark all with "?", keep `keep` unseen | fixed {values} | none. candidates restricts the draw range. dealing: shuffled (default) or a special deal.',
  'two_player_overrides':'replacement wire specs and flags printed in the 2-player box',
  'detonator.start':'"players" (fuse = player count), an integer, "players+1", or null (dial not used)',
  'equipment':'count "players" by default; exclude = card ids that are put back and redrawn if drawn',
  'documentation':'full = every printed rule captured; partial = depends on audio narration or has unresolved gaps',
  'gaps':'unresolved ambiguities - our assumption is stated'},
 'campaign_boxes':{'base':'1-8','9-19':'opens after winning 8','20-30':'after 19','31-42':'after 30','43-54':'after 42','55-66':'after 54'},
 'default_equipment_pool':'From mission 3 the base cards 1-12; from mission 9 the yellow-unlock card (missions with yellow wires only); from mission 55 the double-number cards. Characters: from mission 31 non-captains may choose the 4 new characters.'}
json.dump({'meta':meta,'missions':M},open(OUT,'w'),indent=1,ensure_ascii=False)
print('ok',sum(1 for x in M if x['documentation']=='full'),'full;',sum(1 for x in M if x['documentation']=='partial'),'partial;',sum(1 for x in M if x['gaps']),'with gaps')
