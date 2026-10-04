document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('projectsGrid');
    const sortSelect = document.getElementById('sortSelect');
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
});