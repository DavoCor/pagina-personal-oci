(function () {
  'use strict';

  var raiz = document.documentElement;

  // Lee y guarda en localStorage sin romper la página si no está disponible
  function leer(clave) {
    try {
      return localStorage.getItem(clave);
    } catch (e) {
      return null;
    }
  }

  function guardar(clave, valor) {
    try {
      localStorage.setItem(clave, valor);
    } catch (e) {}
  }

  // Muestra la dirección desde la que se abrió la página
  var host = document.getElementById('host');
  if (host && location.host) {
    host.textContent = location.host;
  }

  // Muestra el año actual en el pie de página
  var anio = document.getElementById('anio');
  if (anio) {
    anio.textContent = new Date().getFullYear();
  }

  // Tema claro u oscuro
  var botonTema = document.querySelector('.tema-boton');

  function actualizarBotonTema() {
    var oscuro = raiz.getAttribute('data-tema') === 'oscuro';
    botonTema.textContent = oscuro ? 'Modo claro' : 'Modo oscuro';
  }

  if (botonTema) {
    actualizarBotonTema();
    botonTema.addEventListener('click', function () {
      if (raiz.getAttribute('data-tema') === 'oscuro') {
        raiz.removeAttribute('data-tema');
        guardar('tema', 'claro');
      } else {
        raiz.setAttribute('data-tema', 'oscuro');
        guardar('tema', 'oscuro');
      }
      actualizarBotonTema();
    });
  }

  // Menú para celulares
  var botonMenu = document.querySelector('.menu-boton');
  var menu = document.getElementById('menu');

  function cerrarMenu() {
    menu.classList.remove('abierto');
    botonMenu.setAttribute('aria-expanded', 'false');
  }

  if (botonMenu && menu) {
    botonMenu.addEventListener('click', function () {
      var abierto = menu.classList.toggle('abierto');
      botonMenu.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    });

    menu.addEventListener('click', function (evento) {
      if (evento.target.tagName === 'A') {
        cerrarMenu();
      }
    });
  }

  // Lista de pendientes
  var formulario = document.getElementById('form-tarea');
  var campo = document.getElementById('tarea');
  var lista = document.getElementById('lista-tareas');
  var contador = document.getElementById('contador');
  var tareas = [];

  // Carga las tareas guardadas; si los datos están dañados, empieza vacía
  function cargarTareas() {
    try {
      var datos = JSON.parse(leer('tareas'));
      if (Array.isArray(datos)) {
        tareas = datos
          .filter(function (t) {
            return t && typeof t.texto === 'string';
          })
          .map(function (t) {
            return { texto: t.texto, hecha: t.hecha === true };
          });
      }
    } catch (e) {
      tareas = [];
    }
  }

  function guardarTareas() {
    guardar('tareas', JSON.stringify(tareas));
  }

  // Actualiza el texto con la cantidad de tareas pendientes
  function actualizarContador() {
    var total = tareas.length;
    if (total === 0) {
      contador.textContent = 'No hay tareas todavía.';
      return;
    }
    var pendientes = tareas.filter(function (t) {
      return !t.hecha;
    }).length;
    var palabra = pendientes === 1 ? 'pendiente' : 'pendientes';
    contador.textContent = pendientes + ' ' + palabra + ' de ' + total;
  }

  // Dibuja la lista completa
  function mostrarTareas() {
    lista.textContent = '';

    tareas.forEach(function (tarea, indice) {
      var item = document.createElement('li');

      var casilla = document.createElement('input');
      casilla.type = 'checkbox';
      casilla.checked = tarea.hecha;
      casilla.setAttribute('aria-label', 'Marcar como hecha: ' + tarea.texto);

      var texto = document.createElement('span');
      texto.className = 'texto' + (tarea.hecha ? ' hecha' : '');
      texto.textContent = tarea.texto;

      var borrar = document.createElement('button');
      borrar.type = 'button';
      borrar.textContent = 'Borrar';

      casilla.addEventListener('change', function () {
        tareas[indice].hecha = casilla.checked;
        guardarTareas();
        mostrarTareas();
      });

      borrar.addEventListener('click', function () {
        tareas.splice(indice, 1);
        guardarTareas();
        mostrarTareas();
      });

      item.appendChild(casilla);
      item.appendChild(texto);
      item.appendChild(borrar);
      lista.appendChild(item);
    });

    actualizarContador();
  }

  if (formulario && campo && lista && contador) {
    formulario.addEventListener('submit', function (evento) {
      evento.preventDefault();
      var texto = campo.value.trim();
      if (texto === '') {
        return;
      }
      tareas.push({ texto: texto, hecha: false });
      campo.value = '';
      guardarTareas();
      mostrarTareas();
    });

    cargarTareas();
    mostrarTareas();
  }
})();
