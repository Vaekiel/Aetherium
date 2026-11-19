/* AETHERIUM V5 — relief uniquement sur le décor.
 * Flat immutable dragon artwork. No parallax texture shifts, no ghosted layers.
 * Background depth comes from architectural occlusion, atmospheric color and
 * direction-aware highlights inside a single composited WebGL frame.
 */
(() => {
  'use strict';
  const art=document.querySelector('.art'), card=document.querySelector('#card');
  const canvas=document.querySelector('#volume-canvas'), depth=document.querySelector('#depth');
  const foil=document.querySelector('#intensity'), status=document.querySelector('#status');
  if(!art || !card || !canvas || !depth || !foil) return;
  const original=new Image(), subject=new Image();
  original.src='./assets/cards/vyrath-fleau-celeste.webp';
  subject.src='./assets/cards/holo/vyrath/subject.webp';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let gl,program,locations={},ready=false,raf=0,px=.5,py=.5,gyro=false,hidden=false;
  const clamp=(a,min,max)=>Math.max(min,Math.min(max,a));
  const load=img=>new Promise((resolve,reject)=>{
    if(img.complete)return img.naturalWidth?resolve():reject(new Error('Image manquante'));
    img.addEventListener('load',resolve,{once:true});
    img.addEventListener('error',reject,{once:true});
  });
  function shader(type,source){
    const sh=gl.createShader(type);
    gl.shaderSource(sh,source);gl.compileShader(sh);
    if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));
    return sh;
  }
  function pipeline(){
    const v=shader(gl.VERTEX_SHADER,`
      attribute vec2 aPosition;
      varying vec2 vUv;
      void main(){vUv=(aPosition+1.0)*0.5;gl_Position=vec4(aPosition,0.,1.);}
    `);
    const f=shader(gl.FRAGMENT_SHADER,`
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uImage,uDragon,uRuins,uForeground;
      uniform vec4 uRect;
      uniform vec2 uPixel,uLight;
      uniform float uDepth,uFoil;
      float dragonAt(vec2 pos){return texture2D(uDragon,clamp(pos,0.,1.)).a;}
      void main(){
        vec2 uv=uRect.xy+vUv*uRect.zw;
        vec3 original=texture2D(uImage,uv).rgb;
        // Dilate the subject exclusion; even thin horns and claws stay
        // exactly as painted. No sampling of shifted dragon source pixels.
        vec2 gap=uPixel*13.;
        float dragon=max(dragonAt(uv),max(
          max(dragonAt(uv+vec2(gap.x,0.)),dragonAt(uv-vec2(gap.x,0.))),
          max(dragonAt(uv+vec2(0.,gap.y)),dragonAt(uv-vec2(0.,gap.y)))
        ));
        dragon=max(dragon,max(
          dragonAt(uv+gap*.71),dragonAt(uv-gap*.71)
        ));
        float bg=1.-smoothstep(.04,.78,dragon);
        if(bg<.005||uDepth<.005){gl_FragColor=vec4(original,1.);return;}

        float mid=texture2D(uRuins,uv).a;
        float near=texture2D(uForeground,uv).a;
        float far=clamp(1.-max(mid,near),0.,1.);

        // Atmosphere: cooler distant sky, richer mid-ground stone,
        // more saturated vegetation and crystal foreground.
        vec3 scenery=original;
        scenery=mix(scenery,scenery*vec3(.83,.91,1.09)+vec3(.006,.009,.022),
            clamp(far*.19*uDepth,0.,.4));
        scenery=mix(scenery,scenery*vec3(1.06,1.02,.97),
            clamp(mid*.18*uDepth,0.,.4));
        scenery=mix(scenery,scenery*vec3(1.08,1.11,1.12),
            clamp(near*.23*uDepth,0.,.4));

        // The ruins and vegetation are *stationary*. Only their own
        // light-facing and shadow-facing silhouette edges respond to tilt.
        vec2 aim=vec2((uLight.x-.5)*1.8+.3,(uLight.y-.5)*1.5+.45);
        vec2 direction=aim/max(length(aim),.05);
        vec2 offset=direction*uPixel*21.;
        float midAhead=texture2D(uRuins,uv+offset).a;
        float midBehind=texture2D(uRuins,uv-offset).a;
        float nearAhead=texture2D(uForeground,uv+offset).a;
        float nearBehind=texture2D(uForeground,uv-offset).a;
        float lit=max(mid-midAhead,0.)*.76+
                  max(near-nearAhead,0.)*1.1;
        float shadow=max(midBehind-mid,0.)*.72+
                     max(nearBehind-near,0.)*.95;

        // Rim illumination and architectural self-shadow are composited
        // from the unshifted painting. This is not a moving bump normal map.
        scenery+=vec3(.18,.28,.34)*lit*uDepth;
        scenery*=1.-shadow*uDepth*.21;
        // Distant light shafts move across the existing sky, not across
        // the dragon. Keep the HD pixel-art details and edges intact.
        float skyLine=(uv.x*.58+uv.y*.42-uLight.x*.16);
        float shimmer=pow(max(sin(skyLine*21.),0.),18.);
        scenery+=vec3(.032,.044,.075)*shimmer*far*uDepth*(.25+.75*uFoil);
        scenery=mix(original,scenery,bg);
        gl_FragColor=vec4(clamp(scenery,0.,1.),1.);
      }
    `);
    const p=gl.createProgram();gl.attachShader(p,v);gl.attachShader(p,f);
    gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
    return p;
  }
  function depthMask(type){
    const w=original.naturalWidth,h=original.naturalHeight;
    const c=document.createElement('canvas');c.width=w;c.height=h;
    const ctx=c.getContext('2d');
    ctx.scale(w/1138,h/1382);
    // Custom painted map of stationary scene volumes, leaving the dragon
    // excluded later by the alpha silhouette inside the shader.
    const polygons=type==='ruins'?[
      [[0,522],[169,494],[312,596],[312,986],[239,1121],[80,1188],[0,1147]],
      [[824,333],[988,342],[1138,421],[1138,1250],[1075,1325],[878,1148],[843,894]],
      [[223,829],[357,762],[463,804],[499,1182],[401,1285],[274,1143]]
    ]:[
      [[0,941],[134,888],[255,1050],[379,1242],[444,1382],[0,1382]],
      [[737,1105],[916,1017],[1035,1047],[1138,1081],[1138,1382],[703,1382]],
      [[380,1164],[504,1137],[657,1253],[779,1382],[390,1382]]
    ];
    ctx.fillStyle='rgba(255,255,255,.95)';
    for(const poly of polygons){
      ctx.beginPath();
      poly.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
      ctx.closePath();ctx.fill();
    }
    // Feather only static zone boundaries. Actual source art is never blurred.
    const out=document.createElement('canvas');out.width=w;out.height=h;
    const o=out.getContext('2d');o.filter='blur(22px)';
    o.drawImage(c,0,0);o.filter='none';
    return out;
  }
  function texture(source){
    const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);
    return tex;
  }
  function initialize(){
    gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false})||
      canvas.getContext('experimental-webgl',{alpha:true,antialias:false,premultipliedAlpha:false});
    if(!gl)throw Error('WebGL indisponible');
    program=pipeline();gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const pos=gl.getAttribLocation(program,'aPosition');
    gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
    ['uRect','uPixel','uLight','uDepth','uFoil'].forEach(k=>locations[k]=gl.getUniformLocation(program,k));
    [original,subject,depthMask('ruins'),depthMask('foreground')].forEach((img,i)=>{
      gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,texture(img));
      gl.uniform1i(gl.getUniformLocation(program,
        ['uImage','uDragon','uRuins','uForeground'][i]),i);
    });
    ready=true;art.classList.add('is-webgl');
    status.textContent='V5 : relief du décor actif · dragon original intact';schedule();
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
    const scale=Math.max(w/iw,h/ih);
    const vw=w/(scale*iw),vh=h/(scale*ih);
    const left=(1-vw)*.5,top=(1-vh)*.45;
    gl.uniform4f(locations.uRect,left,1-top-vh,vw,vh);
    gl.uniform2f(locations.uPixel,1/iw,1/ih);
    gl.uniform2f(locations.uLight,reduced?.5:px,reduced?.5:1-py);
    gl.uniform1f(locations.uDepth,Number(depth.value)/100);
    gl.uniform1f(locations.uFoil,Number(foil.value)/100);
    gl.drawArrays(gl.TRIANGLES,0,6);
  }
  function pointer(e){
    if(gyro)return;
    const r=card.getBoundingClientRect();
    px=clamp((e.clientX-r.left)/r.width,0,1);
    py=clamp((e.clientY-r.top)/r.height,0,1);
    schedule();
  }
  card.addEventListener('pointerdown',pointer,{passive:true});
  card.addEventListener('pointermove',pointer,{passive:true});
  card.addEventListener('pointerleave',e=>{
    if(!gyro&&e.pointerType==='mouse'){px=.5;py=.5;schedule()}
  });
  card.addEventListener('keydown',e=>{
    const delta={ArrowLeft:[-.08,0],ArrowRight:[.08,0],
      ArrowUp:[0,-.08],ArrowDown:[0,.08]}[e.key];
    if(!delta)return;
    px=clamp(px+delta[0],0,1);py=clamp(py+delta[1],0,1);schedule();
  });
  depth.addEventListener('input',schedule);
  foil.addEventListener('input',schedule);
  document.querySelector('#reset')?.addEventListener('click',()=>{
    px=.5;py=.5;gyro=false;schedule();
  });
  document.querySelector('#tilt')?.addEventListener('click',()=>{
    gyro=document.querySelector('#tilt').textContent.includes('Désactiver');
  });
  window.addEventListener('deviceorientation',e=>{
    if(!gyro||e.gamma==null||e.beta==null)return;
    px=clamp(.5+e.gamma/80,.03,.97);
    py=clamp(.5+(e.beta-35)/100,.03,.97);schedule();
  },{passive:true});
  document.addEventListener('visibilitychange',()=>{
    hidden=document.hidden;if(!hidden)schedule();
  });
  window.addEventListener('resize',schedule,{passive:true});
  if('ResizeObserver' in window)new ResizeObserver(schedule).observe(art);
  canvas.addEventListener('webglcontextlost',e=>{
    e.preventDefault();ready=false;art.classList.remove('is-webgl');
    status.textContent='Mode graphique suspendu : illustration originale conservée';
  });
  canvas.addEventListener('webglcontextrestored',()=>{
    try{initialize()}catch(e){status.textContent='WebGL indisponible : illustration originale conservée'}
  });
  Promise.all([load(original),load(subject)]).then(()=>{
    try{initialize()}catch(e){
      console.warn('Aetherium V5 fallback:',e);
      status.textContent='WebGL indisponible : illustration originale conservée';
    }
  }).catch(()=>{status.textContent='Illustration indisponible : mode original conservé'});
})();