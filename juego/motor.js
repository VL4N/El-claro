// Motor de El Claro, fase 1. Lógica pura: cada función recibe un estado y devuelve uno nuevo.
// No toca el DOM. Se prueba con node y se usa desde index.html.

export const ANCHO = 15;
export const ALTO = 15;
// El tiempo avanza en "ticks" (un segundo de juego a velocidad normal).
export const TICK_ECONOMIA = 6;    // cada cuántos ticks la ciudad produce y consume, y los corredores gastan una ración
export const CICLO = 60;           // cada cuántos ticks gira el laberinto (un minuto)
export const TURNOS_MAX = 480;     // duración de la partida en ticks (8 minutos)
export const CAPACIDAD = 3;        // materiales que carga un corredor sin atributo especial
export const TICKS_CAIDO = 60;     // tiempo para rescatar a un corredor caído antes de que muera
export const TICKS_HERIDO = 60;    // recuperación de un herido sin enfermería
export const TICKS_HERIDO_ENFERMERIA = 30;
export const COSTO_ENFERMERIA = 4;
export const COSTO_MEJORA = 2;     // conocimiento para mejorar un atributo
export const TICKS_LUTO = 60;      // un corredor de luto no sale
export const TICKS_ENCIERRO = 30;  // evento de facción: nadie sale
export const COSTO_HUERTO = 4;
export const COSTO_TALLER = 5;
export const COSTO_ATAJO = 2;      // conocimiento para atravesar una pared
export const PUNTOS_SALIDA = 10;
export const RACIONES_MAX = 10;
export const MARCAS_PARA_SALIR = 4;   // marcas leídas que hacen falta para que la salida se abra

const NOMBRES = ["Ira", "Teo", "Noa", "Sol", "Bru", "Lía", "Eli", "Dan", "Uma", "Rai", "Vera", "Nilo", "Ada", "Tomé", "Luz",
  "Cai", "Mara", "Iván", "Ona", "Rufo", "Sira", "Beni", "Zoe", "Lalo", "Nila", "Gael", "Pía", "Koa", "Dalia", "Ciro"];

// ---------- quién es cada corredor ----------
export const FUERTES = {
  rapido: { nombre: "rápido", velocidad: 2, fuerza: 2, ojo: 1, frase: "Corre más que nadie, pero carga poco." },
  fuerte: { nombre: "fuerte", velocidad: 1, fuerza: 5, ojo: 1, frase: "Carga casi el doble que los demás." },
  ojo: { nombre: "buen ojo", velocidad: 1, fuerza: 3, ojo: 2, frase: "Ve más lejos: destapa el doble de laberinto a su paso." },
  comun: { nombre: "sin destacar", velocidad: 1, fuerza: 3, ojo: 1, frase: "No destaca en nada y no falla en nada." },
};
const ORIGENES = [
  "Nació en El Claro y nunca vio el cielo abierto.", "Llegó de niño con la última generación que intentó salir.",
  "Aprendió a leer con las marcas de los muros.", "Cuida el huerto cuando no sale.",
  "Dice que oye girar el laberinto por las noches.", "Dibuja mapas de memoria en la pared de su casa.",
  "No habla de lo que vio en su primera expedición.", "Es quien más veces ha vuelto con las manos vacías, y sigue saliendo.",
  "Repara las herramientas del taller.", "Cuenta historias de la salida a los más chicos.",
  "Perdió a alguien en el laberinto y no lo nombra.", "Guarda una piedra de cada expedición.",
];
const PARENTESCOS = ["hermana", "hermano", "pareja", "amiga de infancia", "amigo de infancia", "madre", "padre", "hija", "hijo", "prima", "primo"];

export function crearCorredor(id, rng, existentes, fuerteId = null, forzarVinculo = false) {
  const claves = Object.keys(FUERTES);
  const fuerte = fuerteId || claves[Math.floor(rng() * claves.length)];
  const f = FUERTES[fuerte];
  let vinculo = null;
  const vivos = existentes.filter((c) => c.estado !== "muerto" && c.estado !== "ido");
  if (vivos.length && (forzarVinculo || rng() < 0.65)) {
    const otro = vivos[Math.floor(rng() * vivos.length)];
    vinculo = { id: otro.id, texto: `${PARENTESCOS[Math.floor(rng() * PARENTESCOS.length)]} de ${otro.nombre}` };
  }
  const origen = ORIGENES[Math.floor(rng() * ORIGENES.length)];
  const historia = [f.frase, vinculo ? `${origen} Es ${vinculo.texto}.` : origen];
  return {
    id, nombre: NOMBRES[id % NOMBRES.length], ...casa(id), raciones: 0, carga: 0, destino: null, estado: "ciudad", atajo: false,
    fuerte, velocidad: f.velocidad, fuerza: f.fuerza, ojo: f.ojo, historia, vinculo,
    lleva: null, caidoEn: null, heridoEn: null, lutoHasta: 0,
  };
}

