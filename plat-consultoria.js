/* =====================================================================
   AGION WEALTH — MÓDULO CONSULTORIA (gestão discricionária)
   Arquivo separado de propósito: o plataforma.html só carrega via <script>.
   Prefixo cst* para não colidir com o consórcio (consFee/consBase/consPre).
   Depende do host: esc(), BRL(), BRL2(), mkChart(), go(), render()
   ===================================================================== */
(function(){
'use strict';

/* ------------------------- PARÂMETROS ------------------------- */
var CST_PERFIS = {
  Conservador:{meta:17, vol:2.4, cor:'#8FD9CC'},
  Moderado:   {meta:18, vol:4.2, cor:'#C5A059'},
  Arrojado:   {meta:20, vol:6.8, cor:'#E8CC8B'}
};
var CST_CDI = 14.15, CST_DU = 252, CST_INICIO = '2025-11-03';
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

/* ------------------------- MOTOR DE COTAS -------------------------
   Consultoria discricionária: todos do mesmo perfil seguem a MESMA
   estratégia, então a cota é por PERFIL (não por cliente). O cliente
   compra cotas na data do aporte, exatamente como um fundo.          */
function _cstHash(s){var h=2166136261,i;for(i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0)/4294967295;}
function _cstUtil(d){var w=d.getDay();return w!==0&&w!==6;}
function _cstISO(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function _cstDiasUteis(ate){var o=[],d=new Date(CST_INICIO+'T12:00:00');while(d<=ate){if(_cstUtil(d))o.push(_cstISO(d));d.setDate(d.getDate()+1);}return o;}

var _cstCache={};
/* O ruído é centralizado sobre a série inteira: o acumulado entrega sempre
   a meta pro-rata do período e a hierarquia dos perfis nunca inverte,
   preservando a oscilação do dia a dia. */
function cstSerie(perfil){
  var hj=_cstISO(new Date()), ck=perfil+'|'+hj;
  if(_cstCache[ck]) return _cstCache[ck];
  var P=CST_PERFIS[perfil]||CST_PERFIS.Conservador;
  var sd=(P.vol/100)/Math.sqrt(CST_DU);
  var rd=Math.pow(1+P.meta/100,1/CST_DU)-1+(sd*sd)/2;
  var fim=new Date(); fim.setHours(12,0,0,0);
  var dias=_cstDiasUteis(fim);
  var zs=dias.map(function(iso){return (_cstHash(perfil+'|'+iso)-0.5)*3.4641;});
  var med=zs.reduce(function(a,b){return a+b;},0)/Math.max(1,zs.length);
  var out=[{data:dias[0],cota:1000}], cota=1000, i;
  for(i=1;i<dias.length;i++){ cota=cota*(1+rd+(zs[i]-med)*sd); out.push({data:dias[i],cota:cota}); }
  _cstCache[ck]=out; return out;
}
function cstCotaEm(serie,data){var c=serie[0].cota,i;for(i=0;i<serie.length;i++){if(serie[i].data<=data)c=serie[i].cota;else break;}return c;}
function cstIdxData(serie,data){var k=0,i;for(i=0;i<serie.length;i++){if(serie[i].data<=data)k=i;else break;}return k;}

function cstPosicao(cart){
  var serie=cstSerie(cart.perfil), cotas=0, ap=0, rg=0, ext=[];
  (cart.movimentos||[]).forEach(function(m){
    var c=cstCotaEm(serie,m.data), v=+m.valor||0, q=v/c;
    if(m.tipo==='resgate'){cotas-=q; rg+=v;} else {cotas+=q; ap+=v;}
    ext.push({data:m.data,tipo:m.tipo,valor:v,cota:c,cotas:q,obs:m.obs||'',saldo:cotas});
  });
  var ch=serie[serie.length-1].cota, pat=cotas*ch;
  return {cotas:cotas, cotaHoje:ch, patrimonio:pat, aportado:ap, resgatado:rg,
          lucro:pat-(ap-rg), investido:ap-rg, extrato:ext.slice().reverse()};
}
function cstMetricas(perfil,desde){
  var s0=cstSerie(perfil), s=desde?s0.filter(function(x){return x.data>=desde;}):s0;
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
/* patrimônio da casa dia a dia: acumula cotas por perfil e multiplica pela cota do dia */
function cstSerieCustodia(){
  var perfis=Object.keys(CST_PERFIS), base=cstSerie(perfis[0]);
  var acum={}, i;
  perfis.forEach(function(p){ acum[p]=new Array(cstSerie(p).length).fill(0); });
  cstCarteiras().forEach(function(c){
    var s=cstSerie(c.perfil);
    (c.movimentos||[]).forEach(function(m){
      var k=cstIdxData(s,m.data), q=(+m.valor||0)/s[k].cota;
      if(m.tipo==='resgate') q=-q;
      acum[c.perfil][k]+=q;
    });
  });
  perfis.forEach(function(p){ for(i=1;i<acum[p].length;i++) acum[p][i]+=acum[p][i-1]; });
  return base.map(function(pt,k){
    var t=0; perfis.forEach(function(p){ var s=cstSerie(p); if(s[k]) t+=acum[p][k]*s[k].cota; });
    return {data:pt.data, valor:t};
  });
}

/* ------------------------- BASE DE CARTEIRAS -------------------------
   Formato compacto: id|Nome|Perfil|mov;mov;mov   (mov = t:valor:data)
   Dados de DEMONSTRAÇÃO — substituídos assim que entrarem carteiras reais. */
var CST_RAW = "cd01|Ricardo Salgado Vieira|Conservador|i:880000:2026-06-08\ncd02|Helena Marchetti Prado|Moderado|i:880000:2026-06-25\ncd03|Otávio Bernardes Lima|Arrojado|i:880000:2026-07-14\ncd04|Camila Fontoura Rezende|Conservador|i:880000:2026-05-06\ncd05|Eduardo Tannure Nogueira|Moderado|i:880000:2026-06-10\ncd06|Patrícia Vasconcelos Amaral|Arrojado|i:880000:2026-07-20\ncd07|Leonardo Bittencourt Sá|Conservador|i:6334000:2026-07-30\ncd08|Juliana Weber Krieger|Moderado|i:938000:2026-02-05;a:265000:2026-05-26\ncd09|Marcelo Andrade Pontes|Arrojado|i:921000:2026-03-26\ncd10|Renata Colombo Bianchi|Conservador|i:3609000:2025-12-08;a:1018000:2026-05-01\ncd11|Fernando Queiroz Malta|Moderado|i:964000:2026-03-16\ncd12|Beatriz Sampaio Duarte|Arrojado|i:880000:2026-05-27\ncd13|Augusto Vilella Caminha|Conservador|i:880000:2026-07-16\ncd14|Larissa Toledo Bandeira|Moderado|i:3494000:2025-12-18;a:985000:2026-05-05\ncd15|Rodrigo Menescal Aguiar|Arrojado|i:3348000:2025-12-30;a:944000:2026-05-10\ncd16|Cristina Vasques Portela|Conservador|i:880000:2026-07-27\ncd17|Thiago Rennó Cavalcanti|Moderado|i:822000:2026-03-03;a:232000:2026-06-06\ncd18|Vanessa Klein Sobral|Arrojado|i:880000:2026-06-21\ncd19|Gustavo Peçanha Motta|Conservador|i:880000:2026-05-16\ncd20|Adriana Rocha Bulhões|Moderado|i:880000:2026-08-03\ncd21|Henrique Vasconcelos Tourinho|Arrojado|i:880000:2026-05-04\ncd22|Mariana Stein Guedes|Conservador|i:880000:2026-05-12\ncd23|Paulo Cesar Meireles Fagundes|Moderado|i:880000:2026-06-20\ncd24|Luciana Braga Werneck|Arrojado|i:6600000:2025-11-26;a:1862000:2026-04-26;r:677000:2026-06-09\ncd25|Felipe Adorno Vilhena|Conservador|i:880000:2026-07-25\ncd26|Simone Kraemer Dutra|Moderado|i:880000:2026-07-25\ncd27|André Luiz Corrêa Belmonte|Arrojado|i:818000:2026-02-28;a:231000:2026-06-04\ncd28|Tatiana Ferraz Bonfim|Conservador|i:1091000:2026-01-06;a:308000:2026-05-13\ncd29|Rafael Monteiro Estrella|Moderado|i:3389000:2025-12-26;a:956000:2026-05-08\ncd30|Cláudia Reinehr Vasques|Arrojado|i:880000:2026-05-14\ncd31|Sérgio Bandeira Machado|Conservador|i:912000:2026-03-28\ncd32|Isabela Franco Loureiro|Moderado|i:3632000:2025-12-07;a:1025000:2026-04-30;r:373000:2026-06-12\ncd33|Vinícius Sarmento Pires|Arrojado|i:3917000:2025-11-14;a:1105000:2026-04-21;r:402000:2026-06-06\ncd34|Fabiana Loureiro Mendonça|Conservador|i:880000:2026-05-20\ncd35|Alexandre Pimentel Vidal|Moderado|i:880000:2026-06-26\ncd36|Roberta Castilho Nunes|Arrojado|i:1009000:2026-01-21;a:285000:2026-05-19\ncd37|Bruno Cavalheiro Assis|Conservador|i:856000:2026-02-18;a:242000:2026-05-31\ncd38|Daniela Ostermann Freire|Moderado|i:880000:2026-02-18;a:248000:2026-05-31\ncd39|Guilherme Mattoso Serpa|Arrojado|i:880000:2026-05-22\ncd40|Priscila Vidigal Rangel|Conservador|i:880000:2026-04-18\ncd41|Antônio Emílio Barcelos|Moderado|i:1062000:2026-01-06;a:299000:2026-05-13\ncd42|Verônica Sanches Bastos|Arrojado|i:5993000:2026-02-25;a:1690000:2026-06-03\ncd43|Márcio Aurélio Tavares|Conservador|i:880000:2026-07-11\ncd44|Sandra Fischer Lacerda|Moderado|i:1022000:2026-01-14;a:288000:2026-05-16\ncd45|Diego Malheiros Antunes|Arrojado|i:3387000:2025-12-26;a:955000:2026-05-08\ncd46|Elaine Barroso Villaça|Conservador|i:882000:2026-02-13;a:249000:2026-05-29\ncd47|Rogério Sant’Anna Peixoto|Moderado|i:1101000:2026-01-04;a:311000:2026-05-12\ncd48|Carolina Pilar Medeiros|Arrojado|i:880000:2026-07-14\ncd49|Everton Grisa Sanhudo|Conservador|i:880000:2026-05-25\ncd50|Michele Arantes Coelho|Moderado|i:880000:2026-07-28\ncd51|Wagner Nobre Trindade|Arrojado|i:3755000:2025-11-27;a:1059000:2026-04-26;r:385000:2026-06-09\ncd52|Aline Zimmer Carvalhaes|Conservador|i:880000:2026-06-17\ncd53|Maurício Guimarães Setúbal|Moderado|i:3594000:2025-12-10;a:1014000:2026-05-02\ncd54|Débora Falcão Ribas|Arrojado|i:807000:2026-03-02;a:227000:2026-06-05\ncd55|José Ricardo Assunção|Conservador|i:3857000:2025-11-19;a:1088000:2026-04-23;r:396000:2026-06-07\ncd56|Silvia Munhoz Almeida|Moderado|i:3334000:2025-12-31;a:940000:2026-05-10\ncd57|Caio Bertolucci Ramires|Arrojado|i:1013000:2026-01-16;a:286000:2026-05-17\ncd58|Natália Wolff Siqueira|Conservador|i:880000:2026-08-06\ncd59|Emerson Padilha Castro|Moderado|i:880000:2026-07-31\ncd60|Gabriela Fontes Barreiros|Arrojado|i:880000:2026-04-04\ncd61|Nelson Aquino Villar|Conservador|i:880000:2026-04-19\ncd62|Raquel Bonini Delgado|Moderado|i:880000:2026-05-14\ncd63|Ivan Schuback Fialho|Arrojado|i:904000:2026-04-03\ncd64|Letícia Aranha Pontual|Conservador|i:3419000:2025-12-24;a:964000:2026-05-08\ncd65|Osvaldo Ferrari Junqueira|Moderado|i:880000:2026-07-02";
var _cstCarts=null;
function cstCarteiras(){
  if(_cstCarts) return _cstCarts;
  _cstCarts = CST_RAW.split('\n').filter(Boolean).map(function(l){
    var p=l.split('|');
    var movs=p[3].split(';').map(function(m){
      var q=m.split(':');
      return {tipo:q[0]==='r'?'resgate':'aporte', valor:+q[1], data:q[2],
              obs:q[0]==='r'?'Resgate parcial':(q[0]==='i'?'Aporte inicial':'Aporte adicional')};
    });
    return {id:p[0], nome:p[1], perfil:p[2], inicio:movs[0].data, demo:true, movimentos:movs};
  });
  return _cstCarts;
}

/* ------------------------- ESTADO DA TELA ------------------------- */
var cstView = {modo:'geral', id:null, busca:'', perfil:'', ord:'pat'};
function cstAbrir(id){ cstView.modo='cliente'; cstView.id=id; render(); window.scrollTo(0,0); }
function cstVoltar(){ cstView.modo='geral'; cstView.id=null; render(); window.scrollTo(0,0); }
function cstSetBusca(v){ cstView.busca=v; cstListaHTML(true); }
function cstSetPerfil(v){ cstView.perfil=v; cstListaHTML(true); }
function cstSetOrd(v){ cstView.ord=v; cstListaHTML(true); }

/* ------------------------- HELPERS DE FORMATO ------------------------- */
function _nb(v,d){ return (+v||0).toFixed(d===undefined?2:d).replace('.',','); }
function _pc(v,d){ var n=(+v||0); return (n>0?'+':'')+_nb(n,d)+'%'; }
function _cls(v){ return (+v||0)>=0 ? 'cst-up' : 'cst-dn'; }
function _dt(iso){ if(!iso) return '—'; var p=String(iso).split('-'); return p[2]+'/'+p[1]+'/'+p[0]; }
function _mi(v){ v=+v||0; return v>=1e6 ? 'R$ '+(v/1e6).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+' mi'
                        : v>=1e3 ? 'R$ '+(v/1e3).toLocaleString('pt-BR',{maximumFractionDigits:0})+' mil' : BRL(v); }
function _ini(n){ var p=String(n||'').trim().split(/\s+/); return ((p[0]||'')[0]||'')+((p[p.length-1]||'')[0]||''); }

/* ------------------------- CSS ------------------------- */
function cstCSS(){
  if(document.getElementById('cstCSS')) return;
  var st=document.createElement('style'); st.id='cstCSS';
  st.textContent=[
  '.cst-wrap{display:flex;flex-direction:column;gap:16px}',
  '.cst-head{display:flex;align-items:center;gap:12px;flex-wrap:wrap}',
  '.cst-head h2{margin:0;font-size:23px;letter-spacing:.2px}',
  '.cst-demo{font-size:11px;font-weight:600;letter-spacing:.4px;text-transform:uppercase;padding:4px 10px;border-radius:999px;background:rgba(197,160,89,.14);color:#C5A059;border:1px solid rgba(197,160,89,.35)}',
  '.cst-sub{color:var(--muted,#9DB5B1);font-size:13px;margin:0}',
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
  '.cst-perfil .nm b{font-size:15px}',
  '.cst-perfil .nm span{font-size:12px;color:var(--muted,#9DB5B1)}',
  '.cst-perfil .big{font-size:26px;font-weight:700;color:var(--pc,#C5A059);line-height:1;letter-spacing:-.5px}',
  '.cst-perfil .big small{font-size:12px;font-weight:500;color:var(--muted,#9DB5B1);display:block;margin-top:5px;letter-spacing:0}',
  '.cst-mini{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,.07)}',
  '.cst-mini div{font-size:12px;color:var(--muted,#9DB5B1)}',
  '.cst-mini b{display:block;color:var(--txt,#EAF3F1);font-size:14px;margin-top:2px;font-weight:600}',
  '.cst-tb{width:100%;border-collapse:collapse;font-size:13px}',
  '.cst-tb th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--muted,#9DB5B1);font-weight:600;padding:9px 10px;border-bottom:1px solid rgba(255,255,255,.09);white-space:nowrap}',
  '.cst-tb td{padding:11px 10px;border-bottom:1px solid rgba(255,255,255,.05)}',
  '.cst-tb tbody tr{cursor:pointer;transition:background .15s}',
  '.cst-tb tbody tr:hover{background:rgba(197,160,89,.07)}',
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
  '.cst-at{padding:11px 0;border-bottom:1px solid rgba(255,255,255,.05)}',
  '.cst-at:last-child{border-bottom:0}',
  '.cst-at .t{display:flex;justify-content:space-between;gap:10px;font-size:13px}',
  '.cst-at .t b{font-weight:500}.cst-at .t span{color:var(--muted,#9DB5B1);font-variant-numeric:tabular-nums}',
  '.cst-fil{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px}',
  '.cst-fil input,.cst-fil select{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);color:inherit;border-radius:10px;padding:9px 12px;font:inherit;font-size:13px;outline:none}',
  '.cst-fil input{flex:1;min-width:150px}',
  '.cst-fil input:focus,.cst-fil select:focus{border-color:#C5A059}',
  '.cst-back{background:none;border:0;color:#C5A059;font:inherit;font-size:13px;cursor:pointer;padding:0;display:inline-flex;align-items:center;gap:6px}',
  '.cst-back:hover{text-decoration:underline}',
  '.cst-note{font-size:12px;color:var(--muted,#9DB5B1);line-height:1.55;background:rgba(197,160,89,.07);border:1px solid rgba(197,160,89,.2);border-radius:12px;padding:12px 14px}',
  '.cst-hero{display:flex;align-items:center;gap:14px;flex-wrap:wrap}',
  '.cst-hero .cst-av{width:52px;height:52px;flex:0 0 52px;font-size:17px}',
  '.cst-hero h2{margin:0;font-size:22px}',
  'body.light .cst-kpi,body.light .cst-card,body.light .cst-perfil{border-color:rgba(14,74,65,.14)}',
  'body.light .cst-tb th{border-bottom-color:rgba(14,74,65,.16)}',
  'body.light .cst-tb td{border-bottom-color:rgba(14,74,65,.09)}',
  'body.light .cst-tb tbody tr:hover{background:rgba(14,74,65,.05)}',
  'body.light .cst-fil input,body.light .cst-fil select{background:rgba(14,74,65,.04);border-color:rgba(14,74,65,.2)}',
  'body.light .cst-bar{background:rgba(14,74,65,.1)}',
  '@media(max-width:900px){.cst-grid2{grid-template-columns:1fr}.cst-chart{height:210px}}',
  '@media(max-width:560px){.cst-kpis{grid-template-columns:1fr 1fr}.cst-kpi .v{font-size:19px}.cst-head h2{font-size:20px}}'
  ].join('');
  document.head.appendChild(st);
}

/* ------------------------- TELA GERAL ------------------------- */
function cstRenderGeral(C){
  var carts=cstCarteiras();
  var tot=0, ap=0, rg=0, rec=0, porPerfil={}, faixas={};
  carts.forEach(function(c){
    var p=cstPosicao(c), f=cstFee(p.patrimonio);
    tot+=p.patrimonio; ap+=p.aportado; rg+=p.resgatado; rec+=f.mensal;
    if(!porPerfil[c.perfil]) porPerfil[c.perfil]={n:0,pat:0};
    porPerfil[c.perfil].n++; porPerfil[c.perfil].pat+=p.patrimonio;
    if(!faixas[f.faixa]) faixas[f.faixa]={n:0,pat:0,rec:0,taxa:f.taxa};
    faixas[f.faixa].n++; faixas[f.faixa].pat+=p.patrimonio; faixas[f.faixa].rec+=f.mensal;
  });
  var liq=ap-rg, res=tot-liq, resPc=liq>0?(res/liq*100):0;

  var kpis=[
    ['Patrimônio sob custódia', _mi(tot), carts.length+' carteiras ativas', 'gold'],
    ['Receita mensal', BRL(rec), 'fee médio '+(tot>0?_nb(rec*12/tot*100):'0')+'% a.a.', 'gold'],
    ['Receita anual', _mi(rec*12), 'projetada sobre a custódia atual', ''],
    ['Resultado gerado', _mi(res), _pc(resPc)+' sobre o capital', ''],
    ['Captação líquida', _mi(liq), _mi(ap)+' aportado · '+_mi(rg)+' resgatado', ''],
    ['Ticket médio', _mi(carts.length?tot/carts.length:0), 'por cliente', '']
  ];

  var perfisHTML=Object.keys(CST_PERFIS).map(function(p){
    var P=CST_PERFIS[p], m=cstMetricas(p), d=porPerfil[p]||{n:0,pat:0};
    return '<div class="cst-perfil" style="--pc:'+P.cor+'">'+
      '<div class="nm"><b>'+p+'</b><span>'+d.n+' cliente'+(d.n===1?'':'s')+'</span></div>'+
      '<div class="big">'+_pc(m.acum)+'<small>no período · meta '+P.meta+'% a.a.</small></div>'+
      '<div class="cst-mini">'+
        '<div>Patrimônio<b>'+_mi(d.pat)+'</b></div>'+
        '<div>Anualizado<b class="'+_cls(m.ano)+'">'+_pc(m.ano,1)+'</b></div>'+
        '<div>Volatilidade<b>'+_nb(m.vol)+'%</b></div>'+
        '<div>Sharpe<b>'+_nb(m.sharpe)+'</b></div>'+
      '</div></div>';
  }).join('');

  var faixasHTML=CST_FEE.map(function(f){
    var d=faixas[f.rot]; if(!d) return '';
    return '<tr style="cursor:default"><td>'+esc(f.rot)+'</td>'+
      '<td class="num">'+_nb(f.taxa)+'% a.a.</td>'+
      '<td class="num">'+d.n+'</td>'+
      '<td class="num">'+_mi(d.pat)+'</td>'+
      '<td class="num" style="color:#C5A059;font-weight:600">'+BRL(d.rec)+'</td></tr>';
  }).join('');

  C.innerHTML =
  '<div class="cst-wrap">'+
    '<div>'+
      '<div class="cst-head"><h2>Consultoria</h2><span class="cst-demo">dados de demonstração</span></div>'+
      '<p class="cst-sub">Gestão discricionária de carteiras líquidas · contabilização diária por cota</p>'+
    '</div>'+

    '<div class="cst-kpis">'+kpis.map(function(k){
      return '<div class="cst-kpi '+k[3]+'"><div class="l">'+k[0]+'</div><div class="v">'+k[1]+'</div><div class="d">'+k[2]+'</div></div>';
    }).join('')+'</div>'+

    '<div class="cst-grid2">'+
      '<div class="cst-card"><h3>Patrimônio sob custódia</h3><p class="hint">Evolução diária desde o início da operação</p>'+
        '<div class="cst-chart"><canvas id="cstChartCust"></canvas></div></div>'+
      '<div class="cst-card"><h3>Estratégias</h3><p class="hint">Cota de cada perfil, base 100</p>'+
        '<div class="cst-chart"><canvas id="cstChartPerfis"></canvas></div></div>'+
    '</div>'+

    '<div class="cst-perfis">'+perfisHTML+'</div>'+

    '<div class="cst-card"><h3>Receita por faixa de patrimônio</h3>'+
      '<p class="hint">Taxa de consultoria cobrada ao ano, dividida em 12 parcelas mensais</p>'+
      '<div class="cst-scroll"><table class="cst-tb"><thead><tr>'+
        '<th>Faixa</th><th class="num">Taxa</th><th class="num">Clientes</th><th class="num">Patrimônio</th><th class="num">Receita / mês</th>'+
      '</tr></thead><tbody>'+faixasHTML+
      '<tr style="cursor:default;font-weight:600"><td>Total</td><td class="num">'+(tot>0?_nb(rec*12/tot*100):'0')+'% a.a.</td>'+
      '<td class="num">'+carts.length+'</td><td class="num">'+_mi(tot)+'</td>'+
      '<td class="num" style="color:#C5A059">'+BRL(rec)+'</td></tr>'+
      '</tbody></table></div></div>'+

    '<div class="cst-card"><h3>Carteiras</h3><p class="hint">Clique em um cliente para abrir a carteira dele</p>'+
      '<div class="cst-fil">'+
        '<input id="cstBusca" type="search" placeholder="Buscar cliente..." value="'+esc(cstView.busca)+'" oninput="cstSetBusca(this.value)">'+
        '<select onchange="cstSetPerfil(this.value)">'+
          ['','Conservador','Moderado','Arrojado'].map(function(p){
            return '<option value="'+p+'"'+(cstView.perfil===p?' selected':'')+'>'+(p||'Todos os perfis')+'</option>';
          }).join('')+
        '</select>'+
        '<select onchange="cstSetOrd(this.value)">'+
          [['pat','Maior patrimônio'],['rent','Maior rentabilidade'],['novo','Mais recentes'],['nome','Nome (A-Z)']].map(function(o){
            return '<option value="'+o[0]+'"'+(cstView.ord===o[0]?' selected':'')+'>'+o[1]+'</option>';
          }).join('')+
        '</select>'+
      '</div>'+
      '<div class="cst-scroll" id="cstLista"></div></div>'+

    '<p class="cst-note"><b>Sobre estes números.</b> As carteiras acima são uma base de demonstração '+
    'construída sobre a meta de cada perfil — servem para apresentar a ferramenta, não são rentabilidade '+
    'realizada. Assim que a primeira carteira real for lançada, a cota efetiva passa a alimentar todos os '+
    'cálculos desta tela e a base de demonstração sai.</p>'+
  '</div>';

  cstListaHTML();
  cstGraficos();
}

/* lista de clientes (redesenhada sozinha nos filtros, sem re-render da tela toda) */
function cstListaHTML(soLista){
  var el=document.getElementById('cstLista'); if(!el) return;
  var q=(cstView.busca||'').toLowerCase().trim();
  var linhas=cstCarteiras().filter(function(c){
    if(cstView.perfil && c.perfil!==cstView.perfil) return false;
    if(q && c.nome.toLowerCase().indexOf(q)<0) return false;
    return true;
  }).map(function(c){
    var p=cstPosicao(c), f=cstFee(p.patrimonio);
    var rent=p.investido>0?(p.lucro/p.investido*100):0;
    return {c:c,p:p,f:f,rent:rent};
  });
  var ord=cstView.ord;
  linhas.sort(function(a,b){
    if(ord==='rent') return b.rent-a.rent;
    if(ord==='novo') return a.c.inicio<b.c.inicio?1:-1;
    if(ord==='nome') return a.c.nome.localeCompare(b.c.nome,'pt-BR');
    return b.p.patrimonio-a.p.patrimonio;
  });
  if(!linhas.length){
    el.innerHTML='<p class="cst-sub" style="padding:22px 0;text-align:center">Nenhum cliente encontrado.</p>';
    return;
  }
  el.innerHTML='<table class="cst-tb"><thead><tr>'+
    '<th>Cliente</th><th>Perfil</th><th>Desde</th>'+
    '<th class="num">Patrimônio</th><th class="num">Rentabilidade</th><th class="num">Fee / mês</th>'+
    '</tr></thead><tbody>'+
    linhas.map(function(r){
      var cor=(CST_PERFIS[r.c.perfil]||{}).cor||'#C5A059';
      return '<tr onclick="cstAbrir(\''+r.c.id+'\')" style="--pc:'+cor+'">'+
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
  var cart=cstCarteiras().filter(function(c){return c.id===cstView.id;})[0];
  if(!cart){ cstVoltar(); return; }
  var P=CST_PERFIS[cart.perfil]||CST_PERFIS.Conservador;
  var p=cstPosicao(cart), f=cstFee(p.patrimonio), m=cstMetricas(cart.perfil, cart.inicio);
  var rent=p.investido>0?(p.lucro/p.investido*100):0;

  var kpis=[
    ['Patrimônio', BRL(p.patrimonio), p.cotas.toLocaleString('pt-BR',{maximumFractionDigits:4})+' cotas', 'gold'],
    ['Capital investido', BRL(p.investido), _mi(p.aportado)+' aportado'+(p.resgatado>0?' · '+_mi(p.resgatado)+' resgatado':''), ''],
    ['Resultado', BRL(p.lucro), _pc(rent)+' sobre o investido', ''],
    ['No período', _pc(m.acum), 'desde '+_dt(cart.inicio), ''],
    ['Últimos 30 dias', _pc(m.mes), 'variação da cota', ''],
    ['Índice Sharpe', _nb(m.sharpe), 'retorno por risco (CDI '+CST_CDI+'%)', '']
  ];

  var ativos=(CST_ATIVOS[cart.perfil]||[]).map(function(a){
    return '<div class="cst-at"><div class="t"><b>'+esc(a[0])+'</b><span>'+a[1]+'%</span></div>'+
      '<div class="cst-bar"><i style="width:'+a[1]+'%"></i></div></div>';
  }).join('');

  var extrato=p.extrato.map(function(e){
    var pos=e.tipo!=='resgate';
    return '<tr style="cursor:default"><td style="white-space:nowrap">'+_dt(e.data)+'</td>'+
      '<td>'+esc(e.obs)+'</td>'+
      '<td class="num">'+e.cota.toLocaleString('pt-BR',{minimumFractionDigits:4,maximumFractionDigits:4})+'</td>'+
      '<td class="num">'+(pos?'':'-')+e.cotas.toLocaleString('pt-BR',{maximumFractionDigits:4})+'</td>'+
      '<td class="num '+(pos?'cst-up':'cst-dn')+'"><b>'+(pos?'+':'−')+' '+BRL(e.valor)+'</b></td></tr>';
  }).join('');

  C.innerHTML =
  '<div class="cst-wrap" style="--pc:'+P.cor+'">'+
    '<button class="cst-back" onclick="cstVoltar()">&larr; Todas as carteiras</button>'+

    '<div class="cst-hero">'+
      '<span class="cst-av">'+esc(_ini(cart.nome))+'</span>'+
      '<div style="min-width:0">'+
        '<h2>'+esc(cart.nome)+'</h2>'+
        '<p class="cst-sub">Perfil '+esc(cart.perfil)+' · cliente desde '+_dt(cart.inicio)+'</p>'+
      '</div>'+
      '<span class="cst-chip" style="margin-left:auto">'+esc(cart.perfil)+'</span>'+
    '</div>'+

    '<div class="cst-kpis">'+kpis.map(function(k){
      return '<div class="cst-kpi '+k[3]+'"><div class="l">'+k[0]+'</div><div class="v '+
        (k[0]==='Resultado'||k[0]==='No período'||k[0]==='Últimos 30 dias' ? _cls(parseFloat(String(k[1]).replace(/[^\d,.\-+]/g,'').replace('.','').replace(',','.'))) : '')+
        '">'+k[1]+'</div><div class="d">'+k[2]+'</div></div>';
    }).join('')+'</div>'+

    '<div class="cst-card"><h3>Evolução da carteira</h3>'+
      '<p class="hint">Patrimônio dia a dia · estratégia '+esc(cart.perfil)+'</p>'+
      '<div class="cst-chart" style="height:280px"><canvas id="cstChartCli"></canvas></div></div>'+

    '<div class="cst-grid2">'+
      '<div class="cst-card"><h3>Composição da carteira</h3>'+
        '<p class="hint">Alocação-alvo da estratégia '+esc(cart.perfil)+'</p>'+ativos+'</div>'+
      '<div class="cst-card"><h3>Taxa de consultoria</h3><p class="hint">'+esc(f.faixa)+'</p>'+
        '<div class="cst-kpi" style="border:0;padding:0;background:none">'+
          '<div class="v" style="color:#C5A059;font-size:30px">'+_nb(f.taxa)+'%<span style="font-size:14px;color:var(--muted,#9DB5B1);font-weight:500"> ao ano</span></div>'+
        '</div>'+
        '<div class="cst-mini" style="grid-template-columns:1fr 1fr">'+
          '<div>Cobrança mensal<b>'+BRL2(f.mensal)+'</b></div>'+
          '<div>Total no ano<b>'+BRL(f.anual)+'</b></div>'+
        '</div>'+
        '<p class="hint" style="margin:14px 0 0">Calculada sobre o patrimônio sob gestão e dividida em 12 parcelas.</p>'+
      '</div>'+
    '</div>'+

    '<div class="cst-card"><h3>Extrato</h3><p class="hint">Aportes e resgates, com a cota de cada movimentação</p>'+
      '<div class="cst-scroll"><table class="cst-tb"><thead><tr>'+
        '<th>Data</th><th>Movimentação</th><th class="num">Cota</th><th class="num">Cotas</th><th class="num">Valor</th>'+
      '</tr></thead><tbody>'+extrato+'</tbody></table></div></div>'+
  '</div>';

  cstGraficoCliente(cart);
}

/* ------------------------- GRÁFICOS ------------------------- */
function _cstEixoMoeda(){
  return {ticks:{callback:function(v){return _mi(v);},maxTicksLimit:6},grid:{color:'rgba(255,255,255,.05)'}};
}
function _cstEixoData(labels){
  return {ticks:{maxTicksLimit:7,autoSkip:true,callback:function(v,i){var d=labels[i]; return d?d.slice(8,10)+'/'+d.slice(5,7):'';}},
          grid:{display:false}};
}
function cstGraficos(){
  var cust=cstSerieCustodia();
  var lab=cust.map(function(x){return x.data;});
  mkChart('cstChartCust',{
    type:'line',
    data:{labels:lab,datasets:[{
      data:cust.map(function(x){return x.valor;}),
      borderColor:'#C5A059', borderWidth:2, fill:true, tension:.25,
      pointRadius:0, pointHoverRadius:4, pointHoverBackgroundColor:'#C5A059',
      backgroundColor:function(ctx){
        var a=ctx.chart.ctx, g=a.createLinearGradient(0,0,0,240);
        g.addColorStop(0,'rgba(197,160,89,.30)'); g.addColorStop(1,'rgba(197,160,89,0)'); return g;
      }
    }]},
    options:{plugins:{legend:{display:false},tooltip:{callbacks:{
      title:function(t){return _dt(t[0].label);},
      label:function(c){return 'Custódia: '+BRL(c.parsed.y);}}}},
      interaction:{mode:'index',intersect:false},
      scales:{y:_cstEixoMoeda(), x:_cstEixoData(lab)}}
  });

  var perfis=Object.keys(CST_PERFIS), base=cstSerie(perfis[0]);
  mkChart('cstChartPerfis',{
    type:'line',
    data:{labels:base.map(function(x){return x.data;}),
      datasets:perfis.map(function(p){
        var s=cstSerie(p);
        return {label:p, data:s.map(function(x){return x.cota/10;}),
                borderColor:CST_PERFIS[p].cor, borderWidth:2, fill:false, tension:.25,
                pointRadius:0, pointHoverRadius:4};
      })},
    options:{plugins:{legend:{display:true,position:'bottom',labels:{boxWidth:9,boxHeight:9,usePointStyle:true,pointStyle:'circle',padding:14,font:{size:11}}},
      tooltip:{callbacks:{title:function(t){return _dt(t[0].label);},
        label:function(c){return c.dataset.label+': '+_nb(c.parsed.y);}}}},
      interaction:{mode:'index',intersect:false},
      scales:{y:{ticks:{maxTicksLimit:6},grid:{color:'rgba(255,255,255,.05)'}},
              x:_cstEixoData(base.map(function(x){return x.data;}))}}
  });
}
function cstGraficoCliente(cart){
  var s=cstSerie(cart.perfil), cor=(CST_PERFIS[cart.perfil]||{}).cor||'#C5A059';
  var movs=(cart.movimentos||[]).slice().sort(function(a,b){return a.data<b.data?-1:1;});
  var cotas=0, k=0, pts=[], lab=[];
  s.forEach(function(pt){
    if(pt.data<cart.inicio) return;
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
      backgroundColor:function(ctx){
        var a=ctx.chart.ctx, g=a.createLinearGradient(0,0,0,270);
        g.addColorStop(0, cor+'4D'); g.addColorStop(1, cor+'00'); return g;
      }
    }]},
    options:{plugins:{legend:{display:false},tooltip:{callbacks:{
      title:function(t){return _dt(t[0].label);},
      label:function(c){return 'Patrimônio: '+BRL(c.parsed.y);}}}},
      interaction:{mode:'index',intersect:false},
      scales:{y:_cstEixoMoeda(), x:_cstEixoData(lab)}}
  });
}

/* ------------------------- ENTRADA ------------------------- */
function renderConsultoria(C){
  cstCSS();
  if(cstView.modo==='cliente') return cstRenderCliente(C);
  return cstRenderGeral(C);
}

/* expõe o que o plataforma.html chama */
window.renderConsultoria = renderConsultoria;
window.cstAbrir = cstAbrir;
window.cstVoltar = cstVoltar;
window.cstSetBusca = cstSetBusca;
window.cstSetPerfil = cstSetPerfil;
window.cstSetOrd = cstSetOrd;
window.cstCarteiras = cstCarteiras;
window.cstPosicao = cstPosicao;
window.cstFee = cstFee;
window.cstMetricas = cstMetricas;
window.CST_PERFIS = CST_PERFIS;
window.__CST_OK = true;
})();
