/* ============================================================
   Modo Instructor - Integración incremental
   Creado para la estructura actual del curso Linux 101

   Cómo usar:
   1. Cargar este archivo después de app.js:
      <script src="instructor-mode.js"></script>
   2. O pegar todo este bloque al final de app.js.
============================================================ */

(function () {
  const INSTRUCTOR_MODE_KEY = "kasperskyLinuxCourseInstructorMode";

  function safeGet(id) {
    return document.getElementById(id);
  }

  function safeToast(message, type = "info") {
    if (typeof window.showToast === "function") {
      window.showToast(message, type);
      return;
    }
    console.info(message);
  }

  function injectInstructorButtons() {
    const dashboardBtn = safeGet("dashboardBtn");
    const resetBtn = safeGet("resetProgressBtn");

    if (!safeGet("instructorModeBtn")) {
      const button = document.createElement("button");
      button.className = "btn btn-icon d-none d-md-inline-flex";
      button.type = "button";
      button.id = "instructorModeBtn";
      button.setAttribute("aria-label", "Activar modo instructor");
      button.setAttribute("title", "Modo instructor");
      button.innerHTML = '<i class="bi bi-person-video3" aria-hidden="true"></i>';

      if (resetBtn && resetBtn.parentElement) {
        resetBtn.parentElement.insertBefore(button, resetBtn);
      } else if (dashboardBtn && dashboardBtn.parentElement) {
        dashboardBtn.parentElement.appendChild(button);
      }
    }

    const mobileDashboardBtn = safeGet("mobileDashboardBtn");
    const mobileResetBtn = safeGet("mobileResetProgressBtn");

    if (mobileDashboardBtn && !safeGet("mobileInstructorModeBtn")) {
      const mobileButton = document.createElement("button");
      mobileButton.className = "btn btn-outline-primary";
      mobileButton.type = "button";
      mobileButton.id = "mobileInstructorModeBtn";
      mobileButton.innerHTML = '<i class="bi bi-person-video3 me-2" aria-hidden="true"></i>Modo instructor';

      if (mobileResetBtn && mobileResetBtn.parentElement) {
        mobileResetBtn.parentElement.insertBefore(mobileButton, mobileResetBtn);
      } else if (mobileDashboardBtn.parentElement) {
        mobileDashboardBtn.parentElement.appendChild(mobileButton);
      }
    }

    if (!safeGet("instructorModeIndicator")) {
      const indicator = document.createElement("div");
      indicator.className = "instructor-mode-indicator";
      indicator.id = "instructorModeIndicator";
      indicator.innerHTML = '<i class="bi bi-person-video3" aria-hidden="true"></i>Modo instructor activo';
      document.body.appendChild(indicator);
    }
  }

  function updateInstructorModeButtons(isEnabled) {
    const instructorModeBtn = safeGet("instructorModeBtn");
    const mobileInstructorModeBtn = safeGet("mobileInstructorModeBtn");

    if (instructorModeBtn) {
      instructorModeBtn.setAttribute(
        "aria-label",
        isEnabled ? "Desactivar modo instructor" : "Activar modo instructor"
      );
      instructorModeBtn.setAttribute(
        "title",
        isEnabled ? "Desactivar modo instructor" : "Modo instructor"
      );
    }

    if (mobileInstructorModeBtn) {
      mobileInstructorModeBtn.innerHTML = isEnabled
        ? '<i class="bi bi-person-video3 me-2" aria-hidden="true"></i>Desactivar modo instructor'
        : '<i class="bi bi-person-video3 me-2" aria-hidden="true"></i>Modo instructor';
    }
  }

  function loadInstructorMode() {
    const isEnabled = localStorage.getItem(INSTRUCTOR_MODE_KEY) === "true";
    document.body.classList.toggle("instructor-mode", isEnabled);
    updateInstructorModeButtons(isEnabled);
  }

  function toggleInstructorMode() {
    const isEnabled = document.body.classList.toggle("instructor-mode");
    localStorage.setItem(INSTRUCTOR_MODE_KEY, isEnabled ? "true" : "false");
    updateInstructorModeButtons(isEnabled);
    safeToast(
      isEnabled ? "Modo instructor activado." : "Modo instructor desactivado.",
      isEnabled ? "success" : "info"
    );
  }

  function renderInstructorNote(moduleId) {
    const notes = {
      "module-0": {
        title: "Cómo abrir la sesión",
        points: [
          "Explica que este no es un curso genérico de Linux.",
          "Aclara que el enfoque es Linux aplicado a implementación y soporte Kaspersky.",
          "Pregunta a la audiencia qué experiencia tiene con Linux.",
          "Refuerza que ningún comando debe ejecutarse en producción sin autorización."
        ]
      },
      "module-1": {
        title: "Enfoque del módulo de fundamentos",
        points: [
          "Alinea el nivel técnico de la audiencia.",
          "Explica la diferencia entre distribuciones DEB y RPM.",
          "Refuerza el uso controlado de root y sudo.",
          "Conecta permisos Linux con instalación y soporte de componentes Kaspersky."
        ]
      },
      "module-8": {
        title: "Puntos clave para explicar KSC Linux",
        points: [
          "Separar prerrequisitos de instalación y tareas post-instalación.",
          "Recalcar DBMS, DNS y distribución soportada.",
          "Explicar diferencia entre paquetes DEB y RPM.",
          "Recordar que rutas, servicios y parámetros varían según versión.",
          "Evitar presentar comandos como receta universal."
        ]
      },
      "module-9": {
        title: "Cómo explicar Network Agent",
        points: [
          "Explicar que Network Agent permite la comunicación del endpoint con KSC.",
          "Diferenciar instalación local, remota, interactiva y silenciosa.",
          "Validar DNS, puertos, SSH, sudo y conectividad antes de instalar.",
          "Relacionar errores de comunicación con troubleshooting de red y servicios."
        ]
      },
      "module-10": {
        title: "Cómo explicar kesl-control",
        points: [
          "Presentar kesl-control como herramienta local de administración de KES for Linux.",
          "Primero mostrar listado de tareas.",
          "Luego consultar estado de tareas.",
          "Después explicar inicio/detención como acciones controladas.",
          "Recordar validar política central si el endpoint está administrado por KSC."
        ]
      },
      "module-11": {
        title: "Guía para facilitar troubleshooting",
        points: [
          "Insistir en entender alcance, impacto y cambios recientes.",
          "Recolectar evidencia antes de modificar.",
          "Trabajar por capas: sistema, recursos, red, servicios, logs y producto.",
          "Explicar cuándo escalar y qué evidencias adjuntar."
        ]
      }
    };

    const note = notes[moduleId] || {
      title: "Guía de facilitación",
      points: [
        "Conecta este módulo con escenarios reales de implementación, soporte y preventa.",
        "Refuerza que los comandos deben validarse según versión, distribución y ambiente.",
        "Invita a la audiencia a documentar hallazgos y evidencias."
      ]
    };

    const items = note.points.map(point => `<li>${escapeText(point)}</li>`).join("");

    return `
      <div class="instructor-note">
        <span class="instructor-label">
          <i class="bi bi-person-video3" aria-hidden="true"></i>
          Nota para instructor
        </span>
        <h5>${escapeText(note.title)}</h5>
        <ul class="mb-0">${items}</ul>
      </div>
    `;
  }

  function escapeText(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function injectInstructorNoteIntoMain(moduleId) {
    const main = safeGet("mainContent");
    if (!main) return;

    if (main.querySelector(".instructor-note")) return;

    const firstCard = main.querySelector(".card.border-0.shadow-sm.mb-4");
    if (!firstCard) return;

    firstCard.insertAdjacentHTML("afterend", renderInstructorNote(moduleId));
  }

  function patchRenderFunctions() {
    if (typeof window.openModule === "function") {
      const originalOpenModule = window.openModule;

      window.openModule = function patchedOpenModule(moduleId) {
        originalOpenModule(moduleId);
        setTimeout(() => injectInstructorNoteIntoMain(moduleId), 0);
      };
    }

    if (typeof window.renderDashboard === "function") {
      const originalRenderDashboard = window.renderDashboard;

      window.renderDashboard = function patchedRenderDashboard() {
        originalRenderDashboard();
      };
    }
  }

  function bindInstructorEvents() {
    document.addEventListener("click", function (event) {
      const instructorButton = event.target.closest("#instructorModeBtn");
      const mobileInstructorButton = event.target.closest("#mobileInstructorModeBtn");

      if (instructorButton) {
        toggleInstructorMode();
      }

      if (mobileInstructorButton) {
        toggleInstructorMode();
        if (typeof window.closeMobileMenu === "function") {
          window.closeMobileMenu();
        }
      }
    });

    document.addEventListener("keydown", function (event) {
      const isShortcut =
        event.ctrlKey &&
        event.altKey &&
        event.key.toLowerCase() === "i";

      if (isShortcut) {
        event.preventDefault();
        toggleInstructorMode();
      }
    });
  }

  function initInstructorMode() {
    injectInstructorButtons();
    bindInstructorEvents();
    patchRenderFunctions();
    loadInstructorMode();

    const activeModule = window.currentModuleId || null;
    if (activeModule) {
      injectInstructorNoteIntoMain(activeModule);
    }
  }

  document.addEventListener("DOMContentLoaded", initInstructorMode);

  window.toggleInstructorMode = toggleInstructorMode;
  window.loadInstructorMode = loadInstructorMode;
  window.renderInstructorNote = renderInstructorNote;
})();
