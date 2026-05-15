/* ============================================================
   Linux operativo para Kaspersky XDR Optimum
   app.js COMPLETO - Fases 1 a Final
   Autor: Kaspersky Presales Enablement

   Requisitos esperados del HTML:
   - main#mainContent
   - nav#sidebarNav
   - nav#mobileNav
   - input#moduleSearch
   - input#mobileModuleSearch
   - #helpModal, #resetProgressModal, #toastContainer
   - Bootstrap 5, Bootstrap Icons y Prism.js cargados por CDN

   Seguridad:
   Este curso NO ejecuta comandos reales. Solo muestra comandos,
   resalta sintaxis y permite copiar al portapapeles.
============================================================ */

const STORAGE_KEY = "kasperskyLinuxCourseProgressFull";
const HELP_MODAL_SEEN_KEY = "kasperskyLinuxCourseHelpSeen";
let currentModuleId = null;
let courseProgress = {
  completedModules: [],
  moduleProgress: {},
  quizResults: {},
  activeModule: null,
  lastUpdated: null
};

/* ============================================================
   DATA: RUTA DE APRENDIZAJE COMPLETA
============================================================ */
const modules = [
  { id: "module-0", number: 0, title: "Introducción al curso", level: "Básico", tags: ["Inicio", "Metodología", "Seguridad"], icon: "bi-play-circle", contentType: "intro", description: "Objetivos, audiencia, metodología y preparación para el curso." },
  { id: "module-1", number: 1, title: "Fundamentos de Linux para Kaspersky", level: "Básico", tags: ["Linux", "Shell", "Permisos"], icon: "bi-terminal", contentType: "standard", description: "Distribuciones, estructura de archivos, usuarios, permisos, shell y sudo." },
  { id: "module-2", number: 2, title: "Comandos esenciales del sistema operativo", level: "Básico", tags: ["Comandos", "Archivos", "CLI"], icon: "bi-code-square", contentType: "standard", description: "Navegación, archivos, lectura, búsqueda y operación diaria." },
  { id: "module-3", number: 3, title: "Administración de paquetes", level: "Intermedio", tags: ["DEB", "RPM", "Instalación"], icon: "bi-box-seam", contentType: "standard", description: "apt, apt-get, dpkg, yum, dnf, rpm e instalación DEB/RPM." },
  { id: "module-4", number: 4, title: "Servicios y systemd", level: "Intermedio", tags: ["systemd", "Servicios", "Logs"], icon: "bi-gear", contentType: "standard", description: "Administración de servicios, systemctl, journalctl y troubleshooting." },
  { id: "module-5", number: 5, title: "Red, DNS y conectividad", level: "Intermedio", tags: ["Red", "DNS", "Puertos"], icon: "bi-diagram-3", contentType: "standard", description: "Validación de IP, rutas, DNS, puertos y conectividad." },
  { id: "module-6", number: 6, title: "Procesos, recursos y rendimiento", level: "Intermedio", tags: ["CPU", "RAM", "Disco"], icon: "bi-speedometer2", contentType: "standard", description: "CPU, memoria, disco, procesos y carga del sistema." },
  { id: "module-7", number: 7, title: "Logs y diagnóstico", level: "Intermedio", tags: ["Logs", "Diagnóstico", "Evidencia"], icon: "bi-file-earmark-text", contentType: "standard", description: "Análisis de logs, journalctl, dmesg, grep y evidencias de soporte." },
  { id: "module-8", number: 8, title: "Kaspersky Security Center Linux", level: "Avanzado", tags: ["KSC", "Instalación", "Administración"], icon: "bi-hdd-network", contentType: "standard", description: "Prerrequisitos, DBMS, DNS, usuarios, grupos, instalación y postinstall." },
  { id: "module-9", number: 9, title: "Network Agent para Linux", level: "Avanzado", tags: ["Network Agent", "KSC", "Conectividad"], icon: "bi-broadcast", contentType: "standard", description: "Rol del agente, comunicación con KSC, validación y troubleshooting." },
  { id: "module-10", number: 10, title: "Kaspersky Endpoint Security for Linux", level: "Avanzado", tags: ["KES", "kesl-control", "Protección"], icon: "bi-shield-check", contentType: "standard", description: "Instalación, administración local, kesl-control, tareas, estado y escaneos." },
  { id: "module-11", number: 11, title: "Troubleshooting aplicado", level: "Avanzado", tags: ["Soporte", "Diagnóstico", "Escalamiento"], icon: "bi-tools", contentType: "standard", description: "Checklists, fallas típicas, comandos de diagnóstico y evidencias." },
  { id: "module-12", number: 12, title: "Laboratorios prácticos", level: "Práctico", tags: ["Labs", "Ejercicios", "Validación"], icon: "bi-flask", contentType: "standard", description: "Laboratorios guiados, escenarios, retos, validaciones y ejercicios." }
].map(m => ({ ...m, status: "available", progress: 0 }));

