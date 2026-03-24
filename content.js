(function () {
  'use strict';

  // Trier les clés les plus longues en premier pour que "Sawn-Off Shotgun"
  // soit remplacé avant "Shotgun" dans la regex.
  const entries = Object.entries(TRANSLATIONS)
    .sort(([a], [b]) => b.length - a.length);

  // Abréviations de stats (CL, LD, WIL…) : case-sensitive
  // pour ne pas corrompre "Vehicle" → "VehiSFe", etc.
  const STAT_KEY = /^[A-Z]{2,5}[=:x]?$/;

  const mainMap = new Map();
  const statMap = new Map();
  const mainPatterns = [];
  const statPatterns = [];

  for (const [en, fr] of entries) {
    const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Ajouter des frontières si la clé commence et finit par une lettre,
    // pour éviter de corrompre "corridor" quand on traduit "or".
    const startsWithLetter = /^[A-Za-z]/.test(en);
    const endsWithLetter = /[A-Za-z]$/.test(en);
    const pattern = (startsWithLetter && endsWithLetter)
      ? `(?<![A-Za-z])${escaped}(?![A-Za-z])`
      : escaped;

    if (STAT_KEY.test(en)) {
      statPatterns.push(pattern);
      statMap.set(en, fr);
    } else {
      mainPatterns.push(pattern);
      mainMap.set(en.toLowerCase(), fr);
    }
  }

  const mainRe = mainPatterns.length ? new RegExp(mainPatterns.join('|'), 'gi') : null;
  const statRe = statPatterns.length ? new RegExp(statPatterns.join('|'), 'g') : null;

  function translate(node) {
    const text = node.textContent;
    if (!text.trim()) return;
    let t = text;
    if (mainRe) t = t.replace(mainRe, m => mainMap.get(m.toLowerCase()) ?? m);
    if (statRe) t = t.replace(statRe, m => statMap.get(m) ?? m);
    if (t !== text) node.textContent = t;
  }

  function collectTextNodes(root, out) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let n;
    while ((n = walker.nextNode())) out.push(n);
  }

  // File partagée entre la passe initiale et le MutationObserver.
  const pending = [];
  collectTextNodes(document.body, pending);

  let processing = false;
  let debounceTimer = null;

  function doProcess() {
    if (pending.length === 0) { processing = false; return; }
    requestIdleCallback((deadline) => {
      while (deadline.timeRemaining() > 1 && pending.length > 0) {
        translate(pending.pop());
      }
      doProcess();
    }, { timeout: 500 });
  }

  function scheduleProcess() {
    if (processing) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => { processing = true; doProcess(); }, 50);
  }

  scheduleProcess();

  // Re-traduit le contenu React chargé dynamiquement.
  new MutationObserver((mutations) => {
    let added = false;
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) { collectTextNodes(node, pending); added = true; }
        else if (node.nodeType === Node.TEXT_NODE) { pending.push(node); added = true; }
      }
    }
    if (added) scheduleProcess();
  }).observe(document.body, { childList: true, subtree: true });
})();
