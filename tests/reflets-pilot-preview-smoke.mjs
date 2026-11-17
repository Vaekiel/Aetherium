import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';

const read=path=>readFileSync(path,'utf8');
const html=read('index.html');
const main=read('src/main.js');
const css=read('src/reflets-preview.css');
const season=read('src/seasons.js');
const gameData=read('src/data.js');
const artwork=read('src/card-art.js');

for(const id of ['codex-upcoming','reflets-art-preview']){
 assert.ok(html.includes('id="'+id+'"'),'The existing upcoming collection hosts '+id);
}
assert.ok(html.includes('src/reflets-preview.css?v=reflets-gallery-10'));
assert.ok(html.includes('src/main.js?v=reflets-gallery-10'));
assert.ok(html.includes('Aperçu visuel uniquement · Carte non disponible dans les boosters'));
assert.ok(main.includes("$('#reflets-art-preview').hidden=!(isUpcoming&&activeSeason==='marches-de-verre'&&selectedPart.id==='reflets-brises')"),
 'A preview must appear ONLY in the locked Reflets brisés chapter');
assert.ok(main.includes("$('#collection-layout').hidden=isUpcoming"),'Unreleased collection does not display a playable gallery');
assert.ok(main.includes("const SAVE='aetherium-save-v1'"),'Existing save key unchanged');
assert.ok(!main.includes("from './reflets-brises-catalog.js'"),'A preview cannot inject cards into the active game');
assert.ok(!gameData.includes('reflets-brises-catalog.js'),'Origines pools are not modified');
assert.ok(!artwork.includes('cerf-sans-reflet'),'Pilot artwork is not counted as an owned or obtainable card');
assert.ok(season.includes("part('reflets-brises'"),'Reflets stays planned');
assert.ok(!season.includes("released:true,first:25,last:48"),'Reflets must not be published before art release');
assert.ok(css.includes('@media(max-width:680px)'),'Preview remains usable on phones');
assert.ok(css.includes('#page-collection #reflets-art-preview[hidden]'),'Unavailable preview must remain hidden');

for(const path of [
 'assets/cards/cerf-sans-reflet.webp',
 'assets/cards/cerf-sans-reflet-thumb.webp'
]){
 const image=readFileSync(path);
 assert.ok(image.length>20000,'Approved pilot artwork must not be replaced with an empty placeholder: '+path);
 assert.equal(image.toString('ascii',0,4),'RIFF','Real WebP asset expected: '+path);
 assert.equal(image.toString('ascii',8,12),'WEBP','Real WebP asset expected: '+path);
}
console.log('AETHERIUM Reflets brisés pilot preview: real HD/thumbnail assets, locked Codex and original collection preserved');
