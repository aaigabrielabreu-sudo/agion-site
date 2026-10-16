/* ==========================================================================
   Agion — plat-humano.js · Conversas: "você ou a Alice" (16/out/2026)
   - Faixa embaixo do cabeçalho da conversa: quem está atendendo, "Assumir"
     (pausa sem prazo) e "Devolver para a Alice". Servidor: {BOT_API}/api/humano.
     Se o servidor mandar alerta:true (lead pediu uma pessoa), a faixa avisa.
   - Etiquetas na lista: Novo lead · nome de quem atende · Cliente.
   - Quem vê o quê: especialista/líder também veem as conversas dos SEUS leads
     (antes só dos clientes); dono = campo responsavel do servidor, senão o
     dono do lead/cliente com o mesmo telefone. Master vê tudo.
   - Mensagem enviada pela equipe sai com o nome em negrito: "*Lisiane*\n\n…".
     O master escolhe se assina ou não (faixa da conversa).
   - Link de notificação: /plataforma?conv=<fone>&assumir=1#conversas abre a
     conversa e destaca "Assumir".
   - Exemplo fictício para o tutorial (AgionHumano.demo / demoOff).
   Camada aditiva: só envolve funções existentes (convRenderChat, convOpen,
   convRefreshChat, convRenderList, convPermitida, apiFetch, render).
   ========================================================================== */
