# AETHERIUM — Au-delà du Verre
## Saison I / Partie III — Bible créative et publication du booster

> **État : saison I complète.** Les 24 illustrations sont intégrées au Codex et les 23 cartes n° 49–71 peuvent être obtenues dans le booster ou à la Forge. La Signature n° 72 se gagne dans Le Dernier Accord, puis en Chromatique lors de sa reprise en difficulté Maîtrise.

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

**Booster livré :** pochette originale en pixel art HD nuit/indigo, arches de verre réunies par une couture turquoise et aube corail, avec le même rituel de déchirure et le même affichage mobile que les autres éditions. Illustration indépendante dans `assets/boosters/au-dela-du-verre-pack-pixel-hd.webp`, sans reproduction de carte ni spoiler de la Signature.

### Règles de publication et de progression

- **23 cartes classiques** (49–71) sont distribuées par un booster dédié *Au-delà du Verre*, au prix de **100 Couronnes**, avec les taux historiques, 3 % de Chromatiques, variété intra-booster, une Inhabituelle garantie et les mêmes Éclats et coûts de Forge.
- **La carte 72 Signature**, `Cœur des Marches`, **n’entre jamais** dans les boosters ni à la Forge. Elle est attribuée une fois après Le Dernier Accord (quatre étapes). Une seconde victoire en difficulté Maîtrise débloque exclusivement sa version Chromatique, sans duplication de la carte.
- Le parcours final exige les trois expéditions historiques (Verriers, Veilleurs, Traversée des Reflets), puis quatre épreuves sur le mode choisi. Le premier passage s’effectue en Initiation ou Aventure ; la Maîtrise s’ouvre après la première victoire.
- Un nouveau palier narratif pourra prolonger ceux d’Origines et des Reflets brisés, mais ne doit jamais distribuer la Signature deux fois.
- La collection est `released:true` avec les 24 entrées Codex. L’accès à la Signature passe exclusivement par l’expédition finale et un passage complémentaire en Maîtrise ; aucun tirage ou fabrication n’est autorisé.
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
3. **Images** : les trois lots **24/24 sont intégrés** (n° 49–72), chacun en HD et miniature WebP. Le booster dédié 49–71 est publié ; la Signature reste scellée.
4. **Booster** : pochette originale et pool indépendant de **23 cartes** livrés, avec tests (Inhabituelle ou mieux au cinquième tirage, Chromatique, absence de la Signature).
5. **Finale de saison** : aventure « Le Dernier Accord » développée, avec choix de serment mémorisé, quatre épreuves, Cœur des Marches normal et Chromatique attribués une seule fois, même après relecture, import ou reprise.
6. **Publication** : valider sur mobile portrait/paysage, tablette et PC, puis ouvrir les 24 cartes d'un seul coup ; contrôler l’export/import et tous les anciens parcours.

### Fichiers du premier pilote

- `assets/cards/passeur-des-aubes.webp` — illustration HD 1024 × 1536 pixels.
- `assets/cards/passeur-des-aubes-thumb.webp` — miniature WebP 350 × 525 pixels.
- Un lien du Codex ouvre l'illustration en grand. La miniature sert à l'affichage rapide sur téléphone ; le navigateur utilise `srcset` et `sizes` pour choisir l'image adaptée.
- **Validation artistique :** une lumière d'aube chaude, des architectures qui se rejoignent, une palette turquoise / ivoire / bleu nuit, et un véritable rendu pixel art HD net. Les 23 cartes suivantes devront varier fortement les poses, décors et focales.
- Cette étape historique était uniquement visuelle ; depuis la sortie du troisième booster, le Codex et les cartes 49–71 sont jouables, la Signature restant réservée.

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

**Historique du lot 1 :** initialement aperçu uniquement. Depuis la publication de la partie III, les cartes 49–71 rejoignent les boosters, la Forge et les sauvegardes locales, sans changer les 48 premières. La carte 72 reste exclue des tirages et de la Forge.

### Deuxième lot d’illustrations — cartes 59 à 68

Les dix visuels du deuxième lot ont été intégrés **sans modifier les noms ni la rareté des cartes** définies dans `src/au-dela-du-verre-catalog.js`. Chacun existe en WebP HD **1024 × 1536** et en miniature **350 × 525**. Les 20 fichiers ont été archivés dans Google Drive, puis transférés vers GitHub avec contrôle des empreintes Git des binaires.

