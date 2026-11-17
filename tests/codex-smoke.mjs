import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(path,'utf8');
const asModule=source=>'data:text/javascript;charset=utf-8,'+encodeURIComponent(read(source));
const data=await import(asModule('src/data.js'));
const {CARDS,CHROMATIC_RATE,PACK_PRICE}=data;
const {SEASONS,CARDS_PER_COLLECTION,COLLECTIONS_PER_SEASON,CARDS_PER_SEASON,seasonById,
  collectionById,cardsForCollection,collectionForCard,seasonProgress}=await import(asModule('src/seasons.js'));
const {codexProgress,filterCodex}=await import(asModule('src/codex.js'));
assert.equal(CARDS.length,24,'Existing Origines set retains exactly 24 unique cards');
assert.equal(CARDS_PER_COLLECTION,24);
assert.equal(COLLECTIONS_PER_SEASON,3);
assert.equal(CARDS_PER_SEASON,72);
assert.equal(SEASONS.length,2,'Marches de Verre and Plateau Nébuleux in the roadmap');
assert.deepEqual(SEASONS.map(s=>s.title),['Les Marches de Verre','Le Plateau Nébuleux']);
for(const season of SEASONS){
 assert.equal(season.plannedCards,72);
 assert.equal(season.collections.length,3);
 assert.ok(season.collections.every(p=>p.plannedCards===24));
 assert.ok(season.collections.at(-1).signature,'Final collection reserves its Signature slot');
}
assert.equal(seasonById('marches-de-verre').number,1);
assert.equal(collectionById('marches-de-verre','origines').title,'Origines');
assert.equal(collectionById('marches-de-verre','reflets-brises').released,false);
assert.equal(collectionById('marches-de-verre','au-dela-du-verre').released,false);
assert.equal(cardsForCollection(CARDS,'marches-de-verre','origines').length,24);
assert.deepEqual(cardsForCollection(CARDS,'marches-de-verre','origines').map(c=>c.id),CARDS.map(c=>c.id),
 'The first collection contains all existing cards in their original order');
assert.equal(cardsForCollection(CARDS,'marches-de-verre','reflets-brises').length,0);
assert.equal(cardsForCollection(CARDS,'marches-de-verre','au-dela-du-verre').length,0);
assert.equal(cardsForCollection(CARDS,'plateau-nebuleux','plateau-1').length,0);
assert.equal(cardsForCollection(CARDS,'not-a-season','origines').length,0);
assert.equal(collectionForCard(CARDS[0]).collection.id,'origines');
assert.equal(collectionForCard(CARDS[23]).season.id,'marches-de-verre');
assert.equal(collectionForCard({id:72}),null,'Future Signature card does not exist yet');
const owned={1:2,6:1,7:1,22:1},shiny={1:true,6:true,22:true,3:true};
assert.deepEqual(seasonProgress(CARDS,owned,shiny,'marches-de-verre'),{
 planned:72,released:24,discovered:4,chromatic:3,
 collectionsReleased:1,collectionsPlanned:3,percentReleased:33,percentCollected:17
});
assert.deepEqual(seasonProgress(CARDS,owned,shiny,'plateau-nebuleux'),{
 planned:72,released:0,discovered:0,chromatic:0,
 collectionsReleased:0,collectionsPlanned:3,percentReleased:0,percentCollected:0
});
assert.deepEqual(codexProgress(CARDS,owned,shiny),{
 total:24,discovered:4,chromatic:3,missing:20,percent:17,chromaticPercent:13
},'Counters reflect published cards, not the 72 planned slots');
assert.deepEqual(codexProgress([],owned,shiny),{
 total:0,discovered:0,chromatic:0,missing:0,percent:0,chromaticPercent:0
});
const origines=cardsForCollection(CARDS,'marches-de-verre','origines');
assert.equal(filterCodex(origines,{discovery:'collected',owned,shiny}).length,4);
assert.equal(filterCodex(origines,{discovery:'missing',owned,shiny}).length,20);
assert.equal(filterCodex(origines,{finish:'chromatic',owned,shiny}).length,3);
assert.equal(filterCodex(origines,{query:'Eclaireuse'}).length,1,'Search ignores accents');
assert.equal(filterCodex(origines,{type:'Héros',rarity:'legendary'}).length,1);
assert.equal(filterCodex(origines,{finish:'chromatic',discovery:'missing',owned,shiny}).length,0);
assert.equal(filterCodex([],{query:'dragon'}).length,0,'No future catalog is fabricated');
assert.equal(CHROMATIC_RATE,0.03,'Chromatic probability unchanged');
assert.equal(PACK_PRICE,100,'Booster price unchanged');
const main=read('src/main.js'),html=read('index.html'),css=read('src/codex.css');
for(const control of ['codex-season-list','codex-collection-list','codex-season-title',
 'codex-season-publication','codex-season-discovered','codex-season-published-track',
 'codex-upcoming','codex-upcoming-title','codex-upcoming-note','collection-layout',
 'codex-progress-discovered','codex-progress-chromatic',
 'codex-results','codex-chapter-title']){
 assert.ok(html.includes('id="'+control+'"'),'Codex includes '+control);
}
assert.ok(html.includes('class="codex-discovery-tabs"'),'Discovery tabs remain present');
assert.ok(html.includes('id="codex-milestones"')&&html.includes('id="codex-milestones-list"'),
 'Released collections offer an expandable discovery journal');
