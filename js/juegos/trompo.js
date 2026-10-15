/* Lógica de Trompo (batalla en arena) */
const G={};
G.trompo=(st,end,online)=>{const W=320,HH=360,CX=160,CY=185,R=140,r=16,WIN=5;
 st.innerHTML='<canvas id="cv" width="320" height="360" style="width:100%;display:block"></canvas><p style="margin:6px;text-align:center"><button class="btn r" id="dash">¡Embestir!</button></p>';
 const cv=$('#cv'),c=cv.getContext('2d');
 const nm=['Tú'].concat(online?['Jugador 2','Jugador 3','Jugador 4']:['CPU 1','CPU 2','CPU 3']);
 const col=['#e63946','#2a9d8f','#f4a261','#6a4c93'];
 const acc=[.12,.2,.28][DIF],dashP=[.004,.008,.015][DIF];
 const T=nm.map((n,i)=>{const a=i*Math.PI/2+Math.PI/4;return{n:n,i:i,x:CX+Math.cos(a)*R*.55,y:CY+Math.sin(a)*R*.55,vx:0,vy:0,k:0,dead:0,inv:60,hit:null,hitT:0,rot:Math.random()*6,cd:0}});
 let target={x:CX,y:CY},last=0,over=false,msg='Dirige tu trompo con el dedo o el mouse';
 const pt=e=>{const q=cv.getBoundingClientRect();return{x:(e.clientX-q.left)*W/q.width,y:(e.clientY-q.top)*HH/q.height}};
 cv.onpointerdown=cv.onpointermove=e=>{target=pt(e)};
 const boost=(p,tx,ty)=>{const dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy)||1;p.vx+=dx/d*7;p.vy+=dy/d*7;p.cd=90};
 const dash=()=>{const p=T[0];if(!over&&!p.dead&&p.cd<=0)boost(p,target.x,target.y)};
 $('#dash').onclick=dash;document.onkeydown=e=>{if(e.code==='Space'){e.preventDefault();dash()}};
 const win=w=>{over=true;const me=T[0];end(me.k*2+(w===me?10:0),w===me?'¡Ganaste la batalla de trompos!':w.n+' ganó la batalla',w===me)};
 const step=dt=>{
  T.forEach(p=>{
   if(p.dead>0){p.dead-=dt;if(p.dead<=0){const a=Math.random()*6.28;p.x=CX+Math.cos(a)*R*.5;p.y=CY+Math.sin(a)*R*.5;p.vx=p.vy=0;p.dead=0;p.inv=60}return}
   if(p.inv>0)p.inv-=dt;if(p.cd>0)p.cd-=dt;if(p.hitT>0)p.hitT-=dt;
   let tx,ty,a;
   if(p.i===0){tx=target.x;ty=target.y;a=.22*Math.min(1,Math.hypot(tx-p.x,ty-p.y)/40)}
   else{const dc=Math.hypot(p.x-CX,p.y-CY);
    if(dc>R*.78){tx=CX;ty=CY}else{let b=null,bd=1e9;T.forEach(q=>{if(q!==p&&!q.dead){const d=Math.hypot(q.x-p.x,q.y-p.y);if(d<bd){bd=d;b=q}}});tx=b?b.x:CX;ty=b?b.y:CY;if(b&&bd<110&&p.cd<=0&&Math.random()<dashP*dt)boost(p,tx,ty)}
    a=acc}
   const dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy)||1;p.vx+=dx/d*a*dt;p.vy+=dy/d*a*dt;
   const f=Math.pow(.95,dt);p.vx*=f;p.vy*=f;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=.4*dt});
  for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){const A=T[i],B=T[j];if(A.dead>0||B.dead>0)continue;
   const dx=B.x-A.x,dy=B.y-A.y,d=Math.hypot(dx,dy)||1;
   if(d<2*r){const nx=dx/d,ny=dy/d,ov=2*r-d;A.x-=nx*ov/2;A.y-=ny*ov/2;B.x+=nx*ov/2;B.y+=ny*ov/2;
    const rv=(B.vx-A.vx)*nx+(B.vy-A.vy)*ny;if(rv<0){const k=-(1+1.3)*rv/2;A.vx-=k*nx;A.vy-=k*ny;B.vx+=k*nx;B.vy+=k*ny}
    A.hit=B.i;A.hitT=120;B.hit=A.i;B.hitT=120}}
  T.forEach(p=>{if(p.dead>0||over)return;if(Math.hypot(p.x-CX,p.y-CY)>R+r*.3){p.dead=180;p.vx=p.vy=0;
   if(p.hitT>0&&p.hit!==null&&p.hit!==p.i){const w=T[p.hit];w.k++;msg=w.n+' sacó a '+p.n;if(w.k>=WIN)win(w)}else msg=p.n+' se cayó solo';p.hit=null}})};
 const draw=()=>{c.fillStyle='#e9d3a8';c.fillRect(0,0,W,HH);
  c.beginPath();c.arc(CX,CY,R,0,7);c.fillStyle='#8b5e3c';c.fill();c.lineWidth=6;c.strokeStyle='#4a2f1a';c.stroke();
  c.beginPath();c.arc(CX,CY,R*.5,0,7);c.strokeStyle='#a97a52';c.lineWidth=2;c.stroke();
  T.forEach(p=>{if(p.dead>0)return;c.save();c.translate(p.x,p.y);c.globalAlpha=p.inv>0&&Math.floor(p.inv/6)%2?.4:1;
   c.fillStyle=col[p.i];c.beginPath();c.arc(0,0,r,0,7);c.fill();c.rotate(p.rot);c.fillStyle='#fff';for(let k=0;k<3;k++){c.rotate(2.09);c.fillRect(-1.5,-r+2,3,r-4)}
   c.restore();c.fillStyle='#000';c.font='bold 11px sans-serif';c.textAlign='center';c.fillText(p.n,p.x,p.y-r-4)});
  c.textAlign='left';c.font='bold 13px sans-serif';
  T.forEach(p=>{c.fillStyle=col[p.i];c.fillText(p.n+': '+p.k+'/'+WIN+(p.dead>0?' ⏳'+Math.ceil(p.dead/60)+'s':''),8+(p.i%2)*160,16+Math.floor(p.i/2)*16)});
  c.fillStyle='#1d2a22';c.textAlign='center';c.fillText(msg,CX,HH-6)};
 const loop=ts=>{if(over)return;const dt=Math.min(2.5,(ts-(last||ts))/16.67);last=ts;step(dt);if(over)return;
  const b=$('#dash');if(b)b.disabled=T[0].cd>0||T[0].dead>0;draw();raf=requestAnimationFrame(loop)};
 raf=requestAnimationFrame(loop)};
G.trompo.online=true;

initGame(G.trompo);
