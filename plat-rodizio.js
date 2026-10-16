/* ==========================================================================
   Agion — plat-rodizio.js · Marketing › Distribuição de leads (16/out/2026)
   Quem recebe cada lead novo (site, anúncio, WhatsApp). Servidor: {BOT_API}/api/designacao
   - Modos: Rodízio em fila (1 para cada) · Por nível (peso 1–5) · Por categoria · Manual
   - Por pessoa: recebe ou não, nível, categorias, limite por dia; números de hoje/7/30 dias
   - Regras: alto valor (crédito ≥ X vai só para quem você escolher) · manter o dono de quem já é cliente/lead
   - Prévia dos próximos, histórico e fila "aguardando designação" (modo manual) com botão Designar
   Só o master altera; líder vê e pode designar manualmente. Camada aditiva: envolve
   renderMarketing, mktSub e mktAutoTab (o card antigo "Distribuição automática" passa a abrir esta aba).
   ========================================================================== */
(function(){
'use strict';
var W=window, D=document;
var S={dados:null, cfg:null, sujo:false, carregando:false, erro:''};

function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
function papel(){ try{ return session.role; }catch(e){ return null; } }
function clone(o){ return JSON.parse(JSON.stringify(o||{})); }
function primeiro(n){ return String(n||'').trim().split(/\s+/)[0]||''; }
function pessoa(id){ var e=((S.dados||{}).equipe||[]).find(function(p){return p.id===id;}); if(e) return e; try{ return (db.accounts||[]).find(function(a){return a.id===id;})||null; }catch(x){ return null; } }
function nome(id){ var p=pessoa(id); return p?(p.nome||'—'):'—'; }
function ini(n){ var p=String(n||'?').trim().split(/\s+/); return ((p[0]||'?')[0]+((p.length>1?p[p.length-1][0]:'')||'')).toUpperCase(); }
function cor(id){ var s=String(id||''),h=0; for(var i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))%360; return 'hsl('+h+',42%,52%)'; }
function papelLbl(r){ return {master:'Master',lider:'Líder',especialista:'Especialista'}[r]||r||''; }
function quando(ts){ try{ var d=new Date(ts*1000), n=new Date(); var hm=d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); if(d.toDateString()===n.toDateString()) return 'Hoje '+hm; var o=new Date(n.getTime()-864e5); if(d.toDateString()===o.toDateString()) return 'Ontem '+hm; return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})+' '+hm; }catch(e){ return ''; } }
function fone(p){ p=String(p||'').replace(/\D/g,''); if(p.length>=12) return '('+p.slice(2,4)+') '+p.slice(4,p.length-4)+'-'+p.slice(-4); return p; }
function brl(v){ try{ return (+v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}); }catch(e){ return 'R$ '+v; } }
function ORD(c){ var o=['imovel','auto','moto','pesados','nautico','investimento','servicos']; return o.filter(function(k){return k in c;}).concat(Object.keys(c).filter(function(k){return o.indexOf(k)<0;})); }
function podeEditar(){ return !!(S.dados&&S.dados.pode_editar); }

