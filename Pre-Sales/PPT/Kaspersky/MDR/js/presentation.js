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
  let activeIndex = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  let presenterWindow = null;

  const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('html_ppt_presenter') : null;

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

  const getPresenterPayload = () => {
    const currentNotes = slides[activeIndex].querySelector('.speaker-notes')?.innerHTML || '<p>Sin notas registradas para esta diapositiva.</p>';
    const nextTitle = activeIndex < slides.length - 1 ? (slides[activeIndex + 1].querySelector('h1, h2')?.textContent || `Diapositiva ${activeIndex + 2}`) : 'Fin de la presentación';
    return {
      type: 'UPDATE_PRESENTER',
      index: activeIndex,
      total: slides.length,
      notes: currentNotes,
      nextTitle: nextTitle
    };
  };

  const updateControls = () => {
    currentSlide.textContent = String(activeIndex + 1).padStart(2, '0');
    progressBar.style.width = `${((activeIndex + 1) / slides.length) * 100}%`;
    previousButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === slides.length - 1;
    if (slideSelect) slideSelect.value = activeIndex;

    if (channel) {
      channel.postMessage(getPresenterPayload());
    }
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

  const openPresenterMode = () => {
    if (presenterWindow && !presenterWindow.closed) {
      presenterWindow.focus();
      return;
    }

    presenterWindow = window.open('', 'PresenterMode', 'width=950,height=650,resizable=yes');
    if (!presenterWindow) return;

    const currentNotes = slides[activeIndex].querySelector('.speaker-notes')?.innerHTML || 'Sin notas registradas para esta diapositiva.';
    const nextTitle = activeIndex < slides.length - 1 ? (slides[activeIndex + 1].querySelector('h1, h2')?.textContent || `Diapositiva ${activeIndex + 2}`) : 'Fin de la presentación';

    presenterWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Modo Presentador - Kaspersky MDR</title>
        <style>
          body { margin: 0; font-family: Inter, sans-serif; background: #00153D; color: #FFFFFF; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
          header { display: flex; justify-content: space-between; align-items: center; background: #00205C; padding: 1rem 1.5rem; border-bottom: 2px solid #5FFFE5; }
          header h1 { margin: 0; font-size: 1.2rem; color: #5FFFE5; }
          .timer { font-size: 1.5rem; font-weight: 800; color: #5FFFE5; font-family: monospace; }
          .grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 1.5rem; padding: 1.5rem; flex: 1; overflow: hidden; }
          .card { background: rgba(255,255,255,0.06); border: 1px solid rgba(95,255,229,0.3); border-radius: 12px; padding: 1.2rem; display: flex; flex-direction: column; overflow: auto; }
          .card h2 { margin-top: 0; font-size: 1rem; color: #5FFFE5; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; }
          .notes-content { font-size: 1rem; line-height: 1.6; color: #E5E9F0; flex: 1; }
          .next-preview { font-size: 1.1rem; font-weight: 700; color: #FFFFFF; }
          footer { display: flex; gap: 1rem; padding: 1rem 1.5rem; background: #00205C; justify-content: center; }
          button { background: #005CFF; color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 1rem; }
          button:disabled { opacity: 0.4; cursor: not-allowed; }
          button:hover:not(:disabled) { background: #5FFFE5; color: #00205C; }
        </style>
      </head>
      <body>
        <header>
          <h1>Modo Presentador | GMS - Kaspersky MDR</h1>
          <div class="timer" id="clock">00:00:00</div>
        </header>
        <div class="grid">
          <div class="card">
            <h2>Diapositiva Actual (<span id="slideIdx">${String(activeIndex + 1).padStart(2, '0')}</span> / ${String(slides.length).padStart(2, '0')})</h2>
            <div class="notes-content" id="notesBox">${currentNotes}</div>
          </div>
          <div class="card">
            <h2>Siguiente Diapositiva</h2>
            <div class="next-preview" id="nextBox">${nextTitle}</div>
          </div>
        </div>
        <footer>
          <button id="pBtn">← Anterior</button>
          <button id="nBtn">Siguiente →</button>
        </footer>
        <script>
          let seconds = 0;
          setInterval(() => {
            seconds++;
            const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
            const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
            const s = String(seconds % 60).padStart(2, '0');
            document.getElementById('clock').textContent = \`\${h}:\${m}:\${s}\`;
          }, 1000);

          const bc = new BroadcastChannel('html_ppt_presenter');
          document.getElementById('pBtn').onclick = () => bc.postMessage({ type: 'PREV' });
          document.getElementById('nBtn').onclick = () => bc.postMessage({ type: 'NEXT' });

          document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
              e.preventDefault();
              bc.postMessage({ type: 'NEXT' });
            } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
              e.preventDefault();
              bc.postMessage({ type: 'PREV' });
            }
          });

          bc.onmessage = (event) => {
            if (event.data.type === 'UPDATE_PRESENTER') {
              document.getElementById('slideIdx').textContent = String(event.data.index + 1).padStart(2, '0');
              document.getElementById('notesBox').innerHTML = event.data.notes;
              document.getElementById('nextBox').textContent = event.data.nextTitle;
            }
          };

          bc.postMessage({ type: 'REQUEST_UPDATE' });
        </script>
      </body>
      </html>
    `);

    presenterWindow.document.close();
  };

  if (channel) {
    channel.onmessage = (event) => {
      if (event.data.type === 'NAVIGATE') {
        if (event.data.index !== activeIndex) {
          showSlide(event.data.index);
        }
      } else if (event.data.type === 'PREV') {
        showSlide(activeIndex - 1);
      } else if (event.data.type === 'NEXT') {
        showSlide(activeIndex + 1);
      } else if (event.data.type === 'REQUEST_UPDATE') {
        channel.postMessage(getPresenterPayload());
      }
    };
  }

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
    if (event.key === 'p' || event.key === 'P') openPresenterMode();
    if (event.key === 'f' || event.key === 'F') toggleFullscreen();
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
