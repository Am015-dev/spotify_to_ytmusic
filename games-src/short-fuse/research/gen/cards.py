import json
OUT='../../'
E=[]
def eq(id,unlock,name,_unused,timing,effect,structured,set_,notes=None,confirmed=True,gaps=None):
    E.append(dict(id=id,unlock=unlock,name=name,timing=timing,effect=effect,structured=structured,
                  availability=set_,confirmed=confirmed,notes=notes or [],gaps=gaps or []))
BASE={'pool':'base','from_mission':3}
eq('eq1',{'value':1,'count':2},'Unequal Tag',None,'any_time',
 'Place the single ≠ marker against two neighbouring wires on your own stand whose values differ. One of the two may already be cut. Two reds, or two yellows, always count as equal, so they can never take this marker.',
 {'kind':'place_marker','marker':'neq','target':'own_adjacent_pair','pair_must_differ':True,'allow_one_cut':True,'red_red_equal':True,'yellow_yellow_equal':True},BASE,
 gaps=['Card does not literally say "your" wires (the = card does); assumed own stand.'],confirmed=True)
eq('eq2',{'value':2,'count':2},'Handsets',None,'any_time',
 'Swap one wire with a teammate. You hand them one of your uncut wires face down; they hand you one of theirs face down; each of you slots the new wire into sorted position. Any uncut wire may be swapped, red or yellow included. Everyone sees which slot each wire left and where it went. A player with two stands puts the incoming wire on the stand the outgoing one came from. Info tokens travel with their wire. Neither player may ask for or hint at a value.',
 {'kind':'swap','with':'teammate_choice','own_wire':'any_uncut','their_wire':'their_choice_any_uncut','info_token':'moves_with_wire','reinsert':'sorted','two_stand_rule':'same_stand_as_given','public':['source_slot','dest_slot']},BASE,
 notes=['FAQ: info token follows the wire; in mission 24 the token is discarded instead.','FAQ: you cannot request a value or direct which stand.'])
eq('eq3',{'value':3,'count':2},'Triple Probe',None,'your_turn',
 'During a dual cut, name a number (not yellow) and point at three wires on one teammate stand. The cut succeeds if at least one matches; the teammate cuts one matching wire without saying how many matched. On failure the dial advances 1 and the teammate places one info token in front of one of the three (their choice).',
 {'kind':'multi_target_dual_cut','targets':3,'same_stand':True,'values':'number_only'},BASE,
 notes=['FAQ confirms success and failure handling.'],gaps=['Red handling extrapolated from the Twin Probe: explode only if all chosen wires are red; token goes on a non-red wire.'])
eq('eq4',{'value':4,'count':2},'Sticky Note',None,'any_time',
 'Place an info token showing the true value in front of one of your own blue wires.',
 {'kind':'place_info','target':'own_blue_wire','truthful':True},BASE,
 notes=['In token-replacement missions (21, 24, 33, 40) the replacement token is used instead; in 24/40 it may go on a cut wire.'])
eq('eq5',{'value':5,'count':2},'Full Scan',None,'your_turn',
 'During a dual cut, name a number (not yellow) and point at a teammate\'s entire stand. Success if any wire on it matches; the teammate cuts one matching wire without saying how many. On failure the dial advances 1 and the teammate places one info token in front of a wire of their choice.',
 {'kind':'multi_target_dual_cut','targets':'whole_stand','same_stand':True,'values':'number_only'},BASE,
 gaps=['Red handling extrapolated: a failure means no wire of that value is on the stand; the teammate tags a non-red wire.'])
eq('eq6',{'value':6,'count':2},'Rewind',None,'any_time','Move the detonator dial back one step.',
 {'kind':'dial','dial_advance':-1},BASE,gaps=['Upper bound of the dial (assumed 6).'])
eq('eq7',{'value':7,'count':2},'Recharge',None,'any_time',
 'Pick one or two character cards whose personal item has already been used and turn them face up; each can be used once more this mission.',
 {'kind':'refresh_characters','count_max':2},BASE)