// Están unidos si uno es vínculo del otro.
export function unidos(a, b) {
  return (a.vinculo && a.vinculo.id === b.id) || (b.vinculo && b.vinculo.id === a.id);
}
export const CORREDORES_MAX = 6;
export const COSTO_RECLUTA = { materiales: 3, comida: 2 };
// lugar de cada corredor en la plaza cuando está en la ciudad
export const casa = (id) => ({ x: 6 + (id % 3), y: 6 + Math.floor(id / 3) % 3 });
// ---------- azar determinista ----------
export function crearRng(semilla) {
  let a = semilla >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- celdas ----------
export const esCiudad = (x, y) => x >= 6 && x <= 8 && y >= 6 && y <= 8;
export const enTablero = (x, y) => x >= 0 && x < ANCHO && y >= 0 && y < ALTO;
export const celda = (mapa, x, y) => mapa[y][x];
export const pasable = (mapa, x, y) => enTablero(x, y) && mapa[y][x] !== "#";

function ponerCelda(mapa, x, y, ch) {
  const fila = mapa[y].split("");
  fila[x] = ch;
  const copia = mapa.slice();
  copia[y] = fila.join("");
  return copia;
}

// ---------- biblioteca de reglas ----------
// Un patrón es una lista de líneas (filas o columnas) y cómo se mueven en cada giro.
//   tipo: "fila" | "columna"; indice: base 0; dir: +1 (derecha/abajo) o -1 (izquierda/arriba)
//   modo: "fijo" (cada giro), "alterna" (cambia de sentido cada giro), "cada2" (solo en giros pares)
// Las filas 6, 7 y 8 y las columnas 6, 7 y 8 nunca se mueven: ahí está la ciudad.
const F = (indice, dir, modo = "fijo") => ({ tipo: "fila", indice, dir, modo });
const C = (indice, dir, modo = "fijo") => ({ tipo: "columna", indice, dir, modo });

export const BIBLIOTECA = [
  { nombre: "norte y sur", dificultad: 1, pista: "las filas pares del norte van hacia un lado y las del sur hacia el otro",
    lineas: [F(1, 1), F(3, 1), F(5, 1), F(9, -1), F(11, -1), F(13, -1)] },
  { nombre: "corriente", dificultad: 1, pista: "todas las filas pares van al mismo lado",
    lineas: [F(1, 1), F(3, 1), F(5, 1), F(9, 1), F(11, 1), F(13, 1)] },
  { nombre: "espejo", dificultad: 1, pista: "como norte y sur, pero al revés",
    lineas: [F(1, -1), F(3, -1), F(5, -1), F(9, 1), F(11, 1), F(13, 1)] },
  { nombre: "anillos", dificultad: 2, pista: "las filas se alternan según su distancia a la ciudad",
    lineas: [F(1, 1), F(3, -1), F(5, 1), F(9, 1), F(11, -1), F(13, 1)] },
  { nombre: "cascada", dificultad: 2, pista: "aquí lo que se mueve son columnas, no filas",
    lineas: [C(1, 1), C(3, 1), C(5, 1), C(9, -1), C(11, -1), C(13, -1)] },
  { nombre: "cruz", dificultad: 2, pista: "dos filas y dos columnas, nada más",
    lineas: [F(3, 1), F(11, 1), C(3, 1), C(11, 1)] },
  { nombre: "marea", dificultad: 3, pista: "las filas van y vuelven: un giro hacia un lado, el siguiente hacia el otro",
    lineas: [F(1, 1, "alterna"), F(3, 1, "alterna"), F(5, 1, "alterna"), F(9, -1, "alterna"), F(11, -1, "alterna"), F(13, -1, "alterna")] },
  { nombre: "lento", dificultad: 3, pista: "solo se mueve en giros pares",
    lineas: [F(1, 1, "cada2"), F(5, 1, "cada2"), F(9, -1, "cada2"), F(13, -1, "cada2")] },
  { nombre: "borde", dificultad: 3, pista: "el borde del laberinto gira como una rueda",
    lineas: [F(0, 1), C(14, 1), F(14, -1), C(0, -1)] },
  { nombre: "mixto", dificultad: 4, pista: "algunas filas y algunas columnas, con comportamientos distintos",
    lineas: [F(1, 1), F(3, 1), C(11, -1, "alterna"), C(13, -1, "alterna")] },
  { nombre: "respiración", dificultad: 4, pista: "las filas cercanas a la ciudad van y vuelven; las lejanas, solo a veces",
    lineas: [F(5, 1, "alterna"), F(9, -1, "alterna"), F(1, 1, "cada2"), F(13, -1, "cada2")] },
  { nombre: "remolino", dificultad: 5, pista: "filas y columnas, en sentidos cruzados y con ritmo propio",
    lineas: [F(2, 1, "alterna"), F(12, -1, "alterna"), C(2, -1), C(12, 1), F(5, 1, "cada2"), F(9, -1, "cada2")] },
];

export const DIFICULTAD_MAX = 5;

// Elige un patrón al azar. Con `dificultad` (1 a 5) elige solo entre los de ese nivel;
// en el nivel máximo mezcla los dos niveles más altos para que no se repita siempre el mismo.
export function elegirPatron(rng, dificultad = null) {
  let candidatos = BIBLIOTECA;
  if (dificultad) {
    const d = Math.max(1, Math.min(DIFICULTAD_MAX, dificultad | 0));
    candidatos = BIBLIOTECA.filter((p) => d === DIFICULTAD_MAX ? p.dificultad >= d - 1 : p.dificultad === d);
    if (!candidatos.length) candidatos = BIBLIOTECA;
  }
  return candidatos[Math.floor(rng() * candidatos.length)];
}

// Nivel sugerido según las partidas ya jugadas con estas reglas: sube una dificultad por victoria.
export function dificultadSugerida(victorias) {
  return Math.max(1, Math.min(DIFICULTAD_MAX, 1 + (victorias | 0)));
}

// Lo que dicen las marcas, en orden de lectura: primero la idea general del patrón,
// después una línea por marca, sin decir hacia dónde (eso lo confirma la sala de mapas).
export function pistasDePatron(patron, rng) {
  const lineas = patron.lineas.slice();
  for (let i = lineas.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [lineas[i], lineas[j]] = [lineas[j], lineas[i]]; }
  const deLinea = (l) => {
    const nombre = nombreLinea(l.tipo, l.indice);
    const ritmo = l.modo === "alterna" ? ", y no siempre hacia el mismo lado" : l.modo === "cada2" ? ", pero no en todos los giros" : "";
    return `la ${nombre} se mueve${ritmo}`;
  };
  return [patron.pista, ...lineas.map(deLinea)];
}

// Desplazamiento real de una línea en el giro número `giro` (el primero es 1). 0 si no se mueve.
export function pasoLinea(linea, giro) {
  if (linea.modo === "alterna") return giro % 2 === 1 ? linea.dir : -linea.dir;
  if (linea.modo === "cada2") return giro % 2 === 0 ? linea.dir : 0;
  return linea.dir;
}

export function lineaDePatron(patron, tipo, indice) {
  return patron.lineas.find((l) => l.tipo === tipo && l.indice === indice) || null;
}

function rotarTexto(fila, paso) {
  const n = fila.length; const k = ((paso % n) + n) % n;
  return k ? fila.slice(n - k) + fila.slice(0, n - k) : fila;
}

// ---------- cambio del laberinto ----------
export function desplazarMapa(mapa, patron, giro) {
  let m = mapa.slice();
  for (const l of patron.lineas) {
    const paso = pasoLinea(l, giro);
    if (!paso) continue;
    if (l.tipo === "fila") m[l.indice] = rotarTexto(m[l.indice], paso);
    else {
      const col = m.map((f) => f[l.indice]).join("");
      const nueva = rotarTexto(col, paso);
      m = m.map((f, y) => f.slice(0, l.indice) + nueva[y] + f.slice(l.indice + 1));
    }
  }
  return m;
}

export function desplazarCoord(x, y, patron, giro) {
  for (const l of patron.lineas) {
    const paso = pasoLinea(l, giro);
    if (!paso) continue;
    if (l.tipo === "fila" && l.indice === y) x = (x + paso + ANCHO) % ANCHO;
    else if (l.tipo === "columna" && l.indice === x) y = (y + paso + ALTO) % ALTO;
  }
  return { x, y };
}

// ---------- caminos ----------
// BFS con hasta `paredes` celdas de pared permitidas. Devuelve lista de pasos (sin el origen) o null.
export function camino(mapa, desde, hasta, paredes = 0) {
  const clave = (x, y, p) => (y * ANCHO + x) * 2 + p;
  const previo = new Map();
  const cola = [[desde.x, desde.y, 0]];
  previo.set(clave(desde.x, desde.y, 0), null);
  while (cola.length) {
    const [x, y, p] = cola.shift();
    if (x === hasta.x && y === hasta.y) {
      const pasos = [];
      let k = clave(x, y, p);
      while (previo.get(k)) {
        const [px, py, pp, cx, cy] = previo.get(k);
        pasos.push({ x: cx, y: cy });
        k = clave(px, py, pp);
      }
      return pasos.reverse();
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (!enTablero(nx, ny)) continue;
      const muro = mapa[ny][nx] === "#";
      const np = p + (muro ? 1 : 0);
      if (np > paredes) continue;
      const k = clave(nx, ny, np);
      if (previo.has(k)) continue;
      previo.set(k, [x, y, p, nx, ny]);
      cola.push([nx, ny, np]);
    }
  }
  return null;
}

export function distancias(mapa, desde) {
  const dist = new Map();
  const cola = [desde];
  dist.set(desde.y * ANCHO + desde.x, 0);
  while (cola.length) {
    const { x, y } = cola.shift();
    const d = dist.get(y * ANCHO + x);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (!pasable(mapa, nx, ny) || dist.has(ny * ANCHO + nx)) continue;
      dist.set(ny * ANCHO + nx, d + 1);
      cola.push({ x: nx, y: ny });
    }
  }
  return dist;
}

