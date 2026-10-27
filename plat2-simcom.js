/* ==========================================================================
   Agion — plat2-simcom.js · Simular comissão (aba Comissões) · SIMCOM_23OUT
   Botão "Simular comissão" no topo da aba Comissões, para todos (proprietário,
   líder e especialista). Abre uma janela à parte (o layout da aba não muda) e
   mostra uma opção por vez (botão Cliente próprio / Lead da empresa), para não ficar comparando.
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
function dCurta(s){if(!s)return '—';var p=String(s).slice(0,10).split('-');return p[2]+'/'+p[1]+'/'+p[0].slice(2);}
function rs(v){v=+v||0;return 'R$ '+v.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});}
function rs0(v){return 'R$ '+Math.round(+v||0).toLocaleString('pt-BR');}
function pc(r){return (r*100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%';}
function num(s){s=String(s||'').replace(/[^\d,.-]/g,'');if(s.indexOf(',')>=0)s=s.replace(/\./g,'').replace(',','.');else if((s.match(/\./g)||[]).length>1||/\.\d{3}$/.test(s))s=s.replace(/\./g,'');return +s||0;}
/* crédito em reais inteiros: só os dígitos contam (ponto de milhar não vira decimal); centavos depois da vírgula são ignorados */
function numCred(s){s=String(s||'');var i=s.lastIndexOf(',');if(i>=0)s=s.slice(0,i);return +(s.replace(/\D/g,''))||0;}
function papel(){try{return W.effRoleR();}catch(e){return 'especialista';}}
function master(){return papel()==='master';}
function eu(){try{return W.ME();}catch(e){return null;}}
function nomeDe(id){try{return (W.U[id]||{}).n||'—';}catch(e){return '—';}}
function papelDe(id){try{return (W.U[id]||{}).role||'';}catch(e){return '';}}
var CATS=[['AUTOMOVEL','🚗 Automóvel','HS'],['IMOVEL','🏠 Imóvel','HS'],['INVESTIMENTO','📈 Investimento','HS'],['SERVICOS','✨ Serviços','Âncora']];
var ST={cred:300000,cat:'IMOVEL',data:null,vend:null,orig:'CLIENTE_PROPRIO'};

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

function quem(){return ST.vend===eu()?'Você recebe':(nomeDe(ST.vend).split(' ')[0]+' recebe');}
var ORIG={CLIENTE_PROPRIO:['👤','Cliente próprio'],LEAD_AGION:['🏢','Lead da empresa']};

