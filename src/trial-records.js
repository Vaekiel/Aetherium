/* AETHERIUM 1.7.3 — Les Maîtres des Arcanes · Carnet des records.
   Detailed records begin with this release. Never infer difficulty-specific
   achievements from legacy aggregate wins: old progress remains untouched. */
export const TRIAL_RECORD_MODES=Object.freeze(['initiation','aventure','maitrise']);
export const TRIAL_RECORD_METRICS=Object.freeze([
 Object.freeze({key:'errors',label:'Erreurs',unit:'erreur'}),
 Object.freeze({key:'moves',label:'Coups',unit:'coup'}),
 Object.freeze({key:'attempts',label:'Essais ratés',unit:'essai raté'}),
 Object.freeze({key:'hints',label:'Sondes utilisées',unit:'sonde'}),
 Object.freeze({key:'errors',label:'Mélanges ratés',unit:'mélange raté'})
]);
const MAX_WINS=999999;
const validInt=(value,max=MAX_WINS)=>Number.isSafeInteger(value)&&value>=0&&value<=max;
const emptyMode=()=>({wins:0,bestScore:null,lastScore:null,bestMetric:null});
export const emptyTrialRecords=()=>Array.from({length:5},()=>({
 initiation:emptyMode(),aventure:emptyMode(),maitrise:emptyMode()
}));
export function sanitizedTrialRecords(raw){
 const fresh=emptyTrialRecords();
 if(!Array.isArray(raw))return fresh;
 return fresh.map((row,index)=>{
   const source=raw[index];
   if(!source||typeof source!=='object')return row;
   for(const mode of TRIAL_RECORD_MODES){
     const entry=source[mode];
     if(!entry||typeof entry!=='object')continue;
     const wins=validInt(entry.wins)?entry.wins:0;
     if(!wins)continue;
     // An incomplete/corrupted record is not allowed to invent a victory.
     if(!validInt(entry.bestScore,100)||!validInt(entry.lastScore,100))continue;
     const metric=entry.bestMetric;
     row[mode]={
       wins,
       bestScore:entry.bestScore,
       lastScore:entry.lastScore,
       bestMetric:validInt(metric)?metric:null
     };
   }
   return row;
 });
}
export function recordPersonalBest(raw,index,difficulty,score,performance={}){
 const records=sanitizedTrialRecords(raw);
 if(!Number.isInteger(index)||index<0||index>=TRIAL_RECORD_METRICS.length||
    !TRIAL_RECORD_MODES.includes(difficulty)||!Number.isFinite(score))return records;
 const entry=records[index][difficulty];
 const rounded=Math.max(0,Math.min(100,Math.floor(score)));
 const key=TRIAL_RECORD_METRICS[index].key;
 const value=performance?.[key];
 const metric=validInt(value)?value:null;
 records[index][difficulty]={
   wins:Math.min(MAX_WINS,entry.wins+1),
   bestScore:entry.bestScore===null?rounded:Math.max(entry.bestScore,rounded),
   lastScore:rounded,
   bestMetric:metric===null?entry.bestMetric:
     entry.bestMetric===null?metric:Math.min(entry.bestMetric,metric)
 };
 return records;
}
export function recordMetricLabel(index,value){
 const definition=TRIAL_RECORD_METRICS[index];
 if(!definition||value===null||!validInt(value))return '—';
 return value+' '+definition.unit+(value>1?'s':'');
}
