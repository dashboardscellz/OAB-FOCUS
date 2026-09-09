from pathlib import Path
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
TAX = ROOT / "data" / "v35-taxonomy.js"
V18 = ROOT / "data" / "v18-patch.js"
V27 = ROOT / "data" / "v27-patch.js"
INTEGRAL = ROOT / "data" / "integral-material.js"


def node_eval(js: str):
    proc = subprocess.run(
        ["node", "-"], cwd=ROOT, text=True, input=js, capture_output=True, check=True
    )
    return proc.stdout.strip()


def taxonomy_eval(expr: str):
    path = str(TAX).replace("\\", "\\\\")
    out = node_eval(f"const T=require('{path}'); console.log(JSON.stringify({expr}));")
    return json.loads(out)


def test_taxonomy_layer_is_loaded_last_with_cache_version():
    html = INDEX.read_text(encoding="utf-8")
    assert 'src="data/v35-taxonomy.js?v=36.0"' in html
    assert html.index('src="data/v35-taxonomy.js?v=36.0"') > html.index('src="data/v35-shell.js')


def test_taxonomy_module_exists_and_exports_contract():
    assert TAX.exists()
    api = taxonomy_eval("Object.keys(T).sort()")
    for name in [
        "VERSION", "buildPedagogicalUnits", "parseHeadings", "strategyForChapter",
        "labelFor", "sourceSubtopicsFor", "isLearningKeyDone"
    ]:
        assert name in api


def test_nested_headings_do_not_become_independent_units_for_poder_constituinte():
    text = '''
1. Poder Constituinte
O poder constituinte é a capacidade de criar ou modificar a Constituição. Este bloco apresenta conceito e titularidade com explicações suficientes para a unidade.
1.1 Poder Constituinte Originário
Cria nova ordem constitucional e possui características próprias. Explicação adicional sobre autonomia, inicialidade e incondicionalidade.
1.2 Poder Constituinte Derivado
É subordinado à Constituição vigente e se manifesta de formas distintas.
1.2.1 Reformador
Atua por emendas constitucionais e observa limites.
1.2.2 Revisor
A revisão constitucional possui disciplina própria no ADCT.
2. Limitações do Poder Derivado Reformador
Há limitações formais, circunstanciais e materiais, inclusive cláusulas pétreas. O estudo é complemento direto do poder derivado.
3. Revogação
A nova Constituição revoga a anterior.
4. Recepção
Normas infraconstitucionais compatíveis podem ser recepcionadas.
5. Mutação Constitucional
A interpretação constitucional pode mudar sem alteração textual.
6. Eficácia das Normas Constitucionais
Normas podem ter eficácia plena, contida ou limitada.
'''
    data = taxonomy_eval(f"T.buildPedagogicalUnits('Constitucional','Teoria da Constituição',{json.dumps(text)})")
    titles = [u["label"] for u in data]
    flat_sources = [s for u in data for s in u["sourceSubtopics"]]
    assert any("Poder Constituinte" in t for t in titles)
    assert not any(t == "Poder Constituinte Originário" for t in titles)
    assert not any(t == "Poder Constituinte Derivado" for t in titles)
    first = next(u for u in data if "Poder Constituinte" in u["label"])
    assert any("1.1 Poder Constituinte Originário" in s for s in first["sourceSubtopics"])
    assert any("1.2 Poder Constituinte Derivado" in s for s in first["sourceSubtopics"])
    assert any("2. Limitações do Poder Derivado Reformador" in s for s in first["sourceSubtopics"])
    assert "1.1 Poder Constituinte Originário" in flat_sources


def test_distinct_legal_institutes_can_remain_separate():
    text = '''
1. Habeas Data
Texto sobre habeas data e suas hipóteses constitucionais.
2. Habeas Corpus
Texto sobre habeas corpus, cabimento e legitimidade.
3. Mandado de Segurança
Texto sobre mandado de segurança individual e coletivo.
4. Mandado de Injunção
Texto sobre mandado de injunção e omissão normativa.
5. Ação Popular
Texto sobre ação popular.
'''
    data = taxonomy_eval(f"T.buildPedagogicalUnits('Constitucional','Remédios Constitucionais',{json.dumps(text)})")
    assert [u["label"] for u in data] == [
        "Habeas Data", "Habeas Corpus", "Mandado de Segurança", "Mandado de Injunção", "Ação Popular"
    ]


