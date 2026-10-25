/* ==========================================================================
   Agion — plat2-novabas.js · NOVIDADES DENTRO DE CADA ABA (visual novo) · NOVABAS_25OUT
   - Lê as versões do pop-up de novidades (plat-novidades.js, na página de fora), a partir da 26.
   - Cada novidade vai para a aba dela: campo aba/onde no próprio item (novidades daqui para a frente)
     ou o MAPA abaixo (versões 26 a 30).
   - Na aba: faixa "Novidades nesta aba" enquanto houver novidade não vista; o ✦ do topo abre a lista
     da aba a qualquer hora. No menu: pontinho dourado na aba com novidade. Em Ferramentas: selo "Novo".
   - "Ver como funciona": tutorial curto, direto na tela, no mesmo motor dos tutoriais (plat2-tour.js).
     Nada é alterado: os cliques do tutorial são só visuais.
   - Visto por pessoa: aparelho + servidor (tutorial_progresso, contexto 'novabas'). Em "Ver como" não grava.
   Para uma novidade nova aparecer na aba certa: no item do plat-novidades.js, ponha
     aba:'crm' (chave da aba no menu) e, se quiser apontar um lugar, onde:'#seletor' | 'tc:esc' | 'deal:.atr' | 'btn:texto' | 'pan:#id' | 'txt:#seletor|texto'
   ========================================================================== */
