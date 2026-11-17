/* AETHERIUM 1.7.2 — Le Grimoire oublié.
   Pure clues derived from the five existing recipes. No guesswork: each
   clue describes exactly one pair among the six original ingredients.
   The individual ingredients and original recipe definitions live in main.js. */
export const ALCHEMY_ESSENCES=Object.freeze([
  'végétale','astrale','minérale','astrale','végétale','minérale'
]);
export const ALCHEMY_MODES=Object.freeze({
  initiation:Object.freeze({title:'Les Premières Formules',subtitle:'Une essence est connue, les sceaux te guident.'}),
  aventure:Object.freeze({title:'Les Résonances',subtitle:'Utilise les familles et les valeurs des sceaux.'}),
  maitrise:Object.freeze({title:'La Double Équation',subtitle:'Trouve la combinaison avec deux indices numériques.'})
});
const options=Array.from({length:6},(_,i)=>Array.from({length:5-i},(_,j)=>[i,i+j+1])).flat();
const sortedFamily=indices=>indices.map(index=>ALCHEMY_ESSENCES[index]).sort().join('/');
const sum=indices=>indices.reduce((acc,index)=>acc+index+1,0);
const gap=indices=>Math.abs(indices[0]-indices[1]);
const product=indices=>(indices[0]+1)*(indices[1]+1);
const validPair=pair=>Array.isArray(pair)&&pair.length===2&&
  pair.every(i=>Number.isInteger(i)&&i>=0&&i<6)&&pair[0]!==pair[1];
export function alchemyClue(difficulty,recipe,variant=0){
  if(!validPair(recipe?.[1]))throw new Error('Recette alchimique invalide');
  const mode=ALCHEMY_MODES[difficulty]?difficulty:'aventure';
  const pair=recipe[1];
  const alternating=Number.isInteger(variant)&&variant%2!==0;
  const signs=pair.map(i=>i+1).sort((a,b)=>a-b);
  const total=sum(pair),distance=gap(pair),families=sortedFamily(pair);
  let title,detail,match;
  if(mode==='initiation'){
    title='L’Essence révélée';
    const known=alternating?pair[1]:pair[0];
    const hidden=alternating?pair[0]:pair[1];
    detail='Première essence : '+ALCHEMY_ESSENCES[known]+
      ' (sceau '+(known+1)+'). La seconde porte le sceau '+(hidden+1)+'.';
    match=indices=>indices.includes(known)&&indices.includes(hidden);
  }else if(mode==='aventure'){
    title=alternating?'Le Souffle des familles':'La Résonance des essences';
    // A sum and two families distinguish each of the original recipes.
    detail='Familles : '+families.replace('/',' et ')+
      '. Somme des deux sceaux : '+total+'.';
    match=indices=>sortedFamily(indices)===families&&sum(indices)===total;
  }else{
    title=alternating?'L’Accord des opposés':'La Double Équation';
    detail=alternating
      ?'Somme des deux sceaux : '+total+'. Leur produit : '+product(pair)+'.'
      :'Somme des deux sceaux : '+total+'. Leur écart : '+distance+'.';
    match=indices=>sum(indices)===total&&
      (alternating?product(indices)===product(pair):gap(indices)===distance);
  }
  const valid=options.filter(match);
  if(valid.length!==1||!pair.every(index=>valid[0].includes(index)))
    throw new Error('Indice ambigu : la formule doit rester déductible');
  return Object.freeze({
    mode,title,detail,recipeName:recipe[0],
    required:Object.freeze([...pair]),
    answerCount:valid.length
  });
}
export function sanitizeAlchemyKnown(raw){
  if(!Array.isArray(raw))return [];
  return [...new Set(raw.filter(id=>Number.isInteger(id)&&id>=0&&id<5))].sort((a,b)=>a-b);
}
export function recipeIndex(recipes,name){
  return recipes.findIndex(item=>item[0]===name);
}
export function rememberAlchemyRecipe(known,recipeId){
  if(!Number.isInteger(recipeId)||recipeId<0||recipeId>=5)
    return sanitizeAlchemyKnown(known);
  return sanitizeAlchemyKnown([...sanitizeAlchemyKnown(known),recipeId]);
}
