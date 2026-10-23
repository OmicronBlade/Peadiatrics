/* ============================================================
   MEPA / SIMPACT — SHARED SITE RUNTIME  (assets/site.js)
   ------------------------------------------------------------
   Owns the navbar, the sticky patient bar wiring, the emergency
   selector, the accordion, and rendering. Pages provide their
   own content data and call MEPA.init({...}). Depends on
   assets/calc.js being loaded first.
   ============================================================ */

/* ---- 1. NAVBAR — single source of truth ----
   Add a page here + drop the file in the folder = it appears in
   the nav on every page automatically. `id` matches each page's
   <body data-page="..."> so the current tab auto-highlights.   */
const NAV_PAGES = [
  { id:'interactive', label:'MEPA/SimPACT',      href:'mepa-interactive.html' },
  { id:'emergency',   label:'Paediatric Emergency', href:'mepa-paediatric-emergency.html' },
  { id:'card',        label:'Emergency card',    href:'mepa-emergency-card.html' },
  { id:'drugs',       label:'Drug reference',    href:'mepa-drug-reference.html' },
  // → add future pages here, e.g.
  // { id:'infusions', label:'Infusions', href:'mepa-infusions.html' },
];

function renderNavbar(){
  const current = document.body.getAttribute('data-page');
  const links = NAV_PAGES.map(p=>
    `<a href="${p.href}"${p.id===current?' class="active"':''}>${p.label}</a>`
  ).join('');
  const nav = document.createElement('nav');
  nav.className = 'topnav';
  nav.innerHTML = `<div class="topnav-inner">
    <span class="brand">MEPA / SIMPACT</span>${links}</div>`;
  document.body.insertBefore(nav, document.body.firstChild);
}

/* ============================================================
   2. NON-TECHNICAL SKILLS + NAP4 (always available)
   ============================================================ */
const NTS_HTML = `<div class="info">
  <h3>Non-technical skills — scored in every scenario</h3>
  <ul>
    <li><b>Declare</b> the emergency out loud &amp; name it</li>
    <li><b>Call for help</b> early — senior + runner</li>
    <li><b>Allocate roles</b>: airway, drugs, CPR, scribe</li>
    <li><b>Closed-loop</b> communication for every drug</li>
    <li><b>Think aloud</b> — share the mental model</li>
    <li><b>Re-evaluate</b> after each intervention</li>
  </ul></div>`;
const NAP4_HTML = `<div class="info">
  <h3>NAP4 lessons — why paediatric airways go wrong</h3>
  <ul>
    <li>Poor assessment &amp; <b>failure to plan for failure</b></li>
    <li><b>Repeated intubation attempts</b> → oedema → CICO</li>
    <li>Slow response to hypoxia → bradycardia → arrest</li>
    <li>Failure to use the <b>LMA</b> as a rescue</li>
    <li>Missing monitoring — <b>SpO₂ + capnography</b></li>
    <li>Desaturation is <b>faster</b> in children (low FRC)</li>
  </ul></div>`;

/* ============================================================
   3. PAGE MODEL + RENDERING
   A page defines:
     MEPA.init({
       algos: ALGOS,                 // () => [ {id,group,c,title,pill,...} ]
       groupOrder: [...],            // optional custom selector order
       ntsGroups: [...],             // groups that get the NTS block
       nap4Groups: [...],            // groups that get the NAP4 block
       ntsMode: 'panel' | 'dropdown',// NTS inside every panel (default) or one drop-down reference
       autoOpenFirst: false          // open first item on load?
     })
   ============================================================ */
