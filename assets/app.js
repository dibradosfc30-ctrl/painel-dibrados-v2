/* ===== CONFIG ===== */
const SUPABASE_URL="https://lzzqstnaajaguopejwxx.supabase.co";
const SUPABASE_KEY="sb_publishable_ylNOucSvnePS7S15bpi_0A_DTR4Cy1R";
const GUILD_ID="1172009483120152588";
const EQUIPE=["1172008779202703465"]; // IDs autorizados
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

let DADOS={online:0,membros:0,visitas:0,boosts:46};

/* ===== AUTH ===== */
async function entrar(){await sb.auth.signInWithOAuth({provider:'discord',options:{redirectTo:window.location.href.split('#')[0]}});}
async function sair(){await sb.auth.signOut();location.reload();}
function tela(id){['login','negado'].forEach(x=>document.getElementById(x).style.display='none');document.getElementById('app').style.display='none';if(id==='app'){document.getElementById('app').style.display='block';}else{document.getElementById(id).style.display='flex';}}

async function checar(){
  const {data:{session}}=await sb.auth.getSession();
  if(!session){tela('login');return;}
  const u=session.user;
  const did=u.user_metadata?.provider_id||u.user_metadata?.sub||"";
  if(!EQUIPE.includes(did)){tela('negado');return;}
  USUARIO_ID=did;
  const av=u.user_metadata?.avatar_url;if(av)document.getElementById('tbAvatar').src=av;
  tela('app');
  await puxarDados();
  irPara('inicio');
}

async function puxarDados(){
  try{const r=await fetch(`https://discord.com/api/guilds/${GUILD_ID}/widget.json`);const d=await r.json();DADOS.online=d.presence_count??0;}catch(e){}
  try{const {data:s}=await sb.from('stats').select('*').eq('id',1).single();if(s){DADOS.membros=s.membros??0;DADOS.visitas=s.visitas??0;DADOS.boosts=s.boosts??46;}}catch(e){}
}

/* ===== MENU ===== */
function toggleMenu(){document.getElementById('sidebar').classList.toggle('aberto');document.getElementById('overlay').classList.toggle('aberto');}
function fecharMenu(){document.getElementById('sidebar').classList.remove('aberto');document.getElementById('overlay').classList.remove('aberto');}

/* ===== count-up ===== */
function contar(el,fim){fim=Number(fim)||0;let ini=0;const dur=900,t0=performance.now();function step(t){let p=Math.min((t-t0)/dur,1);p=1-Math.pow(1-p,3);el.textContent=Math.round(ini+(fim-ini)*p).toLocaleString('pt-BR');if(p<1)requestAnimationFrame(step);}requestAnimationFrame(step);}
function animarNums(){document.querySelectorAll('[data-num]').forEach(el=>contar(el,el.dataset.num));}

/* ===== helpers ===== */
function card(cor,ico,num,lbl){return `<div class="card c-${cor}"><div class="glow"></div><div class="brilho"></div><span class="ico">${ico}</span><div class="num" data-num="${num}">0</div><div class="lbl">${lbl}</div></div>`;}
function vazio(ic,titulo,txt){return `<div class="vazio"><div class="ic">${ic}</div><b>${titulo}</b><br><small>${txt}</small><br><span class="em">🔌 Conecta o Dibrados Bot pra preencher</span></div>`;}
function head(t,verde,sub){return `<div class="pag-titulo">${t} <span class="verde">${verde}</span></div><div class="pag-sub"><span class="pulse"></span>${sub}</div>`;}

