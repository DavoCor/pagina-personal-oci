/* =========================================================
   Funcionalidades en JavaScript de la página de David
   1. Muestra desde qué dirección se está viendo la página.
   2. Cambia entre modo cuaderno (claro) y modo tablero (oscuro).
   3. Abre y cierra el menú en celulares.
   4. Laboratorio de tiro parabólico: calcula y dibuja la trayectoria.
   ========================================================= */
(() => {
  'use strict';

  const raiz = document.documentElement;

  /* ---------- 1. Dirección (subdominio o IP) ---------- */
  const host = document.getElementById('host');
  if (host) {
    host.textContent = window.location.host || 'un archivo abierto en tu equipo';
  }

  const anio = document.getElementById('anio');
  if (anio) anio.textContent = String(new Date().getFullYear());

  /* ---------- 2. Tema claro / oscuro ---------- */
  const botonTema = document.querySelector('.tema-boton');
  const prefiereOscuro = window.matchMedia('(prefers-color-scheme: dark)');

  const temaActual = () =>
    raiz.getAttribute('data-theme') || (prefiereOscuro.matches ? 'dark' : 'light');

  const pintarBotonTema = () => {
    if (!botonTema) return;
    const oscuro = temaActual() === 'dark';
    botonTema.textContent = oscuro ? 'Modo cuaderno' : 'Modo tablero';
    botonTema.setAttribute(
      'aria-label',
      oscuro ? 'Cambiar a modo cuaderno (claro)' : 'Cambiar a modo tablero (oscuro)'
    );
  };

  if (botonTema) {
    botonTema.addEventListener('click', () => {
      const nuevo = temaActual() === 'dark' ? 'light' : 'dark';
      raiz.setAttribute('data-theme', nuevo);
      try {
        localStorage.setItem('tema', nuevo);
      } catch (e) {
        /* Si el navegador no deja guardar, el cambio dura hasta recargar */
      }
      pintarBotonTema();
    });
    if (prefiereOscuro.addEventListener) {
      prefiereOscuro.addEventListener('change', pintarBotonTema);
    }
    pintarBotonTema();
  }

  /* ---------- 3. Menú en celulares ---------- */
  const botonMenu = document.querySelector('.menu-boton');
  const menu = document.getElementById('menu');

  const cerrarMenu = () => {
    if (!botonMenu || !menu) return;
    botonMenu.setAttribute('aria-expanded', 'false');
    menu.classList.remove('abierto');
  };

  if (botonMenu && menu) {
    botonMenu.addEventListener('click', () => {
      const abierto = botonMenu.getAttribute('aria-expanded') === 'true';
      botonMenu.setAttribute('aria-expanded', String(!abierto));
      menu.classList.toggle('abierto', !abierto);
    });
    menu.addEventListener('click', (e) => {
      if (e.target.closest('a')) cerrarMenu();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') cerrarMenu();
    });
  }

  /* ---------- 4. Laboratorio de tiro parabólico ---------- */
  const form = document.getElementById('lab-form');
  const svg = document.getElementById('grafica');
  if (!form || !svg) return;

  const NS = 'http://www.w3.org/2000/svg';
  const ANCHO = 640;
  const ALTO = 360;
  const M = { izq: 52, der: 18, sup: 18, inf: 42 };
  const areaAncho = ANCHO - M.izq - M.der;
  const areaAlto = ALTO - M.sup - M.inf;

  const campoV = document.getElementById('velocidad');
  const campoA = document.getElementById('angulo');
  const campoG = document.getElementById('gravedad');
  const salidaV = document.getElementById('velocidad-valor');
  const salidaA = document.getElementById('angulo-valor');
  const rTiempo = document.getElementById('r-tiempo');
  const rAltura = document.getElementById('r-altura');
  const rAlcance = document.getElementById('r-alcance');

  const numero = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 });
  const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');

  let actual = null;
  let anterior = null;
  let animacion = 0;

  // Fórmulas del tiro parabólico (sin rozamiento, lanzado desde el suelo)
  function calcular(v, grados, g) {
    const theta = (grados * Math.PI) / 180;
    const vx = v * Math.cos(theta);
    const vy = v * Math.sin(theta);
    const tiempo = (2 * vy) / g;
    return {
      v, grados, g, vx, vy, tiempo,
      altura: (vy * vy) / (2 * g),
      alcance: vx * tiempo,
    };
  }

  const leer = () =>
    calcular(Number(campoV.value), Number(campoA.value), Number(campoG.value));

  // Elige un paso de cuadrícula "redondo": 1, 2, 5, 10, 20, 50...
  function pasoRedondo(rango) {
    const crudo = rango / 6;
    const potencia = Math.pow(10, Math.floor(Math.log10(crudo)));
    const n = crudo / potencia;
    return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * potencia;
  }

  function crear(tipo, atributos, padre) {
    const nodo = document.createElementNS(NS, tipo);
    Object.entries(atributos).forEach(([k, v]) => nodo.setAttribute(k, v));
    if (padre) padre.appendChild(nodo);
    return nodo;
  }

  // Misma escala en ambos ejes para que la parábola tenga su forma real
  function escalaPara(lanzamientos) {
    const maxX = Math.max(...lanzamientos.map((l) => l.alcance)) * 1.06;
    const maxY = Math.max(...lanzamientos.map((l) => l.altura)) * 1.2;
    return Math.min(areaAncho / maxX, areaAlto / maxY);
  }

  const aX = (x, s) => M.izq + x * s;
  const aY = (y, s) => ALTO - M.inf - y * s;

  function posicion(l, t) {
    return { x: l.vx * t, y: Math.max(l.vy * t - 0.5 * l.g * t * t, 0) };
  }

  function camino(l, s, hasta = l.tiempo) {
    const n = 90;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const p = posicion(l, (hasta * i) / n);
      pts.push(`${aX(p.x, s).toFixed(1)},${aY(p.y, s).toFixed(1)}`);
    }
    return `M${pts.join(' L')}`;
  }

  function dibujarEjes(s) {
    while (svg.lastChild && svg.lastChild.nodeName !== 'title') {
      svg.removeChild(svg.lastChild);
    }
    const metrosX = areaAncho / s;
    const metrosY = areaAlto / s;
    const paso = pasoRedondo(metrosX);
    const cuadricula = crear('g', { class: 'g-cuadricula' }, svg);
    const textos = crear('g', {}, svg);

    for (let x = paso; x <= metrosX + 1e-9; x += paso) {
      const px = aX(x, s);
      crear('line', { x1: px, y1: M.sup, x2: px, y2: ALTO - M.inf }, cuadricula);
      crear('text', { x: px, y: ALTO - M.inf + 18, 'text-anchor': 'middle', class: 'g-texto' }, textos)
        .textContent = numero.format(x);
    }
    for (let y = paso; y <= metrosY + 1e-9; y += paso) {
      const py = aY(y, s);
      crear('line', { x1: M.izq, y1: py, x2: ANCHO - M.der, y2: py }, cuadricula);
      crear('text', { x: M.izq - 8, y: py + 4, 'text-anchor': 'end', class: 'g-texto' }, textos)
        .textContent = numero.format(y);
    }

    crear('line', { x1: M.izq, y1: aY(0, s), x2: ANCHO - M.der, y2: aY(0, s), class: 'g-eje' }, svg);
    crear('line', { x1: M.izq, y1: M.sup, x2: M.izq, y2: aY(0, s), class: 'g-eje' }, svg);
    crear('text', { x: ANCHO - M.der, y: ALTO - 6, 'text-anchor': 'end', class: 'g-texto' }, svg)
      .textContent = 'distancia (m)';
    crear('text', { x: M.izq + 8, y: M.sup + 12, class: 'g-texto' }, svg)
      .textContent = 'altura (m)';
  }

  function marcarAltura(l, s) {
    const xMedio = aX(l.alcance / 2, s);
    crear('line', { x1: xMedio, y1: aY(l.altura, s), x2: xMedio, y2: aY(0, s), class: 'g-guia' }, svg);
    const derecha = l.alcance / 2 < (areaAncho / s) * 0.7;
    crear('text', {
      x: xMedio + (derecha ? 10 : -10),
      y: aY(l.altura, s) + 26,
      'text-anchor': derecha ? 'start' : 'end',
      class: 'g-nota',
    }, svg).textContent = 'h máx.';
  }

  function mostrarResultados(l) {
    rTiempo.textContent = `${numero.format(l.tiempo)} s`;
    rAltura.textContent = `${numero.format(l.altura)} m`;
    rAlcance.textContent = `${numero.format(l.alcance)} m`;
  }

  function dibujar(animar) {
    cancelAnimationFrame(animacion);
    const lista = anterior ? [actual, anterior] : [actual];
    const s = escalaPara(lista);
    dibujarEjes(s);

    if (anterior) crear('path', { d: camino(anterior, s), class: 'g-anterior' }, svg);
    const trazo = crear('path', { d: '', class: 'g-actual' }, svg);
    const bola = crear('circle', { r: 8, cx: aX(0, s), cy: aY(0, s), class: 'g-bola' }, svg);

    const terminar = () => {
      trazo.setAttribute('d', camino(actual, s));
      bola.setAttribute('cx', aX(actual.alcance, s));
      bola.setAttribute('cy', aY(0, s));
      marcarAltura(actual, s);
      svg.appendChild(bola); // la bola queda encima de todo
    };

    if (!animar || reducirMovimiento.matches) {
      terminar();
      return;
    }

    // La bola avanza con el tiempo físico del lanzamiento, comprimido a 1,4 s
    const duracion = 1400;
    let inicio = null;
    const cuadro = (ahora) => {
      if (inicio === null) inicio = ahora;
      const f = Math.min((ahora - inicio) / duracion, 1);
      const t = actual.tiempo * f;
      const p = posicion(actual, t);
      trazo.setAttribute('d', camino(actual, s, t));
      bola.setAttribute('cx', aX(p.x, s));
      bola.setAttribute('cy', aY(p.y, s));
      if (f < 1) {
        animacion = requestAnimationFrame(cuadro);
      } else {
        terminar();
      }
    };
    animacion = requestAnimationFrame(cuadro);
  }

  function actualizarEtiquetas() {
    salidaV.textContent = `${campoV.value} m/s`;
    salidaA.textContent = `${campoA.value}°`;
  }

  form.addEventListener('input', actualizarEtiquetas);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    anterior = actual;
    actual = leer();
    mostrarResultados(actual);
    dibujar(true);
  });

  // Estado inicial: un lanzamiento de ejemplo ya dibujado
  actualizarEtiquetas();
  actual = leer();
  mostrarResultados(actual);
  dibujar(false);
})();
