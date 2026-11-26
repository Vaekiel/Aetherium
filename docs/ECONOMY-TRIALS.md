# Chantier 02 — Rentabilité des Épreuves

## Ce qui est mesurable
Les récompenses actuelles sont conservées. Initiation : base ; Aventure : base à base +5 ; Maîtrise : base +15 à base +20. Le bonus de 5 dépend du score (au moins 90/100).
Le texte de la récompense indique maintenant le montant garanti par victoire et le maximum. Les sondes indiquent leur impact sur le score.

`node scripts/audit-trial-economy.mjs` importe les règles réelles et calcule les seuils de rentabilité entre modes et des scénarios de gains par heure. Il vérifie également 1 000 grilles de Fouilles par mode en suivant systématiquement l'entrée sûre puis les sondes gratuites.

## Constat
La stratégie assistée garantit une victoire aux Fouilles (sous réserve de suivre la case indiquée). Elle donne 65 Couronnes en Initiation/Aventure et 80 en Maîtrise, sans bonus de performance. Cela ne prouve pas qu'elle maximise les gains par minute : la Serrure demande seulement trois sélections et une validation si la solution est trouvée immédiatement ; le temps de réflexion, les essais ratés et les relances varient.

À durée et score parfait identiques, la Maîtrise doit conserver environ 73–82 % du taux de réussite de l'Aventure pour être rentable. Si elle dure 25 % de plus, ce seuil monte à environ 91–103 %. À durée identique, l'Aventure parfaite doit conserver 88–93 % du taux de réussite de l'Initiation ; sans bonus, seule une réussite égale est rentable.

## Arbitrage
Aucun nerf des sondes, aucune limite de gains, aucune obligation de jouer chaque jour. Préserver l'accessibilité et le choix du joueur. Les durées et taux de réussite de personnes réelles ne sont pas connus : une modification chiffrée des gains serait prématurée. Recommandation : chronométrer quelques parties de chaque mode (y compris les échecs et relances), puis calculer Couronnes / minute. L'audit donne des scénarios explicites de 30, 60 et 90 secondes et 80 % de réussite, non des mesures.

Aucun nouvel enregistrement ni télémétrie ; sauvegardes, règles de gains, prix, taux et équilibrage des Épreuves inchangés. Le chantier économique peut être livré avec ce contrôle et l'équilibrage fin des Épreuves évalué lors des essais réels.
