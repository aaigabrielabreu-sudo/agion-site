# Tutoriais da plataforma — como manter

Arquivos: `plat-tour.js` (motor + configuração) e `plat-tour.css` (visual). Carregados no fim de `plataforma.html`, depois de `plat-motion-hook.js`.

## Como funciona

- **Central**: aba "Tutoriais" no menu (`view.page === 'tutoriais'`). Mostra só os tutoriais do perfil efetivo (`effRole()`), agrupados, com busca e contador de progresso.
- **Guia no lugar**: cada tutorial abre a tela real e percorre os passos. Cada passo tem destaque (anel + escurecimento), seta pontilhada da caixa até o alvo, um cursor animado e a caixa de explicação. A caixa tem Voltar/Próximo/Concluir, Reproduzir/Pausar, Fechar e "Ver destaque". No celular a caixa vira folha inferior (ou superior, se o destaque estiver embaixo) e pode ser recolhida.
- **Sem efeito colateral**: cliques demonstrados são só animação; a digitação aparece numa camada por cima do campo ("exemplo"); o valor real nunca muda. A "Ficha do cliente" abre o plano em **somente leitura**. A "Ficha do lead" abre o modal de novo lead vazio e o fecha no fim, sem salvar.
- **Acesso por área**: botão "? Como usar esta aba" no topo de cada página com tutorial, "Como usar esta ficha" no editor de plano e dentro do modal do lead.
- **Primeira visita**: convite com Iniciar / Pular por enquanto (volta em 3 dias) / Ver todos. Não aparece em "Ver como".
- **Teclado**: Esc fecha, ← → navegam. A caixa anuncia cada passo para leitores de tela (`aria-live`).
- **Movimento reduzido**: com `prefers-reduced-motion`, nada desliza nem pisca; a digitação aparece inteira.

## Progresso

- Chave local: `agion:tutorial:v1:<userId>:<contexto>`; contexto = `self` ou `view:<id>` no "Ver como".
- "Ver como" grava em `sessionStorage` (some ao fechar a aba) e nunca no servidor.
- Servidor: tabela `tutorial_progresso` (SQL em `agion_tutorial_progresso.sql`). Se a tabela não existir, o sistema funciona só com o cache local, sem erro.
- Formato: `{items:{<id>:{step, done:{v,ts}}}, invite:{until|never, ts}}`.

## Adicionar uma área

No array `CFG` de `plat-tour.js`:

```js
{id:'minha-aba', page:'minhaaba', roles:S3, v:1, g:'Gestão', ic:'chart',
 title:'Minha aba', desc:'Uma frase sobre para que serve.', steps:[
   {t:q('#idDoElemento'), title:'Título curto', text:'O que a pessoa vê e para que serve.'},
   {t:panel('título do painel'), title:'…', text:'…', optional:true},
   {t:q('#campoBusca'), title:'Busca', text:'…', demo:'type', typeText:'Exemplo'},
   {t:topBtn(), title:'Botão principal', text:'…', demo:'click'}
 ]}
```

- `page`: a chave da aba (`go('minhaaba')`). `roles`: `S3` (equipe), `ML` (master+líder), `M` (master), `CL` (cliente).
- Alvos: `q(seletor)`, `panel('texto do h2')`, `btn('texto', '#content')`, `topBtn()`, `inLead(sel)`, `inCard(sel)`, `cardTxt('texto')` ou uma função que retorne o elemento. Prefira ids estáveis; se não houver, use `data-tour-target="nome"` no HTML e `q('[data-tour-target="nome"]')`.
- `t:null` = passo centralizado, sem destaque.
- `optional:true`: se o elemento não existir (sem dados, perfil diferente), o passo é pulado. Sem `optional`, a caixa mostra um aviso e segue.
- `demo`: `'click'` (toque animado) ou `'type'` (digitação de exemplo; só em `input`/`textarea`).
- Mudou o conteúdo de um tutorial? Suba `v`. Quem já tinha concluído vê "Atualizado".

## Ferramentas de teste (console)

- `AgionTour.list()`: tutoriais do perfil com status.
- `AgionTour.start('crm')`: inicia um tutorial.
- `AgionTour.reset()` ou `AgionTour.reset('crm')`: limpa o progresso (o convite volta a aparecer).
