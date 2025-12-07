'use strict';

import { showOverlay, hideOverlay, getSelectedLicense, setSelectedLicense, renderTable, updateAvailabilityDisplay, setButtonLoading, loadTheme } from './modules/ui.js';
import { calculateEffort } from './modules/calculator.js';
import { exportToWord } from './modules/export.js';

/**
 * @file Main script for the Delinea Effort Calculator.
 * @summary This script handles the main application logic, including loading data, handling user interactions, and coordinating updates between different modules.
 * @author Gemini
 */

(async () => {
    /**
     * Stores the list of tasks loaded from tasks.json.
     * @type {Array<Object>} An array of task objects.
     */
    let tasks = [];

    /**
     * Holds the Bootstrap Modal instance for the reset confirmation dialog.
     * @type {bootstrap.Modal}
     */
    let resetModal;

    // --- Data Loading ---
    try {
        const response = await fetch('data/tasks.json');
        tasks = await response.json();
    } catch (error) {
        console.error('Error loading tasks:', error);
        alert('Failed to load essential data. Please refresh the page to try again.');
        return;
    }

    // --- Core Functions ---

    /**
     * Handles the click event for the 'Calculate' button.
     * It shows an overlay, triggers the table rendering with the latest calculations,
     * and then hides the overlay. A timeout is used to ensure the UI updates before calculations begin.
     */
    function handleCalculateClick() {
        const btn = document.getElementById('calculate-btn');
        setButtonLoading(btn, true);
        showOverlay();
        setTimeout(() => {
            renderTable(tasks, (task, license) => calculateEffort(task, license, tasks), getSelectedLicense);
            setButtonLoading(btn, false);
            hideOverlay();
        }, 500);
    }

    /**
     * Handles the click event for the 'Export to Word' button.
     * It triggers the export process and includes error handling.
     * @async
     */
    async function handleExportClick() {
        const btn = document.getElementById('export-btn');
        setButtonLoading(btn, true);
        try {
            await exportToWord(tasks);
        } catch (error) {
            console.error('Error exporting to Word:', error);
            alert('An error occurred while exporting the document. Please try again.');
        } finally {
            setButtonLoading(btn, false);
        }
    }

    /**
     * Resets all user inputs to their default values and recalculates the table.
     * This includes the license type, sliders, and checkboxes.
     */
    function resetToDefaults() {
        setSelectedLicense('standard');

        const sliders = [
            { id: '4.1', value: '4' },
            { id: '4.2', value: '4' },
            { id: '4.3', value: '4' },
            { id: '4.4', value: '3' }
        ];

        sliders.forEach(slider => {
            const sliderEl = document.getElementById(`input-${slider.id}`);
            const valueEl = document.getElementById(`slider-value-${slider.id}`);
            if (sliderEl) sliderEl.value = slider.value;
            if (valueEl) valueEl.textContent = slider.value;
        });

        tasks.forEach(task => {
            const checkbox = document.getElementById('checkbox-' + task.id);
            if (checkbox) checkbox.checked = (task.id === '12.1');
        });

        handleCalculateClick();
    }

    /**
     * Creates a debounced function that delays invoking `func` until after `wait` milliseconds
     * have elapsed since the last time the debounced function was invoked.
     * @param {Function} func The function to debounce.
     * @param {number} wait The number of milliseconds to delay.
     * @returns {Function} The new debounced function.
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * A debounced version of the renderTable function to prevent excessive recalculations
     * on frequent input changes (e.g., dragging a slider).
     */
    const debouncedRenderTable = debounce(() => renderTable(tasks, (task, license) => calculateEffort(task, license, tasks), getSelectedLicense), 300);

    // --- Main Execution & Event Listeners ---

    /**
     * Initializes the application: loads the theme, performs an initial calculation,
     * and sets up all event listeners for user interaction.
     */
    function initializeApp() {
        loadTheme();
        handleCalculateClick();

        // Theme toggle button
        document.getElementById('theme-toggle-btn').addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });

        // Action buttons
        document.getElementById('calculate-btn').addEventListener('click', handleCalculateClick);
        document.getElementById('export-btn').addEventListener('click', handleExportClick);

        // Reset modal and buttons
        resetModal = new bootstrap.Modal(document.getElementById('reset-confirm-modal'));
        document.getElementById('reset-btn').addEventListener('click', () => resetModal.show());
        document.getElementById('confirm-reset-btn').addEventListener('click', () => {
            const btn = document.getElementById('reset-btn');
            setButtonLoading(btn, true);
            resetModal.hide();
            setTimeout(() => {
                resetToDefaults();
                setButtonLoading(btn, false);
            }, 500); // UI feedback delay
        });

        // License selection buttons
        document.querySelectorAll('.btn-license').forEach(button => {
            button.addEventListener('click', () => {
                setSelectedLicense(button.getAttribute('data-value'));
                debouncedRenderTable();
            });
        });

        // Listen for changes on all task-related inputs (sliders and checkboxes)
        tasks.forEach(task => {
            const el = document.getElementById('checkbox-' + task.id) || document.getElementById('input-' + task.id);
            if (el) {
                el.addEventListener('input', () => {
                    // If the input is a slider, update its displayed value
                    if (el.type === 'range') {
                        const valueSpan = document.getElementById(`slider-value-${task.id}`);
                        if (valueSpan) {
                            valueSpan.textContent = el.value;
                        }
                    }
                    // If the input is for a launcher, update the availability display
                    if (el.id.startsWith('input-')) {
                        updateAvailabilityDisplay(tasks);
                    }
                    // Recalculate and render the table after any input change
                    debouncedRenderTable();
                });
            }
        });
    }

    initializeApp();

})();
