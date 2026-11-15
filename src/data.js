export const RARITIES={common:{label:'Commune',weight:55,color:'#a0a9bd'},uncommon:{label:'Inhabituelle',weight:27,color:'#59bd98'},rare:{label:'Rare',weight:12,color:'#64aeed'},epic:{label:'Épique',weight:5,color:'#c48bea'},legendary:{label:'Légendaire',weight:1,color:'#eebd68'}};
const definitions=[
['Veilleuse de Nacre','Héros','common','Elle guide les égarés à travers les ruines englouties.'],
['Sylve, l’Éclaireuse','Héros','common','Elle connaît les sentiers que les cartes ont oubliés.'],
['Golem de Rouille','Créature','common','Les anciennes forges battent encore dans son cœur.'],
['Floraison Cendrée','Sort','common','Même les terres mortes se souviennent du printemps.'],
['Épée de Brume','Artefact','common','La lame se révèle seulement au dernier instant.'],
['Feu Follet','Créature','common','Il attire les curieux là où la nuit prend racine.'],
['Archiviste Nocturne','Héros','uncommon','Gardien des livres d’avant le premier soleil.'],
['Cerf des Lueurs','Créature','uncommon','Ses bois portent les souvenirs de toute une forêt.'],
['Méduse d’Éther','Créature','uncommon','Elle danse au-dessus des courants de magie sauvage.'],
['Lame Prismatique','Artefact','uncommon','Chaque reflet montre une autre destinée.'],
['Chant des Cendres','Sort','uncommon','La dernière mélodie des cités disparues.'],
['Gardienne de Jade','Héros','uncommon','Son serment est gravé dans les temples de verre.'],
['Roi des Lucioles','Héros','rare','Son royaume naît chaque soir et meurt à l’aube.'],
['Horloge du Néant','Artefact','rare','Elle compte les secondes qui n’ont pas existé.'],
['Dragon de Cristal','Créature','rare','Statue vivante au souffle de glace lumineuse.'],
['Oracle des Marées','Héros','rare','Elle entend l’avenir au creux des vagues.'],
['Pluie Astrale','Sort','rare','Le ciel répond aux appels des anciens mages.'],
['Lion d’Obsidienne','Créature','rare','Sa crinière brûle sans laisser de fumée.'],
['Éclipse Vivante','Sort','epic','Le jour et la nuit s’ouvrent comme deux portes.'],
['Reine des Ronces','Héros','epic','Elle protège les jardins aux fleurs stellaires.'],
['Cœur du Colosse','Artefact','epic','Un noyau capable de réveiller une cité volante.'],
['Astra, Reine Fractale','Héros','legendary','Souveraine des mille mondes brisés.'],
['Vyrath, Fléau Céleste','Créature','legendary','Un dragon dont le rugissement ébranle les étoiles.'],
['Dernière Étoile','Sort','legendary','La lumière interdite à tous les dieux.']
];
export const CARDS=definitions.map(([name,type,rarity,lore],i)=>({id:i+1,name,type,rarity,lore,attack:3+Math.floor(i*1.4),health:5+Math.floor(i*1.2),series:'Origines'}));
export const PACK_PRICE=100;
export function rollRarity(rng=Math.random,guaranteed=false){let pool=guaranteed?[['uncommon',65],['rare',25],['epic',8],['legendary',2]]:Object.entries(RARITIES).map(([k,v])=>[k,v.weight]);let value=rng()*100;for(const [rarity,weight] of pool){value-=weight;if(value<0)return rarity;}return 'common'}
export function drawPack(rng=Math.random){return Array.from({length:5},(_,i)=>{const rarity=rollRarity(rng,i===4);const available=CARDS.filter(c=>c.rarity===rarity);return {id:available[Math.floor(rng()*available.length)].id,shiny:rng()<.05}})}
