// Configuración de la campaña. Déjala vacía para usar los textos genéricos.
const CONFIG = {
    orgName: '',        // Ej.: 'Equipo de Seguridad de GMS'
    reportEmail: '',    // Ej.: 'seguridad@empresa.com' (activa el botón de reporte)
    trackingUrl: '',    // Endpoint opcional que recibe un POST con { src } por visita; vacío = no se envía nada
    durationMs: 12000   // Duración de la "transferencia" falsa
};

document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('overlay');
    const alarm = document.getElementById('alarm');
    const reveal = document.getElementById('reveal');
    const progress = document.getElementById('progress');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const fileTransfer = document.getElementById('fileTransfer');
    const closeButton = document.getElementById('closeOverlay');
    const mainContent = document.getElementById('mainContent');
    const footer = document.getElementById('footer');

    const files = [
        'contactos.db', 'mensajes.db', 'fotos/', 'ubicaciones.db', 'contraseñas_guardadas',
        'historial_navegador.db', 'correo/', 'documentos/', 'codigos_verificacion.log', 'app_banco/'
    ];

    applyConfig();
    trackVisit();
    renderFacts();
    setupLocation();
    setupQuiz();
    setupScrollAnimations();

    document.body.classList.add('is-locked');
    alarm.focus();

    // Simulación de la transferencia
    const start = performance.now();
    let fileIndex = 0;
    let lastFileSwap = 0;

    function tick(now) {
        const elapsed = now - start;
        const pct = Math.min(100, Math.round((elapsed / CONFIG.durationMs) * 100));
        progressBar.style.width = pct + '%';
        progress.setAttribute('aria-valuenow', pct);
        progressText.textContent = 'Enviando datos… ' + pct + '%';

        if (now - lastFileSwap > 350) {
            fileTransfer.textContent = 'Transfiriendo: ' + files[fileIndex++ % files.length];
            lastFileSwap = now;
        }

        if (pct < 100) {
            requestAnimationFrame(tick);
        } else {
            showReveal();
        }
    }
    requestAnimationFrame(tick);

    function showReveal() {
        alarm.hidden = true;
        reveal.hidden = false;
        overlay.setAttribute('aria-labelledby', 'revealTitle');
        overlay.removeAttribute('aria-describedby');
        closeButton.focus();
    }

    function closeOverlay() {
        overlay.classList.add('is-hiding');
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        setTimeout(function() {
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
