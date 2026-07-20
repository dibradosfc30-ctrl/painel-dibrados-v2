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
      ${card('verde','🟢',0,'Abertos')}
      ${card('rosa','🔴',0,'Fechados')}
      ${card('roxo','📊',0,'Total')}
      ${card('dourado','⏱️',0,'Hoje')}
    </div>
    <div class="painel-box"><h3>🎟️ Registro de tickets</h3><div class="bx-sub">Quem abriu, quem atendeu e quando.</div>${vazio('🎟️','Sem tickets registrados','Os tickets aparecem quando o Dibrados Bot enviar os dados.')}</div>`;},

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

let chart;
function irPara(pag){
  document.querySelectorAll('.menu-item').forEach(m=>m.classList.toggle('ativo',m.dataset.pag===pag));
  document.getElementById('conteudo').innerHTML=PAGS[pag]();
  animarNums();
  if(pag==='grafico')desenharGrafico();
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
