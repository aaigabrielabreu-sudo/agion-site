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

/* v25 começou com rev:1 — no dia 16/10 um número 25 ficou no ar por alguns minutos. v26 = 19/10 (visual novo). Próxima: 27. */
/* itens com v2tut abrem o tutorial guiado do visual novo (plat2-tour.js) */
function v4w(){ try{ var f=D.querySelector('#v4wrap iframe'); if(f&&D.documentElement.classList.contains('v4on')&&f.contentWindow&&f.contentWindow.AgionTour2) return f.contentWindow; }catch(e){} return null; }
function irV2(tab,tut){ var w=v4w(); if(w){ try{ if(tut) w.AgionTour2.start(tut); else w.go(tab); }catch(e){} return; } try{ go({painel:'dash',clientes:'users',ajustes:'config'}[tab]||tab); }catch(e){} }
var VERSOES=[
 {v:26,rev:1,data:'19/10/2026',titulo:'Plataforma com visual novo',itens:[
   {roles:S3,ic:'spark',t:'Visual novo, mesmos dados',d:'A plataforma ganhou um visual novo, mais rápido e organizado. Seus leads, clientes, tarefas e comissões são os mesmos. A versão anterior continua em Ajustes › Versão anterior.',v2tut:'painel'},
   {roles:S3,ic:'map',t:'Tutorial guiado em todas as abas',d:'Na primeira vez em cada aba aparece “Primeira vez aqui?” com um guia passo a passo, direto na tela, passando por todas as sub-abas. O botão “?” do topo abre o tutorial da aba a qualquer hora, e o progresso vale no celular e no computador.',abrir:function(){ irV2('tutoriais'); }},
   {roles:S3,ic:'funnel',t:'CRM mais rápido',d:'Os cartões aparecem na hora. No celular, a faixa Quadro/Lista/Perdidos e as etapas ficam presas no topo enquanto você rola.',v2tut:'crm'},
   {roles:S3,ic:'check',t:'Tarefas no visual novo',d:'Atrasadas, hoje e próximos 7 dias em cartões no topo; abra a tarefa para marcar Feita ou Não feita com a resposta e a anotação.',v2tut:'tarefas'},
   {roles:S3,ic:'user',t:'App do celular atualiza sozinho',d:'Não precisa mais baixar o app de novo: ele pega a versão nova sozinho ao abrir. A barra de menus fica embaixo e desliza com o dedo. Para ver o ícone novo (fundo branco com a logo), apague e adicione o app de novo uma única vez.'},
   {roles:S3,ic:'doc',t:'Gerador de propostas: PDF que baixa de verdade',d:'O PDF ficou leve e baixa na hora; o PNG de várias páginas vem num arquivo .zip. No iPhone, abre o Compartilhar para salvar ou mandar no WhatsApp.',abrir:function(){ irV2('ferramentas'); }},
   {roles:S3,ic:'user',t:'Ficha cadastral lida sozinha',d:'Na ficha do lead ou do cliente, cole a ficha da administradora: RG, endereço, renda e os demais campos são preenchidos para você conferir e salvar.',v2tut:'ficha-lead'},
   {roles:M,ic:'users',t:'Distribuição manual por pessoa',d:'Em Captação › Distribuição de leads dá para escolher pessoa por pessoa quem recebe, com limite por dia.',v2tut:'captacao'},
   {roles:M,ic:'chat',t:'Templates com o texto e Disparos por e-mail',d:'Marketing › Templates mostra o texto de cada mensagem aprovada. Disparos ganhou a visão dos e-mails do follow-up.',v2tut:'marketing'}
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
  var corpo=itensDe(atual).map(function(i){ idx.push(i); return itemHtml(i,k++); }).join('');
  var antigas=lista.slice(1).map(function(v){ return '<h3>Versão '+v.v+' · '+esc(v.data)+'</h3>'+itensDe(v).map(function(i){ idx.push(i); return itemHtml(i,k++); }).join(''); }).join('');
  var bg=D.createElement('div'); bg.className='nv-bg';
  bg.innerHTML='<div class="nv-md" role="dialog" aria-modal="true" aria-labelledby="nvT"><div class="nv-hd"><div class="nv-k">Novidades <span class="vb">versão '+atual.v+'</span></div><h2 id="nvT">'+esc(atual.titulo)+'</h2><p>Atualizado em '+esc(atual.data)+'</p></div>'+
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
