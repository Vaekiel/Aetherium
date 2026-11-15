// Illustration procédurale temporaire : chaque carte possède une composition déterministe.
// Les illustrations HD peintes individuellement remplaceront progressivement ce module.
const cache=new Map();
const palettes=[['#0c1933','#273f69','#587f9b','#e9c99c','#244d52'],['#121b31','#3e3c69','#9185bc','#f2dbb3','#42646d'],['#1c1732','#654171','#b784a5','#ffd0ab','#4c456c'],['#0e2330','#2b6163','#70b6ac','#d4e9c3','#315b4f']];
export function artFor(card,shiny=false){
const key=card.id+'-'+shiny;if(cache.has(key))return cache.get(key);
const canvas=document.createElement('canvas');canvas.width=112;canvas.height=136;const g=canvas.getContext('2d');
let seed=(card.id*7919+31)>>>0;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
const p=shiny?['#241943','#56478e','#b5a5ed','#fff4c7','#4f7997']:palettes[(card.id-1)%4];
function r(x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h))}
function star(x,y,c){r(x-1,y-5,3,11,c);r(x-5,y-1,11,3,c);r(x,y,1,1,'#ffffff')}
for(let y=0;y<136;y+=2)r(0,y,112,2,p[Math.min(3,Math.floor(y/37))]);
r(74,17,17,17,p[3]);r(78,13,9,24,p[3]);r(75,20,17,10,'#fff6d6');
for(let i=0;i<100;i++){const x=rand()*112,y=rand()*105;r(x,y,rand()>.9?2:1,1,rand()>.5?p[2]:p[3])}
for(let layer=0;layer<3;layer++){const base=72+layer*20;for(let x=-20;x<125;x+=14){const h=12+rand()*24;for(let y=0;y<h;y+=2)r(x-y*.3,base-y,14+y*.6,2,layer===0?p[1]:layer===1?p[4]:'#1b2b3c')}}
for(const x of [8,101]){r(x,37,5,89,'#344660');r(x+1,39,2,84,p[2]);for(let y=42;y<121;y+=12)r(x-2,y,9,2,p[3])}
const cx=55;
if(card.type==='Héros'){
 for(let y=0;y<52;y+=2)r(cx-10-y*.32,66+y,20+y*.64,2,y%4?p[1]:p[4]);
 r(cx-13,68,26,29,'#394b68');r(cx-9,45,18,21,'#d9b08e');
 r(cx-13,41,26,8,p[2]);r(cx-13,47,5,16,p[3]);r(cx+8,47,5,16,p[3]);
 r(cx-7,53,5,2,'#25364c');r(cx+3,53,5,2,'#25364c');r(cx-20,70,10,17,p[3]);r(cx+11,70,10,17,p[3]);
 r(cx+24,39,3,70,p[3]);star(cx+25,40,'#fff1b8');r(cx-10,94,20,5,p[3]);
}else if(card.type==='Créature'){
 const dragon=card.id%3===0||card.id===23;
 if(dragon){for(let y=0;y<62;y+=2){r(cx-26-y*.3,44+y,23,2,p[2]);r(cx+4+y*.26,44+y,23,2,p[1])}
 r(cx-14,58,28,43,p[4]);r(cx-12,43,24,24,p[2]);r(cx-18,41,8,16,p[3]);r(cx+10,41,8,16,p[3]);r(cx-9,57,6,3,'#fff3b4');r(cx+5,57,6,3,'#fff3b4');r(cx-22,95,13,23,p[2]);r(cx+9,95,13,23,p[2]);}
 else {r(cx-20,70,40,29,p[4]);r(cx-11,49,22,29,p[2]);r(cx-17,39,9,24,p[3]);r(cx+8,39,9,24,p[3]);r(cx-9,59,6,3,'#fff0bf');r(cx+3,59,6,3,'#fff0bf');r(cx-18,98,8,19,p[2]);r(cx+10,98,8,19,p[2]);}
}else if(card.type==='Artefact'){
 for(let i=0;i<8;i++){const w=35-i*4;r(cx-w/2,43+i*8,w,4,i%2?p[2]:p[3])}r(cx-4,40,8,74,p[3]);r(cx-15,91,30,6,p[2]);star(cx,68,'#fff4cf');
}else{for(let i=0;i<36;i++){const a=i*.58,rad=1+i*.85;r(cx+Math.cos(a)*rad-3,75+Math.sin(a)*rad-3,7,7,i%2?p[2]:p[3])}star(cx,75,'#fff8dd')}
for(let i=0;i<21;i++){const x=19+rand()*73,y=35+rand()*80;if(rand()>.45)r(x,y,2,2,p[3])}
r(0,0,112,3,p[3]);r(0,133,112,3,p[3]);r(0,0,3,136,p[3]);r(109,0,3,136,p[3]);r(4,4,104,1,p[2]);r(4,131,104,1,p[2]);r(4,4,1,128,p[2]);r(107,4,1,128,p[2]);
if(shiny)for(let i=0;i<8;i++)star(8+rand()*94,10+rand()*116,'#e5d1ff');
const url=canvas.toDataURL('image/png');cache.set(key,url);return url}
