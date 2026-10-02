// Fullscreen photo viewer for project pages: click any .gallery-img to open it,
// then use the arrows / arrow keys to browse and Esc or the background to close.
// It opens data-full when a photo has one (thumbnail in the grid, full size in the viewer).
// Under the photo it shows its caption (data-caption, else the figure's caption, else the alt text).
// The frame, caption and arrows take the project's colour (--accent in style.css).
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('galleryOverlay');
    const overlayImg = document.getElementById('overlayImg');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (!overlay || !overlayImg) return;

    // caption line under the photo (added here so older pages don't need an HTML change)
    let caption = document.getElementById('overlayCaption');
    if (!caption) {
        caption = document.createElement('p');
        caption.id = 'overlayCaption';
        caption.className = 'overlay-caption';
        overlay.appendChild(caption);
    }

    let images = [];
    let currentIndex = 0;

    function captionFor(img) {
        if (img.dataset.caption) return img.dataset.caption;
        const figcaption = img.closest('figure')?.querySelector('figcaption');
        return figcaption ? figcaption.textContent : img.alt;
    }

    function openGallery(img) {
        images = Array.from(document.querySelectorAll('.gallery-img'));
        currentIndex = images.indexOf(img);
        updateOverlayImage();
        overlay.style.display = 'flex'; // matches the CSS flex layout
        document.addEventListener('keydown', handleKeyPress);
    }

    function closeGallery() {
        overlay.style.display = 'none';
        document.removeEventListener('keydown', handleKeyPress);
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % images.length;
        updateOverlayImage();
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateOverlayImage();
    }

    function updateOverlayImage() {
        const img = images[currentIndex];
        overlayImg.src = img.dataset.full || img.src; // grids show a small thumb, the viewer the full photo
        overlayImg.alt = img.alt;
        caption.textContent = captionFor(img);
    }

    function handleKeyPress(e) {
        switch (e.key) {
            case 'ArrowRight': showNext(); break;
            case 'ArrowLeft': showPrev(); break;
            case 'Escape':
            case 'Esc': closeGallery(); break;
        }
    }

    // one listener for all photos
    document.addEventListener('click', (e) => {
        const img = e.target.closest('.gallery-img');
        if (img) openGallery(img);
    });

    // stopPropagation keeps arrow clicks from reaching the overlay background
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });

    // click the dark background (not the photo) to close
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeGallery();
    });
});
