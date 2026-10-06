/* Navegação editorial progressiva: os textos e links já existem no HTML. */
(() => {
 'use strict';
 const sidebar = document.querySelector('.ag-blog-sidebar');
 const main = document.querySelector('main.ag-blog-content');
 if (!sidebar || !main) return;
 const disclosure = sidebar.querySelector('.ag-side-disclosure');
 const links = Array.from(sidebar.querySelectorAll('.ag-side-link'));
 const topics = links.map(link => ({ link, target: document.getElementById(decodeURIComponent(link.hash.slice(1))) })).filter(topic => topic.target);
 if (!disclosure || !topics.length) return;
 const mobile = matchMedia('(max-width:900px)');
 const progress = sidebar.querySelector('.ag-guide-progress-value');
 const article = main.querySelector('.article');
 let pending = false;
 let active;

 const update = () => {
  pending = false;
  const header = document.querySelector('.nav');
  const line = (header ? Math.max(0, header.getBoundingClientRect().bottom) : 100) + 28;
  let current = topics[0];
  for (const topic of topics) {
   // Native fragment scrolling can settle on a fractional CSS pixel.
   if (topic.target.getBoundingClientRect().top <= line + 2) current = topic;
  }
  if (current !== active) {
   topics.forEach(topic => {
    if (topic === current) topic.link.setAttribute('aria-current', 'location');
    else topic.link.removeAttribute('aria-current');
   });
   active = current;
  }
  if (progress && article) {
   const bounds = article.getBoundingClientRect();
   const end = article.querySelector(':scope>.more');
   const height = end ? end.getBoundingClientRect().top - bounds.top : bounds.height;
   const fraction = Math.min(1, Math.max(0, (line - bounds.top) / Math.max(1, height - (innerHeight - line))));
   sidebar.style.setProperty('--ag-guide-progress', fraction.toFixed(4));
   progress.textContent = `${Math.round(fraction * 100)}%`;
  }
 };
 const schedule = () => {
  if (!pending) { pending = true; requestAnimationFrame(update); }
 };
 const syncDisclosure = () => { disclosure.open = !mobile.matches; schedule(); };
 syncDisclosure();
 if (mobile.addEventListener) mobile.addEventListener('change', syncDisclosure);
 else mobile.addListener(syncDisclosure);
 sidebar.addEventListener('click', event => {
  const link = event.target.closest('.ag-side-link');
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const topic = topics.find(item => item.link === link);
  if (!topic) return;
  if (mobile.matches) disclosure.open = false;
  // Preserve native anchors, history and scrolling; transfer keyboard focus
  // to the selected content after the mobile guide has collapsed.
  topic.target.setAttribute('tabindex', '-1');
  requestAnimationFrame(() => { topic.target.focus({ preventScroll: true }); schedule(); });
 });
 disclosure.addEventListener('keydown', event => {
  if (event.key === 'Escape' && mobile.matches && disclosure.open) {
   disclosure.open = false;
   disclosure.querySelector('summary').focus({ preventScroll: true });
  }
 });
 document.body.classList.add('ag-blog-ready');
 addEventListener('scroll', schedule, { passive: true });
 addEventListener('resize', schedule, { passive: true });
 addEventListener('hashchange', schedule);
 addEventListener('pageshow', schedule);
 addEventListener('load', schedule, { once: true });
 if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
 schedule();
})();
