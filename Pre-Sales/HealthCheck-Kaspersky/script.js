/**
 * ===========================
 * ANÁLISIS DE MADUREZ KASPERSKY
 * Sistema de Evaluación Web v1.1
 * ===========================
 *
 * Este sistema permite evaluar la madurez de la implementación de Kaspersky
 * en una organización, proporcionando métricas y análisis detallados.
 */

/**
 * ===========================
 * CONFIGURACIÓN Y VARIABLES GLOBALES
 * ===========================
 *
 * Nota: El puntaje máximo ahora se calcula como TOTAL_CONTROLES * 4
 * para reflejar que cada control puede obtener hasta 4 puntos
 */

// Configuración general del sistema
const CONFIG = {
    MINUTOS_TRANSFERENCIA: 240 // Tiempo estimado para transferencia de conocimiento
};

// Variables globales para el cálculo de métricas
let TOTAL_CONTROLES = 0; // Total de controles evaluados
let PUNTAJE_MAXIMO = 0; // Puntaje máximo posible

// Opciones de respuesta para cada característica de control
const RESPUESTAS = [
    { texto: 'Desactivado', valor: 0 },
    { texto: 'En fase inicial', valor: 1 },
    { texto: 'Manual o limitado', valor: 2 },
    { texto: 'Implementado parcialmente', valor: 3 },
    { texto: 'Implementado totalmente', valor: 4 },
    { texto: 'No aplica', valor: "N/A" }
];

// Duraciones estimadas para la implementación de cada control
const DURACIONES = {
    'Protección Básica': 20,
    'Protección de Red': 35,
    'Protección Avanzada': 60,
    'Controles Endpoint': 40,
    'Borrado Remoto': 15,
    'Cifrado': 60,
    'Configuración General del Endpoint': 10,
    'Configuración de la Aplicación para Servidores': 15,
    'Complementarios': 10,
    'Protección en tiempo real para Servidores': 15,
    'Control de actividad local': 45,
    'Control de actividad de Red': 15,
    'Inspección del sistema': 5,
    'Gestión de Sistemas': 30,
    'Administración de dispositivos móviles': 60,
    'Tareas': 30,
    'Configuración general del servidor de Administración': 15,
    'Agente de Red': 10,
    'Estado general de la distribución': 60,
    'Versiones': 60
};

// Almacenamiento de datos de controles y evaluaciones
let controlesData = []; // Datos de controles cargados desde JSON
let evaluacionActual = {}; // Evaluación actual del usuario
let totalControlesCalculado = 0; // Total de controles calculado

// ===========================
// INICIALIZACIÓN
// ===========================

document.addEventListener('DOMContentLoaded', async () => {
    await cargarControles();
    inicializarTabs();
    inicializarFecha();
    renderizarControles();
    actualizarTodo();
});

function inicializarFecha() {
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        fechaInput.valueAsDate = new Date();
    }
}

function inicializarTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            cambiarTab(tabName);
        });
    });
}

function cambiarTab(tabName) {
    // Ocultar todos los contenidos
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Desactivar todos los botones
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Activar el tab seleccionado
    const selectedContent = document.getElementById(tabName);
    const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);

    if (selectedContent) selectedContent.classList.add('active');
    if (selectedButton) selectedButton.classList.add('active');

    // Actualizar contenidos si es necesario
    if (tabName === 'resultados') actualizarResultados();
    if (tabName === 'brechas') actualizarBrechas();
    if (tabName === 'implementacion') actualizarImplementacion();
    if (tabName === 'madurez') actualizarMadurez();
}

// ===========================
// CARGA DE DATOS
// ===========================

