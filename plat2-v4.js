/* ==========================================================================
   Agion — plat2-v4.js · Plataforma v2 = protótipo v4 com os dados reais
   Só roda em /plataformav2. A v1 continua por baixo (login, loadCloud, db,
   push, motores). Depois do login, abre por cima o /plat2-v4.html (o próprio
   código do protótipo v4) num iframe da mesma origem, que lê os dados e chama
   as funções da v1 por esta ponte. Desligar: ?v1=1 na URL.
   ========================================================================== */
(function(){
'use strict';
var W=window, D=document;
if(!/^\/plataforma(v2)?(\.html)?$/.test(location.pathname)) return;   /* 19/out (Chat B): /plataforma também é a v2; /plataforma-v1 não */
if(/[?&]v1=1/.test(location.search)) return;

/* ---------- ponte: o iframe enxerga as variáveis "let/const" da v1 por aqui ---------- */
W.AgionV4Ponte={
  versao:'v4-1',
  db:function(){ return db; },
  session:function(){ return session; },
  view:function(){ return view; },
  supa:function(){ return supa; },
  botApi:function(){ try{ return BOT_API; }catch(e){ return 'https://bot.agionconsorcios.com.br'; } },
  somenteLeitura:function(){ try{ return !!session.viewAs; }catch(e){ return false; } },
  ev:function(code){ return (0,eval)(code); },               /* lê qualquer global léxica da v1 */
  set:function(nome,val){ W.__v4tmp=val; (0,eval)(nome+'=window.__v4tmp'); delete W.__v4tmp; },
  call:function(fn){ var a=[].slice.call(arguments,1); var f=W[fn]; if(typeof f!=='function') throw new Error('v1 sem '+fn); return f.apply(W,a); },
  recarregar:function(){ return (typeof loadCloud==='function')?loadCloud():Promise.resolve(); },
  irV1:function(pag){ esconder(); try{ go(pag); }catch(e){} },
  voltarV4:function(){ mostrar(); },
  sair:function(){ try{ logout(); }catch(e){} esconder(true); },
  avisar:function(){ avisa(); },
  convLink:function(){ var l=LINK; LINK=null; if(l&&Date.now()-(l.ts||0)>10*60000) return null; return l; }
};

var LINK=null; try{ LINK=JSON.parse(sessionStorage.getItem('agion:conv')||'null'); }catch(e){}
var wrap=null, fr=null, pronto=false, tAvisa=null;
var V1_SO=['editor','compare'];   /* telas que só existem na v1 (abrem por cima, com “Voltar ao novo visual”) */
function logado(){ try{ var a=D.getElementById('app'); return !!(a&&a.classList.contains('show')&&session&&session.role&&session.role!=='cliente'&&db&&(db.accounts||[]).some(function(x){return x.real;})); }catch(e){ return false; } }
/* 19/out · app instalado: a faixa do relógio (#agStatusBand, que evita o desfoque do iOS 26) e a barra
   do sistema ficam da MESMA cor do fundo do visual novo (dia/noite), e o v4 começa logo abaixo dela. */
var COR0=null;
function corApp(){ try{
  var band=D.getElementById('agStatusBand'), mt=D.querySelector('meta[name="theme-color"]'), on=!!(wrap&&!wrap.classList.contains('off'));
  if(mt&&COR0===null) COR0=mt.getAttribute('content');
  var c=null; if(on){ try{ c=fr.contentWindow.getComputedStyle(fr.contentDocument.body).backgroundColor; }catch(e){} if(!c||c==='rgba(0, 0, 0, 0)') c='#F4EFE4'; }
  if(band) band.style.background = on? c : '#0B2A26';
  if(mt) mt.setAttribute('content', on? c : (COR0||'#0B2A26'));
  if(wrap&&on) wrap.style.background=c;
}catch(e){} }
function montar(){
  if(wrap) return mostrar();
  var st=D.createElement('style');
  st.textContent='#v4wrap{position:fixed;inset:0;z-index:400;background:#F4F1EA;transition:opacity .35s}#v4wrap.off{opacity:0;pointer-events:none}#v4wrap{overflow:hidden;width:100%;max-width:100vw}#v4wrap iframe{width:1px;min-width:100%;max-width:100%;height:100%;border:0;display:block}html.v4on,html.v4on body{overflow:hidden!important;overscroll-behavior:none}html.isApp.v4on #v4wrap{top:max(12px,env(safe-area-inset-top,0px))}'+
    'body.v4on{overflow:hidden}body.v4on>*:not(#v4wrap):not(#app):not(#loginView):not(#v2MaisBt):not(.v2-sheet-bg){z-index:950!important}body.v4on #v2MaisBt{display:none!important}#v4volta{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:450;display:none;border:0;border-radius:999px;padding:11px 16px;font:700 13px system-ui;background:#0B2A26;color:#E8CC8B;box-shadow:0 8px 24px rgba(0,0,0,.25)}body.v4fb #v4volta{display:block}';
  D.head.appendChild(st);
  wrap=D.createElement('div'); wrap.id='v4wrap';
  fr=D.createElement('iframe'); fr.title='Agion Wealth'; fr.setAttribute('allow','clipboard-read; clipboard-write; notifications');
  var src=W.__V4SRC||('/plat2-v4.html?v=9');
  if(W.__V4SRCDOC) fr.srcdoc=W.__V4SRCDOC; else fr.src=src;
  wrap.appendChild(fr); D.body.appendChild(wrap); D.body.classList.add('v4on'); D.documentElement.classList.add('v4on');
  fr.addEventListener('load',function(){ try{ if(D.documentElement.classList.contains('isApp')) fr.contentDocument.documentElement.classList.add('emapp'); }catch(e){} corApp(); });
  if(!W.__v4cor) W.__v4cor=setInterval(corApp,1200);
  var b=D.createElement('button'); b.id='v4volta'; b.textContent='← Voltar ao novo visual'; b.onclick=mostrar; D.body.appendChild(b);
}
function mostrar(){ if(!wrap) return montar(); wrap.classList.remove('off'); D.body.classList.add('v4on'); D.documentElement.classList.add('v4on'); D.body.classList.remove('v4fb'); avisa(); corApp(); }
function esconder(total){ if(!wrap) return; wrap.classList.add('off'); D.body.classList.remove('v4on'); D.documentElement.classList.remove('v4on'); if(!total) D.body.classList.add('v4fb'); else D.body.classList.remove('v4fb'); corApp(); }
function avisa(){ clearTimeout(tAvisa); tAvisa=setTimeout(function(){ try{ fr&&fr.contentWindow&&fr.contentWindow.postMessage({v4:'dados'},location.origin); }catch(e){} },350); }

/* ---------- sempre que a v1 redesenhar (realtime, loadCloud, ações), avisa o v4 ---------- */
function gancho(){
  if(typeof W.render!=='function') return setTimeout(gancho,80);
  if(W.render.__v4) return;
  var r=W.render, n=function(){ var o=r.apply(this,arguments); try{ if(wrap){ avisa(); if(!wrap.classList.contains('off')&&V1_SO.indexOf(view.page)>=0) esconder(); } }catch(e){} return o; };
  n.__v4=1; n.__v2=r.__v2; W.render=n;
}
/* ---------- entrada: logo da Agion animada + login no visual novo ---------- */
var LG=null, lgMsgT=null, lgT0=Date.now(), lgPronto=false, LOGO='/plat2-v4/logo-hd.png', LOGO2='https://cdn.jsdelivr.net/gh/aaigabrielabreu-sudo/agionconsorcio@main/frontend/public/images/logo-agion.png';
function lgCss(){ var s=D.createElement('style'); s.textContent=
 '@font-face{font-family:"DM Sans";src:url(/plat2-v4/DM-Sans-Variable.ttf) format("truetype");font-weight:100 1000}@font-face{font-family:Lora;src:url(/plat2-v4/Lora-Variable.ttf) format("truetype");font-weight:400 700}@font-face{font-family:Lora;font-style:italic;src:url(/plat2-v4/Lora-Italic-Variable.ttf) format("truetype");font-weight:400 700}'+
 '#v4login{position:fixed;inset:0;z-index:2000;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:auto;padding:24px 20px calc(24px + env(safe-area-inset-bottom));background:radial-gradient(circle at 50% 38%,#1B5A4D,#0B2A26 64%);color:#F1DEA9;font-family:"DM Sans",system-ui,sans-serif;transition:opacity .55s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1)}'+
 '#v4login.fora{opacity:0;transform:scale(1.05);pointer-events:none}'+
 '#v4login .lgm{display:flex;flex-direction:column;align-items:center;transition:transform .8s cubic-bezier(.22,1,.36,1)}'+
 '#v4login .lgm img{width:118px;height:auto;animation:v4spl 1s cubic-bezier(.34,1.56,.64,1) both;filter:drop-shadow(0 10px 30px rgba(0,0,0,.35))}'+
 '#v4login .lgm b{font:600 26px Lora,Georgia,serif;letter-spacing:.3em;margin-top:14px;padding-left:.3em;animation:v4up .7s cubic-bezier(.22,1,.36,1) .25s both}'+
 '#v4login .lgm small{font:700 10px "DM Sans",system-ui;letter-spacing:.4em;padding-left:.4em;text-transform:uppercase;color:#C5A059;animation:v4up .7s cubic-bezier(.22,1,.36,1) .4s both}'+
 '#v4login .lgm i{display:block;width:0;height:1px;margin-top:16px;background:linear-gradient(90deg,transparent,#E8CC8B,transparent);animation:v4ln 1.1s cubic-bezier(.22,1,.36,1) .55s forwards}'+
 '#v4login.form .lgm{transform:translateY(-6px) scale(.78)}'+
 '#v4login .lgc{width:100%;max-width:380px;margin-top:22px;padding:26px 24px 22px;border-radius:24px;background:rgba(255,255,255,.06);border:1px solid rgba(232,204,139,.22);box-shadow:0 30px 80px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.08);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);display:none}'+
 '#v4login.form .lgc{display:block;animation:v4up .7s cubic-bezier(.22,1,.36,1) both}'+
 '#v4login .lgc h1{font:500 24px Lora,Georgia,serif;color:#F3EEE2;margin:0 0 2px;text-align:center}#v4login .lgc h1 em{color:#E8CC8B}'+
 '#v4login .lgc p{margin:0 0 18px;text-align:center;font-size:12.5px;color:#A9BFB8}'+
 '#v4login label{display:block;font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#C5A059;margin:12px 0 6px}'+
 '#v4login input{width:100%;box-sizing:border-box;padding:13px 14px;border-radius:14px;border:1px solid rgba(232,204,139,.25);background:rgba(4,20,18,.45);color:#F3EEE2;font:500 15px "DM Sans",system-ui;outline:none;transition:border-color .2s,box-shadow .2s}'+
 '#v4login input:focus{border-color:#E8CC8B;box-shadow:0 0 0 3px rgba(232,204,139,.18)}#v4login input::placeholder{color:#6F8A83}'+
 '#v4login .lgb{width:100%;margin-top:18px;padding:14px;border:0;border-radius:999px;cursor:pointer;background:linear-gradient(115deg,#A8853E,#E8CC8B 52%,#C5A059 92%);color:#0B2A26;font:800 14.5px "DM Sans",system-ui;letter-spacing:.02em;box-shadow:0 10px 26px rgba(197,160,89,.35);transition:transform .2s,filter .2s}'+
 '#v4login .lgb:active{transform:scale(.98)}#v4login .lgb[disabled]{filter:saturate(.6) brightness(.9);cursor:default}'+
 '#v4login .lgf{display:block;margin:14px auto 0;background:none;border:0;color:#A9BFB8;font:600 12.5px "DM Sans",system-ui;cursor:pointer;text-decoration:underline;text-underline-offset:3px}'+
 '#v4login .lgmsg{min-height:18px;margin-top:12px;text-align:center;font-size:12.5px;color:#F4AAA0}#v4login .lgmsg.ok{color:#9FD9B0}'+
 '#v4login .lgt{margin-top:22px;font:italic 400 13px Lora,Georgia,serif;color:#C5A059;text-align:center;opacity:.9}'+
 '#v4login .lgw{margin-top:18px;width:26px;height:26px;border-radius:50%;border:2px solid rgba(232,204,139,.25);border-top-color:#E8CC8B;animation:v4rot .9s linear infinite;opacity:0;transition:opacity .3s}#v4login.esp .lgw{opacity:1}#v4login.form .lgw{display:none}'+
 '@keyframes v4spl{from{opacity:0;transform:scale(.6) rotate(-8deg)}to{opacity:1;transform:none}}@keyframes v4up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}@keyframes v4ln{to{width:140px}}@keyframes v4rot{to{transform:rotate(360deg)}}'+
 'body.v4lg #loginView{visibility:hidden}';
 D.head.appendChild(s); }
function lgMontar(){ if(LG) return; lgCss(); D.body.classList.add('v4lg'); W.AgionV4Ponte.splashFeito=true;
 LG=D.createElement('div'); LG.id='v4login';
 LG.innerHTML='<div class="lgm"><img alt="Agion" src="'+LOGO+'"><b>AGION</b><small>Wealth</small><i></i></div>'+
  '<form class="lgc" autocomplete="on" novalidate><h1>Bem-vindo à <em>Agion</em></h1><p>Plataforma de planejamento financeiro</p>'+
  '<label for="v4em">E-mail</label><input id="v4em" type="email" inputmode="email" autocomplete="username" placeholder="seu@email.com">'+
  '<label for="v4pw">Senha</label><input id="v4pw" type="password" autocomplete="current-password" placeholder="••••••••">'+
  '<button class="lgb" type="submit">Entrar</button><button class="lgf" type="button">Esqueci minha senha</button><div class="lgmsg" role="status"></div></form>'+
  '<div class="lgt">Consórcio para os seus sonhos, planejamento para a sua vida.</div><div class="lgw"></div>';
 D.body.appendChild(LG);
 var im=LG.querySelector('img'); im.onerror=function(){ if(im.src.indexOf(LOGO2)<0) im.src=LOGO2; };
 var f=LG.querySelector('form');
 f.onsubmit=function(e){ e.preventDefault(); lgEntrar(); };
 LG.querySelector('.lgf').onclick=function(){ var em=D.getElementById('logEmail'); if(em) em.value=LG.querySelector('#v4em').value.trim(); lgMsg('',0); try{ forgotPass(); }catch(x){ lgMsg('Serviço indisponível. Recarregue a página.'); } lgEspelha(); };
}
function lgMsg(t,ok){ if(!LG) return; var m=LG.querySelector('.lgmsg'); m.textContent=t||''; m.classList.toggle('ok',!!ok); }
function lgEspelha(){ clearInterval(lgMsgT); var n=0; lgMsgT=setInterval(function(){ n++; var m=D.getElementById('loginMsg'); if(m&&m.textContent.trim()){ var cor=(m.style.color||'').indexOf('bad')<0&&!/erro|inválid|incorret|inform|indispon|não/i.test(m.textContent); lgMsg(m.textContent.trim(),cor); var b=LG&&LG.querySelector('.lgb'); if(b&&!logado()){ b.disabled=false; b.textContent='Entrar'; } } if(n>60||logado()) clearInterval(lgMsgT); },250); }
function lgEntrar(){ var em=LG.querySelector('#v4em').value.trim(), pw=LG.querySelector('#v4pw').value; if(!em||!pw){ lgMsg('Informe e-mail e senha.'); return; }
 var a=D.getElementById('logEmail'), b=D.getElementById('logPass'), m=D.getElementById('loginMsg'); if(!a||!b||typeof W.doLogin!=='function'){ lgMsg('Serviço de login indisponível. Recarregue a página.'); return; }
 a.value=em; b.value=pw; if(m) m.textContent=''; lgMsg('',0); var bt=LG.querySelector('.lgb'); bt.disabled=true; bt.textContent='Entrando…';
 try{ Promise.resolve(W.doLogin()).catch(function(){}); }catch(x){} lgEspelha(); }
function lgForm(){ if(!LG) lgMontar(); if(LG.classList.contains('form')) return; LG.classList.remove('esp','fora'); LG.classList.add('form'); var bt=LG.querySelector('.lgb'); bt.disabled=false; bt.textContent='Entrar'; setTimeout(function(){ var i=LG.querySelector('#v4em'); if(i&&!i.value&&W.innerWidth>760) i.focus(); },700); }
function lgEspera(){ if(!LG) lgMontar(); LG.classList.remove('form','fora'); LG.classList.add('esp'); }
function lgSair(){ if(!LG) return; LG.classList.add('fora'); D.body.classList.remove('v4lg'); var x=LG; setTimeout(function(){ if(x.parentNode) x.parentNode.removeChild(x); },650); LG=null; }
W.addEventListener('message',function(e){ if(e.data&&e.data.v4==='pronto'&&fr&&e.source===fr.contentWindow){ lgPronto=true; setTimeout(lgSair, Math.max(0,1300-(Date.now()-lgT0))); } });
function appCliente(){ try{ var a=D.getElementById('app'); return !!(a&&a.classList.contains('show')&&session&&session.role==='cliente'); }catch(e){ return false; } }
function telaLogin(){ var l=D.getElementById('loginView'); return !!(l&&l.offsetParent!==null&&getComputedStyle(l).display!=='none'); }

function espera(){
  gancho();
  if(logado()){ if(!pronto){ pronto=true; lgPronto=false; lgT0=Date.now(); if(LG) lgEspera(); montar(); setTimeout(function(){ if(!lgPronto) lgSair(); },15000); } }
  else if(pronto && !logado()){ pronto=false; esconder(true); }
  if(!logado()){
    if(appCliente()) lgSair();                                      /* cliente: segue a v1 */
    else if(telaLogin()&&Date.now()-lgT0>1250) lgForm();             /* deslogado: depois da entrada, mostra o login */
  }
  setTimeout(espera, pronto?1500:250);
}
function inicio(){ lgMontar(); espera(); }
if(D.readyState==='loading') D.addEventListener('DOMContentLoaded',inicio); else inicio();
})();
