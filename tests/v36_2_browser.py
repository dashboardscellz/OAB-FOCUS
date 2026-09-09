from pathlib import Path
import re
import pytest
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
INDEX=(ROOT/'index.html').read_text(encoding='utf-8')
V16=(ROOT/'data'/'v16-patch.js').read_text(encoding='utf-8')


def inline_index_css():
    return '\n'.join(re.findall(r'<style[^>]*>(.*?)</style>', INDEX, re.S|re.I))


def v16_css():
    m=re.search(r"s\.textContent=`(.*?)`;\s*document\.head\.appendChild\(s\)",V16,re.S)
    assert m
    return m.group(1)


@pytest.fixture(scope='module')
def browser():
    with sync_playwright() as p:
        b=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        yield b
        b.close()


@pytest.mark.parametrize('width,height',[(1366,900),(768,1024),(430,932),(390,844),(360,800)])
def test_semantic_tables_use_internal_scroll_without_page_overflow(browser,width,height):
    css='\n'.join([inline_index_css(),v16_css()])
    cells=''.join(f'<th scope="col">Coluna {i} com título longo</th>' for i in range(1,4))
    body=''.join(f'<td>Conteúdo jurídico da coluna {i} preservado e alinhado.</td>' for i in range(1,4))
    html=f'''<main style="width:min(900px,calc(100% - 20px));margin:10px auto"><div class="integral-body"><div class="integral-table-wrap"><table class="integral-semantic-table integral-inferred-table"><caption class="sr-only">Quadro comparativo</caption><thead><tr>{cells}</tr></thead><tbody><tr>{body}</tr></tbody></table></div></div></main>'''
    page=browser.new_page(viewport={'width':width,'height':height})
    try:
        page.set_content(f'<html><head><style>{css}</style></head><body>{html}</body></html>')
        wrap=page.locator('.integral-table-wrap').evaluate('(el)=>({client:el.clientWidth,scroll:el.scrollWidth,overflow:getComputedStyle(el).overflowX,rect:el.getBoundingClientRect().toJSON()})')
        assert wrap['overflow'] in ('auto','scroll')
        assert wrap['rect']['x'] >= -1
        assert wrap['rect']['x']+wrap['rect']['width'] <= width+1
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2')
        if width <= 430:
            assert wrap['scroll'] > wrap['client']
    finally:
        page.close()


def test_preserved_pdf_layout_uses_monospace_and_no_warning_banner(browser):
    css='\n'.join([inline_index_css(),v16_css()])
    page=browser.new_page(viewport={'width':430,'height':800})
    try:
        page.set_content(f'''<html><head><style>{css}</style></head><body><main style="width:400px;max-width:calc(100% - 20px);margin:auto"><div class="integral-layout-preserved"><pre id="raw">COLUNA A                  COLUNA B\nLinha A                   Linha B</pre></div></main></body></html>''')
        data=page.locator('#raw').evaluate('(el)=>({family:getComputedStyle(el).fontFamily,white:getComputedStyle(el).whiteSpace,scroll:el.scrollWidth,client:el.clientWidth})')
        assert any(x in data['family'] for x in ('monospace','Consolas','Menlo','Monaco'))
        assert data['white']=='pre'
        assert page.locator('.integral-layout-status').count()==0
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2')
    finally:
        page.close()
