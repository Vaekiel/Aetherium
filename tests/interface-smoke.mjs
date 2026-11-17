import {readFileSync, statSync} from 'node:fs';
import assert from 'node:assert/strict';

const read=path=>readFileSync(path,'utf8');
const html=read('index.html'),main=read('src/main.js'),css=read('src/shell.css');
const mainPages=['jouer','boosters','collection','atelier'];
for(const page of [...mainPages,'succes'])assert.ok(html.includes('id="page-'+page+'"'),`Écran ${page} présent`);
for(const page of mainPages)assert.ok(html.includes('data-page="'+page+'"'),`Onglet ${page} présent`);
assert.ok(!html.includes('data-page="succes"'),'Chroniques n’occupe plus un onglet principal');
assert.ok(html.includes('id="chroniques-link"')&&html.includes('data-go="succes"'),'Chroniques restent accessibles séparément');
for(const id of ['games','game-picker','buy','pulls','booster-summary','booster-step','next-pull','collection-filters','card-grid','search','preview-art','inspector','inspector-shell','filter-close','filter-open','achievements','toast','coins','dust','reset']){
 assert.ok(html.includes('id="'+id+'"'),`Contrôle préservé : ${id}`);
}
assert.ok(html.includes('src/shell.css'),'Nouvelle interface chargée');
const styleLinks=[...html.matchAll(/href="\.\/src\/([^" ]+\.css)(?:\?[^" ]+)?"/g)].map(x=>x[1]);
assert.equal(styleLinks.at(-3),'chromatic.css','La finition Chromatique est préservée');
assert.equal(styleLinks.at(-2),'codex.css','Le Codex garde ses styles dédiés');
assert.equal(styleLinks.at(-1),'trial-progress.css','Les Épreuves chargent leurs styles de progression après le Codex');
assert.ok(styleLinks.includes('crafting.css'),'La Forge existante est conservée');
assert.ok(!html.includes('id="chromatic-showcase"'),'Le panneau de comparaison Chromatique a été retiré du Codex');
assert.ok(styleLinks.includes('navigation.css'),'La navigation validée reste intégrée');
assert.ok(styleLinks.includes('shell.css'),'Le thème crépusculaire est préservé');
for(const sheet of ['runes.css','memory.css','lock.css','mines.css','alchemy.css','booster.css']){
 assert.ok(styleLinks.includes(sheet),`CSS des mini-jeux inchangé : ${sheet}`);
}
assert.ok(html.includes('class="play-stage"')&&html.includes('class="play-lore"'),'Nouvelle scène de jeu');
assert.ok(html.includes('class="collection-header"'),'Codex avec en-tête');
const mobileCSS=read('src/mobile.css');
const codexOpen=html.indexOf('<section id="page-collection" class="page">');
const codexEnd=html.indexOf('</section>\n<section id="page-atelier"',codexOpen);
const veilPos=html.indexOf('id="sheet-scrim"');
assert.ok(codexOpen>=0&&veilPos>codexOpen&&codexEnd>veilPos,
  'Mobile blur backdrop is inside the Codex page, not above the inspector stacking context');
assert.ok(!html.includes('</main><div id="sheet-scrim"'),
  'Backdrop is no longer an outside sibling of the main layout');
assert.equal((html.match(/id="sheet-scrim"/g)||[]).length,1,'One backdrop only');
assert.ok(mobileCSS.includes('#page-collection .inspector-shell[popover]:popover-open'),
  'Mobile card inspector renders in a native top-layer popover above all page effects');
assert.ok(main.includes("target.setAttribute('popover','manual')"),
  'Inspector receives popover capability in mobile layout');
assert.ok(main.includes("target.showPopover()"),
  'Opening inspection elevates its panel into native browser top layer');
assert.ok(main.includes("inspectorShell.hidePopover()"),
  'Closing inspection releases the native top layer');
assert.ok(html.includes('mobile.css?v=inspector-layer-3')&&html.includes('src/main.js?v=alchemy-mastery-172b'),
  'Updated mobile inspector assets bypass stale caches');
assert.ok(mobileCSS.includes('body.sheet-open #app>.layout{z-index:110}'),
  'Open mobile sheets raise the layout above the fixed app header');
assert.ok(mobileCSS.includes('.sheet-scrim{position:fixed;inset:0;z-index:109;'),
  'Backdrop remains below the mobile panel');
