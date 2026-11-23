document.addEventListener('DOMContentLoaded', function () {
  var flags = document.querySelectorAll('.redflag');
  var panel = document.getElementById('rf-panel');
  var elDefault = document.getElementById('rf-default');
  var elContent = document.getElementById('rf-content');
  var elBadge = document.getElementById('rf-badge');
  var elTitle = document.getElementById('rf-title');
  var elDesc = document.getElementById('rf-desc');

  function show(el) {
    flags.forEach(function (f) { f.classList.remove('rf-active'); });
    el.classList.add('rf-active');

    elBadge.textContent = el.getAttribute('data-rf-num') || '!';
    elTitle.textContent = el.getAttribute('data-rf-title') || '';
    elDesc.textContent = el.getAttribute('data-rf-desc') || '';

    elDefault.classList.add('hidden');
    elContent.classList.remove('hidden');
  }

  function reset() {
    flags.forEach(function (f) { f.classList.remove('rf-active'); });
    elContent.classList.add('hidden');
    elDefault.classList.remove('hidden');
  }

  flags.forEach(function (el) {
    el.addEventListener('mouseenter', function () { show(el); });
    el.addEventListener('mouseleave', reset);
    el.addEventListener('focus', function () { show(el); });
    el.addEventListener('blur', reset);
    el.addEventListener('click', function (e) {
      e.preventDefault();
      // Si el elemento enlaza a una página de análisis, navega hacia ella.
      var href = el.getAttribute('data-rf-href');
      if (href) {
        window.location.href = href;
        return;
      }
      show(el);
      // En móvil, acerca el panel para que la explicación sea visible.
      if (window.matchMedia('(max-width: 1023px)').matches) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
    // Accesibilidad por teclado para elementos no enfocables de por sí.
    if (!el.hasAttribute('tabindex') && el.tagName !== 'A') {
      el.setAttribute('tabindex', '0');
    }
  });
});
