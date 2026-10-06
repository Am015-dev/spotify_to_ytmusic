exec(open('P.py').read())
R('window.__mho={',open('gar1.js').read()+'\nwindow.__mho={')
# credits: Alex makes the 3D models now (coordinator, 2026-10-06); keep the existing line
R('<div class="ldby">Made with <b>❤</b> by Alex</div>','<div class="ldby">Made with <b>❤</b> by Alex</div><div class="ldby" style="margin-top:2px;font-size:13px">3D models by Alex</div>')
R('<p class="credby">Made with <b>❤</b> by <b>Alex</b></p>','<p class="credby">Made with <b>❤</b> by <b>Alex</b></p><p class="credby">3D models by <b>Alex</b></p>')
save()
