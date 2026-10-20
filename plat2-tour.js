/* ==========================================================================
   Agion — plat2-tour.js · Tutoriais guiados do VISUAL NOVO (roda dentro do plat2-v4.html)
   Mesmo motor e mesmo visual dos tutoriais da versão anterior (plat-tour.js + plat-tour.css):
   destaque animado, seta pontilhada, cursor que "toca", digitação de exemplo, Reproduzir.
   - Um tutorial por aba, passando pelas sub-abas (as sub-abas são trocadas só na tela).
   - "Primeira vez aqui?" aparece uma vez em cada aba; o botão "?" do topo abre a qualquer hora.
   - Progresso por pessoa no servidor (tutorial_progresso, contexto 'v2'): feito no celular
     vale no computador e vice-versa.
   - Nenhuma demonstração altera dados: cliques e digitação são só visuais.
   Chat B · 19/out/2026
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
function role(){ try{ return W.effRoleR()||'master'; }catch(e){ return 'master'; } }
function narrow(){ return W.innerWidth<=640; }
function mob(){ return W.innerWidth<=860; }
function sleep(ms){ return new Promise(function(r){ setTimeout(r,ms); }); }
function RO(){ try{ return !!W.RO(); }catch(e){ return false; } }
function curPage(){ try{ if(W.cur==='cliente') return (W.curArg&&W.curArg.lead)?'ficha-lead':'ficha-cliente'; return W.cur; }catch(e){ return null; } }
function tabOk(p){ if(p==='ficha-lead') p='crm'; if(p==='ficha-cliente') p='clientes'; try{ return W.navList().some(function(t){ return t[0]===p; }); }catch(e){ return true; } }
function novidadesAbertas(){ try{ return !!(W.parent&&W.parent!==W&&W.parent.document.querySelector('.nv-bg')); }catch(e){ return false; } }

/* ---------- localizadores ---------- */
function q(sel){ return function(){ return $$(sel).filter(vis)[0]||null; }; }
function pan(sel){ return function(){ var e=$$(sel).filter(vis)[0]; return e?(e.closest('.panel')||e):null; }; }
function h3(txt){ txt=txt.toLowerCase(); return function(){ var h=$$('#view h3,#view h2').filter(function(x){ return vis(x)&&(x.textContent||'').toLowerCase().indexOf(txt)>=0; })[0]; return h?(h.closest('.panel')||h.closest('.ph')||h):null; }; }
function btn(txt,scope){ txt=txt.toLowerCase(); return function(){ return $$((scope||'#view')+' button').filter(function(b){ return vis(b)&&(b.textContent||'').toLowerCase().indexOf(txt)>=0; })[0]||null; }; }
function deal(sel){ return function(){ var c=$$('#kb .deal').filter(vis)[0]; return c?(sel?$(sel,c):c):null; }; }
/* troca de sub-aba (só a tela muda) */
function sub(id,k){ return function(){ var b=$('#'+id+' button[data-k="'+k+'"]'); if(b&&!b.classList.contains('on')) b.click(); }; }
function tx(m,d){ return function(){ return mob()?m:d; }; }

/* ---------- ícones ---------- */
var IC={
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  play:'<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>',
  pause:'<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
};

/* ==========================================================================
   1) TUTORIAIS — um por aba. page = chave da aba no visual novo.
   Passo: {t: alvo, act: função que prepara a tela (ex.: troca de sub-aba), title, text, demo:'click'|'type', typeText, optional, roles}
   text pode ser string, função, ou objeto por perfil {master, lider, especialista, _}.
   ========================================================================== */
var S3=['master','lider','especialista'], ML=['master','lider'], M=['master'];
var MENU={t:q('#mtab, #nav'),title:'Menu',text:tx('A barra de baixo tem todas as suas abas: deslize o dedo para os lados para ver as outras. “Mais” abre o restante (Ajustes, Tutoriais, Novidades).','O menu da esquerda separa as abas por área. A pílula dourada mostra onde você está; o botão no rodapé recolhe o menu para só os ícones.')};
var HELP={t:q('#how, .b-help'),title:'Ajuda em cada aba',text:'O botão “?” do topo abre o tutorial da aba em que você está. Todos os tutoriais ficam em Tutoriais, com o seu progresso.',optional:true};

