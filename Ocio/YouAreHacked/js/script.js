// Esperar a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Activar pantalla completa al cargar
    document.documentElement.requestFullscreen().catch(err => console.log('Error al activar fullscreen:', err));

    // Prevenir salida de pantalla completa mientras la barra no esté completa
    document.addEventListener('fullscreenchange', function() {
        if (!document.fullscreenElement && !progressComplete) {
            document.documentElement.requestFullscreen().catch(err => console.log('Error al reactivar fullscreen:', err));
        }
    });

    const overlay = document.getElementById('overlay');
    const closeButton = document.getElementById('closeOverlay');
    const mainContent = document.getElementById('mainContent');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    let progress = 0;
    let progressComplete = false;
    const progressInterval = setInterval(function() {
        progress += 1; // Incremento fijo para simular descarga lenta
        if (progress >= 100) {
            progress = 100;
            progressComplete = true;
            clearInterval(progressInterval);
            document.getElementById('closeOverlay').style.display = 'block'; // Mostrar botón al completar
        }
        progressBar.style.width = progress + '%';
        progressText.textContent = 'Descargando datos... ' + Math.round(progress) + '%';
    }, 600);

    // Función para cerrar el overlay y mostrar el contenido principal
    function closeOverlay() {
        clearInterval(progressInterval); // Detener la barra de progreso
        overlay.style.display = 'none';
        mainContent.style.opacity = '1';
        // Salir de pantalla completa
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.log('Error al salir de fullscreen:', err));
        }
    }

    // Event listener para el botón de cerrar
    closeButton.addEventListener('click', closeOverlay);

    // También permitir cerrar con la tecla Escape solo después de completar la barra
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && overlay.style.display !== 'none' && progressComplete) {
            closeOverlay();
        } else if (event.key === 'Escape' && !progressComplete) {
            // Prevenir salida de fullscreen con Escape mientras no esté completa
            event.preventDefault();
        }
        // Prevenir F11 mientras no esté completa
        if (event.key === 'F11' && !progressComplete) {
            event.preventDefault();
        }
    });
});