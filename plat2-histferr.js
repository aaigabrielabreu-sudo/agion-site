/* ==========================================================================
   Agion — plat2-histferr.js · HISTFERR_20261020 (Chat B · 20/out/2026)
   Histórico de ferramentas — roda dentro do plat2-v4.html (visual novo).
   1) Ferramenta nova "Histórico de ferramentas" (rota #historico-ferramentas[?lead=id]):
      Visão gerencial / Meu painel · Por cliente · Todos os links.
   2) Card do CRM: selo (simulando agora · abriu o link · link sem abrir) + bloco "Atividades"
      com as 3 últimas linhas de lead_atividades; filtro "Simularam nas últimas 24 h".
   3) Ficha do lead/cliente: aba "Atividades" (linha do tempo) + o mesmo selo no topo.
   4) "+ Gerar link" usa o AgCalcLink.modal (calc-link.js) com a busca do CRM.
   Dados: calc_links, calc_eventos e a view lead_atividades (Chat A). O banco já devolve só o
   que cada pessoa pode ver (Master tudo · líder a equipe · especialista os dele): nada é
   filtrado por pessoa aqui. Só leitura: nenhuma tela grava no banco.
   ========================================================================== */
(function(){
'use strict';
var W=window, D=document;
if(W.__hfOn) return; W.__hfOn=1;
var FER={financiamento:{n:'Financiamento × Consórcio',c:'#2E6A8A',p:'calc-financiamento',k:'Financiamento',o:'o',em:'no',de:'do'},alavancagem:{n:'Alavancagem Patrimonial',c:'#C5A059',p:'calc-alavancagem',k:'Alavancagem',o:'a',em:'na',de:'da'},escada:{n:'Escada Financeira',c:'#3F8F6A',p:'escada-financeira',k:'Escada',o:'a',em:'na',de:'da'}};
var TIPO={simulacao:['⌁','#C5A059'],abertura:['◉','#2E6A8A'],link:['↗','#0B2A26'],proposta:['▤','#A8457A'],envio:['✉','#A8457A'],tarefa:['✓','#6E7C78'],etapa:['→','#C2463B'],nota:['•','#8C9590'],email:['✉','#1E4E79'],whatsapp:['●','#2E8F57']};
var H=36e5;
var HF={links:[],ev:{},t:0,ok:true,load:null,atv:{},dias:30,sub:'ger',sel:null,mdet:false,q:'',fesp:'',sim24:false};
W.AgionHF=HF;

/* ---------------------------------------------------------------- utilidades */
function $(s,r){ try{ return (r||D).querySelector(s); }catch(e){ return null; } }
function $$(s,r){ try{ return [].slice.call((r||D).querySelectorAll(s)); }catch(e){ return []; } }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function ms(x){ if(!x) return 0; var t=+new Date(x); return isNaN(t)?0:t; }
function agora(){ return Date.now(); }
function ha(t){ var m=Math.round((agora()-t)/6e4); if(m<1) return 'agora'; if(m<60) return 'há '+m+' min'; var h=Math.round(m/60); if(h<24) return 'há '+h+' h'; var d=Math.round(h/24); return d===1?'ontem':'há '+d+' d'; }
function falta(t){ var m=Math.round((t-agora())/6e4); if(m<=0) return 'vencido'; if(m<60) return m+' min'; var h=Math.floor(m/60); if(h<24) return h+' h'+(m%60&&h<6?' '+(m%60):''); return Math.floor(h/24)+'d '+(h%24)+'h'; }
function hm(t){ var d=new Date(t); return (d.getHours()<10?'0':'')+d.getHours()+':'+(d.getMinutes()<10?'0':'')+d.getMinutes(); }
function dia(t){ var d=new Date(t), h=new Date(); if(d.toDateString()===h.toDateString()) return 'Hoje'; var o=new Date(agora()-864e5); if(d.toDateString()===o.toDateString()) return 'Ontem'; return (d.getDate()<10?'0':'')+d.getDate()+'/'+(d.getMonth()<9?'0':'')+(d.getMonth()+1); }
function dur(msv){ var m=Math.round(msv/6e4); if(m<60) return m+' min'; var h=Math.floor(m/60), r=m%60; if(h<24) return h+' h'+(r?' '+(r<10?'0':'')+r:''); var d=Math.floor(h/24); return d+' d'+(h%24?' '+(h%24)+' h':''); }
function norma(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim(); }
function prim(n){ return String(n||'').split(' ')[0]; }
function reduzido(){ try{ return W.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } }
function mob(){ try{ return W.isMob(); }catch(e){ return W.innerWidth<=860; } }
function M(){ try{ return W.isM(); }catch(e){ return false; } }
function ESP(){ try{ return W.effRoleR()==='especialista'; }catch(e){ return false; } }
function meu(){ try{ return W.realId(); }catch(e){ return null; } }
function SB(){ try{ return W.psb(); }catch(e){ return null; } }
function toast(m,i){ try{ W.toast(m,i); }catch(e){} }
function Ic(n,s){ try{ return W.I(n,s); }catch(e){ return ''; } }
function avh(n,st){ try{ return W.av(n||'—','',st||''); }catch(e){ return ''; } }
function ferChip(c){ var f=FER[c]||FER.financiamento; return '<span class="pill hf-fc" style="--fc:'+f.c+'">'+esc(f.k)+'</span>'; }

/* ---------------------------------------------------------------- leads do CRM (os que a pessoa já vê) */
function leadDe(uid){ if(!uid) return null; var L=W.LEADS||[]; for(var i=0;i<L.length;i++) if(L[i].uid===uid) return L[i]; return null; }
function colDe(l){ try{ return W.AG7?W.AG7.colDe(l):String(l.st); }catch(e){ return String(l.st); } }
function etapa(l){ if(!l) return ''; if(l.perdido) return 'Perdido'; try{ var k=colDe(l),cs=(W.AG7&&W.AG7.cols)||[]; for(var i=0;i<cs.length;i++) if(cs[i].k===k) return cs[i].n; }catch(e){} try{ return W.ST[l.st].n; }catch(e){ return ''; } }
function tipoDe(l){ if(!l) return ''; try{ var c=W.ccatDe(l); if(c&&W.CCAT[c]) return W.CCAT[c].lb; }catch(e){} try{ if(l.cat&&l.cat!=='outros') return W.LCAT[l.cat].lb; }catch(e){} return ''; }
function espNome(id,fb){ try{ var u=(W.U||{})[id]; if(u&&u.n) return u.n; }catch(e){} return fb||''; }
function reuniao(l){ if(!l) return false; var k=colDe(l); if(k==='agd'||k==='dia'||k==='3'||k==='4') return true; try{ var x=(W.XL||{})[l.uid]||{}; return !!x.reuniao_em; }catch(e){ return false; } }
function fechou(l){ return !!(l&&l.st===4&&!l.perdido); }
function leadsBusca(){ return (W.LEADS||[]).filter(function(l){ return !l.perdido; }).map(function(l){ return {id:l.uid,nome:l.nome,etapa:etapa(l),esp:espNome(l.resp),tel:l.tel||''}; }); }

/* ---------------------------------------------------------------- dados (calc_links + calc_eventos) */
function normLink(r){ return {token:r.token,calc:FER[r.calculadora]?r.calculadora:'financiamento',lead:r.lead_id||null,nome:(r.cliente_nome||'').trim(),por:r.criado_por||null,porNome:r.criado_por_nome||'',
  criado:ms(r.criado_em),expira:ms(r.expira_em),ab:+r.aberturas||0,prim:ms(r.primeira_abertura),ult:ms(r.ultima_abertura),url:r.url||''}; }
function carrega(force){
  if(HF.load) return HF.load;
  if(!force&&HF.t&&agora()-HF.t<45000) return Promise.resolve();
  var sb=SB(); if(!sb) return Promise.resolve();
  HF.load=(async function(){
    try{
      var desde=new Date(agora()-120*864e5).toISOString();
      var r=await sb.from('calc_links').select('token,calculadora,lead_id,cliente_nome,criado_por,criado_por_nome,criado_em,expira_em,aberturas,primeira_abertura,ultima_abertura,url').gte('criado_em',desde).order('criado_em',{ascending:false}).limit(2000);
      if(r.error) throw r.error;
      var L=(r.data||[]).map(normLink), ev={}, tk=L.map(function(l){ return l.token; });
      for(var i=0;i<tk.length;i+=100){ var p=tk.slice(i,i+100); var e=await sb.from('calc_eventos').select('token,dados,criado_em').in('token',p).order('criado_em',{ascending:true}).limit(5000);
        if(e.error) throw e.error; (e.data||[]).forEach(function(x){ (ev[x.token]=ev[x.token]||[]).push({ts:ms(x.criado_em)/1000,d:x.dados||{}}); }); }
      HF.links=L; HF.ev=ev; HF.ok=true; HF.t=agora();
    }catch(err){ console.warn('[histferr] links',err); HF.ok=false; HF.t=agora(); }
    HF.load=null;
  })();
  return HF.load;
}
function sims(l){ return HF.ev[l.token]||[]; }
function ultSim(l){ var s=sims(l); return s.length?s[s.length-1].ts*1000:0; }
function linksDoLead(uid){ return HF.links.filter(function(l){ return l.lead===uid; }); }
function selo(uid,mini){ if(!uid||!HF.t) return ''; var ls=linksDoLead(uid); if(!ls.length) return '';
  var t=agora(), sim=0, ab=0, sem=false;
  ls.forEach(function(l){ sim=Math.max(sim,ultSim(l)); if(l.ult) ab=Math.max(ab,l.ult); if(!l.ab&&l.expira>t&&t-l.criado>12*H) sem=true; });
  var cl='pill hf-selo'+(mini?' sm':'');
  if(sim&&t-sim<3*H) return '<span class="'+cl+' au hf-dot hf-pulse" title="Simulou '+ha(sim)+'">simulando agora</span>';
  if(ab&&t-ab<24*H) return '<span class="'+cl+' bl" title="Abriu o link '+ha(ab)+'">'+(mini?'abriu ':'abriu o link ')+ha(ab)+'</span>';
  if(sem) return '<span class="'+cl+' bad" title="Há um link válido que o cliente ainda não abriu">link sem abrir</span>';
  return ''; }
function simulou24(uid){ var t=agora(); return linksDoLead(uid).some(function(l){ var u=ultSim(l); return u&&t-u<24*H; }); }

/* agrupa por cliente: lead do CRM ou o nome digitado */
function chave(l){ return l.lead?'l:'+l.lead:'n:'+(norma(l.nome)||l.token); }
function clientes(links){ var by={}, out=[];
  links.forEach(function(l){ var k=chave(l), c=by[k]; if(!c){ var ld=leadDe(l.lead); c=by[k]={k:k,lead:ld,uid:l.lead,nome:ld?ld.nome:(l.nome||'Cliente sem nome'),links:[],ult:0,ns:0,esp:ld?(ld.resp||null):l.por,espNome:ld?espNome(ld.resp,l.porNome):espNome(l.por,l.porNome)}; out.push(c); }
    c.links.push(l); var s=sims(l); c.ns+=s.length; c.ult=Math.max(c.ult,ultSim(l),l.ult||0,l.criado); });
  out.forEach(function(c){ c.links.sort(function(a,b){ return b.criado-a.criado; }); c.lastSim=Math.max.apply(0,c.links.map(ultSim).concat([0])); c.lastAb=Math.max.apply(0,c.links.map(function(l){ return l.ult||0; }).concat([0])); });
  out.sort(function(a,b){ return b.ult-a.ult; }); return out; }
function eventosCli(c){ var ev=[]; c.links.forEach(function(l){ sims(l).forEach(function(e){ ev.push({ts:e.ts,d:e.d,calc:l.calc,token:l.token}); }); }); ev.sort(function(a,b){ return a.ts-b.ts; }); return ev; }
function cogita(c){ var A=W.AgCalcLink; if(!A) return ''; var porCalc={}, out=[];
  c.links.forEach(function(l){ var s=sims(l); if(s.length) (porCalc[l.calc]=porCalc[l.calc]||[]).push.apply(porCalc[l.calc],s); });
  Object.keys(porCalc).forEach(function(k){ var fx=A.faixasArr(porCalc[k]); fx.forEach(function(f){ out.push(esc(f[0].toLowerCase())+' de '+esc(f[1])); }); });
  return out.slice(0,5).join(', '); }
function ultimaConfig(c){ var A=W.AgCalcLink, ev=eventosCli(c); if(!A||!ev.length) return ''; var last=ev[ev.length-1], cp=(last.d&&last.d.campos)||[];
  return cp.filter(function(x){ return x[2]!==''; }).slice(0,4).map(function(x){ return esc(x[1].toLowerCase())+' '+esc(A.val(x)); }).join(', '); }
/* linhas da linha do tempo de cada link (o que mudou em cada tela parada 3 s ou mais) */
function linhasDe(l){ var A=W.AgCalcLink, s=sims(l); if(!A||!s.length) return []; return A.difs(s).map(function(x){ return {ts:x.ts*1000,calc:l.calc,txt:x.ch.join(' · ')||'mesma simulação',rs:x.rs.join(' · ')}; }); }
function periodo(){ var d=agora()-HF.dias*864e5; return HF.links.filter(function(l){ return l.criado>=d; }); }

/* ---------------------------------------------------------------- visual (mesmos tokens do visual novo) */
function css(){ if($('#hf-css')) return; var s=D.createElement('style'); s.id='hf-css'; s.textContent=
 '.hf .hf-kp{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px;margin-bottom:18px}'+
 '.hf .hf-k{padding:16px 18px;border-radius:22px}.hf .hf-k .l{font:700 10.5px "DM Sans";letter-spacing:.14em;text-transform:uppercase;color:var(--mut)}'+
 '.hf .hf-k .v{font:600 30px/1.1 Lora,Georgia,serif;margin-top:8px;letter-spacing:-.01em}.hf .hf-k .d{font-size:12px;color:var(--mut);margin-top:4px}'+
 '.hf .hf-g2{display:grid;grid-template-columns:1.25fr 1fr;gap:18px;margin-bottom:18px}.hf .hf-g3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-bottom:18px}.hf .hf-g3.n2{grid-template-columns:repeat(2,minmax(0,1fr))}'+
 '.hf .panel .ph{margin-bottom:10px}.hf .ph small{font-weight:500}'+
 '.hf .hf-hot{display:flex;align-items:center;gap:12px;padding:11px 0;border-top:1px solid var(--line)}.hf .hf-hot:first-child{border-top:0;padding-top:2px}'+
 '.hf .hf-hot .nm{font-weight:700;font-size:13.8px;display:flex;align-items:center;gap:7px;flex-wrap:wrap}.hf .hf-hot .ds{font-size:12.5px;color:var(--mut);margin-top:2px;line-height:1.45}'+
 '.hf-dot:before{content:"";width:7px;height:7px;border-radius:50%;background:currentColor;flex:none}.hf-pulse:before{animation:hfpl 1.4s infinite}@keyframes hfpl{50%{opacity:.25}}'+
 '@media (prefers-reduced-motion: reduce){.hf-pulse:before{animation:none}.hf .hf-fun .fl,.hf .hf-bars .fl{transition:none}}'+
 '.btn.hf-wa{background:#2E8F57;color:#fff;box-shadow:none}.btn.hf-wa .i{stroke:#fff}'+
 '.hf .hf-fun .st{display:grid;grid-template-columns:120px minmax(0,1fr) 48px;gap:10px;align-items:center;margin:8px 0}.hf .hf-fun .st>b{font-weight:600;font-size:13px}'+
 '.hf .hf-fun .tr{height:30px;background:var(--bg2);border-radius:10px;overflow:hidden}.hf .hf-fun .fl{height:100%;border-radius:10px;display:flex;align-items:center;padding-left:10px;font-weight:700;font-size:12.5px;color:#fff;transition:width .8s var(--ez);min-width:26px}'+
 '.hf .hf-fun .pc{font-size:12px;color:var(--mut);text-align:right}.hf .hf-nt{font-size:12px;color:var(--mut);margin-top:8px;line-height:1.5}'+
 '.hf .hf-bars .r{display:grid;grid-template-columns:120px minmax(0,1fr) 34px;gap:10px;align-items:center;margin:11px 0}.hf .hf-bars .nm{font-weight:600;font-size:13px;line-height:1.25}'+
 '.hf .hf-bars .tr{height:12px;border-radius:999px;background:var(--bg2);position:relative;overflow:hidden}.hf .hf-bars .fl{position:absolute;inset:0 auto 0 0;border-radius:999px;transition:width .8s var(--ez)}.hf .hf-bars .vv{font-weight:700;text-align:right;font-size:13px}'+
 '.hf .hf-stk{display:flex;height:14px;border-radius:999px;overflow:hidden;background:var(--bg2);margin-top:6px}.hf .hf-stk span{display:block;height:100%}'+
 '.hf .hf-er{margin:10px 0}.hf .hf-er .h{display:flex;justify-content:space-between;gap:10px;font-size:13px}.hf .hf-er .h span{color:var(--mut);white-space:nowrap}'+
 '.hf .hf-leg{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:var(--mut);margin-top:10px}.hf .hf-leg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}'+
 '.hf .hf-vz{color:var(--mut);font-size:13px;padding:6px 0;line-height:1.5}'+
 '.hf .hf-per{display:inline-flex;gap:2px;padding:4px;border-radius:999px;background:var(--card);box-shadow:var(--shadow)}.hf .hf-per button{padding:7px 12px;border-radius:999px;font-size:12px;font-weight:700;color:var(--mut)}.hf .hf-per button.on{background:var(--bg2);color:var(--ink)}'+
 '.hf .hf-pc2{display:grid;grid-template-columns:330px minmax(0,1fr);gap:18px;align-items:start}.hf .hf-pc2>.panel{padding:0;overflow:hidden}'+
 '.hf .hf-srch{display:flex;gap:8px;padding:12px;border-bottom:1px solid var(--line)}.hf .hf-srch input,.hf .hf-srch select{flex:1;border:1.5px solid var(--line);background:var(--bg);border-radius:12px;padding:9px 11px;font-size:13px;min-width:0;color:var(--ink)}'+
 '.hf .hf-cl{max-height:640px;overflow:auto}.hf .hf-ci{display:flex;gap:11px;padding:12px 14px;border-bottom:1px solid var(--line);cursor:pointer;transition:background .2s}.hf .hf-ci:last-child{border-bottom:0}'+
 '.hf .hf-ci:hover{background:var(--bg)}.hf .hf-ci.on{background:color-mix(in srgb,var(--gold2) 30%,var(--card))}.hf .hf-ci .nm{font-weight:700}.hf .hf-ci .ds{font-size:12px;color:var(--mut);margin-top:2px}.hf .hf-ci .hf-tg{display:flex;gap:5px;margin-top:6px;flex-wrap:wrap}'+
 '.hf .hf-ci .hr{font-size:12px;color:var(--mut);white-space:nowrap;margin-left:auto}'+
 '.pill.hf-fc{background:color-mix(in srgb,var(--fc) 15%,var(--card));color:color-mix(in srgb,var(--fc) 78%,var(--ink))}'+
 '.hf .hf-dh{display:flex;gap:14px;align-items:center;padding:18px 20px;border-bottom:1px solid var(--line);flex-wrap:wrap}.hf .hf-dh .nm{font:600 21px Lora,Georgia,serif}.hf .hf-dh .ds{color:var(--mut);font-size:13px;margin-top:3px}'+
 '.hf .hf-dh .ac{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}.hf .hf-dh .av{width:52px;height:52px;font-size:17px}'+
 '.hf .hf-cog{margin:16px 20px 0;padding:13px 15px;border-radius:16px;background:var(--sb);color:#E8E2D2;font-size:13.5px;line-height:1.55}.hf .hf-cog b{color:var(--gold2)}'+
 '.hf .hf-lk{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;padding:16px 20px 4px}.hf .hf-lkc{border:1.5px solid var(--line);border-radius:16px;padding:12px 14px;background:var(--card)}'+
 '.hf .hf-lkc .tt{font-weight:700;font-size:13.5px;color:color-mix(in srgb,var(--fc) 80%,var(--ink))}.hf .hf-lkc .mt{font-size:12px;color:var(--mut);margin-top:5px;line-height:1.6}.hf .hf-lkc .bt{display:flex;gap:6px;margin-top:9px;flex-wrap:wrap}'+
 '.hf-tl{padding:6px 20px 20px}.hf-tl h4{font:700 10.5px "DM Sans";letter-spacing:.14em;text-transform:uppercase;color:var(--mut);margin:14px 0 4px}'+
 '.hf-ev{display:grid;grid-template-columns:48px 30px minmax(0,1fr);gap:10px;align-items:start;padding:8px 0;position:relative}.hf-ev .hr{font-weight:700;font-size:12.5px;color:var(--goldd);padding-top:6px}'+
 '.hf-ev .ic{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-size:13px;color:#fff;position:relative;z-index:1}'+
 '.hf-ev:not(:last-child) .ic:after{content:"";position:absolute;top:30px;left:14px;width:2px;height:calc(100% + 12px);background:var(--line);z-index:-1}'+
 '.hf-ev .tx{padding-top:4px;font-size:13.5px;line-height:1.55;min-width:0;overflow-wrap:anywhere}.hf-ev .tx small{display:block;color:var(--mut);font-size:12px}.hf-ev .tx s{color:var(--mut2)}'+
 '.hf-ev .tx b{display:inline-block;background:var(--au);color:var(--aut);border-radius:6px;padding:0 6px;margin:1px 0;font-weight:700;font-size:12.5px}.hf-ev .tx .rs{display:block;color:var(--mut);font-size:12px;margin-top:2px}.hf-ev .tx .rs b{background:none;padding:0;color:var(--ink2)}'+
 '.hf .hf-t{width:100%;border-collapse:collapse;font-size:13px}.hf .hf-t th{text-align:left;font:700 10.5px "DM Sans";letter-spacing:.12em;text-transform:uppercase;color:var(--mut);padding:8px 10px;border-bottom:1px solid var(--line);white-space:nowrap}'+
 '.hf .hf-t td{padding:10px;border-bottom:1px solid var(--line);vertical-align:middle}.hf .hf-t tbody tr{cursor:pointer}.hf .hf-t tbody tr:hover td{background:var(--bg)}'+
 '.hf .hf-how .t2{display:none}.hf .hf-per button{white-space:nowrap}.hf .hf-bk{display:none}.hf .hf-how b{width:18px;height:18px;border-radius:50%;background:var(--gold2);color:#0B2A26;display:inline-grid;place-items:center;font:800 11px "DM Sans"}.hf .snw .hf-how{margin-right:8px}'+
 '@media (max-width:1180px){.hf .hf-kp{grid-template-columns:repeat(3,minmax(0,1fr))}.hf .hf-g3{grid-template-columns:repeat(2,minmax(0,1fr))}}'+
 '@media (max-width:860px){.hf .hf-kp{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.hf .hf-k{padding:13px 14px}.hf .hf-k .v{font-size:25px}.hf .hf-kp .hf-k:last-child:nth-child(odd){grid-column:1/-1}'+
  '.hf .hf-g2,.hf .hf-g3,.hf .hf-g3.n2,.hf .hf-pc2{grid-template-columns:minmax(0,1fr)}.hf .hf-fun .st{grid-template-columns:86px minmax(0,1fr) 40px}.hf .hf-bars .r{grid-template-columns:96px minmax(0,1fr) 28px}'+
  '.hf .hf-pc2.det>.hf-cl0{display:none}.hf .hf-pc2:not(.det)>.hf-det0{display:none}.hf .hf-bk{display:inline-flex}.hf .hf-dh{padding:14px 16px}.hf .hf-dh .ac{margin-left:0;width:100%}.hf .hf-cog{margin:14px 16px 0}.hf .hf-lk{padding:14px 16px 4px}.hf-tl{padding:6px 16px 16px}'+
  '.hf .hf-t thead{display:none}.hf .hf-t,.hf .hf-t tbody{display:block}.hf .hf-t tr{display:block;border:1px solid var(--line);border-radius:16px;padding:8px 12px;margin-bottom:10px;background:var(--card)}'+
  '.hf .hf-t td{display:flex;justify-content:space-between;align-items:center;gap:10px;border:0;padding:4px 0;text-align:right}.hf .hf-t td:before{content:attr(data-l);color:var(--mut);font-size:11.5px;font-weight:600;text-align:left}.hf .hf-t td:first-child{font-size:14px}.hf .hf-t td:first-child:before{content:none}'+
  '.hf .hx .btn{flex:1 1 auto;justify-content:center}.hf .snw{flex-wrap:wrap;row-gap:8px}.hf .snw>.snav{flex:1 1 100%}.hf .snw>.sp{display:none}.hf .hf-how .t1{display:none}.hf .hf-how .t2{display:inline}.hf .hf-per{margin-left:auto}.hf .hf-per button{padding:7px 10px}'+
  '.fbar.mfb #hfSimF{grid-column:1/-1;justify-content:center;box-shadow:var(--shadow)}.fbar.mfb #hfSimF.on{box-shadow:none}}'+
 /* card do CRM */
 '.deal .hf-sw{flex:none;display:inline-flex}.deal .hf-selo{font-size:10px;padding:3px 8px;margin-left:2px}.deal .hf-selo.au{background:#FBF0D2;color:#7A5A1A}.deal .hf-selo.bl{background:#DCE9F1;color:#1F4F69}.deal .hf-selo.bad{background:#F7DDD8;color:#9A2F25}'+
 '.deal .hf-at{margin:9px -13px 0;padding:8px 13px 9px;background:rgba(0,0,0,.1);border-top:1px solid rgba(255,255,255,.18);color:var(--t)}'+
 '.deal .hf-at .ti{font:700 9.5px "DM Sans";letter-spacing:.13em;text-transform:uppercase;opacity:.75;display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}'+
 '.deal .hf-at .ti button{font:700 9.5px "DM Sans";letter-spacing:.1em;color:inherit;opacity:1;text-transform:uppercase;padding:2px 0}'+
 '.deal .hf-mini{display:flex;gap:7px;font-size:11.8px;padding:2px 0;align-items:flex-start;line-height:1.35}.deal .hf-mini>i{font-style:normal;width:16px;height:16px;border-radius:50%;background:rgba(255,255,255,.92);display:grid;place-items:center;font-size:9px;flex:none;margin-top:1px}'+
 '.deal .hf-mini span{min-width:0;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.deal .hf-mini em{font-style:normal;opacity:.7}'+
 '.hf-sf{display:inline-flex;align-items:center;gap:6px;padding:8px 13px;border-radius:999px;font-size:12.5px;font-weight:700;background:var(--card);box-shadow:inset 0 0 0 1.5px var(--line);color:var(--ink2);white-space:nowrap}'+
 '.hf-sf.on{background:var(--ink);color:var(--bg);box-shadow:none}'+
 /* ficha: aba Atividades */
 '.hf-atv .hf-flt{display:flex;gap:6px;flex-wrap:wrap;margin:2px 0 6px}.hf-atv .hf-flt button{padding:6px 12px;border-radius:999px;box-shadow:inset 0 0 0 1.5px var(--line);font-size:12px;font-weight:600;color:var(--ink2)}'+
 '.hf-atv .hf-flt button.on{background:var(--ink);color:var(--bg);box-shadow:none}.hf-atv .hf-flt button .n{font-size:10.5px;opacity:.65;margin-left:5px}.hf-atv .hf-tl{padding:4px 2px 4px}'+
 '.hf-fsel{margin-left:6px;vertical-align:6px}';
 D.head.appendChild(s); }

/* ---------------------------------------------------------------- tela: Histórico de ferramentas */
var VW=null;
function vivo(){ return VW&&VW.isConnected&&W.cur==='histferr'; }
function brlK(v){ try{ return W.brlK(v); }catch(e){ return 'R$ '+Math.round(v); } }
function per(){ return '<div class="hf-per" id="hfPer" title="Período">'+[7,30,90].map(function(d){ return '<button data-d="'+d+'" class="'+(HF.dias===d?'on':'')+'">'+d+' dias</button>'; }).join('')+'</div>'; }
function rota(v,arg){ css(); arg=arg||{}; VW=v; try{ var cr=$('#crumb'); if(cr) cr.innerHTML='Ferramentas <span>· Histórico</span>'; }catch(e){}
  if(arg.lead){ HF.sub='cli'; HF.sel='l:'+arg.lead; HF.mdet=true; }
  else if(arg.sub){ HF.sub=arg.sub; }
  if(HF.t&&agora()-HF.t<45000&&!arg.recarregar){ desenhaTudo(); return; }
  v.innerHTML='<div class="hf">'+cab(true)+'<div class="panel rv" style="padding:30px;text-align:center;color:var(--mut);font-size:13px">Carregando os links das calculadoras…</div></div>';
  bindCab();
  carrega(true).then(function(){ if(vivo()) desenhaTudo(); }); }
function cab(vazio){ var L=vazio?[]:periodo(), C=vazio?[]:clientes(L);
  return '<div class="hx rv"><div><h1 class="h1"><em>Histórico</em> de ferramentas</h1><div class="sub">Todos os links das calculadoras num lugar só: quem recebeu, quem abriu e o que cada cliente simulou</div></div><span class="sp"></span>'+
   '<button class="btn dk" id="hfGer">'+Ic('plus',15)+'Gerar link para um cliente</button></div>'+
   W.sn('hfsn',[['ger',ESP()?'Meu painel':'Visão gerencial'],['cli','Por cliente',vazio?null:C.length],['lnk','Todos os links',vazio?null:L.length]],HF.sub,'<button class="btn sm ol hf-how" id="hfHow"><b>?</b><span class="t1">Como usar esta ferramenta</span><span class="t2">Como usar</span></button>'+per()); }
function bindCab(){
  var g=$('#hfGer'); if(g) g.onclick=function(){ abreGerar({}); };
  var h=$('#hfHow'); if(h) h.onclick=function(){ tour(); };
  try{ W.bindSeg('hfsn',function(k){ HF.sub=k; HF.mdet=false; corpo(); }); }catch(e){}
  $$('#hfPer button').forEach(function(b){ b.onclick=function(){ HF.dias=+b.dataset.d; desenhaTudo(); }; }); }
function desenhaTudo(){ if(!VW) return; var y=0; try{ y=$('#main').scrollTop; }catch(e){}
  VW.innerHTML='<div class="hf">'+cab()+(HF.ok?'':'<div class="banner rv">'+Ic('bolt',16)+'<span>Não consegui ler o histórico agora. Confira a conexão e tente de novo.</span></div>')+'<div id="hfBody"></div></div>';
  bindCab(); corpo(); try{ W.reveal(VW); }catch(e){} try{ $('#main').scrollTop=y; }catch(e){} }
function corpo(){ var b=$('#hfBody'); if(!b) return; b.innerHTML=HF.sub==='cli'?telaCli():HF.sub==='lnk'?telaLnk():telaGer(); ligaCorpo(b); try{ W.reveal(b); }catch(e){} }

/* ----- Visão gerencial / Meu painel */
function mediana(a){ if(!a.length) return 0; a=a.slice().sort(function(x,y){ return x-y; }); var m=Math.floor(a.length/2); return a.length%2?a[m]:(a[m-1]+a[m])/2; }
function telaGer(){ var L=periodo(), C=clientes(L), t=agora();
  var ab=L.filter(function(l){ return l.ab>0; }).length, nev=L.reduce(function(a,l){ return a+sims(l).length; },0), cs=C.filter(function(c){ return c.ns>0; }).length;
  var md=mediana(L.filter(function(l){ return l.prim&&l.prim>=l.criado; }).map(function(l){ return l.prim-l.criado; }));
  var K=[['Links enviados',L.length,'nos últimos '+HF.dias+' dias'],['Abertos',L.length?Math.round(100*ab/L.length)+'%':'—',ab+' de '+L.length+' links'],['Clientes que simularam',cs,'de '+C.length+' cliente'+(C.length===1?'':'s')],
    ['Simulações',nev,'telas paradas 3 s ou mais'],['Tempo até abrir',md?dur(md):'—',md?'mediana entre envio e 1ª abertura':'nenhum link aberto ainda']];
  var h='<div class="hf-kp rv" id="hfKp">'+K.map(function(k){ return '<div class="panel hf-k"><div class="l">'+k[0]+'</div><div class="v">'+k[1]+'</div><div class="d">'+esc(k[2])+'</div></div>'; }).join('')+'</div>';
  /* clientes quentes: abriram ou simularam nas últimas 24 h (independe do período) */
  var Q=clientes(HF.links).filter(function(c){ return c.lastSim>t-24*H||c.lastAb>t-24*H; }).sort(function(a,b){ return Math.max(b.lastSim,b.lastAb)-Math.max(a.lastSim,a.lastAb); }).slice(0,8);
  HF._q=Q;
  h+='<div class="hf-g2"><div class="panel rv" id="hfQ"><div class="ph"><h3>🔥 Clientes quentes agora</h3><small>abriram ou simularam nas últimas 24 h</small></div>'+(Q.length?Q.map(function(c,i){
    var s=c.lastSim>t-24*H, w=s?c.lastSim:c.lastAb, chip=s?(t-w<3*H?'<span class="pill au hf-dot hf-pulse">simulou '+ha(w)+'</span>':'<span class="pill bl">simulou '+ha(w)+'</span>'):'<span class="pill bl">abriu '+ha(w)+'</span>';
    var ld=c.lead, d1=[tipoDe(ld),ld&&ld.valor?brlK(ld.valor):'',ld?etapa(ld):'fora do CRM',!ESP()?c.espNome:''].filter(Boolean).join(' · ');
    var cg=cogita(c), d2=cg?'Está cogitando: '+cg:(c.ns?'Simulou: '+ultimaConfig(c):'Abriu o link e ainda não mexeu nos números.');
    return '<div class="hf-hot" data-q="'+i+'" style="cursor:pointer">'+avh(c.nome)+'<div style="flex:1;min-width:0"><div class="nm">'+esc(c.nome)+' '+chip+'</div><div class="ds">'+esc(d1)+'</div><div class="ds">'+d2+'</div></div>'+(ld&&ld.tel?'<button class="btn sm hf-wa" data-ligar="'+i+'">'+Ic('wa',14)+'Ligar</button>':'')+'</div>'; }).join(''):'<div class="hf-vz">Nenhum cliente simulou nas últimas 24 h.</div>')+'</div>';
  /* do link ao fechamento */
  var comL=L.filter(function(l){ return l.lead&&leadDe(l.lead); }), fs=L.filter(function(l){ return sims(l).length; }).length;
  var fr=comL.filter(function(l){ return reuniao(leadDe(l.lead)); }).length, ff=comL.filter(function(l){ return fechou(leadDe(l.lead)); }).length;
  var F=[['Link enviado',L.length,'var(--s4)','var(--s4t)'],['Abriu',ab,'#2E6A8A','#fff'],['Simulou',fs,'#C5A059','#fff'],['Reunião',fr,'#3F8F6A','#fff'],['Fechou',ff,'#A8457A','#fff']];
  var sl=comL.filter(function(l){ return sims(l).length; }), slr=sl.filter(function(l){ return reuniao(leadDe(l.lead)); }).length;
  h+='<div class="panel rv" id="hfF"><div class="ph"><h3>Do link ao fechamento</h3><small>período: últimos '+HF.dias+' dias</small></div><div class="hf-fun">'+(L.length?F.map(function(x,i){ var p=Math.round(100*x[1]/L.length);
    return '<div class="st"><b>'+x[0]+'</b><div class="tr"><div class="fl" style="width:'+Math.max(p,i?6:100)+'%;background:'+x[2]+';color:'+x[3]+'">'+x[1]+'</div></div><div class="pc">'+(i?p+'%':'')+'</div></div>'; }).join('')+
    '<div class="hf-nt">'+(sl.length?'Quem simula vira reunião '+Math.round(100*slr/sl.length)+'% das vezes. ':'')+'Reunião e fechamento contam os links ligados a um cliente do CRM.</div>':'<div class="hf-vz">Os números aparecem quando o primeiro link for enviado no período.</div>')+'</div></div></div>';
  /* por especialista (Master) · por ferramenta · precisam de atenção */
  var mm=M();
  h+='<div class="hf-g3'+(mm?'':' n2')+'">';
  if(mm){ var E={}; L.forEach(function(l){ var k=l.por||l.porNome||'?'; var e=E[k]=E[k]||{n:espNome(l.por,l.porNome)||'Sem nome',t:0,a:0,s:0}; e.t++; if(l.ab>0) e.a++; if(sims(l).length) e.s++; });
    var EL=Object.keys(E).map(function(k){ return E[k]; }).sort(function(a,b){ return b.t-a.t; });
    h+='<div class="panel rv" id="hfEsp"><div class="ph"><h3>Por especialista</h3></div>'+(EL.length?EL.map(function(e){ var sa=Math.min(e.s,e.a), so=Math.max(0,e.a-sa);
      return '<div class="hf-er"><div class="h"><b>'+esc(e.n)+'</b><span>'+e.t+' link'+(e.t===1?'':'s')+' · '+Math.round(100*e.a/e.t)+'% abertos</span></div><div class="hf-stk"><span style="width:'+(100*sa/e.t)+'%;background:var(--gold)"></span><span style="width:'+(100*so/e.t)+'%;background:var(--s4)"></span></div></div>'; }).join('')+
      '<div class="hf-leg"><span><i style="background:var(--gold)"></i>simularam</span><span><i style="background:var(--s4)"></i>abriram sem simular</span><span><i style="background:var(--bg2);box-shadow:inset 0 0 0 1px var(--line)"></i>não abriram</span></div>':'<div class="hf-vz">Ninguém enviou links no período.</div>')+'</div>'; }
  var PF={financiamento:[0,0],alavancagem:[0,0],escada:[0,0]}; L.forEach(function(l){ PF[l.calc][0]++; PF[l.calc][1]+=sims(l).length; });
  var mx=Math.max(1,PF.financiamento[0],PF.alavancagem[0],PF.escada[0]), best=null, br=0;
  Object.keys(PF).forEach(function(k){ if(PF[k][0]&&PF[k][1]/PF[k][0]>br){ br=PF[k][1]/PF[k][0]; best=k; } });
  h+='<div class="panel rv" id="hfFe"><div class="ph"><h3>Por ferramenta</h3></div><div class="hf-bars">'+Object.keys(PF).map(function(k){ return '<div class="r"><div class="nm">'+esc(FER[k].n.replace(' × Consórcio',' × Cons.'))+'</div><div class="tr"><div class="fl" style="width:'+(100*PF[k][0]/mx)+'%;background:'+FER[k].c+'"></div></div><div class="vv">'+PF[k][0]+'</div></div>'; }).join('')+'</div>'+
   (best?'<div class="hf-nt">A '+esc(FER[best].n)+' é a que mais gera simulação por link.</div>':'')+'</div>';
  var A=atencao(); HF._a=A;
  h+='<div class="panel rv" id="hfA"><div class="ph"><h3>⚠ Precisam de atenção</h3></div>'+(A.length?A.map(function(a,i){ return '<div class="hf-hot">'+avh(a.nome)+'<div style="flex:1;min-width:0"><div class="nm" style="font-size:13px">'+esc(a.nome)+'</div><div class="ds">'+esc(a.txt)+'</div></div><button class="btn sm ol" data-at="'+i+'">'+a.bt+'</button></div>'; }).join(''):'<div class="hf-vz">Nada pendente.</div>')+'</div></div>';
  return '<div class="rv">'+h+'</div>'; }
function atencao(){ var t=agora(), A=[], vis={};
  HF.links.forEach(function(l){ var ld=leadDe(l.lead), nome=ld?ld.nome:(l.nome||'Cliente sem nome');
    if(!l.ab&&l.expira>t&&l.expira-t<12*H) A.push({k:'re',l:l,lead:ld,nome:nome,txt:'Link '+FER[l.calc].de+' '+FER[l.calc].n+' vence em '+falta(l.expira)+' e não foi aberto',bt:'Reenviar'});
    else if(!l.ab&&l.expira<=t&&l.expira>t-HF.dias*864e5&&!HF.links.some(function(o){ return o!==l&&chave(o)===chave(l)&&o.calc===l.calc&&o.criado>l.criado; })) A.push({k:'novo',l:l,lead:ld,nome:nome,txt:'Link venceu sem abrir ('+FER[l.calc].n+')',bt:'Gerar novo'}); });
  clientes(HF.links).forEach(function(c){ if(c.lead&&c.lastSim>t-24*H){ var k=colDe(c.lead); if(!c.lead.perdido&&(k==='0'||k==='1'||k==='2')) A.push({k:'reu',lead:c.lead,nome:c.nome,txt:'Simulou e ainda não tem reunião marcada',bt:'Marcar reunião'}); } });
  return A.slice(0,8); }

/* ----- Por cliente */
function listaCli(){ var C=clientes(periodo());
  if(HF.sel&&HF.sel.indexOf('l:')===0&&!C.some(function(c){ return c.k===HF.sel; })){ var ld=leadDe(HF.sel.slice(2)); if(ld) C.unshift({k:HF.sel,lead:ld,uid:ld.uid,nome:ld.nome,links:linksDoLead(ld.uid),ult:0,ns:0,esp:ld.resp,espNome:espNome(ld.resp),lastSim:0,lastAb:0}); }
  return C; }
function filtraCli(C){ var q=norma(HF.q); return C.filter(function(c){ if(q&&norma(c.nome).indexOf(q)<0) return false; if(HF.fesp&&(c.esp||'')!==HF.fesp&&c.espNome!==HF.fesp) return false; return true; }); }
function itemCli(c){ var ns=c.ns, t=c.lastSim||c.lastAb||(c.links[0]&&c.links[0].criado)||0, fs={};
  c.links.forEach(function(l){ fs[l.calc]=1; });
  return '<div class="hf-ci'+(c.k===HF.sel?' on':'')+'" data-k="'+esc(c.k)+'">'+avh(c.nome)+'<div style="min-width:0;flex:1"><div class="nm">'+esc(c.nome)+'</div><div class="ds">'+esc([c.lead?etapa(c.lead):'fora do CRM',!ESP()?prim(c.espNome):''].filter(Boolean).join(' · '))+'</div>'+
   '<div class="hf-tg">'+Object.keys(fs).map(ferChip).join('')+(ns?'<span class="pill au">'+ns+' simulaç'+(ns===1?'ão':'ões')+'</span>':'<span class="pill">'+(c.links.length?'não simulou':'sem link')+'</span>')+'</div></div><div class="hr">'+(t?ha(t):'')+'</div></div>'; }
function telaCli(){ var C=listaCli(), F=filtraCli(C);
  if(!HF.sel||!C.some(function(c){ return c.k===HF.sel; })) HF.sel=F[0]?F[0].k:null;
  var sel=C.filter(function(c){ return c.k===HF.sel; })[0]||null, esp={};
  C.forEach(function(c){ if(c.espNome) esp[c.esp||c.espNome]=c.espNome; });
  var fsel=!ESP()?'<select id="hfFe2"><option value="">Todos os especialistas</option>'+Object.keys(esp).sort(function(a,b){ return esp[a].localeCompare(esp[b]); }).map(function(k){ return '<option value="'+esc(k)+'"'+(HF.fesp===k?' selected':'')+'>'+esc(esp[k])+'</option>'; }).join('')+'</select>':'';
  return '<div class="hf-pc2 rv'+(HF.mdet&&sel?' det':'')+'"><div class="panel hf-cl0"><div class="hf-srch"><input id="hfBq" placeholder="Buscar cliente" value="'+esc(HF.q)+'" autocomplete="off">'+fsel+'</div><div class="hf-cl" id="hfCl">'+(F.length?F.map(itemCli).join(''):'<div class="empty">'+(C.length?'Nenhum cliente com esse filtro.':'Nenhum link no período. Gere o primeiro em “Gerar link para um cliente”.')+'</div>')+'</div></div>'+
   '<div class="panel hf-det0" id="hfDet">'+detalhe(sel)+'</div></div>'; }
function detalhe(c){ if(!c) return '<div class="empty">Escolha um cliente na lista.</div>'; var t=agora(), ld=c.lead;
  var ds=[tipoDe(ld),ld&&ld.valor?brlK(ld.valor):'',ld?etapa(ld):'fora do CRM',!ESP()?c.espNome:''].filter(Boolean).join(' · ');
  var h='<div class="hf-dh"><button class="ib hf-bk" data-a="bk" aria-label="Voltar para a lista">'+Ic('back',18)+'</button>'+avh(c.nome)+'<div style="min-width:0"><div class="nm">'+esc(c.nome)+' '+(ld?selo(ld.uid):'')+'</div><div class="ds">'+esc(ds)+'</div></div><div class="ac">'+
   (ld?'<button class="btn sm ol" data-a="card">Abrir card no CRM</button><button class="btn sm ol" data-a="cad">Cadastro</button>':'')+'<button class="btn sm dk" data-a="novo">'+Ic('plus',13)+'Novo link</button></div></div>';
  var cg=cogita(c), pn=esc(prim(c.nome));
  h+='<div class="hf-cog">'+(cg?'O que <b>'+pn+'</b> está cogitando: '+cg+'.':c.ns?'O que <b>'+pn+'</b> simulou: '+ultimaConfig(c)+'.':c.links.length?'O cliente ainda não mexeu nos números. Vale um toque: <b>“conseguiu abrir a simulação?”</b>':'Ainda não há links para <b>'+pn+'</b>. Gere um em <b>Novo link</b>: tudo o que o cliente abrir e simular aparece aqui.')+'</div>';
  if(c.links.length) h+='<div class="hf-lk">'+c.links.map(function(l){ var n=sims(l).length, ok=l.expira>t;
    return '<div class="hf-lkc" style="--fc:'+FER[l.calc].c+'"><div class="tt">'+FER[l.calc].n+'</div><div class="mt">Gerado '+ha(l.criado)+' · '+(ok?'<span class="pill ok">vence em '+falta(l.expira)+'</span>':'<span class="pill bad">vencido</span>')+'<br>Aberto '+l.ab+'× · '+n+' simulaç'+(n===1?'ão':'ões')+(!ESP()&&l.porNome?' · por '+esc(prim(l.porNome)):'')+'</div>'+
     (ok&&l.url?'<div class="bt"><button class="btn sm ol" data-cp="'+esc(l.token)+'">'+Ic('copy',12)+'Copiar</button><button class="btn sm ol" data-wa="'+esc(l.token)+'">'+Ic('wa',12)+'WhatsApp</button>'+(l.por&&l.por===meu()?'<button class="btn sm ol" data-en="'+esc(l.token)+'">Encerrar</button>':'')+'</div>':'')+'</div>'; }).join('')+'</div>';
  var R=[]; c.links.forEach(function(l){ R.push.apply(R,linhasDe(l)); }); R.sort(function(a,b){ return b.ts-a.ts; });
  var G=[], gi={}; R.forEach(function(r){ var d=dia(r.ts); if(gi[d]==null){ gi[d]=G.length; G.push([d,[]]); } G[gi[d]][1].push(r); });
  h+='<div class="hf-tl">'+(R.length?G.map(function(g){ return '<h4>'+g[0]+'</h4>'+g[1].map(function(r){ return '<div class="hf-ev"><div class="hr">'+hm(r.ts)+'</div><div class="ic" style="background:'+FER[r.calc].c+'">⌁</div><div class="tx">'+r.txt+(r.rs?'<span class="rs">'+r.rs+'</span>':'')+'<small>'+FER[r.calc].n+'</small></div></div>'; }).join(''); }).join(''):'<div class="hf-vz" style="padding:10px 0 4px">Sem simulações registradas.</div>')+'</div>';
  return h; }

/* ----- Todos os links */
function telaLnk(){ var L=periodo().slice().sort(function(a,b){ return b.criado-a.criado; }), t=agora();
  return '<div class="panel rv" id="hfT" style="padding:12px 14px;overflow-x:auto">'+(L.length?'<table class="hf-t"><thead><tr><th>Cliente</th><th>Ferramenta</th><th>Especialista</th><th>Gerado</th><th>Validade</th><th>Aberturas</th><th>Simulações</th><th>Etapa no CRM</th></tr></thead><tbody>'+
   L.map(function(l){ var ld=leadDe(l.lead), n=sims(l).length; return '<tr data-k="'+esc(chave(l))+'"><td data-l="Cliente"><b>'+esc(ld?ld.nome:(l.nome||'Cliente sem nome'))+'</b></td><td data-l="Ferramenta">'+ferChip(l.calc)+'</td><td data-l="Especialista">'+esc(espNome(l.por,l.porNome)||'—')+'</td><td data-l="Gerado">'+ha(l.criado)+'</td>'+
    '<td data-l="Validade">'+(l.expira>t?'<span class="pill ok">'+falta(l.expira)+'</span>':'<span class="pill bad">vencido</span>')+'</td><td data-l="Aberturas">'+l.ab+'×</td><td data-l="Simulações">'+(n||'—')+'</td><td data-l="Etapa no CRM">'+esc(ld?etapa(ld):'—')+'</td></tr>'; }).join('')+'</tbody></table>':'<div class="empty">Nenhum link no período. Gere o primeiro em “Gerar link para um cliente”.</div>')+'</div>'; }

/* ----- ações da tela */
function linkDe(tok){ for(var i=0;i<HF.links.length;i++) if(HF.links[i].token===tok) return HF.links[i]; return null; }
function waLink(l,ld){ var A=W.AgCalcLink; if(!A||!l) return; var u=A.waUrl(ld&&ld.tel,A.waTexto(l.url,l.expira/1000)), w=null; try{ w=W.open(u,'_blank'); }catch(e){} if(!w) location.href=u; }
function abreCli(k){ HF.sub='cli'; HF.sel=k; HF.mdet=true; desenhaTudo(); try{ $('#main').scrollTo({top:0,behavior:reduzido()?'auto':'smooth'}); }catch(e){} }
function ligaCorpo(b){
  $$('[data-q]',b).forEach(function(r){ r.onclick=function(e){ if(e.target.closest('[data-ligar]')) return; var c=(HF._q||[])[+r.dataset.q]; if(c) abreCli(c.k); }; });
  $$('[data-ligar]',b).forEach(function(x){ x.onclick=function(e){ e.stopPropagation(); var c=(HF._q||[])[+x.dataset.ligar]; if(c&&c.lead) try{ W.waLead(c.lead); }catch(err){} }; });
  $$('[data-at]',b).forEach(function(x){ x.onclick=function(){ var a=(HF._a||[])[+x.dataset.at]; if(!a) return;
    if(a.k==='re'){ var A=W.AgCalcLink; if(A) A.copiar(a.l.url); if(a.lead&&a.lead.tel){ waLink(a.l,a.lead); } else toast('Link copiado — cole na conversa com o cliente','copy'); }
    else if(a.k==='novo') abreGerar({lead:a.lead,pagina:FER[a.l.calc].p});
    else if(a.k==='reu'&&a.lead){ try{ W.openDeal(a.lead); }catch(err){ W.go('crm'); } } }; });
  var q=$('#hfBq',b); if(q) q.oninput=function(){ HF.q=q.value; var C=filtraCli(listaCli()), cl=$('#hfCl'); if(cl){ cl.innerHTML=C.length?C.map(itemCli).join(''):'<div class="empty">Nenhum cliente com esse filtro.</div>'; ligaLista(); } };
  var fe=$('#hfFe2',b); if(fe) fe.onchange=function(){ HF.fesp=fe.value; corpo(); };
  ligaLista(); ligaDet();
  $$('#hfT tbody tr',b).forEach(function(tr){ tr.onclick=function(){ abreCli(tr.dataset.k); }; }); }
function ligaLista(){ $$('#hfCl .hf-ci').forEach(function(it){ it.onclick=function(){ HF.sel=it.dataset.k; HF.mdet=true; var C=listaCli(), c=C.filter(function(x){ return x.k===HF.sel; })[0];
  $$('#hfCl .hf-ci').forEach(function(x){ x.classList.toggle('on',x===it); }); var d=$('#hfDet'); if(d){ d.innerHTML=detalhe(c); ligaDet(); d.animate&&!reduzido()&&d.animate([{opacity:.4,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:320,easing:'cubic-bezier(.22,1,.36,1)'}); }
  var pc=$('.hf-pc2'); if(pc) pc.classList.toggle('det',!!c); if(mob()) try{ $('#main').scrollTo({top:0}); }catch(e){} }; }); }
function ligaDet(){ var d=$('#hfDet'); if(!d) return; var c=listaCli().filter(function(x){ return x.k===HF.sel; })[0]; if(!c) return;
  $$('[data-a]',d).forEach(function(x){ x.onclick=function(){ var a=x.dataset.a;
    if(a==='bk'){ HF.mdet=false; var pc=$('.hf-pc2'); if(pc) pc.classList.remove('det'); }
    else if(a==='card'&&c.lead){ try{ W.openDeal(c.lead); }catch(e){ W.go('crm'); } }
    else if(a==='cad'&&c.lead){ W.go('cliente',{lead:c.lead,tab:'atv'}); }
    else if(a==='novo'){ abreGerar({lead:c.lead,nome:c.lead?'':c.nome}); } }; });
  $$('[data-cp]',d).forEach(function(x){ x.onclick=function(){ var l=linkDe(x.dataset.cp); if(l&&W.AgCalcLink){ W.AgCalcLink.copiar(l.url); x.innerHTML=Ic('ok',12)+'Copiado'; setTimeout(function(){ x.innerHTML=Ic('copy',12)+'Copiar'; },1500); } }; });
  $$('[data-wa]',d).forEach(function(x){ x.onclick=function(){ waLink(linkDe(x.dataset.wa),c.lead); }; });
  $$('[data-en]',d).forEach(function(x){ x.onclick=function(){ var l=linkDe(x.dataset.en); if(!l||!W.AgCalcLink) return; if(!W.roOk()) return;
    W.confirma('Encerrar este link agora?','Quem tiver o link não consegue mais abrir. O histórico do que o cliente simulou continua aqui.','Encerrar').then(function(ok){ if(!ok) return;
      W.AgCalcLink.encerrar(l.token).then(function(j){ if(j&&j.ok){ toast('Link encerrado','ok'); l.expira=agora()-1000; setTimeout(function(){ carrega(true).then(function(){ if(vivo()) desenhaTudo(); }); },1500); desenhaTudo(); } else toast('Só quem gerou o link pode encerrar','lock'); }).catch(function(){ toast('Sem conexão com o servidor','x'); }); }); }; }); }

/* ----- gerar link (o mesmo componente das calculadoras, com a busca do CRM) */
var MOD=null;
function fechaModal(){ try{ if(MOD) MOD.fechar(); }catch(e){} MOD=null; }
function abreGerar(o){ o=o||{}; var A=W.AgCalcLink; if(!A){ toast('Não consegui abrir o gerador de links agora','x'); return null; }
  if(!o.tour){ try{ if(!W.roOk()) return null; }catch(e){} }
  fechaModal(); var ld=o.lead||null;
  MOD=A.modal({tema:'v4',z:9000,escolher:true,pagina:o.pagina||'calc-alavancagem',titulo:'Gerar link para um cliente',leads:leadsBusca(),
    lead:ld?{id:ld.uid,nome:ld.nome,etapa:etapa(ld),esp:espNome(ld.resp),tel:ld.tel||''}:null,
    onClose:function(){ MOD=null; },
    onVer:function(id){ fechaModal(); W.go('histferr',id?{lead:id}:{sub:'lnk'}); },
    onCriado:function(){ HF.t=0; setTimeout(function(){ carrega(true).then(function(){ if(vivo()) desenhaTudo(); else marcaCrm(); }); },1800); }});
  return MOD; }
W.AgionHFGerar=abreGerar;

/* ---------------------------------------------------------------- tutorial (motor do plat2-tour.js) */
function tour(){ try{ W.AgionTour2.start('t-histferr'); }catch(e){ toast('O tutorial ainda está carregando — tente de novo em instantes','play'); } }

/* ---------------------------------------------------------------- 2) card do CRM */
var ATV={};
function carregaAtv(ids,force){ var sb=SB(); if(!sb||!ids.length) return Promise.resolve(); var t=agora();
  var fz=ids.filter(function(id,i,a){ var x=ATV[id]; return a.indexOf(id)===i&&(force||!x||t-x.t>60000); }); if(!fz.length) return Promise.resolve();
  var ps=[]; for(var i=0;i<fz.length;i+=40){ (function(p){ ps.push(Promise.resolve(sb.from('lead_atividades').select('lead_id,quando,tipo,titulo,detalhe').in('lead_id',p).order('quando',{ascending:false}).limit(400)).then(function(r){ if(r.error) throw r.error;
      var by={}; (r.data||[]).forEach(function(x){ (by[x.lead_id]=by[x.lead_id]||[]).push(x); }); p.forEach(function(id){ ATV[id]={t:agora(),rows:by[id]||[]}; }); }).catch(function(e){ console.warn('[histferr] atividades',e); p.forEach(function(id){ ATV[id]=ATV[id]||{t:agora(),rows:[]}; }); })); })(fz.slice(i,i+40)); }
  return Promise.all(ps); }
function curto(r){ var d=r.detalhe||{}, f=FER[d.calculadora];
  if(r.tipo==='simulacao') return f?'Simulou '+f.em+' '+f.n:'Simulou numa calculadora';
  if(r.tipo==='abertura') return (f?'Abriu '+f.o+' '+f.n:r.titulo)+((+d.aberturas||0)>1?' ('+d.aberturas+'×)':'');
  if(r.tipo==='link') return f?'Link '+f.de+' '+f.n+' enviado':String(r.titulo||'');
  return String(r.titulo||''); }
function atHtml(d){ var a=ATV[d.uid]; if(!a||!a.rows.length) return '';
  return '<div class="hf-at"><div class="ti"><span>Atividades</span><button type="button" data-a="hfatv">ver tudo →</button></div>'+a.rows.slice(0,3).map(function(r){ var tp=TIPO[r.tipo]||TIPO.nota;
    return '<div class="hf-mini"><i style="color:'+tp[1]+'">'+tp[0]+'</i><span>'+esc(curto(r))+' <em>· '+esc(ha(ms(r.quando)))+'</em></span></div>'; }).join('')+'</div>'; }
function marcaCrm(){ $$('#view .deal').forEach(function(el){ var d=null; try{ d=W.leadById(el.dataset.id); }catch(e){} if(!d) return;
  var sw=el.querySelector('.hf-sw'); if(sw){ var s=selo(d.uid,1); if(sw.innerHTML!==s) sw.innerHTML=s; }
  var aw=el.querySelector('.hf-aw'); if(aw){ var a=atHtml(d); if(aw.innerHTML!==a) aw.innerHTML=a; } }); }
var tCrm=0;
function hfCrm(){ clearTimeout(tCrm); tCrm=setTimeout(function(){ if(W.cur!=='crm'&&W.cur!=='cliente') return;
  var ids=$$('#view .deal').map(function(el){ var d=null; try{ d=W.leadById(el.dataset.id); }catch(e){} return d&&d.uid; }).filter(Boolean);
  Promise.all([carrega(),carregaAtv(ids)]).then(marcaCrm); },220); }
function ganchoCrm(){
  if(typeof W.dealHTML!=='function'||W.dealHTML.__hf) return;
  var _dh=W.dealHTML; W.dealHTML=function(d,mini){ var h=_dh.apply(this,arguments); if(mini||!d||!d.uid) return h;
    try{ h=h.replace('<span class="sp"></span>','<span class="sp"></span><span class="hf-sw">'+selo(d.uid,1)+'</span>');
      var i=h.indexOf('<div class="ab">'); if(i<0) i=h.indexOf('<div class="gp'); if(i<0) i=h.indexOf('<div class="dft">');
      if(i>=0) h=h.slice(0,i)+'<div class="hf-aw">'+atHtml(d)+'</div>'+h.slice(i); }catch(e){} return h; };
  W.dealHTML.__hf=1;
  if(typeof W.renderBoard==='function'){ var _rb=W.renderBoard; W.renderBoard=function(){ var r=_rb.apply(this,arguments); hfCrm(); return r; }; }
  if(typeof W.crmFiltrados==='function'){ var _cf=W.crmFiltrados; W.crmFiltrados=function(){ var r=_cf.apply(this,arguments); if(HF.sim24) r=r.filter(function(l){ return simulou24(l.uid); }); return r; }; }
  if(typeof W.renderFiltros==='function'){ var _rf=W.renderFiltros; W.renderFiltros=function(){ var r=_rf.apply(this,arguments); try{ filtroSim(); }catch(e){} return r; }; }
  /* "ver tudo →" no bloco Atividades abre a ficha direto na aba Atividades */
  D.addEventListener('click',function(e){ var b=e.target&&e.target.closest&&e.target.closest('[data-a="hfatv"]'); if(!b) return; var c=b.closest('.deal'); if(!c) return;
    e.stopPropagation(); e.preventDefault(); var d=null; try{ d=W.leadById(c.dataset.id); }catch(_){} if(d){ try{ W.closeDrawer(); }catch(_){} $$('.dm').forEach(function(m){ m.remove(); }); try{ W.$('#ov').classList.remove('on'); }catch(_){} W.go('cliente',{lead:d,tab:'atv'}); } },true); }
function filtroSim(){ var fb=$('#fbar'); if(!fb||W.cur!=='crm') return; var b=$('#hfSimF',fb);
  if(!b){ b=D.createElement('button'); b.type='button'; b.id='hfSimF'; var lab=$('.search',fb); if(!mob()&&lab&&lab.nextSibling) fb.insertBefore(b,lab.nextSibling); else fb.appendChild(b); }
  b.className='hf-sf'+(HF.sim24?' on':''); b.innerHTML='🔥 Simularam nas últimas 24 h'; b.title='Só os leads que simularam numa calculadora nas últimas 24 horas';
  b.onclick=function(){ HF.sim24=!HF.sim24; var go2=function(){ W.renderFiltros(); W.renderBoard(); }; if(HF.sim24&&!HF.t) carrega().then(go2); go2(); if(HF.sim24) toast('Mostrando só quem simulou nas últimas 24 h','flame'); }; }

/* ---------------------------------------------------------------- 3) ficha: aba Atividades */
function leadDoCliente(c){ if(!c) return null; var L=W.LEADS||[], cid=c.raw&&c.raw.cadastroId;
  var x=cid?L.filter(function(l){ return l.raw&&l.raw.cadastroId===cid; })[0]:null; if(!x) x=L.filter(function(l){ return norma(l.nome)===norma(c.nome); })[0]; return x?x.uid:null; }
var AF={k:'tudo'};
function carregaUm(uid){ var sb=SB(); if(!sb) return Promise.resolve([]);
  return Promise.resolve(sb.from('lead_atividades').select('*').eq('lead_id',uid).order('quando',{ascending:false}).limit(200)).then(function(r){ if(r.error) throw r.error; return r.data||[]; }); }
var FL=[['tudo','Tudo'],['sim','Simulações'],['link','Links'],['email','E-mails'],['wa','WhatsApp'],['prop','Propostas'],['tar','Tarefas'],['eta','Etapas']];
var ETRX=/^(Movido para|Perdido|Reunião (marcada|desmarcada)|Compareceu|Recuperad|Ganho|Virou cliente)/i;
function casa(r,k){ var t=r.tipo; if(k==='tudo') return true; if(k==='sim') return t==='simulacao'; if(k==='link') return t==='link'||t==='abertura'; if(k==='prop') return t==='proposta'||t==='envio';
  if(k==='tar') return t==='tarefa'; if(k==='eta') return t==='etapa'||(t==='nota'&&ETRX.test(r.titulo||'')); if(k==='email') return t==='email'; if(k==='wa') return t==='whatsapp'; return false; }
function txtAtv(rows){ var A=W.AgCalcLink, por={}, out={};
  rows.forEach(function(r){ if(r.tipo==='simulacao'&&r.detalhe&&r.detalhe.token) (por[r.detalhe.token]=por[r.detalhe.token]||[]).push(r); });
  Object.keys(por).forEach(function(tk){ var g=por[tk].slice().sort(function(a,b){ return ms(a.quando)-ms(b.quando); });
    var df=A?A.difs(g.map(function(r){ return {ts:ms(r.quando)/1000,d:r.detalhe.dados||{}}; })):[]; g.forEach(function(r,i){ out[tk+'|'+r.quando]=df[i]; }); });
  return function(r){ var d=r.detalhe||{}, f=FER[d.calculadora], lk=d.token?linkDe(d.token):null, autor=espNome(r.autor_id);
    var tx=esc(r.titulo||''), og='CRM'+(autor?' · '+esc(autor):''), rs='';
    if(r.tipo==='simulacao'){ var x=out[d.token+'|'+r.quando]; tx=(f?'Simulou '+f.em+' '+esc(f.n):'Simulou numa calculadora')+(x&&x.ch.length?': '+x.ch.join(' · '):''); rs=x?x.rs.join(' · '):''; og='Link temporário'+(lk&&lk.porNome?' · '+esc(lk.porNome):''); }
    else if(r.tipo==='abertura'){ tx='Abriu o link '+(f?f.de+' '+esc(f.n):'da calculadora')+((+d.aberturas||0)>1?' ('+d.aberturas+' vezes no total)':' (1ª vez)'); og='Link temporário'+(lk&&lk.porNome?' · aviso para '+esc(prim(lk.porNome)):''); }
    else if(r.tipo==='link'){ tx=(autor?esc(prim(autor)):'A equipe')+' gerou um link '+(f?f.de+' '+esc(f.n):'de calculadora')+(d.expira_em?' (válido até '+esc(new Date(d.expira_em).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}))+' às '+hm(ms(d.expira_em))+')':''); og='Ferramentas'; }
    else if(r.tipo==='tarefa'){ tx=esc(r.titulo||'Tarefa')+(d.resultado?': “'+esc(d.resultado)+'”':d.anotacao?': “'+esc(d.anotacao)+'”':''); og='Tarefa'+(autor?' · '+esc(autor):''); }
    else if(r.tipo==='proposta'||r.tipo==='envio'){ og='Propostas'+(autor?' · '+esc(autor):''); }
    else if(r.tipo==='etapa'){ og='CRM'; }
    return {tx:tx,og:og,rs:rs}; }; }
function pintaAtv(v,uid){ var tc=$('#tabc',v); if(!tc) return; css();
  var cab='<div class="hf-atv"><div class="ph"><h3>'+Ic('zap',18)+'Atividades</h3><small>tudo o que aconteceu com o cliente, em ordem, de todas as fontes</small></div>';
  if(!uid){ tc.innerHTML=cab+'<div class="empty">Este cliente não tem um card no CRM ligado a ele, então ainda não há atividades.</div></div>'; tc.style.opacity=1; tc.style.transform='none'; return; }
  if(!tc.querySelector('.hf-atv')) tc.innerHTML=cab+'<div class="hf-vz">Carregando as atividades…</div></div>'; tc.style.opacity=1; tc.style.transform='none';
  Promise.all([carregaUm(uid).catch(function(e){ console.warn('[histferr] ficha',e); return null; }),carrega()]).then(function(r){ var rows=r[0];
    var on=$('#ctab button.on',v); if(!tc.isConnected||!on||on.dataset.k!=='atv') return;
    if(rows===null){ tc.innerHTML=cab+'<div class="empty">Não consegui carregar as atividades agora.</div></div>'; return; }
    var tf=txtAtv(rows), fls=FL.filter(function(f){ return (f[0]!=='email'&&f[0]!=='wa')||rows.some(function(x){ return casa(x,f[0]); }); });
    if(!fls.some(function(f){ return f[0]===AF.k; })) AF.k='tudo';
    var R=rows.filter(function(x){ return casa(x,AF.k); }), G=[], gi={};
    R.forEach(function(x){ var d=dia(ms(x.quando)); if(gi[d]==null){ gi[d]=G.length; G.push([d,[]]); } G[gi[d]][1].push(x); });
    tc.innerHTML=cab+'<div class="hf-flt" id="hfAf">'+fls.map(function(f){ var n=rows.filter(function(x){ return casa(x,f[0]); }).length; return '<button type="button" data-f="'+f[0]+'" class="'+(f[0]===AF.k?'on':'')+'">'+f[1]+(f[0]!=='tudo'&&n?'<span class="n">'+n+'</span>':'')+'</button>'; }).join('')+'</div>'+
     '<div class="hf-tl">'+(R.length?G.map(function(g){ return '<h4>'+g[0]+'</h4>'+g[1].map(function(x){ var tp=TIPO[x.tipo]||TIPO.nota, t=tf(x);
       return '<div class="hf-ev"><div class="hr">'+hm(ms(x.quando))+'</div><div class="ic" style="background:'+tp[1]+'">'+tp[0]+'</div><div class="tx">'+t.tx+(t.rs?'<span class="rs">'+t.rs+'</span>':'')+'<small>'+t.og+'</small></div></div>'; }).join(''); }).join(''):'<div class="empty" style="padding:22px">'+(rows.length?'Nada deste tipo ainda.':'Ainda não há atividades registradas para este cliente.')+'</div>')+'</div></div>';
    $$('#hfAf button',tc).forEach(function(b){ b.onclick=function(){ AF.k=b.dataset.f; pintaAtv(v,uid); }; }); }); }
function ganchoFicha(){ if(!W.R||typeof W.R.cliente!=='function'||W.R.cliente.__hf) return; var _rc=W.R.cliente;
  W.R.cliente=function(v,arg){ var r=_rc.apply(this,arguments); try{ fichaAtv(v,arg||{}); }catch(e){ console.warn('[histferr] ficha',e); } return r; }; W.R.cliente.__hf=1; }
function fichaAtv(v,arg){ var lead=arg.lead||null, c=lead?null:((W.CLIENTES||[]).filter(function(x){ return x.id===arg.id; })[0]||null); if(!lead&&!c) return;
  var uid=lead?lead.uid:leadDoCliente(c), seg=$('#ctab',v); if(!seg||$('button[data-k="atv"]',seg)) return; css(); AF.k='tudo';
  var b=D.createElement('button'); b.type='button'; b.dataset.k='atv'; b.innerHTML=Ic('zap',15)+' Atividades';
  seg.insertBefore(b,$('button[data-k="hist"]',seg)||null);
  var liga=function(rola){ $$('button',seg).forEach(function(x){ x.classList.toggle('on',x===b); }); try{ W.slide(seg); }catch(e){} try{ seg.scrollTo({left:Math.max(0,b.offsetLeft-seg.clientWidth/2+b.offsetWidth/2),behavior:'smooth'}); }catch(e){} pintaAtv(v,uid);
    if(rola&&mob()) setTimeout(function(){ var tc=$('#tabc',v),m=$('#main'); if(tc&&m&&tc.isConnected) m.scrollTo({top:Math.max(0,tc.getBoundingClientRect().top+m.scrollTop-150),behavior:reduzido()?'auto':'smooth'}); },450); };
  b.onclick=function(){ liga(); var m=$('#main'); if(m&&m.scrollTop>300) m.scrollTo({top:250,behavior:'smooth'}); };
  if(arg.tab==='atv') setTimeout(function(){ liga(!arg.tour); },0); else setTimeout(function(){ try{ W.slide(seg); }catch(e){} },30);
  var tc=$('#tabc',v); if(tc&&W.MutationObserver){ var mo=new MutationObserver(function(){ if(!tc.isConnected){ mo.disconnect(); return; } var on=$('#ctab button.on',v); if(on&&on.dataset.k==='atv'&&!tc.querySelector('.hf-atv')) pintaAtv(v,uid); }); mo.observe(tc,{childList:true}); }
  if(uid) carrega().then(function(){ var h1=$('.hx .h1',v), s=selo(uid); if(h1&&h1.isConnected&&s&&!$('.hf-fsel',h1)) h1.insertAdjacentHTML('beforeend',' <span class="hf-fsel">'+s+'</span>'); if(lead) hfCrm(); }); }

/* ---------------------------------------------------------------- tutorial t-histferr (23 passos, 4 abas) */
function vis(el){ if(!el||!el.isConnected) return false; var r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false; var cs=getComputedStyle(el); return cs.visibility!=='hidden'&&cs.display!=='none'; }
function q(sel){ return function(){ return $$(sel).filter(vis)[0]||null; }; }
function noHF(){ if(W.cur!=='histferr') W.go('histferr'); }
function subHF(k){ return function(){ fechaModal(); if(W.cur!=='histferr'){ HF.sub=k; HF.mdet=false; W.go('histferr'); return; } var b=$('#hfsn button[data-k="'+k+'"]'); if(b&&!b.classList.contains('on')) b.click(); }; }
function mostraDet(){ if(!mob()) return; var pc=$('.hf-pc2'); if(pc&&!pc.classList.contains('det')){ var it=$('#hfCl .hf-ci'); if(it) it.click(); } }
function dealSelo(){ var s=$$('#kb .deal .hf-selo').filter(vis)[0]; if(s) return s.closest('.deal'); return $$('#kb .deal').filter(vis)[0]||null; }
function atBloco(){ var a=$$('#kb .deal .hf-at').filter(vis); var c=dealSelo(); var x=c?$('.hf-at',c):null; return (x&&vis(x))?x:(a[0]||null); }
function alinhaKb(){ if(!mob()) return; var kb=$('#kb'), s=$('#kb .deal .hf-selo'), c=s?s.closest('.col'):null; if(kb&&c) try{ kb.scrollTo({left:Math.max(0,c.offsetLeft-12),behavior:'auto'}); }catch(e){ kb.scrollLeft=c.offsetLeft-12; } }
function paraCrm(){ fechaModal(); try{ if(W.F&&W.F.modo!=='quadro') W.F.modo='quadro'; }catch(e){} if(W.cur!=='crm') W.go('crm'); [700,1500,2400].forEach(function(t){ setTimeout(alinhaKb,t); }); }
function abreFicha(){ fechaModal(); if(W.cur==='cliente'&&W.curArg&&W.curArg.tab==='atv') return; var L=(W.LEADS||[]).filter(function(l){ return !l.perdido; }), alvo=null;
  for(var i=0;i<HF.links.length&&!alvo;i++){ var d=leadDe(HF.links[i].lead); if(d&&!d.perdido) alvo=d; }
  if(!alvo){ try{ alvo=W.mine(L)[0]||L[0]; }catch(e){ alvo=L[0]; } }
  if(alvo) W.go('cliente',{lead:alvo,tab:'atv',tour:1}); }
var TOUR={id:'t-histferr',page:'histferr',navk:'ferramentas',pages:['histferr','crm','ficha-lead','ficha-cliente'],v:1,g:'Ferramentas',title:'Histórico de ferramentas',inv:'Como usar o Histórico de ferramentas',
 desc:'Todos os links das calculadoras num lugar só: quem recebeu, quem abriu e o que cada cliente simulou.',
 abas:['Histórico de ferramentas','Card do CRM','Cadastro do cliente','Dentro das ferramentas'],
 post:function(){ fechaModal(); },
 steps:[
  {act:subHF('ger'),t:null,title:'Tudo o que o cliente faz nas calculadoras',text:'Quando você manda um link temporário de uma calculadora, o sistema guarda quando o cliente abriu e cada simulação em que ele parou para pensar. Este tutorial mostra onde isso aparece, em 4 abas.'},
  {t:null,title:'As 4 abas',text:'1. Histórico de ferramentas: a ferramenta nova, com tudo num lugar só. 2. Card do CRM: o resumo no card. 3. Cadastro do cliente: a linha do tempo completa. 4. Dentro das ferramentas: onde o link é gerado.'},
  {a:0,act:subHF('ger'),t:q('#hfGer'),title:'Gerar o link já ligado ao cliente',text:'Escolha o cliente pela busca do CRM, a calculadora e a validade (1 h, 2 h, 1 dia ou 2 dias). O link fica amarrado ao card, então tudo o que ele fizer cai no cliente certo.'},
  {a:0,t:q('#hfsn'),title:'Três visões',text:'Visão gerencial (só o Master; o especialista vê "Meu painel", só com os clientes dele), Por cliente e Todos os links.'},
  {a:0,t:q('#hfKp'),title:'Os números do período',text:'Quantos links foram enviados, quantos foram abertos, quantos clientes simularam, o total de simulações e o tempo médio entre o envio e a primeira abertura.'},
  {a:0,t:q('#hfQ'),title:'Clientes quentes agora',text:'Quem abriu ou simulou nas últimas 24 horas, com o que está cogitando. É a lista de quem ligar primeiro: o botão Ligar abre o WhatsApp do cliente.'},
  {a:0,t:q('#hfF'),title:'Do link ao fechamento',text:'O caminho completo: link enviado, abriu, simulou, reunião e fechou. Mostra onde os clientes param e quanto a simulação ajuda a marcar reunião.'},
  {a:0,t:q('#hfEsp'),roles:['master'],optional:true,title:'Por especialista (Master)',text:'Compara a equipe: quantos links cada um enviou, quantos foram abertos e quantos clientes simularam. Só aparece na visão do Master.'},
  {a:0,t:q('#hfA'),title:'Precisam de atenção',text:'Links que vão vencer sem o cliente abrir, links que já venceram e clientes que simularam mas ainda não têm reunião. Cada item tem a ação certa ao lado.'},
  {a:0,act:subHF('cli'),t:q('#hfCl'),title:'Por cliente',text:'Cada cliente com as ferramentas que recebeu e quantas simulações fez, do mais recente para o mais antigo. Clique em um para ver o detalhe.'},
  {a:0,act:mostraDet,t:q('#hfDet .hf-cog'),optional:true,title:'O que ele está cogitando',text:'Um resumo das faixas que o cliente testou (valor da carta, lance, número de cartas). É o assunto da sua próxima conversa com ele.'},
  {a:0,t:q('#hfDet .hf-tl'),optional:true,title:'Cada simulação, com a hora',text:'A linha do tempo mostra cada tela em que o cliente parou 3 segundos ou mais, em qual ferramenta e com quais números.'},
  {a:0,act:subHF('lnk'),t:q('#hfT'),title:'Todos os links',text:'A lista completa: cliente, ferramenta, especialista, quando foi gerado, quanto tempo falta para vencer, aberturas, simulações e a etapa do cliente no CRM.'},
  {a:1,act:paraCrm,t:dealSelo,wait:4500,optional:true,title:'O card mostra o que está acontecendo',text:'No topo do card aparece "simulando agora", "abriu o link há 2 h" ou "link sem abrir". Você sabe de quem cuidar sem abrir nada.'},
  {a:1,t:atBloco,optional:true,title:'Atividades no card',text:'As 3 últimas coisas que aconteceram com o cliente: simulação, abertura do link, e-mail recebido. "Ver tudo" abre o cadastro direto na aba Atividades.'},
  {a:1,act:paraCrm,t:q('#hfSimF'),optional:true,title:'Filtro no CRM',text:'No filtro do CRM entra a opção "Simularam nas últimas 24 h", para montar a lista de ligações do dia.'},
  {a:2,act:abreFicha,t:q('#ctab'),wait:4500,optional:true,title:'Aba Atividades no cadastro',text:'O cadastro do cliente ganha a aba Atividades, ao lado de Dados, Conversa, Propostas e Cartas.'},
  {a:2,t:q('#hfAf'),wait:4000,optional:true,title:'Filtrar por tipo',text:'Veja tudo ou só simulações, links, e-mails, WhatsApp, propostas, tarefas ou mudanças de etapa.'},
  {a:2,t:q('.hf-atv .hf-tl'),optional:true,title:'A história inteira do cliente',text:'Tudo em ordem, de todas as fontes: o que ele simulou, quando abriu o link, o que a Alice falou, os e-mails, as propostas, as tarefas e as mudanças de etapa.'},
  {a:3,act:function(){ fechaModal(); noHF(); },t:null,title:'Antes: um histórico em cada ferramenta',text:'Hoje cada calculadora tem a própria lista de links e o botão "Histórico do cliente". Para saber o que um cliente fez, era preciso abrir ferramenta por ferramenta.'},
  {a:3,act:function(){ noHF(); setTimeout(function(){ if(!$('.agl-bg')) abreGerar({tour:true}); },W.cur==='histferr'?0:500); },t:q('.agl-bg .agl-box'),wait:4000,title:'Agora: a ferramenta só gera o link',text:'Dentro da calculadora fica só o "gerar link", com o cliente escolhido pela busca do CRM. Copie, mande no WhatsApp ou siga para o Histórico de ferramentas.'},
  {a:3,act:function(){ if(!$('.agl-bg')) abreGerar({tour:true}); },t:q('.agl-bg .agl-ver'),title:'Atalho para o histórico',text:'Este botão leva direto ao cliente no Histórico de ferramentas.'},
  {act:function(){ fechaModal(); if(W.cur!=='histferr'){ HF.sub='ger'; W.go('histferr'); } },t:q('#hfHow'),title:'Pronto',text:'Quando o cliente abrir ou simular, o especialista recebe um aviso no celular. Para rever este guia, use o botão "Como usar esta ferramenta" ou a Central de Tutoriais.'}
 ]};
function registraTour(){ var T2=W.AgionTour2; if(!T2||!T2.config) return false; if(!T2.config.some(function(t){ return t.id===TOUR.id; })) T2.config.push(TOUR); return true; }

/* ---------------------------------------------------------------- registro: rota, card em Ferramentas, link do aviso */
function registra(){
  if(typeof W.go!=='function'||!W.R||typeof W.sn!=='function') return false;
  css();
  W.R.histferr=rota;
  try{ W.PARENT.histferr='ferramentas'; }catch(e){}
  try{ W.V4OK.histferr=1; }catch(e){}
  try{ if(!W.TOOLS.some(function(t){ return t.k==='hist'; })){ var i=-1; W.TOOLS.forEach(function(t,j){ if(t.k==='prop') i=j; });
    W.TOOLS.splice(i>=0?i+1:W.TOOLS.length,0,{k:'hist',t:'Histórico de ferramentas',d:'Todos os links das calculadoras num lugar só: quem recebeu, quem abriu e o que cada cliente simulou.',tag:'Equipe',ic:'act',bg:'linear-gradient(140deg,#2A5F6E,#0B2A26)',
     svg:'<path d="M20 132 C90 124 120 84 190 96 S300 60 372 56" stroke="#E8CC8B" stroke-width="3" fill="none"/><g fill="#E8CC8B"><circle cx="190" cy="96" r="6"/><circle cx="290" cy="70" r="6"/><circle cx="372" cy="56" r="7"/></g><g fill="#9CCBE6" opacity=".9"><circle cx="90" cy="122" r="5"/></g>',tut:23}); } }catch(e){}
  if(typeof W.R.ferramentas==='function'&&!W.R.ferramentas.__hf){ var _rf=W.R.ferramentas; W.R.ferramentas=function(v){ var r=_rf.apply(this,arguments);
    try{ var c=$('.tc[data-k="hist"]',v); if(c) c.onclick=function(e){ if(e.target.closest('[data-tut]')){ W.go('histferr'); setTimeout(tour,900); return; } W.go('histferr'); };
      var o=$('.tc[data-k="hist"] .open',v); if(o) o.innerHTML='Abrir '+Ic('arrow',15); }catch(e){} return r; }; W.R.ferramentas.__hf=1; }
  ganchoCrm(); ganchoFicha(); registraTour();
  return true; }
/* /plataforma#historico-ferramentas[?lead=id] — toque no aviso do celular e atalho das calculadoras */
function rotaHash(h){ var m=/^#historico-ferramentas(?:[?&](.*))?$/.exec(String(h||'')); if(!m) return null; var p={}; try{ new URLSearchParams(m[1]||'').forEach(function(v,k){ p[k]=v; }); }catch(e){} return {lead:p.lead||null}; }
function abreDoHash(a){ var n=0, iv=setInterval(function(){ n++; try{ if(W.cur&&$('#view')&&W.CARREGOU!==false){ clearInterval(iv); W.go('histferr',a.lead?{lead:a.lead}:{sub:'ger'}); } }catch(e){} if(n>80) clearInterval(iv); },250); }
function hashInicial(){ var P=W.parent!==W?W.parent:null, h='';
  try{ h=String(P&&P.__agHash!=null?P.__agHash:(P?P.location.hash:'')); }catch(e){}
  if(!rotaHash(h)){ try{ h=P?P.location.hash:''; }catch(e){} }
  var a=rotaHash(h); if(!a) return;
  try{ P.__agHash=''; }catch(e){}
  abreDoHash(a); }
function ouveHash(){ var P=W.parent!==W?W.parent:null; if(!P) return; try{ P.addEventListener('hashchange',function(){ var a=null; try{ a=rotaHash(P.location.hash); }catch(e){} if(a){ try{ P.AgionV4Ponte&&P.AgionV4Ponte.voltarV4&&P.AgionV4Ponte.voltarV4(); }catch(e){} abreDoHash(a); } }); }catch(e){} }

function boot(){ if(!registra()) return setTimeout(boot,120); hashInicial(); ouveHash(); }
boot();
W.AgionHistFerr={recarregar:function(){ HF.t=0; return carrega(true); },abrir:function(lead){ W.go('histferr',lead?{lead:lead}:null); },gerar:abreGerar,tour:TOUR};
})();