/* ============================================================
   DATA: CONTENIDO COMPLETO DE MÓDULOS
============================================================ */
const moduleContent = {
  "module-1": {
    objectives: [
      "Diferenciar familias Linux basadas en DEB y RPM.",
      "Reconocer la estructura básica del sistema de archivos Linux.",
      "Entender el rol del shell en tareas de implementación y soporte.",
      "Comprender usuarios, grupos, permisos y uso controlado de sudo.",
      "Relacionar fundamentos Linux con KSC Linux, Network Agent y KES for Linux."
    ],
    sections: [
      { title: "Linux en el contexto Kaspersky", body: "Linux funciona como plataforma de seguridad base para servidores y endpoints donde se instalan componentes empresariales. En escenarios de administración de Kaspersky, el equipo debe validar sistema operativo, distribución, arquitectura, DNS, usuarios, permisos, servicios, rutas y paquetes antes de ejecutar actividades de implementación o soporte." },
      { title: "Familias DEB y RPM", body: "Las distribuciones basadas en Debian/Ubuntu suelen usar paquetes .deb y herramientas apt, apt-get y dpkg. Las distribuciones basadas en Red Hat y compatibles suelen usar paquetes .rpm y herramientas yum, dnf y rpm. KSC Linux se entrega en paquetes según la distribución." },
      { title: "Sistema de archivos", body: "La estructura Linux es jerárquica. Directorios clave para soporte: /etc para configuración, /var y /var/log para datos variables y logs, /opt para software de terceros, /tmp para temporales y /root para el perfil del usuario root." },
      { title: "Usuarios, grupos y privilegios", body: "Linux aplica seguridad por usuarios, grupos y permisos. El usuario root tiene privilegios máximos. sudo permite elevar privilegios con trazabilidad. En implementaciones Kaspersky pueden requerirse cuentas/grupos específicos según versión y documentación oficial." },
      { title: "Permisos r, w, x", body: "Los permisos se dividen en propietario, grupo y otros. r permite lectura, w permite escritura y x permite ejecución o entrada a directorios. Modificar permisos sin control puede impactar servicios o instalación." }
    ],
    commands: [
      cmd("Identificación", "Identificar distribución Linux", "cat /etc/os-release"),
      cmd("Identificación", "Ver kernel y arquitectura", "uname -a"),
      cmd("Identificación", "Validar FQDN del host", "hostname -f"),
      cmd("Sesión", "Ver usuario actual", "whoami"),
      cmd("Sesión", "Ver UID/GID y grupos", "id"),
      cmd("Navegación", "Directorio actual", "pwd"),
      cmd("Navegación", "Listar archivos y permisos", "ls -la"),
      cmd("Privilegios", "Elevar sesión con control", "sudo -i"),
      cmd("Permisos", "Ver permisos de archivo", "ls -l /etc/passwd"),
      cmd("Permisos", "Dar ejecución a script", "chmod +x script.sh"),
      cmd("Permisos", "Cambiar propietario/grupo", "sudo chown usuario:grupo archivo.conf")
    ],
    lab: `# Validación base del sistema\ncat /etc/os-release\nuname -a\nhostname -f\nwhoami\nid\npwd\nls -la\ncd /etc\nls -la | head\ncd /var/log\nls -la | head`,
    checklist: ["Identifiqué la distribución Linux.", "Reconozco DEB vs RPM.", "Ubico /etc, /var/log y /opt.", "Puedo validar usuario/grupos.", "Comprendo el uso controlado de sudo.", "Puedo explicar permisos r/w/x."],
    quiz: quiz([
      ["¿Qué comando identifica la distribución Linux instalada?", ["cat /etc/os-release", "systemctl restart linux", "show version"], 0],
      ["¿Qué familia de paquetes se asocia con Debian/Ubuntu?", ["RPM", "DEB", "MSI"], 1],
      ["¿Qué directorio contiene configuración del sistema?", ["/etc", "/random", "/games"], 0],
      ["¿Por qué no operar permanentemente como root?", ["Reduce trazabilidad y aumenta riesgo operativo", "Linux no permite usuarios normales", "Impide usar comandos de red"], 0]
    ])
  },
  "module-2": {
    objectives: ["Dominar navegación y manipulación segura de archivos.", "Leer, filtrar y buscar contenido.", "Distinguir comandos seguros de comandos destructivos.", "Recolectar evidencia básica para soporte."],
    sections: [
      { title: "Navegación", body: "Los comandos pwd, cd y ls permiten ubicarse rápidamente en el sistema. Son esenciales antes de modificar rutas, copiar logs o validar instaladores." },
      { title: "Manipulación de archivos", body: "cp, mv, mkdir, touch y rm permiten crear, mover, copiar o eliminar objetos. rm debe tratarse como comando destructivo y usarse con extrema precaución." },
      { title: "Lectura y seguimiento", body: "cat, less, head y tail permiten revisar archivos. tail -f es útil para observar logs en tiempo real durante instalación, actualización o reinicio de servicios." },
      { title: "Búsqueda", body: "grep y find permiten ubicar errores, rutas, archivos o patrones. Son claves para troubleshooting y preparación de evidencias." }
    ],
    commands: [
      cmd("Navegación", "Mostrar directorio actual", "pwd"), cmd("Navegación", "Listar con detalles", "ls -la"), cmd("Navegación", "Cambiar de directorio", "cd /var/log"),
      cmd("Archivos", "Crear carpeta", "mkdir soporte"), cmd("Archivos", "Crear archivo vacío", "touch notas.txt"), cmd("Archivos", "Copiar archivo", "cp origen.log copia.log"), cmd("Archivos", "Mover/renombrar", "mv archivo.log archivo.old"),
      cmd("Lectura", "Ver archivo", "cat archivo.log"), cmd("Lectura", "Ver paginado", "less archivo.log"), cmd("Lectura", "Últimas líneas", "tail -100 archivo.log"), cmd("Lectura", "Seguimiento en vivo", "tail -f archivo.log"),
      cmd("Búsqueda", "Buscar texto", "grep -i \"error\" archivo.log"), cmd("Búsqueda", "Buscar recursivo", "grep -R \"kaspersky\" /var/log 2>/dev/null"), cmd("Búsqueda", "Buscar archivos", "find / -name \"*kes*\" 2>/dev/null")
    ],
    lab: `# Exploración segura\npwd\nls -la\nmkdir ~/lab-linux-kaspersky\ncd ~/lab-linux-kaspersky\ntouch ejemplo.log\necho "Servicio iniciado" > ejemplo.log\necho "ERROR simulado" >> ejemplo.log\ncat ejemplo.log\ngrep -i "error" ejemplo.log\ncp ejemplo.log ejemplo.bak\nls -la`,
    checklist: ["Uso pwd/cd/ls con seguridad.", "Leo archivos con cat/less/tail.", "Uso grep para filtrar errores.", "Uso find sin generar ruido excesivo.", "Reconozco rm como comando destructivo."],
    quiz: quiz([
      ["¿Qué comando permite ver logs en tiempo real?", ["tail -f", "rm -rf", "pwd"], 0],
      ["¿Qué comando busca patrones de texto?", ["grep", "mkdir", "uname"], 0],
      ["¿Cuál es un comando destructivo si se usa mal?", ["rm", "pwd", "cat"], 0],
      ["¿Qué comando muestra el directorio actual?", ["pwd", "id", "free"], 0]
    ])
  },
  "module-3": {
    objectives: ["Diferenciar gestores DEB/RPM.", "Instalar, consultar y remover paquetes.", "Aplicar el concepto a instaladores Kaspersky.", "Validar dependencias y paquetes instalados."],
    sections: [
      { title: "Gestión de paquetes", body: "La instalación de componentes en Linux se realiza mediante gestores de paquetes. En Kaspersky es crítico elegir el paquete que corresponde a la distribución y arquitectura." },
      { title: "DEB", body: "Familias Debian/Ubuntu usan apt, apt-get y dpkg. apt resuelve dependencias desde repositorios; dpkg instala paquetes locales pero puede requerir resolver dependencias posteriormente." },
      { title: "RPM", body: "Familias Red Hat y compatibles usan yum, dnf y rpm. yum/dnf resuelven dependencias; rpm instala o consulta paquetes locales." },
      { title: "Buenas prácticas", body: "Antes de instalar: validar OS, arquitectura, espacio, repositorios, conectividad, paquete correcto y snapshot o respaldo si aplica." }
    ],
    commands: [
      cmd("DEB", "Actualizar índices", "sudo apt update"), cmd("DEB", "Instalar paquete de repositorio", "sudo apt install paquete"), cmd("DEB", "Instalar DEB local", "sudo apt install ./paquete.deb"), cmd("DEB", "Listar paquetes", "dpkg -l | grep paquete"), cmd("DEB", "Consultar paquete", "dpkg -s paquete"),
      cmd("RPM", "Instalar con dnf", "sudo dnf install paquete"), cmd("RPM", "Instalar RPM local", "sudo dnf install ./paquete.rpm"), cmd("RPM", "Consulta RPM", "rpm -qa | grep paquete"), cmd("RPM", "Información RPM", "rpm -qi paquete"),
      cmd("KSC Linux", "Ejemplo DEB KSC", "sudo apt install ./ksc64_<version>_amd64.deb"), cmd("KSC Linux", "Ejemplo RPM KSC", "sudo yum install ./ksc64-<version>.x86_64.rpm -y")
    ],
    lab: `# Identificar familia y gestor\ncat /etc/os-release\nwhich apt || true\nwhich dnf || true\nwhich yum || true\nwhich rpm || true\nwhich dpkg || true\n\n# Consultar paquetes instalados\ndpkg -l 2>/dev/null | head || true\nrpm -qa 2>/dev/null | head || true`,
    checklist: ["Identifico si el sistema usa DEB o RPM.", "Sé consultar paquetes instalados.", "Sé instalar paquetes locales con el gestor correcto.", "Valido dependencias antes de instalar.", "Uso comandos Kaspersky como ejemplos, no como receta universal."],
    quiz: quiz([
      ["¿Qué herramienta se usa comúnmente en Ubuntu para instalar paquetes?", ["apt", "rpm", "systemctl"], 0],
      ["¿Qué extensión corresponde a Red Hat y compatibles?", [".rpm", ".deb", ".msi"], 0],
      ["¿Qué se debe validar antes de instalar KSC Linux?", ["Distribución, DBMS, DNS y paquete correcto", "Solo color del tema", "Nada"], 0],
      ["¿Qué comando consulta paquetes RPM instalados?", ["rpm -qa", "dpkg -l", "tail -f"], 0]
    ])
  },
  "module-4": {
    objectives: ["Administrar servicios con systemd.", "Revisar estado y logs con journalctl.", "Diagnosticar servicios fallidos.", "Relacionar servicios con componentes Kaspersky."],
    sections: [
      { title: "systemd", body: "systemd administra servicios en muchas distribuciones modernas. Para soporte, systemctl y journalctl son fundamentales." },
      { title: "Ciclo de vida", body: "Un servicio puede iniciarse, detenerse, reiniciarse, habilitarse al arranque o deshabilitarse. Toda acción sobre servicios productivos debe planearse." },
      { title: "Logs", body: "journalctl permite revisar eventos por unidad, tiempo, prioridad y seguimiento en vivo." },
      { title: "Kaspersky", body: "Los nombres exactos de servicios pueden variar por producto y versión. Se recomienda descubrirlos con systemctl y filtros como grep -i kaspersky, grep -i kl o grep -i kes." }
    ],
    commands: [
      cmd("Servicios", "Estado", "systemctl status servicio"), cmd("Servicios", "Iniciar", "sudo systemctl start servicio"), cmd("Servicios", "Detener", "sudo systemctl stop servicio"), cmd("Servicios", "Reiniciar", "sudo systemctl restart servicio"), cmd("Servicios", "Habilitar arranque", "sudo systemctl enable servicio"), cmd("Servicios", "Servicios fallidos", "systemctl --failed"),
      cmd("Logs", "Logs de servicio", "journalctl -u servicio"), cmd("Logs", "Logs en vivo", "journalctl -u servicio -f"), cmd("Logs", "Últimos errores", "journalctl -p err -n 100"),
      cmd("Descubrimiento", "Buscar servicios Kaspersky", "systemctl list-units --type=service | grep -Ei 'kaspersky|kl|kes'")
    ],
    lab: `# Diagnóstico básico de servicios\nsystemctl --failed\nsystemctl list-units --type=service | head\njournalctl -p err -n 50\n\n# Descubrimiento de servicios relacionados\nsystemctl list-units --type=service | grep -Ei 'kaspersky|kl|kes' || true`,
    checklist: ["Sé consultar estado de servicios.", "Sé revisar logs con journalctl.", "Sé detectar servicios fallidos.", "No reinicio servicios críticos sin ventana/autorización.", "Descubro servicios Kaspersky según versión instalada."],
    quiz: quiz([
      ["¿Qué comando muestra estado de un servicio?", ["systemctl status", "ip route", "df -h"], 0],
      ["¿Qué comando revisa logs de una unidad systemd?", ["journalctl -u", "useradd", "rpm -qa"], 0],
      ["¿Qué comando lista servicios fallidos?", ["systemctl --failed", "cat /etc/os-release", "free -h"], 0],
      ["¿Qué debe hacerse antes de reiniciar servicios productivos?", ["Validar impacto/autorización", "Nada", "Eliminar logs"], 0]
    ])
  },
  "module-5": {
    objectives: ["Validar IP, rutas y DNS.", "Probar conectividad por puerto.", "Diagnosticar problemas de comunicación con KSC.", "Recolectar evidencia de red."],
    sections: [
      { title: "IP y rutas", body: "ip addr e ip route permiten revisar interfaces, direcciones IP y ruta por defecto. Son el punto de partida para cualquier problema de conectividad." },
      { title: "DNS", body: "DNS correcto es crítico para registrar agentes, resolver servidores y evitar errores durante instalación o comunicación." },
      { title: "Puertos", body: "ss y nc permiten revisar puertos locales y conectividad TCP remota. En ambientes corporativos pueden intervenir firewalls, proxies o inspección de tráfico." },
      { title: "Kaspersky", body: "En KSC Linux el DNS disponible es un prerrequisito documentado. Los puertos exactos y arquitectura deben validarse según versión y diseño." }
    ],
    commands: [
      cmd("IP", "Interfaces", "ip addr"), cmd("Rutas", "Tabla de rutas", "ip route"), cmd("Hostname", "FQDN", "hostname -f"),
      cmd("DNS", "Resolver nombre", "nslookup servidor"), cmd("DNS", "Consulta detallada", "dig servidor"), cmd("DNS", "Resolver config", "cat /etc/resolv.conf"),
      cmd("Puertos", "Puertos locales", "ss -tulpen"), cmd("Puertos", "Probar TCP", "nc -vz servidor puerto"), cmd("HTTP", "Probar endpoint", "curl -I https://servidor"), cmd("Ruta", "Trazar ruta", "traceroute servidor")
    ],
    lab: `# Diagnóstico de red\nhostname -f\nip addr\nip route\ncat /etc/resolv.conf\nnslookup servidor.ejemplo.local\nss -tulpen\n# Reemplaza servidor y puerto por valores reales autorizados\nnc -vz servidor puerto`,
    checklist: ["Valido IP e interfaz activa.", "Valido ruta por defecto.", "Valido resolución DNS.", "Pruebo conectividad por puerto.", "Documento evidencias para escalamiento."],
    quiz: quiz([
      ["¿Qué comando muestra interfaces IP?", ["ip addr", "ls -la", "id"], 0],
      ["¿Qué comando prueba conectividad TCP a un puerto?", ["nc -vz servidor puerto", "chmod +x", "pwd"], 0],
      ["¿Qué comando valida resolución DNS?", ["nslookup", "free", "top"], 0],
      ["¿Por qué DNS importa en KSC Linux?", ["Es prerrequisito para resolución/comunicación", "Solo cambia colores", "No importa"], 0]
    ])
  },
  "module-6": {
    objectives: ["Revisar CPU, RAM, carga y disco.", "Detectar consumo anormal.", "Identificar procesos relevantes.", "Recolectar métricas básicas para soporte."],
    sections: [
      { title: "Procesos", body: "ps, pgrep, pidof y top permiten identificar procesos activos, consumo y estado." },
      { title: "Memoria y CPU", body: "free, uptime, vmstat y top permiten validar carga y memoria disponible." },
      { title: "Disco", body: "df, du, lsblk y findmnt permiten revisar capacidad, uso y montajes. Falta de espacio en /var o /opt puede afectar logs o aplicaciones." },
      { title: "Soporte Kaspersky", body: "Durante escaneos, actualizaciones o tareas programadas, el consumo puede aumentar. Deben evaluarse patrones y ventanas de operación." }
    ],
    commands: [
      cmd("Procesos", "Listado completo", "ps aux"), cmd("Procesos", "Buscar procesos", "ps aux | grep -Ei 'kaspersky|kes|klnagent|kl'"), cmd("Procesos", "Interactivo", "top"), cmd("Procesos", "PID por nombre", "pgrep proceso"),
      cmd("Memoria", "Memoria", "free -h"), cmd("CPU", "Carga", "uptime"), cmd("CPU/RAM", "Métricas", "vmstat 1 5"),
      cmd("Disco", "Uso de particiones", "df -h"), cmd("Disco", "Uso por carpeta", "du -sh /var/log"), cmd("Disco", "Bloques", "lsblk"), cmd("Montajes", "Montajes", "findmnt")
    ],
    lab: `# Salud de recursos\nuptime\nfree -h\ndf -h\nlsblk\nps aux | head\nps aux | grep -Ei 'kaspersky|kes|klnagent|kl' || true\ndu -sh /var/log 2>/dev/null`,
    checklist: ["Valido CPU/carga.", "Valido memoria disponible.", "Valido espacio en disco.", "Identifico procesos relevantes.", "No mato procesos sin entender impacto."],
    quiz: quiz([
      ["¿Qué comando muestra espacio en disco?", ["df -h", "whoami", "cat"], 0],
      ["¿Qué comando muestra memoria?", ["free -h", "ip addr", "grep"], 0],
      ["¿Qué herramienta interactiva muestra procesos?", ["top", "mkdir", "dpkg"], 0],
      ["¿Qué se debe hacer antes de matar un proceso?", ["Validar impacto", "Ejecutar kill -9 siempre", "Borrar /var"], 0]
    ])
  },
  "module-7": {
    objectives: ["Ubicar logs del sistema.", "Filtrar errores y eventos.", "Usar journalctl y dmesg.", "Preparar evidencias para soporte."],
    sections: [
      { title: "Logs del sistema", body: "Según distribución, los logs pueden ubicarse en /var/log/syslog, /var/log/messages, /var/log/auth.log o /var/log/secure." },
      { title: "journalctl", body: "Permite consultar eventos systemd por unidad, prioridad, rango de tiempo y seguimiento en vivo." },
      { title: "dmesg", body: "Permite revisar mensajes del kernel, útiles para controladores, discos, interfaces y eventos de bajo nivel." },
      { title: "Evidencia", body: "Para escalar casos se recomienda recolectar fecha/hora, versión SO, servicio afectado, logs relevantes, comandos ejecutados y salida completa." }
    ],
    commands: [
      cmd("Logs", "Errores syslog", "grep -i error /var/log/syslog 2>/dev/null"), cmd("Logs", "Errores messages", "grep -i error /var/log/messages 2>/dev/null"), cmd("Logs", "Auth Debian", "tail -100 /var/log/auth.log 2>/dev/null"), cmd("Logs", "Secure RHEL", "tail -100 /var/log/secure 2>/dev/null"),
      cmd("Journal", "Errores recientes", "journalctl -p err -n 100"), cmd("Journal", "Unidad específica", "journalctl -u servicio -n 200"), cmd("Journal", "En vivo", "journalctl -u servicio -f"),
      cmd("Kernel", "Mensajes kernel", "dmesg | tail -100"), cmd("Búsqueda", "Kaspersky en logs", "grep -R -i 'kaspersky\|kes\|klnagent\|kl' /var/log 2>/dev/null | head")
    ],
    lab: `# Recolección inicial de evidencia\ndate\nhostname -f\ncat /etc/os-release\nsystemctl --failed\njournalctl -p err -n 100\ndmesg | tail -50\nls -lah /var/log | head`,
    checklist: ["Identifico logs según distribución.", "Uso journalctl por servicio.", "Uso grep para filtrar errores.", "Recolecto fecha/hora y SO.", "Evito borrar logs sin respaldo."],
    quiz: quiz([
      ["¿Dónde suelen estar logs del sistema?", ["/var/log", "/games", "/home/random"], 0],
      ["¿Qué comando muestra errores recientes de systemd?", ["journalctl -p err", "chmod", "id"], 0],
      ["¿Qué comando revisa mensajes del kernel?", ["dmesg", "dpkg", "hostname"], 0],
      ["¿Qué es importante al escalar?", ["Evidencia completa", "Solo decir no funciona", "Eliminar logs"], 0]
    ])
  },
  "module-8": {
    objectives: ["Entender prerrequisitos de KSC Linux.", "Conocer flujo de instalación DEB/RPM.", "Relacionar DBMS, DNS, usuarios y postinstall.", "Construir checklist de preinstalación."],
    sections: [
      { title: "Rol de KSC Linux", body: "Kaspersky Security Center Linux es el componente de administración centralizada para gestionar dispositivos y aplicaciones Kaspersky en entornos corporativos." },
      { title: "Prerrequisitos", body: "Antes de instalar se debe validar DBMS, distribución Linux soportada, DNS disponible, paquete correcto según distribución y privilegios adecuados." },
      { title: "Usuarios y grupos", body: "La documentación oficial muestra creación de grupo kladmins y cuenta ksc; algunas versiones incorporan requisitos adicionales. Validar siempre según versión oficial." },
      { title: "Instalación y configuración", body: "Se instala desde paquete .deb o .rpm y luego se ejecuta el script postinstall.pl. Los valores concretos dependen de versión, DBMS, puertos y arquitectura." }
    ],
    commands: [
      cmd("Precheck", "Sistema operativo", "cat /etc/os-release"), cmd("Precheck", "Arquitectura", "uname -m"), cmd("Precheck", "DNS", "hostname -f && nslookup ksc.midominio.local"), cmd("Precheck", "Espacio", "df -h"),
      cmd("Usuarios", "Crear usuario ksc", "sudo adduser ksc"), cmd("Usuarios", "Crear grupo kladmins", "sudo groupadd kladmins"), cmd("Usuarios", "Agregar usuario al grupo", "sudo gpasswd -a ksc kladmins"), cmd("Usuarios", "Grupo primario", "sudo usermod -g kladmins ksc"),
      cmd("Instalación", "KSC DEB ejemplo", "sudo apt install ./ksc64_<version>_amd64.deb"), cmd("Instalación", "KSC RPM ejemplo", "sudo yum install ./ksc64-<version>.x86_64.rpm -y"), cmd("Postinstall", "Configuración inicial", "sudo /opt/kaspersky/ksc64/lib/bin/setup/postinstall.pl")
    ],
    lab: `# Checklist técnico previo KSC Linux\ncat /etc/os-release\nuname -a\nhostname -f\ndf -h\nfree -h\nip addr\nip route\nnslookup servidor-dns-o-ksc\n# Validar DBMS según diseño y versión oficial`,
    checklist: ["DBMS instalado/validado.", "Distribución soportada.", "DNS disponible.", "Paquete DEB/RPM correcto.", "Usuario/grupo requeridos validados.", "Espacio y recursos suficientes.", "postinstall documentado para la versión."],
    quiz: quiz([
      ["¿Qué debe instalarse antes de KSC Linux?", ["DBMS", "Un navegador de juegos", "Nada"], 0],
      ["¿Qué formatos de paquete usa KSC Linux según distribución?", ["DEB/RPM", "MSI/APK", "ZIP únicamente"], 0],
      ["¿Qué script se usa en configuración posterior?", ["postinstall.pl", "format.sh", "delete_all.sh"], 0],
      ["¿Qué servicio de red debe estar disponible como prerrequisito?", ["DNS", "Bluetooth", "Audio"], 0]
    ])
  },
  "module-9": {
    objectives: ["Comprender rol del Network Agent.", "Validar conectividad con Administration Server.", "Preparar endpoint Linux.", "Diagnosticar comunicación y servicios."],
    sections: [
      { title: "Rol", body: "Network Agent facilita la conexión entre el dispositivo administrado y Kaspersky Security Center. Debe instalarse en dispositivos que serán gestionados." },
      { title: "Métodos", body: "Puede instalarse mediante tareas remotas, paquetes locales, modo interactivo o silencioso según versión y estrategia de despliegue." },
      { title: "Preparación Linux", body: "Para instalación remota se suelen validar distribución, OpenSSH, sudo, Perl y conectividad. Evitar cambios inseguros sin autorización." },
      { title: "Troubleshooting", body: "Se revisa resolución DNS, conectividad a puertos del servidor, servicio del agente, procesos y logs." }
    ],
    commands: [
      cmd("Precheck", "Sistema", "cat /etc/os-release"), cmd("Precheck", "SSH activo", "systemctl status ssh || systemctl status sshd"), cmd("Precheck", "Perl", "perl -v"), cmd("Precheck", "Sudo", "sudo -V"),
      cmd("Red", "DNS KSC", "nslookup ksc.midominio.local"), cmd("Red", "Puerto KSC", "nc -vz ksc.midominio.local 14000"),
      cmd("Servicio", "Buscar agente", "systemctl list-units --type=service | grep -Ei 'klnagent|network agent|kl'"), cmd("Proceso", "Proceso agente", "ps aux | grep -i klnagent"), cmd("Logs", "Errores", "journalctl -p err -n 100")
    ],
    lab: `# Validación endpoint para Network Agent\ncat /etc/os-release\nhostname -f\nip route\nnslookup ksc.midominio.local\nnc -vz ksc.midominio.local 14000\nsystemctl list-units --type=service | grep -Ei 'klnagent|kl' || true\nps aux | grep -i klnagent || true`,
    checklist: ["Endpoint resuelve KSC por DNS.", "Conectividad a servidor validada.", "Servicio del agente identificado.", "Logs revisados.", "Versión y método de instalación validados."],
    quiz: quiz([
      ["¿Para qué sirve Network Agent?", ["Conectar dispositivo con KSC", "Reproducir audio", "Crear usuarios"], 0],
      ["¿Dónde debe instalarse Network Agent?", ["En dispositivos que serán gestionados", "Solo en impresoras", "No se instala"], 0],
      ["¿Qué protocolo se valida para instalación remota?", ["SSH", "HDMI", "USB audio"], 0],
      ["¿Qué comando prueba puerto?", ["nc -vz", "ls -la", "whoami"], 0]
    ])
  },
  "module-10": {
    objectives: ["Comprender administración local de KES for Linux.", "Usar kesl-control para tareas.", "Consultar estado y ejecutar acciones controladas.", "Relacionar CLI con soporte y KSC."],
    sections: [
      { title: "KES for Linux", body: "Kaspersky Endpoint Security for Linux protege sistemas Linux y puede administrarse localmente por comandos o centralmente con KSC según escenario." },
      { title: "kesl-control", body: "La herramienta kesl-control permite gestionar la aplicación, tareas, eventos, configuraciones y otras funciones según versión y licencia." },
      { title: "Tareas locales", body: "KES usa tareas locales para funciones como actualización, escaneo y componentes. Se pueden listar, consultar, iniciar, detener, pausar o reanudar." },
      { title: "Buenas prácticas", body: "Antes de modificar tareas, exportar/configurar o detener componentes, validar política central, impacto operativo y versión instalada." }
    ],
    commands: [
      cmd("Ayuda", "Ayuda general", "kesl-control --help"), cmd("Tareas", "Listar tareas", "kesl-control --get-task-list"), cmd("Tareas", "Listar en JSON", "kesl-control --get-task-list --json"), cmd("Tareas", "Estado tarea", "kesl-control --get-task-state <task ID/name>"),
      cmd("Tareas", "Iniciar tarea", "kesl-control --start-task <task ID/name> -W"), cmd("Tareas", "Iniciar con progreso", "kesl-control --start-task <task ID/name> --progress"), cmd("Tareas", "Detener tarea", "kesl-control --stop-task <task ID/name>"), cmd("Tareas", "Pausar tarea", "kesl-control --suspend-task <task ID/name>"), cmd("Tareas", "Reanudar tarea", "kesl-control --resume-task <task ID/name>"),
      cmd("Escaneo", "Escaneo personalizado", "kesl-control --scan-file /ruta --action Recommended")
    ],
    lab: `# Exploración local de KES for Linux\nkesl-control --help\nkesl-control --get-task-list\nkesl-control --get-task-list --json\n# Reemplaza ID/nombre por una tarea real del laboratorio\nkesl-control --get-task-state <task ID/name>\n# No detener tareas en producción sin autorización`,
    checklist: ["Identifico kesl-control.", "Listo tareas locales.", "Consulto estado de tareas.", "Sé iniciar/detener solo con autorización.", "Valido política central antes de cambios."],
    quiz: quiz([
      ["¿Qué herramienta administra KES localmente?", ["kesl-control", "linux-center", "iptables-control"], 0],
      ["¿Qué comando lista tareas?", ["kesl-control --get-task-list", "df -h", "mkdir"], 0],
      ["¿Qué opción muestra eventos al iniciar tarea?", ["-W", "--delete", "--format"], 0],
      ["¿Qué hacer antes de detener una tarea?", ["Validar impacto/autorización", "Siempre detener", "Borrar logs"], 0]
    ])
  },
  "module-11": {
    objectives: ["Aplicar checklists de diagnóstico.", "Clasificar fallas típicas.", "Recolectar evidencia técnica.", "Definir criterios de escalamiento."],
    sections: [
      { title: "Método", body: "Troubleshooting efectivo empieza por confirmar alcance, fecha/hora, cambio reciente, síntomas, impacto y componentes afectados." },
      { title: "Capas", body: "Analizar por capas: sistema, recursos, red/DNS, servicios, logs, paquetes, producto Kaspersky y administración centralizada." },
      { title: "Evidencia", body: "Registrar comandos ejecutados, salidas, logs, capturas, versiones y hora exacta. Evitar modificar sin respaldo." },
      { title: "Escalamiento", body: "Escalar cuando hay fallo reproducible, impacto productivo, error de instalación persistente, servicio que no inicia o posible bug según versión." }
    ],
    commands: [
      cmd("Sistema", "Resumen SO", "date; hostname -f; cat /etc/os-release; uname -a"), cmd("Recursos", "Salud", "uptime; free -h; df -h"), cmd("Red", "Red base", "ip addr; ip route; cat /etc/resolv.conf"), cmd("Servicios", "Fallidos", "systemctl --failed"), cmd("Logs", "Errores", "journalctl -p err -n 100"),
      cmd("Kaspersky", "Procesos", "ps aux | grep -Ei 'kaspersky|kes|klnagent|kl'"), cmd("Kaspersky", "Servicios", "systemctl list-units --type=service | grep -Ei 'kaspersky|kes|klnagent|kl'"), cmd("KES", "Tareas", "kesl-control --get-task-list"), cmd("Soporte", "Empaquetar logs ejemplo", "tar -czvf evidencia_soporte.tar.gz /var/log 2>/dev/null")
    ],
    lab: `# Checklist inicial de soporte\ndate\nhostname -f\ncat /etc/os-release\nuname -a\nuptime\nfree -h\ndf -h\nip addr\nip route\ncat /etc/resolv.conf\nsystemctl --failed\njournalctl -p err -n 100\nps aux | grep -Ei 'kaspersky|kes|klnagent|kl' || true`,
    checklist: ["Identifiqué alcance e impacto.", "Recolecté fecha/hora y versión SO.", "Validé recursos.", "Validé red/DNS.", "Revisé servicios y logs.", "Documenté evidencia antes de cambios."],
    quiz: quiz([
      ["¿Qué es lo primero en troubleshooting?", ["Entender síntoma, alcance e impacto", "Reiniciar todo", "Borrar logs"], 0],
      ["¿Qué comando lista servicios fallidos?", ["systemctl --failed", "mkdir", "whoami"], 0],
      ["¿Por qué registrar fecha/hora?", ["Correlacionar eventos", "No sirve", "Cambia permisos"], 0],
      ["¿Qué se debe evitar?", ["Modificar sin respaldo", "Recolectar evidencia", "Validar DNS"], 0]
    ])
  },
  "module-12": {
    objectives: ["Practicar escenarios integrados.", "Ejecutar validaciones seguras.", "Construir evidencias.", "Cerrar el curso con reto final."],
    sections: [
      { title: "Laboratorio 1: Precheck Linux", body: "Validar sistema operativo, hostname, red, DNS, recursos y permisos antes de instalar componentes." },
      { title: "Laboratorio 2: Paquetes y servicios", body: "Identificar familia de distribución, gestor de paquetes, servicios y logs." },
      { title: "Laboratorio 3: KSC Linux", body: "Simular checklist de prerrequisitos de KSC Linux sin instalar en producción." },
      { title: "Laboratorio 4: KES for Linux", body: "Consultar comandos kesl-control en un laboratorio con KES instalado y validar tareas locales." },
      { title: "Reto final", body: "Recibir un síntoma, ejecutar checklist, recolectar evidencia y proponer siguiente acción." }
    ],
    commands: [
      cmd("Lab 1", "Precheck completo", "date; hostname -f; cat /etc/os-release; uname -a; df -h; free -h"),
      cmd("Lab 2", "Gestor de paquetes", "which apt || which dnf || which yum || which rpm || which dpkg"),
      cmd("Lab 3", "KSC precheck", "nslookup ksc.midominio.local; nc -vz ksc.midominio.local 14000"),
      cmd("Lab 4", "KES tareas", "kesl-control --get-task-list"),
      cmd("Reto", "Evidencia soporte", "journalctl -p err -n 100 > errores_recientes.txt")
    ],
    lab: `# Reto final integrado\n# 1. Identificación\ndate\nhostname -f\ncat /etc/os-release\nuname -a\n\n# 2. Recursos\nuptime\nfree -h\ndf -h\n\n# 3. Red\nip addr\nip route\ncat /etc/resolv.conf\nnslookup ksc.midominio.local\n\n# 4. Servicios y logs\nsystemctl --failed\njournalctl -p err -n 100\n\n# 5. Kaspersky/KES si aplica\nsystemctl list-units --type=service | grep -Ei 'kaspersky|kes|klnagent|kl' || true\nkesl-control --get-task-list 2>/dev/null || true`,
    checklist: ["Completé precheck Linux.", "Identifiqué familia de paquetes.", "Validé red/DNS.", "Revisé servicios y logs.", "Ejecuté comandos KES solo si aplica.", "Construí evidencia de soporte."],
    quiz: quiz([
      ["¿Cuál es el objetivo del reto final?", ["Integrar diagnóstico y evidencia", "Crear malware", "Cambiar colores"], 0],
      ["¿Qué comando ayuda con logs de error?", ["journalctl -p err", "touch", "cd"], 0],
      ["¿Cuándo ejecutar kesl-control?", ["Cuando KES aplica/está instalado", "Siempre en cualquier equipo", "Nunca"], 0],
      ["¿Qué debe contener una evidencia?", ["Comandos, salidas, fechas y contexto", "Solo una frase", "Nada"], 0]
    ])
  }
};

