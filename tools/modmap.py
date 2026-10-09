#!/usr/bin/env python3
"""Generate docs/MODULES.md from src/ (stdlib only). Usage: python3 tools/modmap.py [--check]
One section per src/*.js|*.html (+ src/test/*.js): size, purpose, top-level symbols it defines (name@line),
other modules whose globals it uses most, and a reverse index symbol -> file. Run by tools/build.sh."""
import os, re, sys, collections
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
OUT = os.path.join(ROOT, 'docs', 'MODULES.md')
IDENT = re.compile(r'[A-Za-z_$][\w$]*')
DECL = re.compile(r'^(?:export\s+)?(?:async\s+)?(function\*?|class|const|let|var)\s+(.*)')
WIN = re.compile(r'^window\.([A-Za-z_$][\w$]*)\s*=')
JS_KW = set('if for while return new typeof else var let const function class true false null undefined this in of do case switch break continue throw try catch finally void delete await async yield default export import from as get set static super Math Object Array JSON Number String Date Map Set'.split())

def files():
    order = [l.strip() for l in open(os.path.join(SRC, 'ORDER')) if l.strip()]
    out = list(order)
    td = os.path.join(SRC, 'test')
    if os.path.isdir(td):
        out += ['test/' + f for f in sorted(os.listdir(td)) if f.endswith('.js')]
    return out

def declarators(rest):
    """names declared by the rest of a `const|let|var` line: a=..,b=..,{c,d}=..,[e,f]=.. (first line only)"""
    names, depth, i, n, expect = [], 0, 0, len(rest), True
    while i < n:
        ch = rest[i]
        if ch in '"\'`':                     # skip string
            q = ch; i += 1
            while i < n and rest[i] != q:
                i += 2 if rest[i] == '\\' else 1
        elif ch == '/' and rest[i:i+2] == '//': break
        elif ch in '([{':
            if expect and ch in '[{':        # destructuring pattern: take identifiers inside
                j, d = i, 0
                while j < n:
                    if rest[j] in '[{': d += 1
                    elif rest[j] in ']}':
                        d -= 1
                        if d == 0: break
                    j += 1
                inner = re.sub(r':\s*[A-Za-z_$][\w$]*(?=\s*[,}\]=])', '', rest[i+1:j])  # keep alias target only
                inner = re.sub(r'=[^,}\]]*', '', inner)
                names += [m for m in IDENT.findall(inner) if m not in JS_KW]
                i = j; expect = False
            else: depth += 1
        elif ch in ')]}': depth -= 1
        elif ch == ';' and depth <= 0: break
        elif ch == ',' and depth == 0: expect = True
        elif expect and (ch.isalpha() or ch in '_$'):
            m = IDENT.match(rest, i); names.append(m.group(0)); i = m.end() - 1; expect = False
        i += 1
    return names

def purpose(path, lines):
    txt = ' '.join(lines[:6]) if path.endswith('.js') else ''
    if path.endswith('.html'):
        return {'00_page.html': 'all CSS, HUD/menu/touch HTML markup', '02_data_json.html': 'DATA: importmap, Frankfurt/Athens JSON, module script open'}.get(os.path.basename(path), 'html fragment')
    m = re.search(r'^\s*(?://\s*)?(?:/\*)?\s*(?:={3,}|-{3,})?\s*(.*)', lines[0]) if lines else None
    first = re.sub(r'^[\s/*=\-#]+|[\s=\-]+$', '', lines[0]) if lines else ''
    # join the first comment lines (the header is often 2-4 lines)
    buf = []
    for l in lines[:4]:
        if l.lstrip().startswith('//'): buf.append(re.sub(r'^\s*//\s*[=\-]*\s*', '', l).strip())
        else: break
    s = ' '.join(buf) if buf else first
    s = re.sub(r'\s+', ' ', s).strip(' =-')
    return s[:230] if s else '(no header comment)'

def map_purposes():
    out = {}
    try:
        for l in open(os.path.join(SRC, 'MAP.md'), encoding='utf8'):
            m = re.match(r'\|\s*`([^`]+)`\s*\|\s*[\d.]+\s*\|\s*(.*?)\s*\|[^|]*\|\s*$', l)
            if m: out[m.group(1)] = re.sub(r'[`*]', '', m.group(2))
    except OSError: pass
    return out

