import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(p,'utf8');
const html=read('index.html');
const main=read('src/main.js');
const css=read('src/reflets-preview.css');
const season=read('src/seasons.js');
const data=read('src/data.js');
const catalog=await import('data:text/javascript;charset=utf-8,'+encodeURIComponent(read('src/reflets-brises-catalog.js')));
const cards=catalog.REFLETS_BRISES_DRAFT;

const slugs=[
 [25,'eclat-fugueur'],[26,'guetteuse-du-revers'],[27,'papillon-de-silice'],
 [28,'pluie-a-l-envers'],[29,'miroir-d-ecorce'],[30,'loup-aux-deux-ombres'],
 [31,'cartographe-des-absents'],[32,'sentinelle-des-felures'],
 [33,'fil-des-deux-rives'],[34,'serment-retourne']
];
assert.equal(slugs.length,10);
assert.equal(new Set(slugs.map(([,s])=>s)).size,10);
assert.ok(html.includes('id="reflets-batch1-gallery"'));
assert.ok(html.includes('class="reflets-gallery-grid"'));
assert.ok(html.includes('Collection non jouable pour le moment'));
assert.ok(css.includes('#page-collection #reflets-batch1-gallery[hidden]'));
assert.ok(css.includes('@media(max-width:680px)'));
assert.ok(main.includes("$('#reflets-batch1-gallery').hidden=!(isUpcoming&&activeSeason==='marches-de-verre'&&selectedPart.id==='reflets-brises')"));
assert.ok(main.includes("$('#collection-layout').hidden=isUpcoming"));
assert.ok(!main.includes("from './reflets-brises-catalog.js'"));
assert.ok(!data.includes('reflets-brises-catalog.js'));
assert.ok(season.includes("part('reflets-brises'"));
assert.ok(!season.includes('released:true,first:25,last:48'));
assert.ok(html.includes('src/reflets-preview.css?v=reflets-gallery-10'));
assert.ok(html.includes('src/main.js?v=reflets-gallery-10'));
assert.equal((html.match(/class="reflets-gallery-card"/g)||[]).length,10);

for(const [id,slug] of slugs){
 const card=cards.find(c=>c.id===id);
 assert.ok(card,'Draft catalogue must contain '+id);
 assert.ok(html.includes('<h4>'+card.name+'</h4>'),'Missing card name '+id);
 assert.ok(html.includes('« '+card.lore+' »'),'Missing lore '+id);
 for(const suffix of ['.webp','-thumb.webp']){
  const path='assets/cards/reflets/'+slug+suffix;
  assert.ok(html.includes('./'+path),'Missing image link '+path);
  const bytes=readFileSync(path);
  assert.ok(bytes.length>20000,'No placeholder allowed: '+path);
  assert.equal(bytes.toString('ascii',0,4),'RIFF',path);
  assert.equal(bytes.toString('ascii',8,12),'WEBP',path);
 }
}
assert.ok(html.includes('assets/cards/cerf-sans-reflet.webp'),'The approved Cerf preview stays intact');
console.log('Reflets brisés: ten original HD + thumbnail WebPs present, gallery locked and Origines unchanged');
