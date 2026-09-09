from pathlib import Path
import re
import pytest
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
INDEX = (ROOT / 'index.html').read_text(encoding='utf-8')
V16 = (ROOT / 'data' / 'v16-patch.js').read_text(encoding='utf-8')
V21 = (ROOT / 'data' / 'v21-patch.js').read_text(encoding='utf-8')
V34 = (ROOT / 'data' / 'v34-patch.js').read_text(encoding='utf-8')


def _inlined_app_html():
    html = INDEX
    def inline_script(match):
        src = match.group(1).split('?', 1)[0]
        code = (ROOT / src).read_text(encoding='utf-8').replace('</script>', '<\\/script>')
        return f'<script data-inlined-from="{src}">\n{code}\n</script>'
    return re.sub(r'<script src="(data/[^"]+\.js(?:\?[^\"]*)?)"></script>', inline_script, html)


@pytest.fixture(scope='module')
def real_page():
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        page = browser.new_page(viewport={'width': 1366, 'height': 900})
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.set_content(_inlined_app_html(), wait_until='load', timeout=90000)
        page.wait_for_function("() => window.__OAB_BOOT_OK===true && typeof window.formatIntegralText==='function'", timeout=30000)
        yield page
        assert not errors, errors
        page.close()
        browser.close()


def test_global_pdf_column_parser_groups_header_and_body_into_one_aligned_structure(real_page):
    sample = (
        'Derivado Decorrente                                        Derivado Reformador                     Derivado Revisor\n\n'
        'Cria e modifica a Constituição                                       Altera as normas da           Faz alterações na Constituição\n'
        'dos Estados.                                         Constituição Federal.                por via extraordinária.\n\n'
        '2. Limitações do Poder Derivado Reformador'
    )
    result = real_page.evaluate("""sample => {
      const host=document.createElement('div');
      host.innerHTML=window.formatIntegralText(sample,'constitucional-poder-constituinte');
      return {
        tables:host.querySelectorAll('.integral-semantic-table').length,
        preserved:host.querySelectorAll('.integral-layout-preserved').length,
        banners:host.querySelectorAll('.integral-layout-status').length,
        rows:[...host.querySelectorAll('.integral-semantic-table tr')].map(r=>[...r.children].map(c=>c.textContent.trim())),
        text:host.textContent
      };
    }""", sample)
    assert result['banners'] == 0
    assert result['tables'] == 1, result
    assert result['preserved'] == 0, result
    assert result['rows'][0] == ['Derivado Decorrente', 'Derivado Reformador', 'Derivado Revisor']
    assert result['rows'][1] == [
        'Cria e modifica a Constituição dos Estados.',
        'Altera as normas da Constituição Federal.',
        'Faz alterações na Constituição por via extraordinária.'
    ]
    assert '2. Limitações do Poder Derivado Reformador' in result['text']



def test_complex_extracted_table_is_grouped_as_one_structure_instead_of_many_boxes(real_page):
    sample = (
        'OUTORGA (POR SERVIÇO)                                                           DELEGAÇÃO (POR COLABORAÇÃO)\n\n'
        'É feita por lei específica, que cria as entidades e                                      É feita:\n'
        'a transfere a atividade pública.                                                         -     por lei: quando se dá aos entes da\n'
        'administração indireta de direito privado;\n'
        '- por contratos de concessão e permissão de\n'
        'serviço público, para particulares.\n'
        'OBS.: Vale salientar que se ocorrer a delegação,\n'
        'a agência reguladora que delegar permanecerá\n'
        'como instância superior durante a vigência.\n\n'
        'Por        essa         modalidade,                é      transferida             a      Por   essa    modalidade,     somente   é   feita   a\n'
        'TITULARIDADE e a EXECUÇÃO do serviço público                                             transferência    da       EXECUÇÃO    dos   serviços\n'
        'a outra entidade.                                                                        públicos,    sendo    a   titularidade mantida do\n'
        'Estado.\n\n\n'
        'RESUMINDO!'
    )
    result = real_page.evaluate("""sample => {
      const host=document.createElement('div');
      host.innerHTML=window.formatIntegralText(sample,'administrativo-descentralizacao');
      return {
        structures:host.querySelectorAll('.integral-semantic-table,.integral-layout-preserved').length,
        preserved:host.querySelectorAll('.integral-layout-preserved').length,
        text:host.textContent,
        headings:[...host.querySelectorAll('h3')].map(x=>x.textContent.trim())
      };
    }""", sample)
    assert result['structures'] == 1, result
    assert 'administração indireta de direito privado' in result['text']
    assert 'Por   essa    modalidade' in result['text'] or 'Por essa modalidade' in result['text']
    assert 'RESUMINDO!' in result['headings']



