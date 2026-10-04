document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('projectsGrid');
    const sortSelect = document.getElementById('sortSelect');
    const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');
    const tiles = Array.from(grid.querySelectorAll('.project-tile'));

    // --- SORT FUNCTION ---
    function sortProjects() {
        const sortValue = sortSelect.value;

        const sortedTiles = [...tiles].sort((a, b) => {
            const nameA = (a.getAttribute('data-name') || "").toLowerCase();
            const nameB = (b.getAttribute('data-name') || "").toLowerCase();
            const dateA = new Date(a.getAttribute('data-date') || 0);
            const dateB = new Date(b.getAttribute('data-date') || 0);

            if (sortValue === 'name-az') return nameA.localeCompare(nameB);
            if (sortValue === 'date-new') return dateB - dateA;
            if (sortValue === 'date-old') return dateA - dateB;
            return 0;
        });

        // Re-append sorted tiles
        sortedTiles.forEach(tile => grid.appendChild(tile));
    }

    // Run sort immediately on page load
    sortProjects();

    // Re-run sort whenever dropdown changes
    sortSelect.addEventListener('change', sortProjects);

    // --- FILTER: by role tag (data-tags on each tile) ---
    // projects.html?tag=live-visuals opens the page already filtered (the homepage and the
    // tags on project pages link here); clicking a button updates that address too.
    function filterProjects(tag) {
        if (![...filterButtons].some(b => b.dataset.filter === tag)) tag = 'all';
        filterButtons.forEach(b => b.classList.toggle('active', b.dataset.filter === tag));
        tiles.forEach(tile => {
            const tags = (tile.dataset.tags || '').split(' ');
            tile.style.display = (tag === 'all' || tags.includes(tag)) ? '' : 'none';
        });
        const url = new URL(location.href);
        if (tag === 'all') url.searchParams.delete('tag'); else url.searchParams.set('tag', tag);
        history.replaceState(null, '', url);
    }

    filterButtons.forEach(button => button.addEventListener('click', () => filterProjects(button.dataset.filter)));
    filterProjects(new URLSearchParams(location.search).get('tag') || 'all');
});