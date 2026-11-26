import assert from 'node:assert/strict';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {CARDS,CARD_BY_ID,AU_DELA_BOOSTER_CARDS} from '../src/collection-data.js';
import {CARD_ART} from '../src/card-art.js';

assert.equal(CARDS.length,72);
assert.equal(CARD_BY_ID.size,CARDS.length,'Every card ID is unique');
assert.deepEqual(CARDS.map(c=>c.id),Array.from({length:72},(_,i)=>i+1),'Legacy index-based code relies on sequential IDs');
for(const c of CARDS){
 assert.equal(CARD_BY_ID.get(c.id),c);
 assert.ok(CARD_ART[c.id],'Missing authored art for card '+c.id);
 for(const path of [CARD_ART[c.id].thumbnail,CARD_ART[c.id].full])
  assert.ok(existsSync(path),'Missing card asset: '+path);
}
assert.equal(AU_DELA_BOOSTER_CARDS.length,23);
assert.ok(AU_DELA_BOOSTER_CARDS.every(c=>!c.signature));

const paths=['index.html','manifest.webmanifest',...readdirSync('src').filter(x=>/\.(js|css)$/.test(x)).map(x=>'src/'+x)];
for(const file of paths){
 const src=readFileSync(file,'utf8');
 // Literal asset references only. Dynamic paths and actual image decoding are
 // covered separately by the browser tests.
 for(const m of src.matchAll(/(?:\.\.\/|\.\/)?assets\/[a-zA-Z0-9._/-]+\.(?:webp|png|jpg|svg|gif|woff2?)/g)){
  const asset=m[0].replace(/^(\.\.\/|\.\/)/,'');
  assert.ok(existsSync(asset),file+' references missing '+asset);
 }
 if(file.endsWith('.js'))for(const m of src.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)){
  const target=resolve(dirname(file),m[1].split('?')[0]);
  assert.ok(existsSync(target),file+' imports missing '+m[1]);
 }
 if(file==='index.html')for(const m of src.matchAll(/(?:src|href)="(\.\/src\/[^"?]+)(?:\?[^"]*)?"/g))
  assert.ok(existsSync(m[1]),'Missing HTML dependency: '+m[1]);
}
const main=readFileSync('src/main.js','utf8');
assert.ok(main.includes("typeof inspectorShell.hidePopover==='function'&&inspectorShell.matches(':popover-open')"),
 'Do not evaluate unsupported :popover-open selectors on older browsers');
console.log('AETHERIUM stability: 72 catalog entries, 144 authored asset paths, literal dependencies and Popover fallback OK.');