var CFG=[
 /* ---------------- PAINEL ---------------- */
 {id:'painel',page:'painel',v:1,g:'Comece por aqui',title:'Painel',desc:'Seu dia em uma tela: números, produção, funil, tarefas e negócios quentes.',steps:[
   {t:null,title:'Bem-vindo à plataforma nova',text:{master:'É a mesma plataforma, com os mesmos dados, num visual novo e mais rápido. Este é o Painel: a operação inteira da Agion em uma tela. Vamos passar por cada parte, direto na tela — nada é alterado.',lider:'É a mesma plataforma, com os mesmos dados, num visual novo e mais rápido. Este é o Painel: você e a sua equipe em uma tela. Vamos passar por cada parte, direto na tela — nada é alterado.',especialista:'É a mesma plataforma, com os mesmos dados, num visual novo e mais rápido. Este é o seu Painel: só os seus leads, clientes e tarefas. Vamos passar por cada parte, direto na tela — nada é alterado.'}},
   MENU,
   {t:q('#pcomp'),title:'Competência',text:'Tudo o que é “do mês” segue a competência da administradora (dia 26 ao dia 25). Toque aqui para olhar outra competência.',optional:true},
   {t:q('#view .kpis'),title:'Números do topo',text:{master:'Clientes da empresa, patrimônio sob gestão, valor em negociação no CRM e tarefas de hoje. Os números sobem animados e cada cartão leva para a aba correspondente.',_:'Seus clientes, o patrimônio que você acompanha, o valor em negociação no CRM e as tarefas de hoje. Cada cartão leva para a aba correspondente.'}},
   {t:q('#pnv'),title:'Sub-abas do Painel',text:'Visão geral, Produção, Tarefas de hoje e Negócios quentes. Cada uma leva direto à parte do painel com esse assunto.',demo:'click'},
   {act:sub('pnv','prod'),t:pan('#chart'),title:'Produção da competência',text:'O valor vendido na competência, dia a dia. A linha tracejada é a meta — “definir meta” muda o objetivo do mês.'},
   {t:q('#rg'),title:'Diária, semanal ou mensal',text:'Troca o agrupamento do gráfico de produção. É só visualização.',demo:'click',optional:true},
   {t:pan('#fun'),title:'Funil de negócios',text:'Quantos leads há em cada etapa do CRM. Se uma etapa acumula, é ali que as negociações estão parando. “Abrir CRM” vai direto para o quadro.',optional:true},
   {act:sub('pnv','tar'),t:pan('#tht'),title:'Tarefas de hoje',text:'O que vence hoje, com o selo “Robô” quando a tarefa veio do follow-up da Alice. “Ver todas” abre a aba Tarefas.',optional:true},
   {t:pan('#pes'),title:'Patrimônio por especialista',text:{master:'Quanto cada especialista tem sob gestão — serve para comparar a equipe e distribuir leads com critério.',lider:'Quanto cada especialista da sua equipe tem sob gestão.',_:'O seu patrimônio sob gestão.'},optional:true},
   {t:pan('#rnk'),title:'Ranking da competência',text:'Quem mais vendeu na competência. Atualiza sozinho a cada venda registrada.',optional:true},
   {act:sub('pnv','hot'),t:pan('#hot'),title:'Negócios quentes',text:'Os leads com maior chance de fechar agora (lead score alto e etapa avançada). Toque num cartão para abrir o negócio.',optional:true},
   {t:q('#sk'),title:'Busca rápida',text:tx('A lupa busca qualquer lead, cliente ou aba.','A busca (ou ⌘K / Ctrl+K) encontra qualquer lead, cliente ou aba.'),optional:true},
   {t:q('#bell'),title:'Notificações',text:'Leads novos, tarefas e avisos da equipe. O número vermelho mostra o que você ainda não viu. Em Ajustes você escolhe o que quer receber.',optional:true},
   HELP
 ]},
 /* ---------------- KPIs ---------------- */
 {id:'kpis',page:'kpis',v:1,g:'Comece por aqui',title:'KPIs',desc:'O dashboard gerencial: categorias, origem, conversão, atividade, desempenho e metas.',steps:[
   {t:null,title:'Dashboard gerencial',text:'Os indicadores da empresa em gráficos. Tudo aqui é leitura — nada que você tocar muda os dados.'},
   {t:q('#kps'),title:'Período',text:'“Todo o período” soma tudo; “Por competência” mostra uma competência (26 a 25); “Histórico” mostra um intervalo de datas que você escolhe.',demo:'click'},
   {t:q('#view .kpis'),title:'Resumo',text:'Clientes, leads aguardando, pipeline do CRM, patrimônio, produção e conversão do período escolhido.'},
   {t:h3('base de clientes'),title:'Base de clientes por categoria',text:'Automóvel, imóvel, investimento e serviços: quanto crédito e quantos clientes em cada categoria.'},
   {t:h3('vendas fechadas'),title:'Vendas fechadas por categoria',text:'O que foi vendido no período, por categoria de carta.',optional:true},
   {t:h3('crm por categoria'),title:'CRM por categoria',text:'O que ainda está em negociação, por categoria. Comparando com as vendas, você vê o que está entrando.',optional:true},
   {t:h3('origem dos leads'),title:'Origem dos leads',text:'De onde os leads chegaram (Google, Meta, site, indicação…). Use para decidir onde investir em captação.',optional:true},
   {t:h3('conversão por etapa'),title:'Conversão por etapa',text:'Quantos passam de uma etapa para a outra. Uma queda grande mostra onde a equipe perde negócios.',optional:true},
   {t:h3('atividade da equipe'),title:'Atividade da equipe',text:'O que cada pessoa fez na plataforma, com o seletor de período ao lado.',optional:true},
   {t:h3('novos clientes'),title:'Novos clientes por mês',text:'Quantos clientes entraram em cada mês — escolha 3, 6, 12 meses ou 2 anos.',optional:true},
   {t:h3('desempenho da equipe'),title:'Desempenho da equipe',text:'Produção, conversão e carteira de cada pessoa, lado a lado.',optional:true},
   {t:h3('metas'),title:'Metas',text:'A meta de cada pessoa e quanto já foi feito. “Gerenciar metas” define os valores.',roles:M,optional:true},
   {t:btn('exportar','#view .hx'),title:'Exportar',text:'Baixa os números em planilha.',optional:true}
 ]},
 /* ---------------- TAREFAS ---------------- */
 {id:'tarefas',page:'tarefas',v:1,g:'Comercial',title:'Tarefas',desc:'Sua agenda de follow-ups: atrasadas, hoje, próximas, feitas e não feitas.',steps:[
   {t:null,title:'Sua agenda de follow-ups',text:{_:'Tarefas suas e da equipe, as que a Alice (robô) cria no follow-up e os lembretes do CRM — tudo em ordem de data.',especialista:'As suas tarefas, as que a Alice (robô) cria no follow-up dos seus leads e os lembretes do CRM — tudo em ordem de data.'}},
   {t:q('#nt'),title:'Nova tarefa',text:'Cria uma ligação, WhatsApp, reunião ou lembrete, com data, hora e lead. A tarefa só é gravada quando você salva.',demo:'click'},
   {t:q('#ntf'),title:'Notificações no celular',text:'Ative uma vez em cada aparelho: o celular avisa quando alguém cria uma tarefa para você, na hora de cada tarefa e com um resumo às 8h30.',optional:true},
   {t:q('#tst'),title:'Pendentes, feitas, não feitas, todas',text:'Pendentes é o seu dia a dia. Em Feitas e Não feitas fica o histórico com a resposta e a anotação de cada uma.',demo:'click'},
   {t:q('#tnum'),title:'Os números do dia',text:'Atrasadas, para hoje, próximos 7 dias e feitas hoje. Toque num cartão para ver só aquelas tarefas.'},
   {t:q('#tw'),title:'De quem são as tarefas',text:'Minhas tarefas, toda a equipe ou uma pessoa específica.',roles:ML,optional:true},
   {t:q('#tq'),title:'Busca',text:'Procure pela tarefa ou pelo nome do lead.',demo:'type',typeText:'Ligar',optional:true},
   {t:q('#tch'),title:'Filtro por tipo',text:'Ligação, WhatsApp, reunião, robô… Toque num chip para ver só esse tipo.',optional:true},
   {t:q('#tl .tk'),title:'A tarefa',text:'Toque para abrir: marque “Feita” ou “Não feita”, escolha a resposta (atendeu, não atendeu…), escreva a anotação e salve. “Abrir lead” vai para a ficha; “Arquivar” tira da lista.',optional:true},
   {t:q('#tl .robo'),title:'Tarefas do robô',text:'O selo “Robô” marca tarefas criadas pela Alice no follow-up dos leads novos — já com o telefone para ligar ou chamar no WhatsApp.',optional:true},
   {act:sub('tst','feitas'),t:q('#tl'),title:'Feitas',text:'Aqui ficam as concluídas, com a resposta e a anotação. “Reabrir” devolve para pendentes.',optional:true},
   {act:sub('tst','pend'),t:q('#tst'),title:'De volta às pendentes',text:'Pronto. Sempre que abrir a plataforma, comece por aqui.'}
 ]},
 /* ---------------- CRM ---------------- */
 {id:'crm',page:'crm',v:1,g:'Comercial',title:'CRM',desc:'O funil de negócios: quadro, lista, perdidos, filtros e cada parte do cartão do lead.',post:function(){ sub('vw','quadro')(); },steps:[
   {t:q('#view .kpis'),title:'Resumo do funil',text:{_:'Valor em pipeline, leads ativos, ganho no período e conversão, com o valor ponderado pela chance de cada etapa.',especialista:'Seu valor em negociação, seus leads ativos, o que você ganhou no período e a sua conversão.'}},
   {t:q('#nl'),title:'Novo lead',text:'Cadastra um lead à mão (quem chegou por telefone ou indicação). Nada é salvo até você confirmar.',demo:'click'},
   {t:q('#vw'),title:'Quadro, Lista e Perdidos',text:'Três jeitos de ver o mesmo funil. Vamos passar pelos três.',demo:'click'},
   {t:q('#dban'),title:'Leads aguardando distribuição',text:'Leads que ainda não têm responsável. Use “Designar” no cartão ou distribua todos de uma vez.',roles:ML,optional:true},
   {t:q('#q'),title:'Busca',text:'Procure por nome, contato ou observação.',demo:'type',typeText:'Maria',optional:true},
   {t:q('#fbar .dd, #ddv'),title:'Filtros',text:'Valor, categoria, origem e ordenação. Os filtros só mudam o que aparece; “Limpar filtros” volta tudo.',optional:true},
   {t:q('#fbar .avf'),title:'Filtro por pessoa',text:'Toque na foto de alguém para ver só os leads dessa pessoa.',roles:ML,optional:true},
   {t:q('#kbs'),title:'Etapas',text:'No celular, esta faixa mostra as etapas com a quantidade de leads. Toque numa etapa para ir até a coluna — ela fica presa no topo enquanto você rola.',optional:true},
   {t:q('#kb .col'),title:'Colunas = etapas',text:tx('Cada coluna é uma etapa: Novo lead → Contato feito → Estudo/Simulação → Proposta enviada → Fechado. Deslize para os lados para ver as outras.','Cada coluna é uma etapa: Novo lead → Contato feito → Estudo/Simulação → Proposta enviada → Fechado. No computador, arraste o cartão para outra coluna para mudar a etapa.')},
   {t:deal(),title:'O cartão do lead',text:'A cor do cartão é a etapa. Toque no cartão para abrir o negócio completo: histórico, WhatsApp, proposta, mudar de etapa.'},
   {t:deal('.catp, .d1 button, .d1 .pill'),title:'Categoria',text:'Imóvel, automóvel, investimento, serviços… e o objetivo (aquisição, alavancagem…). Toque para trocar — isso alimenta os KPIs por categoria.',optional:true},
   {t:deal('.wab'),title:'WhatsApp',text:'Abre a conversa com o lead dentro da plataforma, na aba Conversas.',optional:true},
   {t:deal('.dr'),title:'Lead score',text:'De 0 a 100: quanto maior, mais quente o lead (etapa, atividade, valor e tempo sem contato).',optional:true},
   {t:deal('.atr'),title:'Responsável',text:{master:'Quem atende o lead. Toque para designar ou trocar a pessoa.',lider:'Quem atende o lead. Você designa entre os especialistas da sua equipe.'},roles:ML,optional:true},
   {t:deal('[data-a="nota"]'),title:'Nota',text:'Registra uma anotação no histórico do lead.',optional:true},
   {t:deal('[data-a="prop"]'),title:'Proposta com IA',text:'Abre o gerador de propostas já com os dados do lead.',optional:true},
   {t:deal('.gp'),title:'Ganho ou perdeu',text:'Fecha a negociação. “Ganho” leva o lead para Fechado e permite transformar em cliente; “Perdeu” tira do funil com o motivo.',optional:true},
   {t:deal('.dft'),title:'Entrada e edição',text:'Quando o lead entrou e há quantos dias. O lápis edita os dados.',optional:true},
   {act:sub('vw','lista'),t:q('#kb, #view .tbl'),title:'Lista',text:'O mesmo funil em tabela, bom para ver muitos leads de uma vez, com Ganho e Perdido em cada linha.',optional:true},
   {act:sub('vw','perdidos'),t:q('#lost, #view .tbl'),title:'Perdidos',text:'Os leads que saíram do funil, com o motivo. Dá para reabrir um lead daqui.',optional:true},
   {act:sub('vw','quadro'),t:q('#vw'),title:'Pronto',text:'De volta ao quadro. O funil fica sempre atualizado em tempo real para toda a equipe.'}
 ]},
 /* ---------------- FICHA DO LEAD ---------------- */
 {id:'ficha-lead',page:'crm',ficha:'lead',v:1,g:'Comercial',title:'Ficha do lead',desc:'Tudo de um lead: cadastro, negócio, planejamento, histórico e atalhos.',steps:[
   {t:q('#view .hx'),title:'Ficha do lead',text:'Abre ao tocar em um lead (no CRM, na busca ou nas tarefas). Aqui está tudo sobre ele.'},
   {t:q('#bk'),title:'Voltar',text:'Volta para a tela de onde você veio.',optional:true},
   {t:q('#view .kpis'),title:'Resumo',text:'Etapa no CRM, valor da carta e tarefas abertas.',optional:true},
   {t:q('#qwa'),title:'Atalhos',text:'WhatsApp, ligar, e-mail, nova tarefa e proposta — um toque cada.',optional:true},
   {t:q('#fp'),title:'Criar proposta',text:'Abre o gerador de propostas com os dados deste lead.',optional:true},
   {t:q('#fg'),title:'Marcar ganho',text:'Fecha o negócio e transforma o lead em cliente.',optional:true},
   {t:q('#ctab'),title:'Sub-abas da ficha',text:'Cadastro completo, Negócio, Planejamento e Histórico.',demo:'click'},
   {act:sub('ctab','cad'),t:q('#tabc'),title:'Cadastro completo',text:'Os dados da pessoa. “Colar dados” lê a ficha da administradora e preenche os campos (RG, endereço, renda…) sozinho; você confere e salva.'},
   {act:sub('ctab','cartas'),t:q('#tabc'),title:'Negócio',text:'A carta que está sendo negociada: categoria, valor, lance e parcela desejada.',optional:true},
   {act:sub('ctab','plano'),t:q('#tabc'),title:'Planejamento',text:'O planejamento financeiro: objetivo, aportes e cenários.',optional:true},
   {act:sub('ctab','hist'),t:q('#tabc'),title:'Histórico',text:'Tudo o que aconteceu: notas, mudanças de etapa, tarefas e mensagens.',optional:true}
 ]},
 /* ---------------- CAPTAÇÃO (+ distribuição) ---------------- */
 {id:'captacao',page:'captacao',v:1,g:'Comercial',title:'Captação',desc:'A caixa de entrada dos anúncios e a distribuição de leads.',post:function(){ sub('capsn','ibx')(); },steps:[
   {t:null,title:'Captação de leads',text:'Os leads do Google e da Meta caem aqui em tempo real. E a distribuição decide quem atende cada um.'},
   {t:q('#capsn'),title:'Caixa de entrada e Distribuição',text:'Duas sub-abas: os leads que chegaram e as regras de quem recebe.',demo:'click'},
   {act:sub('capsn','ibx'),t:q('#capk'),title:'Números da captação',text:'Leads aguardando, já importados e quantos viraram oportunidade.'},
   {t:q('#capc'),title:'Canais conectados',text:'Google Ads e Meta (Facebook/Instagram). Conectado = os leads dos formulários chegam sozinhos.',optional:true},
   {t:pan('#ibx'),title:'Caixa de entrada',text:'Cada lead novo aparece aqui. “Importar p/ funil” cria o cartão no CRM (ação real) e a distribuição escolhe quem atende.',optional:true},
   {t:q('#sim'),title:'Simular chegada',text:'Cria um lead de teste para ver o caminho completo. Use só para testar.',optional:true},
   {act:sub('capsn','dist'),t:q('#don'),title:'Ligar a distribuição',text:'Ligada: o lead novo vai direto para a pessoa da vez — e só ela recebe o aviso. Desligada: entra sem responsável e o aviso vai para todos.',wait:5000,optional:true},
   {t:q('#dmo'),title:'Como distribuir',text:'Rodízio (um para cada), por peso (quem tem nível maior recebe mais), por categoria (imóvel, carro…) ou manual.',optional:true},
   {t:q('#mkb .tbl'),title:'Quem participa',text:'Liga e desliga cada pessoa, define o limite por dia (ou o nível) e mostra quantos cada um recebeu hoje, em 7 e em 30 dias.',optional:true},
   {act:sub('capsn','ibx'),t:q('#capsn'),title:'Pronto',text:'Lead novo chega, a distribuição escolhe quem atende e essa pessoa recebe o aviso no celular.'}
 ]},
 /* ---------------- MARKETING ---------------- */
 {id:'marketing',page:'marketing',v:1,g:'Comercial',title:'Marketing',desc:'Visão geral, automações, lead scoring, templates, campanhas e integrações.',post:function(){ sub('mkt','ov')(); },steps:[
   {t:q('#mkt'),title:'Seis seções',text:'Visão geral, Automações, Leads & Scoring, Templates, Campanhas e Integrações. Vamos abrir uma por uma.',demo:'click'},
   {act:sub('mkt','ov'),t:q('#mkb'),title:'Visão geral',text:'O funil de marketing (leads → qualificados → oportunidades → vendas) e a origem dos leads.'},
   {act:sub('mkt','auto'),t:q('#mkb .g3, #mkb'),title:'Automações',text:'Boas-vindas automática no WhatsApp, distribuição de leads (“Configurar”) e lead parado vira tarefa. A chave liga e desliga cada uma.'},
   {t:q('#vlp'),title:'Verificação manual',text:'Roda agora a checagem de leads parados.',optional:true},
   {act:sub('mkt','score'),t:q('#mkb .g4, #mkb'),title:'Leads & Scoring',text:'Os leads separados em perfis A (quentes) a D (frios) pelo lead score, e embaixo a lista dos mais quentes.'},
   {act:sub('mkt','tpl'),t:q('#tplg, #mkb'),title:'Templates',text:'As mensagens prontas do WhatsApp aprovadas pela Meta, com o texto de cada uma. São usadas pelo robô e no botão de templates das Conversas.',wait:5000},
   {t:q('#tpln, #mktpl'),title:'Criar template',text:'Monta uma mensagem nova e envia para aprovação da Meta. Nada é enviado a clientes por aqui.',optional:true},
   {act:sub('mkt','camp'),t:q('#mkb'),title:'Campanhas',text:'O follow-up automático do robô e a nutrição high-ticket. O gerador de propostas também abre daqui.'},
   {act:sub('mkt','intg'),t:q('#mkb'),title:'Integrações',text:'WhatsApp Business, Meta Lead Ads, Google Ads, e-mail e o webhook de captação — o que está conectado aparece em verde.'}
 ]},
 /* ---------------- CONVERSAS ---------------- */
 {id:'conversas',page:'conversas',v:1,g:'Atendimento',title:'Conversas',desc:'O WhatsApp da Agion: a Alice atende, você assume quando quiser.',steps:[
   {t:null,title:'Conversas do WhatsApp',text:{master:'Todas as conversas do WhatsApp da empresa. A Alice (robô) atende 24h e faz o follow-up; você assume quando quiser.',_:'As conversas dos seus leads e clientes. A Alice (robô) atende 24h e faz o follow-up; você assume quando quiser.'}},
   {t:q('#cvsn'),title:'Filtros',text:'Todas, Não lidas, Clientes, Leads, Com a Alice e Com pessoa (quem um humano está atendendo).',demo:'click',wait:5000},
   {t:q('#cvq'),title:'Busca',text:'Procure por nome ou telefone.',demo:'type',typeText:'Carla'},
   {t:q('#cvls'),title:'Lista de conversas',text:'Etiquetas “Cliente” e “Novo lead”, o aviso vermelho “quer pessoa” quando o lead pediu um atendente, e a bolinha de quem está no comando: Alice ou pessoa.'},
   {t:q('#cvc'),title:'A conversa',text:'Ao tocar numa conversa ela abre aqui. Em cima, “Assumir” coloca você no comando (a Alice fica em silêncio) e “Devolver” devolve para ela. Embaixo: respostas rápidas ⚡, templates e o campo para escrever.'},
   {t:q('#cvr'),title:'Painel do contato',text:'Etapa do lead, responsável e atalhos para a ficha e o CRM.',optional:true},
   {t:q('#cvn'),title:'Nova conversa',text:'Inicia uma conversa com um número — fora da janela de 24h é preciso usar um template aprovado.',optional:true},
   {t:q('#cvr2'),title:'Atualizar',text:'Busca as mensagens mais novas. A lista também se atualiza sozinha.',optional:true}
 ]},
 /* ---------------- DISPAROS ---------------- */
 {id:'disparos',page:'disparos',v:1,g:'Atendimento',title:'Disparos',desc:'Cérebro do bot, números e tudo o que a Alice enviou.',post:function(){ sub('dsn','cer')(); },steps:[
   {t:null,title:'Disparos do robô',text:'Tudo o que a Alice enviou no WhatsApp e por e-mail: templates, lembretes e boletos.'},
   {t:q('#dsn'),title:'Três seções',text:'Cérebro do bot, Números e Contatos e envios.',demo:'click',wait:6000},
   {act:sub('dsn','cer'),t:q('#dcer'),title:'Cérebro do bot',text:'Qual inteligência responde aos clientes: Automático (escolhe sozinho), Claude ou Gemini.'},
   {act:sub('dsn','num'),t:q('#dnum'),title:'Números',text:'Contatos com envio, boletos, lembretes e o total de disparos no período.'},
   {act:sub('dsn','cont'),t:q('#dq'),title:'Contatos e envios',text:'Busque um contato para ver tudo o que ele recebeu.',demo:'type',typeText:'Maria',optional:true},
   {t:q('#dch'),title:'WhatsApp ou e-mail',text:'Troca entre os envios do WhatsApp e os e-mails do follow-up.',optional:true},
   {t:q('#dls'),title:'Lista de envios',text:'Cada contato com a data e o que foi enviado.',optional:true}
 ]},
 /* ---------------- FEED ---------------- */
 {id:'feed',page:'feed',v:1,g:'Atendimento',title:'Feed',desc:'Novidades, vitórias e avisos da equipe, ao vivo.',steps:[
   {t:q('#fsn'),title:'Tudo, Vitórias e Avisos',text:'Filtre o que aparece no feed.',demo:'click',wait:5000},
   {t:q('#fp'),title:'Publicar',text:'Escreva uma novidade, vitória ou aviso para a equipe.',demo:'type',typeText:'Fechamos mais uma carta!'},
   {t:q('#ftp'),title:'Tipo da publicação',text:'Novidade, Vitória ou Aviso — cada um com a sua cor.',optional:true},
   {t:q('#fpb'),title:'Publicar',text:'Envia para todos na hora.',optional:true},
   {t:q('#fl'),title:'As publicações',text:'Reaja, comente e acompanhe. Quem publicou pode arquivar.',optional:true},
   {t:pan('#fpl'),title:'Placar da competência',text:'A produção de cada pessoa na competência.',optional:true},
   {t:pan('#fmk'),title:'Próximos marcos',text:'Aniversários de casa e metas próximas.',optional:true}
 ]},
 /* ---------------- CHAT ---------------- */
 {id:'chat',page:'chat',v:1,g:'Atendimento',title:'Chat da equipe',desc:'Canais internos e mensagens diretas.',steps:[
   {t:q('#chl'),title:'Canais e conversas',text:'Os canais da equipe (#) e as suas mensagens diretas.',wait:5000},
   {t:q('#chn'),title:'Nova conversa',text:'Começa uma mensagem direta com um colaborador. Mensagens diretas são privadas.',optional:true},
   {t:q('#chm'),title:'Mensagens',text:'A conversa do canal escolhido, ao vivo.',optional:true},
   {t:q('#chi'),title:'Escrever',text:'Digite e toque em enviar.',demo:'type',typeText:'Bom dia, equipe!',optional:true}
 ]},
 /* ---------------- CLIENTES ---------------- */
 {id:'clientes',page:'clientes',v:1,g:'Carteira',title:'Clientes',desc:'A carteira: categorias, situação, busca e a ficha de cada cliente.',steps:[
   {t:q('#view .kpis'),title:'Resumo da carteira',text:'Clientes, crédito sob gestão, contemplados e quem está com parcela em aberto.'},
   {t:q('#ccat'),title:'Categorias',text:'Todos, Automóvel, Imóvel, Investimento e Serviços, com a quantidade em cada uma.',demo:'click'},
   {t:q('#csit'),title:'Situação',text:'Em dia, contemplado, em atraso, cancelado.',optional:true},
   {t:q('#cwho'),title:'Especialista',text:'Veja a carteira de uma pessoa específica.',roles:ML,optional:true},
   {t:q('#cq'),title:'Busca',text:'Nome, CPF, grupo ou cota.',demo:'type',typeText:'Silva',optional:true},
   {t:function(){ var g=$('#cg'); return g?($$('#cg > *').filter(vis)[0]||g):null; },title:'O cliente',text:'Cada cartão mostra administradora (HS ou Âncora), cartas, situação e desde quando é cliente. Toque para abrir a ficha completa.',optional:true},
   {t:q('#ncl'),title:'Novo cliente',text:'Cadastra um cliente — dá para colar os dados da administradora e a plataforma preenche.',optional:true},
   {t:q('#cexp'),title:'Exportar',text:'Baixa a carteira em planilha.',optional:true}
 ]},
 /* ---------------- FICHA DO CLIENTE ---------------- */
 {id:'ficha-cliente',page:'clientes',ficha:'cliente',v:1,g:'Carteira',title:'Ficha do cliente',desc:'Cadastro, cartas, planejamento e histórico de um cliente.',steps:[
   {t:q('#view .hx'),title:'Ficha do cliente',text:'Abre ao tocar num cliente. Tudo dele em um lugar.'},
   {t:q('#qwa'),title:'Atalhos',text:'WhatsApp, ligar, e-mail, tarefa e proposta.',optional:true},
   {t:q('#ctab'),title:'Sub-abas',text:'Cadastro completo, Cartas, Planejamento e Histórico.',demo:'click'},
   {act:sub('ctab','cad'),t:q('#tabc'),title:'Cadastro completo',text:'Dados pessoais, endereço e renda. “Colar dados” lê a ficha da administradora e preenche sozinho.'},
   {act:sub('ctab','cartas'),t:q('#tabc'),title:'Cartas',text:'Cada carta: administradora, grupo, cota, parcelas pagas, contemplação.',optional:true},
   {act:sub('ctab','plano'),t:q('#tabc'),title:'Planejamento',text:'O plano do cliente: editor do plano, cenários, aportes e resgates.',optional:true},
   {act:sub('ctab','hist'),t:q('#tabc'),title:'Histórico',text:'Tudo o que aconteceu com o cliente.',optional:true}
 ]},
 /* ---------------- CADASTRO ---------------- */
 {id:'cadastro',page:'cadastro',v:1,g:'Carteira',title:'Cadastro único',desc:{master:'Uma pessoa, um cadastro: leads, clientes e WhatsApp ligados.',_:'Os cadastros dos seus clientes e dos seus leads, cada pessoa uma vez só.'},steps:[
   {t:q('#view .banner'),title:'Cadastro único',text:'Cada pessoa aparece uma vez só. Quando ela volta (novo lead, nova carta), a plataforma liga ao mesmo cadastro pelo telefone, CPF ou e-mail.',optional:true},
   {t:q('#cads'),title:'Filtros',text:'Todos, Clientes, Leads em andamento, Próprios de colaboradores e Origem Agion.',demo:'click'},
   {t:q('#view .kpis'),title:'Números',text:{master:'Pessoas no cadastro, clientes, leads, origem e os casos que precisam de atenção (possíveis duplicados).',_:'Quantas pessoas ligadas a você, quantas já são clientes e quantas estão em negociação.'},optional:true},
   {t:q('#cdq'),title:'Busca',text:'Nome, telefone, CPF ou e-mail.',demo:'type',typeText:'Josiane',optional:true},
   {t:q('#pl'),title:'Pessoas',text:'Cada linha é uma pessoa, com a situação e a origem. “Abrir ficha” mostra tudo dela.',optional:true},
   {t:q('#cdx'),title:'Exportar CSV',text:'Baixa o cadastro completo.',roles:['master'],optional:true}
 ]},
 /* ---------------- CONSULTORIA ---------------- */
 {id:'consultoria',page:'consultoria',v:1,g:'Carteira',title:'Consultoria',desc:'Visão geral, estratégias, receita por faixa e carteiras.',post:function(){ sub('cosn','vg')(); },steps:[
   {t:q('#cosn'),title:'Quatro seções',text:'Visão geral, Estratégias, Receita por faixa e Carteiras — cada uma leva à parte da página.',demo:'click'},
   {act:sub('cosn','vg'),t:q('#chero'),title:'Visão geral',text:'Patrimônio em consultoria, receita e a evolução das carteiras.',optional:true},
   {act:sub('cosn','est'),t:h3('estratégias'),title:'Estratégias',text:'As estratégias de investimento usadas e quanto há em cada uma.',optional:true},
   {act:sub('cosn','rec'),t:h3('receita por faixa'),title:'Receita por faixa',text:'Quanto a consultoria rende por faixa de patrimônio.',optional:true},
   {act:sub('cosn','car'),t:h3('carteiras'),title:'Carteiras',text:'A carteira de cada cliente, com filtro por perfil (conservador, moderado, arrojado). Toque para ver aportes, resgates e evolução.',optional:true},
   {t:q('#cpf'),title:'Perfil',text:'Filtra as carteiras pelo perfil do investidor.',optional:true},
   {t:q('#cstn'),title:'Novo cliente',text:'Adiciona um cliente à consultoria.',optional:true}
 ]},
 /* ---------------- COMISSÕES ---------------- */
 {id:'comissoes',page:'comissoes',v:1,g:'Carteira',title:'Comissões',desc:{master:'Comissões da empresa: administradoras, equipe e Agion.',_:'Suas comissões: produção, parcelas e pós-contemplação.'},steps:[
   {t:q('#cper'),title:'Competência ou todo o período',text:'Competência = dia 26 ao 25 (padrão da HS). “Todo o período” soma tudo.',demo:'click'},
   {t:q('#cck'),title:'Qual competência',text:'Escolha a competência que quer ver.',optional:true},
   {t:q('#cmsb'),title:'Os cartões',text:{master:'Cada cartão é uma visão (administradoras, equipe, Agion, previsão). Toque num cartão para ver o detalhe embaixo.',_:'Sua produção, sua comissão e o pós-contemplação. Toque num cartão para ver o detalhe embaixo.'}},
   {t:q('#imp'),title:'Importar',text:'Envie o PDF da administradora: pagamentos do mês (todo dia 11), resultado de assembleia ou datas de assembleia. Você confere antes de gravar.',roles:M,optional:true},
   {t:q('#rv'),title:'Registrar venda',text:'Lança uma venda nova — ela entra na comissão pela data real da venda.',optional:true}
 ]},
 /* ---------------- FERRAMENTAS ---------------- */
 {id:'ferramentas',page:'ferramentas',v:1,g:'Ferramentas',title:'Ferramentas',desc:'Calculadoras, gerador de propostas e assembleias.',steps:[
   {t:q('#fsn2'),title:'Tipos de ferramenta',text:'Calculadoras, Estratégias, IA, Equipe e as que estão chegando.',demo:'click'},
   {t:q('.tc[data-k="fin"]'),title:'Financiamento × Consórcio',text:'Compara custo real, CET e SAC/Price com o consórcio — carta nova ou contemplada. Abre em outra aba para usar na frente do cliente.',optional:true},
   {t:q('.tc[data-k="esc"]'),title:'Escada Financeira',text:'Monta a escada de cartas que se paga sozinha.',optional:true},
   {t:q('.tc[data-k="ala"]'),title:'Alavancagem Patrimonial',text:'Simula vender a carta contemplada com ágio ou transformá-la em renda.',optional:true},
   {t:q('.tc[data-k="prop"]'),title:'Gerador de Propostas',text:'Monta a proposta do cliente e baixa em PDF ou PNG (várias páginas vêm num .zip). No iPhone abre o Compartilhar.',optional:true},
   {t:q('.tc[data-k="ass"]'),title:'Assembleias',text:'Resultado mensal dos grupos por administradora e categoria: sorteio, lances e calendário.',optional:true},
   {t:q('.tc .how'),title:'Tutorial de cada ferramenta',text:'Cada ferramenta tem o seu tutorial: toque em “Tutorial” no cartão ou em “Como usar esta ferramenta” dentro dela.',optional:true}
 ]},
 /* ---------------- CONTAS ---------------- */
 {id:'contas',page:'contas',v:1,g:'Gestão',title:'Contas',desc:{master:'Pessoas, funções, permissões e acesso.',_:'Quem é quem na equipe: o nome e a função de cada pessoa.'},steps:[
   {t:q('#view .banner'),title:'Hierarquia',text:{master:'Master › Líder › Especialista › Cliente. Cada um vê só o que é seu.',_:'Aqui você vê o nome e a função de cada pessoa da equipe. Os dados de cada um ficam só com ela.'},optional:true},
   {t:q('#orgp'),title:'Organograma',text:{master:'Quem fica abaixo de quem. Toque numa pessoa para editar os dados; “Adicionar pessoa” inclui alguém que não tem login.',_:'Quem fica abaixo de quem na Agion. Toque no seu cartão para trocar sua foto, nome e WhatsApp.'},optional:true},
   {t:q('#view .kpis'),title:'Quantas contas',text:'Líderes, especialistas e clientes com acesso.',roles:M,optional:true},
   {t:q('#ctsn'),title:'Filtros',text:'Todos, Master, Líderes, Especialistas e Clientes.',demo:'click',roles:M},
   {t:q('#ctq'),title:'Busca',text:'Procure uma pessoa.',roles:M,optional:true},
   {t:btn('ver como','#ctl'),title:'Ver como',text:'Mostra a plataforma exatamente como aquela pessoa vê — só leitura, sem mexer em nada.',roles:M,optional:true},
   {t:btn('atribuição','#ctl'),title:'Atribuição',text:'Troca a função (Líder ou Especialista) e escolhe o líder de cada especialista.',roles:M,optional:true},
   {t:btn('resetar','#ctl'),title:'Resetar senha e desativar',text:'Envia a redefinição de senha ou tira o acesso da pessoa.',roles:M,optional:true},
   {t:q('#ncta'),title:'Nova conta',text:'Cria o acesso de uma pessoa nova.',roles:M,optional:true},
   {t:btn('editar meus dados','#ctl'),title:'Seus dados',text:'Troque sua foto, seu nome e seu WhatsApp. A função quem define é o master.',roles:['lider','especialista'],optional:true}
 ]},
 /* ---------------- ATIVIDADES ---------------- */
 {id:'atividades',page:'atividades',v:1,g:'Gestão',title:'Atividades',desc:'O histórico auditável de tudo o que acontece na plataforma.',steps:[
   {t:q('#view .banner'),title:'Registro automático',text:'Tudo o que cada pessoa faz fica gravado no servidor, sem possibilidade de apagar.',wait:6000,optional:true},
   {t:q('#view .kpis'),title:'Resumo',text:'Eventos no período, nas últimas 24 horas e usuários ativos.',optional:true},
   {t:q('#atsn'),title:'Linha do tempo e Participantes',text:'Veja tudo em ordem de hora ou a atividade de cada pessoa. Toque numa pessoa para filtrar.',demo:'click',optional:true},
   {t:q('#lg'),title:'Linha do tempo',text:'Cada ação com data, pessoa e descrição.',optional:true},
   {t:q('#atx'),title:'Exportar CSV',text:'Baixa o histórico filtrado.',optional:true}
 ]},
 /* ---------------- AJUSTES ---------------- */
 {id:'ajustes',page:'ajustes',v:1,g:'Gestão',title:'Ajustes',desc:'Conta, foto, notificações, celular, aparência e versão anterior.',steps:[
   {t:q('#ajsn'),title:'Seções',text:'Conta, Notificações, Celular e Aparência.',demo:'click'},
   {t:q('#ajc'),title:'Conta e foto',text:'Toque na foto para trocar — ela aparece para toda a equipe no menu, no CRM e nas conversas.'},
   {t:q('#ajn'),title:'O que você recebe',text:'Clientes, Plataforma e Equipe: o que estiver desligado some do sininho.',optional:true},
   {t:q('#ajpush, #ajinst'),title:'Celular',text:'Ative as notificações neste aparelho e instale o app na tela de início. Depois de instalado, ele se atualiza sozinho — não precisa baixar de novo.',optional:true},
   {t:q('#tema'),title:'Aparência',text:'Tema claro (creme) ou escuro (verde-petróleo).',optional:true},
   {t:q('#v2ant'),title:'Versão anterior',text:'A plataforma antiga continua disponível aqui, com os mesmos dados.',optional:true},
   {t:q('#ajnov'),title:'Novidades',text:'Tudo o que mudou em cada versão.',optional:true}
 ]}
];
var GROUP_ORDER=['Comece por aqui','Comercial','Atendimento','Carteira','Ferramentas','Gestão'];

