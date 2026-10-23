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
var TIPOS=[['tarefa','Tarefas','#C5A059','check'],['reuniao','Reuniões','#5B8FB9','cal'],['crm','Prazos do CRM','#C99A2E','funnel'],['proposta','Propostas','#3F8F6A','doc'],['assembleia','Assembleias','#8E6FB5','trophy']];
var TC={}; TIPOS.forEach(function(t){ TC[t[0]]=t; });
var CS={mes:null,dia:null,vista:'mes',quem:'meus',off:{}};

(function(){ if(document.getElementById('calcss')) return; var s=document.createElement('style'); s.id='calcss'; s.textContent=
 '.calbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px}.calbar .sp{flex:1}.calbar h3{font:600 20px Lora,serif;min-width:170px;text-transform:capitalize}'+
 '.calnav{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;background:var(--card);box-shadow:var(--shadow)}'+
 '.calchips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}.calchips button{display:inline-flex;align-items:center;gap:6px;padding:6px 11px;border-radius:999px;font:700 11.5px "DM Sans";background:var(--card);color:var(--ink2);box-shadow:var(--shadow);transition:.25s}'+
 '.calchips button i{width:9px;height:9px;border-radius:50%;display:inline-block}.calchips button.off{opacity:.45;box-shadow:none;background:transparent}'+
 '.calg{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}.calg .dw{font:700 10.5px "DM Sans";letter-spacing:.12em;text-transform:uppercase;color:var(--mut);text-align:center;padding:4px 0}'+
 '.calg .dc{min-height:96px;border-radius:16px;background:var(--card);padding:7px 7px 6px;cursor:pointer;transition:transform .25s,box-shadow .25s;position:relative;overflow:hidden;border:2px solid transparent}'+
 '.calg .dc:hover{transform:translateY(-2px);box-shadow:var(--shadow)}.calg .dc.fora{opacity:.4}.calg .dc.hoje .dn{background:var(--ink);color:var(--gold2)}.calg .dc.sel{border-color:var(--gold)}'+
 '.calg .dn{font:700 12px "DM Sans";width:24px;height:24px;border-radius:50%;display:grid;place-items:center;margin-bottom:3px}'+
 '.calg .ev{display:block;font-size:11px;line-height:1.3;padding:2px 6px;border-radius:7px;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
 '.calg .mais{font:700 10.5px "DM Sans";color:var(--mut);padding-left:4px}'+
 '.callist .cdh{font:700 11px "DM Sans";letter-spacing:.12em;text-transform:uppercase;color:var(--mut);margin:14px 0 6px}.callist .cdh:first-child{margin-top:0}'+
 '.cali{display:grid;grid-template-columns:54px 4px 1fr;gap:10px;align-items:center;padding:9px 6px;border-radius:14px;cursor:pointer;transition:background .2s}.cali:hover{background:var(--bg)}'+
 '.cali .h{font:700 12.5px "DM Sans";text-align:right;color:var(--ink2)}.cali .bar{width:4px;height:30px;border-radius:3px}.cali b{display:block;font:600 13.5px "DM Sans"}.cali small{display:block;font-size:11.8px;color:var(--mut);margin-top:1px}'+
 '.calsync a,.calsync button.op{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:16px;background:var(--bg);margin-bottom:8px;color:var(--ink);text-decoration:none;font:600 14px "DM Sans";width:100%;text-align:left}'+
 '.calsync a small,.calsync button.op small{display:block;font:500 12px "DM Sans";color:var(--mut)}.calsync .ic{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;background:var(--card);flex:none}'+
 '@media (max-width:860px){.calg{gap:3px}.calg .dc{min-height:58px;padding:5px;border-radius:12px}.calg .ev{font-size:0;height:6px;width:6px;padding:0;border-radius:50%;display:inline-block;margin:0 2px 0 0}.calg .mais{display:none}.calg .dw{font-size:9.5px;letter-spacing:.06em}}';
 document.head.appendChild(s); })();

