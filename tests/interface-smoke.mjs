import {readFileSync, statSync} from 'node:fs';
import assert from 'node:assert/strict';

const read=path=>readFileSync(path,'utf8');
const html=read('index.html'),main=read('src/main.js'),css=read('src/shell.css');
const pages=['jouer','boosters','collection','succes'];
for(const page of pages){
 assert.ok(html.includes('id="page-'+page+'"'),`Onglet ${page} présent`);
 assert.ok(html.includes('data-page="'+page+'"'),`Bouton de navigation ${page} présent`);
}
for(const id of ['games','game-picker','buy','pulls','booster-summary','booster-step','next-pull','collection-filters','card-grid','search','preview-art','inspector','inspector-shell','filter-close','filter-open','achievements','toast','coins','dust','reset']){
 assert.ok(html.includes('id="'+id+'"'),`Contrôle préservé : ${id}`);
}
assert.ok(html.includes('src/shell.css'),'Nouvelle interface chargée');
const styleLinks=[...html.matchAll(/href="\.\/src\/([^" ]+\.css)"/g)].map(x=>x[1]);
assert.equal(styleLinks.at(-1),'shell.css','La DA a priorité sur les feuilles précédentes');
for(const sheet of ['runes.css','memory.css','lock.css','mines.css','alchemy.css','booster.css']){
 assert.ok(styleLinks.includes(sheet),`CSS des mini-jeux inchangé : ${sheet}`);
}
assert.ok(html.includes('class="play-stage"')&&html.includes('class="play-lore"'),'Nouvelle scène de jeu');
assert.ok(html.includes('class="collection-header"'),'Codex avec en-tête');
assert.ok(html.includes('LES TRÉSORS DU CODEX'),'Boutique scénarisée');
assert.ok(html.includes('Chroniques & Succès'),'Registre des succès');
assert.ok(main.includes('const trialSubtitles='),'Sélecteur de jeux enrichi');
assert.ok(main.includes("el('span','game-choice-name'"),'Titres des jeux conservés');
assert.ok(main.includes("el('span','game-choice-hint'"),'Descriptions du sélecteur');
assert.ok(main.includes("item.card.classList.toggle('mobile-active'"),'Épreuve unique affichée par sélection');
assert.ok(main.includes("const SAVE='aetherium-save-v1'"),'Sauvegarde préservée');
assert.ok(main.includes('function openOriginesBooster()'),'Ouverture des boosters conservée');
assert.ok(main.includes('function renderCollection()'),'Collection conservée');
assert.ok(main.includes('function startAlchemy()'),'Tous les mini-jeux conservés');
assert.ok(css.includes('.game-choice')&&css.includes('.play-stage'),'Nouvelle interface Jouer');
assert.ok(css.includes('.collection-header')&&css.includes('.inspector-shell'),'Nouvelle interface Collection');
assert.ok(css.includes('.pack-side')&&css.includes('.opening'),'Nouvelle interface Boosters');
assert.ok(css.includes('.achievement'),'Nouvelle interface Succès');
assert.ok(css.includes('@media(max-width:850px)'),'Version mobile prévue');
assert.ok(css.includes('prefers-reduced-motion'),'Accessibilité des animations prévue');
for(const image of ['assets/scenery/dusk-right.webp','assets/scenery/dusk-horizon.webp']){
 assert.ok(statSync(image).size>1000,`Décor approuvé intégré : ${image}`);
}
// Desktop-only background regression: no stretched edge murals.
const desktopFix=css.slice(css.indexOf('/* Desktop background v1.1.1'));
assert.ok(desktopFix.includes('@media (min-width: 851px)'), 'Background adjustment restricted to desktop widths');
assert.ok(desktopFix.includes('#app .ambient-landscape'), 'Desktop backdrop is explicitly styled');
assert.ok(desktopFix.includes('linear-gradient(180deg'), 'Desktop uses dark gradient rather than stretched imagery');
for(const selector of ['#app .ambient-landscape::before', '#app .ambient-landscape::after', '#app::before', '#app::after']){
 assert.ok(desktopFix.includes(selector), 'Remove decorative pseudo-element: '+selector);
}
assert.ok(desktopFix.includes('content: none !important'), 'Desktop scenery is disabled');
assert.ok(!desktopFix.includes('url('), 'Desktop background avoids all images');
console.log('AETHERIUM interface DA crépuscule : tests de structure et fond PC OK');
