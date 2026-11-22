import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync('index.html','utf8');
const main=readFileSync('src/main.js','utf8');
const css=readFileSync('src/ui-harmony.css','utf8');

// Additional details are available by choice, not repeated on every view.
assert.match(html, /<details class="booster-rates"><summary>Chances et doublons<\/summary>/);
assert.match(html, /<details class="codex-finish-details"><summary>/);
assert.match(html, /<details class="footer-tools"><summary>Réglages et sauvegarde<\/summary>/);
for(const id of ['buy','booster-family-description','codex-progress-discovered',
  'codex-progress-normal','codex-progress-chromatic','codex-progress-holographic',
  'codex-progress-calligraphic','codex-normal-count','codex-holographic-count',
  'codex-calligraphic-count','audio-options','backup-open','reset']){
  assert.ok(html.includes('id="'+id+'"'),'Interactive or progress target preserved: '+id);
}
assert.ok(css.includes('#page-boosters .pack-side .booster-rates'),'Mobile probabilities are readable');
assert.ok(css.includes('#page-collection .codex-finish-grid'),'Folded variants remain accessible');
assert.ok(css.includes('@media(max-width:420px)'),'Small phones are supported');
assert.ok(!css.includes('url('),'No new heavyweight visual assets');
// Unknown cards, signatures, rarities, and unfinished success titles stay hidden by default.
assert.ok(main.includes('const preview=locked&&previewArt&&hasApprovedArt(c.id);'));
assert.ok(main.includes("reallyLocked?'À découvrir':"));
assert.ok(main.includes("reallyLocked?'Archive scellée':c.name"));
assert.ok(main.includes("const revealed=!!state.owned[next.id]||(previewArt&&hasApprovedArt(next.id));"));
assert.ok(main.includes("el('p','kicker','ARCHIVE '+String(c.id).padStart(3,'0'))"));
assert.ok(!main.includes('La 24e, le Cœur des Marches'));
assert.ok(!main.includes('Le Cœur des Marches est une Signature unique'));
assert.ok(main.includes("done?description:'Poursuis tes découvertes pour le révéler.'"));
assert.ok(main.includes("title.earned?title.name:'Titre scellé'"));
// Avoid rebuilding pages that are not currently visible on every search/reward.
assert.ok(main.includes("if($('#page-succes').classList.contains('active'))renderAchievements()"));
assert.ok(main.includes("if($('#page-atelier').classList.contains('active'))renderAtelier()"));
assert.ok(main.includes("if(page==='atelier')renderAtelier()"));
assert.ok(main.includes("if(page==='succes')renderAchievements()"));
// Save format and game loops stay unchanged.
assert.ok(main.includes("const SAVE='aetherium-save-v1'"));
assert.ok(main.includes('function openOriginesBooster()'));
console.log('AETHERIUM: ergonomie épurée, surprises protégées, affichage adaptatif et sauvegarde conservés');
