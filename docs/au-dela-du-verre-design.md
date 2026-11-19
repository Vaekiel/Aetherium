# AETHERIUM — Au-delà du Verre
## Saison I / Partie III — Bible créative, première version (non publiée)

> **État : conception.** Les 24 cartes décrites ici sont des projets de contenu, pas des objets disponibles dans le jeu. Aucune mise à jour de ce document ne doit, à elle seule, activer des cartes dans le Codex, la Forge, les boosters ou les sauvegardes.

### Promesse narrative

**« Deux mémoires. Un seul horizon à construire. »**

La Fracture primordiale a séparé les destins possibles plutôt que de créer une armée d’ennemis. Dans *Origines*, les voyageurs découvraient les premières légendes ; dans *Les Reflets brisés*, ils rencontraient les habitants du Revers — des vies non vécues qui réclament le droit d’exister. *Au-delà du Verre* explore la conséquence de cette vérité : faut-il choisir un seul monde, ou trouver une façon de faire cohabiter les deux ?

La fin ne doit pas transformer Néméria en antagoniste caricatural ni supprimer les Dédoublés. La résolution repose sur une alliance difficile, pas sur une destruction. La récompense ultime, le **Cœur des Marches**, symbolise un monde qui accepte de porter plusieurs histoires.

Le fil du scénario part de **La Traversée des Reflets** (l'expédition existante) et du message de l'autre rive, puis ouvre un nouvel horizon sans épuiser les possibilités des saisons futures.

### Les 24 cartes

| Acte | IDs | Distribution | Intention |
|---|---|---|---|
| I. L’Entreverre | 49–54 | 6 Communes | Reconnaître les premières coutures du monde |
| II. L’Accord | 55–60 | 6 Inhabituelles | Rencontrer des artisans et messagers du rapprochement |
| III. Le Nœud des chemins | 61–66 | 6 Rares | Voir les risques et les promesses du serment |
| IV. La Convergence | 67–69 | 3 Épiques | Comprendre que deux mémoires peuvent coexister |
| V. Le Dernier Serment | 70–72 | 2 Légendaires + 1 Signature | Laisser aux voyageurs la responsabilité de la suite |

**Référence canonique des noms, types, textes, raretés et 24 briefs artistiques :** `src/au-dela-du-verre-catalog.js`. Les IDs **49–72** sont réservés, sans chevauchement avec les IDs **1–24** et **25–48**. Le dernier ID **72** est un Artefact de rareté Légendaire doté d'un statut **Signature** distinct.

### Direction artistique — L’aube des deux rives

**Continuité stricte :** pixel art HD fantasy extrêmement détaillé, illustration verticale 2:3 au format des cartes actuelles (1024×1536 pour les sources, miniature 350×525), sujet clairement lisible en vignette mobile, architecture crédible et silhouettes précises. Pas de cadre peint, nom, texte, logo, numéro ni watermark dans l’illustration : l’interface existante s’en charge.

**Une identité propre :** les visuels d’Origines représentent des figures et lieux isolés ; les Reflets brisés montrent les fractures et perspectives contradictoires. Cette troisième partie peint les **coutures lumineuses**, les **arches rassemblées** et **deux aubes compatibles**. Ce n’est pas une simple désaturation des miroirs ni une couverture rose. L'indigo nocturne Aetherium reste dominant ; le corail et l’ivoire ne sont que les points de lumière qui donnent un sentiment de conclusion.

| Usage | Teinte | Hex |
|---|---|---|
| Fond et profondeur | Nuit minérale | `#15192a` |
| Volumes, architecture | Indigo d’horizon | `#2c344f` |
| Coutures, liens | Turquoise vivant | `#7bd6c8` |
| Aube très localisée | Corail voilé | `#e6b1b4` |
| Lueurs du monde | Ivoire mémoriel | `#f3e9d5` |
| Cartes Légendaires uniquement | Or mesuré | `#d8bb85` |

**Composition :** un sujet principal occupant la partie centrale, un premier plan pixel-art travaillé, une profondeur de décor en petits plans nets. Éviter les personnages génériques de photoréaliste, les silhouettes aux mains incohérentes et les brillances/effets lisses incompatibles avec des pixels HD nets. Priorité à la lisibilité des cartes de 132–180 px de large sur mobile.

**Booster prévu :** pochette fantasy nuit/indigo, deux arches de verre se rejoignant autour d’une couture turquoise, une faible aube corail à l’arrière-plan. Conserver la structure physique de pochettes Origines et Reflets et la même séquence de déchirure/reveal ; une illustration d’emballage indépendante sera nécessaire, avec deux éditions graphiquement distinctes. Rien ne doit spoiler le visage ni l'illustration de la Signature.

### Règles de publication et de progression

- **23 cartes classiques** (49–71) seront un jour distribuées par un booster dédié *Au-delà du Verre*, au même prix de **100 Couronnes**, avec les mêmes taux de rareté, 3 % de Chromatiques, variété intra-booster, Éclats et coûts de Forge — sauf décision d’équilibrage explicitement testée.
- **La carte 72 Signature**, `Cœur des Marches`, **n’entre jamais** dans les boosters. Elle doit être obtenue en achevant le dernier chapitre narratif/une expédition finale conçue pour cela, sans achat ni monnaie supplémentaire. Une variante Chromatique devra rester gagnable par une maîtrise complémentaire, afin que la complétion Chromatique totale reste possible et ne soit jamais bloquée par une carte inaccessible au tirage.
- Le seuil exact de réussite et le parcours du final seront décidés **avant l'implémentation des récompenses**, avec tests d’unicité de l’attribution et de restauration des sauvegardes.
- Un nouveau palier narratif pourra prolonger ceux d’Origines et des Reflets brisés, mais ne doit jamais distribuer la Signature deux fois.
- La collection ne devient `released:true` qu’après validation des **24 illustrations HD originales**, miniatures, entrées du registre d'images, booster dédié (23 cartes seulement), Forge, accès à la Signature et tests de bout en bout.
- Éviter le piège d’un « premier booster » qui révèle des images manquantes ou des faux visuels : aucun tirage dans les pools incomplets, même temporairement.
- Les sauvegardes locales utilisent toujours `aetherium-save-v1`, avec export/import ; les anciennes cartes, succès, routes, devises et trophées restent intacts.

### Plan d'intégration progressive

1. **Bible + brouillon** : 24 définitions non importées dans le gameplay et aperçu textuel du chapitre dans le Codex — c'est le jalon actuel.
2. **Illustration pilote validée** : la carte n° **49, Passeur des Aubes** dispose maintenant d’un visuel HD 1024 × 1536 et d’une miniature 350 × 525. Ces fichiers sont intégrés à GitHub et montrés dans le Codex en aperçu non jouable, sans ajout au catalogue publié.
3. **Images** : trois lots (10 + 10 + 4) avec leurs miniatures WebP et contrôles de taille/ratio/chargement. Garder une légende cohérente et des couleurs maîtrisées.
4. **Booster** : produire son emballage pixel art original et intégrer le pool séparé de **23 cartes** avec tests (rare garanti au cinquième tirage, Chromatique, non-présence de la Signature).
5. **Finale de saison** : développer une aventure courte et l'obtention sécurisée de la Signature ainsi que sa version Chromatique, sans doubler la récompense lors d'une reprise ou d'un replay.
6. **Publication** : valider sur mobile portrait/paysage, tablette et PC, puis ouvrir les 24 cartes d'un seul coup ; contrôler l’export/import et tous les anciens parcours.

### Fichiers du premier pilote

- `assets/cards/passeur-des-aubes.webp` — illustration HD 1024 × 1536 pixels.
- `assets/cards/passeur-des-aubes-thumb.webp` — miniature WebP 350 × 525 pixels.
- Un lien du Codex ouvre l'illustration en grand. La miniature sert à l'affichage rapide sur téléphone ; le navigateur utilise `srcset` et `sizes` pour choisir l'image adaptée.
- **Validation artistique :** une lumière d'aube chaude, des architectures qui se rejoignent, une palette turquoise / ivoire / bleu nuit, et un véritable rendu pixel art HD net. Les 23 cartes suivantes devront varier fortement les poses, décors et focales.
- L'intégration est uniquement visuelle : `released:false`, aucun taux de tirage modifié, aucune carte 49–72 débloquée, aucun booster / Forge ajouté.

### Règles responsive (non négociables)

Vérification visuelle au minimum sur **320×568, 360×740, 390×844, 667×375 paysage, 768×1024, 1024×768, 1280×800 et 1920×1080** en pixels CSS, ainsi que la navigation clavier et `prefers-reduced-motion`. Le Codex montre une grille fluide, un inspecteur mobile en plein écran et une image HD nette ; le futur booster réutilise le séquençage existant sans blocage tactile. Les faux contrôles et la surcharge d’encadrés sont exclus.

*La bible est lisible publiquement dans GitHub. Le jeu ne doit pas révéler ces textes avant la progression prévue : le teaser du Codex reste volontairement discret.*
