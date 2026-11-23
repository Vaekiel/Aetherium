import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(path,'utf8');
const html=read('index.html');
const css=read('src/booster-artworks.css');
const js=read('src/main.js');
const packaging=read('src/booster-packaging.css');
const reflets=read('src/reflets-booster.css');
const auDela=read('src/au-dela-booster.css');
const assets=['origines-reliquaire-unified-v4.webp','reflets-brises-reliquaire-unified-v4.webp','au-dela-du-verre-reliquaire-v3.webp'];

assert.ok(!html.includes('origines-pack-hd.webp')&&!html.includes('reflets-brises-pack-hd.webp'),
 'Only current pixel-art HD booster packages may be shown');

for(const file of assets){
  const path='assets/boosters/'+file;
  const bytes=readFileSync(path);
  assert.ok(bytes.length>50000 && bytes.length<700000,'Actual optimized HD WebP: '+file);
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
  const url=path;
  assert.ok(html.includes('src="./'+url+'"'),'Every current wrapper is loaded by HTML');
}
assert.ok(html.includes('class="pack pack-origines pack-illustrated reliquaire-origines" id="booster-pack"'),
  'The original animated wrapper is retained and marked as illustrated');
assert.equal((html.match(/id="booster-pack"/g)||[]).length,1,'Exactly one active pack');
assert.ok(html.includes('booster-artworks.css?v=pixel-packs-2'),'HD artwork stylesheet is cache busted');
assert.ok(html.indexOf('reflets-booster.css')<html.indexOf('booster-artworks.css'),
  'Art overrides old synthetic foil styles');
assert.ok(css.includes('.pack-artwork-reflets')&&css.includes('display:none'),
  'The inactive pixel-art booster image is hidden');
assert.ok(css.includes('.pack-reflets .pack-artwork-reflets')&&css.includes('display:block'),
  'The correct image appears on selection');
assert.ok(css.includes('filter:none')&&css.includes('image-rendering:auto')&&css.includes('object-fit:contain'),
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
assert.ok(auDela.includes('.pack-artwork-au-dela')&&auDela.includes('grid-template-columns:repeat(3'),
 'Third illustrated foil wrapper and responsive edition selector are visible');
assert.ok(html.includes('data-booster="au-dela-du-verre"'));
assert.ok(html.includes('au-dela-booster.css?v=au-dela-booster-1'));
assert.ok(js.includes("boosterArt.classList.toggle('pack-au-dela',isAuDela);"));
assert.ok(!js.includes('origines-pack-pixel-hd-v2.webp'),'Artwork switching does not couple gameplay to image paths');
const refletsFullPack=read('src/reflets-reliquaire.css');
const harmony=read('src/ui-harmony.css');
assert.ok(html.includes('class="booster-tile-pack reliquaire-reflets"'),
  'Reflets gallery displays the approved entire packet, not the old inset art window');
assert.ok(js.includes("boosterArt.classList.toggle('reliquaire-reflets',isReflets);"),
  'Reflets dialog switches to its full-packet layout only for the Reflets edition');
assert.ok(harmony.includes('@import "./reflets-reliquaire.css?v=1";'),
  'New full-packet styles are loaded after the shared gallery and Origines styles');
assert.ok(html.includes('reflets=normalized-2'),
  'Clients refresh the CSS bundle when the Reflets packaging is updated');
assert.ok(refletsFullPack.includes('.booster-tile-pack.reliquaire-reflets .pack-scene') &&
  refletsFullPack.includes('#booster-pack.reliquaire-reflets .pack-scene .pack-artwork-reflets') &&
  refletsFullPack.includes('inset:0') && refletsFullPack.includes('object-fit:contain') &&
  refletsFullPack.includes('transform:none'),
  'Reflets pixels are rendered edge-to-edge at their natural proportions without cropping');
assert.ok(refletsFullPack.includes('content:none') && refletsFullPack.includes('.pack-wordmark'),
  'Old crimping and duplicate text no longer obscure the full approved artwork');

const cleanPack=read('src/premium-booster-unified.css');
assert.ok(harmony.includes('@import "./premium-booster-unified.css?v=3";'),
 'A unified correction must override both legacy premium packet layers');
assert.ok(cleanPack.includes('aspect-ratio:8/13')&&cleanPack.includes('height:auto!important')&&
  cleanPack.includes('background:transparent!important')&&cleanPack.includes('filter:drop-shadow('),
 'Premium packs share identical proportions with no opaque rectangular backgrounds');
assert.ok(cleanPack.includes('content:none!important')&&cleanPack.includes('.pack-foil,.pack-sidefold,.pack-crimp,.pack-seal,.pack-rip'),
 'No old decorated wrapper overlays the new HD packaging');
assert.ok(cleanPack.includes(':not(.is-opening)'),'The original tear animation remains available');
assert.ok(cleanPack.includes('.reliquaire-au-dela'),'Third envelope uses the same geometry and alpha edge treatment');
assert.ok(html.includes('class="booster-tile-pack reliquaire-au-dela"'),'Third gallery pack is premium');
assert.ok(js.includes("boosterArt.classList.toggle('reliquaire-au-dela',isAuDela);"),
 'The third booster dialog selects the correct image without old wrappers');
assert.equal((html.match(/src="\.\/assets\/boosters\/au-dela-du-verre-reliquaire-v3\.webp"/g)||[]).length,2);
assert.equal((html.match(/src="\.\/assets\/boosters\/origines-reliquaire-unified-v4\.webp"/g)||[]).length,2);
assert.equal((html.match(/src="\.\/assets\/boosters\/reflets-brises-reliquaire-unified-v4\.webp"/g)||[]).length,2);

console.log('AETHERIUM — Two optimized HD booster wrappers, responsive art switch, no duplicates, seal animation intact');
