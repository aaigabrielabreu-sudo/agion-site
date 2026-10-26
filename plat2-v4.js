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
  convLink:function(){ var l=LINK; LINK=null; if(l&&Date.now()-(l.ts||0)>10*60000) return null; return l; },
  passkey:{ suporte:function(){ return pkSuporte(); }, ativo:function(){ return pkAtivo(); }, nome:function(){ return pkNome(); }, ativar:function(){ return pkAtivar(); }, preparar:function(){ return pkPrep('reg').catch(function(){}); }, desativar:function(){ return pkDesativar(); }, erro:function(e){ return pkErro(e); } }
};

var LINK=null; try{ LINK=JSON.parse(sessionStorage.getItem('agion:conv')||'null'); }catch(e){}
var wrap=null, fr=null, pronto=false, tAvisa=null;
var V1_SO=['editor','compare'];   /* telas que só existem na v1 (abrem por cima, com “Voltar ao novo visual”) */
/* CLIENTE_V4_23OUT: o cliente também entra no visual novo (Início, Planejamento, Jornada, Gastos, Minha cota).
   Freio de emergência: localStorage agion_cli_v4 = '0' volta o cliente para a tela anterior. */
function cliV4(){ try{ return localStorage.getItem('agion_cli_v4')!=='0'; }catch(e){ return true; } }
function logado(){ try{ var a=D.getElementById('app'); if(!(a&&a.classList.contains('show')&&session&&session.role&&db)) return false;
  if(session.role==='cliente') return cliV4()&&(db.clients||[]).length>0;
  return (db.accounts||[]).some(function(x){return x.real;}); }catch(e){ return false; } }
/* 19/out · app instalado: a faixa do relógio (#agStatusBand, que evita o desfoque do iOS 26) e a barra
   do sistema ficam da MESMA cor do fundo do visual novo (dia/noite), e o v4 começa logo abaixo dela. */
var COR0=null;
function corApp(){ try{
  var band=D.getElementById('agStatusBand'), mt=D.querySelector('meta[name="theme-color"]'), on=!!(wrap&&!wrap.classList.contains('off'));
  if(mt&&COR0===null) COR0=mt.getAttribute('content');
  var c=null; if(on){ try{ c=fr.contentWindow.getComputedStyle(fr.contentDocument.body).backgroundColor; }catch(e){} if(!c||c==='rgba(0, 0, 0, 0)') c='#F4EFE4'; }
  if(band) band.style.background = on? c : '#0B2A26';
  /* 19/out: no computador (app do Mac) a faixa do relógio não existe — ela cobria o topo dos botões */
  if(band) band.style.display=(on&&W.innerWidth>860)?'none':'';
  if(mt) mt.setAttribute('content', on? c : (COR0||'#0B2A26'));
  if(wrap&&on) wrap.style.background=c;
  /* 19/out: fundo da página por trás também na cor do visual novo (sem faixa escura sobrando no canto do relógio) */
  if(D.documentElement.classList.contains('isApp')){ D.documentElement.style.backgroundColor=on?c:''; D.body.style.backgroundColor=on?c:''; if(band){ band.style.left='-2px'; band.style.right='-2px'; band.style.width='calc(100vw + 4px)'; } }
}catch(e){} }
function montar(){
  if(wrap) return mostrar();
  var st=D.createElement('style');
  st.textContent='#v4wrap{position:fixed;inset:0;z-index:400;background:#F4F1EA;transition:opacity .35s}#v4wrap.off{opacity:0;pointer-events:none}#v4wrap{overflow:hidden;width:100%;max-width:100vw}#v4wrap iframe{width:1px;min-width:100%;max-width:100%;height:100%;border:0;display:block}html.v4on,html.v4on body{overflow:hidden!important;overscroll-behavior:none}@media (max-width:860px){html.isApp.v4on #v4wrap{top:max(12px,env(safe-area-inset-top,0px))}}'+
    'body.v4on{overflow:hidden}body.v4on>*:not(#v4wrap):not(#app):not(#loginView):not(#v2MaisBt):not(.v2-sheet-bg){z-index:950!important}body.v4on #v2MaisBt{display:none!important}#v4volta{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:450;display:none;border:0;border-radius:999px;padding:11px 16px;font:700 13px system-ui;background:#0B2A26;color:#E8CC8B;box-shadow:0 8px 24px rgba(0,0,0,.25)}body.v4fb #v4volta{display:block}';
  D.head.appendChild(st);
  wrap=D.createElement('div'); wrap.id='v4wrap';
  fr=D.createElement('iframe'); fr.title='Agion Wealth'; fr.setAttribute('allow','clipboard-read; clipboard-write; notifications');
  var src=W.__V4SRC||('/plat2-v4.html?v=53');
  if(W.__V4SRCDOC) fr.srcdoc=W.__V4SRCDOC; else fr.src=src;
  wrap.appendChild(fr); D.body.appendChild(wrap); D.body.classList.add('v4on'); D.documentElement.classList.add('v4on');
  fr.addEventListener('load',function(){ try{ if(D.documentElement.classList.contains('isApp')) fr.contentDocument.documentElement.classList.add('emapp'); }catch(e){} corApp(); marcaToast(); });
  if(!W.__v4cor) W.__v4cor=setInterval(corApp,1200);
  var b=D.createElement('button'); b.id='v4volta'; b.textContent='← Voltar ao novo visual'; b.onclick=mostrar; D.body.appendChild(b);
}
function v1Vis(on){ try{ D.documentElement.classList.toggle('v1on',!!on); }catch(e){} }
function mostrar(){ if(!wrap) return montar(); v1Vis(false); wrap.classList.remove('off'); D.body.classList.add('v4on'); D.documentElement.classList.add('v4on'); D.body.classList.remove('v4fb'); avisa(); corApp(); }
function esconder(total){ if(!wrap) return; if(!total) v1Vis(true); wrap.classList.add('off'); D.body.classList.remove('v4on'); D.documentElement.classList.remove('v4on'); if(!total) D.body.classList.add('v4fb'); else D.body.classList.remove('v4fb'); corApp(); }
function avisa(){ clearTimeout(tAvisa); tAvisa=setTimeout(function(){ try{ fr&&fr.contentWindow&&fr.contentWindow.postMessage({v4:'dados'},location.origin); }catch(e){} },350); }

