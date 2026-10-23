/* ==========================================================================
   Agion — plat2-simcom.js · Simular comissão (aba Comissões) · SIMCOM_23OUT
   Botão "Simular comissão" no topo da aba Comissões, para todos (proprietário,
   líder e especialista). Abre uma janela à parte (o layout da aba não muda) e
   mostra, lado a lado, Cliente próprio × Lead da empresa para o mesmo crédito.
   Usa o MESMO motor da aba (cmsCalc da plataforma): clusters da competência
   (somando a produção de leads que a pessoa já tem), parcelas 33/12/12/12/31,
   datas (antecipação dia 23 / dia 10), Serviços da Âncora e pós-contemplação.
   Nada é gravado. Hierarquia: especialista vê só a comissão dele; líder, a dele
   e a da equipe; só o proprietário vê o que a administradora paga e o que fica
   com a Agion.
   ========================================================================== */
(function(){
'use strict';
var W=window;
function $(s,r){return (r||document).querySelector(s);}
function $$(s,r){return [].slice.call((r||document).querySelectorAll(s));}
function e4(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function ic(n,s){try{return W.I(n,s||15);}catch(e){return '';}}
function z(n){return (n<10?'0':'')+n;}
function isoHoje(){var d=new Date();return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate());}
function dBR(s){if(!s)return '—';var p=String(s).slice(0,10).split('-');return p[2]+'/'+p[1]+'/'+p[0];}
function rs(v){v=+v||0;return 'R$ '+v.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});}
function pc(r){return (r*100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%';}
function num(s){s=String(s||'').replace(/[^\d,.-]/g,'');if(s.indexOf(',')>=0)s=s.replace(/\./g,'').replace(',','.');else if((s.match(/\./g)||[]).length>1||/\.\d{3}$/.test(s))s=s.replace(/\./g,'');return +s||0;}
function papel(){try{return W.effRoleR();}catch(e){return 'especialista';}}
function master(){return papel()==='master';}
function eu(){try{return W.ME();}catch(e){return null;}}
function nomeDe(id){try{return (W.U[id]||{}).n||'—';}catch(e){return '—';}}
function papelDe(id){try{return (W.U[id]||{}).role||'';}catch(e){return '';}}
var CATS=[['AUTOMOVEL','🚗 Automóvel','HS Consórcios'],['IMOVEL','🏠 Imóvel','HS Consórcios'],['INVESTIMENTO','📈 Investimento','HS Consórcios'],['SERVICOS','✨ Serviços','Âncora']];
var ST={cred:300000,cat:'IMOVEL',data:null,vend:null};

/* quem pode ser simulado: especialista = ele; líder = ele + equipe; proprietário = todos (ele mesmo = venda da empresa) */
function pessoas(){var me=eu(),r=papel(),L=[];
 if(r==='master'){try{(W.EQUIPE||[]).forEach(function(id){var u=W.U[id];if(u&&u.role!=='cliente')L.push(id);});}catch(e){}
  L.sort(function(a,b){var ma=papelDe(a)==='master'?1:0,mb=papelDe(b)==='master'?1:0;return ma-mb||nomeDe(a).localeCompare(nomeDe(b));});}
 else if(r==='lider'){try{L=(W.TEAM||[me]).slice();}catch(e){L=[me];}}
 else L=[me];
 if(L.indexOf(me)<0)L.unshift(me);return L;}
function vendPadrao(){var L=pessoas();if(!master())return eu();var esp=L.filter(function(id){return papelDe(id)==='especialista';}),n={};
 try{(W.VENDAS||[]).forEach(function(v){n[v.vend]=(n[v.vend]||0)+1;});}catch(e){}
 esp.sort(function(a,b){return (n[b]||0)-(n[a]||0);});return esp[0]||L[0];}   /* proprietário: abre no especialista com mais vendas */

/* o motor da aba Comissões, com a venda simulada junto das vendas reais (para o cluster da competência) */
function simula(orig){var raw={id:'simulacao',cliente_nome:'Simulação',vendedor_id:ST.vend,credito:ST.cred,origem:orig,origem_status:'VALIDADA',analise_status:'APROVADA',
  data_insercao:ST.data,categoria:ST.cat,administradora:ST.cat==='SERVICOS'?'Âncora':'HS Consórcios',situacao:'EM_DIA',parcelas:[]};
 var all=[];try{all=(W.VENDAS||[]).map(function(v){return v.raw;}).filter(function(x){return x&&x.id!=='simulacao';});}catch(e){}
 all=all.concat([raw]);var k=null;try{k=W.pcall('cmsCalc',raw,all);}catch(e){console.warn('[simcom]',e);}
 return k;}
function prodLeads(){/* produção de leads da empresa da pessoa nesta competência, sem a simulação */
 var k=null;try{var raw={id:'simulacao',vendedor_id:ST.vend,credito:0,origem:'LEAD_AGION',origem_status:'VALIDADA',analise_status:'APROVADA',data_insercao:ST.data,categoria:'IMOVEL',situacao:'EM_DIA',parcelas:[]};
  var all=(W.VENDAS||[]).map(function(v){return v.raw;}).concat([raw]);k=W.pcall('cmsCalc',raw,all);}catch(e){}
 return k?(+k.prod||0):0;}

function linhaParc(p,M){return '<tr><td>'+p.n+'ª</td><td>'+dBR(p.data)+'</td><td class="r"><b>'+rs(p.func)+'</b></td>'+(M?'<td class="r mu">'+rs(p.hs)+'</td><td class="r mu">'+rs(p.agion)+'</td>':'')+'</tr>';}
function coluna(tit,emo,k,orig){var M=master();if(!k)return '<div class="scc"><div class="sch">'+emo+' '+tit+'</div><div class="scv">—</div><p class="mu">Não consegui calcular agora.</p></div>';
 var emp=!!k.empresa,serv=!!k.serv,tot=(+k.funcPre||0),pos=(+k.posFunc||0);
 var taxa=emp?'Venda da empresa: sem comissão de colaborador':serv?(orig==='CLIENTE_PROPRIO'?'0,50% ao mês × 4 = 2,00% do crédito':'0,25% ao mês × 4 = 1,00% do crédito'):orig==='CLIENTE_PROPRIO'?'1,00% na venda + 1,00% depois da contemplação':'Cluster '+pc(k.rate)+' (produção de leads da competência: '+rs(k.prod)+')';
 var h='<div class="scc'+(orig==='CLIENTE_PROPRIO'?' au':' bl')+'"><div class="sch">'+emo+' '+tit+'</div>'+
  '<div class="scl">'+(emp?'Comissão do colaborador':'Comissão na venda')+'</div><div class="scv">'+rs(tot)+'</div><div class="sct">'+e4(taxa)+'</div>';
 if(!emp&&pos>0)h+='<div class="scpos">'+ic('star',14)+'<span>+ <b>'+rs(pos)+'</b> a receber depois da contemplação</span></div>';
 else if(!emp&&!serv&&orig==='LEAD_AGION')h+='<div class="scpos mu">'+ic('star',14)+'<span>Lead da empresa não tem comissão pós-contemplação para o colaborador.</span></div>';
 if(!emp&&k.jan&&k.jan.tipo==='ANTECIPACAO'&&k.rate>k.rate20&&k.ajuste>0)h+='<div class="scpos">'+ic('trend',14)+'<span>Inclui <b>'+rs(k.ajuste)+'</b> de ajuste de cluster, pago em '+dBR(k.ajusteData)+'.</span></div>';
 h+='<table class="sctb"><thead><tr><th>Parcela</th><th>Data</th><th class="r">'+(emp?'Colab.':'Você recebe')+'</th>'+(M?'<th class="r">Adm. paga</th><th class="r">Agion fica</th>':'')+'</tr></thead><tbody>'+(k.parcelas||[]).map(function(p){return linhaParc(p,M);}).join('')+'</tbody></table>';
 if(M){h+='<div class="scemp"><div><small>Administradora paga</small><b>'+rs(k.hsPre)+'</b><span>na venda</span>'+(k.posHs>0?'<span>+ '+rs(k.posHs)+' na contemplação</span>':'')+'</div>'+
  '<div><small>Fica com a Agion</small><b>'+rs(k.agionPre)+'</b><span>na venda</span>'+(k.posHs>0?'<span>+ '+rs(k.posAgion)+' na contemplação</span>':'')+'</div></div>';}
 return h+'</div>';}

function pinta(s){var a=simula('CLIENTE_PROPRIO'),b=simula('LEAD_AGION'),box=$('#scres',s);if(!box)return;
 var j=a&&a.jan,cab='';
 if(j)cab='<div class="scinfo">'+ic('cal',15)+'<span>Competência '+e4(a.comp&&a.comp.rot?a.comp.rot:'')+' · '+(j.tipo==='ANTECIPACAO'?'entra na <b>antecipação</b>: 1ª parcela dia 23':'janela normal: 1ª parcela dia 10')+(ST.cat==='SERVICOS'?' · Serviços (Âncora): 4 parcelas, sem pós-contemplação':'')+'</span></div>';
 var p0=prodLeads(),cl=null;try{cl=W.clusterDe(p0+ST.cred);}catch(e){}
 if(b&&!b.empresa&&ST.cat!=='SERVICOS'){var nx=cl&&cl.prox?' · faltam <b>'+rs(cl.falta)+'</b> em leads da empresa para o cluster de '+String(cl.prox).replace('.',',')+'%':'';
  cab+='<div class="scinfo">'+ic('trend',15)+'<span>'+(ST.vend===eu()?'Sua':'A')+' produção de leads da empresa nesta competência: <b>'+rs(p0)+'</b>; com esta venda, <b>'+rs(p0+ST.cred)+'</b>'+nx+'. Cliente próprio não soma no cluster.</span></div>';}
 box.innerHTML=cab+'<div class="scg">'+coluna('Cliente próprio','👤',a,'CLIENTE_PROPRIO')+coluna('Lead da empresa','🏢',b,'LEAD_AGION')+'</div>'+
  '<p class="mu scrod">Simulação com as regras da aba Comissões. Nada é gravado. Os valores reais dependem da aprovação da venda, do pagamento do cliente e das outras vendas da competência.</p>';}

function abrir(){ST.data=ST.data||isoHoje();if(!ST.vend||pessoas().indexOf(ST.vend)<0)ST.vend=vendPadrao();
 var L=pessoas(),me=eu();
 var sel=L.length>1?'<div class="fi"><label>Colaborador</label><select id="scv">'+L.map(function(id){return '<option value="'+e4(id)+'"'+(id===ST.vend?' selected':'')+'>'+e4(nomeDe(id))+(id===me?' (você)':'')+(papelDe(id)==='master'?' · venda da empresa':'')+'</option>';}).join('')+'</select></div>':'';
 var s=W.sheet('<div class="lbl" style="color:var(--gold)">Comissões</div><h2>Simular comissão</h2><p style="color:var(--mut);font-size:13px;margin:4px 0 14px">Digite o crédito e veja na hora quanto dá como cliente próprio e como lead da empresa.</p>'+
  '<div class="scf">'+sel+'<div class="fi"><label>Crédito da carta</label><input id="scc" inputmode="decimal" value="'+ST.cred.toLocaleString('pt-BR')+'"></div>'+
  '<div class="fi"><label>Categoria</label><select id="sck">'+CATS.map(function(c){return '<option value="'+c[0]+'"'+(c[0]===ST.cat?' selected':'')+'>'+c[1]+' · '+c[2]+'</option>';}).join('')+'</select></div>'+
  '<div class="fi"><label>Data da venda</label><input type="date" id="scd" value="'+ST.data+'"></div></div><div id="scres"></div>',760);
 s.classList.add('simcom');
 var t=null,re=function(){clearTimeout(t);t=setTimeout(function(){ST.cred=num($('#scc',s).value);ST.cat=$('#sck',s).value;ST.data=$('#scd',s).value||isoHoje();var v=$('#scv',s);if(v)ST.vend=v.value;pinta(s);},120);};
 ['#scc','#sck','#scd','#scv'].forEach(function(q){var el=$(q,s);if(el){el.addEventListener('input',re);el.addEventListener('change',re);}});
 $('#scc',s).addEventListener('blur',function(){this.value=(num(this.value)||0).toLocaleString('pt-BR');});
 pinta(s);}

function css(){if($('#simcomcss'))return;var c=document.createElement('style');c.id='simcomcss';c.textContent=
 '.sheet.simcom .scf{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0 14px}.sheet.simcom .scf .fi{margin-bottom:12px}'+
 '.sheet.simcom select,.sheet.simcom input{width:100%}.sheet.simcom select{padding:11px 12px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit}'+
 '.sheet.simcom .scinfo{display:flex;gap:9px;align-items:flex-start;font-size:12.8px;line-height:1.5;color:var(--mut);padding:10px 12px;border-radius:14px;background:color-mix(in srgb,currentColor 5%,transparent);margin:4px 0 10px}.sheet.simcom .scinfo .i{flex:none;margin-top:2px;color:var(--gold)}.sheet.simcom .scinfo b{color:var(--ink)}'+
 '.sheet.simcom .scg{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;margin-top:6px}'+
 '.sheet.simcom .scc{border:1px solid var(--line);border-radius:18px;padding:16px;background:var(--card)}.sheet.simcom .scc.au{box-shadow:inset 0 3px 0 var(--gold)}.sheet.simcom .scc.bl{box-shadow:inset 0 3px 0 #2E6A8A}'+
 '.sheet.simcom .sch{font:700 13.5px "DM Sans";margin-bottom:10px}.sheet.simcom .scl{font-size:11.5px;color:var(--mut);text-transform:uppercase;letter-spacing:.08em}'+
 '.sheet.simcom .scv{font:600 28px Lora,Georgia,serif;color:var(--ink);margin:2px 0}.sheet.simcom .sct{font-size:12.3px;color:var(--mut);line-height:1.45}'+
 '.sheet.simcom .scpos{display:flex;gap:8px;align-items:flex-start;font-size:12.6px;margin-top:10px;line-height:1.45}.sheet.simcom .scpos .i{flex:none;margin-top:2px;color:var(--gold)}'+
 '.sheet.simcom .sctb{width:100%;border-collapse:collapse;margin-top:12px;font-size:12.6px}.sheet.simcom .sctb th{font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--mut);font-weight:600;text-align:left;padding:6px 4px;border-bottom:1px solid var(--line)}'+
 '.sheet.simcom .sctb td{padding:7px 4px;border-bottom:1px solid color-mix(in srgb,var(--line) 60%,transparent)}.sheet.simcom .sctb .r{text-align:right;font-variant-numeric:tabular-nums}'+
 '.sheet.simcom .mu{color:var(--mut)}.sheet.simcom .scrod{font-size:11.8px;margin-top:12px;line-height:1.5}'+
 '.sheet.simcom .scemp{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.sheet.simcom .scemp>div{padding:10px 12px;border-radius:12px;background:color-mix(in srgb,currentColor 5%,transparent);display:flex;flex-direction:column;gap:2px}'+
 '.sheet.simcom .scemp small{font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--mut)}.sheet.simcom .scemp b{font:600 16px "DM Sans";color:var(--ink)}.sheet.simcom .scemp span{font-size:11.5px;color:var(--mut)}'+
 '@media (max-width:600px){.sheet.simcom .scv{font-size:24px}.sheet.simcom .sctb{font-size:12px}}';
 document.head.appendChild(c);}

/* botão no topo da aba Comissões (antes de "Registrar venda"), sem mexer no resto */
function liga(){if(typeof W.R==='undefined'||typeof W.R.comissoes!=='function'||typeof W.sheet!=='function'){return setTimeout(liga,250);}
 if(W.R.comissoes.__sim)return;css();var _rc=W.R.comissoes;
 W.R.comissoes=function(v){var r=_rc.apply(this,arguments);try{var rv=$('#rv',v);if(rv&&!$('#simc',v)){var b=document.createElement('button');b.className='btn';b.id='simc';b.innerHTML=ic('calc',16)+'Simular comissão';b.onclick=function(e){e.stopPropagation();abrir();};rv.parentNode.insertBefore(b,rv);}}catch(e){console.warn('[simcom]',e);}return r;};
 W.R.comissoes.__sim=1;W.SimCom={abrir:abrir};
 try{if(W.cur==='comissoes'&&$('#view'))W.go('comissoes',W.curArg,1);}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',liga);else liga();
})();
