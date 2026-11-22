import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(p,'utf8');
const html=read('index.html'),js=read('src/fullscreen.js'),css=read('src/fullscreen.css');
const manifest=JSON.parse(read('manifest.webmanifest'));
assert.equal(manifest.id,'/Aetherium/');
assert.equal(manifest.start_url,'./#jouer');
assert.equal(manifest.scope,'./');
assert.equal(manifest.display,'standalone');
assert.deepEqual(manifest.display_override,['fullscreen','standalone']);
assert.equal(manifest.orientation,'any','Do not force landscape on phones');
for(const size of [192,512]){
 const icon=manifest.icons.find(icon=>icon.sizes===size+'x'+size);
 assert.ok(icon);
 const buffer=readFileSync(icon.src.replace(/^\.\//,''));
 assert.equal(buffer.subarray(1,4).toString('ascii'),'PNG');
 assert.equal(buffer.readUInt32BE(16),size,'Icon must have actual declared width');
 assert.equal(buffer.readUInt32BE(20),size,'Icon must have actual declared height');
}
assert.match(html,/<link rel="manifest" href="\.\/manifest\.webmanifest\?v=immersive-1"/);
assert.ok(html.includes('rel="apple-touch-icon"'));
assert.ok(html.includes('apple-mobile-web-app-capable'));
assert.ok(html.includes('id="immersive-toggle" hidden'));
assert.ok(html.includes('class="app-mode-help"'));
assert.ok(html.includes('src/fullscreen.js?v=immersive-1'));
assert.ok(html.includes('src/fullscreen.css?v=safearea-2'));
const lastStyle=[...html.matchAll(/href="\.\/src\/([^"?]+\.css)(?:\?[^"]*)?"/g)].map(x=>x[1]).at(-1);
assert.equal(lastStyle,'ui-harmony.css','Keep existing CSS ordering for all screens');
assert.ok(js.includes('document.documentElement.requestFullscreen()'));
assert.ok(js.includes('document.exitFullscreen()'));
assert.ok(js.includes("immersiveButton.addEventListener('click'"),'Must require a user click');
assert.ok(!js.includes('window.onload'));
assert.ok(!js.includes('localStorage'),'Fullscreen must not change saves');
assert.ok(js.includes("window.navigator.standalone===true"));
assert.ok(css.includes('@media(max-width:850px)'));
assert.ok(css.includes('#immersive-toggle[hidden]{display:none!important}'));
assert.match(css, /#app\s*>\s*header\.top\s*\{/);
assert.ok(css.includes('calc(9px + env(safe-area-inset-top,0px))'));
assert.ok(css.includes('calc(4px + env(safe-area-inset-top,0px))'));
assert.ok(css.includes('max(11px,env(safe-area-inset-left,0px))'));
assert.ok(css.includes('max(11px,env(safe-area-inset-right,0px))'));

console.log('AETHERIUM — installable immersive mode, fullscreen on user gesture and saves untouched OK');
