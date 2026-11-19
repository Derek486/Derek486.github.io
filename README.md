# Juan José · Portafolio Full Stack

Astro + TypeScript + Tailwind CSS. Sitio estático en español, sin framework de
cliente ni librería de animación. Fuentes alojadas localmente.
TypeScript 6 se mantiene por compatibilidad con `@astrojs/check`.

## Desarrollo

Requiere **Node ≥22.23.4** (ver `.nvmrc`).

```sh
nvm install
nvm use
npm ci
npm run dev
```

| Comando | Función |
| --- | --- |
| `npm run check` | Comprueba TypeScript y componentes Astro |
| `npm run build` | Genera `dist/` para despliegue estático |
| `npm run preview` | Sirve la versión compilada |
| `npm test` | Pruebas de navegador, escritorio y móvil |

Antes de ejecutar pruebas por primera vez: `npx playwright install chromium`.
Para usar Chromium del sistema:
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test`.

## Despliegue en GitHub Pages

Repositorio: **`Derek486/Derek486.github.io`**.
URL prevista: **https://derek486.github.io/**.

1. En el repositorio de GitHub, abre **Settings → Pages**.
2. En **Build and deployment → Source**, selecciona **GitHub Actions**.
3. Sube estos cambios a `main`. El workflow
   [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) comprueba tipos,
   compila y publica `dist/`. También puedes ejecutarlo desde
   **Actions → Deploy to GitHub Pages → Run workflow**.

El workflow usa la versión de Node de `.nvmrc`, instala con `npm ci` y autentica
el despliegue con `GITHUB_TOKEN` y OIDC. No requiere tokens personales ni una rama
`gh-pages`. La publicación efectiva se comprueba en la pestaña **Actions**.

`astro.config.mjs` define `site: "https://derek486.github.io"` y `base: "/"`.
El repositorio `Derek486.github.io` publica en la raíz del dominio, sin prefijo.
Desarrollo, pruebas y despliegue usan la misma base; no se requieren variables
de entorno específicas para GitHub Pages. Las imágenes, el CV y el favicon
respetan esta base mediante `src/presentation/utils/asset-url.ts`.
Los datos JSON conservan sus rutas relativas a `public/`, sin el nombre del repositorio.

Para comprobar localmente el despliegue con la misma base:

```sh
npm run build
npm run preview
# Abrir http://localhost:4321/
```

Para ejecutar las pruebas de escritorio y móvil con esa base:

```sh
npm test
```

Si cambias el nombre del repositorio o usas un dominio propio, actualiza `site`
y `base` en `astro.config.mjs` y la base de `playwright.config.ts`.

## Editar contenido

Los datos editables están en **`src/data/`**:

| Archivo | Contenido |
| --- | --- |
| `profile.json` | Nombre, rol, disponibilidad, biografía, redes, correo y CV |
| `site.json` | SEO y textos de las secciones |
| `navigation.json` | Enlaces compartidos por menú móvil y escritorio |
| `projects.json` | Proyectos, imágenes, estudios de caso, repositorios y demos opcionales (`link`) |
| `experience.json` | Historial de experiencia |
| `technologies.json` | Catálogo de identificadores y nombres |
| `stack.json` | Grupos de tecnologías |
| `playground.json` | Capacidades, herramientas y ejemplos reales del panel del hero |

Para añadir un proyecto, agrega un objeto a `projects.json` siguiendo los campos
existentes y coloca su captura en `public/projects/`. Los IDs de `technologies`
deben existir en `technologies.json`; una referencia inválida detiene la compilación
con un mensaje claro.

- `primary: true` coloca el proyecto en el bloque principal.
- En escritorio, las portadas principales alternan derecha e izquierda con el
  mismo ancho. En móvil, cada portada va antes del texto.
- `highlights` contiene los aspectos técnicos destacados, sin métricas inventadas.
- `imageWidth` e `imageHeight` indican el tamaño original. Las portadas se
  muestran completas, sin marco ficticio, en la tarjeta y el estudio de caso.
- `caseStudy` aporta el problema, el pie de imagen, los módulos de arquitectura,
  las funcionalidades y los aprendizajes; `note` permite aclarar el alcance.
  Astro genera una página estática por proyecto en `/proyectos/<id>/`.

Engine Alert Manager encabeza la selección, seguido de PSIS-DB y el simulador de
sistemas operativos. Hotel Vallesur, Events Management y Employee App se mantienen
en «Más proyectos». Las imágenes nuevas se sirven como WebP locales optimizados.
El campo `experienceId` del panel del hero enlaza con un ID de `experience.json`;
una referencia inexistente también detiene la compilación.

Los datos profesionales se actualizaron a partir del CV en `public/files/`.
Consulta [las fuentes y criterios de contenido](docs/content-sources.md).

Para añadir un icono, registra su componente en
`src/presentation/components/TechnologyIcon.astro`. Sin icono, el nombre sigue
mostrándose. CV y fotografía se conservan en `public/`.

Los JSON se leen durante la compilación: después de modificarlos, vuelve a generar
y desplegar el sitio. No se necesita backend.

## Arquitectura

```text
src/
├── domain/
│   ├── types/          # Un tipo de dominio por archivo; sin dependencias de UI
│   └── ports/          # Contrato del repositorio
├── application/        # Caso de uso y validación de referencias
├── infrastructure/     # Adaptador JSON que implementa el contrato
├── data/               # Contenido editable, sin componentes ni estilos
├── presentation/
│   ├── components/     # Componentes reutilizables; props junto al componente
│   ├── sections/       # Secciones únicas de la página
│   └── behaviors/      # Interacciones de navegador tipadas
├── components/icons/   # Iconos SVG existentes
├── layouts/            # Documento, fuentes, tema inicial y estilos
├── pages/              # Composición e inyección del repositorio
└── styles/global.css   # Tailwind, tokens de tema y keyframes
```

Dependencias apuntan hacia dominio: `infrastructure → domain`,
`application → domain`. La página conecta adaptador, caso de uso y presentación.
Los componentes reciben datos por props: no importan JSON ni acceden al repositorio.
No hay archivos que mezclen tipos de dominio; las interfaces `Props` pertenecen a
sus componentes.

## Interacciones y accesibilidad

- En la primera visita al inicio por pestaña, el símbolo `</>` se dibuja sobre
  un halo a pantalla completa. Dos paneles se abren automáticamente; no hay
  botón de omisión. La intro no aparece en enlaces directos ni con movimiento reducido.
- Navbar amplio que se convierte en píldora con vidrio esmerilado al hacer scroll.
- Barra flotante mate junto al borde derecho en escritorio: sigue el scroll
  nativo y permite arrastrar y navegar por teclado.
  Sin JavaScript, en pantallas táctiles y con colores forzados queda la barra nativa.
- Cursor técnico SVG para ratón: cruz, estados de enlace, pulsación y deshabilitado,
  y forma de I para seleccionar texto. Con movimiento reducido o colores
  forzados se mantiene el cursor del sistema.
- Línea de experiencia centrada con hitos alternados en escritorio. En móvil,
  la línea queda a la izquierda para mantener los hitos en una columna.
- Revelado de secciones, subrayado dibujado y microinteracciones con Tailwind y
  Web Animations API.
- Las portadas aparecen en perspectiva al entrar en vista y se inclinan con un
  cursor preciso. En navegadores compatibles, la imagen continúa con una
  transición nativa al abrir el caso. Los casos funcionan sin JavaScript e
  incluyen arquitectura desplegable con controles HTML.
- Dos luces difusas en el hero y spotlight en el panel de capacidades, solo
  con ratón y sin movimiento reducido. Reflejos discretos en portadas, herramientas
  y retrato; el contacto cierra en obsidiana en ambos temas.
- Panel Frontend / Backend / Infra con herramientas y ejemplos de experiencia,
  operable con ratón, tacto y teclado, sin pseudocódigo decorativo.
- Paleta editorial clara de blanco, canvas y franjas suaves. En oscuro, los
  fondos obsidiana se separan de las tarjetas con bordes y texto de alto contraste.
- Tema claro/oscuro persistente, sin destello inicial; sigue funcionando si el
  navegador bloquea almacenamiento.
- Menú móvil nativo con cierre por Escape, navegación y clic exterior.
- Respeta `prefers-reduced-motion`, tiene enlaces de salto y foco visible.
- Contenido principal y navegación móvil disponibles sin JavaScript.

Inspiración de navegación y movimiento:
[Sandeep Baral](https://sandeepbaral.vercel.app/), descubierto en
[Wall of Portfolios](https://www.wallofportfolios.in/portfolios/sandeep-baral/).
Adaptación propia al desarrollo full stack; no se reutilizan sus imágenes,
proyectos ni credenciales.