var MODOS=[
  {k:'fila',t:'Rodízio em fila',d:'Um lead para cada pessoa, na ordem. Quando chega no último, recomeça.',ex:'Lisiane → Matheus → Gabriel → Lisiane…',ic:'<svg viewBox="0 0 24 24"><path d="M4 7h13l-3-3M20 17H7l3 3"/></svg>'},
  {k:'peso',t:'Por nível',d:'Cada pessoa tem um nível de 1 a 5. Nível 2 recebe o dobro do nível 1, intercalado (sem receber vários seguidos).',ex:'Lisiane nível 2 → 2 de cada 4 leads',ic:'<svg viewBox="0 0 24 24"><path d="M5 20V12M12 20V6M19 20v-4"/></svg>'},
  {k:'categoria',t:'Por categoria',d:'Cada pessoa marca o que atende (imóvel, carro, pesados…). O lead vai para quem atende aquela categoria; sem categoria definida, rodízio por nível entre todos.',ex:'Carro → Matheus · Imóvel → Lisiane',ic:'<svg viewBox="0 0 24 24"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 12l9 4 9-4M3 17l9 4 9-4"/></svg>'},
  {k:'manual',t:'Manual',d:'Ninguém recebe sozinho. O lead fica aguardando e o master recebe aviso para designar aqui mesmo.',ex:'Você escolhe lead a lead',ic:'<svg viewBox="0 0 24 24"><path d="M8 13V5a2 2 0 014 0v6M12 11V4a2 2 0 014 0v7M16 11V6a2 2 0 014 0v8a7 7 0 01-7 7h-1a7 7 0 01-6-3l-3-5a2 2 0 013-2l2 2"/></svg>'}
];

