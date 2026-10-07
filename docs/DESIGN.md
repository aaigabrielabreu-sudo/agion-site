---
name: agion-wealth-design-system
description: Inventário visual, sistema normativo (tokens, superfícies, componentes), especificação de motion e backlog priorizado de melhorias para a plataforma Agion Wealth (plataforma.html, plat-comissoes.js, root-vars.css).
---

# Agion Wealth — Sistema de Design

Documento de referência para quem toca o CSS da plataforma. Está dividido em quatro partes: **(1)** o que existe hoje e onde desvia; **(2)** o sistema que passa a valer (normativo); **(3)** motion; **(4)** backlog de melhorias com prioridade.

Arquivos analisados (somente leitura):

- `plataforma.html` — CSS principal (l. 35–590), CSS do modo app (l. 773–1264), CSS injetado em JS (`convCSS`, l. 2116–2160), modal de Propostas (l. 3740–3785) e JS de render.
- `plat-comissoes.js` — módulo de comissões; CSS na string `CSS` (l. 130–254).
- `root-vars.css` — cópia das variáveis `:root` e `body.light`.

Referências a linhas são do estado atual dos arquivos.

---

## 1. Inventário do que existe hoje

### 1.1 Tokens reais encontrados

#### Cor (`:root`, plataforma.html l. 39–48 e root-vars.css l. 1–10)

| Token | Valor (escuro) | Valor (claro, `body.light`) | Papel observado |
|---|---|---|---|
| `--bg` | `#0B2A26` | `#FAFDFC` | fundo da página |
| `--bg2` | `#0E322D` | `#F1F7F4` | fundo secundário (capa print, ptr) |
| `--card` | `#103A32` | `#E8F2EC` | base dos gradientes de card |
| `--card2` | `#144238` | `#E1EDE6` | topo dos gradientes de card |
| `--card3` | `#184C40` | `#D7E7DF` | cards "premium" (opcard, j-goal, ostep, cms-fx-tot) |
| `--teal` | `#8FD9CC` | `#0E4A41` | acento secundário, texto "cópia"/info |
| `--teal-ink` | `#0A2026` | `#ffffff` | texto sobre dourado |
| `--gold` | `#C5A059` | `#8F6F2C` | acento primário |
| `--gold2` | `#E8CC8B` | `#725421` | dourado claro (títulos de painel, ativo) |
| `--grad-gold` | `115deg #A8853E → #E8CC8B 45% → #C5A059 85%` | idem | botão primário, FAB, aba ativa, flash |
| `--grad-hero` | `100deg #8FD9CC → #E8CC8B 50% → #C5A059` | idem | texto-gradiente de KPI, barra de progresso |
| `--ink` | `#DCE9E7` | `#0B100E` | texto corrido |
| `--muted` | `#9DB5B1` | `#333C39` | texto secundário |
| `--soft` | `#6E8B88` | `#5A6763` | texto terciário, meta |
| `--head` | `#F2FAF8` | `#050B09` | títulos e valores |
| `--line` | `rgba(143,217,204,.16)` | `rgba(14,74,65,.32)` | borda padrão |
| `--line-gold` | `rgba(197,160,89,.28)` | `rgba(143,111,44,.42)` | borda de destaque |
| `--ok` / `--warn` / `--bad` | `#34d399` / `#fbbf24` / `#f87171` | iguais | semânticas (pouco usadas; ver 1.2) |

Há ainda um terceiro tema implícito em `@media print` (l. 566) que redefine 13 variáveis com hex próprios (`#1c3338`, `#cfe0da`, `#cdb98a`, `#1A535C`…).

#### Tipografia

- Famílias: `--display: 'Cinzel'` (600/700), `--serif: 'Lora'` (500/600/700), `--sans: 'DM Sans'` (400–700) — carregadas na l. 29.
- **Segundo carregamento de fontes** na l. 3741: Lora (400–700, itálico) + **Poppins** (400–700). Poppins é usada só no modal de Propostas (`font-family:'Poppins'`, l. 3743) — família fora do sistema.
- Tamanhos em uso (rem, só no CSS principal): `.5 .52 .56 .58 .6 .62 .64 .66 .68 .7 .72 .74 .76 .78 .8 .82 .84 .85 .87 .88 .9 .92 .95 .98 1 1.02 1.05 1.06 1.08 1.1 1.12 1.15 1.18 1.2 1.24 1.3 1.35 1.4 1.5 1.55 1.6 1.7 1.9 2` — **44 tamanhos distintos**. Em `convCSS` há mistura com px (`13px 14px 12.5px 11px 10px`, l. 2120–2158), e inline `12px`, `13px`, `42px`.
- Pesos: 400, 500, 600, 700, 800 (800 em 19 ocorrências: avatares, badges, `.optag`, `.tk-cb`, `.navdot`, `.bell3`, `.cfgDot`).
- Letter-spacing em uppercase: `.05em .06em .07em .08em .1em .12em .18em .2em .24em` + valores em px (`.3px .1px .2px .4px 1.4px`).

#### Raios (`border-radius`, ocorrências no plataforma.html)

`50%`(23) `16px`(22) `12px`(22) `10px`(15) `999px`(13) `9px`(10) `18px`(9) `11px`(8) `8px`(7) `14px`(7) `20px`(6) `13px`(6) `15px`(5) `99px`(4) `5px`(4) `6px`(3) `3px`(3) `7px`(2) `4px`(2) `2px` `26px` `24px 24px 0 0` `4px 14px 14px 14px` — **22 valores distintos** para o mesmo papel (contêiner). `999px` e `99px` coexistem para "pílula".

#### Sombras

18 sombras distintas. As mais relevantes:

| Uso | Valor | Linha |
|---|---|---|
| login / modal / notif | `0 30px 90px rgba(0,0,0,.55)` · `0 30px 80px rgba(0,0,0,.6)` | 138, 452, 499 |
| modal propostas | `0 34px 90px rgba(0,0,0,.55)` | 3743 |
| panel hover | `0 10px 34px rgba(0,0,0,.20)` | 206 |
| kpi hover | `0 8px 22px rgba(0,0,0,.16)` | 208 |
| lead hover | `0 6px 18px rgba(0,0,0,.18)` | 210 |
| opcard hover | `0 14px 34px rgba(0,0,0,.32)` | 223 |
| btn-gold hover (glow) | `0 0 28px rgba(197,160,89,.4)` | 121 |
| fab | `0 12px 30px rgba(197,160,89,.45)` | 439 |
| flash | `0 12px 30px rgba(0,0,0,.4)` | 392 |
| wa-pop | `0 8px 30px rgba(0,0,0,.5)` | 2151 |
| botões propostas | `0 8px 20px rgba(166,133,63,.35)` / `0 6px 16px rgba(166,133,63,.3)` | 3767, 3832 |

#### Espaçamento

`gap` em px: `3 4 5 6 7 8 9 10 11 12 14 16 18 20` — os ímpares `5 7 9 11 13` aparecem 30+ vezes (`gap:9px` ×9, `gap:11px` ×9, `gap:7px` ×9). Paddings de contêiner: `20px` (kpi, ccard), `clamp(16px,2.2vw,24px)` (panel), `16px` (opcard, intg), `12px` (lead, kcol), `16px 18px` (cms-card), `15px 18px` (j-goal), `13px 16px` (banner, disclaimer), `22px 20px 18px` (actcard), `28px` (modal), `42px` (login). 513 atributos `style=""` inline no HTML/JS.

#### Durações de transição

`.12s .15s .16s .18s .2s .22s .25s .26s .28s .3s .35s` — 11 durações; a maioria sem curva declarada (`transition:.2s`, `transition:.22s`, `transition:.15s`). Curvas presentes: `ease` (default implícito), `cubic-bezier(.32,.72,0,1)` (appSheet, l. 826), `cubic-bezier(.22,.9,.3,1)` (agIn, l. 1177), `cubic-bezier(.34,1.56,.64,1)` (agPop, l. 1188). Keyframes: `fadeIn`, `pageIn`, `shimmer`, `appSheet`, `agIn`, `agPop`, `ptrSpin`, `navPulse`. **Nenhuma regra `prefers-reduced-motion`** em nenhum arquivo.

