/* Protect the original local save against unreadable data and stale tabs.
   The original key and the portable save format are deliberately unchanged. */
import {GAME_SAVE_KEY,validateSaveState} from './save-backup.js';

const damaged='Sauvegarde locale illisible ou incompatible. Les données originales sont conservées. Télécharge les données brutes ou importe une sauvegarde valide avant de poursuivre.';
const stale='Sauvegarde modifiée dans un autre onglet. Exporte ta session si nécessaire, puis recharge le jeu.';
const unavailable='Stockage local indisponible. Ta progression actuelle n’est pas enregistrée : exporte-la avant de quitter.';

export function parseStoredSave(raw,cardIds){
  if(raw===null)return null;
  const data=JSON.parse(raw);
  if(!data||typeof data!=='object'||Array.isArray(data)||!Object.hasOwn(data,'owned'))
    throw new Error(damaged);
  // Older saves did not necessarily include every counter or finishing field.
  // Validate present data without inventing fields in the stored snapshot.
  const legacy={coins:300,dust:0,wins:0,earned:0,opened:0,shiny:{},...data};
  if(data.finishCounts===undefined){
    // Historical saves used a boolean Chromatique marker. The original
    // loader ignored orphan markers for known but unowned cards and invalid
    // equipped titles; retain that harmless migration instead of blocking
    // an otherwise valid old collection.
    if(legacy.shiny&&typeof legacy.shiny==='object'&&!Array.isArray(legacy.shiny)){
      const known=new Set(cardIds);
      legacy.shiny=Object.fromEntries(Object.entries(legacy.shiny).filter(([id,flag])=>
        !(known.has(Number(id))&&/^[1-9]\d*$/.test(id)&&flag===true&&!legacy.owned?.[id])));
    }
    if(legacy.titleId!==undefined&&legacy.titleId!==null&&
      (!Number.isInteger(legacy.titleId)||legacy.titleId<0||legacy.titleId>4))
      delete legacy.titleId;
  }
  validateSaveState(legacy,cardIds);
  return data;
}

export function createSaveSession(getStorage,cardIds){
  let raw=null,rawState=null,readable=false,problem='';
  try{
    raw=getStorage().getItem(GAME_SAVE_KEY);
    readable=true;
    rawState=parseStoredSave(raw,cardIds);
  }catch{
    problem=readable?damaged:unavailable;
  }
  function assertCurrent(){
    if(!readable)throw new Error(unavailable);
    let current;
    try{current=getStorage().getItem(GAME_SAVE_KEY)}
    catch{throw new Error(unavailable)}
    if(current!==raw)throw new Error(stale);
  }
  return {
    get raw(){return raw},
    get rawState(){return rawState},
    get problem(){return problem},
    get needsRecovery(){return readable&&!!problem},
    block(){if(readable)problem=damaged},
    assertCurrent,
    write(state,{replace=false}={}){
      assertCurrent();
      if(problem&&!replace)throw new Error(problem);
      const next=JSON.stringify(state);
      if(next!==raw){
        try{getStorage().setItem(GAME_SAVE_KEY,next)}
        catch{throw new Error(unavailable)}
        raw=next;
      }
      problem='';
    }
  };
}
