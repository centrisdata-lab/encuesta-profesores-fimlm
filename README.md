# Encuesta de Satisfacción 2026 · Profesores Campus — prototipo web

Versión web de la encuesta de satisfacción para profesores del Campus Virtual, hecha a partir del documento
`ENCUESTA DE SATISFACCIÓN 2026 - PROFESORES CAMPUS.docx`.

**Es un prototipo de visualización y prueba.** No envía información a ningún sistema: las respuestas se guardan
solo en el navegador de quien la diligencia (`localStorage`), para no perderlas al recargar.

## Cómo verla

- **Publicada:** se sirve tal cual con GitHub Pages (rama `main`, carpeta raíz). No necesita servidor ni compilación.
- **En el computador:** abrir `index.html` con doble clic, o servir la carpeta (`python -m http.server`).

## Cómo está organizada

| Archivo | Qué contiene |
|---|---|
| `index.html` | Estructura de la página: encabezado, zona de progreso, contenedor de la vista y diálogo de reinicio. |
| `assets/css/estilos.css` | Todos los estilos, con índice al inicio. Usa los colores y la tipografía de Gestión Campus 2026. |
| `assets/js/encuesta.js` | **El contenido de la encuesta**: secciones, preguntas, opciones y mensajes. |
| `assets/js/datos.js` | Listas de apoyo: cursos, países y convocatorias. |
| `assets/js/campos.js` | Cómo se dibuja cada tipo de pregunta (texto, escala, 0–10, opciones, etc.). |
| `assets/js/selector.js` | La lista desplegable con buscador (panel en computador, hoja inferior en celular). |
| `assets/js/validacion.js` | Reglas: qué falta en cada pregunta, avance y resumen final. |
| `assets/js/estado.js` | Guardado y recuperación de respuestas en el navegador. |
| `assets/js/app.js` | Pantallas (bienvenida, secciones, final) y navegación. |
| `assets/js/base.js` | Utilidades e íconos. |

No usa librerías externas; solo la fuente Nunito de Google Fonts.

## Cambiar una pregunta

Todo el contenido está en `assets/js/encuesta.js`. Cada pregunta es un objeto con `tipo`, `texto`, `requerida` y sus
opciones. Los tipos disponibles están explicados al inicio de ese archivo. Para volver obligatoria u opcional una
pregunta basta cambiar `requerida`.

## Decisiones tomadas donde el Word no define

El Word se respetó: mismas secciones, preguntas, opciones y numeración. Estos puntos no estaban definidos y se
resolvieron así; conviene confirmarlos antes de la versión definitiva:

1. **Lista de cursos (pregunta 2).** El Word pide una lista desplegable pero no la incluye. Se usaron los cursos 2026
   de la herramienta de diagnóstico de clase, agrupados por categoría (`datos.js`). Falta la lista oficial.
2. **Numeración repetida.** Las dos últimas preguntas aparecen en el Word como P15 y P16, números que ya usa la
   sección F. Se dejaron tal cual, sin corregir.
3. **Obligatorias y opcionales.** El Word no lo indica. Son obligatorias los datos básicos, las escalas, las horas
   semanales, la recomendación 0–10 y la de 2027. Son opcionales P17, P19, P20 y el seguimiento de P2.
4. **Seguimiento de P2** («¿Qué razones tuviste para no poder realizarlo a conciencia?»). Aparece solo si la
   respuesta a P2 es 1, 2 o 3.
5. **Última pregunta** («¿Consideraría ser profesor para la siguiente convocatoria (2027)?»). El Word no trae
   opciones; se usó Sí / No.
6. **«País y Ciudad de Residencia».** Se dividió en dos campos: país (lista con buscador) y ciudad (texto).
7. **«En cuál país se desempeñó como profesor».** Se ofrecen las convocatorias 2026 (Colombia, España, Europa,
   Norteamérica, Australia, Cono Sur, Venezuela, México, Panamá, Perú y Ecuador).
8. **P17 (ajustada).** En el Word era una lista desplegable de una sola opción. A pedido de quien hizo el Word,
   ahora es de selección múltiple.
9. **P18 (ajustada).** Se agregó la opción «Entre 1,5 horas a 4 horas por semana», pedida por quien hizo el Word.
10. **P12.** Tiene la opción «No aplica / Trabajé de manera individual», aparte de la escala.
11. **Área o profesión (pregunta 6).** No está en el Word: se agregó «¿En qué área o profesión?», que aparece al elegir «Profesional activo en otra área», para saber en qué área es profesional quien responde.
12. **Pregunta 3 (ajustada).** Dice «Tiempo como Profesor Voluntario» en vez de «como Voluntario», para que no se confunda con el voluntariado de eventos (pedido de quien hizo el Word).

## Para conectarla después

Al finalizar, las respuestas quedan en `Enc.estado.respuestas` (un objeto `campo → valor`). El punto para enviar los
datos a LW ORS u otro sistema es la función `continuar()` de `app.js`, cuando se completa la última sección.