### 1.2 Inconsistências detectadas

Agrupadas por tipo. Cada item tem seletor/linha para localizar.

#### A. Regras duplicadas que se sobrescrevem (bugs silenciosos)

1. **`.panel` perde a transição de sombra.** L. 205 declara `transition:box-shadow .25s ease, border-color .25s ease`; l. 397 redeclara `.panel{transition:border-color .2s}` e vence pela cascata. Resultado: o `box-shadow` do hover (l. 206) **aparece sem animação**.
2. **`.kpi` declarado 3 vezes** com transições conflitantes: l. 176 (base), l. 207 (`transform .18s ease, box-shadow .18s ease`), l. 395 (`transform .22s, border-color .22s`). A última vence: o `box-shadow` do hover da l. 208 também salta sem animar.
3. **`.btn` perde animação de cor/fundo.** L. 119 `transition:.22s`; l. 214 `transition:transform .12s ease, filter .12s ease` sobrescreve. `.btn-teal:hover` e `.btn-ghost:hover` (mudam `background`/`border-color`) agora trocam instantaneamente.
4. **`.prob` declarado 2 vezes** (l. 211 `padding:7px 14px`, sem font-size; l. 216 `padding:8px 18px;font-size:.92rem`). Mobile (l. 554) volta a `7px 14px`.
5. **`.lead` declarado em 4 pontos** (l. 209, 318–326, 331, 487) e sobreposto por `style` inline em `leadCard()` (l. 2454–2455) com gradiente, borda-esquerda 4px e sombra calculados em JS — o card de lead não obedece ao `--card/--card2`.

#### B. Hex cru fora das variáveis (mesma cor, nome diferente)

| Onde | Hex | Equivale a | Linha |
|---|---|---|---|
| `.tbl-scroll thead th` | `#103A32` | `--card` | 264 |
| `.av` | `#0A2026` | `--teal-ink` | 271 |
| `.tt-Consultoria` | `#E8CC8B` / `rgba(232,204,139,…)` | `--gold2` | 342 |
| `input[type=range]::-moz-range-thumb` | `#C5A059` | `--gold` | 445 |
| `.btn-teal` | `#BFEAE2` | sem token (entre `--teal` e `--head`) | 122 |
| `.banner` | `#E8E0CC` | sem token | 219 |
| `.viewbar` | `#6d531f → #8a6c2c` | dourado escurecido sem token | 480 |
| `.notif h4 .nlet` | `#062521` | sem token | 466 |
| `.mobnav` (app), `.navdot` border | `#08161B` | sem token (sidebar usa `rgba(8,22,27,.85)`) | 794, 1156 |
| `.navdot` | `#E0574F` | 4.º vermelho | 1154 |
| `.lead .acts .aGanho / .aPerdeu` | `#4CAF7D` / `#E4636A` | 2.º verde / 2.º vermelho | 1030, 1032 |
| `.cms-tag.ok/.warn/.bad` | `#4CAF7D` / `#E0B978` / `#E07A6A` | 2.º verde / 2.º âmbar / 3.º vermelho | comissoes l. 142–144 |
| `.post .pacts button.liked` | `#f87171` | `--bad` (uso: "curtir") | 283 |
| Propostas: erro | `#B4532F` | 5.º vermelho | 3815, 3835 |
| `convCSS` inteiro | `rgba(255,255,255,.04–.14)`, `#10201d`, `#0f1c1a`, `#08201c`, `rgba(212,175,55,…)`, `#c9a24a → #e6c76e` | borda/fundo/dourado **paralelos** ao sistema (dois dourados diferentes do `--gold`) | 2117–2158 |
| Modal Propostas inteiro | `#FBFAF6 #FBF6EC #E7DEC9 #12463D #A6853F #6E8078 #3E8E9C` | paleta clara própria, não deriva de `body.light` | 3743–3832 |
| Chart.js (vários) | `#C5A059 #9DB5B1 #8FD9CC #4Fa3a3 #B0875F #7FB0A9 #1F9E8B #5C86A8` | cores hardcoded nos datasets (Chart não lê `var()`) | 1506–1510, 1586, 1894, 2668, 3111, 3554–3564 |

O módulo de comissões já tem a solução certa para o último caso: lê a variável do tema via `getComputedStyle` e deriva rgba (`plat-comissoes.js` l. 346). A plataforma principal não usa esse helper.

#### C. Cores semânticas: 4 verdes, 5 vermelhos, 3 âmbares

- Verde: `--ok #34d399` (Tailwind emerald), `#4CAF7D` (cms-tag.ok, aGanho, score ≥70), `#25D366` (WhatsApp, legítimo como cor de marca), `#1F9E8B` (sino Clientes).
- Vermelho: `--bad #f87171` (Tailwind red), `#E4636A` (aPerdeu), `#E07A6A` (cms-tag.bad), `#E0574F` (navdot), `#B4532F` (erro Propostas).
- Âmbar: `--warn #fbbf24` (Tailwind amber), `#E0B978` (cms-tag.warn), `--gold` usado como "médio" no score (l. 2437).

`--ok/--warn/--bad` são saturados demais para o fundo petróleo e destoam da paleta terrosa; na prática o código os evita e cria variantes locais.

#### D. Chip/tag/pílula: 9 estilos para o mesmo papel

| Classe | font-size | padding | peso | raio | borda | Linha |
|---|---|---|---|---|---|---|
| `.chip` | .66rem | 5px 11px | 700 | 999 | `--line-gold` | 129 |
| `.tag` + `-main/-copy` | .62rem | 4px 9px | 700 | 999 | gold / teal | 192–194 |
| `.ttype` + `tt-*` | .62rem | 3px 8px | 700 | 999 | gold / teal / gold2 | 339–342 |
| `.ttype` inline (leadCard) | .6rem | 3px 8px | 700 | 999 | cor da categoria `${cor}66` | 1023, 2455 |
| `.optag` | .6rem | 3px 9px | **800** | 999 | `--line-gold` | 226 |
| `.lead-src` | .6rem | 2px 7px | 800 | **5px** | — | 311 |
| `.cms-tag` | .62rem | 3px 9px | 700 | 999 | `--line` + 5 variantes | comissoes 141–146 |
| `.cms-pill` | .6rem | 2px 7px | 700 | 999 | `--line` (é botão) | comissoes 168 |
| Propostas (inline) | .64rem | 3px 10px | 700 | **20px** | `${cor}44` | 3830 |

Além de `.prob` (pílula grande, l. 211/216) e `.subnav button` / `.cms-tabs button` / `.chat-side .ch` (pílulas-aba com três estilos de "ativo": gold translúcido, `--grad-gold`, gold translúcido).

#### E. Superfícies: 8 "fundos de card" diferentes

| Fundo | Usado por | Linha |
|---|---|---|
| `linear-gradient(165deg,var(--card2),var(--card))` | `.kpi .panel .ccard .gsum div .cms-card .cms-kt .cms-ag-day` | 176, 181, 187, 419 |
| `linear-gradient(160deg,var(--card2),var(--card))` | `.lead .task .login .modal .notif` | 138, 331, 343, 452, 499 |
| `linear-gradient(160deg,var(--card3),var(--card2))` | `.opcard .j-goal .ostep` | 222, 356, 373 |
| `var(--card2)` sólido | `.actcard .msg .mbubble .cms-bar select` | 475, 297 |
| `rgba(10,28,34,.5)` / `.4` / `.45` / `.6` | `.kcol .chat-side .j-step .coment .cb .tabs input` | 142, 286, 290, 315, 362 |
| `rgba(6,20,25,.55)` | inputs no app | 837 |
| `rgba(0,0,0,.14)` | `.cms-sum>div .cms-tl .st .cms-fx-chart .cms-fxs .wa` | comissoes 158, 163, 223, 242; 2117 |
| `rgba(255,255,255,.03–.09)` | `.cms-tabs button .cms-tag .wa-*` | comissoes 141, 172; 2120–2147 |

Não há regra de quando usar `--card`, `--card2` ou `--card3`: `card3` aparece em "oportunidades" e "metas" (premium), mas também em `.cms-fx-tot`; `card2` sólido só em `.actcard`.

