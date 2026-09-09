/* OAB Focus SUPER v17
   - Leitor redesenhado para leitura longa (menos cards, melhor hierarquia, largura e navegação)
   - Grifagem refeita com snapshot persistente da seleção antes do clique
   - Compatível com grifos antigos e com abertura pelo Estudar / Prepare-se / Mais cobrados
   - Limpeza editorial apenas de referências visuais órfãs; conteúdo jurídico preservado
*/
(() => {
  'use strict';
  const VERSION='17.0';
  const state={selection:null,key:'',payload:null,scrollHandler:null,palette:null,dock:null};
  const clean=(s='')=>String(s).replace(/^\d+(?:\.\d+){0,4}[\.)]?\s+/,'').replace(/\s+/g,' ').trim();
  const clamp17=(n,a,b)=>Math.max(a,Math.min(b,n));

  function installStyles(){
    if(document.getElementById('v17Styles'))return;
    const el=document.createElement('style');el.id='v17Styles';el.textContent=`
      body.v17-reader-active{--v17-paper:#fff;--v17-ink:#172235;--v17-muted:#6f7b8a;--v17-line:#e4e9ef;--v17-soft:#f7f9fb;--v17-accent:#1d5fc2;--v17-reading:18px;--v17-leading:1.78}
      body.v17-reader-active .content{max-width:none;padding-top:18px;background:var(--v17-paper)}
      .v17-reader .reader-top,.v17-reader .reader-context,.v17-reader .subtopic-reader-hero,.v17-reader .reader-tools,.v17-reader .v16-reader-command,.v17-reader .v15-floating-highlighter{display:none!important}
      #v16SelectionTools{display:none!important}
      .v17-reader{max-width:none!important;margin:0!important}
      .v17-progressline{position:fixed;left:var(--sidebar);right:0;top:78px;height:2px;background:transparent;z-index:72;pointer-events:none}.v17-progressline i{display:block;height:100%;width:0;background:var(--v17-accent);transition:width .12s linear}
      .v17-reader-chrome{position:sticky;top:78px;z-index:65;display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:54px;margin:-18px -10px 26px;padding:8px 10px;background:rgba(255,255,255,.94);backdrop-filter:blur(18px);border-bottom:1px solid rgba(225,230,236,.9)}
      .v17-reader-chrome .left,.v17-reader-chrome .right{display:flex;align-items:center;gap:6px;min-width:0}.v17-reader-chrome .crumb{font-size:.72rem;color:#738095;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:min(48vw,620px)}
      .v17-iconbtn{height:36px;min-width:36px;padding:0 10px;border:1px solid transparent;border-radius:9px;background:transparent;color:#425168;font:inherit;font-size:.74rem;font-weight:780;cursor:pointer}.v17-iconbtn:hover{background:#f3f6f9;border-color:#e1e6ec;color:#172235}.v17-iconbtn.primary{background:#172235;color:#fff}.v17-iconbtn.primary:hover{background:#26364b}
      .v17-reader-searchbar{display:none;max-width:760px;margin:-14px auto 24px}.v17-reader-searchbar.open{display:flex}.v17-reader-searchbar input{width:100%;height:44px;border:1px solid #d7dee7;border-radius:11px;padding:0 14px;background:#fff;font:inherit;color:#172235;outline:none;box-shadow:0 8px 22px rgba(31,48,68,.06)}.v17-reader-searchbar input:focus{border-color:#87a9d8;box-shadow:0 0 0 4px rgba(40,104,188,.09)}
      .v17-reader .reader-header.pro{max-width:760px!important;margin:0 auto 36px!important;padding:14px 0 6px!important;border:0!important;background:transparent!important}.v17-reader .reader-header.pro .eyebrow{display:inline-flex;align-items:center;gap:8px;color:#53637a;font-size:.65rem;letter-spacing:.12em}.v17-reader .reader-header.pro h1{margin:10px 0 12px!important;font-size:clamp(2.15rem,3.8vw,3.4rem)!important;line-height:1.04!important;letter-spacing:-.042em!important;color:var(--v17-ink)!important;font-weight:780}.v17-reader .reader-header.pro>p{max-width:66ch!important;margin:0 0 15px!important;color:#657286!important;font-size:.94rem!important;line-height:1.65!important}.v17-reader .reader-meta{display:flex;gap:7px;flex-wrap:wrap}.v17-reader .reader-meta span{border:0!important;background:#f3f6f8!important;color:#5c697b!important;border-radius:999px!important;padding:6px 9px!important;font-size:.68rem!important;font-weight:740!important}
      .v17-reader .v16-reader-grid{display:grid!important;grid-template-columns:minmax(180px,220px) minmax(0,760px) minmax(150px,184px)!important;justify-content:center!important;gap:42px!important;max-width:1360px!important;margin:0 auto!important;align-items:start!important}
      .v17-reader .v16-reader-toc{position:sticky!important;top:150px!important;max-height:calc(100vh - 175px)!important;overflow:auto!important;padding:6px 14px 12px 0!important;border:0!important;border-right:1px solid var(--v17-line)!important;background:transparent!important}.v17-reader .v16-reader-toc .toc-label{margin:0 8px 12px!important;color:#8a94a1!important;font-size:.58rem!important;letter-spacing:.15em!important}.v17-reader .v16-toc-link{position:relative;padding:7px 9px 7px 13px!important;margin:1px 0!important;border-radius:6px!important;color:#687689!important;font-size:.71rem!important;line-height:1.42!important}.v17-reader .v16-toc-link:before{content:"";position:absolute;left:0;top:8px;bottom:8px;width:2px;border-radius:2px;background:transparent}.v17-reader .v16-toc-link.active{background:transparent!important;color:#183f75!important;font-weight:850!important}.v17-reader .v16-toc-link.active:before{background:#2c6fc5}.v17-reader .v16-toc-link.level-section{color:#33445a!important;font-weight:820!important;margin-top:7px!important}.v17-reader .v16-toc-link.level-sub{padding-left:21px!important}
      .v17-reader .v16-reader-status{position:sticky!important;top:150px!important;max-height:calc(100vh - 175px)!important;overflow:auto!important;padding:5px 0 0 16px!important;border:0!important;border-left:1px solid var(--v17-line)!important}.v17-reader .v16-reader-status .toc-label{margin:0 0 12px!important;color:#8a94a1!important;font-size:.58rem!important;letter-spacing:.15em!important}.v17-reader .v16-status-card{background:transparent!important;border:0!important;border-radius:0!important;padding:0 0 14px!important;margin:0 0 14px!important;border-bottom:1px solid var(--v17-line)!important}.v17-reader .v16-status-card small{font-size:.66rem!important;color:#7d8997!important}.v17-reader .v16-status-card strong{font-size:1.08rem!important;color:#25364d!important}.v17-reader .v16-status-progress{height:4px!important;background:#edf0f4!important}
      .v17-reader #readerArticle{min-width:0!important;margin:0!important}.v17-reader .study-zone{max-width:none!important;margin:0 0 52px!important;padding:0!important;background:transparent!important;border:0!important;box-shadow:none!important}.v17-reader .study-zone-head{display:flex!important;align-items:end!important;justify-content:space-between!important;gap:18px!important;margin:0 0 24px!important;padding:0 0 12px!important;border-bottom:1px solid var(--v17-line)!important}.v17-reader .study-zone-head .zone-kicker{font-size:.58rem!important;letter-spacing:.15em!important;color:#8a94a1!important}.v17-reader .study-zone-head h2{font-size:1.18rem!important;letter-spacing:-.015em!important;margin:3px 0 0!important;color:#26364a!important}.v17-reader .study-zone-head p{margin:5px 0 0!important;color:#7c8795!important;font-size:.75rem!important;line-height:1.45!important}.v17-reader .study-zone-head .btn{flex:0 0 auto}
      .v17-reader .primary-material{max-width:760px!important}.v17-reader .integral-section{margin:0 0 42px!important;padding:0!important;background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important}.v17-reader .integral-section-head{display:block!important;margin:0 0 18px!important;padding:0 0 10px!important;border:0!important;border-bottom:1px solid #edf0f3!important}.v17-reader .integral-section-head>div{min-width:0}.v17-reader .integral-kind{display:block!important;margin:0 0 6px!important;color:#8a95a3!important;font-size:.56rem!important;letter-spacing:.14em!important;font-weight:850!important}.v17-reader .integral-section-head h2{font-size:1.34rem!important;line-height:1.25!important;letter-spacing:-.018em!important;color:#1e2d41!important;font-weight:780!important}.v17-reader .collapse-material{display:none!important}
      .v17-reader .integral-body{padding:0!important;background:transparent!important;color:#26364b!important;font-size:calc(var(--v17-reading) * var(--v16-font-scale,1))!important;line-height:var(--v17-leading)!important;letter-spacing:.002em!important}.v17-reader .integral-body p{max-width:68ch!important;margin:0 0 1.28em!important;text-wrap:pretty}.v17-reader .integral-body h3{scroll-margin-top:150px!important;margin:2.35em 0 .8em!important;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif!important;font-size:1.02em!important;line-height:1.35!important;letter-spacing:-.008em!important;color:#172a42!important;font-weight:820!important}.v17-reader .integral-bullet{margin:.65em 0 .65em 1.05em!important;line-height:1.7!important}.v17-reader .v16-law-line{margin:1.1em 0!important;padding:11px 15px!important;border-left:3px solid #c59e52!important;background:#fbf8f1!important;border-radius:0 7px 7px 0!important;color:#2d3745!important;font-family:Georgia,"Times New Roman",serif!important}.v17-reader .v16-inline-alert{margin:1.9em 0 .55em!important;font-family:Inter,ui-sans-serif,system-ui,sans-serif!important;font-size:.69em!important;letter-spacing:.11em!important;color:#7f5e21!important}.v17-reader .v16-compare-row{border-radius:8px!important;border-color:#e2e6eb!important;box-shadow:none!important}.v17-reader .v16-compare-row span{background:#fafbfc!important;padding:11px 13px!important;border-color:#e5e9ee!important;font-family:Inter,ui-sans-serif,system-ui,sans-serif!important;font-size:.78em!important}
      .v17-reader .reference-accordion{border:1px solid #e1e6ec!important;border-radius:10px!important;background:#fbfcfd!important;overflow:hidden}.v17-reader .reference-accordion summary{padding:14px 16px!important;font-size:.79rem!important}.v17-reader .reference-inner{padding:18px!important}.v17-reader .reference-inner .integral-body{font-size:16.5px!important;line-height:1.7!important}
      .v17-reader .v16-reader-end{max-width:760px!important;margin:60px auto 20px!important;padding-top:26px!important;border-top:1px solid var(--v17-line)!important}.v17-reader .v16-reader-end-card{background:transparent!important;border:0!important;border-radius:0!important;padding:0!important}.v17-reader .v16-reader-end-card h3{font-size:1.25rem!important}.v17-reader .v16-prevnext{gap:10px!important}.v17-reader .v16-prevnext button{border-radius:10px!important;background:#fafbfd!important;border-color:#e1e6ec!important}
      .v17-selection-palette{position:fixed;z-index:160;display:none;align-items:center;gap:6px;padding:7px;background:#172235;border:1px solid rgba(255,255,255,.08);border-radius:12px;box-shadow:0 16px 34px rgba(18,31,48,.28);transform:translate(-50%,-115%)}.v17-selection-palette.visible{display:flex}.v17-selection-palette button,.v17-highlight-dock .v17-color{width:28px;height:28px;border-radius:50%;border:2px solid rgba(255,255,255,.88);cursor:pointer}.v17-color.yellow{background:#ffe47b}.v17-color.green{background:#bce8c8}.v17-color.blue{background:#c5e0ff}.v17-selection-palette .close{border:0!important;background:transparent!important;color:#fff!important;width:28px!important;height:28px!important;font-size:1rem!important}
      .v17-highlight-dock{position:fixed;z-index:88;right:18px;bottom:22px;display:flex;align-items:center;gap:7px;padding:8px 10px;background:rgba(255,255,255,.96);backdrop-filter:blur(16px);border:1px solid #dfe5eb;border-radius:15px;box-shadow:0 14px 34px rgba(27,43,64,.14)}.v17-highlight-dock .label{display:flex;flex-direction:column;margin-right:2px;line-height:1.1}.v17-highlight-dock .label b{font-size:.67rem;color:#26364b}.v17-highlight-dock .label small{margin-top:3px;font-size:.56rem;color:#8a95a3}.v17-highlight-dock .tool{height:30px;padding:0 8px;border:0;background:transparent;color:#536177;font-size:.67rem;font-weight:800;cursor:pointer;border-radius:8px}.v17-highlight-dock .tool:hover{background:#f1f4f7}.v17-highlight-dock .count{min-width:18px;height:18px;padding:0 5px;display:inline-grid;place-items:center;border-radius:999px;background:#eef3f9;color:#345777;font-size:.58rem;font-weight:900}
      .v17-reader mark.oab-highlight{padding:0!important;border-radius:2px!important;color:inherit!important;box-decoration-break:clone;-webkit-box-decoration-break:clone;cursor:pointer}.v17-reader mark.oab-highlight.yellow{background:linear-gradient(transparent 10%,#ffe58b 10%,#ffe58b 91%,transparent 91%)!important}.v17-reader mark.oab-highlight.green{background:linear-gradient(transparent 10%,#c2eacb 10%,#c2eacb 91%,transparent 91%)!important}.v17-reader mark.oab-highlight.blue{background:linear-gradient(transparent 10%,#c9e3ff 10%,#c9e3ff 91%,transparent 91%)!important}
      .v17-empty-ref{display:none!important}
      .v16-reader-dark.v17-reader-active{--v17-paper:#18212c;--v17-ink:#edf2f7;--v17-muted:#aeb8c5;--v17-line:#34404e;--v17-soft:#202b37;--v17-accent:#7fb4ff}.v16-reader-dark.v17-reader-active .content{background:#18212c!important}.v16-reader-dark .v17-reader-chrome{background:rgba(24,33,44,.95);border-color:#34404e}.v16-reader-dark .v17-iconbtn{color:#c7d1dc}.v16-reader-dark .v17-iconbtn:hover{background:#263240;border-color:#3b4858;color:#fff}.v16-reader-dark .v17-reader .reader-header.pro h1,.v16-reader-dark .v17-reader .integral-section-head h2,.v16-reader-dark .v17-reader .integral-body,.v16-reader-dark .v17-reader .integral-body h3{color:#e8eef5!important}.v16-reader-dark .v17-reader .reader-header.pro>p,.v16-reader-dark .v17-reader .study-zone-head p{color:#aeb9c6!important}.v16-reader-dark .v17-reader .reader-meta span{background:#232f3c!important;color:#b8c4d0!important}.v16-reader-dark .v17-reader .integral-section-head,.v16-reader-dark .v17-reader .study-zone-head{border-color:#34404e!important}.v16-reader-dark .v17-reader .v16-law-line{background:#2c2a23!important;color:#e9dfc9!important}.v16-reader-dark .v17-highlight-dock{background:rgba(29,39,51,.96);border-color:#43505f}.v16-reader-dark .v17-highlight-dock .label b,.v16-reader-dark .v17-highlight-dock .tool{color:#dce4ed}.v16-reader-dark .v17-reader .reference-accordion{background:#202a35!important;border-color:#3b4755!important}
      .v17-focus .sidebar,.v17-focus .topbar,.v17-focus .bottom-nav{display:none!important}.v17-focus .main-area{margin-left:0!important}.v17-focus .v17-progressline{left:0;top:0}.v17-focus .v17-reader-chrome{top:0}.v17-focus .v17-reader .v16-reader-toc,.v17-focus .v17-reader .v16-reader-status{top:72px!important}.v17-focus .content{padding-top:0!important}
      @media(max-width:1180px){.v17-reader .v16-reader-grid{grid-template-columns:minmax(170px,205px) minmax(0,740px)!important;gap:34px!important}.v17-reader .v16-reader-status{display:none!important}}
      @media(max-width:900px){body.v17-reader-active .content{padding:12px 15px 96px!important}.v17-progressline{left:0;top:66px}.v17-reader-chrome{top:66px;margin:-12px -7px 22px;padding:7px 4px;min-height:50px}.v17-reader-chrome .crumb{display:none}.v17-reader-chrome .right{overflow-x:auto;scrollbar-width:none;max-width:72vw}.v17-reader-chrome .right::-webkit-scrollbar{display:none}.v17-reader .reader-header.pro{padding:8px 2px 0!important;margin-bottom:28px!important}.v17-reader .reader-header.pro h1{font-size:2.15rem!important}.v17-reader .v16-reader-grid{display:block!important}.v17-reader .v16-reader-toc,.v17-reader .v16-reader-status{display:none!important}.v17-reader .integral-body{font-size:17.5px!important;line-height:1.74!important}.v17-reader .integral-section{margin-bottom:34px!important}.v17-reader .study-zone{margin-bottom:42px!important}.v17-reader .study-zone-head{align-items:flex-start!important}.v17-highlight-dock{left:10px;right:10px;bottom:78px;justify-content:center;padding:8px}.v17-highlight-dock .label{margin-right:auto}.v17-selection-palette{transform:translate(-50%,-120%)}.v17-focus .v17-reader-chrome{top:0}.v17-focus .v17-progressline{top:0}}
      @media(max-width:520px){.v17-reader-chrome .right .v17-hide-small{display:none}.v17-reader .reader-header.pro h1{font-size:1.92rem!important}.v17-reader .reader-header.pro>p{font-size:.88rem!important}.v17-reader .integral-body{font-size:17px!important}.v17-reader .integral-section-head h2{font-size:1.2rem!important}.v17-reader .study-zone-head{display:block!important}.v17-reader .study-zone-head .btn{width:100%;margin-top:12px}.v17-highlight-dock .label small{display:none}.v17-highlight-dock .tool{padding:0 5px}.v17-highlight-dock .v17-color{width:27px;height:27px}}
    `;document.head.appendChild(el);
  }

  function readerContext(payload){
    const d=findDiscipline(payload?.discipline);if(!d)return null;
    const full=payload?.topicId==='__integral__'||payload?.topicId===`${d.id}-integral`;
    const unit=full?{id:`${d.id}-integral`,title:'Disciplina completa',mode:'integral'}:resolveStudyUnit(d.name,payload?.topicId);
    if(!unit)return null;
    const subtopic=String(payload?.subtopicTitle||'').trim();
    const chapter=unit.chapter||disciplineChapters(d.name).find(c=>c.id===unit.id)||null;
    const key=subtopic?readerKey(d.name,`${unit.id}::${slug(subtopic)}`):readerKey(d.name,unit.id);
    return {d,unit,chapter,subtopic,key,full};
  }

  function textOffset(body,node,offset){
    const r=document.createRange();r.selectNodeContents(body);try{r.setEnd(node,offset);}catch{return null;}return r.toString().length;
  }
  function validSelectionSnapshot(){
    if(route!=='reader')return null;
    const sel=window.getSelection();if(!sel||sel.rangeCount!==1||sel.isCollapsed)return null;
    const range=sel.getRangeAt(0);const startEl=range.startContainer.nodeType===3?range.startContainer.parentElement:range.startContainer;const endEl=range.endContainer.nodeType===3?range.endContainer.parentElement:range.endContainer;
    const body=startEl?.closest?.('.primary-material .integral-body');if(!body||body!==endEl?.closest?.('.primary-material .integral-body'))return null;
    const quote=sel.toString();if(!quote||!quote.trim())return null;
    const start=textOffset(body,range.startContainer,range.startOffset);if(start==null)return null;const txt=body.textContent||'',end=start+quote.length;
    const block=startEl?.closest?.('[data-read-block]');
    return {key:state.key,sectionKey:body.closest('.integral-section')?.dataset.sectionKey||'',start,end,quote,prefix:txt.slice(Math.max(0,start-64),start),suffix:txt.slice(end,end+64),blockIndex:block?.dataset?.readBlock||'',capturedAt:Date.now(),rect:(()=>{const x=range.getBoundingClientRect();return {left:x.left,top:x.top,width:x.width,height:x.height};})()};
  }
  function captureSelection(){
    const snap=validSelectionSnapshot();if(!snap)return false;state.selection=snap;showPalette(snap.rect);return true;
  }
  function showPalette(rect){
    if(!state.palette||!rect||!rect.width)return;state.palette.style.left=`${clamp17(rect.left+rect.width/2,76,innerWidth-76)}px`;state.palette.style.top=`${Math.max(76,rect.top-7)}px`;state.palette.classList.add('visible');
  }
  function hidePalette(){state.palette?.classList.remove('visible');}

  function locate(body,h){
    const txt=body.textContent||'',quote=String(h.quote||'');
    if(quote){let pos=-1,best=-1,bestScore=Infinity,from=0,count=0;while((pos=txt.indexOf(quote,from))>=0&&count<80){let score=Math.abs(pos-(Number(h.start)||0));if(h.prefix&&!txt.slice(Math.max(0,pos-h.prefix.length),pos).endsWith(h.prefix))score+=300;if(h.suffix&&!txt.slice(pos+quote.length,pos+quote.length+h.suffix.length).startsWith(h.suffix))score+=300;if(score<bestScore){best=pos;bestScore=score;}from=pos+Math.max(1,quote.length);count++;}if(best>=0)return {start:best,end:best+quote.length};}
    const a=Number(h.start),b=Number(h.end);if(Number.isFinite(a)&&Number.isFinite(b)&&b>a&&a<txt.length)return {start:Math.max(0,a),end:Math.min(txt.length,b)};return null;
  }
  function wrapSegments(body,start,end,h){
    if(!(end>start))return false;const walker=document.createTreeWalker(body,NodeFilter.SHOW_TEXT);let n,pos=0,parts=[];
    while(n=walker.nextNode()){const len=n.nodeValue.length,ns=pos,ne=pos+len;if(end>ns&&start<ne)parts.push({node:n,a:Math.max(0,start-ns),b:Math.min(len,end-ns)});pos=ne;if(pos>=end)break;}
    if(!parts.length)return false;
    for(let i=parts.length-1;i>=0;i--){const p=parts[i],node=p.node;if(!node.parentNode)continue;const after=node.splitText(p.b),mid=node.splitText(p.a),mark=document.createElement('mark');mark.className=`oab-highlight ${h.color||'yellow'}`;mark.dataset.highlightId=h.id;mark.dataset.v17='1';mark.title='Clique para remover este grifo';mark.appendChild(mid);after.parentNode.insertBefore(mark,after);}
    return true;
  }
  function unwrapAll(root){root.querySelectorAll('mark.oab-highlight').forEach(m=>m.replaceWith(document.createTextNode(m.textContent||'')));root.normalize?.();}
  function highlights(){progress.highlights=progress.highlights||{};progress.highlights[state.key]=progress.highlights[state.key]||[];return progress.highlights[state.key];}
  function updateCount(){const n=highlights().length;document.querySelectorAll('#highlightCount,#v17HighlightCount').forEach(el=>el.textContent=String(n));}
  function persistNow(){markDirty();try{const p=saveProgress?.(true);if(p?.catch)p.catch(()=>{});}catch{}}

  function renderHighlights(){
    const root=document.querySelector('.primary-material');if(!root||!state.key)return;unwrapAll(root);
    const items=[...highlights()].sort((a,b)=>(b.start||0)-(a.start||0));
    for(const h of items){const section=[...root.querySelectorAll('.integral-section[data-section-key]')].find(x=>x.dataset.sectionKey===h.sectionKey);const body=section?.querySelector('.integral-body');if(!body)continue;const at=locate(body,h);if(!at)continue;h.start=at.start;h.end=at.end;wrapSegments(body,at.start,at.end,h);}
    root.querySelectorAll('mark.oab-highlight').forEach(m=>{m.addEventListener('click',e=>{e.stopPropagation();const id=m.dataset.highlightId;if(window.getSelection()?.toString())return;if(!confirm('Remover este grifo?'))return;progress.highlights[state.key]=highlights().filter(h=>h.id!==id);persistNow();renderHighlights();updateCount();});});updateCount();
  }

  function addHighlight(color){
    if(!state.selection||state.selection.key!==state.key)captureSelection();const s=state.selection;if(!s||s.key!==state.key){toast('Selecione um trecho do material. A paleta de cores aparecerá ao lado da seleção.','bad');return;}
    const root=document.querySelector('.primary-material'),section=[...root?.querySelectorAll('.integral-section[data-section-key]')||[]].find(x=>x.dataset.sectionKey===s.sectionKey),body=section?.querySelector('.integral-body');if(!body){toast('Não consegui localizar novamente o trecho selecionado. Selecione-o outra vez.','bad');return;}
    const current=highlights(),same=current.find(h=>h.sectionKey===s.sectionKey&&h.start===s.start&&h.end===s.end);if(same){same.color=color;same.quote=s.quote;same.prefix=s.prefix;same.suffix=s.suffix;same.updatedAt=Date.now();}
    else{progress.highlights[state.key]=current.filter(h=>!(h.sectionKey===s.sectionKey&&Math.max(Number(h.start)||0,s.start)<Math.min(Number(h.end)||0,s.end)));progress.highlights[state.key].push({id:`h17-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,sectionKey:s.sectionKey,start:s.start,end:s.end,quote:s.quote,prefix:s.prefix,suffix:s.suffix,blockIndex:s.blockIndex,color,createdAt:Date.now(),anchorVersion:17});}
    state.selection=null;hidePalette();window.getSelection()?.removeAllRanges();persistNow();renderHighlights();toast(same?'Cor do grifo atualizada.':'Trecho grifado e salvo.','good');
  }

  function openHighlights(){
    const items=highlights();openModal(`<div class="modal-head"><h3>Meus grifos</h3><button class="icon-btn" data-close>×</button></div>${items.length?`<div style="display:grid;gap:8px">${items.map((h,i)=>`<button class="search-result search-result-btn" data-v17-jump="${esc(h.id)}"><small>${esc((h.color||'grifo').toUpperCase())}</small><b>Trecho ${i+1}</b><span>${esc((h.quote||'').slice(0,190))}${(h.quote||'').length>190?'…':''}</span></button>`).join('')}</div>`:'<div class="empty"><p>Você ainda não grifou esta unidade.</p></div>'}`);document.querySelectorAll('[data-v17-jump]').forEach(b=>b.onclick=()=>{const id=b.dataset.v17Jump;closeModal();setTimeout(()=>document.querySelector(`mark[data-highlight-id="${CSS.escape(id)}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}),50);});
  }

  function cleanOrphanVisualReferences(){
    const root=document.querySelector('.primary-material');if(!root)return;const exact=/^(?:tabela|quadro|figura|imagem|esquema|mapa mental)(?:\s+(?:abaixo|acima|a seguir|para não confundir))?[\s:.-]*$/i;const directive=/^(?:veja|observe|vide|confira)\s+(?:a|o)?\s*(?:tabela|quadro|figura|imagem|esquema|mapa mental)\s*(?:abaixo|acima|a seguir)?[\s.!:;-]*$/i;
    root.querySelectorAll('h2,h3,p,.integral-bullet').forEach(el=>{const t=(el.textContent||'').replace(/\s+/g,' ').trim();if(exact.test(t)||directive.test(t)){el.classList.add('v17-empty-ref');el.setAttribute('aria-hidden','true');}});
  }

  function makePalette(){
    state.palette=document.createElement('div');state.palette.className='v17-selection-palette';state.palette.innerHTML=`<button class="v17-color yellow" data-v17-color="yellow" aria-label="Grifar amarelo"></button><button class="v17-color green" data-v17-color="green" aria-label="Grifar verde"></button><button class="v17-color blue" data-v17-color="blue" aria-label="Grifar azul"></button><button class="close" id="v17PaletteClose" aria-label="Fechar">×</button>`;document.body.appendChild(state.palette);state.palette.querySelectorAll('[data-v17-color]').forEach(b=>{b.addEventListener('pointerdown',e=>e.preventDefault());b.addEventListener('mousedown',e=>e.preventDefault());b.onclick=e=>{e.preventDefault();addHighlight(b.dataset.v17Color);};});state.palette.querySelector('#v17PaletteClose').onclick=()=>{hidePalette();state.selection=null;window.getSelection()?.removeAllRanges();};
  }
  function makeDock(){
    state.dock=document.createElement('div');state.dock.className='v17-highlight-dock';state.dock.innerHTML=`<span class="label"><b>GRIFAR</b><small>selecione o texto</small></span><button class="v17-color yellow" data-v17-dock="yellow" aria-label="Grifar amarelo"></button><button class="v17-color green" data-v17-dock="green" aria-label="Grifar verde"></button><button class="v17-color blue" data-v17-dock="blue" aria-label="Grifar azul"></button><button class="tool" id="v17OpenHighlights">Grifos <span class="count" id="v17HighlightCount">0</span></button>`;document.body.appendChild(state.dock);state.dock.querySelectorAll('[data-v17-dock]').forEach(b=>{b.addEventListener('pointerdown',e=>e.preventDefault());b.addEventListener('mousedown',e=>e.preventDefault());b.onclick=e=>{e.preventDefault();addHighlight(b.dataset.v17Dock);};});state.dock.querySelector('#v17OpenHighlights').onclick=openHighlights;
  }

  function updateReadingProgress(){
    if(route!=='reader')return;const article=document.getElementById('readerArticle');if(!article)return;const top=article.getBoundingClientRect().top+scrollY,total=Math.max(1,article.scrollHeight-innerHeight*.45),read=scrollY+innerHeight*.23-top,pct=Math.round(clamp17(read/total*100,0,100));document.querySelector('.v17-progressline i')?.style.setProperty('width',`${pct}%`);const old=document.getElementById('v16ReadPct');if(old)old.textContent=`${pct}%`;const oldBar=document.getElementById('v16SideProgress');if(oldBar)oldBar.style.width=`${pct}%`;
  }

  function buildChrome(ctx){
    const shell=document.querySelector('.reader-shell');if(!shell)return;
    shell.classList.add('v17-reader');document.body.classList.add('v17-reader-active');
    const old=shell.querySelector('.v17-reader-chrome');old?.remove();shell.querySelector('.v17-reader-searchbar')?.remove();document.querySelectorAll('.v17-progressline').forEach(x=>x.remove());
    const crumb=[ctx.d.name,ctx.chapter?clean(ctx.chapter.title):'',ctx.subtopic?clean(ctx.subtopic):''].filter(Boolean).join(' › ');
    const chrome=document.createElement('div');chrome.className='v17-reader-chrome';chrome.innerHTML=`<div class="left"><button class="v17-iconbtn primary" id="v17Back">← Voltar</button><span class="crumb">${esc(crumb)}</span></div><div class="right"><button class="v17-iconbtn" id="v17Search">Buscar</button><button class="v17-iconbtn" id="v17Index">Índice</button><button class="v17-iconbtn v17-hide-small" id="v17Notes">Anotar</button><button class="v17-iconbtn v17-hide-small" id="v17Marks">Grifos</button><button class="v17-iconbtn" id="v17FontDown">A−</button><button class="v17-iconbtn" id="v17FontUp">A+</button><button class="v17-iconbtn" id="v17Dark" title="Leitura noturna">◐</button><button class="v17-iconbtn" id="v17Focus">Foco</button></div>`;
    const search=document.createElement('div');search.className='v17-reader-searchbar';search.innerHTML='<input id="v17SearchInput" placeholder="Buscar palavra, expressão, artigo ou conceito nesta leitura…" autocomplete="off">';
    const progressLine=document.createElement('div');progressLine.className='v17-progressline';progressLine.innerHTML='<i></i>';
    shell.insertBefore(chrome,shell.firstChild);chrome.after(search);document.body.appendChild(progressLine);
    chrome.querySelector('#v17Back').onclick=()=>safeRoute('study',{discipline:ctx.d.name});
    chrome.querySelector('#v17Search').onclick=()=>{search.classList.toggle('open');if(search.classList.contains('open'))setTimeout(()=>search.querySelector('input')?.focus(),10);};
    chrome.querySelector('#v17Index').onclick=()=>{const b=document.getElementById('v16IndexBtn');if(b)b.click();else document.querySelector('.v16-reader-toc')?.scrollIntoView({behavior:'smooth',block:'nearest'});};
    chrome.querySelector('#v17Notes').onclick=()=>document.getElementById('v16NoteBtn')?.click();chrome.querySelector('#v17Marks').onclick=openHighlights;chrome.querySelector('#v17FontDown').onclick=()=>document.getElementById('v16FontDown')?.click();chrome.querySelector('#v17FontUp').onclick=()=>document.getElementById('v16FontUp')?.click();chrome.querySelector('#v17Dark').onclick=()=>document.getElementById('v16DarkBtn')?.click();chrome.querySelector('#v17Focus').onclick=()=>{document.body.classList.toggle('v17-focus');};
    search.querySelector('input').addEventListener('input',e=>{const hidden=document.getElementById('readerSearch');if(!hidden)return;hidden.value=e.target.value;hidden.dispatchEvent(new Event('input',{bubbles:true}));});
    updateReadingProgress();
  }

  function enhance(payload){
    const ctx=readerContext(payload);if(!ctx)return;state.payload=payload;state.key=ctx.key;state.selection=null;buildChrome(ctx);cleanOrphanVisualReferences();
    document.getElementById('v16SelectionTools')?.classList.remove('visible');document.querySelector('.v15-floating-highlighter')?.remove();
    if(!state.palette)makePalette();if(!state.dock)makeDock();state.dock.style.display='flex';state.palette.style.display='';
    renderHighlights();updateCount();
    if(state.scrollHandler)window.removeEventListener('scroll',state.scrollHandler);state.scrollHandler=()=>updateReadingProgress();window.addEventListener('scroll',state.scrollHandler,{passive:true});
  }

  // Substitui as rotinas antigas: seleção recolhida nunca apaga o último snapshot válido.
  captureReaderSelection=function(){return captureSelection();};
  addReaderHighlight=function(key,color){if(key&&key!==state.key)state.key=key;addHighlight(color);};
  applyReaderHighlights=function(key){if(key)state.key=key;renderHighlights();};

  document.addEventListener('selectionchange',()=>{if(route==='reader'){const sel=window.getSelection();if(sel&&!sel.isCollapsed)captureSelection();}});
  document.addEventListener('mouseup',()=>{if(route==='reader')setTimeout(captureSelection,0);});
  document.addEventListener('keyup',e=>{if(route==='reader'&&(e.key==='Shift'||e.shiftKey))setTimeout(captureSelection,0);});
  document.addEventListener('touchend',()=>{if(route==='reader')setTimeout(captureSelection,120);},{passive:true});
  document.addEventListener('pointerdown',e=>{if(route==='reader'&&!e.target.closest('.v17-selection-palette,.v17-highlight-dock,.primary-material'))hidePalette();});

  const baseRenderReader=renderReader;
  renderReader=function(payload){baseRenderReader(payload);requestAnimationFrame(()=>requestAnimationFrame(()=>enhance(payload)));};
  const baseRenderRoute=renderRoute;
  renderRoute=function(){if(route!=='reader'){document.body.classList.remove('v17-reader-active','v17-focus');document.querySelectorAll('.v17-progressline').forEach(x=>x.remove());if(state.dock)state.dock.style.display='none';hidePalette();state.selection=null;if(state.scrollHandler){window.removeEventListener('scroll',state.scrollHandler);state.scrollHandler=null;}}return baseRenderRoute();};

  installStyles();
  document.documentElement.dataset.oabVersion=VERSION;
  console.info('OAB Focus SUPER v17 ativo');
})();
