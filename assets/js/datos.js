/* ============================================================
   datos.js: listas de apoyo para los desplegables.

   CURSOS: el Word pide una "lista desplegable con los nombres de los
   cursos de la Fundación" pero no la trae. Esta lista sale de los cursos
   2026 que ya usa la herramienta de diagnóstico de clase, unificando
   variantes de escritura. Hay que confirmarla con la lista oficial.
   ============================================================ */
(function (E) {
  "use strict";

  var CURSOS = {
    "Habilidades Humanas": [
      "Bienestar para la Persona Mayor", "Comprensión Lectora", "Despertar Humano", "Economía del Hogar"
    ],
    "Emprendimiento y Empleabilidad": [
      "Costos para Emprendedores/Contabilidad", "Despertar Emprendedor", "Estrategias para la Búsqueda de Empleo",
      "Familias Empresarias del Campo", "Mi Negocio en Internet", "Orientación Emprendedora",
      "Profundización Costos para Emprendedores", "Sin Límites Virtual"
    ],
    "Idiomas": [
      "Alemán Nivel 1", "Business English 1", "Business English 2", "Espagnol 2", "Espanhol 2",
      "Francés Nivel 1", "Francés Nivel 2", "Inglés Nivel 1", "Inglés Nivel 2",
      "Italiano Nivel 1", "Italiano Nivel 2", "Portugués Nivel 1", "Portugués Nivel 2"
    ],
    "Artes y Oficios": [
      "Bisutería 1", "Bisutería 1, 2", "Floristería 1", "Manejo de Máquinas de Confección", "Modistería (Faldas)",
      "Modistería reparación y modificación de prendas de vestir", "Muñecas de Trapo", "Pintura en Madera",
      "Repostería 1", "Repostería 2", "Trenzas y Peinados"
    ],
    "Tecnología y programación": [
      "Inteligencia Artificial con Valores", "Sistemas e Informática | Nivel básico", "Sistemas Nivel 2"
    ],
    "Medio Ambiente y Agroproductividad": [
      "El ABC del Reciclaje", "Salud y Bienestar para Ovinos y Caprinos"
    ],
    "Cursos en otros idiomas": [
      "Economia Domestica Italiano", "Economia Doméstica Portugues", "Économie Domestique", "Human Awakening"
    ]
  };

  // Países donde más profesores residen, arriba; el resto en orden alfabético.
  var FRECUENTES = ["Colombia", "España", "Estados Unidos", "México", "Ecuador", "Perú", "Venezuela", "Panamá",
    "Chile", "Argentina", "Australia"];
  var OTROS = ("Afganistán,Albania,Alemania,Andorra,Angola,Antigua y Barbuda,Arabia Saudita,Argelia,Armenia,Austria," +
    "Azerbaiyán,Bahamas,Bangladés,Barbados,Baréin,Bélgica,Belice,Benín,Bielorrusia,Bolivia,Bosnia y Herzegovina," +
    "Botsuana,Brasil,Brunéi,Bulgaria,Burkina Faso,Burundi,Bután,Cabo Verde,Camboya,Camerún,Canadá,Catar,Chad,China," +
    "Chipre,Comoras,Corea del Norte,Corea del Sur,Costa de Marfil,Costa Rica,Croacia,Cuba,Dinamarca,Dominica,Egipto," +
    "El Salvador,Emiratos Árabes Unidos,Eritrea,Eslovaquia,Eslovenia,Estonia,Esuatini,Etiopía,Filipinas,Finlandia," +
    "Fiyi,Francia,Gabón,Gambia,Georgia,Ghana,Granada,Grecia,Guatemala,Guinea,Guinea-Bisáu,Guinea Ecuatorial,Guyana," +
    "Haití,Honduras,Hungría,India,Indonesia,Irak,Irán,Irlanda,Islandia,Islas Marshall,Islas Salomón,Israel,Italia," +
    "Jamaica,Japón,Jordania,Kazajistán,Kenia,Kirguistán,Kiribati,Kuwait,Laos,Lesoto,Letonia,Líbano,Liberia,Libia," +
    "Liechtenstein,Lituania,Luxemburgo,Macedonia del Norte,Madagascar,Malasia,Malaui,Maldivas,Malí,Malta,Marruecos," +
    "Mauricio,Mauritania,Micronesia,Moldavia,Mónaco,Mongolia,Montenegro,Mozambique,Myanmar,Namibia,Nauru,Nepal," +
    "Nicaragua,Níger,Nigeria,Noruega,Nueva Zelanda,Omán,Países Bajos,Pakistán,Palaos,Palestina,Papúa Nueva Guinea," +
    "Paraguay,Polonia,Portugal,Puerto Rico,Reino Unido,República Centroafricana,República Checa,República del Congo," +
    "República Democrática del Congo,República Dominicana,Ruanda,Rumania,Rusia,Samoa,San Cristóbal y Nieves," +
    "San Marino,San Vicente y las Granadinas,Santa Lucía,Santo Tomé y Príncipe,Senegal,Serbia,Seychelles," +
    "Sierra Leona,Singapur,Siria,Somalia,Sri Lanka,Sudáfrica,Sudán,Sudán del Sur,Suecia,Suiza,Surinam,Tailandia," +
    "Tanzania,Tayikistán,Timor Oriental,Togo,Tonga,Trinidad y Tobago,Túnez,Turkmenistán,Turquía,Tuvalu,Ucrania," +
    "Uganda,Uruguay,Uzbekistán,Vanuatu,Vaticano,Vietnam,Yemen,Yibuti,Zambia,Zimbabue").split(",");

  // Convocatorias del Campus 2026 (las mismas de la herramienta de diagnóstico).
  var CONVOCATORIAS = ["Colombia", "España", "Europa", "Norteamérica", "Australia", "Cono Sur", "Venezuela",
    "México", "Panamá", "Perú", "Ecuador"];

  function conGrupo(grupo, nombres) {
    return nombres.map(function (n) { return { v: n, t: n, g: grupo }; });
  }

  E.DATOS = {
    cursos: Object.keys(CURSOS).reduce(function (acc, g) { return acc.concat(conGrupo(g, CURSOS[g])); }, []),
    paises: conGrupo("Más frecuentes", FRECUENTES).concat(conGrupo("Otros países", OTROS)),
    convocatorias: CONVOCATORIAS.map(function (n) { return { v: n, t: n }; })
  };
})(window.Enc);