async function cargarControles() {
    try {
        const response = await fetch('data_controles.json');
        const data = await response.json();
        controlesData = data.controles;

        // Inicializar evaluación actual
        controlesData.forEach(control => {
            control.caracteristicas.forEach(caract => {
                const key = `${control.numero}_${caract.numero}`;
                evaluacionActual[key] = caract.respuesta || 'Desactivado';
            });
        });

        // Calcular el total de controles, excluyendo características "No aplica"
        totalControlesCalculado = controlesData.reduce((total, control) => {
            const caracteristicasValidas = control.caracteristicas.filter(caract => {
                const key = `${control.numero}_${caract.numero}`;
                return evaluacionActual[key] !== 'No aplica';
            });
            return total + caracteristicasValidas.length;
        }, 0);

        console.log('Controles cargados:', controlesData.length);
        console.log('Total de características de controles:', totalControlesCalculado);

        // Calcular TOTAL_CONTROLES y PUNTAJE_MAXIMO basado en características aplicables
        TOTAL_CONTROLES = totalControlesCalculado;
        PUNTAJE_MAXIMO = TOTAL_CONTROLES * 4;

        console.log('TOTAL_CONTROLES actualizado:', TOTAL_CONTROLES);
        console.log('PUNTAJE_MAXIMO actualizado:', PUNTAJE_MAXIMO);
    } catch (error) {
        console.error('Error cargando controles:', error);
        // Crear estructura por defecto si falla la carga
        controlesData = crearEstructuraDefault();
    }
}

function crearEstructuraDefault() {
    return [
        {
            aplicacion: 'ENDPOINT',
            numero: '1.0',
            nombre: 'Protección Básica',
            caracteristicas: [
                { numero: '1.1', nombre: 'Ejemplo de característica', respuesta: 'Desactivado', puntos: 0 }
            ]
        }
    ];
}

// ===========================
// RENDERIZADO DE CONTROLES
// ===========================

function renderizarControles() {
    const container = document.getElementById('controles-container');
    if (!container) return;

    container.innerHTML = '';

    controlesData.forEach(control => {
        const controlCard = crearControlCard(control);
        container.appendChild(controlCard);
    });
}

function crearControlCard(control) {
    const card = document.createElement('div');
    card.className = 'control-card';
    card.setAttribute('data-control-card', control.numero);

    const stats = calcularStatsControl(control);

    card.innerHTML = `
        <div class="control-header">
            <div class="control-title">
                <span class="control-number">${control.numero}</span>
                <span class="control-name">${control.nombre}</span>
            </div>
            <span class="control-app">${control.aplicacion}</span>
        </div>

        <div class="caracteristicas-list">
            ${control.caracteristicas.map(caract => crearCaracteristicaHTML(control, caract)).join('')}
        </div>

        <div class="control-stats">
            <div class="stat-item">
                <div class="stat-label">Puntos</div>
                <div class="stat-value">${stats.puntos.toFixed(0)}/${stats.maxPuntos}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Madurez</div>
                <div class="stat-value">${(stats.madurez * 100).toFixed(1)}%</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Cumplimiento</div>
                <div class="stat-value">${(stats.cumplimiento * 100).toFixed(1)}%</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Brecha</div>
                <div class="stat-value">${(stats.brecha * 100).toFixed(1)}%</div>
            </div>
        </div>
    `;

    return card;
}

function crearCaracteristicaHTML(control, caract) {
    const key = `${control.numero}_${caract.numero}`;
    const valorActual = evaluacionActual[key] || caract.respuesta || 'Desactivado';

    return `
        <div class="caracteristica">
            <span class="caract-number">${caract.numero}</span>
            <span class="caract-name">${caract.nombre}</span>
            <select class="caract-select" data-control="${control.numero}" data-caract="${caract.numero}" onchange="cambiarRespuesta(this)">
                ${RESPUESTAS.map(resp => 
                    `<option value="${resp.texto}" ${resp.texto === valorActual ? 'selected' : ''}>
                        ${resp.texto} (${resp.valor} pts)
                    </option>`
                ).join('')}
            </select>
        </div>
    `;
}

// ===========================
// CÁLCULOS
// ===========================