#### F. Tabela vs. cards para o mesmo tipo de dado

- "Carteira de clientes" no dashboard é `<table>` (l. 3660); comissões por funcionário é lista de `.cms-card` com `.cms-sum` em grade; leads são kanban `.lead`; "Perdidos" é `.row` com `border-bottom` inline (l. 2387). Quatro layouts de lista para registros tabulares.
- Densidade de tabela varia: `th,td{padding:9px 10px}` (l. 198) · `.cms-tbl td{padding:10px 12px}` (comissoes 138) · app `12px` (l. 860) · relatório PDF `7px 9px` (l. 3678). `th` letter-spacing `.05em` vs `.06em`.
- No mobile a tabela vira `display:block` com `white-space:nowrap` (l. 527), e o `thead` sticky (l. 264) usa `#103A32` cru.

#### G. Bordas: 1px vs 1.5px

Escuro usa `1px` em quase tudo e `1.5px` em inputs (l. 132), `.tk-cb` (l. 346), `.bell3` (l. 461). Claro usa `1.5px` em tudo (l. 56–93) e adiciona `border-left/top:4px solid #0E4A41` em `.panel .kpi .ccard .lead` (l. 96–99) — o tema claro é um fork visual, não uma troca de tokens.

#### H. Estados

- **Focus:** `:focus-visible` dourado existe (l. 404) mas só para `.btn, a, input, select, textarea`. Ficam sem anel: `.subnav button`, `.tabs button`, `.lead .acts button`, `.ldEdit`, `.wa-cico`, `.wa-send`, `.cms-pill`, `.cms-tabs button`, `.cfgSw`, `.bell`, `.fab`, `.month-nav button`. Inputs têm **dois anéis** (box-shadow da l. 133 + outline da l. 404).
- **Disabled:** nenhuma regra `:disabled` / `[aria-disabled]`. `.locked` usa `opacity:.55` (l. 241); `.task.done` idem.
- **Pressed:** `.btn:active{scale(.97)}` (l. 215); no app `.985` (l. 1184) e `.94` (fab, l. 902) — três escalas.
- **Hover em cards:** `translateY(-1px)` lead, `-2px` kpi/ostep/ometa/cms-kt, `-3px` ccard/opcard. Três alturas.

#### I. Motion

- `.content{animation:pageIn .35s}` (l. 398) roda só no primeiro mount; `render()` troca `innerHTML` (l. 2295) sem reanimar — a troca de página é um corte seco no desktop.
- `.navdot` pulsa **infinitamente** (l. 1156); `shimmer` infinito; nenhum respeita `prefers-reduced-motion`.
- `.flash` anima `bottom` (l. 393), propriedade de layout; sem `role="status"`; some em 2,2 s fixos (l. 1452) sem pausa em hover.
- Modal desktop (`.modal-bg`, l. 498) aparece sem transição; só o bottom-sheet do app tem `appSheet`.
- Acordeões (`.leadObs`, `.cms-ag-f`, `.cms-org tr.cms-grp`) alternam `max-height`/display sem transição.

#### J. Tipografia de rótulos

- Uppercase com tracking é usado em 14 contextos (`.chip .tag .ttype .optag th .kcol h4 .crumb .olabel .notif h4 .login .tg .side .brand span .cms-sum .l .cms-fx-tot .m`) com 9 trackings diferentes.
- Títulos de painel: `.panel h2` é Lora `1.08rem` **dourado** (`--gold2`), `.ccard h3` é Lora `1.08rem` **branco** (`--head`), `.diffbox h3` dourado, `.modal h3` branco `1.2rem`, `.cms-head .who h3` branco `1.02rem`. Não há regra de quando o título é dourado.
- `.kpi b` 1.55rem · `.cms-kt .v` 1.45rem · `.cms-wrap .kpi b` 1.35rem · `.cms-head .amt b` 1.3rem · `.netrow.tot b` 1.3rem · `.cms-fx-tot .big` 1.7rem — seis tamanhos para "valor em destaque".

---

## 2. Sistema proposto (normativo)

Princípio: **a paleta já é boa — verde-petróleo profundo, dourado envelhecido, Lora para números.** O que falta é disciplina. Nada abaixo muda a identidade; muda a quantidade de variantes.

Todos os tokens novos ficam em `:root` e `body.light` em **`root-vars.css`**, que passa a ser a fonte de verdade (o `<style>` da plataforma importa/replica, nunca adiciona). Nomenclatura: `--{categoria}-{papel}[-{variante}]`.

### 2.1 Tipografia

Três famílias, papéis fixos. Cinzel só em marca. Lora em títulos e **números de dinheiro**. DM Sans em tudo que é interface. Poppins sai.

```css
:root{
  --font-display:'Cinzel',serif;          /* marca: logo, capa de PDF. Nunca em UI corrente */
  --font-serif:'Lora',Georgia,serif;      /* títulos h1–h3, valores monetários, nomes próprios em destaque */
  --font-sans:'DM Sans',-apple-system,system-ui,sans-serif;

  /* escala 1.2 (terça menor) a partir de 14px; valores em rem */
  --fs-2xs:.625rem;  /* 10px  chips, badges numéricos */
  --fs-xs:.75rem;    /* 12px  meta, th, rótulo de KPI */
  --fs-sm:.875rem;   /* 14px  corpo denso: tabela, lista, nota */
  --fs-md:1rem;      /* 16px  corpo padrão, input */
  --fs-lg:1.125rem;  /* 18px  título de painel (h2) */
  --fs-xl:1.375rem;  /* 22px  h1 da topbar, título de modal */
  --fs-2xl:1.75rem;  /* 28px  valor de KPI */
  --fs-3xl:2.25rem;  /* 36px  valor-herói (netrow.tot, cms-fx-tot .big) */

  --lh-tight:1.15; --lh-snug:1.3; --lh-normal:1.5; --lh-relaxed:1.6;
  --track-caps:.08em;   /* único tracking para uppercase */
  --track-brand:.2em;   /* só tagline da marca */
}
```

| Papel | Família | Tamanho | Peso | Cor | Observação |
|---|---|---|---|---|---|
| Marca (sidebar, login) | display | `--fs-xl` / `1.9rem` login | 700 | `--head` + grad-hero | único uso de Cinzel |
| H1 topbar | serif | `--fs-xl` | 600 | `--head` | |
| H2 painel | serif | `--fs-lg` | 600 | `--head` | **padrão branco**. Dourado (`--gold2`) só em painéis "premium" (`.panel.is-premium`, `.diffbox`) |
| H3 card | serif | `--fs-md` | 600 | `--head` | |
| Valor KPI | serif | `--fs-2xl` | 600 | `--head` ou grad-hero | `font-variant-numeric:tabular-nums` |
| Valor herói | serif | `--fs-3xl` | 600 | grad-hero | 1 por tela |
| Corpo | sans | `--fs-md` | 400 | `--ink` | |
| Corpo denso (tabela, lista) | sans | `--fs-sm` | 400/600 | `--ink` / `--head` | |
| Meta / secundário | sans | `--fs-xs` | 500 | `--muted` | |
| Rótulo uppercase (th, kpi .lab, chip) | sans | `--fs-xs` (chip: `--fs-2xs`) | 600 | `--muted` (th) · `--gold2` (chip gold) | `letter-spacing:var(--track-caps)` |
| Botão | sans | `--fs-sm` | 600 | — | peso 700 só no primário |

Regras:
- Peso **800 some**. Avatares e badges usam 700.
- Serif nunca abaixo de `--fs-md`; sans nunca abaixo de `--fs-2xs`.
- `--kpi b`, `.cms-kt .v`, `.cms-head .amt b`, `.cms-wrap .kpi b` convergem para `--fs-2xl`; `.netrow.tot b` e `.cms-fx-tot .big` para `--fs-3xl`.
- Dinheiro sempre `tabular-nums` (hoje só o módulo de comissões faz isso).

### 2.2 Espaçamento (grade de 4)