/* ---------- sempre que a v1 redesenhar (realtime, loadCloud, ações), avisa o v4 ---------- */
function gancho(){
  if(typeof W.render!=='function') return setTimeout(gancho,80);
  if(W.render.__v4) return;
  var r=W.render, n=function(){ var o=r.apply(this,arguments); try{ if(wrap){ avisa(); if(!wrap.classList.contains('off')&&V1_SO.indexOf(view.page)>=0) esconder(); } }catch(e){} return o; };
  n.__v4=1; n.__v2=r.__v2; W.render=n;
}
/* ---------- V1_INVISIVEL_23OUT: com o visual novo na tela, aviso (flash) e pergunta (ask) da v1 ----------
   saem no visual novo e uma vez só: se o visual novo já mostrou o aviso dele (até 2,5 s antes/0,4 s depois),
   o da v1 é descartado; a pergunta da v1 abre na janela do visual novo. */
function v4Win(){ try{ return (wrap&&!wrap.classList.contains('off')&&fr&&fr.contentWindow&&fr.contentWindow.AG)?fr.contentWindow:null; }catch(e){ return null; } }
function marcaToast(){ try{ var cw=fr&&fr.contentWindow; if(!cw||typeof cw.toast!=='function'||cw.toast.__lt) return; var t0=cw.toast, tw=function(){ cw.__v4lt=Date.now(); return t0.apply(this,arguments); }; tw.__lt=1; cw.toast=tw; }catch(e){} }
function v1Avisos(){
  try{ if(typeof W.flash==='function'&&!W.flash.__v4){ var f0=W.flash, fl=function(m){ var cw=v4Win(); if(!cw) return f0.apply(this,arguments); marcaToast();
      var t=Date.now(), txt=String(m==null?'':m); setTimeout(function(){ try{ var lt=cw.__v4lt||0; if(lt>t-2500) return; cw.toast(txt.replace(/[<>&]/g,function(c){ return {'<':'&lt;','>':'&gt;','&':'&amp;'}[c]; }),'spark'); }catch(e){ f0(txt); } },400); };
    fl.__v4=1; W.flash=fl; } }catch(e){}
  try{ if(typeof W.ask==='function'&&!W.ask.__v4ask){ var a0=W.ask, ak=function(o){ var cw=v4Win(), tt=String((o&&o.title)||'');
      if(!cw||!cw.AG||typeof cw.AG.ask!=='function'||/senha/i.test(tt)) return a0.apply(this,arguments); return cw.AG.ask(o||{}); };
    ak.__v4ask=1; ak.__sen=W.ask.__sen; W.ask=ak; } }catch(e){}
}

/* ---------- entrada: logo da Agion animada + login no visual novo ---------- */
/* SENHA_20261020: link de redefinição de senha. Antes a pergunta da v1 ficava escondida atrás da
   tela de entrada nova e a senha nunca era trocada. Agora o próprio login novo abre "Crie sua nova senha". */
var REC=(function(){ try{ var t=String(W.__agHash!=null?W.__agHash:location.hash)+'&'+String(W.__agSearch!=null?W.__agSearch:location.search);
  if(/type=recovery/.test(t)) return 'ok'; if(/type=invite/.test(t)||(/convite=1/.test(t)&&/access_token=/.test(t))) return 'conv'; if(/error_code=otp_expired|error=access_denied|error_description=/.test(t)) return 'exp'; }catch(e){} return null; })(), RECON=false;
