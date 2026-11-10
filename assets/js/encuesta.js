/* ============================================================
   encuesta.js: contenido de la encuesta (secciones y preguntas).

   Fuente: "ENCUESTA DE SATISFACCIÓN 2026 - PROFESORES CAMPUS.docx".
   Los textos y las opciones son los del Word; solo se limpiaron espacios
   dobles y comillas sueltas. Para cambiar una pregunta basta editar aquí.

   Tipos de pregunta:
     texto        campo de una línea
     paisCiudad   país (lista con buscador) + ciudad (texto)
     desplegable  lista desplegable; `buscable` agrega buscador; `otro` abre un campo
     unica        selección única en tarjetas; `otro` abre un campo
     escala       acuerdo 1–5; `na` agrega la opción "No aplica"; `seguimiento` abre otra pregunta
     grupoEscala  varias afirmaciones con la misma escala 1–5 (P13)
     abierta      respuesta larga
     nps          recomendación 0–10
     sino         Sí / No

   Lo que el Word NO define y aquí se asumió (ver README, "Pendientes"):
     - Qué preguntas son obligatorias.
     - Cuándo aparece la pregunta de seguimiento de P2 (aquí: respuestas 1, 2 o 3).
     - Las opciones de la última pregunta (aquí: Sí / No).
     - La numeración: las dos últimas preguntas repiten P15 y P16; se dejan como en el Word.
   ============================================================ */
