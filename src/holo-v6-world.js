/* AETHERIUM V6 — newly painted pixel-art scenery and true stacked parallax.
 * The three planes are drawn independently; no texture is inpainted or
 * copied out of the dragon, and Vyrath's artwork remains 100% stationary.
 */
(() => {
  'use strict';
  const card=document.querySelector('#card');
  const art=document.querySelector('.art');
  const canvas=document.querySelector('#world-canvas');
  const depth=document.querySelector('#depth');
  const intensity=document.querySelector('#intensity');
  const status=document.querySelector('#status');
  if(!card||!art||!canvas||!depth||!intensity||!status)return;
  const original=new Image(), dragon=new Image();
  original.src='./assets/cards/vyrath-fleau-celeste.webp';
  dragon.src='./assets/cards/holo/vyrath/subject.webp';
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W=1138,H=1382, clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  let gl,program,locations={},ready=false,raf=0,x=.5,y=.5,gyro=false,hidden=false;
  let seed=537119;
  const rand=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
  const choose=a=>a[Math.floor(rand()*a.length)];
  function makeCanvas(){
    const c=document.createElement('canvas');c.width=W;c.height=H;return c;
  }
  function poly(ctx,points,fill){
    ctx.fillStyle=fill;ctx.beginPath();
    points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
    ctx.closePath();ctx.fill();
  }
  function rect(ctx,x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))}
  function chain(ctx,x,y,len,color,thick=3){
    ctx.strokeStyle=color;ctx.lineWidth=thick;ctx.beginPath();ctx.moveTo(x,y);
    ctx.lineTo(x-8,y+len*.42);ctx.lineTo(x+3,y+len);ctx.stroke();
  }
  function cloud(ctx,x,y,s=1,opacity=.7){
    ctx.save();ctx.globalAlpha=opacity;
    const bands=['#321d6d','#573297','#9352b5','#e08bd9','#cf8ce2'];
    const bx=[[-142,8,95,45],[-82,-22,144,72],[-15,-43,120,82],[64,-5,120,46],[138,14,88,30]];
    bands.forEach((color,j)=>{
      const dy=j*7;
      bx.forEach(([dx,yy,w,h],i)=>{
        rect(ctx,x+dx*s,y+(yy+dy)*s,w*s,(h-j*7)*s,color);
      });
    });
    ctx.restore();
  }
  function moon(ctx){
    const cx=906,cy=174,r=175;
    const outer=ctx.createRadialGradient(cx,cy,r*.58,cx,cy,r*1.36);
    outer.addColorStop(0,'#fbdfc22f');outer.addColorStop(.5,'#f7a8d249');outer.addColorStop(1,'#f8b4f500');
    ctx.fillStyle=outer;ctx.beginPath();ctx.arc(cx,cy,r*1.36,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#f0b4e9';ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ffeeb5';ctx.beginPath();ctx.arc(cx-7,cy-7,r-4,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.beginPath();ctx.arc(cx-7,cy-7,r-4,0,Math.PI*2);ctx.clip();
    for(let i=0;i<125;i++){
      const xx=cx+(rand()-.5)*r*2,yy=cy+(rand()-.5)*r*2;
      const size=5+rand()*25;
      rect(ctx,xx,yy,size,size*.55,choose(['#f7a5c9','#d29add','#fce1b5','#ffd6aa','#df8ec6']));
    }
    ctx.restore();
    ctx.strokeStyle='#fff3c1';ctx.lineWidth=7;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle='#fc8ddc';ctx.lineWidth=4;ctx.beginPath();ctx.arc(cx,cy,r+8,-.3,Math.PI*1.6);ctx.stroke();
  }
  function star(ctx,x,y,r,shine=true){
    ctx.fillStyle=shine?'#ffe6a8':'#a7c8ff';
    rect(ctx,x-r,y,2*r+1,1.5);
    rect(ctx,x,y-r,1.5,2*r+1);
    if(shine&&r>5){
      ctx.fillStyle='#fff9ed';rect(ctx,x-2,y-2,5,5);
    }
  }
  function drawSky(){
    seed=73621;
    const c=makeCanvas(),ctx=c.getContext('2d');
    const grad=ctx.createLinearGradient(0,0,0,H);
    grad.addColorStop(0,'#080d30');grad.addColorStop(.29,'#24185b');
    grad.addColorStop(.62,'#5b358c');grad.addColorStop(.85,'#8551b6');
    grad.addColorStop(1,'#8f69c1');
    ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
    for(let i=0;i<180;i++){
      let xx=rand()*W, yy=rand()*H*.95;
      rect(ctx,xx,yy,8+rand()*25,1+rand()*4,choose(['#493489','#3c2c84','#7557b3','#7c52a5']));
    }
    // Sweeping astral streaks behind the independently drawn castles.
    for(let i=0;i<5;i++){
      ctx.strokeStyle=choose(['#8553ca70','#8ed9f048','#dc80df50','#ffaaac45']);
      ctx.lineWidth=5+i*4;ctx.beginPath();
      ctx.moveTo(-140,i*120+110);ctx.bezierCurveTo(260,115+i*130,560,680-i*60,1230,i*112+380);ctx.stroke();
    }
    for(let i=0;i<280;i++){
      const xx=rand()*W,yy=rand()*H*.87;
      if(Math.hypot(xx-906,yy-174)<180)continue;
      star(ctx,xx,yy,rand()<.15?3+rand()*5:1+rand()*1.3,rand()>.4);
    }
    moon(ctx);
    cloud(ctx,65,475,1.5,.48);cloud(ctx,410,556,1.6,.43);
    cloud(ctx,1017,401,1.35,.68);cloud(ctx,998,898,1.85,.53);
    cloud(ctx,206,1042,2,.62);cloud(ctx,735,1170,2.1,.65);
    for(let i=0;i<14;i++)star(ctx,90+rand()*980,140+rand()*600,6+rand()*12);
    return c;
  }
  function spire(ctx,x,top,height){
    rect(ctx,x-7,top,16,height,'#352054');
    poly(ctx,[[x-13,top+4],[x,top-29],[x+14,top+4]],'#f9cb7a');
    rect(ctx,x-10,top+12,21,7,'#b484ac');
    rect(ctx,x-3,top+36,4,11,'#f5d58d');
  }
  function floatingIsland(ctx,x,y,scale=1,detail=1){
    ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
    poly(ctx,[[-136,0],[-96,-29],[11,-18],[130,-27],[150,8],[98,38],
      [54,72],[16,123],[-42,93],[-90,59]],'#251845');
    poly(ctx,[[-136,-5],[-92,-36],[20,-28],[129,-35],[151,-6],[77,9],[-53,7]],'#5a3b72');
    poly(ctx,[[-133,-9],[-90,-34],[27,-31],[136,-33],[125,-19],[-93,-13]],'#d9a66d');
    for(let i=0;i<17;i++){
      const xx=-102+i*14;
      rect(ctx,xx,-26+rand()*12,7,5,choose(['#dfb979','#9775a8','#8bb2ba']));
    }
    // Collapsed arcaded temple walls with pixel-sharp cutouts.
    rect(ctx,-76,-95,156,65,'#352351');
    for(let j=0;j<4;j++){
      const a=-67+j*38;
      rect(ctx,a,-81,20,47,'#7c5a93');
      rect(ctx,a+4,-68,12,35,'#1b1944');
      rect(ctx,a-3,-90,24,7,'#d3b18e');
    }
    rect(ctx,-91,-105,191,10,'#baa17f');
    rect(ctx,-89,-110,187,5,'#f5d99e');
    for(let j=0;j<5;j++)spire(ctx,-76+j*37,-111-(j%2)*24,25+(j%2)*24);
    if(detail){
      ctx.strokeStyle='#6ae4e8';ctx.lineWidth=5;
      for(let j=0;j<4;j++){
        const wx=-63+j*38;
        ctx.beginPath();ctx.moveTo(wx,-11);ctx.bezierCurveTo(wx+2,60,wx-12,96,wx+3,164);ctx.stroke();
        rect(ctx,wx+2,25,2,115,'#b9f9fa');
      }
    }
    for(let j=0;j<6;j++)chain(ctx,-93+j*39,13,25+rand()*80,'#947eb1',2);
    ctx.restore();
  }
  function drawRuins(){
    seed=238421;
    const c=makeCanvas(),ctx=c.getContext('2d');
    // Natural far-mid cloud decks avoid a cutout-like horizon.
    cloud(ctx,1092,733,1.25,.6);
    cloud(ctx,120,878,.92,.4);
    floatingIsland(ctx,1040,619,.78,1);
    floatingIsland(ctx,1001,878,1.08,1);
    floatingIsland(ctx,122,966,.66,0);
    floatingIsland(ctx,908,1084,.72,1);
    for(let i=0;i<19;i++){
      const yy=475+i*42,xx=1120+(i%2)*8;
      rect(ctx,xx,yy,8,24,choose(['#61bad8','#8ff2f7','#bbfcff']));
    }
    for(let i=0;i<24;i++){
      const xx=815+rand()*340,yy=550+rand()*610;
      if(rand()<.5)star(ctx,xx,yy,2+rand()*4,false);
    }
    return c;
  }
  function petals(ctx,x,y,size=15){
    for(let p=0;p<6;p++){
      const a=(p/6)*Math.PI*2;
      ctx.save();ctx.translate(x,y);ctx.rotate(a);
      poly(ctx,[[0,-3],[-size*.54,-size*1.5],[0,-size*2],[size*.54,-size*1.5]],
        choose(['#f4a9ec','#f8d0ef','#ba8be8','#e888e4']));
      ctx.restore();
    }
    rect(ctx,x-3,y-3,7,7,'#fff5a6');
  }
  function crystal(ctx,x,y,h){
    poly(ctx,[[x-13,y],[x-9,y-h*.79],[x,y-h],[x+11,y-h*.69],[x+17,y]],'#6e4bba');
    poly(ctx,[[x-9,y-h*.79],[x,y-h],[x,y]],'#c57bff');
    poly(ctx,[[x,y-h],[x+11,y-h*.69],[x,y]],'#9af0f6');
    rect(ctx,x,y-h*.65,3,h*.51,'#f2ddff');
  }
  function drawNear(){
    seed=811311;
    const c=makeCanvas(),ctx=c.getContext('2d');
    // Foreground foreground ruins/flowers: completely independent of castles.
    poly(ctx,[[0,1123],[69,1081],[130,1113],[208,1113],[255,1197],
      [322,1225],[434,1290],[435,H],[0,H]],'#1c1941');
    poly(ctx,[[0,1128],[73,1086],[139,1118],[211,1116],[265,1202],
      [348,1241],[432,1298],[424,1314],[277,1233],[207,1133],[103,1124],[0,1149]],
      '#c49a70');
    poly(ctx,[[765,H],[793,1276],[882,1189],[956,1181],[1013,1146],
      [1138,1089],[1138,H]],'#1e1741');
    poly(ctx,[[769,H],[797,1283],[886,1201],[964,1194],[1024,1162],[1138,1100],
      [1138,1118],[1022,1179],[956,1210],[881,1213],[812,1301]],'#b89c8d');
    for(let i=0;i<16;i++){
      const xx=rand()*315,yy=1170+rand()*205;
      crystal(ctx,xx,yy,25+rand()*86);
    }
    for(let i=0;i<13;i++){
      const xx=830+rand()*310,yy=1220+rand()*170;
      crystal(ctx,xx,yy,27+rand()*71);
    }
    for(let i=0;i<9;i++){
      const xx=40+rand()*335,yy=1240+rand()*142;
      petals(ctx,xx,yy,8+rand()*8);
    }
    for(let i=0;i<7;i++){
      const xx=820+rand()*310,yy=1250+rand()*130;
      petals(ctx,xx,yy,8+rand()*6);
    }
    for(let i=0;i<100;i++){
      const xx=rand()*W, yy=1040+rand()*342;
      if(rand()<.6)rect(ctx,xx,yy,2+rand()*3,2+rand()*3,
        choose(['#ad75d9','#e5c58d','#8b8cd2','#8ce0ef']));
    }
    return c;
  }
  function compile(type,body){
    const sh=gl.createShader(type);gl.shaderSource(sh,body);gl.compileShader(sh);
    if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));
    return sh;
  }
  function makeProgram(){
    const vertex=compile(gl.VERTEX_SHADER,`
      attribute vec2 aPos;
      varying vec2 vUv;
      void main(){vUv=(aPos+1.)*.5;gl_Position=vec4(aPos,0.,1.);}
    `);
    const fragment=compile(gl.FRAGMENT_SHADER,`
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uOriginal,uDragon,uSky,uRuins,uNear;
      uniform vec4 uRect;
      uniform vec2 uTilt,uPixel;
      uniform float uDepth,uHolo;
      float dragonAt(vec2 p){return texture2D(uDragon,clamp(p,0.,1.)).a;}
      void main(){
        vec2 uv=uRect.xy+vUv*uRect.zw;
        vec3 intact=texture2D(uOriginal,uv).rgb;
        // The source is left completely untouched in and around the dragon.
        // Expand by 13px to retain the original colored glints on horn edges.
        vec2 pad=uPixel*13.;
        float creature=dragonAt(uv);
        creature=max(creature,max(
          max(dragonAt(uv+vec2(pad.x,0.)),dragonAt(uv-vec2(pad.x,0.))),
          max(dragonAt(uv+vec2(0.,pad.y)),dragonAt(uv-vec2(0.,pad.y)))
        ));
        creature=max(creature,max(dragonAt(uv+pad*.7),dragonAt(uv-pad*.7)));
        float keep=smoothstep(.04,.91,creature);
        // Newly illustrated scene planes: actual independent parallax.
        // No inpainting, no transformed copy of Vyrath.
        vec2 tilt=clamp(uTilt,-1.,1.)*uDepth;
        vec3 sky=texture2D(uSky,uv+tilt*.004).rgb;
        vec4 ruins=texture2D(uRuins,uv-tilt*.016);
        vec4 nearPlane=texture2D(uNear,uv-tilt*.031);
        vec3 world=mix(sky,ruins.rgb,clamp(ruins.a,0.,1.));
        world=mix(world,nearPlane.rgb,clamp(nearPlane.a,0.,1.));
        float halo=max(ruins.a,nearPlane.a);
        // A restrained iridescent undertone INSIDE the new scenery only.
        vec3 tint=mix(vec3(.25,.14,.40),vec3(.05,.25,.30),
          clamp(uTilt.x*.5+.5,0.,1.));
        world+=tint*halo*uHolo*.035;
        gl_FragColor=vec4(mix(world,intact,keep),1.);
      }
    `);
    const p=gl.createProgram();gl.attachShader(p,vertex);gl.attachShader(p,fragment);
    gl.linkProgram(p);gl.deleteShader(vertex);gl.deleteShader(fragment);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
    return p;
  }
  function tex(img,clampMode=true){
    const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
    return t;
  }
  function initialize(){
    gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false})||
      canvas.getContext('experimental-webgl',{alpha:true,antialias:false,premultipliedAlpha:false});
    if(!gl)throw Error('WebGL indisponible');
    program=makeProgram();gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const pos=gl.getAttribLocation(program,'aPos');
    gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
    ['uRect','uPixel','uTilt','uDepth','uHolo'].forEach(k=>locations[k]=gl.getUniformLocation(program,k));
    const images=[original,dragon,drawSky(),drawRuins(),drawNear()];
    images.forEach((img,i)=>{
      gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,tex(img));
      gl.uniform1i(gl.getUniformLocation(program,
        ['uOriginal','uDragon','uSky','uRuins','uNear'][i]),i);
    });
    ready=true;art.classList.add('is-world');
    status.textContent='V6 : trois plans redessinés · Vyrath fixe · monde en profondeur';
    schedule();
  }
  function schedule(){if(ready&&!hidden&&!raf)raf=requestAnimationFrame(draw)}
  function draw(){
    raf=0;if(!ready||hidden)return;
    const w=art.clientWidth,h=art.clientHeight;if(!w||!h)return;
    const ratio=Math.min(devicePixelRatio||1,2);
    const width=Math.max(2,Math.round(w*ratio)),height=Math.max(2,Math.round(h*ratio));
    if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
    gl.viewport(0,0,width,height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    const iw=original.naturalWidth,ih=original.naturalHeight;
    const fit=Math.max(w/iw,h/ih),vw=w/(fit*iw),vh=h/(fit*ih);
    const left=(1-vw)*.5,top=(1-vh)*.45;
    gl.uniform4f(locations.uRect,left,1-top-vh,vw,vh);
    gl.uniform2f(locations.uPixel,1/iw,1/ih);
    gl.uniform2f(locations.uTilt,reduce?0:(x-.5)*2,reduce?0:(.5-y)*2);
    gl.uniform1f(locations.uDepth,Number(depth.value)/100);
    gl.uniform1f(locations.uHolo,Number(intensity.value)/100);
    gl.drawArrays(gl.TRIANGLES,0,6);
  }
  function onPoint(e){
    if(gyro)return;
    const b=card.getBoundingClientRect();
    x=clamp((e.clientX-b.left)/b.width,0,1);
    y=clamp((e.clientY-b.top)/b.height,0,1);schedule();
  }
  card.addEventListener('pointermove',onPoint,{passive:true});
  card.addEventListener('pointerdown',onPoint,{passive:true});
  card.addEventListener('pointerleave',e=>{
    if(!gyro&&e.pointerType==='mouse'){x=.5;y=.5;schedule()}
  });
  card.addEventListener('keydown',e=>{
    const d={ArrowLeft:[-.08,0],ArrowRight:[.08,0],ArrowUp:[0,-.08],ArrowDown:[0,.08]}[e.key];
    if(!d)return;
    e.preventDefault();x=clamp(x+d[0],0,1);y=clamp(y+d[1],0,1);schedule();
  });
  depth.addEventListener('input',schedule);
  intensity.addEventListener('input',schedule);
  document.querySelector('#reset')?.addEventListener('click',()=>{x=.5;y=.5;gyro=false;schedule()});
  document.querySelector('#tilt')?.addEventListener('click',()=>{
    gyro=String(document.querySelector('#tilt').textContent).includes('Désactiver');
  });
  window.addEventListener('deviceorientation',e=>{
    if(!gyro||e.gamma==null||e.beta==null)return;
    x=clamp(.5+e.gamma/80,.03,.97);y=clamp(.5+(e.beta-35)/100,.03,.97);schedule();
  },{passive:true});
  document.addEventListener('visibilitychange',()=>{hidden=document.hidden;if(!hidden)schedule()});
  window.addEventListener('resize',schedule,{passive:true});
  if('ResizeObserver' in window)new ResizeObserver(schedule).observe(art);
  canvas.addEventListener('webglcontextlost',e=>{
    e.preventDefault();ready=false;art.classList.remove('is-world');
    status.textContent='Accélération graphique interrompue : illustration originale conservée';
  });
  canvas.addEventListener('webglcontextrestored',()=>{try{initialize()}catch(e){console.warn(e)}});
  const load=img=>new Promise((ok,fail)=>{
    if(img.complete)return img.naturalWidth?ok():fail(Error('Image manquante'));
    img.addEventListener('load',ok,{once:true});
    img.addEventListener('error',fail,{once:true});
  });
  Promise.all([load(original),load(dragon)]).then(()=>{
    try{initialize()}catch(e){
      console.warn('Aetherium V6 fallback',e);
      status.textContent='Mode 3D indisponible : illustration originale conservée';
    }
  }).catch(()=>{status.textContent='Textures indisponibles : illustration originale conservée'});
})();