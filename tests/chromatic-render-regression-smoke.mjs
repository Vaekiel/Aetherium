// Regression audit: every Chromatique keeps its authored art, independent of finish.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CARDS} from '../src/collection-data.js';
import {CARD_ART,applyCardIllustration} from '../src/card-art.js';
import {RARITIES} from '../src/data.js';

assert.equal(CARDS.length,72,'Three released collections contain 72 cards');
assert.deepEqual(CARDS.map(card=>card.id),Array.from({length:72},(_,i)=>i+1));
assert.equal(Object.keys(CARD_ART).length,72,'One authored illustration set per card');

const img=()=>({
  style:{},
  removeAttribute(key){delete this[key]}
});
for(const card of CARDS){
  const art=CARD_ART[card.id];
  assert.ok(art,'No missing artwork registry entry: '+card.id);
  for(const candidate of [art.thumbnail,art.full]){
    const bytes=readFileSync(candidate.replace(/^\.\//,''));
    assert.ok(bytes.length>10000,'Illustration not empty: '+candidate);
    assert.equal(bytes.toString('ascii',0,4),'RIFF','Valid WebP RIFF header '+candidate);
    assert.equal(bytes.toString('ascii',8,12),'WEBP','Valid WebP format '+candidate);
  }
  for(const size of ['thumbnail','full']){
    const normal=img(),chromatic=img();
    applyCardIllustration(normal,card,{shiny:false,size});
    applyCardIllustration(chromatic,card,{shiny:true,size});
    assert.equal(chromatic.src,normal.src,'Same authored image for Chromatique: '+card.id);
    assert.equal(chromatic.srcset,normal.srcset,'Same responsive candidates: '+card.id);
    assert.equal(chromatic.style.filter,'none','No Chromatique recoloring: '+card.id);
    // Force a failed high-density/full image: authored thumbnail is preferred.
    if(size==='full'){
      chromatic.currentSrc='https://example.test'+art.full.slice(1);
      chromatic.onerror();
      assert.ok(chromatic.src.startsWith(art.thumbnail),
        'An approved thumbnail survives a failed full image: '+card.id);
    }else{
      chromatic.currentSrc='https://example.test'+art.thumbnail.slice(1);
      chromatic.onerror();
      assert.ok(chromatic.src.startsWith(art.full),
        'An approved HD image survives a failed thumbnail: '+card.id);
    }
    assert.equal(chromatic.srcset,undefined,'No stale srcset after fallback');
  }
}
const main=readFileSync('src/main.js','utf8');
const css=readFileSync('src/chromatic.css','utf8');
const html=readFileSync('index.html','utf8');
assert.match(main,/Object\.assign\(artwork\.dataset,buttonCard\.dataset\)/,
  'Single-card booster reveal must preserve data-rarity and data-card-id');
assert.match(css,/\.card\.is-chromatic::after\s*\{content:none!important\}/,
  'No duplicate overlay on card titles or on the rarity frame');
assert.match(css,/\.chromatic-art-window:after\s*\{/,
  'Chromatic foil continues over the illustration');
assert.match(css,/@keyframes chromatic-rim-orbit/,
  'Prismatic border remains animated');
assert.match(css,/\.pull-front::after\s*\{/,
  'Booster halo lives on its own layer, separate from HD art');
assert.doesNotMatch(css,/animation:chromatic-booster-halo[^;]*;[^}]*filter:drop-shadow/s,
  'The booster face is never rasterized with an animated image filter');
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/,
  'Motion-reduction preference remains supported');
assert.ok(html.includes('src/chromatic.css?v=chromatiques-7'),
  'The corrected foil is not hidden behind the old cache');
assert.ok(html.includes('chromatic=audit-1'),
  'The corrected image-loading code is not hidden behind an old JS cache');
assert.equal(RARITIES.common.color,'#f9fbff','White common frame remains unchanged');
console.log('AETHERIUM Chromatique: 72 authored artworks, 144 valid WEBP assets, fallbacks, rarity metadata, mobile foil and cache versions OK');
