document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const toggleConfirmBtn = document.getElementById('toggle-confirm');
    const validateBtn = document.getElementById('validate-btn');
    const resultsContainer = document.getElementById('validation-results');

    // Common patterns to check against
    const commonPatterns = [
        '123456', 'password', '123456789', '12345678', '12345',
        'qwerty', 'abc123', 'password1', '1234567', '1234567890',
        'letmein', 'welcome', 'admin', 'login', 'passw0rd'
    ];

    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', function() {
        togglePasswordVisibility(passwordInput, togglePasswordBtn);
    });

    toggleConfirmBtn.addEventListener('click', function() {
        togglePasswordVisibility(confirmPasswordInput, toggleConfirmBtn);
    });


    // Function to toggle password visibility
    function togglePasswordVisibility(inputElement, toggleButton) {
        const type = inputElement.getAttribute('type') === 'password' ? 'text' : 'password';
        inputElement.setAttribute('type', type);

        // Change icon
        const icon = toggleButton.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    }

    // Main password validation function
    function validatePassword() {
        const password = passwordInput.value;

        // Clear previous results
        resultsContainer.innerHTML = '';

        // Validate password against 2025 standards
        const validationResults = validatePasswordStrength(password);

        // Display validation results
        displayValidationResults(validationResults);
    }

    // Validate password strength against 2025 standards
    function validatePasswordStrength(password) {
        const results = {
            length: password.length >= 12,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            specialChar: /[!@#$%^&*]/.test(password),
            noCommonPatterns: !commonPatterns.some(pattern => password.toLowerCase().includes(pattern)),
            noPersonalInfo: !containsPersonalInfo(password),
            entropy: calculateEntropy(password)
        };

        return results;
    }

    // Check if password contains personal information (simplified)
    function containsPersonalInfo(password) {
        // In a real application, this would check against user's actual personal info
        const personalPatterns = ['nombre', 'apellido', 'fecha', 'cumple', 'direccion', 'telefono'];
        return personalPatterns.some(pattern => password.toLowerCase().includes(pattern));
    }

    // Calculate password entropy (measure of unpredictability)
    function calculateEntropy(password) {
        let charsetSize = 0;

        if (/[a-z]/.test(password)) charsetSize += 26;
        if (/[A-Z]/.test(password)) charsetSize += 26;
        if (/\d/.test(password)) charsetSize += 10;
        if (/[!@#$%^&*]/.test(password)) charsetSize += 10;

        return Math.log2(charsetSize) * password.length;
    }

    // Display validation results
    function displayValidationResults(results) {
        const resultItems = [];

        // Check overall password strength
        const isStrong = Object.values(results).every(Boolean) && results.entropy >= 60;

        // Add overall result
        if (isStrong) {
            resultItems.push(createResultItem('¡Contraseña segura!', 'validation-success'));
        } else {
            resultItems.push(createResultItem('Contraseña débil', 'validation-error'));
        }

        // Add detailed validation results
        resultItems.push(createResultItem(
            `Longitud (${passwordInput.value.length}/12): ${results.length ? '✓' : '✗'}`,
            results.length ? 'validation-success' : 'validation-error'
        ));

        resultItems.push(createResultItem(
            `Mayúsculas: ${results.uppercase ? '✓' : '✗'}`,
            results.uppercase ? 'validation-success' : 'validation-error'
        ));

        resultItems.push(createResultItem(
            `Minúsculas: ${results.lowercase ? '✓' : '✗'}`,
            results.lowercase ? 'validation-success' : 'validation-error'
        ));

        resultItems.push(createResultItem(
            `Números: ${results.number ? '✓' : '✗'}`,
            results.number ? 'validation-success' : 'validation-error'
        ));

        resultItems.push(createResultItem(
            `Caracteres especiales: ${results.specialChar ? '✓' : '✗'}`,
            results.specialChar ? 'validation-success' : 'validation-error'
        ));

        resultItems.push(createResultItem(
            `No patrones comunes: ${results.noCommonPatterns ? '✓' : '✗'}`,
            results.noCommonPatterns ? 'validation-success' : 'validation-error'
        ));

        resultItems.push(createResultItem(
            `No información personal: ${results.noPersonalInfo ? '✓' : '✗'}`,
            results.noPersonalInfo ? 'validation-success' : 'validation-error'
        ));

        resultItems.push(createResultItem(
            `Entropía (${results.entropy.toFixed(2)} bits): ${results.entropy >= 60 ? '✓' : '✗'}`,
            results.entropy >= 60 ? 'validation-success' : 'validation-warning'
        ));

        // Add suggestions if password is weak
        if (!isStrong) {
            resultItems.push(createResultItem('Sugerencias:', 'validation-warning'));
            if (!results.length) resultItems.push(createResultItem('Añade más caracteres (mínimo 12)', 'validation-warning'));
            if (!results.uppercase) resultItems.push(createResultItem('Añade al menos una letra mayúscula', 'validation-warning'));
            if (!results.lowercase) resultItems.push(createResultItem('Añade al menos una letra minúscula', 'validation-warning'));
            if (!results.number) resultItems.push(createResultItem('Añade al menos un número', 'validation-warning'));
            if (!results.specialChar) resultItems.push(createResultItem('Añade al menos un carácter especial (!@#$%^&*)', 'validation-warning'));
            if (!results.noCommonPatterns) resultItems.push(createResultItem('Evita patrones comunes', 'validation-warning'));
            if (!results.noPersonalInfo) resultItems.push(createResultItem('Evita información personal', 'validation-warning'));
            if (results.entropy < 60) resultItems.push(createResultItem('Aumenta la complejidad para mejorar la entropía', 'validation-warning'));
        }

        // Add all results to the container
        resultsContainer.append(...resultItems);
    }

    // Helper function to create result items
    function createResultItem(text, className) {
        const item = document.createElement('p');
        item.textContent = text;
        item.className = `result-item ${className}`;
        return item;
    }

    // Helper function to show simple results
    function showResult(message, className) {
        resultsContainer.innerHTML = `<p class="result-item ${className}">${message}</p>`;
    }
});