// Light / dark theme toggle.
// The class goes on <html> right away (before <body> renders) so light mode doesn't flash dark on load.
(() => {
  const STORAGE_KEY = 'theme';
  const root = document.documentElement;

  function readStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  root.classList.toggle('light', readStored() === 'light');

  document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('themeToggle');
    if (!button) return;

    const setPressed = () => button.setAttribute('aria-pressed', String(root.classList.contains('light')));
    setPressed();

    button.addEventListener('click', () => {
      const isLight = root.classList.toggle('light');
      setPressed();
      try { localStorage.setItem(STORAGE_KEY, isLight ? 'light' : 'dark'); } catch (e) {}
    });

    // keep other tabs in sync
    window.addEventListener('storage', (e) => {
      if (e.key !== STORAGE_KEY) return;
      root.classList.toggle('light', e.newValue === 'light');
      setPressed();
    });
  });
})();