/* ============================================================
   CONTENIDO MÓDULO 0, COMANDOS DESTACADOS Y GLOSARIO
============================================================ */
const introQuiz = quiz([
  ["¿Cuál es el objetivo principal de este curso?", ["Aprender Linux de escritorio", "Aprender Linux aplicado a implementación y soporte de Kaspersky", "Aprender programación web"], 1],
  ["¿Qué herramienta se usará para administrar localmente KES for Linux?", ["kesl-control", "iptables-control", "linux-center"], 0],
  ["¿Qué tendrá cada módulo?", ["Solo lectura", "Conceptos, comandos, laboratorios, checklist y quiz", "Únicamente videos"], 1]
]);

const featuredCommands = [
  cmd("Identificación", "Distribución Linux", "cat /etc/os-release"), cmd("Identificación", "Kernel y arquitectura", "uname -a"), cmd("Identificación", "FQDN del servidor", "hostname -f"), cmd("Identificación", "Usuario actual", "whoami"), cmd("Identificación", "UID/GID/grupos", "id"),
  cmd("Recursos", "Espacio disco", "df -h"), cmd("Recursos", "Memoria", "free -h"), cmd("Recursos", "Carga", "uptime"), cmd("Recursos", "Procesos", "top"),
  cmd("Red", "Interfaces", "ip addr"), cmd("Red", "Rutas", "ip route"), cmd("Red", "DNS", "nslookup servidor"), cmd("Red", "Puertos locales", "ss -tulpen"), cmd("Red", "Prueba TCP", "nc -vz servidor puerto"),
  cmd("Servicios", "Estado", "systemctl status servicio"), cmd("Servicios", "Reiniciar", "systemctl restart servicio"), cmd("Servicios", "Logs en vivo", "journalctl -u servicio -f"),
  cmd("KES", "Listar tareas", "kesl-control --get-task-list"), cmd("KES", "Estado tarea", "kesl-control --get-task-state <task ID/name>"), cmd("KES", "Iniciar tarea", "kesl-control --start-task <task ID/name>"), cmd("KES", "Detener tarea", "kesl-control --stop-task <task ID/name>")
];

