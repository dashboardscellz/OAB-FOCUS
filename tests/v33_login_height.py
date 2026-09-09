from pathlib import Path
import re
import pytest
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / 'index.html'
V29 = ROOT / 'data' / 'v29-patch.js'
V32 = ROOT / 'data' / 'v32-patch.js'
V33 = ROOT / 'data' / 'v33-patch.js'


def base_css():
    text = INDEX.read_text(encoding='utf-8')
    return '\n'.join(re.findall(r'<style[^>]*>(.*?)</style>', text, re.S | re.I))


LOGIN_HTML = '''
<section id="loginView" class="login-shell login-v11" aria-label="Acesso ao OAB Focus">
  <div class="login-showcase">
    <div class="login-showcase-top">
      <div class="showcase-brand"><span class="showcase-logo">OAB <b>Focus</b></span><span class="showcase-divider"></span><small>ESTUDO INTELIGENTE<br>APROVAÇÃO MAIS PERTO</small></div>
      <div class="showcase-quote">“Disciplina hoje.<br>Advocacia amanhã.”</div>
    </div>
    <div class="showcase-main">
      <div class="showcase-photo-wrap"><div style="width:100%;height:100%"></div></div>
      <div class="showcase-story">
        <span class="showcase-kicker">QUEM CRIOU</span>
        <h1>Manassés Oliveira</h1>
        <p>Meu nome é Manassés Oliveira. Sou goianense, tenho 22 anos, curso o 8º período de Direito na FAG, Faculdade de Goiana, e atuo como estagiário em escritório de advocacia.</p>
        <p>O OAB Focus nasceu da experiência de quem concilia faculdade, prática jurídica e preparação para a Ordem.</p>
        <p>Desenvolvi esta plataforma para aproximar estudo de qualidade de estudantes que não conseguem ou não querem depender de serviços caros.</p>
        <div class="showcase-signature">Manassés Oliveira</div>
      </div>
    </div>
    <div class="showcase-benefits"><div>Conteúdo completo</div><div>Questões reais da OAB</div><div>Evolução acompanhada</div></div>
  </div>
  <div class="login-form-wrap login-form-v11">
    <form id="loginForm" class="login-card login-card-v11">
      <span class="eyebrow">ACESSO</span>
      <h2>Bem-vindo ao<br><span>OAB Focus</span></h2>
      <p class="muted">Entre para continuar sua preparação.</p>
      <label>Usuário<input value="Manassés"></label>
      <label>Senha<div class="password-row"><input type="password" value="12345"><button class="icon-btn">◉</button></div></label>
      <button class="btn primary wide">Entrar</button>
      <button class="btn register-btn wide">Criar minha conta</button>
      <small class="approval-note">Novos cadastros entram após aprovação de um administrador.</small>
      <div class="secure-note"><span>◇</span><div><b>Acesso individual</b><small>Seu progresso fica vinculado à sua conta.</small></div></div>
    </form>
  </div>
</section>
'''


@pytest.fixture(scope='module')
def browser():
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        yield b
        b.close()


def page_for(browser, width, height):
    page = browser.new_page(viewport={'width': width, 'height': height})
    page.set_content(f'<html><head><style>{base_css()}</style></head><body>{LOGIN_HTML}</body></html>')
    for patch in (V29, V32, V33):
        if patch.exists():
            page.add_script_tag(path=str(patch))
    page.wait_for_timeout(80)
    return page


def test_v33_is_loaded_after_v32():
    html = INDEX.read_text(encoding='utf-8')
    assert '<script src="data/v33-patch.js?v=36.0"></script>' in html
    assert html.rfind('data/v33-patch.js') > html.rfind('data/v32-patch.js')


@pytest.mark.parametrize('width,height', [(1366,607),(1366,720)])
def test_short_desktop_login_card_fits_first_viewport(browser, width, height):
    page = page_for(browser,width,height)
    try:
        card = page.locator('.login-card-v11').bounding_box()
        assert card['y'] >= 10
        assert card['y'] + card['height'] <= height - 10
    finally:
        page.close()


def test_short_desktop_uses_compact_showcase_without_crushing_founder(browser):
    page = page_for(browser,1366,607)
    try:
        story = page.locator('.showcase-story').bounding_box()
        title = page.locator('.showcase-story h1').bounding_box()
        line_height = page.locator('.showcase-story h1').evaluate('e=>parseFloat(getComputedStyle(e).lineHeight)')
        photo = page.locator('.showcase-photo-wrap').bounding_box()
        # texto continua largo e o nome não vira uma coluna de 3+ linhas
        assert story['width'] >= 340
        assert title['height'] <= line_height * 2.15
        # foto compacta o suficiente para não forçar a página para baixo
        assert photo['height'] <= 260
        # conteúdo institucional cabe no viewport curto
        showcase = page.locator('.login-showcase').bounding_box()
        assert showcase['height'] <= 607 + 1
    finally:
        page.close()


def test_tall_desktop_keeps_full_presentation(browser):
    page = page_for(browser,1440,900)
    try:
        third = page.locator('.showcase-story p').nth(2)
        sig = page.locator('.showcase-signature')
        assert third.is_visible()
        assert sig.is_visible()
        assert page.locator('.showcase-photo-wrap').bounding_box()['height'] >= 360
    finally:
        page.close()


@pytest.mark.parametrize('width,height', [(1366,607),(1366,768),(1440,900),(980,720),(768,800),(430,844),(390,844),(360,800)])
def test_v33_login_has_no_horizontal_overflow(browser,width,height):
    page = page_for(browser,width,height)
    try:
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2')
    finally:
        page.close()
