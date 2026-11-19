/* AETHERIUM — Saison I / Partie III — Au-delà du Verre.
   UNRELEASED narrative + illustration reference only: IDs 49–72.
   Not imported into collection-data.js, main.js, boosters, Forge or saves.
   Card 72 is a story-earned Signature, never a random booster pull. */
export const AU_DELA_DU_VERRE_DIRECTION=Object.freeze({
  seasonId:'marches-de-verre',
  collectionId:'au-dela-du-verre',
  title:'Au-delà du Verre',
  subtitle:'Au bout des reflets, les Marches retrouvent la mémoire de leurs possibles.',
  narrative:'La Fracture primordiale n’a pas engendré un ennemi, mais séparé des destinées qui auraient pu coexister. Les voyageurs découvrent les coutures du monde, rencontrent les gardiens des premiers choix et cherchent une issue qui ne condamne ni les vivants ni les Dédoublés. Le dernier serment ne consiste pas à refermer une porte : il faut apprendre à tenir les deux rives ensemble.',
  palette:Object.freeze({
    deepNight:'#15192a',
    horizonIndigo:'#2c344f',
    livingTurquoise:'#7bd6c8',
    dawnCoral:'#e6b1b4',
    memoryIvory:'#f3e9d5',
    restrainedGold:'#d8bb85'
  }),
  artStyle:'Pixel art HD fantasy très détaillé, vertical 2:3, lisible en vignette mobile : architecture et créatures précises, fils de lumière reliant deux horizons, matières minérales et lueur d’aube ; aucun texte, cadre, logo ni badge incrusté.',
  motifs:Object.freeze([
    'Deux horizons recousus par de minces fils lumineux',
    'Portes ouvertes, arches reconstituées et routes suspendues',
    'Le turquoise du Revers rencontré par une aube corail et ivoire',
    'Reflets en paix plutôt que brisures : passage de la fracture à la rencontre'
  ]),
  chapters:Object.freeze([
    Object.freeze({title:'L’Entreverre',first:49,last:54,theme:'Le voyage commence au bord de deux rives.'}),
    Object.freeze({title:'L’Accord',first:55,last:60,theme:'Les habitants apprennent à coexister.'}),
    Object.freeze({title:'Le Nœud des chemins',first:61,last:66,theme:'Réunir n’efface pas les histoires vécues.'}),
    Object.freeze({title:'La Convergence',first:67,last:69,theme:'Les deux mondes acceptent de se voir.'}),
    Object.freeze({title:'Le Dernier Serment',first:70,last:72,theme:'Le choix d’avenir appartient aux voyageurs.'})
  ]),
  released:false
});

