/* Noctiloom Studio – kit PWA. À inclure dans index.html du jeu :
   <script src="noctiloom-pwa.js" defer></script> */
(function () {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }

  var deferred = null;
  var wantsInstall = /[?&]install=1/.test(location.search);

  function makeButton() {
    var b = document.createElement('button');
    b.textContent = 'Installer le jeu';
    b.setAttribute('style',
      'position:fixed;right:16px;bottom:16px;z-index:99999;padding:10px 16px;' +
      'border:0;border-radius:10px;background:#7c6cff;color:#fff;font:600 14px system-ui;' +
      'cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.4)');
    b.onclick = function () {
      if (!deferred) return;
      deferred.prompt();
      deferred.userChoice.then(function () { deferred = null; b.remove(); });
    };
    document.body.appendChild(b);
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    makeButton();
  });
  window.addEventListener('appinstalled', function () {
    var b = document.querySelector('button[style*="99999"]'); if (b) b.remove();
  });

  // iOS Safari n'a pas de prompt : on explique la marche à suivre.
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (wantsInstall && ios && !standalone) {
    alert('Pour installer : touchez le bouton Partager, puis « Sur l’écran d’accueil ».');
  }
})();
