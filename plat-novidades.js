/* ==========================================================================
   Agion — plat-novidades.js · Versões da plataforma + pop-up "O que há de novo"
   - Uma versão por dia: novidades do mesmo dia entram na versão do dia e sobem o rev
     (rev:1, rev:2…), para quem já viu ver de novo.
   - VERSOES: a mais nova primeiro. Para publicar uma novidade: acrescente uma
     versão no topo (número seguinte) e suba o ?v= deste arquivo no plataforma.html.
   - Cada item pode ter: roles (quem vê), tutorial (id do tutorial) e abrir (aba).
   - O pop-up aparece uma vez por versão para cada pessoa (servidor + cache local).
     Em "Ver como" nunca aparece. Quem não tem item na versão não vê o pop-up.
   ========================================================================== */
(function(){
'use strict';
var W=window, D=document;
var S3=['master','lider','especialista'], ML=['master','lider'], M=['master'], TODOS=['master','lider','especialista','cliente'];

/* v25 começou com rev:1 — no dia 16/10 um número 25 ficou no ar por alguns minutos. v26 = 19/10 (visual novo; rev 2 = tudo desde a 24, por assunto). Próxima: 27. */
/* itens com v2tut abrem o tutorial guiado do visual novo (plat2-tour.js) */
function v4w(){ try{ var f=D.querySelector('#v4wrap iframe'); if(f&&D.documentElement.classList.contains('v4on')&&f.contentWindow&&f.contentWindow.AgionTour2) return f.contentWindow; }catch(e){} return null; }
function irV2(tab,tut){ var w=v4w(); if(w){ try{ if(tut) w.AgionTour2.start(tut); else w.go(tab); }catch(e){} return; } try{ go({painel:'dash',clientes:'users',ajustes:'config'}[tab]||tab); }catch(e){} }
var VERSOES=[
 {v:26,rev:11,data:'20/10/2026',titulo:'Visual novo e tudo o que mudou desde a versão 24',sub:'Da maior mudança (o visual novo) aos pequenos ajustes de toque no celular — tudo o que entrou de 17 a 20 de outubro, por assunto.',itens:[
   {g:'CRM',roles:S3,ic:'funnel',t:'Arrastar cartão em qualquer altura do quadro',d:'Com o quadro rolado para baixo, o cartão vai para qualquer etapa: as colunas vão até o fim, o quadro rola sozinho perto das bordas e, ao arrastar, aparece embaixo a barra “Mover para” com todas as etapas.',abrir:function(){ irV2('crm'); }},
   {g:'CRM',roles:S3,ic:'funnel',t:'Lead em reengajamento fica fora do CRM',d:'Lead sem responsável que está com o robô em reengajamento não aparece mais no CRM, nem em “aguardando distribuição”. O cadastro continua. Quando a pessoa volta a conversar, ela é distribuída e entra no CRM de novo.'},
   {g:'CRM',roles:S3,ic:'funnel',t:'Lead com a Alice fica no CRM',d:'Os leads que a Alice está acompanhando no follow-up agora aparecem no CRM do especialista responsável, com a etiqueta “🤖 Alice”. Antes eles só entravam quando a Alice passava a conversa.'},
   {g:'Só para o master',roles:ML,ic:'users',t:'Ver como: um clique',d:'Um clique no participante já mostra a visão dele, com a pílula deslizando; clicar de novo nele abre a lista de todos para escolher outro.'},
   {g:'Comissões',roles:S3,ic:'money',t:'Comissão da competência completa',d:'No Painel, “Sua comissão” agora soma todas as cartas da competência — lead da Agion e cliente próprio —, pelo mesmo cálculo da aba Comissões.'},
   {g:'Ferramentas',roles:S3,ic:'map',t:'Histórico de ferramentas',d:'Ferramenta nova em Ferramentas: todos os links das calculadoras num lugar só. Quem recebeu, quem abriu, o que cada cliente simulou e o que ele está cogitando; os clientes quentes das últimas 24 h, o caminho do link ao fechamento e o que precisa de atenção. O master vê a equipe toda; cada especialista vê os clientes dele.',abrir:function(){ irV2('histferr'); }},
   {g:'Ferramentas',roles:S3,ic:'bell',t:'Aviso quando o cliente abre ou simula',d:'Quem gerou o link recebe no celular “Fulano abriu o link” e “Fulano está simulando agora”. O toque no aviso abre o Histórico de ferramentas.'},
   {g:'Ferramentas',roles:S3,ic:'user',t:'Link da calculadora ligado ao cliente do CRM',d:'Na hora de gerar o link (nas calculadoras, no Gerador de propostas e no Histórico de ferramentas), escolha o cliente pela busca do CRM; quem não está no CRM pode ser digitado. Validade de 1 h, 2 h, 1 dia ou 2 dias. A lista de links e o “Histórico do cliente” saíram das calculadoras e passaram para o Histórico de ferramentas.'},
   {g:'CRM',roles:S3,ic:'funnel',t:'Card do CRM com atividades',d:'O card mostra “simulando agora”, “abriu o link” ou “link sem abrir”. Ao clicar no card, aparecem as últimas atividades do cliente; “ver tudo” abre a ficha direto na aba Atividades. A busca do CRM ficou na mesma linha dos filtros.',abrir:function(){ irV2('crm'); }},
   {g:'CRM',roles:S3,ic:'doc',t:'Ficha do cliente: aba Atividades',d:'A linha do tempo completa do cliente, por dia: simulações, links, aberturas, propostas, tarefas e mudanças de etapa, com filtro por tipo.'},
   {g:'Ferramentas',roles:S3,ic:'spark',t:'Tutorial do Histórico de ferramentas',d:'Um guia de 22 passos pelas 4 abas: o Histórico, o card do CRM, a ficha do cliente e dentro das ferramentas. Abre na primeira visita, no botão “Como usar esta ferramenta” e na Central de Tutoriais.',abrir:function(){ irV2('histferr','t-histferr'); }},
   {g:'Conversas',roles:S3,ic:'chat',t:'Respostas rápidas: vai exatamente o que está escrito',d:'Os botões embaixo da conversa agora mostram a mensagem inteira, já com o nome do cliente (ex.: “Oi Thatiana! Tudo bem?”), e é exatamente isso que ele recebe, dentro ou fora das 24 h. Fora das 24 h vai como mensagem pronta aprovada pela Meta; as novas (ligar, simulação, boleto) liberam assim que a Meta aprovar.',abrir:function(){ go('conversas'); }},
   {g:'Avisos',roles:S3,ic:'cal',t:'Resultado da assembleia também para o cliente',d:'Quando o resultado é importado, o cliente do grupo recebe a notificação no app e uma mensagem da Alice no WhatsApp com os números contemplados por modalidade (sorteio, lance livre, lance fixo…). Se a cota do próprio cliente aparece na lista, a Alice não dá os parabéns sozinha: o especialista dele e o master recebem o aviso para confirmar com a administradora.'},
   {g:'Conversas',roles:S3,ic:'act',t:'Alice mais rápida até a reunião',d:'A Alice não se apresenta de novo depois da mensagem automática, faz no máximo 3 perguntas (bem, valor da carta e parcela) e já oferece dois horários reais da agenda — um de manhã e um de tarde. O cliente escolhe e recebe o link daquele horário. Se ele mandar duas mensagens seguidas, ela responde as duas numa resposta só.'},
   {g:'Conversas',roles:S3,ic:'send',t:'Marketing espaçado para quem não responde',d:'Para não queimar o número: quem não responde recebe no máximo uma mensagem de marketing a cada 3 dias (3 em 3 semanas), e se a Meta segurar uma, a próxima só sai depois de 7 dias. A plataforma avisa quando libera. Mensagens de utilidade e conversa normal não mudam.'},
   {g:'Avisos',roles:S3,ic:'cal',t:'Notificações de assembleia',d:'Quando o resultado de uma assembleia é importado ou uma data entra ou sai do calendário, toda a equipe recebe a notificação no celular e no computador, em todos os aparelhos que aceitaram receber. Tocou no aviso, abre direto em Ferramentas › Assembleias. Para ligar neste aparelho: Ajustes › Conta › Notificações neste aparelho (dá para mandar um teste). No iPhone, abra a plataforma pela Tela de Início (Compartilhar › Adicionar à Tela de Início).',abrir:function(){ go('ajustes'); }},
   {g:'CRM',roles:ML,ic:'users',t:'Trocar o responsável do card na hora',d:'Ao escolher outra pessoa em “Atribuir para”, o card já mostra o novo responsável e ela recebe o aviso no celular. O master troca qualquer card; o líder, os da equipe dele.'},
   {g:'CRM',roles:S3,ic:'chart',t:'Valor e categoria que o cliente fala para a Alice',d:'Quando o cliente responde para a Alice o valor do bem (ex.: “1,5 milhão”), o valor do card passa a ser esse — vale mais que o valor que veio do formulário. A categoria inicial (Automóvel, Imóvel, Investimento ou Serviços) também vem da conversa; a subcategoria fica para você escolher. E os leads da MAAV não chegam mais todos como Automóvel.'},
   {g:'Só para o master',roles:M,ic:'users',t:'Rodízio só para o tráfego pago',d:'Só os leads do tráfego pago da MAAV entram no rodízio automático. Quem chega pelo site (“Olá! Vim pelo site da Agion”), pelo Instagram ou direto no WhatsApp conversa com a Alice, mas fica em “Aguardando designação” para você escolher quem atende — sem cortar a fila. Em Marketing › Distribuição, “Leads de rodízio” separa os três canais.',abrir:function(){ go('marketing'); }},
   {g:'Carteira',roles:['especialista'],ic:'users',t:'Nova aba: Cadastro',d:'Em Carteira › Cadastro você encontra a ficha de cada pessoa ligada a você — os seus clientes, os seus leads e quem você trouxe —, com WhatsApp, CPF, e-mail, origem, situação e o histórico. Cada pessoa aparece uma vez só. Cadastros de clientes de colegas não aparecem.'},
   {g:'Só para o master',roles:M,ic:'users',t:'Cadastro liberado para os especialistas',d:'Os especialistas agora têm a aba Cadastro, vendo só os cadastros dos clientes e leads deles (e de quem eles trouxeram). Duplicados, unificar, editar origem e exportar a planilha continuam só com você.'},
   {g:'Ferramentas',roles:S3,ic:'chart',t:'Histórico do cliente no link da calculadora',d:'Quando o cliente abre o link da calculadora que você mandou e muda os números, cada simulação em que ele parou pelo menos 3 segundos fica guardada: crédito, entrada, lance, parcela, taxa de adm., CDI/Selic, tipo de carta e o resultado que ele viu. Na lista de links (Gerador de propostas ou “Enviar esta calculadora”) aparece “Histórico do cliente” com o resumo do que ele está cogitando — ótimo para preparar a conversa. Cada link é de um cliente.'},
   {g:'Acesso',roles:S3,ic:'user',t:'Entrar com Face ID ou digital',d:'No celular (e no Mac com Touch ID) dá para entrar sem digitar a senha. Depois de entrar com a senha, a plataforma pergunta “Entrar com Face ID?” — toque em Ativar. Da próxima vez, na tela de entrada, toque em “Entrar com Face ID” (ou “com a digital”, no Android). Liga e desliga em Ajustes › Conta, aparelho por aparelho. A senha continua valendo.'},
   {g:'Acesso',roles:S3,ic:'user',t:'Esqueci minha senha: agora funciona',d:'Ao abrir o link de redefinição que chega no e-mail, a plataforma mostra a tela “Crie sua nova senha” — digite a senha duas vezes e pronto, já entra. Antes essa pergunta ficava escondida atrás da tela de entrada e a senha não era trocada. Se o link estiver vencido ou já tiver sido usado, ela avisa para pedir outro (use sempre o e-mail mais recente).'},
   {g:'Visual novo',roles:S3,ic:'spark',t:'Plataforma com visual novo, mesmos dados',d:'A plataforma inteira ganhou um visual novo, mais rápido e organizado, no computador e no celular. Leads, clientes, tarefas, conversas e comissões são exatamente os mesmos — nada foi apagado. Se precisar, a versão anterior continua em Ajustes › Versão anterior.',v2tut:'painel'},
   {g:'Visual novo',roles:S3,ic:'map',t:'Tutorial guiado em todas as abas',d:'Na primeira vez em cada aba aparece “Primeira vez aqui?” com um guia animado, passo a passo, direto na tela real e passando por todas as sub-abas. O botão “?” no topo abre o tutorial da aba quando você quiser. O que você concluir no celular vale no computador, e vice-versa.',abrir:function(){ irV2('tutoriais'); }},
   {g:'Visual novo',roles:S3,ic:'bell',t:'Novidades a cada versão',d:'Esta janela volta a abrir sozinha sempre que sai uma versão nova, já no visual novo. As versões anteriores ficam em “Versões anteriores”, em lista.'},
   {g:'CRM e tarefas',roles:S3,ic:'funnel',t:'Arrastar sem marcar o texto',d:'Ao arrastar os cartões do CRM no computador ou no app do Mac, o texto dos cartões não fica mais marcado (aquele contorno de selecionar para copiar).',v2tut:'crm'},
   {g:'CRM e tarefas',roles:S3,ic:'funnel',t:'Mover cartão no celular em dois toques',d:'No CRM pelo celular, segure o cartão por meio segundo: ele descola e aparece embaixo a barra “Mover para” com as 7 etapas. Toque na etapa e pronto — ou arraste o cartão até ela. O movimento ficou fluido (60 quadros por segundo). Um toque rápido continua abrindo a ficha.',v2tut:'crm'},
   {g:'Conversas',roles:S3,ic:'chat',t:'Quem falou aparece para todos',d:'Quando alguém da equipe assume a conversa e responde, o nome dessa pessoa aparece em cima da mensagem para todo mundo que abre a conversa — inclusive o responsável pelo lead. Antes podia aparecer como se fosse a Alice. E agora todos da equipe têm o botão Assinar com meu nome.',v2tut:'conversas'},
   {g:'CRM e tarefas',roles:S3,ic:'funnel',t:'CRM com 7 etapas: Reunião agendada e Diagnóstico',d:'Entre Estudo/Simulação e Proposta enviada agora tem Reunião agendada e Diagnóstico (quando o cliente compareceu). Arrastar para Reunião agendada pede a data e hora; arrastar para Diagnóstico marca que ele compareceu. As reuniões marcadas pela Alice ou pelo Calendly já caem sozinhas na coluna certa. KPIs, comissões e conversão continuam contando igual.',v2tut:'crm'},
   {g:'CRM e tarefas',roles:S3,ic:'funnel',t:'CRM carrega na hora',d:'Os cartões do CRM aparecem imediatamente, no celular e no computador, sem a espera da animação de entrada.',v2tut:'crm'},
   {g:'CRM e tarefas',roles:S3,ic:'funnel',t:'Topo do CRM fixo no celular',d:'Ao rolar, a faixa Quadro/Lista/Perdidos e as etapas (Novo lead, Contato feito, Estudo…) ficam presas no topo, coladas uma na outra e com o fundo da tela — sem vão e sem conteúdo aparecendo por trás.',v2tut:'crm'},
   {g:'CRM e tarefas',roles:S3,ic:'check',t:'Tarefas no visual novo',d:'Atrasadas, hoje e próximos 7 dias em cartões no topo. Abra a tarefa para marcar Feita ou Não feita, com a resposta e a anotação.',v2tut:'tarefas'},
   {g:'CRM e tarefas',roles:S3,ic:'user',t:'Ficha cadastral preenchida sozinha',d:'Na ficha do lead ou do cliente, cole a ficha da administradora: RG, endereço, renda e os demais campos são preenchidos para você conferir e salvar.',v2tut:'ficha-lead'},
   {g:'Conversas',roles:S3,ic:'chat',t:'Conversas ao vivo, como no WhatsApp',d:'As mensagens novas aparecem sozinhas em poucos segundos, sem precisar sair e entrar de novo. A tela não pisca mais: só a mensagem nova entra, com uma animação suave, e a que você envia aparece na hora como “enviando…”.',v2tut:'conversas'},
   {g:'Conversas',roles:S3,ic:'chat',t:'Mensagens mais recentes primeiro',d:'A conversa agora carrega as mensagens mais recentes (até as últimas 1.000), e não mais as primeiras do contato.',v2tut:'conversas'},
   {g:'Conversas',roles:S3,ic:'doc',t:'Templates aparecem na conversa',d:'Quando alguém da equipe envia um template, ele aparece na conversa como “📄 Template · nome”, igual às outras mensagens — para todo mundo saber o que o cliente recebeu.',v2tut:'conversas'},
   {g:'Conversas',roles:S3,ic:'bell',t:'Aviso quando a mensagem não chega',d:'Se o WhatsApp não entregar uma mensagem (por exemplo, texto enviado depois de 24 h sem resposta, ou limite de mensagens de marketing da Meta para aquela pessoa), aparece um aviso dentro da conversa explicando o motivo.',v2tut:'conversas'},
   {g:'Conversas',roles:S3,ic:'chat',t:'Respostas rápidas fora das 24 h',d:'Quando o cliente não responde há mais de 24 h, as respostas rápidas (Oi, tudo bem? · Posso te ligar? · Simulação · Boleto) são enviadas como template, para chegar mesmo assim. A plataforma pede confirmação antes. Os templates estão em aprovação na Meta.',v2tut:'conversas'},
   {g:'Ferramentas',roles:S3,ic:'doc',t:'Gerador de propostas: prévia e downloads',d:'A prévia não trava mais. O PDF ficou leve e baixa na hora; o PNG de várias páginas vem num arquivo .zip. No iPhone, abre o Compartilhar para salvar ou mandar no WhatsApp.',abrir:function(){ irV2('ferramentas'); }},
   {g:'Ferramentas',roles:S3,ic:'map',t:'Link temporário da calculadora para o cliente',d:'No Gerador de propostas e dentro das calculadoras (botão “Link para o cliente”): escolha 1, 2 ou 3 dias ou um tempo personalizado (até 7 dias), gere quantos links quiser e acompanhe o contador regressivo e quantas vezes o cliente abriu. Dá para copiar, mandar no WhatsApp ou encerrar o link na hora. O cliente abre sem login e vê quanto tempo ainda tem; depois do prazo, o link deixa de abrir.',abrir:function(){ irV2('ferramentas'); }},
   {g:'Ferramentas',roles:S3,ic:'doc',t:'Link e QR code dentro da proposta',d:'Marque “Usar na proposta” num link e a proposta ganha a página “Simule você mesmo”, com botão que abre a calculadora direto do PDF, QR code para o celular e a data em que o link expira.',abrir:function(){ irV2('ferramentas'); }},
   {g:'Ferramentas',roles:S3,ic:'chart',t:'Calculadora de alavancagem reorganizada',d:'Campos alinhados e com separador de milhar (500.000), colunas da esquerda e da direita na mesma altura e, embaixo, ocupando a largura toda, o comparativo com a aplicação financeira.',abrir:function(){ try{ window.open('/calc-alavancagem','_blank'); }catch(e){} }},
   {g:'Ferramentas',roles:S3,ic:'spark',t:'O resultado explicado em palavras',d:'Depois que você simula, as calculadoras mostram “O que esse resultado quer dizer”: quatro blocos com o passo a passo (quanto paga, quando contempla, por quanto vende, quanto lucra — ou, no financiamento, o custo de cada opção e o que sobra no bolso) e uma linha comparando com a aplicação. Vale para a Alavancagem (os dois cenários), Financiamento × Consórcio e a conta rápida da aba Ferramentas.',abrir:function(){ try{ window.open('/calc-alavancagem','_blank'); }catch(e){} }},
   {g:'Ferramentas',roles:S3,ic:'money',t:'Financiamento × Consórcio: carta nova ou contemplada',d:'(versão 25) Escolha o tipo de carta: contemplada, com entrada para quem vende e parcela integral; ou nova, com meia parcela até a contemplação e as diferenças diluídas no prazo restante. PDF pela impressão do navegador, com texto nítido.',abrir:function(){ try{ window.open('/calc-financiamento','_blank'); }catch(e){} }},
   {g:'Ferramentas',roles:S3,ic:'doc',t:'Tutorial em cada ferramenta',d:'(versão 25) Cada ferramenta tem o seu tutorial: “? Tutorial” no cartão ou “Como usar esta ferramenta” dentro dela.',abrir:function(){ irV2('ferramentas'); }},
   {g:'Materiais da equipe',roles:S3,ic:'user',t:'Assinatura de e-mail da Agion',d:'Assinatura nova para Gabriel, Lisiane e Matheus, no verde e dourado da Agion, com foto, cargo, WhatsApp, Instagram e site. Abra a página, toque em “Copiar assinatura” e cole no Gmail, Outlook ou Apple Mail (o passo a passo está lá).',abrir:function(){ try{ window.open('/assinatura','_blank'); }catch(e){} }},
   {g:'Materiais da equipe',roles:M,ic:'doc',t:'Propostas novas de alavancagem',d:'Três propostas horizontais para apresentar (cartas de R$ 200 mil: R$ 1 mi ou R$ 2 mi, normal × embutido, venda no mês 30 × CDI; escada financeira e escada patrimonial de 7 ciclos) e uma versão explicada de cada uma, para o cliente ler sozinho. O botão de contato é “Falar com a Agion”. Estão em Material IA › PROPOSTAS.'},
   {g:'Celular e app',roles:S3,ic:'user',t:'App atualiza sozinho',d:'Não precisa mais apagar e baixar o app de novo: ele pega a versão nova ao abrir. Se você estiver digitando, aparece “Nova versão · Atualizar” para não perder nada.'},
   {g:'Celular e app',roles:S3,ic:'map',t:'Abas do menu no primeiro toque',d:'As abas da barra de baixo abrem no primeiro toque, mesmo logo depois de deslizar a barra. Antes, às vezes era preciso tocar várias vezes.'},
   {g:'Celular e app',roles:S3,ic:'map',t:'Barra de menus mais baixa e solta',d:'A barra de menus encostou no fim da tela (sem sobra embaixo), a faixa verde ficou mais fina e um deslize do dedo anda várias abas de uma vez.'},
   {g:'Celular e app',roles:S3,ic:'check',t:'Toque mais preciso',d:'Botões respondem sem atraso de duplo toque e os cartões do CRM não travam mais a rolagem da tela no celular.'},
   {g:'Celular e app',roles:S3,ic:'map',t:'Tutorial bem encaixado no celular',d:'O “Primeira vez aqui?” e o cartão de cada passo do tutorial aparecem inteiros, logo acima da barra de menus, com texto e botões maiores.'},
   {g:'Celular e app',roles:S3,ic:'spark',t:'Ícone e topo do app',d:'Ícone novo com a logo centralizada (para trocar, apague e adicione o app uma única vez). A faixa do relógio fica na mesma cor do fundo e, no app do Mac, a barra bege do topo saiu.'},
   {g:'Só para o master',roles:M,ic:'users',t:'Distribuição manual por pessoa',d:'Em Captação › Distribuição de leads dá para escolher pessoa por pessoa quem recebe, com limite por dia.',v2tut:'captacao'},
   {g:'Só para o master',roles:M,ic:'chat',t:'Templates com o texto e Disparos por e-mail',d:'Marketing › Templates mostra o texto de cada mensagem aprovada. Disparos ganhou a visão dos e-mails do follow-up.',v2tut:'marketing'},
   {g:'Só para o master',roles:M,ic:'users',t:'Aba Contas para a equipe',d:'A Lisiane e o Matheus agora têm a aba Contas. Lá eles veem o organograma e a lista da equipe, só com o nome e a função de cada pessoa. Não abrem o cartão dos colegas nem veem WhatsApp, leads ou clientes de ninguém, e só editam os próprios dados (foto, nome e WhatsApp). Para liberar ou tirar de mais alguém, abra a pessoa em Contas e use “Acesso à aba Contas”.'},
   {g:'Só para o master',roles:M,ic:'users',t:'Organograma: equipe do MAAV',d:'O organograma agora mostra também quem trabalha com a gente sem login na plataforma, como o Gabriel Esteves (Diretor de Marketing) e a Karolina Silva (Customer Success), abaixo do MAAV. Em Contas, toque em Adicionar pessoa para incluir alguém com foto, cargo e de quem fica abaixo; toque na pessoa para editar ou tirar do organograma.'},
   {g:'Só para o master',roles:M,ic:'chart',t:'Perfil Marketing (MAAV)',d:'O MAAV agora é Marketing, com organograma próprio ao lado do seu. Quem é Marketing acompanha o CRM inteiro, Captação e Distribuição, Marketing e Marketing MAAV, Conversas, e tem Painel e KPIs só de marketing (leads, funil, origem e conversão). Não vê clientes, cadastro, comissões, consultoria, contas nem atividades, e não altera nada — só acompanha. Para ligar ou desligar em outra pessoa: Contas › Editar › Perfil Marketing.',v2tut:'contas'},
   {g:'Só para o master',roles:M,ic:'users',t:'Contas: organograma e editar a equipe',d:'Contas abre com o organograma da equipe de cima para baixo: você (master), os líderes e os especialistas de cada um, com foto e quantos leads e clientes cada um tem. Toque em qualquer pessoa (ou em Editar na lista) para trocar foto, nome, WhatsApp, cargo e cor. As fotos passam a aparecer para todos na plataforma.',v2tut:'contas'},
   {g:'Só para o master',roles:M,ic:'chart',t:'Assembleias: ver outros meses e excluir data',d:'Em Ferramentas › Assembleias, use as setas ao lado do calendário (ou deslize no celular) para ver os outros meses. Errou uma data? Toque nela, aparece um X vermelho, toque no X e ela é excluída. Depois cadastre a certa em Data de assembleia.',v2tut:'ferramentas'},
   {g:'Só para o master',roles:M,ic:'chart',t:'Marketing MAAV: leads do Mooving entram sozinhos',d:'Marketing › Marketing MAAV liga a plataforma ao Mooving CRM do MAAV. Cada contato novo de lá vira lead aqui, entra no rodízio e a Alice chama no WhatsApp. Você vê o funil desses leads, campanhas, motivos de perda e lança o custo do tráfego para ver CPL e custo por venda. Em Regras e ligação você decide o que entra e o que volta para o Mooving (etapa, campos e etiquetas) — nada volta antes de você salvar.',v2tut:'marketing'}
 ]},
 {v:25,rev:1,data:'17/10/2026',titulo:'Calculadora com carta nova e tutoriais das ferramentas',itens:[
   {roles:S3,ic:'money',t:'Financiamento × Consórcio: carta contemplada ou carta nova',d:'Escolha o tipo de carta. Contemplada: a entrada vai para quem vende a carta e a parcela é integral até o fim. Nova: meia parcela até a contemplação; aí somam-se as parcelas do período que o grupo já andou e as metades não pagas, com reajuste, diluídas no prazo restante. O PDF agora sai pela impressão do navegador (“Salvar como PDF”), com texto nítido e sem erro de espaçamento.',tutorial:'t-financ',abrir:function(){ try{ window.open('/calc-financiamento','_blank'); }catch(e){} }},
   {roles:S3,ic:'doc',t:'Tutorial em cada ferramenta',d:'Financiamento × Consórcio, Escada Financeira, Alavancagem Patrimonial, Gerador de Propostas e Assembleias têm tutorial próprio: toque em “? Tutorial” no cartão da ferramenta ou em “Como usar esta ferramenta” dentro dela. Em Tutoriais, todos ficam na seção Ferramentas.',tutorial:'ferramentas',abrir:function(){ go('ferramentas'); }}
 ]},
 {v:24,rev:4,data:'16/10/2026',titulo:'Tarefas organizadas, notificações e menu mais enxuto',itens:[
   {roles:S3,ic:'check',t:'Nova aba Tarefas',d:'Agenda por dia (atrasadas, hoje, amanhã…), os números do dia no topo, filtros por tipo e responsável e busca. Abra a tarefa para marcar Feita ou Não feita, escolher a resposta (ex.: Atendeu, Não atendeu) e escrever a anotação.',tutorial:'tarefas',abrir:function(){ go('tarefas'); }},
   {roles:S3,ic:'bell',t:'Notificações de tarefas no celular',d:'Aviso quando alguém cria uma tarefa para você, na hora de cada tarefa e um resumo às 8h30. Toque em “Ativar notificações” na aba Tarefas, em cada aparelho.',abrir:function(){ go('tarefas'); }},
   {roles:S3,ic:'user',t:'Tarefas do robô de follow-up',d:'Ligações e toques no Instagram dos leads novos aparecem com o selo “Robô”, já com o telefone para ligar ou chamar no WhatsApp.',tutorial:'tarefas',abrir:function(){ go('tarefas'); }},
   {roles:S3,ic:'chat',t:'Conversas: assumir e devolver para a Alice',d:'Em cada conversa, uma faixa embaixo do nome mostra quem está atendendo: você ou a Alice. Quando você responde um lead, a Alice e o follow-up ficam em silêncio por 30 minutos e depois ela volta, sabendo o que você disse. “Assumir” pausa sem prazo (negociações longas); “Devolver para a Alice” faz ela voltar na hora.',tutorial:'conversas',abrir:function(){ go('conversas'); }},
   {roles:['lider','especialista'],ic:'chat',t:'Conversas: etiquetas e seu nome nas mensagens',d:'Cada conversa ganhou etiquetas: “Novo lead”, o nome de quem atende e “Cliente” (dourada). Você vê as conversas dos seus leads e clientes. Tudo o que você envia chega ao cliente com o seu nome em negrito, em cima. O tutorial de Conversas tem um exemplo completo.',tutorial:'conversas',abrir:function(){ go('conversas'); }},
   {roles:M,ic:'chat',t:'Conversas: etiquetas e nome de quem escreve',d:'Cada conversa ganhou etiquetas: “Novo lead”, o nome de quem atende e “Cliente” (dourada). Especialistas e líderes veem só as conversas dos seus leads e clientes; você vê todas. As mensagens da equipe chegam ao cliente com o nome de quem escreveu em negrito; o seu você liga ou desliga em “Assinar com meu nome”, na faixa da conversa.',tutorial:'conversas',abrir:function(){ go('conversas'); }},
   {roles:S3,ic:'bell',t:'Cliente pediu uma pessoa? A Alice chama você',d:'Se o lead pede para falar com uma pessoa, pergunta se é robô ou fica irritado, a Alice avisa que vai chamar você pelo nome e espera 10 minutos em silêncio. A conversa fica com a faixa vermelha: toque em Assumir. Se ninguém assumir, ela volta e diz que você já foi avisado.',tutorial:'conversas',abrir:function(){ go('conversas'); }},
   {roles:S3,ic:'bell',t:'Aviso só para quem atende',d:'Lead novo chega já com responsável e só essa pessoa recebe a notificação. Tocando no aviso, a plataforma abre direto na conversa — quando o lead pede um especialista, já com o botão Assumir em destaque.',abrir:function(){ go('conversas'); }},
   {roles:['lider','especialista'],ic:'user',t:'Lead entra no seu CRM depois do follow-up',d:'Enquanto a Alice faz o follow-up, o lead aparece só nas suas Conversas (você acompanha tudo). Quando ele pede para falar com você ou avança, entra no seu CRM.',abrir:function(){ go('crm'); }},
   {roles:M,ic:'users',t:'Nova aba Marketing › Distribuição de leads',d:'Escolha como os leads novos são divididos: rodízio em fila (1 para cada), por nível (quem tem nível maior recebe mais), por categoria (imóvel, carro, pesados…) ou manual. Ligue e desligue quem participa, ponha limite por dia e mande os leads de alto valor só para quem você escolher.',tutorial:'distribuicao',abrir:function(){ go('marketing'); setTimeout(function(){ try{ mktSub('dist'); }catch(e){} },300); }},
   {roles:M,ic:'user',t:'CRM: leads com a Alice',d:'Leads que a Alice ainda está acompanhando no follow-up ficam fora do CRM de especialistas e líderes. Você vê todos, com a etiqueta “🤖 Com a Alice”.',abrir:function(){ go('crm'); }},
   {roles:M,ic:'users',t:'Contas: atribuição de cada pessoa',d:'Na aba Contas, o botão “Atribuição” troca a função entre Líder e Especialista (colaborador) e escolhe o líder de cada especialista. A aba Contas agora é só sua.',tutorial:'contas',abrir:function(){ go('contas'); }},
   {roles:['lider','especialista'],ic:'map',t:'Menu mais enxuto',d:'Tarefas agora fica logo acima do CRM. Captação, Marketing, Feed, Chat e Contas saíram do menu por enquanto.'},
   {roles:M,ic:'map',t:'Menu: Tarefas acima do CRM',d:'Captação, Marketing, Feed, Chat e Contas agora aparecem só para você; líderes, especialistas e novos usuários não veem essas abas até serem liberadas.'}
 ]},
 {v:23,data:'14/10/2026',titulo:'Assembleias, importação de pagamentos e novidades',itens:[
   {roles:S3,ic:'chart',t:'Ferramentas › Assembleias',d:'Resultado mensal dos grupos separado por administradora (HS ou Âncora) e categoria do bem (Imóvel, Automóvel, Serviços…): cotas sorteadas, lance fixo, 2º fixo, livre e limitado, excluídas e o calendário. Clique num grupo para ver as cotas contempladas.',tutorial:'assembleias',abrir:function(){ go('ferramentas'); setTimeout(function(){ W.AgionImport&&W.AgionImport.assembleias(); },60); }},
   {roles:M,ic:'money',t:'Comissões › Importar pagamentos do mês',d:'Todo dia 11, envie o PDF da administradora com quem pagou e quem não pagou. A plataforma encontra cada cliente pelo grupo/cota ou nome e você confere antes de gravar.',tutorial:'comissoes',abrir:function(){ go('comissoes'); }},
   {roles:M,ic:'doc',t:'Importar resultado das assembleias',d:'O PDF “Resultado de Assembleia” da HS é lido direto: grupo, sorteio (inclusive com duas cotas), lances e parcelas. Escolha a administradora e a categoria ao importar.',tutorial:'assembleias',abrir:function(){ go('ferramentas'); setTimeout(function(){ W.AgionImport&&W.AgionImport.assembleias(); },60); }},
   {roles:TODOS,ic:'map',t:'Tutorial em cada aba',d:'Na primeira vez em cada aba aparece “Primeira vez aqui?” com um guia curto direto na tela. O botão “?” no topo abre o tutorial da aba a qualquer momento.',abrir:function(){ go('tutoriais'); }},
   {roles:TODOS,ic:'spark',t:'Versões e novidades',d:'A cada atualização da plataforma esta janela mostra o que mudou. A versão atual fica no rodapé do menu (no app, em Ajustes).'}
 ]},
 {v:22,data:'14/10/2026',titulo:'Central de Tutoriais e Comissões por data de venda',itens:[
   {roles:TODOS,ic:'map',t:'Central de Tutoriais',d:'Nova aba “Tutoriais”: guias passo a passo nas telas reais, sem alterar nenhum dado. Ao concluir, o cartão fica marcado como concluído.',abrir:function(){ go('tutoriais'); }},
   {roles:M,ic:'money',t:'Comissões pela data real da venda',d:'Cada venda mostra se é HS ou Âncora, o tempo do cliente com a Agion (marca dos 8 meses) e as regras próprias da Âncora. Recebimentos em janela de 6 meses.',tutorial:'comissoes',abrir:function(){ go('comissoes'); }},
   {roles:['lider','especialista'],ic:'money',t:'Suas comissões mais claras',d:'Suas vendas, a data prevista de cada parcela e a situação de cada cliente.',tutorial:'comissoes',abrir:function(){ go('comissoes'); }},
   {roles:TODOS,ic:'spark',t:'Movimento mais suave',d:'Indicador deslizante no menu e nas abas, entrada mais leve das listas.'}
 ]},
 {v:21,data:'13/10/2026',titulo:'Cadastro único e KPIs por categoria',itens:[
   {roles:ML,ic:'user',t:'Cadastro único',d:'Uma pessoa, um cadastro: lead, cliente e WhatsApp ligados por telefone, CPF ou e-mail, sem duplicidade.',tutorial:'cadastro',abrir:function(){ go('cadastro'); }},
   {roles:ML,ic:'chart',t:'KPIs › base de clientes por categoria',d:'Distribuição por categoria do bem com visão de todo o período, por mês e histórico.',tutorial:'kpis',abrir:function(){ go('kpis'); }},
   {roles:S3,ic:'user',t:'Clientes › cliente desde',d:'Cada cliente mostra desde quando está com a Agion e o aniversário de casa.',abrir:function(){ go('users'); }}
 ]}
];
var ATUAL=VERSOES[0].v;
var MARCA=ATUAL+((VERSOES[0].rev||0)/100); /* versão + revisão do mesmo dia */
function chave(ver){ return ver.v+((ver.rev||0)/100); }

var IC={
  users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.6-5.5 6.5-5.5s5.5 2 6.5 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M16 14.6c2.6.2 4.6 2 5.5 5"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 12l3 3 5-6"/></svg>',
  chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
  bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
  chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3v18h18"/><path d="M8 17v-5M13 17V8M18 17v-9"/></svg>',
  money:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></svg>',
  doc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h7M9 17h5"/></svg>',
  map:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/></svg>',
  spark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z"/></svg>',
  funnel:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 4h18l-7 8v6l-4 2v-8z"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>'
};
function $(s,r){ try{ return (r||D).querySelector(s); }catch(e){ return null; } }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
function SB(){ try{ return W.supa||(typeof supa!=='undefined'?supa:null); }catch(e){ return null; } }
function role(){ try{ return session.role; }catch(e){ return null; } }
function uidLocal(){ try{ return session.userId||'anon'; }catch(e){ return 'anon'; } }
function reduced(){ try{ return W.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } }
function itensDe(ver){ var r=role(); return ver.itens.filter(function(i){ return i.roles.indexOf(r)>=0; }); }

/* ---------- visto: cache local + servidor (tutorial_progresso, contexto 'novidades') ---------- */
var KEY=function(){ return 'agion:novidades:'+uidLocal(); };
function vistoLocal(){ try{ return +(localStorage.getItem(KEY())||0); }catch(e){ return 0; } }
async function vistoServidor(){ try{ var u=(await SB().auth.getUser()).data.user; if(!u) return 0; var r=await SB().from('tutorial_progresso').select('dados').eq('user_id',u.id).eq('contexto','novidades').maybeSingle(); return r.data&&r.data.dados?(+r.data.dados.visto||0):0; }catch(e){ return 0; } }
async function marcar(v){ try{ localStorage.setItem(KEY(),String(v)); }catch(e){}
  try{ var u=(await SB().auth.getUser()).data.user; if(!u) return; await SB().from('tutorial_progresso').upsert({user_id:u.id,contexto:'novidades',dados:{visto:v},updated_at:new Date().toISOString()},{onConflict:'user_id,contexto'}); }catch(e){} }

/* ---------- estilos ---------- */
(function css(){ if($('#nvCss')) return; var st=D.createElement('style'); st.id='nvCss'; st.textContent=[
'.nv-bg{position:fixed;inset:0;z-index:10050;background:var(--surface-overlay,rgba(4,12,14,.72));display:flex;align-items:center;justify-content:center;padding:16px;animation:overlay-in var(--dur-2,200ms) linear both}',
'.nv-md{width:min(620px,100%);max-height:88vh;display:flex;flex-direction:column;background:linear-gradient(180deg,#10303A,#0B222A);color:#E8F2F0;border:1px solid rgba(197,160,89,.38);border-radius:20px;box-shadow:0 30px 80px rgba(0,0,0,.55);animation:modal-in var(--dur-3,320ms) var(--ease-out,ease) both;font-family:"DM Sans",system-ui,sans-serif}',
'.nv-hd{padding:20px 22px 12px;border-bottom:1px solid rgba(143,217,204,.12)}.nv-k{font:700 .66rem/1 "DM Sans",sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#E2C48A;display:flex;gap:8px;align-items:center}',
'.nv-k .vb{background:linear-gradient(135deg,#C5A059,#B08A45);color:#06171B;border-radius:999px;padding:3px 8px;letter-spacing:.04em}',
'.nv-hd h2{margin:8px 0 2px;font:600 1.3rem/1.25 Lora,Georgia,serif;color:#F4FAF8}.nv-hd p{margin:0;color:#9DB5B1;font-size:.84rem}',
'.nv-bd{padding:12px 22px;overflow:auto}.nv-it{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid rgba(143,217,204,.08)}.nv-it:last-child{border-bottom:0}',
'.nv-ic{flex:0 0 36px;height:36px;border-radius:11px;background:rgba(197,160,89,.1);border:1px solid rgba(197,160,89,.38);color:#E2C48A;display:flex;align-items:center;justify-content:center}.nv-ic svg{width:18px;height:18px}',
'.nv-it h4{margin:0 0 3px;font:600 .98rem/1.3 Lora,Georgia,serif;color:#F4FAF8}.nv-it p{margin:0;font-size:.84rem;line-height:1.5;color:#C9DEDB}',
'.nv-ac{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}.nv-ac button{border:1px solid rgba(143,217,204,.2);background:rgba(255,255,255,.04);color:#DCE9E7;border-radius:10px;padding:6px 11px;font:600 .78rem/1 "DM Sans",sans-serif;cursor:pointer;min-height:32px}',
'.nv-ac button.g{background:linear-gradient(135deg,#C5A059,#B08A45);color:#06171B;border-color:transparent}.nv-ac button:hover{filter:brightness(1.08)}',
'.nv-ft{padding:12px 22px;border-top:1px solid rgba(143,217,204,.12);display:flex;gap:8px;align-items:center;flex-wrap:wrap}.nv-ft .sp{flex:1}',
'.nv-ft button{border-radius:11px;padding:9px 14px;font:600 .84rem/1 "DM Sans",sans-serif;cursor:pointer;min-height:38px;border:1px solid rgba(143,217,204,.2);background:rgba(255,255,255,.04);color:#DCE9E7}.nv-ft button.g{background:linear-gradient(135deg,#C5A059,#B08A45);color:#06171B;border-color:transparent}',
'.nv-g{margin:16px 0 2px;padding-top:4px;font:700 .7rem/1 "DM Sans",sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#E2C48A}.nv-bd>.nv-g:first-child{margin-top:4px}',
'.nv-old h3{margin:16px 0 4px;font:700 .7rem/1 "DM Sans",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#9DB5B1}',
'.nv-ver{display:block;width:100%;margin-top:8px;background:none;border:1px dashed rgba(143,217,204,.2);border-radius:10px;color:var(--soft,#9DB5B1);font:600 .74rem/1 "DM Sans",sans-serif;padding:8px;cursor:pointer;text-align:center}.nv-ver b{color:var(--gold2,#E2C48A)}.nv-ver:hover{border-color:rgba(197,160,89,.5)}',
'.nv-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--bad,#E07A6A);margin-left:6px;vertical-align:1px}',
'@media (max-width:640px){.nv-bg{align-items:flex-end;padding:8px}.nv-md{max-height:90vh;border-radius:20px 20px 16px 16px}.nv-hd,.nv-bd,.nv-ft{padding-left:16px;padding-right:16px}}',
'@media (prefers-reduced-motion:reduce){.nv-bg,.nv-md{animation:none!important}}'
].join('\n'); D.head.appendChild(st); })();

/* ---------- pop-up ---------- */
function itemHtml(i,k){ return '<div class="nv-it"><span class="nv-ic">'+(IC[i.ic]||IC.spark)+'</span><div><h4>'+esc(i.t)+'</h4><p>'+esc(i.d)+'</p>'+
  ((i.tutorial||i.abrir||i.v2tut)?'<div class="nv-ac">'+((i.tutorial||i.v2tut)?'<button class="g" data-tut="'+k+'">Ver como funciona</button>':'')+(i.abrir?'<button data-go="'+k+'">Abrir</button>':'')+'</div>':'')+'</div></div>'; }
function abrir(opts){
  opts=opts||{}; fechar(); var r=role(); if(!r) return;
  var lista=VERSOES.filter(function(v){ return itensDe(v).length; }); if(!lista.length) return;
  var atual=lista[0], idx=[], k=0;
  var gAnt=null; var corpo=itensDe(atual).map(function(i){ idx.push(i); var h=''; if(i.g&&i.g!==gAnt){ gAnt=i.g; h='<h3 class="nv-g">'+esc(i.g)+'</h3>'; } return h+itemHtml(i,k++); }).join('');
  var antigas=lista.slice(1).map(function(v){ return '<h3>Versão '+v.v+' · '+esc(v.data)+'</h3>'+itensDe(v).map(function(i){ idx.push(i); return itemHtml(i,k++); }).join(''); }).join('');
  var bg=D.createElement('div'); bg.className='nv-bg';
  bg.innerHTML='<div class="nv-md" role="dialog" aria-modal="true" aria-labelledby="nvT"><div class="nv-hd"><div class="nv-k">Novidades <span class="vb">versão '+atual.v+'</span></div><h2 id="nvT">'+esc(atual.titulo)+'</h2><p>Atualizado em '+esc(atual.data)+(atual.sub?' · '+esc(atual.sub):'')+'</p></div>'+
    '<div class="nv-bd">'+corpo+(antigas?'<div class="nv-old" id="nvOld" hidden>'+antigas+'</div>':'')+'</div>'+
    '<div class="nv-ft">'+(antigas?'<button type="button" id="nvMais">Versões anteriores</button>':'')+'<span class="sp"></span><button type="button" class="g" id="nvOk">Entendi</button></div></div>';
  D.body.appendChild(bg);
  var ok=function(){ marcar(MARCA); fechar(); setTimeout(function(){ try{ var w=v4w(); if(w) w.AgionTour2.reinvite(); else W.AgionTour&&W.AgionTour.reinvite&&W.AgionTour.reinvite(); }catch(e){} },400); };
  $('#nvOk',bg).onclick=ok;
  var mais=$('#nvMais',bg); if(mais) mais.onclick=function(){ var o=$('#nvOld',bg); o.hidden=!o.hidden; mais.textContent=o.hidden?'Versões anteriores':'Esconder anteriores'; };
  bg.addEventListener('click',function(e){ var b=e.target.closest&&e.target.closest('button[data-tut],button[data-go]'); if(b){ var it=idx[+(b.getAttribute('data-tut')||b.getAttribute('data-go'))]; marcar(MARCA); fechar();
      if(b.hasAttribute('data-tut')&&it.v2tut){ irV2(null,it.v2tut); } else if(b.hasAttribute('data-tut')&&v4w()&&it.tutorial){ irV2(null,it.tutorial); } else if(b.hasAttribute('data-tut')&&W.AgionTour){ W.AgionTour.start(it.tutorial); } else if(it.abrir){ try{ it.abrir(); }catch(err){} } return; }
    if(e.target===bg) ok(); });
  D.addEventListener('keydown',esc_);
  setTimeout(function(){ try{ $('#nvOk',bg).focus({preventScroll:true}); }catch(e){} },50);
}
function esc_(e){ if(e.key==='Escape'){ marcar(MARCA); fechar(); } }
function fechar(){ var b=$('.nv-bg'); if(b) b.remove(); D.removeEventListener('keydown',esc_); }

/* ---------- selo de versão (menu lateral; no app, em Ajustes) ---------- */
function selo(){
  var f=$('aside.side .foot'); if(f&&!$('.nv-ver',f)){ var b=D.createElement('button'); b.type='button'; b.className='nv-ver'; b.onclick=function(){ abrir({manual:true}); }; f.insertBefore(b,f.firstChild); }
  var bt=$('aside.side .nv-ver'); if(bt){ var novo=vistoLocal()<MARCA; bt.innerHTML='Versão <b>'+ATUAL+'</b> · Novidades'+(novo?'<span class="nv-dot" aria-label="há novidades"></span>':''); }
  try{ if(view.page==='config'){ var C=$('#content'); if(C&&!$('.nv-cfg',C)){ var p=D.createElement('div'); p.className='panel nv-cfg'; p.innerHTML='<h2>Versão da plataforma</h2><p class="note" style="margin:0 0 12px">Você está na versão <b>'+ATUAL+'</b>.</p><button class="btn btn-ghost btn-sm" type="button">Ver novidades</button>'; $('button',p).onclick=function(){ abrir({manual:true}); }; C.appendChild(p); } } }catch(e){}
}

/* ---------- ao entrar: mostra se houver versão nova para esta pessoa ---------- */
var checado=false;
async function talvezMostrar(){
  if(checado) return; var r=role(); if(!r) return; try{ if(session.viewAs) return; }catch(e){}
  checado=true;
  var v=Math.max(vistoLocal(), await vistoServidor()); if(v>MARCA) v=ATUAL; /* número acima do atual (ex.: 25 publicado por engano) volta para o do dia */ try{ localStorage.setItem(KEY(),String(v)); }catch(e){}
  selo();
  if(v>=MARCA) return;
  var temItem=VERSOES.some(function(ver){ return chave(ver)>v&&itensDe(ver).length; });
  if(!temItem){ marcar(MARCA); return; }
  if(W.AgionTour&&W.AgionTour.running&&W.AgionTour.running()) return;
  D.querySelectorAll('.tr-invite').forEach(function(e){ e.remove(); });
  abrir();
}

function hook(){ var t=0; (function go_(){ if(typeof W.render!=='function'){ if(++t<200) setTimeout(go_,50); return; } if(W.render.__nv) return;
  var _r=W.render; var f=function(){ var o=_r.apply(this,arguments); try{ selo(); setTimeout(talvezMostrar,900); }catch(e){} return o; }; f.__nv=1; W.render=f;
  if(typeof W.sairVerComo==='function'&&!W.sairVerComo.__nv){ var _s=W.sairVerComo; var g=function(){ var o=_s.apply(this,arguments); setTimeout(selo,0); return o; }; g.__nv=1; W.sairVerComo=g; }
})(); }
W.AgionNovidades={abrir:function(){ abrir({manual:true}); },versao:ATUAL,versoes:VERSOES};
hook();
})();
