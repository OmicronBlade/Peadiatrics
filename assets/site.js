/* ============================================================
   PAEDIATRIC ANAESTHESIA — SHARED SITE RUNTIME  (assets/site.js)
   ------------------------------------------------------------
   Owns the navbar (with theme picker), the sticky patient bar,
   the selector + search, the accordion, and rendering. Pages
   provide their own content data and call MEPA.init({...}).
   Depends on assets/calc.js being loaded first.
   ============================================================ */

const SITE_NAME = 'Paediatric Anaesthesia';

/* ---- 1. NAVBAR — single source of truth ----
   Add a page here + drop the file in the folder = it appears in
   the nav on every page automatically. `id` matches each page's
   <body data-page="..."> so the current tab auto-highlights.   */
const NAV_PAGES = [
  { id:'home',        label:'Home',                    href:'index.html' },
  { id:'interactive', label:'Anaesthesia Emergencies', href:'mepa-interactive.html' },
  { id:'emergency',   label:'Paediatric Emergency',    href:'mepa-paediatric-emergency.html' },
  { id:'drugs',       label:'Drug Reference',          href:'mepa-drug-reference.html' },
  { id:'card',        label:'Emergency Card',          href:'mepa-emergency-card.html' },
];

/* ---- themes (see the [data-theme] blocks in styles.css) ---- */
const THEMES = [
  { id:'slate',    label:'Slate' },
  { id:'mist',     label:'Mist' },
  { id:'navy',     label:'Navy' },
  { id:'graphite', label:'Graphite (Dark)' },
];
function getTheme(){ try{ return localStorage.getItem('pa-theme')||'slate'; }catch(e){ return 'slate'; } }
function setTheme(t){
  document.documentElement.setAttribute('data-theme', t);
  try{ localStorage.setItem('pa-theme', t); }catch(e){}
}

function renderNavbar(){
  const current = document.body.getAttribute('data-page');
  const links = NAV_PAGES.map(p=>
    `<a href="${p.href}"${p.id===current?' class="active"':''}>${p.label}</a>`
  ).join('');
  const opts = THEMES.map(t=>`<option value="${t.id}"${t.id===getTheme()?' selected':''}>${t.label}</option>`).join('');
  const nav = document.createElement('nav');
  nav.className = 'topnav';
  nav.innerHTML = `<div class="topnav-inner">
    <a class="brand" href="index.html">${SITE_NAME}</a>
    <div class="navlinks">${links}</div>
    <label class="themepick"><span>Theme</span><select id="themeSel" aria-label="Colour theme">${opts}</select></label>
  </div>`;
  document.body.insertBefore(nav, document.body.firstChild);
  nav.querySelector('#themeSel').addEventListener('change',e=>setTheme(e.target.value));
}

/* ============================================================
   2. NON-TECHNICAL SKILLS + NAP4 (always available)
   ============================================================ */
const NTS_HTML = `<div class="info">
  <h3>Non-technical Skills — Scored in Every Scenario</h3>
  <ul>
    <li><b>Declare</b> the emergency out loud &amp; name it</li>
    <li><b>Call for help</b> early — senior + runner</li>
    <li><b>Allocate roles</b>: airway, drugs, CPR, scribe</li>
    <li><b>Closed-loop</b> communication for every drug</li>
    <li><b>Think aloud</b> — share the mental model</li>
    <li><b>Re-evaluate</b> after each intervention</li>
  </ul></div>`;
const NAP4_HTML = `<div class="info">
  <h3>NAP4 Lessons — Why Paediatric Airways Go Wrong</h3>
  <ul>
    <li>Poor assessment &amp; <b>failure to plan for failure</b></li>
    <li><b>Repeated intubation attempts</b> → oedema → CICO</li>
    <li>Slow response to hypoxia → bradycardia → arrest</li>
    <li>Failure to use the <b>LMA</b> as a rescue</li>
    <li>Missing monitoring — <b>SpO₂ + capnography</b></li>
    <li>Desaturation is <b>faster</b> in children (low FRC)</li>
  </ul></div>`;

/* ============================================================
   3. PATIENT BAR — injected into <div class="patientbar" id="patientbar">
   ============================================================ */
