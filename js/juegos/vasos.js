/* Lógica de Vasos: cada ronda trae un vaso más y en Difícil se mueven más rápido */
const G={};
G.vasos=(st,end,online)=>{const R=5,N=['Ana','Beto','Caro','Dani'];let round=0,pts=0;
 st.innerHTML='<div id="msg" style="padding:44px 10px 0;text-align:center;font-weight:bold;min-height:92px"></div><div id="tb" style="position:relative;height:170px"></div><div id="sc" style="text-align:center;font-size:.85rem;padding:6px"></div>';
 const msg=t=>{$('#msg').innerHTML=t},tb=$('#tb'),sc=()=>{$('#sc').textContent='Ronda '+Math.min(round,R)+'/'+R+' · Puntos: '+pts+(online?' · 5 jugadores en línea':'')};
 const play=()=>{if(++round>R)return end(pts,'Fin de la partida',pts>=12);
  const n=2+round;                                                   /* ronda 1: 3 vasos … ronda 5: 7 vasos */
  const X=i=>(4+(i+.5)*92/n);                                        /* posición (%) de cada hueco */
  const ms=Math.max([220,180,125][DIF],[680,540,330][DIF]-round*[50,50,38][DIF]);   /* tiempo entre cambios */
  sc();tb.innerHTML='';tb.style.setProperty('--w',Math.min(84,Math.floor(290/n))+'px');
  const ball=Math.floor(Math.random()*n),slots=[...Array(n).keys()],done={},order=[];let ready=false,fin=false;
  const cups=slots.map(i=>{const d=document.createElement('div');d.className='vaso';d.style.left=X(i)+'%';d.style.transitionDuration=Math.round(ms*.85)+'ms';
   d.innerHTML=(i===ball?'<i class="bola"></i>':'')+'<b class="cuerpo"></b>';tb.appendChild(d);d.onclick=()=>pick(i,'Tú');return d});
  const close=()=>{if(fin)return;fin=true;cups[ball].classList.add('up');msg(order.length?'Encontraron la pelota: '+order.map((p,k)=>(k+1)+'º '+p).join(' · '):'Nadie la encontró');setTimeout(play,2000)};
  const check=()=>{if(fin)return;if(online?(order.length>=3||Object.keys(done).length>=5):done['Tú'])close()};
  function pick(i,p){if(!ready||done[p]||fin)return;done[p]=true;const ok=i===ball;
   if(p==='Tú'){cups[i].classList.add('up');if(ok){order.push(p);const r=order.length;const g=online?([5,3,1][r-1]||0):3;pts+=g;msg('¡Encontraste la pelota!'+(online?' Lugar '+r+'º':'')+' +'+g)}else msg('❌ Ahí no estaba');sc()}
   else if(ok)order.push(p);check()}
  msg(`Ronda ${round}/${R}: ${n} vasos. Mira dónde está la pelota`);cups[ball].classList.add('up');
  setTimeout(()=>{cups[ball].classList.remove('up');msg('Mezclando…');let k=6+round*2+DIF*3+n;
   const iv=later(()=>{const a=Math.floor(Math.random()*n);let b=Math.floor(Math.random()*(n-1));if(b>=a)b++;
    [slots[a],slots[b]]=[slots[b],slots[a]];cups[a].style.left=X(slots[a])+'%';cups[b].style.left=X(slots[b])+'%';
    if(--k===0){clearInterval(iv);setTimeout(()=>{ready=true;msg('¿Dónde está la pelota? ¡Toca un vaso!');
     if(online){N.forEach(p=>setTimeout(()=>pick(Math.floor(Math.random()*n),p),(1200+Math.random()*4500)*[1.4,1,.65][DIF]));setTimeout(close,9000)}},Math.round(ms*.9))}},ms)},1400)};
 play()};
G.vasos.online=true;

initGame(G.vasos);
