import {readFileSync,existsSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';

// Regression guard: Aetherium is fully silent by design. No sound module,
// runtime Web Audio engine, toggle, modal, preference or media assets.
const html=readFileSync('index.html','utf8');
const main=readFileSync('src/main.js','utf8');
const harmony=readFileSync('src/ui-harmony.css','utf8');
const navigation=readFileSync('src/fullscreen.js','utf8');

for(const marker of [
 'id="audio-toggle"','id="audio-dialog"','id="audio-options"',
 'id="audio-enabled"','id="audio-ambience"','id="audio-effects"',
 'id="audio-volume"','src/audio.js','src/audio.css'
]){
 assert.ok(!html.includes(marker),'Le contrôle sonore doit être absent : '+marker);
}
assert.ok(!existsSync('src/audio.js'),'Le moteur sonore a été retiré du jeu');
assert.ok(!existsSync('src/audio.css'),'La feuille du menu audio a été retirée');
assert.ok(!existsSync('assets/audio')||readdirSync('assets/audio').length===0,
 'Aucun fichier de son ne reste livré avec le jeu');
assert.ok(!/new AudioContext|new Audio\(|createOscillator|createMediaElementSource/.test(main),
 'Le moteur principal ne génère aucun son');
assert.ok(!/new AudioContext|new Audio\(|createOscillator|createMediaElementSource/.test(navigation),
 'Le mode plein écran reste indépendant du son');
assert.ok(html.includes('id="immersive-toggle"'),'Le plein écran mobile reste disponible');
assert.ok(html.includes('id="backup-open"'),'La gestion des sauvegardes reste disponible');
assert.ok(html.includes('id="reset"'),'Le bouton de réinitialisation est conservé');
assert.ok(html.includes('id="booster-dialog"'),'Le système de boosters est conservé');
assert.ok(main.includes("const SAVE='aetherium-save-v1'"),'Les sauvegardes restent compatibles');
assert.ok(harmony.includes('#page-jouer .intro'),'Le style général reste intact');
console.log('AETHERIUM — jeu silencieux, aucun bouton/audio ni asset sonore, sauvegardes intactes');
