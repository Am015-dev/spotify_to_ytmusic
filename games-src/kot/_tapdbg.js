const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync('kot2.html','utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/?phone=1'});const w=dom.window;
w.eval(`ANIM=0;AIDELAY=0;UI.paused=true;UI.n=4;setSeed(3);newGame('solo');UI.info=false;UI.banner='⏪ <b>While you waited:</b> x <span class="more">(tap: how)</span><ol class="recap"><li>a</li></ol>';render()`);
console.log(w.eval(`JSON.stringify({ph:phOn(),choice:!!UI.choice,info:UI.info,ban:document.getElementById('banner').innerHTML.slice(0,40)})`));
w.document.getElementById('banner').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
console.log(w.eval(`JSON.stringify({pop:PHN.pop,card:document.querySelector('.gx-dock').dataset.card,coach:!document.getElementById('coach').classList.contains('hidden')})`));
