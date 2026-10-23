/* ==========================================================================
   Agion — tool-tour.js · tutoriais das ferramentas que abrem em nova aba
   (Financiamento × Consórcio, Escada Financeira, Alavancagem, Gerador de Propostas)
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
 'calc-financiamento':{id:'t-financ',v:1,title:'Financiamento × Consórcio',
  save:function(){ var on=$('#segTipo button.on'); return on?on.getAttribute('data-t'):'CONT'; },
  restore:function(s){ clickSeg('#segTipo button[data-t="'+(s||'CONT')+'"]'); },
  steps:[
   {t:null,title:'A mesma compra, dois futuros',text:'Esta calculadora compara, para o mesmo bem, quanto o cliente paga no financiamento e no consórcio, e mostra o que acontece quando ele investe a diferença de parcela. Tudo recalcula na hora; nada é gravado.'},
   {t:up('#cred','.f'),title:'Crédito e investimento',text:'Valor do bem (o crédito da carta), o rendimento mensal para investir a sobra e o CDI de referência, usado como comparação no texto final.'},
   {t:up('#segTipo'),title:'Tipo de carta',text:'Escolha o tipo de consórcio. “Carta contemplada”: o cliente compra uma carta já contemplada. “Carta nova”: entra num grupo e paga meia parcela até contemplar. Os campos mudam conforme a escolha.',go:function(){ clickSeg('#segTipo button[data-t="CONT"]'); }},
   {t:up('#c_ent','.f'),title:'Carta contemplada · entrada',text:'A entrada é o valor pago a quem está vendendo a carta contemplada. Ela não abate o saldo: depois disso o cliente assume o crédito e as parcelas. Use % do crédito ou R$.'},
   {t:up('#c_parc','.f'),title:'Parcela integral',text:'Digite a parcela da carta, como vem da administradora. Se ficar vazio, a calculadora estima pela taxa total e pelo prazo. Na carta contemplada a parcela é sempre integral, do início ao fim.'},
   {t:up('#c_prazo','.f'),title:'Prazo e taxa',text:'Na carta contemplada, o prazo é o número de parcelas que faltam. A taxa total (administração + fundo de reserva) só é usada quando a parcela fica vazia.'},
   {t:up('#c_ptot','.f'),title:'Carta nova · prazo do grupo',text:'Na carta nova informe o prazo total do grupo e quantos meses ele já andou. A cota paga só o prazo que falta.',go:function(){ clickSeg('#segTipo button[data-t="NOVA"]'); }},
   {t:up('#c_pdec','.f'),title:'Meses que o grupo já andou',text:'Exemplo: grupo de 200 meses que já andou 100. O cliente não pagou essas 100 parcelas; elas são somadas quando ele contemplar, com o reajuste acumulado até lá.'},
   {t:up('#c_cont','.f'),title:'Contemplação prevista',text:'Até esse mês o cliente paga meia parcela. Na contemplação somam-se as parcelas do período que o grupo já andou e as metades não pagas; tudo é diluído nos meses restantes junto com a parcela cheia. O lance, se houver, sai nesse mês e abate o saldo.'},
   {t:up('#c_reaj','.f'),title:'Reajuste',text:'Os dois tipos de carta são reajustados todo ano por este percentual. A parcela mês a mês e os totais já consideram o reajuste.'},
   {t:up('#f_juro','.f'),title:'Financiamento',text:'Price (parcela fixa) ou SAC (parcela que cai), entrada em % ou R$, taxa ao mês ou CET ao ano, e o prazo. É o que o banco ofereceu ao cliente.'},
   {t:up('.verdict'),title:'Veredito',text:'O resumo em uma frase: quanto o consórcio deixa a mais no bolso no fim, somando a diferença investida. Embaixo, o patrimônio a mais, quanto a sobra vira e o mês em que ela já pagaria a carta inteira.'},
   {t:up('.cmp'),title:'Lado a lado',text:'O custo efetivo (CET) de cada opção, entrada, parcelas, custo além do crédito e total desembolsado. Na carta nova aparecem a meia parcela, o valor somado na contemplação e a parcela depois de contemplar.'},
   {t:up('#ch1','.card'),title:'Parcela mês a mês',text:'Quanto sai do bolso todo mês em cada opção, e a sobra que pode ser investida. Na carta nova dá para ver o degrau da contemplação.'},
   {t:up('#ch2','.card'),title:'Três jeitos de usar a sobra',text:'A: acumular tudo. B: deixar render e, depois do ponto de virada, usar só o rendimento para pagar a parcela. C: resgatar o rendimento todo mês. Logo abaixo, quanto o cliente termina com cada um.'},
   {t:up('.big-cta'),title:'A virada',text:'O mês em que a diferença investida já vale a carta inteira. É o argumento mais forte para a conversa: mostre com as premissas à mostra, sem prometer rendimento.'},
   {t:up('#pdfbtn'),title:'Baixar PDF',text:'Abre a impressão do navegador: escolha “Salvar como PDF”. Sai em A4, com o texto nítido e os gráficos, pronto para enviar ao cliente.'}
  ]},
 'escada-financeira':{id:'t-escada',v:1,title:'Escada Financeira',
  steps:[
   {t:null,title:'A escada que se paga sozinha',text:'Este gerador monta o documento da Escada Financeira: o cliente contempla, vende a carta com ágio, guarda e investe o capital, e o rendimento passa a pagar a próxima carta. O documento à direita se monta enquanto você preenche.'},
   {t:up('#f_agio','.gl'),title:'Premissas',text:'Ágio na venda da carta contemplada (ex.: 25%) e o rendimento mensal do capital guardado (ex.: 1% ao mês). Valem para todos os degraus.'},
   {t:up('#f_nome','.fld'),title:'Cliente',text:'Opcional. Se preencher, o nome do cliente aparece na capa do documento.'},
   {t:up('#degs'),title:'Degraus',text:'Cada degrau é uma carta da tabela e a quantidade de cotas. Os degraus usam a mesma carta, em várias cotas, para contemplar por proximidade. Ajuste a carta e as cotas de cada um.'},
   {t:up('.form .add'),title:'Adicionar degrau',text:'Cria o próximo degrau a partir do último, com uma cota a mais. Para tirar um degrau, use o botão de remover do próprio degrau.'},
   {t:up('#doc'),title:'O documento',text:'Capa, os degraus em páginas de três e a página final com o resultado: crédito, parcela, ágio, capital acumulado e qual carta o rendimento já paga.'},
   {t:up('#pdfbtn'),title:'Baixar PDF',text:'Gera o PDF do documento para enviar ao cliente. “Abrir em nova aba” mostra o documento sozinho, bom para apresentar numa chamada.'},
   {t:null,title:'Imprimir igual ao modelo',text:'Se imprimir pelo navegador, ative “Gráficos de fundo” e desmarque “Cabeçalhos e rodapés” para sair idêntico ao modelo. Lembre: são cenários com premissas, não promessa de ágio nem de rendimento.'}
  ]},
 'calc-alavancagem':{id:'t-alav',v:1,title:'Alavancagem',
  steps:[
   {t:null,title:'Consórcio não é dívida, é alavancagem',text:'Dois cenários numa tela só: vender a carta contemplada como investimento, ou usar a carta para comprar um imóvel de renda. Tudo recalcula na hora; nada é gravado.'},
   {t:nth('.scn .scnhd',0),title:'Cenário 1 · vender a carta',text:'O consórcio como aplicação: o cliente paga parcela reduzida até contemplar, contempla com lance embutido e vende a carta com ágio.'},
   {t:nth('.scn .flds',0),title:'Dados da carta',text:'Crédito, correção anual, parcela reduzida (meia parcela = 50%), prazo total e taxa de administração. Passe o mouse no “?” de cada campo para ver o que ele significa.'},
   {t:nth('.scn .flds',1),title:'Contemplação e lance',text:'Lance embutido (sai da própria carta), mês da contemplação, ágio na venda e o rendimento de uma aplicação financeira para comparar.'},
   {t:up('#o_lucro','.hero'),title:'Lucro na venda da carta',text:'O lucro líquido sobre o que o cliente aportou até contemplar, com o crédito liberado e o valor de venda logo abaixo.'},
   {t:up('#o_pini','.panel'),title:'Projeção do investimento',text:'Parcela reduzida, parcela na contemplação, parcela depois, total aportado e o rendimento equivalente da operação.'},
   {t:up('#o_b1','.panel'),title:'Consórcio vs aplicação',text:'Compara o lucro do consórcio com o que o mesmo dinheiro renderia numa aplicação financeira, no mesmo período.'},
   {t:nth('.scn .scnhd',1),title:'Cenário 2 · imóvel de renda',text:'O cliente usa o crédito contemplado para comprar um imóvel, recebe o aluguel e constrói patrimônio. Usa o mês de contemplação do cenário 1.'},
   {t:up('#p_imovel','.box'),title:'O imóvel e o aluguel',text:'Valor do imóvel, valorização ao ano, aluguel como % do imóvel por mês, reajuste do aluguel e imposto sobre a renda.'},
   {t:up('#p_patrim','.hero'),title:'Patrimônio construído',text:'O valor futuro do imóvel, o aluguel líquido acumulado, o total pago no consórcio e quanto saiu do bolso do cliente.'},
   {t:up('#p_brt','.panel'),title:'Quebra da operação',text:'Aluguel bruto, imposto, aluguel líquido, quanto do patrimônio já está pago e o custo de oportunidade.'},
   {t:up('#p_badge','.rate'),title:'Do bolso sobre o patrimônio',text:'Quanto o cliente tirou do bolso em relação ao patrimônio futuro, com uma avaliação rápida da operação.'},
   {t:up('#pdfbtn'),title:'Baixar PDF',text:'Gera o PDF com os dois cenários para enviar ao cliente. São simulações com premissas: valores reais dependem do grupo, da administradora e do mercado.'}
  ]},
 'propostas':{id:'t-prop',v:1,title:'Gerador de Propostas',
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
   {t:up('#c_cartas'),title:'Cartas',text:'Adicione quantas cartas quiser, padrão ou contemplada. Cada carta vira uma página do deck.'},
   {t:up('#c_strats'),title:'Estratégias',text:'Cada coluna é uma estratégia: digite quantas cotas de cada carta entram nela. Uma carta = alternativa; várias cartas = estratégia unificada. Estratégias diferentes nunca se somam: o cliente escolhe uma.'},
   {t:up('#c_pages'),title:'Páginas do deck',text:'Marque as páginas que entram na proposta e escolha o formato: vertical (documento) ou horizontal (slides 16:9).'},
   {t:up('#btnGerar','.btnrow'),title:'Gerar e baixar',text:'“Gerar prévia” monta a proposta logo abaixo. Confira os valores com a simulação da administradora e baixe em PNG ou PDF.'},
   {t:up('#preview'),title:'Prévia',text:'Aqui aparece a proposta exatamente como vai sair. Se algo estiver errado, ajuste os campos e gere de novo.'}
  ]},
 /* MCARTAS_20261021 */
 'melhores-cartas':{id:'t-mcartas',v:2,/* TOURS_LV_23OUT */title:'Melhores cartas disponíveis',
  steps:[
   {t:null,title:'Onde posicionar o cliente',text:'A ferramenta usa o Resultado de Assembleia Final da HS, mês a mês desde jun/2019, para mostrar em cada grupo as cotas que já saíram e as livres mais bem posicionadas perto delas.'},
   {t:up('#cats','.fld'),title:'Categoria',text:'Imóvel ou Automóvel. Cada categoria tem os próprios grupos.'},
   {t:up('#gtrig','.fld'),title:'Grupo',text:'Toque para trocar de grupo. Dá para buscar pelo número do grupo, pelo valor da carta (ex.: 300k) ou pela parcela (ex.: parcela 900). A caixa mostra o prazo, as cartas e as parcelas que a HS oferece no grupo. Ao abrir, a ferramenta já mostra o grupo que mais contemplou no último mês.'},
   {t:function(){ return up('.gtrig .glv')()||up('.gtrig .glvm')(); },title:'Lance livre do grupo',text:'O lance livre que contemplou nos últimos 6 meses: o mínimo e o máximo em % do prazo do grupo (e em parcelas). Na barra, o dourado é essa faixa e o traço é o lance médio que a HS mostra no portal. Lance que quitou a cota aparece como “quitação” e fica fora do mínimo e do máximo. Toque aqui para abrir o mês a mês.',optional:true},
   {t:up('#psel','.fld'),title:'Período',text:'“Todo o histórico” considera todas as contempladas desde 2019, porque cota contemplada não volta. Dá para olhar só os últimos 12, 6 ou 3 meses, ou a última assembleia.'},
   {t:up('#jan','.fld'),title:'Janela',text:'O tamanho do “bolo” em volta da cota: quantos números para cima e para baixo contam como contempladas em volta. A força da oportunidade vem dos números do sorteio que caem na cota por proximidade: alta com 5 ou mais, média com 3 ou 4, baixa com 2 ou no meio de um bolo denso.'},
   {t:up('.kpis'),title:'Resumo do grupo',text:'Total de cotas (toque em “ajustar” se o grupo tiver outro tamanho), contempladas, clientes da carteira e quantas livres são alta oportunidade (5 ou mais números do sorteio caem nelas).'},
   {t:up('#mapa .grid'),title:'Mapa de cotas',text:'Cada quadrado é uma cota. Vermelho listrado é contemplada, verde com borda é cliente Agion, roxo é oportunidade (o mais forte, com a estrela, é a alta), com o visto preto está na negociação e listrada é reservada ou indisponível. Toque numa cota para ver o detalhe.'},
   {t:up('#neg'),title:'Cotas por proximidade',text:'Escolha quantas cotas quer e toque em “Gerar cotas”: a ferramenta separa as livres com mais contempladas coladas, onde mais números do sorteio caem por proximidade. Tire ou ponha cotas à mão (no + das oportunidades, no detalhe ou ligando “Tocar no mapa põe na negociação”), posicione o cliente em todas de uma vez ou copie a lista para a negociação.'},
   {t:up('#cartas'),title:'Cartas do grupo',text:'As cartas que a HS oferece no grupo, com o crédito e a parcela de cada modalidade.',optional:true},
   {t:up('#lvh'),title:'Lance livre mês a mês',text:'O mínimo, o médio da HS e o máximo dos últimos 6 meses e, mês a mês, cada lance livre que contemplou, em % e em parcelas. No celular o painel fica recolhido: toque no título para abrir.',optional:true},
   {t:up('#fil'),title:'Filtros',text:'Veja só oportunidades, contempladas, disponíveis, clientes ou reservadas. “Ocultar clientes” esconde nomes e cotas da carteira para você mostrar a tela ao cliente.'},
   {t:up('#pop'),title:'Melhores oportunidades',text:'As livres com o maior bloco de contempladas colado, com quantos números do sorteio caem em cada uma; o + põe a cota na negociação. Na HS, se o número sorteado já saiu, a vez passa para a cota de cima e depois para a de baixo.'},
   {t:up('#det'),title:'Detalhe e ações',text:'Na cota escolhida: o bloco colado, os números do sorteio, posicionar cliente (a equipe toda vê), pôr na negociação, marcar como reservada ou indisponível quando o portal da HS mostrar que não dá, e desfazer depois.'},
   {t:up('#tabs'),title:'Melhores grupos e grade global',text:'“Melhores grupos” ordena os grupos pelas contemplações do último mês: quanto mais o grupo anda, mais ele contempla. “Grade global” mostra a carteira de 1 a 3.000, em todos os grupos, e sugere números para espalhar os clientes.'},
   {t:null,title:'Sempre confirme na HS',text:'A ferramenta sugere; a reserva de verdade é no portal da HS. Se a cota já estiver reservada por outro corretor, marque aqui como reservada para a equipe não perder tempo.'}
  ]}
};

