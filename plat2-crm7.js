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
 var s=folha(ctx,tit,ctx.subDoc||(tipo==='completa'?'Ela não vai para o cliente: serve para a Alice saber o que foi montado.':'É o documento que mais ajuda a Alice a puxar para a reunião.'),
  (extra||'')+'<div class="c7o">'+opc('arq','📎','Importar do computador','PDF ou imagem')+opc('txt','📝','Colar o texto','Cole a proposta como texto')+opc('ger','✨','Gerar no Gerador de propostas',d.resp?'Abre o gerador já com este lead':'Designe o lead antes de gerar',!d.resp)+opc('lst','🗂️','Escolher uma já enviada','Propostas que este lead já tem')+'</div>'+
  '<div class="c7x" id="c7x"></div><input type="file" id="c7f" accept="application/pdf,image/*" hidden><button class="c7sem" data-c7="sem">Prosseguir sem a '+(tipo==='completa'?'completa':'resumida')+'</button>',true);   /* SEM_DUPLO_20261022: o "Prosseguir sem…" já faz o papel do "Pular por agora" */
 var x=$('#c7x',s),fin=function(atv,semDoc){ctx.fecha();if(typeof ctx.posDoc==='function'){var f=ctx.posDoc;ctx.posDoc=null;ctx.atvs=(ctx.atvs||[]).concat([atv]);setTimeout(f,320);return;}aplica(ctx,ctx.campos||{},(ctx.atvs||[]).concat([atv]));if(tipo==='resumida'&&!semDoc)ofertaEnvio(d);};   /* DIAG_PROP_27OUT: posDoc = próximo passo depois de anexar */   /* EMAIL_ESPEC_23OUT */
 $('[data-o="arq"]',s).onclick=function(){$('#c7f',s).click();};
 $('#c7f',s).onchange=async function(){var f=this.files&&this.files[0];if(!f)return;x.innerHTML='<div class="c7w">Enviando '+e4(f.name)+'…</div>';
  try{await sobeArquivo(d,f,tipo);fin('Anexou a proposta '+(tipo==='completa'?'completa':'resumida')+': '+f.name);}catch(e){x.innerHTML='<div class="c7w er">Não consegui enviar: '+e4(e.message||e)+'</div>';}};
 $('[data-o="txt"]',s).onclick=function(){x.innerHTML='<div class="fi"><label>Texto da proposta</label><textarea id="c7t" rows="6" placeholder="Cole aqui: crédito, parcela, prazo, lance…"></textarea></div><div style="display:flex;justify-content:flex-end"><button class="btn gd" id="c7ts">'+ic('ok')+'Salvar a proposta</button></div>';
  var t=$('#c7t',s);t.focus();$('#c7ts',s).onclick=async function(){var v=t.value.trim();if(!v){toast('Cole o texto da proposta','x');return;}this.disabled=true;
   try{await salvaDoc(d,{tipo:tipo,titulo:'Proposta '+(tipo==='completa'?'completa':'resumida')+' (texto colado)',texto:v});fin('Colou a proposta '+(tipo==='completa'?'completa':'resumida'));}catch(e){this.disabled=false;toast('Não salvou: '+(e.message||e),'x');}};};
 $('[data-o="ger"]',s).onclick=function(){if(!d.resp)return;ctx.fecha();aplica(ctx,ctx.campos||{},(ctx.atvs||[]).concat(['Abriu o Gerador de propostas para a '+(tipo==='completa'?'completa':'resumida')]),{quieto:true});
  var pos=ctx.posDoc;ctx.posDoc=null;setTimeout(function(){try{W.pcall('abrirProposta',d.uid,'lead');}catch(e){}vigiaGerador(d,tipo,inicio,pos);},350);};
 $('[data-o="lst"]',s).onclick=async function(){x.innerHTML='<div class="c7w">Procurando…</div>';var L=await jaEnviadas(d);
  if(!L.length){x.innerHTML='<div class="c7w">Este lead ainda não tem proposta salva. Use “Importar”, “Colar” ou “Gerar”.</div>';return;}
  x.innerHTML='<div class="c7l">'+L.map(function(o,i){return '<button data-i="'+i+'">'+ic('doc',14)+'<span>'+e4(o.t)+'</span><small>'+(o.q?new Date(o.q).toLocaleDateString('pt-BR'):'')+'</small></button>';}).join('')+'</div>';
  $$('.c7l button',s).forEach(function(b){b.onclick=async function(){var o=L[+b.dataset.i];b.disabled=true;
   try{if(o.fonte==='arq')await salvaDoc(d,{tipo:tipo,titulo:o.t,arquivo_path:o.path});else if(o.x.tipo!==tipo)await salvaDoc(d,{tipo:tipo,titulo:o.x.titulo||o.t,arquivo_path:o.x.arquivo_path||null,url:o.x.url||null,texto:o.x.texto||null});
    fin('Escolheu a proposta '+(tipo==='completa'?'completa':'resumida')+': '+o.t);}catch(e){b.disabled=false;toast('Não salvou: '+(e.message||e),'x');}};});};
 $('[data-c7="sem"]',s).onclick=function(){semDoc(ctx,semKey,function(){popDoc(ctx,tipo,tit,semKey,extra);},function(){fin('Seguiu sem a proposta '+(tipo==='completa'?'completa':'resumida'),1);});};
 return s;}
function semDoc(ctx,key,anexar,seguir){var tt={a:'Seguir sem a resumida?',b:'Seguir sem a completa?',c:'Seguir sem registrar o envio?'}[key];
 var s=W.sheet('<div class="lbl c7lb">'+NOME[ctx.k]+'</div><h2 class="c7h">'+tt+'</h2><p class="c7s" style="font-size:14px;line-height:1.55">'+SEM[key]+'</p><div class="c7f"><button class="btn gd" data-c7="an">'+ic('doc')+'Anexar agora</button><span class="sp"></span><button class="btn ol" data-c7="sg">Seguir mesmo assim</button></div>',480);
 s.classList.add('c7');var ok=false;$('[data-c7="an"]',s).onclick=function(){ok=true;W.closeSheet();setTimeout(anexar,300);};$('[data-c7="sg"]',s).onclick=function(){ok=true;seguir();};
 var xb=$('.x',s);if(xb)xb.onclick=function(){if(ok)return;ok=true;W.closeSheet();if(!ctx.fill)volta();};var ov=$('#ov');if(ov)ov._close=xb?xb.onclick:null;}
/* depois que o Gerador fecha, a proposta nova entra no card */
function vigiaGerador(d,tipo,inicio,depois){var tent=0,t=setInterval(async function(){tent++;var m=null;try{m=W.parent.document.getElementById('propostaModal');}catch(e){}
 if(tent>900){clearInterval(t);return;}if(!m||!m.classList.contains('hidden'))return;clearInterval(t);
 try{var c=sb();if(!c||!c.storage)return;var l=await c.storage.from('propostas').list(dirDe(d),{limit:50,sortBy:{column:'name',order:'desc'}});
  var novos=(l.data||[]).filter(function(f){return /\.pdf$/i.test(f.name)&&+(f.name.split('-')[0])>=inicio;});
  if(!novos.length)return;var f=novos[0],p=dirDe(d)+'/'+f.name;await salvaDoc(d,{tipo:tipo,titulo:/completo/.test(f.name)?'Proposta completa (gerador)':'Proposta resumida (gerador)',arquivo_path:p});
  W.leadAtv(d,'Proposta '+(tipo==='completa'?'completa':'resumida')+' gerada no Gerador e ligada ao card');W.leadExtra(d,{atividades:d.raw.atividades});toast('A proposta do gerador entrou no card de '+nm(d),'doc');if(typeof depois==='function'){setTimeout(depois,400);return;}if(tipo==='resumida')ofertaEnvio(d);}catch(e){}},1000);}
