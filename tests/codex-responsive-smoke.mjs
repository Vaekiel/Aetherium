import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {RARITIES} from '../src/data.js';
import {FINISHES,FINISH_KEYS,restoreFinishCounts,finishQuantity,preferredFinish} from '../src/finishes.js';

const main=readFileSync('src/main.js','utf8');
const html=readFileSync('index.html','utf8');
const css=readFileSync('src/codex.css','utf8');
const mobile=readFileSync('src/mobile.css','utf8');
const extract=(a,b)=>{
 const start=main.indexOf(a),end=main.indexOf(b,start);
 assert.ok(start>=0&&end>start,'Codex inspection logic is accessible: '+a);
 return main.slice(start,end);
};
const code=extract('function markCodexSelected(id){','function renderCodexSeasons(){');
assert.ok(css.includes('AETHERIUM — Codex responsive 1.9.0'));
assert.ok(html.includes('codex.css?v=au-dela-pilot-49'));
assert.ok(html.includes('main.js?v=au-dela-lot-3'));
assert.ok(html.includes('width=device-width,initial-scale=1,viewport-fit=cover'));
assert.ok(css.includes('repeat(auto-fill,minmax(min(100%,158px),1fr))'),
 'Desktop and wide tablet gallery uses fluid columns without overflowing');
assert.ok(css.includes('repeat(auto-fill,minmax(min(100%,clamp(132px,26vw,180px)),1fr))'),
 'Small and medium touch screens reserve enough space for readable cards');
for(const breakpoint of ['max-width:850px','max-width:420px','max-width:350px',
 'min-width:851px','max-width:980px','orientation:landscape','max-height:550px']){
 assert.ok(css.includes(breakpoint),'A necessary responsive viewport rule is missing: '+breakpoint);
}
assert.ok(css.includes('min-width:0'),'Container content can shrink without horizontal overflow');
assert.ok(css.includes('overflow-wrap:anywhere'),'Long card titles can wrap');
assert.ok(css.includes('.codex-inspector-navigation button'),'Previous/next controls stay readable');
assert.ok(css.includes('min-height:44px'),'Touch targets remain accessible');
assert.ok(css.includes('env(safe-area-inset-bottom)')||mobile.includes('env(safe-area-inset-bottom)'));
assert.ok(mobile.includes('.inspector-shell[popover]:popover-open'),
 'Mobile card sheet must stay in the native popover top layer');
assert.ok(main.includes("const SAVE='aetherium-save-v1'"),'Save schema is unchanged');
assert.ok(code.includes('addCodexNavigation(copy,c)'),
 'Previous/next controls are grouped with their card metadata in all viewports');
assert.ok(code.includes('panel.append(artwork,copy)'));
assert.ok(code.includes('panel.append(seal,copy)'));