function calcularStatsControl(control) {
    let puntos = 0;
    let maxPuntos = control.caracteristicas.length * 4;
    let caracteristicasValidas = 0;

    control.caracteristicas.forEach(caract => {
        const key = `${control.numero}_${caract.numero}`;
        const respuesta = evaluacionActual[key] || caract.respuesta || 'Desactivado';
        const respuestaObj = RESPUESTAS.find(r => r.texto === respuesta);

        // Excluir características con respuesta "No aplica"
        if (respuesta === 'No aplica') {
            return;
        }

        puntos += respuestaObj ? respuestaObj.valor : 0;
        caracteristicasValidas++;
    });

    // Ajustar maxPuntos para excluir características "No aplica"
    maxPuntos = caracteristicasValidas * 4;

    const madurez = puntos / PUNTAJE_MAXIMO;
    const porcentajeEsperado = caracteristicasValidas * CONFIG.VALOR_MADUREZ_CONTROL;
    const brecha = maxPuntos > 0 ? 1 - (puntos / maxPuntos) : 0;
    const cumplimiento = 1 - brecha;

    return {
        puntos,
        maxPuntos,
        madurez,
        porcentajeEsperado,
        brecha,
        cumplimiento
    };
}

function calcularStatsGlobales() {
    let puntosTotal = 0;
    let maxPuntosTotal = 0;

    controlesData.forEach(control => {
        const stats = calcularStatsControl(control);
        puntosTotal += stats.puntos;
        maxPuntosTotal += stats.maxPuntos;
    });

    const madurezGlobal = puntosTotal / PUNTAJE_MAXIMO;

    return {
        puntosTotal,
        maxPuntosTotal,
        madurezGlobal
    };
}

function clasificarControl(cumplimiento, puntos, maxPuntos) {
    // Si todos los controles son "No aplica" (0/0), categorizar como no aplica
    if (puntos === 0 && maxPuntos === 0) return 'noaplica';
    if (cumplimiento === 0) return 'critico';
    if (cumplimiento < 0.5) return 'critico';
    if (cumplimiento < 0.8) return 'mejora';
    return 'fortaleza';
}

// ===========================
// EVENTOS
// ===========================

function cambiarRespuesta(selectElement) {
    const controlNum = selectElement.getAttribute('data-control');
    const caractNum = selectElement.getAttribute('data-caract');
    const key = `${controlNum}_${caractNum}`;

    evaluacionActual[key] = selectElement.value;

    // Recalcular TOTAL_CONTROLES y PUNTAJE_MAXIMO basado en respuestas actuales
    recalcularTotales();

    // Actualizar la tarjeta del control
    actualizarControlCard(controlNum);

    // Actualizar otras pestañas si están visibles
    actualizarTodo();
}

function actualizarControlCard(controlNum) {
    const control = controlesData.find(c => c.numero === controlNum);
    if (!control) return;

    const stats = calcularStatsControl(control);
    const card = document.querySelector(`[data-control-card="${controlNum}"]`);

    if (card) {
        const statsDiv = card.querySelector('.control-stats');
        if (statsDiv) {
            statsDiv.innerHTML = `
                <div class="stat-item">
                    <div class="stat-label">Puntos</div>
                    <div class="stat-value">${stats.puntos.toFixed(0)}/${stats.maxPuntos}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Madurez</div>
                    <div class="stat-value">${(stats.madurez * 100).toFixed(1)}%</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Cumplimiento</div>
                    <div class="stat-value">${(stats.cumplimiento * 100).toFixed(1)}%</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Brecha</div>
                    <div class="stat-value">${(stats.brecha * 100).toFixed(1)}%</div>
                </div>
            `;
        }
    }
}

function actualizarTodo() {
    actualizarResultados();
    actualizarBrechas();
    actualizarImplementacion();
    actualizarMadurez();
}