/* ------------------------------------------------------------------ estilo */
function css(){ if(D.getElementById('rzCss')) return; var st=D.createElement('style'); st.id='rzCss'; st.textContent=
 '.rz-top{display:flex;align-items:center;gap:16px;flex-wrap:wrap}'
+'.rz-top h2{margin:0}.rz-sw{display:flex;align-items:center;gap:10px;margin-left:auto;cursor:pointer;user-select:none}'
+'.rz-tg{position:relative;width:46px;height:26px;border-radius:999px;background:var(--line);border:1px solid var(--line);transition:.2s;flex:0 0 auto}'
+'.rz-tg:after{content:"";position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:.2s}'
+'.rz-tg.on{background:var(--teal);border-color:var(--teal)}.rz-tg.on:after{left:22px}.rz-tg.off-dis{opacity:.5}'
+'.rz-st{font-size:.8rem;font-weight:700}.rz-st.on{color:var(--ok)}.rz-st.off{color:var(--soft)}'
+'.rz-prox{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:14px}'
+'.rz-av{width:30px;height:30px;border-radius:50%;display:inline-grid;place-items:center;color:#fff;font-weight:800;font-size:.72rem;flex:0 0 auto}'
+'.rz-av.sm{width:24px;height:24px;font-size:.62rem}.rz-arw{color:var(--soft);font-size:.8rem}'
+'.rz-modos{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}'
+'.rz-modo{text-align:left;border:1.5px solid var(--line);background:transparent;border-radius:16px;padding:16px;cursor:pointer;color:var(--ink);transition:.18s;display:flex;flex-direction:column;gap:8px;font:inherit}'
+'.rz-modo:hover{border-color:var(--line-gold)}.rz-modo.on{border-color:var(--gold);background:rgba(197,160,89,.08);box-shadow:0 0 0 3px rgba(197,160,89,.12)}'
+'.rz-modo svg{width:22px;height:22px;stroke:var(--gold);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}'
+'.rz-modo b{color:var(--head);font-size:.95rem}.rz-modo .rz-ex{font-size:.7rem;color:var(--gold2);font-weight:700}'
+'.rz-modo[disabled]{cursor:default}'
+'.rz-eq{display:flex;flex-direction:column;gap:10px}'
+'.rz-p{display:grid;grid-template-columns:minmax(170px,1.3fr) auto auto minmax(150px,1fr);gap:14px;align-items:center;border:1px solid var(--line);border-radius:14px;padding:12px 14px}'
+'.rz-p.desl{opacity:.55}.rz-who{display:flex;align-items:center;gap:10px;min-width:0}.rz-who b{color:var(--head);display:block}'
+'.rz-lab{font-size:.62rem;text-transform:uppercase;letter-spacing:.08em;color:var(--soft);font-weight:700;margin-bottom:4px}'
+'.rz-niv{display:flex;gap:4px}.rz-niv button{width:26px;height:26px;border-radius:8px;border:1px solid var(--line);background:transparent;color:var(--muted);font-weight:800;cursor:pointer;font:inherit;font-size:.75rem}'
+'.rz-niv button.on{background:var(--gold);border-color:var(--gold);color:var(--teal-ink)}'
+'.rz-lim{width:64px!important;height:32px!important;min-height:0!important;padding:4px 8px!important;border-radius:9px;border:1px solid var(--line);background:transparent;color:var(--ink);font:inherit;font-size:.8rem}'
+'.rz-num{display:flex;gap:14px;font-size:.72rem;color:var(--soft)}.rz-num b{color:var(--head);font-size:.95rem;display:block}'
+'.rz-bar{height:6px;border-radius:99px;background:var(--line);overflow:hidden;margin-top:6px}.rz-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--teal),var(--gold))}'
+'.rz-cats{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:6px;padding-top:4px}'
+'.rz-chip{border:1px solid var(--line);background:transparent;color:var(--muted);border-radius:999px;padding:5px 11px;font:inherit;font-size:.72rem;font-weight:700;cursor:pointer}'
+'.rz-chip.on{background:rgba(143,217,204,.14);border-color:var(--teal);color:var(--head)}.rz-chip[disabled]{cursor:default}'
+'.rz-regra{display:flex;gap:14px;align-items:flex-start;border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:10px}'
+'.rz-regra .rz-tx{flex:1;min-width:0}.rz-regra b{color:var(--head)}'
+'.rz-in{padding:7px 10px;border-radius:9px;border:1px solid var(--line);background:transparent;color:var(--ink);font:inherit;font-size:.82rem;width:150px}'
+'.rz-h{display:flex;align-items:center;gap:12px;padding:10px 2px;border-bottom:1px solid var(--line)}.rz-h:last-child{border-bottom:0}'
+'.rz-h .rz-hx{flex:1;min-width:0}.rz-h .rz-hx b{color:var(--head)}.rz-tag{font-size:.64rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;padding:3px 8px;border-radius:999px;border:1px solid var(--line-gold);color:var(--gold2)}'
+'.rz-pend{border:1.5px solid var(--warn);background:rgba(251,191,36,.07)}'
+'.rz-sel{padding:7px 10px;border-radius:9px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-size:.8rem}'
+'.rz-save{position:sticky;bottom:12px;z-index:5;display:flex;align-items:center;gap:12px;justify-content:flex-end;padding:12px 16px;border-radius:14px;background:var(--card3);border:1px solid var(--line-gold);box-shadow:0 10px 30px rgba(0,0,0,.25);margin-top:4px}'
+'.rz-ro{font-size:.78rem;color:var(--soft)}'
+'@media (max-width:980px){.rz-modos{grid-template-columns:repeat(2,minmax(0,1fr))}}'
+'@media (max-width:640px){.rz-modos{grid-template-columns:1fr}.rz-p{grid-template-columns:1fr 1fr}.rz-p .rz-who{grid-column:1/-1}.rz-p .rz-stats{grid-column:1/-1}.rz-regra{flex-direction:column}.rz-sw{margin-left:0}}'
+'body.isApp .rz-modos{grid-template-columns:1fr}body.isApp .rz-p{grid-template-columns:1fr 1fr}body.isApp .rz-p .rz-who,body.isApp .rz-p .rz-stats{grid-column:1/-1}body.isApp .rz-regra{flex-direction:column}';
 D.head.appendChild(st); }

/* ------------------------------------------------------------------ dados */
async function carregar(){
  S.carregando=true; S.erro='';
  var r=null; try{ r=await apiFetch('/api/designacao?n=40'); }catch(e){}
  S.carregando=false;
  if(!r||!r.ok){ S.erro=(r&&r.data&&r.data.error)||'Não foi possível falar com o robô agora.'; return false; }
  S.dados=r.data; S.cfg=clone(r.data.config); S.sujo=false;
  // garante todo mundo da equipe na lista (quem não está entra desligado)
  var ids=(S.cfg.participantes||[]).map(function(p){return p.id;});
  (S.dados.equipe||[]).forEach(function(p){ if(ids.indexOf(p.id)<0) S.cfg.participantes.push({id:p.id,ativo:false,peso:1,limite_dia:0,categorias:[]}); });
  S.cfg.participantes=S.cfg.participantes.filter(function(p){ return !!pessoa(p.id); });
  return true;
}

