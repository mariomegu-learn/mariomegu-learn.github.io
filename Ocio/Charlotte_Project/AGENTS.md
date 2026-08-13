# Guía para agentes de IA

## Propósito

Este directorio contiene una presentación web interactiva, en español, para el proyecto escolar **“Avión eléctrico de madera”** de Charlotte Mendoza. Es un sitio estático: no hay compilación, dependencias instaladas ni backend.

## Archivos principales

- `index.html`: estructura, contenido de las diapositivas y referencias externas.
- `styles.css`: paleta, layout, animaciones, componentes y responsive design.
- `script.js`: navegación, gestos, audio de interacción, video, circuito, modales y cursor personalizado.
- `assets/`: imágenes, video y favicon.
- `README.md`: instrucciones de uso breves para personas.

## Cómo ejecutar y verificar

- Abrir `index.html` directamente en un navegador moderno o servir la carpeta mediante un servidor HTTP local.
- Verificar JavaScript con: `node --check script.js`.
- No hay `package.json`, framework ni comandos de lint/build configurados.
- Mantener la compatibilidad con navegación por teclado, pantalla táctil y mouse.

## Tecnologías y recursos externos

- HTML, CSS y JavaScript nativos.
- Font Awesome 6.7.2 desde CDN para iconos.
- Tailwind CDN está incluido en el HTML, aunque el diseño usa principalmente `styles.css`.
- Google Fonts: Manrope y Space Grotesk.
- Favicon: `assets/fan.svg`, enlazado en el `<head>`.

## Estructura de diapositivas actual

El orden visual lo determina el orden de los `<section class="slide">` en `index.html`. Los identificadores deben ser consecutivos porque `script.js` usa `slide-${índice + 1}` para actualizar el hash.

1. `#slide-1` — Portada.
2. `#slide-2` — Objetivo del proyecto.
3. `#slide-3` — Materiales y partes.
4. `#slide-4` — Fases del ensamble.
5. `#slide-5` — Circuito interactivo.
6. `#slide-6` — Aprendizajes.
7. `#slide-7` — Conclusión y video final.

Al crear, eliminar o reordenar diapositivas:

1. Ajustar IDs, texto `.slide-number` y los textos de sección.
2. Mantener IDs consecutivos desde `slide-1`.
3. Confirmar que el último slide sigue siendo el de conclusión si se quiere conservar el comportamiento actual del botón “Inicio”.
4. Actualizar la condición de video en `script.js` si el video se mueve de `#slide-7`.

## Navegación y estado

En `script.js`:

- `slides` contiene todas las diapositivas.
- `current` es el índice activo basado en cero.
- `show(index)` aplica las clases `active` y `leaving`, actualiza el hash y sincroniza el video.
- `update()` actualiza contador, barra de progreso, puntos y botones.
- Navegación disponible: botones inferiores, flechas, Page Up/Page Down, Espacio, Home/End, swipe y enlace `.brand`.
- El botón de sonido conserva su control visual y el interruptor usa `beep()`; no reactivar el beep para cada transición sin solicitarlo.

## Video final

- Archivo: `assets/Avion_Funcionando.mp4`.
- Está en `#slide-7` dentro de `.finale-slide`.
- El HTML usa `autoplay`, `controls`, `playsinline` y `loop`.
- JavaScript lo pausa fuera de `#slide-7` y lo reanuda al regresar.
- Evitar eliminar `controls`, `loop` o la lógica de pausa/reproducción salvo petición explícita.

## Circuito interactivo

En `#slide-5`:

- `#circuitSwitch` alterna el estado encendido.
- `#circuitBoard` recibe o pierde la clase `on`.
- CSS reacciona mediante `.circuit-board.on` para iluminar nodos, línea de energía y hélice.
- Cada `.circuit-node` abre contenido educativo definido en el objeto `nodeData` de `script.js`.
- Las claves del objeto (`Pilas`, `Interruptor`, `Motores`, `Hélices`) deben coincidir con el texto del `<strong>` en cada nodo.

## Modales

- La imagen `assets/circuito.jpg` de `.photo-strip` se abre en `#imageModal`.
- Los nodos del circuito usan `#infoModal`.
- Existen bloques de modal duplicados en `index.html` por cambios anteriores. Antes de refactorizar modales, revisar cuidadosamente los selectores de `script.js` porque usa `querySelector` y `querySelectorAll('.modal-close')`.
- No cambiar IDs de los primeros elementos `#imageModal`, `#modalImg`, `#infoModal`, `#modalIcon`, `#modalTitle` o `#modalDesc` sin actualizar JavaScript.

## Cursor de avión

Solo se activa en dispositivos con mouse (`(hover: hover) and (pointer: fine)`).

- El cursor nativo se oculta por CSS en esos dispositivos.
- JavaScript crea `.cursor-plane` con el emoji `🛩️`.
- La posición del avión tiene inercia y el ángulo se interpola hacia la dirección del movimiento.
- `.cursor-smoke` crea la estela. Su color actual es `#e0e1dd` en `script.js`.
- No aplicar esta experiencia a pantallas táctiles.

## Diseño y paleta

Las variables principales están al inicio de `styles.css`:

- `--slate: #3d5a80`
- `--pink: #F6A6BB`
- `--yellow: #fdcf50`
- `--peach: #f5a96c`
- `--cream: #e4e1ce`
- `--slate-muted: #717d91`
- `--pink-line: #F6A6BB`

El estilo es escolar, amable y visualmente lúdico. Mantener colores cálidos, bordes redondeados, sombras suaves, iconografía y tipografías actuales. No asumir que los colores cumplen un significado de género; conservar la paleta solicitada por la persona usuaria.

## CSS y responsive

- Las diapositivas son absolutas en escritorio y se convierten en bloques en el breakpoint de `850px`.
- Los estilos de animación y accesibilidad usan `@media(prefers-reduced-motion: reduce)`.
- Al añadir animaciones, respetar esa regla y no degradar el uso en móvil.
- Reutilizar clases existentes como `.image-frame`, `.material-card`, `.learning-card`, `.modal` y `.slide-heading` antes de crear equivalentes nuevos.

## Activos disponibles

- `avion-terminado.jpg`
- `ensamble.jpg`
- `materiales.jpg`
- `motor.jpg`
- `circuito.jpg`
- `prueba-final.jpg`
- `Avion_Funcionando.mp4`
- `fan.svg`

Usar rutas relativas con el prefijo `assets/` desde `index.html`.

## Convenciones de cambio

- Idioma visible y comentarios: español.
- Preservar la estructura de presentación de una sola página.
- Mantener HTML semántico, `alt` descriptivos y atributos `aria` existentes.
- No introducir nuevas librerías si HTML/CSS/JS nativo resuelve el cambio.
- No modificar directamente recursos en `assets/` salvo solicitud explícita.
- Antes de editar, leer la sección afectada y conservar su indentación y estilo.
- Tras cambios en JS, ejecutar `node --check script.js`.
- No hacer commits ni `git restore` sin una solicitud explícita.