/* um tipo de cliente por vez (botão no topo): cliente próprio OU lead da empresa */
function resultado(k){var M=master(),o=ST.orig,emo=ORIG[o][0],tit=ORIG[o][1];
 if(!k)return '<div class="scr"><div class="scv">—</div><p class="mu">Não consegui calcular agora. Feche e abra de novo.</p></div>';
 var emp=!!k.empresa,serv=!!k.serv,tot=(+k.funcPre||0),pos=(+k.posFunc||0),ps=k.parcelas||[];
 var regra=emp?'Venda do proprietário é venda da empresa: não gera comissão de colaborador.':serv?(o==='CLIENTE_PROPRIO'?'Serviços · 0,50% ao mês × 4 = 2,00% do crédito':'Serviços · 0,25% ao mês × 4 = 1,00% do crédito'):o==='CLIENTE_PROPRIO'?'1,00% na venda + 1,00% depois da contemplação':'Cluster de '+pc(k.rate)+' sobre o crédito';
 var h='<div class="scr '+(o==='CLIENTE_PROPRIO'?'au':'bl')+'">'+
  '<div class="scrt"><div class="scrm"><div class="scl">'+emo+' '+tit+' · '+(emp?'comissão do colaborador':'comissão na venda')+'</div><div class="scv">'+rs(tot)+'</div><div class="sct">'+e4(regra)+'</div></div>'+
  (!emp&&pos>0?'<div class="scpo"><small>Depois da contemplação</small><b>+ '+rs(pos)+'</b></div>':'')+'</div>';
 /* faixas: competência/janela e, no lead da empresa, o cluster */
 var j=k.jan,f='';
 if(j&&ps[0])f+='<div class="scch">'+ic('cal',14)+'<span>Competência '+e4(String(k.comp&&k.comp.rot||'').replace(' → ',' a '))+' · 1ª parcela em <b>'+dBR(ps[0].data)+'</b> ('+(j.tipo==='ANTECIPACAO'?'antecipação':'janela normal')+')</span></div>';
 if(o==='LEAD_AGION'&&!emp&&!serv){var p0=prodLeads(),cl=null;try{cl=W.clusterDe(p0+ST.cred);}catch(e){}
  var pr=0;try{var CL=W.CLUSTER,a0=cl&&CL?CL[cl.i][0]:0,a1=cl&&CL?Math.min(CL[cl.i][1],a0+5000000):1;pr=Math.max(4,Math.min(100,((p0+ST.cred)-a0)/Math.max(1,a1-a0)*100));}catch(e){}
  f+='<div class="scch scclu">'+ic('trend',14)+'<span>Leads da empresa na competência: <b>'+rs(p0)+'</b> → <b>'+rs(p0+ST.cred)+'</b> com esta venda'+(cl&&cl.prox?' · faltam <b>'+rs(cl.falta)+'</b> para '+String(cl.prox).replace('.',',')+'%':' · cluster máximo')+'</span><i class="scbar"><i style="width:'+pr+'%"></i></i></div>';}
 if(o==='LEAD_AGION'&&!emp&&!serv)f+='<div class="scch mu">'+ic('star',14)+'<span>Lead da empresa não tem comissão depois da contemplação para o colaborador.</span></div>';
 if(o==='CLIENTE_PROPRIO'&&!emp&&!serv)f+='<div class="scch mu">'+ic('star',14)+'<span>Cliente próprio não soma no cluster.</span></div>';
 if(!emp&&j&&j.tipo==='ANTECIPACAO'&&k.ajuste>0)f+='<div class="scch">'+ic('trend',14)+'<span>Inclui <b>'+rs(k.ajuste)+'</b> de ajuste de cluster, pago em '+dBR(k.ajusteData)+'.</span></div>';
 h+=f;
 /* parcelas em lista (cabe no celular sem rolar para o lado) */
 h+='<div class="scph"><span>Parcelas</span><span>'+(emp?'Colaborador':quem())+'</span></div><div class="scps">'+ps.map(function(p){
   return '<div class="scp"><span class="scpn">'+p.n+'ª</span><span class="scpd">'+dBR(p.data)+'</span><span class="scpv"><b>'+rs(p.func)+'</b></span></div>';}).join('')+'</div>';
 /* SIMCOM_AGION_27OUT: só o proprietário vê o fluxo de pagamento da Agion — quando a administradora paga a Agion
    (dataEmp: antecipação dia 20), quanto vai para o colaborador e quanto fica com a Agion, parcela a parcela, + o pós */
 if(M){var nm=emp?'':nomeDe(ST.vend).split(' ')[0];
  h+='<div class="scph scagh"><span>'+ic('lock',12)+' Fluxo da Agion · só o proprietário vê</span><span>Agion recebe</span></div><div class="scps scag">'+ps.map(function(p){
   return '<div class="scp"><span class="scpn">'+p.n+'ª</span><span class="scpd">'+dBR(p.dataEmp||p.data)+'</span><span class="scpv"><b>'+rs(p.hs)+'</b><small>'+(emp?'fica tudo com a Agion':'paga '+e4(nm)+' '+rs0(p.func)+' em '+dCurta(p.data)+' · fica '+rs0(p.agion))+'</small></span></div>';}).join('')+
   (k.posHs>0?'<div class="scp"><span class="scpn">Pós</span><span class="scpd">na contemplação</span><span class="scpv"><b>'+rs(k.posHs)+'</b><small>'+(pos>0&&!emp?'paga '+e4(nm)+' '+rs0(pos)+' · ':'')+'fica '+rs0(k.posAgion)+'</small></span></div>':'')+'</div>';}
 if(M)h+='<div class="scemp"><div><small>Administradora paga</small><b>'+rs(k.hsPre)+'</b><span>na venda'+(k.posHs>0?' · + '+rs(k.posHs)+' na contemplação':'')+'</span></div>'+
  '<div><small>Fica com a Agion</small><b>'+rs(k.agionPre)+'</b><span>na venda'+(k.posHs>0?' · + '+rs(k.posAgion)+' na contemplação':'')+'</span></div></div>';
 return h+'</div>';}

function pinta(s){var box=$('#scres',s);if(!box)return;box.innerHTML=resultado(simula(ST.orig))+
  '<p class="scrod">Simulação com as regras da aba Comissões. Nada é gravado. O valor real depende da aprovação da venda, do pagamento do cliente e das outras vendas da competência.</p>';}

