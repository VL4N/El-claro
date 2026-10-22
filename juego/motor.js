// Motor de El Claro, fase 1. Lógica pura: cada función recibe un estado y devuelve uno nuevo.
// No toca el DOM. Se prueba con node y se usa desde index.html.

export const ANCHO = 15;
export const ALTO = 15;
// El tiempo avanza en "ticks" (un segundo de juego a velocidad normal).
export const TICK_ECONOMIA = 6;    // cada cuántos ticks la ciudad produce y consume, y los corredores gastan una ración
export const CICLO = 60;           // cada cuántos ticks gira el laberinto (un minuto)
export const TURNOS_MAX = 480;     // duración de la partida en ticks (8 minutos)
export const CAPACIDAD = 3;        // materiales que carga un corredor
export const COSTO_HUERTO = 4;
export const COSTO_TALLER = 5;
export const COSTO_ATAJO = 2;      // conocimiento para atravesar una pared
export const PUNTOS_SALIDA = 10;
export const RACIONES_MAX = 10;
export const MARCAS_PARA_SALIR = 4;   // marcas leídas que hacen falta para que la salida se abra

const NOMBRES = ["Ira", "Teo", "Noa", "Sol", "Bru", "Lía", "Eli", "Dan", "Uma"];
export const CORREDORES_MAX = 6;
export const COSTO_RECLUTA = { materiales: 3, comida: 2 };
// lugar de cada corredor en la plaza cuando está en la ciudad
export const casa = (id) => ({ x: 6 + (id % 3), y: 6 + Math.floor(id / 3) % 3 });
const FILAS_DERECHA = [1, 3, 5];     // filas (base 0) que giran a la derecha: mitad norte
const FILAS_IZQUIERDA = [9, 11, 13]; // filas que giran a la izquierda: mitad sur
export const FILAS_MOVILES = new Set([...FILAS_DERECHA, ...FILAS_IZQUIERDA]);

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

// ---------- cambio del laberinto ----------
export function desplazarMapa(mapa) {
  return mapa.map((fila, y) => {
    if (FILAS_DERECHA.includes(y)) return fila[fila.length - 1] + fila.slice(0, -1);
    if (FILAS_IZQUIERDA.includes(y)) return fila.slice(1) + fila[0];
    return fila;
  });
}

