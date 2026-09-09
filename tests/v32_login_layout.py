from pathlib import Path
import re
import pytest
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / 'index.html'
V29 = ROOT / 'data' / 'v29-patch.js'
V32 = ROOT / 'data' / 'v32-patch.js'


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
    if V29.exists():
        page.add_script_tag(path=str(V29))
    if V32.exists():
        page.add_script_tag(path=str(V32))
    page.wait_for_timeout(80)
    return page


def test_v32_is_loaded_after_v30():
    html = INDEX.read_text(encoding='utf-8')
    assert '<script src="data/v32-patch.js?v=36.2"></script>' in html
    assert html.rfind('data/v32-patch.js') > html.rfind('data/v30-patch.js')


def test_desktop_columns_are_balanced_at_1366(browser):
    page = page_for(browser, 1366, 595)
    try:
        showcase = page.locator('.login-showcase').evaluate('e=>e.getBoundingClientRect().width')
        form = page.locator('.login-form-v11').evaluate('e=>e.getBoundingClientRect().width')
        card = page.locator('.login-card-v11').evaluate('e=>e.getBoundingClientRect().width')
        # Manter o lado institucional predominante, mas sem deixar o login estreito.
        assert showcase >= 790
        assert 470 <= form <= 560
        assert card >= 430
    finally:
        page.close()


def test_founder_story_is_not_crushed_or_forced_to_three_lines(browser):
    page = page_for(browser, 1366, 595)
    try:
        story = page.locator('.showcase-story').evaluate('e=>e.getBoundingClientRect().width')
        h1 = page.locator('.showcase-story h1')
        box = h1.bounding_box()
        line_height = h1.evaluate('e=>parseFloat(getComputedStyle(e).lineHeight)')
        assert story >= 350
        assert box['height'] <= line_height * 2.15
    finally:
        page.close()


def test_desktop_login_does_not_start_scrolled_or_clip_top_brand(browser):
    page = page_for(browser, 1366, 595)
    try:
        page.evaluate('window.scrollTo(0,120)')
        # v32 deve expor um reset reutilizável pelo showLogin e pela observação de visibilidade.
        assert page.evaluate('typeof window.OAB_V32?.resetLoginViewport === "function"')
        page.evaluate('OAB_V32.resetLoginViewport()')
        page.wait_for_timeout(20)
        assert page.evaluate('window.scrollY') == 0
        top = page.locator('.showcase-logo').bounding_box()['y']
        assert top >= 18
    finally:
        page.close()


@pytest.mark.parametrize('width,height',[(1180,720),(980,720),(900,720),(768,800),(430,844),(390,844),(360,800)])
def test_login_never_overflows_horizontally(browser,width,height):
    page = page_for(browser,width,height)
    try:
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2')
        assert page.locator('.login-card-v11').evaluate('e=>e.scrollWidth <= e.clientWidth + 1')
    finally:
        page.close()


def test_mobile_card_uses_available_width_without_touching_edges(browser):
    page = page_for(browser,390,844)
    try:
        card = page.locator('.login-card-v11').bounding_box()
        assert card['x'] >= 10
        assert card['x'] + card['width'] <= 380
        assert card['width'] >= 350
    finally:
        page.close()