(function(){
'use strict';
var W=window, D=document;
var ST={}, LAST={}, BUSY=false, DEMO=null, PULSE=null;

function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
function sleep(ms){ return new Promise(function(r){ setTimeout(r,ms); }); }
function phoneAtual(){ try{ return convState&&convState.phone; }catch(e){ return null; } }
function hora(v){ if(v==null||v==='') return ''; var d=(typeof v==='number')?new Date(v<1e12?v*1000:v):new Date(v); if(isNaN(d)) return ''; return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); }
function conta(id){ try{ return (db.accounts||[]).find(function(x){ return x.id===id; })||null; }catch(e){ return null; } }
function primeiro(n){ return String(n||'').trim().split(/\s+/)[0]||''; }
function nomeQuem(q){ if(!q) return ''; var a=conta(q); if(a) return primeiro(a.nome); return primeiro(q); }
function meId_(){ try{ return meId(); }catch(e){ return null; } }
function souEu(q){ if(!q) return false; if(q===meId_()) return true; var a=conta(meId_()); return !!(a&&a.nome&&String(q).toLowerCase()===String(a.nome).toLowerCase()); }
function meuNome(){ var a=conta(meId_()); return primeiro(a&&a.nome); }
function nomeDemo(){ var id=null; try{ id=effId(); }catch(e){} var a=conta(id||meId_()); return primeiro(a&&a.nome)||'Lisiane'; }
function ck(p){ try{ return convKey(p); }catch(e){ return String(p||''); } }
function papel(){ try{ return session.role; }catch(e){ return null; } }
function verComo(){ try{ return !!session.viewAs; }catch(e){ return false; } }

/* ---------- preferências (master: assinar ou não com o nome) ---------- */
function prefKey(){ try{ return 'agion:conversas:'+(session.userId||'anon'); }catch(e){ return 'agion:conversas:anon'; } }
function pref(){ try{ return JSON.parse(localStorage.getItem(prefKey())||'{}')||{}; }catch(e){ return {}; } }
function SB(){ try{ return W.supa||(typeof supa!=='undefined'?supa:null); }catch(e){ return null; } }
var prefLida=false;
async function lerPref(){ if(prefLida) return; prefLida=true; try{ var u=(await SB().auth.getUser()).data.user; if(!u) return; var r=await SB().from('tutorial_progresso').select('dados').eq('user_id',u.id).eq('contexto','conversas').maybeSingle(); if(r.data&&r.data.dados){ localStorage.setItem(prefKey(),JSON.stringify(Object.assign(pref(),r.data.dados))); pintar(); } }catch(e){} }
async function gravarPref(p){ try{ localStorage.setItem(prefKey(),JSON.stringify(p)); }catch(e){}
  try{ var u=(await SB().auth.getUser()).data.user; if(!u) return; await SB().from('tutorial_progresso').upsert({user_id:u.id,contexto:'conversas',dados:p,updated_at:new Date().toISOString()},{onConflict:'user_id,contexto'}); }catch(e){} }
function assina(){ var r=papel(); if(verComo()) return false; if(['master','lider','especialista'].indexOf(r)<0) return false; if(r==='master'&&pref().semNome) return false; return !!meuNome(); }
function comNome(t){ var n=meuNome(); if(!n) return t; var pre='*'+n+'*\n\n'; return String(t).indexOf(pre)===0?t:pre+t; }

/* ---------- estilos ---------- */
function css(){ if(D.getElementById('huCss')) return; var s=D.createElement('style'); s.id='huCss'; s.textContent=
 '.hu-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 14px;border-bottom:1px solid var(--line,rgba(255,255,255,.06));font-size:12.5px;background:rgba(14,124,123,.08)}'+
 '.hu-bar.on{background:rgba(197,160,89,.12)}.hu-bar.al{background:rgba(224,122,106,.14)}'+
 '.hu-dot{width:8px;height:8px;border-radius:50%;background:#2fbf8f;flex-shrink:0;box-shadow:0 0 0 3px rgba(47,191,143,.18)}'+
 '.hu-bar.on .hu-dot{background:var(--gold2,#d8b46a);box-shadow:0 0 0 3px rgba(197,160,89,.22)}.hu-bar.al .hu-dot{background:#e07a6a;box-shadow:0 0 0 3px rgba(224,122,106,.25)}'+
 '.hu-tx{flex:1 1 180px;min-width:0;color:var(--soft,#b9c7c6)}.hu-tx b{color:var(--head,#fff);font-weight:600}'+
 '.hu-bt{border:1px solid var(--line-gold,rgba(197,160,89,.4));background:transparent;color:var(--gold2,#d8b46a);border-radius:999px;padding:5px 12px;font:inherit;font-weight:600;cursor:pointer;white-space:nowrap}'+
 '.hu-bt:hover{background:rgba(197,160,89,.12)}.hu-bt[disabled]{opacity:.55;cursor:default}.hu-demo-bar .hu-bt[disabled]{opacity:1}'+
 '.hu-bt.alt{border-color:rgba(255,255,255,.18);color:var(--soft,#cfd8d7)}'+
 '.hu-bt.pulse{background:linear-gradient(135deg,#C5A059,#B08A45);color:#06171B;border-color:transparent;animation:huPulse 1.4s ease-in-out infinite}'+
 '@keyframes huPulse{0%,100%{box-shadow:0 0 0 0 rgba(197,160,89,.55)}50%{box-shadow:0 0 0 7px rgba(197,160,89,0)}}'+
 '.hu-sw{display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--soft,#b9c7c6);cursor:pointer;white-space:nowrap}.hu-sw input{accent-color:#C5A059;margin:0}'+
 '.hu-tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px}'+
 '.hu-tg{display:inline-flex;align-items:center;gap:4px;font-size:9.5px;line-height:1;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:3px 7px;border-radius:999px;border:1px solid rgba(255,255,255,.14);color:var(--soft,#b9c7c6);background:rgba(255,255,255,.04);white-space:nowrap}'+
 '.hu-tg.cli{color:#E2C48A;border-color:rgba(197,160,89,.5);background:rgba(197,160,89,.12)}'+
 '.hu-tg.nv{color:#8FD9CC;border-color:rgba(143,217,204,.45);background:rgba(14,124,123,.18)}'+
 '.hu-tg.ow::before{content:"";width:5px;height:5px;border-radius:50%;background:currentColor;opacity:.7}'+
 '.wa-item.hu-tg-on .wa-cli{display:none}'+
 '.hu-sigb{display:block;font-weight:700;color:var(--head,#fff);margin-bottom:6px}'+
 '.hu-demo .wa-it-nm::after,.hu-demo-chat .wa-chd-nm::after{content:"exemplo";margin-left:6px;font-size:9px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#E2C48A;border:1px dashed rgba(197,160,89,.5);border-radius:999px;padding:1px 6px;vertical-align:2px}'+
 'body.light .hu-bar{background:rgba(14,124,123,.06)}body.light .hu-bar.on{background:rgba(197,160,89,.14)}body.light .hu-tg{border-color:rgba(0,0,0,.14);background:rgba(0,0,0,.03)}body.light .hu-tg.nv{color:#0E7C7B}body.light .hu-tg.cli{color:#8A6A2C}'+
 '@media (max-width:640px){.hu-bar{padding:7px 12px;gap:8px}.hu-tx{flex:1 1 calc(100% - 26px)}}';
 D.head.appendChild(s); }

/* ---------- dono / etiquetas ---------- */
var IDX=null, IDXSIG='';
function indice(){ var sig=''; try{ sig=(db.crm||[]).length+'|'+(db.clients||[]).length; }catch(e){}
  if(IDX&&sig===IDXSIG) return IDX; IDX={}; IDXSIG=sig;
  try{ (db.crm||[]).forEach(function(l){ var k=ck(String(l.contato||'').split('·')[0]); if(!k||k.length<10) return; var cur=IDX[k]||{};
    var e={owner:l.ownerId,stage:+l.stage||0,perdido:!!l.perdido,criado:+l.criadoEm||0};
    if(!cur.lead||(cur.perdido&&!e.perdido)||(cur.perdido===e.perdido&&e.criado>cur.criado)){ cur.owner=e.owner; cur.stage=e.stage; cur.perdido=e.perdido; cur.criado=e.criado; cur.lead=true; }
    IDX[k]=cur; }); }catch(e){}
  try{ (db.clients||[]).forEach(function(c){ if(!c.tel) return; var k=ck(c.tel); var cur=IDX[k]||{}; cur.cliente=true; cur.clienteOwner=c.ownerId; IDX[k]=cur; }); }catch(e){}
  return IDX; }
function doServidor(key){ try{ return (convState.list||[]).find(function(c){ return ck(c.phone)===key; })||null; }catch(e){ return null; } }
function info(key){ var i=indice()[key]||{}, s=doServidor(key)||{};
  var owner=s.responsavel||s.owner_id||s.dono||i.owner||i.clienteOwner||null;
  if(!owner){ try{ var cl=(W._cartasCli||{})[key]; if(cl&&cl.length){ var c=(db.clients||[]).find(function(x){ return x.id===cl[0]; }); if(c) owner=c.ownerId; } }catch(e){} }
  var cliente=!!(i.cliente||s.cliente===true); if(!cliente){ try{ cliente=!!convClienteNome(key); }catch(e){} }
  var novo=!cliente&&(s.novo===true||(i.lead&&!i.perdido&&i.stage===0&&i.criado&&Date.now()-i.criado<7*864e5));
  var lead=!cliente&&!novo&&i.lead&&!i.perdido&&i.stage<4;
  return {owner:owner,cliente:cliente,novo:!!novo,lead:!!lead}; }
function tagsHtml(f){ var t='';
  if(f.cliente) t+='<span class="hu-tg cli">Cliente</span>'; else if(f.novo) t+='<span class="hu-tg nv">Novo lead</span>'; else if(f.lead) t+='<span class="hu-tg">Lead</span>';
  var n=f.owner?nomeQuem(f.owner):''; if(n) t+='<span class="hu-tg ow" title="Quem atende">'+esc(n)+'</span>';
  return t; }
function decorar(){ var el=D.getElementById('waItems'); if(!el) return; css();
  el.querySelectorAll('.wa-item:not(.hu-demo)').forEach(function(it){ if(it.__hu) return; it.__hu=1;
    var m=(it.getAttribute('onclick')||'').match(/convOpen\('([^']+)'\)/); if(!m) return;
    var t=tagsHtml(info(ck(m[1]))); if(!t) return; var mn=it.querySelector('.wa-it-main'); if(!mn) return;
    var d=D.createElement('div'); d.className='hu-tags'; d.innerHTML=t; mn.appendChild(d); it.classList.add('hu-tg-on'); });
  if(DEMO) demoLista(); }

/* ---------- faixa "você ou a Alice" ---------- */
function texto(s){
  if(!s) return {cls:'',html:'Carregando…'};
  if(s.alerta&&!s.ativo){ var h0=hora(s.alerta_ate||s.ate); return {cls:'al',html:'<b>O cliente pediu para falar com uma pessoa.</b> A Alice aguarda'+(h0?' até '+h0:' 2 minutos')+' — toque em Assumir.'}; }
  if(s.ativo){
    var q=s.quem?nomeQuem(s.quem):''; var quem=souEu(s.quem)?'Você':(q||'Alguém da equipe');
    if(s.fixo) return {cls:'on',html:'<b>'+esc(quem)+' no comando</b> · a Alice está pausada até alguém devolver a conversa.'};
    var h=hora(s.ate); return {cls:'on',html:'<b>'+esc(quem)+' no comando</b> · a Alice volta'+(h?' às '+h:' em até '+(s.janela_min||30)+' min')+' se ninguém responder.'};
  }
  return {cls:'',html:'<b>A Alice está atendendo.</b> Se você mandar uma mensagem, ela pausa por '+((s&&s.janela_min)||30)+' min.'};
}
function pintar(){
  if(DEMO) return;
  var mn=D.getElementById('waMain'); if(!mn) return; var hd=mn.querySelector('.wa-chd'); if(!hd) return;
  var ph=phoneAtual(); if(!ph) return; css();
  var s=ST[ph]; var t=texto(s);
  var bar=mn.querySelector('.hu-bar'); if(!bar){ bar=D.createElement('div'); hd.insertAdjacentElement('afterend',bar); }
  bar.className='hu-bar'+(t.cls?' '+t.cls:'');
  var pulse=(PULSE&&ck(PULSE)===ck(ph))||(s&&s.alerta&&!s.ativo);
  var bts='';
  if(s){ if(!s.ativo||!s.fixo) bts+='<button class="hu-bt'+(pulse?' pulse':'')+'" onclick="AgionHumano.assumir()" title="Pausa a Alice e o follow-up sem prazo, até você devolver">Assumir</button>';
         if(s.ativo) bts+='<button class="hu-bt alt" onclick="AgionHumano.devolver()" title="A Alice volta a responder agora">Devolver para a Alice</button>'; }
  if(papel()==='master'&&!verComo()) bts+='<label class="hu-sw" title="Suas mensagens chegam ao cliente com o seu nome em negrito em cima"><input type="checkbox" '+(pref().semNome?'':'checked')+' onchange="AgionHumano.assinar(this.checked)"> Assinar com meu nome</label>';
  bar.innerHTML='<span class="hu-dot" aria-hidden="true"></span><span class="hu-tx">'+t.html+'</span>'+bts;
  if(BUSY) bar.querySelectorAll('.hu-bt').forEach(function(b){ b.disabled=true; });
}
function assinaturaBolhas(){ var mn=D.getElementById('waMain'); if(!mn) return;
  mn.querySelectorAll('.wa-b.wa-out').forEach(function(b){ if(b.__sig) return; b.__sig=1;
    for(var n=b.firstChild;n;n=n.nextSibling){ if(n.nodeType===3){ var m=/^\*([^*\n]{1,40})\*\n\n?/.exec(n.nodeValue); if(m){ var sp=D.createElement('span'); sp.className='hu-sigb'; sp.textContent=m[1]; b.insertBefore(sp,n); n.nodeValue=n.nodeValue.slice(m[0].length); } return; } if(n.nodeType===1&&!n.classList.contains('wa-au')) return; } }); }
async function carregar(ph,forcar){
  if(!ph||typeof apiFetch!=='function'||DEMO) return;
  if(!forcar&&LAST[ph]&&Date.now()-LAST[ph]<25000){ pintar(); return; }
  LAST[ph]=Date.now();
  try{ var r=await apiFetch('/api/humano?phone='+encodeURIComponent(ph)); if(r&&r.ok&&r.data) ST[ph]=r.data; }catch(e){}
  if(phoneAtual()===ph) pintar();
}
async function acao(a){
  var ph=phoneAtual(); if(!ph||BUSY||DEMO) return;
  try{ if(typeof roGuard==='function'&&roGuard()) return; }catch(e){}
  BUSY=true; pintar();
  var r=null; try{ r=await apiFetch('/api/humano',{method:'POST',body:JSON.stringify({phone:ph,acao:a})}); }catch(e){}
  BUSY=false; if(a==='assumir') PULSE=null;
  if(!r||!r.ok){ try{ flash('Não deu certo: '+((r&&r.data&&r.data.error)||(r&&r.status)||'sem conexão com o robô')); }catch(e){} pintar(); return; }
  try{ flash(a==='assumir'?'Você assumiu a conversa. A Alice fica em silêncio.':'Conversa devolvida para a Alice.'); }catch(e){}
  await carregar(ph,true);
}

/* ---------- link da notificação: ?conv=<fone>&assumir=1 ---------- */
function guardarLink(){ try{ var q=new URLSearchParams(location.search); var c=q.get('conv'); if(!c) return;
  sessionStorage.setItem('agion:conv',JSON.stringify({phone:c,assumir:q.get('assumir')==='1',ts:Date.now()}));
  q.delete('conv'); q.delete('assumir'); var qs=q.toString(); history.replaceState(null,'',location.pathname+(qs?'?'+qs:'')+'#conversas'); }catch(e){} }
var abrindo=false;
async function abrirLink(){ if(abrindo) return; var p=null; try{ p=JSON.parse(sessionStorage.getItem('agion:conv')||'null'); }catch(e){}
  if(!p||!p.phone) return; if(Date.now()-(p.ts||0)>10*60000){ sessionStorage.removeItem('agion:conv'); return; }
  if(!papel()||papel()==='cliente') return; var app=D.getElementById('app'); if(!app||!app.classList.contains('show')) return;
  abrindo=true; sessionStorage.removeItem('agion:conv');
  try{ if(view.page!=='conversas') go('conversas');
    for(var i=0;i<80&&!D.getElementById('waItems');i++) await sleep(100);
    if(p.assumir) PULSE=p.phone;
    await W.convOpen(p.phone);
    if(p.assumir){ try{ flash('Toque em “Assumir” para atender esta conversa.'); }catch(e){} }
  }catch(e){} abrindo=false; }

/* ---------- exemplo fictício (tutorial) ---------- */
function demoLista(){ var el=D.getElementById('waItems'); if(!el||el.querySelector('.hu-demo')) return; css();
  var me=nomeDemo(); var d=D.createElement('div'); d.className='wa-item hu-demo on';
  d.innerHTML='<div class="wa-av" style="background:#7a5cc4">CS</div><div class="wa-it-main"><div class="wa-it-top"><span class="wa-it-nm">Carla Souza</span><span class="wa-it-tm">agora</span></div><div class="wa-it-top"><span class="wa-it-pv">Você é um robô? Quero falar com uma pessoa</span><span class="wa-dot"></span></div><div class="hu-tags"><span class="hu-tg nv">Novo lead</span><span class="hu-tg ow">'+esc(me)+'</span></div></div>';
  el.insertBefore(d,el.firstChild); }
function bolha(dir,au,txt,hm,sig){ return '<div class="wa-b '+(dir==='in'?'wa-in':'wa-out')+'">'+(au?'<div class="wa-au">'+esc(au)+'</div>':'')+(sig?'<span class="hu-sigb">'+esc(sig)+'</span>':'')+esc(txt)+'<div class="wa-mt">'+hm+'</div></div>'; }
function demoChat(){ var mn=D.getElementById('waMain'); if(!mn) return; css();
  var me=nomeDemo(); var wr=D.getElementById('waRoot'); if(wr) wr.classList.add('showchat');
  mn.innerHTML='<div class="hu-demo-chat" style="display:flex;flex-direction:column;height:100%;min-height:0">'+
   '<div class="wa-chd"><button class="wa-back" onclick="AgionHumano.demoOff()">‹</button><div class="wa-av" style="background:#7a5cc4">CS</div><div style="flex:1;min-width:0"><div class="wa-chd-nm">Carla Souza</div><div class="wa-chd-ph">+55 (51) 90000-0000</div><div class="hu-tags"><span class="hu-tg nv">Novo lead</span><span class="hu-tg ow">'+esc(me)+'</span></div></div></div>'+
   '<div class="hu-bar al hu-demo-bar"><span class="hu-dot" aria-hidden="true"></span><span class="hu-tx"><b>A Carla pediu para falar com uma pessoa.</b> A Alice segura a conversa por 2 minutos — toque em Assumir.</span><button class="hu-bt pulse" disabled>Assumir</button></div>'+
   '<div class="wa-msgs" id="waMsgs" style="flex:1;overflow:auto">'+
    '<div class="wa-day">Hoje</div>'+
    bolha('in','','Oi! Vi o anúncio do consórcio de imóvel. Como funciona?','09:12')+
    bolha('out','Alice','Oi, Carla! Aqui é a Alice, da Agion Consórcios 🍀 Recebi seu interesse em imóvel. Você pensa em comprar para morar ou para investir?','09:12')+
    bolha('out','Alice · follow-up','Carla, conseguiu pensar no valor do imóvel? Com isso eu já te mostro a simulação 😉','14:30')+
    bolha('in','','Você é um robô? Quero falar com uma pessoa, por favor','14:41')+
    bolha('out','','Oi, Carla! Aqui é '+(me==='Lisiane'?'a Lisiane, especialista':me)+' da Agion. Posso te ligar agora para explicar?','14:42',me)+
   '</div>'+
   '<div class="wa-inp"><textarea rows="1" disabled placeholder="Exemplo — no tutorial nada é enviado"></textarea><button class="wa-send" disabled>➤</button></div></div>';
}
function demo(){ DEMO=true; try{ if(phoneAtual()) convState.phone=null; }catch(e){} demoLista(); demoChat(); }
function demoOff(){ if(!DEMO) return; DEMO=null; var el=D.getElementById('waItems'); if(el){ var d=el.querySelector('.hu-demo'); if(d) d.remove(); }
  var mn=D.getElementById('waMain'); if(mn&&mn.querySelector('.hu-demo-chat')){ try{ convCloseChat(); }catch(e){ var wr=D.getElementById('waRoot'); if(wr) wr.classList.remove('showchat'); } } }

/* ---------- ganchos ---------- */
function hook(){
  if(W.__agionHumano) return;
  if(typeof W.convRenderChat!=='function'||typeof W.convOpen!=='function'||typeof W.apiFetch!=='function'||typeof W.render!=='function') return setTimeout(hook,120);
  W.__agionHumano=true;
  var _r=W.convRenderChat; W.convRenderChat=function(){ if(DEMO) return; var o=_r.apply(this,arguments); try{ pintar(); assinaturaBolhas(); carregar(phoneAtual(),false); lerPref(); }catch(e){} return o; };
  var _o=W.convOpen; W.convOpen=async function(){ if(DEMO) demoOff(); var o=await _o.apply(this,arguments); try{ carregar(phoneAtual(),true); }catch(e){} return o; };
  if(typeof W.convRefreshChat==='function'){ var _f=W.convRefreshChat; W.convRefreshChat=async function(){ if(DEMO) return; var o=await _f.apply(this,arguments); try{ carregar(phoneAtual(),false); }catch(e){} return o; }; }
  if(typeof W.convRenderList==='function'){ var _l=W.convRenderList; W.convRenderList=function(){ var o=_l.apply(this,arguments); try{ decorar(); }catch(e){} return o; }; }
  if(typeof W.convPermitida==='function'){ var _p=W.convPermitida; W.convPermitida=function(key){ if(_p.apply(this,arguments)) return true; try{ var o=info(key).owner; return !!o&&ownerVisible(o); }catch(e){ return false; } }; }
  var _a=W.apiFetch; W.apiFetch=function(path,opts){ try{ if(path==='/api/send'&&opts&&String(opts.method||'').toUpperCase()==='POST'&&opts.body&&assina()){ var b=JSON.parse(opts.body); if(b&&typeof b.texto==='string'&&b.texto.trim()){ b.texto=comNome(b.texto); opts=Object.assign({},opts,{body:JSON.stringify(b)}); } } }catch(e){} return _a.call(this,path,opts); };
  var _rd=W.render; var rf=function(){ var o=_rd.apply(this,arguments); try{ if(DEMO&&view.page!=='conversas') DEMO=null; setTimeout(abrirLink,300); }catch(e){} return o; }; rf.__hu=1; W.render=rf;
  setTimeout(abrirLink,1500);
}
guardarLink();
W.AgionHumano={assumir:function(){ return acao('assumir'); },devolver:function(){ return acao('devolver'); },
  assinar:function(on){ var p=pref(); p.semNome=!on; gravarPref(p); try{ flash(on?'Suas mensagens vão assinadas com o seu nome.':'Suas mensagens vão sem o seu nome.'); }catch(e){} },
  demo:demo, demoOff:demoOff, info:info, _estado:ST};
if(D.readyState==='loading') D.addEventListener('DOMContentLoaded',hook); else hook();
})();