```css
:root{
  --sp-1:4px; --sp-2:8px; --sp-3:12px; --sp-4:16px; --sp-5:20px;
  --sp-6:24px; --sp-8:32px; --sp-10:40px; --sp-12:48px;
}
```

| Contexto | Token |
|---|---|
| gap dentro de chip/botão (ícone+texto) | `--sp-2` |
| gap entre chips, entre botões de toolbar | `--sp-2` |
| gap entre campos de formulário | `--sp-4` |
| padding de card compacto (lead, task, cms-sum) | `--sp-3` |
| padding de card padrão (kpi, ccard, cms-card) | `--sp-5` |
| padding de panel | `--sp-6` (desktop) · `--sp-4` (≤560px) |
| padding de modal | `--sp-8` (desktop) · `--sp-5` (app) |
| gap de grade de cards/KPIs | `--sp-4` |
| margem entre panels | `--sp-5` |
| padding de célula de tabela | ver 2.9 |

Valores `5 7 9 11 13 15 18 22 26 42` deixam de existir. `clamp()` continua permitido para padding de panel/content, mas entre tokens: `clamp(var(--sp-4),2.2vw,var(--sp-6))`.

### 2.3 Raios

Quatro raios + pílula. O raio diz o **nível** do contêiner, não o gosto do momento.

```css
:root{
  --r-sm:8px;    /* controles internos: botão sm, input, ícone-quadrado (.opic .ci .li .ldIco), célula de kanban */
  --r-md:12px;   /* cards compactos (.lead .task .j-step .cms-sum>div), botão padrão, tabs, select */
  --r-lg:16px;   /* cards padrão (.kpi .ccard .cms-card .intg .notif .diffbox .opcard .gsum) */
  --r-xl:20px;   /* panel, modal, login, bottom-sheet (topo) */
  --r-pill:999px;
}
```

Aninhamento: filho ≤ pai − 4px (card `--r-lg` dentro de panel `--r-xl`; input `--r-sm` dentro de card `--r-md`). Balão de chat: `--r-lg` com canto de origem `--r-sm` (`4px` hoje → `8px`).

### 2.4 Elevação / sombras

Quatro níveis. A sombra no tema escuro é **preta e difusa**; o dourado só aparece como brilho (glow) no primário.

```css
:root{
  --shadow-1:0 1px 2px rgba(0,0,0,.18);                                  /* repouso de card compacto, balão */
  --shadow-2:0 6px 18px rgba(0,0,0,.20);                                 /* hover de card, dropdown pequeno */
  --shadow-3:0 14px 34px rgba(0,0,0,.32);                                /* popover (.notif .wa-pop), FAB */
  --shadow-4:0 30px 80px rgba(0,0,0,.55);                                /* modal, login */
  --glow-gold:0 0 0 1px rgba(197,160,89,.25),0 8px 24px rgba(197,160,89,.28); /* btn primário hover, fab */
}
body.light{
  --shadow-1:0 1px 2px rgba(11,42,38,.06);
  --shadow-2:0 6px 18px rgba(11,42,38,.10);
  --shadow-3:0 14px 34px rgba(11,42,38,.16);
  --shadow-4:0 30px 80px rgba(11,42,38,.24);
}
```

Panels e KPIs em repouso **não têm sombra** (o gradiente + borda já separa do fundo); ganham `--shadow-2` no hover só se forem clicáveis.

### 2.5 Superfícies

Três níveis de superfície com papel definido. Os gradientes continuam (são parte da identidade), mas com **um ângulo** e **dois pares** fixos.

```css
:root{
  --surface-0:var(--bg);                                              /* página */
  --surface-1:linear-gradient(165deg,var(--card2),var(--card));       /* panel, kpi, ccard, modal, notif, login */
  --surface-2:rgba(10,28,34,.45);                                     /* rebaixo: kcol, chat-side, j-step, input, cms-sum, tabs track */
  --surface-3:linear-gradient(165deg,var(--card3),var(--card2));      /* premium/destaque: opcard, j-goal, ostep, cms-fx-tot, kpi.grad */
  --surface-overlay:rgba(4,12,14,.72);                                /* modal-bg */
}
body.light{
  --surface-1:linear-gradient(180deg,#EDF5F0,#E3EFE8);
  --surface-2:#F3F8F5;
  --surface-3:linear-gradient(180deg,#E3EFE8,#D7E7DF);
  --surface-overlay:rgba(11,42,38,.45);
}
```

| Superfície | Quando usar | Nunca em |
|---|---|---|
| `--surface-1` (card/card2) | qualquer contêiner que fica **sobre o fundo da página**: panel, kpi, ccard, modal, popover, card de lista | elementos dentro de outro card |
| `--surface-2` (rebaixo) | elementos **dentro** de um card que precisam parecer "cavados": coluna de kanban, trilho de tabs, input, sub-item de agenda, mini-stat | contêiner de topo |
| `--surface-3` (card3) | o **único** elemento de destaque da tela: total geral, oportunidade exclusiva, meta principal. Máximo 1–2 por view | listas, cards repetidos |

Elimina: `rgba(0,0,0,.14)`, `rgba(255,255,255,.03/.06/.09)`, `rgba(6,20,25,.55)`, `var(--card2)` sólido, ângulo `160deg`, `135deg` do `.diffbox` (vira `--surface-3` com a faixa dourada mantida).

### 2.6 Bordas

```css
:root{
  --border-w:1px;                 /* padrão. 1.5px só em controles de formulário e toggles */
  --line:rgba(143,217,204,.16);   /* mantém */
  --line-strong:rgba(143,217,204,.28);  /* hover de card neutro, thead */
  --line-gold:rgba(197,160,89,.28);     /* mantém: ativo, premium */
  --line-gold-strong:rgba(197,160,89,.45); /* hover de card premium, focus de card */
}
```

Tema claro: mantém `1.5px` nos inputs e `1px` em cards; as faixas `border-left/top:4px #0E4A41` (l. 96–99) **saem** — a borda verde `--line` já diferencia; a faixa só sobrevive em `.diffbox::before` (escuro e claro) como elemento de identidade.

### 2.7 Estados (regra geral para todo interativo)

```css
:root{
  --focus-ring:0 0 0 2px var(--bg),0 0 0 4px var(--gold);
  --state-hover:rgba(143,217,204,.06);     /* fundo de linha/nav em hover */
  --state-active:rgba(197,160,89,.12);     /* fundo de item selecionado (nav, tab, chat) */
  --state-pressed:.97;                     /* scale */
  --disabled-opacity:.45;
}
/* foco único, por teclado, para TUDO que é interativo */
:where(button,[role=button],a[href],input,select,textarea,summary,[tabindex]:not([tabindex="-1"])):focus-visible{
  outline:none;box-shadow:var(--focus-ring);
}
input:focus,select:focus,textarea:focus{border-color:var(--gold);box-shadow:none} /* remove anel duplo */
:where(button,input,select,textarea):disabled,[aria-disabled="true"]{
  opacity:var(--disabled-opacity);cursor:not-allowed;pointer-events:none;filter:saturate(.6);
}
```

| Estado | Card clicável | Botão | Linha de lista / nav | Chip-filtro |
|---|---|---|---|---|
| hover | `border-color:--line-strong` (ou `--line-gold-strong` se premium) + `translateY(-2px)` + `--shadow-2` | primário: `--glow-gold` + `translateY(-1px)`; ghost/teal: fundo `--state-hover`, borda `--gold` | fundo `--state-hover` | borda `--gold` |
| pressed | `scale(var(--state-pressed))`, sem translateY | idem | fundo `--state-active` | idem |
| selecionado | `border-color:--gold` + `box-shadow:inset 0 0 0 1px var(--gold)` (já em `.cms-kt.on`) | — | fundo `--state-active`, texto `--gold2`, borda `--line-gold` (já em `.navi a.on`) | fundo `--state-active`, texto `--gold2` |
| focus | `--focus-ring` | `--focus-ring` | `--focus-ring` | `--focus-ring` |
| disabled | sem hover; `--disabled-opacity` | idem | — | idem |

Uma só altura de hover (`-2px`), uma só escala de pressed (`.97`). `translateY` nunca junto de `scale` no mesmo elemento.

