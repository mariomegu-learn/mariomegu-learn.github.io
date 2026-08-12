const slides=[...document.querySelectorAll('.slide')];const counter=document.querySelector('#slideCounter');const progress=document.querySelector('#progressBar');const dots=document.querySelector('#dots');const prev=document.querySelector('#prevButton');const next=document.querySelector('#nextButton');let current=0;let sound=true;let startX=0;
slides.forEach((_,i)=>{const dot=document.createElement('button');dot.className='dot';dot.setAttribute('aria-label',`Ir a la diapositiva ${i+1}`);dot.addEventListener('click',()=>show(i));dots.appendChild(dot)});
function beep(){if(!sound)return;try{const audio=new(window.AudioContext||window.webkitAudioContext)();const oscillator=audio.createOscillator();const gain=audio.createGain();oscillator.frequency.value=520;gain.gain.value=.025;oscillator.connect(gain);gain.connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+.045)}catch{}}
const video = document.querySelector('video');

function show(index) {
  if (index < 0 || index >= slides.length || index === current) return;
  slides[current].classList.add('leaving');
  slides[current].classList.remove('active');
  current = index;
  slides[current].classList.remove('leaving');
  slides[current].classList.add('active');
  const video = document.querySelector('video');
  if(video) {
    if(slides[current].id === 'slide-6') video.play();
    else video.pause();
  }
  update();
  beep();
  location.hash = `slide-${current + 1}`;
  if (current === slides.length - 1) {
    video.play();
  } else {
    video.pause();
  }
}
function update(){
  counter.textContent=`${String(current+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
  progress.style.width=`${((current+1)/slides.length)*100}%`;
  [...dots.children].forEach((d,i)=>d.classList.toggle('active',i===current));
  prev.disabled=current===0;
  next.innerHTML=current===slides.length-1?'<span>Inicio</span><i class="fa-solid fa-rotate-right"></i>':'<span>Siguiente</span><i class="fa-solid fa-arrow-right"></i>';
  
  const video = document.querySelector('video');
  if(video) {
    if(slides[current].id === 'slide-6') video.play();
    else video.pause();
  }
}
prev.addEventListener('click',()=>show(current-1));next.addEventListener('click',()=>current===slides.length-1?show(0):show(current+1));document.addEventListener('keydown',e=>{if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();show(current+1)}if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();show(current-1)}if(e.key==='Home')show(0);if(e.key==='End')show(slides.length-1)});
document.addEventListener('touchstart',e=>startX=e.changedTouches[0].screenX,{passive:true});document.addEventListener('touchend',e=>{const distance=e.changedTouches[0].screenX-startX;if(Math.abs(distance)>60)show(current+(distance<0?1:-1))},{passive:true});
document.querySelector('#fullscreenButton').addEventListener('click',()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()});document.querySelector('#soundButton').addEventListener('click',e=>{sound=!sound;e.currentTarget.innerHTML=`<i class="fa-solid fa-volume-${sound?'high':'xmark'}"></i>`;e.currentTarget.setAttribute('aria-label',sound?'Desactivar sonidos':'Activar sonidos')});

if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const plane = document.createElement('div');
  const smokeColors = ['#F6A6BB', '#F4A261', '#FDCF50'];
  let targetX = 0;
  let targetY = 0;
  let planeX = 0;
  let planeY = 0;
  let angle = 0;
  let lastSmoke = 0;
  let isPointerReady = false;

  plane.className = 'cursor-plane';
  plane.textContent = '🛩️';
  document.body.appendChild(plane);

  const createSmoke = (x, y) => {
    const smoke = document.createElement('span');
    const size = 10 + Math.random() * 16;
    const driftX = -18 + Math.random() * 36;
    const driftY = -18 + Math.random() * 36;
    smoke.className = 'cursor-smoke';
    smoke.style.left = `${x - size / 2}px`;
    smoke.style.top = `${y - size / 2}px`;
    smoke.style.width = `${size}px`;
    smoke.style.height = `${size}px`;
    smoke.style.background = smokeColors[Math.floor(Math.random() * smokeColors.length)];
    smoke.animate([
      { opacity: .7, transform: 'scale(.45)' },
      { opacity: 0, transform: `translate(${driftX}px, ${driftY}px) scale(2.6)` }
    ], { duration: 700, easing: 'ease-out' }).finished.then(() => smoke.remove());
    document.body.appendChild(smoke);
  };

  const animatePlane = () => {
    const deltaX = targetX - planeX;
    const deltaY = targetY - planeY;
    const distance = Math.hypot(deltaX, deltaY);

    planeX += deltaX * .18;
    planeY += deltaY * .18;

    if (distance > .5) {
      const targetAngle = Math.atan2(deltaY, deltaX) * 180 / Math.PI + 90;
      const rotationDelta = ((targetAngle - angle + 540) % 360) - 180;
      angle += rotationDelta * .14;
    }

    plane.style.left = `${planeX - 17}px`;
    plane.style.top = `${planeY - 17}px`;
    plane.style.transform = `rotate(${angle}deg)`;
    requestAnimationFrame(animatePlane);
  };

  window.addEventListener('pointermove', (event) => {
    const now = performance.now();

    if (!isPointerReady) {
      planeX = targetX = event.clientX;
      planeY = targetY = event.clientY;
      isPointerReady = true;
      plane.classList.add('is-visible');
    }

    const distance = Math.hypot(event.clientX - targetX, event.clientY - targetY);
    targetX = event.clientX;
    targetY = event.clientY;

    if (distance > 4 && now - lastSmoke > 42) {
      createSmoke(planeX, planeY);
      lastSmoke = now;
    }
  });

  window.addEventListener('pointerleave', () => plane.classList.remove('is-visible'));
  requestAnimationFrame(animatePlane);
}
const circuitSwitch=document.querySelector('#circuitSwitch');circuitSwitch.addEventListener('click',()=>{const on=!circuitSwitch.classList.contains('on');circuitSwitch.classList.toggle('on',on);document.querySelector('#circuitBoard').classList.toggle('on',on);circuitSwitch.setAttribute('aria-checked',String(on));circuitSwitch.querySelector('b').textContent=on?'APAGAR':'ENCENDER';document.querySelector('#switchStatus').textContent=on?'Fase 1 · Circuito encendido':'Fase 0 · Circuito apagado';beep()});
document.querySelector('.brand').addEventListener('click', (e) => { e.preventDefault(); show(0); });
const hashIndex=Number(location.hash.replace('#slide-',''))-1;

const modal = document.querySelector('#imageModal');
const modalImg = document.querySelector('#modalImg');
const infoModal = document.querySelector('#infoModal');
const modalCloseBtns = document.querySelectorAll('.modal-close');

const nodeData = {
    'Pilas': {
        icon: '<i class="fa-solid fa-battery-full"></i>',
        title: 'Baterías',
        desc: 'Las pilas almacenan energía química y la liberan como electricidad. En nuestro avión, usamos 2 pilas AA para darle fuerza a los motores.'
    },
    'Interruptor': {
        icon: '<i class="fa-solid fa-toggle-on"></i>',
        title: 'Interruptor',
        desc: 'Es como una puerta para los electrones. Cuando está "cerrado" (ON), el camino está completo y la electricidad fluye. Cuando está "abierto" (OFF), el camino se rompe y el avión se detiene.'
    },
    'Motores': {
        icon: '<i class="fa-solid fa-gears"></i>',
        title: 'Motores Dinamo 12V',
        desc: 'Estos motores de corriente continua usan electroimanes para girar cuando reciben electricidad. Son pequeños pero muy potentes para mover las hélices de nuestro avión.'
    },
    'Hélices': {
        icon: '<i class="fa-solid fa-fan"></i>',
        title: 'De electricidad a movimiento',
        desc: 'Al girar rápidamente, las hélices empujan el aire hacia atrás. Según las leyes de la física (acción y reacción), esto genera el empuje necesario para el avión.'
    }
};

document.querySelectorAll('.circuit-node').forEach(node => {
    node.addEventListener('click', () => {
        const key = node.querySelector('strong').textContent;
        const data = nodeData[key];
        if (data) {
            document.querySelector('#modalIcon').innerHTML = data.icon;
            document.querySelector('#modalTitle').textContent = data.title;
            document.querySelector('#modalDesc').textContent = data.desc;
            infoModal.classList.add('active');
        }
    });
});

document.querySelector('.photo-strip img').addEventListener('click', (e) => {
    modalImg.src = e.target.src;
    modal.classList.add('active');
});

modalCloseBtns.forEach(btn => btn.addEventListener('click', () => {
    modal.classList.remove('active');
    infoModal.classList.remove('active');
}));

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
    if (e.target === infoModal) infoModal.classList.remove('active');
});if(hashIndex>0&&hashIndex<slides.length){slides[0].classList.remove('active');current=hashIndex;slides[current].classList.add('active')}update();
