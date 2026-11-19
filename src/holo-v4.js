/* Aetherium holography V4: experimental four-plane lenticular depth.
   No saving, no booster changes. Keeps the original scenery fixed. */
(() => {
'use strict';
const art=document.querySelector('.art'),card=document.querySelector('#card');
const canvas=document.querySelector('#volume-canvas'),depth=document.querySelector('#depth');
const foil=document.querySelector('#intensity'),status=document.querySelector('#status');
if(!art||!card||!canvas)return;
const smallMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const original=new Image(),subject=new Image();
original.src='./assets/cards/vyrath-fleau-celeste.webp';
subject.src='./assets/cards/holo/vyrath/subject.webp';
let gl,program,uniforms={},ready=false,frame=0,x=.5,y=.5,gyro=false,hidden=false;
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
function load(i){return new Promise((ok,fail)=>{if(i.complete)return i.naturalWidth?ok():fail();i.onload=ok;i.onerror=fail})}
function compile(type,text){
 const s=gl.createShader(type);gl.shaderSource(s,text);gl.compileShader(s);
 if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));
 return s;
}
function buildProgram(){
 const vertex=compile(gl.VERTEX_SHADER,`
 attribute vec2 aPos; varying vec2 vUV;
 void main(){vUV=(aPos+1.0)*0.5;gl_Position=vec4(aPos,0.,1.);}
 `);
 const fragment=compile(gl.FRAGMENT_SHADER,`
 precision highp float;
 varying vec2 vUV;
 uniform sampler2D uImage,uSubject,uWing,uBody,uHead,uFront;
 uniform vec4 uRect;uniform vec2 uTilt,uLight,uPixel;
 uniform float uDepth,uFoil;
 vec4 planes(vec2 p){
  return vec4(texture2D(uWing,p).a,texture2D(uBody,p).a,
    texture2D(uHead,p).a,texture2D(uFront,p).a);
 }
 float heightAt(vec2 p){
  vec4 m=planes(p);
  return clamp(max(max(m.x*.3,m.y*.63),max(m.z*.85,m.w)),0.,1.);
 }
 void main(){
  vec2 uv=uRect.xy+vUV*uRect.zw;
  vec4 m=planes(uv);
  float h=heightAt(uv);
  float shape=texture2D(uSubject,uv).a;
  float zone=max(max(m.x,m.y),max(m.z,m.w));
  float alpha=clamp(shape*zone,0.,1.);
  if(alpha<.008||uDepth<.01){gl_FragColor=vec4(0.);return;}
  // Four independently displaced interior planes, fading at edges.
  float raised=m.x*.003+m.y*.006+m.z*.010+m.w*.014;
  vec2 distortion=uTilt*raised*uDepth;
  vec3 base=texture2D(uImage,uv).rgb;
  vec3 shifted=texture2D(uImage,uv-distortion).rgb;
  vec3 color=mix(base,shifted,h*uDepth);
  float nx=heightAt(uv+vec2(uPixel.x,0.))-heightAt(uv-vec2(uPixel.x,0.));
  float ny=heightAt(uv+vec2(0.,uPixel.y))-heightAt(uv-vec2(0.,uPixel.y));
  vec3 normal=normalize(vec3(-nx*150.,-ny*150.,.85));
  vec3 light=normalize(vec3((uLight.x-.5)*2.2,(uLight.y-.5)*2.2,.9));
  float diffuse=clamp(dot(normal,light),-.8,1.);
  float spec=pow(max(dot(reflect(-light,normal),vec3(0.,0.,1.)),0.),18.);
  color*=1.+diffuse*.32*uDepth;
  color-=vec3(.038,.029,.071)*(1.-diffuse)*h*uDepth;
  vec3 tint=mix(vec3(.24,.79,.99),vec3(1.,.66,.84),uLight.x);
  color+=spec*tint*.51*uDepth*(.4+.6*uFoil);
  float band=pow(max(sin((uv.x+.45*uv.y-.42*uLight.x)*31.),0.),12.);
  color+=tint*band*.13*h*uFoil;
  // The source silhouette remains unchanged; all offsets are internal.
  gl_FragColor=vec4(clamp(color,0.,1.),
    alpha*smoothstep(.05,.34,h)*min(1.,uDepth*1.15));
 }
 `);
 const p=gl.createProgram();gl.attachShader(p,vertex);gl.attachShader(p,fragment);gl.linkProgram(p);
 if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
 gl.deleteShader(vertex);gl.deleteShader(fragment);return p;
}
function makeMask(index){
 const w=original.naturalWidth,h=original.naturalHeight,c=document.createElement('canvas');
 c.width=w;c.height=h;
 const ctx=c.getContext('2d');
 ctx.scale(w/1138,h/1382);
 const zones=[
  [[177,315,280,410,.78],[375,785,265,330,.43]],
  [[551,767,320,405,.96],[711,972,232,270,.64]],
  [[779,362,296,253,1],[661,566,159,252,.65]],
  [[568,1049,240,252,1],[821,1090,185,181,.84],[923,294,140,140,.76]]
 ][index];
 for(const [cx,cy,rx,ry,a] of zones){
  ctx.save();ctx.translate(cx,cy);ctx.scale(rx,ry);
  const g=ctx.createRadialGradient(0,0,0,0,0,1);
  g.addColorStop(0,'rgba(255,255,255,'+a+')');
  g.addColorStop(.42,'rgba(255,255,255,'+(a*.83)+')');
  g.addColorStop(.75,'rgba(255,255,255,'+(a*.35)+')');
  g.addColorStop(1,'rgba(255,255,255,0)');
  ctx.globalCompositeOperation='lighter';ctx.fillStyle=g;ctx.beginPath();
  ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();ctx.restore();
 }
 ctx.setTransform(1,0,0,1,0,0);
 ctx.globalCompositeOperation='destination-in';ctx.drawImage(subject,0,0,w,h);
 return c;
}
function tex(img){
 const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
 gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
 return t;
}
function initialize(){
 gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false})||
    canvas.getContext('experimental-webgl',{alpha:true,antialias:false,premultipliedAlpha:false});
 if(!gl)throw Error('WebGL unsupported');
 program=buildProgram();gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
 gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 const pos=gl.getAttribLocation(program,'aPos');
 gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
 for(const name of ['uRect','uTilt','uLight','uPixel','uDepth','uFoil']) uniforms[name]=gl.getUniformLocation(program,name);
 const images=[original,subject,...[0,1,2,3].map(makeMask)];
 for(let i=0;i<images.length;i++){
  gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,tex(images[i]));
  gl.uniform1i(gl.getUniformLocation(program,['uImage','uSubject','uWing','uBody','uHead','uFront'][i]),i);
 }
 ready=true;art.classList.add('is-webgl');
 status.textContent='V4 expérimentale : 4 volumes actifs, décor immobile';drawSoon();
}
function drawSoon(){if(ready&&!hidden&&!frame)frame=requestAnimationFrame(draw)}
function draw(){
 frame=0;if(!ready||hidden)return;
 const w=art.clientWidth,h=art.clientHeight;if(!w||!h)return;
 const ratio=Math.min(devicePixelRatio||1,2);
 const cw=Math.max(2,Math.round(w*ratio)),ch=Math.max(2,Math.round(h*ratio));
 if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}
 gl.viewport(0,0,cw,ch);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
 const iw=original.naturalWidth,ih=original.naturalHeight,cover=Math.max(w/iw,h/ih);
 const vw=w/(cover*iw),vh=h/(cover*ih),left=(1-vw)*.5,top=(1-vh)*.45;
 gl.uniform4f(uniforms.uRect,left,1-top-vh,vw,vh);
 gl.uniform2f(uniforms.uTilt,smallMotion?0:(x-.5)*2,smallMotion?0:(y-.5)*2);
 gl.uniform2f(uniforms.uLight,x,1-y);
 gl.uniform2f(uniforms.uPixel,1/iw,1/ih);
 gl.uniform1f(uniforms.uDepth,Number(depth.value)/100);
 gl.uniform1f(uniforms.uFoil,Number(foil.value)/100);
 gl.drawArrays(gl.TRIANGLES,0,6);
}
function handle(e){
 if(gyro)return;const r=card.getBoundingClientRect();
 x=clamp((e.clientX-r.left)/r.width,0,1);
 y=clamp((e.clientY-r.top)/r.height,0,1);drawSoon();
}
card.addEventListener('pointerdown',handle,{passive:true});
card.addEventListener('pointermove',handle,{passive:true});
card.addEventListener('pointerleave',e=>{if(!gyro&&e.pointerType==='mouse'){x=.5;y=.5;drawSoon()}});
card.addEventListener('keydown',e=>{
 const d={ArrowLeft:[-.08,0],ArrowRight:[.08,0],ArrowUp:[0,-.08],ArrowDown:[0,.08]}[e.key];
 if(!d)return;x=clamp(x+d[0],0,1);y=clamp(y+d[1],0,1);drawSoon();
});
depth.addEventListener('input',drawSoon);foil.addEventListener('input',drawSoon);
document.querySelector('#reset')?.addEventListener('click',()=>{x=.5;y=.5;gyro=false;drawSoon()});
document.querySelector('#tilt')?.addEventListener('click',()=>{
 const btn=document.querySelector('#tilt');
 gyro=!!btn&&btn.textContent.includes('Désactiver');
});
window.addEventListener('deviceorientation',e=>{
 if(!gyro||e.gamma==null||e.beta==null)return;
 x=clamp(.5+e.gamma/80,.03,.97);y=clamp(.5+(e.beta-35)/100,.03,.97);drawSoon();
},{passive:true});
document.addEventListener('visibilitychange',()=>{hidden=document.hidden;if(!hidden)drawSoon()});
window.addEventListener('resize',drawSoon,{passive:true});
if('ResizeObserver' in window)new ResizeObserver(drawSoon).observe(art);
canvas.addEventListener('webglcontextlost',e=>{
 e.preventDefault();ready=false;art.classList.remove('is-webgl');
 status.textContent='Accélération graphique interrompue : illustration originale conservée';
});
canvas.addEventListener('webglcontextrestored',()=>{try{initialize()}catch(e){console.warn(e)}});
Promise.all([load(original),load(subject)]).then(()=>{
 try{initialize()}catch(e){
  console.warn('Aetherium V4 fallback:',e);
  status.textContent='WebGL indisponible : holographie classique conservée';
 }
}).catch(()=>{status.textContent='Textures indisponibles : illustration originale conservée'});
})();