export function celdaCiudadMasCercana(mapa, desde) {
  let mejor = null;
  for (let y = 6; y <= 8; y++) for (let x = 6; x <= 8; x++) {
    const c = camino(mapa, desde, { x, y });
    if (c && (!mejor || c.length < mejor.pasos)) mejor = { x, y, pasos: c.length };
  }
  return mejor;
}

// ---------- generación ----------
function mapaAleatorio(rng) {
  const mapa = [];
  for (let y = 0; y < ALTO; y++) {
    let fila = "";
    for (let x = 0; x < ANCHO; x++) {
      if (esCiudad(x, y)) fila += "C";
      else fila += rng() < 0.32 ? "#" : ".";
    }
    mapa.push(fila);
  }
  return mapa;
}

function colocar(mapa, rng, ch, cantidad, filtro) {
  let m = mapa;
  let intentos = 0;
  while (cantidad > 0 && intentos < 2000) {
    intentos++;
    const x = Math.floor(rng() * ANCHO), y = Math.floor(rng() * ALTO);
    if (m[y][x] !== "." || !filtro(x, y)) continue;
    m = ponerCelda(m, x, y, ch);
    cantidad--;
  }
  return m;
}

export function evaluarMapa(mapa, patron) {
  const estados = [];
  let m = mapa;
  for (let i = 0; i <= Math.floor(TURNOS_MAX / CICLO); i++) {
    estados.push(m);
    m = desplazarMapa(m, patron, i + 1);
  }
  const origen = { x: 7, y: 7 };
  const resumen = estados.map((e) => {
    const dist = distancias(e, origen);
    let salida = null;
    const hallazgos = [];
    for (let y = 0; y < ALTO; y++) for (let x = 0; x < ANCHO; x++) {
      const ch = e[y][x];
      if (ch === "S") salida = dist.get(y * ANCHO + x) ?? null;
      if (ch === "M" || ch === "K") hallazgos.push(dist.has(y * ANCHO + x));
    }
    const abiertas = e.join("").split("").filter((c) => c !== "#").length;
    return { alcanzables: dist.size, abiertas, salida, hallazgos };
  });
  const salidaAbierta = resumen.map((r) => r.salida !== null);
  const ventanas = salidaAbierta.slice(1).filter(Boolean).length;
  const distanciasOk = resumen.every((r) => r.salida === null || (r.salida >= 10 && r.salida <= 16));
  const ciudadOk = resumen.every((r) => r.alcanzables >= r.abiertas * 0.6);
  const nh = resumen[0].hallazgos.length;
  const hallazgosOk = Array.from({ length: nh }, (_, i) => resumen.filter((r) => r.hallazgos[i]).length >= Math.ceil(resumen.length / 2)).every(Boolean);
  const n = resumen.length - 1;
  const valido = !salidaAbierta[0] && ventanas >= Math.ceil(n / 4) && ventanas <= Math.ceil(n * 0.6) && distanciasOk && ciudadOk && hallazgosOk;
  return { valido, salidaAbierta, resumen };
}

export function generarMapa(semilla, patronFijo = null, dificultad = null) {
  const rng = crearRng(semilla);
  const patron = patronFijo || elegirPatron(rng, dificultad);
  for (let intento = 0; intento < 3000; intento++) {
    let m = mapaAleatorio(rng);
    // la salida va en un borde, lejos del centro
    const lado = Math.floor(rng() * 4);
    const k = 1 + Math.floor(rng() * (ANCHO - 2));
    const [sx, sy] = [[k, 0], [k, ALTO - 1], [0, k], [ANCHO - 1, k]][lado];
    if (m[sy][sx] === "#") m = ponerCelda(m, sx, sy, ".");
    m = ponerCelda(m, sx, sy, "S");
    const lejos = (x, y) => Math.abs(x - 7) + Math.abs(y - 7) >= 3;
    m = colocar(m, rng, "M", 10, lejos);
    m = colocar(m, rng, "K", 6, lejos);
    if (evaluarMapa(m, patron).valido) return { mapa: m, patron, intentos: intento + 1 };
  }
  return null;
}

// ---------- estado ----------
export const VISION = 1;            // radio de visión de un corredor (celdas, en cuadrado)
export const VISION_CIUDAD = 1;     // anillo visible alrededor de la ciudad

export function nuevaPartida(semilla = Date.now() % 1000000, patronFijo = null, dificultad = null) {
  const gen = generarMapa(semilla, patronFijo, dificultad);
  if (!gen) throw new Error("No se pudo generar un mapa válido con la semilla " + semilla);
  const conocido = Array.from({ length: ALTO }, () => "?".repeat(ANCHO));
  const vistoEn = Array.from({ length: ALTO }, () => new Array(ANCHO).fill(-1));
  const rngGente = crearRng(semilla + 99);
  const fuertes = ["rapido", "fuerte", "ojo"];
  for (let i = 2; i > 0; i--) { const j = Math.floor(rngGente() * (i + 1)); [fuertes[i], fuertes[j]] = [fuertes[j], fuertes[i]]; }
  const corredores = [];
  for (let i = 0; i < 3; i++) corredores.push(crearCorredor(i, rngGente, corredores, fuertes[i], i === 2));
  const s = {
    semilla, turno: 1, mapa: gen.mapa, patron: gen.patron, conocido, vistoEn, giro: 0,
    pistas: pistasDePatron(gen.patron, crearRng(semilla + 7)), pistasLeidas: [],
    historial: [],        // un registro por giro: { giro, antes, despues, cambios }
    comida: 14, materiales: 0, conocimiento: 0, hambre: 0, marcas: 0,
    huertos: 0, taller: false, enfermeria: false,
    balance: 0,           // facciones: -10 (quedarse) a +10 (salir)
    eventos: [], eventosDisparados: [], encierroHasta: 0, pendientes: [],
    corredores, salidaAlcanzada: false, salidaConocida: false,
    conocidoAnterior: null, cambiosGiro: [], cambiosEn: -100,
    lineasConocidas: {},  // "f3" o "c5" -> lo que la sala de mapas confirmó
    hipotesis: [],        // preguntas hechas en la sala de mapas, con su respuesta
    registro: [`El Claro despierta. Nadie sabe dónde está la salida: las marcas (K) del laberinto la señalan. Hacen falta ${MARCAS_PARA_SALIR}.`],
    fin: null,
  };
  return revelar(s);
}