function recalcularTotales() {
    // Recalcular el total de controles, excluyendo características "No aplica"
    TOTAL_CONTROLES = controlesData.reduce((total, control) => {
        const caracteristicasValidas = control.caracteristicas.filter(caract => {
            const key = `${control.numero}_${caract.numero}`;
            return evaluacionActual[key] !== 'No aplica';
        });
        return total + caracteristicasValidas.length;
    }, 0);

    // Actualizar el puntaje máximo
    PUNTAJE_MAXIMO = TOTAL_CONTROLES * 4;

    console.log('TOTAL_CONTROLES recalculado:', TOTAL_CONTROLES);
    console.log('PUNTAJE_MAXIMO recalculado:', PUNTAJE_MAXIMO);
}

// ===========================
// ACTUALIZACIÓN DE RESULTADOS
// ===========================

function actualizarResultados() {
    const stats = calcularStatsGlobales();

    // Actualizar métricas principales
    const madurezElement = document.getElementById('madurez-total');
    if (madurezElement) {
        madurezElement.textContent = `${(stats.madurezGlobal * 100).toFixed(1)}%`;
    }

    const puntosElement = document.getElementById('puntos-obtenidos');
    if (puntosElement) {
        puntosElement.textContent = stats.puntosTotal.toFixed(0);
    }

    // Mostrar el total de controles calculado
    const totalControlesElement = document.getElementById('total-controles');
    if (totalControlesElement) {
        totalControlesElement.textContent = TOTAL_CONTROLES;
    }

    // Actualizar el máximo de puntos posibles en la UI
    const puntosMaximosElement = document.getElementById('puntos-maximos');
    if (puntosMaximosElement) {
        puntosMaximosElement.textContent = `de ${PUNTAJE_MAXIMO} posibles`;
    }

    // Calcular tiempo de implementación
    const tiempoTotal = calcularTiempoImplementacion();
    const tiempoElement = document.getElementById('tiempo-total');
    if (tiempoElement) {
        tiempoElement.textContent = `${(tiempoTotal / 60).toFixed(1)}h`;
    }

    // Clasificar controles
    let critico = 0, mejora = 0, fortaleza = 0, noaplica = 0;

    controlesData.forEach(control => {
        const stats = calcularStatsControl(control);
        const tipo = clasificarControl(stats.cumplimiento, stats.puntos, stats.maxPuntos);

        if (tipo === 'critico') critico++;
        else if (tipo === 'mejora') mejora++;
        else if (tipo === 'fortaleza') fortaleza++;
        else noaplica++;
    });

    const countCritico = document.getElementById('count-critico');
    const countMejora = document.getElementById('count-mejora');
    const countFortaleza = document.getElementById('count-fortaleza');
    const countNoaplica = document.getElementById('count-noaplica');

    if (countCritico) countCritico.textContent = critico;
    if (countMejora) countMejora.textContent = mejora;
    if (countFortaleza) countFortaleza.textContent = fortaleza;
    if (countNoaplica) countNoaplica.textContent = noaplica;

    // Actualizar color del fondo según el nivel de madurez
    const madurezPorcentaje = stats.madurezGlobal * 100;
    const metricCard = document.querySelector('.metric-card.primary.dinamyc-color');
    if (metricCard) {
        if (madurezPorcentaje < 50) {
            metricCard.style.background = 'linear-gradient(135deg, var(--danger-color), #eb1206ff)';
        } else if (madurezPorcentaje < 80) {
            metricCard.style.background = 'linear-gradient(135deg, var(--warning-color), #f78401ff)';
        } else {
            metricCard.style.background = 'linear-gradient(135deg, var(--success-color), #02681aff)';
        }
    }
}

// ===========================
// ACTUALIZACIÓN DE BRECHAS
// ===========================