| N° | Carte | Nom de fichier (sans extension) | Rareté |
| --- | --- | --- | --- |
| 59 | Renard des Intervalles | `renard-des-intervalles` | Inhabituelle |
| 60 | Veilleur des Passages | `veilleur-des-passages` | Inhabituelle |
| 61 | Soryn des Deux Rives | `soryn-des-deux-rives` | Rare |
| 62 | Horloge du Premier Choix | `horloge-du-premier-choix` | Rare |
| 63 | Griffon de Verre Serein | `griffon-de-verre-serein` | Rare |
| 64 | Marche entre les mondes | `marche-entre-les-mondes` | Rare |
| 65 | Serment des Passages | `serment-des-passages` | Rare |
| 66 | Armure de l’Aube intacte | `armure-de-l-aube-intacte` | Rare |
| 67 | Observatoire des Horizons | `observatoire-des-horizons` | Épique |
| 68 | Aelys, Gardienne des Liens | `aelys-gardienne-des-liens` | Épique |

**Historique du lot 2 :** 20 images sur 24 étaient présentes, en aperçu uniquement. Le troisième lot a depuis achevé les illustrations et le booster dédié est disponible.

### Troisième et dernier lot — cartes 69 à 72

Les quatre dernières illustrations sont intégrées à la galerie en aperçu, au format WebP HD **1024 × 1536** et miniature **350 × 525**. Les huit fichiers ont transité par Google Drive et leurs SHA Git ont été comparés aux originaux sans réencodage.

| N° | Carte | Fichier (sans extension) | Rareté |
| --- | --- | --- | --- |
| 69 | Convergence des Souvenirs | `convergence-des-souvenirs` | Épique |
| 70 | L’Arpenteur des Premiers Jours | `arpenteur-des-premiers-jours` | Légendaire |
| 71 | Phénix des Destins réunis | `phenix-des-destins-reunis` | Légendaire |
| 72 | Cœur des Marches | `coeur-des-marches` | Légendaire · Signature (hors boosters) |

**État artistique : 24 sur 24.** Le Codex affiche toutes les cartes : les 23 premières sont disponibles dans le booster ou à la Forge. Le Cœur des Marches est une récompense exclusive de la finale, dont la finition Chromatique nécessite une victoire supplémentaire en Maîtrise. Les deux anciens boosters et le format de sauvegarde restent compatibles.

### Règles responsive (non négociables)

Vérification visuelle au minimum sur **320×568, 360×740, 390×844, 667×375 paysage, 768×1024, 1024×768, 1280×800 et 1920×1080** en pixels CSS, ainsi que la navigation clavier et `prefers-reduced-motion`. Le Codex montre une grille fluide, un inspecteur mobile en plein écran et une image HD nette ; le futur booster réutilise le séquençage existant sans blocage tactile. Les faux contrôles et la surcharge d’encadrés sont exclus.

*La bible est lisible publiquement dans GitHub. Le jeu ne doit pas révéler ces textes avant la progression prévue : le teaser du Codex reste volontairement discret.*

### Aventure finale jouable — Le Dernier Accord

**Déblocage :** terminer *Le Sentier des Verriers*, *La Veille des Échos* et *La Traversée des Reflets*. La quatrième expédition apparaît d’abord verrouillée, avec sa progression 0/3 à 3/3. Aucun quota de cartes tirées, aucune dépense de Couronnes.

| Acte | Épreuve existante | Enjeu |
| --- | --- | --- |
| I — Les Voix oubliées | Mémoire ancienne | Réconcilier les témoignages sans effacer les Dédoublés |
| II — Le Chemin des possibles | Fouilles interdites | Bâtir un passage sûr dans les ruines |
| III — Les Runes de l’Accord | Runes des Origines | Composer un langage commun |
| IV — Le Dernier Serment | Laboratoire arcanique | Choisir un serment et accomplir le rite final |

**Choix de conclusion :** *Bâtir des ponts*, *Garder les mémoires* ou *Ouvrir les passages*. Les trois choix donnent un épilogue différent mais récompensent équitablement les joueurs. Le choix est enregistré avant le rite et ne peut être changé pendant l’épreuve.

**Récompenses :** première conclusion (mode Initiation ou Aventure) = une seule carte n° 72 normale, sans Éclats supplémentaires. Le parcours peut être rejoué en **Maîtrise** pour débloquer la finition Chromatique de la même carte ; pas de deuxième exemplaire. Les victoires de mini-jeux continuent de payer leurs Couronnes habituelles, mais l’expédition ne crée aucune prime ni booster gratuit. Aucun doublon lors d’un double clic, d’un replay, d’un import ou d’un rafraîchissement.

**Technique :** la sauvegarde conserve la clé `aetherium-save-v1` et la structure racine existante ; le choix rejoint simplement l’état de l’expédition finale. La vraie validation des épreuves reste obligatoire pour progresser. Les anciens parcours et leurs fragments gardent leurs identifiants et leurs étapes.
