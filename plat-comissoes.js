/* =====================================================================
   AGION — COMISSÕES (HS Consórcios)  —  Fase 1
   Carregado pelo plataforma.html via <script src>. Prefixo cms*.
   Host: esc() BRL() BRL2() ask() chooseModal() flash() setTop() supa
         session meId() isMaster() isLider() effRole() user() db logEvt()
   Regras: ver especificação de 07/10/2026 (competência 26→25, clusters,
   33/12/12/12/31, antecipação 26→15 = dia 23, 16→25 = dia 10).
   ===================================================================== */
(function(){
'use strict';

/* ===================== PARÂMETROS ===================== */
var HS_PRE = 0.02, HS_POS = 0.02;
var HS_PARC = [0.0075, 0.0025, 0.0025, 0.0025, 0.0050];   // o que a HS paga por parcela (sobre o crédito)
var FUNC_SHARE = [0.33, 0.12, 0.12, 0.12, 0.31];          // divisão da comissão do funcionário
var CLUSTERS = [
  {ate:1000000, r:0.0050, rot:'até R$ 1.000.000'},
  {ate:1800000, r:0.0055, rot:'R$ 1.000.001 a 1.800.000'},
  {ate:2500000, r:0.0060, rot:'R$ 1.800.001 a 2.500.000'},
  {ate:3200000, r:0.0065, rot:'R$ 2.500.001 a 3.200.000'},
  {ate:4600000, r:0.0070, rot:'R$ 3.200.001 a 4.600.000'},
  {ate:Infinity, r:0.0080, rot:'acima de R$ 4.600.000'}
];
var PROPRIO_PRE = 0.01, PROPRIO_POS = 0.01;
var CUTOFF_ANTEC = 20;   // vendas até o dia 20 entram no cluster da antecipação (dia 23)
var SIT_LBL = {EM_DIA:'Em dia', INADIMPLENTE:'Não pagou', REEMBOLSO_PARCIAL:'Reembolso parcial', REEMBOLSO_TOTAL:'Reembolso total', CANCELADA:'Cancelada'};
var POS_LBL = {NAO_CONTEMPLADA:'Aguardando contemplação', CONTEMPLADA:'Contemplada', COMISSAO_POS_RECEBIDA:'Comissão pós recebida'};

/* ===================== DATAS ===================== */
function pad(n){ return (n<10?'0':'')+n; }
function iso(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
function parseISO(s){ var p=String(s||'').slice(0,10).split('-'); return new Date(+p[0], +p[1]-1, +p[2]||1); }
function fmtBR(s){ if(!s) return '—'; var d=(s instanceof Date)?s:parseISO(s); return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear(); }
function mkDate(y,m,d){ return new Date(y,m,d); } // m 0-based, aceita overflow
function competencia(dateISO){
  var d=parseISO(dateISO), y=d.getFullYear(), m=d.getMonth();
  var ini = d.getDate()>=26 ? mkDate(y,m,26) : mkDate(y,m-1,26);
  var fim = mkDate(ini.getFullYear(), ini.getMonth()+1, 25);
  return {ini:iso(ini), fim:iso(fim), key:iso(ini), rot:fmtBR(ini).slice(0,5)+' → '+fmtBR(fim).slice(0,5)+'/'+fim.getFullYear()};
}
function compAtual(){ return competencia(iso(new Date())); }
function compShift(key,n){ var d=parseISO(key); return competencia(iso(mkDate(d.getFullYear(), d.getMonth()+n, 26))); }
function janelaDe(dateISO){
  var c=competencia(dateISO), d=parseISO(dateISO), fim=parseISO(c.fim);
  var antec = !(d.getMonth()===fim.getMonth() && d.getFullYear()===fim.getFullYear() && d.getDate()>=16);
  var p1 = antec ? mkDate(fim.getFullYear(), fim.getMonth(), 23) : mkDate(fim.getFullYear(), fim.getMonth()+1, 10);
  var datas=[iso(p1)];
  for(var k=1;k<5;k++) datas.push(iso(mkDate(p1.getFullYear(), p1.getMonth()+k, 10)));
  return {tipo: antec?'ANTECIPACAO':'NORMAL', datas:datas, ajusteData: iso(mkDate(fim.getFullYear(), fim.getMonth()+1, 10))};
}
function clusterDe(prod){ for(var i=0;i<CLUSTERS.length;i++) if(prod<=CLUSTERS[i].ate) return CLUSTERS[i]; return CLUSTERS[CLUSTERS.length-1]; }
function proxCluster(prod){ for(var i=0;i<CLUSTERS.length;i++) if(prod<=CLUSTERS[i].ate) return CLUSTERS[i+1]||null; return null; }
function pct(r){ return (r*100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%'; }

/* ===================== DADOS ===================== */
var _vendas=[], _loaded=false, _compSel=null, _funcSel='';
function ativa(v){ return v.situacao!=='CANCELADA' && v.situacao!=='REEMBOLSO_TOTAL'; }
function elegivelCluster(v){ return v.origem==='LEAD_AGION' && v.origem_status==='VALIDADA' && ativa(v); }
async function load(){
  try{ var r=await supa.from('comissoes_vendas').select('*').order('data_insercao',{ascending:false}); _vendas=r.data||[]; }
  catch(e){ _vendas=[]; }
  _loaded=true;
}
function parc(v,n){ var p=(v.parcelas||[]).find(function(x){return +x.n===n;}); return p||{n:n,hs:'PREVISTA',func:'PREVISTA'}; }

/* ===================== MOTOR ===================== */
// calcula tudo de uma venda dentro do contexto da competência (vendas do mesmo vendedor)
function calc(v, all){
  var c=competencia(v.data_insercao), jan=janelaDe(v.data_insercao);
  var mesmas=all.filter(function(x){ return x.vendedor_id===v.vendedor_id && competencia(x.data_insercao).key===c.key && elegivelCluster(x); });
  var prod=mesmas.reduce(function(s,x){return s+(+x.credito||0);},0);
  var fim=parseISO(c.fim), cut=iso(mkDate(fim.getFullYear(), fim.getMonth(), CUTOFF_ANTEC));
  var prod20=mesmas.filter(function(x){return x.data_insercao<=cut;}).reduce(function(s,x){return s+(+x.credito||0);},0);
  var credito=+v.credito||0, proprio=v.origem==='CLIENTE_PROPRIO';
  var rate = proprio ? PROPRIO_PRE : clusterDe(prod).r;
  var rate20 = proprio ? PROPRIO_PRE : clusterDe(prod20).r;
  var funcPre = credito*rate, hsPre=credito*HS_PRE, agionPre=hsPre-funcPre;
  var parcelas=[];
  for(var i=0;i<5;i++){
    var r_i = (i===0 && jan.tipo==='ANTECIPACAO') ? rate20 : rate;
    var st=parc(v,i+1);
    parcelas.push({n:i+1, data:jan.datas[i], hs:credito*HS_PARC[i], func:credito*r_i*FUNC_SHARE[i], hsStatus:st.hs||'PREVISTA', funcStatus:st.func||'PREVISTA', dataEfetiva:st.data_efetiva||null});
    parcelas[i].agion=parcelas[i].hs-parcelas[i].func;
  }
  var ajuste = (jan.tipo==='ANTECIPACAO' && rate>rate20) ? credito*(rate-rate20)*FUNC_SHARE[0] : 0;
  var posFunc = proprio ? credito*PROPRIO_POS : 0, posHs=credito*HS_POS;
  var funcTot = parcelas.reduce(function(s,p){return s+p.func;},0)+ajuste;
  var funcPago = parcelas.filter(function(p){return p.funcStatus==='PAGA';}).reduce(function(s,p){return s+p.func;},0) + (v.ajuste_pago?ajuste:0);
  var hsRec = parcelas.filter(function(p){return p.hsStatus==='RECEBIDA';}).reduce(function(s,p){return s+p.hs;},0);
  var reemb = +v.reembolso_valor||0;
  return {comp:c, jan:jan, prod:prod, prod20:prod20, rate:rate, rate20:rate20, cluster:clusterDe(prod), credito:credito, proprio:proprio,
    hsPre:hsPre, funcPre:funcTot, agionPre:hsPre-funcTot, parcelas:parcelas, ajuste:ajuste, ajusteData:jan.ajusteData,
    posHs:posHs, posFunc:posFunc, posAgion:posHs-posFunc, funcPago:funcPago, funcPend:funcTot-funcPago, hsRec:hsRec, hsPend:hsPre-hsRec, reemb:reemb,
    proximo: parcelas.filter(function(p){return p.funcStatus!=='PAGA';}).map(function(p){return p;})[0]||null };
}
function resumoFunc(uid, compKey, all){
  var mine=all.filter(function(v){return v.vendedor_id===uid;});
  var comp=mine.filter(function(v){return competencia(v.data_insercao).key===compKey;});
  var prodTot=comp.filter(ativa).reduce(function(s,v){return s+(+v.credito||0);},0);
  var prodCl=comp.filter(elegivelCluster).reduce(function(s,v){return s+(+v.credito||0);},0);
  var cl=clusterDe(prodCl), nx=proxCluster(prodCl);
  var gerada=0,paga=0,pend=0,futura=0,reemb=0,hsPre=0,agion=0,posHs=0,posAgion=0,posRec=0,posFuncRec=0;
  mine.forEach(function(v){ if(!ativa(v)) { reemb+=(+v.reembolso_valor||0); return; }
    var k=calc(v,all); gerada+=k.funcPre; paga+=k.funcPago; pend+=k.funcPend; hsPre+=k.hsPre; agion+=k.agionPre; posHs+=k.posHs; posAgion+=k.posAgion; reemb+=k.reemb;
    if(v.origem==='CLIENTE_PROPRIO'){ if(v.pos_status==='NAO_CONTEMPLADA') futura+=k.posFunc; else if(v.pos_func_pago) posFuncRec+=k.posFunc; else futura+=k.posFunc; }
    if(v.pos_status==='COMISSAO_POS_RECEBIDA') posRec+=k.posHs; });
  var prox=null; mine.forEach(function(v){ if(!ativa(v))return; var k=calc(v,all); k.parcelas.forEach(function(p){ if(p.funcStatus!=='PAGA' && (!prox||p.data<prox.data)) prox={data:p.data,valor:p.func,cliente:v.cliente_nome}; }); });
  return {prodTot:prodTot, prodCl:prodCl, cluster:cl, prox:nx, falta: nx?(nx===CLUSTERS[CLUSTERS.length-1]?CLUSTERS[CLUSTERS.length-2].ate+1-prodCl:(cl.ate+1-prodCl)):0,
    gerada:gerada, paga:paga, pend:pend, futura:futura, reemb:reemb, proximo:prox, n:comp.length, hsPre:hsPre, agion:agion, posHs:posHs, posAgion:posAgion, posRec:posRec, posFuncRec:posFuncRec};
}

/* ===================== UI: helpers ===================== */
function kpi(lab,val,grad,sub){ sub=sub?String(sub).replace(/<b>/g,'<strong style="color:var(--head)">').replace(/<\/b>/g,'</strong>'):''; return '<div class="kpi'+(grad?' grad':'')+'"><div class="lab">'+lab+'</div><b>'+val+'</b>'+(sub?'<div class="note" style="margin-top:6px">'+sub+'</div>':'')+'</div>'; }
function chip(t,cor){ return '<span class="chip" style="'+(cor?'color:'+cor+';border-color:'+cor+'66;':'')+'">'+t+'</span>'; }
function stChip(s){ if(s==='PAGA'||s==='RECEBIDA') return chip(s==='PAGA'?'Paga':'Recebida','#4CAF7D'); return chip('Prevista'); }
function sitChip(s){ var c={EM_DIA:'#4CAF7D',INADIMPLENTE:'#E0B978',REEMBOLSO_PARCIAL:'#E08A5A',REEMBOLSO_TOTAL:'#D9534F',CANCELADA:'#D9534F'}[s]||''; return chip(SIT_LBL[s]||s,c); }
function origemChip(v){ if(v.origem_status==='EM_REVISAO') return chip('Em validação','#E0B978'); return v.origem==='CLIENTE_PROPRIO'?chip('Cliente próprio','#C5A059'):chip('Lead Agion','#7FD1C1'); }
function compSelect(){
  var cur=compAtual(), opts='';
  for(var i=0;i>-12;i--){ var c=compShift(cur.key,i); opts+='<option value="'+c.key+'"'+(c.key===_compSel?' selected':'')+'>'+c.rot+'</option>'; }
  return '<select onchange="cmsSetComp(this.value)" style="background:var(--card2);border:1px solid var(--line);color:var(--head);padding:8px 10px;border-radius:10px;font:inherit">'+opts+'</select>';
}
function mesesRolantes(){ var out=[], d=new Date(); for(var i=0;i<5;i++){ var m=mkDate(d.getFullYear(), d.getMonth()+i, 1); out.push({key:iso(m).slice(0,7), rot:['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'][m.getMonth()]+'/'+String(m.getFullYear()).slice(2)}); } return out; }
function tabelaRolante(vendas, all, comAgion){
  var meses=mesesRolantes();
  var head='<tr><th>Cliente</th><th>Crédito</th>'+meses.map(function(m){return '<th class="n">'+m.rot+'</th>';}).join('')+'<th class="n">Total previsto</th></tr>';
  var tot={}; meses.forEach(function(m){tot[m.key]=0;});
  var rows=vendas.filter(ativa).map(function(v){ var k=calc(v,all); var cells=meses.map(function(m){ var s=0, pend=0; k.parcelas.forEach(function(p){ if(p.data.slice(0,7)===m.key){ s+=p.func; if(p.funcStatus!=='PAGA') pend+=p.func; } }); if(k.ajuste && k.ajusteData.slice(0,7)===m.key){ s+=k.ajuste; if(!v.ajuste_pago) pend+=k.ajuste; } tot[m.key]+=pend; return '<td class="n">'+(s?BRL2(s)+(pend<s?' <span class="note">(pago '+BRL2(s-pend)+')</span>':''):'—')+'</td>'; }).join('');
    return '<tr><td>'+esc(v.cliente_nome||'—')+' '+origemChip(v)+'</td><td>'+BRL(k.credito)+'</td>'+cells+'<td class="n"><b>'+BRL2(k.funcPend)+'</b></td></tr>'; }).join('');
  var foot='<tr><td colspan="2"><b>A receber no mês</b></td>'+meses.map(function(m){return '<td class="n"><b>'+BRL2(tot[m.key])+'</b></td>';}).join('')+'<td></td></tr>';
  return '<div class="tbl-scroll"><table><thead>'+head+'</thead><tbody>'+(rows||'<tr><td colspan="8" class="note">Nenhuma venda registrada.</td></tr>')+'</tbody><tfoot>'+foot+'</tfoot></table></div>';
}

/* ===================== UI: FUNCIONÁRIO ===================== */
function paintFunc(C, uid, titulo){
  var R=resumoFunc(uid,_compSel,_vendas), comp=compShift(_compSel,0);
  var mine=_vendas.filter(function(v){return v.vendedor_id===uid;});
  var cards='<div class="kpis">'
    +kpi('Produção da competência',BRL(R.prodTot),true,'Válida p/ cluster: <b>'+BRL(R.prodCl)+'</b>')
    +kpi('Cluster atual',pct(R.cluster.r),false,R.prox?('Falta <b>'+BRL(R.falta)+'</b> p/ '+pct(R.prox.r)):'Faixa máxima')
    +kpi('Comissão gerada',BRL2(R.gerada),false,'Pré-contemplação (todas as vendas)')
    +kpi('Já recebida',BRL2(R.paga),false,'')
    +kpi('A receber',BRL2(R.pend),true,R.proximo?('Próximo: <b>'+fmtBR(R.proximo.data)+'</b> · '+BRL2(R.proximo.valor)):'')
    +kpi('Futura por contemplação',BRL2(R.futura),false,'Só clientes próprios')
    +(R.reemb?kpi('Reembolsos',BRL2(R.reemb),false,'Descontos de cotas com reembolso'):'')
    +'</div>';
  var sel='<div style="display:flex;gap:10px;align-items:center;margin-bottom:14px;flex-wrap:wrap"><span class="note">Competência</span>'+compSelect()+'<span class="note">'+esc(comp.rot)+'</span></div>';
  var rows=mine.map(function(v){ var k=calc(v,_vendas); var pc=k.parcelas.map(function(p){return '<td class="n">'+BRL2(p.func)+'<br><span class="note">'+fmtBR(p.data)+'</span><br>'+stChip(p.funcStatus)+'</td>';}).join('');
    return '<tr><td><b>'+esc(v.cliente_nome||'—')+'</b><br><span class="note">'+esc(v.administradora||'')+(v.grupo?' · '+esc(v.grupo)+'/'+esc(v.cota||''):'')+' · '+fmtBR(v.data_insercao)+'</span><br>'+origemChip(v)+' '+sitChip(v.situacao)+'</td><td>'+BRL(k.credito)+'</td><td class="n">'+pct(k.rate)+'<br><span class="note">'+esc(k.comp.rot)+'</span></td><td class="n"><b>'+BRL2(k.funcPre)+'</b>'+(k.ajuste?'<br><span class="note">inclui ajuste '+BRL2(k.ajuste)+' em '+fmtBR(k.ajusteData)+'</span>':'')+'</td>'+pc+'<td class="n">'+(k.proprio?BRL2(k.posFunc)+'<br>'+chip(POS_LBL[v.pos_status]||v.pos_status,v.pos_status==='NAO_CONTEMPLADA'?'':'#4CAF7D'):'—')+'</td></tr>'; }).join('');
  var tbl='<div class="panel"><h2>Minhas vendas</h2><div class="tbl-scroll"><table><thead><tr><th>Cliente</th><th>Crédito</th><th class="n">% aplicado</th><th class="n">Comissão pré</th><th class="n">1ª (33%)</th><th class="n">2ª (12%)</th><th class="n">3ª (12%)</th><th class="n">4ª (12%)</th><th class="n">5ª (31%)</th><th class="n">Pós-contemplação</th></tr></thead><tbody>'+(rows||'<tr><td colspan="10" class="note">Nenhuma venda registrada ainda.</td></tr>')+'</tbody></table></div></div>';
  var rol='<div class="panel"><h2>Próximos recebimentos (5 meses)</h2>'+tabelaRolante(mine,_vendas,false)+'</div>';
  var sit=mine.filter(function(v){return v.situacao!=='EM_DIA';});
  var sitHtml='<div class="panel"><h2>Situação dos clientes</h2>'+(sit.length?'<div class="tbl-scroll"><table><thead><tr><th>Cliente</th><th>Situação</th><th class="n">Reembolso</th><th>Obs.</th></tr></thead><tbody>'+sit.map(function(v){return '<tr><td>'+esc(v.cliente_nome||'—')+'</td><td>'+sitChip(v.situacao)+'</td><td class="n">'+(v.reembolso_valor?BRL2(v.reembolso_valor):'—')+'</td><td class="note">'+esc(v.obs||'')+'</td></tr>';}).join('')+'</tbody></table></div>':'<p class="note">Todos os clientes em dia.</p>')+'</div>';
  C.innerHTML=sel+cards+tbl+rol+sitHtml;
}

/* ===================== UI: MASTER ===================== */
function paintMaster(C){
  var all=_vendas, comp=compShift(_compSel,0);
  var vend={}; all.forEach(function(v){ vend[v.vendedor_id]=1; });
  var ids=Object.keys(vend);
  var T={prod:0,prodL:0,prodP:0,hsPre:0,hsRec:0,func:0,funcPago:0,agion:0,posHs:0,posRec:0,posFunc:0,reemb:0,rev:0};
  all.forEach(function(v){ if(v.origem_status==='EM_REVISAO') T.rev++; if(!ativa(v)){ T.reemb+=(+v.reembolso_valor||0); return; } var k=calc(v,all); var inComp=k.comp.key===_compSel;
    if(inComp){ T.prod+=k.credito; if(v.origem==='LEAD_AGION')T.prodL+=k.credito; else T.prodP+=k.credito; }
    T.hsPre+=k.hsPre; T.hsRec+=k.hsRec; T.func+=k.funcPre; T.funcPago+=k.funcPago; T.agion+=k.agionPre; T.posHs+=k.posHs; T.reemb+=k.reemb;
    if(v.pos_status==='COMISSAO_POS_RECEBIDA') T.posRec+=k.posHs; if(v.origem==='CLIENTE_PROPRIO'&&!v.pos_func_pago) T.posFunc+=k.posFunc; });
  var cards='<div class="kpis">'
    +kpi('Produção da competência',BRL(T.prod),true,'Leads Agion <b>'+BRL(T.prodL)+'</b> · Próprios <b>'+BRL(T.prodP)+'</b>')
    +kpi('Comissão pré (HS)',BRL2(T.hsPre),false,'Recebida <b>'+BRL2(T.hsRec)+'</b> · A receber <b>'+BRL2(T.hsPre-T.hsRec)+'</b>')
    +kpi('Comissão dos funcionários',BRL2(T.func),false,'Paga <b>'+BRL2(T.funcPago)+'</b> · Pendente <b>'+BRL2(T.func-T.funcPago)+'</b>')
    +kpi('Margem Agion (pré)',BRL2(T.agion),true,'')
    +kpi('Pós-contemplação potencial',BRL2(T.posHs),false,'Recebida <b>'+BRL2(T.posRec)+'</b>')
    +kpi('Futura dos funcionários (pós)',BRL2(T.posFunc),false,'1% dos clientes próprios')
    +kpi('Reembolsos',BRL2(T.reemb),false,'')
    +(T.rev?kpi('Origens em validação',String(T.rev),false,'Cadastros aguardando sua decisão'):'')
    +'</div>';
  var sel='<div style="display:flex;gap:10px;align-items:center;margin-bottom:14px;flex-wrap:wrap"><span class="note">Competência</span>'+compSelect()+'<span class="note">'+esc(comp.rot)+'</span><span style="flex:1"></span><button class="btn btn-gold btn-sm" onclick="cmsNovaVenda()">+ Registrar venda</button></div>';
  var porFunc='<div class="panel"><h2>Por funcionário — '+esc(comp.rot)+'</h2><div class="tbl-scroll"><table><thead><tr><th>Funcionário</th><th class="n">Vendas</th><th class="n">Produção</th><th class="n">Válida p/ cluster</th><th class="n">Cluster</th><th class="n">Falta p/ próxima</th><th class="n">Comissão gerada</th><th class="n">Paga</th><th class="n">Pendente</th><th class="n">Futura (pós)</th><th></th></tr></thead><tbody>'
    +(ids.map(function(id){ var R=resumoFunc(id,_compSel,all); var u=user(id); return '<tr><td><b>'+esc(u.nome||id)+'</b></td><td class="n">'+R.n+'</td><td class="n">'+BRL(R.prodTot)+'</td><td class="n">'+BRL(R.prodCl)+'</td><td class="n">'+pct(R.cluster.r)+'</td><td class="n">'+(R.prox?BRL(R.falta):'máx.')+'</td><td class="n">'+BRL2(R.gerada)+'</td><td class="n">'+BRL2(R.paga)+'</td><td class="n"><b>'+BRL2(R.pend)+'</b></td><td class="n">'+BRL2(R.futura)+'</td><td><button class="btn btn-ghost btn-sm" onclick="cmsVerFunc(\''+id+'\')">Ver</button></td></tr>'; }).join('')||'<tr><td colspan="11" class="note">Nenhuma venda registrada.</td></tr>')+'</tbody></table></div></div>';
  var lista=all.slice();
  var rows=lista.map(function(v){ var k=calc(v,all); var u=user(v.vendedor_id);
    var pc=k.parcelas.map(function(p){ return '<td class="n"><span class="note">'+fmtBR(p.data)+'</span><br>HS '+BRL2(p.hs)+' <a onclick="cmsToggle(\''+v.id+'\','+p.n+',\'hs\')" style="cursor:pointer">'+stChip(p.hsStatus)+'</a><br>Func '+BRL2(p.func)+' <a onclick="cmsToggle(\''+v.id+'\','+p.n+',\'func\')" style="cursor:pointer">'+stChip(p.funcStatus)+'</a></td>'; }).join('');
    var acts='<div style="display:flex;flex-direction:column;gap:4px">'+(v.origem_status==='EM_REVISAO'?'<button class="btn btn-gold btn-sm" onclick="cmsValidar(\''+v.id+'\')">Validar origem</button>':'')+'<button class="btn btn-ghost btn-sm" onclick="cmsPos(\''+v.id+'\')">Contemplação</button><button class="btn btn-ghost btn-sm" onclick="cmsSituacao(\''+v.id+'\')">Situação</button><button class="btn btn-ghost btn-sm" onclick="cmsEditar(\''+v.id+'\')">Editar</button><button class="btn btn-ghost btn-sm" style="color:var(--bad)" onclick="cmsExcluir(\''+v.id+'\')">Excluir</button></div>';
    return '<tr><td><b>'+esc(v.cliente_nome||'—')+'</b><br><span class="note">'+esc((u.nome||'').split(' ')[0])+' · '+esc(v.administradora||'')+(v.grupo?' · '+esc(v.grupo)+'/'+esc(v.cota||''):'')+' · '+fmtBR(v.data_insercao)+' · '+esc(k.comp.rot)+' · '+(k.jan.tipo==='ANTECIPACAO'?'antecipação':'normal')+'</span><br>'+origemChip(v)+' '+sitChip(v.situacao)+(v.reembolso_valor?' '+chip('reemb. '+BRL2(v.reembolso_valor),'#E08A5A'):'')+'</td><td>'+BRL(k.credito)+'<br><span class="note">'+pct(k.rate)+(k.ajuste?' · ajuste '+BRL2(k.ajuste)+' em '+fmtBR(k.ajusteData):'')+'</span></td><td class="n">HS '+BRL2(k.hsPre)+'<br>Func <b>'+BRL2(k.funcPre)+'</b><br>Agion '+BRL2(k.agionPre)+'</td>'+pc+'<td class="n">'+chip(POS_LBL[v.pos_status]||v.pos_status,v.pos_status==='NAO_CONTEMPLADA'?'':'#4CAF7D')+'<br>Func '+BRL2(k.posFunc)+(v.pos_func_pago?' ✓':'')+'<br>Agion '+BRL2(k.posAgion)+'</td><td>'+acts+'</td></tr>'; }).join('');
  var tbl='<div class="panel"><h2>Todas as vendas <span class="right note">clique no status da parcela para marcar recebida (HS) / paga (funcionário)</span></h2><div class="tbl-scroll" style="max-height:640px"><table><thead><tr><th>Venda</th><th>Crédito</th><th class="n">Pré (2%)</th><th class="n">1ª</th><th class="n">2ª</th><th class="n">3ª</th><th class="n">4ª</th><th class="n">5ª</th><th class="n">Pós (2%)</th><th></th></tr></thead><tbody>'+(rows||'<tr><td colspan="10" class="note">Nenhuma venda registrada. Use "Registrar venda" ou cadastre uma carta HS com valor.</td></tr>')+'</tbody></table></div></div>';
  var rol='<div class="panel"><h2>Pagamentos aos funcionários — próximos 5 meses</h2>'+tabelaRolante(all,all,true)+'</div>';
  var sit=all.filter(function(v){return v.situacao!=='EM_DIA';});
  var sitHtml='<div class="panel"><h2>Clientes com pendência / reembolso</h2>'+(sit.length?'<div class="tbl-scroll"><table><thead><tr><th>Cliente</th><th>Funcionário</th><th>Situação</th><th class="n">Reembolso</th><th>Obs.</th></tr></thead><tbody>'+sit.map(function(v){return '<tr><td>'+esc(v.cliente_nome||'—')+'</td><td>'+esc((user(v.vendedor_id).nome||'').split(' ')[0])+'</td><td>'+sitChip(v.situacao)+'</td><td class="n">'+(v.reembolso_valor?BRL2(v.reembolso_valor):'—')+'</td><td class="note">'+esc(v.obs||'')+'</td></tr>';}).join('')+'</tbody></table></div>':'<p class="note">Nenhuma pendência.</p>')+'</div>';
  C.innerHTML=sel+cards+porFunc+tbl+rol+sitHtml;
}

/* ===================== AÇÕES (Master) ===================== */
async function upd(id, patch, desc){
  if(typeof roGuard==='function'&&roGuard())return false;
  patch.atualizado_em=new Date().toISOString();
  try{ var r=await supa.from('comissoes_vendas').update(patch).eq('id',id); if(r.error) throw r.error; }catch(e){ await ask({title:'Não foi possível salvar',msg:String(e.message||e),ok:'Ok'}); return false; }
  try{ logEvt('comissao','comissoes',desc||'Atualizou comissão',{id:id}); }catch(e){}
  await load(); render(); return true;
}
window.cmsToggle=async function(id,n,tipo){
  if(!isMaster()){flash('Apenas o Master marca recebimentos/pagamentos.');return;}
  var v=_vendas.find(function(x){return x.id===id;}); if(!v)return;
  var ps=(v.parcelas||[]).slice(); var p=ps.find(function(x){return +x.n===n;}); if(!p){p={n:n,hs:'PREVISTA',func:'PREVISTA'};ps.push(p);}
  if(tipo==='hs'){ p.hs=(p.hs==='RECEBIDA')?'PREVISTA':'RECEBIDA'; } else { p.func=(p.func==='PAGA')?'PREVISTA':'PAGA'; }
  p.data_efetiva=new Date().toISOString().slice(0,10);
  await upd(id,{parcelas:ps},'Parcela '+n+' '+(tipo==='hs'?'HS '+p.hs:'funcionário '+p.func)+' — '+(v.cliente_nome||''));
};
window.cmsValidar=async function(id){
  var v=_vendas.find(function(x){return x.id===id;}); if(!v)return;
  var o=await chooseModal('Validar origem','"'+(v.cliente_nome||'')+'" foi cadastrado como cliente próprio de '+(user(v.vendedor_id).nome||'')+'. Confirme a origem real para a comissão:','Cliente próprio (1% + 1% pós)','Lead da Agion (cluster)');
  if(!o)return;
  await upd(id,{origem:o==='a'?'CLIENTE_PROPRIO':'LEAD_AGION',origem_status:'VALIDADA'},'Validou origem de '+(v.cliente_nome||'')+' como '+(o==='a'?'CLIENTE_PROPRIO':'LEAD_AGION'));
};
window.cmsPos=async function(id){
  var v=_vendas.find(function(x){return x.id===id;}); if(!v)return;
  var o=await chooseModal('Contemplação — '+(v.cliente_nome||''),'Status atual: '+(POS_LBL[v.pos_status]||v.pos_status)+'.\n\nMarque o que aconteceu:','Cota contemplada','Comissão pós recebida da HS');
  if(!o)return;
  var patch={}; if(o==='a'){ patch.pos_status='CONTEMPLADA'; patch.pos_data=new Date().toISOString().slice(0,10); }
  else { patch.pos_status='COMISSAO_POS_RECEBIDA'; if(!v.pos_data)patch.pos_data=new Date().toISOString().slice(0,10); if(v.origem==='CLIENTE_PROPRIO'){ var pg=await chooseModal('Pagar funcionário?','Marcar o 1% pós-contemplação de '+(user(v.vendedor_id).nome||'')+' como pago?','Sim — pago','Ainda não'); if(pg==='a') patch.pos_func_pago=true; } }
  await upd(id,patch,'Contemplação '+(patch.pos_status)+' — '+(v.cliente_nome||''));
};
window.cmsSituacao=async function(id){
  var v=_vendas.find(function(x){return x.id===id;}); if(!v)return;
  var o=await chooseModal('Situação — '+(v.cliente_nome||''),'Atual: '+(SIT_LBL[v.situacao]||v.situacao)+'.','Em dia','Não pagou / reembolso / cancelada');
  if(!o)return;
  if(o==='a'){ await upd(id,{situacao:'EM_DIA',reembolso_valor:0},'Situação EM_DIA — '+(v.cliente_nome||'')); return; }
  var t=await chooseModal('Qual a situação?','Escolha:','Não pagou (inadimplente)','Reembolso / cancelamento'); if(!t)return;
  var patch={}, desc='';
  if(t==='a'){ patch.situacao='INADIMPLENTE'; desc='INADIMPLENTE'; }
  else { var r=await chooseModal('Reembolso','Parcial ou total?','Parcial','Total / cancelada'); if(!r)return; patch.situacao=r==='a'?'REEMBOLSO_PARCIAL':'REEMBOLSO_TOTAL'; desc=patch.situacao;
    var val=await ask({title:'Valor do reembolso',msg:'Valor devolvido/estornado (R$):',input:true,value:String(v.reembolso_valor||''),ok:'Salvar'}); if(val===null)return; patch.reembolso_valor=Number(String(val).replace(/[^\d,.-]/g,'').replace(/\./g,'').replace(',','.'))||0; }
  var obs=await ask({title:'Observação',msg:'Opcional:',input:true,value:v.obs||'',ok:'Salvar'}); if(obs!==null) patch.obs=obs;
  await upd(id,patch,'Situação '+desc+' — '+(v.cliente_nome||''));
};
window.cmsEditar=async function(id){
  var v=_vendas.find(function(x){return x.id===id;}); if(!v)return;
  var cr=await ask({title:'Crédito vendido',msg:'Valor do crédito efetivamente vendido (R$):',input:true,value:String(v.credito||''),ok:'Próximo'}); if(cr===null)return;
  var dt=await ask({title:'Data de inserção',msg:'AAAA-MM-DD (define competência e janela):',input:true,value:v.data_insercao,ok:'Próximo'}); if(dt===null)return;
  var o=await chooseModal('Origem','Origem válida para comissão:','Lead da Agion','Cliente próprio'); if(!o)return;
  var credito=Number(String(cr).replace(/[^\d,.-]/g,'').replace(/\./g,'').replace(',','.'))||v.credito;
  await upd(id,{credito:credito,data_insercao:String(dt).slice(0,10),origem:o==='a'?'LEAD_AGION':'CLIENTE_PROPRIO',origem_status:'VALIDADA'},'Editou venda de '+(v.cliente_nome||''));
};
window.cmsExcluir=async function(id){
  if(!isMaster())return; var v=_vendas.find(function(x){return x.id===id;}); if(!v)return;
  if(!(await ask({title:'Excluir venda?',msg:'Remove a venda de '+(v.cliente_nome||'')+' da aba Comissões (a carta continua).',ok:'Excluir'})))return;
  try{ await supa.from('comissoes_vendas').delete().eq('id',id); logEvt('comissao','comissoes','Excluiu venda de '+(v.cliente_nome||''),{id:id}); }catch(e){}
  await load(); render();
};
window.cmsSetComp=function(k){ _compSel=k; render(); };
window.cmsVerFunc=function(id){ _funcSel=id; render(); };

/* ===================== REGISTRAR VENDA ===================== */
window.cmsNovaVenda=async function(pre){
  if(typeof roGuard==='function'&&roGuard())return;
  pre=pre||{};
  var clis=(typeof visibleClients==='function'?visibleClients():(db.clients||[])).slice().sort(function(a,b){return (a.nome||'').localeCompare(b.nome||'');});
  if(!clis.length){ flash('Nenhum cliente cadastrado ainda.'); return; }
  // valores pré-definidos: carta HS (valor) e lead do CRM (valor)
  var cartasAll=[]; try{ var rc=await supa.from('cartas').select('id,cliente_id,administradora,grupo,cota,valor'); cartasAll=(rc.data||[]).filter(function(x){return /hs/i.test(x.administradora||'');}); }catch(e){}
  function leadDe(c){ var n=String(c.nome||'').trim().toLowerCase(); return (db.crm||[]).filter(function(l){return String(l.nome||'').trim().toLowerCase()===n;}).sort(function(x,y){return (y.stage||0)-(x.stage||0);})[0]||null; }
  function info(c){ var ks=cartasAll.filter(function(x){return x.cliente_id===c.id;}); var l=leadDe(c); var val=(ks.find(function(x){return x.valor;})||{}).valor||(l&&l.valor)||0; var orig=(l&&/^Origem:/.test(l.obs||''))?'LEAD_AGION':''; return {cartas:ks,lead:l,valor:val,origem:orig,fonte:ks.some(function(x){return x.valor;})?'carta':(l&&l.valor?'CRM':'')}; }
  var bx='width:100%;background:var(--card2);border:1px solid var(--line);color:var(--head);padding:10px 12px;border-radius:10px;font:inherit';
  var fld=function(lb,inner){ return '<label style="display:block;margin-bottom:12px"><span style="display:block;font-size:.78rem;color:var(--muted);margin-bottom:5px">'+lb+'</span>'+inner+'</label>'; };
  var opts=clis.map(function(c){ var i=info(c); return '<option value="'+c.id+'" data-valor="'+(i.valor||'')+'" data-origem="'+i.origem+'" data-fonte="'+i.fonte+'"'+(pre.cliente_id===c.id?' selected':'')+'>'+esc(c.nome||'')+(i.valor?' — '+BRL(i.valor)+' ('+i.fonte+')':'')+'</option>'; }).join('');
  var vendOpts=''; if(isMaster()){ var vs=(db.accounts||[]).filter(function(a){return a.real!==false&&(a.role==='master'||a.role==='lider'||a.role==='especialista')&&a.ativo!==false;}); vendOpts=vs.map(function(a){return '<option value="'+a.id+'">'+esc(a.nome||'')+'</option>';}).join(''); }
  var out=await new Promise(function(res){
    var bg=document.createElement('div'); bg.id='cmsSel'; bg.style.cssText='position:fixed;inset:0;z-index:210;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px';
    bg.innerHTML='<div style="background:var(--card);border:1px solid var(--line);border-radius:16px;max-width:460px;width:100%;max-height:90vh;overflow:auto;padding:22px"><h2 style="margin:0 0 14px;font-size:1.05rem">Registrar venda</h2>'
      +fld('Cliente','<select id="cmsCli" style="'+bx+'">'+opts+'</select>')
      +fld('Carta (HS)','<select id="cmsCarta" style="'+bx+'"></select>')
      +fld('Crédito vendido (R$) <span id="cmsHint" class="note"></span>','<div style="display:flex;gap:8px"><input id="cmsCred" inputmode="decimal" placeholder="Ex.: 800000" style="'+bx+'"><button class="btn btn-ghost btn-sm" id="cmsUsar" type="button" title="Usar o valor pré-definido">Usar pré-definido</button></div>')
      +fld('Data da venda (inserção na HS)','<input id="cmsData" type="date" value="'+(pre.data||iso(new Date()))+'" style="'+bx+'">')
      +fld('Origem do cliente','<select id="cmsOrig" style="'+bx+'"><option value="LEAD_AGION">Lead da Agion — comissão pelo cluster</option><option value="CLIENTE_PROPRIO">Cliente próprio — 1% pré + 1% na contemplação'+(isMaster()?'':' (valida o Master)')+'</option></select>')
      +(isMaster()?fld('Vendedor','<select id="cmsVend" style="'+bx+'">'+vendOpts+'</select>'):'')
      +'<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px"><button class="btn btn-ghost btn-sm" id="cmsCancel">Cancelar</button><button class="btn btn-gold btn-sm" id="cmsOk">Registrar</button></div></div>';
    document.body.appendChild(bg);
    var $=function(i){return document.getElementById(i);};
    function fill(){ var o=$('cmsCli').selectedOptions[0]; var cid=o.value; var ks=cartasAll.filter(function(x){return x.cliente_id===cid;});
      $('cmsCarta').innerHTML=(ks.map(function(x){return '<option value="'+x.id+'" data-valor="'+(x.valor||'')+'"'+(pre.carta_id===x.id?' selected':'')+'>Grupo '+esc(x.grupo)+' / cota '+esc(x.cota)+(x.valor?' — '+BRL(x.valor):'')+'</option>';}).join(''))+'<option value="">Sem carta vinculada</option>';
      var pv=pre.credito||o.getAttribute('data-valor')||''; $('cmsCred').value=pv?String(Math.round(+pv)):''; $('cmsHint').textContent=pv?'· pré-definido '+BRL(+pv)+' ('+(o.getAttribute('data-fonte')||'')+')':'· sem valor pré-definido';
      if(o.getAttribute('data-origem')) $('cmsOrig').value=o.getAttribute('data-origem');
      if($('cmsVend')){ var c=clis.find(function(x){return x.id===cid;}); if(c&&c.ownerId&&[].some.call($('cmsVend').options,function(op){return op.value===c.ownerId;})) $('cmsVend').value=c.ownerId; else $('cmsVend').value=meId(); } }
    fill(); $('cmsCli').onchange=fill;
    $('cmsCarta').onchange=function(){ var v=this.selectedOptions[0]&&this.selectedOptions[0].getAttribute('data-valor'); if(v) $('cmsCred').value=String(Math.round(+v)); };
    $('cmsUsar').onclick=function(){ var o=$('cmsCli').selectedOptions[0]; var v=o.getAttribute('data-valor'); if(v) $('cmsCred').value=String(Math.round(+v)); else flash('Este cliente não tem valor pré-definido.'); };
    $('cmsCancel').onclick=function(){bg.remove();res(null);};
    $('cmsOk').onclick=function(){ var r={cid:$('cmsCli').value,carta_id:$('cmsCarta').value||null,credito:Number(String($('cmsCred').value).replace(/[^\d,.-]/g,'').replace(/\./g,'').replace(',','.'))||0,data:$('cmsData').value,origem:$('cmsOrig').value,vend:$('cmsVend')?$('cmsVend').value:null}; if(!(r.credito>0)){flash('Informe o valor do crédito.');return;} if(!r.data){flash('Informe a data.');return;} bg.remove(); res(r); };
  });
  if(!out)return;
  var cli=clis.find(function(c){return c.id===out.cid;})||{};
  var carta=cartasAll.find(function(x){return x.id===out.carta_id;})||null;
  var rec={cliente_id:out.cid,cliente_nome:cli.nome||'',vendedor_id:out.vend||meId(),administradora:(carta&&carta.administradora)||'HS Consórcios',grupo:carta?carta.grupo:null,cota:carta?carta.cota:null,carta_id:carta?carta.id:null,credito:out.credito,origem:out.origem,origem_status:(out.origem==='CLIENTE_PROPRIO'&&!isMaster())?'EM_REVISAO':'VALIDADA',data_insercao:out.data,parcelas:[]};
  try{ var ins=await supa.from('comissoes_vendas').insert(rec); if(ins.error) throw ins.error; }catch(e){ await ask({title:'Não foi possível registrar',msg:String(e.message||e),ok:'Ok'}); return; }
  try{ logEvt('comissao','comissoes','Registrou venda de '+(cli.nome||'')+' — '+BRL(out.credito)+' ('+out.origem+')',{cliente_id:out.cid}); }catch(e){}
  flash('Venda registrada'+(rec.origem_status==='EM_REVISAO'?' — origem aguardando validação do Master':''));
  await load(); if(view.page==='comissoes') render();
};
// chamado pelo cartaSave após inserir cartas (host passa recs e cliente_id)
window.cmsAfterCarta=async function(recs,cid){
  try{
    var hs=(recs||[]).filter(function(x){return /hs/i.test(x.administradora||'')&&x.valor;}); if(!hs.length)return;
    var ok=await chooseModal('Registrar venda p/ comissão?','Carta HS com valor '+BRL(hs[0].valor)+' cadastrada. Registrar agora na aba Comissões?','Sim — registrar venda','Agora não');
    if(ok==='a'){ var r=await supa.from('cartas').select('id').eq('cliente_id',cid).eq('grupo',hs[0].grupo).eq('cota',hs[0].cota).limit(1); await window.cmsNovaVenda({cliente_id:cid,credito:hs[0].valor,carta_id:(r.data&&r.data[0])?r.data[0].id:null}); }
  }catch(e){}
};

/* ===================== ROTA ===================== */
window.renderComissoes=async function(C){
  if(!_compSel) _compSel=compAtual().key;
  var R=effRole();
  setTop('Comissões', isMaster()?'Gestão de comissões HS — pré, pós, funcionários e margem':'Minhas comissões HS', isMaster()?'':'<button class="btn btn-gold btn-sm" onclick="cmsNovaVenda()">+ Registrar venda</button>');
  C.innerHTML='<p class="note" style="padding:20px">Carregando comissões…</p>';
  await load();
  if(isMaster()&&!_funcSel) return paintMaster(C);
  if(isMaster()&&_funcSel){ var u=user(_funcSel); C.innerHTML=''; paintFunc(C,_funcSel,u.nome); C.insertAdjacentHTML('afterbegin','<div style="margin-bottom:12px"><button class="btn btn-ghost btn-sm" onclick="cmsVerFunc(\'\')">← Visão geral</button> <b style="margin-left:8px">'+esc(u.nome||'')+'</b></div>'); return; }
  var uid=(typeof effId==='function')?effId():meId();
  paintFunc(C,uid);
};
})();