assert.ok(main.includes('renderCollectionMilestones(availableCards)'),
 'Season collections render actual unique-card milestones');
assert.ok(html.includes('src/codex.css?v=seasons-1.7.1'),'Season CSS is cache-busted');
assert.ok(html.includes('src/main.js?v=titres-1.7.3'),'Season JS is cache-busted');
assert.ok(main.includes("from './seasons.js'"),'Main imports season catalogue');
assert.ok(main.includes("from './codex.js'"),'Main imports filtering and counts');
assert.ok(main.includes('function renderCodexSeasons()'),'Season controls are wired');
assert.ok(main.includes('function renderCollection()'),'Collection panel remains reactive');
assert.ok(main.includes('cardsForCollection(CARDS,activeSeason,activeCollection)'),
 'Only released cards can enter active gallery');
assert.ok(main.includes("$('#collection-layout').hidden=isUpcoming"),
 'Upcoming collections hide real card controls');
assert.ok(main.includes("$('#codex-upcoming').hidden=!isUpcoming"),
 'Upcoming seasons have a dedicated preview panel');
assert.ok(main.includes('renderCodexSeasons();'),'Season navigation drives Codex');
assert.ok(!main.includes('activeChapter')&&!main.includes('CODEX_CHAPTERS'),'Old 6-card chapters removed');
assert.ok(main.includes('function inspectSealed('),'Undiscovered cards still have an inspection state');
assert.ok(main.includes('function addCodexNavigation('),'Inspection supports turning pages');
assert.ok(main.includes('filterCodex(availableCards,'),'Gallery filters selected release only');
assert.ok(main.includes("if(reallyLocked)inspectSealed(c)"),'Sealed cards do not reveal artwork');
assert.ok(main.includes("const SAVE='aetherium-save-v1'"),'Existing save key preserved');
assert.ok(css.includes('@media(max-width:850px)'),'Mobile season navigation exists');
assert.ok(css.includes('prefers-reduced-motion'),'Reduced motion supported');
assert.ok(css.includes('#page-collection .codex-season-list'),'Season selector styled');
assert.ok(css.includes('#page-collection #collection-layout[hidden]'),
 'Future collection hides inaccessible gallery and filter panels');
assert.ok(css.includes('.codex-sealed-art'),'Existing card silhouettes preserved');
assert.ok(main.includes("target.showPopover()")&&main.includes("inspectorShell.hidePopover()"),
 'Codex inspector still uses top-layer popover on mobile');
assert.ok(html.includes('<section id="page-collection" class="page"><div id="sheet-scrim"'),
 'Mobile scrim retained in correct context');
assert.ok(!html.includes('</main><div id="sheet-scrim"'),
 'Scrim cannot cover inspected image');
assert.ok(!read('src/seasons.js').includes('localStorage'),'Season metadata cannot mutate saves');
assert.ok(!read('src/codex.js').includes('localStorage'),'Codex helpers cannot mutate saves');
const artSource=read('src/card-art.js');
assert.ok(artSource.includes("img.srcset=approved.thumbnail+version+' 350w, '+approved.full+version+' 1138w'"),
  'Gallery thumbnails support HD sources on dense mobile displays');
assert.ok(artSource.includes("(max-width: 589px)")&&artSource.includes("(max-width: 850px)"),
  'Source selection respects the mobile two- and three-column layouts');
assert.ok(artSource.includes("img.removeAttribute('srcset')"),
  'Fallback illustrations clear responsive candidates');
assert.ok(main.includes("applyCardIllustration(revealedImage,item.card,{shiny:item.shiny,size:'full'})"),
  'Single booster reveal loads the full HD illustration');
assert.ok(main.includes("applyCardIllustration(img,c,{shiny:chromatic,size:'full'})"),
  'Full-screen Codex inspection keeps the original HD illustration');
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
assert.ok(html.includes('theme.css?v=card-ornament-1')&&html.includes('mobile.css?v=inspector-layer-3'),
  'Caches refreshed for both the card ornament and mobile inspection layers');
console.log('AETHERIUM 1.7 : saisons, 24 cartes existantes, filtres, HD et sauvegardes OK');