const glossary = [
  ["Linux", "Sistema operativo tipo Unix usado en servidores, endpoints y plataformas empresariales."],
  ["Distribución", "Variante de Linux que incluye kernel, herramientas, gestor de paquetes y componentes específicos."],
  ["Shell", "Interfaz de línea de comandos para interactuar con el sistema operativo."],
  ["Root", "Usuario con privilegios administrativos máximos."],
  ["sudo", "Mecanismo para ejecutar comandos con privilegios elevados según políticas del sistema."],
  ["Paquete DEB", "Formato usado por distribuciones basadas en Debian/Ubuntu."],
  ["Paquete RPM", "Formato usado por distribuciones basadas en Red Hat y similares."],
  ["systemd", "Sistema de inicialización y administración de servicios."],
  ["KSC Linux", "Kaspersky Security Center ejecutado sobre Linux para administración centralizada."],
  ["KES for Linux", "Kaspersky Endpoint Security for Linux."],
  ["Network Agent", "Componente que permite la comunicación del endpoint con Kaspersky Security Center."],
  ["kesl-control", "Herramienta de línea de comandos para administrar localmente KES for Linux."]
].map(([term, definition]) => ({ term, definition }));

/* ============================================================
   INICIALIZACIÓN Y EVENTOS
============================================================ */
document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  loadProgress();
  applyProgressToModules();
  bindEvents();
  renderSidebar();
  renderMobileMenu();
  renderDashboard();
  updateGlobalProgress();
  refreshPrism();