export function desplazarCoord(x, y) {
  if (FILAS_DERECHA.includes(y)) return { x: (x + 1) % ANCHO, y };
  if (FILAS_IZQUIERDA.includes(y)) return { x: (x + ANCHO - 1) % ANCHO, y };
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

export function evaluarMapa(mapa) {
  const estados = [];
  let m = mapa;
  for (let i = 0; i <= Math.floor(TURNOS_MAX / CICLO); i++) {
    estados.push(m);
    m = desplazarMapa(m);
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

export function generarMapa(semilla) {
  const rng = crearRng(semilla);
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
    if (evaluarMapa(m).valido) return { mapa: m, intentos: intento + 1 };
  }
  return null;
}

// ---------- estado ----------
export const VISION = 1;            // radio de visión de un corredor (celdas, en cuadrado)
export const VISION_CIUDAD = 1;     // anillo visible alrededor de la ciudad

export function nuevaPartida(semilla = Date.now() % 1000000) {
  const gen = generarMapa(semilla);
  if (!gen) throw new Error("No se pudo generar un mapa válido con la semilla " + semilla);
  const conocido = Array.from({ length: ALTO }, () => "?".repeat(ANCHO));
  const vistoEn = Array.from({ length: ALTO }, () => new Array(ANCHO).fill(-1));
  const corredores = NOMBRES.slice(0, 3).map((nombre, i) => ({
    id: i, nombre, ...casa(i), raciones: 0, carga: 0, destino: null,
    estado: "ciudad", atajo: false,
  }));
  const s = {
    semilla, turno: 1, mapa: gen.mapa, conocido, vistoEn, giro: 0,
    comida: 14, materiales: 0, conocimiento: 0, hambre: 0, marcas: 0,
    huertos: 0, taller: false,
    corredores, salidaAlcanzada: false, salidaConocida: false,
    conocidoAnterior: null, cambiosGiro: [], cambiosEn: -100,
    filasConocidas: {},   // fila (base 0) -> "derecha" | "izquierda" | "quieta", lo que la sala de mapas confirmó
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
  for (const c of s.corredores) if (c.estado === "fuera") ver(c.x, c.y, VISION);
  return { ...s, conocido: conocido.map((f) => f.join("")), vistoEn };
}

export function visibleAhora(s) {
  const v = new Set();
  const marcar = (cx, cy, r) => { for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) if (enTablero(x, y)) v.add(y * ANCHO + x); };
  marcar(7, 7, 1 + VISION_CIUDAD);
  for (const c of s.corredores) if (c.estado === "fuera") marcar(c.x, c.y, VISION);
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
export function produccion(s) { return 3 + 2 * s.huertos; }
export const CONSUMO = 2;

// ---------- acciones del jugador (durante el turno) ----------
export function construir(s, que) {
  if (s.fin) return s;
  if (que === "huerto") {
    if (s.materiales < COSTO_HUERTO) return s;
    return log({ ...s, materiales: s.materiales - COSTO_HUERTO, huertos: s.huertos + 1 },
      `Se construye un huerto. Producción: ${produccion(s) + 2} comida por turno.`);
  }
  if (que === "taller") {
    if (s.taller || s.materiales < COSTO_TALLER) return s;
    return log({ ...s, materiales: s.materiales - COSTO_TALLER, taller: true },
      `Se construye el taller. Los corredores ahora caminan el doble de rápido: 2 celdas por segundo. Los viajes duran la mitad y necesitan menos raciones.`);
  }
  return s;
}

export function reclutar(s) {
  if (s.fin) return s;
  const vivos = s.corredores.filter((c) => c.estado !== "perdido" && c.estado !== "salio").length;
  if (vivos >= CORREDORES_MAX) return s;
  if (s.materiales < COSTO_RECLUTA.materiales || s.comida < COSTO_RECLUTA.comida) return s;
  const id = s.corredores.length;
  if (id >= NOMBRES.length) return s;
  const nuevo = { id, nombre: NOMBRES[id], ...casa(id), raciones: 0, carga: 0, destino: null, estado: "ciudad", atajo: false };
  return log({ ...s, materiales: s.materiales - COSTO_RECLUTA.materiales, comida: s.comida - COSTO_RECLUTA.comida,
    corredores: [...s.corredores, nuevo] }, `${nuevo.nombre} se une a los corredores.`);
}

// ---------- sala de mapas ----------
export const COSTO_CONSULTA = 1;
export function comportamientoFila(y) {
  if (FILAS_DERECHA.includes(y)) return "derecha";
  if (FILAS_IZQUIERDA.includes(y)) return "izquierda";
  return "quieta";
}
export function consultarFila(s, y) {
  if (s.fin || !enTablero(0, y)) return s;
  if (s.filasConocidas[y]) return s;
  if (s.conocimiento < COSTO_CONSULTA) return s;
  const r = comportamientoFila(y);
  const texto = { derecha: "se desplaza una celda a la derecha en cada giro", izquierda: "se desplaza una celda a la izquierda en cada giro", quieta: "no se mueve nunca" }[r];
  return log({ ...s, conocimiento: s.conocimiento - COSTO_CONSULTA, filasConocidas: { ...s.filasConocidas, [y]: r } },
    `Sala de mapas: la fila ${y + 1} ${texto}.`);
}

export function enviar(s, id, destino, raciones) {
  if (s.fin) return s;
  const c = s.corredores[id];
  if (c.estado !== "ciudad") return s;
  const plan = mapaPlan(s);
  if (!pasable(plan, destino.x, destino.y) || celda(plan, destino.x, destino.y) === "C") return s;
  raciones = Math.max(1, Math.min(RACIONES_MAX, raciones | 0));
  if (s.comida < raciones) return s;
  const salida = celdaCiudadMasCercana(plan, destino);
  if (!salida) return s;
  const corredores = s.corredores.map((k) => k.id === id ? { ...k, x: salida.x, y: salida.y, raciones, destino, estado: "fuera" } : k);
  return log({ ...s, comida: s.comida - raciones, corredores },
    `${c.nombre} sale con ${raciones} ${raciones === 1 ? "ración" : "raciones"}.`);
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
  const k = { ...c, ...casa(c.id), carga: 0, estado: "ciudad", destino: null, raciones: 0, atajo: false };
  return log({ ...s, materiales: s.materiales + c.carga, corredores: s.corredores.map((q) => q.id === c.id ? k : q) }, texto);
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
  let pasos = Math.min(velocidad(s), ruta.length);
  let { x, y, carga, atajo } = c;
  let comida = s.comida, materiales = s.materiales, conocimiento = s.conocimiento, marcas = s.marcas;
  let registro = s.registro.slice();
  let salidaAlcanzada = s.salidaAlcanzada, salidaConocida = s.salidaConocida;
  let estado = c.estado, destino = c.destino, raciones = c.raciones;
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
      const toma = Math.min(n, CAPACIDAD - carga);
      carga += toma;
      mapa = ponerCelda(mapa, x, y, ".");
      registro.push(`${c.nombre} encuentra escombros en ${coord(p)}: ${toma} ${toma === 1 ? "material" : "materiales"}.${toma < n ? " No puede cargar más." : ""}`);
    } else if (ch === "K") {
      conocimiento += 1; marcas += 1;
      mapa = ponerCelda(mapa, x, y, ".");
      const faltan = MARCAS_PARA_SALIR - marcas;
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
  if (estado === "ciudad") { ({ x, y } = casa(c.id)); }
  let sOut = { ...s, mapa, comida, materiales, conocimiento, marcas, registro, salidaAlcanzada, salidaConocida };
  if (salidaConocida && !s.salidaConocida) {
    // la salida aparece en el mapa conocido
    const conocido = sOut.conocido.map((f) => f.split(""));
    for (let yy = 0; yy < ALTO; yy++) for (let xx = 0; xx < ANCHO; xx++) if (mapa[yy][xx] === "S") conocido[yy][xx] = "S";
    sOut = { ...sOut, conocido: conocido.map((f) => f.join("")) };
  }
  return { s: sOut, c: { ...c, x, y, carga, atajo, estado, destino, raciones } };
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
  // 3. raciones
  corredores = corredores.map((c) => {
    if (c.estado !== "fuera" || !economia) return c;
    const raciones = c.raciones - 1;
    if (raciones <= 0) {
      s = log(s, `${c.nombre} se queda sin raciones en ${coord(c)}. Se pierde en el laberinto.`);
      return { ...c, raciones: 0, estado: "perdido", destino: null };
    }
    return { ...c, raciones };
  });
  s = revelar({ ...s, corredores });
  // 4. ciclo
  if (s.turno % CICLO === 0) {
    const mapa = desplazarMapa(s.mapa);
    corredores = s.corredores.map((c) => {
      if (c.estado !== "fuera") return c;
      const p = desplazarCoord(c.x, c.y);
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
    s = { ...s, cambiosGiro: cambios, cambiosEn: s.turno };
    if (cambios.length) {
      const filas = [...new Set(cambios.map((p) => p.y + 1))].sort((a, b) => a - b);
      s = log(s, `A la vista cambiaron ${cambios.length} celdas, en ${filas.length === 1 ? "la fila" : "las filas"} ${filas.join(", ")}. Compara con el mapa de antes del giro.`);
    }
  }
  // 5. fin
  if (s.salidaAlcanzada) {
    s = { ...s, fin: { tipo: "victoria", motivo: "Un corredor encontró la salida." } };
  } else if (s.corredores.every((c) => c.estado === "perdido")) {
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
export function estimarViaje(s, destino, margen = 1) {
  const plan = mapaPlan(s);
  const salida = celdaCiudadMasCercana(plan, destino);
  if (!salida) return null;
  const ida = camino(plan, salida, destino);
  if (!ida) return null;
  const vuelta = celdaCiudadMasCercana(plan, destino);
  const celdas = ida.length + (vuelta ? vuelta.pasos : ida.length);
  const ticks = Math.ceil(celdas / velocidad(s));
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
  const ticksVuelta = casa ? Math.ceil(casa.pasos / velocidad(s)) : null;
  return { ticks, ticksVuelta, alcanza: ticksVuelta !== null && ticksVuelta <= ticks };
}

export function puntos(s) {
  return s.materiales + s.conocimiento + (s.salidaAlcanzada ? PUNTOS_SALIDA : 0);
}