### 2.8 Cores semânticas (derivadas da paleta)

Substituem `--ok/--warn/--bad` (Tailwind) e todos os hex locais. Derivadas do verde-petróleo e do dourado: menos saturadas, mesma "temperatura" da marca. Cada uma tem texto, fundo translúcido e borda.

```css
:root{
  /* sucesso: o verde da marca, mais claro e vivo que --teal */
  --ok:#5CC9A0;        --ok-bg:rgba(92,201,160,.12);     --ok-line:rgba(92,201,160,.40);
  /* alerta: o próprio dourado da marca (já usado assim no score) */
  --warn:#E0B978;      --warn-bg:rgba(224,185,120,.12);  --warn-line:rgba(224,185,120,.40);
  /* erro: vermelho terroso, dessaturado para o fundo petróleo */
  --bad:#E07A6A;       --bad-bg:rgba(224,122,106,.12);   --bad-line:rgba(224,122,106,.40);
  /* info: o teal da marca */
  --info:var(--teal);  --info-bg:rgba(143,217,204,.10);  --info-line:rgba(143,217,204,.35);
  /* neutro */
  --neutral:var(--muted); --neutral-bg:rgba(255,255,255,.04); --neutral-line:var(--line);
  /* marca externa, exceção legítima */
  --brand-whatsapp:#25D366;
}
body.light{
  --ok:#1E7F5C;   --ok-bg:rgba(30,127,92,.10);   --ok-line:rgba(30,127,92,.35);
  --warn:#8F6F2C; --warn-bg:rgba(143,111,44,.10);--warn-line:rgba(143,111,44,.35);
  --bad:#B4532F;  --bad-bg:rgba(180,83,47,.10);  --bad-line:rgba(180,83,47,.35);
  --info:#0E4A41; --info-bg:rgba(14,74,65,.08);  --info-line:rgba(14,74,65,.30);
}
```

Contraste verificado contra `--card #103A32`: `#5CC9A0` ≈ 7.9:1, `#E0B978` ≈ 8.3:1, `#E07A6A` ≈ 5.6:1, `#8FD9CC` ≈ 9.4:1 — todos AA para texto normal. (Os valores `#4CAF7D`, `#E0B978`, `#E07A6A` já em uso em `cms-tag` são a base; só o verde sobe um pouco para separar de `--teal`.)

Uso: badge de contagem (`.bell .badge`, `.actbadge`, `.navdot`) → `--bad` sólido com texto `#fff` (único uso sólido). `liked` → `--bad` (ok, é coração). "Ganho/Perdeu" → `--ok`/`--bad` via chip. Score: `≥70 --ok`, `≥45 --warn`, `< --neutral`.

### 2.9 Densidade de tabelas

Uma tabela, dois modos.

```css
:root{ --tbl-pad-y:10px; --tbl-pad-x:12px; }
table{font-size:var(--fs-sm);font-variant-numeric:tabular-nums}
th,td{padding:var(--tbl-pad-y) var(--tbl-pad-x);border-bottom:1px solid var(--line);vertical-align:middle}
th{font-size:var(--fs-xs);font-weight:600;letter-spacing:var(--track-caps);text-transform:uppercase;color:var(--muted)}
thead th{position:sticky;top:0;background:var(--card);z-index:1}   /* substitui #103A32 */
tbody tr:hover td{background:var(--state-hover)}
td.r,th.r,td.n,th.n{text-align:right}                                /* unifica .r e .n */
tfoot td{border-top:1px solid var(--line-gold);font-weight:700;color:var(--head)}
.tbl-dense{--tbl-pad-y:6px;--tbl-pad-x:10px}                         /* relatórios, >12 linhas */
.tbl-scroll{border:1px solid var(--line);border-radius:var(--r-md);overflow:auto;max-height:440px}
```

`th` passa de dourado para `--muted`: o dourado volta a significar "ativo/destaque", não "cabeçalho". Quando usar tabela vs. cards: **tabela** para registros homogêneos com ≥3 colunas numéricas comparáveis (carteira, ranking, comissões por mês); **cards** quando cada item tem ações próprias ou texto livre (lead, tarefa, proposta). A "Carteira" do dashboard e o ranking do gerencial são tabela; comissões por funcionário pode continuar em cards, mas o `.cms-sum` interno vira uma `<table class="tbl-dense">` para alinhar números.

### 2.10 Componentes-chave

Especificação mínima: anatomia, variantes (máx. 5), tokens. Classes novas em `kebab-case` com prefixo de componente; as antigas viram aliases até a migração.

#### KPI card — `.kpi`
- Anatomia: `.kpi__label` (ícone 16px `--gold` + texto `--fs-xs --muted`) · `.kpi__value` (serif `--fs-2xl --head`, tabular) · `.kpi__delta` opcional (`--fs-xs`, cor semântica).
- Superfície `--surface-1`, borda `--line`, raio `--r-lg`, padding `--sp-5`.
- Variantes: `default` · `grad` (valor em `--grad-hero`; máx. 1 por grupo) · `premium` (`--surface-3`, borda `--line-gold`).
- Não clicável por padrão: sem hover. Se clicável (`.cms-kt`), aplica tabela 2.7.

#### Panel — `.panel`
- Anatomia: `.panel__head` (h2 serif `--fs-lg --head`, ícone 18px `--gold`, `.panel__actions` à direita) · `.panel__body`.
- `--surface-1`, borda `--line`, raio `--r-xl`, padding `--sp-6`, margin-bottom `--sp-5`.
- Variantes: `default` · `premium` (h2 `--gold2`, borda `--line-gold`) · `flush` (sem padding, para tabelas e chat).
- Sem hover (não é clicável). Remove as l. 205–206 e 397.

#### Chip / tag — `.chip`
Uma classe, cinco tons, dois tamanhos. Substitui `.tag .ttype .optag .lead-src .cms-tag .cms-pill` e os inline de Propostas.

```css
.chip{display:inline-flex;align-items:center;gap:var(--sp-1);height:22px;padding:0 var(--sp-2);
  border-radius:var(--r-pill);font:600 var(--fs-2xs)/1 var(--font-sans);letter-spacing:var(--track-caps);
  text-transform:uppercase;white-space:nowrap;
  color:var(--chip-fg,var(--gold2));background:var(--chip-bg,rgba(197,160,89,.12));border:1px solid var(--chip-line,var(--line-gold))}
.chip--teal{--chip-fg:var(--info);--chip-bg:var(--info-bg);--chip-line:var(--info-line)}
.chip--ok{--chip-fg:var(--ok);--chip-bg:var(--ok-bg);--chip-line:var(--ok-line)}
.chip--warn{--chip-fg:var(--warn);--chip-bg:var(--warn-bg);--chip-line:var(--warn-line)}
.chip--bad{--chip-fg:var(--bad);--chip-bg:var(--bad-bg);--chip-line:var(--bad-line)}
.chip--neutral{--chip-fg:var(--neutral);--chip-bg:var(--neutral-bg);--chip-line:var(--neutral-line)}
.chip--lg{height:28px;padding:0 var(--sp-3);font-size:var(--fs-xs)}          /* substitui .prob e .chip atual */
.chip--custom{--chip-fg:var(--c);--chip-bg:color-mix(in srgb,var(--c) 14%,transparent);--chip-line:color-mix(in srgb,var(--c) 40%,transparent)}
button.chip{cursor:pointer}  button.chip:hover{border-color:var(--chip-fg)}  button.chip[aria-pressed=true]{background:var(--chip-fg);color:var(--teal-ink)}
```

`.chip--custom` com `style="--c:#7FB2A6"` cobre as categorias de lead (`LEAD_CATS[].cor`) sem concatenar `${cor}26`/`${cor}66` em JS.

