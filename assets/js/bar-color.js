// Colour bars + mouse trail follow what you're hovering.
// Hovering a project tile, filter button, event section or events-page row fades the bars (and
// the mouse trail) to that element's --accent colour; moving off fades them back
// to the page's default (white / black, or the project colour on project pages).
// The fade itself is a CSS transition on the bars, see --bar-color in style.css.
document.addEventListener('DOMContentLoaded', () => {
  const TARGETS = '.project-tile, .filter-btn, .event-section, .event-row';
  const body = document.body;
  let current = null;

  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest(TARGETS);
    if (el === current) return;
    current = el;
    const color = el ? getComputedStyle(el).getPropertyValue('--accent').trim() : '';
    if (color) body.style.setProperty('--bar-color', color);
    else body.style.removeProperty('--bar-color');
  });
});
