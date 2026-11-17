/* AETHERIUM — Saison I / Partie II — Les Reflets brisés.
   CREATIVE CATALOGUE ONLY. Not imported by data.js, main.js or booster pools.
   IDs 25–48 are RESERVED for the eventual release, not playable cards.
   Illustration briefs describe original art to commission/create later.
   Release only after full-resolution art, thumbnails, tests and balances exist. */

export const REFLETS_BRISES_DIRECTION=Object.freeze({
  collectionId:'reflets-brises',
  seasonId:'marches-de-verre',
  title:'Les Reflets brisés',
  subtitle:'Dans les Marches de Verre, les miroirs n’obéissent plus.',
  narrative:'Les reflets se détachent de ceux qu’ils imitaient. Derrière les vitres fendues, le Revers garde les souvenirs des chemins qui n’ont jamais été empruntés. Ces doubles ne cherchent pas tous à remplacer les vivants : certains supplient qu’on les libère.',
  palette:Object.freeze({
    night:'#151729',deepViolet:'#383253',
    fracturedTeal:'#78bdb9',ghostLavender:'#c4addc',
    glassWhite:'#dbe8e8',legendaryGold:'#e5c68c'
  }),
  artStyle:'Pixel art HD fantasy très détaillé, illustrations verticales, silhouettes nettes, matière vitreuse et lumière localisée ; pas de cadre, de texte ni de logo incrusté.',
  motifs:Object.freeze([
    'Miroirs irréguliers et fractures obliques',
    'Reflets décalés et ombres en désaccord',
    'Ruines en verre laiteux, eau sombre, brume irisée',
    'Un accent d’or vieilli seulement pour les révélations légendaires'
  ]),
  released:false
});