function ofertaEnvio(d){setTimeout(function(){try{compoe(d,'resumida',{titulo:'Mandar a resumida para '+nm(d)+' agora?',agoraNao:1});}catch(e){}},480);}

/* ---------- 3 · Estudo/Simulação ---------- */
function popEstudo(ctx){popDoc(ctx,'resumida','Anexe a proposta resumida de '+e4(nm(ctx.d)),'a');}

/* ---------- 4 · Reunião agendada ---------- */
function popReuniao(ctx){var d=ctx.d,x=xl(d),pad=function(n){return String(n).padStart(2,'0');};
 var t=x.reuniao_em?new Date(x.reuniao_em):(function(){var a=new Date();a.setDate(a.getDate()+1);a.setHours(10,0,0,0);return a;})();
 var v=t.getFullYear()+'-'+pad(t.getMonth()+1)+'-'+pad(t.getDate())+'T'+pad(t.getHours())+':'+pad(t.getMinutes());
 var r2=x.reuniao_tipo==='R2'||ctx.from==='dia'||x.compareceu===true;
 var s=folha(ctx,'Quando é a reunião com '+e4(nm(d))+'?','A reunião entra na agenda e a Alice manda a confirmação e os lembretes (3 h, 15 min e na hora).',
  '<div class="fi"><label>Data e hora</label><input type="datetime-local" id="c7d" value="'+v+'"></div><div class="fi"><label>Link da reunião (opcional)</label><input id="c7k" placeholder="Meet ou Zoom" value="'+e4(x.link_meet||'')+'"></div>'+
  reuniaoCampos(d)+'<div class="lbl" style="margin:4px 0 8px">Tipo</div><div class="opts" id="c7r"><button class="opt'+(r2?'':' on')+'" data-v="R1">1ª reunião</button><button class="opt'+(r2?' on':'')+'" data-v="R2">2ª reunião</button></div>'+
  '<div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="btn gd" id="c7ok">'+ic('cal')+'Marcar reunião</button></div>');
 var tp=r2?'R2':'R1';$$('#c7r .opt',s).forEach(function(o){o.onclick=function(){tp=o.dataset.v;$$('#c7r .opt',s).forEach(function(q){q.classList.toggle('on',q===o);});};});
 $('#c7ok',s).onclick=function(){var val=$('#c7d',s).value;if(!val){toast('Escolha a data e a hora','cal');return;}var dt=new Date(val);if(isNaN(+dt)){toast('Data inválida','x');return;}
  var iso=dt.toISOString(),lk=$('#c7k',s).value.trim(),em=($('#c7em',s)||{}).value||'',cv=$('#c7cv',s);em=em.trim();
  if(cv&&cv.checked&&em&&!emailOk(em)){toast('E-mail do cliente inválido','x');return;}
  var c={reuniao_em:iso,link_meet:lk||null,reuniao_tipo:tp,compareceu:null};if(em&&emailOk(em)&&!(d.email||x.email))c.email=em;ctx.fecha();
  Promise.resolve(aplica(ctx,c,['Reunião marcada para '+dtBR(iso)+' ('+(tp==='R2'?'2ª reunião':'1ª reunião')+')'])).then(function(ok){   /* EMAIL_ESPEC_23OUT: convite no nome do especialista */
   if(ok===false||!cv||!cv.checked)return;if(!emailOk(em)){toast('Sem e-mail do cliente: o convite não foi enviado','cal');return;}convite(d,em);});};}

/* ---------- 5 · Diagnóstico ---------- */
function popDiag(ctx){var d=ctx.d;
 var s=folha(ctx,e4(nm(d))+' compareceu à reunião?','',
  '<div class="c7o">'+opc('sim','✅','Compareceu','Depois, faça o diagnóstico no Gerador de propostas.')+opc('nao','📅','Faltou','O card volta para Reunião agendada e a Alice entra no fluxo de remarcação.')+'</div>');
 $('[data-o="sim"]',s).onclick=function(){var x=xl(d),c={compareceu:true};if(!x.reuniao_em)c.reuniao_em=new Date().toISOString();ctx.campos=c;ctx.atvs=['Compareceu à reunião (diagnóstico)'];
  ctx.fecha();aplica(ctx,c,ctx.atvs);setTimeout(function(){popFazDiag(d);},360);};   /* DIAG_PROP_27OUT: no Diagnóstico só registra o comparecimento; a proposta vai em "Proposta enviada" */
 $('[data-o="nao"]',s).onclick=function(){ctx.fecha();aplica(ctx,{compareceu:false},['Faltou à reunião'],{k:'agd'});
  setTimeout(function(){var s2=W.sheet('<div class="lbl c7lb">Reunião agendada</div><h2 class="c7h">Marcado: '+e4(nm(d))+' faltou</h2><p class="c7s">A Alice entra no fluxo de remarcação. Se já combinaram outra data, marque agora.</p><div class="c7f"><button class="btn ol" data-c7="ok">Ok</button><span class="sp"></span><button class="btn gd" data-c7="nv">'+ic('cal')+'Marcar nova data</button></div>',440);
   s2.classList.add('c7');$('[data-c7="ok"]',s2).onclick=function(){W.closeSheet();};$('[data-c7="nv"]',s2).onclick=function(){W.closeSheet();setTimeout(function(){popReuniao({d:d,k:'agd',from:'agd',fill:true});},300);};},450);};}

/* DIAG_PROP_27OUT · depois do "Compareceu": o diagnóstico é feito no Gerador de propostas */
function popFazDiag(d){var s=W.sheet('<div class="lbl c7lb">CRM · Diagnóstico</div><h2 class="c7h">Agora, o diagnóstico de '+e4(nm(d))+'</h2><p class="c7s" style="font-size:14px;line-height:1.55">Faça o diagnóstico no <b>Gerador de propostas</b>: o objetivo, o crédito, a parcela que cabe, o lance e o prazo do cliente. A simulação fica ligada ao card e, quando a proposta estiver pronta, mova o card para <b>Proposta enviada</b> para anexar e enviar.</p><div class="c7f"><button class="btn ol" data-c7="dp">Fazer depois</button><span class="sp"></span><button class="btn gd" data-c7="ger"'+(d.resp?'':' disabled title="Designe o lead antes de abrir o gerador"')+'>'+ic('doc')+'Fazer o diagnóstico no Gerador</button></div>',480);
 s.classList.add('c7');$('[data-c7="dp"]',s).onclick=function(){W.closeSheet();};
 $('[data-c7="ger"]',s).onclick=function(){if(!d.resp)return;W.closeSheet();var ini=Date.now();try{W.leadAtv(d,'Abriu o Gerador de propostas para o diagnóstico');}catch(e){}setTimeout(function(){try{W.pcall('abrirProposta',d.uid,'lead');}catch(e){}vigiaGerador(d,'completa',ini);},320);};}

/* ---------- 6 · Proposta enviada ---------- */
/* DIAG_PROP_27OUT: é aqui que a proposta entra — primeiro anexa (ou gera), depois registra como ela chegou ao cliente */
function popPropAnexa(ctx){ctx.subDoc='É a proposta que vai para o cliente. Fica no card e a Alice acompanha a decisão citando o que ele recebeu.';ctx.posDoc=function(){popPropostaEnvio(ctx);};
 popDoc(ctx,'completa','Anexe a proposta de '+e4(nm(ctx.d)),'b');}
