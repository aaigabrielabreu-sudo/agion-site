/* ==========================================================================
   Agion — plat2-cal.js · CALENDARIO_23OUT
   Aba Calendário (Comercial): tarefas, reuniões do CRM, prazos do "Aguardando
   resposta", decisão das propostas e assembleias num lugar só. Botão para
   assinar o mesmo calendário no Google, Outlook e Apple (qualquer e-mail).
   Roda dentro do /plat2-v4.html.
   ========================================================================== */
(function(){
'use strict';
var W=window;
function e4(s){ return esc4(s); }
function z(n){ return (n<10?'0':'')+n; }
/* CAL_BONITO_23OUT: visual novo do mês (grade fina, nomes legíveis, contagem por tipo) e painel do dia com linha do tempo + próximos */
var TIPOS=[['tarefa','Tarefas','#C5A059','check','Tarefa'],['reuniao','Reuniões','#5B8FB9','cal','Reunião'],['crm','Prazos do CRM','#C99A2E','funnel','Prazo do CRM'],['proposta','Propostas','#3F8F6A','doc','Proposta'],['assembleia','Assembleias','#8E6FB5','trophy','Assembleia']];
var TC={}; TIPOS.forEach(function(t){ TC[t[0]]=t; });
var CS={mes:null,dia:null,vista:'mes',quem:'meus',off:{}};

(function(){ if(document.getElementById('calcss')) return; var s=document.createElement('style'); s.id='calcss'; s.textContent=
 '.calbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px}.calbar .sp{flex:1}'+
 '.calbar h3{font:500 26px Lora,serif;letter-spacing:-.01em;min-width:190px;text-transform:capitalize;color:var(--ink)}.calbar h3 span{color:var(--mut);font-weight:400}'+
 '.calnavg{display:flex;align-items:center;background:var(--card);border-radius:14px;box-shadow:var(--shadow);padding:3px}'+
 '.calnav{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;color:var(--ink2);transition:background .2s}.calnav:hover{background:var(--bg2)}'+
 '.calchips{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:16px}'+
 '.calchips button{display:inline-flex;align-items:center;gap:7px;padding:7px 8px 7px 12px;border-radius:999px;font:600 12.5px "DM Sans";background:var(--card);color:var(--ink2);box-shadow:var(--shadow);transition:opacity .25s,background .25s,box-shadow .25s}'+
 '.calchips button i{width:9px;height:9px;border-radius:50%;display:inline-block}.calchips button em{font-style:normal;font:700 11px "DM Sans";min-width:22px;height:20px;padding:0 6px;border-radius:999px;display:inline-grid;place-items:center;background:var(--bg2);color:var(--ink2)}'+
 '.calchips button.off{opacity:.45;box-shadow:none;background:transparent}.calchips button.off i{background:var(--mut2)!important}'+
 '.calwrap{display:grid;grid-template-columns:minmax(0,1.8fr) minmax(300px,1fr);gap:18px;align-items:start}'+
 '.calpm{padding:16px 16px 18px}'+
 '.calw{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));margin:0 0 8px}.calw div{font:700 10.5px "DM Sans";letter-spacing:.14em;text-transform:uppercase;color:var(--mut);padding:2px 10px}.calw div.fds{color:var(--mut2)}'+
 '.calg{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:1px;background:var(--line);border:1px solid var(--line);border-radius:18px;overflow:hidden}'+
 '.calg .dc{min-height:112px;background:var(--card);padding:8px 7px 7px;cursor:pointer;position:relative;display:flex;flex-direction:column;gap:3px;transition:background .2s;min-width:0}'+
 '.calg .dc.fds{background:color-mix(in srgb,var(--bg) 55%,var(--card))}.calg .dc:hover{background:color-mix(in srgb,var(--gold) 9%,var(--card))}'+
 '.calg .dc.fora{background:color-mix(in srgb,var(--bg2) 45%,var(--card))}.calg .dc.fora .dn{color:var(--mut2)}.calg .dc.fora .ev{opacity:.55}'+
 '.calg .dc.sel{background:color-mix(in srgb,var(--gold) 20%,var(--card));box-shadow:inset 0 0 0 2px var(--gold)}'+
 '.calg .dn{font:600 12.5px "DM Sans";min-width:26px;height:26px;padding:0 4px;border-radius:999px;display:inline-grid;place-items:center;align-self:flex-start;color:var(--ink2);margin-bottom:1px}'+
 '.calg .dc.hoje .dn{background:var(--gg);color:#0B2A26;font-weight:800;box-shadow:0 4px 12px -4px rgba(163,131,63,.7)}'+
 '.calg .ev{display:flex;flex-direction:column;font:600 11.4px/1.3 "DM Sans";padding:3px 7px 3px 7px;border-radius:7px;border-left:2.5px solid;color:var(--ink);min-width:0}'+
 '.calg .ev b{font:700 10px/1.25 "DM Sans";letter-spacing:.02em}.calg .ev span{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;min-width:0}'+
 '.calg .mais{font:700 10.8px "DM Sans";color:var(--goldd);padding:1px 7px}'+
 '.calg .pts{display:none}'+
 '.cdia{padding:20px 18px 16px}.cdhd{display:flex;align-items:center;gap:14px;margin-bottom:16px}'+
 '.cdt{width:58px;height:64px;border-radius:17px;background:var(--sb);color:var(--gold2);display:flex;flex-direction:column;align-items:center;justify-content:center;flex:none;box-shadow:var(--shadow)}'+
 '.cdt small{font:700 10px "DM Sans";letter-spacing:.16em;text-transform:uppercase;opacity:.8}.cdt b{font:500 27px/1 Lora,serif;margin-top:2px}'+
 '.cdhd h4{font:600 17px "DM Sans";text-transform:capitalize;color:var(--ink)}.cdhd p{font-size:12.5px;color:var(--mut);margin-top:3px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}'+
 '.cdhd .cbdg{font:700 10.5px "DM Sans";letter-spacing:.06em;text-transform:uppercase;padding:3px 8px;border-radius:999px;background:var(--au);color:var(--aut)}'+
 '.ctl{display:flex;flex-direction:column;gap:8px}'+
 '.cali{display:grid;grid-template-columns:52px minmax(0,1fr);gap:10px;align-items:stretch;cursor:pointer}'+
 '.cali .h{font:700 12.5px "DM Sans";text-align:right;color:var(--ink2);padding-top:11px}.cali .h.td{font-size:10.5px;letter-spacing:.04em;color:var(--mut);text-transform:uppercase;padding-top:12px}'+
 '.cali .cx{border-radius:14px;padding:10px 12px 10px 13px;border-left:3px solid;transition:transform .25s var(--ez),box-shadow .25s;min-width:0;position:relative}'+
 '.cali:hover .cx{transform:translateX(3px);box-shadow:var(--shadow)}'+
 '.cali .cx b{display:block;font:600 13.6px/1.35 "DM Sans";color:var(--ink)}'+
 '.cali .cx small{display:flex;align-items:center;gap:6px;font-size:11.8px;color:var(--mut);margin-top:4px;flex-wrap:wrap}.cali .cx small em{font-style:normal;font-weight:700;font-size:10.5px;letter-spacing:.04em;text-transform:uppercase}'+
 '.cvazio{text-align:center;padding:22px 10px 14px;color:var(--mut)}.cvazio .ic{width:52px;height:52px;border-radius:18px;margin:0 auto 10px;display:grid;place-items:center;background:var(--bg);color:var(--goldd)}.cvazio b{display:block;font:600 14.5px "DM Sans";color:var(--ink);margin-bottom:3px}.cvazio small{font-size:12.5px}'+
 '.cprox{margin-top:18px;padding-top:14px;border-top:1px solid var(--line)}.cprox h5{font:700 10.5px "DM Sans";letter-spacing:.14em;text-transform:uppercase;color:var(--mut);margin-bottom:8px}'+
 '.cpx{display:flex;align-items:center;gap:11px;padding:7px 6px;border-radius:12px;cursor:pointer;transition:background .2s}.cpx:hover{background:var(--bg)}'+
 '.cpx .dt{width:38px;flex:none;text-align:center;line-height:1.05}.cpx .dt small{display:block;font:700 9.5px "DM Sans";letter-spacing:.1em;text-transform:uppercase;color:var(--mut)}.cpx .dt b{font:500 18px Lora,serif;color:var(--ink);display:block}.cpx .dt em{display:block;font:700 9px "DM Sans";letter-spacing:.1em;text-transform:uppercase;color:var(--goldd);font-style:normal}'+
 '.cpx i{width:7px;height:7px;border-radius:50%;flex:none}.cpx span{min-width:0;flex:1}.cpx span b{display:block;font:600 12.8px "DM Sans";color:var(--ink);overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.cpx span small{font-size:11.5px;color:var(--mut)}'+
 '.callist{padding:20px 18px}.callist .cdh{display:flex;align-items:baseline;gap:8px;margin:18px 0 8px;padding-bottom:6px;border-bottom:1px solid var(--line)}.callist .cdh:first-child{margin-top:0}'+
 '.callist .cdh b{font:600 14px "DM Sans";color:var(--ink)}.callist .cdh small{font-size:12px;color:var(--mut)}.callist .cdh .cbdg{font:700 10px "DM Sans";letter-spacing:.06em;text-transform:uppercase;padding:2px 7px;border-radius:999px;background:var(--au);color:var(--aut)}'+
 '.calsync a,.calsync button.op{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:16px;background:var(--bg);margin-bottom:8px;color:var(--ink);text-decoration:none;font:600 14px "DM Sans";width:100%;text-align:left}'+
 '.calsync a small,.calsync button.op small{display:block;font:500 12px "DM Sans";color:var(--mut)}.calsync .ic{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;background:var(--card);flex:none}'+
 '@media (max-width:1100px){.calwrap{grid-template-columns:1fr}}'+
 '@media (max-width:860px){.calbar h3{font-size:22px;min-width:0}.calpm{padding:10px 8px 12px}.calw div{padding:2px 0;text-align:center;letter-spacing:.06em;font-size:9.5px}.calg{border-radius:14px}'+
 '.calg .dc{min-height:58px;padding:5px 3px;align-items:center}.calg .dn{align-self:center;font-size:12px;min-width:24px;height:24px}.calg .ev,.calg .mais{display:none}'+
 '.calg .pts{display:flex;gap:3px;justify-content:center;flex-wrap:wrap;max-width:100%}.calg .pts i{width:6px;height:6px;border-radius:50%}'+
 '.calchips button{padding:6px 7px 6px 10px;font-size:11.5px}.cdia,.callist{padding:16px 14px}}';
 document.head.appendChild(s); })();

/* ---------- eventos ---------- */
function curto(n){ var p=String(n||'').trim().split(/\s+/).filter(Boolean); return p.length>1?p[0]+' '+p[p.length-1].charAt(0)+'.':(p[0]||''); }
function tkData(t){ var p=null; try{ p=pcall('tkPrazo',t.raw); }catch(e){} if(!p&&t.prazo) p=new Date(t.prazo); return (p&&!isNaN(p))?p:null; }
function eventos(tudo){ var ev=[], todos=isM()&&CS.quem==='equipe';
 try{ (todos?TASKS:TASKS.filter(function(t){ return t.resp===ME(); })).forEach(function(t){ if(t.done||t.arq) return; var d=tkData(t); if(!d) return; var L=t.lead?(LEADS.filter(function(x){ return x.id===t.lead; })[0]):null;
   ev.push({tipo:'tarefa',d:d,t:t.t,c:t.t,s:(L?L.nome:(t.l||''))+(todos&&t.resp?' · '+fn(t.resp):''),go:function(){ go('tarefas'); }}); }); }catch(e){}
 try{ var LL=isM()?LEADS:mine(LEADS); LL.forEach(function(l){ if(l.perdido) return; var x=XL[l.uid]||{}, meu=!isM()||l.resp===ME()||todos;
   var abre=function(el){ if(typeof openDeal==='function') openDeal(l,el); else go('cliente',{lead:l}); };
   if(x.reuniao_em&&(meu||isM())){ var r=new Date(x.reuniao_em); if(!isNaN(r)) ev.push({tipo:'reuniao',d:r,t:(x.reuniao_tipo==='R2'?'2ª reunião':'Reunião')+' · '+l.nome,c:curto(l.nome)+(x.reuniao_tipo==='R2'?' · 2ª':''),s:(x.link_meet?'link da reunião no card':'')+(isM()&&l.resp?(x.link_meet?' · ':'')+fn(l.resp):''),go:abre}); }
   if(meu&&x.etapa_crm==='contato'&&x.contato_respondeu==null&&W.CRM7&&W.CRM7.prazoContato){ var pz=W.CRM7.prazoContato(x); if(pz){ var a=new Date(pz.auto.getTime()+3*36e5);
     ev.push({tipo:'crm',d:a,t:l.nome+': marcar Contato feito',c:'Contato · '+curto(l.nome),s:'sem marcação, a Alice volta a chamar',go:abre}); } }
   if(meu&&x.data_decisao&&l.st!==4){ var dd=String(x.data_decisao).slice(0,10).split('-'); if(dd.length===3) ev.push({tipo:'proposta',dia:1,d:new Date(+dd[0],+dd[1]-1,+dd[2],12),t:l.nome+' decide a proposta',c:'Decide · '+curto(l.nome),s:brl(l.valor||0),go:abre}); }
  }); }catch(e){}
 try{ (typeof AGD!=='undefined'?AGD:[]).forEach(function(a){ var dd=String(a.data_assembleia||'').slice(0,10).split('-'); if(dd.length!==3) return;
   var tp={IMOVEL:'Imóvel',AUTOMOVEL:'Automóvel',SERVICOS:'Serviços'}[String(a.tipo||'').toUpperCase()]||a.tipo||''; var adm=/anc|âncora/i.test(a.administradora||'')?'Âncora':'HS';
   ev.push({tipo:'assembleia',dia:1,d:new Date(+dd[0],+dd[1]-1,+dd[2],12),t:'Assembleia '+adm+(tp?' · '+tp:''),c:adm+(tp?' · '+(tp==='Automóvel'?'Auto':tp):''),s:a.obs||'',go:function(){ go('assembleias'); }}); }); }catch(e){}
 return ev.filter(function(e){ return tudo||!CS.off[e.tipo]; }).sort(function(a,b){ return a.d-b.d; }); }
function chave(d){ return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
function hm(e){ return e.dia?'dia todo':z(e.d.getHours())+':'+z(e.d.getMinutes()); }
function cor(e,p){ return 'color-mix(in srgb,'+TC[e.tipo][2]+' '+p+'%,var(--card))'; }

/* ---------- tela ---------- */
R.calendario=function(v){ var h=new Date(); if(!CS.mes) CS.mes=new Date(h.getFullYear(),h.getMonth(),1); if(!CS.dia) CS.dia=new Date(h.getFullYear(),h.getMonth(),h.getDate());
 v.innerHTML='<div class="hx rv"><div><h1 class="h1"><em>Calendário</em></h1><div class="sub">Tarefas, reuniões, prazos do CRM, propostas e assembleias num lugar só</div></div><span class="sp"></span><button class="btn gd" id="calsync">'+I('cal',16)+'Adicionar ao meu calendário</button></div>'+
  '<div class="calbar rv"><h3 id="calt"></h3><div class="calnavg"><button class="calnav" id="calp" title="Mês anterior">'+I('chevl',16)+'</button><button class="calnav" id="caln" title="Próximo mês">'+I('chevr',16)+'</button></div><button class="btn sm ol" id="calh">Hoje</button><span class="sp"></span>'+
   seg('calv',[['mes','Mês'],['lista','Agenda']],CS.vista)+(isM()?seg('calq',[['meus','Meus'],['equipe','Equipe']],CS.quem):'')+'</div>'+
  '<div class="calchips rv" id="calf">'+TIPOS.map(function(t){ return '<button data-t="'+t[0]+'" class="'+(CS.off[t[0]]?'off':'')+'" title="Mostrar ou esconder"><i style="background:'+t[2]+'"></i>'+t[1]+'<em>0</em></button>'; }).join('')+'</div>'+
  '<div id="calb"></div>';
 $('#calp').onclick=function(){ CS.mes=new Date(CS.mes.getFullYear(),CS.mes.getMonth()-1,1); pinta(); };
 $('#caln').onclick=function(){ CS.mes=new Date(CS.mes.getFullYear(),CS.mes.getMonth()+1,1); pinta(); };
 $('#calh').onclick=function(){ var n=new Date(); CS.mes=new Date(n.getFullYear(),n.getMonth(),1); CS.dia=new Date(n.getFullYear(),n.getMonth(),n.getDate()); pinta(); };
 bindSeg('calv',function(k){ CS.vista=k; pinta(); }); if(isM()) bindSeg('calq',function(k){ CS.quem=k; pinta(); });
 $$('#calf button').forEach(function(b){ b.onclick=function(){ CS.off[b.dataset.t]=!CS.off[b.dataset.t]; b.classList.toggle('off',!!CS.off[b.dataset.t]); pinta(); }; });
 $('#calsync').onclick=sincronizar;
 pinta();
 try{ if(typeof carregaAss==='function'&&!(typeof AGD!=='undefined'&&AGD.length)) carregaAss().then(function(){ if(cur==='calendario') pinta(); }); }catch(e){} };
function contagem(ini,fim){ var n={}; eventos(true).forEach(function(e){ if(e.d>=ini&&e.d<fim) n[e.tipo]=(n[e.tipo]||0)+1; }); $$('#calf button').forEach(function(b){ var x=$('em',b); if(x) x.textContent=n[b.dataset.t]||0; }); }
function pinta(){ var b=$('#calb'); if(!b) return; ITENS=[]; var E=eventos(), por={}; E.forEach(function(e){ var k=chave(e.d); (por[k]=por[k]||[]).push(e); });
 $('#calt').innerHTML=MESES[CS.mes.getMonth()]+' <span>'+CS.mes.getFullYear()+'</span>';
 if(CS.vista==='lista'){ var ini=new Date(); ini.setHours(0,0,0,0); var fim=new Date(ini.getTime()+75*864e5), dias={}, ord=[]; contagem(ini,fim);
  E.filter(function(e){ return e.d>=ini&&e.d<=fim; }).forEach(function(e){ var k=chave(e.d); if(!dias[k]){ dias[k]=[]; ord.push(e.d); } dias[k].push(e); });
  b.innerHTML='<div class="panel rv in callist">'+(ord.length?ord.map(function(d){ var r=relDia(d); return '<div class="cdh">'+(r?'<span class="cbdg">'+r+'</span>':'')+'<b>'+DIAS[d.getDay()].charAt(0).toUpperCase()+DIAS[d.getDay()].slice(1)+', '+d.getDate()+' de '+MESES[d.getMonth()]+'</b><small>'+nComp(dias[chave(d)].length)+'</small></div><div class="ctl">'+dias[chave(d)].map(itemHTML).join('')+'</div>'; }).join(''):vazio('Agenda livre','Nada nos próximos 75 dias.'))+'</div>';
  liga(b); return; }
 var m0=CS.mes, ini2=new Date(m0.getFullYear(),m0.getMonth(),1-((m0.getDay()+6)%7)), hoje=chave(new Date()), cells='';
 contagem(new Date(m0.getFullYear(),m0.getMonth(),1),new Date(m0.getFullYear(),m0.getMonth()+1,1));
 var semanas=Math.ceil((((m0.getDay()+6)%7)+new Date(m0.getFullYear(),m0.getMonth()+1,0).getDate())/7);
 for(var i=0;i<semanas*7;i++){ var d=new Date(ini2.getFullYear(),ini2.getMonth(),ini2.getDate()+i), k=chave(d), L=por[k]||[], fds=(i%7)>4;
  cells+='<div class="dc'+(d.getMonth()!==m0.getMonth()?' fora':'')+(fds?' fds':'')+(k===hoje?' hoje':'')+(CS.dia&&k===chave(CS.dia)?' sel':'')+'" data-d="'+d.getTime()+'" title="'+e4(DIAS[d.getDay()]+', '+d.getDate()+' de '+MESES[d.getMonth()])+(L.length?' · '+nComp(L.length):'')+'"><span class="dn">'+d.getDate()+'</span>'+
   L.slice(0,3).map(function(e){ var c=TC[e.tipo][2]; return '<span class="ev" style="background:'+cor(e,13)+';border-color:'+c+'">'+(e.dia?'':'<b style="color:'+c+'">'+hm(e)+'</b>')+'<span>'+e4(e.c||e.t)+'</span></span>'; }).join('')+
   (L.length>3?'<span class="mais">+'+(L.length-3)+' mais</span>':'')+
   (L.length?'<span class="pts">'+L.slice(0,4).map(function(e){ return '<i style="background:'+TC[e.tipo][2]+'"></i>'; }).join('')+'</span>':'')+'</div>'; }
 var sel=CS.dia?(por[chave(CS.dia)]||[]):[];
 b.innerHTML='<div class="calwrap rv in"><div class="panel calpm"><div class="calw">'+['seg','ter','qua','qui','sex','sáb','dom'].map(function(x,j){ return '<div'+(j>4?' class="fds"':'')+'>'+x+'</div>'; }).join('')+'</div><div class="calg">'+cells+'</div></div>'+
  '<div class="panel cdia">'+painelDia(sel,E)+'</div></div>';
 $$('.dc',b).forEach(function(c){ c.onclick=function(){ CS.dia=new Date(+c.dataset.d); if(CS.dia.getMonth()!==CS.mes.getMonth()) CS.mes=new Date(CS.dia.getFullYear(),CS.dia.getMonth(),1); pinta(); }; });
 liga(b); }
function nComp(n){ return n+' compromisso'+(n!==1?'s':''); }
function relDia(d){ var h=new Date(); h.setHours(0,0,0,0); var x=new Date(d); x.setHours(0,0,0,0); var dif=Math.round((x-h)/864e5); return dif===0?'Hoje':dif===1?'Amanhã':dif===-1?'Ontem':''; }
function vazio(t,s){ return '<div class="cvazio"><div class="ic">'+I('sun',24)+'</div><b>'+t+'</b><small>'+s+'</small></div>'; }
function painelDia(sel,E){ var d=CS.dia; if(!d) return vazio('Escolha um dia','Toque num dia do mês.');
 var r=relDia(d), dt=new Date(d); dt.setHours(23,59,59,999);
 var h='<div class="cdhd"><div class="cdt"><small>'+MES3[d.getMonth()]+'</small><b>'+d.getDate()+'</b></div><div><h4>'+DIAS[d.getDay()]+'</h4><p>'+(r?'<span class="cbdg">'+r+'</span>':'')+(sel.length?nComp(sel.length):'Dia livre')+'</p></div></div>';
 h+=sel.length?'<div class="ctl">'+sel.map(itemHTML).join('')+'</div>':vazio('Nada marcado','Aproveite para adiantar as tarefas e os retornos.');
 var px=E.filter(function(e){ return e.d>dt; }).slice(0,5);
 if(px.length) h+='<div class="cprox"><h5>Próximos compromissos</h5>'+px.map(function(e){ var i=ITENS.length; ITENS.push(e); return '<div class="cpx" data-ev="'+i+'"><div class="dt"><small>'+DIAS[e.d.getDay()].slice(0,3)+'</small><b>'+e.d.getDate()+'</b>'+(e.d.getMonth()!==d.getMonth()?'<em>'+MES3[e.d.getMonth()]+'</em>':'')+'</div><i style="background:'+TC[e.tipo][2]+'"></i><span><b>'+e4(e.t)+'</b><small>'+(e.dia?'dia todo':hm(e))+' · '+TC[e.tipo][4]+'</small></span></div>'; }).join('')+'</div>';
 return h; }
function rotDia(d){ var r=relDia(d); return (r?r+' · ':'')+DIAS[d.getDay()]+', '+d.getDate()+' de '+MESES[d.getMonth()]; }
var ITENS=[];
function itemHTML(e){ var i=ITENS.length; ITENS.push(e); var c=TC[e.tipo];
 return '<div class="cali" data-ev="'+i+'"><span class="h'+(e.dia?' td':'')+'">'+hm(e)+'</span><div class="cx" style="border-color:'+c[2]+';background:'+cor(e,9)+'"><b>'+e4(e.t)+'</b><small><em style="color:'+c[2]+'">'+c[4]+'</em>'+(e.s?'<span>'+e4(e.s)+'</span>':'')+'</small></div></div>'; }
function liga(b){ $$('[data-ev]',b).forEach(function(x){ x.onclick=function(){ var e=ITENS[+x.dataset.ev]; if(e&&e.go) e.go(x); }; }); }

/* ---------- assinar no Google / Outlook / Apple ---------- */
function sincronizar(){ if(RO()){ toast('Saia do “Ver como” para pegar o seu link','eye'); return; }
 var s=sheet('<h2>Adicionar ao meu calendário</h2><p style="color:var(--mut);font-size:13px;line-height:1.55;margin:6px 0 14px">Assine o calendário da Agion no app que você já usa, em <b>qualquer e-mail seu</b> (o da empresa e os pessoais). Entram as suas tarefas, reuniões, prazos do CRM, decisões de proposta e as assembleias, e tudo se atualiza sozinho.</p><div class="calsync" id="cslist"><div class="empty" style="padding:14px">Gerando o seu link…</div></div>',520);
 Promise.resolve(papi('/api/cal/link',{method:'GET'})).then(function(r){ var d=r&&r.data, l=$('#cslist',s); if(!l) return;
  if(!r||!r.ok||!d||!d.url){ l.innerHTML='<div class="empty" style="padding:14px">Não consegui gerar o link agora. Tente de novo em instantes.</div>'; return; }
  var u=d.url, wc=d.webcal, nm=encodeURIComponent('Agion');
  var op=[['google','Google Agenda','Gmail da empresa ou pessoal','https://calendar.google.com/calendar/r?cid='+encodeURIComponent(wc),'globe'],
   ['apple','Apple (iPhone, iPad e Mac)','Abre o app Calendário para assinar',wc,'phone'],
   ['outlook','Outlook.com / Hotmail','Conta pessoal da Microsoft','https://outlook.live.com/calendar/0/addfromweb?url='+encodeURIComponent(u)+'&name='+nm,'mail'],
   ['o365','Outlook da empresa (Microsoft 365)','Conta de trabalho ou escola','https://outlook.office.com/calendar/0/addfromweb?url='+encodeURIComponent(u)+'&name='+nm,'mail']];
  l.innerHTML=op.map(function(o){ return '<a href="'+e4(o[3])+'" data-op="'+o[0]+'" target="_blank" rel="noopener"><span class="ic">'+I(o[4],18)+'</span><span>'+o[1]+'<small>'+o[2]+'</small></span></a>'; }).join('')+
   '<button class="op" id="cscp"><span class="ic">'+I('copy',18)+'</span><span>Copiar o link<small>Para qualquer outro app de calendário</small></span></button>'+
   '<p style="font-size:11.8px;color:var(--mut);line-height:1.5;margin-top:10px">O Google e o Outlook atualizam calendários assinados de tempos em tempos (pode levar algumas horas). O link é só seu: não compartilhe. <a href="#" id="cstr" style="color:var(--goldd);display:inline;padding:0;background:none;font:inherit">Trocar o link</a> se precisar invalidar o antigo.</p>';
  var ap=$('[data-op="apple"]',l); if(ap) ap.onclick=function(ev){ ev.preventDefault(); try{ (W.top||W).location.href=wc; }catch(e){ W.location.href=wc; } };
  $('#cscp',l).onclick=function(){ try{ navigator.clipboard.writeText(u); toast('Link copiado','copy'); }catch(e){ perguntar('Seu link do calendário','Copie o link abaixo.','',  'Ok',u); } };
  $('#cstr',l).onclick=function(ev){ ev.preventDefault(); confirma('Trocar o link?','O link antigo para de funcionar. Depois é preciso assinar de novo com o novo link.','Trocar').then(function(ok){ if(!ok) return;
   Promise.resolve(papi('/api/cal/link',{method:'POST',body:JSON.stringify({trocar:true})})).then(function(){ closeSheet(); toast('Link trocado. Assine de novo com o novo link.','ok'); sincronizar(); }); }); };
 },function(){ var l=$('#cslist',s); if(l) l.innerHTML='<div class="empty" style="padding:14px">Não consegui gerar o link agora.</div>'; }); }

/* ---------- menu: Comercial › Calendário ---------- */
try{ if(typeof V4OK!=='undefined') V4OK.calendario=1;
 var _ngCal=W.navGrupos; W.navGrupos=function(){ var g=_ngCal.apply(this,arguments); try{ var ehc=false; try{ ehc=effRoleR()==='cliente'; }catch(e){} if(ehc) return g;
   return g.map(function(x){ if(x[0]!=='Comercial'||x[1].some(function(t){ return t[0]==='calendario'; })) return x; var it=x[1].slice(), i=-1; it.forEach(function(t,j){ if(t[0]==='tarefas') i=j; }); it.splice(i>=0?i+1:it.length,0,['calendario','Calendário','cal']); return [x[0],it]; }); }catch(e){ return g; } };
 setTimeout(function(){ try{ buildNavKeep(); }catch(e){} },0);
}catch(e){ console.warn('[calendario] menu',e); }

/* ---------- tutorial da aba ---------- */
var TOUR={id:'t-cal',page:'calendario',v:1,g:'Comercial',title:'Calendário',desc:'Tudo que tem data, num lugar só, e como levar para o Google, Outlook ou Apple.',steps:[
 {t:function(){ return document.querySelector('#calb .calg, #calb .callist'); },title:'O seu calendário',text:'Tarefas com prazo, reuniões do CRM, os prazos do “Aguardando resposta”, a data em que o cliente decide a proposta e as assembleias.'},
 {t:function(){ return document.querySelector('#calf'); },title:'Filtros',text:'Toque nas cores para esconder ou mostrar cada tipo.',optional:true},
 {t:function(){ return document.querySelector('#calv'); },title:'Mês ou agenda',text:'No Mês, toque num dia para ver o que tem. A Agenda lista os próximos 75 dias.',optional:true},
 {t:function(){ return document.querySelector('#calsync'); },title:'No seu celular',text:'“Adicionar ao meu calendário” leva tudo para o Google Agenda, o Outlook ou o app Calendário da Apple, em qualquer e-mail seu.'}
]};
(function rt(n){ var T2=W.AgionTour2; if(!(T2&&T2.config&&W.TUG)){ if(n<80) setTimeout(function(){ rt(n+1); },250); return; }
 if(!T2.config.some(function(t){ return t.id===TOUR.id; })) T2.config.push(TOUR);
 try{ var g=W.TUG.filter(function(x){ return x[0]==='Comercial'; })[0]; if(g&&g[1].indexOf('t-cal')<0){ var i=g[1].indexOf('tarefas'); g[1].splice(i>=0?i+1:g[1].length,0,'t-cal'); } if(W.TUIC) W.TUIC['t-cal']='cal'; }catch(e){} })(0);
if(R.tutoriais){ var _rtC=R.tutoriais; R.tutoriais=function(){ try{ var g=W.TUG&&W.TUG.filter(function(x){ return x[0]==='Comercial'; })[0]; if(g&&g[1].indexOf('t-cal')<0) g[1].push('t-cal'); }catch(e){} return _rtC.apply(this,arguments); }; }
})();
