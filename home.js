(function () {
  'use strict';
  var root = document.documentElement;
  function isDark() {
    var t = root.getAttribute('data-theme');
    return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  }
  window.addEventListener('keydown', function (e) {
    if (e.key.toLowerCase() === 'd') root.setAttribute('data-theme', isDark() ? 'light' : 'dark');
  });
  var lines = ['pick a way to bully kevin', 'no goal, just kill him', 'kevin has consented to this dw', 'thank you MEI'];
  document.getElementById('tag').textContent = lines[Math.floor(Math.random() * lines.length)];
})();