// ---------- niebla ----------
// Lo que el jugador sabe del laberinto. '?' es desconocido. La salida solo aparece cuando se leyeron las marcas.
export function revelar(s) {
  const conocido = s.conocido.map((f) => f.split(""));
  const vistoEn = s.vistoEn.map((f) => f.slice());
  const ver = (cx, cy, r) => {
    for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) {
      if (!enTablero(x, y)) continue;
      let ch = s.mapa[y][x];
      if (ch === "S" && !s.salidaConocida) ch = ".";
      conocido[y][x] = ch; vistoEn[y][x] = s.giro;
    }
  };
  ver(7, 7, 1 + VISION_CIUDAD);
  for (const c of s.corredores) if (c.estado === "fuera") ver(c.x, c.y, c.ojo || VISION);
  return { ...s, conocido: conocido.map((f) => f.join("")), vistoEn };
}

export function visibleAhora(s) {
  const v = new Set();
  const marcar = (cx, cy, r) => { for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) if (enTablero(x, y)) v.add(y * ANCHO + x); };
  marcar(7, 7, 1 + VISION_CIUDAD);
  for (const c of s.corredores) if (c.estado === "fuera") marcar(c.x, c.y, c.ojo || VISION);
  return v;
}

// Mapa para planificar rutas: lo desconocido se supone transitable.
export function mapaPlan(s) { return s.conocido.map((f) => f.replace(/\?/g, ".")); }

// Para pruebas y depuración: destapa todo el mapa.
export function revelarTodo(s) {
  return { ...s, salidaConocida: true, conocido: s.mapa.slice(), vistoEn: s.vistoEn.map((f) => f.map(() => s.giro)) };
}

const log = (s, texto) => ({ ...s, registro: [...s.registro, texto] });

export function velocidad(s) { return s.taller ? 2 : 1; }
export function velocidadDe(s, c) { return (c && c.velocidad ? c.velocidad : 1) + (s.taller ? 1 : 0); }
export const activo = (c) => c.estado === "ciudad" || c.estado === "fuera" || c.estado === "herido" || c.estado === "caido" || c.estado === "llevado";
export function produccion(s) { return 3 + 2 * s.huertos; }
export const CONSUMO = 2;

// ---------- acciones del jugador (durante el turno) ----------
export function construir(s, que) {
  if (s.fin) return s;
  if (que === "huerto") {
    if (s.materiales < COSTO_HUERTO) return s;
    return ajustarBalance(log({ ...s, materiales: s.materiales - COSTO_HUERTO, huertos: s.huertos + 1 },
      `Se construye un huerto. Producción: ${produccion(s) + 2} comida por periodo.`), -1);
  }
  if (que === "taller") {
    if (s.taller || s.materiales < COSTO_TALLER) return s;
    return log({ ...s, materiales: s.materiales - COSTO_TALLER, taller: true },
      `Se construye el taller. Los corredores caminan una celda más por segundo. Los viajes duran menos y necesitan menos raciones.`);
  }
  if (que === "enfermeria") {
    if (s.enfermeria || s.materiales < COSTO_ENFERMERIA) return s;
    return ajustarBalance(log({ ...s, materiales: s.materiales - COSTO_ENFERMERIA, enfermeria: true },
      `Se construye la enfermería. Los heridos se recuperan en la mitad de tiempo.`), -1);
  }
  return s;
}
// ---------- facciones ----------
export const EVENTOS = {
  impaciencia: { umbral: 5, titulo: "Impaciencia", texto: "Los que quieren salir ya no esperan órdenes. Uno de los corredores se marcha solo, con tres raciones, hacia lo desconocido." },
  exodo: { umbral: 9, titulo: "Éxodo", texto: "Un grupo decide que la salida no vale la espera y se va de la ciudad para siempre. Un corredor se va con ellos." },
  miedo: { umbral: -5, titulo: "Miedo", texto: "Los que quieren quedarse esconden comida por si llega lo peor. La ciudad pierde 3 de comida." },
  encierro: { umbral: -9, titulo: "Encierro", texto: "Los que quieren quedarse cierran las puertas. Durante 30 segundos nadie sale de la ciudad." },
};

export function ajustarBalance(s, delta) {
  const balance = Math.max(-10, Math.min(10, s.balance + delta));
  s = { ...s, balance };
  for (const [id, ev] of Object.entries(EVENTOS)) {
    if (s.eventosDisparados.includes(id)) continue;
    if ((ev.umbral > 0 && balance >= ev.umbral) || (ev.umbral < 0 && balance <= ev.umbral)) s = dispararEvento(s, id);
  }
  return s;
}

function dispararEvento(s, id) {
  const ev = EVENTOS[id];
  s = { ...s, eventosDisparados: [...s.eventosDisparados, id], eventos: [...s.eventos, { id, turno: s.turno, titulo: ev.titulo, texto: ev.texto }] };
  s = log(s, `${ev.titulo}: ${ev.texto}`);
  const enCasa = s.corredores.filter((c) => c.estado === "ciudad" && c.lutoHasta <= s.turno);
  if (id === "impaciencia" && enCasa.length) {
    const c = enCasa[Math.floor(hash(s.semilla, s.turno, 1) % enCasa.length)];
    const plan = mapaPlan(s);
    const lejos = [];
    for (let y = 0; y < ALTO; y++) for (let x = 0; x < ANCHO; x++) if (s.conocido[y][x] === "?" && Math.abs(x - 7) + Math.abs(y - 7) >= 5) lejos.push({ x, y });
    const destino = lejos.length ? lejos[hash(s.semilla, s.turno, 2) % lejos.length] : null;
    const salida = destino && celdaCiudadMasCercana(plan, destino);
    if (salida) {
      const raciones = Math.min(3, s.comida);
      s = { ...s, comida: s.comida - raciones, corredores: s.corredores.map((k) => k.id === c.id ? { ...k, x: salida.x, y: salida.y, raciones: Math.max(1, raciones), destino, estado: "fuera" } : k) };
      s = log(s, `${c.nombre} se va por su cuenta hacia ${coord(destino)}.`);
    }
  }
  if (id === "exodo" && enCasa.length) {
    const c = enCasa[Math.floor(hash(s.semilla, s.turno, 3) % enCasa.length)];
    s = { ...s, corredores: s.corredores.map((k) => k.id === c.id ? { ...k, estado: "ido", destino: null } : k) };
    s = log(s, `${c.nombre} se va de la ciudad. No vuelve.`);
  }
  if (id === "miedo") s = { ...s, comida: Math.max(0, s.comida - 3) };
  if (id === "encierro") s = { ...s, encierroHasta: s.turno + TICKS_ENCIERRO };
  return s;
}

