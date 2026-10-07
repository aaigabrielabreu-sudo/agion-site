/* =====================================================================
   AGION WEALTH — TEMA DE GRÁFICOS (Chart.js 4)
   Carregar DEPOIS do chart.umd.js e ANTES dos módulos (plat-*.js) e do
   script inline da plataforma. ES5, sem dependências.

   O que faz:
   1. Tema global em Chart.defaults (fonte, cores lidas das CSS vars,
      grid hairline só no eixo de valor, legenda top-right com pontos,
      tooltip card3 + borda dourada + título serif, animações suaves,
      prefers-reduced-motion). Sobrescreve ensureChartDefaults() do host.
   2. Plugin global "agTheme": normaliza a config em beforeInit (cobre
      também `new Chart()` direto), barras arredondadas, gradientes,
      linhas suaves, doughnut com cutout 70% + espaçamento, texto central
      quando options.plugins.agCenter é truthy.
   3. Paleta categórica harmonizada em window.AG_CHART_PALETTE.
   4. Wrapper idempotente em window.mkChart (normalizeConfig antes).

   API: window.AG_CHARTS = { normalizeConfig, tokens, palette, refresh,
        fmtCompact, fmtBRL2, isMoneyConfig }
   Opções extras reconhecidas em options.plugins:
        agMoney : true|false  força/evita formatação monetária
        agCenter: true | {label:'Total', money:true, value:'texto'}
   ===================================================================== */
