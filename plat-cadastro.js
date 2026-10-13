/* ===================== CADASTRO ÚNICO (13/out/2026) =====================
   Uma pessoa = um cadastro. Leads, clientes e captação ficam ligados pelo
   telefone (DDD + 8 últimos dígitos) ou CPF. A origem (Agion x colaborador)
   é fixada na primeira entrada; o banco faz o vínculo (trigger cadastro_vincular).
   Aqui: consulta antes de criar, aba "Cadastro" (master/líder) e ações do master. */
(function(){
  'use strict';
  var _q='', _f='todos', _n=60, _cartasPorCli=null;

  var EMRX=/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
  function emailDe(t){ var m=String(t||'').match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/); return m?m[0].toLowerCase():''; }
  function telKey(t){ var d=String(t||'').replace(EMRX,'').replace(/\D/g,''); if(/^55/.test(d)&&(d.length===12||d.length===13)) d=d.slice(2); if(d.length<8) return ''; if(d.length===10||d.length===11) return d.slice(0,2)+d.slice(-8); return d.slice(-8); }
  function cpfLimpo(t){ var x=String(t||'').replace(/\D/g,''); return (x.length===11||x.length===14)?x:''; }
  function cpfFmt(t){ var x=cpfLimpo(t); if(x.length===11) return x.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4'); if(x.length===14) return x.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,'$1.$2.$3/$4-$5'); return String(t||''); }
  function telFmt(t){ var d=String(t||'').replace(/\D/g,''); if(/^55/.test(d)&&d.length>=12) d=d.slice(2); if(d.length===11) return '('+d.slice(0,2)+') '+d.slice(2,7)+'-'+d.slice(7); if(d.length===10) return '('+d.slice(0,2)+') '+d.slice(2,6)+'-'+d.slice(6); return d; }
  function dBR(v){ if(!v) return ''; var d=new Date(v); if(isNaN(d)) return ''; return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+'/'+d.getFullYear(); }
  function pn(id){ var u=(typeof user==='function')?user(id):null; return ((u&&u.nome)||'—').split(' ')[0]; }
  function cadOn(){ return !!window._cadOn; }
  function cadOf(id){ return (db.cadastros||[]).find(function(k){return k.id===id;})||null; }
  function origemTxt(k){ if(!k) return ''; if(k.origem==='COLABORADOR') return 'Própria de '+((k.origem_por_nome||'').split(' ')[0]||pn(k.origem_por)); return 'Agion'+(k.origem_canal?' · '+k.origem_canal:''); }
  function origemChip(k){ if(!k) return ''; var col=k.origem==='COLABORADOR'; return '<span class="cad-chip '+(col?'cad-prop':'cad-ag')+'" title="Origem do cadastro (definida na primeira entrada)">'+(col?'👤 ':'🏢 ')+esc(origemTxt(k))+'</span>'; }

  /* consulta no banco (enxerga todo mundo, mesmo de outra carteira) */
  async function consulta(tel,cpf){
    if(!cadOn()||!supa) return null;
    if(!telKey(tel)&&!cpfLimpo(cpf)&&!emailDe(tel)) return null;
    try{ var em=emailDe(tel); var r=await supa.rpc('cadastro_consulta',{p_tel:tel||null,p_cpf:cpf||null,p_email:em||null}); return (r&&!r.error&&r.data&&r.data.found)?r.data:null; }catch(e){ return null; }
  }

  /* modal com WhatsApp + CPF (e nome, quando pedido) */
  function askTelCpf(o){ return new Promise(function(res){
    var old=document.getElementById('cadTC'); if(old) old.remove();
    var bx='width:100%;background:var(--card2);border:1px solid var(--line);color:var(--head);padding:10px 12px;border-radius:10px;font:inherit';
    var html='<div id="cadTC" style="position:fixed;inset:0;z-index:260;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px"><div style="background:var(--card);border:1px solid var(--line);border-radius:16px;max-width:440px;width:100%;padding:22px">'
      +'<h2 style="margin:0 0 6px;font-size:1.08rem;color:var(--head)">'+esc(o.title||'Contato do cliente')+'</h2>'
      +'<p class="note" style="margin:0 0 14px;white-space:pre-line">'+esc(o.msg||'')+'</p>'
      +(o.nome!==undefined?'<label style="display:block;margin-bottom:12px"><span style="display:block;font-size:.78rem;color:var(--muted);margin-bottom:5px">Nome</span><input id="cadTCn" value="'+esc(o.nome||'')+'" style="'+bx+'"></label>':'')
      +'<label style="display:block;margin-bottom:12px"><span style="display:block;font-size:.78rem;color:var(--muted);margin-bottom:5px">WhatsApp com DDD</span><input id="cadTCt" inputmode="tel" value="'+esc(o.tel||'')+'" placeholder="(51) 9...." style="'+bx+'"></label>'
      +'<label style="display:block;margin-bottom:16px"><span style="display:block;font-size:.78rem;color:var(--muted);margin-bottom:5px">CPF ou CNPJ (opcional)</span><input id="cadTCc" inputmode="numeric" value="'+esc(o.cpf?cpfFmt(o.cpf):'')+'" placeholder="000.000.000-00" style="'+bx+'"></label>'
      +'<div style="display:flex;flex-direction:column;gap:10px"><button class="btn btn-gold" id="cadTCok" style="width:100%">'+esc(o.ok||'Continuar')+'</button><button class="btn btn-ghost btn-sm" id="cadTCx" style="width:100%;opacity:.75">Cancelar</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend',html);
    var el=document.getElementById('cadTC'); var done=function(v){ el.remove(); res(v); };
    document.getElementById('cadTCok').onclick=function(){
      var t=(document.getElementById('cadTCt').value||'').replace(/\D/g,''); var c=(document.getElementById('cadTCc').value||'').replace(/\D/g,'');
      if(c&&!cpfLimpo(c)){ flash('CPF deve ter 11 dígitos (CNPJ 14)'); return; }
      if(t&&!telKey(t)){ flash('Telefone incompleto — use DDD + número'); return; }
      var n=document.getElementById('cadTCn'); done({tel:t,cpf:c,nome:n?n.value.trim():undefined}); };
    document.getElementById('cadTCx').onclick=function(){ done(null); };
    el.onclick=function(e){ if(e.target===el) done(null); };
    setTimeout(function(){ var i=document.getElementById(o.nome!==undefined?'cadTCn':'cadTCt'); if(i) i.focus(); },60);
  }); }

  /* antes de criar cliente: acha a pessoa e decide se acumula no cliente que já existe */
  async function checarCliente(tel,cpf){
    var k=await consulta(tel,cpf);
    if(!k) return {acao:'novo'};
    var clis=k.clientes||[]; var vis=clis.filter(function(c){return c.visivel;}); var inv=clis.filter(function(c){return !c.visivel;});
    var desde='No Cadastro desde '+dBR(k.criado_em)+' · origem: '+origemTxt(k)+'.';
    if(vis.length){
      var c=vis[0];
      var op=await chooseModal('Cliente já cadastrado', (k.nome||c.nome)+' já é cliente — '+c.nome+', '+c.cartas+' carta(s), responsável '+(c.owner_nome||'—').split(' ')[0]+'.\n'+desde+'\n\nA nova carta entra nesse mesmo cliente, sem abrir outro cadastro.','Adicionar ao cliente '+(c.nome||'').split(' ')[0],'É outra pessoa — criar novo cliente');
      if(!op) return null;
      if(op==='a') return {acao:'existente',clienteId:c.id,cad:k};
      logEvt('CADASTRO_IGNORADO','cadastros','Criou cliente novo mesmo com o telefone/CPF já cadastrado em '+(k.nome||''),{cadastro_id:k.id});
      return {acao:'novo',cad:null};
    }
    if(inv.length){
      await ask({title:'Cliente de outra carteira',msg:(k.nome||inv[0].nome)+' já é cliente da carteira de '+((inv[0].owner_nome||'outro colaborador').split(' ')[0])+' ('+inv[0].cartas+' carta(s)).\n'+desde+'\n\nPara registrar uma nova carta para essa pessoa, fale com o seu gestor — o cadastro fica com o responsável atual.',ok:'Entendi'});
      return null;
    }
    var ok=await ask({title:'Pessoa já está no Cadastro',msg:(k.nome||'Esse contato')+' já passou pela plataforma. '+desde+'\n\nO novo cliente fica ligado a esse cadastro (a origem não muda).',ok:'Continuar'});
    if(!ok) return null;
    return {acao:'novo',cad:k};
  }

  /* antes de criar lead manual */
  async function checarLead(tel,cpf){
    var k=await consulta(tel,cpf);
    if(!k) return {ok:true};
    var last=(typeof CRM_STAGES!=='undefined')?CRM_STAGES.length-1:4;
    var ativo=(k.leads||[]).find(function(l){ return !l.perdido && (l.stage||0)<last; });
    var cli=(k.clientes||[])[0];
    var desde='No Cadastro desde '+dBR(k.criado_em)+' · origem: '+origemTxt(k)+'.';
    if(ativo && !isMaster() && ativo.owner_id!==meId()){
      await ask({title:'Contato já está no CRM',msg:(k.nome||'Esse contato')+' já está em atendimento com '+((ativo.owner_nome||'outro colaborador').split(' ')[0])+'.\n'+desde+'\n\nNão dá para abrir outro lead para a mesma pessoa.',ok:'Entendi'});
      return {ok:false};
    }
    var extra=cli?('\nJá é cliente ('+cli.cartas+' carta(s), responsável '+((cli.owner_nome||'—').split(' ')[0])+').'):(ativo?('\nJá existe um lead ativo com '+((ativo.owner_nome||'—').split(' ')[0])+'.'):'');
    var ok=await ask({title:'Pessoa já está no Cadastro',msg:(k.nome||'Esse contato')+' já passou pela plataforma. '+desde+extra+'\n\nO lead novo fica ligado a esse cadastro e a origem continua a mesma.',ok:'Criar lead mesmo assim'});
    return {ok:!!ok,cad:k};
  }

  /* ---------- aba Cadastro ---------- */
  function linhas(){
    var last=(typeof CRM_STAGES!=='undefined')?CRM_STAGES.length-1:4;
    var cliNome={}; (db.clients||[]).forEach(function(c){ var n=String(c.nome||'').trim().toLowerCase(); if(n) cliNome[n]=(cliNome[n]||[]).concat(c.cadastroId||''); });
    return (db.cadastros||[]).map(function(k){
      var leads=(db.crm||[]).filter(function(l){return l.cadastroId===k.id;});
      var inbox=(db.inbox||[]).filter(function(x){return x.cadastroId===k.id&&!x.importado;});
      var clis=(db.clients||[]).filter(function(c){return c.cadastroId===k.id;});
      var ativos=leads.filter(function(l){return !l.perdido&&(l.stage||0)<last;});
      var ganhos=leads.filter(function(l){return !l.perdido&&(l.stage||0)>=last;});
      var nCartas=clis.reduce(function(a,c){return a+((_cartasPorCli&&_cartasPorCli[c.id])||0);},0);
      var status=clis.length?'cliente':(ativos.length?'lead':(ganhos.length?'ganho':(leads.length?'perdido':(inbox.length?'captacao':'semvinc'))));
      var resp=clis.length?clis[0].ownerId:(ativos.length?ativos[ativos.length-1].ownerId:(leads.length?leads[leads.length-1].ownerId:null));
      var alertas=[];
      if(clis.length>1) alertas.push(clis.length+' fichas de cliente');
      var hist=k.historico||[];
      var t0=new Date(k.criado_em).getTime()+120000;
      var rec=hist.filter(function(h){ if(h.op!=='INSERT'||!h.por) return false; if(new Date(h.quando).getTime()<=t0) return false; var a=(typeof acc==='function')?acc(h.por):null; return a&&(a.role==='especialista'||a.role==='lider')&&(k.origem==='EMPRESA'||h.por!==k.origem_por); });
      if(rec.length) alertas.push('Registrado de novo por '+pn(rec[rec.length-1].por));
      var nk=String(k.nome||'').trim().toLowerCase();
      if(!k.tel_chave&&!k.cpf&&nk&&(cliNome[nk]||[]).some(function(cid){return cid&&cid!==k.id;})) alertas.push('Possível duplicado de um cliente (sem telefone/CPF)');
      return {k:k,leads:leads,clis:clis,ativos:ativos,status:status,resp:resp,alertas:alertas,nCartas:nCartas};
    }).sort(function(a,b){ return new Date(b.k.criado_em)-new Date(a.k.criado_em); });
  }
  function filtrar(L){
    var q=_q, qd=q.replace(/\D/g,'');
    return L.filter(function(r){
      if(_f==='clientes'&&r.status!=='cliente') return false;
      if(_f==='leads'&&r.status!=='lead') return false;
      if(_f==='agion'&&r.k.origem!=='EMPRESA') return false;
      if(_f==='proprios'&&r.k.origem!=='COLABORADOR') return false;
      if(_f==='atencao'&&!r.alertas.length) return false;
      if(!q) return true;
      if(String(r.k.nome||'').toLowerCase().indexOf(q)>=0) return true;
      if(String(r.k.email||'').toLowerCase().indexOf(q)>=0) return true;
      if(qd.length>=3&&(String(r.k.tel||'').indexOf(qd)>=0||String(r.k.cpf||'').indexOf(qd)>=0)) return true;
      return false;
    });
  }
  var ST={cliente:['Cliente','cad-st-cli'],lead:['Lead em andamento','cad-st-lead'],ganho:['Ganho','cad-st-cli'],perdido:['Lead perdido','cad-st-off'],captacao:['Na captação','cad-st-lead'],semvinc:['Lead excluído','cad-st-off']};
  function rowHtml(r){
    var k=r.k, st=ST[r.status]||ST.semvinc;
    var sub=[]; if(k.tel) sub.push('📱 '+esc(telFmt(k.tel))); if(k.cpf) sub.push('CPF '+esc(cpfFmt(k.cpf))); sub.push('desde '+dBR(k.criado_em)); if(r.resp) sub.push('responsável '+esc(pn(r.resp)));
    return '<div class="cad-row" onclick="cadAbrir(\''+k.id+'\')"><div class="cad-main"><div class="cad-nome">'+esc(k.nome||'(sem nome)')+' '+origemChip(k)+'</div><div class="note cad-sub">'+sub.join(' · ')+'</div>'
      +(r.alertas.length?'<div class="cad-alert">⚠ '+esc(r.alertas.join(' · '))+'</div>':'')+'</div>'
      +'<div class="cad-side"><span class="cad-st '+st[1]+'">'+st[0]+(r.status==='cliente'&&_cartasPorCli?' · '+r.nCartas+' carta'+(r.nCartas===1?'':'s'):'')+'</span></div></div>';
  }
  function listHtml(){
    var L=filtrar(linhas()); var shown=L.slice(0,_n);
    return (shown.map(rowHtml).join('')||'<p class="note" style="padding:14px 4px">Nenhuma pessoa encontrada.</p>')
      +(L.length>_n?'<div style="text-align:center;margin:14px 0 8px"><button class="btn btn-ghost" onclick="cadMais()">Carregar mais ('+(L.length-_n)+' restantes)</button></div>':'');
  }
  function kpisHtml(){
    var L=linhas(); var cnt=function(f){return L.filter(f).length;};
    var box=function(lab,v,f){ return '<div class="kpi'+(_f===f?' grad':'')+'" style="cursor:pointer" onclick="cadFiltro(\''+f+'\')"><div class="lab">'+lab+'</div><b>'+v+'</b></div>'; };
    return '<div class="kpis">'+box('Pessoas no cadastro',L.length,'todos')+box('Clientes',cnt(function(r){return r.status==='cliente';}),'clientes')+box('Leads em andamento',cnt(function(r){return r.status==='lead';}),'leads')
      +box('Origem Agion',cnt(function(r){return r.k.origem==='EMPRESA';}),'agion')+box('Próprios de colaboradores',cnt(function(r){return r.k.origem==='COLABORADOR';}),'proprios')+box('⚠ Atenção',cnt(function(r){return r.alertas.length>0;}),'atencao')+'</div>';
  }
  function paint(){ var k=document.getElementById('cadKpis'); if(k) k.innerHTML=kpisHtml(); var l=document.getElementById('cadList'); if(l) l.innerHTML=listHtml(); }
  async function contarCartas(){ try{ var r=await supa.from('cartas').select('cliente_id'); var m={}; (r.data||[]).forEach(function(x){ m[x.cliente_id]=(m[x.cliente_id]||0)+1; }); _cartasPorCli=m; }catch(e){ _cartasPorCli=_cartasPorCli||{}; } }
  async function renderCadastro(C){
    setTop('Cadastro','Todas as pessoas que já passaram pela plataforma','');
    if(!cadOn()){ C.innerHTML='<div class="panel"><p class="note">O Cadastro único ainda não está ativo no banco de dados.</p></div>'; return; }
    _n=60;
    C.innerHTML='<div class="banner cad-ban"><span>Cada pessoa aparece uma vez só. Quando ela volta (novo lead, nova carta), a plataforma liga ao mesmo cadastro pelo telefone, CPF ou e-mail. A <b>origem</b> (Agion ou própria do colaborador) é marcada na primeira entrada e não muda sozinha.</span></div>'
      +'<div id="cadKpis">'+kpisHtml()+'</div>'
      +'<div style="margin-bottom:14px"><input id="cadBusca" value="'+esc(_q)+'" placeholder="Buscar por nome, telefone, CPF ou e-mail…" aria-label="Buscar no cadastro" oninput="cadBuscar(this.value)" style="width:100%;background:var(--card2);border:1px solid var(--line);color:var(--head);padding:11px 14px;border-radius:10px;font:inherit"></div>'
      +'<div class="panel cad-panel" id="cadList">'+listHtml()+'</div>';
    if(!_cartasPorCli){ await contarCartas(); if(view.page==='cadastro') paint(); }
  }
  window.cadBuscar=function(v){ _q=String(v||'').toLowerCase().trim(); _n=60; var l=document.getElementById('cadList'); if(l) l.innerHTML=listHtml(); };
  window.cadFiltro=function(f){ _f=(_f===f&&f!=='todos')?'todos':f; _n=60; paint(); };
  window.cadMais=function(){ _n+=60; var l=document.getElementById('cadList'); if(l) l.innerHTML=listHtml(); };

  /* ---------- ficha da pessoa ---------- */
  function fechar(){ var m=document.getElementById('cadMd'); if(m) m.remove(); }
  window.cadFechar=fechar;
  window.cadAbrir=function(id){
    var r=linhas().find(function(x){return x.k.id===id;}); if(!r) return; var k=r.k; fechar();
    var stg=function(l){ return l.perdido?'Perdido':((typeof CRM_STAGES!=='undefined'&&CRM_STAGES[l.stage||0])||('Etapa '+(l.stage||0))); };
    var cliRows=r.clis.map(function(c){ return '<div class="netrow"><span><b style="color:var(--head)">'+esc(c.nome)+'</b><br><span class="note">responsável '+esc(pn(c.ownerId))+(_cartasPorCli?' · '+((_cartasPorCli[c.id])||0)+' carta(s)':'')+(c.tel?' · 📱 '+esc(telFmt(c.tel)):'')+'</span></span><span style="display:flex;gap:6px"><button class="btn btn-ghost btn-sm" onclick="cadFechar();openCartas(\''+c.id+'\')">🎫 Cartas</button></span></div>'; }).join('');
    var leadRows=r.leads.slice().sort(function(a,b){return (a.criadoEm||0)-(b.criadoEm||0);}).map(function(l){ return '<div class="netrow"><span><b style="color:var(--head)">'+esc(l.nome)+'</b><br><span class="note">'+dBR(l.criadoEm)+' · '+esc(stg(l))+' · com '+esc(pn(l.ownerId))+'</span></span><span><button class="btn btn-ghost btn-sm" onclick="cadFechar();openLead(\''+l.id+'\')">Abrir</button></span></div>'; }).join('');
    var TIPO={leads:'Lead',clientes:'Cliente',inbox:'Captação',unificado:'Cadastro unificado'};
    var _vistos={};
    var hist=(k.historico||[]).slice().sort(function(a,b){return new Date(a.quando)-new Date(b.quando);}).filter(function(h){ if(h.tipo==='unificado') return true; var key=h.tipo+'|'+(h.ref||'')+'|'+(h.op||''); if(_vistos[key]) return false; _vistos[key]=1; return true; }).map(function(h){
      var t=TIPO[h.tipo]||h.tipo; var quem=h.por?(' por '+pn(h.por)):(h.tipo==='inbox'?' (captação)':'');
      var acao=h.tipo==='unificado'?'':(h.op==='UPDATE'?' com dados atualizados':' registrado');
      return '<div class="cad-h"><span class="cad-hd">'+dBR(h.quando)+'</span><span>'+esc(t)+acao+esc(quem)+(h.resp?' · responsável '+esc(pn(h.resp)):'')+'</span></div>'; }).join('');
    var acoes='';
    if(isMaster()){
      acoes='<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px">'
        +'<button class="btn btn-ghost btn-sm" onclick="cadEditar(\''+k.id+'\')">✏️ Editar dados</button>'
        +'<button class="btn btn-ghost btn-sm" onclick="cadOrigem(\''+k.id+'\')">🏷 Origem</button>'
        +(r.clis.length>1?'<button class="btn btn-gold btn-sm" onclick="cadUnificarClientes(\''+k.id+'\')">🔗 Unificar '+r.clis.length+' fichas de cliente</button>':'')
        +'<button class="btn btn-ghost btn-sm" onclick="cadUnificarCom(\''+k.id+'\')">🔗 Unificar com outro cadastro</button></div>';
    }
    var html='<div id="cadMd" style="position:fixed;inset:0;z-index:220;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px" onclick="if(event.target===this)cadFechar()"><div style="background:var(--card);border:1px solid var(--line);border-radius:16px;max-width:600px;width:100%;max-height:90vh;overflow:auto;padding:22px">'
      +'<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:8px"><h2 style="margin:0;font-size:1.12rem">'+esc(k.nome||'(sem nome)')+'</h2><button class="btn btn-ghost btn-sm" onclick="cadFechar()">Fechar</button></div>'
      +'<div style="margin-bottom:14px">'+origemChip(k).replace('margin-left:6px','')+'</div>'
      +'<div class="cad-dados"><div><span>WhatsApp</span><b>'+(k.tel?esc(telFmt(k.tel)):'—')+'</b></div><div><span>CPF/CNPJ</span><b>'+(k.cpf?esc(cpfFmt(k.cpf)):'—')+'</b></div><div><span>E-mail</span><b>'+(k.email?esc(k.email):'—')+'</b></div><div><span>No cadastro desde</span><b>'+dBR(k.criado_em)+'</b></div></div>'
      +(r.alertas.length?'<div class="cad-alert" style="margin:12px 0 4px">⚠ '+esc(r.alertas.join(' · '))+'</div>':'')
      +'<h3 class="cad-h3">Cliente</h3>'+(cliRows||'<p class="note">Ainda não é cliente.</p>')
      +'<h3 class="cad-h3">Leads</h3>'+(leadRows||'<p class="note">Nenhum lead na base hoje.</p>')
      +'<h3 class="cad-h3">Histórico</h3>'+(hist||'<p class="note">Sem registros.</p>')
      +acoes+'</div></div>';
    document.body.insertAdjacentHTML('beforeend',html);
  };

  async function recarregar(id){ try{ await loadCloud(); }catch(e){} _cartasPorCli=null; await contarCartas(); if(view.page==='cadastro') paint(); if(id&&cadOf(id)) window.cadAbrir(id); }

  function escolher(titulo,msg,itens){ return new Promise(function(res){
    var old=document.getElementById('cadPick'); if(old) old.remove();
    var html='<div id="cadPick" style="position:fixed;inset:0;z-index:270;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px"><div style="background:var(--card);border:1px solid var(--line);border-radius:16px;max-width:460px;width:100%;max-height:86vh;overflow:auto;padding:22px"><h2 style="margin:0 0 6px;font-size:1.05rem;color:var(--head)">'+esc(titulo)+'</h2>'+(msg?'<p class="note" style="margin:0 0 12px">'+esc(msg)+'</p>':'')+'<div style="display:flex;flex-direction:column;gap:8px">'
      +itens.map(function(x){return '<button class="btn btn-ghost" data-id="'+esc(x.id)+'" style="width:100%;justify-content:flex-start;text-align:left">'+esc(x.lb)+'</button>';}).join('')
      +'<button class="btn btn-ghost btn-sm" data-id="" style="width:100%;opacity:.75">Cancelar</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend',html); var m=document.getElementById('cadPick');
    m.addEventListener('click',function(e){ var b=e.target.closest('[data-id]'); if(!b&&e.target!==m) return; var v=b?b.getAttribute('data-id'):''; m.remove(); res(v||null); });
  }); }

  window.cadEditar=async function(id){
    var k=cadOf(id); if(!k||!isMaster()) return;
    var v=await askTelCpf({title:'Editar cadastro',msg:'Telefone e CPF identificam a pessoa. Se já existir outro cadastro com eles, use "Unificar com outro cadastro".',nome:k.nome||'',tel:k.tel||'',cpf:k.cpf||'',ok:'Salvar'});
    if(!v) return;
    var cpf=cpfLimpo(v.cpf)||null, tel=(v.tel||'').replace(/\D/g,'')||null;
    var dup=(cpf||tel)?await consulta(tel,cpf):null;
    if(dup&&dup.id!==id){ await ask({title:'Já existe outro cadastro',msg:'Esse telefone/CPF já pertence ao cadastro de '+(dup.nome||'outra pessoa')+'. Se for a mesma pessoa, use "Unificar com outro cadastro".',ok:'Ok'}); return; }
    var r=await supa.from('cadastros').update({nome:v.nome||k.nome,tel:tel,tel_chave:tel?telKey(tel):null,cpf:cpf,atualizado_em:new Date().toISOString()}).eq('id',id);
    if(r&&r.error){ await ask({title:'Não foi possível salvar',msg:String(r.error.message||r.error),ok:'Ok'}); return; }
    logEvt('UPDATE','cadastros','Editou o cadastro de '+(v.nome||k.nome),{cadastro_id:id});
    flash('Cadastro atualizado'); fechar(); recarregar(id);
  };

  window.cadOrigem=async function(id){
    var k=cadOf(id); if(!k||!isMaster()) return;
    var op=await chooseModal('Origem do cadastro','Hoje: '+origemTxt(k)+'.\n\nA origem diz se a pessoa é lead da Agion ou cliente próprio de um colaborador (usada nas comissões).','🏢 Lead da Agion','👤 Cliente próprio de um colaborador');
    if(!op) return;
    var patch={origem:'EMPRESA',origem_por:null,atualizado_em:new Date().toISOString()};
    if(op==='b'){
      var equipe=(db.accounts||[]).filter(function(a){return a.real&&a.ativo!==false&&(a.role==='especialista'||a.role==='lider');}).sort(function(a,b){return (a.nome||'').localeCompare(b.nome||'');});
      if(!equipe.length){ flash('Nenhum colaborador ativo'); return; }
      var pid=await escolher('Cliente próprio de quem?','',equipe.map(function(a){return {id:a.id,lb:a.nome};}));
      if(!pid) return; patch.origem='COLABORADOR'; patch.origem_por=pid;
    }
    var r=await supa.from('cadastros').update(patch).eq('id',id);
    if(r&&r.error){ await ask({title:'Não foi possível salvar',msg:String(r.error.message||r.error),ok:'Ok'}); return; }
    logEvt('UPDATE','cadastros','Mudou a origem de '+(k.nome||'')+' para '+(patch.origem==='EMPRESA'?'Agion':'própria de '+pn(patch.origem_por)),{cadastro_id:id,origem:patch.origem});
    flash('Origem atualizada'); fechar(); recarregar(id);
  };

  window.cadUnificarClientes=async function(id){
    if(!isMaster()) return;
    var clis=(db.clients||[]).filter(function(c){return c.cadastroId===id;}); if(clis.length<2) return;
    var info=await supa.from('clientes').select('id,criado_em').in('id',clis.map(function(c){return c.id;}));
    var ord=(info.data||[]).sort(function(a,b){return new Date(a.criado_em)-new Date(b.criado_em);}).map(function(x){return x.id;});
    if(!ord.length) ord=clis.map(function(c){return c.id;});
    var manter=ord[0]; var nomeM=(clis.find(function(c){return c.id===manter;})||{}).nome||'';
    var ok=await ask({title:'Unificar fichas de cliente?',msg:'Fica só a ficha mais antiga de '+nomeM+'. As cartas, as vendas/comissões e o histórico das outras '+(ord.length-1)+' ficha(s) passam para ela, e as fichas repetidas são apagadas.',ok:'Unificar'});
    if(!ok) return;
    flash('Unificando…');
    for(var i=0;i<ord.length;i++){ if(ord[i]===manter) continue; var r=await supa.rpc('cliente_mesclar',{p_manter:manter,p_remover:ord[i]}); if(r&&r.error){ await ask({title:'Não foi possível unificar',msg:String(r.error.message||r.error),ok:'Ok'}); break; } }
    flash('Fichas unificadas'); fechar(); recarregar(id);
  };

  window.cadUnificarCom=async function(id){
    if(!isMaster()) return; var k=cadOf(id); if(!k) return;
    var t=await ask({title:'Unificar com outro cadastro',msg:'Digite o nome, telefone ou CPF da outra ficha da mesma pessoa:',input:true,ok:'Buscar'});
    if(!t||!t.trim()) return; var q=t.trim().toLowerCase(), qd=q.replace(/\D/g,'');
    var cand=(db.cadastros||[]).filter(function(x){ if(x.id===id) return false; if(String(x.nome||'').toLowerCase().indexOf(q)>=0) return true; return qd.length>=4&&(String(x.tel||'').indexOf(qd)>=0||String(x.cpf||'').indexOf(qd)>=0); }).slice(0,10);
    if(!cand.length){ flash('Nenhum outro cadastro encontrado'); return; }
    var pick=await escolher('Qual é a mesma pessoa?','Os vínculos da ficha escolhida passam para '+(k.nome||'este cadastro')+'. A origem mais antiga é mantida.',cand.map(function(x){return {id:x.id,lb:(x.nome||'(sem nome)')+(x.tel?' · '+telFmt(x.tel):'')+' · desde '+dBR(x.criado_em)};}));
    if(!pick) return;
    var r=await supa.rpc('cadastro_fundir',{p_manter:id,p_remover:pick});
    if(r&&r.error){ await ask({title:'Não foi possível unificar',msg:String(r.error.message||r.error),ok:'Ok'}); return; }
    flash('Cadastros unificados'); fechar(); recarregar(id);
  };

  /* estilos */
  var css='body.isApp .cad-ban{display:none}.cad-chip{display:inline-block;font-size:.68rem;font-weight:600;padding:3px 9px;border-radius:999px;margin-left:6px;vertical-align:middle;white-space:nowrap;text-transform:none;letter-spacing:0}'
   +'.cad-ag{background:rgba(31,158,139,.14);color:#5FCFBE;border:1px solid rgba(31,158,139,.35)}'
   +'.cad-prop{background:rgba(197,160,89,.14);color:#D9B56E;border:1px solid rgba(197,160,89,.4)}'
   +'body.light .cad-ag{color:#147A6B}body.light .cad-prop{color:#8A6A25}'
   +'.cad-panel{padding:6px 16px}.cad-row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:13px 2px;border-bottom:1px solid var(--line);cursor:pointer}.cad-row:last-child{border-bottom:0}.cad-row:hover .cad-nome{color:var(--gold)}'
   +'.cad-main{min-width:0;flex:1}.cad-nome{color:var(--head);font-weight:600;font-size:.95rem;overflow-wrap:anywhere}.cad-sub{font-size:.8rem;margin-top:3px;overflow-wrap:anywhere}'
   +'.cad-alert{font-size:.78rem;color:#E0A458;margin-top:4px}body.light .cad-alert{color:#A86A1C}.cad-side{flex-shrink:0;text-align:right}'
   +'.cad-st{display:inline-block;font-size:.72rem;font-weight:600;padding:4px 10px;border-radius:999px;white-space:nowrap}.cad-st-cli{background:rgba(31,158,139,.16);color:#5FCFBE}.cad-st-lead{background:rgba(92,134,168,.18);color:#9DBFDB}.cad-st-off{background:rgba(255,255,255,.06);color:var(--muted)}'
   +'body.light .cad-st-cli{color:#147A6B}body.light .cad-st-lead{color:#3D6687}body.light .cad-st-off{background:rgba(0,0,0,.05)}'
   +'.cad-dados{display:grid;grid-template-columns:1fr 1fr;gap:10px 16px}.cad-dados span{display:block;font-size:.72rem;color:var(--muted)}.cad-dados b{color:var(--head);font-weight:600;font-size:.9rem;overflow-wrap:anywhere}'
   +'.cad-h3{font-size:.86rem;color:var(--head);margin:18px 0 6px}.cad-h{display:flex;gap:10px;font-size:.82rem;color:var(--muted);padding:6px 0;border-bottom:1px solid var(--line)}.cad-hd{flex-shrink:0;color:var(--soft);min-width:78px}'
   +'.ccard .cad-chip{margin:0 0 8px}'
   +'@media(max-width:600px){.cad-row{flex-direction:column;align-items:flex-start;gap:6px}.cad-side{text-align:left}.cad-dados{grid-template-columns:1fr}}';
  var st=document.createElement('style'); st.id='cadCss'; st.textContent=css; document.head.appendChild(st);

  window.telKey=telKey; window.cpfLimpo=cpfLimpo; window.cpfFmt=cpfFmt; window.cadOf=cadOf; window.cadOrigemTxt=origemTxt; window.cadOrigemChip=origemChip;
  window.cadConsulta=consulta; window.cadAskTelCpf=askTelCpf; window.cadChecarCliente=checarCliente; window.cadChecarLead=checarLead;
  window.renderCadastro=renderCadastro;
})();
