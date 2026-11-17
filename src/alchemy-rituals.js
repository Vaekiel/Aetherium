/* AETHERIUM 1.7.2 — Alchemy mastery.
   All clues are derived from the source formula and verified against every
   distinct 2- or 3-ingredient combination. No guessing or art downgrade. */
export const ALCHEMY_ESSENCES=Object.freeze([
 'végétale','astrale','minérale','astrale','végétale','minérale'
]);
export const ALCHEMY_RECIPE_COUNT=20;
export const ALCHEMY_MODES=Object.freeze({
 initiation:Object.freeze({title:'Les Premières Formules',subtitle:'Deux essences, des indices guidés.'}),
 aventure:Object.freeze({title:'Les Résonances',subtitle:'Deux essences parmi douze formules possibles.'}),
 maitrise:Object.freeze({title:'Le Grand Œuvre',subtitle:'Trois essences, trois équations possibles.'})
});
const permutations=(size)=>{
 const out=[];
 const visit=(start,indices)=>{
   if(indices.length===size){out.push(indices);return}
   for(let i=start;i<6;i++)visit(i+1,[...indices,i]);
 };
 visit(0,[]);
 return out;
};
const sortedFamily=indices=>indices.map(index=>ALCHEMY_ESSENCES[index]).sort().join('/');
const sum=indices=>indices.reduce((acc,index)=>acc+index+1,0);
const gap=indices=>Math.max(...indices)-Math.min(...indices);
const product=indices=>indices.reduce((acc,index)=>acc*(index+1),1);
const validPair=pair=>Array.isArray(pair)&&[2,3].includes(pair.length)&&
 pair.every(i=>Number.isInteger(i)&&i>=0&&i<6)&&new Set(pair).size===pair.length;
const categories=family=>family.split('/').join(' · ');
export function alchemyClue(difficulty,recipe,variant=0){
 if(!validPair(recipe?.[1]))throw new Error('Recette alchimique invalide');
 const mode=ALCHEMY_MODES[difficulty]?difficulty:'aventure';
 const pair=recipe[1],required=mode==='maitrise'?3:2;
 if(pair.length!==required)throw new Error('Formule incompatible avec ce niveau');
 const variation=Math.abs(Math.floor(Number(variant)||0))%3;
 const total=sum(pair),distance=gap(pair),families=sortedFamily(pair),multi=product(pair);
 let title,detail,match;
 if(mode==='initiation'){
   title='L’Essence révélée';
   const known=pair[variation%2],hidden=pair[(variation+1)%2];
   detail='Première essence : '+ALCHEMY_ESSENCES[known]+
     ' (sceau '+(known+1)+'). La seconde porte le sceau '+(hidden+1)+'.';
   match=indices=>indices.includes(known)&&indices.includes(hidden);
 }else if(mode==='aventure'){
   title='La Résonance des essences';
   detail='Familles : '+categories(families)+
     '. Somme des deux sceaux : '+total+'.';
   match=indices=>sortedFamily(indices)===families&&sum(indices)===total;
 }else if(variation===0){
   title='Le Sceau du Trio';
   detail='Trouve trois essences. Somme de leurs sceaux : '+total+
     '. Écart entre le plus petit et le plus grand : '+distance+'.';
   match=indices=>sum(indices)===total&&gap(indices)===distance;
 }else if(variation===1){
   title='La Conjonction des essences';
   detail='Trouve trois essences. Familles : '+categories(families)+
     '. Somme des sceaux : '+total+'.';
   match=indices=>sortedFamily(indices)===families&&sum(indices)===total;
 }else{
   title='L’Œuvre des Anciens';
   detail='Trouve trois essences. Produit des sceaux : '+multi+
     '. Écart entre les sceaux extrêmes : '+distance+'.';
   match=indices=>product(indices)===multi&&gap(indices)===distance;
 }
 const solutions=permutations(required).filter(match);
 if(solutions.length!==1||!pair.every(index=>solutions[0].includes(index)))
   throw new Error('Indice ambigu : la formule doit rester déductible');
 return Object.freeze({
   mode,title,detail,recipeName:recipe[0],
   required:Object.freeze([...pair]),answerCount:solutions.length
 });
}
export function sanitizeAlchemyKnown(raw){
 if(!Array.isArray(raw))return [];
 return [...new Set(raw.filter(id=>Number.isInteger(id)&&id>=0&&id<ALCHEMY_RECIPE_COUNT))].sort((a,b)=>a-b);
}
export function recipeIndex(recipes,name){return recipes.findIndex(item=>item[0]===name)}
export function rememberAlchemyRecipe(known,recipeId){
 if(!Number.isInteger(recipeId)||recipeId<0||recipeId>=ALCHEMY_RECIPE_COUNT)
   return sanitizeAlchemyKnown(known);
 return sanitizeAlchemyKnown([...sanitizeAlchemyKnown(known),recipeId]);
}