function actualizarBrechas() {
    const container = document.getElementById('brechas-container');
    if (!container) return;

    let html = `
        <table class="brecha-table">
            <thead>
                <tr>
                    <th>Control</th>
                    <th>Aplicación</th>
                    <th>Puntos</th>
                    <th>Madurez</th>
                    <th>Cumplimiento</th>
                    <th>Clasificación</th>
                </tr>
            </thead>
            <tbody>
    `;

    controlesData.forEach(control => {
        const stats = calcularStatsControl(control);
        const tipo = clasificarControl(stats.cumplimiento, stats.puntos, stats.maxPuntos);
        const badgeClass = tipo === 'critico' ? 'badge-critico' :
                          tipo === 'mejora' ? 'badge-mejora' :
                          tipo === 'noaplica' ? 'badge-neutral' : 'badge-fortaleza';
        const badgeText = tipo === 'critico' ? 'Brecha Crítica' :
                         tipo === 'mejora' ? 'Oportunidad' :
                         tipo === 'noaplica' ? 'No Aplica' : 'Fortaleza';

        html += `
            <tr>
                <td><strong>${control.numero}</strong> ${control.nombre}</td>
                <td>${control.aplicacion}</td>
                <td>${stats.puntos.toFixed(0)}/${stats.maxPuntos}</td>
                <td>${(stats.madurez * 100).toFixed(1)}%</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${stats.cumplimiento * 100}%">
                            ${(stats.cumplimiento * 100).toFixed(1)}%
                        </div>
                    </div>
                </td>
                <td><span class="badge ${badgeClass}">${badgeText}</span></td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// ===========================
// ACTUALIZACIÓN DE IMPLEMENTACIÓN
// ===========================

function calcularTiempoImplementacion() {
    let tiempoTotal = 0;

    controlesData.forEach(control => {
        const stats = calcularStatsControl(control);
        const duracion = DURACIONES[control.nombre] || 30;
        tiempoTotal += stats.brecha * duracion;
    });

    return tiempoTotal + CONFIG.MINUTOS_TRANSFERENCIA;
}

function actualizarImplementacion() {
    const container = document.getElementById('implementacion-container');
    if (!container) return;

    const fases = {};

    controlesData.forEach(control => {
        const stats = calcularStatsControl(control);
        if (stats.brecha > 0) {
            const duracion = DURACIONES[control.nombre] || 30;
            const tiempoImplementacion = stats.brecha * duracion;
            const fase = Math.ceil(parseFloat(control.numero));

            if (!fases[fase]) {
                fases[fase] = {
                    controles: [],
                    tiempoTotal: 0
                };
            }

            fases[fase].controles.push({
                nombre: control.nombre,
                brecha: stats.brecha,
                tiempo: tiempoImplementacion
            });
            fases[fase].tiempoTotal += tiempoImplementacion;
        }
    });

    let html = '';
    Object.keys(fases).sort().forEach(fase => {
        const data = fases[fase];
        html += `
            <div class="fase-card">
                <div class="fase-header">
                    <span class="fase-title">Fase ${fase}</span>
                    <span class="fase-time">${data.tiempoTotal.toFixed(1)} minutos</span>
                </div>
                <div class="fase-controles">
                    ${data.controles.map(ctrl => `
                        <div class="fase-control-item">
                            <span>${ctrl.nombre}</span>
                            <span>Brecha: ${(ctrl.brecha * 100).toFixed(1)}% - ${ctrl.tiempo.toFixed(1)} min</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    const tiempoTotal = calcularTiempoImplementacion();
    html += `
        <div class="fase-card" style="border-left-color: #5856d6;">
            <div class="fase-header">
                <span class="fase-title">Transferencia de Conocimiento</span>
                <span class="fase-time">${CONFIG.MINUTOS_TRANSFERENCIA} minutos</span>
            </div>
        </div>
        <div class="metric-card primary" style="margin-top: 20px;">
            <h3>Tiempo Total de Implementación</h3>
            <div class="metric-value">${(tiempoTotal / 60).toFixed(2)} horas</div>
        </div>
    `;

    container.innerHTML = html;
}

// ===========================
// ACTUALIZACIÓN DE MADUREZ
// ===========================

function actualizarMadurez() {
    const container = document.getElementById('madurez-container');
    if (!container) return;

    let html = '';

    controlesData.forEach(control => {
        const stats = calcularStatsControl(control);

        html += `
            <div class="control-card">
                <div class="control-header">
                    <div class="control-title">
                        <span class="control-number">${control.numero}</span>
                        <span class="control-name">${control.nombre}</span>
                    </div>
                    <span class="control-app">${control.aplicacion}</span>
                </div>

                ${control.caracteristicas.map(caract => {
                    const key = `${control.numero}_${caract.numero}`;
                    const respuesta = evaluacionActual[key] || 'Desactivado';
                    const beneficio = caract.beneficio || 'Sin descripción disponible';

                    // Determinar la clase del badge basado en la respuesta
                    let badgeClass = 'badge-neutral';
                    if (respuesta === 'Implementado totalmente') {
                        badgeClass = 'badge-fortaleza';
                    } else if (respuesta === 'Desactivado') {
                        badgeClass = 'badge-critico';
                    } else if (respuesta === 'No aplica') {
                        badgeClass = 'badge-neutral';
                    } else {
                        badgeClass = 'badge-mejora';
                    }

                    return `
                        <div class="madurez-detail">
                            <div class="madurez-header">
                                <div>
                                    <strong>${caract.numero}</strong> - ${caract.nombre}
                                </div>
                                <span class="badge ${badgeClass}">
                                    ${respuesta}
                                </span>
                            </div>
                            <p class="madurez-beneficio">${beneficio}</p>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    });

    container.innerHTML = html;
}

// ===========================
// GUARDAR Y CARGAR
// ===========================

function guardarEvaluacion() {
    const datosGuardar = {
        informacion: {
            empresa: document.getElementById('empresa')?.value || '',
            contacto: document.getElementById('contacto')?.value || '',
            telefono: document.getElementById('telefono')?.value || '',
            correo: document.getElementById('correo')?.value || '',
            elaborado: document.getElementById('elaborado')?.value || '',
            fecha: document.getElementById('fecha')?.value || '',
            estaciones: document.getElementById('estaciones')?.value || '',
            servidores: document.getElementById('servidores')?.value || '',
            moviles: document.getElementById('moviles')?.value || ''
        },
        evaluacion: evaluacionActual,
        fechaGuardado: new Date().toISOString()
    };

    localStorage.setItem('evaluacionKaspersky', JSON.stringify(datosGuardar));
    alert('✅ Evaluación guardada correctamente en el navegador');
}

function cargarEvaluacion() {
    const datosGuardados = localStorage.getItem('evaluacionKaspersky');

    if (!datosGuardados) {
        alert('❌ No hay evaluaciones guardadas');
        return;
    }

    try {
        const datos = JSON.parse(datosGuardados);

        // Cargar información
        Object.keys(datos.informacion).forEach(key => {
            const element = document.getElementById(key);
            if (element) element.value = datos.informacion[key] || '';
        });

        // Cargar evaluación
        evaluacionActual = datos.evaluacion;

        // Re-renderizar controles
        renderizarControles();
        actualizarTodo();

        alert('✅ Evaluación cargada correctamente');
    } catch (error) {
        console.error('Error al cargar evaluación:', error);
        alert('❌ Error al cargar la evaluación guardada');
    }
}

function exportarJSON() {
    const stats = calcularStatsGlobales();

    const exportData = {
        fecha_exportacion: new Date().toISOString(),
        informacion: {
            empresa: document.getElementById('empresa')?.value || '',
            contacto: document.getElementById('contacto')?.value || '',
            telefono: document.getElementById('telefono')?.value || '',
            correo: document.getElementById('correo')?.value || '',
            elaborado: document.getElementById('elaborado')?.value || '',
            fecha: document.getElementById('fecha')?.value || '',
            estaciones: document.getElementById('estaciones')?.value || 0,
            servidores: document.getElementById('servidores')?.value || 0,
            moviles: document.getElementById('moviles')?.value || 0
        },
        resultados: {
            madurez_global: stats.madurezGlobal,
            madurez_global_porcentaje: `${(stats.madurezGlobal * 100).toFixed(2)}%`,
            puntos_total: stats.puntosTotal,
            puntos_maximos: CONFIG.PUNTAJE_MAXIMO,
            tiempo_implementacion_horas: (calcularTiempoImplementacion() / 60).toFixed(2)
        },
        evaluacion: evaluacionActual,
        controles: controlesData.map(control => ({
            numero: control.numero,
            nombre: control.nombre,
            aplicacion: control.aplicacion,
            estadisticas: calcularStatsControl(control),
            caracteristicas: control.caracteristicas.map(caract => {
                const key = `${control.numero}_${caract.numero}`;
                return {
                    numero: caract.numero,
                    nombre: caract.nombre,
                    respuesta: evaluacionActual[key],
                    puntos: RESPUESTAS.find(r => r.texto === evaluacionActual[key])?.valor || 0
                };
            })
        }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluacion-kaspersky-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Función para importar datos desde un archivo JSON
function importarJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            alert('❌ No se seleccionó ningún archivo');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const contenido = e.target.result;
                const datos = JSON.parse(contenido);

                // Validar estructura básica del JSON
                if (!datos.evaluacion || !datos.informacion) {
                    alert('❌ El archivo JSON no tiene el formato esperado');
                    return;
                }

                // Cargar información
                Object.keys(datos.informacion).forEach(key => {
                    const element = document.getElementById(key);
                    if (element) element.value = datos.informacion[key] || '';
                });

                // Cargar evaluación
                evaluacionActual = datos.evaluacion;

                // Actualizar los valores de los controles en la interfaz
                controlesData.forEach(control => {
                    control.caracteristicas.forEach(caract => {
                        const key = `${control.numero}_${caract.numero}`;
                        if (evaluacionActual[key]) {
                            caract.respuesta = evaluacionActual[key];
                            // Actualizar el select en la interfaz
                            const selectElement = document.querySelector(`select[data-control="${control.numero}"][data-caract="${caract.numero}"]`);
                            if (selectElement) {
                                selectElement.value = evaluacionActual[key];
                                // Disparar el evento change para actualizar en tiempo real
                                selectElement.dispatchEvent(new Event('change'));
                            }
                        }
                    });
                });

                // Re-renderizar controles y actualizar todas las pestañas
                renderizarControles();
                actualizarTodo();

                alert('✅ Datos importados correctamente');
            } catch (error) {
                console.error('Error al importar JSON:', error);
                alert('❌ Error al importar el archivo JSON');
            }
        };
        reader.readAsText(file);
    });

    input.click();
}

// ===========================
// LOG DE INICIALIZACIÓN
// ===========================

console.log('%c🔒 Sistema de Análisis de Madurez Kaspersky', 'color: #0066cc; font-size: 16px; font-weight: bold;');
console.log('%cVersión 1.0 - Sistema cargado correctamente', 'color: #34c759; font-size: 12px;');

// Modal functionality
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('loginModal');
    const closeBtn = document.querySelector('.close-button');
    const loginForm = document.getElementById('loginForm');
    const guestButton = document.getElementById('guestButton');

    // Open modal when page loads
    modal.style.display = 'flex';

    // Close modal function
    function closeModal() {
        modal.style.display = 'none';
    }

    // Close modal when clicking on close button
    closeBtn.onclick = closeModal;

    // Close modal when clicking outside of modal content
    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    }

    // Handle login form submission
    loginForm.onsubmit = function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Simple validation
        if (username === 'mario.mendoza' && password === 'Zaq12wsx') {
            closeModal();
            alert('Login successful!');

            // Show buttons after successful login
            document.getElementById('guardarBtn').style.display = 'inline-block';
            document.getElementById('cargarBtn').style.display = 'inline-block';
            document.getElementById('exportarBtn').style.display = 'inline-block';
        } else {
            alert('Credenciales incorrectas, intenta de nuevo.');
        }
    }

    // Handle guest button click
    guestButton.onclick = function() {
        closeModal();
        alert('Acceso como invitado. Bienvenido!');
    }
});
