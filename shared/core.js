/* eslint-env browser */
window.Core = (() => {
  const q = new URLSearchParams(location.search);
  const getParam = (k) => q.get(k);
  const requireParams = (needed, redirectTo = '../index.html') => {
    const missing = needed.filter((k) => !getParam(k));
    if (missing.length) location.replace(redirectTo);
  };
  const uid = (p = 'CID') =>
    `${p}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const buildUrl = (href, params = {}) => {
    const sp = new URLSearchParams(params);
    return `${href}?${sp.toString()}`;
  };
  return { getParam, requireParams, uid, buildUrl };
})();
