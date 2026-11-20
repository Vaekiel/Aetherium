import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';

const html=readFileSync('index.html','utf8');
const audio=readFileSync('src/audio.js','utf8');
const css=readFileSync('src/audio.css','utf8');
const main=readFileSync('src/main.js','utf8');
const harmony=readFileSync('src/ui-harmony.css','utf8');
const links=[...html.matchAll(/href="\.\/src\/([^" ]+\.css)(?:\?[^" ]+)?"/g)].map(x=>x[1]);

for(const id of [
  'audio-toggle','audio-options','audio-dialog','audio-title',
  'audio-enabled','audio-ambience','audio-effects',
  'audio-volume','audio-volume-value','audio-close'
]) assert.ok(html.includes('id="'+id+'"'), 'Contrôle audio présent : '+id);
assert.ok(html.includes('aria-pressed="false"'),'Le son est éteint dans le HTML initial');
assert.ok(html.includes('audio.js?v=soundscape-prototype-1'),
  'Le module sonore est chargé sans modifier le moteur principal');
assert.ok(links.includes('audio.css'),'Le CSS sonore est disponible');
assert.equal(links.at(-1),'ui-harmony.css','Les styles communs restent chargés en dernier');
assert.equal(links.at(-2),'audio.css','La couche audio ne précède pas les styles des pages');
assert.ok(css.includes('@media(max-width:850px)'),'Bouton responsive mobile');
assert.ok(css.includes('@media(max-width:365px)'),'Petits téléphones prévus');
assert.ok(css.includes('::backdrop'),'Réglages audio avec boîte de dialogue accessible');
assert.ok(css.includes(':focus-visible'),'Focus clavier audio visible');
assert.ok(audio.includes("const STORAGE_KEY='aetherium-audio-v1'"),'Préférence audio séparée de la sauvegarde');
assert.ok(audio.includes('let active=false'),'Son inactif par défaut : aucun autoplay');
assert.ok(audio.includes("button.addEventListener('click'"),'Activation au clic du joueur');
assert.ok(audio.includes('await ctx.resume()'),'Contexte audio repris sur geste utilisateur');
assert.ok(audio.includes('try{localStorage.setItem(STORAGE_KEY'),'Préférences locales protégées');
assert.ok(audio.includes("new MutationObserver(records=>"),'Révélation de booster écoutée passivement');
assert.ok(audio.includes("const coins=document.querySelector('#coins')"),'Récompenses détectées sans toucher à la logique');
assert.ok(audio.includes("document.addEventListener('visibilitychange'"),'Audio réduit lorsque la page est masquée');
assert.ok(audio.includes('touch-action:manipulation')===false,'Aucun changement tactile des jeux');
assert.ok(audio.includes('const ROOMS=Object.freeze({'),'Ambiance propre à chaque salle');
for(const room of ['jouer','boosters','collection','atelier','expeditions','succes'])
  assert.ok(audio.includes('  '+room+':['),'Ambiance prévue : '+room);
for(const sound of ['tap','select','page','forge','reward','reveal','unseal'])
  assert.ok(audio.includes("kind==='"+sound+"'"),'Effet prévu : '+sound);
assert.ok(!/fetch\(|XMLHttpRequest|new Audio\(/.test(audio),'Aucune ressource externe ni appel réseau');
assert.ok(!/setActive\(true\)/.test(audio),'Aucun démarrage sonore automatique');
assert.ok(main.includes("const SAVE='aetherium-save-v1'"),'La sauvegarde du jeu reste inchangée');
assert.ok(harmony.includes('#page-jouer .intro'),'La DA existante reste inchangée');
console.log('AETHERIUM — ambiance sonore optionnelle, sans lecture automatique ni modification de sauvegarde');
