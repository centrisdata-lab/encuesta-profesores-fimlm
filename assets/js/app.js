/* ============================================================
   app.js: pantallas y navegación.
   Bienvenida → secciones A…G (una por pantalla) → agradecimiento.
   No envía nada: es un prototipo de visualización y prueba.
   ============================================================ */
(function (E) {
  "use strict";
  var h = E.h;
  var S = E.ENCUESTA.secciones;
  var vista, progreso, vivo, tostada, tostadaT;
  var actualizarFaltan = null; // solo existe mientras se ve una sección

  // ── Estado de avance ───────────────────────────────────────
  function hecha(i) { return E.estado.completadas.indexOf(i) !== -1 && E.erroresSeccion(S[i]).length === 0; }
  function todasHechas() { return S.every(function (_, i) { return hecha(i); }); }
  /** Sección más avanzada a la que se puede entrar: la primera sin completar. */
  function alcanzable() {
    for (var i = 0; i < S.length; i++) if (!hecha(i)) return i;
    return S.length - 1;
  }
  function nombrePaso(paso) {
    return paso === "inicio" ? "inicio" : paso === "fin" ? "gracias" : "seccion-" + S[paso].letra.toLowerCase();
  }
  /** Corrige un paso guardado o del historial que ya no sea válido. */
  function pasoValido(paso) {
    if (paso === "fin") return todasHechas() ? "fin" : alcanzable();
    if (typeof paso === "number" && paso >= 0 && paso < S.length) return Math.min(paso, alcanzable());
    return "inicio";
  }

  function irA(paso, conHistorial) {
    E.cerrarSelector();
    E.estado.paso = paso;
    E.guardar();
    if (conHistorial !== false) {
      try { history.pushState({ paso: paso }, "", "#" + nombrePaso(paso)); } catch (e) { /* file:// en algunos navegadores */ }
    }
    pintar();
    window.scrollTo(0, 0);
    var titulo = vista.querySelector("[data-foco]");
    if (titulo) titulo.focus({ preventScroll: true });
  }

  function avisar(msg) { vivo.textContent = ""; setTimeout(function () { vivo.textContent = msg; }, 50); }

  function tostar(msg) {
    tostada.innerHTML = E.icono("check", 18) + "<span></span>";
    tostada.lastChild.textContent = msg;
    tostada.classList.add("ver");
    clearTimeout(tostadaT);
    tostadaT = setTimeout(function () { tostada.classList.remove("ver"); }, 2600);
  }

  function boton(clase, contenido, alClic, attrs) {
    return h("button", Object.assign({ type: "button", class: "btn " + clase, onclick: alClic }, attrs || {}), contenido);
  }
  function conIcono(texto, icono, antes) {
    var i = h("span", { class: "btn-ico", html: E.icono(icono, 18) });
    return antes ? [i, texto] : [texto, i];
  }

  // ── Barra de progreso (fija arriba durante las secciones) ──
  function pintarProgreso() {
    var paso = E.estado.paso;
    progreso.hidden = typeof paso !== "number";
    if (progreso.hidden) return;
    var pr = E.progreso(), tope = alcanzable();
    var pasos = h("ol", { class: "pasos" }, S.map(function (s, i) {
      var estado = i === paso ? "actual" : hecha(i) ? "hecha" : "pendiente";
      var puede = i <= tope && i !== paso;
      return h("li", { class: "paso " + estado },
        h("button", {
          type: "button", class: "paso-btn", disabled: !puede && i !== paso,
          "aria-current": i === paso ? "step" : null,
          "aria-label": "Sección " + s.letra + ": " + s.titulo + (hecha(i) ? " (completada)" : i === paso ? " (actual)" : ""),
          title: s.letra + " · " + s.corto,
          onclick: function () { if (puede) irA(i); }
        }, hecha(i) && i !== paso ? h("span", { html: E.icono("check", 16) }) : s.letra));
    }));
    progreso.innerHTML = "";
    progreso.appendChild(h("div", { class: "progreso-int" },
      h("nav", { "aria-label": "Secciones de la encuesta" }, pasos),
      h("div", { class: "progreso-linea" },
        h("span", { class: "progreso-donde" }, h("b", {}, "Sección " + (paso + 1) + " de " + S.length), " · " + S[paso].corto),
        h("div", {
          class: "barra", role: "progressbar", "aria-label": "Avance de la encuesta",
          "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(pr.pct)
        }, h("div", { class: "barra-relleno", style: "width:" + pr.pct + "%" })),
        h("span", { class: "progreso-pct" }, pr.pct + "%"))));
  }

  // ── Pantalla de bienvenida ─────────────────────────────────
  function pintarInicio() {
    var pr = E.progreso();
    var enCurso = E.hayRespuestas();
    var acciones = enCurso
      ? h("div", { class: "retomar" },
          h("p", {}, h("b", {}, "Tienes una encuesta sin terminar"), " · " + pr.pct + "% completado. Tus respuestas siguen guardadas en este dispositivo."),
          h("div", { class: "fila-botones" },
            boton("primario grande", conIcono("Continuar donde iba", "derecha"), function () { irA(todasHechas() ? "fin" : alcanzable()); }),
            boton("fantasma grande", "Empezar de nuevo", pedirReinicio)))
      : h("div", { class: "fila-botones centro" },
          boton("primario grande", conIcono("Comenzar la encuesta", "derecha"), function () { irA(0); }));

    return h("article", { class: "panel inicio" },
      h("p", { class: "ceja" }, "Campus Virtual · Convocatoria 2026"),
      h("h2", { class: "inicio-titulo", tabindex: "-1", "data-foco": true }, "Estimado(a) profesor(a):"),
      h("p", { class: "inicio-txt" },
        "Tu opinión nos ayuda a mejorar. Gracias a tu voluntariado, nuestros estudiantes siguen aprendiendo. " +
        "Te invitamos a compartir tu experiencia en el Campus Virtual (te tomará solo 5 minutos). " +
        "Tus respuestas son confidenciales y se usarán para seguir fortaleciendo nuestra labor."),
      h("ul", { class: "claves" },
        h("li", {}, h("span", { class: "clave-ico", html: E.icono("reloj", 20) }), h("span", {}, h("b", {}, "5 minutos"), h("small", {}, "aproximadamente"))),
        h("li", {}, h("span", { class: "clave-ico", html: E.icono("lista", 20) }), h("span", {}, h("b", {}, S.length + " secciones"), h("small", {}, "cortas, una a la vez"))),
        h("li", {}, h("span", { class: "clave-ico", html: E.icono("candado", 20) }), h("span", {}, h("b", {}, "Confidencial"), h("small", {}, "tus respuestas son reservadas")))),
      acciones,
      h("div", { class: "mapa" },
        h("h3", { class: "mapa-titulo" }, "Lo que vas a encontrar"),
        h("ol", { class: "mapa-lista" }, S.map(function (s) {
          return h("li", {}, h("span", { class: "mapa-ico", html: E.icono(s.icono, 18) }),
            h("span", {}, h("b", {}, s.letra + " · "), s.titulo));
        }))),
      h("p", { class: "nota-prototipo" }, h("span", { html: E.icono("prueba", 18) }),
        h("span", {}, h("b", {}, "Esto es un prototipo de visualización y prueba. "),
          "No envía información a la Fundación: lo que respondas solo se guarda en este navegador.")));
  }

  // ── Una sección ────────────────────────────────────────────
  function pintarSeccion(i) {
    var s = S[i];
    var ultima = i === S.length - 1;
    var editando = !!E.estado.terminada; // llegó desde "Revisar mis respuestas"
    E.registro = {};
    var faltan = h("div", { class: "faltan", role: "alert", hidden: true });
    function textoFaltan(n, extra) {
      faltan.innerHTML = E.icono("alerta", 18) + "<span></span>";
      faltan.lastChild.textContent = (n === 1 ? "Falta 1 respuesta obligatoria en esta sección." :
        "Faltan " + n + " respuestas obligatorias en esta sección.") + (extra || "");
    }
    // Tras el primer intento de continuar, el aviso sigue la cuenta y se va cuando ya no falta nada.
    actualizarFaltan = function () {
      if (faltan.hidden) return;
      var n = E.erroresSeccion(s).length;
      if (!n) faltan.hidden = true;
      else textoFaltan(n);
    };

    function continuar() {
      var errs = E.erroresSeccion(s);
      Object.keys(E.registro).forEach(E.limpiarError);
      if (errs.length) {
        errs.forEach(function (e) { E.mostrarError(e.campo, e.msg); });
        textoFaltan(errs.length, " Te llevamos a la primera.");
        faltan.hidden = false;
        var r = E.registro[errs[0].campo];
        if (r) {
          r.caja.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
          setTimeout(function () { r.foco(); }, 60);
        }
        return;
      }
      if (E.estado.completadas.indexOf(i) === -1) E.estado.completadas.push(i);
      E.guardar();
      if (ultima || (editando && todasHechas())) {
        E.estado.terminada = new Date().toISOString();
        irA("fin");
        avisar("Encuesta completada.");
      } else {
        irA(i + 1);
        tostar("Sección " + s.letra + " completada");
        avisar("Sección " + s.letra + " completada. Sección " + S[i + 1].letra + ": " + S[i + 1].titulo + ".");
      }
    }

    var textoSeguir = editando ? "Volver al final" : ultima ? "Finalizar la encuesta" : "Continuar";
    return h("article", { class: "panel seccion" },
      h("header", { class: "sec-cab" },
        h("span", { class: "sec-ico", html: E.icono(s.icono, 26) }),
        h("div", {},
          h("p", { class: "ceja" }, "Sección " + s.letra),
          h("h2", { class: "sec-titulo", tabindex: "-1", "data-foco": true }, s.titulo),
          h("p", { class: "sec-sub" }, s.sub))),
      h("p", { class: "leyenda-req" }, h("span", { class: "req", "aria-hidden": "true" }, "*"), " Pregunta obligatoria"),
      h("div", { class: "preguntas" }, s.preguntas.map(E.pintarPregunta)),
      faltan,
      h("div", { class: "nav-seccion" },
        boton("fantasma grande", conIcono("Anterior", "izquierda", true), function () { irA(i === 0 ? "inicio" : i - 1); }),
        boton("primario grande", conIcono(textoSeguir, ultima || editando ? "check" : "derecha"), continuar, { id: "btn-continuar" })),
      h("p", { class: "guardado" }, h("span", { html: E.icono("candado", 14) }),
        "Tus respuestas se guardan automáticamente en este dispositivo."));
  }

  // ── Pantalla final ─────────────────────────────────────────
  function pintarFin() {
    var repaso = h("div", { class: "repaso", id: "repaso", hidden: true }, S.map(function (s, i) {
      return h("section", { class: "repaso-sec" },
        h("div", { class: "repaso-cab" },
          h("h3", {}, h("span", { class: "repaso-letra" }, s.letra), s.titulo),
          boton("enlace", "Editar", function () { irA(i); }, { "aria-label": "Editar la sección " + s.letra })),
        h("dl", {}, s.preguntas.map(function (p) {
          return E.resumen(p).map(function (f) {
            var vacia = f.valor === "Sin respuesta";
            return h("div", { class: "repaso-fila" + (f.sub ? " sub" : "") },
              h("dt", {}, f.etiqueta), h("dd", { class: vacia ? "vacia" : "" }, f.valor));
          });
        })));
    }));
    var btnRepaso = boton("contorno grande", "Revisar mis respuestas", function () {
      repaso.hidden = !repaso.hidden;
      btnRepaso.setAttribute("aria-expanded", String(!repaso.hidden));
      btnRepaso.firstChild.textContent = repaso.hidden ? "Revisar mis respuestas" : "Ocultar mis respuestas";
      if (!repaso.hidden) repaso.scrollIntoView({ block: "start", behavior: "smooth" });
    }, { "aria-expanded": "false", "aria-controls": "repaso" });

    return h("article", { class: "panel fin" },
      h("div", { class: "fin-sello", html: E.icono("check", 44), "aria-hidden": "true" }),
      h("h2", { class: "fin-titulo", tabindex: "-1", "data-foco": true }, "¡Gracias por compartir tu experiencia!"),
      h("p", { class: "fin-txt" }, "Completaste las " + S.length + " secciones de la encuesta. Tu opinión nos ayuda a mejorar y a seguir fortaleciendo nuestra labor."),
      h("p", { class: "nota-prototipo" }, h("span", { html: E.icono("prueba", 18) }),
        h("span", {}, h("b", {}, "Recuerda: esto es un prototipo. "),
          "Tus respuestas no se enviaron a la Fundación; solo quedaron guardadas en este navegador para que revises cómo funciona.")),
      h("div", { class: "fila-botones centro" }, btnRepaso,
        boton("fantasma grande", conIcono("Volver a empezar", "reiniciar", true), pedirReinicio)),
      repaso);
  }

  // ── Reinicio con confirmación ──────────────────────────────
  function pedirReinicio() {
    var dlg = document.getElementById("dlg-reinicio");
    if (!dlg.showModal) { // navegador sin <dialog>
      if (window.confirm("¿Borrar tus respuestas y empezar de nuevo?")) reiniciar();
      return;
    }
    dlg.showModal();
  }
  function reiniciar() {
    E.reiniciar();
    irA("inicio");
    tostar("Respuestas borradas");
  }

  function pintar() {
    var paso = E.estado.paso;
    actualizarFaltan = null;
    vista.innerHTML = "";
    vista.appendChild(paso === "inicio" ? pintarInicio() : paso === "fin" ? pintarFin() : pintarSeccion(paso));
    document.body.setAttribute("data-pantalla", typeof paso === "number" ? "seccion" : paso);
    document.getElementById("btn-reiniciar").hidden = !E.hayRespuestas() || paso === "inicio" || paso === "fin";
    pintarProgreso();
  }

  // ── Arranque ───────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", function () {
    vista = document.getElementById("vista");
    progreso = document.getElementById("progreso");
    vivo = document.getElementById("vivo");
    tostada = document.getElementById("tostada");

    E.cargar();
    E.estado.paso = pasoValido(E.estado.paso);
    E.alCambiar = function () { pintarProgreso(); if (actualizarFaltan) actualizarFaltan(); };
    try { history.replaceState({ paso: E.estado.paso }, "", "#" + nombrePaso(E.estado.paso)); } catch (e) { /* ver irA */ }
    pintar();

    // Botón "atrás" del navegador o del celular: vuelve a la sección anterior
    window.addEventListener("popstate", function (ev) {
      E.cerrarSelector();
      E.estado.paso = pasoValido(ev.state ? ev.state.paso : "inicio");
      E.guardar();
      pintar();
      window.scrollTo(0, 0);
    });

    document.getElementById("btn-reiniciar").addEventListener("click", pedirReinicio);
    var dlg = document.getElementById("dlg-reinicio");
    document.getElementById("dlg-cancelar").addEventListener("click", function () { dlg.close(); });
    document.getElementById("dlg-aceptar").addEventListener("click", function () { dlg.close(); reiniciar(); });
  });
})(window.Enc);
