// resolve audio relative to this script so it works from any page depth
const MUSIC_SCRIPT_URL = document.currentScript.src;

document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('musicToggle');
  if (!button) return;

  const STORAGE_KEY = 'musicOn';
  const TIME_KEY = 'musicTime';
  const SRC = new URL('../audio/TWIST_IT.mp3', MUSIC_SCRIPT_URL).href;

  const audio = document.createElement('audio');
  audio.src = SRC;
  audio.preload = 'auto';
  audio.style.display = 'none';
  document.body.appendChild(audio);

  let saveInterval = null;
  function startSaving() {
    if (saveInterval) return;
    saveInterval = setInterval(() => {
      try { localStorage.setItem(TIME_KEY, String(audio.currentTime || 0)); } catch (e) {}
    }, 1000);
  }
  function stopSaving() {
    if (!saveInterval) return;
    clearInterval(saveInterval); saveInterval = null;
    try { localStorage.setItem(TIME_KEY, String(audio.currentTime || 0)); } catch (e) {}
  }

  const setPressed = (isOn) => button.setAttribute('aria-pressed', String(!!isOn));
  function setPressedNoTransition(isOn) {
    const img = button.querySelector('img');
    if (img) {
      const prev = img.style.transition;
      img.style.transition = 'none';
      setPressed(isOn);
      // force reflow
      // eslint-disable-next-line no-unused-expressions
      img.offsetHeight;
      img.style.transition = prev || '';
    } else setPressed(isOn);
  }

  // initialize from storage
  const storedOn = localStorage.getItem(STORAGE_KEY) === 'true';
  const storedTime = parseFloat(localStorage.getItem(TIME_KEY) || '0') || 0;
  if (storedTime > 0) {
    try { audio.currentTime = Math.max(0, storedTime - 0.5); } catch (e) {}
  }
  if (storedOn) {
    audio.play().then(() => { setPressedNoTransition(true); startSaving(); }).catch(() => { setPressedNoTransition(false); });
  } else setPressedNoTransition(false);

  // toggle
  button.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => {
        setPressed(true);
        try { localStorage.setItem(STORAGE_KEY, 'true'); } catch (e) {}
        startSaving();
      }).catch(() => { setPressed(false); });
    } else {
      audio.pause();
      setPressed(false);
      try { localStorage.setItem(STORAGE_KEY, 'false'); } catch (e) {}
      stopSaving();
    }
  });

  // sync across tabs
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      const on = e.newValue === 'true';
      if (on && audio.paused) {
        const t = parseFloat(localStorage.getItem(TIME_KEY) || '0') || 0;
        if (t > 0) { try { audio.currentTime = Math.max(0, t - 0.5); } catch(e) {} }
        audio.play().then(() => { setPressed(true); startSaving(); }).catch(() => setPressed(false));
      } else if (!on && !audio.paused) {
        audio.pause(); setPressed(false); stopSaving();
      }
    } else if (e.key === TIME_KEY) {
      // another tab updated time; if we're paused update our currentTime so resume is near same spot
      if (audio.paused) {
        const t = parseFloat(e.newValue || '0') || 0;
        if (t > 0) { try { audio.currentTime = Math.max(0, t - 0.5); } catch(e) {} }
      }
    }
  });

  window.addEventListener('beforeunload', () => {
    try { localStorage.setItem(TIME_KEY, String(audio.currentTime || 0)); } catch (e) {}
  });
});