// Mostrar ayuda automáticamente solo en el primer acceso
  showHelpModalOnFirstVisit();

}

function bindEvents() {
  on("helpBtn", "click", openHelpModal);
  on("dashboardBtn", "click", renderDashboard);
  on("resetProgressBtn", "click", openResetProgressModal);
  on("confirmResetProgressBtn", "click", resetProgress);
  on("mobileDashboardBtn", "click", () => { closeMobileMenu(); renderDashboard(); });
  on("mobileResetProgressBtn", "click", () => { closeMobileMenu(); openResetProgressModal(); });
  on("moduleSearch", "input", e => filterModules(e.target.value));
  on("mobileModuleSearch", "input", e => filterModules(e.target.value));

  document.addEventListener("click", e => {
    const open = e.target.closest("[data-open-module]");
    const copy = e.target.closest("[data-copy-command]");
    const scroll = e.target.closest("[data-scroll-target]");
    const quizOpt = e.target.closest("[data-quiz-option]");
    const quizSubmit = e.target.closest("[data-submit-quiz]");
    const quizReset = e.target.closest("[data-reset-quiz]");

    if (open) openModule(open.dataset.openModule);
    if (copy) copyCommand(decodeURIComponent(copy.dataset.copyCommand), copy);
    if (scroll) scrollToElement(scroll.dataset.scrollTarget);
    if (quizOpt) selectQuizOption(quizOpt.dataset.moduleId, quizOpt.dataset.questionId, quizOpt.dataset.optionId);
    if (quizSubmit) handleQuizSubmit(quizSubmit.dataset.moduleId);
    if (quizReset) resetQuiz(quizReset.dataset.moduleId);
  });
}