#### Botões — `.btn`
- Base: altura 40px (sm 32px, app 46px), padding `0 var(--sp-5)` (sm `0 var(--sp-3)`), raio `--r-md` (sm `--r-sm`), `--fs-sm` 600, gap `--sp-2`, ícone 16px.
- Variantes: `btn-gold` (primário: `--grad-gold`, texto `--teal-ink`, peso 700, hover `--glow-gold`) · `btn-teal` (secundário: `--info-bg`/`--info-line`, texto `--teal` — substitui `#BFEAE2`) · `btn-ghost` (terciário: borda `--line`, texto `--ink`) · `btn-danger` (novo: `--bad-bg`/`--bad-line`, texto `--bad`; usado em "Perdeu", "Excluir", "Sair") · `btn-ico` (quadrado 36px, raio `--r-sm`).
- Regras: 1 primário por painel/modal. Ghost nunca ao lado de ghost sem separador. Ícone de seta `→` no texto sai.

#### Tabela — ver 2.9.

#### Modal — `.modal`
- `--surface-1`, borda `--line-gold`, raio `--r-xl`, padding `--sp-8`, `--shadow-4`, largura `min(480px,100%)` (padrão) · `min(760px,100%)` (`.modal--wide`) · `min(1180px,96vw)` (`.modal--full`, Propostas).
- Anatomia: `.modal__head` (h3 serif `--fs-xl --head` + botão fechar `btn-ico`) · `.modal__body` · `.modal__actions` (direita; primário por último).
- App ≤1024px: bottom-sheet (já existe) — só troca o raio para `var(--r-xl) var(--r-xl) 0 0`.
- Overlay `--surface-overlay` + `backdrop-filter:blur(4px)`. Modal de Propostas **herda** o tema (escuro/claro) via tokens; perde paleta própria e Poppins.

#### Toast / flash — `.flash`
- Posição `bottom:var(--sp-8)` centrado; `--surface-1`, borda `--line-gold`, raio `--r-pill`, `--shadow-3`, texto `--head --fs-sm 600`, ícone semântico opcional 16px à esquerda.
- Variantes: `default` · `ok` · `bad` (borda e ícone na cor semântica; o fundo **não** vira dourado sólido — hoje o `--grad-gold` cheio compete com o botão primário).
- `role="status" aria-live="polite"`; duração 3,2 s; pausa em hover; empilha no máximo 2.

#### Select / input
- Altura 40px (app 46px), padding `0 var(--sp-3)`, `--surface-2`, borda `1.5px solid var(--line)`, raio `--r-sm`, texto `--head --fs-md` (app 16px fixo para evitar zoom), placeholder `--soft`.
- Focus: `border-color:var(--gold)` + `--focus-ring`. Erro: `border-color:var(--bad)` + helper `--fs-xs --bad`. Disabled: tabela 2.7.
- Select nativo com seta dourada (já existe no app, l. 839–841) passa a valer no desktop também, com `background-image` lendo `--gold`.
- Label: `--fs-xs 600 --head`, margin-bottom `--sp-1`. Helper/`.note`: `--fs-xs --soft`.
- Os inputs de `convCSS` (`.wa-srch`, `.wa-inp textarea`, `.wa-md input`) herdam esta spec.

---

## 3. Motion

Motion aqui tem um trabalho: dizer **o que mudou** e **de onde veio**. Pouco, rápido, com uma só assinatura — o "pop" dourado da aba ativa já é essa assinatura no app; o desktop ganha a mesma linguagem.

### 3.1 Tokens

```css
:root{
  --dur-1:120ms;   /* micro: hover de botão, pressed, troca de cor */
  --dur-2:200ms;   /* padrão: hover de card, chip, foco, acordeão curto */
  --dur-3:320ms;   /* entrada: página, modal, popover, item de lista */
  --dur-4:500ms;   /* herói: valor de KPI subindo, barra de progresso, skeleton→conteúdo */
  --stagger:40ms;  /* passo da cascata */

  --ease-out:cubic-bezier(.22,.9,.3,1);        /* entradas (já usado no app: agIn) */
  --ease-in-out:cubic-bezier(.65,0,.35,1);     /* mudanças de estado/tamanho, acordeão */
  --ease-in:cubic-bezier(.5,0,.75,0);          /* saídas: sumir rápido */
  --ease-spring:cubic-bezier(.34,1.56,.64,1);  /* 1 uso: pop da aba ativa / check de tarefa (já usado: agPop) */
}
```

Regras:
- `transition` sempre declara **propriedades explícitas** (`transform, opacity, border-color, background-color, box-shadow`); nunca `transition:.2s` ou `transition:all`.
- Só anima `transform`, `opacity`, `color`, `background-color`, `border-color`, `box-shadow`, `filter`. Nunca `bottom`, `height`, `padding`, `font-size` (`.flash`, `.topbar` no app e `.topbar h1` violam isso hoje).
- Saída é mais curta que entrada: saída = `--dur-1`/`--dur-2` com `--ease-in`.
- Loop infinito só em indicador de carregamento (`shimmer`, `ptrSpin`). `navPulse` passa a rodar **3 ciclos** e para.

### 3.2 Padrões

#### a) Troca de página/aba (desktop e app)

`render()` troca `innerHTML` do `#content`. Para reanimar a cada navegação, `render()` adiciona a classe `is-entering` e a remove no `animationend` (ou após `--dur-3`). `.plansec.on` e `.cms-tabs` usam o mesmo bloco.

```css
.content.is-entering>*,
.plansec.on>*{animation:page-in var(--dur-3) var(--ease-out) both}
@keyframes page-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
/* o conteúdo que sai não anima: corte seco + entrada do novo é mais rápido que cross-fade */
```

A animação é nos **filhos diretos** (panels/kpis), não no `.content` inteiro, para habilitar a cascata abaixo. Remove `.content{animation:pageIn}` (l. 398) e `agIn` (l. 1177).

#### b) Entrada em cascata (stagger) de cards

Máximo **8 itens** escalonados; do 9.º em diante entram juntos (evita página "pingando" por 1 s).

```css
.content.is-entering .kpis>.kpi,
.content.is-entering .cards>.ccard,
.content.is-entering .cms-kts>.cms-kt,
.content.is-entering .cms-ag>.cms-ag-day{
  animation:page-in var(--dur-3) var(--ease-out) both;
  animation-delay:calc(var(--i,0)*var(--stagger));
}
.content.is-entering .kpis>.kpi:nth-child(1){--i:0}  .content.is-entering .kpis>.kpi:nth-child(2){--i:1}
.content.is-entering .kpis>.kpi:nth-child(3){--i:2}  .content.is-entering .kpis>.kpi:nth-child(4){--i:3}
.content.is-entering .kpis>.kpi:nth-child(5){--i:4}  .content.is-entering .kpis>.kpi:nth-child(6){--i:5}
.content.is-entering .kpis>.kpi:nth-child(7){--i:6}  .content.is-entering .kpis>.kpi:nth-child(n+8){--i:7}
/* mesmo bloco de nth-child para .cards>.ccard, .cms-kts>.cms-kt, .cms-ag>.cms-ag-day */
/* painéis abaixo dos KPIs começam após a cascata */
.content.is-entering .kpis~.panel{animation-delay:calc(4*var(--stagger))}
```

Alternativa em JS (mais simples de manter): ao montar, `card.style.setProperty('--i', Math.min(idx,7))`.

#### c) Hover de card e botão

```css
.kpi.is-clickable,.ccard,.lead,.cms-kt,.opcard,.ostep,.ometa,.intg{
  transition:transform var(--dur-2) var(--ease-out),border-color var(--dur-2) var(--ease-out),box-shadow var(--dur-2) var(--ease-out)}
.kpi.is-clickable:hover,.ccard:hover,.lead:hover,.cms-kt:hover,.opcard:hover,.ostep:hover,.ometa:hover{
  transform:translateY(-2px);box-shadow:var(--shadow-2);border-color:var(--line-strong)}
.opcard:hover,.ostep:hover{border-color:var(--line-gold-strong)}
.ccard:active,.lead:active,.cms-kt:active{transform:scale(var(--state-pressed));transition-duration:var(--dur-1)}

.btn{transition:transform var(--dur-1) var(--ease-out),box-shadow var(--dur-2) var(--ease-out),
  background-color var(--dur-1) linear,border-color var(--dur-1) linear,color var(--dur-1) linear,filter var(--dur-1) linear}
.btn-gold:hover{transform:translateY(-1px);box-shadow:var(--glow-gold)}
.btn:active{transform:scale(var(--state-pressed));transition-duration:var(--dur-1)}
.navi a{transition:background-color var(--dur-1) linear,color var(--dur-1) linear}
.navi a:hover{transform:none}   /* remove translateX(2px) da l. 406: ruído em lista vertical */
```

