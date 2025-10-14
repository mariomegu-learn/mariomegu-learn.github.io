'use strict';

// Array of tasks with all data from the Excel sheet
const tasks = [
    // Section 1
    { id: '1', description: '1. Instalación Preeliminar', isSectionHeader: true },
    { id: '1.1', description: 'Instalación y configuración de una (1) instancia de Secret Server en On Premise.', isSectionHeader: false, quantity: 1, duration: 2, standardBase: 2, platinumBase: 2 },
    { id: '1.2', description: 'Instalación de Conector y Distribute Engine un solo dominio.', isSectionHeader: false, quantity: 1, duration: 8, standardBase: 8, platinumBase: 8 },
    { id: '1.3', description: 'Instalación de Privilege Remote Access un solo dominio.', isSectionHeader: false, quantity: 1, duration: 4, standardBase: 0, platinumBase: 4 },
    { id: '1.4', description: 'Sincronización de Active Directory para la autenticación de un solo nombre de dominio.', isSectionHeader: false, quantity: 1, duration: 3, standardBase: 3, platinumBase: 3 },
    { id: '1.5', description: 'Autenticación a la plataforma mediante MFA predeterminado de Delinea. Nota: Encluido en Estándar?', isSectionHeader: false, quantity: 1, duration: 2, standardBase: 0, platinumBase: 2 },
    { id: '1.6', description: 'Activación de administrador ilimitado', isSectionHeader: false, quantity: 1, duration: 1, standardBase: 1, platinumBase: 1 },
    // Section 2
    { id: '2', description: '2. Configurar funcionalidades do Secret Server', isSectionHeader: true },
    { id: '2.1', description: 'Diseño y construcción Grupal: Active Director y propiedad del Grupo (que grupos a que carpetas).', isSectionHeader: false, quantity: 1, duration: 2, standardBase: 2, platinumBase: 2 },
    { id: '2.2', description: 'Evaluación y asignación de roles: Creación de hasta 3 roles personalizados.', isSectionHeader: false, quantity: 3, duration: 0.6666666666666666, standardBase: 2, platinumBase: 2 },
    { id: '2.3', description: 'Configuración de hasta 3 carpetas', isSectionHeader: false, quantity: 3, duration: 0.6666666666666666, standardBase: 2, platinumBase: 2 },
    // Section 3
    { id: '3', description: '3. Plantilla', isSectionHeader: true },
    { id: '3.1', description: 'Creación de hasta 3 plantillas basadas en plantillas predeterminadas de la plataforma.', isSectionHeader: false, quantity: 3, duration: 0.6666666666666666, standardBase: 2, platinumBase: 2 },
    { id: '3.2', description: 'Revisión de la propiedad de la plantilla.', isSectionHeader: false, quantity: 3, duration: 0.6666666666666666, standardBase: 2, platinumBase: 2 },
    // Section 4
    { id: '4', description: '4. Lanzadores, Máximo 15 secretos', isSectionHeader: true },
    { id: '4.1', description: 'Configurar y validar los lanzadores de RDP hasta (4) cuatro secretos.', isSectionHeader: false, quantity: 'variable', duration: 2.5, standardBase: null, platinumBase: null },
    { id: '4.2', description: 'Configurar y validar los lanzadores de Linux hasta (4) cuatro secretos.', isSectionHeader: false, quantity: 'variable', duration: 2.5, standardBase: null, platinumBase: null },
    { id: '4.3', description: 'Configurar y validar los lanzadores Web hasta (4) cuatro secretos.', isSectionHeader: false, quantity: 'variable', duration: 2.5, standardBase: null, platinumBase: null },
    { id: '4.4', description: 'Configurar y validar los lanzadores SSMS hasta (3) tres secretos.', isSectionHeader: false, quantity: 'variable', duration: 2.5, standardBase: null, platinumBase: null },
    // Section 5
    { id: '5', description: '5. Políticas de secretos', isSectionHeader: true },
    { id: '5.1', description: 'Discutir la política en blanco', isSectionHeader: false, quantity: 1, duration: 1, standardBase: 1, platinumBase: 1 },
    { id: '5.2', description: 'Cree hasta (3) tres políticas secretas', isSectionHeader: false, quantity: 3, duration: 1.5, standardBase: 4.5, platinumBase: 4.5 },
    // Section 6
    { id: '6', description: '6. Grabación de sesiones', isSectionHeader: true },
    { id: '6.1', description: 'Grabación de sesión básica, maximo 15 secretos', isSectionHeader: false, quantity: 'variable', duration: 0.5, standardBase: null, platinumBase: null },
    // Section 7
    { id: '7', description: '7. Configurar y probar el cambio de contraseña remota (RPC)', isSectionHeader: true },
    { id: '7.1', description: 'Prueba hasta dos (2) Secretos de Active Directory', isSectionHeader: false, quantity: 2, duration: 0.5, standardBase: 1, platinumBase: 1 },
    // Section 8
    { id: '8', description: '8. Descubrimiento', isSectionHeader: true },
    { id: '8.1', description: 'Fuentes de detección de cuentas locales y de dominio de Windows Active Directory.', isSectionHeader: false, quantity: 1, duration: 3, standardBase: 3, platinumBase: 3 },
    // Section 9
    { id: '9', description: '9. Flujo de Trabajo', isSectionHeader: true },
    { id: '9.1', description: 'Configure hasta dos (2) ejemplos de Solicitud de Acceso', isSectionHeader: false, quantity: 2, duration: 2, standardBase: 0, platinumBase: 4 },
    // Section 10
    { id: '10', description: '10. Introduccion a Reportes, Nota: Validar si estan incluidos en los licenciamientos', isSectionHeader: true },
    { id: '10.1', description: 'Descripcion general de los informes predeterminados en la plataforma de Secret Server', isSectionHeader: false, quantity: 1, duration: 2, standardBase: 0, platinumBase: 2 },
    { id: '10.2', description: 'Creación de Eventos de Suscripción predeterminados', isSectionHeader: false, quantity: 1, duration: 2, standardBase: 0, platinumBase: 2 },
    { id: '10.3', description: 'Integración con SIEM, de acuerdo los formatos disponibles en Secret Server', isSectionHeader: false, quantity: 1, duration: 2, standardBase: 0, platinumBase: 2 },
    // Section 11
    { id: '11', description: '11. Cambio de contraseñas (Remote Password Changing)', isSectionHeader: true },
    { id: '11.1', description: 'Configuracion de cambio automatico de contraseña, maximo 3 secretos para Directorio Activo', isSectionHeader: false, quantity: 3, duration: 1.5, standardBase: 4.5, platinumBase: 4.5 },
    // Section 12
    { id: '12', description: '12. Cierre del proyecto', isSectionHeader: true },
    { id: '12.1', description: 'Elaboración Manual Tecnico de Instalación', isSectionHeader: false, quantity: 1, duration: 6, standardBase: 6, platinumBase: 6 },
    { id: '12.2', description: 'Elaboración Manual Usuario Administrador', isSectionHeader: false, quantity: 1, duration: 5, standardBase: 5, platinumBase: 5 },
    { id: '12.3', description: 'Elaboración Manual Usuario Final', isSectionHeader: false, quantity: 1, duration: 2, standardBase: 2, platinumBase: 2 },
    { id: '12.4', description: 'Preparación de Diapositivas para Capacitación (Usuarios Administradores)', isSectionHeader: false, quantity: 1, duration: 4, standardBase: 4, platinumBase: 4 },
    { id: '12.5', description: 'Capacitación Plataforma Delinea Usuarios Finales (1 sesion)', isSectionHeader: false, quantity: 1, duration: 2, standardBase: 2, platinumBase: 2 },
    { id: '12.6', description: 'Capacitación Plataforma Delinea Usuarios Administradores (4 sesiones)', isSectionHeader: false, quantity: 4, duration: 2, standardBase: 8, platinumBase: 8 },
    // Section 13
    { id: '13', description: '13. Gerencia de proyectos', isSectionHeader: true },
    { id: '13.1', description: 'Seguimiento y control a través de gerencia de proyectos', isSectionHeader: false, quantity: 1, duration: 30, standardBase: 30, platinumBase: 30 }
];