function supaV1(){ try{ return supa; }catch(e){ return null; } }
function limpaUrl(){ try{ history.replaceState(null,'',location.pathname+(location.search||'').replace(/([?&])(type|code|error|error_code|error_description)=[^&]*/g,'$1').replace(/[?&]+$/,'')); }catch(e){} }
function fechaModalV1(){ try{ var bg=D.getElementById('modalBg'), t=D.getElementById('modalTitle'); if(bg&&!bg.classList.contains('hidden')&&t&&/nova senha/i.test(t.textContent)){ var c=D.getElementById('modalCancel'); if(c) c.click(); } }catch(e){} }
function lgNovaSenha(conv){ if(!LG) lgMontar(); RECON=true; LG.classList.remove('esp','fora'); LG.classList.add('form');
 var f=LG.querySelector('form');
 f.innerHTML=(conv?'<h1>Bem-vindo! Crie sua <em>senha</em></h1><p>É com ela que você vai entrar na plataforma, no computador e no celular.</p>':'<h1>Crie sua <em>nova senha</em></h1><p>Digite a nova senha duas vezes. Ela vale no computador e no celular.</p>')+
  '<input id="v4nu" type="email" autocomplete="username" tabindex="-1" aria-hidden="true" style="position:absolute;opacity:0;width:1px;height:1px;pointer-events:none">'+
  '<label for="v4n1">Nova senha</label><input id="v4n1" type="password" autocomplete="new-password" placeholder="mínimo 6 caracteres">'+
  '<label for="v4n2">Repita a nova senha</label><input id="v4n2" type="password" autocomplete="new-password" placeholder="igual à de cima">'+
  '<button class="lgb" type="submit">Salvar nova senha</button><button class="lgf" type="button">Voltar para a tela de entrada</button><div class="lgmsg" role="status"></div>';
 f.onsubmit=function(e){ e.preventDefault(); salvaNova(); };
 f.querySelector('.lgf').onclick=function(){ RECON=false; REC=null; limpaUrl(); var x=LG; LG=null; if(x&&x.parentNode) x.parentNode.removeChild(x); lgMontar(); lgForm(); };
 var sb=supaV1(); try{ sb&&sb.auth.getSession().then(function(r){ var u=r&&r.data&&r.data.session&&r.data.session.user; if(u&&LG&&LG.querySelector('#v4nu')) LG.querySelector('#v4nu').value=u.email||''; }); }catch(e){}
 var n=0, iv=setInterval(function(){ fechaModalV1(); if(++n>60||!RECON) clearInterval(iv); },250);
 setTimeout(function(){ var i=LG&&LG.querySelector('#v4n1'); if(i) i.focus(); },500); }
/* a v1 pergunta a senha numa janelinha que fica escondida atrás do login novo: troca pela tela acima */
try{ var _ask=W.ask; if(typeof _ask==='function'&&!_ask.__sen){ var _na=function(o){ var t=String((o&&o.title)||'');
  if(/nova senha/i.test(t)){ setTimeout(function(){ if(!RECON) lgNovaSenha(false); },0); return Promise.resolve(null); }
  if(/defina sua senha|senha muito curta/i.test(t)){ setTimeout(function(){ if(!RECON) lgNovaSenha(true); },0); return Promise.resolve(null); }
  return _ask.apply(this,arguments); }; _na.__sen=1; W.ask=_na; } }catch(e){}
/* se a janelinha da v1 já abriu antes deste arquivo carregar, fecha e mostra a tela nova */
(function(){ var n=0, iv=setInterval(function(){ try{ var bg=D.getElementById('modalBg'), t=D.getElementById('modalTitle'), c=D.getElementById('modalCancel');
  if(bg&&t&&c&&!bg.classList.contains('hidden')){ var tx=t.textContent||'';
   if(/nova senha/i.test(tx)){ c.click(); if(!RECON) lgNovaSenha(false); } else if(/defina sua senha|senha muito curta/i.test(tx)){ c.click(); if(!RECON) lgNovaSenha(true); } } }catch(e){}
  if(++n>80) clearInterval(iv); },250); })();
function espere(ms){ return new Promise(function(ok){ setTimeout(ok,ms); }); }
async function salvaNova(){ var a=LG.querySelector('#v4n1').value, b=LG.querySelector('#v4n2').value, bt=LG.querySelector('.lgb');
 if(a.length<6){ lgMsg('Use pelo menos 6 caracteres.'); return; } if(a!==b){ lgMsg('As duas senhas não estão iguais.'); return; }
 var sb=supaV1(); if(!sb){ lgMsg('Serviço indisponível. Recarregue a página.'); return; }
 bt.disabled=true; bt.textContent='Salvando…'; lgMsg('',0);
 var s=null; for(var i=0;i<24&&!s;i++){ try{ var r=await sb.auth.getSession(); s=r&&r.data&&r.data.session; }catch(e){} if(!s) await espere(250); }
 if(!s){ bt.disabled=false; bt.textContent='Salvar nova senha'; lgMsg('Esse link expirou ou já foi usado. Peça um novo em “Esqueci minha senha” e abra o e-mail mais recente.'); return; }
 var res; try{ res=await sb.auth.updateUser({password:a}); }catch(e){ res={error:e}; }
 if(res&&res.error){ bt.disabled=false; bt.textContent='Salvar nova senha'; var m=String(res.error.message||res.error||'');
  lgMsg(/different|same|diferente/i.test(m)?'A nova senha precisa ser diferente da anterior.':/least|short|weak|caracter/i.test(m)?'Senha fraca: use pelo menos 6 caracteres.':'Não foi possível salvar a senha: '+m); return; }
 fechaModalV1(); limpaUrl(); bt.textContent='Senha salva'; lgMsg('Senha alterada! Entrando…',1);
 try{ if(W.PasswordCredential&&navigator.credentials&&s.user&&s.user.email) navigator.credentials.store(new W.PasswordCredential({id:s.user.email,password:a})); }catch(e){}
 RECON=false; REC=null; lgT0=Date.now();
 setTimeout(function(){ if(logado()){ if(pronto) lgSair(); else lgEspera(); } else { try{ if(typeof W.startSession==='function') W.startSession(s.user); }catch(e){} } },900); }
/* PASSKEY_20261020: entrar com Face ID / Touch ID / digital (passkey). A chave fica no aparelho; o robô
   confere a assinatura e devolve um token de uso único que vira a sessão do Supabase. */
