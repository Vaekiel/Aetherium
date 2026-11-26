import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const read=path=>readFileSync(path,'utf8');
const html=read('index.html');
const css=read('src/booster-gallery.css');
const ui=read('src/ui-harmony.css');
const js=read('src/main.js');
assert.ok(html.includes('id="booster-gallery"')&&html.includes('id="booster-season-tabs"'));
assert.ok(html.includes('<dialog id="booster-dialog"'));
assert.ok(html.includes('id="booster-close"'));
assert.equal((html.match(/id="booster-pack"/g)||[]).length,1);
assert.equal((html.match(/class="booster-choice/g)||[]).length,3);
assert.ok(ui.startsWith('@import "./booster-gallery.css?v=gallery-2";'));
for(const name of ['origines','reflets-brises','au-dela-du-verre']){
 assert.ok(html.includes('data-booster="'+name+'"'));
}
assert.ok(!html.includes('data-season="season-2"'),'Non-published seasons are not teased');
assert.ok(html.includes('pack-scene'),'Each packet uses the shared pack scene element');
assert.ok(css.includes('#page-boosters .booster-tile-pack')&&css.includes('#page-boosters #booster-pack'));
assert.ok(css.includes('object-fit:cover')&&css.includes('transform:scale(1.28)'));
assert.ok(css.includes('image-rendering:auto')&&css.includes('filter:none'));
assert.ok(css.includes('grid-template-columns:repeat(3,minmax(0,1fr))'));
assert.ok(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'));
assert.ok(css.includes('@media(max-width:700px)')&&css.includes('@media(max-width:420px)'));
assert.ok(css.includes('prefers-reduced-motion:reduce'));
assert.ok(!css.includes('backdrop-filter'),'No expensive backdrop blur on mobile');
assert.ok(html.includes('class="pack pack-origines pack-illustrated reliquaire-origines" id="booster-pack"'),
 'Existing reveal animation wrapper is preserved');
assert.ok(html.includes('<details class="booster-rates"><summary>Chances et doublons</summary>'));
assert.ok(js.includes("if(boosterBusy)completeBoosterReveal();"),
 'Closing during the opening saves the existing result rather than resetting the draw');
assert.ok(js.includes("if(boosterBusy)boosterDialog.classList.add('has-results')"));

const start=js.indexOf("const boosterDialog=$('#booster-dialog');");
const end=js.indexOf('// The original handler has already saved',start);
assert.ok(start>0&&end>start);
const block=js.slice(start,end);
const ev=(props={})=>({
 ...props,listeners:{},
 addEventListener(type,callback){this.listeners[type]=callback},
 click(){this.listeners.click?.()},
 setAttribute(name,value){this.attributes??={};this.attributes[name]=value},
 classList:{values:new Set(),add(x){this.values.add(x)},remove(x){this.values.delete(x)},
  toggle(x,on){if(on)this.values.add(x);else this.values.delete(x)},contains(x){return this.values.has(x)}}
});
const choices=[
 ev({dataset:{booster:'origines',season:'first',seasonTitle:'Saison I'}}),
 ev({dataset:{booster:'reflets-brises',season:'first',seasonTitle:'Saison I'}}),
 ev({dataset:{booster:'second-pack',season:'second',seasonTitle:'Saison II'}})
];
const tabs={children:[],replaceChildren(){this.children=[]},append(tab){this.children.push(tab)}};
const buy={focus(){this.focused=true}};
const close=ev();
const kicker={textContent:''};
const dialog=ev({open:false,
 showModal(){this.open=true},
 close(){this.open=false;this.listeners.close?.()}
});
let selected='',completed=0,cleared=0,updated=0;
const context={
 $:sel=>({'#booster-dialog':dialog,'#booster-season-tabs':tabs,
  '#booster-close':close,'#buy':buy,'#booster-dialog-kicker':kicker})[sel],
 $$:sel=>sel==='.booster-choice'?choices:sel==='.booster-season-choice'?tabs.children:[],
 button:(label,handler,cls)=>{
  const tab=ev({textContent:label,className:cls,dataset:{}});tab.listeners.click=handler;return tab
 },
 boosterView:id=>choices.some(choice=>choice.dataset.booster===id)?{collection:{id}}:null,
 selectBooster:edition=>{selected=edition},
 clearBoosterScene:()=>{cleared++},
 completeBoosterReveal:()=>{completed++;context.boosterBusy=false},
 update:()=>{updated++},
 boosterBusy:false,selectedBooster:'origines'
};
runInNewContext(block+'\nthis.__openBoosterDialog=openBoosterDialog;',context);
assert.equal(tabs.children.length,2,'Future seasons get their own tab, without fixed limits');
assert.equal(choices.filter(x=>x.hidden).length,1,'Current season shows only its boosters');
tabs.children[1].click();
assert.equal(choices.filter(x=>!x.hidden).length,1,'One future season only shows its own pack');
assert.equal(choices[2].hidden,false);
assert.equal(tabs.children[1].attributes['aria-pressed'],'true');
context.__openBoosterDialog({dataset:{booster:'not-published'}});
assert.equal(dialog.open,false,'Unregistered booster cannot open a dialog');
context.__openBoosterDialog(choices[2]);
assert.equal(selected,'second-pack');
assert.equal(dialog.open,true);
assert.equal(kicker.textContent,'Saison II');
assert.equal(buy.focused,true);
context.boosterBusy=true;
close.click();
assert.equal(completed,1,'Closing an unfinished reveal resolves it once');
assert.equal(cleared,1,'Closing resets presentation once');
assert.equal(updated,1,'The inventory UI refreshes once');
assert.equal(dialog.open,false);
// Exercise the actual future tile factory with an unpublished and a released
// entry. This catches accidental querySelector (single element) use at startup.
const mountStart=js.indexOf('function mountReleasedBoosterChoices(){');
const mountEnd=js.indexOf('mountReleasedBoosterChoices();',mountStart);
assert.ok(mountStart>0&&mountEnd>mountStart);
const makeTile=()=> {
 const pack=ev(),scene=ev(),title=ev(),edition=ev(),chapter=ev(),caption=ev(),price=ev(),collection=ev();
 const tile=ev({dataset:{booster:'origines'},hidden:false});
 pack.fields={'.pack-collection':collection,'.pack-scene img':scene,'.pack-title':title,'.pack-edition':edition};
 tile.fields={'.booster-tile-pack':pack,'.booster-tile-chapter':chapter,'.booster-tile-caption strong':caption,'.booster-tile-price':price};
 return tile;
};
const template=makeTile(),mounted=[template];
template.cloneNode=()=>makeTile();
template.parentNode={append(tile){mounted.push(tile)}};
const fixture={theme:'standard',title:'TEST',label:'Booster TEST',edition:'SAISON 2 · 5 CARTES',art:'./assets/boosters/test.webp',
 season:{id:'test-season',title:'Test season'},seasonLabel:'Saison II · Test season',collection:{number:'I',title:'TEST'}};
const mountContext={
 $:(selector,root)=>root?root.fields[selector]:selector==='.booster-choice'?template:null,
 $$:selector=>selector==='.booster-choice'?mounted:[],
 BOOSTER_VIEWS:{origines:{},'test-published':{},'test-draft':{}},
 boosterView:id=>id==='test-published'?fixture:null,
 PACK_PRICE:100
};
runInNewContext(js.slice(mountStart,mountEnd)+'mountReleasedBoosterChoices();mountReleasedBoosterChoices();',mountContext);
assert.equal(mounted.length,2,'A released future tile is generated exactly once, draft stays absent');
const added=mounted[1],addedPack=added.fields['.booster-tile-pack'];
assert.equal(added.dataset.booster,'test-published');
assert.equal(added.dataset.season,'test-season');
assert.equal(added.dataset.seasonTitle,fixture.seasonLabel);
assert.equal(addedPack.fields['.pack-scene img'].attributes.src,fixture.art);
assert.equal(addedPack.fields['.pack-edition'].textContent,'SAISON 2 · 5 CARTES');
assert.equal(added.fields['.booster-tile-caption strong'].textContent,'TEST');
assert.equal(added.attributes['aria-pressed'],'false');

const mobileSceneryCss=read('src/mobile-background.css');
assert.ok(ui.includes('@import "./mobile-background.css?v=clean-1";'));
assert.ok(mobileSceneryCss.includes('Mobile scenery cleanup'));
assert.ok(mobileSceneryCss.includes('#app > .ambient-landscape::before'));
assert.ok(mobileSceneryCss.includes('#app::before'));
assert.ok(html.includes('background=clean-1'));
console.log('AETHERIUM: galerie commune responsive, saisons extensibles, ouverture protégée et modal accessible OK');
