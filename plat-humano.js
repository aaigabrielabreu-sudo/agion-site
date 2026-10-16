/* ==========================================================================
   Agion — plat-humano.js · "Você no comando" na aba Conversas (16/out/2026)
   Faixa embaixo do cabeçalho da conversa com o estado da Alice e os botões
   "Assumir" (pausa sem prazo) e "Devolver para a Alice" (ela volta na hora).
   Servidor: GET/POST {BOT_API}/api/humano (pronto pelo chat do robô).
   Camada aditiva: só envolve convRenderChat/convOpen/convRefreshChat.
   ========================================================================== */
(function(){
'use strict';
var W=window, D=document;
var ST={}, LAST={}, BUSY=false;

function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
function phoneAtual(){ try{ return convState&&convState.phone; }catch(e){ return null; } }
function hora(v){ if(v==null||v==='') return ''; var d=(typeof v==='number')?new Date(v<1e12?v*1000:v):new Date(v); if(isNaN(d)) return ''; return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); }
function nomeQuem(q){ if(!q) return ''; try{ var a=(db.accounts||[]).find(function(x){ return x.id===q; }); if(a) return (a.nome||'').split(' ')[0]; }catch(e){} return String(q).split(' ')[0]; }
function souEu(q){ try{ if(!q) return false; if(q===meId()) return true; var me=(db.accounts||[]).find(function(x){ return x.id===meId(); }); return !!(me&&me.nome&&String(q).toLowerCase()===String(me.nome).toLowerCase()); }catch(e){ return false; } }

function css(){ if(D.getElementById('huCss')) return; var s=D.createElement('style'); s.id='huCss'; s.textContent=
 '.hu-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 14px;border-bottom:1px solid var(--line,rgba(255,255,255,.06));font-size:12.5px;background:rgba(14,124,123,.08)}'+
 '.hu-bar.on{background:rgba(197,160,89,.12)}'+
 '.hu-dot{width:8px;height:8px;border-radius:50%;background:#2fbf8f;flex-shrink:0;box-shadow:0 0 0 3px rgba(47,191,143,.18)}'+
 '.hu-bar.on .hu-dot{background:var(--gold2,#d8b46a);box-shadow:0 0 0 3px rgba(197,160,89,.22)}'+
 '.hu-tx{flex:1 1 180px;min-width:0;color:var(--soft,#b9c7c6)}.hu-tx b{color:var(--head,#fff);font-weight:600}'+
 '.hu-bt{border:1px solid var(--line-gold,rgba(197,160,89,.4));background:transparent;color:var(--gold2,#d8b46a);border-radius:999px;padding:5px 12px;font:inherit;font-weight:600;cursor:pointer;white-space:nowrap}'+
 '.hu-bt:hover{background:rgba(197,160,89,.12)}.hu-bt[disabled]{opacity:.5;cursor:default}'+
 '.hu-bt.alt{border-color:rgba(255,255,255,.18);color:var(--soft,#cfd8d7)}'+
 'body.light .hu-bar{background:rgba(14,124,123,.06)}body.light .hu-bar.on{background:rgba(197,160,89,.14)}'+
 '@media (max-width:640px){.hu-bar{padding:7px 12px;gap:8px}.hu-tx{flex:1 1 calc(100% - 26px)}}';
 D.head.appendChild(s); }

function texto(s){
  if(!s) return {on:false,html:'Carregando…'};
  if(s.ativo){
    var q=s.quem?nomeQuem(s.quem):''; var quem=souEu(s.quem)?'Você':(q||'Alguém da equipe');
    if(s.fixo) return {on:true,html:'<b>'+esc(quem)+' no comando</b> · a Alice está pausada até alguém devolver a conversa.'};
    var h=hora(s.ate); return {on:true,html:'<b>'+esc(quem)+' no comando</b> · a Alice volta'+(h?' às '+h:' em até '+(s.janela_min||30)+' min')+' se ninguém responder.'};
  }
  return {on:false,html:'<b>A Alice está atendendo.</b> Se você mandar uma mensagem, ela pausa por '+((s&&s.janela_min)||30)+' min.'};
}
function pintar(){
  var mn=D.getElementById('waMain'); if(!mn) return; var hd=mn.querySelector('.wa-chd'); if(!hd) return;
  var ph=phoneAtual(); if(!ph) return; css();
  var s=ST[ph]; var t=texto(s);
  var bar=mn.querySelector('.hu-bar'); if(!bar){ bar=D.createElement('div'); bar.className='hu-bar'; hd.insertAdjacentElement('afterend',bar); }
  bar.classList.toggle('on',!!t.on);
  var bts='';
  if(s){ if(!s.ativo||!s.fixo) bts+='<button class="hu-bt" onclick="AgionHumano.assumir()" title="Pausa a Alice e o follow-up sem prazo, até você devolver">Assumir</button>';
         if(s.ativo) bts+='<button class="hu-bt alt" onclick="AgionHumano.devolver()" title="A Alice volta a responder agora">Devolver para a Alice</button>'; }
  bar.innerHTML='<span class="hu-dot" aria-hidden="true"></span><span class="hu-tx">'+t.html+'</span>'+bts;
  if(BUSY) bar.querySelectorAll('.hu-bt').forEach(function(b){ b.disabled=true; });
}
async function carregar(ph,forcar){
  if(!ph||typeof apiFetch!=='function') return;
  if(!forcar&&LAST[ph]&&Date.now()-LAST[ph]<25000){ pintar(); return; }
  LAST[ph]=Date.now();
  try{ var r=await apiFetch('/api/humano?phone='+encodeURIComponent(ph)); if(r&&r.ok&&r.data) ST[ph]=r.data; }catch(e){}
  if(phoneAtual()===ph) pintar();
}
async function acao(a){
  var ph=phoneAtual(); if(!ph||BUSY) return;
  try{ if(typeof roGuard==='function'&&roGuard()) return; }catch(e){}
  BUSY=true; pintar();
  var r=null; try{ r=await apiFetch('/api/humano',{method:'POST',body:JSON.stringify({phone:ph,acao:a})}); }catch(e){}
  BUSY=false;
  if(!r||!r.ok){ try{ flash('Não deu certo: '+((r&&r.data&&r.data.error)||(r&&r.status)||'sem conexão com o robô')); }catch(e){} pintar(); return; }
  try{ flash(a==='assumir'?'Você assumiu a conversa. A Alice fica em silêncio.':'Conversa devolvida para a Alice.'); }catch(e){}
  await carregar(ph,true);
}

function hook(){
  if(W.__agionHumano) return;
  if(typeof W.convRenderChat!=='function'||typeof W.convOpen!=='function') return setTimeout(hook,120);
  W.__agionHumano=true;
  var _r=W.convRenderChat; W.convRenderChat=function(){ var o=_r.apply(this,arguments); try{ pintar(); carregar(phoneAtual(),false); }catch(e){} return o; };
  var _o=W.convOpen; W.convOpen=async function(){ var o=await _o.apply(this,arguments); try{ carregar(phoneAtual(),true); }catch(e){} return o; };
  if(typeof W.convRefreshChat==='function'){ var _f=W.convRefreshChat; W.convRefreshChat=async function(){ var o=await _f.apply(this,arguments); try{ carregar(phoneAtual(),false); }catch(e){} return o; }; }
}
W.AgionHumano={assumir:function(){ return acao('assumir'); },devolver:function(){ return acao('devolver'); },_estado:ST};
if(D.readyState==='loading') D.addEventListener('DOMContentLoaded',hook); else hook();
})();
