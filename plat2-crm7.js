/* ==========================================================================
   Agion — plat2-crm7.js · Pop-ups das 7 etapas do CRM (21/out/2026)
   CRM7_POPUPS_20261021 — especificação do Chat A (PARA-O-CHAT-B-POPUPS-DO-CRM-7-ETAPAS.md),
   aprovada pelo Gabriel em 20/10; "Pular por agora" e pular etapas pedidos em 21/10.
   - O pop-up abre quando o card ENTRA na etapa (arrastar, régua do card, setas, barra "Mover para").
   - Todo pop-up tem "Pular por agora"; Cancelar devolve o card para onde estava (nada é gravado).
   - Pular etapas: abre só o pop-up da etapa de destino.
   - Grava junto: etapa_crm, etapa_crm_em e o stage antigo (Fechado = 4 só no Ganho; Perdido não mexe no stage).
   Camada aditiva: a v4 chama CRM7.mover(d,k) no lugar do mover antigo (AG7.moverBase continua lá).
   ========================================================================== */
(function(){
'use strict';
var W=window;
var ETK={'0':'novo','1':'contato','2':'estudo','agd':'reuniao','dia':'diagnostico','3':'proposta','4':'fechado'};
var STK={'0':0,'1':1,'2':2,'agd':2,'dia':2,'3':3};
var NOME={'0':'Novo lead','1':'Contato feito','2':'Estudo/Simulação','agd':'Reunião agendada','dia':'Diagnóstico','3':'Proposta enviada','4':'Fechado'};
var CURTO={'0':'Novo','1':'Contato','2':'Estudo','agd':'Reunião','dia':'Diagnóstico','3':'Proposta','4':'Fechado'};
var ORDEM=['0','1','2','agd','dia','3','4'];
var MOTIVOS=[['Desqualificação',['Contato errado/inexistente','Lead duplicado']],['Comunicação',['Não consegui contato com o lead','Parou de responder']],
 ['Financeiro (Budget)',['Incapacidade de pagar a parcela','Pressa e sem lance correspondente']],['Concorrência / Outra solução',['Fechou com concorrente','Quer empréstimo/financiamento','Escolheu outra solução']],
 ['Momento',['Projeto adiado','Prazo inviável (tempo)','Mudança de planos ou prioridades']],['Produto',['Expectativas de produto/serviço não atendidas','Perda de interesse no consórcio']],
 ['Operacional',['Demora no follow-up','Problemas na documentação exigida']]];
var SEM={a:'Com a resumida anexada, a Alice cita o crédito, a parcela e o prazo da simulação, manda a proposta para o cliente rever quando ele some e puxa para a reunião com base no que ele viu. Sem ela, os follow-ups ficam genéricos e o cliente tem menos motivo para responder.',
 b:'Ela não vai para o cliente agora. Com ela, a Alice sabe o que foi montado (quantas cartas, valores, estratégia) e, depois do envio, os e-mails de acompanhamento falam exatamente da estrutura que você apresentou.',
 c:'Enviando pela plataforma, o e-mail sai do seu endereço com o que você escolher, fica registrado no card e a Alice acompanha a decisão citando a proposta. Sem envio registrado, a Alice não sabe o que o cliente tem em mãos.'};

function $(s,r){return (r||document).querySelector(s);} function $$(s,r){return [].slice.call((r||document).querySelectorAll(s));}
function e4(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function ic(n,s){try{return W.I(n,s||15);}catch(e){return '';}}
function nm(d){return String(d&&d.nome||'').trim().split(/\s+/)[0]||'o cliente';}
function xl(d){return (W.XL&&W.XL[d.uid])||{};}
function eu(){try{return W.fn(W.realId());}catch(e){return '';}}
function agora(){var t=new Date();return t.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})+' '+t.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});}
function dtBR(iso){try{return W.AG7.dtBR(iso);}catch(e){return '';}}
function hojeISO(){var h=new Date();return h.getFullYear()+'-'+String(h.getMonth()+1).padStart(2,'0')+'-'+String(h.getDate()).padStart(2,'0');}
function sb(){try{return W.psb();}catch(e){return null;}}
function toast(t,i){try{W.toast(t,i);}catch(e){}}
function redesenha(d){try{if(W.cur==='crm'){W.renderBoard(true);W.updKpis();W.AG7.anima(d);}else W.refreshCard(d);}catch(e){}}
function volta(){try{if(W.cur==='crm')W.renderBoard(true);}catch(e){}}

/* ---------- gravar ---------- */
function aplica(ctx,campos,atvs,op){op=op||{};var d=ctx.d,k=op.k||ctx.k,r=d.raw,c=Object.assign({},campos||{});
 if(!ctx.fill){c.etapa_crm=ETK[k];c.etapa_crm_em=new Date().toISOString();
  var st=(k==='4')?d.st:STK[k];if(st!=null&&st!==d.st){r.stage=st;c.stage=st;}if(r.perdido){r.perdido=false;c.perdido=false;}
  var txt=null;if(ctx.pulou&&ctx.pulou.length&&!op.k)txt='Avançou de '+NOME[ctx.from]+' para '+NOME[k]+' (pulou '+lista(ctx.pulou)+')';else txt='Movido para "'+NOME[k]+'"';
  W.leadAtv(d,txt);}
 (atvs||[]).forEach(function(t){if(t)W.leadAtv(d,t);});
 c.atividades=r.atividades||[];
 W.XL[d.uid]=Object.assign(W.XL[d.uid]||{},c);  /* já no quadro, antes da resposta do banco */
 try{W.leadSalva(d,ctx.fill?null:['lead_mover','Moveu o lead "'+r.nome+'" para "'+NOME[k]+'"',{lead:r.nome,etapa:NOME[k]}]);}catch(e){}
 var p=W.leadExtra(d,c);redesenha(d);
 Promise.resolve(p).then(function(ok){if(ok===false)toast('Não consegui salvar agora — tente de novo','x');else if(!ctx.fill&&!op.quieto)toast(d.nome+' → '+NOME[k]);if(ctx.fill)redesenha(d);});
 return p;}
function lista(a){return a.length<2?a.join(''):a.slice(0,-1).join(', ')+' e '+a[a.length-1];}
function pula(ctx){aplica(ctx,{},['Pulou o pop-up de '+NOME[ctx.k]]);W.closeSheet();}

