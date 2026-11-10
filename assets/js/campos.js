/* ============================================================
   campos.js: dibuja cada tipo de pregunta con su control.
   E.pintarPregunta(p) devuelve el nodo listo para insertar.
   Las opciones usan <input type="radio"> reales (ocultos a la vista):
   así funcionan con teclado y lectores de pantalla sin código extra.
   ============================================================ */
(function (E) {
  "use strict";
  var h = E.h;

  // campo → { caja, err, foco }: dónde mostrar su error y qué enfocar
  E.registro = {};

  function nodoError(campo) {
    return h("p", { class: "error", id: "err-" + campo, hidden: true });
  }
  function registrar(campo, caja, err, foco) { E.registro[campo] = { caja: caja, err: err, foco: foco }; }

  E.mostrarError = function (campo, msg) {
    var r = E.registro[campo];
    if (!r) return;
    r.err.innerHTML = E.icono("alerta", 16) + "<span></span>";
    r.err.lastChild.textContent = msg;
    r.err.hidden = false;
    r.caja.classList.add("con-error");
  };
  E.limpiarError = function (campo) {
    var r = E.registro[campo];
    if (!r) return;
    r.err.hidden = true;
    r.caja.classList.remove("con-error");
  };

  /** Tras cada respuesta: quita el error si ya está bien, marca la pregunta y avisa a la app. */
  function alResponder(p, campo) {
    var pendientes = E.errores(p).map(function (e) { return e.campo; });
    if (pendientes.indexOf(campo) === -1) E.limpiarError(campo);
    var nodo = document.getElementById("q-" + p.id);
    if (nodo) nodo.classList.toggle("respondida", E.completa(p));
    if (E.alCambiar) E.alCambiar();
  }

  // ── Piezas comunes ─────────────────────────────────────────
  function marca(p) {
    return p.requerida
      ? h("span", { class: "req", title: "Obligatoria" }, h("span", { "aria-hidden": "true" }, "*"), h("span", { class: "solo-lector" }, " (obligatoria)"))
      : h("span", { class: "opc" }, "Opcional");
  }

  function marco(p, titulo, cuerpo) {
    return h("section", { class: "pregunta" + (E.completa(p) ? " respondida" : ""), id: "q-" + p.id },
      h("div", { class: "preg-cab" },
        h("span", { class: "preg-num", "aria-hidden": "true" },
          h("span", { class: "preg-num-txt" }, p.cod), h("span", { class: "preg-num-ok", html: E.icono("check", 16) })),
        h("div", { class: "preg-enunciado" },
          h("h3", { class: "preg-titulo", id: "t-" + p.id }, titulo, " ", marca(p)),
          p.ayuda ? h("p", { class: "preg-ayuda", id: "a-" + p.id }, p.ayuda) : null)),
      h("div", { class: "preg-cuerpo" }, cuerpo));
  }

  function describe(p, campo) { return (p.ayuda ? "a-" + p.id + " " : "") + "err-" + campo; }

  /** Grupo de radios. opciones: [{ v, nodo }] donde nodo es el contenido visible de la tarjeta. */
  function radios(campo, clase, etiquetaId, opciones, alCambiar) {
    var grupo = h("div", { class: clase, role: "radiogroup", "aria-labelledby": etiquetaId, "aria-describedby": "err-" + campo });
    opciones.forEach(function (o, i) {
      var inp = h("input", {
        type: "radio", name: campo, id: "r-" + campo + "-" + i, value: o.v, class: "radio-oculto",
        onchange: function () { E.fijar(campo, o.v); alCambiar(o.v); }
      });
      inp.checked = E.r(campo) === o.v;
      grupo.appendChild(h("label", { class: "tarjeta " + (o.clase || "") }, inp, h("span", { class: "tarjeta-caja" }, o.nodo)));
    });
    return grupo;
  }
  function primerRadio(grupo) {
    return function () { (grupo.querySelector("input:checked") || grupo.querySelector("input")).focus(); };
  }

  function entradaTexto(campo, attrs, alEscribir) {
    var inp = h("input", Object.assign({
      class: "entrada", type: "text", id: "in-" + campo, maxlength: "120",
      oninput: function () { E.fijar(campo, inp.value); alEscribir(); }
    }, attrs));
    inp.value = E.r(campo);
    return inp;
  }

  function areaTexto(campo, attrs, alEscribir) {
    var max = 1200;
    var cuenta = h("span", { class: "contador", "aria-hidden": "true" });
    var ta = h("textarea", Object.assign({
      class: "entrada area", id: "in-" + campo, rows: "4", maxlength: String(max),
      oninput: function () { E.fijar(campo, ta.value); contar(); alEscribir(); }
    }, attrs));
    ta.value = E.r(campo);
    function contar() { cuenta.textContent = ta.value.length + " / " + max; }
    contar();
    return { ta: ta, caja: h("div", { class: "area-caja" }, ta, cuenta) };
  }

  /** Campos que aparecen según la opción elegida (p. ej. "Otro" -> "¿Cuál?").
      Lo escrito se conserva aunque se cambie de opción y se vuelva. */
  function camposDetalle(p) {
    var items = (p.detalles || []).map(function (d) {
      var campo = E.campoDetalle(p, d);
      var err = nodoError(campo);
      var inp = entradaTexto(campo, { placeholder: d.ph, "aria-describedby": "err-" + campo }, function () { alResponder(p, campo); });
      var caja = h("div", { class: "condicional", hidden: E.detalle(p) !== d },
        h("label", { class: "sub-etiqueta", for: "in-" + campo }, d.etiqueta, " ", h("span", { class: "req", "aria-hidden": "true" }, "*")),
        inp, err);
      registrar(campo, caja, err, function () { inp.focus(); });
      return { d: d, campo: campo, caja: caja, inp: inp };
    });
    return {
      cajas: items.map(function (x) { return x.caja; }),
      actualizar: function (enfocar) {
        var activo = E.detalle(p);
        items.forEach(function (x) {
          var ver = x.d === activo;
          if (x.caja.hidden === !ver) return;
          x.caja.hidden = !ver;
          if (!ver) E.limpiarError(x.campo);
          else if (enfocar) x.inp.focus({ preventScroll: false });
        });
      }
    };
  }

  // ── Escala de acuerdo 1 a 5 ────────────────────────────────
  function escala(campo, etiquetaId, na, alCambiar) {
    var ops = E.ESCALA.map(function (o) {
      return { v: o.v, nodo: [h("span", { class: "esc-num" }, o.v), h("span", { class: "esc-txt" }, o.t)] };
    });
    if (na) ops.push({ v: "NA", clase: "esc-na", nodo: [h("span", { class: "esc-num", "aria-hidden": "true" }, "–"), h("span", { class: "esc-txt" }, na)] });
    return radios(campo, "escala" + (na ? " con-na" : ""), etiquetaId, ops, alCambiar);
  }

  // ── Un pintor por tipo ─────────────────────────────────────
  var PINTORES = {
    texto: function (p) {
      var err = nodoError(p.id);
      var inp = entradaTexto(p.id, {
        placeholder: p.placeholder, autocomplete: p.autocomplete || "off", "aria-required": String(!!p.requerida),
        "aria-describedby": describe(p, p.id),
        // El formato se revisa al salir del campo, y solo si ya escribió algo.
        onblur: function () {
          var e = E.tiene(p.id) ? E.errores(p)[0] : null;
          if (e) E.mostrarError(e.campo, e.msg);
        }
      }, function () { alResponder(p, p.id); });
      var cuerpo = h("div", {}, inp, err);
      registrar(p.id, cuerpo, err, function () { inp.focus(); });
      return marco(p, h("label", { for: "in-" + p.id }, p.texto), cuerpo);
    },

    paisCiudad: function (p) {
      var cPais = p.id + "_pais", cCiudad = p.id + "_ciudad";
      var errPais = nodoError(cPais), errCiudad = nodoError(cCiudad);
      var sel = E.crearSelector({
        id: cPais, titulo: "País de residencia", etiquetaId: "l-" + cPais, placeholder: "Selecciona tu país",
        opciones: E.DATOS.paises, buscable: true, buscarPh: "Buscar país…", unidad: ["país", "países"], valor: E.r(cPais),
        alElegir: function (v) { E.fijar(cPais, v); alResponder(p, cPais); }
      });
      var ciudad = entradaTexto(cCiudad, { placeholder: "Ej.: Medellín", autocomplete: "address-level2", "aria-describedby": "err-" + cCiudad },
        function () { alResponder(p, cCiudad); });
      var cajaPais = h("div", { class: "subcampo" }, h("span", { class: "sub-etiqueta", id: "l-" + cPais }, "País"), sel.el, errPais);
      var cajaCiudad = h("div", { class: "subcampo" }, h("label", { class: "sub-etiqueta", for: "in-" + cCiudad }, "Ciudad"), ciudad, errCiudad);
      registrar(cPais, cajaPais, errPais, function () { sel.boton.focus(); });
      registrar(cCiudad, cajaCiudad, errCiudad, function () { ciudad.focus(); });
      return marco(p, p.texto, h("div", { class: "dos-campos" }, cajaPais, cajaCiudad));
    },

    desplegable: function (p) {
      var err = nodoError(p.id);
      var det = camposDetalle(p);
      var sel = E.crearSelector({
        id: p.id, titulo: p.placeholder, etiquetaId: "t-" + p.id, placeholder: p.placeholder,
        opciones: p.opciones || E.DATOS[p.fuente], buscable: !!p.buscable, buscarPh: p.buscarPh, unidad: p.unidad || ["opción", "opciones"],
        valor: E.r(p.id),
        alElegir: function (v) { E.fijar(p.id, v); det.actualizar(true); alResponder(p, p.id); }
      });
      var cuerpo = h("div", {}, sel.el, err, det.cajas);
      registrar(p.id, cuerpo, err, function () { sel.boton.focus(); });
      return marco(p, p.texto, cuerpo);
    },

    unica: function (p) {
      var err = nodoError(p.id);
      var det = camposDetalle(p);
      var grupo = radios(p.id, "opciones cols-" + (p.columnas || 1), "t-" + p.id,
        p.opciones.map(function (o) {
          return { v: o.v, nodo: [h("span", { class: "radio-punto", "aria-hidden": "true" }), h("span", { class: "tarjeta-txt" }, o.t)] };
        }),
        function () { det.actualizar(true); alResponder(p, p.id); });
      var cuerpo = h("div", {}, grupo, err, det.cajas);
      registrar(p.id, cuerpo, err, primerRadio(grupo));
      return marco(p, p.texto, cuerpo);
    },

    escala: function (p) {
      var err = nodoError(p.id);
      var seg = null;
      if (p.seguimiento) {
        var s = p.seguimiento;
        var area = areaTexto(s.id, { placeholder: s.placeholder }, function () {});
        seg = h("div", { class: "condicional", hidden: !E.aplicaSeguimiento(p) },
          h("label", { class: "sub-etiqueta", for: "in-" + s.id }, s.texto, " ", h("span", { class: "opc" }, "Opcional")), area.caja);
      }
      var grupo = escala(p.id, "t-" + p.id, p.na, function () {
        if (seg) seg.hidden = !E.aplicaSeguimiento(p);
        alResponder(p, p.id);
      });
      var cuerpo = h("div", {}, grupo, err, seg);
      registrar(p.id, cuerpo, err, primerRadio(grupo));
      return marco(p, p.texto, cuerpo);
    },

    grupoEscala: function (p) {
      var items = p.items.map(function (it) {
        var err = nodoError(it.id);
        var grupo = escala(it.id, "t-" + it.id, null, function () {
          caja.classList.add("lista");
          alResponder(p, it.id);
        });
        var caja = h("div", { class: "subpregunta" + (E.tiene(it.id) ? " lista" : ""), id: "q-" + it.id },
          h("h4", { class: "sub-titulo", id: "t-" + it.id },
            h("span", { class: "sub-cod", "aria-hidden": "true" }, it.cod),
            h("span", {}, h("b", {}, it.titulo + ": "), it.texto)),
          grupo, err);
        registrar(it.id, caja, err, primerRadio(grupo));
        return caja;
      });
      return marco(p, p.texto, h("div", { class: "subpreguntas" }, items));
    },

    abierta: function (p) {
      var area = areaTexto(p.id, { placeholder: p.placeholder }, function () { alResponder(p, p.id); });
      return marco(p, h("label", { for: "in-" + p.id }, p.texto), area.caja);
    },

    nps: function (p) {
      var err = nodoError(p.id);
      var ops = [];
      for (var i = 0; i <= 10; i++) {
        var extremo = i === 0 ? p.min : (i === 10 ? p.max : "");
        ops.push({ v: String(i), nodo: [String(i), extremo ? h("span", { class: "solo-lector" }, ", " + extremo) : null] });
      }
      var grupo = radios(p.id, "nps", "t-" + p.id, ops, function () { alResponder(p, p.id); });
      var cuerpo = h("div", {}, grupo,
        h("div", { class: "nps-extremos", "aria-hidden": "true" },
          h("span", {}, h("b", {}, "0"), " " + p.min), h("span", {}, h("b", {}, "10"), " " + p.max)),
        err);
      registrar(p.id, cuerpo, err, primerRadio(grupo));
      return marco(p, p.texto, cuerpo);
    },

    sino: function (p) {
      var err = nodoError(p.id);
      var grupo = radios(p.id, "opciones cols-2 sino", "t-" + p.id,
        ["Sí", "No"].map(function (t) {
          return { v: t, nodo: [h("span", { class: "radio-punto", "aria-hidden": "true" }), h("span", { class: "tarjeta-txt" }, t)] };
        }),
        function () { alResponder(p, p.id); });
      var cuerpo = h("div", {}, grupo, err);
      registrar(p.id, cuerpo, err, primerRadio(grupo));
      return marco(p, p.texto, cuerpo);
    }
  };

  E.pintarPregunta = function (p) { return PINTORES[p.tipo](p); };
})(window.Enc);
