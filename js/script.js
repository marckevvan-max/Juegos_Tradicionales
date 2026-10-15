const M=$('#main');
const GAMES=[{"id": "loteria", "n": "Lotería", "img": "loteria.avif", "d": "Estate atento a las cartas; el primero en completar su tabla gana.", "t": "3–5 min", "dif": "Fácil", "r": ["Tú y 3 jugadores CPU tienen una tabla de 16 cartas.", "Cada 2.5 segundos sale una carta nueva.", "Toca en tu tabla las cartas que ya salieron.", "El primero en completar toda su tabla gana: 15 puntos."]}, {"id": "canicas", "n": "Canicas", "img": "canicas.avif", "d": "Lanza la canica al hoyo; la más cercana obtiene más puntos.", "t": "3–5 min", "dif": "Neutra", "r": ["Cada jugador tiene 10 canicas.", "Arrastra hacia atrás y suelta para lanzar.", "Las canicas cerca del hoyo dan más puntos.", "Al hoyo: 10 puntos."]}, {"id": "escondidas", "n": "Escondidas", "img": "escondite.jpg", "d": "Un campo con árboles, arbustos, rocas y más: escóndete o encuentra a los demás.", "t": "2 min", "dif": "Fácil", "r": ["Es un campo con árboles, arbustos, rocas, troncos, pajares y barriles.", "Solo: los 4 bots tienen unos segundos para esconderse; luego tocas los objetos y los encuentras antes de que se acabe el tiempo.", "Cada bot encontrado vale 5 puntos (+5 si los encuentras a todos).", "En línea: primero te escondes tocando un objeto mientras un cazador te busca; después tú eres el cazador y verás «Jugador 2 encontrado» con cada hallazgo.", "Si nadie te encuentra ganas 8 puntos; cada jugador que encuentres como cazador vale 4."]}, {"id": "vasos", "n": "Vasos", "img": "vasos.jpg", "d": "Adivina en qué vaso quedó la pelota; cada ronda hay más vasos.", "t": "2 min", "dif": "Media", "r": ["Mira bajo qué vaso queda la pelota.", "Cada ronda trae un vaso más: de 3 vasos en la ronda 1 a 7 en la ronda 5.", "Los vasos se mezclan; en Difícil se mueven mucho más rápido.", "Toca el vaso donde crees que está (5 rondas).", "Solo: 3 puntos por acierto. En línea (5 jugadores): el primero que la encuentre gana 5, el segundo 3 y el tercero 1."]}, {"id": "balero", "n": "Balero", "img": "balero.jpg", "d": "Atrapa la pelota que se impulsa sobre el balero antes de que caiga al suelo.", "t": "1 min", "dif": "Media", "r": ["Mueve el balero con el dedo, el mouse o las flechas ← →.", "La pelota espera sobre el balero y, cada cierto tiempo, se impulsa hacia arriba.", "Colócate debajo y atrápala en el balero antes de que toque el suelo.", "Tienes 10 lanzamientos; cada pelota atrapada vale 3 puntos.", "En Difícil se impulsa más rápido y la copa es más pequeña."]}, {"id": "trompo", "n": "Trompo", "img": "trompo.jpg", "d": "Batalla de trompos: saca a los demás de la arena 5 veces.", "t": "3 min", "dif": "Media", "r": ["Eres un trompo en una arena con 3 rivales.", "Dirige tu trompo con el dedo o el mouse.", "Pulsa «¡Embestir!» (o Espacio) para dar un impulso.", "Derrota a los demás sacándolos de la arena.", "Los derrotados reaparecen a los 3 segundos.", "El primero en lograr 5 derrotas gana la batalla."]}, {"id": "sillas", "n": "Sillas", "img": "sillas.jpg", "d": "Toca primero una silla cuando pare la música; las sillas cambian de lugar.", "t": "3 min", "dif": "Media", "r": ["Son 5 jugadores y 4 sillas.", "Las sillas cambian de lugar al azar mientras suena la música, así que nadie sabe dónde quedarán.", "Cuando pare, toca una silla libre antes que los demás.", "Quien se queda sin silla sale y cada ronda hay una silla menos.", "El último jugador que queda gana 15 puntos."]}];

/* ---------- Navegación ---------- */
let view='home';
function go(v){view=v;$('#back').hidden=v==='home'||v==='juegos';
 document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===(v==='cuenta'?'config':v)));
 $('#flag').hidden=v!=='home';$('#title').textContent={home:'Juega, Gana y Diviértete',juegos:'Juegos',cuenta:'Cuenta'}[v];
 M.innerHTML='';({home:home,juegos:juegos,cuenta:cuenta})[v]();scrollTo(0,0)}
function goCuenta(anchor){go('cuenta');setTimeout(()=>{const el=document.getElementById(anchor);if(el)el.scrollIntoView({behavior:'smooth'})},50)}
function card(g){return `<button class="g" onclick="location.href='juegos/${g.id}.html'"><div class="e"><img src="${IMG}${g.img}" alt=""></div>${g.n}<small>${g.t}</small></button>`}

