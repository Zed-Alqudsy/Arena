/* eslint-env browser */
window.Lang = (() => {
  let cur = 'EN';
  const dict = { EN: {}, BM: {} };
  const t = (k) => dict[cur][k] || k;
  const set = (lang = 'EN') => {
    cur = lang;
    document.querySelectorAll('[data-key]').forEach((el) => {
      el.textContent = t(el.dataset.key);
    });
  };
  // Optional helper to extend dictionary at runtime
  const load = (lang, entries) => {
    dict[lang] = { ...(dict[lang] || {}), ...(entries || {}) };
  };
  return { t, set, load };
})();
