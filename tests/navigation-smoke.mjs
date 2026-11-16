import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';

const load=p=>readFileSync(p,'utf8');
const html=load('index.html'),js=load('src/main.js'),css=load('src/navigation.css');
const nav=html.match(/<nav aria-label="Navigation principale">([\s\S]*?)<\/nav>/)?.[1];
assert.ok(nav,'Main navigation exists');
const ids=[...nav.matchAll(/data-page="([^"]+)"/g)].map(m=>m[1]);
assert.deepEqual(ids,['jouer','boosters','collection','atelier'],'Four clear top-level destinations');
for(const section of [...ids,'succes']){
 assert.ok(html.includes('id="page-'+section+'"'),section+' is routed to a real page');
}
assert.ok(!nav.includes('data-page="succes"'),'Achievements are not a main tab');
assert.ok(html.includes('id="chroniques-link"')&&html.includes('data-go="succes"'),'Chroniques remain accessible from header');
assert.ok(html.includes('class="mobile-chronicles-shortcut"'),'Codex offers Chroniques on mobile');
assert.ok(html.includes('class="chronicles-shortcut"'),'Codex offers Chroniques on desktop');
assert.ok(html.includes('id="atelier-dust"')&&html.includes('id="atelier-duplicates"')&&html.includes('id="atelier-collected"'),'Atelier values have dedicated live counters');
assert.ok(html.includes('id="page-atelier"'),'A separate Atelier screen exists');
assert.ok(html.includes('id="atelier-card-list"')&&html.includes('id="atelier-card-details"'),'Forge presents missing cards and a live recipe');
assert.ok(html.includes('id="atelier-confirm"'),'Forge presents a confirmation dialog before spending');
assert.ok(html.includes('id="atelier-goal-summary"'),'Atelier retains persistent desired-card progress');
assert.ok(js.includes("const MAIN_PAGES=['jouer','boosters','collection','atelier'];"),'Navigation page list includes Atelier');
assert.ok(js.includes("const APP_PAGES=[...MAIN_PAGES,'succes'];"),'Legacy #succes route remains supported');
assert.ok(js.includes("APP_PAGES.includes(location.hash.slice(1))"),'Deep link to Atelier and Chroniques works');
assert.ok(js.includes("$$('[data-go]').forEach"),'Resource and shortcut links are wired');
assert.ok(js.includes("el.setAttribute('aria-current','page')"),'Selected tab has accessible page state');
assert.ok(js.includes('function renderAtelier()'),'Atelier resource display updates from real save');
assert.ok(js.includes('state.dust.toLocaleString'),'Displayed Éclats are drawn from saved resource balance');
assert.ok(js.includes('Object.values(state.owned).reduce'),'Duplicate count is calculated from owned copies');
assert.ok(js.includes("const SAVE='aetherium-save-v1'"),'Existing save format is unchanged');
assert.ok(js.includes('const result=craftCard(state,card)'),'Validated crafting is enabled through a central rules module');
for(const key of ['function startRunes()','function startMemory()','function startLock()','function startMines()','function startAlchemy()','function openOriginesBooster()'])
 assert.ok(js.includes(key),'Gameplay retained: '+key);
assert.ok(css.includes('.atelier-layout')&&css.includes('.atelier-forge-scene'),'Forge is illustrated in the existing DA');
assert.ok(css.includes('minigame-emblems.webp'),'Navigation icons reuse the HD pixel-art family');
assert.ok(css.includes('@media(max-width:850px)'),'Mobile bottom menu and Atelier are responsive');
console.log('AETHERIUM: navigation / Chroniques / Atelier checks OK');
