#!/usr/bin/env python3
"""
Gera a plataforma principal a partir da v1.

TROCA FINAL (OK do Gabriel, 19/out/2026): /plataforma passou a ser a v2.
  - plataforma-v1.html  = código-fonte da plataforma (a "versão anterior", em /plataforma-v1).
                          É AQUI que se edita a lógica da plataforma (login, dados, módulos).
  - plataforma.html     = GERADO (v1 + casca plat2-shell + visual v4 plat2-v4.js). /plataforma e /app.
  - plataformav2.html   = GERADO, igual ao plataforma.html (o endereço /plataformav2 continua valendo).

Rodar sempre que a v1 ou os plat2-* mudarem, antes de publicar:
    python3 tools/build-v2.py
"""
import os, sys, json, hashlib, datetime

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V1 = os.path.join(RAIZ, 'plataforma-v1.html')
SAIDAS = [os.path.join(RAIZ, 'plataforma.html'), os.path.join(RAIZ, 'plataformav2.html')]

# versões dos arquivos da casca (subir a cada mudança)
SHELL_CSS = '/plat2-shell.css?v=2'
SHELL_JS = '/plat2-shell.js?v=4'
V4_JS = '/plat2-v4.js?v=23'   # visual v4 (Chat A) por cima da v1; ?v1=1 na URL desliga

src = open(V1, encoding='utf-8').read()

def unico(s, alvo, novo, primeira=True):
    i = s.find(alvo) if primeira else s.rfind(alvo)
    if i < 0:
        sys.exit('não achei: ' + alvo)
    return s[:i] + novo + s[i + len(alvo):]

out = src
# 0) aviso logo depois do <!DOCTYPE> (antes dele quebraria o modo padrão do navegador)
out = unico(out, '<!DOCTYPE html>', '<!DOCTYPE html>\n<!-- GERADO por tools/build-v2.py a partir de plataforma-v1.html — NÃO EDITAR À MÃO (edite plataforma-v1.html ou os plat2-*) -->')
# 1) título + noindex (só a v2)
out = unico(out, '<title>Agion — Plataforma de Planejamento Financeiro</title>',
            '<title>Agion Wealth — Plataforma</title>\n<meta name="robots" content="noindex,nofollow">')
# 2) CSS da casca: antes do PRIMEIRO </head> (o do documento; há outro dentro de uma string JS mais abaixo)
out = unico(out, '</head>', '<link rel="stylesheet" href="%s">\n</head>' % SHELL_CSS)
# 3) JS da casca: antes do ÚLTIMO </body> (o do documento)
out = unico(out, '</body>', '<script src="%s"></script>\n<script src="%s"></script>\n</body>' % (SHELL_JS, V4_JS), primeira=False)

# 4) ícone do app (fundo branco com a logo, 19/out)
out = unico(out, '<link rel="apple-touch-icon" sizes="180x180" href="/agion-icon-180.png">',
            '<link rel="apple-touch-icon" sizes="180x180" href="/agion-app-180.png?v=3">\n<link rel="icon" type="image/png" sizes="192x192" href="/agion-app-192.png?v=3">')

# 5) VERSÃO DO BUILD (atualização automática do app, 19/out): hash de tudo o que compõe a plataforma.
#    O plat2-shell.js compara a versão carregada com /plataforma-versao.json e recarrega sozinho quando muda.
h = hashlib.sha1(out.encode('utf-8'))
for f in ['plat2-v4.html', 'plat2-v4.js', 'plat2-shell.js', 'plat2-shell.css', 'plat2-tour.js', 'plat-tour.css']:
    fp = os.path.join(RAIZ, f)
    if os.path.exists(fp):
        h.update(open(fp, 'rb').read())
_pasta = os.path.join(RAIZ, 'plat2-v4')
if os.path.isdir(_pasta):
    for _r, _ds, _fs in sorted(os.walk(_pasta)):
        _ds.sort()
        for _f in sorted(_fs):
            h.update(_f.encode()); h.update(open(os.path.join(_r, _f), 'rb').read())
VERSAO = h.hexdigest()[:12]
out = unico(out, '</head>', '<meta name="agion-build" content="%s">\n</head>' % VERSAO)
open(os.path.join(RAIZ, 'plataforma-versao.json'), 'w', encoding='utf-8').write(
    json.dumps({'v': VERSAO, 'em': datetime.datetime.now().isoformat(timespec='seconds')}) + '\n')
print('versão do build:', VERSAO)

for dst in SAIDAS:
    open(dst, 'w', encoding='utf-8').write(out)
    print('ok:', os.path.basename(dst), len(out) // 1024, 'KB')
