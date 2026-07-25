/**
 * ============================================================
 * GMS Presentation - script.js
 * ============================================================
 * Controlador principal de la presentación de diapositivas.
 * Maneja navegación, tema, temporizador, atajos de teclado
 * y animaciones.
 * 
 * FUNCIONALIDADES:
 * - Navegación entre slides (click, teclado, swipe)
 * - Sidebar de navegación lateral
 * - Cambio de tema claro/oscuro (persistente en localStorage)
 * - Temporizador de presentación
 * - Pantalla completa
 * - Panel de referencia rápida
 * - Modal de ayuda con atajos
 * - Modal de iframe (ejemplos externos)
 * - Intersection Observer para detectar slides visibles
 * - Efecto de cursor fluido (SplashCursor)
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', function() {
    // ============================================================
    // ELEMENTOS DEL DOM
    // ============================================================
    
    // Sidebar y overlay
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const menuToggle = document.getElementById('menuToggle');
    
    // Slides y navegación
    const slides = document.querySelectorAll('.slide');
    const navItems = document.querySelectorAll('.nav-item');
    const totalSlides = slides.length;
    const progressBar = document.getElementById('progressBar');
    const currentSlideEl = document.getElementById('currentSlide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // Tema
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    
    // Ayuda y pantalla completa
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    const helpModalClose = document.getElementById('helpModalClose');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const fullscreenIcon = document.getElementById('fullscreenIcon');
    const fullscreenToast = document.getElementById('fullscreenToast');
    
    // Timer
    const timerDisplay = document.getElementById('timerDisplay');
    
    // Panel de referencia rápida
    const quickRefBtn = document.getElementById('quickRefBtn');
    const quickRefPanel = document.getElementById('quickRefPanel');
    const quickRefClose = document.getElementById('quickRefClose');
    
    // ============================================================
    // VARIABLES DE ESTADO
    // ============================================================
    
    let currentSlide = 0;          // Índice del slide actual (0-indexed)
    let timerInterval = null;       // Referencia al interval del timer
    let elapsedSeconds = 0;         // Segundos transcurridos
    let isFullscreen = false;        // Estado de pantalla completa
    let quickRefOpen = false;       // Estado del panel de referencia
    
    // ============================================================
    // INICIALIZACIÓN DEL TEMA
    // Recupera el tema guardado en localStorage o usa 'light' por defecto.
    // El atributo data-theme en <html> controla los colores CSS.
    // ============================================================
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon();
    
    // ============================================================
    // FUNCIONES DEL SIDEBAR
    // ============================================================
    
    /**
     * Alterna la visibilidad del sidebar añadiendo/removiendo
     * la clase 'open'. Incluye el overlay oscuro de fondo.
     */
    function toggleSidebar() {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('open');
    }
    
    /**
     * Cierra el sidebar removiendo la clase 'open' de ambos
     * elementos (sidebar y overlay).
     */
    function closeSidebar() {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('open');
    }
    
    // Eventos del sidebar
    menuToggle.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);
    
    // ============================================================
    // FUNCIONES DE TEMA (CLARO/OSCURO)
    // El tema se guarda en localStorage para persistencia.
    // ============================================================
    
    /**
     * Actualiza el icono del botón de tema según el tema actual.
     * Luna = tema oscuro activo, Sol = tema claro activo.
     */
    function updateThemeIcon() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        themeIcon.className = currentTheme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
    }
    
    /**
     * Alterna entre tema claro y oscuro.
     * Guarda la preferencia en localStorage.
     */
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon();
    }
    
    themeToggle.addEventListener('click', toggleTheme);
    
    // ============================================================
    // FUNCIONES DE NAVEGACIÓN Y PROGRESO
    // ============================================================
    
    /**
     * Actualiza la barra de progreso superior y el contador
     * de slides. Se llama cada vez que cambia el slide actual.
     */
    function updateProgress() {
        const progress = ((currentSlide + 1) / totalSlides) * 100;
        progressBar.style.width = progress + '%';
        currentSlideEl.textContent = currentSlide + 1;
    }
    
    /**
     * Habilita/deshabilita los botones de navegación según
     * la posición actual (primero/último slide).
     */
    function updateButtons() {
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === totalSlides - 1;
    }
    
    /**
     * Actualiza el ítem activo en el sidebar de navegación.
     * Hace scroll automático al ítem activo si está fuera de vista.
     */
    function updateActiveNavItem() {
        navItems.forEach((item, index) => {
            item.classList.toggle('active', index === currentSlide);
        });
        const activeItem = document.querySelector('.nav-item.active');
        if (activeItem) {
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
    /**
     * Navega a un slide específico por índice.
     * - Valida que el índice esté en rango
     * - Hace scroll suave al slide
     * - Actualiza progreso, botones y navegación
     * - Agrega/quita clase 'visible' para animaciones
     */
    function goToSlide(index) {
        if (index < 0 || index >= totalSlides) return;
        currentSlide = index;
        const targetSlide = slides[currentSlide];
        targetSlide.scrollIntoView({ behavior: 'smooth', block: 'start' });
        updateProgress();
        updateButtons();
        updateActiveNavItem();
        setTimeout(() => {
            slides.forEach(slide => slide.classList.remove('visible'));
            targetSlide.classList.add('visible');
        }, 100);
    }
    
    /**
     * Avanza al siguiente slide si no está en el último.
     */
    function nextSlide() {
        if (currentSlide < totalSlides - 1) goToSlide(currentSlide + 1);
    }
    
    /**
     * Retrocede al slide anterior si no está en el primero.
     */
    function prevSlide() {
        if (currentSlide > 0) goToSlide(currentSlide - 1);
    }
    
    // Eventos de botones de navegación
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);
    
    // Navegación desde el sidebar
    navItems.forEach((item, index) => {
        item.addEventListener('click', () => goToSlide(index));
    });

    // Click en slide vacío para avanzar
    slides.forEach(slide => {
        slide.addEventListener('click', (e) => {
            // Solo avanza si se hace clic directamente en el slide (no en elementos hijos)
            if (e.target !== slide) return;
            nextSlide();
        });
    });
    
    // ============================================================
    // MODAL DE AYUDA
    // ============================================================
    
    /**
     * Alterna la visibilidad del modal de ayuda (atajos de teclado).
     */
    function toggleHelpModal() {
        helpModal.classList.toggle('open');
    }
    
    helpBtn.addEventListener('click', toggleHelpModal);
    helpModalClose.addEventListener('click', () => helpModal.classList.remove('open'));
    
    // Cerrar modal al hacer clic fuera del contenido
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) helpModal.classList.remove('open');
    });
    
    // ============================================================
    // PANTALLA COMPLETA
    // Usa la API Fullscreen del navegador.
    // ============================================================
    
    /**
     * Activa/desactiva el modo pantalla completa.
     * Muestra un toast informativo al cambiar.
     */
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                isFullscreen = true;
                fullscreenIcon.className = 'bi bi-fullscreen-exit';
                showFullscreenToast('Modo pantalla completa activado');
            }).catch(() => showFullscreenToast('No se pudo activar pantalla completa'));
        } else {
            document.exitFullscreen().then(() => {
                isFullscreen = false;
                fullscreenIcon.className = 'bi bi-arrows-fullscreen';
                showFullscreenToast('Modo pantalla completa desactivado');
            });
        }
    }
    
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Sincroniza el icono si se sale de pantalla completa desde otro medio
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            isFullscreen = false;
            fullscreenIcon.className = 'bi bi-arrows-fullscreen';
        }
    });
    
    /**
     * Muestra un mensaje toast temporal en la parte superior.
     * @param {string} message - Mensaje a mostrar
     */
    function showFullscreenToast(message) {
        fullscreenToast.textContent = message;
        fullscreenToast.classList.add('show');
        setTimeout(() => fullscreenToast.classList.remove('show'), 2000);
    }
    
    // ============================================================
    // TEMPORIZADOR DE PRESENTACIÓN
    // Cuenta el tiempo transcurrido desde que se cargó la página.
    // ============================================================
    
    /**
     * Formatea segundos a MM:SS.
     * @param {number} seconds - Segundos totales
     * @returns {string} Tiempo formateado (ej: "05:30")
     */
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    /**
     * Inicia el interval que actualiza el timer cada segundo.
     */
    function startTimer() {
        if (!timerInterval) {
            timerInterval = setInterval(() => {
                elapsedSeconds++;
                timerDisplay.textContent = formatTime(elapsedSeconds);
            }, 1000);
        }
    }
    
    startTimer();
    
    // ============================================================
    // PANEL DE REFERENCIA RÁPIDA
    // Se despliega desde abajo con un resumen de key points.
    // ============================================================
    
    /**
     * Alterna la visibilidad del panel de referencia rápida.
     */
    function toggleQuickRef() {
        quickRefOpen = !quickRefOpen;
        quickRefPanel.classList.toggle('open', quickRefOpen);
    }
    
    quickRefBtn.addEventListener('click', toggleQuickRef);
    quickRefClose.addEventListener('click', () => {
        quickRefOpen = false;
        quickRefPanel.classList.remove('open');
    });
    
    // ============================================================
    // MODAL DE IFRAME
    // Permite mostrar páginas externas en un modal (ej: phishing).
    // ============================================================
    
    const iframeModal = document.getElementById('iframeModal');
    const iframeContent = document.getElementById('iframeContent');
    const iframeModalClose = document.getElementById('iframeModalClose');
    
    // Botones que abren el modal con URL específica
    document.querySelectorAll('.btn-iframe-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.getAttribute('data-url');
            iframeContent.src = url;
            iframeModal.classList.add('open');
        });
    });
    
    /**
     * Cierra el modal de iframe y limpia el src para
     * detener cualquier contenido que se esté cargando.
     */
    function closeIframeModal() {
        if (iframeModal) {
            iframeModal.classList.remove('open');
            iframeContent.src = '';
        }
    }
    
    if (iframeModalClose) {
        iframeModalClose.addEventListener('click', closeIframeModal);
        iframeModal.querySelector('.iframe-modal-backdrop').addEventListener('click', closeIframeModal);
    }
    
    // ============================================================
    // ATAJOS DE TECLADO
    // Ignora eventos si el foco está en inputs o textareas.
    // ============================================================
    
    document.addEventListener('keydown', function(e) {
        // Ignora si el usuario está escribiendo en un campo de texto
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch(e.key) {
            case 'ArrowRight':
            case ' ':
                e.preventDefault();
                nextSlide();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                prevSlide();
                break;
            case 'Home':
                e.preventDefault();
                goToSlide(0);
                break;
            case 'End':
                e.preventDefault();
                goToSlide(totalSlides - 1);
                break;
            case 'Escape':
                closeSidebar();
                helpModal.classList.remove('open');
                if (quickRefOpen) {
                    quickRefOpen = false;
                    quickRefPanel.classList.remove('open');
                }
                if (iframeModal && iframeModal.classList.contains('open')) {
                    closeIframeModal();
                }
                break;
            case 't':
            case 'T':
                toggleTheme();
                break;
            case 'f':
            case 'F':
                toggleFullscreen();
                break;
            case 'g':
            case 'G':
                toggleQuickRef();
                break;
            case 'm':
            case 'M':
                toggleSidebar();
                break;
        }
    });
    
    // ============================================================
    // INTERSECTION OBSERVER
    // Detecta qué slide está visible en el viewport y actualiza
    // el estado de navegación automáticamente al hacer scroll.
    // ============================================================
    
    const observerOptions = {
        root: null,                    // null = viewport
        rootMargin: '-40% 0px -40% 0px', // Zona central activa
        threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0) {
                const slideIndex = Array.from(slides).indexOf(entry.target);
                if (slideIndex !== currentSlide) {
                    currentSlide = slideIndex;
                    updateProgress();
                    updateButtons();
                    updateActiveNavItem();
                }
            }
        });
    }, observerOptions);
    
    slides.forEach(slide => observer.observe(slide));
    
    // ============================================================
    // GESTOS TÁCTILES (SWIPE) PARA MÓVIL
    // Detecta swipe arriba/abajo para navegar.
    // ============================================================
    
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', (e) => {
        // Ignora gestos en elementos que los usan (sidebar, modales)
        if (e.target.closest('.sidebar') || e.target.closest('.help-modal') || e.target.closest('.quick-ref-panel') || e.target.closest('.iframe-modal')) return;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        if (e.target.closest('.sidebar') || e.target.closest('.help-modal') || e.target.closest('.quick-ref-panel') || e.target.closest('.iframe-modal')) return;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });
    
    /**
     * Procesa el gesto de swipe.
     * Swipe hacia arriba = siguiente slide
     * Swipe hacia abajo = slide anterior
     */
    function handleSwipe() {
        const diff = touchStartY - touchEndY;
        if (Math.abs(diff) > 50) {
            diff > 0 ? nextSlide() : prevSlide();
        }
    }
    
    // ============================================================
    // INICIALIZACIÓN FINAL
    // ============================================================
    
    updateProgress();
    updateButtons();
    updateActiveNavItem();
    
    // Agrega clase 'visible' al primer slide con delay para animación
    if (slides.length > 0) {
        setTimeout(() => slides[0].classList.add('visible'), 100);
    }

    // Inicializa el efecto de cursor fluido si está disponible
    if (typeof SplashCursor !== 'undefined') {
        new SplashCursor();
    }
    
    // Agrega dinámicamente estilos para ajustar el main-content
    // cuando el sidebar está abierto (desktop).
    const style = document.createElement('style');
    style.textContent = `
        .main-content.sidebar-open { margin-left: 280px; }
        @media (max-width: 768px) { .main-content.sidebar-open { margin-left: 0; } }
    `;
    document.head.appendChild(style);
});