const classes=name=>{
 const tokens=new Set(name.split(/\s+/).filter(Boolean));
 return {add:(...v)=>v.forEach(t=>tokens.add(t)),
  remove:(...v)=>v.forEach(t=>tokens.delete(t)),
  toggle:(t,force)=>{if(force===undefined)force=!tokens.has(t);if(force)tokens.add(t);else tokens.delete(t);return force;},
  contains:t=>tokens.has(t)};
};
function elem(tag='',klass='',content=''){
 const node={
  tagName:tag,className:klass,textContent:content,children:[],
  attrs:{},style:{properties:{},setProperty(k,v){this.properties[k]=v}},dataset:{},
  classList:classes(klass),
  append(...children){node.children.push(...children)},
  replaceChildren(...children){node.children=[...children]},
  setAttribute(k,v){node.attrs[k]=v},
  querySelector(selector){
   const matches=n=>selector==='h2'?n.tagName==='h2':
    selector==='img'?n.tagName==='img':n.classList?.contains(selector.slice(1));
   const find=root=>{
    for(const child of root.children){if(matches(child))return child;
      const nested=find(child);if(nested)return nested;}
    return null;
   };
   return find(node);
  },
  focus(){},scrollIntoView(){}
 };
 return node;
}
const host=elem('div','inspector'),shell=elem('aside','inspector-shell');
const tiles=[elem('button','card'),elem('button','card')];
tiles[0].dataset.cardId='1';tiles[1].dataset.cardId='22';
const cards=[
 {id:1,name:'Veilleuse de Nacre',type:'Héros',rarity:'common',lore:'Une veilleuse.',
  attack:3,health:5},
 {id:22,name:'Astra, Reine Fractale',type:'Héros',rarity:'legendary',lore:'La reine.',
  attack:33,health:28}
];
const saved={coins:370,dust:75,owned:{1:1,22:2},shiny:{22:true},opened:8};
saved.finishCounts=restoreFinishCounts(saved.owned,saved.shiny);
const before=JSON.stringify(saved);
let shown=0,scrolls=0,artCalls=0;
const sandbox={
 state:saved,selectedCard:null,codexVisibleCards:cards,filterFinish:'all',
 previewArt:false,activeSeason:'marches-de-verre',activeCollection:'origines',
 RARITIES,FINISHES,FINISH_KEYS,finishQuantity,preferredFinish,el:elem,
 document:{createTextNode:text=>elem('text','',text)},
 enableHolographicInspection(){},
 attachRectoLabInspector({panel,card,finish,artwork}){
  assert.ok(card.id);
  const front=elem('article','recto-lab-card recto-lab-'+finish);
  front.append(artwork.querySelector('img'));
  panel.children[0]=front;
  panel.classList.add('recto-lab-mode-new');
  return front;
 },
 button(label,handler,klass=''){const n=elem('button',klass,label);n.click=handler;return n},
 markNothing:null,mobileView:{matches:true},
 openSheet(kind){assert.equal(kind,'inspector');shown++},
 matchMedia(){return{matches:false}},
 hasApprovedArt(){return true},
 applyCardIllustration(img,card,options){
  artCalls++;img.src='/assets/cards/'+card.id+'.webp';
  assert.equal(options.size,'full');
 },
 collectionForCard(){return{season:{number:1},collection:{title:'Origines'}}},
 $:selector=>selector==='#inspector'?host:
  selector==='#inspector h2'?host.querySelector('h2'):null,
 $$:selector=>selector==='#card-grid .card'?tiles:[],
 navigate(){},
};
const api=runInNewContext(code+'({inspect,inspectSealed,codexBrowseTo})',sandbox);
api.inspect(cards[1],true,true);
assert.equal(shown,1,'A tap opens the existing mobile sheet');
assert.equal(artCalls,1,'One full HD image is drawn');
assert.equal(host.children.length,2,'Image and details use two responsive regions');
assert.equal(host.children[0].className,'recto-lab-card recto-lab-chromatic');
assert.equal(host.children[1].className,'inspector-copy');
assert.ok(host.children[1].querySelector('h2').textContent.includes('Astra'));
assert.equal(host.children[1].querySelector('.codex-inspector-navigation').children.length,3);
assert.equal(tiles[1].attrs['aria-pressed'],'true');
assert.equal(host.querySelector('img').alt,'Illustration de Astra, Reine Fractale, version Chromatique');
const finishPicker=host.children[1].querySelector('.finish-picker');
assert.equal(finishPicker.children.length,4,'Each finish is listed in the Codex');
assert.equal(finishPicker.children[0].disabled,false,'Owned Normal may be selected');
assert.equal(finishPicker.children[2].disabled,false,'Owned Chromatique may be selected');
assert.equal(finishPicker.children[3].disabled,true,'Unowned Holographique is locked');
assert.equal(finishPicker.children[1].disabled,true,'Unowned Calligraphique is locked');
finishPicker.children[0].click();
assert.equal(host.children[0].className,'recto-lab-card recto-lab-normal');
assert.equal(shown,1,'Switching visual finish never reopens or scrolls the mobile sheet');
assert.equal(host.children[1].querySelector('.codex-inspector-navigation').children.length,3);

// Security of the collection surprise: direct calls, legacy preview flags,
// and unowned finish choices must not expose their visual effects.
api.inspect(cards[0],true,false,true,'chromatic');
assert.equal(host.children[0].className,'recto-lab-card recto-lab-normal',
  'Requesting an unowned Chromatique must fall back to the owned Normal');
assert.equal(host.children[1].querySelector('.finish-picker').children[2].disabled,true,
  'Unowned Chromatique control is disabled');
assert.equal(host.children[1].querySelector('.finish-picker').children[3].disabled,true,
  'Unowned Holographique control is disabled');
assert.equal(host.children[1].querySelector('.finish-picker').children[1].disabled,true,
  'Unowned Calligraphique control is disabled');
host.children[1].querySelector('.finish-picker').children[3].click();
assert.equal(host.children[0].className,'recto-lab-card recto-lab-normal',
  'Forcing a disabled finish callback must still not reveal the foil');
api.inspect(cards[1],false,false,false,'holographic');
assert.equal(host.children[0].className,'recto-lab-card recto-lab-chromatic',
  'Unowned Holographique must fall back to an acquired finish');
api.inspect(cards[1],false,false,false,'calligraphic');
assert.equal(host.children[0].className,'recto-lab-card recto-lab-chromatic',
  'Unowned Calligraphique must never reveal its effect');
api.inspectSealed({...cards[0],id:3},true);
assert.equal(shown,2);
assert.equal(host.children.length,2,'Sealed archives also use the new responsive layout');
assert.equal(host.children[0].className,'codex-sealed-inspector');
assert.equal(host.children[1].className,'inspector-copy');
assert.equal(host.children[1].querySelector('h2').textContent,'Archive non découverte');
assert.equal(host.children[1].querySelector('.codex-inspector-navigation'),null,
 'An archive outside the visible filtered list has no misleading next button');
assert.equal(JSON.stringify(saved),before,'Inspector changes never alter local saves or owned cards');

console.log('AETHERIUM Codex responsive — fluid gallery, landscape reader, top-layer mobile sheet, chromatic toggle, sealed cards, no save mutation');
