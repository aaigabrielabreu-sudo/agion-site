#!/usr/bin/env python3
"""
Gera plataformav2.html a partir de plataforma.html SEM tocar na v1.

Regra (Gabriel, 18/out/2026): a /plataforma atual não é alterada até a troca final.
A v2 é a mesma plataforma (mesmo login, dados, módulos, regras de acesso) + a casca
nova (plat2-shell.css / plat2-shell.js) e, aos poucos, o visual novo de cada aba.

Rodar sempre que a v1 mudar, antes de publicar a v2:
    python3 tools/build-v2.py
"""
import os, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V1 = os.path.join(RAIZ, 'plataforma.html')
V2 = os.path.join(RAIZ, 'plataformav2.html')

# versões dos arquivos da casca (subir a cada mudança)
SHELL_CSS = '/plat2-shell.css?v=1'
SHELL_JS = '/plat2-shell.js?v=2'
V4_JS = '/plat2-v4.js?v=1'   # visual v4 (Chat A) por cima da v1; ?v1=1 na URL desliga

src = open(V1, encoding='utf-8').read()

def unico(s, alvo, novo, primeira=True):
    i = s.find(alvo) if primeira else s.rfind(alvo)
    if i < 0:
        sys.exit('não achei: ' + alvo)
    return s[:i] + novo + s[i + len(alvo):]

out = src
# 0) aviso logo depois do <!DOCTYPE> (antes dele quebraria o modo padrão do navegador)
out = unico(out, '<!DOCTYPE html>', '<!DOCTYPE html>\n<!-- GERADO por tools/build-v2.py a partir de plataforma.html — NÃO EDITAR À MÃO (edite a v1 ou os plat2-*) -->')
# 1) título + noindex (só a v2)
out = unico(out, '<title>Agion — Plataforma de Planejamento Financeiro</title>',
            '<title>Agion — Plataforma v2 (prévia)</title>\n<meta name="robots" content="noindex,nofollow">')
# 2) CSS da casca: antes do PRIMEIRO </head> (o do documento; há outro dentro de uma string JS mais abaixo)
out = unico(out, '</head>', '<link rel="stylesheet" href="%s">\n</head>' % SHELL_CSS)
# 3) JS da casca: antes do ÚLTIMO </body> (o do documento)
out = unico(out, '</body>', '<script src="%s"></script>\n<script src="%s"></script>\n</body>' % (SHELL_JS, V4_JS), primeira=False)

open(V2, 'w', encoding='utf-8').write(out)
print('ok: plataformav2.html', len(out) // 1024, 'KB')
