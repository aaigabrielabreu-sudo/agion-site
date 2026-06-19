document.documentElement.classList.add('js');
/* ================= DADOS ================= */
const WHATS = 'https://wa.me/5551993078590';
const fmtBRL = v => v.toLocaleString('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:2});

const SIM = {
  imovel: {
    fee: 0.22, min: 100000, max: 2000000, label: 'De R$ 100.000 a R$ 2.000.000',
    plans: [
      {min:100000,  max:275000,  months:180},
      {min:200000,  max:800000,  months:200},
      {min:500000,  max:1500000, months:220},
      {min:1000000, max:2000000, months:240}
    ]
  },
  auto: {
    fee: 0.16, min: 25000, max: 800000, label: 'De R$ 25.000 a R$ 800.000',
    plans: [
      {min:25000,  max:50000,  months:36},
      {min:35000,  max:70000,  months:72},
      {min:100000, max:300000, months:100},
      {min:300000, max:800000, months:120}
    ]
  }
};

const PRODUCTS = {
  imovel: [
    {t:'Imóvel', d:'Cartas de crédito para compra de casa, apartamento, imóvel novo ou usado, construção e reforma.', v:'https://cdn.jsdelivr.net/gh/aaigabrielabreu-sudo/agionconsorcio@main/frontend/public/videos/card-imovel.mp4', p:'https://cdn.jsdelivr.net/gh/aaigabrielabreu-sudo/agionconsorcio@main/frontend/public/images/poster-card-imovel.jpg', hl:['Residencial e Comercial','Novo ou Usado','Construção e Reforma'], ic:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>'},
    {t:'Terreno', d:'Cartas de crédito para aquisição de terreno urbano, rural, sítio, chácara ou terras em áreas rurais.', v:'https://cdn.jsdelivr.net/gh/aaigabrielabreu-sudo/agionconsorcio@main/frontend/public/videos/card-terreno-final.mp4', p:'https://cdn.jsdelivr.net/gh/aaigabrielabreu-sudo/agionconsorcio@main/frontend/public/images/poster-card-terreno.jpg', hl:['Terreno Urbano','Terreno Rural','Sítio e Chácara'], ic:'<path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z"/><path d="M12 22v-3"/>'},
    {t:'Placa Solar', d:'Financie seu sistema de energia solar fotovoltaica através do consórcio imobiliário com condições especiais.', v:'https://cdn.jsdelivr.net/gh/aaigabrielabreu-sudo/agionconsorcio@main/frontend/public/videos/card-solar-v2.mp4', p:'https://cdn.jsdelivr.net/gh/aaigabrielabreu-sudo/agionconsorcio@main/frontend/public/images/poster-card-solar-v2.jpg', hl:['Energia Fotovoltaica','Redução na Conta de Luz','Sustentabilidade'], ic:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>'},
    {t:'Investimentos via Consórcio', d:'Dentro da operação de consórcio, é possível utilizar a carta contemplada como estratégia de rendimento com até 101% do CDI em fundo de renda fixa.', v:'https://cdn.jsdelivr.net/gh/aaigabrielabreu-sudo/agionconsorcio@main/frontend/public/videos/card-investimentos-final.mp4', p:'https://cdn.jsdelivr.net/gh/aaigabrielabreu-sudo/agionconsorcio@main/frontend/public/images/poster-card-investimentos.jpg', hl:['Operação dentro do consórcio','Rendimento até 101% do CDI','Renda fixa via carta contemplada'], ic:'<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>'}
  ],
  auto: [
    {t:'Carro', d:'Cartas de crédito para aquisição de carro novo ou usado, popular ou de luxo, com as melhores condições do mercado.', v:'https://cdn.jsdelivr.net/gh/aaigabrielabreu-sudo/agionconsorcio@main/frontend/public/videos/card-carro-new.mp4', p:'https://cdn.jsdelivr.net/gh/aaigabrielabreu-sudo/agionconsorcio@main/frontend/public/images/poster-card-carro-new.jpg', hl:['Novo ou Usado','Popular e Luxo','Parcelas acessíveis'], ic:'<path d="M5 17h14l-1.5-5.5a2 2 0 0 0-2-1.5h-7a2 2 0 0 0-2 1.5Z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/>'},
    {t:'Moto', d:'Cartas de crédito para motocicletas de todos os portes, do dia a dia ao lazer, com parcelas acessíveis.', v:'https://cdn.jsdelivr.net/gh/aaigabrielabreu-sudo/agionconsorcio@main/frontend/public/videos/card-moto.mp4', p:'https://cdn.jsdelivr.net/gh/aaigabrielabreu-sudo/agionconsorcio@main/frontend/public/images/poster-card-moto.jpg', hl:['Todos os portes','Lazer e trabalho','Parcelas acessíveis'], ic:'<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h2.5L21 10M6 17.5 10 9h4l4.5 8.5"/>'},
    {t:'Caminhão e Pesados', d:'Cartas de crédito para caminhões, ônibus, máquinas agrícolas e equipamentos pesados para seu negócio.', v:'https://cdn.jsdelivr.net/gh/aaigabrielabreu-sudo/agionconsorcio@main/frontend/public/videos/card-trator.mp4', p:'https://cdn.jsdelivr.net/gh/aaigabrielabreu-sudo/agionconsorcio@main/frontend/public/images/poster-card-trator.jpg', hl:['Caminhões e Ônibus','Máquinas Agrícolas','Equipamentos Pesados'], ic:'<path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>'},
    {t:'Embarcações Náuticas', d:'Cartas de crédito para lanchas, veleiros, jet skis e embarcações náuticas em geral, com planos sob medida.', v:'https://cdn.jsdelivr.net/gh/aaigabrielabreu-sudo/agionconsorcio@main/frontend/public/videos/card-iate.mp4', p:'https://cdn.jsdelivr.net/gh/aaigabrielabreu-sudo/agionconsorcio@main/frontend/public/images/poster-card-iate.jpg', hl:['Lanchas e Veleiros','Jet Ski','Embarcações em geral'], ic:'<path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M4 18 2 12h19l-3 6"/><path d="M12 12V4l7 8"/>'}
  ]
};

const CARTAS = [
  ['R$ 142.000,00','R$ 910,00',2],['R$ 158.000,00','R$ 990,00',3],['R$ 177.000,00','R$ 1.120,00',3],
  ['R$ 196.000,00','R$ 1.190,00',3],['R$ 215.000,00','R$ 1.295,00',3],['R$ 248.000,00','R$ 1.480,00',1],
  ['R$ 290.000,00','R$ 1.790,00',4],['R$ 317.000,00','R$ 1.960,00',2],['R$ 355.000,00','R$ 2.210,00',2],
  ['R$ 398.000,00','R$ 2.610,00',3],['R$ 430.000,00','R$ 2.740,00',5],['R$ 455.000,00','R$ 2.955,00',4],
  ['R$ 510.000,00','R$ 3.220,00',2],['R$ 540.000,00','R$ 3.410,00',3],['R$ 580.000,00','R$ 3.620,00',2],
  ['R$ 615.000,00','R$ 3.780,00',2],['R$ 660.000,00','R$ 4.210,00',5],['R$ 760.000,00','R$ 4.590,00',5],
  ['R$ 800.000,00','R$ 4.960,00',3],['R$ 840.000,00','R$ 5.010,00',2],['R$ 1.165.000,00','R$ 6.790,00',6],
  ['R$ 1.510.000,00','R$ 9.405,00',2],['R$ 2.120.000,00','R$ 13.060,00',5],['R$ 3.410.000,00','R$ 19.200,00',4]
];

const STEPS = [
  {n:1, t:'Diagnóstico Financeiro', s:'Entendemos sua realidade', d:'Realizamos uma radiografia completa das suas finanças: renda total, despesas fixas e variáveis, dívidas, patrimônio acumulado e capacidade de investimento mensal. Esse mapeamento é a base para um plano sólido.', tip:'Identificamos o valor ideal de parcela que cabe no seu orçamento sem comprometer sua qualidade de vida.', hl:'Parcelas que cabem em até 30% da renda', ic:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'},
  {n:2, t:'Definição de Metas', s:'Traçamos seus objetivos', d:'Definimos metas claras e alcançáveis usando a metodologia SMART: o tipo de imóvel desejado, o valor de crédito necessário, o prazo ideal e a estratégia de contemplação — seja por sorteio ou lance estratégico.', tip:'Metas SMART: Específicas, Mensuráveis, Alcançáveis, Relevantes e com Prazo definido.', hl:'Planejamento com metas de curto, médio e longo prazo', ic:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'},
  {n:3, t:'Otimização do Orçamento', s:'Organizamos suas finanças', d:'Aplicamos a regra 50-30-20 adaptada ao seu perfil: 50% para necessidades fixas, 30% para estilo de vida e 20% destinados ao consórcio e investimentos. Eliminamos gastos supérfluos e criamos uma reserva de emergência.', tip:'A regra 50-30-20 é o ponto de partida — ajustamos conforme a realidade de cada cliente.', hl:'Método 50-30-20 personalizado', ic:'<path d="M21.2 15.9A10 10 0 1 1 8 2.8"/><path d="M22 12A10 10 0 0 0 12 2v10Z"/>'},
  {n:4, t:'Estratégia de Consórcio + Investimento', s:'Integramos consórcio e investimentos', d:'Aqui está o grande diferencial: selecionamos o plano de consórcio ideal e, simultaneamente, orientamos a alocação dos seus recursos em investimentos estratégicos. Enquanto suas parcelas formam o crédito, seus investimentos crescem para potencializar lances.', tip:'Investimentos de baixo risco rendem enquanto você espera — e podem ser usados para dar lances e antecipar a contemplação.', hl:'Consórcio + Investimentos trabalhando juntos', ic:'<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>'},
  {n:5, t:'Acompanhamento Contínuo', s:'Monitoramos seus resultados', d:'Fazemos revisões periódicas do seu plano, ajustando estratégias conforme mudanças na sua vida financeira. Acompanhamos assembleias, oportunidades de lance e performance dos investimentos para garantir o melhor resultado.', tip:'Revisões mensais garantem que seu plano esteja sempre atualizado e otimizado.', hl:'Acompanhamento mensal personalizado', ic:'<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>'}
];

const DEPOS = [
  {n:'Marcos Silva', l:'São Paulo - SP', t:'De forma direta e objetiva os consultores da Agion encontraram a melhor solução para o que eu precisava no momento. Nota 10.'},
  {n:'Ana Paula Costa', l:'Rio de Janeiro - RJ', t:'Venho aqui relatar a minha satisfação e 100% de aprovação com o atendimento da equipe. Recomendo essa empresa 100% séria, 100% objetiva e de caráter.'},
  {n:'Roberto Mendes', l:'Belo Horizonte - MG', t:'Hoje, graças aos consórcios que fui contemplado, graças à equipe Agion eu tenho a minha casa própria.'},
  {n:'Fernanda Lima', l:'Curitiba - PR', t:'As pessoas da equipe me atendem muito rápido e muito bem. Eu fiz o meu consórcio com eles e o próximo consórcio que eu fizer também será com eles.'},
  {n:'Carlos Eduardo', l:'Salvador - BA', t:'Escolhi trabalhar com a Agion depois de uma pesquisa de mercado, onde o pessoal bem receptivo esclareceu bem o andamento do processo de consórcio.'},
  {n:'Juliana Santos', l:'Brasília - DF', t:'Em poucos meses já fui contemplada. Isso demonstra a seriedade e a dinâmica da equipe. Do fundo do meu coração eu agradeço.'}
];

const FAQS = [
  ['Como funciona o consórcio?','No consórcio, você participa de um grupo de pessoas com o mesmo objetivo de compra. Todos pagam parcelas mensais que formam um caixa comum. Todo mês, em assembleia, participantes são contemplados por sorteio ou lance e recebem a carta de crédito para adquirir o bem — sem juros, apenas com taxa administrativa.'],
  ['O que é meia parcela?','Meia parcela é uma modalidade em que você paga 50% do valor da parcela integral até a contemplação, fazendo o consórcio caber no seu orçamento. Na Agion trabalhamos exclusivamente com planos de meia parcela.'],
  ['Consórcio tem juros?','Não. O consórcio tem 0% de juros — diferente do financiamento, que cobra de 8% a 12% ao ano. Existe apenas uma taxa administrativa reduzida, o que pode tornar a compra até 60% mais econômica que um financiamento.'],
  ['O que é carta contemplada?','É uma cota de consórcio que já foi contemplada por sorteio ou lance e está disponível para uso imediato do crédito. Ideal para quem não quer esperar: você assume a cota e pode utilizar o valor logo após a transferência aprovada pela administradora.'],
  ['Qual o valor mínimo para começar?','O consórcio de veículos parte de R$ 25.000 e o consórcio imobiliário parte de R$ 100.000, com planos de meia parcela que cabem em até 30% da sua renda mensal.'],
  ['Posso usar o consórcio para construir ou reformar?','Sim. O consórcio imobiliário permite comprar imóvel novo ou usado, terreno, construir e reformar — inclusive instalar energia solar. Para obras, o crédito é liberado em etapas de 30%, tanto para obra própria quanto com construtora.'],
  ['É seguro fazer consórcio?','Sim. Trabalhamos apenas com administradoras sólidas, autorizadas e fiscalizadas pelo Banco Central do Brasil — como Embracon, Itaú, Santander, Porto, HS, BB, Mapfre, Caixa e Canopus.']
];

/* ================= SIMULADOR ================= */
try{
function setupSim(root){
  const tabs = root.querySelectorAll('.sim-tabs button');
  const input = root.querySelector('input');
  const range = root.querySelector('[data-range]');
  const go = root.querySelector('[data-go]');
  const result = root.querySelector('[data-result]');
  let type = 'imovel', raw = 0;

  tabs.forEach(b=>b.addEventListener('click',()=>{
    tabs.forEach(x=>{x.classList.remove('on');x.setAttribute('aria-selected','false')});
    b.classList.add('on'); b.setAttribute('aria-selected','true');
    type = b.dataset.type;
    range.textContent = SIM[type].label;
    input.value=''; raw=0; result.classList.remove('show'); update();
  }));

  input.addEventListener('input',()=>{
    const nums = input.value.replace(/\D/g,'');
    raw = nums ? parseInt(nums,10)/100 : 0;
    input.value = nums ? fmtBRL(raw) : '';
    result.classList.remove('show');
    update();
  });

  function valid(){ return raw >= SIM[type].min && raw <= SIM[type].max; }
  function update(){
    if(valid()){ go.classList.add('ready'); range.style.color=''; range.textContent = SIM[type].label; }
    else {
      go.classList.remove('ready');
      if(raw>0){ range.style.color='#dc2626'; range.textContent='Valor fora da faixa disponível ('+SIM[type].label.toLowerCase()+')'; }
      else { range.style.color=''; range.textContent = SIM[type].label; }
    }
  }

  go.addEventListener('click',()=>{
    if(!valid()) return;
    const cfg = SIM[type];
    const plans = cfg.plans.filter(p=>raw>=p.min && raw<=p.max);
    if(!plans.length) return;
    let sel = 0;
    const meia = m => raw*(1+cfg.fee)/m/2;
    function render(){
      result.innerHTML =
        '<div class="sim-plans">'+plans.map((p,i)=>
          '<button class="sim-plan'+(i===sel?' on':'')+'" data-i="'+i+'"><small>Prazo</small><b>'+p.months+' meses</b><small style="margin-top:4px">Meia parcela</small><b style="color:var(--gold)">'+fmtBRL(meia(p.months))+'</b></button>').join('')+'</div>'+
        '<div class="sim-value"><small>Sua meia parcela estimada</small><b>'+fmtBRL(meia(plans[sel].months))+'</b><div style="font-size:.78rem;color:rgba(255,255,255,.7);margin-top:6px">Crédito de '+fmtBRL(raw)+' · '+plans[sel].months+' meses</div></div>'+
        '<p class="sim-note">*Valores aproximados para fins de simulação. O valor exato pode variar de acordo com a administradora, grupo e condições vigentes.</p>'+
        '<a class="btn btn-whats" style="width:100%" target="_blank" rel="noopener" href="'+WHATS+'?text='+encodeURIComponent('Olá! Simulei no site: crédito de '+fmtBRL(raw)+' ('+(type==='imovel'?'imobiliário':'auto')+'), meia parcela de '+fmtBRL(meia(plans[sel].months))+' em '+plans[sel].months+' meses. Quero uma proposta personalizada!')+'">Receber proposta personalizada</a>';
      result.querySelectorAll('.sim-plan').forEach(btn=>btn.addEventListener('click',()=>{sel=+btn.dataset.i;render()}));
    }
    render();
    result.classList.add('show');
  });
}
document.querySelectorAll('#heroSim, #mainSim').forEach(setupSim);


}catch(e){/* seção ausente nesta página */}
/* ================= PRODUTOS ================= */
try{
const prodGrid = document.getElementById('prodGrid');
/* Cenas animadas da marca (uma coerente por categoria) — substituem os vídeos */
const SVGW='<svg class="ag-scene" viewBox="0 0 320 175" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#EFEAD9" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">';
const SCENES={
  'Imóvel':SVGW+'<g class="float"><path d="M95 96 H205 V150 H95 Z"/><path d="M84 101 L150 52 L216 101"/><rect x="116" y="117" width="22" height="33"/><rect x="158" y="112" width="28" height="24"/><path d="M172 112 V136 M158 124 H186" stroke="#E8CC8B" stroke-width="1.7"/></g><circle class="pulse" cx="248" cy="46" r="12" stroke="#E8CC8B"/></svg>',
  'Terreno':SVGW+'<path d="M36 142 H284"/><g class="grow"><path d="M168 142 V92"/><path d="M168 116 C146 112 140 96 146 84 C160 90 166 104 168 116"/><path d="M168 106 C190 101 196 86 191 75 C178 82 170 95 168 106"/></g><path d="M64 142 V108 L96 114 L64 120" stroke="#E8CC8B" stroke-width="1.8"/><path d="M250 142 V112" stroke="#E8CC8B" stroke-width="1.8"/><path d="M36 152 H284" stroke-dasharray="4 9" opacity=".45"/></svg>',
  'Placa Solar':SVGW+'<g class="ray" stroke="#E8CC8B"><circle cx="238" cy="50" r="13"/><path d="M238 27 V19 M238 81 V73 M215 50 H207 M269 50 H261 M221 33 l-6 -6 M255 67 l6 6 M255 33 l6 -6 M221 67 l-6 6"/></g><g class="float"><path d="M78 150 L98 96 L208 96 L193 150 Z"/><path d="M91 123 H200 M122 96 L108 150 M152 96 L141 150 M182 96 L172 150" stroke-width="1.6"/></g><path d="M136 150 V164 M118 164 H156"/></svg>',
  'Investimentos via Consórcio':SVGW+'<path d="M52 150 H272" opacity=".6"/><rect class="grow" x="78" y="118" width="22" height="32"/><rect class="grow" x="116" y="104" width="22" height="46" style="animation-delay:.2s"/><rect class="grow" x="154" y="86" width="22" height="64" style="animation-delay:.4s"/><rect class="grow" x="192" y="64" width="22" height="86" style="animation-delay:.6s"/><path class="draw" d="M66 132 L116 114 L160 94 L214 60" stroke="#E8CC8B" stroke-width="3"/><path d="M214 60 l-13 3 M214 60 l-3 -13" stroke="#E8CC8B"/><g class="float"><circle cx="248" cy="52" r="13" stroke="#E8CC8B"/><path d="M248 46 V58 M244 50 h8" stroke="#E8CC8B" stroke-width="1.7"/></g></svg>',
  'Carro':SVGW+'<g><path d="M62 122 L86 96 H178 L206 122 H222 a9 9 0 0 1 9 9 v9 H53 v-9 a9 9 0 0 1 9 -9 Z"/><path d="M96 99 H146 V120 H80 Z" stroke-width="1.7"/><path d="M154 99 H172 L194 120 H154 Z" stroke-width="1.7"/></g><circle cx="104" cy="142" r="15"/><g class="spin"><path d="M104 129 V155 M91 142 H117 M95 133 l18 18 M113 133 l-18 18"/></g><circle cx="192" cy="142" r="15"/><g class="spin"><path d="M192 129 V155 M179 142 H205 M183 133 l18 18 M201 133 l-18 18"/></g><path class="road" d="M30 167 H290" stroke="#E8CC8B"/></svg>',
  'Moto':SVGW+'<circle cx="96" cy="136" r="20"/><g class="spin"><path d="M96 116 V156 M76 136 H116 M82 122 l28 28 M110 122 l-28 28"/></g><circle cx="216" cy="136" r="20"/><g class="spin"><path d="M216 116 V156 M196 136 H236 M202 122 l28 28 M230 122 l-28 28"/></g><path d="M96 136 L140 136 L152 108 H176 M152 108 L172 136 L216 136"/><path d="M168 106 H190" stroke="#E8CC8B" stroke-width="2.4"/><path d="M140 136 L150 120 L134 120" stroke-width="2"/><path class="road" d="M30 167 H290" stroke="#E8CC8B"/><g class="pulse" stroke="#E8CC8B" stroke-width="2"><path d="M250 96 H286 M256 110 H286 M262 124 H286"/></g></svg>',
  'Caminhão e Pesados':SVGW+'<g><path d="M52 72 H182 V134 H52 Z"/><path d="M182 96 H212 L232 116 V134 H182 Z"/><path d="M212 101 H226 L235 114 H212 Z" stroke-width="1.7"/></g><circle cx="92" cy="146" r="14"/><g class="spin"><path d="M92 134 V158 M80 146 H104 M84 138 l16 16 M100 138 l-16 16"/></g><circle cx="138" cy="146" r="14"/><g class="spin"><path d="M138 134 V158 M126 146 H150 M130 138 l16 16 M146 138 l-16 16"/></g><circle cx="210" cy="146" r="14"/><g class="spin"><path d="M210 134 V158 M198 146 H222 M202 138 l16 16 M218 138 l-16 16"/></g><path class="road" d="M28 168 H292" stroke="#E8CC8B"/></svg>',
  'Embarcações Náuticas':SVGW+'<g class="bob"><path d="M116 120 H204 L188 146 H132 Z"/><path d="M160 120 V52"/><path d="M158 58 L158 113 L118 113 Z"/><path d="M166 70 L166 113 L198 113 Z" stroke="#E8CC8B"/></g><g stroke="#E8CC8B"><path class="wave" d="M10 150 q16 -9 32 0 t32 0 t32 0 t32 0 t32 0 t32 0 t32 0 t32 0 t32 0 t32 0 t32 0"/><path class="wave" d="M26 162 q16 -9 32 0 t32 0 t32 0 t32 0 t32 0 t32 0 t32 0 t32 0 t32 0 t32 0" style="animation-delay:.5s" opacity=".55"/></g></svg>'
};
function sceneFor(p){ return SCENES[p.t] || (SVGW+'<g class="float"><svg class="icon" x="130" y="60" width="60" height="60" viewBox="0 0 24 24">'+p.ic+'</svg></g></svg>'); }
function renderProds(type){
  prodGrid.innerHTML = PRODUCTS[type].map(p=>
    '<article class="prod-card">'+
      '<div class="prod-media">'+
        sceneFor(p)+
        '<div class="prod-title"><span class="pic"><svg class="icon" viewBox="0 0 24 24">'+p.ic+'</svg></span><h3>'+p.t+'</h3></div>'+
      '</div>'+
      '<div class="prod-body"><p>'+p.d+'</p><ul>'+p.hl.map(h=>'<li><svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg> '+h+'</li>').join('')+'</ul></div>'+
    '</article>').join('');
}
renderProds('imovel');
document.querySelectorAll('[data-ptab]').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('[data-ptab]').forEach(x=>x.classList.remove('on'));
  b.classList.add('on');
  renderProds(b.dataset.ptab);
}));


}catch(e){/* seção ausente nesta página */}
/* ================= CARTAS ================= */
try{
const __cg=document.getElementById('cartasGrid');
const __lim=__cg&&__cg.dataset.limit?+__cg.dataset.limit:CARTAS.length;
if(__cg)__cg.innerHTML = CARTAS.slice(0,__lim).map(c=>{
  const pct = Math.min(100, c[2]/200*100).toFixed(1);
  return '<article class="carta">'+
    '<small>Crédito</small><div class="credito">'+c[0]+'</div><div class="div"></div>'+
    '<div class="kv"><span>Parcela</span><b>'+c[1]+'</b></div>'+
    '<div class="kv"><span>Parcelas pagas</span><b class="gold">'+c[2]+'</b></div>'+
    '<div class="bar"><i style="width:'+Math.max(2,pct)+'%"></i></div>'+
    '<a target="_blank" rel="noopener" href="'+WHATS+'?text='+encodeURIComponent('Tenho interesse na carta contemplada de '+c[0]+' (parcela '+c[1]+').')+'">Tenho interesse →</a>'+
  '</article>';
}).join('');


}catch(e){/* seção ausente nesta página */}
/* ================= ETAPAS ================= */
try{
const stepList = document.getElementById('stepList');
const stepPanel = document.getElementById('stepPanel');
let curStep = 0;
function renderSteps(){
  stepList.innerHTML = STEPS.map((s,i)=>
    '<button class="step-btn'+(i===curStep?' on':'')+'" data-i="'+i+'">'+
      '<span class="stic"><svg class="icon" viewBox="0 0 24 24">'+s.ic+'</svg></span>'+
      '<span><small>Etapa '+s.n+'</small><b>'+s.t+'</b></span>'+
    '</button>').join('');
  const s = STEPS[curStep];
  stepPanel.innerHTML =
    '<div class="crumb"><i>'+s.n+'</i><span>'+s.s+'</span></div>'+
    '<h3>'+s.t+'</h3><p>'+s.d+'</p>'+
    '<div class="tip"><svg class="icon" viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-8 8.5-4.5-1-8-3.5-8-8.5V6l8-3 8 3Z"/><path d="m9 12 2 2 4-4"/></svg><div><b>Dica Agion</b><span>'+s.tip+'</span></div></div>'+
    '<span class="hl"><svg class="icon" viewBox="0 0 24 24"><path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/></svg> '+s.hl+'</span>';
  stepList.querySelectorAll('.step-btn').forEach(b=>b.addEventListener('click',()=>{curStep=+b.dataset.i;renderSteps()}));
}
renderSteps();


}catch(e){/* seção ausente nesta página */}
/* ================= DEPOIMENTOS ================= */
try{
let curDepo = 0, depoTimer;
const depoDots = document.getElementById('depoDots');
depoDots.innerHTML = DEPOS.map((_,i)=>'<button data-i="'+i+'" aria-label="Depoimento '+(i+1)+'"></button>').join('');
function showDepo(i){
  curDepo = (i+DEPOS.length)%DEPOS.length;
  document.getElementById('depoText').textContent = '“'+DEPOS[curDepo].t+'”';
  document.getElementById('depoName').textContent = DEPOS[curDepo].n;
  document.getElementById('depoLoc').textContent = DEPOS[curDepo].l;
  depoDots.querySelectorAll('button').forEach((d,j)=>d.classList.toggle('on',j===curDepo));
}
function autoDepo(){ clearInterval(depoTimer); depoTimer = setInterval(()=>showDepo(curDepo+1), 6500); }
document.getElementById('depoPrev').addEventListener('click',()=>{showDepo(curDepo-1);autoDepo()});
document.getElementById('depoNext').addEventListener('click',()=>{showDepo(curDepo+1);autoDepo()});
depoDots.addEventListener('click',e=>{const b=e.target.closest('button');if(b){showDepo(+b.dataset.i);autoDepo()}});
showDepo(0); autoDepo();


}catch(e){/* seção ausente nesta página */}
/* ================= FAQ ================= */
try{
document.getElementById('faqList').innerHTML = FAQS.map((f,i)=>
  '<div class="faq-item"><button class="faq-q" aria-expanded="false">'+f[0]+
  '<svg class="icon" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button>'+
  '<div class="faq-a"><p>'+f[1]+'</p></div></div>').join('');
document.querySelectorAll('.faq-item').forEach(item=>{
  const q = item.querySelector('.faq-q'), a = item.querySelector('.faq-a');
  q.addEventListener('click',()=>{
    const open = item.classList.toggle('open');
    q.setAttribute('aria-expanded',open);
    a.style.maxHeight = open ? a.scrollHeight+'px' : 0;
  });
});


}catch(e){/* seção ausente nesta página */}
/* ================= UI GERAL ================= */
try{
// menu mobile
const burger = document.getElementById('burger'), navMobile = document.getElementById('navMobile');
if(burger && navMobile){
  burger.addEventListener('click',()=>navMobile.classList.toggle('open'));
  navMobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>navMobile.classList.remove('open')));
}
// marquee: duplicar logos para loop infinito
const track = document.getElementById('marqueeTrack');
if(track) track.innerHTML += track.innerHTML;
// reveal on scroll
const io = new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
setTimeout(()=>document.querySelectorAll('.reveal:not(.in)').forEach(el=>el.classList.add('in')),2000);
// ano automático
const yearEl = document.getElementById('year');
if(yearEl) yearEl.textContent = new Date().getFullYear();
// tooltip whatsapp
const wtc = document.getElementById('whatsTipClose');
if(wtc) wtc.addEventListener('click',()=>document.getElementById('whatsTip').style.display='none');
setTimeout(()=>{const t=document.getElementById('whatsTip');if(t)t.style.display='none'},12000);

}catch(e){/* seção ausente nesta página */}

