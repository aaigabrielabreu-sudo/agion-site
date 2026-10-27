/* ==========================================================================
   Agion — plat2-cal.js · CALENDARIO_23OUT + CAL_APPLE_23OUT
   Aba Calendário (Comercial), no jeito do Calendário da Apple: Dia, Semana, Mês e Ano;
   "Calendários" para ligar e desligar cada agenda; clicar num horário cria um evento.
   Eventos criados aqui vão para a agenda Google da Agion da pessoa (nome@agionconsorcios.com.br).
   Google pessoal, Outlook e Apple recebem uma cópia (assinatura .ics), só para ver.
   CAL_EXT_23OUT: e o caminho contrário — agendas do Google pessoal, Outlook e iCloud aparecem aqui (só para ver).
   Roda dentro do /plat2-v4.html.
   ========================================================================== */
(function(){
'use strict';
var W=window;
function e4(s){ return esc4(s); }
function z(n){ return (n<10?'0':'')+n; }
var TIPOS=[['evento','Agenda Agion','#C2724A','cal','Evento'],['tarefa','Tarefas','#C5A059','check','Tarefa'],['reuniao','Reuniões','#5B8FB9','cal','Reunião'],['crm','Prazos do CRM','#C99A2E','funnel','Prazo do CRM'],['proposta','Propostas','#3F8F6A','doc','Proposta'],['assembleia','Assembleias','#8E6FB5','trophy','Assembleia']];
var TC={}; TIPOS.forEach(function(t){ TC[t[0]]=t; });
var VISTAS=[['dia','Dia'],['semana','Semana'],['mes','Mês'],['ano','Ano']];
var CS={ref:null,dia:null,vista:'mes',quem:'meus',off:{},offP:{},cust:[],ag:{email:'',google:false},carregado:false,ext:[],extEv:[],extJan:null,extBusy:false};
/* CAL_EXT_23OUT: agendas de fora ligadas/desligadas ficam lembradas */
try{ var ox=JSON.parse(localStorage.getItem('agcal_offx')||'{}'); Object.keys(ox).forEach(function(k){ if(k.charAt(0)==='x'&&ox[k]) CS.off[k]=true; }); }catch(e){}
try{ var vs=localStorage.getItem('agcal_vista'); if(vs&&/^(dia|semana|mes|ano)$/.test(vs)) CS.vista=vs; }catch(e){}
var HH=function(){ return W.innerWidth<860?44:48; };   /* altura de 1 hora na grade de Dia/Semana */
var mob=function(){ return W.innerWidth<860; };

(function(){ if(document.getElementById('calcss')) return; var s=document.createElement('style'); s.id='calcss'; s.textContent=
 '.calpage{display:grid;grid-template-columns:minmax(0,1.8fr) minmax(300px,1fr);grid-template-areas:"bar bar" "main side";gap:14px 18px;align-items:start}'+
 '.calbar{grid-area:bar;display:flex;align-items:center;gap:10px;flex-wrap:wrap}.calbar .sp{flex:1}.calmain{grid-area:main;min-width:0}.calside{grid-area:side;min-width:0;position:sticky;top:14px}'+
 '.calbar h3{font:500 26px Lora,serif;letter-spacing:-.01em;min-width:150px;color:var(--ink)}.calbar h3:first-letter{text-transform:uppercase}.calbar h3 span{color:var(--mut);font-weight:400}'+
 '.calnavg{display:flex;align-items:center;background:var(--card);border-radius:14px;box-shadow:var(--shadow);padding:3px}'+
 '.calnav{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;color:var(--ink2);transition:background .2s}.calnav:hover{background:var(--bg2)}'+
 '.calcb{display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 13px 0 11px;border-radius:13px;background:var(--card);box-shadow:var(--shadow);font:600 12.8px "DM Sans";color:var(--ink2)}'+
 '.calcb .cdots{display:inline-flex}.calcb .cdots i{width:8px;height:8px;border-radius:50%;margin-left:-2px;border:1.5px solid var(--card)}.calcb.on{box-shadow:0 0 0 2px var(--gold),var(--shadow)}'+
 '.calnew{display:inline-flex;align-items:center;gap:6px}'+
 '.calpm{padding:16px 16px 18px}'+
 /* ---- Mês ---- */
 '.cwdh{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));margin:0 0 8px}.cwdh div{font:700 10.5px "DM Sans";letter-spacing:.14em;text-transform:uppercase;color:var(--mut);padding:2px 10px}.cwdh div.fds{color:var(--mut2)}'+
 '.cmg{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:1px;background:var(--line);border:1px solid var(--line);border-radius:18px;overflow:hidden;user-select:none}'+
 '.cmg .dc{min-height:112px;background:var(--card);padding:8px 7px 7px;cursor:pointer;position:relative;display:flex;flex-direction:column;gap:3px;transition:background .2s;min-width:0}'+
 '.cmg .dc.fds{background:color-mix(in srgb,var(--bg) 55%,var(--card))}.cmg .dc:hover{background:color-mix(in srgb,var(--gold) 9%,var(--card))}'+
 '.cmg .dc.fora{background:color-mix(in srgb,var(--bg2) 45%,var(--card))}.cmg .dc.fora .dn{color:var(--mut2)}.cmg .dc.fora .cchip{opacity:.55}'+
 '.cmg .dc.sel{background:color-mix(in srgb,var(--gold) 20%,var(--card));box-shadow:inset 0 0 0 2px var(--gold)}'+
 '.cmg .dn{font:600 12.5px "DM Sans";min-width:26px;height:26px;padding:0 4px;border-radius:999px;display:inline-grid;place-items:center;align-self:flex-start;color:var(--ink2);margin-bottom:1px}'+
 '.dc.hoje .dn,.cwd.hoje b,.yd.hoje{background:var(--gg)!important;color:#0B2A26!important;font-weight:800;box-shadow:0 4px 12px -4px rgba(163,131,63,.7)}'+
 '.cmg .cplus{position:absolute;top:6px;right:6px;width:24px;height:24px;border-radius:8px;display:grid;place-items:center;background:var(--card);color:var(--goldd);box-shadow:var(--shadow);opacity:0;transform:scale(.85);transition:.2s}.cmg .dc:hover .cplus{opacity:1;transform:none}'+
 '.cmg .cchip{display:flex;flex-direction:column;font:600 11.4px/1.3 "DM Sans";padding:3px 7px;border-radius:7px;border-left:2.5px solid;color:var(--ink);min-width:0}'+
 '.cmg .cchip b{font:700 10px/1.25 "DM Sans";letter-spacing:.02em}.cmg .cchip span{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;min-width:0}'+
 '.cmg .mais{font:700 10.8px "DM Sans";color:var(--goldd);padding:1px 7px}.cmg .pts{display:none}'+
 /* ---- Dia / Semana ---- */
 '.cwk{--cols:7;border:1px solid var(--line);border-radius:18px;overflow:hidden;background:var(--card);user-select:none}'+
 '.cwh,.cwa,.cwb{display:grid;grid-template-columns:54px repeat(var(--cols),minmax(0,1fr))}'+
 '.cwh{border-bottom:1px solid var(--line)}.cwd{padding:9px 6px 8px;text-align:center;cursor:pointer;border-left:1px solid var(--line);transition:background .2s}.cwd:hover{background:var(--bg)}'+
 '.cwd small{display:block;font:700 10px "DM Sans";letter-spacing:.12em;text-transform:uppercase;color:var(--mut)}.cwd b{display:inline-grid;place-items:center;min-width:30px;height:30px;padding:0 5px;border-radius:999px;font:500 18px Lora,serif;color:var(--ink);margin-top:2px}'+
 '.cwd.sel{background:color-mix(in srgb,var(--gold) 14%,var(--card))}.cwd.fds small{color:var(--mut2)}'+
 '.cwa{border-bottom:1px solid var(--line);min-height:30px}.cwa .cgut{font:700 9.5px "DM Sans";letter-spacing:.06em;text-transform:uppercase;color:var(--mut);display:flex;align-items:center;justify-content:flex-end;padding-right:8px}'+
 '.cwac{border-left:1px solid var(--line);padding:3px;display:flex;flex-direction:column;gap:2px;min-width:0;cursor:pointer}'+
 '.cwac .cchip{font:600 11px/1.3 "DM Sans";padding:2px 7px;border-radius:6px;border-left:2.5px solid;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:var(--ink)}'+
 '.cws{max-height:640px;overflow-y:auto;position:relative;scrollbar-width:thin}'+
 '.cwb{position:relative}.cwb .cgut{position:relative}.cwb .cgut span{position:absolute;right:8px;transform:translateY(-50%);font:600 10.5px "DM Sans";color:var(--mut)}'+
 '.cwc{position:relative;border-left:1px solid var(--line);cursor:copy;background:linear-gradient(var(--line) 1px,transparent 1px) 0 0/100% var(--hh),linear-gradient(color-mix(in srgb,var(--line) 45%,transparent) 1px,transparent 1px) 0 calc(var(--hh)/2)/100% var(--hh)}'+
 '.cwc.fds{background-color:color-mix(in srgb,var(--bg) 40%,var(--card))}.cwc.hoje{background-color:color-mix(in srgb,var(--gold) 5%,var(--card))}'+
 '.cwe{position:absolute;border-radius:8px;border-left:3px solid;padding:3px 6px;overflow:hidden;cursor:pointer;font:600 11.5px/1.25 "DM Sans";color:var(--ink);transition:box-shadow .2s,transform .2s;z-index:1}'+
 '.cwe:hover{box-shadow:var(--shadow);z-index:3;transform:translateY(-1px)}.cwe b{display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.cwe small{display:block;font:600 10px "DM Sans";opacity:.75;white-space:nowrap}'+
 '.cwe.c1{display:flex;gap:5px;align-items:center;white-space:nowrap}.cwe.c1 small{order:-1;opacity:1;flex:none}'+
 '.cwnow{position:absolute;left:0;right:0;height:2px;background:#E5484D;z-index:4;pointer-events:none}.cwnow i{position:absolute;left:-5px;top:-4px;width:10px;height:10px;border-radius:50%;background:#E5484D}'+
 '.cwnowl{position:absolute;right:4px;transform:translateY(-50%);font:700 10px "DM Sans";color:#fff;background:#E5484D;padding:1px 4px;border-radius:5px;z-index:4}'+
 '.cwghost{position:absolute;left:3px;right:3px;border-radius:8px;border:1.5px dashed var(--gold);background:color-mix(in srgb,var(--gold) 14%,transparent);pointer-events:none;z-index:2}'+
 /* ---- Ano ---- */
 '.cany{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:22px 20px;padding:4px 4px 2px}'+
 '.cym h5{font:600 15px "DM Sans";color:var(--ink);margin:0 0 8px 2px;cursor:pointer;display:inline-block}.cym h5:first-letter{text-transform:uppercase}.cym h5:hover{color:var(--goldd)}.cym.atual h5{color:#E5484D}'+
 '.cyg{display:grid;grid-template-columns:repeat(7,1fr);gap:2px 0;text-align:center}.cyg .wd{font:700 9px "DM Sans";color:var(--mut);padding-bottom:3px}'+
 '.yd{font:600 11px "DM Sans";height:24px;width:24px;margin:0 auto;border-radius:50%;display:grid;place-items:center;color:var(--ink2);cursor:pointer;position:relative;transition:background .15s}.yd:hover{background:var(--bg2)}'+
 '.yd.t1{background:color-mix(in srgb,var(--gold) 16%,transparent)}.yd.t2{background:color-mix(in srgb,var(--gold) 32%,transparent)}.yd.t3{background:color-mix(in srgb,var(--gold) 55%,transparent);color:#0B2A26}.yd.sel{box-shadow:0 0 0 1.5px var(--gold)}'+
 /* ---- painel do dia ---- */
 '.cdia{padding:20px 18px 16px}.cdhd{display:flex;align-items:center;gap:14px;margin-bottom:16px}'+
 '.cdt{width:58px;height:64px;border-radius:17px;background:var(--sb);color:var(--gold2);display:flex;flex-direction:column;align-items:center;justify-content:center;flex:none;box-shadow:var(--shadow)}'+
 '.cdt small{font:700 10px "DM Sans";letter-spacing:.16em;text-transform:uppercase;opacity:.8}.cdt b{font:500 27px/1 Lora,serif;margin-top:2px}'+
 '.cdhd h4{font:600 17px "DM Sans";text-transform:capitalize;color:var(--ink)}.cdhd p{font-size:12.5px;color:var(--mut);margin-top:3px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}'+
 '.cdhd .cbdg{font:700 10.5px "DM Sans";letter-spacing:.06em;text-transform:uppercase;padding:3px 8px;border-radius:999px;background:var(--au);color:var(--aut)}'+
 '.cdhd .sp{flex:1}.cdhd .cadd{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;background:var(--bg);color:var(--goldd);flex:none;transition:background .2s}.cdhd .cadd:hover{background:var(--bg2)}'+
 '.ctl{display:flex;flex-direction:column;gap:8px}'+
 '.cali{display:grid;grid-template-columns:52px minmax(0,1fr);gap:10px;align-items:stretch;cursor:pointer}'+
 '.cali .h{font:700 12.5px "DM Sans";text-align:right;color:var(--ink2);padding-top:11px}.cali .h.td{font-size:10.5px;letter-spacing:.04em;color:var(--mut);text-transform:uppercase;padding-top:12px}'+
 '.cali .cbox{border-radius:14px;padding:10px 12px 10px 13px;border-left:3px solid;transition:transform .25s var(--ez),box-shadow .25s;min-width:0}'+
 '.cali:hover .cbox{transform:translateX(3px);box-shadow:var(--shadow)}.cali .cbox b{display:block;font:600 13.6px/1.35 "DM Sans";color:var(--ink)}'+
 '.cali .cbox small{display:flex;align-items:center;gap:6px;font-size:11.8px;color:var(--mut);margin-top:4px;flex-wrap:wrap}.cali .cbox small em{font-style:normal;font-weight:700;font-size:10.5px;letter-spacing:.04em;text-transform:uppercase}'+
 '.cvazio{text-align:center;padding:22px 10px 14px;color:var(--mut)}.cvazio .ic{width:52px;height:52px;border-radius:18px;margin:0 auto 10px;display:grid;place-items:center;background:var(--bg);color:var(--goldd)}.cvazio b{display:block;font:600 14.5px "DM Sans";color:var(--ink);margin-bottom:3px}.cvazio small{font-size:12.5px}'+
 '.cprox{margin-top:18px;padding-top:14px;border-top:1px solid var(--line)}.cprox h5{font:700 10.5px "DM Sans";letter-spacing:.14em;text-transform:uppercase;color:var(--mut);margin-bottom:8px}'+
 '.cpx{display:flex;align-items:center;gap:11px;padding:7px 6px;border-radius:12px;cursor:pointer;transition:background .2s}.cpx:hover{background:var(--bg)}'+
 '.cpx .cpdt{width:38px;flex:none;text-align:center;line-height:1.05}.cpx .cpdt small{display:block;font:700 9.5px "DM Sans";letter-spacing:.1em;text-transform:uppercase;color:var(--mut)}.cpx .cpdt b{font:500 18px Lora,serif;color:var(--ink);display:block}.cpx .cpdt em{display:block;font:700 9px "DM Sans";letter-spacing:.1em;text-transform:uppercase;color:var(--goldd);font-style:normal}'+
 '.cpx i{width:7px;height:7px;border-radius:50%;flex:none}.cpx span{min-width:0;flex:1}.cpx span b{display:block;font:600 12.8px "DM Sans";color:var(--ink);overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.cpx span small{font-size:11.5px;color:var(--mut)}'+
 /* ---- pop-ups ---- */
 '.cpov{position:fixed;inset:0;z-index:420;background:transparent}'+
 '.cpop{position:fixed;z-index:421;background:var(--card);border:1px solid var(--line);border-radius:18px;box-shadow:var(--shadow2);padding:14px;opacity:0;transform:translateY(6px) scale(.98);transition:opacity .18s,transform .22s var(--ez);max-height:calc(100vh - 24px);overflow:auto}'+
 '.cpop.on{opacity:1;transform:none}'+
 '.cpop.mob{left:0!important;right:0;bottom:0;top:auto!important;width:auto!important;border-radius:22px 22px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom));max-height:88vh}'+
 '.cpov.mob{background:rgba(4,12,14,.45)}'+
 '.cpop h6{font:700 10.5px "DM Sans";letter-spacing:.14em;text-transform:uppercase;color:var(--mut);margin:4px 4px 6px}.cpop h6:not(:first-child){margin-top:14px}'+
 '.ckr{display:flex;align-items:center;gap:10px;padding:7px 8px;border-radius:10px;cursor:pointer;transition:background .15s}.ckr:hover{background:var(--bg)}'+
 '.ckr .cckb{width:17px;height:17px;border-radius:5px;border:2px solid var(--c);display:grid;place-items:center;flex:none;background:var(--c);transition:background .15s}.ckr .cckb svg{width:11px;height:11px;stroke:#fff;stroke-width:3.4;fill:none}.ckr.off .cckb{background:transparent}.ckr.off .cckb svg{opacity:0}'+
 '.ckr span{flex:1;min-width:0}.ckr b{display:block;font:600 13.2px "DM Sans";color:var(--ink)}.ckr small{display:block;font-size:11.4px;color:var(--mut);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ckr em{font-style:normal;font:700 11px "DM Sans";color:var(--mut);min-width:18px;text-align:right}'+
 '.ckr .cpr{font:700 9.5px "DM Sans";letter-spacing:.08em;text-transform:uppercase;padding:2px 6px;border-radius:999px;background:var(--au);color:var(--aut);margin-left:6px;vertical-align:1px}'+
 '.cpnote{font-size:11.8px;line-height:1.5;color:var(--mut);padding:10px 8px 2px;border-top:1px solid var(--line);margin-top:10px}.cpnote b{color:var(--ink2)}'+
 '.cplink{display:flex;align-items:center;gap:9px;width:100%;padding:9px 8px;border-radius:10px;font:600 13px "DM Sans";color:var(--ink2);text-align:left}.cplink:hover{background:var(--bg)}'+
 '.cev{display:flex;flex-direction:column;gap:9px}'+
 '.cev .ctit{font:600 17px "DM Sans";border:0;background:transparent;color:var(--ink);padding:4px 2px 6px;border-bottom:1.5px solid var(--line);outline:none;width:100%;border-radius:0}.cev .ctit:focus{border-color:var(--gold)}'+
 '.cev input:not(.ctit):not([type=checkbox]),.cev textarea{height:38px;border:1px solid var(--line);border-radius:10px;background:var(--bg);padding:0 10px;font:500 13.5px "DM Sans";color:var(--ink);outline:none;width:100%;min-width:0}'+
 '.cev textarea{height:64px;padding:8px 10px;resize:vertical;line-height:1.4}.cev input:focus,.cev textarea:focus{border-color:var(--gold);background:var(--card)}'+
 '.cev .crw{display:flex;gap:8px;align-items:center}.cev .crw>*{flex:1}.cev .crw .chs{display:flex;gap:6px;align-items:center;flex:1.25}.cev .crw .chs input{flex:1}.cev .crw .chs i{color:var(--mut);font-style:normal}'+
 '.cev .clb{display:flex;align-items:center;justify-content:space-between;font:600 13px "DM Sans";color:var(--ink2);padding:2px 2px}'+
 '.cev .csw{position:relative;width:40px;height:24px;flex:none}.cev .csw input{opacity:0;width:0;height:0;position:absolute}.cev .csw i{position:absolute;inset:0;border-radius:999px;background:var(--bg3);transition:.2s;cursor:pointer}.cev .csw i:after{content:"";position:absolute;left:3px;top:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:.2s}.cev .csw input:checked+i{background:var(--ok)}.cev .csw input:checked+i:after{transform:translateX(16px)}'+
 '.cev .ccal{display:flex;align-items:center;gap:8px;font:600 12.6px "DM Sans";color:var(--ink2);padding:8px 10px;border-radius:10px;background:var(--bg)}.cev .ccal i{width:10px;height:10px;border-radius:50%;flex:none}.cev .ccal small{color:var(--mut);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
 '.cev .cmeet{display:flex;align-items:center;gap:8px;font:600 12.6px "DM Sans";color:var(--ink2);padding:0 2px}.cev .cmeet input{width:16px;height:16px;accent-color:var(--ok)}'+
 '.cev .cbt{display:flex;gap:8px;align-items:center;margin-top:4px}.cev .cbt .sp{flex:1}.cev .cerr{font-size:12px;color:var(--bad);min-height:0}.cev .csync{font-size:11.5px;line-height:1.45;color:var(--mut)}'+
 '.cev .cdel{color:var(--bad);font:700 12.5px "DM Sans";padding:8px 6px}'+
 '.calsync a,.calsync button.op{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:16px;background:var(--bg);margin-bottom:8px;color:var(--ink);text-decoration:none;font:600 14px "DM Sans";width:100%;text-align:left}'+
 '.calsync a small,.calsync button.op small{display:block;font:500 12px "DM Sans";color:var(--mut)}.calsync .ic{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;background:var(--card);flex:none}.calsync .pri{box-shadow:inset 0 0 0 1.5px var(--gold)}.calsync h6{font:700 10.5px "DM Sans";letter-spacing:.14em;text-transform:uppercase;color:var(--mut);margin:14px 2px 8px}'+
 '@media (max-width:1100px){.calpage{grid-template-columns:minmax(0,1fr);grid-template-areas:"bar" "main" "side"}.calside{position:static}.cany{grid-template-columns:repeat(3,minmax(0,1fr))}}'+
 '@media (max-width:860px){.calpage{grid-template-areas:"side" "bar" "main";gap:12px}'+
 '.calbar{gap:8px}.calbar h3{font-size:21px;min-width:0;flex:1 1 auto}.calbar .sp{display:none}.calbar .seg{order:5;flex:1 1 100%}.calbar .seg button{flex:1}.calbar #calq{order:6;flex:1 1 auto}.calcb{order:6}.calnew span{display:none}.calnew{width:40px;height:40px;padding:0!important;justify-content:center}'+
 '.calpm{padding:10px 8px 12px}.cwdh div{padding:2px 0;text-align:center;letter-spacing:.06em;font-size:9.5px}.cmg{border-radius:14px}'+
 '.cmg .dc{min-height:58px;padding:5px 3px;align-items:center}.cmg .dn{align-self:center;font-size:12px;min-width:24px;height:24px}.cmg .cchip,.cmg .mais,.cmg .cplus{display:none}'+
 '.cmg .pts{display:flex;gap:3px;justify-content:center;flex-wrap:wrap;max-width:100%}.cmg .pts i{width:6px;height:6px;border-radius:50%}'+
 '.cwh,.cwa,.cwb{grid-template-columns:40px repeat(var(--cols),minmax(0,1fr))}.cwd{padding:7px 2px}.cwd small{font-size:9px;letter-spacing:.04em}.cwd b{font-size:15px;min-width:26px;height:26px}'+
 '.cwb .cgut span{font-size:9.5px;right:5px}.cwe,.cwe.c1{display:flex;flex-direction:column;align-items:stretch;gap:0;white-space:normal;font-size:9.3px;line-height:1.15;padding:2px 3px;border-left-width:2px;border-radius:6px}.cwe small{order:-1;font-size:8.5px;opacity:.8}.cwe .cfim{display:none}.cwe b{white-space:normal;word-break:break-word;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical}.cwac .cchip{font-size:9px;padding:2px 3px;white-space:normal;word-break:break-word;line-height:1.15;border-left-width:2px}.cws{max-height:60vh}.cwa .cgut{font-size:8px;padding-right:4px}'+
 '.cany{grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 14px}.yd{width:21px;height:21px;font-size:10.5px}'+
 '.cdia{padding:16px 14px;scroll-margin-top:84px}.cpop.mob:before{content:"";display:block;width:40px;height:5px;border-radius:3px;background:var(--line);margin:-6px auto 12px}.cev input:not(.ctit):not([type=checkbox]),.cev textarea{font-size:16px;height:44px}.cev textarea{height:76px}.cev .ctit{font-size:18px}.cev .crw{flex-wrap:wrap}.cev .crw>input[type=date]{flex:1 1 100%}.cev .crw .chs{flex:1 1 100%}}';
 document.head.appendChild(s); })();

/* ---------- datas ---------- */
function sod(d){ return new Date(d.getFullYear(),d.getMonth(),d.getDate()); }
function addD(d,n){ return new Date(d.getFullYear(),d.getMonth(),d.getDate()+n); }
function iniSem(d){ return addD(sod(d),-((d.getDay()+6)%7)); }
function chave(d){ return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
function ymd(d){ return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate()); }
function hmD(d){ return z(d.getHours())+':'+z(d.getMinutes()); }
function hm(e){ return e.dia?'dia todo':hmD(e.d); }
function cap(s){ s=String(s||''); return s.charAt(0).toUpperCase()+s.slice(1); }
function cor(e,p){ return 'color-mix(in srgb,'+TC[e.tipo][2]+' '+p+'%,var(--card))'; }
function curto(n){ var p=String(n||'').trim().split(/\s+/).filter(Boolean); return p.length>1?p[0]+' '+p[p.length-1].charAt(0)+'.':(p[0]||''); }
function periodo(){ var r=CS.ref; if(CS.vista==='dia') return [sod(r),addD(sod(r),1)]; if(CS.vista==='semana'){ var a=iniSem(r); return [a,addD(a,7)]; }
 if(CS.vista==='ano') return [new Date(r.getFullYear(),0,1),new Date(r.getFullYear()+1,0,1)]; return [new Date(r.getFullYear(),r.getMonth(),1),new Date(r.getFullYear(),r.getMonth()+1,1)]; }

/* ---------- eventos ---------- */
function tkData(t){ var p=null; try{ p=pcall('tkPrazo',t.raw); }catch(e){} if(!p&&t.prazo) p=new Date(t.prazo); return (p&&!isNaN(p))?p:null; }
function equipeOn(){ return isM()&&CS.quem==='equipe'; }
function eventos(tudo){ var ev=[], todos=equipeOn();
 try{ (todos?TASKS:TASKS.filter(function(t){ return t.resp===ME(); })).forEach(function(t){ if(t.done||t.arq) return; var d=tkData(t); if(!d) return; var L=t.lead?(LEADS.filter(function(x){ return x.id===t.lead; })[0]):null;
   var VW=(typeof tkVista==='function')?tkVista(t,L):null; /* TAREFA_LIMPA_20261025 */
   ev.push({tipo:'tarefa',d:d,f:new Date(d.getTime()+30*6e4),who:t.resp,t:VW?VW.acao:t.t,c:VW?VW.acao:t.t,s:(VW?VW.nome:(L?L.nome:(t.l||'')))+(todos&&t.resp?' · '+fn(t.resp):''),go:function(){ go('tarefas'); }}); }); }catch(e){}
 try{ var LL=isM()?LEADS:mine(LEADS); LL.forEach(function(l){ if(l.perdido) return; var x=XL[l.uid]||{}, meu=!isM()||l.resp===ME()||todos;
   var abre=function(el){ if(typeof openDeal==='function') openDeal(l,el); else go('cliente',{lead:l}); };
   if(x.reuniao_em&&(meu||isM())){ var r=new Date(x.reuniao_em); if(!isNaN(r)) ev.push({tipo:'reuniao',d:r,f:new Date(r.getTime()+60*6e4),who:l.resp,t:(x.reuniao_tipo==='R2'?'2ª reunião':'Reunião')+' · '+l.nome,c:curto(l.nome)+(x.reuniao_tipo==='R2'?' · 2ª':''),s:(x.link_meet?'link da reunião no card':'')+(isM()&&l.resp?(x.link_meet?' · ':'')+fn(l.resp):''),go:abre}); }
   if(meu&&x.etapa_crm==='contato'&&x.contato_respondeu==null&&W.CRM7&&W.CRM7.prazoContato){ var pz=W.CRM7.prazoContato(x); if(pz){ var a=new Date(pz.auto.getTime()+3*36e5);
     ev.push({tipo:'crm',d:a,f:new Date(a.getTime()+30*6e4),who:l.resp,t:l.nome+': marcar Contato feito',c:'Contato · '+curto(l.nome),s:'sem marcação, a Alice volta a chamar',go:abre}); } }
   if(meu&&x.data_decisao&&l.st!==4){ var dd=String(x.data_decisao).slice(0,10).split('-'); if(dd.length===3) ev.push({tipo:'proposta',dia:1,d:new Date(+dd[0],+dd[1]-1,+dd[2],12),who:l.resp,t:l.nome+' decide a proposta',c:'Decide · '+curto(l.nome),s:brl(l.valor||0),go:abre}); }
  }); }catch(e){}
 try{ (typeof AGD!=='undefined'?AGD:[]).forEach(function(a){ var dd=String(a.data_assembleia||'').slice(0,10).split('-'); if(dd.length!==3) return;
   var tp={IMOVEL:'Imóvel',AUTOMOVEL:'Automóvel',SERVICOS:'Serviços'}[String(a.tipo||'').toUpperCase()]||a.tipo||''; var adm=/anc|âncora/i.test(a.administradora||'')?'Âncora':'HS';
   ev.push({tipo:'assembleia',dia:1,d:new Date(+dd[0],+dd[1]-1,+dd[2],12),t:'Assembleia '+adm+(tp?' · '+tp:''),c:adm+(tp?' · '+(tp==='Automóvel'?'Auto':tp):''),s:a.obs||'',go:function(){ go('assembleias'); }}); }); }catch(e){}
 (CS.cust||[]).forEach(function(c){ if(!(todos||c.uid===ME())) return; var d, f;
   if(c.dia_todo&&c.dia){ var p=String(c.dia).split('-'); d=new Date(+p[0],+p[1]-1,+p[2],12); f=d; } else { d=new Date(c.ini); f=new Date(c.fim||c.ini); }
   if(isNaN(d)) return;
   ev.push({tipo:'evento',dia:c.dia_todo?1:0,d:d,f:f,who:c.uid,t:c.titulo,c:c.titulo,s:(c.local||'')+(todos&&c.uid!==ME()?(c.local?' · ':'')+fn(c.uid):''),cust:c,go:function(el,ev2){ abrirEvento(c,el,ev2); }}); });
 if(!RO()) (CS.extEv||[]).forEach(function(x){ var k='x'+x.cal; if(!TC[k]) return; var d, f;
   if(x.dia_todo){ var p=String(x.dia).split('-'); d=new Date(+p[0],+p[1]-1,+p[2],12); f=d; } else { d=new Date(x.ini); f=new Date(x.fim||x.ini); if(!(f-d>=15*6e4)) f=new Date(d.getTime()+30*6e4); }
   if(isNaN(d)) return; ev.push({tipo:k,dia:x.dia_todo?1:0,d:d,f:f,who:ME(),t:x.titulo,c:x.titulo,s:x.local||'',ext:x,go:function(el,e2){ verExt(x,el,e2); }}); });
 return ev.filter(function(e){ return tudo||(!CS.off[e.tipo]&&!(e.who&&CS.offP[e.who])); }).sort(function(a,b){ return a.d-b.d; }); }
function carregaCust(){ return Promise.resolve(papi('/api/cal/eventos'+(equipeOn()?'?equipe=1':''),{method:'GET'})).then(function(r){
  if(r&&r.ok&&r.data){ CS.cust=r.data.eventos||[]; if(r.data.agion) CS.ag=r.data.agion; } CS.carregado=true; if(cur==='calendario') pinta(); },function(){ CS.carregado=true; }); }


/* ---------- CAL_EXT_23OUT: agendas de fora (só para ver) ---------- */
var CORX=['#4F86C6','#D65C7A','#4FA38A','#E08E3C','#7A6FD0','#3C9CB0','#B5654A','#8C9A3E'];
var ORGX={Google:'Google',Outlook:'Outlook',iCloud:'iPhone (iCloud)',Outro:'app de origem'};
function regExt(){ Object.keys(TC).forEach(function(k){ if(k.charAt(0)==='x'&&!CS.ext.some(function(c){ return 'x'+c.id===k; })) delete TC[k]; });
 CS.ext.forEach(function(c){ TC['x'+c.id]=['x'+c.id,c.nome,c.cor,'globe',c.nome]; }); }
function extJanela(){ var r=CS.ref||sod(new Date()); if(CS.vista==='ano') return [new Date(r.getFullYear()-1,11,1),new Date(r.getFullYear()+1,1,1)];
 return [new Date(r.getFullYear(),r.getMonth()-2,1),new Date(r.getFullYear(),r.getMonth()+14,1)]; }
function extCobre(){ if(!CS.extJan) return false; var p=periodo(); return p[0]>=CS.extJan[0]&&p[1]<=CS.extJan[1]; }
function carregaExt(forca){ if(RO()||CS.extBusy) return Promise.resolve(); if(!forca&&extCobre()) return Promise.resolve(); var j=extJanela(); CS.extBusy=true;
 return Promise.resolve(papi('/api/cal/externos?de='+ymd(j[0])+'&ate='+ymd(j[1]),{method:'GET'})).then(function(r){ CS.extBusy=false;
   if(r&&r.ok&&r.data&&r.data.ok){ CS.extJan=j; CS.ext=r.data.calendarios||[]; CS.extEv=r.data.eventos||[]; regExt(); if(cur==='calendario') pinta(); return true; }
   return false; },   /* GPT_27OUT: com erro, o período não fica marcado como carregado — a próxima leitura tenta de novo */
  function(){ CS.extBusy=false; return false; }); }
function salvaOffX(){ try{ var o={}; Object.keys(CS.off).forEach(function(k){ if(k.charAt(0)==='x'&&CS.off[k]) o[k]=1; }); localStorage.setItem('agcal_offx',JSON.stringify(o)); }catch(e){} }
function linkOuTexto(t){ t=String(t||''); return /^https?:\/\/\S+$/.test(t)?'<a href="'+e4(t)+'" target="_blank" rel="noopener">'+e4(t.length>48?t.slice(0,46)+'…':t)+'</a>':e4(t); }
function verExt(x,el,ev){ var c=TC['x'+x.cal]||['','Agenda de fora','#888'], k=CS.ext.filter(function(a){ return a.id===x.cal; })[0]||{}, quando;
 if(x.dia_todo){ var p=String(x.dia).split('-'), d=new Date(+p[0],+p[1]-1,+p[2]); quando=cap(rotDia(d))+' · dia todo'; }
 else { var a=new Date(x.ini), b=new Date(x.fim||x.ini); quando=cap(rotDia(a))+' · '+hmD(a)+(b>a?' – '+hmD(b):''); }
 var h='<div class="cev cxv"><div class="cxvh"><i style="background:'+c[2]+'"></i><b>'+e4(x.titulo)+'</b></div><p>'+e4(quando)+'</p>'+(x.local?'<p class="cxl">'+I('pin',14)+'<span>'+linkOuTexto(x.local)+'</span></p>':'')+
  '<div class="ccal"><i style="background:'+c[2]+'"></i><span>'+e4(c[1])+'<small> · só para ver</small></span></div>'+
  '<div class="csync">Para mudar este evento, use o '+e4(ORGX[k.origem]||'app de origem')+'. Os eventos que você cria aqui vão para a Agenda Agion.</div></div>';
 abrePop(h,330,el,ev); }
function passosX(o){ var P={
  Google:['No computador, abra <b>calendar.google.com</b> e clique na engrenagem › <b>Configurações</b>.','Na esquerda, em “Configurações das minhas agendas”, clique na agenda que quer trazer.','Desça até <b>Integrar agenda</b> e copie o <b>Endereço secreto no formato iCal</b>.','Cole o link aqui embaixo.'],
  Outlook:['Abra o Outlook na web (<b>outlook.com</b> ou <b>outlook.office.com</b>) › Configurações › <b>Calendário</b> › <b>Calendários compartilhados</b>.','Em <b>Publicar um calendário</b>, escolha a agenda, marque “Pode ver todos os detalhes” e clique em <b>Publicar</b>.','Copie o <b>link ICS</b>.','Cole o link aqui embaixo.'],
  iCloud:['No iPhone, abra o app <b>Calendário</b> e toque em <b>Calendários</b>, embaixo.','Toque no <b>ⓘ</b> ao lado da agenda e ligue <b>Calendário Público</b>.','Toque em <b>Compartilhar Link…</b> › <b>Copiar</b>.','Cole o link aqui embaixo (ele começa com webcal://).']};
 var N={Google:'O endereço secreto é privado: só você e a plataforma veem.',Outlook:'Use o link ICS (não o HTML).',iCloud:'Com o Calendário Público ligado, quem tiver o link consegue ver a agenda. Aqui ele fica guardado só para você.'};
 return '<ol>'+P[o].map(function(t){ return '<li>'+t+'</li>'; }).join('')+'</ol><p class="cxn">'+N[o]+'</p>'; }
function coresX(sel){ return '<div class="cxcs">'+CORX.map(function(c){ return '<button type="button" data-c="'+c+'" style="background:'+c+'"'+(c===sel?' class="on"':'')+' aria-label="Cor"></button>'; }).join('')+'</div>'; }
function ligaCores(s){ $$('.cxcs button',s).forEach(function(b){ b.onclick=function(){ $$('.cxcs button',s).forEach(function(x){ x.classList.toggle('on',x===b); }); }; }); }
function addExterno(){ if(RO()){ toast('Saia do “Ver como” para trazer agendas','eye'); return; } fechaPop();
 var org='Google', cor0=CORX[CS.ext.length%CORX.length];
 var s=sheet('<h2>Trazer uma agenda de fora</h2><p style="color:var(--mut);font-size:13px;line-height:1.55;margin:6px 0 12px">Os eventos do seu <b>Google pessoal</b>, <b>Outlook</b> ou <b>iPhone</b> aparecem aqui no Calendário, <b>só para ver</b>. Atualiza sozinho a cada 15 minutos.</p>'+
  '<div class="cxtab" id="cxtab"><button data-o="Google" class="on">Google</button><button data-o="Outlook">Outlook</button><button data-o="iCloud">iPhone (iCloud)</button></div>'+
  '<div class="cxpass" id="cxpass">'+passosX(org)+'</div>'+
  '<div class="cev cxf"><input id="cxu" placeholder="Cole o link aqui (https://… ou webcal://…)" autocomplete="off" spellcheck="false">'+
  '<input id="cxn" placeholder="Nome (opcional) · ex.: Pessoal" maxlength="60">'+coresX(cor0)+
  '<div class="cerr" id="cxer"></div><div class="cbt"><span class="sp"></span><button class="btn sm ol" id="cxcan">Cancelar</button><button class="btn sm gd" id="cxok">Adicionar</button></div></div>'+
  '<p class="cxn" style="margin-top:10px">O link fica guardado só para você: ninguém da equipe vê a sua agenda pessoal. Os eventos que você cria no Calendário continuam indo para a Agenda Agion.</p>',520);
 $$('#cxtab button',s).forEach(function(b){ b.onclick=function(){ org=b.dataset.o; $$('#cxtab button',s).forEach(function(x){ x.classList.toggle('on',x===b); }); $('#cxpass',s).innerHTML=passosX(org); }; });
 ligaCores(s); $('#cxcan',s).onclick=function(){ closeSheet(); };
 var ocupado=false;
 $('#cxok',s).onclick=function(){ if(ocupado) return; var er=$('#cxer',s), u=$('#cxu',s).value.trim(); er.textContent='';
  if(!/^(https?|webcals?):\/\/\S+$/i.test(u)){ er.textContent='Cole o link da agenda (começa com https:// ou webcal://).'; $('#cxu',s).focus(); return; }
  var cb=$('.cxcs .on',s), btn=this; ocupado=true; btn.textContent='Lendo a agenda…';
  Promise.resolve(papi('/api/cal/externos',{method:'POST',body:JSON.stringify({acao:'adicionar',url:u,nome:$('#cxn',s).value.trim(),cor:cb?cb.dataset.c:''})})).then(function(r){ ocupado=false;
    if(!r||!r.ok||!r.data||!r.data.ok){ btn.textContent='Adicionar'; er.textContent=(r&&r.data&&(r.data.erro||r.data.error))||'Não consegui ler essa agenda agora. Tente de novo.'; return; }
    closeSheet(); toast('“'+r.data.calendario.nome+'” no seu Calendário','cal'); carregaExt(true); },
   function(){ ocupado=false; btn.textContent='Adicionar'; er.textContent='Sem conexão com o robô. Tente de novo.'; }); }; }
function editExterno(id){ var c=CS.ext.filter(function(a){ return a.id===id; })[0]; if(!c) return; fechaPop();
 var s=sheet('<h2>'+e4(c.nome)+'</h2><p style="color:var(--mut);font-size:13px;margin:6px 0 12px">Agenda de fora · '+e4(ORGX[c.origem]||'outro app')+' · só para ver'+(c.erro?'<br><span style="color:var(--bad)">Última tentativa: '+e4(c.erro)+'</span>':'')+'</p>'+
  '<div class="cev cxf"><input id="cxn" value="'+e4(c.nome)+'" maxlength="60" placeholder="Nome">'+coresX(c.cor)+'<div class="cerr" id="cxer"></div>'+
  '<div class="cbt"><button class="cdel" id="cxdel">Remover</button><button class="btn sm ol" id="cxat">'+I('refresh',14)+'Atualizar agora</button><span class="sp"></span><button class="btn sm gd" id="cxok">Salvar</button></div></div>',440);
 ligaCores(s);
 $('#cxat',s).onclick=function(){ var b=this, er=$('#cxer',s); b.disabled=true; er.textContent='';   /* GPT_27OUT: só diz "atualizadas" quando atualizou de verdade */
  Promise.resolve(papi('/api/cal/externos',{method:'POST',body:JSON.stringify({acao:'atualizar'})})).then(function(r){
   if(!r||!r.ok||(r.data&&r.data.ok===false)){ b.disabled=false; er.textContent=(r&&r.data&&(r.data.erro||r.data.error))||'Não consegui atualizar agora. Tente de novo.'; return; }
   carregaExt(true).then(function(ok){ if(!ok){ b.disabled=false; er.textContent='Atualizei, mas não consegui ler as agendas agora. Tente de novo.'; return; }
    var falhas=CS.ext.filter(function(a){ return a.erro; }); closeSheet();
    toast(falhas.length?(falhas.length===1?'1 agenda não atualizou: '+falhas[0].nome:falhas.length+' agendas não atualizaram'):'Agendas de fora atualizadas',falhas.length?'x':'refresh'); }); },
   function(){ b.disabled=false; er.textContent='Sem conexão com o robô. Tente de novo.'; }); };
 $('#cxok',s).onclick=function(){ var cb=$('.cxcs .on',s); Promise.resolve(papi('/api/cal/externos',{method:'POST',body:JSON.stringify({acao:'editar',id:c.id,nome:$('#cxn',s).value.trim(),cor:cb?cb.dataset.c:''})})).then(function(r){
   if(!r||!r.ok){ $('#cxer',s).textContent=(r&&r.data&&r.data.erro)||'Não consegui salvar agora.'; return; } closeSheet(); carregaExt(true); }); };
 $('#cxdel',s).onclick=function(){ var x=this; if(!x.dataset.ok){ x.dataset.ok=1; x.textContent='Confirmar: remover'; return; } x.textContent='Removendo…';
  Promise.resolve(papi('/api/cal/externos',{method:'POST',body:JSON.stringify({acao:'remover',id:c.id})})).then(function(r){
   if(!r||!r.ok){ x.textContent='Remover'; delete x.dataset.ok; $('#cxer',s).textContent=(r&&r.data&&r.data.erro)||'Não consegui remover agora.'; return; }
   CS.ext=CS.ext.filter(function(a){ return a.id!==c.id; }); CS.extEv=CS.extEv.filter(function(a){ return a.cal!==c.id; }); delete CS.off['x'+c.id]; salvaOffX(); regExt(); closeSheet(); pinta(); toast('Agenda removida do Calendário','x'); }); }; }
(function(){ if(document.getElementById('calxcss')) return; var s=document.createElement('style'); s.id='calxcss'; s.textContent=
 '.ckr .cxg{width:26px;height:26px;border-radius:8px;display:grid;place-items:center;color:var(--mut);flex:none}.ckr .cxg:hover{background:var(--bg2);color:var(--ink)}.ckr .cxg svg{width:14px;height:14px}.ckr small.cxe{color:var(--bad);white-space:normal}'+
 '.cxadd{display:flex;align-items:center;gap:9px;width:100%;padding:9px 8px;border-radius:10px;font:600 13px "DM Sans";color:var(--goldd,var(--gold));text-align:left}.cxadd:hover{background:var(--bg)}'+
 '.cxtab{display:flex;gap:6px;background:var(--bg);padding:4px;border-radius:13px;margin-bottom:12px}.cxtab button{flex:1;height:34px;border-radius:10px;font:600 13px "DM Sans";color:var(--ink2)}.cxtab button.on{background:var(--card);box-shadow:var(--shadow);color:var(--ink)}'+
 '.cxpass ol{margin:0 0 6px;padding-left:20px;display:flex;flex-direction:column;gap:6px;font-size:13.2px;line-height:1.5;color:var(--ink2)}.cxpass b{color:var(--ink)}'+
 '.cxn{font-size:11.8px;line-height:1.5;color:var(--mut);margin:4px 0 12px}'+
 '.cxf{gap:10px}.cxcs{display:flex;gap:8px;flex-wrap:wrap;padding:2px}.cxcs button{width:24px;height:24px;border-radius:50%;box-shadow:0 0 0 2px var(--card);transition:transform .15s}.cxcs button.on{box-shadow:0 0 0 2px var(--card),0 0 0 4px var(--ink2)}.cxcs button:hover{transform:scale(1.1)}'+
 '.cxf .cbt .btn svg{width:14px;height:14px;margin-right:4px}'+
 '.cxv p{font-size:13px;color:var(--ink2);line-height:1.45;margin:0}.cxv .cxvh{display:flex;align-items:flex-start;gap:9px}.cxv .cxvh i{width:11px;height:11px;border-radius:50%;flex:none;margin-top:5px}.cxv .cxvh b{font:600 16px "DM Sans";color:var(--ink);line-height:1.3;word-break:break-word}'+
 '.cxv .cxl{display:flex;gap:6px;align-items:flex-start}.cxv .cxl svg{width:14px;height:14px;flex:none;margin-top:2px;color:var(--mut)}.cxv .cxl a{color:var(--goldd,var(--gold));word-break:break-all}'+
 '@media(max-width:860px){.cxf input{font-size:16px!important;height:44px!important}.cxtab button{font-size:12.3px}}';
 document.head.appendChild(s); })();

/* ---------- tela ---------- */
R.calendario=function(v){ var h=new Date(); if(!CS.ref) CS.ref=sod(h); if(!CS.dia) CS.dia=sod(h);
 v.innerHTML='<div class="hx rv"><div><h1 class="h1"><em>Calendário</em></h1><div class="sub">Tarefas, reuniões, prazos do CRM, propostas e assembleias num lugar só</div></div><span class="sp"></span><button class="btn gd" id="calsync">'+I('cal',16)+'Adicionar ao meu calendário</button></div>'+
  '<div class="calpage rv">'+
   '<div class="calbar"><h3 id="calt"></h3><div class="calnavg"><button class="calnav" id="calp" title="Anterior">'+I('chevl',16)+'</button><button class="calnav" id="caln" title="Próximo">'+I('chevr',16)+'</button></div><button class="btn sm ol" id="calh">Hoje</button><span class="sp"></span>'+
    seg('calv',VISTAS,CS.vista)+(isM()?seg('calq',[['meus','Meus'],['equipe','Equipe']],CS.quem):'')+
    '<button class="calcb" id="calcals" title="Ligar e desligar calendários"><span class="cdots" id="caldots"></span>Calendários</button>'+
    '<button class="btn gd sm calnew" id="calnovo" title="Novo evento">'+I('plus',15)+'<span>Novo evento</span></button></div>'+
   '<div class="calmain"><div class="panel calpm" id="calb"></div></div>'+
   '<div class="calside"><div class="panel cdia" id="cald"></div></div>'+
  '</div>';
 $('#calp').onclick=function(){ anda(-1); }; $('#caln').onclick=function(){ anda(1); };
 $('#calh').onclick=function(){ var n=sod(new Date()); CS.ref=n; CS.dia=n; pinta(); };
 bindSeg('calv',function(k){ CS.vista=k; try{ localStorage.setItem('agcal_vista',k); }catch(e){} if(k==='dia') CS.ref=sod(CS.dia||CS.ref); pinta(); });
 if(isM()) bindSeg('calq',function(k){ CS.quem=k; pinta(); carregaCust(); });
 $('#calcals').onclick=calendarios; $('#calnovo').onclick=function(ev){ var d=CS.dia||sod(new Date()), a=agoraRedondo(d); novoEvento({ini:a},null,ev); };
 $('#calsync').onclick=sincronizar;
 pinta(); carregaCust(); carregaExt();
 try{ if(typeof carregaAss==='function'&&!(typeof AGD!=='undefined'&&AGD.length)) carregaAss().then(function(){ if(cur==='calendario') pinta(); }); }catch(e){} };
function agoraRedondo(d){ var n=new Date(), x=new Date(d.getFullYear(),d.getMonth(),d.getDate(),9,0); if(chave(d)===chave(n)){ x=new Date(n.getTime()); x.setMinutes(n.getMinutes()<30?30:60,0,0); } return x; }
function anda(n){ var r=CS.ref; if(CS.vista==='mes') CS.ref=new Date(r.getFullYear(),r.getMonth()+n,1); else if(CS.vista==='semana') CS.ref=addD(r,7*n); else if(CS.vista==='dia'){ CS.ref=addD(r,n); CS.dia=CS.ref; } else CS.ref=new Date(r.getFullYear()+n,0,1); pinta(); }
function titulo(){ var r=CS.ref;
 if(CS.vista==='mes') return MESES[r.getMonth()]+' <span>'+r.getFullYear()+'</span>';
 if(CS.vista==='ano') return String(r.getFullYear());
 if(CS.vista==='dia') return r.getDate()+' de '+MESES[r.getMonth()]+' <span>'+r.getFullYear()+'</span>';
 var a=iniSem(r), b=addD(a,6); return a.getMonth()===b.getMonth()?a.getDate()+' – '+b.getDate()+' de '+MESES[a.getMonth()]+' <span>'+b.getFullYear()+'</span>':a.getDate()+' '+MES3[a.getMonth()]+' – '+b.getDate()+' '+MES3[b.getMonth()]+' <span>'+b.getFullYear()+'</span>'; }
var ITENS=[];
function reg(e){ var i=ITENS.length; ITENS.push(e); return i; }
function pinta(){ var b=$('#calb'); if(!b) return; ITENS=[]; if(!CS.extBusy&&!RO()&&CS.extJan&&!extCobre()) carregaExt(); var E=eventos(), por={}; E.forEach(function(e){ var k=chave(e.d); (por[k]=por[k]||[]).push(e); });
 $('#calt').innerHTML=titulo(); dots();
 if(CS.vista==='mes') pintaMes(b,por); else if(CS.vista==='ano') pintaAno(b,por); else pintaGrade(b,E,por);
 pintaSide(E,por); }
function dots(){ var d=$('#caldots'); if(!d) return; var on=TIPOS.filter(function(t){ return !CS.off[t[0]]; }); d.innerHTML=on.slice(0,6).map(function(t){ return '<i style="background:'+t[2]+'"></i>'; }).join(''); var bt=$('#calcals'); if(bt) bt.classList.toggle('on',on.length<TIPOS.length||Object.keys(CS.offP).some(function(k){ return CS.offP[k]; })); }
function selDia(d){ CS.dia=sod(d); $$('#calb .sel').forEach(function(x){ x.classList.remove('sel'); }); $$('#calb [data-d="'+CS.dia.getTime()+'"]').forEach(function(x){ x.classList.add('sel'); }); var E=eventos(), por={}; E.forEach(function(e){ var k=chave(e.d); (por[k]=por[k]||[]).push(e); }); pintaSide(E,por); }

/* ---- Mês ---- */
function pintaMes(b,por){ var m0=new Date(CS.ref.getFullYear(),CS.ref.getMonth(),1), ini2=addD(m0,-((m0.getDay()+6)%7)), hoje=chave(new Date()), cells='';
 var semanas=Math.ceil((((m0.getDay()+6)%7)+new Date(m0.getFullYear(),m0.getMonth()+1,0).getDate())/7);
 for(var i=0;i<semanas*7;i++){ var d=addD(ini2,i), k=chave(d), L=por[k]||[], fds=(i%7)>4;
  cells+='<div class="dc'+(d.getMonth()!==m0.getMonth()?' fora':'')+(fds?' fds':'')+(k===hoje?' hoje':'')+(CS.dia&&k===chave(CS.dia)?' sel':'')+'" data-d="'+d.getTime()+'"><span class="dn">'+d.getDate()+'</span><button class="cplus" title="Novo evento neste dia">'+I('plus',13)+'</button>'+
   L.slice(0,3).map(function(e){ var c=TC[e.tipo][2]; return '<span class="cchip" data-ev="'+reg(e)+'" style="background:'+cor(e,13)+';border-color:'+c+'" title="'+e4(e.t)+'">'+(e.dia?'':'<b style="color:'+c+'">'+hm(e)+'</b>')+'<span>'+e4(e.c||e.t)+'</span></span>'; }).join('')+
   (L.length>3?'<span class="mais">+'+(L.length-3)+' mais</span>':'')+
   (L.length?'<span class="pts">'+L.slice(0,4).map(function(e){ return '<i style="background:'+TC[e.tipo][2]+'"></i>'; }).join('')+'</span>':'')+'</div>'; }
 b.innerHTML='<div class="cwdh">'+['seg','ter','qua','qui','sex','sáb','dom'].map(function(x,j){ return '<div'+(j>4?' class="fds"':'')+'>'+x+'</div>'; }).join('')+'</div><div class="cmg">'+cells+'</div>';
 $$('.dc',b).forEach(function(c){ var d=new Date(+c.dataset.d);
  c.onclick=function(ev){ if(ev.target.closest('.cplus')){ ev.stopPropagation(); selDia(d); novoEvento({ini:agoraRedondo(d)},c,ev); return; } if(ev.target.closest('[data-ev]')) return; if(d.getMonth()!==CS.ref.getMonth()){ CS.ref=new Date(d.getFullYear(),d.getMonth(),1); CS.dia=sod(d); pinta(); return; } selDia(d); if(mob()){ var s=$('#cald'); if(s) s.scrollIntoView({behavior:'smooth',block:'start'}); } };
  c.ondblclick=function(ev){ if(ev.target.closest('[data-ev]')||mob()) return; novoEvento({ini:agoraRedondo(d)},c,ev); }; });
 liga(b); }

/* ---- Dia / Semana ---- */
function lanes(L){ /* coloca lado a lado o que acontece ao mesmo tempo */
 var g=[], fim=-1; L.forEach(function(e){ var a=e.d.getTime(), z2=Math.max(e.f.getTime(),a+30*6e4); if(!g.length||a>=fim){ g.push([]); fim=z2; } else fim=Math.max(fim,z2); g[g.length-1].push(e); });
 g.forEach(function(gr){ var cols=[]; gr.forEach(function(e){ var a=e.d.getTime(), j=0; while(cols[j]!=null&&cols[j]>a) j++; cols[j]=Math.max(e.f.getTime(),a+30*6e4); e._l=j; }); gr.forEach(function(e){ e._n=cols.length; }); }); }
function pintaGrade(b,E,por){ var H=HH(), n=CS.vista==='dia'?1:7, a=CS.vista==='dia'?sod(CS.ref):iniSem(CS.ref), hoje=chave(new Date()), agora=new Date(), dias=[];
 for(var i=0;i<n;i++) dias.push(addD(a,i));
 var head='<div class="cwh"><div></div>'+dias.map(function(d,i){ var k=chave(d), fds=((d.getDay()+6)%7)>4; return '<div class="cwd'+(k===hoje?' hoje':'')+(fds?' fds':'')+(CS.dia&&k===chave(CS.dia)?' sel':'')+'" data-d="'+d.getTime()+'"><small>'+(n===1?DIAS[d.getDay()]:DIAS[d.getDay()].slice(0,3))+'</small><b>'+d.getDate()+'</b></div>'; }).join('')+'</div>';
 var allday='<div class="cwa"><div class="cgut">dia todo</div>'+dias.map(function(d){ var L=(por[chave(d)]||[]).filter(function(e){ return e.dia; }); return '<div class="cwac" data-d="'+d.getTime()+'">'+L.map(function(e){ var c=TC[e.tipo][2]; return '<span class="cchip" data-ev="'+reg(e)+'" style="background:'+cor(e,14)+';border-color:'+c+'" title="'+e4(e.t)+'">'+e4(e.c||e.t)+'</span>'; }).join('')+'</div>'; }).join('')+'</div>';
 var gut='<div class="cgut" style="height:'+(24*H)+'px">'; for(var h=1;h<24;h++) gut+='<span style="top:'+(h*H)+'px">'+z(h)+':00</span>'; gut+='</div>';
 var cols=dias.map(function(d){ var k=chave(d), L=(por[k]||[]).filter(function(e){ return !e.dia; }), fds=((d.getDay()+6)%7)>4; lanes(L);
  var x=L.map(function(e){ var c=TC[e.tipo][2], m0=e.d.getHours()*60+e.d.getMinutes(), dur=Math.max(25,Math.min((e.f-e.d)/6e4||30,24*60-m0)), top=m0*H/60, ht=Math.max(20,dur*H/60-2), w=100/e._n, l=e._l*w, um=ht<34, cas=n===7&&e._n>1, off=e._l*(mob()?7:14), pos=cas?'left:'+(off+2)+'px;width:calc(100% - '+(off+4)+'px);z-index:'+(2+e._l)+';box-shadow:0 0 0 1.5px var(--card)':'left:calc('+l+'% + 2px);width:calc('+w+'% - 4px)';  /* na Semana, eventos ao mesmo tempo ficam em cascata (como na Apple) */
   return '<div class="cwe'+(um?' c1':'')+'" data-ev="'+reg(e)+'" style="top:'+top+'px;height:'+ht+'px;'+pos+';background:'+cor(e,17)+';border-color:'+c+'" title="'+e4(hmD(e.d)+' · '+e.t)+'"><b>'+e4(e.c||e.t)+'</b><small>'+hmD(e.d)+(um?'':'<span class="cfim"> – '+hmD(e.f)+'</span>')+'</small></div>'; }).join('');
  if(k===hoje){ var mn=agora.getHours()*60+agora.getMinutes(); x+='<div class="cwnow" style="top:'+(mn*H/60)+'px"><i></i></div>'; }
  return '<div class="cwc'+(fds?' fds':'')+(k===hoje?' hoje':'')+'" data-d="'+d.getTime()+'" style="height:'+(24*H)+'px">'+x+'</div>'; }).join('');
 b.innerHTML='<div class="cwk" style="--cols:'+n+';--hh:'+H+'px">'+head+allday+'<div class="cws" id="tgs"><div class="cwb">'+gut+cols+'</div></div></div>';
 var sc=$('#tgs',b); if(sc){ var alvo=(dias.some(function(d){ return chave(d)===hoje; })?Math.max(7*60,agora.getHours()*60-90):7*60); sc.scrollTop=alvo*H/60-8; }
 $$('.cwd',b).forEach(function(c){ c.onclick=function(){ var d=new Date(+c.dataset.d); if(CS.vista==='semana'&&CS.dia&&chave(CS.dia)===chave(d)){ CS.vista='dia'; CS.ref=sod(d); try{ localStorage.setItem('agcal_vista','dia'); }catch(e){} go('calendario'); return; } selDia(d); }; });
 $$('.cwac',b).forEach(function(c){ c.ondblclick=function(ev){ if(ev.target.closest('[data-ev]')) return; novoEvento({ini:new Date(+c.dataset.d),dia_todo:true},c,ev); }; });
 $$('.cwc',b).forEach(function(c){ c.onclick=function(ev){ if(ev.target.closest('[data-ev]')) return; var d=new Date(+c.dataset.d), r=c.getBoundingClientRect(), y=ev.clientY-r.top, mn=Math.max(0,Math.min(23*60+30,Math.floor(y/H*2)*30));
   var ini=new Date(d.getFullYear(),d.getMonth(),d.getDate(),Math.floor(mn/60),mn%60); selDia(d);
   var gh=document.createElement('div'); gh.className='cwghost'; gh.style.top=(mn*H/60)+'px'; gh.style.height=(H-2)+'px'; c.appendChild(gh);
   novoEvento({ini:ini},gh,ev,function(){ gh.remove(); }); }; });
 liga(b); }

/* ---- Ano ---- */
function pintaAno(b,por){ var y=CS.ref.getFullYear(), hoje=new Date(), hk=chave(hoje), h='';
 for(var m=0;m<12;m++){ var m0=new Date(y,m,1), off=(m0.getDay()+6)%7, nd=new Date(y,m+1,0).getDate(), g='';
  ['S','T','Q','Q','S','S','D'].forEach(function(x){ g+='<span class="wd">'+x+'</span>'; }); for(var i=0;i<off;i++) g+='<span></span>';
  for(var d=1;d<=nd;d++){ var dt=new Date(y,m,d), k=chave(dt), n=(por[k]||[]).length; g+='<span class="yd'+(k===hk?' hoje':'')+(n?(n>=4?' t3':n>=2?' t2':' t1'):'')+(CS.dia&&k===chave(CS.dia)?' sel':'')+'" data-d="'+dt.getTime()+'" title="'+(n?n+' compromisso'+(n>1?'s':''):'')+'">'+d+'</span>'; }
  h+='<div class="cym'+(y===hoje.getFullYear()&&m===hoje.getMonth()?' atual':'')+'"><h5 data-m="'+m+'">'+MESES[m]+'</h5><div class="cyg">'+g+'</div></div>'; }
 b.innerHTML='<div class="cany">'+h+'</div>';
 $$('.yd',b).forEach(function(x){ x.onclick=function(){ if(mob()){ x.ondblclick(); return; } selDia(new Date(+x.dataset.d)); }; x.ondblclick=function(){ CS.vista='dia'; CS.ref=sod(new Date(+x.dataset.d)); try{ localStorage.setItem('agcal_vista','dia'); }catch(e){} go('calendario'); }; });
 $$('h5[data-m]',b).forEach(function(x){ x.onclick=function(){ CS.vista='mes'; CS.ref=new Date(y,+x.dataset.m,1); try{ localStorage.setItem('agcal_vista','mes'); }catch(e){} go('calendario'); }; }); }

/* ---- painel do dia + próximos ---- */
function nComp(n){ return n+' compromisso'+(n!==1?'s':''); }
function relDia(d){ var h=new Date(); h.setHours(0,0,0,0); var x=new Date(d); x.setHours(0,0,0,0); var dif=Math.round((x-h)/864e5); return dif===0?'Hoje':dif===1?'Amanhã':dif===-1?'Ontem':''; }
function vazio(t,s){ return '<div class="cvazio"><div class="ic">'+I('sun',24)+'</div><b>'+t+'</b><small>'+s+'</small></div>'; }
function pintaSide(E,por){ var el=$('#cald'); if(!el) return; var d=CS.dia||sod(new Date()), sel=por[chave(d)]||[], r=relDia(d), dt=new Date(d); dt.setHours(23,59,59,999);
 var h='<div class="cdhd"><div class="cdt"><small>'+MES3[d.getMonth()]+'</small><b>'+d.getDate()+'</b></div><div><h4>'+DIAS[d.getDay()]+'</h4><p>'+(r?'<span class="cbdg">'+r+'</span>':'')+(sel.length?nComp(sel.length):'Dia livre')+'</p></div><span class="sp"></span><button class="cadd" id="caddia" title="Novo evento neste dia">'+I('plus',17)+'</button></div>';
 h+=sel.length?'<div class="ctl">'+sel.map(itemHTML).join('')+'</div>':vazio('Nada marcado','Toque no + para marcar algo neste dia.');
 var px=E.filter(function(e){ return e.d>dt; }).slice(0,5);
 if(px.length) h+='<div class="cprox"><h5>Próximos compromissos</h5>'+px.map(function(e){ return '<div class="cpx" data-ev="'+reg(e)+'"><div class="cpdt"><small>'+DIAS[e.d.getDay()].slice(0,3)+'</small><b>'+e.d.getDate()+'</b>'+(e.d.getMonth()!==d.getMonth()?'<em>'+MES3[e.d.getMonth()]+'</em>':'')+'</div><i style="background:'+TC[e.tipo][2]+'"></i><span><b>'+e4(e.t)+'</b><small>'+(e.dia?'dia todo':hm(e))+' · '+TC[e.tipo][4]+'</small></span></div>'; }).join('')+'</div>';
 el.innerHTML=h; $('#caddia',el).onclick=function(ev){ novoEvento({ini:agoraRedondo(d)},this,ev); }; liga(el); }
function rotDia(d){ var r=relDia(d); return (r?r+' · ':'')+DIAS[d.getDay()]+', '+d.getDate()+' de '+MESES[d.getMonth()]; }
function itemHTML(e){ var c=TC[e.tipo];
 return '<div class="cali" data-ev="'+reg(e)+'"><span class="h'+(e.dia?' td':'')+'">'+hm(e)+'</span><div class="cbox" style="border-color:'+c[2]+';background:'+cor(e,9)+'"><b>'+e4(e.t)+'</b><small><em style="color:'+c[2]+'">'+c[4]+'</em>'+(e.s?'<span>'+e4(e.s)+'</span>':'')+((e.tipo!=='evento'&&!e.ext)||e.dia?'':'<span>'+hmD(e.d)+(e.ext&&e.ext.fim===e.ext.ini?'':' – '+hmD(e.f))+'</span>')+'</small></div></div>'; }
function liga(b){ $$('[data-ev]',b).forEach(function(x){ x.onclick=function(ev){ ev.stopPropagation(); var e=ITENS[+x.dataset.ev]; if(e&&e.go) e.go(x,ev); }; }); }

/* ---------- pop-ups (no jeito da Apple) ---------- */
var _popFim=null;
function fechaPop(){ $$('.cpov,.cpop').forEach(function(x){ x.remove(); }); if(_popFim){ var f=_popFim; _popFim=null; f(); } }
document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&$('.cpop')) fechaPop(); });
function abrePop(html,w,ancora,ev,abaixo,aoFechar){ fechaPop(); _popFim=aoFechar||null; var m=mob();
 var ov=document.createElement('div'); ov.className='cpov'+(m?' mob':''); ov.onclick=fechaPop; var p=document.createElement('div'); p.className='cpop'+(m?' mob':''); p.style.width=w+'px'; p.innerHTML=html;
 document.body.appendChild(ov); document.body.appendChild(p);
 if(!m){ var vw=W.innerWidth, vh=W.innerHeight, ph=p.offsetHeight, L, T;
  if(abaixo&&ancora){ var r=ancora.getBoundingClientRect(); L=Math.min(Math.max(12,r.right-w),vw-w-12); T=r.bottom+8; }
  else { var x=ev&&ev.clientX!=null?ev.clientX:(ancora?ancora.getBoundingClientRect().right:vw/2), y=ev&&ev.clientY!=null?ev.clientY:(ancora?ancora.getBoundingClientRect().top:vh/3);
   if(ancora&&!ev){ var r2=ancora.getBoundingClientRect(); x=r2.right; y=r2.top; }
   L=x+16; if(L+w>vw-12) L=Math.max(12,x-w-16); T=y-40; }
  T=Math.max(12,Math.min(T,vh-ph-12)); p.style.left=L+'px'; p.style.top=T+'px'; }
 requestAnimationFrame(function(){ p.classList.add('on'); }); return p; }

