// Decorative pixel-art landscape for AETHERIUM. No external assets or trackers.
const root=document.querySelector('.ambient-landscape');
if(root){
 const canvas=document.createElement('canvas'),w=640,h=340;
 canvas.width=w;canvas.height=h;const g=canvas.getContext('2d');
 let seed=58319;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const p=(x,y,ww,hh,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.ceil(ww),Math.ceil(hh))};
 const line=(x1,y1,x2,y2,c,step=1)=>{const dx=x2-x1,dy=y2-y1,n=Math.max(Math.abs(dx),Math.abs(dy))/step;for(let i=0;i<=n;i++){let t=i/n;p(x1+dx*t,y1+dy*t,step,step,c)}};
 for(let y=0;y<h;y+=2){const t=y/h;p(0,y,w,2,t<.4?'#1c1c3e':t<.69?'#36325c':'#4d3d67')}
 // Fading twilight haze
 for(let i=0;i<1900;i++){const x=rnd()*w,y=rnd()*h;const light=rnd();if(y<210&&light>.73)p(x,y,light>.98?2:1,1,light>.9?'#eecfb7':'#967dba')}
 // Lavender and rose mountains, layered chunky silhouettes
 for(let layer=0;layer<3;layer++){
  const base=216+layer*30;let last=0;
  for(let x=0;x<w;x+=6){const peak=base-(10+rnd()*22+(Math.sin(x*.022+layer)*12));p(x,peak,6,h-peak,layer===0?'#4f4772':layer===1?'#302c55':'#1a2343');last=peak}
 }
 // Central distant spires
 for(let x=200;x<535;x+=19){const ht=14+rnd()*40;p(x,215-ht,8,ht,'#252345');p(x+2,211-ht,4,3,'#8a6f89')}
 // Falls cascading from distant cliffs
 for(let k=0;k<3;k++){const x=520+k*24;p(x,199,11,105,'#365a79');p(x+2,199,4,96,'#85bad1');for(let y=205;y<290;y+=6)p(x+8,y,2,3,'#b1d0e7')}
 // A raised island at left: pixel stairs and ruins
 for(let y=173;y<288;y+=4){const width=40+Math.floor((y-173)*.57);p(0,y,width,4,y%8?'#272543':'#35304e')}
 for(let y=172;y<248;y+=11)p(28,y,7,2,'#4e4772');
 for(let x=8;x<76;x+=20){p(x,139,7,41,'#36314c');p(x-3,136,13,5,'#8b7191');p(x,129,7,8,'#5e5476')}
 p(8,124,69,5,'#9b7199');p(12,119,62,3,'#b48fb1');
 for(let i=0;i<8;i++){const x=7+i*8;p(x,118,4,6,'#4d4165')}
 // Cherry blossoms along left border
 for(let i=0;i<65;i++){const x=rnd()*111,y=rnd()*152;const d=Math.abs(x-45);if(d<80){p(x,y,2+rnd()*4,2+rnd()*3,rnd()>.4?'#eaa7c4':'#b76da9')}}
 line(0,0,63,75,'#34233f',6);line(22,0,61,62,'#432a44',4);
 for(let i=0;i<28;i++){const x=rnd()*115,y=rnd()*75;p(x,y,3,3,'#eaa4bb')}
 // foreground cliff and glowing flowers
 for(let x=0;x<190;x+=4){const top=273+x*.29+Math.sin(x*.09)*5;p(x,top,4,h-top,'#151a34');p(x,top,4,3,'#4a5273');if(rnd()>.62)p(x,top-2,2,2,'#a07a9c')}
 for(let x=0;x<220;x+=7){const y=271+x*.28+Math.sin(x*.09)*5;if(y<h-7){p(x,y-5,1,6,'#5d836d');if(rnd()>.45){p(x-2,y-7,5,3,'#d38aaa');p(x,y-9,2,2,'#f2c6c7')}}}
 // traveler in crimson cloak standing on cliff, pixel silhouette
 const tx=87,ty=269;p(tx-3,ty-25,12,11,'#342a47');p(tx,ty-28,8,5,'#765169');p(tx-6,ty-14,15,17,'#883e61');p(tx-10,ty-12,8,17,'#632f52');p(tx+3,ty+2,4,9,'#1e2339');p(tx-5,ty+2,4,9,'#1e2339');p(tx+10,ty-5,2,22,'#b09a81');p(tx+8,ty+14,7,4,'#eebd73');
 // companion, tiny luminous fox
 const fx=110,fy=278;p(fx,fy-6,12,8,'#c2d0e0');p(fx+2,fy-12,3,7,'#e2e8ea');p(fx+9,fy-12,3,7,'#e2e8ea');p(fx+10,fy,10,3,'#e0e5ed');p(fx+3,fy-3,2,2,'#25334f');
 // vignette built into bitmap; leave dark center for readable UI
 const url=canvas.toDataURL('image/png');
 root.style.backgroundImage="linear-gradient(180deg,rgba(12,13,32,.74) 0%,rgba(14,15,35,.73) 47%,rgba(12,14,30,.39) 100%),url('"+url+"')";
 root.style.backgroundSize='cover,cover';
 root.style.backgroundPosition='center,center bottom';
 root.style.imageRendering='pixelated';
}
