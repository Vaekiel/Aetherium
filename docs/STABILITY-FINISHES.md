# Chantier 01 — lot 5 : finitions et responsive

Extension du scénario Chromium existant :
- 3 collections et 3 largeurs (360, 768, 1280 px), densité 2x pour téléphone/tablette dans le nouveau scénario.
- Les quatre finitions réelles, sélection unique, dimensions communes et illustration approuvée.
- Calligraphique : filtre monochrome limité à cette finition.
- Chromatique : animation prismatique conservée.
- Holographique : variation de la lumière avec un événement pointeur tactile/souris simulé.
- Une carte ne peut afficher une finition que si elle est possédée.
- Les tests existants continuent de couvrir les cartes scellées, les boosters et les Épreuves responsives.

Limites : Chromium émulé ne remplace pas Safari iOS, le tactile physique ni un véritable gyroscope. Les résultats se trouvent dans la CI.