/* Calendários: ligar e desligar, como na Apple */
var CHK='<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
function calendarios(){ var bt=$('#calcals'), ini=periodo(), cnt={}, cntP={};
 eventos(true).forEach(function(e){ if(e.d>=ini[0]&&e.d<ini[1]){ cnt[e.tipo]=(cnt[e.tipo]||0)+1; if(e.who) cntP[e.who]=(cntP[e.who]||0)+1; } });
 var em=CS.ag.email||'';
 var h='<h6>Meus calendários</h6>'+TIPOS.map(function(t){ return '<label class="ckr'+(CS.off[t[0]]?' off':'')+'" data-t="'+t[0]+'" style="--c:'+t[2]+'"><span class="cckb">'+CHK+'</span><span><b>'+t[1]+(t[0]==='evento'?'<i class="cpr">principal</i>':'')+'</b>'+(t[0]==='evento'?'<small>'+(em?e4(em):'seu e-mail da Agion')+'</small>':'')+'</span><em>'+(cnt[t[0]]||'')+'</em></label>'; }).join('');
 if(!RO()){ h+='<h6>Outras agendas · só para ver</h6>'+CS.ext.map(function(c){ var k='x'+c.id; return '<label class="ckr'+(CS.off[k]?' off':'')+'" data-t="'+k+'" style="--c:'+c.cor+'"><span class="cckb">'+CHK+'</span><span><b>'+e4(c.nome)+'</b>'+(c.erro?'<small class="cxe">Não atualizou: '+e4(c.erro)+'</small>':'<small>'+e4(ORGX[c.origem]||'outro app')+'</small>')+'</span><em>'+(cnt[k]||'')+'</em><span class="cxg" data-x="'+c.id+'" title="Ajustar">'+I('gear',14)+'</span></label>'; }).join('')+
  '<button class="cxadd" id="cpadd">'+I('plus',16)+'Trazer Google pessoal, Outlook ou iPhone</button>'; }
 if(equipeOn()){ var eq=(typeof EQUIPE!=='undefined'?EQUIPE:[]).filter(function(u){ return U[u]; });
  if(eq.length) h+='<h6>Equipe</h6>'+eq.map(function(u){ var n=un(u); return '<label class="ckr'+(CS.offP[u]?' off':'')+'" data-p="'+u+'" style="--c:'+avc(n)+'"><span class="cckb">'+CHK+'</span><span><b>'+e4(n)+(u===ME()?' <small style="display:inline;color:var(--mut)">(você)</small>':'')+'</b></span><em>'+(cntP[u]||'')+'</em></label>'; }).join(''); }
 h+='<h6>Espelhos</h6><button class="cplink" id="cpesp">'+I('globe',16)+'Ver no Google pessoal, Outlook ou Apple</button>'+
  '<div class="cpnote">'+(CS.ag.google?'Os eventos que você cria aqui vão direto para a agenda Google de <b>'+e4(em)+'</b>.':em?'Os eventos que você cria aqui vão para a agenda Google de <b>'+e4(em)+'</b> assim que a conexão com o Google for ativada. Até lá ficam salvos aqui e nos espelhos.':'Os eventos que você cria ficam salvos aqui e nos espelhos. Para irem para a sua agenda Google da Agion, o seu e-mail da empresa precisa estar cadastrado em Ajustes.')+' Os outros calendários (Google pessoal, Outlook, Apple) recebem uma cópia para você ver, e as agendas deles podem aparecer aqui em “Outras agendas”.</div>';
 var p=abrePop(h,320,bt,null,true);
 $$('.ckr',p).forEach(function(l){ l.onclick=function(ev){ ev.preventDefault(); var g=ev.target.closest&&ev.target.closest('.cxg'); if(g){ ev.stopPropagation(); editExterno(g.dataset.x); return; } if(l.dataset.t){ var k=l.dataset.t; CS.off[k]=!CS.off[k]; l.classList.toggle('off',!!CS.off[k]); if(k.charAt(0)==='x') salvaOffX(); } else { var u=l.dataset.p; CS.offP[u]=!CS.offP[u]; l.classList.toggle('off',!!CS.offP[u]); } pinta(); }; });
 $('#cpesp',p).onclick=function(){ fechaPop(); sincronizar(); }; if($('#cpadd',p)) $('#cpadd',p).onclick=addExterno; }