/* ------------------------------------------------------------------ prévia local (mesma regra do servidor) */
function proximosLocal(n){
  var c=S.cfg; if(!c||!c.ativo||c.modo==='manual') return [];
  var cand=(c.participantes||[]).filter(function(p){return p.ativo;}); if(!cand.length) return [];
  var out=[];
  if(c.modo==='fila'){ for(var i=0;i<n;i++) out.push(cand[i%cand.length].id); return out; }
  var cr={}, tot=cand.reduce(function(a,p){return a+(+p.peso||1);},0);
  for(var j=0;j<n;j++){ var best=null; cand.forEach(function(p){ cr[p.id]=(cr[p.id]||0)+(+p.peso||1); if(best===null||cr[p.id]>cr[best]) best=p.id; }); cr[best]-=tot; out.push(best); }
  return out;
}

/* ------------------------------------------------------------------ tela */
function html(){
  var d=S.dados||{}, c=S.cfg||{}, ed=podeEditar(), dis=ed?'':' disabled';
  var cats=d.categorias||{};
  var prox=S.sujo?proximosLocal(8):(d.proximos||[]);
  var tot30=0; (c.participantes||[]).forEach(function(p){ tot30+=((d.mes||{})[p.id]||0); });

  var h='';
  // cabeçalho
  h+='<div class="panel"><div class="rz-top"><div><h2>'+((typeof ICN!=='undefined'&&ICN.users)||'')+' Distribuição de leads</h2>'
   +'<div class="note" style="margin-top:4px">Quem recebe cada lead novo que entra pelo site, anúncio ou WhatsApp. Vale para a Alice, o follow-up e as notificações: só quem recebe o lead é avisado.</div></div>'
   +'<label class="rz-sw" '+(ed?'onclick="AgionRodizio.set(\'ativo\',!AgionRodizio.cfg().ativo)"':'')+'><span class="rz-tg '+(c.ativo?'on':'')+(ed?'':' off-dis')+'"></span><span class="rz-st '+(c.ativo?'on':'off')+'">'+(c.ativo?'Ligada':'Desligada')+'</span></label></div>';
  if(!c.ativo) h+='<div class="note" style="margin-top:12px">Desligada: lead novo entra <b>sem responsável</b> e o aviso vai para todo mundo, como antes.</div>';
  else if(c.modo==='manual') h+='<div class="note" style="margin-top:12px">Modo manual: cada lead novo aparece em “Aguardando designação” aqui embaixo e você recebe uma notificação.</div>';
  else if(prox.length) h+='<div class="rz-prox"><span class="rz-lab" style="margin:0 6px 0 0">Próximos'+(S.sujo?' (com as mudanças)':'')+'</span>'+prox.map(function(id,i){ return (i?'<span class="rz-arw">›</span>':'')+'<span class="rz-av sm" title="'+esc(nome(id))+'" style="background:'+cor(id)+'">'+esc(ini(nome(id)))+'</span>'; }).join('')+'<span class="note" style="margin-left:6px">sem categoria nem alto valor</span></div>';
  else h+='<div class="note" style="margin-top:12px;color:var(--warn)">Ninguém está recebendo leads. Ligue pelo menos uma pessoa na equipe abaixo.</div>';
  h+='</div>';

  // fila manual
  var pend=pendentes();
  if(pend.length){
    h+='<div class="panel rz-pend"><h2>⏳ Aguardando designação <span class="note" style="margin-left:6px">'+pend.length+'</span></h2>';
    var ops=(d.equipe||[]).map(function(p){ return '<option value="'+p.id+'">'+esc(p.nome)+'</option>'; }).join('');
    pend.forEach(function(x){
      h+='<div class="rz-h"><div class="rz-hx"><b>'+esc(x.nome||('Lead '+String(x.phone).slice(-4)))+'</b> <span class="note">· '+esc(fone(x.phone))+(x.origem?' · '+esc(x.origem):'')+(x.categoria?' · '+esc(cats[x.categoria]||x.categoria):'')+'</span><br><span class="note">'+quando(x.ts)+'</span></div>'
        +((papel()==='master'||papel()==='lider')?'<select class="rz-sel" id="rzSel_'+esc(String(x.phone).replace(/\D/g,''))+'"><option value="">Escolher…</option>'+ops+'</select><button class="btn btn-gold btn-sm" onclick="AgionRodizio.designar(\''+esc(x.phone)+'\')">Designar</button>':'')
        +'</div>';
    });
    h+='</div>';
  }

  // modos
  h+='<div class="panel"><h2>Como distribuir</h2><div class="rz-modos">'+MODOS.map(function(m){
    return '<button class="rz-modo'+(c.modo===m.k?' on':'')+'"'+dis+(ed?' onclick="AgionRodizio.set(\'modo\',\''+m.k+'\')"':'')+'>'+m.ic+'<b>'+m.t+'</b><span class="note">'+m.d+'</span><span class="rz-ex">'+m.ex+'</span></button>';
  }).join('')+'</div></div>';

  // equipe
  var mostraNivel=(c.modo==='peso'||c.modo==='categoria'), mostraCat=(c.modo==='categoria');
  h+='<div class="panel"><h2>Quem participa</h2><div class="note" style="margin:-4px 0 12px">Desligue quem está de férias ou cheio. '+(mostraNivel?'Nível maior = recebe mais. ':'')+(mostraCat?'Sem nenhuma categoria marcada, a pessoa atende todas. ':'')+'Limite por dia: 0 = sem limite.</div><div class="rz-eq">';
  (c.participantes||[]).forEach(function(p,ix){
    var pe=pessoa(p.id)||{}; var hj=(d.hoje||{})[p.id]||0, se=(d.semana||{})[p.id]||0, me=(d.mes||{})[p.id]||0; var pct=tot30?Math.round(me/tot30*100):0;
    h+='<div class="rz-p'+(p.ativo?'':' desl')+'">'
      +'<div class="rz-who"><span class="rz-av" style="background:'+cor(p.id)+'">'+esc(ini(pe.nome))+'</span><span style="min-width:0"><b>'+esc(pe.nome||'—')+'</b><span class="note">'+esc(papelLbl(pe.role))+'</span></span></div>'
      +'<div><div class="rz-lab">Recebe leads</div><label class="rz-sw" style="margin:0" '+(ed?'onclick="AgionRodizio.pp('+ix+',\'ativo\','+(!p.ativo)+')"':'')+'><span class="rz-tg '+(p.ativo?'on':'')+(ed?'':' off-dis')+'"></span></label></div>'
      +'<div>'+(mostraNivel?'<div class="rz-lab">Nível</div><div class="rz-niv">'+[1,2,3,4,5].map(function(n){ return '<button class="'+(n===(+p.peso||1)?'on':'')+'"'+dis+(ed?' onclick="AgionRodizio.pp('+ix+',\'peso\','+n+')"':'')+'>'+n+'</button>'; }).join('')+'</div>'
          :'<div class="rz-lab">Limite/dia</div>')
      +(mostraNivel?'':'<input class="rz-lim" type="number" min="0" max="99" value="'+(+p.limite_dia||0)+'"'+dis+' onchange="AgionRodizio.pp('+ix+',\'limite_dia\',+this.value||0)">')+'</div>'
      +'<div class="rz-stats"><div class="rz-num"><span><b>'+hj+'</b>hoje</span><span><b>'+se+'</b>7 dias</span><span><b>'+me+'</b>30 dias</span>'
      +(mostraNivel?'<span><span class="rz-lab" style="margin:0 0 2px">Limite/dia</span><input class="rz-lim" type="number" min="0" max="99" value="'+(+p.limite_dia||0)+'"'+dis+' onchange="AgionRodizio.pp('+ix+',\'limite_dia\',+this.value||0)"></span>':'')
      +'</div><div class="rz-bar" title="'+pct+'% dos leads dos últimos 30 dias"><i style="width:'+pct+'%"></i></div></div>'
      +(mostraCat?'<div class="rz-cats"><span class="rz-lab" style="width:100%;margin:0">Atende</span>'+ORD(cats).map(function(k){ var on=(p.categorias||[]).indexOf(k)>=0; return '<button class="rz-chip'+(on?' on':'')+'"'+dis+(ed?' onclick="AgionRodizio.cat('+ix+',\''+k+'\')"':'')+'>'+esc(cats[k])+'</button>'; }).join('')+((p.categorias||[]).length?'':'<span class="note" style="align-self:center">· todas</span>')+'</div>':'')
      +'</div>';
  });
  h+='</div></div>';

  // regras
  var av=c.alto_valor||{};
  h+='<div class="panel"><h2>Regras extras</h2>'
   +'<div class="rz-regra"><label class="rz-sw" style="margin:0" '+(ed?'onclick="AgionRodizio.av(\'ativo\',!AgionRodizio.cfg().alto_valor.ativo)"':'')+'><span class="rz-tg '+(av.ativo?'on':'')+(ed?'':' off-dis')+'"></span></label>'
   +'<div class="rz-tx"><b>Lead de alto valor vai para pessoas escolhidas</b><div class="note">Quando o lead fala um crédito a partir do valor abaixo, ele vai só para quem estiver marcado (entre eles vale o nível). Se ninguém marcado puder receber, segue a regra normal.</div>'
   +'<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:10px"><span class="rz-lab" style="margin:0">A partir de</span><input class="rz-in" inputmode="numeric" value="'+esc(brl(av.minimo||1000000))+'"'+dis+' onchange="AgionRodizio.av(\'minimo\',+(this.value.replace(/\\D/g,\'\'))||0)">'
   +'<span class="rz-lab" style="margin:0 0 0 6px">Recebem</span>'+(d.equipe||[]).map(function(p){ var on=(av.ids||[]).indexOf(p.id)>=0; return '<button class="rz-chip'+(on?' on':'')+'"'+dis+(ed?' onclick="AgionRodizio.avId(\''+p.id+'\')"':'')+'>'+esc(primeiro(p.nome))+'</button>'; }).join('')+'</div></div></div>'
   +'<div class="rz-regra"><label class="rz-sw" style="margin:0" '+(ed?'onclick="AgionRodizio.set(\'manter_dono\',!AgionRodizio.cfg().manter_dono)"':'')+'><span class="rz-tg '+(c.manter_dono!==false?'on':'')+(ed?'':' off-dis')+'"></span></label>'
   +'<div class="rz-tx"><b>Manter o dono de quem já é da casa</b><div class="note">Se o telefone já é de um cliente, carta ou lead de alguém, continua com essa pessoa e não gasta a vez do rodízio. Recomendado ligado.</div></div></div>'
   +'</div>';

  // histórico
  var hist=(d.historico||[]);
  h+='<div class="panel"><h2>Últimas designações'+(ed?' <button class="btn btn-ghost btn-sm right" onclick="AgionRodizio.reiniciar()">↺ Recomeçar a fila</button>':'')+'</h2>';
  if(!hist.length) h+='<p class="note">Nenhuma designação ainda. Assim que a distribuição estiver ligada e um lead novo chegar, ele aparece aqui.</p>';
  hist.forEach(function(x){
    h+='<div class="rz-h">'+(x.owner_id?'<span class="rz-av sm" style="background:'+cor(x.owner_id)+'">'+esc(ini(nome(x.owner_id)))+'</span>':'<span class="rz-av sm" style="background:var(--soft)">?</span>')
      +'<div class="rz-hx"><b>'+esc(x.nome||('Lead '+String(x.phone||'').slice(-4)))+'</b> <span class="note">→ '+esc(x.owner_id?primeiro(nome(x.owner_id)):'ninguém')+(x.valor?' · '+brl(x.valor):'')+'</span><br><span class="note">'+quando(x.ts)+(x.origem?' · '+esc(x.origem):'')+'</span></div><span class="rz-tag">'+esc(x.regra||'')+'</span></div>';
  });
  h+='</div>';

  if(ed&&S.sujo) h+='<div class="rz-save"><span class="note" style="margin-right:auto">Você tem mudanças não salvas.</span><button class="btn btn-ghost btn-sm" onclick="AgionRodizio.descartar()">Descartar</button><button class="btn btn-gold btn-sm" onclick="AgionRodizio.salvar()">Salvar distribuição</button></div>';
  if(!ed) h+='<p class="rz-ro">Só o master altera a distribuição.'+(papel()==='lider'?' Você pode designar leads que estão aguardando.':'')+'</p>';
  return h;
}

