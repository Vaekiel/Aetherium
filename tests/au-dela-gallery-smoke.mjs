import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {AU_DELA_GALLERY_ART,mountAuDelaGallery} from '../src/au-dela-gallery.js';
import {AU_DELA_DU_VERRE_DRAFT} from '../src/au-dela-du-verre-catalog.js';
import {CARDS as PUBLISHED,drawRefletsPack} from '../src/collection-data.js';
import {CARDS as ORIGINES,drawPack} from '../src/data.js';
import {collectionById,cardsForCollection} from '../src/seasons.js';

const read=path=>readFileSync(path,'utf8');
const html=read('index.html');
const main=read('src/main.js');
const css=read('src/au-dela-gallery.css');
const expected=Object.freeze([
 [49,'passeur-des-aubes'],
 [50,'mousse-de-l-entreverre'],
 [51,'lanternes-jumelles'],
 [52,'brume-des-deux-rivages'],
 [53,'mesange-de-la-couture'],
 [54,'boussole-du-dedans'],
 [55,'emissaire-des-possibles'],
 [56,'tisserande-de-quartz'],
 [57,'clef-de-l-horizon'],
 [58,'rite-des-voix-accordees']
]);
assert.equal(AU_DELA_GALLERY_ART.length,10);
assert.ok(Object.isFrozen(AU_DELA_GALLERY_ART));
assert.deepEqual(AU_DELA_GALLERY_ART.map(item=>[item.id,item.slug]),expected);
assert.ok(AU_DELA_GALLERY_ART.every(item=>Object.isFrozen(item)));
function dimensions(path){
 const buf=readFileSync(path);
 assert.ok(buf.length>20000,'Illustration HD ou miniature manquante : '+path);
 assert.equal(buf.toString('ascii',0,4),'RIFF');
 assert.equal(buf.toString('ascii',8,12),'WEBP');
 assert.equal(buf.toString('ascii',12,16),'VP8 ');
 assert.equal(buf.readUInt32LE(4)+8,buf.length);
 assert.deepEqual([...buf.subarray(23,26)],[0x9d,0x01,0x2a]);
 return [buf.readUInt16LE(26)&0x3fff,buf.readUInt16LE(28)&0x3fff];
}
for(const art of AU_DELA_GALLERY_ART){
 const card=AU_DELA_DU_VERRE_DRAFT.find(c=>c.id===art.id);
 assert.ok(card,'Correspondance absente du catalogue : '+art.id);
 assert.equal(art.name,card.name);
 assert.equal(art.type,card.type);
 assert.equal(art.rarity,card.rarity);
 assert.equal(art.lore,card.lore);
 assert.deepEqual(dimensions('assets/cards/'+art.slug+'.webp'),[1024,1536]);
 assert.deepEqual(dimensions('assets/cards/'+art.slug+'-thumb.webp'),[350,525]);
 assert.ok(statSync('assets/cards/'+art.slug+'-thumb.webp').size<
  statSync('assets/cards/'+art.slug+'.webp').size,
  'La vignette doit être plus légère : '+art.slug);
}
// Le pilote n° 49 et les neuf nouvelles cartes se consultent dans la
// galerie ; aucune image ne se retrouve dans un pool de cartes obtenables.
assert.equal(PUBLISHED.length,48);
assert.equal(ORIGINES.length,24);
assert.equal(collectionById('marches-de-verre','au-dela-du-verre').released,false);
assert.deepEqual(cardsForCollection(PUBLISHED,'marches-de-verre','au-dela-du-verre'),[]);
for(const fixed of [0,.05,.3,.62,.9,.999]){
 assert.ok(drawPack(()=>fixed).every(item=>item.id<=24));
 assert.ok(drawRefletsPack(()=>fixed).every(item=>item.id>=25&&item.id<=48));
}
assert.ok(!read('src/collection-data.js').includes('au-dela-gallery'));
assert.ok(!read('src/card-art.js').includes('mousse-de-l-entreverre'));
assert.ok(main.includes("const SAVE='aetherium-save-v1'"));
assert.ok(html.includes('id="au-dela-gallery" class="au-dela-gallery" hidden'));
assert.ok(html.includes('id="au-dela-gallery-grid"'));
assert.ok(html.includes('au-dela-gallery.css?v=au-dela-lot-1'));
assert.ok(html.includes('main.js?v=au-dela-lot-1'));
assert.ok(main.includes("from './au-dela-gallery.js?v=au-dela-lot-1'"));
assert.ok(main.includes("$('#au-dela-gallery').hidden=!showAuDelaTeaser;"));
assert.ok(main.includes("if(showAuDelaTeaser)mountAuDelaGallery($('#au-dela-gallery-grid'));"));
assert.ok(main.includes("$('#collection-layout').hidden=isUpcoming"),'Aucun accès à la grille des cartes jouables');
assert.ok(css.includes('#page-collection #au-dela-gallery[hidden]{display:none!important}'));
assert.ok(css.includes('grid-template-columns:repeat(auto-fill'));
assert.ok(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'));
assert.ok(css.includes('image-rendering:pixelated'));
assert.ok(css.includes('prefers-reduced-motion:reduce'));

const node=(tag='')=>({
 tagName:tag,dataset:{},attributes:{},children:[],
 setAttribute(key,value){this.attributes[key]=value},
 append(...children){this.children.push(...children)},
 replaceChildren(...children){this.children=[...children]},
});
globalThis.document={
 createElement:node,
 createDocumentFragment:()=>node('fragment')
};
const container=node('div');
mountAuDelaGallery(container);
assert.equal(container.dataset.loaded,'true');
assert.equal(container.children.length,1,'Les 10 vignettes sont montées dans un fragment unique');
const figures=container.children[0].children;
assert.equal(figures.length,10);
for(let i=0;i<figures.length;i++){
 const fig=figures[i],card=AU_DELA_GALLERY_ART[i];
 assert.equal(fig.tagName,'figure');
 assert.equal(fig.dataset.rarity,card.rarity);
 const [link,caption]=fig.children;
 assert.equal(link.href,card.hd);
 assert.equal(link.target,'_blank');
 assert.equal(link.rel,'noopener');
 assert.equal(link.attributes['aria-label'],'Voir l’illustration HD de '+card.name);
 const [img]=link.children;
 assert.equal(img.src,card.thumb);
 assert.equal(img.srcset,card.thumb+' 350w, '+card.hd+' 1024w');
 assert.equal(img.loading,'lazy');
 assert.equal(img.decoding,'async');
 assert.equal(img.width,350);
 assert.equal(img.height,525);
 assert.equal(caption.children[1].textContent,card.name);
 assert.ok(caption.children[2].textContent.includes(card.lore));
}
mountAuDelaGallery(container);
assert.equal(container.children.length,1,'Pas de double montage sur le même écran');
console.log('AETHERIUM — lot 1 : 10 illustrations bien reliées aux cartes 49–58, 18 nouveaux WebP valides, galerie responsive et collection non publiée.');
