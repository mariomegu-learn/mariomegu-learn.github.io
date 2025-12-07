'use strict';

import { getSelectedLicense } from './ui.js';

/**
 * @file export.js
 * @description This module handles the functionality for exporting the calculated effort to a Word document.
 */

/**
 * Exports the current calculation results to a Microsoft Word (.doc) file.
 *
 * This function gathers the current configuration and results from the UI, including:
 * - The selected license type.
 * - The values of all variable inputs (sliders).
 * - The status of all checkboxes.
 * - The total calculated effort hours.
 * - The main effort table.
 *
 * It then constructs an HTML string representing this data, converts it into a Blob
 * with the MIME type for a Word document (`application/msword`), and triggers a download in the browser.
 * The filename is dynamically generated to include the license type and the current date.
 *
 * @param {Array<object>} tasks The complete list of task objects, used to identify which inputs and checkboxes to read from the DOM.
 */
export function exportToWord(tasks) {
    const license = getSelectedLicense();
    const licenseName = license === 'standard' ? 'Estándar' : 'Platino';
    const totalHours = document.getElementById('total-hours').textContent;
    let inputsContent = '';
    let checkboxesContent = '';

    // Gather data from variable inputs (sliders).
    tasks.forEach(task => {
        if (task.quantity === 'variable' && task.id !== '6.1') {
            const input = document.getElementById('input-' + task.id);
            if (input) {
                const label = document.querySelector(`label[for="input-${task.id}"]`).textContent;
                inputsContent += `${label} ${input.value}<br>`;
            }
        }
    });

    // Gather data from checkboxes.
    tasks.forEach(task => {
        if (document.getElementById('checkbox-' + task.id)) {
            const checkbox = document.getElementById('checkbox-' + task.id);
            const label = document.querySelector(`label[for="checkbox-${task.id}"]`).textContent;
            checkboxesContent += `${label} ${checkbox.checked ? 'Sí' : 'No'}<br>`;
        }
    });

    // Construct the HTML content for the Word document.
    const htmlContent = `
        <html>
        <head><meta charset="UTF-8"><title>Calculadora de Esfuerzo Delinea</title></head>
        <body>
            <h1>Calculadora de Esfuerzo de Servicios Delinea</h1>
            <div>
                <h2>Resumen de Configuración</h2>
                <p><strong>Tipo de Licencia:</strong> ${licenseName}</p>
                <p><strong>Configuraciones de Secretos:</strong><br>${inputsContent}</p>
                <p><strong>Opciones:</strong><br>${checkboxesContent}</p>
                <p><strong>${totalHours}</strong></p>
            </div>
            <h2>Desglose de Esfuerzo</h2>
            ${document.getElementById('effort-table').outerHTML}
        </body>
        </html>`;

    // Create a Blob with the HTML content and the correct MIME type for a .doc file.
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link to trigger the download.
    const a = document.createElement('a');
    a.href = url;
    a.download = `delinea-esfuerzo-${license}-${new Date().toISOString().split('T')[0]}.doc`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up by revoking the object URL and removing the link.
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}
