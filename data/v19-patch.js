/* OAB Focus SUPER v19
   Consolidação visual baseada na auditoria real do CSS.
   - Design system único: tipografia, cores, raios, sombras e espaçamento.
   - Inter carregada no <head>.
   - Dark mode global persistente.
   - Leitor v18 refinado para uma experiência editorial mais madura, sem alterar conteúdo jurídico.
*/
(() => {
  'use strict';
  const VERSION='19.0';
  const THEME_KEY='oab_focus_theme_v19';

  function installStyles(){
    if(document.getElementById('v19Styles')) return;
    const s=document.createElement('style');
    s.id='v19Styles';
    s.textContent=`
      /* ===== FUNDAÇÃO ===== */
      html{color-scheme:light}
      html[data-theme="dark"]{color-scheme:dark}
      body{font-family:var(--font-ui)!important;background:var(--paper)!important;color:var(--ink);letter-spacing:-.003em}
      body,.main-area,.content,.app-shell{transition:background-color .18s ease,color .18s ease}
      ::selection{background:rgba(122,34,56,.16)}
      :focus-visible{outline:3px solid rgba(37,99,235,.22)!important;outline-offset:2px}
      .muted{color:var(--muted)!important}
      .eyebrow{font-size:var(--t-caption)!important;color:var(--brand)!important;font-weight:800!important;letter-spacing:.12em!important}

      /* ===== COMPONENTES GLOBAIS ===== */
      .btn,.icon-btn,.search-trigger,.filter-select,.search-box input,.login-card input,.form-card input,.form-card select,.plan-config select,.plan-config input{
        border-radius:var(--r-sm)!important;
      }
      .btn{font-weight:700!important;box-shadow:none!important;transition:background-color .16s ease,border-color .16s ease,color .16s ease,transform .16s ease}
      .btn.primary{background:var(--navy)!important;color:#fff!important}
      .btn.primary:hover{background:var(--night-2)!important}
      .btn.secondary{background:var(--surface-2)!important;color:var(--ink)!important}
      .btn.ghost{background:var(--surface)!important;border:1px solid var(--line)!important;color:var(--ink)!important}
      .btn:hover{transform:translateY(-1px)}
      .icon-btn,.search-trigger,.search-box input,.filter-select,.login-card input,.form-card input,.form-card select,.plan-config select,.plan-config input{background:var(--surface)!important;border-color:var(--line)!important;color:var(--ink)!important}
      .search-box input::placeholder,.login-card input::placeholder{color:var(--muted)}

      .card,.level-card,.discipline-card,.topic-row,.question-panel,.side-card,.filter-panel,.stat-card,.ranking,.insight,.badge-card,.user-list,.modal,.login-card,.discipline-hero,.chapter-card,.study-entry,.plan-config,.today-plan,.plan-stat,.v18-plan-card,.v18-today,.hy-card{
        background:var(--surface)!important;border-color:var(--line)!important;border-radius:var(--r-md)!important;box-shadow:var(--shadow-sm)!important;
      }
      .card.clickable:hover,.discipline-card:hover,.topic-row:hover,.study-entry:hover,.hy-card:hover{box-shadow:var(--shadow-md)!important;border-color:#cfd6df!important;transform:translateY(-1px)!important}
      .modal{border-radius:var(--r-lg)!important;box-shadow:var(--shadow-lg)!important}
      .tag,.metric-chip,.status-pill,.reader-meta span,.plan-option .recommended,.v18-mode-chip{border-radius:var(--r-pill)!important}

      /* ===== NAVEGAÇÃO ===== */
      .sidebar{width:var(--sidebar)!important;background:var(--surface)!important;border-right:1px solid var(--line)!important;padding:var(--s6) var(--s4)!important}
      .sidebar .compact{padding:0 var(--s2) var(--s5)!important}
      .side-nav{gap:var(--s1)!important}
      .nav-item{border-radius:var(--r-sm)!important;padding:10px 12px!important;color:var(--muted)!important;font-weight:600!important}
      .nav-item:hover{background:var(--surface-2)!important;color:var(--ink)!important}
      .nav-item.active{background:var(--brand-soft)!important;color:var(--brand)!important;font-weight:800!important}
      .nav-item.active span{color:var(--brand)!important}
      .xp-track{background:var(--surface-2)!important}.xp-track i{background:var(--brand)!important}
      .topbar{background:color-mix(in srgb,var(--paper) 92%,transparent)!important;border-bottom:1px solid var(--line)!important;backdrop-filter:blur(18px)!important}
      .topbar-title small{font-size:var(--t-caption)!important;color:var(--muted)!important}
      .topbar-title h1{font-size:1.2rem!important;font-weight:800!important;letter-spacing:-.025em!important}
      .avatar{background:var(--night)!important;color:#fff!important}
      .content{max-width:1480px!important;padding-top:var(--s8)!important}
      .bottom-nav{background:color-mix(in srgb,var(--surface) 94%,transparent)!important;border-color:var(--line)!important}
      .bottom-nav button{color:var(--muted)!important}.bottom-nav button.active{color:var(--brand)!important}

      /* ===== TIPOGRAFIA / RITMO ===== */
      .page-head{margin-bottom:var(--s8)!important}
      .page-head h2{font-size:clamp(2rem,3vw,var(--t-h2))!important;line-height:1.05!important;font-weight:800!important;letter-spacing:-.045em!important}
      .page-head p{font-size:var(--t-body-sm)!important;line-height:1.6!important;color:var(--muted)!important}
      .section{margin-top:var(--s8)!important}.section-title{margin-bottom:var(--s4)!important}
      .section-title h3{font-size:1.05rem!important;font-weight:800!important}
      .card{padding:var(--s5)!important}.card h4{font-size:1rem!important}.card p{font-size:var(--t-body-sm)!important;line-height:1.6!important}
      .cards-2,.cards-3,.discipline-grid,.stats-grid,.badge-grid{gap:var(--s4)!important}

      /* ===== HEROS — único lugar de gradiente decorativo ===== */
      .hero-card,.dashboard-hero{border-radius:var(--r-lg)!important;box-shadow:var(--shadow-md)!important;background:linear-gradient(138deg,var(--night) 0%,var(--night-2) 100%)!important}
      .hero-card:after{opacity:.35!important}
      .hero-card .btn.secondary,.dashboard-hero .btn.secondary{background:#fff!important;color:var(--night)!important}
      .level-card{box-shadow:var(--shadow-sm)!important}
      .level-ring{background:conic-gradient(var(--brand) var(--pct,0%),var(--surface-2) 0)!important}
      .level-ring:before{background:var(--surface)!important}

      /* ===== ESTUDAR / QUESTÕES / PREPARE-SE ===== */
      .discipline-hero,.study-hero,.prepare-hero,.highyield-hero,.v18-prepare-hero{background:var(--surface)!important;border:1px solid var(--line)!important;color:var(--ink)!important;box-shadow:var(--shadow-sm)!important}
      .discipline-hero h2,.study-hero h2,.prepare-hero h2,.highyield-hero h2,.v18-prepare-hero h2{color:var(--ink)!important}
      .discipline-hero p,.study-hero p,.prepare-hero p,.highyield-hero p,.v18-prepare-hero p{color:var(--muted)!important}
      .chapter-card summary,.topic-row,.study-entry{background:var(--surface)!important}
      .chapter-card summary:hover,.topic-row:hover,.study-entry:hover{background:var(--surface-2)!important}
      .subtopic-btn{border-radius:var(--r-sm)!important;background:var(--surface)!important;border-color:var(--line)!important}
      .subtopic-btn:hover{background:var(--surface-2)!important;border-color:#cfd6df!important}
      .filter-panel{padding:var(--s4)!important}
      .question-panel{padding:var(--s8)!important}
      .answer{border-radius:var(--r-sm)!important;border-color:var(--line)!important;background:var(--surface)!important}
      .answer:hover{border-color:#c6cfda!important;background:var(--surface-2)!important}
      .answer.correct{background:var(--good-bg)!important;border-color:color-mix(in srgb,var(--good) 35%,var(--line))!important}
      .answer.wrong{background:var(--bad-bg)!important;border-color:color-mix(in srgb,var(--bad) 35%,var(--line))!important}
      .plan-option{border-radius:var(--r-md)!important;background:var(--surface)!important;border-color:var(--line)!important;box-shadow:none!important}
      .plan-option:hover,.plan-option.selected{border-color:color-mix(in srgb,var(--brand) 45%,var(--line))!important;box-shadow:var(--shadow-sm)!important}
      .plan-option.selected{background:var(--brand-soft)!important}
      .v18-pedagogy-note,.performance-note{background:var(--surface-2)!important;border-color:var(--line)!important;color:var(--muted)!important;border-radius:var(--r-sm)!important}
      .v18-learning-step{border-color:var(--line)!important}.v18-step-no{background:var(--brand-soft)!important;color:var(--brand)!important}
      .v18-coverage{background:var(--surface-2)!important}.v18-coverage i{background:var(--brand)!important}

      /* ===== LEITOR v19: EDITORIAL SILENCIOSO ===== */
      body.v18-reader-active{--v18-bg:#f5f3ee;--v18-paper:#fffefa;--v18-ink:#172235;--v18-body:#283548;--v18-muted:#667486;--v18-line:#e5e2db;--v18-soft:#f7f5f1;--v18-navy:var(--navy);--v18-wine:var(--brand);--v18-gold:var(--gold);--v18-reading:17.5px;--v18-leading:1.82}
      body.v18-reader-active .content{max-width:none!important;background:var(--v18-bg)!important;padding:16px clamp(18px,2.5vw,36px) 88px!important}
      .v18-reader .v17-reader-chrome{top:78px!important;min-height:52px!important;margin:-16px 0 26px!important;padding:7px 10px!important;background:color-mix(in srgb,var(--v18-bg) 92%,transparent)!important;border:0!important;border-bottom:1px solid var(--v18-line)!important;border-radius:0!important;box-shadow:none!important;backdrop-filter:blur(18px)!important}
      .v18-reader .v17-iconbtn{border-radius:var(--r-sm)!important;color:#526174!important;font-size:var(--t-caption)!important;font-weight:700!important}
      .v18-reader .v17-iconbtn:hover{background:#ebe8e2!important;border-color:transparent!important;color:#1d2b3f!important}
      .v18-reader .v17-iconbtn.primary{background:var(--night)!important;color:#fff!important}
      .v18-reader .v16-reader-grid{grid-template-columns:minmax(176px,210px) minmax(0,790px) minmax(142px,168px)!important;gap:34px!important;max-width:1320px!important;margin:0 auto!important;align-items:start!important}
      .v18-reader .v16-reader-toc{top:152px!important;padding:5px 13px 10px 0!important;border:0!important;border-right:1px solid var(--v18-line)!important;background:transparent!important}
      .v18-reader .v16-reader-toc .toc-label,.v18-reader .v16-reader-status .toc-label{color:#8a918f!important;font-size:.58rem!important;letter-spacing:.16em!important}
      .v18-reader .v16-toc-link{border-radius:6px!important;padding:7px 8px 7px 13px!important;color:#6a7582!important;font-size:.71rem!important;line-height:1.45!important}
      .v18-reader .v16-toc-link:hover{background:#ece9e3!important;color:#26354a!important}
      .v18-reader .v16-toc-link.active{background:transparent!important;color:var(--brand)!important;font-weight:800!important}
      .v18-reader .v16-toc-link.active:before{background:var(--brand)!important}
      .v18-reader .v16-reader-status{top:152px!important;padding:5px 0 0 14px!important;border-left:1px solid var(--v18-line)!important;background:transparent!important}
      .v18-reader .v16-status-card{padding:0 0 16px!important;margin:0 0 16px!important;border:0!important;border-bottom:1px solid var(--v18-line)!important;background:transparent!important;box-shadow:none!important}
      .v18-reader .v16-status-card small{color:#7b8690!important;font-size:.65rem!important}.v18-reader .v16-status-card strong{color:#24344a!important;font-size:1.08rem!important}
      .v18-reader .v16-status-progress{height:3px!important;background:#e7e4de!important}.v18-reader .v16-status-progress i{background:var(--brand)!important}
      .v18-reader #readerArticle{background:var(--v18-paper)!important;border:1px solid var(--v18-line)!important;border-radius:var(--r-md)!important;box-shadow:var(--shadow-sm)!important;padding:50px 56px 58px!important;overflow:visible!important}
      .v18-doc-header{padding-bottom:24px!important;margin-bottom:38px!important;border-bottom:1px solid var(--v18-line)!important}
      .v18-doc-header .eyebrow{color:var(--brand)!important;font-size:.62rem!important}
      .v18-doc-header h1{max-width:18ch!important;margin:9px 0 11px!important;font-family:var(--font-ui)!important;font-size:clamp(2.15rem,3.2vw,2.9rem)!important;line-height:1.03!important;letter-spacing:-.045em!important;font-weight:800!important;color:#172235!important}
      .v18-doc-header>p{max-width:64ch!important;margin:0!important;color:#687586!important;font-family:var(--font-ui)!important;font-size:.9rem!important;line-height:1.65!important}
      .v18-doc-meta{margin-top:16px!important;gap:6px!important}.v18-doc-meta span{padding:5px 8px!important;background:#f4f2ed!important;border:0!important;color:#677281!important;font-size:.64rem!important;font-weight:700!important}
      .v18-reader .study-zone{margin-bottom:58px!important}.v18-reader .study-zone-head{margin-bottom:26px!important;padding-bottom:12px!important;border-color:var(--v18-line)!important}
      .v18-reader .study-zone-head .zone-kicker{color:#8c918e!important;font-size:.57rem!important;letter-spacing:.15em!important}.v18-reader .study-zone-head h2{font-size:1.08rem!important;color:#25354a!important;font-weight:800!important}.v18-reader .study-zone-head p{color:#7b8591!important}
      .v18-reader .integral-section{margin-bottom:46px!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important}
      .v18-reader .integral-section-head{margin-bottom:20px!important;padding-bottom:10px!important;border-bottom:1px solid #ece9e3!important}
      .v18-reader .integral-kind{color:#8b918f!important;font-family:var(--font-ui)!important;font-size:.56rem!important;letter-spacing:.14em!important}
      .v18-reader .integral-section-head h2{font-family:var(--font-ui)!important;font-size:1.46rem!important;line-height:1.22!important;letter-spacing:-.024em!important;font-weight:800!important;color:#1d2b3f!important}
      .v18-reader .integral-body{font-family:var(--font-read)!important;font-size:calc(var(--v18-reading) * var(--v16-font-scale,1))!important;line-height:var(--v18-leading)!important;color:#283548!important;letter-spacing:.001em!important}
      .v18-reader .integral-body p{max-width:66ch!important;margin:0 0 1.34em!important;text-wrap:pretty!important}
      .v18-reader .integral-body h3{margin:2.45em 0 .82em!important;font-family:var(--font-ui)!important;font-size:1.02em!important;line-height:1.32!important;color:#1c2c42!important;font-weight:800!important;letter-spacing:-.01em!important}
      .v18-reader .integral-bullet{margin:.72em 0 .72em 1.1em!important;line-height:1.72!important}
      .v18-reader .v16-law-line{margin:1.45em 0!important;padding:13px 16px!important;border:0!important;border-left:3px solid var(--gold)!important;border-radius:0 var(--r-sm) var(--r-sm) 0!important;background:var(--gold-soft)!important;color:#3a3a36!important;box-shadow:none!important}
      .v18-reader .v16-inline-alert{margin:2em 0 .65em!important;color:#77531d!important;font-family:var(--font-ui)!important;font-size:.68em!important;letter-spacing:.11em!important}
      .v18-reader .v16-compare-row{border-radius:var(--r-sm)!important;border-color:var(--v18-line)!important;box-shadow:none!important;overflow:hidden!important}.v18-reader .v16-compare-row span{background:#faf9f6!important;border-color:var(--v18-line)!important}
      .v18-reader .reference-accordion{background:#faf9f6!important;border-color:var(--v18-line)!important;border-radius:var(--r-sm)!important;box-shadow:none!important}
      .v18-reader-footer{margin-top:70px!important;padding-top:28px!important;border-top:1px solid var(--v18-line)!important}
      .v18-reader-footer .finish{background:#f7f5f0!important;border:1px solid var(--v18-line)!important;border-radius:var(--r-md)!important;box-shadow:none!important}
      .v18-neighbor{background:#faf9f6!important;border:1px solid var(--v18-line)!important;border-radius:var(--r-sm)!important;box-shadow:none!important}
      .v18-highlight-dock{right:22px!important;bottom:22px!important;padding:7px 9px!important;border-radius:var(--r-md)!important;background:rgba(255,255,255,.96)!important;border:1px solid #dfe3e6!important;box-shadow:var(--shadow-md)!important}
      .v18-highlight-dock .label b{font-family:var(--font-ui)!important;font-size:.64rem!important;color:#25354a!important}.v18-highlight-dock .label small{color:#8a939d!important}
      .v18-highlight-palette{border-radius:var(--r-sm)!important;box-shadow:var(--shadow-lg)!important}

      /* ===== DARK GLOBAL ===== */
      html[data-theme="dark"] body,html[data-theme="dark"] .main-area,html[data-theme="dark"] .content{background:var(--paper)!important;color:var(--ink)!important}
      html[data-theme="dark"] .sidebar,html[data-theme="dark"] .topbar,html[data-theme="dark"] .bottom-nav,html[data-theme="dark"] .card,html[data-theme="dark"] .level-card,html[data-theme="dark"] .discipline-card,html[data-theme="dark"] .topic-row,html[data-theme="dark"] .question-panel,html[data-theme="dark"] .side-card,html[data-theme="dark"] .filter-panel,html[data-theme="dark"] .stat-card,html[data-theme="dark"] .ranking,html[data-theme="dark"] .insight,html[data-theme="dark"] .badge-card,html[data-theme="dark"] .user-list,html[data-theme="dark"] .modal,html[data-theme="dark"] .discipline-hero,html[data-theme="dark"] .study-hero,html[data-theme="dark"] .v18-prepare-hero,html[data-theme="dark"] .plan-option,html[data-theme="dark"] .plan-config,html[data-theme="dark"] .v18-plan-card,html[data-theme="dark"] .v18-today{background:var(--surface)!important;border-color:var(--line)!important;color:var(--ink)!important}
      html[data-theme="dark"] .nav-item:hover,html[data-theme="dark"] .topic-row:hover,html[data-theme="dark"] .study-entry:hover,html[data-theme="dark"] .subtopic-btn:hover{background:var(--surface-2)!important}
      html[data-theme="dark"] .nav-item.active{background:var(--brand-soft)!important;color:#e8a9bb!important}
      html[data-theme="dark"] .btn.ghost,html[data-theme="dark"] .search-trigger,html[data-theme="dark"] .search-box input,html[data-theme="dark"] .filter-select,html[data-theme="dark"] input,html[data-theme="dark"] select,html[data-theme="dark"] textarea{background:var(--surface)!important;border-color:var(--line)!important;color:var(--ink)!important}
      html[data-theme="dark"] .v18-reader #readerArticle{background:#151d29!important;border-color:#2b3644!important}
      html[data-theme="dark"] body.v18-reader-active .content{background:#0f1620!important}
      html[data-theme="dark"] .v18-reader .v17-reader-chrome{background:rgba(15,22,32,.94)!important;border-color:#2b3644!important}
      html[data-theme="dark"] .v18-reader .v17-iconbtn{color:#c3ccd6!important}html[data-theme="dark"] .v18-reader .v17-iconbtn:hover{background:#1b2532!important;color:#fff!important}
      html[data-theme="dark"] .v18-doc-header,html[data-theme="dark"] .v18-reader .integral-section-head,html[data-theme="dark"] .v18-reader .study-zone-head,html[data-theme="dark"] .v18-reader-footer{border-color:#2b3644!important}
      html[data-theme="dark"] .v18-doc-header h1,html[data-theme="dark"] .v18-reader .integral-section-head h2,html[data-theme="dark"] .v18-reader .integral-body,html[data-theme="dark"] .v18-reader .integral-body h3{color:#eef2f7!important}
      html[data-theme="dark"] .v18-doc-header>p,html[data-theme="dark"] .v18-reader .study-zone-head p{color:#a8b3c0!important}
      html[data-theme="dark"] .v18-doc-meta span{background:#1b2532!important;color:#b7c1cc!important}
      html[data-theme="dark"] .v18-reader .v16-law-line{background:#29251d!important;color:#e6dcc7!important}
      html[data-theme="dark"] .v18-reader .v16-compare-row span,html[data-theme="dark"] .v18-reader .reference-accordion,html[data-theme="dark"] .v18-reader-footer .finish,html[data-theme="dark"] .v18-neighbor{background:#1b2532!important;border-color:#2b3644!important;color:#d7dee7!important}
      html[data-theme="dark"] .v18-highlight-dock{background:rgba(21,29,41,.96)!important;border-color:#34404d!important}
      html[data-theme="dark"] .v18-highlight-dock .label b,html[data-theme="dark"] .v18-highlight-dock .tool{color:#d7dee7!important}

      /* ===== THEME TOGGLE ===== */
      #v19ThemeToggle{width:40px;height:40px;min-width:40px;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--surface);color:var(--ink);display:grid;place-items:center;cursor:pointer;font-size:1rem;transition:.16s}
      #v19ThemeToggle:hover{background:var(--surface-2)}

      @media(max-width:1180px){.v18-reader .v16-reader-grid{grid-template-columns:minmax(170px,200px) minmax(0,790px)!important;gap:28px!important}.v18-reader .v16-reader-status{display:none!important}}
      @media(max-width:900px){
        .content{padding-left:16px!important;padding-right:16px!important}
        body.v18-reader-active .content{padding:8px 0 94px!important}
        .v18-reader .v17-reader-chrome{top:66px!important;margin:-8px 0 10px!important;padding:7px 10px!important}
        .v18-reader #readerArticle{border:0!important;border-radius:0!important;box-shadow:none!important;padding:34px 22px 50px!important}
        .v18-doc-header h1{font-size:2rem!important}.v18-reader .integral-body{font-size:17px!important;line-height:1.78!important}
        .v18-highlight-dock{left:10px!important;right:10px!important;bottom:78px!important;justify-content:center!important}
      }
      @media(max-width:560px){
        .content{padding-left:12px!important;padding-right:12px!important}.card,.question-panel{padding:16px!important}
        .page-head h2{font-size:1.85rem!important}.v18-reader #readerArticle{padding:29px 18px 46px!important}
        .v18-doc-header h1{font-size:1.82rem!important}.v18-reader .integral-body{font-size:16.8px!important;line-height:1.76!important}
        #v19ThemeToggle{width:38px;height:38px;min-width:38px}
      }
    `;
    document.head.appendChild(s);
  }

  function readTheme(){
    try{return localStorage.getItem(THEME_KEY)||'light';}catch{return 'light';}
  }
  function setTheme(theme,{persist=true,syncReader=true}={}){
    theme=theme==='dark'?'dark':'light';
    document.documentElement.dataset.theme=theme;
    const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=theme==='dark'?'#0f1620':'#fbfaf7';
    if(persist){try{localStorage.setItem(THEME_KEY,theme);}catch{}}
    const btn=document.getElementById('v19ThemeToggle');if(btn){btn.textContent=theme==='dark'?'☀':'◐';btn.title=theme==='dark'?'Usar tema claro':'Usar tema escuro';btn.setAttribute('aria-label',btn.title);}
    if(syncReader&&typeof progress==='object'&&progress){
      progress.readerPrefs=progress.readerPrefs||{};progress.readerPrefs.dark=theme==='dark';
      if(typeof route!=='undefined'&&route==='reader')document.body.classList.toggle('v16-reader-dark',theme==='dark');
      try{markDirty?.();}catch{}
    }
  }
  function addThemeToggle(){
    const host=document.querySelector('.topbar-actions');if(!host||document.getElementById('v19ThemeToggle'))return;
    const b=document.createElement('button');b.id='v19ThemeToggle';b.type='button';b.textContent='◐';b.title='Usar tema escuro';b.setAttribute('aria-label',b.title);
    const avatar=host.querySelector('#avatarBtn');host.insertBefore(b,avatar||null);b.onclick=()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');setTheme(readTheme(),{persist:false,syncReader:false});
  }
  function syncReaderTheme(){
    const dark=document.documentElement.dataset.theme==='dark';
    if(typeof progress==='object'&&progress){progress.readerPrefs=progress.readerPrefs||{};progress.readerPrefs.dark=dark;}
    if(typeof route!=='undefined'&&route==='reader')document.body.classList.toggle('v16-reader-dark',dark);
  }
  function observeReaderDarkButton(){
    document.addEventListener('click',e=>{
      const b=e.target.closest?.('#v17Dark,#v16DarkBtn');if(!b)return;
      setTimeout(()=>{const isDark=document.body.classList.contains('v16-reader-dark');setTheme(isDark?'dark':'light',{persist:true,syncReader:false});},0);
    },true);
  }
  function enhanceReaderV19(){
    if(typeof route==='undefined'||route!=='reader')return;
    syncReaderTheme();
    const article=document.getElementById('readerArticle');if(article)article.setAttribute('data-v19-reader','true');
  }

  installStyles();
  setTheme(readTheme(),{persist:false,syncReader:false});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{addThemeToggle();observeReaderDarkButton();});else{addThemeToggle();observeReaderDarkButton();}

  // Integração sem substituir regras pedagógicas ou de grifagem da v18.
  if(typeof renderReader==='function'){
    const baseRenderReaderV19=renderReader;
    renderReader=function(payload){const out=baseRenderReaderV19(payload);requestAnimationFrame(()=>requestAnimationFrame(enhanceReaderV19));return out;};
  }
  if(typeof renderRoute==='function'){
    const baseRenderRouteV19=renderRoute;
    renderRoute=function(){const out=baseRenderRouteV19();requestAnimationFrame(()=>{addThemeToggle();if(typeof route!=='undefined'&&route==='reader')enhanceReaderV19();});return out;};
  }

  document.documentElement.dataset.oabVersion=VERSION;
  console.info('OAB Focus SUPER v19 ativo');
})();
