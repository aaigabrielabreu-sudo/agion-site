/* ==========================================================================
   Agion — plat2-shell.js · Casca da Plataforma v2 (só carrega em /plataformav2)
   Fase 1 (18/out/2026): menu em grupos com pílula, "Mais" no celular, abre no
   Painel, selo "Prévia v2" e o REGISTRO DE ABAS para os módulos plat2-*.js.
   Camada aditiva: envolve navItems(), renderNav() e render(); não muda dados.

   CONTRATO (para os módulos plat2-*.js do outro chat):
     AgionV2.aba(id, {
       titulo:'Metas', grupo:'Visão geral', icone:'<svg class="icon" …>' | 'kpi',
       papeis:['master','lider','especialista'], ordem:5,
       sub:'Texto do topo',            // opcional (crumb)
       render:function(C){ … }         // C = #content; pode ser async
     })
     - id novo → aba nova; id que já existe na v1 (ex.: 'feed','chat') → substitui
       a tela da v1 só na v2. As regras de quem vê continuam valendo
       (ABAS_SO_MASTER, "Ver como").
     AgionV2.definirMetas(fn)  → o Painel chama AgionV2.abrirMetas()
     Ajudantes: AgionV2.sb() · eu() · papel() · pode(papeis) · somenteLeitura()
                topo(titulo,sub,acoesHtml) · aviso(msg) · ir(id) · esc(s) · icone(nome)
   ========================================================================== */