def test_source_scan_reaches_all_disciplines_and_finds_wide_column_material():
    import json
    raw=(ROOT/'data'/'integral-material.js').read_text(encoding='utf-8')
    data=json.loads(raw[len('window.OAB_INTEGRAL='):].rstrip(';'))
    disciplines=data['disciplines']
    assert len(disciplines) == 19  # acervo integral; Filosofia é adicionada pela camada de cobertura v35
    additions=(ROOT/'data'/'v35-content-coverage.js').read_text(encoding='utf-8')
    assert '"Filosofia"' in additions
    total_sections=sum(len(v) for v in disciplines.values())
    affected={}
    for disc,secs in disciplines.items():
        hits=0
        for sec in secs:
            for line in str(sec.get('text','')).splitlines():
                parts=[x.strip() for x in re.split(r'\s{3,}|\t+', line.strip()) if x.strip()]
                if 2 <= len(parts) <= 8 and len(line) < 360:
                    hits += 1
        affected[disc]=hits
    assert total_sections >= 220
    assert sum(1 for n in affected.values() if n>0) >= 17, affected
    assert sum(affected.values()) >= 3000, sum(affected.values())



def test_inferred_table_uses_internal_horizontal_scroll_and_mobile_compaction():
    assert '.integral-table-wrap{max-width:100%;overflow-x:auto' in V16
    assert '@media(max-width:640px)' in V16
    assert '.integral-semantic-table{min-width:520px' in V16


def test_uncertain_preserved_layout_is_neutral_and_monospace_not_a_maintenance_warning():
    assert 'Revisão estrutural pendente' not in V16
    assert 'integral-layout-status' not in V16
    assert 'ui-monospace' in V16 or 'Consolas' in V16


def test_study_filter_has_exactly_one_visual_active_state_after_switch(real_page):
    state = real_page.evaluate("""async () => {
      user={uid:'layout-user',email:'layout@example.invalid'};
      profile={name:'Layout',username:'layout',role:'student',active:true,approvalStatus:'approved'};
      progress=defaultProgress(); progressOwnerUid='layout-user';
      showApp(); bindRoleUI(); updateLevelUI(); safeRoute('study');
      await new Promise(r=>setTimeout(r,120));
      const started=document.querySelector('[data-study-filter="started"]');
      started.click();
      await new Promise(r=>setTimeout(r,120));
      const buttons=[...document.querySelectorAll('[data-study-filter]')];
      return buttons.map(b=>({
        key:b.dataset.studyFilter,
        active:b.classList.contains('active'),
        visual:b.classList.contains('v34-active-state'),
        bg:getComputedStyle(b).backgroundColor
      }));
    }""")
    assert sum(1 for x in state if x['active']) == 1, state
    assert sum(1 for x in state if x['visual']) == 1, state
    started = next(x for x in state if x['key'] == 'started')
    all_btn = next(x for x in state if x['key'] == 'all')
    assert started['active'] and started['visual']
    assert not all_btn['active'] and not all_btn['visual']


def test_student_ui_contains_no_release_notes_or_developer_explanations():
    public = '\n'.join([INDEX, V16, V21])
    forbidden = [
        'O que faz sentido aqui:',
        'O que não faz sentido aqui:',
        'Regra da v16:',
        'Área otimizada.',
        'Plano otimizado.',
        'Cada unidade agora localiza suas próprias questões',
        'Questões exibidas por unidade somente após validação temática',
        'Revisão estrutural pendente',
        'DIREÇÃO V36',
        'vínculo temático validado',
        'Plano com vínculo estrito.',
        'não cria apostila paralela',
        'sem criar outro resumo',
    ]
    leftovers = [text for text in forbidden if text in public]
    assert not leftovers, leftovers


def test_v34_active_state_sync_removes_stale_toggle_state_before_adding_current():
    assert "classList.remove('v34-active-state')" in V34 or 'classList.remove("v34-active-state")' in V34
    assert "querySelectorAll('.seg,.nav-item,.v26-toolbar-btn')" in V34 or 'querySelectorAll(".seg,.nav-item,.v26-toolbar-btn")' in V34