function abrir(){ST.data=ST.data||isoHoje();ST.orig=ST.orig||'CLIENTE_PROPRIO';if(!ST.vend||pessoas().indexOf(ST.vend)<0)ST.vend=vendPadrao();
 var L=pessoas(),me=eu(),temV=L.length>1;
 var campo=function(lb,cls,inner){return '<label class="scfld '+(cls||'')+'"><span>'+lb+'</span><div class="scin'+(/select/.test(inner)?' scsel':'')+'">'+inner+'</div></label>';};
 var vend=temV?campo('Colaborador','scfv','<select id="scv">'+L.map(function(id){return '<option value="'+e4(id)+'"'+(id===ST.vend?' selected':'')+'>'+e4(nomeDe(id))+(id===me?' (você)':'')+(papelDe(id)==='master'?' · empresa':'')+'</option>';}).join('')+'</select>'):'';
 var s=W.sheet('<div class="lbl" style="color:var(--gold)">Comissões</div><h2 class="sch2">Simular comissão</h2><p class="scsub">Escolha o tipo de cliente, digite o crédito e veja na hora quanto rende.</p>'+
  '<div class="scseg" id="scseg">'+Object.keys(ORIG).map(function(k){return '<button type="button" data-o="'+k+'" class="'+(k===ST.orig?'on':'')+'"><span>'+ORIG[k][0]+'</span>'+ORIG[k][1]+'</button>';}).join('')+'</div>'+
  '<div class="scf'+(temV?' v4c':'')+'">'+vend+
  campo('Crédito da carta','scfc','<i>R$</i><input id="scc" inputmode="numeric" autocomplete="off" value="'+ST.cred.toLocaleString('pt-BR')+'">')+
  campo('Categoria','','<select id="sck">'+CATS.map(function(c){return '<option value="'+c[0]+'"'+(c[0]===ST.cat?' selected':'')+'>'+c[1]+' · '+c[2]+'</option>';}).join('')+'</select>')+
  campo('Data da venda','','<input type="date" id="scd" value="'+ST.data+'">')+'</div><div id="scres"></div>',640);
 s.classList.add('simcom');
 var t=null,re=function(){clearTimeout(t);t=setTimeout(function(){ST.cred=numCred($('#scc',s).value);ST.cat=$('#sck',s).value;ST.data=$('#scd',s).value||isoHoje();var v=$('#scv',s);if(v)ST.vend=v.value;pinta(s);},120);};
 ['#scc','#sck','#scd','#scv'].forEach(function(q){var el=$(q,s);if(el){el.addEventListener('input',re);el.addEventListener('change',re);}});
 var cc=$('#scc',s);cc.addEventListener('input',function(){var pos=this.value.length-this.selectionStart,n=numCred(this.value);this.value=n?n.toLocaleString('pt-BR'):'';try{var q=Math.max(0,this.value.length-pos);this.setSelectionRange(q,q);}catch(e){}});
 $$('#scseg button',s).forEach(function(b){b.onclick=function(){if(b.classList.contains('on'))return;ST.orig=b.dataset.o;$$('#scseg button',s).forEach(function(x){x.classList.toggle('on',x===b);});var r=$('#scres',s);if(r){r.style.opacity=0;setTimeout(function(){pinta(s);r.style.opacity=1;},140);}};});
 pinta(s);}