/* ---------- moldura dos pop-ups ---------- */
function folha(ctx,tit,sub,corpo,semPular){var s=W.sheet('<div class="lbl c7lb">'+(ctx.fill?'Card':'CRM')+' · '+NOME[ctx.k]+'</div><h2 class="c7h">'+tit+'</h2>'+(sub?'<p class="c7s">'+sub+'</p>':'')+corpo+
  '<div class="c7f"><button class="btn ol" data-c7="x">Cancelar</button><span class="sp"></span>'+((ctx.fill||semPular)?'':'<button class="btn c7pl" data-c7="pular">Pular por agora</button>')+'</div>',520);
 s.classList.add('c7');var feito=false;ctx._s=s;
 var cancela=function(){if(feito)return;feito=true;W.closeSheet();if(!ctx.fill)volta();};
 $('[data-c7="x"]',s).onclick=cancela;var xb=$('.x',s);if(xb)xb.onclick=cancela;
 var ov=$('#ov');if(ov)ov._close=cancela;
 var pb=$('[data-c7="pular"]',s);if(pb)pb.onclick=function(){feito=true;pula(ctx);};
 ctx.fecha=function(){feito=true;W.closeSheet();};
 return s;}
function opc(id,emo,t,dsc,dis){return '<button class="c7b'+(dis?' dis':'')+'" data-o="'+id+'"'+(dis?' disabled':'')+'><span class="c7e">'+emo+'</span><span class="c7t"><b>'+t+'</b>'+(dsc?'<small>'+dsc+'</small>':'')+'</span></button>';}

/* ---------- 2 · Contato feito ---------- */
function popContato(ctx){var d=ctx.d;
 var s=folha(ctx,'Você já chamou '+e4(nm(d))+'. Teve resposta?','A Alice coletou os dados e passou para você. Depois de chamar no seu WhatsApp, marque aqui o que aconteceu.',
  '<div class="c7o">'+opc('sim','✅','Respondeu','Quem conduz agora é você. A Alice para o WhatsApp com essa pessoa.')+opc('nao','🤖','Não respondeu','A Alice volta a chamar na hora, pelo número da Agion.')+opc('ver','⏳','Ainda vou ver','Em 4 h úteis você recebe um lembrete para marcar.')+'</div>');
 $$('.c7b',s).forEach(function(b){b.onclick=function(){var o=b.dataset.o,now=new Date().toISOString();ctx.fecha();
  if(o==='sim')aplica(ctx,{contato_respondeu:true,contato_resp_em:now},['Contato feito: Respondeu · '+eu()+' · '+agora()]);
  else if(o==='nao')aplica(ctx,{contato_respondeu:false,contato_resp_em:now},['Contato feito: Não respondeu · '+eu()+' · '+agora()]);
  else aplica(ctx,{},['Contato feito: ainda vai ver se respondeu · '+eu()]);};});}

/* ---------- documentos (resumida / completa) ---------- */
function dirDe(d){return (d.resp||W.realId()||'sem-dono')+'/'+d.uid;}
async function salvaDoc(d,row){var c=sb();if(!c)throw new Error('sem conexão');row.lead_id=d.uid;var r=await c.from('lead_documentos').insert(row);if(r&&r.error)throw r.error;return true;}
async function sobeArquivo(d,f,tipo){var c=sb();if(!c||!c.storage)throw new Error('sem conexão com o armazenamento');
 var ext=(f.name.match(/\.([a-z0-9]{2,5})$/i)||[0,'pdf'])[1].toLowerCase(),path=dirDe(d)+'/'+Date.now()+'-'+(tipo==='completa'?'completo':'resumido')+'.'+ext;
 var up=await c.storage.from('propostas').upload(path,f,{contentType:f.type||'application/octet-stream',upsert:false});if(up&&up.error)throw up.error;
 await salvaDoc(d,{tipo:tipo,titulo:f.name,arquivo_path:path});return path;}
async function jaEnviadas(d){var out=[],c=sb();if(!c)return out;
 try{var r=await c.from('lead_documentos').select('id,tipo,titulo,arquivo_path,url,texto,criado_em').eq('lead_id',d.uid).order('criado_em',{ascending:false}).limit(30);(r.data||[]).forEach(function(x){out.push({fonte:'doc',x:x,t:(x.titulo||({resumida:'Proposta resumida',completa:'Proposta completa',material:'Material'}[x.tipo]||'Documento')),q:x.criado_em});});}catch(e){}
 try{if(c.storage){var l=await c.storage.from('propostas').list(dirDe(d),{limit:100,sortBy:{column:'name',order:'desc'}});(l.data||[]).filter(function(f){return /\.pdf$/i.test(f.name);}).forEach(function(f){var p=dirDe(d)+'/'+f.name;if(out.some(function(o){return o.x&&o.x.arquivo_path===p;}))return;var ts=+(f.name.split('-')[0]);out.push({fonte:'arq',path:p,t:/completo/.test(f.name)?'Proposta completa (gerador)':/resumido/.test(f.name)?'Proposta resumida (gerador)':'Proposta (gerador)',q:ts?new Date(ts).toISOString():null});});}}catch(e){}
 return out;}
