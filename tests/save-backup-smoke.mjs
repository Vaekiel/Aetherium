import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const read=path=>readFileSync(path,'utf8');
const html=read('index.html'),main=read('src/main.js');
const backup=read('src/save-backup.js'),css=read('src/save-backup.css');
for(const id of ['backup-open','backup-dialog','backup-export','backup-import',
  'backup-file','backup-restore','backup-status','backup-close','reset']){
 assert.ok(html.includes('id="'+id+'"'),'Save UI control must exist: '+id);
}
assert.ok(html.includes('src/save-backup.css?v=backup-185'),'Dedicated backup style is loaded');
assert.ok(html.includes('src/main.js?v='),'New main controller bypasses cache');
assert.ok(main.includes("from './save-backup.js'"),'Backup logic is integrated');
assert.ok(main.includes('await createBackup(state,CARDS.map(card=>card.id))'),
  'Export uses the complete existing saved state');
assert.ok(main.includes('await decodeBackup(await file.text(),CARDS.map(card=>card.id))'),
  'Import validates file before ever touching storage');
assert.ok(main.includes('if(!window.confirm(message))'),
  'Import cannot overwrite progress without confirmation');
assert.ok(main.indexOf('installImportedSave(localStorage,parsed.state)')>
  main.indexOf('if(!window.confirm(message))'),
  'Backup and replacement occur only after user agrees');
assert.ok(main.includes('restorePreviousSave(localStorage)'),
  'Player can undo last import');
assert.ok(main.includes('window.location.reload()'),
  'After import the known-good game bootloader restores all visible panels');
assert.ok(main.includes('const SAVE=GAME_SAVE_KEY;'),
  'Storage listener uses the current environment key');
assert.ok(backup.includes("'aetherium-dev-save-v1':'aetherium-save-v1'"),
  'Production retains its original key while previews use a separate key');
assert.ok(backup.includes("cryptoApi.subtle.digest('SHA-256'"),
  'Export supports checksum validation');
assert.ok(!backup.includes('fetch('),'Transfers never send local saves to a remote server');
assert.ok(css.includes('@media(max-width:590px)'),
  'Modal is responsive on small phones');
assert.ok(css.includes('::backdrop'),'Native dialog is placed above mobile UI');
console.log('AETHERIUM save-backup smoke: save format, validation, UI, local-only storage OK');
