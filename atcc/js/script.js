/**
 * JavaScript para el Portal Web de Presentación sobre Detección de Phishing
 * Funcionalidad de navegación entre slides y animaciones
 */

// Variables globales
let currentSlide = 1;
const totalSlides = 12;
const slides = document.querySelectorAll('.slide');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const currentSlideSpan = document.getElementById('currentSlide');
const totalSlidesSpan = document.getElementById('totalSlides');

// Función para mostrar un slide específico
function showSlide(slideNumber) {
    // Validar límites
    if (slideNumber < 1 || slideNumber > totalSlides) {
        return;
    }

    // Ocultar todos los slides
    slides.forEach(slide => {
        slide.classList.remove('active');
    });

    // Mostrar el slide actual
    const targetSlide = document.getElementById(`slide${slideNumber}`);
    if (targetSlide) {
        targetSlide.classList.add('active');
    }

    // Actualizar contador
    currentSlide = slideNumber;
    currentSlideSpan.textContent = currentSlide;

    // Actualizar estado de los botones
    updateNavigationButtons();

    // Actualizar URL hash para navegación directa (opcional)
    updateURLHash();
}

// Función para actualizar el estado de los botones de navegación
function updateNavigationButtons() {
    // Botón anterior
    if (currentSlide === 1) {
        prevBtn.disabled = true;
        prevBtn.style.opacity = '0.5';
    } else {
        prevBtn.disabled = false;
        prevBtn.style.opacity = '1';
    }

    // Botón siguiente
    if (currentSlide === totalSlides) {
        nextBtn.disabled = true;
        nextBtn.style.opacity = '0.5';
    } else {
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
    }
}

// Función para actualizar el hash de la URL
function updateURLHash() {
    if (window.history.replaceState) {
        window.history.replaceState(null, null, `#slide${currentSlide}`);
    }
}

// Función para ir al slide anterior
function goToPreviousSlide() {
    if (currentSlide > 1) {
        showSlide(currentSlide - 1);
    }
}

// Función para ir al slide siguiente
function goToNextSlide() {
    if (currentSlide < totalSlides) {
        showSlide(currentSlide + 1);
    }
}

// Función para manejar navegación por teclado
function handleKeyboardNavigation(event) {
    switch(event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
            event.preventDefault();
            goToPreviousSlide();
            break;
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ': // Espacio
            event.preventDefault();
            goToNextSlide();
            break;
        case 'Home':
            event.preventDefault();
            showSlide(1);
            break;
        case 'End':
            event.preventDefault();
            showSlide(totalSlides);
            break;
    }
}

// Función para manejar navegación por touch/swipe
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(event) {
    touchStartX = event.changedTouches[0].screenX;
}

function handleTouchEnd(event) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipe();
}

function handleSwipe() {
    const swipeThreshold = 50; // Mínimo desplazamiento para considerar swipe
    const swipeDistance = touchStartX - touchEndX;

    if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
            // Swipe izquierda - siguiente slide
            goToNextSlide();
        } else {
            // Swipe derecha - slide anterior
            goToPreviousSlide();
        }
    }
}

// Función para inicializar la presentación
function initializePresentation() {
    // Establecer total de slides
    totalSlidesSpan.textContent = totalSlides;

    // Verificar si hay un hash en la URL para navegación directa
    const urlHash = window.location.hash;
    if (urlHash && urlHash.startsWith('#slide')) {
        const slideNumber = parseInt(urlHash.replace('#slide', ''));
        if (slideNumber >= 1 && slideNumber <= totalSlides) {
            currentSlide = slideNumber;
        }
    }

    // Mostrar slide inicial
    showSlide(currentSlide);

    // Agregar event listeners
    setupEventListeners();
}

// Función para configurar event listeners
function setupEventListeners() {
    // Botones de navegación
    prevBtn.addEventListener('click', goToPreviousSlide);
    nextBtn.addEventListener('click', goToNextSlide);

    // Navegación por teclado
    document.addEventListener('keydown', handleKeyboardNavigation);

    // Navegación por touch/swipe
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Prevenir zoom en doble tap en móviles
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    // Manejar cambios en el hash de la URL
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#slide')) {
            const slideNumber = parseInt(hash.replace('#slide', ''));
            if (slideNumber >= 1 && slideNumber <= totalSlides) {
                showSlide(slideNumber);
            }
        }
    });
}

// Función para agregar animaciones de entrada
function addEntranceAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationDelay = '0.2s';
                entry.target.style.animationFillMode = 'both';
                entry.target.classList.add('animate__animated', 'animate__fadeInUp');
            }
        });
    }, observerOptions);

    // Observar elementos que deberían animarse
    document.querySelectorAll('.impact-card, .recommendation-card, .stat-card').forEach(card => {
        observer.observe(card);
    });
}

// Función para manejar el modo de pantalla completa (opcional)
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Función para mostrar/ocultar controles de navegación (útil para modo presentación)
function toggleNavigationControls() {
    const navigation = document.querySelector('.slide-navigation');
    navigation.classList.toggle('hidden');
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    initializePresentation();
    addEntranceAnimations();

    // Log para debugging (puede removerse en producción)
    console.log('Portal de Presentación sobre Phishing inicializado');
    console.log(`Total de slides: ${totalSlides}`);
});

// Funciones de utilidad para desarrolladores
window.presentationAPI = {
    goToSlide: showSlide,
    getCurrentSlide: () => currentSlide,
    getTotalSlides: () => totalSlides,
    toggleFullscreen: toggleFullscreen,
    toggleNavigation: toggleNavigationControls
};