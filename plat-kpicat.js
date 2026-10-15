/* KPIs — Base de clientes por categoria (13/out/2026)
   Todo o período · Por mês (navegável) · Histórico mês a mês desde o início.
   Depende do host: db, visibleClients, CARTA_CATS, supa, BRL, esc, mkChart, cmsDistCategorias. */
(function(){
  var S={modo:'tudo', mes:null}, _cartas=null, _vendas=null, _box=null, _semCarta=[];
  var MES=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  function ym(t){ var d=new Date(t); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2); }
  function ymLb(k){ var p=k.split('-'); return MES[+p[1]-1]+'/'+p[0]; }
  function ymAdd(k,n){ var p=k.split('-'), d=new Date(+p[0],+p[1]-1+n,1); return ym(d.getTime()); }
  function pct(a,b){ return b?Math.round(a/b*100):0; }
  function t(x){ return x?new Date(x).getTime():0; }

  async function cartas(){
    if(_cartas) return _cartas;
    try{ var r=await supa.from('cartas').select('cliente_id,valor,categoria,criado_em,ativo'); _cartas=(r&&r.data)||[]; }catch(e){ _cartas=[]; }
    /* valor REAL vendido: crédito das vendas registradas em Comissões (data = data da venda) */
    try{ var v=await supa.from('comissoes_vendas').select('cliente_id,credito,categoria,data_insercao,criado_em,situacao,analise_status'); _vendas=((v&&v.data)||[]).filter(function(x){ return x.situacao!=='CANCELADA'&&x.situacao!=='REEMBOLSO_TOTAL'&&x.analise_status!=='RECUSADA'; }); }catch(e){ _vendas=[]; }
    return _cartas;
  }
  /* categoria do cliente: a do cliente; se faltar, a mais comum entre as cartas dele */
  function catCli(c,C){ if(c.categoria) return c.categoria; var n={}; C.forEach(function(x){ if(x.cliente_id===c.id&&x.categoria) n[x.categoria]=(n[x.categoria]||0)+1; }); var k=Object.keys(n).sort(function(a,b){return n[b]-n[a];})[0]; return k||null; }

  function base(){ _semCarta=[]; 
    var VC=(typeof visibleClients==='function'?visibleClients():db.clients)||[], ids={}; VC.forEach(function(c){ids[c.id]=1;});
    var C=(_cartas||[]).filter(function(x){return ids[x.cliente_id];});
    return VC.map(function(c){ var mc=C.filter(function(x){return x.cliente_id===c.id;});
      var t0=c.criadoEm||0; mc.forEach(function(x){ var tx=t(x.criado_em); if(tx&&(!t0||tx<t0)) t0=tx; });
      var mv=(_vendas||[]).filter(function(x){return x.cliente_id===c.id;});
      /* cliente desde = data da 1ª venda registrada; sem venda, a 1ª carta; sem nenhuma das duas, não entra nos KPIs (só cadastro) */
      var tv=0; mv.forEach(function(v){ var x=t(v.data_insercao||v.criado_em); if(x&&(!tv||x<tv)) tv=x; });
      var tc=0; mc.forEach(function(x){ var y=t(x.criado_em); if(y&&(!tc||y<tc)) tc=y; });
      return {c:c, cat:catCli(c,C), desde:tv||tc||null, cartas:mc, vendas:mv, semCarta:!mv.length&&!mc.length}; }).filter(function(r){ if(r.semCarta){ _semCarta.push(r); return false; } return true; });
  }
  function dv(v){ return t(v.data_insercao||v.criado_em); }
  /* crédito do cliente no período: vendas registradas (valor real); sem venda registrada, cai para o valor da carta */
  function credDe(r,mes){ if(r.vendas&&r.vendas.length) return r.vendas.filter(function(v){ return !mes||(dv(v)&&ym(dv(v))===mes); }).reduce(function(s,v){return s+(+v.credito||0);},0);
    return r.cartas.filter(function(x){ return !mes||(x.criado_em&&ym(t(x.criado_em))===mes); }).reduce(function(s,x){return s+(+x.valor||0);},0); }
  function ncDe(r,mes){ var n=r.cartas.filter(function(x){ return !mes||(x.criado_em&&ym(t(x.criado_em))===mes); }).length; if(n) return n; return (r.vendas||[]).filter(function(v){ return !mes||(dv(v)&&ym(dv(v))===mes); }).length; }
  function tiles(rows, mes, titulo, nota){
    var tot=rows.length, by={}; CARTA_CATS.forEach(function(k){ by[k.k]={n:0,nc:0,cred:0}; }); var sem=0;
    rows.forEach(function(r){ var b=by[r.cat]; if(!b){ sem++; return; } b.n++; b.nc+=ncDe(r,mes); b.cred+=credDe(r,mes); });
    var max=Math.max.apply(null,CARTA_CATS.map(function(k){return by[k.k].n;}).concat([1]));
    var credTot=CARTA_CATS.reduce(function(s,k){return s+by[k.k].cred;},0), ncTot=CARTA_CATS.reduce(function(s,k){return s+by[k.k].nc;},0);
    var h=CARTA_CATS.map(function(k){ var b=by[k.k];
      return '<div class="cms-cat'+(b.n?'':' vazio')+'"><div class="h"><span>'+k.ic+'</span><b>'+k.lb+'</b><em>'+pct(b.n,tot)+'%</em></div><div class="v">'+b.n+' cliente'+(b.n===1?'':'s')+'</div><div class="s">'+b.nc+' carta'+(b.nc===1?'':'s')+' · '+BRL(b.cred)+'</div><div class="bar"><i style="width:'+Math.round(b.n/max*100)+'%"></i></div></div>'; }).join('');
    return '<div class="panel"><h2>'+titulo+' <span class="right note">'+tot+' cliente'+(tot===1?'':'s')+' · '+ncTot+' carta'+(ncTot===1?'':'s')+' · '+BRL(credTot)+(sem?' · '+sem+' sem categoria':'')+(nota?' · '+nota:'')+'</span></h2><div class="cms-cats">'+h+'</div></div>';
  }
  function barra(){
    var L=[['tudo','Todo o período'],['mes','Por mês'],['hist','Histórico']];
    var nav=S.modo==='mes'?'<span class="kc-nav"><button onclick="kcMes(-1)" aria-label="Mês anterior">‹</button><b>'+ymLb(S.mes)+'</b><button onclick="kcMes(1)" aria-label="Próximo mês"'+(S.mes>=ym(Date.now())?' disabled':'')+'>›</button></span>':'';
    return '<div class="kc-bar"><div class="cms-tabs">'+L.map(function(x){return '<button class="'+(S.modo===x[0]?'on':'')+'" onclick="kcModo(\''+x[0]+'\')">'+x[1]+'</button>';}).join('')+'</div>'+nav+'</div>';
  }
  function histHtml(B){
    if(!B.length) return '<div class="panel"><p class="note">Ainda não há clientes.</p></div>';
    var ini=B.reduce(function(m,r){ var k=r.desde?ym(r.desde):ym(Date.now()); return !m||k<m?k:m; },null), fim=ym(Date.now()), meses=[];
    for(var k=ini;k<=fim;k=ymAdd(k,1)) meses.push(k);
    var acum=0, linhas=meses.map(function(k){
      var rows=B.filter(function(r){return r.desde&&ym(r.desde)===k;});
      var cm=[]; B.forEach(function(r){ var n=ncDe(r,k), cr=credDe(r,k); if(n||cr) cm.push({n:n,cr:cr,cat:r.cat}); });
      acum+=rows.length;
      var cel=CARTA_CATS.map(function(c){ var n=rows.filter(function(r){return r.cat===c.k;}).length, cr=cm.filter(function(o){return o.cat===c.k;}).reduce(function(s,o){return s+o.cr;},0);
        return '<td class="n">'+(n||cr?'<b>'+n+'</b>'+(cr?'<small>'+BRL(cr)+'</small>':''):'<span class="z">—</span>')+'</td>'; }).join('');
      var cred=cm.reduce(function(s,o){return s+o.cr;},0), ncm=cm.reduce(function(s,o){return s+o.n;},0);
      return {k:k,rows:rows,cm:cm,html:'<tr><td>'+ymLb(k)+'</td>'+cel+'<td class="n"><b>'+rows.length+'</b><small>'+ncm+' carta'+(ncm===1?'':'s')+'</small></td><td class="n">'+BRL(cred)+'</td><td class="n">'+acum+'</td></tr>'};
    });
    var tab='<div class="tbl-scroll kc-tbl"><table><thead><tr><th>Mês</th>'+CARTA_CATS.map(function(c){return '<th class="n">'+c.ic+' '+c.lb+'</th>';}).join('')+'<th class="n">Novos</th><th class="n">Crédito no mês</th><th class="n">Base total</th></tr></thead><tbody>'+linhas.slice().reverse().map(function(l){return l.html;}).join('')+'</tbody></table></div>';
    setTimeout(function(){ try{ mkChart('kcHist',{type:'bar',data:{labels:meses.map(ymLb),datasets:CARTA_CATS.map(function(c,i){ return {label:c.lb,data:linhas.map(function(l){return l.rows.filter(function(r){return r.cat===c.k;}).length;}),backgroundColor:['#C5A059','#5BC0AE','#8FD9CC','#E8CC8B'][i],borderRadius:4,stack:'s'}; })},options:{maintainAspectRatio:false,plugins:{legend:{position:'bottom'}},scales:{x:{stacked:true},y:{stacked:true,beginAtZero:true,ticks:{precision:0}}}}}); }catch(e){} },30);
    return '<div class="panel"><h2>Novos clientes por mês e categoria <span class="right note">desde '+ymLb(ini)+' · crédito = valor real vendido no mês (vendas de Comissões)</span></h2><div style="height:240px;margin-bottom:14px"><canvas id="kcHist"></canvas></div>'+tab+'</div>';
  }
  async function pinta(){
    if(!_box||!document.body.contains(_box)) return;
    await cartas(); var B=base(); if(!S.mes) S.mes=ym(Date.now());
    var h=barra();
    if(S.modo==='tudo'){
      h+=tiles(B,null,'Base de clientes por categoria','desde o início'+(_semCarta.length?' · '+_semCarta.length+' cadastrado'+(_semCarta.length===1?'':'s')+' ainda sem carta (não contam)':''));
      if(typeof cmsDistCategorias==='function') h+=await cmsDistCategorias('Vendas fechadas por categoria');
    } else if(S.modo==='mes'){
      var novos=B.filter(function(r){return r.desde&&ym(r.desde)===S.mes;});
      var comCarta=B.filter(function(r){return ncDe(r,S.mes)>0;});
      var ant=B.filter(function(r){return r.desde&&ym(r.desde)===ymAdd(S.mes,-1);}).length;
      var semMes=_semCarta.filter(function(r){ return r.c.criadoEm&&ym(r.c.criadoEm)===S.mes; }).length;
      h+=tiles(novos,S.mes,'Novos clientes em '+ymLb(S.mes),(novos.length-ant>=0?'+':'')+(novos.length-ant)+' vs. '+ymLb(ymAdd(S.mes,-1))+(semMes?' · '+semMes+' cadastrado'+(semMes===1?'':'s')+' no mês sem carta (não conta)':''));
      var extra=comCarta.filter(function(r){return novos.indexOf(r)<0;});
      if(extra.length) h+=tiles(extra,S.mes,'Clientes da base com carta nova em '+ymLb(S.mes),'');
      if(typeof cmsDistCategorias==='function') h+=await cmsDistCategorias('Vendas fechadas em '+ymLb(S.mes),S.mes);
    } else {
      h+=histHtml(B);
    }
    if(document.body.contains(_box)) _box.querySelector('.kc-body').innerHTML=h;
  }
  window.kcModo=function(m){ S.modo=m; pinta(); };
  window.kcMes=function(n){ var k=ymAdd(S.mes||ym(Date.now()),n); if(k>ym(Date.now()))return; S.mes=k; pinta(); };
  window.kpiCatRender=async function(box){
    _box=box; _cartas=null; _vendas=null;
    if(!document.getElementById('kcCss')){ var st=document.createElement('style'); st.id='kcCss'; st.textContent=
      '.kc-bar{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;margin:0 0 14px}.kc-bar .cms-tabs{margin:0}'
      +'.kc-nav{display:inline-flex;align-items:center;gap:6px}.kc-nav b{min-width:84px;text-align:center;font-weight:600;color:var(--head);text-transform:capitalize}'
      +'.kc-nav button{width:32px;height:32px;border-radius:10px;border:1px solid var(--line);background:var(--csurf-2,rgba(255,255,255,.04));color:var(--head);font-size:1.1rem;cursor:pointer}.kc-nav button:disabled{opacity:.35;cursor:default}'
      +'.kc-tbl table{width:100%;border-collapse:collapse;font-size:.86rem}.kc-tbl th,.kc-tbl td{padding:9px 10px;border-top:1px solid var(--line);text-align:left;white-space:nowrap}.kc-tbl th{color:var(--muted);font-weight:600;font-size:.76rem;text-transform:uppercase;letter-spacing:.04em;border-top:0}'
      +'.kc-wrap .cms-cat .h b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kc-wrap .cms-cat .h em{flex:none}'+'.kc-tbl td:first-child{text-transform:capitalize;font-weight:600;color:var(--head)}.kc-tbl .n{text-align:right}.kc-tbl small{display:block;color:var(--soft);font-size:.74rem}.kc-tbl .z{color:var(--soft)}';
      document.head.appendChild(st); }
    box.innerHTML='<div class="cms-wrap kc-wrap"><div class="kc-body"></div></div>';
    await pinta();
  };
})();
