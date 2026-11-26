/* Optional onboarding: derive milestones from the real save, never grant rewards. */
import {DEV_PREVIEW} from './save-backup.js';
export const GUIDE_PREF_KEY=DEV_PREVIEW?'aetherium-dev-guide-dismissed-v1':'aetherium-guide-dismissed-v1';
export function beginnerGuide(state,packPrice){
 const discovered=Object.values(state?.owned||{}).some(n=>Number(n)>0);
 const opened=Number(state?.opened)>0;
 const won=Number(state?.wins)>0;
 const collected=discovered||opened;
 const complete=collected&&won;
 const canBuy=Number(state?.coins)>=packPrice;
 return {collected,won,complete,canBuy,stage:complete?'complete':!collected&&canBuy?'pack':'trial'};
}
export function readGuideDismissal(storage){
 try{return storage.getItem(GUIDE_PREF_KEY)==='1'}catch{return false}
}
export function writeGuideDismissal(storage,dismissed){
 try{if(dismissed)storage.setItem(GUIDE_PREF_KEY,'1');else storage.removeItem(GUIDE_PREF_KEY)}catch{}
}
