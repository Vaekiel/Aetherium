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

### Illustration pilote n° 49 — Passeur des Aubes (validée le 19 novembre 2026)

Le rendu final du pilote a été **approuvé comme référence d’ambiance et de pixel art HD**. Il associe un personnage lisible, une architecture de passage, un horizon d’aube ivoire et corail, des accents turquoise et des ombres indigo. Cette image sert de **référence de qualité et de palette**, et **non de composition unique à recopier** : les autres cartes doivent mettre en scène des objets, créatures, sorts et héros très distincts.

Deux fichiers WebP correspondant **exactement à cette image validée** ont été préparés hors dépôt :

- `assets/cards/passeur-des-aubes.webp` — 1024 × 1536 px, image HD ;
- `assets/cards/passeur-des-aubes-thumb.webp` — 350 × 525 px, vignette responsive.

Leur taille et leurs empreintes SHA-256 figurent dans `docs/au-dela-pilot-assets.json` pour éviter toute substitution involontaire. La source PNG et le paquet des deux WebP ont été archivés sur Google Drive le 19 novembre.

**Statut GitHub : le pilote et sa miniature sont intégrés en aperçu dans le Codex.** Ils ne font pas partie du registre des cartes jouables (`src/card-art.js`) tant que la collection n’est pas publiée.

### Plan d'intégration progressive

1. **Bible + brouillon** : 24 définitions non importées dans le gameplay et aperçu textuel du chapitre dans le Codex — c'est le jalon actuel.
2. **Illustration pilote validée** : la carte n° **49, Passeur des Aubes** dispose maintenant d’un visuel HD 1024 × 1536 et d’une miniature 350 × 525. Ces fichiers sont intégrés à GitHub et montrés dans le Codex en aperçu non jouable, sans ajout au catalogue publié.
3. **Images** : premier lot **10/24 intégré** (pilote n° 49 + neuf cartes n° 50–58) en HD et miniatures WebP. Poursuivre les lots restants en contrôlant le ratio, le chargement et la diversité artistique.
4. **Booster** : produire son emballage pixel art original et intégrer le pool séparé de **23 cartes** avec tests (rare garanti au cinquième tirage, Chromatique, non-présence de la Signature).
5. **Finale de saison** : développer une aventure courte et l'obtention sécurisée de la Signature ainsi que sa version Chromatique, sans doubler la récompense lors d'une reprise ou d'un replay.
6. **Publication** : valider sur mobile portrait/paysage, tablette et PC, puis ouvrir les 24 cartes d'un seul coup ; contrôler l’export/import et tous les anciens parcours.

### Fichiers du premier pilote

- `assets/cards/passeur-des-aubes.webp` — illustration HD 1024 × 1536 pixels.
- `assets/cards/passeur-des-aubes-thumb.webp` — miniature WebP 350 × 525 pixels.
- Un lien du Codex ouvre l'illustration en grand. La miniature sert à l'affichage rapide sur téléphone ; le navigateur utilise `srcset` et `sizes` pour choisir l'image adaptée.
- **Validation artistique :** une lumière d'aube chaude, des architectures qui se rejoignent, une palette turquoise / ivoire / bleu nuit, et un véritable rendu pixel art HD net. Les 23 cartes suivantes devront varier fortement les poses, décors et focales.
- L'intégration est uniquement visuelle : `released:false`, aucun taux de tirage modifié, aucune carte 49–72 débloquée, aucun booster / Forge ajouté.

### Premier lot d'illustrations — 10 cartes sur 24 (49–58)

Les neuf nouvelles illustrations ont été liées **aux fiches existantes du catalogue canonique**, sans changer les noms ni les raretés. Les originaux PNG ont été convertis en WebP HD **1024 × 1536** et en vignettes **350 × 525**. Le lot de **18 nouveaux WebP** a transité par Google Drive avant le commit GitHub ; les empreintes SHA des fichiers ont été comparées lors du transfert pour éviter toute substitution.

| N° | Carte | Fichier (sans extension) | Rareté |
| --- | --- | --- | --- |
| 49 | Passeur des Aubes | `passeur-des-aubes` | Commune (pilote déjà publié en aperçu) |
| 50 | Mousse de l’Entreverre | `mousse-de-l-entreverre` | Commune |
| 51 | Lanternes jumelles | `lanternes-jumelles` | Commune |
| 52 | Brume des deux rivages | `brume-des-deux-rivages` | Commune |
| 53 | Mésange de la Couture | `mesange-de-la-couture` | Commune |
| 54 | Boussole du Dedans | `boussole-du-dedans` | Commune |
| 55 | Émissaire des Possibles | `emissaire-des-possibles` | Inhabituelle |
| 56 | Tisserande de Quartz | `tisserande-de-quartz` | Inhabituelle |
| 57 | Clef de l’Horizon | `clef-de-l-horizon` | Inhabituelle |
| 58 | Rite des Voix accordées | `rite-des-voix-accordees` | Inhabituelle |

La galerie des **dix premiers horizons** est consultable dans **Codex → Saison I → Au-delà du Verre**. Le composant `src/au-dela-gallery.js` récupère les noms, types, raretés et fragments d’histoire depuis `src/au-dela-du-verre-catalog.js` ; il n’invente ni nouvelle carte ni statistique.

Les fichiers d'art sont nommés `assets/cards/<slug>.webp` et `assets/cards/<slug>-thumb.webp`. Le lien vers la grande illustration est accessible au clavier et sur mobile ; les miniatures chargent à la demande. L’interface s’adapte des téléphones aux grands écrans.

**Protection avant sortie :** la collection reste `released:false` ; les cartes 49–72 ne sont disponibles ni dans le booster, ni dans la Forge, ni dans les sauvegardes. Les 48 cartes publiées gardent leurs images et leurs règles. L'intégration du lot est **visuelle uniquement**.

### Règles responsive (non négociables)

Vérification visuelle au minimum sur **320×568, 360×740, 390×844, 667×375 paysage, 768×1024, 1024×768, 1280×800 et 1920×1080** en pixels CSS, ainsi que la navigation clavier et `prefers-reduced-motion`. Le Codex montre une grille fluide, un inspecteur mobile en plein écran et une image HD nette ; le futur booster réutilise le séquençage existant sans blocage tactile. Les faux contrôles et la surcharge d’encadrés sont exclus.

*La bible est lisible publiquement dans GitHub. Le jeu ne doit pas révéler ces textes avant la progression prévue : le teaser du Codex reste volontairement discret.*