function pendentes(){
  var hist=((S.dados||{}).historico||[]), visto={}, out=[];
  hist.forEach(function(x){ var k=String(x.phone||'').replace(/\D/g,'').slice(-8); if(!k||visto[k]) return; visto[k]=1; if(!x.owner_id&&/aguardando/i.test(x.regra||'')) out.push(x); });
  return out;
}

function pintar(){ var B=D.getElementById('mktBody'); if(!B||W.__mktTab!=='dist') return; var y=W.scrollY; B.innerHTML=html(); try{ W.scrollTo(0,y); }catch(e){} }

async function abrir(B){
  css(); W.__mktTab='dist';
  B.innerHTML='<div class="panel"><p class="note">Carregando a distribuição…</p></div>';
  var ok=await carregar();
  if(W.__mktTab!=='dist') return;
  if(!ok){ B.innerHTML='<div class="panel"><h2>Distribuição de leads</h2><p class="note">'+esc(S.erro)+'</p><button class="btn btn-ghost btn-sm" onclick="mktSub(\'dist\')">Tentar de novo</button></div>'; return; }
  pintar();
}

/* ------------------------------------------------------------------ ações */
function mudou(){ S.sujo=true; pintar(); }
var API={
  cfg:function(){ return S.cfg||{}; },
  set:function(k,v){ if(!podeEditar()) return; S.cfg[k]=v; mudou(); },
  pp:function(i,k,v){ if(!podeEditar()) return; var p=S.cfg.participantes[i]; if(!p) return; p[k]=v; mudou(); },
  cat:function(i,k){ if(!podeEditar()) return; var p=S.cfg.participantes[i]; p.categorias=p.categorias||[]; var j=p.categorias.indexOf(k); if(j>=0) p.categorias.splice(j,1); else p.categorias.push(k); mudou(); },
  av:function(k,v){ if(!podeEditar()) return; S.cfg.alto_valor=S.cfg.alto_valor||{}; S.cfg.alto_valor[k]=v; mudou(); },
  avId:function(id){ if(!podeEditar()) return; var a=S.cfg.alto_valor=S.cfg.alto_valor||{}; a.ids=a.ids||[]; var j=a.ids.indexOf(id); if(j>=0) a.ids.splice(j,1); else a.ids.push(id); mudou(); },
  descartar:function(){ S.cfg=clone(S.dados.config); S.sujo=false; mktSub('dist'); },
  salvar:async function(){
    if(S.cfg.ativo&&S.cfg.modo!=='manual'&&!(S.cfg.participantes||[]).some(function(p){return p.ativo;})){ alert('Ligue pelo menos uma pessoa para receber leads (ou use o modo Manual).'); return; }
    var r=null; try{ r=await apiFetch('/api/designacao',{method:'POST',body:JSON.stringify({config:S.cfg})}); }catch(e){}
    if(!r||!r.ok){ alert('Não salvou: '+((r&&r.data&&r.data.error)||'sem conexão com o robô')); return; }
    try{ if(typeof toast==='function') toast('Distribuição salva'); }catch(e){}
    mktSub('dist');
  },
  reiniciar:async function(){ if(!confirm('Recomeçar a fila do rodízio do início?')) return; await apiFetch('/api/designacao',{method:'POST',body:JSON.stringify({acao:'reiniciar'})}); mktSub('dist'); },
  designar:async function(phone){
    var el=D.getElementById('rzSel_'+String(phone).replace(/\D/g,'')); var id=el&&el.value; if(!id){ alert('Escolha quem vai atender.'); return; }
    var r=null; try{ r=await apiFetch('/api/designacao',{method:'POST',body:JSON.stringify({acao:'designar',phone:phone,owner_id:id})}); }catch(e){}
    if(!r||!r.ok){ alert('Não designou: '+((r&&r.data&&r.data.error)||'sem conexão')); return; }
    mktSub('dist');
  }
};
W.AgionRodizio=API;