eq('eq8',{'value':8,'count':2},'Sweep',None,'any_time',
 'Call out a number from 1 to 12. Every player, you included, answers yes if they hold at least one uncut blue wire of that number. Players with two stands answer once per stand. Nobody says how many or where. Red and yellow wires never count.',
 {'kind':'radar','values':'1-12','counts':'uncut_blue_only','granularity':'per_stand','reveals':'yes_no'},BASE,
 notes=['FAQ: a red 7.5 is not a 7.','Mission 18 makes it permanently available and repeated each turn.'])
eq('eq9',{'value':9,'count':2},'Damper',None,'start_of_your_turn',
 'Turn this card face down before you make a dual cut this turn. If that cut fails, the dial does not move, and if it lands on a red wire the bomb does not go off. A wrong non-red wire still gets its info token (number or yellow); a red one gets none.',
 {'kind':'shield_next_dual_cut','cancel_dial':True,'cancel_red_explosion':True,'info_token_on_wrong_nonred':True,'info_token_on_red':False},BASE,
 notes=['FAQ: if a red was chosen, no info token.','Mission 14: the rookie cannot use it. Mission 44: it can fake a cut, or cancel the dial step of a pass (FAQ).'])
eq('eq10',{'value':10,'count':2},'Two-Value Probe',None,'your_turn',
 'During a dual cut, name two values (yellow may be one of them) for a single wire. You must hold both values. If the wire is either, the cut succeeds and you cut your matching wire, so teammates also learn that you hold the other value. The two values need not be adjacent. It can be combined with the double, triple or full-scan probes.',
 {'kind':'two_value_dual_cut','values':2,'yellow_allowed':True,'must_hold_both':True,'combinable_with':['double_detector','eq3','eq5']},BASE)
eq('eq11',{'value':11,'count':2},'Coffee Break',None,'your_turn',
 'Skip your turn and choose, without discussion, who takes the next turn; play carries on clockwise from that player.',
 {'kind':'skip_and_choose_next'},BASE,
 notes=['Mission 43: does not stop the robot moving. Mission 59: skips a whole turn. Mission 65: simply lets you skip. FAQ mission 29: interplay with number-card hand-offs.'])
eq('eq12',{'value':12,'count':2},'Equal Tag',None,'any_time',
 'Place the single = marker against two neighbouring wires on your own stand that share a value. One may already be cut. Any two reds, or any two yellows, count as the same.',
 {'kind':'place_marker','marker':'eq','target':'own_adjacent_pair','pair_must_match':True,'allow_one_cut':True},BASE)
eq('eqY',{'value':'yellow','count':2},'Hidden Compartment',None,'instant',
 'As soon as it unlocks, draw two more equipment cards and add them to this mission. They may already be unlocked if their values have been cut.',
 {'kind':'add_equipment','count':2,'trigger':'on_unlock'},{'pool':'yellow','from_mission':9,'only_if_mission_has_yellow':True},
 notes=['Rule sticker A.'],gaps=['"Instant" assumed to fire automatically on unlock.'])
D={'pool':'double','from_mission':55}
eq('eq22',{'value':2,'count':4},'Lone Tag',None,'any_time',
 'Place a ×1 token in front of one of your blue wires, cut or uncut. It means that value appears only once on that stand, counting cut wires.',
 {'kind':'place_count_token','token':'x1','target':'own_blue_wire_cut_or_uncut'},D,notes=['Rule sticker C: all 4 wires of the value must be cut to unlock.'])
eq('eq33',{'value':3,'count':4},'Supply Drop',None,'instant',
 'All equipment cards already used this mission turn face up again and can be used once more.',
 {'kind':'refresh_equipment','trigger':'on_unlock'},D,gaps=['"Instant" assumed to fire on unlock.'])
eq('eq99',{'value':9,'count':4},'Express Pass',None,'your_turn',
 'Make a solo cut of two identical wires from your hand even if other wires of that value are still uncut elsewhere.',
 {'kind':'solo_cut_override','count':2},D)
eq('eq1010',{'value':10,'count':4},'Vaporiser',None,'instant',
 'Draw an info token at random from the supply and reveal its number. Every player cuts all of their remaining wires of that number.',
 {'kind':'random_mass_cut','source':'info_token_supply','trigger':'on_unlock'},D,
 gaps=['If a yellow token or a value with no uncut wires comes up: assumed redraw.','"Instant" assumed to fire on unlock.'])