def main():
    mp = map_purposes()
    flist = files()
    defs = {}        # file -> [(name, line, kind)]
    texts = {}
    for f in flist:
        p = os.path.join(SRC, f)
        if not os.path.exists(p): continue
        raw = open(p, encoding='utf8', errors='replace').read()
        texts[f] = raw
        d = []
        if f.endswith('.js'):
            for ln, line in enumerate(raw.split('\n'), 1):
                m = DECL.match(line)
                if m:
                    kind, rest = m.groups()
                    if kind.startswith('function') or kind == 'class':
                        mm = IDENT.match(rest.lstrip('*').strip())
                        if mm: d.append((mm.group(0), ln))
                    else:
                        for nm in declarators(rest): d.append((nm, ln))
                    continue
                m = WIN.match(line)
                if m: d.append((m.group(1), ln))
        defs[f] = d
    owners = collections.defaultdict(list)
    for f, d in defs.items():
        for nm, ln in d: owners[nm].append((f, ln))
    uniq = {nm: o[0][0] for nm, o in owners.items() if len({x[0] for x in o}) == 1 and len(nm) >= 3}
    num = {f: re.match(r'(?:test/)?([0-9a-z]+?)_', os.path.basename(f)) for f in flist}
    short = {f: (f.split('_')[0] if '_' in os.path.basename(f) else f) for f in flist}
    short = {f: ('t/' if f.startswith('test/') else '') + os.path.basename(f).split('_')[0] for f in flist}
    L = ['# MODULES.md — generated by tools/modmap.py (do not edit; `tools/build.sh` regenerates it)', '',
         'Start here. Find the module, then `tools/find.sh <symbol>` for exact lines, then Read only that range of the src/ file. Never open the built index.html / out/*.html.',
         'Cheap use: Read only the Index table below (first ~75 lines, ~3k tokens), then grep this file for a symbol; the per-file sections and reverse index are lookup tables, not reading.',
         'Format: sections list top-level declarations (column 0; exact lines via find.sh). `uses` = other modules whose globals this file references most (count). Order = execution order (src/ORDER).', '',
         '## Index', '', '| id | file | KB | purpose |', '|---|---|---|---|']
    sec = []
    for f in flist:
        if f not in texts: continue
        raw = texts[f]; kb = len(raw.encode('utf8')) / 1024
        pur = mp.get(f) or purpose(f, raw.split('\n')[:6])
        L.append(f'| {short[f]} | `{f}` | {kb:.0f} | {pur[:160].replace("|", "/")} |')
        cnt = collections.Counter()
        if f.endswith('.js'):
            mine = {nm for nm, _ in defs[f]}
            for tok in IDENT.findall(raw):
                o = uniq.get(tok)
                if o and o != f and tok not in mine: cnt[(o, tok)] += 1
        byfile = collections.Counter()
        for (o, tok), c in cnt.items(): byfile[o] += c
        uses = ', '.join(f'{short[o]}({c})' for o, c in byfile.most_common(10))
        top = ', '.join(t for (o, t), c in cnt.most_common(0))
        names = ' '.join(nm for nm, ln in defs[f])
        sec += [f'## {f} — {kb:.0f} KB', f'defines: {names or "(data / markup, no top-level declarations)"}', f'uses: {uses or "-"}', '']
    L += [''] + sec
    L += ['## Reverse index (symbol → file id; `PRE_*` = every PRE_ symbol is in that file; `+` = defined in several files). Exact lines: tools/find.sh <symbol>', '']
    fam = collections.defaultdict(list)
    for nm, o in owners.items():
        m = re.match(r'([A-Za-z0-9]+_)', nm)
        if m and len(o) == 1: fam[(m.group(1), o[0][0])].append(nm)
    skip, items = set(), []
    for (pre, f), nms in fam.items():
        if len(nms) >= 4:
            skip.update(nms); items.append((pre + '*', f'{short[f]}'))
    for nm, o in owners.items():
        if nm in skip: continue
        items.append((nm, f'{short[o[0][0]]}' + ('+' if len(o) > 1 else '')))
    L.append(' '.join(f'{a}={b}' for a, b in sorted(items)))
    s = '\n'.join(L) + '\n'
    if '--check' in sys.argv:
        print(len(s)); return
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    open(OUT, 'w', encoding='utf8').write(s)
    print(f'MODMAP_OK docs/MODULES.md {len(s)/1024:.1f} KB, {len(owners)} symbols, {len(flist)} files')
main()
