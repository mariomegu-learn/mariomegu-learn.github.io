// Configuración de la campaña. Déjala vacía para usar los textos genéricos.
const CONFIG = {
    orgName: '',        // Ej.: 'Equipo de Seguridad de GMS'
    reportEmail: '',    // Ej.: 'seguridad@empresa.com' (activa el botón de reporte)
    trackingUrl: '',    // Endpoint opcional que recibe un POST con { src } por visita; vacío = no se envía nada
    durationMs: 16000   // Duración de la "transferencia" falsa
};

document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('overlay');
    const alarm = document.getElementById('alarm');
    const reveal = document.getElementById('reveal');
    const closeButton = document.getElementById('closeOverlay');
    const mainContent = document.getElementById('mainContent');
    const footer = document.getElementById('footer');

    applyConfig();
    trackVisit();
    renderFacts();
    setupLocation();
    setupQuiz();
    setupScrollAnimations();

    document.body.classList.add('is-locked');
    alarm.focus();

    const stopMatrix = startMatrix(document.getElementById('matrix'));
    runTerminal(showReveal);

    function showReveal() {
        alarm.classList.add('is-revealed');
        reveal.hidden = false;
        overlay.setAttribute('aria-labelledby', 'revealTitle');
        overlay.removeAttribute('aria-describedby');
        closeButton.focus();
    }

    function closeOverlay() {
        overlay.classList.add('is-hiding');
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        setTimeout(function() {
            stopMatrix();
            overlay.hidden = true;
            document.body.classList.remove('is-locked');
            mainContent.inert = false;
            footer.inert = false;
            document.getElementById('mainTitle').focus();
        }, reduceMotion ? 0 : 400);
    }

    closeButton.addEventListener('click', closeOverlay);

    // Escape cierra solo cuando ya se mostró que es una simulación
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && !reveal.hidden && !overlay.hidden) {
            closeOverlay();
        }
    });
});

// ---------- Simulación de terminal (todo es falso: no se lee ni se envía nada) ----------

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(list) { return list[rand(0, list.length - 1)]; }
function pad(n, len) { return String(n).padStart(len, '0'); }
function hex(len) { let s = ''; while (s.length < len) s += Math.floor(Math.random() * 16).toString(16); return s; }
function fakeDate() { return '2026' + pad(rand(1, 10), 2) + pad(rand(1, 28), 2) + '_' + pad(rand(0, 23), 2) + pad(rand(0, 59), 2) + pad(rand(0, 59), 2); }
function formatSize(mb) { return mb >= 1024 ? (mb / 1024).toFixed(2) + ' GB' : mb.toFixed(1) + ' MB'; }

const PEOPLE = ['Mamá', 'Papá', 'Jefe', 'Ana (trabajo)', 'Soporte TI', 'Recursos Humanos', 'Carlos', 'Dr. Ramírez', 'Banco', 'Grupo familia', 'Contabilidad', 'Laura'];

