/* ==========================================================================
   Agion — tool-tour.js · tutoriais das ferramentas que abrem em nova aba
   (Financiamento × Consórcio, Consórcio × À vista, Escada Financeira, Escada Patrimonial, Alavancagem, Gerador de Propostas)
   - Botão "? Como usar esta ferramenta" em cada ferramenta; convite na 1ª visita; ?tour=1 inicia direto.
   - Nada é gravado: só destaca e explica. Troca de modo usada na demonstração (ex.: Carta nova) volta ao fim.
   - Conclusão fica em localStorage 'agion:tooltour:done' e a Central de Tutoriais (plat-tour.js) lê e sincroniza.
   Ao mudar o conteúdo de um tutorial, suba "v" aqui E no item correspondente do plat-tour.js.
   ========================================================================== */
(function(){
'use strict';
var W=window, D=document;
function $(s,r){ try{ return (r||D).querySelector(s); }catch(e){ return null; } }
function $$(s,r){ try{ return [].slice.call((r||D).querySelectorAll(s)); }catch(e){ return []; } }
function vis(el){ if(!el||!el.isConnected) return false; var r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false; var cs=getComputedStyle(el); return cs.visibility!=='hidden'&&cs.display!=='none'; }
function up(sel,anc){ return function(){ var e=$$(sel).filter(vis)[0]; return e?(anc?(e.closest(anc)||e):e):null; }; }
function nth(sel,i){ return function(){ return $$(sel).filter(vis)[i]||null; }; }
function sleep(ms){ return new Promise(function(r){ setTimeout(r,ms); }); }
function clickSeg(sel){ var b=$(sel); if(b&&!b.classList.contains('on')) b.click(); }
var RM=W.matchMedia?W.matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};

/* ---------------------------------------------------------------- CONTEÚDO */
var TOURS={
 'calc-financiamento':{id:'t-financ',v:3,title:'Financiamento × Consórcio',/* FIN_V2_24OUT */
  save:function(){ var on=$('#segTipo button.on'); return on?on.getAttribute('data-t'):'CONT'; },
  restore:function(s){ clickSeg('#segTipo button[data-t="'+(s||'CONT')+'"]'); },
  steps:[
   {t:null,title:'A mesma compra, dois futuros',text:'Esta calculadora compara, para o mesmo bem, quanto o cliente paga no financiamento e no consórcio, e o que acontece quando ele investe a diferença de parcela. Tudo recalcula na hora; nada é gravado.'},
   {t:up('#segTipo'),title:'Tipo de carta',text:'“Carta contemplada”: o cliente compra uma carta já contemplada. “Carta nova”: entra num grupo e paga meia parcela até contemplar. Os campos mudam conforme a escolha.',go:function(){ clickSeg('#segTipo button[data-t="CONT"]'); }},
   {t:up('#cred','.panel'),title:'O bem e o investimento',text:'O valor do bem (o crédito), quanto a sobra rende ao mês (arraste a barra e veja tudo mudar) e o CDI de referência, usado como comparação no texto.'},
   {t:up('#c_parcc','.panel'),title:'Carta contemplada',text:'Entrada paga a quem vende a carta (em % ou R$), a parcela e o prazo que vêm na carta. Não há taxa a somar: a parcela × o prazo já é o que falta pagar.'},
   {t:up('#c_cont','.fld'),title:'Carta nova',text:'Prazo do grupo, quanto ele já andou e o mês previsto da contemplação. Até lá, meia parcela; na contemplação somam-se as parcelas do período que o grupo já andou e as metades, diluídas no prazo restante. O lance sai nesse mês.',go:function(){ clickSeg('#segTipo button[data-t="NOVA"]'); }},
   {t:up('#f_juro','.panel'),title:'O financiamento',text:'Price (parcela fixa) ou SAC (parcela que cai), entrada em % ou R$, taxa ao mês ou CET ao ano, e o prazo. É o que o banco ofereceu ao cliente.'},
   {t:up('.verdict'),title:'Veredito',text:'Quanto o consórcio deixa a mais no bolso no fim, somando a diferença investida. As barras mostram o total de cada opção: o mesmo crédito, mais o custo da carta (sem juros) ou os juros do financiamento.'},
   {t:up('.kpis'),title:'Os números que explicam',text:'Patrimônio a mais, quanto a sobra investida vira, o mês em que ela já pagaria a carta inteira e o custo efetivo de cada opção.'},
   {t:up('.cmp'),title:'Lado a lado',text:'Entrada, parcelas, custo além do crédito, juros e total desembolsado. Na carta nova aparecem a meia parcela, o valor somado na contemplação e a parcela depois de contemplar.'},
   {t:up('#vir'),title:'A virada',text:'O mês em que a diferença investida já vale a carta inteira. É o argumento mais forte da conversa — mostre com as premissas à vista, sem prometer rendimento.'},
   {t:up('#tlp'),title:'A jornada',text:'Os marcos no tempo: a compra (ou a contemplação), quando a sobra vale a carta, o fim do consórcio e o fim do financiamento.'},
   {t:up('#ch2','.panel'),title:'Três jeitos de usar a sobra',text:'A: acumular tudo. B: deixar render até a parcela do consórcio passar a do financiamento; daí a aplicação ajuda a pagar — B1 paga a parcela inteira, B2 usa só o rendimento (o que faltar sai do bolso). C: resgatar o rendimento todo mês desde o início. Embaixo de cada uma: quanto a aplicação pagou das parcelas e com quanto termina.'},
   {t:up('#ch3','.panel'),title:'Quem vence, conforme o rendimento',text:'Para cada rendimento da sobra, quanto o consórcio fica na frente (dourado) ou atrás (vermelho) do financiamento.'},
   {t:up('#pdfbtn'),title:'Baixar e link para o cliente',text:'“Baixar” gera o estudo em PDF (A4) ou numa imagem PNG para o WhatsApp. “Link para o cliente” cria um link temporário: ele simula sozinho e tudo aparece no Histórico de ferramentas.'}
  ]},
 'calc-avista':{id:'t-avista',v:2,title:'Consórcio × À vista',/* AVISTA_24OUT · PARCELA_REND_26OUT */
  save:function(){ var on=$('#segTipo button.on'),mp=$('#segMP button.on'); return (on?on.getAttribute('data-t'):'CONT')+'|'+(mp?mp.getAttribute('data-m'):'REND'); },
  restore:function(s){ s=String(s||'CONT|REND').split('|'); clickSeg('#segTipo button[data-t="'+(s[0]||'CONT')+'"]'); var b=$('#segMP button[data-m="'+(s[1]||'REND')+'"]'); if(b&&!b.classList.contains('on')) b.click(); },
  steps:[
   {t:null,title:'Pagar à vista ou deixar o dinheiro trabalhando',text:'Esta calculadora compara, para o mesmo bem, pagar tudo à vista com comprar pelo consórcio e deixar o dinheiro investido, pagando as parcelas com ele. No fim o bem é o mesmo; a diferença é quanto dinheiro sobra. Tudo recalcula na hora; nada é gravado.'},
   {t:up('#segTipo'),title:'Tipo de carta',text:'“Carta contemplada”: compra o bem já, com uma entrada a quem vende a carta e a parcela integral até o fim. “Carta nova”: meia parcela até contemplar, aluguel enquanto espera e lance na contemplação. Os campos mudam conforme a escolha.',go:function(){ clickSeg('#segTipo button[data-t="CONT"]'); }},
   {t:up('#p_bem','.panel'),title:'O bem',text:'Preço de tabela, o desconto que o vendedor dá para quem paga à vista (dá para arrastar a barra) e quanto o bem valoriza por ano. A valorização vale para as duas opções e pesa na carta nova, que compra mais tarde.'},
   {t:up('#din','.panel'),title:'O dinheiro do cliente',text:'Quanto ele tem hoje (vazio = o preço à vista), quanto o dinheiro rende ao mês e o imposto de renda. No à vista fica investido só o que sobrar; no consórcio o dinheiro continua investido e paga as parcelas. Arraste a barra do rendimento e veja o resultado mudar.'},
   {t:up('#segMP','.fld'),title:'A parcela sai de onde',text:'“Do rendimento”: só o rendimento paga a parcela — a sobra volta a render e o que faltar sai do bolso, sem tocar no dinheiro investido. “Rendimento + capital”: quando o rendimento não cobre, a parcela tira do próprio capital.'},
   {t:up('#c_parcc','.fld'),title:'Entrada, parcela e prazo',text:'Na carta contemplada não há taxa a somar: digite a entrada (em % do crédito ou em R$), a parcela e o prazo que vêm na carta — a parcela × o prazo já é o que falta pagar. A entrada sai do dinheiro hoje. “Desconto vale na carta?” serve para quando o vendedor dá o desconto também para quem paga com a carta.'},
   {t:up('#c_cont','.fld'),title:'Carta nova · contemplação, lance e aluguel',text:'Informe o prazo do grupo, quanto ele já andou e o mês previsto da contemplação. O lance próprio sai do dinheiro investido nesse mês; o embutido sai da própria carta. O aluguel entra enquanto o cliente espera (0 se não precisa). Se o bem valorizou mais que a carta, o cliente completa a diferença.',go:function(){ clickSeg('#segTipo button[data-t="NOVA"]'); }},
   {t:up('.verdict'),title:'Veredito',text:'Quem vence e por quanto, no fim do prazo. As barras mostram o patrimônio de cada opção: o bem (igual nas duas) e o dinheiro que sobrou investido.'},
   {t:up('.kpis'),title:'Os números que explicam',text:'Patrimônio a mais, quanto do que o consórcio cobra sai só do rendimento, o rendimento de empate (acima dele o consórcio vence) e o custo efetivo da carta.'},
   {t:up('.cmp'),title:'As duas opções lado a lado',text:'O que sai em cada uma e o patrimônio no fim. A melhor fica em destaque.'},
   {t:up('#mpw'),title:'Quanto o bem custou de verdade',text:'As duas formas lado a lado: quanto saiu do bolso (ou do capital), quanto sobra investido no fim, o custo real do bem e o desconto efetivo sobre o preço. Toque em uma para ela entrar na conta.'},
   {t:up('#tlp'),title:'A jornada no consórcio',text:'Os marcos no tempo: a compra do bem (ou a contemplação), quando o rendimento passa a pagar a parcela sozinho e a última parcela.'},
   {t:up('#ch3','.panel'),title:'Quem vence, conforme o rendimento',text:'Para cada rendimento mensal, quanto o consórcio deixa a mais (dourado) ou a menos (azul). É o gráfico para mostrar ao cliente onde fica o ponto de virada.'},
   {t:up('#pdfbtn'),title:'Baixar e link para o cliente',text:'“Baixar” gera o estudo em PDF (A4) ou numa imagem PNG para o WhatsApp. “Link para o cliente” cria um link temporário: ele simula sozinho e tudo aparece no Histórico de ferramentas.'}
  ]},
 'escada-financeira':{id:'t-escada',v:3,title:'Escadas',/* ESCADA_V2_25OUT */
  save:function(){ var on=$('#segEsc button.on'),mo=$('#segMont button.on'); return (on?on.getAttribute('data-t'):'S1')+'|'+(mo?mo.getAttribute('data-m'):'auto'); },
  restore:function(s){ s=String(s||'S1|auto').split('|'); clickSeg('#segEsc button[data-t="'+s[0]+'"]'); var b=$('#segMont button[data-m="'+(s[1]||'auto')+'"]'); if(b&&!b.classList.contains('on')) b.click(); },
  steps:[
   {t:null,title:'Uma carta paga a próxima',text:'A Escada Financeira em uma tela: o cliente contempla, vende a carta com ágio, guarda o capital aplicado e só o rendimento paga a parcela do degrau seguinte. Tudo recalcula na hora; nada é gravado.'},
   {t:up('#segEsc'),title:'Financeira ou patrimonial',text:'“Escada financeira”: vende cada carta contemplada com ágio. “Escada patrimonial”: usa cada carta para comprar imóveis de renda. Troque aqui sem sair da página.',go:function(){ clickSeg('#segEsc button[data-t="S1"]'); }},
   {t:up('#f_ciclo','.panel'),title:'Cliente, ritmo e lance',text:'O nome do cliente (opcional) aparece na proposta. O ritmo é quantos meses cada degrau leva até contemplar. Se o cliente contempla com lance embutido, informe o %: o crédito liberado cai e a conta inteira acompanha.'},
   {t:up('#pmont'),title:'Montagem automática',text:'Escolha só a carta inicial do cliente, da tabela HS: o prazo e a meia parcela vêm da própria tabela. Se quiser, divida a carta em cotas menores (ex.: R$ 1 milhão em 2 de R$ 500 mil) — mais cotas, mais chances de contemplar por proximidade. A escada se monta sozinha — a base paga do bolso até o aporte máximo, e depois cada degrau é o maior que o capital paga com folga. “Manual” deixa você montar degrau por degrau.',go:function(){ var b=$('#segMont button[data-m="auto"]'); if(b&&!b.classList.contains('on')) b.click(); }},
   {t:up('#pfs'),title:'Perfil: quanto a escada cresce',text:'Os três perfis usam a mesma carta inicial e o mesmo aporte. Muda a velocidade. Conservadora: cada degrau tem no máximo 50% mais cotas que o anterior e usa só 80% do rendimento para pagar o próximo (sobra 20% de margem). Equilibrada: até o dobro de cotas, usa 85%. Acelerada: o maior degrau que o rendimento paga, usando 95%.',go:function(){ var b=$('#segMont button[data-m="auto"]'); if(b&&!b.classList.contains('on')) b.click(); }},
   {t:up('#pfs'),title:'Como ler cada perfil',text:'À direita de cada perfil: “chega a” é o crédito do último degrau (a maior carta da escada; na patrimonial, os imóveis no topo) e “do bolso” é o total que o cliente paga do próprio dinheiro. Mais acelerada = topo maior, mas menos margem se a contemplação atrasar ou o rendimento cair. O bolso pode variar entre os perfis porque cada um monta a base de um jeito. Clique num perfil e a proposta inteira muda.',go:function(){ var b=$('#segMont button[data-m="auto"]'); if(b&&!b.classList.contains('on')) b.click(); }},
   {t:up('#f_agio','.panel'),title:'Venda e aplicação',text:'Ágio na venda da carta contemplada (ex.: 25%) e o rendimento mensal do capital guardado (ex.: 1% ao mês). Valem para todos os degraus.'},
   {t:up('#pdeg'),title:'Os degraus',text:'A escada montada, degrau por degrau: a carta e quantas cotas. “+ Adicionar degrau” cria o próximo. Se você mudar a carta ou as cotas de um degrau, a escada passa para manual.'},
   {t:up('#verd'),title:'A escada inteira',text:'De onde parte e até onde sobe, quanto sai do bolso e a partir de qual degrau a escada se paga sozinha. Os degraus dourados nascem pagos pelo rendimento.'},
   {t:up('#k1','.kpis'),title:'Os números do topo',text:'O capital guardado no fim, quanto ele rende por mês, o total que saiu do bolso e a soma das cartas.'},
   {t:up('#e1','.panel'),title:'Quem paga o próximo degrau',text:'Depois de cada venda: o rendimento do capital (verde) contra a parcela reduzida do degrau seguinte (dourado). Verde acima do dourado = o próximo degrau nasce pago.'},
   {t:up('#porq'),title:'Como a escada foi montada',text:'A explicação pronta para o cliente: a carta inicial, quais degraus são a base paga do bolso, a partir de qual degrau o capital paga sozinho e a folga no topo.'},
   {t:up('#dgs','.panel'),title:'Degrau a degrau',text:'Um cartão por degrau, com a carta, a parcela, o que ela gera e uma frase pronta para explicar ao cliente quem paga aquele degrau.'},
   {t:up('#tbl','.panel'),title:'Lado a lado e o que pesa contra',text:'A tabela resume a escada inteira. Mais abaixo vêm as regras, o que pode atrasar a escada (contemplação sem data, liquidez, rendimento) e o contato da Agion.'},
   {t:up('#pdfbtn'),title:'Baixar a proposta',text:'“Baixar” gera a proposta em PDF (A4, 3 páginas) ou numa imagem PNG para o WhatsApp, com o nome do cliente. É um cenário ilustrativo, não promessa de ágio, renda nem data de contemplação.'}
  ]},
 'escada-patrimonial':{id:'t-escpat',v:2,title:'Escadas',/* ESCADA_V2_25OUT */
  save:function(){ var on=$('#segEsc button.on'),mo=$('#segMont button.on'); return (on?on.getAttribute('data-t'):'S2')+'|'+(mo?mo.getAttribute('data-m'):'auto'); },
  restore:function(s){ s=String(s||'S2|auto').split('|'); clickSeg('#segEsc button[data-t="'+s[0]+'"]'); var b=$('#segMont button[data-m="'+(s[1]||'auto')+'"]'); if(b&&!b.classList.contains('on')) b.click(); },
  steps:[
   {t:null,title:'Os imóveis pagam a escada',text:'A Escada Patrimonial em uma tela: cada carta contemplada compra imóveis para alugar, a renda paga a parcela da própria carta e a sobra paga o degrau seguinte. O patrimônio fica com o cliente. Nada é gravado.'},
   {t:up('#segEsc'),title:'Financeira ou patrimonial',text:'“Escada financeira”: vende cada carta contemplada com ágio. “Escada patrimonial”: usa cada carta para comprar imóveis de renda. Troque aqui sem sair da página.',go:function(){ clickSeg('#segEsc button[data-t="S2"]'); }},
   {t:up('#f_ciclo','.panel'),title:'Cliente, ritmo e lance',text:'O nome do cliente (opcional) aparece na proposta. O ritmo é quantos meses cada degrau leva até contemplar. Se o cliente contempla com lance embutido, informe o %: o crédito liberado cai e a conta inteira acompanha.'},
   {t:up('#pmont'),title:'Montagem automática',text:'Escolha só a carta inicial do cliente, da tabela HS: o prazo e a meia parcela vêm da própria tabela. Se quiser, divida a carta em cotas menores (ex.: R$ 1 milhão em 2 de R$ 500 mil) — mais cotas, mais chances de contemplar por proximidade. A escada se monta sozinha — a base paga do bolso até o aporte máximo, e depois cada degrau é o maior que o capital paga com folga. “Manual” deixa você montar degrau por degrau.',go:function(){ var b=$('#segMont button[data-m="auto"]'); if(b&&!b.classList.contains('on')) b.click(); }},
   {t:up('#pfs'),title:'Perfil: quanto a escada cresce',text:'Os três perfis usam a mesma carta inicial e o mesmo aporte. Muda a velocidade. Conservadora: cada degrau tem no máximo 50% mais cotas que o anterior e usa só 80% do rendimento para pagar o próximo (sobra 20% de margem). Equilibrada: até o dobro de cotas, usa 85%. Acelerada: o maior degrau que o rendimento paga, usando 95%.',go:function(){ var b=$('#segMont button[data-m="auto"]'); if(b&&!b.classList.contains('on')) b.click(); }},
   {t:up('#pfs'),title:'Como ler cada perfil',text:'À direita de cada perfil: “chega a” é o crédito do último degrau (a maior carta da escada; na patrimonial, os imóveis no topo) e “do bolso” é o total que o cliente paga do próprio dinheiro. Mais acelerada = topo maior, mas menos margem se a contemplação atrasar ou o rendimento cair. O bolso pode variar entre os perfis porque cada um monta a base de um jeito. Clique num perfil e a proposta inteira muda.',go:function(){ var b=$('#segMont button[data-m="auto"]'); if(b&&!b.classList.contains('on')) b.click(); }},
   {t:up('#p_imovel','.panel'),title:'Os imóveis',text:'Valor de cada imóvel, a renda líquida dele ao mês (aluguel ou temporada, já sem custos) e a parcela da carta depois de contemplar (% do crédito, integral + diferido).'},
   {t:up('#pdeg'),title:'Os degraus',text:'A escada montada, degrau por degrau: a carta e quantas cotas. “+ Adicionar degrau” cria o próximo. Se você mudar a carta ou as cotas de um degrau, a escada passa para manual.'},
   {t:up('#verd'),title:'A escada inteira',text:'De onde parte, quantos imóveis o cliente tem no topo, quanto sai do bolso e a partir de qual degrau a renda dos imóveis paga tudo. Em cima de cada degrau, os imóveis acumulados.'},
   {t:up('#k1','.kpis'),title:'Os números do topo',text:'O patrimônio em imóveis, a renda no topo, a sobra livre depois de todas as parcelas e o total que saiu do bolso.'},
   {t:up('#e1','.panel'),title:'Quem paga o próximo degrau',text:'Depois de contemplar cada degrau: a sobra dos imóveis (renda menos todas as parcelas, em verde) contra a parcela reduzida do degrau seguinte (dourado).'},
   {t:up('#porq'),title:'Como a escada foi montada',text:'A explicação pronta para o cliente: a carta inicial, quais degraus são a base paga do bolso, a partir de qual degrau o capital paga sozinho e a folga no topo.'},
   {t:up('#dgs','.panel'),title:'Degrau a degrau',text:'Um cartão por degrau, com a carta, a parcela, o que ela gera e uma frase pronta para explicar ao cliente quem paga aquele degrau.'},
   {t:up('#tbl','.panel'),title:'Lado a lado e o que pesa contra',text:'A tabela resume a escada inteira. Mais abaixo vêm as regras, o que pode atrasar a escada (contemplação sem data, liquidez, rendimento) e o contato da Agion.'},
   {t:up('#pdfbtn'),title:'Baixar a proposta',text:'“Baixar” gera a proposta em PDF (A4, 3 páginas) ou numa imagem PNG para o WhatsApp, com o nome do cliente. É um cenário ilustrativo, não promessa de ágio, renda nem data de contemplação.'}
  ]},
 'calc-alavancagem':{id:'t-alav',v:2,title:'Alavancagem',/* ALAV_V2_24OUT */
  save:function(){ var on=$('#segScn button.on'); return on?on.getAttribute('data-t'):'S1'; },
  restore:function(s){ clickSeg('#segScn button[data-t="'+(s||'S1')+'"]'); },
  steps:[
   {t:null,title:'Consórcio não é dívida, é alavancagem',text:'Duas formas de usar o consórcio como investimento, cada uma na sua sub-aba. Tudo recalcula na hora; nada é gravado.'},
   {t:up('#segScn'),title:'Financeira ou patrimonial',text:'“Alavancagem financeira”: o cliente vende a carta contemplada com ágio. “Alavancagem patrimonial”: usa a carta para comprar um imóvel que o aluguel ajuda a pagar. Os campos, resultados e gráficos mudam com a escolha.',go:function(){ clickSeg('#segScn button[data-t="S1"]'); }},
   {t:up('#c_cred','.panel'),title:'A carta',text:'Crédito, prazo do plano, parcela reduzida (meia parcela = 50% do fundo comum) e taxa de administração. A correção anual atualiza o crédito até a contemplação.'},
   {t:up('#c_emb','.panel'),title:'Contemplação e venda',text:'Lance embutido (sai da própria carta), o mês da contemplação (arraste a barra e veja tudo mudar), o ágio que o comprador paga pela carta contemplada e uma aplicação para comparar.'},
   {t:up('#verd'),title:'O lucro na venda',text:'Quanto o cliente lucra vendendo a carta contemplada, sobre o que ele pagou até ali. As barras comparam com o que o mesmo dinheiro renderia na aplicação.',go:function(){ clickSeg('#segScn button[data-t="S1"]'); }},
   {t:up('#o_lucro','.kpis'),title:'Os números da operação',text:'Lucro líquido, crédito liberado depois do lance embutido, valor de venda com o ágio e o rendimento equivalente ao mês.'},
   {t:up('#o_pini','.cmp'),title:'Paga × recebe',text:'De um lado as parcelas até contemplar e o total aportado; do outro, o crédito, o lance embutido, o valor de venda e o lucro.'},
   {t:up('#a1','.panel'),title:'E se contemplar em outro mês?',text:'Para cada mês de contemplação: quanto o cliente teria pago e quanto receberia vendendo. O marcador vermelho mostra a partir de quando deixa de compensar.'},
   {t:up('#a2','.panel'),title:'Rendimento ao mês',text:'O lucro da venda dividido pelos meses, contra a aplicação. Enquanto o dourado estiver acima do azul, vender a carta rende mais.'},
   {t:up('#segScn'),title:'Alavancagem patrimonial',text:'Agora o cliente usa a carta contemplada para comprar um imóvel e alugar. Usa os mesmos dados da carta e o mesmo mês de contemplação.',go:function(){ clickSeg('#segScn button[data-t="S2"]'); }},
   {t:up('#p_imovel','.panel'),title:'O imóvel e o aluguel',text:'Valor do imóvel, valorização, aluguel em % do imóvel ao mês, reajuste e imposto. Se o crédito liberado não cobre o imóvel, o aviso mostra o complemento que o cliente paga na compra.'},
   {t:up('#verd2'),title:'Patrimônio × bolso',text:'O imóvel no fim do grupo contra o que realmente saiu do bolso: parcelas mais o complemento na compra, menos o aluguel líquido.'},
   {t:up('#p_bolso','.kpis'),title:'Do bolso sobre o patrimônio',text:'Patrimônio, aluguel líquido, quanto sai do bolso e a nota da operação: abaixo de 25% é excelente; até 40%, boa.'},
   {t:up('#b1','.panel'),title:'Mês a mês',text:'O valor do imóvel, o aluguel acumulado e o que saiu do bolso ao longo do grupo. Passe o mouse para ver cada mês.'},
   {t:up('#b2','.panel'),title:'E se a contemplação vier em outro mês?',text:'Quanto sai do bolso sobre o patrimônio para cada mês de contemplação, com as faixas excelente, bom e avaliar.'},
   {t:up('#pdfbtn'),title:'Baixar e link para o cliente',text:'“Baixar” gera o estudo da sub-aba aberta em PDF (A4) ou numa imagem PNG para o WhatsApp. “Link para o cliente” cria um link temporário: ele simula sozinho e tudo aparece no Histórico de ferramentas.'}
  ]},
 'propostas':{id:'t-prop',v:3,/* PROPOSTAS_V2_25OUT · v3 PROP_RESERVAS_26OUT */title:'Gerador de Propostas',
  save:function(){ var on=$('.tabs .tab.on'); return on?on.getAttribute('data-t'):'resumido'; },
  restore:function(s){ try{ if(typeof W.setTipo==='function') W.setTipo(s||'resumido'); }catch(e){} },
  steps:[
   {t:null,title:'A proposta pronta em minutos',text:'Aqui você monta a proposta do cliente e baixa em PNG (foto) e PDF. Nada vai para o cliente sem você baixar e enviar.'},
   {t:up('.tabs'),title:'Resumida ou completa',text:'Resumida: um card de 1 página com a tabela da carta. Completa: um deck com várias páginas e alternativas de carta lado a lado.',go:function(){ try{ W.setTipo&&W.setTipo('resumido'); }catch(e){} }},
   {t:up('#r_tipo','.field'),title:'Tipo de carta',text:'Carta normal ou contemplada. Ao escolher, as linhas padrão da tabela são carregadas; depois tudo é editável.'},
   {t:up('#r_cliente','.grid3'),title:'Cliente e selo',text:'O nome do cliente vai no topo (vazio = “PROPOSTA”). O selo é opcional, por exemplo “Oportunidade”.'},
   {t:up('#r_rows'),title:'Linhas da tabela',text:'Cada linha é um rótulo e um valor: crédito, lance, prazo, taxa, parcelas. Edite, apague ou use “+ adicionar linha”.'},
   {t:up('#r_estr1','.grid'),title:'Estratégia',text:'Duas linhas de destaque com a estratégia da proposta, por exemplo o lance sugerido e a contemplação alvo.'},
   {t:up('#r_disc','.field'),title:'Aviso do rodapé',text:'O aviso obrigatório, por exemplo: “Esta proposta não garante contemplação em um prazo específico.”'},
   {t:up('#r_cons','.grid3'),title:'Consultor, data e validade',text:'Saem no rodapé da proposta.'},
   {t:up('#form-completo'),title:'Proposta completa',text:'No deck: dados do cliente e do grupo, reajuste, custos do plano e as estratégias premium (ágio, lance embutido, renda). Cada campo alimenta uma página.',go:function(){ try{ W.setTipo&&W.setTipo('completo'); }catch(e){} }},
   {t:up('#c_cliente','.field'),title:'Cliente do cadastro',text:'Digite o nome ou o telefone e escolha o lead ou o cliente: a proposta fica ligada à pessoa e o “Salvar no cliente” guarda no card dela, como pelo CRM. Também filtra as cartas reservadas para ela.',optional:true},
   {t:up('#c_cartas'),title:'Cartas',text:'Adicione quantas cartas quiser, padrão ou contemplada. Cada carta vira uma página do deck.'},
   {t:up('#rsBt','.btnrow'),title:'Cartas reservadas',text:'Abre a lista das cotas reservadas pela Agion (e das posições guardadas), filtrada pelo cliente. Marque as cotas de um ou de vários grupos: cada grupo vira uma carta com a quantidade de cotas. Em “+ grupo e cotas” dá para digitar o grupo e os números.',optional:true},
   {t:up('#mp_info'),title:'Mapeamento de cartas',text:'A página “A sua cota no grupo”: na Melhores cartas, toque na cota que vai reservar e use “Levar para a proposta”; os dados da cota, do grupo e o print do mapa chegam aqui sozinhos. Também dá para preencher à mão e enviar uma imagem.',optional:true},
   {t:up('#c_strats'),title:'Estratégias',text:'Cada coluna é uma estratégia: digite quantas cotas de cada carta entram nela. Uma carta = alternativa; várias cartas = estratégia unificada. Estratégias diferentes nunca se somam: o cliente escolhe uma.'},
   {t:up('#c_pages'),title:'Páginas do deck',text:'Marque as páginas que entram na proposta e escolha o formato: vertical (documento) ou horizontal (slides 16:9).'},
   {t:up('#btnGerar','.btnrow'),title:'Gerar e baixar',text:'“Gerar prévia” monta a proposta logo abaixo. Confira os valores com a simulação da administradora e baixe em PNG ou PDF.'},
   {t:up('#preview'),title:'Prévia',text:'Aqui aparece a proposta exatamente como vai sair. Se algo estiver errado, ajuste os campos e gere de novo.'}
  ]},
 /* MCARTAS_20261021 */
 'melhores-cartas':{id:'t-mcartas',v:5,/* v5 LANCE_LIVRE_CALC_26OUT *//* v4 RESERVA_CLIENTE_26OUT *//* MAPA_PROPOSTA_25OUT *//* TOURS_LV_23OUT */title:'Melhores cartas disponíveis',
  steps:[
   {t:null,title:'Onde posicionar o cliente',text:'A ferramenta usa o Resultado de Assembleia Final da HS, mês a mês desde jun/2019, para mostrar em cada grupo as cotas que já saíram e as livres mais bem posicionadas perto delas.'},
   {t:up('#cats','.fld'),title:'Categoria',text:'Imóvel ou Automóvel. Cada categoria tem os próprios grupos.'},
   {t:up('#gtrig','.fld'),title:'Grupo',text:'Toque para trocar de grupo. Dá para buscar pelo número do grupo, pelo valor da carta (ex.: 300k) ou pela parcela (ex.: parcela 900). A caixa mostra o prazo, as cartas e as parcelas que a HS oferece no grupo. Ao abrir, a ferramenta já mostra o grupo que mais contemplou no último mês.'},
   {t:function(){ return up('.gtrig .glv')()||up('.gtrig .glvm')(); },title:'Lance livre do grupo',text:'O lance livre que contemplou nos últimos 6 meses: o mínimo e o máximo em % do prazo do grupo (e em parcelas). Na barra, o dourado é essa faixa e o traço é o lance médio que a HS mostra no portal. Lance que quitou a cota aparece como “quitação” e fica fora do mínimo e do máximo. Toque aqui para abrir o mês a mês.',optional:true},
   {t:up('#psel','.fld'),title:'Período',text:'“Todo o histórico” considera todas as contempladas desde 2019, porque cota contemplada não volta. Dá para olhar só os últimos 12, 6 ou 3 meses, ou a última assembleia.'},
   {t:up('#jan','.fld'),title:'Janela',text:'O tamanho do “bolo” em volta da cota: quantos números para cima e para baixo contam como contempladas em volta. A força da oportunidade vem dos números do sorteio que caem na cota por proximidade: alta com 5 ou mais, média com 3 ou 4, baixa com 2 ou no meio de um bolo denso.'},
   {t:up('.kpis'),title:'Resumo do grupo',text:'Total de cotas (toque em “ajustar” se o grupo tiver outro tamanho), contempladas, clientes da carteira e quantas livres são alta oportunidade (5 ou mais números do sorteio caem nelas).'},
   {t:up('#mapa .grid'),title:'Mapa de cotas',text:'Cada quadrado é uma cota. Vermelho listrado é contemplada, verde com borda é cliente Agion, roxo é oportunidade (o mais forte, com a estrela, é a alta), com o visto preto está na negociação e listrada é reservada ou indisponível. Toque numa cota para ver o detalhe.'},
   {t:up('#neg'),title:'Cotas por proximidade',text:'Escolha quantas cotas quer e toque em “Gerar cotas”: a ferramenta separa as livres com mais contempladas coladas, onde mais números do sorteio caem por proximidade. Para pôr ou tirar uma cota à mão, toque nela no mapa (ou no + das oportunidades), posicione o cliente em todas de uma vez ou copie a lista para a negociação.'},
   {t:up('#rsv'),title:'Reservas da Agion',text:'Todas as cotas reservadas pela Agion no portal da HS, por cliente e por grupo. Toque numa cota para ir a ela no mapa, ou em “Proposta” para abrir o Gerador com essas cotas. Para reservar várias de uma vez, ponha as cotas na negociação e toque em “Reservar as N no portal”: a plataforma pergunta para quem é. Cancelou direto na HS? Sai daqui sozinha (o robô confere de hora em hora).',optional:true},
   {t:up('#cartas'),title:'Cartas do grupo',text:'As cartas que a HS oferece no grupo, com o crédito e a parcela de cada modalidade.',optional:true},
   {t:up('#lvh'),title:'Lance livre mês a mês',text:'O mínimo, o médio da HS e o máximo dos últimos 6 meses e, mês a mês, cada lance livre que contemplou, em % e em parcelas. No celular o painel fica recolhido: toque no título para abrir.',optional:true},
   {t:up('#fil'),title:'Filtros',text:'Veja só oportunidades, contempladas, disponíveis, clientes ou reservadas. “Ocultar clientes” esconde nomes e cotas da carteira para você mostrar a tela ao cliente.'},
   {t:up('#pop'),title:'Melhores oportunidades',text:'As livres com o maior bloco de contempladas colado, com quantos números do sorteio caem em cada uma; o + põe a cota na negociação. Na HS, se o número sorteado já saiu, a vez passa para a cota de cima e depois para a de baixo.'},
   {t:up('#det'),title:'Detalhe e ações',text:'Na cota escolhida: o bloco colado, os números do sorteio, posicionar cliente (a equipe toda vê), pôr na negociação, marcar como reservada ou indisponível quando o portal da HS mostrar que não dá, e desfazer depois.'},
   {t:up('#dprop'),title:'Levar para a proposta',text:'Com a cota escolhida, este botão leva os dados da cota, do grupo e um print do mapa em volta dela para o Gerador de propostas, que abre na página “A sua cota no grupo”.',optional:true},
   {t:up('#tabs'),title:'Melhores grupos, grade global e lance livre',text:'“Melhores grupos” ordena os grupos pelas contemplações do último mês: quanto mais o grupo anda, mais ele contempla. “Grade global” mostra a carteira de 1 a 3.000, em todos os grupos, e sugere números para espalhar os clientes. “Lance livre” é a calculadora: quanto o cliente tem de lance e o crédito que ele quer, e ela acha o grupo onde o lance contempla (tem o tutorial próprio).'},
   {t:null,title:'Sempre confirme na HS',text:'A ferramenta sugere; a reserva de verdade é no portal da HS. Se a cota já estiver reservada por outro corretor, marque aqui como reservada para a equipe não perder tempo.'}
  ]},
 /* LANCE_LIVRE_CALC_26OUT · aba "Lance livre" da Melhores cartas (também abre por Ferramentas › Estratégias) */
 'melhores-cartas-lance':{id:'t-lance',v:1,title:'Calculadora de lance livre',
  save:function(){ var a=$('#lcL'),b=$('#lcC'); return {L:a?a.value:'',C:b?b.value:''}; },
  restore:function(s){ s=s||{}; [['#lcL','L'],['#lcC','C']].forEach(function(p){ var el=$(p[0]); if(el&&el.value!==s[p[1]]){ el.value=s[p[1]]||''; el.dispatchEvent(new Event('input',{bubbles:true})); } }); },
  steps:[
   {t:null,title:'Onde o lance do cliente contempla',text:'O cliente tem um valor para dar de lance livre e quer uma carta de certo valor. A calculadora olha todos os grupos da HS com cartas à venda e diz onde esse lance contempla, carta por carta. Nada é gravado.'},
   {t:up('#lccat','.fld'),title:'Categoria',text:'Imóvel ou Automóvel. Cada categoria tem os próprios grupos.'},
   {t:up('#lcL','.fld'),title:'Lance livre do cliente',text:'Quanto ele tem em dinheiro para o lance. Pode digitar 280.000, 280 mil ou 1,5 mi. Para a demonstração, colocamos R$ 280.000.',go:function(){ var el=$('#lcL'); if(el&&!el.value){ el.value='280.000'; el.dispatchEvent(new Event('input',{bubbles:true})); } }},
   {t:up('#lcC','.fld'),title:'Crédito que ele quer',text:'O valor da carta que ele precisa receber. Aqui, R$ 500.000. Se deixar em branco, a calculadora mostra a maior carta que o lance dele alcança.',go:function(){ var el=$('#lcC'); if(el&&!el.value){ el.value='500.000'; el.dispatchEvent(new Event('input',{bubbles:true})); } }},
   {t:up('#lcbase','.fld'),title:'Base do lance',text:'“Médio 6 meses”: a média, em parcelas, dos lances livres que contemplaram no grupo nos últimos 6 meses. “Último lance”: o menor lance que contemplou na última assembleia. A HS conta o lance em parcelas, por isso a conta é em parcelas.'},
   {t:up('.lcf2'),title:'Embutido, folga e filtros',text:'Lance embutido até 30% da carta (dá para mudar ou desligar), a folga em parcelas acima da referência, só grupos com até 40% do prazo andado e a modalidade da carta.'},
   {t:up('.lck'),title:'Resumo',text:'Quantos grupos entraram na conta, quantos contemplam só com o lance livre, quantos precisam de embutido e quantos ficaram fora (andaram mais de 40% ou não têm lance no período).',optional:true},
   {t:up('.lcc.hero'),title:'Melhor encaixe',text:'O grupo e a carta mais perto do crédito pedido onde o lance fecha: o lance alvo em parcelas, quanto vale 1 parcela de lance (a parcela integral, que já tem a taxa e o fundo dentro), o lance necessário (parcelas × parcela integral), quanto sai do bolso, o embutido e o crédito líquido.',optional:true},
   {t:up('.lcc.hero .lccov'),title:'Cobertura',text:'Quantos dos lances livres que contemplaram nos últimos 6 meses ficaram iguais ou abaixo do lance alvo. Quanto mais perto de todos, mais folgado. Para ficar mais seguro, ponha folga em parcelas.',optional:true},
   {t:up('.lcc.hero [data-abre]'),title:'Abrir o grupo',text:'Leva ao mapa do grupo já com essa carta escolhida para a reserva: gere as cotas por proximidade e reserve no portal para o cliente.',optional:true},
   {t:up('.lcinfo'),title:'Como a conta é feita',text:'O passo a passo da conta, com um exemplo. Toque para abrir.',optional:true},
   {t:null,title:'Sempre confirme na HS',text:'A calculadora sugere com os dados do portal e do resultado das assembleias. Antes de ofertar, confirme o lance e o embutido no portal da HS.'}
  ]},
 /* LANCE_FERRAMENTA_26OUT · /calc-lance (ferramenta independente, com link e Baixar) */
 'calc-lance':{id:'t-calclance',v:1,title:'Calculadora de lance livre',
  save:function(){ var a=$('#lc_L'),b=$('#lc_C'); return {L:a?a.value:'',C:b?b.value:''}; },
  restore:function(s){ s=s||{}; [['#lc_L','L'],['#lc_C','C']].forEach(function(p){ var el=$(p[0]); if(el&&el.value!==s[p[1]]){ el.value=s[p[1]]||''; el.dispatchEvent(new Event('input',{bubbles:true})); } }); },
  steps:[
   {t:null,title:'O grupo certo para o lance livre',text:'O cliente tem um valor para dar de lance livre e quer uma carta de certo valor. A calculadora olha os grupos da HS com cartas à venda e mostra o grupo e a carta onde esse lance contempla. Aqui é só grupo e carta; a escolha da cota fica na Melhores cartas. Nada é gravado.'},
   {t:up('#segTipo'),title:'Imóvel ou automóvel',text:'Cada categoria tem os próprios grupos.'},
   {t:up('#lc_L','.fld'),title:'Lance livre',text:'Quanto ele tem em dinheiro para o lance. Pode digitar 280.000, 280 mil ou 1,5 mi. Para a demonstração, R$ 280.000.',go:function(){ var el=$('#lc_L'); if(el&&!el.value){ el.value='280.000'; el.dispatchEvent(new Event('input',{bubbles:true})); } }},
   {t:up('#lc_C','.fld'),title:'Crédito que ele quer',text:'O valor da carta que ele precisa receber. Aqui, R$ 500.000. Em branco, a calculadora mostra a maior carta que o lance alcança.',go:function(){ var el=$('#lc_C'); if(el&&!el.value){ el.value='500.000'; el.dispatchEvent(new Event('input',{bubbles:true})); } }},
   {t:up('#segQt','.fld'),title:'1 ou 2 cotas',text:'Com 2 cotas no mesmo grupo, o crédito e o lance livre se dividem entre as duas (ex.: 2 cartas de R$ 500 mil no lugar de 1 de R$ 1 milhão). Cada cota precisa chegar ao lance alvo, e dá para contemplar as duas.'},
   {t:up('#segBase','.fld'),title:'Base do lance',text:'“Médio 6 meses”: a média, em parcelas, dos lances livres que contemplaram no grupo nos últimos 6 meses. “Último lance”: o menor lance que contemplou na última assembleia. A HS conta o lance em parcelas.'},
   {t:up('#lc_folga','.fld'),title:'Folga',text:'Parcelas a mais em cima da referência, para o lance ficar mais seguro.'},
   {t:up('#segEmb','.panel'),title:'Lance embutido',text:'Se o dinheiro do cliente não chega, a calculadora sobe para uma carta maior e completa com embutido (até 30% da carta na HS), sem deixar o crédito líquido abaixo do pedido. Dá para desligar.'},
   {t:up('#lc_and','.panel'),title:'Quais grupos entram',text:'Só grupos que andaram até 40% do prazo (dá para mudar) e a modalidade da carta: seguro na contemplação ou taxa antecipada.'},
   {t:up('#verd'),title:'Melhor grupo',text:'O grupo e a carta mais perto do crédito pedido onde o lance fecha. A barra mostra o lance: quanto sai do bolso, quanto é embutido e, se for o caso, quanto falta.'},
   {t:up('.kpis'),title:'Os números',text:'A carta e a meia parcela, o lance alvo em parcelas, o lance em reais (o número de parcelas × a parcela integral, que já tem a taxa e o fundo dentro) e o crédito líquido.'},
   {t:up('#p_outros'),title:'Outros grupos',text:'Os outros grupos que contemplam com esses valores. Toque num deles para ver em destaque. Cobertura: quantos lances que contemplaram nos 6 meses ficaram iguais ou abaixo do lance alvo.'},
   {t:up('#p_hist'),title:'Lances do grupo, mês a mês',text:'Cada lance livre que contemplou no grupo em destaque nos últimos 6 meses, em parcelas.'},
   {t:up('#agLinkBtn'),title:'Link para o cliente',text:'Gera um link temporário com os valores da tela: o cliente abre sem login e já vê o grupo e a carta certos para ele. Fica no Histórico de ferramentas, ligado ao cliente.',optional:true},
   {t:up('#pdfbtn'),title:'Baixar',text:'PDF ou imagem PNG do estudo, pronta para mandar no WhatsApp.',optional:true},
   {t:null,title:'Sempre confirme na HS',text:'A calculadora usa o resultado das assembleias e as cartas do portal. Antes de ofertar, confirme o lance e o embutido no portal da HS.'}
  ]},
};

/* ---------------------------------------------------------------- QUAL PÁGINA */
var path=(location.pathname||'').replace(/\.html$/,'').replace(/\/+$/,'').split('/').pop();
var T0=TOURS[path]; if(!T0) return;
/* LANCE_LIVRE_CALC_26OUT: na aba Lance livre da Melhores cartas o guia é o da calculadora */
function qualT(){ var L=TOURS[path+'-lance']; if(!L) return T0; try{ if(W.AgionMC&&W.AgionMC.S) return W.AgionMC.S.aba==='lance'?L:T0; }catch(e){} return /[?&]aba=lance/.test(location.search)?L:T0; }
var T=qualT();
try{ if(W.top!==W.self) return; }catch(e){ return; } /* dentro da plataforma (iframe do CRM) não mostra o guia */

/* ---------------------------------------------------------------- VISUAL */
var CSS='\
#ttRoot{position:fixed;inset:0;z-index:2147483000;pointer-events:none;font-family:"Inter","Poppins",system-ui,sans-serif}\
#ttRoot .tt-veil{position:fixed;inset:0;background:rgba(6,23,20,.55);pointer-events:auto}\
#ttRoot.has .tt-veil{background:transparent}\
#ttRoot .tt-ring{position:fixed;left:0;top:0;border-radius:14px;box-shadow:0 0 0 2px #e8cc8b,0 0 0 6px rgba(232,204,139,.35),0 0 0 9999px rgba(6,23,20,.55);transition:all .28s ease;pointer-events:none}\
#ttRoot .tt-ring.off{opacity:0}\
#ttRoot .tt-card{position:fixed;left:0;top:0;width:360px;max-width:calc(100vw - 24px);background:#0b2a26;color:#f4efe3;border:1px solid rgba(232,204,139,.28);border-radius:18px;padding:16px 18px 14px;box-shadow:0 24px 60px -18px rgba(0,0,0,.55);pointer-events:auto;transition:transform .28s ease}\
#ttRoot .tt-top{display:flex;align-items:center;gap:8px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#e8cc8b;font-weight:700}\
#ttRoot .tt-top .n{margin-left:auto;color:#9fb8b0;letter-spacing:.02em;text-transform:none;font-weight:600}\
#ttRoot .tt-x{background:none;border:0;color:#9fb8b0;font-size:16px;cursor:pointer;padding:0 0 0 6px;line-height:1}\
#ttRoot .tt-bar{height:3px;background:rgba(255,255,255,.1);border-radius:3px;margin:10px 0 12px;overflow:hidden}\
#ttRoot .tt-bar i{display:block;height:100%;background:linear-gradient(90deg,#c8a860,#e8cc8b);transform-origin:left;transition:transform .3s}\
#ttRoot h4{margin:0 0 6px;font:600 18px/1.25 "Lora","Fraunces",Georgia,serif;color:#fff}\
#ttRoot p{margin:0;font-size:13.5px;line-height:1.55;color:#d6e2dd}\
#ttRoot .tt-miss{margin-top:8px;font-size:12px;color:#e8cc8b}\
#ttRoot .tt-acts{display:flex;gap:8px;margin-top:14px;align-items:center}\
#ttRoot .tt-acts .sp{flex:1}\
#ttRoot .tt-b{border:1px solid rgba(255,255,255,.18);background:transparent;color:#f4efe3;border-radius:999px;padding:8px 14px;font-weight:600;font-size:12.5px;font-family:inherit;cursor:pointer}\
#ttRoot .tt-b:disabled{opacity:.35;cursor:default}\
#ttRoot .tt-b.g{background:linear-gradient(135deg,#c8a860,#e8cc8b);color:#0b2a26;border-color:transparent}\
#ttRoot .tt-b.pl{display:inline-flex;align-items:center;gap:6px}#ttRoot .tt-b.pl[aria-pressed=true]{background:rgba(232,204,139,.16);border-color:rgba(232,204,139,.45);color:#e8cc8b}\
#ttRoot .tt-b.pl svg{width:11px;height:11px;fill:currentColor}\
#ttRoot .tt-card.busy .tt-next,#ttRoot .tt-card.busy .tt-prev{opacity:.45}\
#ttRoot .tt-auto{height:2px;background:rgba(232,204,139,.18);border-radius:2px;margin-top:10px;overflow:hidden;opacity:0;transition:opacity .2s}#ttRoot .tt-auto.on{opacity:1}#ttRoot .tt-auto i{display:block;height:100%;width:100%;background:#e8cc8b;transform-origin:left;transform:scaleX(0)}\
#ttRoot.sheet .tt-card{width:auto;left:10px;right:10px;max-width:none;max-height:calc(100% - 20px);overflow:auto}\
.tt-help{position:fixed;right:18px;bottom:18px;z-index:2147482000;display:flex;align-items:center;gap:8px;background:#0b2a26;color:#f4efe3;border:1px solid rgba(232,204,139,.4);border-radius:999px;padding:9px 15px 9px 9px;font:600 13px "Inter","Poppins",system-ui,sans-serif;cursor:pointer;box-shadow:0 12px 30px -12px rgba(0,0,0,.45)}\
.tt-help b{width:22px;height:22px;border-radius:50%;background:#e8cc8b;color:#0b2a26;display:inline-flex;align-items:center;justify-content:center;font-size:13px}\
.tt-inv{position:fixed;right:18px;bottom:70px;z-index:2147482001;width:330px;max-width:calc(100vw - 36px);background:#fff;color:#0b2a26;border:1px solid #e7dec9;border-radius:18px;padding:16px 18px;box-shadow:0 24px 60px -20px rgba(11,42,38,.5);font-family:"Inter","Poppins",system-ui,sans-serif}\
.tt-inv .k{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#a3833f;font-weight:700}\
.tt-inv h4{margin:6px 0 4px;font:600 17px/1.25 "Lora","Fraunces",Georgia,serif}\
.tt-inv p{margin:0;font-size:13px;line-height:1.5;color:#5b6b64}\
.tt-inv .r{display:flex;gap:8px;margin-top:12px}\
.tt-inv button{border:1px solid #e7dec9;background:#fff;border-radius:999px;padding:8px 14px;font-weight:600;font-size:12.5px;font-family:inherit;cursor:pointer;color:#0b2a26}\
.tt-inv button.g{background:#0b2a26;color:#fff;border-color:#0b2a26}\
@media print{.tt-help,.tt-inv,#ttRoot{display:none!important}}\
@media (prefers-reduced-motion: reduce){#ttRoot .tt-ring,#ttRoot .tt-card,#ttRoot .tt-bar i{transition:none}}';
function injectCSS(){ if($('#ttCss')) return; var s=D.createElement('style'); s.id='ttCss'; s.textContent=CSS; D.head.appendChild(s); }

var UI=null, RUN=null;
function build(){
  if(UI) return UI; injectCSS();
  var r=D.createElement('div'); r.id='ttRoot';
  r.innerHTML='<div class="tt-veil"></div><div class="tt-ring off"></div><div class="tt-card" role="dialog" aria-modal="false" aria-labelledby="ttT" aria-describedby="ttX">'+
   '<div class="tt-top"><span class="a"></span><span class="n"></span><button type="button" class="tt-x" aria-label="Fechar tutorial">✕</button></div>'+
   '<div class="tt-bar" aria-hidden="true"><i></i></div><h4 id="ttT"></h4><p id="ttX"></p><div class="tt-miss" hidden></div>'+
   '<div class="tt-acts"><button type="button" class="tt-b pl tt-play" aria-pressed="false"></button><span class="sp"></span><button type="button" class="tt-b tt-prev">Voltar</button><button type="button" class="tt-b g tt-next">Próximo</button></div><div class="tt-auto" aria-hidden="true"><i></i></div></div>'+
   '<div aria-live="polite" style="position:absolute;left:-9999px" class="tt-sr"></div>';
  D.body.appendChild(r);
  UI={root:r,ring:$('.tt-ring',r),card:$('.tt-card',r),area:$('.tt-top .a',r),cnt:$('.tt-top .n',r),bar:$('.tt-bar i',r),t:$('#ttT',r),x:$('#ttX',r),miss:$('.tt-miss',r),prev:$('.tt-prev',r),next:$('.tt-next',r),play:$('.tt-play',r),auto:$('.tt-auto',r),autoI:$('.tt-auto i',r),sr:$('.tt-sr',r)};
  UI.prev.onclick=function(){ prev(); };
  UI.next.onclick=function(){ next(); };
  UI.play.onclick=function(){ setAuto(!RUN.auto); };
  $('.tt-x',r).onclick=function(){ stop(); };
  $('.tt-veil',r).onclick=function(){ place(); };
  W.addEventListener('resize',place); W.addEventListener('scroll',place,true); D.addEventListener('keydown',key,true);
  try{ if(W.visualViewport) W.visualViewport.addEventListener('resize',place); }catch(e){}
  return UI;
}
function destroy(){ if(!UI) return; W.removeEventListener('resize',place); W.removeEventListener('scroll',place,true); D.removeEventListener('keydown',key,true); UI.root.remove(); UI=null; }
function key(e){ if(!RUN) return; var tg=(e.target&&e.target.tagName)||''; if(e.key==='Escape'){ e.preventDefault(); stop(); }
  else if(!/INPUT|TEXTAREA|SELECT/.test(tg)&&e.key==='ArrowRight'){ e.preventDefault(); next(); }
  else if(!/INPUT|TEXTAREA|SELECT/.test(tg)&&e.key==='ArrowLeft'){ e.preventDefault(); prev(); } }
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function place(){
  if(!UI||!RUN) return; var el=RUN.el, vw=W.innerWidth, vh=W.innerHeight, sheet=vw<=640, c=UI.card;
  UI.root.classList.toggle('sheet',sheet);
  var r=el&&el.isConnected?el.getBoundingClientRect():null, on=r&&r.bottom>20&&r.top<vh-20;
  UI.root.classList.toggle('has',!!on);
  if(on){ var p=6, x=Math.max(2,r.left-p), y=Math.max(2,r.top-p), w=Math.min(vw-4,r.right+p)-x, h=Math.min(vh-4,r.bottom+p)-y;
    UI.ring.style.left=x+'px'; UI.ring.style.top=y+'px'; UI.ring.style.width=w+'px'; UI.ring.style.height=h+'px'; UI.ring.classList.remove('off'); }
  else UI.ring.classList.add('off');
  var cw=c.offsetWidth, ch=c.offsetHeight, m=12, cx, cy;
  /* CELULAR_20261025: no celular o cartão fica preso à borda de baixo (ou de cima) da tela visível — no iPhone (app instalado) o innerHeight pode ser maior que a área visível e o cartão sumia */
  if(sheet){ var vvh=(W.visualViewport&&W.visualViewport.height)||vh, topo=!!(on&&(r.top+r.bottom)/2>vvh*0.5); if(on&&!topo&&r.bottom>vvh-ch-16) topo=true;
    c.style.transform='none'; if(topo){ c.style.top='calc(10px + env(safe-area-inset-top,0px))'; c.style.bottom='auto'; } else { c.style.top='auto'; c.style.bottom='calc(10px + env(safe-area-inset-bottom,0px))'; } return; }
  c.style.top=''; c.style.bottom='';
  if(!on){ cx=(vw-cw)/2; cy=(vh-ch)/2; }
  else{ var g=22;
    if(vw-r.right>=cw+g+m){ cx=r.right+g; cy=clamp(r.top+r.height/2-ch/2,m,vh-ch-m); }
    else if(r.left>=cw+g+m){ cx=r.left-g-cw; cy=clamp(r.top+r.height/2-ch/2,m,vh-ch-m); }
    else if(vh-r.bottom>=ch+g+m){ cx=clamp(r.left+r.width/2-cw/2,m,vw-cw-m); cy=r.bottom+g; }
    else if(r.top>=ch+g+m){ cx=clamp(r.left+r.width/2-cw/2,m,vw-cw-m); cy=r.top-g-ch; }
    else { cx=vw-cw-m; cy=vh-ch-m; } }
  c.style.transform='translate('+Math.round(cx)+'px,'+Math.round(cy)+'px)';
}
function scrollTo(el){ return new Promise(function(res){ if(!el) return res(); var r=el.getBoundingClientRect(), vh=W.innerHeight;
  if(r.top>=70&&r.bottom<=vh-20) return res();
  var blk=r.height>vh*0.7?'start':'center';
  try{ el.scrollIntoView({block:blk,behavior:(RM.matches||D.hidden)?'auto':'smooth'}); }catch(e){ el.scrollIntoView(); }
  var last=null, same=0, t0=Date.now(); (function poll(){ var q=el.getBoundingClientRect().top; if(last!==null&&Math.abs(q-last)<0.5) same++; else same=0; last=q;
    if(same>=2||Date.now()-t0>1400){ var rr=el.getBoundingClientRect(); if(rr.bottom<20||rr.top>W.innerHeight-20){ try{ el.scrollIntoView({block:blk}); }catch(e){} } return res(); } setTimeout(poll,80); })(); }); }
async function find(fn,ms){ var end=Date.now()+(ms||1500); while(Date.now()<end){ var e=null; try{ e=fn(); }catch(_){ } if(e&&vis(e)) return e; await sleep(100); } return null; }
/* TOUR_PASSO_26OUT: um passo por clique. Passo normal nunca é pulado sozinho (se o lugar não aparece, o texto fica na tela
   com um aviso). Passo opcional fora da tela é pulado ANTES de aparecer, sem mostrar o texto dele e com os botões travados. */
function alive(tok){ return RUN&&RUN.tok===tok; }
function trava(on){ if(!UI) return; RUN.busy=!!on; UI.card.classList.toggle('busy',!!on); UI.prev.disabled=!!on||RUN.i<=0; UI.next.disabled=!!on; }
function pinta(i){ var n=T.steps.length, st=T.steps[i]; RUN.i=i;
  UI.area.textContent=T.title; UI.cnt.textContent='Passo '+(i+1)+' de '+n; UI.bar.style.transform='scaleX('+((i+1)/n)+')';
  UI.t.textContent=st.title; UI.x.textContent=st.text; UI.miss.hidden=true;
  UI.prev.disabled=i===0; UI.next.disabled=false; UI.next.textContent=i===n-1?'Concluir':'Próximo'; paintPlay(); }
async function go(i,dir){
  if(!RUN) return; var tok=++RUN.tok, n=T.steps.length, st, el=null, shown=false; RUN.t0=Date.now(); clearTimeout(RUN.timer); autoBar(false);
  for(;;){ st=T.steps[i];
    if(!st.optional){ RUN.busy=false; UI.card.classList.remove('busy'); pinta(i); shown=true; } else trava(true);
    if(st.go){ try{ st.go(); }catch(e){} await sleep(150); if(!alive(tok)) return; }
    el=st.t?await find(st.t,st.optional?900:1500):null; if(!alive(tok)) return;
    if(st.t&&!el&&st.optional){ var j=i+(dir<0?-1:1); if(j>=0&&j<n){ i=j; continue; } if(dir>0&&!shown){ trava(false); return done(); } }
    break; }
  trava(false); if(!shown) pinta(i);
  if(st.t&&!el){ UI.miss.hidden=false; UI.miss.textContent='Esta parte não aparece agora na tela (pode depender das escolhas acima). Siga para o próximo passo.'; }
  RUN.el=el; if(el) await scrollTo(el); if(!alive(tok)) return; place();
  UI.sr.textContent='Passo '+(i+1)+' de '+n+': '+st.title+'. '+st.text;
  if(RUN.auto) schedAuto();
}
/* clique duplo (ou toque que chega duas vezes) não anda dois passos: 450 ms entre um passo e outro */
function cedo(){ return RUN.t0&&Date.now()-RUN.t0<450; }
function next(){ if(!RUN||RUN.busy||cedo()) return; if(RUN.i>=T.steps.length-1){ setAuto(false); return done(); } go(RUN.i+1,1); }
function prev(){ if(!RUN||RUN.busy||cedo()||RUN.i<=0) return; go(RUN.i-1,-1); }
/* Reproduzir: passa sozinho, no tempo de leitura de cada passo; Pausar para parar. */
var I_PLAY='<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg>', I_PAUSE='<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
function paintPlay(){ if(!UI||!RUN) return; UI.play.innerHTML=RUN.auto?I_PAUSE+'Pausar':I_PLAY+'Reproduzir'; UI.play.setAttribute('aria-pressed',RUN.auto?'true':'false'); }
function autoBar(ms){ if(!UI) return; var i=UI.autoI; UI.auto.classList.toggle('on',!!ms); i.style.transition='none'; i.style.transform='scaleX(0)'; if(ms){ void i.offsetWidth; i.style.transition='transform '+ms+'ms linear'; i.style.transform='scaleX(1)'; } }
function setAuto(on){ if(!RUN) return; RUN.auto=!!on; paintPlay(); clearTimeout(RUN.timer); autoBar(false); if(on&&!RUN.busy) schedAuto(); }
function schedAuto(){ clearTimeout(RUN.timer); var st=T.steps[RUN.i]||{text:''}; var ms=Math.max(4500,Math.min(11000,2200+String(st.text||'').length*48));
  if(RUN.i>=T.steps.length-1){ autoBar(false); RUN.auto=false; paintPlay(); return; }
  autoBar(ms); RUN.timer=setTimeout(function(){ if(!RUN||!RUN.auto||RUN.busy) return; next(); },ms); }
/* enquanto o guia roda: premissas ocultas aparecem e os painéis recolhidos abrem (no fim volta como estava) */
function abrePagina(){ var H=D.documentElement, volta=[];
  if(H.classList.contains('semprem')){ var pb=$('#premBtn'); if(pb){ pb.click(); volta.push(function(){ if(!H.classList.contains('semprem')){ var b2=$('#premBtn'); if(b2) b2.click(); } }); } }
  $$('.side>.panel.min').forEach(function(p){ p.classList.remove('min'); volta.push(function(){ p.classList.add('min'); }); });
  return function(){ volta.forEach(function(f){ try{ f(); }catch(e){} }); }; }
function store(k){ try{ return JSON.parse(localStorage.getItem(k)||'{}')||{}; }catch(e){ return {}; } }
function put(k,o){ try{ localStorage.setItem(k,JSON.stringify(o)); }catch(e){} }
function start(){
  if(RUN) return; T=qualT(); closeInv(); var s=store('agion:tooltour:seen'); s[T.id]=1; put('agion:tooltour:seen',s);
  RUN={i:0,tok:0,el:null,auto:false,busy:false,timer:null,saved:T.save?T.save():null,volta:abrePagina()}; build(); paintPlay(); go(0,1);
  setTimeout(function(){ try{ UI&&UI.next.focus({preventScroll:true}); }catch(e){} },60);
}
function stop(){ if(!RUN) return; clearTimeout(RUN.timer); var sv=RUN.saved, vt=RUN.volta; RUN=null; destroy(); if(T.restore){ try{ T.restore(sv); }catch(e){} } if(vt) vt(); }
function done(){ var d=store('agion:tooltour:done'); d[T.id]={v:T.v,ts:Date.now()}; put('agion:tooltour:done',d); stop(); flash('Tutorial concluído ✓ Ele aparece como concluído na Central de Tutoriais.'); }
function flash(t){ injectCSS(); var f=D.createElement('div'); f.className='tt-inv'; f.style.bottom='70px'; f.innerHTML='<p style="color:#0b2a26;font-weight:600">'+t+'</p>'; D.body.appendChild(f); setTimeout(function(){ f.remove(); },3800); }

var INV=null;
function closeInv(){ if(INV){ INV.remove(); INV=null; } }
function invite(){
  var dn=store('agion:tooltour:done'), sn=store('agion:tooltour:seen'); if((dn[T.id]&&dn[T.id].v===T.v)||sn[T.id]) return;
  var el=D.createElement('div'); el.className='tt-inv'; el.setAttribute('role','dialog');
  el.innerHTML='<div class="k">Primeira vez aqui?</div><h4>Como usar '+T.title+'</h4><p>Um guia de '+T.steps.length+' passos, direto nesta tela, sem alterar nada.</p><div class="r"><button class="g" data-a="go">Iniciar</button><button data-a="no">Agora não</button></div>';
  el.addEventListener('click',function(e){ var a=e.target&&e.target.getAttribute('data-a'); if(!a) return; if(a==='go') start(); else { var s=store('agion:tooltour:seen'); s[T.id]=1; put('agion:tooltour:seen',s); closeInv(); } });
  D.body.appendChild(el); INV=el;
}
function boot(){
  injectCSS();
  var b=D.createElement('button'); b.type='button'; b.className='tt-help'; b.setAttribute('aria-label','Como usar esta ferramenta');
  b.innerHTML='<b aria-hidden="true">?</b><span>Como usar esta ferramenta</span>'; b.onclick=start; D.body.appendChild(b);
  if(/[?&]tour=1/.test(location.search)) setTimeout(start,900); else setTimeout(invite,1400);
}
if(D.readyState==='loading') D.addEventListener('DOMContentLoaded',boot); else boot();
W.AgionToolTour={start:start,stop:stop,tours:TOURS};
})();
