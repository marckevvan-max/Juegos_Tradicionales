/* Lógica de Balero: la pelota se impulsa y hay que atraparla en el balero */
const G={};
G.balero=(st,end)=>{const W=320,HH=440,GY=420,TH=155,R=16,LAUNCHES=10,GRAV=.4;
 st.innerHTML='<canvas id="cv" width="320" height="440" style="width:100%;display:block"></canvas>';
 const cv=$('#cv'),c=cv.getContext('2d');
 /* dificultad: espera antes del impulso, fuerza, desvío lateral y ancho de la copa */
 const WAIT=[2.6,2,1.4][DIF]*60,VY=[-10.5,-11.8,-13][DIF],VX=[1.8,3,4.2][DIF],HALF=[34,27,21][DIF],SPEED=[11,10,9][DIF];
 const imgM=new Image(),imgB=new Image();let ok=0;imgM.onload=imgB.onload=()=>ok++;imgM.src=IMG+'balero-mango.png';imgB.src=IMG+'balero-bola.png';
 const SW=()=>imgM.naturalWidth?TH*imgM.naturalWidth/imgM.naturalHeight:44;
 const RIM=TH*.09;                         /* el borde de la copa está al 9% de la altura del dibujo */
 const cup={x:W/2},ball={x:W/2,y:0,vx:0,vy:0,rot:0};
 let target=W/2,state='rest',timer=WAIT,launched=0,caught=0,score=0,streak=0,last=0,over=false,msg='Mueve el balero: dedo, mouse o flechas ← →',keys={};
 const cupTop=GY-TH+RIM;
 const rest=()=>{ball.x=cup.x;ball.y=cupTop-R+3;ball.vx=ball.vy=0};
 rest();
 const pt=e=>{const q=cv.getBoundingClientRect();return(e.clientX-q.left)*W/q.width};
 cv.onpointerdown=cv.onpointermove=e=>{target=pt(e)};
 document.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();keys[e.key]=1}};
 document.onkeyup=e=>{delete keys[e.key]};
 const resolve=()=>{if(launched>=LAUNCHES){over=true;setTimeout(()=>end(score,'Atrapaste '+caught+' de '+LAUNCHES+' pelotas',caught>=7),700)}};
 const step=dt=>{
  if(keys.ArrowLeft)target=Math.max(20,cup.x-60);if(keys.ArrowRight)target=Math.min(W-20,cup.x+60);
  const d=target-cup.x,mv=Math.max(-SPEED*dt,Math.min(SPEED*dt,d));cup.x=Math.max(20,Math.min(W-20,cup.x+mv));
  if(state==='rest'){rest();timer-=dt;
   if(timer<=0&&!over&&launched<LAUNCHES){launched++;state='air';ball.vy=VY;ball.vx=(Math.random()*2-1)*VX;msg='¡Atrápala!'}}
  else if(state==='air'){const py=ball.y;ball.vy+=GRAV*dt;ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;ball.rot+=ball.vx*.05*dt;
   if(ball.x<R){ball.x=R;ball.vx*=-1}if(ball.x>W-R){ball.x=W-R;ball.vx*=-1}
   if(ball.vy>0&&py<cupTop-R+3&&ball.y>=cupTop-R+3&&Math.abs(ball.x-cup.x)<=HALF){
    caught++;streak++;score+=3;msg='¡Atrapada! +3'+(streak>1?'  racha x'+streak:'');state='rest';timer=WAIT;rest();resolve()}
   else if(ball.y>=GY-R){ball.y=GY-R;streak=0;msg='Cayó al suelo';state='miss';timer=55}}
  else if(state==='miss'){timer-=dt;if(timer<=0){state='rest';timer=WAIT;rest();resolve()}}};
 const drawBall=(x,y,rot)=>{c.save();c.translate(x,y);c.rotate(rot);
  if(imgB.naturalWidth)c.drawImage(imgB,-R-2,-R-2,2*R+4,2*R+4);else{c.fillStyle='#d9a45b';c.beginPath();c.arc(0,0,R,0,7);c.fill()}c.restore()};
 const draw=()=>{
  c.fillStyle='#bfe3ff';c.fillRect(0,0,W,HH);c.fillStyle='#8fc46a';c.fillRect(0,GY,W,HH-GY);c.fillStyle='#6aa84f';c.fillRect(0,GY,W,4);
  /* sombra de la pelota en el suelo */
  const hgt=Math.max(0,GY-ball.y);c.fillStyle='rgba(0,0,0,'+(.25*Math.max(.15,1-hgt/380))+')';c.beginPath();c.ellipse(ball.x,GY+8,R*(1-Math.min(.5,hgt/700)),4,0,0,7);c.fill();
  /* cuerda */
  const sx=cup.x+SW()*.18,sy=cupTop-4;c.strokeStyle='#f3e6c4';c.lineWidth=2.5;c.beginPath();c.moveTo(sx,sy);
  c.quadraticCurveTo((sx+ball.x)/2+(state==='air'?0:18),Math.max(sy,ball.y)+(state==='air'?10:6),ball.x,ball.y);c.stroke();
  /* pelota (tiembla antes del impulso) y balero */
  const wob=state==='rest'&&timer<30&&!over?Math.sin(timer*1.6)*2.2:0;drawBall(ball.x+wob,ball.y,ball.rot);
  if(imgM.naturalWidth)c.drawImage(imgM,cup.x-SW()/2,GY-TH,SW(),TH);else{c.fillStyle='#d9a45b';c.fillRect(cup.x-18,GY-TH,36,TH)}
  /* marcador */
  c.fillStyle='#1d2a22';c.font='bold 13px sans-serif';c.textAlign='left';c.fillText('Lanzamientos: '+launched+'/'+LAUNCHES,8,18);
  c.textAlign='right';c.fillText('Puntos: '+score,W-8,18);c.textAlign='center';c.fillText(msg,W/2,38);
  if(state==='rest'&&!over&&launched<LAUNCHES){c.font='12px sans-serif';c.fillText('Próximo impulso en '+Math.max(0,Math.ceil(timer/60))+' s',W/2,56)}};
 const loop=ts=>{const dt=Math.min(2.5,(ts-(last||ts))/16.67);last=ts;step(dt);draw();raf=requestAnimationFrame(loop)};
 raf=requestAnimationFrame(loop)};

initGame(G.balero);
