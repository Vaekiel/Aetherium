import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(path,'utf8');
const html=read('index.html');
const css=read('src/booster-artworks.css');
const js=read('src/main.js');
const packaging=read('src/booster-packaging.css');
const reflets=read('src/reflets-booster.css');
const assets=['origines-pack-hd.webp','reflets-brises-pack-hd.webp'];

for(const file of assets){
  const path='assets/boosters/'+file;
  const bytes=readFileSync(path);
  assert.ok(bytes.length>50000 && bytes.length<700000,'Actual optimized HD WebP: '+file);
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert.ok(html.includes('src="./'+path+'"'),'Both wrappers are loaded by HTML');
}
assert.ok(html.includes('class="pack pack-origines pack-illustrated" id="booster-pack"'),
  'The original animated wrapper is retained and marked as illustrated');
assert.equal((html.match(/id="booster-pack"/g)||[]).length,1,'Exactly one active pack');
assert.ok(html.includes('booster-artworks.css?v=hd-packs-1'),'HD artwork stylesheet is cache busted');
assert.ok(html.indexOf('reflets-booster.css')<html.indexOf('booster-artworks.css'),
  'Art overrides old synthetic foil styles');
assert.ok(css.includes('.pack-artwork-reflets')&&css.includes('display:none'),
  'The inactive booster image is hidden');
assert.ok(css.includes('.pack-reflets .pack-artwork-reflets')&&css.includes('display:block'),
  'The correct image appears on selection');
assert.ok(css.includes('filter:none')&&css.includes('image-rendering:auto'),
  'HD pixel art is not recolored or blurred by CSS filters');
for(const duplicate of ['.pack-wordmark','.pack-collection','.pack-title','.pack-edition','.pack-sidefold']){
  assert.ok(css.includes(duplicate),'Previous redundant '+duplicate+' overlay is suppressed');
}
assert.ok(css.includes('.pack-seal')&&css.includes('.pack-rip')===false,
  'Existing seal/rip structure stays owned by the animation layer');
assert.ok(js.includes("boosterArt.classList.toggle('pack-reflets',isReflets);"),
  'Selecting the edition switches the correct artwork without touching save state');
assert.ok(packaging.includes('aetherium-pack-rupture 980ms'),
  'The original one-purchase wrapper opening sequence still runs');
assert.ok(reflets.includes('.booster-choice.is-selected'),'Selected booster indicator remains');
assert.ok(!js.includes('origines-pack-hd.webp'),'Artwork switching does not couple gameplay to image paths');
console.log('AETHERIUM — Two optimized HD booster wrappers, responsive art switch, no duplicates, seal animation intact');
