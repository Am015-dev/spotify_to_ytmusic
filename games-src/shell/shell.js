// ===== Board-first shell: dock toggle, sheet sizing, closable popups (drawers) =====
const GX={key:'gx',open:null,
  init(o){this.key=o&&o.key||'gx';document.documentElement.classList.add('gx');const app=document.querySelector('.gx-app');this.app=app;
    let min=false;try{min=localStorage.getItem(this.key+'_dockmin')==='1'}catch(e){}if(min)app.classList.add('gx-dock-min');
    if(!document.querySelector('.gx-scrim')){const s=document.createElement('div');s.className='gx-scrim';s.addEventListener('click',()=>this.close());document.body.appendChild(s);this.scrim=s}
    document.addEventListener('click',e=>{const t=e.target.closest('[data-gx]');if(!t)return;const a=t.dataset.gx;
      if(a==='dock')this.toggleDock();else if(a==='sheet')this.cycleSheet();else if(a==='close')this.close();else this.toggle(a)});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&this.open){this.close();e.stopImmediatePropagation()}},true);
    // keyboard basics: Enter/Space presses the focused control, or the main action when nothing is focused. Runs last (window, bubble)
    // and only if the game did not handle the key itself (preventDefault); games can opt out with GX.noKeys=true.
    window.addEventListener('keydown',e=>this.key1(e));
    // resize hook for boards
    const b=document.querySelector('.gx-board');if(b&&window.ResizeObserver)new ResizeObserver(()=>{for(const f of this._rs)try{f(b.clientWidth,b.clientHeight)}catch(e){}}).observe(b)},
  // a drawer is modal: the page behind it is inert and hidden from assistive tech, so nothing under the sheet is a live tap target
  bg(on){const a=this.app;if(!a)return;if(on){a.setAttribute('aria-hidden','true');a.inert=true}else{a.removeAttribute('aria-hidden');a.inert=false}},
  PRIMARY:'[data-gx-primary],.gx-primary,.gxh-ok,.gxc-btn.go,button.pri,.btn.pri,.pb.pri,button.primary,.btn.primary,button.go,.btn.go',
  key1(e){if(this.noKeys||e.defaultPrevented||e.repeat||e.ctrlKey||e.metaKey||e.altKey||(e.key!=='Enter'&&e.key!==' '))return;
    const t=e.target;if(t&&t.closest&&t.closest('input,textarea,select,[contenteditable=""],[contenteditable="true"]'))return;
    if(t&&t!==document.body&&t!==document.documentElement){if(t.matches('button,a[href],summary,input'))return; // native controls press themselves
      if(t.matches('[role=button],[role=menuitem],[role=tab],[role=option],[tabindex]')){e.preventDefault();t.click()}return}
    const b=this.primary();if(b){e.preventDefault();b.click()}},
  // the main action: the first visible, enabled primary button (inside the open popup if there is one)
  primary(){const root=this.open&&document.getElementById(this.open)||document;
    for(const b of root.querySelectorAll(this.PRIMARY)){if(b.disabled||b.getAttribute('aria-disabled')==='true'||b.closest('[inert],[aria-hidden="true"],[hidden]'))continue;
      const r=b.getBoundingClientRect();if(r.width<4||r.height<4||r.bottom<0||r.right<0||r.top>innerHeight||r.left>innerWidth)continue;
      const s=getComputedStyle(b);if(s.visibility==='hidden'||s.pointerEvents==='none'||+s.opacity<.1)continue;return b}return null},
  _rs:[],onResize(f){this._rs.push(f)},
  boardSize(){const b=document.querySelector('.gx-board');return b?{w:b.clientWidth,h:b.clientHeight}:{w:innerWidth,h:innerHeight}},
  toggleDock(force){const min=force!=null?!force:!this.app.classList.contains('gx-dock-min');this.app.classList.toggle('gx-dock-min',min);this.app.classList.remove('gx-sheet-full');try{localStorage.setItem(this.key+'_dockmin',min?'1':'0')}catch(e){}},
  // phone sheet: min -> normal -> full -> min
  cycleSheet(){const a=this.app;if(a.classList.contains('gx-dock-min')){this.toggleDock(true)}else if(!a.classList.contains('gx-sheet-full'))a.classList.add('gx-sheet-full');else{a.classList.remove('gx-sheet-full');this.toggleDock(false)}},
  showDock(){if(this.app&&this.app.classList.contains('gx-dock-min'))this.toggleDock(true)},
  toggle(id){if(this.open===id)this.close();else this.show(id)},
  show(id){const d=document.getElementById(id);if(!d)return;if(this.open&&this.open!==id){const o=document.getElementById(this.open);if(o)o.classList.remove('on')}
    this.open=id;d.classList.add('on');this.scrim&&this.scrim.classList.add('on');this.bg(true);this._back=document.activeElement;
    for(const b of document.querySelectorAll('[data-gx="'+id+'"]'))b.setAttribute('aria-expanded','true');
    const f=d.querySelector('.gx-x');if(f)f.focus({preventScroll:true});if(this.onShow)this.onShow(id)},
  close(){if(!this.open)return;const id=this.open;const d=document.getElementById(this.open);if(d)d.classList.remove('on');for(const b of document.querySelectorAll('[data-gx="'+this.open+'"]'))b.setAttribute('aria-expanded','false');this.open=null;this.bg(false);this.scrim&&this.scrim.classList.remove('on');if(this._back&&this._back.focus)this._back.focus({preventScroll:true});if(this.onClose)this.onClose(id)},
  // build a drawer shell around a body element: <div class=gx-drawer id><head><h2>title</h2><button.gx-x></head><body/></div>
  drawer(id,title,bodyEl,wide){let d=document.getElementById(id);if(!d){d=document.createElement('section');d.id=id;d.className='gx-drawer'+(wide?' wide':'');d.setAttribute('role','dialog');d.setAttribute('aria-label',title);
      d.innerHTML=`<div class="gx-drawer-head"><h2></h2><button class="gx-x" data-gx="close" aria-label="Close">×</button></div><div class="gx-drawer-body"></div>`;document.body.appendChild(d)}
    d.querySelector('h2').textContent=title;if(bodyEl){const b=d.querySelector('.gx-drawer-body');if(bodyEl.parentNode!==b){b.innerHTML='';b.appendChild(bodyEl)}}return d}};
