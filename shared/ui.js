/* eslint-env browser */
window.UI = (() => {
  const toast = (msg) => {
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = [
      'position:fixed',
      'right:16px',
      'bottom:16px',
      'padding:10px 14px',
      'background:#111827',
      'border:1px solid #374151',
      'border-radius:10px',
      'color:#e5e7eb',
      'z-index:9999'
    ].join(';');
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1800);
  };
  return { toast };
})();
