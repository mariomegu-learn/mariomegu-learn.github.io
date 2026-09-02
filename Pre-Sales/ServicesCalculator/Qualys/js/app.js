function calculatorApp() {
    return {
        viewMode: 'all', // 'all' para visibilidad simultánea completa, 'tabs' para pestañas
        activeCategory: 'platform',
        currentPreset: 'enterprise',
        categories: [
            { id: 'platform', name: 'Plataforma & Sensores', icon: 'server' },
            { id: 'risk_infra', name: 'Riesgo e Infraestructura', icon: 'shield-alert' },
            { id: 'cloud_container', name: 'Cloud & Contenedores', icon: 'cloud' },
            { id: 'app_sec', name: 'Seguridad App & WAS', icon: 'code-2' },
            { id: 'compliance', name: 'Cumplimiento & Auditoría', icon: 'file-check' },
            { id: 'remediation', name: 'Remediación & Scripts', icon: 'wrench' },
            { id: 'integrations', name: 'Capacitación & Integración', icon: 'graduation-cap' }
        ],
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
        chartInstance: null,

        initApp() {
            this.applyPreset('enterprise');
            this.$nextTick(() => {
                if (window.lucide) {
                    lucide.createIcons();
                }
                this.initChart();
            });

            this.$watch('config', () => {
                this.updateChart();
            }, { deep: true });
        },

        selectCategory(catId) {
            this.activeCategory = catId;
            if (this.viewMode === 'all') {
                const el = document.getElementById('cat-' + catId);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        },

        // Fórmulas de Cálculo
        calcVsaHours() {
            return (this.config.vsa.count || 0) * 1;
        },

        calcCaHours() {
            if (!this.config.ca.enabled) return 0;
            let hrs = 2;
            if (this.config.ca.manualDeploy) {
                hrs += (this.config.ca.manualDevices || 0) * (8 / 60);
            }
            return Math.round(hrs * 10) / 10;
        },

        calcVmdrHours() {
            if (!this.config.vmdr.enabled) return 0;
            return (this.config.vmdr.baseHours || 8) + (this.calcVsaHours());
        },

        calcTcHours() {
            if (!this.config.tc.enabled) return 0;
            return 6 + ((this.config.tc.accounts || 0) * 4);
        },

        calcCsHours() {
            if (!this.config.cs.enabled) return 0;
            return 6 + ((this.config.cs.clusters || 0) * 4);
        },

        calcWasHours() {
            if (!this.config.was.enabled) return 0;
            let hrs = 2;
            hrs += (this.config.was.simpleApps || 0) * 0.5;
            hrs += (this.config.was.loginApps || 0) * 1.0;
            hrs += (this.config.was.singleApis || 0) * 1.5;
            hrs += (this.config.was.multiApis || 0) * 3.5;
            return Math.round(hrs * 10) / 10;
        },

        calcCarHours() {
            if (!this.config.car.enabled) return 0;
            return (this.config.car.scriptsCount || 0) * 2;
        },

        isAllTrainingChecked() {
            return this.config.training.core && 
                   (!this.config.pm.enabled || this.config.training.pm) &&
                   (!this.config.was.enabled || this.config.training.was) &&
                   (!this.config.pa.enabled || this.config.training.pa) &&
                   (!(this.config.cs.enabled || this.config.fim.enabled || this.config.edr.enabled) || this.config.training.sensors);
        },

        toggleTraining(state) {
            this.config.training.core = state;
            this.config.training.pm = state;
            this.config.training.was = state;
            this.config.training.pa = state;
            this.config.training.sensors = state;
        },

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

        get estimatedDays() {
            return Math.round((this.totalHours / 8) * 10) / 10;
        },

        // Inicialización de Gráfico Chart.js con la Paleta GMS
        initChart() {
            const ctx = document.getElementById('hoursChart');
            if (!ctx) return;

            this.chartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Plataforma', 'Riesgo/Infra', 'Cloud', 'AppSec', 'Cumplimiento', 'Remediación', 'Capacitación'],
                    datasets: [{
                        data: this.getChartData(),
                        backgroundColor: [
                            '#005CFF', '#00205C', '#5FFFE5', '#222222', '#0088FF', '#C8C8C8', '#00C2A8'
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

        updateChart() {
            if (this.chartInstance) {
                this.chartInstance.data.datasets[0].data = this.getChartData();
                this.chartInstance.update();
            }
        },

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
                this.config.training.enabled = false;
            }
        },

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
