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
function simulate(useFallback){let ready;const timers=new Map();let id=0;let leaving=false;const screen={hidden:true,classList:{add(x){assert.equal(x,'is-leaving');leaving=true;}},setAttribute(){}};runInNewContext(script,{document:{getElementById(){return screen;},readyState:'loading',addEventListener(name,fn){assert.equal(name,'DOMContentLoaded');ready=fn;}},setTimeout(fn,ms){timers.set(++id,{fn,ms});return id;},clearTimeout(i){timers.delete(i);}});assert.equal(screen.hidden,false);if(useFallback){[...timers.values()].find(x=>x.ms===8000).fn();}else ready();assert.equal(leaving,true);[...timers.values()].find(x=>x.ms===300).fn();assert.equal(screen.hidden,true);assert.ok(![...timers.values()].some(x=>x.ms===8000));}
simulate(false);simulate(true);
console.log('PWA launch: icons, identity, ready transition and fail-safe verified');
