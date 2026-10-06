/* Progressive enhancement: motion nativo, sem rede ou conteúdo novo. */
(() => {
 'use strict';
 const root = document.documentElement;
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const ease = 'cubic-bezier(.16,1,.3,1)';
 const resets = [];
 const scrollUpdates = [];
 const targets = [];
 let observer;
 let frame = 0;
 const clamp = value => Math.min(1, Math.max(0, value));
 // Nunca selecionar tela, ancestral dela, ou parte da identidade.
 const safeTarget = element => element instanceof Element && element !== root && element !== document.body && !element.closest('.plat,.dev,.brand') && !element.querySelector('.dev,.brand');
 const onChange = (query, callback) => {
  if (query.addEventListener) query.addEventListener('change', callback);
  else if (query.addListener) query.addListener(callback);
 };
 const reveal = (element, immediate = false) => {
  if (immediate) element.classList.add('ag-immediate');
  element.classList.add('ag-in');
  if (observer) observer.unobserve(element);
 };
 const revealAll = () => targets.forEach(element => reveal(element, true));
 const normalize = path => path.replace(/\.html$/, '').replace(/\/index$/, '/').replace(/\/$/, '') || '/';
 const requestUpdate = () => {
  if (frame) return;
  frame = requestAnimationFrame(() => {
   frame = 0;
   scrollUpdates.forEach(update => { try { update(); } catch (_) {} });
  });
 };
 function navigation() {
  const activePath = normalize(location.pathname);
  document.querySelectorAll('.nav a[href],.quicknav a[href]').forEach(link => {
   const url = new URL(link.href, location.href);
   if (!link.closest('.brand') && url.origin === location.origin && normalize(url.pathname) === activePath) link.setAttribute('aria-current', 'page');
  });
  const nav = document.querySelector('.nav');
  if (nav) scrollUpdates.push(() => {
   nav.classList.toggle('ag-scrolled', scrollY > 32);
   const scrollable = root.scrollHeight - innerHeight;
   nav.style.setProperty('--ag-reading-progress', String(scrollable > 0 ? clamp(scrollY / scrollable) : 0));
  });
  // Navegação nativa exige adesão dos dois documentos. Planejamento nunca adere.
  if (!document.querySelector('.plat,.dev') && 'startViewTransition' in document && CSS.supports('view-transition-name', 'agion-header')) {
   const style = document.createElement('style');
   style.textContent = '@media(prefers-reduced-motion:no-preference){@view-transition{navigation:auto}}';
   document.head.append(style);
  }
 }
 function reveals() {
  if (!('IntersectionObserver' in window) || !CSS.supports('translate', '0 1px')) return;
  observer = new IntersectionObserver(entries => {
   entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
  }, { threshold: 0, rootMargin: '0px 0px 100px 0px' });
  const selector = [
   '.sec-head','.card','.pill','.step','.bcard','.ccard','.cmp','.dcard',
   '.bpost','.ctaband .wrap','.about .wrap>div:not(.pillars)',
   '.vals>.val','.estrats>.estrat','.art-head','.artbody>h2','.artbody>h3',
   '.article>h2','.related','.faqwrap'
  ].join(',');
  const siblingRows = new Map();
  Array.from(document.querySelectorAll(selector)).filter(safeTarget).forEach(element => {
   if (element.parentElement.closest('.ag-reveal')) return;
   const rect = element.getBoundingClientRect();
   const top = Math.round(rect.top + scrollY);
   let rows = siblingRows.get(element.parentElement);
   if (!rows) { rows = new Map(); siblingRows.set(element.parentElement, rows); }
   const rowKey = Math.round(top / 8) * 8;
   const count = rows.get(rowKey) || 0;
   rows.set(rowKey, count + 1);
   element.style.setProperty('--ag-delay', `${Math.min(count * 90, 270)}ms`);
   element.classList.add('ag-reveal');
   targets.push(element);
   // Conteúdo já visível nunca é ocultado, inclusive em hash e restauração.
   if (reduced.matches || rect.top < innerHeight + 32 || rect.bottom <= 0) reveal(element, true);
   else observer.observe(element);
  });
  root.classList.add('ag-motion-ready');
  document.addEventListener('focusin', event => {
   let element = event.target.closest('.ag-reveal');
   while (element) { reveal(element, true); element = element.parentElement.closest('.ag-reveal'); }
  });
  const revealHash = () => {
   if (!location.hash) return;
   let target;
   try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (_) { return; }
   if (!target) return;
   targets.forEach(element => { if (element.contains(target) || target.contains(element) || element === target) reveal(element, true); });
  };
  revealHash();
  addEventListener('hashchange', revealHash);
  addEventListener('keydown', event => {
   if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') revealAll();
  });
  addEventListener('beforeprint', revealAll);
  addEventListener('pageshow', event => { if (event.persisted) revealAll(); });
 }
 function actions() {
  document.querySelectorAll('.card,.ccard,.bpost,.estrat').forEach(element => {
   if (safeTarget(element) && (element.matches('a[href],button') || element.querySelector('a[href],button'))) element.classList.add('ag-interactive');
  });
  document.querySelectorAll('.btn').forEach(element => {
   if (!safeTarget(element)) return;
   element.classList.add('ag-action');
   if (element.matches('.btn-gold,.cards3>.card .btn,.ccards>.ccard .btn')) element.classList.add('ag-gold-action');
  });
  const pressed = new Map();
  const release = element => {
   if (!pressed.has(element)) return;
   clearTimeout(pressed.get(element));
   element.classList.remove('ag-press');
   pressed.delete(element);
  };
  const press = element => {
   if (!element || reduced.matches) return;
   clearTimeout(pressed.get(element));
   element.classList.add('ag-press');
   pressed.set(element, setTimeout(() => release(element), 1200));
  };
  const releaseAll = () => Array.from(pressed.keys()).forEach(release);
  document.addEventListener('pointerdown', event => {
   if (event.button === 0) press(event.target.closest('.ag-action'));
  }, { passive: true });
  addEventListener('pointerup', releaseAll, { passive: true });
  addEventListener('pointercancel', releaseAll, { passive: true });
  addEventListener('blur', releaseAll);
  document.addEventListener('keydown', event => {
   const element = event.target.closest('.ag-action');
   if (element && !event.repeat && (event.key === 'Enter' || (event.key === ' ' && element.matches('button,input')))) press(element);
  });
  document.addEventListener('keyup', event => { if (event.key === 'Enter' || event.key === ' ') releaseAll(); });
  document.addEventListener('focusout', event => { if (event.target.matches('.ag-action')) release(event.target); });
  resets.push(releaseAll);
 }
 function steps() {
  const groups = Array.from(document.querySelectorAll('.steps')).filter(safeTarget).map(group => {
   const items = Array.from(group.querySelectorAll(':scope>.step')).filter(safeTarget);
   group.classList.add('ag-step-progress');
   return { group, items, rows: [] };
  });
  if (!groups.length) return;
  const layoutTop = element => {
   let top = 0;
   for (let node = element; node; node = node.offsetParent) top += node.offsetTop;
   return top;
  };
  const measure = () => {
   groups.forEach(state => {
    const base = layoutTop(state.group);
    state.rows = [];
    state.items.forEach(item => {
     const offset = layoutTop(item) - base;
     let row = state.rows.find(candidate => Math.abs(candidate.offset - offset) < 4);
     if (!row) { row = { offset, height: item.offsetHeight, items: [] }; state.rows.push(row); }
     row.height = Math.max(row.height, item.offsetHeight);
     row.items.push(item);
    });
   });
   requestUpdate();
  };
  const update = () => groups.forEach(state => {
   const groupTop = state.group.getBoundingClientRect().top;
   state.rows.forEach(row => {
    const progress = clamp((innerHeight * .9 - groupTop - row.offset) / (innerHeight * .62 + row.height * .2));
    row.items.forEach((item, index) => {
     const phase = reduced.matches ? 1 : clamp(progress * row.items.length - index);
     const value = phase.toFixed(3);
     if (item.style.getPropertyValue('--ag-step-progress') !== value) item.style.setProperty('--ag-step-progress', value);
     item.classList.toggle('ag-step-active', phase > .02 && phase < .995);
     item.classList.toggle('ag-step-complete', phase >= .995);
    });
   });
  });
  scrollUpdates.push(update);
  measure();
  addEventListener('resize', measure, { passive: true });
  if ('ResizeObserver' in window) {
   const resize = new ResizeObserver(measure);
   groups.forEach(state => resize.observe(state.group));
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure).catch(() => {});
  resets.push(update);
 }
 function reading() {
  const toc = document.querySelector('.toc');
  if (!toc || !safeTarget(toc)) return;
  const sections = Array.from(toc.querySelectorAll('a[href]')).map(link => {
   const url = new URL(link.href, location.href);
   let heading;
   try { heading = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch (_) {}
   return url.origin === location.origin && normalize(url.pathname) === normalize(location.pathname) && url.hash && heading && safeTarget(heading) ? { link, heading } : null;
  }).filter(Boolean);
  if (!sections.length) return;
  let current;
  const update = () => {
   const nav = document.querySelector('.nav');
   const line = Math.max(nav ? nav.getBoundingClientRect().bottom + 24 : 0, innerHeight * .3);
   let active = sections[0];
   sections.forEach(section => { if (section.heading.getBoundingClientRect().top <= line) active = section; });
   if (active === current) return;
   sections.forEach(section => {
    if (section === active) section.link.setAttribute('aria-current', 'location');
    else section.link.removeAttribute('aria-current');
   });
   current = active;
  };
  scrollUpdates.push(update);
  if ('IntersectionObserver' in window) {
   const readingObserver = new IntersectionObserver(requestUpdate, { rootMargin: '-20% 0px -55% 0px' });
   sections.forEach(section => readingObserver.observe(section.heading));
  }
 }
 function mobileMenu() {
  const button = document.querySelector('.nav-burger');
  const menu = document.getElementById('navMobile');
  if (!button || !menu) return;
  let animation;
  let height = 0;
  let previouslyOpen = menu.classList.contains('open');
  button.setAttribute('aria-controls', menu.id);
  menu.querySelectorAll('a').forEach((link, index) => link.style.setProperty('--ag-menu-delay', `${Math.min(index * 32, 224)}ms`));
  const resetStyles = () => {
   if (animation) { animation.cancel(); animation = null; }
   menu.style.removeProperty('height');
   menu.style.removeProperty('overflow');
   menu.style.removeProperty('display');
  };
  const sync = () => {
   const open = menu.classList.contains('open');
   resetStyles();
   button.setAttribute('aria-expanded', String(open));
   button.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
   menu.setAttribute('aria-hidden', String(!open));
   menu.inert = !open;
   if (open) height = menu.getBoundingClientRect().height;
   if (!open && previouslyOpen && !reduced.matches && menu.animate && height > 0) {
    menu.style.display = 'flex';
    menu.style.overflow = 'hidden';
    animation = menu.animate([{ height: `${height}px`, opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 300, easing: ease });
    animation.onfinish = resetStyles;
   }
   previouslyOpen = open;
  };
  // O onclick original controla .open; não duplicamos o comportamento.
  new MutationObserver(sync).observe(menu, { attributes: true, attributeFilter: ['class'] });
  sync();
  addEventListener('keydown', event => {
   if (event.key === 'Escape' && menu.classList.contains('open')) {
    menu.classList.remove('open');
    button.focus({ preventScroll: true });
   }
  });
  menu.addEventListener('click', event => { if (event.target.closest('a[href]')) menu.classList.remove('open'); });
  const desktop = matchMedia('(min-width:981px)');
  onChange(desktop, event => { if (event.matches) menu.classList.remove('open'); });
  resets.push(() => { resetStyles(); sync(); });
 }
 function accordions() {
  document.querySelectorAll('details:not(.ag-side-disclosure)').forEach(details => {
   if (!safeTarget(details)) return;
   const summary = details.querySelector(':scope>summary');
   if (!summary) return;
   details.classList.add('ag-accordion');
   let animation;
   let desiredOpen = details.open;
   const commit = () => {
    if (animation) { animation.cancel(); animation = null; }
    details.open = desiredOpen;
    details.style.removeProperty('height');
    details.style.removeProperty('overflow');
   };
   summary.addEventListener('click', event => {
    if (reduced.matches || !details.animate) return;
    event.preventDefault();
    const start = details.getBoundingClientRect().height;
    if (animation) { animation.cancel(); animation = null; }
    desiredOpen = !desiredOpen;
    details.style.removeProperty('height');
    details.open = true;
    const full = details.getBoundingClientRect().height;
    const style = getComputedStyle(details);
    const closed = summary.getBoundingClientRect().height + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    details.style.height = `${start}px`;
    details.style.overflow = 'hidden';
    animation = details.animate([{ height: `${start}px` }, { height: `${desiredOpen ? full : closed}px` }], { duration: 360, easing: ease });
    animation.onfinish = commit;
   });
   details.addEventListener('toggle', () => { if (!animation) desiredOpen = details.open; });
   resets.push(commit);
  });
 }
 function init() {
  // Uma API ausente não derruba os outros módulos nem esconde conteúdo.
  [navigation, actions, steps, reading, mobileMenu, accordions, reveals].forEach(feature => {
   try { feature(); } catch (_) {
    if (feature === reveals) { root.classList.remove('ag-motion-ready'); revealAll(); if (observer) observer.disconnect(); }
   }
  });
  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', requestUpdate, { passive: true });
  addEventListener('pageshow', requestUpdate);
  onChange(reduced, () => {
   if (reduced.matches) { revealAll(); resets.forEach(reset => { try { reset(); } catch (_) {} }); }
   requestUpdate();
  });
  requestUpdate();
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
 else init();
})();