const definitions=[
  // Communes — les premiers objets et messagers franchissent la couture.
  [49,'Passeur des Aubes','Héros','common',
   'Il conduit les voyageurs vers l’horizon qui n’apparaît qu’au moment de choisir.',
   'Voyageur en manteau indigo portant une lanterne ivoire au seuil de deux routes suspendues, aube corail très lointaine.'],
  [50,'Mousse de l’Entreverre','Créature','common',
   'Elle pousse sur les anciennes fissures et nourrit les pierres qui se rejoignent.',
   'Petite créature végétale de mousse turquoise et cristaux arrondis, grandissant dans une jointure de verre ancien.'],
  [51,'Lanternes jumelles','Artefact','common',
   'Deux flammes, une seule chaleur : leur lumière reste vive tant qu’elles se répondent.',
   'Paire de lanternes suspendues reliées par un fil de lumière, lueur cyan et corail dans une ruelle de pierre.'],
  [52,'Brume des deux rivages','Sort','common',
   'Elle dissimule la frontière sans faire disparaître ceux qui attendent de l’autre côté.',
   'Voile de brume nacrée passant au-dessus d’une rivière qui reflète deux ciels différents, lignes de rivage nettes.'],
  [53,'Mésange de la Couture','Créature','common',
   'Son chant se poursuit d’un monde à l’autre, sans jamais manquer une note.',
   'Petit oiseau bleu et ivoire perché sur un fil lumineux entre deux branches appartenant à des saisons opposées.'],
  [54,'Boussole du Dedans','Artefact','common',
   'Son aiguille indique ce qui rapproche les voyageurs, jamais ce qui les sépare.',
   'Boussole antique ouverte dans une main gantée, aiguille turquoise pointant vers une arche reconstituée.'],

  // Inhabituelles — les passeurs tissent des alliances avec le Revers.
  [55,'Émissaire des Possibles','Héros','uncommon',
   'Elle porte des nouvelles de vies jamais vécues, sans exiger qu’on les choisisse.',
   'Messagère aux cheveux argentés dans un manteau prune, tenant deux lettres scellées sous un pont de lumière.'],
  [56,'Tisserande de Quartz','Héros','uncommon',
   'Elle raccommode les chemins oubliés avec les fils que lui confient les Dédoublés.',
   'Artisane à son métier à tisser de cristal, rubans lumineux turquoise et corail traversant une fenêtre d’aube.'],
  [57,'Clef de l’Horizon','Artefact','uncommon',
   'Elle ouvre les portes qui ont cessé de croire qu’elles menaient quelque part.',
   'Grande clé asymétrique en verre opalin et bronze, suspendue devant deux arches dont les perspectives s’accordent.'],
  [58,'Rite des Voix accordées','Sort','uncommon',
   'L’incantation ne fusionne pas les souvenirs : elle leur apprend à se répondre.',
   'Cercles de runes suspendus au-dessus d’un bassin calme, deux spirales de lumière entrant en harmonie.'],
  [59,'Renard des Intervalles','Créature','uncommon',
   'Il traverse les instants où deux chemins se touchent et revient sans jamais se perdre.',
   'Renard au pelage ardoise à queue d’étincelles turquoise, courant d’un pont de pierre vers son double d’aube.'],
  [60,'Veilleur des Passages','Créature','uncommon',
   'Né d’un ancien verrou, il protège maintenant les portes qui consentent à s’ouvrir.',
   'Golem de pierre pâle aux joints lumineux, déposant doucement une porte de verre devant des voyageurs minuscules.'],

  // Rares — l’union des chemins ne doit effacer aucun souvenir.
  [61,'Soryn des Deux Rives','Héros','rare',
   'Il se souvient de deux enfances et refuse qu’on lui demande laquelle est véritable.',
   'Jeune gardien au manteau doublé de deux couleurs, deux paysages distincts se rejoignant derrière sa silhouette.'],
  [62,'Horloge du Premier Choix','Artefact','rare',
   'Elle ne revient pas en arrière : elle révèle l’instant où les routes se sont séparées.',
   'Horloge de pierre à deux cadrans concentriques dans un sanctuaire en ruine, mécanisme lumineux partiellement réparé.'],
  [63,'Griffon de Verre Serein','Créature','rare',
   'Ses ailes ne coupent plus le ciel ; elles soutiennent le passage des voyageurs.',
   'Griffon majestueux à plumes cristallines bleutées et ailes ivoire, volant entre deux falaises reliées de lumière.'],
  [64,'Marche entre les mondes','Sort','rare',
   'Un seul pas suffit parfois à traverser une distance que les siècles avaient creusée.',
   'Chemin de dalles suspendues se construisant dans le vide au passage d’une silhouette, deux ciels en perspective.'],
  [65,'Serment des Passages','Sort','rare',
   'Aucune rive ne sera sauvée au prix de l’oubli de l’autre : voilà la promesse des marcheurs.',
   'Deux silhouettes devant une arche recomposée, un pacte tracé en lumière au-dessus de leurs mains ouvertes.'],
  [66,'Armure de l’Aube intacte','Artefact','rare',
   'Elle a gardé chaque blessure dans son métal, mais les transforme désormais en lumière.',
   'Armure chevaleresque ivoire à fissures soudées d’or discret, posée sur un socle de pierre au lever du jour.'],

  // Épiques — les gardiens arrivent au centre des deux mémoires.
  [67,'Observatoire des Horizons','Artefact','epic',
   'Ses lentilles n’observent pas des mondes lointains, mais les vies qui se regardent enfin.',
   'Observatoire immense sur un pic de verre, coupole ouverte avec deux firmaments reliés par des arcs de lumière.'],
  [68,'Aelys, Gardienne des Liens','Héros','epic',
   'Elle écoute les vies recueillies par Néméria et protège leur droit de rester différentes.',
   'Gardienne élancée en armure indigo et ivoire, trame lumineuse entre les mains, reflet distinct à ses côtés.'],
  [69,'Convergence des Souvenirs','Sort','epic',
   'Les deux mémoires se rencontrent sans se confondre, et le monde retrouve sa profondeur.',
   'Vaste fresque cosmique de souvenirs figuratifs réunis en rubans lumineux, architecture du Revers et villages des Marches.'],

  // Légendaires ordinaires — les gardiens du premier choix.
  [70,'L’Arpenteur des Premiers Jours','Héros','legendary',
   'Il connaît l’origine de la Fracture, mais laisse aux voyageurs le droit de choisir la suite.',
   'Silhouette ancienne à cape étoilée sur une passerelle céleste, arche d’aube en arrière-plan, or mesuré.'],
  [71,'Phénix des Destins réunis','Créature','legendary',
   'Ses ailes portent la chaleur de l’aube et la mémoire de toutes les nuits traversées.',
   'Phénix monumental aux plumes corail et turquoise, émergeant d’une aurore double au-dessus de ruines paisibles.'],

  // Signature — obtenue par accomplissement du final, jamais en booster.
  [72,'Cœur des Marches','Artefact','legendary',
   'Il ne choisit pas entre les deux rives : il tient leur avenir ensemble.',
   'Artefact central monumental de cristal ivoire et turquoise, deux courants de lumière convergent dans un cœur minéral au-dessus des Marches réunies.',
   true]
];

const types=new Set(['Héros','Créature','Sort','Artefact']);
const rarities=new Set(['common','uncommon','rare','epic','legendary']);
export const AU_DELA_DU_VERRE_DRAFT=Object.freeze(definitions.map(
  ([id,name,type,rarity,lore,artBrief,signature=false])=>{
    if(!types.has(type)||!rarities.has(rarity))
      throw new Error('Type ou rareté inconnus pour la carte '+id);
    return Object.freeze({
      id,name,type,rarity,lore,artBrief,
      collectionId:'au-dela-du-verre',
      signature,
      boosterEligible:!signature
    });
  }
));