/* ================= ABA ATIVA ================= */
try{
const pg = document.body.dataset.page;
document.querySelectorAll('[data-nav]').forEach(a=>{ if(a.dataset.nav===pg) a.classList.add('active'); });
}catch(e){}

/* ================= PREMIUM: DINÂMICAS ================= */
try{
// barra de progresso de leitura
const pb = document.getElementById('progressBar');
if(pb){
  const upd = ()=>{const h=document.documentElement;const max=h.scrollHeight-h.clientHeight;pb.style.width=(max>0?(h.scrollTop/max*100):0)+'%';};
  document.addEventListener('scroll',upd,{passive:true}); upd();
}
// navbar ganha sombra ao rolar
const navEl = document.querySelector('.nav');
if(navEl){
  const onScroll = ()=>navEl.classList.toggle('scrolled', window.scrollY>10);
  document.addEventListener('scroll',onScroll,{passive:true}); onScroll();
}
// cascata: atraso progressivo nos elementos .reveal irmãos
document.querySelectorAll('.reveal').forEach((el,i)=>{
  const sibs=[...el.parentElement.children].filter(c=>c.classList&&c.classList.contains('reveal'));
  el.style.setProperty('--d',(sibs.indexOf(el)%6)*0.12+'s');
});
// contadores animados nos números (.stat b) — preserva sufixos (%, °)
const animateCount = el=>{
  const txt = el.textContent.trim();
  const m = txt.match(/^(\d+)(.*)$/); if(!m) return;
  const target = +m[1], suffix = m[2]; const t0 = performance.now(), dur = 1400;
  const tick = now=>{
    const p = Math.min(1,(now-t0)/dur), ease = 1-Math.pow(1-p,3);
    el.textContent = Math.round(target*ease)+suffix;
    if(p<1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const cio = new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){ animateCount(e.target); cio.unobserve(e.target); }
}),{threshold:.6});
document.querySelectorAll('.stat b').forEach(el=>cio.observe(el));
}catch(e){}