/* Novo evento / editar */
function abrirEvento(c,el,ev){ novoEvento({ini:c.dia_todo?(function(){ var p=String(c.dia).split('-'); return new Date(+p[0],+p[1]-1,+p[2],9); })():new Date(c.ini),fim:c.dia_todo?null:new Date(c.fim),dia_todo:!!c.dia_todo,cust:c},el,ev); }
function novoEvento(o,ancora,ev,aoFechar){ if(RO()){ toast('Saia do “Ver como” para criar eventos','eye'); if(aoFechar) aoFechar(); return; }
 var c=o.cust||null, ini=o.ini||agoraRedondo(CS.dia||new Date()), fim=o.fim||new Date(ini.getTime()+60*6e4), dt=!!o.dia_todo, em=CS.ag.email||'';
 var meu=!c||c.uid===ME(), dono=c&&!meu?un(c.uid):'';
 var h='<div class="cev"><input class="ctit" id="cvt" placeholder="Novo evento" maxlength="200" value="'+e4(c?c.titulo:'')+'">'+
  '<div class="clb">Dia todo<label class="csw"><input type="checkbox" id="cvdt"'+(dt?' checked':'')+'><i></i></label></div>'+
  '<div class="crw"><input type="date" id="cvd" value="'+ymd(ini)+'"><span class="chs" id="cvhs"'+(dt?' style="display:none"':'')+'><input type="time" id="cvi" step="300" value="'+hmD(ini)+'"><i>–</i><input type="time" id="cvf" step="300" value="'+hmD(fim)+'"></span></div>'+
  '<div class="ccal"><i style="background:'+TC.evento[2]+'"></i><span>'+(dono?'Agenda de '+e4(dono):'Agenda Agion')+'<small> · '+(dono?'':em?e4(em):'seu e-mail da Agion')+'</small></span></div>'+
  '<input id="cvl" placeholder="Local ou link da chamada de vídeo" maxlength="500" value="'+e4(c?c.local||'':'')+'">'+
  (CS.ag.google?'<label class="cmeet"><input type="checkbox" id="cvm"'+(c&&c.meet?' checked':'')+'>Criar link do Google Meet</label>':'')+
  '<input id="cvc" placeholder="Convidados (e-mails separados por vírgula)" value="'+e4(c?(c.convidados||[]).join(', '):'')+'">'+
  '<textarea id="cvn" placeholder="Notas" maxlength="4000">'+e4(c?c.notas||'':'')+'</textarea>'+
  '<div class="cerr" id="cver"></div>'+
  '<div class="cbt">'+(c?'<button class="cdel" id="cvx">Excluir</button>':'')+'<span class="sp"></span><button class="btn sm ol" id="cvcan">Cancelar</button><button class="btn sm gd" id="cvok">'+(c?'Salvar':'Adicionar')+'</button></div>'+
  (c?'<div class="csync">'+(c.sync==='google'?'Na agenda Google de '+e4(c.g_email||em)+(c.g_link?' · <a href="'+e4(c.g_link)+'" target="_blank" rel="noopener" style="color:var(--goldd)">abrir no Google</a>':''):'Salvo aqui e nos espelhos'+(em?'. Vai para '+e4(em)+' quando o Google for conectado.':'.'))+'</div>':'')+
  '</div>';
 var p=abrePop(h,360,ancora,ev,false,aoFechar);
 var fx=function(){ $('#cvhs',p).style.display=$('#cvdt',p).checked?'none':''; }; $('#cvdt',p).onchange=fx;
 $('#cvi',p).onchange=function(){ var a=$('#cvi',p).value, b=$('#cvf',p).value; if(a&&(!b||b<=a)){ var t=a.split(':'), n=(+t[0]*60+ +t[1]+60)%(24*60); $('#cvf',p).value=z(Math.floor(n/60))+':'+z(n%60); } };
 if(!c&&!mob()) setTimeout(function(){ var t=$('#cvt',p); if(t) t.focus(); },60);
 $('#cvcan',p).onclick=fechaPop;
 var ocupado=false;
 $('#cvok',p).onclick=function(){ if(ocupado) return; var er=$('#cver',p); er.textContent='';
  var tit=$('#cvt',p).value.trim(); if(!tit){ er.textContent='Dê um título ao evento.'; $('#cvt',p).focus(); return; }
  var dia=$('#cvd',p).value; if(!dia){ er.textContent='Escolha a data.'; return; }
  var corpo={acao:c?'editar':'criar',id:c?c.id:undefined,titulo:tit,dia_todo:$('#cvdt',p).checked,dia:dia,local:$('#cvl',p).value.trim(),convidados:$('#cvc',p).value,notas:$('#cvn',p).value.trim(),meet:!!($('#cvm',p)&&$('#cvm',p).checked)};
  if(!corpo.dia_todo){ var a=$('#cvi',p).value||'09:00', b=$('#cvf',p).value, i1=new Date(dia+'T'+a), f1=b?new Date(dia+'T'+b):null; if(!f1||f1<=i1) f1=new Date(i1.getTime()+60*6e4); if(isNaN(i1)){ er.textContent='Horário inválido.'; return; } corpo.ini=i1.toISOString(); corpo.fim=f1.toISOString(); }
  ocupado=true; var btn=$('#cvok',p); btn.textContent='Salvando…';
  Promise.resolve(papi('/api/cal/eventos',{method:'POST',body:JSON.stringify(corpo)})).then(function(r){ ocupado=false;
   if(!r||!r.ok||!r.data||!r.data.evento){ btn.textContent=c?'Salvar':'Adicionar'; er.textContent=(r&&r.data&&(r.data.erro||r.data.error))||'Não consegui salvar agora. Tente de novo.'; return; }
   var e=r.data.evento; if(r.data.agion) CS.ag=r.data.agion; CS.cust=(CS.cust||[]).filter(function(x){ return x.id!==e.id; }).concat([e]);
   _popFim=null; fechaPop(); if(aoFechar) aoFechar();
   var dd=e.dia_todo?(function(){ var q=String(e.dia).split('-'); return new Date(+q[0],+q[1]-1,+q[2]); })():sod(new Date(e.ini)); CS.dia=dd; if(CS.vista==='dia') CS.ref=dd; pinta();
   toast(e.sync==='google'?'Na sua agenda Google da Agion':(c?'Evento atualizado':'Evento adicionado')+(e.sync==='pendente'&&em?' · vai para o Google quando a conexão for ativada':''),'cal'); },
  function(){ ocupado=false; btn.textContent=c?'Salvar':'Adicionar'; er.textContent='Sem conexão com o robô. Tente de novo.'; }); };
 if(c) $('#cvx',p).onclick=function(){ var x=this; if(!x.dataset.ok){ x.dataset.ok=1; x.textContent='Confirmar exclusão'; return; }
  x.textContent='Excluindo…'; Promise.resolve(papi('/api/cal/eventos',{method:'POST',body:JSON.stringify({acao:'excluir',id:c.id})})).then(function(r){
   if(!r||!r.ok){ x.textContent='Excluir'; delete x.dataset.ok; $('#cver',p).textContent=(r&&r.data&&r.data.erro)||'Não consegui excluir agora.'; return; }
   CS.cust=(CS.cust||[]).filter(function(y){ return y.id!==c.id; }); fechaPop(); pinta(); toast('Evento excluído','x'); }); }; }