const definitions=[
  // Communes — les premières anomalies touchent les choses ordinaires.
  [25,'Éclat fugueur','Artefact','common',
    'Chaque nuit, il regagne la fenêtre d’une maison disparue.',
    'Fragment de miroir lévitant au-dessus d’un rebord vide, cité déserte reflétée à l’envers.'],
  [26,'Guetteuse du Revers','Héros','common',
    'Elle surveille un carrefour dont l’autre moitié n’existe plus.',
    'Voyageuse encapuchonnée, lanterne turquoise, devant une intersection brisée en deux réalités.'],
  [27,'Papillon de silice','Créature','common',
    'Ses ailes montrent un paysage différent à chaque battement.',
    'Grand papillon translucide aux ailes en éclats de verre, posé sur une fleur nocturne.'],
  [28,'Pluie à l’envers','Sort','common',
    'Les gouttes remontent vers des nuages que personne ne voit.',
    'Gouttes lumineuses s’élevant d’un lac sombre, reflets de tours suspendues dans le ciel.'],
  [29,'Miroir d’écorce','Artefact','common',
    'Dans son bois poli, les arbres gardent les visages des absents.',
    'Miroir de voyage dans un cadre de racines, portrait spectral entre les veines du bois.'],
  [30,'Loup aux deux ombres','Créature','common',
    'Une ombre le suit ; l’autre semble toujours l’attendre.',
    'Loup gris sur un pont de verre avec deux ombres divergentes et une lune pâle.'],

  // Inhabituelles — on découvre que le Revers possède ses propres habitants.
  [31,'Cartographe des Absents','Héros','uncommon',
    'Elle trace les rues oubliées avant qu’elles ne s’effacent pour toujours.',
    'Exploratrice entourée de cartes translucides où des rues absentes se dessinent en cyan.'],
  [32,'Sentinelle des Fêlures','Créature','uncommon',
    'Elle garde les fissures, sans savoir lequel des mondes elle protège.',
    'Golem élancé de verre fêlé, plusieurs visages de profil dans son torse lumineux.'],
  [33,'Fil des deux rives','Artefact','uncommon',
    'Une simple bobine relie deux portes qui n’ouvrent jamais au même endroit.',
    'Bobine d’argent et fil irisé tendu entre deux arches de pierre aux perspectives impossibles.'],
  [34,'Serment retourné','Sort','uncommon',
    'Les promesses oubliées reviennent chercher ceux qui les ont prononcées.',
    'Anneau d’inscriptions flottantes en miroir autour de deux mains séparées par une vitre.'],
  [35,'Dame de l’autre aube','Héros','uncommon',
    'Elle prétend se souvenir d’un soleil qui ne s’est jamais levé.',
    'Noble silhouette à la cape prune face à un faux lever de soleil dans un miroir fissuré.'],
  [36,'Ronce réfléchie','Créature','uncommon',
    'Ses épines repoussent chaque fois qu’on les voit se briser.',
    'Créature végétale de ronces cristallines, symétrie imparfaite et feuilles de verre bleuté.'],

  // Rares — les souvenirs dédoublés commencent à changer le monde.
  [37,'Copiste des Visages','Héros','rare',
    'Elle ne vole pas les traits : elle emprunte les vies qu’ils racontent.',
    'Portrait dramatique d’une copiste masquée tenant deux visages de verre semi-transparents.'],
  [38,'Cerf sans reflet','Créature','rare',
    'Les eaux le laissent passer sans garder la moindre trace de lui.',
    'Cerf blanc aux ramures prismatiques dans un marais noir, surface parfaitement vide sous ses sabots.'],
  [39,'Sablier des heures doubles','Artefact','rare',
    'Il mesure deux instants à la fois, mais n’en rend jamais aucun.',
    'Sablier monumental aux deux flux de sable opposés, ruines et horloges brisées en arrière-plan.'],
  [40,'Marée de verre','Sort','rare',
    'La vague traverse les pierres et laisse derrière elle des souvenirs étrangers.',
    'Mur liquide de fragments translucides déferlant sur un port nocturne, lueur turquoise.'],
  [41,'Gardien du seuil inversé','Créature','rare',
    'Il ouvre la porte à ceux qui consentent à rencontrer leur autre destin.',
    'Armure vivante d’obsidienne et de miroir devant une porte verticale ouverte sur un couloir inversé.'],
  [42,'Lame de parallaxe','Artefact','rare',
    'Sa pointe frappe l’ennemi là où son reflet se trouvait une seconde plus tôt.',
    'Épée mince et asymétrique traversant trois échos lumineux de sa propre silhouette.'],

  // Épiques — le palais du Revers dévoile son origine.
  [43,'Palais des Dédoublés','Artefact','epic',
    'Ses salles abritent les choix abandonnés de milliers de voyageurs.',
    'Palais colossal aux tours inversées, escaliers impossibles et centaines de fenêtres allumées.'],
  [44,'Cendre de l’autre soleil','Sort','epic',
    'Un astre mort continue de brûler derrière les surfaces réfléchissantes.',
    'Soleil cendreux enfermé dans une sphère de verre, anneaux de feu violet et pluie d’étincelles.'],
  [45,'Elyra, la Sans-Visage','Héros','epic',
    'Elle a cédé son reflet pour préserver les souvenirs de ceux qui n’ont plus de nom.',
    'Gardienne aux vêtements sombres, visage dissimulé par un masque de miroir vide, clefs en cristal.'],

  // Légendaires — la vérité prépare Au-delà du Verre.
  [46,'Néméria, Mère des Reflets','Héros','legendary',
    'Elle n’a pas créé les doubles ; elle a recueilli les vies que la première fracture avait rejetées.',
    'Souveraine de verre opalin dans une nef de miroirs brisés, halo d’or ancien très discret.'],
  [47,'Léviathan du Revers','Créature','legendary',
    'Sous le monde visible nage l’ombre immense de ce qui aurait pu être.',
    'Léviathan cristallin gigantesque sous une mer verticale, ruines réfléchies dans ses écailles.'],
  [48,'Fracture primordiale','Sort','legendary',
    'La faille ne mène pas ailleurs : elle révèle le second visage du même monde.',
    'Déchirure cosmique scindant un paysage fantasy en deux horizons, verre opalin et lumière or-violet.']
];

const types=new Set(['Héros','Créature','Sort','Artefact']);
const rarities=new Set(['common','uncommon','rare','epic','legendary']);

export const REFLETS_BRISES_DRAFT=Object.freeze(definitions.map(
  ([id,name,type,rarity,lore,artBrief])=>{
    if(!types.has(type)||!rarities.has(rarity))
      throw new Error('Type ou rareté de carte non définis');
    return Object.freeze({id,name,type,rarity,lore,artBrief,collectionId:'reflets-brises'});
  }
));