function TX(v){ if(v==null) return ''; if(typeof v==='function') return v(); if(typeof v==='string') return v; var r=role(); return v[r]!=null?v[r]:(v._!=null?v._:(v.master||v.lider||v.especialista||'')); }
function stepsOf(t){ var r=role(); return t.steps.filter(function(st){ return !st.roles||st.roles.indexOf(r)>=0; }); }
function forRole(){ return CFG.filter(function(t){ return tabOk(t.ficha==='lead'?'ficha-lead':t.ficha==='cliente'?'ficha-cliente':t.page); }); }
function byId(id){ for(var i=0;i<CFG.length;i++) if(CFG[i].id===id) return CFG[i]; return null; }
function forPage(pg){ if(pg==='ficha-lead'||pg==='ficha-cliente') return byId(pg); return forRole().filter(function(t){ return t.page===pg&&!t.ficha; })[0]||null; }

/* ==========================================================================
   4) PROGRESSO — por pessoa (servidor: tutorial_progresso, contexto 'v2') + cache local
   ========================================================================== */
var P={key:null,data:null}, SV={off:false,pulled:{},timer:null,uid:null};
function SB(){ try{ return W.psb(); }catch(e){ return null; } }
function meId(){ try{ return W.realId(); }catch(e){ return null; } }
function stor(){ return RO()?W.sessionStorage:W.localStorage; }
function pkey(){ return 'agion:tutorial:v2:'+(meId()||'anon')+(RO()?':ver':''); }
function data(){ var k=pkey(); if(P.key!==k||!P.data){ P.key=k; P.data=null; try{ P.data=JSON.parse(stor().getItem(k)||'null'); }catch(e){} if(!P.data||typeof P.data!=='object') P.data={items:{},upd:0}; if(!P.data.items) P.data.items={}; pull(); } return P.data; }
function rec(id){ var d=data(); return d.items[id]||(d.items[id]={step:0,done:null}); }
function save(){ var d=data(); d.upd=Date.now(); try{ stor().setItem(P.key,JSON.stringify(d)); }catch(e){} push(); }
function status(t){ var r=data().items[t.id]; if(!r) return 'new'; if(r.done&&r.done.v===t.v) return 'done'; if(r.done) return 'upd'; return r.step>0?'prog':'new'; }
function missing(e){ return !!e&&(e.code==='42P01'||e.code==='PGRST205'||/does not exist|schema cache|not find/i.test(e.message||'')); }
async function uid(){ if(SV.uid) return SV.uid; SV.uid=meId(); if(!SV.uid){ try{ var r=await SB().auth.getUser(); SV.uid=r&&r.data&&r.data.user?r.data.user.id:null; }catch(e){} } return SV.uid; }
function merge(a,b){ if(!b||!b.items) return a; Object.keys(b.items).forEach(function(id){ var x=a.items[id], y=b.items[id]; if(!x){ a.items[id]=y; return; }
  var dx=x.done&&x.done.v||0, dy=y.done&&y.done.v||0; if(dy>dx||(dy===dx&&y.done&&!x.done)) x.done=y.done; if((y.step||0)>(x.step||0)&&!x.done) x.step=y.step; if(y.ask&&!x.ask) x.ask=y.ask; }); return a; }
