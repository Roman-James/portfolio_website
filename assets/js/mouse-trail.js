// Mouse trail: a chain of small glowing dots that follows the cursor, shrinking
// and fading toward the tail, and fades out when the mouse stops.
// The dots take the colour bars' colour (--bar-color in style.css).
// Kept deliberately cheap to draw: no blend modes or blur filters (those made
// Chromium browsers like Brave lag). Skipped on touch screens and for visitors
// who prefer reduced motion.
document.addEventListener('DOMContentLoaded', () => {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const COUNT = 8;           // number of dots
  const HEAD_SIZE = 10;      // px, first dot
  const TAIL_SIZE = 3;       // px, last dot
  const FOLLOW = 28;         // higher = tighter trail, lower = longer/lazier trail
  const IDLE_MS = 500;       // fade the trail out after the mouse rests this long

  const trail = document.createElement('div');
  // starts hidden (--off = display:none, so it costs nothing until the mouse moves)
  trail.className = 'mouse-trail trail--idle trail--off';
  const dots = [];
  const points = [];
  for (let i = 0; i < COUNT; i++) {
    const dot = document.createElement('span');
    const t = i / (COUNT - 1);
    const size = HEAD_SIZE + (TAIL_SIZE - HEAD_SIZE) * t;
    dot.style.width = dot.style.height = `${size}px`;
    dot.style.margin = `${-size / 2}px 0 0 ${-size / 2}px`; // centre the dot on its point
    dot.style.opacity = String(1 - t * 0.85);
    trail.appendChild(dot);
    dots.push(dot);
    points.push({ x: 0, y: 0 });
  }

  document.body.appendChild(trail);

  const mouse = { x: 0, y: 0 };
  let started = false;
  let rafId = null;
  let lastTime = 0;
  let idleTimer = null;
  let offTimer = null;
  let visible = false;

  // only touch the class list when the state actually changes: re-setting a class
  // on every mouse move makes the browser recheck the styles of every dot
  function show() {
    clearTimeout(offTimer);
    if (visible) return;
    visible = true;
    trail.classList.remove('trail--off');
    requestAnimationFrame(() => { if (visible) trail.classList.remove('trail--idle'); });
  }

  function hide() {
    if (!visible) return;
    visible = false;
    trail.classList.add('trail--idle');
    // after the fade, take it out of rendering entirely
    offTimer = setTimeout(() => trail.classList.add('trail--off'), 400);
  }

  function tick(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;
    const k = 1 - Math.exp(-FOLLOW * dt); // same feel at any frame rate

    let settled = true;
    points.forEach((p, i) => {
      const lead = i === 0 ? mouse : points[i - 1];
      p.x += (lead.x - p.x) * k;
      p.y += (lead.y - p.y) * k;
      if (Math.abs(lead.x - p.x) > 0.1 || Math.abs(lead.y - p.y) > 0.1) settled = false;
      dots[i].style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
    });

    rafId = settled ? null : requestAnimationFrame(tick);
  }

  window.addEventListener('mousemove', (e) => {
    if (!started) {
      // first move: start every dot at the cursor instead of flying in from the corner
      points.forEach((p) => { p.x = e.clientX; p.y = e.clientY; });
      started = true;
    }
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    show();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(hide, IDLE_MS);

    if (!rafId) {
      lastTime = performance.now();
      rafId = requestAnimationFrame(tick);
    }
  });

  document.addEventListener('mouseleave', hide);
});