/* ===== PÁGINAS ===== */
const PAGS={
  inicio(){return head('PAINEL','DIBRADOS','Visão geral da torcida')+
    `<div class="cards">
      ${card('verde','🟢',DADOS.online,'Online agora')}
      ${card('roxo','👥',DADOS.membros,'Membros')}
      ${card('dourado','👁️',DADOS.visitas,'Visitas no site')}
      ${card('rosa','🚀',DADOS.boosts,'Boosts')}
    </div>
    <div class="painel-box"><h3>👋 Bem-vindo ao painel!</h3><div class="bx-sub">Use o menu ☰ pra navegar entre as páginas. As estatísticas ao vivo já funcionam. As páginas de tickets, comandos, moderação e membros ficam prontas assim que ligarmos o Dibrados Bot.</div></div>`;},

  stats(){return head('ESTATÍSTICAS','DO SERVIDOR','Dados ao vivo')+
    `<div class="cards">
      ${card('verde','🟢',DADOS.online,'Online agora')}
      ${card('roxo','👥',DADOS.membros,'Membros totais')}
      ${card('rosa','🚀',DADOS.boosts,'Boosts')}
      ${card('azul','💬',0,'Msgs hoje')}
    </div>
    <div class="painel-box"><h3>📡 Status em tempo real</h3><div class="bx-sub">O "online agora" vem direto do Discord. Membros totais e mensagens vêm do bot.</div></div>`;},

  visitas(){return head('VISITAS','DO SITE','Contador do site de convite')+
    `<div class="cards">
      ${card('dourado','👁️',DADOS.visitas,'Visitas totais')}
      ${card('roxo','📅',0,'Hoje')}
      ${card('verde','📈',0,'Esta semana')}
      ${card('rosa','🔗',0,'Cliques Discord')}
    </div>
    <div class="painel-box"><h3>👁️ Visitas no site de convite</h3><div class="bx-sub">Cada vez que alguém abre o site de convite, conta +1 aqui. "Hoje" e "semana" são registrados conforme o tempo passa.</div></div>`;},

  membros(){return head('MEMBROS','DA TORCIDA','Lista e novos membros')+
    `<div class="painel-box"><h3>👥 Últimos membros</h3><div class="bx-sub">Quem entrou recentemente no servidor.</div>${vazio('👥','Sem dados ainda','A lista de membros aparece quando o bot estiver ligado.')}</div>`;},

  tickets(){return head('TICKETS','DE SUPORTE','Atendimentos da equipe')+
    `<div class="cards">
      ${card('verde','🟢','0','Abertos')}
      ${card('rosa','🔴','0','Fechados')}
      ${card('roxo','📊','0','Total')}
      ${card('dourado','⏱️','0','Hoje')}
    </div>
    <div class="painel-box"><h3>🎟️ Registro de tickets</h3><div class="bx-sub">Quem abriu, quem atendeu e quando.</div>
      <div class="tk-filtros">
        <input id="tk-busca" class="tk-input" type="text" placeholder="🔍 Buscar por nome ou nº do ticket..." oninput="filtrarTickets()">
        <input id="tk-data" class="tk-input tk-input-data" type="date" onchange="filtrarTickets()">
        <button class="tk-limpar" onclick="limparFiltros()">Limpar</button>
      </div>
      <div id="lista-tickets">${vazio('🎟️','Carregando tickets...','Buscando os dados no Supabase.')}</div>
    </div>`;},

  comandos(){return head('COMANDOS','DO BOT','Uso dos comandos')+
    `<div class="painel-box"><h3>🤖 Comandos mais usados</h3><div class="bx-sub">Lista de comandos e quantas vezes foram usados.</div>${vazio('🤖','Sem dados de comandos','Aparece quando o bot registrar cada uso de comando.')}</div>`;},

  grafico(){return head('CRESCIMENTO','DE MEMBROS','Histórico da torcida')+
    `<div class="painel-box"><h3>📈 Evolução de membros</h3><div class="bx-sub">Histórico dos últimos dias</div><canvas id="grafico" height="160"></canvas></div>`;},

  ranking(){return head('RANKING','DE NÍVEIS','Top da torcida (Loritta)')+
    `<div class="painel-box"><h3>🏆 Top membros por nível</h3><div class="bx-sub">Ranking do sistema de níveis.</div>${vazio('🏆','Ranking em breve','A Loritta guarda o ranking. Dá pra puxar via bot ou mostrar o link do leaderboard.')}</div>`;},

  anuncios(){return head('ANÚNCIOS','& SORTEIOS','Últimas novidades')+
    `<div class="painel-box"><h3>📢 Últimos anúncios</h3><div class="bx-sub">Anúncios e sorteios postados pelo bot.</div>${vazio('📢','Nada por aqui ainda','Aparecem quando o bot registrar os anúncios e sorteios.')}</div>`;},

  mod(){return head('MODERAÇÃO','& LOGS','Ações da equipe')+
    `<div class="cards">
      ${card('rosa','🔨',0,'Bans')}
      ${card('dourado','🔇',0,'Mutes')}
      ${card('azul','👢',0,'Kicks')}
      ${card('roxo','🧹',0,'Limpezas')}
    </div>
    <div class="painel-box"><h3>🛡️ Registro de moderação</h3><div class="bx-sub">Bans, mutes, kicks e quem aplicou.</div>${vazio('🛡️','Sem logs ainda','Os logs de moderação aparecem quando o bot enviar os dados.')}</div>`;},
};