(function(){
'use strict';
var W = window, D = document;
var VERSION = '1.0.0';

/* ------------------------------------------------------------------ */
/* Tokens                                                              */
/* ------------------------------------------------------------------ */
var FB = { /* fallbacks = tema escuro do DESIGN.md */
  gold:'#C5A059', gold2:'#E8CC8B', teal:'#8FD9CC',
  bg:'#0B2A26', card:'#103A32', card2:'#144238', card3:'#184C40',
  ink:'#DCE9E7', muted:'#9DB5B1', head:'#F2FAF8',
  line:'rgba(143,217,204,.16)', lineGold:'rgba(197,160,89,.28)'
};
var FONT_SANS  = "'DM Sans',-apple-system,system-ui,sans-serif";
var FONT_SERIF = "'Lora',Georgia,serif";

function cssVar(name, fb){
  try{
    var v = getComputedStyle(D.documentElement).getPropertyValue(name);
    v = v && v.trim();
    if(!v && D.body){ v = getComputedStyle(D.body).getPropertyValue(name); v = v && v.trim(); }
    return v || fb;
  }catch(e){ return fb; }
}
function isLight(){ return !!(D.body && D.body.classList && D.body.classList.contains('light')); }
function reducedMotion(){
  try{ return !!(W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){ return false; }
}

/* paleta categórica: dourado, teal, verde-sálvia, areia, azul-petróleo claro, cobre */
var EXTRA_DARK  = { sage:'#9DBE9F', sand:'#DCCBA6', petrol:'#5FA9BA', copper:'#BD8A5C', neutral:'#6E8B88' };
var EXTRA_LIGHT = { sage:'#4F8A5E', sand:'#9C7F4B', petrol:'#2C7484', copper:'#9A6438', neutral:'#5C716E' };

function tokens(){
  var light = isLight(), X = light ? EXTRA_LIGHT : EXTRA_DARK;
  var T = {
    light: light,
    gold:  cssVar('--gold',  light ? '#8F6F2C' : FB.gold),
    gold2: cssVar('--gold2', light ? '#725421' : FB.gold2),
    teal:  cssVar('--teal',  light ? '#0E4A41' : FB.teal),
    bg:    cssVar('--bg',    light ? '#FAFDFC' : FB.bg),
    card:  cssVar('--card',  light ? '#E8F2EC' : FB.card),
    card2: cssVar('--card2', light ? '#E1EDE6' : FB.card2),
    card3: cssVar('--card3', light ? '#D7E7DF' : FB.card3),
    ink:   cssVar('--ink',   light ? '#0B100E' : FB.ink),
    muted: cssVar('--muted', light ? '#333C39' : FB.muted),
    head:  cssVar('--head',  light ? '#050B09' : FB.head),
    sage: X.sage, sand: X.sand, petrol: X.petrol, copper: X.copper, neutral: X.neutral,
    sans:  cssVar('--font-sans', FONT_SANS),
    serif: cssVar('--font-serif', FONT_SERIF)
  };
  T.hairline = withAlpha(T.head, light ? .09 : .07) || FB.line;
  T.palette  = [T.gold, T.teal, T.sage, T.sand, T.petrol, T.copper];
  return T;
}
function palette(){ return tokens().palette; }

/* ------------------------------------------------------------------ */
/* Cores                                                               */
/* ------------------------------------------------------------------ */
function parseColor(c){
  if(typeof c !== 'string') return null;
  var s = c.trim(), m;
  if(s.charAt(0) === '#'){
    var h = s.slice(1);
    if(h.length === 3 || h.length === 4) h = h.split('').map(function(x){ return x + x; }).join('');
    if(h.length === 6) h += 'ff';
    if(!/^[0-9a-fA-F]{8}$/.test(h)) return null;
    return { r:parseInt(h.slice(0,2),16), g:parseInt(h.slice(2,4),16), b:parseInt(h.slice(4,6),16), a:parseInt(h.slice(6,8),16)/255 };
  }
  m = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i);
  if(m) return { r:+m[1], g:+m[2], b:+m[3], a:(m[4] === undefined ? 1 : +m[4]) };
  return null;
}
function withAlpha(c, a){
  var p = parseColor(c); if(!p) return c;
  return 'rgba(' + Math.round(p.r) + ',' + Math.round(p.g) + ',' + Math.round(p.b) + ',' + (+a).toFixed(3).replace(/0+$/,'').replace(/\.$/,'') + ')';
}
function sameRGB(a, b){
  var p = parseColor(a), q = parseColor(b);
  return !!(p && q && Math.round(p.r) === Math.round(q.r) && Math.round(p.g) === Math.round(q.g) && Math.round(p.b) === Math.round(q.b));
}

/* hex cru → token do tema (chave em T) */
var HEX_MAP = {
  '#c5a059':'gold', '#a8853e':'gold', '#c9a24a':'gold', '#d4af37':'gold',
  '#e8cc8b':'gold2', '#e6c76e':'gold2',
  '#8fd9cc':'teal', '#7fd1c1':'teal', '#bfeae2':'teal',
  '#0e4a41':'petrol', '#4fa3a3':'petrol',
  '#5bc0ae':'sage', '#7fb0a9':'sage',
  '#2e8b7a':'sand',
  '#b0875f':'copper'
};
/* tuplas rgb(a) cruas → token (mantém o alpha original) */
var RGB_MAP = { '197,160,89':'gold', '197,160,44':'gold', '212,175,55':'gold', '143,217,204':'teal', '14,74,65':'petrol', '232,204,139':'gold2' };
/* semânticas: nunca remapear (vermelho/alerta, verde sucesso, âmbar, cinzas) */
var SEMANTIC = /^#(f87171|ef4444|dc2626|e07a6a|fca5a5|34d399|5cc9a0|4caf7d|22c55e|10b981|fbbf24|f59e0b|e0b978|6e8b88|9ca3af|6b7280)$/i;

function mapColor(c, T){
  if(typeof c !== 'string') return c;
  var s = c.trim();
  if(SEMANTIC.test(s)) return c;
  var k = HEX_MAP[s.toLowerCase()];
  if(k && T[k]) return T[k];
  var m = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i);
  if(m){
    var tk = RGB_MAP[m[1] + ',' + m[2] + ',' + m[3]];
    if(tk && T[tk]) return (m[4] === undefined || +m[4] >= 1) ? T[tk] : withAlpha(T[tk], +m[4]);
  }
  return c;
}
function mapColors(v, T){
  if(typeof v === 'string') return mapColor(v, T);
  if(Object.prototype.toString.call(v) === '[object Array]'){ for(var i = 0; i < v.length; i++) v[i] = mapColor(v[i], T); }
  return v;
}
/* "usa cor do tema" = dourado ou teal (também com alpha) */
function isThemeColor(c, T){
  return typeof c === 'string' && (sameRGB(c, T.gold) || sameRGB(c, T.gold2) || sameRGB(c, T.teal));
}

/* ------------------------------------------------------------------ */
/* Formatação pt-BR                                                    */
/* ------------------------------------------------------------------ */
function num(n, d){
  try{ return (+n).toLocaleString('pt-BR', { minimumFractionDigits:0, maximumFractionDigits:d }); }
  catch(e){ return String(Math.round(+n * Math.pow(10,d)) / Math.pow(10,d)); }
}
/* R$ compacto para eixos: "R$ 1,2 mi" · "R$ 350 mil" · "R$ 1,5 mil" · "R$ 850" */
function fmtCompact(v){
  v = +v || 0; var a = Math.abs(v), s = v < 0 ? '-' : '';
  if(a >= 1e9) return s + 'R$ ' + num(a / 1e9, 1) + ' bi';
  if(a >= 1e6) return s + 'R$ ' + num(a / 1e6, 1) + ' mi';
  if(a >= 1e3) return s + 'R$ ' + num(a / 1e3, a >= 1e5 ? 0 : 1) + ' mil';
  return s + 'R$ ' + num(a, 0);
}
function fmtBRL2(v){
  if(typeof W.BRL2 === 'function'){ try{ return W.BRL2(+v || 0); }catch(e){} }
  try{ return (+v || 0).toLocaleString('pt-BR', { style:'currency', currency:'BRL', minimumFractionDigits:2 }); }
  catch(e2){ return 'R$ ' + (+v || 0).toFixed(2); }
}
function fmtNum(v){ return num(+v || 0, 2); }

/* ------------------------------------------------------------------ */
/* Gradientes (scriptable, com cache por área)                         */
/* ------------------------------------------------------------------ */
function gradient(ctx, color, aTop, aBot, horiz){
  var ch = ctx && ctx.chart, area = ch && ch.chartArea;
  if(!ch || !area || !ch.ctx) return color;
  var areaKey = [Math.round(area.left), Math.round(area.top), Math.round(area.right), Math.round(area.bottom)].join('|');
  if(ch.$agGradArea !== areaKey){ ch.$agGrad = {}; ch.$agGradArea = areaKey; }   /* zera o cache quando a área muda */
  ch.$agGrad = ch.$agGrad || {};
  var key = [color, aTop, aBot, horiz ? 'h' : 'v'].join('|');
  if(ch.$agGrad[key]) return ch.$agGrad[key];
  var g;
  try{
    g = horiz ? ch.ctx.createLinearGradient(area.right, 0, area.left, 0) : ch.ctx.createLinearGradient(0, area.top, 0, area.bottom);
    g.addColorStop(0, withAlpha(color, aTop));
    g.addColorStop(1, withAlpha(color, aBot));
  }catch(e){ return color; }
  ch.$agGrad[key] = g;
  return g;
}
function barFill(color, horiz){
  var p = parseColor(color), a = p ? p.a : 1;
  return function(ctx){ return gradient(ctx, color, a, Math.max(0.08, a * 0.45), horiz); };
}
function barFillArray(arr, T, horiz){
  var fns = arr.map(function(c){ return isThemeColor(c, T) ? barFill(c, horiz) : null; });
  return function(ctx){ var i = ctx.dataIndex, c = arr[i % arr.length]; var f = fns[i % fns.length]; return f ? f(ctx) : c; };
}
function areaFill(color){
  return function(ctx){ return gradient(ctx, color, .30, .015, false); };
}

/* ------------------------------------------------------------------ */
/* Detecção monetária                                                  */
/* ------------------------------------------------------------------ */
function maxAbs(datasets){
  var m = 0;
  for(var i = 0; i < datasets.length; i++){
    var d = datasets[i] && datasets[i].data; if(!d || !d.length) continue;
    for(var j = 0; j < d.length; j++){
      var v = d[j]; if(v && typeof v === 'object') v = (v.y !== undefined ? v.y : v.x);
      v = Math.abs(+v); if(v === v && v > m) m = v;
    }
  }
  return m;
}
/* retorna 'money' | 'percent' | 'other' | null (desconhecido) a partir do callback de ticks */
function probeCallback(cb){
  if(typeof cb !== 'function') return null;
  try{
    var r = cb.call({ getLabelForValue:function(v){ return String(v); } }, 1234567, 0, [{ value:1234567 }]);
    if(typeof r !== 'string') return 'other';
    if(/R\$/.test(r)) return 'money';
    if(/%/.test(r)) return 'percent';
    return 'other';
  }catch(e){ return null; }
}
function isMoneyConfig(cfg){
  var opts = cfg.options || {}, pl = opts.plugins || {};
  if(pl.agMoney === true) return true;
  if(pl.agMoney === false) return false;
  var ds = (cfg.data && cfg.data.datasets) || [];
  var vk = valueAxisKey(cfg);
  var sc = opts.scales && opts.scales[vk];
  var probe = sc && sc.ticks ? probeCallback(sc.ticks.callback) : null;
  if(probe === 'money') return true;
  if(probe === 'percent' || probe === 'other') return false;
  return maxAbs(ds) >= 10000;
}
function valueAxisKey(cfg){ return (cfg.options && cfg.options.indexAxis === 'y') ? 'x' : 'y'; }

/* ------------------------------------------------------------------ */
/* Normalização da config                                              */
/* ------------------------------------------------------------------ */
function isArr(v){ return Object.prototype.toString.call(v) === '[object Array]'; }
function obj(o, k){ if(!o[k] || typeof o[k] !== 'object') o[k] = {}; return o[k]; }
function def(o, k, v){ if(o[k] === undefined) o[k] = v; }
function mark(o, k, v){ try{ Object.defineProperty(o, k, { value:v, enumerable:false, configurable:true, writable:true }); }catch(e){ o[k] = v; } }

function normalizeConfig(cfg){
  if(!cfg || typeof cfg !== 'object' || cfg.__agNorm) return cfg;
  mark(cfg, '__agNorm', 1);
  var T = tokens(), P = T.palette;
  var type = cfg.type;
  var opts = obj(cfg, 'options'), pl = obj(opts, 'plugins');
  var data = obj(cfg, 'data'), datasets = isArr(data.datasets) ? data.datasets : (data.datasets = []);
  var isDough = (type === 'doughnut' || type === 'pie');
  var isGauge = isDough && !(isArr(data.labels) && data.labels.length);  /* gauge = doughnut sem rótulos (gaugeCfg) */
  var isCart  = (type === 'bar' || type === 'line' || type === 'scatter' || type === 'bubble');
  var horiz   = opts.indexAxis === 'y';
  var vk = horiz ? 'x' : 'y', ck = horiz ? 'y' : 'x';
  var money = isMoneyConfig(cfg);
  mark(cfg, '__agMoney', money);

  /* layout */
  def(opts, 'maintainAspectRatio', false);
  def(opts, 'responsive', true);
  if(opts.animation === undefined && reducedMotion()) opts.animation = false;

  /* escalas */
  if(isCart){
    var sc = obj(opts, 'scales');
    var V = obj(sc, vk), C = obj(sc, ck);
    /* eixo de valor: hairline, sem borda, ticks discretos */
    var vg = obj(V, 'grid'); vg.color = T.hairline; vg.lineWidth = 1; vg.drawTicks = false; def(vg, 'display', true);
    var vb = obj(V, 'border'); vb.display = false;
    var vt = obj(V, 'ticks'); vt.color = T.muted; vt.font = { family:T.sans, size:11 }; def(vt, 'padding', 8); def(vt, 'maxTicksLimit', 6);
    if(money) vt.callback = function(v){ return fmtCompact(v); };
    /* eixo de categoria: sem grid, sem borda */
    var cg = obj(C, 'grid'); cg.display = false; cg.drawTicks = false;
    var cb = obj(C, 'border'); cb.display = false;
    var ct = obj(C, 'ticks'); ct.color = T.muted; ct.font = { family:T.sans, size:11 }; def(ct, 'padding', 6); def(ct, 'maxRotation', 0); def(ct, 'autoSkip', true);
    def(ct, 'autoSkipPadding', 12);
  }

  /* legenda */
  var lg = obj(pl, 'legend');
  if(lg.display !== false){
    def(lg, 'position', 'top'); def(lg, 'align', 'end');
    var ll = obj(lg, 'labels');
    if(typeof ll.color !== 'function') ll.color = T.ink;
    def(ll, 'usePointStyle', true); def(ll, 'pointStyle', 'circle');
    def(ll, 'boxWidth', 8); def(ll, 'boxHeight', 8); def(ll, 'padding', 16);
    def(ll, 'font', { family:T.sans, size:11, weight:'500' });
  }

  /* tooltip */
  var tp = obj(pl, 'tooltip');
  if(tp.enabled !== false){
    tp.backgroundColor = withAlpha(T.card3, .97); tp.borderColor = withAlpha(T.gold, .5); tp.borderWidth = 1;
    tp.titleColor = T.gold2; tp.bodyColor = T.head; tp.footerColor = T.muted;
    def(tp, 'padding', { left:12, right:12, top:10, bottom:10 }); def(tp, 'cornerRadius', 10); def(tp, 'boxPadding', 6);
    def(tp, 'usePointStyle', true); def(tp, 'caretSize', 6);
    tp.titleFont = { family:T.serif, size:13, weight:'600' }; tp.bodyFont = { family:T.sans, size:12 }; def(tp, 'footerFont', { family:T.sans, size:11 });
    var tcb = obj(tp, 'callbacks');
    if(!tcb.label){
      tcb.label = function(c){
        var v = c.parsed; if(v && typeof v === 'object') v = horiz ? v.x : v.y;
        var pre = c.dataset && c.dataset.label ? c.dataset.label + ': ' : (isDough ? (c.label || '') + ': ' : '');
        var txt = money ? fmtBRL2(v) : fmtNum(v);
        if(isDough){
          var arr = c.dataset.data || [], tot = 0, j;
          for(j = 0; j < arr.length; j++){ if(!c.chart.getDataVisibility || c.chart.getDataVisibility(j)) tot += (+arr[j] || 0); }
          if(tot > 0) txt += '  ·  ' + num(v / tot * 100, 1) + '%';
        }
        return ' ' + pre + txt;
      };
    }
  }

  /* doughnut */
  if(isDough && !isGauge){
    opts.cutout = '70%';
    def(opts, 'rotation', -90);
    var lay = obj(opts, 'layout'); def(lay, 'padding', 6);
  }

  /* datasets */
  var barIdx = [], stackLast = {};
  var i, ds, eff;
  for(i = 0; i < datasets.length; i++){
    ds = datasets[i]; if(!ds || typeof ds !== 'object') continue;
    eff = ds.type || type;
    /* 1) remapeia cores cruas → tokens do tema */
    ['backgroundColor','borderColor','hoverBackgroundColor','hoverBorderColor','pointBackgroundColor','pointBorderColor','pointHoverBackgroundColor','pointHoverBorderColor'].forEach(function(k){
      if(ds[k] !== undefined) ds[k] = mapColors(ds[k], T);
    });
    /* 2) paleta automática */
    if(isDough){
      if(ds.backgroundColor === undefined) ds.backgroundColor = P.slice();
    } else if(datasets.length > 1 && ds.backgroundColor === undefined && ds.borderColor === undefined){
      var c = P[i % P.length];
      ds.borderColor = c; ds.backgroundColor = c;
    } else if(datasets.length === 1 && ds.backgroundColor === undefined && ds.borderColor === undefined){
      ds.borderColor = T.gold; ds.backgroundColor = T.gold;
    }
    /* 3) por tipo */
    if(eff === 'bar'){
      barIdx.push(i);
      var stacked = !!(ds.stack != null || (opts.scales && opts.scales[vk] && opts.scales[vk].stacked === true));
      mark(ds, '__agStacked', stacked);
      var key = ds.stack != null ? String(ds.stack) : '__def';
      if(stacked && ds.hidden !== true) stackLast[key] = i;
      def(ds, 'maxBarThickness', 48);
      def(ds, 'borderWidth', 0);
      if(typeof ds.backgroundColor === 'string'){
        if(isThemeColor(ds.backgroundColor, T)) ds.backgroundColor = barFill(ds.backgroundColor, horiz);
      } else if(isArr(ds.backgroundColor)){
        var hasTheme = false, arr = ds.backgroundColor.slice();
        for(var q = 0; q < arr.length; q++) if(isThemeColor(arr[q], T)) hasTheme = true;
        if(hasTheme){
          ds.backgroundColor = barFillArray(arr, T, horiz);
          if(ds.hoverBackgroundColor === undefined) ds.hoverBackgroundColor = arr;
        }
      }
    } else if(eff === 'line'){
      def(ds, 'tension', .35);
      def(ds, 'borderWidth', 2);
      def(ds, 'borderCapStyle', 'round'); def(ds, 'borderJoinStyle', 'round');
      if(ds.showLine !== false){
        ds.pointRadius = 0;
        def(ds, 'pointHoverRadius', 4); def(ds, 'pointHitRadius', 14); def(ds, 'pointHoverBorderWidth', 2);
        if(ds.pointHoverBackgroundColor === undefined && typeof ds.borderColor === 'string') ds.pointHoverBackgroundColor = ds.borderColor;
        if(ds.pointHoverBorderColor === undefined) ds.pointHoverBorderColor = T.card;
      }
      var fillOn = ds.fill === true || ds.fill === 'origin' || ds.fill === 'start' || ds.fill === 'end' || (typeof ds.fill === 'number');
      if(fillOn && typeof ds.borderColor === 'string' && typeof ds.backgroundColor !== 'function'){
        ds.backgroundColor = areaFill(ds.borderColor);
      }
    } else if(isDough){
      if(isGauge){
        ds.spacing = 0; def(ds, 'borderWidth', 0);
      } else {
        ds.spacing = 2; ds.borderWidth = 2; ds.borderColor = T.card;
        ds.hoverBorderColor = T.card;
        def(ds, 'hoverOffset', 6);
      }
    }
  }
  /* raio das barras: 6 em todos os cantos quando não empilhado; só no topo no último da pilha */
  for(i = 0; i < barIdx.length; i++){
    ds = datasets[barIdx[i]];
    if(!ds.__agStacked){
      ds.borderRadius = 6; ds.borderSkipped = false;
    } else {
      var k2 = ds.stack != null ? String(ds.stack) : '__def';
      if(stackLast[k2] === barIdx[i]){
        ds.borderRadius = horiz ? { topRight:6, bottomRight:6, topLeft:0, bottomLeft:0 } : { topLeft:6, topRight:6, bottomLeft:0, bottomRight:0 };
        ds.borderSkipped = false;
      } else {
        ds.borderRadius = 0; ds.borderSkipped = 'start';
      }
    }
  }
  return cfg;
}

/* ------------------------------------------------------------------ */
/* Chart.defaults                                                      */
/* ------------------------------------------------------------------ */
function setPath(o, path, v){
  var ks = path.split('.'), i;
  for(i = 0; i < ks.length - 1; i++){ if(!o[ks[i]] || typeof o[ks[i]] !== 'object') o[ks[i]] = {}; o = o[ks[i]]; }
  o[ks[ks.length - 1]] = v;
}
function applyDefaults(force){
  if(typeof W.Chart === 'undefined') return false;
  var Chart = W.Chart;
  if(Chart.__agionTheme && !force) return true;
  Chart.__agionTheme = 1;
  Chart.__agion = 1;            /* faz o ensureChartDefaults() original da plataforma virar no-op */
  var T = tokens(), Df = Chart.defaults;
  try{
    Df.font.family = T.sans; Df.font.size = 11; Df.font.weight = '500';
    Df.color = T.muted;
    Df.responsive = true; Df.maintainAspectRatio = false;
    Df.animation = reducedMotion() ? false : { duration:600, easing:'easeOutQuart' };
    Df.interaction = { mode:'nearest', axis:'x', intersect:false };
    Df.hover = Df.hover || {}; Df.hover.mode = 'nearest'; Df.hover.intersect = false;

    /* legenda */
    setPath(Df, 'plugins.legend.position', 'top');
    setPath(Df, 'plugins.legend.align', 'end');
    var L = Df.plugins.legend.labels;
    L.usePointStyle = true; L.pointStyle = 'circle'; L.boxWidth = 8; L.boxHeight = 8; L.padding = 16;
    L.color = T.ink; L.font = { family:T.sans, size:11, weight:'500' };

    /* tooltip */
    var t = Df.plugins.tooltip;
    t.backgroundColor = withAlpha(T.card3, .97); t.borderColor = withAlpha(T.gold, .5); t.borderWidth = 1;
    t.titleColor = T.gold2; t.bodyColor = T.head; t.footerColor = T.muted;
    t.padding = { left:12, right:12, top:10, bottom:10 }; t.cornerRadius = 10; t.boxPadding = 6; t.caretSize = 6;
    t.usePointStyle = true; t.displayColors = true; t.titleMarginBottom = 6;
    t.titleFont = { family:T.serif, size:13, weight:'600' }; t.bodyFont = { family:T.sans, size:12 }; t.footerFont = { family:T.sans, size:11 };

    /* elementos */
    Df.elements.bar.borderRadius = 6; Df.elements.bar.borderSkipped = false; Df.elements.bar.borderWidth = 0;
    Df.elements.line.tension = .35; Df.elements.line.borderWidth = 2; Df.elements.line.borderCapStyle = 'round'; Df.elements.line.borderJoinStyle = 'round';
    Df.elements.point.radius = 0; Df.elements.point.hoverRadius = 4; Df.elements.point.hitRadius = 14; Df.elements.point.hoverBorderWidth = 2;
    Df.elements.arc.borderWidth = 2; Df.elements.arc.borderColor = T.card; Df.elements.arc.hoverOffset = 6;

    /* escalas (fallback para gráficos criados fora de mkChart e sem normalização) */
    setPath(Df, 'scale.grid.color', T.hairline);
    setPath(Df, 'scale.grid.lineWidth', 1);
    setPath(Df, 'scale.grid.drawTicks', false);
    setPath(Df, 'scale.border.display', false);
    setPath(Df, 'scale.ticks.color', T.muted);
    setPath(Df, 'scale.ticks.padding', 8);
    if(Df.scales && Df.scales.category){ setPath(Df, 'scales.category.grid.display', false); }

    /* datasets */
    if(Df.datasets){
      if(Df.datasets.doughnut){ Df.datasets.doughnut.cutout = '70%'; }
      if(Df.datasets.bar){ Df.datasets.bar.maxBarThickness = 48; }
    }
  }catch(e){ try{ console.warn('[plat-charts] defaults', e); }catch(e2){} }
  W.AG_CHART_PALETTE = T.palette.slice();
  return true;
}

/* ------------------------------------------------------------------ */
/* Plugin global                                                       */
/* ------------------------------------------------------------------ */
var agPlugin = {
  id: 'agTheme',
  beforeInit: function(chart){
    try{
      var raw = chart.config && (chart.config._config || chart.config);
      if(raw && !raw.__agNorm) normalizeConfig(raw);
    }catch(e){ try{ console.warn('[plat-charts] normalize', e); }catch(e2){} }
  },
  afterDraw: function(chart){
    try{
      var raw = chart.config && (chart.config._config || chart.config);
      var o = raw && raw.options && raw.options.plugins && raw.options.plugins.agCenter;
      if(!o) return;
      var type = raw.type; if(type !== 'doughnut' && type !== 'pie') return;
      var meta = chart.getDatasetMeta(0); if(!meta || !meta.data || !meta.data.length) return;
      var arc = meta.data[0]; if(!arc) return;
      var cx = arc.x, cy = arc.y, r = arc.innerRadius || 0; if(!(r > 10)) return;
      var T = tokens();
      var txt;
      if(o && typeof o === 'object' && o.value !== undefined){ txt = String(o.value); }
      else {
        var arr = (chart.data.datasets[0] && chart.data.datasets[0].data) || [], tot = 0, j;
        for(j = 0; j < arr.length; j++){ if(!chart.getDataVisibility || chart.getDataVisibility(j)) tot += (+arr[j] || 0); }
        var money = (o && typeof o === 'object' && o.money !== undefined) ? !!o.money : !!raw.__agMoney;
        txt = money ? (tot >= 1e5 ? fmtCompact(tot) : fmtBRL2(tot)) : num(tot, 0);
      }
      var label = (o && typeof o === 'object' && o.label !== undefined) ? String(o.label) : 'Total';
      var ctx = chart.ctx; ctx.save();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var fs = Math.max(13, Math.min(26, r * .30));
      /* encolhe até caber no círculo interno */
      ctx.font = '600 ' + fs + 'px ' + T.serif;
      while(fs > 11 && ctx.measureText(txt).width > r * 1.7){ fs -= 1; ctx.font = '600 ' + fs + 'px ' + T.serif; }
      ctx.fillStyle = T.head;
      ctx.fillText(txt, cx, cy - (label ? fs * .25 : 0));
      if(label){
        ctx.font = '600 ' + Math.max(9, Math.round(fs * .42)) + 'px ' + T.sans;
        ctx.fillStyle = T.muted;
        ctx.fillText(label.toUpperCase(), cx, cy + fs * .55);
      }
      ctx.restore();
    }catch(e){}
  }
};
function registerPlugin(){
  if(typeof W.Chart === 'undefined' || !W.Chart.register) return false;
  if(W.Chart.__agPluginOn) return true;
  try{ W.Chart.register(agPlugin); W.Chart.__agPluginOn = 1; return true; }catch(e){ return false; }
}

/* ------------------------------------------------------------------ */
/* Integração com o host: ensureChartDefaults e mkChart                */
/* ------------------------------------------------------------------ */
function ourEnsure(){ applyDefaults(false); registerPlugin(); }
ourEnsure.__ag = 1;

function installEnsure(){
  if(W.ensureChartDefaults && W.ensureChartDefaults.__ag) return;
  W.ensureChartDefaults = ourEnsure;
}
function wrapMkChart(){
  var f = W.mkChart;
  if(typeof f !== 'function' || f.__agWrapped) return false;
  var wrapped = function(id, cfg){
    ourEnsure();
    try{ normalizeConfig(cfg); }catch(e){ try{ console.warn('[plat-charts] mkChart normalize', e); }catch(e2){} }
    return f.apply(this, arguments);
  };
  wrapped.__agWrapped = 1; wrapped.__agOriginal = f;
  W.mkChart = wrapped;
  return true;
}
function install(){
  ourEnsure();
  installEnsure();
  wrapMkChart();
}

/* refresh: reaplica tokens (ex.: troca claro/escuro) e redesenha gráficos vivos */
function refresh(){
  applyDefaults(true);
  try{
    var inst = W.Chart && W.Chart.instances, k;
    if(inst){ for(k in inst){ if(inst.hasOwnProperty(k) && inst[k]){ try{ inst[k].$agGrad = {}; inst[k].update('none'); }catch(e){} } } }
  }catch(e2){}
}

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */
install();
/* o script inline da plataforma redeclara `function mkChart`/`ensureChartDefaults` depois deste arquivo:
   reinstalamos quando o DOM estiver pronto e por alguns segundos (idempotente). */
var tries = 0, timer = setInterval(function(){ install(); if(++tries > 40) clearInterval(timer); }, 250);
try{
  if(D.readyState === 'loading') D.addEventListener('DOMContentLoaded', install); else install();
  if(W.addEventListener) W.addEventListener('load', install);
}catch(e0){}

/* troca de tema (body.light) → recarrega defaults e redesenha */
try{
  if(W.MutationObserver && D.documentElement){
    var mo = new MutationObserver(function(ms){
      for(var i = 0; i < ms.length; i++){ if(ms[i].attributeName === 'class'){ refresh(); break; } }
    });
    var startObs = function(){ if(D.body) mo.observe(D.body, { attributes:true, attributeFilter:['class'] }); };
    if(D.body) startObs(); else D.addEventListener('DOMContentLoaded', startObs);
  }
  if(W.matchMedia){
    var mq = W.matchMedia('(prefers-reduced-motion: reduce)');
    if(mq && mq.addEventListener) mq.addEventListener('change', function(){ applyDefaults(true); });
    else if(mq && mq.addListener) mq.addListener(function(){ applyDefaults(true); });
  }
}catch(e){}

W.AG_CHARTS = {
  version: VERSION,
  normalizeConfig: normalizeConfig,
  tokens: tokens,
  palette: palette,
  refresh: refresh,
  fmtCompact: fmtCompact,
  fmtBRL2: fmtBRL2,
  isMoneyConfig: isMoneyConfig,
  mapColor: function(c){ return mapColor(c, tokens()); },
  plugin: agPlugin
};
W.AG_CHART_PALETTE = W.AG_CHART_PALETTE || palette();
})();
