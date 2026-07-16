# Presentación Interactiva de Diapositivas

Sistema de presentación de slides con navegación interactiva, temas claro/oscuro, y panel de referencia rápida.

## Estructura del Proyecto

```
project/
├── index.html      # Estructura HTML de las diapositivas
├── styles.css      # Estilos CSS con variables customizables
├── script.js       # Lógica de navegación y funcionalidades
└── README.md       # Este archivo
```

---

## Configuración de Diapositivas

### Agregar una Nueva Diapositiva

```html
<section class="slide" id="slide-X" data-slide="X">
    <div class="slide-inner">
        <!-- Contenido de la diapositiva -->
    </div>
    <div class="slide-number-badge">X</div>
</section>
```

### Navegación del Sidebar

Agregar items de navegación correspondientes:

```html
<a class="nav-item" data-slide="X">
    <span class="nav-number">X</span>
    <span>Título de la Diapositiva</span>
</a>
```

### Clase de Fondo Especial

| Clase | Uso |
|-------|-----|
| `title-slide` | Diapositiva de portada con gradiente oscuro e iconos flotantes |
| `closing-slide` | Diapositiva de cierre con gradiente especial |

---

## Variables CSS Principales

```css
:root {
    /* Colores Primarios */
    --primary: #4f46e5;        /* Azul indigo - color principal */
    --primary-dark: #4338ca;    /* Variante oscura */
    --primary-light: #818cf8;   /* Variante clara */
    --primary-glow: rgba(79, 70, 229, 0.4);
    
    /* Colores Semánticos */
    --success: #059669;         /* Verde - éxito */
    --warning: #d97706;         /* Naranja - advertencia */
    --danger: #dc2626;          /* Rojo - peligro */
    
    /* Fondos */
    --bg-primary: var(--white);
    --bg-secondary: var(--gray-100);
    --bg-tertiary: var(--gray-50);
    
    /* Texto */
    --text-primary: var(--gray-900);
    --text-secondary: var(--gray-700);
    --text-muted: var(--gray-500);
    
    /* Bordes y Sombras */
    --border-color: var(--gray-200);
    --shadow-sm, --shadow, --shadow-md, --shadow-lg, --shadow-xl
}
```

### Tema Oscuro

El tema oscuro se activa con el atributo `data-theme="dark"` en `<html>`:

```css
[data-theme="dark"] {
    --bg-primary: #0f172a;
    --text-primary: #f1f5f9;
    /* ... otras variables */
}
```

---

## Componentes Reutilizables

### Section Card (Tarjetas de Contenido)

```html
<div class="section-card">
    <div class="card-icon primary">
        <i class="bi bi-icon-name"></i>
    </div>
    <h4 class="card-title">Título</h4>
    <p class="card-text">Descripción</p>
</div>
```

**Variantes de `card-icon`:** `primary`, `success`, `warning`, `danger`

### Highlight Box (Cajas de Destacado)

```html
<div class="highlight-box">
    <p><i class="bi bi-lightbulb-fill text-warning"></i> Contenido destacado</p>
</div>
```

### Icon Item (Lista con Iconos)

```html
<div class="icon-item">
    <i class="bi bi-shield-check text-success"></i>
    <span>Texto del item</span>
</div>
```

### Data Value Card (Tarjetas de Datos)

```html
<div class="data-value-card">
    <i class="bi bi-person-vcard data-icon"></i>
    <h6>Título del Dato</h6>
    <p>Descripción del riesgo</p>
</div>
```

### Question List (Lista de Preguntas)

```html
<div class="question-list">
    <div class="question-item">
        <span class="question-number q1">1</span>
        <div class="question-content">
            <h5>¿Quién lo solicita?</h5>
            <p>Descripción</p>
        </div>
    </div>
</div>
```

### Action Flow (Flujo de Acciones)

```html
<div class="action-flow-visual">
    <div class="flow-step step-1">
        <div class="flow-icon"><i class="bi bi-pause-fill"></i></div>
        <div class="flow-content">
            <h6>1. Pausar</h6>
            <p>Descripción</p>
        </div>
    </div>
</div>
```

