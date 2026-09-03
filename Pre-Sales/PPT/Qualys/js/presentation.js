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
  let activeIndex = 0;
  let touchStartX = 0;
  let touchStartY = 0;

  totalSlides.textContent = String(slides.length).padStart(2, '0');

  const updateControls = () => {
    currentSlide.textContent = String(activeIndex + 1).padStart(2, '0');
    progressBar.style.width = `${((activeIndex + 1) / slides.length) * 100}%`;
    previousButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === slides.length - 1;
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

  document.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.target.matches('input, textarea, select, button')) return;
    if (event.key === 'ArrowRight') showSlide(activeIndex + 1);
    if (event.key === 'ArrowLeft') showSlide(activeIndex - 1);
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

  updateControls();
})();
