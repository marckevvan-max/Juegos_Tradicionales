/* =====================================================================
   Código compartido por todas las páginas (menú, logros, recompensas y juegos)
   Los datos del usuario viven en MySQL: este archivo habla con la API en /api/
   ===================================================================== */
const $=s=>document.querySelector(s);
let ONLINE=false;
const GAME_ID=location.pathname.split('/').pop().replace('.html','');
let DIF=1; /* 0=Fácil 1=Media 2=Difícil */

/* Rutas: se calculan a partir de la ubicación de este archivo (js/common.js),
   así funcionan desde html/ y html/juegos/ y en cualquier carpeta del servidor. */
const RAIZ=new URL('../',document.currentScript.src).href;
const IMG=RAIZ+'img/',API=RAIZ+'api/';

/* Evita que un texto escrito por el usuario se interprete como HTML */
const esc=t=>String(t==null?'':t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function toast(t){const d=document.createElement('div');d.className='toast';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),2400)}

/* ---------- Comunicación con la API PHP ---------- */
async function api(ruta,datos){
 try{
  const r=await fetch(API+ruta,{method:datos?'POST':'GET',credentials:'same-origin',cache:'no-store',
   headers:datos?{'Content-Type':'application/json'}:{},body:datos?JSON.stringify(datos):undefined});
  const j=await r.json().catch(()=>({error:'El servidor respondió algo inesperado. ¿Está encendido PHP?'}));
  if(!r.ok&&!j.error)j.error='Error '+r.status;
  return j;
 }catch(e){return{error:'No se pudo conectar con el servidor. Abre el proyecto desde Apache/Docker, no con doble clic.'}}
}

/* Estado del usuario: { usuario, logros[], recompensas[] } */
let ESTADO={usuario:null,logros:[],recompensas:[],error:null};
const U=()=>ESTADO.usuario;
const rewById=clave=>ESTADO.recompensas.find(r=>r.clave===clave);
async function cargarEstado(){
 const r=await api('sesion.php');
 ESTADO=r.error?{usuario:null,logros:[],recompensas:[],error:r.error}:r;
 return ESTADO;
}
/* Las páginas esperan a "listo" antes de dibujar sus datos */
const listo=cargarEstado();

/* Foto de perfil con el marco equipado */
const avatarHTML=u=>{const f=u&&u.equipadas&&rewById(u.equipadas.marco);
 return '<span class="av" style="background:'+esc(f&&f.fondo?f.fondo:'#3f62c9')+'"><img src="'+IMG+'usuario.png" alt=""></span>'};

/* Guarda la partida en la base de datos (suma puntos, nivel y desbloquea logros) */
async function award(p,meta){
 if(!U()){toast('Inicia sesión en Cuenta para guardar tus puntos');return}
 meta=meta||{};
 const r=await api('partida.php',{juego:meta.game,puntos:p,dificultad:meta.dif,en_linea:meta.online?1:0,victoria:meta.win?1:0});
 if(r.error){toast('⚠️ '+r.error);return}
 (r.nuevos||[]).forEach(n=>toast('🏅 Logro: '+n));
 ESTADO=r;
}

/* ---------- Utilidades de los juegos ---------- */
let tm=[],raf=0;
const later=(f,ms)=>{const i=setInterval(f,ms);tm.push(i);return i};
function clear(){tm.forEach(clearInterval);tm=[];cancelAnimationFrame(raf)}
const HUD=(st,html)=>{let h=st.querySelector('.hud');if(!h){h=document.createElement('div');h.className='hud';h.style.cssText='position:absolute;top:6px;left:8px;right:8px;display:flex;justify-content:space-between;font-weight:bold;z-index:2;pointer-events:none';st.appendChild(h)}h.innerHTML=html};
function finish(st,s,msg,win){clear();s=Math.round(Math.max(0,s)*[1,1.5,2][DIF]);st.style.cssText='display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center';
 st.innerHTML=`<div style="font-size:3rem">${s>0?'🎉':'💪'}</div><b>${msg||''}</b><div>Puntos: ${s} · ${['Fácil','Media','Difícil'][DIF]}</div><button class="btn" onclick="location.reload()">Jugar otra vez</button>`;
 award(s,{game:GAME_ID,online:ONLINE,win:!!win,dif:DIF})}
function initGame(fn){
 const run=on=>{DIF=+$('#dif').value;$('#dif').disabled=true;const st=$('#st');st.style.cssText='';st.innerHTML='';$('#play').disabled=$('#online').disabled=true;ONLINE=!!on;fn(st,(s,m,w)=>finish(st,s,m,w),on)};
 $('#play').onclick=()=>run(false);
 $('#online').onclick=()=>fn.online?run(true):toast('Modo en línea próximamente');
 listo.then(()=>{if(!U())$('#aviso').hidden=false})}
