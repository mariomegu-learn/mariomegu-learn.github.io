document.addEventListener('DOMContentLoaded', function () {
  var pins = document.querySelectorAll('.pin');
  var panel = document.getElementById('rf-panel');
  var elDefault = document.getElementById('rf-default');
  var elContent = document.getElementById('rf-content');
  var elBadge = document.getElementById('rf-badge');
  var elCat = document.getElementById('rf-cat');
  var elTitle = document.getElementById('rf-title');
  var elDesc = document.getElementById('rf-desc');

  var CAT = {
    social:  { label: 'Ingeniería social', color: '#d13438' },
    ia:      { label: 'Señal de IA',        color: '#7c3aed' },
    tecnica: { label: 'Técnica / verificación', color: '#b45309' }
  };

  function show(el) {
    pins.forEach(function (p) { p.classList.remove('pin-active'); });
    el.classList.add('pin-active');

    var cat = CAT[el.getAttribute('data-rf-cat')] || { label: 'Red flag', color: '#d13438' };
    elBadge.textContent = el.getAttribute('data-rf-num') || '!';
    elBadge.style.backgroundColor = cat.color;
    elCat.textContent = cat.label;
    elCat.style.color = cat.color;
    elTitle.textContent = el.getAttribute('data-rf-title') || '';
    elDesc.textContent = el.getAttribute('data-rf-desc') || '';

    elDefault.classList.add('hidden');
    elContent.classList.remove('hidden');
  }

  function reset() {
    pins.forEach(function (p) { p.classList.remove('pin-active'); });
    elContent.classList.add('hidden');
    elDefault.classList.remove('hidden');
  }

  pins.forEach(function (el) {
    el.addEventListener('mouseenter', function () { show(el); });
    el.addEventListener('mouseleave', reset);
    el.addEventListener('focus', function () { show(el); });
    el.addEventListener('blur', reset);
    el.addEventListener('click', function (e) {
      e.preventDefault();
      show(el);
      if (window.matchMedia('(max-width: 1023px)').matches) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });
});
