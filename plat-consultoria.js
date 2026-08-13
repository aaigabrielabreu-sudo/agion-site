/* =====================================================================
   AGION WEALTH — MÓDULO CONSULTORIA (gestão discricionária)
   Arquivo separado: o plataforma.html carrega via <script src>.
   Prefixo cst* para não colidir com o consórcio (consFee/consBase/consPre).
   Host: esc(), BRL(), BRL2(), mkChart(), render(), db, save(), flash()

   CADA CARTEIRA É INDEPENDENTE: a cota de um cliente é semeada pelo id dele
   e começa em 1.000 na data do primeiro aporte. Cliente novo não altera
   nenhuma carteira existente. A estratégia (meta de rentabilidade e risco)
   vem do perfil; o caminho diário é próprio de cada cliente.
   ===================================================================== */
(function(){
'use strict';

/* ------------------------- PARÂMETROS ------------------------- */
var CST_PERFIS = {
  Conservador:{meta:15.50, vol:2.4, cor:'#8FD9CC'},
  Moderado:   {meta:16.37, vol:4.2, cor:'#C5A059'},
  Arrojado:   {meta:20.03, vol:6.8, cor:'#E8CC8B'}
};
var CST_CDI = 14.15, CST_DU = 252;
var CST_FEE = [
  {ate:1000000,  taxa:1.00, rot:'Até R$ 1 milhão'},
  {ate:3000000,  taxa:0.90, rot:'R$ 1 mi a R$ 3 mi'},
  {ate:Infinity, taxa:0.70, rot:'Acima de R$ 3 mi'}
];
var CST_ATIVOS = {
  Conservador:[['CDB Liquidez Diária',34],['Tesouro Selic',22],['LCI / LCA Isento',18],['Fundo DI Institucional',14],['Crédito Privado High Grade',12]],
  Moderado:[['CDB Liquidez Diária',24],['Crédito Privado High Grade',20],['Multimercado Macro',20],['Ações Dividendos Brasil',16],['Fundo Imobiliário (FII)',12],['Renda Fixa Internacional',8]],
  Arrojado:[['Multimercado Macro',24],['Ações Brasil Long Only',22],['Ações Internacionais',18],['Fundo Imobiliário (FII)',14],['Crédito Privado High Yield',12],['Ouro / Hedge Cambial',10]]
};

/* ------------------------- MOTOR DE COTAS ------------------------- */
function _cstHash(s){var h=2166136261,i;for(i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0)/4294967295;}
function _cstUtil(d){var w=d.getDay();return w!==0&&w!==6;}
function _cstISO(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function cstHoje(){ return _cstISO(new Date()); }

var _cstCache={};
/* Série de cotas DA CARTEIRA. Semente = id do cliente, meta e vol = perfil.
   O ruído é centralizado na própria série: o acumulado entrega a meta
   pro-rata do período e a carteira nunca inverte contra a estratégia. */
function cstSerie(cart){
  var ini = cart.inicio, ck = cart.id+'|'+ini+'|'+cart.perfil+'|'+cstHoje();
  if(_cstCache[ck]) return _cstCache[ck];
  var P = CST_PERFIS[cart.perfil] || CST_PERFIS.Conservador;
  var sd = (P.vol/100)/Math.sqrt(CST_DU);
  var rd = Math.pow(1+P.meta/100, 1/CST_DU)-1 + (sd*sd)/2;
  var d = new Date(ini+'T12:00:00'), fim = new Date(); fim.setHours(12,0,0,0);
  var dias=[], guarda=0;
  while(d<=fim && guarda++<6000){ if(_cstUtil(d)) dias.push(_cstISO(d)); d.setDate(d.getDate()+1); }
  if(!dias.length) dias=[ini];
  var zs = dias.map(function(iso){ return (_cstHash(cart.id+'|'+iso)-0.5)*3.4641; });
  var med = zs.reduce(function(a,b){return a+b;},0)/Math.max(1,zs.length);
  var out=[{data:dias[0],cota:1000}], cota=1000, i;
  for(i=1;i<dias.length;i++){ cota = cota*(1+rd+(zs[i]-med)*sd); out.push({data:dias[i],cota:cota}); }
  _cstCache[ck]=out; return out;
}
function cstLimpaCache(){ _cstCache={}; }
function cstCotaEm(serie,data){var c=serie[0].cota,i;for(i=0;i<serie.length;i++){if(serie[i].data<=data)c=serie[i].cota;else break;}return c;}

function cstPosicao(cart){
  var serie=cstSerie(cart), cotas=0, ap=0, rg=0, ext=[];
  (cart.movimentos||[]).slice().sort(function(a,b){return a.data<b.data?-1:1;}).forEach(function(m){
    var c=cstCotaEm(serie,m.data), v=+m.valor||0, q=v/c;
    if(m.tipo==='resgate'){cotas-=q; rg+=v;} else {cotas+=q; ap+=v;}
    ext.push({data:m.data,tipo:m.tipo,valor:v,cota:c,cotas:q,obs:m.obs||'',saldo:cotas});
  });
  var ch=serie[serie.length-1].cota, pat=cotas*ch;
  return {cotas:cotas, cotaHoje:ch, patrimonio:pat, aportado:ap, resgatado:rg,
          lucro:pat-(ap-rg), investido:ap-rg, extrato:ext.slice().reverse()};
}
function cstMetricas(cart){
  var s=cstSerie(cart);
  if(s.length<2) return {acum:0,ano:0,vol:0,sharpe:0,ddMax:0,dias:s.length,mes:0};
  var r=[],i; for(i=1;i<s.length;i++) r.push(s[i].cota/s[i-1].cota-1);
  var acum=s[s.length-1].cota/s[0].cota-1;
  var anos=s.length/CST_DU, ano=anos>0?(Math.pow(1+acum,1/anos)-1):0;
  var m=r.reduce(function(a,b){return a+b;},0)/r.length;
  var vol=Math.sqrt(r.reduce(function(a,b){return a+(b-m)*(b-m);},0)/Math.max(1,r.length-1))*Math.sqrt(CST_DU);
  var sharpe=vol>0?(ano-CST_CDI/100)/vol:0;
  var pk=-Infinity, dd=0;
  s.forEach(function(x){ if(x.cota>pk)pk=x.cota; var q=x.cota/pk-1; if(q<dd)dd=q; });
  var i30=s.length>21?s[s.length-22].cota:s[0].cota;
  return {acum:acum*100, ano:ano*100, vol:vol*100, sharpe:sharpe, ddMax:dd*100,
          dias:s.length, mes:(s[s.length-1].cota/i30-1)*100};
}
function cstFee(pat){
  var p=Math.max(0,+pat||0);
  var f=CST_FEE.filter(function(x){return p<=x.ate;})[0]||CST_FEE[CST_FEE.length-1];
  var a=p*(f.taxa/100);
  return {taxa:f.taxa, faixa:f.rot, anual:a, mensal:a/12};
}
/* patrimônio da casa dia a dia — soma das carteiras, cada uma na sua cota */
function cstSerieCustodia(){
  var carts=cstCarteiras(); if(!carts.length) return [];
  var mapa={}, minD=null;
  carts.forEach(function(c){
    var s=cstSerie(c), movs=(c.movimentos||[]).slice().sort(function(a,b){return a.data<b.data?-1:1;});
    var k=0, cotas=0;
    if(!minD || s[0].data<minD) minD=s[0].data;
    s.forEach(function(pt){
      while(k<movs.length && movs[k].data<=pt.data){
        var q=(+movs[k].valor||0)/cstCotaEm(s,movs[k].data);
        cotas += (movs[k].tipo==='resgate' ? -q : q); k++;
      }
      mapa[pt.data]=(mapa[pt.data]||0)+cotas*pt.cota;
    });
  });
  return Object.keys(mapa).sort().map(function(d){ return {data:d, valor:mapa[d]}; });
}

/* ------------------------- CARTEIRAS -------------------------
   Base inicial no CST_RAW (id|Nome|Perfil|t:valor:data;...) +
   as carteiras cadastradas pela tela, guardadas em db.consultoria. */
var CST_RAW = "cd01|Ricardo Salgado Vieira|Conservador|i:880000:2026-06-08\ncd02|Helena Marchetti Prado|Moderado|i:880000:2026-06-25\ncd03|Otávio Bernardes Lima|Arrojado|i:880000:2026-07-14\ncd04|Camila Fontoura Rezende|Conservador|i:880000:2026-05-06\ncd05|Eduardo Tannure Nogueira|Moderado|i:880000:2026-06-10\ncd06|Patrícia Vasconcelos Amaral|Arrojado|i:880000:2026-07-20\ncd07|Leonardo Bittencourt Sá|Conservador|i:6461000:2026-07-30\ncd08|Juliana Weber Krieger|Moderado|i:957000:2026-02-05;a:270000:2026-05-26\ncd09|Marcelo Andrade Pontes|Arrojado|i:939000:2026-03-26\ncd10|Renata Colombo Bianchi|Conservador|i:3682000:2025-12-08;a:1038000:2026-05-01\ncd11|Fernando Queiroz Malta|Moderado|i:983000:2026-03-16\ncd12|Beatriz Sampaio Duarte|Arrojado|i:880000:2026-05-27\ncd13|Augusto Vilella Caminha|Conservador|i:880000:2026-07-16\ncd14|Larissa Toledo Bandeira|Moderado|i:3563000:2025-12-18;a:1005000:2026-05-05\ncd15|Rodrigo Menescal Aguiar|Arrojado|i:3415000:2025-12-30;a:963000:2026-05-10\ncd16|Cristina Vasques Portela|Conservador|i:880000:2026-07-27\ncd17|Thiago Rennó Cavalcanti|Moderado|i:839000:2026-03-03;a:236000:2026-06-06\ncd18|Vanessa Klein Sobral|Arrojado|i:880000:2026-06-21\ncd19|Gustavo Peçanha Motta|Conservador|i:880000:2026-05-16\ncd20|Adriana Rocha Bulhões|Moderado|i:880000:2026-08-03\ncd21|Henrique Vasconcelos Tourinho|Arrojado|i:880000:2026-05-04\ncd22|Mariana Stein Guedes|Conservador|i:880000:2026-05-12\ncd23|Paulo Cesar Meireles Fagundes|Moderado|i:880000:2026-06-20\ncd24|Luciana Braga Werneck|Arrojado|i:6732000:2025-11-26;a:1899000:2026-04-26;r:690000:2026-06-09\ncd25|Felipe Adorno Vilhena|Conservador|i:880000:2026-07-25\ncd26|Simone Kraemer Dutra|Moderado|i:880000:2026-07-25\ncd27|André Luiz Corrêa Belmonte|Arrojado|i:835000:2026-02-28;a:235000:2026-06-04\ncd28|Tatiana Ferraz Bonfim|Conservador|i:1113000:2026-01-06;a:314000:2026-05-13\ncd29|Rafael Monteiro Estrella|Moderado|i:3457000:2025-12-26;a:975000:2026-05-08\ncd30|Cláudia Reinehr Vasques|Arrojado|i:880000:2026-05-14\ncd31|Sérgio Bandeira Machado|Conservador|i:930000:2026-03-28\ncd32|Isabela Franco Loureiro|Moderado|i:3705000:2025-12-07;a:1045000:2026-04-30;r:380000:2026-06-12\ncd33|Vinícius Sarmento Pires|Arrojado|i:3995000:2025-11-14;a:1127000:2026-04-21;r:410000:2026-06-06\ncd34|Fabiana Loureiro Mendonça|Conservador|i:880000:2026-05-20\ncd35|Alexandre Pimentel Vidal|Moderado|i:880000:2026-06-26\ncd36|Roberta Castilho Nunes|Arrojado|i:1029000:2026-01-21;a:290000:2026-05-19\ncd37|Bruno Cavalheiro Assis|Conservador|i:874000:2026-02-18;a:246000:2026-05-31\ncd38|Daniela Ostermann Freire|Moderado|i:898000:2026-02-18;a:253000:2026-05-31\ncd39|Guilherme Mattoso Serpa|Arrojado|i:880000:2026-05-22\ncd40|Priscila Vidigal Rangel|Conservador|i:880000:2026-04-18\ncd41|Antônio Emílio Barcelos|Moderado|i:1083000:2026-01-06;a:305000:2026-05-13\ncd42|Verônica Sanches Bastos|Arrojado|i:6112000:2026-02-25;a:1724000:2026-06-03\ncd43|Márcio Aurélio Tavares|Conservador|i:880000:2026-07-11\ncd44|Sandra Fischer Lacerda|Moderado|i:1042000:2026-01-14;a:294000:2026-05-16\ncd45|Diego Malheiros Antunes|Arrojado|i:3455000:2025-12-26;a:974000:2026-05-08\ncd46|Elaine Barroso Villaça|Conservador|i:899000:2026-02-13;a:254000:2026-05-29\ncd47|Rogério Sant’Anna Peixoto|Moderado|i:1124000:2026-01-04;a:317000:2026-05-12\ncd48|Carolina Pilar Medeiros|Arrojado|i:880000:2026-07-14\ncd49|Everton Grisa Sanhudo|Conservador|i:880000:2026-05-25\ncd50|Michele Arantes Coelho|Moderado|i:880000:2026-07-28\ncd51|Wagner Nobre Trindade|Arrojado|i:3830000:2025-11-27;a:1080000:2026-04-26;r:393000:2026-06-09\ncd52|Aline Zimmer Carvalhaes|Conservador|i:880000:2026-06-17\ncd53|Maurício Guimarães Setúbal|Moderado|i:3666000:2025-12-10;a:1034000:2026-05-02\ncd54|Débora Falcão Ribas|Arrojado|i:822000:2026-03-02;a:232000:2026-06-05\ncd55|José Ricardo Assunção|Conservador|i:3934000:2025-11-19;a:1110000:2026-04-23;r:404000:2026-06-07\ncd56|Silvia Munhoz Almeida|Moderado|i:3400000:2025-12-31;a:959000:2026-05-10\ncd57|Caio Bertolucci Ramires|Arrojado|i:1034000:2026-01-16;a:291000:2026-05-17\ncd58|Natália Wolff Siqueira|Conservador|i:880000:2026-08-06\ncd59|Emerson Padilha Castro|Moderado|i:880000:2026-07-31\ncd60|Gabriela Fontes Barreiros|Arrojado|i:895000:2026-04-04\ncd61|Nelson Aquino Villar|Conservador|i:880000:2026-04-19\ncd62|Raquel Bonini Delgado|Moderado|i:880000:2026-05-14\ncd63|Ivan Schuback Fialho|Arrojado|i:922000:2026-04-03\ncd64|Letícia Aranha Pontual|Conservador|i:3487000:2025-12-24;a:984000:2026-05-08\ncd65|Osvaldo Ferrari Junqueira|Moderado|i:880000:2026-07-02";
var _cstBase=null;
function _cstParseRaw(){
  if(_cstBase) return _cstBase;
  _cstBase = CST_RAW.split('\n').filter(Boolean).map(function(l){
    var p=l.split('|');
    var movs=p[3].split(';').map(function(m){
      var q=m.split(':');
      return {tipo:q[0]==='r'?'resgate':'aporte', valor:+q[1], data:q[2],
              obs:q[0]==='r'?'Resgate parcial':(q[0]==='i'?'Aporte inicial':'Aporte adicional')};
    });
    return {id:p[0], nome:p[1], perfil:p[2], inicio:movs[0].data, movimentos:movs};
  });
  return _cstBase;
}
function cstStore(){
  try{
    if(typeof db==='undefined' || !db) return {carteiras:[], removidos:[]};
    if(!db.consultoria) db.consultoria={carteiras:[], removidos:[]};
    if(!db.consultoria.carteiras) db.consultoria.carteiras=[];
    if(!db.consultoria.removidos) db.consultoria.removidos=[];
    return db.consultoria;
  }catch(e){ return {carteiras:[], removidos:[]}; }
}
function cstSalvar(){
  try{ if(typeof save==='function') save(); }catch(e){}
  cstLimpaCache();
}
function cstCarteiras(){
  var st=cstStore();
  var base=_cstParseRaw().filter(function(c){ return st.removidos.indexOf(c.id)<0; });
  return base.concat(st.carteiras||[]);
}
function cstPorId(id){ return cstCarteiras().filter(function(c){return c.id===id;})[0]; }
function cstEhCadastrada(id){ return (cstStore().carteiras||[]).some(function(c){return c.id===id;}); }

/* ------------------------- ESTADO ------------------------- */
var cstView = {modo:'geral', id:null, busca:'', perfil:'', ord:'pat'};
function cstIr(modo,id){ cstView.modo=modo; cstView.id=id||null; if(typeof render==='function') render(); window.scrollTo(0,0); }
function cstAbrir(id){ cstIr('cliente',id); }
function cstVoltar(){ cstIr('geral'); }
function cstNovo(){ cstIr('novo'); }
function cstSetBusca(v){ cstView.busca=v; cstListaHTML(); }
function cstSetPerfil(v){ cstView.perfil=v; cstListaHTML(); }
function cstSetOrd(v){ cstView.ord=v; cstListaHTML(); }

/* ------------------------- FORMATO ------------------------- */
function _nb(v,d){ return (+v||0).toFixed(d===undefined?2:d).replace('.',','); }
function _pc(v,d){ var n=(+v||0); return (n>0?'+':'')+_nb(n,d)+'%'; }
function _cls(v){ return (+v||0)>=0 ? 'cst-up' : 'cst-dn'; }
function _dt(iso){ if(!iso) return '—'; var p=String(iso).split('-'); return p[2]+'/'+p[1]+'/'+p[0]; }
function _mi(v){ v=+v||0; return v>=1e6 ? 'R$ '+(v/1e6).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+' mi'
                        : v>=1e3 ? 'R$ '+(v/1e3).toLocaleString('pt-BR',{maximumFractionDigits:0})+' mil' : BRL(v); }
function _ini(n){ var p=String(n||'').trim().split(/\s+/); return ((p[0]||'')[0]||'')+((p[p.length-1]||'')[0]||''); }
function _num(v){ var s=String(v==null?'':v).replace(/[^\d,.-]/g,'').replace(/\./g,'').replace(',','.'); var n=parseFloat(s); return isFinite(n)?n:0; }

/* ------------------------- CSS ------------------------- */
function cstCSS(){
  if(document.getElementById('cstCSS')) return;
  var st=document.createElement('style'); st.id='cstCSS';
  st.textContent=[
  '.cst-wrap{display:flex;flex-direction:column;gap:16px}',
  '.cst-head{display:flex;align-items:center;gap:12px;flex-wrap:wrap}',
  '.cst-head h2{margin:0;font-size:23px;letter-spacing:.2px}',
  '.cst-sub{color:var(--muted,#9DB5B1);font-size:13px;margin:0}',
  '.cst-btn{background:#C5A059;color:#08201C;border:0;border-radius:11px;padding:10px 17px;font:inherit;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap}',
  '.cst-btn:hover{filter:brightness(1.08)}',
  '.cst-btn.gh{background:none;border:1.5px solid rgba(197,160,89,.5);color:#C5A059}',
  '.cst-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(168px,1fr));gap:12px}',
  '.cst-kpi{background:var(--card,#0f2b27);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:15px 16px;min-width:0}',
  '.cst-kpi .l{font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:var(--muted,#9DB5B1);margin-bottom:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.cst-kpi .v{font-size:23px;font-weight:700;line-height:1.15;letter-spacing:-.4px}',
  '.cst-kpi .d{font-size:12px;color:var(--muted,#9DB5B1);margin-top:5px}',
  '.cst-kpi.gold .v{color:#C5A059}',
  '.cst-grid2{display:grid;grid-template-columns:1.35fr 1fr;gap:14px}',
  '.cst-card{background:var(--card,#0f2b27);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:16px;min-width:0}',
  '.cst-card h3{margin:0 0 3px;font-size:15px;font-weight:600}',
  '.cst-card .hint{margin:0 0 12px;font-size:12px;color:var(--muted,#9DB5B1)}',
  '.cst-chart{position:relative;height:250px}',
  '.cst-perfis{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px}',
  '.cst-perfil{background:var(--card,#0f2b27);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:16px;border-top:3px solid var(--pc,#C5A059)}',
  '.cst-perfil .nm{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px}',
  '.cst-perfil .nm b{font-size:15px}.cst-perfil .nm span{font-size:12px;color:var(--muted,#9DB5B1)}',
  '.cst-perfil .big{font-size:26px;font-weight:700;color:var(--pc,#C5A059);line-height:1;letter-spacing:-.5px}',
  '.cst-perfil .big small{font-size:12px;font-weight:500;color:var(--muted,#9DB5B1);display:block;margin-top:5px;letter-spacing:0}',
  '.cst-mini{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,.07)}',
  '.cst-mini div{font-size:12px;color:var(--muted,#9DB5B1)}',
  '.cst-mini b{display:block;color:var(--txt,#EAF3F1);font-size:14px;margin-top:2px;font-weight:600}',
  '.cst-tb{width:100%;border-collapse:collapse;font-size:13px}',
  '.cst-tb th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--muted,#9DB5B1);font-weight:600;padding:9px 10px;border-bottom:1px solid rgba(255,255,255,.09);white-space:nowrap}',
  '.cst-tb td{padding:11px 10px;border-bottom:1px solid rgba(255,255,255,.05)}',
  '.cst-tb tbody tr.cl{cursor:pointer;transition:background .15s}',
  '.cst-tb tbody tr.cl:hover{background:rgba(197,160,89,.07)}',
  '.cst-tb .num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}',
  '.cst-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}',
  '.cst-cli{display:flex;align-items:center;gap:10px;min-width:0}',
  '.cst-av{width:34px;height:34px;border-radius:50%;flex:0 0 34px;display:grid;place-items:center;font-size:12px;font-weight:700;color:#08201C;background:var(--pc,#C5A059)}',
  '.cst-cli b{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}',
  '.cst-cli i{font-style:normal;font-size:11px;color:var(--muted,#9DB5B1)}',
  '.cst-chip{display:inline-block;font-size:11px;font-weight:600;padding:3px 9px;border-radius:999px;white-space:nowrap;background:rgba(255,255,255,.06);border:1px solid var(--pc,#C5A059);color:var(--pc,#C5A059)}',
  '.cst-up{color:#5FD6A6}.cst-dn{color:#E88B8B}',
  '.cst-bar{height:7px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden;margin-top:6px}',
  '.cst-bar>i{display:block;height:100%;border-radius:99px;background:var(--pc,#C5A059)}',
  '.cst-at{padding:11px 0;border-bottom:1px solid rgba(255,255,255,.05)}.cst-at:last-child{border-bottom:0}',
  '.cst-at .t{display:flex;justify-content:space-between;gap:10px;font-size:13px}',
  '.cst-at .t b{font-weight:500}.cst-at .t span{color:var(--muted,#9DB5B1);font-variant-numeric:tabular-nums}',
  '.cst-fil{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px}',
  '.cst-fil input,.cst-fil select{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);color:inherit;border-radius:10px;padding:9px 12px;font:inherit;font-size:13px;outline:none}',
  '.cst-fil input{flex:1;min-width:150px}',
  '.cst-fil input:focus,.cst-fil select:focus{border-color:#C5A059}',
  '.cst-back{background:none;border:0;color:#C5A059;font:inherit;font-size:13px;cursor:pointer;padding:0;display:inline-flex;align-items:center;gap:6px}',
  '.cst-back:hover{text-decoration:underline}',
  '.cst-form{display:grid;grid-template-columns:1fr 1fr;gap:14px;max-width:720px}',
  '.cst-f{display:flex;flex-direction:column;gap:6px;min-width:0}',
  '.cst-f.full{grid-column:1/-1}',
  '.cst-f label{font-size:12px;color:var(--muted,#9DB5B1);font-weight:600}',
  '.cst-f input,.cst-f select{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);color:inherit;border-radius:11px;padding:12px 13px;font:inherit;font-size:14px;outline:none;width:100%;box-sizing:border-box}',
  '.cst-f input:focus,.cst-f select:focus{border-color:#C5A059}',
  '.cst-f .dica{font-size:11px;color:var(--muted,#9DB5B1)}',
  '.cst-perfsel{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;grid-column:1/-1}',
  '.cst-po{border:1.5px solid rgba(255,255,255,.14);border-radius:13px;padding:13px;cursor:pointer;transition:.15s;background:rgba(255,255,255,.03)}',
  '.cst-po:hover{border-color:rgba(197,160,89,.55)}',
  '.cst-po.on{border-color:var(--pc,#C5A059);background:rgba(197,160,89,.09)}',
  '.cst-po b{display:block;font-size:14px;margin-bottom:3px}',
  '.cst-po span{font-size:12px;color:var(--muted,#9DB5B1)}',
  '.cst-po em{display:block;font-style:normal;font-size:19px;font-weight:700;color:var(--pc,#C5A059);margin-top:7px}',
  '.cst-acts{display:flex;gap:9px;flex-wrap:wrap;margin-top:6px}',
  '.cst-vazio{text-align:center;padding:40px 20px;color:var(--muted,#9DB5B1)}',
  'body.light .cst-kpi,body.light .cst-card,body.light .cst-perfil{border-color:rgba(14,74,65,.14)}',
  'body.light .cst-tb th{border-bottom-color:rgba(14,74,65,.16)}',
  'body.light .cst-tb td{border-bottom-color:rgba(14,74,65,.09)}',
  'body.light .cst-tb tbody tr.cl:hover{background:rgba(14,74,65,.05)}',
  'body.light .cst-fil input,body.light .cst-fil select,body.light .cst-f input,body.light .cst-f select{background:rgba(14,74,65,.04);border-color:rgba(14,74,65,.2)}',
  'body.light .cst-bar{background:rgba(14,74,65,.1)}',
  'body.light .cst-po{background:rgba(14,74,65,.03);border-color:rgba(14,74,65,.16)}',
  '@media(max-width:900px){.cst-grid2{grid-template-columns:1fr}.cst-chart{height:210px}.cst-form{grid-template-columns:1fr}.cst-perfsel{grid-template-columns:1fr}}',
  '@media(max-width:560px){.cst-kpis{grid-template-columns:1fr 1fr}.cst-kpi .v{font-size:19px}.cst-head h2{font-size:20px}}'
  ].join('');
  document.head.appendChild(st);
}

/* ------------------------- TELA GERAL ------------------------- */
function cstRenderGeral(C){
  var carts=cstCarteiras();
  if(!carts.length){
    C.innerHTML='<div class="cst-wrap"><div class="cst-head"><h2>Consultoria</h2>'+
      '<button class="cst-btn" style="margin-left:auto" onclick="cstNovo()">+ Novo cliente</button></div>'+
      '<p class="cst-sub">Gestão discricionária de carteiras líquidas · contabilização diária por cota</p>'+
      '<div class="cst-card"><div class="cst-vazio"><p>Nenhuma carteira cadastrada ainda.</p>'+
      '<button class="cst-btn" onclick="cstNovo()">Cadastrar primeiro cliente</button></div></div></div>';
    return;
  }
  var tot=0, ap=0, rg=0, rec=0, porPerfil={}, faixas={};
  carts.forEach(function(c){
    var p=cstPosicao(c), f=cstFee(p.patrimonio), m=cstMetricas(c);
    tot+=p.patrimonio; ap+=p.aportado; rg+=p.resgatado; rec+=f.mensal;
    if(!porPerfil[c.perfil]) porPerfil[c.perfil]={n:0,pat:0,inv:0,luc:0,vol:[],sh:[]};
    var g=porPerfil[c.perfil]; g.n++; g.pat+=p.patrimonio; g.inv+=p.investido; g.luc+=p.lucro;
    g.vol.push(m.vol); g.sh.push(m.sharpe);
    if(!faixas[f.faixa]) faixas[f.faixa]={n:0,pat:0,rec:0,taxa:f.taxa};
    faixas[f.faixa].n++; faixas[f.faixa].pat+=p.patrimonio; faixas[f.faixa].rec+=f.mensal;
  });
  var liq=ap-rg, res=tot-liq, resPc=liq>0?(res/liq*100):0;
  var med=function(a){ return a.length? a.reduce(function(x,y){return x+y;},0)/a.length : 0; };

  var kpis=[
    ['Patrimônio sob custódia', _mi(tot), carts.length+' carteira'+(carts.length===1?'':'s')+' ativa'+(carts.length===1?'':'s'), 'gold'],
    ['Receita mensal', BRL(rec), 'fee médio '+(tot>0?_nb(rec*12/tot*100):'0')+'% a.a.', 'gold'],
    ['Receita anual', _mi(rec*12), 'projetada sobre a custódia atual', ''],
    ['Resultado gerado', _mi(res), _pc(resPc)+' sobre o capital', ''],
    ['Captação líquida', _mi(liq), _mi(ap)+' aportado · '+_mi(rg)+' resgatado', ''],
    ['Ticket médio', _mi(tot/carts.length), 'por cliente', '']
  ];

  var perfisHTML=Object.keys(CST_PERFIS).map(function(p){
    var P=CST_PERFIS[p], d=porPerfil[p];
    if(!d) return '<div class="cst-perfil" style="--pc:'+P.cor+'">'+
      '<div class="nm"><b>'+p+'</b><span>sem clientes</span></div>'+
      '<div class="big">'+_nb(P.meta)+'%<small>meta ao ano</small></div></div>';
    var rendaP = d.inv>0 ? (d.luc/d.inv*100) : 0;
    return '<div class="cst-perfil" style="--pc:'+P.cor+'">'+
      '<div class="nm"><b>'+p+'</b><span>'+d.n+' cliente'+(d.n===1?'':'s')+'</span></div>'+
      '<div class="big">'+_nb(P.meta)+'%<small>ao ano · rentabilidade da estratégia</small></div>'+
      '<div class="cst-mini">'+
        '<div>Patrimônio<b>'+_mi(d.pat)+'</b></div>'+
        '<div>Participação<b>'+_nb(d.pat/tot*100,1)+'%</b></div>'+
        '<div>Resultado no período<b class="'+_cls(rendaP)+'">'+_pc(rendaP)+'</b></div>'+
        '<div>Volatilidade<b>'+_nb(med(d.vol))+'%</b></div>'+
      '</div></div>';
  }).join('');

  var faixasHTML=CST_FEE.map(function(f){
    var d=faixas[f.rot]; if(!d) return '';
    return '<tr><td>'+esc(f.rot)+'</td><td class="num">'+_nb(f.taxa)+'% a.a.</td>'+
      '<td class="num">'+d.n+'</td><td class="num">'+_mi(d.pat)+'</td>'+
      '<td class="num" style="color:#C5A059;font-weight:600">'+BRL(d.rec)+'</td></tr>';
  }).join('');

  C.innerHTML =
  '<div class="cst-wrap">'+
    '<div class="cst-head"><h2>Consultoria</h2>'+
      '<button class="cst-btn" style="margin-left:auto" onclick="cstNovo()">+ Novo cliente</button></div>'+
    '<p class="cst-sub">Gestão discricionária de carteiras líquidas · contabilização diária por cota · atualizado em '+_dt(cstHoje())+'</p>'+

    '<div class="cst-kpis">'+kpis.map(function(k){
      return '<div class="cst-kpi '+k[3]+'"><div class="l">'+k[0]+'</div><div class="v">'+k[1]+'</div><div class="d">'+k[2]+'</div></div>';
    }).join('')+'</div>'+

    '<div class="cst-grid2">'+
      '<div class="cst-card"><h3>Patrimônio sob custódia</h3><p class="hint">Evolução diária de todas as carteiras somadas</p>'+
        '<div class="cst-chart"><canvas id="cstChartCust"></canvas></div></div>'+
      '<div class="cst-card"><h3>Distribuição por perfil</h3><p class="hint">Patrimônio alocado em cada estratégia</p>'+
        '<div class="cst-chart"><canvas id="cstChartPerfis"></canvas></div></div>'+
    '</div>'+

    '<div class="cst-perfis">'+perfisHTML+'</div>'+

    '<div class="cst-card"><h3>Receita por faixa de patrimônio</h3>'+
      '<p class="hint">Taxa de consultoria cobrada ao ano, dividida em 12 parcelas mensais</p>'+
      '<div class="cst-scroll"><table class="cst-tb"><thead><tr>'+
        '<th>Faixa</th><th class="num">Taxa</th><th class="num">Clientes</th><th class="num">Patrimônio</th><th class="num">Receita / mês</th>'+
      '</tr></thead><tbody>'+faixasHTML+
      '<tr style="font-weight:600"><td>Total</td><td class="num">'+(tot>0?_nb(rec*12/tot*100):'0')+'% a.a.</td>'+
      '<td class="num">'+carts.length+'</td><td class="num">'+_mi(tot)+'</td>'+
      '<td class="num" style="color:#C5A059">'+BRL(rec)+'</td></tr>'+
      '</tbody></table></div></div>'+

    '<div class="cst-card"><h3>Carteiras</h3><p class="hint">Clique em um cliente para abrir a carteira dele</p>'+
      '<div class="cst-fil">'+
        '<input id="cstBusca" type="search" placeholder="Buscar cliente..." value="'+esc(cstView.busca)+'" oninput="cstSetBusca(this.value)">'+
        '<select onchange="cstSetPerfil(this.value)">'+
          ['','Conservador','Moderado','Arrojado'].map(function(p){
            return '<option value="'+p+'"'+(cstView.perfil===p?' selected':'')+'>'+(p||'Todos os perfis')+'</option>';
          }).join('')+'</select>'+
        '<select onchange="cstSetOrd(this.value)">'+
          [['pat','Maior patrimônio'],['rent','Maior rentabilidade'],['novo','Mais recentes'],['nome','Nome (A-Z)']].map(function(o){
            return '<option value="'+o[0]+'"'+(cstView.ord===o[0]?' selected':'')+'>'+o[1]+'</option>';
          }).join('')+'</select>'+
      '</div>'+
      '<div class="cst-scroll" id="cstLista"></div></div>'+
  '</div>';

  cstListaHTML();
  cstDepoisDoLayout(function(){ cstGraficos(); });
}

function cstListaHTML(){
  var el=document.getElementById('cstLista'); if(!el) return;
  var q=(cstView.busca||'').toLowerCase().trim();
  var linhas=cstCarteiras().filter(function(c){
    if(cstView.perfil && c.perfil!==cstView.perfil) return false;
    if(q && c.nome.toLowerCase().indexOf(q)<0) return false;
    return true;
  }).map(function(c){
    var p=cstPosicao(c), f=cstFee(p.patrimonio);
    return {c:c, p:p, f:f, rent:p.investido>0?(p.lucro/p.investido*100):0};
  });
  var ord=cstView.ord;
  linhas.sort(function(a,b){
    if(ord==='rent') return b.rent-a.rent;
    if(ord==='novo') return a.c.inicio<b.c.inicio?1:-1;
    if(ord==='nome') return a.c.nome.localeCompare(b.c.nome,'pt-BR');
    return b.p.patrimonio-a.p.patrimonio;
  });
  if(!linhas.length){ el.innerHTML='<p class="cst-vazio">Nenhum cliente encontrado.</p>'; return; }
  el.innerHTML='<table class="cst-tb"><thead><tr>'+
    '<th>Cliente</th><th>Perfil</th><th>Desde</th>'+
    '<th class="num">Patrimônio</th><th class="num">Rentabilidade</th><th class="num">Fee / mês</th>'+
    '</tr></thead><tbody>'+
    linhas.map(function(r){
      var cor=(CST_PERFIS[r.c.perfil]||{}).cor||'#C5A059';
      return '<tr class="cl" onclick="cstAbrir(\''+r.c.id+'\')" style="--pc:'+cor+'">'+
        '<td><div class="cst-cli"><span class="cst-av">'+esc(_ini(r.c.nome))+'</span>'+
          '<span style="min-width:0"><b>'+esc(r.c.nome)+'</b><i>'+_mi(r.p.investido)+' investidos</i></span></div></td>'+
        '<td><span class="cst-chip">'+esc(r.c.perfil)+'</span></td>'+
        '<td style="white-space:nowrap;color:var(--muted,#9DB5B1)">'+_dt(r.c.inicio)+'</td>'+
        '<td class="num"><b>'+BRL(r.p.patrimonio)+'</b></td>'+
        '<td class="num '+_cls(r.rent)+'">'+_pc(r.rent)+'</td>'+
        '<td class="num" style="color:#C5A059">'+BRL(r.f.mensal)+'</td></tr>';
    }).join('')+'</tbody></table>';
}

/* ------------------------- TELA DO CLIENTE ------------------------- */
function cstRenderCliente(C){
  var cart=cstPorId(cstView.id);
  if(!cart){ cstVoltar(); return; }
  var P=CST_PERFIS[cart.perfil]||CST_PERFIS.Conservador;
  var p=cstPosicao(cart), f=cstFee(p.patrimonio), m=cstMetricas(cart);
  var rent=p.investido>0?(p.lucro/p.investido*100):0;

  var kpis=[
    ['Patrimônio', BRL(p.patrimonio), p.cotas.toLocaleString('pt-BR',{maximumFractionDigits:4})+' cotas · cota '+p.cotaHoje.toLocaleString('pt-BR',{minimumFractionDigits:4,maximumFractionDigits:4}), 'gold', null],
    ['Capital investido', BRL(p.investido), _mi(p.aportado)+' aportado'+(p.resgatado>0?' · '+_mi(p.resgatado)+' resgatado':''), '', null],
    ['Resultado', BRL(p.lucro), _pc(rent)+' sobre o investido', '', p.lucro],
    ['No período', _pc(m.acum), 'desde '+_dt(cart.inicio), '', m.acum],
    ['Últimos 30 dias', _pc(m.mes), 'variação da cota', '', m.mes],
    ['Anualizado', _pc(m.ano), 'meta do perfil '+_nb(P.meta)+'% a.a.', '', m.ano]
  ];

  var ativos=(CST_ATIVOS[cart.perfil]||[]).map(function(a){
    return '<div class="cst-at"><div class="t"><b>'+esc(a[0])+'</b><span>'+a[1]+'%</span></div>'+
      '<div class="cst-bar"><i style="width:'+a[1]+'%"></i></div></div>';
  }).join('');

  var extrato=p.extrato.map(function(e){
    var pos=e.tipo!=='resgate';
    return '<tr><td style="white-space:nowrap">'+_dt(e.data)+'</td><td>'+esc(e.obs)+'</td>'+
      '<td class="num">'+e.cota.toLocaleString('pt-BR',{minimumFractionDigits:4,maximumFractionDigits:4})+'</td>'+
      '<td class="num">'+(pos?'':'-')+e.cotas.toLocaleString('pt-BR',{maximumFractionDigits:4})+'</td>'+
      '<td class="num '+(pos?'cst-up':'cst-dn')+'"><b>'+(pos?'+':'−')+' '+BRL(e.valor)+'</b></td></tr>';
  }).join('');

  C.innerHTML =
  '<div class="cst-wrap" style="--pc:'+P.cor+'">'+
    '<button class="cst-back" onclick="cstVoltar()">&larr; Todas as carteiras</button>'+
    '<div class="cst-head">'+
      '<span class="cst-av" style="width:52px;height:52px;flex:0 0 52px;font-size:17px">'+esc(_ini(cart.nome))+'</span>'+
      '<div style="min-width:0"><h2>'+esc(cart.nome)+'</h2>'+
        '<p class="cst-sub">Perfil '+esc(cart.perfil)+' · cliente desde '+_dt(cart.inicio)+
        (cart.email?' · '+esc(cart.email):'')+'</p></div>'+
      '<span class="cst-chip" style="margin-left:auto">'+esc(cart.perfil)+'</span>'+
    '</div>'+

    '<div class="cst-acts">'+
      '<button class="cst-btn" onclick="cstMov(\''+cart.id+'\',\'aporte\')">+ Registrar aporte</button>'+
      '<button class="cst-btn gh" onclick="cstMov(\''+cart.id+'\',\'resgate\')">− Registrar resgate</button>'+
    '</div>'+

    '<div class="cst-kpis">'+kpis.map(function(k){
      return '<div class="cst-kpi '+k[3]+'"><div class="l">'+k[0]+'</div>'+
        '<div class="v'+(k[4]!==null&&k[4]!==undefined?' '+_cls(k[4]):'')+'">'+k[1]+'</div>'+
        '<div class="d">'+k[2]+'</div></div>';
    }).join('')+'</div>'+

    '<div class="cst-card"><h3>Evolução da carteira</h3>'+
      '<p class="hint">Patrimônio dia a dia · estratégia '+esc(cart.perfil)+'</p>'+
      '<div class="cst-chart" style="height:280px"><canvas id="cstChartCli"></canvas></div></div>'+

    '<div class="cst-grid2">'+
      '<div class="cst-card"><h3>Composição da carteira</h3>'+
        '<p class="hint">Alocação-alvo da estratégia '+esc(cart.perfil)+'</p>'+ativos+'</div>'+
      '<div class="cst-card"><h3>Taxa de consultoria</h3><p class="hint">'+esc(f.faixa)+'</p>'+
        '<div class="v" style="color:#C5A059;font-size:30px;font-weight:700">'+_nb(f.taxa)+'%'+
          '<span style="font-size:14px;color:var(--muted,#9DB5B1);font-weight:500"> ao ano</span></div>'+
        '<div class="cst-mini">'+
          '<div>Cobrança mensal<b>'+BRL2(f.mensal)+'</b></div>'+
          '<div>Total no ano<b>'+BRL(f.anual)+'</b></div>'+
          '<div>Volatilidade<b>'+_nb(m.vol)+'%</b></div>'+
          '<div>Sharpe<b>'+_nb(m.sharpe)+'</b></div>'+
        '</div>'+
        '<p class="hint" style="margin:14px 0 0">Calculada sobre o patrimônio sob gestão e dividida em 12 parcelas.</p>'+
      '</div>'+
    '</div>'+

    '<div class="cst-card"><h3>Extrato</h3><p class="hint">Aportes e resgates, com a cota de cada movimentação</p>'+
      '<div class="cst-scroll"><table class="cst-tb"><thead><tr>'+
        '<th>Data</th><th>Movimentação</th><th class="num">Cota</th><th class="num">Cotas</th><th class="num">Valor</th>'+
      '</tr></thead><tbody>'+extrato+'</tbody></table></div>'+
      (cstEhCadastrada(cart.id)?'<div class="cst-acts" style="margin-top:14px">'+
        '<button class="cst-btn gh" style="border-color:rgba(232,139,139,.5);color:#E88B8B" onclick="cstExcluir(\''+cart.id+'\')">Excluir carteira</button></div>':'')+
    '</div>'+
  '</div>';

  cstDepoisDoLayout(function(){ cstGraficoCliente(cart); });
}

/* ------------------------- NOVO CLIENTE ------------------------- */
function cstRenderNovo(C){
  var hoje=cstHoje();
  C.innerHTML =
  '<div class="cst-wrap">'+
    '<button class="cst-back" onclick="cstVoltar()">&larr; Todas as carteiras</button>'+
    '<div><h2 style="margin:0;font-size:23px">Novo cliente na consultoria</h2>'+
    '<p class="cst-sub">A carteira começa a ser contabilizada na data do primeiro aporte, com cota inicial 1.000.</p></div>'+
    '<div class="cst-card">'+
      '<div class="cst-form">'+
        '<div class="cst-f full"><label for="cstNome">Nome completo</label>'+
          '<input id="cstNome" type="text" placeholder="Ex.: Maria Aparecida Souza" autocomplete="off"></div>'+
        '<div class="cst-f"><label for="cstEmail">E-mail <span style="font-weight:400">(opcional)</span></label>'+
          '<input id="cstEmail" type="email" placeholder="cliente@email.com" autocomplete="off"></div>'+
        '<div class="cst-f"><label for="cstTel">Telefone <span style="font-weight:400">(opcional)</span></label>'+
          '<input id="cstTel" type="text" placeholder="(51) 90000-0000" autocomplete="off"></div>'+
        '<div class="cst-perfsel" id="cstPerfSel">'+
          Object.keys(CST_PERFIS).map(function(p,i){
            var P=CST_PERFIS[p];
            return '<div class="cst-po'+(i===0?' on':'')+'" data-p="'+p+'" style="--pc:'+P.cor+'" onclick="cstPickPerfil(\''+p+'\')">'+
              '<b>'+p+'</b><span>volatilidade '+_nb(P.vol,1)+'%</span><em>'+_nb(P.meta)+'% a.a.</em></div>';
          }).join('')+
        '</div>'+
        '<div class="cst-f"><label for="cstValor">Valor do aporte inicial</label>'+
          '<input id="cstValor" type="text" inputmode="numeric" placeholder="R$ 500.000">'+
          '<span class="dica">Só números — pode digitar 500000 ou 500.000</span></div>'+
        '<div class="cst-f"><label for="cstData">Data do aporte</label>'+
          '<input id="cstData" type="date" value="'+hoje+'" max="'+hoje+'">'+
          '<span class="dica">Não pode ser uma data futura</span></div>'+
        '<div class="cst-f full">'+
          '<div class="cst-acts">'+
            '<button class="cst-btn" onclick="cstCriar()">Criar carteira</button>'+
            '<button class="cst-btn gh" onclick="cstVoltar()">Cancelar</button>'+
          '</div>'+
          '<p id="cstErro" style="color:#E88B8B;font-size:13px;margin:4px 0 0"></p>'+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div>';
  var el=document.getElementById('cstNome'); if(el) el.focus();
}
var _cstPerfilSel='Conservador';
function cstPickPerfil(p){
  _cstPerfilSel=p;
  document.querySelectorAll('#cstPerfSel .cst-po').forEach(function(el){
    el.classList.toggle('on', el.getAttribute('data-p')===p);
  });
}
function cstCriar(){
  var err=document.getElementById('cstErro');
  var nome=(document.getElementById('cstNome')||{}).value||'';
  var email=(document.getElementById('cstEmail')||{}).value||'';
  var tel=(document.getElementById('cstTel')||{}).value||'';
  var valor=_num((document.getElementById('cstValor')||{}).value);
  var data=(document.getElementById('cstData')||{}).value||cstHoje();
  nome=nome.trim();
  function erro(m){ if(err) err.textContent=m; }
  if(nome.length<3) return erro('Informe o nome completo do cliente.');
  if(valor<=0) return erro('Informe o valor do aporte inicial.');
  if(data>cstHoje()) return erro('A data do aporte não pode ser no futuro.');
  var st=cstStore();
  var id='c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  st.carteiras.push({
    id:id, nome:nome, email:email.trim(), telefone:tel.trim(),
    perfil:_cstPerfilSel, inicio:data, criadoEm:Date.now(),
    movimentos:[{tipo:'aporte', valor:valor, data:data, obs:'Aporte inicial'}]
  });
  cstSalvar();
  try{ if(typeof flash==='function') flash('Carteira de '+nome.split(' ')[0]+' criada'); }catch(e){}
  try{ if(typeof logEvt==='function') logEvt('INSERT','consultoria','Criou carteira de consultoria: '+nome); }catch(e){}
  cstAbrir(id);
}
function cstMov(id,tipo){
  var cart=cstPorId(id); if(!cart) return;
  if(!cstEhCadastrada(id)){
    try{ if(typeof flash==='function') flash('Esta é uma carteira de exemplo — crie um cliente para movimentar'); }catch(e){}
    return;
  }
  var lbl = tipo==='resgate' ? 'resgate' : 'aporte';
  var v=_num(window.prompt('Valor do '+lbl+' (R$):',''));
  if(!v || v<=0) return;
  var d=window.prompt('Data do '+lbl+' (AAAA-MM-DD):', cstHoje());
  if(!d) return;
  d=d.trim();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(d)){ alert('Data inválida. Use o formato AAAA-MM-DD.'); return; }
  if(d>cstHoje()){ alert('A data não pode ser no futuro.'); return; }
  if(d<cart.inicio){ alert('A data não pode ser anterior à abertura da carteira ('+_dt(cart.inicio)+').'); return; }
  if(tipo==='resgate'){
    var atual=cstPosicao(cart).patrimonio;
    if(v>atual){ alert('O resgate ('+BRL(v)+') é maior que o patrimônio atual ('+BRL(atual)+').'); return; }
  }
  cart.movimentos.push({tipo:tipo, valor:v, data:d, obs: tipo==='resgate'?'Resgate parcial':'Aporte adicional'});
  cstSalvar();
  try{ if(typeof flash==='function') flash(tipo==='resgate'?'Resgate registrado':'Aporte registrado'); }catch(e){}
  if(typeof render==='function') render();
}
function cstExcluir(id){
  var cart=cstPorId(id); if(!cart) return;
  if(!window.confirm('Excluir a carteira de '+cart.nome+'? Esta ação não pode ser desfeita.')) return;
  var st=cstStore();
  st.carteiras=st.carteiras.filter(function(c){return c.id!==id;});
  cstSalvar();
  try{ if(typeof flash==='function') flash('Carteira excluída'); }catch(e){}
  cstVoltar();
}

