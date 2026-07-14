# Seguridad Digital en la Atención al Ciudadano

## Presentación Interactiva

Presentación de diapositivas sobre ciberseguridad directed a funcionarios de atención al ciudadano en entidades públicas.

---

## Propósito

Capacitar a funcionarios de ventanilla, recepción, gestión documental y apoyo administrativo en:

- Reconocer situaciones sospechosas de ingeniería social
- Actuar con calma bajo presión operativa
- Proteger la información personal de los ciudadanos
- Aplicar procedimientos de verificación antes de compartir datos

**Duración estimada:** 45 minutos  
**Público objetivo:** Funcionarios de atención al ciudadano en entidades públicas

---

## Estructura del Proyecto

```
Charla5/
├── index.html          # Presentación principal (19 slides)
├── styles.css          # Estilos CSS con modo claro/oscuro
├── script.js           # Navegación e interactividad
├── guia_rapida.html    # Guía de referencia rápida (panel lateral)
└── DOCUMENTACION.md    # Este archivo
```

---

## Arquitectura de Slides

### 19 Diapositivas

| # | Título | Contenido Principal |
|---|--------|---------------------|
| 1 | Portada | Título, autor, mensaje rector |
| 2 | La Historia de Dos Decisiones | Escenario de presión con correo urgente |
| 3 | La Confianza es el Servicio | Concepto de confianza ciudadana |
| 4 | Todos Somos Parte | Cadena de confianza institucional |
| 5 | El Riesgo Bajo Presión | Frases de manipulación + ejemplos reales (smishing, vishing, WhatsApp) |
| 6 | Fórmula de la Manipulación | Autoridad + Urgencia + Excepción = Riesgo |
| 7 | El Valor de los Datos | Tipos de datos sensibles y su combinación |
| 8 | Impacto de Entrega Indebida | Consecuencias para ciudadano e institución |
| 9 | Analogía del Portero | El funcionário como punto de control digital |
| 10 | Decisiones Cotidianas | 6 acciones con consecuencias concretas |
| 11 | Caso 1: Solicitud Urgente | Análisis de correo fraudulento |
| 12 | Caso 2: El Falso Superior | Typosquatting y técnicas de suplantación |
| 13 | La Inteligencia Artificial | Deepfakes, phishing generado por IA |
| 14 | Cuatro Preguntas | Herramienta práctica de verificación |
| 15 | Qué Hacer si es Sospechoso | Flujo de 5 pasos de respuesta |
| 16 | Regreso a la Historia | Cierre del arco narrativo |
| 17 | Mensaje Final | Tecnología vs personas protegiendo confianza |
| 18 | Llamado a la Acción | 3 compromisos concretos |
| 19 | Frase de Cierre | Quote final y agradecimientos |

---

## Características Implementadas

### Navegación
- Teclado: `←` `→` `Space` para navegar
- Home/End para ir al inicio/final
- Swipe táctil en dispositivos móviles
- Sidebar con índice clickeable
- Scroll suave entre slides

### Modo Oscuro
- Toggle en barra superior
- Persiste en localStorage
- Variables CSS para colores

### Pantalla Completa
- Botón o tecla `F`
- Recomendado para presentaciones en proyector

### Timer
- Cronómetro activo desde inicio
- Formato MM:SS
- Visible en barra superior

### Guía de Referencia Rápida
- Panel deslizable desde botón flotante
- Contiene: Fórmula, 4 preguntas, 5 pasos, frases clave
- Tecla `G` para abrir/cerrar

### Modal de Ayuda
- Lista de atajos de teclado
- Tecla `H` o botón `?` para abrir

### Accesibilidad
- `prefers-reduced-motion` respetado
- Atributos aria-label en controles
- Focus visible en navegación
- Contraste WCAG AA

---

## Atajos de Teclado

| Tecla | Acción |
|-------|--------|
| `←` `→` `Space` | Siguiente/anterior slide |
| `Home` / `End` | Ir al inicio / final |
| `T` | Alternar modo oscuro |
| `F` | Pantalla completa |
| `G` | Abrir guía de referencia |
| `M` | Abrir/cerrar menú sidebar |
| `Esc` | Cerrar paneles/modales |

---

## Cambios Aplicados

