/* Aetherium holography V4.3: single opaque composite, no transparent duplicate of the source image.
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
 uniform vec4 uRect;
 uniform vec2 uTilt,uLight,uPixel;
 uniform float uDepth,uFoil;
 vec4 plates(vec2 p){
   return vec4(texture2D(uWing,p).a,texture2D(uBody,p).a,
     texture2D(uHead,p).a,texture2D(uFront,p).a);
 }
 void main(){
   vec2 uv=uRect.xy+vUV*uRect.zw;
   float originalSilhouette=texture2D(uSubject,uv).a;
   vec4 m=plates(uv);
   float visible=max(max(m.x,m.y),max(m.z,m.w))*originalSilhouette;
   // Paint an entire opaque frame, including the unmodified landscape.
   // Earlier V4 versions painted transparent, shifted portions of the dragon
   // over the still-visible original, producing doubled claws and horns.
   // One composite image eliminates that second underlying contour entirely.
   if(visible<.005||uDepth<.01){
     gl_FragColor=vec4(texture2D(uImage,uv).rgb,1.0);
     return;
   }
   // V4.2: keep the complete original horn, snout and jaw outlines.
   // Distance-like safety matte: if ANY neighbour falls outside the original
   // dragon at 22px, this point cannot parallax. Thus thin spikes stay intact.
   vec2 safe22=uPixel*22.0;
   float core=min(
     min(texture2D(uSubject,uv+vec2(safe22.x,0.0)).a,
         texture2D(uSubject,uv-vec2(safe22.x,0.0)).a),
     min(texture2D(uSubject,uv+vec2(0.0,safe22.y)).a,
         texture2D(uSubject,uv-vec2(0.0,safe22.y)).a)
   );
   core=min(core,min(
     min(texture2D(uSubject,uv+safe22*.72).a,
         texture2D(uSubject,uv-safe22*.72).a),
     min(texture2D(uSubject,uv+safe22*vec2(.72,-.72)).a,
         texture2D(uSubject,uv+safe22*vec2(-.72,.72)).a)
   ));
   // Horns, snout and mouth are more sensitive: a 38px protected rim.
   // The head mask also fades out at its own anatomical seam.
   vec2 headStep=uPixel*38.0;
   float headCore=min(
     min(texture2D(uSubject,uv+vec2(headStep.x,0.0)).a,
         texture2D(uSubject,uv-vec2(headStep.x,0.0)).a),
     min(texture2D(uSubject,uv+vec2(0.0,headStep.y)).a,
         texture2D(uSubject,uv-vec2(0.0,headStep.y)).a)
   );
   vec2 headSeam=uPixel*17.0;
   float headPlate=min(
     min(texture2D(uHead,uv+vec2(headSeam.x,0.0)).a,
         texture2D(uHead,uv-vec2(headSeam.x,0.0)).a),
     min(texture2D(uHead,uv+vec2(0.0,headSeam.y)).a,
         texture2D(uHead,uv-vec2(0.0,headSeam.y)).a)
   );
   float headWeight=smoothstep(.08,.55,m.z);
   float contourSafety=mix(smoothstep(.55,.98,core),
                           smoothstep(.65,.99,headCore),headWeight);
   float seamSafety=mix(1.0,smoothstep(.32,.85,headPlate),headWeight);
   float safeInterior=clamp(contourSafety*seamSafety,0.0,1.0);
   // FLAT, rigid foreground plates. No radial height field, no normals:
   // texture sampling moves as a unit for each anatomical part, never bulges.
   vec2 travel=uTilt*uDepth;
   vec3 painted=texture2D(uImage,uv).rgb;
   vec3 wing=texture2D(uImage,uv-travel*.0024).rgb;
   vec3 body=texture2D(uImage,uv-travel*.0058).rgb;
   vec3 head=texture2D(uImage,uv-travel*.0090).rgb;
   vec3 claws=texture2D(uImage,uv-travel*.0120).rgb;
   vec3 result=painted;
   result=mix(result,wing,m.x*.88);
   result=mix(result,body,m.y*.9);
   result=mix(result,head,m.z*.94);
   result=mix(result,claws,m.w*.98);
   // Directional *edge* shadows make each plate read as an overlapping
   // rigid plane. No moving spotlights or swelling normal maps.
   vec2 seam=vec2(uPixel.x*11.,-uPixel.y*10.);
   vec4 edgeFromLight=plates(uv+seam);
   vec4 edgeAgainstLight=plates(uv-seam);
   float shade=clamp(
      max(edgeFromLight.w-m.w,0.)*.85+
      max(edgeFromLight.z-m.z,0.)*.60+
      max(edgeFromLight.y-m.y,0.)*.40,0.,1.);
   float highlight=clamp(
      max(m.w-edgeAgainstLight.w,0.)*.90+
      max(m.z-edgeAgainstLight.z,0.)*.55+
      max(m.y-edgeAgainstLight.y,0.)*.32,0.,1.);
   result*=1.-shade*uDepth*.34;
   result+=vec3(.19,.39,.43)*highlight*uDepth*.32;
   // Foil stays subtle; it is not used as a replacement for separation.
   result+=vec3(.14,.28,.31)*highlight*uFoil*uDepth*.13;
   // A single full-frame source/refracted mix: no semi-transparent second
   // image can create ghost contours over claws, horns or muzzle.
   float blend=clamp(visible*safeInterior,0.0,1.0);
   result=mix(painted,result,blend);
   gl_FragColor=vec4(clamp(result,0.,1.),1.0);
 }
 `);;
 const p=gl.createProgram();gl.attachShader(p,vertex);gl.attachShader(p,fragment);gl.linkProgram(p);
 if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
 gl.deleteShader(vertex);gl.deleteShader(fragment);return p;
}
function makeMask(index){
 // Four broad anatomical silhouettes, not Gaussian radial bumps.
 // Feather their overlap to avoid hard seams but preserve rigid motion.
 const w=original.naturalWidth,h=original.naturalHeight;
 const c=document.createElement('canvas');c.width=w;c.height=h;
 const shapes=document.createElement('canvas');shapes.width=w;shapes.height=h;
 const ctx=shapes.getContext('2d');
 ctx.scale(w/1138,h/1382);
 const polygons=[
  [ // rear wings and far-away membrane
    [[0,86],[106,78],[240,60],[343,32],[430,76],[350,119],[286,182],[237,277],[215,402],[244,472],[317,579],[434,687],[386,760],[264,755],[139,724],[70,700],[0,746]],
    [[0,628],[80,541],[168,490],[258,540],[358,614],[439,693],[386,748],[245,751],[109,738],[0,776]]
  ],
  [ // rib cage, armored torso and spinal column
    [[314,444],[392,377],[475,323],[572,327],[650,355],[697,438],[778,549],[848,684],[894,836],[944,1055],[862,1160],[753,1206],[593,1177],[417,1100],[290,942],[244,790],[287,603]],
    [[441,631],[563,638],[689,727],[779,860],[835,1036],[754,1130],[624,1088],[496,976],[404,810]]
  ],
  [ // elevated neck, crests, head and open jaws
    [[336,171],[414,168],[463,30],[495,129],[594,167],[651,117],[716,160],[764,162],[828,192],[921,197],[1001,218],[1043,258],[1021,312],[962,338],[938,380],[973,422],[952,477],[916,475],[876,440],[843,451],[774,479],[719,537],[635,604],[535,666],[435,630],[340,543],[303,444],[361,362],[393,289]]
  ],
  [ // closest forearm, talons and shoulder plating
    [[250,699],[370,685],[464,706],[547,748],[609,844],[636,940],[627,1040],[705,1061],[763,1114],[844,1120],[863,1265],[786,1281],[743,1210],[704,1169],[693,1269],[613,1300],[585,1188],[535,1136],[517,1278],[450,1276],[423,1180],[331,1175],[257,1191],[164,1168],[111,1126],[142,1003],[216,931],[202,835]]
  ]
 ][index];
 ctx.fillStyle='#fff';ctx.lineJoin='round';
 for(const polygon of polygons){
   ctx.beginPath();
   polygon.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
   ctx.closePath();ctx.fill();
 }
 const dest=c.getContext('2d');
 // The feather softens seams between rigid plates only.
 dest.filter='blur(7px)';
 dest.drawImage(shapes,0,0);
 dest.filter='none';
 dest.globalCompositeOperation='destination-in';
 dest.drawImage(subject,0,0,w,h);
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
 status.textContent='V4.3 : rendu unique sans doublon · décor et contours intacts';drawSoon();
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