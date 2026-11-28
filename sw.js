/* Noctiloom Studio – service worker du jeu.
   Réseau d'abord (le joueur a toujours la dernière version), cache en secours hors-ligne.
   Les jeux partagent le même domaine : chaque jeu a donc son propre nom de cache.
   À adapter par jeu : JEU (nom du dépôt). Changer VERSION force le nettoyage de l'ancien cache. */
const JEU = 'aetherium';
const VERSION = 'v1';
const PREFIXE = 'noctiloom-' + JEU + '-';
const CACHE = PREFIXE + VERSION;

// Installation : on active immédiatement la nouvelle version.
self.addEventListener('install', () => self.skipWaiting());

// Activation : on supprime uniquement les anciens caches de CE jeu.
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(
        ks.filter((k) => k.startsWith(PREFIXE) && k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Requêtes : réseau d'abord, copie en cache, et cache en secours si hors-ligne.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
        return r;
      })
      .catch(() => caches.match(e.request).then((m) => m || caches.match('index.html')))
  );
});
