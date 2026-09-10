#!/usr/bin/env python3
"""Read-only OCR/text anomaly scanner for OAB Focus data/*.js.

The scanner never rewrites source files. It only emits a Markdown report for
human/legal review, because automatic corrections could change normative text.
"""
from __future__ import annotations

from pathlib import Path
import argparse
import re
from typing import Iterable

SUSPICIOUS_FRAGMENTS = {
    'in.luix': 'possível OCR de "incluir"',
    'nlo-govemarnenlal': 'possível OCR de "não-governamental"',
    'Estados Pastes': 'possível OCR de "Estados Partes"',
}

OAB_ROMAN_RE = re.compile(r'OAB\s+([IVXLCDM]+)\b', re.IGNORECASE)
# Capture the year plus zero, one or multiple closing parens so we can flag both
# a missing close and an accidental duplicate close.
OAB_YEAR_RE = re.compile(r'OAB\s+[IVXLCDM]+\s*\((\d{4})(\)*)', re.IGNORECASE)


def int_to_roman(value: int) -> str:
    if value <= 0 or value >= 4000:
        return ''
    pairs = [
        (1000, 'M'), (900, 'CM'), (500, 'D'), (400, 'CD'),
        (100, 'C'), (90, 'XC'), (50, 'L'), (40, 'XL'),
        (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I'),
    ]
    out = []
    remaining = value
    for number, glyph in pairs:
        while remaining >= number:
            out.append(glyph)
            remaining -= number
    return ''.join(out)


def roman_to_int(value: str) -> int | None:
    values = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
    s = value.upper()
    if not s or any(ch not in values for ch in s):
        return None
    total = 0
    previous = 0
    for ch in reversed(s):
        current = values[ch]
        if current < previous:
            total -= current
        else:
            total += current
            previous = current
    return total


def valid_roman(value: str) -> bool:
    number = roman_to_int(value)
    return bool(number and int_to_roman(number) == value.upper())


def line_number(text: str, offset: int) -> int:
    return text.count('\n', 0, offset) + 1


def excerpt_for(text: str, start: int, end: int, radius: int = 72) -> str:
    left = max(0, start - radius)
    right = min(len(text), end + radius)
    excerpt = text[left:right].replace('\n', ' ').replace('\r', ' ')
    return re.sub(r'\s+', ' ', excerpt).strip()


def add_finding(findings: list[dict], text: str, source: str, category: str, start: int, end: int, note: str) -> None:
    key = (category, start, end)
    if any((f['category'], f['_start'], f['_end']) == key for f in findings):
        return
    findings.append({
        'source': source,
        'line': line_number(text, start),
        'category': category,
        'excerpt': excerpt_for(text, start, end),
        'note': note,
        '_start': start,
        '_end': end,
    })


def scan_text(text: str, source: str = '<memory>') -> list[dict]:
    findings: list[dict] = []

    for match in OAB_YEAR_RE.finditer(text):
        closes = match.group(2)
        if len(closes) != 1:
            note = 'referência OAB com parêntese de fechamento ausente' if len(closes) == 0 else 'referência OAB com parêntese de fechamento duplicado'
            add_finding(findings, text, source, 'oab-parenthesis', match.start(), match.end(), note)

    for match in OAB_ROMAN_RE.finditer(text):
        roman = match.group(1).upper()
        if not valid_roman(roman):
            add_finding(findings, text, source, 'invalid-roman', match.start(1), match.end(1), f'algarismo romano não canônico em referência OAB: {roman}')

    lower = text.lower()
    for fragment, note in SUSPICIOUS_FRAGMENTS.items():
        needle = fragment.lower()
        start = 0
        while True:
            idx = lower.find(needle, start)
            if idx < 0:
                break
            add_finding(findings, text, source, 'ocr-fragment', idx, idx + len(fragment), note)
            start = idx + len(fragment)

    findings.sort(key=lambda f: (f['source'], f['line'], f['_start'], f['category']))
    for finding in findings:
        finding.pop('_start', None)
        finding.pop('_end', None)
    return findings


def iter_js_files(data_dir: Path) -> Iterable[Path]:
    return sorted(path for path in data_dir.rglob('*.js') if path.is_file())


def audit_tree(data_dir: Path, report_path: Path) -> list[dict]:
    data_dir = Path(data_dir)
    report_path = Path(report_path)
    findings: list[dict] = []
    for path in iter_js_files(data_dir):
        text = path.read_text(encoding='utf-8', errors='replace')
        try:
            source = str(path.relative_to(data_dir.parent))
        except ValueError:
            source = str(path)
        findings.extend(scan_text(text, source))

    lines = [
        '# Auditoria de OCR / Escrita — OAB Focus v36',
        '',
        '> Relatório automático de **suspeitas** para revisão humana. Nenhum arquivo jurídico foi alterado por este scanner.',
        '',
        f'- Arquivos `.js` analisados: **{sum(1 for _ in iter_js_files(data_dir))}**',
        f'- Ocorrências sinalizadas: **{len(findings)}**',
        '',
    ]
    if not findings:
        lines.append('Nenhuma ocorrência dos padrões configurados foi encontrada.')
    else:
        lines.extend(['| Arquivo | Linha | Categoria | Motivo | Trecho |', '|---|---:|---|---|---|'])
        for f in findings:
            excerpt = f['excerpt'].replace('|', '\\|')
            note = f['note'].replace('|', '\\|')
            lines.append(f"| `{f['source']}` | {f['line']} | `{f['category']}` | {note} | {excerpt} |")
    lines.extend([
        '',
        '## Regra de segurança editorial',
        '',
        'Este relatório **não autoriza correção automática**. Cada ocorrência deve ser conferida no material-fonte antes de qualquer alteração, especialmente em legislação, jurisprudência, tratados e Estatuto/OAB.',
        '',
    ])
    report_path.write_text('\n'.join(lines), encoding='utf-8')
    return findings


def main() -> int:
    parser = argparse.ArgumentParser(description='Gera relatório read-only de suspeitas de OCR em data/*.js')
    parser.add_argument('--data', default='data', help='diretório com arquivos JS')
    parser.add_argument('--report', default='AUDITORIA_OCR_SUSPEITOS_v36.md', help='arquivo Markdown de saída')
    args = parser.parse_args()
    findings = audit_tree(Path(args.data), Path(args.report))
    print(f'{len(findings)} ocorrência(s) sinalizada(s); relatório: {args.report}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