var PWLOGIN=false;
function pkBase(){ try{ return W.AgionV4Ponte.botApi(); }catch(e){ return 'https://bot.agionconsorcios.com.br'; } }
function pkNome(){ var u=navigator.userAgent||''; if(/iPhone|iPad|iPod/.test(u)) return 'Face ID'; if(/Android/.test(u)) return 'digital'; if(/Macintosh|Mac OS X/.test(u)) return 'Touch ID'; if(/Windows/.test(u)) return 'Windows Hello'; return 'biometria'; }
function pkRotulo(){ var n=pkNome(); return n==='digital'?'Entrar com a digital':'Entrar com '+n; }
function pkAparelho(){ var u=navigator.userAgent||''; return /iPhone/.test(u)?'iPhone':/iPad/.test(u)?'iPad':/Android/.test(u)?'Android':/Macintosh/.test(u)?'Mac':/Windows/.test(u)?'Windows':'Aparelho'; }
function pkSuporte(){ try{ if(!W.PublicKeyCredential||!navigator.credentials||!W.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) return Promise.resolve(false); return W.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().catch(function(){ return false; }); }catch(e){ return Promise.resolve(false); } }
function pkLs(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){ return null; } }
function pkAtivo(){ return pkLs('agp-pk')==='1'; }
function en64(b){ var a=new Uint8Array(b), s=''; for(var i=0;i<a.length;i++) s+=String.fromCharCode(a[i]); return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function de64(t){ t=String(t||'').replace(/-/g,'+').replace(/_/g,'/'); while(t.length%4) t+='='; var s=atob(t), a=new Uint8Array(s.length); for(var i=0;i<s.length;i++) a[i]=s.charCodeAt(i); return a.buffer; }
function pkPost(path,body,tok){ var h={'Content-Type':'application/json'}; if(tok) h.Authorization='Bearer '+tok;
 return fetch(pkBase()+path,{method:'POST',headers:h,body:JSON.stringify(body||{})}).then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ return {ok:r.ok,data:j||{}}; }); }); }
async function pkSessao(){ var sb=supaV1(); if(!sb) return null; try{ var r=await sb.auth.getSession(); return r&&r.data&&r.data.session||null; }catch(e){ return null; } }
/* o Safari só deixa pedir a biometria logo depois do toque: as opções são buscadas ANTES (cache de 4 min) */
var PKC={};
function pkPrep(tipo){ var c=PKC[tipo]; if(c&&Date.now()-c.ts<240000) return Promise.resolve(c);
 var p=tipo==='reg'?pkSessao().then(function(s){ if(!s) throw new Error('Entre com a senha primeiro.'); return pkPost('/api/passkey/registro/opcoes',{},s.access_token).then(function(r){ return {r:r,tok:s.access_token,email:(s.user&&s.user.email)||''}; }); })
  :pkPost('/api/passkey/entrar/opcoes',{}).then(function(r){ return {r:r}; });
 return p.then(function(x){ if(!x.r.ok||!x.r.data.opcoes) throw new Error((x.r.data&&(x.r.data.erro||x.r.data.error))||'Sem conexão com o servidor.'); var c={id:x.r.data.id,o:x.r.data.opcoes,tok:x.tok,email:x.email,ts:Date.now()}; PKC[tipo]=c; return c; }); }
function pkPega(tipo){ var c=PKC[tipo]; delete PKC[tipo]; if(c&&Date.now()-c.ts<240000) return Promise.resolve(c); return pkPrep(tipo).then(function(x){ delete PKC[tipo]; return x; }); }
async function pkAtivar(){
 var k=await pkPega('reg'), o=k.o, r={data:{id:k.id}}, s={access_token:k.tok,user:{email:k.email}};
 var pub={challenge:de64(o.challenge),rp:o.rp,user:{id:de64(o.user.id),name:o.user.name,displayName:o.user.displayName},pubKeyCredParams:o.pubKeyCredParams,timeout:o.timeout||60000,
  excludeCredentials:(o.excludeCredentials||[]).map(function(c){ return {type:'public-key',id:de64(c.id)}; }),authenticatorSelection:o.authenticatorSelection,attestation:o.attestation||'none'};
 var c=await navigator.credentials.create({publicKey:pub});
 var j={id:c.id,rawId:en64(c.rawId),type:c.type,response:{clientDataJSON:en64(c.response.clientDataJSON),attestationObject:en64(c.response.attestationObject),transports:(c.response.getTransports?c.response.getTransports():[])},clientExtensionResults:{},authenticatorAttachment:c.authenticatorAttachment||null};
 var r2=await pkPost('/api/passkey/registro/salvar',{id:r.data.id,credencial:j,aparelho:pkAparelho()},s.access_token);
 if(!r2.ok||!r2.data.ok) throw new Error((r2.data&&(r2.data.erro||r2.data.error))||'não salvou');
 pkLs('agp-pk','1'); pkLs('agp-pk-cred',r2.data.cred||''); pkLs('agp-pk-email',(s.user&&s.user.email)||''); pkLs('agp-pk-nao',null); return true; }
async function pkDesativar(){ var s=await pkSessao(), cr=pkLs('agp-pk-cred');
 if(s&&cr){ try{ await pkPost('/api/passkey/remover',{cred:cr},s.access_token); }catch(e){} }
 pkLs('agp-pk',null); pkLs('agp-pk-cred',null); return true; }
function pkErro(e){ var n=(e&&e.name)||'', m=String((e&&e.message)||e||'');
 if(/NotAllowed|Abort/i.test(n)) return 'Biometria cancelada. Tente de novo ou entre com a senha.';
 if(/InvalidState/i.test(n)) return 'Este aparelho já está ativado.';
 return m||'Não deu certo agora. Entre com a senha.'; }
