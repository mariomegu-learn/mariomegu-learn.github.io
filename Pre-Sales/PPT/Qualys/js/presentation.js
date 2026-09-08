(() => {
  const slides = [...document.querySelectorAll('[data-slide]')];
  const previousButton = document.querySelector('[data-previous]');
  const nextButton = document.querySelector('[data-next]');
  const currentSlide = document.querySelector('[data-current-slide]');
  const totalSlides = document.querySelector('[data-total-slides]');
  const progressBar = document.querySelector('.progress__bar');
  const presentation = document.querySelector('.presentation-shell');
  const homeLink = document.querySelector('[data-home]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const presentationDate = document.querySelector('[data-presentation-date]');
  const slideSelect = document.querySelector('[data-slide-select]');
  const fullscreenButton = document.querySelector('[data-fullscreen]');
  const helpModal = document.getElementById('helpModal');
  const helpModalBtn = document.getElementById('helpModalBtn');
  const closeHelpModal = document.getElementById('closeHelpModal');
  let activeIndex = 0;
  let touchStartX = 0;
  let touchStartY = 0;

  totalSlides.textContent = String(slides.length).padStart(2, '0');
  presentationDate.textContent = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  if (slideSelect) {
    slides.forEach((slide, index) => {
      const titleEl = slide.querySelector('h1, h2');
      const titleText = titleEl ? titleEl.textContent.trim().replace(/\s+/g, ' ') : `Diapositiva ${index + 1}`;
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${String(index + 1).padStart(2, '0')}. ${titleText}`;
      slideSelect.appendChild(option);
    });

    slideSelect.addEventListener('change', (e) => {
      showSlide(parseInt(e.target.value, 10));
    });
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen().catch(err => console.log(err));
    }
  };

  if (fullscreenButton) {
    fullscreenButton.addEventListener('click', toggleFullscreen);
  }

  const toggleHelpModal = (show) => {
    if (!helpModal) return;
    const shouldShow = show !== undefined ? show : helpModal.hidden;
    helpModal.hidden = !shouldShow;
  };

  if (helpModalBtn) helpModalBtn.addEventListener('click', () => toggleHelpModal(true));
  if (closeHelpModal) closeHelpModal.addEventListener('click', () => toggleHelpModal(false));
  if (helpModal) {
    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) toggleHelpModal(false);
    });
  }

  const updateControls = () => {
    currentSlide.textContent = String(activeIndex + 1).padStart(2, '0');
    progressBar.style.width = `${((activeIndex + 1) / slides.length) * 100}%`;
    previousButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === slides.length - 1;
    if (slideSelect) slideSelect.value = activeIndex;

    window.dispatchEvent(new CustomEvent('slidechanged', { detail: { index: activeIndex } }));
  };

  const showSlide = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= slides.length || nextIndex === activeIndex) return;

    const previousSlide = slides[activeIndex];
    const nextSlide = slides[nextIndex];
    previousSlide.classList.add('slide--leaving');
    nextSlide.hidden = false;

    requestAnimationFrame(() => {
      previousSlide.classList.remove('slide--active');
      nextSlide.classList.add('slide--active');
    });

    const finishTransition = () => {
      previousSlide.hidden = true;
      previousSlide.classList.remove('slide--leaving');
    };

    if (reducedMotion) {
      finishTransition();
    } else {
      window.setTimeout(finishTransition, 500);
    }

    activeIndex = nextIndex;
    updateControls();
  };

  previousButton.addEventListener('click', () => showSlide(activeIndex - 1));
  nextButton.addEventListener('click', () => showSlide(activeIndex + 1));
  homeLink.addEventListener('click', (event) => {
    event.preventDefault();
    showSlide(0);
    window.history.replaceState(null, '', window.location.pathname);
  });

  // Image Zoom Lightbox
  const imageModal = document.getElementById('imageModal');
  const imageModalImg = document.getElementById('imageModalImg');
  const closeImageModal = document.getElementById('closeImageModal');

  const closeZoomModal = () => {
    if (!imageModal) return;
    imageModal.classList.remove('active');
    imageModal.setAttribute('aria-hidden', 'true');
  };

  const openZoomModal = (imgSrc, imgAlt) => {
    if (!imageModal || !imageModalImg) return;
    imageModalImg.src = imgSrc;
    imageModalImg.alt = imgAlt || 'Imagen ampliada';
    imageModal.classList.add('active');
    imageModal.setAttribute('aria-hidden', 'false');
  };

  if (closeImageModal) closeImageModal.addEventListener('click', closeZoomModal);
  if (imageModal) {
    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal || e.target === imageModalImg) closeZoomModal();
    });
  }

  // Make slide content images zoomable on click
  const slideImages = document.querySelectorAll('.slide figure img, .vmdr-diagram img, .dashboard-preview img');
  slideImages.forEach((img) => {
    img.classList.add('zoomable-image');
    img.setAttribute('title', 'Haz clic para agrandar');
    img.addEventListener('click', () => {
      openZoomModal(img.src, img.alt);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (imageModal && imageModal.classList.contains('active')) {
        closeZoomModal();
        return;
      }
      toggleHelpModal(false);
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey || event.target.matches('input, textarea, select')) return;
    if (event.key === 'ArrowRight') showSlide(activeIndex + 1);
    if (event.key === 'ArrowLeft') showSlide(activeIndex - 1);
    if (event.key === 'f' || event.key === 'F') toggleFullscreen();
    if (event.key === '?' || event.key === 'h' || event.key === 'H') toggleHelpModal();
  });

  presentation.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: true });

  presentation.addEventListener('touchend', (event) => {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) return;
    showSlide(activeIndex + (deltaX < 0 ? 1 : -1));
  }, { passive: true });

  window.getCurrentSlideIndex = () => activeIndex;
  window.showSlideIndex = (idx) => showSlide(idx);

  updateControls();
})();
