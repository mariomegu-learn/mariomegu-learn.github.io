'use strict';

import { showOverlay, hideOverlay, getSelectedLicense, setSelectedLicense, renderTable, updateAvailabilityDisplay, setButtonLoading, loadTheme } from './modules/ui.js';
import { calculateEffort } from './modules/calculator.js';
import { exportToWord } from './modules/export.js';

(async () => {
    let tasks = [];
    let resetModal;

    try {
        const response = await fetch('data/tasks.json');
        tasks = await response.json();
    } catch (error) {
        console.error('Error al cargar las tareas:', error);
        return;
    }

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

    function handleExportClick() {
        const btn = document.getElementById('export-btn');
        setButtonLoading(btn, true);
        setTimeout(() => {
            exportToWord(tasks);
            setButtonLoading(btn, false);
        }, 500);
    }

    function resetToDefaults() {
        setSelectedLicense('standard');
        document.getElementById('input-4.1').value = '4';
        document.getElementById('input-4.2').value = '4';
        document.getElementById('input-4.3').value = '4';
        document.getElementById('input-4.4').value = '3';
        tasks.forEach(task => {
            const checkbox = document.getElementById('checkbox-' + task.id);
            if (checkbox) checkbox.checked = (task.id === '12.1');
        });
        handleCalculateClick();
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => { clearTimeout(timeout); func(...args); };
            clearTimeout(timeout); timeout = setTimeout(later, wait);
        };
    }

    const debouncedRenderTable = debounce(() => renderTable(tasks, (task, license) => calculateEffort(task, license, tasks), getSelectedLicense), 300);

    // --- Main Execution ---
    loadTheme();
    handleCalculateClick();

    document.getElementById('theme-toggle-btn').addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    document.getElementById('calculate-btn').addEventListener('click', handleCalculateClick);
    document.getElementById('export-btn').addEventListener('click', handleExportClick);

    resetModal = new bootstrap.Modal(document.getElementById('reset-confirm-modal'));
    document.getElementById('reset-btn').addEventListener('click', () => {
        resetModal.show();
    });
    document.getElementById('confirm-reset-btn').addEventListener('click', () => {
        const btn = document.getElementById('reset-btn');
        setButtonLoading(btn, true);
        resetModal.hide();
        setTimeout(() => {
            resetToDefaults();
            setButtonLoading(btn, false);
        }, 500);
    });

    document.querySelectorAll('.btn-license').forEach(button => {
        button.addEventListener('click', () => {
            setSelectedLicense(button.getAttribute('data-value'));
            debouncedRenderTable();
        });
    });

    tasks.forEach(task => {
        const el = document.getElementById('checkbox-' + task.id) || document.getElementById('input-' + task.id);
        if (el) {
            el.addEventListener('input', () => {
                if (el.id.startsWith('input-')) {
                    updateAvailabilityDisplay(tasks);
                }
                debouncedRenderTable();
            });
        }
    });

})();
