/* AETHERIUM 1.8.5 — Portable, checksummed local save files.
   No gameplay mutation: all import checks finish before the legacy save key is
   touched. Keep this format version independent of the in-game version. */
export const GAME_SAVE_KEY='aetherium-save-v1';
export const PREVIOUS_SAVE_KEY='aetherium-save-v1-before-import';
export const BACKUP_FORMAT='aetherium-save-backup';
export const BACKUP_VERSION=1;
export const MAX_BACKUP_SIZE=1024*1024; // 1 MiB, generous for future collections.

const isRecord=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const validInt=(n,upper=999999999)=>Number.isSafeInteger(n)&&n>=0&&n<=upper;
const isValidCardKey=(key,validIds)=>/^[1-9]\d*$/.test(key)&&validIds.has(Number(key));
const modes=new Set(['initiation','aventure','maitrise']);
const saveKeys=new Set([
  'coins','dust','wins','earned','opened','owned','shiny','goalId',
  'difficulty','trialStats','trialRecords','collectionMilestones',
  'recentFinds','alchemyKnown','titleId','expedition'
]);

export function validateSaveState(data,cardIds){
  if(!isRecord(data))throw new Error('Contenu de sauvegarde invalide.');
  const validIds=new Set(cardIds);
  if(!validIds.size)throw new Error('Catalogue de cartes indisponible.');
  if(Object.keys(data).some(key=>!saveKeys.has(key)))
    throw new Error('Sauvegarde issue d’une version non compatible.');
  for(const field of ['coins','dust','wins','earned','opened']){
    if(!validInt(data[field],999999999-1))
      throw new Error('Valeur de progression invalide : '+field+'.');
  }
  if(!isRecord(data.owned)||!isRecord(data.shiny))
    throw new Error('Collection de cartes invalide.');
  for(const [id,count] of Object.entries(data.owned)){
    if(!isValidCardKey(id,validIds)||!validInt(count,999999)||count===0)
      throw new Error('Carte ou quantité inconnue dans la sauvegarde.');
  }
  for(const [id,flag] of Object.entries(data.shiny)){
    if(!isValidCardKey(id,validIds)||flag!==true||!data.owned[id])
      throw new Error('Variante Chromatique incohérente.');
  }
  if(data.goalId!==undefined&&data.goalId!==null&&
    (!validIds.has(data.goalId)||!!data.owned[data.goalId]))
    throw new Error('Objectif de Forge invalide.');
  if(data.difficulty!==undefined&&!modes.has(data.difficulty))
    throw new Error('Difficulté inconnue.');
  for(const field of ['trialStats','trialRecords','recentFinds','alchemyKnown']){
    if(data[field]!==undefined&&!Array.isArray(data[field]))
      throw new Error('Progression des épreuves invalide : '+field+'.');
  }
  if(data.collectionMilestones!==undefined&&!isRecord(data.collectionMilestones))
    throw new Error('Fragments de collection invalides.');
  if(data.expedition!==undefined&&!isRecord(data.expedition))
    throw new Error('Progression des expéditions invalide.');
  if(data.titleId!==undefined&&data.titleId!==null&&
    (!Number.isInteger(data.titleId)||data.titleId<0||data.titleId>4))
    throw new Error('Titre honorifique inconnu.');
  return {
    cards:Object.keys(data.owned).length,
    chromatic:Object.keys(data.shiny).length,
    crowns:data.coins,shards:data.dust,opened:data.opened
  };
}

async function checksum(payload,cryptoApi){
  if(!cryptoApi?.subtle?.digest)
    throw new Error('Ce navigateur ne permet pas de vérifier les sauvegardes.');
  const bytes=new TextEncoder().encode(JSON.stringify(payload));
  const hash=await cryptoApi.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
}

export async function createBackup(state,cardIds,cryptoApi=globalThis.crypto,now=new Date()){
  // Clone to avoid exporting transient references or mutating the live game.
  const copy=JSON.parse(JSON.stringify(state));
  validateSaveState(copy,cardIds);
  const envelope={
    format:BACKUP_FORMAT,version:BACKUP_VERSION,
    createdAt:now.toISOString(),saveKey:GAME_SAVE_KEY,state:copy
  };
  return JSON.stringify({...envelope,checksum:await checksum(envelope,cryptoApi)},null,2);
}

export async function decodeBackup(text,cardIds,cryptoApi=globalThis.crypto){
  if(typeof text!=='string'||text.length>MAX_BACKUP_SIZE)
    throw new Error('Fichier trop volumineux ou illisible (maximum : 1 Mo).');
  let file;
  try{file=JSON.parse(text)}catch{throw new Error('Ce fichier ne contient pas de JSON valide.')}
  if(!isRecord(file)||file.format!==BACKUP_FORMAT||
    file.version!==BACKUP_VERSION||file.saveKey!==GAME_SAVE_KEY)
    throw new Error('Ce fichier n’est pas une sauvegarde Aetherium compatible.');
  if(typeof file.createdAt!=='string'||!Number.isFinite(Date.parse(file.createdAt))||
    !/^\d{4}-\d{2}-\d{2}T/.test(file.createdAt))
    throw new Error('Date de sauvegarde invalide.');
  if(typeof file.checksum!=='string'||!/^[a-f0-9]{64}$/.test(file.checksum))
    throw new Error('Empreinte de sauvegarde absente ou invalide.');
  const {checksum:claimed,...body}=file;
  if(await checksum(body,cryptoApi)!==claimed)
    throw new Error('Le fichier a été altéré ou endommagé. Importation annulée.');
  const stats=validateSaveState(file.state,cardIds);
  return {state:file.state,stats,createdAt:file.createdAt};
}

// An atomic-looking two-write flow: capture the original BEFORE changing the
// active save. If browser storage refuses either write, leave it untouched.
export function installImportedSave(storage,state){
  const current=storage.getItem(GAME_SAVE_KEY);
  if(current===null)throw new Error('Sauvegarde actuelle introuvable. Recharge le jeu.');
  const previousRollback=storage.getItem(PREVIOUS_SAVE_KEY);
  const next=JSON.stringify(state);
  try{storage.setItem(PREVIOUS_SAVE_KEY,current)}
  catch{throw new Error('Impossible de protéger la sauvegarde actuelle. Importation annulée.')}
  try{storage.setItem(GAME_SAVE_KEY,next)}
  catch{
    try{
      if(previousRollback===null)storage.removeItem(PREVIOUS_SAVE_KEY);
      else storage.setItem(PREVIOUS_SAVE_KEY,previousRollback);
    }catch{}
    throw new Error('Espace de stockage insuffisant. Sauvegarde actuelle conservée.');
  }
}

export function restorePreviousSave(storage){
  const previous=storage.getItem(PREVIOUS_SAVE_KEY);
  if(previous===null)throw new Error('Aucune sauvegarde précédente à restaurer.');
  try{
    if(!isRecord(JSON.parse(previous)))throw new Error();
  }catch{throw new Error('La sauvegarde précédente est endommagée.')}
  storage.setItem(GAME_SAVE_KEY,previous);
  storage.removeItem(PREVIOUS_SAVE_KEY);
}
