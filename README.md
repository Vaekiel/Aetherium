<h1 align="center">✦ AETHERIUM</h1>
<p align="center"><em>Chroniques des Arcanes · Collectionne les légendes, révèle les archives.</em></p>
<p align="center">
  <a href="https://vaekiel.github.io/Aetherium/"><img src="https://img.shields.io/badge/%E2%96%B6_JOUER-EN_LIGNE-b89af0?style=for-the-badge&labelColor=15162a" alt="Jouer à AETHERIUM dans le navigateur"></a>
</p>
<p align="center"><strong>Jeu gratuit · PC, tablette et smartphone · aucune installation</strong></p>

> **Mise en ligne :** après activation de GitHub Pages dans `Settings → Pages → Build and deployment → Source : GitHub Actions`, la publication est automatisée. Le lien ci-dessus devient utilisable lorsque le premier déploiement est terminé.

---

Jeu de collection **100 % gratuit**, jouable dans un navigateur et conçu pour Noctiloom Studio.

**Boucle de jeu :** réussir des mini-jeux → gagner des Couronnes → ouvrir des boosters → compléter le Codex → découvrir des cartes rares et Shiny.

## ▶ Jouer en ligne

**[▶ Lancer AETHERIUM](https://vaekiel.github.io/Aetherium/)** — fonctionne dans un navigateur moderne sur ordinateur, tablette et téléphone. La sauvegarde est locale à chaque navigateur.

### Jouer en local

Aucun package à installer. Le jeu utilise les modules JavaScript natifs et doit être servi par un serveur HTTP local :

```bash
python3 -m http.server 8000
```

Ouvrir ensuite `http://localhost:8000`.

Le workflow `.github/workflows/pages.yml` valide les modules JavaScript et publie automatiquement la racine du dépôt sur GitHub Pages à chaque push sur `main`.

## Emblèmes homogènes des cinq épreuves (version 1.1.3)

Le sélecteur de mini-jeux utilise cinq emblèmes **pixel art HD** inédits, produits en une seule série cohérente : même cadre en pierre ancienne, pierres moussues, ornements dorés, gemmes cyan et volumes identiques. Seul le symbole central change : rose runique (Chemin runique), tablettes jumelles (Mémoire ancienne), serrure circulaire (Serrure d'Éther), cristal de fouilles (Fouilles interdites) et chaudron arcanique (Laboratoire arcanique). Les cinq emblèmes sont réunis dans l'atlas compact `assets/minigames/minigame-emblems.webp`, utilisé sur PC et mobile. Les vignettes n'utilisent plus d'images hétérogènes découpées dans quatre planches différentes. Les mini-jeux, leur déroulement et les règles demeurent inchangés.

## Correctif complémentaire : suppression de la bande illustrée PC (version 1.1.2)

La bande de cascade et de fleurs signalée dans la capture d'écran est fournie par le pseudo-élément de `.ambient-landscape` utilisant `reference-left.webp`. La première correction masquait uniquement les pseudo-éléments à grande largeur, mais la bande persistait chez certains utilisateurs. Cette fois, **le conteneur illustré entier est masqué sur PC**, y compris lorsqu'une fenêtre est étroite et qu'un pointeur souris est présent. L'arrière-plan est remplacé par un dégradé très sombre appliqué directement à `#app`. La feuille de style porte une **nouvelle URL versionnée**, pour contourner les anciennes feuilles CSS mises en cache. La présentation sur téléphone à écran tactile n'est pas modifiée.

## Correctif de fond PC (version 1.1.1)

Le fond des écrans de largeur **851 px et plus** adopte une ambiance nocturne sobre avec des dégradés très doux. Les colonnes d'illustration étirées sur toute la hauteur (gauche, droite et horizon) sont désactivées sur ordinateur pour éviter un rendu déformé ou chargé. Les illustrations des cartes, les bannières, la navigation et les panneaux ne changent pas. **Aucune règle mobile n'est modifiée** ; cette correction est isolée dans une media query desktop, en fin de `src/shell.css`.

## Interface AETHERIUM « Au crépuscule » (version 1.1)

L'interface générale suit la maquette validée **« collection_aetherium_au_crépuscule »**, tout en restant une application réellement jouable et responsive.

- **Navigation :** en-tête fantasy violet nuit, or doux et quatre icônes en pixel art HD réutilisant les pierres runiques. Sur téléphone, navigation basse au pouce et respect des zones de sécurité.
- **Jouer :** bannière de chapitre illustrée, cinq sélecteurs d'épreuves graphiques et **une seule épreuve à la fois**, également sur ordinateur ; panneau narratif sur grand écran.
- **Boosters :** présentation de boutique/rituel du Codex ; révélation individuelle validée préservée.
- **Collection :** Codex avec trois zones (catégories, cartes, inspection) sur écran large, cadres dorés discrets et plus grandes illustrations. Sur téléphone, les filtres latéraux et l'inspection plein écran restent disponibles.
- **Succès :** présentation de registre ornée d'insignes et de cadres runiques.
- **Décors :** nouveau bord droit aux cascades et horizon crépusculaire, découpés depuis la maquette artistique approuvée, soit deux petits WebP (environ 60 Ko cumulés). Réutilisation des assets déjà présents.

Le thème final `src/shell.css` est chargé **en dernier** afin d'harmoniser les cinq mini-jeux sans modifier leur mécanique. Le jeu conserve ses sauvegardes, les 24 cartes d'Origines, les probabilités de booster et l'économie. Les animations restent discrètes et respectent les réglages d'accessibilité.

## Chemin runique en pixel art HD (version 0.6)

Première épreuve retravaillée selon la direction artistique AETHERIUM : **12 pierres runiques illustrées** (soleil, lune, constellations, œil, spirale, arbre, boussole, étoiles, montagne, vagues, sablier et flamme), gravures de pierre, lueurs magiques et détails dorés. Toutes les images proviennent d'une planche WebP de **704 × 528 pixels**, optimisée pour éviter douze chargements d'images séparés.

La grille de quatre colonnes comprend des numéros lisibles, une jauge de progression 12 étapes, un compteur d'erreurs, des états lumineux et une version adaptée aux écrans tactiles. **Les règles sont identiques** : activer les runes 1 à 12 dans l'ordre, trois erreurs maximum, puis gagner 35 Couronnes. Le style est pensé comme modèle visuel pour les quatre autres mini-jeux. Les commandes de réduction des animations sont respectées.

## Mémoire ancienne en pixel art HD (version 0.7)

La seconde épreuve est reconstruite dans la même DA fantasy que Chemin runique : **tablettes d'archives**, dos à sceau doré, huit symboles runiques HD tirés de la planche d'illustrations déjà intégrée, effets de retournement courts, halos cyan sur les paires et petit compteur de progression. Sur téléphone, la grille tactile comporte **16 tablettes (4 × 4)**. Le joueur trouve **8 paires**, en conservant le montant de récompense de **45 Couronnes**. L'ancienne limite de dix essais (prévue pour quatre paires) ne s'applique plus dans cette version ; le nombre de coups et d'erreurs est indiqué. Un bouton « Nouvelle table » réinitialise l'épreuve et annule les retournements précédents. L'option d'accessibilité « Réduire les animations » reste prise en compte. Les boosters, la collection et la sauvegarde ne changent pas.

## Serrure d’Éther en pixel art HD (version 0.8)

La troisième épreuve dispose maintenant d'un **verrou astral circulaire illustré** avec ornements de pierre ancienne et or, et de **six cristaux HD** (Azur, Améthyste, Ambre, Émeraude, Givre et Prisme). Les six cristaux et les états visuels du verrou (scellé / ouvert / brisé) sont issus d'un atlas WebP unique optimisé pour les téléphones.

**Règles conservées :** sélectionner exactement 3 cristaux parmi 6 et atteindre la somme cible en **3 tentatives** pour gagner **50 Couronnes**. L'interface affiche la somme en cours, les trois emplacements sélectionnés et les essais restants. Au succès, le verrou s'illumine et s'ouvre ; au troisième échec, il se fissure. Le joueur peut lancer un nouveau mécanisme sans perdre ses autres progressions. Les animations sont discrètes, désactivables avec la préférence système. Aucun changement aux probabilités des boosters, aux cartes ni aux données de sauvegarde.

## Fouilles interdites en pixel art HD (version 0.9)

La quatrième épreuve se déroule dans un **site de fouilles arcanique** aux textures de pierre ancienne, mousse, cristaux et reliques. Les **25 dalles** de la grille 5 × 5 utilisent un atlas WebP HD unique et optimisé. Un sceau indique la progression (0 à 10 cases sûres) ; les chiffres affichés sur les dalles ouvertes donnent le nombre exact de pièges voisins. Les cases sans piège adjacent montrent parfois une découverte illustrée. En cas de piège, les cinq runes dangereuses apparaissent en rouge, tandis qu'un succès illumine le sceau de victoire. Les commandes sont adaptées aux écrans tactiles et à la préférence de réduction des animations.

**Règles et économie inchangées :** ouvrir dix cases sûres en évitant cinq pièges dissimulés, puis gagner **65 Couronnes**. Le mini-jeu n'ajoute pas de dépense, ne modifie pas les cartes, les boosters ou les sauvegardes existantes.

## Laboratoire arcanique en pixel art HD (version 1.0)

Cinquième épreuve et dernière étape de la refonte graphique : **atelier d'alchimie fantasy** avec six ingrédients illustrés individuellement (Mousse, Soleil, Cristal, Lune, Fleur, Givre) et un **chaudron d'Archives** disposant de trois états pixel art HD : au repos, brassage réussi en cyan et mélange instable en violet/rouge. Les neuf visuels sont issus d'un seul atlas WebP optimisé pour téléphone. Un panneau de grimoire donne la recette en cours, deux emplacements affichent les ingrédients sélectionnés, et une jauge suit les trois potions réussies.

**Règles :** le joueur prépare trois recettes parmi les cinq recettes d'origine, à l'aide de deux ingrédients, sans dépasser trois mélanges incorrects. Il touche les ingrédients puis confirme avec **✦ Mélanger** ; une courte animation du chaudron affiche le résultat et l'épreuve suivante. En cas d'erreur, la recette reste disponible pour être retentée. La victoire rapporte toujours **60 Couronnes**, comme auparavant. La remise à zéro interrompt proprement les animations précédentes et le système respecte les préférences de réduction des animations.

**Les cinq mini-jeux d'Origines disposent désormais d'une direction artistique HD cohérente**. Le prix des boosters, les probabilités, les cartes et la clé de sauvegarde ne sont pas modifiés.

## Expérience mobile (version 0.4)

- **Navigation principale au pouce** : quatre onglets permanents en bas de l'écran, avec gestion des zones de sécurité iOS/Android.
- **En-tête réduit** : identité et monnaies restent visibles sans prendre une rangée complète pour le menu.
- **Collection** : grille à deux cartes sur téléphone (trois sur tablette compacte), recherche, filtres dans un tiroir et galerie d'aperçus facultative.
- **Inspection** : fiche de carte plein écran, fermable avec le bouton ✕, le voile ou la touche Échap ; retour à la grille sans perdre sa position.
- **Mini-jeux** : sélecteur horizontal et une épreuve visible à la fois ; toutes les parties en cours restent en mémoire de session.
- **Boosters** : paquet illustré Origines, sceau animé, cinq cartes révélées progressivement, bouton « Tout révéler », et bilan nouvelles cartes / doublons / Shiny.
- **Accessibilité** : cibles tactiles confortables, gestion du focus et prise en charge des préférences de réduction des animations.

La mise en page desktop et **la clé de sauvegarde `aetherium-save-v1`** ne changent pas. Les sauvegardes existantes restent compatibles.

## Ouverture des boosters (version 0.5)

Le paquet Origines possède un habillage spécifique inspiré du Codex, sans interface supplémentaire encombrante. Un clic sur **Desceller** débite une seule fois les 100 Couronnes et sauvegarde **immédiatement** le tirage. Après une courte animation du sceau, **une seule carte face cachée** apparaît au centre, devant une pile de cartes. Le joueur la retourne puis profite de son illustration et de sa rareté. Il choisit ensuite **Carte suivante** pour découvrir la suivante, jusqu'à la cinquième carte ; les cinq cartes n'apparaissent ensemble qu'au **récapitulatif final**. Les Légendaires, Épiques et Shiny bénéficient de reflets discrets. **Tout révéler** permet d'accéder directement au récapitulatif. En mode réduction des animations du système, les transitions sont supprimées mais la révélation carte par carte reste possible.

Les **probabilités, garanties, Éclats de doublons et sauvegardes** restent identiques aux versions précédentes ; seule la présentation change.

## Fonctionnalités de la première version

- Interface française, responsive, légère, avec quatre sections : Jouer, Boosters, Collection, Succès.
- Cinq mini-jeux : chemin runique, mémoire, serrure numérique, fouilles à pièges et laboratoire.
- Progression libre sans limite d'énergie ; récompenses attribuées aux défis réussis.
- Booster standard de cinq cartes pour 100 Couronnes, avec garantie d'une Inhabituelle au minimum.
- 24 cartes réparties en cinq raretés ; variantes Shiny et Éclats de doublons.
- Recherche et filtres dans la collection ; panneau permettant d'admirer la carte agrandie.
- Sauvegarde locale automatique via `localStorage` ; contrôle de validation des données chargées.
- Succès liés à la progression.

## Direction artistique

**Référence approuvée :** maquette finale AETHERIUM (collection au crépuscule). Fond bleu nuit / violet, accents or et lavande discrets, illustrations pixel art HD détaillées, navigation sans surcharge.

**Illustration modèle intégrée :** la carte commune **Veilleuse de Nacre** (archive 001) utilise sa **version rapprochée validée**, dans la collection, les boosters et le panneau d'inspection. Deux fichiers optimisés sont fournis : [miniature 348 × 423](assets/cards/veilleuse-de-nacre-thumb.webp) pour les grilles et [illustration HD 1138 × 1382](assets/cards/veilleuse-de-nacre.webp) pour la vue détaillée. L'aperçu de l'archive 001 est accessible sans obtenir la carte et ne change pas le contenu des sauvegardes. En attendant sa variante Shiny dédiée, un traitement colorimétrique léger est utilisé.

**Lot d'illustrations n°1 — cartes 002 à 011 :** Sylve, l’Éclaireuse ; Golem de Rouille ; Floraison Cendrée ; Épée de Brume ; Feu Follet ; Archiviste Nocturne ; Cerf des Lueurs ; Méduse d’Éther ; Lame Prismatique ; Chant des Cendres. Chaque carte possède un fichier WebP et une miniature. **Les neuf illustrations tirées de la planche sont maintenant recadrées sans cadre intégré, pictogramme ni bandeau de titre** : le jeu dessine lui-même son cadre et son texte. Sylve conserve son illustration individuelle HD. La version sans cadre du Chant des Cendres représente une lyre enchantée. Ces visuels restent une première passe à affiner individuellement.

**Lot d'illustrations n°2 — cartes 012 à 021 :** Gardienne de Jade, Roi des Lucioles, Horloge du Néant, Dragon de Cristal, Oracle des Marées, Pluie Astrale, Lion d'Obsidienne, Éclipse Vivante, Reine des Ronces, Cœur du Colosse. Ces **10 illustrations individuelles** au format portrait HD (1138 × 1382 px) sont livrées sans cadre ni titre intégré, avec des miniatures légères (350 × 425 px). Elles apparaissent dans les boosters, la Collection et le panneau d'inspection, y compris en mode aperçu sans modifier la sauvegarde. **24 cartes illustrées sur 24** : le premier set Origines est complet.

**Lot légendaire — cartes 022 à 024 :** Astra, Reine Fractale ; Vyrath, Fléau Céleste ; Dernière Étoile. Trois illustrations HD distinctes (1138 × 1382 px), sans texte ni cadre pré-imprimé, accompagnées de leurs miniatures WebP (350 × 425 px). Le registre `src/card-art.js` les affiche dans les boosters, dans la Collection et dans la fiche d'inspection, y compris en mode aperçu. L'obtention et les sauvegardes du joueur ne sont pas modifiées.

## Organisation

```text
index.html        Interface / point d'entrée
src/main.js       Navigation, sauvegarde, mini-jeux, collection, boutique
src/data.js       Catalogue de cartes et probabilités des boosters
src/art.js        Illustrations de secours en pixel art
src/card-art.js   Registre des illustrations HD par carte
assets/cards/     Miniatures et illustrations plein format
src/style.css     Design responsive
```

## Probabilités des boosters

| Rareté | Tirage classique |
| --- | ---: |
| Commune | 55 % |
| Inhabituelle | 27 % |
| Rare | 12 % |
| Épique | 5 % |
| Légendaire | 1 % |

La cinquième carte est garantie **Inhabituelle ou mieux** (65 % / 25 % / 8 % / 2 %). Chaque carte a **5 %** de chances d'être Shiny. Ces taux sont indépendants de la collection possédée ; les doublons donnent 5 Éclats.

## Suite du développement

Créer les illustrations de cartes définitives, approfondir les mini-jeux, ajouter des albums et objectifs de collection, rendre les Éclats utilisables pour fabriquer des cartes, ajouter des effets d'ouverture et renforcer les tests automatisés.

Pas de compte, pas de cash shop, pas de données personnelles envoyées à un serveur.

## Licence

**AETHERIUM est un projet propriétaire — Tous droits réservés.** Le jeu est gratuit pour les joueurs, mais la reproduction, la redistribution, la modification ou l'exploitation du code et des ressources sans autorisation écrite préalable ne sont pas permises, sous réserve des exceptions légales et des éventuelles licences de tiers. Voir [LICENSE](LICENSE).