function chProp(o){try{return o.fonte==='arq'?('p:'+o.path):(o.x&&o.x.arquivo_path?('p:'+o.x.arquivo_path):(o.x&&o.x.url?('u:'+o.x.url):('i:'+(o.x&&o.x.id))));}catch(e){return '';}}   /* GPT_27OUT: identifica a proposta confirmada */
async function urlProp(o){try{var p=o.fonte==='arq'?o.path:(o.x&&o.x.arquivo_path);if(p){var r=await sb().storage.from('propostas').createSignedUrl(p,3600);return r&&r.data&&r.data.signedUrl||null;}return (o.x&&o.x.url)||null;}catch(e){return null;}}
/* DIAG_PROP_27OUT · PROP_SUGERE: a proposta feita no Gerador para este cliente já aparece pronta — "É esta?" — e o envio segue com ela */
function popProposta(ctx){var d=ctx.d;
 jaEnviadas(d).then(function(L){
  L=(L||[]).filter(function(o){return o.fonte==='arq'||(o.x&&(o.x.tipo==='completa'||o.x.tipo==='resumida')&&(o.x.arquivo_path||o.x.url||o.x.texto));}).sort(function(a,b){return String(b.q||'').localeCompare(String(a.q||''));});
  var o=L[0];if(!o){popPropAnexa(ctx);return;}
  var dt=o.q?new Date(o.q).toLocaleDateString('pt-BR'):'';
  var s=folha(ctx,'Enviar a proposta para '+e4(nm(d)),'Achamos a proposta mais recente de '+e4(nm(d))+'. É esta que vai para o cliente?',
   '<div class="c7l" style="margin-bottom:12px"><button data-c7="ver">'+ic('doc',14)+'<span><b>'+e4(o.t)+'</b></span><small>'+(dt?dt+' · ':'')+'ver</small></button></div>'+
   '<div class="c7o">'+opc('usa','✅','Sim, é esta','Segue para o envio ao cliente')+opc('out','📎','Não, anexar outra','Importar, colar, gerar ou escolher outra proposta')+opc('fora','💬','Já enviei por conta','Mandei pelo WhatsApp ou e-mail próprio')+'</div>',true);
  $('[data-c7="ver"]',s).onclick=async function(){var w=null;try{w=window.open('','_blank');}catch(e){}var u=await urlProp(o);if(u){if(w)w.location=u;else location.href=u;}else{if(w)w.close();if(o.x&&o.x.texto)toast('Esta proposta é um texto colado: '+String(o.x.texto).slice(0,80)+'…','doc');else toast('Não consegui abrir a proposta agora.','x');}};
  $('[data-o="usa"]',s).onclick=async function(){this.disabled=true;var falhou=false;try{if(o.fonte==='arq')await salvaDoc(d,{tipo:'completa',titulo:o.t,arquivo_path:o.path});}catch(e){falhou=true;}
   ctx.escolhida=chProp(o);   /* GPT_27OUT: o e-mail abre com esta proposta selecionada */
   if(falhou)toast('Não consegui ligar a proposta ao card agora. Ela segue para o envio, mas confira o card depois.','x');
   ctx.atvs=(ctx.atvs||[]).concat(['Proposta escolhida para o envio: '+o.t+(falhou?' (não ficou anexada ao card)':'')]);ctx.fecha();setTimeout(function(){popPropostaEnvio(ctx);},320);};
  $('[data-o="out"]',s).onclick=function(){ctx.fecha();setTimeout(function(){popPropAnexa(ctx);},320);};
  $('[data-o="fora"]',s).onclick=async function(){this.disabled=true;try{await salvaDoc(d,{tipo:'material',titulo:'Proposta enviada por fora',enviado_em:new Date().toISOString(),enviado_por:W.realId()});}catch(e){}
   ctx.fecha();aplica(ctx,{},(ctx.atvs||[]).concat(['Proposta enviada por conta (WhatsApp ou e-mail próprio): '+o.t]));};
 });}
