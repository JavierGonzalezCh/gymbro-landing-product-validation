# GymBro OS — Landing Page (Beta)

Estructura de archivos:

```
gymbro-landing/
├── index.html          → Estructura de la página (sin CSS ni JS embebido)
├── style.css            → Todos los estilos
├── script.js             → Toda la lógica (explorador de funciones, wizard, scroll-reveal, envío)
└── assets/
    ├── images/
    │   ├── hero-poster.jpg                    → frame estático del video del hero
    │   ├── mockup-miembros-desktop.jpg        → mockup de Miembros, versión horizontal (>820px)
    │   ├── mockup-miembros-mobile.jpg         → mockup de Miembros, versión vertical (≤820px)
    │   ├── mockup-rutinas-desktop.jpg
    │   ├── mockup-rutinas-mobile.jpg
    │   ├── mockup-reportes-desktop.jpg
    │   ├── mockup-reportes-mobile.jpg
    │   ├── mockup-comunicacion-desktop.jpg
    │   ├── mockup-comunicacion-mobile.jpg
    │   ├── mockup-logros-desktop.jpg
    │   └── mockup-logros-mobile.jpg
    └── videos/
        ├── hero-loop.webm           → video de fondo del hero (formato liviano, prioritario)
        └── hero-loop.mp4            → video de fondo del hero (fallback de compatibilidad)
```

## Explorador de funciones: imágenes mobile vs. desktop

La sección "Cómo se ve cada función" (`#funciones`) usa **dos versiones de cada mockup**:

- **`-desktop.jpg`** — se muestra en pantallas mayores a 820px, donde las tarjetas se apilan en horizontal. El layout deja el **1/3 izquierdo de la sección libre** (sin tarjetas encima) para que el mockup de fondo se vea completo ahí; diseña estas imágenes pensando que la parte importante del mockup debe quedar en esa franja izquierda.
- **`-mobile.jpg`** — se muestra en pantallas de 820px o menos, donde las tarjetas se apilan en vertical y ocupan todo el ancho. Aquí no hay franja reservada, así que el mockup puede usar el encuadre completo.

El cambio entre una y otra es automático (JavaScript detecta el ancho de pantalla) y también se actualiza si el visitante rota el dispositivo o cambia el tamaño de la ventana cruzando el breakpoint de 820px.

## Pendientes antes de publicar

1. **Subir los 10 mockups + poster** a `assets/images/` y los 2 videos a `assets/videos/`, con los nombres exactos de arriba.
   Mientras no existan, la página no se rompe: los mockups muestran un fallback ilustrativo automático y el hero cae a fondo sólido sin video.
2. **Reemplazar el número de WhatsApp** en `script.js`, línea con `const WHATSAPP_NUMBER = "573001234567";`.
3. **Configurar el webhook de Google Sheets** — ya elegido en vez de Formspree, porque las respuestas del formulario (dolores múltiples, precios Van Westendorp, satisfacción, etc.) se necesitan estructuradas en filas para poder analizarlas, no sueltas en correos individuales.
   - El script listo para pegar está en `apps-script-webhook.gs` (mismo nivel que este README).
   - Pasos: crear un Google Sheet → Extensiones → Apps Script → pegar el contenido de `apps-script-webhook.gs` → Implementar → Nueva implementación → tipo "Aplicación web", ejecutar como "Yo", acceso "Cualquier usuario" → copiar la URL que termina en `/exec`.
   - Pegar esa URL en `script.js`, en la línea `const WEBHOOK_URL = "";`.
   - Puedes probar la conexión ejecutando la función `testDoPost` directamente desde el editor de Apps Script antes de conectarla a la landing real — debería aparecer una fila de prueba en el Sheet.
4. Los leads se guardan también en el navegador del visitante bajo la clave `gymbro_leads` en `localStorage` (respaldo local, no depende del webhook).
5. **Actualizar el dominio en las etiquetas SEO** — `index.html` usa `https://gymbro.co/` como placeholder en `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image` y el JSON-LD. Reemplázalo por el dominio real una vez esté definido el nombre final (GymStack / Fitbox / etc.) — buscar y reemplazar `gymbro.co` en `index.html`.
6. (Opcional) **Regenerar `og-image.png`** con branding definitivo una vez tengas el nombre y logo finales — la actual (`assets/images/og-image.svg` exportada a `.png`) es un placeholder generado automáticamente, funcional pero genérico.

## Ícono de pestaña (favicon) y SEO

Los archivos del favicon viven en la **raíz del proyecto** (junto a `index.html`), no en `assets/`. Es intencional: navegadores y crawlers viejos piden automáticamente `/favicon.ico` y `/apple-touch-icon.png` desde la raíz del dominio sin fijarse en el `<head>`, así que deben estar ahí para cubrir ese caso.

```
gymbro-landing/
├── index.html
├── style.css
├── script.js
├── favicon.ico              → ícono clásico, fallback universal
├── favicon.svg               → ícono nítido en cualquier resolución (navegadores modernos)
├── favicon-96x96.png         → fallback PNG
├── apple-touch-icon.png      → ícono al agregar a pantalla de inicio en iOS (180×180)
├── web-app-manifest-192x192.png
├── web-app-manifest-512x512.png
├── site.webmanifest          → metadata de "app" (nombre, colores, íconos) para Android/PWA
└── assets/
    └── images/
        ├── og-image.png       → vista previa al compartir el link (WhatsApp, Facebook, etc.)
        └── og-image.svg
```

**Importante — rutas relativas:** todos los `<link>` de favicon en `index.html` usan rutas **relativas** (`href="favicon.ico"`, sin `/` al inicio). Si en algún momento regeneras el set con RealFaviconGenerator u otra herramienta, revisa que el código que te dé no use rutas absolutas (`href="/favicon.ico"`) — esas fallan al abrir el archivo localmente con doble clic (protocolo `file://`), porque el `/` apunta a la raíz del disco, no a la carpeta del proyecto. Mismo cuidado aplica a `site.webmanifest`: sus `icons.src` también deben ser relativos (`"web-app-manifest-192x192.png"`, no `"/web-app-manifest-192x192.png"`).

- El `<head>` de `index.html` incluye meta description, Open Graph, Twitter Card, `theme-color`, `canonical` y datos estructurados (JSON-LD tipo `SoftwareApplication`) para mejorar cómo los buscadores y redes sociales interpretan la página.
- Puedes probar cómo se ve el link compartido (antes de tener el dominio real) con herramientas como [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) o [Twitter Card Validator](https://cards-dev.twitter.com/validator) una vez esté publicada.
- Si el favicon no aparece al probar en el navegador, primero prueba en **ventana de incógnito** — los favicons se cachean muy agresivamente y a veces un refresh normal no basta.