async function pkEntrar(){ var bt=LG&&LG.querySelector('.lgpk'); if(bt){ bt.disabled=true; bt.textContent='Confirmando…'; } lgMsg('',0);
 try{
  var k=await pkPega('auth'), r={data:{id:k.id}}, o=k.o, pub={challenge:de64(o.challenge),rpId:o.rpId,timeout:o.timeout||60000,userVerification:'required',allowCredentials:(o.allowCredentials||[]).map(function(c){ return {type:'public-key',id:de64(c.id)}; })};
  var c=await navigator.credentials.get({publicKey:pub});
  var j={id:c.id,rawId:en64(c.rawId),type:c.type,response:{clientDataJSON:en64(c.response.clientDataJSON),authenticatorData:en64(c.response.authenticatorData),signature:en64(c.response.signature),userHandle:c.response.userHandle?en64(c.response.userHandle):null},clientExtensionResults:{},authenticatorAttachment:c.authenticatorAttachment||null};
  var r2=await pkPost('/api/passkey/entrar',{id:r.data.id,credencial:j});
  if(!r2.ok||!r2.data.ok) throw new Error((r2.data&&(r2.data.erro||r2.data.error))||'Não confirmou.');
  var sb=supaV1(), v=await sb.auth.verifyOtp({token_hash:r2.data.token_hash,type:'magiclink'});
  if(v.error) v=await sb.auth.verifyOtp({token_hash:r2.data.token_hash,type:'email'});
  if(v.error||!v.data||!v.data.user) throw new Error('Não consegui abrir a sessão. Entre com a senha.');
  if(bt) bt.textContent='Entrando…'; lgT0=Date.now();
  if(typeof W.startSession==='function') await W.startSession(v.data.user); lgEspelha();
 }catch(e){ if(bt){ bt.disabled=false; bt.textContent=pkRotulo(); } lgMsg(pkErro(e)); try{ pkPrep('auth'); }catch(x){} } }
/* convite depois de entrar com senha no celular: "Quer entrar com Face ID da próxima vez?" */
function pkConvite(){ pkSuporte().then(function(ok){ if(!ok||pkAtivo()||pkLs('agp-pk-nao')||D.getElementById('pkconv')) return;
 var cel=/iPhone|iPad|Android/.test(navigator.userAgent||'')||D.documentElement.classList.contains('isApp'); if(!cel) return;
 var n=pkNome(), x=D.createElement('div'); x.id='pkconv';
 x.innerHTML='<style>#pkconv{position:fixed;left:0;right:0;bottom:0;z-index:3000;display:flex;justify-content:center;padding:0 12px calc(12px + env(safe-area-inset-bottom));animation:pkup .45s cubic-bezier(.22,1,.36,1)}@keyframes pkup{from{transform:translateY(110%)}to{transform:none}}#pkconv .b{width:100%;max-width:440px;background:#0B2A26;color:#F3EEE2;border:1px solid rgba(232,204,139,.3);border-radius:22px;padding:18px 18px 14px;box-shadow:0 24px 60px rgba(0,0,0,.4);font-family:"DM Sans",system-ui,sans-serif}#pkconv b{display:block;font:600 17px Lora,Georgia,serif;color:#E8CC8B;margin-bottom:4px}#pkconv p{margin:0 0 14px;font-size:13px;color:#C9D6D1;line-height:1.45}#pkconv .r{display:flex;gap:10px}#pkconv button{flex:1;padding:12px;border-radius:999px;border:1px solid rgba(232,204,139,.35);background:none;color:#E8CC8B;font:700 14px "DM Sans",system-ui}#pkconv button.s{border:0;background:linear-gradient(115deg,#A8853E,#E8CC8B 52%,#C5A059 92%);color:#0B2A26}</style>'+
  '<div class="b"><b>Entrar com '+n+'?</b><p>Da próxima vez você entra sem digitar a senha, só com '+(n==='digital'?'a sua digital':'o '+n)+' deste aparelho. Dá para desligar em Ajustes.</p><div class="r"><button type="button" class="n">Agora não</button><button type="button" class="s">Ativar</button></div><div class="m" style="font-size:12px;color:#F4AAA0;margin-top:8px;min-height:14px"></div></div>';
 D.body.appendChild(x); pkPrep('reg').catch(function(){});
 x.querySelector('.n').onclick=function(){ pkLs('agp-pk-nao',String(Date.now())); x.remove(); };
 x.querySelector('.s').onclick=function(){ var b=this; b.disabled=true; b.textContent='Ativando…';
  pkAtivar().then(function(){ x.querySelector('.b').innerHTML='<b>Pronto!</b><p style="margin:0">Da próxima vez toque em “'+pkRotulo()+'” na tela de entrada.</p>'; setTimeout(function(){ x.remove(); },2600); })
   .catch(function(e){ b.disabled=false; b.textContent='Tentar de novo'; x.querySelector('.m').textContent=pkErro(e); pkPrep('reg').catch(function(){}); }); };
}); }
/* ABRE_LOGADO_26OUT: com sessão salva no aparelho, a abertura não mostra o login nem o verde — só a cor de fundo do app até ele abrir */
function temSessaoSalva(){ try{ for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i)||''; if(/^sb-.*-auth-token$/.test(k)){ var v=localStorage.getItem(k)||''; if(v.indexOf('refresh_token')>=0) return true; } } }catch(e){} return false; }
var SALVA=temSessaoSalva();
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
 '#v4login .lgpk{width:100%;margin-top:10px;padding:13px;border-radius:999px;cursor:pointer;background:rgba(232,204,139,.08);border:1px solid rgba(232,204,139,.45);color:#F1DEA9;font:700 14px "DM Sans",system-ui;align-items:center;justify-content:center;gap:8px}#v4login .lgpk:active{transform:scale(.98)}#v4login .lgpk[disabled]{opacity:.7}'+
 '#v4login .lgf{display:block;margin:14px auto 0;background:none;border:0;color:#A9BFB8;font:600 12.5px "DM Sans",system-ui;cursor:pointer;text-decoration:underline;text-underline-offset:3px}'+
 '#v4login .lgmsg{min-height:18px;margin-top:12px;text-align:center;font-size:12.5px;color:#F4AAA0}#v4login .lgmsg.ok{color:#9FD9B0}'+
 '#v4login .lgt{margin-top:22px;font:italic 400 13px Lora,Georgia,serif;color:#C5A059;text-align:center;opacity:.9}'+
 '#v4login .lgw{margin-top:18px;width:26px;height:26px;border-radius:50%;border:2px solid rgba(232,204,139,.25);border-top-color:#E8CC8B;animation:v4rot .9s linear infinite;opacity:0;transition:opacity .3s}#v4login.esp .lgw{opacity:1}#v4login.form .lgw{display:none}'+
 '@keyframes v4spl{from{opacity:0;transform:scale(.6) rotate(-8deg)}to{opacity:1;transform:none}}@keyframes v4up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}@keyframes v4ln{to{width:140px}}@keyframes v4rot{to{transform:rotate(360deg)}}'+
 '#v4login.cl{background:var(--v4clbg,#F4EFE4)!important}#v4login.cl .lgm,#v4login.cl .lgt,#v4login.cl .lgc{display:none!important}#v4login.cl .lgw{border-color:rgba(163,131,63,.18);border-top-color:#A3833F;width:22px;height:22px}'+
 'body.v4lg #loginView{visibility:hidden}';
 D.head.appendChild(s); }
