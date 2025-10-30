// Presentation core
const slides = Array.from(document.querySelectorAll('.slide'));
let idx = 0;
const total = slides.length;
const progressBar = document.getElementById('progressBar');
const slideIndex = document.getElementById('slideIndex');
const notesBox = document.getElementById('notesBox');

function show(i){
  slides.forEach(s=>s.classList.remove('active'));
  slides[i].classList.add('active');
  idx = i;
  slideIndex.textContent = (i+1) + ' / ' + total;
  const pct = Math.round(((i+1)/total)*100);
  progressBar.style.width = pct + '%';
  // load notes
  const notes = slides[i].dataset.notes || '';
  notesBox.textContent = notes;
}

document.getElementById('prev').addEventListener('click', ()=> show(Math.max(0, idx-1)));
document.getElementById('next').addEventListener('click', ()=> show(Math.min(total-1, idx+1)));

// keyboard nav and quick actions
window.addEventListener('keydown', (e)=>{
  if(e.key === 'ArrowRight') show(Math.min(total-1, idx+1));
  if(e.key === 'ArrowLeft') show(Math.max(0, idx-1));
  if(e.key.toLowerCase() === 'n') toggleNotes();
  if(e.key.toLowerCase() === 'p') openPoll();
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase() === 's'){
    e.preventDefault(); window.print();
  }
});

// Speaker notes
let notesVisible = false;
const toggleBtn = document.getElementById('toggleNotes');
toggleBtn.addEventListener('click', toggleNotes);
function toggleNotes(){
  notesVisible = !notesVisible;
  notesBox.style.display = notesVisible ? 'block' : 'none';
  notesBox.setAttribute('aria-hidden', notesVisible ? 'false' : 'true');
}

// Poll logic (local)
const pollModal = document.getElementById('pollModal');
const pollOptions = document.getElementById('pollOptions');
const pollSummary = document.getElementById('pollSummary');
const openPollBtn = document.getElementById('openPoll');
const closePollBtn = document.getElementById('closePoll');

let pollData = { si:0, 'mas-o-menos':0, no:0 };
function openPoll(){ pollModal.style.display='flex'; renderPoll(); }
function closePoll(){ pollModal.style.display='none'; }
openPollBtn.addEventListener('click', openPoll);
closePollBtn.addEventListener('click', closePoll);
pollOptions.addEventListener('click', (e)=>{
  const btn = e.target.closest('button'); if(!btn) return;
  const v = btn.dataset.val; pollData[v]++; renderPoll();
});
function renderPoll(){
  const total = pollData.si + pollData['mas-o-menos'] + pollData.no;
  if(total === 0) pollSummary.textContent = 'Sin respuestas aún';
  else{
    pollSummary.textContent = `Sí: ${pollData.si} · Más o menos: ${pollData['mas-o-menos']} · No: ${pollData.no}`;
  }
}

// Init
show(0);

// Accessibility: focus first button when modal opens
const observer = new MutationObserver((m)=>{
  if(pollModal.style.display === 'flex'){
    pollOptions.querySelector('button')?.focus();
  }
});
observer.observe(pollModal, {attributes:true, attributeFilter:['style']});

// small helper: expose a printable checklist for attendees
function generateChecklist(){
  return `Checklist de 4 semanas:\n\n1) Instalar gestor de contraseñas.\n2) Crear contraseña maestra (passphrase larga).\n3) Activar MFA en correo y banca.\n4) Verificar cuentas en Have I Been Pwned.\n5) Renovar contraseñas críticas.`;
}
// allow presenter to copy checklist with Ctrl+Shift+C
window.addEventListener('keydown', (e)=>{
  if(e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c'){
    navigator.clipboard?.writeText(generateChecklist()).then(()=>{
      alert('Checklist copiada al portapapeles');
    }).catch(()=>{});
  }
});