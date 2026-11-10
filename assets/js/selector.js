/* ============================================================
   selector.js: lista desplegable propia (reemplaza al <select> nativo).
   - Computador: panel bajo el campo, con buscador opcional.
   - Celular: hoja que sube desde abajo, con opciones grandes.
   - Teclado: Enter/Espacio/flechas abren; flechas, Inicio y Fin recorren;
     Enter elige; Esc cierra; al escribir se salta a la opción.
   Uso: E.crearSelector({ id, titulo, etiquetaId, placeholder, opciones:
        [{ v, t, g? }], buscable, buscarPh, unidad: [singular, plural], valor, alElegir }).
   ============================================================ */
(function (E) {
  "use strict";
  var h = E.h;
  var abierto = null; // solo puede haber uno abierto

  function esCelular() { return window.matchMedia("(max-width: 640px)").matches; }

  E.crearSelector = function (cfg) {
    var valor = cfg.valor || "";
    var visibles = [];   // opciones tras filtrar
    var activo = -1;     // índice dentro de `visibles`
    var panel = null, lista = null, buscador = null, fondo = null, conteo = null;
    var tecleo = "", tecleoT = 0;
    var haciaArriba = null; // se decide una vez, al abrir
    var idLista = "sel-" + cfg.id + "-lista";

    var txt = h("span", { class: "sel-valor" });
    var boton = h("button", {
      type: "button", class: "sel-boton", id: "sel-" + cfg.id,
      "aria-haspopup": "listbox", "aria-expanded": "false",
      "aria-labelledby": cfg.etiquetaId + " sel-" + cfg.id,
      onclick: function () { panel ? cerrar(true) : abrir(); },
      onkeydown: function (ev) {
        if (ev.key === "ArrowDown" || ev.key === "ArrowUp") { ev.preventDefault(); if (!panel) abrir(); }
      }
    }, txt, h("span", { class: "sel-flecha", html: E.icono("chevron", 18) }));
    var raiz = h("div", { class: "sel" }, boton);

    function pintarValor() {
      var o = cfg.opciones.filter(function (x) { return x.v === valor; })[0];
      txt.textContent = o ? o.t : cfg.placeholder;
      txt.classList.toggle("sel-vacio", !o);
      boton.classList.toggle("con-valor", !!o);
    }

    function filtrar(q) {
      var n = E.norm(q || "").trim();
      visibles = cfg.opciones.filter(function (o) { return !n || E.norm(o.t).indexOf(n) !== -1; });
      lista.innerHTML = "";
      var grupo = null;
      visibles.forEach(function (o, i) {
        if (o.g && o.g !== grupo) {
          grupo = o.g;
          lista.appendChild(h("li", { class: "sel-grupo", role: "presentation" }, grupo));
        }
        lista.appendChild(h("li", {
          class: "sel-op" + (o.v === valor ? " elegida" : ""), role: "option", id: idLista + "-" + i,
          "aria-selected": o.v === valor ? "true" : "false", "data-i": i,
          onclick: function () { elegir(i); },
          onmousemove: function () { if (activo !== i) marcar(i, false); }
        }, h("span", { class: "sel-op-txt" }, o.t), h("span", { class: "sel-op-ok", html: E.icono("check", 18) })));
      });
      if (!visibles.length) {
        lista.appendChild(h("li", { class: "sel-nada", role: "presentation" },
          h("b", {}, "Sin resultados"), "Revisa la escritura o prueba con otra palabra."));
      }
      if (conteo) {
        conteo.textContent = visibles.length + " " + cfg.unidad[visibles.length === 1 ? 0 : 1];
      }
      if (panel) ubicar(); // la altura cambió: si abre hacia arriba, hay que volver a pegarla al campo
      var sel = visibles.map(function (o) { return o.v; }).indexOf(valor);
      marcar(n ? (visibles.length ? 0 : -1) : sel, true);
    }

    function marcar(i, desplazar) {
      activo = i;
      var foco = buscador || lista;
      [].forEach.call(lista.querySelectorAll(".sel-op"), function (li) {
        li.classList.toggle("activa", Number(li.getAttribute("data-i")) === i);
      });
      if (i < 0) { foco.removeAttribute("aria-activedescendant"); return; }
      foco.setAttribute("aria-activedescendant", idLista + "-" + i);
      if (desplazar) { // se desplaza solo la lista, nunca la página
        var li = document.getElementById(idLista + "-" + i);
        if (!li) return;
        var arriba = li.offsetTop - lista.offsetTop, abajo = arriba + li.offsetHeight;
        if (arriba < lista.scrollTop) lista.scrollTop = arriba - 6;
        else if (abajo > lista.scrollTop + lista.clientHeight) lista.scrollTop = abajo - lista.clientHeight + 6;
      }
    }

    function elegir(i) {
      var o = visibles[i];
      if (!o) return;
      valor = o.v;
      pintarValor();
      cerrar(true);
      cfg.alElegir(valor);
    }

    function teclas(ev) {
      var n = visibles.length;
      if (ev.key === "ArrowDown") { ev.preventDefault(); if (n) marcar((activo + 1) % n, true); }
      else if (ev.key === "ArrowUp") { ev.preventDefault(); if (n) marcar((activo - 1 + n) % n, true); }
      else if (ev.key === "Home" && !buscador) { ev.preventDefault(); if (n) marcar(0, true); }
      else if (ev.key === "End" && !buscador) { ev.preventDefault(); if (n) marcar(n - 1, true); }
      else if (ev.key === "Enter" || (ev.key === " " && !buscador)) { ev.preventDefault(); if (activo >= 0) elegir(activo); }
      else if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); cerrar(true); }
      else if (ev.key === "Tab") { cerrar(true); }
      else if (!buscador && ev.key.length === 1) { // salto por letra en listas sin buscador
        clearTimeout(tecleoT);
        tecleo += E.norm(ev.key);
        tecleoT = setTimeout(function () { tecleo = ""; }, 600);
        for (var k = 0; k < n; k++) {
          if (E.norm(visibles[k].t).indexOf(tecleo) === 0) { marcar(k, true); break; }
        }
      }
    }

    function ubicar() {
      if (esCelular()) { panel.classList.add("hoja"); panel.style.cssText = ""; return; }
      panel.classList.remove("hoja");
      var r = boton.getBoundingClientRect();
      var alto = panel.offsetHeight;
      if (haciaArriba === null) {
        var abajo = window.innerHeight - r.bottom;
        haciaArriba = abajo < alto + 16 && r.top > abajo;
      }
      panel.style.left = (r.left + window.scrollX) + "px";
      panel.style.width = r.width + "px";
      panel.style.top = (haciaArriba ? r.top + window.scrollY - alto - 6 : r.bottom + window.scrollY + 6) + "px";
    }

    function clicFuera(ev) {
      if (panel && !panel.contains(ev.target) && !raiz.contains(ev.target)) cerrar(false);
    }
    function alRedimensionar() { if (panel) cerrar(false); }

    function abrir() {
      if (abierto) abierto(false);
      lista = h("ul", { class: "sel-lista", role: "listbox", id: idLista, "aria-labelledby": cfg.etiquetaId, tabindex: "-1" });
      buscador = cfg.buscable ? h("input", {
        class: "sel-buscar", type: "text", placeholder: cfg.buscarPh || "Buscar…", autocomplete: "off", spellcheck: "false",
        role: "combobox", "aria-expanded": "true", "aria-controls": idLista, "aria-autocomplete": "list",
        "aria-label": cfg.buscarPh || "Buscar", enterkeyhint: "search",
        oninput: function () { filtrar(buscador.value); }
      }) : null;
      conteo = cfg.buscable ? h("p", { class: "sel-conteo", "aria-live": "polite" }) : null;
      panel = h("div", { class: "sel-panel", onkeydown: teclas },
        h("div", { class: "sel-cab" },
          h("span", { class: "sel-titulo" }, cfg.titulo),
          h("button", { type: "button", class: "sel-cerrar", "aria-label": "Cerrar la lista", html: E.icono("x", 18), onclick: function () { cerrar(true); } })),
        buscador ? h("div", { class: "sel-buscar-caja" }, h("span", { class: "sel-lupa", html: E.icono("buscar", 18) }), buscador) : null,
        conteo, lista);
      fondo = h("div", { class: "sel-fondo", onclick: function () { cerrar(false); } });
      document.body.appendChild(fondo);
      document.body.appendChild(panel);
      filtrar("");
      boton.setAttribute("aria-expanded", "true");
      boton.classList.add("abierto");
      if (esCelular()) document.documentElement.classList.add("sin-scroll");
      // En celular no se enfoca el buscador: el teclado taparía la lista.
      (buscador && !esCelular() ? buscador : lista).focus({ preventScroll: true });
      marcar(activo, true);
      abierto = cerrar;
      setTimeout(function () {
        document.addEventListener("mousedown", clicFuera);
        window.addEventListener("resize", alRedimensionar);
      }, 0);
    }

    function cerrar(devolverFoco) {
      if (!panel) return;
      document.removeEventListener("mousedown", clicFuera);
      window.removeEventListener("resize", alRedimensionar);
      panel.remove(); fondo.remove();
      panel = lista = buscador = fondo = conteo = null;
      haciaArriba = null;
      abierto = null;
      document.documentElement.classList.remove("sin-scroll");
      boton.setAttribute("aria-expanded", "false");
      boton.classList.remove("abierto");
      if (devolverFoco) boton.focus({ preventScroll: true });
    }

    pintarValor();
    return { el: raiz, boton: boton };
  };

  /** Cierra la lista abierta, si hay (al cambiar de sección). */
  E.cerrarSelector = function () { if (abierto) abierto(false); };
})(window.Enc);