function patientBarHTML(title, tag){
  return `<div class="pb-inner">
    <div class="pb-title">
      <h1>${title}</h1>
      <div class="tag">${tag||'Doses Live-calculated from Weight'}</div>
    </div>
    <div class="field">
      <label for="ageVal">Age</label>
      <div class="row">
        <input id="ageVal" type="number" min="0" step="0.5" inputmode="decimal" placeholder="—">
        <select id="ageUnit" aria-label="Age unit">
          <option value="years" selected>Years</option>
          <option value="months">Months</option>
        </select>
      </div>
    </div>
    <div class="field">
      <label for="sexVal">Sex</label>
      <div class="row">
        <select id="sexVal">
          <option value="">—</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>
      </div>
    </div>
    <div class="field">
      <label for="htVal">Height</label>
      <div class="row">
        <input id="htVal" type="number" min="0" step="0.5" inputmode="decimal" placeholder="—">
        <span class="unit">cm</span>
      </div>
    </div>
    <div class="field">
      <label for="measWt">Measured Weight</label>
      <div class="row">
        <input id="measWt" type="number" min="0" step="0.1" inputmode="decimal" placeholder="If Known">
        <span class="unit">kg</span>
      </div>
    </div>
    <div class="estwt" id="estWtBox">
      <div class="lbl" id="estWtLbl">Est. Weight</div>
      <div class="val" id="estWtVal">—</div>
    </div>
    <div class="estwt bmibox" id="bmiBox" title="BMI centile (UK-WHO) and SOBA dosing weights">
      <div class="lbl" id="bmiLbl">BMI Centile</div>
      <div class="val" id="bmiVal">—</div>
    </div>
    <button class="pb-clear" id="clearBtn" title="Reset patient">Reset</button>
  </div>
  <div class="noweight" id="noWeight">Enter an age (or a measured weight) to calculate doses. Add height and sex to check BMI centile and obesity dosing weights.</div>`;
}

const PB_KEY = 'pa-patient';
function savePatient(){
  try{ sessionStorage.setItem(PB_KEY, JSON.stringify({
    age:document.getElementById('ageVal').value, unit:document.getElementById('ageUnit').value,
    sex:document.getElementById('sexVal').value, ht:document.getElementById('htVal').value,
    wt:document.getElementById('measWt').value })); }catch(e){}
}
function restorePatient(){
  let p=null; try{ p=JSON.parse(sessionStorage.getItem(PB_KEY)||'null'); }catch(e){}
  if(!p) return;
  document.getElementById('ageVal').value=p.age||'';
  document.getElementById('ageUnit').value=p.unit||'years';
  document.getElementById('sexVal').value=p.sex||'';
  document.getElementById('htVal').value=p.ht||'';
  document.getElementById('measWt').value=p.wt||'';
}

/* ============================================================
   4. PAGE MODEL + RENDERING
   A page defines:
     MEPA.init({
       title, tag,                   // patient-bar heading
       algos: ALGOS,                 // () => [ {id,group,c,title,pill,...} ]
       groupOrder: [...],            // optional custom selector order
       ntsGroups: [...],             // groups that get the NTS block
       nap4Groups: [...],            // groups that get the NAP4 block
       ntsMode: 'panel' | 'dropdown',// NTS inside every panel (default) or one drop-down reference
       autoOpenFirst: false,         // open first item on load?
       searchPlaceholder: '…',
       searchText: a => '…',         // extra searchable text for an item
       searchResults: q => html      // optional results panel above the content
     })
   URL: ?q=term pre-fills the search · ?open=id opens a panel.
   ============================================================ */
