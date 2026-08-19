const slides = [...document.querySelectorAll('.slide')];
const slideNumber = document.querySelector('#slide-number');
const slideTotal = document.querySelector('#slide-total');
const progress = document.querySelector('#progress');
const previous = document.querySelector('#previous');
const next = document.querySelector('#next');
const overviewButton = document.querySelector('#overview-button');
const overview = document.querySelector('#overview');
const navigation = document.querySelector('#slide-nav');
const imageModal = document.querySelector('#image-modal');
const modalImage = document.querySelector('#modal-image');
const modalCaption = document.querySelector('#modal-caption');
const imageModalClose = document.querySelector('.image-modal-close');
const zoomableImages = [...document.querySelectorAll('.slide img:not(.cover-scene img)')];
let current = 0;
let hasCelebratedFinalSlide = false;

function launchConfetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.confetti) return;

  const colors = ['#ff6b5f', '#ffd166', '#20b8a6', '#f49ac2', '#d4a373'];
  const defaults = { colors, gravity: 0.72, ticks: 290, scalar: 1.05, zIndex: 20 };

  window.confetti({ ...defaults, particleCount: 75, angle: 62, spread: 65, startVelocity: 78, origin: { x: 0.22, y: 1.05 } });
  window.confetti({ ...defaults, particleCount: 75, angle: 118, spread: 65, startVelocity: 78, origin: { x: 0.78, y: 1.05 } });
  window.setTimeout(() => {
    window.confetti({ ...defaults, particleCount: 48, angle: 74, spread: 85, startVelocity: 66, origin: { x: 0.38, y: 1.05 } });
    window.confetti({ ...defaults, particleCount: 48, angle: 106, spread: 85, startVelocity: 66, origin: { x: 0.62, y: 1.05 } });
  }, 180);
}

slideTotal.textContent = slides.length;

slides.forEach((slide, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = `${String(index + 1).padStart(2, '0')} · ${slide.dataset.name}`;
  button.addEventListener('click', () => {
    showSlide(index);
    overview.close();
  });
  navigation.append(button);
});

function showSlide(index) {
  const nextIndex = Math.max(0, Math.min(index, slides.length - 1));
  const outgoingSlide = slides[current];

  if (nextIndex !== current && outgoingSlide) {
    const tossStyle = `toss-${(current % 4) + 1}`;
    outgoingSlide.classList.remove('is-active');
    outgoingSlide.classList.add('is-leaving', tossStyle);
    window.setTimeout(() => outgoingSlide.classList.remove('is-leaving', tossStyle), 1000);
  }

  current = nextIndex;
  slides.forEach((slide, slideIndex) => {
    const visible = slideIndex === current;
    slide.classList.toggle('is-active', visible);
    if (!visible && slide !== outgoingSlide) slide.classList.remove('is-leaving');
    slide.setAttribute('aria-hidden', String(!visible));
  });

  [...navigation.children].forEach((button, buttonIndex) => {
    button.classList.toggle('is-current', buttonIndex === current);
  });

  slideNumber.textContent = current + 1;
  progress.style.width = `${((current + 1) / slides.length) * 100}%`;
  previous.disabled = current === 0;
  next.disabled = current === slides.length - 1;
  history.replaceState(null, '', `#${slides[current].id}`);

  if (current === slides.length - 1 && !hasCelebratedFinalSlide) {
    hasCelebratedFinalSlide = true;
    window.setTimeout(launchConfetti, 1100);
  }

  if (current !== slides.length - 1) hasCelebratedFinalSlide = false;
}

previous.addEventListener('click', () => showSlide(current - 1));
next.addEventListener('click', () => showSlide(current + 1));
overviewButton.addEventListener('click', () => overview.showModal());

document.querySelector('.dialog-close').addEventListener('click', () => overview.close());

zoomableImages.forEach((image) => {
  image.classList.add('zoomable-image');
  image.tabIndex = 0;
  image.setAttribute('role', 'button');
  image.setAttribute('aria-label', `Ampliar imagen: ${image.alt}`);

  const openImageModal = () => {
    modalImage.src = image.currentSrc || image.src;
    modalImage.alt = image.alt;
    modalCaption.textContent = image.alt;
    imageModal.showModal();
  };

  image.addEventListener('click', openImageModal);
  image.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openImageModal();
    }
  });
});

imageModalClose.addEventListener('click', () => imageModal.close());
imageModal.addEventListener('click', (event) => {
  if (event.target === imageModal) imageModal.close();
});

window.addEventListener('keydown', (event) => {
  if (overview.open) {
    if (event.key === 'Escape') overview.close();
    return;
  }

  if (['ArrowRight', 'PageDown', ' '].includes(event.key)) {
    event.preventDefault();
    showSlide(current + 1);
  }

  if (['ArrowLeft', 'PageUp'].includes(event.key)) {
    event.preventDefault();
    showSlide(current - 1);
  }

  if (event.key === 'Home') showSlide(0);
  if (event.key === 'End') showSlide(slides.length - 1);
});

const fromHash = slides.findIndex((slide) => slide.id === location.hash.slice(1));
showSlide(fromHash === -1 ? 0 : fromHash);