export function mejorar(s, id, atributo) {
  if (s.fin) return s;
  const c = s.corredores[id];
  if (!c || c.estado !== "ciudad" || s.conocimiento < COSTO_MEJORA) return s;
  const topes = { velocidad: 2, fuerza: 5, ojo: 2 };
  if (!(atributo in topes) || c[atributo] >= topes[atributo]) return s;
  const nombres = { velocidad: "velocidad", fuerza: "carga", ojo: "vista" };
  return log({ ...s, conocimiento: s.conocimiento - COSTO_MEJORA,
    corredores: s.corredores.map((k) => k.id === id ? { ...k, [atributo]: k[atributo] + 1 } : k) },
    `${c.nombre} estudia las marcas y mejora su ${nombres[atributo]}.`);
}

export function reclutar(s) {
  if (s.fin) return s;
  const vivos = s.corredores.filter(activo).length;
  if (vivos >= CORREDORES_MAX) return s;
  if (s.materiales < COSTO_RECLUTA.materiales || s.comida < COSTO_RECLUTA.comida) return s;
  const id = s.corredores.length;
  if (id >= NOMBRES.length) return s;
  const nuevo = crearCorredor(id, crearRng(s.semilla * 13 + id), s.corredores);
  return ajustarBalance(log({ ...s, materiales: s.materiales - COSTO_RECLUTA.materiales, comida: s.comida - COSTO_RECLUTA.comida,
    corredores: [...s.corredores, nuevo] }, `${nuevo.nombre} se une a los corredores. ${nuevo.historia[0]}`), 1);
}

// ---------- sala de mapas ----------
export const COSTO_CONSULTA = 1;
export const claveLinea = (tipo, indice) => (tipo === "fila" ? "f" : "c") + indice;
export const nombreLinea = (tipo, indice) => tipo === "fila" ? `fila ${indice + 1}` : `columna ${"ABCDEFGHIJKLMNO"[indice]}`;

// Describe lo que hace una línea: { glifo, texto, dir, modo }
export function comportamientoLinea(patron, tipo, indice) {
  const l = lineaDePatron(patron, tipo, indice);
  const h = tipo === "fila";
  if (!l) return { modo: "quieta", dir: 0, glifo: "•", texto: "no se mueve nunca" };
  const lado = (d) => h ? (d > 0 ? "derecha" : "izquierda") : (d > 0 ? "abajo" : "arriba");
  if (l.modo === "alterna") return { modo: l.modo, dir: l.dir, glifo: h ? "⇄" : "⇅", texto: `va y vuelve: un giro hacia la ${lado(l.dir)}, el siguiente hacia la ${lado(-l.dir)}` };
  const flecha = h ? (l.dir > 0 ? "→" : "←") : (l.dir > 0 ? "↓" : "↑");
  if (l.modo === "cada2") return { modo: l.modo, dir: l.dir, glifo: flecha + "₂", texto: `se desplaza una celda hacia la ${lado(l.dir)}, pero solo en los giros pares` };
  return { modo: l.modo, dir: l.dir, glifo: flecha, texto: `se desplaza una celda hacia la ${lado(l.dir)} en cada giro` };
}

// ---------- hipótesis ----------
// El jugador afirma algo sobre un grupo de líneas y el laberinto responde "sí", "no" o "en parte".
const Fs = (...is) => is.map((i) => ({ tipo: "fila", indice: i }));
const Cs = (...is) => is.map((i) => ({ tipo: "columna", indice: i }));
export const SUJETOS = [
  { id: "norte", nombre: "las filas pares del norte (2, 4, 6)", lineas: Fs(1, 3, 5) },
  { id: "sur", nombre: "las filas pares del sur (10, 12, 14)", lineas: Fs(9, 11, 13) },
  { id: "filasPares", nombre: "todas las filas pares", lineas: Fs(1, 3, 5, 9, 11, 13) },
  { id: "cercanas", nombre: "las filas pegadas a la ciudad (6 y 10)", lineas: Fs(5, 9) },
  { id: "lejanas", nombre: "las filas más lejanas (2 y 14)", lineas: Fs(1, 13) },
  { id: "oeste", nombre: "las columnas pares del oeste (B, D, F)", lineas: Cs(1, 3, 5) },
  { id: "este", nombre: "las columnas pares del este (J, L, N)", lineas: Cs(9, 11, 13) },
  { id: "columnasPares", nombre: "todas las columnas pares", lineas: Cs(1, 3, 5, 9, 11, 13) },
  { id: "borde", nombre: "el borde (filas 1 y 15, columnas A y O)", lineas: [...Fs(0, 14), ...Cs(0, 14)] },
  { id: "filasImpares", nombre: "las filas impares (3, 5, 11, 13)", lineas: Fs(2, 4, 10, 12) },
  { id: "columnasImpares", nombre: "las columnas impares (C, E, K, M)", lineas: Cs(2, 4, 10, 12) },
];
export const PREDICADOS = [
  { id: "mueve", nombre: "se mueven", prueba: (l) => !!l },
  { id: "quieta", nombre: "no se mueven", prueba: (l) => !l },
  { id: "positivo", nombre: "van hacia la derecha (o hacia abajo) en cada giro", prueba: (l) => !!l && l.modo === "fijo" && l.dir > 0 },
  { id: "negativo", nombre: "van hacia la izquierda (o hacia arriba) en cada giro", prueba: (l) => !!l && l.modo === "fijo" && l.dir < 0 },
  { id: "alterna", nombre: "van y vuelven", prueba: (l) => !!l && l.modo === "alterna" },
  { id: "cada2", nombre: "se mueven solo en los giros pares", prueba: (l) => !!l && l.modo === "cada2" },
];
// Predicados que, si la respuesta es "sí", dejan la línea completamente conocida.
const PREDICADOS_COMPLETOS = new Set(["quieta", "positivo", "negativo", "alterna", "cada2"]);

