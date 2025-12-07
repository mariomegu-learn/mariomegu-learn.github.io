'use strict';

/**
 * @file ui.js
 * @description This module manages all UI-related interactions, including DOM manipulation, event handling, and rendering.
 */

// --- Overlay Management ---

/**
 * Displays a loading overlay on the screen.
 */
export function showOverlay() {
    document.getElementById('overlay').classList.add('show');
}

/**
 * Hides the loading overlay.
 */
export function hideOverlay() {
    document.getElementById('overlay').classList.remove('show');
}

// --- Input Readers ---

/**
 * Gets the integer value of an input field by its ID suffix.
 * @param {string} id The ID suffix of the input element (e.g., '4.1').
 * @returns {number} The integer value of the input, or 0 if not found or invalid.
 */
export function getQuantity(id) {
    const input = document.getElementById('input-' + id);
    return input ? parseInt(input.value, 10) || 0 : 0;
}

/**
 * Checks if a checkbox is checked by its ID suffix.
 * @param {string} id The ID suffix of the checkbox element (e.g., '12.1').
 * @returns {boolean} True if the checkbox is checked, false otherwise.
 */
export function isChecked(id) {
    const checkbox = document.getElementById('checkbox-' + id);
    return checkbox ? checkbox.checked : false;
}

/**
 * Gets the currently selected license type from the UI.
 * @returns {string} The license type ('standard' or 'platinum').
 */
export function getSelectedLicense() {
    const activeButton = document.querySelector('.btn-license.active');
    return activeButton ? activeButton.getAttribute('data-value') : 'standard';
}

// --- UI State Setters ---

/**
 * Sets the active license type in the UI.
 * @param {string} licenseType The license type to set as active ('standard' or 'platinum').
 */
export function setSelectedLicense(licenseType) {
    document.querySelectorAll('.btn-license').forEach(btn => btn.classList.remove('active'));
    const selectedButton = document.getElementById('license-' + licenseType);
    if (selectedButton) selectedButton.classList.add('active');
}

/**
 * Updates the state of checkboxes based on the selected license.
 * If a task is not applicable for a license, its checkbox is disabled and unchecked.
 * @param {Array<object>} tasks The list of all tasks.
 * @param {Function} getSelectedLicense Function to get the current license.
 */
export function updateControlsState(tasks, getSelectedLicense) {
    const license = getSelectedLicense();
    tasks.forEach(task => {
        const el = document.getElementById('checkbox-' + task.id);
        if (el) {
            const isApplicable = license === 'standard' ? task.standardBase > 0 : task.platinumBase > 0;
            el.disabled = !isApplicable;
            if (!isApplicable) {
                el.checked = false;
            }
        }
    });
}

/**
 * Renders the main effort table based on current selections.
 * @param {Array<object>} tasks The list of all tasks.
 * @param {Function} calculateEffort The function to calculate effort for a single task.
 * @param {Function} getSelectedLicense Function to get the current license.
 */
export function renderTable(tasks, calculateEffort, getSelectedLicense) {
    const license = getSelectedLicense();
    updateControlsState(tasks, getSelectedLicense);
    
    const header = document.getElementById('effort-header');
    header.textContent = `${license === 'standard' ? 'Estándar' : 'Platino'} - Horas`;

    const tbody = document.querySelector('#effort-table tbody');
    tbody.innerHTML = '';
    let total = 0;
    const visibleSections = new Set();

    // First pass: determine which sections have visible items.
    tasks.forEach(task => {
        if (task.isSectionHeader) return;
        const { effort } = calculateEffort(task, license);
        if (parseFloat(effort) > 0) {
            visibleSections.add(task.id.split('.')[0]);
        }
    });

    // Second pass: render the table.
    tasks.forEach(task => {
        if (task.isSectionHeader) {
            if (visibleSections.has(task.id)) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="4" class="section-header text-justify fw-bold">${task.description}</td>`;
                tbody.appendChild(row);
            }
            return;
        }

        const { effort, qty } = calculateEffort(task, license);
        if (parseFloat(effort) > 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="text-center" data-label="Ítem">${task.id}</td>
                <td class="text-justify ${task.id.includes('.') ? 'subtask' : ''}" data-label="Tarea">${task.description}</td>
                <td class="text-center" data-label="Cantidad">${qty || 'N/A'}</td>
                <td class="text-center" data-label="Esfuerzo (Horas)">${effort}</td>
            `;
            total += parseFloat(effort);
            tbody.appendChild(row);
        }
    });

    const totalText = `Horas Totales: ${total.toFixed(2)}`;
    document.getElementById('total-hours').textContent = totalText;
    document.getElementById('fixed-total-hours').textContent = totalText;

    const totalsRow = document.createElement('tr');
    totalsRow.classList.add('totals-row');
    totalsRow.innerHTML = `
        <td colspan="3" class="text-center fw-bold" data-label="Total">Total:</td>
        <td class="text-center fw-bold" data-label="Horas Totales">${total.toFixed(2)}</td>
    `;
    tbody.appendChild(totalsRow);
}

/**
 * Updates the display for launcher availability based on the total number of secrets selected.
 * @param {Array<object>} tasks The list of all tasks.
 */
export function updateAvailabilityDisplay(tasks) {
    const totalSecrets = tasks.filter(t => t.id.startsWith('4.')).reduce((acc, t) => acc + getQuantity(t.id), 0);
    const available = 15 - totalSecrets;
    const availabilityText = document.getElementById('availability-text');
    const warningElement = document.getElementById('session-warning');

    warningElement.className = 'alert'; // Reset classes
    if (totalSecrets > 15) {
        warningElement.classList.add('alert-danger');
        availabilityText.innerHTML = `<i class="fas fa-exclamation-triangle"></i> El total excede 15; se limita a 15. (Disponibles: ${Math.max(0, available)})`;
    } else if (available === 0) {
        warningElement.classList.add('alert-danger');
        availabilityText.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Máximo de secretos alcanzado.`;
    } else if (totalSecrets > 12) {
        warningElement.classList.add('alert-warning');
        availabilityText.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Acercándose al máximo. (Disponibles: ${available})`;
    } else {
        warningElement.classList.add('alert-info');
        availabilityText.innerHTML = `<i class="fas fa-info-circle"></i> Máximo de secretos: 15. (Disponibles: ${available})`;
    }
}

/**
 * Sets the loading state for a button, showing/hiding a spinner.
 * @param {HTMLElement} button The button element.
 * @param {boolean} isLoading True to show the spinner, false to show the text.
 */
export function setButtonLoading(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.spinner-border');
    button.disabled = isLoading;
    if (spinner) {
        spinner.classList.toggle('d-none', !isLoading);
    }
    if (btnText) {
        btnText.classList.toggle('d-none', isLoading);
    }
}

/**
 * Loads the saved theme from localStorage or defaults to 'dark'.
 */
export function loadTheme() {
    const theme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}
