# Diseño — Gestor de misiones, cabina mecha

El diseño de las pantallas es de **Astrak**. El paquete se llama «GESTOR DE MISIONES — CABINA MECHA» y trae cinco pantallas:

| Archivo                | Pantalla                                                   |
| ---------------------- | ---------------------------------------------------------- |
| `05_acceso_piloto`     | Acceso de piloto: logo hexagonal, ID, código, huella, alta |
| `01_misiones`          | Carrusel de misiones activas                               |
| `02_detalle_mision`    | Detalle con energía, objetivos y notas de campo            |
| `03_nueva_mision`      | Alta de misión y recompensa estimada                       |
| `04_mision_completada` | Cierre con XP, tiempo y nivel                              |

Cada pantalla venía en PNG y SVG, junto con `src/build.py` (los tokens) y `src/cockpit_bg_1170x2532.png` (el fondo de la cabina).

En esta copia del repo el zip no quedó como archivo en el disco del entorno, así que las pantallas se ajustaron a la lámina de conjunto y a los fotogramas del carrusel. Cuando tengas el zip, deja aquí los PNG (no hace falta duplicar los SVG) y sustituye el fondo: el componente de pantalla usa el color y la rejilla del tema en `src/theme/theme.ts`.