async function pull(){ if(SV.off||RO()||!SB()) return; var k=P.key; if(SV.pulled[k]) return; SV.pulled[k]=1;
  try{ var u=await uid(); if(!u) return; var r=await SB().from('tutorial_progresso').select('dados').eq('user_id',u).eq('contexto','v2').maybeSingle();
    if(r.error){ if(missing(r.error)) SV.off=true; return; }
    if(r.data&&r.data.dados&&P.key===k){ merge(P.data,r.data.dados); try{ stor().setItem(k,JSON.stringify(P.data)); }catch(e){} SV.ready=true; if(curPage()==='tutoriais'&&!RUN) refreshCenter(); }
    else SV.ready=true;
  }catch(e){} }
function push(){ if(SV.off||RO()||!SB()) return; clearTimeout(SV.timer); var snap=JSON.parse(JSON.stringify(P.data));
  SV.timer=setTimeout(async function(){ try{ var u=await uid(); if(!u) return; var r=await SB().from('tutorial_progresso').upsert({user_id:u,contexto:'v2',dados:snap,updated_at:new Date().toISOString()},{onConflict:'user_id,contexto'}); if(r.error&&missing(r.error)) SV.off=true; }catch(e){} },700); }

/* ==========================================================================
   3) VISUAL — destaque, seta pontilhada, cursor, caixa (classes do plat-tour.css)
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
  UI.col.onclick=function(){ var c=root.classList.toggle('collapsed'); UI.col.textContent=c?'+':'–'; UI.col.setAttribute('aria-expanded',String(!c)); place(); };
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
function obstacles(){ var nav=$('#mtab'); var nb=0; if(nav&&vis(nav)){ var r=nav.getBoundingClientRect(); if(r.top<W.innerHeight) nb=W.innerHeight-r.top; } return {bottom:nb}; }
function place(){
  if(!UI||!RUN) return;
  if(RUN.el&&!RUN.el.isConnected){ var st0=stepsOf(RUN.t)[RUN.i]||{}; try{ var ne=typeof st0.t==='function'?st0.t():(st0.t?$$(st0.t).filter(vis)[0]:null); RUN.el=ne||null; if(ne&&UI.ro){ UI.ro.observe(ne); } }catch(e){ RUN.el=null; } }
  var el=RUN.el, vw=W.innerWidth, vh=W.innerHeight, sheet=narrow();
  UI.root.classList.toggle('tr-sh',sheet);
  var r=el&&el.isConnected?el.getBoundingClientRect():null;
  var pad=6, ob0=obstacles(), off=!r||r.bottom<40||r.top>vh-ob0.bottom-40||r.right<4||r.left>vw-4;
  UI.root.classList.toggle('offscreen',!!(r&&off));
  UI.root.classList.toggle('nodim',!r);
  if(r&&!off){ var x=Math.max(2,r.left-pad), y=Math.max(2,r.top-pad), w=Math.min(vw-4,r.right+pad)-x, h=Math.min(vh-4,r.bottom+pad)-y;
    UI.ring.style.transform='translate('+x+'px,'+y+'px)'; UI.ring.style.width=w+'px'; UI.ring.style.height=h+'px'; UI.ring.classList.remove('off'); }
  else UI.ring.classList.add('off');
  var c=UI.card, cw=c.offsetWidth, ch=c.offsetHeight, cx, cy, ob=obstacles(), m=12;
  if(sheet){ var bottomSafe=ob.bottom+10; var topY=10; var low=vh-bottomSafe-ch;
    var target=r&&!off?(r.top+r.bottom)/2:vh/2; cy=(target>vh*0.52&&r&&!off)?topY:low;
    if(r&&!off&&cy===low&&r.bottom>low-8&&r.top<low) cy=topY;
    c.style.transform='translate(0,'+Math.max(6,cy)+'px)'; }
  else if(!r||off){ cx=(vw-cw)/2; cy=Math.max(m,(vh-ch)/2); c.style.transform='translate('+cx+'px,'+cy+'px)'; }
  else{ var sp={right:vw-r.right,left:r.left,bottom:vh-r.bottom,top:r.top}, g=48, cand=[];
    if(sp.right>=cw+g+m) cand.push(['r',r.right+g,clamp(r.top+r.height/2-ch/2,m,vh-ch-m)]);
    if(sp.left>=cw+g+m) cand.push(['l',r.left-g-cw,clamp(r.top+r.height/2-ch/2,m,vh-ch-m)]);
    if(sp.bottom>=ch+g+m) cand.push(['b',clamp(r.left+r.width/2-cw/2,m,vw-cw-m),r.bottom+g]);
    if(sp.top>=ch+g+m) cand.push(['t',clamp(r.left+r.width/2-cw/2,m,vw-cw-m),r.top-g-ch]);
    var p=cand[0]||['o',vw-cw-m,vh-ch-m-ob.bottom]; cx=p[1]; cy=p[2]; c.style.transform='translate('+cx+'px,'+cy+'px)'; }
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
    var bg=cs.backgroundColor; if(!bg||bg==='transparent'||/rgba\(0, 0, 0, 0\)/.test(bg)) bg='#FFFDF8';
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
function scroller(el){ var m=$('#main'); var p=el.parentElement; while(p&&p!==D.body){ var cs=getComputedStyle(p); if(/(auto|scroll)/.test(cs.overflowY)&&p.scrollHeight>p.clientHeight+2) return p; p=p.parentElement; } return m||W; }
function scrollTo(el,force){ return new Promise(function(res){ if(!el) return res(); var r=el.getBoundingClientRect(), vh=W.innerHeight, ob=obstacles();
  var topMin=narrow()?130:80, limit=narrow()?vh*0.55:vh-ob.bottom-12, tall=r.height>(limit-topMin)*0.8;
  var okv=tall?(r.top>=topMin-4&&r.top<=topMin+80):(r.top>=topMin&&r.bottom<=limit);
  if(okv&&!force) return res();
  var smooth=!reduced()&&!D.hidden, sc=scroller(el);
  try{ var cur0=sc===W?W.scrollY:sc.scrollTop, top=r.top+cur0-(tall||narrow()?topMin:Math.max(topMin,(limit-r.height)/2));
    if(sc===W) W.scrollTo({top:top,behavior:smooth?'smooth':'auto'}); else sc.scrollTo({top:top,behavior:smooth?'smooth':'auto'}); }catch(e){ try{ el.scrollIntoView(); }catch(_){ } }
  var last=null, same=0, t0=Date.now();
  (function poll(){ var qq=el.getBoundingClientRect().top; if(last!==null&&Math.abs(qq-last)<0.5) same++; else same=0; last=qq;
    if(same>=2||Date.now()-t0>1400) return res(); setTimeout(poll,smooth?90:30); })(); }); }
function navTo(pg,arg){ if(!pg) return; var p=curPage(); if(p===pg&&!arg) return; RUN&&(RUN.nav=true); try{ W.go(pg,arg||null); }finally{ setTimeout(function(){ if(RUN) RUN.nav=false; },400); } }
async function prepare(t){
  if(t.ficha==='lead'){ if(curPage()==='ficha-lead') return true; var L=[]; try{ L=W.mine(W.LEADS).filter(function(l){ return !l.perdido; }); }catch(e){} if(!L.length) return false; navTo('cliente',{lead:L[0]}); await sleep(450); return true; }
  if(t.ficha==='cliente'){ if(curPage()==='ficha-cliente') return true; var C=[]; try{ C=W.mine(W.CLIENTES); }catch(e){} if(!C.length) return false; navTo('cliente',{id:C[0].id}); await sleep(450); return true; }
  if(curPage()!==t.page){ navTo(t.page); await sleep(450); }
  return true;
}
async function start(id,mode){
  var t=byId(id); if(!t) return;
  if(RUN) stop('switch');
  closeAreaInvite();
  TOK++; RUN={t:t,i:0,tok:TOK,stepTok:0,auto:false,timer:null,el:null,nav:false};
  buildUI(); UI.root.classList.remove('collapsed','offscreen'); UI.card.classList.remove('enter'); void UI.card.offsetWidth; UI.card.classList.add('enter');
  var r=rec(t.id); r.ask='no'; if(mode==='resume'&&!r.done&&r.step>0) RUN.i=Math.min(r.step,stepsOf(t).length-1); save();
  var ok=await prepare(t); if(!RUN||RUN.tok!==TOK) return;
  if(!ok){ show(-1); UI.area.textContent=TX(t.title); UI.title.textContent=TX(t.title); UI.text.textContent=t.ficha==='cliente'?'Ainda não há nenhum cliente na sua carteira. Quando houver, abra um cliente para ver a ficha.':'Ainda não há nenhum lead para abrir a ficha.'; UI.next.textContent='Fechar'; UI.next.onclick=function(){ stop('close'); }; place(); return; }
  show(RUN.i,1);
  setTimeout(function(){ try{ UI&&UI.next.focus({preventScroll:true}); }catch(e){} },60);
}
async function show(i,dir){
  if(!RUN) return; var t=RUN.t; clearTimeout(RUN.timer); clearDemo();
  if(i<0){ RUN.el=null; UI.root.classList.add('nodim'); return; }
  var tok=++RUN.stepTok; RUN.i=i; var STEPS=stepsOf(t), st=STEPS[i], n=STEPS.length;
  UI.next.onclick=function(){ next(); };
  var r=rec(t.id); if(!r.done||status(t)!=='done'){ r.step=i; save(); }
  UI.area.textContent=TX(t.title); UI.count.textContent='Passo '+(i+1)+' de '+n;
  UI.bar.style.transform='scaleX('+((i+1)/n)+')';
  UI.title.textContent=TX(st.title); UI.text.textContent=TX(st.text); UI.miss.hidden=true;
  UI.prev.disabled=i===0; UI.next.textContent=i===n-1?'Concluir':'Próximo';
  paintPlay();
  if(st.act){ RUN.nav=true; try{ st.act(); }catch(e){} await sleep(260); if(!alive(tok)) return; setTimeout(function(){ if(RUN) RUN.nav=false; },300); }
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
function stop(why){
  if(!RUN) return; clearTimeout(RUN.timer); var t=RUN.t; RUN.nav=true; if(t&&t.post&&why!=='nav'){ try{ t.post(); }catch(e){} } RUN=null; TOK++; clearDemo(); destroyUI();
  if(why==='nav'){ try{ W.toast('Tutorial pausado — continue quando quiser em Tutoriais','play'); }catch(e){} }
  return t;
}
function complete(){
  if(!RUN) return; var t=RUN.t, r=rec(t.id); r.done={v:t.v,ts:Date.now()}; r.step=0; save();
  stop('done');
  try{ W.toast('Tutorial concluído ✓ — '+TX(t.title)+' (rever em Tutoriais)','ok'); }catch(e){}
}

/* ==========================================================================
   "Primeira vez aqui?" — uma vez em cada aba (até iniciar ou dispensar)
   ========================================================================== */
