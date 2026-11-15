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

## Editar contenido

Los datos editables están en **`src/data/`**:

| Archivo | Contenido |
| --- | --- |
| `profile.json` | Nombre, rol, disponibilidad, biografía, redes, correo y CV |
| `site.json` | SEO y textos de las secciones |
| `navigation.json` | Enlaces compartidos por menú móvil y escritorio |
| `projects.json` | Proyectos, prioridad, imágenes, puntos destacados, repositorios y demos opcionales (`link`) |
| `experience.json` | Historial de experiencia |
| `technologies.json` | Catálogo de identificadores y nombres |
| `stack.json` | Grupos de tecnologías |
| `playground.json` | Capacidades, herramientas y ejemplos reales del panel del hero |

Para añadir un proyecto, agrega un objeto a `projects.json` siguiendo los campos
existentes y coloca su captura en `public/projects/`. Los IDs de `technologies`
deben existir en `technologies.json`; una referencia inválida detiene la compilación
con un mensaje claro.

- `primary: true` coloca el proyecto en el bloque principal.
- `featured: true` permite ocupar el ancho completo dentro de ese bloque.
- `highlights` contiene los aspectos técnicos destacados, sin métricas inventadas.
- `preserveImage: true` muestra la imagen completa, sin recortarla ni añadir un
  marco de navegador ficticio. `imageWidth` e `imageHeight` indican su tamaño original.

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

- Navbar amplio que se convierte en píldora con vidrio esmerilado al hacer scroll.
- Revelado de secciones, subrayado dibujado y microinteracciones con Tailwind y
  Web Animations API.
- Spotlight ligero del hero, solo con cursor preciso y sin movimiento reducido.
- Panel Frontend / Backend / Infra con herramientas y ejemplos de experiencia,
  operable con ratón, tacto y teclado, sin pseudocódigo decorativo.
- Paleta de blanco y obsidiana alternada por sección; el tema oscuro utiliza dos
  fondos más profundos. Los tokens se invierten en las franjas para mantener contraste.
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
