// Collapsible cards, article sections, and code cells.
(function () {
  // Cards (home / publications / blog): the .card__head button toggles .is-open.
  function initCards() {
    document.querySelectorAll('[data-collapse]').forEach(function (card) {
      var head = card.querySelector('.card__head');
      if (!head) return;
      head.addEventListener('click', function (e) {
        if (e.target.closest('a')) return; // let action links through
        var open = card.classList.toggle('is-open');
        head.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  }

  // Article sections: each <h2> in .article-body becomes collapsible. Its
  // following content (up to the next <h2>) is wrapped in a .section-body;
  // collapsing hides it and reduces the heading to just its title flanked by
  // two horizontal rules.
  function initArticleSections() {
    document.querySelectorAll('.article-body').forEach(function (body) {
      var heads = Array.from(body.querySelectorAll(':scope > h2'));
      heads.forEach(function (h2) {
        var group = document.createElement('div');
        group.className = 'section-body';
        var el = h2.nextElementSibling;
        while (el && el.tagName !== 'H2') {
          var next = el.nextElementSibling;
          group.appendChild(el);
          el = next;
        }
        h2.after(group);

        h2.classList.add('section-head');
        h2.setAttribute('role', 'button');
        h2.setAttribute('tabindex', '0');
        h2.setAttribute('aria-expanded', 'true');

        function toggle() {
          var collapsed = h2.classList.toggle('is-collapsed');
          h2.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        }
        h2.addEventListener('click', function (e) {
          if (e.target.closest('a')) return;
          toggle();
        });
        h2.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        });
      });

      // "outline" toggle in the post header: collapse every section (to see the
      // plan at a glance) or expand them all back if already collapsed.
      var article = body.closest('article') || body.parentElement;
      var outline = article && article.querySelector('.outline-toggle');
      if (!outline) return;
      if (!heads.length) { outline.style.display = 'none'; return; }

      function setAll(collapsed) {
        heads.forEach(function (h2) {
          h2.classList.toggle('is-collapsed', collapsed);
          h2.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        });
        outline.classList.toggle('all-collapsed', collapsed);
        outline.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        var lbl = collapsed ? 'Expand all sections' : 'Collapse all sections';
        outline.setAttribute('aria-label', lbl);
        outline.setAttribute('title', lbl);
      }
      outline.addEventListener('click', function () {
        var allCollapsed = heads.every(function (h2) { return h2.classList.contains('is-collapsed'); });
        setAll(!allCollapsed);
      });
    });
  }

  // Code cells: click the cell label to toggle the <pre> visibility.
  function initCells() {
    document.querySelectorAll('.cell').forEach(function (cell) {
      var label = cell.querySelector('.cell-label');
      if (!label) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cell-toggle';
      btn.setAttribute('aria-expanded', 'true');
      btn.innerHTML = '<span class="chev" aria-hidden="true">▾</span><span class="cell-toggle-label">collapse</span>';
      label.appendChild(btn);
      label.classList.add('is-toggle');

      function setCollapsed(collapsed) {
        cell.classList.toggle('is-collapsed', collapsed);
        btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        var lbl = btn.querySelector('.cell-toggle-label');
        if (lbl) lbl.textContent = collapsed ? 'expand' : 'collapse';
      }

      label.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;
        setCollapsed(!cell.classList.contains('is-collapsed'));
      });
    });
  }

  function init() { initCards(); initArticleSections(); initCells(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
