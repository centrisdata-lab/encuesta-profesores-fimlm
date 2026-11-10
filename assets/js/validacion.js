/* ============================================================
   validacion.js: reglas de cada tipo de pregunta.
   - E.errores(p):   [{ campo, msg }] con lo que falta o está mal.
   - E.unidades(p):  campos obligatorios que cuentan para el progreso.
   - E.resumen(p):   [{ etiqueta, valor }] para la pantalla final.
   ============================================================ */
(function (E) {
  "use strict";

  /** Opciones elegidas: una sola, o varias en selección múltiple. */
  E.elegidas = function (p) { return p.tipo === "multiple" ? E.lista(p.id) : (E.tiene(p.id) ? [E.r(p.id)] : []); };

  /** Detalles que piden las opciones elegidas (p. ej. "Otro" -> "¿Cuál?"). */
  E.detallesActivos = function (p) {
    var elegidas = E.elegidas(p);
    return (p.detalles || []).filter(function (d) { return elegidas.indexOf(d.si) !== -1; });
  };
  E.campoDetalle = function (p, d) { return p.id + "_" + d.campo; };

  /** ¿Aplica la pregunta de seguimiento (p. ej. la de P2)? */
  E.aplicaSeguimiento = function (p) {
    return !!p.seguimiento && p.seguimiento.mostrarSi.indexOf(E.r(p.id)) !== -1;
  };

  E.errores = function (p) {
    var e = [];
    function falta(campo, msg) { if (!E.tiene(campo)) e.push({ campo: campo, msg: msg }); }

    switch (p.tipo) {
      case "texto":
        if (p.requerida) falta(p.id, p.error);
        if (E.tiene(p.id) && p.minPalabras && E.r(p.id).trim().split(/\s+/).length < p.minPalabras) {
          e.push({ campo: p.id, msg: p.errorFormato });
        }
        break;
      case "paisCiudad":
        if (p.requerida) {
          falta(p.id + "_pais", "Selecciona tu país de residencia.");
          falta(p.id + "_ciudad", "Escribe tu ciudad de residencia.");
        }
        break;
      case "desplegable":
      case "unica":
      case "multiple":
        if (p.requerida) falta(p.id, p.error);
        E.detallesActivos(p).forEach(function (d) { falta(E.campoDetalle(p, d), d.error); });
        break;
      case "grupoEscala":
        p.items.forEach(function (it) { falta(it.id, p.error); });
        break;
      case "abierta":
        if (p.requerida) falta(p.id, p.error);
        break;
      default: // escala, nps, sino
        if (p.requerida) falta(p.id, p.error);
    }
    return e;
  };

  E.unidades = function (p) {
    if (!p.requerida) return [];
    if (p.tipo === "paisCiudad") return [p.id + "_pais", p.id + "_ciudad"];
    if (p.tipo === "grupoEscala") return p.items.map(function (it) { return it.id; });
    return [p.id];
  };

  /** La pregunta tiene respuesta y no le falta nada. */
  E.completa = function (p) {
    if (E.errores(p).length) return false;
    if (p.tipo === "paisCiudad") return E.tiene(p.id + "_pais");
    if (p.tipo === "grupoEscala") return true;
    return E.tiene(p.id);
  };

  E.erroresSeccion = function (s) {
    return s.preguntas.reduce(function (acc, p) { return acc.concat(E.errores(p)); }, []);
  };

  /** Avance sobre las respuestas obligatorias de toda la encuesta. */
  E.progreso = function () {
    var total = 0, hechas = 0;
    E.ENCUESTA.secciones.forEach(function (s) {
      s.preguntas.forEach(function (p) {
        E.unidades(p).forEach(function (campo) { total++; if (E.tiene(campo)) hechas++; });
      });
    });
    return { total: total, hechas: hechas, pct: total ? Math.round(hechas * 100 / total) : 0 };
  };

  function textoEscala(v) {
    if (v === "NA") return "No aplica";
    var o = E.ESCALA.filter(function (x) { return x.v === v; })[0];
    return o ? v + " · " + o.t : "";
  }

  E.resumen = function (p) {
    var sinDato = "Sin respuesta";
    switch (p.tipo) {
      case "paisCiudad":
        return [{ etiqueta: p.texto, valor: [E.r(p.id + "_ciudad").trim(), E.r(p.id + "_pais")].filter(Boolean).join(", ") || sinDato }];
      case "desplegable":
      case "unica":
      case "multiple":
        var activos = E.detallesActivos(p);
        var textos = E.elegidas(p).map(function (v) {
          var d = activos.filter(function (x) { return x.si === v; })[0];
          return d ? v + ": " + E.r(E.campoDetalle(p, d)).trim() : v;
        });
        return [{ etiqueta: p.texto, valor: textos.join("; ") || sinDato }];
      case "escala":
        var filas = [{ etiqueta: p.texto, valor: textoEscala(E.r(p.id)) || sinDato }];
        if (E.aplicaSeguimiento(p)) filas.push({ etiqueta: p.seguimiento.texto, valor: E.r(p.seguimiento.id).trim() || sinDato, sub: true });
        return filas;
      case "grupoEscala":
        return p.items.map(function (it) {
          return { etiqueta: it.cod + ". " + it.titulo, valor: textoEscala(E.r(it.id)) || sinDato };
        });
      case "nps":
        return [{ etiqueta: p.texto, valor: E.tiene(p.id) ? E.r(p.id) + " de 10" : sinDato }];
      default:
        return [{ etiqueta: p.texto, valor: E.r(p.id).trim() || sinDato }];
    }
  };
})(window.Enc);
