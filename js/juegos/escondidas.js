/* Lógica de Escondidas: un campo con objetos donde esconderse */
const G={};
const OBJ=[['arbol',12,40,19],['arbol',46,36,17],['arbol',82,42,19],['arbusto',28,52,16],['roca',64,50,14],['arbusto',90,62,15],
 ['pajar',10,66,17],['tronco',38,68,19],['barril',70,70,11],['arbusto',54,84,18],['roca',20,86,14],['pajar',86,90,17]];
const NOM={arbol:'árbol',arbusto:'arbusto',roca:'roca',tronco:'tronco',pajar:'pajar',barril:'barril'};
const SVG={
 arbol:'<svg viewBox="0 0 100 120"><ellipse cx="50" cy="116" rx="26" ry="4" fill="rgba(0,0,0,.2)"/><rect x="43" y="68" width="14" height="48" rx="4" fill="#7a4e2a"/><circle cx="50" cy="42" r="32" fill="#2e8b3d"/><circle cx="30" cy="58" r="22" fill="#38a047"/><circle cx="70" cy="58" r="22" fill="#38a047"/><circle cx="42" cy="32" r="10" fill="#57bb62" opacity=".7"/></svg>',
 arbusto:'<svg viewBox="0 0 100 70"><ellipse cx="50" cy="64" rx="46" ry="6" fill="rgba(0,0,0,.18)"/><circle cx="26" cy="44" r="24" fill="#2f7d3a"/><circle cx="74" cy="44" r="24" fill="#2f7d3a"/><circle cx="50" cy="34" r="30" fill="#3a9447"/><circle cx="40" cy="26" r="8" fill="#5fc06c" opacity=".7"/><circle cx="64" cy="40" r="3" fill="#e63946"/><circle cx="34" cy="48" r="3" fill="#e63946"/></svg>',
 roca:'<svg viewBox="0 0 100 70"><ellipse cx="50" cy="64" rx="44" ry="6" fill="rgba(0,0,0,.18)"/><path d="M8 62 L18 30 L40 14 L66 16 L88 34 L94 62 Z" fill="#8a8f98"/><path d="M40 14 L66 16 L88 34 L62 36 Z" fill="#a9aeb7"/><path d="M8 62 L18 30 L40 36 L36 62 Z" fill="#6f747d"/></svg>',
 tronco:'<svg viewBox="0 0 110 60"><ellipse cx="55" cy="54" rx="50" ry="6" fill="rgba(0,0,0,.18)"/><rect x="8" y="14" width="92" height="38" rx="14" fill="#8b5a2b"/><rect x="8" y="14" width="92" height="12" rx="6" fill="#a9733a"/><ellipse cx="14" cy="33" rx="9" ry="19" fill="#d9a066"/><ellipse cx="14" cy="33" rx="4" ry="10" fill="#b98046"/></svg>',
 pajar:'<svg viewBox="0 0 100 80"><ellipse cx="50" cy="75" rx="46" ry="5" fill="rgba(0,0,0,.18)"/><path d="M6 72 C6 30 30 8 50 8 C70 8 94 30 94 72 Z" fill="#e3b94a"/><path d="M20 66 L34 24 M40 68 L46 14 M60 68 L58 14 M80 66 L66 24" stroke="#c99a2e" stroke-width="3" fill="none"/></svg>',
 barril:'<svg viewBox="0 0 70 90"><ellipse cx="35" cy="86" rx="30" ry="4" fill="rgba(0,0,0,.18)"/><path d="M10 14 C0 40 0 56 10 80 L60 80 C70 56 70 40 60 14 Z" fill="#9a6431"/><rect x="6" y="26" width="58" height="6" fill="#4b3a2a"/><rect x="6" y="60" width="58" height="6" fill="#4b3a2a"/><ellipse cx="35" cy="14" rx="25" ry="7" fill="#c58a4a"/></svg>'};
const shuf=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
/* Dibuja el campo y devuelve los objetos, el mensaje y el aviso «X encontrado» */
function mk(st){
 st.innerHTML='<div id="msg" style="padding:44px 10px 6px;text-align:center;font-weight:bold;min-height:70px"></div><div class="campo" id="campo"></div><div class="banner" id="bn"></div>';
 const objs=OBJ.map((o,i)=>{const b=document.createElement('button');b.className='obj';b.style.cssText='left:'+o[1]+'%;top:'+o[2]+'%;width:'+o[3]+'%;z-index:'+Math.round(o[2]);
  b.setAttribute('aria-label',NOM[o[0]]+' '+(i+1));b.innerHTML=SVG[o[0]]+'<span class="tag"></span>';$('#campo').appendChild(b);return b});
 let bt=0;
 return{objs:objs,msg:t=>{$('#msg').innerHTML=t},
  ban:(t,ok)=>{const bn=$('#bn');if(!bn)return;bn.textContent=t;bn.className='banner show '+(ok?'ok':'no');clearTimeout(bt);bt=setTimeout(()=>{bn.className='banner'},1700)},
  tag:(b,t)=>{b.querySelector('.tag').textContent=t}};
}
/* Fase de búsqueda: tocas los objetos para encontrar a los escondidos */
function hunt(S,st,hid,secs,done){const names=Object.keys(hid);let t=secs,found=0,fin=false;const seen=new Set();
 const hud=()=>HUD(st,'<span>⏱️ '+t+' s</span><span>Encontrados: '+found+'/'+names.length+'</span>');hud();
 const stop=()=>{if(fin)return;fin=true;S.objs.forEach(b=>{b.onclick=null});setTimeout(()=>done(found),1200)};
 S.objs.forEach((b,i)=>{b.onclick=()=>{if(fin)return;if(seen.has(i))return S.ban('Ya revisaste ahí',false);seen.add(i);
  const n=names.find(x=>hid[x]===i);
  if(n){found++;b.classList.add('found');S.tag(b,'🧒 '+n);S.ban(n+' encontrado',true)}
  else{b.classList.add('empty');S.tag(b,'✖');S.ban('Aquí no hay nadie',false)}
  hud();if(found===names.length){S.msg('¡Los encontraste a todos!');stop()}}});
 later(()=>{if(fin)return;t--;hud();if(t<=0){S.msg('¡Se acabó el tiempo!');stop()}},1000)}