// start/end son fracciones de CONFIG.durationMs
const TARGETS = [
    { id: 'ubicacion', icon: 'location_on', label: 'Ubicación', start: 0.08, end: 0.34, total: rand(9000, 18000), unit: 'puntos GPS', size: 14,
      file: function() { return 'GPS ' + (Math.random() > 0.5 ? '' : '-') + rand(1, 40) + '.' + pad(rand(0, 99999), 5) + ', -' + rand(40, 99) + '.' + pad(rand(0, 99999), 5); } },
    { id: 'contactos', icon: 'contacts', label: 'Contactos', start: 0.1, end: 0.36, total: rand(380, 950), unit: 'contactos', size: 6,
      file: function() { return 'contacts2.db → "' + pick(PEOPLE) + '" +' + rand(1, 99) + ' ' + rand(300, 399) + ' ' + pad(rand(0, 9999999), 7); } },
    { id: 'fotos', icon: 'photo_library', label: 'Fotos y videos', start: 0.13, end: 0.8, total: rand(2400, 6800), unit: 'archivos', size: rand(3800, 9200),
      file: function() { return pick(['DCIM/Camera/IMG_' + fakeDate() + '.jpg', 'DCIM/Camera/VID_' + fakeDate() + '.mp4', 'Screenshots/Screenshot_' + fakeDate() + '.png', 'WhatsApp Images/IMG-2026' + pad(rand(1, 10), 2) + pad(rand(1, 28), 2) + '-WA' + pad(rand(0, 999), 4) + '.jpg']); } },
    { id: 'mensajes', icon: 'chat', label: 'Mensajes', start: 0.2, end: 0.6, total: rand(18000, 64000), unit: 'mensajes', size: rand(420, 1300),
      file: function() { return pick(['WhatsApp/msgstore.db', 'sms_mms.db', 'Telegram/cache4.db']) + ' → chat "' + pick(PEOPLE) + '"'; } },
    { id: 'contrasenas', icon: 'key', label: 'Contraseñas', start: 0.28, end: 0.56, total: rand(60, 190), unit: 'credenciales', size: 2,
      file: function() { return pick(['Chrome/Login Data', 'llavero/keychain', 'cookies de sesión', 'códigos 2FA (SMS)']) + ' → ' + pick(['login.microsoftonline.com', 'mail.google.com', 'facebook.com', 'instagram.com', 'portal.vpn-empresa', 'linkedin.com']); } },
    { id: 'correo', icon: 'mail', label: 'Correo', start: 0.36, end: 0.74, total: rand(8000, 24000), unit: 'correos', size: rand(900, 2600),
      file: function() { return pick(['Bandeja de entrada/', 'Enviados/', 'Adjuntos/factura_' + rand(1000, 9999) + '.pdf', 'Adjuntos/contrato_firmado.pdf']); } },
    { id: 'corporativo', icon: 'corporate_fare', label: 'Datos corporativos', start: 0.4, end: 0.92, total: rand(1200, 4800), unit: 'documentos', size: rand(2200, 6400),
      file: function() { return pick(['OneDrive - Empresa/Finanzas/Presupuesto_2027.xlsx', 'SharePoint/RRHH/Nómina_Octubre.pdf', 'Outlook/buzón_corporativo.ost', 'Teams/chats.db', 'VPN/perfil_corporativo.ovpn', 'Contratos/Clientes_2026.docx', 'CRM/clientes_export.csv', 'Proyectos/Propuesta_confidencial.pptx']); } },
    { id: 'banco', icon: 'account_balance', label: 'Banca y pagos', start: 0.54, end: 0.88, total: rand(3, 9), unit: 'cuentas', size: 3,
      file: function() { return pick(['app_banco/session.token', 'tarjetas guardadas (autocompletar)', 'billetera/pagos.db', 'historial_transacciones.json']); } }
];

