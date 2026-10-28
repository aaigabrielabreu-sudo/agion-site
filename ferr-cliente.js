/* Agion · Simulações das ferramentas salvas no nome do cliente — FERR_CLIENTE_28OUT (pedido do Gabriel, 28/out)
   Nas ferramentas (escadas, alavancagem, financiamento, à vista, lance livre): painel "Cliente da simulação" no topo
   dos parâmetros → busca o lead/cliente, "Salvar para o cliente" (PDF + números) e "Salvas" (todas as ferramentas, em abas).
   Excluir e criar novas: só aqui, na ferramenta.
   Na plataforma: AgFerrCli.lista(el,{lead_id,cliente_id,selecionar,onSel}) mostra as salvas (abas por ferramenta),
   abre o PDF e, no e-mail da proposta, deixa marcar quais vão anexadas.
   Servidor: ferr_salvas.py (/api/ferr/*). Nada aqui aparece no link temporário do cliente. */
(function(W,D){
 if(W.AgFerrCli)return;
 var API='https://bot.agionconsorcios.com.br',SUPA='https://sfekirqoflozylghwlbe.supabase.co',SKEY='sb_publishable_Ds4PlQmsvnny5GdALHvVYQ_RHgtFXw2';
 var ORDEM=['escada-financeira','escada-patrimonial','calc-alavancagem','calc-financiamento','calc-avista','calc-lance'];
 var FERR={'escada-financeira':'Escada financeira','escada-patrimonial':'Escada patrimonial','calc-alavancagem':'Alavancagem',
  'calc-financiamento':'Financiamento × Consórcio','calc-avista':'Consórcio × À vista','calc-lance':'Lance livre'};
 var PAG=location.pathname.replace(/^\/+|\/+$/g,'').replace(/\.html$/,'');
 var NA_FERR=!!FERR[PAG],SK='agfc_pessoa';
 function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
 function tokLocal(){try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf('sb-')===0&&k.indexOf('auth-token')>-1){var v=JSON.parse(localStorage.getItem(k));return v&&(v.access_token||(v.currentSession&&v.currentSession.access_token));}}}catch(e){}return null;}
 var _cli=null;
 function supaJs(){if(W.supabase&&W.supabase.createClient)return Promise.resolve(W.supabase);
  return new Promise(function(ok,no){var s=D.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=function(){W.supabase?ok(W.supabase):no(new Error('x'));};s.onerror=function(){no(new Error('x'));};D.head.appendChild(s);});}
 /* sessão vencida: na ferramenta, o cliente oficial do Supabase renova (igual à calc-lance); na plataforma, ela mesma renova */
 function tokFresco(){if(!NA_FERR)return new Promise(function(ok){setTimeout(function(){ok(tokLocal());},1500);});
  return supaJs().then(function(sb){if(!_cli)_cli=sb.createClient(SUPA,SKEY);return _cli.auth.getSession();})
   .then(function(r){var s=r&&r.data&&r.data.session;return (s&&s.access_token)||tokLocal();}).catch(function(){return tokLocal();});}
 function req(path,opt,rep){opt=opt||{};var t=tokLocal();if(!t)return Promise.reject(new Error('Entre na plataforma para usar esta função.'));
  var h={};Object.keys(opt.headers||{}).forEach(function(k){h[k]=opt.headers[k];});h.Authorization='Bearer '+t;
  return fetch(API+path,{method:opt.method||'GET',headers:h,body:opt.body}).then(function(r){
   if(r.status===401&&!rep)return tokFresco().then(function(){return req(path,opt,1);});
   if(r.status===401)throw new Error('Sua sessão expirou. Abra a plataforma e entre de novo.');
   if(opt.blob){if(!r.ok)throw new Error('Não consegui abrir o PDF agora.');return r.blob();}
   return r.json().catch(function(){return {};}).then(function(j){if(!r.ok||(j&&j.ok===false))throw new Error((j&&(j.erro||j.error))||'Erro '+r.status+' no servidor.');return j;});},
   function(e){if(e&&e.message&&/sessão|Entre/.test(e.message))throw e;throw new Error('Sem conexão com o servidor. Tente de novo.');});}
 function quando(iso){try{var d=new Date(iso);return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'2-digit'})+' às '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});}catch(e){return '';}}
 function pnome(n){n=String(n||'').trim().split(/\s+/)[0]||'';return n.charAt(0).toUpperCase()+n.slice(1).toLowerCase();}

 /* ---------- estilo (tema das ferramentas; na plataforma usa as mesmas variáveis) ---------- */
 function css(){if(D.getElementById('agfc-css'))return;var s=D.createElement('style');s.id='agfc-css';s.textContent=
  '#agfc{background:var(--card,#FFFDF8);border-radius:26px;box-shadow:var(--shadow,0 12px 32px -14px rgba(11,42,38,.24));padding:20px 22px;position:relative;min-width:0;font-family:var(--sans,"DM Sans",system-ui,sans-serif);color:var(--ink,#0B2A26)}'+
  '#agfc .agfc-h{display:flex;align-items:center;gap:9px;margin:0 0 4px;font:600 16px/1.25 var(--sans,"DM Sans",system-ui)}#agfc .agfc-h svg{width:18px;height:18px;flex:none;color:var(--gold,#C5A059);fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}'+
  '#agfc .agfc-s{margin:0 0 12px;color:var(--mut,#6E7A75);font-size:12.6px;line-height:1.5}'+
  '#agfc .agfc-q{position:relative}#agfc .agfc-q input,#agfc .agfc-ti{width:100%;box-sizing:border-box;height:44px;border:0;border-radius:14px;background:var(--bg,#F4EFE4);box-shadow:inset 0 0 0 1px var(--line,#E6DCC8);padding:0 14px;font:600 15px var(--sans,"DM Sans",system-ui);color:var(--ink,#0B2A26);outline:0}'+
  '#agfc .agfc-q input:focus,#agfc .agfc-ti:focus{background:#fff;box-shadow:inset 0 0 0 1.5px var(--gold,#C5A059)}'+
  '#agfc .agfc-sug{position:absolute;left:0;right:0;top:calc(100% + 5px);background:var(--card,#FFFDF8);border:1px solid var(--line,#E6DCC8);border-radius:14px;box-shadow:0 20px 44px -18px rgba(11,42,38,.4);z-index:40;max-height:300px;overflow:auto;display:none}#agfc .agfc-sug.on{display:block}'+
  '#agfc .agfc-sug button{display:block;width:100%;text-align:left;border:0;background:none;padding:10px 13px;border-bottom:1px solid var(--line2,#EFE7D6);font:600 13.5px var(--sans,"DM Sans",system-ui);color:var(--ink,#0B2A26);cursor:pointer}'+
  '#agfc .agfc-sug button:last-child{border-bottom:0}#agfc .agfc-sug button:hover,#agfc .agfc-sug button.on{background:var(--bg,#F4EFE4)}#agfc .agfc-sug small{display:block;font-weight:500;font-size:11.8px;color:var(--mut,#6E7A75);margin-top:2px}#agfc .agfc-sug .vz{color:var(--mut,#6E7A75);font-weight:500;cursor:default}'+
  '#agfc .agfc-ch{display:flex;align-items:center;gap:10px;border-radius:16px;background:color-mix(in srgb,var(--gold2,#E8CC8B) 22%,var(--card,#FFFDF8));box-shadow:inset 0 0 0 1.5px var(--gold,#C5A059);padding:10px 12px}'+
  '#agfc .agfc-ch .av{width:34px;height:34px;border-radius:50%;background:var(--ink,#0B2A26);color:var(--gold2,#E8CC8B);display:flex;align-items:center;justify-content:center;font:700 14px var(--sans,system-ui);flex:none}'+
  '#agfc .agfc-ch .tx{min-width:0;flex:1}#agfc .agfc-ch b{display:block;font-size:14.5px;line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#agfc .agfc-ch small{display:block;font-size:11.8px;color:var(--mut,#6E7A75);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
  '#agfc .agfc-lk{border:0;background:var(--card,#FFFDF8);box-shadow:inset 0 0 0 1px var(--line,#E6DCC8);border-radius:999px;padding:7px 12px;font:700 12px var(--sans,system-ui);color:var(--ink,#0B2A26);cursor:pointer;flex:none}'+
  '#agfc .agfc-bt{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}#agfc .agfc-bt button{flex:1 1 140px;border:0;border-radius:999px;padding:12px 14px;font:700 13.5px var(--sans,system-ui);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:44px}'+
  '#agfc .agfc-bt .pri{background:var(--ink,#0B2A26);color:var(--gold2,#E8CC8B)}#agfc .agfc-bt .sec{background:var(--card,#FFFDF8);color:var(--ink,#0B2A26);box-shadow:inset 0 0 0 1.5px var(--line,#E6DCC8)}#agfc .agfc-bt button[disabled]{opacity:.55;cursor:wait}'+
  '#agfc .agfc-bt .n{background:var(--gold,#C5A059);color:#fff;border-radius:999px;padding:1px 7px;font-size:11.5px}'+
  '#agfc .agfc-at{margin-top:9px;font-size:12px;color:var(--mut,#6E7A75)}#agfc .agfc-at b{color:var(--ink,#0B2A26)}'+
  '#agfc .agfc-fm{margin-top:10px;padding-top:10px;border-top:1px dashed var(--line,#E6DCC8)}#agfc .agfc-fm label{display:block;font:700 10.5px var(--sans,system-ui);letter-spacing:.12em;text-transform:uppercase;color:var(--goldd,#A3833F);margin:0 0 6px}'+
  '#agfc .agfc-msg{font-size:12.4px;margin-top:8px;color:var(--mut,#6E7A75);min-height:0}#agfc .agfc-msg.er{color:var(--bad,#C2463B)}#agfc .agfc-msg.ok{color:var(--ok,#3F8F6A)}'+
  '#agfc .agfc-mn{border:0;background:none;padding:6px 0 0;font:600 12px var(--sans,system-ui);color:var(--goldd,#A3833F);cursor:pointer;text-decoration:underline;text-underline-offset:3px}'+
  '@media print{#agfc,.agfm-bg,.agfc-toast{display:none!important}}'+
  /* janela das salvas */
  '.agfm-bg{position:fixed;inset:0;z-index:2147483000;background:rgba(4,20,18,.55);display:flex;align-items:center;justify-content:center;padding:14px}'+
  '.agfm{background:var(--card,#FFFDF8);color:var(--ink,#0B2A26);border-radius:24px;width:100%;max-width:660px;max-height:calc(100vh - 28px);display:flex;flex-direction:column;box-shadow:0 30px 80px rgba(0,0,0,.3);font-family:var(--sans,"DM Sans",system-ui,sans-serif);overflow:hidden}'+
  '.agfm-hd{padding:18px 20px 6px;display:flex;align-items:flex-start;gap:10px}.agfm-hd .k{font:700 10.5px var(--sans,system-ui);letter-spacing:.13em;color:var(--goldd,#A3833F);text-transform:uppercase}.agfm-hd h3{margin:4px 0 0;font:600 20px/1.25 var(--serif,Lora,Georgia,serif)}'+
  '.agfm-hd .x{margin-left:auto;border:0;background:var(--bg,#F4EFE4);width:36px;height:36px;border-radius:50%;font-size:18px;line-height:1;cursor:pointer;color:var(--ink,#0B2A26);flex:none}'+
  '.agfm-bd{padding:6px 20px 18px;overflow:auto;-webkit-overflow-scrolling:touch}.agfm-ft{padding:10px 20px 16px;border-top:1px solid var(--line2,#EFE7D6);font-size:12.2px;color:var(--mut,#6E7A75);line-height:1.5}'+
  '@media(max-width:600px){.agfm-bg{align-items:flex-end;padding:0}.agfm{border-radius:22px 22px 0 0;max-height:92vh}.agfm-hd{padding:16px 16px 4px}.agfm-bd{padding:6px 16px 16px}.agfm-ft{padding:10px 16px calc(14px + env(safe-area-inset-bottom))}}'+
  /* lista (também usada na plataforma) */
  '.agfl{font-family:var(--sans,"DM Sans",system-ui,sans-serif);color:var(--ink,#0B2A26)}'+
  '.agfl-tabs{display:flex;gap:6px;overflow-x:auto;padding:4px 0 10px;scrollbar-width:none;-webkit-overflow-scrolling:touch}.agfl-tabs::-webkit-scrollbar{display:none}'+
  '.agfl-tabs button{flex:none;border:0;border-radius:999px;padding:8px 13px;background:var(--bg2,#ECE4D3);color:var(--ink2,#2B3D38);font:700 12.5px var(--sans,system-ui);cursor:pointer;white-space:nowrap}'+
  '.agfl-tabs button.on{background:var(--ink,#0B2A26);color:var(--gold2,#E8CC8B)}.agfl-tabs button i{font-style:normal;opacity:.7;margin-left:5px}'+
  '.agfl-it{border-radius:16px;background:var(--card,#FFFDF8);box-shadow:inset 0 0 0 1px var(--line,#E6DCC8);padding:12px 14px;margin-bottom:9px;display:flex;gap:11px;align-items:flex-start}'+
  '.agfl-it.sel{box-shadow:inset 0 0 0 1.5px var(--gold,#C5A059);background:color-mix(in srgb,var(--gold2,#E8CC8B) 14%,var(--card,#FFFDF8))}'+
  '.agfl-it .ck{margin-top:2px;width:20px;height:20px;accent-color:var(--ink,#0B2A26);flex:none}.agfl-it .bx{min-width:0;flex:1}'+
  '.agfl-t{display:flex;align-items:flex-start;gap:8px;flex-wrap:wrap}.agfl-t b{font-size:14px;line-height:1.3;word-break:break-word}.agfl-tag{font:700 10.5px var(--sans,system-ui);background:var(--bg2,#ECE4D3);color:var(--ink2,#2B3D38);padding:3px 8px;border-radius:999px;white-space:nowrap}'+
  '.agfl-m{font-size:11.8px;color:var(--mut,#6E7A75);margin-top:3px}.agfl-r{font-size:12.6px;color:var(--ink2,#2B3D38);margin-top:5px;line-height:1.45}'+
  '.agfl-b{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}.agfl-b button{border:0;border-radius:999px;padding:8px 13px;font:700 12px var(--sans,system-ui);cursor:pointer;background:var(--card,#FFFDF8);color:var(--ink,#0B2A26);box-shadow:inset 0 0 0 1px var(--line,#E6DCC8);min-height:36px}'+
  '.agfl-b .pri{background:var(--ink,#0B2A26);color:var(--gold2,#E8CC8B);box-shadow:none}.agfl-b .dg{color:var(--bad,#C2463B)}.agfl-b .dgf{background:var(--bad,#C2463B);color:#fff;box-shadow:none}.agfl-b button[disabled]{opacity:.55;cursor:wait}'+
  '.agfl-vz{font-size:13px;color:var(--mut,#6E7A75);padding:14px 2px;line-height:1.5}.agfl-er{font-size:12.6px;color:var(--bad,#C2463B);padding:6px 2px}'+
  '.agfc-toast{position:fixed;left:50%;bottom:92px;transform:translateX(-50%);z-index:2147483600;background:var(--ink,#0B2A26);color:var(--gold2,#E8CC8B);font:700 13px var(--sans,"DM Sans",system-ui);padding:11px 16px;border-radius:999px;box-shadow:0 14px 34px -12px rgba(0,0,0,.45);max-width:calc(100vw - 32px);text-align:center;transition:opacity .3s}'+
  '.agfc-toast.er{background:var(--bad,#C2463B);color:#fff}';
  D.head.appendChild(s);}
 var _tt=null;
 function toast(t,er){css();var e=D.querySelector('.agfc-toast');if(!e){e=D.createElement('div');e.className='agfc-toast';e.setAttribute('data-html2canvas-ignore','true');D.body.appendChild(e);}
  e.textContent=t;e.classList.toggle('er',!!er);e.style.opacity='1';clearTimeout(_tt);_tt=setTimeout(function(){e.style.opacity='0';setTimeout(function(){if(e.style.opacity==='0')e.remove();},350);},er?5200:3200);}

 /* ---------- PDF de uma salva ---------- */
 function abrePDF(it,btn){var w=null;try{w=W.open('','_blank');}catch(e){}if(btn){btn.disabled=true;}
  return req('/api/ferr/pdf/'+encodeURIComponent(it.id),{blob:true}).then(function(b){if(btn)btn.disabled=false;
   var u=URL.createObjectURL(b);
   if(w&&!w.closed){try{w.location.href=u;}catch(e){w=null;}}
   if(!w||w.closed){var a=D.createElement('a');a.href=u;a.download=(it.ferramenta_nome||'Simulação')+' - '+(it.titulo||'')+'.pdf';a.style.display='none';D.body.appendChild(a);a.click();setTimeout(function(){a.remove();},1000);}
   setTimeout(function(){try{URL.revokeObjectURL(u);}catch(e){}},300000);})
   .catch(function(e){if(btn)btn.disabled=false;try{w&&w.close();}catch(_){}toast(e.message||'Não abriu o PDF.',1);});}

 /* ---------- lista das salvas (abas por ferramenta) ---------- */
 /* op: lead_id, cliente_id, cadastro_id, excluir(bool), abrir(fn(it)|true), selecionar(bool), sel([ids]), onSel(fn(ids,itens)), vazio, onCarregou(fn(lista)), aba */
 function lista(root,op){op=op||{};css();root.classList.add('agfl');var L=[],aba=op.aba||'todas',sel={},conf=null,erro='';
  (op.sel||[]).forEach(function(i){sel[i]=1;});
  function qs(){var q=[];['lead_id','cliente_id','cadastro_id'].forEach(function(k){if(op[k])q.push(k+'='+encodeURIComponent(op[k]));});return q.join('&');}
  function itens(){return aba==='todas'?L:L.filter(function(x){return x.ferramenta===aba;});}
  function avisa(){if(!op.onSel)return;var ids=Object.keys(sel).filter(function(k){return sel[k];});op.onSel(ids,L.filter(function(x){return sel[x.id];}));}
  function pinta(){var cont={};L.forEach(function(x){cont[x.ferramenta]=(cont[x.ferramenta]||0)+1;});
   var tabs=[['todas','Todas',L.length]],ord=op.aba?[op.aba].concat(ORDEM.filter(function(f){return f!==op.aba;})):ORDEM;   /* a ferramenta aberta vem logo depois de "Todas" */
   ord.forEach(function(f){if(cont[f]||f===op.aba)tabs.push([f,FERR[f],cont[f]||0]);});
   if(aba!=='todas'&&!cont[aba]&&aba!==op.aba)aba='todas';
   var h='';
   if(L.length||op.aba)h+='<div class="agfl-tabs" role="tablist">'+tabs.map(function(t){return '<button type="button" role="tab" data-ab="'+t[0]+'" class="'+(t[0]===aba?'on':'')+'">'+esc(t[1])+'<i>'+t[2]+'</i></button>';}).join('')+'</div>';
   if(erro)h+='<div class="agfl-er">'+esc(erro)+'</div>';
   var its=itens();
   if(!its.length&&!erro)h+='<div class="agfl-vz">'+esc(L.length?'Nenhuma simulação salva nesta ferramenta para este cliente.':(op.vazio||'Nenhuma simulação salva para este cliente ainda.'))+'</div>';
   h+=its.map(function(x){var pode=op.selecionar&&x.tem_pdf;
    return '<div class="agfl-it'+(sel[x.id]?' sel':'')+'" data-id="'+esc(x.id)+'">'+(op.selecionar?'<input type="checkbox" class="ck" data-a="ck"'+(sel[x.id]?' checked':'')+(pode?'':' disabled title="Sem PDF"')+' aria-label="Anexar no e-mail">':'')+
     '<div class="bx"><div class="agfl-t"><b>'+esc(x.titulo||'Simulação')+'</b>'+(aba==='todas'?'<span class="agfl-tag">'+esc(x.ferramenta_nome)+'</span>':'')+'</div>'+
     '<div class="agfl-m">'+esc(quando(x.criado_em))+(x.criado_por_nome?' · por '+esc(pnome(x.criado_por_nome)):'')+(op.mostraNome&&x.nome?' · '+esc(x.nome):'')+'</div>'+
     (x.resumo?'<div class="agfl-r">'+esc(x.resumo)+'</div>':'')+
     '<div class="agfl-b">'+(op.abrir?'<button type="button" class="pri" data-a="ab">'+(NA_FERR&&x.ferramenta===PAG?'Abrir aqui':'Abrir na ferramenta')+'</button>':'')+
      (x.tem_pdf?'<button type="button" data-a="pdf">Ver PDF</button>':'')+
      (op.excluir&&x.pode_excluir?(conf===x.id?'<button type="button" class="dgf" data-a="exs">Sim, excluir</button><button type="button" data-a="exn">Não</button>':'<button type="button" class="dg" data-a="ex">Excluir</button>'):'')+
     '</div></div></div>';}).join('');
   root.innerHTML=h;
   var tb=root.querySelector('.agfl-tabs'),ton=tb&&tb.querySelector('.on');
   if(tb){if(ton&&ton.offsetLeft+ton.offsetWidth>tb.clientWidth)tb.scrollLeft=ton.offsetLeft-8;
    var fd=function(){var r=tb.scrollWidth-tb.clientWidth-tb.scrollLeft>4,l=tb.scrollLeft>4;tb.style.webkitMaskImage=tb.style.maskImage=(r||l)?'linear-gradient(90deg,'+(l?'transparent 0,#000 22px':'#000 0')+','+(r?'#000 calc(100% - 26px),transparent 100%':'#000 100%')+')':'';};
    fd();tb.addEventListener('scroll',fd,{passive:true});}
   [].forEach.call(root.querySelectorAll('[data-ab]'),function(b){b.onclick=function(){aba=b.getAttribute('data-ab');conf=null;pinta();};});
   [].forEach.call(root.querySelectorAll('.agfl-it'),function(el){var id=el.getAttribute('data-id'),x=L.filter(function(y){return y.id===id;})[0];if(!x)return;
    [].forEach.call(el.querySelectorAll('[data-a]'),function(b){var a=b.getAttribute('data-a');
     if(a==='ck'){b.onchange=function(){sel[id]=b.checked;el.classList.toggle('sel',b.checked);avisa();};return;}
     b.onclick=function(){
      if(a==='pdf')abrePDF(x,b);
      else if(a==='ab'){if(typeof op.abrir==='function')op.abrir(x);else abreNaFerr(x);}
      else if(a==='ex'){conf=id;pinta();}
      else if(a==='exn'){conf=null;pinta();}
      else if(a==='exs'){b.disabled=true;req('/api/ferr/excluir',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:id})})
        .then(function(){conf=null;L=L.filter(function(y){return y.id!==id;});delete sel[id];pinta();avisa();toast('Simulação excluída.');try{op.onExcluiu&&op.onExcluiu(x,L);}catch(e){}})
        .catch(function(e){b.disabled=false;toast(e.message,1);});}};});});}
  function carrega(silencioso){if(!qs()){L=[];pinta();return Promise.resolve(L);}
   if(!silencioso)root.innerHTML='<div class="agfl-vz">Carregando as simulações…</div>';
   return req('/api/ferr/salvas?'+qs()).then(function(j){L=(j&&j.salvas)||[];erro='';pinta();try{op.onCarregou&&op.onCarregou(L);}catch(e){}return L;})
    .catch(function(e){L=[];erro=e.message||'Não consegui carregar.';pinta();return L;});}
  carrega();
  return {recarregar:carrega,itens:function(){return L;},selecionados:function(){return L.filter(function(x){return sel[x.id];});},
   marcar:function(ids){(ids||[]).forEach(function(i){sel[i]=1;});pinta();avisa();}};}
 function abreNaFerr(x){var u='/'+x.ferramenta+'?ag_ferr='+encodeURIComponent(x.id);var w=null;try{w=W.open(u,'_blank');}catch(e){}if(!w)location.href=u;}

 W.AgFerrCli={lista:lista,abrePDF:abrePDF,FERR:FERR,ORDEM:ORDEM,req:req,toast:toast};
 if(!NA_FERR)return;

 /* =================== painel dentro da ferramenta =================== */
 if(W.__agLinkTemp||/[?&]acesso=/.test(location.search))return;   /* link do cliente: nada disso aparece */
 var P=null,ATUAL=null,NSALVAS=null,abrindo=false,fnAuto='';
 function guarda(){try{if(P)sessionStorage.setItem(SK,JSON.stringify({p:P,t:Date.now()}));else sessionStorage.removeItem(SK);}catch(e){}}
 function lida(){try{var o=JSON.parse(sessionStorage.getItem(SK)||'null');if(o&&o.p&&Date.now()-o.t<3*3600e3)return o.p;}catch(e){}return null;}
 function fNome(){var f=D.getElementById('f_nome');if(!f||!P)return;var v=f.value.trim();if(!v||v===fnAuto){fnAuto=P.nome||'';f.value=fnAuto;try{f.dispatchEvent(new Event('input',{bubbles:true}));}catch(e){}}}
 function setP(p,semSalvas){P=p?{lead_id:p.lead_id||null,cliente_id:p.cliente_id||null,cadastro_id:p.cadastro_id||null,nome:p.nome||'',tipo:p.tipo||p.tipo_pessoa||'',dono:p.dono||''}:null;
  if(!P)ATUAL=null;NSALVAS=null;guarda();fNome();pinta();if(P&&!semSalvas)conta();}
 function conta(){if(!P)return;var q=P.cliente_id?'cliente_id='+encodeURIComponent(P.cliente_id):'lead_id='+encodeURIComponent(P.lead_id);
  req('/api/ferr/salvas?'+q).then(function(j){NSALVAS=((j&&j.salvas)||[]).length;pinta();}).catch(function(){NSALVAS=null;pinta();});}

 /* estado da tela: escadas e lance têm o próprio (&s=, o mesmo do link); nas outras, campos + botões escolhidos */
 function estado(){
  try{if(/^escada-/.test(PAG)&&W.escEstadoQS){var a=W.escEstadoQS();if(a)return a.replace(/^&/,'');}
   if(PAG==='calc-lance'&&W.lcEstadoQS){var b=W.lcEstadoQS();if(b)return b.replace(/^&/,'');}}catch(e){}
  var o={v:{},g:{}};
  [].forEach.call(D.querySelectorAll('main input[id],main select[id],.wrap input[id],.wrap select[id]'),function(el){if(el.closest('#agfc')||/^(range|hidden|file|button|submit)$/.test(el.type))return;o.v[el.id]=el.type==='checkbox'?(el.checked?'1':'0'):el.value;});
  [].forEach.call(D.querySelectorAll('.seg[id],.snav[id]'),function(g){if(g.closest('#agfc'))return;var bs=[].slice.call(g.querySelectorAll('button')),i=-1;bs.forEach(function(b,k){if(i<0&&b.classList.contains('on'))i=k;});if(i>=0)o.g[g.id]=i;});
  return JSON.stringify(o);}
 function aplicaGen(o){
  Object.keys(o.g||{}).forEach(function(id){var g=D.getElementById(id);if(!g)return;var b=g.querySelectorAll('button')[o.g[id]];if(b&&!b.classList.contains('on'))b.click();});
  var els=[];Object.keys(o.v||{}).forEach(function(id){var el=D.getElementById(id);if(!el||el.closest('#agfc'))return;if(el.type==='checkbox')el.checked=o.v[id]==='1';else el.value=o.v[id];els.push(el);});
  els.forEach(function(el){try{el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}catch(e){}});
  try{if(typeof W.calc==='function')W.calc();}catch(e){}}
 function resumo(){var k=D.getElementById('mb_k'),v=D.getElementById('mb_v');var kt=k?k.textContent.replace(/\s+/g,' ').trim():'',vt=v?v.textContent.replace(/\s+/g,' ').trim():'';
  if(!vt||vt==='—')return '';return (kt&&kt!=='Resultado'?kt+': ':'')+vt;}

 /* PDF igual ao "Baixar PDF" da ferramenta (mesma imagem da página) */
 function jspdf(){if(W.jspdf&&W.jspdf.jsPDF)return Promise.resolve(W.jspdf.jsPDF);
  return new Promise(function(ok,no){var s=D.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';s.onload=function(){(W.jspdf&&W.jspdf.jsPDF)?ok(W.jspdf.jsPDF):no(new Error('o gerador de PDF não carregou'));};s.onerror=function(){no(new Error('sem conexão para gerar o PDF'));};D.head.appendChild(s);});}
 function geraPDF(){if(typeof W.agGerarPNG!=='function')return Promise.reject(new Error('esta ferramenta não gera PDF'));
  return Promise.all([W.agGerarPNG(),jspdf()]).then(function(r){var cv=r[0],J=r[1],pw=595.28,ph=pw*cv.height/cv.width,k=ph>14000?14000/ph:1;pw*=k;ph*=k;
   var pdf=new J({unit:'pt',format:[pw,Math.max(ph,100)],orientation:ph>=pw?'portrait':'landscape',compress:true});
   pdf.addImage(cv.toDataURL('image/jpeg',0.86),'JPEG',0,0,pw,ph,undefined,'FAST');return pdf.output('blob');});}

 var IC='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="3.5"/><path d="M5 19.5c1.2-3.4 3.8-5 7-5s5.8 1.6 7 5"/></svg>';
 var root=null,modoForm=false,sug=[],si=-1,tq=null,salvando=false;
 function msg(t,c){var m=root&&root.querySelector('.agfc-msg');if(!m)return;m.textContent=t||'';m.className='agfc-msg'+(c?' '+c:'');}
 function pinta(){if(!root)return;
  var h='<div class="agfc-h">'+IC+'<span>Cliente da simulação</span></div>';
  if(!P){
   h+='<p class="agfc-s">Busque o cliente ou o lead do CRM para salvar esta simulação no nome dele. Você pode salvar quantas quiser.</p>'+
    '<div class="agfc-q"><input type="search" placeholder="Nome do cliente ou lead" autocomplete="off" enterkeyhint="search" aria-label="Buscar cliente"><div class="agfc-sug" role="listbox"></div></div><div class="agfc-msg"></div>';
  }else{
   var sub=[P.tipo,P.dono?'com '+pnome(P.dono):''].filter(Boolean).join(' · ');
   h+='<div class="agfc-ch"><span class="av">'+esc((P.nome||'?').trim().charAt(0).toUpperCase())+'</span><span class="tx"><b>'+esc(P.nome)+'</b>'+(sub?'<small>'+esc(sub)+'</small>':'')+'</span><button type="button" class="agfc-lk" data-a="tr">Trocar</button></div>'+
    (ATUAL?'<div class="agfc-at">Aberta: <b>'+esc(ATUAL.titulo||'')+'</b>. Mexa nos números e salve de novo para criar outra.</div>':'');
   if(modoForm){
    h+='<div class="agfc-fm"><label for="agfc_ti">Nome desta simulação</label><input id="agfc_ti" class="agfc-ti" maxlength="140" placeholder="Ex.: Opção com lance de 30%" autocomplete="off" enterkeyhint="done">'+
     '<div class="agfc-bt"><button type="button" class="sec" data-a="cn">Cancelar</button><button type="button" class="pri" data-a="ok"'+(salvando?' disabled':'')+'>'+(salvando?'Salvando…':'Salvar')+'</button></div></div>';
   }else{
    h+='<div class="agfc-bt"><button type="button" class="pri" data-a="sv">Salvar para '+esc(pnome(P.nome)||'o cliente')+'</button><button type="button" class="sec" data-a="ls">Salvas'+(NSALVAS!=null?' <span class="n">'+NSALVAS+'</span>':'')+'</button></div>';
   }
   h+='<div class="agfc-msg"></div>';}
  root.innerHTML=h;
  if(!P){liga();return;}
  var b;
  if((b=root.querySelector('[data-a=tr]')))b.onclick=function(){setP(null);var q=root.querySelector('.agfc-q input');if(q)q.focus();};
  if((b=root.querySelector('[data-a=sv]')))b.onclick=function(){modoForm=true;pinta();var t=D.getElementById('agfc_ti');if(t){t.focus();}};
  if((b=root.querySelector('[data-a=cn]')))b.onclick=function(){modoForm=false;pinta();};
  if((b=root.querySelector('[data-a=ok]')))b.onclick=salvar;
  var ti=D.getElementById('agfc_ti');if(ti)ti.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();salvar();}};
  if((b=root.querySelector('[data-a=ls]')))b.onclick=janela;}
 function liga(){var q=root.querySelector('.agfc-q input'),box=root.querySelector('.agfc-sug');
  function mostra(){var t=q.value.trim();if(t.length<2){box.classList.remove('on');return;}
   box.innerHTML=sug===null?'<button type="button" class="vz" disabled>Buscando…</button>':(sug.length?sug.map(function(p,i){return '<button type="button" role="option" data-i="'+i+'" class="'+(i===si?'on':'')+'">'+esc(p.nome)+'<small>'+esc([p.tipo,p.dono?'com '+pnome(p.dono):'',p.tel].filter(Boolean).join(' · '))+'</small></button>';}).join(''):'<button type="button" class="vz" disabled>Ninguém com esse nome no CRM.</button>');
   box.classList.add('on');
   [].forEach.call(box.querySelectorAll('[data-i]'),function(b){b.onmousedown=function(e){e.preventDefault();};b.onclick=function(){escolhe(sug[+b.getAttribute('data-i')]);};});}
  function escolhe(p){if(!p)return;box.classList.remove('on');setP(p);toast('Simulação ligada a '+p.nome+'.');}
  q.oninput=function(){var t=q.value.trim();si=-1;clearTimeout(tq);if(t.length<2){sug=[];mostra();return;}sug=null;mostra();
   tq=setTimeout(function(){req('/api/ferr/pessoas?q='+encodeURIComponent(t)).then(function(j){if(q.value.trim()!==t)return;sug=(j&&j.pessoas)||[];mostra();})
    .catch(function(e){if(q.value.trim()!==t)return;sug=[];box.classList.remove('on');msg(e.message,'er');});},260);};
  q.onfocus=function(){if(q.value.trim().length>=2&&sug)mostra();};
  q.onblur=function(){setTimeout(function(){box.classList.remove('on');},180);};
  q.onkeydown=function(e){if(!box.classList.contains('on')||!sug||!sug.length)return;
   if(e.key==='ArrowDown'){si=Math.min(sug.length-1,si+1);mostra();e.preventDefault();}
   else if(e.key==='ArrowUp'){si=Math.max(0,si-1);mostra();e.preventDefault();}
   else if(e.key==='Enter'){escolhe(sug[si<0?0:si]);e.preventDefault();}
   else if(e.key==='Escape')box.classList.remove('on');};}

 function salvar(){if(salvando||!P)return;var ti=D.getElementById('agfc_ti'),titulo=ti?ti.value.trim():'';
  salvando=true;pinta();var t2=D.getElementById('agfc_ti');if(t2)t2.value=titulo;msg('Gerando o PDF da simulação…');
  var est=estado(),res=resumo(),semPdf='';
  geraPDF().catch(function(e){semPdf=(e&&e.message)||'erro';return null;}).then(function(pdf){
   msg('Salvando para '+P.nome+'…');
   var fd=new FormData();fd.append('pessoa',JSON.stringify({lead_id:P.lead_id,cliente_id:P.cliente_id}));fd.append('ferramenta',PAG);
   fd.append('titulo',titulo);fd.append('resumo',res);fd.append('estado',est);if(pdf)fd.append('pdf',pdf,'simulacao.pdf');
   return req('/api/ferr/salvar',{method:'POST',body:fd});})
  .then(function(j){salvando=false;modoForm=false;NSALVAS=(NSALVAS||0)+1;ATUAL={id:j.id,titulo:j.titulo};pinta();
    msg(semPdf?'Salvo sem o PDF ('+semPdf+'). Os números ficaram guardados.':'Salvo para '+P.nome+': '+j.titulo+'.',semPdf?'er':'ok');
    toast('Simulação salva para '+pnome(P.nome)+'.');})
  .catch(function(e){salvando=false;pinta();msg(e.message||'Não consegui salvar.','er');});}

 function janela(){css();var bg=D.createElement('div');bg.className='agfm-bg';bg.setAttribute('data-html2canvas-ignore','true');
  bg.innerHTML='<div class="agfm" role="dialog" aria-modal="true"><div class="agfm-hd"><div><div class="k">Simulações salvas</div><h3>'+esc(P.nome)+'</h3></div><button type="button" class="x" aria-label="Fechar">×</button></div>'+
   '<div class="agfm-bd"></div><div class="agfm-ft">Para criar outra, ajuste os números na ferramenta e toque em <b>Salvar</b>. As salvas aparecem também no card do CRM e na ficha do cliente.</div></div>';
  D.body.appendChild(bg);var ov=D.documentElement.style.overflow;D.documentElement.style.overflow='hidden';
  function fecha(){bg.remove();D.documentElement.style.overflow=ov;D.removeEventListener('keydown',kd);}
  function kd(e){if(e.key==='Escape')fecha();}
  D.addEventListener('keydown',kd);bg.querySelector('.x').onclick=fecha;bg.onclick=function(e){if(e.target===bg)fecha();};
  lista(bg.querySelector('.agfm-bd'),{lead_id:P.lead_id,cliente_id:P.cliente_id,excluir:true,aba:PAG,
   abrir:function(x){if(x.ferramenta===PAG){fecha();abreItem(x.id);}else{location.href='/'+x.ferramenta+'?ag_ferr='+encodeURIComponent(x.id);}},
   onCarregou:function(L){NSALVAS=L.length;pinta();},
   onExcluiu:function(x,L){NSALVAS=L.length;if(ATUAL&&ATUAL.id===x.id)ATUAL=null;pinta();}});}

 /* abrir uma salva (do pop-up, do CRM ou da ficha: ?ag_ferr=ID) */
 function abreItem(id){if(abrindo)return;abrindo=true;msg('Abrindo a simulação…');
  req('/api/ferr/item/'+encodeURIComponent(id)).then(function(j){abrindo=false;var it=j.item||{};
   if(it.ferramenta&&it.ferramenta!==PAG){location.href='/'+it.ferramenta+'?ag_ferr='+encodeURIComponent(id);return;}
   P={lead_id:it.lead_id,cliente_id:it.cliente_id,cadastro_id:it.cadastro_id,nome:it.nome,tipo:it.tipo_pessoa,dono:(P&&P.nome===it.nome)?P.dono:''};guarda();
   if(!P.dono)req('/api/ferr/pessoa?'+(P.cliente_id?'cliente_id='+encodeURIComponent(P.cliente_id):'lead_id='+encodeURIComponent(P.lead_id))).then(function(k){if(P&&k&&k.pessoa){P.dono=k.pessoa.dono||'';guarda();if(!modoForm&&!salvando)pinta();}}).catch(function(){});
   var e=String(it.estado||'');
   if(/^s=/.test(e)){var m=/[?&]s=([^&#]*)/.exec(location.search);
    if(!m||('s='+m[1])!==e){location.replace(location.pathname+'?'+e+'&ag_ferr='+encodeURIComponent(id));return;}}
   else if(e.charAt(0)==='{'){try{aplicaGen(JSON.parse(e));}catch(x){}}
   ATUAL={id:it.id,titulo:it.titulo};fNome();pinta();conta();msg('');toast('Aberta: '+(it.titulo||'simulação')+'.');})
  .catch(function(e){abrindo=false;pinta();msg(e.message||'Não abriu a simulação.','er');});}

 function inicia(){var par=D.getElementById('params');if(!par||D.getElementById('agfc'))return;if(!tokLocal())return;
  css();root=D.createElement('div');root.id='agfc';root.className='noprint';root.setAttribute('data-html2canvas-ignore','true');
  par.insertBefore(root,par.firstElementChild);
  var qs=new URLSearchParams(location.search),fid=qs.get('ag_ferr'),ld=qs.get('ag_lead'),cl=qs.get('ag_cli');
  if(fid){P=lida();pinta();abreItem(fid);return;}
  if(ld||cl){pinta();msg('Buscando o cliente…');
   req('/api/ferr/pessoa?'+(cl?'cliente_id='+encodeURIComponent(cl):'lead_id='+encodeURIComponent(ld))).then(function(j){setP(j.pessoa);msg('');})
    .catch(function(e){msg(e.message||'Cliente não encontrado.','er');});return;}
  var p=lida();if(p)setP(p);else pinta();}
 if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',function(){setTimeout(inicia,0);});else setTimeout(inicia,0);
 W.AgFerrCli.painel={estado:estado,abreItem:abreItem,pessoa:function(){return P;}};
})(window,document);