eq('eq1111',{'value':11,'count':4},'Hook Line',None,'any_time',
 'Point at a teammate wire, take it without revealing it, and slot it into your hand in sorted order. Everyone sees where it came from and where it went.',
 {'kind':'steal_wire','target':'teammate_any_uncut','reinsert':'sorted','two_stand_rule':'player_chooses'},D,notes=['FAQ: a two-stand player chooses the stand.'])
json.dump({'meta':{'note':'Names are our own. unlock.count = wires of that value that must be cut. Timing labels follow the card footers.',
   'base_unlock_rule':'Usable from the moment the first 2 wires of the card value are cut; usable once per mission; flip face down after use. Anyone may use a card at any time unless its timing says otherwise; several may be chained.',
   'setup':'Draw one card per player at random from the eligible pool. Missions list cards to discard and replace.'},
   'equipment':E},open(OUT+'equipment.json','w'),indent=2,ensure_ascii=False)
C=[
 dict(id='ch_captain',name='Squad Lead',is_captain=True,personal_item='double_probe',availability={'from_mission':1},
      notes=['Captain card; also the role marker used by missions 14, 17, 28, 34.']),
]
for i in range(1,5):
    C.append(dict(id=f'ch_base{i}',name=['Wren','Pike','Moss','Tally'][i-1],is_captain=False,personal_item='double_probe',availability={'from_mission':1}))
for k,(nm,item,ref) in enumerate([('Echo','sweep',None),('Relay','handsets',None),('Trident','triple_probe',None),('Prism','two_value_probe',None)]):
    C.append(dict(id=f'ch_new{k+1}',name=nm,is_captain=False,personal_item=item,availability={'from_mission':31,'non_captain_only':True}))
ITEMS={
 'double_probe':dict(timing='your_turn (during a Dual Cut)',uses='once per mission',
   effect='During a dual cut, name a number (1-12, never yellow or red) and point at two wires on the same stand of one teammate (not necessarily adjacent). If either matches, the cut succeeds: if both match, the teammate quietly picks which one to cut, and you cut one of your own matching wires. If neither matches, the dial advances 1 and the teammate places one info token in front of one of the two (their choice). If exactly one of the two is red, nothing explodes and the token must go on the non-red wire; if both are red, the bomb explodes.',
   structured={'kind':'multi_target_dual_cut','targets':2,'same_stand':True,'adjacent_required':False,'values':'number_only','both_red':'explode','one_red':'no_explosion_token_on_other'},
   sources=['RB p.6','FAQ Twin Probe']),
 'sweep':dict(timing='any_time',uses='once per mission',effect='Same as the Sweep equipment card (eq8).',structured={'as_equipment':'eq8'},sources=['CARD character_e1','rule sticker B']),
 'handsets':dict(timing='any_time',uses='once per mission',effect='Same as the Handsets equipment card (eq2).',structured={'as_equipment':'eq2'},sources=['CARD character_e2','rule sticker B']),
 'triple_probe':dict(timing='your_turn',uses='once per mission',effect='Same as the Triple Probe equipment card (eq3).',structured={'as_equipment':'eq3'},sources=['CARD character_e3','rule sticker B']),
 'two_value_probe':dict(timing='your_turn',uses='once per mission',effect='Same as the Two-Value Probe equipment card (eq10).',structured={'as_equipment':'eq10'},sources=['CARD character_e4','rule sticker B'],
   notes=['Excluded in missions 44, 45, 47, 49, 51, 54, 59, 63, 65.']),
}
json.dump({'meta':{'rules':['Captain takes the Captain card; others choose freely (missions 14, 17, 34 deal them randomly).','Each personal item is usable once per mission; flip the card face down after use. Recharge (eq7) restores up to 2.',
  'From mission 31 (rule sticker B) non-captains may take one of the 4 new characters instead of a base one.',
  'Base character cards 2-5 have no printed names; our names are invented.'],
  'personal_item_restrictions':{'27':'nobody has a personal item','28':'the Captain has none','34':'none until the weak link is exposed','58':'Twin Probe is unlimited; new characters are banned','new_character_ban_two_value_probe':[44,45,47,49,51,54,59,63,65]}},
  'personal_items':ITEMS,'characters':C},open(OUT+'characters.json','w'),indent=2,ensure_ascii=False)
print(len(E),len(C))