/* ---------- eventos ---------- */
function tkData(t){ var p=null; try{ p=pcall('tkPrazo',t.raw); }catch(e){} if(!p&&t.prazo) p=new Date(t.prazo); return (p&&!isNaN(p))?p:null; }
function eventos(){ var ev=[], todos=isM()&&CS.quem==='equipe';
 try{ (todos?TASKS:TASKS.filter(function(t){ return t.resp===ME(); })).forEach(function(t){ if(t.done||t.arq) return; var d=tkData(t); if(!d) return; var L=t.lead?(LEADS.filter(function(x){ return x.id===t.lead; })[0]):null;
   ev.push({tipo:'tarefa',d:d,t:t.t,s:(L?L.nome:(t.l||''))+(todos&&t.resp?' · '+fn(t.resp):''),go:function(){ go('tarefas'); }}); }); }catch(e){}
 try{ var LL=isM()?LEADS:mine(LEADS); LL.forEach(function(l){ if(l.perdido) return; var x=XL[l.uid]||{}, meu=!isM()||l.resp===ME()||todos;
   var abre=function(el){ if(typeof openDeal==='function') openDeal(l,el); else go('cliente',{lead:l}); };
   if(x.reuniao_em&&(meu||isM())){ var r=new Date(x.reuniao_em); if(!isNaN(r)) ev.push({tipo:'reuniao',d:r,t:(x.reuniao_tipo==='R2'?'2ª reunião':'Reunião')+' · '+l.nome,s:(x.link_meet?'link da reunião no card':'')+(isM()&&l.resp?(x.link_meet?' · ':'')+fn(l.resp):''),go:abre}); }
   if(meu&&x.etapa_crm==='contato'&&x.contato_respondeu==null&&W.CRM7&&W.CRM7.prazoContato){ var pz=W.CRM7.prazoContato(x); if(pz){ var a=new Date(pz.auto.getTime()+3*36e5);
     ev.push({tipo:'crm',d:a,t:l.nome+': marcar Contato feito',s:'sem marcação, a Alice volta a chamar',go:abre}); } }
   if(meu&&x.data_decisao&&l.st!==4){ var dd=String(x.data_decisao).slice(0,10).split('-'); if(dd.length===3) ev.push({tipo:'proposta',dia:1,d:new Date(+dd[0],+dd[1]-1,+dd[2],12),t:l.nome+' decide a proposta',s:brl(l.valor||0),go:abre}); }
  }); }catch(e){}
 try{ (typeof AGD!=='undefined'?AGD:[]).forEach(function(a){ var dd=String(a.data_assembleia||'').slice(0,10).split('-'); if(dd.length!==3) return;
   var tp={IMOVEL:'Imóvel',AUTOMOVEL:'Automóvel',SERVICOS:'Serviços'}[String(a.tipo||'').toUpperCase()]||a.tipo||''; var adm=/anc|âncora/i.test(a.administradora||'')?'Âncora':'HS';
   ev.push({tipo:'assembleia',dia:1,d:new Date(+dd[0],+dd[1]-1,+dd[2],12),t:'Assembleia '+adm+(tp?' · '+tp:''),s:a.obs||'',go:function(){ go('assembleias'); }}); }); }catch(e){}
 return ev.filter(function(e){ return !CS.off[e.tipo]; }).sort(function(a,b){ return a.d-b.d; }); }
