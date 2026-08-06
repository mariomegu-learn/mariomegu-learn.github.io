"use strict";

/* ==========================================================
   ELEMENTOS DEL DOM
   ========================================================== */

const presentationApp = document.getElementById("presentationApp");

const slideStage = document.getElementById("slideStage");
const slideViewport = document.getElementById("slideViewport");

const slides = Array.from(document.querySelectorAll(".slide"));

const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");

const slideCounter = document.getElementById("slideCounter");
const cornerSlideNumber = document.getElementById("cornerSlideNumber");

const menuButton = document.getElementById("menuButton");
const slidesSidebar = document.getElementById("slidesSidebar");
const closeSidebarButton = document.getElementById("closeSidebarButton");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const thumbnailsContainer = document.getElementById(
    "thumbnailsContainer"
);

const themeButton = document.getElementById("themeButton");
const moonIcon = document.getElementById("moonIcon");
const sunIcon = document.getElementById("sunIcon");

const helpButton = document.getElementById("helpButton");
const helpModal = document.getElementById("helpModal");
const closeHelpButton = document.getElementById("closeHelpButton");

const fullscreenButton = document.getElementById(
    "fullscreenButton"
);

const presentationTimer = document.getElementById(
    "presentationTimer"
);

/* ==========================================================
   ESTADO DE LA APLICACIÓN
   ========================================================== */

const PRESENTATION_WIDTH = 1920;
const PRESENTATION_HEIGHT = 1080;

let currentSlideIndex = 0;
let elapsedSeconds = 0;
let sidebarIsOpen = false;

/* ==========================================================
   INICIALIZACIÓN
   ========================================================== */

function initializePresentation() {
    createThumbnails();
    restoreTheme();
    showSlide(0);
    resizeSlideStage();
    startPresentationTimer();

    window.addEventListener("resize", resizeSlideStage);
}

document.addEventListener(
    "DOMContentLoaded",
    initializePresentation
);

/* ==========================================================
   NAVEGACIÓN ENTRE DIAPOSITIVAS
   ========================================================== */

function showSlide(index) {
    const safeIndex = Math.max(
        0,
        Math.min(index, slides.length - 1)
    );

    currentSlideIndex = safeIndex;

    slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === currentSlideIndex;

        slide.classList.toggle("active-slide", isActive);
        slide.setAttribute(
            "aria-hidden",
            String(!isActive)
        );
    });

    updateNavigationControls();
    updateThumbnailSelection();
}

function nextSlide() {
    if (currentSlideIndex < slides.length - 1) {
        showSlide(currentSlideIndex + 1);
    }
}

function previousSlide() {
    if (currentSlideIndex > 0) {
        showSlide(currentSlideIndex - 1);
    }
}

function firstSlide() {
    showSlide(0);
}

function lastSlide() {
    showSlide(slides.length - 1);
}

function updateNavigationControls() {
    const currentHumanNumber = currentSlideIndex + 1;

    slideCounter.textContent =
        `${currentHumanNumber} / ${slides.length}`;

    cornerSlideNumber.textContent =
        String(currentHumanNumber);

    previousButton.disabled = currentSlideIndex === 0;

    nextButton.disabled =
        currentSlideIndex === slides.length - 1;
}

previousButton.addEventListener("click", previousSlide);
nextButton.addEventListener("click", nextSlide);

/* ==========================================================
   NAVEGACIÓN CON TECLADO
   ========================================================== */

document.addEventListener("keydown", (event) => {
    const activeElement = document.activeElement;

    const userIsTyping =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.isContentEditable;

    if (userIsTyping) {
        return;
    }

    switch (event.key) {
        case "ArrowRight":
        case "PageDown":
        case " ":
            event.preventDefault();
            nextSlide();
            break;

        case "ArrowLeft":
        case "PageUp":
            event.preventDefault();
            previousSlide();
            break;

        case "Home":
            event.preventDefault();
            firstSlide();
            break;

        case "End":
            event.preventDefault();
            lastSlide();
            break;

        case "f":
        case "F":
            event.preventDefault();
            toggleFullscreen();
            break;

        case "Escape":
            closeHelpModal();
            closeSidebar();
            break;

        default:
            break;
    }
});

/* ==========================================================
   ESCALADO AUTOMÁTICO DEL ÁREA DE PRESENTACIÓN
   ========================================================== */

function resizeSlideStage() {
    const viewportWidth = slideViewport.clientWidth;
    const viewportHeight = slideViewport.clientHeight;

    if (viewportWidth === 0 || viewportHeight === 0) {
        return;
    }

    const widthScale =
        viewportWidth / PRESENTATION_WIDTH;

    const heightScale =
        viewportHeight / PRESENTATION_HEIGHT;

    /*
     * Math.min evita que el contenido se corte.
     * La diapositiva siempre queda completamente visible.
     */
    const scale = Math.min(widthScale, heightScale);

    slideStage.style.transform =
        `translate(-50%, -50%) scale(${scale})`;
}

/* ==========================================================
   MENÚ LATERAL Y MINIATURAS
   ========================================================== */

