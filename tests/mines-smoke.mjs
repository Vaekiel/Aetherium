import {readFileSync,statSync} from 'node:fs';
import assert from 'node:assert/strict';
const read=path=>readFileSync(path,'utf8');
const main=read('src/main.js'),css=read('src/mines.css'),html=read('index.html');
assert.ok(html.includes('src/mines.css'),'Fouilles interdites CSS must load');
assert.ok(css.includes('excavation-atlas.webp'),'Uses unique pixel-art atlas');
assert.ok(css.includes('.excavation-tile')&&css.includes('.excavation-hud'),'Has illustrated tiles and HUD');
assert.ok(css.includes('grid-template-columns:repeat(5'),'5x5 excavation grid');
assert.ok(css.includes('prefers-reduced-motion'),'Reduced motion supported');
assert.ok(statSync('assets/minigames/excavation-atlas.webp').size>100_000,'HD WebP sprite exists');
assert.ok(main.includes("name:'Fouilles interdites'"),'Original mini-game stays available');
assert.ok(main.includes('reward:65'),'Reward is unchanged');
assert.ok(main.includes('aetherium-save-v1'),'Save structure unchanged');
const start=main.indexOf('function startMines()'),end=main.indexOf('const ingredients=',start);
assert.ok(start>=0&&end>start,'Excavation function present');
const game=main.slice(start,end);
for(const fragment of [
  'length:25','slice(0,5)','countNearby','safe===10',
  "complete(3,'Fouille accomplie !",'bombs.has(i)',
  'tile.disabled=true','aria-label','setArtwork(tile,0)',
  "g.board.style.setProperty('--cols',5)",
  'g.actions.replaceChildren',
]) assert.ok(game.includes(fragment),'Missing gameplay marker: '+fragment);
assert.ok(!game.includes('tileGrid(g.board'),'No generic HTML grid in redesigned mini-game');
console.log('AETHERIUM Fouilles interdites pixel-art HD checks: OK');