function runTerminal(onDone) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduceMotion ? 6000 : CONFIG.durationMs;
    const term = document.getElementById('alarm');
    const log = document.getElementById('termLog');
    const list = document.getElementById('targets');
    const progress = document.getElementById('progress');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const rate = document.getElementById('transferRate');

    // La "víctima" se describe con datos reales del propio navegador para que parezca creíble
    const ua = navigator.userAgent;
    let tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (err) { /* sin zona horaria */ }
    const ip = '203.0.113.' + rand(2, 254); // rango reservado para documentación: no es una IP real
    const org = CONFIG.orgName || 'tu empresa';

    const script = [
        [0, 'cmd', './qr_payload --target=' + ip + ' --stealth'],
        [0.02, 'dim', '[+] Conexión entrante desde código QR … OK'],
        [0.03, '', '[+] Dispositivo: ' + detectOS(ua) + ' · ' + detectBrowser(ua)],
        [0.04, '', '[+] Pantalla ' + screen.width + 'x' + screen.height + ' · idioma ' + (navigator.language || '??') + (tz ? ' · ' + tz : '')],
        [0.05, 'warn', '[!] Saltando protección del navegador … OK'],
        [0.065, 'warn', '[!] Escalando privilegios: root concedido'],
        [0.075, 'cmd', 'exfil --all --channels=' + TARGETS.length + ' --dest=c2.darknode.onion'],
        [0.45, 'err', '[!] Accediendo a la red de ' + org + ' con la sesión robada'],
        [0.94, 'cmd', 'wipe --logs && disconnect'],
        [0.97, 'err', '[✓] TRANSFERENCIA COMPLETA. El dispositivo ya no te pertenece.']
    ];
    let scriptIndex = 0;

    // Desenlace, en ms desde que termina la transferencia: la misma terminal confiesa que era falso
    const ending = [
        [1800, function() { addLine('whoami --victima', 'cmd'); }],
        [3200, function() { addLine('Alguien que escaneó un código QR sin revisar a dónde llevaba.', 'warn'); }],
        [4600, function() { addLine('cat /dev/verdad', 'cmd'); }],
        [5800, function() { addLine('[i] FIN DE LA SIMULACIÓN. No se copió ni se envió ningún dato.', 'ok'); }],
        [6400, goSafe],
        [8000, onDone]
    ];
    let endingIndex = 0;
    let endTime = 0;

    function goSafe() {
        term.classList.remove('is-complete');
        term.classList.add('is-safe');
        document.getElementById('alarmTitle').textContent = 'Simulación terminada';
        document.getElementById('alarmText').textContent = 'Nada de esto fue real. Ningún dato salió de tu dispositivo.';
        term.querySelector('.term__live').textContent = '● SIMULACIÓN';
        TARGETS.forEach(function(target) {
            target.pctEl.textContent = 'A SALVO';
            target.fileEl.textContent = 'no se envió nada';
        });
        progressBar.style.width = '0';
        progress.setAttribute('aria-valuenow', 0);
        progressText.textContent = 'Datos enviados en realidad: 0 B';
        rate.textContent = '';
    }

    TARGETS.forEach(function(t) {
        const li = document.createElement('li');
        li.className = 'target';
        li.innerHTML = '<div class="target__top"><span class="material-symbols-outlined" aria-hidden="true"></span><span class="target__name"></span><span class="target__pct">EN COLA</span></div>' +
            '<div class="target__bar"><div class="target__fill"></div></div><div class="target__file">esperando…</div>';
        li.querySelector('.material-symbols-outlined').textContent = t.icon;
        li.querySelector('.target__name').textContent = t.label;
        list.appendChild(li);
        t.el = li;
        t.pctEl = li.querySelector('.target__pct');
        t.fillEl = li.querySelector('.target__fill');
        t.fileEl = li.querySelector('.target__file');
        t.state = 'queued';
        t.progress = 0;
        t.lastFile = 0;
    });

    const typing = [];

    function addLine(text, kind) {
        const line = document.createElement('div');
        if (kind) line.className = 'is-' + kind;
        log.appendChild(line);
        // Los comandos se "teclean"; el resto aparece de golpe
        if (kind === 'cmd' && !reduceMotion) {
            line.classList.add('is-typing');
            typing.push({ el: line, text: text, chars: 0 });
        } else {
            line.textContent = text;
        }
        while (log.childElementCount > 80) log.removeChild(log.firstElementChild);
    }

    const start = performance.now();
    let lastNoise = 0;
    let lastFrame = start;
    let finished = false;

    function tick(now) {
        const t = Math.min(1, (now - start) / duration);
        const dt = now - lastFrame;
        lastFrame = now;

        while (scriptIndex < script.length && script[scriptIndex][0] <= t) {
            addLine(script[scriptIndex][2], script[scriptIndex][1]);
            scriptIndex++;
        }

        typing.forEach(function(item) {
            item.chars = Math.min(item.text.length, item.chars + dt * 0.09);
            item.el.textContent = item.text.slice(0, Math.floor(item.chars));
            if (item.chars >= item.text.length) item.el.classList.remove('is-typing');
        });
        for (let i = typing.length - 1; i >= 0; i--) {
            if (typing[i].chars >= typing[i].text.length) typing.splice(i, 1);
        }

        let sum = 0;
        let sent = 0;
        const active = [];
        TARGETS.forEach(function(target) {
            const local = Math.max(0, Math.min(1, (t - target.start) / (target.end - target.start)));
            // Avance irregular, como una red real, pero nunca hacia atrás
            const jitter = local > 0 && local < 1 ? Math.sin(local * 23 + target.size) * 0.03 : 0;
            target.progress = Math.max(target.progress, Math.min(1, local + jitter));
            sum += target.progress;
            sent += target.progress * target.size;

            if (target.state === 'queued' && local > 0) {
                target.state = 'active';
                target.el.classList.add('is-active');
                addLine('[>] ' + target.label.toUpperCase() + ': ' + target.total.toLocaleString('es') + ' ' + target.unit + ' encontrados. Copiando…', 'warn');
            }
            if (target.state === 'active') {
                active.push(target);
                const pct = Math.floor(target.progress * 100);
                target.pctEl.textContent = pct + '%';
                target.fillEl.style.width = pct + '%';
                if (now - target.lastFile > 140) {
                    target.fileEl.textContent = target.file();
                    target.lastFile = now;
                }
                if (local >= 1) {
                    target.state = 'done';
                    target.el.classList.remove('is-active');
                    target.el.classList.add('is-done');
                    target.pctEl.textContent = 'ROBADO';
                    target.fillEl.style.width = '100%';
                    target.fileEl.textContent = '✓ ' + target.total.toLocaleString('es') + ' ' + target.unit + ' · ' + formatSize(target.size);
                    addLine('[✓] ' + target.label.toUpperCase() + ' transferido (' + formatSize(target.size) + ')', '');
                }
            }
        });

        // Ruido de paquetes para que el log nunca se quede quieto
        if (active.length && now - lastNoise > (reduceMotion ? 400 : 110)) {
            const target = pick(active);
            addLine(pick([
                '  >> TX 0x' + hex(8) + '  ' + rand(512, 65536) + ' B  [' + target.id + ']  ' + target.file(),
                '  >> ' + hex(4) + ':' + hex(4) + ':' + hex(4) + '  cifrando bloque ' + rand(1, 9999) + '/' + rand(10000, 99999),
                '  >> ' + target.file()
            ]), 'dim');
            lastNoise = now;
        }

        // Tras el final no se toca la barra: goSafe la deja en 0 B
        if (!finished) {
            const pct = Math.floor((sum / TARGETS.length) * 100);
            progressBar.style.width = pct + '%';
            progress.setAttribute('aria-valuenow', pct);
            progressText.textContent = (pct < 100 ? 'Exfiltrando datos… ' : 'Exfiltración completa · ') + pct + '%';
            rate.textContent = formatSize(sent) + ' enviados' + (active.length ? ' · ' + rand(28, 74) + ' MB/s' : '');
        }

        if (t >= 1 && !finished) {
            finished = true;
            endTime = now;
            term.classList.add('is-complete');
        }
        if (finished) {
            // Con movimiento reducido el desenlace va al doble de rápido
            const sinceEnd = (now - endTime) * (reduceMotion ? 2 : 1);
            while (endingIndex < ending.length && ending[endingIndex][0] <= sinceEnd) {
                ending[endingIndex][1]();
                endingIndex++;
            }
        }
        if (endingIndex < ending.length || typing.length) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

// Lluvia de caracteres de fondo; devuelve una función para detenerla
function startMatrix(canvas) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return function() {};
    const ctx = canvas.getContext('2d');
    const glyphs = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF$#%&';
    const size = 16;
    let width = 0;
    let height = 0;
    let drops = [];
    let raf = 0;
    let last = 0;

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = canvas.clientWidth;
        height = canvas.clientHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drops = Array.from({ length: Math.ceil(width / size) }, function() { return Math.random() * -height / size; });
    }

    function draw(now) {
        raf = requestAnimationFrame(draw);
        if (now - last < 50) return;
        last = now;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.09)';
        ctx.fillRect(0, 0, width, height);
        ctx.font = size + 'px monospace';
        for (let i = 0; i < drops.length; i++) {
            const y = drops[i] * size;
            ctx.fillStyle = Math.random() > 0.97 ? '#d9ffe4' : '#1fd65a';
            ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * size, y);
            if (y > height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(draw);
    return function() {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', resize);
    };
}