function chave(d){ return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
function hm(e){ return e.dia?'dia todo':z(e.d.getHours())+':'+z(e.d.getMinutes()); }

/* ---------- tela ---------- */
R.calendario=function(v){ var h=new Date(); if(!CS.mes) CS.mes=new Date(h.getFullYear(),h.getMonth(),1); if(!CS.dia) CS.dia=new Date(h.getFullYear(),h.getMonth(),h.getDate());
 v.innerHTML='<div class="hx rv"><div><h1 class="h1"><em>Calendário</em></h1><div class="sub">Tarefas, reuniões, prazos do CRM, propostas e assembleias num lugar só</div></div><span class="sp"></span><button class="btn gd" id="calsync">'+I('cal',16)+'Adicionar ao meu calendário</button></div>'+
  '<div class="calbar rv"><button class="calnav" id="calp" title="Mês anterior">'+I('chevl',16)+'</button><h3 id="calt"></h3><button class="calnav" id="caln" title="Próximo mês">'+I('chevr',16)+'</button><button class="btn sm ol" id="calh">Hoje</button><span class="sp"></span>'+
   seg('calv',[['mes','Mês'],['lista','Agenda']],CS.vista)+(isM()?seg('calq',[['meus','Meus'],['equipe','Equipe']],CS.quem):'')+'</div>'+
  '<div class="calchips rv" id="calf">'+TIPOS.map(function(t){ return '<button data-t="'+t[0]+'" class="'+(CS.off[t[0]]?'off':'')+'"><i style="background:'+t[2]+'"></i>'+t[1]+'</button>'; }).join('')+'</div>'+
  '<div id="calb"></div>';
 $('#calp').onclick=function(){ CS.mes=new Date(CS.mes.getFullYear(),CS.mes.getMonth()-1,1); pinta(); };
 $('#caln').onclick=function(){ CS.mes=new Date(CS.mes.getFullYear(),CS.mes.getMonth()+1,1); pinta(); };
 $('#calh').onclick=function(){ var n=new Date(); CS.mes=new Date(n.getFullYear(),n.getMonth(),1); CS.dia=new Date(n.getFullYear(),n.getMonth(),n.getDate()); pinta(); };
 bindSeg('calv',function(k){ CS.vista=k; pinta(); }); if(isM()) bindSeg('calq',function(k){ CS.quem=k; pinta(); });
 $$('#calf button').forEach(function(b){ b.onclick=function(){ CS.off[b.dataset.t]=!CS.off[b.dataset.t]; b.classList.toggle('off',!!CS.off[b.dataset.t]); pinta(); }; });
 $('#calsync').onclick=sincronizar;
 pinta();
 try{ if(typeof carregaAss==='function'&&!(typeof AGD!=='undefined'&&AGD.length)) carregaAss().then(function(){ if(cur==='calendario') pinta(); }); }catch(e){} };
function pinta(){ var b=$('#calb'); if(!b) return; ITENS=[]; var E=eventos(), por={}; E.forEach(function(e){ var k=chave(e.d); (por[k]=por[k]||[]).push(e); });
 $('#calt').textContent=MESES[CS.mes.getMonth()]+' '+CS.mes.getFullYear();
 if(CS.vista==='lista'){ var ini=new Date(); ini.setHours(0,0,0,0); var fim=new Date(ini.getTime()+75*864e5), dias={}, ord=[];
  E.filter(function(e){ return e.d>=ini&&e.d<=fim; }).forEach(function(e){ var k=chave(e.d); if(!dias[k]){ dias[k]=[]; ord.push(e.d); } dias[k].push(e); });
  b.innerHTML='<div class="panel rv in callist">'+(ord.length?ord.map(function(d){ return '<div class="cdh">'+rotDia(d)+'</div>'+dias[chave(d)].map(itemHTML).join(''); }).join(''):'<div class="empty">Nada nos próximos 75 dias.</div>')+'</div>';
  liga(b,E); return; }
 var m0=CS.mes, ini2=new Date(m0.getFullYear(),m0.getMonth(),1-((m0.getDay()+6)%7)), hoje=chave(new Date()), cells='';
 for(var i=0;i<42;i++){ var d=new Date(ini2.getFullYear(),ini2.getMonth(),ini2.getDate()+i), k=chave(d), L=por[k]||[];
  cells+='<div class="dc'+(d.getMonth()!==m0.getMonth()?' fora':'')+(k===hoje?' hoje':'')+(CS.dia&&k===chave(CS.dia)?' sel':'')+'" data-d="'+d.getTime()+'"><div class="dn">'+d.getDate()+'</div>'+
   L.slice(0,3).map(function(e){ var c=TC[e.tipo][2]; return '<span class="ev" style="background:color-mix(in srgb,'+c+' 18%,transparent);color:var(--ink)" title="'+e4(e.t)+'"><b style="color:'+c+'">'+(e.dia?'':hm(e)+' ')+'</b>'+e4(e.t)+'</span>'; }).join('')+(L.length>3?'<span class="mais">+'+(L.length-3)+'</span>':'')+'</div>'; }
 var sel=CS.dia?(por[chave(CS.dia)]||[]):[];
 b.innerHTML='<div class="g12 rv in" style="grid-template-columns:1.7fr 1fr"><div class="panel"><div class="calg">'+['seg','ter','qua','qui','sex','sáb','dom'].map(function(x){ return '<div class="dw">'+x+'</div>'; }).join('')+cells+'</div></div>'+
  '<div class="panel"><div class="ph"><h3>'+I('cal',18)+(CS.dia?rotDia(CS.dia):'Escolha um dia')+'</h3></div><div class="callist">'+(sel.length?sel.map(itemHTML).join(''):'<div class="empty" style="padding:18px">Nada neste dia.</div>')+'</div></div></div>';
 $$('.dc',b).forEach(function(c){ c.onclick=function(){ CS.dia=new Date(+c.dataset.d); pinta(); }; });
 liga(b,E); }
function rotDia(d){ var h=new Date(); h.setHours(0,0,0,0); var x=new Date(d); x.setHours(0,0,0,0); var dif=Math.round((x-h)/864e5);
 return (dif===0?'Hoje · ':dif===1?'Amanhã · ':dif===-1?'Ontem · ':'')+DIAS[d.getDay()]+', '+d.getDate()+' de '+MESES[d.getMonth()]; }
var ITENS=[];
function itemHTML(e){ var i=ITENS.length; ITENS.push(e); var c=TC[e.tipo];
 return '<div class="cali" data-ev="'+i+'"><span class="h">'+hm(e)+'</span><span class="bar" style="background:'+c[2]+'"></span><span><b>'+e4(e.t)+'</b>'+(e.s?'<small>'+e4(c[1].replace(/s$/,''))+' · '+e4(e.s)+'</small>':'<small>'+e4(c[1].replace(/s$/,''))+'</small>')+'</span></div>'; }
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