export function sujetoDe(id, indice) {
  if (id === "fila" || id === "columna") return { id, nombre: "la " + nombreLinea(id, indice), lineas: [{ tipo: id, indice }] };
  return SUJETOS.find((x) => x.id === id) || null;
}

export function evaluarHipotesis(patron, sujeto, predicado) {
  const aciertos = sujeto.lineas.filter((l) => predicado.prueba(lineaDePatron(patron, l.tipo, l.indice))).length;
  const total = sujeto.lineas.length;
  const respuesta = aciertos === total ? "sí" : aciertos === 0 ? "no" : "en parte";
  return { respuesta, aciertos, total };
}

export function preguntar(s, sujetoId, predicadoId, indice = null) {
  if (s.fin) return s;
  const sujeto = sujetoDe(sujetoId, indice);
  const predicado = PREDICADOS.find((p) => p.id === predicadoId);
  if (!sujeto || !predicado) return s;
  const clave = `${sujeto.id}:${indice ?? ""}:${predicado.id}`;
  if (s.hipotesis.some((h) => h.clave === clave)) return s;
  if (s.conocimiento < COSTO_CONSULTA) return s;
  const r = evaluarHipotesis(s.patron, sujeto, predicado);
  const texto = `${sujeto.nombre} ${predicado.nombre}`;
  const detalle = r.respuesta === "en parte" ? ` (${r.aciertos} de ${r.total})` : "";
  let lineasConocidas = s.lineasConocidas;
  if (r.respuesta === "sí" && PREDICADOS_COMPLETOS.has(predicado.id)) {
    lineasConocidas = { ...lineasConocidas };
    for (const l of sujeto.lineas) {
      const k = claveLinea(l.tipo, l.indice);
      if (!lineasConocidas[k]) lineasConocidas[k] = { tipo: l.tipo, indice: l.indice, ...comportamientoLinea(s.patron, l.tipo, l.indice) };
    }
  }
  const h = { clave, texto, respuesta: r.respuesta, aciertos: r.aciertos, total: r.total };
  return log({ ...s, conocimiento: s.conocimiento - COSTO_CONSULTA, lineasConocidas, hipotesis: [...s.hipotesis, h] },
    `Sala de mapas: «${texto}». Respuesta: ${r.respuesta}${detalle}.`);
}

export function consultarLinea(s, tipo, indice) {
  if (s.fin || indice < 0 || indice >= ANCHO) return s;
  const k = claveLinea(tipo, indice);
  if (s.lineasConocidas[k]) return s;
  if (s.conocimiento < COSTO_CONSULTA) return s;
  const r = comportamientoLinea(s.patron, tipo, indice);
  return log({ ...s, conocimiento: s.conocimiento - COSTO_CONSULTA, lineasConocidas: { ...s.lineasConocidas, [k]: { tipo, indice, ...r } } },
    `Sala de mapas: la ${nombreLinea(tipo, indice)} ${r.texto}.`);
}

export function enviar(s, id, destino, raciones) {
  if (s.fin) return s;
  const c = s.corredores[id];
  if (c.estado !== "ciudad") return s;
  if (c.lutoHasta > s.turno || s.encierroHasta > s.turno) return s;
  const plan = mapaPlan(s);
  if (!pasable(plan, destino.x, destino.y) || celda(plan, destino.x, destino.y) === "C") return s;
  raciones = Math.max(1, Math.min(RACIONES_MAX, raciones | 0));
  if (s.comida < raciones) return s;
  const salida = celdaCiudadMasCercana(plan, destino);
  if (!salida) return s;
  const corredores = s.corredores.map((k) => k.id === id ? { ...k, x: salida.x, y: salida.y, raciones, destino, estado: "fuera" } : k);
  return ajustarBalance(log({ ...s, comida: s.comida - raciones, corredores },
    `${c.nombre} sale con ${raciones} ${raciones === 1 ? "ración" : "raciones"}.`), 1);
}

export function cambiarDestino(s, id, destino) {
  if (s.fin) return s;
  const c = s.corredores[id];
  if (c.estado !== "fuera" || !pasable(mapaPlan(s), destino.x, destino.y)) return s;
  return { ...s, corredores: s.corredores.map((k) => k.id === id ? { ...k, destino } : k) };
}

export function volver(s, id) {
  const c = s.corredores[id];
  if (c.estado !== "fuera") return s;
  if (celda(s.mapa, c.x, c.y) === "C") return entrar(s, c);
  const objetivo = celdaCiudadMasCercana(mapaPlan(s), c) || { x: 7, y: 7 };
  return cambiarDestino(s, id, { x: objetivo.x, y: objetivo.y });
}

export function usarAtajo(s, id) {
  if (s.fin) return s;
  const c = s.corredores[id];
  if (c.estado !== "fuera" || c.atajo || s.conocimiento < COSTO_ATAJO) return s;
  return log({ ...s, conocimiento: s.conocimiento - COSTO_ATAJO,
    corredores: s.corredores.map((k) => k.id === id ? { ...k, atajo: true } : k) },
    `${c.nombre} estudia las marcas: podrá atravesar una pared.`);
}

function entrar(s, c) {
  const texto = c.carga > 0
    ? `${c.nombre} vuelve a la ciudad y deposita ${c.carga} ${c.carga === 1 ? "material" : "materiales"}.`
    : `${c.nombre} vuelve a la ciudad.`;
  const k = { ...c, ...casa(c.id), carga: 0, estado: "ciudad", destino: null, raciones: 0, atajo: false, lleva: null };
  let out = log({ ...s, materiales: s.materiales + c.carga, corredores: s.corredores.map((q) => q.id === c.id ? k : q) }, texto);
  if (c.lleva !== null) out = { ...out, pendientes: [...out.pendientes, { tipo: "herido", id: c.lleva }] };
  return out;
}

