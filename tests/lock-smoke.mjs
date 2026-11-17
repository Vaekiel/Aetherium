import {readFileSync,statSync} from 'node:fs';
import assert from 'node:assert/strict';

const read=path=>readFileSync(path,'utf8');
const main=read('src/main.js');
const css=read('src/lock.css');
const html=read('index.html');
const runeNames='Serrure d’Éther';

assert.ok(html.includes('src/lock.css'), 'Serrure d’Éther: feuille de style branchée');
assert.ok(css.includes('ether-lock-atlas.webp'), 'Atlas illustré utilisé dans le rendu');
assert.ok(css.includes('background-position:var(--ether-x) var(--ether-y)'), 'Chaque cristal emploie son sprite dédié');
assert.ok(css.includes('.ether-lock-dial.is-open'), 'État ouvert illustré');
assert.ok(css.includes('.ether-lock-dial.is-broken'), 'État brisé illustré');
assert.ok(css.includes('@media(max-width:850px)'), 'Responsive téléphone');
assert.ok(css.includes('prefers-reduced-motion'), 'Respect de la réduction des animations');
assert.ok(statSync('assets/minigames/ether-lock-atlas.webp').size>100_000,'Atlas HD WebP disponible');
assert.ok(main.includes("name:'Serrure d’Éther'"),'Épreuve toujours présente');
assert.ok(main.includes('reward:50'), 'Récompense de 50 Couronnes maintenue');
assert.ok(main.includes('aetherium-save-v1'), 'Anciennes sauvegardes conservées');
const start=main.indexOf('function startLock()'), end=main.indexOf('function startMines()',start);
assert.ok(start>=0&&end>start, 'Logique de la Serrure d’Éther trouvée');
const logic=main.slice(start,end);
for(const marker of [
  'const totalAttempts=trialRules(2,g.mode).maxAttempts',
  'const puzzle=makeEtherPuzzle(g.mode)',
  'const numbers=puzzle.values',
  'evaluateEtherAttempt(puzzle,selected)',
  'etherAttemptFeedback(puzzle,result)',
  'etherRule(puzzle)',
  'numbers.forEach((value,index)',
  'if(result.won)',
  'g.ended=true',
  'complete(2,',
  "setAttribute('aria-pressed'",
  'selected.length!==3',
  "g.board.style.setProperty('--cols',3)"
])assert.ok(logic.includes(marker),'Élément de jeu absent : '+marker);
assert.ok(!logic.includes('tileGrid(g.board'),'Ancienne grille générique encore utilisée');
assert.ok(html.includes('src/lock.css?v=logique-1.7.2'),'Lock CSS updated');
assert.ok(html.includes('src/main.js?v=fouilles-1.7.2'),'New lock runtime is not cached');
assert.ok(main.includes("from './ether-lock-puzzles.js'"),'Logic module imported');
console.log('AETHERIUM — Serrure d’Éther HD et énigmes logiques : smoke checks OK');