function lgMontar(){ if(LG) return; lgCss(); D.body.classList.add('v4lg'); W.AgionV4Ponte.splashFeito=true; try{ D.documentElement.classList.add('v4ok'); }catch(e){}
 LG=D.createElement('div'); LG.id='v4login'; if(SALVA) LG.className='cl esp';
 LG.innerHTML='<div class="lgm"><img alt="Agion" src="'+LOGO+'"><b>AGION</b><small>Wealth</small><i></i></div>'+
  '<form class="lgc" autocomplete="on" novalidate><h1>Bem-vindo à <em>Agion</em></h1><p>Plataforma de planejamento financeiro</p>'+
  '<label for="v4em">E-mail</label><input id="v4em" type="email" inputmode="email" autocomplete="username" placeholder="seu@email.com">'+
  '<label for="v4pw">Senha</label><input id="v4pw" type="password" autocomplete="current-password" placeholder="••••••••">'+
  '<button class="lgb" type="submit">Entrar</button><button class="lgpk" type="button" style="display:none"></button><button class="lgf" type="button">Esqueci minha senha</button><div class="lgmsg" role="status"></div></form>'+
  '<div class="lgt">Consórcio para os seus sonhos, planejamento para a sua vida.</div><div class="lgw"></div>';
 D.body.appendChild(LG);
 var im=LG.querySelector('img'); im.onerror=function(){ if(im.src.indexOf(LOGO2)<0) im.src=LOGO2; };
 var f=LG.querySelector('form');
 f.onsubmit=function(e){ e.preventDefault(); lgEntrar(); };
 var pkb=LG.querySelector('.lgpk'); pkb.textContent=pkRotulo(); pkb.onclick=function(){ pkEntrar(); };
 pkSuporte().then(function(ok){ if(ok&&pkAtivo()&&LG&&LG.querySelector('.lgpk')){ var b=LG.querySelector('.lgpk'); b.style.display='flex'; pkPrep('auth').catch(function(){}); var iv=setInterval(function(){ if(!LG){ clearInterval(iv); return; } delete PKC.auth; pkPrep('auth').catch(function(){}); },180000); var em=pkLs('agp-pk-email'); var i=LG.querySelector('#v4em'); if(em&&i&&!i.value) i.value=em; } });
 LG.querySelector('.lgf').onclick=function(){ var em=D.getElementById('logEmail'); if(em) em.value=LG.querySelector('#v4em').value.trim(); lgMsg('',0); try{ forgotPass(); }catch(x){ lgMsg('Serviço indisponível. Recarregue a página.'); } lgEspelha(); };
}
function lgMsg(t,ok){ if(!LG) return; var m=LG.querySelector('.lgmsg'); m.textContent=t||''; m.classList.toggle('ok',!!ok); }
function lgEspelha(){ clearInterval(lgMsgT); var n=0; lgMsgT=setInterval(function(){ n++; var m=D.getElementById('loginMsg'); if(m&&m.textContent.trim()){ var cor=(m.style.color||'').indexOf('bad')<0&&!/erro|inválid|incorret|inform|indispon|não/i.test(m.textContent); lgMsg(m.textContent.trim(),cor); var b=LG&&LG.querySelector('.lgb'); if(b&&!logado()){ b.disabled=false; b.textContent='Entrar'; } } if(n>60||logado()) clearInterval(lgMsgT); },250); }
function lgEntrar(){ PWLOGIN=true; var em=LG.querySelector('#v4em').value.trim(), pw=LG.querySelector('#v4pw').value; if(!em||!pw){ lgMsg('Informe e-mail e senha.'); return; }
 var a=D.getElementById('logEmail'), b=D.getElementById('logPass'), m=D.getElementById('loginMsg'); if(!a||!b||typeof W.doLogin!=='function'){ lgMsg('Serviço de login indisponível. Recarregue a página.'); return; }
 a.value=em; b.value=pw; if(m) m.textContent=''; lgMsg('',0); var bt=LG.querySelector('.lgb'); bt.disabled=true; bt.textContent='Entrando…';
 try{ Promise.resolve(W.doLogin()).catch(function(){}); }catch(x){} lgEspelha(); }
