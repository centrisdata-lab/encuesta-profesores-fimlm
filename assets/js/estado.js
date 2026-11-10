/* ============================================================
   estado.js: respuestas y avance, guardados en este navegador
   (localStorage) para no perderlos al recargar. Nada sale del equipo.
   ============================================================ */
(function (E) {
  "use strict";

  var CLAVE = "encuesta-profesores-2026-prototipo";

  function vacio() {
    // paso: "inicio" | índice de sección (0…n-1) | "fin"
    return { v: 1, paso: "inicio", respuestas: {}, completadas: [], actualizado: null };
  }

  E.estado = vacio();

  E.cargar = function () {
    try {
      var d = JSON.parse(localStorage.getItem(CLAVE) || "null");
      if (d && d.v === 1 && d.respuestas && typeof d.respuestas === "object") {
        E.estado = d;
        if (!Array.isArray(E.estado.completadas)) E.estado.completadas = [];
      }
    } catch (e) { /* sin almacenamiento (modo privado, bloqueado…): la encuesta funciona igual */ }
  };

  E.guardar = function () {
    E.estado.actualizado = new Date().toISOString();
    try { localStorage.setItem(CLAVE, JSON.stringify(E.estado)); } catch (e) { /* ver E.cargar */ }
  };

  E.reiniciar = function () {
    E.estado = vacio();
    try { localStorage.removeItem(CLAVE); } catch (e) { /* ver E.cargar */ }
  };

  /** Valor de una respuesta ("" si no hay). */
  E.r = function (campo) {
    var v = E.estado.respuestas[campo];
    return v === undefined || v === null ? "" : String(v);
  };

  /** ¿Hay algo escrito o elegido en ese campo? */
  E.tiene = function (campo) { return E.r(campo).trim() !== ""; };

  /** Respuesta de selección múltiple como lista (acepta un valor suelto guardado antes). */
  E.lista = function (campo) {
    var v = E.estado.respuestas[campo];
    if (Array.isArray(v)) return v.slice();
    return v === undefined || v === null || v === "" ? [] : [String(v)];
  };

  E.fijar = function (campo, valor) {
    var vacio = valor === "" || valor === null || valor === undefined || (Array.isArray(valor) && !valor.length);
    if (vacio) delete E.estado.respuestas[campo];
    else E.estado.respuestas[campo] = valor;
    E.guardar();
  };

  E.hayRespuestas = function () { return Object.keys(E.estado.respuestas).length > 0; };
})(window.Enc);