def test_generic_concept_heading_is_not_left_as_one_paragraph_unit():
    text = '''
1. Conceito
Ilicitude é a contrariedade entre a conduta típica e o ordenamento jurídico.
2. Excludentes de Ilicitude
Estado de necessidade, legítima defesa, estrito cumprimento do dever legal e exercício regular de direito afastam a ilicitude. Este bloco desenvolve requisitos, limites, excesso e consequências jurídicas com explicação longa suficiente para o estudo.
2.1 Estado de Necessidade
Detalhamento do instituto.
2.2 Legítima Defesa
Detalhamento do instituto.
'''
    data = taxonomy_eval(f"T.buildPedagogicalUnits('Penal','Ilicitude',{json.dumps(text)})")
    assert len(data) == 1
    assert data[0]["label"].startswith("Ilicitude")
    assert any("Conceito" in x for x in data[0]["sourceSubtopics"])
    assert any("Excludentes de Ilicitude" in x for x in data[0]["sourceSubtopics"])


def test_numbered_sentences_and_oab_markers_are_not_headings():
    text = '''
1. Poder Constituinte
Texto principal.
1) A proposta será discutida e votada em cada Casa do Congresso Nacional, em dois turnos,
2) A emenda à Constituição será promulgada pelas Mesas da Câmara e do Senado Federal,
36 *CAIU NA OAB 33*
2. Revogação
Texto de revogação.
'''
    heads = taxonomy_eval(f"T.parseHeadings({json.dumps(text)})")
    labels = [h["label"] for h in heads]
    assert "Poder Constituinte" in labels
    assert "Revogação" in labels
    assert not any("proposta será discutida" in x for x in labels)
    assert not any("CAIU NA OAB" in x for x in labels)


def test_v18_and_v27_consume_taxonomy_for_question_mapping_and_labels():
    v18 = V18.read_text(encoding="utf-8")
    v27 = V27.read_text(encoding="utf-8")
    assert "sourceSubtopicsFor" in v18
    assert "labelFor" in v18
    assert "sourceSubtopicsFor" in v27
    assert "labelFor" in v27
    assert "taxonomyVersion" in v27


def test_integral_material_is_not_rewritten_by_taxonomy_layer():
    src = TAX.read_text(encoding="utf-8") if TAX.exists() else ""
    assert "OAB_INTEGRAL=" not in src
    assert "sec.text=" not in src.replace(" ", "")


def test_global_material_has_all_expected_disciplines_untouched():
    raw = INTEGRAL.read_text(encoding="utf-8")
    payload = raw[len("window.OAB_INTEGRAL="):].rstrip().rstrip(";")
    data = json.loads(payload)
    assert len(data["disciplines"]) >= 19
    for name in ["Constitucional", "Ética", "Civil", "Penal", "Administrativo", "Processo Civil", "Processo Penal"]:
        assert name in data["disciplines"]


def test_parser_accepts_compact_numbered_headings_but_rejects_enumerated_sentences():
    text = '''
3.Induzimento, Instigação ou Auxílio do Suicídio ou à Automutilação
Texto jurídico do crime.
4.Infanticídio
Texto jurídico do crime.
1) Natural: É a interrupção espontânea da gravidez.
2) Acidental: É a interrupção da gravidez provocada por traumatismos.
'''
    heads = taxonomy_eval(f"T.parseHeadings({json.dumps(text)})")
    labels = [h["label"] for h in heads]
    assert "Induzimento, Instigação ou Auxílio do Suicídio ou à Automutilação" in labels
    assert "Infanticídio" in labels
    assert not any("interrupção espontânea" in x for x in labels)
    assert not any("traumatismos" in x for x in labels)


def test_direitos_fundamentais_keeps_general_theory_and_article_five_as_two_coherent_units():
    text = '''
1. Dimensões dos Direitos Fundamentais
Texto sobre dimensões.
2. Características dos Direitos Fundamentais
Texto sobre características.
3. Aplicabilidade dos Direitos Fundamentais
Texto sobre aplicação.
4. Hierarquia das normas
Texto sobre hierarquia.
5. Força dos Tratados Internacionais em matéria de direitos humanos
Texto sobre tratados.
6. Reserva do Possível
Texto sobre reserva do possível.
7. Artigo 5º da Constituição Federal
Texto geral sobre o artigo 5º.
7.1 Liberdade do exercício de qualquer trabalho
Texto sobre liberdade profissional.
7.2 Direito de reunião
Texto sobre reunião.
'''
    data = taxonomy_eval(f"T.buildPedagogicalUnits('Constitucional','Direitos e Garantias Fundamentais',{json.dumps(text)})")
    assert [u["label"] for u in data] == [
        "Teoria Geral dos Direitos Fundamentais",
        "Direitos e Garantias Individuais — Art. 5º",
    ]
    assert any("Artigo 5º" in s for s in data[1]["sourceSubtopics"])