function popPropostaEnvio(ctx){var d=ctx.d,x=xl(d);
 var s=folha(ctx,'Como a proposta chegou a '+e4(nm(d))+'?','Assim a Alice sabe o que a pessoa tem em mãos para acompanhar a decisão.',
  '<div class="c7o">'+opc('plat','📤','Enviar pela plataforma','E-mail no seu nome, com a sua assinatura e a proposta anexada')+opc('fora','💬','Já enviei por fora','WhatsApp ou e-mail próprio')+'</div>'+
  '<div class="fi" style="margin-top:12px"><label>Quando deve decidir? (opcional)</label><input type="date" id="c7dd" value="'+e4((x.data_decisao||'').slice(0,10))+'"></div>'+
  '<button class="c7sem" data-c7="sem">Prosseguir sem registrar</button>',true);   /* SEM_DUPLO_20261022 */
 var dd=function(){var v=$('#c7dd',s).value;return v?{data_decisao:v}:{};};
 $('[data-o="plat"]',s).onclick=function(){var c=dd();ctx.fecha();   /* EMAIL_ESPEC_23OUT */
  compoe(d,'completa',{titulo:'Enviar a proposta para '+nm(d),pref:ctx.escolhida||'',depois:function(i){aplica(ctx,c,(ctx.atvs||[]).concat(['Proposta enviada pela plataforma para '+i.para+(c.data_decisao?' · decide até '+c.data_decisao.split('-').reverse().join('/'):'')]));},cancela:function(){if(!ctx.fill)volta();}});};
 $('[data-o="fora"]',s).onclick=async function(){var b=this;b.disabled=true;try{await salvaDoc(d,{tipo:'material',titulo:'Proposta enviada por fora',enviado_em:new Date().toISOString(),enviado_por:W.realId()});}catch(e){}
  ctx.fecha();var c=dd();aplica(ctx,c,(ctx.atvs||[]).concat(['Proposta enviada por fora (WhatsApp ou e-mail próprio)'+(c.data_decisao?' · decide até '+c.data_decisao.split('-').reverse().join('/'):'')]));};
 $('[data-c7="sem"]',s).onclick=function(){var c=dd();semDoc(ctx,'c',function(){popPropostaEnvio(ctx);},function(){ctx.fecha();aplica(ctx,c,(ctx.atvs||[]).concat(['Seguiu sem registrar o envio da proposta']));});};}

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
  W.confirma('Tirar de “'+NOME[from]+'”?',e4(d.nome)+(x.reuniao_em?' tem reunião em '+dtBR(x.reuniao_em)+'.':'.')+' Ao voltar para “'+NOME[k]+'” a reunião é desmarcada na plataforma (se o convite foi por e-mail, o cliente recebe o cancelamento).','Desmarcar e mover').then(function(ok){
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
var _aplica=aplica;aplica=function(ctx,campos,atvs,op){var lp=0;if(ctx.limpa&&!ctx.__lp){ctx.__lp=1;lp=1;campos=Object.assign({},ctx.limpa,campos||{});atvs=(ctx.atvs0||[]).concat(atvs||[]);}var p=_aplica(ctx,campos,atvs,op);
 if(lp)Promise.resolve(p).then(function(ok){if(ok===false)return;api('/api/reuniao/convite',{lead_id:ctx.d.uid,cancelar:true}).then(function(r){if(r&&r.ok&&r.data&&r.data.cancelado)toast('O cliente recebeu o cancelamento do convite','cal');});});   /* EMAIL_ESPEC_23OUT */
 return p;};

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
 else if(k==='1'){if(x.contato_respondeu===true)o.push(['ok','✅ Respondeu']);else if(x.contato_respondeu===false)o.push(['pt','🤖 Não respondeu: Alice chamando']);else{var pz=prazoContato(x);o.push(['am','⏳ Aguardando resposta',(pz&&!pz.passouA?'Alice chama de novo '+hmBR(pz.auto):'')]);}}
 else if(k==='agd'){if(x.compareceu===false)o.push(['rd','Faltou']);if(!x.reuniao_em)o.push(['f','falta: data da reunião']);}
 else if(k==='dia'){if(x.compareceu==null)o.push(['f','falta: compareceu']);}
 else if(k==='4'&&d.st!==4)o.push(['f','falta: ganho ou perdido']);
 return o.length?'<div class="c7ch">'+o.map(function(c){return '<span class="c7c '+c[0]+(c[2]?' c7d':'')+'">'+(c[2]?'<b>'+e4(c[1])+'</b><small>'+e4(c[2])+'</small>':e4(c[1]))+'</span>';}).join('')+'</div>':'';}   /* CHIP_2L_26OUT: chip com prazo em 2 linhas, nunca sai do card */

try{W.AG7=W.AG7||{};W.AG7.chips=chips;}catch(e){}   /* CONV_CRM_26OUT: o painel da conversa mostra o mesmo status do card */
/* ---------- painel no card aberto ---------- */
function painel(d){var x=xl(d),k=W.AG7.colDe(d),bt=[],tx='',sub='';
 if(d.perdido){tx='Perdido'+(x.motivo_nao_conversao?' · '+x.motivo_nao_conversao:'');if(!x.motivo_nao_conversao)bt.push(['mot','Informar motivo']);}
 else if(k==='1'){tx=x.contato_respondeu===true?'✅ Respondeu':x.contato_respondeu===false?'🤖 Não respondeu: Alice chamando':'⏳ Aguardando resposta';
  if(x.contato_respondeu==null)sub=prazoTxt(prazoContato(x));if(x.contato_respondeu===true)bt.push(['parou','Cliente parou de responder']);else{bt.push(['sim','Respondeu']);bt.push(['nao','Não respondeu']);}}
 else if(k==='2'){tx='Estudo/Simulação';bt.push(['res','Anexar proposta resumida']);bt.push(['envr','Enviar ao cliente']);bt.push(['sims','Simulações']);}   /* FERR_CLIENTE_28OUT */
 else if(k==='agd'){tx=x.reuniao_em?'📅 '+dtBR(x.reuniao_em)+(x.reuniao_tipo==='R2'?' · 2ª reunião':''):'falta: data da reunião';if(x.compareceu===false)tx='Faltou · '+tx;bt.push(['reu',x.reuniao_em?'Mudar data':'Informar data da reunião']);if(x.reuniao_em)bt.push(['conv','Enviar convite']);}
 else if(k==='dia'){tx=x.compareceu==null?'falta: compareceu':'✅ Compareceu';if(x.compareceu==null)bt.push(['comp','Compareceu?']);else bt.push(['dg','Fazer o diagnóstico no Gerador']);}   /* DIAG_PROP_27OUT */
 else if(k==='3'){tx='Proposta enviada'+(x.data_decisao?' · decide até '+String(x.data_decisao).slice(0,10).split('-').reverse().join('/'):'');bt.push(['anx','Anexar proposta']);bt.push(['envp','Enviar por e-mail']);bt.push(['sims','Simulações']);bt.push(['env','Registrar envio / data de decisão']);}
 else if(k==='4'&&d.st!==4){tx='falta: ganho ou perdido';bt.push(['fch','Marcar ganho ou perdido']);}
 else return '';
 return '<div class="c7p"><span class="c7pt"><small>'+e4(String(tx).indexOf(NOME[k]||'~')===0?'Etapa no CRM':(NOME[k]||'Etapa'))+'</small><b>'+e4(tx)+'</b>'+(sub?'<small style="margin-top:2px">'+e4(sub)+'</small>':'')+'</span><span class="sp"></span>'+bt.map(function(b){return '<button class="ob c7pb" data-c7p="'+b[0]+'">'+e4(b[1])+'</button>';}).join('')+'</div>';}
function acaoPainel(d,a,m){var fechaM=function(cb){var xb=m&&$('.x',m);if(xb)xb.click();setTimeout(cb,620);};var now=new Date().toISOString(),f={d:d,fill:true};
 if(!W.roOk())return;
 if(a==='sim'||a==='nao'||a==='parou'){f.k='1';var v=a==='sim';aplica(f,{contato_respondeu:v,contato_resp_em:now},[(a==='parou'?'Cliente parou de responder':'Contato feito: '+(v?'Respondeu':'Não respondeu'))+' · '+eu()+' · '+agora()]);setTimeout(function(){pinta(d,m);},60);return;}
 fechaM(function(){
  if(a==='res'){f.k='2';popDoc(f,'resumida','Anexe a proposta resumida de '+e4(nm(d)),'a');}
  else if(a==='cpl'){f.k='dia';popDoc(f,'completa','Anexe a proposta completa de '+e4(nm(d)),'b');}
  else if(a==='reu'){f.k='agd';f.from='agd';popReuniao(f);}
  else if(a==='comp'){f.k='dia';popDiagFill(f);}
  else if(a==='env'){f.k='3';popPropostaEnvio(f);}
  else if(a==='anx'){f.k='3';popPropAnexa(f);}
  else if(a==='dg'){popFazDiag(d);}
  else if(a==='fch'){f.k='4';popFechado(f);}
  else if(a==='mot'){motivoFill(d);}
  else if(a==='envr'){compoe(d,'resumida',{});}
  else if(a==='envp'){compoe(d,'completa',{});}
  else if(a==='conv'){conviteSheet(d);}
  else if(a==='sims'){simSheet(d);}});}   /* PAINEL_GRID_28OUT: 'sim' era o Respondeu do Contato feito */
function popDiagFill(f){var d=f.d,s=folha(f,e4(nm(d))+' compareceu à reunião?','','<div class="c7o">'+opc('sim','✅','Compareceu','')+opc('nao','📅','Faltou','O card volta para Reunião agendada.')+'</div>');
 $('[data-o="sim"]',s).onclick=function(){f.fecha();aplica(f,{compareceu:true},['Compareceu à reunião (diagnóstico)']);setTimeout(function(){popFazDiag(d);},360);};
 $('[data-o="nao"]',s).onclick=function(){f.fecha();var g={d:d,k:'agd',from:'dia'};aplica(g,{compareceu:false},['Faltou à reunião']);};}
function motivoFill(d){var s=W.sheet('<div class="lbl c7lb">Perdidos</div><h2 class="c7h">Motivo da perda de '+e4(nm(d))+'</h2>'+motivoSel('c7mo')+'<div class="c7f"><button class="btn ol" data-c7="x">Cancelar</button><span class="sp"></span><button class="btn gd" data-c7="ok">'+ic('ok')+'Salvar</button></div>',480);
 s.classList.add('c7');$('[data-c7="x"]',s).onclick=function(){W.closeSheet();};
 $('[data-c7="ok"]',s).onclick=function(){var mo=$('#c7mo',s).value;if(!mo){toast('Escolha o motivo','x');return;}W.closeSheet();W.leadAtv(d,'Motivo da perda: '+mo);W.leadExtra(d,{motivo_nao_conversao:mo,atividades:d.raw.atividades}).then(function(){redesenha(d);});};}
function pinta(d,m){if(!m||!m.isConnected)return;var inn=$('.in',m);if(!inn)return;var h=painel(d),old=$('.c7p',inn);
 if(!h){if(old)old.remove();return;}
 if(old)old.outerHTML=h;else{var ref=$('.stl7',inn)||$('.stl',inn);if(ref)ref.insertAdjacentHTML('afterend',h);else return;}
 $$('[data-c7p]',inn).forEach(function(b){b.onclick=function(ev){ev.stopPropagation();acaoPainel(d,b.dataset.c7p,m);};});}

/* ---------- EMAIL_ESPEC_23OUT: proposta e convite pelo e-mail de quem atende ----------
   · Estudo/Simulação: depois de anexar a resumida, já oferece mandar ao cliente (e-mail ou o seu WhatsApp).
   · Reunião agendada: o convite vai por e-mail no nome do especialista, com o Gabriel junto.
   · Proposta enviada: "Enviar pela plataforma" manda a proposta por e-mail, com assinatura e anexo.
   O robô (email_espec.py) escolhe sozinho: e-mail da pessoa (Google ligado) ou e-mail da Agion com o nome dela. */
var EU=null;
function api(path,body){return Promise.resolve(W.papi(path,body?{method:'POST',body:JSON.stringify(body)}:{})).then(function(r){
  if(r&&typeof r.json==='function')return r.json().then(function(j){return {ok:r.ok,data:j||{}};},function(){return {ok:r.ok,data:{}};});
  return r||{ok:false,data:{}};},function(){return {ok:false,data:{erro:'sem conexão com o robô'}};});}
function quemEnvia(forca){if(EU&&!forca)return Promise.resolve(EU);return api('/api/esp/eu').then(function(r){if(r&&r.ok&&r.data&&r.data.eu)EU=r.data;return EU;});}
function copiaTxt(e){var c=(e&&e.copia)||[];return c.length?c.map(function(x){return (x.nome||'').split(' ')[0]||x.email;}).join(' e '):'';}
function viaTxt(e){if(!e||!e.eu)return '';var u=e.eu,c=copiaTxt(e);/* EMAIL_COPIA_24OUT */
 return (u.modo==='google'?'Sai do seu e-mail ('+u.email_empresa+'), com a sua assinatura.':'Sai do e-mail da Agion com o seu nome e a sua assinatura.')+
  ' A resposta do cliente vai para '+(u.resposta||'você')+(c?' e para o '+c+', que também recebe cópia do e-mail.':'.');}
function emailOk(v){return /^[^@\s,;]+@[^@\s,;]+\.[a-z]{2,}$/i.test(String(v||'').trim());}
function telDig(d){var t=String(d&&d.tel||'').replace(/\D/g,'');if(t&&t.length<=11)t='55'+t;return t;}
function msgPadrao(d,tipo){var n=nm(d);n=n.charAt(0).toUpperCase()+n.slice(1).toLowerCase();
 return tipo==='completa'?'Oi, '+n+', tudo bem?\n\nObrigado pela nossa conversa. Segue a proposta completa que montamos, com a estrutura das cartas e a estratégia que combinamos.\n\nQualquer dúvida, é só responder este e-mail ou me chamar no WhatsApp.'
  :'Oi, '+n+', tudo bem?\n\nConforme conversamos, segue a simulação que preparei para você, com o crédito, a parcela e o prazo.\n\nDá uma olhada com calma e me diga o que achou. Se fizer sentido, marcamos uma conversa rápida para eu te mostrar a estratégia de contemplação.';}
/* FERR_CLIENTE_28OUT: simulações das ferramentas salvas para o cliente do card (ver e abrir; criar e excluir só na ferramenta) */
var FERR_NOVA=[['escada-financeira','Escada financeira'],['escada-patrimonial','Escada patrimonial'],['calc-alavancagem','Alavancagem'],['calc-financiamento','Financiamento × Consórcio'],['calc-avista','Consórcio × À vista'],['calc-lance','Lance livre']];
function simSheet(d){var s=W.sheet('<div class="lbl c7lb">Simulações das ferramentas</div><h2 class="c7h">Salvas para '+e4(nm(d))+'</h2>'+
  '<p class="c7s">Para criar ou excluir, use a própria ferramenta. Para mandar ao cliente, use “Enviar por e-mail”: lá você marca quais vão anexadas.</p><div id="c7sl"></div>'+
  '<div class="lbl" style="margin:14px 0 6px">Nova simulação para '+e4(nm(d))+'</div><div class="c7nf" style="display:flex;gap:6px;flex-wrap:wrap">'+FERR_NOVA.map(function(f){return '<button class="btn sm ol" data-nf="'+f[0]+'">'+e4(f[1])+'</button>';}).join('')+'</div>'+
  '<div class="c7f"><span class="sp"></span><button class="btn ol" data-c7="x">Fechar</button></div>',600);
 s.classList.add('c7');$('[data-c7="x"]',s).onclick=function(){W.closeSheet();};
 $$('[data-nf]',s).forEach(function(b){b.onclick=function(){var u='/'+b.dataset.nf+'?ag_lead='+encodeURIComponent(d.uid);var w=null;try{w=W.open(u,'_blank');}catch(e){}if(!w)location.href=u;};});
 if(W.AgFerrCli)W.AgFerrCli.lista($('#c7sl',s),{lead_id:d.uid,abrir:true,vazio:'Nenhuma simulação salva para '+nm(d)+' ainda.'});else $('#c7sl',s).innerHTML='<div class="c7w">Recarregue a página para ver as simulações.</div>';}
function regEnvio(d,txt){try{W.leadAtv(d,txt);W.leadExtra(d,{atividades:d.raw.atividades});}catch(e){}}

/* folha "Enviar a proposta": para, qual proposta, assunto e mensagem */
function compoe(d,tipo,op){op=op||{};var fechou=false,L=[];
 var s=W.sheet('<div class="lbl c7lb">'+(tipo==='completa'?'Proposta enviada':'Estudo/Simulação')+'</div><h2 class="c7h">'+e4(op.titulo||('Enviar a '+(tipo==='completa'?'proposta':'simulação')+' para '+nm(d)))+'</h2>'+
  '<p class="c7s c7via" id="c7via">'+e4(viaTxt(EU)||'Sai em e-mail no seu nome, com a sua assinatura e a proposta anexada.')+'</p>'+
  '<div class="fi"><label>E-mail do cliente</label><input type="email" id="c7pa" placeholder="nome@email.com" value="'+e4(d.email||xl(d).email||'')+'"></div>'+
  '<div class="fi"><label>Proposta</label><select id="c7dc"><option value="">Procurando as propostas do card…</option></select></div>'+
  '<div class="fi c7fr"><label>Anexar simulações das ferramentas <small style="font-weight:500;color:var(--mut)">· marque as que vão junto com a proposta, em PDF</small></label><div id="c7fr"></div>'+   /* FERR_CLIENTE_28OUT · FERR_ANEXA_28OUT */
  '<div style="margin-top:10px;padding:10px 12px;border-radius:14px;background:var(--bg);border:1px dashed var(--line)"><small style="display:block;color:var(--mut);font-size:12px;line-height:1.45;margin-bottom:8px">Fazer uma simulação agora: a ferramenta abre já com '+e4(nm(d))+'. Toque em Salvar lá e volte aqui: ela aparece marcada para ir no e-mail.</small>'+
  '<div style="display:flex;gap:6px;flex-wrap:wrap">'+FERR_NOVA.map(function(f){return '<button type="button" class="btn sm ol" data-nf="'+f[0]+'">'+e4(f[1])+'</button>';}).join('')+'</div></div></div>'+
  '<div class="fi"><label>Assunto</label><input id="c7as" value="'+e4(tipo==='completa'?'Sua proposta · Agion Consórcios':'Sua simulação · Agion Consórcios')+'"></div>'+
  '<div class="fi"><label>Mensagem</label><textarea id="c7ms" rows="7">'+e4(msgPadrao(d,tipo))+'</textarea></div>'+
  '<div class="c7x" id="c7er"></div>'+
  '<div class="c7f"><button class="btn ol" data-c7="x">'+(op.agoraNao?'Agora não':'Cancelar')+'</button><span class="sp"></span>'+(tipo==='resumida'?'<button class="btn ol" data-c7="wa">'+ic('wa')+'No meu WhatsApp</button>':'')+'<button class="btn gd" data-c7="ok">'+ic('send')+'Enviar e-mail</button></div>',560);
 s.classList.add('c7');
 var FRS=[];   /* FERR_CLIENTE_28OUT: simulações salvas nas ferramentas para este cliente */
 if(W.AgFerrCli){var LST=null,ANT=null,FVI=null;   /* FERR_ANEXA_28OUT: ao voltar da ferramenta, a lista atualiza e a simulação nova já vem marcada */
  LST=W.AgFerrCli.lista($('#c7fr',s),{lead_id:d.uid,selecionar:true,onSel:function(ids){FRS=ids;},onCarregou:function(L){if(ANT===null)ANT=L.map(function(x){return x.id;});},vazio:'Nenhuma simulação salva para '+nm(d)+' ainda. Faça uma agora pelos botões abaixo.'});
  $$('.c7fr [data-nf]',s).forEach(function(b){b.onclick=function(){var u='/'+b.dataset.nf+'?ag_lead='+encodeURIComponent(d.uid);var w=null;try{w=W.open(u,'_blank');}catch(e){}if(!w)location.href=u;};});
  FVI=function(){if(!s.isConnected){document.removeEventListener('visibilitychange',FVI);W.removeEventListener('focus',FVI);return;}if(document.hidden)return;
   LST.recarregar(true).then(function(L){var ids=(L||[]).map(function(x){return x.id;});if(ANT){var nv=(L||[]).filter(function(x){return ANT.indexOf(x.id)<0&&x.tem_pdf;}).map(function(x){return x.id;});
    if(nv.length){LST.marcar(nv);toast(nv.length>1?nv.length+' simulações novas marcadas para ir no e-mail':'Simulação nova marcada para ir no e-mail','ok');}}ANT=ids;});};
  document.addEventListener('visibilitychange',FVI);W.addEventListener('focus',FVI);}
 else{var _fr=$('.c7fr',s);if(_fr)_fr.remove();}
 var sai=function(cancelou){if(fechou)return;fechou=true;W.closeSheet();if(cancelou&&op.cancela)op.cancela();};
 $('[data-c7="x"]',s).onclick=function(){sai(true);};var xb=$('.x',s);if(xb)xb.onclick=function(){sai(true);};var ov=$('#ov');if(ov)ov._close=function(){sai(true);};
 quemEnvia().then(function(e){var v=$('#c7via',s);if(v&&e)v.textContent=viaTxt(e);});
 jaEnviadas(d).then(function(l){L=l.filter(function(o){return o.fonte==='arq'||(o.x&&(o.x.arquivo_path||o.x.url||o.x.texto)&&!/^Enviada/.test(o.x.titulo||''));});
  var sel=$('#c7dc',s);if(!sel)return;
  if(!L.length){sel.innerHTML='<option value="">Este card ainda não tem proposta anexada</option>';$('#c7er',s).innerHTML='<div class="c7w">Este card ainda não tem proposta anexada. Anexe a '+(tipo==='completa'?'completa':'resumida')+' no card ou mande só as simulações marcadas acima.</div>';return;}
  var pref=-1;if(op.pref)L.forEach(function(o,i){if(pref<0&&chProp(o)===op.pref)pref=i;});   /* GPT_27OUT: a confirmada vem selecionada */
  if(pref<0)L.forEach(function(o,i){var t=o.x?o.x.tipo:(/completo/.test(o.path)?'completa':'resumida');if(pref<0&&t===tipo)pref=i;});if(pref<0)pref=0;
  sel.innerHTML=L.map(function(o,i){return '<option value="'+i+'"'+(i===pref?' selected':'')+'>'+e4(o.t)+(o.q?' · '+new Date(o.q).toLocaleDateString('pt-BR'):'')+'</option>';}).join('')+'<option value="-1">Sem proposta (só as simulações marcadas)</option>';});
 var doc=function(){var o=L[+($('#c7dc',s).value||-1)];return o||null;};
 $('[data-c7="ok"]',s).onclick=function(){var b=this,para=$('#c7pa',s).value.trim(),o=doc(),er=$('#c7er',s);
  if(!emailOk(para)){er.innerHTML='<div class="c7w er">Informe um e-mail válido do cliente.</div>';$('#c7pa',s).focus();return;}
  if(!o&&!FRS.length){er.innerHTML='<div class="c7w er">Escolha a proposta ou marque uma simulação para ir no e-mail.</div>';return;}
  var corpo={lead_id:d.uid,para:para,tipo:tipo,assunto:$('#c7as',s).value.trim(),mensagem:$('#c7ms',s).value.trim()};
  if(o){if(o.fonte==='arq'){corpo.arquivo_path=o.path;corpo.titulo=o.t;}else corpo.doc_id=o.x.id;}if(FRS.length)corpo.ferr_ids=FRS.slice(0,10);
  b.disabled=true;b.innerHTML=ic('send')+'Enviando…';er.innerHTML='';
  api('/api/proposta/enviar',corpo).then(function(r){var j=(r&&r.data)||{};
   if(!r||!r.ok||!j.ok){b.disabled=false;b.innerHTML=ic('send')+'Enviar e-mail';er.innerHTML='<div class="c7w er">'+e4(j.erro||j.error||'Não consegui enviar agora.')+'</div>';return;}
   if(!d.email){d.email=para;W.XL[d.uid]=Object.assign(W.XL[d.uid]||{},{email:para});}
   var _ns=FRS.length,_st=_ns?_ns+' simulaç'+(_ns>1?'ões':'ão'):'';
   regEnvio(d,(o?'Proposta '+(tipo==='completa'?'completa':'resumida')+(_ns?' + '+_st:'')+' enviada':_st+' enviada'+(_ns>1?'s':''))+' por e-mail para '+para+((j.cc&&j.cc.length)?' (cópia: '+j.cc.join(', ')+')':'')+' · '+(j.nome||eu())+' · '+agora());
   fechou=true;W.closeSheet();toast('E-mail enviado para '+para,'send');if(op.depois)op.depois({para:para,via:j.via,doc:o?o.t:'Simulações das ferramentas'});});};
 var wb=$('[data-c7="wa"]',s);if(wb)wb.onclick=async function(){var o=doc(),t=telDig(d),er=$('#c7er',s);
  if(!t){er.innerHTML='<div class="c7w er">O card não tem o WhatsApp do cliente.</div>';return;}
  var link='',temArq=false,corpoTx='';try{if(o){var p=o.fonte==='arq'?o.path:o.x.arquivo_path;if(p){temArq=true;var c=sb(),r=await c.storage.from('propostas').createSignedUrl(p,60*60*24*30);link=(r&&r.data&&r.data.signedUrl)||'';}else if(o.x&&o.x.url)link=o.x.url;else if(o.x&&o.x.texto)corpoTx=String(o.x.texto).trim();}}catch(e){}
  if(temArq&&!link){er.innerHTML='<div class="c7w er">Não consegui gerar o link da proposta agora. Tente de novo em instantes.</div>';return;}   /* GPT28_13: sem o link, a mensagem sairia sem a proposta */
  if(o&&!link&&!corpoTx){er.innerHTML='<div class="c7w er">Esta proposta não tem arquivo, link nem texto para ir na mensagem.</div>';return;}
  var txt=$('#c7ms',s).value.trim()+(link?'\n\n'+link:'')+(corpoTx?'\n\n'+corpoTx:'');   /* GPT28_13: proposta salva como texto vai no corpo da mensagem */
  var jw=null;try{jw=W.open('https://wa.me/'+t+'?text='+encodeURIComponent(txt),'_blank');}catch(e){}
  if(!jw){er.innerHTML='<div class="c7w er">O navegador não abriu o WhatsApp. Libere as janelas deste site e tente de novo.</div>';return;}
  /* GPT_27OUT: abrir o WhatsApp não é enviar — só registra depois que a pessoa confirma */
  fechou=true;W.closeSheet();
  setTimeout(function(){var s2=W.sheet('<div class="lbl c7lb">WhatsApp</div><h2 class="c7h">Você enviou a mensagem?</h2><p class="c7s">Abri o seu WhatsApp com a mensagem pronta para '+e4(nm(d))+'. Só registro no card depois que você confirmar o envio.</p><div class="c7f"><button class="btn ol" data-c7="nao">Ainda não</button><span class="sp"></span><button class="btn gd" data-c7="sim">'+ic('send')+'Sim, enviei</button></div>',440);
   s2.classList.add('c7');
   $('[data-c7="nao"]',s2).onclick=function(){W.closeSheet();toast('Nada registrado. Quando enviar, marque no card.','chat');if(op.cancela)op.cancela();};
   $('[data-c7="sim"]',s2).onclick=async function(){this.disabled=true;
    if(o)try{await salvaDoc(d,{tipo:tipo,titulo:'Enviada pelo WhatsApp: '+o.t,arquivo_path:o.fonte==='arq'?o.path:(o.x.arquivo_path||null),url:o.x?o.x.url||null:null,enviado_em:new Date().toISOString(),enviado_por:W.realId()});}catch(e){toast('Registrei o envio, mas não consegui anexar a proposta ao card.','x');}
    regEnvio(d,'Proposta '+(tipo==='completa'?'completa':'resumida')+' enviada pelo WhatsApp de '+eu()+' · '+agora());
    W.closeSheet();toast('Envio registrado','chat');if(op.depois)op.depois({para:'WhatsApp',via:'whatsapp',doc:o&&o.t});};},350);};
 return s;}

/* convite da reunião (o card já gravou a data) */
function convite(d,para,reenviar){return api('/api/reuniao/convite',{lead_id:d.uid,para:para||undefined,reenviar:!!reenviar}).then(function(r){var j=(r&&r.data)||{};
  if(r&&r.ok&&j.ok){if(j.ja){toast('O convite desta data já foi enviado para '+j.para,'cal');return j;}if(j.nada)return j;
   if(!d.email&&j.para){d.email=j.para;W.XL[d.uid]=Object.assign(W.XL[d.uid]||{},{email:j.para});}
   regEnvio(d,'Convite da reunião enviado por e-mail para '+j.para+((j.cc&&j.cc.length)?' (cópia: '+j.cc.join(', ')+')':'')+' · '+agora());
   toast('Convite enviado para '+j.para,'cal');return j;}
  toast(j.erro==='sem_email'?'Sem e-mail do cliente: o convite não foi enviado':('O convite não saiu: '+(j.erro||'tente de novo')),'x');return j;});}
function conviteSheet(d){var x=xl(d);
 var s=W.sheet('<div class="lbl c7lb">Reunião agendada</div><h2 class="c7h">Enviar o convite para '+e4(nm(d))+'</h2><p class="c7s">Reunião '+e4(dtBR(x.reuniao_em))+'. O convite vai no seu nome e o Gabriel recebe junto. Se a data mudou, o cliente recebe a atualização.</p>'+
  '<div class="fi"><label>E-mail do cliente</label><input type="email" id="c7cvm" placeholder="nome@email.com" value="'+e4(d.email||x.email||'')+'"></div><div class="c7x" id="c7cve"></div>'+
  '<div class="c7f"><button class="btn ol" data-c7="x">Cancelar</button><span class="sp"></span><button class="btn gd" data-c7="ok">'+ic('cal')+'Enviar convite</button></div>',480);
 s.classList.add('c7');$('[data-c7="x"]',s).onclick=function(){W.closeSheet();};
 $('[data-c7="ok"]',s).onclick=function(){var em=$('#c7cvm',s).value.trim();if(!emailOk(em)){$('#c7cve',s).innerHTML='<div class="c7w er">Informe um e-mail válido.</div>';return;}
  this.disabled=true;W.closeSheet();convite(d,em,true);};}
function reuniaoCampos(d){var x=xl(d);return '<div class="fi"><label>E-mail do cliente (para o convite)</label><input type="email" id="c7em" placeholder="nome@email.com" value="'+e4(d.email||x.email||'')+'"></div>'+
 '<label class="c7ck"><input type="checkbox" id="c7cv" checked><span>Mandar o convite por e-mail no meu nome (o Gabriel recebe junto)</span></label>';}

/* Ajustes: de onde saem os e-mails (o master define o e-mail da empresa de cada um) */
function painelEmail(v){var ref=$('#ajdev',v)||$('#ajcel',v)||$('#ajc',v);if(!ref||$('#ajmail',v))return;
 try{var rl=W.effRoleR?W.effRoleR():'';if(['master','lider','especialista'].indexOf(rl)<0)return;}catch(e){return;}
 var p=document.createElement('div');p.className='panel';p.id='ajmail';p.style.marginTop='18px';
 p.innerHTML='<div class="ph"><h3>'+ic('mail',18)+'E-mail das propostas e convites</h3></div><div id="ajml"><div class="empty" style="padding:14px">Carregando…</div></div>';
 ref.parentNode.insertBefore(p,ref.nextSibling);
 quemEnvia(true).then(function(e){var l=$('#ajml',p);if(!e){l.innerHTML='<div class="empty" style="padding:14px">Não consegui falar com o robô agora.</div>';return;}
  var u=e.eu,h='<p style="font-size:13px;color:var(--mut);line-height:1.55;margin-bottom:10px">'+e4(viaTxt(e))+(u.modo==='google'?'':' Quando o Google da empresa estiver ligado, sai direto da sua caixa e o convite entra na sua agenda com link do Meet.')+'</p>';
  if(e.equipe&&!(W.RO&&W.RO())){h+='<div class="lbl" style="margin:10px 0 4px">E-mail da empresa de cada pessoa</div><p style="font-size:12.5px;color:var(--mut);line-height:1.5;margin:0 0 8px">A resposta dos clientes de cada pessoa vai para o e-mail dela'+(copiaTxt(e)?', com cópia para o '+e4(copiaTxt(e)):'')+'.</p>'+e.equipe.map(function(q){
    var resp=q.email_empresa||q.email_login||'';
    return '<div class="ajmr"><div class="ajmn"><b>'+e4(q.nome||'')+'</b><small>'+(q.google?'<span style="color:var(--ok)">● Google ligado</span> · ':'')+'login '+e4(q.email_login||'—')+'</small></div>'+
     '<div class="ajmi"><input type="email" inputmode="email" autocapitalize="none" autocorrect="off" spellcheck="false" data-ue="'+e4(q.uid)+'" value="'+e4(q.email_empresa||'')+'" placeholder="nome@agionconsorcios.com.br">'+
     '<button class="btn sm gd" data-us="'+e4(q.uid)+'">Salvar</button></div>'+
     '<small class="ajmo" data-uo="'+e4(q.uid)+'">'+(resp?'A resposta dos clientes vai para <b>'+e4(resp)+'</b>':'Sem e-mail ainda')+'</small></div>';}).join('')+
    (e.google_pronto?'':'<p style="font-size:12px;color:var(--mut);margin-top:10px">O Google da empresa ainda não está ligado: por enquanto tudo sai do e-mail '+e4(e.smtp||'da Agion')+' com o nome de quem atende.</p>');}
  else if(e.eu&&!e.equipe){h+='<p style="font-size:12.5px;color:var(--mut);margin:0">Seu e-mail para as respostas: <b>'+e4(e.eu.resposta||'—')+'</b>. Quem define é o Gabriel, em Ajustes.</p>';}
  l.innerHTML=h;
  if(!document.getElementById('ajmcss')){var st=document.createElement('style');st.id='ajmcss';st.textContent='#ajmail .ajmr{display:grid;gap:6px;padding:12px 0;border-bottom:1px solid var(--line)}#ajmail .ajmr:last-of-type{border-bottom:0}#ajmail .ajmn b{display:block;font-size:13.5px}#ajmail .ajmn small{display:block;font-size:11.5px;color:var(--mut);margin-top:2px;word-break:break-all}#ajmail .ajmi{display:flex;gap:8px;align-items:center}#ajmail .ajmi input{flex:1;min-width:0;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:500 15px "DM Sans",system-ui}#ajmail .ajmi input:focus{outline:none;border-color:var(--gold)}#ajmail .ajmi .btn{flex:none}#ajmail .ajmo{font-size:11.5px;color:var(--mut);word-break:break-all}#ajmail .ajmo b{color:var(--ink)}#ajmail .ajmo.ok{color:var(--ok)}';document.head.appendChild(st);}
  function salva(uid){var i=$('[data-ue="'+uid+'"]',l),b=$('[data-us="'+uid+'"]',l),o=$('[data-uo="'+uid+'"]',l),em=i.value.trim().toLowerCase();
   if(em&&!emailOk(em)){toast('E-mail inválido','x');i.focus();return;}
   b.disabled=true;b.textContent='Salvando…';
   api('/api/esp/email',{uid:uid,email:em}).then(function(r){b.disabled=false;b.textContent='Salvar';
    if(r&&r.ok&&r.data&&r.data.ok){i.value=em;toast(em?'Salvo: a resposta dos clientes vai para '+em:'E-mail removido','ok');if(o){o.className='ajmo ok';o.innerHTML=em?'✓ Salvo. A resposta dos clientes vai para <b>'+e4(em)+'</b>'+(r.data.google?' · Google ligado':''):'✓ Removido';}EU=null;}
    else toast('Não consegui salvar'+((r&&r.data&&(r.data.erro||r.data.error))?': '+(r.data.erro||r.data.error):''),'x');});}
  $$('[data-us]',l).forEach(function(b){b.onclick=function(){salva(b.dataset.us);};});
  $$('[data-ue]',l).forEach(function(i){i.onkeydown=function(ev){if(ev.key==='Enter'){ev.preventDefault();i.blur();salva(i.dataset.ue);}};});});}

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
 '.c7c{max-width:100%;box-sizing:border-box;overflow:hidden;text-overflow:ellipsis}.c7c.c7d{display:flex;flex-direction:column;gap:1px;white-space:normal;border-radius:12px;padding:5px 10px 6px;line-height:1.25}.c7c.c7d b{font:700 10.5px/1.25 "DM Sans"}.c7c.c7d small{font:600 10px/1.25 "DM Sans";opacity:.82}'+
 '.c7c.f{border-style:dashed;background:transparent}.c7c.ok{background:rgba(63,143,106,.85);color:#fff;border-color:transparent}.c7c.am{background:rgba(229,201,123,.9);color:#3b2d06;border-color:transparent}.c7c.pt{background:rgba(14,124,123,.85);color:#fff;border-color:transparent}.c7c.rd{background:rgba(194,70,59,.88);color:#fff;border-color:transparent}'+
 '.dm .c7p{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:12px 0 4px;padding:10px 12px;border-radius:16px;background:color-mix(in srgb,currentColor 9%,transparent);border:1px solid color-mix(in srgb,currentColor 16%,transparent)}'+
 '.dm .c7p .sp{flex:1}.dm .c7pt{display:flex;flex-direction:column}.dm .c7pt small{opacity:.7;font-size:11px}.dm .c7pt b{font-size:13.5px}.dm .c7pb{padding:7px 12px!important;font-size:12.5px!important}'+
 '.c7ck{display:flex;align-items:flex-start;gap:10px;margin:2px 0 14px;font-size:13px;color:var(--ink);cursor:pointer;line-height:1.4}.c7ck input{width:18px;height:18px;margin-top:1px;accent-color:var(--gold);flex:none}.sheet.c7 .c7via{font-size:12.5px;margin:0 0 12px}'+
 '@media (max-width:860px){.c7f .btn{flex:1 1 auto}.c7f .sp{display:none}.dm .c7p .c7pb{flex:1 1 auto}}'+
 /* PAINEL_GRID_28OUT: título em cima e os botões numa grade do mesmo tamanho (nada sobra sozinho numa linha torta) */
 '.dm .c7p{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));align-items:stretch;gap:8px;padding:12px 12px 12px}'+
 '.dm .c7p .c7pt{grid-column:1/-1;margin:0 2px 2px}.dm .c7p .sp{display:none}'+
 '.dm .c7p .c7pb{width:100%;min-height:42px;margin:0;display:flex;align-items:center;justify-content:center;text-align:center;white-space:normal;line-height:1.25}'+
 '@media (max-width:640px){.dm .c7p{grid-template-columns:1fr 1fr}}';
 document.head.appendChild(s);}

