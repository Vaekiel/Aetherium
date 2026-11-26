# Chantier 09 — Préparer les saisons suivantes

## Contrat de non-régression

- Saison I inchangée : 72 cartes, IDs 1–72, trois collections permanentes et pools 24/24/23. La Signature 72 est réservée au Dernier Accord et exclue de tous les tirages et de la Forge.
- Prix 100 Couronnes, cinq cartes par paquet, cinquième au moins Inhabituelle, probabilités de finition inchangées. Aucun nouveau gain ni nouveau taux.
- Clé locale `aetherium-save-v1`, enveloppe d'export v1, données et compteurs de finitions inchangés. Ne jamais renuméroter, recycler ni retirer des IDs publiés. Les futures cartes s'ajoutent uniquement. Une ancienne version doit refuser sans écraser une sauvegarde portant un ID inconnu.
- Les collections prévues ne sont ni tirables, ni forgeables, ni comptées comme cartes publiées. Un emplacement réservé n'est pas une carte.

## Répartition des responsabilités

| Fichier | Responsabilité |
|---|---|
| `src/seasons.js` | Identifiants, ordre, plages de cartes réservées, statut de publication |
| `src/content-standard.js` | Fabrique de contenu : une fiche auteur fournit une carte et son illustration |
| `src/collection-data.js` | Groupes publiés, recherche par ID, pools et moteur de tirage commun |
| `src/card-art.js` | Registre de livraison : vignette, HD, largeur, version de cache |
| `src/booster-views.js` | Présentation du booster (illustration, titre, description, thème partagé) |
| `src/season-conformity.js` | Contrôles de conformité et de séparation brouillon/publication |
| `tests/season-release-gate.mjs` | Contrôle du catalogue publié et des fichiers WebP, tailles futures |
| `tests/season-conformity-smoke.mjs` | Régression de ce chantier (Saison I, tirages, brouillons, sauvegardes) |

## Saison II — Le Plateau Nébuleux

| Collection réservée | IDs | Statut |
|---|---:|---|
| plateau-1 | 73–96 | Non publiée |
| plateau-2 | 97–120 | Non publiée |
| plateau-3 | 121–144 | Non publiée ; emplacement de Signature prévu |

Les trois titres publics provisoires existants sont conservés. Aucun nom de carte, texte, illustration, fragment, dénouement ou récompense de Saison II n'est décidé ici. La bible narrative (Grand Codex v1.0) est la référence : le Revers est un autre visage du monde, les Dédoublés ne sont pas un peuple ennemi, la fin de la Saison I réconcilie les deux rives sans effacer leurs histoires. Préserver les mystères et la valeur de tous les épilogues. Toute création de contenu passe par une validation narrative et artistique séparée.

## Procédure pour une nouvelle collection

1. Créer une branche de contenu ; réserver une plage non chevauchante dans le registre des saisons, avec `released:false`. Les brouillons et ressources non approuvés ne doivent pas entrer dans les modules jouables.
2. Préparer 24 fiches auteur avec ID stable, nom, type, rareté, lore, statistiques explicites, slug d'illustration et éventuels flags Signature. Utiliser `defineCollectionContent({title,first,last,artVersion,entries})`. Chaque entrée contient `id,name,type,rarity,lore,attack,health,slug` et éventuellement `signature,boosterEligible`. La fabrique fournit `cards` et `art`. Aucun tirage ou nom n'est généré automatiquement.
3. Valider le lore et les images. Pour les collections futures : WebP portrait 2:3, HD 1024 × 1536, vignette 350 × 525, même cadrage ; pas de texte, logo, cadre, statistique ou halo incrusté. Sujet lisible sur mobile, pixel art HD fantasy, identité crépusculaire, palette propre à la région. Les anciens fichiers restent à leur définition historique. Les métadonnées indiquent la largeur réelle et une version de cache ; les finitions sont des traitements du recto existant, non des illustrations dupliquées.
4. Normale, Calligraphique, Chromatique, Holographique : conserver les quatre identifiants historiques et leur ordre ; effets seulement si possédés. Les halos de rareté restent indépendants, commun = blanc. Une Signature ne rejoint jamais un pool ou la Forge ; son mode d'acquisition et ses finitions possibles doivent être définis avant publication.
5. Le paquet suit le modèle commun : 640 × 1040 WebP, identité AETHERIUM, nom de collection, saison correcte, cinq cartes. Ajouter une entrée de présentation dans `BOOSTER_VIEWS` avec `theme:'standard'`. Le contrôleur génère la vignette du nouveau booster à partir du modèle validé ; le modal réutilise le paquet commun. Les trois vignettes historiques ne sont pas régénérées.
6. Sur la branche uniquement, ajouter le groupe dans `CARD_GROUPS`, diffuser `content.art` dans `CARD_ART`, ajouter la présentation et passer la collection à `released:true` ensemble. Les tests refusent une collection publiée incomplète ou un contenu non publié exposé. Mettre à jour les versions de cache des modules dépendants et les données de progression narratives approuvées (paliers, Annales, expédition et éventuelle Signature).
7. Exécuter `node --experimental-default-type=module tests/season-release-gate.mjs`, puis le test de non-régression de la saison existante. Le smoke du chantier 09 fige volontairement les 72 cartes publiées : lors d'une vraie publication, adapter uniquement ses assertions de périmètre à l'extension approuvée, pas les invariants historiques. GitHub Actions exécute ces deux scripts sans déployer.
8. Tester Chromium (mobile, tablette, PC) : liste des boosters, achat, révélation, Codex, finitions, Forge, fragments, sauvegarde ancienne/import/export, fermeture/rechargement et retour à une ancienne version. Tester une sauvegarde de S1 sur une copie de travail, jamais avec la sauvegarde réelle du joueur. Aucun merge ni déploiement avant validation.

## Limites intentionnelles du chantier

- Les récits d'expédition, paliers et conditions d'acquisition de la future Signature nécessitent un contenu validé. Ils ne sont pas fabriqués par le registre.
- Les illustrations existantes ne sont ni redimensionnées ni remplacées. Les contrôles de taille stricte s'appliquent aux futures collections.
- La création du contenu saison II et l'équilibrage restent hors périmètre. Les tests Chromium et les contrôles binaires de fichiers doivent être exécutés sur une copie du dépôt avant fusion.