function applyConfig() {
    if (CONFIG.orgName) {
        document.getElementById('orgLabel').textContent = 'Simulación de seguridad · ' + CONFIG.orgName;
        document.getElementById('reportTarget').textContent = 'A ' + CONFIG.orgName;
    }
    if (CONFIG.reportEmail) {
        const subject = encodeURIComponent('QR sospechoso');
        document.getElementById('reportLink').href = 'mailto:' + CONFIG.reportEmail + '?subject=' + subject;
        document.getElementById('reportAction').hidden = false;
    }
    if (CONFIG.trackingUrl) {
        document.getElementById('privacyNote').textContent =
            'Esta página es inofensiva. Solo se cuenta la visita y el lugar donde estaba el QR, sin datos personales. Su objetivo es que la próxima vez lo pienses dos veces antes de escanear.';
    }
}

// Conteo opcional por ubicación del QR (?src=lobby, ?src=cafeteria…)
function trackVisit() {
    if (!CONFIG.trackingUrl) return;
    const src = (new URLSearchParams(location.search).get('src') || 'directo').slice(0, 40);
    const body = JSON.stringify({ src: src });
    try {
        if (navigator.sendBeacon) {
            navigator.sendBeacon(CONFIG.trackingUrl, new Blob([body], { type: 'application/json' }));
        } else {
            fetch(CONFIG.trackingUrl, { method: 'POST', body: body, keepalive: true, headers: { 'Content-Type': 'application/json' } });
        }
    } catch (err) {
        console.log('No se pudo registrar la visita:', err);
    }
}

