(() => {
  let isEnabled = false;
  let activeTool = 'pen'; // 'pen', 'laser', 'line', 'arrow', 'rect', 'square', 'circle', 'oval'
  let strokeColor = '#5FFFE5';
  let strokeWidth = 3;
  let isDrawing = false;
  let startX = 0;
  let startY = 0;
  let snapshot = null;

  // Create Canvas Element
  const canvas = document.createElement('canvas');
  canvas.id = 'drawingCanvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = '100';
  canvas.style.pointerEvents = 'none';
  canvas.style.display = 'none';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Laser Pointer Element
  const laser = document.createElement('div');
  laser.id = 'laserPointer';
  laser.style.position = 'fixed';
  laser.style.width = '16px';
  laser.style.height = '16px';
  laser.style.borderRadius = '50%';
  laser.style.background = '#FF4D4D';
  laser.style.boxShadow = '0 0 15px #FF4D4D, 0 0 30px #FF4D4D';
  laser.style.pointerEvents = 'none';
  laser.style.zIndex = '101';
  laser.style.transform = 'translate(-50%, -50%)';
  laser.style.display = 'none';
  document.body.appendChild(laser);

  // Floating Drawing Toolbar
  const toolbar = document.createElement('div');
  toolbar.id = 'drawingToolbar';
  toolbar.className = 'glass-panel';
  toolbar.style.position = 'fixed';
  toolbar.style.top = '1.2rem';
  toolbar.style.left = '50%';
  toolbar.style.transform = 'translateX(-50%)';
  toolbar.style.zIndex = '102';
  toolbar.style.display = 'none';
  toolbar.style.alignItems = 'center';
  toolbar.style.gap = '0.5rem';
  toolbar.style.padding = '0.4rem 0.8rem';
  toolbar.style.borderRadius = '12px';
  toolbar.style.border = '1px solid var(--gms-aqua)';
  toolbar.style.background = 'rgba(0, 32, 92, 0.9)';
  toolbar.style.backdropFilter = 'blur(16px)';
  toolbar.style.boxShadow = '0 8px 32px rgba(0, 92, 255, 0.4)';

  toolbar.innerHTML = `
    <style>
      .dt-btn { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #FFF; padding: 0.35rem 0.55rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.3rem; transition: all 200ms; }
      .dt-btn:hover, .dt-btn.active { border-color: #5FFFE5; background: rgba(95,255,229,0.2); color: #5FFFE5; box-shadow: 0 0 10px rgba(95,255,229,0.4); }
      .dt-colors { display: flex; gap: 0.3rem; align-items: center; border-left: 1px solid rgba(255,255,255,0.15); padding-left: 0.5rem; }
      .dt-color { width: 18px; height: 18px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: transform 150ms; }
      .dt-color:hover, .dt-color.active { transform: scale(1.2); border-color: #FFF; }
    </style>
    <button class="dt-btn active" data-tool="pen" title="Lápiz / Pluma">✏️ Lápiz</button>
    <button class="dt-btn" data-tool="laser" title="Puntero Láser">🔴 Láser</button>
    <button class="dt-btn" data-tool="line" title="Línea recta">➖ Línea</button>
    <button class="dt-btn" data-tool="arrow" title="Flecha">➔ Flecha</button>
    <button class="dt-btn" data-tool="rect" title="Rectángulo">▭ Rectángulo</button>
    <button class="dt-btn" data-tool="square" title="Cuadrado">⬜ Cuadrado</button>
    <button class="dt-btn" data-tool="circle" title="Círculo">⭕ Círculo</button>
    <button class="dt-btn" data-tool="oval" title="Óvalo">⬭ Óvalo</button>
    <div class="dt-colors">
      <div class="dt-color active" style="background: #5FFFE5;" data-color="#5FFFE5"></div>
      <div class="dt-color" style="background: #FF4D4D;" data-color="#FF4D4D"></div>
      <div class="dt-color" style="background: #FFCC00;" data-color="#FFCC00"></div>
      <div class="dt-color" style="background: #FFFFFF;" data-color="#FFFFFF"></div>
      <div class="dt-color" style="background: #005CFF;" data-color="#005CFF"></div>
    </div>
    <button class="dt-btn" id="dtClear" title="Limpiar trazos">🗑️ Limpiar</button>
    <button class="dt-btn" id="dtClose" title="Cerrar barra (D)">✕</button>
  `;

  document.body.appendChild(toolbar);

  // Toggle Functionality with Key D / d
  const toggleDrawingMode = () => {
    isEnabled = !isEnabled;
    toolbar.style.display = isEnabled ? 'flex' : 'none';
    canvas.style.display = isEnabled ? 'block' : 'none';
    canvas.style.pointerEvents = (isEnabled && activeTool !== 'laser') ? 'auto' : 'none';
    if (!isEnabled) {
      laser.style.display = 'none';
    } else {
      setTool(activeTool);
    }
  };

  const setTool = (tool) => {
    activeTool = tool;
    toolbar.querySelectorAll('.dt-btn[data-tool]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });

    if (activeTool === 'laser') {
      canvas.style.pointerEvents = 'none';
      laser.style.display = isEnabled ? 'block' : 'none';
    } else {
      laser.style.display = 'none';
      canvas.style.pointerEvents = isEnabled ? 'auto' : 'none';
    }
  };

  // Event Listeners for Toolbar Buttons
  toolbar.addEventListener('click', (e) => {
    const toolBtn = e.target.closest('[data-tool]');
    if (toolBtn) {
      setTool(toolBtn.dataset.tool);
    }

    const colorBtn = e.target.closest('[data-color]');
    if (colorBtn) {
      strokeColor = colorBtn.dataset.color;
      toolbar.querySelectorAll('.dt-color').forEach(c => c.classList.remove('active'));
      colorBtn.classList.add('active');
    }
  });

  document.getElementById('dtClear').onclick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  document.getElementById('dtClose').onclick = () => {
    toggleDrawingMode();
  };

  // Mouse Movement & Drawing Logic
  document.addEventListener('mousemove', (e) => {
    if (isEnabled && activeTool === 'laser') {
      laser.style.left = `${e.clientX}px`;
      laser.style.top = `${e.clientY}px`;
    }
  });

  canvas.addEventListener('mousedown', (e) => {
    if (!isEnabled || activeTool === 'laser') return;
    isDrawing = true;
    startX = e.clientX;
    startY = e.clientY;

    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (activeTool === 'pen') {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
    } else {
      snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing || !isEnabled || activeTool === 'laser') return;

    const currentX = e.clientX;
    const currentY = e.clientY;

    if (activeTool === 'pen') {
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
    } else {
      ctx.putImageData(snapshot, 0, 0);
      ctx.beginPath();

      if (activeTool === 'line') {
        ctx.moveTo(startX, startY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
      } else if (activeTool === 'arrow') {
        ctx.moveTo(startX, startY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();

        const angle = Math.atan2(currentY - startY, currentX - startX);
        const headLen = 14;
        ctx.beginPath();
        ctx.moveTo(currentX, currentY);
        ctx.lineTo(currentX - headLen * Math.cos(angle - Math.PI / 6), currentY - headLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(currentX - headLen * Math.cos(angle + Math.PI / 6), currentY - headLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fillStyle = strokeColor;
        ctx.fill();
      } else if (activeTool === 'rect') {
        ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);
      } else if (activeTool === 'square') {
        const side = Math.max(Math.abs(currentX - startX), Math.abs(currentY - startY));
        const signX = currentX >= startX ? 1 : -1;
        const signY = currentY >= startY ? 1 : -1;
        ctx.strokeRect(startX, startY, side * signX, side * signY);
      } else if (activeTool === 'circle') {
        const radius = Math.hypot(currentX - startX, currentY - startY);
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (activeTool === 'oval') {
        const radiusX = Math.abs(currentX - startX) / 2;
        const radiusY = Math.abs(currentY - startY) / 2;
        const centerX = startX + (currentX - startX) / 2;
        const centerY = startY + (currentY - startY) / 2;
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  });

  canvas.addEventListener('mouseup', () => {
    isDrawing = false;
  });

  // Global Keydown Listener for D / d
  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.target.matches('input, textarea, select')) return;
    if (e.key === 'd' || e.key === 'D') {
      toggleDrawingMode();
    }
  });
})();
