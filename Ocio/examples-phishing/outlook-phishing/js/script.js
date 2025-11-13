document.addEventListener('DOMContentLoaded', function() {
  function updateDateTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }); // HH:MM:SS format
    const dateTimeStr = `${dateStr} ${timeStr}`;

    // Update all "Enviado:" fields
    const sentElements = document.querySelectorAll('p');
    sentElements.forEach(element => {
      if (element.textContent.includes('Enviado:')) {
        const span = element.querySelector('span');
        if (span) {
          // Replace the entire content after "Enviado:"
          const newContent = element.innerHTML.replace(/(Enviado:).*?(<\/span>)/, `$1 ${dateTimeStr}$2`);
          element.innerHTML = newContent;
        }
      }
    });
  }

  // Update immediately on page load
  updateDateTime();

  // Update every second
  setInterval(updateDateTime, 1000);
});