(function (E) {
  "use strict";

  E.ESCALA = [
    { v: "1", t: "Totalmente en desacuerdo" },
    { v: "2", t: "En desacuerdo" },
    { v: "3", t: "Neutral" },
    { v: "4", t: "De acuerdo" },
    { v: "5", t: "Totalmente de acuerdo" }
  ];

  var INSTRUCCION_ESCALA = "Indica qué tan de acuerdo estás con cada afirmación: de 1 (Totalmente en desacuerdo) a 5 (Totalmente de acuerdo).";
  var ERROR_ESCALA = "Elige una opción del 1 al 5.";

  function escala(id, cod, texto, extra) {
    var p = { id: id, cod: cod, tipo: "escala", requerida: true, texto: texto, error: ERROR_ESCALA };
    Object.keys(extra || {}).forEach(function (k) { p[k] = extra[k]; });
    return p;
  }
  function opciones(lista) { return lista.map(function (t) { return { v: t, t: t }; }); }

  E.ENCUESTA = {
    secciones: [
      {
        letra: "A", icono: "persona",
        titulo: "Datos básicos y de contexto",
        corto: "Datos básicos",
        sub: "Cuéntanos quién eres y en qué curso participaste.",
        preguntas: [
          { id: "nombre", cod: "1", tipo: "texto", requerida: true, texto: "Nombres y Apellidos",
            placeholder: "Ej.: María Fernanda Gómez Ruiz", autocomplete: "name", minPalabras: 2,
            error: "Escribe tus nombres y apellidos.", errorFormato: "Escribe también tus apellidos." },
          { id: "curso", cod: "2", tipo: "desplegable", requerida: true, buscable: true,
            texto: "Curso en el que participo como profesor", fuente: "cursos",
            placeholder: "Selecciona tu curso", buscarPh: "Buscar curso…", unidad: ["curso", "cursos"],
            ayuda: "Abre la lista y escribe para encontrarlo más rápido.",
            error: "Elige el curso en el que participas como profesor." },
          { id: "antiguedad", cod: "3", tipo: "unica", requerida: true, columnas: 2,
            texto: "Antigüedad o Tiempo como Voluntario en la Fundación",
            opciones: opciones(["Menos de 6 meses (Primera vez)", "De 6 meses a 1 año", "Más de 1 año a 2 años", "Más de 2 años"]),
            error: "Selecciona cuánto tiempo llevas como voluntario." },
          { id: "residencia", cod: "4", tipo: "paisCiudad", requerida: true, texto: "País y Ciudad de Residencia" },
          { id: "paisConvocatoria", cod: "5", tipo: "desplegable", requerida: true,
            texto: "En cuál país se desempeñó como profesor en esta convocatoria", fuente: "convocatorias",
            placeholder: "Selecciona el país o la convocatoria",
            error: "Elige el país en el que te desempeñaste como profesor." },
          { id: "ocupacion", cod: "6", tipo: "unica", requerida: true, columnas: 2, otro: true,
            texto: "Ocupación / Perfil Profesional",
            opciones: opciones(["Docente de profesión", "Estudiante universitario", "Profesional activo en otra área", "Pensionado / Jubilado", "Otro"]),
            otroEtiqueta: "¿Cuál es tu ocupación?", otroPh: "Escribe tu ocupación o perfil",
            error: "Selecciona tu ocupación o perfil profesional.", errorOtro: "Escribe cuál es tu ocupación." }
        ]
      },
      {
        letra: "B", icono: "birrete",
        titulo: "Claridad del rol y capacitación inicial",
        corto: "Rol y capacitación",
        sub: INSTRUCCION_ESCALA,
        preguntas: [
          escala("p1", "P1", "Desde el inicio recibí información clara sobre mi rol, responsabilidades y alcance como voluntario(a)."),
          escala("p2", "P2", "Realicé el curso “pedagogía para profesores” de forma completa y a conciencia en todos sus módulos.", {
            seguimiento: {
              id: "p2_razones", texto: "¿Qué razones tuviste para no poder realizarlo a conciencia?",
              mostrarSi: ["1", "2", "3"], placeholder: "Cuéntanos qué te lo impidió…"
            }
          }),
          escala("p3", "P3", "Recibí instrucciones claras sobre cómo utilizar el Campus Virtual."),
          escala("p4", "P4", "Tuve una persona o canal claro a quien acudir cuando me surgieron dudas durante el curso de pedagogía para profesores.")
        ]
      },
      {
        letra: "C", icono: "libro",
        titulo: "Preparación de clase y material",
        corto: "Preparación",
        sub: INSTRUCCION_ESCALA,
        preguntas: [
          escala("p5", "P5", "Recibí las indicaciones necesarias por parte de mi enlace de curso o apoyo con la anticipación suficiente (al menos 8 días antes) para preparar mis sesiones."),
          escala("p6", "P6", "Las diapositivas, guías y materiales del curso se me entregaron con suficiente anticipación (al menos una semana antes de la clase) para la revisión y preparación de la clase."),
          escala("p7", "P7", "El diseño de las diapositivas fue adecuado y accesible según el DUA, sin requerir ajustes para su uso en clase."),
          escala("p8", "P8", "Las actividades de gamificación incluidas en las diapositivas fueron variadas y respondieron a las necesidades particulares de los estudiantes de la zona o país del curso."),
          escala("p9", "P9", "El contenido del curso es pertinente y adecuado para la realidad de mi zona y las características de mi grupo.")
        ]
      },
      {
        letra: "D", icono: "video",
        titulo: "Clase en vivo y estudiantes",
        corto: "Clase en vivo",
        sub: INSTRUCCION_ESCALA,
        preguntas: [
          escala("p10", "P10", "En la clase en vivo se evidenció que los estudiantes revisaron los contenidos previos del campus, por su participación activa y dominio de los temas."),
          escala("p11", "P11", "El nivel de participación, interacción e interés de los estudiantes durante el encuentro en vivo facilitó el desarrollo fluido de la clase.")
        ]
      },
      {
        letra: "E", icono: "equipo",
        titulo: "Trabajo en equipo y articulación de roles",
        corto: "Trabajo en equipo",
        sub: INSTRUCCION_ESCALA,
        preguntas: [
          escala("p12", "P12", "La comunicación y distribución de roles con tu compañero(a) profesor durante las sesiones sincrónicas fueron fluidas y efectivas.", {
            na: "No aplica / Trabajé de manera individual",
            error: "Elige una opción del 1 al 5 o marca «No aplica»."
          }),
          { id: "p13", cod: "P13", tipo: "grupoEscala", requerida: true, error: ERROR_ESCALA,
            texto: "Evalúa tu nivel de acuerdo con el desempeño del/de la tutor(a) en los siguientes aspectos durante el desarrollo del curso:",
            items: [
              { id: "p13a", cod: "a", titulo: "Conexión a internet", texto: "Contó con una conexión estable que garantizó el desarrollo continuo de las clases sin interrupciones." },
              { id: "p13b", cod: "b", titulo: "Dominio tecnológico", texto: "Manejó con fluidez las herramientas del aula virtual, asegurando un inicio y desarrollo de sesión sin contratiempos." },
              { id: "p13c", cod: "c", titulo: "Comunicación y trabajo en equipo", texto: "Mantuvo una comunicación asertiva y una actitud colaborativa para articular el trabajo docente." }
            ] },
          escala("p14", "P14", "Conté con la ayuda a tiempo y efectiva de mi enlace de curso o apoyo pedagógico (según aplique) para solucionar los imprevistos presentados.")
        ]
      },
      {
        letra: "F", icono: "pantalla",
        titulo: "Plataforma y soporte de tecnología",
        corto: "Plataforma",
        sub: INSTRUCCION_ESCALA,
        preguntas: [
          escala("p15", "P15", "Conozco y manejo con seguridad las herramientas principales del Campus Virtual (como la consulta de materiales, el libro de calificaciones, las rúbricas y los foros)."),
          escala("p16", "P16", "Cuando se presentaron problemas técnicos, la respuesta y solución brindadas por el equipo de soporte fueron oportunas y eficaces."),
          { id: "p17", cod: "P17", tipo: "desplegable", requerida: false, otro: true,
            texto: "¿Qué retos o dificultades desde el punto de vista de las herramientas tecnológicas tuvo a lo largo de su experiencia como profesor?",
            opciones: opciones(["Correo electrónico institucional", "Recuperación de Contraseña", "Cargue del curso(s) para capacitarse como profesor", "Inicio de sesión en Campus", "Otro"]),
            placeholder: "Selecciona una opción",
            ayuda: "Si no tuviste dificultades, puedes dejarla sin responder.",
            otroEtiqueta: "¿Cuál fue la dificultad?", otroPh: "Describe brevemente la dificultad",
            errorOtro: "Cuéntanos cuál fue la dificultad." }
        ]
      },
      {
        letra: "G", icono: "mensaje",
        titulo: "Retroalimentación cualitativa y mejora continua",
        corto: "Mejora continua",
        sub: "Ya casi terminas. Tus ideas nos ayudan a mejorar; las preguntas abiertas son opcionales.",
        preguntas: [
          { id: "p18", cod: "P18", tipo: "unica", requerida: true,
            texto: "En promedio, ¿cuántas horas a la semana destinas a las actividades como profesor voluntario (preparación de clases, ejecución de la clase, valoración de estudiantes y reuniones adicionales)?",
            opciones: opciones(["Entre 4 y 8 horas por semana", "Entre 9 y 12 horas por semana", "Más de 12 horas por semana"]),
            error: "Selecciona un rango de horas." },
          { id: "p19", cod: "P19", tipo: "abierta", requerida: false,
            texto: "¿Qué sugerencia específica tienes para mejorar los materiales didácticos, la plataforma o la dinámica de las clases en vivo?",
            placeholder: "Escribe aquí tu sugerencia…" },
          { id: "p20", cod: "P20", tipo: "abierta", requerida: false,
            texto: "¿Sobre qué temas o áreas te gustaría que la Fundación diseñara nuevos cursos para ser ofrecidos en el futuro?",
            placeholder: "Escribe aquí los temas o áreas…" },
          // En el Word estas dos preguntas repiten los números P15 y P16. Se conservan así a propósito.
          { id: "recomendacion", cod: "P15", tipo: "nps", requerida: true,
            texto: "¿Qué tan probable es que recomiendes la experiencia de ser profesor(a) voluntario(a) en el Campus Virtual de la Fundación a un colega, amigo(a) o profesional conocido?",
            min: "Nada probable", max: "Extremadamente probable",
            error: "Elige un número del 0 al 10." },
          { id: "convocatoria2027", cod: "P16", tipo: "sino", requerida: true,
            texto: "¿Consideraría ser profesor para la siguiente convocatoria (2027)?",
            error: "Selecciona Sí o No." }
        ]
      }
    ]
  };
})(window.Enc);
