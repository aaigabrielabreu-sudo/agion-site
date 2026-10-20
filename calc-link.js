/* Agion · Links temporários das calculadoras (Chat B · 19/out/2026)
   Componente usado no Gerador de propostas e nas próprias calculadoras.
   AgCalcLink.mount(el,{pagina,escolher,selecionavel,onSel})  -> painel embutido
   AgCalcLink.modal({pagina})                                   -> janela por cima da página
   AgCalcLink.falta(expiraSeg)                                  -> "1d 4h 10min"            */
(function(W){
 if(W.AgCalcLink)return;
 var API='https://bot.agionconsorcios.com.br';
 var FERR={'calc-alavancagem':'Calculadora de alavancagem','calc-financiamento':'Calculadora de financiamento'};
 var SEL_KEY='ag_link_prop', CACHE='ag_links_cache';
 function tok(){try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf('sb-')===0&&k.indexOf('auth-token')>-1){var v=JSON.parse(localStorage.getItem(k));return v&&(v.access_token||(v.currentSession&&v.currentSession.access_token));}}}catch(e){}return null;}
 function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
 function falta(exp){var s=Math.floor(exp-Date.now()/1000);if(s<=0)return 'expirado';var d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60),ss=s%60;
  if(d)return d+'d '+h+'h '+m+'min';if(h)return h+'h '+m+'min';return m+'min '+String(ss).padStart(2,'0')+'s';}
 function quando(exp){var e=new Date(exp*1000);return e.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})+' às '+e.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});}
 function css(){if(document.getElementById('agl-css'))return;var s=document.createElement('style');s.id='agl-css';s.textContent=
  '.agl{font-family:Poppins,system-ui,sans-serif;color:#0a2823}'+
  '.agl .agl-k{font:700 10.5px system-ui;letter-spacing:.13em;color:#9a7a34;text-transform:uppercase;margin:0 0 8px}'+
  '.agl .agl-chips{display:flex;flex-wrap:wrap;gap:8px}'+
  '.agl .agl-chip{border:1.5px solid #e0d6bf;background:#fff;color:#0a2823;border-radius:12px;padding:10px 14px;font:600 13px Poppins,system-ui;cursor:pointer;transition:.15s}'+
  '.agl .agl-chip.on{border-color:#c5a059;background:#f8f2e6;box-shadow:0 0 0 3px rgba(197,160,89,.18)}'+
  '.agl .agl-cust{display:none;align-items:center;gap:8px;margin-top:10px}.agl .agl-cust.on{display:flex}'+
  '.agl input,.agl select{border:1.5px solid #e0d6bf;background:#fbf8f1;border-radius:11px;padding:10px 12px;font:500 14px Poppins,system-ui;color:#0a2823;min-width:0}'+
  '.agl .agl-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}@media(max-width:560px){.agl .agl-row{grid-template-columns:1fr}}'+
  '.agl .agl-go{margin-top:12px;width:100%;border:0;background:#0a2823;color:#e8cc8b;border-radius:12px;padding:13px;font:700 14px Poppins,system-ui;cursor:pointer}'+
  '.agl .agl-go[disabled]{opacity:.55;cursor:wait}'+
  '.agl .agl-msg{font-size:12.5px;margin-top:8px;color:#586b62;min-height:16px}.agl .agl-msg.er{color:#b0503f}'+
  '.agl .agl-lh{display:flex;justify-content:space-between;align-items:center;margin:18px 0 8px}'+
  '.agl .agl-lh label{font-size:12px;color:#586b62;display:flex!important;gap:6px;align-items:center;cursor:pointer;white-space:nowrap;width:auto!important;margin:0!important}.agl .agl-lh label input{width:auto!important;margin:0}'+
  '.agl .agl-it{border:1px solid #e0d6bf;background:#fff;border-radius:14px;padding:12px 14px;margin-bottom:9px}'+
  '.agl .agl-it.exp{opacity:.55;background:#f6f3ec}.agl .agl-it.sel{border-color:#c5a059;box-shadow:0 0 0 3px rgba(197,160,89,.16)}'+
  '.agl .agl-t1{display:flex;justify-content:space-between;gap:10px;font-size:13px;font-weight:600}'+
  '.agl .agl-cd{font:700 12.5px ui-monospace,Menlo,monospace;color:#2a6a77;white-space:nowrap}.agl .agl-it.exp .agl-cd{color:#b0503f}'+
  '.agl .agl-url{font:12px ui-monospace,Menlo,monospace;color:#586b62;margin:5px 0 3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
  '.agl .agl-sub{font-size:11.5px;color:#8a9089}'+
  '.agl .agl-bt{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}'+
  '.agl .agl-bt button,.agl .agl-bt a{border:1px solid #e0d6bf;background:#fff;color:#0a2823;border-radius:9px;padding:7px 11px;font:600 12px Poppins,system-ui;cursor:pointer;text-decoration:none}'+
  '.agl .agl-bt .wa{background:#25D366;border-color:#25D366;color:#fff}.agl .agl-bt .us{border-color:#c5a059;background:#f8f2e6}.agl .agl-bt .us.on{background:#0a2823;color:#e8cc8b;border-color:#0a2823}'+
  '.agl .agl-vz{font-size:12.5px;color:#8a9089;padding:10px 0}'+
  '.agl .agl-h{margin-top:10px;border-top:1px dashed #e0d6bf;padding-top:8px;max-height:340px;overflow:auto}.agl .agl-hs{font-size:12.5px;color:#0a2823;background:#f8f2e6;border-radius:10px;padding:8px 10px;margin-bottom:8px;line-height:1.5}'+
  '.agl .agl-hl{font-size:12.5px;line-height:1.5;padding:7px 0;border-bottom:1px solid #f0eadc}.agl .agl-hh{font:700 11px ui-monospace,Menlo,monospace;color:#9a7a34}.agl .agl-hr{color:#2a6a77;font-size:12px}.agl .agl-hl s{color:#a3a39a}.agl .agl-bt .hi{border-color:#2a6a77;color:#2a6a77}';
  document.head.appendChild(s);}

 /* HIST_20261020 — o que o cliente simula no link: cada configuração em que ele parou 3 s ou mais
    vira uma linha no histórico (campos, modos e os resultados principais). Só roda no link do cliente. */
 var RES={'calc-alavancagem':[['o_lucro','Lucro na venda da carta'],['o_pini','Parcela inicial'],['o_credlib','Crédito liberado'],['p_patrim','Patrimônio construído']],
  'calc-financiamento':[['o_c_ent','Entrada (consórcio)'],['o_c_parc','Parcela do consórcio'],['o_f_parc','Parcela do financiamento'],['v_eco','Patrimônio a mais no fim']]};
 var SEGN={segTipo:'Tipo de carta',segSys:'Financiamento',segCEnt:'Entrada (consórcio) em',segFEnt:'Entrada (financiamento) em',segFRate:'Taxa do financiamento em'};
 function pagAtual(){return location.pathname.replace(/^\/+|\.html$/g,'');}
 function rotulo(el){var f=el.closest('.f,.fld');var l=f&&f.querySelector('label');if(!l)return el.getAttribute('placeholder')||el.id;var c=l.cloneNode(true);c.querySelectorAll('small,.q').forEach(function(x){x.remove();});return c.textContent.replace(/\s+/g,' ').trim()||el.id;}
 var UN={cred:'R$',c_parc:'R$',c_taxa:'%',c_prazo:'meses',c_ptot:'meses',c_pdec:'meses',c_cont:'meses',c_reaj:'% a.a.',cdi:'% a.a.',rinv:'% a.m.',f_prazo:'meses'};
 function unid(el){var f=el.closest('.f,.fld');if(!f)return UN[el.id]||'';var u=f.querySelector('.u');if(u)return u.textContent.trim();var g=f.querySelector('.seg .on');return g?g.textContent.trim():(UN[el.id]||'');}
 function foto(){var cp=[],md=[],rs=[];
  document.querySelectorAll('input[id],select[id]').forEach(function(el){if(el.type==='hidden'||el.type==='checkbox'||el.offsetParent===null||el.closest('.agl'))return;cp.push([el.id,rotulo(el),norm(el.value),unid(el)]);});
  document.querySelectorAll('.seg[id]').forEach(function(g){if(g.offsetParent===null||g.closest('.agl')||(g.id!=='segTipo'&&g.id!=='segSys'))return;var on=g.querySelector('.on');if(on)md.push([g.id,SEGN[g.id]||g.id,on.textContent.trim()]);});
  (RES[pagAtual()]||[]).forEach(function(r){var e=document.getElementById(r[0]);if(e&&e.offsetParent!==null){var t=e.textContent.replace(/\s+/g,' ').trim();if(t&&t!=='—')rs.push([r[1],t]);}});
  return {campos:cp,modos:md,res:rs};}
 function norm(v){v=String(v==null?'':v).trim().replace(/^R\$\s*/,'');if(/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(v))return v.replace(/\./g,'').replace(',','.');if(/^-?\d+,\d+$/.test(v))return v.replace(',','.');return v;}
 function chave(f){return JSON.stringify([f.campos.map(function(c){return c[0]+'='+c[2]+c[3];}),f.modos.map(function(m){return m[0]+'='+m[2];})]);}
 function rastrear(){var qs=new URLSearchParams(location.search),t=qs.get('acesso');if(!t||W.__agHist)return;W.__agHist=1;
  var pag=pagAtual(),ult=null,tm=null,mexeu=false,n=0;
  function envia(){tm=null;if(!mexeu)return;var f=foto(),k=chave(f);if(k===ult)return;ult=k;n++;
   try{fetch(API+'/api/link_evento',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({t:t,p:pag,d:f}),keepalive:true}).catch(function(){});}catch(e){}}
  function mexe(e){if(e&&e.target&&e.target.closest&&e.target.closest('.agl'))return;mexeu=true;clearTimeout(tm);tm=setTimeout(envia,3000);}
  setTimeout(function(){ult=chave(foto());},1200);   /* o que abriu na tela não conta: só o que ele mudar */
  document.addEventListener('input',mexe,true);document.addEventListener('change',mexe,true);
  document.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('.seg button'))mexe(e);},true);}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',rastrear);else rastrear();

 /* histórico na lista de links da equipe */
 function historico(t){return fetch(API+'/api/link_historico?t='+encodeURIComponent(t),{headers:{Authorization:'Bearer '+tok()}}).then(function(r){return r.json();});}
 function num(v){var x=String(v).replace(/\s/g,'');if(/^-?\d+(\.\d+)?$/.test(x)){var n=+x;return Math.abs(n)>=1000?n.toLocaleString('pt-BR',{maximumFractionDigits:2}):String(x).replace('.',',');}return v;}
 function val(c){var u=c[3]||'',v=num(c[2]);if(v==='')return '(vazio)';if(u==='m')u='meses';if(!u)return v;if(u==='R$')return 'R$ '+v;return v+(/^%/.test(u)?'':' ')+u;}
 function hora(ts){var d=new Date(ts*1000);return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})+' '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});}
 function faixas(ev){var por={};ev.forEach(function(e){(e.d.campos||[]).forEach(function(c){var k=c[0];(por[k]=por[k]||{l:c[1],u:c[3],v:[]}).v.push(c[2]);});});
  var out=[];Object.keys(por).forEach(function(k){var p=por[k],vs=p.v.filter(function(x,i,a){return a.indexOf(x)===i;});if(vs.length<2)return;
   var nums=vs.map(function(x){return parseFloat(String(x).replace(',','.'));}).filter(function(x){return !isNaN(x);});
   out.push('<b>'+esc(p.l)+'</b> '+(nums.length===vs.length?esc(val([k,p.l,String(Math.min.apply(0,nums)),p.u]))+' a '+esc(val([k,p.l,String(Math.max.apply(0,nums)),p.u])):vs.map(function(x){return esc(val([k,p.l,x,p.u]));}).join(' / ')));});
  return out;}
 function htmlHist(j){var ev=j.eventos||[];if(!ev.length)return '<div class="agl-vz">O cliente ainda não mexeu nos números.</div>';
  var ant=null,linhas=ev.map(function(e){var d=e.d||{},cp=d.campos||[],md=d.modos||[],ch=[];
   if(!ant){ch=cp.filter(function(c){return c[2]!=='';}).map(function(c){return esc(c[1])+' <b>'+esc(val(c))+'</b>';});md.forEach(function(m){ch.push(esc(m[1])+' <b>'+esc(m[2])+'</b>');});}
   else{var A={},M={};(ant.campos||[]).forEach(function(c){A[c[0]]=c;});(ant.modos||[]).forEach(function(m){M[m[0]]=m[2];});
    cp.forEach(function(c){var o=A[c[0]];if(!o||o[2]!==c[2]||o[3]!==c[3])ch.push(esc(c[1])+' '+(o?'<s>'+esc(val(o))+'</s> → ':'')+'<b>'+esc(val(c))+'</b>');});
    md.forEach(function(m){if(M[m[0]]!==m[2])ch.push(esc(m[1])+' <b>'+esc(m[2])+'</b>');});}
   ant=d;var rs=(d.res||[]).map(function(r){return esc(r[0])+': <b>'+esc(r[1])+'</b>';}).join(' · ');
   return '<div class="agl-hl"><div class="agl-hh">'+hora(e.ts)+'</div><div>'+(ch.join(' · ')||'mesma simulação')+'</div>'+(rs?'<div class="agl-hr">'+rs+'</div>':'')+'</div>';});
  var fx=faixas(ev);
  return '<div class="agl-hs"><b>'+ev.length+' simulaç'+(ev.length>1?'ões':'ão')+'</b> em que ele parou para pensar'+(fx.length?'. O que ele está cogitando: '+fx.join(' · '):'')+'</div>'+linhas.reverse().join('');}
 function lerCache(){try{return JSON.parse(localStorage.getItem(CACHE)||'[]');}catch(e){return [];}}
 function gravaCache(l){try{localStorage.setItem(CACHE,JSON.stringify(l.slice(0,40)));}catch(e){}}
 function lista(p){var t=tok();if(!t)return Promise.resolve({links:lerCache(),offline:1});
  return fetch(API+'/api/link_lista'+(p?'?p='+encodeURIComponent(p):''),{headers:{Authorization:'Bearer '+t}}).then(function(r){return r.json();}).then(function(j){if(j&&j.ok){gravaCache(j.links);return j;}return {links:lerCache(),offline:1};}).catch(function(){return {links:lerCache(),offline:1};});}
 function criar(p,horas,cliente){return fetch(API+'/api/link_temp',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+tok()},body:JSON.stringify({pagina:p,horas:horas,cliente:cliente||''})}).then(function(r){return r.json();});}
 function encerrar(t){return fetch(API+'/api/link_encerrar',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+tok()},body:JSON.stringify({token:t})}).then(function(r){return r.json();});}
 function copiar(u){try{navigator.clipboard.writeText(u);return true;}catch(e){}try{var i=document.createElement('textarea');i.value=u;document.body.appendChild(i);i.select();document.execCommand('copy');i.remove();return true;}catch(e){}return false;}
 function selecionado(){try{return JSON.parse(localStorage.getItem(SEL_KEY)||'null');}catch(e){return null;}}
 function mount(root,opt){opt=opt||{};css();var pag=opt.pagina||'calc-alavancagem',horas=48,links=[],mostrarExp=false,timer=null;
  root.classList.add('agl');
  root.innerHTML=(opt.escolher?'<div class="agl-k">Ferramenta</div><select class="agl-fe" style="width:100%;margin-bottom:12px">'+Object.keys(FERR).map(function(k){return '<option value="'+k+'"'+(k===pag?' selected':'')+'>'+FERR[k]+'</option>';}).join('')+'</select>':'')+
   '<div class="agl-k">Por quanto tempo o link fica aberto?</div>'+
   '<div class="agl-chips"><button type="button" class="agl-chip" data-h="24">1 dia</button><button type="button" class="agl-chip on" data-h="48">2 dias</button><button type="button" class="agl-chip" data-h="72">3 dias</button><button type="button" class="agl-chip" data-h="c">Personalizado</button></div>'+
   '<div class="agl-cust"><input type="number" class="agl-n" min="1" max="168" value="5" style="width:90px"><select class="agl-u"><option value="24">dias</option><option value="1">horas</option></select><span class="agl-sub">até 7 dias</span></div>'+
   '<div class="agl-row"><input class="agl-cl" placeholder="Nome do cliente (opcional)" maxlength="80"><button type="button" class="agl-go" style="margin:0">Gerar link</button></div>'+
   '<div class="agl-msg"></div>'+
   '<div class="agl-lh"><div class="agl-k" style="margin:0">Links gerados</div><label><input type="checkbox" class="agl-ex"> mostrar expirados</label></div>'+
   '<div class="agl-ls"><div class="agl-vz">Carregando…</div></div>';
  var $=function(s){return root.querySelector(s);},msg=function(t,er){var m=$('.agl-msg');m.textContent=t||'';m.className='agl-msg'+(er?' er':'');};
  if(opt.escolher)$('.agl-fe').onchange=function(){pag=this.value;carregar();};
  root.querySelectorAll('.agl-chip').forEach(function(b){b.onclick=function(){root.querySelectorAll('.agl-chip').forEach(function(x){x.classList.remove('on');});b.classList.add('on');var h=b.getAttribute('data-h');$('.agl-cust').classList.toggle('on',h==='c');horas=h==='c'?null:+h;};});
  function horasEsc(){if(horas)return horas;var n=parseFloat($('.agl-n').value)||1,u=+$('.agl-u').value;return Math.max(1,Math.min(168,n*u));}
  $('.agl-ex').onchange=function(){mostrarExp=this.checked;desenha();};
  $('.agl-go').onclick=function(){var b=this,h=horasEsc();if(!tok()){msg('Entre na plataforma para gerar links.',1);return;}
   b.disabled=true;msg('Gerando…');criar(pag,h,$('.agl-cl').value.trim()).then(function(j){b.disabled=false;
    if(!j||!j.ok){msg('Não gerou: '+((j&&j.error)||'erro'),1);return;}
    var cp=copiar(j.url);msg('Link criado'+(cp?' e copiado ✓':'')+' — válido até '+quando(j.expira)+'.');
    $('.agl-cl').value='';carregar(j.url);}).catch(function(){b.disabled=false;msg('Sem conexão com o servidor.',1);});};
  function desenha(){var ls=$('.agl-ls'),agora=Date.now()/1000,sel=selecionado();
   var vis=links.filter(function(l){return mostrarExp||l.expira>agora;});
   if(!vis.length){ls.innerHTML='<div class="agl-vz">'+(links.length?'Nenhum link ativo. Marque “mostrar expirados” para ver os antigos.':'Nenhum link gerado ainda.')+'</div>';return;}
   ls.innerHTML=vis.map(function(l){var ex=l.expira<=agora,on=sel&&sel.token===l.token;
    return '<div class="agl-it'+(ex?' exp':'')+(on?' sel':'')+'" data-t="'+esc(l.token)+'"><div class="agl-t1"><span>'+esc(FERR[l.pagina]||l.pagina)+(l.cliente?' · '+esc(l.cliente):'')+'</span><span class="agl-cd" data-e="'+l.expira+'">'+(ex?'expirado':'⏱ '+falta(l.expira))+'</span></div>'+
     '<div class="agl-url">'+esc(l.url)+'</div><div class="agl-sub">'+(ex?'Expirou em ':'Válido até ')+quando(l.expira)+(l.aberturas?' · aberto '+l.aberturas+'×':' · ainda não aberto')+(l.sims?' · <b style="color:#2a6a77">'+l.sims+' simulaç'+(l.sims>1?'ões':'ão')+' do cliente</b>':'')+'</div>'+
     (ex&&l.sims?'<div class="agl-bt"><button type="button" class="hi" data-a="hi">Histórico do cliente ('+l.sims+')</button></div>':'')+
     (ex?'':'<div class="agl-bt">'+(l.sims?'<button type="button" class="hi" data-a="hi">Histórico do cliente ('+l.sims+')</button>':'')+'<button type="button" data-a="cp">Copiar</button><a class="wa" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent('Segue a sua simulação da Agion Consórcios (link válido até '+quando(l.expira)+'): '+l.url)+'">WhatsApp</a>'+
      (opt.selecionavel?'<button type="button" class="us'+(on?' on':'')+'" data-a="us">'+(on?'✓ Na proposta':'Usar na proposta')+'</button>':'')+'<button type="button" data-a="en">Encerrar</button></div>')+'</div>';}).join('');
   ls.querySelectorAll('[data-a]').forEach(function(b){b.onclick=function(){var t=b.closest('.agl-it').getAttribute('data-t'),l=links.filter(function(x){return x.token===t;})[0];if(!l)return;var a=b.getAttribute('data-a');
    if(a==='hi'){var it=b.closest('.agl-it'),hb=it.querySelector('.agl-h');if(hb){hb.remove();return;}hb=document.createElement('div');hb.className='agl-h';hb.innerHTML='<div class="agl-vz">Carregando…</div>';it.appendChild(hb);
     historico(t).then(function(j){hb.innerHTML=j&&j.ok?htmlHist(j):'<div class="agl-vz">Não consegui abrir o histórico agora.</div>';}).catch(function(){hb.innerHTML='<div class="agl-vz">Sem conexão com o servidor.</div>';});return;}
    if(a==='cp'){copiar(l.url);b.textContent='Copiado ✓';setTimeout(function(){b.textContent='Copiar';},1500);}
    else if(a==='us'){var s=selecionado();if(s&&s.token===t){localStorage.removeItem(SEL_KEY);}else{localStorage.setItem(SEL_KEY,JSON.stringify({token:l.token,url:l.url,expira:l.expira,pagina:l.pagina,cliente:l.cliente||''}));}desenha();opt.onSel&&opt.onSel(selecionado());}
    else if(a==='en'){if(!confirm('Encerrar este link agora? Quem tiver o link não consegue mais abrir.'))return;encerrar(t).then(function(){var s=selecionado();if(s&&s.token===t){localStorage.removeItem(SEL_KEY);opt.onSel&&opt.onSel(null);}carregar();});}};});}
  function carregar(novo){lista(opt.escolher?'':pag).then(function(j){links=(j.links||[]).filter(function(l){return !l.pagina||!FERR[l.pagina]||opt.escolher||l.pagina===pag;});
   if(novo&&opt.selecionavel){var l=links.filter(function(x){return x.url===novo;})[0];if(l){localStorage.setItem(SEL_KEY,JSON.stringify({token:l.token,url:l.url,expira:l.expira,pagina:l.pagina,cliente:l.cliente||''}));opt.onSel&&opt.onSel(selecionado());}}
   desenha();if(j.offline&&!tok())msg('Entre na plataforma para ver e gerar links.',1);});}
  carregar();clearInterval(timer);timer=setInterval(function(){if(!document.body.contains(root)){clearInterval(timer);return;}var agora=Date.now()/1000,mudou=false;
   root.querySelectorAll('.agl-cd').forEach(function(c){var e=+c.getAttribute('data-e');if(e<=agora&&c.textContent!=='expirado'){mudou=true;}c.textContent=e<=agora?'expirado':'⏱ '+falta(e);});
   if(mudou){desenha();opt.onSel&&opt.onSel(selecionado());}},1000);
  return {recarregar:carregar};}
 function modal(opt){css();var bg=document.createElement('div');bg.style.cssText='position:fixed;inset:0;z-index:2147483600;background:rgba(4,20,18,.55);display:flex;align-items:center;justify-content:center;padding:12px';
  bg.innerHTML='<div style="background:#fff;border-radius:22px;max-width:520px;width:100%;max-height:calc(100vh - 24px);overflow:auto;padding:22px;box-shadow:0 30px 80px rgba(0,0,0,.3)"><div style="font:700 11px system-ui;letter-spacing:.12em;color:#9a7a34">LINK PARA O CLIENTE</div><h3 style="font:600 22px Lora,Georgia,serif;margin:6px 0 4px;color:#0a2823">Enviar esta calculadora</h3><p style="color:#586b62;font:13.5px Poppins,system-ui;margin:0 0 16px">O cliente abre sem login até o prazo acabar. Você pode gerar quantos links quiser, cada um com o seu tempo.</p><div class="agm"></div><button type="button" class="agx" style="margin-top:14px;width:100%;border:1px solid #e0d6bf;background:#fff;border-radius:12px;padding:11px;font:600 13px Poppins,system-ui;cursor:pointer;color:#0a2823">Fechar</button></div>';
  document.body.appendChild(bg);bg.querySelector('.agx').onclick=function(){bg.remove();};bg.onclick=function(e){if(e.target===bg)bg.remove();};
  mount(bg.querySelector('.agm'),opt);}
 W.AgCalcLink={mount:mount,modal:modal,falta:falta,quando:quando,selecionado:selecionado,FERR:FERR,historico:historico,htmlHist:htmlHist,foto:foto};
})(window);
