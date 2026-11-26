# Chantier 01 — lot 4 : performances et cycle de vie des finitions

Constat : le capteur d'orientation était écouté dès qu'une carte holographique était inspectée, même sans activation. La fermeture mobile ou la navigation pouvaient laisser la dernière instance active, et une demande de permission tardive pouvait réactiver un inspecteur fermé.

Correctif : écouter le capteur uniquement après activation explicite ; libérer écouteur, bouton et animation lors de la fermeture/navigation/filtre vide ; ignorer un retour de permission tardif ; ignorer les interactions sur carte masquée et les dimensions nulles. L'animation visible, le geste tactile et le rendu restent identiques.

Test automatisé du cycle de vie, y compris activation/désactivation, annulation du geste et fermeture durant une demande de permission.

Mesures à compléter sur appareils réels : FPS et mémoire de Chrome Android / Safari iOS, consommation du capteur et rendu en haute densité. Les illustrations HD ne sont pas recompressées. Aucun benchmark réel n'est revendiqué par ce correctif.
