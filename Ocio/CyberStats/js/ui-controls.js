// ============================================
// UI Controls Module
// Handles user interactions and controls
// ============================================

const UIControls = (function () {
    'use strict';

    let attackStream;
    let currentSpeed = 1;

    // Initialize UI controls
    function init(stream) {
        attackStream = stream;

        setupGlobeControls();
        setupFilterControls();
        setupSpeedControls();
    }

    // Setup globe control buttons
    function setupGlobeControls() {
        const toggleRotationBtn = document.getElementById('toggle-rotation');
        const resetViewBtn = document.getElementById('reset-view');
        const toggleLabelsBtn = document.getElementById('toggle-labels');

        if (toggleRotationBtn) {
            toggleRotationBtn.addEventListener('click', () => {
                const isRotating = Globe.toggleRotation();
                toggleRotationBtn.querySelector('.icon').textContent = isRotating ? '⏸️' : '▶️';
                toggleRotationBtn.title = isRotating ? 'Pausar rotación' : 'Reanudar rotación';
            });
        }

        if (resetViewBtn) {
            resetViewBtn.addEventListener('click', () => {
                Globe.resetView();
                // Add visual feedback
                resetViewBtn.style.transform = 'rotate(360deg)';
                setTimeout(() => {
                    resetViewBtn.style.transform = '';
                }, 400);
            });
        }

        if (toggleLabelsBtn) {
            let labelsVisible = false;
            toggleLabelsBtn.addEventListener('click', () => {
                labelsVisible = !labelsVisible;
                toggleLabelsBtn.style.opacity = labelsVisible ? '1' : '0.6';
                // Labels functionality can be extended later
            });
        }
    }

    // Setup threat filter checkboxes
    function setupFilterControls() {
        const filterCheckboxes = document.querySelectorAll('.filter-checkbox');

        filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                updateEnabledFilters();
            });
        });
    }

    function updateEnabledFilters() {
        const enabledTypes = [];

        document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
            if (checkbox.checked) {
                const type = checkbox.id.replace('filter-', '');
                enabledTypes.push(type);
            }
        });

        AttackVisualizer.setEnabledThreatTypes(enabledTypes);
    }

    // Setup simulation speed controls
    function setupSpeedControls() {
        const speedButtons = document.querySelectorAll('.speed-btn');

        speedButtons.forEach(button => {
            button.addEventListener('click', () => {
                const speed = parseFloat(button.dataset.speed);
                setSpeed(speed);

                // Update active state
                speedButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }

    function setSpeed(speed) {
        currentSpeed = speed;
        if (attackStream) {
            attackStream.setSpeed(speed);
        }
    }

    // Show tooltip
    function showTooltip(x, y, content) {
        const tooltip = document.getElementById('tooltip');
        if (!tooltip) return;

        tooltip.querySelector('.tooltip-content').innerHTML = content;
        tooltip.style.left = `${x + 10}px`;
        tooltip.style.top = `${y + 10}px`;
        tooltip.classList.remove('hidden');
    }

    // Hide tooltip
    function hideTooltip() {
        const tooltip = document.getElementById('tooltip');
        if (tooltip) {
            tooltip.classList.add('hidden');
        }
    }

    // Public API
    return {
        init,
        setSpeed,
        showTooltip,
        hideTooltip,
    };
})();

// Make available globally
window.UIControls = UIControls;
