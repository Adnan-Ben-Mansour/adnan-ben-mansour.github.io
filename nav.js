/* Theme toggle: persisted light/dark. The sun/moon icon swap is handled
   entirely in CSS via html[data-theme]; <serpentine-bg> re-bakes itself on
   the data-theme change through its own MutationObserver. */
(function () {
  var btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var cur = document.documentElement.getAttribute('data-theme') || 'light';
    var next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
})();
