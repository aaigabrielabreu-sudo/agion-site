/* ==========================================================
   /api/contempladas  (Vercel Function do site da Agion)
   Lê o catálogo da Todas Contempladas no servidor e entrega à página /contempladas.

   - A chave fica SÓ na Vercel, na variável AGION_CATALOG_API_KEY. Nunca vai para o navegador.
   - GET /api/contempladas              -> catálogo completo, em formato compacto
   - GET /api/contempladas?codigo=TC-…  -> reconsulta de uma carta (0 ou 1), sem cache
   - GET /api/contempladas?meta=1       -> só a versão e os horários da coleta

   Regras do contrato da Todas:
   - pagina até temMais=false, usando proximoOffset e a MESMA version;
   - 409 (CATALOG_CHANGED) ou falha em qualquer página -> recomeça; nunca publica catálogo parcial;
   - os valores já são o preço público final (não reaplicar margem);
   - revalida a cada 60 s; se a coleta falhar, entrega a última versão completa com o expiraEm
     original, e a página avisa que a disponibilidade precisa ser confirmada.
   ========================================================== */

export const config = { maxDuration: 60 };

const SRC = process.env.TODAS_AGION_CATALOG_URL || 'https://todascontempladas.com.br/api/integrations/agion/cards';
const LIMIT = 500;        // máximo por página no contrato
const CONC = 8;           // páginas buscadas ao mesmo tempo
const TRIES = 3;          // recomeços da coleta inteira
const FRESH_MS = 55000;   // dentro disso, reaproveita a versão montada nesta instância

let memo = null;          // { body, at }
let building = null;      // coleta em andamento (uma por instância)

class Changed extends Error {}