/* ============================================================
   DASHBOARD
============================================================ */
function renderDashboard() {
  currentModuleId = null;
  courseProgress.activeModule = null;
  saveProgress();
  setPageTitle("Dashboard");
  setActiveNav(null);

  const completed = getCompletedModulesCount();
  const pct = calculateGlobalProgress();
  const main = $("mainContent");
  if (!main) return;

  main.innerHTML = `
    <section class="hero-section">
      <span class="badge rounded-pill text-bg-primary mb-3"><i class="bi bi-shield-check me-1"></i>Curso interactivo completo</span>
      <h1>Linux operativo para Kaspersky XDR Optimum</h1>
      <p>Curso interactivo para implementación, administración y soporte de Linux en escenarios Kaspersky Security Center Linux y Kaspersky Endpoint Security for Linux.</p>
      <div class="d-flex flex-wrap justify-content-center gap-2">
        <button class="btn btn-custom-primary" data-open-module="module-0"><i class="bi bi-play-fill me-1"></i>Comenzar curso</button>
        <button class="btn btn-outline-primary" data-scroll-target="commandsSection"><i class="bi bi-terminal me-1"></i>Ver comandos destacados</button>
        <button class="btn btn-outline-secondary" onclick="openHelpModal()"><i class="bi bi-question-circle me-1"></i>Abrir ayuda</button>
      </div>
    </section>
    <section class="container-fluid mb-4">
      <div class="row g-3 metrics-row">
        ${metric("13", "Módulos", "bi-layers")}
        ${metric("13", "Disponibles", "bi-unlock")}
        ${metric("0", "Planificados", "bi-calendar-plus")}
        ${metric(`${pct}%`, "Progreso global", "bi-graph-up")}
      </div>
    </section>
    <section class="container-fluid mb-4">
      <div class="card border-0 shadow-sm"><div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-2"><div><h5 class="mb-0">Avance del curso</h5><small class="text-muted">${completed} de ${modules.length} módulos completados</small></div><strong>${pct}%</strong></div>
        <div class="progress" style="height:10px"><div class="progress-bar" style="width:${pct}%"></div></div>
      </div></div>
    </section>
    <section class="container-fluid mb-5" id="learningPathSection">
      <h2 class="h4 mb-1">Ruta de aprendizaje</h2>
      <p class="text-muted">Todos los módulos están disponibles. Completa el quiz de cada módulo para marcar avance.</p>
      <div id="moduleCardsContainer">${renderModuleCards(modules)}</div>
    </section>
    <section class="container-fluid mb-5" id="commandsSection">
      <h2 class="h4 mb-1">Comandos destacados que verás en el curso</h2>
      <p class="text-muted">Vista previa de comandos Linux y Kaspersky usados en los módulos.</p>
      <div class="danger-box"><strong>Importante:</strong> este curso no ejecuta comandos reales. Los comandos deben ejecutarse solo en sistemas autorizados.</div>
      ${renderCommandsGrouped(featuredCommands)}
    </section>
    <section class="container-fluid mb-5" id="glossarySection">
      <h2 class="h4 mb-1">Glosario rápido</h2>
      <p class="text-muted">Conceptos esenciales para iniciar el curso.</p>
      ${renderGlossary()}
    </section>
    <section class="container-fluid mb-4"><div class="warning-box"><strong>Advertencia técnica:</strong> comandos, rutas, servicios y parámetros pueden variar según versión, distribución y arquitectura. Validar con documentación oficial correspondiente.</div></section>
  `;
  updateGlobalProgress();
  refreshPrism();
}

function metric(value, label, icon) {
  return `<div class="col-6 col-lg-3"><div class="metric-card"><i class="bi ${icon} fs-3 text-primary mb-2"></i><div class="value">${value}</div><div class="label">${label}</div></div></div>`;
}

function renderModuleCards(list) {
  if (!list.length) return `<div class="empty-state"><i class="bi bi-search"></i><h5>No se encontraron módulos</h5><p>Prueba con otro término.</p></div>`;
  return `<div class="module-grid">${list.map(renderModuleCard).join("")}</div>`;
}

function renderModuleCard(module) {
  const status = getModuleStatus(module);
  const pct = getModuleProgress(module.id);
  return `
    <article class="module-card ${status}">
      <div class="module-header"><div class="module-number">${module.number}</div><span class="status-badge ${status}">${statusLabel(status)}</span></div>
      <div class="mb-2"><i class="bi ${module.icon} fs-3 text-primary"></i></div>
      <h5>${esc(module.title)}</h5><p>${esc(module.description)}</p>
      <div class="tags"><span class="tag">${esc(module.level)}</span>${module.tags.map(t => `<span class="tag">${esc(t)}</span>`).join("")}</div>
      <div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div>
      <button class="btn btn-custom-primary mt-auto" data-open-module="${module.id}">${status === "completed" ? "Revisar" : "Abrir"}</button>
    </article>`;
}

/* ============================================================
   SIDEBAR / MOBILE
============================================================ */
function renderSidebar() {
  const nav = $("sidebarNav");
  if (!nav) return;
  nav.innerHTML = `<a href="#" class="nav-module" data-dashboard-link><i class="bi bi-house-door me-2"></i>Dashboard</a>${modules.map(m => navItem(m)).join("")}`;
  nav.querySelector("[data-dashboard-link]")?.addEventListener("click", e => { e.preventDefault(); renderDashboard(); });
}

function renderMobileMenu() {
  const nav = $("mobileNav");
  if (!nav) return;
  nav.innerHTML = `<a href="#" class="nav-module text-dark rounded mb-1" data-mobile-dashboard-link><i class="bi bi-house-door me-2"></i>Dashboard</a>${modules.map(m => navItem(m, true)).join("")}`;
  nav.querySelector("[data-mobile-dashboard-link]")?.addEventListener("click", e => { e.preventDefault(); closeMobileMenu(); renderDashboard(); });
}

function navItem(m, mobile = false) {
  const status = getModuleStatus(m);
  const icon = status === "completed" ? "bi-check-circle-fill text-success" : "bi-circle text-primary";
  return `<a href="#" class="nav-module ${mobile ? "text-dark rounded mb-1" : ""}" data-nav-module="${m.id}" data-open-module="${m.id}"><span><i class="bi ${m.icon} me-2"></i>M${m.number}: ${esc(m.title)}</span><i class="bi ${icon} ms-2"></i></a>`;
}

function setActiveNav(id) { document.querySelectorAll("[data-nav-module]").forEach(a => a.classList.toggle("active", id && a.dataset.navModule === id)); }
function closeMobileMenu() { const el = $("mobileMenu"); if (el && window.bootstrap) bootstrap.Offcanvas.getInstance(el)?.hide(); }

/* ============================================================
   RENDER DE MÓDULOS
============================================================ */
function openModule(id) {
  const module = modules.find(m => m.id === id);
  if (!module) return showToast("No se encontró el módulo solicitado.", "error");
  currentModuleId = id;
  courseProgress.activeModule = id;
  saveProgress();
  setPageTitle(`Módulo ${module.number}: ${module.title}`);
  setActiveNav(id);
  closeMobileMenu();
  if (id === "module-0") renderIntroModule(); else renderStandardModule(module);
  scrollToTop();
  refreshPrism();
}