assert.ok(mobileCSS.includes('.inspector-shell{position:fixed!important;inset:0;z-index:121;'),
  'Inspected artwork is above the blur backdrop');
assert.ok(html.includes('SAISON I · LES MARCHES DE VERRE · PARTIE I'),'Booster Origines rattaché à la première saison');
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
const fixV2=css.slice(css.indexOf('/* PC background hotfix v1.1.2'));
assert.ok(fixV2.includes('(min-width: 851px)'), 'Background corrected for desktop widths');
assert.ok(fixV2.includes('(hover: hover) and (pointer: fine)'), 'Narrow desktop windows covered');
assert.ok(fixV2.includes('#app > .ambient-landscape'), 'Targets the actual illustrated backdrop element');
assert.ok(fixV2.includes('display: none !important'), 'Hides the entire illustrated layer');
assert.ok(fixV2.includes('linear-gradient(180deg'), 'The app has a dark quiet replacement');
assert.ok(html.includes('shell.css?v=onglet-actif-1'), 'Header navigation correction is not hidden by stale CSS');

const selectorBegin=css.indexOf('/* The trial picker');
const selectorEnd=css.indexOf('#page-jouer .game-picker .game-choice:hover',selectorBegin);
assert.ok(selectorBegin>=0&&selectorEnd>selectorBegin,'Mini-game selector rules available');
const pickerCSS=css.slice(selectorBegin,selectorEnd);
assert.ok(pickerCSS.includes('minigame-emblems.webp'),'Five logos use the same purpose-made pixel-art atlas');
assert.ok(pickerCSS.includes('background-size:300% 200%'),'All icons share an identical crop scale');
for(const position of ['50% 0%','100% 0%','0% 100%','50% 100%'])
 assert.ok(pickerCSS.includes('background-position:'+position),'Separate art is assigned for all five games');
for(const oldAtlas of ['runes-origines-compact.webp','ether-lock-atlas.webp','excavation-atlas.webp','alchemy-atlas.webp'])
 assert.ok(!pickerCSS.includes(oldAtlas),'No mixed legacy mini-game logos: '+oldAtlas);
assert.ok(css.includes('aspect-ratio:1/1'),'All logos are square, with no stretch');
assert.ok(css.includes('top:50%;bottom:auto;left:6px;width:48px'),'Phone logo alignment is retained');
assert.ok(statSync('assets/minigames/minigame-emblems.webp').size>30000,'New five-emblem atlas shipped');
// The user-visible horizontal line came from a pseudo-element crossing the hero.
const heroRules=css.slice(css.indexOf('/* Home: cinematic'),css.indexOf('/* The trial picker'));
assert.ok(heroRules.includes('#page-jouer .intro::before,')&&heroRules.includes('#page-jouer .intro::after{'),'Hero overlays are explicitly targeted');
assert.ok(heroRules.includes('content:none!important')&&heroRules.includes('display:none!important'),'Hero decorative line and diamond cannot render');
assert.ok(!heroRules.includes('inset:9px;border:1px solid #dbb28a48'),'Old horizontal line border removed');
assert.ok(heroRules.includes("pluie-astrale-thumb.webp"),'Illustrated hero art remains present');
assert.ok(heroRules.includes('border:1px solid #b59179ae'),'Hero exterior frame remains');
// One active-tab diamond: the former fixed header ornament was positioned
// at 50% of the whole header, independently of which page was selected.
assert.ok(!html.includes('top-ornament'), 'Fixed header diamond must be removed');
assert.ok(!css.includes('.top-ornament{'), 'No obsolete fixed diamond styling');
assert.ok(css.includes('.top nav button.active::after{'), 'Active tab provides the only desktop diamond');
const tabDiamond=css.slice(css.indexOf('.top nav button.active::after{'),css.indexOf('.top nav .nav-icon{'));
assert.ok(tabDiamond.includes('position:absolute')&&tabDiamond.includes('left:calc(50% - 5px)'),'Diamond is centered on active nav button');
assert.ok(main.includes('const active=el.dataset.page===page;') && main.includes("el.classList.toggle('active',active)"), 'Page navigation updates active tab');
assert.ok(css.includes('.top nav button.active::after{content:none}'), 'Mobile uses its existing active border, not a desktop diamond');
console.log('AETHERIUM interface : fond illustré PC supprimé, mobile préservé');
