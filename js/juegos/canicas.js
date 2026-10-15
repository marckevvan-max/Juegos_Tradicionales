/* Lógica de Canicas */
const G={};
G.canicas=(st,end)=>{st.innerHTML='<canvas id="cv" width="320" height="420" style="width:100%;display:block"></canvas>';const cv=$('#cv'),c=cv.getContext('2d');
 const H={x:160,y:90,r:[24,16,11][DIF]};let left=10,score=0,placed=[],m={x:160,y:370,vx:0,vy:0,mv:false},drag=null,msg='Arrastra hacia atrás y suelta';
 const pt=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*320/r.width,y:(e.clientY-r.top)*420/r.height}};
 cv.onpointerdown=e=>{if(!m.mv&&left>0)drag=pt(e)};cv.onpointermove=e=>{if(drag)drag.c=pt(e)};
 cv.onpointerup=e=>{if(!drag)return;const p=pt(e),dx=drag.x-p.x,dy=drag.y-p.y,d=Math.min(Math.hypot(dx,dy),120);drag=null;if(d<10)return;const a=Math.atan2(dy,dx);m.vx=Math.cos(a)*d*.14;m.vy=Math.sin(a)*d*.14;m.mv=true;left--};
 const col=['#e74c3c','#3498db','#f1c40f','#9b59b6','#e67e22'];
 const loop=()=>{c.fillStyle='#8fc46a';c.fillRect(0,0,320,420);c.fillStyle='#3b2a1a';c.beginPath();c.arc(H.x,H.y,H.r,0,7);c.fill();
  placed.forEach((p,i)=>{c.fillStyle=col[i%5];c.beginPath();c.arc(p.x,p.y,8,0,7);c.fill()});
  if(m.mv){m.x+=m.vx;m.y+=m.vy;m.vx*=.96;m.vy*=.96;if(m.x<8||m.x>312)m.vx*=-1;if(m.y<8||m.y>412)m.vy*=-1;
   if(Math.hypot(m.vx,m.vy)<.3){m.mv=false;const d=Math.hypot(m.x-H.x,m.y-H.y);const s=d<H.r?10:Math.max(0,Math.round(8-d/30));score+=s;msg=s==10?'¡Al hoyo! +10':'+'+s;placed.push({x:m.x,y:m.y});m.x=160;m.y=370;m.vx=m.vy=0;if(!left){setTimeout(()=>end(score,'Fin de la partida',score>=40),600)}}}
  if(left>0||m.mv){c.fillStyle=col[placed.length%5];c.beginPath();c.arc(m.x,m.y,8,0,7);c.fill()}
  if(drag&&drag.c){c.strokeStyle='#fff';c.setLineDash([6,6]);c.beginPath();c.moveTo(m.x,m.y);c.lineTo(m.x+drag.x-drag.c.x,m.y+drag.y-drag.c.y);c.stroke();c.setLineDash([])}
  c.fillStyle='#1d2a22';c.font='bold 15px Georgia';c.fillText('Canicas: '+left+'  Puntos: '+score,8,22);c.fillText(msg,8,408);raf=requestAnimationFrame(loop)};loop()};


initGame(G.canicas);
