import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const read=path=>readFileSync(path,'utf8');
const {CARDS,drawPack,CHROMATIC_RATE,RARITIES}=await import(
 'data:text/javascript;charset=utf-8,'+encodeURIComponent(read('src/data.js')));
assert.equal(CHROMATIC_RATE,0.03,'Chromatique: exactly 3% per card');
assert.ok(drawPack(()=>0.02999).every(item=>item.shiny),'Below threshold is chromatic');
assert.ok(drawPack(()=>0.03).every(item=>!item.shiny),'At threshold is normal');
let seed=0x4f3d2b19;
const rng=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
let total=0,chrome=0;
for(let i=0;i<6000;i++)for(const card of drawPack(rng)){total++;if(card.shiny)chrome++}
assert.ok(Math.abs(chrome/total-0.03)<0.005,
 'Seeded 30k-card simulation stays near 3% (actual '+chrome+'/'+total+')');
for(const card of drawPack(()=>0.54))
 assert.ok(RARITIES[CARDS[card.id-1].rarity],'Rarity distribution is unchanged');

const main=read('src/main.js'),html=read('index.html'),css=read('src/chromatic.css'),art=read('src/card-art.js');
assert.ok(main.includes("const SAVE='aetherium-save-v1'"),'Legacy localStorage key unchanged');
assert.ok(main.includes('state.shiny[card.id]=true'),'Existing Shiny save flags are maintained and reused');
assert.ok(main.includes("'✧ CHROMATIQUE'"),'Chromatic badge is distinct');
assert.ok(main.includes('is-chromatic'),'Chromatic gallery / booster uses foil');
assert.ok(main.includes("filterFinish==='chromatic'"),'Chromatic collection filter active');
assert.ok(main.includes("filterFinish==='normal'"),'Normal collection filter active');
assert.ok(main.includes("$('#codex-chromatic-count')"),'Desktop Codex count tracks chromatic discoveries');
assert.ok(main.includes("$('#mobile-chromatic-count')"),'Mobile Codex count tracks chromatic discoveries');
assert.ok(main.includes("Voir la version Chromatique"),'Inspector can switch to chromatic');
assert.ok(main.includes("tile.classList.add('chromatic-unveiling')"),'Special reveal triggers after flipping');
assert.ok(main.includes('item.shiny?950:420'),'Reveals remain player-controlled with a slightly longer chromatic pause');
assert.ok(main.includes('drawSummary.shinyCount+\' Chromatique(s)\''),'Booster recap announces Chromatiques');
assert.ok(html.includes('data-finish="chromatic"')&&html.includes('data-finish="normal"'),'Variant filter options exist');
assert.ok(html.includes('Chromatique : 3 % par carte'),'Booster odds are visible to players');
assert.ok(html.includes('src/chromatic.css?v=chromatiques-6'),'Enhanced foil CSS is cache-busted');
assert.ok(html.includes('src/main.js?v='),'Current Codex JS is cache-busted');
assert.ok(css.includes('.card.is-chromatic')&&css.includes('var(--chrom-edge)'),'Static foil border is present');
assert.ok(css.includes('.inspector-art-shell.is-chromatic'),'Full inspector displays prismatic art frame');
assert.ok(!html.includes('id="chromatic-showcase"')&&!html.includes('Normale ou Chromatique ?'),
  'The separate Codex Chromatic comparison box is removed');
assert.ok(!html.includes('id="chromatic-example-normal"')&&!html.includes('id="chromatic-example-special"'),
  'Old comparison images are removed');
assert.ok(!main.includes('comparisonCard')&&!main.includes('chromatic-example-'),
  'Runtime no longer loads detached comparison images');
