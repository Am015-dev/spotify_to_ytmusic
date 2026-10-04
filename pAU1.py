# pAU1 · embeds au.js (adaptive music, richer SFX, feedback polish, portrait-hint fix) right before the debug API object
exec(open('P.py').read())
import os
AU_OLD=open('docs/modules/au.js').read() if os.path.exists('docs/modules/au.js') else ''
if AU_OLD and AU_OLD in s: R(AU_OLD,open('au.js').read())  # live base (v81+) already embeds AU: swap in the current module
else: R('window.__mho={',open('au.js').read()+'\nwindow.__mho={')
save()
