/* Agion · Links temporários das calculadoras (Chat B · 19/out/2026)
   Componente usado no Gerador de propostas, nas próprias calculadoras e no Histórico de ferramentas.
   AgCalcLink.mount(el,{pagina,escolher,selecionavel,onSel,leads,lead,onVer,onCriado,tema}) -> painel embutido
   AgCalcLink.modal({...mesmas opções, z, titulo})                                        -> janela por cima da página
   AgCalcLink.falta(expiraSeg)                                                             -> "1d 4h 10min"
   20/out (HISTFERR): o cliente vem da busca do CRM (lead_id vai junto); a lista de links e o
   "Histórico do cliente" passaram para o Histórico de ferramentas da plataforma. O rastreio
   (rastrear / /api/link_evento) continua exatamente igual. */
(function(W){
 if(W.AgCalcLink)return;
 var API='https://bot.agionconsorcios.com.br';
 var FERR={'calc-alavancagem':'Calculadora de alavancagem','calc-financiamento':'Calculadora de financiamento','calc-avista':'Calculadora consórcio × à vista','calc-lance':'Calculadora de lance livre','calc-reajuste':'Calculadora de reajuste da carta','escada-financeira':'Escadas'};/* REAJUSTE_29OUT *//* ESCADA_LINK_27OUT *//* AVISTA_24OUT · LANCE_FERRAMENTA_26OUT */
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
  'calc-financiamento':[['o_c_ent','Entrada (consórcio)'],['o_c_parc','Parcela do consórcio'],['o_f_parc','Parcela do financiamento'],['v_eco','Patrimônio a mais no fim']],
  'calc-avista':[['o_c_ent','Entrada ou lance (consórcio)'],['o_c_parc','Parcela do consórcio'],['o_a_preco','Preço à vista'],['v_eco','Patrimônio a mais no fim'],['v_emp','Rendimento de empate']],
  'calc-lance':[['v_head','Melhor grupo'],['k_alvo','Lance alvo'],['k_need','Lance necessário'],['k_liq','Crédito líquido']],
  'calc-reajuste':[['v_carta','Carta na contemplação'],['k1v','Parcela hoje'],['k2v','Parcela na contemplação'],['k4v','Custo acima do índice']]};/* REAJUSTE_29OUT */
 var SEGN={segDC:'Desconto vale na carta',segTipo:'Tipo de carta',segSys:'Financiamento',segCEnt:'Entrada (consórcio) em',segFEnt:'Entrada (financiamento) em',segFRate:'Taxa do financiamento em',sMeia:'Parcela até contemplar'};
 function pagAtual(){return location.pathname.replace(/^\/+|\.html$/g,'');}
 function rotulo(el){var f=el.closest('.f,.fld');var l=f&&f.querySelector('label');if(!l)return el.getAttribute('placeholder')||el.id;var c=l.cloneNode(true);c.querySelectorAll('small,.q').forEach(function(x){x.remove();});return c.textContent.replace(/\s+/g,' ').trim()||el.id;}
 var UN={c_parcc:'R$',p_bem:'R$',p_desc:'%',p_val:'% a.a.',din:'R$',ir:'%',c_cred:'R$',c_emb:'%',cred:'R$',c_parc:'R$',c_taxa:'%',c_prazo:'meses',c_ptot:'meses',c_pdec:'meses',c_cont:'meses',c_reaj:'% a.a.',cdi:'% a.a.',rinv:'% a.m.',f_prazo:'meses'};
 function unid(el){var f=el.closest('.f,.fld');if(!f)return UN[el.id]||'';var u=f.querySelector('.u');if(u)return u.textContent.trim();var g=f.querySelector('.seg .on');return g?g.textContent.trim():(UN[el.id]||'');}
 function foto(){var cp=[],md=[],rs=[];
  document.querySelectorAll('input[id],select[id]').forEach(function(el){if(el.type==='hidden'||el.type==='checkbox'||el.offsetParent===null||el.closest('.agl'))return;cp.push([el.id,rotulo(el),norm(el.value),unid(el)]);});
  document.querySelectorAll('.seg[id],.snav[id]').forEach(function(g){if(g.offsetParent===null||g.closest('.agl')||(g.id!=='segTipo'&&g.id!=='segSys'&&g.id!=='segDC'&&g.id!=='sMeia'))return;var on=g.querySelector('.on');if(on)md.push([g.id,SEGN[g.id]||g.id,on.textContent.trim()]);});
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
 function faixasArr(ev){var por={};ev.forEach(function(e){((e.d||{}).campos||[]).forEach(function(c){var k=c[0];(por[k]=por[k]||{l:c[1],u:c[3],v:[]}).v.push(c[2]);});});
  var out=[];Object.keys(por).forEach(function(k){var p=por[k],vs=p.v.filter(function(x,i,a){return a.indexOf(x)===i;});if(vs.length<2)return;
   var nums=vs.map(function(x){return parseFloat(String(x).replace(',','.'));}).filter(function(x){return !isNaN(x);});
   out.push([p.l,nums.length===vs.length?val([k,p.l,String(Math.min.apply(0,nums)),p.u])+' a '+val([k,p.l,String(Math.max.apply(0,nums)),p.u]):vs.map(function(x){return val([k,p.l,x,p.u]);}).join(' / ')]);});
  return out;}
 function faixas(ev){return faixasArr(ev).map(function(f){return '<b>'+esc(f[0])+'</b> '+esc(f[1]);});}
 /* cada simulação: o que mudou em relação à anterior (a 1ª mostra tudo) + os resultados principais */
 function difs(ev){var ant=null;return ev.map(function(e){var d=e.d||{},cp=d.campos||[],md=d.modos||[],ch=[];
   if(!ant){ch=cp.filter(function(c){return c[2]!=='';}).map(function(c){return esc(c[1])+' <b>'+esc(val(c))+'</b>';});md.forEach(function(m){ch.push(esc(m[1])+' <b>'+esc(m[2])+'</b>');});}
   else{var A={},M={};(ant.campos||[]).forEach(function(c){A[c[0]]=c;});(ant.modos||[]).forEach(function(m){M[m[0]]=m[2];});
    cp.forEach(function(c){var o=A[c[0]];if(!o||o[2]!==c[2]||o[3]!==c[3])ch.push(esc(c[1])+' '+(o?'<s>'+esc(val(o))+'</s> → ':'')+'<b>'+esc(val(c))+'</b>');});
    md.forEach(function(m){if(M[m[0]]!==m[2])ch.push(esc(m[1])+' <b>'+esc(m[2])+'</b>');});}
   ant=d;return {ts:e.ts,ch:ch,rs:(d.res||[]).map(function(r){return esc(r[0])+': <b>'+esc(r[1])+'</b>';})};});}
 function htmlHist(j){var ev=j.eventos||[];if(!ev.length)return '<div class="agl-vz">O cliente ainda não mexeu nos números.</div>';
  var linhas=difs(ev).map(function(x){var rs=x.rs.join(' · ');return '<div class="agl-hl"><div class="agl-hh">'+hora(x.ts)+'</div><div>'+(x.ch.join(' · ')||'mesma simulação')+'</div>'+(rs?'<div class="agl-hr">'+rs+'</div>':'')+'</div>';});
  var fx=faixas(ev);
  return '<div class="agl-hs"><b>'+ev.length+' simulaç'+(ev.length>1?'ões':'ão')+'</b> em que ele parou para pensar'+(fx.length?'. O que ele está cogitando: '+fx.join(' · '):'')+'</div>'+linhas.reverse().join('');}

 /* HISTFERR_20261020 — o link nasce ligado ao cliente do CRM (lead_id). A lista de links e o
    "Histórico do cliente" saíram daqui: moram no Histórico de ferramentas da plataforma. */
 var SUPA='https://sfekirqoflozylghwlbe.supabase.co',SKEY='sb_publishable_Ds4PlQmsvnny5GdALHvVYQ_RHgtFXw2';
 var PLAT='/plataforma#historico-ferramentas';
 var ETAPA=['Novo lead','Contato feito','Estudo/Simulação','Proposta enviada','Fechado (ganho)'];
 function etapaDe(l){var s=+l.stage||0;if(l.perdido)return 'Perdido';if(s===2&&l.compareceu===true)return 'Diagnóstico';if(s===2&&l.reuniao_em)return 'Reunião agendada';return ETAPA[Math.max(0,Math.min(4,s))];}
 function fone(t){var n=String(t||'').split('·')[0].replace(/\D/g,'');if(n.length>=10&&n.length<=11)n='55'+n;return n.length>=12?n:'';}
 function rest(path){var t=tok();if(!t)return Promise.reject(new Error('sem sessão'));return fetch(SUPA+'/rest/v1/'+path,{headers:{apikey:SKEY,Authorization:'Bearer '+t}}).then(function(r){if(!r.ok)throw new Error('http '+r.status);return r.json();});}
 var _perf=null;
 function perfis(){if(_perf)return _perf;_perf=rest('profiles?select=id,nome').then(function(rs){var m={};(rs||[]).forEach(function(p){if(p&&p.id)m[p.id]=p.nome||'';});return m;}).catch(function(){_perf=null;return {};});return _perf;}
 function buscaLeads(q){q=String(q||'').replace(/[(),*%\\]/g,' ').trim();if(q.length<2)return Promise.resolve([]);
  var dg=q.replace(/\D/g,''),f='nome.ilike.*'+encodeURIComponent(q)+'*'+(dg.length>=4?',contato.ilike.*'+dg+'*':'');
  return Promise.all([rest('leads?select=id,nome,stage,owner_id,contato,reuniao_em,compareceu,perdido,tipo&or=('+f+')&order=criado_em.desc&limit=12'),perfis()]).then(function(r){var P=r[1]||{};
   return (r[0]||[]).filter(function(l){return l.owner_id||String(l.tipo||'').toLowerCase()!=='reengajamento';}/* REENG_FORA_CRM_20261020 */).slice(0,8).map(function(l){return {id:l.id,nome:l.nome||'—',etapa:etapaDe(l),esp:P[l.owner_id]||'',tel:l.contato||''};});});}
 function norma(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');}
 function criar(p,horas,cliente,lead){var b={pagina:p,horas:horas,cliente:cliente||''};if(lead)b.lead_id=lead;
  return fetch(API+'/api/link_temp',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+tok()},body:JSON.stringify(b)}).then(function(r){return r.json();});}
 function encerrar(t){return fetch(API+'/api/link_encerrar',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+tok()},body:JSON.stringify({token:t})}).then(function(r){return r.json();});}
 function copiar(u,falhou){function fb(){try{var i=document.createElement('textarea');i.value=u;i.setAttribute('readonly','');i.style.cssText='position:fixed;opacity:0;left:-99px';document.body.appendChild(i);i.select();var ok=document.execCommand('copy');i.remove();if(!ok&&falhou)falhou();}catch(e){if(falhou)falhou();}}
  try{var p=navigator.clipboard&&navigator.clipboard.writeText(u);if(p&&p.then){p.catch(fb);return true;}}catch(e){}fb();return true;}
 function selecionado(){try{return JSON.parse(localStorage.getItem(SEL_KEY)||'null');}catch(e){return null;}}
 function waTexto(u,exp){return 'Segue a sua simulação da Agion Consórcios (link válido até '+quando(exp)+'): '+u;}
 function waUrl(tel,txt){var n=fone(tel);return 'https://wa.me/'+(n||'')+'?text='+encodeURIComponent(txt);}
 function abrePlat(lead){var u=PLAT+(lead?'?lead='+encodeURIComponent(lead):'');var w=null;try{w=window.open(u,'_blank');}catch(e){}if(!w)location.href=u;}
 function css2(){if(document.getElementById('agl-css2'))return;var s=document.createElement('style');s.id='agl-css2';s.textContent=
  '.agl .agl-cli{position:relative}.agl .agl-q{width:100%}'+
  '.agl .agl-sug{position:absolute;left:0;right:0;top:calc(100% + 4px);background:#fff;border:1px solid #e0d6bf;border-radius:12px;box-shadow:0 18px 40px -16px rgba(10,40,35,.35);z-index:5;overflow:hidden;display:none;max-height:300px;overflow-y:auto}'+
  '.agl .agl-sug.on{display:block}.agl .agl-sug button{display:block;width:100%;text-align:left;border:0;background:none;padding:10px 12px;font:500 13px Poppins,system-ui;color:#0a2823;cursor:pointer;border-bottom:1px solid #f0eadc}'+
  '.agl .agl-sug button:hover,.agl .agl-sug button.on{background:#f8f2e6}.agl .agl-sug button small{display:block;color:#8a9089;font-size:11.5px;margin-top:1px}.agl .agl-sug .agl-mn{color:#9a7a34;font-weight:600}'+
  '.agl .agl-esc{display:flex;align-items:center;gap:10px;border:1.5px solid #c5a059;background:#f8f2e6;border-radius:12px;padding:10px 12px}.agl .agl-esc b{display:block;font-size:13.5px}.agl .agl-esc small{display:block;color:#586b62;font-size:12px}'+
  '.agl .agl-esc button{margin-left:auto;border:1px solid #e0d6bf;background:#fff;border-radius:9px;padding:6px 10px;font:600 12px Poppins,system-ui;cursor:pointer;color:#0a2823}'+
  '.agl .agl-alt{border:0;background:none;color:#9a7a34;font:600 12px Poppins,system-ui;cursor:pointer;padding:6px 0 0;text-decoration:underline;text-underline-offset:3px}'+
  '.agl .agl-acts{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.agl .agl-acts button{border:0;border-radius:12px;padding:12px 14px;font:700 13.5px Poppins,system-ui;cursor:pointer}'+
  '.agl .agl-acts .agl-go{width:auto;margin:0;flex:1 1 180px}.agl .agl-acts .agl-wa{background:#25D366;color:#fff;flex:1 1 160px}.agl .agl-acts .agl-ver{background:none;border:1.5px solid #e0d6bf;color:#0a2823;flex:1 1 100%}'+
  '.agl .agl-acts button[disabled]{opacity:.55;cursor:wait}'+
  '.agl .agl-res{margin-top:12px;border:1px solid #e0d6bf;background:#fff;border-radius:14px;padding:12px 14px}.agl .agl-res .agl-t1 span:last-child{color:#2a6a77}'+
  '.agl.agv4{font-family:"DM Sans",system-ui,sans-serif;color:var(--ink)}.agl.agv4 .agl-k{color:var(--goldd)}.agl.agv4 .agl-chip,.agl.agv4 .agl-sug,.agl.agv4 .agl-res,.agl.agv4 .agl-esc button{background:var(--card);color:var(--ink);border-color:var(--line);font-family:inherit}'+
  '.agl.agv4 .agl-chip.on,.agl.agv4 .agl-esc{background:color-mix(in srgb,var(--gold2) 22%,var(--card));border-color:var(--gold)}.agl.agv4 input,.agl.agv4 select{background:var(--bg);border-color:var(--line);color:var(--ink);font-family:inherit}'+
  '.agl.agv4 .agl-sug button{color:var(--ink);border-color:var(--line);font-family:inherit}.agl.agv4 .agl-sug button:hover,.agl.agv4 .agl-sug button.on{background:var(--bg)}.agl.agv4 .agl-sug button small,.agl.agv4 .agl-esc small,.agl.agv4 .agl-msg,.agl.agv4 .agl-sub,.agl.agv4 .agl-url{color:var(--mut)}'+
  '.agl.agv4 .agl-go{background:var(--ink);color:var(--gold2);font-family:inherit}.agl.agv4 .agl-acts .agl-ver{border-color:var(--line);color:var(--ink);font-family:inherit}.agl.agv4 .agl-acts .agl-wa{font-family:inherit}.agl.agv4 .agl-alt{color:var(--goldd);font-family:inherit}'+
  '.agl.agv4 .agl-bt button,.agl.agv4 .agl-bt a{background:var(--card);color:var(--ink);border-color:var(--line);font-family:inherit}.agl.agv4 .agl-bt .wa{background:#25D366;border-color:#25D366;color:#fff}';
  document.head.appendChild(s);}
 var VAL=[[1,'1 h'],[2,'2 h'],[24,'1 dia'],[48,'2 dias']];
 /* opt: pagina, escolher, selecionavel, onSel, leads (lista do CRM já carregada), lead ({id,nome,tel}), onVer(leadId), onCriado(j), tema:'v4' */
 function mount(root,opt){opt=opt||{};css();css2();var pag=opt.pagina||'calc-alavancagem',horas=48,cli=opt.lead&&opt.lead.id?opt.lead:null,manual=false,ult=null,sug=[],si=-1,tq=null;
  root.classList.add('agl');if(opt.tema==='v4')root.classList.add('agv4');
  root.innerHTML=(opt.escolher?'<div class="agl-k">Ferramenta</div><select class="agl-fe" style="width:100%;margin-bottom:14px">'+Object.keys(FERR).map(function(k){return '<option value="'+k+'"'+(k===pag?' selected':'')+'>'+FERR[k]+'</option>';}).join('')+'</select>':'')+
   '<div class="agl-k">Cliente</div><div class="agl-cw"></div>'+
   '<div class="agl-k" style="margin-top:14px">Validade do link</div>'+
   '<div class="agl-chips">'+VAL.map(function(v){return '<button type="button" class="agl-chip'+(v[0]===48?' on':'')+'" data-h="'+v[0]+'">'+v[1]+'</button>';}).join('')+'</div>'+
   '<div class="agl-acts"><button type="button" class="agl-go">Gerar e copiar link</button><button type="button" class="agl-wa">Enviar no WhatsApp</button><button type="button" class="agl-ver">Ver no Histórico de ferramentas →</button></div>'+
   '<div class="agl-msg"></div><div class="agl-rs"></div>';
  var $=function(s){return root.querySelector(s);},msg=function(t,er){var m=$('.agl-msg');m.textContent=t||'';m.className='agl-msg'+(er?' er':'');};
  if(opt.escolher)$('.agl-fe').onchange=function(){pag=this.value;ult=null;$('.agl-rs').innerHTML='';};
  root.querySelectorAll('.agl-chip').forEach(function(b){b.onclick=function(){root.querySelectorAll('.agl-chip').forEach(function(x){x.classList.remove('on');});b.classList.add('on');horas=+b.getAttribute('data-h');ult=null;};});
  function nomeCli(){return cli?cli.nome:(manual?($('.agl-cl')&&$('.agl-cl').value.trim())||'':'');}
  function desenhaCli(){var w=$('.agl-cw');
   if(cli){w.innerHTML='<div class="agl-esc"><div><b>'+esc(cli.nome)+'</b><small>'+esc([cli.etapa,cli.esp].filter(Boolean).join(' · ')||'Cliente do CRM')+'</small></div><button type="button" data-a="tr">Trocar</button></div>';
    w.querySelector('[data-a=tr]').onclick=function(){cli=null;ult=null;desenhaCli();var q=$('.agl-q');if(q)q.focus();};return;}
   if(manual){w.innerHTML='<input class="agl-cl" placeholder="Nome do cliente" maxlength="80" style="width:100%"><button type="button" class="agl-alt" data-a="crm">Buscar no CRM</button>';
    w.querySelector('[data-a=crm]').onclick=function(){manual=false;desenhaCli();var q=$('.agl-q');if(q)q.focus();};$('.agl-cl').oninput=function(){ult=null;};return;}
   w.innerHTML='<div class="agl-cli"><input class="agl-q" placeholder="Buscar cliente no CRM: nome ou telefone" autocomplete="off"><div class="agl-sug"></div></div><button type="button" class="agl-alt" data-a="mn">Digitar nome (cliente fora do CRM)</button>';
   var q=$('.agl-q'),box=$('.agl-sug');
   w.querySelector('[data-a=mn]').onclick=function(){manual=true;ult=null;desenhaCli();var c=$('.agl-cl');if(c)c.focus();};
   function pinta(){if(!q.value.trim()){box.classList.remove('on');return;}
    box.innerHTML=(sug.length?sug.map(function(l,i){return '<button type="button" data-i="'+i+'" class="'+(i===si?'on':'')+'">'+esc(l.nome)+'<small>'+esc([l.etapa,l.esp].filter(Boolean).join(' · '))+'</small></button>';}).join(''):'<button type="button" disabled><small>Nenhum cliente encontrado</small></button>')+
     '<button type="button" data-i="m" class="agl-mn">Digitar “'+esc(q.value.trim())+'” (cliente fora do CRM)</button>';
    box.classList.add('on');
    box.querySelectorAll('[data-i]').forEach(function(b){b.onmousedown=function(e){e.preventDefault();};b.onclick=function(){var i=b.getAttribute('data-i');if(i==='m'){var t=q.value.trim();manual=true;desenhaCli();$('.agl-cl').value=t;return;}cli=sug[+i];ult=null;desenhaCli();};});}
   function busca(){var t=q.value.trim();si=-1;
    if(opt.leads){var n=norma(t),dg=t.replace(/\D/g,'');sug=t.length<1?[]:opt.leads.filter(function(l){return norma(l.nome).indexOf(n)>=0||(dg.length>=4&&String(l.tel||'').replace(/\D/g,'').indexOf(dg)>=0);}).slice(0,8);pinta();return;}
    clearTimeout(tq);tq=setTimeout(function(){buscaLeads(t).then(function(r){if(q.value.trim()!==t)return;sug=r;pinta();}).catch(function(){sug=[];pinta();});},220);}
   q.oninput=busca;q.onfocus=function(){if(q.value.trim())pinta();};q.onblur=function(){setTimeout(function(){box.classList.remove('on');},150);};
   q.onkeydown=function(e){if(!box.classList.contains('on'))return;if(e.key==='ArrowDown'){si=Math.min(sug.length-1,si+1);pinta();e.preventDefault();}else if(e.key==='ArrowUp'){si=Math.max(0,si-1);pinta();e.preventDefault();}else if(e.key==='Enter'&&si>=0&&sug[si]){cli=sug[si];ult=null;desenhaCli();e.preventDefault();}else if(e.key==='Escape'){box.classList.remove('on');}};}
  desenhaCli();
  function gera(){if(ult&&ult.expira>Date.now()/1000)return Promise.resolve(ult);if(!tok())return Promise.reject(new Error('Entre na plataforma para gerar links.'));
   if(!cli&&!nomeCli())return Promise.reject(new Error('Escolha o cliente do CRM (ou digite o nome).'));
   var c0=cli,n0=nomeCli();   /* GPT28_27: o link fica com o cliente de quando foi pedido; se trocar no meio, não usa */
   return criar(pag,horas,n0,c0?c0.id:'').then(function(j){if(!j||!j.ok)throw new Error('Não gerou: '+((j&&j.error)||'erro'));
    if(cli!==c0||nomeCli()!==n0)throw new Error('O cliente mudou enquanto o link era gerado. Toque de novo para gerar o link do cliente certo.');
    ult={token:j.token||String(j.url).split('acesso=').pop(),url:j.url+(opt.extra?(opt.extra()||''):''),expira:j.expira,pagina:pag,cliente:n0,lead:c0?c0.id:''};
    if(opt.selecionavel){try{localStorage.setItem(SEL_KEY,JSON.stringify({token:ult.token,url:ult.url,expira:ult.expira,pagina:pag,cliente:ult.cliente||''}));}catch(e){}opt.onSel&&opt.onSel(selecionado());}
    resultado();try{opt.onCriado&&opt.onCriado(ult);}catch(e){}return ult;});}
  function resultado(){var r=$('.agl-rs');if(!ult){r.innerHTML='';return;}
   r.innerHTML='<div class="agl-res"><div class="agl-t1"><span>'+esc(FERR[ult.pagina]||ult.pagina)+(ult.cliente?' · '+esc(ult.cliente):'')+'</span><span class="agl-cd">⏱ '+falta(ult.expira)+'</span></div><div class="agl-url">'+esc(ult.url)+'</div><div class="agl-sub">Válido até '+quando(ult.expira)+(opt.selecionavel?' · já está na proposta':'')+'</div>'+
    '<div class="agl-bt"><button type="button" data-a="cp">Copiar de novo</button><a class="wa" target="_blank" rel="noopener" href="'+esc(waUrl(cli&&cli.tel,waTexto(ult.url,ult.expira)))+'">WhatsApp</a></div></div>';
   r.querySelector('[data-a=cp]').onclick=function(){copiar(ult.url);this.textContent='Copiado ✓';var b=this;setTimeout(function(){b.textContent='Copiar de novo';},1500);};}
  $('.agl-go').onclick=function(){var b=this;b.disabled=true;msg('Gerando…');gera().then(function(l){b.disabled=false;msg('Link copiado ✓ — válido até '+quando(l.expira)+'.');copiar(l.url,function(){msg('Link pronto — válido até '+quando(l.expira)+'. Toque em “Copiar de novo” para copiar.');});})
   .catch(function(e){b.disabled=false;msg(e&&e.message?e.message:'Sem conexão com o servidor.',1);});};
  $('.agl-wa').onclick=function(){var b=this,w=null;if(!(ult&&ult.expira>Date.now()/1000)){try{w=window.open('','_blank');}catch(e){}}b.disabled=true;msg('Gerando…');
   gera().then(function(l){b.disabled=false;var u=waUrl(cli&&cli.tel,waTexto(l.url,l.expira));if(w&&!w.closed){try{w.location.href=u;}catch(e){location.href=u;}}else{var x=null;try{x=window.open(u,'_blank');}catch(e){}if(!x)location.href=u;}msg('Link pronto — válido até '+quando(l.expira)+'.');})
   .catch(function(e){b.disabled=false;try{w&&w.close();}catch(_){}msg(e&&e.message?e.message:'Sem conexão com o servidor.',1);});};
  $('.agl-ver').onclick=function(){var id=cli?cli.id:'';if(opt.onVer){opt.onVer(id);return;}abrePlat(id);};
  var timer=setInterval(function(){if(!document.body.contains(root)){clearInterval(timer);return;}var c=root.querySelector('.agl-cd');if(c&&ult)c.textContent=ult.expira<=Date.now()/1000?'expirado':'⏱ '+falta(ult.expira);},1000);
  return {recarregar:function(){},escolher:function(l){cli=l&&l.id?l:null;ult=null;desenhaCli();}};}
 function modal(opt){opt=opt||{};css();var bg=document.createElement('div'),v4=opt.tema==='v4';bg.className='agl-bg';bg.style.cssText='position:fixed;inset:0;z-index:'+(opt.z||2147483600)+';background:rgba(4,20,18,.55);display:flex;align-items:center;justify-content:center;padding:12px';
  bg.innerHTML='<div class="agl-box" style="background:'+(v4?'var(--card)':'#fff')+';border-radius:22px;max-width:520px;width:100%;max-height:calc(100vh - 24px);overflow:auto;padding:22px;box-shadow:0 30px 80px rgba(0,0,0,.3)"><div style="font:700 11px system-ui;letter-spacing:.12em;color:'+(v4?'var(--goldd)':'#9a7a34')+'">LINK PARA O CLIENTE</div><h3 style="font:600 22px Lora,Georgia,serif;margin:6px 0 4px;color:'+(v4?'var(--ink)':'#0a2823')+'">'+esc(opt.titulo||'Enviar esta calculadora')+'</h3><p style="color:'+(v4?'var(--mut)':'#586b62')+';font:13.5px '+(v4?'"DM Sans"':'Poppins')+',system-ui;margin:0 0 16px">O cliente abre sem login até o prazo acabar. Escolha o cliente do CRM: tudo o que ele abrir e simular aparece no Histórico de ferramentas.</p><div class="agm" style="padding-top:4px"></div><button type="button" class="agx" style="margin-top:14px;width:100%;border:1px solid '+(v4?'var(--line)':'#e0d6bf')+';background:'+(v4?'var(--card)':'#fff')+';border-radius:12px;padding:11px;font:600 13px '+(v4?'"DM Sans"':'Poppins')+',system-ui;cursor:pointer;color:'+(v4?'var(--ink)':'#0a2823')+'">Fechar</button></div>';
  document.body.appendChild(bg);var fecha=function(){bg.remove();try{opt.onClose&&opt.onClose();}catch(e){}};bg.querySelector('.agx').onclick=fecha;bg.onclick=function(e){if(e.target===bg)fecha();};
  var m=mount(bg.querySelector('.agm'),opt);m.fechar=fecha;m.el=bg;return m;}
 W.AgCalcLink={mount:mount,modal:modal,falta:falta,quando:quando,selecionado:selecionado,FERR:FERR,historico:historico,htmlHist:htmlHist,foto:foto,
  difs:difs,faixas:faixas,faixasArr:faixasArr,val:val,encerrar:encerrar,copiar:copiar,waUrl:waUrl,waTexto:waTexto,etapaDe:etapaDe};
})(window);