/* ---------- tutorial: 1 passo por pop-up ---------- */
function vis(e){if(!e)return false;var r=e.getBoundingClientRect();return r.width>0&&r.height>0;}
function colQ(k){return function(){var c=$('#kb .col[data-col="'+k+'"]');return c?($('.ch',c)||c):null;};}
function vaiCol(k){return function(){try{if(W.F&&W.F.modo!=='quadro')W.F.modo='quadro';if(W.cur!=='crm')W.go('crm');}catch(e){}
 setTimeout(function(){var kb=$('#kb'),c=kb&&$('.col[data-col="'+k+'"]',kb);if(kb&&c){try{kb.scrollTo({left:Math.max(0,c.offsetLeft-12),behavior:'smooth'});}catch(e){kb.scrollLeft=c.offsetLeft-12;}}
  var b=$('#kbs button[data-i="'+ORDEM.indexOf(k)+'"]');if(b&&W.isMob&&W.isMob())b.click();},W.cur==='crm'?60:700);};}
var TOUR={id:'t-crm7',page:'crm',navk:'crm',v:2,g:'Comercial',title:'CRM em 7 etapas',inv:'Como funcionam os pop-ups do CRM',
 desc:'Cada etapa do CRM pergunta o que a Alice precisa saber. Nada trava: todo pop-up tem “Pular por agora”.',
 abas:['Contato feito','Estudo/Simulação','Reunião agendada','Diagnóstico','Proposta enviada','Fechado','Preencher depois'],
 steps:[
  {act:vaiCol('0'),t:null,title:'O CRM em 7 etapas',text:'Quando o card entra numa etapa (arrastando, pela régua do card aberto ou pelas setas), abre um pop-up curto com o que a Alice precisa saber para seguir sozinha. Em Novo lead não abre nada.'},
  {a:0,act:vaiCol('1'),t:colQ('1'),wait:3000,title:'Contato feito: teve resposta?',text:'Depois de chamar o cliente no seu WhatsApp, marque: Respondeu (você conduz e a Alice para o WhatsApp dela), Não respondeu (a Alice volta a chamar na hora) ou Ainda vou ver (em 4 h úteis chega um lembrete).'},
  {a:1,act:vaiCol('2'),t:colQ('2'),wait:3000,title:'Estudo/Simulação: a proposta resumida',text:'Anexe a resumida: importe do computador, cole o texto, gere no Gerador de propostas ou escolha uma já enviada. Com ela, a Alice cita crédito, parcela e prazo nos follow-ups. Depois de anexar, já dá para mandar ao cliente por e-mail (no seu nome, com a sua assinatura) ou pelo seu WhatsApp.'},
  {a:2,act:vaiCol('agd'),t:colQ('agd'),wait:3000,title:'Reunião agendada: data e hora',text:'Informe quando é a reunião, o link (Meet ou Zoom) e se é a 1ª ou a 2ª. A Alice confirma e manda os lembretes de 3 h, 15 min e na hora, e o convite vai por e-mail no seu nome, com o Gabriel junto.'},
  {a:3,act:vaiCol('dia'),t:colQ('dia'),wait:3000,title:'Diagnóstico: compareceu?',text:'Se faltou, o card volta para Reunião agendada e a Alice entra na remarcação. Se compareceu, anexe a proposta completa: ela não vai para o cliente, serve para a Alice saber o que foi montado.'},
  {a:4,act:vaiCol('3'),t:colQ('3'),wait:3000,title:'Proposta enviada',text:'Envie pela plataforma: o e-mail sai no seu nome, com a sua assinatura e a proposta anexada, e fica no card. Se já mandou por fora, registre e, se quiser, informe quando ele deve decidir.'},
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
 try{if(W.R&&W.R.ajustes&&!W.R.ajustes.__em){var _raE=W.R.ajustes;W.R.ajustes=function(v){var r=_raE.apply(this,arguments);try{painelEmail(v);}catch(e){console.warn('[email]',e);}return r;};W.R.ajustes.__em=1;}}catch(e){}   /* EMAIL_ESPEC_23OUT */
 W.CRM7E={compoe:compoe,convite:convite,quemEnvia:quemEnvia};
 (function rt(n){if(!registraTour()&&n<60)setTimeout(function(){rt(n+1);},250);})(0);
 try{if(W.cur==='crm'&&$('#kb'))W.renderBoard(true);}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',liga);else liga();
})();