function createThumbnails() {
    thumbnailsContainer.innerHTML = "";

    slides.forEach((slide, index) => {
        const title =
            slide.dataset.title ||
            `Diapositiva ${index + 1}`;

        const thumbnailButton =
            document.createElement("button");

        thumbnailButton.type = "button";
        thumbnailButton.className = "thumbnail-button";
        thumbnailButton.dataset.slideIndex = String(index);

        thumbnailButton.setAttribute(
            "aria-label",
            `Abrir diapositiva ${index + 1}: ${title}`
        );

        thumbnailButton.innerHTML = `
            <div class="thumbnail-preview">
                <div class="thumbnail-preview-content">
                    <span class="thumbnail-preview-title">
                        ${escapeHtml(title)}
                    </span>

                    <span class="thumbnail-preview-number">
                        ${index + 1}
                    </span>
                </div>
            </div>

            <div class="thumbnail-label">
                <span class="thumbnail-title">
                    ${escapeHtml(title)}
                </span>

                <span class="thumbnail-index">
                    ${index + 1}
                </span>
            </div>
        `;

        thumbnailButton.addEventListener("click", () => {
            showSlide(index);
            closeSidebar();
        });

        thumbnailsContainer.appendChild(thumbnailButton);
    });
}

function updateThumbnailSelection() {
    const thumbnailButtons = Array.from(
        thumbnailsContainer.querySelectorAll(
            ".thumbnail-button"
        )
    );

    thumbnailButtons.forEach((button, index) => {
        const isActive = index === currentSlideIndex;

        button.classList.toggle(
            "active-thumbnail",
            isActive
        );

        button.setAttribute(
            "aria-current",
            isActive ? "true" : "false"
        );

        if (isActive && sidebarIsOpen) {
            button.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        }
    });
}

function openSidebar() {
    sidebarIsOpen = true;

    slidesSidebar.classList.remove("-translate-x-full");
    sidebarOverlay.classList.remove("hidden");

    requestAnimationFrame(() => {
        updateThumbnailSelection();
    });
}

function closeSidebar() {
    sidebarIsOpen = false;

    slidesSidebar.classList.add("-translate-x-full");
    sidebarOverlay.classList.add("hidden");
}

function toggleSidebar() {
    if (sidebarIsOpen) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

menuButton.addEventListener("click", toggleSidebar);
closeSidebarButton.addEventListener("click", closeSidebar);
sidebarOverlay.addEventListener("click", closeSidebar);

/* ==========================================================
   MODO CLARO Y OSCURO
   ========================================================== */

function restoreTheme() {
    const storedTheme = localStorage.getItem(
        "presentation-theme"
    );

    const systemPrefersDark =
        window.matchMedia &&
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;

    const shouldUseDark =
        storedTheme === "dark" ||
        (!storedTheme && systemPrefersDark);

    document.documentElement.classList.toggle(
        "dark",
        shouldUseDark
    );

    updateThemeIcons(shouldUseDark);
}

function toggleTheme() {
    const isCurrentlyDark =
        document.documentElement.classList.contains(
            "dark"
        );

    const newDarkState = !isCurrentlyDark;

    document.documentElement.classList.toggle(
        "dark",
        newDarkState
    );

    localStorage.setItem(
        "presentation-theme",
        newDarkState ? "dark" : "light"
    );

    updateThemeIcons(newDarkState);
}

function updateThemeIcons(isDark) {
    moonIcon.classList.toggle("hidden", isDark);
    sunIcon.classList.toggle("hidden", !isDark);
}

themeButton.addEventListener("click", toggleTheme);

/* ==========================================================
   MODAL DE AYUDA
   ========================================================== */

function openHelpModal() {
    helpModal.classList.remove("hidden");
    helpModal.classList.add("flex");

    closeHelpButton.focus();
}

function closeHelpModal() {
    helpModal.classList.add("hidden");
    helpModal.classList.remove("flex");
}

helpButton.addEventListener("click", openHelpModal);
closeHelpButton.addEventListener("click", closeHelpModal);

helpModal.addEventListener("click", (event) => {
    if (event.target === helpModal) {
        closeHelpModal();
    }
});

/* ==========================================================
   PANTALLA COMPLETA
   ========================================================== */

async function toggleFullscreen() {
    try {
        if (!document.fullscreenElement) {
            await presentationApp.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    } catch (error) {
        console.error(
            "No fue posible cambiar el modo de pantalla completa:",
            error
        );
    }
}

function updateFullscreenState() {
    const isFullscreen =
        Boolean(document.fullscreenElement);

    presentationApp.classList.toggle(
        "presentation-mode",
        isFullscreen
    );

    /*
     * Espera a que el navegador actualice las dimensiones
     * antes de recalcular el tamaño de la diapositiva.
     */
    window.setTimeout(resizeSlideStage, 100);
}

fullscreenButton.addEventListener(
    "click",
    toggleFullscreen
);

document.addEventListener(
    "fullscreenchange",
    updateFullscreenState
);

/* ==========================================================
   CRONÓMETRO
   ========================================================== */

function startPresentationTimer() {
    updateTimerDisplay();

    window.setInterval(() => {
        elapsedSeconds += 1;
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const hours = Math.floor(elapsedSeconds / 3600);

    const minutes = Math.floor(
        (elapsedSeconds % 3600) / 60
    );

    const seconds = elapsedSeconds % 60;

    if (hours > 0) {
        presentationTimer.textContent =
            `${padNumber(hours)}:` +
            `${padNumber(minutes)}:` +
            `${padNumber(seconds)}`;
    } else {
        presentationTimer.textContent =
            `${padNumber(minutes)}:` +
            `${padNumber(seconds)}`;
    }
}

function padNumber(number) {
    return String(number).padStart(2, "0");
}

/* ==========================================================
   UTILIDADES
   ========================================================== */

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}