/* ------------------------------------------------------------------ ganchos na aba Marketing */
function botao(){
  var nav=D.getElementById('mktNav'); if(!nav||nav.querySelector('[data-k="dist"]')) return;
  if(!(papel()==='master'||papel()==='lider')) return;
  var b=D.createElement('button'); b.setAttribute('data-k','dist'); b.className='btn btn-ghost btn-sm'; b.textContent='Distribuição de leads';
  b.onclick=function(){ mktSub('dist'); };
  var ref=nav.querySelector('[data-k="score"]'); if(ref&&ref.nextSibling) nav.insertBefore(b,ref.nextSibling); else nav.appendChild(b);
}
function marca(k){ D.querySelectorAll('#mktNav button').forEach(function(b){ var on=b.getAttribute('data-k')===k; b.className='btn btn-sm '+(on?'btn-gold':'btn-ghost'); }); }

function instalar(){
  if(typeof W.renderMarketing!=='function'||typeof W.mktSub!=='function'){ return setTimeout(instalar,300); }
  if(W.renderMarketing.__rz) return;
  var oRM=W.renderMarketing, oSub=W.mktSub, oAuto=W.mktAutoTab;
  var nRM=async function(C){ var r=await oRM.apply(this,arguments); botao(); if(W.__mktTab==='dist') W.mktSub('dist'); return r; };
  nRM.__rz=1; W.renderMarketing=nRM;
  W.mktSub=function(k){
    botao();
    if(k==='dist'){ var B=D.getElementById('mktBody'); if(!B) return; marca('dist'); return abrir(B); }
    return oSub.apply(this,arguments);
  };
  if(typeof oAuto==='function') W.mktAutoTab=function(B){
    var r=oAuto.apply(this,arguments);
    try{ D.querySelectorAll('#mktBody .autoCard').forEach(function(card){
      if(!/Distribuição automática de leads/.test(card.textContent||'')) return;
      var lb=card.querySelector('label'); if(lb) lb.outerHTML='<button class="btn btn-teal btn-sm" onclick="mktSub(\'dist\')">Configurar →</button>';
      var sp=card.querySelector('.note'); if(sp) sp.textContent='Rodízio em fila, por nível, por categoria ou manual — com alto valor e quem participa. Configure na aba Distribuição de leads.';
    }); }catch(e){}
    return r;
  };
}
instalar();
})();