// ---------- fin de turno ----------
function moverCorredor(s, c) {
  if (c.estado !== "fuera" || !c.destino) return { s, c };
  let mapa = s.mapa;
  const plan = mapaPlan(s);
  if (plan[c.destino.y][c.destino.x] === "#") {
    return { s: log(s, `${c.nombre} descubre que su destino ${coord(c.destino)} es pared. Espera órdenes.`), c: { ...c, destino: null } };
  }
  const ruta = camino(plan, c, c.destino, c.atajo ? 1 : 0);
  if (!ruta) {
    return { s: log(s, `${c.nombre} no encuentra camino hacia ${coord(c.destino)} con lo que se sabe del laberinto. Espera.`), c };
  }
  let pasos = Math.min(velocidadDe(s, c), ruta.length);
  let { x, y, carga, atajo } = c;
  let comida = s.comida, materiales = s.materiales, conocimiento = s.conocimiento, marcas = s.marcas;
  let registro = s.registro.slice();
  let salidaAlcanzada = s.salidaAlcanzada, salidaConocida = s.salidaConocida, pistasLeidas = s.pistasLeidas;
  let estado = c.estado, destino = c.destino, raciones = c.raciones, lleva = c.lleva;
  let marcaLeida = false, rescate = null;
  for (let i = 0; i < pasos; i++) {
    const p = ruta[i];
    const ch = mapa[p.y][p.x];
    const veniaDeFuera = mapa[y][x] !== "C";
    if (ch === "#") {
      if (!atajo) { registro.push(`${c.nombre} se topa con una pared en ${coord(p)}.`); break; }
      atajo = false; registro.push(`${c.nombre} atraviesa una pared en ${coord(p)}.`);
    }
    x = p.x; y = p.y;
    if (ch === "M") {
      const n = 1 + (hash(s.semilla, s.turno, c.id, i) % 2);
      const toma = Math.min(n, (c.fuerza || CAPACIDAD) - carga);
      carga += toma;
      mapa = ponerCelda(mapa, x, y, ".");
      registro.push(`${c.nombre} encuentra escombros en ${coord(p)}: ${toma} ${toma === 1 ? "material" : "materiales"}.${toma < n ? " No puede cargar más." : ""}`);
    } else if (ch === "K") {
      conocimiento += 1; marcas += 1;
      mapa = ponerCelda(mapa, x, y, ".");
      const pista = s.pistas[pistasLeidas.length];
      if (pista) { pistasLeidas = [...pistasLeidas, pista]; registro.push(`La marca de ${coord(p)} dice: «${pista}».`); }
      const faltan = MARCAS_PARA_SALIR - marcas;
      marcaLeida = true;
      if (faltan > 0) registro.push(`${c.nombre} lee una marca en ${coord(p)}: +1 conocimiento. Faltan ${faltan} para saber dónde está la salida.`);
      else if (!salidaConocida) {
        salidaConocida = true;
        let sp = null;
        for (let yy = 0; yy < ALTO; yy++) for (let xx = 0; xx < ANCHO; xx++) if (s.mapa[yy][xx] === "S") sp = { x: xx, y: yy };
        registro.push(`${c.nombre} lee la última marca en ${coord(p)}. Juntas, señalan la salida: está en ${coord(sp)}.`);
      } else registro.push(`${c.nombre} lee una marca en ${coord(p)}: +1 conocimiento.`);
    } else if (ch === "S" && salidaConocida) {
      salidaAlcanzada = true;
      registro.push(`${c.nombre} cruza la salida en ${coord(p)}.`);
      estado = "salio"; destino = null;
      break;
    } else if (ch === "C" && veniaDeFuera) {
      if (carga > 0) registro.push(`${c.nombre} vuelve a la ciudad y deposita ${carga} ${carga === 1 ? "material" : "materiales"}.`);
      else registro.push(`${c.nombre} vuelve a la ciudad.`);
      materiales += carga; carga = 0;
      estado = "ciudad"; destino = null; raciones = 0; atajo = false;
      break;
    }
  }
  if (estado === "fuera" && destino && x === destino.x && y === destino.y) destino = null;
  if (estado === "fuera" && !destino && mapa[y][x] === "C") {
    if (carga > 0) registro.push(`${c.nombre} vuelve a la ciudad y deposita ${carga} ${carga === 1 ? "material" : "materiales"}.`);
    else registro.push(`${c.nombre} vuelve a la ciudad.`);
    materiales += carga; carga = 0; estado = "ciudad"; raciones = 0; atajo = false;
  }
  if (estado === "ciudad") {
    ({ x, y } = casa(c.id));
    if (lleva !== null) { rescate = lleva; lleva = null; }
  }
  let sOut = { ...s, mapa, comida, materiales, conocimiento, marcas, registro, salidaAlcanzada, salidaConocida, pistasLeidas };
  if (marcaLeida) sOut = ajustarBalance(sOut, 1);
  if (rescate !== null) sOut = { ...sOut, pendientes: [...sOut.pendientes, { tipo: "herido", id: rescate }] };
  if (salidaConocida && !s.salidaConocida) {
    // la salida aparece en el mapa conocido
    const conocido = sOut.conocido.map((f) => f.split(""));
    for (let yy = 0; yy < ALTO; yy++) for (let xx = 0; xx < ANCHO; xx++) if (mapa[yy][xx] === "S") conocido[yy][xx] = "S";
    sOut = { ...sOut, conocido: conocido.map((f) => f.join("")) };
  }
  return { s: sOut, c: { ...c, x, y, carga, atajo, estado, destino, raciones, lleva } };
}

function hash(...nums) {
  let h = 2166136261;
  for (const n of nums) { h ^= n + 1; h = Math.imul(h, 16777619); }
  return (h >>> 0) % 1000;
}

export const coord = (p) => "ABCDEFGHIJKLMNO"[p.x] + (p.y + 1);

