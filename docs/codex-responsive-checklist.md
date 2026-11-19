# AETHERIUM — Codex et Collection : contrôle responsive

## Objectif

Une seule interface de collection légère et navigable, de 320 px à un écran large, sans retoucher les mécaniques du jeu. La mise en page utilise la place disponible plutôt qu'une liste de modèles de téléphone.

## Améliorations

- **Grille des cartes** : colonnes fluides au sein de la galerie, cartes à largeur bornée ; une recherche avec un seul résultat ne l'étire pas artificiellement sur toute la page.
- **Titres longs** : retour à la ligne sans débordement horizontal, y compris pour les noms de cartes et les boutons de navigation.
- **Inspection** : image haute définition et détails répartis dans deux zones de contenu sémantiques ; portrait mobile plein écran, et deux colonnes en paysage bas (téléphones) ou lorsqu'un inspecteur de tablette / petit ordinateur est affiché sous la grille.
- **Petits téléphones** : progression du Codex empilée sous 420 px, navigation tactile suffisamment grande, saisons sur une colonne sous 350 px ; prise en compte des marges de sécurité du navigateur et du système.
- **Collection** : chapitres horizontaux scrollables et panneaux des Archives Vivantes conservés ; aucun nouvel écran ni mouvement 3D.
- **Sauvegarde** : aucun nouveau champ, coût, tirage, récompense ou donnée persistante.

## Parcours de validation manuelle

Ces formats sont des **cibles de vérification**, pas des appareils déjà essayés physiquement :

| Largeur × hauteur CSS | Format | Vérifier |
| --- | --- | --- |
| 320 × 568 | Très petit téléphone | Deux cartes lisibles, boutons des filtres, progression empilée, inspection déroulable |
| 360 × 740 | Android compact | Galerie, choix des saisons et carte Chromatique |
| 390 × 844 | Téléphone standard | Fiche ouverte et fermée sans débordement, navigation précédente / suivante |
| 667 × 375 | Téléphone paysage | Image et histoire côte à côte, bouton de fermeture accessible |
| 768 × 1024 | Tablette portrait | Grille étendue, inspecteur superposé, Archives Vivantes |
| 1024 × 768 | Tablette paysage | Inspecteur sur la page, galerie utilisable sans barre horizontale de page |
| 1280 × 800 | Ordinateur | Trois zones cohérentes (filtres, grille, inspection) |
| 1920 × 1080 | Grand écran | Mise en page centrale, cartes non surdimensionnées |

Répéter avec filtres « Toutes / Découvertes / À découvrir », variantes Chromatiques, carte scellée, cardes aux noms longs, recherche sans résultat et zoom navigateur à 200 %. Examiner la navigation au clavier et la préférence de réduction de mouvement.

## Tests automatiques

`tests/codex-responsive-smoke.mjs` vérifie les règles CSS clés, les liens de ressources renouvelés, le rendu réel de la fiche (carte normale, Chromatique, carte scellée), les interactions du navigateur et l'absence de mutation de sauvegarde.

Les tests structuraux ne prouvent pas l'absence de débordement sur tous les moteurs. Un passage réel sur Android, Safari iOS et un navigateur desktop reste nécessaire avant de considérer la compatibilité multi-appareils entièrement validée.