assert.ok(!css.includes('chromatic-showcase'),'Orphaned comparison CSS removed');
assert.ok(main.includes("const previewChromatic=!!shiny&&!ownedChromatic&&!!chromaticPreview;"),'Non-owned Chromatiques can be previewed without being granted');
assert.ok(main.includes("selectedCard={id:c.id,shiny:chromatic,preview:previewChromatic};"),'Preview status is tracked without editing the save');
assert.ok(main.includes('✧ Prévisualiser en Chromatique'),'Inspector lets users compare their chosen card');
assert.ok(main.includes('APERÇU · NON POSSÉDÉ'),'Inspector marks unowned chromatic finish');
assert.ok(main.includes("const art=el('span','chromatic-art-window')"),'Owned Chromatic thumbnails receive a separate art overlay');
assert.ok(css.includes('.card.is-chromatic .chromatic-art-window:after'),'Prismatic foil overlays the illustration');
assert.ok(css.includes('border-width:3px!important'),'Chromatic thumbnails are distinct even when still');
assert.ok(css.includes('@media(max-width:850px)'),'Comparison stays responsive on phones');
assert.ok(css.includes('@keyframes chromatic-rim-orbit'),'Chromatique has a visibly rotating border');
assert.ok(css.includes('animation:chromatic-rim-orbit 5.5s linear infinite'),'Prismatic frame movement is continuous');
assert.ok(css.includes('.chromatic-art-window::before'),'Chromatic collection and booster frames have an animated rim');
assert.ok(css.includes('.inspector-art-shell.is-chromatic::before'),'Full-size inspector has an animated rim');
assert.ok(css.includes('animation:none!important;'),'Reduced-motion keeps a static chromatic border');
assert.ok(main.includes("front.append(boosterCardArtwork(item))"),'The booster face-up view uses the same Chromatique artwork and frame');
assert.ok(css.includes('.booster-single .pull-front .card.is-chromatic .chromatic-art-window'),'Revealed booster card has its own visible prismatic rim');
assert.ok(css.includes('animation:chromatic-rim-orbit 2.6s linear infinite'),'The booster rim visibly orbits faster');
assert.ok(css.includes('.pull-flip.is-chromatic.is-revealed .pull-front .card.is-chromatic'),'The booster halo is limited to revealed Chromatiques');
assert.ok(css.includes('@keyframes chromatic-booster-halo'),'The booster halo keeps moving while the card is face-up');
assert.ok(css.includes('animation:none!important;'),'Reduced-motion disables the booster effects');
assert.ok(css.includes('chromatic-pulse'),'Reveal halo is present');
assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'),'Reduced motion is supported');
assert.ok(art.includes("img.style.filter='none'"),'All 24 final artworks are not hue-rotated by the effect');
assert.ok(!html.includes('Shiny'),'No outdated player-facing Shiny naming');

// Execute the actual localStorage reader in a sandbox to verify legacy progress.
const {sanitizeMilestoneClaims}=await import('data:text/javascript;charset=utf-8,'+
  encodeURIComponent(read('src/collection-milestones.js')));
const freshCode=main.slice(main.indexOf('const fresh='),main.indexOf('function load(){'));
const loadCode=main.slice(main.indexOf('function load(){'),main.indexOf('let state=load();'));
assert.ok(freshCode.startsWith('const fresh='),'Save defaults recovered for test');
assert.ok(loadCode.startsWith('function load(){'),'Real save reader recovered for test');
const legacy={
 coins:225,dust:85,wins:4,earned:1200,opened:10,
 owned:{1:2,22:1},shiny:{22:true,12:true},goalId:3
};
const state=vm.runInNewContext(freshCode+loadCode+'load()',{
 localStorage:{getItem:key=>key==='aetherium-save-v1'?JSON.stringify(legacy):null},
 CARDS,SAVE:'aetherium-save-v1',sanitizeMilestoneClaims
});
assert.equal(state.coins,225,'Coins retained');
assert.equal(state.dust,85,'Shards retained');
assert.equal(state.wins,4,'Wins retained');
assert.equal(state.opened,10,'Booster count retained');
assert.equal(state.owned[22],1,'Legendary card retained');
assert.equal(state.shiny[22],true,'Previously acquired Shiny loads as Chromatique');
assert.equal(state.shiny[12],undefined,'Unowned variant flags are not injected');
assert.equal(state.goalId,3,'Desired card retained');
console.log('AETHERIUM — Chromatiques: 3% / rendu / filtres / compatibilité sauvegardes OK');
