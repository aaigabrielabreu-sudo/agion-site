/* ==========================================================================
   Agion — plat-tour.js · Central de Tutoriais + guia interativo nas telas reais
   Camadas: 1) CONFIG (tutoriais por perfil)  2) MOTOR (passos, espera, navegação)
            3) VISUAL (destaque, seta, cursor, caixa)  4) PROGRESSO (cache + servidor)
   Regras: nenhuma demonstração altera dados (cliques e digitação são só visuais);
           "Ver como" fica isolado (progresso em sessionStorage, sem convite, sem servidor).
   Como adicionar uma área: veja TUTORIAIS-COMO-ADICIONAR.md
   ========================================================================== */
(function(){
'use strict';
var W=window, D=document;
var RM=W.matchMedia?W.matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
function reduced(){ return !!RM.matches; }
function $(s,r){ try{ return (r||D).querySelector(s); }catch(e){ return null; } }
function $$(s,r){ try{ return [].slice.call((r||D).querySelectorAll(s)); }catch(e){ return []; } }
function vis(el){ if(!el||!el.isConnected) return false; var r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false; var cs=getComputedStyle(el); return cs.visibility!=='hidden'&&cs.display!=='none'; }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
function role(){ try{ return effRole(); }catch(e){ return null; } }
function isAppUI(){ return D.body.classList.contains('isApp')||D.documentElement.classList.contains('isApp'); }
function narrow(){ return W.innerWidth<=640; }
function sleep(ms){ return new Promise(function(r){ setTimeout(r,ms); }); }

/* ---------- localizadores de alvo (seletores estáveis da própria plataforma) ---------- */
function q(sel){ return function(){ return $$(sel).filter(vis)[0]||null; }; }
function panel(txt){ txt=txt.toLowerCase(); return function(){ var h=$$('#content .panel h2').filter(function(h){ return (h.textContent||'').toLowerCase().indexOf(txt)>=0; })[0]; return h?h.closest('.panel'):null; }; }
function btn(txt,scope){ txt=txt.toLowerCase(); return function(){ return $$((scope||'')+' button').filter(function(b){ return vis(b)&&(b.textContent||'').toLowerCase().indexOf(txt)>=0; })[0]||null; }; }
function topBtn(){ return q('#topActions .btn-gold'); }
function inLead(sel){ return function(){ var c=$$('#content .lead').filter(vis)[0]; return c?$(sel,c):null; }; }
function inCard(sel){ return function(){ var c=$$('#content .ccard').filter(vis)[0]; return c?(sel?$(sel,c):c):null; }; }
function cardTxt(txt){ txt=txt.toLowerCase(); return function(){
  var c=$$('#content [onclick],#content a[href]').filter(function(e){ return vis(e)&&(e.textContent||'').toLowerCase().indexOf(txt)>=0; });
  c.sort(function(a,b){ var A=a.getBoundingClientRect(),B=b.getBoundingClientRect(); return A.width*A.height-B.width*B.height; });
  return c[0]||null; }; }

/* ---------- ícones ---------- */
var IC={
  map:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/></svg>',
  chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3v18h18"/><path d="M8 17v-5M13 17V8M18 17v-9"/></svg>',
  funnel:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 4h18l-7 8v6l-4 2v-8z"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
  money:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></svg>',
  spark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  doc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h7M9 17h5"/></svg>',
  gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>',
  target:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
  play:'<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>',
  pause:'<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
};

/* ==========================================================================
   1) CONFIG — um tutorial por área. page = chave da aba (view.page).
   Passo: {t: alvo (fn/seletor; null = centralizado), title, text, demo:'click'|'type', typeText, optional}
   Ao mudar o conteúdo de um tutorial, suba "v" — quem já concluiu vê "Atualizado".
   ========================================================================== */
var S3=['master','lider','especialista'], ML=['master','lider'], M=['master'], CL=['cliente'];
var CFG=[
 /* ---------------- EQUIPE ----------------
    text pode ser string ou objeto por perfil {master:..., lider:..., especialista:..., _:padrão}.
    roles no passo restringe o passo a alguns perfis. ---------------- */
 {id:'dash',page:'dash',roles:S3,v:2,g:'Comece por aqui',ic:'map',title:'Painel',desc:{_:'Sua visão do dia: números, funil, tarefas e carteira.',especialista:'Seu dia em uma tela: seus números, seu funil, suas tarefas e seus clientes.'},steps:[
   {t:null,title:'Bem-vindo ao Painel',text:{master:'Esta é a primeira tela depois do login. Ela resume a operação inteira da Agion: todos os especialistas, todos os clientes. Vamos passar pelas partes principais, direto na tela.',lider:'Esta é a primeira tela depois do login. Ela resume a sua equipe: os seus clientes e os dos especialistas que estão sob a sua liderança. Vamos passar pelas partes principais, direto na tela.',especialista:'Esta é a primeira tela depois do login. Tudo aqui é sobre a sua carteira: só os seus leads, clientes e tarefas aparecem. Vamos passar pelas partes principais, direto na tela.'}},
   {t:q('#content .kpis'),title:'Indicadores do topo',text:{master:'Clientes da empresa, patrimônio sob gestão, valor em negociação no CRM e tarefas pendentes — da empresa inteira.',lider:'Clientes, patrimônio sob gestão, valor em negociação no CRM e tarefas pendentes — somando você e a sua equipe.',especialista:'Seus clientes, o patrimônio que você acompanha, o valor que você tem em negociação no CRM e as suas tarefas pendentes.'}},
   {t:panel('funil'),title:'Funil de negócios',text:'Quantos leads estão em cada etapa do CRM. Se uma etapa acumula, é ali que as negociações estão parando. “Abrir CRM” leva direto para o quadro.'},
   {t:panel('tarefas de hoje'),title:'Tarefas de hoje',text:'O que vence hoje. Marcar a caixinha conclui a tarefa de verdade — no tutorial só mostramos onde fica.'},
   {t:panel('patrimônio'),title:'Patrimônio por especialista',text:{master:'Quanto cada especialista tem sob gestão. Serve para comparar a equipe e distribuir leads com critério.',lider:'Quanto cada especialista da sua equipe tem sob gestão.',especialista:'O seu patrimônio sob gestão ao longo do tempo.'},optional:true},
   {t:panel('carteira'),title:'Carteira de clientes',text:{_:'Os clientes sob gestão, com o plano de cada um. “Abrir plano” entra na ficha do cliente; “+ Novo cliente” cria um cliente (ação real).',especialista:'Os seus clientes, com o plano de cada um. “Abrir plano” entra na ficha; “+ Novo cliente” cria um cliente novo na sua carteira (ação real).'}},
   {t:q('#topActions .tut-help'),title:'Ajuda em cada aba',text:'Este botão “?” existe em todas as abas: abre o tutorial daquela tela. Para rever tudo, use “Tutoriais” no menu.'}
 ]},
 {id:'kpis',page:'kpis',roles:ML,v:2,g:'Gestão',ic:'chart',title:'KPIs',desc:'Base de clientes por categoria, funil, origem dos leads e atividade da equipe.',steps:[
   {t:q('#content .kc-wrap .cms-tabs, #content .cms-tabs'),title:'Escolha o período',text:'“Todo o período” soma tudo; “Por mês” mostra um mês de cada vez; “Histórico” mostra a evolução. Trocar a aba só muda a visualização.',demo:'click'},
   {t:q('#gCatVendas'),title:'Vendas por categoria',text:'Como a base de clientes se divide por categoria de carta (automóvel, imóvel, serviços…). Mostra onde a empresa está vendendo mais.',optional:true},
   {t:q('#gCatCrm'),title:'CRM por categoria',text:'A mesma divisão, mas para os leads ainda em negociação. Comparar com o gráfico anterior mostra o que está entrando.',optional:true},
   {t:q('#gFunil'),title:'Funil',text:'Conversão entre as etapas do CRM. Uma queda grande entre duas etapas indica onde a equipe perde negócios.',optional:true},
   {t:q('#gOrigem'),title:'Origem dos leads',text:'De onde os leads chegaram (anúncio, site, indicação…). Use para decidir onde investir em captação.',optional:true},
   {t:q('#gAtiv'),title:'Atividade',text:{master:'Atividade de cada especialista na plataforma.',lider:'Atividade dos especialistas da sua equipe.'},optional:true}
 ]},
 {id:'crm',page:'crm',roles:S3,v:2,g:'Vendas e relacionamento',ic:'funnel',title:'CRM',desc:{_:'O quadro de leads: filtros, busca e as ações de cada card.',especialista:'Seu quadro de leads: busca, filtros e as ações de cada card.'},steps:[
   {t:q('#content .kpis'),title:'Resumo do funil',text:{_:'Valor em pipeline, leads ativos, valor ganho e conversão — do que você enxerga nesta tela.',especialista:'Valor que você tem em negociação, seus leads ativos, o que já ganhou e a sua conversão.'}},
   {t:topBtn(),title:'Novo lead',text:'Cadastra um lead à mão (quem chegou por telefone ou indicação, por exemplo). Abre a ficha do lead — nada é salvo até você tocar em Salvar.',demo:'click'},
   {t:q('#crmBuscaInp'),title:'Busca',text:'Procure por nome, telefone ou e-mail. Veja um exemplo (a digitação é só demonstração; o campo não muda).',demo:'type',typeText:'Maria'},
   {t:q('#content .crmFiltros'),title:'Filtros',text:'Filtre por valor, categoria da carta e origem, e escolha a ordenação dos cards. Os filtros valem só para a visualização.'},
   {t:q('#content .kcol'),title:'Colunas = etapas',text:'Cada coluna é uma etapa da negociação (Novo lead → Contato feito → … → Fechado). Os cards andam da esquerda para a direita.'},
   {t:q('#content .lead'),title:'Card do lead',text:'Nome, valor, categoria e responsável. Tudo o que você faz com o lead acontece pelos botões do card.',optional:true},
   {t:inLead('.lv2-catsel'),title:'Categoria da carta',text:'Define a categoria (automóvel, imóvel, serviços…). Alterar aqui grava no lead e alimenta os KPIs por categoria.',optional:true},
   {t:inLead('.lv2-owner-sel'),title:'Responsável',text:{master:'Quem cuida do lead. Aqui você distribui leads entre os especialistas.',lider:'Quem cuida do lead. Você pode distribuir entre os especialistas da sua equipe.',especialista:'Quem cuida do lead. Os leads desta tela são os seus.'},optional:true,roles:ML},
   {t:inLead('a.lv2-wa'),title:'WhatsApp',text:'Abre a conversa com o lead no WhatsApp. O tutorial não abre conversas.',optional:true},
   {t:inLead('.aMove'),title:'Mover de etapa',text:'As setas voltam ou avançam o lead uma etapa. É assim que o funil fica atualizado.',optional:true},
   {t:inLead('.aNota'),title:'Nota e proposta',text:'Registra uma nota na linha do tempo do lead ou anexa uma proposta.',optional:true},
   {t:inLead('.aGanho'),title:'Ganho ou perdido',text:'Fecha a negociação. “Ganho” transforma o lead em cliente e cria o acesso dele à plataforma; “Perdido” tira do funil.',optional:true}
 ]},
 {id:'ficha-lead',page:null,ficha:'lead',roles:S3,v:1,g:'Vendas e relacionamento',ic:'doc',title:'Ficha do lead',desc:'Os campos da ficha de um lead, um por um.',steps:[
   {t:q('#leadModal #le_nome'),title:'Nome',text:'Nome do lead como ele será exibido no CRM.',demo:'type',typeText:'João da Silva'},
   {t:q('#leadModal #le_contato'),title:'Contato',text:'Telefone ou e-mail. É por ele que a plataforma liga o lead ao cadastro único (e evita duplicar a mesma pessoa).',demo:'type',typeText:'(51) 99999-0000'},
   {t:q('#leadModal #le_cpf'),title:'CPF (opcional)',text:'Ajuda a reconhecer a pessoa mesmo que ela troque de telefone.',optional:true},
   {t:q('#leadModal #le_tipo'),title:'Tipo de negócio',text:'Consórcio, Planejamento ou Consultoria.'},
   {t:q('#leadModal #le_valor'),title:'Valor potencial',text:'Valor estimado do negócio. Alimenta o total em pipeline do CRM.'},
   {t:q('#leadModal #le_obs'),title:'Observações',text:'Anotações livres sobre o lead.'},
   {t:function(){ return $$('#leadModal .modal-actions button').filter(vis).pop()||null; },title:'Salvar',text:'Só aqui os dados são gravados. Neste tutorial nada foi preenchido de verdade.'}
 ]},
 {id:'captacao',page:'captacao',roles:M,v:2,g:'Vendas e relacionamento',ic:'spark',title:'Captação',desc:'A caixa de entrada dos leads que chegam pelos canais conectados.',steps:[
   {t:q('#content .kpis'),title:'Resumo da captação',text:'Quantos leads chegaram pelos canais (site, anúncios, WhatsApp) e quantos ainda não foram importados.',optional:true},
   {t:panel('caixa de entrada'),title:'Caixa de entrada',text:{_:'Os leads chegam aqui antes de entrar no CRM. Importar um lead cria o card no funil — ação real.',especialista:'Os leads que chegaram para você. Importar um lead cria o card no seu funil — ação real.'},optional:true},
   {t:panel('simular'),title:'Simular chegada',text:'Cria um lead de teste para você ver o caminho completo. Só use quando quiser testar.',optional:true}
 ]},
 {id:'marketing',page:'marketing',roles:M,v:2,g:'Marketing e comunicação',ic:'spark',title:'Marketing',desc:'Automações, pontuação de leads, templates, campanhas e integrações.',steps:[
   {t:q('#mktNav'),title:'Seções do marketing',text:'Visão geral, Automações, Leads & Scoring, Templates, Campanhas e Integrações. Trocar de seção só muda o que aparece abaixo.',demo:'click'},
   {t:q('#mktBody'),title:'Conteúdo da seção',text:'Aqui aparece o conteúdo da seção escolhida: na Visão geral, o funil e a origem dos leads; em Templates, as mensagens prontas do WhatsApp.'},
   {t:topBtn(),title:'Criar template',text:'Monta uma mensagem de WhatsApp para aprovação. Nada é enviado por aqui.',optional:true}
 ]},
 {id:'ferramentas',page:'ferramentas',roles:S3,v:3,g:'Marketing e comunicação',ic:'gear',title:'Ferramentas',desc:'Calculadoras para usar na frente do cliente e o gerador de propostas.',steps:[
   {t:q('[data-tour-target="tool-0"]'),title:'Financiamento × Consórcio',text:'Compara custo real, CET e SAC/Price, e mostra quanto sobra para investir. Abre em uma nova aba.',optional:true,wait:6000},
   {t:q('[data-tour-target="tool-1"]'),title:'Escada Financeira',text:'Monta a escada de cartas que se paga sozinha.',optional:true},
   {t:q('[data-tour-target="tool-2"]'),title:'Alavancagem Patrimonial',text:'Simula vender a carta contemplada ou transformá-la em renda de imóvel.',optional:true},
   {t:q('[data-tour-target="tool-3"]'),title:'Gerador de Propostas',text:'Monta a proposta do cliente e gera o PDF.',optional:true},
   {t:q('[data-tour-target="tool-4"]'),title:'Assembleias',text:{master:'O resultado das assembleias de cada mês, por grupo: contemplações por sorteio e por lance (livre, fixo, 2º fixo, embutido), excluídos e o calendário. Você importa o PDF da administradora e a equipe consulta.',_:'O resultado das assembleias de cada mês, por grupo: contemplações por sorteio e por lance, excluídos e o calendário. Use para indicar ao cliente o grupo que mais contempla.'},optional:true}
 ]},
 {id:'assembleias',page:'ferramentas',sub:true,pre:function(){ return W.AgionImport&&W.AgionImport.assembleias(); },roles:S3,v:1,g:'Vendas e relacionamento',ic:'chart',title:'Assembleias',desc:'Resultado mensal dos grupos por administradora e categoria do bem: sorteio, lances, excluídas e calendário.',steps:[
   {t:q('#asAdmTabs'),title:'Administradora',text:'Primeiro escolha a administradora: HS Consórcios ou Âncora Consórcios. Cada uma tem os próprios grupos e categorias.',demo:'click'},
   {t:q('#asTipoTabs'),title:'Categoria do bem',text:'Depois a categoria: Imóvel, Automóvel, Serviços, Investimento ou Outros. O número ao lado é quantos grupos têm resultado importado.',demo:'click'},
   {t:q('#asMes'),title:'Mês da assembleia',text:'Escolha o mês do resultado. Aparecem só os meses importados para esta administradora e categoria.'},
   {t:q('#content .as-ctx'),title:'Onde você está',text:'Sempre mostra qual administradora, categoria e mês você está vendo — para não confundir imóvel com automóvel.'},
   {t:q('#content .as-hl'),title:'Destaques',text:'Os grupos que mais contemplam: no total, no sorteio e em cada tipo de lance (fixo, 2º fixo, livre, limitado), e o lance fixo com menos parcelas. Use para indicar o grupo ao cliente.',optional:true},
   {t:q('#content .as-tbl'),title:'Todos os grupos',text:'Clique no título de uma coluna para ordenar; clique numa linha para ver as cotas contempladas. O número entre colchetes é a parcela da cota.',optional:true},
   {t:function(){ return $$('#topActions .btn-gold').filter(vis)[0]||null; },title:'Importar resultado',text:'Todo mês, importe o PDF “Resultado de Assembleia” da administradora. A plataforma reconhece grupo, sorteio e lances; você confere antes de gravar.',optional:true,roles:M}
 ]},
 {id:'conversas',page:'conversas',roles:S3,v:4,pre:function(){ return W.AgionHumano&&W.AgionHumano.demo(); },post:function(){ try{ W.AgionHumano&&W.AgionHumano.demoOff(); }catch(e){} },g:'Vendas e relacionamento',ic:'chat',title:'Conversas',desc:'O WhatsApp dos seus leads e clientes: a Alice atende e faz o follow-up, você acompanha e assume quando precisar.',steps:[
   {t:q('#content .wa-list .hu-demo, #content .hu-demo-chat .wa-chd'),title:'Cada lead cai na conversa de quem vai atender',text:{master:'Quando um lead novo chega (site, anúncio ou WhatsApp), ele já é designado para alguém da equipe pela regra que você define em Marketing › Distribuição de leads. Só essa pessoa recebe a notificação “🆕 Novo lead para você”. Você vê todas as conversas da equipe. Este é um exemplo fictício; nada aqui é real.',lider:'Quando um lead novo chega, ele já é designado para alguém da equipe e só essa pessoa recebe a notificação “🆕 Novo lead para você”. Você vê as suas conversas, as da sua equipe e as que ainda estão sem responsável. Este é um exemplo fictício; nada aqui é real.',_:'Quando um lead novo chega, ele já é designado para você, aparece aqui e você recebe a notificação “🆕 Novo lead para você”. Você vê só as conversas dos seus leads e clientes. Este é um exemplo fictício; nada aqui é real.'}},
   {t:q('#content .hu-demo .hu-tags, #content .hu-demo-chat .hu-tags'),title:'Etiquetas',text:'“Novo lead” (verde), o nome de quem atende e “Cliente” (dourada) quando a pessoa já é cliente da Agion.'},
   {t:q('#content .hu-demo-chat .wa-msgs'),title:'A Alice atende e faz o follow-up',text:'Antes de o lead entrar no seu CRM, a Alice conversa com ele e faz o follow-up. Você acompanha tudo por aqui, em tempo real.'},
   {t:q('#content .hu-demo-chat .wa-msgs'),title:'Quando o lead pede uma pessoa',text:'Isso acontece quando o lead pede um atendente, uma pessoa ou um especialista, pergunta se está falando com um robô, ou se irrita (“você não me entende”, “que palhaçada”). A Alice responde: “Já estou chamando [seu nome], da nossa equipe, pra falar com você. Só um instante 🙂” — se ele perguntou se é robô, ela diz antes que é a assistente virtual. Na mesma hora você recebe no celular e no computador: “🔥 Carla quer falar com você”.'},
   {t:q('#content .hu-demo-bar'),title:'Você tem 10 minutos',text:'A conversa ganha esta faixa vermelha e a Alice fica 10 minutos em silêncio esperando você. Se o lead escrever nesse tempo, você recebe “💬 Carla respondeu”. Se ninguém assumir em 10 minutos, a Alice volta e avisa o lead: “Já avisei [seu nome] e a resposta chega em breve por aqui” — e continua atendendo até alguém da equipe responder.'},
   {t:q('#content .hu-demo-bar .hu-bt'),title:'Assumir',text:'Toque em “Assumir”: a Alice e o follow-up ficam em silêncio sem prazo, até você tocar em “Devolver para a Alice” (aí ela volta na hora). Tocando na notificação, a plataforma já abre nesta conversa, com o botão em destaque.',demo:'click'},
   {t:q('#content .hu-demo-chat .wa-b .hu-sigb'),title:'Seu nome em cada mensagem',text:{master:'Tudo o que a equipe escreve chega ao cliente com o nome de quem escreveu em negrito, em cima. Você pode ligar ou desligar o seu nome em “Assinar com meu nome”, na faixa de cada conversa.',_:'Tudo o que você escreve chega ao cliente com o seu nome em negrito, em cima, para ele saber quem está falando.'}},
   {t:q('#content .hu-demo-chat .wa-inp'),title:'Responder',text:'Escreva e envie. Só de mandar uma mensagem (mesmo sem tocar em Assumir), a Alice e o follow-up pausam por 30 minutos; depois disso ela volta sabendo o que você disse. Se o lead responder enquanto você está no comando, você recebe a notificação. No tutorial nada é enviado.'},
   {t:q('#waSrch'),title:'Buscar conversa',text:'Encontre uma conversa pelo nome ou número.',demo:'type',typeText:'Carla',optional:true}
 ]},
 {id:'feed',page:'feed',roles:M,v:1,g:'Marketing e comunicação',ic:'chat',title:'Feed',desc:'Mural de avisos da equipe.',steps:[
   {t:q('#feedTxt'),title:'Escreva um aviso',text:'O texto aparece para a equipe depois de publicar.',demo:'type',typeText:'Bom dia, time!'},
   {t:btn('publicar','#content'),title:'Publicar',text:'Publica o aviso. No tutorial nada é publicado.',optional:true}
 ]},
 {id:'chat',page:'chat',roles:M,v:1,g:'Marketing e comunicação',ic:'chat',title:'Chat',desc:'Canais de conversa interna da equipe.',steps:[
   {t:q('#content .ch'),title:'Canais',text:'Escolha o canal da conversa interna.'},
   {t:q('#chatInput'),title:'Mensagem',text:'Escreva e envie para o canal aberto.',demo:'type',typeText:'Alguém pode me ajudar?'}
 ]},
 {id:'distribuicao',page:'marketing',sub:true,roles:M,v:1,g:'Gestão',ic:'users',title:'Distribuição de leads',desc:'Quem recebe cada lead novo e como a fila anda.',pre:function(){ try{ mktSub('dist'); }catch(e){} return new Promise(function(r){ setTimeout(r,400); }); },steps:[
   {t:q('#mktNav [data-k="dist"]'),title:'Onde fica',text:'Marketing › Distribuição de leads. Só você altera a regra.'},
   {t:q('#content .rz-sw'),title:'Ligar e desligar',text:'Desligada, o lead entra sem responsável e o aviso vai para todos, como antes.'},
   {t:q('#content .rz-modos'),title:'Como distribuir',text:'Fila (1 para cada), por nível, por categoria ou manual. Toque num cartão para escolher.'},
   {t:q('#content .rz-eq'),title:'Quem participa',text:'Recebe leads (liga e desliga), nível de 1 a 5, categorias que atende e limite por dia. Os números mostram quanto cada um recebeu.'},
   {t:q('#content .rz-prox'),title:'Próximos da fila',text:'A prévia de quem recebe os próximos leads com as regras atuais.',optional:true},
   {t:q('#content .rz-pend'),title:'Aguardando designação',text:'No modo manual, os leads novos esperam aqui. Escolha a pessoa e toque em Designar.',optional:true},
   {t:q('#content .rz-save'),title:'Salvar',text:'Nada muda até você salvar a distribuição.',optional:true}
 ]},
 {id:'tarefas',page:'tarefas',roles:S3,v:3,g:'Gestão',ic:'check',title:'Tarefas',desc:'Sua agenda: o que vence hoje, o que está atrasado e a resposta de cada contato.',steps:[
   {t:q('#content .tk2-kpis'),title:'Seu dia em números',text:'Atrasadas, para hoje, próximos 7 dias e feitas hoje. Toque num número para filtrar a lista; toque de novo para voltar às pendentes.',demo:'click'},
   {t:q('#content .tk2-tabs'),title:'Pendentes, feitas e não feitas',text:'Troque a visão da lista. “Não feitas” guarda o que não deu certo, com a resposta e a anotação.',demo:'click'},
   {t:q('#content .tk2-quem'),title:'De quem são',text:'Suas tarefas, a equipe inteira ou uma pessoa.',roles:['master','lider'],optional:true},
   {t:q('#content .tk2-q'),title:'Buscar',text:'Procure pelo texto da tarefa, pelo nome do lead ou pela anotação (a digitação é só demonstração).',demo:'type',typeText:'Ligar',optional:true},
   {t:q('#content .tk2-tipos'),title:'Filtrar por tipo',text:'Ligação, WhatsApp, Instagram, reunião, visita… As tarefas criadas pelo robô de follow-up aparecem com o selo “Robô”.',optional:true},
   {t:q('#content .tk2-gh'),title:'Agenda por dia',text:'A lista vem separada em Atrasadas, Hoje, Amanhã e os próximos dias, na ordem do horário.',optional:true},
   {t:q('#content .tk2-row'),title:'Abrir a tarefa',text:'Toque na tarefa para abrir o detalhe: a resposta do contato (ex.: Atendeu, Não atendeu), a anotação, o prazo e o responsável. Lá ficam os botões “Feita”, “Não feita”, “Salvar” e “Abrir lead”.',demo:'click',optional:true},
   {t:q('#content .tk2-act .tk2-b'),title:'Ligar ou chamar no WhatsApp',text:'Quando a tarefa tem telefone, os atalhos ficam direto no cartão.',optional:true},
   {t:q('#content .tk2-ck'),title:'Concluir rápido',text:'A caixinha marca como feita sem abrir a tarefa (é uma ação real; no tutorial só mostramos onde fica). Dá para reabrir depois.',optional:true},
   {t:topBtn(),title:'Nova tarefa',text:'O que fazer, tipo, dia e hora, lead e responsável. Se for para outra pessoa, ela recebe uma notificação.'},
   {t:q('#topActions .btn-teal'),title:'Notificações',text:'Ative em cada aparelho para receber o aviso na hora de cada tarefa, quando alguém criar uma tarefa para você e o resumo das 8h30.',optional:true}
 ]},
 {id:'consultoria',page:'consultoria',roles:M,v:1,g:'Gestão',ic:'money',title:'Consultoria',desc:'Clientes da consultoria e o acompanhamento de cada um.',steps:[
   {t:q('#content .c-b'),title:'Novo cliente',text:'Inclui um cliente de consultoria.',optional:true},
   {t:q('#cLista'),title:'Lista de clientes',text:'Todos os clientes de consultoria, com o resumo de cada um.',optional:true}
 ]},
 {id:'users',page:'users',roles:S3,v:2,g:'Vendas e relacionamento',ic:'user',title:'Clientes',desc:{_:'A carteira: busca, ficha, cartas e visão do cliente.',especialista:'Seus clientes: busca, ficha, cartas e como o cliente vê a plataforma.'},steps:[
   {t:topBtn(),title:'Novo cliente',text:'Cria o cliente e envia o convite de acesso por e-mail. Ele define a própria senha.',optional:true},
   {t:q('#cliSearch'),title:'Buscar cliente',text:'Procure por nome, e-mail ou telefone.',demo:'type',typeText:'Silva'},
   {t:function(){ return $$('#content .cards').filter(vis)[0]||$$('#content p.note').filter(vis)[0]||null; },title:'Lista de clientes',text:{master:'Todos os clientes da empresa. Cada cartão mostra contato, categoria, desde quando é cliente e o especialista responsável.',lider:'Os seus clientes e os dos especialistas da sua equipe. Se a lista estiver vazia, ainda não há clientes vinculados a vocês.',especialista:'Os seus clientes. Cada cartão mostra contato, categoria e desde quando a pessoa é cliente.'},optional:true},
   {t:function(){ var c=inCard(null)(); return c?$$('button',c).filter(function(b){return /editar plano/i.test(b.textContent);})[0]:null; },title:'Editar plano',text:'Abre a ficha completa do planejamento do cliente. Ela tem tutorial próprio: “Como usar esta ficha”.',optional:true},
   {t:function(){ var c=inCard(null)(); return c?$$('button',c).filter(function(b){return /cartas/i.test(b.textContent);})[0]:null; },title:'Cartas',text:'As cartas de consórcio do cliente: administradora, crédito e situação. É aqui que a comissão de cada carta nasce.',optional:true},
   {t:function(){ var c=inCard(null)(); return c?$$('button',c).filter(function(b){return /vis[aã]o cliente/i.test(b.textContent);})[0]:null; },title:'Visão do cliente',text:'Mostra a plataforma exatamente como o cliente vê, só para leitura. Bom para orientar o cliente por telefone.',optional:true}
 ]},
 {id:'ficha-cliente',page:'editor',ficha:'cliente',roles:S3,v:1,g:'Vendas e relacionamento',ic:'doc',title:'Ficha do cliente',desc:'O planejamento do cliente: dados, patrimônio, dívidas e consórcios.',steps:[
   {t:null,title:'Ficha do cliente',text:'Abrimos a ficha em modo somente leitura para o tutorial — nada pode ser alterado enquanto ele roda.'},
   {t:q('#f_nome'),title:'Dados do cliente',text:'Nome, idade, aposentadoria e premissas do planejamento.',optional:true},
   {t:q('#f_rent'),title:'Premissas',text:'Rentabilidade e renda desejada definem as projeções.',optional:true},
   {t:q('#assets'),title:'Patrimônio',text:'Bens e investimentos do cliente.',optional:true},
   {t:q('#debts'),title:'Dívidas',text:'Financiamentos e dívidas em aberto.',optional:true},
   {t:q('#consorcios'),title:'Consórcios',text:'As cartas que entram no planejamento.',optional:true}
 ]},
 {id:'cadastro',page:'cadastro',roles:ML,v:1,g:'Vendas e relacionamento',ic:'user',title:'Cadastro único',desc:'Uma pessoa, um cadastro: liga lead, cliente e WhatsApp.',steps:[
   {t:q('#cadKpis'),title:'Resumo',text:'Quantos cadastros existem e como estão vinculados.',optional:true},
   {t:q('#cadBusca'),title:'Busca',text:'Procure por nome, telefone, CPF ou e-mail.',demo:'type',typeText:'(51) 9'},
   {t:q('#cadList'),title:'Cadastros',text:'Cada linha reúne tudo o que a plataforma sabe sobre a pessoa: lead, cliente e conversas.',optional:true}
 ]},
 {id:'comissoes',page:'comissoes',roles:S3,v:3,g:'Gestão',ic:'money',title:'Comissões',desc:{_:'Competência, recebimentos e a visão por cliente.',especialista:'Suas vendas, o que você recebe e quando.'},steps:[
   {t:q('#content .cms-tabs'),title:'Período',text:{_:'“Competência” mostra um mês; “Todo o período” soma tudo. Trocar só muda a visualização.',especialista:'Filtra as suas vendas por situação: em andamento, pagas, pós-contemplação. Trocar só muda a visualização.'},demo:'click'},
   {t:q('#content .kpis'),title:'Seus números',text:{_:'Produção, comissão das administradoras, comissão dos funcionários e margem da Agion.',especialista:'Produção da competência, a sua comissão pré-contemplação e o potencial pós-contemplação.'},optional:true},
   {t:q('#content .cms-kts'),title:'Visões',text:'Cada cartão abre uma visão: parcelas, fluxo, clientes e mais.',optional:true,roles:ML},
   {t:q('#content .cms-card'),title:'Venda',text:'Cada cartão é uma venda: cliente, administradora, crédito e as parcelas de comissão com a data prevista de cada uma.',optional:true,roles:['especialista']},
   {t:panel('próximos recebimentos'),title:'Próximos recebimentos',text:'As parcelas que ainda vão cair, em ordem de data. Funcionário recebe no dia 10 (a 1ª parcela, no dia 23 se estiver na janela de antecipação).',optional:true,roles:['especialista']},
   {t:panel('situação dos clientes'),title:'Situação dos clientes',text:'Quem está em dia e quem precisa de atenção. A comissão depende de o cliente seguir pagando.',optional:true,roles:['especialista']},
   {t:topBtn(),title:'Registrar venda',text:'Lança uma venda nova e calcula as parcelas de comissão. Ação real — só use com uma venda fechada.',optional:true},
   {t:q('#topActions .imp-btn'),title:'Importar',text:'Todo dia 11, importe o PDF de pagamentos da administradora: a plataforma casa cada cliente pelo grupo/cota ou pelo nome, mostra quem pagou e quem não pagou, e só grava depois que você confere. Aqui também entra o resultado das assembleias.',optional:true,roles:M},
   {t:q('#content .imp-banner'),title:'Último retorno',text:'Mostra o mês do último retorno de pagamentos importado e quantos pagaram ou não por administradora.',optional:true,roles:M}
 ]},
 {id:'contas',page:'contas',roles:ML,v:2,g:'Gestão',ic:'user',title:{master:'Contas',lider:'Equipe'},desc:{master:'Contas da equipe e dos clientes, acesso e “Ver como”.',lider:'Os especialistas da sua equipe, acesso e “Ver como”.'},steps:[
   {t:q('#content .kpis'),title:'Resumo',text:{master:'Contas ativas por perfil: líderes, especialistas e clientes.',lider:'Os especialistas da sua equipe e as contas ativas.'},optional:true},
   {t:q('#contSearch'),title:'Buscar conta',text:'Encontre alguém pelo nome ou e-mail.',demo:'type',typeText:'Lu'},
   {t:topBtn(),title:'Nova conta',text:{master:'Cria um acesso de líder, especialista ou cliente.',lider:'Cria um acesso de especialista para a sua equipe.'},optional:true},
   {t:btn('ver como','#content'),title:'Ver como',text:'Mostra a plataforma do ponto de vista daquela pessoa, só para leitura. Nada do que você fizer ali é gravado — nem o progresso dos tutoriais.',optional:true},
   {t:btn('resetar senha','#content'),title:'Resetar senha',text:'Envia um e-mail para a pessoa definir uma senha nova. Você nunca vê a senha dela.',optional:true}
 ]},
 {id:'atividades',page:'atividades',roles:M,v:1,g:'Gestão',ic:'chart',title:'Atividades',desc:'Registro do que cada pessoa fez na plataforma.',steps:[
   {t:q('#content .kpis'),title:'Resumo',text:'Volume de atividades no período.',optional:true},
   {t:q('#content select'),title:'Filtro',text:'Escolha quem ou o que ver.',optional:true},
   {t:panel('participantes'),title:'Participantes',text:'Quem está ativo e quando foi a última ação.',optional:true}
 ]},
 {id:'disparos',page:'disparos',roles:M,v:1,g:'Marketing e comunicação',ic:'chat',title:'Disparos',desc:'Mensagens em lote e o modo de IA usado nas respostas.',steps:[
   {t:q('#iaBox'),title:'Modo de IA',text:'Escolha entre Automático, Claude ou Gemini. Trocar o modo é uma configuração real.',optional:true},
   {t:q('#dispBusca'),title:'Buscar contatos',text:'Encontre os destinatários.',demo:'type',typeText:'Agion'}
 ]},
 {id:'config',page:'config',roles:S3,v:1,g:'Comece por aqui',ic:'gear',title:'Ajustes',desc:'Notificações, tema e sair da conta.',steps:[
   {t:q('#content .cfgSw'),title:'Notificações',text:'Escolha quais sininhos aparecem para você.',optional:true},
   {t:btn('alternar','#content'),title:'Tema',text:'Alterna entre tema claro e escuro.',optional:true},
   {t:btn('sair da conta','#content'),title:'Sair',text:'Encerra a sessão neste aparelho.',optional:true}
 ]},
 /* ---------------- CLIENTE ---------------- */
 {id:'c-dash',page:'dash',roles:CL,v:1,g:'Seu painel',ic:'map',title:'Início',desc:'Seu patrimônio, a projeção e as recomendações.',steps:[
   {t:null,title:'Bem-vindo(a)',text:'Esta é a sua página inicial. Vamos mostrar onde está cada informação do seu planejamento.'},
   {t:q('#content .kpis'),title:'Seus números',text:'Os indicadores principais do seu planejamento.',optional:true},
   {t:q('#gauge'),title:'Chance de atingir a meta',text:'A probabilidade calculada para o seu objetivo.',optional:true},
   {t:q('#chProj'),title:'Projeção',text:'Como o patrimônio evolui com as premissas atuais.',optional:true},
   {t:panel('diagnóstico'),title:'Diagnóstico e recomendações',text:'O que melhorar, em ordem de importância.',optional:true},
   {t:panel('atalhos'),title:'Atalhos',text:'Acesso rápido às outras áreas.',optional:true}
 ]},
 {id:'c-plan',page:'plan',roles:CL,v:1,g:'Seu plano',ic:'doc',title:'Planejamento',desc:'Resumo, projeção, cenários, diagnóstico e glossário.',steps:[
   {t:q('#content .subnav, #content .tabs'),title:'Seções do plano',text:'O plano é dividido em seções. Tocar em uma delas só muda o que aparece na tela.',optional:true},
   {t:btn('projeção','#content'),title:'Projeção',text:'Como o seu patrimônio evolui ao longo do tempo.',optional:true},
   {t:btn('cenários','#content'),title:'Cenários',text:'Compara caminhos diferentes para o mesmo objetivo.',optional:true},
   {t:btn('diagnóstico','#content'),title:'Diagnóstico',text:'Pontos de atenção e recomendações do seu especialista.',optional:true},
   {t:btn('glossário','#content'),title:'Glossário',text:'O significado dos termos usados no plano.',optional:true},
   {t:q('#editForm'),title:'Seus dados',text:'As informações que alimentam o plano. Alterações são feitas com o seu especialista.',optional:true}
 ]},
 {id:'c-jornada',page:'jornada',roles:CL,v:1,g:'Seu plano',ic:'target',title:'Jornada',desc:'Suas metas e o caminho até elas.',steps:[
   {t:panel('jornada'),title:'Suas metas',text:'Cada meta com prazo e quanto falta.',optional:true}
 ]},
 {id:'c-gastos',page:'gastos',roles:CL,v:1,g:'Seu dinheiro',ic:'money',title:'Gastos',desc:'Para onde vai o seu dinheiro, mês a mês.',steps:[
   {t:q('#chSpend'),title:'Gastos por categoria',text:'Como os gastos do mês se dividem.',optional:true},
   {t:q('#chEvol'),title:'Evolução',text:'Comparação com os meses anteriores.',optional:true},
   {t:panel('contas'),title:'Contas e cartões',text:'Onde os lançamentos acontecem.',optional:true},
   {t:panel('lançamentos'),title:'Lançamentos',text:'Inclua receitas e despesas e defina metas por categoria.',optional:true}
 ]},
 {id:'c-cota',page:'cota',roles:CL,v:1,g:'Seu plano',ic:'money',title:'Cota',desc:'A sua carta de consórcio.',steps:[
   {t:q('#content .kpis'),title:'Resumo da cota',text:'Valores e situação da carta.',optional:true},
   {t:panel('consórcio'),title:'Detalhes',text:'Grupo, parcelas e andamento.',optional:true}
 ]},
 {id:'c-config',page:'config',roles:CL,v:1,g:'Seu painel',ic:'gear',title:'Ajustes',desc:'Notificações, tema e sair.',steps:[
   {t:btn('ativar','#content'),title:'Notificações',text:'Ative para receber avisos no celular.',optional:true},
   {t:btn('alternar','#content'),title:'Tema',text:'Claro ou escuro.',optional:true},
   {t:btn('sair da conta','#content'),title:'Sair',text:'Encerra a sessão neste aparelho.',optional:true}
 ]}
];
var GROUP_ORDER=['Comece por aqui','Vendas e relacionamento','Gestão','Marketing e comunicação','Seu painel','Seu plano','Seu dinheiro'];
function TX(v){ if(v==null) return ''; if(typeof v==='string') return v; var r=role(); return v[r]!=null?v[r]:(v._!=null?v._:(v.master||v.lider||v.especialista||'')); }
function stepsOf(t){ var r=role(); return t.steps.filter(function(st){ return !st.roles||st.roles.indexOf(r)>=0; }); }
function forRole(){ var r=role(); return CFG.filter(function(t){ return t.roles.indexOf(r)>=0; }); }
function byId(id){ for(var i=0;i<CFG.length;i++) if(CFG[i].id===id) return CFG[i]; return null; }
function forPage(page){ var r=role(); if(page==='editor') return byId('ficha-cliente');
  if(page==='ferramentas'&&W.AgionImport&&W.AgionImport.isOpen&&W.AgionImport.isOpen()) return byId('assembleias');
  if(page==='marketing'&&W.__mktTab==='dist'&&r==='master') return byId('distribuicao');
  if(r==='cliente'&&page==='plan') return byId('c-plan');
  return forRole().filter(function(t){ return t.page===page&&!t.ficha&&!t.sub; })[0]||null; }

/* ==========================================================================
   4) PROGRESSO — por conta + contexto. Cache local + tabela tutorial_progresso.
   ========================================================================== */
var P={key:null,data:null}, SV={off:false,pulled:{},timer:null,uid:null};
function SB(){ try{ return W.supa||(typeof supa!=="undefined"?supa:null); }catch(e){ return null; } }
function ctx(){ return (session&&session.viewAs)?'view:'+session.viewAs.id:'self'; }
function stor(){ return (session&&session.viewAs)?W.sessionStorage:W.localStorage; }
function pkey(){ var id=null; try{ id=meId(); }catch(e){} return 'agion:tutorial:v1:'+(id||'anon')+':'+ctx(); }
function data(){ var k=pkey(); if(P.key!==k||!P.data){ P.key=k; P.data=null; try{ P.data=JSON.parse(stor().getItem(k)||'null'); }catch(e){} if(!P.data||typeof P.data!=='object') P.data={items:{},invite:null,upd:0}; if(!P.data.items) P.data.items={}; pull(); } return P.data; }
function rec(id){ var d=data(); return d.items[id]||(d.items[id]={step:0,done:null}); }
function save(){ var d=data(); d.upd=Date.now(); try{ stor().setItem(P.key,JSON.stringify(d)); }catch(e){} push(); }
function status(t){ var r=data().items[t.id]; if(!r) return 'new'; if(r.done&&r.done.v===t.v) return 'done'; if(r.done) return 'upd'; return r.step>0?'prog':'new'; }
function missing(e){ return !!e&&(e.code==='42P01'||e.code==='PGRST205'||e.code==='PGRST202'||e.code==='PGRST106'||/does not exist|schema cache|not find/i.test(e.message||'')); }
async function uid(){ if(SV.uid) return SV.uid; try{ var r=await SB().auth.getUser(); SV.uid=r&&r.data&&r.data.user?r.data.user.id:null; }catch(e){} return SV.uid; }
function merge(a,b){ if(!b||!b.items) return a; Object.keys(b.items).forEach(function(id){ var x=a.items[id], y=b.items[id]; if(!x){ a.items[id]=y; return; }
  var dx=x.done&&x.done.v||0, dy=y.done&&y.done.v||0; if(dy>dx||(dy===dx&&y.done&&!x.done)) x.done=y.done; if((y.step||0)>(x.step||0)&&!x.done) x.step=y.step; });
  if(b.invite&&(!a.invite||(b.invite.ts||0)>(a.invite.ts||0))) a.invite=b.invite; return a; }
async function pull(){ if(SV.off||!SB()||ctx()!=='self') return; var k=P.key; if(SV.pulled[k]) return; SV.pulled[k]=1;
  try{ var u=await uid(); if(!u) return; var r=await SB().from('tutorial_progresso').select('dados').eq('user_id',u).eq('contexto','self').maybeSingle();
    if(r.error){ if(missing(r.error)) SV.off=true; return; }
    if(r.data&&r.data.dados&&P.key===k){ merge(P.data,r.data.dados); try{ stor().setItem(k,JSON.stringify(P.data)); }catch(e){} if(view.page==='tutoriais'&&!RUN) renderCenter(D.getElementById('content')); }
  }catch(e){} }
function push(){ if(SV.off||!SB()||ctx()!=='self') return; clearTimeout(SV.timer); var snap=JSON.parse(JSON.stringify(P.data));
  SV.timer=setTimeout(async function(){ try{ var u=await uid(); if(!u) return; var r=await SB().from('tutorial_progresso').upsert({user_id:u,contexto:'self',dados:snap,updated_at:new Date().toISOString()},{onConflict:'user_id,contexto'}); if(r.error&&missing(r.error)) SV.off=true; }catch(e){} },900); }

/* ==========================================================================
   3) VISUAL — destaque, seta pontilhada, cursor, caixa de explicação
   ========================================================================== */
var UI=null;
var CUR='<g class="tr-cur off" id="trCur"><circle class="tr-rip" cx="2" cy="2" r="18"/><g class="tr-ptr"><path transform="scale(1.4)" d="M2 2 L2 21 L7.2 16.4 L10.6 24 L14 22.5 L10.7 15 L17.6 15 Z" fill="#F4FAF8" stroke="#06171B" stroke-width="1.6" stroke-linejoin="round"/></g></g>';
function buildUI(){
  if(UI) return UI;
  var root=D.createElement('div'); root.id='trRoot';
  root.innerHTML='<div class="tr-veil"></div><div class="tr-ring off"></div>'+
   '<svg class="tr-svg" aria-hidden="true"><defs><marker id="trHead" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="tr-head-a" d="M0 0 L10 5 L0 10 z"/></marker></defs><path class="tr-arrow off" marker-end="url(#trHead)" d=""/>'+CUR+'</svg>'+
   '<div class="tr-card" role="dialog" aria-modal="false" aria-labelledby="trTitle" aria-describedby="trText">'+
     '<div class="tr-top"><span class="tr-area"></span><span class="tr-count"></span>'+
     '<button type="button" class="tr-ic tr-col" aria-label="Recolher explicação" aria-expanded="true">–</button>'+
     '<button type="button" class="tr-ic tr-close" aria-label="Fechar tutorial">✕</button></div>'+
     '<div class="tr-bar" aria-hidden="true"><i></i></div>'+
     '<h4 id="trTitle"></h4><p id="trText"></p><div class="tr-miss" hidden></div>'+
     '<div class="tr-acts"><button type="button" class="tr-btn tr-play" aria-pressed="false"></button>'+
     '<button type="button" class="tr-btn see">Ver destaque</button><span class="sp"></span>'+
     '<button type="button" class="tr-btn tr-prev">Voltar</button><button type="button" class="tr-btn gold tr-next">Próximo</button></div>'+
   '</div><div class="tr-sr" aria-live="polite"></div>';
  D.body.appendChild(root);
  UI={root:root,ring:$('.tr-ring',root),arrow:$('.tr-arrow',root),cur:$('#trCur',root),card:$('.tr-card',root),area:$('.tr-area',root),count:$('.tr-count',root),
      bar:$('.tr-bar i',root),title:$('#trTitle',root),text:$('#trText',root),miss:$('.tr-miss',root),prev:$('.tr-prev',root),next:$('.tr-next',root),
      play:$('.tr-play',root),see:$('.see',root),col:$('.tr-col',root),live:$('.tr-sr',root),curPos:null,ghost:null};
  UI.prev.onclick=function(){ prev(); };
  UI.next.onclick=function(){ next(); };
  $('.tr-close',root).onclick=function(){ stop('close'); };
  UI.play.onclick=function(){ setAuto(!RUN.auto); };
  UI.see.onclick=function(){ if(RUN&&RUN.el) scrollTo(RUN.el,true).then(place); };
  UI.col.onclick=function(){ var c=root.classList.toggle('collapsed'); UI.col.textContent=c?'+':'–'; UI.col.setAttribute('aria-expanded',String(!c)); UI.col.setAttribute('aria-label',c?'Expandir explicação':'Recolher explicação'); place(); };
  W.addEventListener('scroll',sched,true); W.addEventListener('resize',sched); D.addEventListener('keydown',onKey,true);
  if(W.ResizeObserver){ UI.ro=new ResizeObserver(sched); UI.ro.observe(D.body); }
  return UI;
}
function destroyUI(){ if(!UI) return; W.removeEventListener('scroll',sched,true); W.removeEventListener('resize',sched); D.removeEventListener('keydown',onKey,true);
  try{ UI.ro&&UI.ro.disconnect(); }catch(e){} UI.root.remove(); UI=null; }
var rafId=0, tmo=0; function sched(){ if(rafId) return; rafId=requestAnimationFrame(function(){ rafId=0; clearTimeout(tmo); place(); }); clearTimeout(tmo); tmo=setTimeout(function(){ if(rafId){ cancelAnimationFrame(rafId); rafId=0; place(); } },90); }
function onKey(e){ if(!RUN) return; var tag=(e.target&&e.target.tagName)||''; var typing=/INPUT|TEXTAREA|SELECT/.test(tag)||(e.target&&e.target.isContentEditable);
  if(e.key==='Escape'){ e.preventDefault(); e.stopPropagation(); stop('close'); }
  else if(!typing&&e.key==='ArrowRight'){ e.preventDefault(); next(); }
  else if(!typing&&e.key==='ArrowLeft'){ e.preventDefault(); prev(); } }
function obstacles(){ var nav=$('#mobnav'); var nb=0; if(nav&&vis(nav)){ var r=nav.getBoundingClientRect(); if(r.top<W.innerHeight) nb=W.innerHeight-r.top; } return {bottom:nb}; }
function place(){
  if(!UI||!RUN) return;
  if(RUN.el&&!RUN.el.isConnected){ var st0=stepsOf(RUN.t)[RUN.i]||{}; try{ var ne=typeof st0.t==='function'?st0.t():(st0.t?$$(st0.t).filter(vis)[0]:null); RUN.el=ne||null; if(ne&&UI.ro){ UI.ro.observe(ne); } }catch(e){ RUN.el=null; } }
  var el=RUN.el, vw=W.innerWidth, vh=W.innerHeight, sheet=narrow();
  UI.root.classList.toggle('sheet',sheet);
  var r=el&&el.isConnected?el.getBoundingClientRect():null;
  var pad=6, ob0=obstacles(), off=!r||r.bottom<40||r.top>vh-ob0.bottom-40||r.right<4||r.left>vw-4;
  UI.root.classList.toggle('offscreen',!!(r&&off));
  UI.root.classList.toggle('nodim',!r);
  if(r&&!off){ var x=Math.max(2,r.left-pad), y=Math.max(2,r.top-pad), w=Math.min(vw-4,r.right+pad)-x, h=Math.min(vh-4,r.bottom+pad)-y;
    UI.ring.style.transform='translate('+x+'px,'+y+'px)'; UI.ring.style.width=w+'px'; UI.ring.style.height=h+'px'; UI.ring.classList.remove('off'); }
  else UI.ring.classList.add('off');
  // caixa
  var c=UI.card, cw=c.offsetWidth, ch=c.offsetHeight, cx, cy, ob=obstacles(), m=12;
  if(sheet){ var bottomSafe=ob.bottom+10; var topY=10; var low=vh-bottomSafe-ch;
    var target=r&&!off?(r.top+r.bottom)/2:vh/2; cy=(target>vh*0.52&&r&&!off)?topY:low;
    if(r&&!off&&cy===low&&r.bottom>low-8&&r.top<low) cy=topY;
    cx=10; c.style.transform='translate(0,'+Math.max(6,cy)+'px)'; }
  else if(!r||off){ cx=(vw-cw)/2; cy=Math.max(m,(vh-ch)/2); c.style.transform='translate('+cx+'px,'+cy+'px)'; }
  else{ var sp={right:vw-r.right,left:r.left,bottom:vh-r.bottom,top:r.top}, g=48, cand=[];
    if(sp.right>=cw+g+m) cand.push(['r',r.right+g,clamp(r.top+r.height/2-ch/2,m,vh-ch-m)]);
    if(sp.left>=cw+g+m) cand.push(['l',r.left-g-cw,clamp(r.top+r.height/2-ch/2,m,vh-ch-m)]);
    if(sp.bottom>=ch+g+m) cand.push(['b',clamp(r.left+r.width/2-cw/2,m,vw-cw-m),r.bottom+g]);
    if(sp.top>=ch+g+m) cand.push(['t',clamp(r.left+r.width/2-cw/2,m,vw-cw-m),r.top-g-ch]);
    var p=cand[0]||['o',vw-cw-m,vh-ch-m-ob.bottom]; cx=p[1]; cy=p[2]; c.style.transform='translate('+cx+'px,'+cy+'px)'; }
  // seta pontilhada da caixa até o destaque
  var cr=c.getBoundingClientRect();
  if(r&&!off&&!UI.root.classList.contains('collapsed')){ var tc={x:r.left+r.width/2,y:r.top+r.height/2};
    var a=edge(cr,tc,0), b=edge({left:r.left-pad,top:r.top-pad,right:r.right+pad,bottom:r.bottom+pad},{x:cr.left+cr.width/2,y:cr.top+cr.height/2},6);
    var dx=b.x-a.x, dy=b.y-a.y, len=Math.hypot(dx,dy);
    var inside=tc.x>cr.left&&tc.x<cr.right&&tc.y>cr.top&&tc.y<cr.bottom;
    if(len>18&&!inside){ var mx=(a.x+b.x)/2-dy*0.18, my=(a.y+b.y)/2+dx*0.18; UI.arrow.setAttribute('d','M'+a.x.toFixed(1)+' '+a.y.toFixed(1)+' Q'+mx.toFixed(1)+' '+my.toFixed(1)+' '+b.x.toFixed(1)+' '+b.y.toFixed(1)); UI.arrow.classList.remove('off'); }
    else UI.arrow.classList.add('off');
    moveCursor(Math.min(r.right-10,r.left+Math.max(14,r.width*0.55)),Math.min(r.bottom-6,r.top+Math.max(12,r.height*0.6)));
  } else { UI.arrow.classList.add('off'); UI.cur.classList.add('off'); }
  if(UI.ghost&&RUN.el){ var gr=RUN.el.getBoundingClientRect(); UI.ghost.style.left=gr.left+'px'; UI.ghost.style.top=gr.top+'px'; UI.ghost.style.width=gr.width+'px'; UI.ghost.style.height=gr.height+'px'; UI.ghost.style.display=off?'none':''; }
}
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function edge(rect,toward,out){ var cx=(rect.left+rect.right)/2, cy=(rect.top+rect.bottom)/2, dx=toward.x-cx, dy=toward.y-cy;
  if(!dx&&!dy) return {x:cx,y:cy}; var hw=(rect.right-rect.left)/2, hh=(rect.bottom-rect.top)/2; var s=Math.min(hw/Math.abs(dx||1e-6),hh/Math.abs(dy||1e-6));
  var L=Math.hypot(dx,dy)||1; return {x:cx+dx*s+dx/L*out,y:cy+dy*s+dy/L*out}; }
function moveCursor(x,y){ if(!UI) return; UI.cur.classList.remove('off'); UI.curPos={x:x,y:y}; UI.cur.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px)'; }
function clearDemo(){ if(!UI) return; if(UI.ghost){ UI.ghost.remove(); UI.ghost=null; } UI.cur.classList.remove('tap'); }
async function demo(st,el,tok){
  if(!el||!st.demo||!UI) return; await sleep(reduced()?60:760); if(!alive(tok)) return;
  if(st.demo==='click'){ UI.cur.classList.remove('tap'); try{ void UI.cur.getBBox(); }catch(e){} UI.cur.classList.add('tap'); setTimeout(function(){ UI&&UI.cur.classList.remove('tap'); },700); return; }
  if(st.demo==='type'&&/INPUT|TEXTAREA/.test(el.tagName)){
    var cs=getComputedStyle(el), g=D.createElement('div'); g.className='tr-ghost';
    var bg=cs.backgroundColor; if(!bg||bg==='transparent'||/rgba\(0, 0, 0, 0\)/.test(bg)) bg='#0E2A31';
    g.style.cssText='font:'+cs.font+';color:'+cs.color+';background:'+bg+';padding:'+cs.paddingTop+' '+cs.paddingRight+' '+cs.paddingBottom+' '+cs.paddingLeft+';border-radius:'+cs.borderRadius;
    g.innerHTML='<div class="tr-gclip"><span></span><i></i></div><small>exemplo</small>'; UI.root.appendChild(g); UI.ghost=g; place();
    var sp=g.querySelector('span'), txt=st.typeText||'';
    if(reduced()){ sp.textContent=txt; return; }
    for(var i=1;i<=txt.length;i++){ if(!alive(tok)) return; sp.textContent=txt.slice(0,i); await sleep(85+Math.random()*60); }
  }
}

/* ==========================================================================
   2) MOTOR
   ========================================================================== */
var RUN=null, TOK=0;
function alive(tok){ return RUN&&RUN.stepTok===tok; }
async function waitFor(t,ms,ok){ if(!t) return null; var end=Date.now()+(ms||3500);
  while(Date.now()<end){ if(!ok()) return null; var el=typeof t==='function'?t():$$(t).filter(vis)[0]; if(el&&vis(el)) return el; await sleep(120); } return null; }
function scrollTo(el,force){ return new Promise(function(res){ if(!el) return res(); var r=el.getBoundingClientRect(), vh=W.innerHeight, ob=obstacles();
  var topMin=narrow()?70:12, limit=narrow()?vh*0.55:vh-ob.bottom-12, tall=r.height>(limit-topMin)*0.8;
  var okv=tall?(r.top>=topMin-4&&r.top<=topMin+80):(r.top>=topMin&&r.bottom<=limit);
  if(okv&&!force) return res();
  var smooth=!reduced()&&!D.hidden;
  try{ el.scrollIntoView({block:(tall||narrow())?'start':'center',inline:'nearest',behavior:smooth?'smooth':'auto'}); }catch(e){ el.scrollIntoView(); }
  if(tall||narrow()){ setTimeout(function(){ try{ var sc=scroller(el); var dy=-(narrow()?76:topMin+4); if(sc===W) W.scrollBy({top:dy,behavior:smooth?'smooth':'auto'}); else sc.scrollBy({top:dy,behavior:smooth?'smooth':'auto'}); }catch(e){} },smooth?260:0); }
  // espera a rolagem assentar (posição estável por 2 leituras) — máx. 1,4 s
  var last=null, same=0, t0=Date.now();
  (function poll(){ var q=el.getBoundingClientRect().top; if(last!==null&&Math.abs(q-last)<0.5) same++; else same=0; last=q;
    if(same>=2||Date.now()-t0>1400) return res(); setTimeout(poll,smooth?90:30); })(); }); }
function scroller(el){ var p=el.parentElement; while(p&&p!==D.body){ var cs=getComputedStyle(p); if(/(auto|scroll)/.test(cs.overflowY)&&p.scrollHeight>p.clientHeight+2) return p; p=p.parentElement; } return W; }
function navTo(page){ if(!page||view.page===page) return; RUN&&(RUN.nav=true); try{ go(page); }finally{ RUN&&(RUN.nav=false); } }
async function prepare(t){
  if(t.pre){ navTo(t.page); RUN.nav=true; try{ await t.pre(); }catch(e){} finally{ if(RUN) RUN.nav=false; } return true; }
  if(t.ficha==='lead'){ var m=$('#leadModal'); if(m&&m.classList.contains('hidden')){ if(view.page!=='crm') navTo('crm'); try{ openLead(); RUN.openedLead=true; }catch(e){} } return true; }
  if(t.ficha==='cliente'){
    if(role()==='cliente'){ navTo('plan'); return true; }
    if(view.page==='editor') return true;
    var cs=[]; try{ cs=visibleClients()||[]; }catch(e){}
    var c=cs.filter(function(c){ return c.plans&&c.plans.length; })[0];
    if(!c){ return false; }
    var p=c.plans.filter(function(p){return p.main;})[0]||c.plans[0];
    RUN.nav=true; try{ openEditor(c.id,p.id,true); RUN.openedEditor=true; }finally{ RUN.nav=false; } return true;
  }
  navTo(t.page); return true;
}
async function start(id,mode){
  var t=byId(id); if(!t||t.roles.indexOf(role())<0) return;
  if(RUN) stop('switch');
  closeInvite(); closeAreaInvite();
  TOK++; RUN={t:t,i:0,tok:TOK,stepTok:0,auto:false,timer:null,el:null,from:view.page};
  buildUI(); UI.root.classList.remove('collapsed','offscreen'); UI.card.classList.remove('enter'); void UI.card.offsetWidth; UI.card.classList.add('enter');
  var r=rec(t.id); r.ask='no'; if(mode==='resume'&&!r.done&&r.step>0) RUN.i=Math.min(r.step,stepsOf(t).length-1);
  var ok=await prepare(t); if(!RUN||RUN.tok!==TOK) return;
  if(!ok){ show(-1); UI.title.textContent=TX(t.title); UI.text.textContent=t.ficha==='cliente'?'Ainda não há nenhum cliente com plano visível para você. Cadastre um cliente e abra “Editar plano” para ver esta ficha.':'Esta área não está disponível agora.'; UI.next.textContent='Fechar'; UI.next.onclick=function(){ stop('close'); }; place(); return; }
  show(RUN.i,1);
  setTimeout(function(){ try{ UI&&UI.next.focus({preventScroll:true}); }catch(e){} },60);
}
async function show(i,dir){
  if(!RUN) return; var t=RUN.t; clearTimeout(RUN.timer); clearDemo();
  if(i<0){ RUN.el=null; UI.root.classList.add('nodim'); return; }
  var tok=++RUN.stepTok; RUN.i=i; var STEPS=stepsOf(t), st=STEPS[i], n=STEPS.length;
  UI.next.onclick=function(){ next(); };
  var r=rec(t.id); if(!r.done||status(t)!=='done'){ r.step=i; save(); }
  var pg=st.page||(t.ficha?null:t.page); if(pg&&view.page!==pg) navTo(pg);
  // texto já aparece enquanto o alvo carrega
  UI.area.textContent=TX(t.title); UI.count.textContent='Passo '+(i+1)+' de '+n;
  UI.bar.style.transform='scaleX('+((i+1)/n)+')';
  UI.title.textContent=TX(st.title); UI.text.textContent=TX(st.text); UI.miss.hidden=true;
  UI.prev.disabled=i===0; UI.next.textContent=i===n-1?'Concluir':'Próximo';
  paintPlay();
  var el=null;
  if(st.t){ el=await waitFor(st.t,st.wait||3200,function(){ return alive(tok); }); if(!alive(tok)) return;
    if(!el&&st.optional){ var j=i+(dir<0?-1:1); if(j>=0&&j<n) return show(j,dir); }
    if(!el){ UI.miss.hidden=false; UI.miss.textContent='Esta parte não aparece agora (pode depender de dados ou do seu perfil). Siga para o próximo passo.'; } }
  RUN.el=el;
  if(el){ await scrollTo(el); if(!alive(tok)) return; setTimeout(function(){ if(alive(tok)) place(); },420); }
  if(UI.ro&&el){ try{ UI.ro.disconnect(); UI.ro.observe(D.body); UI.ro.observe(el); }catch(e){} }
  place();
  UI.live.textContent='Passo '+(i+1)+' de '+n+': '+TX(st.title)+'. '+TX(st.text);
  demo(st,el,tok);
  if(RUN.auto) schedAuto();
}
function next(){ if(!RUN) return; if(RUN.i>=stepsOf(RUN.t).length-1) return complete(); show(RUN.i+1,1); }
function prev(){ if(!RUN||RUN.i<=0) return; show(RUN.i-1,-1); }
function paintPlay(){ if(!UI||!RUN) return; UI.play.innerHTML=(RUN.auto?IC.pause+' Pausar':IC.play+' Reproduzir'); UI.play.setAttribute('aria-pressed',String(!!RUN.auto)); }
function setAuto(on){ if(!RUN) return; RUN.auto=!!on; paintPlay(); clearTimeout(RUN.timer); if(on) schedAuto(); }
function schedAuto(){ clearTimeout(RUN.timer); var st=stepsOf(RUN.t)[RUN.i]||{text:''}; var ms=Math.max(3800,Math.min(9000,1800+(TX(st.text).length+(st.typeText||'').length*3)*45));
  RUN.timer=setTimeout(function(){ if(!RUN||!RUN.auto) return; if(RUN.i>=stepsOf(RUN.t).length-1){ setAuto(false); return; } next(); },ms); }
function cleanup(){ if(!RUN) return; if(RUN.openedLead){ try{ closeLead(); }catch(e){} } if(RUN.t&&RUN.t.post){ try{ RUN.t.post(); }catch(e){} } }
function stop(why){
  if(!RUN) return; clearTimeout(RUN.timer); cleanup(); var t=RUN.t; RUN=null; TOK++; clearDemo(); destroyUI();
  if(why==='nav') try{ flash('Tutorial pausado — continue quando quiser em Tutoriais'); }catch(e){}
  if(why==='close'||why==='nav') ensureHelp();
  return t;
}
function complete(){
  if(!RUN) return; var t=RUN.t, r=rec(t.id); r.done={v:t.v,ts:Date.now()}; r.step=0; save();
  var userModal=t.ficha==='lead'&&!RUN.openedLead;
  stop('done'); JUST=t.id;
  if(userModal){ var nm=$('#le_nome'), ct=$('#le_contato');
    if((nm&&nm.value.trim())||(ct&&ct.value.trim())){ try{ flash('Tutorial concluído ✓ — está em Tutoriais'); }catch(e){} return; }
    try{ closeLead(); }catch(e){} }
  go('tutoriais');
}

/* ==========================================================================
   Central de Tutoriais
   ========================================================================== */
var JUST=null, QRY='';
function cardHtml(t,i){
  var s=status(t), r=data().items[t.id]||{}, n=stepsOf(t).length, mins=Math.max(1,Math.round(n*12/60));
  var chip=s==='upd'?'<span class="chip upd">Atualizado</span>':(s==='prog'?'<span class="chip">Em andamento</span>':'');
  var act=s==='prog'?'Continuar':(s==='upd'?'Ver novidades':'Iniciar');
  var bar=s==='prog'?'<div class="bar" aria-hidden="true"><i style="width:'+Math.round(((r.step||0)+1)/n*100)+'%"></i></div>':'';
  var done=s==='done'?'<div class="done"><div class="ck">'+IC.check+'</div><strong>Concluído</strong><small>'+new Date(r.done.ts).toLocaleDateString('pt-BR')+'</small><button class="btn btn-ghost btn-sm" onclick="AgionTour.start(\''+t.id+'\')">Rever tutorial</button></div>':'';
  return '<div class="tut-card'+(JUST===t.id?' justdone':'')+'" data-tut="'+t.id+'" data-q="'+esc((TX(t.title)+' '+TX(t.desc)+' '+t.g).toLowerCase())+'" style="--i:'+i+'">'+
    '<div class="hd"><span class="ico">'+(IC[t.ic]||IC.map)+'</span><h4>'+esc(TX(t.title))+'</h4>'+chip+'</div><p>'+esc(TX(t.desc))+'</p>'+bar+
    '<div class="ft"><span class="meta">'+n+' passos · ~'+mins+' min</span>'+
    '<button class="btn btn-gold btn-sm"'+(s==='done'?' tabindex="-1" aria-hidden="true"':'')+' onclick="AgionTour.start(\''+t.id+'\',\'resume\')">'+act+'</button></div>'+done+'</div>';
}
function renderCenter(C){
  if(!C) return;
  try{ setTop('Tutoriais','Aprenda cada área no lugar onde ela acontece',''); }catch(e){}
  var list=forRole(), total=list.length, feitos=list.filter(function(t){ return status(t)==='done'; }).length;
  var groups={}; list.forEach(function(t){ (groups[t.g]=groups[t.g]||[]).push(t); });
  var gs=Object.keys(groups).sort(function(a,b){ return GROUP_ORDER.indexOf(a)-GROUP_ORDER.indexOf(b); });
  var k=0, vw=session&&session.viewAs;
  C.innerHTML='<div class="panel tut-hero"><div class="tx"><h2>Central de Tutoriais</h2><p>'+(vw?'Você está em “Ver como”: o progresso aqui vale só para esta visualização e não altera a conta de ninguém.':'Cada tutorial abre a tela real e mostra, passo a passo, onde fica cada coisa. Nenhum dado é alterado durante a demonstração.')+'</p></div>'+
    '<div class="tut-prog"><div class="n"><span>Seu progresso</span><b>'+feitos+' de '+total+'</b></div><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="'+total+'" aria-valuenow="'+feitos+'"><i style="width:'+(total?feitos/total*100:0)+'%"></i></div></div></div>'+
    '<div class="tut-search"><input id="tutBusca" type="search" placeholder="Buscar tutorial (ex.: CRM, comissões, ficha)…" aria-label="Buscar tutorial" value="'+esc(QRY)+'"></div>'+
    gs.map(function(g){ return '<section class="tut-group" data-g><h3>'+esc(g)+'</h3><div class="tut-grid">'+groups[g].map(function(t){ return cardHtml(t,k++); }).join('')+'</div></section>'; }).join('')+
    '<div class="tut-empty" hidden>Nenhum tutorial encontrado.</div>';
  var inp=$('#tutBusca'); inp.oninput=function(){ QRY=inp.value; filter(); }; filter();
  if(JUST){ var el=$('.tut-card[data-tut="'+JUST+'"]'); JUST=null;
    if(el){ setTimeout(function(){ try{ el.scrollIntoView({block:'center',behavior:reduced()?'auto':'smooth'}); }catch(e){} var b=$('.done button',el); b&&b.focus({preventScroll:true}); },120); setTimeout(function(){ el.classList.remove('justdone'); },3200); } }
}
function filter(){ var qq=(QRY||'').trim().toLowerCase(), any=false;
  $$('.tut-card').forEach(function(c){ var ok=!qq||c.getAttribute('data-q').indexOf(qq)>=0; c.hidden=!ok; if(ok) any=true; });
  $$('.tut-group').forEach(function(g){ g.hidden=!$$('.tut-card',g).some(function(c){ return !c.hidden; }); });
  var e=$('.tut-empty'); if(e) e.hidden=any; }

/* ---------- botão "Como usar esta aba / ficha" ---------- */
function ensureHelp(){
  var box=D.getElementById('topActions'); if(!box) return; $$('.tut-help',box).forEach(function(b){ b.remove(); });
  if(!session||!session.role||view.page==='tutoriais') return;
  var t=forPage(view.page); if(!t||t.roles.indexOf(role())<0) return;
  var ficha=!!t.ficha&&view.page==='editor';
  var b=D.createElement('button'); b.type='button'; b.className='tut-help'; b.setAttribute('aria-label',ficha?'Como usar esta ficha':'Como usar esta aba');
  b.innerHTML='<b aria-hidden="true">?</b><span>'+(ficha?'Como usar esta ficha':'Como usar esta aba')+'</span>';
  b.onclick=function(){ start(t.id); }; box.appendChild(b);
}
function leadModalHelp(){ var m=$('#leadModal .modal'); if(!m||$('.tut-help-ficha',m)) return; var h=$('h3',m); if(!h) return;
  var b=D.createElement('button'); b.type='button'; b.className='tut-help tut-help-ficha'; b.innerHTML='<b aria-hidden="true">?</b><span>Como usar esta ficha</span>';
  b.onclick=function(){ if(role()==='cliente') return; start('ficha-lead'); }; h.insertAdjacentElement('afterend',b); }

/* ---------- convite por aba: "primeira vez aqui?" (uma vez por área, até iniciar ou dispensar) ---------- */
var AINV=null, ainvTimer=null;
function closeAreaInvite(){ clearTimeout(ainvTimer); if(!AINV) return; var el=AINV; AINV=null; if(reduced()){ el.remove(); return; } el.classList.add('out'); setTimeout(function(){ el.remove(); },220); }
function areaInvite(){
  closeAreaInvite();
  if(!session||!session.role||session.viewAs||RUN||INV) return;
  if(D.querySelector('.nv-bg')) return;
  if(view.page==='tutoriais'||view.page==='editor') return;
  var t=forPage(view.page); if(!t||t.ficha) return;
  var d=data(), r=d.items[t.id]; if(r&&(r.done||r.step>0||r.ask)) return;
  var first=role()==='cliente'?'c-dash':'dash'; if(t.id===first&&!(d.invite&&(d.invite.never||(d.invite.until||0)>Date.now()))) return; // o convite geral cuida do painel
  var page=view.page;
  ainvTimer=setTimeout(function(){
    if(view.page!==page||RUN||INV||session.viewAs||D.querySelector('.nv-bg')) return;
    var el=D.createElement('div'); el.className='tr-invite tr-ainv'+(narrow()?' sheet':''); el.setAttribute('role','dialog'); el.setAttribute('aria-labelledby','trAinvT');
    el.innerHTML='<div class="k">Primeira vez aqui?</div><h4 id="trAinvT">Como usar '+esc(TX(t.title))+'</h4><p>'+esc(TX(t.desc))+' Um guia de '+stepsOf(t).length+' passos, direto nesta tela, sem alterar nada.</p>'+
      '<div class="r"><button class="gold" data-a="go">Iniciar</button><button data-a="skip">Agora não</button></div>';
    el.addEventListener('click',function(e){ var a=e.target&&e.target.getAttribute('data-a'); if(!a) return;
      if(a==='skip'){ rec(t.id).ask='no'; save(); closeAreaInvite(); }
      else if(a==='go'){ closeAreaInvite(); start(t.id); } });
    D.body.appendChild(el); AINV=el;
  },900);
}

/* ---------- convite de primeira visita ---------- */
var INV=null, invChecked=false;
function closeInvite(){ if(!INV) return; var el=INV; INV=null; if(reduced()){ el.remove(); return; } el.classList.add('out'); setTimeout(function(){ el.remove(); },220); }
function maybeInvite(){
  if(invChecked||!session||!session.role||session.viewAs||RUN) return; if(D.querySelector('.nv-bg')) return; invChecked=true;
  setTimeout(function(){
    if(D.querySelector('.nv-bg')){ invChecked=false; return; }
    if(!session||session.viewAs||RUN||view.page==='editor') return;
    var d=data(), list=forRole(); if(!list.length) return;
    if(list.some(function(t){ var r=d.items[t.id]; return r&&(r.done||r.step>0); })) return;
    if(d.invite&&(d.invite.never||(d.invite.until||0)>Date.now())) return;
    var first=role()==='cliente'?'c-dash':'dash';
    var el=D.createElement('div'); el.className='tr-invite'+(narrow()?' sheet':''); el.setAttribute('role','dialog'); el.setAttribute('aria-labelledby','trInvT');
    el.innerHTML='<div class="k">Tour guiado</div><h4 id="trInvT">Quer conhecer a plataforma em 1 minuto?</h4><p>Mostramos cada área direto na tela, com destaque e explicação. Nada é alterado nos seus dados, e você pode rever quando quiser em “Tutoriais”.</p>'+
      '<div class="r"><button class="gold" data-a="go">Iniciar</button><button data-a="skip">Pular por enquanto</button><button class="lk" data-a="all">Ver todos</button></div>';
    el.addEventListener('click',function(e){ var a=e.target&&e.target.getAttribute('data-a'); if(!a) return; var dd=data();
      if(a==='skip'){ dd.invite={until:Date.now()+3*864e5,ts:Date.now()}; save(); closeInvite(); }
      else if(a==='go'){ dd.invite={never:true,ts:Date.now()}; save(); closeInvite(); start(first); }
      else if(a==='all'){ dd.invite={never:true,ts:Date.now()}; save(); closeInvite(); go('tutoriais'); } });
    D.body.appendChild(el); INV=el; try{ $('button.gold',el).focus({preventScroll:true}); }catch(e){}
  },1400);
}

/* ==========================================================================
   Integração com a plataforma (sem tocar nas funções originais além de envolver)
   ========================================================================== */
var ICN_TUT='<svg class="icon" viewBox="0 0 24 24"><path d="M2 5.5A2.5 2.5 0 0 1 4.5 3H10a2 2 0 0 1 2 2v15a2 2 0 0 0-2-2H4.5A2.5 2.5 0 0 1 2 15.5z"/><path d="M22 5.5A2.5 2.5 0 0 0 19.5 3H14a2 2 0 0 0-2 2v15a2 2 0 0 1 2-2h5.5a2.5 2.5 0 0 0 2.5-2.5z"/></svg>';
function hook(){
  if(W.__agionTour) return; if(typeof W.navItems!=='function'||typeof W.render!=='function'||typeof W.setTop!=='function') return setTimeout(hook,60);
  W.__agionTour=1;
  var _nav=W.navItems; W.navItems=function(){ var it=_nav.apply(this,arguments)||[]; if(!it.some(function(x){return x[0]==='tutoriais';})){ var ci=-1; it.forEach(function(x,i){ if(x[0]==='config') ci=i; }); var item=['tutoriais','Tutoriais',ICN_TUT]; if(ci>=0) it.splice(ci,0,item); else it.push(item); } return it; };
  var _rn=W.renderNav; W.renderNav=function(){ var r=_rn.apply(this,arguments);
    // no app do cliente a barra inferior tem espaço fixo: Tutoriais fica em Ajustes e no botão "?" do topo
    try{ if(isAppUI()&&role()==='cliente'){ $$('#mobnav a').forEach(function(a){ if(/go\('tutoriais'\)/.test(a.getAttribute('onclick')||'')) a.remove(); }); } }catch(e){}
    return r; };
  var _st=W.setTop; W.setTop=function(){ var r=_st.apply(this,arguments); try{ ensureHelp(); }catch(e){} return r; };
  var _r=W.render; W.render=function(){
    if(view.page==='tutoriais'&&session&&session.role){ try{ destroyCharts(); updateBell(); }catch(e){} var C=D.getElementById('content'); renderCenter(C); afterRender(); return; }
    var out=_r.apply(this,arguments); afterRender(); return out; };
  // Ajustes do cliente no app: atalho para a Central
  if(D.readyState!=='loading') boot(); else D.addEventListener('DOMContentLoaded',boot);
}
function afterRender(){
  try{ ensureHelp(); }catch(e){}
  // navegação feita pela pessoa durante o tutorial: pausa sem perder o passo
  if(RUN&&!RUN.nav){ var st=stepsOf(RUN.t)[RUN.i]||{}; var pg=st.page||(RUN.t.ficha==='cliente'?(role()==='cliente'?'plan':'editor'):RUN.t.page); if(pg&&view.page!==pg&&!(RUN.t.ficha==='lead')) stop('nav'); }
  if(view.page==='config'&&role()==='cliente'&&isAppUI()) cfgLink();
  leadModalHelp(); maybeInvite(); areaInvite();
}
function cfgLink(){ var C=D.getElementById('content'); if(!C||$('.tut-cfg',C)) return; var p=D.createElement('div'); p.className='panel tut-cfg';
  p.innerHTML='<h2>Tutoriais</h2><p class="note" style="margin:0 0 12px">Reveja como usar cada área do aplicativo.</p><button class="btn btn-gold btn-sm" onclick="go(\'tutoriais\')">Abrir tutoriais</button>'; C.appendChild(p); }
function boot(){ leadModalHelp(); try{ if(session&&session.role){ renderNav(); ensureHelp(); } }catch(e){} }
// trocar de conta / sair do "Ver como": encerra tutorial e recarrega o progresso do contexto certo
['verComo','sairVerComo','verComoCliente'].forEach(function(fn){ var tryWrap=function(){ if(typeof W[fn]!=='function') return setTimeout(tryWrap,80); if(W[fn].__tr) return; var o=W[fn]; W[fn]=function(){ if(RUN) stop('switch'); closeInvite(); closeAreaInvite(); P.key=null; return o.apply(this,arguments); }; W[fn].__tr=1; }; tryWrap(); });

W.AgionTour={running:function(){ return !!RUN; },reinvite:function(){ invChecked=false; maybeInvite(); areaInvite(); },start:start,stop:stop,list:function(){ return forRole().map(function(t){ return {id:t.id,title:t.title,status:status(t)}; }); },
  reset:function(id){ var d=data(); if(id) delete d.items[id]; else { d.items={}; d.invite=null; } save(); if(view.page==='tutoriais') render(); },
  config:CFG,_place:place};
hook();
})();
