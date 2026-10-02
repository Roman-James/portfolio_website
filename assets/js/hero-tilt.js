// Landing page picture: tilts to "look at" the mouse anywhere on the page.
// The tilt is eased every animation frame (instead of a CSS transition, which
// restarts on every mouse move and stutters).
document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('.hero');
  const card = document.querySelector('.hero-card');
  if (!hero || !card) return;

  const MAX_TILT_X = 10;   // degrees, up/down
  const MAX_TILT_Y = 14;   // degrees, left/right
  const HOVER_SCALE = 1.03;
  const EASE = 8;          // higher = snappier follow, lower = floatier
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const target = { rx: 0, ry: 0, s: 1 };
  const current = { rx: 0, ry: 0, s: 1 };
  let rafId = null;
  let lastTime = 0;

  function render() {
    card.style.transform =
      `perspective(900px) rotateX(${current.rx}deg) rotateY(${current.ry}deg) scale(${current.s})`;
  }

  function tick(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.1); // seconds, capped after tab switches
    lastTime = time;
    const k = 1 - Math.exp(-EASE * dt);                // same feel at any frame rate

    let settled = true;
    for (const key in target) {
      current[key] += (target[key] - current[key]) * k;
      if (Math.abs(target[key] - current[key]) > 0.001) settled = false;
    }
    render();

    rafId = settled ? null : requestAnimationFrame(tick);
  }

  function start() {
    if (rafId) return;
    lastTime = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  window.addEventListener('mousemove', (e) => {
    if (!reduceMotion) {
      // -1 (left/top edge of the window) .. 1 (right/bottom edge)
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      target.ry = nx * MAX_TILT_Y;
      target.rx = -ny * MAX_TILT_X;
      start();
    }
  });

  hero.addEventListener('mouseenter', () => { target.s = HOVER_SCALE; start(); });
  hero.addEventListener('mouseleave', () => { target.s = 1; start(); });

  // mouse left the window: ease back to facing forward
  document.addEventListener('mouseleave', () => {
    target.rx = 0;
    target.ry = 0;
    start();
  });
});
