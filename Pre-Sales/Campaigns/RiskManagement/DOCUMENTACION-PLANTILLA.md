# 📘 Documentación de Plantilla de Email Comercial

Guía técnica y funcional para utilizar y personalizar la plantilla base **`Template-Generico.html`**, conservando al 100% el diseño visual, estilos inline, componentes modulares (tarjetas, tablas, botones) y compatibilidad para clientes de correo (incluyendo Microsoft Outlook / MSO).

---

## 📑 Índice de Secciones y Componentes

| # | Sección Funcional | Comentario en HTML | Tipo de Componente |
|---|-------------------|--------------------|---------------------|
| 1 | **Preheader** | `<!-- PREHEADER -->` | Texto oculto para preview |
| 2 | **Header & Divider** | `<!-- HEADER -->` / `<!-- DIVIDER -->` | Tabla a 2 columnas (Logos) + Separador |
| 3 | **Hero Principal** | `<!-- HERO -->` | Saludo, Título H1, Párrafo y Botón CTA |
| 4 | **Grid de Oportunidades** | `<!-- SECCION 1: GRID DE OPORTUNIDADES -->` | Grilla 2x2 + 1 tarjeta full-width |
| 5 | **Lista de Prospección** | `<!-- SECCION 2: LISTA DE PREGUNTAS / PROSPECCION -->` | Caja con lista de preguntas / viñetas |
| 6 | **Tabla Comparativa / Traductor** | `<!-- SECCION 3: TABLA DE TRADUCCION COMERCIAL -->` | Tabla de 2 columnas (Problema vs. Solución) |
| 7 | **Banner de Concepto Clave** | `<!-- SECCION 4: BANNER DE CONCEPTO CLAVE -->` | Callout destacado con definición |
| 8 | **Grid de Capacidades / Features** | `<!-- SECCION 5: GRID DE CAPACIDADES -->` | Grilla de 6 tarjetas modulares |
| 9 | **Grid de Alcance (3 Pilares)** | `<!-- SECCION 6: GRID DE ALCANCE -->` | Grilla horizontal de 3 columnas |
| 10 | **Comparativa 2 Columnas** | `<!-- SECCION 7: GRID COMPARATIVO -->` | Grilla simétrica de 2 columnas (A vs B) |
| 11 | **Tarjetas Sectoriales / Verticales** | `<!-- SECCION 8: CARDS POR INDUSTRIA -->` | 4 Fichas modulares por sector |
| 12 | **Tabla de Manejo de Objeciones** | `<!-- SECCION 9: TABLA DE MANEJO DE OBJECIONES -->` | 5 Bloques de Objeción vs. Respuesta |
| 13 | **Propuesta de Valor & Cierre** | `<!-- SECCION 10: PROPUESTA DE VALOR Y CIERRE -->` | Bloque resumen de beneficios |
| 14 | **Footer Institucional** | `<!-- SECCION 11: PIE DE PAGINA / FOOTER INSTITUCIONAL -->` | Contactos, legales y desuscripción |

---

## 🛠️ Guía de Personalización por Sección

### 1. Preheader (`<!-- PREHEADER -->`)
* **Propósito:** Texto que lee el destinatario en su bandeja de entrada antes de abrir el correo.
* **Qué editar:** El texto dentro del `<div>` que contiene `{{PREHEADER_TEXTO_PREVISUALIZACION}}`.

### 2. Header (`<!-- HEADER -->`)
* **Propósito:** Identidad de marca y co-branding.
* **Qué editar:** Atributos `src` y `alt` de las imágenes en las celdas izquierda y derecha.

### 3. Hero (`<!-- HERO -->`)
* **Propósito:** Enganche principal y llamado a la acción.
* **Qué editar:**
  * Variable de saludo (`{{NOMBRE_DESTINATARIO}}`).
  * Título principal en negrita (`{{HERO_TITULO_PRINCIPAL}}`).
  * Párrafo descriptivo.
  * Texto y enlace del botón CTA (`{{BOTON_CTA_TEXTO}}` y `{{CTA_URL}}`).

### 4. Grid de Oportunidades (`<!-- SECCION 1 -->`)
* **Propósito:** Presentar dolores o disparadores comerciales.
* **Estructura:**
  * `ROW 1` (Tarjetas 1 y 2): Dos columnas con badge, título y descripción.
  * `ROW 2` (Tarjetas 3 y 4): Dos columnas adicionales.
  * `ROW 3` (Tarjeta 5): Tarjeta horizontal de ancho completo para un caso destacado.

### 5. Lista de Prospección (`<!-- SECCION 2 -->`)
* **Propósito:** Guiar la conversación con el cliente mediante preguntas o checklist.
* **Qué editar:** Los textos de cada viñeta/párrafo dentro del contenedor de fondo neutro suave (`#f8fafc`).

### 6. Tabla Comparativa (`<!-- SECCION 3 -->`)
* **Propósito:** Cuadro comparativo "Problema vs. Solución".
* **Qué editar:**
  * Filas `ROW 1` a `ROW 5`.
  * Celda izquierda: Situación actual / Dolor del cliente.
  * Celda derecha: Argumento de valor / Respuesta comercial.

### 7. Banner de Concepto Clave (`<!-- SECCION 4 -->`)
* **Propósito:** Definir o resumir el concepto tecnológico central en un bloque visual tipo callout.

### 8. Grid de Capacidades (`<!-- SECCION 5 -->`)
* **Propósito:** Mostrar las funcionalidades o pilares técnicos en 6 tarjetas modulares dispuestas en rejilla.

### 9. Grid de Alcance (`<!-- SECCION 6 -->`)
* **Propósito:** Presentar 3 áreas o dimensiones de cobertura (ej. Personas, Procesos, Tecnología) en 3 columnas adaptables a móvil.

### 10. Comparativa Diferencial (`<!-- SECCION 7 -->`)
* **Propósito:** Enfrentar dos conceptos (ej. Solución A vs Solución B) en dos tarjetas simétricas.

### 11. Tarjetas Verticales / Industria (`<!-- SECCION 8 -->`)
* **Propósito:** Segmentar por sector (Financiero, Salud, Retail, Sector Público) con casos de uso específicos.

### 12. Tabla de Objeciones (`<!-- SECCION 9 -->`)
* **Propósito:** Respuestas preparadas para las 5 barreras o dudas más frecuentes de los clientes.

### 13. Cierre y Footer (`<!-- SECCION 10 -->` y `<!-- SECCION 11 -->`)
* **Propósito:** Conclusión comercial, datos de contacto de preventa y pie de página con enlaces de cancelación de suscripción.

---

## 💡 Instrucciones para Agregar Contenido

1. Selecciona la sección que deseas modificar localizando su comentario HTML en `Template-Generico.html`.
2. Sustituye únicamente el texto interior de los elementos `<div ...>`, `<td ...>` o `<span>`, **sin alterar** las clases (`mobile-full`, `feature-grid`, `mobile-padding`), ni las tablas condicionales para Outlook (`<!--[if mso]>`).
3. Si no requieres una sección completa, puedes eliminar todo el bloque desde su `<!-- SECCION X: ... -->` hasta el cierre de su fila `</tr>` correspondiente.
