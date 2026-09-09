from pathlib import Path
import re
import pytest
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
INDEX=(ROOT/'index.html').read_text(encoding='utf-8')
SHELL=(ROOT/'data'/'v35-shell.css').read_text(encoding='utf-8')
V36CSS=(ROOT/'data'/'v36-primary-prep.css').read_text(encoding='utf-8')


def inline_index_css():
    return '\n'.join(re.findall(r'<style[^>]*>(.*?)</style>', INDEX, re.S|re.I))


def injected_css(path):
    text=path.read_text(encoding='utf-8')
    # patch files install one main style template literal; this is sufficient for computed-style regression.
    m=re.search(r'(?:el|s)\.textContent=`(.*?)`;\s*document\.head\.appendChild', text, re.S)
    assert m, path
    return m.group(1)


@pytest.fixture(scope='module')
def browser():
    with sync_playwright() as p:
        b=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        yield b
        b.close()


def test_let03_computed_reader_font_is_serif_from_single_design_token(browser):
    css='\n'.join([
        inline_index_css(), SHELL,
        injected_css(ROOT/'data'/'v17-patch.js'),
        injected_css(ROOT/'data'/'v18-patch.js'),
        injected_css(ROOT/'data'/'v19-patch.js'),
    ])
    page=browser.new_page(viewport={'width':1440,'height':900})
    try:
        page.set_content(f'<html><head><style>{css}</style></head><body class="v17-reader-active v18-reader-active"><div id="app"><div class="v18-reader"><article class="v26-reading-stage"><div class="integral-body"><p id="sample">Leitura jurídica longa.</p></div></article></div></div></body></html>')
        family=page.locator('#sample').evaluate('(el)=>getComputedStyle(el).fontFamily')
        assert 'Georgia' in family or 'Times New Roman' in family, family
        assert 'Inter' not in family, family
    finally:
        page.close()


@pytest.mark.parametrize('width,height',[(768,1024),(430,932),(390,844),(360,800)])
def test_let05_v36_prepare_components_have_no_mobile_overflow(browser,width,height):
    css='\n'.join([inline_index_css(), SHELL, V36CSS])
    html='''<div id="app"><main class="content"><section class="v36-readiness"><div class="v36-readiness-head"><div><h3>Prontidão para a prova</h3><p>Direção diária baseada no seu desempenho e na incidência da prova.</p></div><div class="v36-readiness-score"><strong>72%</strong><small>prontidão estimada</small></div></div><div class="v36-mission-grid"><article><span>1</span><div><b>Estudar teoria prioritária</b><p class="v36-priority-reason">Direito Empresarial · ponto de maior prioridade.</p></div></article><article><span>2</span><div><b>Resolver questões</b><p class="v36-priority-reason">Questões oficiais e revisão dos erros.</p></div></article><article><span>3</span><div><b>Revisar</b><p class="v36-priority-reason">Retenção e revisão espaçada.</p></div></article></div><div class="v36-source-row"><span class="v36-source-badge">FGV/OAB</span><span class="v36-source-badge">Legislação atual</span></div><div class="v36-diagnostic-action"><button class="btn primary">Iniciar diagnóstico de 40 questões</button><small>O diagnóstico calibra o plano.</small></div></section></main></div>'''
    page=browser.new_page(viewport={'width':width,'height':height})
    try:
        page.set_content(f'<html><head><style>{css}</style></head><body>{html}</body></html>')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2')
        readiness=page.locator('.v36-readiness').bounding_box(); assert readiness
        assert readiness['x'] >= -1 and readiness['x']+readiness['width'] <= width+1
        cols=page.locator('.v36-mission-grid').evaluate('(el)=>getComputedStyle(el).gridTemplateColumns')
        assert ' ' not in cols.strip(), cols
        btn=page.locator('.v36-diagnostic-action .btn').bounding_box(); assert btn
        assert btn['x'] >= -1 and btn['x']+btn['width'] <= width+1
    finally:
        page.close()
