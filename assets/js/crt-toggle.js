document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("crtToggle");
  const screen = document.getElementById("screen") || document.body;
  if (!button || !screen) return;

  const STORAGE_KEY = 'crtOn';

  // helper to set pressed state without transition flicker on load
  function setPressedNoTransition(isOn) {
    const icon = button.querySelector('img');
    if (icon) {
      const prev = icon.style.transition;
      icon.style.transition = 'none';
      if (isOn) {
        screen.classList.add('crt');
        button.setAttribute('aria-pressed', 'true');
      } else {
        screen.classList.remove('crt');
        button.setAttribute('aria-pressed', 'false');
      }
      // force reflow then restore
      // eslint-disable-next-line no-unused-expressions
      icon.offsetHeight;
      icon.style.transition = prev || '';
    } else {
      if (isOn) {
        screen.classList.add('crt');
        button.setAttribute('aria-pressed', 'true');
      } else {
        screen.classList.remove('crt');
        button.setAttribute('aria-pressed', 'false');
      }
    }
  }

  // initialize from localStorage
  const stored = localStorage.getItem(STORAGE_KEY);
  const isStoredOn = stored === 'true';
  setPressedNoTransition(isStoredOn);

  button.addEventListener('click', () => {
    const isOn = screen.classList.toggle('crt');
    button.setAttribute('aria-pressed', String(!!isOn));
    localStorage.setItem(STORAGE_KEY, String(!!isOn));
  });

  // keep other tabs in sync
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY) return;
    const val = e.newValue === 'true';
    if (val) {
      screen.classList.add('crt');
      button.setAttribute('aria-pressed', 'true');
    } else {
      screen.classList.remove('crt');
      button.setAttribute('aria-pressed', 'false');
    }
  });
});