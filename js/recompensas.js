/* Interfaz de Recompensas: stickers, marcos y títulos que se canjean con puntos (datos de MySQL) */
const M=$('#main');let cat='sticker';
const CATS=[['sticker','Stickers'],['marco','Marcos'],['titulo','Títulos']];
function preview(r){return r.categoria==='sticker'?'<div class="pv">'+esc(r.emoji)+'</div>':r.categoria==='marco'?'<span class="av" style="background:'+esc(r.fondo)+'"><img src="'+IMG+'usuario.png" alt=""></span>':'<span class="pill">'+esc(r.nombre)+'</span>'}
function render(){const u=U(),pts=u?u.puntos:0,nv=u?u.nivel:1;
 M.innerHTML=(ESTADO.error?'<div class="aviso">⚠️ '+esc(ESTADO.error)+'</div>':'')+(u?'':'<div class="aviso">Inicia sesión en <a href="menu.html#cuenta">Cuenta</a> para canjear recompensas con tus puntos.</div>')+
 `<div class="resumen"><b>⭐ ${pts}</b> puntos de juego · Nivel ${nv}<br><small>Juega para ganar puntos y canjéalos aquí.</small></div>
 <div class="tabs">${CATS.map(c=>`<button data-c="${c[0]}"${cat===c[0]?' class="on"':''}>${c[1]}</button>`).join('')}</div>`+
 ESTADO.recompensas.filter(r=>r.categoria===cat).map(r=>{
  const own=r.obtenida,eqp=r.equipada,okLv=nv>=r.nivel_min,okPts=pts>=r.costo,pct=Math.min(100,Math.round(pts/r.costo*100));
  const falta=own?'':(!okPts?'Te faltan '+(r.costo-pts)+' puntos':'')+(!okPts&&!okLv?' y ':'')+(!okLv?'necesitas llegar al nivel '+r.nivel_min:'');
  const btn=!u?'<button class="btn" disabled>Inicia sesión</button>':own?`<button class="btn ${eqp?'o':''}" data-e="${esc(r.clave)}">${eqp?'Quitar':'Equipar'}</button>`:`<button class="btn" data-b="${esc(r.clave)}"${okPts&&okLv?'':' disabled'}>Canjear por ${r.costo} pts</button>`;
  return `<div class="card ${own?'done':'lock'}"><div class="ic">${preview(r)}</div><div class="tx"><h3>${esc(r.nombre)}</h3><p>${esc(r.descripcion)}</p>
  <p class="how"><b>Qué hacer:</b> junta ${r.costo} puntos jugando y llega al nivel ${r.nivel_min}.</p>
  ${own?'':`<div class="bar"><i style="width:${pct}%"></i></div><div class="st">${pts} / ${r.costo} puntos${falta?' · '+falta:' · ¡Listo para canjear!'}</div>`}
  <div class="st">${own?(eqp?'✅ Equipado':'✅ Obtenido'):''}</div>${btn}</div></div>`}).join('');
 M.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{cat=b.dataset.c;render()});
 M.querySelectorAll('[data-b]').forEach(b=>b.onclick=async()=>{const r=await api('canjear.php',{clave:b.dataset.b});
  if(r.error)toast('⚠️ '+r.error);else{ESTADO=r;toast('🎁 Obtuviste: '+rewById(b.dataset.b).nombre)}render()});
 M.querySelectorAll('[data-e]').forEach(b=>b.onclick=async()=>{const r0=rewById(b.dataset.e);const r=await api('equipar.php',{clave:r0.clave,equipar:!r0.equipada});
  if(r.error)toast('⚠️ '+r.error);else ESTADO=r;render()})}
listo.then(render);
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{location.href=b.dataset.href});
