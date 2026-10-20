/* ==========================================================================
   Agion — plat-mkt.js · Perfil Marketing (20/out/2026)
   Marketing (ex.: MAAV) = conta de líder com o cargo começando por "Marketing".
   No banco continua role=lider (mesmas permissões de leitura); aqui só muda a
   visão: o CRM inteiro aparece (todos os leads), sem clientes nem comissões.
   Camada aditiva: envolve visibleLeads(). Nada é sobrescrito no banco.
   ========================================================================== */
(function(){
'use strict';
var W=window;
function conta(id){ try{ return (db.accounts||[]).find(function(a){ return a.id===id; })||null; }catch(e){ return null; } }
function ehConta(id){ var a=conta(id); return !!(a&&a.role==='lider'&&/^\s*marketing/i.test(a.papel||'')); }
function eh(){ try{ return effRole()==='lider'&&ehConta(effId()); }catch(e){ return false; } }
W.AgionMkt={eh:eh,ehConta:ehConta};
var _vl=W.visibleLeads;
if(typeof _vl==='function'){ W.visibleLeads=function(){ try{ if(eh()) return db.crm||[]; }catch(e){} return _vl.apply(this,arguments); }; }
})();