// Lo que cualquier página puede leer del dispositivo; nada se envía
function renderFacts() {
    const ua = navigator.userAgent;
    const facts = [];

    facts.push(['Dispositivo', detectOS(ua)]);
    facts.push(['Navegador', detectBrowser(ua)]);

    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        // "America/Bogota" → "Bogota (America)": la ciudad delata la ubicación aproximada
        if (tz) {
            const parts = tz.replace(/_/g, ' ').split('/');
            const city = parts.pop();
            facts.push(['Zona horaria', parts.length ? city + ' (' + parts.join(' / ') + ')' : city]);
        }
    } catch (err) { /* sin zona horaria */ }

    facts.push(['Hora en que escaneaste', new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })]);

    if (navigator.language) {
        const langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language]).slice(0, 3);
        facts.push(['Idioma', langs.join(', ')]);
    }

    const dpr = window.devicePixelRatio || 1;
    facts.push(['Pantalla', screen.width + ' × ' + screen.height + ' px' + (dpr > 1 ? ' (×' + dpr + ')' : '')]);

    const conn = navigator.connection;
    if (conn && conn.effectiveType) facts.push(['Conexión', conn.effectiveType.toUpperCase()]);

    if (navigator.hardwareConcurrency) facts.push(['Núcleos del procesador', String(navigator.hardwareConcurrency)]);

    if (navigator.deviceMemory) facts.push(['Memoria RAM (aprox.)', navigator.deviceMemory + ' GB o más']);

    const gpu = detectGPU();
    if (gpu) facts.push(['Chip gráfico', gpu]);

    facts.push(['Tema del sistema', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Modo oscuro' : 'Modo claro']);

    const touchPoints = navigator.maxTouchPoints || 0;
    facts.push(['Pantalla táctil', touchPoints > 0 ? 'Sí (' + touchPoints + ' puntos)' : 'No']);

    if (document.referrer) {
        try {
            facts.push(['Llegaste desde', new URL(document.referrer).hostname]);
        } catch (err) { /* referrer inválido */ }
    }

    drawFacts(facts);

    // Modelo exacto: solo disponible en navegadores Chromium
    if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
        navigator.userAgentData.getHighEntropyValues(['model', 'platformVersion']).then(function(data) {
            if (data.model) {
                facts.splice(1, 0, ['Modelo', data.model]);
                drawFacts(facts);
            }
        }).catch(function() {});
    }

    if (navigator.getBattery) {
        navigator.getBattery().then(function(battery) {
            facts.push(['Batería', Math.round(battery.level * 100) + '%' + (battery.charging ? ' (cargando)' : '')]);
            drawFacts(facts);
        }).catch(function() {});
    }
}

