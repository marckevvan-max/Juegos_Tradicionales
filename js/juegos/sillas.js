/* Lógica de Sillas */
const G={};
G.sillas=(st,end,online)=>{const names=['Tú'].concat(online?['Jugador 2','Jugador 3','Jugador 4','Jugador 5']:['CPU 1','CPU 2','CPU 3','CPU 4']);
 let alive=names.slice(),round=0,music=false,taken=[],chairs=[];
 st.innerHTML='<div id="msg" style="padding:44px 10px 0;text-align:center;font-weight:bold;min-height:96px"></div><div id="ar" style="position:relative;height:240px"></div><div id="pl" style="text-align:center;font-size:.85rem;padding:6px"></div>';
 const msg=t=>{$('#msg').innerHTML=t},ar=$('#ar');
 const place=()=>{const w=ar.clientWidth||320,h=ar.clientHeight||240,ps=[];chairs.forEach(el=>{let x,y,t=0;do{x=10+Math.random()*80;y=14+Math.random()*72;t++}while(t<80&&ps.some(p=>Math.hypot((p.x-x)*w/100,(p.y-y)*h/100)<64));ps.push({x:x,y:y});el.style.left=x+'%';el.style.top=y+'%'})};
 const take=(b,p)=>{if(music)return toast('¡Espera a que pare la música!');if(taken.includes(p)||taken.length>=chairs.length)return;
  const free=chairs.filter(c=>!c.dataset.o);const c=p==='Tú'?b:free[Math.floor(Math.random()*free.length)];if(!c||c.dataset.o)return;
  c.dataset.o=p;c.textContent=p==='Tú'?'🪑🧒':'🪑🙂';taken.push(p);if(taken.length===chairs.length)setTimeout(resolve,700)};
 const resolve=()=>{const out=alive.find(p=>!taken.includes(p));alive=alive.filter(p=>p!==out);
  if(out==='Tú')return end((round-1)*2,'Te quedaste sin silla en la ronda '+round,false);
  if(alive.length===1)return end(15,'¡Ganaste! Tocaste primero la última silla',true);
  msg(out+' quedó eliminado');setTimeout(next,1400)};
 const next=()=>{round++;const n=alive.length-1;taken=[];ar.innerHTML='';
  chairs=[...Array(n)].map(()=>{const b=document.createElement('button');b.className='silla';b.textContent='🪑';b.onclick=()=>take(b,'Tú');ar.appendChild(b);return b});
  place();$('#pl').textContent='Jugadores: '+alive.join(', ');
  msg('Ronda '+round+': '+alive.length+' jugadores y '+n+' sillas<br>🎵 Suena la música… ¡espera a que pare!');music=true;
  const mv=later(place,[600,480,350][DIF]);
  setTimeout(()=>{clearInterval(mv);music=false;msg('¡PARA! ¡Toca una silla!');alive.filter(p=>p!=='Tú').forEach(p=>setTimeout(()=>take(null,p),[700,400,250][DIF]+Math.random()*[1800,1500,900][DIF]))},2500+Math.random()*3000)};
 next()};
G.sillas.online=true;

initGame(G.sillas);
