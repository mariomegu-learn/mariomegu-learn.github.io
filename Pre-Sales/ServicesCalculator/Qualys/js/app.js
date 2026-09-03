/**
 * ============================================================================
 * CALCULADORA DE ESFUERZO DE SERVICIOS QUALYS | GMS SECURITY SERVICES
 * ============================================================================
 * 
 * ARQUITECTURA TÉCNICA DEL MOTOR DE CÁLCULO:
 * - Framework JS: Alpine.js (Reactividad declarativa y ligereza sin build step).
 * - Visualización: Chart.js (Gráfico de Dona de distribución por categoría).
 * - Exportación: html2pdf.js (Generación de propuestas técnicas PDF en cliente).
 * - Paleta Corporativa: GMS Brand Guidelines (#005CFF, #222222, #00205C, #5FFFE5, #C8C8C8).
 * 
 * MODELO DE DATOS Y REGLAS DE CÁLCULO:
 * Basado en la especificación técnica de AlcanceImplementaciónQualys.docx:
 * - Categoría A: Platform & Sensor Management (ADMIN 3h, UD 3h, QGS 3h, vSA 1h/unidad, CA 2h + 8min/disp manual).
 * - Categoría B: Risk Management & Infrastructure (CSAM 6h, VMDR 8h + 1h/vSA, ETM 8h, EDR 4h).
 * - Categoría C: Cloud & Container Security (TotalCloud 6h + 4h/cuenta, Container Security 6h + 4h/cluster).
 * - Categoría D: Application Security (WAS 2h base + 0.5h app simple + 1h app login + 1.5h API + 3.5h API multi-endpoint, TotalAI 4h).
 * - Categoría E: Audit & Compliance (Policy Compliance 5h, PCI 3h, FIM 8h).
 * - Categoría F: Risk Remediation (Patch Management 4.5h, CAR 2h/script).
 * - Categoría G: Capacitación & Integraciones (ServiceNow 12h, Jira 10h, Syllabus Core 8h + extras por módulo activo).
 */

/**
 * Componente Principal de Alpine.js para la Calculadora de Servicios
 * @returns {Object} Estado reactivo y métodos de cálculo de la aplicación
 */