async function getJSON(url, key) {
  const r = await fetch(url, {
    headers: { Authorization: 'Bearer ' + key, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000)
  });
  if (r.status === 409) throw new Changed('CATALOG_CHANGED');
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

const pageURL = (offset, version) =>
  SRC + '?limit=' + LIMIT + '&offset=' + offset + (version ? '&version=' + encodeURIComponent(version) : '');

/* Coleta todas as páginas de uma mesma version. */
async function collect(key) {
  const first = await getJSON(pageURL(0, ''), key);
  const version = first.version;
  if (!version || !Array.isArray(first.cartas)) throw new Error('RESPOSTA_INVALIDA');
  const pages = [first];
  const pg = first.paginacao || {};

  if (pg.temMais) {
    // As páginas seguem offset + limit. Busca em paralelo e confere a corrente depois.
    const total = +pg.totalReferenciasNaColeta || 0;
    const offsets = [];
    if (pg.proximoOffset === LIMIT && total > LIMIT) for (let o = LIMIT; o < total; o += LIMIT) offsets.push(o);
    const got = new Array(offsets.length);
    let i = 0;
    await Promise.all(Array.from({ length: Math.min(CONC, offsets.length) }, async () => {
      while (i < offsets.length) {
        const n = i++;
        got[n] = await getJSON(pageURL(offsets[n], version), key);
      }
    }));
    pages.push(...got);

    // Corrente: cada página tem que apontar para a seguinte; se não fechar, segue o proximoOffset.
    let last = pages[pages.length - 1];
    for (let k = 0; k < pages.length - 1; k++) {
      const p = pages[k].paginacao || {};
      if (!p.temMais || p.proximoOffset !== (pages[k + 1].paginacao || {}).offset) {
        pages.length = k + 1; last = pages[k]; break;
      }
    }
    let guard = 0;
    while ((last.paginacao || {}).temMais) {
      if (++guard > 400) throw new Error('PAGINACAO_SEM_FIM');
      last = await getJSON(pageURL(last.paginacao.proximoOffset, version), key);
      pages.push(last);
    }
  }
  for (const p of pages) if (p.version !== version) throw new Changed('VERSION_MISMATCH');
  return pages;
}

/* Formato compacto: tabelas de tipos e administradoras + uma linha por carta. */
function pack(pages) {
  const first = pages[0];
  const tipos = [], adms = [], ti = new Map(), ai = new Map(), seen = new Set(), rows = [];
  const idx = (map, arr, v) => { v = String(v || '').trim(); if (!map.has(v)) { map.set(v, arr.length); arr.push(v); } return map.get(v); };
  for (const p of pages) {
    for (const c of p.cartas || []) {
      if (!c || !c.codigo || seen.has(c.codigo)) continue;
      seen.add(c.codigo);
      const par = c.parcelas || {};
      const et = [];
      for (const e of Array.isArray(par.etapas) ? par.etapas : []) {
        if (e && +e.quantidade > 0 && +e.valor > 0) et.push(+e.quantidade, +e.valor);
      }
      const row = [
        String(c.codigo).replace(/^TC-/, ''),
        idx(ti, tipos, c.tipo),
        idx(ai, adms, c.administradora),
        c.credito == null ? null : +c.credito,
        c.entrada == null ? null : +c.entrada,
        c.percentualEntrada == null ? null : +c.percentualEntrada,
        c.prazoMeses == null ? null : +c.prazoMeses,
        et,
        par.planoCompleto ? 1 : 0
      ];
      const v0 = par.valorInicial == null ? null : +par.valorInicial;
      if (v0 != null && v0 !== et[1]) row.push(v0);
      rows.push(row);
    }
  }
  return {
    formato: 'agion-tc-1',
    version: first.version,
    coletadoEm: first.coletadoEm || null,
    consultadoEm: first.consultadoEm || new Date().toISOString(),
    expiraEm: first.expiraEm || null,
    moeda: first.moeda || 'BRL',
    precificacao: first.precificacao || 'preco_publico_final_todas',
    politicaDisponibilidade: first.politicaDisponibilidade || '',
    colunas: ['codigo', 'tipo', 'administradora', 'credito', 'entrada', 'percentualEntrada', 'prazoMeses', 'etapas', 'planoCompleto', 'valorInicial'],
    tipos, administradoras: adms,
    total: rows.length,
    cartas: rows
  };
}

async function catalog(key) {
  if (memo && Date.now() - memo.at < FRESH_MS) return { body: memo.body, fresh: true };
  if (!building) {
    building = (async () => {
      let err;
      for (let t = 0; t < TRIES; t++) {
        try {
          const body = JSON.stringify(pack(await collect(key)));
          memo = { body, at: Date.now() };
          return memo;
        } catch (e) { err = e; if (!(e instanceof Changed) && t >= 1) break; }
      }
      throw err;
    })().finally(() => { building = null; });
  }
  try {
    const m = await building;
    return { body: m.body, fresh: true };
  } catch (e) {
    if (memo) return { body: memo.body, fresh: false };   // última versão completa, com o expiraEm original
    throw e;
  }
}

function send(res, status, cache, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', cache);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return send(res, 405, 'no-store', { erro: 'METODO_NAO_PERMITIDO' });
  }
  const key = process.env.AGION_CATALOG_API_KEY;
  if (!key) return send(res, 503, 'no-store', { erro: 'CATALOGO_NAO_CONFIGURADO' });

  const url = new URL(req.url, 'http://x');
  const codigo = url.searchParams.get('codigo');

  /* Reconsulta de uma carta antes de abrir a Alice */
  if (codigo != null) {
    if (!/^TC-[A-Za-z0-9]{4,40}$/.test(codigo)) return send(res, 400, 'no-store', { erro: 'CODIGO_INVALIDO' });
    try {
      const j = await getJSON(SRC + '?codigo=' + encodeURIComponent(codigo), key);
      const body = pack([{ ...j, cartas: (j.cartas || []).filter(c => c && c.codigo === codigo) }]);
      return send(res, 200, 'no-store', body);
    } catch (e) {
      return send(res, 502, 'no-store', { erro: 'CONSULTA_INDISPONIVEL' });
    }
  }

  /* Só a versão da coleta (a página confere a cada minuto, sem baixar o catálogo) */
  if (url.searchParams.get('meta') != null) {
    try {
      const j = await getJSON(SRC + '?limit=1', key);
      const { version = null, coletadoEm = null, consultadoEm = null, expiraEm = null } = j;
      return send(res, 200, 'public, s-maxage=20, stale-while-revalidate=40', { version, coletadoEm, consultadoEm, expiraEm });
    } catch (e) {
      return send(res, 502, 'no-store', { erro: 'CATALOGO_INDISPONIVEL' });
    }
  }

  /* Catálogo completo (?v=<version> só muda a chave de cache da CDN quando a coleta muda) */
  try {
    const r = await catalog(key);
    return send(res, 200, r.fresh ? 'public, s-maxage=60, stale-while-revalidate=86400' : 'public, s-maxage=10', r.body);
  } catch (e) {
    return send(res, 502, 'no-store', { erro: 'CATALOGO_INDISPONIVEL' });
  }
}
