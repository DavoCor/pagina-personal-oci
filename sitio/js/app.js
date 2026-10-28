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

  // ---------------------------------------------------------------
  // Datos del repaso
  // ---------------------------------------------------------------

  // Preguntas de opción múltiple.
  // La primera opción de cada pregunta es la correcta (antes de barajar).
  var PREGUNTAS = [
    {
      taller: 1,
      pregunta: '¿Para qué sirve un compartimento en OCI?',
      opciones: [
        'Para agrupar recursos y dar permisos solo sobre ellos',
        'Para guardar los archivos de la página',
        'Para conectar la red con Internet',
        'Para generar las llaves SSH'
      ],
      explicacion: 'En el taller 1 se creó el compartimento Infraestructura_y_Cloud para agrupar la red y las máquinas.'
    },
    {
      taller: 1,
      pregunta: '¿Qué rango (CIDR) tiene la subred subred-web?',
      opciones: ['10.0.0.0/24', '10.0.0.0/16', '0.0.0.0/0', '192.168.1.0/24'],
      explicacion: 'La red red-infraestructura usa 10.0.0.0/16 y la subred subred-web toma una parte: 10.0.0.0/24.'
    },
    {
      taller: 1,
      pregunta: '¿Qué permite que la red salga a Internet?',
      opciones: [
        'El Internet Gateway salida-internet',
        'La lista de seguridad',
        'El compartimento',
        'El grupo de usuarios'
      ],
      explicacion: 'El Internet Gateway y la regla 0.0.0.0/0 de la tabla de rutas conectan la red con Internet.'
    },
    {
      taller: 1,
      pregunta: '¿Qué puertos abren las reglas de entrada de la lista de seguridad?',
      opciones: ['22 y 80', '21 y 443', '80 y 8080', '25 y 110'],
      explicacion: 'TCP 22 es para SSH (administrar la máquina) y TCP 80 es para HTTP (ver la página).'
    },
    {
      taller: 1,
      pregunta: '¿Por qué se trabaja con el usuario estudiante-web y no con el administrador?',
      opciones: [
        'Para usar solo los permisos necesarios',
        'Porque el administrador no puede crear máquinas',
        'Porque así la máquina es más rápida',
        'Porque así no se cobra nada'
      ],
      explicacion: 'Es el principio de mínimo privilegio: el usuario recibe permisos por medio de un grupo y una política.'
    },
    {
      taller: 2,
      pregunta: '¿Con qué usuario se entra por SSH a una máquina Oracle Linux en OCI?',
      opciones: ['opc', 'root', 'admin', 'estudiante-web'],
      explicacion: 'Las imágenes de Oracle Linux en OCI traen el usuario opc.'
    },
    {
      taller: 2,
      pregunta: '¿Qué hace chmod 600 sobre la llave privada?',
      opciones: [
        'La deja legible solo para su dueño',
        'La borra',
        'La convierte en llave pública',
        'La copia a la máquina'
      ],
      explicacion: 'SSH rechaza las llaves privadas con permisos abiertos.'
    },
    {
      taller: 2,
      pregunta: '¿Qué comando instala Nginx en Oracle Linux 9?',
      opciones: [
        'sudo dnf install -y nginx',
        'sudo apt install nginx',
        'pip install nginx',
        'sudo systemctl install nginx'
      ],
      explicacion: 'Oracle Linux usa dnf como gestor de paquetes; apt es de Ubuntu y Debian.'
    },
    {
      taller: 2,
      pregunta: 'La lista de seguridad permite el puerto 80, pero la página no abre. ¿Qué falta?',
      opciones: [
        'Abrir HTTP en el firewall de la máquina',
        'Abrir el puerto 22',
        'Cambiar la tabla de rutas',
        'Nada, solo hay que esperar'
      ],
      explicacion: 'Oracle Linux tiene su propio firewall: firewall-cmd --permanent --add-service=http y luego firewall-cmd --reload.'
    },
    {
      taller: 2,
      pregunta: '¿Para qué sirve restorecon -Rv /usr/share/nginx/html?',
      opciones: [
        'Para que SELinux deje a Nginx leer los archivos',
        'Para reiniciar Nginx',
        'Para borrar la página',
        'Para descargar el repositorio'
      ],
      explicacion: 'Sin la etiqueta correcta de SELinux, Nginx responde 403 Forbidden.'
    },
    {
      taller: 3,
      pregunta: '¿Qué hace DuckDNS?',
      opciones: [
        'Asocia un subdominio con la IP pública del servidor',
        'Guarda los archivos de la página',
        'Crea la máquina virtual',
        'Abre el puerto 80'
      ],
      explicacion: 'DuckDNS es un DNS gratuito: traduce el nombre del subdominio a la IP de la máquina.'
    },
    {
      taller: 3,
      pregunta: '¿Qué comando revisa que la configuración de Nginx no tenga errores?',
      opciones: [
        'sudo nginx -t',
        'sudo nginx -v',
        'systemctl is-active nginx',
        'curl -I http://localhost/'
      ],
      explicacion: 'nginx -t debe decir syntax is ok y test is successful antes de hacer reload.'
    },
    {
      taller: 3,
      pregunta: '¿Qué directiva de Nginx asocia el bloque server con el subdominio?',
      opciones: ['server_name', 'root', 'listen', 'index'],
      explicacion: 'server_name indica para qué nombre responde ese bloque.'
    },
    {
      taller: 3,
      pregunta: '¿Qué comando muestra a qué IP apunta un nombre?',
      opciones: ['getent hosts', 'whoami', 'ls -l', 'chmod 600'],
      explicacion: 'getent hosts SUBDOMINIO.duckdns.org debe mostrar la IP pública de la máquina.'
    },
    {
      taller: 3,
      pregunta: '¿Dónde se ven las visitas que recibe la página?',
      opciones: [
        'En el registro de accesos de Nginx',
        'En la lista de seguridad',
        'En el panel de DuckDNS',
        'En el archivo .gitignore'
      ],
      explicacion: 'Con sudo tail se ven las últimas líneas del access log: IP, fecha, archivo pedido y código de respuesta.'
    }
  ];

  // Afirmaciones de verdadero o falso
  var AFIRMACIONES = [
    {
      afirmacion: 'La subred subred-web es privada.',
      respuesta: false,
      explicacion: 'Es pública: por eso las máquinas pueden tener IP pública.'
    },
    {
      afirmacion: 'El puerto 22 se usa para conectarse por SSH.',
      respuesta: true,
      explicacion: 'La regla TCP 22 permite administrar la máquina por SSH.'
    },
    {
      afirmacion: 'La llave privada se puede subir a GitHub para no perderla.',
      respuesta: false,
      explicacion: 'La llave privada nunca se publica: quien la tenga puede entrar a la máquina.'
    },
    {
      afirmacion: 'En el taller 3 se reutilizó la red del taller 1.',
      respuesta: true,
      explicacion: 'La máquina servidor-personal se creó en red-infraestructura y subred-web.'
    },
    {
      afirmacion: 'systemctl enable --now nginx inicia Nginx y lo deja configurado para arrancar con el sistema.',
      respuesta: true,
      explicacion: '--now lo inicia ya y enable lo deja activo en cada arranque.'
    },
    {
      afirmacion: 'Cloud Shell debe usar la red Public Network para llegar a la IP pública de la máquina.',
      respuesta: true,
      explicacion: 'Con la red de servicios no se llega a la IP pública.'
    },
    {
      afirmacion: 'Si todo está bien, curl -I http://localhost/ responde 404.',
      respuesta: false,
      explicacion: 'Debe responder HTTP/1.1 200 OK.'
    },
    {
      afirmacion: 'El token de DuckDNS puede salir en las capturas porque no es importante.',
      respuesta: false,
      explicacion: 'El token funciona como contraseña: con él se puede cambiar el subdominio.'
    },
    {
      afirmacion: 'git clone --depth 1 descarga solo la última versión del repositorio.',
      respuesta: true,
      explicacion: 'Así la descarga es más liviana.'
    },
    {
      afirmacion: 'Para no gastar créditos, al final la máquina se elimina con Terminate.',
      respuesta: true,
      explicacion: 'Se marca también la opción de borrar el disco de arranque.'
    }
  ];

  // Tarjetas de repaso
  var TARJETAS = [
    {
      termino: 'VCN',
      definicion: 'Red virtual en la nube. En los talleres: red-infraestructura, 10.0.0.0/16.'
    },
    {
      termino: 'Subred pública',
      definicion: 'Parte de la VCN donde las máquinas pueden tener IP pública. En los talleres: subred-web, 10.0.0.0/24.'
    },
    {
      termino: 'Internet Gateway',
      definicion: 'Puerta de salida de la red hacia Internet. En los talleres: salida-internet.'
    },
    {
      termino: 'Lista de seguridad',
      definicion: 'Reglas de tráfico de la subred: TCP 22 y TCP 80 desde 0.0.0.0/0.'
    },
    {
      termino: 'Forma (shape)',
      definicion: 'Tamaño de la máquina: número de OCPU y memoria.'
    },
    {
      termino: 'SSH',
      definicion: 'Conexión segura a la terminal de la máquina usando una llave privada.'
    },
    {
      termino: 'Nginx',
      definicion: 'Servidor web que entrega la página por HTTP en el puerto 80.'
    },
    {
      termino: 'SELinux',
      definicion: 'Seguridad de Linux que exige etiquetas en los archivos; se arreglan con restorecon.'
    },
    {
      termino: 'DNS',
      definicion: 'Sistema que traduce nombres de dominio a direcciones IP.'
    },
    {
      termino: 'Bloque server',
      definicion: 'Configuración de Nginx para un sitio: listen, server_name, root e index.'
    }
  ];

  // ---------------------------------------------------------------
  // Funciones de ayuda
  // ---------------------------------------------------------------

  // Crea un elemento; el texto siempre entra con textContent
  function crear(etiqueta, clase, texto) {
    var elemento = document.createElement(etiqueta);
    if (clase) {
      elemento.className = clase;
    }
    if (texto !== undefined) {
      elemento.textContent = texto;
    }
    return elemento;
  }

  // Baraja una copia de la lista (algoritmo de Fisher-Yates)
  function barajar(lista) {
    var copia = lista.slice();
    for (var i = copia.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var guardado = copia[i];
      copia[i] = copia[j];
      copia[j] = guardado;
    }
    return copia;
  }

  // ---------------------------------------------------------------
  // Preguntas de opción múltiple
  // ---------------------------------------------------------------

  var filtros = document.querySelectorAll('.filtro');
  var elNumero = document.getElementById('juego-numero');
  var elPuntaje = document.getElementById('juego-puntaje');
  var elEnunciado = document.getElementById('enunciado');
  var elOpciones = document.getElementById('opciones');
  var elResultado = document.getElementById('resultado');
  var botonSiguiente = document.getElementById('siguiente');
  var panelPregunta = document.getElementById('juego-pregunta');
  var panelFinal = document.getElementById('juego-final');
  var elFinal = document.getElementById('final-texto');
  var botonVolver = document.getElementById('volver');

  // Estado de la partida actual
  var partida = {
    taller: 0, // 0 = todos los talleres
    preguntas: [],
    indice: 0,
    puntaje: 0,
    respondida: false
  };

  // Elige las preguntas del taller, baraja el orden y las opciones.
  // Guarda la posición de la correcta después de barajar.
  function prepararPreguntas(taller) {
    var elegidas = PREGUNTAS.filter(function (p) {
      return taller === 0 || p.taller === taller;
    });

    return barajar(elegidas).map(function (p) {
      var opciones = barajar(
        p.opciones.map(function (texto, posicion) {
          return { texto: texto, correcta: posicion === 0 };
        })
      );
      var correcta = 0;
      opciones.forEach(function (opcion, posicion) {
        if (opcion.correcta) {
          correcta = posicion;
        }
      });
      return {
        pregunta: p.pregunta,
        opciones: opciones.map(function (o) {
          return o.texto;
        }),
        correcta: correcta,
        explicacion: p.explicacion
      };
    });
  }

  function mostrarPuntaje() {
    elPuntaje.textContent = 'Puntaje: ' + partida.puntaje;
  }

  // Muestra la pregunta actual
  function mostrarPregunta() {
    var actual = partida.preguntas[partida.indice];
    partida.respondida = false;

    panelFinal.hidden = true;
    panelPregunta.hidden = false;

    elNumero.textContent = 'Pregunta ' + (partida.indice + 1) + ' de ' + partida.preguntas.length;
    mostrarPuntaje();
    elEnunciado.textContent = actual.pregunta;
    elResultado.replaceChildren();
    botonSiguiente.hidden = true;

    elOpciones.replaceChildren();
    actual.opciones.forEach(function (texto, posicion) {
      var boton = crear('button', 'opcion', texto);
      boton.type = 'button';
      boton.addEventListener('click', function () {
        responder(posicion);
      });
      elOpciones.appendChild(boton);
    });
  }

  // Revisa la respuesta elegida
  function responder(elegida) {
    if (partida.respondida) {
      return;
    }
    partida.respondida = true;

    var actual = partida.preguntas[partida.indice];
    var acerto = elegida === actual.correcta;

    // Deshabilita las opciones y pinta la correcta y la elegida
    elOpciones.querySelectorAll('button').forEach(function (boton, posicion) {
      boton.disabled = true;
      if (posicion === actual.correcta) {
        boton.classList.add('correcta');
      } else if (posicion === elegida) {
        boton.classList.add('incorrecta');
      }
    });

    if (acerto) {
      partida.puntaje++;
      mostrarPuntaje();
    }

    // Mensaje y explicación
    var mensaje = crear('strong', acerto ? 'ok' : 'mal', acerto ? '¡Correcto!' : 'Incorrecto.');
    elResultado.replaceChildren(mensaje, document.createTextNode(' ' + actual.explicacion));

    botonSiguiente.hidden = false;
    botonSiguiente.focus({ preventScroll: true });
  }

  // Muestra el puntaje final
  function mostrarFinal() {
    panelPregunta.hidden = true;
    panelFinal.hidden = false;
    elFinal.textContent = 'Obtuviste ' + partida.puntaje + ' de ' + partida.preguntas.length + '.';
    botonVolver.focus({ preventScroll: true });
  }

  // Empieza una partida nueva con las preguntas del taller elegido
  function empezar(taller) {
    partida.taller = taller;
    partida.preguntas = prepararPreguntas(taller);
    partida.indice = 0;
    partida.puntaje = 0;

    // Marca el filtro activo
    filtros.forEach(function (filtro) {
      var valor = filtro.getAttribute('data-taller');
      var numero = valor === 'todos' ? 0 : Number(valor);
      filtro.setAttribute('aria-pressed', numero === taller ? 'true' : 'false');
    });

    mostrarPregunta();
  }

  if (elOpciones && botonSiguiente && panelFinal && filtros.length > 0) {
    filtros.forEach(function (filtro) {
      filtro.addEventListener('click', function () {
        var valor = filtro.getAttribute('data-taller');
        empezar(valor === 'todos' ? 0 : Number(valor));
      });
    });

    botonSiguiente.addEventListener('click', function () {
      partida.indice++;
      if (partida.indice >= partida.preguntas.length) {
        mostrarFinal();
      } else {
        mostrarPregunta();
        elEnunciado.focus({ preventScroll: true });
      }
    });

    botonVolver.addEventListener('click', function () {
      empezar(partida.taller);
    });

    empezar(0);
  }

  // ---------------------------------------------------------------
  // Verdadero o falso
  // ---------------------------------------------------------------

  var listaVF = document.getElementById('vf-lista');
  var contadorVF = document.getElementById('vf-contador');
  var botonReiniciarVF = document.getElementById('vf-reiniciar');
  var aciertosVF = 0;
  var respondidasVF = 0;

  function mostrarContadorVF() {
    var palabra = respondidasVF === 1 ? 'respondida' : 'respondidas';
    contadorVF.textContent = 'Aciertos: ' + aciertosVF + ' de ' + respondidasVF + ' ' + palabra;
  }

  // Crea una afirmación con sus dos botones
  function crearAfirmacion(dato) {
    var item = crear('li');
    var texto = crear('p', 'vf-texto', dato.afirmacion);
    var botones = crear('div', 'vf-botones');
    var botonV = crear('button', 'opcion', 'Verdadero');
    var botonF = crear('button', 'opcion', 'Falso');
    var feedback = crear('p', 'vf-feedback');
    feedback.setAttribute('aria-live', 'polite');
    botonV.type = 'button';
    botonF.type = 'button';

    function responderVF(eligio) {
      var acerto = eligio === dato.respuesta;
      var correcto = dato.respuesta ? botonV : botonF;
      var elegido = eligio ? botonV : botonF;

      botonV.disabled = true;
      botonF.disabled = true;
      correcto.classList.add('correcta');
      if (!acerto) {
        elegido.classList.add('incorrecta');
      }

      item.classList.add(acerto ? 'acierto' : 'error');
      respondidasVF++;
      if (acerto) {
        aciertosVF++;
      }
      mostrarContadorVF();

      var marca = crear('strong', acerto ? 'ok' : 'mal', acerto ? '✔ Correcto.' : '✘ Incorrecto.');
      feedback.replaceChildren(marca, document.createTextNode(' ' + dato.explicacion));
    }

    botonV.addEventListener('click', function () {
      responderVF(true);
    });
    botonF.addEventListener('click', function () {
      responderVF(false);
    });

    botones.appendChild(botonV);
    botones.appendChild(botonF);
    item.appendChild(texto);
    item.appendChild(botones);
    item.appendChild(feedback);
    return item;
  }

  // Dibuja todas las afirmaciones desde cero
  function empezarVF() {
    aciertosVF = 0;
    respondidasVF = 0;
    listaVF.replaceChildren();
    AFIRMACIONES.forEach(function (dato) {
      listaVF.appendChild(crearAfirmacion(dato));
    });
    mostrarContadorVF();
  }

  if (listaVF && contadorVF && botonReiniciarVF) {
    botonReiniciarVF.addEventListener('click', empezarVF);
    empezarVF();
  }

  // ---------------------------------------------------------------
  // Tarjetas de repaso
  // ---------------------------------------------------------------

  var rejilla = document.getElementById('rejilla');

  if (rejilla) {
    TARJETAS.forEach(function (dato) {
      var item = crear('li');
      var boton = crear('button', 'repaso');
      var termino = crear('span', 'repaso-termino', dato.termino);
      var definicion = crear('span', 'repaso-definicion', dato.definicion);

      boton.type = 'button';
      boton.setAttribute('aria-expanded', 'false');
      definicion.hidden = true;

      // Al tocar, alterna entre solo el término y término con definición
      boton.addEventListener('click', function () {
        var abierta = boton.getAttribute('aria-expanded') === 'true';
        boton.setAttribute('aria-expanded', abierta ? 'false' : 'true');
        definicion.hidden = abierta;
      });

      boton.appendChild(termino);
      boton.appendChild(definicion);
      item.appendChild(boton);
      rejilla.appendChild(item);
    });
  }
})();