// Function to get quantity from input for variable tasks
function getQuantity(id) {
    if (id.startsWith('4.')) {
        return parseInt(document.getElementById('input-' + id).value) || 0;
    }
    return 0;
}

// Function to check if checkbox is checked
function isChecked(id) {
    return document.getElementById('checkbox-' + id).checked;
}

// Function to get selected license type
function getSelectedLicense() {
    const activeButton = document.querySelector('.btn-license.active');
    return activeButton ? activeButton.getAttribute('data-value') : 'standard';
}

// Function to set selected license
function setSelectedLicense(licenseType) {
    // Remove active class from all buttons
    document.querySelectorAll('.btn-license').forEach(btn => {
        btn.classList.remove('active');
    });

    // Add active class to selected button
    const selectedButton = document.getElementById('license-' + licenseType);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
}

// Function to calculate effort for a task
function calculateEffort(task) {
    if (task.isSectionHeader) return { effort: '', qty: '' };
    let qty = task.quantity;
    if (qty === 'variable') {
        if (task.id === '6.1') {
            let total = getQuantity('4.1') + getQuantity('4.2') + getQuantity('4.3') + getQuantity('4.4');
            if (total > 15) alert("Warning: Total secrets exceed 15; capping session recording at 15.");
            qty = Math.min(total, 15);
        } else {
            qty = getQuantity(task.id);
        }
    }
    let effort;
    const license = getSelectedLicense();
    if (task.id.startsWith('12.') || task.id.startsWith('13.')) {
        effort = isChecked(task.id) ? (license === 'standard' ? task.standardBase : task.platinumBase) : 0;
    } else if (task.id.startsWith('4.') || task.id === '6.1') {
        effort = qty * task.duration;
    } else {
        effort = license === 'standard' ? task.standardBase : task.platinumBase;
    }
    return { effort: parseFloat(effort).toFixed(2), qty: qty };
}