Panel (`.panel`) **não** tem hover (remove l. 205–206, 397).

#### d) Abertura de modal e acordeão

```css
.modal-bg{animation:overlay-in var(--dur-2) linear both}
.modal{animation:modal-in var(--dur-3) var(--ease-out) both}
@keyframes overlay-in{from{opacity:0}to{opacity:1}}
@keyframes modal-in{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}
/* fechamento: JS adiciona .is-closing, aguarda animationend, remove do DOM */
.modal-bg.is-closing{animation:overlay-out var(--dur-1) var(--ease-in) both}
.modal-bg.is-closing .modal{animation:modal-out var(--dur-2) var(--ease-in) both}
@keyframes overlay-out{to{opacity:0}}
@keyframes modal-out{to{opacity:0;transform:translateY(8px) scale(.98)}}
/* bottom-sheet do app mantém appSheet; só troca a curva para var(--ease-out) e a duração para var(--dur-3) */

/* popover (notificações, wa-pop) */
.notif,.wa-pop{transform-origin:top right;animation:pop-in var(--dur-2) var(--ease-out) both}
@keyframes pop-in{from{opacity:0;transform:scale(.96) translateY(-4px)}to{opacity:1;transform:none}}

/* acordeão: grid-rows anima altura sem medir em JS */
.acc{display:grid;grid-template-rows:0fr;transition:grid-template-rows var(--dur-3) var(--ease-in-out)}
.acc>*{overflow:hidden;min-height:0}
.acc.open{grid-template-rows:1fr}
.acc-caret{transition:transform var(--dur-2) var(--ease-in-out)}
.acc.open .acc-caret,.cms-ag-f.open .c{transform:rotate(90deg)}
```

Aplicar `.acc` em `.leadObs` (substitui o `max-height:4.6em` → `max-height:none` seco), `.cms-ag-sub`, `.cms-org tr.cms-sub` (envolver em `<div class="acc">` dentro da `td`) e no painel de "Perdidos".

#### e) Skeleton de carregamento

```css
.sk{position:relative;overflow:hidden;background:var(--surface-2);border-radius:var(--r-md)}
.sk::after{content:"";position:absolute;inset:0;transform:translateX(-100%);
  background:linear-gradient(90deg,transparent,rgba(143,217,204,.10) 50%,transparent);
  animation:shimmer 1.4s var(--ease-in-out) infinite}
@keyframes shimmer{to{transform:translateX(100%)}}
/* skeleton → conteúdo: conteúdo real entra com page-in; skeleton some com fade de --dur-2 */
.skel.is-leaving{animation:overlay-out var(--dur-2) var(--ease-in) both}
```

O skeleton deve ter a **mesma geometria** do que vai substituir: 4 blocos de 92px para KPIs (já faz), um bloco de `panel` com linha de h2 (18px, 40%) + 3 linhas (14px). O `shimmer` atual anima `background-position` sobre um gradiente de 200% — a versão por `transform` é compositada na GPU.

#### f) Toast / flash

```css
.flash{position:fixed;left:50%;bottom:var(--sp-8);transform:translate(-50%,16px);opacity:0;pointer-events:none;
  transition:transform var(--dur-3) var(--ease-out),opacity var(--dur-2) linear}
.flash.show{transform:translate(-50%,0);opacity:1;pointer-events:auto}
.flash.hide{transform:translate(-50%,8px);opacity:0;transition-duration:var(--dur-2);transition-timing-function:var(--ease-in)}
```

JS: `flash(m, tipo)` → `show` por 3200 ms; ao fim adiciona `hide`, remove ambas após `--dur-2`. `mouseenter` pausa o timer. Deixa de animar `bottom`.

#### g) Sininho (notificações)

Três momentos, três movimentos:

```css
/* 1. chegou notificação nova: o sino balança uma vez (não o badge) */
.bell.has-new,.bell3.has-new{animation:bell-ring 600ms var(--ease-in-out) 1}
@keyframes bell-ring{0%,100%{transform:rotate(0)}20%{transform:rotate(14deg)}40%{transform:rotate(-12deg)}60%{transform:rotate(8deg)}80%{transform:rotate(-4deg)}}
/* 2. o badge aparece com spring (uma vez) */
.bell .badge,.bell3 .badge,.navdot,.actbadge{animation:badge-in var(--dur-3) var(--ease-spring) both}
@keyframes badge-in{from{transform:scale(0)}to{transform:scale(1)}}
/* 3. pulso de atenção limitado: 3 ciclos e para */
.navdot{animation:badge-in var(--dur-3) var(--ease-spring) both,nav-pulse 2.2s var(--ease-in-out) 3 var(--dur-3)}
@keyframes nav-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
/* painel aberto: pop-in (d). Itens não lidos: leem a cor do sino via --bc, sem animação extra */
```

JS: `updateBell()` compara a contagem anterior; se aumentou, adiciona `has-new` e remove no `animationend`. O badge é re-renderizado, então `badge-in` dispara sozinho.

### 3.3 `prefers-reduced-motion` (obrigatório, no fim do CSS principal e no fim da string `CSS` de comissões)

```css
@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{
    animation-duration:1ms!important;animation-iteration-count:1!important;
    transition-duration:1ms!important;scroll-behavior:auto!important;
  }
  /* mantém o que informa estado sem mover: opacidade é permitida, deslocamento não */
  .content.is-entering>*,.modal,.notif,.flash{transform:none!important}
  .sk::after{animation:none;background:rgba(143,217,204,.08)}   /* skeleton vira bloco estático mais claro */
  .navdot,.bell.has-new,.bell3.has-new{animation:none}
  .ccard:hover,.lead:hover,.kpi:hover,.cms-kt:hover,.btn-gold:hover{transform:none}
}
```

Também no app: `html.isApp` respeita a mesma regra (o bloco `@media (hover:none)` da l. 782 continua).

---

## 4. Melhorias priorizadas

**P0** = bug visível ou acessibilidade · **P1** = coerência do sistema (alto impacto, baixo risco) · **P2** = refinamento.

