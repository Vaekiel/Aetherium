/* AETHERIUM V6.1 — detailed pixel-art scenery with three preserved parallax planes.
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
    // Fine pixelated halos and astral runes restore the original HD density.
    // These never intersect foreground masks or use a movable dragon copy.
    for(let i=0;i<26;i++){
      const x=rand()*W,y=rand()*H*.68;
      if(Math.hypot(x-906,y-174)<204)continue;
      const s=4+rand()*13;
      rect(ctx,x,y,2+s,2,'#bd8deaa6');
      rect(ctx,x+s/2,y-s/2,2,s,'#77c6f2a6');
      if(rand()<.42)rect(ctx,x-s*.4,y+3,s*.5,2,'#ca93d0');
    }
    for(let i=0;i<14;i++)star(ctx,90+rand()*980,140+rand()*600,6+rand()*12);
    return c;
  }

  // V6.1 material helpers: these add painted detail to each scene plane
  // without changing the number of layers or their depth coefficients.
  function pixelStroke(ctx,points,color,step=4,size=2){
    for(let i=1;i<points.length;i++){
      const [x0,y0]=points[i-1],[x1,y1]=points[i];
      const length=Math.hypot(x1-x0,y1-y0);
      for(let t=0;t<=length;t+=step){
        const p=t/Math.max(length,1);
        rect(ctx,x0+(x1-x0)*p,y0+(y1-y0)*p,size,size,color);
      }
    }
  }
  function stonemasonry(ctx,x,y,w,h){
    ctx.save();
    ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
    const rowH=9;
    for(let row=0;row<Math.ceil(h/rowH);row++){
      const yy=y+row*rowH;
      const drift=(row%2)*13;
      rect(ctx,x,yy,w,1,'#a589aa');
      for(let xx=x-drift;xx<x+w;xx+=23){
        const xx2=xx+drift;
        rect(ctx,xx2,yy+2,2,rowH-3,'#291c4b');
        rect(ctx,xx2+3,yy+3,9,1,choose(['#aa8ba8','#bfa0a7','#88669b']));
        if(rand()<.24)rect(ctx,xx2+12,yy+5,5,1,'#67518b');
      }
    }
    ctx.restore();
  }
  function fallingWater(ctx,x,y,len,width=9){
    ctx.save();
    // Layered cyan pixel ribbons, bounded by rough rock edges.
    for(let col=0;col<width;col+=3){
      const xx=x+col;
      let yy=y;
      const shade=choose(['#4e8fce','#66caf0','#8decf3','#aef6fe']);
      while(yy<y+len){
        const dy=7+Math.floor(rand()*20);
        rect(ctx,xx+Math.sin((yy-y)/37)*5,yy,3,dy,shade);
        if(rand()<.46)rect(ctx,xx+2,yy+5,2,dy*.47,'#dcffff');
        yy+=dy+Math.floor(rand()*6);
      }
    }
    for(let i=0;i<14;i++){
      const xx=x+(rand()-.5)*(width+28), yy=y+len+(rand()-.5)*19;
      rect(ctx,xx,yy,1+rand()*4,2+rand()*3,choose(['#9af0fd','#d8faff','#85d6eb']));
    }
    ctx.restore();
  }
  function ivy(ctx,x,y,drop){
    const leaf=['#1b5367','#3e807c','#5a9c83','#8ec4a8'];
    for(let d=0;d<drop;d+=7){
      const xx=x+Math.sin(d*.18)*8;
      rect(ctx,xx,y+d,2,5,'#45755e');
      if(rand()>.2)rect(ctx,xx+(d%2?3:-5),y+d,4+rand()*3,3,choose(leaf));
    }
  }
  function stoneFracture(ctx,x,y,len){
    const pts=[[x,y],[x+len*.36,y+len*.28],[x+len*.16,y+len*.67],[x+len*.62,y+len]];
    pixelStroke(ctx,pts,'#221939',3,2);
    pixelStroke(ctx,pts.map(([a,b])=>[a+2,b]),'#8a739b',8,1);
  }
  function cliffDetail(ctx,x,y,width,height){
    for(let i=0;i<36;i++){
      const xx=x+rand()*width,yy=y+rand()*height;
      rect(ctx,xx,yy,4+rand()*13,2+rand()*4,
        choose(['#3a285f','#41366e','#68517a','#a98f94','#d0a77c']));
      if(rand()<.32)stoneFracture(ctx,xx,yy,6+rand()*13);
    }
  }
  function spire(ctx,x,top,height){
    rect(ctx,x-7,top,16,height,'#352054');
    poly(ctx,[[x-13,top+4],[x,top-29],[x+14,top+4]],'#f9cb7a');
    rect(ctx,x-10,top+12,21,7,'#b484ac');
    rect(ctx,x-3,top+36,4,11,'#f5d58d');
    rect(ctx,x-5,top+35,2,15,'#907099');
    rect(ctx,x-2,top-18,3,8,'#fff3ae');
    rect(ctx,x-9,top+7,3,6,'#e7a966');
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
    cliffDetail(ctx,-115,7,235,91);
    // Golden seam along the ancient floating-rock rim.
    pixelStroke(ctx,[[-132,-8],[-98,-34],[20,-30],[134,-33],[152,-4]],
      '#ffdd95',3,2);
    // Collapsed arcaded temple walls with pixel-sharp cutouts.
    rect(ctx,-76,-95,156,65,'#352351');
    stonemasonry(ctx,-76,-95,156,65);
    for(let j=0;j<4;j++){
      const a=-67+j*38;
      rect(ctx,a,-81,20,47,'#7c5a93');
      rect(ctx,a+4,-68,12,35,'#1b1944');
      rect(ctx,a-3,-90,24,7,'#d3b18e');
      rect(ctx,a+5,-64,9,3,'#94def0');
      rect(ctx,a+8,-57,4,8,'#ffe49e');
      rect(ctx,a+2,-35,18,3,'#3b285c');
    }
    rect(ctx,-91,-105,191,10,'#baa17f');
    rect(ctx,-89,-110,187,5,'#f5d99e');
    for(let j=0;j<5;j++)spire(ctx,-76+j*37,-111-(j%2)*24,25+(j%2)*24);
    if(detail){
      for(let j=0;j<4;j++){
        const wx=-63+j*38;
        fallingWater(ctx,wx,-11,145+(j%2)*28,6+(j%3)*2);
      }
    }
    for(let j=0;j<6;j++){
      chain(ctx,-93+j*39,13,25+rand()*80,'#947eb1',2);
      if(j%2===0)ivy(ctx,-84+j*35,-10,48+rand()*37);
    }
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
    // Loose masonry fragments, suspended by the same antigravity magic
    // as the islands. They travel with the midground, not the starfield.
    for(let i=0;i<38;i++){
      const xx=792+rand()*344,yy=491+rand()*719;
      const width=2+rand()*14,height=3+rand()*9;
      poly(ctx,[[xx,yy],[xx+width,yy-3],[xx+width*1.2,yy+height*.7],
        [xx+width*.45,yy+height]],choose(['#85689e','#c39aaa','#6c5793','#49396b']));
      if(rand()<.45)rect(ctx,xx+width*.33,yy,Math.max(2,width*.36),2,'#e4c28d');
    }
    // Waterfall mist stays on this plane; no blur/no reconstructed background.
    for(let i=0;i<75;i++){
      const xx=834+rand()*308,yy=739+rand()*459;
      rect(ctx,xx,yy,3+rand()*9,1+rand()*4,
        choose(['#5b7ec367','#83dded80','#cba4f470']));
    }
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
    rect(ctx,x-1,y-1,3,3,'#ffda75');
    for(let p=0;p<4;p++){
      const a=(p/4)*Math.PI*2;
      const dx=Math.cos(a)*size*1.3,dy=Math.sin(a)*size*1.3;
      rect(ctx,x+dx,y+dy,2,2,'#fae5fb');
    }
  }
  function crystal(ctx,x,y,h){
    poly(ctx,[[x-13,y],[x-9,y-h*.79],[x,y-h],[x+11,y-h*.69],[x+17,y]],'#6e4bba');
    poly(ctx,[[x-9,y-h*.79],[x,y-h],[x,y]],'#c57bff');
    poly(ctx,[[x,y-h],[x+11,y-h*.69],[x,y]],'#9af0f6');
    rect(ctx,x,y-h*.65,3,h*.51,'#f2ddff');
    // High-frequency facet streaks rather than a smooth neon blur.
    rect(ctx,x-5,y-h*.42,3,h*.18,'#e6bfff');
    rect(ctx,x+6,y-h*.36,2,h*.2,'#4e4ba2');
    rect(ctx,x-7,y-h*.12,5,2,'#f7d0fd');
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
    // Moss, plants and carved stone details keep the foreground readable
    // when parallax separates it from the middle islands.
    for(let i=0;i<52;i++){
      const xx=rand()*380,yy=1120+rand()*245;
      rect(ctx,xx,yy,6+rand()*13,2+rand()*6,
        choose(['#204d64','#346a79','#60857b','#ad976d','#d2b781']));
      if(rand()<.33)ivy(ctx,xx,yy,12+rand()*35);
    }
    for(let i=0;i<39;i++){
      const xx=802+rand()*331,yy=1196+rand()*180;
      rect(ctx,xx,yy,4+rand()*10,2+rand()*6,
        choose(['#204d64','#346a79','#60857b','#ad976d','#d2b781']));
    }
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
    // Pixel-sharp sparkles and lichen on the near plane only.
    for(let i=0;i<76;i++){
      const xx=rand()*W,yy=1022+rand()*360;
      if(xx>405&&xx<755)continue;
      const size=1+rand()*4;
      rect(ctx,xx,yy,size,size,choose(['#f8c2ff','#8cdeee','#f1dcab','#bf9ced']));
      if(rand()<.12)star(ctx,xx,yy,size+2,false);
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
    status.textContent='V6.1 : ruines et végétation détaillées · parallaxe V6 conservée';
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