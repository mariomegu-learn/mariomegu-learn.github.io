# Integración Modo Instructor

Este paquete permite agregar Modo Instructor a la estructura actual del curso sin reescribir app.js.

## Instalación rápida

1. Copia `instructor-mode.css` junto a tu `styles.css`.
2. Copia `instructor-mode.js` junto a tu `app.js`.
3. En tu HTML agrega:

```html
<link href="instructor-mode.css" rel="stylesheet">
```

después de:

```html
<link href="styles.css" rel="stylesheet">
```

4. En tu HTML agrega:

```html
<script src="instructor-mode.js"></script>
```

después de:

```html
<script src="app.js"></script>
```

## Qué hace

- Inserta botón de Modo Instructor en la topbar.
- Inserta botón en el menú móvil.
- Agrega indicador flotante.
- Permite activar/desactivar con Ctrl + Alt + I.
- Persiste el estado en LocalStorage.
- Inyecta notas de instructor automáticamente al abrir módulos.

## Nota

Si tu archivo real app.js contiene entidades como `=&gt;`, `&amp;&amp;`, `&lt;` o `&gt;`, debes corregirlas a `=>`, `&&`, `<` y `>` respectivamente.