function renderIntroModule() {
  const main = $("mainContent"); if (!main) return;
  main.innerHTML = `
    <section class="container-fluid">
      ${backButton()}
      <div class="card border-0 shadow-sm mb-4"><div class="card-body p-4"><span class="badge text-bg-primary mb-3">Módulo 0</span><h1 class="h3 mb-3">Introducción al curso</h1><p class="lead mb-0">Este curso fue diseñado para equipos de implementación y soporte que necesitan operar Linux en escenarios reales de Kaspersky XDR Optimum, Kaspersky Security Center Linux y Kaspersky Endpoint Security for Linux.</p></div></div>
      <div class="info-box"><h2 class="h5">Bienvenida</h2><p class="mb-0">El objetivo no es formar administradores Linux genéricos, sino entregar habilidades prácticas para instalar, validar, administrar y diagnosticar componentes Kaspersky sobre Linux.</p></div>
      <section class="mb-5"><h2 class="h4 mb-3">¿Qué aprenderás?</h2><div class="row g-3">${[
        "Comprender fundamentos de Linux necesarios para soporte Kaspersky.","Navegar el sistema de archivos.","Administrar usuarios, grupos y permisos.","Instalar paquetes DEB/RPM.","Gestionar servicios con systemd.","Validar red, DNS y puertos.","Revisar logs y eventos.","Ejecutar diagnósticos.","Comprender KSC Linux, Network Agent y KES for Linux.","Usar kesl-control en módulos posteriores."
      ].map(learningItem).join("")}</div></section>
      <section class="mb-5"><h2 class="h4 mb-3">Audiencia</h2><div class="row g-3">${[
        ["Implementadores", "Preparan ambientes, validan prerrequisitos e instalan componentes.", "bi-hammer"], ["Soporte N1/N2", "Revisan servicios, conectividad, logs y errores frecuentes.", "bi-headset"], ["Soporte N3", "Analizan casos complejos, evidencias y rendimiento.", "bi-tools"], ["Preventa técnica", "Explican arquitectura, prerrequisitos y dependencias.", "bi-person-workspace"], ["Consultores", "Acompañan despliegues, hardening y documentación.", "bi-shield-lock"]
      ].map(audienceCard).join("")}</div></section>
      <section class="mb-5"><h2 class="h4 mb-3">Metodología</h2><div class="card border-0 shadow-sm"><div class="card-body"><p>Cada módulo combina conceptos, comandos, ejemplos, casos Kaspersky, laboratorio, checklist, quiz y resumen.</p><div class="row g-3">${["Conceptos","Comandos","Ejemplos","Casos Kaspersky","Laboratorio","Checklist","Quiz","Resumen"].map(x => conceptCard(x, "Contenido aplicado y práctico." )).join("")}</div></div></div></section>
      <section class="mb-5"><h2 class="h4 mb-3">Recomendaciones</h2><ul class="list-group shadow-sm">${["Tener una máquina Linux de laboratorio.","No ejecutar comandos destructivos en producción.","Documentar cambios.","Validar versión oficial instalada.","Trabajar con permisos adecuados.","Usar snapshots o respaldos.","Guardar evidencia para soporte."].map(checkItem).join("")}</ul></section>
      <div class="warning-box"><strong>Advertencia técnica:</strong> rutas, servicios y parámetros pueden variar por versión, distribución y arquitectura.</div>
      <div class="danger-box"><strong>Seguridad:</strong> este curso no ejecuta comandos reales.</div>
      <section class="mb-5"><h2 class="h4 mb-3">Mini quiz introductorio</h2>${renderQuiz("module-0", introQuiz)}</section>
    </section>`;
  refreshPrism();
}

function renderStandardModule(module) {
  const data = moduleContent[module.id];
  const main = $("mainContent"); if (!main || !data) return;
  main.innerHTML = `
    <section class="container-fluid">
      ${backButton()}
      <div class="card border-0 shadow-sm mb-4"><div class="card-body p-4"><div class="d-flex flex-wrap align-items-center gap-2 mb-3"><span class="badge text-bg-primary">Módulo ${module.number}</span><span class="badge text-bg-light text-dark">${esc(module.level)}</span>${module.tags.map(t => `<span class="badge text-bg-light text-dark">${esc(t)}</span>`).join("")}</div><h1 class="h3 mb-3">${esc(module.title)}</h1><p class="lead mb-0">${esc(module.description)}</p></div></div>
      <div class="danger-box"><strong>Seguridad operativa:</strong> los comandos son educativos. Ejecuta únicamente en laboratorios o sistemas autorizados.</div>
      <section class="mb-5"><h2 class="h4 mb-3">Objetivos del módulo</h2><div class="row g-3">${data.objectives.map(learningItem).join("")}</div></section>
      ${data.sections.map((s, idx) => `<section class="mb-5"><h2 class="h4 mb-3">${idx + 1}. ${esc(s.title)}</h2><div class="info-box"><p class="mb-0">${esc(s.body)}</p></div></section>`).join("")}
      <section class="mb-5"><h2 class="h4 mb-3">Comandos prácticos</h2><p class="text-muted">Comandos de referencia para laboratorio y soporte. Validar según versión, distribución y autorización.</p>${renderCommandsGrouped(data.commands)}</section>
      <section class="mb-5"><h2 class="h4 mb-3">Laboratorio guiado</h2><div class="card border-0 shadow-sm"><div class="card-body"><p>Ejecuta este laboratorio en un ambiente autorizado.</p>${codeBlock(data.lab)}<div class="warning-box mb-0"><strong>Nota:</strong> no ejecutes cambios destructivos en producción sin aprobación.</div></div></div></section>
      <section class="mb-5"><h2 class="h4 mb-3">Checklist del módulo</h2><ul class="list-group shadow-sm">${data.checklist.map(checkItem).join("")}</ul></section>
      <section class="mb-5"><h2 class="h4 mb-3">Quiz del módulo</h2>${renderQuiz(module.id, data.quiz)}</section>
    </section>`;
  refreshPrism();
}

/* ============================================================
   COMPONENTES
============================================================ */
function backButton() { return `<button class="btn btn-outline-secondary btn-sm mb-3" type="button" onclick="renderDashboard()"><i class="bi bi-arrow-left me-1"></i>Volver al dashboard</button>`; }
function learningItem(text) { return `<div class="col-12 col-md-6"><div class="card border-0 shadow-sm h-100"><div class="card-body d-flex gap-3"><i class="bi bi-check-circle-fill text-success fs-4"></i><p class="mb-0">${esc(text)}</p></div></div></div>`; }
function audienceCard([title, desc, icon]) { return `<div class="col-12 col-sm-6 col-xl"><article class="audience-card h-100"><i class="bi ${icon}"></i><h5>${esc(title)}</h5><p class="text-muted small mb-0">${esc(desc)}</p></article></div>`; }
function conceptCard(title, desc) { return `<div class="col-12 col-md-6 col-xl-3"><article class="p-3 bg-light rounded h-100"><strong class="d-block mb-1">${esc(title)}</strong><small class="text-muted">${esc(desc)}</small></article></div>`; }
function checkItem(text) { return `<li class="list-group-item d-flex align-items-start gap-2"><i class="bi bi-check2-circle text-success mt-1"></i><span>${esc(text)}</span></li>`; }
function codeBlock(text) { return `<div class="code-block"><pre><code class="language-bash">${esc(text)}</code></pre></div>`; }

function renderCommandsGrouped(commands) {
  const grouped = groupBy(commands, "category");
  return Object.keys(grouped).map(cat => `<div class="mb-4"><h3 class="h5 mb-3"><i class="bi bi-terminal me-2"></i>${esc(cat)}</h3><div class="row g-3">${grouped[cat].map(renderCommandCard).join("")}</div></div>`).join("");
}
function renderCommandCard(c) {
  return `<div class="col-12 col-lg-6"><article class="command-card h-100"><div class="command-meta"><span class="category">${esc(c.category)}</span><button class="copy-btn" type="button" data-copy-command="${encodeURIComponent(c.command)}"><i class="bi bi-clipboard me-1"></i>Copiar</button></div><p class="text-muted small mb-3">${esc(c.description)}</p>${codeBlock(c.command)}</article></div>`;
}
function renderGlossary() { return `<div class="glossary-grid">${glossary.map(g => `<article class="glossary-card"><h6>${esc(g.term)}</h6><p>${esc(g.definition)}</p></article>`).join("")}</div>`; }

/* ============================================================
   QUIZZES GENÉRICOS
============================================================ */
let quizAnswers = {};
function renderQuiz(moduleId, questions) {
  const result = courseProgress.quizResults[moduleId];
  if (result?.passed) return `<div class="quiz-card"><div class="alert alert-success mb-3"><h5 class="alert-heading"><i class="bi bi-check-circle-fill me-2"></i>Quiz aprobado</h5><p class="mb-0">Resultado guardado: ${result.score} de ${questions.length}. Módulo marcado como completado.</p></div><button class="btn btn-outline-primary" data-reset-quiz data-module-id="${moduleId}">Reintentar quiz</button></div>`;
  return `<div class="quiz-card"><p class="text-muted">Apruebas con mínimo ${passingScore(questions)} de ${questions.length} respuestas correctas.</p>${questions.map((q, idx) => `<div class="mb-4" data-quiz-question="${moduleId}-${q.id}"><h3 class="h6 mb-3">${idx + 1}. ${esc(q.question)}</h3>${q.options.map(o => `<button type="button" class="quiz-option w-100 text-start" data-quiz-option data-module-id="${moduleId}" data-question-id="${q.id}" data-option-id="${o.id}"><strong>${o.id}.</strong> ${esc(o.text)}</button>`).join("")}</div>`).join("")}<div id="quizFeedback-${moduleId}" class="mb-3"></div><div class="d-flex flex-wrap gap-2"><button class="btn btn-custom-primary" data-submit-quiz data-module-id="${moduleId}">Enviar respuestas</button><button class="btn btn-outline-secondary" data-reset-quiz data-module-id="${moduleId}">Reiniciar quiz</button></div></div>`;
}
function selectQuizOption(moduleId, qid, oid) {
  quizAnswers[moduleId] = quizAnswers[moduleId] || {};
  quizAnswers[moduleId][qid] = oid;
  const cont = document.querySelector(`[data-quiz-question="${moduleId}-${qid}"]`);
  if (!cont) return;
  cont.querySelectorAll("[data-quiz-option]").forEach(b => b.classList.remove("selected"));
  cont.querySelector(`[data-option-id="${oid}"]`)?.classList.add("selected");
}
function handleQuizSubmit(moduleId) {
  const questions = moduleId === "module-0" ? introQuiz : moduleContent[moduleId]?.quiz;
  if (!questions) return;
  const answers = quizAnswers[moduleId] || {};
  if (Object.keys(answers).length < questions.length) return showToast("Responde todas las preguntas antes de enviar.", "error");
  let score = 0;
  questions.forEach(q => {
    const ans = answers[q.id];
    const cont = document.querySelector(`[data-quiz-question="${moduleId}-${q.id}"]`);
    cont?.querySelectorAll("[data-quiz-option]").forEach(btn => {
      const oid = btn.dataset.optionId;
      btn.classList.remove("correct", "incorrect");
      if (oid === q.correct) btn.classList.add("correct");
      if (oid === ans && oid !== q.correct) btn.classList.add("incorrect");
    });
    if (ans === q.correct) score++;
  });
  const passed = score >= passingScore(questions);
  const feedback = $(`quizFeedback-${moduleId}`);
  if (feedback) feedback.innerHTML = `<div class="alert ${passed ? "alert-success" : "alert-warning"}"><strong>${passed ? "¡Aprobado!" : "Resultado insuficiente."}</strong> Obtuviste ${score} de ${questions.length}. ${passed ? "El módulo fue marcado como completado." : "Puedes revisar y reintentar."}</div>`;
  courseProgress.quizResults[moduleId] = { score, passed, completedAt: new Date().toISOString() };
  if (passed) { markModuleCompleted(moduleId); showToast("Módulo completado correctamente.", "success"); }
  else { setModuleProgress(moduleId, 50); showToast("Quiz enviado. Puedes reintentarlo.", "info"); }
  saveProgress(); applyProgressToModules(); renderSidebar(); renderMobileMenu(); updateGlobalProgress();
}
function resetQuiz(moduleId) {
  quizAnswers[moduleId] = {};
  delete courseProgress.quizResults[moduleId];
  courseProgress.completedModules = courseProgress.completedModules.filter(id => id !== moduleId);
  setModuleProgress(moduleId, 0); saveProgress(); applyProgressToModules(); renderSidebar(); renderMobileMenu(); updateGlobalProgress(); openModule(moduleId); showToast("Quiz reiniciado.", "info");
}
function passingScore(qs) { return qs.length <= 3 ? 2 : Math.ceil(qs.length * 0.75); }

