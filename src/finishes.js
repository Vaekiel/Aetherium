/* AETHERIUM — distinct collectible finish inventories.
 * The historic save key and old {owned,shiny} structure remain valid.
 * Older saves only tracked whether a Chromatique existed, not its quantity:
 * migrate one such copy to Chromatique, other copies to Normale.
 */
export const FINISHES=Object.freeze({
  normal:Object.freeze({label:'Normale',plural:'Normales',symbol:'◆'}),
  chromatic:Object.freeze({label:'Chromatique',plural:'Chromatiques',symbol:'✧'}),
  holographic:Object.freeze({label:'Holographique',plural:'Holographiques',symbol:'◈'}),
  calligraphic:Object.freeze({label:'Calligraphique',plural:'Calligraphiques',symbol:'✒'})
});
export const FINISH_KEYS=Object.freeze(Object.keys(FINISHES));
export const newFinishCounts=()=>({
  normal:{},chromatic:{},holographic:{},calligraphic:{}
});
const validCount=value=>Number.isSafeInteger(value)&&value>=0&&value<=999999;
export function restoreFinishCounts(owned={},shiny={},raw=null){
  const finishCounts=newFinishCounts();
  const source=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:null;
  for(const [id,count] of Object.entries(owned)){
    if(!/^[1-9]\d*$/.test(id)||!validCount(count)||count===0)continue;
    let good=!!source&&FINISH_KEYS.every(f=>source[f]&&typeof source[f]==='object'&&!Array.isArray(source[f]));
    let sum=0;
    if(good)for(const f of FINISH_KEYS){
      const n=source[f][id]??0;
      if(!validCount(n)){good=false;break}
      sum+=n;
    }
    if(good&&sum===count){
      for(const f of FINISH_KEYS){
        const n=source[f][id]??0;
        if(n>0)finishCounts[f][id]=n;
      }
    }else{
      // The legacy boolean did not encode how many chromatic duplicates existed.
      const chromatic=shiny?.[id]===true?1:0;
      if(count>chromatic)finishCounts.normal[id]=count-chromatic;
      if(chromatic)finishCounts.chromatic[id]=chromatic;
    }
  }
  return finishCounts;
}
export function finishQuantity(finishCounts,finish,id){
  return Math.max(0,Number(finishCounts?.[finish]?.[id])||0);
}
export function finishTotal(finishCounts,finish,cards=null){
  const ids=cards?.map(c=>c.id)??Object.keys(finishCounts?.[finish]||{});
  return ids.reduce((sum,id)=>sum+finishQuantity(finishCounts,finish,id),0);
}
export function finishUnique(finishCounts,finish,cards=null){
  const ids=cards?.map(c=>c.id)??Object.keys(finishCounts?.[finish]||{});
  return ids.filter(id=>finishQuantity(finishCounts,finish,id)>0).length;
}
export function preferredFinish(finishCounts,id){
  for(const finish of ['holographic','calligraphic','chromatic','normal'])
    if(finishQuantity(finishCounts,finish,id)>0)return finish;
  return 'normal';
}
export function synchronizeFinishCounts(state){
  // Forge and story rewards may increment owned without updating per-finish counts.
  // Fill only the missing difference as Normal; NEVER discard previously
  // collected special finishes because of an out-of-band reward.
  const counts=state.finishCounts||newFinishCounts();
  for(const finish of FINISH_KEYS)if(!counts[finish]||typeof counts[finish]!=='object')counts[finish]={};
  for(const [id,n] of Object.entries(state.owned||{})){
    if(!validCount(n)||n===0)continue;
    let sum=FINISH_KEYS.reduce((t,f)=>t+finishQuantity(counts,f,id),0);
    if(sum<n){counts.normal[id]=(counts.normal[id]||0)+(n-sum);sum=n;}
    // Imported game states are pre-validated. If corrupt internal counters do
    // not match, prefer the authoritative owned total, not inflated inventory.
    if(sum>n){
      const restored=restoreFinishCounts({[id]:n},state.shiny,null);
      for(const finish of FINISH_KEYS){
        delete counts[finish][id];
        if(restored[finish][id])counts[finish][id]=restored[finish][id];
      }
    }
    if(state.shiny?.[id]===true&&!finishQuantity(counts,'chromatic',id)&&finishQuantity(counts,'normal',id)>0){
      counts.normal[id]-=1;
      if(counts.normal[id]===0)delete counts.normal[id];
      counts.chromatic[id]=1;
    }
  }
  for(const finish of FINISH_KEYS)
    for(const id of Object.keys(counts[finish]))
      if(!state.owned?.[id])delete counts[finish][id];
  for(const id of Object.keys(state.shiny||{}))
    if(!finishQuantity(counts,'chromatic',id))delete state.shiny[id];
  for(const id of Object.keys(counts.chromatic))
    if(finishQuantity(counts,'chromatic',id)>0)state.shiny[id]=true;
  return (state.finishCounts=counts);
}