/* ===== TICKETS (dados reais do Supabase) ===== */
const ADMINS=["1172008779202703465"]; // IDs que podem ver as conversas
let USUARIO_ID=null;
let TICKETS_CACHE=[];
function escapar(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function formatarData(iso){if(!iso)return '';try{const d=new Date(iso);return d.toLocaleDateString('pt-BR')+' às '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});}catch(e){return '';}}
function cssTickets(){
  if(document.getElementById('css-tickets'))return;
  const st=document.createElement('style');st.id='css-tickets';
  st.textContent=`
  .tk-filtros{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 4px}
  .tk-input{flex:1;min-width:150px;background:rgba(30,18,55,.6);border:1px solid rgba(177,92,255,.3);border-radius:10px;padding:10px 12px;color:#e9dcff;font-size:14px;outline:none}
  .tk-input:focus{border-color:rgba(177,92,255,.7);box-shadow:0 0 0 2px rgba(177,92,255,.2)}
  .tk-input-data{flex:0 0 auto;min-width:130px;color-scheme:dark}
  .tk-input::placeholder{color:#8a75b5}
  .tk-limpar{background:rgba(177,92,255,.18);border:1px solid rgba(177,92,255,.35);color:#d8c7ff;border-radius:10px;padding:10px 16px;font-size:14px;font-weight:700;cursor:pointer}
  .tk-limpar:active{background:rgba(177,92,255,.32)}
  .tk-lista{display:flex;flex-direction:column;gap:12px;margin-top:10px}
  .tk-item{background:linear-gradient(145deg,rgba(58,37,105,.45),rgba(30,18,55,.55));border:1px solid rgba(177,92,255,.25);border-radius:14px;padding:14px 16px;box-shadow:0 4px 18px rgba(0,0,0,.28)}
  .tk-clicavel{cursor:pointer;transition:border-color .15s,transform .1s}
  .tk-clicavel:active{transform:scale(.99)}
  .tk-clicavel:hover{border-color:rgba(177,92,255,.6)}
  .tk-topo{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px}
  .tk-tipo{font-weight:700;color:#e9dcff;font-size:15px}
  .tk-info{color:#a68fcc;font-size:13px;line-height:1.5}
  .tk-info b{color:#d8c7ff}
  .tk-ver{margin-top:8px;font-size:12px;font-weight:700;color:#b15cff}
  .tk-badge{font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px;white-space:nowrap}
  .tk-aberto{background:rgba(57,255,20,.14);color:#7dff5c;border:1px solid rgba(57,255,20,.35)}
  .tk-fechado{background:rgba(255,90,140,.14);color:#ff7da6;border:1px solid rgba(255,90,140,.35)}
  .modal-fundo{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(3px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px}
  .modal-cx{background:linear-gradient(160deg,#241640,#160c2b);border:1px solid rgba(177,92,255,.4);border-radius:18px;width:100%;max-width:560px;max-height:82vh;display:flex;flex-direction:column;box-shadow:0 12px 50px rgba(0,0,0,.6)}
  .modal-topo{display:flex;justify-content:space-between;align-items:center;padding:16px 18px;border-bottom:1px solid rgba(177,92,255,.2)}
  .modal-titulo{font-weight:800;color:#e9dcff;font-size:17px}
  .modal-x{background:none;border:none;color:#b0a0d0;font-size:22px;cursor:pointer;line-height:1}
  .modal-corpo{padding:16px 18px;overflow-y:auto}
  .tk-conversa{display:flex;flex-direction:column;gap:10px}
  .tk-msg{background:rgba(255,255,255,.04);border-radius:10px;padding:8px 12px}
  .tk-msg-topo{display:flex;justify-content:space-between;gap:8px;margin-bottom:2px}
  .tk-msg-topo b{color:#c9b3ff;font-size:13px}
  .tk-msg-topo span{color:#7c6aa0;font-size:11px}
  .tk-msg-txt{color:#e3d8ff;font-size:14px;line-height:1.45;word-break:break-word}
  .tk-restrito{text-align:center;color:#ff9ebc;padding:10px 0;font-weight:700}`;
  document.head.appendChild(st);
}
function fecharModal(){const m=document.getElementById('modal-tk');if(m)m.remove();}
function mostrarModal(titulo,corpoHtml){
  fecharModal();
  const d=document.createElement('div');d.id='modal-tk';d.className='modal-fundo';
  d.onclick=e=>{if(e.target===d)fecharModal();};
  d.innerHTML=`<div class="modal-cx"><div class="modal-topo"><span class="modal-titulo">${titulo}</span><button class="modal-x" onclick="fecharModal()">✕</button></div><div class="modal-corpo" id="modal-corpo">${corpoHtml}</div></div>`;
  document.body.appendChild(d);
}
async function abrirConversa(id){
  if(!ADMINS.includes(USUARIO_ID)){
    mostrarModal('🔒 Acesso restrito','<div class="tk-restrito">Você não tem permissão para ver as conversas dos tickets.</div>');
    return;
  }
  mostrarModal('🎟️ Ticket #'+id,'<div class="tk-info">Carregando conversa...</div>');
  let texto=null;
  try{const {data}=await sb.from('tickets').select('transcricao').eq('ticket_id',id).single();if(data)texto=data.transcricao;}catch(e){}
  const corpo=document.getElementById('modal-corpo');
  if(!corpo)return;
  let msgs=[];try{if(texto)msgs=JSON.parse(texto);}catch(e){}
  if(!msgs.length){corpo.innerHTML='<div class="tk-info">Nenhuma conversa registrada para este ticket.</div>';return;}
  corpo.innerHTML='<div class="tk-conversa">'+msgs.map(m=>
    `<div class="tk-msg"><div class="tk-msg-topo"><b>${escapar(m.autor)}</b><span>${escapar(m.hora)}</span></div><div class="tk-msg-txt">${escapar(m.conteudo)}</div></div>`
  ).join('')+'</div>';
}
async function carregarTickets(){
  cssTickets();
  TICKETS_CACHE=[];
  try{const {data}=await sb.from('tickets').select('ticket_id,tipo,autor_id,autor_nome,status,reivindicado_por,atendente_nome,fechado_por,criado_em,fechado_em').order('criado_em',{ascending:false}).limit(200);if(data)TICKETS_CACHE=data;}catch(e){}
  const abertos=TICKETS_CACHE.filter(t=>t.status==='aberto').length;
  const fechados=TICKETS_CACHE.filter(t=>t.status==='fechado').length;
  const total=TICKETS_CACHE.length;
  const hojeStr=new Date().toISOString().slice(0,10);
  const hoje=TICKETS_CACHE.filter(t=>String(t.criado_em||'').slice(0,10)===hojeStr).length;
  const nums=document.querySelectorAll('#conteudo .cards .num');
  if(nums.length>=4){contar(nums[0],abertos);contar(nums[1],fechados);contar(nums[2],total);contar(nums[3],hoje);}
  renderTickets(TICKETS_CACHE);
}
function renderTickets(lista){
  const box=document.getElementById('lista-tickets');
  if(!box)return;
  if(!lista.length){box.innerHTML=vazio('🎟️','Nenhum ticket encontrado','Assim que abrirem um ticket no Discord, ele aparece aqui. Tente limpar os filtros.');return;}
  const EMOJI={suporte:'🛠️',denuncia:'🚨',imprensa:'📰'};
  box.innerHTML=`<div class="tk-lista">`+lista.map(t=>{
    const emo=EMOJI[t.tipo]||'🎟️';
    const fechado=t.status==='fechado';
    const st=fechado
      ?'<span class="tk-badge tk-fechado">🔴 Fechado</span>'
      :'<span class="tk-badge tk-aberto">🟢 Aberto</span>';
    const atend=t.atendente_nome?`Atendido por <b>${escapar(t.atendente_nome)}</b>`:'Ainda não atendido';
    const clique=fechado?` class="tk-item tk-clicavel" onclick="abrirConversa(${escapar(t.ticket_id)})"`:' class="tk-item"';
    const ver=fechado?'<div class="tk-ver">👁️ Toque para ver a conversa</div>':'';
    return `<div${clique}>
      <div class="tk-topo"><span class="tk-tipo">${emo} Ticket #${escapar(t.ticket_id)} · ${escapar(t.tipo)}</span>${st}</div>
      <div class="tk-info">Aberto por <b>${escapar(t.autor_nome||'Desconhecido')}</b> · ${formatarData(t.criado_em)}</div>
      <div class="tk-info">${atend}</div>
      ${ver}
    </div>`;
  }).join('')+`</div>`;
}
function filtrarTickets(){
  const busca=(document.getElementById('tk-busca')?.value||'').toLowerCase().trim();
  const data=document.getElementById('tk-data')?.value||'';
  let lista=TICKETS_CACHE;
  if(data)lista=lista.filter(t=>String(t.criado_em||'').slice(0,10)===data);
  if(busca)lista=lista.filter(t=>{
    const alvo=`${t.autor_nome||''} ${t.atendente_nome||''} ${t.ticket_id||''} ${t.tipo||''}`.toLowerCase();
    return alvo.includes(busca);
  });
  renderTickets(lista);
}
function limparFiltros(){
  const b=document.getElementById('tk-busca');if(b)b.value='';
  const d=document.getElementById('tk-data');if(d)d.value='';
  renderTickets(TICKETS_CACHE);
}

