/* ============================================================
   Encuesta de Satisfacción 2026 · Profesores Campus — PROTOTIPO
   base.js: utilidades compartidas (crear nodos e íconos SVG).
   Todos los archivos cuelgan de window.Enc para funcionar sin
   módulos: así la página abre igual en GitHub Pages y con doble clic.
   ============================================================ */
window.Enc = window.Enc || {};

(function (E) {
  "use strict";

  /** Crea un nodo: h("div", { class: "x", onclick: fn }, hijo1, "texto"). */
  E.h = function (etiqueta, attrs) {
    var el = document.createElement(etiqueta);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v === false || v === null || v === undefined) return;
      if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    });
    for (var i = 2; i < arguments.length; i++) agregar(el, arguments[i]);
    return el;
  };
  function agregar(el, hijo) {
    if (hijo === null || hijo === undefined || hijo === false) return;
    if (Array.isArray(hijo)) return hijo.forEach(function (x) { agregar(el, x); });
    el.appendChild(hijo.nodeType ? hijo : document.createTextNode(String(hijo)));
  }

  /** Texto sin tildes ni mayúsculas, para buscar. */
  E.norm = function (s) {
    return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  };

  // Íconos de trazo (24×24). Se pintan con currentColor.
  var TRAZOS = {
    check: '<path d="M20 6L9 17l-5-5"/>',
    chevron: '<path d="M6 9l6 6 6-6"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    alerta: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    buscar: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>',
    reloj: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    candado: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    lista: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    derecha: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    izquierda: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    reiniciar: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    prueba: '<path d="M9 3h6M10 3v6L4.5 19a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 9V3"/>',
    // Secciones
    persona: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    birrete: '<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5"/>',
    libro: '<path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/>',
    video: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3z"/>',
    equipo: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    pantalla: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    mensaje: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/>'
  };
  E.icono = function (nombre, tam) {
    var t = tam || 20;
    return '<svg class="ico" width="' + t + '" height="' + t + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + TRAZOS[nombre] + "</svg>";
  };
})(window.Enc);
