// Visual signatures for publication cards. Each is a small motif that
// illustrates the paper's topic, drawn into the .pub-thumb tile of a
// publication row. Wire up by setting data-sig="<key>" on the .pub-thumb.
// Falls back to "default" for unknown keys.
(function(){
  var SIGS = {
    // Robust federated aggregation: clients send updates to a central server,
    // which aggregates the good ones and rejects a bad (Byzantine) client.
    'fl-aggregation': ''
      + '<svg viewBox="0 0 60 60" width="100%" height="100%" fill="none">'
      // central server (the aggregator)
      +   '<rect x="22" y="24" width="16" height="13" rx="2.5" stroke="currentColor" stroke-width="1.6" fill="none"/>'
      +   '<line x1="22.5" y1="30.5" x2="37.5" y2="30.5" stroke="currentColor" stroke-width="1.1"/>'
      +   '<circle cx="25.4" cy="27.3" r="1" fill="currentColor"/>'
      // good clients
      +   '<g fill="currentColor">'
      +     '<circle cx="11" cy="12" r="3"/>'
      +     '<circle cx="49" cy="12" r="3"/>'
      +     '<circle cx="11" cy="49" r="3"/>'
      +   '</g>'
      // their updates aggregated into the server (arrows pointing in)
      +   '<g stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none">'
      +     '<path d="M14.5 15 L21 22"/><path d="M21 22 L18 22 M21 22 L21 19"/>'
      +     '<path d="M45.5 15 L39 22"/><path d="M39 22 L42 22 M39 22 L39 19"/>'
      +     '<path d="M14.5 46 L21 39"/><path d="M21 39 L18 39 M21 39 L21 42"/>'
      +   '</g>'
      // one client rejected — robust aggregation
      +   '<circle cx="49" cy="49" r="3" fill="currentColor" opacity="0.4"/>'
      +   '<g stroke="currentColor" stroke-width="1.6" stroke-linecap="round">'
      +     '<line x1="46" y1="46" x2="52" y2="52"/>'
      +     '<line x1="52" y1="46" x2="46" y2="52"/>'
      +   '</g>'
      + '</svg>',

    // FedControl: a closed control loop (summing junction, controller, plant,
    // feedback) — control theory driving federated aggregation.
    fedcontrol: ''
      + '<svg viewBox="0 0 60 60" width="100%" height="100%" fill="none">'
      // summing junction (compares against the feedback)
      +   '<circle cx="11" cy="22" r="3.3" stroke="currentColor" stroke-width="1.6" fill="none"/>'
      +   '<g stroke="currentColor" stroke-width="1.1" stroke-linecap="round">'
      +     '<line x1="11" y1="19.4" x2="11" y2="24.6"/>'
      +     '<line x1="8.4" y1="22" x2="13.6" y2="22"/>'
      +   '</g>'
      // controller + plant blocks
      +   '<g stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none">'
      +     '<rect x="19" y="16.5" width="11" height="11" rx="1.6"/>'
      +     '<rect x="35" y="16.5" width="11" height="11" rx="1.6"/>'
      +   '</g>'
      // forward signal flow + the feedback loop back to the junction
      +   '<g stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none">'
      +     '<path d="M14.3 22 L19 22"/><path d="M19 22 L16.8 20.6 M19 22 L16.8 23.4"/>'
      +     '<path d="M30 22 L35 22"/><path d="M35 22 L32.8 20.6 M35 22 L32.8 23.4"/>'
      +     '<path d="M46 22 L52 22 L52 41 L11 41 L11 25.3"/>'
      +     '<path d="M11 25.3 L9 27.5 M11 25.3 L13 27.5"/>'
      +   '</g>'
      +   '<circle cx="52" cy="22" r="1.2" fill="currentColor"/>'
      + '</svg>',

    // Computational heterogeneity: a server surrounded by clients of clearly
    // different sizes — participants with very different compute budgets.
    heterogeneity: ''
      + '<svg viewBox="0 0 60 60" width="100%" height="100%" fill="none">'
      +   '<g stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.65">'
      +     '<line x1="30" y1="30" x2="13" y2="14"/>'
      +     '<line x1="30" y1="30" x2="48" y2="14"/>'
      +     '<line x1="30" y1="30" x2="51" y2="33"/>'
      +     '<line x1="30" y1="30" x2="13" y2="34"/>'
      +     '<line x1="30" y1="30" x2="24" y2="50"/>'
      +     '<line x1="30" y1="30" x2="45" y2="49"/>'
      +   '</g>'
      // server hub
      +   '<rect x="25" y="25" width="10" height="10" rx="2" fill="currentColor"/>'
      // clients of clearly different capacities
      +   '<g fill="currentColor">'
      +     '<circle cx="13" cy="14" r="5"/>'
      +     '<circle cx="48" cy="14" r="2.1"/>'
      +     '<circle cx="51" cy="33" r="3.3"/>'
      +     '<circle cx="13" cy="34" r="1.4"/>'
      +     '<circle cx="24" cy="50" r="4.1"/>'
      +     '<circle cx="45" cy="49" r="2.6"/>'
      +   '</g>'
      + '</svg>',

    // Interpret, Prune & Distill Donut: a large, densely-connected model
    // pruned and distilled into a small, sparse, lightweight network.
    distill: ''
      + '<svg viewBox="0 0 60 60" width="100%" height="100%" fill="none">'
      // teacher — dense network
      +   '<g stroke="currentColor" stroke-width="1.1" stroke-linecap="round" opacity="0.7">'
      +     '<line x1="10" y1="15" x2="22" y2="15"/>'
      +     '<line x1="10" y1="15" x2="22" y2="28"/>'
      +     '<line x1="10" y1="15" x2="22" y2="41"/>'
      +     '<line x1="10" y1="28" x2="22" y2="15"/>'
      +     '<line x1="10" y1="28" x2="22" y2="28"/>'
      +     '<line x1="10" y1="28" x2="22" y2="41"/>'
      +     '<line x1="10" y1="41" x2="22" y2="28"/>'
      +     '<line x1="10" y1="41" x2="22" y2="41"/>'
      +   '</g>'
      +   '<g fill="currentColor">'
      +     '<circle cx="10" cy="15" r="2.3"/><circle cx="10" cy="28" r="2.3"/><circle cx="10" cy="41" r="2.3"/>'
      +     '<circle cx="22" cy="15" r="2.3"/><circle cx="22" cy="28" r="2.3"/><circle cx="22" cy="41" r="2.3"/>'
      +   '</g>'
      // distillation arrow
      +   '<g stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none">'
      +     '<path d="M28 28 L37 28"/>'
      +     '<path d="M37 28 L34.4 26.4 M37 28 L34.4 29.6"/>'
      +   '</g>'
      // student — small, sparse network
      +   '<g stroke="currentColor" stroke-width="1.1" stroke-linecap="round" opacity="0.7">'
      +     '<line x1="43" y1="22" x2="53" y2="22"/>'
      +     '<line x1="43" y1="22" x2="53" y2="34"/>'
      +     '<line x1="43" y1="34" x2="53" y2="34"/>'
      +   '</g>'
      +   '<g fill="currentColor">'
      +     '<circle cx="43" cy="22" r="2.1"/><circle cx="43" cy="34" r="2.1"/>'
      +     '<circle cx="53" cy="22" r="2.1"/><circle cx="53" cy="34" r="2.1"/>'
      +   '</g>'
      + '</svg>',

    // Visualising multimodal interactions: image and text set diagonally, with
    // two angled arrows probing the interaction each way (each carrying a "?").
    multimodal: ''
      + '<svg viewBox="0 0 60 60" width="100%" height="100%" fill="none">'
      // image (vision) — top-left
      +   '<rect x="5" y="6" width="18" height="15" rx="2" stroke="currentColor" stroke-width="1.6" fill="none"/>'
      +   '<circle cx="9.5" cy="10.5" r="1.8" fill="currentColor"/>'
      +   '<polyline points="6,20 10,14 13,17 17,11 22,20" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
      // text (language) — bottom-right
      +   '<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round">'
      +     '<line x1="34" y1="40" x2="54" y2="40"/>'
      +     '<line x1="34" y1="46" x2="50" y2="46"/>'
      +     '<line x1="34" y1="52" x2="54" y2="52"/>'
      +   '</g>'
      // two strongly-curved arrows: image -> text and text -> image
      +   '<g stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none">'
      +     '<path d="M25 14 Q42 14 42 35"/>'
      +     '<path d="M42 35 L39 32 M42 35 L45 32"/>'
      +     '<path d="M31 46 Q14 46 14 23"/>'
      +     '<path d="M14 23 L11 26 M14 23 L17 26"/>'
      +   '</g>'
      // a question mark beside each arrow, clear of the line
      +   '<g fill="currentColor" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="700" font-size="9" text-anchor="middle">'
      +     '<text x="45" y="23">?</text>'
      +     '<text x="11" y="43">?</text>'
      +   '</g>'
      + '</svg>',

    // Default: a document / paper — generic stand-in (the work is on documents).
    default: ''
      + '<svg viewBox="0 0 60 60" width="100%" height="100%" fill="none">'
      +   '<path d="M16 9 L37 9 L44 16 L44 51 L16 51 Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/>'
      +   '<path d="M37 9 L37 16 L44 16" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" fill="none"/>'
      +   '<g stroke="currentColor" stroke-width="1.8" stroke-linecap="round">'
      +     '<line x1="21" y1="23" x2="39" y2="23"/>'
      +     '<line x1="21" y1="29" x2="39" y2="29"/>'
      +     '<line x1="21" y1="35" x2="39" y2="35"/>'
      +     '<line x1="21" y1="41" x2="33" y2="41"/>'
      +   '</g>'
      + '</svg>',
  };

  function inject(){
    var thumbs = document.querySelectorAll('.pub-thumb[data-sig]');
    thumbs.forEach(function(el){
      if (el.children.length > 0) return;
      var key = el.getAttribute('data-sig');
      el.innerHTML = SIGS[key] || SIGS['default'];
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
