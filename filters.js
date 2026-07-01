// Multi-tag filter for blog posts (OR semantics).
//
//  - The filter bar shows at most MAX_FILTERS chips: the active ones first,
//    then the most relevant inactive ones. The rest collapse behind a "… N"
//    chip you can expand (and re-collapse with "less"). Nothing invisible is
//    ever left in the DOM, so the bar never leaves an empty wrapped line.
//  - Inactive chips are ranked by how many of the currently-matching posts
//    also carry that tag (co-occurrence), then by global usage.
//  - Each post row shows at most MAX_POST_TAGS of its own tags, excluding any
//    tag that is currently in the filter (no point repeating what you searched
//    for); a trailing "…" marks that more exist.
(function () {
  var filtersEl = document.getElementById('tag-filters');
  var postsEl = document.getElementById('posts');
  var emptyMsg = document.getElementById('empty-msg');
  if (!filtersEl || !postsEl) return;

  var posts = Array.from(postsEl.querySelectorAll(':scope > li'));
  if (!posts.length) return;

  var MAX_FILTERS = 5;   // chips shown before collapsing into "…"
  var MAX_POST_TAGS = 3; // tags shown per post row

  function tagsOf(li) {
    return (li.getAttribute('data-tags') || '')
      .split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  }

  var counts = {};
  posts.forEach(function (li) {
    tagsOf(li).forEach(function (t) { counts[t] = (counts[t] || 0) + 1; });
  });
  var allTags = Object.keys(counts);

  var active = new Set();
  var expanded = false;

  function matchingPosts() {
    return posts.filter(function (li) {
      var lt = tagsOf(li);
      return active.size === 0 || lt.some(function (t) { return active.has(t); });
    });
  }

  function compatCount(vis, t) {
    var n = 0;
    vis.forEach(function (li) { if (tagsOf(li).indexOf(t) !== -1) n++; });
    return n;
  }

  function orderedInactive(vis) {
    return allTags.filter(function (t) { return !active.has(t); })
      .sort(function (a, b) {
        var ca = compatCount(vis, a), cb = compatCount(vis, b);
        if (cb !== ca) return cb - ca;
        if (counts[b] !== counts[a]) return counts[b] - counts[a];
        return a.localeCompare(b);
      });
  }

  function toggleTag(t) {
    if (active.has(t)) active.delete(t); else active.add(t);
    expanded = false; // recollapse the bar after every pick
    apply();
  }

  function chip(t, n) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'filter-btn' + (active.has(t) ? ' is-on' : '');
    b.dataset.tag = t;
    b.innerHTML = t + ' <span class="filter-n">' + n + '</span>';
    b.addEventListener('click', function () { toggleTag(t); });
    return b;
  }

  function renderFilters() {
    filtersEl.querySelectorAll('.filter-btn, .filter-more, .filter-clear')
      .forEach(function (n) { n.remove(); });

    var vis = matchingPosts();
    var activeArr = Array.from(active).sort(function (a, b) { return counts[b] - counts[a]; });
    var inactive = orderedInactive(vis);
    var room = Math.max(0, MAX_FILTERS - activeArr.length);
    var shownInactive = expanded ? inactive : inactive.slice(0, room);
    var hidden = inactive.length - Math.min(room, inactive.length);

    // the count on each chip is contextual: how many of the currently-matching
    // posts carry that tag (equals the global count when nothing is filtered).
    activeArr.forEach(function (t) { filtersEl.appendChild(chip(t, compatCount(vis, t))); });
    shownInactive.forEach(function (t) { filtersEl.appendChild(chip(t, compatCount(vis, t))); });

    if (hidden > 0) {
      var more = document.createElement('button');
      more.type = 'button';
      more.className = 'filter-more';
      more.textContent = expanded ? 'less' : ('… ' + hidden);
      more.addEventListener('click', function () { expanded = !expanded; renderFilters(); });
      filtersEl.appendChild(more);
    }

    if (active.size) {
      var clr = document.createElement('button');
      clr.type = 'button';
      clr.className = 'filter-clear';
      clr.textContent = 'clear';
      clr.addEventListener('click', function () { active.clear(); expanded = false; apply(); });
      filtersEl.appendChild(clr);
    }
  }

  function renderPostTags(li, lt) {
    var holder = li.querySelector('.post-tags');
    if (!holder) return;
    // keep the tags in their .md (frontmatter) order; only drop the ones that
    // are already implied by the active filter.
    var pool = lt.filter(function (t) { return !active.has(t); });
    var shown = pool.slice(0, MAX_POST_TAGS);
    var more = pool.length - shown.length;
    holder.innerHTML = '';
    shown.forEach(function (t) {
      var s = document.createElement('span');
      s.className = 'post-tag';
      s.dataset.tag = t;
      s.textContent = t;
      s.style.cursor = 'pointer';
      s.addEventListener('click', function () { toggleTag(t); });
      holder.appendChild(s);
    });
    if (more > 0) {
      var m = document.createElement('span');
      m.className = 'post-tag post-tag--more';
      m.textContent = '…';
      m.title = more + ' more';
      holder.appendChild(m);
    }
    holder.style.display = holder.children.length ? '' : 'none';
  }

  function apply() {
    renderFilters();
    var visible = 0;
    posts.forEach(function (li) {
      var lt = tagsOf(li);
      var show = active.size === 0 || lt.some(function (t) { return active.has(t); });
      li.classList.toggle('is-hidden', !show);
      if (show) visible++;
      renderPostTags(li, lt);
    });
    if (emptyMsg) emptyMsg.style.display = visible === 0 ? 'block' : 'none';
  }

  function applyHash() {
    var m = (location.hash || '').match(/^#tag=([\w,-]+)/);
    if (m) {
      active.clear();
      m[1].split(',').filter(Boolean).forEach(function (t) {
        if (counts[t] != null) active.add(t);
      });
    }
  }

  applyHash();
  window.addEventListener('hashchange', function () { applyHash(); expanded = false; apply(); });
  apply();
})();
