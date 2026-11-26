import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const html=readFileSync('index.html','utf8');
const manifest=JSON.parse(readFileSync('manifest.webmanifest','utf8'));
assert.equal(manifest.id,'/Aetherium/');
assert.equal(manifest.start_url,'./#jouer');
assert.equal(manifest.scope,'./');
for(const icon of manifest.icons){const bytes=readFileSync(icon.src);assert.equal(bytes.subarray(1,4).toString(),'PNG');const [w,h]=icon.sizes.split('x').map(Number);assert.equal(bytes.readUInt32BE(16),w);assert.equal(bytes.readUInt32BE(20),h);}
assert.ok(manifest.icons.some(i=>i.purpose==='maskable'));
assert.ok(html.includes('manifest.webmanifest?v=arcane-launch-1'));
assert.ok(html.indexOf('id="arcane-launch"')<html.indexOf('id="app"'));
const art=readFileSync('assets/icons/aetherium-launch.webp');assert.equal(art.subarray(8,12).toString(),'WEBP');
const script=html.match(/<script id="aetherium-launch-controller">([\s\S]*?)<\/script>/)[1];
assert.ok(!/localStorage|sessionStorage|indexedDB/.test(script));
assert.match(html,/#arcane-launch\{position:fixed;inset:0/);
assert.match(html,/center 43%\/cover no-repeat/);
assert.match(html,/\.launch-status\{position:absolute/);
function simulate({fallback=false,delayedArt=false,lateGame=false,alreadyReady=false}={}){
 let ready,now=0,id=0,leaving=false;const timers=new Map(),events={};
 const art={complete:!delayedArt,addEventListener(name,fn){events[name]=fn;}};
 const screen={hidden:true,querySelector(){return art;},classList:{add(x){assert.equal(x,'is-leaving');leaving=true;}},setAttribute(){}};
 runInNewContext(script,{document:{getElementById(){return screen;},readyState:alreadyReady?'complete':'loading',addEventListener(name,fn){assert.equal(name,'DOMContentLoaded');ready=fn;}},performance:{now:()=>now},setTimeout(fn,ms){timers.set(++id,{fn,at:now+ms,ms});return id;},clearTimeout(i){timers.delete(i);}});
 function advance(to){while(true){const next=[...timers].filter(([,t])=>t.at<=to).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;timers.delete(next[0]);now=next[1].at;next[1].fn();}now=to;}
 assert.equal(screen.hidden,false);
 if(fallback){advance(7999);assert.equal(leaving,false);advance(8000);assert.equal(leaving,true);advance(8450);assert.equal(screen.hidden,true);return;}
 if(!alreadyReady&&!lateGame)ready();
 if(delayedArt){advance(1000);events.load();}
 if(lateGame){advance(4200);ready();}
 const finishAt=lateGame?4200:delayedArt?4000:3000;
 if(now<finishAt)advance(finishAt-1);assert.equal(leaving,false);
 advance(finishAt);assert.equal(leaving,true);assert.equal(screen.hidden,false);
 advance(finishAt+450);assert.equal(screen.hidden,true);assert.equal(timers.size,0);
}
simulate();simulate({delayedArt:true});simulate({lateGame:true});simulate({alreadyReady:true});simulate({fallback:true,delayedArt:true});
console.log('PWA launch: full-bleed layout, icons, identity, minimum hold, late artwork and fail-safe verified');