def test_crimes_contra_honra_is_comparative_unit_not_micro_units_per_crime():
    text = '''
1. Conceito
Texto introdutório.
2. Calúnia
Texto sobre calúnia.
3. Difamação
Texto sobre difamação.
4. Injúria
Texto sobre injúria.
5. Exceção da Verdade
Texto sobre exceção.
6. Disposições comuns dos crimes contra a honra
Texto comum.
7. Ação Penal nos casos de Crimes contra a Honra
Texto sobre ação penal.
'''
    data = taxonomy_eval(f"T.buildPedagogicalUnits('Penal','Crimes Contra a Honra',{json.dumps(text)})")
    assert len(data) == 1
    assert data[0]["label"] == "Crimes Contra a Honra"
    assert len(data[0]["sourceSubtopics"]) >= 7


def test_contract_microtypes_are_grouped_when_they_form_one_study_nucleus():
    text = '''
1. Contrato de compra e venda
Texto amplo de compra e venda.
2. Contrato de doação
Texto amplo de doação.
3. Mútuo
Texto sobre mútuo.
4. Comodato
Texto sobre comodato.
5. Fiança
Texto sobre fiança.
6. Locação
Texto sobre locação.
7. Prestação de serviço
Texto sobre prestação.
8. Empreitada
Texto sobre empreitada.
'''
    data = taxonomy_eval(f"T.buildPedagogicalUnits('Civil','Contratos: Contratos em Espécie',{json.dumps(text)})")
    labels = [u["label"] for u in data]
    assert "Empréstimos: Mútuo e Comodato" in labels
    assert "Prestação de Serviço e Empreitada" in labels
    assert "Mútuo" not in labels and "Comodato" not in labels
    assert "Prestação de serviço" not in labels and "Empreitada" not in labels


def test_grouped_unit_preserves_old_microtopic_sources_and_requires_complete_legacy_set():
    path = str(TAX).replace('\\', '\\\\')
    script = r'''
const T=require("__PATH__");
const sec={title:'Teoria da Constituição',text:`1. Poder Constituinte\ntexto\n1.1 Poder Constituinte Originário\ntexto\n1.2 Poder Constituinte Derivado\ntexto\n2. Limitações do Poder Derivado Reformador\ntexto\n3. Revogação\ntexto\n4. Recepção\ntexto\n5. Mutação Constitucional\ntexto\n6. Eficácia das Normas Constitucionais\ntexto`};
const original=['1. Poder Constituinte','1.1 Poder Constituinte Originário','1.2 Poder Constituinte Derivado','2. Limitações do Poder Derivado Reformador','3. Revogação','4. Recepção','5. Mutação Constitucional','6. Eficácia das Normas Constitucionais'];
const chapter={id:'chapter-teoria',title:'Teoria da Constituição',subtopics:[...original],hasTheory:true,theory:[sec]};
const root={disciplineChapters:()=>[chapter],isolateSubtopicSections:(x)=>x};
T.install(root);
const grouped=root.disciplineChapters('Constitucional')[0].subtopics[0];
const sources=T.sourceSubtopicsFor('Constitucional','chapter-teoria',grouped);
const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/^\s*\d+(?:\.\d+){0,4}[\.)]?\s+/, '').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,'-');
const prefix='Constitucional|chapter-teoria|';
const all={learningPath:{completed:{}}}; sources.forEach(x=>all.learningPath.completed[prefix+slug(x)]={at:1});
const partial=JSON.parse(JSON.stringify(all)); delete partial.learningPath.completed[prefix+slug(sources[sources.length-1])];
const base=prefix+slug(grouped);
console.log(JSON.stringify({sources,all:T.isLearningKeyDone(base,all),partial:T.isLearningKeyDone(base,partial)}));
'''.replace('__PATH__', path)
    out = json.loads(node_eval(script))
    assert len(out['sources']) == 4
    assert any('Originário' in x for x in out['sources'])
    assert any('Derivado' in x for x in out['sources'])
    assert out['all'] is True
    assert out['partial'] is False


