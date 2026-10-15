/* ==========================================================================
   Agion — plat-importar.js
   1. Comissões › Importar pagamentos do mês (PDF da administradora, todo dia 11):
      casa cada linha do PDF com as vendas (grupo/cota ou nome), mostra uma revisão
      e só grava depois da confirmação do proprietário (comissoes_vendas.situacao + pagamentos_mes).
   2. Ferramentas › Assembleias: resultado mensal por grupo (sorteio, lance livre, fixo,
      2º fixo, embutido, excluídos…), destaques e calendário. Importação por PDF com
      mapeamento de colunas revisável. Visível para a equipe; só o proprietário importa.
   Camada aditiva: não altera funções existentes, só acrescenta botões/cartões depois do render.
   ========================================================================== */
(function(){
'use strict';
var W=window, D=document;
function $(s,r){ try{ return (r||D).querySelector(s); }catch(e){ return null; } }
function $$(s,r){ try{ return [].slice.call((r||D).querySelectorAll(s)); }catch(e){ return []; } }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
function SB(){ try{ return W.supa||(typeof supa!=='undefined'?supa:null); }catch(e){ return null; } }
function isM(){ try{ return session&&session.role==='master'&&!session.viewAs; }catch(e){ return false; } }
function isStaffEff(){ try{ var r=effRole(); return r==='master'||r==='lider'||r==='especialista'; }catch(e){ return false; } }
function toast(m){ try{ flash(m); }catch(e){ alert(m); } }
function norm(s){ return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim(); }
function nz(s){ return String(s==null?'':s).replace(/\D/g,'').replace(/^0+/,'')||''; }
function mesAtual(){ var d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'); }
function mesLbl(m){ if(!m) return ''; var p=m.split('-'); var N=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']; return (N[(+p[1])-1]||p[1])+'/'+p[0]; }
function num(s){ if(s==null) return null; var t=String(s).replace(/[^\d,.\-]/g,''); if(!t) return null; if(t.indexOf(',')>=0) t=t.replace(/\./g,'').replace(',','.'); var n=parseFloat(t); return isNaN(n)?null:n; }
function int0(s){ var n=num(s); return n==null?0:Math.round(n); }
function admKey(s){ s=norm(s); if(/ancora/.test(s)) return 'ANCORA'; if(/\bhs\b|hs cons/.test(s)) return 'HS'; return s?s.toUpperCase():''; }
var ADM_LBL={HS:'HS Consórcios',ANCORA:'Âncora Consórcios'};
var TIPO_LBL={IMOVEL:'Imóvel',AUTOMOVEL:'Automóvel',SERVICOS:'Serviços',OUTRO:'Outro'};

/* ---------- estilos ---------- */
(function css(){ if($('#impCss')) return; var st=D.createElement('style'); st.id='impCss'; st.textContent=[
'.imp-bg{position:fixed;inset:0;z-index:700;background:var(--surface-overlay,rgba(4,12,14,.72));display:flex;align-items:center;justify-content:center;padding:16px}',
'.imp-md{background:var(--card,#0E2A31);border:1px solid var(--line-strong,rgba(143,217,204,.28));border-radius:18px;width:min(1100px,100%);max-height:92vh;display:flex;flex-direction:column;box-shadow:var(--shadow-4,0 30px 80px rgba(0,0,0,.55));animation:modal-in var(--dur-3,320ms) var(--ease-out,ease) both}',
'.imp-hd{padding:18px 22px 10px;border-bottom:1px solid var(--line)}.imp-hd h2{margin:0 0 4px}.imp-hd p{margin:0;color:var(--soft);font-size:.86rem}',
'.imp-bd{padding:14px 22px;overflow:auto;flex:1}.imp-ft{padding:12px 22px;border-top:1px solid var(--line);display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;align-items:center}',
'.imp-ft .sp{flex:1}.imp-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-bottom:12px}',
'.imp-row label{display:block;font-size:.74rem;color:var(--soft);margin-bottom:4px}.imp-row input,.imp-row select{width:100%}',
'.imp-drop{border:1.5px dashed var(--line-strong);border-radius:14px;padding:22px;text-align:center;color:var(--soft);cursor:pointer;transition:border-color var(--dur-1,120ms) linear,background-color var(--dur-1,120ms) linear}',
'.imp-drop:hover,.imp-drop.on{border-color:var(--gold);background:rgba(197,160,89,.06)}.imp-drop b{color:var(--head,#F2FAF8)}',
'.imp-tbl{width:100%;border-collapse:collapse;font-size:.82rem}.imp-tbl th,.imp-tbl td{padding:7px 8px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}',
'.imp-tbl th{position:sticky;top:0;background:var(--card,#0E2A31);z-index:1;font-size:.72rem;color:var(--soft);font-weight:600}',
'.imp-tbl td.n,.imp-tbl th.n{text-align:right;font-variant-numeric:tabular-nums}.imp-tbl input{width:100%;min-width:52px;padding:4px 6px;font-size:.8rem}',
'.imp-tbl select{padding:4px 6px;font-size:.78rem}.imp-tbl .src{color:var(--soft);font-size:.72rem;max-width:340px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
'.imp-chip{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;font-size:.7rem;font-weight:600;background:rgba(143,217,204,.1);color:#8FD9CC}',
'.imp-chip.ok{background:var(--ok-bg);color:var(--ok)}.imp-chip.bad{background:var(--bad-bg);color:var(--bad)}.imp-chip.warn{background:var(--warn-bg);color:var(--warn)}',
'.imp-note{font-size:.8rem;color:var(--soft);margin:8px 0}.imp-err{color:var(--bad);font-size:.84rem;margin:8px 0}',
'.imp-banner{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:0 0 14px;padding:10px 14px;border:1px solid var(--line);border-radius:12px;background:rgba(143,217,204,.03);font-size:.82rem;color:var(--soft)}',
'.imp-banner b{color:var(--head,#F2FAF8)}',
/* assembleias */
'.as-top{display:flex;gap:10px;flex-wrap:wrap;align-items:end;margin-bottom:14px}.as-top label{display:block;font-size:.72rem;color:var(--soft);margin-bottom:4px}',
'.as-back{background:none;border:none;color:var(--soft);cursor:pointer;font-size:.84rem;padding:0;margin:0 0 10px}.as-back:hover{color:var(--gold2)}',
'.as-hl{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin:0 0 16px}',
'.as-hc{border:1px solid var(--line);border-radius:14px;padding:12px 14px;background:rgba(255,255,255,.02)}.as-hc h4{margin:0 0 8px;font-size:.74rem;letter-spacing:.08em;text-transform:uppercase;color:var(--soft)}',
'.as-hc ol{margin:0;padding-left:18px;font-size:.86rem}.as-hc li{margin:3px 0}.as-hc li b{color:var(--gold2)}.as-hc .v{float:right;color:var(--soft);font-variant-numeric:tabular-nums}',
'.as-ag{display:flex;gap:8px;flex-wrap:wrap}.as-ag span{border:1px solid var(--line);border-radius:999px;padding:5px 11px;font-size:.8rem}.as-ag span b{color:var(--gold2)}',
'.as-tbl th{cursor:pointer;user-select:none}.as-tbl th.on{color:var(--gold2)}.as-tbl tr.top td:first-child{box-shadow:inset 3px 0 0 var(--gold)}',
'@media (max-width:640px){.imp-md{max-height:96vh}.imp-hd,.imp-bd,.imp-ft{padding-left:14px;padding-right:14px}}'
].join('\n'); D.head.appendChild(st); })();

/* ---------- PDF → linhas (pdf.js) ---------- */
var PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
function loadPdfJs(){ return new Promise(function(res,rej){ if(W.pdfjsLib) return res(W.pdfjsLib);
  var s=D.createElement('script'); s.src=PDFJS+'pdf.min.js'; s.onload=function(){ try{ W.pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS+'pdf.worker.min.js'; }catch(e){} res(W.pdfjsLib); }; s.onerror=function(){ rej(new Error('Não foi possível carregar o leitor de PDF.')); }; D.head.appendChild(s); }); }
async function pdfRows(file){
  var lib=await loadPdfJs(); var buf=await file.arrayBuffer(); var doc=await lib.getDocument({data:buf}).promise; var rows=[];
  for(var p=1;p<=doc.numPages;p++){ var pg=await doc.getPage(p); var tc=await pg.getTextContent(); var items=tc.items.filter(function(it){ return it.str&&it.str.trim(); }).map(function(it){ return {x:it.transform[4],y:it.transform[5],w:it.width||0,s:it.str}; });
    items.sort(function(a,b){ return b.y-a.y||a.x-b.x; });
    var lines=[]; items.forEach(function(it){ var L=lines.length?lines[lines.length-1]:null; if(L&&Math.abs(L.y-it.y)<=3) L.items.push(it); else lines.push({y:it.y,items:[it]}); });
    lines.forEach(function(L){ L.items.sort(function(a,b){ return a.x-b.x; }); var cells=[], cur=null;
      L.items.forEach(function(it){ if(cur&&it.x-(cur.x2)<6){ cur.s+=(it.x-cur.x2>1.5?' ':'')+it.s; cur.x2=it.x+it.w; } else { cur={x:it.x,x2:it.x+it.w,s:it.s}; cells.push(cur); } });
      rows.push({page:p,y:L.y,cells:cells.map(function(c){ return {x:c.x,x2:c.x2,s:c.s.trim()}; }),text:cells.map(function(c){ return c.s.trim(); }).join(' ')}); }); }
  return rows;
}

/* ---------- modal genérico ---------- */
function modal(title,sub,body,foot){ closeModal(); var bg=D.createElement('div'); bg.className='imp-bg'; bg.id='impBg';
  bg.innerHTML='<div class="imp-md" role="dialog" aria-modal="true" aria-labelledby="impT"><div class="imp-hd"><h2 id="impT">'+esc(title)+'</h2><p>'+sub+'</p></div><div class="imp-bd" id="impBd">'+body+'</div><div class="imp-ft" id="impFt">'+foot+'</div></div>';
  bg.addEventListener('click',function(e){ if(e.target===bg) closeModal(); }); D.body.appendChild(bg);
  D.addEventListener('keydown',escClose); return bg; }
function escClose(e){ if(e.key==='Escape') closeModal(); }
function closeModal(){ var b=$('#impBg'); if(b) b.remove(); D.removeEventListener('keydown',escClose); }
function dropZone(id,label){ return '<div class="imp-drop" id="'+id+'" tabindex="0" role="button"><b>'+label+'</b><br><span class="imp-note">Clique para escolher ou arraste o PDF aqui</span><input type="file" accept="application/pdf,.pdf" hidden></div>'; }
function bindDrop(id,cb){ var z=$('#'+id); if(!z) return; var inp=$('input',z);
  z.onclick=function(){ inp.click(); }; z.onkeydown=function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); inp.click(); } };
  inp.onchange=function(){ if(inp.files[0]) cb(inp.files[0]); };
  z.ondragover=function(e){ e.preventDefault(); z.classList.add('on'); }; z.ondragleave=function(){ z.classList.remove('on'); };
  z.ondrop=function(e){ e.preventDefault(); z.classList.remove('on'); var f=e.dataTransfer.files[0]; if(f) cb(f); }; }

/* ==========================================================================
   1) PAGAMENTOS DO MÊS
   ========================================================================== */
var RX_PAGO=/\b(pago|paga|pagos|quitad[oa]|liquidad[oa]|baixad[oa]|adimplente|em dia|recebid[oa])\b/;
var RX_NAO=/(em aberto|aberto|atrasad|atraso|vencid|inadimpl|pendente|nao pag|devedor|em debito)/;
async function abrirPagamentos(){
  if(!isM()) return;
  modal('Importar pagamentos do mês','Envie o PDF da administradora com quem pagou e quem não pagou. Nada é gravado antes da sua confirmação.',
   '<div class="imp-row"><div><label for="ipAdm">Administradora</label><select id="ipAdm"><option value="HS">HS Consórcios</option><option value="ANCORA">Âncora Consórcios</option></select></div>'+
   '<div><label for="ipMes">Mês de referência</label><input id="ipMes" type="month" value="'+mesAtual()+'"></div>'+
   '<div><label for="ipModo">O arquivo lista</label><select id="ipModo"><option value="auto">Os dois — situação em cada linha</option><option value="nao">Só quem NÃO pagou</option><option value="pago">Só quem PAGOU</option></select></div></div>'+
   dropZone('ipDrop','Escolher o PDF de pagamentos')+'<div id="ipOut"></div>',
   '<span class="sp"></span><button class="btn btn-ghost btn-sm" id="ipCancel">Cancelar</button><button class="btn btn-gold btn-sm" id="ipOk" disabled>Confirmar e gravar</button>');
  $('#ipCancel').onclick=closeModal;
  var state={rows:null,file:''};
  bindDrop('ipDrop',async function(f){ state.file=f.name; $('#ipOut').innerHTML='<p class="imp-note">Lendo '+esc(f.name)+'…</p>';
    try{ state.rows=await pdfRows(f); }catch(e){ $('#ipOut').innerHTML='<p class="imp-err">'+esc(e.message||e)+'</p>'; return; }
    if(!state.rows.length){ $('#ipOut').innerHTML='<p class="imp-err">Não encontrei texto neste PDF. Se for uma imagem escaneada, exporte o relatório em PDF de texto pelo portal da administradora.</p>'; return; }
    await revisarPagamentos(state); });
  ['ipAdm','ipModo'].forEach(function(id){ $('#'+id).onchange=function(){ if(state.rows) revisarPagamentos(state); }; });
}
async function vendasAtivas(adm){
  var r=await SB().from('comissoes_vendas').select('id,cliente_nome,cliente_id,grupo,cota,administradora,situacao,analise_status,vendedor_id');
  if(r.error) throw r.error;
  return (r.data||[]).filter(function(v){ return admKey(v.administradora)===adm && v.situacao!=='CANCELADA' && v.situacao!=='REEMBOLSO_TOTAL' && v.analise_status!=='RECUSADA'; });
}
function casar(v,row){ var t=' '+norm(row.text)+' ';
  var digs=(row.text.match(/\d+/g)||[]).map(function(x){ return x.replace(/^0+/,'')||'0'; });
  var g=nz(v.grupo), c=nz(v.cota);
  if(g&&c&&digs.indexOf(g)>=0&&digs.indexOf(c)>=0) return 'grupo/cota';
  var nm=norm(v.cliente_nome).split(' ').filter(function(w){ return w.length>2&&['dos','das','de','da','do'].indexOf(w)<0; });
  if(nm.length>=2&&t.indexOf(' '+nm[0]+' ')>=0&&t.indexOf(' '+nm[nm.length-1]+' ')>=0) return 'nome';
  return null; }
async function revisarPagamentos(state){
  var adm=$('#ipAdm').value, modo=$('#ipModo').value, out=$('#ipOut'); var V;
  try{ V=await vendasAtivas(adm); }catch(e){ out.innerHTML='<p class="imp-err">Erro ao ler as vendas: '+esc(e.message||e)+'</p>'; return; }
  var usadas={};
  var lin=V.map(function(v){ var hit=null, how=null; for(var i=0;i<state.rows.length;i++){ var h=casar(v,state.rows[i]); if(h){ hit=state.rows[i]; how=h; usadas[i]=1; if(h==='grupo/cota') break; } }
    var st=''; if(hit){ var tx=norm(hit.text); if(modo==='nao') st='NAO_PAGO'; else if(modo==='pago') st='PAGO'; else st=RX_NAO.test(tx)?'NAO_PAGO':(RX_PAGO.test(tx)?'PAGO':''); }
    else { if(modo==='nao') st='PAGO'; else if(modo==='pago') st='NAO_PAGO'; }
    var pa=hit&&(hit.text.match(/(\d+)\s*parc/i)||[])[1];
    return {v:v,hit:hit,how:how,st:st,parc:pa?+pa:null}; });
  var semVenda=state.rows.filter(function(r,i){ return !usadas[i] && /\d{3,}/.test(r.text) && /[a-z]{3,}/i.test(r.text) && (RX_PAGO.test(norm(r.text))||RX_NAO.test(norm(r.text))); }).slice(0,40);
  var nP=lin.filter(function(l){return l.st==='PAGO';}).length, nN=lin.filter(function(l){return l.st==='NAO_PAGO';}).length, nI=lin.filter(function(l){return !l.st;}).length;
  var SIT={EM_DIA:'Em dia',INADIMPLENTE:'Não pagou',REEMBOLSO_PARCIAL:'Reembolso parcial'};
  out.innerHTML='<p class="imp-note">'+V.length+' vendas '+esc(ADM_LBL[adm]||adm)+' ativas · <span class="imp-chip ok">'+nP+' pagaram</span> <span class="imp-chip bad">'+nN+' não pagaram</span>'+(nI?' <span class="imp-chip warn">'+nI+' sem definição</span>':'')+' — confira e ajuste antes de gravar.</p>'+
    '<div class="tbl-scroll"><table class="imp-tbl"><thead><tr><th>Cliente</th><th>Grupo / cota</th><th>Situação hoje</th><th>No arquivo</th><th>Resultado do mês</th></tr></thead><tbody>'+
    lin.map(function(l,i){ return '<tr><td><b>'+esc(l.v.cliente_nome||'—')+'</b></td><td>'+esc((l.v.grupo||'—')+' / '+(l.v.cota||'—'))+'</td><td>'+esc(SIT[l.v.situacao]||l.v.situacao||'—')+'</td>'+
      '<td>'+(l.hit?'<span class="imp-chip">achado por '+l.how+'</span><div class="src" title="'+esc(l.hit.text)+'">'+esc(l.hit.text)+'</div>':'<span class="imp-note">não aparece</span>')+'</td>'+
      '<td><select data-i="'+i+'" class="ipSt"><option value="">Sem alteração</option><option value="PAGO"'+(l.st==='PAGO'?' selected':'')+'>Pagou</option><option value="NAO_PAGO"'+(l.st==='NAO_PAGO'?' selected':'')+'>Não pagou</option></select></td></tr>'; }).join('')+
    '</tbody></table></div>'+
    (semVenda.length?'<details style="margin-top:12px"><summary class="imp-note">'+semVenda.length+' linhas do arquivo com situação, mas sem venda correspondente na plataforma</summary><ul class="imp-note">'+semVenda.map(function(r){ return '<li>'+esc(r.text)+'</li>'; }).join('')+'</ul></details>':'');
  state.lin=lin; var ok=$('#ipOk'); ok.disabled=!lin.length;
  ok.onclick=function(){ $$('.ipSt').forEach(function(s){ state.lin[+s.getAttribute('data-i')].st=s.value; }); gravarPagamentos(state,adm); };
}
async function gravarPagamentos(state,adm){
  var mes=$('#ipMes').value||mesAtual(), ok=$('#ipOk'); ok.disabled=true; ok.textContent='Gravando…';
  var sel=state.lin.filter(function(l){ return l.st; }); var nUpd=0, err=null;
  var reg=sel.map(function(l){ return {mes_ref:mes,administradora:adm,venda_id:l.v.id,cliente_nome:l.v.cliente_nome,grupo:l.v.grupo||'',cota:l.v.cota||'',status:l.st,parcelas_atraso:l.parc,linha_original:l.hit?l.hit.text.slice(0,500):null,arquivo:state.file}; });
  if(reg.length){ var r=await SB().from('pagamentos_mes').upsert(reg,{onConflict:'mes_ref,administradora,grupo,cota'}); if(r.error) err=r.error; }
  if(!err){ for(var i=0;i<sel.length;i++){ var l=sel[i], cur=l.v.situacao, nv=null;
      if(l.st==='NAO_PAGO'&&cur==='EM_DIA') nv='INADIMPLENTE';
      if(l.st==='PAGO'&&cur==='INADIMPLENTE') nv='EM_DIA';
      if(nv){ var u=await SB().from('comissoes_vendas').update({situacao:nv}).eq('id',l.v.id); if(u.error){ err=u.error; break; } nUpd++; } } }
  if(err){ ok.disabled=false; ok.textContent='Confirmar e gravar'; $('#ipOut').insertAdjacentHTML('afterbegin','<p class="imp-err">Não gravou: '+esc(err.message||err)+'</p>'); return; }
  closeModal(); toast('Pagamentos de '+mesLbl(mes)+' gravados · '+nUpd+' situação(ões) atualizada(s)');
  try{ if(typeof loadCloud==='function'){} render(); }catch(e){}
}
async function bannerPagamentos(){
  if(!isM()||view.page!=='comissoes') return; var C=$('#content'); if(!C||$('.imp-banner',C)) return;
  var r=await SB().from('pagamentos_mes').select('mes_ref,administradora,status,importado_em').order('importado_em',{ascending:false}).limit(400);
  if(r.error||view.page!=='comissoes'||$('.imp-banner',C)) return;
  var d=r.data||[], html;
  if(!d.length) html='<span>Nenhum retorno de pagamentos importado ainda. Todo dia 11, use <b>Importar › Pagamentos do mês</b> com o PDF da administradora.</span>';
  else { var ult=d[0].mes_ref, porAdm={}; d.filter(function(x){return x.mes_ref===ult;}).forEach(function(x){ var a=porAdm[x.administradora]||(porAdm[x.administradora]={p:0,n:0}); if(x.status==='PAGO')a.p++; else a.n++; });
    html='<span>Último retorno de pagamentos: <b>'+mesLbl(ult)+'</b></span>'+Object.keys(porAdm).map(function(a){ return '<span class="imp-chip">'+esc(ADM_LBL[a]||a)+'</span> <span class="imp-chip ok">'+porAdm[a].p+' pagaram</span> <span class="imp-chip bad">'+porAdm[a].n+' não pagaram</span>'; }).join(' '); }
  var b=D.createElement('div'); b.className='imp-banner'; b.innerHTML=html; C.insertBefore(b,C.firstChild);
}
function botaoImportar(){
  if(!isM()||view.page!=='comissoes') return; var box=$('#topActions'); if(!box||$('.imp-btn',box)) return;
  var b=D.createElement('button'); b.className='btn btn-gold btn-sm imp-btn'; b.type='button'; b.textContent='⇪ Importar';
  b.onclick=function(){ escolherImport(); }; box.insertBefore(b,box.firstChild);
}
async function escolherImport(){
  var o; try{ o=await chooseModal('Importar','O que você quer importar?','Pagamentos do mês (dia 11)','Resultado das assembleias'); }catch(e){ o='a'; }
  if(o==='a') abrirPagamentos(); else if(o==='b') abrirAssembleiaImport();
}

/* ==========================================================================
   2) ASSEMBLEIAS
   ========================================================================== */
var FIELDS=[['','— ignorar —'],['grupo','Grupo'],['sorteio','Sorteio'],['lance_livre','Lance livre'],['lance_fixo','Lance fixo'],['lance_fixo2','2º lance fixo'],['lance_embutido','Lance embutido'],['outros','Outras contemplações'],['contemplados','Total contemplados'],['excluidos','Excluídos'],['menor_lance_pct','Menor lance (%)'],['maior_lance_pct','Maior lance (%)'],['taxa_adm_pct','Taxa adm. (%)'],['prazo','Prazo'],['participantes','Participantes'],['credito_ref','Crédito de referência']];
var NUMF={sorteio:1,lance_livre:1,lance_fixo:1,lance_fixo2:1,lance_embutido:1,outros:1,contemplados:1,excluidos:1,prazo:1,participantes:1};
function guessField(h){ var t=norm(h); if(!t) return '';
  if(/grupo/.test(t)) return 'grupo';
  if(/(2|segundo|2o)\s*.*fix/.test(t)) return 'lance_fixo2';
  if(/embut/.test(t)) return 'lance_embutido';
  if(/livre/.test(t)) return 'lance_livre';
  if(/fix/.test(t)) return 'lance_fixo';
  if(/sorte/.test(t)) return 'sorteio';
  if(/exclu/.test(t)) return 'excluidos';
  if(/menor/.test(t)) return 'menor_lance_pct';
  if(/maior/.test(t)) return 'maior_lance_pct';
  if(/taxa|adm/.test(t)) return 'taxa_adm_pct';
  if(/prazo/.test(t)) return 'prazo';
  if(/partic/.test(t)) return 'participantes';
  if(/credito|valor do bem/.test(t)) return 'credito_ref';
  if(/total|contempl/.test(t)) return 'contemplados';
  return ''; }
function tabela(rows){
  // acha a linha de cabeçalho: a que tem mais palavras-chave reconhecidas
  var best=-1, bi=-1; rows.forEach(function(r,i){ var k=r.cells.filter(function(c){ return guessField(c.s); }).length; if(k>best){ best=k; bi=i; } });
  var head=best>=2?rows[bi]:null;
  var cols; if(head) cols=head.cells.map(function(c){ return {x:(c.x+c.x2)/2,label:c.s,field:guessField(c.s)}; });
  var data=rows.filter(function(r,i){ if(head&&(i<=bi&&r.page===head.page&&r.y>=head.y)) return false; var f=r.cells[0]&&r.cells[0].s; return /^\d{3,6}\b/.test(String(f||'').trim()); });
  if(!cols){ var n=data.reduce(function(m,r){ return Math.max(m,r.cells.length); },0); cols=[]; for(var j=0;j<n;j++) cols.push({x:null,label:'Coluna '+(j+1),field:j===0?'grupo':''}); }
  var grid=data.map(function(r){ var out=cols.map(function(){ return ''; });
    if(cols[0].x==null) r.cells.forEach(function(c,j){ if(j<out.length) out[j]=c.s; });
    else r.cells.forEach(function(c){ var mx=(c.x+c.x2)/2, k=0, dm=1e9; cols.forEach(function(col,j){ var dd=Math.abs(col.x-mx); if(dd<dm){ dm=dd; k=j; } }); out[k]=out[k]?out[k]+' '+c.s:c.s; });
    return out; });
  return {cols:cols,grid:grid,headFound:!!head};
}
function abrirAssembleiaImport(){
  if(!isM()) return;
  modal('Importar resultado das assembleias','PDF de resultado da administradora. Você confere as colunas e os números antes de gravar. Fica visível para a equipe (clientes não veem).',
   '<div class="imp-row"><div><label for="iaAdm">Administradora</label><select id="iaAdm"><option value="HS">HS Consórcios</option><option value="ANCORA">Âncora Consórcios</option></select></div>'+
   '<div><label for="iaTipo">Tipo</label><select id="iaTipo"><option value="IMOVEL">Imóvel</option><option value="AUTOMOVEL">Automóvel</option><option value="SERVICOS">Serviços</option><option value="OUTRO">Outro</option></select></div>'+
   '<div><label for="iaMes">Mês da assembleia</label><input id="iaMes" type="month" value="'+mesAtual()+'"></div>'+
   '<div><label for="iaData">Data da assembleia</label><input id="iaData" type="date"></div></div>'+
   dropZone('iaDrop','Escolher o PDF do resultado')+'<p class="imp-note">Sem PDF? <button class="btn btn-ghost btn-sm" id="iaManual" type="button">Digitar manualmente</button></p><div id="iaOut"></div>',
   '<span class="sp"></span><button class="btn btn-ghost btn-sm" id="iaCancel">Cancelar</button><button class="btn btn-gold btn-sm" id="iaOk" disabled>Confirmar e gravar</button>');
  $('#iaCancel').onclick=closeModal;
  var st={file:''};
  bindDrop('iaDrop',async function(f){ st.file=f.name; $('#iaOut').innerHTML='<p class="imp-note">Lendo '+esc(f.name)+'…</p>'; var rows;
    try{ rows=await pdfRows(f); }catch(e){ $('#iaOut').innerHTML='<p class="imp-err">'+esc(e.message||e)+'</p>'; return; }
    var T=tabela(rows); if(!T.grid.length){ $('#iaOut').innerHTML='<p class="imp-err">Não encontrei linhas de grupos neste PDF. Se for imagem escaneada, use “Digitar manualmente”.</p>'; return; }
    st.T=T; mapeamento(st); });
  $('#iaManual').onclick=function(){ st.T={cols:[{field:'grupo',label:'Grupo'},{field:'sorteio',label:'Sorteio'},{field:'lance_livre',label:'Lance livre'},{field:'lance_fixo',label:'Lance fixo'},{field:'lance_fixo2',label:'2º lance fixo'},{field:'lance_embutido',label:'Lance embutido'},{field:'excluidos',label:'Excluídos'},{field:'menor_lance_pct',label:'Menor lance (%)'}],grid:[['','','','','','','','']],headFound:true,manual:true}; mapeamento(st); };
}
function mapeamento(st){
  var T=st.T, out=$('#iaOut');
  var opts=function(sel){ return FIELDS.map(function(f){ return '<option value="'+f[0]+'"'+(f[0]===sel?' selected':'')+'>'+f[1]+'</option>'; }).join(''); };
  out.innerHTML='<p class="imp-note">'+(T.manual?'Preencha uma linha por grupo.':(T.grid.length+' linhas de grupos encontradas. '+(T.headFound?'Colunas reconhecidas pelo cabeçalho do PDF — confira.':'Não reconheci o cabeçalho: escolha o que é cada coluna.')))+' Você pode corrigir qualquer número.</p>'+
   '<div class="tbl-scroll"><table class="imp-tbl" id="iaTbl"><thead><tr>'+T.cols.map(function(c,j){ return '<th><select data-j="'+j+'" class="iaCol">'+opts(c.field)+'</select>'+(T.manual?'':'<div class="imp-note" style="margin:3px 0 0">'+esc(c.label)+'</div>')+'</th>'; }).join('')+'<th></th></tr></thead><tbody>'+
   T.grid.map(function(r,i){ return '<tr>'+r.map(function(v,j){ return '<td><input data-i="'+i+'" data-j="'+j+'" value="'+esc(v)+'"></td>'; }).join('')+'<td><button class="btn btn-ghost btn-sm iaDel" data-i="'+i+'" type="button" aria-label="Remover linha">×</button></td></tr>'; }).join('')+
   '</tbody></table></div><p><button class="btn btn-ghost btn-sm" id="iaAdd" type="button">+ Linha</button></p>';
  var sync=function(){ $$('#iaTbl input').forEach(function(inp){ T.grid[+inp.dataset.i][+inp.dataset.j]=inp.value; }); $$('.iaCol').forEach(function(s){ T.cols[+s.dataset.j].field=s.value; }); };
  $$('.iaDel').forEach(function(b){ b.onclick=function(){ sync(); T.grid.splice(+b.dataset.i,1); mapeamento(st); }; });
  $('#iaAdd').onclick=function(){ sync(); T.grid.push(T.cols.map(function(){return '';})); mapeamento(st); };
  var ok=$('#iaOk'); ok.disabled=false; ok.onclick=function(){ sync(); gravarAssembleia(st); };
}
async function gravarAssembleia(st){
  var T=st.T, adm=$('#iaAdm').value, tipo=$('#iaTipo').value, mes=$('#iaMes').value||mesAtual(), data=$('#iaData').value||null, ok=$('#iaOk');
  if(!T.cols.some(function(c){ return c.field==='grupo'; })){ $('#iaOut').insertAdjacentHTML('afterbegin','<p class="imp-err">Marque qual coluna é o Grupo.</p>'); return; }
  var recs=[]; T.grid.forEach(function(r){ var o={administradora:adm,tipo:tipo,mes_ref:mes,data_assembleia:data,arquivo:st.file||null};
    T.cols.forEach(function(c,j){ if(!c.field) return; var v=r[j]; if(c.field==='grupo') o.grupo=String(v||'').replace(/\D/g,'').replace(/^0+/,''); else if(NUMF[c.field]) o[c.field]=(o[c.field]||0)+int0(v); else o[c.field]=num(v); });
    if(!o.grupo) return;
    if(!o.contemplados) o.contemplados=(o.sorteio||0)+(o.lance_livre||0)+(o.lance_fixo||0)+(o.lance_fixo2||0)+(o.lance_embutido||0)+(o.outros||0);
    recs.push(o); });
  if(!recs.length){ $('#iaOut').insertAdjacentHTML('afterbegin','<p class="imp-err">Nenhuma linha com grupo preenchido.</p>'); return; }
  ok.disabled=true; ok.textContent='Gravando…';
  var r=await SB().from('assembleias_resultado').upsert(recs,{onConflict:'administradora,mes_ref,grupo'});
  if(!r.error&&data){ await SB().from('assembleias_agenda').upsert([{administradora:adm,tipo:tipo,data_assembleia:data,obs:'realizada'}],{onConflict:'administradora,tipo,data_assembleia'}); }
  if(r.error){ ok.disabled=false; ok.textContent='Confirmar e gravar'; $('#iaOut').insertAdjacentHTML('afterbegin','<p class="imp-err">Não gravou: '+esc(r.error.message)+'</p>'); return; }
  closeModal(); toast(recs.length+' grupos de '+mesLbl(mes)+' gravados'); if(AS.open) abrirAssembleias(); }
async function novaData(){
  if(!isM()) return;
  modal('Calendário de assembleias','Datas das próximas assembleias, para a equipe se programar.',
   '<div class="imp-row"><div><label for="adAdm">Administradora</label><select id="adAdm"><option value="HS">HS Consórcios</option><option value="ANCORA">Âncora Consórcios</option></select></div><div><label for="adTipo">Tipo</label><select id="adTipo"><option value="IMOVEL">Imóvel</option><option value="AUTOMOVEL">Automóvel</option><option value="SERVICOS">Serviços</option><option value="OUTRO">Outro</option></select></div><div><label for="adData">Data</label><input id="adData" type="date"></div><div><label for="adObs">Observação</label><input id="adObs" placeholder="opcional"></div></div>',
   '<span class="sp"></span><button class="btn btn-ghost btn-sm" id="adCancel">Cancelar</button><button class="btn btn-gold btn-sm" id="adOk">Salvar data</button>');
  $('#adCancel').onclick=closeModal;
  $('#adOk').onclick=async function(){ var d=$('#adData').value; if(!d){ toast('Escolha a data'); return; }
    var r=await SB().from('assembleias_agenda').upsert([{administradora:$('#adAdm').value,tipo:$('#adTipo').value,data_assembleia:d,obs:$('#adObs').value||null}],{onConflict:'administradora,tipo,data_assembleia'});
    if(r.error){ toast('Erro: '+r.error.message); return; } closeModal(); toast('Data salva'); abrirAssembleias(); };
}

/* ---------- tela Assembleias (dentro de Ferramentas) ---------- */
var AS={open:false,adm:'',tipo:'',mes:'',sort:'contemplados',dir:-1,data:null,agenda:null};
var COLS=[['grupo','Grupo'],['tipo','Tipo'],['contemplados','Contempl.'],['sorteio','Sorteio'],['lance_livre','Livre'],['lance_fixo','Fixo'],['lance_fixo2','2º fixo'],['lance_embutido','Embutido'],['excluidos','Excluídos'],['menor_lance_pct','Menor lance %'],['taxa_adm_pct','Taxa adm %'],['hist','Contempl. 6 meses']];
async function abrirAssembleias(){
  if(!isStaffEff()) return; AS.open=true;
  var C=$('#content'); if(!C) return;
  try{ setTop('Assembleias','Resultado dos grupos e calendário',isM()?'<button class="btn btn-ghost btn-sm" onclick="AgionImport.novaData()">+ Data de assembleia</button><button class="btn btn-gold btn-sm" onclick="AgionImport.importarAssembleias()">⇪ Importar resultado</button>':''); }catch(e){}
  C.innerHTML='<button class="as-back" onclick="go(\'ferramentas\')">‹ Ferramentas</button><div class="panel"><p class="imp-note">Carregando assembleias…</p></div>';
  var r1=await SB().from('assembleias_resultado').select('*').order('mes_ref',{ascending:false}).limit(5000);
  var r2=await SB().from('assembleias_agenda').select('*').order('data_assembleia',{ascending:true}).limit(500);
  if(view.page!=='ferramentas'||!AS.open) return;
  if(r1.error){ C.innerHTML='<button class="as-back" onclick="go(\'ferramentas\')">‹ Ferramentas</button><div class="panel"><p class="imp-err">Não foi possível carregar: '+esc(r1.error.message)+'</p></div>'; return; }
  AS.data=r1.data||[]; AS.agenda=r2.data||[];
  var meses=[]; AS.data.forEach(function(x){ if(meses.indexOf(x.mes_ref)<0) meses.push(x.mes_ref); }); meses.sort().reverse();
  if(!AS.mes||meses.indexOf(AS.mes)<0) AS.mes=meses[0]||'';
  pintar(meses);
}
function pintar(meses){
  var C=$('#content'); if(!C) return;
  var hoje=new Date().toISOString().slice(0,10);
  var prox=AS.agenda.filter(function(a){ return a.data_assembleia>=hoje&&(!AS.adm||a.administradora===AS.adm); }).slice(0,8);
  var L=AS.data.filter(function(x){ return x.mes_ref===AS.mes&&(!AS.adm||x.administradora===AS.adm)&&(!AS.tipo||x.tipo===AS.tipo); });
  // histórico: soma de contemplados nos 6 meses mais recentes até o mês escolhido
  var ult6=meses.filter(function(m){ return m<=AS.mes; }).slice(0,6);
  var hist={}; AS.data.forEach(function(x){ if(ult6.indexOf(x.mes_ref)<0) return; if(AS.adm&&x.administradora!==AS.adm) return; var k=x.administradora+'|'+x.grupo; hist[k]=(hist[k]||0)+(x.contemplados||0); });
  L.forEach(function(x){ x.hist=hist[x.administradora+'|'+x.grupo]||0; });
  var s=AS.sort, dir=AS.dir; L.sort(function(a,b){ var A=a[s],B=b[s]; if(s==='grupo'||s==='tipo'){ return String(A).localeCompare(String(B),'pt',{numeric:true})*dir; } A=A==null?(dir<0?-1e9:1e9):+A; B=B==null?(dir<0?-1e9:1e9):+B; return (A-B)*dir; });
  var tot=function(f){ return L.reduce(function(m,x){ return m+(+x[f]||0); },0); };
  var top=function(f,asc,lbl,fmt){ var arr=L.filter(function(x){ return x[f]!=null&&(asc||+x[f]>0); }).slice().sort(function(a,b){ return asc?a[f]-b[f]:b[f]-a[f]; }).slice(0,3);
    return '<div class="as-hc"><h4>'+lbl+'</h4>'+(arr.length?'<ol>'+arr.map(function(x){ return '<li><b>Grupo '+esc(x.grupo)+'</b> <span class="note">'+esc(TIPO_LBL[x.tipo]||'')+'</span><span class="v">'+(fmt?fmt(x[f]):x[f])+'</span></li>'; }).join('')+'</ol>':'<p class="imp-note">Sem dados neste filtro.</p>')+'</div>'; };
  var pct=function(v){ return String(v).replace('.',',')+'%'; };
  var sel=function(id,val,opts){ return '<select id="'+id+'">'+opts.map(function(o){ return '<option value="'+o[0]+'"'+(o[0]===val?' selected':'')+'>'+o[1]+'</option>'; }).join('')+'</select>'; };
  var html='<button class="as-back" onclick="go(\'ferramentas\')">‹ Ferramentas</button>'+
   '<div class="as-top"><div><label for="asMes">Mês</label>'+(meses.length?sel('asMes',AS.mes,meses.map(function(m){ return [m,mesLbl(m)]; })):'<select id="asMes" disabled><option>—</option></select>')+'</div>'+
   '<div><label for="asAdm">Administradora</label>'+sel('asAdm',AS.adm,[['','Todas'],['HS','HS Consórcios'],['ANCORA','Âncora Consórcios']])+'</div>'+
   '<div><label for="asTipo">Tipo</label>'+sel('asTipo',AS.tipo,[['','Todos'],['IMOVEL','Imóvel'],['AUTOMOVEL','Automóvel'],['SERVICOS','Serviços'],['OUTRO','Outro']])+'</div></div>';
  html+='<div class="panel"><h2>Próximas assembleias</h2>'+(prox.length?'<div class="as-ag">'+prox.map(function(a){ var d=a.data_assembleia.split('-'); return '<span><b>'+d[2]+'/'+d[1]+'</b> · '+esc(ADM_LBL[a.administradora]||a.administradora)+' · '+esc(TIPO_LBL[a.tipo]||a.tipo)+(a.obs?' · '+esc(a.obs):'')+'</span>'; }).join('')+'</div>':'<p class="note">Nenhuma data cadastrada.'+(isM()?' Use “+ Data de assembleia”.':'')+'</p>')+'</div>';
  if(!AS.data.length){
    html+='<div class="panel"><p class="note">Nenhum resultado de assembleia importado ainda.'+(isM()?' Use “⇪ Importar resultado” com o PDF da administradora (imóvel e automóvel, todo mês).':' Assim que o proprietário importar, os grupos aparecem aqui.')+'</p></div>';
    C.innerHTML=html; bindFiltros(meses); return; }
  html+='<div class="kpis"><div class="kpi"><div class="lab">Grupos</div><b>'+L.length+'</b></div><div class="kpi"><div class="lab">Contemplações</div><b>'+tot('contemplados')+'</b></div><div class="kpi"><div class="lab">Sorteio</div><b>'+tot('sorteio')+'</b></div><div class="kpi"><div class="lab">Lances</div><b>'+(tot('lance_livre')+tot('lance_fixo')+tot('lance_fixo2')+tot('lance_embutido'))+'</b></div><div class="kpi"><div class="lab">Excluídos</div><b>'+tot('excluidos')+'</b></div></div>';
  html+='<div class="as-hl">'+top('contemplados',false,'Mais contemplações')+top('lance_livre',false,'Mais lance livre')+top('lance_fixo',false,'Mais lance fixo')+top('lance_embutido',false,'Mais lance embutido')+top('excluidos',false,'Mais excluídos')+top('menor_lance_pct',true,'Menor lance vencedor',pct)+top('taxa_adm_pct',true,'Menor taxa de administração',pct)+top('hist',false,'Mais contemplações em 6 meses')+'</div>';
  html+='<div class="panel"><h2>Grupos · '+esc(mesLbl(AS.mes))+'</h2><p class="note" style="margin-top:-4px">Clique no título de uma coluna para ordenar.</p><div class="tbl-scroll"><table class="imp-tbl as-tbl"><thead><tr>'+COLS.map(function(c){ return '<th data-k="'+c[0]+'" class="'+(c[0]!=='grupo'&&c[0]!=='tipo'?'n ':'')+(AS.sort===c[0]?'on':'')+'">'+c[1]+(AS.sort===c[0]?(AS.dir<0?' ↓':' ↑'):'')+'</th>'; }).join('')+'</tr></thead><tbody>'+
   L.map(function(x,i){ return '<tr class="'+(i<3&&AS.sort!=='grupo'?'top':'')+'"><td><b>'+esc(x.grupo)+'</b> <span class="note">'+esc(x.administradora==='ANCORA'?'Âncora':'HS')+'</span></td><td>'+esc(TIPO_LBL[x.tipo]||x.tipo)+'</td>'+
     ['contemplados','sorteio','lance_livre','lance_fixo','lance_fixo2','lance_embutido','excluidos'].map(function(f){ return '<td class="n">'+(x[f]||0)+'</td>'; }).join('')+
     '<td class="n">'+(x.menor_lance_pct!=null?pct(x.menor_lance_pct):'—')+'</td><td class="n">'+(x.taxa_adm_pct!=null?pct(x.taxa_adm_pct):'—')+'</td><td class="n">'+x.hist+'</td></tr>'; }).join('')+
   '</tbody></table></div></div>';
  C.innerHTML=html; bindFiltros(meses);
  $$('.as-tbl th').forEach(function(th){ th.onclick=function(){ var k=th.dataset.k; if(AS.sort===k) AS.dir=-AS.dir; else { AS.sort=k; AS.dir=(k==='grupo'||k==='tipo'||k==='menor_lance_pct'||k==='taxa_adm_pct')?1:-1; } pintar(meses); }; });
}
function pintarCache(){ var meses=[]; (AS.data||[]).forEach(function(x){ if(meses.indexOf(x.mes_ref)<0) meses.push(x.mes_ref); }); meses.sort().reverse();
  try{ setTop('Assembleias','Resultado dos grupos e calendário',isM()?'<button class="btn btn-ghost btn-sm" onclick="AgionImport.novaData()">+ Data de assembleia</button><button class="btn btn-gold btn-sm" onclick="AgionImport.importarAssembleias()">⇪ Importar resultado</button>':''); }catch(e){}
  pintar(meses); }
function bindFiltros(meses){ var a=$('#asMes'),b=$('#asAdm'),c=$('#asTipo');
  if(a) a.onchange=function(){ AS.mes=a.value; pintar(meses); }; if(b) b.onchange=function(){ AS.adm=b.value; pintar(meses); }; if(c) c.onchange=function(){ AS.tipo=c.value; pintar(meses); }; }

/* ---------- cartão em Ferramentas ---------- */
function cartaoFerramentas(){
  if(view.page!=='ferramentas'||AS.open||!isStaffEff()) return;
  var g=$('[data-tour-target="tool-0"]'); g=g&&g.parentElement; if(!g||$('[data-tour-target="tool-4"]',g)) return;
  var d=D.createElement('div'); d.setAttribute('data-tour-target','tool-4'); d.setAttribute('role','button'); d.tabIndex=0;
  d.style.cssText='cursor:pointer;background:#fff;border:1px solid #e7dec9;border-radius:16px;padding:20px;box-shadow:0 8px 26px -20px rgba(11,42,38,.5);transition:transform .15s';
  d.innerHTML='<div style="width:46px;height:46px;border-radius:12px;background:#8a6c2c;margin-bottom:13px"></div><div style="font-weight:700;font-size:16px;color:#0b2a26;margin-bottom:6px">Assembleias</div><div style="font-size:13px;color:#6e8078;line-height:1.5">Resultado dos grupos de imóvel e automóvel: contemplações por sorteio e lances, excluídos e calendário.</div><div style="margin-top:13px;font-size:13px;font-weight:700;color:#a6853f">Abrir →</div>';
  d.addEventListener('mouseover',function(){d.style.transform='translateY(-3px)';}); d.addEventListener('mouseout',function(){d.style.transform='';});
  var open=function(){ abrirAssembleias(); }; d.addEventListener('click',open); d.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(); } });
  g.appendChild(d);
}

