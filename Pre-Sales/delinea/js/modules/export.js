'use strict';

import { getSelectedLicense } from './ui.js';

export function exportToWord(tasks) {
    const license = getSelectedLicense();
    const licenseName = license === 'standard' ? 'Estándar' : 'Platino';
    const totalHours = document.getElementById('total-hours').textContent;
    let inputsContent = '';
    let checkboxesContent = '';

    tasks.forEach(task => {
        if (task.quantity === 'variable' && task.id !== '6.1') {
            const input = document.getElementById('input-' + task.id);
            if (input) {
                const label = document.querySelector(`label[for="input-${task.id}"]`).textContent;
                inputsContent += `${label} ${input.value}<br>`;
            }
        }
        if (document.getElementById('checkbox-' + task.id)) {
            const checkbox = document.getElementById('checkbox-' + task.id);
            const label = document.querySelector(`label[for="checkbox-${task.id}"]`).textContent;
            checkboxesContent += `${label} ${checkbox.checked ? 'Sí' : 'No'}<br>`;
        }
    });

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

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `delinea-esfuerzo-${license}-${new Date().toISOString().split('T')[0]}.doc`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
}
