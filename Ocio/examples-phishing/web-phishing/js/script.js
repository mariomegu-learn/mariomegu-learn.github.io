// JavaScript for browser simulation - no dynamic updates needed for this phishing example
// Demuestra navegador InPrivate en la barra superior como solo texto
const urlBar = document.querySelector('.browser-url');
urlBar.style.background = '#1a1a1a';
urlBar.style.color = '#aecbfa';
urlBar.style.border = '1px solid #333';
// Ejemplo de reacción (no funcionalidad real):
document.querySelectorAll('.login-input').forEach(inp => {
  inp.addEventListener('focus', e => e.target.style.borderColor = '#ffe275');
  inp.addEventListener('blur', e => e.target.style.borderColor = '#707070');
});