function lgForm(){ if(RECON) return; if(!LG) lgMontar(); if(LG.classList.contains('form')) return; LG.classList.remove('esp','fora','cl'); LG.classList.add('form'); var bt=LG.querySelector('.lgb'); bt.disabled=false; bt.textContent='Entrar'; setTimeout(function(){ var i=LG.querySelector('#v4em'); if(i&&!i.value&&W.innerWidth>760) i.focus(); },700); }
function lgEspera(){ if(RECON) return; if(!LG) lgMontar(); LG.classList.remove('form','fora'); LG.classList.add('esp'); }
function lgSair(){ if(RECON) return; if(!LG) return; if(PWLOGIN){ PWLOGIN=false; setTimeout(pkConvite,2200); } LG.classList.add('fora'); D.body.classList.remove('v4lg'); var x=LG; setTimeout(function(){ if(x.parentNode) x.parentNode.removeChild(x); },650); LG=null; }
W.addEventListener('message',function(e){ if(e.data&&e.data.v4==='pronto'&&fr&&e.source===fr.contentWindow){ lgPronto=true; setTimeout(lgSair, Math.max(0,1300-(Date.now()-lgT0))); } });
function appCliente(){ try{ var a=D.getElementById('app'); return !!(a&&a.classList.contains('show')&&session&&session.role==='cliente'); }catch(e){ return false; } }
function telaLogin(){ var l=D.getElementById('loginView'); return !!(l&&l.offsetParent!==null&&getComputedStyle(l).display!=='none'); }

/* ---------- APARELHOS_23OUT: aparelhos com a conta ativa (Ajustes › Aparelhos conectados) ----------
   Cada aparelho logado avisa o robô que está ativo (a cada 5 min e quando volta para a tela).
   Se alguém desconectar este aparelho pelo X em Ajustes, no próximo aviso a plataforma sai da
   conta aqui e para de receber notificações. Vale para equipe e cliente. */
var APK='agion_aparelho', apUlt=0, apSaindo=false;
function apUid(){ try{ return (session&&session.userId)||null; }catch(e){ return null; } }
function apId(uid){ if(!uid) return null; try{ var o=JSON.parse(localStorage.getItem(APK)||'null'); if(o&&o.uid===uid&&o.id) return o.id;
  var id='a'+Math.random().toString(36).slice(2,10)+Date.now().toString(36); localStorage.setItem(APK,JSON.stringify({uid:uid,id:id})); return id; }catch(e){ return null; } }
function apApp(){ try{ return !!(W.Capacitor||W.cordova||W.navigator.standalone===true||(W.matchMedia&&W.matchMedia('(display-mode: standalone)').matches)); }catch(e){ return false; } }
function apEndpoint(){ try{ if(!('serviceWorker' in navigator)||!navigator.serviceWorker.getRegistrations) return Promise.resolve(null);
  return navigator.serviceWorker.getRegistrations().then(function(rs){ return Promise.all((rs||[]).map(function(r){ return r.pushManager?r.pushManager.getSubscription().catch(function(){ return null; }):null; })); })
   .then(function(ss){ var s=(ss||[]).filter(Boolean)[0]; return s?s.endpoint:null; }).catch(function(){ return null; }); }catch(e){ return Promise.resolve(null); } }
/* APARELHOS_INFO_24OUT: dicas para dar o nome certo ao aparelho (iPhone que se apresenta como Mac, modelo do Android, Windows 11…) */
function apInfo(){ var o={}; try{ o.tq=navigator.maxTouchPoints||0; var sc=W.screen||{}, a=Math.round(sc.width||0), b=Math.round(sc.height||0); o.sw=Math.min(a,b); o.sh=Math.max(a,b); o.dpr=Math.round((W.devicePixelRatio||1)*100)/100; o.mob=!!(W.matchMedia&&W.matchMedia('(pointer:coarse)').matches); }catch(e){} return o; }
var apCH=null;
function apHints(){ if(apCH) return Promise.resolve(apCH); try{ var u=navigator.userAgentData; if(!u||!u.getHighEntropyValues) return Promise.resolve(apCH={});
  return u.getHighEntropyValues(['model','platformVersion','fullVersionList']).then(function(h){ var br=((h&&h.fullVersionList)||u.brands||[]).filter(function(x){ return !/Not.?A.?Brand|Chromium/i.test(x.brand); })[0];
   apCH={model:(h&&h.model)||'',pv:(h&&h.platformVersion)||'',m:!!((h&&h.mobile)||u.mobile),br:br?(br.brand+' '+String(br.version).split('.')[0]):''}; return apCH; }).catch(function(){ return apCH={}; }); }catch(e){ return Promise.resolve(apCH={}); } }