(function(){
'use strict';
var W=window, D=document;
if(W.__novabas) return; W.__novabas=1;
var DESDE=26, DIAS_NOVO=30;

function $(s,r){ try{ return (r||D).querySelector(s); }catch(e){ return null; } }
function $$(s,r){ try{ return [].slice.call((r||D).querySelectorAll(s)); }catch(e){ return []; } }
function vis(el){ if(!el||!el.isConnected) return false; var r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false; var cs=getComputedStyle(el); return cs.visibility!=='hidden'&&cs.display!=='none'; }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function role(){ try{ return W.effRoleR()||'master'; }catch(e){ return 'master'; } }
function RO(){ try{ return !!W.RO(); }catch(e){ return false; } }
function meId(){ try{ return W.realId(); }catch(e){ return null; } }
function SB(){ try{ return W.psb(); }catch(e){ return null; } }
function cur(){ try{ return W.cur; }catch(e){ return null; } }
function navL(){ try{ return W.navList(); }catch(e){ return []; } }
function tabOk(p){ var l=navL(); if(!l.length) return true; return l.some(function(t){ return t[0]===p; }); }
function nomeAba(p){ var t=navL().filter(function(x){ return x[0]===p; })[0]; return t?t[1]:p; }
function versoes(){ var V=null; try{ V=W.parent&&W.parent!==W&&W.parent.AgionNovidades&&W.parent.AgionNovidades.versoes; }catch(e){} if(!V){ try{ V=W.AgionNovidades&&W.AgionNovidades.versoes; }catch(e){} } return V||W.__NOVABAS_VERSOES||[]; }

/* ---------- onde cada novidade das versões 26 a 30 aparece: título → [aba, onde] ---------- */
var MAPA={
 /* v30 */
 'Nova: Escadas (financeira e patrimonial)':['ferramentas','tc:esc'],
 'Ocultar premissas':['ferramentas','tc:fin'],
 'Tarefas sem informação repetida':['tarefas','#tl .tk'],
 'Calculadoras no tablet e no celular':['ferramentas','tc:fin'],
 /* v29 */
 'Nova: Consórcio × À vista':['ferramentas','tc:avi'],
 'Financiamento × Consórcio de cara nova':['ferramentas','tc:fin'],
 'Alavancagem: financeira e patrimonial em sub-abas':['ferramentas','tc:ala'],
 'E-mails: resposta para quem atende, com cópia para o Gabriel':['crm','deal:[data-a="prop"]'],
 'Assembleias: Importar e Data de assembleia no visual novo':['ferramentas','tc:ass'],
 'Aparelhos conectados com o nome certo':['ajustes','pan:#ajdvl'],
 'Sem zoom ao digitar':['painel',null],
 /* v28 */
 'CRM sempre atualizado':['crm','#kb .col'],
 'Contato feito: lembrete em 4 h, Alice em 8 h':['crm','txt:#kb .col|contato feito'],
 'Proposta e convite por e-mail no seu nome':['crm','deal:[data-a="prop"]'],
 'Calendário no jeito da Apple':['calendario','#calv'],
 'Sua agenda Google da Agion é a principal':['calendario','#calcals'],
 'Suas outras agendas dentro do Calendário':['calendario','#calcals'],
 'Simular comissão':['comissoes','btn:simular'],
 'Lance livre de cada grupo':['ferramentas','tc:cartas'],
 'Ferramentas organizadas':['ferramentas','#fsn2'],
 'Planejamento financeiro no visual novo':['consultoria','#cosn'],
 'Aparelhos conectados e tema do CRM':['ajustes','pan:#ajdvl'],
 'Seu planejamento com visual novo':['planejamento','.plplans'],
 /* v27 */
 'Melhores cartas disponíveis':['ferramentas','tc:cartas'],
 'Assembleias: o resultado final substitui o do mês':['ferramentas','tc:ass'],
 'Importar resultado final':['ferramentas','tc:cartas'],
 'Melhores cartas: cores novas e ranking pelo último mês':['ferramentas','tc:cartas'],
 'CRM em 7 etapas':['crm','#kb .col'],
 'Cliente é quem tem carta de consórcio':['clientes','#view .kpis'],
 /* v26 */
 'Arrastar cartão em qualquer altura do quadro':['crm','deal:'],
 'Lead em reengajamento fica fora do CRM':['crm','#kb .col'],
 'Lead com a Alice fica no CRM':['crm','#kb .col'],
 'Ver como: um clique':['painel','#vc'],
 'Comissão da competência completa':['comissoes','#cck'],
 'Histórico de ferramentas':['ferramentas','tc:hist'],
 'Aviso quando o cliente abre ou simula':['ferramentas','tc:hist'],
 'Link da calculadora ligado ao cliente do CRM':['ferramentas','tc:fin'],
 'Card do CRM com atividades':['crm','deal:'],
 'Ficha do cliente: aba Atividades':['clientes','#cg > *'],
 'Tutorial do Histórico de ferramentas':['ferramentas','tc:hist'],
 'Respostas rápidas: vai exatamente o que está escrito':['conversas','#cvc'],
 'Resultado da assembleia também para o cliente':['ferramentas','tc:ass'],
 'Alice mais rápida até a reunião':['conversas','#cvls'],
 'Marketing espaçado para quem não responde':['conversas','#cvls'],
 'Notificações de assembleia':['painel','#bell'],
 'Trocar o responsável do card na hora':['crm','deal:.atr'],
 'Valor e categoria que o cliente fala para a Alice':['crm','deal:.catp, .d1 button, .d1 .pill'],
 'Rodízio só para o tráfego pago':['captacao','sub:capsn=dist|#dmo'],
 'Nova aba: Cadastro':['cadastro','#pl'],
 'Cadastro liberado para os especialistas':['cadastro','#view .banner'],
 'Histórico do cliente no link da calculadora':['ferramentas','tc:hist'],
 'Entrar com Face ID ou digital':['ajustes','#ajpks'],
 'Esqueci minha senha: agora funciona':['ajustes','pan:#ajc'],
 'Plataforma com visual novo, mesmos dados':['painel',null],
 'Tutorial guiado em todas as abas':['painel','#how, .b-help'],
 'Novidades a cada versão':['ajustes','#ajnov'],
 'Arrastar sem marcar o texto':['crm','deal:'],
 'Mover cartão no celular em dois toques':['crm','deal:'],
 'Quem falou aparece para todos':['conversas','#cvc'],
 'CRM com 7 etapas: Reunião agendada e Diagnóstico':['crm','#kb .col'],
 'CRM carrega na hora':['crm','#kb .col'],
 'Topo do CRM fixo no celular':['crm','#kbs, #vw'],
 'Tarefas no visual novo':['tarefas','#tnum'],
 'Ficha cadastral preenchida sozinha':['crm','deal:'],
 'Conversas ao vivo, como no WhatsApp':['conversas','#cvc'],
 'Mensagens mais recentes primeiro':['conversas','#cvls'],
 'Templates aparecem na conversa':['conversas','#cvc'],
 'Aviso quando a mensagem não chega':['conversas','#cvc'],
 'Respostas rápidas fora das 24 h':['conversas','#cvc'],
 'Gerador de propostas: prévia e downloads':['ferramentas','tc:prop'],
 'Link temporário da calculadora para o cliente':['ferramentas','tc:fin'],
 'Link e QR code dentro da proposta':['ferramentas','tc:prop'],
 'Calculadora de alavancagem reorganizada':['ferramentas','tc:ala'],
 'O resultado explicado em palavras':['ferramentas','tc:fin'],
 'Financiamento × Consórcio: carta nova ou contemplada':['ferramentas','tc:fin'],
 'Tutorial em cada ferramenta':['ferramentas','.tc .how'],
 'Assinatura de e-mail da Agion':['ajustes',null],
 'Propostas novas de alavancagem':['ferramentas','tc:ala'],
 'App atualiza sozinho':['ajustes','#ajpush, #ajinst, #ajcel'],
 'Abas do menu no primeiro toque':['painel','#mtab, #nav'],
 'Barra de menus mais baixa e solta':['painel','#mtab, #nav'],
 'Toque mais preciso':['painel',null],
 'Tutorial bem encaixado no celular':['painel','#how, .b-help'],
 'Ícone e topo do app':['painel',null],
 'Distribuição manual por pessoa':['captacao','sub:capsn=dist|#dmo'],
 'Templates com o texto e Disparos por e-mail':['marketing','#tpln, #mktpl, #mkt'],
 'Aba Contas para a equipe':['contas','#view .kpis'],
 'Organograma: equipe do MAAV':['contas','#orgp'],
 'Perfil Marketing (MAAV)':['contas','#orgp'],
 'Contas: organograma e editar a equipe':['contas','#orgp'],
 'Assembleias: ver outros meses e excluir data':['ferramentas','tc:ass'],
 'Marketing MAAV: leads do Mooving entram sozinhos':['marketing','#mkt']
};
var FERR={fin:'Financiamento × Consórcio',avi:'Consórcio × À vista',ala:'Alavancagem',esc:'Escadas',prop:'Gerador de propostas',cartas:'Melhores cartas',ass:'Assembleias',hist:'Histórico de ferramentas'};

/* ---------- lista: novidades da pessoa, com a aba de cada uma ---------- */
function idade(dt){ var m=/^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(dt||''); if(!m) return 0; return (Date.now()-new Date(+m[3],+m[2]-1,+m[1]).getTime())/864e5; }
function lista(){
  var r=role(), out=[], base=navL().length?navL()[0][0]:'painel';
  versoes().forEach(function(v){ if(!v||v.v<DESDE) return; (v.itens||[]).forEach(function(it){
    if((it.roles||[]).indexOf(r)<0) return;
    var m=MAPA[it.t]||[], aba=it.aba||m[0]||'painel', onde=('onde' in it)?it.onde:(m[1]||null);
    if(!tabOk(aba)){ aba=tabOk('painel')?'painel':base; if(!/^tc:|^#how|^#bell|^#vc|^#mtab/.test(onde||'')) onde=null; }
    var fk=(onde&&onde.indexOf('tc:')===0)?onde.slice(3):null;
    out.push({k:v.v+'|'+it.t,v:v.v,data:v.data,it:it,aba:aba,onde:onde,ferr:fk});
  }); });
  return out;
}
function daAba(p){ return lista().filter(function(x){ return x.aba===p; }); }

/* ---------- visto (aparelho + servidor) ---------- */
var ST={key:null,d:null,timer:null,pulled:{}};
function skey(){ return 'agion:novabas:'+(meId()||'anon')+(RO()?':ver':''); }
function stor(){ try{ return (RO()||W.__NOVABAS_TESTE)?W.sessionStorage:W.localStorage; }catch(e){ return null; } }
function sd(){ var k=skey(); if(ST.key!==k||!ST.d){ ST.key=k; ST.d=null; try{ ST.d=JSON.parse(stor().getItem(k)||'null'); }catch(e){} if(!ST.d||typeof ST.d!=='object'||!ST.d.vistos) ST.d={vistos:{}}; pull(); } return ST.d; }
function visto(k){ return !!sd().vistos[k]; }
function novo(x){ return !visto(x.k)&&idade(x.data)<=DIAS_NOVO; }
function grava(){ try{ stor().setItem(ST.key,JSON.stringify(ST.d)); }catch(e){} }
function marca(ks){ var d=sd(), mud=false; ks.forEach(function(k){ if(!d.vistos[k]){ d.vistos[k]=Date.now(); mud=true; } }); if(!mud) return; grava(); push(); pinta(); }
async function pull(){ if(RO()||W.__NOVABAS_TESTE) return; var uid=meId(); if(!uid||ST.pulled[uid]) return; ST.pulled[uid]=1;
  try{ var r=await SB().from('tutorial_progresso').select('dados').eq('user_id',uid).eq('contexto','novabas').maybeSingle();
    var v=r&&r.data&&r.data.dados&&r.data.dados.vistos; if(v&&typeof v==='object'){ var d=sd(), mud=false; Object.keys(v).forEach(function(k){ if(!d.vistos[k]){ d.vistos[k]=v[k]; mud=true; } }); if(mud){ grava(); pinta(); } }
  }catch(e){} }
function push(){ if(RO()||W.__NOVABAS_TESTE) return; clearTimeout(ST.timer); ST.timer=setTimeout(async function(){ var uid=meId(); if(!uid) return;
  try{ await SB().from('tutorial_progresso').upsert({user_id:uid,contexto:'novabas',dados:{vistos:sd().vistos},updated_at:new Date().toISOString()},{onConflict:'user_id,contexto'}); }catch(e){} },1500); }

/* ---------- ícones ---------- */
var IC={
 spark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z"/></svg>',
 play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>',
 open:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>',
 x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
};

/* ---------- estilos ---------- */
function css(){ if($('#nvbCss')) return; var st=D.createElement('style'); st.id='nvbCss'; st.textContent=[
'.nvb-strip{display:flex;align-items:center;gap:12px;margin:0 0 16px;padding:12px 14px 12px 12px;border-radius:18px;background:linear-gradient(135deg,rgba(197,160,89,.16),rgba(197,160,89,.05));border:1px solid rgba(197,160,89,.42);color:var(--ink);animation:nvbIn .45s var(--ez,ease) both}',
'.nvb-strip .nvb-ic{flex:none;width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:var(--ink);color:var(--gold2,#E8CC8B)}.nvb-strip .nvb-ic svg{width:19px;height:19px}',
'.nvb-strip .nvb-tx{flex:1;min-width:0}.nvb-strip .nvb-tx b{display:block;font:700 14px/1.3 "DM Sans",system-ui,sans-serif}',
'.nvb-strip .nvb-tx span{display:block;font-size:12.5px;line-height:1.4;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
'.nvb-strip .nvb-go{flex:none;border:0;border-radius:999px;background:var(--ink);color:var(--gold2,#E8CC8B);font:700 12.5px/1 "DM Sans",system-ui,sans-serif;padding:10px 15px;cursor:pointer;white-space:nowrap}',
'.nvb-strip .nvb-x{flex:none;width:32px;height:32px;border:0;border-radius:50%;background:transparent;color:var(--mut);display:grid;place-items:center;cursor:pointer}.nvb-strip .nvb-x svg{width:15px;height:15px}.nvb-strip .nvb-x:hover{background:rgba(0,0,0,.06)}',
'@keyframes nvbIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}',
'.nvb-dot{position:absolute;top:6px;right:8px;width:8px;height:8px;border-radius:50%;background:var(--gold,#C5A059);box-shadow:0 0 0 2px var(--card,#FFFDF8);pointer-events:none}',
'#nav .ni .nvb-dot{position:static;flex:none;margin:0 2px 0 8px;width:7px;height:7px;box-shadow:none}#mts button,#mtab .mmais{position:relative}#mts .nvb-dot,#mtab .mmais .nvb-dot{top:4px;right:calc(50% - 16px)}',
'.nvb-tc{position:absolute;top:16px;right:16px;z-index:2;background:var(--gold,#C5A059);color:#0B2A26;font:800 10.5px/1 "DM Sans",system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;padding:5px 8px;border-radius:999px;box-shadow:0 4px 12px -4px rgba(0,0,0,.4)}',
'.tc .cov{position:relative}',
'#nvbBtn{position:relative}#nvbBtn svg{width:18px;height:18px;color:var(--goldd,#A3833F)}#nvbBtn .nvb-dot{top:5px;right:5px}',
'.nvb-bg{position:fixed;inset:0;z-index:9000;background:rgba(4,16,14,.52);display:flex;align-items:center;justify-content:center;padding:18px;animation:nvbFade .2s linear both}',
'@keyframes nvbFade{from{opacity:0}to{opacity:1}}',
'.nvb-md{width:min(640px,100%);max-height:86vh;display:flex;flex-direction:column;background:var(--card,#FFFDF8);color:var(--ink);border:1px solid var(--line,#E6DCC8);border-radius:24px;box-shadow:var(--shadow2,0 30px 60px -20px rgba(0,0,0,.4));animation:nvbUp .35s var(--ez,ease) both;font-family:"DM Sans",system-ui,sans-serif}',
'@keyframes nvbUp{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}',
'.nvb-hd{padding:20px 22px 14px;border-bottom:1px solid var(--line,#E6DCC8);display:flex;gap:12px;align-items:flex-start}',
'.nvb-hd .k{font:800 10.5px/1 "DM Sans",sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--goldd,#A3833F)}',
'.nvb-hd h2{margin:7px 0 3px;font:600 22px/1.2 Lora,Georgia,serif}.nvb-hd h2 em{color:var(--goldd,#A3833F)}.nvb-hd p{margin:0;font-size:13px;color:var(--mut)}',
'.nvb-hd .nvb-x{flex:none;margin-left:auto;width:34px;height:34px;border:0;border-radius:50%;background:var(--bg2,#ECE4D3);color:var(--ink);display:grid;place-items:center;cursor:pointer}.nvb-hd .nvb-x svg{width:15px;height:15px}',
'.nvb-bd{padding:6px 22px 14px;overflow:auto;-webkit-overflow-scrolling:touch}',
'.nvb-vh{margin:16px 0 6px;font:800 10.5px/1 "DM Sans",sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--mut)}',
'.nvb-it{display:flex;gap:12px;padding:13px 0;border-bottom:1px solid var(--line,#E6DCC8)}.nvb-it:last-child{border-bottom:0}',
'.nvb-it .nvb-i{flex:none;width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:rgba(197,160,89,.14);color:var(--goldd,#A3833F)}.nvb-it .nvb-i svg{width:17px;height:17px}',
'.nvb-it h4{margin:0 0 4px;font:600 15.5px/1.3 Lora,Georgia,serif;display:flex;gap:8px;align-items:center;flex-wrap:wrap}',
'.nvb-it h4 .nv{font:800 9.5px/1 "DM Sans",sans-serif;letter-spacing:.1em;text-transform:uppercase;background:var(--gold,#C5A059);color:#0B2A26;border-radius:999px;padding:4px 7px}',
'.nvb-it p{margin:0;font-size:13.3px;line-height:1.55;color:var(--mut);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.nvb-it p.all{display:block}',
'.nvb-it .mais{border:0;background:none;padding:2px 0 0;color:var(--goldd,#A3833F);font:700 12px "DM Sans",sans-serif;cursor:pointer}',
'.nvb-ac{display:flex;gap:8px;flex-wrap:wrap;margin-top:9px}.nvb-ac button{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line,#E6DCC8);background:var(--card,#fff);color:var(--ink);border-radius:999px;padding:8px 13px;font:700 12.5px/1 "DM Sans",sans-serif;cursor:pointer;min-height:34px}',
'.nvb-ac button svg{width:13px;height:13px}.nvb-ac button.g{background:var(--ink);color:var(--gold2,#E8CC8B);border-color:var(--ink)}',
'.nvb-ft{padding:12px 22px 16px;border-top:1px solid var(--line,#E6DCC8);display:flex;gap:10px;align-items:center}.nvb-ft small{flex:1;color:var(--mut);font-size:12px;line-height:1.4}',
'.nvb-ft button{border:0;border-radius:999px;background:linear-gradient(135deg,#C5A059,#B08A45);color:#0B2A26;font:800 13px/1 "DM Sans",sans-serif;padding:11px 18px;cursor:pointer}',
'@media (max-width:640px){.nvb-strip{flex-wrap:wrap;padding:12px}.nvb-strip .nvb-tx{flex-basis:calc(100% - 100px)}.nvb-strip .nvb-go{order:4;flex:1;text-align:center;padding:11px}',
' .nvb-bg{align-items:flex-end;padding:0}.nvb-md{width:100%;max-height:88vh;border-radius:24px 24px 0 0;padding-bottom:env(safe-area-inset-bottom,0px)}.nvb-hd,.nvb-bd,.nvb-ft{padding-left:16px;padding-right:16px}}',
'@media (prefers-reduced-motion:reduce){.nvb-strip,.nvb-bg,.nvb-md{animation:none!important}}'
].join('\n'); D.head.appendChild(st); }

/* ---------- localizadores (onde) ---------- */
function subDe(o){ var m=/^sub:([\w-]+)=([\w-]+)\|(.*)$/.exec(o||''); return m?{id:m[1],k:m[2],resto:m[3]}:null; }
function clicaSub(id,k){ var b=k?$('#'+id+' button[data-k="'+k+'"]'):$('#'+id+' button[data-k]'); if(b&&!b.classList.contains('on')) b.click(); }
function loc(o){
  if(!o) return null;
  var sb=subDe(o); if(sb) return loc(sb.resto);
  var first=function(sel){ return function(){ return $$(sel).filter(vis)[0]||null; }; };
  if(o.indexOf('tc:')===0) return first('.tc[data-k="'+o.slice(3)+'"]');
  if(o.indexOf('pan:')===0){ var s1=o.slice(4); return function(){ var e=$$(s1).filter(vis)[0]; return e?(e.closest('.panel')||e):null; }; }
  if(o.indexOf('deal:')===0){ var s2=o.slice(5); return function(){ var c=$$('#kb .deal').filter(vis)[0]; return c?(s2?($$(s2,c).filter(vis)[0]||c):c):null; }; }
  if(o.indexOf('btn:')===0){ var tx=o.slice(4).toLowerCase(); return function(){ return $$('#view button').filter(function(b){ return vis(b)&&(b.textContent||'').toLowerCase().indexOf(tx)>=0; })[0]||null; }; }
  if(o.indexOf('txt:')===0){ var p=o.slice(4).split('|'), t2=(p[1]||'').toLowerCase(); return function(){ return $$(p[0]).filter(function(e){ return vis(e)&&(e.textContent||'').toLowerCase().indexOf(t2)>=0; })[0]||null; }; }
  return first(o);
}

/* ---------- tutorial curto de uma novidade ---------- */
function partes(d){ d=String(d||'').trim(); var fr=d.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g)||[d], a='', b='';
  fr.forEach(function(f){ if(!b&&(a.length+f.length<=230||!a)) a+=f; else b+=f; }); return [a.trim(),b.trim()]; }
var MINI=null, VG=null;
function tourDe(x){
  var it=x.it, L=loc(x.onde), p=partes(it.d), st=[], sb=subDe(x.onde);
  st.push({act:sb?function(){ clicaSub(sb.id,sb.k); }:null,t:L,title:it.t,text:p[0]||it.t});
  if(p[1]) st.push({t:L,title:'Em detalhes',text:p[1]});
  if(x.ferr&&FERR[x.ferr]) st.push({t:loc('tc:'+x.ferr),title:'Ver por dentro',text:'Toque no cartão para abrir '+FERR[x.ferr]+'. Lá dentro, o botão Tutorial mostra a ferramenta inteira, passo a passo.'});
  return {id:'nv-'+x.k.replace(/[^\w]+/g,'-').toLowerCase().slice(0,60),page:x.aba,v:1,g:'Novidades',title:'Novidade · versão '+x.v,desc:it.d,steps:st,mini:true,post:sb?function(){ clicaSub(sb.id,null); }:null};
}
function verTutorial(x){
  fechaSheet(); marca([x.k]); var T=W.AgionTour2; if(!T||!T.config) return;
  var t=tourDe(x), cfg=T.config, i;
  for(i=cfg.length-1;i>=0;i--) if(cfg[i].mini) cfg.splice(i,1);
  cfg.push(t); MINI=t.id; try{ T.reset&&T.reset(t.id); }catch(e){}
  T.start(t.id);
  clearInterval(VG); VG=setInterval(function(){ if(T.running()) return; clearInterval(VG); for(var j=cfg.length-1;j>=0;j--) if(cfg[j].mini) cfg.splice(j,1); MINI=null; },700);
}
function abreFerr(k){ fechaSheet();
  try{ if(k==='ass'){ W.go('assembleias'); return; } if(k==='hist'&&typeof W.R==='object'&&W.R.histferr){ W.go('histferr'); return; } }catch(e){}
  try{ if(typeof W.abreTool==='function'&&{fin:1,avi:1,ala:1,esc:1,prop:1,cartas:1}[k]){ W.abreTool(k); return; } }catch(e){}
  try{ if(cur()!=='ferramentas') W.go('ferramentas'); }catch(e){}
  setTimeout(function(){ var c=$('.tc[data-k="'+k+'"]'); if(c) c.click(); },420); }

/* ---------- a lista da aba (folha) ---------- */
function fechaSheet(){ var b=$('.nvb-bg'); if(b) b.remove(); D.removeEventListener('keydown',escK); }
function escK(e){ if(e.key==='Escape') fechaSheet(); }
function abreSheet(p){
  fechaSheet(); p=p||cur(); var L=daAba(p); if(!L.length) return;
  var nv={}; L.forEach(function(x){ nv[x.k]=novo(x); });
  var vs=[], porV={}; L.forEach(function(x){ if(!porV[x.v]){ porV[x.v]=[]; vs.push(x); } porV[x.v].push(x); });
  var idx=[], corpo=vs.map(function(h){ return '<div class="nvb-vh">Versão '+h.v+' · '+esc(h.data)+'</div>'+porV[h.v].map(function(x){ var k=idx.push(x)-1;
    return '<div class="nvb-it"><span class="nvb-i">'+IC.spark+'</span><div style="min-width:0;flex:1"><h4>'+esc(x.it.t)+(nv[x.k]?'<span class="nv">Novo</span>':'')+'</h4><p>'+esc(x.it.d)+'</p>'+((x.it.d||'').length>190?'<button class="mais" data-m="'+k+'">Ler tudo</button>':'')+
      '<div class="nvb-ac"><button class="g" data-t="'+k+'">'+IC.play+'Ver como funciona</button>'+(x.ferr&&FERR[x.ferr]?'<button data-f="'+k+'">'+IC.open+'Abrir '+esc(FERR[x.ferr])+'</button>':'')+'</div></div></div>'; }).join(''); }).join('');
  var nN=L.filter(function(x){ return nv[x.k]; }).length, nome=p==='painel'?'na plataforma e no Painel':'em '+nomeAba(p);
  var bg=D.createElement('div'); bg.className='nvb-bg';
  bg.innerHTML='<div class="nvb-md" role="dialog" aria-modal="true" aria-labelledby="nvbT"><div class="nvb-hd"><div><div class="k">Novidades desta aba</div><h2 id="nvbT">O que mudou <em>'+esc(nome)+'</em></h2><p>'+L.length+(L.length===1?' novidade':' novidades')+' da versão '+L[L.length-1].v+' à '+L[0].v+(nN?' · '+nN+' que você ainda não tinha visto':'')+'</p></div><button class="nvb-x" aria-label="Fechar">'+IC.x+'</button></div>'+
    '<div class="nvb-bd">'+corpo+'</div><div class="nvb-ft"><small>“Ver como funciona” mostra a novidade direto na tela, sem alterar nada.</small><button type="button" class="ok">Entendi</button></div></div>';
  D.body.appendChild(bg);
  bg.addEventListener('click',function(e){ var b=e.target.closest&&e.target.closest('button'); if(e.target===bg||(b&&(b.classList.contains('nvb-x')||b.classList.contains('ok')))){ fechaSheet(); return; } if(!b) return;
    if(b.hasAttribute('data-m')){ var pp=b.previousElementSibling; if(pp){ pp.classList.toggle('all'); b.textContent=pp.classList.contains('all')?'Mostrar menos':'Ler tudo'; } return; }
    if(b.hasAttribute('data-t')){ verTutorial(idx[+b.getAttribute('data-t')]); return; }
    if(b.hasAttribute('data-f')){ abreFerr(idx[+b.getAttribute('data-f')].ferr); } });
  D.addEventListener('keydown',escK);
  marca(L.map(function(x){ return x.k; }));
}

/* ---------- pintar: faixa da aba, botão do topo, pontinhos do menu, selo nas ferramentas ---------- */
function faixa(){
  var v=$('#view'), p=cur(), old=$('#nvbStrip');
  if(!v||!p||p==='cliente'||p==='tutoriais'){ if(old) old.remove(); return; }
  var N=daAba(p).filter(novo);
  if(!N.length){ if(old) old.remove(); return; }
  if(old&&old.parentNode===v&&old.dataset.p===p&&+old.dataset.n===N.length) return;
  if(old) old.remove();
  var s=D.createElement('div'); s.className='nvb-strip'; s.id='nvbStrip'; s.dataset.p=p; s.dataset.n=N.length;
  var tit=N.slice(0,3).map(function(x){ return x.it.t; }).join(' · ')+(N.length>3?' · e mais '+(N.length-3):'');
  s.innerHTML='<span class="nvb-ic">'+IC.spark+'</span><div class="nvb-tx"><b>'+N.length+(N.length===1?' novidade':' novidades')+(p==='painel'?' na plataforma':' nesta aba')+'</b><span>'+esc(tit)+'</span></div><button type="button" class="nvb-go">Ver o que mudou</button><button type="button" class="nvb-x" title="Já vi" aria-label="Já vi">'+IC.x+'</button>';
  s.querySelector('.nvb-go').onclick=function(){ abreSheet(p); };
  s.querySelector('.nvb-x').onclick=function(){ marca(daAba(p).map(function(x){ return x.k; })); try{ W.toast('As novidades desta aba ficam no ✦ do topo','spark'); }catch(e){} };
  var hx=$('#view > .hx'); if(hx&&hx.nextSibling) v.insertBefore(s,hx.nextSibling); else if(hx) v.appendChild(s); else v.insertBefore(s,v.firstChild);
}
function botaoTopo(){
  var tb=$('.tbar'); if(!tb) return; var b=$('#nvbBtn'), p=cur(), L=(p&&p!=='cliente')?daAba(p):[];
  if(!L.length){ if(b) b.hidden=true; return; }
  if(!b){ b=D.createElement('button'); b.type='button'; b.id='nvbBtn'; b.className='ib'; b.title='Novidades desta aba'; b.setAttribute('aria-label','Novidades desta aba');
    b.onclick=function(){ abreSheet(cur()); }; var ref=$('#how',tb)||$('.b-help',tb)||$('#bell',tb); if(ref) tb.insertBefore(b,ref); else tb.appendChild(b); }
  b.hidden=false; var n=L.some(novo), h=IC.spark+(n?'<i class="nvb-dot"></i>':''); if(b.__h!==h){ b.__h=h; b.innerHTML=h; }
}
function pontos(){
  var porAba={}; lista().forEach(function(x){ if(novo(x)) porAba[x.aba]=1; });
  $$('#nav .ni[data-k], #mts button[data-k]').forEach(function(b){ var k=b.getAttribute('data-k'), d=b.querySelector('.nvb-dot'); if(porAba[k]&&k!==cur()){ if(!d){ d=D.createElement('i'); d.className='nvb-dot'; var lb=b.querySelector('.lb'); if(lb&&b.id!=='mts'&&b.closest('#nav')) lb.insertAdjacentElement('afterend',d); else b.appendChild(d); } } else if(d) d.remove(); });
  var mm=$('#mtab .mmais'); if(mm){ var noBar={}; $$('#mts button[data-k]').forEach(function(b){ noBar[b.getAttribute('data-k')]=1; }); var fora=Object.keys(porAba).some(function(k){ return !noBar[k]&&k!==cur(); }), d2=mm.querySelector('.nvb-dot');
    if(fora&&!d2){ d2=D.createElement('i'); d2.className='nvb-dot'; mm.appendChild(d2); } else if(!fora&&d2) d2.remove(); }
}
function selos(){
  if(cur()!=='ferramentas') return; var porF={}; daAba('ferramentas').forEach(function(x){ if(x.ferr&&novo(x)) porF[x.ferr]=1; });
  $$('#tg .tc[data-k]').forEach(function(c){ var k=c.getAttribute('data-k'), cv=c.querySelector('.cov')||c, s=cv.querySelector('.nvb-tc'); if(porF[k]){ if(!s){ s=D.createElement('span'); s.className='nvb-tc'; s.textContent='Novo'; cv.appendChild(s); } } else if(s) s.remove(); });
}
var pintando=false;
function pinta(){ if(pintando) return; pintando=true; try{ css(); faixa(); botaoTopo(); pontos(); selos(); }catch(e){ try{ console.warn('novabas',e); }catch(_){ } } pintando=false; }

/* ---------- textos do motor de tutoriais durante o tutorial curto ---------- */
function toastHook(){ if(typeof W.toast!=='function'||W.toast.__nvb) return; var _t=W.toast; var f=function(m,i){ if(MINI&&typeof m==='string'){ m=m.replace(' (rever em Tutoriais)',' (rever no ✦ desta aba)').replace(' — continue quando quiser em Tutoriais',''); } return _t.call(this,m,i); }; f.__nvb=1; W.toast=f; }

/* ---------- ligação com o visual novo ---------- */
function hook(){
  if(typeof W.go!=='function'||!$('#view')||!versoes().length) return setTimeout(hook,150);
  if(W.go.__nvb) return;
  css(); toastHook();
  var _go=W.go; var g=function(){ var r=_go.apply(this,arguments); setTimeout(pinta,280); setTimeout(pinta,900); return r; }; g.__nvb=1; for(var k in _go) try{ g[k]=_go[k]; }catch(e){} W.go=g;
  /* a tela redesenha sozinha quando chegam dados: confere de tempos em tempos (tudo aqui só mexe no que mudou) */
  setInterval(function(){ if(!D.hidden) pinta(); },1500);
  pinta(); setTimeout(pinta,1200);
}
W.AgionNovAbas={achar:function(k){ var x=lista().filter(function(y){ return y.k===k; })[0]; if(!x||!x.onde) return null; return !!loc(x.onde)(); },abrir:abreSheet,lista:lista,daAba:daAba,tutorial:function(k){ var x=lista().filter(function(y){ return y.k===k||y.it.t===k; })[0]; if(x) verTutorial(x); },pinta:pinta,
  zerar:function(){ ST.d={vistos:{}}; ST.key=skey(); grava(); push(); pinta(); }};
if(D.readyState==='loading') D.addEventListener('DOMContentLoaded',hook); else hook();
})();