const FACT_ICONS = {
    'Dispositivo': 'smartphone', 'Modelo': 'phone_android', 'Navegador': 'web',
    'Zona horaria': 'public', 'Hora en que escaneaste': 'schedule',
    'Idioma': 'translate', 'Pantalla': 'aspect_ratio', 'Conexión': 'wifi',
    'Núcleos del procesador': 'memory', 'Memoria RAM (aprox.)': 'memory_alt', 'Chip gráfico': 'developer_board',
    'Tema del sistema': 'dark_mode', 'Pantalla táctil': 'touch_app', 'Llegaste desde': 'link', 'Batería': 'battery_full'
};

function drawFacts(facts) {
    const list = document.getElementById('facts');
    list.textContent = '';
    facts.forEach(function(fact, index) {
        const item = document.createElement('div');
        // Los primeros datos son los más reveladores: se destacan
        item.className = index < 4 ? 'fact fact--key' : 'fact';
        const icon = document.createElement('span');
        icon.className = 'material-symbols-outlined fact__icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = FACT_ICONS[fact[0]] || 'visibility';
        item.appendChild(icon);
        const dt = document.createElement('dt');
        dt.textContent = fact[0];
        const dd = document.createElement('dd');
        dd.textContent = fact[1];
        item.append(dt, dd);
        list.appendChild(item);
    });
}

