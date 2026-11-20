import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(path,'utf8');
const html=read('index.html');
const css=read('src/ui-harmony.css');
const main=read('src/main.js');
const sheets=[...html.matchAll(/href="\.\/src\/([^" ]+\.css)(?:\?[^" ]+)?"/g)].map(match=>match[1]);

assert.equal(sheets.at(-1),'ui-harmony.css','L’harmonisation est appliquée après tous les écrans spécialisés');
assert.ok(html.includes('ui-harmony.css?v=archives-harmony-3'),'Le cache CSS mobile est renouvelé');
assert.ok(sheets.indexOf('booster.css')<sheets.indexOf('ui-harmony.css'));
assert.ok(sheets.indexOf('codex.css')<sheets.indexOf('ui-harmony.css'));
assert.ok(sheets.indexOf('trial-progress.css')<sheets.indexOf('ui-harmony.css'));
const trialStart=html.indexOf('<section id="page-jouer"');
const trialEnd=html.indexOf('<section id="page-expeditions"',trialStart);
const trialHtml=html.slice(trialStart,trialEnd);
assert.ok(trialStart>=0&&trialEnd>trialStart,'Le contenu des Épreuves reste dans sa section');
const eyebrow=trialHtml.indexOf('<p class="kicker">LES MARCHES DE VERRE');
const pageTitle=trialHtml.indexOf('<div class="heading"><h1>Épreuves des Arcanes</h1>');
const scene=trialHtml.indexOf('<div class="intro"><div><h2>Les ruines s\'éveillent.</h2>');
const picker=trialHtml.indexOf('id="game-picker"');
assert.ok(eyebrow>=0&&pageTitle>eyebrow&&scene>pageTitle&&picker>scene,
  'Épreuves suivent la hiérarchie des autres écrans : chapitre, titre, scène compacte et sélection');
assert.equal((trialHtml.match(/<h1>/g)||[]).length,1,'Un seul titre principal sur Épreuves');
assert.ok(css.includes('#page-jouer .intro{')&&css.includes('min-height:120px'),
  'L’ancienne grande bannière devient un bandeau réduit');
assert.ok(css.includes('#page-jouer>.heading h1'),'Le nouveau titre reçoit les mêmes règles que les autres pages');
assert.ok(css.includes('#page-jouer .intro h2'),'Le récit conserve un titre secondaire');
assert.ok(css.includes('background-size:auto,145px auto,auto'),
  'Illustration préservée en format mobile compact');


for(const page of ['jouer','boosters','collection','atelier','expeditions','succes']){
  assert.ok(html.includes('id="page-'+page+'"'),'Écran conservé : '+page);
  assert.ok(css.includes('#page-'+page),'Écran inclus dans l’harmonisation : '+page);
}
for(const token of [
  '--archives-ui-ink','--archives-ui-muted','--archives-ui-gold',
  '--archives-ui-rule','--archives-ui-border','--archives-ui-radius',
  '#page-jouer>.heading','#page-boosters>.heading','#page-atelier>.heading',
  '#page-succes>.heading','#page-collection .collection-header',
  '#page-collection .mobile-collection-heading','#page-expeditions .expedition-hero',
  '#page-boosters .pack-side','#page-atelier .atelier-forge',
  '#page-collection .codex-progress-panel','#page-succes .honorifics',
  'button.primary:focus-visible','@media(max-width:850px)',
  '@media(prefers-reduced-motion:reduce)'
]) assert.ok(css.includes(token),'Règle commune conservée : '+token);

assert.ok(!css.includes('url('),'Aucun nouvel asset à charger');
assert.ok(!css.includes('display:none'),'L’harmonisation ne masque aucun contenu');
assert.ok(!css.includes('position:fixed'),'La navigation et les panneaux restent inchangés');
assert.ok(!css.includes('overflow:hidden'),'Le nouveau style ne tronque aucun panneau');
for(const token of [
  'id="booster-pack"','id="booster-opening"','id="card-grid"',
  'id="inspector-shell"','id="atelier-confirm"','id="game-picker"',
  'id="filter-open"','id="filter-close"','id="coins"','id="dust"'
]) assert.ok(html.includes(token),'Contrôle interactif préservé : '+token);
assert.ok(main.includes("const SAVE='aetherium-save-v1'"),'Identifiant des sauvegardes inchangé');
assert.ok(main.includes('function openOriginesBooster()'),'Ouverture des boosters conservée');

// La finition v2 uniformise les états actifs sans modifier la logique de sélection.
for(const selector of [
  '#page-jouer .game-picker .game-choice.active',
  '#page-jouer .difficulty-options button.is-active',
  '#page-boosters .booster-choice.is-selected',
  '#page-collection .codex-season.is-active',
  '#page-collection .codex-chapter.is-active',
  '#page-collection .codex-discovery-tabs button.is-active',
  '#page-atelier .atelier-craft-tile.is-selected',
  '#page-succes .honorific.is-equipped'
]) assert.ok(css.includes(selector),'État de sélection harmonisé : '+selector);
assert.ok(css.includes('--archives-ui-selected:#dfbd91'),
  'La sélection conserve un accent or discret');
assert.ok(css.includes('--archives-ui-focus:#f1d7ad'),
  'Les parcours clavier gardent un focus clairement visible');
assert.ok(css.includes('#page-boosters .booster-choice{\n    min-height:44px'),
  'Le sélecteur de trois boosters utilise des cibles tactiles de 44px sur mobile');
assert.ok(css.includes('#page-jouer .game-choice-hint{font-size:11px'),
  'Les indices des Épreuves restent lisibles sur téléphone');
assert.ok(css.includes('#page-jouer .trial-records-current{font-size:10px'),
  'Le registre conserve une police lisible sur les très petits écrans');
assert.ok(css.includes('touch-action:manipulation'),
  'Les commandes de sélection répondent directement au toucher');
assert.ok(!css.includes('!important')||css.includes('transition:none!important'),
  'La finition ne force pas les couleurs ni les dimensions des éléments rares');

console.log('AETHERIUM — UI harmonisée : six écrans, mobile et fonctionnalités préservés');
