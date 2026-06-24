document.addEventListener('DOMContentLoaded', function() {
    initSidebar();
    initCodeCopy();
    initSmoothScroll();
    initProgressTracker();
});
function initSidebar() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.module-nav a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}
function initCodeCopy() {
    document.querySelectorAll('.code-block').forEach(block => {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '<i class="bi bi-clipboard"></i> Copiar';
        copyBtn.style.cssText = 'position:absolute;top:10px;right:10px;background:#374151;border:none;color:#fff;padding:5px 10px;border-radius:5px;cursor:pointer;font-size:0.8rem;';
        block.style.position = 'relative';
        block.appendChild(copyBtn);
        copyBtn.addEventListener('click', () => {
            const code = block.querySelector('code').textContent;
            navigator.clipboard.writeText(code).then(() => {
                copyBtn.innerHTML = '<i class="bi bi-check"></i> Copiado';
                setTimeout(() => { copyBtn.innerHTML = '<i class="bi bi-clipboard"></i> Copiar'; }, 2000);
            });
        });
    });
}
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}
function initProgressTracker() {
    const progressKey = 'powershell_course_progress';
    let progress = JSON.parse(localStorage.getItem(progressKey)) || {};
    const moduleLinks = document.querySelectorAll('.module-nav a');
    moduleLinks.forEach(link => {
        const moduleId = link.getAttribute('href');
        if (progress[moduleId]) {
            link.classList.add('completed');
        }
    });
    document.querySelectorAll('.mark-complete').forEach(btn => {
        btn.addEventListener('click', function() {
            const moduleId = this.dataset.module;
            progress[moduleId] = true;
            localStorage.setItem(progressKey, JSON.stringify(progress));
            this.innerHTML = '<i class="bi bi-check-circle"></i> Completado';
            this.disabled = true;
            const link = document.querySelector(`.module-nav a[href="${moduleId}"]`);
            if (link) link.classList.add('completed');
        });
    });
}
function resetProgress() {
    localStorage.removeItem('powershell_course_progress');
    location.reload();
}
function updateProgress(moduleId) {
    const progressKey = 'powershell_course_progress';
    let progress = JSON.parse(localStorage.getItem(progressKey)) || {};
    progress[moduleId] = true;
    localStorage.setItem(progressKey, JSON.stringify(progress));
}