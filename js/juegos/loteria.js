/* Lógica de Lotería */
const G={};
G.loteria=(st,end)=>{const D=[['🐓','El Gallo'],['😈','El Diablito'],['🌵','El Nopal'],['🦜','El Perico'],['🐍','La Culebra'],['🌹','La Rosa'],['💀','La Calavera'],['🌙','La Luna'],['☀️','El Sol'],['🌽','El Maíz'],['🎸','La Guitarra'],['🐟','El Pescado'],['🍉','La Sandía'],['🌧️','La Lluvia'],['⭐','La Estrella'],['🦅','El Águila'],['🏹','El Arco'],['🍷','La Botella'],['🦂','El Alacrán'],['👑','La Corona']];
 const sh=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
 const deck=sh(D),board=sh(D).slice(0,16),seen=new Set(),mk=new Set();
 const bots=['Ana','Beto','Caro'].map(n=>({n:n,b:new Set(sh(D).slice(0,16).map(c=>c[1])),m:new Set()}));let i=-1,over=false;
 st.style.background='#f6e7b4';
 st.innerHTML='<div id="cur" style="text-align:center;padding:8px;font-weight:bold;min-height:70px"></div><div class="lot" id="lt"></div><div id="rv" style="text-align:center;font-size:.8rem;padding:4px 4px 10px"></div>';
 const rv=()=>{$('#rv').textContent='Tú '+mk.size+'/16 · '+bots.map(b=>b.n+' '+b.m.size+'/16').join(' · ')};
 const win=w=>{if(over)return;over=true;end(w==='Tú'?15:3,w==='Tú'?'¡LOTERÍA! Completaste tu tabla primero':w+' completó su tabla primero',w==='Tú')};
 const draw=()=>{if(over||++i>=deck.length)return;const c=deck[i][1];seen.add(c);$('#cur').innerHTML=`<span style="font-size:2.2rem">${deck[i][0]}</span><br>${c}`;
  bots.forEach(b=>{if(b.b.has(c))setTimeout(()=>{if(over)return;b.m.add(c);rv();if(b.m.size===16)win(b.n)},(700+Math.random()*2800)*[1.6,1,.6][DIF])})};
 board.forEach((c,k)=>{const b=document.createElement('button');b.innerHTML=`<b>${c[0]}</b>${c[1]}`;b.onclick=()=>{if(over||mk.has(k))return;if(!seen.has(c[1]))return toast('Esa carta aún no sale');mk.add(k);b.classList.add('m');rv();if(mk.size===16)win('Tú')};$('#lt').appendChild(b)});
 rv();draw();later(draw,[3500,2500,1800][DIF])};

initGame(G.loteria);
