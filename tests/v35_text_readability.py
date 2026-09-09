from pathlib import Path
import json, re, subprocess

ROOT = Path(__file__).resolve().parents[1]
PATCH = ROOT / 'data' / 'v35-text-quality.js'
INDEX = ROOT / 'index.html'
MATERIAL = ROOT / 'data' / 'integral-material.js'


def run_node(script: str) -> str:
    p = subprocess.run(['node', '-e', script], cwd=ROOT, capture_output=True, text=True)
    assert p.returncode == 0, p.stderr
    return p.stdout.strip()


def load_integral():
    raw = MATERIAL.read_text(encoding='utf-8')
    prefix = 'window.OAB_INTEGRAL='
    assert raw.startswith(prefix)
    return json.loads(raw[len(prefix):].rstrip().rstrip(';'))


def test_v3510_text_quality_patch_is_loaded_last():
    assert PATCH.exists(), 'v35.10 must add a dedicated global text-quality layer'
    html = INDEX.read_text(encoding='utf-8')
    assert 'data/v35-text-quality.js?v=35.10' in html
    assert html.rfind('data/v35-text-quality.js?v=35.10') > html.rfind('data/v35-content-coverage.js')


def test_bullet_wrapped_sentence_is_one_logical_block():
    assert PATCH.exists()
    script = r'''
global.window=global;
global.esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
global.slug=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
global.isNoiseSubheading=()=>false;
require('./data/v35-text-quality.js');
const s='- Implica na revogação de todas as normas jurídicas inseridas na Constituição anterior, ainda que\ncompatíveis com a Constituição ora vigente.';
const out=window.OAB_TEXT_QUALITY.format(s,'x');
console.log(out);
'''
    out = run_node(script)
    plain = re.sub('<[^>]+>', ' ', out)
    plain = re.sub(r'\s+', ' ', plain)
    assert 'ainda que compatíveis com a Constituição ora vigente' in plain
    assert out.count('integral-bullet') == 1


def test_accidental_pdf_spacing_does_not_create_fake_comparison_table():
    assert PATCH.exists()
    script = r'''
global.window=global;
global.esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
global.slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-');
global.isNoiseSubheading=()=>false;
require('./data/v35-text-quality.js');
const s='Caso venha a existir uma PEC que viole claramente as\ncláusulas pétreas, visando impedir que tal projeto seja aprovado e se transforme em lei,                   os\nparlamentares têm legitimidade para impetrar mandado de segurança preventivo.';
const out=window.OAB_TEXT_QUALITY.format(s,'x');
console.log(out);
'''
    out = run_node(script)
    plain = re.sub('<[^>]+>', ' ', out)
    plain = re.sub(r'\s+', ' ', plain)
    assert 'lei, os parlamentares têm legitimidade' in plain
    assert 'v16-compare-row' not in out
    assert 'v35-compare-grid' not in out


def test_wrapped_law_text_stays_in_same_law_block():
    assert PATCH.exists()
    script = r'''
global.window=global;
global.esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
global.slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-');
global.isNoiseSubheading=()=>false;
require('./data/v35-text-quality.js');
const s='Art. 37 CF A administração pública direta e indireta de qualquer dos Poderes da União, dos\nEstados, do Distrito Federal e dos Municípios obedecerá aos princípios de legalidade,\nimpessoalidade, moralidade, publicidade e eficiência.';
const out=window.OAB_TEXT_QUALITY.format(s,'x');
console.log(out);
'''
    out = run_node(script)
    plain = re.sub('<[^>]+>', ' ', out)
    plain = re.sub(r'\s+', ' ', plain)
    assert 'União, dos Estados, do Distrito Federal' in plain
    assert out.count('v16-law-line') == 1


def test_constitutional_comparison_is_reconstructed_as_readable_cards():
    assert PATCH.exists()
    data = load_integral()
    sec = next(s for s in data['disciplines']['Constitucional'] if s['title'] == 'Teoria da Constituição')
    start = sec['text'].index('POSSIBILIDADE DE REEDIÇÃO OU REAPRECIAÇÃO')
    end = sec['text'].index('2.2 Limitações MATERIAIS', start)
    block = sec['text'][start:end]
    script = f'''
global.window=global;
global.esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
global.slug=s=>String(s).toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
global.isNoiseSubheading=()=>false;
require('./data/v35-text-quality.js');
const out=window.OAB_TEXT_QUALITY.format({json.dumps(block, ensure_ascii=False)},'x');
console.log(out);
'''
    out = run_node(script)
    plain = re.sub('<[^>]+>', ' ', out)
    plain = re.sub(r'\s+', ' ', plain)
    assert 'v35-compare-grid' in out
    assert 'Projeto de emenda constitucional' in plain
    assert 'Só pode ser analisada na PRÓXIMA sessão legislativa (art 60, § 5 CF)' in plain
    assert 'Projeto de lei' in plain
    assert 'Pode ser analisada na MESMA sessão legislativa, desde que haja proposta da maioria absoluta dos membros de uma das casas do Congresso (art 67 CF).' in plain
    assert 'Medida provisória' in plain
    assert 'Só pode ser analisada na PRÓXIMA sessão legislativa. (art 62, § 10 CF)' in plain


def test_prompt_and_global_audit_document_the_policy():
    prompt = ROOT / 'PROMPT_MESTRE_HIGIENIZACAO_TEXTUAL_v35_10.md'
    audit = ROOT / 'AUDITORIA_HIGIENIZACAO_TEXTUAL_v35_10.md'
    assert prompt.exists()
    assert audit.exists()
    text = prompt.read_text(encoding='utf-8').lower()
    assert 'quebra física' in text
    assert 'todas as disciplinas' in text
    assert 'tabela' in text