function popDoc(ctx,tipo,tit,semKey,extra){var d=ctx.d,inicio=Date.now();
 var s=folha(ctx,tit,tipo==='completa'?'Ela não vai para o cliente: serve para a Alice saber o que foi montado.':'É o documento que mais ajuda a Alice a puxar para a reunião.',
  (extra||'')+'<div class="c7o">'+opc('arq','📎','Importar do computador','PDF ou imagem')+opc('txt','📝','Colar o texto','Cole a proposta como texto')+opc('ger','✨','Gerar no Gerador de propostas',d.resp?'Abre o gerador já com este lead':'Designe o lead antes de gerar',!d.resp)+opc('lst','🗂️','Escolher uma já enviada','Propostas que este lead já tem')+'</div>'+
  '<div class="c7x" id="c7x"></div><input type="file" id="c7f" accept="application/pdf,image/*" hidden><button class="c7sem" data-c7="sem">Prosseguir sem a '+(tipo==='completa'?'completa':'resumida')+'</button>',true);   /* SEM_DUPLO_20261022: o "Prosseguir sem…" já faz o papel do "Pular por agora" */
 var x=$('#c7x',s),fin=function(atv){ctx.fecha();aplica(ctx,ctx.campos||{},(ctx.atvs||[]).concat([atv]));};
 $('[data-o="arq"]',s).onclick=function(){$('#c7f',s).click();};
 $('#c7f',s).onchange=async function(){var f=this.files&&this.files[0];if(!f)return;x.innerHTML='<div class="c7w">Enviando '+e4(f.name)+'…</div>';
  try{await sobeArquivo(d,f,tipo);fin('Anexou a proposta '+(tipo==='completa'?'completa':'resumida')+': '+f.name);}catch(e){x.innerHTML='<div class="c7w er">Não consegui enviar: '+e4(e.message||e)+'</div>';}};
 $('[data-o="txt"]',s).onclick=function(){x.innerHTML='<div class="fi"><label>Texto da proposta</label><textarea id="c7t" rows="6" placeholder="Cole aqui: crédito, parcela, prazo, lance…"></textarea></div><div style="display:flex;justify-content:flex-end"><button class="btn gd" id="c7ts">'+ic('ok')+'Salvar a proposta</button></div>';
  var t=$('#c7t',s);t.focus();$('#c7ts',s).onclick=async function(){var v=t.value.trim();if(!v){toast('Cole o texto da proposta','x');return;}this.disabled=true;
   try{await salvaDoc(d,{tipo:tipo,titulo:'Proposta '+(tipo==='completa'?'completa':'resumida')+' (texto colado)',texto:v});fin('Colou a proposta '+(tipo==='completa'?'completa':'resumida'));}catch(e){this.disabled=false;toast('Não salvou: '+(e.message||e),'x');}};};
 $('[data-o="ger"]',s).onclick=function(){if(!d.resp)return;ctx.fecha();aplica(ctx,ctx.campos||{},(ctx.atvs||[]).concat(['Abriu o Gerador de propostas para a '+(tipo==='completa'?'completa':'resumida')]),{quieto:true});
  setTimeout(function(){try{W.pcall('abrirProposta',d.uid,'lead');}catch(e){}vigiaGerador(d,tipo,inicio);},350);};
 $('[data-o="lst"]',s).onclick=async function(){x.innerHTML='<div class="c7w">Procurando…</div>';var L=await jaEnviadas(d);
  if(!L.length){x.innerHTML='<div class="c7w">Este lead ainda não tem proposta salva. Use “Importar”, “Colar” ou “Gerar”.</div>';return;}
  x.innerHTML='<div class="c7l">'+L.map(function(o,i){return '<button data-i="'+i+'">'+ic('doc',14)+'<span>'+e4(o.t)+'</span><small>'+(o.q?new Date(o.q).toLocaleDateString('pt-BR'):'')+'</small></button>';}).join('')+'</div>';
  $$('.c7l button',s).forEach(function(b){b.onclick=async function(){var o=L[+b.dataset.i];b.disabled=true;
   try{if(o.fonte==='arq')await salvaDoc(d,{tipo:tipo,titulo:o.t,arquivo_path:o.path});else if(o.x.tipo!==tipo)await salvaDoc(d,{tipo:tipo,titulo:o.x.titulo||o.t,arquivo_path:o.x.arquivo_path||null,url:o.x.url||null,texto:o.x.texto||null});
    fin('Escolheu a proposta '+(tipo==='completa'?'completa':'resumida')+': '+o.t);}catch(e){b.disabled=false;toast('Não salvou: '+(e.message||e),'x');}};});};
 $('[data-c7="sem"]',s).onclick=function(){semDoc(ctx,semKey,function(){popDoc(ctx,tipo,tit,semKey,extra);},function(){fin('Seguiu sem a proposta '+(tipo==='completa'?'completa':'resumida'));});};
 return s;}
function semDoc(ctx,key,anexar,seguir){var tt={a:'Seguir sem a resumida?',b:'Seguir sem a completa?',c:'Seguir sem registrar o envio?'}[key];
 var s=W.sheet('<div class="lbl c7lb">'+NOME[ctx.k]+'</div><h2 class="c7h">'+tt+'</h2><p class="c7s" style="font-size:14px;line-height:1.55">'+SEM[key]+'</p><div class="c7f"><button class="btn gd" data-c7="an">'+ic('doc')+'Anexar agora</button><span class="sp"></span><button class="btn ol" data-c7="sg">Seguir mesmo assim</button></div>',480);
 s.classList.add('c7');var ok=false;$('[data-c7="an"]',s).onclick=function(){ok=true;W.closeSheet();setTimeout(anexar,300);};$('[data-c7="sg"]',s).onclick=function(){ok=true;seguir();};
 var xb=$('.x',s);if(xb)xb.onclick=function(){if(ok)return;ok=true;W.closeSheet();if(!ctx.fill)volta();};var ov=$('#ov');if(ov)ov._close=xb?xb.onclick:null;}
/* depois que o Gerador fecha, a proposta nova entra no card */
function vigiaGerador(d,tipo,inicio){var tent=0,t=setInterval(async function(){tent++;var m=null;try{m=W.parent.document.getElementById('propostaModal');}catch(e){}
 if(tent>900){clearInterval(t);return;}if(!m||!m.classList.contains('hidden'))return;clearInterval(t);
 try{var c=sb();if(!c||!c.storage)return;var l=await c.storage.from('propostas').list(dirDe(d),{limit:50,sortBy:{column:'name',order:'desc'}});
  var novos=(l.data||[]).filter(function(f){return /\.pdf$/i.test(f.name)&&+(f.name.split('-')[0])>=inicio;});
  if(!novos.length)return;var f=novos[0],p=dirDe(d)+'/'+f.name;await salvaDoc(d,{tipo:tipo,titulo:/completo/.test(f.name)?'Proposta completa (gerador)':'Proposta resumida (gerador)',arquivo_path:p});
  W.leadAtv(d,'Proposta '+(tipo==='completa'?'completa':'resumida')+' gerada no Gerador e ligada ao card');W.leadExtra(d,{atividades:d.raw.atividades});toast('A proposta do gerador entrou no card de '+nm(d),'doc');}catch(e){}},1000);}

/* ---------- 3 · Estudo/Simulação ---------- */
function popEstudo(ctx){popDoc(ctx,'resumida','Anexe a proposta resumida de '+e4(nm(ctx.d)),'a');}

