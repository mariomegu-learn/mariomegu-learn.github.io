// Esperar a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('overlay');
    const closeButton = document.getElementById('closeOverlay');
    const mainContent = document.getElementById('mainContent');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    let progress = 0;
    const progressInterval = setInterval(function() {
        progress += Math.random() * 5; // Incremento aleatorio para simular descarga
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
        }
        progressBar.style.width = progress + '%';
        progressText.textContent = 'Descargando datos... ' + Math.round(progress) + '%';
    }, 200);

    // Función para cerrar el overlay y mostrar el contenido principal
    function closeOverlay() {
        clearInterval(progressInterval); // Detener la barra de progreso
        overlay.style.display = 'none';
        mainContent.style.opacity = '1';
    }

    // Event listener para el botón de cerrar
    closeButton.addEventListener('click', closeOverlay);

    // También permitir cerrar con la tecla Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && overlay.style.display !== 'none') {
            closeOverlay();
        }
    });
});