const MEPA = (function(){
  let cfg = null;
  const openPanels = new Set();

  const DEFAULT_GROUP_ORDER = [
    'Airway / respiratory','Difficult airway pathways','Circulation',
    'Metabolic','Systems / equipment','Haemorrhage','Reference'
  ];

  function groupsPresent(algos){
    const g={}; algos.forEach(a=>{ (g[a.group]=g[a.group]||[]).push(a); }); return g;
  }

  function buildSelector(){
    const algos = cfg.algos();
    const groups = groupsPresent(algos);
    const order = cfg.groupOrder || DEFAULT_GROUP_ORDER;
    // include any groups the page defined that aren't in the order list
    const extra = Object.keys(groups).filter(g=>!order.includes(g));
    let html='';
    order.concat(extra).forEach(g=>{
      if(!groups[g]) return;
      html+=`<div class="egroup"><div class="glabel">${g}</div>`;
      groups[g].forEach(a=>{
        html+=`<button class="ebtn ${a.c}" data-id="${a.id}"><span class="dot"></span>${a.title}</button>`;
      });
      html+='</div>';
    });
    const list=document.getElementById('selectorList');
    if(!list) return;
    list.innerHTML=html;
    buildSelectorToggle(list);
    list.querySelectorAll('.ebtn').forEach(b=>{
      b.addEventListener('click',()=>togglePanel(b.dataset.id));
    });
  }

  /* phone/tablet: the selector collapses behind a toggle once something is open */
  const narrow = window.matchMedia('(max-width:820px)');
  function buildSelectorToggle(list){
    const aside=list.closest('.selector');
    if(!aside || aside.querySelector('.sel-toggle')) return;
    const btn=document.createElement('button');
    btn.type='button'; btn.className='sel-toggle';
    btn.setAttribute('aria-expanded','true');
    btn.addEventListener('click',()=>setSelectorCollapsed(aside.classList.contains('collapsed')?false:true));
    aside.insertBefore(btn,list);
    updateSelectorToggle();
  }
  function setSelectorCollapsed(c){
    const aside=document.querySelector('.selector'); if(!aside) return;
    aside.classList.toggle('collapsed',c);
    updateSelectorToggle();
  }
  function updateSelectorToggle(){
    const aside=document.querySelector('.selector');
    const btn=aside&&aside.querySelector('.sel-toggle'); if(!btn) return;
    const c=aside.classList.contains('collapsed');
    btn.setAttribute('aria-expanded',String(!c));
    btn.innerHTML=`<span>${c?'Show list':'Hide list'}</span><span class="sel-count">${openPanels.size} open</span>`;
  }
  function panelHTML(a){
    let inner='';
    const ntsGroups  = cfg.ntsGroups  || DEFAULT_GROUP_ORDER.filter(g=>g!=='Reference');
    const nap4Groups = cfg.nap4Groups || ['Difficult airway pathways'];
    if(cfg.ntsMode!=='dropdown' && ntsGroups.includes(a.group)) inner+=NTS_HTML;
    if(a.showNap4 || nap4Groups.includes(a.group)) inner+=NAP4_HTML;
    if(a.type==='custom'){ inner+=a.html(); }
    else {
      inner+='<ol class="steps">'+a.steps.map(s=>`<li>${s}</li>`).join('')+'</ol>';
      if(a.flag) inner+=`<span class="flag">${a.flag}</span>`;
    }
    return `<div class="panel ${a.c} open" data-id="${a.id}">
      <div class="panel-head" data-id="${a.id}">
        <span class="chev">▶</span>
        <h2>${a.title}</h2>
        <span class="pill">${a.pill||''}</span>
      </div>
      <div class="panel-body">${inner}</div>
    </div>`;
  }

  function render(){
    const content=document.getElementById('content');
    if(!content) return;
    const algos=cfg.algos();
    if(openPanels.size===0){
      content.innerHTML=`<div class="empty">
        <h3>${cfg.emptyTitle||'Pick an item to begin'}</h3>
        <p>${cfg.emptyBody||'Choose from the list on the left. It opens here with every dose calculated for the current patient.'}</p>
        ${(cfg.ntsGroups&&!cfg.ntsGroups.length&&cfg.nap4Groups&&!cfg.nap4Groups.length)?'':`<p class="sub">${cfg.ntsMode==='dropdown'?'Non-technical skills are in the drop-down reference above; NAP4 lessons show with the airway pathways.':'Non-technical skills show with every emergency; NAP4 lessons show with the airway pathways.'}</p>`}
      </div>`;
    } else {
      const orderIds = algos.map(a=>a.id).filter(id=>openPanels.has(id));
      content.innerHTML = orderIds.map(id=>panelHTML(algos.find(a=>a.id===id))).join('');
      content.querySelectorAll('.panel-head').forEach(h=>{
        h.addEventListener('click',()=>{ h.closest('.panel').classList.toggle('open'); });
      });
    }
    document.querySelectorAll('.ebtn').forEach(b=>{
      b.classList.toggle('active', openPanels.has(b.dataset.id));
    });
    updateSelectorToggle();
  }

  function togglePanel(id){
    if(openPanels.has(id)) openPanels.delete(id); else openPanels.add(id);
    if(narrow.matches && openPanels.has(id)) setSelectorCollapsed(true);
    render();
    if(openPanels.has(id)){
      setTimeout(()=>{
        const el=document.querySelector(`.panel[data-id="${id}"]`);
        if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
      },30);
    }
  }

  /* ---- patient bar wiring (shared) ---- */
  function readInputs(){
    const av=parseFloat(document.getElementById('ageVal').value);
    const au=document.getElementById('ageUnit').value;
    const mw=parseFloat(document.getElementById('measWt').value);
    if(!isNaN(av)&&av>=0){
      S.ageMonths = au==='months'? av : av*12;
      S.ageYears  = S.ageMonths/12;
    } else { S.ageMonths=null; S.ageYears=null; }
    S.measWt = (!isNaN(mw)&&mw>0)? mw : null;
    updateWeightDisplay();
    render();
  }
  function updateWeightDisplay(){
    const w=estimateWeight();
    const box=document.getElementById('estWtBox');
    const lbl=document.getElementById('estWtLbl');
    const val=document.getElementById('estWtVal');
    const nw=document.getElementById('noWeight');
    if(!box) return;
    if(!w){
      val.textContent='—'; lbl.textContent='Est. weight';
      box.classList.remove('usingmeasured'); if(nw) nw.classList.remove('hide'); return;
    }
    if(nw) nw.classList.add('hide');
    if(w.source==='measured'){
      box.classList.add('usingmeasured'); lbl.textContent='Measured weight';
    } else {
      box.classList.remove('usingmeasured'); lbl.textContent='Est. weight (age)';
    }
    val.innerHTML=`${w.kg} <small>kg</small>`;
  }
  function wirePatientBar(){
    ['ageVal','ageUnit','measWt'].forEach(id=>{
      const el=document.getElementById(id); if(!el) return;
      el.addEventListener('input',readInputs);
      el.addEventListener('change',readInputs);
    });
    const clr=document.getElementById('clearBtn');
    if(clr) clr.addEventListener('click',()=>{
      document.getElementById('ageVal').value='';
      document.getElementById('measWt').value='';
      document.getElementById('ageUnit').value='years';
      S.ageMonths=S.ageYears=S.measWt=null;
      updateWeightDisplay(); render();
    });
  }

  function init(config){
    cfg = config;
    renderNavbar();
    if(cfg.ntsMode==='dropdown'){
      const wrap=document.querySelector('.wrap');
      if(wrap){
        const d=document.createElement('details');
        d.className='ntsref';
        d.innerHTML=`<summary>Non-technical skills — reference</summary>${NTS_HTML}`;
        wrap.parentNode.insertBefore(d,wrap);
      }
    }
    wirePatientBar();
    const syncPb=()=>{ const pb=document.querySelector('.patientbar');
      if(pb) document.documentElement.style.setProperty('--pbh',(pb.offsetHeight+8)+'px'); };
    syncPb(); window.addEventListener('resize',syncPb); window.addEventListener('load',syncPb);
    buildSelector();
    updateWeightDisplay();
    if(cfg.autoOpenFirst){
      const first=cfg.algos()[0]; if(first) openPanels.add(first.id);
    }
    render();
  }

  return { init, togglePanel, render, NTS_HTML, NAP4_HTML };
})();