/* ---------- Interfaz 1: Inicio ---------- */
function home(){M.innerHTML=`<input id="q" type="search" placeholder="🔍 Buscar juego" aria-label="Buscar juego"><h2>Juegos recomendados</h2><div class="grid" id="rec">${['loteria','canicas','escondidas'].map(i=>card(GAMES.find(g=>g.id==i))).join('')}</div>
<h2>Hoy</h2><div class="row"><span class="e"><img src="${IMG}BanderaM.avif" alt="México"></span><div>Juega los clásicos de la calle y la plaza: suma puntos, sube de nivel y desbloquea recompensas.</div></div>`;
 $('#q').oninput=e=>{const q=e.target.value.toLowerCase();$('#rec').innerHTML=GAMES.filter(g=>!q&&['loteria','canicas','escondidas'].includes(g.id)||q&&g.n.toLowerCase().includes(q)).map(card).join('')}}

/* ---------- Interfaz 2: Juegos ---------- */
function juegos(){M.innerHTML='<h2>Todos los juegos</h2>'+GAMES.map(g=>`<div class="row"><span class="e"><img src="${IMG}${g.img}" alt=""></span><div><b>${g.n}</b><br><small>${g.d}</small></div><button class="btn" onclick="location.href='juegos/${g.id}.html'">Jugar</button></div>`).join('')}

/* ---------- Interfaz 4: Cuenta (inicio de sesión con MySQL) ---------- */
function cuenta(){const u=U();
 if(!u){M.innerHTML=`<h2>Iniciar sesión</h2><p>Entra para guardar puntos, logros y recompensas.</p>${ESTADO.error?'<p class="aviso">⚠️ '+esc(ESTADO.error)+'</p>':''}<input id="un" placeholder="Usuario" autocomplete="username" maxlength="20"><input id="pw" type="password" placeholder="Contraseña (mínimo 6 caracteres)" autocomplete="current-password"><p id="er" style="color:var(--rojo)"></p><button class="btn" id="li">Entrar</button> <button class="btn o" id="rg">Crear cuenta</button>`;
  const enviar=async ruta=>{$('#er').textContent='';const r=await api(ruta,{nombre:$('#un').value.trim(),pass:$('#pw').value});
   if(r.error)return $('#er').textContent=r.error;ESTADO=r;cuenta()};
  $('#li').onclick=()=>enviar('login.php');$('#rg').onclick=()=>enviar('registro.php');
  $('#pw').onkeydown=e=>{if(e.key==='Enter')enviar('login.php')};return}
 const nx=u.exp%100,eq=u.equipadas||{},st=eq.sticker&&rewById(eq.sticker),ti=eq.titulo&&rewById(eq.titulo);
 M.innerHTML=`<div class="row">${avatarHTML(u)}<div><b>${esc(u.nombre)}</b> ${st?esc(st.emoji):''}<br><small>${ti?esc(ti.nombre):'Sin título'}</small><br>Nivel ${u.nivel}<div class="bar" style="margin-top:4px"><i style="width:${nx}%"></i></div><small>Progreso para subir de nivel · ${nx}/100 exp</small></div></div>
 <div class="row"><span class="e">⭐</span><div><b>${u.puntos}</b> puntos de juego</div></div>
 <div class="row"><span class="e"><img src="${IMG}logros.png" alt=""></span><div><b>Logros</b><br><small>${ESTADO.logros.filter(x=>x.desbloqueado).length} de ${ESTADO.logros.length} desbloqueados</small></div><a class="btn" href="logros.html">Ver logros</a></div>
 <div class="row"><span class="e"><img src="${IMG}recompensas.png" alt=""></span><div><b>Recompensas</b><br><small>${ESTADO.recompensas.filter(r=>r.obtenida).length} de ${ESTADO.recompensas.length} obtenidas</small></div><a class="btn" href="recompensas.html">Ver recompensas</a></div>
 <h2 id="config">Configuración</h2>
 <p><button class="btn r" id="lo">Cerrar sesión</button> <button class="btn o" id="rs">Reiniciar progreso</button></p>`;
 $('#lo').onclick=async()=>{const r=await api('logout.php',{});if(!r.error)ESTADO=r;cuenta()};
 $('#rs').onclick=async()=>{if(!confirm('¿Borrar puntos, logros y recompensas de '+u.nombre+'?'))return;const r=await api('reiniciar.php',{});if(r.error)toast('⚠️ '+r.error);else ESTADO=r;cuenta()}}

/* ---------- Eventos ---------- */
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{const v=b.dataset.v;if(v==='home')go('home');else if(v==='logros')location.href='logros.html';else if(v==='recomp')location.href='recompensas.html';else go('cuenta')});
document.querySelectorAll('#side button').forEach(b=>b.onclick=()=>{const s=b.dataset.s;
 if(s==='menu')go('home');else if(s==='online')toast('Modo en línea próximamente');
 else if(s==='biblioteca')go('juegos');
 else if(s==='buscar'){go('home');$('#q').focus()}else go('cuenta')});
$('#usr').innerHTML='<img class="ico" src="'+IMG+'usuario.png" alt="Cuenta">';$('#usr').onclick=()=>go('cuenta');$('#back').onclick=()=>go('juegos');
listo.then(()=>go(location.hash==='#juegos'?'juegos':location.hash==='#cuenta'?'cuenta':'home'));