/* ---------- integração (aditiva) ---------- */
function after(){ try{ if(view.page!=='ferramentas') AS.open=false; botaoImportar(); bannerPagamentos(); }catch(e){} }
function hook(){ var t=0; (function go_(){ if(typeof W.render!=='function'||typeof W.setTop!=='function'){ if(++t<200) setTimeout(go_,50); return; }
  if(W.render.__imp) return;
  var _r=W.render; var f=function(){ if(view.page!=='ferramentas') AS.open=false; var keep=AS.open&&AS.data; var o=_r.apply(this,arguments); try{ if(keep&&view.page==='ferramentas'){ AS.open=true; pintarCache(); } after(); }catch(e){} return o; }; f.__imp=1; W.render=f;
  // navegação feita pela pessoa (menu, "‹ Ferramentas", hash) fecha a tela de Assembleias
  if(typeof W.routeGo==='function'&&!W.routeGo.__imp){ var _g=W.routeGo; var rg=function(){ AS.open=false; return _g.apply(this,arguments); }; rg.__imp=1; W.routeGo=rg; }
  var _s=W.setTop; var g=function(){ var o=_s.apply(this,arguments); try{ setTimeout(after,0); }catch(e){} return o; }; g.__imp=1; W.setTop=g;
  // Ferramentas é assíncrona: observa o #content para acrescentar o cartão quando os cartões aparecerem
  var C=D.getElementById('content'); if(C&&W.MutationObserver){ new MutationObserver(function(){ if(view.page==='ferramentas'&&!AS.open) cartaoFerramentas(); }).observe(C,{childList:true}); }
})(); }
W.AgionImport={pagamentos:abrirPagamentos,importarAssembleias:abrirAssembleiaImport,assembleias:abrirAssembleias,novaData:novaData,_pdfRows:pdfRows,_tabela:tabela};
hook();
})();