def _integral_payload():
    raw = INTEGRAL.read_text(encoding="utf-8")
    payload = raw[len("window.OAB_INTEGRAL="):].rstrip().rstrip(";")
    return json.loads(payload)


def test_deep_supplements_use_semantic_units_not_pdf_toc_or_citations():
    data = _integral_payload()["disciplines"]
    cases = [
        ("Administrativo", "Improbidade Administrativa — conteúdo completo", [
            "Fundamentos e regime jurídico da improbidade administrativa",
            "Aspectos materiais da improbidade administrativa",
            "Investigação e acordo de não persecução cível",
            "Processo de improbidade administrativa",
        ]),
        ("Administrativo", "Licitações e Contratos — conteúdo completo", [
            "Fundamentos, modalidades e contratação direta",
            "Nova Lei de Licitações: estrutura e modalidades",
            "Agentes públicos, planejamento, execução e julgamento",
            "Contratação direta e transição legislativa",
            "Processo licitatório e habilitação na Lei 14.133/2021",
            "Dispensa e inexigibilidade",
            "Contratos administrativos",
            "Infrações, sanções e controle",
            "Crimes em licitações e contratos administrativos",
        ]),
        ("Ética", "Ética e Estatuto da OAB — revisão completa", [
            "Princípios fundamentais da advocacia",
            "Atividade da advocacia e mandato",
            "Direitos e prerrogativas do advogado",
            "Inscrição na OAB",
            "Sociedade de advocacia",
            "Advogado empregado",
            "Honorários advocatícios",
            "Publicidade profissional",
            "Impedimentos e incompatibilidades",
            "Infrações e sanções disciplinares",
            "Processo disciplinar",
            "Organização da OAB",
            "Súmulas e revisão final",
        ]),
    ]
    for discipline, title, expected in cases:
        sec = next(s for s in data[discipline] if s["title"] == title)
        units = taxonomy_eval(f"T.buildPedagogicalUnits({json.dumps(discipline)},{json.dumps(title)},{json.dumps(sec['text'])})")
        labels = [u["label"] for u in units]
        assert labels == expected
        assert not any("parte " in x.lower() for x in labels)
        assert not any("curso de" in x.lower() or "editora" in x.lower() or "op.cit" in x.lower() or "pág." in x.lower() for x in labels)


def test_global_taxonomy_has_no_numbered_part_labels_or_citation_labels():
    data = _integral_payload()["disciplines"]
    bad = []
    for discipline, sections in data.items():
        for sec in sections:
            if "teoria" not in str(sec.get("kind", "")).lower() and "complemento" not in str(sec.get("kind", "")).lower():
                continue
            units = taxonomy_eval(f"T.buildPedagogicalUnits({json.dumps(discipline)},{json.dumps(sec['title'])},{json.dumps(sec.get('text',''))})")
            for unit in units:
                label = unit["label"]
                low = label.lower()
                if re.search(r"\bparte\s+\d+(?:/\d+)?\b", low) or any(x in low for x in ["curso de ética", "editora revista", "op.cit", "pág. "]):
                    bad.append((discipline, sec["title"], label))
    assert bad == []


def test_heading_parser_rejects_pdf_toc_footnotes_and_wrapped_sentence_fragments():
    text = '''
1.2 Hipóteses legais de improbidade administrativa..................................... 11
34BIELA JR, Curso de Ética Profissional para Advogados, 5ª Edição, São Paulo, LTr, 2018. Pág. 53
43 CAPEZ, Fernando, Op.cit, p.28
25 (vinte e cinco) dias úteis após a assinatura do contrato, os quantitativos e os pre-
59 CP) e agravantes genéricas, visto as causas majorantes e
3. Prisão Preventiva
Texto jurídico válido.
'''
    heads = taxonomy_eval(f"T.parseHeadings({json.dumps(text)})")
    assert [h["label"] for h in heads] == ["Prisão Preventiva"]


def test_release_updater_validates_taxonomy_layer():
    updater = (ROOT / 'ATUALIZAR_GITHUB.cmd').read_text(encoding='utf-8')
    assert 'data\\v35-taxonomy.js' in updater
