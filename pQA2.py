# pQA2 · HUD layout on phones (iPhone 16 landscape 852×393 and big touch screens) + map not covered + no keyboard hints on touch
# Measured (tPlay, 852×393): NPC dialog #npcSay 84–387 × 8–126 sat on the minimap, the STAGE/timer bar (#raceW), the district plate
# and the NEXT arrow (its text was cut off under the minimap); the event tracker #qTrk drew on top of the open map.
exec(open('P.py').read())
css='''
/* QA: NPC dialog clear of minimap / stage bar / plate; event tracker under the map */
#roamMap{z-index:20}
body #roam #npcSay{left:calc(124px + env(safe-area-inset-left,0px))!important;max-width:min(430px,calc(50vw - 300px))!important}
#roam:has(#npcSay:not([hidden])) #roamPlate{visibility:hidden}
@media (orientation:landscape) and (max-height:500px){body #roam #npcSay{left:auto!important;right:calc(200px + env(safe-area-inset-right,0px))!important;top:calc(92px + env(safe-area-inset-top,0px))!important;max-width:min(270px,32vw)!important}
 body #roam #npcSay p{font-size:12px!important;line-height:1.25!important}}
'''
R('</style>',css+'</style>')
R('window.__mho={',open('qa.js').read()+'\nwindow.__mho={')
save()
