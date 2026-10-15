/* Interfaz de Logros: lista, progreso y qué hacer para desbloquear cada uno (datos de MySQL) */
const M=$('#main');let filtro='todos';
function render(){const u=U();
 const L=ESTADO.logros.map(a=>({a:a,cur:a.progreso,done:a.desbloqueado}));
 const n=L.filter(x=>x.done).length,pct=L.length?Math.round(n/L.length*100):0;
 const vis=L.filter(x=>filtro==='todos'||(filtro==='hechos'?x.done:!x.done));
 M.innerHTML=(ESTADO.error?'<div class="aviso">⚠️ '+esc(ESTADO.error)+'</div>':'')+(u?'':'<div class="aviso">Inicia sesión en <a href="menu.html#cuenta">Cuenta</a> para guardar tu progreso y desbloquear logros.</div>')+
 `<div class="resumen"><b>${n} de ${L.length}</b> logros desbloqueados<div class="bar" style="margin-top:6px"><i style="width:${pct}%"></i></div></div>
 <div class="tabs">${[['todos','Todos'],['pend','En progreso'],['hechos','Desbloqueados']].map(t=>`<button data-f="${t[0]}"${filtro===t[0]?' class="on"':''}>${t[1]}</button>`).join('')}</div>`+
 (vis.length?vis.map(x=>`<div class="card ${x.done?'done':'lock'}"><div class="ic"><img src="${IMG}logros.png" alt=""></div><div class="tx"><h3>${esc(x.a.nombre)}</h3>
  <p class="how"><b>Qué hacer:</b> ${esc(x.a.descripcion)}</p>
  <div class="bar"><i style="width:${Math.round(x.cur/x.a.meta*100)}%"></i></div>
  <div class="st">${x.done?'✅ Desbloqueado':'🔒 Progreso: '+x.cur+' / '+x.a.meta}</div></div></div>`).join(''):'<p>No hay logros en esta lista todavía.</p>');
 M.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{filtro=b.dataset.f;render()})}
listo.then(render);
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{location.href=b.dataset.href});
