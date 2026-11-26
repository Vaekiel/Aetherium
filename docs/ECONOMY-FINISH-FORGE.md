# Forge des finitions — chantier 02

La Forge propose désormais des recettes pour les cartes déjà découvertes. Chaque fabrication ajoute une copie, préserve les autres finitions, débite uniquement les Éclats et ne rapporte aucun Éclat supplémentaire. Une même finition ne peut pas être forgée deux fois. La Signature reste hors Forge ; ses objectifs de complétion sont à traiter séparément.

| Rareté | Normale | Calligraphique | Chromatique | Holographique |
|---|---:|---:|---:|---:|
| Commune |20|45|35|55|
| Inhabituelle |45|75|60|90|
| Rare |100|120|95|145|
| Épique |220|190|150|230|
| Légendaire |450|300|240|360|

Coût de découverte inchangé. Les tarifs des finitions sont une proposition de départ : la Chromatique est plus fréquente en booster, l'Holographique est le niveau de prestige supérieur. Les Normales manquantes d'une carte déjà découverte peuvent être obtenues au tarif de fabrication classique. L'objectif de Forge persistant reste réservé à la découverte d'une carte inconnue.

Simulation reproductible : `node scripts/audit-finish-forge.mjs`, 200 parcours isolés par collection. Économie d'Éclats jusqu'à pouvoir forger toutes les variantes manquantes d'un coup ; découverte préalable par tirage ou Forge normale. Aucun transfert entre collections, fragments ou Signature. Les résultats constituent une estimation conservatrice, pas une mesure de temps joué. Aucun changement de taux de tirage, récompense de doublon, capital initial ni prix de booster.

Les transactions et le fichier de sauvegarde sont vérifiés par tests unitaires ; le scénario navigateur contrôle les recettes mobiles, annulation, coût exact, conservation de l'ancienne finition et rechargement.
