// Events page: view toggle + sort menu.
// Compact = a club listing, one line per event; hovering a line floats its poster next to the cursor.
// Expanded = cards with the whole poster (loads data-large into the card the first time).
// The chosen view is remembered in this browser.
// Newest / oldest first keep the rows under their year headings (years flip for oldest first);
// Name (A-Z) drops the headings and shows one flat list.
document.addEventListener('DOMContentLoaded', () => {
    const main = document.querySelector('.events-page');
    const sortSelect = document.getElementById('sortSelect');
    const flat = document.querySelector('.event-list--flat');
    const groups = Array.from(document.querySelectorAll('.event-year-group'));
    const rows = Array.from(document.querySelectorAll('.event-row'));
    const viewButtons = document.querySelectorAll('.filter-btn[data-view]');

    // --- view toggle ---
    function setView(view) {
        const expanded = view === 'expanded';
        main.classList.toggle('is-expanded', expanded);
        viewButtons.forEach(b => b.classList.toggle('active', b.dataset.view === view));
        if (expanded) {
            rows.forEach(row => {
                const img = row.querySelector('img[data-large]');
                if (img && img.src !== img.dataset.large) img.src = img.dataset.large;
            });
        }
        try { localStorage.setItem('eventsView', view); } catch (e) { /* storage blocked: just don't remember */ }
    }

    viewButtons.forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
    let saved = null;
    try { saved = localStorage.getItem('eventsView'); } catch (e) { /* ignore */ }
    if (saved === 'expanded') setView('expanded');

    // --- poster that follows the cursor over the listing (Compact view, mouse only) ---
    const peek = document.createElement('img');
    peek.className = 'event-peek';
    peek.alt = '';
    document.body.appendChild(peek);
    const canHover = window.matchMedia('(hover: hover)').matches;

    function placePeek(e) {
        const gap = 24;
        const w = peek.offsetWidth || 260;
        const h = peek.offsetHeight || 360;
        // right of the cursor, or left when there's no room; vertically centred, kept on screen
        let x = e.clientX + gap;
        if (x + w > window.innerWidth - 8) x = e.clientX - gap - w;
        const y = Math.min(Math.max(e.clientY - h / 2, 8), window.innerHeight - h - 8);
        peek.style.transform = `translate(${x}px, ${y}px)`;
    }

    document.addEventListener('mousemove', (e) => {
        const row = canHover && !main.classList.contains('is-expanded') && e.target.closest('.event-row');
        if (!row) { peek.classList.remove('is-visible'); return; }
        const src = row.querySelector('img[data-large]')?.dataset.large;
        if (src && peek.getAttribute('src') !== src) peek.setAttribute('src', src);
        peek.style.setProperty('--accent', getComputedStyle(row).getPropertyValue('--accent'));
        placePeek(e);
        peek.classList.add('is-visible');
    });
    document.addEventListener('mouseleave', () => peek.classList.remove('is-visible'));

    // --- sort ---
    // remember which year list each row belongs in, so it can go back after a name sort
    const homeList = new Map(rows.map(row => [row, row.parentElement]));
    const byDate = (a, b) => a.dataset.date.localeCompare(b.dataset.date);
    const byName = (a, b) => a.dataset.name.localeCompare(b.dataset.name);

    function sortEvents() {
        const mode = sortSelect.value;

        if (mode === 'name-az') {
            [...rows].sort(byName).forEach(row => flat.appendChild(row));
            groups.forEach(group => { group.hidden = true; });
            flat.hidden = false;
            return;
        }

        const newestFirst = mode === 'date-new';
        [...rows].sort(byDate).forEach(row => {
            const list = homeList.get(row);
            newestFirst ? list.prepend(row) : list.appendChild(row);
        });
        [...groups]
            .sort((a, b) => newestFirst ? b.dataset.year - a.dataset.year : a.dataset.year - b.dataset.year)
            .forEach(group => { group.hidden = false; main.insertBefore(group, flat); });
        flat.hidden = true;
    }

    sortSelect.addEventListener('change', sortEvents);
});