let chart;
function irPara(pag){
  document.querySelectorAll('.menu-item').forEach(m=>m.classList.toggle('ativo',m.dataset.pag===pag));
  document.getElementById('conteudo').innerHTML=PAGS[pag]();
  animarNums();
  if(pag==='grafico')desenharGrafico();
  if(pag==='tickets')carregarTickets();
  fecharMenu();
  window.scrollTo(0,0);
}

async function desenharGrafico(){
  let labels=['Hoje'],vals=[DADOS.membros];
  try{const {data:h}=await sb.from('historico').select('*').order('dia',{ascending:true}).limit(30);if(h&&h.length){labels=h.map(x=>x.dia);vals=h.map(x=>x.membros);}}catch(e){}
  const ctx=document.getElementById('grafico');if(!ctx)return;if(chart)chart.destroy();
  const g=ctx.getContext('2d').createLinearGradient(0,0,0,190);
  g.addColorStop(0,'rgba(177,92,255,.55)');g.addColorStop(1,'rgba(177,92,255,0)');
  chart=new Chart(ctx,{type:'line',data:{labels,datasets:[{data:vals,borderColor:'#b15cff',backgroundColor:g,fill:true,tension:.35,pointRadius:4,pointBackgroundColor:'#39ff14',pointBorderColor:'#fff',pointBorderWidth:1,borderWidth:3}]},options:{animation:{duration:1200},plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#a68fcc',font:{size:10}},grid:{color:'#3a256933'}},y:{ticks:{color:'#a68fcc',font:{size:10}},grid:{color:'#3a256933'}}}}});
}

sb.auth.onAuthStateChange(()=>checar());
checar();

  
