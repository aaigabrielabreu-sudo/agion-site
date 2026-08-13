/* =====================================================================
   AGION WEALTH — CONSULTORIA
   Carregado pelo plataforma.html via <script src>. Prefixo cst*.
   Host: esc() BRL() BRL2() mkChart() render() db save() flash() supa
         session meId() isMaster() isStaff() effRole()
   ===================================================================== */
(function(){
'use strict';

var CST_PERFIS = {
  Conservador:{meta:15.50, vol:2.4, cor:'#7FD1C1'},
  Moderado:   {meta:16.37, vol:4.2, cor:'#C5A059'},
  Arrojado:   {meta:20.03, vol:6.8, cor:'#E0B978'}
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

/* ===================== MOTOR ===================== */
function _h(s){var h=2166136261,i;for(i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0)/4294967295;}
function _util(d){var w=d.getDay();return w!==0&&w!==6;}
function _iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function cstHoje(){ return _iso(new Date()); }

var _cache={};
function cstSerie(cart){
  var ck = cart.id+'|'+cart.inicio+'|'+cart.perfil+'|'+cstHoje();
  if(_cache[ck]) return _cache[ck];
  var P = CST_PERFIS[cart.perfil] || CST_PERFIS.Conservador;
  var sd = (P.vol/100)/Math.sqrt(CST_DU);
  var rd = Math.pow(1+P.meta/100, 1/CST_DU)-1 + (sd*sd)/2;
  var d = new Date(cart.inicio+'T12:00:00'), fim = new Date(); fim.setHours(12,0,0,0);
  var dias=[], g=0;
  while(d<=fim && g++<6000){ if(_util(d)) dias.push(_iso(d)); d.setDate(d.getDate()+1); }
  if(!dias.length) dias=[cart.inicio];
  var zs = dias.map(function(x){ return (_h(cart.id+'|'+x)-0.5)*3.4641; });
  var med = zs.reduce(function(a,b){return a+b;},0)/Math.max(1,zs.length);
  var out=[{data:dias[0],cota:1000}], c=1000, i;
  for(i=1;i<dias.length;i++){ c=c*(1+rd+(zs[i]-med)*sd); out.push({data:dias[i],cota:c}); }
  _cache[ck]=out; return out;
}
function cstLimpaCache(){ _cache={}; }
function cotaEm(s,d){var c=s[0].cota,i;for(i=0;i<s.length;i++){if(s[i].data<=d)c=s[i].cota;else break;}return c;}

function cstPosicao(cart){
  var s=cstSerie(cart), cotas=0, ap=0, rg=0, ext=[];
  (cart.movimentos||[]).slice().sort(function(a,b){return a.data<b.data?-1:1;}).forEach(function(m){
    var c=cotaEm(s,m.data), v=+m.valor||0, q=v/c;
    if(m.tipo==='resgate'){cotas-=q; rg+=v;} else {cotas+=q; ap+=v;}
    ext.push({data:m.data,tipo:m.tipo,valor:v,cota:c,cotas:q,obs:m.obs||''});
  });
  var ch=s[s.length-1].cota;
  return {cotas:cotas, cotaHoje:ch, patrimonio:cotas*ch, aportado:ap, resgatado:rg,
          lucro:cotas*ch-(ap-rg), investido:ap-rg, extrato:ext.reverse()};
}
function cstMetricas(cart){
  var s=cstSerie(cart);
  if(s.length<2) return {acum:0,ano:0,vol:0,sharpe:0,dd:0,dias:s.length,mes:0,dia:0};
  var r=[],i; for(i=1;i<s.length;i++) r.push(s[i].cota/s[i-1].cota-1);
  var acum=s[s.length-1].cota/s[0].cota-1;
  var anos=s.length/CST_DU, ano=anos>0?(Math.pow(1+acum,1/anos)-1):0;
  var m=r.reduce(function(a,b){return a+b;},0)/r.length;
  var vol=Math.sqrt(r.reduce(function(a,b){return a+(b-m)*(b-m);},0)/Math.max(1,r.length-1))*Math.sqrt(CST_DU);
  var pk=-Infinity, dd=0;
  s.forEach(function(x){ if(x.cota>pk)pk=x.cota; var q=x.cota/pk-1; if(q<dd)dd=q; });
  var i30=s.length>21?s[s.length-22].cota:s[0].cota;
  return {acum:acum*100, ano:ano*100, vol:vol*100, sharpe:vol>0?(ano-CST_CDI/100)/vol:0,
          dd:dd*100, dias:s.length, mes:(s[s.length-1].cota/i30-1)*100,
          dia:r.length?r[r.length-1]*100:0};
}
function cstFee(p){
  p=Math.max(0,+p||0);
  var f=CST_FEE.filter(function(x){return p<=x.ate;})[0]||CST_FEE[2];
  return {taxa:f.taxa, faixa:f.rot, anual:p*(f.taxa/100), mensal:p*(f.taxa/100)/12};
}
function cstSerieCustodia(lista){
  var carts=lista||cstCarteiras(); if(!carts.length) return [];
  var mapa={};
  carts.forEach(function(c){
    var s=cstSerie(c), movs=(c.movimentos||[]).slice().sort(function(a,b){return a.data<b.data?-1:1;});
    var k=0, cotas=0;
    s.forEach(function(pt){
      while(k<movs.length && movs[k].data<=pt.data){
        var q=(+movs[k].valor||0)/cotaEm(s,movs[k].data);
        cotas += (movs[k].tipo==='resgate' ? -q : q); k++;
      }
      mapa[pt.data]=(mapa[pt.data]||0)+cotas*pt.cota;
    });
  });
  return Object.keys(mapa).sort().map(function(d){ return {data:d, valor:mapa[d]}; });
}

/* ===================== DADOS (Supabase + local) ===================== */
var CST_RAW = "cd01|Ricardo Salgado Vieira|Conservador|i:880000:2026-06-08\ncd02|Helena Marchetti Prado|Moderado|i:880000:2026-06-25\ncd03|Otávio Bernardes Lima|Arrojado|i:880000:2026-07-14\ncd04|Camila Fontoura Rezende|Conservador|i:880000:2026-05-06\ncd05|Eduardo Tannure Nogueira|Moderado|i:880000:2026-06-10\ncd06|Patrícia Vasconcelos Amaral|Arrojado|i:880000:2026-07-20\ncd07|Leonardo Bittencourt Sá|Conservador|i:6461000:2026-07-30\ncd08|Juliana Weber Krieger|Moderado|i:957000:2026-02-05;a:270000:2026-05-26\ncd09|Marcelo Andrade Pontes|Arrojado|i:939000:2026-03-26\ncd10|Renata Colombo Bianchi|Conservador|i:3682000:2025-12-08;a:1038000:2026-05-01\ncd11|Fernando Queiroz Malta|Moderado|i:983000:2026-03-16\ncd12|Beatriz Sampaio Duarte|Arrojado|i:880000:2026-05-27\ncd13|Augusto Vilella Caminha|Conservador|i:880000:2026-07-16\ncd14|Larissa Toledo Bandeira|Moderado|i:3563000:2025-12-18;a:1005000:2026-05-05\ncd15|Rodrigo Menescal Aguiar|Arrojado|i:3415000:2025-12-30;a:963000:2026-05-10\ncd16|Cristina Vasques Portela|Conservador|i:880000:2026-07-27\ncd17|Thiago Rennó Cavalcanti|Moderado|i:839000:2026-03-03;a:236000:2026-06-06\ncd18|Vanessa Klein Sobral|Arrojado|i:880000:2026-06-21\ncd19|Gustavo Peçanha Motta|Conservador|i:880000:2026-05-16\ncd20|Adriana Rocha Bulhões|Moderado|i:880000:2026-08-03\ncd21|Henrique Vasconcelos Tourinho|Arrojado|i:880000:2026-05-04\ncd22|Mariana Stein Guedes|Conservador|i:880000:2026-05-12\ncd23|Paulo Cesar Meireles Fagundes|Moderado|i:880000:2026-06-20\ncd24|Luciana Braga Werneck|Arrojado|i:6732000:2025-11-26;a:1899000:2026-04-26;r:690000:2026-06-09\ncd25|Felipe Adorno Vilhena|Conservador|i:880000:2026-07-25\ncd26|Simone Kraemer Dutra|Moderado|i:880000:2026-07-25\ncd27|André Luiz Corrêa Belmonte|Arrojado|i:835000:2026-02-28;a:235000:2026-06-04\ncd28|Tatiana Ferraz Bonfim|Conservador|i:1113000:2026-01-06;a:314000:2026-05-13\ncd29|Rafael Monteiro Estrella|Moderado|i:3457000:2025-12-26;a:975000:2026-05-08\ncd30|Cláudia Reinehr Vasques|Arrojado|i:880000:2026-05-14\ncd31|Sérgio Bandeira Machado|Conservador|i:930000:2026-03-28\ncd32|Isabela Franco Loureiro|Moderado|i:3705000:2025-12-07;a:1045000:2026-04-30;r:380000:2026-06-12\ncd33|Vinícius Sarmento Pires|Arrojado|i:3995000:2025-11-14;a:1127000:2026-04-21;r:410000:2026-06-06\ncd34|Fabiana Loureiro Mendonça|Conservador|i:880000:2026-05-20\ncd35|Alexandre Pimentel Vidal|Moderado|i:880000:2026-06-26\ncd36|Roberta Castilho Nunes|Arrojado|i:1029000:2026-01-21;a:290000:2026-05-19\ncd37|Bruno Cavalheiro Assis|Conservador|i:874000:2026-02-18;a:246000:2026-05-31\ncd38|Daniela Ostermann Freire|Moderado|i:898000:2026-02-18;a:253000:2026-05-31\ncd39|Guilherme Mattoso Serpa|Arrojado|i:880000:2026-05-22\ncd40|Priscila Vidigal Rangel|Conservador|i:880000:2026-04-18\ncd41|Antônio Emílio Barcelos|Moderado|i:1083000:2026-01-06;a:305000:2026-05-13\ncd42|Verônica Sanches Bastos|Arrojado|i:6112000:2026-02-25;a:1724000:2026-06-03\ncd43|Márcio Aurélio Tavares|Conservador|i:880000:2026-07-11\ncd44|Sandra Fischer Lacerda|Moderado|i:1042000:2026-01-14;a:294000:2026-05-16\ncd45|Diego Malheiros Antunes|Arrojado|i:3455000:2025-12-26;a:974000:2026-05-08\ncd46|Elaine Barroso Villaça|Conservador|i:899000:2026-02-13;a:254000:2026-05-29\ncd47|Rogério Sant’Anna Peixoto|Moderado|i:1124000:2026-01-04;a:317000:2026-05-12\ncd48|Carolina Pilar Medeiros|Arrojado|i:880000:2026-07-14\ncd49|Everton Grisa Sanhudo|Conservador|i:880000:2026-05-25\ncd50|Michele Arantes Coelho|Moderado|i:880000:2026-07-28\ncd51|Wagner Nobre Trindade|Arrojado|i:3830000:2025-11-27;a:1080000:2026-04-26;r:393000:2026-06-09\ncd52|Aline Zimmer Carvalhaes|Conservador|i:880000:2026-06-17\ncd53|Maurício Guimarães Setúbal|Moderado|i:3666000:2025-12-10;a:1034000:2026-05-02\ncd54|Débora Falcão Ribas|Arrojado|i:822000:2026-03-02;a:232000:2026-06-05\ncd55|José Ricardo Assunção|Conservador|i:3934000:2025-11-19;a:1110000:2026-04-23;r:404000:2026-06-07\ncd56|Silvia Munhoz Almeida|Moderado|i:3400000:2025-12-31;a:959000:2026-05-10\ncd57|Caio Bertolucci Ramires|Arrojado|i:1034000:2026-01-16;a:291000:2026-05-17\ncd58|Natália Wolff Siqueira|Conservador|i:880000:2026-08-06\ncd59|Emerson Padilha Castro|Moderado|i:880000:2026-07-31\ncd60|Gabriela Fontes Barreiros|Arrojado|i:895000:2026-04-04\ncd61|Nelson Aquino Villar|Conservador|i:880000:2026-04-19\ncd62|Raquel Bonini Delgado|Moderado|i:880000:2026-05-14\ncd63|Ivan Schuback Fialho|Arrojado|i:922000:2026-04-03\ncd64|Letícia Aranha Pontual|Conservador|i:3487000:2025-12-24;a:984000:2026-05-08\ncd65|Osvaldo Ferrari Junqueira|Moderado|i:880000:2026-07-02";
var _base=null, _nuvem=null, _online=false, _carregando=false;

function _parseRaw(){
  if(_base) return _base;
  _base = CST_RAW.split('\n').filter(Boolean).map(function(l){
    var p=l.split('|');
    return {id:p[0], nome:p[1], perfil:p[2], exemplo:true,
      inicio:p[3].split(';')[0].split(':')[2],
      movimentos:p[3].split(';').map(function(m){
        var q=m.split(':');
        return {tipo:q[0]==='r'?'resgate':'aporte', valor:+q[1], data:q[2],
                obs:q[0]==='r'?'Resgate':(q[0]==='i'?'Aporte inicial':'Aporte')};
      })};
  });
  return _base;
}
function _sb(){ try{ return (typeof supa!=='undefined' && supa) ? supa : null; }catch(e){ return null; } }
function _local(){
  try{
    if(typeof db==='undefined'||!db) return {carteiras:[],removidos:[]};
    if(!db.consultoria) db.consultoria={carteiras:[],removidos:[]};
    if(!db.consultoria.carteiras) db.consultoria.carteiras=[];
    if(!db.consultoria.removidos) db.consultoria.removidos=[];
    return db.consultoria;
  }catch(e){ return {carteiras:[],removidos:[]}; }
}
function _daLinha(r){
  return {id:r.id, nome:r.nome, email:r.email, telefone:r.telefone, perfil:r.perfil,
          inicio:r.inicio, clienteId:r.cliente_id, ownerId:r.owner_id,
          movimentos:(r.movimentos||[]), nuvem:true};
}
/* carrega da nuvem; se a tabela não existir ainda, cai no local sem quebrar */
async function cstCarregar(){
  var sb=_sb(); if(!sb || _carregando) return _online;
  _carregando=true;
  try{
    var res = await sb.from('consultoria').select('*').eq('ativo',true).order('inicio',{ascending:false});
    if(res.error){ _online=false; }
    else { _nuvem = (res.data||[]).map(_daLinha); _online=true; }
  }catch(e){ _online=false; }
  _carregando=false; cstLimpaCache();
  return _online;
}
function cstOnline(){ return _online; }
function cstCarteiras(){
  var extras = _online ? (_nuvem||[]) : (_local().carteiras||[]);
  var rem = _local().removidos||[];
  var base = _parseRaw().filter(function(c){ return rem.indexOf(c.id)<0; });
  var vis = base.concat(extras);
  /* cliente logado vê só a carteira dele */
  try{
    if(typeof effRole==='function' && effRole()==='cliente'){
      var cid = (typeof session!=='undefined' && session) ? (session.clientId||session.cliente_id) : null;
      return vis.filter(function(c){ return cid && c.clienteId===cid; });
    }
  }catch(e){}
  return vis;
}
function cstPorId(id){ return cstCarteiras().filter(function(c){return c.id===id;})[0]; }
function cstEditavel(c){ return !!c && !c.exemplo; }

async function cstGravar(cart){
  var sb=_sb();
  if(sb && _online){
    try{
      var linha = {id:cart.id, nome:cart.nome, email:cart.email||null, telefone:cart.telefone||null,
        perfil:cart.perfil, inicio:cart.inicio, movimentos:cart.movimentos,
        cliente_id:cart.clienteId||null, ativo:true};
      try{ if(typeof meId==='function') linha.owner_id = cart.ownerId || meId(); }catch(e){}
      var r = await sb.from('consultoria').upsert(linha).select();
      if(!r.error){ await cstCarregar(); return true; }
    }catch(e){}
  }
  var st=_local();
  var i = st.carteiras.findIndex(function(c){return c.id===cart.id;});
  if(i<0) st.carteiras.push(cart); else st.carteiras[i]=cart;
  try{ if(typeof save==='function') save(); }catch(e){}
  cstLimpaCache(); return false;
}
async function cstRemover(id){
  var sb=_sb();
  if(sb && _online){
    try{ var r=await sb.from('consultoria').update({ativo:false}).eq('id',id);
         if(!r.error){ await cstCarregar(); return true; } }catch(e){}
  }
  var st=_local();
  st.carteiras = st.carteiras.filter(function(c){return c.id!==id;});
  try{ if(typeof save==='function') save(); }catch(e){}
  cstLimpaCache(); return false;
}

/* ===================== ESTADO ===================== */
var V = {modo:'geral', id:null, busca:'', perfil:'', ord:'pat', perfilNovo:'Conservador'};
function ir(modo,id){ V.modo=modo; V.id=id||null; if(typeof render==='function') render(); window.scrollTo(0,0); }
function cstAbrir(id){ ir('cliente',id); }
function cstVoltar(){ ir('geral'); }
function cstNovo(){ V.perfilNovo='Conservador'; ir('novo'); }

/* ===================== FORMATO ===================== */
function nb(v,d){ return (+v||0).toFixed(d===undefined?2:d).replace('.',','); }
function pc(v,d){ var n=+v||0; return (n>0?'+':n<0?'−':'')+nb(Math.abs(n),d===undefined?2:d)+'%'; }
function sinal(v){ return (+v||0)>=0?'up':'dn'; }
function dt(iso){ if(!iso) return '—'; var p=String(iso).split('-'); return p[2]+'/'+p[1]+'/'+p[0]; }
function dtx(iso){ var M=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  var p=String(iso||'').split('-'); return p[2]+' '+M[+p[1]-1]+' '+p[0]; }
function mi(v){ v=+v||0;
  if(Math.abs(v)>=1e6) return 'R$ '+(v/1e6).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+' mi';
  if(Math.abs(v)>=1e3) return 'R$ '+(v/1e3).toLocaleString('pt-BR',{maximumFractionDigits:0})+' mil';
  return BRL(v); }
function ini(n){ var p=String(n||'').trim().split(/\s+/); return ((p[0]||'')[0]||'')+((p[p.length-1]||'')[0]||''); }
function num(v){ var s=String(v==null?'':v).replace(/[^\d,.-]/g,'').replace(/\./g,'').replace(',','.'); var n=parseFloat(s); return isFinite(n)?n:0; }

/* ===================== ESTILO ===================== */
function cstCSS(){
  if(document.getElementById('cstCSS')) return;
  var s=document.createElement('style'); s.id='cstCSS';
  s.textContent=[
  /* base */
  '.cw{--g:#C5A059;--ln:rgba(255,255,255,.07);--mu:#93AAA6;display:flex;flex-direction:column;gap:34px;max-width:1240px;font-variant-numeric:tabular-nums}',
  'body.light .cw{--ln:rgba(14,74,65,.11);--mu:#5B7B75}',
  '.cw *{box-sizing:border-box}',
  /* topo */
  '.c-top{display:flex;align-items:flex-end;gap:20px;flex-wrap:wrap}',
  '.c-top h1{margin:0;font-size:15px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--mu)}',
  '.c-top .meta{font-size:13px;color:var(--mu);margin:5px 0 0}',
  /* botões */
  '.c-b{border:0;border-radius:10px;padding:11px 19px;font:inherit;font-size:13.5px;font-weight:600;cursor:pointer;transition:.16s;background:var(--g);color:#08201C;white-space:nowrap}',
  '.c-b:hover{filter:brightness(1.09);transform:translateY(-1px)}',
  '.c-b.o{background:transparent;color:var(--g);box-shadow:inset 0 0 0 1.5px rgba(197,160,89,.42)}',
  '.c-b.o:hover{background:rgba(197,160,89,.09);transform:none}',
  '.c-b.d{color:#E88B8B;box-shadow:inset 0 0 0 1.5px rgba(232,139,139,.35);background:transparent}',
  /* herói */
  '.c-hero{display:grid;grid-template-columns:1fr;gap:28px}',
  '.c-num{font-size:clamp(38px,6vw,60px);font-weight:700;letter-spacing:-.035em;line-height:.95;margin:0}',
  '.c-lab{font-size:11px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:var(--mu);margin:0 0 12px}',
  '.c-delta{display:inline-flex;align-items:center;gap:6px;font-size:14px;font-weight:600;margin-top:14px}',
  '.up{color:#5FD6A6}.dn{color:#E88B8B}',
  /* faixa de números secundários */
  '.c-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1px;background:var(--ln);border-radius:14px;overflow:hidden}',
  '.c-cell{background:var(--bg,#0A1F1C);padding:19px 20px}',
  'body.light .c-cell{background:#fff}',
  '.c-cell .k{font-size:10.5px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--mu);margin-bottom:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.c-cell .v{font-size:21px;font-weight:650;letter-spacing:-.02em;line-height:1.1}',
  '.c-cell .s{font-size:12px;color:var(--mu);margin-top:5px}',
  /* seção */
  '.c-sec{display:flex;flex-direction:column;gap:16px}',
  '.c-h{display:flex;align-items:baseline;justify-content:space-between;gap:16px;flex-wrap:wrap}',
  '.c-h h2{margin:0;font-size:12px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:var(--mu)}',
  '.c-h .sub{font-size:12.5px;color:var(--mu)}',
  /* gráfico sem moldura */
  '.c-gr{position:relative;height:300px;margin:0 -6px}',
  '.c-gr.sm{height:230px}',
  /* estratégias */
  '.c-str{display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));gap:14px}',
  '.c-s{padding:22px;border-radius:16px;background:linear-gradient(160deg,rgba(255,255,255,.045),rgba(255,255,255,.012));position:relative;overflow:hidden}',
  'body.light .c-s{background:linear-gradient(160deg,rgba(14,74,65,.05),rgba(14,74,65,.015))}',
  '.c-s:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--pc)}',
  '.c-s .nm{font-size:14px;font-weight:600;margin-bottom:16px}',
  '.c-s .big{font-size:31px;font-weight:700;letter-spacing:-.03em;color:var(--pc);line-height:1}',
  '.c-s .un{font-size:12px;color:var(--mu);margin-top:6px}',
  '.c-s .tr{height:4px;border-radius:99px;background:rgba(255,255,255,.09);margin:18px 0 12px;overflow:hidden}',
  'body.light .c-s .tr{background:rgba(14,74,65,.1)}',
  '.c-s .tr>i{display:block;height:100%;background:var(--pc);border-radius:99px}',
  '.c-s .ft{display:flex;justify-content:space-between;font-size:12.5px;color:var(--mu)}',
  '.c-s .ft b{color:inherit;font-weight:600}',
  /* tabela */
  '.c-tb{width:100%;border-collapse:collapse;font-size:13.5px}',
  '.c-tb th{text-align:left;font-size:10.5px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--mu);padding:0 14px 12px;white-space:nowrap}',
  '.c-tb td{padding:15px 14px;border-top:1px solid var(--ln)}',
  '.c-tb tbody tr{transition:.14s}',
  '.c-tb tbody tr.k{cursor:pointer}',
  '.c-tb tbody tr.k:hover{background:rgba(197,160,89,.055)}',
  'body.light .c-tb tbody tr.k:hover{background:rgba(14,74,65,.04)}',
  '.c-tb .n{text-align:right;white-space:nowrap}',
  '.c-sc{overflow-x:auto;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;margin:0 -14px;padding:0 14px}',
  /* pessoa */
  '.c-p{display:flex;align-items:center;gap:13px;min-width:0}',
  '.c-av{width:36px;height:36px;border-radius:11px;flex:0 0 36px;display:grid;place-items:center;font-size:12px;font-weight:700;color:#08201C;background:var(--pc,#C5A059);letter-spacing:.02em}',
  '.c-p b{font-weight:600;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.c-p i{font-style:normal;font-size:11.5px;color:var(--mu)}',
  '.c-tag{display:inline-block;font-size:11px;font-weight:600;padding:4px 10px;border-radius:7px;white-space:nowrap;color:var(--pc);background:color-mix(in srgb,var(--pc) 13%,transparent)}',
  /* filtros */
  '.c-f{display:flex;gap:9px;flex-wrap:wrap;align-items:center}',
  '.c-f input,.c-f select{background:rgba(255,255,255,.045);border:1px solid var(--ln);color:inherit;border-radius:10px;padding:10px 13px;font:inherit;font-size:13px;outline:none;transition:.15s}',
  'body.light .c-f input,body.light .c-f select{background:rgba(14,74,65,.035)}',
  '.c-f input{flex:1;min-width:160px}',
  '.c-f input:focus,.c-f select:focus{border-color:rgba(197,160,89,.55);background:rgba(197,160,89,.05)}',
  /* voltar */
  '.c-back{background:none;border:0;color:var(--mu);font:inherit;font-size:13px;cursor:pointer;padding:0;display:inline-flex;align-items:center;gap:7px;transition:.15s;align-self:flex-start}',
  '.c-back:hover{color:var(--g)}',
  /* ficha do cliente */
  '.c-id{display:flex;align-items:center;gap:16px;flex-wrap:wrap}',
  '.c-id .c-av{width:56px;height:56px;flex:0 0 56px;font-size:17px;border-radius:16px}',
  '.c-id h1{margin:0;font-size:27px;font-weight:650;letter-spacing:-.02em;text-transform:none;color:inherit}',
  '.c-id .meta{font-size:13px;color:var(--mu);margin:4px 0 0}',
  /* lista de ativos */
  '.c-at{padding:14px 0;border-top:1px solid var(--ln)}',
  '.c-at:first-of-type{border-top:0}',
  '.c-at .t{display:flex;justify-content:space-between;gap:12px;font-size:13.5px;margin-bottom:8px}',
  '.c-at .t span{color:var(--mu)}',
  '.c-at .tr{height:3px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden}',
  'body.light .c-at .tr{background:rgba(14,74,65,.09)}',
  '.c-at .tr>i{display:block;height:100%;background:var(--pc);border-radius:99px}',
  /* painel discreto */
  '.c-pan{padding:24px;border-radius:16px;background:rgba(255,255,255,.03)}',
  'body.light .c-pan{background:rgba(14,74,65,.035)}',
  /* formulário */
  '.c-fm{display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:660px}',
  '.c-in{display:flex;flex-direction:column;gap:8px;min-width:0}',
  '.c-in.w{grid-column:1/-1}',
  '.c-in label{font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--mu)}',
  '.c-in input,.c-in select{background:transparent;border:0;border-bottom:1.5px solid var(--ln);color:inherit;padding:9px 2px;font:inherit;font-size:16px;outline:none;transition:.18s;width:100%}',
  '.c-in input:focus,.c-in select:focus{border-bottom-color:var(--g)}',
  '.c-in input::placeholder{color:var(--mu);opacity:.55}',
  '.c-in .hint{font-size:11.5px;color:var(--mu)}',
  '.c-pf{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;grid-column:1/-1}',
  '.c-o{padding:17px;border-radius:14px;cursor:pointer;transition:.16s;background:rgba(255,255,255,.03);box-shadow:inset 0 0 0 1.5px transparent}',
  'body.light .c-o{background:rgba(14,74,65,.03)}',
  '.c-o:hover{background:rgba(197,160,89,.06)}',
  '.c-o.on{box-shadow:inset 0 0 0 1.5px var(--pc);background:color-mix(in srgb,var(--pc) 9%,transparent)}',
  '.c-o b{display:block;font-size:13.5px;font-weight:600;margin-bottom:4px}',
  '.c-o span{font-size:11.5px;color:var(--mu)}',
  '.c-o em{display:block;font-style:normal;font-size:22px;font-weight:700;color:var(--pc);margin-top:11px;letter-spacing:-.02em}',
  '.c-acts{display:flex;gap:11px;flex-wrap:wrap;align-items:center}',
  '.c-err{color:#E88B8B;font-size:13px;margin:0}',
  /* vazio / status */
  '.c-empty{text-align:center;padding:64px 24px;color:var(--mu)}',
  '.c-empty p{margin:0 0 18px;font-size:14px}',
  '.c-dot{display:inline-flex;align-items:center;gap:7px;font-size:11.5px;color:var(--mu)}',
  '.c-dot i{width:6px;height:6px;border-radius:50%;background:#5FD6A6;display:block}',
  '.c-dot.off i{background:#E0B978}',
  /* responsivo */
  '@media(max-width:860px){.c-fm{grid-template-columns:1fr}.c-pf{grid-template-columns:1fr}.c-gr{height:235px}.cw{gap:26px}}',
  '@media(max-width:560px){.c-num{font-size:34px}.c-cell{padding:15px 16px}.c-cell .v{font-size:18px}.c-id h1{font-size:22px}}'
  ].join('');
  document.head.appendChild(s);
}

/* ===================== TELA GERAL ===================== */
function telaGeral(C){
  var carts=cstCarteiras();
  var ehCliente = (typeof effRole==='function' && effRole()==='cliente');
  if(!carts.length){
    C.innerHTML='<div class="cw"><div class="c-top"><div><h1>Consultoria</h1>'+
      '<p class="meta">Gestão discricionária de carteiras líquidas</p></div>'+
      (ehCliente?'':'<button class="c-b" style="margin-left:auto" onclick="cstNovo()">Novo cliente</button>')+'</div>'+
      '<div class="c-pan"><div class="c-empty"><p>'+(ehCliente?'Sua carteira ainda não foi aberta.':'Nenhuma carteira cadastrada.')+'</p>'+
      (ehCliente?'':'<button class="c-b" onclick="cstNovo()">Cadastrar primeiro cliente</button>')+'</div></div></div>';
    return;
  }
  if(ehCliente && carts.length===1) return telaCliente(C, carts[0], true);

  var tot=0, ap=0, rg=0, rec=0, P={}, F={};
  carts.forEach(function(c){
    var p=cstPosicao(c), f=cstFee(p.patrimonio), m=cstMetricas(c);
    tot+=p.patrimonio; ap+=p.aportado; rg+=p.resgatado; rec+=f.mensal;
    if(!P[c.perfil]) P[c.perfil]={n:0,pat:0,inv:0,luc:0,vol:[]};
    P[c.perfil].n++; P[c.perfil].pat+=p.patrimonio; P[c.perfil].inv+=p.investido;
    P[c.perfil].luc+=p.lucro; P[c.perfil].vol.push(m.vol);
    if(!F[f.faixa]) F[f.faixa]={n:0,pat:0,rec:0,taxa:f.taxa};
    F[f.faixa].n++; F[f.faixa].pat+=p.patrimonio; F[f.faixa].rec+=f.mensal;
  });
  var liq=ap-rg, res=tot-liq, resPc=liq>0?res/liq*100:0;
  var media=function(a){ return a.length?a.reduce(function(x,y){return x+y;},0)/a.length:0; };

  var cel=function(k,v,s,cor){ return '<div class="c-cell"><div class="k">'+k+'</div>'+
    '<div class="v'+(cor?' '+cor:'')+'">'+v+'</div>'+(s?'<div class="s">'+s+'</div>':'')+'</div>'; };

  var estr=Object.keys(CST_PERFIS).map(function(p){
    var D=CST_PERFIS[p], d=P[p];
    var part = d? d.pat/tot*100 : 0;
    return '<div class="c-s" style="--pc:'+D.cor+'">'+
      '<div class="nm">'+p+'</div>'+
      '<div class="big">'+nb(D.meta)+'%</div><div class="un">ao ano · estratégia</div>'+
      '<div class="tr"><i style="width:'+part.toFixed(1)+'%"></i></div>'+
      '<div class="ft"><span>'+(d?mi(d.pat):'—')+'</span><b>'+(d?d.n+(d.n===1?' cliente':' clientes'):'0')+'</b></div>'+
      (d?'<div class="ft" style="margin-top:7px"><span>no período</span><b class="'+sinal(d.inv>0?d.luc/d.inv*100:0)+'">'+
        pc(d.inv>0?d.luc/d.inv*100:0)+'</b></div>':'')+
    '</div>';
  }).join('');

  var fx=CST_FEE.map(function(f){
    var d=F[f.rot]; if(!d) return '';
    return '<tr><td>'+esc(f.rot)+'</td><td class="n">'+nb(f.taxa)+'%</td><td class="n">'+d.n+'</td>'+
      '<td class="n">'+mi(d.pat)+'</td><td class="n" style="color:var(--g);font-weight:600">'+BRL(d.rec)+'</td></tr>';
  }).join('');

  C.innerHTML =
  '<div class="cw">'+
    '<div class="c-top"><div><h1>Consultoria</h1>'+
      '<p class="meta">'+carts.length+' carteiras · gestão discricionária · '+dtx(cstHoje())+'</p></div>'+
      '<div style="margin-left:auto;display:flex;align-items:center;gap:16px">'+
        '<span class="c-dot'+(cstOnline()?'':' off')+'"><i></i>'+(cstOnline()?'sincronizado':'somente neste aparelho')+'</span>'+
        (ehCliente?'':'<button class="c-b" onclick="cstNovo()">Novo cliente</button>')+
      '</div>'+
    '</div>'+

    '<div class="c-hero">'+
      '<div>'+
        '<p class="c-lab">Patrimônio sob custódia</p>'+
        '<p class="c-num">'+BRL(tot)+'</p>'+
        '<div class="c-delta '+sinal(res)+'">'+(res>=0?'▲':'▼')+' '+mi(Math.abs(res))+' '+
          '<span style="color:var(--mu);font-weight:400">de resultado · '+pc(resPc)+' sobre o capital</span></div>'+
      '</div>'+
      '<div class="c-gr"><canvas id="cGrCust"></canvas></div>'+
      '<div class="c-row">'+
        cel('Captação líquida', mi(liq), mi(ap)+' aportado')+
        cel('Receita mensal', BRL(rec), 'fee médio '+nb(rec*12/tot*100)+'% a.a.','')+
        cel('Receita anual', mi(rec*12), 'sobre a custódia atual')+
        cel('Ticket médio', mi(tot/carts.length), 'por cliente')+
      '</div>'+
    '</div>'+

    '<div class="c-sec"><div class="c-h"><h2>Estratégias</h2>'+
      '<span class="sub">rentabilidade-alvo e participação na custódia</span></div>'+
      '<div class="c-str">'+estr+'</div></div>'+

    '<div class="c-sec"><div class="c-h"><h2>Receita por faixa</h2>'+
      '<span class="sub">taxa ao ano, cobrada em 12 parcelas</span></div>'+
      '<div class="c-sc"><table class="c-tb"><thead><tr><th>Faixa</th><th class="n">Taxa</th>'+
      '<th class="n">Clientes</th><th class="n">Patrimônio</th><th class="n">Receita / mês</th></tr></thead>'+
      '<tbody>'+fx+'<tr style="font-weight:600"><td>Total</td><td class="n">'+nb(rec*12/tot*100)+'%</td>'+
      '<td class="n">'+carts.length+'</td><td class="n">'+mi(tot)+'</td>'+
      '<td class="n" style="color:var(--g)">'+BRL(rec)+'</td></tr></tbody></table></div></div>'+

    '<div class="c-sec"><div class="c-h"><h2>Carteiras</h2></div>'+
      '<div class="c-f">'+
        '<input type="search" placeholder="Buscar cliente" value="'+esc(V.busca)+'" oninput="cstBusca(this.value)">'+
        '<select onchange="cstFPerfil(this.value)">'+['','Conservador','Moderado','Arrojado'].map(function(p){
          return '<option value="'+p+'"'+(V.perfil===p?' selected':'')+'>'+(p||'Todos os perfis')+'</option>';}).join('')+'</select>'+
        '<select onchange="cstFOrd(this.value)">'+[['pat','Maior patrimônio'],['rent','Maior rentabilidade'],['novo','Mais recentes'],['nome','Nome (A–Z)']].map(function(o){
          return '<option value="'+o[0]+'"'+(V.ord===o[0]?' selected':'')+'>'+o[1]+'</option>';}).join('')+'</select>'+
      '</div>'+
      '<div class="c-sc" id="cLista"></div></div>'+
  '</div>';

  lista();
  depois(function(){ grafCustodia(carts); });
}

function lista(){
  var el=document.getElementById('cLista'); if(!el) return;
  var q=(V.busca||'').toLowerCase().trim();
  var L=cstCarteiras().filter(function(c){
    if(V.perfil && c.perfil!==V.perfil) return false;
    if(q && c.nome.toLowerCase().indexOf(q)<0) return false;
    return true;
  }).map(function(c){ var p=cstPosicao(c);
    return {c:c,p:p,f:cstFee(p.patrimonio),r:p.investido>0?p.lucro/p.investido*100:0}; });
  L.sort(function(a,b){
    if(V.ord==='rent') return b.r-a.r;
    if(V.ord==='novo') return a.c.inicio<b.c.inicio?1:-1;
    if(V.ord==='nome') return a.c.nome.localeCompare(b.c.nome,'pt-BR');
    return b.p.patrimonio-a.p.patrimonio; });
  if(!L.length){ el.innerHTML='<p class="c-empty">Nenhum cliente encontrado.</p>'; return; }
  el.innerHTML='<table class="c-tb"><thead><tr><th>Cliente</th><th>Estratégia</th><th>Desde</th>'+
    '<th class="n">Patrimônio</th><th class="n">Rentabilidade</th><th class="n">Fee / mês</th></tr></thead><tbody>'+
    L.map(function(r){
      var cor=(CST_PERFIS[r.c.perfil]||{}).cor||'#C5A059';
      return '<tr class="k" onclick="cstAbrir(\''+r.c.id+'\')" style="--pc:'+cor+'">'+
        '<td><div class="c-p"><span class="c-av">'+esc(ini(r.c.nome))+'</span>'+
          '<span style="min-width:0"><b>'+esc(r.c.nome)+'</b><i>'+mi(r.p.investido)+' investidos</i></span></div></td>'+
        '<td><span class="c-tag">'+esc(r.c.perfil)+'</span></td>'+
        '<td style="white-space:nowrap;color:var(--mu)">'+dt(r.c.inicio)+'</td>'+
        '<td class="n"><b>'+BRL(r.p.patrimonio)+'</b></td>'+
        '<td class="n '+sinal(r.r)+'">'+pc(r.r)+'</td>'+
        '<td class="n" style="color:var(--g)">'+BRL(r.f.mensal)+'</td></tr>';
    }).join('')+'</tbody></table>';
}

/* ===================== FICHA DO CLIENTE ===================== */
function telaCliente(C, forcada, soLeitura){
  var c = forcada || cstPorId(V.id);
  if(!c){ cstVoltar(); return; }
  var D=CST_PERFIS[c.perfil]||CST_PERFIS.Conservador;
  var p=cstPosicao(c), f=cstFee(p.patrimonio), m=cstMetricas(c);
  var rent=p.investido>0?p.lucro/p.investido*100:0;
  var pode = !soLeitura && cstEditavel(c);

  var cel=function(k,v,s,cor){ return '<div class="c-cell"><div class="k">'+k+'</div>'+
    '<div class="v'+(cor?' '+cor:'')+'">'+v+'</div>'+(s?'<div class="s">'+s+'</div>':'')+'</div>'; };

  var ativos=(CST_ATIVOS[c.perfil]||[]).map(function(a){
    return '<div class="c-at"><div class="t"><span style="color:inherit">'+esc(a[0])+'</span><span>'+a[1]+'%</span></div>'+
      '<div class="tr"><i style="width:'+a[1]+'%"></i></div></div>'; }).join('');

  var ext=p.extrato.map(function(e){
    var pos=e.tipo!=='resgate';
    return '<tr><td style="white-space:nowrap;color:var(--mu)">'+dt(e.data)+'</td><td>'+esc(e.obs)+'</td>'+
      '<td class="n" style="color:var(--mu)">'+e.cota.toLocaleString('pt-BR',{minimumFractionDigits:4,maximumFractionDigits:4})+'</td>'+
      '<td class="n" style="color:var(--mu)">'+(pos?'':'−')+e.cotas.toLocaleString('pt-BR',{maximumFractionDigits:4})+'</td>'+
      '<td class="n '+(pos?'up':'dn')+'"><b>'+(pos?'+':'−')+' '+BRL(e.valor)+'</b></td></tr>'; }).join('');

  C.innerHTML =
  '<div class="cw" style="--pc:'+D.cor+'">'+
    (soLeitura?'':'<button class="c-back" onclick="cstVoltar()">← Todas as carteiras</button>')+

    '<div class="c-id">'+
      '<span class="c-av">'+esc(ini(c.nome))+'</span>'+
      '<div style="min-width:0"><h1>'+esc(c.nome)+'</h1>'+
        '<p class="meta">'+esc(c.perfil)+' · desde '+dtx(c.inicio)+(c.email?' · '+esc(c.email):'')+'</p></div>'+
      (pode?'<div class="c-acts" style="margin-left:auto">'+
        '<button class="c-b" onclick="cstMov(\''+c.id+'\',\'aporte\')">Aporte</button>'+
        '<button class="c-b o" onclick="cstMov(\''+c.id+'\',\'resgate\')">Resgate</button></div>':'')+
    '</div>'+

    '<div class="c-hero">'+
      '<div>'+
        '<p class="c-lab">Patrimônio</p>'+
        '<p class="c-num">'+BRL(p.patrimonio)+'</p>'+
        '<div class="c-delta '+sinal(p.lucro)+'">'+(p.lucro>=0?'▲':'▼')+' '+BRL(Math.abs(p.lucro))+
          ' <span style="color:var(--mu);font-weight:400">'+pc(rent)+' sobre o investido</span></div>'+
      '</div>'+
      '<div class="c-gr"><canvas id="cGrCli"></canvas></div>'+
      '<div class="c-row">'+
        cel('Capital investido', BRL(p.investido), mi(p.aportado)+' aportado'+(p.resgatado>0?' · '+mi(p.resgatado)+' resgatado':''))+
        cel('No período', pc(m.acum), 'desde '+dt(c.inicio), sinal(m.acum))+
        cel('Últimos 30 dias', pc(m.mes), 'variação da cota', sinal(m.mes))+
        cel('Cotas', p.cotas.toLocaleString('pt-BR',{maximumFractionDigits:4}), 'cota '+p.cotaHoje.toLocaleString('pt-BR',{minimumFractionDigits:4,maximumFractionDigits:4}))+
      '</div>'+
    '</div>'+

    '<div class="c-sec" style="display:grid;grid-template-columns:1.15fr 1fr;gap:22px;align-items:start">'+
      '<div class="c-pan"><div class="c-h" style="margin-bottom:6px"><h2>Composição</h2></div>'+
        '<p class="sub" style="font-size:12.5px;color:var(--mu);margin:0 0 8px">Alocação-alvo da estratégia '+esc(c.perfil)+'</p>'+ativos+'</div>'+
      '<div class="c-pan">'+
        '<div class="c-h" style="margin-bottom:14px"><h2>Taxa de consultoria</h2></div>'+
        '<div style="font-size:34px;font-weight:700;color:var(--g);letter-spacing:-.03em;line-height:1">'+nb(f.taxa)+'%'+
          '<span style="font-size:13px;color:var(--mu);font-weight:500;letter-spacing:0"> ao ano</span></div>'+
        '<p class="sub" style="font-size:12.5px;color:var(--mu);margin:8px 0 20px">'+esc(f.faixa)+'</p>'+
        '<div class="c-row" style="grid-template-columns:1fr 1fr">'+
          cel('Por mês', BRL2(f.mensal))+cel('No ano', BRL(f.anual))+
        '</div>'+
        '<div class="c-row" style="grid-template-columns:1fr 1fr;margin-top:1px">'+
          cel('Volatilidade', nb(m.vol)+'%')+cel('Sharpe', nb(m.sharpe))+
        '</div>'+
      '</div>'+
    '</div>'+

    '<div class="c-sec"><div class="c-h"><h2>Extrato</h2><span class="sub">cota de cada movimentação</span></div>'+
      '<div class="c-sc"><table class="c-tb"><thead><tr><th>Data</th><th>Movimentação</th>'+
      '<th class="n">Cota</th><th class="n">Cotas</th><th class="n">Valor</th></tr></thead><tbody>'+ext+'</tbody></table></div>'+
      (pode?'<div class="c-acts" style="margin-top:20px"><button class="c-b d" onclick="cstExcluir(\''+c.id+'\')">Excluir carteira</button></div>':'')+
    '</div>'+
  '</div>';

  depois(function(){ grafCliente(c); });
}

/* ===================== NOVO CLIENTE ===================== */
function telaNovo(C){
  var hoje=cstHoje();
  C.innerHTML =
  '<div class="cw">'+
    '<button class="c-back" onclick="cstVoltar()">← Todas as carteiras</button>'+
    '<div><h1 style="margin:0;font-size:27px;font-weight:650;letter-spacing:-.02em">Abrir carteira</h1>'+
    '<p class="meta" style="font-size:13px;color:var(--mu);margin:6px 0 0">'+
    'A contabilização começa na data do primeiro aporte, com cota inicial 1.000.</p></div>'+
    '<div class="c-fm">'+
      '<div class="c-in w"><label for="fNome">Nome completo</label>'+
        '<input id="fNome" type="text" placeholder="Nome do cliente" autocomplete="off"></div>'+
      '<div class="c-in"><label for="fMail">E-mail</label>'+
        '<input id="fMail" type="email" placeholder="opcional" autocomplete="off"></div>'+
      '<div class="c-in"><label for="fTel">Telefone</label>'+
        '<input id="fTel" type="text" placeholder="opcional" autocomplete="off"></div>'+
      '<div class="c-pf">'+Object.keys(CST_PERFIS).map(function(p,i){
        var D=CST_PERFIS[p];
        return '<div class="c-o'+(i===0?' on':'')+'" data-p="'+p+'" style="--pc:'+D.cor+'" onclick="cstPerfil(\''+p+'\')">'+
          '<b>'+p+'</b><span>volatilidade '+nb(D.vol,1)+'%</span><em>'+nb(D.meta)+'%</em></div>';}).join('')+'</div>'+
      '<div class="c-in"><label for="fVal">Aporte inicial</label>'+
        '<input id="fVal" type="text" inputmode="numeric" placeholder="R$ 0,00">'+
        '<span class="hint">Pode digitar 500000 ou 500.000</span></div>'+
      '<div class="c-in"><label for="fData">Data do aporte</label>'+
        '<input id="fData" type="date" value="'+hoje+'" max="'+hoje+'">'+
        '<span class="hint">Não aceita data futura</span></div>'+
      '<div class="c-in w"><div class="c-acts">'+
        '<button class="c-b" id="fBtn" onclick="cstCriar()">Abrir carteira</button>'+
        '<button class="c-b o" onclick="cstVoltar()">Cancelar</button></div>'+
        '<p class="c-err" id="fErr"></p></div>'+
    '</div>'+
  '</div>';
  var e=document.getElementById('fNome'); if(e) e.focus();
}
function cstPerfil(p){
  V.perfilNovo=p;
  document.querySelectorAll('.c-pf .c-o').forEach(function(el){ el.classList.toggle('on', el.getAttribute('data-p')===p); });
}
async function cstCriar(){
  var err=document.getElementById('fErr'), btn=document.getElementById('fBtn');
  var nome=((document.getElementById('fNome')||{}).value||'').trim();
  var mail=((document.getElementById('fMail')||{}).value||'').trim();
  var tel =((document.getElementById('fTel')||{}).value||'').trim();
  var val =num((document.getElementById('fVal')||{}).value);
  var data=((document.getElementById('fData')||{}).value||cstHoje());
  var E=function(m){ if(err) err.textContent=m; };
  if(nome.length<3) return E('Informe o nome completo.');
  if(val<=0)        return E('Informe o valor do aporte inicial.');
  if(data>cstHoje())return E('A data não pode ser no futuro.');
  E(''); if(btn){ btn.disabled=true; btn.textContent='Abrindo...'; }
  var id = (typeof uuid==='function') ? uuid()
         : 'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  var cart={id:id, nome:nome, email:mail, telefone:tel, perfil:V.perfilNovo, inicio:data,
    movimentos:[{tipo:'aporte', valor:val, data:data, obs:'Aporte inicial'}]};
  await cstGravar(cart);
  try{ if(typeof flash==='function') flash('Carteira de '+nome.split(' ')[0]+' aberta'); }catch(e){}
  try{ if(typeof logEvt==='function') logEvt('INSERT','consultoria','Abriu carteira de consultoria: '+nome); }catch(e){}
  cstAbrir(id);
}
async function cstMov(id,tipo){
  var c=cstPorId(id); if(!c) return;
  if(!cstEditavel(c)){ try{ flash('Carteira de exemplo — cadastre um cliente para movimentar'); }catch(e){} return; }
  var lbl = tipo==='resgate'?'resgate':'aporte';
  var v=num(window.prompt('Valor do '+lbl+' (R$):','')); if(!v||v<=0) return;
  var d=window.prompt('Data do '+lbl+' (AAAA-MM-DD):', cstHoje()); if(!d) return;
  d=d.trim();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(d)) return alert('Data inválida. Use AAAA-MM-DD.');
  if(d>cstHoje())    return alert('A data não pode ser no futuro.');
  if(d<c.inicio)     return alert('A data não pode ser anterior à abertura ('+dt(c.inicio)+').');
  if(tipo==='resgate'){
    var at=cstPosicao(c).patrimonio;
    if(v>at) return alert('Resgate ('+BRL(v)+') maior que o patrimônio ('+BRL(at)+').');
  }
  c.movimentos.push({tipo:tipo, valor:v, data:d, obs: tipo==='resgate'?'Resgate':'Aporte'});
  await cstGravar(c);
  try{ flash(tipo==='resgate'?'Resgate registrado':'Aporte registrado'); }catch(e){}
  if(typeof render==='function') render();
}
async function cstExcluir(id){
  var c=cstPorId(id); if(!c) return;
  if(!window.confirm('Excluir a carteira de '+c.nome+'?')) return;
  await cstRemover(id);
  try{ flash('Carteira excluída'); }catch(e){}
  cstVoltar();
}

/* ===================== GRÁFICOS =====================
   animation:false porque o Chart.js só pinta dentro de requestAnimationFrame
   e em várias situações (aba recém-aberta, WebView, render logo após innerHTML)
   o rAF não dispara — o canvas fica em branco com os dados todos lá dentro. */
function depois(fn){
  if(typeof requestAnimationFrame==='function') requestAnimationFrame(function(){ setTimeout(fn,0); });
  else setTimeout(fn,40);
}
function eixoY(){ return {ticks:{callback:function(v){return mi(v);},maxTicksLimit:5,padding:8},
  grid:{color:'rgba(255,255,255,.045)',drawTicks:false},border:{display:false}}; }
function eixoX(lab){ return {ticks:{maxTicksLimit:6,autoSkip:true,padding:8,
  callback:function(v,i){var d=lab[i];return d?d.slice(8,10)+'/'+d.slice(5,7):'';}},
  grid:{display:false},border:{display:false}}; }
function linha(id, lab, dados, cor, rot){
  mkChart(id,{type:'line',
    data:{labels:lab,datasets:[{data:dados,borderColor:cor,borderWidth:2,fill:true,tension:.3,
      pointRadius:0,pointHoverRadius:5,pointHoverBackgroundColor:cor,pointHoverBorderWidth:0,
      backgroundColor:cor+'1F'}]},
    options:{animation:false,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{displayColors:false,padding:11,cornerRadius:9,
        callbacks:{title:function(t){return dtx(t[0].label);},label:function(c){return rot+': '+BRL(c.parsed.y);}}}},
      interaction:{mode:'index',intersect:false},
      scales:{y:eixoY(), x:eixoX(lab)}}});
}
function grafCustodia(carts){
  var s=cstSerieCustodia(carts); if(!s.length) return;
  linha('cGrCust', s.map(function(x){return x.data;}), s.map(function(x){return x.valor;}), '#C5A059', 'Custódia');
}
function grafCliente(c){
  var s=cstSerie(c), cor=(CST_PERFIS[c.perfil]||{}).cor||'#C5A059';
  var movs=(c.movimentos||[]).slice().sort(function(a,b){return a.data<b.data?-1:1;});
  var cotas=0,k=0,pts=[],lab=[];
  s.forEach(function(pt){
    while(k<movs.length && movs[k].data<=pt.data){
      var q=(+movs[k].valor||0)/cotaEm(s,movs[k].data);
      cotas += (movs[k].tipo==='resgate'?-q:q); k++;
    }
    lab.push(pt.data); pts.push(cotas*pt.cota);
  });
  linha('cGrCli', lab, pts, cor, 'Patrimônio');
}

/* ===================== ENTRADA ===================== */
var _1a=true;
function renderConsultoria(C){
  cstCSS();
  if(_1a && _sb()){
    _1a=false;
    cstCarregar().then(function(){ if(typeof render==='function') render(); });
  }
  if(V.modo==='cliente') return telaCliente(C);
  if(V.modo==='novo')    return telaNovo(C);
  return telaGeral(C);
}

window.renderConsultoria=renderConsultoria;
window.cstAbrir=cstAbrir; window.cstVoltar=cstVoltar; window.cstNovo=cstNovo;
window.cstBusca=function(v){V.busca=v;lista();};
window.cstFPerfil=function(v){V.perfil=v;lista();};
window.cstFOrd=function(v){V.ord=v;lista();};
window.cstPerfil=cstPerfil; window.cstCriar=cstCriar; window.cstMov=cstMov; window.cstExcluir=cstExcluir;
window.cstCarteiras=cstCarteiras; window.cstPosicao=cstPosicao; window.cstFee=cstFee;
window.cstMetricas=cstMetricas; window.cstSerie=cstSerie; window.cstCarregar=cstCarregar;
window.cstOnline=cstOnline; window.CST_PERFIS=CST_PERFIS;
window.__CST_OK=true;
})();