### Formula Visual (Fórmulas)

```html
<div class="formula-visual">
    <div class="formula-item primary">
        <i class="bi bi-person-badge item-icon"></i>
        <span class="item-label">Autoridad</span>
    </div>
    <span class="formula-operator">+</span>
    <!-- más items -->
</div>
```

---

## Iframe Modal (Contenido Externo)

Para mostrar contenido externo en un modal con iframe:

### HTML del Botón

```html
<button class="btn-iframe-modal" data-url="URL_DEL_CONTENIDO">
    <i class="bi bi-box-arrow-up-right me-2"></i>Ver ejemplo
</button>
```

### HTML del Modal (ya incluido en index.html)

```html
<div class="iframe-modal" id="iframeModal">
    <div class="iframe-modal-backdrop"></div>
    <div class="iframe-modal-container">
        <div class="iframe-modal-header">
            <span class="iframe-modal-title">Título</span>
            <button class="iframe-modal-close" id="iframeModalClose">
                <i class="bi bi-x-lg"></i>
            </button>
        </div>
        <div class="iframe-modal-body">
            <iframe id="iframeContent" src="" frameborder="0"></iframe>
        </div>
    </div>
</div>
```

### CSS del Modal (ya incluido en styles.css)

El modal ocupa 90% del viewport (`90vw x 90vh`) con z-index alto (3000).

---

## Atalhos de Teclado

| Tecla | Acción |
|-------|--------|
| `→` / `Espacio` | Siguiente diapositiva |
| `←` | Diapositiva anterior |
| `Home` | Ir a la primera |
| `End` | Ir a la última |
| `T` | Alternar tema claro/oscuro |
| `F` | Pantalla completa |
| `G` | Panel de referencia rápida |
| `M` | Abrir/cerrar menú lateral |
| `Esc` | Cerrar modales/paneles |

---

## API de JavaScript

### Funciones Principales

```javascript
// Navegación
goToSlide(index)      // Ir a una diapositiva específica
nextSlide()           // Siguiente diapositiva
prevSlide()           // Diapositiva anterior

// Temas
toggleTheme()         // Cambiar entre claro/oscuro

// Pantalla completa
toggleFullscreen()    // Activar/desactivar pantalla completa

// Panel de referencia rápida
toggleQuickRef()      // Abrir/cerrar el panel

// Iframe Modal
openIframeModal(url)  // Abrir modal con URL
closeIframeModal()    // Cerrar modal
```

### Variables Accesibles

```javascript
currentSlide          // Índice de la diapositiva actual (0-indexed)
totalSlides           // Total de diapositivas
isFullscreen          // Estado de pantalla completa
quickRefOpen          // Estado del panel de referencia
elapsedSeconds        // Segundos transcurridos desde inicio
```

### Eventos/Callbacks Personalizables

Para agregar lógica al cambiar de diapositiva, modificar `goToSlide()`:

```javascript
function goToSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    currentSlide = index;
    const targetSlide = slides[currentSlide];
    targetSlide.scrollIntoView({ behavior: 'smooth', block: 'start' });
    updateProgress();
    updateButtons();
    updateActiveNavItem();
    
    // AQUÍ: Agregar lógica personalizada
    // Por ejemplo: reproducir sonido, enviar analytics, etc.
    
    setTimeout(() => {
        slides.forEach(slide => slide.classList.remove('visible'));
        targetSlide.classList.add('visible');
    }, 100);
}
```

---

## Agregar Nuevos Componentes

### 1. Crear el Estilo CSS

```css
.nuevo-componente {
    background: var(--card-bg);
    border-radius: 20px;
    padding: 24px;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
}

.nuevo-componente:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
}
```

### 2. Agregar al HTML

```html
<div class="nuevo-componente">
    <!-- contenido -->
</div>
```

---

## Responsive Design

### Breakpoints

| breakpoint | Ancho | Columnas Grid |
|------------|-------|---------------|
| Desktop | > 1024px | 2-4 columnas |
| Tablet | 768-1024px | 2 columnas |
| Móvil | < 768px | 1 columna |

