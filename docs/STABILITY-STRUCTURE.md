# Chantier 01 — lot 2 : audit structurel et compatibilité
Base : 1fd39a80b3a7f0ccb48f52c0b985475c3ec66c59 (branche de stabilisation).

## Constats
- 332 fichiers versionnés, 177 assets ; environ 55 Mo d'assets au total (taille du dépôt de jeu, pas du chargement initial).
- Les références littérales contrôlées dans l'HTML, les modules principaux et les catalogues existent.
- Le code appelle matches(':popover-open') au démarrage sans vérifier la disponibilité de l'API Popover. Sur un navigateur ne connaissant pas ce pseudo-sélecteur, une exception peut bloquer le démarrage.

## Correctif et garde-fous
- Ne tester le pseudo-sélecteur qu'en présence de hidePopover.
- Nouveau smoke test : 72 identifiants uniques et ordonnés, 144 chemins d'illustrations, dépendances locales et invariants du catalogue.
- Aucun changement des règles, de l'économie, des cartes ou des illustrations.
- L'audit statique ne remplace ni les tests d'exécution ni Safari sur appareil réel.
