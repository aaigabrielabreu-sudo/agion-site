/* ==========================================================================
   Agion — plat2-avisos.js · RESERVA_CAIU_26OUT (pedido do Gabriel, 26/out)
   Quando uma reserva da Agion cai no portal da HS (venceu ou foi cancelada lá), o robô que confere
   o painel de hora em hora tira a cota das reservas e da posição do cliente e grava um aviso em
   reservas_avisos. Aqui: ao abrir o card do lead (CRM) ou a ficha do cliente, aparece a faixa
   “Reserva caiu na HS” com as cotas; “Entendi” marca como visto para a equipe toda.
   ========================================================================== */
(function(){
'use strict';
var W=window;
function $(s,r){return (r||document).querySelector(s);} function $$(s,r){return [].slice.call((r||document).querySelectorAll(s));}
function e4(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function norm(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().split(/\s+/).filter(Boolean).join(' ');}
function sb(){try{return W.psb();}catch(e){return null;}}
function toast(t,i){try{W.toast(t,i);}catch(e){}}
function ddmm(iso){try{var d=new Date(iso);return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2);}catch(e){return '';}}
var st=document.createElement('style');st.textContent=
'.rcai{display:flex;align-items:flex-start;gap:10px;background:#FCEDEA;color:#7A2A1F;border:1px solid #F1C7BE;border-radius:16px;padding:11px 13px;margin:10px 0 12px;font-size:13px;line-height:1.4;text-align:left}'+
'.rcai .ri{flex:none;width:26px;height:26px;border-radius:50%;background:#C2463B;color:#fff;display:grid;place-items:center;font-weight:800;font-size:14px}'+
'.rcai .rt{flex:1;min-width:0}.rcai .rt b{display:block;font-weight:700;color:#7A2A1F}.rcai .rt span{display:block;color:#8F4B40}'+
'.rcai .ra{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.rcai button{border:0;border-radius:999px;padding:6px 12px;font:700 12px/1.2 inherit;cursor:pointer;background:#C2463B;color:#fff}'+
'.rcai button.ol{background:#fff;color:#7A2A1F;border:1px solid #F1C7BE}'+
'body.dark .rcai{background:#3A1F1B;color:#F6D3CC;border-color:#5E2E26}body.dark .rcai .rt b{color:#F6D3CC}body.dark .rcai .rt span{color:#E3AFA5}body.dark .rcai button.ol{background:transparent;color:#F6D3CC;border-color:#5E2E26}';
document.head.appendChild(st);
var CACHE={},VIS={};   /* VIS: avisos já marcados como vistos nesta tela (não volta a pintar) */
async function avisosDe(nome){var k=norm(nome);if(!k)return [];var s=sb();if(!s)return [];
 try{var r=await s.from('reservas_avisos').select('id,grupo,cota,criado_em,cliente_nome,motivo').eq('nome_norm',k).is('visto_em',null).order('grupo').order('cota');CACHE[k]=(r&&r.data)||[];return CACHE[k];}catch(e){return [];}}
function html(L){var por={},ord=[];L.forEach(function(a){if(!por[a.grupo]){por[a.grupo]=[];ord.push(a.grupo);}por[a.grupo].push(a);});
 var lin=ord.map(function(g){var cs=por[g].map(function(a){return a.cota;}).sort(function(a,b){return a-b;});return 'Grupo '+e4(g)+' · cota'+(cs.length>1?'s ':' ')+cs.join(', ');}).join(' · ');
 var dt=ddmm(L[0].criado_em);
 return '<span class="ri">!</span><div class="rt"><b>'+(L.length>1?'Caíram '+L.length+' reservas na HS':'Caiu uma reserva na HS')+'</b><span>'+lin+(dt?' · em '+dt:'')+'. '+(L.length>1?'Elas voltaram':'Ela voltou')+' à venda no portal e '+(L.length>1?'saíram':'saiu')+' das reservas deste cliente.</span>'+
  '<div class="ra"><button type="button" data-rc="ok">Entendi</button><button type="button" class="ol" data-rc="mapa">Reservar de novo</button></div></div>';}
async function visto(L,box){var s=sb();if(!s)return;var uid=null;try{var u=await s.auth.getUser();uid=u&&u.data&&u.data.user?u.data.user.id:null;}catch(e){}
 try{var r=await s.from('reservas_avisos').update({visto_em:new Date().toISOString(),visto_por:uid}).in('id',L.map(function(a){return a.id;}));if(r&&r.error)throw r.error;
  L.forEach(function(a){VIS[a.id]=1;});
  if(box){box.style.transition='opacity .25s';box.style.opacity=0;setTimeout(function(){box.remove();},260);}toast('Aviso guardado como visto','ok');
 }catch(e){toast('Não consegui marcar como visto agora','x');}}
function poe(alvo,antes,L){L=(L||[]).filter(function(a){return !VIS[a.id];});if(!alvo||!L.length)return null;if($('.rcai',alvo))return $('.rcai',alvo);
 var b=document.createElement('div');b.className='rcai';b.innerHTML=html(L);
 if(antes&&antes.parentNode===alvo)alvo.insertBefore(b,antes.nextSibling);else alvo.insertBefore(b,alvo.firstChild);
 $('[data-rc="ok"]',b).onclick=function(e){e.stopPropagation();visto(L,b);};
 $('[data-rc="mapa"]',b).onclick=function(e){e.stopPropagation();try{window.open('/melhores-cartas','_blank');}catch(x){}};
 return b;}
/* card do lead (CRM) */
function ligaDeal(){if(typeof W.openDeal!=='function')return setTimeout(ligaDeal,250);if(W.openDeal.__rc)return;
 var _od=W.openDeal;W.openDeal=function(d){var r=_od.apply(this,arguments);
  try{var m=$$('.dm').pop();if(m&&d&&d.nome){avisosDe(d.nome).then(function(L){if(!L.length||!m.isConnected)return;
    var pin=function(){var inn=$('.in',m);if(!inn||$('.rcai',inn))return;poe(inn,$('h2',inn),L);};setTimeout(pin,120);
    var inn=$('.in',m);if(inn&&W.MutationObserver){var mo=new MutationObserver(function(){if(!m.isConnected){mo.disconnect();return;}if(!$('.rcai',inn))setTimeout(pin,60);});mo.observe(inn,{childList:true});}
    toast((L.length>1?L.length+' reservas':'Uma reserva')+' de '+String(d.nome).split(' ')[0]+' caiu na HS','x');});}}catch(e){}
  return r;};W.openDeal.__rc=1;}
/* ficha do cliente (ou do lead aberto como ficha) */
function ligaFicha(){if(!W.R||typeof W.R.cliente!=='function')return setTimeout(ligaFicha,250);if(W.R.cliente.__rc)return;
 var _rc=W.R.cliente;W.R.cliente=function(v,arg){var r=_rc.apply(this,arguments);
  try{arg=arg||{};var nome=arg.lead?arg.lead.nome:((W.CLIENTES||[]).filter(function(x){return x.id===arg.id;})[0]||{}).nome;
   if(nome)avisosDe(nome).then(function(L){if(!L.length)return;var go=function(n){if(!v.isConnected)return;var hx=$('.hx',v);if(!hx&&n<20)return setTimeout(function(){go(n+1);},150);poe(v,hx,L);};go(0);});}catch(e){}
  return r;};W.R.cliente.__rc=1;}
ligaDeal();ligaFicha();
W.AGAvisos={de:avisosDe,norm:norm};
})();