### Clases de Grid

```html
<div class="two-columns">    <!-- 2 columnas -->
<div class="three-columns">   <!-- 3 columnas -->
<div class="four-columns">    <!-- 4 columnas -->
```

### Media Queries en CSS

```css
@media (max-width: 1024px) {
    .two-columns { grid-template-columns: 1fr; }
    .three-columns { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
    .slide { padding: 32px 16px; }
    .slide-header h2 { font-size: 1.75rem; }
}
```

---

## Persistencia de Datos

### LocalStorage

El proyecto guarda en `localStorage`:

| Key | Valor | Uso |
|-----|-------|-----|
| `theme` | `"light"` / `"dark"` | Preferencia de tema |

### Modificar Persistencia

```javascript
// En script.js - guardar preferencia
localStorage.setItem('theme', newTheme);

// Cargar preferencia al inicio
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
```

---

## Animaciones Disponibles

### CSS Keyframes

```css
@keyframes float {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-15px) scale(1.02); }
}

@keyframes pulse-bg {
    0%, 100% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.15) rotate(5deg); }
}

@keyframes gradientMove {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}
```

### Transiciones de Slide

```css
.slide {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide.visible {
    opacity: 1;
    transform: translateY(0);
}
```

---

## Accesibilidad

### Atributos ARIA

```html
<button aria-label="Abrir menú">          <!-- Botones -->
<button aria-label="Cambiar tema">
<button aria-label="Siguiente diapositiva">
```

### Soporte de Teclado

- Todos los botones tienen `focus-visible` styling
- Navegación completa por teclado
- El modal se cierra con `Escape`

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
    .slide {
        opacity: 1;
        transform: none;
        transition: none;
    }
}
```

---

## Imágenes de Marcador de Posición

El proyecto usa Bootstrap Icons como biblioteca de iconos:

```
https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css
```

### Iconos Útiles para Presentaciones

- `bi-shield-check` - Seguridad
- `bi-shield-lock` - Bloqueo/Protección
- `bi-person-badge` - Identidad
- `bi-envelope` - Email
- `bi-exclamation-triangle` - Advertencia
- `bi-check-circle` - Éxito
- `bi-x-circle` - Error
- `bi-clock` - Tiempo
- `bi-lightning` - Rapidez
- `bi-robot` - IA/Automatización
- `bi-keyboard` - Atalhos
- `bi-fullscreen` - Pantalla completa

---

## Próximos Pasos para Crear Nueva Presentación

1. **Copiar archivos base**: `index.html`, `styles.css`, `script.js`

2. **Modificar contenido**:
   - Cambiar el título en `<title>`
   - Reemplazar las 19 secciones `<section class="slide">` con nuevo contenido
   - Actualizar la navegación en el sidebar

3. **Personalizar colores**:
   - Modificar las variables `--primary`, `--success`, etc. en `:root`

4. **Agregar nuevos componentes**:
   - Crear estilos en CSS siguiendo el patrón de componentes existentes
   - Usar clases de grid para layouts

5. **Mantener funcionalidades**:
   - No modificar las clases de navegación (`.slide`, `.nav-item`)
   - No renombrar IDs de elementos funcionales (`#progressBar`, `#timerDisplay`, etc.)
   - Mantener la estructura del iframe modal si se necesita

---

## Solución de Problemas

### El modal de iframe no funciona
- Verificar que `iframeModal`, `iframeContent`, `iframeModalClose` estén declarados ANTES de usarlos
- Verificar que el CSS del modal esté fuera de `@media print`

### Los slides no se desplazan correctamente
- Verificar que cada slide tenga `scroll-margin-top` adecuado
- Verificar que `slides-wrapper` tenga el padding correcto

### El tema no se guarda
- Verificar que `localStorage` esté siendo accesible
- Verificar que `savedTheme` se lee al cargar

### Animaciones no funcionan
- Verificar que no haya `transition: none` global
- Verificar `prefers-reduced-motion` no esté activando