/* Solo: los bots tienen unos segundos para esconderse y luego los buscas */
const solo=(st,end)=>{const names=['Ana','Beto','Caro','Dani'],HIDE=[7,5,4][DIF],SEARCH=[70,50,35][DIF];
 const S=mk(st),hid={},idx=shuf([...S.objs.keys()]);names.forEach((n,k)=>{hid[n]=idx[k]});
 let c=HIDE;S.objs.forEach(b=>{b.disabled=true;b.classList.add('wiggle')});
 const txt=()=>{S.msg('Los bots se están escondiendo…<br><span style="font-size:1.6rem">'+c+'</span>');HUD(st,'<span>Escondiéndose</span><span>⏱️ '+c+' s</span>')};txt();
 const iv=later(()=>{c--;if(c>0)return txt();clearInterval(iv);S.objs.forEach(b=>{b.disabled=false;b.classList.remove('wiggle')});
  S.msg('¡Listo! Toca los objetos y encuentra a los 4 bots');
  hunt(S,st,hid,SEARCH,f=>end(f*5+(f===4?5:0),f===4?'¡Los encontraste a todos!':'Encontraste '+f+' de 4',f===4))},1000)};

/* En línea: primero te escondes y te busca un cazador; luego tú eres el cazador */
const hide=(st,end)=>{let pts=0;const names=['Jugador 2','Jugador 3','Jugador 4','Jugador 5'],HIDE=[12,10,8][DIF],TRIES=[4,5,7][DIF],SEARCH=[50,40,30][DIF];
 const phase2=()=>{const S=mk(st),hid={},idx=shuf([...S.objs.keys()]);names.forEach((n,k)=>{hid[n]=idx[k]});
  S.msg('Fase 2: ahora tú eres el cazador.<br>Toca los objetos para encontrar a los 4 jugadores');
  hunt(S,st,hid,SEARCH,f=>{pts+=f*4;end(pts,'Encontraste a '+f+' de 4 jugadores',f===4)})};
 const S=mk(st);let c=HIDE,mine=-1,started=false;
 const hud=()=>HUD(st,'<span>Fase 1: escóndete</span><span>⏱️ '+c+' s</span>');
 S.msg('Fase 1: eres uno de los que se esconden.<br>¡Toca el objeto donde quieres esconderte!');hud();
 const begin=()=>{if(started)return;started=true;clearInterval(iv);
  if(mine<0){mine=Math.floor(Math.random()*S.objs.length);S.objs[mine].classList.add('mine');S.tag(S.objs[mine],'🫣 Tú')}
  S.objs.forEach(b=>{b.onclick=null});
  const free=shuf([...S.objs.keys()].filter(i=>i!==mine)),bots={};['Jugador 3','Jugador 4','Jugador 5'].forEach((n,k)=>{bots[n]=free[k]});
  S.msg('El cazador (Jugador 2) está buscando…');HUD(st,'<span>El cazador busca</span><span>Intentos: '+TRIES+'</span>');
  const order=shuf([...S.objs.keys()]).slice(0,TRIES);let k=0,me=false;
  const h=later(()=>{const i=order[k++],b=S.objs[i],n=Object.keys(bots).find(x=>bots[x]===i);
   if(i===mine){me=true;S.ban('¡Te encontró el cazador!',false);b.classList.add('found')}
   else if(n){S.ban(n+' encontrado',true);b.classList.add('found');S.tag(b,'🧒 '+n)}
   else{S.ban('El cazador no halló a nadie ahí',false);b.classList.add('empty');S.tag(b,'✖')}
   HUD(st,'<span>El cazador busca</span><span>Intentos: '+(TRIES-k)+'</span>');
   if(k>=TRIES){clearInterval(h);setTimeout(()=>{pts+=me?1:8;S.msg(me?'Te encontraron: +1':'¡Nadie te encontró! +8');setTimeout(phase2,1800)},1200)}},1200)};
 S.objs.forEach((b,i)=>{b.onclick=()=>{if(mine>=0)return;mine=i;b.classList.add('mine');S.tag(b,'🫣 Tú');S.msg('Te escondiste en ese objeto.<br>Esperando a los demás…');setTimeout(begin,1500)}});
 const iv=later(()=>{c--;hud();if(c<=0)begin()},1000)};
G.escondidas=(st,end,on)=>on?hide(st,end):solo(st,end);G.escondidas.online=true;

initGame(G.escondidas);
