# Diseño — Gestor de misiones, cabina mecha

Diseño de **Astrak** («GESTOR DE MISIONES — CABINA MECHA»). `build.py` tiene los colores y las fuentes; la app los lee en `src/theme/theme.ts`. El fondo de las pantallas es `assets/cockpit_bg_1170x2532.png`.

| Archivo                    | Contenido                                                  |
| -------------------------- | ---------------------------------------------------------- |
| `05_acceso_piloto.png`     | Acceso de piloto: logo hexagonal, ID, código, huella, alta |
| `01_misiones.png`          | Carrusel de misiones activas                               |
| `02_detalle_mision.png`    | Detalle con energía, objetivos y notas de campo            |
| `03_nueva_mision.png`      | Alta de misión y recompensa estimada                       |
| `04_mision_completada.png` | Cierre con XP, tiempo y nivel                              |
| `vista_previa.jpg`         | Lámina de conjunto                                         |
| `build.py`                 | Generador de las pantallas y tokens                        |

Los SVG y el carrusel en GIF y MP4 no están en el repo. `build.py` busca `cockpit_bg.jpg` a su lado si se vuelve a generar; la imagen que usa la app es el PNG de `assets/`.