// Function to render the table
function renderTable() {
    // Update header
    const license = getSelectedLicense();
    const header = document.getElementById('effort-header');
    header.textContent = license.charAt(0).toUpperCase() + license.slice(1) + ' Effort';

    const tbody = document.querySelector('#effort-table tbody');
    tbody.innerHTML = '';
    let total = 0;
    // Determine visible sections
    const visibleSections = new Set();
    tasks.forEach(task => {
        if (!task.isSectionHeader) {
            const effort = calculateEffort(task);
            if (parseFloat(effort.effort) > 0) {
                const sectionId = task.id.split('.')[0];
                visibleSections.add(sectionId);
            }
        }
    });
    tasks.forEach(task => {
        const row = document.createElement('tr');
        if (task.isSectionHeader) {
            if (visibleSections.has(task.id)) {
                const cell = document.createElement('td');
                cell.colSpan = 4;
                cell.textContent = task.description;
                cell.classList.add('section-header', 'text-justify', 'fw-bold');
                row.appendChild(cell);
                tbody.appendChild(row);
            }
        } else {
            const effort = calculateEffort(task);
            if (parseFloat(effort.effort) > 0) {
                const subtaskClass = task.id.includes('.') ? 'subtask' : '';
                row.innerHTML = `
                    <td class="text-center" data-label="Item">${task.id}</td>
                    <td class="text-justify ${subtaskClass}" data-label="Task">${task.description}</td>
                    <td class="text-center" data-label="Quantity">${effort.qty}</td>
                    <td class="text-center" data-label="Effort">${effort.effort}</td>
                `;
                total += parseFloat(effort.effort);
                tbody.appendChild(row);
            }
        }
    });
    // Update total hours display with animation
    const totalHoursElement = document.getElementById('total-hours');
    const previousTotal = parseFloat(totalHoursElement.textContent.replace('Total Hours: ', '')) || 0;
    totalHoursElement.textContent = `Total Hours: ${total.toFixed(2)}`;
    if (total !== previousTotal) {
        totalHoursElement.classList.add('updated');
        setTimeout(() => totalHoursElement.classList.remove('updated'), 500);
    }

    // Add totals row
    const totalsRow = document.createElement('tr');
    totalsRow.classList.add('totals-row');
    totalsRow.innerHTML = `
        <td colspan="3" class="text-center fw-bold" data-label="Total">Total:</td>
        <td class="text-center fw-bold" data-label="Total Hours">${total.toFixed(2)}</td>
    `;
    tbody.appendChild(totalsRow);
}

