/* ==========================================================================
   Agion — plat-crm-alice.js · Leads em follow-up da Alice fora do CRM da equipe (16/out/2026)
   Regra do Gabriel: enquanto a Alice faz o follow-up (leads.em_followup = true),
   o lead NÃO aparece no CRM de especialista/líder — só nas Conversas, já designado.
   Quando converte (pede especialista etc.), o robô grava em_followup=false e ele entra.
   O master vê todos, com a etiqueta "Com a Alice" no card.
   Camada aditiva: envolve visibleLeads() e renderCRM(); não altera dados.
   ========================================================================== */
(function(){
'use strict';
var W=window, D=document;
var SET=null, CARREGANDO=false, ULT=0;

function SB(){ try{ return W.supa||(typeof supa!=='undefined'?supa:null); }catch(e){ return null; } }
function master(){ try{ return effRole()==='master'; }catch(e){ return true; } }
function staff(){ try{ return ['master','lider','especialista'].indexOf(session.role)>=0; }catch(e){ return false; } }

async function carregar(forcar){
  if(CARREGANDO||!staff()) return; if(!forcar&&SET&&Date.now()-ULT<60000) return;
  var sb=SB(); if(!sb) return; CARREGANDO=true;
  try{ var r=await sb.from('leads').select('id').eq('em_followup',true).limit(5000);
    if(!r.error){ var novo={}; (r.data||[]).forEach(function(x){ novo[x.id]=1; });
      var mudou=!SET||Object.keys(novo).length!==Object.keys(SET).length||Object.keys(novo).some(function(k){ return !SET[k]; });
      SET=novo; ULT=Date.now();
      if(mudou){ try{ if(view.page==='crm'||view.page==='dash'||view.page==='kpis') render(); }catch(e){} } }
  }catch(e){}
  CARREGANDO=false; }
function comAlice(id){ return !!(SET&&SET[id]); }

function css(){ if(D.getElementById('caCss')) return; var s=D.createElement('style'); s.id='caCss'; s.textContent=
  '.lv2-chip.ca-chip{color:#8FD9CC;border-color:rgba(143,217,204,.45);background:rgba(14,124,123,.16)}body.light .lv2-chip.ca-chip{color:#0E7C7B}';
  D.head.appendChild(s); }
function marcarCards(){ if(!SET||!master()) return; css();
  D.querySelectorAll('#content .lead.lead-v2').forEach(function(c){ if(c.__ca) return; c.__ca=1;
    var m=(c.getAttribute('ondragstart')||'').match(/dragStart\(event,'([^']+)'\)/); if(!m||!comAlice(m[1])) return;
    var chip=c.querySelector('.lv2-chip'); if(!chip||!chip.parentNode) return;
    var s=D.createElement('span'); s.className='lv2-chip ca-chip'; s.title='A Alice está fazendo o follow-up; especialistas e líderes ainda não veem este lead no CRM'; s.textContent='🤖 Com a Alice';
    chip.parentNode.insertBefore(s,chip); }); }

function hook(){
  if(W.__agionCrmAlice) return;
  if(typeof W.visibleLeads!=='function'||typeof W.renderCRM!=='function') return setTimeout(hook,150);
  W.__agionCrmAlice=true;
  var _v=W.visibleLeads; W.visibleLeads=function(){ var L=_v.apply(this,arguments); try{ if(SET&&!master()) return (L||[]).filter(function(l){ return !comAlice(l.id); }); }catch(e){} return L; };
  var _c=W.renderCRM; W.renderCRM=function(){ var o=_c.apply(this,arguments); try{ marcarCards(); carregar(false); }catch(e){} return o; };
  setTimeout(function(){ carregar(true); },1500);
  setInterval(function(){ if(!D.hidden) carregar(false); },60000);
}
W.AgionCrmAlice={comAlice:comAlice,recarregar:function(){ return carregar(true); }};
if(D.readyState==='loading') D.addEventListener('DOMContentLoaded',hook); else hook();
})();
