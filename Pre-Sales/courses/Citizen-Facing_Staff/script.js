document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const menuToggle = document.getElementById('menuToggle');
    const slides = document.querySelectorAll('.slide');
    const navItems = document.querySelectorAll('.nav-item');
    const totalSlides = slides.length;
    const progressBar = document.getElementById('progressBar');
    const currentSlideEl = document.getElementById('currentSlide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    const helpModalClose = document.getElementById('helpModalClose');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const fullscreenIcon = document.getElementById('fullscreenIcon');
    const fullscreenToast = document.getElementById('fullscreenToast');
    const timerDisplay = document.getElementById('timerDisplay');
    const quickRefBtn = document.getElementById('quickRefBtn');
    const quickRefPanel = document.getElementById('quickRefPanel');
    const quickRefClose = document.getElementById('quickRefClose');
    
    let currentSlide = 0;
    let timerInterval = null;
    let elapsedSeconds = 0;
    let isFullscreen = false;
    let quickRefOpen = false;
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon();
    
    function toggleSidebar() {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('open');
    }
    
    function closeSidebar() {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('open');
    }
    
    menuToggle.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);
    
    function updateThemeIcon() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        themeIcon.className = currentTheme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
    }
    
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon();
    }
    
    themeToggle.addEventListener('click', toggleTheme);
    
    function updateProgress() {
        const progress = ((currentSlide + 1) / totalSlides) * 100;
        progressBar.style.width = progress + '%';
        currentSlideEl.textContent = currentSlide + 1;
    }
    
    function updateButtons() {
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === totalSlides - 1;
    }
    
    function updateActiveNavItem() {
        navItems.forEach((item, index) => {
            item.classList.toggle('active', index === currentSlide);
        });
        const activeItem = document.querySelector('.nav-item.active');
        if (activeItem) {
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
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
    
    function nextSlide() {
        if (currentSlide < totalSlides - 1) goToSlide(currentSlide + 1);
    }
    
    function prevSlide() {
        if (currentSlide > 0) goToSlide(currentSlide - 1);
    }
    
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);
    
    navItems.forEach((item, index) => {
        item.addEventListener('click', () => goToSlide(index));
    });
    
    function toggleHelpModal() {
        helpModal.classList.toggle('open');
    }
    
    helpBtn.addEventListener('click', toggleHelpModal);
    helpModalClose.addEventListener('click', () => helpModal.classList.remove('open'));
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) helpModal.classList.remove('open');
    });
    
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
    
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            isFullscreen = false;
            fullscreenIcon.className = 'bi bi-arrows-fullscreen';
        }
    });
    
    function showFullscreenToast(message) {
        fullscreenToast.textContent = message;
        fullscreenToast.classList.add('show');
        setTimeout(() => fullscreenToast.classList.remove('show'), 2000);
    }
    
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    function startTimer() {
        if (!timerInterval) {
            timerInterval = setInterval(() => {
                elapsedSeconds++;
                timerDisplay.textContent = formatTime(elapsedSeconds);
            }, 1000);
        }
    }
    
    startTimer();
    
    function toggleQuickRef() {
        quickRefOpen = !quickRefOpen;
        quickRefPanel.classList.toggle('open', quickRefOpen);
    }
    
    const iframeModal = document.getElementById('iframeModal');
    const iframeContent = document.getElementById('iframeContent');
    const iframeModalClose = document.getElementById('iframeModalClose');
    
    document.querySelectorAll('.btn-iframe-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.getAttribute('data-url');
            iframeContent.src = url;
            iframeModal.classList.add('open');
        });
    });
    
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
    
    document.addEventListener('keydown', function(e) {
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
    
    const observerOptions = {
        root: null,
        rootMargin: '-40% 0px -40% 0px',
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
    
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', (e) => {
        if (e.target.closest('.sidebar') || e.target.closest('.help-modal') || e.target.closest('.quick-ref-panel') || e.target.closest('.iframe-modal')) return;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        if (e.target.closest('.sidebar') || e.target.closest('.help-modal') || e.target.closest('.quick-ref-panel') || e.target.closest('.iframe-modal')) return;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const diff = touchStartY - touchEndY;
        if (Math.abs(diff) > 50) {
            diff > 0 ? nextSlide() : prevSlide();
        }
    }
    
    const iframeModal = document.getElementById('iframeModal');
    const iframeContent = document.getElementById('iframeContent');
    const iframeModalClose = document.getElementById('iframeModalClose');
    
    document.querySelectorAll('.btn-iframe-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.getAttribute('data-url');
            iframeContent.src = url;
            iframeModal.classList.add('open');
        });
    });
    
    function closeIframeModal() {
        iframeModal.classList.remove('open');
        iframeContent.src = '';
    }
    
    iframeModalClose.addEventListener('click', closeIframeModal);
    iframeModal.querySelector('.iframe-modal-backdrop').addEventListener('click', closeIframeModal);
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && iframeModal.classList.contains('open')) {
            closeIframeModal();
        }
    });

    updateProgress();
    updateButtons();
    updateActiveNavItem();
    
    if (slides.length > 0) {
        setTimeout(() => slides[0].classList.add('visible'), 100);
    }
    
    const style = document.createElement('style');
    style.textContent = `
        .main-content.sidebar-open { margin-left: 280px; }
        @media (max-width: 768px) { .main-content.sidebar-open { margin-left: 0; } }
    `;
    document.head.appendChild(style);
});