<h1 align="center">✦ AETHERIUM</h1>
<p align="center"><em>Chroniques des Arcanes · Collectionne les légendes, révèle les archives.</em></p>
<p align="center">
  <a href="https://vaekiel.github.io/Aetherium/"><img src="https://img.shields.io/badge/%E2%96%B6_JOUER-EN_LIGNE-b89af0?style=for-the-badge&labelColor=15162a" alt="Jouer à AETHERIUM dans le navigateur"></a>
</p>
<p align="center"><strong>Jeu gratuit · PC, tablette et smartphone · aucune installation</strong></p>

> **Mise en ligne :** après activation de GitHub Pages dans `Settings → Pages → Build and deployment → Source : GitHub Actions`, la publication est automatisée. Le lien ci-dessus devient utilisable lorsque le premier déploiement est terminé.

---

Jeu de collection **100 % gratuit**, jouable dans un navigateur et conçu pour Noctiloom Studio.

**Boucle de jeu :** réussir des mini-jeux → gagner des Couronnes → ouvrir des boosters → compléter le Codex → découvrir des cartes rares et Chromatique.

## ▶ Jouer en ligne

**[▶ Lancer AETHERIUM](https://vaekiel.github.io/Aetherium/)** — fonctionne dans un navigateur moderne sur ordinateur, tablette et téléphone. La sauvegarde est locale à chaque navigateur.

### Jouer en local

Aucun package à installer. Le jeu utilise les modules JavaScript natifs et doit être servi par un serveur HTTP local :

```bash
python3 -m http.server 8000
```

Ouvrir ensuite `http://localhost:8000`.

Le workflow `.github/workflows/pages.yml` valide les modules JavaScript et publie automatiquement la racine du dépôt sur GitHub Pages à chaque push sur `main`.

## AETHERIUM 1.6.0.2 — Laboratoire arcanique : recettes à deviner

La fenêtre du Laboratoire arcanique n'affiche plus la combinaison d'ingrédients sous le nom d'une potion. Le joueur choisit deux ingrédients en déduisant la recette à partir de son nom, puis mémorise les mélanges qui fonctionnent. Une courte instruction non révélatrice remplace l'ancienne solution affichée automatiquement. Les ingrédients choisis restent visibles dans les emplacements de préparation ; les ingrédients requis restent cachés et ne servent qu'à la validation du mélange. Les cinq recettes d'origine, les trois niveaux de difficulté, les récompenses et les sauvegardes sont conservés. Cache JavaScript et CSS réactualisé.

## AETHERIUM 1.6.0.1 — Sélecteur et objectifs réparés

Les trois boutons de difficulté étaient bloqués par une erreur JavaScript : le code utilisait `querySelector` (un élément) au lieu de `querySelectorAll` (une liste de boutons) et interrompait son initialisation. La correction permet de changer immédiatement de mode et relance l'épreuve active. Le texte de l'objectif est maintenant généré à partir des **règles réelles** de chacune des cinq épreuves (erreurs, essais, coups ou nombre de dalles). L'affichage est mobile-first, sans changement de sauvegarde, de tirages, ni de probabilité des boosters.

## AETHERIUM 1.6.0 — Épreuves : difficultés et maîtrise

Trois difficultés immédiatement accessibles, **Initiation / Aventure / Maîtrise**, sont désormais sélectionnables sur l'écran Épreuves (PC et mobile). Le changement relance la seule épreuve active pour que les nouvelles règles soient cohérentes ; les autres épreuves adoptent le mode lorsqu'elles sont sélectionnées. **Aventure** conserve les conditions historiques et les cinq récompenses de base.

| Épreuve | Initiation | Aventure | Maîtrise |
|---|---|---|---|
| Chemin runique | 5 erreurs | 3 erreurs | 2 erreurs |
| Mémoire ancienne | Sans limite | Sans limite | 16 coups maximum |
| Serrure d’Éther | 5 essais | 3 essais | 2 essais |
| Fouilles interdites | 8 dalles sûres | 10 dalles sûres | 12 dalles sûres |
| Laboratoire arcanique | 5 mélanges ratés | 3 mélanges ratés | 2 mélanges ratés |

Chaque victoire enregistre **victoires, meilleur score /100, difficulté maximale gagnée** dans le stockage local existant `aetherium-save-v1`. Un titre de maîtrise (À découvrir, Novice, Apprenti, Initié, Maître) est associé au nombre de victoires sur chaque épreuve. Les gains de base restent **35 / 45 / 50 / 65 / 60 Couronnes** ; une performance excellente en Aventure ou Maîtrise peut donner **+5 Couronnes**, et Maîtrise ajoute **+10 Couronnes**. Initiation n'offre pas de bonus pour éviter de pénaliser ceux qui veulent apprendre. Aucun changement aux cartes, à la forge, aux probabilités ou au prix des boosters.

Le nouveau module `src/trial-progress.js` regroupe ces règles et leurs tests ; `src/trial-progress.css` reprend la direction crépusculaire sans alourdir l'écran. Les anciennes sauvegardes sont conservées et commencent par défaut en mode Aventure. Les mécaniques enrichies de chaque mini-jeu seront développées dans les versions 1.6.1 à 1.6.3.

## AETHERIUM 1.5.4 — Inspection du Codex sans voile sur mobile

Sur mobile, la fiche agrandie du Codex est maintenant affichée dans la **couche supérieure native du navigateur** (Popover API, `manual`). Elle n'est plus limitée à la pile d'affichage de la page animée et ne peut plus être recouverte par le voile `backdrop-filter` du Codex. Les mêmes boutons Fermer, Précédente, Suivante et changement de finition continuent de fonctionner. L'aperçu reste en HD, les autres écrans ainsi que la sauvegarde `aetherium-save-v1` sont inchangés.

## AETHERIUM 1.5.3 — Fenêtre d'inspection mobile au premier plan

Correction du véritable problème de flou lors de l'agrandissement d'une carte sur téléphone : le voile modal était placé hors du conteneur du Codex et passait **devant** la fiche, y compris son illustration HD et ses textes. Le voile est désormais dans le Codex, sous le panneau d'inspection et le tiroir de filtres ; pendant l'ouverture, le conteneur principal passe au-dessus de la barre de navigation. La fiche reste nette, le fond est assombri et flouté, et les commandes de fermeture continuent à fonctionner. Aucun changement des illustrations, du gameplay, des taux de boosters et des sauvegardes.

## AETHERIUM 1.5.2 — Images nettes sur mobile

Les vignettes des cartes utilisent maintenant un `srcset` responsive : le navigateur conserve la miniature WebP pour les affichages suffisamment petits, mais sélectionne l'illustration HD d'origine sur les écrans à forte densité de pixels. Cela améliore la netteté de la grille du Codex et des aperçus non possédés, sans modifier le contenu des cartes ni le fonctionnement des Chromatiques. Lors de la révélation individuelle d'un booster, le jeu affiche désormais directement l'illustration HD au lieu d'agrandir sa miniature. Les images restent chargées à la demande dans les grilles. Les sauvegardes et le gameplay restent inchangés.

## AETHERIUM 1.5 — Le Codex vivant

Le Codex d'Origines est maintenant organisé en **quatre chapitres de six cartes** : Premières Lueurs, Mémoires Anciennes, Terres de Légende et Au-delà des Astres. Ce sont des vues de l'album existant : aucune carte supplémentaire, aucune nouvelle récompense et aucune migration de sauvegarde. La vue « Toutes les archives » continue d'afficher les 24 cartes.

- Les onglets des chapitres affichent leur progression réelle, ainsi que le nombre de Chromatiques obtenues ; deux jauges globales montrent l'avancée du Codex et les variantes prismatiques.
- Le joueur peut afficher uniquement les cartes **découvertes**, **à découvrir**, ou toutes ; ces sélections se combinent aux filtres de catégorie, rareté, finition et recherche existants.
- Les cartes non obtenues se présentent comme des **archives scellées**, sans révéler leur illustration. Une fiche de carte scellée conduit aux Boosters ou à l'Atelier.
- La fiche détaillée comporte désormais une navigation **Précédente / Suivante** parmi les cartes actuellement affichées, avec le chapitre d'origine rappelé sous le nom.
- La comparaison Normale / Chromatique reste accessible, mais repliée par défaut afin de donner toute sa place au Codex. La présentation est responsive sur téléphone, tablette et ordinateur.

Les nouveaux fichiers `src/codex.js` et `src/codex.css` isolent les calculs de progression et la présentation. **Aucune modification** des tirages, de l'économie, des 5 mini-jeux, de la fabrication ni du stockage `aetherium-save-v1`. Le test `tests/codex-smoke.mjs` couvre la couverture complète des chapitres, les filtres, les compteurs et les invariants.

## Animation Chromatique visible dans les boosters (correctif 1.4.3)

Lorsqu'une carte Chromatique est révélée pendant l'ouverture d'un booster, le liseré autour de l'illustration est plus épais et ses couleurs tournent plus vite. Un halo cyan/violet pulse doucement autour de la carte jusqu'à l'action « Carte suivante ». Le dos reste normal pour ne pas révéler à l'avance le tirage. L'animation est adaptée aux petits écrans et s'immobilise si la réduction des mouvements est active. Aucun changement aux illustrations, taux de tirage, sauvegardes ou récompenses.

## Cadres Chromatiques en mouvement (correctif 1.4.2)

La différence avec la version normale est maintenant visible **sur le cadre lui-même** : un dégradé nacré, cyan et violet circule continuellement dans le liseré intérieur, sur la grille, les boosters et l'inspection HD. La lueur reste contenue dans le cadre, derrière l'illustration inchangée ; les contours et le sceau Chromatique demeurent identifiables même sans animation. Effet léger fondé sur une rotation CSS et désactivé lorsque l'utilisateur préfère réduire les mouvements. Les probabilités, la progression et les sauvegardes restent intactes.

## Codex : comparaison Normale / Chromatique (correctif 1.4.1)

Le Codex montre désormais une comparaison côte à côte de la **même illustration** en version normale et en finition Chromatique, y compris lorsqu'aucune variante n'a encore été obtenue. Elle apparaît dans un panneau repliable ouvert par défaut, clairement indiqué comme **aperçu sans déblocage**. L'inspection d'une carte permet aussi de prévisualiser sa finition Chromatique même sans la posséder, avec la mention « APERÇU · NON POSSÉDÉ ». Aucune carte n'est ajoutée à la sauvegarde et les compteurs restent basés uniquement sur les variantes réellement acquises.

La grille et la fiche détaillée ont des reflets prismatiques plus visibles, une bordure plus large et une fenêtre d'art indépendante : **l'illustration HD d'origine est strictement conservée**, le reflet est un calque CSS. La finition reste reconnaissable quand l'animation est désactivée. Le CSS `chromatic.css` et le module `main.js` ont leur URL versionnée pour éviter les anciennes versions en cache sur GitHub Pages. Cette correction ne modifie ni le tirage de 3 %, ni les boosters, ni l'économie, ni les sauvegardes.

## Chromatiques : variantes prismatiques (version 1.4)

Les variantes anciennement appelées **Chromatique** portent désormais officiellement le nom **Chromatiques** dans toutes les pages du jeu. Il s'agit d'une finition prestigieuse et non d'une sixième rareté. Chaque carte ouverte a **3 %** de chance d'être Chromatique (au lieu de 5 %). Les probabilités de rareté d'Origines et la garantie du cinquième emplacement sont inchangées. Les versions Chromatiques restent **exclusives aux boosters** et ne peuvent pas être fabriquées dans l'Atelier.

La DA conserve les **24 œuvres HD de référence**, sans recoloration de leur illustration : un cadre prismatique cyan/lilas/nacre/or, un sceau « CHROMATIQUE », un reflet lent et une distinction statique même lorsque les animations sont désactivées. L'ouverture ajoute un halo ceremonial lors de la révélation, sans retirer le contrôle « Carte suivante ». L'option système « réduction des mouvements » désactive les effets animés.

Le **Codex** présente la progression des 24 cartes découvertes et un compteur indépendant des 24 variantes Chromatiques, des filtres `Toutes les variantes / Normales / Chromatiques`, et une inspection pouvant alterner les versions normales/chromatiques quand la variante est possédée. Les anciennes sauvegardes `aetherium-save-v1` et leurs valeurs `shiny` sont délibérément conservées en interne : les variantes précédemment acquises sont toujours disponibles et s'affichent comme Chromatiques sans migration destructive. Le test `tests/chromatic-smoke.mjs` vérifie notamment le taux, la reprise d'une vraie sauvegarde ancienne et les effets mobiles/réduction de mouvement.

## Forge des Arcanes : fabrication et carte convoitée (version 1.3)

La fabrication est désormais **active** dans l'Atelier pour les cartes qui **manquent** au Codex. Le joueur sélectionne une carte dans une grille illustrée, filtre par rareté ou par cartes actuellement fabricables, puis confirme la transaction. L'opération est contrôlée dans le module pur `src/crafting.js`, qui vérifie la rareté, l'inventaire et le solde avant de produire une nouvelle sauvegarde. Les cartes créées sont **normales** : les Chromatique demeurent réservées aux boosters. Les cartes déjà possédées ne sont jamais fabricables.

| Rareté | Coût en Éclats | Doublons à 5 Éclats |
| --- | ---: | ---: |
| Commune | 20 | 4 |
| Inhabituelle | 45 | 9 |
| Rare | 100 | 20 |
| Épique | 220 | 44 |
| Légendaire | 450 | 90 |

La **carte convoitée** est un objectif facultatif et enregistré dans la sauvegarde locale existante `aetherium-save-v1` (champ additionnel `goalId`). L'Atelier montre la progression en Éclats et le montant manquant. L'objectif se retire automatiquement lorsque la carte est obtenue, que ce soit via forge ou booster. Les anciennes sauvegardes continuent de fonctionner sans migration destructive. Une fenêtre de confirmation précède chaque dépense, et l'inventaire ainsi que le solde sont enregistrés ensemble. Les probabilités des boosters, les récompenses des mini-jeux, les 24 cartes du set Origines et le système Chromatique ne changent pas.

Un test dédié `tests/crafting-smoke.mjs` contrôle chaque rareté, les soldes insuffisants, le refus des doublons, l'absence de Chromatique fabriqué, le maintien des autres ressources et le fonctionnement du suivi d'objectif. Le rendu conserve la DA pixel art HD, avec galerie de recettes sur PC et fiche de fabrication placée avant la galerie sur téléphone.

## Navigation et Atelier des Arcanes (version 1.2)

La navigation principale est structurée en quatre actions complémentaires : **Épreuves** (cinq mini-jeux), **Boosters** (ouvrir les paquets), **Codex** (collection et inspection) et **Atelier** (préparation du futur artisanat). Les quatre icônes utilisent un même ensemble d'emblèmes en pixel art HD. **Chroniques & Succès** restent disponibles via un bouton secondaire dans l'en-tête, ainsi que depuis le Codex et l'Atelier. L'ancienne adresse `#succes` reste valide.

Les compteurs de **Couronnes** et d'**Éclats** dans l'en-tête sont désormais des boutons conduisant respectivement aux Boosters et à l'Atelier.

L'**Atelier des Arcanes** dispose d'une interface responsive dans la DA validée, avec un visuel de forge, un aperçu du circuit Éclats → Forge → Carte, et des compteurs connectés à la sauvegarde actuelle : Éclats possédés, cartes différentes, exemplaires en double. **La fabrication de cartes est maintenant active** avec les coûts détaillés ci-dessus, après une confirmation du joueur. Les données sauvegardées, les probabilités des boosters et toutes les mécaniques des cinq mini-jeux sont inchangées.

## Navigation : losange de l'onglet actif (version 1.1.5)

L'en-tête contenait deux losanges : un décor `top-ornament` fixé au milieu du bandeau, et un indicateur `::after` rattaché au bouton de navigation actif. Le décor fixe a été retiré ; l'indicateur restant est maintenant **centré exclusivement sous l'onglet actif** et suit déjà la classe `active` mise à jour à chaque changement de page. Sur téléphone, l'indicateur reste la bordure supérieure du bouton actif, sans losange additionnel. Le CSS chargé est versionné pour éviter un cache obsolète.

## Bandeau d'accueil : suppression de la ligne traversante (version 1.1.4)

La ligne horizontale qui apparaissait au milieu du titre **« Les ruines s'éveillent »** et se prolongeait dans l'illustration est supprimée à la source : les pseudo-éléments décoratifs `::before` et `::after` du bandeau n'affichent plus de motif ni de bordure. **Le vrai cadre extérieur, le texte, le dégradé et l'illustration de Pluie Astrale sont conservés.** Une nouvelle version de l'URL de `shell.css` permet d'éviter les feuilles de style mises en cache. Le fond PC corrigé, les cinq logos et le gameplay ne changent pas.

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
- **Boosters** : paquet illustré Origines, sceau animé, cinq cartes révélées progressivement, bouton « Tout révéler », et bilan nouvelles cartes / doublons / Chromatique.
- **Accessibilité** : cibles tactiles confortables, gestion du focus et prise en charge des préférences de réduction des animations.

La mise en page desktop et **la clé de sauvegarde `aetherium-save-v1`** ne changent pas. Les sauvegardes existantes restent compatibles.

## Ouverture des boosters (version 0.5)

Le paquet Origines possède un habillage spécifique inspiré du Codex, sans interface supplémentaire encombrante. Un clic sur **Desceller** débite une seule fois les 100 Couronnes et sauvegarde **immédiatement** le tirage. Après une courte animation du sceau, **une seule carte face cachée** apparaît au centre, devant une pile de cartes. Le joueur la retourne puis profite de son illustration et de sa rareté. Il choisit ensuite **Carte suivante** pour découvrir la suivante, jusqu'à la cinquième carte ; les cinq cartes n'apparaissent ensemble qu'au **récapitulatif final**. Les Légendaires, Épiques et Chromatique bénéficient de reflets discrets. **Tout révéler** permet d'accéder directement au récapitulatif. En mode réduction des animations du système, les transitions sont supprimées mais la révélation carte par carte reste possible.

Les **probabilités, garanties, Éclats de doublons et sauvegardes** restent identiques aux versions précédentes ; seule la présentation change.

## Fonctionnalités de la première version

- Interface française, responsive, légère, avec quatre sections : Jouer, Boosters, Collection, Succès.
- Cinq mini-jeux : chemin runique, mémoire, serrure numérique, fouilles à pièges et laboratoire.
- Progression libre sans limite d'énergie ; récompenses attribuées aux défis réussis.
- Booster standard de cinq cartes pour 100 Couronnes, avec garantie d'une Inhabituelle au minimum.
- 24 cartes réparties en cinq raretés ; variantes Chromatique et Éclats de doublons.
- Recherche et filtres dans la collection ; panneau permettant d'admirer la carte agrandie.
- Sauvegarde locale automatique via `localStorage` ; contrôle de validation des données chargées.
- Succès liés à la progression.

## Direction artistique

**Référence approuvée :** maquette finale AETHERIUM (collection au crépuscule). Fond bleu nuit / violet, accents or et lavande discrets, illustrations pixel art HD détaillées, navigation sans surcharge.

**Illustration modèle intégrée :** la carte commune **Veilleuse de Nacre** (archive 001) utilise sa **version rapprochée validée**, dans la collection, les boosters et le panneau d'inspection. Deux fichiers optimisés sont fournis : [miniature 348 × 423](assets/cards/veilleuse-de-nacre-thumb.webp) pour les grilles et [illustration HD 1138 × 1382](assets/cards/veilleuse-de-nacre.webp) pour la vue détaillée. L'aperçu de l'archive 001 est accessible sans obtenir la carte et ne change pas le contenu des sauvegardes. En attendant sa variante Chromatique dédiée, un traitement colorimétrique léger est utilisé.

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

La cinquième carte est garantie **Inhabituelle ou mieux** (65 % / 25 % / 8 % / 2 %). Chaque carte a **3 %** de chances d'être Chromatique. Ces taux sont indépendants de la collection possédée ; les doublons donnent 5 Éclats.

## Suite du développement

Finaliser les illustrations de cartes définitives, approfondir les mini-jeux (future version 1.6), introduire des objectifs de collection, puis préparer les futurs albums et renforcer les tests automatisés.

Pas de compte, pas de cash shop, pas de données personnelles envoyées à un serveur.

## Licence

**AETHERIUM est un projet propriétaire — Tous droits réservés.** Le jeu est gratuit pour les joueurs, mais la reproduction, la redistribution, la modification ou l'exploitation du code et des ressources sans autorisation écrite préalable ne sont pas permises, sous réserve des exceptions légales et des éventuelles licences de tiers. Voir [LICENSE](LICENSE).