### Fase 1: Estructura Base
- Creación de HTML con Bootstrap 5 + Iconbootstrap
- 19 slides siguiendo el guion original
- Navegación básica por scroll

### Fase 2: Diseño Profesional
- Tipografía Inter (Google Fonts)
- Paleta de colores institucional
- Sidebar con navegación indexada
- Cards con sombras y bordes sutiles
- Animaciones de transición

### Fase 3: Modo Oscuro
- Sistema de variables CSS para theming
- Toggle en barra superior
- Persistencia en localStorage

### Fase 4: Enrichecimiento de Contenido
Como especialista en ciberseguridad, se enrichió el contenido de slides específicos:

**Slide 5 (Presión):**
- Agregados ejemplos reales: Smishing, Vishing, WhatsApp, Email

**Slide 7 (Datos):**
- Tipos específicos: cédula, dirección, teléfono, financieros, salud
- Clasificación: datos sensibles, menores, institucionales

**Slide 8 (Impacto):**
- Consecuencias separadas por impacto
- Ciudadano vs institución

**Slide 10 (Decisiones):**
- Consecuencias concretas por cada acción
- Errores comunes vs decisión correcta

**Slide 11-12 (Casos):**
- Más señales de alerta
- Técnicas: typosquatting
- Preguntas con verificación visual

**Slide 13 (IA):**
- Deepfakes de audio
- Ataques generados por IA
- Contramedidas

---

## Decisiones de Diseño

### Por qué Bootstrap + Iconbootstrap
- Framework CSS maduro y confiable
- Iconbootstrap incluye iconos institucionales completos
- Responsive por defecto
- Componentes accesibles

### Por qué CSS Custom Properties
- Facilita el tema oscuro sin duplicar estilos
- Consistencia en colores en toda la aplicación
- Cambio de tema dinámico sin recarga

### Por qué Scroll-based Navigation
- Más natural para presentaciones largas
- Funciona sin JavaScript (progresivo enhancement)
- Melhor para SEO si se compartiera como página

### Por qué Sidebar en Mobile
- Navegación rápida sin necesidad de scroll
- Indicador visual de progreso
- Accesible para pantallas táctiles

---

## Contenido de Ciberseguridad Incluido

### Ingeniería Social
- Phishing por email, SMS (smishing), llamadas (vishing), WhatsApp
- Suplantación de identidad
- Deepfakes de audio
- Typosquatting en dominios

### Tipos de Datos Sensibles
- Identificación (cédula, DPI, pasaporte)
- Datos financieros y tributarios
- Información de salud
- Datos de menores (protección especial)
- Información institucional

### Contramedidas
- Fórmula: Autoridad + Urgencia + Excepción = Riesgo
- 4 preguntas clave antes de actuar
- 5 pasos ante situación sospechosa
- Verificación por canal alternativo
- Escalamiento a supervisores

---

## Mejoras Recomendadas Futuras

### Contenido
- [ ] Agregar sección sobre contraseñas seguras
- [ ] Incluir módulo sobre redes WiFi públicas
- [ ] Añadir información sobre autenticación multifactor (MFA)
- [ ] Crear sección de clasificación de información

### Técnico
- [ ] Implementar preloading de slides cercanos
- [ ] Agregar exportación a PDF
- [ ] Soporte para presenter notes en segundo monitor
- [ ] Crear包executable independiente (Electron/Tauri)

### UX
- [ ] Modo presentación dedicado (ocultar UI)
- [ ] Miniaturas de slides para navegación visual
- [ ] Zoom/increase font size para proyectores
- [ ] Modo de examen/quiz después de la presentación

---

## Recursos Externos

### CDN
- Bootstrap 5.3.3: `https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css`
- Bootstrap Icons 1.11.3: `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css`
- Google Fonts (Inter): `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap`

### Framework
- Bootstrap 5 para grid y componentes base
- Bootstrap Icons para iconografía
- CSS Custom Properties para theming

---

## Autor

**Mario Raúl Mendoza Guzmán**  
Ingeniero Preventa

---

## Licencia

Proyecto interno de capacitación. Uso restringido a contextos de formación institucional.

---

*Documentación generada: Julio 2026*  
*Última actualización: Incluye enrichecimiento de contenido de ciberseguridad*