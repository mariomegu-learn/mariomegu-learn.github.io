// Selección de elementos
const button = document.getElementById("actionBtn");
const message = document.getElementById("message");

// Evento click
button.addEventListener("click", () => {
  message.textContent = "✅ El JavaScript está funcionando correctamente";
  message.style.color = "var(--success-color)";
});