/* PlaylistEval project page. Plain script (no modules) so the page also works from file://. */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Table 1 of the paper: pairwise accuracy (%) with retrieved / uniform frames.
  // d = per-domain [retrieved, uniform] in the order of DOMAINS; ret/uni/delta = overall.
  // delta is copied from the paper (computed there from unrounded accuracies).
  // ---------------------------------------------------------------------------
  var DOMAINS = ['Education', 'Drama', 'Life', 'Art', 'History', 'Documentary', 'Podcast'];

  // name + qual are rendered as two unbreakable phrases, so a narrow label wraps between them
  // rather than at a hyphen ("fine-" / "tuned").
  var GROUPS = [
    { id: 'api', name: 'Hosted API models', qual: '(general-purpose)', short: 'Hosted API' },
    { id: 'open', name: 'Open-weight models', qual: '(general-purpose)', short: 'Open-weight' },
    { id: 'tuned', name: 'Open-weight models', qual: '(fine-tuned as judges)', short: 'Fine-tuned judge' }
  ];
  GROUPS.forEach(function (g) { g.label = g.name + ' ' + g.qual; });

  var MODS = {
    VA: { icons: ['video', 'audio'], label: 'video frames and audio' },
    VT: { icons: ['video', 'text'], label: 'video frames and transcript' }
  };

  var JUDGES = [
    { name: 'Gemini-3.7-Flash', logo: 'gemini', group: 'api', input: 'VA', ret: 75.4, uni: 71.0, delta: 4.4,
      d: [[68, 61], [72, 69], [76, 66], [77, 74], [78, 74], [79, 74], [79, 78]] },
    { name: 'Gemini-3.1-Pro', logo: 'gemini', group: 'api', input: 'VA', ret: 70.2, uni: 68.1, delta: 2.1,
      d: [[67, 64], [63, 60], [73, 70], [71, 70], [69, 68], [73, 73], [74, 71]] },
    { name: 'Gemini-3.5-Flash-Lite', logo: 'gemini', group: 'api', input: 'VA', ret: 59.5, uni: 54.9, delta: 4.6,
      d: [[49, 51], [56, 52], [59, 54], [61, 50], [63, 59], [58, 57], [71, 61]] },
    { name: 'Qwen-3.8-Max', logo: 'qwen', group: 'api', input: 'VT', ret: 73.9, uni: 69.7, delta: 4.2,
      d: [[76, 59], [64, 68], [82, 74], [73, 78], [76, 71], [72, 68], [74, 70]] },
    { name: 'Qwen-3.7-Flash', logo: 'qwen', group: 'api', input: 'VT', ret: 67.5, uni: 61.7, delta: 5.7,
      d: [[64, 61], [62, 62], [73, 72], [71, 61], [65, 63], [68, 61], [69, 51]] },
    { name: 'GPT-5.6-Terra', logo: 'openai', group: 'api', input: 'VT', ret: 72.5, uni: 69.7, delta: 2.9,
      d: [[66, 64], [68, 66], [81, 70], [71, 77], [69, 71], [77, 73], [77, 67]] },
    { name: 'Kimi-K2.6', logo: 'kimi', group: 'api', input: 'VT', ret: 71.4, uni: 65.7, delta: 5.7,
      d: [[71, 60], [68, 61], [77, 64], [70, 67], [73, 70], [67, 69], [75, 69]] },

    { name: 'Gemma-4-26B-A4B', logo: 'gemma', group: 'open', input: 'VT', ret: 59.7, uni: 49.2, delta: 10.5,
      d: [[51, 40], [58, 46], [60, 48], [59, 51], [63, 51], [61, 52], [66, 57]] },
    { name: 'Gemma-4-E2B', logo: 'gemma', group: 'open', input: 'VT', ret: 46.0, uni: 44.1, delta: 1.9,
      d: [[43, 47], [50, 42], [56, 50], [44, 42], [42, 46], [39, 41], [48, 41]] },
    { name: 'Gemma-4-E4B', logo: 'gemma', group: 'open', input: 'VT', ret: 44.3, uni: 43.8, delta: 0.5,
      d: [[43, 43], [42, 47], [47, 52], [38, 40], [51, 41], [41, 40], [48, 43]] },
    { name: 'Qwen-3.5-9B', logo: 'qwen', group: 'open', input: 'VT', ret: 56.7, uni: 53.3, delta: 3.3,
      d: [[64, 51], [53, 56], [59, 49], [46, 53], [63, 52], [58, 51], [53, 61]] },
    { name: 'Qwen-3.5-4B', logo: 'qwen', group: 'open', input: 'VT', ret: 56.2, uni: 52.4, delta: 3.8,
      d: [[51, 53], [57, 58], [61, 56], [64, 57], [58, 50], [57, 49], [46, 44]] },
    { name: 'Qwen-3.5-2B', logo: 'qwen', group: 'open', input: 'VT', ret: 51.6, uni: 46.5, delta: 5.1,
      d: [[49, 42], [47, 51], [53, 51], [51, 39], [50, 47], [56, 47], [56, 49]] },
    { name: 'Qwen3-Omni-30B-A3B', logo: 'qwen', group: 'open', input: 'VA', ret: 48.9, uni: 47.8, delta: 1.1,
      d: [[43, 39], [50, 49], [54, 49], [51, 51], [50, 49], [49, 51], [44, 47]] },

    { name: 'InternLM-XComposer-2.5-Reward', logo: 'internlm', group: 'tuned', input: 'VT', ret: 52.7, uni: 54.3, delta: -1.6,
      d: [[58, 43], [54, 59], [48, 50], [54, 57], [47, 58], [51, 47], [57, 67]] },
    { name: 'VideoJudge-3B', logo: 'cmu', group: 'tuned', input: 'VT', ret: 48.3, uni: 48.3, delta: 0.0,
      d: [[41, 44], [42, 47], [42, 40], [50, 43], [51, 49], [53, 54], [59, 62]] },
    { name: 'VideoJudge-7B', logo: 'cmu', group: 'tuned', input: 'VT', ret: 47.8, uni: 49.0, delta: -1.3,
      d: [[49, 51], [49, 48], [34, 36], [48, 50], [49, 50], [48, 52], [58, 57]] }
  ];
  JUDGES.forEach(function (j, i) { j.order = i; });

  var HUMAN = 93.0;
  var CHANCE = 50;
  var AXIS_MIN = 40;
  var AXIS_MAX = 95;
  var TICKS = [40, 50, 60, 70, 80, 90];
  var BEST_RET = Math.max.apply(null, JUDGES.map(function (j) { return j.ret; }));

  var state = { view: 'board', sort: 'ret', evidence: 'ret', grouped: true };

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  var SVG_NS = 'http://www.w3.org/2000/svg';

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function icon(name) {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    var use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', '#i-' + name);
    svg.appendChild(use);
    return svg;
  }

  function fillGroupLabel(node, g) {
    node.appendChild(el('span', 'nowrap', g.name));
    node.appendChild(document.createTextNode(' '));
    node.appendChild(el('span', 'nowrap', g.qual));
    return node;
  }

  function pct(v) { return ((v - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * 100; }
  function fmt1(v) { return v.toFixed(1); }
  // Signed like the paper, which prints a zero gain as "+0.0".
  function fmtDelta(v) { return (v < 0 ? '−' : '+') + Math.abs(v).toFixed(1); }
  function deltaClass(v) { return v > 0 ? 'pos' : v < 0 ? 'neg' : 'zero'; }
  function groupOf(id) { return GROUPS.filter(function (g) { return g.id === id; })[0]; }

  function sorted(list) {
    var key = state.sort;
    return list.slice().sort(function (a, b) {
      return (b[key] - a[key]) || (b.ret - a.ret) || (a.order - b.order);
    });
  }

  // Groups in fixed order (each sorted), or one flat ranking.
  function sections() {
    if (!state.grouped) return [{ group: null, rows: sorted(JUDGES) }];
    return GROUPS.map(function (g) {
      return { group: g, rows: sorted(JUDGES.filter(function (j) { return j.group === g.id; })) };
    });
  }

  // withNote: show the group under the name (flat view). Otherwise the group is only spoken to screen
  // readers, since the visible group heading row is decorative.
  function judgeCell(j, withNote) {
    var wrap = el('div', 'judge');
    var img = el('img');
    img.src = 'assets/img/logos/' + j.logo + '.png';
    img.alt = '';
    img.width = 22;
    img.height = 22;
    img.loading = 'lazy';
    wrap.appendChild(img);
    var name = el('span', 'judge-name', j.name);
    if (j.ret === BEST_RET) {
      name.appendChild(document.createTextNode(' '));
      name.appendChild(el('span', 'best-badge', 'Best'));
    }
    if (withNote) name.appendChild(el('span', 'judge-note', groupOf(j.group).short));
    else name.appendChild(el('span', 'visually-hidden', ', ' + groupOf(j.group).short));
    wrap.appendChild(name);
    return wrap;
  }

  // ---------------------------------------------------------------------------
  // Leaderboard
  // ---------------------------------------------------------------------------
  function renderAxis() {
    var axis = document.getElementById('axis');
    if (!axis) return;
    axis.textContent = '';
    TICKS.forEach(function (t, i) {
      var s = el('span', 'tick', String(t));
      s.style.left = pct(t) + '%';
      if (i === 0) s.style.transform = 'none';
      axis.appendChild(s);
    });
    var h = el('span', 'ref-label human', 'Human ' + fmt1(HUMAN));
    h.style.left = pct(HUMAN) + '%';
    axis.appendChild(h);
    // No stub for chance: its line sits exactly on the "50" tick and would strike through it.
    var stub = el('span', 'ref-stub');
    stub.style.left = pct(HUMAN) + '%';
    axis.appendChild(stub);
    var c = el('span', 'ref-label chance', 'Chance');
    c.style.left = pct(CHANCE) + '%';
    axis.appendChild(c);
  }

  function trackCell(j) {
    var cell = el('div', 'bc bc-track');
    cell.setAttribute('role', 'cell');
    cell.appendChild(el('span', 'visually-hidden', 'Uniform ' + fmt1(j.uni) + ' to retrieved ' + fmt1(j.ret)));

    var track = el('div', 'track');
    track.setAttribute('aria-hidden', 'true');
    TICKS.forEach(function (t) {
      var g = el('span', 'grid');
      g.style.left = pct(t) + '%';
      track.appendChild(g);
    });
    [['chance', CHANCE], ['human', HUMAN]].forEach(function (r) {
      var line = el('span', 'ref ' + r[0]);
      line.style.left = pct(r[1]) + '%';
      track.appendChild(line);
    });

    var lo = Math.min(j.ret, j.uni);
    var hi = Math.max(j.ret, j.uni);
    var bar = el('span', 'bar' + (j.ret < j.uni ? ' neg' : ''));
    bar.style.left = pct(lo) + '%';
    bar.style.width = (pct(hi) - pct(lo)) + '%';
    track.appendChild(bar);

    var u = el('span', 'dot uni');
    u.style.left = pct(j.uni) + '%';
    track.appendChild(u);
    var r = el('span', 'dot ret');
    r.style.left = pct(j.ret) + '%';
    track.appendChild(r);

    cell.appendChild(track);
    return cell;
  }

  function numCell(text, cls) {
    var cell = el('div', 'bc bc-num');
    cell.setAttribute('role', 'cell');
    cell.appendChild(el('span', 'val ' + cls, text));
    return cell;
  }

  function boardRow(j, withNote) {
    var row = el('div', 'brow is-sort-' + state.sort);
    row.setAttribute('role', 'row');
    row.dataset.order = j.order;

    var name = el('div', 'bc bc-name');
    name.setAttribute('role', 'rowheader');
    name.appendChild(judgeCell(j, withNote));
    row.appendChild(name);

    var input = el('div', 'bc bc-input');
    input.setAttribute('role', 'cell');
    var mods = el('span', 'mods');
    mods.setAttribute('role', 'img');
    mods.setAttribute('aria-label', MODS[j.input].label);
    mods.title = MODS[j.input].label;
    MODS[j.input].icons.forEach(function (m) { mods.appendChild(icon(m)); });
    input.appendChild(mods);
    row.appendChild(input);

    row.appendChild(trackCell(j));
    row.appendChild(numCell(fmt1(j.ret), 'ret'));
    row.appendChild(numCell(fmt1(j.uni), 'uni'));
    row.appendChild(numCell(fmtDelta(j.delta), 'delta ' + deltaClass(j.delta)));
    return row;
  }

  function renderBoard() {
    var body = document.getElementById('board-body');
    if (!body) return;
    body.textContent = '';
    sections().forEach(function (s) {
      // Plain wrapper (no role): ARIA doesn't allow a rowgroup inside a rowgroup. Screen readers get the
      // group from the hidden suffix on each row's name instead of this decorative heading.
      var holder = body;
      if (s.group) {
        holder = el('div', 'board-group');
        var label = fillGroupLabel(el('div', 'group-row'), s.group);
        label.setAttribute('aria-hidden', 'true');
        holder.appendChild(label);
        body.appendChild(holder);
      }
      s.rows.forEach(function (j) { holder.appendChild(boardRow(j, !s.group)); });
    });

    ['ret', 'uni', 'delta'].forEach(function (k) {
      var h = document.getElementById('h-' + k);
      if (!h) return;
      var on = state.sort === k;
      h.classList.toggle('is-sorted', on);
      // Grouped rows are sorted within each group only, which is not a plain descending order.
      h.setAttribute('aria-sort', on ? (state.grouped ? 'other' : 'descending') : 'none');
    });
  }

  // Hover readout. Values are always visible in the row, so this only enhances.
  function wireTooltip() {
    var panel = document.getElementById('panel-board');
    var tip = document.getElementById('tooltip');
    var body = document.getElementById('board-body');
    if (!panel || !tip || !body) return;

    function hide() { tip.hidden = true; }

    body.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var row = e.target.closest ? e.target.closest('.brow') : null;
      if (!row) { hide(); return; }
      var j = JUDGES[Number(row.dataset.order)];
      if (!j) { hide(); return; }

      tip.textContent = '';
      tip.appendChild(el('p', 'tt-title', j.name));
      [['ret', fmt1(j.ret) + '%', 'Retrieved'], ['uni', fmt1(j.uni) + '%', 'Uniform'], ['gain', fmtDelta(j.delta), 'Gain (pts)']]
        .forEach(function (r) {
          var line = el('div', 'tt-row');
          line.appendChild(el('span', 'tt-key ' + r[0]));
          line.appendChild(el('b', null, r[1]));
          line.appendChild(el('span', null, r[2]));
          tip.appendChild(line);
        });
      tip.hidden = false;

      var box = panel.getBoundingClientRect();
      var x = e.clientX - box.left + 16;
      var y = e.clientY - box.top + 16;
      var w = tip.offsetWidth;
      var h = tip.offsetHeight;
      if (x + w > box.width - 8) x = e.clientX - box.left - w - 16;
      if (e.clientY + 16 + h > window.innerHeight - 8) y = e.clientY - box.top - h - 12;
      tip.style.left = Math.max(8, x) + 'px';
      tip.style.top = y + 'px';
    });
    body.addEventListener('pointerleave', hide);
  }

  // ---------------------------------------------------------------------------
  // Per-domain heatmap
  // ---------------------------------------------------------------------------
  var BIN_EDGES = [45, 50, 55, 60, 65, 70, 75];
  var BIN_LABELS = ['<45', '45', '50', '55', '60', '65', '70', '≥75'];

  function bin(v) {
    for (var i = 0; i < BIN_EDGES.length; i++) if (v < BIN_EDGES[i]) return i;
    return BIN_EDGES.length;
  }

  function renderHeatLegend() {
    var scale = document.getElementById('heat-scale');
    if (!scale) return;
    scale.textContent = '';
    BIN_LABELS.forEach(function (label, i) { scale.appendChild(el('span', 'sw h' + i, label)); });
    var which = state.evidence === 'ret' ? 'Retrieved' : 'Uniform';
    var title = document.getElementById('heat-legend-title');
    if (title) title.textContent = which + ' accuracy (%)';
    // The visual legend is aria-hidden, so the caption carries the same information for screen readers.
    var cap = document.getElementById('heat-caption');
    if (cap) cap.textContent = which + '-frame accuracy (%) per content domain and overall; the best value in each column is marked.';
  }

  function heatCell(cls, text, isBest, title) {
    var td = el('td', cls + (isBest ? ' best' : ''), text);
    if (isBest) td.appendChild(el('span', 'visually-hidden', ' (best)'));
    td.title = title;
    return td;
  }

  function renderHeat() {
    var table = document.getElementById('heat');
    if (!table) return;
    table.querySelectorAll('tbody').forEach(function (tb) { tb.remove(); });
    var k = state.evidence === 'ret' ? 0 : 1;

    // Best per column across all 17 judges (ties all marked).
    var best = DOMAINS.map(function (_, c) {
      return Math.max.apply(null, JUDGES.map(function (j) { return j.d[c][k]; }));
    });
    var bestOverall = Math.max.apply(null, JUDGES.map(function (j) { return j[state.evidence]; }));

    sections().forEach(function (s) {
      var body = el('tbody');
      table.appendChild(body);
      if (s.group) {
        var gr = el('tr', 'heat-group');
        var gh = el('th');
        gh.colSpan = DOMAINS.length + 2;
        gh.scope = 'rowgroup';
        gh.appendChild(fillGroupLabel(el('span', 'heat-group-label'), s.group));
        gr.appendChild(gh);
        body.appendChild(gr);
      }
      s.rows.forEach(function (j) {
        var tr = el('tr');
        var th = el('th');
        th.scope = 'row';
        th.appendChild(judgeCell(j, !s.group));
        tr.appendChild(th);
        j.d.forEach(function (pair, c) {
          var v = pair[k];
          tr.appendChild(heatCell('h' + bin(v), String(v), v === best[c],
            j.name + ', ' + DOMAINS[c] + ': ' + v + '% ' + (k === 0 ? 'retrieved' : 'uniform')));
        });
        var ov = j[state.evidence];
        tr.appendChild(heatCell('heat-overall-cell h' + bin(ov), fmt1(ov), ov === bestOverall,
          j.name + ', overall: ' + fmt1(ov) + '%'));
        body.appendChild(tr);
      });
    });
    renderHeatLegend();
  }

  // Fade the table's right edge while columns remain hidden off to the right.
  function updateTableFade() {
    var frame = document.getElementById('table-frame');
    var sc = document.getElementById('table-scroll');
    if (!frame || !sc) return;
    frame.classList.toggle('can-scroll', sc.scrollWidth - sc.clientWidth - sc.scrollLeft > 2);
  }

  // ---------------------------------------------------------------------------
  // Controls
  // ---------------------------------------------------------------------------
  function setPressed(attr, value) {
    document.querySelectorAll('[data-' + attr + ']').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-' + attr) === value));
    });
  }

  function render() {
    var board = document.getElementById('panel-board');
    var domain = document.getElementById('panel-domain');
    if (board) board.hidden = state.view !== 'board';
    if (domain) domain.hidden = state.view !== 'domain';
    document.querySelectorAll('[data-only="domain"]').forEach(function (n) { n.hidden = state.view !== 'domain'; });
    setPressed('view', state.view);
    setPressed('sort', state.sort);
    setPressed('evidence', state.evidence);
    renderBoard();
    renderHeat();
    updateTableFade();
  }

  function wireControls() {
    document.querySelectorAll('[data-view]').forEach(function (b) {
      b.addEventListener('click', function () { state.view = b.getAttribute('data-view'); render(); });
    });
    document.querySelectorAll('[data-sort]').forEach(function (b) {
      b.addEventListener('click', function () { state.sort = b.getAttribute('data-sort'); render(); });
    });
    document.querySelectorAll('[data-evidence]').forEach(function (b) {
      b.addEventListener('click', function () { state.evidence = b.getAttribute('data-evidence'); render(); });
    });
    var g = document.getElementById('group-toggle');
    if (g) g.addEventListener('change', function () { state.grouped = g.checked; render(); });
  }

  // ---------------------------------------------------------------------------
  // Page chrome: placeholder links, BibTeX copy, figure lightbox, scroll-spy
  // ---------------------------------------------------------------------------
  function wirePlaceholders() {
    document.querySelectorAll('a.btn[href="#"]').forEach(function (a) {
      a.setAttribute('aria-disabled', 'true');
      a.title = 'Coming soon';
      a.addEventListener('click', function (e) { e.preventDefault(); });
    });
  }

  // Clipboard API where available; if it is missing or refuses, select the <pre> itself and use
  // execCommand. If that fails too, the text is left selected for a manual copy.
  function copyFrom(node) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(node.textContent).catch(function () { return selectAndCopy(node); });
    }
    return selectAndCopy(node);
  }

  // Focus is put back where it was, so keyboard users keep their place.
  function selectAndCopy(node) {
    return new Promise(function (resolve, reject) {
      var prev = document.activeElement;
      var sel = window.getSelection();
      var range = document.createRange();
      range.selectNodeContents(node);
      sel.removeAllRanges();
      sel.addRange(range);
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      if (ok) sel.removeAllRanges();
      if (prev && prev.focus) prev.focus();
      if (ok) resolve(); else reject(new Error('copy failed'));
    });
  }

  function wireCopy() {
    var status = document.getElementById('bib-status');
    var isMac = /Mac|iPhone|iPad/.test(navigator.platform || '');
    document.querySelectorAll('[data-copy-target]').forEach(function (btn) {
      var src = document.getElementById(btn.getAttribute('data-copy-target'));
      var state = btn.querySelector('.bib-copy-state');
      var timer;
      function say(buttonText, announcement) {
        if (state) state.textContent = buttonText;
        if (status) status.textContent = announcement;
      }
      btn.addEventListener('click', function () {
        if (!src) return;
        clearTimeout(timer);
        copyFrom(src).then(function () {
          btn.classList.add('is-done');
          say('Copied', 'BibTeX copied to clipboard');
        }, function () {
          // Leave the text selected so the reader can copy it by hand.
          var keys = isMac ? '⌘C' : 'Ctrl+C';
          say('Press ' + keys, 'Copy failed. The BibTeX is selected; press ' + keys + ' to copy it.');
        }).then(function () {
          timer = setTimeout(function () {
            btn.classList.remove('is-done');
            say('Copy', '');
          }, 2000);
        });
      });
    });
  }

  function wireLightbox() {
    var dlg = document.getElementById('lightbox');
    var img = document.getElementById('lightbox-img');
    if (!dlg || !img || typeof dlg.showModal !== 'function') return;
    var wide = window.matchMedia('(min-width: 720px)');

    document.querySelectorAll('[data-zoom]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        // On small screens the full-size image opens directly, where native pinch-zoom works best.
        if (!wide.matches) return;
        e.preventDefault();
        var inner = a.querySelector('img');
        var full = a.href;
        if (inner) {
          // Size the dialog from the figure's aspect ratio and show the already-loaded image at once,
          // then swap in the full-resolution file when it arrives (unless another figure was opened).
          dlg.style.setProperty('--ar', String(inner.getAttribute('width') / inner.getAttribute('height')));
          img.src = inner.currentSrc || inner.src;
          img.alt = inner.alt;
        }
        img.dataset.want = full;
        var hi = new Image();
        hi.onload = function () { if (dlg.open && img.dataset.want === full) img.src = full; };
        hi.src = full;
        dlg.showModal();
      });
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  }

  // Keep a nav link visible when the nav row scrolls (narrow phones). Rect maths rather than
  // scrollIntoView, which would interrupt the page's own smooth scroll.
  function revealInNav(a) {
    var nav = a.parentNode;
    if (nav.scrollWidth <= nav.clientWidth) return;
    var ar = a.getBoundingClientRect();
    var nr = nav.getBoundingClientRect();
    if (ar.right > nr.right - 18 || ar.left < nr.left) nav.scrollLeft += ar.left - nr.left - (nr.width - ar.width) / 2;
  }

  // Fade the nav's edge only when its links don't fit: the right edge normally, the left edge once
  // it is scrolled to the end. Keyboard focus also scrolls the focused link into view.
  function wireNavOverflow() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    function edge() { nav.classList.toggle('at-end', nav.scrollLeft >= nav.scrollWidth - nav.clientWidth - 1); }
    function check() {
      nav.classList.remove('is-overflowing');
      if (nav.scrollWidth > nav.clientWidth + 1) nav.classList.add('is-overflowing');
      edge();
    }
    check();
    nav.addEventListener('scroll', edge, { passive: true });
    nav.addEventListener('focusin', function (e) { if (e.target.tagName === 'A') revealInNav(e.target); });
    window.addEventListener('resize', check);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(check);
  }

  function wireScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
        // The hero and the acknowledgements have no nav link: entering them clears the highlight.
        var a = byId[en.target.id];
        if (a && getComputedStyle(a).display !== 'none') {
          a.classList.add('is-active');
          a.setAttribute('aria-current', 'true');
          revealInNav(a);
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(byId).concat(['top', 'acknowledgements']).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) obs.observe(s);
    });
  }

  function wireTableFade() {
    var sc = document.getElementById('table-scroll');
    if (!sc) return;
    sc.addEventListener('scroll', updateTableFade, { passive: true });
    window.addEventListener('resize', updateTableFade);
  }

  function init() {
    renderAxis();
    wireControls();
    wireTooltip();
    render();
    wirePlaceholders();
    wireCopy();
    wireLightbox();
    wireNavOverflow();
    wireScrollSpy();
    wireTableFade();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