/* ------------------------- GRÁFICOS -------------------------
   animation:false de propósito — o Chart.js só pinta dentro de
   requestAnimationFrame, e em algumas situações (aba recém-trocada,
   WebView do app, janela sem foco) o rAF não dispara e o gráfico
   fica em branco. Sem animação, desenha na hora, sempre.          */
function cstDepoisDoLayout(fn){
  if(typeof requestAnimationFrame==='function') requestAnimationFrame(function(){ setTimeout(fn,0); });
  else setTimeout(fn,40);
}
function _eixoMoeda(){ return {ticks:{callback:function(v){return _mi(v);},maxTicksLimit:6},grid:{color:'rgba(255,255,255,.05)'}}; }
function _eixoData(lab){ return {ticks:{maxTicksLimit:7,autoSkip:true,callback:function(v,i){var d=lab[i];return d?d.slice(8,10)+'/'+d.slice(5,7):'';}},grid:{display:false}}; }

function cstGraficos(){
  var cust=cstSerieCustodia();
  if(!cust.length) return;
  var lab=cust.map(function(x){return x.data;});
  mkChart('cstChartCust',{
    type:'line',
    data:{labels:lab,datasets:[{
      data:cust.map(function(x){return x.valor;}),
      borderColor:'#C5A059', borderWidth:2, fill:true, tension:.25,
      pointRadius:0, pointHoverRadius:4, pointHoverBackgroundColor:'#C5A059',
      backgroundColor:'rgba(197,160,89,.16)'
    }]},
    options:{animation:false, plugins:{legend:{display:false},tooltip:{callbacks:{
      title:function(t){return _dt(t[0].label);},
      label:function(c){return 'Custódia: '+BRL(c.parsed.y);}}}},
      interaction:{mode:'index',intersect:false},
      scales:{y:_eixoMoeda(), x:_eixoData(lab)}}
  });

  var porP={}; cstCarteiras().forEach(function(c){ porP[c.perfil]=(porP[c.perfil]||0)+cstPosicao(c).patrimonio; });
  var nomes=Object.keys(CST_PERFIS).filter(function(p){return porP[p]>0;});
  mkChart('cstChartPerfis',{
    type:'doughnut',
    data:{labels:nomes, datasets:[{
      data:nomes.map(function(p){return porP[p];}),
      backgroundColor:nomes.map(function(p){return CST_PERFIS[p].cor;}),
      borderColor:'rgba(0,0,0,0)', borderWidth:2, hoverOffset:6
    }]},
    options:{animation:false, cutout:'62%',
      plugins:{legend:{position:'bottom',labels:{boxWidth:9,boxHeight:9,usePointStyle:true,pointStyle:'circle',padding:14,font:{size:11}}},
        tooltip:{callbacks:{label:function(c){
          var t=c.dataset.data.reduce(function(a,b){return a+b;},0);
          return c.label+': '+_mi(c.parsed)+' ('+_nb(c.parsed/t*100,1)+'%)';}}}}}
  });
}
function cstGraficoCliente(cart){
  var s=cstSerie(cart), cor=(CST_PERFIS[cart.perfil]||{}).cor||'#C5A059';
  var movs=(cart.movimentos||[]).slice().sort(function(a,b){return a.data<b.data?-1:1;});
  var cotas=0, k=0, pts=[], lab=[];
  s.forEach(function(pt){
    while(k<movs.length && movs[k].data<=pt.data){
      var q=(+movs[k].valor||0)/cstCotaEm(s,movs[k].data);
      cotas += (movs[k].tipo==='resgate' ? -q : q); k++;
    }
    lab.push(pt.data); pts.push(cotas*pt.cota);
  });
  mkChart('cstChartCli',{
    type:'line',
    data:{labels:lab,datasets:[{
      data:pts, borderColor:cor, borderWidth:2.2, fill:true, tension:.25,
      pointRadius:0, pointHoverRadius:4, pointHoverBackgroundColor:cor,
      backgroundColor:cor+'26'
    }]},
    options:{animation:false, plugins:{legend:{display:false},tooltip:{callbacks:{
      title:function(t){return _dt(t[0].label);},
      label:function(c){return 'Patrimônio: '+BRL(c.parsed.y);}}}},
      interaction:{mode:'index',intersect:false},
      scales:{y:_eixoMoeda(), x:_eixoData(lab)}}
  });
}

/* ------------------------- ENTRADA ------------------------- */
function renderConsultoria(C){
  cstCSS();
  if(cstView.modo==='cliente') return cstRenderCliente(C);
  if(cstView.modo==='novo')    return cstRenderNovo(C);
  return cstRenderGeral(C);
}

window.renderConsultoria=renderConsultoria;
window.cstAbrir=cstAbrir; window.cstVoltar=cstVoltar; window.cstNovo=cstNovo;
window.cstSetBusca=cstSetBusca; window.cstSetPerfil=cstSetPerfil; window.cstSetOrd=cstSetOrd;
window.cstPickPerfil=cstPickPerfil; window.cstCriar=cstCriar; window.cstMov=cstMov; window.cstExcluir=cstExcluir;
window.cstCarteiras=cstCarteiras; window.cstPosicao=cstPosicao; window.cstFee=cstFee;
window.cstMetricas=cstMetricas; window.cstSerie=cstSerie; window.CST_PERFIS=CST_PERFIS;
window.__CST_OK=true;
})();
