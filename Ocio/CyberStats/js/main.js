// ============================================
// Main Application Module
// Coordinates all modules and manages app lifecycle
// ============================================

(function () {
    'use strict';

    let attackStream;
    let animationFrameId;
    let lastFrameTime = 0;
    let frameCount = 0;
    let lastFpsUpdate = 0;

    // Initialize application
    function init() {
        console.log('🛡️ CyberStats - Initializing...');

        // Initialize 3D Globe
        const globeContainer = document.getElementById('globe-container');
        if (!globeContainer) {
            console.error('Globe container not found');
            return;
        }

        const { scene, camera, renderer } = Globe.init(globeContainer);
        console.log('✅ Globe initialized');

        // Initialize Attack Visualizer
        AttackVisualizer.init(scene, Globe.getGlobe());
        console.log('✅ Attack Visualizer initialized');

        // Create and start attack stream
        attackStream = DataGenerator.createStream();

        attackStream.on((attack) => {
            // Create visual representation
            AttackVisualizer.createAttackArc(attack);

            // Record statistics
            Statistics.recordAttack(attack);
        });

        attackStream.start();
        console.log('✅ Attack stream started');

        // Initialize UI Controls
        UIControls.init(attackStream);
        console.log('✅ UI Controls initialized');

        // Start animation loop
        startAnimationLoop();
        console.log('✅ Animation loop started');

        // Add welcome message
        setTimeout(() => {
            showWelcomeMessage();
        }, 500);

        console.log('🚀 CyberStats - Ready!');
    }

    // Main animation loop
    function startAnimationLoop() {
        function animate(currentTime) {
            animationFrameId = requestAnimationFrame(animate);

            // Update FPS counter
            updateFPS(currentTime);

            // Update attack visualizations
            AttackVisualizer.update();

            // Render globe
            Globe.animate();
        }

        animate(0);
    }

    // Update FPS counter
    function updateFPS(currentTime) {
        frameCount++;

        if (currentTime - lastFpsUpdate >= 1000) {
            const fps = Math.round((frameCount * 1000) / (currentTime - lastFpsUpdate));
            const fpsCounter = document.getElementById('fps-counter');
            if (fpsCounter) {
                fpsCounter.textContent = `${fps} FPS`;

                // Color code based on performance
                if (fps >= 50) {
                    fpsCounter.style.color = '#00ff88';
                } else if (fps >= 30) {
                    fpsCounter.style.color = '#ff6b35';
                } else {
                    fpsCounter.style.color = '#ff3366';
                }
            }

            frameCount = 0;
            lastFpsUpdate = currentTime;
        }
    }

    // Show welcome message
    function showWelcomeMessage() {
        const feedContainer = document.getElementById('live-feed');
        if (!feedContainer) return;

        const welcomeItem = document.createElement('div');
        welcomeItem.className = 'feed-item';
        welcomeItem.style.borderLeftColor = '#00d9ff';
        welcomeItem.innerHTML = `
            <div class="feed-item-header">
                <span class="feed-item-type">🛡️ Sistema Iniciado</span>
                <span class="feed-item-time">${new Date().toLocaleTimeString('es-ES')}</span>
            </div>
            <div class="feed-item-route">
                Monitoreo de ciberamenazas globales activo
            </div>
        `;

        feedContainer.insertBefore(welcomeItem, feedContainer.firstChild);
    }

    // Handle visibility change (pause when tab is hidden)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Optionally pause when tab is hidden to save resources
            // attackStream.stop();
        } else {
            // Resume when tab is visible
            // attackStream.start();
        }
    });

    // Handle window unload
    window.addEventListener('beforeunload', () => {
        if (attackStream) {
            attackStream.stop();
        }
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    });

    // Start application when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
