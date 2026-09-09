(function(){
  'use strict';
  const VERSION='35.11';
  const W=typeof window!=='undefined'?window:globalThis;
  const escHtml=s=>typeof W.esc==='function'?W.esc(String(s)):String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const escAttr=s=>escHtml(s).replace(/`/g,'&#96;');
  const slugText=s=>typeof W.slug==='function'?W.slug(String(s)):String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const noiseHeading=s=>typeof W.isNoiseSubheading==='function'?!!W.isNoiseSubheading(s):false;
  const bulletRe=/^(?:●|•|→|✓|✔|▪|–|—|−|-\s)/;
  const lawRe=/^(?:Art\.?\s*\d|§\s*\d|Parágrafo único|Súmula|SÚMULA|Tema\s+\d|Inciso\s+[IVXLC]+)/i;
  const alertRe=/^(?:ATENÇÃO|IMPORTANTE|CUIDADO|PEGADINHA|NÃO ESQUECER|PARA LEMBRAR)\b/i;
  const connectorEndRe=/(?:\bque|\bde|\bdo|\bda|\bdos|\bdas|\be|\bou|\bcom|\bpor|\bpara|\bem|\bno|\bna|\bnos|\bnas|\bse|\bdesde|\bmediante|\bquando|\bcomo|\bsem|\bentre|\bsob|\bsobre|\baté)$/i;

  function normalizePiece(s=''){
    return String(s).replace(/\u00a0/g,' ').replace(/[ \t]{2,}/g,' ').replace(/\s+/g,' ').trim();
  }
  function isUpperHeading(line=''){
    const s=normalizePiece(line);
    return s.length>1&&s.length<=125&&s===s.toUpperCase()&&/[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(s);
  }
  function isNumberedHeading(line=''){
    const s=normalizePiece(line);
    return /^\d+(?:\.\d+){0,4}[\.)]?\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(s)&&s.length<=150;
  }
  function isHeading(line=''){
    const s=normalizePiece(line);
    return (isUpperHeading(s)||isNumberedHeading(s))&&!noiseHeading(s);
  }
  function isAlert(line=''){
    const s=normalizePiece(line);
    const labelOnly=/^(?:ATENÇÃO|IMPORTANTE|CUIDADO|PEGADINHA|NÃO ESQUECER|PARA LEMBRAR)\s*[!:]?$/i.test(s);
    return labelOnly||((isUpperHeading(s)||isNumberedHeading(s))&&noiseHeading(s));
  }
  function terminal(s=''){
    const x=normalizePiece(s).replace(/\*[^*]{0,80}\*$/,'').trim();
    return /[.!?;:)](?:[”"']?)$/.test(x);
  }
  function startsLower(s=''){
    return /^[a-záéíóúâêôãõçàü]/.test(normalizePiece(s));
  }
  function nextNonBlank(lines,from){
    for(let i=from;i<lines.length;i++)if(String(lines[i]).trim())return {i,line:String(lines[i])};
    return null;
  }
  function softBlankContinuation(current,next,kind){
    if(!current||!next)return false;
    const cur=normalizePiece(current),nxt=normalizePiece(next);
    if(!cur||!nxt)return false;
    if(isHeading(nxt)||isAlert(nxt)||bulletRe.test(nxt)||lawRe.test(nxt))return false;
    if(kind==='bullet'||kind==='law')return !terminal(cur)||startsLower(nxt)||connectorEndRe.test(cur);
    return (!terminal(cur)&&(startsLower(nxt)||connectorEndRe.test(cur)))||connectorEndRe.test(cur);
  }
  function splitColumns(raw=''){
    const s=String(raw).replace(/\t/g,'    ');
    const out=[];let start=0;
    const gaps=[...s.matchAll(/ {3,}/g)];
    if(!gaps.length)return out;
    for(const g of gaps){
      const part=s.slice(start,g.index).trim();
      if(part)out.push({text:normalizePiece(part),start:start+(s.slice(start,g.index).search(/\S/)>=0?s.slice(start,g.index).search(/\S/):0)});
      start=g.index+g[0].length;
    }
    const tail=s.slice(start).trim();
    if(tail)out.push({text:normalizePiece(tail),start:start+(s.slice(start).search(/\S/)>=0?s.slice(start).search(/\S/):0)});
    return out.length>=2?out:[];
  }
  function nearestColumn(starts,pos){
    let best=0,dist=Infinity;for(let i=0;i<starts.length;i++){const d=Math.abs(starts[i]-pos);if(d<dist){dist=d;best=i;}}return best;
  }
  function isTableHeaderCandidate(lines,i,contextHeading=''){
    const cols=splitColumns(lines[i]);
    if(cols.length<2||cols.length>4)return false;
    if(cols.some(c=>c.text.length>85||!/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9]/.test(c.text)))return false;
    const allUpper=cols.every(c=>c.text===c.text.toUpperCase()&&/[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(c.text));
    const tableContext=/(?:comparativ|compara|diferen|distin|possibilidade|reedi[cç][aã]o|reaprecia|versus|\bx\b|quadro|tabela)/i.test(normalizePiece(contextHeading));
    if(!allUpper&&!tableContext)return false;
    let blank=-1;
    for(let j=i+1;j<Math.min(lines.length,i+5);j++){if(!String(lines[j]).trim()){blank=j;break;}if(isHeading(lines[j])||lawRe.test(normalizePiece(lines[j]))||bulletRe.test(normalizePiece(lines[j])))return false;}
    if(blank<0)return false;
    let wideAfter=0;
    for(let j=blank+1;j<Math.min(lines.length,blank+8);j++){
      if(!String(lines[j]).trim())continue;
      if(isHeading(lines[j]))break;
      if(splitColumns(lines[j]).length>=2){wideAfter++;break;}
    }
    return wideAfter>0;
  }
  function parseTable(lines,i,contextHeading=''){
    if(!isTableHeaderCandidate(lines,i,contextHeading))return null;
    const first=splitColumns(lines[i]);const starts=first.map(x=>x.start),headers=first.map(x=>x.text);let j=i+1;
    while(j<lines.length&&String(lines[j]).trim()){
      const raw=String(lines[j]),cols=splitColumns(raw);
      if(cols.length>=2){for(const c of cols){const k=nearestColumn(starts,c.start);headers[k]=normalizePiece(`${headers[k]} ${c.text}`);}}
      else{const text=normalizePiece(raw);if(text){const pos=Math.max(0,raw.search(/\S/));const k=nearestColumn(starts,pos);headers[k]=normalizePiece(`${headers[k]} ${text}`);}}
      j++;
    }
    while(j<lines.length&&!String(lines[j]).trim())j++;
    const cells=starts.map(()=>''),dataStart=j;let blanks=0,sawWide=false;
    for(;j<lines.length&&j<dataStart+14;j++){
      const raw=String(lines[j]);if(!raw.trim()){blanks++;if(blanks>=2)break;continue;}blanks=0;
      const clean=normalizePiece(raw);if(isHeading(clean)&&j>dataStart)break;
      const cols=splitColumns(raw);
      if(cols.length>=2){sawWide=true;for(const c of cols){const k=nearestColumn(starts,c.start);cells[k]=normalizePiece(`${cells[k]} ${c.text}`);}}
      else{
        const pos=Math.max(0,raw.search(/\S/));let k=nearestColumn(starts,pos);
        const incomplete=[];for(let x=0;x<cells.length;x++)if(cells[x]&&!terminal(cells[x]))incomplete.push(x);
        if(cells[k]&&terminal(cells[k])&&incomplete.length===1)k=incomplete[0];
        cells[k]=normalizePiece(`${cells[k]} ${clean}`);
      }
    }
    if(!sawWide||headers.some(x=>!x)||cells.filter(Boolean).length<2)return null;
    return {headers,cells,end:j-1};
  }
  function renderTable(tbl,attrs){
    const cards=tbl.headers.map((h,i)=>`<div class="v35-compare-card"><div class="v35-compare-title">${escHtml(h)}</div><div class="v35-compare-text">${escHtml(tbl.cells[i]||'—')}</div></div>`).join('');
    return `<div class="v35-compare-grid"${attrs(' data-v35-reflow="table"')}>${cards}</div>`;
  }
  function format(text='',sectionKey=''){
    const lines=String(text).replace(/\r/g,'').split('\n');let out='',block=0,pending=null,lastHeading='';
    const tablesAllowed=!/^(?:lei-seca-e-sumulas|legislacao-completa)--/.test(String(sectionKey));
    const attrs=(extra='')=>` data-read-block="${block++}" data-section-key="${escAttr(sectionKey)}"${extra}`;
    const flush=()=>{
      if(!pending||!pending.parts.length){pending=null;return;}
      const body=normalizePiece(pending.parts.join(' '));if(!body){pending=null;return;}
      if(pending.kind==='bullet')out+=`<div class="integral-bullet"${attrs(' data-v35-reflow="bullet"')}>${escHtml(body)}</div>`;
      else if(pending.kind==='law')out+=`<div class="v16-law-line"${attrs(' data-v35-reflow="law"')}>${escHtml(body)}</div>`;
      else out+=`<p${attrs(' data-v35-reflow="paragraph"')}>${escHtml(body)}</p>`;
      pending=null;
    };
    const begin=(kind,line)=>{pending={kind,parts:[normalizePiece(line)]};};
    for(let i=0;i<lines.length;i++){
      const raw=String(lines[i]),line=normalizePiece(raw);
      if(!line){
        if(pending){const nxt=nextNonBlank(lines,i+1);if(nxt&&softBlankContinuation(pending.parts.join(' '),nxt.line,pending.kind))continue;flush();}
        continue;
      }
      const tbl=tablesAllowed?parseTable(lines,i,lastHeading):null;
      if(tbl){flush();out+=renderTable(tbl,attrs);i=tbl.end;continue;}
      if(isAlert(line)){flush();out+=`<div class="v16-inline-alert"${attrs(' data-v35-reflow="alert"')}>${escHtml(line)}</div>`;continue;}
      if(isHeading(line)){flush();lastHeading=line;const sk=slugText(line);out+=`<h3${attrs(` data-subtopic-key="${escAttr(sk)}" data-subtopic-title="${escAttr(line)}" data-v35-reflow="heading"`)}>${escHtml(line)}</h3>`;continue;}
      if(bulletRe.test(line)){
        flush();begin('bullet',line);continue;
      }
      if(lawRe.test(line)){
        flush();begin('law',line);continue;
      }
      if(pending&&(pending.kind==='bullet'||pending.kind==='law'||pending.kind==='p'))pending.parts.push(line);
      else begin('p',line);
    }
    flush();return out;
  }

  function install(){
    W.OAB_TEXT_QUALITY={VERSION,format,splitColumns,parseTable,normalizePiece};
    W.formatIntegralText=format;
    if(typeof document!=='undefined'&&!document.getElementById('v35TextQualityStyle')){
      const style=document.createElement('style');style.id='v35TextQualityStyle';style.textContent=`
        .v35-compare-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:0;margin:1rem 0 1.4rem;border:1px solid #dfe5ec;border-radius:10px;overflow:hidden;background:#fff}
        .v35-compare-card{min-width:0;padding:0;border-right:1px solid #e5eaf0;background:#fff}
        .v35-compare-card:last-child{border-right:0}
        .v35-compare-title{padding:10px 12px;border-bottom:1px solid #e5eaf0;background:#f8fafc;font-family:Inter,system-ui,sans-serif;font-size:.78rem;font-weight:800;line-height:1.35;color:#172a42}
        .v35-compare-text{padding:12px;font-family:Inter,system-ui,sans-serif;font-size:.92rem;line-height:1.62;color:#334155}
        .integral-body [data-v35-reflow="bullet"],.integral-body [data-v35-reflow="law"],.integral-body [data-v35-reflow="paragraph"]{white-space:normal;overflow-wrap:anywhere;word-break:normal}
        @media(max-width:680px){.v35-compare-grid{grid-template-columns:1fr}.v35-compare-card{border-right:0;border-bottom:1px solid #e5eaf0}.v35-compare-card:last-child{border-bottom:0}}
      `;document.head.appendChild(style);
    }
  }
  install();
})();
