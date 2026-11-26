import assert from 'node:assert/strict';
import {enableHolographicInspection} from '../src/finish-interaction.js';

const frames=new Map();let nextFrame=0;
globalThis.requestAnimationFrame=cb=>{frames.set(++nextFrame,cb);return nextFrame};
globalThis.cancelAnimationFrame=id=>frames.delete(id);
const flush=()=>{for(const [id,cb] of [...frames]){frames.delete(id);cb()}};
globalThis.matchMedia=()=>({matches:false});
class Node extends EventTarget{
 constructor(){super();this.isConnected=true;this.visible=true;this.values={};this.children=[];
  this.style={setProperty:(name,value)=>this.values[name]=value};}
 getClientRects(){return this.visible?[{}]:[]}
 getBoundingClientRect(){return {left:0,top:0,width:100,height:100}}
 setAttribute(name,value){this[name]=value}
 append(node){this.children.push(node);node.parent=this}
 remove(){this.isConnected=false;if(this.parent)this.parent.children=this.parent.children.filter(x=>x!==this)}
 click(){this.dispatchEvent(new Event('click'))}
}
const win=new EventTarget();
let activeListeners=0;
const add=win.addEventListener.bind(win),remove=win.removeEventListener.bind(win);
const listeners=new Set();
win.addEventListener=(type,fn,opts)=>{if(type==='deviceorientation'){listeners.add(fn);activeListeners=listeners.size}return add(type,fn,opts)};
win.removeEventListener=(type,fn,opts)=>{if(type==='deviceorientation'){listeners.delete(fn);activeListeners=listeners.size}return remove(type,fn,opts)};
win.isSecureContext=true;
win.DeviceOrientationEvent={};
globalThis.window=win;
globalThis.document={hidden:false,createElement:()=>new Node()};
const event=(type,values)=>Object.assign(new Event(type),values);

const shell=new Node();enableHolographicInspection(shell);
assert.equal(activeListeners,0,'Sensor must not subscribe before opt-in');
assert.equal(shell.children.length,1);
shell.dispatchEvent(event('pointermove',{clientX:90,clientY:20}));
flush();
assert.equal(shell.values['--holo-x'],'90.00%');
shell.dispatchEvent(event('pointercancel',{}));flush();
assert.equal(shell.values['--holo-x'],'50.00%');
shell.children[0].click();
assert.equal(activeListeners,1);
win.dispatchEvent(event('deviceorientation',{gamma:0,beta:0}));flush();
win.dispatchEvent(event('deviceorientation',{gamma:20,beta:10}));flush();
assert.notEqual(shell.values['--holo-x'],'50.00%');
shell.children[0].click();
assert.equal(activeListeners,0);
shell.visible=false;
shell.dispatchEvent(event('pointermove',{clientX:90,clientY:20}));
assert.equal(frames.size,0,'No animation queued for hidden card');
enableHolographicInspection(null);
assert.equal(shell.children.length,0);
assert.equal(activeListeners,0);

let resolvePermission;
win.DeviceOrientationEvent.requestPermission=()=>new Promise(resolve=>{resolvePermission=resolve});
const pending=new Node();enableHolographicInspection(pending);
pending.children[0].click();
enableHolographicInspection(null);
resolvePermission('granted');
await Promise.resolve();await Promise.resolve();
assert.equal(activeListeners,0,'A late sensor permission must not revive a closed inspector');
assert.equal(pending.children.length,0);
const hidden=new Node();enableHolographicInspection(hidden);
hidden.dispatchEvent(event('pointermove',{clientX:20,clientY:20}));
assert.equal(frames.size,1);
enableHolographicInspection(null);
assert.equal(frames.size,0,'Closing cancels pending frames');
console.log('AETHERIUM holographic lifecycle: opt-in, pointer, hidden card, late permission and disposal OK.');