/* ================= TILT 3D nos cartões ================= */
try{
if(matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches){
  document.querySelectorAll('.pilar, .strat-card, .prod-card, .carta, .how-card, .value-card').forEach(card=>{
    card.style.transformStyle='preserve-3d';
    card.addEventListener('pointermove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`translateY(-8px) rotateX(${(-y*5).toFixed(2)}deg) rotateY(${(x*6).toFixed(2)}deg)`;
    });
    card.addEventListener('pointerleave',()=>{card.style.transform='';});
  });
}
}catch(e){}

/* ================= MOBILE: carrossel premium + expandir (robusto) ================= */
try{
const isMobile = ()=>matchMedia('(max-width:680px)').matches;
const CARROSSEIS = ['.pilares','.values4','.how-grid','.strat-grid','.prod-grid','.stats','.dif-grid','.flow','.cartas-scroll'];
const CARTOES = ['.pilar','.strat-card','.how-card','.value-card','.flow-step','.dif-card','.prod-card'];
// elementos que SEMPRE ficam visíveis (cabeçalho/título do cartão)
const MANTER = 'h3,h4,.pilar-head,.dif-head,.strat-top,.prod-media,.how-num,.flow-num,.vic,.how-ico';

function montarCarrossel(el){
  if(el.dataset.mcar){ if(el.__rebuild) el.__rebuild(); return; }
  el.dataset.mcar='1';
  el.classList.add('car-track');
  const wrap=document.createElement('div');
  wrap.className='car-wrap';
  el.parentElement.insertBefore(wrap, el);
  wrap.appendChild(el);
  const itens=()=>[...el.children].filter(c=>!c.classList.contains('flow-arrow'));
  const passo=()=>{const w=itens()[0];return (w?w.getBoundingClientRect().width:el.clientWidth*0.8)+14;};
  const mk=(dir,label,path)=>{const b=document.createElement('button');b.type='button';b.className='car-btn '+(dir<0?'prev':'next');b.setAttribute('aria-label',label);
    b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="'+path+'"/></svg>';
    b.addEventListener('click',()=>el.scrollBy({left:passo()*dir,behavior:'smooth'}));
    wrap.appendChild(b);return b;};
  const prev=mk(-1,'Anterior','m15 18-6-6 6-6');
  const next=mk(1,'Próximo','m9 18 6-6-6-6');
  const dots=document.createElement('div');dots.className='car-dots';wrap.appendChild(dots);
  function rebuild(){
    const it=itens();
    dots.innerHTML=it.map(()=>'<i></i>').join('');
    [...dots.children].forEach((d,i)=>d.addEventListener('click',()=>it[i].scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'})));
    atualizar();
  }
  function atualizar(){
    const max=el.scrollWidth-el.clientWidth;
    prev.disabled=el.scrollLeft<=6;
    next.disabled=el.scrollLeft>=max-6;
    const it=itens();if(!it.length)return;
    const idx=Math.min(it.length-1,Math.round(el.scrollLeft/(max||1)*(it.length-1)));
    [...dots.children].forEach((d,i)=>d.classList.toggle('on',i===idx));
  }
  el.__rebuild=rebuild;
  el.addEventListener('scroll',atualizar,{passive:true});
  rebuild();
}

function montarExpandir(card){
  if(card.dataset.mexp) return;
  // onde aplicar: corpo do produto, ou o próprio cartão
  const host = card.querySelector('.prod-body') || card;
  // esconde todos os filhos diretos do host, menos os "manter"
  let escondeu = 0;
  [...host.children].forEach(ch=>{
    if(ch.classList.contains('m-expand')) return;
    if(ch.matches(MANTER) || ch.querySelector(MANTER)) return; // mantém cabeçalho/título
    ch.classList.add('m-detail');
    escondeu++;
  });
  if(!escondeu) return;        // nada para expandir
  card.dataset.mexp='1';
  const btn=document.createElement('button');
  btn.type='button';btn.className='m-expand';
  btn.innerHTML='<span>Expandir</span> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
  host.appendChild(btn);
}

window.__mobileV2=function(){
  if(!isMobile()) return;
  CARROSSEIS.forEach(s=>document.querySelectorAll(s).forEach(montarCarrossel));
  CARTOES.forEach(s=>document.querySelectorAll(s).forEach(montarExpandir));
};
__mobileV2();

// um clique no Expandir abre/fecha TODOS os cartões do mesmo carrossel
document.addEventListener('click',function(e){
  const btn = e.target.closest('.m-expand');
  if(!btn) return;
  e.preventDefault(); e.stopPropagation();
  const card = btn.closest('[data-mexp]');
  if(!card) return;
  const trilho = card.closest('.car-track');
  const grupo = trilho ? [...trilho.querySelectorAll('[data-mexp]')] : [card];
  const abrir = !card.classList.contains('m-open');
  grupo.forEach(c=>{
    c.classList.toggle('m-open', abrir);
    const sp=c.querySelector('.m-expand span');
    if(sp) sp.textContent = abrir ? 'Recolher' : 'Expandir';
  });
}, true);

document.addEventListener('click',e=>{ if(e.target.closest('[data-ptab]')) setTimeout(__mobileV2,90); });
let __rT;window.addEventListener('resize',()=>{clearTimeout(__rT);__rT=setTimeout(()=>{if(isMobile())__mobileV2()},200);});
}catch(e){}
