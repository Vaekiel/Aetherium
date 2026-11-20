# AETHERIUM — Palette sonore des Archives

**État : 12 créations Stable Audio générées et intégrées.** Les ambiances des
Épreuves et des Boosters et les dix effets courts sont exportés en Ogg Vorbis.
Le moteur conserve la synthèse Web Audio locale comme solution de secours.
Le forfait gratuit couvrait 12 prises : les quatre autres ambiances de la
palette (Codex, Atelier, Expéditions, Chroniques) restent à générer.

## Direction artistique

Fantasy nocturne, ancienne, mystérieuse mais douce. Verre, cristal,
parchemin, ruines, magie légère. Sonorité feutrée et chaleureuse.
**Sans voix, sans percussion insistante, sans mélodie envahissante.**
Les effets fréquents sont subtils. Pas de références à un artiste,
une chanson ou une bande originale existante.

## Ambiances IA (Stable Audio)

Créer des boucles instrumentales sans couture, de 30 à 60 secondes,
no vocals, no drums, restrained dynamics, dark fantasy.
Normaliser et adoucir les transitions. Volume ambiant plus bas
que celui des effets.

| Nom du fichier | Écran | Prompt en anglais |
| --- | --- | --- |
| ambient-epreuves.ogg | Épreuves | Seamless game ambience in moonlit magical ruins, soft crystal drones, distant stone wind, faint resonant bells, intimate mysterious dark fantasy, gentle evolving atmosphere, no voice, no percussion, no melody |
| ambient-boosters.ogg | Boosters | Seamless subtle fantasy card unsealing room ambience, warm arcane hum, shimmer of crystalline glass and whispered paper texture, quiet anticipation, delicate low drone, no speech, no drums |
| ambient-codex.ogg | Codex | Seamless peaceful enchanted library ambience, old parchment and still air, soft warm glass harmonics, distant gentle wind through ancient shelves, contemplative midnight fantasy, no speech, no percussion |
| ambient-atelier.ogg | Atelier | Seamless cozy fantasy magical forge ambience, soft resonant metals, glowing crystals, low humming enchantments and gently crackling energy, calm workshop atmosphere, no hammering, no voice, no rhythm |
| ambient-expeditions.ogg | Expéditions | Seamless restrained fantasy exploration ambience, faint cavern draft, distant resonances of ancient glass and stone, muted mystical drone, slow quiet suspense, no vocals, no footsteps |
| ambient-chroniques.ogg | Chroniques | Seamless quiet fantasy archive hall ambience, warm sustained harp-like resonance, delicate crystalline overtones, ancient remembrance and quiet achievement, no rhythmic melody, no voice |

## Effets courts IA

| Nom du fichier | Déclencheur | Durée visée | Prompt en anglais |
| --- | --- | --- | --- |
| ui-tap.ogg | Action discrète | 0,1–0,2 s | Tiny soft magical stone interface tap, short dry glass tick, warm and elegant, isolated sound effect |
| ui-select.ogg | Épreuve, difficulté, filtre, booster | 0,2–0,35 s | Short elegant arcane selection chime, two faint glass notes, silky attack, premium fantasy game UI |
| ui-page.ogg | Changement d'écran | 0,2–0,4 s | Soft single resonant archival bell as a fantasy menu page opens, quiet and precise |
| booster-unseal.ogg | Décellement | 0,6–1,0 s | Magical paper and foil card pack unsealing, gentle rising shimmer, soft crystalline burst, short tactile fantasy sound effect |
| reveal-normal.ogg | Carte classique | 0,3–0,5 s | Light transparent glass chime for revealing a collectible fantasy card, understated and short |
| reveal-rare.ogg | Carte rare | 0,5–0,7 s | Delicate crystalline double chime for a rare fantasy collectible discovery, tasteful shine, no fanfare |
| reveal-epic.ogg | Carte épique | 0,7–1,0 s | Elegant magical high-rarity card reveal, three layered crystal harmonics, restrained deep shimmer |
| reveal-legendary.ogg | Carte légendaire | 0,9–1,3 s | Memorable but soft legendary fantasy card reveal, ascending crystal tones over warm low resonance, graceful and not loud |
| reward.ogg | Couronnes gagnées | 0,5–0,9 s | Gentle victorious three-note glass reward chime for ancient fantasy puzzle completion, warm and understated |
| forge.ogg | Fabrication | 0,5–1,0 s | Tiny arcane forge sound, low enchanted metal resonance followed by a crystalline sparkle, gentle mysterious crafting |

## Intégration des fichiers IA

Les fichiers Ogg Vorbis légers sont placés dans assets/audio. Les effets courts
sont coupés à leur durée cible avec une atténuation finale douce. Les boucles
des Épreuves et des Boosters durent chacune 60 secondes.

Le moteur de src/audio.js assure :
- activation et coupure globale (muet au lancement, sans lecture automatique),
- choix indépendants ambiance / effets et volume,
- mémorisation locale des préférences audio dans aetherium-audio-v1,
- une ambiance IA dédiée aux Épreuves et aux Boosters; les autres pages
  conservent leurs nappes synthétiques discrètes,
- bruitages de navigation, sélection, décèlement, révélation et récompense,
- coupure automatique de l'ambiance dans un onglet masqué,
- chargement différé des fichiers, muets au lancement.

Les prompts, empreintes des WAV sources, réglages d'export et informations de
licence sont consignés dans docs/AUDIO-GENERATION.json.

## Licence et documentation

Stable Audio indique que les créations de son offre gratuite peuvent être
intégrées à des jeux, sous réserve des conditions de licence applicables.

Sources officielles :
- https://help.suno.com/en/articles/9601601
- https://kb.stability.ai/knowledge-base/stable-audio-commerical-and-usage-licensing
- https://stableaudio.com/

Pour cette production, Stable Audio 3 a été utilisé avec le forfait gratuit,
sans achat ni abonnement. Les conditions de licence applicables sont liées
dans le relevé de génération; elles doivent être revérifiées si une nouvelle
production ou une redistribution différente est envisagée.
