/* ==========================================================================
   Agion — plat-motion-2.js · complementa plat-motion.css / plat-motion-hook.js
   1. Indicador deslizante de seleção: menu lateral, barra inferior do app, subabas
      (.subnav, .tabs, .cms-tabs, #mktNav, .kc-bar). A pílula "lembra" a posição anterior
      e desliza até o item selecionado, mesmo quando a tela é reconstruída por innerHTML.
   3. Entrada discreta só do que entra na região visível (IntersectionObserver) em listas longas.
   Nunca altera comportamento funcional. Respeita prefers-reduced-motion.
   ========================================================================== */
(function(w,d){
'use strict';
if(!w||!d||w.__agionMotion2) return; w.__agionMotion2=1;
var reduce=false; try{ reduce=!!(w.matchMedia&&w.matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){}
var raf=function(f){ if(d.hidden||!w.requestAnimationFrame) return setTimeout(f,16); return w.requestAnimationFrame(f); };
function $$(s,r){ try{ return [].slice.call((r||d).querySelectorAll(s)); }catch(e){ return []; } }

/* ---------- 1. indicador deslizante ---------- */
var GROUPS=['#navi','#mobnav','#content .subnav','#content .tabs','#content .cms-tabs','#mktNav','#content .kc-bar .cms-tabs'];
var last={};                       // chave do grupo -> {x,y,w,h} do último item selecionado
function key(g){ var p=g.id?('#'+g.id):g.className.split(' ')[0]; var all=$$(GROUPS.join(','),d); var idx=0; for(var i=0;i<all.length;i++){ if(all[i]===g) break; if((all[i].id?('#'+all[i].id):all[i].className.split(' ')[0])===p) idx++; } return p+':'+idx+':'+(w.view&&w.view.page||''); }
function rectIn(g,el){ var a=g.getBoundingClientRect(), b=el.getBoundingClientRect(); return {x:b.left-a.left+g.scrollLeft,y:b.top-a.top+g.scrollTop,w:b.width,h:b.height}; }
function paint(g){
  if(!g||!g.isConnected) return;
  var on=g.querySelector(':scope > .on, :scope > a.on, :scope > button.on'); if(!on) on=g.querySelector('.on');
  var ind=g.querySelector(':scope > .m-ind');
  if(!on){ if(ind) ind.remove(); g.classList.remove('has-ind'); return; }
  var gr=g.getBoundingClientRect(); if(gr.width<2||gr.height<2){ if(ind) ind.remove(); return; }
  var cs=getComputedStyle(g); if(cs.position==='static') g.style.position='relative';
  g.classList.add('has-ind');
  var r=rectIn(g,on), k=key(g), prev=last[k];
  if(!ind){ ind=d.createElement('i'); ind.className='m-ind'; ind.setAttribute('aria-hidden','true'); g.insertBefore(ind,g.firstChild); }
  var put=function(q,anim){ ind.style.transition=anim?'':'none'; ind.style.transform='translate('+q.x+'px,'+q.y+'px)'; ind.style.width=q.w+'px'; ind.style.height=q.h+'px'; };
  if(prev&&!reduce&&(prev.x!==r.x||prev.y!==r.y||prev.w!==r.w)){ put(prev,false); void ind.offsetWidth; raf(function(){ put(r,true); }); }
  else put(r,false);
  last[k]=r;
}
function paintAll(){ $$(GROUPS.join(',')).forEach(paint); }
var pending=false; function sched(){ if(pending) return; pending=true; raf(function(){ pending=false; paintAll(); }); }
// cliques dentro dos grupos: a classe .on muda depois do handler → repinta no próximo frame
d.addEventListener('click',function(e){ var g=e.target&&e.target.closest&&e.target.closest(GROUPS.join(',')); if(g) setTimeout(sched,0); },true);
w.addEventListener('resize',sched);
d.addEventListener('scroll',function(e){ var t=e.target; if(t&&t.matches&&t.matches(GROUPS.join(','))) sched(); },true);
w.addEventListener('load',function(){ setTimeout(sched,300); });
// fontes carregando mudam largura dos itens
if(d.fonts&&d.fonts.ready) d.fonts.ready.then(sched);

/* (fechamento animado de modais foi deixado de fora de propósito: não mexer no estado hidden dos modais existentes) */

/* ---------- 3. entrada só do que aparece (listas longas) ---------- */
var IO=null;
function watchCards(){
  if(!w.IntersectionObserver||reduce) return;
  if(!IO) IO=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('io-in'); IO.unobserve(e.target); } }); },{rootMargin:'0px 0px -6% 0px',threshold:.08});
  var c=d.getElementById('content'); if(!c) return;
  // só itens além do 8º de cada lista (os primeiros já entram em cascata pelo hook)
  ['.cards>.ccard','#cadList>*'].forEach(function(sel){ $$(sel,c).forEach(function(el,i){ if(i<8||el.classList.contains('io-in')||el.classList.contains('io-wait')) return; var r=el.getBoundingClientRect(); if(r.top<w.innerHeight){ el.classList.add('io-in'); return; } el.classList.add('io-wait'); IO.observe(el); }); });
}

/* ---------- integração ---------- */
function wrap(name,after){ var tries=0; (function go(){ var o=w[name]; if(typeof o!=='function'){ if(++tries<200) setTimeout(go,50); return; } if(o.__m2) return;
  var f=function(){ var r=o.apply(this,arguments); try{ after(); }catch(e){} return r; }; f.__m2=1; w[name]=f; })(); }
wrap('render',function(){ sched(); setTimeout(watchCards,60); setTimeout(sched,450); setTimeout(function(){ $$('.io-wait:not(.io-in)').forEach(function(el){ el.classList.add('io-in'); }); },1800); });
wrap('renderNav',sched);
wrap('setTop',sched);
function boot(){ sched(); }
if(d.readyState==='loading') d.addEventListener('DOMContentLoaded',boot); else boot();
})(window,document);