function detectGPU() {
    try {
        const gl = document.createElement('canvas').getContext('webgl');
        if (!gl) return '';
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || '';
        // "ANGLE (Qualcomm, Adreno (TM) 740, OpenGL ES 3.2)" → "Qualcomm Adreno 740"
        const angle = renderer.match(/ANGLE \(([^,]+),\s*([^,(]+(?:\([^)]*\))?[^,]*)/);
        let name = renderer;
        if (angle) {
            const vendor = angle[1].trim();
            const model = angle[2].trim();
            name = model.toLowerCase().startsWith(vendor.toLowerCase()) ? model : vendor + ' ' + model;
        }
        return name.replace(/\(TM\)|\(R\)|\(0x[0-9a-f]+\)|Direct3D.*$|vs_\S+|ps_\S+/gi, '').replace(/\s+/g, ' ').trim();
    } catch (err) {
        return '';
    }
}

// Leaflet se carga solo si la persona acepta compartir su ubicación
function loadLeaflet() {
    if (window.L) return Promise.resolve(window.L);
    return new Promise(function(resolve, reject) {
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
        document.head.appendChild(css);
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
        script.onload = function() { resolve(window.L); };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

let locationMap = null;

function showMap(lat, lon, accuracy) {
    const container = document.getElementById('locationMap');
    container.hidden = false;
    loadLeaflet().then(function(L) {
        if (!locationMap) {
            locationMap = L.map(container, { scrollWheelZoom: false });
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
            }).addTo(locationMap);
        }
        locationMap.eachLayer(function(layer) {
            if (!(layer instanceof L.TileLayer)) locationMap.removeLayer(layer);
        });
        locationMap.invalidateSize();
        locationMap.setView([lat, lon], 16);
        const color = getComputedStyle(document.documentElement).getPropertyValue('--danger').trim() || '#ff6b6b';
        const area = L.circle([lat, lon], { radius: accuracy, color: color, weight: 1, fillOpacity: 0.15 }).addTo(locationMap);
        L.circleMarker([lat, lon], { radius: 8, color: '#fff', weight: 3, fillColor: color, fillOpacity: 1 })
            .addTo(locationMap)
            .bindTooltip('Estás aquí', { permanent: true, direction: 'top', offset: [0, -10] });
        locationMap.fitBounds(area.getBounds(), { maxZoom: 16, padding: [20, 20] });
    }).catch(function(err) {
        console.log('No se pudo mostrar el mapa:', err);
        container.hidden = true;
    });
}

// Solo se pide la ubicación si la persona toca el botón; no se guarda
function setupLocation() {
    const button = document.getElementById('locationButton');
    const result = document.getElementById('locationResult');

    if (!navigator.geolocation) {
        button.closest('.locate').hidden = true;
        return;
    }

    button.addEventListener('click', function() {
        button.disabled = true;
        result.className = 'locate__result';
        result.textContent = 'Esperando tu respuesta…';

        navigator.geolocation.getCurrentPosition(function(pos) {
            const lat = pos.coords.latitude.toFixed(5);
            const lon = pos.coords.longitude.toFixed(5);
            const accuracy = Math.round(pos.coords.accuracy);
            result.className = 'locate__result is-wrong';
            result.textContent = 'Aceptaste. Estás en ' + lat + ', ' + lon + ' (precisión de ±' + accuracy + ' m). ' +
                'Un atacante ya sabría dónde estás, y podría saber dónde vives o trabajas. Nunca aceptes permisos que una página no necesita.';
            button.disabled = false;
            showMap(pos.coords.latitude, pos.coords.longitude, Math.max(accuracy, 15));
        }, function(err) {
            result.className = 'locate__result is-correct';
            result.textContent = err.code === err.PERMISSION_DENIED
                ? '¡Bien hecho! Negaste el permiso. Eso es exactamente lo que debes hacer cuando una página que no conoces te pide tu ubicación.'
                : 'No se pudo obtener la ubicación. Aun así, recuerda: si una página desconocida te la pide, la respuesta es "No permitir".';
            button.disabled = false;
        }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
    });
}

function detectOS(ua) {
    let m;
    if ((m = ua.match(/Android\s([\d.]+)/))) return 'Android ' + m[1];
    if ((m = ua.match(/iPhone OS (\d+)[_\d]*/))) return 'iPhone (iOS ' + m[1] + ')';
    if ((m = ua.match(/iPad.*OS (\d+)[_\d]*/))) return 'iPad (iPadOS ' + m[1] + ')';
    if (/Macintosh/.test(ua)) return navigator.maxTouchPoints > 1 ? 'iPad' : 'Mac';
    if (/Windows/.test(ua)) return 'Windows';
    if (/CrOS/.test(ua)) return 'Chromebook';
    if (/Linux/.test(ua)) return 'Linux';
    return 'Desconocido';
}

function detectBrowser(ua) {
    const rules = [
        [/EdgA?\/(\d+)/, 'Edge'], [/OPR\/(\d+)/, 'Opera'], [/SamsungBrowser\/(\d+)/, 'Samsung Internet'],
        [/CriOS\/(\d+)/, 'Chrome'], [/FxiOS\/(\d+)/, 'Firefox'], [/Firefox\/(\d+)/, 'Firefox'],
        [/Chrome\/(\d+)/, 'Chrome'], [/Version\/(\d+).*Safari/, 'Safari']
    ];
    for (let i = 0; i < rules.length; i++) {
        const m = ua.match(rules[i][0]);
        if (m) return rules[i][1] + ' ' + m[1];
    }
    return 'Desconocido';
}

function setupQuiz() {
    const quiz = document.getElementById('quiz');
    const options = document.querySelectorAll('.quiz__option');
    const feedback = document.getElementById('quizFeedback');

    options.forEach(function(option) {
        option.addEventListener('click', function() {
            const correct = option.dataset.correct === 'true';
            quiz.classList.add('is-answered');
            options.forEach(function(o) { o.classList.remove('is-correct', 'is-wrong'); o.removeAttribute('aria-pressed'); });
            option.classList.add(correct ? 'is-correct' : 'is-wrong');
            option.setAttribute('aria-pressed', 'true');
            feedback.className = 'quiz__feedback ' + (correct ? 'is-correct' : 'is-wrong');
            feedback.textContent = option.dataset.feedback;
        });
    });
}

// Aparición suave de los bloques al hacer scroll
function setupScrollAnimations() {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.documentElement.classList.add('js-anim');
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('[data-animate]').forEach(function(el) { observer.observe(el); });
}