/* ---------------------------------------------------------------- QUAL PÁGINA */
var path=(location.pathname||'').replace(/\.html$/,'').replace(/\/+$/,'').split('/').pop();
var T=TOURS[path]; if(!T) return;
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
#ttRoot.sheet .tt-card{width:auto;left:10px;right:10px;max-width:none}\
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
   '<div class="tt-acts"><span class="sp"></span><button type="button" class="tt-b tt-prev">Voltar</button><button type="button" class="tt-b g tt-next">Próximo</button></div></div>'+
   '<div aria-live="polite" style="position:absolute;left:-9999px" class="tt-sr"></div>';
  D.body.appendChild(r);
  UI={root:r,ring:$('.tt-ring',r),card:$('.tt-card',r),area:$('.tt-top .a',r),cnt:$('.tt-top .n',r),bar:$('.tt-bar i',r),t:$('#ttT',r),x:$('#ttX',r),miss:$('.tt-miss',r),prev:$('.tt-prev',r),next:$('.tt-next',r),sr:$('.tt-sr',r)};
  UI.prev.onclick=function(){ go(RUN.i-1,-1); };
  UI.next.onclick=function(){ if(RUN.i>=T.steps.length-1) done(); else go(RUN.i+1,1); };
  $('.tt-x',r).onclick=function(){ stop(); };
  $('.tt-veil',r).onclick=function(){};
  W.addEventListener('resize',place); W.addEventListener('scroll',place,true); D.addEventListener('keydown',key,true);
  return UI;
}
function destroy(){ if(!UI) return; W.removeEventListener('resize',place); W.removeEventListener('scroll',place,true); D.removeEventListener('keydown',key,true); UI.root.remove(); UI=null; }
function key(e){ if(!RUN) return; var tg=(e.target&&e.target.tagName)||''; if(e.key==='Escape'){ e.preventDefault(); stop(); }
  else if(!/INPUT|TEXTAREA|SELECT/.test(tg)&&e.key==='ArrowRight'){ e.preventDefault(); UI.next.click(); }
  else if(!/INPUT|TEXTAREA|SELECT/.test(tg)&&e.key==='ArrowLeft'&&RUN.i>0){ e.preventDefault(); go(RUN.i-1,-1); } }
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
  if(sheet){ cy=(on&&(r.top+r.bottom)/2>vh*0.5)?10:vh-ch-10; if(on&&cy>10&&r.bottom>cy-6) cy=10; c.style.transform='translate(0,'+cy+'px)'; return; }
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
async function go(i,dir){
  if(!RUN) return; var tok=++RUN.tok, n=T.steps.length, st=T.steps[i]; RUN.i=i;
  UI.area.textContent=T.title; UI.cnt.textContent='Passo '+(i+1)+' de '+n; UI.bar.style.transform='scaleX('+((i+1)/n)+')';
  UI.t.textContent=st.title; UI.x.textContent=st.text; UI.miss.hidden=true;
  UI.prev.disabled=i===0; UI.next.textContent=i===n-1?'Concluir':'Próximo';
  if(st.go){ try{ st.go(); }catch(e){} await sleep(120); if(!RUN||tok!==RUN.tok) return; }
  var el=st.t?await find(st.t,1500):null; if(!RUN||tok!==RUN.tok) return;
  if(st.t&&!el){ var j=i+(dir<0?-1:1); if(j>=0&&j<n) return go(j,dir); UI.miss.hidden=false; UI.miss.textContent='Esta parte não aparece agora. Siga para o próximo passo.'; }
  RUN.el=el; if(el) await scrollTo(el); if(!RUN||tok!==RUN.tok) return; place();
  UI.sr.textContent='Passo '+(i+1)+' de '+n+': '+st.title+'. '+st.text;
}
function store(k){ try{ return JSON.parse(localStorage.getItem(k)||'{}')||{}; }catch(e){ return {}; } }
function put(k,o){ try{ localStorage.setItem(k,JSON.stringify(o)); }catch(e){} }
function start(){
  if(RUN) return; closeInv(); var s=store('agion:tooltour:seen'); s[T.id]=1; put('agion:tooltour:seen',s);
  RUN={i:0,tok:0,el:null,saved:T.save?T.save():null}; build(); go(0,1);
  setTimeout(function(){ try{ UI&&UI.next.focus({preventScroll:true}); }catch(e){} },60);
}
function stop(){ if(!RUN) return; var sv=RUN.saved; RUN=null; destroy(); if(T.restore){ try{ T.restore(sv); }catch(e){} } }
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