var AINV=null, ainvTimer=null;
function closeAreaInvite(){ clearTimeout(ainvTimer); if(!AINV) return; var el=AINV; AINV=null; if(reduced()){ el.remove(); return; } el.classList.add('out'); setTimeout(function(){ el.remove(); },220); }
function areaInvite(){
  closeAreaInvite();
  if(RO()||RUN) return;
  var pg=curPage(); if(!pg||pg==='tutoriais'||pg==='novidades') return;
  var t=forPage(pg); if(!t||!stepsOf(t).length) return;
  ainvTimer=setTimeout(function(){
    if(curPage()!==pg||RUN||RO()) return;
    if(novidadesAbertas()||$('.sheet.on')||$('.dm')){ ainvTimer=setTimeout(arguments.callee,1500); return; }
    var d=data(), r=d.items[t.id]; if(r&&(r.done||r.step>0||r.ask)) return;
    var el=D.createElement('div'); el.className='tr-invite tr-ainv b-ainv'+(narrow()?' tr-sh':''); el.setAttribute('role','dialog'); el.setAttribute('aria-labelledby','trAinvT');
    el.innerHTML='<div class="k">Primeira vez aqui?</div><h4 id="trAinvT">Como usar '+esc(TX(t.title))+'</h4><p>'+esc(TX(t.desc))+' Um guia de '+stepsOf(t).length+' passos, direto nesta tela, sem alterar nada.</p>'+
      '<div class="r"><button class="gold" data-a="go">Iniciar</button><button data-a="skip">Agora não</button></div>';
    el.addEventListener('click',function(e){ var a=e.target&&e.target.getAttribute('data-a'); if(!a) return;
      if(a==='skip'){ rec(t.id).ask='no'; save(); closeAreaInvite(); try{ W.toast('Quando quiser: botão “?” no topo ou Tutoriais','play'); }catch(_){ } }
      else if(a==='go'){ closeAreaInvite(); start(t.id); } });
    D.body.appendChild(el); AINV=el;
  },1100);
}

