'use strict';

import { getQuantity, isChecked } from './ui.js';

export function calculateEffort(task, license, tasks) {
    if (task.isSectionHeader) return { effort: '', qty: '' };

    let qty = task.quantity;
    let effort;
    const baseEffort = license === 'standard' ? task.standardBase : task.platinumBase;

    if (document.getElementById('checkbox-' + task.id)) {
        effort = isChecked(task.id) ? baseEffort : 0;
    } else if (qty === 'variable') {
        if (task.id === '6.1') {
            const total = tasks.filter(t => t.id.startsWith('4.')).reduce((acc, t) => acc + getQuantity(t.id), 0);
            qty = Math.min(total, 15);
        } else {
            qty = getQuantity(task.id);
        }
        effort = qty * task.duration;
    } else {
        effort = baseEffort;
    }

    return { effort: parseFloat(effort || 0).toFixed(2), qty: qty };
}
