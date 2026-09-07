(() => {
  let presenterWindow = null;
  const slides = () => [...document.querySelectorAll('[data-slide]')];
  const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('html_ppt_presenter') : null;

  const getPresenterPayload = (activeIndex) => {
    const slideList = slides();
    const currentSlide = slideList[activeIndex];
    const currentNotes = currentSlide ? (currentSlide.querySelector('.speaker-notes')?.innerHTML || '<p>Sin notas registradas para esta diapositiva.</p>') : '';
    const nextTitle = activeIndex < slideList.length - 1 ? (slideList[activeIndex + 1].querySelector('h1, h2')?.textContent || `Diapositiva ${activeIndex + 2}`) : 'Fin de la presentación';
    return {
      type: 'UPDATE_PRESENTER',
      index: activeIndex,
      total: slideList.length,
      notes: currentNotes,
      nextTitle: nextTitle
    };
  };

  const sendUpdate = (index) => {
    if (channel) {
      channel.postMessage(getPresenterPayload(index));
    }
  };

  const openPresenterMode = (activeIndex) => {
    const slideList = slides();
    if (presenterWindow && !presenterWindow.closed) {
      presenterWindow.focus();
      sendUpdate(activeIndex);
      return;
    }

    presenterWindow = window.open('', 'PresenterMode', 'width=950,height=650,resizable=yes');
    if (!presenterWindow) return;

    const currentNotes = slideList[activeIndex]?.querySelector('.speaker-notes')?.innerHTML || 'Sin notas registradas para esta diapositiva.';
    const nextTitle = activeIndex < slideList.length - 1 ? (slideList[activeIndex + 1]?.querySelector('h1, h2')?.textContent || `Diapositiva ${activeIndex + 2}`) : 'Fin de la presentación';

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
          .header-tools { display: flex; align-items: center; gap: 1rem; }
          .p-slide-select { background: #00153D; color: #5FFFE5; border: 1px solid #5FFFE5; padding: 0.45rem 0.8rem; border-radius: 8px; font-weight: 600; outline: none; cursor: pointer; max-width: 250px; text-overflow: ellipsis; }
          .p-slide-select option { background: #00205C; color: #FFFFFF; }
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
          <div class="header-tools">
            <select class="p-slide-select" id="pSlideSelect" aria-label="Seleccionar diapositiva">
              ${slideList.map((s, idx) => {
                const t = s.querySelector('h1, h2')?.textContent.trim().replace(/\s+/g, ' ') || `Diapositiva ${idx + 1}`;
                return `<option value="${idx}">${String(idx + 1).padStart(2, '0')}. ${t}</option>`;
              }).join('')}
            </select>
            <div class="timer" id="clock">00:00:00</div>
          </div>
        </header>
        <div class="grid">
          <div class="card">
            <h2>Diapositiva Actual (<span id="slideIdx">${String(activeIndex + 1).padStart(2, '0')}</span> / ${String(slideList.length).padStart(2, '0')})</h2>
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
          const pSelect = document.getElementById('pSlideSelect');
          pSelect.value = ${activeIndex};
          pSelect.onchange = (e) => {
            bc.postMessage({ type: 'NAVIGATE', index: parseInt(e.target.value, 10) });
          };

          document.getElementById('pBtn').onclick = () => bc.postMessage({ type: 'PREV' });
          document.getElementById('nBtn').onclick = () => bc.postMessage({ type: 'NEXT' });

          document.addEventListener('keydown', (e) => {
            if (e.target.matches('select, input, textarea')) return;
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
              if (pSelect) pSelect.value = event.data.index;
            }
          };

          bc.postMessage({ type: 'REQUEST_UPDATE' });
        </script>
      </body>
      </html>
    `);

    presenterWindow.document.close();
  };

  // Listen to Slide Navigation Events
  window.addEventListener('slidechanged', (e) => {
    sendUpdate(e.detail.index);
  });

  // Listen to BroadcastChannel Messages from Presenter Window
  if (channel) {
    channel.onmessage = (event) => {
      if (event.data.type === 'REQUEST_UPDATE') {
        const currentIdx = window.getCurrentSlideIndex ? window.getCurrentSlideIndex() : 0;
        sendUpdate(currentIdx);
      } else if (event.data.type === 'PREV') {
        const currentIdx = window.getCurrentSlideIndex ? window.getCurrentSlideIndex() : 0;
        if (window.showSlideIndex) window.showSlideIndex(currentIdx - 1);
      } else if (event.data.type === 'NEXT') {
        const currentIdx = window.getCurrentSlideIndex ? window.getCurrentSlideIndex() : 0;
        if (window.showSlideIndex) window.showSlideIndex(currentIdx + 1);
      } else if (event.data.type === 'NAVIGATE') {
        if (window.showSlideIndex) window.showSlideIndex(event.data.index);
      }
    };
  }

  // Keydown Listener for P / p
  document.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.target.matches('input, textarea, select, button')) return;
    if (event.key === 'p' || event.key === 'P') {
      const currentIdx = window.getCurrentSlideIndex ? window.getCurrentSlideIndex() : 0;
      openPresenterMode(currentIdx);
    }
  });

  window.openPresenterMode = openPresenterMode;
})();