/* ==========================================================================
   Integração com o visual novo
   ========================================================================== */
function helpBtn(){
  var how=$('#how'); if(how&&!how.__b2){ how.__b2=1; how.onclick=function(){ var t=forPage(curPage()); if(t) start(t.id); else { try{ W.go('tutoriais'); }catch(e){} } }; }
  var tb=$('.tbar'); if(tb&&!$('.b-help',tb)){ var b=D.createElement('button'); b.className='ib b-help'; b.title='Como usar esta aba'; b.innerHTML='<b>?</b>';
    b.onclick=function(){ var t=forPage(curPage()); if(t) start(t.id); else { try{ W.go('tutoriais'); }catch(e){} } };
    var bell=$('#bell',tb); if(bell) tb.insertBefore(b,bell); else tb.appendChild(b); }
}
function afterGo(){
  helpBtn();
  if(RUN&&!RUN.nav){ var pg=curPage(), want=RUN.t.ficha==='lead'?'ficha-lead':RUN.t.ficha==='cliente'?'ficha-cliente':RUN.t.page; if(pg!==want) stop('nav'); }
  if(curPage()==='tutoriais'&&!RUN) setTimeout(refreshCenter,30);
  areaInvite();
}
function refreshCenter(){ try{ if(curPage()==='tutoriais'){ var v=$('#view'); v.innerHTML=''; W.R.tutoriais(v); W.reveal(v); } }catch(e){} }
function css(){ if($('#b2TourCss')) return; var st=D.createElement('style'); st.id='b2TourCss';
  st.textContent='.b-help{display:none}.b-help b{font:800 16px "DM Sans",sans-serif;color:var(--goldd,#8a6d2f)}'+
  '@media (max-width:860px){.b-help{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;flex:none}}'+
  '.tr-invite.tr-sh{left:10px;right:10px;width:auto}'+
  '.tr-invite.b-ainv.tr-sh,body .tr-invite.b-ainv.tr-sh{bottom:calc(var(--tabh,66px) + 18px + max(6px,env(safe-area-inset-bottom,0px)*.5))}'+
  /* 19/out: no celular o cartão do tutorial vira uma folha (a classe .sheet do visual novo empurrava o cartão para fora da tela) */
  '#trRoot.tr-sh .tr-card{left:10px!important;right:10px;width:auto;border-radius:20px;padding:14px 16px 14px;box-shadow:0 18px 50px rgba(0,0,0,.42)}'+
  '#trRoot.tr-sh .tr-col{display:inline-flex}'+
  '#trRoot.tr-sh .tr-card h4{font-size:1.02rem;line-height:1.3;margin-bottom:6px}'+
  '#trRoot.tr-sh .tr-card p{font-size:.88rem;line-height:1.5}'+
  '#trRoot.tr-sh .tr-acts{gap:8px;margin-top:12px}'+
  '#trRoot.tr-sh .tr-btn{min-height:40px;padding:9px 14px;font-size:.84rem}'+
  '#trRoot.tr-sh .tr-btn.gold{padding:9px 18px}'+
  '#trRoot.tr-sh.collapsed .tr-card p,#trRoot.tr-sh.collapsed .tr-miss,#trRoot.tr-sh.collapsed .tr-acts .tr-play,#trRoot.tr-sh.collapsed .tr-acts .see{display:none!important}'+
  '#trRoot.tr-sh.collapsed .tr-card h4{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
  '#trRoot.tr-sh.collapsed .tr-acts{margin-top:8px}'+
  '#trRoot .tr-ghost{z-index:2}';
  D.head.appendChild(st); }
