/* AETHERIUM 1.6.0 — The Arcanes: difficulty and mastery rules.
   Pure helpers; the legacy aetherium-save-v1 wallet and collection are untouched. */
export const DIFFICULTIES=Object.freeze([
  Object.freeze({id:'initiation',label:'Initiation',description:'Plus de souplesse pour découvrir les épreuves.',bonus:0}),
  Object.freeze({id:'aventure',label:'Aventure',description:'Les règles classiques, avec un petit bonus de maîtrise.',bonus:0}),
  Object.freeze({id:'maitrise',label:'Maîtrise',description:'Des objectifs exigeants et une récompense légèrement supérieure.',bonus:10})
]);
export const TRIAL_COUNT=5;
export const validDifficulty=value=>DIFFICULTIES.some(mode=>mode.id===value)?value:'aventure';
export function trialRules(index,difficulty='aventure'){
  const mode=validDifficulty(difficulty);
  const position={initiation:0,aventure:1,maitrise:2}[mode];
  const options=[
    [{maxErrors:5},{maxErrors:3},{maxErrors:2}],
    [{maxMoves:null},{maxMoves:null},{maxMoves:16}],
    [{maxAttempts:5},{maxAttempts:3},{maxAttempts:2}],
    [{safeTarget:8},{safeTarget:10},{safeTarget:12}],
    [{maxErrors:5},{maxErrors:3},{maxErrors:2}]
  ];
  return {...(options[index]?.[position]??{})};
}
export function trialScore(index,{errors=0,moves=0,attempts=0}={}){
  const count=n=>Number.isFinite(n)?Math.max(0,Math.floor(n)):0;
  const penalties=[count(errors)*18,Math.max(0,count(moves)-8)*4,
    count(attempts)*20,20,count(errors)*20];
  return Math.max(0,Math.min(100,100-(penalties[index]??0)));
}
export function trialReward(base,difficulty,score){
  const mode=DIFFICULTIES.find(entry=>entry.id===validDifficulty(difficulty));
  const perfect=mode.id==='initiation'?0:(score>=90?5:0);
  return base+mode.bonus+perfect;
}
export const emptyTrialStats=()=>Array.from({length:TRIAL_COUNT},()=>({wins:0,bestScore:0,bestMode:null}));
export function sanitizedTrialStats(raw){
  const list=emptyTrialStats();
  if(!Array.isArray(raw))return list;
  return list.map((defaultEntry,index)=>{
    const row=raw[index];
    if(!row||typeof row!=='object')return defaultEntry;
    return {
      wins:Number.isSafeInteger(row.wins)&&row.wins>=0&&row.wins<1000000?row.wins:0,
      bestScore:Number.isSafeInteger(row.bestScore)&&row.bestScore>=0&&row.bestScore<=100?row.bestScore:0,
      bestMode:DIFFICULTIES.some(mode=>mode.id===row.bestMode)?row.bestMode:null
    };
  });
}
export function recordTrialWin(stats,index,difficulty,score){
  const rows=sanitizedTrialStats(stats);
  if(index<0||index>=TRIAL_COUNT)return rows;
  const record=rows[index],mode=validDifficulty(difficulty);
  const rank={initiation:0,aventure:1,maitrise:2};
  record.wins++;
  record.bestScore=Math.max(record.bestScore,Math.floor(Math.max(0,Math.min(100,score))));
  if(record.bestMode===null||rank[mode]>rank[record.bestMode])record.bestMode=mode;
  return rows;
}
export function masteryLevel(wins){
  if(wins>=20)return {title:'Maître',next:null};
  if(wins>=8)return {title:'Initié',next:20};
  if(wins>=3)return {title:'Apprenti',next:8};
  if(wins>=1)return {title:'Novice',next:3};
  return {title:'À découvrir',next:1};
}
