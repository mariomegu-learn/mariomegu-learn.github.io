'use strict';

export function showOverlay() {
    document.getElementById('overlay').classList.add('show');
}

export function hideOverlay() {
    document.getElementById('overlay').classList.remove('show');
}

export function getQuantity(id) {
    const input = document.getElementById('input-' + id);
    return input ? parseInt(input.value) || 0 : 0;
}

export function isChecked(id) {
    const checkbox = document.getElementById('checkbox-' + id);
    return checkbox ? checkbox.checked : false;
}

export function getSelectedLicense() {
    const activeButton = document.querySelector('.btn-license.active');
    return activeButton ? activeButton.getAttribute('data-value') : 'standard';
}

export function setSelectedLicense(licenseType) {
    document.querySelectorAll('.btn-license').forEach(btn => btn.classList.remove('active'));
    const selectedButton = document.getElementById('license-' + licenseType);
    if (selectedButton) selectedButton.classList.add('active');
}

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

export function renderTable(tasks, calculateEffort, getSelectedLicense) {
    const license = getSelectedLicense();
    updateControlsState(tasks, getSelectedLicense);
    const header = document.getElementById('effort-header');
    const licenseName = license === 'standard' ? 'Estándar' : 'Platino';
    header.textContent = `${licenseName} - Horas`;

    const tbody = document.querySelector('#effort-table tbody');
    tbody.innerHTML = '';
    let total = 0;
    const visibleSections = new Set();

    tasks.forEach(task => {
        if (task.isSectionHeader) return;
        const { effort } = calculateEffort(task, license);
        if (parseFloat(effort) > 0) {
            visibleSections.add(task.id.split('.')[0]);
        }
    });

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
            const subtaskClass = task.id.includes('.') ? 'subtask' : '';
            row.innerHTML = `
                <td class="text-center" data-label="Ítem">${task.id}</td>
                <td class="text-justify ${subtaskClass}" data-label="Tarea">${task.description}</td>
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

export function updateAvailabilityDisplay(tasks) {
    const totalSecrets = tasks.filter(t => t.id.startsWith('4.')).reduce((acc, t) => acc + getQuantity(t.id), 0);
    const available = 15 - totalSecrets;
    const availabilityText = document.getElementById('availability-text');
    const warningElement = document.getElementById('session-warning');
    warningElement.style.display = 'block';

    if (totalSecrets > 15) {
        warningElement.className = 'alert alert-danger';
        availabilityText.innerHTML = `<i class="fas fa-exclamation-triangle"></i> El total de secretos excede los 15; se limita a 15. (Disponibles: ${Math.max(0, available)})`;
    } else if (available === 0) {
        warningElement.className = 'alert alert-danger';
        availabilityText.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Se ha alcanzado el máximo de secretos (15).`;
    } else if (totalSecrets > 12) {
        warningElement.className = 'alert alert-warning';
        availabilityText.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Acercándose al máximo de secretos. (Disponibles: ${available})`;
    } else {
        warningElement.className = 'alert alert-info';
        availabilityText.innerHTML = `<i class="fas fa-info-circle"></i> Máximo de secretos: 15. (Disponibles: ${available})`;
    }
}

export function setButtonLoading(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.spinner-border');
    if (isLoading) {
        btnText.classList.add('d-none');
        spinner.classList.remove('d-none');
        button.disabled = true;
    } else {
        btnText.classList.remove('d-none');
        spinner.classList.add('d-none');
        button.disabled = false;
    }
}

export function loadTheme() {
    let theme = localStorage.getItem('theme');
    if (theme === null) {
        theme = 'dark';
        localStorage.setItem('theme', 'dark');
    }
    document.body.setAttribute('data-theme', theme);
}