const MEPA = (function(){
  let cfg = null;
  const openPanels = new Set();
  let query = '';

  const DEFAULT_GROUP_ORDER = [
    'Airway / Respiratory','Difficult Airway Pathways','Circulation',
    'Metabolic','Systems / Equipment','Haemorrhage','Reference'
  ];

  const strip = h => String(h||'').replace(/<[^>]+>/g,' ').replace(/\$\{[^}]*\}/g,' ');
  function itemText(a){
    let t = [a.title, a.pill, a.group].join(' ');
    if(a.steps) t += ' '+a.steps.join(' ');
    if(a.flag) t += ' '+a.flag;
    if(cfg.searchText) t += ' '+cfg.searchText(a);
    return strip(t).toLowerCase();
  }
  function matches(a){
    if(!query) return true;
    const hay=itemText(a);
    return query.toLowerCase().split(/\s+/).filter(Boolean).every(w=>hay.includes(w));
  }

  function groupsPresent(algos){
    const g={}; algos.forEach(a=>{ (g[a.group]=g[a.group]||[]).push(a); }); return g;
  }

  function buildSelector(){
    const algos = cfg.algos();
    const groups = groupsPresent(algos);
    const order = cfg.groupOrder || DEFAULT_GROUP_ORDER;
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
    buildSearch(list);
    buildSelectorToggle(list);
    list.querySelectorAll('.ebtn').forEach(b=>{
      b.addEventListener('click',()=>togglePanel(b.dataset.id));
    });
  }

  function buildSearch(list){
    const aside=list.closest('.selector');
    if(!aside || aside.querySelector('.search')) return;
    const box=document.createElement('div');
    box.className='search';
    box.innerHTML=`<input type="search" id="selSearch" placeholder="${cfg.searchPlaceholder||'Search'}" aria-label="Search" autocomplete="off">`;
    aside.insertBefore(box, aside.querySelector('h2') ? aside.querySelector('h2').nextSibling : list);
    const inp=box.querySelector('input');
    inp.value=query;
    inp.addEventListener('input',()=>{ query=inp.value.trim(); applyFilter(); render(); });
  }
  function applyFilter(){
    const algos=cfg.algos();
    let shown=0;
    document.querySelectorAll('#selectorList .ebtn').forEach(b=>{
      const a=algos.find(x=>x.id===b.dataset.id);
      const ok=!a||matches(a); b.hidden=!ok; if(ok) shown++;
    });
    document.querySelectorAll('#selectorList .egroup').forEach(g=>{
      g.hidden = ![...g.querySelectorAll('.ebtn')].some(b=>!b.hidden);
    });
    let none=document.getElementById('selNone');
    if(!none){ none=document.createElement('div'); none.id='selNone'; none.className='hint';
      const l=document.getElementById('selectorList'); if(l) l.after(none); }
    none.textContent = shown ? '' : 'No matches.';
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
    aside.insertBefore(btn,aside.firstChild);
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
    btn.innerHTML=`<span>${c?'Show List':'Hide List'}</span><span class="sel-count">${openPanels.size} Open</span>`;
  }
  function panelHTML(a){
    let inner='';
    const ntsGroups  = cfg.ntsGroups  || DEFAULT_GROUP_ORDER.filter(g=>g!=='Reference');
    const nap4Groups = cfg.nap4Groups || ['Difficult Airway Pathways'];
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
    let html='';
    if(query && cfg.searchResults){
      html += `<div class="panel acc open searchres">
        <div class="panel-head"><h2>Search Results — “${query.replace(/</g,'&lt;')}”</h2><span class="pill">Search</span></div>
        <div class="panel-body">${cfg.searchResults(query)}</div></div>`;
    }
    if(openPanels.size===0){
      if(!html) html=`<div class="empty">
        <h3>${cfg.emptyTitle||'Pick an Item to Begin'}</h3>
        <p>${cfg.emptyBody||'Choose from the list on the left. It opens here with every dose calculated for the current patient.'}</p>
        ${(cfg.ntsGroups&&!cfg.ntsGroups.length&&cfg.nap4Groups&&!cfg.nap4Groups.length)?'':`<p class="sub">${cfg.ntsMode==='dropdown'?'Non-technical skills are in the drop-down reference above; NAP4 lessons show with the airway pathways.':'Non-technical skills show with every emergency; NAP4 lessons show with the airway pathways.'}</p>`}
      </div>`;
    } else {
      const orderIds = algos.map(a=>a.id).filter(id=>openPanels.has(id));
      html += orderIds.map(id=>panelHTML(algos.find(a=>a.id===id))).join('');
    }
    content.innerHTML=html;
    content.querySelectorAll('.panel-head').forEach(h=>{
      h.addEventListener('click',()=>{ h.closest('.panel').classList.toggle('open'); });
    });
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
  const PB_IDS=['ageVal','ageUnit','sexVal','htVal','measWt'];
  function readInputs(){
    const av=parseFloat(document.getElementById('ageVal').value);
    const au=document.getElementById('ageUnit').value;
    const mw=parseFloat(document.getElementById('measWt').value);
    const ht=parseFloat(document.getElementById('htVal').value);
    if(!isNaN(av)&&av>=0){
      S.ageMonths = au==='months'? av : av*12;
      S.ageYears  = S.ageMonths/12;
    } else { S.ageMonths=null; S.ageYears=null; }
    S.measWt   = (!isNaN(mw)&&mw>0)? mw : null;
    S.heightCm = (!isNaN(ht)&&ht>0)? ht : null;
    S.sex      = document.getElementById('sexVal').value || null;
    savePatient();
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
      val.textContent='—'; lbl.textContent='Est. Weight';
      box.classList.remove('usingmeasured'); if(nw) nw.classList.remove('hide');
    } else {
      if(nw) nw.classList.add('hide');
      if(w.source==='measured'){ box.classList.add('usingmeasured'); lbl.textContent='Measured Weight'; }
      else { box.classList.remove('usingmeasured'); lbl.textContent='Est. Weight (Age)'; }
      val.innerHTML=`${w.kg} <small>kg</small>`;
    }
    const bb=document.getElementById('bmiBox'); if(!bb) return;
    const b=bodySize();
    const bl=document.getElementById('bmiLbl'), bv=document.getElementById('bmiVal');
    bb.classList.remove('obese','ok');
    if(b && b.bmi!=null){
      bb.classList.add(b.obese?'obese':'ok');
      bl.textContent = `BMI ${b.bmi} · ${b.category}`;
      bv.innerHTML = `${fmtCentile(b.centile)} <small>Centile</small>`
        + (b.obese ? `<span class="dw">IBW ${b.ibw} · AdjBW ${b.adjbw} kg</span>` : `<span class="dw">All Doses on TBW</span>`);
      bb.title = `BMI ${b.bmi} kg/m², ${fmtCentile(b.centile)} centile (UK-WHO). IBW ${b.ibw} kg · AdjBW ${b.adjbw} kg · AdjBW 40% ${b.adjbw40} kg · LBW ${b.lbw} kg`;
    } else {
      bl.textContent='BMI Centile';
      bv.innerHTML = b && b.outOfRange ? '<small>6 mo–20 yr Only</small>' : '<small>Needs Ht, Sex, Wt</small>';
    }
  }
  function wirePatientBar(){
    const pb=document.getElementById('patientbar');
    if(pb && !pb.children.length) pb.innerHTML=patientBarHTML(cfg.title||document.title, cfg.tag);
    if(!document.getElementById('ageVal')) return;
    restorePatient();
    PB_IDS.forEach(id=>{
      const el=document.getElementById(id); if(!el) return;
      el.addEventListener('input',readInputs);
      el.addEventListener('change',readInputs);
    });
    const clr=document.getElementById('clearBtn');
    if(clr) clr.addEventListener('click',()=>{
      ['ageVal','measWt','htVal','sexVal'].forEach(id=>document.getElementById(id).value='');
      document.getElementById('ageUnit').value='years';
      readInputs();
    });
    readInputs();
  }

  function init(config){
    cfg = config;
    renderNavbar();
    if(cfg.ntsMode==='dropdown'){
      const wrap=document.querySelector('.wrap');
      if(wrap){
        const d=document.createElement('details');
        d.className='ntsref';
        d.innerHTML=`<summary>Non-technical Skills — Reference</summary>${NTS_HTML}`;
        wrap.parentNode.insertBefore(d,wrap);
      }
    }
    const params=new URLSearchParams(location.search);
    query=(params.get('q')||'').trim();
    if(params.get('open')) params.get('open').split(',').forEach(id=>openPanels.add(id));
    wirePatientBar();
    const syncPb=()=>{ const pb=document.querySelector('.patientbar');
      if(pb) document.documentElement.style.setProperty('--pbh',(pb.offsetHeight+8)+'px'); };
    syncPb(); window.addEventListener('resize',syncPb); window.addEventListener('load',syncPb);
    buildSelector();
    applyFilter();
    updateWeightDisplay();
    if(cfg.autoOpenFirst && !openPanels.size){
      const first=cfg.algos()[0]; if(first) openPanels.add(first.id);
    }
    render();
    if(params.get('open')) setTimeout(()=>{
      const el=document.querySelector(`.panel[data-id="${params.get('open').split(',')[0]}"]`);
      if(el) el.scrollIntoView({block:'start'});
    },60);
  }

  return { init, togglePanel, render, NTS_HTML, NAP4_HTML };
})();