export function avanzar(s) {
  if (s.fin) return s;
  const economia = s.turno % TICK_ECONOMIA === 0;
  // 1. ciudad
  if (economia) {
    let comida = Math.max(0, s.comida + produccion(s) - CONSUMO);
    const hambre = comida === 0 ? s.hambre + 1 : 0;
    s = { ...s, comida, hambre };
    if (hambre >= 2) {
      return { ...s, fin: { tipo: "derrota", motivo: "La ciudad pasó demasiado tiempo sin comida." },
        registro: [...s.registro, "Sigue sin haber comida. La ciudad cae."] };
    }
    if (hambre === 1) s = log(s, "No queda comida. Si sigue así, la ciudad cae.");
  }
  // 2. expediciones
  let corredores = s.corredores.slice();
  for (let i = 0; i < corredores.length; i++) {
    const r = moverCorredor(s, corredores[i]);
    s = r.s; corredores[i] = r.c;
  }
  // 2b. rescates: un corredor que pasa por donde cayó otro lo levanta y lo lleva
  corredores = corredores.map((c) => ({ ...c }));
  for (const c of corredores) {
    if (c.estado !== "fuera" || c.lleva !== null) continue;
    const caido = corredores.find((k) => k.estado === "caido" && k.x === c.x && k.y === c.y);
    if (caido) {
      c.lleva = caido.id; caido.estado = "llevado"; caido.destino = null;
      s = ajustarBalance(log(s, `${c.nombre} encuentra a ${caido.nombre} en ${coord(c)} y lo carga de vuelta.`), 1);
    }
  }
  // los llevados van donde va quien los lleva
  for (const c of corredores) if (c.lleva !== null) { const k = corredores.find((q) => q.id === c.lleva); if (k) { k.x = c.x; k.y = c.y; } }
  // llegados a la ciudad con alguien a cuestas: el rescatado queda herido
  for (const pend of s.pendientes) {
    if (pend.tipo !== "herido") continue;
    const k = corredores.find((q) => q.id === pend.id);
    if (k && k.estado === "llevado") { Object.assign(k, { estado: "herido", heridoEn: s.turno, ...casa(k.id), raciones: 0, carga: 0 }); s = log(s, `${k.nombre} llega a la enfermería. Se recupera en ${s.enfermeria ? TICKS_HERIDO_ENFERMERIA : TICKS_HERIDO} s.`); }
  }
  s = { ...s, pendientes: [] };
  // 3. raciones
  corredores = corredores.map((c) => {
    if (c.estado !== "fuera" || !economia) return c;
    const raciones = c.raciones - 1;
    if (raciones <= 0) {
      s = log(s, `${c.nombre} se queda sin raciones en ${coord(c)} y cae. Alguien tiene ${TICKS_CAIDO} s para llegar hasta ${c.nombre === "Ira" ? "ella" : "él o ella"}.`);
      return { ...c, raciones: 0, estado: "caido", caidoEn: s.turno, destino: null };
    }
    return { ...c, raciones };
  });
  // quien era llevado por alguien que acaba de caer, cae también
  for (const c of corredores) if (c.estado === "caido" && c.lleva !== null) {
    const k = corredores.find((q) => q.id === c.lleva);
    if (k && k.estado === "llevado") { Object.assign(k, { estado: "caido", caidoEn: s.turno, x: c.x, y: c.y }); }
    c.lleva = null;
  }
  // 3b. caídos que nadie alcanzó, y heridos que se recuperan
  corredores = corredores.map((c) => {
    if (c.estado === "caido" && s.turno - c.caidoEn >= TICKS_CAIDO) {
      s = log(s, `${c.nombre} muere en ${coord(c)}. Nadie llegó a tiempo.`);
      let delta = -2;
      for (const q of corredores) if (q.id !== c.id && activo(q) && unidos(c, q)) { q.lutoHasta = s.turno + TICKS_LUTO; delta -= 1; s = log(s, `${q.nombre} está de luto y no saldrá en ${TICKS_LUTO} s.`); }
      s = ajustarBalance(s, delta);
      return { ...c, estado: "muerto", destino: null };
    }
    if (c.estado === "herido" && s.turno - c.heridoEn >= (s.enfermeria ? TICKS_HERIDO_ENFERMERIA : TICKS_HERIDO)) {
      s = log(s, `${c.nombre} se recupera y vuelve a la plaza.`);
      return { ...c, estado: "ciudad", heridoEn: null };
    }
    return c;
  });
  s = revelar({ ...s, corredores });
  // 4. ciclo
  if (s.turno % CICLO === 0) {
    const giroNum = s.giro + 1;
    const mapa = desplazarMapa(s.mapa, s.patron, giroNum);
    corredores = s.corredores.map((c) => {
      if (c.estado !== "fuera" && c.estado !== "caido" && c.estado !== "llevado") return c;
      const p = desplazarCoord(c.x, c.y, s.patron, giroNum);
      return { ...c, x: p.x, y: p.y };
    });
    const anterior = s.conocido;
    s = revelar(log({ ...s, mapa, corredores, giro: s.giro + 1, conocidoAnterior: anterior }, "El laberinto gira. Algo cambió en las paredes."));
    const vis = visibleAhora(s);
    const cambios = [];
    for (const k of vis) {
      const x = k % ANCHO, y = Math.floor(k / ANCHO);
      if (anterior[y][x] !== "?" && anterior[y][x] !== s.conocido[y][x]) cambios.push({ x, y });
    }
    s = { ...s, cambiosGiro: cambios, cambiosEn: s.turno,
      historial: [...s.historial, { giro: giroNum, antes: anterior, despues: s.conocido, cambios }] };
    if (cambios.length) {
      const filas = [...new Set(cambios.map((p) => p.y + 1))].sort((a, b) => a - b);
      s = log(s, `A la vista cambiaron ${cambios.length} celdas, en ${filas.length === 1 ? "la fila" : "las filas"} ${filas.join(", ")}. Compara con el mapa de antes del giro.`);
    }
  }
  // 5. fin
  if (s.salidaAlcanzada) {
    s = { ...s, fin: { tipo: "victoria", motivo: "Un corredor encontró la salida." } };
  } else if (!s.corredores.some((c) => c.estado === "ciudad" || c.estado === "fuera" || c.estado === "herido")) {
    s = { ...s, fin: { tipo: "derrota", motivo: "No quedan corredores." } };
  } else if (s.turno >= TURNOS_MAX) {
    s = { ...s, fin: { tipo: "tiempo", motivo: "Se acabaron los turnos." } };
  }
  if (s.fin) return s;
  return { ...s, turno: s.turno + 1 };
}

export const terminarTurno = avanzar;
export const ticksHastaGiro = (s) => CICLO - ((s.turno - 1) % CICLO);
export const ticksHastaRacion = (s) => TICK_ECONOMIA - ((s.turno - 1) % TICK_ECONOMIA);

// Estima un viaje de ida y vuelta desde la ciudad hasta `destino` con el laberinto como está ahora.
// Devuelve null si no hay camino. `margen` suma raciones por si el laberinto gira en el camino.
export function estimarViaje(s, destino, margen = 1, c = null) {
  const plan = mapaPlan(s);
  const salida = celdaCiudadMasCercana(plan, destino);
  if (!salida) return null;
  const ida = camino(plan, salida, destino);
  if (!ida) return null;
  const vuelta = celdaCiudadMasCercana(plan, destino);
  const celdas = ida.length + (vuelta ? vuelta.pasos : ida.length);
  const ticks = Math.ceil(celdas / (c ? velocidadDe(s, c) : velocidad(s)));
  // lo desconocido puede esconder paredes: cada 4 celdas sin explorar en la ida suman una ración de margen
  const desconocidas = ida.filter((p) => s.conocido[p.y][p.x] === "?").length;
  const margenNiebla = Math.ceil(desconocidas / 4);
  const raciones = Math.min(RACIONES_MAX, Math.ceil(ticks / TICK_ECONOMIA) + margen + margenNiebla);
  return { ida: ida.length, vuelta: vuelta ? vuelta.pasos : null, celdas, ticks, raciones, desconocidas, margenNiebla };
}

// Ticks que le quedan a un corredor fuera antes de perderse, y si le alcanza para volver.
export function tiempoRestante(s, c) {
  if (c.estado !== "fuera") return null;
  const ticks = (c.raciones - 1) * TICK_ECONOMIA + ticksHastaRacion(s);
  const casa = celdaCiudadMasCercana(mapaPlan(s), c);
  const ticksVuelta = casa ? Math.ceil(casa.pasos / velocidadDe(s, c)) : null;
  return { ticks, ticksVuelta, alcanza: ticksVuelta !== null && ticksVuelta <= ticks };
}

export function puntos(s) {
  return s.materiales + s.conocimiento + (s.salidaAlcanzada ? PUNTOS_SALIDA : 0);
}
