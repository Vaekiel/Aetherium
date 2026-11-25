import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const js=read('../src/recto-lab.js'),css=read('../src/recto-lab.css'),
 main=read('../src/main.js'),codex=read('../src/codex.css');
assert.ok(main.includes("recto-lab.js?v=lab-7"));
assert.ok(codex.includes("recto-lab.css?v=lab-7"));
assert.ok(js.includes("get('recto-test') === '1'"));
assert.match(js,/element\('header','recto-lab-header'\)/);
assert.match(js,/element\('div','recto-lab-art'\)/);
assert.match(js,/element\('div','recto-lab-footer'\)/);
assert.match(css,/grid-template-rows:11% minmax\(0,1fr\) 27%/);
assert.match(css,/object-fit:contain/);
assert.doesNotMatch(js,/recto-option-1-frame|recto-lab-frame|titlePlaque|recto-lab-backdrop/);
assert.doesNotMatch(css,/recto-lab-frame|recto-lab-title-plaque|recto-lab-gradient/);
assert.doesNotMatch(js,/localStorage/);
console.log('Recto lab: trois zones HTML/CSS autonomes sans image de cadre.');