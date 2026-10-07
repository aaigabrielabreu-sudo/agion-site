/* ==========================================================================
   Agion Wealth — plat-motion-hook.js
   Gancho não-invasivo para plat-motion.css. ES5, IIFE, sem dependências.
   Carregar DEPOIS do script principal (window.render precisa existir) — ou antes:
   se render ainda não existir, aguarda e envolve quando aparecer.
   Faz três coisas e nada mais:
     1. após cada render(): #content.is-entering (removida ao fim da cascata);
     2. após cada render(): --i (0..7) nos filhos dos contêineres em cascata;
     3. quando a soma dos badges em #bellWrap aumenta: #bellWrap.bell-ring (uma vez).
   Nunca altera comportamento funcional; se os elementos não existirem, não faz nada.
   ========================================================================== */
(function (w, d) {
  'use strict';
  if (!w || !d || w.__agionMotionHook) return;
  w.__agionMotionHook = true;

  var MAX_I = 7;                 // DESIGN §3.2b: cascata até 8 itens
  var DUR_ENTER_MS = 320;        // --dur-3
  var STAGGER_MS = 40;           // --stagger
  var ENTER_TOTAL = DUR_ENTER_MS + MAX_I * STAGGER_MS + 60; // ~660 ms de folga
  var RING_MS = 600;             // bell-ring

  var reduce = false;
  try {
    reduce = !!(w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (e) {}

  function byId(id) { try { return d.getElementById(id); } catch (e) { return null; } }
  function qsa(root, sel) {
    try { return root ? root.querySelectorAll(sel) : []; } catch (e) { return []; }
  }
  var raf = w.requestAnimationFrame || function (fn) { return w.setTimeout(fn, 16); };

  /* ---------- 2. stagger: --i nos filhos ---------- */
  var CASCADE_CONTAINERS = ['.kpis', '.cms-kts', '.cards', '.cms-ag', '.kbody', '.cms-wrap'];

  function setIndexes(parent) {
    if (!parent || !parent.children) return;
    var kids = parent.children, i, n = kids.length, k;
    for (i = 0; i < n; i++) {
      k = kids[i];
      if (!k || !k.style || !k.style.setProperty) continue;
      try { k.style.setProperty('--i', String(i < MAX_I ? i : MAX_I)); } catch (e) {}
    }
  }

  function applyStagger(content) {
    if (!content) return;
    setIndexes(content);                                  // filhos diretos (.panel, .kpis, ...)
    var all = qsa(content, CASCADE_CONTAINERS.join(',')), i;
    for (i = 0; i < all.length; i++) setIndexes(all[i]);
    /* .cms-card não tem contêiner fixo: indexa pela ordem dentro do pai */
    var cards = qsa(content, '.cms-card'), seen = [], j, p;
    for (i = 0; i < cards.length; i++) {
      p = cards[i].parentNode;
      if (!p) continue;
      for (j = 0; j < seen.length; j++) if (seen[j] === p) break;
      if (j === seen.length) { seen.push(p); setIndexes(p); }
    }
  }

  /* ---------- 1. is-entering ---------- */
  var enterTimer = null;
  var enterStart = 0;

  function clearEntering(content) {
    if (enterTimer) { w.clearTimeout(enterTimer); enterTimer = null; }
    if (content && content.classList) content.classList.remove('is-entering');
  }

  function onAnimEnd(ev) {
    var content = byId('content');
    if (!content || !ev || ev.animationName !== 'page-in') return;
    /* só encerra quando a cascata inteira teve tempo de terminar;
       remover antes congelaria os itens ainda em voo no estado final (salto) */
    var elapsed = (new Date()).getTime() - enterStart;
    if (elapsed >= ENTER_TOTAL - 30) clearEntering(content);
  }

  function enter(content) {
    if (!content || !content.classList) return;
    clearEntering(content);
    if (reduce) return;                                   // CSS já neutraliza; evita trabalho
    applyStagger(content);
    raf(function () {
      if (!content.classList) return;
      content.classList.add('is-entering');
      enterStart = (new Date()).getTime();
      enterTimer = w.setTimeout(function () { clearEntering(content); }, ENTER_TOTAL);
    });
  }

  var animEndBound = false;
  function bindAnimEnd() {
    if (animEndBound) return;
    var content = byId('content');
    if (!content || !content.addEventListener) return;
    content.addEventListener('animationend', onAnimEnd, false);
    animEndBound = true;
  }

  /* ---------- wrap de window.render ---------- */
  var wrapped = false;
  function wrapRender() {
    if (wrapped) return true;
    var orig = w.render;
    if (typeof orig !== 'function') return false;
    var fn = function () {
      var r;
      try { r = orig.apply(this, arguments); }
      finally {
        try { bindAnimEnd(); enter(byId('content')); } catch (e) {}
      }
      return r;
    };
    fn.__agionWrapped = true;
    try { w.render = fn; } catch (e) { return false; }
    wrapped = true;
    return true;
  }

  if (!wrapRender()) {
    /* script carregado antes do app: tenta de novo até render existir (máx. ~10 s) */
    var tries = 0, poll = w.setInterval(function () {
      if (wrapRender() || ++tries > 200) w.clearInterval(poll);
    }, 50);
  }

  /* ---------- 3. sininho: bell-ring quando o badge sobe ---------- */
  function badgeTotal(wrap) {
    var badges = qsa(wrap, '.badge'), total = 0, i, t, n;
    for (i = 0; i < badges.length; i++) {
      t = (badges[i].textContent || '').replace(/\s/g, '');
      n = parseInt(t, 10);
      if (isNaN(n)) n = /\+$/.test(t) ? 10 : (t ? 1 : 0);
      total += n;
    }
    return total;
  }

  var ringTimer = null;
  function ring(wrap) {
    if (!wrap || !wrap.classList || reduce) return;
    wrap.classList.remove('bell-ring');
    raf(function () {
      if (!wrap.classList) return;
      wrap.classList.add('bell-ring');
      if (ringTimer) w.clearTimeout(ringTimer);
      ringTimer = w.setTimeout(function () { wrap.classList.remove('bell-ring'); }, RING_MS + 100);
    });
  }

  function watchBell() {
    var wrap = byId('bellWrap');
    if (!wrap || !w.MutationObserver) return false;
    var last = badgeTotal(wrap);
    var pending = false;
    var mo = new w.MutationObserver(function () {
      if (pending) return;
      pending = true;
      raf(function () {
        pending = false;
        var now = badgeTotal(wrap);
        if (now > last) ring(wrap);
        last = now;
      });
    });
    try {
      mo.observe(wrap, { childList: true, subtree: true, characterData: true });
    } catch (e) { return false; }
    wrap.addEventListener('animationend', function (ev) {
      if (ev && ev.animationName === 'bell-ring') wrap.classList.remove('bell-ring');
    }, false);
    return true;
  }

  function boot() {
    bindAnimEnd();
    if (!watchBell()) {
      var t = 0, p = w.setInterval(function () { if (watchBell() || ++t > 100) w.clearInterval(p); }, 100);
    }
  }
  if (d.readyState === 'loading' && d.addEventListener) {
    d.addEventListener('DOMContentLoaded', boot, false);
  } else {
    boot();
  }
})(typeof window !== 'undefined' ? window : null, typeof document !== 'undefined' ? document : null);
