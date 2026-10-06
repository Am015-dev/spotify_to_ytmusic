exec(open('P.py').read())
# UPDATES screen: OD_CHANGELOG near the top of the game code, UI module before window.__mho
R('<script type="module">\n','<script type="module">\n'+open('upd0.js').read(),1)
R('window.__mho={',open('upd1.js').read()+'\nwindow.__mho={')
# credits: Kenney is the base asset pack; the cars/figures are Alex's (coordinator, 2026-10-06)
R('<div class="ldc">3D models by Kenney (CC0) · ','<div class="ldc">Base assets: Kenney (CC0) · ')
R('<p><b>3D models</b>: Kenney (www.kenney.nl)','<p><b>Base assets</b>: Kenney (www.kenney.nl)')
save()