(function(){
'use strict';
var W=window, D=document;
if(!/^\/plataforma(v2)?(\.html)?$/.test(location.pathname)) return;   /* /plataforma e /plataformav2; nunca roda na /plataforma-v1 */
D.documentElement.classList.add('v2'); D.body&&D.body.classList.add('v2');

function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
function papel(){ try{ return effRole(); }catch(e){ return null; } }

/* ---------- grupos do menu (ordem do protótipo v4) ---------- */
var GRUPOS=['Visão geral','Comercial','Atendimento','Carteira','Ferramentas','Gestão','Ajuda'];
var GRUPO_DE={dash:'Visão geral',kpis:'Visão geral',metas:'Visão geral',
  tarefas:'Comercial',crm:'Comercial',captacao:'Comercial',marketing:'Comercial',
  conversas:'Atendimento',disparos:'Atendimento',feed:'Atendimento',chat:'Atendimento',
  users:'Carteira',cadastro:'Carteira',consultoria:'Carteira',comissoes:'Carteira',
  ferramentas:'Ferramentas',contas:'Gestão',atividades:'Gestão',tutoriais:'Ajuda',config:'Ajuda'};
var ORDEM={dash:1,kpis:2,metas:3,tarefas:1,crm:2,captacao:3,marketing:4,conversas:1,disparos:2,feed:3,chat:4,users:1,cadastro:2,consultoria:3,comissoes:4,ferramentas:1,contas:1,atividades:2,tutoriais:1,config:2};
var ROTULO={users:'Clientes',config:'Ajustes',chat:'Chat da equipe'};
var ICONES={
  kpi:'<svg class="icon" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M8 17v-5M13 17V8M18 17v-9"/></svg>',
  alvo:'<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>',
  feed:'<svg class="icon" viewBox="0 0 24 24"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1.5"/></svg>',
  equipe:'<svg class="icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
  mais:'<svg class="icon" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>'
};
function icone(n){ return ICONES[n]||n||ICONES.alvo; }

/* ---------- registro de abas ---------- */
var ABAS={};
function registrada(id){ var a=ABAS[id]; if(!a) return null; var r=papel(); if(a.papeis&&a.papeis.indexOf(r)<0) return null; try{ if(abaBloqueada(id)) return null; }catch(e){} return a; }

/* ---------- menu ---------- */
function ordenar(items){
  return items.slice().sort(function(a,b){ var ga=GRUPOS.indexOf(a[3]||GRUPO_DE[a[0]]||'Ajuda'), gb=GRUPOS.indexOf(b[3]||GRUPO_DE[b[0]]||'Ajuda'); if(ga!==gb) return ga-gb;
    return (ORDEM[a[0]]||50)-(ORDEM[b[0]]||50); });
}
function navHtml(items){
  var h='', g0=null;
  items.forEach(function(it){ var k=it[0], g=GRUPO_DE[k]||(ABAS[k]&&ABAS[k].grupo)||'Ajuda';
    if(g!==g0){ h+='<div class="v2-ng">'+esc(g)+'</div>'; g0=g; }
    h+='<a class="'+(view.page===k?'on':'')+'" data-k="'+k+'" onclick="go(\''+k+'\')">'+(it[2]||'')+'<span class="v2-lb">'+esc(ROTULO[k]||it[1])+'</span></a>'; });
  return h;
}
function maisSheet(){
  var items=navItems(); var h='', g0=null;
  items.forEach(function(it){ var k=it[0], g=GRUPO_DE[k]||(ABAS[k]&&ABAS[k].grupo)||'Ajuda';
    if(g!==g0){ h+=(g0?'</div>':'')+'<div class="v2-mg"><div class="v2-ng">'+esc(g)+'</div>'; g0=g; }
    h+='<button class="'+(view.page===k?'on':'')+'" onclick="AgionV2._fecharMais();go(\''+k+'\')">'+(it[2]||'')+'<span>'+esc(ROTULO[k]||it[1])+'</span></button>'; });
  if(g0) h+='</div>';
  var bg=D.createElement('div'); bg.className='v2-sheet-bg'; bg.id='v2Mais';
  bg.innerHTML='<div class="v2-sheet" role="dialog" aria-label="Todas as abas"><div class="v2-grab"></div><div class="v2-sheet-hd"><b>Todas as abas</b></div>'+h+'</div>';
  bg.addEventListener('click',function(e){ if(e.target===bg) fecharMais(); });
  D.body.appendChild(bg); requestAnimationFrame(function(){ bg.classList.add('on'); });
}
function fecharMais(){ var b=D.getElementById('v2Mais'); if(b) b.remove(); }
function botaoMais(){
  if(D.getElementById('v2MaisBt')) return;
  var b=D.createElement('button'); b.id='v2MaisBt'; b.type='button'; b.setAttribute('aria-label','Mais abas');
  b.innerHTML=ICONES.mais+'<span>Mais</span>'; b.onclick=function(){ D.getElementById('v2Mais')?fecharMais():maisSheet(); };
  D.body.appendChild(b);
}
function seloPrevia(){ return; /* UMA_PLATAFORMA_20261020: sem link para a versão anterior */
  var f=D.querySelector('aside.side .foot'); if(!f||f.querySelector('.v2-selo')) return;
  var s=D.createElement('div'); s.className='v2-selo'; s.innerHTML='<b>Plataforma v2</b><a href="/plataforma-v1">Abrir a versão anterior</a>';
  f.insertBefore(s,f.firstChild);
}

/* ---------- ganchos ---------- */
function hook(){
  if(W.__agionV2) return;
  if(typeof W.navItems!=='function'||typeof W.renderNav!=='function'||typeof W.render!=='function') return setTimeout(hook,60);
  W.__agionV2=true;
  var _n=W.navItems; W.navItems=function(){ var it=_n.apply(this,arguments)||[]; try{
      if(!it.length||papel()==='cliente') return it;
      var ids=it.map(function(x){ return x[0]; });
      Object.keys(ABAS).forEach(function(id){ var a=registrada(id); if(!a) return; if(ids.indexOf(id)>=0) return; it.push([id,a.titulo,icone(a.icone),a.grupo]); });
      it.forEach(function(x){ if(ABAS[x[0]]&&ABAS[x[0]].ordem!=null) ORDEM[x[0]]=ABAS[x[0]].ordem; });
      return ordenar(it);
    }catch(e){ return it; } };
  var _rn=W.renderNav; W.renderNav=function(){ var o=_rn.apply(this,arguments); try{
      if(papel()!=='cliente'){ var nv=D.getElementById('navi'); if(nv) nv.innerHTML=navHtml(navItems()); }
      seloPrevia(); botaoMais();
    }catch(e){} return o; };
  var _r=W.render; var rf=function(){ try{
      if(view&&ABAS[view.page]&&!registrada(view.page)) view.page='dash';  /* aba registrada sem permissão → Painel */
      var a=view&&registrada(view.page);
      if(a){ try{ destroyCharts(); }catch(e){} try{ updateBell(); }catch(e){} var C=D.getElementById('content');
        try{ setTop(a.titulo,a.sub||a.grupo||'',''); }catch(e){}
        try{ var p=a.render(C); if(p&&p.catch) p.catch(function(err){ falha(C,a,err); }); }catch(err){ falha(C,a,err); }
        return; }
    }catch(e){} return _r.apply(this,arguments); };
  rf.__v2=1; W.render=rf;
  try{ renderNav(); }catch(e){}
}
function falha(C,a,err){ try{ console.error('[v2] aba '+a.titulo,err); C.innerHTML='<div class="panel"><h2>Não foi possível abrir “'+esc(a.titulo)+'”</h2><p class="note">'+esc(String(err&&err.message||err))+'</p></div>'; }catch(e){} }

/* ---------- abre sempre no Painel (exceto link de notificação) ---------- */
(function(){ try{ var temLink=!!sessionStorage.getItem('agion:conv'); if(!temLink&&!/[?&]conv=/.test(location.search)) history.replaceState(null,'',location.pathname+location.search+'#dash'); }catch(e){} })();

/* ---------- "Versão anterior" em Ajustes do visual novo (até o v4 ter o botão nativo) ---------- */
function anteriorV4(){ try{ var fr=D.querySelector('#v4wrap iframe'); if(!fr) return; var w=fr.contentWindow, d=fr.contentDocument; if(!d||w.cur!=='ajustes') return;
  var v=d.getElementById('view'); if(!v||d.getElementById('v2ant')||d.querySelector('[href="/plataforma-v1"]')) return;
  var p=d.createElement('div'); p.id='v2ant'; p.className='panel mb'; p.style.marginTop='16px';
  p.innerHTML='<div class="ph"><h3>Versão anterior</h3></div><div class="set" style="border:0"><div class="t"><b>Abrir a versão anterior da plataforma</b><small>O visual antigo, com os mesmos dados. Para voltar ao visual novo, abra a plataforma normalmente.</small></div><a class="btn sm dk" href="/plataforma-v1" target="_top">Abrir</a></div>';
  v.appendChild(p); }catch(e){} }
/* UMA_PLATAFORMA_20261020: a versão anterior saiu (tudo aponta para a plataforma nova) */

/* ---------- ATUALIZAÇÃO (19/out; AVISO_UPD_27OUT, pedido do Gabriel) ----------
   Compara a versão carregada (<meta name="agion-build">) com /plataforma-versao.json ao voltar para a
   plataforma, ao focar a janela e a cada 2 min. Se saiu versão nova:
   - quem está usando a plataforma naquele momento vê o botão "Nova versão da plataforma · Atualizar"
     (não recarrega sozinho no meio do uso);
   - se a plataforma está em segundo plano (outra aba/app), atualiza sozinha e volta já na versão nova.
   O botão recarrega com ?_v=<versão> para furar cache; depois de 3 tentativas sem pegar a versão nova
   ele some (não fica preso na tela). O × esconde o aviso até sair outra versão.
   Ícone e nome do app na tela de início continuam exigindo reinstalar (limite do iPhone). */
(function(){
  var meta=D.querySelector('meta[name="agion-build"]'); var MEU=meta&&meta.content; if(!MEU) return;
  var ult=0, pend=false, fechou='';
  function tentativas(novo){ try{ return +(sessionStorage.getItem('agion:upd:'+novo)||0); }catch(e){ return 0; } }
  function tira(){ var b=D.getElementById('v2upd'); if(b) b.remove(); }
  function recarrega(novo){
    try{ var k='agion:upd:'+novo, n=tentativas(novo); if(n>=3){ tira(); return; } sessionStorage.setItem(k,String(n+1)); }catch(e){}
    try{ var q=location.search.replace(/[?&]_v=[^&]*/g,'').replace(/^&/,'?'); q=(q&&q!=='?'?q+'&':'?')+'_v='+encodeURIComponent(novo);
      location.replace(location.pathname+q+location.hash); }catch(e){ location.reload(); } }
  function aviso(novo){ if(fechou===novo||tentativas(novo)>=3) return; var b=D.getElementById('v2upd');
    if(b){ b.dataset.v=novo; return; }
    b=D.createElement('div'); b.id='v2upd'; b.dataset.v=novo; b.setAttribute('role','status');
    var cel=(W.innerWidth||1000)<=760;   /* MOB28: no celular o aviso fica logo abaixo do topo, sem cobrir o campo de mensagem nem a barra de baixo */
    b.style.cssText='position:fixed;left:50%;transform:translateX(-50%);'+(cel?'top:calc(env(safe-area-inset-top,0px) + 70px);max-width:calc(100vw - 24px)':'bottom:calc(84px + env(safe-area-inset-bottom,0px))')+';z-index:100000;display:flex;align-items:center;gap:4px;border-radius:999px;padding:4px 4px 4px 6px;background:#0B2A26;box-shadow:0 10px 30px rgba(0,0,0,.3);font:700 13px system-ui,sans-serif;max-width:calc(100vw - 24px)';
    var a=D.createElement('button'); a.type='button'; a.textContent='Nova versão da plataforma · Atualizar';
    a.style.cssText='border:0;background:transparent;color:#E8CC8B;font:inherit;padding:7px 10px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
    a.onclick=function(){ recarrega(b.dataset.v); };
    var x=D.createElement('button'); x.type='button'; x.setAttribute('aria-label','Fechar o aviso'); x.textContent='×';
    x.style.cssText='border:0;background:rgba(255,255,255,.08);color:#E8CC8B;font:700 16px system-ui,sans-serif;width:30px;height:30px;border-radius:50%;cursor:pointer;flex:none';
    x.onclick=function(){ fechou=b.dataset.v; tira(); };
    b.appendChild(a); b.appendChild(x); D.body.appendChild(b); }
  function checa(forcar){ if(!forcar&&Date.now()-ult<60000) return; ult=Date.now();
    try{ fetch('/plataforma-versao.json?_='+Date.now(),{cache:'no-store'}).then(function(r){ return r.ok?r.json():null; }).then(function(j){
      if(!j||!j.v) return;
      if(j.v===MEU){ pend=false; tira(); return; }
      pend=j.v;
      if(D.hidden) recarrega(j.v); else aviso(j.v);
    }).catch(function(){}); }catch(e){} }
  D.addEventListener('visibilitychange',function(){ if(D.hidden){ if(pend) recarrega(pend); } else checa(true); });
  W.addEventListener('pageshow',function(e){ if(e.persisted) checa(true); });
  W.addEventListener('focus',function(){ checa(false); });
  setInterval(function(){ checa(true); },2*60*1000);
  setTimeout(function(){ checa(true); },15000);
  try{ if(/[?&]_v=/.test(location.search)&&history.replaceState){ var q=location.search.replace(/[?&]_v=[^&]*/g,'').replace(/^&/,'?'); history.replaceState(null,'',location.pathname+(q==='?'?'':q)+location.hash); } }catch(e){}
})();

W.AgionV2={
  versao:'casca-1',
  aba:function(id,o){ if(!id||!o||typeof o.render!=='function'){ console.warn('[v2] aba inválida',id); return; } ABAS[id]=o; if(o.grupo) GRUPO_DE[id]=GRUPO_DE[id]||o.grupo; try{ if(W.__agionV2) renderNav(); if(view&&view.page===id) render(); }catch(e){} },
  abas:function(){ return Object.keys(ABAS); },
  definirMetas:function(fn){ W.AgionV2._metas=fn; },
  abrirMetas:function(){ if(typeof W.AgionV2._metas==='function') return W.AgionV2._metas.apply(null,arguments); try{ flash('Metas: em breve.'); }catch(e){} },
  sb:function(){ try{ return W.supa||(typeof supa!=='undefined'?supa:null); }catch(e){ return null; } },
  eu:function(){ try{ var a=(db.accounts||[]).find(function(x){ return x.id===effId(); })||{}; return {id:effId(),role:papel(),nome:a.nome||'',real:meId()}; }catch(e){ return null; } },
  papel:papel,
  pode:function(p){ return (p||[]).indexOf(papel())>=0; },
  somenteLeitura:function(){ try{ return !!session.viewAs; }catch(e){ return false; } },
  topo:function(t,s,a){ try{ setTop(t,s,a); }catch(e){} },
  aviso:function(m){ try{ flash(m); }catch(e){} },
  ir:function(id){ try{ go(id); }catch(e){} },
  esc:esc, icone:icone,
  _fecharMais:fecharMais
};
if(D.readyState==='loading') D.addEventListener('DOMContentLoaded',hook); else hook();
})();