function hook(){
  if(typeof W.go!=='function'||typeof W.R!=='object'||!W.R.tutoriais) return setTimeout(hook,80);
  if(W.__b2tour) return; W.__b2tour=1; css();
  var _go=W.go; W.go=function(){ var r=_go.apply(this,arguments); setTimeout(afterGo,240); return r; };
  /* Central de Tutoriais do visual novo usa estes tutoriais */
  W.TUG=[['Comece por aqui',['painel','kpis']],['Comercial',['tarefas','crm','ficha-lead','captacao','marketing']],['Atendimento',['conversas','disparos','feed','chat']],['Carteira',['clientes','ficha-cliente','cadastro','comissoes','consultoria']],['Ferramentas',['ferramentas']],['Gestão',['contas','atividades','ajustes']]];
  W.TUIC={painel:'grid',kpis:'kpi',tarefas:'check',crm:'funnel','ficha-lead':'idc',captacao:'spark',marketing:'trend',conversas:'chat',disparos:'send',feed:'act',chat:'chat',clientes:'users','ficha-cliente':'idc',cadastro:'idc',comissoes:'money',consultoria:'wallet',ferramentas:'calc',contas:'team',atividades:'act',ajustes:'gear'};
  W.tourLista=function(){ return forRole().map(function(t){ return {id:t.id,title:TX(t.title),status:status(t)}; }); };
  W.tourStart=function(id){ start(id,'resume'); };
  setTimeout(afterGo,600);
}
W.AgionTour2={start:start,stop:stop,running:function(){ return !!RUN; },reinvite:function(){ areaInvite(); },list:function(){ return W.tourLista?W.tourLista():[]; },
  reset:function(id){ var d=data(); if(id) delete d.items[id]; else d.items={}; save(); },config:CFG};
if(D.readyState==='loading') D.addEventListener('DOMContentLoaded',hook); else hook();
})();
