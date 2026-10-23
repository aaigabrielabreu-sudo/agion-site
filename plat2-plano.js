/* ==========================================================================
   Agion — plat2-plano.js · PLANO_V4_23OUT
   Planejamento financeiro no visual novo: o que o cliente vê (Início,
   Planejamento, Jornada, Gastos, Minha cota) e o "Ver como o cliente vê".
   As contas continuam as da plataforma (projetar, diagnostico, ALOC…), lidas
   pela ponte; aqui é só a tela. Roda dentro do /plat2-v4.html.
   ========================================================================== */
(function(){
'use strict';
function ev(n){ try{ return px().ev(n); }catch(e){ return null; } }
function base(){ try{ return px().db()||{}; }catch(e){ return {}; } }
function cliente(cid){ return (base().clients||[]).filter(function(c){ return c.id===cid; })[0]||null; }
function principal(c){ var f=ev('mainPlan'); try{ if(f) return f(c); }catch(e){} var ps=(c&&c.plans)||[]; return ps.filter(function(p){ return p.main; })[0]||ps[0]||null; }
function projeta(p){ var f=ev('projetar'); try{ return f?f(p):null; }catch(e){ console.warn('[plano] projetar',e); return null; } }
function clone(p){ var f=ev('planClone'); try{ return f?f(p):JSON.parse(JSON.stringify(p)); }catch(e){ return JSON.parse(JSON.stringify(p)); } }
function e4(s){ return esc4(s); }
function cor(prob){ return prob>=80?'var(--ok)':prob>=55?'#C99A2E':'var(--bad)'; }
function corSaque(t){ return t<=4.5?'var(--ok)':t<=6.5?'#C99A2E':'var(--bad)'; }
function pct(a,b){ return b?Math.max(0,Math.min(100,Math.round(a/b*100))):100; }
function nome1(n){ return String(n||'').trim().split(' ')[0]||'cliente'; }

/* ---------------- estilos do módulo ---------------- */
(function(){ if(document.getElementById('plcss')) return; var s=document.createElement('style'); s.id='plcss'; s.textContent=
 '.plhero{border-radius:26px;padding:22px 24px;margin-bottom:18px;background:linear-gradient(135deg,#0E3A33,#0B2A26 60%,#123F37);color:#F3EEE2;display:flex;gap:18px;align-items:center;flex-wrap:wrap;box-shadow:var(--shadow2);position:relative;overflow:hidden}'+
 '.plhero:after{content:"";position:absolute;right:-60px;top:-60px;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(232,204,139,.22),transparent 70%)}'+
 '.plhero p{flex:1;min-width:240px;font-size:14.5px;line-height:1.6;color:#D4DED9;position:relative;z-index:1}.plhero p b{color:#F1DEA9}.plhero .btn{position:relative;z-index:1}'+
 '.plk{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px}.plk>div{background:var(--card);border-radius:22px;padding:16px 18px;box-shadow:var(--shadow)}'+
 '.plk small{display:block;font:700 10.5px "DM Sans";letter-spacing:.14em;text-transform:uppercase;color:var(--mut);margin-bottom:6px}.plk b{font:700 21px "DM Sans";letter-spacing:-.01em}.plk em{font-style:normal;font-size:12.5px;color:var(--mut);font-weight:600;margin-left:4px}'+
 '.plk>div.g{background:linear-gradient(160deg,color-mix(in srgb,var(--gold3) 60%,var(--card)),var(--card) 70%)}.dark .plk>div.g{background:linear-gradient(160deg,rgba(232,204,139,.14),var(--card) 70%)}'+
 '.plgauge{display:flex;flex-direction:column;align-items:center;text-align:center}.plgauge svg{width:230px;max-width:100%;height:auto}.plgauge .v{font:700 34px "DM Sans";margin-top:-58px}.plgauge .t{font-size:12.5px;color:var(--mut);margin-top:22px;line-height:1.5;max-width:320px}'+
 '.plchart{position:relative}.plchart svg{width:100%;height:auto;display:block;overflow:visible}.plchart .tip{position:absolute;pointer-events:none;background:var(--ink);color:var(--bg);border-radius:12px;padding:8px 10px;font-size:11.5px;line-height:1.5;opacity:0;transition:opacity .15s;white-space:nowrap;z-index:2}.plchart .tip b{color:var(--gold2)}'+
 '.plleg{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:var(--mut);margin-bottom:8px}.plleg i{display:inline-block;width:14px;height:3px;border-radius:2px;margin-right:6px;vertical-align:middle}'+
 '.plbar{height:9px;border-radius:999px;background:var(--bg2);overflow:hidden}.plbar i{display:block;height:100%;border-radius:999px;background:var(--gg);transform-origin:left;transform:scaleX(0);transition:transform 1.1s var(--ez)}'+
 '.plrow{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--line);font-size:13.2px}.plrow:last-child{border-bottom:0}.plrow span{color:var(--ink2)}.plrow b{text-align:right}'+
 '.pldiag{display:flex;gap:11px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--line);font-size:13.2px;line-height:1.55}.pldiag:last-child{border-bottom:0}.pldiag i{flex:none;width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font:800 12px "DM Sans";font-style:normal}'+
 '.plops{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}.plop{border-radius:22px;padding:18px;background:var(--bg);position:relative;transition:transform .4s var(--ez)}.plop:hover{transform:translateY(-3px)}.plop .tag{display:inline-block;font:700 10.5px "DM Sans";letter-spacing:.12em;text-transform:uppercase;color:var(--goldd);margin-bottom:6px}.plop h4{font:600 15px "DM Sans";margin-bottom:6px}.plop p{font-size:12.8px;color:var(--ink2);line-height:1.55;margin-bottom:12px}'+
 '.pldon{display:flex;gap:16px;align-items:center;flex-wrap:wrap;justify-content:center}.pldon figure{text-align:center}.pldon figcaption{font:700 10.5px "DM Sans";letter-spacing:.14em;text-transform:uppercase;color:var(--mut);margin-top:6px}'+
 '.pltab{width:100%;border-collapse:collapse;font-size:12.8px}.pltab th{text-align:left;font:700 10.5px "DM Sans";letter-spacing:.12em;text-transform:uppercase;color:var(--mut);padding:8px 6px;border-bottom:1px solid var(--line)}.pltab td{padding:9px 6px;border-bottom:1px solid var(--line)}.pltab .r{text-align:right}.pltab tr:last-child td{border-bottom:0}.plscroll{max-height:340px;overflow:auto}'+
 '.plflow{display:flex;gap:18px;align-items:flex-end;height:190px;padding:0 6px}.plflow div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:6px}.plflow i{display:block;width:100%;max-width:74px;border-radius:14px 14px 6px 6px;transform-origin:bottom;transform:scaleY(0);transition:transform 1s var(--ez)}.plflow b{font-size:12.5px}.plflow small{font-size:11.5px;color:var(--mut)}'+
 '.plroad{display:flex;align-items:stretch;gap:0;overflow-x:auto;padding:6px 2px 14px}.plroad .st{flex:1;min-width:130px;position:relative;padding:16px 14px;border-radius:20px;background:var(--bg);margin-right:22px}.plroad .st:last-child{margin-right:0}.plroad .st:after{content:"";position:absolute;right:-17px;top:50%;width:12px;height:12px;border-top:2px solid var(--gold);border-right:2px solid var(--gold);transform:translateY(-50%) rotate(45deg)}.plroad .st:last-child:after{display:none}'+
 '.plroad .st b{display:block;font:600 14px "DM Sans"}.plroad .st span{font-size:12px;color:var(--mut)}.plroad .st.on{background:var(--ink);color:var(--gold2)}.plroad .st.on span{color:var(--sbtx)}.plroad .n{font:700 10.5px "DM Sans";letter-spacing:.14em;color:var(--goldd);display:block;margin-bottom:4px}'+
 '.plgoal{display:grid;grid-template-columns:44px 1fr;gap:14px;margin-bottom:16px}.plgoal .dot{width:44px;height:44px;border-radius:50%;background:var(--gg);color:#0B2A26;display:grid;place-items:center;font:800 15px "DM Sans";box-shadow:var(--shadow)}.plgoal .bx{background:var(--bg);border-radius:20px;padding:16px 18px}'+
 '.plgoal h4{font:600 15px "DM Sans"}.plgoal .w{font-size:12px;color:var(--mut);margin-top:2px}.plgoal ol{margin:12px 0 0 0;padding:0;list-style:none;counter-reset:ps}.plgoal li{counter-increment:ps;display:flex;gap:10px;font-size:13px;line-height:1.5;padding:6px 0;border-top:1px dashed var(--line)}.plgoal li:before{content:counter(ps);flex:none;width:20px;height:20px;border-radius:50%;background:var(--card);display:grid;place-items:center;font:700 11px "DM Sans";color:var(--goldd)}'+
 '.plcat{display:grid;grid-template-columns:38px 1fr auto;gap:12px;align-items:center;padding:9px 0;border-bottom:1px solid var(--line)}.plcat:last-child{border-bottom:0}.plcat .ci{width:38px;height:38px;border-radius:12px;display:grid;place-items:center}.plcat .cn{font-size:13.2px;font-weight:600}.plcat .cv{text-align:right;font-size:13px}.plcat .cv small{display:block;color:var(--mut);font-size:11.5px}'+
 '.pllanc .ci{width:38px;height:38px;border-radius:12px;display:grid;place-items:center}.pllanc{display:grid;grid-template-columns:38px 1fr auto 26px;gap:12px;align-items:center;padding:9px 0;border-bottom:1px solid var(--line)}.pllanc:last-child{border-bottom:0}.pllanc .ld{font-size:13.2px;font-weight:600}.pllanc .ls{font-size:11.5px;color:var(--mut)}.pllanc .lx{color:var(--mut);opacity:.6}.pllanc .lx:hover{opacity:1;color:var(--bad)}'+
 '.plsum{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:18px}.plsum>div{background:var(--card);border-radius:22px;padding:16px 18px;box-shadow:var(--shadow)}.plsum small{display:block;font:700 10.5px "DM Sans";letter-spacing:.14em;text-transform:uppercase;color:var(--mut);margin-bottom:6px}.plsum b{font:700 22px "DM Sans"}'+
 '.plcota{border-radius:26px;padding:22px 24px;background:linear-gradient(140deg,#0E3A33,#0B2A26);color:#F3EEE2;margin-bottom:18px;box-shadow:var(--shadow2)}.plcota h3{font:600 17px Lora,serif;color:#F1DEA9;margin-bottom:14px}.plcota .k{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.plcota .k small{display:block;font:700 10px "DM Sans";letter-spacing:.14em;text-transform:uppercase;color:#8FA8A0;margin-bottom:4px}.plcota .k b{font:700 18px "DM Sans"}'+
 '.plcota .pb{height:10px;border-radius:999px;background:rgba(255,255,255,.1);overflow:hidden;margin:16px 0 6px}.plcota .pb i{display:block;height:100%;background:var(--gg);transform-origin:left;transform:scaleX(0);transition:transform 1.2s var(--ez)}.plcota .nt{font-size:12px;color:#A9BFB8}'+
 '.plsl{display:block;margin-bottom:14px;font-size:13px}.plsl b{float:right;color:var(--goldd)}.plsl input{width:100%;margin-top:8px;accent-color:#C5A059}'+
 '.plgl dt{font-weight:700;font-size:13.5px;margin-top:12px}.plgl dd{font-size:13px;color:var(--ink2);line-height:1.55;margin:3px 0 0}'+
 '.plplans{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}.plplans button{padding:8px 14px;border-radius:999px;font:700 12px "DM Sans";background:var(--bg);color:var(--ink2)}.plplans button.on{background:var(--ink);color:var(--gold2)}'+
 '.pldisc{font-size:11.5px;color:var(--mut);margin-top:18px;line-height:1.5}'+
 '@media (max-width:900px){.plk,.plcota .k{grid-template-columns:1fr 1fr}.plsum{grid-template-columns:1fr 1fr 1fr}.plsum b{font-size:17px}.plroad .st{min-width:150px}}'+
 '@media (max-width:560px){.plsum{grid-template-columns:1fr}.plk b{font-size:18px}}';
 document.head.appendChild(s); })();

/* ---------------- gráficos (SVG, no visual novo) ---------------- */
function gauge(prob){ var r=90,c=Math.PI*r,l=c*Math.max(0,Math.min(100,prob))/100,co=cor(prob);
 return '<svg viewBox="0 0 220 130"><path d="M20 115 A90 90 0 0 1 200 115" fill="none" stroke="var(--bg2)" stroke-width="16" stroke-linecap="round"/>'+
  '<path class="plga" d="M20 115 A90 90 0 0 1 200 115" fill="none" stroke="'+co+'" stroke-width="16" stroke-linecap="round" stroke-dasharray="0 '+c+'" data-l="'+l+'" data-c="'+c+'"/></svg>'+
  '<div class="v" style="color:'+co+'">'+prob+'%</div>'; }
function animaGauge(root){ (root.querySelectorAll('.plga')||[]).forEach(function(p){ p.style.transition='stroke-dasharray 1.3s cubic-bezier(.22,1,.36,1)'; setTimeout(function(){ p.setAttribute('stroke-dasharray',p.dataset.l+' '+p.dataset.c); },120); }); }
function eixoV(v){ var a=Math.abs(v); return a>=1e6?(v/1e6).toLocaleString('pt-BR',{maximumFractionDigits:1})+' mi':a>=1e3?Math.round(v/1e3)+' mil':Math.round(v); }
function projChart(R,p,metas){
 var W=680,H=250,L=56,Rr=10,T=12,B=26,n=(R.idades||[]).length; if(!n) return '<div class="empty">Sem projeção.</div>';
 var S=[R.seriePess||[],R.serie||[],R.serieOtim||[]], mx=0; S.forEach(function(s){ s.forEach(function(v){ if(+v>mx) mx=+v; }); }); if(mx<=0) mx=1;
 var x=function(i){ return L+(W-L-Rr)*(n<2?0:i/(n-1)); }, y=function(v){ return T+(H-T-B)*(1-Math.max(0,+v||0)/mx); };
 var path=function(s){ return s.map(function(v,i){ return (i?'L':'M')+x(i).toFixed(1)+' '+y(v).toFixed(1); }).join(' '); };
 var area=path(S[1])+' L'+x(n-1).toFixed(1)+' '+(H-B)+' L'+x(0).toFixed(1)+' '+(H-B)+' Z';
 var gy=''; for(var k=0;k<=4;k++){ var vv=mx*k/4, yy=y(vv); gy+='<line x1="'+L+'" x2="'+(W-Rr)+'" y1="'+yy+'" y2="'+yy+'" stroke="var(--line)" stroke-width="1"/><text x="'+(L-8)+'" y="'+(yy+4)+'" text-anchor="end" font-size="10.5" fill="var(--mut)">'+eixoV(vv)+'</text>'; }
 var gx='', passo=Math.max(1,Math.round(n/7)); for(var i=0;i<n;i+=passo){ gx+='<text x="'+x(i)+'" y="'+(H-6)+'" text-anchor="middle" font-size="10.5" fill="var(--mut)">'+R.idades[i]+'</text>'; }
 var ia=R.idades.indexOf(+p.apos), ap=ia>=0?'<line x1="'+x(ia)+'" x2="'+x(ia)+'" y1="'+T+'" y2="'+(H-B)+'" stroke="var(--gold)" stroke-dasharray="4 4" stroke-width="1.4"/><text x="'+(x(ia)+6)+'" y="'+(T+12)+'" font-size="10.5" fill="var(--goldd)" font-weight="700">aposentadoria · '+p.apos+'</text>':'';
 var mk=(metas||[]).map(function(g){ var j=R.idades.indexOf(+g.idade); return j<0?'':'<circle cx="'+x(j)+'" cy="'+y(S[1][j])+'" r="5.5" fill="#E8CC8B" stroke="var(--card)" stroke-width="2"><title>'+e4(g.desc||'Objetivo')+' · aos '+g.idade+'</title></circle>'; }).join('');
 var id='pg'+Math.random().toString(36).slice(2,7);
 return '<div class="plchart" data-n="'+n+'"><div class="plleg"><span><i style="background:#C5A059"></i>Cenário atual</span><span><i style="background:#3F8F6A"></i>Otimista</span><span><i style="background:#C2463B"></i>Pessimista</span><span><i style="background:#E8CC8B;height:8px;width:8px;border-radius:50%"></i>Objetivos</span></div>'+
  '<svg viewBox="0 0 '+W+' '+H+'"><defs><linearGradient id="'+id+'" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#C5A059" stop-opacity=".28"/><stop offset="1" stop-color="#C5A059" stop-opacity="0"/></linearGradient></defs>'+gy+gx+
  '<path d="'+area+'" fill="url(#'+id+')" class="plar" style="opacity:0;transition:opacity 1.2s .4s"/>'+
  '<path d="'+path(S[0])+'" fill="none" stroke="#C2463B" stroke-width="1.8" stroke-dasharray="5 5" class="plln"/>'+
  '<path d="'+path(S[2])+'" fill="none" stroke="#3F8F6A" stroke-width="1.8" stroke-dasharray="5 5" class="plln"/>'+
  '<path d="'+path(S[1])+'" fill="none" stroke="#C5A059" stroke-width="2.8" stroke-linejoin="round" class="plln pmain"/>'+ap+mk+
  '<line class="plcur" x1="0" x2="0" y1="'+T+'" y2="'+(H-B)+'" stroke="var(--mut)" stroke-width="1" style="opacity:0"/>'+
  '<rect class="plhit" x="'+L+'" y="'+T+'" width="'+(W-L-Rr)+'" height="'+(H-T-B)+'" fill="transparent"/></svg><div class="tip"></div></div>'; }
function ligaChart(root,R){ (root.querySelectorAll('.plchart')||[]).forEach(function(ch){
  var sv=ch.querySelector('svg'), hit=ch.querySelector('.plhit'), cur=ch.querySelector('.plcur'), tip=ch.querySelector('.tip'); if(!hit) return; var mc=ch.dataset.mc?MC[ch.dataset.mc]:null, ids=mc?mc.idades:((R&&R.idades)||[]);
  ch.querySelectorAll('.plln').forEach(function(pth){ if(NOANIM) return; try{ var L=pth.getTotalLength(); pth.style.strokeDasharray=pth.getAttribute('stroke-dasharray')?pth.getAttribute('stroke-dasharray'):L+' '+L; if(!pth.getAttribute('stroke-dasharray')){ pth.style.strokeDashoffset=L; pth.style.transition='stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1)'; setTimeout(function(){ pth.style.strokeDashoffset=0; },80); } }catch(e){} });
  var ar=ch.querySelector('.plar'); if(ar){ if(NOANIM){ ar.style.transition='none'; ar.style.opacity=1; } else setTimeout(function(){ ar.style.opacity=1; },60); }
  function mv(ev){ var pt=sv.createSVGPoint(); var t=ev.touches?ev.touches[0]:ev; pt.x=t.clientX; pt.y=t.clientY; var p=pt.matrixTransform(sv.getScreenCTM().inverse());
   var x0=+hit.getAttribute('x'), w=+hit.getAttribute('width'), n=ids.length, i=Math.max(0,Math.min(n-1,Math.round((p.x-x0)/w*(n-1)))), xx=x0+w*(n<2?0:i/(n-1));
   cur.setAttribute('x1',xx); cur.setAttribute('x2',xx); cur.style.opacity=1;
   tip.innerHTML=mc?('<b>aos '+ids[i]+' anos</b>'+mc.ser.map(function(s){ return '<br>'+e4(s.n)+': '+brl((s.d||[])[i]||0); }).join('')):('<b>aos '+R.idades[i]+' anos</b><br>Atual: '+brl(R.serie[i])+'<br>Otimista: '+brl(R.serieOtim[i])+'<br>Pessimista: '+brl(R.seriePess[i]));
   var bx=ch.getBoundingClientRect(), px2=(t.clientX-bx.left); tip.style.left=Math.min(Math.max(0,px2+12),bx.width-170)+'px'; tip.style.top='34px'; tip.style.opacity=1; }
  function sai(){ cur.style.opacity=0; tip.style.opacity=0; }
  hit.addEventListener('mousemove',mv); hit.addEventListener('touchmove',mv,{passive:true}); hit.addEventListener('mouseleave',sai); hit.addEventListener('touchend',sai); }); }
function donutPct(itens,rot){ var R0=52,C=2*Math.PI*R0,off=0,tot=itens.reduce(function(a,x){ return a+x[1]; },0)||1;
 return '<figure><svg width="140" height="140" viewBox="0 0 140 140" style="transform:rotate(-90deg)"><circle cx="70" cy="70" r="'+R0+'" fill="none" stroke="var(--bg2)" stroke-width="18"/>'+
  itens.map(function(x){ var l=x[1]/tot*C, s='<circle cx="70" cy="70" r="'+R0+'" fill="none" stroke="'+x[2]+'" stroke-width="18" stroke-dasharray="'+Math.max(0,l-1.5)+' '+C+'" stroke-dashoffset="'+(-off)+'"><title>'+e4(x[0])+': '+Math.round(x[1]/tot*100)+'%</title></circle>'; off+=l; return s; }).join('')+'</svg><figcaption>'+rot+'</figcaption></figure>'; }
function barra(p,cor2){ return '<div class="plbar"><i data-p="'+(Math.max(0,Math.min(100,p))/100)+'"'+(cor2?' style="background:'+cor2+'"':'')+'></i></div>'; }
function anima(root){ setTimeout(function(){ (root.querySelectorAll('.plbar i,.plcota .pb i')||[]).forEach(function(i){ i.style.transform='scaleX('+(i.dataset.p||0)+')'; }); (root.querySelectorAll('.plflow i')||[]).forEach(function(i){ i.style.transform='scaleY(1)'; }); },160); animaGauge(root); }

/* ---------------- dados ---------------- */
var ST={cid:null,pid:null,aba:'inicio',sec:'resumo'}, NOANIM=false, MC={};
function ctx(){ var c=cliente(ST.cid); if(!c) return null; var ps=c.plans||[], mp=principal(c); var p=ps.filter(function(x){ return x.id===ST.pid; })[0]||mp; if(!p) return {c:c,p:null,R:null,ps:ps};
 return {c:c,p:p,mp:mp,R:projeta(p),ps:ps}; }
function soLeitura(){ try{ return RO()||!ehCliente(); }catch(e){ return true; } }
function ehCliente(){ try{ var s=px().session(); return !!(s&&s.role==='cliente'); }catch(e){ return false; } }
function salvar(){ try{ pcall('save'); return true; }catch(e){ toast('Não consegui salvar agora','x'); return false; } }

/* ---------------- tela ---------------- */
var ABAS=[['inicio','Início'],['plano','Planejamento'],['jornada','Jornada'],['gastos','Gastos'],['cota','Minha cota']];
R.meuplano=function(v,arg){ arg=arg||{}; if(arg.cid&&arg.cid!==ST.cid){ ST.cid=arg.cid; ST.pid=null; ST.sec='resumo'; } if(arg.aba) ST.aba=arg.aba; if(arg.sec) ST.sec=arg.sec;
 var X=ctx(); if(!X){ v.innerHTML='<div class="empty">Cliente não encontrado.</div>'; return; }
 var c=X.c, staff=!ehCliente();
 v.innerHTML='<div class="hx rv"><div><h1 class="h1">Olá, <em>'+e4(nome1(c.nome))+'</em></h1><div class="sub">'+(X.R?(X.R.saude>=75?'Seu plano está num bom caminho':X.R.saude>=50?'Seu plano está em construção':'Vamos fortalecer seu plano juntos'):'Planejamento financeiro')+'</div></div><span class="sp"></span>'+
  (staff?'<button class="btn ol" id="plvolta">'+I('back',16)+'Ficha do cliente</button>':'')+'</div>'+
  (staff?'<div class="banner rv">'+I('eye',16)+'<span>Você está vendo o que <b>'+e4(c.nome)+'</b> vê na plataforma (somente leitura).</span></div>':'')+
  sn('plnav',ABAS,ST.aba)+'<div id="plbody"></div>';
 if($('#plvolta')) $('#plvolta').onclick=function(){ var cc=(CLIENTES||[]).filter(function(x){ return x.uid===c.id||x.id===c.id; })[0]; go('cliente',{id:cc?cc.id:c.id}); };
 bindSeg('plnav',function(k){ ST.aba=k; corpo(); });
 corpo(); };
function corpo(){ var b=$('#plbody'); if(!b) return; var X=ctx(); if(!X||!X.p){ b.innerHTML='<div class="panel"><div class="empty">'+I('target',22)+'<br>O seu especialista ainda está montando o seu plano. Assim que ficar pronto, ele aparece aqui.</div></div>'; return; }
 var f={inicio:abaInicio,plano:abaPlano,jornada:abaJornada,gastos:abaGastos,cota:abaCota}[ST.aba]||abaInicio;
 b.style.opacity=0; b.style.transform='translateY(10px)'; b.innerHTML=f(X);
 requestAnimationFrame(function(){ b.style.transition='opacity .45s var(--ez),transform .55s var(--ez)'; b.style.opacity=1; b.style.transform='none'; });
 ligaChart(b,X.R); anima(b); if(typeof reveal==='function') reveal(b); if(typeof counts==='function') counts(b);
 var ac={inicio:ligaInicio,plano:ligaPlano,gastos:ligaGastos}[ST.aba]; if(ac) ac(b,X); }

/* ---------- Início ---------- */
function kpis(R,p){ return '<div class="plk">'+
 '<div class="g"><small>Saúde financeira</small><b>'+R.saude+'<em>/100</em></b></div>'+
 '<div class="g"><small>Patrimônio líquido</small><b>'+brlK(R.liquido)+'</b></div>'+
 '<div><small>Patrimônio aos '+p.apos+'</small><b>'+brlK(R.patApos)+'</b></div>'+
 '<div><small>Sobra por mês</small><b>'+brlK(R.sobra)+'<em>· '+R.poupanca+'% poupança</em></b></div></div>'; }
function diag(p,R){ var f=ev('diagnostico'), L=[]; try{ L=f?f(p,R):[]; }catch(e){}
 var bg={ok:'var(--okb)',warn:'var(--au)',bad:'var(--badb)'}, cl={ok:'var(--okt)',warn:'var(--aut)',bad:'var(--badt)'}, ic={ok:'✓',warn:'!',bad:'×'};
 return '<div class="panel rv mb"><div class="ph"><h3>'+I('spark',18)+'Diagnóstico e recomendações</h3></div>'+(L.length?L.map(function(d){ return '<div class="pldiag"><i style="background:'+bg[d[0]]+';color:'+cl[d[0]]+'">'+ic[d[0]]+'</i><span>'+d[1]+'</span></div>'; }).join(''):'<div class="empty" style="padding:14px">Sem observações por enquanto.</div>')+'</div>'; }
function oportunidades(m,R){ var A=m.assets||[],D=m.debts||[],G=m.goals||[],CO=m.consorcios||[], soma=function(a,f){ return a.reduce(function(s,x){ return s+(+f(x)||0); },0); };
 var imoveis=soma(A.filter(function(a){ return a.cat==='Imóvel'; }),function(a){ return a.valor; }), finImovel=D.some(function(d){ return /financ|im[óo]vel/i.test((d.cat||'')+' '+(d.desc||'')); }),
  rf=soma(A.filter(function(a){ return a.cat==='Renda Fixa'; }),function(a){ return a.valor; }), patr=R.patr||soma(A,function(a){ return a.valor; })||1,
  obra=G.some(function(g){ return /constr|reforma|obra|terreno/i.test(g.desc||''); })||A.some(function(a){ return a.cat==='Terreno'; }), carta=R.consCredito||soma(CO,function(c){ return c.credito; }), ops=[];
 if(imoveis>0&&!finImovel){ ops.push(['wallet','Exclusivo Agion','Aumente seu patrimônio sem vender seu imóvel','Você tem imóvel somando <b>'+brl(imoveis)+'</b>. Dá para oferecê-lo como lance de até <b>50%</b> de uma carta e continuar usando o bem normalmente.','Simular essa estratégia']);
  ops.push(['money','Até 100% em conta','Transforme seu imóvel em capital, sem vendê-lo','Com o imóvel quitado como garantia, dá para liberar até <b>'+brl(imoveis)+'</b> em conta para livre uso. Você continua dono e usando o bem.','Ver como funciona']); }
 if(carta>0) ops.push(['spark','100% em conta','Capitalize a sua carta contemplada','Na contemplação da sua carta de <b>'+brl(carta)+'</b>, você pode receber até <b>100% em conta corrente</b> para livre uso, com o bem como garantia.','Ver como funciona']);
 if(obra) ops.push(['home','Crédito para obras','Construir ou reformar com liberação em etapas','Para os seus planos de obra, o crédito é liberado em <b>etapas de 30%</b>, para obra própria ou com construtora.','Quero planejar a obra']);
 if(rf/patr>0.6) ops.push(['trend','Investimentos via consórcio','Faça seu caixa render dentro do consórcio','Hoje <b>'+Math.round(rf/patr*100)+'%</b> do seu patrimônio está em renda fixa. A carta contemplada pode render até <b>101% do CDI</b>.','Conhecer a operação']);
 if(!ops.length) ops.push(['spark','Método Agion','Consórcio e investimento trabalhando juntos','Uma carta de crédito integrada ao seu plano pode antecipar metas e potencializar seu patrimônio, com meia parcela e sem comprometer o orçamento.','Falar com meu especialista']);
 return '<div class="panel rv mb"><div class="ph"><h3>'+I('spark',18)+'Oportunidades para o seu patrimônio</h3><small>sugestões a partir do seu patrimônio de hoje</small></div><div class="plops">'+ops.map(function(o){ return '<div class="plop"><span class="tag">'+e4(o[1])+'</span><h4>'+e4(o[2])+'</h4><p>'+o[3]+'</p><button class="btn sm gd" data-wa="1">'+I('wa',14)+e4(o[4])+'</button></div>'; }).join('')+'</div></div>'; }
function carteira(m){ var AL=ev('ALOC')||{}, CORC=ev('COR_CLASSE')||{}, aloc=AL[m.perfil]||AL.Conservador||{}, cur={};
 (m.assets||[]).forEach(function(a){ cur[a.cat]=(cur[a.cat]||0)+(+a.valor||0); }); var tot=Object.keys(cur).reduce(function(s,k){ return s+cur[k]; },0);
 var cls=Object.keys(aloc).concat(Object.keys(cur).filter(function(k){ return !(k in aloc); }));
 var rows=cls.map(function(k){ var a=tot?Math.round((cur[k]||0)/tot*100):0, s=aloc[k]||0; return {k:k,a:a,s:s,d:s-a}; });
 var it=function(o){ return Object.keys(o).filter(function(k){ return o[k]>0; }).map(function(k){ return [k,o[k],CORC[k]||'#6E8B88']; }); };
 return '<div class="panel rv mb"><div class="ph"><h3>'+I('layers',18)+'Sua carteira: hoje × ideal para o perfil '+e4(m.perfil||'')+'</h3></div>'+
  '<div class="g2"><div class="pldon">'+(tot?donutPct(it(cur),'Hoje'):'<div class="empty" style="padding:10px">Sem investimentos lançados.</div>')+donutPct(it(aloc),'Ideal')+'</div>'+
  '<div><table class="pltab"><thead><tr><th>Classe</th><th class="r">Hoje</th><th class="r">Ideal</th><th class="r">O que fazer</th></tr></thead><tbody>'+rows.map(function(r){ return '<tr><td><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:'+(CORC[r.k]||'#6E8B88')+';margin-right:8px"></span>'+e4(r.k)+'</td><td class="r">'+r.a+'%</td><td class="r"><b>'+r.s+'%</b></td><td class="r">'+(r.d>4?'<span style="color:var(--blue)">▲ aumentar</span>':r.d<-4?'<span style="color:var(--goldd)">▼ reduzir</span>':'<span style="color:var(--ok)">✓ no ponto</span>')+'</td></tr>'; }).join('')+'</tbody></table></div></div></div>'; }
function abaInicio(X){ var p=X.p,R=X.R; if(!R) return '<div class="empty">Não consegui calcular o plano.</div>';
 var m2=pct(R.reservaAtual,R.reservaIdeal), mens=(R.saqueAnual||R.despAnual)/12, mx=Math.max(R.renda,R.desp,Math.max(0,R.sobra),1);
 return '<div class="plhero rv"><p>Em resumo: hoje o seu plano tem <b>'+R.prob+'% de chance</b> de sustentar a sua renda até os '+p.vida+' anos. '+(R.prob>=80?'Está num ótimo caminho: siga firme com os aportes.':R.prob>=55?'Está no caminho; pequenos ajustes deixam mais seguro.':'Dá para melhorar bastante: veja as alavancas no seu planejamento.')+'</p><button class="btn gd" id="plmelh">'+I('trend',16)+'Como melhorar</button></div>'+
  kpis(R,p)+
  '<div class="g12 mb"><div class="panel rv plgauge"><div class="ph" style="align-self:stretch"><h3>'+I('target',18)+'Probabilidade de sucesso</h3></div>'+gauge(R.prob)+'<div class="t">Chance de o seu patrimônio sustentar a renda desejada até os '+p.vida+' anos, medida por centenas de simulações de mercado.</div></div>'+
  '<div class="panel rv"><div class="ph"><h3>'+I('trend',18)+'Projeção do seu patrimônio</h3></div>'+projChart(R,p,p.goals)+'</div></div>'+
  carteira(p)+
  '<div class="g2 mb"><div class="panel rv"><div class="ph"><h3>'+I('target',18)+'Quanto falta para viver de renda</h3></div><p style="font-size:13.5px;line-height:1.65;color:var(--ink2)">Para sustentar <b>'+brl(mens)+'/mês</b> só com os seus investimentos, a referência de mercado (usar cerca de 4% ao ano) aponta um patrimônio de <b style="color:var(--goldd)">'+brl(R.numIndep)+'</b>. Você já construiu <b>'+brl(R.patr)+'</b>.</p>'+
   '<div class="plrow" style="border:0;padding-bottom:4px"><span>Progresso rumo à independência</span><b style="color:'+(R.indepPct>=100?'var(--ok)':'var(--goldd)')+'">'+R.indepPct+'%</b></div>'+barra(R.indepPct)+
   '<p style="font-size:12px;color:var(--mut);margin-top:10px">'+(R.indepPct>=100?'Você já tem patrimônio para viver de renda. Foco agora em preservar e proteger.':'Faltam '+brl(Math.max(0,R.numIndep-R.patr))+'. Mantendo os aportes, o plano caminha para lá.')+'</p></div>'+
  '<div class="panel rv"><div class="ph"><h3>'+I('money',18)+'Seu mês: o que entra e o que sai</h3></div><div class="plflow">'+[['Entra',R.renda,'#6C9682'],['Sai',R.desp,'#C2463B'],['Sobra',Math.max(0,R.sobra),'#C5A059']].map(function(b){ return '<div><b>'+brlK(b[1])+'</b><i style="height:'+Math.max(4,Math.round(b[1]/mx*150))+'px;background:'+b[2]+'"></i><small>'+b[0]+'</small></div>'; }).join('')+'</div></div></div>'+
  '<div class="panel rv mb"><div class="ph"><h3>'+I('kpi',18)+'Indicadores-chave</h3></div>'+
   '<div class="plrow" style="border:0;padding-bottom:4px"><span>Cobertura da meta (patrimônio ÷ necessário)</span><b>'+R.cobertura+'%</b></div>'+barra(R.cobertura)+
   '<div class="plrow" style="border:0;padding:14px 0 4px"><span>Reserva de emergência</span><b style="color:'+(R.reservaAtual>=R.reservaIdeal?'var(--ok)':'#C99A2E')+'">'+brl(R.reservaAtual)+' de '+brl(R.reservaIdeal)+'</b></div>'+barra(m2)+
   '<div class="plrow" style="margin-top:8px"><span>Taxa de saque na aposentadoria</span><b style="color:'+corSaque(R.taxaSaque)+'">'+(+R.taxaSaque||0).toFixed(1).replace('.',',')+'% ao ano</b></div>'+
   '<div class="plrow"><span>Aporte ideal por mês</span><b>'+brl(R.aporteIdeal/12)+'</b></div>'+(R.consCredito>0?'<div class="plrow"><span>Consórcio no plano (carta)</span><b style="color:var(--goldd)">'+brl(R.consCredito)+'</b></div>':'')+'</div>'+
  diag(p,R)+oportunidades(p,R)+
  '<p class="pldisc">Valores estimados para planejamento, a partir das informações fornecidas. Não constituem garantia de rentabilidade nem recomendação de investimento.</p>'; }
function ligaInicio(b){ var m=$('#plmelh',b); if(m) m.onclick=function(){ ST.aba='plano'; ST.sec='projecao'; trocaAba(); };
 $$('[data-wa]',b).forEach(function(x){ x.onclick=function(){ falarEspecialista(); }; }); }
function trocaAba(){ var s=$('#plnav'); if(s){ $$('button',s).forEach(function(x){ x.classList.toggle('on',x.dataset.k===ST.aba); }); try{ slide(s); }catch(e){} } corpo(); }
function falarEspecialista(){ var X=ctx(); var tel='5551993078590'; try{ var o=(X&&X.c&&X.c.ownerId)?(base().accounts||[]).filter(function(a){ return a.id===X.c.ownerId; })[0]:null; if(o&&(o.whatsapp||o.tel)){ var d=String(o.whatsapp||o.tel).replace(/\D/g,''); if(d.length>=10) tel=(d.length<=11?'55':'')+d; } }catch(e){}
 if(!ehCliente()){ toast('Para o cliente, este botão abre o WhatsApp do especialista dele','wa'); return; } window.open('https://wa.me/'+tel+'?text='+encodeURIComponent('Olá! Vi uma oportunidade no meu planejamento da Agion e quero conversar.'),'_blank'); }

/* ---------- Planejamento ---------- */
var SECS=[['resumo','Resumo'],['projecao','Projeção'],['cenarios','Cenários'],['diagnostico','Diagnóstico'],['glossario','Glossário']];
function abaPlano(X){ var p=X.p,R=X.R;
 var plans=X.ps.length>1?'<div class="plplans">'+X.ps.map(function(q){ return '<button data-pl="'+q.id+'" class="'+(q.id===p.id?'on':'')+'">'+(q.main?'★ Plano Principal':e4(q.titulo||'Simulação'))+'</button>'; }).join('')+'</div>':'';
 return plans+'<div class="secn" id="plsec">'+SECS.map(function(s){ return '<button data-s="'+s[0]+'" class="'+(s[0]===ST.sec?'on':'')+'">'+s[1]+'</button>'; }).join('')+'</div><div id="plsecb">'+secao(X)+'</div>'; }
function secao(X,k0){ var p=X.p,R=X.R,k=k0||ST.sec;
 if(k==='resumo') return kpis(R,p)+'<div class="g2 mb"><div class="panel rv"><div class="ph"><h3>'+I('users',18)+e4(p.titulo||'Plano')+'</h3></div>'+
   [['Idade atual',p.idade+' anos'],['Aposentadoria prevista',p.apos+' anos'],['Expectativa de vida',p.vida+' anos'],['Perfil',e4(p.perfil||'—')+' · '+(p.rent||0)+'% real a.a.'],['Receita média anual',brl(R.rendaAnual)],['Despesa média anual',brl(R.despAnual)],['Aporte médio anual',brl(R.aporteAnual)],['Patrimônio investido',brl(R.patr)]].map(function(r){ return '<div class="plrow"><span>'+r[0]+'</span><b>'+r[1]+'</b></div>'; }).join('')+'</div>'+
   '<div class="panel rv plgauge"><div class="ph" style="align-self:stretch"><h3>'+I('target',18)+'Probabilidade de sucesso</h3></div>'+gauge(R.prob)+'<div style="align-self:stretch;margin-top:26px"><div class="plrow" style="border:0;padding-bottom:4px"><span>Cobertura da meta</span><b>'+R.cobertura+'% de '+brlK(R.alvoConsumo)+'</b></div>'+barra(R.cobertura)+'</div></div></div>';
 if(k==='projecao'){ var band={}; try{ band=(ev('probBand')||function(){ return {}; })(R.prob)||{}; }catch(e){}
  return '<div class="plk"><div class="g"><small>Patrimônio aos '+p.apos+'</small><b>'+brlK(R.patApos)+'</b></div><div><small>Necessário (consumo)</small><b>'+brlK(R.alvoConsumo)+'</b></div><div><small>Aporte ideal por mês</small><b>'+brlK(R.aporteIdeal/12)+'</b></div><div class="g"><small>Probabilidade</small><b style="color:'+cor(R.prob)+'">'+R.prob+'%</b></div></div>'+
   '<div class="panel rv mb"><div class="ph"><h3>'+I('trend',18)+'Projeção do planejamento</h3></div>'+projChart(R,p,p.goals)+'</div>'+
   '<div class="g2 mb"><div class="panel rv"><div class="ph"><h3>'+I('zap',18)+'Simulador ao vivo</h3><small>arraste e veja na hora</small></div>'+
    '<label class="plsl">Aporte extra por mês <b id="slAv">R$ 0</b><input type="range" id="slA" min="0" max="5000" step="100" value="0"></label>'+
    '<label class="plsl">Adiar a aposentadoria <b id="slIv">aos '+p.apos+'</b><input type="range" id="slI" min="0" max="8" step="1" value="0"></label>'+
    '<label class="plsl">Reduzir a renda-alvo <b id="slRv">0%</b><input type="range" id="slR" min="0" max="40" step="5" value="0"></label>'+
    '<div class="plk" style="grid-template-columns:repeat(3,1fr);margin:6px 0 0"><div class="g"><small>Probabilidade</small><b id="slP" style="color:'+cor(R.prob)+'">'+R.prob+'%</b></div><div><small>Taxa de saque</small><b id="slT">'+(+R.taxaSaque||0).toFixed(1).replace('.',',')+'%</b></div><div><small>Aos '+p.apos+'</small><b id="slM">'+brlK(R.patApos)+'</b></div></div></div>'+
   '<div class="panel rv"><div class="ph"><h3>'+I('target',18)+'O que aumenta a sua probabilidade?</h3></div>'+seAjustar(p,R)+'</div></div>'+
   '<div class="panel rv mb"><div class="ph"><h3>'+I('spark',18)+'Entenda a sua probabilidade</h3></div><p style="font-size:13.5px;line-height:1.65;color:var(--ink2)">Não usamos um único chute de rentabilidade. Rodamos <b>centenas de simulações</b> do seu plano (método Monte Carlo), cada uma com uma sequência diferente de anos bons e ruins de mercado, de acordo com o seu perfil <b>'+e4(p.perfil||'')+'</b>. A sua <b>probabilidade de '+R.prob+'%</b> é a fatia dessas simulações em que o patrimônio <b>durou até os '+p.vida+' anos</b>.</p>'+
    (band.t?'<div class="banner" style="margin-top:12px;border-color:'+band.cor+'"><b style="color:'+band.cor+'">'+e4(band.t)+'</b><span>'+e4(band.d||'')+'</span></div>':'')+'</div>'+
   '<div class="panel rv"><div class="ph"><h3>'+I('list',18)+'Tabela da projeção</h3></div><div class="plscroll"><table class="pltab"><thead><tr><th>Idade</th><th class="r">Atual</th><th class="r">Otimista</th><th class="r">Pessimista</th></tr></thead><tbody>'+R.idades.map(function(a,i){ return '<tr><td>'+a+'</td><td class="r">'+brl(R.serie[i])+'</td><td class="r" style="color:var(--ok)">'+brl(R.serieOtim[i])+'</td><td class="r" style="color:var(--bad)">'+brl(R.seriePess[i])+'</td></tr>'; }).join('')+'</tbody></table></div></div>'; }
 if(k==='cenarios'){ var outros=X.ps.filter(function(q){ return q.id!==X.mp.id; });
  var rows=X.ps.map(function(q){ var r=q.id===p.id?R:projeta(q); return {q:q,r:r||{}}; });
  return '<div class="panel rv mb"><div class="ph"><h3>'+I('layers',18)+'Plano Principal × simulações</h3></div>'+(outros.length?'':'<p style="font-size:13px;color:var(--mut);margin-bottom:12px">Ainda não há simulações. O especialista cria cenários (aposentar antes, aportar mais) para comparar com o Plano Principal.</p>')+
   '<table class="pltab"><thead><tr><th>Cenário</th><th class="r">Aporte/mês</th><th class="r">Aos aposentar</th><th class="r">Probabilidade</th></tr></thead><tbody>'+rows.map(function(o){ return '<tr><td>'+(o.q.main?'★ ':'')+e4(o.q.titulo||'Plano')+'<div style="font-size:11.5px;color:var(--mut)">aposentar aos '+o.q.apos+'</div></td><td class="r">'+brl(o.r.sobra||0)+'</td><td class="r">'+brl(o.r.patApos||0)+'</td><td class="r"><b style="color:'+cor(o.r.prob||0)+'">'+(o.r.prob||0)+'%</b></td></tr>'; }).join('')+'</tbody></table></div>'; }
 if(k==='diagnostico') return diag(p,R);
 var G=ev('GLOSS')||[]; return '<div class="panel rv"><div class="ph"><h3>'+I('book',18)+'Glossário</h3></div><dl class="plgl">'+G.map(function(g){ return '<dt>'+e4(g[0])+'</dt><dd>'+e4(g[1])+'</dd>'; }).join('')+'</dl></div>'; }
function seAjustar(p,R){ var base0=R.prob, sc=[];
 try{ var a=clone(p); a.apos=(+p.apos)+2; sc.push(['Aposentar 2 anos depois (aos '+((+p.apos)+2)+')',projeta(a).prob]);
  var b=clone(p); (b.incomes=b.incomes||[]).push({desc:'Aporte extra',valor:500,freq:'Mensal'}); sc.push(['Aportar R$ 500 a mais por mês',projeta(b).prob]);
  var c2=clone(p); (c2.incomes=c2.incomes||[]).push({desc:'Aporte extra',valor:1000,freq:'Mensal'}); sc.push(['Aportar R$ 1.000 a mais por mês',projeta(c2).prob]);
  var gr=(p.goals||[]).filter(function(x){ return x.tipo==='renda'; })[0]; if(gr){ var d=clone(p); d.goals.filter(function(x){ return x.tipo==='renda'; })[0].valor=Math.round(gr.valor*0.9); sc.push(['Reduzir a renda-alvo em 10%',projeta(d).prob]); }
  var e=clone(p); e.perfil='Arrojado'; e.rent=Math.round(((+p.rent||0)+1.5)*10)/10; sc.push(['Carteira mais arrojada (+1,5% a.a.)',projeta(e).prob]); }catch(x){}
 return '<table class="pltab"><tbody>'+sc.map(function(s){ var dd=s[1]-base0; return '<tr><td>'+e4(s[0])+'</td><td class="r"><b>'+s[1]+'%</b></td><td class="r">'+(dd>1?'<span style="color:var(--ok)">▲ +'+dd+' pp</span>':dd<-1?'<span style="color:var(--bad)">▼ '+dd+' pp</span>':'<span style="color:var(--mut)">≈</span>')+'</td></tr>'; }).join('')+'</tbody></table><p style="font-size:11.5px;color:var(--mut);margin-top:10px">Comparado com a sua situação de hoje ('+base0+'%). pp = pontos percentuais.</p>'; }
function ligaPlano(b,X){ $$('[data-pl]',b).forEach(function(x){ x.onclick=function(){ ST.pid=x.dataset.pl; corpo(); }; });
 $$('#plsec button',b).forEach(function(x){ x.onclick=function(){ ST.sec=x.dataset.s; $$('#plsec button',b).forEach(function(y){ y.classList.toggle('on',y===x); }); var sb=$('#plsecb',b); sb.innerHTML=secao(ctx()); ligaChart(sb,ctx().R); anima(sb); if(typeof reveal==='function') reveal(sb); ligaSim(sb); }; });
 ligaSim(b); }
function ligaSim(b,X0){ var A=$('#slA',b); if(!A) return; var I2=$('#slI',b), Rr=$('#slR',b), X=X0||ctx(), p0=X.p;
 function up(){ var p=clone(p0), ap=+A.value||0, ad=+I2.value||0, rd=+Rr.value||0; if(ap>0)(p.incomes=p.incomes||[]).push({desc:'Aporte extra',valor:ap,freq:'Mensal'}); p.apos=(+p0.apos)+ad;
  var gr=(p.goals||[]).filter(function(g){ return g.tipo==='renda'; })[0]; if(gr&&rd>0) gr.valor=Math.round(gr.valor*(1-rd/100));
  var R=projeta(p); if(!R) return; $('#slAv',b).textContent=brl(ap); $('#slIv',b).textContent='aos '+((+p0.apos)+ad)+(ad?' (+'+ad+')':''); $('#slRv',b).textContent=rd?('−'+rd+'%'):'0%';
  var P=$('#slP',b); P.textContent=R.prob+'%'; P.style.color=cor(R.prob); var T=$('#slT',b); T.textContent=(+R.taxaSaque||0).toFixed(1).replace('.',',')+'%'; T.style.color=corSaque(R.taxaSaque); $('#slM',b).textContent=brlK(R.patApos); }
 A.oninput=I2.oninput=Rr.oninput=up; }

/* ---------- Jornada ---------- */
function abaJornada(X){ var p=X.p; try{ var f=ev('ensureSteps'); if(f&&!soLeitura()) f(p); }catch(e){}
 var goals=(p.goals||[]).slice().sort(function(a,b){ return (a.idade||p.apos)-(b.idade||p.apos); });
 var fases=[['Diagnóstico','raio-x financeiro de hoje'],['Reserva','6 meses de despesas'],['Acumulação','aporte mensal investido'],['Metas','os seus objetivos'],['Independência','aos '+p.apos+' anos']];
 return '<div class="banner rv">'+I('target',16)+'<span>Este é o seu mapa: cada meta na ordem em que vai acontecer, com os passos que o seu especialista definiu para você chegar lá.</span></div>'+
  '<div class="panel rv mb"><div class="ph"><h3>'+I('ladder',18)+'Etapas do seu plano</h3></div><div class="plroad">'+fases.map(function(f,i){ return '<div class="st'+(i===3?' on':'')+'"><span class="n">ETAPA '+(i+1)+'</span><b>'+f[0]+'</b><span>'+f[1]+'</span></div>'; }).join('')+'</div></div>'+
  '<div class="panel rv"><div class="ph"><h3>'+I('target',18)+'Suas metas ('+goals.length+')</h3></div>'+(goals.length?goals.map(function(g,i){ return '<div class="plgoal"><div class="dot">'+(i+1)+'</div><div class="bx"><h4>'+e4(g.desc||'Objetivo')+'</h4><div class="w">'+(g.tipo==='renda'?'Renda · '+brl(g.valor)+'/mês':'Meta · '+brl(g.valor))+' · aos '+(g.idade||p.apos)+' anos</div>'+((g.passos||[]).length?'<ol>'+g.passos.map(function(s){ return '<li>'+e4(s)+'</li>'; }).join('')+'</ol>':'')+'</div></div>'; }).join(''):'<div class="empty">Nenhuma meta cadastrada ainda. O especialista adiciona os seus objetivos no plano.</div>')+'</div>'; }

/* ---------- Gastos ---------- */
function cats(){ return ev('CATS_GASTO')||[['Outros','','#6E8B88']]; }
function catM(c){ return cats().filter(function(x){ return x[0]===c; })[0]||['Outros','M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z','#6E8B88']; }
function catIc(c,sz){ var m=catM(c); return '<svg viewBox="0 0 24 24" style="width:'+(sz||18)+'px;height:'+(sz||18)+'px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round">'+m[1]+'</svg>'; }
function gastosDe(m){ return {L:Array.isArray(m.lancamentos)?m.lancamentos:[], bud:m.budgets||{}, hist:Array.isArray(m.histGastos)?m.histGastos:[], contas:Array.isArray(m.contas)?m.contas:[]}; }
function abaGastos(X){ var g=gastosDe(X.mp), L=g.L, desp=L.filter(function(x){ return x.tipo==='despesa'; }), rec=L.filter(function(x){ return x.tipo==='receita'; });
 var td=desp.reduce(function(s,x){ return s+(+x.valor||0); },0), tr=rec.reduce(function(s,x){ return s+(+x.valor||0); },0), sal=tr-td, cs={};
 desp.forEach(function(x){ cs[x.cat]=(cs[x.cat]||0)+(+x.valor||0); }); var ca=Object.keys(cs).map(function(k){ return [k,cs[k]]; }).sort(function(a,b){ return b[1]-a[1]; });
 var est=ca.filter(function(x){ return g.bud[x[0]]&&x[1]>g.bud[x[0]]; }), ro=soLeitura(), tc=g.contas.reduce(function(s,x){ return s+(+x.saldo||0); },0);
 var hist=g.hist.concat([['Atual',td]]), hm=Math.max.apply(null,hist.map(function(h){ return +h[1]||0; }).concat([1]));
 return (est.length?'<div class="banner rv" style="border-color:var(--bad);background:var(--badb)">⚠️ <span>Você passou da meta em <b>'+est.map(function(e){ return e4(e[0]); }).join(', ')+'</b>. Vale rever esses gastos.</span></div>':'')+
  '<div class="plsum rv"><div><small>Receitas</small><b style="color:var(--ok)">'+brl(tr)+'</b></div><div><small>Despesas</small><b style="color:var(--bad)">'+brl(td)+'</b></div><div><small>Saldo</small><b style="color:'+(sal>=0?'var(--goldd)':'var(--bad)')+'">'+brl(sal)+'</b></div></div>'+
  '<div class="g2 mb"><div class="panel rv"><div class="ph"><h3>'+I('money',18)+'Despesas por categoria</h3></div>'+(ca.length?'<div class="pldon">'+donutPct(ca.map(function(c){ return [c[0],c[1],catM(c[0])[2]]; }),'Despesas')+'</div><div class="plrow" style="border:0;padding-bottom:4px;margin-top:10px"><span>Comprometimento da renda</span><b>'+(tr?Math.round(td/tr*100):0)+'%</b></div>'+barra(tr?td/tr*100:0):'<div class="empty">Sem despesas lançadas neste mês.</div>')+'</div>'+
  '<div class="panel rv"><div class="ph"><h3>'+I('target',18)+'Categorias</h3><span class="sp"></span>'+(ro?'':'<button class="btn sm ol" id="glmeta">Definir metas</button>')+'</div>'+(ca.map(function(c){ var me=catM(c[0]), meta=g.bud[c[0]]||0, over=meta&&c[1]>meta, uso=meta?Math.min(100,Math.round(c[1]/meta*100)):(td?Math.round(c[1]/td*100):0);
    return '<div class="plcat"><div class="ci" style="background:'+me[2]+'22;color:'+me[2]+'">'+catIc(c[0])+'</div><div><div class="cn">'+e4(c[0])+(over?' <span class="pill bad" style="margin-left:4px">passou da meta</span>':'')+'</div>'+barra(uso,over?'var(--bad)':me[2])+'</div><div class="cv"><b>'+brl(c[1])+'</b><small>'+(meta?'de '+brl(meta):(td?Math.round(c[1]/td*100):0)+'%')+'</small></div></div>'; }).join('')||'<div class="empty" style="padding:14px">Nenhuma despesa ainda.</div>')+'</div></div>'+
  '<div class="g2 mb"><div class="panel rv"><div class="ph"><h3>'+I('trend',18)+'Evolução dos gastos</h3></div><div class="plflow">'+hist.slice(-6).map(function(h,i,a){ return '<div><b>'+brlK(h[1])+'</b><i style="height:'+Math.max(4,Math.round((+h[1]||0)/hm*140))+'px;background:'+(i===a.length-1?'#C5A059':'color-mix(in srgb,#6C9682 55%,transparent)')+'"></i><small>'+e4(h[0])+'</small></div>'; }).join('')+'</div></div>'+
  '<div class="panel rv"><div class="ph"><h3>'+I('wallet',18)+'Contas e cartões</h3><span class="sp"></span><span class="pill">'+brl(tc)+'</span></div>'+(g.contas.length?g.contas.map(function(ct){ return '<div class="plrow"><span>'+e4(ct.nome)+' <span class="pill" style="margin-left:6px">'+e4(ct.tipo||'')+'</span></span><b style="color:'+((+ct.saldo||0)>=0?'var(--goldd)':'var(--bad)')+'">'+brl(+ct.saldo||0)+'</b></div>'; }).join(''):'<div class="empty" style="padding:14px">Nenhuma conta cadastrada.</div>')+'</div></div>'+
  '<div class="panel rv"><div class="ph"><h3>'+I('list',18)+'Lançamentos</h3><span class="sp"></span>'+(ro?'':'<button class="btn sm gd" id="glnovo">'+I('plus',14)+'Lançamento</button>')+'</div>'+(L.slice().sort(function(a,b){ return (b.dia||0)-(a.dia||0); }).map(function(x){ var me=catM(x.cat), r=x.tipo==='receita';
    return '<div class="pllanc"><div class="ci" style="background:'+me[2]+'22;color:'+me[2]+'">'+catIc(x.cat)+'</div><div><div class="ld">'+e4(x.desc)+'</div><div class="ls">'+e4(x.cat)+' · dia '+(x.dia||'—')+'</div></div><b style="color:'+(r?'var(--ok)':'var(--bad)')+'">'+(r?'+ ':'− ')+brl(+x.valor||0)+'</b>'+(ro?'<span></span>':'<button class="lx" data-del="'+e4(x.id)+'" title="Apagar">'+I('x',15)+'</button>')+'</div>'; }).join('')||'<div class="empty" style="padding:14px">Nenhum lançamento ainda.'+(ro?'':' Toque em “Lançamento” para começar.')+'</div>')+'</div>'+
  '<p class="pldisc">Em breve: ligação com o Open Finance, para os lançamentos entrarem sozinhos.</p>'; }
function ligaGastos(b,X){ var m=X.mp;
 var nv=$('#glnovo',b); if(nv) nv.onclick=function(){ var ops=cats().map(function(c){ return '<option>'+e4(c[0])+'</option>'; }).join('');
  var s=sheet('<h2>Novo lançamento</h2><div class="fi"><label>Descrição</label><input id="gld" placeholder="Ex.: Supermercado"></div><div style="display:flex;gap:10px"><div class="fi" style="flex:1"><label>Valor (R$)</label><input id="glv" inputmode="decimal" placeholder="0,00"></div><div class="fi" style="width:96px"><label>Dia</label><input id="gldia" type="number" min="1" max="31" value="'+new Date().getDate()+'"></div></div>'+
   '<div style="display:flex;gap:10px"><div class="fi" style="flex:1"><label>Tipo</label><select id="glt"><option value="despesa">Despesa</option><option value="receita">Receita</option></select></div><div class="fi" style="flex:1"><label>Categoria</label><select id="glc">'+ops+'</select></div></div>'+
   '<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:6px"><button class="btn ol" id="gln">Cancelar</button><button class="btn gd" id="gly">'+I('ok',15)+'Salvar</button></div>',460);
  setTimeout(function(){ var i=$('#gld',s); if(i) i.focus(); },80); $('#gln',s).onclick=function(){ closeSheet(); };
  $('#gly',s).onclick=function(){ var d=$('#gld',s).value.trim(), v=+String($('#glv',s).value).replace(/\./g,'').replace(',','.')||0; if(!d||!v){ toast('Preencha descrição e valor','x'); return; }
   if(!Array.isArray(m.lancamentos)) m.lancamentos=[]; var uid=ev('uuid'); m.lancamentos.push({id:uid?uid():String(Date.now()),desc:d,valor:v,tipo:$('#glt',s).value,cat:$('#glc',s).value,dia:Math.max(1,Math.min(31,+$('#gldia',s).value||1))});
   if(salvar()){ closeSheet(); toast('Lançamento salvo','ok'); corpo(); } }; };
 $$('[data-del]',b).forEach(function(x){ x.onclick=function(){ confirma('Apagar este lançamento?','Ele sai do seu controle de gastos.','Apagar').then(function(ok){ if(!ok) return; m.lancamentos=(m.lancamentos||[]).filter(function(l){ return String(l.id)!==x.dataset.del; }); if(salvar()){ toast('Lançamento apagado','ok'); corpo(); } }); }; });
 var mt=$('#glmeta',b); if(mt) mt.onclick=function(){ var bud=m.budgets||{}; var s=sheet('<h2>Metas de gasto por mês</h2><p style="color:var(--mut);font-size:13px;margin:6px 0 14px">Quanto você quer gastar, no máximo, em cada categoria.</p>'+cats().filter(function(c){ return c[0]!=='Receita'; }).map(function(c){ return '<div class="fi" style="flex-direction:row;align-items:center;gap:10px;margin-bottom:8px"><span style="width:140px;display:flex;align-items:center;gap:8px;color:'+c[2]+'">'+catIc(c[0],16)+'<span style="color:var(--ink)">'+e4(c[0])+'</span></span><input data-bud="'+e4(c[0])+'" inputmode="numeric" value="'+(bud[c[0]]||'')+'" placeholder="0" style="flex:1"></div>'; }).join('')+
   '<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:8px"><button class="btn ol" id="gbn">Cancelar</button><button class="btn gd" id="gby">'+I('ok',15)+'Salvar metas</button></div>',480);
  $('#gbn',s).onclick=function(){ closeSheet(); }; $('#gby',s).onclick=function(){ var nb={}; $$('[data-bud]',s).forEach(function(i){ var v=+String(i.value).replace(/\D/g,'')||0; if(v) nb[i.dataset.bud]=v; }); m.budgets=nb; if(salvar()){ closeSheet(); toast('Metas salvas','ok'); corpo(); } }; }; }

/* ---------- Minha cota ---------- */
function abaCota(X){ var m=X.mp, lista=m.consorcios||[], reais=(typeof CARTAS!=='undefined'&&CARTAS||[]).filter(function(k){ return k.cliente_id===X.c.id&&k.ativo!==false; });
 var fee=function(co){ return co.tipo==='Auto'?0.16:0.22; };
 var html=reais.length?'<div class="panel rv mb"><div class="ph"><h3>'+I('layers',18)+'Suas cotas na administradora</h3></div>'+reais.map(function(k){ return '<div class="plrow"><span><b>Grupo '+e4(k.grupo||'—')+' · cota '+e4(k.cota||'—')+'</b><div style="font-size:12px;color:var(--mut)">'+e4(k.administradora||'')+(k.titular_nome?' · '+e4(k.titular_nome):'')+'</div></span><b>'+(+k.valor?brl(+k.valor):'')+'</b></div>'; }).join('')+'</div>':'';
 if(!lista.length&&!reais.length) return '<div class="banner rv">'+I('spark',16)+'<span>O consórcio é o diferencial do Método Agion: uma carta de crédito sem juros que vira patrimônio e acelera os seus objetivos.</span></div><div class="panel rv"><div class="empty">'+I('layers',24)+'<br><b style="color:var(--ink);font-size:15px">Você ainda não tem um consórcio no seu plano</b><br>Fale com o seu especialista para incluir uma carta e ver o quanto ela antecipa os seus sonhos.<br><button class="btn gd" style="margin-top:14px" data-wa="1">'+I('wa',14)+'Falar com o meu especialista</button></div></div>';
 return html+lista.map(function(co){ var prazo=(+co.prazoMeses)||200, base0=(+co.parcela>0)?(+co.parcela):((+co.credito)*(1+fee(co))/prazo), fr=co.modalidade==='inteira'?1:co.modalidade==='p70'?0.7:0.5, lb=co.modalidade==='inteira'?'Parcela':co.modalidade==='p70'?'Parcela 70%':'Meia parcela', cm=+co.contemplaMes||12;
  return '<div class="plcota rv"><h3>'+e4(co.desc||'Consórcio')+(co.tipo?' · '+e4(co.tipo):'')+'</h3><div class="k"><div><small>Crédito (carta)</small><b>'+brlK(+co.credito||0)+'</b></div><div><small>'+lb+'</small><b>'+brl(base0*fr)+'</b></div><div><small>Prazo</small><b>'+prazo+' meses</b></div><div><small>Contemplação alvo</small><b>'+cm+' meses</b></div></div>'+
   '<div class="pb"><i data-p="'+Math.min(1,cm/prazo)+'"></i></div><div class="nt">Estratégia de contemplação por lance: meta de '+cm+' meses.'+'</div></div>'; }).join('')+
  '<div class="panel rv"><div class="ph"><h3>'+I('chat',18)+'Boletos, lances e assembleias</h3></div><p style="font-size:13px;color:var(--ink2);line-height:1.6;margin-bottom:12px">A segunda via do boleto, a oferta de lance e os resultados das assembleias saem direto com o seu especialista, pelo WhatsApp.</p><button class="btn gd" data-wa="1">'+I('wa',14)+'Falar com o meu especialista</button></div>'; }

/* ==========================================================================
   EDITOR DO PLANO no visual novo (equipe) · PLANO_EDITOR_23OUT
   As 13 seções do plano (Resumo … Glossário) dentro da ficha do cliente,
   editáveis aqui mesmo, sem abrir a plataforma antiga. Salva a cada mudança.
   ========================================================================== */
(function(){ if(document.getElementById('edcss')) return; var s=document.createElement('style'); s.id='edcss'; s.textContent=
 '.edtop{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}.edtop>div{background:var(--bg);border-radius:18px;padding:11px 14px}.edtop small{display:block;font:700 10px "DM Sans";letter-spacing:.12em;text-transform:uppercase;color:var(--mut);margin-bottom:3px}.edtop b{font:700 17px "DM Sans";transition:color .3s}'+
 '.edhead{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px}.edhead .sp{flex:1}'+
 '.edsv{font:700 11px "DM Sans";color:var(--mut);display:inline-flex;align-items:center;gap:6px;padding:0 4px}.edsv i{width:7px;height:7px;border-radius:50%;background:var(--ok);display:inline-block}.edsv.on i{background:#C99A2E;animation:edpl 1s infinite}@keyframes edpl{50%{opacity:.3}}'+
 '.edwrap{container-type:inline-size}.edgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px 14px}.edgrid .w2{grid-column:span 2}'+
 '.edf{display:flex;flex-direction:column;gap:5px;min-width:0}.edf small{font-size:11.5px;color:var(--mut);font-weight:600}'+
 '.edin{display:flex;align-items:center;gap:6px;background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:0 12px;transition:box-shadow .25s,border-color .25s;min-height:40px}.edin:focus-within{border-color:var(--gold);box-shadow:0 0 0 3px color-mix(in srgb,var(--gold) 28%,transparent)}'+
 '.edin input,.edin select{flex:1;min-width:0;border:0;background:transparent;outline:none;padding:9px 0;font:500 13.5px "DM Sans";color:var(--ink);-webkit-appearance:none;appearance:none}.edin select{cursor:pointer;padding-right:14px;background-image:linear-gradient(45deg,transparent 50%,var(--mut) 50%),linear-gradient(135deg,var(--mut) 50%,transparent 50%);background-position:calc(100% - 6px) 52%,calc(100% - 1px) 52%;background-size:5px 5px;background-repeat:no-repeat}'+
 '.edin em{font-style:normal;font-size:12px;color:var(--mut);font-weight:700;white-space:nowrap}.edin input:disabled,.edin select:disabled{color:var(--ink2);cursor:default;opacity:1;-webkit-text-fill-color:var(--ink2)}'+
 '.edrow{display:grid;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid var(--line);position:relative}.edrow:last-child{border-bottom:0}.edrow .edf small{display:none}'+
 '.c4{grid-template-columns:2.2fr 1.3fr 1.3fr 36px}.c5{grid-template-columns:2fr 1.2fr 1fr 1fr 36px}'+
 '.edhd{display:grid;gap:10px;font:700 10px "DM Sans";letter-spacing:.12em;text-transform:uppercase;color:var(--mut);padding:0 0 2px}'+
 '.edx{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;color:var(--mut);background:transparent;transition:.25s}.edx:hover{background:var(--badb);color:var(--bad)}'+
 '.edadd{margin-top:12px}.ednote{font-size:12px;color:var(--mut);line-height:1.6;margin-top:10px}'+
 '.edcons{background:var(--bg);border-radius:22px;padding:16px 18px;margin-bottom:14px;position:relative}.edcons .edin{background:var(--card)}.edcons .edgrid{grid-template-columns:repeat(auto-fill,minmax(170px,1fr));margin-top:12px}.edcons .hint{font-size:12px;color:var(--goldd);margin-top:10px;line-height:1.55}.edcons .top{display:grid;grid-template-columns:2.2fr 1fr 1.4fr 36px;gap:10px;align-items:end}'+
 '.edgoal{display:grid;grid-template-columns:44px 1fr;gap:14px;margin-bottom:14px}.edgoal .dot{width:44px;height:44px;border-radius:50%;background:var(--gg);color:#0B2A26;display:grid;place-items:center;font:800 15px "DM Sans"}.edgoal .bx{background:var(--bg);border-radius:20px;padding:14px 16px}.edgoal h4{font:600 15px "DM Sans"}.edgoal .w{font-size:12px;color:var(--mut);margin-top:2px}'+
 '.edstep{display:flex;gap:10px;align-items:center;padding:6px 0;border-top:1px dashed var(--line);font-size:13px;line-height:1.5}.edstep .n{flex:none;width:20px;height:20px;border-radius:50%;background:var(--card);display:grid;place-items:center;font:700 11px "DM Sans";color:var(--goldd)}.edstep .tx{flex:1}.edstep .edx{width:28px;height:28px}'+
 '.edaddstep{display:flex;gap:8px;margin-top:10px}.edaddstep .edin{flex:1;background:var(--card)}'+
 '.edchips{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.edchips span{padding:8px 12px;border-radius:14px;background:var(--bg);font-size:12.5px}.edchips b{display:block;font-size:13px}'+
 '.edsaq{position:relative;height:38px;border-radius:12px;background:var(--bg);overflow:hidden;margin-top:12px}.edsaq .z{position:absolute;left:0;top:0;bottom:0;background:color-mix(in srgb,var(--ok) 18%,transparent);border-right:2px dashed var(--ok)}.edsaq .m{position:absolute;top:-2px;bottom:-2px;width:3px}.edsaq span{position:absolute;font:800 10.5px "DM Sans";top:12px}'+
 '@container (max-width:520px){.edtop{grid-template-columns:1fr 1fr}.edgrid .w2{grid-column:1/-1}}'+
 '@container (max-width:600px){.c4,.c5{grid-template-columns:1fr 1fr}.edrow{padding:12px 0}.edrow>.edf:first-child{grid-column:1/-1;padding-right:44px}.edrow .edf small{display:block}.edhd{display:none}.edrow>.edx{position:absolute;top:30px;right:0}.edcons .top{grid-template-columns:1fr 1fr}.edcons .top>.edf:first-child{grid-column:1/-1;padding-right:44px}.edcons .top>.edx{position:absolute;top:16px;right:14px}}';
 document.head.appendChild(s); })();

var ESECS=[['resumo','Resumo'],['projecao','Projeção'],['dados','Dados & Premissas'],['patrimonio','Patrimônio'],['consorcio','Consórcio'],['fluxo','Receitas & Despesas'],['balanco','Balanço ano a ano'],['objetivos','Objetivos'],['protecao','Proteção'],['cenarios','Cenários'],['acao','Plano de Ação'],['diagnostico','Diagnóstico'],['glossario','Glossário']];
var ED={el:null,cid:null,pid:null,sec:'resumo',salvoTm:null};
var CLASSES=['Renda Fixa','Renda Variável','Imóvel','Previdência','Multimercado','Internacional','Outros'], DIVIDAS=['Financiamento','Empréstimo','Cartão','Consórcio','Outros'];
function edCtx(){ var c=cliente(ED.cid); if(!c) return null; var ps=c.plans||[], mp=principal(c), p=ps.filter(function(x){ return x.id===ED.pid; })[0]||mp; if(!p) return {c:c,ps:ps,p:null}; ED.pid=p.id; return {c:c,p:p,mp:mp||p,ps:ps,R:projeta(p)}; }
function edRO(){ try{ return !!RO(); }catch(e){ return false; } }
function nfmt(v,d){ v=+v||0; return v.toLocaleString('pt-BR',{maximumFractionDigits:d==null?2:d}); }
function nparse(s){ s=String(s==null?'':s).trim().replace(/[R$\s%]/g,''); if(!s) return 0; if(s.indexOf(',')>=0) s=s.replace(/\./g,'').replace(',','.'); else if(/^-?\d{1,3}(\.\d{3})+$/.test(s)) s=s.replace(/\./g,''); var n=parseFloat(s); return isFinite(n)?n:0; }
function uso(co){ var f=ev('usoCarta'); try{ if(f) return f(co); }catch(e){} var u=String((co&&co.uso)||'').toLowerCase(); return u==='consumo'||u==='aquisicao'?'aquisicao':u==='imovel'||u==='expandir'?'expandir':u==='agio'?'agio':'rentabilizar'; }
function rendaApos(p){ var g=(p.goals||[]).filter(function(x){ return x.tipo==='renda'; })[0]; return g?(+g.valor||0):0; }
/* campos */
function fIn(path,val,o){ o=o||{}; var t=o.t||'t', vazio=(val===''||val==null||(o.z&&!(+val)));
 var disp=t==='t'?e4(val==null?'':val):(vazio?'':nfmt(val,o.d==null?2:o.d));
 return '<label class="edf'+(o.w?' '+o.w:'')+'">'+(o.l?'<small>'+o.l+'</small>':'')+'<span class="edin">'+(t==='m'?'<em>R$</em>':'')+
  '<input data-p="'+path+'" data-t="'+t+'" value="'+disp+'"'+(t!=='t'?' inputmode="decimal"':'')+(o.ph?' placeholder="'+e4(o.ph)+'"':'')+(edRO()||o.dis?' disabled':'')+'>'+(o.suf?'<em>'+o.suf+'</em>':'')+'</span></label>'; }
function fSel(path,val,opts,o){ o=o||{}; return '<label class="edf'+(o.w?' '+o.w:'')+'">'+(o.l?'<small>'+o.l+'</small>':'')+'<span class="edin"><select data-p="'+path+'" data-t="s"'+(edRO()?' disabled':'')+'>'+
  opts.map(function(x){ var v=Array.isArray(x)?x[0]:x, lb=Array.isArray(x)?x[1]:x; return '<option value="'+e4(v)+'"'+(String(v)===String(val)?' selected':'')+'>'+e4(lb)+'</option>'; }).join('')+'</select></span></label>'; }
function fX(f,i){ return edRO()?'<span></span>':'<button class="edx" data-del="'+f+':'+i+'" title="Remover">'+I('x',15)+'</button>'; }
function fAdd(f,txt){ return edRO()?'':'<button class="btn sm ol edadd" data-add="'+f+'">'+I('plus',14)+txt+'</button>'; }
function vazioL(t){ return '<div class="empty" style="padding:14px">'+t+'</div>'; }
function setPath(p,path,raw,t){ var a=path.split(':'), f=a[0], i=+a[1], k=a[2], v=(t==='n'||t==='m')?nparse(raw):raw;
 if(f==='p'){ if(k==='rendaApos'){ var sr=ev('setRendaApos'); if(sr) sr(p,v); else { var g=(p.goals||[]).filter(function(x){ return x.tipo==='renda'; })[0]; if(g) g.valor=v; else if(v){ (p.goals=p.goals||[]).push({desc:'Aposentadoria',tipo:'renda',idade:p.apos,valor:v}); } } }
  else if(k==='seguro'){ p.seguro=p.seguro||{}; p.seguro.atual=v; } else p[k]=v; return; }
 if(!p[f]||!p[f][i]) return; p[f][i][k]=v; }
var DEF={incomes:{desc:'',valor:0,freq:'Mensal',anos:0},expenses:{desc:'',valor:0,cat:'Custo de vida',freq:'Mensal',anos:0},assets:{desc:'',cat:'Renda Fixa',valor:0},debts:{desc:'',cat:'Financiamento',valor:0},
 consorcios:{desc:'Consórcio imobiliário',tipo:'Imóvel',credito:100000,prazoMeses:200,contemplaMes:12,uso:'rentabilizar',aluguel:0.8,modalidade:'meia',reajuste:5,parcela:0},goals:{desc:'',tipo:'meta',valor:0,idade:null}};
function edSalvar(){ var s=ED.el&&ED.el.querySelector('#edsv'); if(s){ s.classList.add('on'); s.lastChild.textContent='Salvando…'; }
 var ok=salvar(); clearTimeout(ED.salvoTm); ED.salvoTm=setTimeout(function(){ var s2=ED.el&&ED.el.querySelector('#edsv'); if(s2){ s2.classList.remove('on'); s2.lastChild.textContent=ok?'Salvo':'Não salvou'; } },700); return ok; }

/* gráfico de várias linhas (com × sem consórcio, comparação de cenários) */
function multiChart(idades,ser,apos){ var W=680,H=240,L=56,Rr=10,T=12,B=26,n=(idades||[]).length; if(!n) return vazioL('Sem dados para o gráfico.');
 var mx=0; ser.forEach(function(s){ (s.d||[]).forEach(function(v){ if(+v>mx) mx=+v; }); }); if(mx<=0) mx=1;
 var x=function(i){ return L+(W-L-Rr)*(n<2?0:i/(n-1)); }, y=function(v){ return T+(H-T-B)*(1-Math.max(0,+v||0)/mx); };
 var path=function(s){ return s.map(function(v,i){ return (i?'L':'M')+x(i).toFixed(1)+' '+y(v).toFixed(1); }).join(' '); };
 var gy=''; for(var k=0;k<=4;k++){ var vv=mx*k/4, yy=y(vv); gy+='<line x1="'+L+'" x2="'+(W-Rr)+'" y1="'+yy+'" y2="'+yy+'" stroke="var(--line)"/><text x="'+(L-8)+'" y="'+(yy+4)+'" text-anchor="end" font-size="10.5" fill="var(--mut)">'+eixoV(vv)+'</text>'; }
 var gx='', ps=Math.max(1,Math.round(n/7)); for(var i=0;i<n;i+=ps) gx+='<text x="'+x(i)+'" y="'+(H-6)+'" text-anchor="middle" font-size="10.5" fill="var(--mut)">'+idades[i]+'</text>';
 var ia=idades.indexOf(+apos), ap=ia>=0?'<line x1="'+x(ia)+'" x2="'+x(ia)+'" y1="'+T+'" y2="'+(H-B)+'" stroke="var(--gold)" stroke-dasharray="4 4" stroke-width="1.4"/>':'';
 var id='mc'+Math.random().toString(36).slice(2,8); MC[id]={idades:idades,ser:ser};
 var ar=ser.filter(function(s){ return s.area; }).map(function(s){ var gid=id+'g'; return '<defs><linearGradient id="'+gid+'" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="'+s.c+'" stop-opacity=".25"/><stop offset="1" stop-color="'+s.c+'" stop-opacity="0"/></linearGradient></defs><path class="plar" style="opacity:0;transition:opacity 1.2s .4s" fill="url(#'+gid+')" d="'+path(s.d)+' L'+x(n-1).toFixed(1)+' '+(H-B)+' L'+x(0).toFixed(1)+' '+(H-B)+' Z"/>'; }).join('');
 return '<div class="plchart" data-mc="'+id+'"><div class="plleg">'+ser.map(function(s){ return '<span><i style="background:'+s.c+'"></i>'+e4(s.n)+'</span>'; }).join('')+'</div><svg viewBox="0 0 '+W+' '+H+'">'+gy+gx+ar+
  ser.map(function(s){ return '<path d="'+path(s.d)+'" fill="none" stroke="'+s.c+'" stroke-width="'+(s.w||2.4)+'"'+(s.tr?' stroke-dasharray="5 5"':'')+' stroke-linejoin="round" class="plln"/>'; }).join('')+ap+
  '<line class="plcur" x1="0" x2="0" y1="'+T+'" y2="'+(H-B)+'" stroke="var(--mut)" stroke-width="1" style="opacity:0"/><rect class="plhit" x="'+L+'" y="'+T+'" width="'+(W-L-Rr)+'" height="'+(H-T-B)+'" fill="transparent"/></svg><div class="tip"></div></div>'; }

/* ---------- seções ---------- */
function eDados(X){ var p=X.p;
 return '<div class="panel rv mb"><div class="ph"><h3>'+I('users',18)+'Dados do cliente e premissas</h3></div><div class="edgrid">'+
  (p.main?'':fIn('p:0:titulo',p.titulo,{l:'Nome desta simulação'}))+
  fIn('p:0:nome',p.nome,{l:'Nome do cliente'})+fIn('p:0:idade',p.idade,{l:'Idade atual',t:'n',d:0,suf:'anos'})+fIn('p:0:apos',p.apos,{l:'Idade de aposentadoria',t:'n',d:0,suf:'anos'})+
  fIn('p:0:vida',p.vida,{l:'Expectativa de vida',t:'n',d:0,suf:'anos'})+fSel('p:0:perfil',p.perfil,['Conservador','Moderado','Arrojado'],{l:'Perfil de risco'})+fIn('p:0:rent',p.rent,{l:'Rentabilidade real',t:'n',d:2,suf:'% a.a.'})+
  fIn('p:0:rendaApos',rendaApos(p),{l:'Renda mensal desejada na aposentadoria',t:'m',ph:'Ex.: 12.000',w:'w2'})+'</div>'+
  '<p class="ednote">A rentabilidade real é o retorno acima da inflação. O perfil define a volatilidade usada nas simulações. A renda desejada é a mesma de Receitas & Despesas e do objetivo de renda em Objetivos.</p></div>'; }
function ePatrimonio(X){ var p=X.p,R=X.R,CORC=ev('COR_CLASSE')||{}, cats={}; (p.assets||[]).forEach(function(a){ cats[a.cat]=(cats[a.cat]||0)+(+a.valor||0); });
 var it=Object.keys(cats).filter(function(k){ return cats[k]>0; }).map(function(k){ return [k,cats[k],CORC[k]||'#6E8B88']; }), tot=it.reduce(function(s,x){ return s+x[1]; },0);
 var compo='<div class="panel rv"><div class="ph"><h3>'+I('layers',18)+'Composição</h3></div>'+(tot?'<div class="pldon">'+donutPct(it,'Hoje')+'</div>'+it.map(function(x){ return '<div class="plrow"><span><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:'+x[2]+';margin-right:8px"></span>'+e4(x[0])+'</span><b>'+Math.round(x[1]/tot*100)+'%</b></div>'; }).join(''):vazioL('Lance os ativos para ver a composição.'))+'</div>';
 return '<div class="panel rv mb"><div class="ph"><h3>'+I('wallet',18)+'Patrimônio investido</h3><span class="sp"></span><span class="pill">'+brl(R.patr)+'</span></div>'+
   ((p.assets||[]).length?'<div class="edhd c4"><span>Descrição</span><span>Classe</span><span>Valor</span><span></span></div>'+(p.assets||[]).map(function(a,i){ return '<div class="edrow c4">'+fIn('assets:'+i+':desc',a.desc,{l:'Descrição',ph:'Ex.: CDB banco X'})+fSel('assets:'+i+':cat',a.cat,CLASSES,{l:'Classe'})+fIn('assets:'+i+':valor',a.valor,{l:'Valor',t:'m'})+fX('assets',i)+'</div>'; }).join(''):vazioL('Nenhum ativo lançado.'))+fAdd('assets','Ativo')+'</div>'+
  '<div class="panel rv mb"><div class="ph"><h3>'+I('money',18)+'Dívidas e passivos</h3><span class="sp"></span><span class="pill">'+brl(R.passivos)+'</span></div>'+
   ((p.debts||[]).length?'<div class="edhd c4"><span>Descrição</span><span>Tipo</span><span>Saldo</span><span></span></div>'+(p.debts||[]).map(function(a,i){ return '<div class="edrow c4">'+fIn('debts:'+i+':desc',a.desc,{l:'Descrição',ph:'Ex.: Financiamento imóvel'})+fSel('debts:'+i+':cat',a.cat,DIVIDAS,{l:'Tipo'})+fIn('debts:'+i+':valor',a.valor,{l:'Saldo',t:'m'})+fX('debts',i)+'</div>'; }).join(''):vazioL('Nenhuma dívida lançada.'))+fAdd('debts','Dívida')+'</div>'+
  '<div class="g2">'+compo+'<div class="panel rv"><div class="ph"><h3>'+I('kpi',18)+'Balanço patrimonial</h3></div><div class="plrow"><span>Total de ativos</span><b>'+brl(R.patr)+'</b></div><div class="plrow"><span>Total de passivos (dívidas)</span><b>− '+brl(R.passivos)+'</b></div><div class="plrow"><span><b>Patrimônio líquido</b></span><b style="font-size:16px">'+brl(R.liquido)+'</b></div>'+
   (R.consCredito>0?'<div class="plrow"><span>+ Consórcio a contemplar (carta)</span><b style="color:var(--goldd)">'+brl(R.consCredito)+'</b></div>':'')+'</div></div>'; }
function eConsorcio(X){ var p=X.p,R=X.R, L=p.consorcios||[];
 var fee=function(co){ return co.tipo==='Auto'?0.16:0.22; };
 var cards=L.map(function(co,i){ var u=uso(co), pz=+co.prazoMeses||200, auto=(+co.credito||0)*(1+fee(co))/pz, pf='consorcios:'+i+':';
  return '<div class="edcons"><div class="top">'+fIn(pf+'desc',co.desc,{l:'Descrição',ph:'Ex.: Consórcio imobiliário'})+fSel(pf+'tipo',co.tipo||'Imóvel',['Imóvel','Auto'],{l:'Tipo'})+fIn(pf+'credito',co.credito,{l:'Crédito (carta)',t:'m'})+fX('consorcios',i)+'</div>'+
   '<div class="edgrid">'+fIn(pf+'prazoMeses',co.prazoMeses||200,{l:'Prazo',t:'n',d:0,suf:'meses'})+fIn(pf+'contemplaMes',co.contemplaMes||12,{l:'Contemplação prevista',t:'n',d:0,suf:'º mês'})+
    fIn(pf+'parcela',co.parcela,{l:'Parcela integral',t:'m',z:1,ph:'auto · '+nfmt(auto,0)})+fSel(pf+'modalidade',co.modalidade||'meia',[['meia','Meia parcela (50%)'],['p70','Parcela 70%'],['inteira','Parcela inteira']],{l:'Até a contemplação paga'})+
    fIn(pf+'reajuste',co.reajuste===undefined?5:co.reajuste,{l:'Reajuste anual',t:'n',d:2,suf:'% a.a.'})+fSel(pf+'uso',u,[['aquisicao','Aquisição: bem de uso próprio'],['rentabilizar','Rentabilizar: a carta rende no portfólio'],['expandir','Expandir: imóvel que gera aluguel'],['agio','Ágio: vender a carta contemplada']],{l:'Estratégia da carta',w:'w2'})+
    (u==='expandir'?fIn(pf+'aluguel',co.aluguel||0.8,{l:'Aluguel',t:'n',d:2,suf:'% ao mês'}):'')+(u==='agio'?fIn(pf+'agio',co.agio===undefined?20:co.agio,{l:'Ágio sobre a carta',t:'n',d:1,suf:'%'}):'')+
    fIn(pf+'lance',co.lance||0,{l:'Lance',t:'n',d:1,suf:'% do crédito'})+fSel(pf+'lanceTipo',co.lanceTipo||'proprio',[['proprio','Recurso próprio'],['embutido','Embutido (usa parte do crédito)']],{l:'Tipo de lance'})+'</div>'+
   '<div class="hint">'+[u==='aquisicao'?'Passivo: a parcela vira despesa e a carta não entra no patrimônio.':u==='agio'?'Na contemplação entra só o ágio; as parcelas param.':u==='expandir'?'Na contemplação a carta vira imóvel que gera aluguel.':'Na contemplação a carta entra no portfólio e passa a render.',
    (+co.lance||0)>0?(co.lanceTipo==='embutido'?'O crédito recebido cai '+nfmt(+co.lance,1)+'%':'O lance sai do bolso na contemplação')+' e a parcela restante cai na mesma proporção.':''].filter(Boolean).join(' ')+'</div></div>'; }).join('');
 var semC=clone(p); semC.consorcios=[]; var Rs=projeta(semC)||{}, lin=[6,12,24].map(function(m){ var c2=clone(p); (c2.consorcios||[]).forEach(function(x){ x.contemplaMes=m; }); return {m:m,R:projeta(c2)||{}}; });
 var dif=function(v){ var d=v-(Rs.patApos||0); return d>=0?'<span style="color:var(--ok)">+'+brl(d)+'</span>':'<span style="color:var(--bad)">'+brl(d)+'</span>'; };
 return '<div class="plhero rv"><p><b>O diferencial Agion:</b> consórcio + planejamento + consultoria. A carta de crédito entra como <b>patrimônio</b> na contemplação e é <b>capitalizada</b>, acelerando os objetivos sem os juros de um financiamento.</p></div>'+
  '<div class="plk"><div class="g"><small>Crédito (cartas)</small><b>'+brlK(R.consCredito)+'</b></div><div><small>Parcela até a contemplação</small><b>'+brl(R.consParcela)+'<em>/mês</em></b></div>'+
   (R.consAluguel>0?'<div class="g"><small>Aluguel gerado</small><b>'+brl(R.consAluguel)+'<em>/mês</em></b></div>':'<div><small>Patrimônio aos '+p.apos+'</small><b>'+brlK(R.patApos)+'</b></div>')+'<div><small>Probabilidade</small><b style="color:'+cor(R.prob)+'">'+R.prob+'%</b></div></div>'+
  '<div class="panel rv mb"><div class="ph"><h3>'+I('layers',18)+'Cartas de consórcio do plano</h3></div>'+(cards||vazioL('Nenhum consórcio no plano ainda.'))+fAdd('consorcios','Adicionar consórcio')+
   '<p class="ednote">Parcela integral padrão = crédito × (1 + taxa de administração) ÷ prazo (Imóvel 22% · Auto 16%). Preencha a parcela se tiver o valor exato do grupo. O reajuste anual atualiza carta e parcela. Depois da contemplação: parcela inteira, com as frações não pagas diluídas no prazo restante.</p></div>'+
  '<div class="panel rv mb"><div class="ph"><h3>'+I('trend',18)+'Patrimônio com × sem consórcio</h3></div>'+multiChart(R.idades||[],[{n:'Sem consórcio',c:'#7E9590',d:Rs.serie||[],tr:1,w:1.8},{n:'Com consórcio',c:'#C5A059',d:R.serie||[],area:1,w:2.8}],p.apos)+'</div>'+
  '<div class="panel rv"><div class="ph"><h3>'+I('spark',18)+'Impacto da contemplação (6 · 12 · 24 meses)</h3></div>'+(L.length?
   '<p style="font-size:13px;color:var(--ink2);line-height:1.6;margin-bottom:10px">A carta contemplada entra no patrimônio e passa a render junto com os investimentos. Veja o efeito de antecipar a contemplação por lance:</p><table class="pltab"><thead><tr><th>Cenário</th><th class="r">Patrimônio aos '+p.apos+'</th><th class="r">vs. sem consórcio</th><th class="r">Probabilidade</th></tr></thead><tbody>'+
   '<tr><td>Sem consórcio</td><td class="r">'+brl(Rs.patApos||0)+'</td><td class="r">—</td><td class="r">'+(Rs.prob||0)+'%</td></tr>'+lin.map(function(l){ return '<tr><td><b>Contemplação em '+l.m+' meses</b></td><td class="r"><b>'+brl(l.R.patApos||0)+'</b></td><td class="r">'+dif(l.R.patApos||0)+'</td><td class="r"><b style="color:'+cor(l.R.prob||0)+'">'+(l.R.prob||0)+'%</b></td></tr>'; }).join('')+'</tbody></table><p class="ednote">Quanto antes a contemplação (via lance), mais tempo a carta rende. O especialista combina os investimentos do cliente para potencializar o lance.</p>':vazioL('Inclua uma carta acima para ver o impacto da contemplação no patrimônio.'))+'</div>'; }
function linhasFluxo(f,lista,txt){ return ((lista||[]).length?'<div class="edhd c5"><span>Descrição</span><span>Valor</span><span>Frequência</span><span>Por quantos anos</span><span></span></div>'+lista.map(function(a,i){ return '<div class="edrow c5">'+fIn(f+':'+i+':desc',a.desc,{l:'Descrição',ph:'Descrição'})+fIn(f+':'+i+':valor',a.valor,{l:'Valor',t:'m'})+fSel(f+':'+i+':freq',a.freq||'Mensal',['Mensal','Anual'],{l:'Frequência'})+fIn(f+':'+i+':anos',a.anos,{l:'Por quantos anos',t:'n',d:0,z:1,ph:'sempre'})+fX(f,i)+'</div>'; }).join(''):vazioL('Nada lançado ainda.'))+fAdd(f,txt); }
function eFluxo(X){ var p=X.p,R=X.R, mx=Math.max(R.renda,R.desp,Math.max(0,R.sobra),1), ra=rendaApos(p);
 return '<div class="plk"><div class="g"><small>Receita média anual</small><b>'+brlK(R.rendaAnual)+'</b></div><div><small>Despesa média anual</small><b>'+brlK(R.despAnual)+'</b></div><div class="g"><small>Aporte médio anual</small><b>'+brlK(R.aporteAnual)+'</b></div><div><small>Taxa de poupança</small><b>'+R.poupanca+'%</b></div></div>'+
  '<div class="panel rv mb"><div class="ph"><h3>'+I('target',18)+'Renda desejada na aposentadoria</h3></div><div class="edgrid">'+fIn('p:0:rendaApos',ra,{l:'Quanto o cliente quer receber por mês depois de se aposentar',t:'m',ph:'Ex.: 12.000',w:'w2'})+
   '<div class="edf"><small>Equivale por ano</small><span class="edin"><input value="'+brl(ra*12)+'" disabled></span></div></div><p class="ednote">É a renda que o plano precisa sustentar dos '+p.apos+' aos '+p.vida+' anos.</p></div>'+
  '<div class="panel rv mb"><div class="ph"><h3>'+I('money',18)+'Receitas</h3><span class="sp"></span><span class="pill">'+brl(R.renda)+'/mês</span></div>'+linhasFluxo('incomes',p.incomes,'Receita')+'</div>'+
  '<div class="panel rv mb"><div class="ph"><h3>'+I('wallet',18)+'Despesas</h3><span class="sp"></span><span class="pill">'+brl(R.desp)+'/mês</span></div>'+linhasFluxo('expenses',p.expenses,'Despesa')+'</div>'+
  '<div class="panel rv"><div class="ph"><h3>'+I('kpi',18)+'Fluxo mensal</h3></div><div class="plflow">'+[['Receita',R.renda,'#6C9682'],['Despesa',R.desp,'#C2463B'],['Sobra',Math.max(0,R.sobra),'#C5A059']].map(function(b){ return '<div><b>'+brlK(b[1])+'</b><i style="height:'+Math.max(4,Math.round(b[1]/mx*150))+'px;background:'+b[2]+'"></i><small>'+b[0]+'</small></div>'; }).join('')+'</div></div>'; }
function eBalanco(X){ var R=X.R, B=R.balanco||[];
 return '<div class="panel rv"><div class="ph"><h3>'+I('list',18)+'Balanço financeiro ano a ano</h3><small>receita, despesa e saldo por idade, na acumulação e na aposentadoria</small></div>'+(B.length?
  '<div class="plscroll" style="max-height:560px"><table class="pltab"><thead><tr><th>Idade</th><th class="r">Receita</th><th class="r">Despesa</th><th class="r">Saldo</th><th class="r">Patrimônio</th></tr></thead><tbody>'+B.map(function(b){ return '<tr'+(+b.idade===+X.p.apos?' style="background:color-mix(in srgb,var(--gold2) 22%,transparent)"':'')+'><td>'+b.idade+(+b.idade===+X.p.apos?' <span class="pill">aposentadoria</span>':'')+'</td><td class="r">'+brl(b.receita)+'</td><td class="r">'+brl(b.despesa)+'</td><td class="r" style="color:'+(b.saldo>=0?'var(--ok)':'var(--bad)')+'">'+brl(b.saldo)+'</td><td class="r"><b>'+brl(b.patrimonio)+'</b></td></tr>'; }).join('')+'</tbody></table></div>':vazioL('Sem dados de balanço.'))+'</div>'; }
function eObjetivos(X){ var p=X.p, G=p.goals||[];
 return '<div class="panel rv"><div class="ph"><h3>'+I('target',18)+'Objetivos do cliente</h3></div>'+(G.length?'<div class="edhd c5"><span>Objetivo</span><span>Tipo</span><span>Valor</span><span>Idade-alvo</span><span></span></div>'+G.map(function(g,i){ return '<div class="edrow c5">'+fIn('goals:'+i+':desc',g.desc,{l:'Objetivo',ph:'Ex.: Aposentadoria'})+fSel('goals:'+i+':tipo',g.tipo||'meta',[['renda','Renda (mensal)'],['meta','Meta (pontual)']],{l:'Tipo'})+fIn('goals:'+i+':valor',g.valor,{l:g.tipo==='renda'?'Valor por mês':'Valor',t:'m'})+fIn('goals:'+i+':idade',g.idade||p.apos,{l:'Idade-alvo',t:'n',d:0,suf:'anos'})+fX('goals',i)+'</div>'; }).join(''):vazioL('Nenhum objetivo cadastrado.'))+fAdd('goals','Objetivo')+
  '<p class="ednote">Use “Renda (mensal)” para a aposentadoria e “Meta (pontual)” para um gasto numa idade específica (troca de carro, intercâmbio, entrada de imóvel).</p></div>'; }
function eProtecao(X){ var p=X.p,R=X.R, ok=R.seguroAtual>=R.seguroIdeal;
 return '<div class="g2"><div class="panel rv"><div class="ph"><h3>'+I('shield',18)+'Reserva de emergência</h3></div><div class="plrow"><span>Reserva ideal (6 meses de despesas)</span><b>'+brl(R.reservaIdeal)+'</b></div><div class="plrow"><span>Reserva atual (renda fixa)</span><b style="color:'+(R.reservaAtual>=R.reservaIdeal?'var(--ok)':'#C99A2E')+'">'+brl(R.reservaAtual)+'</b></div><div style="margin-top:10px">'+barra(pct(R.reservaAtual,R.reservaIdeal))+'</div>'+
   '<p class="ednote">'+(R.reservaAtual>=R.reservaIdeal?'Reserva completa.':'Faltam '+brl(Math.max(0,R.reservaIdeal-R.reservaAtual))+' para completar a reserva.')+'</p></div>'+
  '<div class="panel rv"><div class="ph"><h3>'+I('heart',18)+'Proteção da família (seguro de vida)</h3></div><p style="font-size:12.8px;color:var(--ink2);margin-bottom:8px">Regra Agion: cobertura sugerida de seguro de vida = <b>10% do patrimônio total</b> do cliente.</p><div class="plrow"><span>Cobertura sugerida</span><b>'+brl(R.seguroIdeal)+'</b></div>'+
   '<div class="edgrid" style="grid-template-columns:1fr;margin-top:10px">'+fIn('p:0:seguro',(p.seguro&&p.seguro.atual)||0,{l:'Cobertura atual de seguro',t:'m'})+'</div><p class="ednote" style="color:'+(ok?'var(--ok)':'#C99A2E')+'">'+(ok?'✓ Proteção adequada.':'Faltam '+brl(Math.max(0,R.seguroIdeal-R.seguroAtual))+' de cobertura.')+'</p></div></div>'; }
function eCenarios(X){ var rows=X.ps.map(function(q){ return {q:q,r:(q.id===X.p.id?X.R:projeta(q))||{}}; }), cols=['#C5A059','#3F8F6A','#5B8FB9','#C2463B','#8E6FB5','#7E9590'];
 return '<div class="panel rv mb"><div class="ph"><h3>'+I('layers',18)+'Plano Principal × simulações</h3><span class="sp"></span>'+(edRO()?'':'<button class="btn sm gd" data-nova="1">'+I('plus',14)+'Nova simulação</button>')+'</div>'+
  (X.ps.length<2?'<p style="font-size:13px;color:var(--mut);margin-bottom:12px">Ainda não há simulações. Crie uma cópia do plano para testar aposentar antes, aportar mais ou incluir outra carta, sem mexer no Plano Principal.</p>':'')+
  '<table class="pltab"><thead><tr><th>Cenário</th><th class="r">Aporte/mês</th><th class="r">Patrimônio na aposentadoria</th><th class="r">Meta (consumo)</th><th class="r">Prob.</th><th></th></tr></thead><tbody>'+rows.map(function(o){ return '<tr'+(o.q.id===X.p.id?' style="background:color-mix(in srgb,var(--gold2) 18%,transparent)"':'')+'><td>'+(o.q.main?'★ ':'')+e4(o.q.titulo||(o.q.main?'Plano Principal':'Simulação'))+'<div style="font-size:11.5px;color:var(--mut)">aposentar aos '+o.q.apos+'</div></td><td class="r">'+brl(o.r.sobra||0)+'</td><td class="r">'+brl(o.r.patApos||0)+'</td><td class="r">'+brl(o.r.alvoConsumo||0)+'</td><td class="r"><b style="color:'+cor(o.r.prob||0)+'">'+(o.r.prob||0)+'%</b></td>'+
   '<td class="r" style="white-space:nowrap">'+(o.q.id===X.p.id?'<span class="pill">aberto</span>':'<button class="btn sm ol" data-pl="'+o.q.id+'">Abrir</button>')+(!o.q.main&&!edRO()?' <button class="edx" style="display:inline-grid;vertical-align:middle" data-delpl="'+o.q.id+'" title="Excluir simulação">'+I('x',15)+'</button>':'')+'</td></tr>'; }).join('')+'</tbody></table></div>'+
  (rows.length>1?'<div class="panel rv"><div class="ph"><h3>'+I('trend',18)+'Projeção comparada</h3></div>'+multiChart((rows.reduce(function(a,o){ return (o.r.idades||[]).length>a.length?o.r.idades:a; },[])),rows.map(function(o,i){ return {n:(o.q.main?'★ ':'')+(o.q.titulo||'Plano'),c:cols[i%cols.length],d:o.r.serie||[],w:o.q.main?2.8:2}; }),X.mp.apos)+'</div>':''); }
function eAcao(X){ var p=X.p, ro=edRO(); try{ var f=ev('ensureSteps'); if(f) f(p); }catch(e){}
 var G=(p.goals||[]).slice().sort(function(a,b){ return (a.idade||p.apos)-(b.idade||p.apos); });
 var fases=[['Diagnóstico','raio-x financeiro de hoje'],['Reserva','6 meses de despesas'],['Acumulação','aporte mensal investido'],['Metas','objetivos do cliente'],['Independência','aos '+p.apos+' anos']];
 return '<div class="panel rv mb"><div class="ph"><h3>'+I('ladder',18)+'Plano de ação: etapas e metas</h3></div><div class="plroad">'+fases.map(function(f,i){ return '<div class="st'+(i===3?' on':'')+'"><span class="n">ETAPA '+(i+1)+'</span><b>'+f[0]+'</b><span>'+f[1]+'</span></div>'; }).join('')+'</div>'+
   (G.length?'<div class="lbl" style="margin-top:6px">Metas que se desdobram</div><div class="edchips">'+G.map(function(g){ return '<span><b>'+e4(g.desc||'Objetivo')+'</b>'+(g.tipo==='renda'?'Renda '+brl(g.valor)+'/mês':brl(g.valor))+' · aos '+(g.idade||p.apos)+'</span>'; }).join('')+'</div>':'')+'</div>'+
  '<div class="panel rv"><div class="ph"><h3>'+I('list',18)+'Passos por meta</h3>'+(ro?'':'<small>edite os passos de cada meta: o cliente vê isso na Jornada</small>')+'</div>'+(G.length?G.map(function(g,gi){ var ri=(p.goals||[]).indexOf(g);
   return '<div class="edgoal"><div class="dot">'+(gi+1)+'</div><div class="bx"><h4>'+e4(g.desc||'Objetivo')+'</h4><div class="w">'+(g.tipo==='renda'?'Renda / aposentadoria · '+brl(g.valor)+'/mês':'Meta · '+brl(g.valor))+' · aos '+(g.idade||p.apos)+' anos</div>'+
    (g.passos||[]).map(function(s,si){ return '<div class="edstep"><span class="n">'+(si+1)+'</span><span class="tx">'+e4(s)+'</span>'+(ro?'':'<button class="edx" data-step="'+ri+':'+si+'" title="Remover passo">'+I('x',13)+'</button>')+'</div>'; }).join('')+
    (ro?'':'<div class="edaddstep"><span class="edin"><input data-ns="'+ri+'" placeholder="Novo passo para esta meta…"></span><button class="btn sm gd" data-addstep="'+ri+'">'+I('plus',14)+'Passo</button></div>')+'</div></div>'; }).join(''):vazioL('Cadastre objetivos em Objetivos para montar o plano de ação.'))+'</div>'; }
function eSaque(R){ var tx=+R.taxaSaque||0; if(!R.saqueAnual) return ''; var mx=Math.max(8,Math.ceil(tx/2)*2+2), sf=4/mx*100, mk=Math.min(98,tx/mx*100), co=corSaque(tx);
 return '<div class="panel rv mb"><div class="ph"><h3>'+I('money',18)+'Taxa de saque na aposentadoria</h3></div><p style="font-size:13.2px;line-height:1.65;color:var(--ink2)">O plano retira <b>'+brl(R.saqueAnual/12)+'/mês</b> ('+brl(R.saqueAnual)+'/ano), o que equivale a <b style="color:'+co+'">'+tx.toFixed(1).replace('.',',')+'% do patrimônio por ano</b>. A referência de mercado para uma renda durar décadas é perto de <b>4% ao ano</b>.</p>'+
  '<div class="edsaq"><div class="z" style="width:'+sf+'%"></div><div class="m" style="left:'+mk+'%;background:'+co+'"></div><span style="left:8px;color:var(--ok)">ZONA SEGURA ≤ 4%</span><span style="left:calc('+mk+'% + 7px);color:'+co+'">'+tx.toFixed(1).replace('.',',')+'%</span></div>'+
  (tx>4.5?'<p class="ednote" style="color:'+co+'">A taxa está acima da zona segura, e esse é o principal motivo de a probabilidade ficar baixa. Reduzir a renda-alvo, aportar mais ou adiar a aposentadoria traz a taxa para perto de 4%.</p>':'')+'</div>'; }
function edSecao(X){ var k=ED.sec;
 if(k==='dados') return eDados(X); if(k==='patrimonio') return ePatrimonio(X); if(k==='consorcio') return eConsorcio(X); if(k==='fluxo') return eFluxo(X); if(k==='balanco') return eBalanco(X);
 if(k==='objetivos') return eObjetivos(X); if(k==='protecao') return eProtecao(X); if(k==='cenarios') return eCenarios(X); if(k==='acao') return eAcao(X);
 if(k==='projecao') return secao(X,'projecao').replace('<div class="panel rv"><div class="ph"><h3>'+I('list',18)+'Tabela da projeção','__SAQ__<div class="panel rv"><div class="ph"><h3>'+I('list',18)+'Tabela da projeção').replace('__SAQ__',eSaque(X.R));
 return secao(X,k); }
function edTopo(X){ var R=X.R||{}; return '<div><small>Probabilidade</small><b style="color:'+cor(R.prob||0)+'">'+(R.prob||0)+'%</b></div><div><small>Saúde financeira</small><b>'+(R.saude||0)+'<span style="font-size:12px;color:var(--mut)">/100</span></b></div><div><small>Patrimônio aos '+X.p.apos+'</small><b>'+brlK(R.patApos||0)+'</b></div><div><small>Aporte por mês</small><b>'+brlK(R.sobra||0)+'</b></div>'; }

/* ---------- montagem ---------- */
function edMonta(el,cid,o){ o=o||{}; ED.el=el; if(cid!==ED.cid){ ED.cid=cid; ED.pid=null; ED.sec='resumo'; } if(o.sec) ED.sec=o.sec; if(o.pid) ED.pid=o.pid;
 var X=edCtx(); if(!X){ el.innerHTML='<div class="empty">Cliente não encontrado.</div>'; return; }
 if(!X.p){ el.innerHTML='<div class="ph"><h3>'+I('target',18)+'Planejamento</h3></div><div class="empty">Este cliente ainda não tem plano.</div>'; return; }
 var ro=edRO(), p=X.p;
 el.innerHTML='<div class="edwrap"><div class="edhead"><h3 style="font:600 17px Lora,serif;display:flex;align-items:center;gap:8px">'+I('target',18)+'Planejamento financeiro</h3><span class="sp"></span>'+
   (ro?'<span class="pill">'+I('eye',12)+'somente leitura</span>':'<span class="edsv" id="edsv"><i></i><span>Salvo</span></span>')+
   '<button class="btn sm ol" id="edvc">'+I('eye',13)+'Ver como o cliente vê</button></div>'+
  '<div class="plplans" id="edpls">'+X.ps.map(function(q){ return '<button data-pl="'+q.id+'" class="'+(q.id===p.id?'on':'')+'">'+(q.main?'★ Plano Principal':e4(q.titulo||'Simulação'))+'</button>'; }).join('')+(ro?'':'<button data-nova="1" style="background:transparent;border:1px dashed var(--line)">'+I('plus',12)+' Nova simulação</button>')+'</div>'+
  '<div class="banner" id="edbn">'+I(p.main?'star':'copy',16)+'<span>'+(p.main?'Este é o <b>Plano Principal</b>. O que você muda aqui é salvo na hora e o cliente já vê a versão atualizada.':'Você está numa <b>simulação</b> ('+e4(p.titulo||'')+'). O Plano Principal continua intacto.')+'</span>'+(!p.main&&!ro?'<span class="sp" style="flex:1"></span><button class="btn sm ol" data-delpl="'+p.id+'">Excluir simulação</button>':'')+'</div>'+
  '<div class="edtop" id="edtop">'+edTopo(X)+'</div>'+
  '<div class="secn" id="edsecn">'+ESECS.map(function(s){ return '<button data-es="'+s[0]+'" class="'+(s[0]===ED.sec?'on':'')+'">'+s[1]+'</button>'; }).join('')+'</div><div id="edbody"></div>'+
  '<p class="pldisc">Valores estimados para planejamento, a partir das informações fornecidas. Não constituem garantia de rentabilidade nem recomendação de investimento.</p></div>';
 if(!el._edb){ el._edb=1; el.addEventListener('change',edMuda); el.addEventListener('click',edClique); el.addEventListener('keydown',function(e){ var t=e.target; if(e.key==='Enter'&&t&&t.dataset){ if(t.dataset.ns!=null){ e.preventDefault(); edPasso(+t.dataset.ns); } else if(t.dataset.p){ e.preventDefault(); t.blur(); } } }); }
 edPinta(true); }
function edPinta(anim){ var el=ED.el; if(!el) return; var b=el.querySelector('#edbody'); if(!b) return; var X=edCtx(); if(!X||!X.p) return;
 var fp=null; try{ var fa=document.activeElement; if(fa&&el.contains(fa)&&fa.dataset) fp=fa.dataset.p||(fa.dataset.ns!=null?'ns:'+fa.dataset.ns:null); }catch(e){}
 NOANIM=!anim; b.innerHTML=edSecao(X); var tp=el.querySelector('#edtop'); if(tp){ tp.innerHTML=edTopo(X); tp.style.display=ED.sec==='resumo'?'none':''; }
 if(anim){ b.style.opacity=0; b.style.transform='translateY(8px)'; requestAnimationFrame(function(){ b.style.transition='opacity .4s var(--ez),transform .5s var(--ez)'; b.style.opacity=1; b.style.transform='none'; }); }
 ligaChart(b,X.R); if(anim){ anima(b); } else { $$('.plbar i,.plcota .pb i',b).forEach(function(i){ i.style.transition='none'; i.style.transform='scaleX('+(i.dataset.p||0)+')'; }); $$('.plflow i',b).forEach(function(i){ i.style.transition='none'; i.style.transform='scaleY(1)'; }); $$('.plga',b).forEach(function(g){ g.setAttribute('stroke-dasharray',g.dataset.l+' '+g.dataset.c); }); $$('.plar',b).forEach(function(a){ a.style.transition='none'; a.style.opacity=1; }); }
 if(anim){ if(typeof reveal==='function') reveal(b); } else { $$('.rv',b).forEach(function(r){ r.classList.remove('rv'); }); }
 if(ED.sec==='projecao') ligaSim(b,X); NOANIM=false;
 if(fp){ var n=fp.indexOf('ns:')===0?b.querySelector('[data-ns="'+fp.slice(3)+'"]'):b.querySelector('[data-p="'+fp+'"]'); if(n&&!n.disabled){ try{ n.focus({preventScroll:true}); if(n.setSelectionRange&&n.type!=='select-one') n.setSelectionRange(n.value.length,n.value.length); }catch(e){} } } }
function edMuda(e){ var t=e.target; if(!t||!t.dataset||!t.dataset.p||edRO()) return; var X=edCtx(); if(!X||!X.p) return;
 setPath(X.p,t.dataset.p,t.value,t.dataset.t); edSalvar(); setTimeout(function(){ edPinta(false); },0); }
function edClique(e){ var t=e.target.closest?e.target.closest('button'):null; if(!t||!ED.el.contains(t)) return; var X=edCtx(); if(!X) return; var d=t.dataset;
 if(d.es){ ED.sec=d.es; $$('#edsecn button',ED.el).forEach(function(x){ x.classList.toggle('on',x===t); }); edPinta(true); return; }
 if(d.pl){ ED.pid=d.pl; edMonta(ED.el,ED.cid); return; }
 if(t.id==='edvc'){ go('meuplano',{cid:X.c.id,aba:'inicio'}); return; }
 if(edRO()){ return; }
 if(d.nova){ edNova(X); return; }
 if(d.delpl){ edExcluiPlano(X,d.delpl); return; }
 if(d.add){ var p=X.p; if(!Array.isArray(p[d.add])) p[d.add]=[]; var nv=JSON.parse(JSON.stringify(DEF[d.add]||{})); if(d.add==='goals') nv.idade=p.apos; p[d.add].push(nv); edSalvar(); edPinta(false);
  setTimeout(function(){ var ns=ED.el.querySelectorAll('[data-p^="'+d.add+':'+(p[d.add].length-1)+':"]'); if(ns[0]) try{ ns[0].focus(); }catch(_){} },30); return; }
 if(d.del){ var a=d.del.split(':'), arr=X.p[a[0]]; if(!arr) return; var rem=arr.splice(+a[1],1)[0]; edSalvar(); edPinta(false);
  toast('Item removido','x'); return; }
 if(d.addstep!=null){ edPasso(+d.addstep); return; }
 if(d.step){ var s=d.step.split(':'), g=(X.p.goals||[])[+s[0]]; if(g&&g.passos){ g.passos.splice(+s[1],1); edSalvar(); edPinta(false); } return; } }
function edPasso(gi){ var X=edCtx(); if(!X||edRO()) return; var inp=ED.el.querySelector('[data-ns="'+gi+'"]'), v=inp?inp.value.trim():''; if(!v) return; var g=(X.p.goals||[])[gi]; if(!g) return; (g.passos=g.passos||[]).push(v); edSalvar(); edPinta(false); var n=ED.el.querySelector('[data-ns="'+gi+'"]'); if(n) try{ n.focus(); }catch(e){} }
function edNova(X){ var sug='Simulação '+(X.ps.filter(function(q){ return !q.main; }).length+1);
 perguntar('Nova simulação','Cria uma cópia editável do plano aberto. O Plano Principal é sempre preservado.',sug,'Criar',sug).then(function(nome){ if(nome===null||nome===undefined) return;
  var cp=JSON.parse(JSON.stringify(X.p)), uid=ev('uuid'); cp.id=uid?uid():('s'+Date.now()); cp.main=false; cp.parent=X.p.id; cp.titulo=(String(nome).trim()||sug); cp.criadoEm=Date.now();
  X.c.plans.push(cp); try{ var lg=ev('logEvt'); if(lg) lg('plano_copiar','planos','Criou simulação "'+cp.titulo+'"'); }catch(e){}
  if(edSalvar()){ toast('Simulação criada · o Plano Principal continua igual','copy'); ED.pid=cp.id; edMonta(ED.el,ED.cid); } }); }
function edExcluiPlano(X,pid){ var q=X.ps.filter(function(x){ return x.id===pid; })[0]; if(!q||q.main) return;
 confirma('Excluir “'+(q.titulo||'Simulação')+'”?','O Plano Principal não é afetado.','Excluir').then(function(ok){ if(!ok) return; X.c.plans=X.c.plans.filter(function(x){ return x.id!==pid; }); if(ED.pid===pid) ED.pid=null; if(edSalvar()){ toast('Simulação excluída','ok'); edMonta(ED.el,ED.cid); } }); }

/* liga o botão de WhatsApp das abas Minha cota e Início */
var _co=corpo; corpo=function(){ _co(); var b=$('#plbody'); if(b) $$('[data-wa]',b).forEach(function(x){ if(!x._w){ x._w=1; x.onclick=function(){ falarEspecialista(); }; } }); };
window.AGPlano={abrir:function(cid,aba){ go('meuplano',{cid:cid,aba:aba||'inicio'}); },
 editor:function(el,cid,o){ edMonta(el,cid,o); },
 secao:function(cid,sec){ if(cid!==ED.cid){ ED.cid=cid; ED.pid=null; } ED.sec=sec||'resumo'; }};
})();
