/* =====================================================================
   <serpentine-bg> — baked, procedural "serpentins" field.

   The viewport grid is partitioned into short self-avoiding snakes
   (length 2–7 cells). Each snake's centre-line is jittered and smoothed
   with Chaikin subdivision, then drawn as a soft, embossed rounded tube.
   The result reads like an organic "brain-coral" / worm material —
   curvy and hand-laid rather than rigid and grid-bound.

   Baked once (re-baked on resize / theme change), computed cheaply, so
   it is fine on mobile. A few slowly-breathing colored glow blobs sit on
   top in a soft blend to tint the glass panels.

   Self-contained, no dependencies — safe to host statically.
   Usage:  <serpentine-bg></serpentine-bg>   (registers itself)
   Reads the active theme from document.documentElement[data-theme].
   ===================================================================== */
(function () {
  if (customElements.get('serpentine-bg')) return;

  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var THEMES = {
    light: {
      field: ['#9fb1cd', '#8ca1c1', '#8399bb'],
      tintA: [99, 16, 0.99],
      tintB: [80, 30, 0.93],
      tubeHi:   'rgba(255,255,255,1)',
      tubeLo:   'rgba(60,90,128,0.52)',
      dotFill:  'rgba(140,162,198,0.88)',
      glowAlpha: 1.0, glowBlend: 'soft-light'
    },
    dark: {
      field: ['#0a1018', '#070c13', '#0c141d'],
      tintA: [88, 22, 0.19],
      tintB: [52, 26, 0.07],
      tubeHi:   'rgba(198,221,247,0.17)',
      tubeLo:   'rgba(0,0,0,0.45)',
      dotFill:  'rgba(176,200,232,0.30)',
      glowAlpha: 0.14, glowBlend: 'screen'
    }
  };

  var GLOWS = [
    { hue: 'oklch(0.80 0.11 295)', x: 0.04, y: 0.10, r: 30, dur: 17 },
    { hue: 'oklch(0.84 0.11 55)',  x: 0.93, y: 0.16, r: 26, dur: 21 },
    { hue: 'oklch(0.82 0.11 235)', x: 0.50, y: 1.02, r: 34, dur: 19 },
    { hue: 'oklch(0.81 0.10 320)', x: 0.98, y: 0.72, r: 24, dur: 23 }
  ];

  // ---- snake partition (greedy, self-avoiding, turn-biased) ------------
  // Heavily prefers DIRECTION CHANGES so the snakes read as curvy L/S/Z/N
  // shapes rather than long straight runs. Always terminates / covers all.
  function partition(cols, rows, minL, maxL, rng) {
    var occ = new Int8Array(cols * rows);   // 0 = free
    var snakes = [];
    var idx = function (x, y) { return y * cols + x; };
    var free = function (x, y) {
      return x >= 0 && y >= 0 && x < cols && y < rows && occ[idx(x, y)] === 0;
    };
    var D = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (var sy = 0; sy < rows; sy++) {
      for (var sx = 0; sx < cols; sx++) {
        if (occ[idx(sx, sy)]) continue;
        var target = minL + ((rng() * (maxL - minL + 1)) | 0);
        var path = [[sx, sy]];
        occ[idx(sx, sy)] = 1;
        var cx = sx, cy = sy, pdx = 0, pdy = 0, have = false, bends = 0;
        while (path.length < target) {
          var opts = [], wts = [], total = 0;
          for (var t = 0; t < 4; t++) {
            var dx = D[t][0], dy = D[t][1], nx = cx + dx, ny = cy + dy;
            if (!free(nx, ny)) continue;
            var straight = have && dx === pdx && dy === pdy;
            // count onward exits (Warnsdorff nudge to avoid trapping)
            var ex = 0;
            for (var u = 0; u < 4; u++) if (free(nx + D[u][0], ny + D[u][1])) ex++;
            // strongly favour turning; mildly favour cells that keep options
            var w = (straight ? 0.14 : 1.0) * (0.5 + 0.5 * ex);
            opts.push([nx, ny, dx, dy, straight]);
            wts.push(w); total += w;
          }
          if (!opts.length) break;
          var r = rng() * total, pick = 0;
          for (var k = 0; k < wts.length; k++) { r -= wts[k]; if (r <= 0) { pick = k; break; } }
          var p = opts[pick];
          if (have && !(p[2] === pdx && p[3] === pdy)) bends++;
          cx = p[0]; cy = p[1]; pdx = p[2]; pdy = p[3]; have = true;
          occ[idx(cx, cy)] = 1;
          path.push([cx, cy]);
          // once we already have a couple of bends, allow an early stop so
          // shapes stay short & legible rather than meandering
          if (bends >= 2 && path.length >= 4 && rng() < 0.4) break;
        }
        snakes.push(path);
      }
    }
    return snakes;
  }

  // ---- geometry: centres, end-inset, jitter, Chaikin smoothing ---------
  function centres(path, cell, ox, oy) {
    return path.map(function (c) {
      return [ox + (c[0] + 0.5) * cell, oy + (c[1] + 0.5) * cell];
    });
  }
  function insetEnds(pts, amt) {
    if (pts.length < 2 || amt <= 0) return pts;
    var p = pts.map(function (a) { return a.slice(); }), n = p.length;
    var dx = p[1][0] - p[0][0], dy = p[1][1] - p[0][1], d = Math.hypot(dx, dy) || 1;
    p[0][0] += (dx / d) * amt; p[0][1] += (dy / d) * amt;
    dx = p[n - 2][0] - p[n - 1][0]; dy = p[n - 2][1] - p[n - 1][1]; d = Math.hypot(dx, dy) || 1;
    p[n - 1][0] += (dx / d) * amt; p[n - 1][1] += (dy / d) * amt;
    return p;
  }
  function jitter(pts, amt, rng) {
    if (amt <= 0) return pts;
    return pts.map(function (p, i) {
      return (i === 0 || i === pts.length - 1)
        ? p
        : [p[0] + (rng() * 2 - 1) * amt, p[1] + (rng() * 2 - 1) * amt];
    });
  }
  function chaikin(pts, iters) {
    var p = pts;
    for (var k = 0; k < iters; k++) {
      if (p.length < 3) break;
      var out = [p[0]];
      for (var i = 0; i < p.length - 1; i++) {
        var a = p[i], b = p[i + 1];
        out.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
        out.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
      }
      out.push(p[p.length - 1]);
      p = out;
    }
    return p;
  }
  // Insert a perpendicular-displaced midpoint on every segment so each
  // worm gets a unique, randomly-zigzagged contour (kept subtle, then
  // lightly Chaikin-smoothed so it reads as a hand-laid wobble).
  function zigzag(pts, amp, rng) {
    if (pts.length < 2 || amp <= 0) return pts;
    var out = [pts[0]];
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1];
      var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      var nx = -dy / len, ny = dx / len;
      var d = (rng() * 2 - 1) * amp;
      out.push([mx + nx * d, my + ny * d]);
      out.push(b);
    }
    return out;
  }

  var STYLE = '' +
    ':host{position:fixed;inset:0;display:block;z-index:0;pointer-events:none;overflow:hidden;contain:strict;}' +
    '.field{position:absolute;inset:0;}' +
    'canvas{position:absolute;inset:0;width:100%;height:100%;display:block;}' +
    '.glow-layer{position:absolute;inset:0;}' +
    '.glow{position:absolute;border-radius:50%;filter:blur(64px);will-change:transform,opacity;}' +
    '@media (prefers-reduced-motion: reduce){.glow{animation:none !important;}}' +
    '@keyframes sbreathe{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:var(--a0);}' +
      '50%{transform:translate(-50%,-50%) scale(1.16);opacity:var(--a1);}}';

  class SerpentineBg extends HTMLElement {
    connectedCallback() {
      var root = this.attachShadow({ mode: 'open' });
      var st = document.createElement('style'); st.textContent = STYLE; root.appendChild(st);
      this._field = document.createElement('div'); this._field.className = 'field'; root.appendChild(this._field);
      this._canvas = document.createElement('canvas'); root.appendChild(this._canvas);
      this._glowLayer = document.createElement('div'); this._glowLayer.className = 'glow-layer'; root.appendChild(this._glowLayer);
      this._buildGlows();
      this._bake = this._bake.bind(this); this._onResize = this._onResize.bind(this);
      this._bake();
      window.addEventListener('resize', this._onResize, { passive: true });
      this._mo = new MutationObserver(this._bake);
      this._mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }
    disconnectedCallback() {
      window.removeEventListener('resize', this._onResize);
      if (this._mo) this._mo.disconnect();
      clearTimeout(this._rt);
    }
    _theme() { var t = document.documentElement.getAttribute('data-theme'); return THEMES[t] ? t : 'light'; }

    _buildGlows() {
      var frag = document.createDocumentFragment();
      this._glowEls = GLOWS.map(function (g) {
        var el = document.createElement('div'); el.className = 'glow';
        el.style.animation = 'sbreathe ' + g.dur + 's ease-in-out infinite';
        el.style.animationDelay = (-g.dur * 0.37 * Math.random()) + 's';
        frag.appendChild(el); return el;
      });
      this._glowLayer.appendChild(frag);
    }
    _layoutGlows() {
      var t = THEMES[this._theme()], W = window.innerWidth, H = window.innerHeight, base = Math.max(W, H);
      this._glowLayer.style.mixBlendMode = t.glowBlend;
      GLOWS.forEach(function (g, i) {
        var el = this._glowEls[i], d = (g.r / 100) * base * 2;
        el.style.width = d + 'px'; el.style.height = d + 'px';
        el.style.left = (g.x * 100) + '%'; el.style.top = (g.y * 100) + '%';
        el.style.background = 'radial-gradient(circle, ' + g.hue + ' 0%, ' + g.hue.replace(')', ' / 0)') + ' 70%)';
        el.style.setProperty('--a0', (t.glowAlpha * 0.62).toFixed(3));
        el.style.setProperty('--a1', t.glowAlpha.toFixed(3));
      }, this);
    }
    _onResize() { clearTimeout(this._rt); this._rt = setTimeout(this._bake, 200); }

    _bake() {
      var theme = this._theme(), t = THEMES[theme];
      this._field.style.background =
        'radial-gradient(120% 90% at 12% -8%, ' + t.field[0] + ' 0%, transparent 55%),' +
        'radial-gradient(110% 90% at 96% 6%, ' + t.field[2] + ' 0%, transparent 52%),' +
        'radial-gradient(120% 100% at 50% 108%, ' + t.field[0] + ' 0%, transparent 55%),' + t.field[1];
      this._layoutGlows();

      var W = window.innerWidth, H = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
      var cell = W < 560 ? 9 : 11, over = 3;
      var cols = Math.ceil(W / cell) + over * 2, rows = Math.ceil(H / cell) + over * 2;
      var ox = -over * cell, oy = -over * cell;
      var rng = mulberry32(0x51ed7a3);

      var snakes = partition(cols, rows, 3, 6, rng);
      var capAmt = 0.12 * cell;

      var tubes = new Path2D();
      var polys = [];
      var dots = [];
      for (var s = 0; s < snakes.length; s++) {
        var path = snakes[s];
        if (path.length < 2) {
          dots.push([ox + (path[0][0] + 0.5) * cell, oy + (path[0][1] + 0.5) * cell]);
          continue;
        }
        var pts = centres(path, cell, ox, oy);
        pts = insetEnds(pts, capAmt);
        pts = zigzag(pts, 0.20 * cell, rng);
        pts = jitter(pts, 0.05 * cell, rng);
        pts = chaikin(pts, 2);
        polys.push(pts);
        tubes.moveTo(pts[0][0], pts[0][1]);
        for (var q = 1; q < pts.length; q++) tubes.lineTo(pts[q][0], pts[q][1]);
      }

      var cv = this._canvas;
      cv.width = Math.ceil(W * dpr); cv.height = Math.ceil(H * dpr);
      var ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';

      var tubeW = cell * 0.70, off = Math.max(0.5, cell * 0.08);
      function pass(dx, dy, color, w) {
        ctx.save(); ctx.translate(dx, dy);
        ctx.strokeStyle = color; ctx.lineWidth = w; ctx.stroke(tubes); ctx.restore();
      }
      // embossed serpentine tubes: shadow -> highlight (both batched)
      pass(off, off * 1.2, t.tubeLo, tubeW);
      pass(-off * 0.7, -off * 0.8, t.tubeHi, tubeW);

      // raised base, drawn per-worm with a faint head->tail gradient in
      // lightness; the gradient direction is randomised per worm so some
      // brighten along their length and others darken.
      var baseW = Math.max(1, tubeW - off * 1.6);
      ctx.lineWidth = baseW;
      for (var pi = 0; pi < polys.length; pi++) {
        var pp = polys[pi], a = pp[0], b = pp[pp.length - 1];
        var p0 = a, p1 = b;
        if (rng() < 0.5) { p0 = b; p1 = a; }
        // hue: Gaussian (Box-Muller) centred on blue #376797 (~210deg),
        // so worms cluster around the brand blue with a few straying off
        var u1 = rng(); if (u1 < 1e-6) u1 = 1e-6;
        var gz = Math.sqrt(-2 * Math.log(u1)) * Math.cos(6.2831853 * rng());
        var h = 210 + gz * 3; if (h < 201) h = 201; if (h > 219) h = 219; h = h | 0;
        var ca = 'hsla(' + h + ',' + t.tintA[1] + '%,' + t.tintA[0] + '%,' + t.tintA[2] + ')';
        var cb = 'hsla(' + h + ',' + t.tintB[1] + '%,' + t.tintB[0] + '%,' + t.tintB[2] + ')';
        var grad = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
        grad.addColorStop(0, ca); grad.addColorStop(1, cb);
        ctx.strokeStyle = grad;
        ctx.beginPath(); ctx.moveTo(pp[0][0], pp[0][1]);
        for (var pq = 1; pq < pp.length; pq++) ctx.lineTo(pp[pq][0], pp[pq][1]);
        ctx.stroke();
      }

      // isolated cells: small embossed dots, kept a touch darker than the
      // tubes so single-point worms read as little recessed nubs
      if (dots.length) {
        var rad = tubeW * 0.5;
        for (var di = 0; di < dots.length; di++) {
          var dx0 = dots[di][0], dy0 = dots[di][1];
          ctx.beginPath(); ctx.fillStyle = t.tubeLo;
          ctx.arc(dx0 + off, dy0 + off * 1.2, rad, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.fillStyle = t.dotFill;
          ctx.arc(dx0, dy0, rad, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
  }

  customElements.define('serpentine-bg', SerpentineBg);
})();