/* ---------- 4 · Reunião agendada ---------- */
function popReuniao(ctx){var d=ctx.d,x=xl(d),pad=function(n){return String(n).padStart(2,'0');};
 var t=x.reuniao_em?new Date(x.reuniao_em):(function(){var a=new Date();a.setDate(a.getDate()+1);a.setHours(10,0,0,0);return a;})();
 var v=t.getFullYear()+'-'+pad(t.getMonth()+1)+'-'+pad(t.getDate())+'T'+pad(t.getHours())+':'+pad(t.getMinutes());
 var r2=x.reuniao_tipo==='R2'||ctx.from==='dia'||x.compareceu===true;
 var s=folha(ctx,'Quando é a reunião com '+e4(nm(d))+'?','A reunião entra na agenda e a Alice manda a confirmação e os lembretes (3 h, 15 min e na hora).',
  '<div class="fi"><label>Data e hora</label><input type="datetime-local" id="c7d" value="'+v+'"></div><div class="fi"><label>Link da reunião (opcional)</label><input id="c7k" placeholder="Meet ou Zoom" value="'+e4(x.link_meet||'')+'"></div>'+
  '<div class="lbl" style="margin:4px 0 8px">Tipo</div><div class="opts" id="c7r"><button class="opt'+(r2?'':' on')+'" data-v="R1">1ª reunião</button><button class="opt'+(r2?' on':'')+'" data-v="R2">2ª reunião</button></div>'+
  '<div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="btn gd" id="c7ok">'+ic('cal')+'Marcar reunião</button></div>');
 var tp=r2?'R2':'R1';$$('#c7r .opt',s).forEach(function(o){o.onclick=function(){tp=o.dataset.v;$$('#c7r .opt',s).forEach(function(q){q.classList.toggle('on',q===o);});};});
 $('#c7ok',s).onclick=function(){var val=$('#c7d',s).value;if(!val){toast('Escolha a data e a hora','cal');return;}var dt=new Date(val);if(isNaN(+dt)){toast('Data inválida','x');return;}
  var iso=dt.toISOString(),lk=$('#c7k',s).value.trim();ctx.fecha();
  aplica(ctx,{reuniao_em:iso,link_meet:lk||null,reuniao_tipo:tp,compareceu:null},['Reunião marcada para '+dtBR(iso)+' ('+(tp==='R2'?'2ª reunião':'1ª reunião')+')']);};}

/* ---------- 5 · Diagnóstico ---------- */
function popDiag(ctx){var d=ctx.d;
 var s=folha(ctx,e4(nm(d))+' compareceu à reunião?','',
  '<div class="c7o">'+opc('sim','✅','Compareceu','Depois, anexe a proposta completa.')+opc('nao','📅','Faltou','O card volta para Reunião agendada e a Alice entra no fluxo de remarcação.')+'</div>');
 $('[data-o="sim"]',s).onclick=function(){var x=xl(d),c={compareceu:true};if(!x.reuniao_em)c.reuniao_em=new Date().toISOString();ctx.campos=c;ctx.atvs=['Compareceu à reunião (diagnóstico)'];
  ctx.fecha();setTimeout(function(){popDoc(ctx,'completa','Anexe a proposta completa de '+e4(nm(d)),'b');},320);};
 $('[data-o="nao"]',s).onclick=function(){ctx.fecha();aplica(ctx,{compareceu:false},['Faltou à reunião'],{k:'agd'});
  setTimeout(function(){var s2=W.sheet('<div class="lbl c7lb">Reunião agendada</div><h2 class="c7h">Marcado: '+e4(nm(d))+' faltou</h2><p class="c7s">A Alice entra no fluxo de remarcação. Se já combinaram outra data, marque agora.</p><div class="c7f"><button class="btn ol" data-c7="ok">Ok</button><span class="sp"></span><button class="btn gd" data-c7="nv">'+ic('cal')+'Marcar nova data</button></div>',440);
   s2.classList.add('c7');$('[data-c7="ok"]',s2).onclick=function(){W.closeSheet();};$('[data-c7="nv"]',s2).onclick=function(){W.closeSheet();setTimeout(function(){popReuniao({d:d,k:'agd',from:'agd',fill:true});},300);};},450);};}

/* ---------- 6 · Proposta enviada ---------- */
function popProposta(ctx){var d=ctx.d,x=xl(d);
 var s=folha(ctx,'Como a proposta chegou a '+e4(nm(d))+'?','Assim a Alice sabe o que a pessoa tem em mãos para acompanhar a decisão.',
  '<div class="c7o">'+opc('plat','📤','Enviar pela plataforma','Disponível quando o e-mail de cada especialista for conectado',true)+opc('fora','💬','Já enviei por fora','WhatsApp ou e-mail próprio')+'</div>'+
  '<div class="fi" style="margin-top:12px"><label>Quando deve decidir? (opcional)</label><input type="date" id="c7dd" value="'+e4((x.data_decisao||'').slice(0,10))+'"></div>'+
  '<button class="c7sem" data-c7="sem">Prosseguir sem registrar</button>',true);   /* SEM_DUPLO_20261022 */
 var dd=function(){var v=$('#c7dd',s).value;return v?{data_decisao:v}:{};};
 $('[data-o="fora"]',s).onclick=async function(){var b=this;b.disabled=true;try{await salvaDoc(d,{tipo:'material',titulo:'Proposta enviada por fora',enviado_em:new Date().toISOString(),enviado_por:W.realId()});}catch(e){}
  ctx.fecha();var c=dd();aplica(ctx,c,['Proposta enviada por fora (WhatsApp ou e-mail próprio)'+(c.data_decisao?' · decide até '+c.data_decisao.split('-').reverse().join('/'):'')]);};
 $('[data-c7="sem"]',s).onclick=function(){var c=dd();semDoc(ctx,'c',function(){popProposta(ctx);},function(){ctx.fecha();aplica(ctx,c,['Seguiu sem registrar o envio da proposta']);});};}

