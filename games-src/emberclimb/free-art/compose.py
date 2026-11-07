#!/usr/bin/env python3
"""Compose emberclimb free-kit pictures. Usage: FREEKIT_CACHE=/path python3 compose.py [sheet.png]"""
import sys, os, json
H = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, H + '/../../free-kit')
import generic
G = lambda n, c=None: ('g', n, c) if c else ('g', n)
CFG = dict(
    stage=(150, 70, 40), stages=[(150, 70, 40), (120, 60, 50), (60, 80, 120), (90, 110, 70)], tex='dark_wooden_planks', paper=(150, 125, 100), ground='rusty_metal', table='dark_wooden_planks',
    bands=[(160, 60, 40), (50, 90, 150), (110, 60, 130)], badges=['sword', 'shield', 'fire'], chars=['gorilla', 'rhino', 'q_wolf', 'q_cat', 'crocodile', 'q_dog'], card_ground=False,
    pool=[G('sword'), G('shield'), G('fire'), G('skull')],
    kw=[(r'strike|slash|cleave|hammer|slam|bash|sunder|rap|swing|blade|edge', [G('sword'), G('dice_sword'), G('hand_cross')]), (r'defend|bulwark|iron-skin|plate|fort|block|barrier|armor', G('shield')),
        (r'knife|knives|dagger|stab|needle|backstab|cut|pinprick', [G('sword'), ('a', 'q_cat'), G('dice_skull' if False else 'dice_sword')]), (r'toxic|vial|poison|venom|noxious|plague|choking|cloud|envenom|bile|slime', G('flask_full')),
        (r'zap|beam|lightning|charge|circuit|capacitor|overclock|core|reactor|compile|static|tempest|multicast|hyperbeam', [G('fire'), G('spinner'), G('d20')]), (r'meteor|burn|kindle|pyre|ember|fire|eruption|ash', G('fire')),
        (r'palm|fist|kick|wheel|bow|zen|deva|judgment|windmill|vigilance|calm|inner|water', [G('hand'), G('hand_card'), ('a', 'monkey'), G('hourglass')]), (r'wound|dazed|regret|doubt|injury', G('skull')), (r'shiv', G('sword')),
        (r'enemy-slug|slug|grub|snare|vine', ('a', 'snake')), (r'gnawer|rat|tick', ('a', 'crocodile')), (r'imp|acolyte|hex', ('a', 'monkey')), (r'brute|statue|warden|colossus|behemoth|wraith', ('a', 'gorilla')),
        (r'hero-w', G('sword')), (r'hero-s', G('award')), (r'hero-a', G('fire')), (r'hero-m', G('hand')), (r'relic|ring|bangle|coin|tooth|heart|beads|stub|dawnstone', G('award')),
        (r'lantern|candle|censer', ('c', 'campfire')), (r'pot-|flask|brew|tonic|draught|vial|gas|die', G('flask_full')), (r'node-rest|rest', ('c', 'campfire')), (r'shop|treasure', ('c', 'chest')),
        (r'monster|elite|boss', G('skull')), (r'event', G('hexagon_question')), (r'intent-attack', G('sword')), (r'intent-defend', G('shield')), (r'intent', G('arrow_up' if False else 'hexagon')),
        (r'^w-', [G('sword'), G('dice_sword'), G('hand_cross'), G('crown_a'), ('a', 'rhino')]), (r'^s-', [G('sword'), ('a', 'q_cat'), G('pawn'), G('flask_empty'), G('hand_token')]), (r'^a-', [G('fire'), G('spinner'), G('d20'), G('flask_half'), G('hexagon_tile'), ('a', 'q_piranha')]), (r'^m-', [G('hand'), G('hand_card'), ('a', 'monkey'), G('hourglass'), G('award'), ('a', 'panda')]), (r'die-', G('d6')), (r'fx|gem', G('hexagon')), (r'frame', G('card_outline')), (r'back', G('cards_stack')), (r'st-|orb|stance|icon', G('hexagon_tile'))],
    scene=dict(sky=[((50, 30, 40), (200, 100, 50)), ((20, 25, 45), (120, 70, 60)), ((70, 50, 70), (220, 140, 80))], ground='rusty_metal', gtint=(110, 80, 70), mid='cliff_side', midtint=(100, 70, 70), haze=(190, 100, 60),
               props=[(('c', 'tower', (15, 10, 10)), .5, .72, .4), (('c', 'campfire', (255, 190, 90)), .3, .92, .1), (('c', 'rocksTall', (15, 10, 10)), .12, .8, .2), (('c', 'rocksTall', (15, 10, 10)), .88, .8, .22)]),
    fxcol=(255, 160, 70))
if __name__ == '__main__':
    generic.main('emberclimb', 'emberclimb', H, json.load(open(H + '/../assets.json'))['items'], CFG, sys.argv[1] if len(sys.argv) > 1 else None)