function css(){if($('#simcomcss'))return;var c=document.createElement('style');c.id='simcomcss';c.textContent=
 '.sheet.simcom .sch2{margin:2px 0 2px}.sheet.simcom .scsub{color:var(--mut);font-size:13px;margin:2px 0 16px;line-height:1.45}'+
 /* botão de escolha do tipo de cliente */
 '.sheet.simcom .scseg{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;border-radius:999px;background:color-mix(in srgb,var(--ink) 7%,transparent);margin:0 0 16px}'+
 '.sheet.simcom .scseg button{height:42px;border:0;border-radius:999px;background:transparent;color:var(--mut);font:600 14px "DM Sans",system-ui,sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:background .25s,color .25s,box-shadow .25s}'+
 '.sheet.simcom .scseg button span{font-size:16px}.sheet.simcom .scseg button.on{background:#0B2A26;color:#E8CC8B;box-shadow:0 6px 16px -8px rgba(11,42,38,.55)}'+
 /* campos: todos com a mesma altura, fundo e borda */
 '.sheet.simcom .scf{display:grid;grid-template-columns:1.25fr 1fr 1fr;gap:12px 12px;margin-bottom:14px}.sheet.simcom .scf.v4c{grid-template-columns:1fr 1fr}'+
 '.sheet.simcom .scfld{display:flex;flex-direction:column;gap:6px;min-width:0;margin:0}.sheet.simcom .scfld>span{font:600 12px "DM Sans",system-ui,sans-serif;color:var(--mut);letter-spacing:.01em}'+
 '.sheet.simcom .scin{position:relative;display:flex;align-items:center;height:48px;border:1px solid var(--line);border-radius:14px;background:color-mix(in srgb,var(--gold) 5%,var(--card));transition:border-color .2s,box-shadow .2s;overflow:hidden}'+
 '.sheet.simcom .scin:focus-within{border-color:var(--gold);box-shadow:0 0 0 3px color-mix(in srgb,var(--gold) 20%,transparent)}'+
 '.sheet.simcom .scin i{font-style:normal;font:600 14px "DM Sans",system-ui,sans-serif;color:var(--mut);padding-left:14px}'+
 '.sheet.simcom .scin input,.sheet.simcom .scin select{all:unset;box-sizing:border-box;width:100%;height:100%;padding:0 14px;font:500 15px "DM Sans",system-ui,sans-serif;color:var(--ink);cursor:pointer}'+
 '.sheet.simcom .scin i+input{padding-left:6px;font-weight:600;font-variant-numeric:tabular-nums;cursor:text}.sheet.simcom .scin input[type=date]{-webkit-appearance:none;appearance:none;line-height:48px;min-width:0}'+
 '.sheet.simcom .scin input[type=date]::-webkit-date-and-time-value{text-align:left}.sheet.simcom .scin input[type=date]::-webkit-calendar-picker-indicator{opacity:.55;cursor:pointer}'+
 '.sheet.simcom .scin select{display:block;height:46px;line-height:46px}.sheet.simcom .scsel select{padding-right:36px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sheet.simcom .scsel::after{content:"";position:absolute;right:16px;top:50%;width:7px;height:7px;border-right:2px solid var(--mut);border-bottom:2px solid var(--mut);transform:translateY(-70%) rotate(45deg);pointer-events:none}'+
 /* resultado: um cartão só */
 '.sheet.simcom #scres{transition:opacity .14s}.sheet.simcom .scr{border:1px solid var(--line);border-radius:20px;padding:18px;background:var(--card)}.sheet.simcom .scr.au{box-shadow:inset 0 3px 0 var(--gold)}.sheet.simcom .scr.bl{box-shadow:inset 0 3px 0 #2E6A8A}'+
 '.sheet.simcom .scrt{display:flex;justify-content:space-between;align-items:flex-end;gap:14px;flex-wrap:wrap;margin-bottom:12px}.sheet.simcom .scrm{min-width:0}'+
 '.sheet.simcom .scl{font:600 11.5px "DM Sans",system-ui,sans-serif;color:var(--mut);text-transform:uppercase;letter-spacing:.07em}'+
 '.sheet.simcom .scv{font:600 32px Lora,Georgia,serif;color:var(--ink);margin:4px 0 2px;line-height:1.1}.sheet.simcom .sct{font-size:12.8px;color:var(--mut);line-height:1.45}'+
 '.sheet.simcom .scpo{display:flex;flex-direction:column;align-items:flex-end;padding:10px 14px;border-radius:14px;background:color-mix(in srgb,var(--gold) 12%,transparent)}.sheet.simcom .scpo small{font-size:11px;color:var(--mut)}.sheet.simcom .scpo b{font:700 17px "DM Sans",system-ui,sans-serif;color:var(--ink)}'+
 '.sheet.simcom .scch{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:12.6px;line-height:1.45;color:var(--ink);padding:9px 12px;border-radius:12px;background:color-mix(in srgb,var(--ink) 5%,transparent);margin-top:8px}'+
 '.sheet.simcom .scch>span{flex:1;min-width:0}.sheet.simcom .scch .i{flex:none;color:var(--gold)}.sheet.simcom .scch.mu{color:var(--mut);background:transparent;padding:4px 12px}'+
 '.sheet.simcom .scbar{display:block;flex-basis:100%;height:5px;border-radius:9px;background:color-mix(in srgb,var(--ink) 10%,transparent);overflow:hidden}.sheet.simcom .scbar i{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,#A8853E,#E8CC8B)}'+
 '.sheet.simcom .scph{display:flex;justify-content:space-between;font:600 11px "DM Sans",system-ui,sans-serif;color:var(--mut);text-transform:uppercase;letter-spacing:.07em;margin:16px 2px 6px}'+
 '.sheet.simcom .scps{border:1px solid var(--line);border-radius:14px;overflow:hidden}'+
 '.sheet.simcom .scp{display:grid;grid-template-columns:34px 1fr auto;align-items:center;gap:10px;padding:10px 14px;border-top:1px solid color-mix(in srgb,var(--line) 70%,transparent)}.sheet.simcom .scp:first-child{border-top:0}'+
 '.sheet.simcom .scpn{font:700 12px "DM Sans",system-ui,sans-serif;color:var(--goldd,#A3833F)}.sheet.simcom .scpd{font-size:13.5px;color:var(--mut);font-variant-numeric:tabular-nums}'+
 '.sheet.simcom .scpv{display:flex;flex-direction:column;align-items:flex-end;text-align:right}.sheet.simcom .scpv b{font:700 15px "DM Sans",system-ui,sans-serif;color:var(--ink);font-variant-numeric:tabular-nums}.sheet.simcom .scpv small{font-size:11px;color:var(--mut);margin-top:1px;white-space:nowrap}'+
 '.sheet.simcom .scps.scag{background:color-mix(in srgb,#0B2A26 4%,var(--card))}.sheet.simcom .scagh{margin-top:18px}.sheet.simcom .scagh>span:first-child{display:inline-flex;align-items:center;gap:5px}'+
 '.sheet.simcom .scemp{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.sheet.simcom .scemp>div{padding:11px 13px;border-radius:14px;background:color-mix(in srgb,var(--ink) 5%,transparent);display:flex;flex-direction:column;gap:2px;min-width:0}'+
 '.sheet.simcom .scemp small{font:600 10.5px "DM Sans",system-ui,sans-serif;text-transform:uppercase;letter-spacing:.06em;color:var(--mut)}.sheet.simcom .scemp b{font:700 17px "DM Sans",system-ui,sans-serif;color:var(--ink)}.sheet.simcom .scemp span{font-size:11.5px;color:var(--mut);line-height:1.4}'+
 '.sheet.simcom .mu{color:var(--mut)}.sheet.simcom .scrod{font-size:11.8px;color:var(--mut);margin:12px 2px 0;line-height:1.5}'+
 '@media (max-width:640px){.sheet.simcom .scf,.sheet.simcom .scf.v4c{grid-template-columns:1fr 1fr}.sheet.simcom .scf .scfc,.sheet.simcom .scf .scfv{grid-column:1/-1}'+
 '.sheet.simcom .scseg button{font-size:13.5px;height:44px}.sheet.simcom .scv{font-size:28px}.sheet.simcom .scr{padding:16px 14px}.sheet.simcom .scrt{align-items:flex-start}.sheet.simcom .scpo{align-items:flex-start;width:100%}'+
 '.sheet.simcom .scp{grid-template-columns:28px 1fr auto;padding:10px 12px}.sheet.simcom .scemp{grid-template-columns:1fr}.sheet.simcom .scin input,.sheet.simcom .scin select{font-size:16px}}';
 document.head.appendChild(c);}

/* botão no topo da aba Comissões (antes de "Registrar venda"), sem mexer no resto */
function liga(){if(typeof W.R==='undefined'||typeof W.R.comissoes!=='function'||typeof W.sheet!=='function'){return setTimeout(liga,250);}
 if(W.R.comissoes.__sim)return;css();var _rc=W.R.comissoes;
 W.R.comissoes=function(v){var r=_rc.apply(this,arguments);try{var rv=$('#rv',v);if(rv&&!$('#simc',v)){var b=document.createElement('button');b.className='btn';b.id='simc';b.innerHTML=ic('calc',16)+'Simular comissão';b.onclick=function(e){e.stopPropagation();abrir();};rv.parentNode.insertBefore(b,rv);}}catch(e){console.warn('[simcom]',e);}return r;};
 W.R.comissoes.__sim=1;W.SimCom={abrir:abrir};
 try{if(W.cur==='comissoes'&&$('#view'))W.go('comissoes',W.curArg,1);}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',liga);else liga();
})();