// Function to export table to Word
function exportToWord() {
    const table = document.getElementById('effort-table');
    const totalHours = document.getElementById('total-hours').textContent;
    const license = getSelectedLicense();
    const inputs = ['input-4.1', 'input-4.2', 'input-4.3', 'input-4.4'].map(id => {
        const input = document.getElementById(id);
        const label = input.previousElementSibling.textContent;
        return `${label}: ${input.value}`;
    }).join('<br>');
    const checkboxes = ['12.1', '12.2', '12.3', '12.4', '12.5', '12.6', '13.1'].map(id => {
        const checkbox = document.getElementById('checkbox-' + id);
        const label = checkbox.nextElementSibling.textContent;
        return `${label}: ${checkbox.checked ? 'Yes' : 'No'}`;
    }).join('<br>');

    const htmlContent = `
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Delinea Effort Calculator - ${license.charAt(0).toUpperCase() + license.slice(1)} License</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                th, td { border: 1px solid black; padding: 8px; text-align: center; }
                th { background-color: #f2f2f2; }
                .text-justify { text-align: justify; }
                .section-header { font-weight: bold; background-color: #e9ecef; }
                .subtask { font-style: italic; }
                .totals-row { font-weight: bold; background-color: #d1ecf1; }
                h1 { text-align: center; color: #1A2A44; }
                .summary { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                .summary h2 { margin-top: 0; color: #495057; }
            </style>
        </head>
        <body>
            <h1>Delinea Services Effort Calculator</h1>
            <div class="summary">
                <h2>Configuration Summary</h2>
                <p><strong>License Type:</strong> ${license.charAt(0).toUpperCase() + license.slice(1)}</p>
                <p><strong>Secret Configurations:</strong><br>${inputs}</p>
                <p><strong>Project Closure Options:</strong><br>${checkboxes}</p>
                <p><strong>${totalHours}</strong></p>
            </div>
            <h2>Effort Breakdown</h2>
            ${table.outerHTML}
        </body>
        </html>
    `;
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delinea-effort-${license}-${new Date().toISOString().split('T')[0]}.doc`;
    a.click();
    URL.revokeObjectURL(url);
}

// Function to reset to default values
function resetToDefaults() {
    // Reset license to standard
    setSelectedLicense('standard');
    // Reset inputs
    document.getElementById('input-4.1').value = '4';
    document.getElementById('input-4.2').value = '4';
    document.getElementById('input-4.3').value = '4';
    document.getElementById('input-4.4').value = '3';
    // Reset checkboxes
    document.getElementById('checkbox-12.1').checked = true;
    document.getElementById('checkbox-12.2').checked = false;
    document.getElementById('checkbox-12.3').checked = false;
    document.getElementById('checkbox-12.4').checked = false;
    document.getElementById('checkbox-12.5').checked = false;
    document.getElementById('checkbox-12.6').checked = false;
    document.getElementById('checkbox-13.1').checked = false;
    // Re-render table
    renderTable();
}

// Function to show overlay
function showOverlay() {
    const overlay = document.getElementById('overlay');
    overlay.classList.add('show');
}

// Function to hide overlay
function hideOverlay() {
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('show');
}

// Function to calculate with overlay
function calculateWithOverlay() {
    showOverlay();
    renderTable();
    setTimeout(hideOverlay, 200);
}

// Theme toggle functionality
function toggleTheme() {
    const themeSwitch = document.getElementById('theme-switch');
    const body = document.body;
    if (themeSwitch.checked) {
        body.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeSwitch = document.getElementById('theme-switch');
    if (savedTheme === 'light') {
        themeSwitch.checked = true;
        document.body.setAttribute('data-theme', 'light');
    }
}

// Debounce function for real-time updates
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

// Real-time calculation with debounce
const debouncedRenderTable = debounce(renderTable, 300);

// Function to update input maximums dynamically
function updateInputMaximums() {
    const inputs = ['input-4.1', 'input-4.2', 'input-4.3', 'input-4.4'];
    let totalUsed = 0;

    // Calculate total used by other inputs
    inputs.forEach(id => {
        if (id !== updateInputMaximums.currentInput) {
            totalUsed += parseInt(document.getElementById(id).value) || 0;
        }
    });

    // Update maximum for current input
    const currentInput = document.getElementById(updateInputMaximums.currentInput);
    const available = 15 - totalUsed;
    currentInput.max = Math.max(0, available);

    // If current value exceeds new max, adjust it
    if (parseInt(currentInput.value) > available) {
        currentInput.value = available;
    }

    // Update help text to show available slots
    updateHelpText(updateInputMaximums.currentInput, available);
}

// Function to update help text with available slots
function updateHelpText(inputId, available) {
    const helpElement = document.getElementById(inputId + '-help');
    if (helpElement) {
        const baseText = getBaseHelpText(inputId);
        helpElement.textContent = `${baseText} (${available} available)`;
    }
}

// Function to get base help text for each input
function getBaseHelpText(inputId) {
    const helpTexts = {
        'input-4.1': 'Maximum recommended: 4',
        'input-4.2': 'Maximum recommended: 4',
        'input-4.3': 'Maximum recommended: 4',
        'input-4.4': 'Maximum recommended: 3'
    };
    return helpTexts[inputId] || '';
}

// Function to initialize input maximums
function initializeInputMaximums() {
    const inputs = ['input-4.1', 'input-4.2', 'input-4.3', 'input-4.4'];

    inputs.forEach(id => {
        updateInputMaximums.currentInput = id;
        updateInputMaximums();
    });
}

// Function to update availability display
function updateAvailabilityDisplay() {
    const inputs = ['input-4.1', 'input-4.2', 'input-4.3', 'input-4.4'];
    let totalSecrets = 0;

    inputs.forEach(id => {
        totalSecrets += parseInt(document.getElementById(id).value) || 0;
    });

    const available = 15 - totalSecrets;
    const availabilityText = document.getElementById('availability-text');
    const warningElement = document.getElementById('session-warning');

    // Always show the availability
    warningElement.style.display = 'block';

    if (totalSecrets > 15) {
        warningElement.className = 'alert alert-danger';
        availabilityText.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Total secrets exceed 15; session recording will be capped at 15. (Available: ' + Math.max(0, available) + ')';
    } else if (available === 0) {
        warningElement.className = 'alert alert-danger';
        availabilityText.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Cantidad máxima de secretos disponibles: 15 (<strong>Sin disponibilidad</strong>)';
    } else if (totalSecrets > 12) {
        warningElement.className = 'alert alert-warning';
        availabilityText.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Cantidad máxima de secretos disponibles: 15 (Restantes: ' + available + ')';
    } else {
        warningElement.className = 'alert alert-info';
        availabilityText.innerHTML = '<i class="fas fa-info-circle"></i> Cantidad máxima de secretos disponibles: 15 (Restantes: ' + available + ')';
    }
}

// Input validation function
function validateInputs() {
    updateAvailabilityDisplay();
    return true;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    renderTable();
    // Theme toggle
    document.getElementById('theme-switch').addEventListener('change', toggleTheme);
    // Calculate button
    document.getElementById('calculate-btn').addEventListener('click', () => {
        if (validateInputs()) {
            calculateWithOverlay();
        }
    });
    // Export button
    document.getElementById('export-btn').addEventListener('click', exportToWord);
    // Reset button
    document.getElementById('reset-btn').addEventListener('click', resetToDefaults);
    // License buttons
    document.querySelectorAll('.btn-license').forEach(button => {
        button.addEventListener('click', () => {
            const licenseType = button.getAttribute('data-value');
            setSelectedLicense(licenseType);
            debouncedRenderTable();
        });
    });
    // Checkboxes for toggles
    ['12.1', '12.2', '12.3', '12.4', '12.5', '12.6', '13.1'].forEach(id => {
        document.getElementById('checkbox-' + id).addEventListener('change', debouncedRenderTable);
    });
    // Real-time inputs
    ['input-4.1', 'input-4.2', 'input-4.3', 'input-4.4'].forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('input', () => {
            updateInputMaximums.currentInput = id;
            updateInputMaximums();
            validateInputs();
            debouncedRenderTable();
        });
        // Initialize help text
        updateHelpText(id, 15 - (parseInt(input.value) || 0));
    });

    // Initialize input maximums and availability display
    initializeInputMaximums();
    updateAvailabilityDisplay();
});