/* ---------- 7 · Fechado ---------- */
function motivoSel(id){return '<div class="fi"><label>Motivo</label><select id="'+id+'"><option value="">Escolha o motivo…</option>'+MOTIVOS.map(function(g){return '<optgroup label="'+e4(g[0])+'">'+g[1].map(function(m){return '<option>'+e4(m)+'</option>';}).join('')+'</optgroup>';}).join('')+'</select></div>';}
function marcaPerdido(d,mo,ob,el){var n=el&&el.isConnected?el:null;if(n&&n.classList.contains('deal')){n.style.maxHeight=n.offsetHeight+'px';n.getBoundingClientRect();n.classList.add('gone');}
 W.leadAtv(d,'Perdido · '+(mo||'sem motivo')+(ob?' — '+ob:''));try{W.pcall('crmLose',d.uid);}catch(e){}
 var c={perdido:true,data_perda:hojeISO(),atividades:d.raw.atividades};if(mo)c.motivo_nao_conversao=mo+(ob?' — '+ob:'');
 W.leadExtra(d,c);try{W.leadRefaz(d);}catch(e){}
 setTimeout(function(){try{if(W.cur==='crm'){W.renderBoard(true);W.updKpis();W.renderFiltros();}}catch(e){}toast(d.nome+' foi para Perdidos','xc');},n?560:0);}
function popFechado(ctx){var d=ctx.d;
 var s=folha(ctx,'Como terminou com '+e4(nm(d))+'?','',
  '<div class="c7o">'+opc('g','🏆','Ganho','Vira cliente. A Alice para tudo.')+opc('p','✕','Perdido','A Alice faz a recuperação de 3, 6 e 9 meses.')+'</div><div id="c7pp"></div>');
 $('[data-o="g"]',s).onclick=function(){ctx.fecha();try{W.ganhoFlow(d,$('#kb .deal[data-id="'+d.id+'"]'));}catch(e){}};
 $('[data-o="p"]',s).onclick=function(){var b=$('#c7pp',s);b.innerHTML=motivoSel('c7mo')+'<div class="fi"><label>Observação (opcional)</label><textarea rows="2" id="c7ob" placeholder="Ex.: pediu para retomar em março"></textarea></div><div style="display:flex;justify-content:flex-end;gap:10px"><button class="btn ol" id="c7ps">Marcar sem motivo</button><button class="btn rd" id="c7pk">'+ic('xc')+'Marcar perdido</button></div>';
  $('#c7pk',s).onclick=function(){var mo=$('#c7mo',s).value;if(!mo){toast('Escolha o motivo ou use “Marcar sem motivo”','x');return;}ctx.fecha();marcaPerdido(d,mo,$('#c7ob',s).value.trim(),$('#kb .deal[data-id="'+d.id+'"]'));};
  $('#c7ps',s).onclick=function(){ctx.fecha();marcaPerdido(d,'',$('#c7ob',s).value.trim(),$('#kb .deal[data-id="'+d.id+'"]'));};b.scrollIntoView({behavior:'smooth',block:'nearest'});};}
/* "Perdeu" do card: mesmo motivo agrupado, com "Pular por agora" */
function perdidoFlow7(d,el){if(!W.roOk())return;var s=W.sheet('<div class="lbl c7lb">CRM</div><h2 class="c7h">Marcar '+e4(nm(d))+' como perdido</h2><p class="c7s">'+e4(d.nome)+' · '+W.brl(d.valor)+'. O lead fica em “Perdidos” e a Alice faz a recuperação de 3, 6 e 9 meses.</p>'+motivoSel('c7mo')+
  '<div class="fi"><label>Observação (opcional)</label><textarea rows="2" id="c7ob" placeholder="Ex.: pediu para retomar em março"></textarea></div><div class="c7f"><button class="btn ol" data-c7="x">Cancelar</button><span class="sp"></span><button class="btn c7pl" data-c7="pular">Pular por agora</button><button class="btn rd" data-c7="ok">'+ic('xc')+'Marcar perdido</button></div>',540);
 s.classList.add('c7');$('[data-c7="x"]',s).onclick=function(){W.closeSheet();};
 $('[data-c7="pular"]',s).onclick=function(){W.closeSheet();marcaPerdido(d,'',$('#c7ob',s).value.trim(),el);};
 $('[data-c7="ok"]',s).onclick=function(){var mo=$('#c7mo',s).value;if(!mo){toast('Escolha o motivo ou use “Pular por agora”','x');return;}W.closeSheet();marcaPerdido(d,mo,$('#c7ob',s).value.trim(),el);};}

/* ---------- mover ---------- */
function puladas(from,k){var a=ORDEM.indexOf(from),b=ORDEM.indexOf(k);if(a<0||b<0||b-a<2)return [];return ORDEM.slice(a+1,b).map(function(x){return CURTO[x];});}
function mover(d,k){var A=W.AG7;if(!d||!A)return A&&A.moverBase(d,k);var from=A.colDe(d);
 if(k===from){volta();return;}if(!W.roOk()){volta();return;}
 var x=xl(d),ctx={d:d,k:k,from:from,pulou:puladas(from,k)};
 /* voltar para antes da reunião desmarca a reunião (como antes) */
 if(['0','1','2'].indexOf(k)>=0&&(from==='agd'||from==='dia'||x.reuniao_em||x.compareceu!=null)&&(x.reuniao_em||x.compareceu!=null)){
  W.confirma('Tirar de “'+NOME[from]+'”?',e4(d.nome)+(x.reuniao_em?' tem reunião em '+dtBR(x.reuniao_em)+'.':'.')+' Ao voltar para “'+NOME[k]+'” a reunião é desmarcada na plataforma.','Desmarcar e mover').then(function(ok){
   if(!ok){volta();return;}ctx.atvs0=['Reunião desmarcada'];ctx.limpa={reuniao_em:null,compareceu:null};abre(ctx);});return;}
 abre(ctx);}
function abre(ctx){var k=ctx.k;
 if(k==='0'){aplica(ctx,{},[]);return;}
 if(k==='1')return popContato(ctx);
 if(k==='2')return popEstudo(ctx);
 if(k==='agd')return popReuniao(ctx);
 if(k==='dia')return popDiag(ctx);
 if(k==='3')return popProposta(ctx);
 if(k==='4')return popFechado(ctx);
 return W.AG7.moverBase(ctx.d,k);}
/* "desmarcar reunião" (voltar para antes da reunião) entra junto com o que o pop-up gravar, uma vez só */
var _aplica=aplica;aplica=function(ctx,campos,atvs,op){if(ctx.limpa&&!ctx.__lp){ctx.__lp=1;campos=Object.assign({},ctx.limpa,campos||{});atvs=(ctx.atvs0||[]).concat(atvs||[]);}return _aplica(ctx,campos,atvs,op);};

