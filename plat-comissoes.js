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
var _vendas=[], _loaded=false, _compSel=null, _funcSel='', _tab='andamento';
var VERSAO='v14';
function eRole(){ return (typeof effRole==='function')?effRole():session.role; }
function eId(){ return (typeof effId==='function')?effId():meId(); }
function eMaster(){ return eRole()==='master'; }
function eLider(){ return eRole()==='lider'; }
function teamIds(){ try{ return eLider()&&typeof especIdsOf==='function'?especIdsOf(eId()):[]; }catch(e){ return []; } }
function vendasVisiveis(){ if(eMaster()) return _vendas; var ids=[eId()].concat(teamIds()); return _vendas.filter(function(v){return ids.indexOf(v.vendedor_id)>=0;}); }
function grupoDe(v,all){ var a=analise(v); if(a==='EM_ANALISE'||a==='RECUSADA'||v.situacao==='CANCELADA'||v.situacao==='REEMBOLSO_TOTAL') return 'outros'; if(v.pos_status&&v.pos_status!=='NAO_CONTEMPLADA') return 'pos'; var k=calc(v,all); return k.funcPend>0.005?'andamento':'pagos'; }
function tabsHtml(vendas,all){ var c={andamento:0,pagos:0,pos:0,outros:0}; vendas.forEach(function(v){c[grupoDe(v,all)]++;}); var L=[['andamento','Em andamento'],['pagos','Pagos'],['pos','Pós-contemplação'],['outros','Outros']]; return '<div class="cms-tabs">'+L.map(function(t){return '<button class="'+(_tab===t[0]?'on':'')+'" onclick="cmsSetTab(\''+t[0]+'\')">'+t[1]+'<span>'+c[t[0]]+'</span></button>';}).join('')+'</div>'; }
function tabDesc(){ return {andamento:'Vendas com parcelas ainda a pagar.',pagos:'Comissão pré concluída — aguardando contemplação.',pos:'Cotas contempladas e comissão pós-contemplação.',outros:'Em análise, recusadas, canceladas ou com reembolso total.'}[_tab]; }
window.cmsSetTab=function(t){ _tab=t; render(); };
function diasUteis(fromISO,n){ var d=parseISO(fromISO), c=0; while(c<n){ d.setDate(d.getDate()+1); if(d.getDay()!==0&&d.getDay()!==6) c++; } return iso(d); }
function analise(v){ var st=v.analise_status||'APROVADA'; if(st==='EM_ANALISE' && v.analise_prazo && v.analise_prazo<iso(new Date())) return 'APROVADA_AUTO'; return st; }
function aprovada(v){ var a=analise(v); return a==='APROVADA'||a==='APROVADA_AUTO'; }
function ativa(v){ return aprovada(v) && v.situacao!=='CANCELADA' && v.situacao!=='REEMBOLSO_TOTAL'; }
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
    var st=parc(v,i+1), passado=jan.datas[i]<iso(new Date());
    var hsS=st.hs==='RECEBIDA'?'RECEBIDA':st.hs==='NAO_RECEBIDA'?'NAO_RECEBIDA':(passado?'RECEBIDA':'PREVISTA');
    var fS=st.func==='PAGA'?'PAGA':st.func==='NAO_PAGA'?'NAO_PAGA':(passado?'PAGA':'PREVISTA');
    parcelas.push({n:i+1, data:jan.datas[i], hs:credito*HS_PARC[i], func:credito*r_i*FUNC_SHARE[i], hsStatus:hsS, funcStatus:fS, auto:!st.hs&&!st.func&&passado, dataEfetiva:st.data_efetiva||null});
    parcelas[i].agion=parcelas[i].hs-parcelas[i].func;
  }
  var ajuste = (jan.tipo==='ANTECIPACAO' && rate>rate20) ? credito*(rate-rate20)*FUNC_SHARE[0] : 0;
  var posFunc = proprio ? credito*PROPRIO_POS : 0, posHs=credito*HS_POS;
  var funcTot = parcelas.reduce(function(s,p){return s+p.func;},0)+ajuste;
  var ajustePago = v.ajuste_pago===true || (v.ajuste_pago!==false && jan.ajusteData<iso(new Date()));
  var funcPago = parcelas.filter(function(p){return p.funcStatus==='PAGA';}).reduce(function(s,p){return s+p.func;},0) + (ajustePago?ajuste:0);
  var hsRec = parcelas.filter(function(p){return p.hsStatus==='RECEBIDA';}).reduce(function(s,p){return s+p.hs;},0);
  var reemb = +v.reembolso_valor||0;
  return {comp:c, jan:jan, prod:prod, prod20:prod20, rate:rate, rate20:rate20, cluster:clusterDe(prod), credito:credito, proprio:proprio,
    hsPre:hsPre, funcPre:funcTot, agionPre:hsPre-funcTot, parcelas:parcelas, ajuste:ajuste, ajusteData:jan.ajusteData,
    posHs:posHs, posFunc:posFunc, posAgion:posHs-posFunc, ajustePago:ajustePago, funcPago:funcPago, funcPend:funcTot-funcPago, hsRec:hsRec, hsPend:hsPre-hsRec, reemb:reemb,
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
var CSS=`
.cms-wrap .kpis{grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}
.cms-wrap .kpi b{font-size:1.35rem}
.cms-wrap .kpi .note strong{font-weight:700}
.cms-bar{display:flex;gap:10px;align-items:center;margin-bottom:16px;flex-wrap:wrap}
.cms-bar select{background:var(--card2);border:1px solid var(--line);color:var(--head);padding:8px 12px;border-radius:10px;font:inherit;max-width:260px}
.cms-tbl table{white-space:nowrap}
.cms-tbl th{font-size:.68rem;letter-spacing:.06em}
.cms-tbl td,.cms-tbl th{padding:10px 12px;vertical-align:middle}
.cms-tbl td.n,.cms-tbl th.n{text-align:right}
.cms-tbl tfoot td{border-top:1px solid var(--line);font-weight:700}
.cms-tag{display:inline-block;font-size:.62rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:3px 9px;border-radius:999px;border:1px solid var(--line);color:var(--muted);background:rgba(255,255,255,.03);white-space:nowrap;line-height:1.3}
.cms-tag.ok{color:#4CAF7D;border-color:#4CAF7D66;background:rgba(76,175,125,.10)}
.cms-tag.warn{color:#E0B978;border-color:#E0B97866;background:rgba(224,185,120,.10)}
.cms-tag.bad{color:#E07A6A;border-color:#E07A6A66;background:rgba(224,122,106,.10)}
.cms-tag.gold{color:var(--gold2);border-color:var(--line-gold);background:rgba(197,160,89,.12)}
.cms-tag.teal{color:var(--teal);border-color:rgba(143,217,204,.35);background:rgba(143,217,204,.10)}
.cms-card{background:linear-gradient(165deg,var(--card2),var(--card));border:1px solid var(--line);border-radius:16px;padding:16px 18px;margin-bottom:14px}
.cms-card:hover{border-color:rgba(197,160,89,.35)}
.cms-head{display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap}
.cms-head .who{flex:1;min-width:240px}
.cms-head .who h3{margin:0 0 4px;font-size:1.02rem;color:var(--head);font-family:var(--serif)}
.cms-head .who .meta{font-size:.76rem;color:var(--soft);margin-bottom:8px}
.cms-head .who .tags{display:flex;gap:6px;flex-wrap:wrap}
.cms-head .amt{text-align:right;min-width:150px}
.cms-head .amt b{display:block;font-family:var(--serif);font-size:1.3rem;color:var(--head);line-height:1.1}
.cms-head .amt span{font-size:.74rem;color:var(--muted)}
.cms-sum{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin:14px 0 12px}
.cms-sum>div{background:rgba(0,0,0,.14);border:1px solid var(--line);border-radius:10px;padding:8px 10px;min-width:0}
.cms-sum .l{font-size:.66rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
.cms-sum .v{font-size:.95rem;color:var(--head);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cms-sum .v small{font-size:.72rem;color:var(--soft);font-weight:400}
.cms-tl{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
.cms-tl .st{background:rgba(0,0,0,.14);border:1px solid var(--line);border-radius:10px;padding:8px 10px;min-width:0}
.cms-tl .st .n{font-size:.66rem;color:var(--gold2);font-weight:700;letter-spacing:.06em}
.cms-tl .st .d{font-size:.74rem;color:var(--soft);margin-bottom:6px}
.cms-tl .st .row{display:flex;justify-content:space-between;align-items:center;gap:6px;font-size:.78rem;color:var(--head);margin-top:4px;white-space:nowrap}
.cms-tl .st .row em{font-style:normal;color:var(--muted);font-size:.68rem;width:34px}
.cms-pill{border:1px solid var(--line);background:transparent;color:var(--muted);font:inherit;font-size:.6rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:2px 7px;border-radius:999px;cursor:pointer;line-height:1.3}
.cms-pill.on{color:#4CAF7D;border-color:#4CAF7D66;background:rgba(76,175,125,.12)}
.cms-pill.bad{color:#E07A6A;border-color:#E07A6A66;background:rgba(224,122,106,.12)}
.cms-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 16px}
.cms-tabs button{background:rgba(255,255,255,.03);border:1px solid var(--line);color:var(--muted);font:inherit;font-size:.8rem;font-weight:600;padding:8px 14px;border-radius:999px;cursor:pointer}
.cms-tabs button.on{color:var(--teal-ink,#0B3A33);background:var(--grad-gold);border-color:transparent}
.cms-tabs button span{opacity:.75;font-weight:500;margin-left:4px}
.cms-pill.ro{cursor:default}
.cms-foot{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;justify-content:flex-end}
.cms-pos{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:10px;font-size:.8rem;color:var(--head)}
.cms-pos .l{font-size:.66rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
.cms-kts{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:18px}
.cms-kt{background:linear-gradient(165deg,var(--card2),var(--card));border:1px solid var(--line);border-radius:16px;padding:16px 18px;cursor:pointer;transition:border-color .15s,transform .15s}
.cms-kt:hover{transform:translateY(-2px);border-color:rgba(197,160,89,.4)}
.cms-kt.on{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold) inset}
.cms-kt .t{font-size:.72rem;color:var(--muted);margin-bottom:6px}
.cms-kt .v{font-family:var(--serif);font-size:1.45rem;color:var(--head);line-height:1.1;margin-bottom:10px}
.cms-kt.grad .v{background:var(--grad-hero);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.cms-kt ul{list-style:none;margin:0;padding:8px 0 0;border-top:1px solid var(--line)}
.cms-kt li{display:flex;justify-content:space-between;gap:8px;font-size:.76rem;color:var(--soft);padding:3px 0;white-space:nowrap}
.cms-kt li b{color:var(--head);font-weight:600}
.cms-org tr.cms-grp{cursor:pointer}
.cms-org tr.cms-grp:hover td{background:rgba(197,160,89,.1)}
.cms-org .cms-caret{display:inline-block;width:16px;color:var(--gold2)}
/* --- Agenda de pagamentos: dia > funcionário (acordeão) > clientes --- */
.cms-ag{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px;font-variant-numeric:tabular-nums}
.cms-ag-day{background:linear-gradient(165deg,var(--card2),var(--card));border:1px solid var(--line);border-radius:14px;padding:0;overflow:hidden;display:flex;flex-direction:column}
.cms-ag-day.soon{border-color:var(--line-gold)}
.cms-ag-dh{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:12px 16px 10px;border-bottom:1px solid var(--line-gold);background:rgba(197,160,89,.06)}
.cms-ag-dh .d{font-family:var(--serif);font-size:1.08rem;color:var(--gold2);letter-spacing:.01em;white-space:nowrap}
.cms-ag-dh .d small{font-family:inherit;font-size:.72rem;color:var(--muted);margin-left:8px;letter-spacing:.04em;text-transform:lowercase}
.cms-ag-dh .t{font-family:var(--serif);font-size:1.08rem;color:var(--head);white-space:nowrap}
.cms-ag-dh .t small{display:block;text-align:right;font-family:inherit;font-size:.64rem;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;margin-top:1px}
.cms-ag-body{padding:4px 8px 8px}
.cms-ag-f{display:grid;grid-template-columns:16px minmax(0,1fr) auto;align-items:center;gap:8px;padding:8px 8px;border-radius:9px;cursor:pointer;font-size:.82rem;color:var(--head);transition:background .12s;user-select:none}
.cms-ag-f:hover{background:rgba(197,160,89,.09)}
.cms-ag-f.open{background:rgba(255,255,255,.03)}
.cms-ag-f .c{color:var(--gold2);font-size:.72rem;text-align:center;line-height:1}
.cms-ag-f .n{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cms-ag-f .n small{font-weight:400;color:var(--muted);font-size:.7rem;margin-left:6px}
.cms-ag-f .v{font-weight:600;text-align:right;white-space:nowrap}
.cms-ag-sub{list-style:none;margin:0 0 4px;padding:2px 8px 6px 32px;border-left:1px solid var(--line-gold);margin-left:15px}
.cms-ag-sub li{display:flex;justify-content:space-between;align-items:baseline;gap:10px;font-size:.76rem;color:var(--soft);padding:4px 0;border-bottom:1px dashed rgba(255,255,255,.06)}
.cms-ag-sub li:last-child{border-bottom:0}
.cms-ag-sub li span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cms-ag-sub li span:first-child em{font-style:normal;color:var(--muted)}
.cms-ag-sub li b{font-weight:500;color:var(--head);text-align:right;white-space:nowrap}
.cms-ag-sub li.adj span:first-child em{color:var(--gold2)}
.cms-ag-more{padding:8px 16px 0;font-size:.72rem;color:var(--muted);text-align:right}
.cms-org tr.cms-grp td{background:rgba(197,160,89,.06);border-top:1px solid var(--line)}
.cms-org tr.cms-sub td{color:var(--soft);font-size:.8rem;padding-top:6px;padding-bottom:6px}
.cms-org .cms-br{color:var(--gold2);margin:0 8px 0 6px}
/* --- Fluxo HS → funcionários → Agion: gráfico empilhado + mini-stats + total --- */
.cms-fx{font-variant-numeric:tabular-nums}
.cms-fx-top{display:grid;grid-template-columns:minmax(0,1fr) 240px;gap:14px;align-items:stretch;margin-bottom:12px}
.cms-fx-chart{background:rgba(0,0,0,.14);border:1px solid var(--line);border-radius:14px;padding:14px 16px 10px;min-width:0;display:flex;flex-direction:column}
.cms-fx-lg{display:flex;align-items:center;gap:16px;font-size:.7rem;color:var(--muted);letter-spacing:.04em;margin-bottom:8px}
.cms-fx-lg span{display:inline-flex;align-items:center;gap:6px}
.cms-fx-lg i{width:10px;height:10px;border-radius:3px;display:inline-block}
.cms-fx-lg i.f{background:rgba(197,160,89,.55);border:1px solid var(--gold)}
.cms-fx-lg i.a{background:rgba(143,217,204,.65);border:1px solid var(--teal)}
.cms-fx-lg .hs{margin-left:auto;color:var(--soft)}
.cms-fx-cv{position:relative;height:220px;width:100%}
.cms-fx-cv canvas{position:absolute;inset:0;width:100%!important;height:100%!important}
.cms-fx-tot{background:linear-gradient(165deg,var(--card3),var(--card));border:1px solid var(--gold);box-shadow:0 0 0 1px rgba(197,160,89,.18) inset;border-radius:14px;padding:16px 18px;display:flex;flex-direction:column;min-width:0}
.cms-fx-tot .m{font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;color:var(--gold2);font-weight:700}
.cms-fx-tot .big{font-family:var(--serif);font-size:1.7rem;line-height:1.05;color:var(--head);margin:8px 0 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cms-fx-tot .big small{display:block;font-family:inherit;font-size:.68rem;color:var(--muted);letter-spacing:.04em;margin-top:4px}
.cms-fx-tot ul{list-style:none;margin:auto 0 0;padding:12px 0 0;border-top:1px solid var(--line-gold)}
.cms-fx-tot li{display:flex;justify-content:space-between;align-items:baseline;gap:10px;font-size:.8rem;color:var(--head);padding:4px 0;white-space:nowrap}
.cms-fx-tot li em{font-style:normal;color:var(--muted);font-size:.7rem;letter-spacing:.04em;text-transform:uppercase}
.cms-fx-tot li em b{font-weight:600;color:var(--gold2);margin-left:6px;text-transform:none;letter-spacing:0}
.cms-fx-tot li.ag{color:var(--teal);font-weight:600}
.cms-fx-stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}
.cms-fxs{background:rgba(0,0,0,.14);border:1px solid var(--line);border-radius:12px;padding:11px 14px 10px;min-width:0}
.cms-fxs .m{display:flex;justify-content:space-between;align-items:baseline;font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--gold2);font-weight:700;padding-bottom:7px;margin-bottom:6px;border-bottom:1px solid var(--line)}
.cms-fxs .m small{font-weight:500;letter-spacing:0;text-transform:none;color:var(--muted);font-size:.68rem}
.cms-fxs .r{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:.8rem;color:var(--head);padding:3px 0;white-space:nowrap}
.cms-fxs .r em{font-style:normal;color:var(--muted);font-size:.7rem;letter-spacing:.04em;text-transform:uppercase;display:inline-flex;align-items:baseline;gap:6px;min-width:0}
.cms-fxs .r em b{font-weight:600;color:var(--gold2);text-transform:none;letter-spacing:0;font-size:.72rem}
.cms-fxs .r span{text-align:right;flex:1}
.cms-fxs .r.ag{color:var(--teal);font-weight:600;border-top:1px dashed rgba(255,255,255,.07);margin-top:3px;padding-top:6px}
.cms-fxs .r.ag em{color:var(--teal);opacity:.8}
@media(max-width:1100px){.cms-fx-stats{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:900px){.cms-tl{grid-template-columns:repeat(2,1fr)}.cms-head .amt{text-align:left}.cms-fx-top{grid-template-columns:1fr}.cms-fx-tot ul{margin-top:12px}}
@media(max-width:600px){.cms-fx-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.cms-ag{grid-template-columns:1fr}}
`;
function ensureCss(){ if(document.getElementById('cmsCss'))return; var st=document.createElement('style'); st.id='cmsCss'; st.textContent=CSS; document.head.appendChild(st); }
function staffList(){ return (db.accounts||[]).filter(function(a){return a.real===true&&(a.role==='master'||a.role==='lider'||a.role==='especialista')&&a.ativo!==false;}).sort(function(a,b){return (a.nome||'').localeCompare(b.nome||'');}); }
function tag(t,cls){ return '<span class="cms-tag'+(cls?' '+cls:'')+'">'+t+'</span>'; }
function pill(on,lbl,onclick,bad){ return '<button class="cms-pill'+(on?' on':'')+(bad?' bad':'')+(onclick?'':' ro')+'"'+(onclick?' onclick="'+onclick+'"':'')+'>'+lbl+'</button>'; }
function vendaCard(v,all,master){
  master=master&&eMaster();
  var k=calc(v,all), u=user(v.vendedor_id), a=analise(v);
  var tags=origemChip(v)+anChip(v)+sitChip(v.situacao)+(v.reembolso_valor?tag('reemb. '+BRL2(v.reembolso_valor),'warn'):'');
  var meta=[master?esc((u.nome||'').split(' ').slice(0,2).join(' ')):null, esc(v.administradora||''), v.grupo?('grupo '+esc(v.grupo)+' · cota '+esc(v.cota||'')):null, 'venda '+fmtBR(v.data_insercao), 'competência '+esc(k.comp.rot), k.jan.tipo==='ANTECIPACAO'?'antecipação (dia 23)':'janela normal (dia 10)'].filter(Boolean).join(' · ');
  var head='<div class="cms-head"><div class="who"><h3>'+esc(v.cliente_nome||'—')+'</h3><div class="meta">'+meta+'</div><div class="tags">'+tags+'</div></div><div class="amt"><b>'+BRL(k.credito)+'</b><span>crédito vendido · '+pct(k.rate)+(k.ajuste?' <br>ajuste de cluster '+BRL2(k.ajuste)+' em '+fmtBR(k.ajusteData):'')+'</span></div></div>';
  var sum='<div class="cms-sum">'
    +(master?'<div><div class="l">Pré HS (2%)</div><div class="v">'+BRL2(k.hsPre)+' <small>· receb. '+BRL2(k.hsRec)+'</small></div></div>':'')
    +'<div><div class="l">'+(master?'Comissão funcionário':'Minha comissão (pré)')+'</div><div class="v">'+BRL2(k.funcPre)+' <small>· paga '+BRL2(k.funcPago)+'</small></div></div>'
    +(master?'<div><div class="l">Margem Agion (pré)</div><div class="v">'+BRL2(k.agionPre)+'</div></div>':'')
    +(k.proprio?'<div><div class="l">'+(master?'Pós · funcionário':'Futura na contemplação')+'</div><div class="v">'+BRL2(k.posFunc)+(v.pos_func_pago?' <small>· paga</small>':'')+'</div></div>':'')
    +(master?'<div><div class="l">Pós · Agion</div><div class="v">'+BRL2(k.posAgion)+'</div></div>':'')
    +'</div>';
  var tl='<div class="cms-tl">'+k.parcelas.map(function(p){ var sh=FUNC_SHARE[p.n-1];
    var hsRow=master?'<div class="row"><em>HS</em><span>'+BRL2(p.hs)+'</span>'+pill(p.hsStatus==='RECEBIDA',p.hsStatus==='RECEBIDA'?'recebida':p.hsStatus==='NAO_RECEBIDA'?'não recebida':'prevista',"cmsToggle('"+v.id+"',"+p.n+",'hs')",p.hsStatus==='NAO_RECEBIDA')+'</div>':'';
    var fRow='<div class="row"><em>'+(master?'Func':'Você')+'</em><span>'+BRL2(p.func)+'</span>'+pill(p.funcStatus==='PAGA',p.funcStatus==='PAGA'?'paga':p.funcStatus==='NAO_PAGA'?'não paga':'prevista',master?"cmsToggle('"+v.id+"',"+p.n+",'func')":null,p.funcStatus==='NAO_PAGA')+'</div>';
    return '<div class="st"><div class="n">'+p.n+'ª PARCELA · '+Math.round(sh*100)+'%</div><div class="d">'+fmtBR(p.data)+'</div>'+hsRow+fRow+'</div>'; }).join('')+'</div>';
  var pos='<div class="cms-pos"><span class="l">Pós-contemplação</span>'+tag(POS_LBL[v.pos_status]||v.pos_status, v.pos_status==='NAO_CONTEMPLADA'?'':'ok')+(v.pos_data?'<span class="note">'+fmtBR(v.pos_data)+'</span>':'')+'</div>';
  var foot=master?'<div class="cms-foot">'+(a==='EM_ANALISE'?'<button class="btn btn-gold btn-sm" onclick="cmsAprovar(\''+v.id+'\')">Aprovar / recusar</button>':'')+(v.origem_status==='EM_REVISAO'&&a!=='EM_ANALISE'?'<button class="btn btn-gold btn-sm" onclick="cmsValidar(\''+v.id+'\')">Validar origem</button>':'')+'<button class="btn btn-ghost btn-sm" onclick="cmsPos(\''+v.id+'\')">Contemplação</button><button class="btn btn-ghost btn-sm" onclick="cmsSituacao(\''+v.id+'\')">Situação</button><button class="btn btn-ghost btn-sm" onclick="cmsDesignar(\''+v.id+'\')">Designar colaborador</button><button class="btn btn-ghost btn-sm" onclick="cmsEditar(\''+v.id+'\')">Editar</button><button class="btn btn-ghost btn-sm" style="color:var(--bad)" onclick="cmsExcluir(\''+v.id+'\')">Excluir</button></div>':'';
  return '<div class="cms-card">'+head+sum+tl+pos+foot+'</div>';
}
function kpi(lab,val,grad,sub){ sub=sub?String(sub).replace(/<b>/g,'<strong style="color:var(--head)">').replace(/<\/b>/g,'</strong>'):''; return '<div class="kpi'+(grad?' grad':'')+'"><div class="lab">'+lab+'</div><b>'+val+'</b>'+(sub?'<div class="note" style="margin-top:6px">'+sub+'</div>':'')+'</div>'; }
function chip(t,cor){ var cls=cor==='#4CAF7D'?'ok':cor==='#E0B978'?'warn':(cor==='#D9534F'||cor==='#E08A5A')?'bad':cor==='#C5A059'?'gold':cor==='#7FD1C1'?'teal':''; return tag(t,cls); }
function stChip(s){ if(s==='PAGA'||s==='RECEBIDA') return chip(s==='PAGA'?'Paga':'Recebida','#4CAF7D'); return chip('Prevista'); }
function sitChip(s){ var c={EM_DIA:'#4CAF7D',INADIMPLENTE:'#E0B978',REEMBOLSO_PARCIAL:'#E08A5A',REEMBOLSO_TOTAL:'#D9534F',CANCELADA:'#D9534F'}[s]||''; return chip(SIT_LBL[s]||s,c); }
function anChip(v){ var a=analise(v); if(a==='EM_ANALISE') return chip('Em análise até '+fmtBR(v.analise_prazo),'#E0B978'); if(a==='RECUSADA') return chip('Recusada','#D9534F'); if(a==='APROVADA_AUTO') return chip('Aprovada (prazo)','#4CAF7D'); return ''; }
function origemChip(v){ if(v.origem_status==='EM_REVISAO') return chip('Em validação','#E0B978'); return v.origem==='CLIENTE_PROPRIO'?chip('Cliente próprio','#C5A059'):chip('Lead Agion','#7FD1C1'); }
function compSelect(){
  var cur=compAtual(), opts='';
  for(var i=0;i>-12;i--){ var c=compShift(cur.key,i); opts+='<option value="'+c.key+'"'+(c.key===_compSel?' selected':'')+'>'+c.rot+'</option>'; }
  return '<select onchange="cmsSetComp(this.value)">'+opts+'</select>';
}
function mesesRolantes(){ var out=[], d=new Date(); for(var i=0;i<5;i++){ var m=mkDate(d.getFullYear(), d.getMonth()+i, 1); out.push({key:iso(m).slice(0,7), rot:['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'][m.getMonth()]+'/'+String(m.getFullYear()).slice(2)}); } return out; }
function tabelaRolante(vendas, all, comAgion){
  var meses=mesesRolantes(), m0=meses[0].key;
  var temAtr=vendas.filter(ativa).some(function(v){ var k=calc(v,all); return k.parcelas.some(function(p){return p.funcStatus!=='PAGA'&&p.data.slice(0,7)<m0;}) || (k.ajuste&&!k.ajustePago&&k.ajusteData.slice(0,7)<m0); });
  var head='<tr><th>Cliente</th><th>Crédito</th>'+(temAtr?'<th class="n">Em atraso</th>':'')+meses.map(function(m){return '<th class="n">'+m.rot+'</th>';}).join('')+'<th class="n">Pendente</th></tr>';
  var tot={}; meses.forEach(function(m){tot[m.key]=0;}); var totAtr=0, totPend=0;
  var rows=vendas.filter(ativa).map(function(v){ var k=calc(v,all); if(k.funcPend<=0.005) return '';
    var atr=0; k.parcelas.forEach(function(p){ if(p.funcStatus!=='PAGA'&&p.data.slice(0,7)<m0) atr+=p.func; }); if(k.ajuste&&!k.ajustePago&&k.ajusteData.slice(0,7)<m0) atr+=k.ajuste; totAtr+=atr; totPend+=k.funcPend;
    var cells=meses.map(function(m){ var s=0, pend=0; k.parcelas.forEach(function(p){ if(p.data.slice(0,7)===m.key){ s+=p.func; if(p.funcStatus!=='PAGA') pend+=p.func; } }); if(k.ajuste && k.ajusteData.slice(0,7)===m.key){ s+=k.ajuste; if(!k.ajustePago) pend+=k.ajuste; } tot[m.key]+=pend; return '<td class="n">'+(s?(pend?BRL2(pend):'<span class="note">pago</span>')+(pend&&pend<s?' <span class="note">(pago '+BRL2(s-pend)+')</span>':''):'—')+'</td>'; }).join('');
    return '<tr><td>'+esc(v.cliente_nome||'—')+' '+origemChip(v)+'</td><td>'+BRL(k.credito)+'</td>'+(temAtr?'<td class="n">'+(atr?'<span style="color:#E0B978">'+BRL2(atr)+'</span>':'—')+'</td>':'')+cells+'<td class="n"><b>'+BRL2(k.funcPend)+'</b></td></tr>'; }).join('');
  var foot='<tr><td colspan="2"><b>A pagar</b></td>'+(temAtr?'<td class="n"><b>'+BRL2(totAtr)+'</b></td>':'')+meses.map(function(m){return '<td class="n"><b>'+BRL2(tot[m.key])+'</b></td>';}).join('')+'<td class="n"><b>'+BRL2(totPend)+'</b></td></tr>';
  return '<div class="tbl-scroll cms-tbl"><table><thead>'+head+'</thead><tbody>'+(rows||'<tr><td colspan="9" class="note">Nenhum pagamento pendente.</td></tr>')+'</tbody><tfoot>'+foot+'</tfoot></table></div>';
}

/* ===================== UI: FUNCIONÁRIO ===================== */
function paintFunc(C, uid, titulo){
  var R=resumoFunc(uid,_compSel,_vendas);
  var mine=_vendas.filter(function(v){return v.vendedor_id===uid;});
  var cards='<div class="kpis">'
    +kpi('Produção da competência',BRL(R.prodTot),true,'Cluster <b>'+pct(R.cluster.r)+'</b>'+(R.prox?' · falta <b>'+BRL(R.falta)+'</b> p/ '+pct(R.prox.r):' · faixa máxima')+(R.prodCl!==R.prodTot?' · válida p/ cluster <b>'+BRL(R.prodCl)+'</b>':''))
    +kpi('Comissão',BRL2(R.gerada),false,'Recebida <b>'+BRL2(R.paga)+'</b> · a receber <b>'+BRL2(R.pend)+'</b>'+(R.proximo?' · próximo <b>'+fmtBR(R.proximo.data)+'</b>':''))
    +kpi('Pós-contemplação potencial',BRL2(R.futura),false,'1% dos seus clientes próprios, ao contemplar')
    +(R.reemb?kpi('Reembolsos',BRL2(R.reemb),false,''):'')
    +'</div>';
  var sel='<div class="cms-bar">'+compSelect()+'</div>';
  var lst=mine.filter(function(v){return grupoDe(v,_vendas)===_tab;});
  var tbl='<div class="panel"><h2>Minhas vendas</h2>'+tabsHtml(mine,_vendas)+'<p class="note" style="margin-bottom:12px">'+tabDesc()+'</p>'+(lst.length?lst.map(function(v){return vendaCard(v,_vendas,false);}).join(''):'<p class="note">Nada aqui.</p>')+'</div>';
  var rol='<div class="panel"><h2>Próximos recebimentos (5 meses)</h2>'+tabelaRolante(mine,_vendas,false)+'</div>';
  var sit=mine.filter(function(v){return v.situacao!=='EM_DIA'||analise(v)==='RECUSADA'||analise(v)==='EM_ANALISE';});
  var sitHtml='<div class="panel"><h2>Situação dos clientes</h2>'+(sit.length?'<div class="tbl-scroll cms-tbl"><table><thead><tr><th>Cliente</th><th>Situação</th><th class="n">Reembolso</th><th>Obs.</th></tr></thead><tbody>'+sit.map(function(v){return '<tr><td>'+esc(v.cliente_nome||'—')+'</td><td>'+(analise(v)==='RECUSADA'||analise(v)==='EM_ANALISE'?anChip(v):sitChip(v.situacao))+'</td><td class="n">'+(v.reembolso_valor?BRL2(v.reembolso_valor):'—')+'</td><td class="note">'+esc(v.analise_obs||v.obs||'')+'</td></tr>';}).join('')+'</tbody></table></div>':'<p class="note">Todos os clientes em dia.</p>')+'</div>';
  ensureCss(); C.innerHTML='<div class="cms-wrap">'+sel+cards+tbl+(_tab==='andamento'?rol+sitHtml:'')+'</div>';
}

/* ===================== UI: MASTER ===================== */
var _periodo='comp';
window.cmsSetPeriodo=function(p){ _periodo=p; render(); };
function statsFunc(id, all, filt){
  var S={n:0,prod:0,prodCl:0,gerP:0,gerL:0,hsRec:0,funcPago:0,funcGer:0,posRec:0,posFuncPago:0};
  all.forEach(function(v){ if(v.vendedor_id!==id||!ativa(v)||(filt&&!filt(v)))return; var k=calc(v,all);
    S.n++; S.prod+=k.credito; if(elegivelCluster(v))S.prodCl+=k.credito; if(k.proprio)S.gerP+=k.hsPre; else S.gerL+=k.hsPre;
    S.hsRec+=k.hsRec; S.funcPago+=k.funcPago; S.funcGer+=k.funcPre; if(v.pos_status==='COMISSAO_POS_RECEBIDA'){S.posRec+=k.posHs; if(v.pos_func_pago)S.posFuncPago+=k.posFunc;} });
  S.ger=S.gerP+S.gerL; S.cluster=clusterDe(S.prodCl); S.prox=proxCluster(S.prodCl); S.falta=S.prox?(S.cluster.ate+1-S.prodCl):0; return S;
}
function mesesCols(meses){ return meses.map(function(m){return '<th class="n">'+m.rot+'</th>';}).join(''); }
function porMes(k,v,meses,tipo){ // tipo: 'func' | 'hs' | 'agion' -> valores pendentes por mês
  return meses.map(function(m){ var s=0; k.parcelas.forEach(function(p){ if(p.data.slice(0,7)!==m.key)return; if(tipo==='func'){ if(p.funcStatus!=='PAGA')s+=p.func; } else if(tipo==='hs'){ if(p.hsStatus!=='RECEBIDA')s+=p.hs; } else { s+=(p.hsStatus!=='RECEBIDA'?p.hs:0)-(p.funcStatus!=='PAGA'?p.func:0); } });
    if(k.ajuste&&k.ajusteData.slice(0,7)===m.key&&!k.ajustePago){ if(tipo==='func')s+=k.ajuste; if(tipo==='agion')s-=k.ajuste; } return s; });
}
function tabelaClientesHS(V, all, meses){
  var rows=[], tot=meses.map(function(){return 0;}), totP=0;
  V.forEach(function(v){ if(!ativa(v))return; var k=calc(v,all); var arr=porMes(k,v,meses,'hs'); if(!arr.some(function(x){return x>0.005;})&&k.hsPend<0.005)return; arr.forEach(function(x,i){tot[i]+=x;}); totP+=k.hsPend;
    rows.push('<tr><td>'+esc(v.cliente_nome||'—')+' <span class="note">'+(v.grupo?v.grupo+'/'+(v.cota||''):'')+' · '+esc((user(v.vendedor_id).nome||'').split(' ')[0])+'</span> '+origemChip(v)+'</td><td>'+BRL(k.credito)+'</td><td class="n">'+BRL2(k.hsPre)+'</td><td class="n">'+BRL2(k.hsRec)+'</td>'+arr.map(function(x){return '<td class="n">'+(x?BRL2(x):'—')+'</td>';}).join('')+'<td class="n"><b>'+BRL2(k.hsPend)+'</b></td></tr>'); });
  var foot='<tr><td colspan="4"><b>HS paga à Agion</b></td>'+tot.map(function(x){return '<td class="n"><b>'+BRL2(x)+'</b></td>';}).join('')+'<td class="n"><b>'+BRL2(totP)+'</b></td></tr>';
  return '<div class="tbl-scroll cms-tbl"><table><thead><tr><th>Cliente</th><th>Crédito</th><th class="n">2% gerado</th><th class="n">Já pago</th>'+mesesCols(meses)+'<th class="n">A pagar</th></tr></thead><tbody>'+(rows.join('')||'<tr><td colspan="'+(meses.length+5)+'" class="note">Nada pendente da HS.</td></tr>')+'</tbody>'+(rows.length?'<tfoot>'+foot+'</tfoot>':'')+'</table></div>';
}
/* lê uma variável CSS do tema (com fallback) e deriva rgba — para o Chart.js, que não entende var() */
function cssVar(name, fb){ try{ var v=getComputedStyle(document.documentElement).getPropertyValue(name); return (v&&v.trim())||fb; }catch(e){ return fb; } }
function rgbaOf(hex, a){ var h=String(hex).replace('#',''); if(h.length===3) h=h.split('').map(function(c){return c+c;}).join(''); if(!/^[0-9a-fA-F]{6}$/.test(h)) return hex; return 'rgba('+parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16)+','+a+')'; }
function fluxo(V, all, meses){
  var hs=meses.map(function(){return 0;}), fu=hs.slice(), ag;
  V.forEach(function(v){ if(!ativa(v))return; var k=calc(v,all); porMes(k,v,meses,'hs').forEach(function(x,i){hs[i]+=x;}); porMes(k,v,meses,'func').forEach(function(x,i){fu[i]+=x;}); });
  ag=hs.map(function(x,i){return x-fu[i];});
  var tHs=somaArr(hs), tFu=somaArr(fu), tAg=somaArr(ag), pMed=tHs?Math.round(tFu/tHs*100):0;
  var pf=function(i){ return hs[i]?Math.round(fu[i]/hs[i]*100):0; };

  /* (b) mini-stats por mês — na linha Func. o percentual fica à esquerda (junto ao rótulo) e o valor à direita */
  var stats=meses.map(function(m,i){
    return '<div class="cms-fxs"><div class="m"><span>'+esc(m.rot)+'</span>'+(hs[i]?'':'<small>sem previsão</small>')+'</div>'
      +'<div class="r"><em>HS</em><span>'+BRL(hs[i])+'</span></div>'
      +'<div class="r"><em>Func. <b>'+pf(i)+'%</b></em><span>'+BRL(fu[i])+'</span></div>'
      +'<div class="r ag"><em>Agion</em><span>'+BRL(ag[i])+'</span></div></div>';
  }).join('');

  /* (c) bloco Total destacado */
  var total='<div class="cms-fx-tot"><div class="m">Total · 5 meses</div><div class="big">'+BRL(tAg)+'<small>margem Agion prevista</small></div>'
    +'<ul><li><em>HS</em><span>'+BRL(tHs)+'</span></li>'
    +'<li><em>Func. <b>'+pMed+'% médio</b></em><span>'+BRL(tFu)+'</span></li>'
    +'<li class="ag"><em>Agion</em><span>'+BRL(tAg)+'</span></li></ul></div>';

  /* (a) gráfico Chart.js empilhado — montado após a inserção no DOM */
  var chart='<div class="cms-fx-chart"><div class="cms-fx-lg"><span><i class="f"></i>Funcionários</span><span><i class="a"></i>Agion</span><span class="hs">altura da barra = HS a receber</span></div><div class="cms-fx-cv"><canvas id="cmsFluxoChart"></canvas></div></div>';
  var labels=meses.map(function(m){return m.rot;}), dFu=fu.slice(), dAg=ag.slice(), dHs=hs.slice();
  setTimeout(function(){
    var gold=cssVar('--gold','#C5A059'), gold2=cssVar('--gold2','#E8CC8B'), teal=cssVar('--teal','#8FD9CC'), muted=cssVar('--muted','#8FA8A0'), head=cssVar('--head','#F1EFE6'), card=cssVar('--card','#103A32');
    mkChart('cmsFluxoChart',{
      type:'bar',
      data:{labels:labels, datasets:[
        {label:'Funcionários', data:dFu, backgroundColor:rgbaOf(gold,.55), hoverBackgroundColor:rgbaOf(gold2,.75), borderColor:gold, borderWidth:1, borderSkipped:false, borderRadius:3, maxBarThickness:46, stack:'fx'},
        {label:'Agion', data:dAg, backgroundColor:rgbaOf(teal,.65), hoverBackgroundColor:rgbaOf(teal,.85), borderColor:teal, borderWidth:1, borderSkipped:false, borderRadius:{topLeft:6,topRight:6}, maxBarThickness:46, stack:'fx'}
      ]},
      options:{
        responsive:true, maintainAspectRatio:false, animation:{duration:450},
        interaction:{mode:'index', intersect:false},
        layout:{padding:{top:4,right:4,left:0,bottom:0}},
        plugins:{
          legend:{display:false},
          tooltip:{
            backgroundColor:rgbaOf(card,.97), borderColor:rgbaOf(gold,.45), borderWidth:1, titleColor:gold2, bodyColor:head, footerColor:muted, padding:10, displayColors:true, boxPadding:4, usePointStyle:true,
            titleFont:{weight:'600'}, bodyFont:{size:12}, footerFont:{size:11, weight:'400'},
            callbacks:{
              label:function(c){ return ' '+c.dataset.label+': '+BRL2(c.parsed.y); },
              footer:function(items){ var i=items.length?items[0].dataIndex:0; var p=dHs[i]?Math.round(dFu[i]/dHs[i]*100):0; return 'HS: '+BRL2(dHs[i])+'  ·  '+p+'% p/ funcionários'; }
            }
          }
        },
        scales:{
          x:{stacked:true, grid:{display:false}, border:{color:rgbaOf(head,.12)}, ticks:{color:muted, font:{size:11}}},
          y:{stacked:true, beginAtZero:true, grid:{color:rgbaOf(head,.06), drawTicks:false}, border:{display:false, dash:[3,3]},
             ticks:{color:muted, font:{size:10}, maxTicksLimit:5, padding:8, callback:function(v){ return v>=1000?('R$ '+Math.round(v/1000).toLocaleString('pt-BR')+' mil'):BRL(v); }}}
        }
      }
    });
  },0);

  return '<div class="panel cms-fx"><h2>Fluxo — HS → funcionários → Agion <span class="right note">previsto nos próximos 5 meses</span></h2>'
    +'<div class="cms-fx-top">'+chart+total+'</div>'
    +'<div class="cms-fx-stats">'+stats+'</div></div>';
}
var _mtab='producao', _orgOpen={};
window.cmsSetMtab=function(t){ _mtab=t; render(); };
window.cmsOrgToggle=function(id){ _orgOpen[id]=!_orgOpen[id]; render(); };
function somaArr(a){ return a.reduce(function(x,y){return x+y;},0); }
function organograma(all, meses, tipo){
  var byF={}; all.forEach(function(v){ if(!ativa(v))return; var k=calc(v,all); var arr=porMes(k,v,meses,tipo); var tot=tipo==='func'?k.funcPend:(tipo==='agion'?(k.hsPend-k.funcPend):k.hsPend); if(!arr.some(function(x){return Math.abs(x)>0.005;})&&Math.abs(tot)<0.005)return; (byF[v.vendedor_id]=byF[v.vendedor_id]||[]).push({v:v,k:k,arr:arr,tot:tot}); });
  var ids=Object.keys(byF).sort(function(a,b){return (user(a).nome||'').localeCompare(user(b).nome||'');}); var tot=meses.map(function(){return 0;}), totAll=0;
  var body=ids.map(function(id){ var rows=byF[id]; var sub=meses.map(function(_,i){return rows.reduce(function(s,r){return s+r.arr[i];},0);}); sub.forEach(function(x,i){tot[i]+=x;}); var st=rows.reduce(function(s,r){return s+r.tot;},0); totAll+=st; var u=user(id); var open=!!_orgOpen[tipo+id];
    var head='<tr class="cms-grp" onclick="cmsOrgToggle(\''+tipo+id+'\')"><td><span class="cms-caret">'+(open?'▾':'▸')+'</span><b>'+esc(u.nome||'')+'</b> <span class="note">'+rows.length+' cliente'+(rows.length>1?'s':'')+'</span></td>'+sub.map(function(x){return '<td class="n"><b>'+(x?BRL2(x):'—')+'</b></td>';}).join('')+'<td class="n"><b>'+BRL2(st)+'</b></td></tr>';
    var kids=open?rows.map(function(r){ return '<tr class="cms-sub"><td><span class="cms-br">└</span>'+esc(r.v.cliente_nome||'—')+' <span class="note">'+(r.v.grupo?r.v.grupo+'/'+(r.v.cota||''):'')+'</span> '+origemChip(r.v)+'</td>'+r.arr.map(function(x){return '<td class="n">'+(x?BRL2(x):'—')+'</td>';}).join('')+'<td class="n">'+BRL2(r.tot)+'</td></tr>'; }).join(''):'';
    return head+kids; }).join('');
  var foot='<tr><td><b>Total</b></td>'+tot.map(function(x){return '<td class="n"><b>'+BRL2(x)+'</b></td>';}).join('')+'<td class="n"><b>'+BRL2(totAll)+'</b></td></tr>';
  return '<div class="tbl-scroll cms-tbl cms-org"><table><thead><tr><th>Funcionário / cliente</th>'+mesesCols(meses)+'<th class="n">Pendente total</th></tr></thead><tbody>'+(body||'<tr><td colspan="'+(meses.length+2)+'" class="note">Nada pendente.</td></tr>')+'</tbody>'+(body?'<tfoot>'+foot+'</tfoot>':'')+'</table></div>';
}
function agenda(V, all){ // próximos pagamentos: data -> funcionário (acordeão) -> clientes
  var byD={};
  function slot(data,id){ var d=byD[data]=byD[data]||{}; return d[id]=d[id]||{tot:0,itens:[]}; }
  V.forEach(function(v){ if(!ativa(v))return; var k=calc(v,all); var nome=v.cliente_nome||'—';
    k.parcelas.forEach(function(p){ if(p.funcStatus==='PAGA')return; var f=slot(p.data,v.vendedor_id); f.tot+=p.func; f.itens.push({txt:nome, sub:p.n+'ª parcela', val:p.func, adj:false}); });
    if(k.ajuste&&!k.ajustePago){ var f=slot(k.ajusteData,v.vendedor_id); f.tot+=k.ajuste; f.itens.push({txt:nome, sub:'ajuste de cluster', val:k.ajuste, adj:true}); } });
  var todas=Object.keys(byD).sort(), datas=todas.slice(0,12);
  if(!datas.length) return '<p class="note">Nenhum pagamento pendente.</p>';
  var DOW=['dom','seg','ter','qua','qui','sex','sáb'], hoje=iso(new Date());
  var html=datas.map(function(d){
    var fs=byD[d], ids=Object.keys(fs).sort(function(a,b){return (user(a).nome||'').localeCompare(user(b).nome||'');});
    var tot=0; ids.forEach(function(id){tot+=fs[id].tot;});
    var dt=parseISO(d), soon=d>=hoje && (dt-parseISO(hoje))/864e5<=7;
    var head='<div class="cms-ag-dh"><div class="d">'+fmtBR(d)+'<small>'+DOW[dt.getDay()]+(d<hoje?' · em atraso':'')+'</small></div><div class="t">'+BRL2(tot)+'<small>'+ids.length+' funcionário'+(ids.length>1?'s':'')+'</small></div></div>';
    var rows=ids.map(function(id){
      var f=fs[id], key='ag'+d+id, open=!!_orgOpen[key], n=f.itens.length;
      var line='<div class="cms-ag-f'+(open?' open':'')+'" data-k="'+esc(key)+'" onclick="cmsOrgToggle(\''+key.replace(/'/g,'')+'\')"><span class="c">'+(open?'▾':'▸')+'</span><span class="n">'+esc(user(id).nome||id)+'<small>'+n+(n>1?' itens':' item')+'</small></span><b class="v">'+BRL2(f.tot)+'</b></div>';
      var sub=open?'<ul class="cms-ag-sub">'+f.itens.map(function(it){ return '<li'+(it.adj?' class="adj"':'')+'><span>'+esc(it.txt)+' <em>· '+esc(it.sub)+'</em></span><b>'+BRL2(it.val)+'</b></li>'; }).join('')+'</ul>':'';
      return line+sub; }).join('');
    return '<div class="cms-ag-day'+(soon?' soon':'')+'">'+head+'<div class="cms-ag-body">'+rows+'</div></div>';
  }).join('');
  var more=todas.length>datas.length?'<div class="cms-ag-more">+ '+(todas.length-datas.length)+' data'+(todas.length-datas.length>1?'s':'')+' além das 12 exibidas</div>':'';
  return '<div class="cms-ag">'+html+'</div>'+more;
}
function cardTab(key,title,val,list,grad){ var li=(list||[]).map(function(l){return '<li><span>'+l[0]+'</span><b>'+l[1]+'</b></li>';}).join(''); return '<div class="cms-kt'+(grad?' grad':'')+(_mtab===key?' on':'')+'" onclick="cmsSetMtab(\''+key+'\')"><div class="t">'+title+'</div><div class="v">'+val+'</div>'+(li?'<ul>'+li+'</ul>':'')+'</div>'; }
function paintMaster(C){
  var all=_vendas, comp=compShift(_compSel,0), meses=mesesRolantes(), tudo=_periodo==='tudo';
  var inComp=function(v){return competencia(v.data_insercao).key===_compSel;};
  var V=tudo?all:all.filter(inComp);               // conjunto do período
  var T={prod:0,prodL:0,prodP:0,hsPre:0,hsRec:0,func:0,funcPago:0,posHs:0,posFunc:0,posRec:0,reemb:0,an:0,rev:0};
  V.forEach(function(v){ if(analise(v)==='EM_ANALISE')T.an++; if(v.origem_status==='EM_REVISAO')T.rev++; if(!ativa(v)){T.reemb+=(+v.reembolso_valor||0);return;} var k=calc(v,all);
    T.prod+=k.credito; if(v.origem==='LEAD_AGION')T.prodL+=k.credito; else T.prodP+=k.credito; T.hsPre+=k.hsPre; T.hsRec+=k.hsRec; T.func+=k.funcPre; T.funcPago+=k.funcPago; T.posHs+=k.posHs; T.posFunc+=k.posFunc; T.reemb+=k.reemb; if(v.pos_status==='COMISSAO_POS_RECEBIDA')T.posRec+=k.posHs; });
  var agion=T.hsPre-T.func, agionRec=T.hsRec-T.funcPago;
  var cards='<div class="cms-kts">'
    +cardTab('producao',tudo?'Produção total':'Produção da competência',BRL(T.prod),[['Leads Agion',BRL(T.prodL)],['Próprios',BRL(T.prodP)]],true)
    +cardTab('hs','Comissão pré · HS',BRL2(T.hsPre),tudo?[['Já pago pela HS',BRL2(T.hsRec)],['A pagar pela HS',BRL2(T.hsPre-T.hsRec)]]:[['Leads Agion',BRL2(T.prodL*HS_PRE)],['Próprios',BRL2(T.prodP*HS_PRE)]])
    +cardTab('func','Comissão dos funcionários',BRL2(T.func),tudo?[['Já pago',BRL2(T.funcPago)],['A pagar',BRL2(T.func-T.funcPago)]]:[['Pago',BRL2(T.funcPago)],['A pagar',BRL2(T.func-T.funcPago)]])
    +cardTab('agion','Margem Agion · pré',BRL2(agion),tudo?[['Já recebida',BRL2(agionRec)],['A receber',BRL2(agion-agionRec)]]:[['Realizada',BRL2(agionRec)],['A realizar',BRL2(agion-agionRec)]],true)
    +(tudo?cardTab('pos','Pós-contemplação potencial',BRL2(T.posHs),[['Funcionários (1% próprios)',BRL2(T.posFunc)],['Empresa',BRL2(T.posHs-T.posFunc)],['Já recebida',BRL2(T.posRec)]]):'')
    +cardTab('fluxo','Fluxo de recebimentos','5 meses',[['Pagar aos funcionários',BRL2(V.filter(ativa).reduce(function(s,v){return s+somaArr(porMes(calc(v,all),v,meses,'func'));},0))],['Entra para a Agion',BRL2(V.filter(ativa).reduce(function(s,v){return s+somaArr(porMes(calc(v,all),v,meses,'agion'));},0))]])
    +cardTab('vendas','Vendas',String(V.length),[['Em análise',String(T.an)],['Reembolsos',BRL2(T.reemb)]])
    +'</div>';
  var per='<div class="cms-tabs" style="margin:0"><button class="'+(!tudo?'on':'')+'" onclick="cmsSetPeriodo(\'comp\')">Competência</button><button class="'+(tudo?'on':'')+'" onclick="cmsSetPeriodo(\'tudo\')">Todo o período</button></div>';
  var sel='<div class="cms-bar">'+per+(!tudo?compSelect():'')+'<span style="flex:1"></span><button class="btn btn-gold btn-sm" onclick="cmsNovaVenda()">+ Registrar venda</button></div>';
  var ids=[]; V.forEach(function(v){ if(ids.indexOf(v.vendedor_id)<0)ids.push(v.vendedor_id); });
  var filt=tudo?null:inComp; var body='';
  if(_mtab==='producao'){
    body='<div class="panel"><h2>'+(tudo?'Produção por funcionário — todo o período':'Produção por funcionário — '+esc(comp.rot))+' <span class="right note">gerada = comissão total da empresa (2% HS)</span></h2><div class="tbl-scroll cms-tbl"><table><thead><tr><th>Funcionário</th><th class="n">Vendas</th><th class="n">Produção</th><th class="n">Leads Agion</th><th class="n">Próprios</th>'+(tudo?'':'<th class="n">Cluster</th><th class="n">Falta p/ próx.</th>')+'<th class="n">Gerada · lead</th><th class="n">Gerada · próprio</th><th class="n">Gerada · total</th><th></th></tr></thead><tbody>'
      +(ids.map(function(id){ var S=statsFunc(id,all,filt); if(!S.n)return ''; var u=user(id); var pl=0,pp=0; all.forEach(function(v){ if(v.vendedor_id!==id||!ativa(v)||(filt&&!filt(v)))return; if(v.origem==='LEAD_AGION')pl+=+v.credito; else pp+=+v.credito; });
        return '<tr><td><b>'+esc(u.nome||id)+'</b></td><td class="n">'+S.n+'</td><td class="n">'+BRL(S.prod)+'</td><td class="n">'+(pl?BRL(pl):'—')+'</td><td class="n">'+(pp?BRL(pp):'—')+'</td>'+(tudo?'':'<td class="n">'+pct(S.cluster.r)+'</td><td class="n">'+(S.prox?BRL(S.falta):'máx.')+'</td>')+'<td class="n">'+(S.gerL?BRL2(S.gerL):'—')+'</td><td class="n">'+(S.gerP?BRL2(S.gerP):'—')+'</td><td class="n"><b>'+BRL2(S.ger)+'</b></td><td><button class="btn btn-ghost btn-sm" onclick="cmsVerFunc(\''+id+'\')">Ver</button></td></tr>'; }).join('')||'<tr><td colspan="11" class="note">Nenhuma venda no período.</td></tr>')+'</tbody></table></div></div>';
  } else if(_mtab==='hs'){
    body='<div class="panel"><h2>Comissão pré da HS — por cliente <span class="right note">2% do crédito em 5 parcelas (0,75 / 0,25 / 0,25 / 0,25 / 0,50)</span></h2>'+tabelaClientesHS(V,all,meses)+'</div>';
  } else if(_mtab==='func'){
    body='<div class="panel"><h2>Pagamentos aos funcionários <span class="right note">clique no funcionário para abrir os clientes dele</span></h2>'+organograma(V,meses,'func')+'</div>'
        +'<div class="panel"><h2>Histórico por funcionário</h2><div class="tbl-scroll cms-tbl"><table><thead><tr><th>Funcionário</th><th class="n">Vendas</th><th class="n">Comissão gerada</th><th class="n">Já pago</th><th class="n">A pagar</th><th class="n">Pós já pago</th><th></th></tr></thead><tbody>'
        +(ids.map(function(id){ var S=statsFunc(id,all,filt); if(!S.n)return ''; return '<tr><td><b>'+esc(user(id).nome||'')+'</b></td><td class="n">'+S.n+'</td><td class="n">'+BRL2(S.funcGer)+'</td><td class="n">'+BRL2(S.funcPago)+'</td><td class="n"><b>'+BRL2(S.funcGer-S.funcPago)+'</b></td><td class="n">'+BRL2(S.posFuncPago)+'</td><td><button class="btn btn-ghost btn-sm" onclick="cmsVerFunc(\''+id+'\')">Ver</button></td></tr>'; }).join(''))+'</tbody></table></div></div>';
  } else if(_mtab==='agion'){
    body='<div class="panel"><h2>Margem Agion — por funcionário e cliente <span class="right note">líquido = HS − comissão do funcionário</span></h2>'+organograma(V,meses,'agion')+'</div>';
  } else if(_mtab==='pos'){
    var pr=V.filter(function(v){return ativa(v);}).sort(function(a,b){return (a.pos_status>b.pos_status)?-1:1;});
    body='<div class="panel"><h2>Pós-contemplação <span class="right note">2% do crédito ao contemplar — 1% ao funcionário só em cliente próprio</span></h2><div class="tbl-scroll cms-tbl"><table><thead><tr><th>Cliente</th><th>Funcionário</th><th>Crédito</th><th class="n">Pós · empresa</th><th class="n">Pós · funcionário</th><th>Status</th><th></th></tr></thead><tbody>'
      +(pr.map(function(v){ var k=calc(v,all); return '<tr><td>'+esc(v.cliente_nome||'—')+' '+origemChip(v)+'</td><td>'+esc((user(v.vendedor_id).nome||'').split(' ')[0])+'</td><td>'+BRL(k.credito)+'</td><td class="n">'+BRL2(k.posAgion)+'</td><td class="n">'+(k.posFunc?BRL2(k.posFunc)+(v.pos_func_pago?' <span class="note">pago</span>':''):'—')+'</td><td>'+tag(POS_LBL[v.pos_status]||v.pos_status,v.pos_status==='NAO_CONTEMPLADA'?'':'ok')+(v.pos_data?' <span class="note">'+fmtBR(v.pos_data)+'</span>':'')+'</td><td><button class="btn btn-ghost btn-sm" onclick="cmsPos(\''+v.id+'\')">Atualizar</button></td></tr>'; }).join('')||'<tr><td colspan="7" class="note">Nenhuma venda.</td></tr>')+'</tbody></table></div></div>';
  } else if(_mtab==='fluxo'){
    body=fluxo(V,all,meses)+'<div class="panel"><h2>Agenda de pagamentos aos funcionários <span class="right note">quando e quanto pagar a cada um</span></h2>'+agenda(V,all)+'</div>';
  } else {
    var lista=V.slice().sort(function(a,b){ var x=analise(a)==='EM_ANALISE'?0:1, y=analise(b)==='EM_ANALISE'?0:1; return x-y; });
    var lst=lista.filter(function(v){return grupoDe(v,all)===_tab;});
    body='<div class="panel"><h2>Vendas <span class="right note">parcelas com data passada contam como pagas — clique no status para marcar não paga / não recebida</span></h2>'+tabsHtml(lista,all)+'<p class="note" style="margin-bottom:12px">'+tabDesc()+'</p>'+(lst.length?lst.map(function(v){return vendaCard(v,all,true);}).join(''):'<p class="note">Nada aqui.</p>')+'</div>';
    var sit=V.filter(function(v){return v.situacao!=='EM_DIA';});
    body+='<div class="panel"><h2>Clientes com pendência / reembolso</h2>'+(sit.length?'<div class="tbl-scroll cms-tbl"><table><thead><tr><th>Cliente</th><th>Funcionário</th><th>Situação</th><th class="n">Reembolso</th><th>Obs.</th></tr></thead><tbody>'+sit.map(function(v){return '<tr><td>'+esc(v.cliente_nome||'—')+'</td><td>'+esc((user(v.vendedor_id).nome||'').split(' ')[0])+'</td><td>'+sitChip(v.situacao)+'</td><td class="n">'+(v.reembolso_valor?BRL2(v.reembolso_valor):'—')+'</td><td class="note">'+esc(v.obs||'')+'</td></tr>';}).join('')+'</tbody></table></div>':'<p class="note">Nenhuma pendência.</p>')+'</div>';
  }
  ensureCss(); C.innerHTML='<div class="cms-wrap">'+sel+cards+body+'</div>';
}

function paintLider(C){
  var uid=eId(), ids=teamIds();
  paintFunc(C,uid);
  if(!ids.length) return;
  var porFunc='<div class="panel"><h2>Minha equipe</h2><div class="tbl-scroll cms-tbl"><table><thead><tr><th>Especialista</th><th class="n">Vendas</th><th class="n">Produção</th><th class="n">Cluster</th><th class="n">Comissão gerada</th><th class="n">Recebida</th><th class="n">A receber</th><th class="n">Pós potencial</th><th></th></tr></thead><tbody>'
    +ids.map(function(id){ var R=resumoFunc(id,_compSel,_vendas); var u=user(id); return '<tr><td><b>'+esc(u.nome||'')+'</b></td><td class="n">'+R.n+'</td><td class="n">'+BRL(R.prodTot)+'</td><td class="n">'+pct(R.cluster.r)+'</td><td class="n">'+BRL2(R.gerada)+'</td><td class="n">'+BRL2(R.paga)+'</td><td class="n"><b>'+BRL2(R.pend)+'</b></td><td class="n">'+BRL2(R.futura)+'</td><td><button class="btn btn-ghost btn-sm" onclick="cmsVerFunc(\''+id+'\')">Ver</button></td></tr>'; }).join('')+'</tbody></table></div></div>';
  var w=C.querySelector('.cms-wrap'); if(w) w.insertAdjacentHTML('beforeend',porFunc);
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
  if(!eMaster()){flash('Apenas o Master marca recebimentos/pagamentos.');return;}
  var v=_vendas.find(function(x){return x.id===id;}); if(!v)return;
  var k=calc(v,_vendas), cur=k.parcelas[n-1];
  var ps=(v.parcelas||[]).slice(); var p=ps.find(function(x){return +x.n===n;}); if(!p){p={n:n};ps.push(p);}
  if(tipo==='hs'){ p.hs=(cur.hsStatus==='RECEBIDA')?'NAO_RECEBIDA':'RECEBIDA'; } else { p.func=(cur.funcStatus==='PAGA')?'NAO_PAGA':'PAGA'; }
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
  if(!eMaster())return; var v=_vendas.find(function(x){return x.id===id;}); if(!v)return;
  var bx='width:100%;background:var(--card2);border:1px solid var(--line);color:var(--head);padding:10px 12px;border-radius:10px;font:inherit';
  var fld=function(lb,inner){ return '<label style="display:block;margin-bottom:12px"><span style="display:block;font-size:.78rem;color:var(--muted);margin-bottom:5px">'+lb+'</span>'+inner+'</label>'; };
  var cli=(db.clients||[]).find(function(c){return c.id===v.cliente_id;})||{};
  var vs=staffList(); var dono=cli.ownerId&&vs.find(function(a){return a.id===cli.ownerId;});
  var vendOpts=vs.map(function(a){return '<option value="'+a.id+'"'+(a.id===v.vendedor_id?' selected':'')+'>'+esc(a.nome||'')+(dono&&a.id===dono.id?' — dono do cliente':'')+'</option>';}).join('');
  var out=await new Promise(function(res){
    var bg=document.createElement('div'); bg.style.cssText='position:fixed;inset:0;z-index:210;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px';
    bg.innerHTML='<div style="background:var(--card);border:1px solid var(--line);border-radius:16px;max-width:460px;width:100%;max-height:90vh;overflow:auto;padding:22px"><h2 style="margin:0 0 4px;font-size:1.05rem">Editar venda</h2><p class="note" style="margin-bottom:14px">'+esc(v.cliente_nome||'')+(v.grupo?' · grupo '+esc(v.grupo)+' / cota '+esc(v.cota||''):'')+'</p>'
      +fld('Colaborador que recebe a comissão','<select id="edVend" style="'+bx+'">'+vendOpts+'</select>')
      +fld('Crédito vendido (R$)','<input id="edCred" inputmode="decimal" value="'+String(Math.round(+v.credito||0))+'" style="'+bx+'">')
      +fld('Data da venda (inserção na HS)','<input id="edData" type="date" value="'+String(v.data_insercao||'').slice(0,10)+'" style="'+bx+'">')
      +fld('Origem do cliente','<select id="edOrig" style="'+bx+'"><option value="LEAD_AGION"'+(v.origem==='LEAD_AGION'?' selected':'')+'>Lead da Agion — comissão pelo cluster</option><option value="CLIENTE_PROPRIO"'+(v.origem==='CLIENTE_PROPRIO'?' selected':'')+'>Cliente próprio — 1% pré + 1% na contemplação</option></select>')
      +'<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px"><button class="btn btn-ghost btn-sm" id="edC">Cancelar</button><button class="btn btn-gold btn-sm" id="edOk">Salvar</button></div></div>';
    document.body.appendChild(bg);
    document.getElementById('edC').onclick=function(){bg.remove();res(null);};
    document.getElementById('edOk').onclick=function(){ var r={vend:document.getElementById('edVend').value,credito:Number(String(document.getElementById('edCred').value).replace(/[^\d,.-]/g,'').replace(/\./g,'').replace(',','.'))||0,data:document.getElementById('edData').value,origem:document.getElementById('edOrig').value}; if(!(r.credito>0)){flash('Informe o valor do crédito.');return;} if(!r.data){flash('Informe a data.');return;} bg.remove(); res(r); };
  });
  if(!out)return;
  var patch={vendedor_id:out.vend,credito:out.credito,data_insercao:out.data,origem:out.origem,origem_status:'VALIDADA'};
  var desc='Editou venda de '+(v.cliente_nome||'')+(out.vend!==v.vendedor_id?' — designou para '+(user(out.vend).nome||''):'');
  await upd(id,patch,desc);
};
window.cmsExcluir=async function(id){
  if(!eMaster())return; var v=_vendas.find(function(x){return x.id===id;}); if(!v)return;
  if(!(await ask({title:'Excluir venda?',msg:'Remove a venda de '+(v.cliente_nome||'')+' da aba Comissões (a carta continua).',ok:'Excluir'})))return;
  try{ await supa.from('comissoes_vendas').delete().eq('id',id); logEvt('comissao','comissoes','Excluiu venda de '+(v.cliente_nome||''),{id:id}); }catch(e){}
  await load(); render();
};
window.cmsAprovar=async function(id){
  if(!eMaster())return; var v=_vendas.find(function(x){return x.id===id;}); if(!v)return;
  var o=await chooseModal('Pré-análise — '+(v.cliente_nome||''),'Registrada por '+(user(v.vendedor_id).nome||'')+' em '+fmtBR(v.criado_em)+' · crédito '+BRL(v.credito)+' · origem informada: '+(v.origem==='CLIENTE_PROPRIO'?'cliente próprio':'lead da Agion')+'.\n\nPrazo da análise: '+fmtBR(v.analise_prazo)+'.','Aprovar','Recusar');
  if(!o)return;
  var patch={analise_por:meId(),analise_em:new Date().toISOString()};
  if(o==='a'){ var og=await chooseModal('Confirmar origem','Qual a origem válida para a comissão?','Lead da Agion (cluster)','Cliente próprio (1% + 1% pós)'); if(!og)return; patch.analise_status='APROVADA'; patch.origem=og==='a'?'LEAD_AGION':'CLIENTE_PROPRIO'; patch.origem_status='VALIDADA'; }
  else { var m=await ask({title:'Motivo da recusa',msg:'O colaborador verá este motivo:',input:true,ok:'Recusar'}); if(m===null)return; patch.analise_status='RECUSADA'; patch.analise_obs=m; }
  await upd(id,patch,'Pré-análise '+patch.analise_status+' — '+(v.cliente_nome||''));
};
window.cmsDesignar=async function(id){
  if(!eMaster())return; var v=_vendas.find(function(x){return x.id===id;}); if(!v)return;
  var vs=staffList();
  var cliD=(db.clients||[]).find(function(c){return c.id===v.cliente_id;})||{};
  var pick=await new Promise(function(res){ var bg=document.createElement('div'); bg.style.cssText='position:fixed;inset:0;z-index:210;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px';
    bg.innerHTML='<div style="background:var(--card);border:1px solid var(--line);border-radius:16px;max-width:420px;width:100%;padding:22px"><h2 style="margin:0 0 12px;font-size:1.05rem">Designar comissão</h2><p class="note" style="margin-bottom:10px">Venda de '+esc(v.cliente_nome||'')+' ('+BRL(v.credito)+'). Quem recebe a comissão:</p><select id="cmsDv" style="width:100%;background:var(--card2);border:1px solid var(--line);color:var(--head);padding:10px 12px;border-radius:10px;font:inherit">'+vs.map(function(a){return '<option value="'+a.id+'"'+(a.id===v.vendedor_id?' selected':'')+'>'+esc(a.nome||'')+(cliD.ownerId===a.id?' — dono do cliente':'')+'</option>';}).join('')+'</select><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px"><button class="btn btn-ghost btn-sm" id="cmsDc">Cancelar</button><button class="btn btn-gold btn-sm" id="cmsDo">Designar</button></div></div>';
    document.body.appendChild(bg); document.getElementById('cmsDc').onclick=function(){bg.remove();res(null);}; document.getElementById('cmsDo').onclick=function(){var x=document.getElementById('cmsDv').value;bg.remove();res(x);}; });
  if(!pick||pick===v.vendedor_id)return;
  await upd(id,{vendedor_id:pick},'Designou a comissão de '+(v.cliente_nome||'')+' para '+(user(pick).nome||''));
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
  // sugestões: últimos ganhos no CRM da própria pessoa (ou de todos, p/ master) ainda não registrados
  var meu=eId(); var ja={}; _vendas.forEach(function(v){ ja[String(v.cliente_nome||'').trim().toLowerCase()]=1; if(v.cliente_id) ja[v.cliente_id]=1; });
  var ganhos=(db.crm||[]).filter(function(l){ return !l.perdido && l.stage===CRM_STAGES.length-1 && (eMaster()||l.ownerId===meu) && !ja[String(l.nome||'').trim().toLowerCase()]; }).sort(function(a,b){ return (b.criadoEm||0)-(a.criadoEm||0); }).slice(0,6);
  var sug=ganhos.map(function(l){ var c=clis.find(function(x){return String(x.nome||'').trim().toLowerCase()===String(l.nome||'').trim().toLowerCase();}); return c?'<button type="button" class="cms-pill" style="font-size:.7rem;text-transform:none;letter-spacing:0;padding:5px 10px" data-cid="'+c.id+'" data-valor="'+(l.valor||'')+'">'+esc(l.nome)+(l.valor?' · '+BRL(l.valor):'')+'</button>':''; }).join('');
  var opts=clis.map(function(c){ var i=info(c); return '<option value="'+c.id+'" data-valor="'+(i.valor||'')+'" data-origem="'+i.origem+'" data-fonte="'+i.fonte+'"'+(pre.cliente_id===c.id?' selected':'')+'>'+esc(c.nome||'')+(i.valor?' — '+BRL(i.valor)+' ('+i.fonte+')':'')+'</option>'; }).join('');
  var vendOpts=''; if(eMaster()){ var vs=staffList(); vendOpts=vs.map(function(a){return '<option value="'+a.id+'">'+esc(a.nome||'')+'</option>';}).join(''); }
  var out=await new Promise(function(res){
    var bg=document.createElement('div'); bg.id='cmsSel'; bg.style.cssText='position:fixed;inset:0;z-index:210;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px';
    bg.innerHTML='<div style="background:var(--card);border:1px solid var(--line);border-radius:16px;max-width:460px;width:100%;max-height:90vh;overflow:auto;padding:22px"><h2 style="margin:0 0 14px;font-size:1.05rem">Registrar venda</h2>'
      +(sug?'<div style="margin-bottom:12px"><span style="display:block;font-size:.78rem;color:var(--muted);margin-bottom:6px">Últimos ganhos no CRM</span><div id="cmsSug" style="display:flex;gap:6px;flex-wrap:wrap">'+sug+'</div></div>':'')
      +fld('Cliente','<div style="display:flex;gap:8px"><input id="cmsBusca" placeholder="🔍 Buscar cliente…" style="'+bx+';flex:1"><select id="cmsCli" style="'+bx+';flex:2">'+opts+'</select></div>')
      +fld('Carta (HS)','<select id="cmsCarta" style="'+bx+'"></select>')
      +fld('Crédito vendido (R$) <span id="cmsHint" class="note"></span>','<div style="display:flex;gap:8px"><input id="cmsCred" inputmode="decimal" placeholder="Ex.: 800000" style="'+bx+'"><button class="btn btn-ghost btn-sm" id="cmsUsar" type="button" title="Usar o valor pré-definido">Usar pré-definido</button></div>')
      +fld('Data da venda (inserção na HS)','<input id="cmsData" type="date" value="'+(pre.data||iso(new Date()))+'" style="'+bx+'">')
      +fld('Origem do cliente','<select id="cmsOrig" style="'+bx+'"><option value="LEAD_AGION">Lead da Agion — comissão pelo cluster</option><option value="CLIENTE_PROPRIO">Cliente próprio — 1% pré + 1% na contemplação'+(eMaster()?'':' (valida o Master)')+'</option></select>')
      +(eMaster()?fld('Vendedor','<select id="cmsVend" style="'+bx+'">'+vendOpts+'</select>'):'')
      +'<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px"><button class="btn btn-ghost btn-sm" id="cmsCancel">Cancelar</button><button class="btn btn-gold btn-sm" id="cmsOk">Registrar</button></div></div>';
    document.body.appendChild(bg);
    var $=function(i){return document.getElementById(i);};
    function fill(){ var o=$('cmsCli').selectedOptions[0]; var cid=o.value; var ks=cartasAll.filter(function(x){return x.cliente_id===cid;});
      $('cmsCarta').innerHTML=(ks.map(function(x){return '<option value="'+x.id+'" data-valor="'+(x.valor||'')+'"'+(pre.carta_id===x.id?' selected':'')+'>Grupo '+esc(x.grupo)+' / cota '+esc(x.cota)+(x.valor?' — '+BRL(x.valor):'')+'</option>';}).join(''))+'<option value="">Sem carta vinculada</option>';
      var pv=pre.credito||o.getAttribute('data-valor')||''; $('cmsCred').value=pv?String(Math.round(+pv)):''; $('cmsHint').textContent=pv?'· pré-definido '+BRL(+pv)+' ('+(o.getAttribute('data-fonte')||'')+')':'· sem valor pré-definido';
      if(o.getAttribute('data-origem')) $('cmsOrig').value=o.getAttribute('data-origem');
      if($('cmsVend')){ var c=clis.find(function(x){return x.id===cid;}); if(c&&c.ownerId&&[].some.call($('cmsVend').options,function(op){return op.value===c.ownerId;})) $('cmsVend').value=c.ownerId; else $('cmsVend').value=meId(); } }
    fill(); $('cmsCli').onchange=fill;
    $('cmsBusca').oninput=function(){ var q=this.value.trim().toLowerCase(); var first=null; [].forEach.call($('cmsCli').options,function(o){ var hit=!q||o.textContent.toLowerCase().indexOf(q)>=0; o.hidden=!hit; if(hit&&!first)first=o; }); if(first){ $('cmsCli').value=first.value; fill(); } };
    if($('cmsSug')) [].forEach.call($('cmsSug').querySelectorAll('button'),function(b){ b.onclick=function(){ $('cmsCli').value=b.getAttribute('data-cid'); fill(); var v=b.getAttribute('data-valor'); if(v&&!$('cmsCred').value) $('cmsCred').value=String(Math.round(+v)); [].forEach.call($('cmsSug').querySelectorAll('button'),function(x){x.classList.remove('on');}); b.classList.add('on'); }; });
    $('cmsCarta').onchange=function(){ var v=this.selectedOptions[0]&&this.selectedOptions[0].getAttribute('data-valor'); if(v) $('cmsCred').value=String(Math.round(+v)); };
    $('cmsUsar').onclick=function(){ var o=$('cmsCli').selectedOptions[0]; var v=o.getAttribute('data-valor'); if(v) $('cmsCred').value=String(Math.round(+v)); else flash('Este cliente não tem valor pré-definido.'); };
    $('cmsCancel').onclick=function(){bg.remove();res(null);};
    $('cmsOk').onclick=function(){ var r={cid:$('cmsCli').value,carta_id:$('cmsCarta').value||null,credito:Number(String($('cmsCred').value).replace(/[^\d,.-]/g,'').replace(/\./g,'').replace(',','.'))||0,data:$('cmsData').value,origem:$('cmsOrig').value,vend:$('cmsVend')?$('cmsVend').value:null}; if(!(r.credito>0)){flash('Informe o valor do crédito.');return;} if(!r.data){flash('Informe a data.');return;} bg.remove(); res(r); };
  });
  if(!out)return;
  var cli=clis.find(function(c){return c.id===out.cid;})||{};
  var carta=cartasAll.find(function(x){return x.id===out.carta_id;})||null;
  var rec={cliente_id:out.cid,cliente_nome:cli.nome||'',vendedor_id:out.vend||meId(),administradora:(carta&&carta.administradora)||'HS Consórcios',grupo:carta?carta.grupo:null,cota:carta?carta.cota:null,carta_id:carta?carta.id:null,credito:out.credito,origem:out.origem,origem_status:(out.origem==='CLIENTE_PROPRIO'&&!eMaster())?'EM_REVISAO':'VALIDADA',data_insercao:out.data,parcelas:[],analise_status:eMaster()?'APROVADA':'EM_ANALISE',analise_prazo:eMaster()?null:diasUteis(iso(new Date()),2)};
  try{ var ins=await supa.from('comissoes_vendas').insert(rec); if(ins.error) throw ins.error; }catch(e){ await ask({title:'Não foi possível registrar',msg:String(e.message||e),ok:'Ok'}); return; }
  try{ logEvt('comissao','comissoes','Registrou venda de '+(cli.nome||'')+' — '+BRL(out.credito)+' ('+out.origem+')',{cliente_id:out.cid}); }catch(e){}
  flash('Venda registrada'+(rec.analise_status==='EM_ANALISE'?' — em pré-análise até '+fmtBR(rec.analise_prazo):''));
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
  var M=eMaster(), L=eLider();
  setTop('Comissões', M?'Gestão de comissões HS':(L?'Minhas comissões e da minha equipe':'Minhas comissões HS'), (M?'':'<button class="btn btn-gold btn-sm" onclick="cmsNovaVenda()">+ Registrar venda</button>')+'<span class="note" style="margin-left:10px;opacity:.6">'+VERSAO+'</span>');
  C.innerHTML='<p class="note" style="padding:20px">Carregando comissões…</p>';
  await load();
  if(!M) _vendas=vendasVisiveis();
  if(M&&!_funcSel) return paintMaster(C);
  if((M||L)&&_funcSel){ var u=user(_funcSel); if(L&&teamIds().indexOf(_funcSel)<0){ _funcSel=''; return window.renderComissoes(C); } C.innerHTML=''; paintFunc(C,_funcSel,u.nome); C.insertAdjacentHTML('afterbegin','<div style="margin-bottom:12px"><button class="btn btn-ghost btn-sm" onclick="cmsVerFunc(\'\')">← Voltar</button> <b style="margin-left:8px">'+esc(u.nome||'')+'</b></div>'); return; }
  if(L) return paintLider(C);
  paintFunc(C,eId());
};
})();
