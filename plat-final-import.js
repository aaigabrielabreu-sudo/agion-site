/* ==========================================================================
   Agion — plat-final-import.js · FINALIMP_20261021
   Importa o "Resultado de Assembleia Final" da HS (PDF do GDI) para a tabela assembleias_final.
   Usado em Melhores cartas disponíveis e em Ferramentas › Assembleias.
   - Lê o PDF no navegador (pdf.js), coluna por coluna: Grupo | Sorteio Ativa | Excluída |
     Lance Fixo | Seg. Fixo | Livre | Limitado | Fidelidade. Cada lance vem como "cota [parcelas]".
   - Mostra a conferência antes de gravar (grupos, contemplações, o que mudou em relação ao
     resultado do mês). Nada é gravado sem o "Gravar".
   - O resultado final do mês substitui o resultado do mês na plataforma (o do mês continua guardado).
   - PDF que é só imagem (escaneado) não tem texto para ler: avisa e não grava nada.
   Uso: AgionFinal.abrir({sb: clienteSupabase, onDone: function(info){...}})
   ========================================================================== */
(function(){
'use strict';
var W=window,D=document;
var PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
var MESES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
var KEYS=['ativa','excluida','fixo','fixo2','livre','limitado','fidelidade'];
var NOME={ativa:'Sorteio',excluida:'Excluídas',fixo:'Lance fixo',fixo2:'2º fixo',livre:'Lance livre',limitado:'Limitado',fidelidade:'Fidelidade'};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function mesLb(m){var p=String(m).split('-');return MESES[(+p[1]||1)-1]+'/'+p[0];}

function loadPdfJs(){return new Promise(function(res,rej){if(W.pdfjsLib)return res(W.pdfjsLib);
 var s=D.createElement('script');s.src=PDFJS+'pdf.min.js';s.onload=function(){try{W.pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS+'pdf.worker.min.js';}catch(e){}res(W.pdfjsLib);};
 s.onerror=function(){rej(new Error('Não foi possível carregar o leitor de PDF.'));};D.head.appendChild(s);});}

/* ---------------- leitura ---------------- */
var HDR=[[/^Grupo$/i,'grupo'],[/^Ativa$/i,'ativa'],[/^Exclu/i,'excluida'],[/^Seg\.?(\s*Fixo)?$/i,'fixo2'],[/^Fixo$/i,'fixo'],[/^Livre$/i,'livre'],[/^Limitado$/i,'limitado'],[/^Fidelidade$/i,'fidelidade']];
function cabecalho(items){var xs={};
 items.forEach(function(it){var t=it.str.trim();for(var i=0;i<HDR.length;i++){if(HDR[i][0].test(t)){var k=HDR[i][1];
   if(k==='fixo'&&xs.fixo2!=null&&it.x>xs.fixo2)continue;   /* o "Fixo" de "Seg. Fixo" */
   if(xs[k]==null)xs[k]=it.x;break;}}});
 if(xs.ativa==null&&xs.grupo!=null&&xs.excluida!=null)xs.ativa=xs.grupo+(xs.excluida-xs.grupo)*0.29;
 if(xs.grupo==null&&xs.ativa!=null&&xs.excluida!=null)xs.grupo=xs.ativa-(xs.excluida-xs.ativa)*0.41;
 var n=Object.keys(xs).length;return n>=6?xs:null;}
function colunas(xs){var ord=Object.keys(xs).sort(function(a,b){return xs[a]-xs[b];});return ord.map(function(k,i){return {k:k,ate:i+1<ord.length?xs[ord[i+1]]:1e9};});}
function colDe(x,cols){for(var i=0;i<cols.length;i++){if(x<cols[i].ate-3)return cols[i].k;}return cols[cols.length-1].k;}
function limpa(s){
 s=s.replace(/Com\s+(\d+)\s+parcelas\s+Cota\s+indicada\s*\[\s*(\d+)\s*\]\s*\(?\s*Conf\s+com\s+Adm\s*\)?/gi,function(_,p,c){return c+' ['+p+'] *';});
 s=s.replace(/https?:\/\/\S+|gdi\.hsconsorcios\.com\.br\S*/g,' ').replace(/\b\d{2}\/\d{2}\/\d{4},?|\b\d{2}:\d{2}(:\d{2})?\b/g,' ');
 s=s.replace(/GDI\s*-?\s*HS\s*Cons[oó]rcios/gi,' ').replace(/N[aã]o\s+possui\s+Cotas\s+aptas/gi,' ').replace(/[A-Za-zÀ-ú()]+/g,' ');
 return s;}
function itens(txt,col){var s=limpa(txt).replace(/\*/g,' ');s=s.replace(/(\d)-\s+(\d)/g,'$1-$2').replace(/\[\s*(\d+)\s*\]/g,'[$1]');var out=[];
 s.split('/').forEach(function(p){p=p.trim();if(!p||p==='-')return;var rx=/(\d+)(?:-(\d+))?(?:\s*\[(\d+)\])?/g,m;
  while((m=rx.exec(p))){out.push({cota:+m[1],versao:m[2]?+m[2]:null,parc:m[3]?+m[3]:null});}});
 return out;}
async function lerPdf(file){
 var lib=await loadPdfJs(),buf=await file.arrayBuffer(),doc=await lib.getDocument({data:buf}).promise;
 var xs=null,cols=null,grupos=[],cur=null,temTexto=false;
 for(var p=1;p<=doc.numPages;p++){var pg=await doc.getPage(p),vp=pg.getViewport({scale:1}),tc=await pg.getTextContent();
  var its=tc.items.filter(function(i){return i.str&&i.str.trim();}).map(function(i){return {str:i.str,x:i.transform[4],top:vp.height-i.transform[5]};});
  if(its.length>5)temTexto=true;
  var hx=cabecalho(its),hb=0;
  if(hx){xs=hx;cols=colunas(xs);its.forEach(function(i){if(HDR.some(function(h){return h[0].test(i.str.trim());}))hb=Math.max(hb,i.top);});}
  if(!cols)continue;
  its=its.filter(function(i){return i.top>hb+1;}).sort(function(a,b){return Math.round(a.top)-Math.round(b.top)||a.x-b.x;});
  its.forEach(function(i){var c=colDe(i.x,cols),t=i.str.trim();
   if(c==='grupo'){if(/^\d{2,5}$/.test(t)){cur={grupo:+t,cel:{}};grupos.push(cur);}return;}
   if(!cur)return;(cur.cel[c]=cur.cel[c]||[]).push(t);});}
 if(!temTexto)throw new Error('IMAGEM');
 if(!cols)throw new Error('CABECALHO');
 var vistos={};return grupos.filter(function(g){if(vistos[g.grupo])return false;vistos[g.grupo]=1;return true;}).map(function(g){var r={grupo:g.grupo};KEYS.forEach(function(k){r[k]=itens((g.cel[k]||[]).join(' '),k);});return r;});}
function fmt(i,k){if(k==='ativa')return String(i.cota);if(k==='excluida')return i.cota+'-'+(i.versao==null?1:i.versao);return i.parc!=null?i.cota+' ['+i.parc+']':String(i.cota);}
function paraBanco(g,tipo,mes,arq){var det={},n={};KEYS.forEach(function(k){det[k]=g[k].map(function(i){return fmt(i,k);});n[k]=g[k].length;});
 var pf=g.fixo.map(function(i){return i.parc;}).filter(function(x){return x!=null;});
 return {administradora:'HS',tipo:tipo,mes_ref:mes,grupo:String(g.grupo),sorteio:n.ativa,excluidos:n.excluida,lance_fixo:n.fixo,lance_fixo2:n.fixo2,lance_livre:n.livre,lance_limitado:n.limitado,lance_fidelidade:n.fidelidade,
  contemplados:n.ativa+n.fixo+n.fixo2+n.livre+n.limitado+n.fidelidade,lance_parcelas:pf.length?Math.min.apply(null,pf):null,detalhes:det,fonte:'importado',conferir:0,arquivo:arq};}
function assinatura(rows){return rows.map(function(r){return r.grupo+':'+((r.detalhes||{}).ativa||[]).join(',');}).sort().join('|');}

/* ---------------- tela ---------------- */
var CSS='\
.afi-bg{position:fixed;inset:0;z-index:2147480000;background:rgba(7,28,25,.55);display:flex;align-items:center;justify-content:center;padding:14px;font-family:"Poppins","DM Sans",system-ui,sans-serif}\
.afi{background:#fff;color:#0a2823;border-radius:20px;max-width:620px;width:100%;max-height:calc(100vh - 28px);overflow:auto;padding:22px;box-shadow:0 30px 80px -20px rgba(0,0,0,.45)}\
.afi h3{margin:0 0 4px;font:600 21px/1.25 "Lora",Georgia,serif}.afi p{margin:0 0 12px;color:#586b62;font-size:13px;line-height:1.5}\
.afi .r{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px}.afi label{font-size:10.5px;letter-spacing:1.3px;text-transform:uppercase;color:#8a9089;font-weight:600;display:block;margin-bottom:5px}\
.afi select,.afi input[type=month]{height:40px;border:1px solid #e0d6bf;border-radius:11px;padding:0 10px;font:inherit;font-size:13.5px;background:#fff;color:#0a2823}\
.afi .drop{border:1.5px dashed #c5a059;border-radius:14px;padding:20px;text-align:center;cursor:pointer;background:#fbf7ee;font-size:13.5px}\
.afi .drop b{display:block;margin-bottom:4px}.afi .drop small{color:#8a9089}\
.afi .k{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}.afi .k div{background:#faf8f2;border:1px solid #efe7d4;border-radius:12px;padding:9px 10px}\
.afi .k small{display:block;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#8a9089;font-weight:600}.afi .k b{font:600 19px "Lora",Georgia,serif}\
.afi .av{background:#fff4dc;border:1px solid #e8cc8b;color:#6b4d12;border-radius:12px;padding:9px 12px;font-size:12.5px;line-height:1.45;margin:8px 0}\
.afi .er{background:#fbe9e7;border:1px solid #f0b8ae;color:#8a2a1c;border-radius:12px;padding:9px 12px;font-size:12.5px;line-height:1.45;margin:8px 0}\
.afi .ok{background:#e8f4ed;border:1px solid #b7dfc9;color:#1d5a3f;border-radius:12px;padding:9px 12px;font-size:12.5px;line-height:1.45;margin:8px 0}\
.afi table{width:100%;border-collapse:collapse;font-size:12px;margin-top:6px}.afi td,.afi th{padding:6px 6px;border-bottom:1px solid #efe7d4;text-align:left;vertical-align:top}.afi th{font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#8a9089}\
.afi .bt{display:flex;gap:8px;justify-content:flex-end;margin-top:14px}.afi button{border:1px solid #e0d6bf;background:#fff;border-radius:999px;padding:9px 16px;font:600 13px inherit;cursor:pointer;color:#0a2823;font-family:inherit}\
.afi button.g{background:linear-gradient(135deg,#d9b56c,#b78f43);border:0;color:#1d1405}.afi button:disabled{opacity:.45;cursor:default}\
@media (max-width:560px){.afi{padding:16px;border-radius:16px}.afi .k{grid-template-columns:repeat(2,1fr)}}';
function css(){if(D.getElementById('afi-css'))return;var s=D.createElement('style');s.id='afi-css';s.textContent=CSS;D.head.appendChild(s);}
function mesPadrao(){var d=new Date();d.setDate(1);d.setMonth(d.getMonth()-1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');}

function abrir(o){o=o||{};css();var sb=o.sb;if(!sb){alert('Sem conexão com o banco.');return;}
 var bg=D.createElement('div');bg.className='afi-bg';bg.innerHTML='<div class="afi" role="dialog" aria-modal="true"><h3>Importar resultado final</h3>'+
  '<p>O PDF “Resultado de Assembleia Final” da HS (GDI › Resultado Assembleia Final), que sai no início do mês seguinte. Ele substitui o resultado do mês na plataforma: é o resultado real, depois que a HS passou a vez de quem não confirmou o lance.</p>'+
  '<div class="r"><div><label>Categoria</label><select id="afiT"><option value="IMOVEL">Imóvel</option><option value="AUTOMOVEL">Automóvel</option></select></div>'+
  '<div><label>Mês da assembleia</label><input type="month" id="afiM" value="'+mesPadrao()+'"></div></div>'+
  '<div class="drop" id="afiD" tabindex="0" role="button"><b>Escolher o PDF do resultado final</b><small>Clique ou arraste o arquivo aqui · nada é gravado antes da conferência</small><input type="file" accept="application/pdf,.pdf" hidden id="afiF"></div>'+
  '<div id="afiO"></div><div class="bt"><button id="afiX">Fechar</button><button class="g" id="afiG" disabled>Gravar resultado final</button></div></div>';
 D.body.appendChild(bg);
 var st={rows:null,file:null};
 function fecha(){bg.remove();}
 bg.querySelector('#afiX').onclick=fecha;bg.addEventListener('click',function(e){if(e.target===bg)fecha();});
 var dz=bg.querySelector('#afiD'),fi=bg.querySelector('#afiF'),out=bg.querySelector('#afiO'),gv=bg.querySelector('#afiG');
 dz.onclick=function(){fi.click();};dz.onkeydown=function(e){if(e.key==='Enter'||e.key===' ')fi.click();};
 dz.ondragover=function(e){e.preventDefault();};dz.ondrop=function(e){e.preventDefault();if(e.dataTransfer.files[0])processa(e.dataTransfer.files[0]);};
 fi.onchange=function(){if(fi.files[0])processa(fi.files[0]);};
 bg.querySelector('#afiT').onchange=function(){if(st.file)processa(st.file,1);};bg.querySelector('#afiM').onchange=function(){if(st.file)processa(st.file,1);};
 async function processa(f,manual){st.file=f;gv.disabled=true;out.innerHTML='<p style="margin-top:12px">Lendo '+esc(f.name)+'…</p>';
  var gs;try{gs=await lerPdf(f);}catch(e){
   out.innerHTML=e.message==='IMAGEM'?'<div class="er"><b>Este PDF é uma imagem</b> (foi escaneado ou impresso como figura), então não tem texto para a plataforma ler. Baixe de novo pelo GDI; se continuar assim, me mande o arquivo que eu leio por fora.</div>':
    e.message==='CABECALHO'?'<div class="er">Não reconheci a tabela do resultado final neste PDF (colunas Grupo, Ativa, Excluída, Fixo, Seg. Fixo, Livre, Limitado). Confira se é o arquivo certo.</div>':'<div class="er">Não consegui ler o PDF: '+esc(e.message||e)+'</div>';return;}
  if(!gs.length){out.innerHTML='<div class="er">Não encontrei nenhum grupo neste PDF.</div>';return;}
  var med=gs.map(function(g){return g.grupo;}).sort(function(a,b){return a-b;})[Math.floor(gs.length/2)],tSel=bg.querySelector('#afiT');
  if(!manual)tSel.value=med>=1000?'IMOVEL':'AUTOMOVEL';
  var tipo=tSel.value,mes=bg.querySelector('#afiM').value;if(!/^\d{4}-\d{2}$/.test(mes)){out.innerHTML='<div class="er">Escolha o mês da assembleia.</div>';return;}
  var rows=gs.map(function(g){return paraBanco(g,tipo,mes,f.name);});st.rows=rows;
  var tot={};KEYS.forEach(function(k){tot[k]=rows.reduce(function(a,r){return a+(r.detalhes[k]||[]).length;},0);});
  var cont=rows.reduce(function(a,r){return a+r.contemplados;},0);
  var avis=[];if((tipo==='IMOVEL')!==(med>=1000))avis.push('Os números dos grupos parecem de '+(med>=1000?'imóvel':'automóvel')+', mas a categoria escolhida é '+(tipo==='IMOVEL'?'imóvel':'automóvel')+'.');
  var h='<div class="k"><div><small>Grupos</small><b>'+rows.length+'</b></div><div><small>Contemplações</small><b>'+cont+'</b></div><div><small>Sorteio</small><b>'+tot.ativa+'</b></div><div><small>Lances</small><b>'+(tot.fixo+tot.fixo2+tot.livre+tot.limitado+tot.fidelidade)+'</b></div></div>';
  out.innerHTML=h+'<p>Conferindo com o que já está na plataforma…</p>';
  /* já existe final deste mês? conteúdo igual a outro mês? (o GDI já teve arquivo com o mês errado) */
  var ja=await sb.from('assembleias_final').select('grupo,mes_ref,detalhes').eq('tipo',tipo).eq('mes_ref',mes).limit(1000);
  var men=await sb.from('assembleias_resultado').select('grupo,detalhes,contemplados').eq('tipo',tipo).eq('mes_ref',mes).limit(1000);
  var sig=assinatura(rows);
  if(ja.data&&ja.data.length){if(assinatura(ja.data)===sig)avis.push('Este resultado final de '+mesLb(mes)+' já está na plataforma, igualzinho. Gravar de novo não muda nada.');else avis.push('Já existe um resultado final de '+mesLb(mes)+' na plataforma ('+ja.data.length+' grupos). Gravar substitui pelo deste PDF.');}
  var viz=await sb.from('assembleias_final').select('mes_ref,grupo,detalhes').eq('tipo',tipo).neq('mes_ref',mes).in('grupo',rows.slice(0,8).map(function(r){return r.grupo;})).limit(2000);
  if(viz.data&&viz.data.length){var porMes={};viz.data.forEach(function(r){(porMes[r.mes_ref]=porMes[r.mes_ref]||{})[r.grupo]=((r.detalhes||{}).ativa||[]).join(',');});
   var am={};rows.slice(0,8).forEach(function(r){am[r.grupo]=r.detalhes.ativa.join(',');});
   Object.keys(porMes).forEach(function(m){var com=Object.keys(am).filter(function(g){return porMes[m][g]!=null;});if(com.length>=4&&com.every(function(g){return porMes[m][g]===am[g];}))avis.push('Atenção: o sorteio deste PDF é igual ao de '+mesLb(m)+'. Confira se o arquivo é mesmo de '+mesLb(mes)+' (no GDI já teve arquivo com o mês trocado).');});}
  var dif='';if(men.data&&men.data.length){var mm={};men.data.forEach(function(r){mm[r.grupo]=r;});var mud=[];
   rows.forEach(function(r){var a=mm[r.grupo];if(!a)return;var da=a.detalhes||{};if(typeof da==='string'){try{da=JSON.parse(da);}catch(e){da={};}}
    var ch=[];['ativa','fixo','fixo2','livre','limitado'].forEach(function(k){var x=(da[k]||[]).map(String).sort().join(','),y=(r.detalhes[k]||[]).map(String).sort().join(',');if(x!==y)ch.push(NOME[k]);});if(ch.length)mud.push([r.grupo,ch]);});
   dif='<div class="ok">O resultado do mês de '+mesLb(mes)+' já estava na plataforma. <b>'+mud.length+' de '+rows.length+' grupos mudaram</b> no final (quem não confirmou o lance perdeu a vez).'+(mud.length?'</div><table><thead><tr><th>Grupo</th><th>O que mudou</th></tr></thead><tbody>'+mud.slice(0,12).map(function(x){return '<tr><td><b>'+x[0]+'</b></td><td>'+x[1].join(', ')+'</td></tr>';}).join('')+(mud.length>12?'<tr><td colspan="2">… e mais '+(mud.length-12)+'</td></tr>':'')+'</tbody></table>':'</div>');}
  else dif='<p>O resultado do mês de '+mesLb(mes)+' não estava na plataforma; o final entra direto.</p>';
  out.innerHTML=h+avis.map(function(a){return '<div class="av">'+esc(a)+'</div>';}).join('')+dif+'<p style="margin-top:10px">'+esc(f.name)+' · '+(tipo==='IMOVEL'?'Imóvel':'Automóvel')+' · '+mesLb(mes)+'. Confira e toque em “Gravar resultado final”.</p>';
  gv.disabled=false;}
 gv.onclick=async function(){if(!st.rows)return;gv.disabled=true;gv.textContent='Gravando…';var err=null;
  for(var i=0;i<st.rows.length;i+=300){var r=await sb.from('assembleias_final').upsert(st.rows.slice(i,i+300),{onConflict:'administradora,tipo,mes_ref,grupo'});if(r.error){err=r.error;break;}}
  if(err){gv.textContent='Gravar resultado final';gv.disabled=false;out.insertAdjacentHTML('beforeend','<div class="er">Não gravou: '+esc(err.message)+(/row-level|permission|policy/i.test(err.message)?' (só o master importa)':'')+'</div>');return;}
  var info={tipo:st.rows[0].tipo,mes:st.rows[0].mes_ref,grupos:st.rows.length};fecha();try{o.onDone&&o.onDone(info);}catch(e){}};
}
W.AgionFinal={abrir:abrir,lerPdf:lerPdf,paraBanco:paraBanco};
})();
