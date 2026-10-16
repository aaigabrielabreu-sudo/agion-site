/* ==========================================================================
   Agion — plat-contas-papel.js · Atribuição do colaborador (16/out/2026)
   Na aba Contas (só o master), cada líder/especialista ganha o botão
   "Atribuição": trocar entre Líder e Especialista (colaborador) e escolher o
   líder de um especialista. Grava em profiles.role / leader_id (e papel, se o
   papel era o rótulo padrão). Camada aditiva: envolve contPanelsHtml().
   ========================================================================== */
(function(){
'use strict';
var W=window, D=document;
var LBL={lider:'Líder',especialista:'Especialista'};
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
function SB(){ try{ return W.supa||(typeof supa!=='undefined'?supa:null); }catch(e){ return null; } }
function souMaster(){ try{ return session.role==='master'&&!session.viewAs; }catch(e){ return false; } }
function contas(){ try{ return (db.accounts||[]).filter(function(a){ return a.real; }); }catch(e){ return []; } }

function abrir(id){
  if(!souMaster()){ try{ flash('Só o proprietário muda a atribuição.'); }catch(e){} return; }
  var a=contas().find(function(x){ return x.id===id; }); if(!a) return;
  var lideres=contas().filter(function(x){ return x.role==='lider'&&x.id!==a.id&&x.ativo!==false; });
  var m=D.getElementById('cpModal'); if(m) m.remove();
  m=D.createElement('div'); m.id='cpModal'; m.className='tk2-mbg';
  var opt=function(r){ return '<label class="cp-op"><input type="radio" name="cpRole" value="'+r+'"'+(a.role===r?' checked':'')+'> <b>'+LBL[r]+'</b><span>'+(r==='lider'?'Vê e gerencia a própria equipe de especialistas.':'Colaborador: vê só os próprios leads, clientes e conversas.')+'</span></label>'; };
  m.innerHTML='<div class="tk2-modal"><h3>Atribuição · '+esc(a.nome)+'</h3>'+
    '<div class="tk2-lab">Função na plataforma</div>'+opt('especialista')+opt('lider')+
    '<div id="cpLiderBox"><div class="tk2-lab">Líder deste especialista</div><select id="cpLider" class="tk2-in"><option value="">Nenhum (responde direto a você)</option>'+
      lideres.map(function(l){ return '<option value="'+l.id+'"'+(a.leaderId===l.id?' selected':'')+'>'+esc(l.nome)+'</option>'; }).join('')+'</select></div>'+
    '<p class="note" style="margin:10px 0 0;font-size:12px">A mudança vale no próximo acesso da pessoa (ou ao recarregar a plataforma).</p>'+
    '<div class="tk2-btns" style="justify-content:flex-end"><button class="btn btn-sm" onclick="document.getElementById(\'cpModal\').remove()">Cancelar</button><button class="btn btn-gold btn-sm" id="cpOk">Salvar</button></div></div>';
  m.addEventListener('click',function(e){ if(e.target===m) m.remove(); });
  D.body.appendChild(m); css();
  var box=D.getElementById('cpLiderBox');
  var sync=function(){ var r=(m.querySelector('input[name=cpRole]:checked')||{}).value; box.style.display=r==='especialista'?'':'none'; };
  m.querySelectorAll('input[name=cpRole]').forEach(function(i){ i.onchange=sync; }); sync();
  D.getElementById('cpOk').onclick=function(){ salvar(a, (m.querySelector('input[name=cpRole]:checked')||{}).value, D.getElementById('cpLider').value||null); };
}
async function salvar(a,role,leader){
  if(!role||!LBL[role]) return;
  if(role==='lider') leader=null;
  var antes={role:a.role,leaderId:a.leaderId||null};
  if(antes.role===role&&antes.leaderId===leader){ D.getElementById('cpModal').remove(); return; }
  var upd={role:role,leader_id:leader};
  if(!a.papel||a.papel===LBL[a.role]||a.papel==='Master') upd.papel=LBL[role];
  var sb=SB(); var r=null;
  try{ r=await sb.from('profiles').update(upd).eq('id',a.id).select('id,role,leader_id'); }catch(e){ r={error:e}; }
  if(!r||r.error||!r.data||!r.data.length){ try{ await ask({title:'Não foi possível salvar',msg:'O banco recusou a mudança'+(r&&r.error&&r.error.message?' ('+r.error.message+')':'')+'. Nada foi alterado.',ok:'Ok'}); }catch(e){} return; }
  a.role=role; a.leaderId=leader; if(upd.papel) a.papel=upd.papel;
  /* quem tinha este líder e ele virou especialista fica sem líder (responde direto ao master) */
  if(antes.role==='lider'&&role!=='lider'){ var orf=contas().filter(function(x){ return x.leaderId===a.id; });
    for(var i=0;i<orf.length;i++){ try{ await sb.from('profiles').update({leader_id:null}).eq('id',orf[i].id); orf[i].leaderId=null; }catch(e){} } }
  try{ logEvt('conta_atribuicao','conta','Mudou a atribuição de '+a.nome+': '+(LBL[antes.role]||antes.role)+' → '+LBL[role],{de:antes.role,para:role,lider:leader}); }catch(e){}
  try{ save(); }catch(e){}
  var m=D.getElementById('cpModal'); if(m) m.remove();
  try{ renderContas(D.getElementById('content')); flash(a.nome.split(' ')[0]+' agora é '+LBL[role]+'.'); }catch(e){}
}
function css(){ if(D.getElementById('cpCss')) return; var s=D.createElement('style'); s.id='cpCss'; s.textContent=
  '.cp-op{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;padding:10px 12px;margin:6px 0;border:1px solid var(--line,rgba(255,255,255,.1));border-radius:12px;cursor:pointer}'+
  '.cp-op input{accent-color:#C5A059;margin:0}.cp-op b{color:var(--head,#fff)}.cp-op span{flex-basis:100%;font-size:12px;color:var(--soft,#9DB5B1);padding-left:22px}'+
  '.cp-op:has(input:checked){border-color:rgba(197,160,89,.6);background:rgba(197,160,89,.08)}';
  D.head.appendChild(s); }

function hook(){
  if(W.__agionContasPapel) return;
  if(typeof W.contPanelsHtml!=='function') return setTimeout(hook,150);
  W.__agionContasPapel=true;
  var _c=W.contPanelsHtml; W.contPanelsHtml=function(){ var h=_c.apply(this,arguments);
    try{ if(!souMaster()) return h; contas().forEach(function(a){ if(a.role!=='lider'&&a.role!=='especialista') return;
      var alvo='<button class="btn btn-ghost btn-sm" onclick="resetAccount(\''+a.id+'\')">';
      if(h.indexOf(alvo)>=0) h=h.replace(alvo,'<button class="btn btn-ghost btn-sm cp-bt" onclick="AgionContasPapel.abrir(\''+a.id+'\')">Atribuição</button>'+alvo); }); }catch(e){}
    return h; };
}
W.AgionContasPapel={abrir:abrir};
if(D.readyState==='loading') D.addEventListener('DOMContentLoaded',hook); else hook();
})();