/* ============================================================
   PROGRESO
============================================================ */
function loadProgress() { try { const s = localStorage.getItem(STORAGE_KEY); if (s) courseProgress = { ...courseProgress, ...JSON.parse(s) }; } catch (e) { console.warn("No se pudo cargar progreso", e); } }
function saveProgress() { try { courseProgress.lastUpdated = new Date().toISOString(); localStorage.setItem(STORAGE_KEY, JSON.stringify(courseProgress)); } catch (e) { console.warn("No se pudo guardar progreso", e); } }
function resetProgress() { localStorage.removeItem(STORAGE_KEY); courseProgress = { completedModules: [], moduleProgress: {}, quizResults: {}, activeModule: null, lastUpdated: null }; quizAnswers = {}; const modal = $("resetProgressModal"); if (modal && window.bootstrap) bootstrap.Modal.getInstance(modal)?.hide(); applyProgressToModules(); renderSidebar(); renderMobileMenu(); renderDashboard(); updateGlobalProgress(); showToast("Progreso reiniciado correctamente.", "success"); }
function markModuleCompleted(id) { if (!courseProgress.completedModules.includes(id)) courseProgress.completedModules.push(id); setModuleProgress(id, 100); }
function setModuleProgress(id, val) { courseProgress.moduleProgress[id] = Math.max(0, Math.min(100, val)); }
function getModuleProgress(id) { return courseProgress.moduleProgress[id] || 0; }
function getCompletedModulesCount() { return courseProgress.completedModules.length; }
function calculateGlobalProgress() { return Math.round((getCompletedModulesCount() / modules.length) * 100); }
function applyProgressToModules() { modules.forEach(m => { m.progress = getModuleProgress(m.id); m.status = courseProgress.completedModules.includes(m.id) ? "completed" : "available"; if (m.status === "completed") m.progress = 100; }); }
function getModuleStatus(m) { return courseProgress.completedModules.includes(m.id) ? "completed" : "available"; }
function statusLabel(s) { return s === "completed" ? "Completado" : "Disponible"; }
function updateGlobalProgress() { const pct = calculateGlobalProgress(); setWidth("sidebarProgress", pct); setWidth("mobileSidebarProgress", pct); setText("progressPercent", `${pct}%`); setText("mobileProgressPercent", `${pct}%`); }
function setWidth(id, pct) { const el = $(id); if (el) { el.style.width = `${pct}%`; el.setAttribute("aria-valuenow", pct); } }
function setText(id, text) { const el = $(id); if (el) el.textContent = text; }

/* ============================================================
   FILTROS, MODALES, COPIAR, TOASTS
============================================================ */
function filterModules(query) {
  const q = norm(query || "");
  const list = modules.filter(m => norm([m.title, m.description, m.level, ...m.tags].join(" ")).includes(q));
  const cont = $("moduleCardsContainer"); if (cont) cont.innerHTML = renderModuleCards(list);
  if ($("moduleSearch") && $("moduleSearch").value !== query) $("moduleSearch").value = query;
  if ($("mobileModuleSearch") && $("mobileModuleSearch").value !== query) $("mobileModuleSearch").value = query;
}
function openHelpModal() { const el = $("helpModal"); if (el && window.bootstrap) new bootstrap.Modal(el).show(); }
function openResetProgressModal() { const el = $("resetProgressModal"); if (el && window.bootstrap) new bootstrap.Modal(el).show(); else if (confirm("¿Reiniciar progreso?")) resetProgress(); }
function showHelpModalOnFirstVisit() {
  const alreadySeen = localStorage.getItem(HELP_MODAL_SEEN_KEY) === "true";

  if (alreadySeen) return;

  const helpModalElement = document.getElementById("helpModal");

  if (!helpModalElement || typeof bootstrap === "undefined") {
    return;
  }

  // Marcar como visto solo cuando realmente se muestre el modal
  helpModalElement.addEventListener(
    "shown.bs.modal",
    () => {
      localStorage.setItem(HELP_MODAL_SEEN_KEY, "true");
    },
    { once: true }
  );

  // Pequeño delay para asegurar que dashboard, Bootstrap y DOM estén listos
  setTimeout(() => {
    const modal = new bootstrap.Modal(helpModalElement);
    modal.show();
  }, 400);
}
async function copyCommand(command, button) { try { if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(command); else fallbackCopy(command); if (button) { const old = button.innerHTML; button.classList.add("copied"); button.innerHTML = `<i class="bi bi-check2 me-1"></i>Copiado`; setTimeout(() => { button.classList.remove("copied"); button.innerHTML = old; }, 1500); } showToast("Comando copiado.", "success"); } catch { showToast("No se pudo copiar.", "error"); } }
function fallbackCopy(text) { const t = document.createElement("textarea"); t.value = text; t.style.position = "fixed"; t.style.left = "-9999px"; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); }
function showToast(message, type = "info") { const c = $("toastContainer"); if (!c) return; const id = `toast-${Date.now()}`; const div = document.createElement("div"); div.id = id; div.className = `toast ${type}`; div.setAttribute("role", "status"); div.innerHTML = `<div class="d-flex align-items-start gap-2"><i class="bi ${toastIcon(type)} fs-5"></i><div class="flex-grow-1">${esc(message)}</div><button type="button" class="btn-close ms-2" onclick="this.closest('.toast').remove()" aria-label="Cerrar"></button></div>`; c.appendChild(div); setTimeout(() => $(id)?.remove(), 4200); }
function toastIcon(t) { return ({ success: "bi-check-circle-fill text-success", error: "bi-x-circle-fill text-danger", warning: "bi-exclamation-triangle-fill text-warning", info: "bi-info-circle-fill text-primary" }[t] || "bi-info-circle-fill text-primary"); }

/* ============================================================
   UTILIDADES
============================================================ */
function refreshPrism() { if (window.Prism) setTimeout(() => Prism.highlightAll(), 0); }
function setPageTitle(title) { setText("pageTitle", title); document.title = `${title} | Linux para Kaspersky XDR Optimum`; }
function scrollToTop() { window.scrollTo({ top: 0, behavior: "smooth" }); }
function scrollToElement(id) { $(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }
function groupBy(arr, key) { return arr.reduce((a, i) => ((a[i[key]] = a[i[key]] || []).push(i), a), {}); }
function norm(v) { return String(v).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
function esc(v) { return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }
function $(id) { return document.getElementById(id); }
function on(id, event, fn) { const el = $(id); if (el) el.addEventListener(event, fn); }
function cmd(category, description, command) { return { category, description, command }; }
function quiz(items) { return items.map((item, i) => ({ id: `q${i + 1}`, question: item[0], options: item[1].map((text, idx) => ({ id: String.fromCharCode(65 + idx), text })), correct: String.fromCharCode(65 + item[2]) })); }

/* ============================================================
   API GLOBAL PARA BOTONES INLINE
============================================================ */
window.renderDashboard = renderDashboard;
window.openHelpModal = openHelpModal;
window.openModule = openModule;
window.resetProgress = resetProgress;

/* ============================================================
   FIN app.js COMPLETO
============================================================ */
