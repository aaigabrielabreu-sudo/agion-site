/* ==========================================================================
   Agion — plat-crm-reeng.js · Lead de reengajamento fica fora do CRM (20/out/2026)
   REENG_FORA_CRM_20261020: a pedido do Gabriel, lead SEM responsável e com tipo
   "reengajamento" (o robô está reengajando) não aparece no CRM de ninguém:
   quadro, contagens, "aguardando distribuição" e rodízio. O cadastro continua.
   Quando a pessoa volta a conversar e o robô passa para um especialista,
   o lead ganha dono e tipo "whatsapp" e volta para o CRM sozinho.
   Camada aditiva: envolve visibleLeads() (a v4 lê por ela). Não altera dados.
   ========================================================================== */
(function(){
'use strict';
var W=window;
function foraCRM(l){ return !!l && !l.ownerId && String(l.tipo||'').trim().toLowerCase()==='reengajamento'; }
W.agForaCRM=foraCRM;
function hook(){
  if(W.__agionCrmReeng) return;
  if(typeof W.visibleLeads!=='function') return setTimeout(hook,150);
  W.__agionCrmReeng=true;
  var _v=W.visibleLeads;
  W.visibleLeads=function(){ var r=_v.apply(this,arguments); try{ return (r||[]).filter(function(l){ return !foraCRM(l); }); }catch(e){ return r; } };
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',hook); else hook();
})();
