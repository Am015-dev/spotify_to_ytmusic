# pQA2 · HUD layout on phones (iPhone 16 landscape 852×393 and big touch screens) + map not covered + no keyboard hints on touch
# Measured (tPlay, 852×393): NPC dialog #npcSay 84–387 × 8–126 sat on the minimap, the STAGE/timer bar (#raceW), the district plate
# and the NEXT arrow (its text was cut off under the minimap); the event tracker #qTrk drew on top of the open map.
exec(open('P.py').read())
css='''
/* QA: NPC dialog clear of minimap / stage bar / plate; event tracker under the map */
#roamMap{z-index:20}
body #roam #npcSay{left:calc(124px + env(safe-area-inset-left,0px))!important;max-width:min(430px,calc(50vw - 300px))!important}
#roam:has(#npcSay:not([hidden])) #roamPlate{visibility:hidden}
#roam:has(#chRes:not([hidden])) #m1Next,#roam:has(#chRes:not([hidden])) #roamPop{visibility:hidden}
@media (orientation:landscape) and (max-height:500px){body #roam #npcSay{left:auto!important;right:calc(200px + env(safe-area-inset-right,0px))!important;top:calc(92px + env(safe-area-inset-top,0px))!important;max-width:min(270px,32vw)!important}
 body #roam #npcSay p{font-size:12px!important;line-height:1.25!important}
 /* pause menu ran off the top and bottom of a 393 px screen (title and QUIT TO TITLE cut off) */
 /* tutorial card and pop-up challenge sat on the minimap and the district plate */
 body #roam #roamTut{left:50%!important;right:auto!important;top:auto!important;bottom:calc(36px + env(safe-area-inset-bottom,0px))!important;transform:translateX(-50%)!important;max-width:min(390px,45vw)!important}
 body #roam #roamPop{left:calc(112px + env(safe-area-inset-left,0px))!important;top:calc(146px + env(safe-area-inset-top,0px))!important;transform:none!important}
 #roamPause .pp{max-height:calc(100vh - 12px);overflow-y:auto;padding-bottom:10px}#roamPause .pg{grid-template-columns:repeat(3,1fr);gap:6px;padding:6px 10px 0}
 #roamPause .pg button{padding:6px 8px;font-size:13px;white-space:nowrap}#roamPause .pg button.big{font-size:15px}#roamPause .pg button.ev.q{grid-column:auto}}
'''
R('</style>',css+'</style>')
R('window.__mho={',open('qa.js').read()+'\nwindow.__mho={')
save()
