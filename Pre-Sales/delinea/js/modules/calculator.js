'use strict';

import { getQuantity, isChecked } from './ui.js';

/**
 * @file calculator.js
 * @description This module contains the core logic for calculating the effort hours for each task.
 */

/**
 * Calculates the effort and quantity for a given task based on the selected license and user inputs.
 *
 * This function determines the effort for a task by considering several factors:
 * - If the task is a section header, it returns empty values.
 * - If the task is controlled by a checkbox, the effort is the base value if checked, otherwise zero.
 * - If the task has a variable quantity (like launchers or session recordings), it calculates the quantity based on user input
 *   and multiplies it by the task's duration.
 * - For session recordings (task '6.1'), the quantity is derived from the total number of launcher secrets, capped at 15.
 * - For all other tasks, the effort is the base effort defined for the selected license type.
 *
 * @param {object} task The task object for which to calculate the effort. It contains properties like id, quantity, duration, standardBase, and platinumBase.
 * @param {string} license The currently selected license type ('standard' or 'platinum').
 * @param {Array<object>} tasks The complete list of all task objects, used to calculate dependencies (e.g., for session recording).
 * @returns {{effort: string, qty: (string|number)}} An object containing the calculated effort formatted to two decimal places, and the relevant quantity.
 *                                                     Returns empty strings for section headers.
 */
export function calculateEffort(task, license, tasks) {
    // Section headers do not have effort or quantity.
    if (task.isSectionHeader) return { effort: '', qty: '' };

    let qty = task.quantity;
    let effort;
    const baseEffort = license === 'standard' ? task.standardBase : task.platinumBase;

    // Check if the task is controlled by a checkbox.
    if (document.getElementById('checkbox-' + task.id)) {
        effort = isChecked(task.id) ? baseEffort : 0;
    } 
    // Check if the task quantity is variable (i.e., set by an input/slider).
    else if (qty === 'variable') {
        // Special calculation for session recording based on the number of launcher secrets.
        if (task.id === '6.1') {
            const totalLaunchers = tasks
                .filter(t => t.id.startsWith('4.')) // Filter for launcher tasks.
                .reduce((acc, t) => acc + getQuantity(t.id), 0);
            qty = Math.min(totalLaunchers, 15); // Cap the quantity at the maximum available.
        } else {
            qty = getQuantity(task.id); // Get quantity from the corresponding input field.
        }
        effort = qty * task.duration; // Effort is the product of quantity and duration per unit.
    } 
    // For tasks with a fixed quantity, use the base effort for the selected license.
    else {
        effort = baseEffort;
    }

    return { effort: parseFloat(effort || 0).toFixed(2), qty: qty };
}
