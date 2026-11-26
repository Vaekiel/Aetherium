# Chantier 02 — Audit de l'économie (P0)

Base : d469776cefbe33a161c874c115179f7395effd71. Ce lot ne change aucune valeur de gameplay.

## Méthode
Exécuter `node scripts/audit-economy.mjs` depuis la racine (Node 22). Le script importe les fonctions actuelles de tirage, Forge, récompense de doublons et fragments. Il utilise un générateur déterministe pour 600 parcours par booster ; 100 de ces parcours par booster suivent en plus les quatre finitions. Les trois collections sont isolées : pas de transfert d'Éclats entre elles, pas de Signature dans les pools, pas d'Éclats initiaux. Les fragments sont réclamés dès leur disponibilité. Stratégie Forge : économiser jusqu'à pouvoir fabriquer toutes les cartes manquantes d'un coup (pas nécessairement optimale). Les résultats p10, médiane, p90, moyenne sont imprimés. Les finitions sont comptées uniquement par tirage, sans Forge.

Les estimations de temps dépendent des taux de succès et de durée des tentatives réels. Aucun taux de réussite joueur n'est inventé comme une mesure. La somme des médianes de collections n'est pas la médiane de la saison. Les expéditions, récompenses de Signature et coûts de temps ne sont pas inclus dans les tirages.

## Constats statiques
- 300 Couronnes initiales, 100 par booster ; 5 cartes.
- Épreuves : bases 35, 45, 50, 65 et 60. Initiation : base ; Aventure : base +5 si score >=90 ; Maîtrise : base +15, encore +5 si score >=90.
- Éclats des doublons : 5, 7, 10, 15, 25 selon rareté ; aucune prime de finition. Moyenne théorique d'un paquet entièrement en doublons : 36,11 Éclats.
- Forge : 20, 45, 100, 220, 450 Éclats ; carte inconnue uniquement, finition normale. Pas de moyen déterministe d'obtenir une finition spéciale.
- Fragments par collection : +30 Couronnes à 6 cartes, +55 à 12, +20 Éclats à 18, +100 Couronnes à 24 (une fois).
- Signature : réservée à l'expédition finale, améliorée de Normale vers Chromatique en Maîtrise. La conversion ne donne pas une seconde copie (comportement confirmé par le test finale). Ni Calligraphique ni Holographique de la Signature ne sont actuellement disponibles. Les compteurs de finitions utilisent malgré tout 72 comme dénominateur, y compris les qualités inaccessibles. Le choix de conserver l'amélioration exclusive ou de permettre de collectionner les deux versions doit être validé avant modification.
- Les différences de gains par heure entre Épreuves demandent des données de temps et de réussite. Les seuils de rentabilité entre deux modes peuvent être calculés sans télémétrie, à durée égale.

## Décisions à instruire
1. Objectif de durée pour obtenir les 71 cartes de booster, puis la Signature séparément.
2. Finitions spéciales : prestige aléatoire de long terme ou objectif de complétion réalisable via une mécanique anti-malchance/Forge spécialisée.
3. Corriger la progression des finitions en respectant le choix de fonctionnement de la Signature.
4. Ajuster les récompenses d'Épreuves seulement sur la base de scénarios explicites de durée/réussite, sans pénaliser l'Initiation ni imposer de connexion quotidienne.

Pas d'achat réel, pas de compte, pas de modification de sauvegarde.