| # | Pri | Melhoria | Onde alterar |
|---|---|---|---|
| 1 | P0 | Adicionar o bloco `@media (prefers-reduced-motion: reduce)` (3.3) e limitar `navPulse` a 3 iterações | `plataforma.html` fim do `<style>` principal (antes da l. 590) e `.navdot` l. 1156; `plat-comissoes.js` fim da string `CSS` (l. 253) |
| 2 | P0 | Anel de foco único para todo interativo (`:where(...)`:focus-visible) e remover o anel duplo de inputs | `plataforma.html` l. 133 (remover `box-shadow`) e l. 404 (substituir seletor pelo de 2.7) |
| 3 | P0 | Corrigir cascata de transições duplicadas: apagar l. 205–206 e l. 397 (`.panel`), l. 207–208 e l. 395–396 (`.kpi`), unificar `.btn` em uma declaração (l. 119 + l. 214), unificar `.prob` (l. 211 + l. 216) | `plataforma.html` |
| 4 | P0 | Estado `:disabled` / `[aria-disabled]` global (2.7); aplicar ao `#propIaBtn` que já usa `disabled=true` sem estilo | `plataforma.html` novo bloco após l. 135; l. 3844 |
| 5 | P0 | `.flash`: animar `transform/opacity` em vez de `bottom`; `role="status" aria-live="polite"`; 3,2 s com pausa em hover; variantes `ok/bad` | `plataforma.html` l. 392–393 (CSS), l. 1349 (HTML), l. 1452 (`flash()`) |
| 6 | P0 | Tabela mobile: substituir `table{display:block}` (l. 527) por wrapper `.tbl-scroll` com `overflow-x:auto`; `thead th` sticky com `background:var(--card)` em vez de `#103A32` | `plataforma.html` l. 264, l. 527–528 |
| 7 | P1 | Criar tokens novos (`--fs-*`, `--sp-*`, `--r-*`, `--shadow-*`, `--surface-*`, `--dur-*`, `--ease-*`, semânticas) em `root-vars.css` e replicar no `:root` da plataforma | `root-vars.css`; `plataforma.html` l. 39–54 |
| 8 | P1 | Substituir `--ok/--warn/--bad` Tailwind pelas semânticas derivadas (2.8) e migrar os hex locais: `#4CAF7D #E4636A` (l. 1030–1032), `#E0574F` (l. 1154), `#f87171` (l. 283–284), `#B4532F` (l. 3815, 3835), `.cms-tag.ok/.warn/.bad` e `.cms-pill.on/.bad` (comissoes l. 142–144, 169–170), score (l. 2437) | `plataforma.html`, `plat-comissoes.js` |
| 9 | P1 | Unificar chips: `.chip` com modificadores (2.10) e `.chip--custom` com `--c`; aliases temporários para `.tag .ttype .optag .lead-src .cms-tag .cms-pill`; remover concatenação `${cor}26/66` do `leadCard()` | `plataforma.html` l. 129–130, 192–194, 226, 311, 339–342, 2455; `plat-comissoes.js` l. 141–146, 168–170, 257 |
| 10 | P1 | Normalizar superfícies para `--surface-1/2/3` (2.5): trocar `160deg` por `165deg` (l. 138, 331, 343, 452, 499), `rgba(10,28,34,.4/.45/.5/.6)` por `--surface-2` (l. 142, 286, 290, 315, 362, 1015), `rgba(0,0,0,.14)` e `rgba(255,255,255,.03)` por `--surface-2` (comissoes l. 158, 163, 172, 223, 242), `.actcard` para `--surface-1` (l. 475) | ambos os arquivos |
| 11 | P1 | Reduzir raios aos 4 tokens (2.3). Mapa: `9 10 11→--r-md ou --r-sm` conforme nível; `13 14 15→--r-lg`; `18 20 26→--r-xl`; `99→999`; `5 6 7→--r-sm` | `plataforma.html` (global, ~190 ocorrências), `plat-comissoes.js` (~15) |
| 12 | P1 | Troca de página com reentrada + cascata (3.2 a/b): `render()` adiciona `is-entering` ao `#content` e remove no `animationend`; remover `pageIn` (l. 398) e `agIn` (l. 1177) | `plataforma.html` l. 2292–2295 (JS), l. 398–399, 1176–1178 (CSS) |
| 13 | P1 | Modal desktop com `modal-in/overlay-in` e fechamento `is-closing` (3.2 d); popovers `.notif`/`.wa-pop` com `pop-in` | `plataforma.html` l. 452, 498–499, 2151 e funções que fazem `classList.add('hidden')` nos modais |
| 14 | P1 | Modal de Propostas herda o tema: remover Poppins (l. 3741), paleta `#FBFAF6/#E7DEC9/#12463D/#A6853F/#6E8078/#3E8E9C` → tokens (`--surface-1`, `--line`, `--head`, `--gold`, `--muted`, `--info`); botões viram `.btn btn-gold/btn-ghost`; usar `.modal.modal--full` | `plataforma.html` l. 3741–3832 |
| 15 | P1 | `convCSS` (WhatsApp) passa a usar tokens: `rgba(255,255,255,.0x)` → `--line`/`--surface-2`; `#10201d #0f1c1a` → `--surface-1`; `#c9a24a→#e6c76e` e `rgba(212,175,55,…)` → `--grad-gold`/`--state-active`; tamanhos px → `--fs-*`; inputs herdam 2.10 | `plataforma.html` l. 2117–2158 |
| 16 | P1 | Cabeçalho de tabela: `th` de `--gold2` para `--muted`, peso 600, tracking `--track-caps`; `.cms-tbl th` e `td.n/.r` unificados; `tbody tr:hover` | `plataforma.html` l. 197–200; `plat-comissoes.js` l. 136–140 |
| 17 | P1 | Tema claro: remover faixas `border-left/top:4px #0E4A41` (l. 96–99) e as 40 linhas de override por componente (l. 56–104) em favor de tokens `body.light` para `--surface-*`, `--shadow-*`, `--line-strong`; manter só `.side/.topbar` escuros (l. 60) e `--focus-ring` | `plataforma.html` l. 55–104; `root-vars.css` l. 11–23 |
| 18 | P1 | Chart.js lê cores do tema: portar o helper de `plat-comissoes.js` l. 346 para a plataforma e trocar os hex nos datasets (`#C5A059 #9DB5B1 #8FD9CC #4Fa3a3 #B0875F #1F9E8B #5C86A8 #7FB0A9`) por `cssVar('--gold')`, `cssVar('--muted')` etc.; gráficos passam a reagir ao `body.light` | `plataforma.html` l. 1506–1510, 1586, 1894, 2668–2670, 3111, 3554–3564, 3662 |
| 19 | P2 | Hover de card: uma altura (`-2px`) e uma sombra (`--shadow-2`); remover `translateY(-3px)` de `.ccard` (l. 188) e `.opcard` (l. 223), `-1px` de `.lead` (l. 210), `translateX(2px)` de `.navi a:hover` (l. 406) | `plataforma.html` |
| 20 | P2 | Pressed único: `.btn:active`, `.lead:active`, `.fab:active` → `scale(var(--state-pressed))` (`.97`); remover `.985` (l. 1184) e `.94` (l. 902) | `plataforma.html` l. 215, 788, 902, 1184 |
| 21 | P2 | Espaçamento em grade de 4: trocar `gap:5/7/9/11px` por `--sp-1/--sp-2/--sp-3` (ocorrências: l. 142, 149, 153, 165, 243, 285, 336, 362, 455, 460, 1013, 1022, 1025, 1062, 1067); padding de card para `--sp-3/--sp-5/--sp-6` | `plataforma.html`, `plat-comissoes.js` l. 134, 157, 162, 171 |
| 22 | P2 | Tipografia: convergir "valor em destaque" para `--fs-2xl` (`.kpi b` l. 179, `.cms-kt .v` comissoes l. 184, `.cms-head .amt b` l. 155, `.cms-wrap .kpi b` l. 132) e `--fs-3xl` (`.netrow.tot b` l. 261, `.cms-fx-tot .big` l. 234); `tabular-nums` em `.kpi b`, `td.r`, `.netrow b`, `.lead .vl`; peso 800 → 700 (19 ocorrências) | ambos |
| 23 | P2 | Acordeões com `grid-template-rows` (3.2 d): `.leadObs` (l. 319–322, 1113–1118), `.cms-ag-sub` (comissoes l. 209), `.cms-org tr.cms-sub` (l. 218) | ambos |
| 24 | P2 | Skeleton por `transform` (3.2 e) com geometria de panel; usar `skeleton()` também em Comissões e Conversas enquanto `loadCloud()`/API respondem | `plataforma.html` l. 483–485, 1892; `plat-comissoes.js` (render inicial) |
| 25 | P2 | Sininho: `bell-ring` ao chegar notificação, `badge-in` no badge, `nav-pulse` ×3 (3.2 g); `updateBell()` guarda a contagem anterior | `plataforma.html` l. 449–473, 1153–1157 e função `updateBell` |

### Ordem sugerida de execução

1. **Semana 1 (P0, sem risco visual):** #1 #2 #3 #4 #5 #6 — correções de cascata, acessibilidade e motion básico. Nada muda de aparência além de o hover de `.panel`/`.kpi` passar a animar como já era a intenção.
2. **Semana 2 (fundação):** #7 tokens → #8 semânticas → #10 superfícies → #11 raios → #16 tabela. Fazer com aliases (`--card2` continua existindo) para não quebrar inline styles.
3. **Semana 3 (componentes):** #9 chips → #14 Propostas → #15 WhatsApp → #17 tema claro → #18 gráficos.
4. **Semana 4 (motion e polimento):** #12 #13 → #19–#25.

Critério de pronto para cada item: zero hex cru fora de `:root`/`body.light` no trecho alterado; nenhuma `transition` sem propriedade explícita; tema claro e app verificados na mesma tela.
