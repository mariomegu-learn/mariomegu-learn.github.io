document.addEventListener('DOMContentLoaded', function () {
  var flags = document.querySelectorAll('.rf');
  var panel = document.getElementById('rf-panel');
  var elDefault = document.getElementById('rf-default');
  var elContent = document.getElementById('rf-content');
  var elBadge = document.getElementById('rf-badge');
  var elCat = document.getElementById('rf-cat');
  var elTitle = document.getElementById('rf-title');
  var elDesc = document.getElementById('rf-desc');

  var CAT = {
    critica: { label: 'Severidad crítica', color: '#dc2626' },
    alta:    { label: 'Severidad alta',    color: '#d97706' },
    tecnica: { label: 'Código fuente',     color: '#475569' }
  };

  function show(el) {
    flags.forEach(function (f) { f.classList.remove('rf-active'); });
    el.classList.add('rf-active');

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
    flags.forEach(function (f) { f.classList.remove('rf-active'); });
    elContent.classList.add('hidden');
    elDefault.classList.remove('hidden');
  }

  flags.forEach(function (el) {
    el.addEventListener('mouseenter', function () { show(el); });
    el.addEventListener('mouseleave', reset);
    el.addEventListener('click', function (e) {
      e.preventDefault();
      show(el);
      if (window.matchMedia('(max-width: 1023px)').matches) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
    if (!el.hasAttribute('tabindex')) { el.setAttribute('tabindex', '0'); }
    el.addEventListener('focus', function () { show(el); });
    el.addEventListener('blur', reset);
  });
});
