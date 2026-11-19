# Fuentes del contenido profesional

Fuente principal: `public/files/cv_juan_jose_condori_pinto.pdf`, leído para esta
actualización. No fue necesario consultar LinkedIn. El PDF se conserva sin cambios.

## Experiencia

- **Smart Reasons, junio de 2025–actualidad:** interfaces integradas con APIs,
  arquitectura de microservicios y optimización SQL con índices y pruebas de estrés.
  El CV no detalla las tecnologías de este puesto: no se atribuyen .NET, Vue ni
  AWS específicamente a esta empresa.
- **TECSUP, diciembre de 2024–marzo de 2025:** Lead Full Stack Developer;
  gestión administrativa, asistencia RFID, servidores, bases de datos y CI/CD.
- **TECSUP, abril–junio de 2024:** eventos deportivos y scoreboard en tiempo real;
  Linux, PostgreSQL y CI/CD. React, Tailwind y Express ya figuraban en el portafolio.
- **Bitio, diciembre de 2023–febrero de 2024:** cotizaciones, inventario, diseño
  en Figma y aplicación de escritorio con Tauri y SQLite. React ya figuraba en el
  portafolio.
- **Sinh company:** experiencia existente conservada; no aparece en este CV.

Las fechas y «actualidad» reflejan el documento facilitado, no una verificación
independiente del estado laboral.

## Perfil y tecnologías

El CV confirma Arequipa, el correo `juanjosecp489@gmail.com`, estudios en TECSUP
y UNSA, .NET, Vue 3, Angular, Node.js, SQL Server, Redis, AWS, Linux, CI/CD y Kafka.
C# se incorpora por indicación explícita del usuario. Las tecnologías del panel
del hero representan capacidades generales; el ejemplo enlazado describe solo
las tareas documentadas en esa empresa.

No se añaden porcentajes de mejora, años de experiencia calculados ni servicios
específicos de AWS que el CV no mencione.

## Iconos

Vue y C# provienen de [Devicon](https://github.com/devicons/devicon) (MIT).
El icono .NET proviene de [Simple Icons](https://simpleicons.org/) (CC0).
Los iconos son marcas de sus respectivos propietarios y se usan para identificar
tecnologías. Se sirven localmente, sin peticiones externas en la página.

## Proyectos principales

Contenido contrastado con los README públicos y la implementación disponible en
las copias locales, sin modificar ni ejecutar esos repositorios:

- [Engine Alert Manager / Motor Manager](https://github.com/Derek486/engine_alert_manager):
  React, servicios .NET, simulador de vibraciones en Flask, Kafka, PostgreSQL y
  Docker Compose. El README y `docker-compose.yml` documentan la integración.
  La descripción corresponde al sistema, no atribuye la autoría exclusiva de
  todos sus componentes ni promete detección predictiva validada.
- [PSIS-DB Storage Engine](https://github.com/Derek486/psis-storage-engine):
  prototipo educativo en C++17, índice B+Tree, almacenamiento binario,
  intérprete de comandos y servidor TCP. No se presenta como motor de producción
  ni se publican cifras de rendimiento no verificadas.
- [Simulador de sistemas operativos](https://github.com/Derek486/temp_so_simulator):
  aplicación Java/Swing de planificación de CPU, memoria virtual y entrada/salida.
  No se usan los valores de una captura como resultados generales de rendimiento.

Imágenes facilitadas por el usuario, convertidas a WebP sin recortar el contenido:

| Origen | Archivo publicado |
| --- | --- |
| `engine_alert_manager/assets/landscape.png` | `public/projects/engine-alert-manager.webp` |
| `psis-storage-engine/assets/psis-db-architecture.png` | `public/projects/psis-storage-engine.webp` |
| `temp_so_simulator/screenshots/panel-burst-complete.png` | `public/projects/os-simulator.webp` |

Las dos primeras son diagramas representativos de arquitectura; la tercera es
una captura de la aplicación. Los originales se conservan en sus repositorios.

## Estudios de caso

Las fichas en `src/data/projects.json` se contrastaron con estos archivos públicos
de GitHub. La revisión fue de código y documentación; no se ejecutaron los proyectos.

| Proyecto | Fuentes revisadas |
| --- | --- |
| Engine Alert Manager | [README y Docker Compose](https://github.com/Derek486/engine_alert_manager), [documentación de React y Flask](https://github.com/Derek486/engine_alert_manager/tree/main/front-cluster) |
| PSIS-DB | [README](https://github.com/Derek486/psis-storage-engine), [módulos de C++](https://github.com/Derek486/psis-storage-engine/tree/main/src) y [pruebas del árbol B+](https://github.com/Derek486/psis-storage-engine/tree/main/tests) |
| Simulador de sistemas operativos | [README](https://github.com/Derek486/temp_so_simulator), [núcleo Java y actualización de Swing](https://github.com/Derek486/temp_so_simulator/tree/main/src/com/ossimulator) |
| Hotel Vallesur | [README del proyecto integrado](https://github.com/Derek486/hotel-vallesur-manage-stack), [pantallas React](https://github.com/Derek486/hotel-vallesur-manage-front/tree/main/src) y [capas Spring Boot](https://github.com/Derek486/hotel-vallesur-manage-back/tree/main/src/main/java) |
| Events Management | [README](https://github.com/Derek486/django-events-management), [modelos, rutas y vistas Django](https://github.com/Derek486/django-events-management/tree/main/eventos) |
| Employee App | [README](https://github.com/Derek486/employee-app-mean-stack), [rutas y validación Express](https://github.com/Derek486/employee-app-mean-stack/tree/main/backend/src) y [pantallas y servicio Angular](https://github.com/Derek486/employee-app-mean-stack/tree/main/frontend/src/app) |

Los aprendizajes describen habilidades que se practican en cada proyecto a partir
de su implementación. No se infieren contribuciones individuales ni impacto medido.
