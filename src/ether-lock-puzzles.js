/* AETHERIUM 1.7.2 — Serrure d'Éther: deterministic, verifiable
   numerical puzzles. Each generated lock has exactly one valid three-stone set.
   Different modes reveal different public constraints. No hidden guessing required. */
export const ETHER_STONES=6;
const combinations=Object.freeze(Array.from({length:6},(_,a)=>
  Array.from({length:6-a-1},(_,b)=>
    Array.from({length:6-(a+b+1)-1},(_,c)=>[a,a+b+1,a+b+c+2])
  ).flat()).flat());
function shuffled(items,random){
  const array=[...items];
  for(let index=array.length-1;index>0;index--){
    const draw=Number(random());
    const safe=Number.isFinite(draw)?Math.min(1-Number.EPSILON,Math.max(0,draw)):0;
    const other=Math.floor(safe*(index+1));
    [array[index],array[other]]=[array[other],array[index]];
  }
  return array;
}
const sumOf=values=>values.reduce((sum,value)=>sum+value,0);
const signature=(values,mode)=>mode==='aventure'
  ?values.filter(value=>value%2!==0).length
  :mode==='maitrise'?Math.max(...values)-Math.min(...values):null;
const publicKey=(values,mode)=>String(sumOf(values))+'|'+signature(values,mode);
export function makeEtherPuzzle(mode='aventure',random=Math.random){
  const difficulty=['initiation','aventure','maitrise'].includes(mode)?mode:'aventure';
  const values=shuffled(Array.from({length:12},(_,index)=>index+1),random).slice(0,ETHER_STONES);
  const candidates=combinations.map(indices=>{
    const selected=indices.map(index=>values[index]);
    return {indices,selected,target:sumOf(selected),clue:signature(selected,difficulty),
      key:publicKey(selected,difficulty)};
  });
  const groups=new Map();
  const bySum=new Map();
  for(const item of candidates){
    groups.set(item.key,(groups.get(item.key)||0)+1);
    bySum.set(item.target,(bySum.get(item.target)||0)+1);
  }
  // In Adventure and Mastery prefer values for which the additional clue
  // distinguishes two or more same-sum choices; retain a fair fallback.
  const unique=candidates.filter(item=>groups.get(item.key)===1);
  const interesting=unique.filter(item=>bySum.get(item.target)>1);
  const options=interesting.length?interesting:unique;
  const draw=Number(random());
  const safe=Number.isFinite(draw)?Math.min(1-Number.EPSILON,Math.max(0,draw)):0;
  const picked=options[Math.floor(safe*options.length)];
  if(!picked)throw Error('Serrure invalide : aucune combinaison unique');
  return Object.freeze({
    difficulty,values:Object.freeze(values),target:picked.target,
    clue:picked.clue,solution:Object.freeze(picked.indices)
  });
}
export function etherRule(puzzle){
  if(puzzle.difficulty==='aventure')
    return 'Résonance : exactement '+puzzle.clue+' valeur'+(puzzle.clue>1?'s':'')+
      ' impaire'+(puzzle.clue>1?'s':'')+' parmi les trois cristaux.';
  if(puzzle.difficulty==='maitrise')
    return 'Écart : le plus grand cristal vaut '+puzzle.clue+
      ' de plus que le plus petit.';
  return 'Choisis trois cristaux dont la somme atteint le sceau.';
}
export function evaluateEtherAttempt(puzzle,indices){
  if(!puzzle||!Array.isArray(indices)||indices.length!==3||
     new Set(indices).size!==3||
     indices.some(index=>!Number.isInteger(index)||index<0||index>=ETHER_STONES))
    return null;
  const selected=indices.map(index=>puzzle.values[index]);
  const sum=sumOf(selected);
  const clue=signature(selected,puzzle.difficulty);
  const matches=indices.filter(index=>puzzle.solution.includes(index)).length;
  return Object.freeze({
    sum,target:puzzle.target,difference:puzzle.target-sum,
    clue,clueCorrect:clue===puzzle.clue,
    matches,won:sum===puzzle.target&&clue===puzzle.clue
  });
}
export function etherAttemptFeedback(puzzle,result){
  const energy=result.difference>0?'Énergie trop faible de '+result.difference:
    result.difference<0?'Énergie trop forte de '+Math.abs(result.difference):
    'Énergie exacte';
  const harmony=result.clueCorrect?'la résonance est juste':
    puzzle.difficulty==='aventure'?'le nombre de valeurs impaires est incorrect':
    puzzle.difficulty==='maitrise'?'l’écart entre les cristaux est incorrect':'';
  const count=result.matches+' cristal'+(result.matches>1?'s':'')+' accordé'+
    (result.matches>1?'s':'')+' sur 3';
  return energy+(harmony?' · '+harmony:'')+' · '+count+'.';
}