/* CONTATO_AUTO_20261023: prazos do "Aguardando resposta" (mesma conta do robô: horas úteis, 9h–19h, seg a sex, Brasília) */
function somaUteis(ms,h){var t=new Date(ms-3*36e5),rest=h*36e5,g=0;while(rest>0&&g++<400){var d=t.getUTCDay(),hr=t.getUTCHours()+t.getUTCMinutes()/60;
 if(d===0||d===6||hr>=19){t=new Date(Date.UTC(t.getUTCFullYear(),t.getUTCMonth(),t.getUTCDate()+1,9,0,0));continue;}
 if(hr<9)t=new Date(Date.UTC(t.getUTCFullYear(),t.getUTCMonth(),t.getUTCDate(),9,0,0));
 var fim=Date.UTC(t.getUTCFullYear(),t.getUTCMonth(),t.getUTCDate(),19,0,0),dd=Math.min(rest,fim-t.getTime());t=new Date(t.getTime()+dd);rest-=dd;}return t;}
function hmBR(t,dia){var z=function(n){return (n<10?'0':'')+n;},hoje=new Date(Date.now()-3*36e5),mesmo=t.getUTCDate()===hoje.getUTCDate()&&t.getUTCMonth()===hoje.getUTCMonth();return (mesmo&&!dia?'hoje ':z(t.getUTCDate())+'/'+z(t.getUTCMonth()+1)+' ')+'às '+t.getUTCHours()+'h'+z(t.getUTCMinutes());}
function prazoContato(x){if(!x||x.contato_respondeu!=null)return null;var t0=Date.parse(x.etapa_crm_em||'');if(!t0||Date.now()-t0>5*864e5||Date.now()<t0)return null;
 var l=somaUteis(t0,4),a=somaUteis(t0,8),n=Date.now()-3*36e5;return {lemb:l,auto:a,passouL:n>=l.getTime(),passouA:n>=a.getTime()};}
function prazoTxt(p){if(!p)return '';if(p.passouA)return 'a Alice está voltando a chamar';return (p.passouL?'lembrete enviado · ':'lembrete '+hmBR(p.lemb)+' · ')+'sem marcação, a Alice volta a chamar '+hmBR(p.auto);}

/* ---------- chips no card ---------- */
function chips(d){var x=xl(d),k,o=[];try{k=W.AG7.colDe(d);}catch(e){return '';}
 if(d.perdido){if(!x.motivo_nao_conversao)o.push(['f','falta: motivo']);}
 else if(k==='1'){if(x.contato_respondeu===true)o.push(['ok','✅ Respondeu']);else if(x.contato_respondeu===false)o.push(['pt','🤖 Não respondeu: Alice chamando']);else{var pz=prazoContato(x);o.push(['am','⏳ Aguardando resposta'+(pz&&!pz.passouA?' · Alice '+hmBR(pz.auto).replace(/^hoje /,''):'')]);}}
 else if(k==='agd'){if(x.compareceu===false)o.push(['rd','Faltou']);if(!x.reuniao_em)o.push(['f','falta: data da reunião']);}
 else if(k==='dia'){if(x.compareceu==null)o.push(['f','falta: compareceu']);}
 else if(k==='4'&&d.st!==4)o.push(['f','falta: ganho ou perdido']);
 return o.length?'<div class="c7ch">'+o.map(function(c){return '<span class="c7c '+c[0]+'">'+e4(c[1])+'</span>';}).join('')+'</div>':'';}

/* ---------- painel no card aberto ---------- */
function painel(d){var x=xl(d),k=W.AG7.colDe(d),bt=[],tx='',sub='';
 if(d.perdido){tx='Perdido'+(x.motivo_nao_conversao?' · '+x.motivo_nao_conversao:'');if(!x.motivo_nao_conversao)bt.push(['mot','Informar motivo']);}
 else if(k==='1'){tx=x.contato_respondeu===true?'✅ Respondeu':x.contato_respondeu===false?'🤖 Não respondeu: Alice chamando':'⏳ Aguardando resposta';
  if(x.contato_respondeu==null)sub=prazoTxt(prazoContato(x));if(x.contato_respondeu===true)bt.push(['parou','Cliente parou de responder']);else{bt.push(['sim','Respondeu']);bt.push(['nao','Não respondeu']);}}
 else if(k==='2'){tx='Estudo/Simulação';bt.push(['res','Anexar proposta resumida']);}
 else if(k==='agd'){tx=x.reuniao_em?'📅 '+dtBR(x.reuniao_em)+(x.reuniao_tipo==='R2'?' · 2ª reunião':''):'falta: data da reunião';if(x.compareceu===false)tx='Faltou · '+tx;bt.push(['reu',x.reuniao_em?'Mudar data':'Informar data da reunião']);}
 else if(k==='dia'){tx=x.compareceu==null?'falta: compareceu':'✅ Compareceu';if(x.compareceu==null)bt.push(['comp','Compareceu?']);bt.push(['cpl','Anexar proposta completa']);}
 else if(k==='3'){tx='Proposta enviada'+(x.data_decisao?' · decide até '+String(x.data_decisao).slice(0,10).split('-').reverse().join('/'):'');bt.push(['env','Registrar envio / data de decisão']);}
 else if(k==='4'&&d.st!==4){tx='falta: ganho ou perdido';bt.push(['fch','Marcar ganho ou perdido']);}
 else return '';
 return '<div class="c7p"><span class="c7pt"><small>'+e4(NOME[k]||'Etapa')+'</small><b>'+e4(tx)+'</b>'+(sub?'<small style="margin-top:2px">'+e4(sub)+'</small>':'')+'</span><span class="sp"></span>'+bt.map(function(b){return '<button class="ob c7pb" data-c7p="'+b[0]+'">'+e4(b[1])+'</button>';}).join('')+'</div>';}
