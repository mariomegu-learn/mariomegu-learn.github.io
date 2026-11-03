'use strict';

/**
 * @file Snoop-proof.js
 * @description This module attempts to prevent users from accessing developer tools.
 * WARNING: This is not a foolproof method and can be easily bypassed. It may also negatively affect user experience.
 * For any real security, you should rely on server-side validation and logic.
 */

(function() {
    // --- Constant debugger statement ---
    // This makes it difficult to use the debugger.
    // A user can disable breakpoints to get around this.
    function antiDebug() {
        debugger;
        requestAnimationFrame(antiDebug);
    }
    // Uncomment the line below to enable the anti-debugging loop.
    // Be aware that this can impact performance and is very aggressive.
    // requestAnimationFrame(antiDebug);

    // --- DevTools detection using console object ---
    const devtools = {
        open: false,
        orientation: null
    };
    const threshold = 160;
    const emitEvent = (isOpen, orientation) => {
        window.dispatchEvent(new CustomEvent('devtoolschange', {
            detail: {
                isOpen,
                orientation
            }
        }));
    };

    setInterval(() => {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        const orientation = widthThreshold ? 'vertical' : 'horizontal';

        if (
            !(heightThreshold && widthThreshold) &&
            ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) || widthThreshold || heightThreshold)
        ) {
            if (!devtools.open || devtools.orientation !== orientation) {
                emitEvent(true, orientation);
            }
            devtools.open = true;
            devtools.orientation = orientation;
        } else {
            if (devtools.open) {
                emitEvent(false, null);
            }
            devtools.open = false;
            devtools.orientation = null;
        }
    }, 500);

    // --- Handle devtools change event ---
    window.addEventListener('devtoolschange', event => {
        if(event.detail.isOpen) {
            // Option 1: Clear the console and show a warning
            console.clear();
            console.log('%cHold Up!', 'color: blue; font-size: 40px; font-weight: bold;');
            console.log('%cThis area is for developers only. Please close the developer console.', 'font-size: 18px;');

            // Option 2: Redirect the user (very aggressive)
            // window.location.href = 'https://www.google.com';
        }
    });


    // --- Block keyboard shortcuts ---
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+J
        if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+C
        if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
            e.preventDefault();
            return false;
        }
        // Ctrl+U
        if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
            e.preventDefault();
            return false;
        }
         // Ctrl+S
        if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
            e.preventDefault();
            return false;
        }
    });

    // --- Block context menu (right-click) ---
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

})();