function calculatorApp() {
    return {
        /**
         * @property {string} viewMode - Modo de presentación visual ('all' = todas visibles simultáneamente, 'tabs' = por pestañas)
         * @property {string} activeCategory - ID de la categoría activa en navegación
         * @property {string} currentPreset - Escenario predefinido actualmente cargado ('basic' | 'standard' | 'enterprise' | 'none' | 'custom')
         */
        viewMode: 'all',
        activeCategory: 'platform',
        currentPreset: 'enterprise',

        /**
         * @property {Array<Object>} categories - Lista de categorías principales de servicios Qualys con sus metadatos
         */
        categories: [
            { id: 'platform', name: 'Plataforma y Sensores', icon: 'server' },
            { id: 'risk_infra', name: 'Riesgos e Infraestructura', icon: 'shield-alert' },
            { id: 'cloud_container', name: 'Seguridad Nube y Contenedores', icon: 'cloud' },
            { id: 'app_sec', name: 'Seguridad Web y Aplicaciones', icon: 'code-2' },
            { id: 'compliance', name: 'Auditoría y Cumplimiento', icon: 'file-check' },
            { id: 'remediation', name: 'Remediación y Scripts', icon: 'wrench' },
            { id: 'integrations', name: 'Integraciones y Capacitación', icon: 'graduation-cap' }
        ],

        /**
         * @property {Object} config - Estado global de los módulos y parámetros variables seleccionados
         */
        config: {
            admin: { enabled: true },
            ud: { enabled: true },
            qgs: { enabled: false },
            vsa: { count: 1 },
            ca: { enabled: true, manualDeploy: false, manualDevices: 0 },
            csam: { enabled: true },
            vmdr: { enabled: true, baseHours: 8 },
            etm: { enabled: false },
            edr: { enabled: false },
            tc: { enabled: false, accounts: 1 },
            cs: { enabled: false, clusters: 1 },
            was: { enabled: false, simpleApps: 0, loginApps: 0, singleApis: 0, multiApis: 0 },
            totalai: { enabled: false },
            pa: { enabled: false },
            pci: { enabled: false },
            fim: { enabled: false },
            pm: { enabled: false },
            car: { enabled: false, scriptsCount: 0 },
            integrations: { servicenow: false, jira: false },
            training: { enabled: true, core: true, pm: true, was: true, pa: true, sensors: true }
        },

        /** @property {Object|null} chartInstance - Referencia a la instancia activa de Chart.js */
        chartInstance: null,

        /**
         * Inicializa la aplicación cargando el escenario por defecto (Enterprise),
         * renderizando los iconos de Lucide e instanciando el gráfico reactivo.
         */
        initApp() {
            this.applyPreset('enterprise');
            this.$nextTick(() => {
                if (window.lucide) {
                    lucide.createIcons();
                }
                this.initChart();
            });

            // Reacción en tiempo real: Actualiza el gráfico cuando cambia cualquier valor en config
            this.$watch('config', () => {
                this.updateChart();
            }, { deep: true });
        },

        /**
         * Selecciona una categoría y realiza desplazamiento suave si la vista completa está activa
         * @param {string} catId - ID de la categoría a enfocar
         */
        selectCategory(catId) {
            this.activeCategory = catId;
            if (this.viewMode === 'all') {
                const el = document.getElementById('cat-' + catId);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        },

        // ====================================================================
        // FÓRMULAS DE CÁLCULO INDIVIDUAL DE MÓDULOS
        // ====================================================================

        /**
         * Calcula las horas para Virtual Scanner Appliances (vSA): 1 hora por vSA.
         * @returns {number} Horas estimadas para vSA
         */
        calcVsaHours() {
            return (this.config.vsa.count || 0) * 1;
        },

        /**
         * Calcula las horas para Cloud Agents (CA): 2 hrs base + (8 min / 60) por dispositivo manual.
         * @returns {number} Horas estimadas para CA
         */
        calcCaHours() {
            if (!this.config.ca.enabled) return 0;
            let hrs = 2;
            if (this.config.ca.manualDeploy) {
                hrs += (this.config.ca.manualDevices || 0) * (8 / 60);
            }
            return Math.round(hrs * 10) / 10;
        },

        /**
         * Calcula las horas para Vulnerability Management (VMDR): Esfuerzo base (default 8h) + 1h por vSA.
         * @returns {number} Horas estimadas para VMDR
         */
        calcVmdrHours() {
            if (!this.config.vmdr.enabled) return 0;
            return (this.config.vmdr.baseHours || 8) + (this.calcVsaHours());
        },

        /**
         * Calcula las horas para TotalCloud / CSPM: 6 hrs base + 4 hrs por cuenta de nube (AWS/Azure/GCP).
         * @returns {number} Horas estimadas para TotalCloud
         */
        calcTcHours() {
            if (!this.config.tc.enabled) return 0;
            return 6 + ((this.config.tc.accounts || 0) * 4);
        },

        /**
         * Calcula las horas para Container Security (CS): 6 hrs base + 4 hrs por cluster (K8s/Docker).
         * @returns {number} Horas estimadas para CS
         */
        calcCsHours() {
            if (!this.config.cs.enabled) return 0;
            return 6 + ((this.config.cs.clusters || 0) * 4);
        },

        /**
         * Calcula las horas para Web Application Scanning (WAS):
         * 2 hrs base global + (0.5h * apps simples) + (1h * apps login) + (1.5h * APIs) + (3.5h * APIs complejas).
         * @returns {number} Horas estimadas para WAS
         */
        calcWasHours() {
            if (!this.config.was.enabled) return 0;
            let hrs = 2;
            hrs += (this.config.was.simpleApps || 0) * 0.5;
            hrs += (this.config.was.loginApps || 0) * 1.0;
            hrs += (this.config.was.singleApis || 0) * 1.5;
            hrs += (this.config.was.multiApis || 0) * 3.5;
            return Math.round(hrs * 10) / 10;
        },

        /**
         * Calcula las horas para Custom Assessment & Remediation (CAR): 2 hrs por script personalizado.
         * @returns {number} Horas estimadas para CAR
         */
        calcCarHours() {
            if (!this.config.car.enabled) return 0;
            return (this.config.car.scriptsCount || 0) * 2;
        },

        /**
         * Verifica si todos los módulos de capacitación técnica aplicables están marcados
         * @returns {boolean} True si todas las capacitaciones activas están seleccionadas
         */
        isAllTrainingChecked() {
            return this.config.training.core && 
                   (!this.config.pm.enabled || this.config.training.pm) &&
                   (!this.config.was.enabled || this.config.training.was) &&
                   (!this.config.pa.enabled || this.config.training.pa) &&
                   (!(this.config.cs.enabled || this.config.fim.enabled || this.config.edr.enabled) || this.config.training.sensors);
        },

        /**
         * Marca o desmarca en lote todas las opciones de capacitación técnica sin ocultarlas
         * @param {boolean} state - Estado deseado (true = seleccionar todo, false = deseleccionar todo)
         */
        toggleTraining(state) {
            this.config.training.core = state;
            this.config.training.pm = state;
            this.config.training.was = state;
            this.config.training.pa = state;
            this.config.training.sensors = state;
        },

        /**
         * Calcula las horas dinámicas de Capacitación según los módulos activos en el proyecto:
         * - Syllabus Core (VMDR & AssetView): 8h
         * - Módulo PM: +2h (si PM está activo y seleccionado)
         * - Módulo WAS: +3h (si WAS está activo y seleccionado)
         * - Módulo PC: +3h (si PC está activo y seleccionado)
         * - Módulos Sensores (CS/FIM/EDR): +2h c/u (si están activos y seleccionados)
         * @returns {number} Horas totales acumuladas de capacitación
         */
        calcTrainingHours() {
            let hrs = 0;
            if (this.config.training.core) hrs += 8;
            if (this.config.pm.enabled && this.config.training.pm) hrs += 2;
            if (this.config.was.enabled && this.config.training.was) hrs += 3;
            if (this.config.pa.enabled && this.config.training.pa) hrs += 3;
            if (this.config.training.sensors) {
                if (this.config.cs.enabled) hrs += 2;
                if (this.config.fim.enabled) hrs += 2;
                if (this.config.edr.enabled) hrs += 2;
            }
            return hrs;
        },

        // ====================================================================
        // FÓRMULAS DE AGREGACIÓN POR CATEGORÍA Y TOTAL GENERAL
        // ====================================================================

        /**
         * Obtiene la suma total de horas para una categoría específica de servicio
         * @param {string} catId - ID de la categoría ('platform'|'risk_infra'|'cloud_container'|'app_sec'|'compliance'|'remediation'|'integrations')
         * @returns {number} Subtotal de horas de la categoría
         */
        getCategoryHours(catId) {
            let total = 0;
            if (catId === 'platform') {
                if (this.config.admin.enabled) total += 3;
                if (this.config.ud.enabled) total += 3;
                if (this.config.qgs.enabled) total += 3;
                total += this.calcVsaHours();
                total += this.calcCaHours();
            } else if (catId === 'risk_infra') {
                if (this.config.csam.enabled) total += 6;
                total += this.calcVmdrHours();
                if (this.config.etm.enabled) total += 8;
                if (this.config.edr.enabled) total += 4;
            } else if (catId === 'cloud_container') {
                total += this.calcTcHours();
                total += this.calcCsHours();
            } else if (catId === 'app_sec') {
                total += this.calcWasHours();
                if (this.config.totalai.enabled) total += 4;
            } else if (catId === 'compliance') {
                if (this.config.pa.enabled) total += 5;
                if (this.config.pci.enabled) total += 3;
                if (this.config.fim.enabled) total += 8;
            } else if (catId === 'remediation') {
                if (this.config.pm.enabled) total += 4.5;
                total += this.calcCarHours();
            } else if (catId === 'integrations') {
                total += this.calcTrainingHours();
                if (this.config.integrations.servicenow) total += 12;
                if (this.config.integrations.jira) total += 10;
            }
            return Math.round(total * 10) / 10;
        },

        /**
         * Getter que calcula la suma total general del esfuerzo en horas de todas las categorías
         * @returns {number} Total general en horas
         */
        get totalHours() {
            return Math.round(
                (this.getCategoryHours('platform') +
                this.getCategoryHours('risk_infra') +
                this.getCategoryHours('cloud_container') +
                this.getCategoryHours('app_sec') +
                this.getCategoryHours('compliance') +
                this.getCategoryHours('remediation') +
                this.getCategoryHours('integrations')) * 10
            ) / 10;
        },

        /**
         * Getter que convierte el total de horas a jornadas laborables estimadas (8 horas/día)
         * @returns {number} Número estimado de días laborables
         */
        get estimatedDays() {
            return Math.round((this.totalHours / 8) * 10) / 10;
        },

        // ====================================================================
        // GESTIÓN DE GRÁFICOS INTERACTIVOS (CHART.JS)
        // ====================================================================

        /**
         * Inicializa la dona interactiva de Chart.js configurando la paleta institucional de GMS
         */
        initChart() {
            const ctx = document.getElementById('hoursChart');
            if (!ctx) return;

            this.chartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: [
                        'Plataforma', 
                        'Riesgos e Infraestructura', 
                        'Seguridad Nube', 
                        'Seguridad Web/Apps', 
                        'Auditoría y Cumplimiento', 
                        'Remediación', 
                        'Capacitación'
                    ],
                    datasets: [{
                        data: this.getChartData(),
                        backgroundColor: [
                            '#005CFF', // Azul GMS Principal
                            '#00205C', // Dark Blue GMS
                            '#5FFFE5', // Aqua GMS
                            '#222222', // Negro GMS
                            '#0088FF', // Azul Claro
                            '#C8C8C8', // Gris GMS
                            '#00C2A8'  // Verde Aqua
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    cutout: '72%'
                }
            });
        },

        /**
         * Recupera el array de subtotales por categoría para alimentar el gráfico
         * @returns {Array<number>} Subtotales de horas por categoría
         */
        getChartData() {
            return [
                this.getCategoryHours('platform'),
                this.getCategoryHours('risk_infra'),
                this.getCategoryHours('cloud_container'),
                this.getCategoryHours('app_sec'),
                this.getCategoryHours('compliance'),
                this.getCategoryHours('remediation'),
                this.getCategoryHours('integrations')
            ];
        },

        /**
         * Actualiza los datos del gráfico cuando cambia la configuración de módulos
         */
        updateChart() {
            if (this.chartInstance) {
                this.chartInstance.data.datasets[0].data = this.getChartData();
                this.chartInstance.update();
            }
        },

        // ====================================================================
        // GESTIÓN DE EXPORTACIÓN Y ACCIONES RÁPIDAS
        // ====================================================================

        /**
         * Genera y descarga una propuesta técnica en PDF utilizando html2pdf.js
         */
        exportPDF() {
            const element = document.getElementById('report-content');
            const opt = {
                margin:       0.4,
                filename:     'Estimacion_Servicios_Qualys_GMS.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
        },

        /**
         * Accional global de limpieza total: Desmarca todos los módulos y lleva las horas a 0
         */
        clearAll() {
            this.currentPreset = 'none';
            this.config = {
                admin: { enabled: false },
                ud: { enabled: false },
                qgs: { enabled: false },
                vsa: { count: 0 },
                ca: { enabled: false, manualDeploy: false, manualDevices: 0 },
                csam: { enabled: false },
                vmdr: { enabled: false, baseHours: 8 },
                etm: { enabled: false },
                edr: { enabled: false },
                tc: { enabled: false, accounts: 0 },
                cs: { enabled: false, clusters: 0 },
                was: { enabled: false, simpleApps: 0, loginApps: 0, singleApis: 0, multiApis: 0 },
                totalai: { enabled: false },
                pa: { enabled: false },
                pci: { enabled: false },
                fim: { enabled: false },
                pm: { enabled: false },
                car: { enabled: false, scriptsCount: 0 },
                integrations: { servicenow: false, jira: false },
                training: { enabled: false, core: false, pm: false, was: false, pa: false, sensors: false }
            };
        },

        /**
         * Desmarca de manera independiente todos los elementos de una categoría específica
         * @param {string} catId - ID de la categoría a limpiar
         */
        clearCategory(catId) {
            if (catId === 'platform') {
                this.config.admin.enabled = false;
                this.config.ud.enabled = false;
                this.config.qgs.enabled = false;
                this.config.vsa.count = 0;
                this.config.ca.enabled = false;
                this.config.ca.manualDeploy = false;
                this.config.ca.manualDevices = 0;
            } else if (catId === 'risk_infra') {
                this.config.csam.enabled = false;
                this.config.vmdr.enabled = false;
                this.config.etm.enabled = false;
                this.config.edr.enabled = false;
            } else if (catId === 'cloud_container') {
                this.config.tc.enabled = false;
                this.config.tc.accounts = 0;
                this.config.cs.enabled = false;
                this.config.cs.clusters = 0;
            } else if (catId === 'app_sec') {
                this.config.was.enabled = false;
                this.config.was.simpleApps = 0;
                this.config.was.loginApps = 0;
                this.config.was.singleApis = 0;
                this.config.was.multiApis = 0;
                this.config.totalai.enabled = false;
            } else if (catId === 'compliance') {
                this.config.pa.enabled = false;
                this.config.pci.enabled = false;
                this.config.fim.enabled = false;
            } else if (catId === 'remediation') {
                this.config.pm.enabled = false;
                this.config.car.enabled = false;
                this.config.car.scriptsCount = 0;
            } else if (catId === 'integrations') {
                this.config.integrations.servicenow = false;
                this.config.integrations.jira = false;
                this.config.training.core = false;
                this.config.training.pm = false;
                this.config.training.was = false;
                this.config.training.pa = false;
                this.config.training.sensors = false;
            }
        },

        /**
         * Restablece la calculadora a su estado base inicial
         */
        resetConfig() {
            this.currentPreset = 'custom';
            this.config = {
                admin: { enabled: true },
                ud: { enabled: true },
                qgs: { enabled: false },
                vsa: { count: 0 },
                ca: { enabled: true, manualDeploy: false, manualDevices: 0 },
                csam: { enabled: true },
                vmdr: { enabled: true, baseHours: 8 },
                etm: { enabled: false },
                edr: { enabled: false },
                tc: { enabled: false, accounts: 0 },
                cs: { enabled: false, clusters: 0 },
                was: { enabled: false, simpleApps: 0, loginApps: 0, singleApis: 0, multiApis: 0 },
                totalai: { enabled: false },
                pa: { enabled: false },
                pci: { enabled: false },
                fim: { enabled: false },
                pm: { enabled: false },
                car: { enabled: false, scriptsCount: 0 },
                integrations: { servicenow: false, jira: false },
                training: { enabled: true, core: true, pm: true, was: true, pa: true, sensors: true }
            };
        },

        /**
         * Aplica un escenario técnico predefinido de pre-venta
         * @param {string} type - Tipo de escenario ('basic' | 'standard' | 'enterprise')
         */
        applyPreset(type) {
            this.resetConfig();
            this.currentPreset = type;
            if (type === 'basic') {
                this.config.vsa.count = 1;
            } else if (type === 'standard') {
                this.config.vsa.count = 2;
                this.config.etm.enabled = true;
                this.config.pm.enabled = true;
                this.config.pa.enabled = true;
            } else if (type === 'enterprise') {
                this.config.qgs.enabled = true;
                this.config.vsa.count = 4;
                this.config.etm.enabled = true;
                this.config.tc.enabled = true;
                this.config.tc.accounts = 2;
                this.config.cs.enabled = true;
                this.config.cs.clusters = 2;
                this.config.was.enabled = true;
                this.config.was.loginApps = 3;
                this.config.was.multiApis = 2;
                this.config.pa.enabled = true;
                this.config.pm.enabled = true;
                this.config.car.enabled = true;
                this.config.car.scriptsCount = 2;
                this.config.integrations.servicenow = true;
                this.config.integrations.jira = true;
            }
        }
    }
}
