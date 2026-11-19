/* AETHERIUM — opt-in holographic inspection controls.
 * Pointer: desktop mouse + mobile finger. DeviceOrientation: permission on
 * tap, never auto-enabled; animation affects the card frame, never artwork.
 */
let disposePrevious=()=>{};
const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
export function enableHolographicInspection(shell){
  disposePrevious();
  if(!shell)return;
  const controller=new AbortController(),signal=controller.signal;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let x=.5,y=.5,usingSensor=false,zero=null,raf=0;
  const update=()=>{
    raf=0;
    const dx=(x-.5)*2,dy=(y-.5)*2;
    shell.style.setProperty('--holo-x',(x*100).toFixed(2)+'%');
    shell.style.setProperty('--holo-y',(y*100).toFixed(2)+'%');
    shell.style.setProperty('--holo-angle',Math.round(110+dx*75+dy*24)+'deg');
    shell.style.setProperty('--holo-rx',reduced?'0deg':(-dy*8).toFixed(2)+'deg');
    shell.style.setProperty('--holo-ry',reduced?'0deg':(dx*10).toFixed(2)+'deg');
  };
  const schedule=()=>{if(!raf)raf=requestAnimationFrame(update)};
  const position=(clientX,clientY)=>{
    const rect=shell.getBoundingClientRect();
    x=clamp((clientX-rect.left)/rect.width,0,1);
    y=clamp((clientY-rect.top)/rect.height,0,1);
    schedule();
  };
  shell.addEventListener('pointermove',e=>{if(!usingSensor)position(e.clientX,e.clientY)},{signal,passive:true});
  shell.addEventListener('pointerdown',e=>{if(!usingSensor)position(e.clientX,e.clientY)},{signal,passive:true});
  shell.addEventListener('pointerleave',e=>{
    if(!usingSensor&&e.pointerType==='mouse'){x=.5;y=.5;schedule()}
  },{signal});
  shell.addEventListener('pointerup',e=>{
    if(!usingSensor&&e.pointerType!=='mouse'){x=.5;y=.5;schedule()}
  },{signal});
  const supported=('DeviceOrientationEvent' in window)&&window.isSecureContext;
  if(supported){
    const sensor=document.createElement('button');
    sensor.type='button';sensor.className='holo-sensor';
    sensor.textContent='Activer l’inclinaison';
    sensor.setAttribute('aria-pressed','false');
    shell.append(sensor);
    function orient(e){
      if(!usingSensor||!Number.isFinite(e.gamma)||!Number.isFinite(e.beta))return;
      if(!zero)zero={gamma:e.gamma,beta:e.beta};
      x=.5+clamp((e.gamma-zero.gamma)/25,-1,1)*.5;
      y=.5+clamp((e.beta-zero.beta)/30,-1,1)*.5;
      schedule();
    }
    window.addEventListener('deviceorientation',orient,{signal,passive:true});
    sensor.addEventListener('click',async()=>{
      if(usingSensor){
        usingSensor=false;zero=null;
        sensor.textContent='Activer l’inclinaison';
        sensor.setAttribute('aria-pressed','false');
        x=.5;y=.5;schedule();return;
      }
      try{
        if(typeof DeviceOrientationEvent.requestPermission==='function'&&
           await DeviceOrientationEvent.requestPermission()!=='granted')return;
        usingSensor=true;zero=null;
        sensor.setAttribute('aria-pressed','true');
        sensor.textContent='Désactiver l’inclinaison';
      }catch{
        sensor.textContent='Capteur indisponible';
      }
    },{signal});
  }
  update();
  disposePrevious=()=>{
    controller.abort();
    if(raf)cancelAnimationFrame(raf);
    disposePrevious=()=>{};
  };
}