function acaoPainel(d,a,m){var fechaM=function(cb){var xb=m&&$('.x',m);if(xb)xb.click();setTimeout(cb,620);};var now=new Date().toISOString(),f={d:d,fill:true};
 if(!W.roOk())return;
 if(a==='sim'||a==='nao'||a==='parou'){f.k='1';var v=a==='sim';aplica(f,{contato_respondeu:v,contato_resp_em:now},[(a==='parou'?'Cliente parou de responder':'Contato feito: '+(v?'Respondeu':'Não respondeu'))+' · '+eu()+' · '+agora()]);setTimeout(function(){pinta(d,m);},60);return;}
 fechaM(function(){
  if(a==='res'){f.k='2';popDoc(f,'resumida','Anexe a proposta resumida de '+e4(nm(d)),'a');}
  else if(a==='cpl'){f.k='dia';popDoc(f,'completa','Anexe a proposta completa de '+e4(nm(d)),'b');}
  else if(a==='reu'){f.k='agd';f.from='agd';popReuniao(f);}
  else if(a==='comp'){f.k='dia';popDiagFill(f);}
  else if(a==='env'){f.k='3';popProposta(f);}
  else if(a==='fch'){f.k='4';popFechado(f);}
  else if(a==='mot'){motivoFill(d);}});}
function popDiagFill(f){var d=f.d,s=folha(f,e4(nm(d))+' compareceu à reunião?','','<div class="c7o">'+opc('sim','✅','Compareceu','')+opc('nao','📅','Faltou','O card volta para Reunião agendada.')+'</div>');
 $('[data-o="sim"]',s).onclick=function(){f.fecha();aplica(f,{compareceu:true},['Compareceu à reunião (diagnóstico)']);};
 $('[data-o="nao"]',s).onclick=function(){f.fecha();var g={d:d,k:'agd',from:'dia'};aplica(g,{compareceu:false},['Faltou à reunião']);};}
function motivoFill(d){var s=W.sheet('<div class="lbl c7lb">Perdidos</div><h2 class="c7h">Motivo da perda de '+e4(nm(d))+'</h2>'+motivoSel('c7mo')+'<div class="c7f"><button class="btn ol" data-c7="x">Cancelar</button><span class="sp"></span><button class="btn gd" data-c7="ok">'+ic('ok')+'Salvar</button></div>',480);
 s.classList.add('c7');$('[data-c7="x"]',s).onclick=function(){W.closeSheet();};
 $('[data-c7="ok"]',s).onclick=function(){var mo=$('#c7mo',s).value;if(!mo){toast('Escolha o motivo','x');return;}W.closeSheet();W.leadAtv(d,'Motivo da perda: '+mo);W.leadExtra(d,{motivo_nao_conversao:mo,atividades:d.raw.atividades}).then(function(){redesenha(d);});};}
function pinta(d,m){if(!m||!m.isConnected)return;var inn=$('.in',m);if(!inn)return;var h=painel(d),old=$('.c7p',inn);
 if(!h){if(old)old.remove();return;}
 if(old)old.outerHTML=h;else{var ref=$('.stl7',inn)||$('.stl',inn);if(ref)ref.insertAdjacentHTML('afterend',h);else return;}
 $$('[data-c7p]',inn).forEach(function(b){b.onclick=function(ev){ev.stopPropagation();acaoPainel(d,b.dataset.c7p,m);};});}

/* ---------- CSS ---------- */
function css(){if(document.getElementById('c7css'))return;var s=document.createElement('style');s.id='c7css';s.textContent=
 '.sheet.c7 .c7lb{color:var(--gold)}.sheet.c7 .c7h{margin:2px 0 4px;line-height:1.25}.sheet.c7 .c7s{color:var(--mut);font-size:13.5px;margin:4px 0 14px}'+
 '.c7o{display:grid;gap:10px}.c7b{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:13px 14px;border-radius:16px;border:1px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer;transition:transform .15s,border-color .15s,box-shadow .15s;font:inherit}'+
 '.c7b:hover{border-color:var(--gold);box-shadow:0 6px 18px -10px rgba(0,0,0,.35);transform:translateY(-1px)}.c7b:active{transform:scale(.99)}.c7b.dis{opacity:.5;cursor:not-allowed;transform:none!important;box-shadow:none!important}'+
 '.c7e{font-size:22px;width:34px;text-align:center;flex:none}.c7t{display:flex;flex-direction:column;gap:2px;min-width:0}.c7t b{font-size:14.5px}.c7t small{color:var(--mut);font-size:12.5px;line-height:1.35}'+
 '.c7f{display:flex;align-items:center;gap:10px;margin-top:16px;flex-wrap:wrap}.c7f .sp{flex:1}.c7pl{border-style:dashed!important}'+
 '.c7sem{display:block;margin:14px auto 0;background:none;border:0;color:var(--mut);font:600 13px "DM Sans";text-decoration:underline;cursor:pointer}'+
 '.c7x:not(:empty){margin-top:12px}.c7w{font-size:13px;color:var(--mut);padding:8px 2px}.c7w.er{color:var(--bad)}'+
 '.c7l{display:grid;gap:6px}.c7l button{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font:500 13px "DM Sans";text-align:left;cursor:pointer}.c7l button span{flex:1}.c7l button small{color:var(--mut)}'+
 '.sheet.c7 select{width:100%;padding:11px 12px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit}'+
 '.c7ch{display:flex;flex-wrap:wrap;gap:5px;margin:8px 0 2px}.c7c{font:700 10.5px "DM Sans";padding:3px 8px;border-radius:999px;background:color-mix(in srgb,var(--t,#fff) 16%,transparent);color:var(--t,inherit);border:1px solid color-mix(in srgb,var(--t,#fff) 22%,transparent);white-space:nowrap}'+
 '.c7c.f{border-style:dashed;background:transparent}.c7c.ok{background:rgba(63,143,106,.85);color:#fff;border-color:transparent}.c7c.am{background:rgba(229,201,123,.9);color:#3b2d06;border-color:transparent}.c7c.pt{background:rgba(14,124,123,.85);color:#fff;border-color:transparent}.c7c.rd{background:rgba(194,70,59,.88);color:#fff;border-color:transparent}'+
 '.dm .c7p{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:12px 0 4px;padding:10px 12px;border-radius:16px;background:color-mix(in srgb,currentColor 9%,transparent);border:1px solid color-mix(in srgb,currentColor 16%,transparent)}'+
 '.dm .c7p .sp{flex:1}.dm .c7pt{display:flex;flex-direction:column}.dm .c7pt small{opacity:.7;font-size:11px}.dm .c7pt b{font-size:13.5px}.dm .c7pb{padding:7px 12px!important;font-size:12.5px!important}'+
 '@media (max-width:860px){.c7f .btn{flex:1 1 auto}.c7f .sp{display:none}.dm .c7p .c7pb{flex:1 1 auto}}';
 document.head.appendChild(s);}

