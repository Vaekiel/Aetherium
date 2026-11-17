import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(path,'utf8');
const data=await import('data:text/javascript;charset=utf-8,'+encodeURIComponent(read('src/data.js')));
const {CODEX_CHAPTERS,chapterFor,chapterCards,codexProgress,filterCodex}=await import(
  'data:text/javascript;charset=utf-8,'+encodeURIComponent(read('src/codex.js')));
const {CARDS,CHROMATIC_RATE,PACK_PRICE}=data;
assert.equal(CARDS.length,24,'Original set remains 24 cards');
assert.equal(CODEX_CHAPTERS.length,4,'Exactly four chapters');
assert.deepEqual(CODEX_CHAPTERS.map(ch=>chapterCards(CARDS,ch.id).length),[6,6,6,6],'Chapters have six cards each');
for(const card of CARDS)assert.ok(chapterFor(card),'Every existing card belongs to a chapter');
assert.equal(new Set(CODEX_CHAPTERS.flatMap(ch=>chapterCards(CARDS,ch.id).map(c=>c.id))).size,24,
  'Chapters do not duplicate or lose any card');
const owned={1:2,6:1,7:1,22:1},shiny={1:true,6:true,22:true,3:true};
assert.deepEqual(codexProgress(CARDS,owned,shiny),{
  total:24,discovered:4,chromatic:3,missing:20,percent:17,chromaticPercent:13
},'Counts use only acquired cards and valid Chromatiques');
assert.deepEqual(codexProgress(chapterCards(CARDS,'lueurs'),owned,shiny),{
  total:6,discovered:2,chromatic:2,missing:4,percent:33,chromaticPercent:33
});
assert.equal(filterCodex(CARDS,{chapter:'lueurs'}).length,6);
assert.equal(filterCodex(CARDS,{discovery:'collected',owned,shiny}).length,4);
assert.equal(filterCodex(CARDS,{discovery:'missing',owned,shiny}).length,20);
assert.equal(filterCodex(CARDS,{finish:'chromatic',owned,shiny}).length,3);
assert.equal(filterCodex(CARDS,{chapter:'lueurs',finish:'chromatic',owned,shiny}).length,2);
assert.equal(filterCodex(CARDS,{chapter:'astres',discovery:'collected',owned,shiny}).length,1);
assert.equal(filterCodex(CARDS,{chapter:'lueurs',discovery:'missing',owned,shiny}).length,4);
assert.equal(filterCodex(CARDS,{query:'Eclaireuse'}).length,1,'Search ignores accents');
assert.equal(filterCodex(CARDS,{type:'Héros',rarity:'legendary'}).length,1,'Existing filters compose with chapters');
assert.equal(filterCodex(CARDS,{finish:'chromatic',discovery:'missing',owned,shiny}).length,0);
assert.equal(CHROMATIC_RATE,0.03,'Chromatic probability is unchanged');
assert.equal(PACK_PRICE,100,'Booster cost is unchanged');
const main=read('src/main.js'),html=read('index.html'),css=read('src/codex.css');
for(const control of ['codex-chapter-list','codex-progress-discovered','codex-progress-chromatic',
  'codex-discovery-tabs','codex-results','codex-chapter-title']){
  assert.ok(html.includes(control),'Codex markup includes '+control);
}
assert.ok(html.includes('src/codex.css?v=codex-1.5.1'),'Codex stylesheet versioned');
assert.ok(html.includes('src/main.js?v=codex-1.5'),'Codex script versioned');
assert.ok(main.includes("from './codex.js'"),'Main module imports chapter helpers');
assert.ok(main.includes('function renderCodexChapters()'),'Album counters are connected');
assert.ok(main.includes('function inspectSealed('),'Undiscovered cards have an inspection state');
assert.ok(main.includes('function addCodexNavigation('),'Inspection supports turning pages');
assert.ok(main.includes('filterCodex(CARDS,'),'Gallery uses pure filter logic');
assert.ok(main.includes("if(reallyLocked)inspectSealed(c)"),'Sealed cards do not reveal artwork');
assert.ok(main.includes("const SAVE='aetherium-save-v1'"),'Existing save key preserved');
assert.ok(css.includes('@media(max-width:850px)'),'Mobile chapter rail supported');
assert.ok(css.includes('prefers-reduced-motion'),'Reduced-motion supported');
assert.ok(css.includes('.codex-sealed-art'),'Sealed cards have a placeholder illustration');
assert.ok(!read('src/codex.js').includes('localStorage'),'Chapters never write to a save');
const theme=read('src/theme.css'),mobile=read('src/mobile.css'),chromaticCSS=read('src/chromatic.css');
assert.ok(theme.includes('.card .info:before{content:"◆"'),'Card ornament belongs to the info band');
assert.ok(theme.includes('.card .info{position:relative;'),'Info band is the ornament anchor');
assert.ok(theme.includes('top:-8px'),'Ornament stays at the image/info boundary');
assert.ok(!theme.includes('.card:before{content:"◆"'),'Cards no longer use fixed bottom offsets');
assert.ok(!theme.includes('.card:before{bottom:'),'No obsolete phone ornament positioning');
assert.ok(!mobile.includes('.gallery .card:before{bottom:'),'Mobile no longer positions ornaments by card height');
assert.ok(mobile.includes('.gallery .card .info{padding:17px'),'Phone titles have room under their ornament');
assert.ok(chromaticCSS.includes('.card.is-chromatic .info:before'),'Chromatic ornament follows the info band');
assert.ok(!chromaticCSS.includes('.card.is-chromatic:before{'),'Chromatic cards do not revive the faulty placement');
assert.ok(css.includes('.card.is-sealed .info:before'),'Sealed cards use the same aligned ornament');
assert.ok(html.includes('theme.css?v=card-ornament-1')&&html.includes('mobile.css?v=card-ornament-1'),'Caches refreshed on mobile');
console.log('AETHERIUM 1.5 : albums, progression, filtres, sauvegardes et gameplay OK');
