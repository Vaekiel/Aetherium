// AETHERIUM — visible rarity borders and static glows across the whole game.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {RARITIES} from '../src/data.js';

const html=readFileSync('index.html','utf8');
const theme=readFileSync('src/theme.css','utf8');
const chromatic=readFileSync('src/chromatic.css','utf8');
const finishes=readFileSync('src/finishes.css','utf8');
const booster=readFileSync('src/booster.css','utf8');
const main=readFileSync('src/main.js','utf8');
const rarityCSS=readFileSync('src/rarity-frames.css','utf8');

assert.equal(RARITIES.common.color,'#f9fbff','Commune color must be white, not lavender');
assert.deepEqual(Object.keys(RARITIES),['common','uncommon','rare','epic','legendary'],
  'Five historical rarity types stay unchanged');
assert.equal(RARITIES.common.weight,55);
assert.equal(RARITIES.uncommon.weight,27);
assert.equal(RARITIES.rare.weight,12);
assert.equal(RARITIES.epic.weight,5);
assert.equal(RARITIES.legendary.weight,1);
assert.ok(html.includes('src/rarity-frames.css?v=rarity-halo-1'));
assert.ok(html.indexOf('src/rarity-frames.css')>html.indexOf('src/finishes.css'),
  'Rarity overlay must load after all finishes to keep borders visible');
assert.ok(html.indexOf('src/rarity-frames.css')>html.indexOf('src/codex.css'),
  'Rarity overlay must load after Codex mobile rules');
assert.ok(html.includes('&amp;rarity=1'),'JS cache must refresh rarity data attributes');
assert.ok(main.includes('if(!reallyLocked)b.dataset.rarity=c.rarity'),
  'Revealed gallery and booster cards expose rarity; sealed archives do not');
assert.ok(main.includes('panel.dataset.rarity=c.rarity'),
  'Large inspector receives the same rarity as gallery');
assert.ok(main.includes('delete panel.dataset.rarity'),
  'Sealed/empty inspector must never show a previously selected rarity halo');
for(const key of Object.keys(RARITIES)){
 assert.ok(rarityCSS.includes('.card[data-rarity="'+key+'"]'),key+' card color mapping missing');
 assert.ok(rarityCSS.includes('.inspector[data-rarity="'+key+'"]'),key+' inspector mapping missing');
}
const white=rarityCSS.match(/\.card\[data-rarity="common"\],[\s\S]*?--rarity-line:([^;]+);/);
assert.ok(white&&['#fff','#ffffff','#f9fbff'].includes(white[1].trim()),
  'Common rarity must have a visibly WHITE outer frame');
assert.match(rarityCSS,/\.card\[data-rarity\]:not\(\.is-sealed\)\s*\{[\s\S]*?border:3px solid var\(--rarity-line/);
assert.match(rarityCSS,/#page-boosters \.pull-flip\.is-revealed \.pull-front \.card\[data-rarity\]\s*\{[\s\S]*?border-width:4px/);
assert.match(rarityCSS,/#page-boosters \.booster-gallery \.card\[data-rarity\]/);
assert.match(rarityCSS,/#page-collection \.inspector\[data-rarity\] > \.inspector-art-shell/);
assert.ok(rarityCSS.includes('var(--rarity-glow'), 'Glows must use rarity-dependent colors');
assert.ok(rarityCSS.includes('var(--rarity-glow-strong'), 'Boosters get clearer rarity halo');
assert.ok(rarityCSS.includes('@media(max-width:600px)'),'Phone card frames must remain legible');
assert.ok(rarityCSS.includes('prefers-reduced-motion:reduce'),
  'Halo must be static and accessible with reduced motion');
assert.ok(!rarityCSS.includes('animation:'), 'Do not animate rarity halo on every card');
assert.ok(theme.includes('.card .info:before'), 'Card ornament stays aligned');
assert.ok(chromatic.includes('@keyframes chromatic-rim-orbit'),
  'Chromatique animated INNER foil still exists');
assert.ok(finishes.includes('.card.is-holographic .finish-art-window::after'),
  'Holographic art overlay must stay intact');
assert.ok(finishes.includes('.card.is-calligraphic .finish-art-window img'),
  'Calligraphic paper/ink appearance must stay intact');
assert.ok(booster.includes('.booster-single .pull-flip.is-revealed .pull-front'),
  'Single-card booster reveal is unchanged');
console.log('Aetherium rarity halos: Commune white; Inhabituelle green; Rare blue; Epique purple; Legendaire gold. Gallery, single booster, recap, inspector, chromatic/holocalligraphic all preserved.');