/* ---------- tutorial: 1 passo por pop-up ---------- */
function vis(e){if(!e)return false;var r=e.getBoundingClientRect();return r.width>0&&r.height>0;}
function colQ(k){return function(){var c=$('#kb .col[data-col="'+k+'"]');return c?($('.ch',c)||c):null;};}
function vaiCol(k){return function(){try{if(W.F&&W.F.modo!=='quadro')W.F.modo='quadro';if(W.cur!=='crm')W.go('crm');}catch(e){}
 setTimeout(function(){var kb=$('#kb'),c=kb&&$('.col[data-col="'+k+'"]',kb);if(kb&&c){try{kb.scrollTo({left:Math.max(0,c.offsetLeft-12),behavior:'smooth'});}catch(e){kb.scrollLeft=c.offsetLeft-12;}}
  var b=$('#kbs button[data-i="'+ORDEM.indexOf(k)+'"]');if(b&&W.isMob&&W.isMob())b.click();},W.cur==='crm'?60:700);};}
var TOUR={id:'t-crm7',page:'crm',navk:'crm',v:1,g:'Comercial',title:'CRM em 7 etapas',inv:'Como funcionam os pop-ups do CRM',
 desc:'Cada etapa do CRM pergunta o que a Alice precisa saber. Nada trava: todo pop-up tem “Pular por agora”.',
 abas:['Contato feito','Estudo/Simulação','Reunião agendada','Diagnóstico','Proposta enviada','Fechado','Preencher depois'],
 steps:[
  {act:vaiCol('0'),t:null,title:'O CRM em 7 etapas',text:'Quando o card entra numa etapa (arrastando, pela régua do card aberto ou pelas setas), abre um pop-up curto com o que a Alice precisa saber para seguir sozinha. Em Novo lead não abre nada.'},
  {a:0,act:vaiCol('1'),t:colQ('1'),wait:3000,title:'Contato feito: teve resposta?',text:'Depois de chamar o cliente no seu WhatsApp, marque: Respondeu (você conduz e a Alice para o WhatsApp dela), Não respondeu (a Alice volta a chamar na hora) ou Ainda vou ver (em 4 h úteis chega um lembrete).'},
  {a:1,act:vaiCol('2'),t:colQ('2'),wait:3000,title:'Estudo/Simulação: a proposta resumida',text:'Anexe a resumida: importe do computador, cole o texto, gere no Gerador de propostas ou escolha uma já enviada. Com ela, a Alice cita crédito, parcela e prazo nos follow-ups.'},
  {a:2,act:vaiCol('agd'),t:colQ('agd'),wait:3000,title:'Reunião agendada: data e hora',text:'Informe quando é a reunião, o link (Meet ou Zoom) e se é a 1ª ou a 2ª. A Alice confirma e manda os lembretes de 3 h, 15 min e na hora.'},
  {a:3,act:vaiCol('dia'),t:colQ('dia'),wait:3000,title:'Diagnóstico: compareceu?',text:'Se faltou, o card volta para Reunião agendada e a Alice entra na remarcação. Se compareceu, anexe a proposta completa: ela não vai para o cliente, serve para a Alice saber o que foi montado.'},
  {a:4,act:vaiCol('3'),t:colQ('3'),wait:3000,title:'Proposta enviada',text:'Registre como a proposta chegou ao cliente e, se quiser, quando ele deve decidir. O envio pela plataforma liga quando o e-mail de cada especialista for conectado.'},
  {a:5,act:vaiCol('4'),t:colQ('4'),wait:3000,title:'Fechado: ganho ou perdido',text:'Ganho vira cliente e a Alice para tudo. Perdido pede o motivo, e a Alice faz a recuperação de 3, 6 e 9 meses. Sem marcar, o card fica em Fechado e a Alice não manda nada.'},
  {a:6,act:vaiCol('1'),t:function(){return $$('#kb .c7c').filter(vis)[0]||colQ('1')();},wait:3000,title:'Pulou? Preencha depois',text:'Todo pop-up tem “Pular por agora”. O que faltou aparece no card como “falta: …” e dá para marcar depois no card aberto. Também dá para pular etapas: de Novo lead direto para Proposta, abre só o pop-up da etapa de destino.'}
 ]};
function registraTour(){var T2=W.AgionTour2;if(!T2||!T2.config)return false;if(!T2.config.some(function(t){return t.id===TOUR.id;}))T2.config.push(TOUR);
 try{var g=(W.TUG||[]).filter(function(x){return x[0]==='Comercial';})[0];if(g&&g[1].indexOf('t-crm7')<0){var i=g[1].indexOf('crm');g[1].splice(i>=0?i+1:g[1].length,0,'t-crm7');}if(W.TUIC)W.TUIC['t-crm7']='funnel';}catch(e){}return true;}

/* ---------- ligar ---------- */
function liga(){if(!W.AG7||!W.AG7.moverBase||typeof W.dealHTML!=='function'||typeof W.openDeal!=='function'||typeof W.sheet!=='function'){return setTimeout(liga,200);}
 if(W.CRM7)return;css();
 W.CRM7={prazoContato:prazoContato,somaUteis:somaUteis,mover:mover,chips:chips,popups:{contato:popContato,estudo:popEstudo,reuniao:popReuniao,diag:popDiag,proposta:popProposta,fechado:popFechado},motivos:MOTIVOS};
 var _dh=W.dealHTML;W.dealHTML=function(d,mini){var h=_dh.apply(this,arguments);try{var c=chips(d);if(c){var i=h.indexOf('<div class="dft">');if(i>0)h=h.slice(0,i)+c+h.slice(i);}}catch(e){}return h;};
 var _od=W.openDeal;W.openDeal=function(d){var r=_od.apply(this,arguments);try{var m=$$('.dm').pop();if(m&&d){setTimeout(function(){pinta(d,m);},80);var inn=$('.in',m);if(inn&&W.MutationObserver){var mo=new MutationObserver(function(){if(!m.isConnected){mo.disconnect();return;}if(!$('.c7p',inn))setTimeout(function(){pinta(d,m);},50);});mo.observe(inn,{childList:true});}}}catch(e){}return r;};
 W.perdidoFlow=perdidoFlow7;
 (function rt(n){if(!registraTour()&&n<60)setTimeout(function(){rt(n+1);},250);})(0);
 try{if(W.cur==='crm'&&$('#kb'))W.renderBoard(true);}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',liga);else liga();
})();