function apPing(forca){ try{ if(apSaindo||typeof apiFetch!=='function') return Promise.resolve(); var uid=apUid(); if(!uid) return Promise.resolve(); if(!forca&&Date.now()-apUlt<60000) return Promise.resolve(); apUlt=Date.now();
  var id=apId(uid); if(!id) return Promise.resolve();
  return Promise.all([apEndpoint(),apHints()]).then(function(v){ var inf=apInfo(); inf.ch=v[1]||{}; return apiFetch('/api/aparelho/ping',{method:'POST',body:JSON.stringify({id:id,ua:String(navigator.userAgent||'').slice(0,240),app:apApp(),endpoint:v[0]||null,plataforma:(navigator.userAgentData&&navigator.userAgentData.platform)||navigator.platform||'',info:inf})}); })
   .then(function(r){ if(r&&r.data&&r.data.revogado) apDesconectado(); }).catch(function(){}); }catch(e){ return Promise.resolve(); } }
function apLimpaLocal(){ try{ localStorage.removeItem(APK); localStorage.setItem('agion_push_ok','0'); }catch(e){}
  try{ if(navigator.serviceWorker&&navigator.serviceWorker.getRegistrations) navigator.serviceWorker.getRegistrations().then(function(rs){ (rs||[]).forEach(function(r){ if(r.pushManager) r.pushManager.getSubscription().then(function(s){ if(s) s.unsubscribe(); }).catch(function(){}); }); }).catch(function(){}); }catch(e){} }
function apDesconectado(){ if(apSaindo) return; apSaindo=true; apLimpaLocal();
  try{ W.AgionV4Ponte._sair0(); }catch(e){ try{ logout(); }catch(_){} }
  setTimeout(function(){ apSaindo=false; try{ lgForm(); lgMsg('Este aparelho foi desconectado da sua conta. Entre de novo para continuar.'); }catch(e){} },1500); }
/* ponte para a tela de Ajustes (iframe) */
W.AgionV4Ponte._sair0=W.AgionV4Ponte.sair;
W.AgionV4Ponte.sair=function(){ /* sair pelo botão: este aparelho some da lista */ var uid=apUid(), id=null; try{ var o=JSON.parse(localStorage.getItem(APK)||'null'); if(o&&o.uid===uid) id=o.id; }catch(e){}
  var fim=function(){ apLimpaLocal(); try{ W.AgionV4Ponte._sair0(); }catch(e){ try{ logout(); }catch(_){} } };
  if(!id||typeof apiFetch!=='function') return fim();
  var feito=false, t=setTimeout(function(){ if(!feito){ feito=true; fim(); } },1800);
  apiFetch('/api/aparelho/desconectar',{method:'POST',body:JSON.stringify({id:id})}).then(function(){ if(!feito){ feito=true; clearTimeout(t); fim(); } },function(){ if(!feito){ feito=true; clearTimeout(t); fim(); } }); };
W.AgionV4Ponte.aparelhos={
  meu:function(){ return apId(apUid()); },
  listar:function(){ var go=function(){ return apiFetch('/api/aparelhos',{method:'GET'}); }; return Promise.resolve(apPing(true)).then(go,go); },
  nomear:function(id,nome){ return apiFetch('/api/aparelho/nome',{method:'POST',body:JSON.stringify({id:id,nome:nome})}); },
  desconectar:function(id){ return apiFetch('/api/aparelho/desconectar',{method:'POST',body:JSON.stringify({id:id})}); }
};
setInterval(function(){ apPing(false); },5*60000);
D.addEventListener('visibilitychange',function(){ if(!D.hidden) apPing(false); });
(function apIni(n){ if(apUid()){ apPing(true); return; } if(n<300) setTimeout(function(){ apIni(n+1); },1000); })(0);


function espera(){
  gancho(); v1Avisos();
  if(logado()){ if(!pronto){ pronto=true; lgPronto=false; lgT0=Date.now(); if(LG) lgEspera(); montar(); setTimeout(function(){ if(!lgPronto) lgSair(); },15000); } }
  else if(pronto && !logado()){ pronto=false; esconder(true); }
  if(!logado()){
    if(appCliente()){ v1Vis(true); lgSair(); }                      /* cliente: segue a v1 (até o Planejamento novo) */
    else if(telaLogin()&&Date.now()-lgT0>(SALVA?7000:1250)) lgForm();   /* ABRE_LOGADO_26OUT: com sessão salva espera ela voltar */             /* deslogado: depois da entrada, mostra o login */
  }
  setTimeout(espera, pronto?1500:250);
}
function inicio(){ lgMontar();
 if(REC==='ok') lgNovaSenha(false); else if(REC==='conv') lgNovaSenha(true);
 else if(REC==='exp'){ limpaUrl(); lgT0=0; lgForm(); lgMsg('Esse link de redefinição expirou ou já foi usado. Toque em “Esqueci minha senha” para receber outro e abra o e-mail mais recente.'); }
 try{ var sb=supaV1(); if(sb&&sb.auth) sb.auth.onAuthStateChange(function(ev){ if(ev==='PASSWORD_RECOVERY'&&!RECON) lgNovaSenha(); }); }catch(e){}
 espera(); }
if(D.readyState==='loading') D.addEventListener('DOMContentLoaded',inicio); else inicio();
})();
