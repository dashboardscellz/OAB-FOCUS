from pathlib import Path
import subprocess, json
ROOT=Path(__file__).resolve().parents[1]

def node(js):
    p=subprocess.run(['node','-e',js],cwd=ROOT,text=True,capture_output=True)
    assert p.returncode==0,p.stderr
    return p.stdout

def test_legacy_v16_formatter_delegates_to_v35_runtime_formatter():
    text=(ROOT/'data'/'v16-patch.js').read_text(encoding='utf-8')
    marker="if(window.OAB_TEXT_QUALITY?.format)return window.OAB_TEXT_QUALITY.format(text,sectionKey);"
    assert marker in text, 'v16 ainda pode executar o heurístico antigo de 3+ espaços'
    assert text.index(marker) < text.index('const spaced=raw.trim().split')

def test_v35_formatter_does_not_turn_pdf_spaced_bullet_into_table():
    js=r'''
    global.window=global;global.document=undefined;
    require('./data/v35-text-quality.js');
    const s='●           a separação dos Poderes;\n\nEsse princípio preconiza que as funções estatais sejam repartidas e distribuídas a diferentes\nórgãos, de modo a evitar a centralização do poder e eventuais abusos.';
    console.log(OAB_TEXT_QUALITY.format(s,'x'));
    '''
    h=node(js)
    assert 'v35-compare-grid' not in h
    assert '● a separação dos Poderes;' in h
    assert 'Esse princípio preconiza que as funções estatais sejam repartidas e distribuídas a diferentes órgãos, de modo a evitar a centralização do poder e eventuais abusos.' in h

def test_v35_formatter_reconstructs_inline_pdf_gap_as_normal_sentence():
    js=r'''
    global.window=global;global.document=undefined;
    require('./data/v35-text-quality.js');
    const s='Caso venha a existir uma PEC (projeto de emenda constitucional) que viole claramente as\ncláusulas pétreas, visando impedir que tal projeto seja aprovado e se transforme em lei,                   os\nparlamentares têm legitimidade para impetrar mandado de segurança preventivo para assegurar\no respeito ao devido processo legislativo. (CONTROLE PREVENTIVO DE CONSTITUCIONALIDADE).';
    console.log(OAB_TEXT_QUALITY.format(s,'x'));
    '''
    h=node(js)
    assert 'v35-compare-grid' not in h
    expected='cláusulas pétreas, visando impedir que tal projeto seja aprovado e se transforme em lei, os parlamentares têm legitimidade para impetrar mandado de segurança preventivo para assegurar o respeito ao devido processo legislativo.'
    assert expected in h

def test_inline_importante_with_sentence_is_not_split_from_its_continuation():
    js=r'''
    global.window=global;global.document=undefined;
    require('./data/v35-text-quality.js');
    const s='IMPORTANTE! O voto obrigatório não é cláusula pétrea. Assim, o voto facultativo é\npossível no Brasil, através de uma emenda.';
    console.log(OAB_TEXT_QUALITY.format(s,'x'));
    '''
    h=node(js)
    assert 'v16-inline-alert' not in h
    assert 'O voto obrigatório não é cláusula pétrea. Assim, o voto facultativo é possível no Brasil, através de uma emenda.' in h

def test_known_three_column_comparison_is_reconstructed_semantically():
    js=r'''
    global.window=global;global.document=undefined;
    require('./data/v35-text-quality.js');
    const s=`POSSIBILIDADE DE REEDIÇÃO OU REAPRECIAÇÃO

Projeto de emenda                                                 Projeto de lei                   Medida provisória
constitucional

Só pode ser analisada na                                Pode ser analisada na MESMA                  Só pode ser analisada na
PRÓXIMA sessão legislativa                             sessão legislativa, desde que haja          PRÓXIMA sessão legislativa.
(art 60, § 5 CF)                           proposta da maioria absoluta dos                    (art 62, § 10 CF)
membros de uma das casas do
Congresso (art 67 CF).`;
    console.log(OAB_TEXT_QUALITY.format(s,'x'));
    '''
    h=node(js)
    assert 'v35-compare-grid' in h
    assert 'Projeto de emenda constitucional' in h
    assert 'Só pode ser analisada na PRÓXIMA sessão legislativa (art 60, § 5 CF)' in h
    assert 'Pode ser analisada na MESMA sessão legislativa, desde que haja proposta da maioria absoluta dos membros de uma das casas do Congresso (art 67 CF).' in h
    assert 'Só pode ser analisada na PRÓXIMA sessão legislativa. (art 62, § 10 CF)' in h