/* ---------- assinar no Google / Outlook / Apple ---------- */
function sincronizar(){ if(RO()){ toast('Saia do “Ver como” para pegar o seu link','eye'); return; }
 var s=sheet('<h2>Adicionar ao meu calendário</h2><p style="color:var(--mut);font-size:13px;line-height:1.55;margin:6px 0 14px">A sua <b>agenda Google da Agion</b> é a principal: os eventos que você cria no Calendário vão direto para ela. Nos outros (Google pessoal, Outlook, Apple) fica uma <b>cópia para você ver</b>, com tarefas, reuniões, prazos do CRM, decisões de proposta e assembleias, atualizada sozinha.</p><div class="calsync" id="cslist"><div class="empty" style="padding:14px">Gerando o seu link…</div></div>',520);
 Promise.resolve(papi('/api/cal/link',{method:'GET'})).then(function(r){ var d=r&&r.data, l=$('#cslist',s); if(!l) return;
  if(!r||!r.ok||!d||!d.url){ l.innerHTML='<div class="empty" style="padding:14px">Não consegui gerar o link agora. Tente de novo em instantes.</div>'; return; }
  var u=d.url, wc=d.webcal, nm=encodeURIComponent('Agion');
  var wcg=wc+(wc.indexOf('?')<0?'?':'&')+'g=1', em=CS.ag.email||'seu e-mail da Agion';
  /* CAL_APPLE_27OUT: no Apple o webcal:// vira http:// e o iPhone/Mac recusa ("A validação falhou"); webcals:// assina pelo https */
  var wca=String(u).replace(/^https?:\/\//,'webcals://');
  var op=[['agion','Google Agenda da Agion · principal',em+' · tarefas, reuniões e prazos entram junto','https://calendar.google.com/calendar/r?cid='+encodeURIComponent(wcg),'cal'],['google','Google pessoal','Gmail pessoal · cópia para ver','https://calendar.google.com/calendar/r?cid='+encodeURIComponent(wc),'globe'],
   ['apple','Apple (iPhone, iPad e Mac)','Copia o link e mostra onde colar no Calendário',wca,'phone'],
   ['outlook','Outlook.com / Hotmail','Conta pessoal da Microsoft','https://outlook.live.com/calendar/0/addfromweb?url='+encodeURIComponent(u)+'&name='+nm,'mail'],
   ['o365','Outlook da empresa (Microsoft 365)','Conta de trabalho ou escola','https://outlook.office.com/calendar/0/addfromweb?url='+encodeURIComponent(u)+'&name='+nm,'mail']];
  l.innerHTML=op.map(function(o,i){ return (i===1?'<h6>Espelhos · só para ver</h6>':'')+'<a href="'+e4(o[3])+'" data-op="'+o[0]+'" target="_blank" rel="noopener"'+(i===0?' class="pri"':'')+'><span class="ic">'+I(o[4],18)+'</span><span>'+o[1]+'<small>'+e4(o[2])+'</small></span></a>'; }).join('')+
   '<button class="op" id="cscp"><span class="ic">'+I('copy',18)+'</span><span>Copiar o link<small>Para qualquer outro app de calendário</small></span></button>'+
   '<h6>Trazer para cá</h6><button class="op" id="csext"><span class="ic">'+I('dl',18)+'</span><span>Ver aqui as agendas do Google pessoal, Outlook ou iPhone<small>Só para ver, atualiza a cada 15 minutos</small></span></button>'+
   '<p style="font-size:11.8px;color:var(--mut);line-height:1.5;margin-top:10px">O Google e o Outlook atualizam calendários assinados de tempos em tempos (pode levar algumas horas). O link é só seu: não compartilhe. <a href="#" id="cstr" style="color:var(--goldd);display:inline;padding:0;background:none;font:inherit">Trocar o link</a> se precisar invalidar o antigo.</p>';
  var ap=$('[data-op="apple"]',l); if(ap) ap.onclick=function(ev){ ev.preventDefault(); /* CAL_APPLE2_27OUT: o Safari não abre webcals:// e o webcal:// vira http:// (o Calendário recusa). Caminho que funciona: colar o link https na assinatura */
   try{ navigator.clipboard.writeText(u); }catch(e){}
   var ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
   var pI='<div style="margin:10px 0"><b style="font-size:13.5px">No iPhone ou iPad</b><ol style="margin:6px 0 0 18px;padding:0;font-size:13px;line-height:1.6;color:var(--ink2)"><li>Abra o app <b>Calendário</b> e toque em <b>Calendários</b>, embaixo.</li><li>Toque em <b>Adicionar Calendário</b> › <b>Adicionar Calendário Assinado</b>.</li><li>Cole o link, toque em <b>Buscar</b> e depois em <b>Adicionar</b>.</li></ol></div>';
   var pM='<div style="margin:10px 0"><b style="font-size:13.5px">No Mac</b><ol style="margin:6px 0 0 18px;padding:0;font-size:13px;line-height:1.6;color:var(--ink2)"><li>Abra o app <b>Calendário</b> › menu <b>Arquivo</b> › <b>Nova Assinatura de Calendário</b>.</li><li>Cole o link e clique em <b>Assinar</b>.</li><li>Em <b>Local</b>, escolha <b>iCloud</b> para aparecer também no iPhone.</li></ol></div>';
   closeSheet(true);
   var s2=sheet('<h2>Assinar no Apple</h2><p style="color:var(--mut);font-size:13px;line-height:1.55;margin:6px 0 4px">O seu link já foi <b>copiado</b>. É só colar no app Calendário:</p>'+(ios?pI+pM:pM+pI)+
    '<div class="fi"><textarea id="caplk" rows="2" readonly style="font-size:12px">'+e4(u)+'</textarea></div><div style="display:flex;justify-content:flex-end;gap:10px;margin-top:8px"><button class="btn ol" id="capx">Fechar</button><button class="btn gd" id="capc">Copiar o link</button></div>',480);
   var ta=$('#caplk',s2); if(ta) ta.onfocus=function(){ try{ ta.select(); }catch(e){} };
   $('#capc',s2).onclick=function(){ try{ navigator.clipboard.writeText(u); toast('Link copiado','copy'); }catch(e){ if(ta){ ta.focus(); ta.select(); } } };
   $('#capx',s2).onclick=function(){ closeSheet(); }; };
  $('#csext',l).onclick=function(){ closeSheet(); setTimeout(addExterno,60); };
  $('#cscp',l).onclick=function(){ try{ navigator.clipboard.writeText(u); toast('Link copiado','copy'); }catch(e){ perguntar('Seu link do calendário','Copie o link abaixo.','',  'Ok',u); } };
  $('#cstr',l).onclick=function(ev){ ev.preventDefault(); confirma('Trocar o link?','O link antigo para de funcionar. Depois é preciso assinar de novo com o novo link.','Trocar').then(function(ok){ if(!ok) return;
   Promise.resolve(papi('/api/cal/link',{method:'POST',body:JSON.stringify({trocar:true})})).then(function(r){   /* GPT_27OUT: só confirma a troca se a API confirmou */
    if(!r||!r.ok||!r.data||!r.data.ok){ toast('O link NÃO foi trocado: '+((r&&r.data&&(r.data.erro||r.data.error))||'erro no robô')+'. O antigo continua valendo. Tente de novo.','x'); return; }
    closeSheet(); toast('Link trocado. Assine de novo com o novo link.','ok'); sincronizar(); },function(){ toast('Sem conexão: o link NÃO foi trocado. O antigo continua valendo.','x'); }); }); };
 },function(){ var l=$('#cslist',s); if(l) l.innerHTML='<div class="empty" style="padding:14px">Não consegui gerar o link agora.</div>'; }); }

/* ---------- menu: Comercial › Calendário ---------- */
try{ if(typeof V4OK!=='undefined') V4OK.calendario=1;
 var _ngCal=W.navGrupos; W.navGrupos=function(){ var g=_ngCal.apply(this,arguments); try{ var ehc=false; try{ ehc=effRoleR()==='cliente'; }catch(e){} if(ehc) return g;
   return g.map(function(x){ if(x[0]!=='Comercial'||x[1].some(function(t){ return t[0]==='calendario'; })) return x; var it=x[1].slice(), i=-1; it.forEach(function(t,j){ if(t[0]==='tarefas') i=j; }); it.splice(i>=0?i+1:it.length,0,['calendario','Calendário','cal']); return [x[0],it]; }); }catch(e){ return g; } };
 setTimeout(function(){ try{ buildNavKeep(); }catch(e){} },0);
}catch(e){ console.warn('[calendario] menu',e); }

/* ---------- tutorial da aba ---------- */
var TOUR={id:'t-cal',page:'calendario',v:3,g:'Comercial',title:'Calendário',desc:'Tudo que tem data, num lugar só, e como levar para o Google, Outlook ou Apple.',steps:[
 {t:function(){ return document.querySelector('#calb'); },title:'O seu calendário',text:'Tarefas com prazo, reuniões do CRM, os prazos do “Aguardando resposta”, a data em que o cliente decide a proposta e as assembleias.'},
 {t:function(){ return document.querySelector('#calcals'); },title:'Calendários',text:'Ligue e desligue cada calendário: Agenda Agion, tarefas, reuniões, prazos, propostas e assembleias. Em “Outras agendas” você traz o seu Google pessoal, Outlook ou iPhone para ver aqui.',optional:true},
 {t:function(){ return document.querySelector('#calv'); },title:'Dia, Semana, Mês e Ano',text:'Como no Calendário da Apple. Clique num horário (ou no + do dia) para criar um evento: ele vai para a sua agenda Google da Agion.',optional:true},
 {t:function(){ return document.querySelector('#calsync'); },title:'No seu celular',text:'“Adicionar ao meu calendário” leva tudo para o Google Agenda, o Outlook ou o app Calendário da Apple, em qualquer e-mail seu.'}
]};
(function rt(n){ var T2=W.AgionTour2; if(!(T2&&T2.config&&W.TUG)){ if(n<80) setTimeout(function(){ rt(n+1); },250); return; }
 if(!T2.config.some(function(t){ return t.id===TOUR.id; })) T2.config.push(TOUR);
 try{ var g=W.TUG.filter(function(x){ return x[0]==='Comercial'; })[0]; if(g&&g[1].indexOf('t-cal')<0){ var i=g[1].indexOf('tarefas'); g[1].splice(i>=0?i+1:g[1].length,0,'t-cal'); } if(W.TUIC) W.TUIC['t-cal']='cal'; }catch(e){} })(0);
if(R.tutoriais){ var _rtC=R.tutoriais; R.tutoriais=function(){ try{ var g=W.TUG&&W.TUG.filter(function(x){ return x[0]==='Comercial'; })[0]; if(g&&g[1].indexOf('t-cal')<0) g[1].push('t-cal'); }catch(e){} return _rtC.apply(this,arguments); }; }
})();
