// Motor de El Claro, fase 1. Lógica pura: cada función recibe un estado y devuelve uno nuevo.
// No toca el DOM. Se prueba con node y se usa desde index.html.

export const ANCHO = 15;
export const ALTO = 15;
export const CICLO = 4;            // cada cuántos turnos cambia el laberinto
export const TURNOS_MAX = 24;
export const CAPACIDAD = 3;        // materiales que carga un corredor
export const COSTO_HUERTO = 4;
export const COSTO_TALLER = 5;
export const COSTO_ATAJO = 2;      // conocimiento para atravesar una pared
export const PUNTOS_SALIDA = 10;

const NOMBRES = ["Ira", "Teo", "Noa"];
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
  for (let i = 0; i <= TURNOS_MAX / CICLO; i++) {
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
  const n = resumen[0].hallazgos.length;
  const hallazgosOk = Array.from({ length: n }, (_, i) => resumen.filter((r) => r.hallazgos[i]).length >= 3).every(Boolean);
  const valido = !salidaAbierta[0] && ventanas >= 2 && ventanas <= 4 && distanciasOk && ciudadOk && hallazgosOk;
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
export function nuevaPartida(semilla = Date.now() % 1000000) {
  const gen = generarMapa(semilla);
  if (!gen) throw new Error("No se pudo generar un mapa válido con la semilla " + semilla);
  const corredores = NOMBRES.map((nombre, i) => ({
    id: i, nombre, x: 6 + i, y: 7, raciones: 0, carga: 0, destino: null,
    estado: "ciudad", atajo: false,
  }));
  return {
    semilla, turno: 1, mapa: gen.mapa,
    comida: 10, materiales: 0, conocimiento: 0, hambre: 0,
    huertos: 0, taller: false,
    corredores, salidaAlcanzada: false,
    registro: [`Turno 1. El Claro despierta. Tres corredores esperan en la plaza.`],
    fin: null,
  };
}

const log = (s, texto) => ({ ...s, registro: [...s.registro, texto] });

export function velocidad(s) { return s.taller ? 3 : 2; }
export function produccion(s) { return 2 + 2 * s.huertos; }
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
      `Se construye el taller. Los corredores ahora se mueven 3 celdas por turno.`);
  }
  return s;
}

export function enviar(s, id, destino, raciones) {
  if (s.fin) return s;
  const c = s.corredores[id];
  if (c.estado !== "ciudad") return s;
  if (!pasable(s.mapa, destino.x, destino.y) || celda(s.mapa, destino.x, destino.y) === "C") return s;
  raciones = Math.max(1, Math.min(8, raciones | 0));
  if (s.comida < raciones) return s;
  const salida = celdaCiudadMasCercana(s.mapa, destino);
  if (!salida) return s;
  const corredores = s.corredores.map((k) => k.id === id ? { ...k, x: salida.x, y: salida.y, raciones, destino, estado: "fuera" } : k);
  return log({ ...s, comida: s.comida - raciones, corredores },
    `${c.nombre} sale con ${raciones} ${raciones === 1 ? "ración" : "raciones"}.`);
}

export function cambiarDestino(s, id, destino) {
  if (s.fin) return s;
  const c = s.corredores[id];
  if (c.estado !== "fuera" || !pasable(s.mapa, destino.x, destino.y)) return s;
  return { ...s, corredores: s.corredores.map((k) => k.id === id ? { ...k, destino } : k) };
}

export function volver(s, id) {
  const c = s.corredores[id];
  if (c.estado !== "fuera") return s;
  if (celda(s.mapa, c.x, c.y) === "C") return entrar(s, c);
  const objetivo = celdaCiudadMasCercana(s.mapa, c) || { x: 7, y: 7 };
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
  const k = { ...c, x: 6 + c.id, y: 7, carga: 0, estado: "ciudad", destino: null, raciones: 0, atajo: false };
  return log({ ...s, materiales: s.materiales + c.carga, corredores: s.corredores.map((q) => q.id === c.id ? k : q) }, texto);
}

// ---------- fin de turno ----------
function moverCorredor(s, c) {
  if (c.estado !== "fuera" || !c.destino) return { s, c };
  let mapa = s.mapa;
  const ruta = camino(mapa, c, c.destino, c.atajo ? 1 : 0);
  if (!ruta) {
    return { s: log(s, `${c.nombre} no encuentra camino hacia su destino. Espera.`), c };
  }
  let pasos = Math.min(velocidad(s), ruta.length);
  let { x, y, carga, atajo } = c;
  let comida = s.comida, materiales = s.materiales, conocimiento = s.conocimiento;
  let registro = s.registro.slice();
  let salidaAlcanzada = s.salidaAlcanzada;
  let estado = c.estado, destino = c.destino, raciones = c.raciones;
  for (let i = 0; i < pasos; i++) {
    const p = ruta[i];
    const ch = mapa[p.y][p.x];
    const veniaDeFuera = mapa[y][x] !== "C";
    if (ch === "#") { atajo = false; registro.push(`${c.nombre} atraviesa una pared en ${coord(p)}.`); }
    x = p.x; y = p.y;
    if (ch === "M") {
      const n = 1 + (hash(s.semilla, s.turno, c.id, i) % 2);
      const toma = Math.min(n, CAPACIDAD - carga);
      carga += toma;
      mapa = ponerCelda(mapa, x, y, ".");
      registro.push(`${c.nombre} encuentra escombros en ${coord(p)}: ${toma} ${toma === 1 ? "material" : "materiales"}.${toma < n ? " No puede cargar más." : ""}`);
    } else if (ch === "K") {
      conocimiento += 1;
      mapa = ponerCelda(mapa, x, y, ".");
      registro.push(`${c.nombre} lee una marca en ${coord(p)}: +1 conocimiento.`);
    } else if (ch === "S") {
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
  if (estado === "ciudad") { x = 6 + c.id; y = 7; }
  return {
    s: { ...s, mapa, comida, materiales, conocimiento, registro, salidaAlcanzada },
    c: { ...c, x, y, carga, atajo, estado, destino, raciones },
  };
}

function hash(...nums) {
  let h = 2166136261;
  for (const n of nums) { h ^= n + 1; h = Math.imul(h, 16777619); }
  return (h >>> 0) % 1000;
}

export const coord = (p) => "ABCDEFGHIJKLMNO"[p.x] + (p.y + 1);

export function terminarTurno(s) {
  if (s.fin) return s;
  // 1. ciudad
  let comida = Math.max(0, s.comida + produccion(s) - CONSUMO);
  const hambre = comida === 0 ? s.hambre + 1 : 0;
  s = { ...s, comida, hambre };
  if (hambre >= 2) {
    return { ...s, fin: { tipo: "derrota", motivo: "La ciudad pasó dos turnos sin comida." },
      registro: [...s.registro, "Segundo turno sin comida. La ciudad cae."] };
  }
  if (hambre === 1) s = log(s, "No queda comida. Si el próximo turno termina igual, la ciudad cae.");
  // 2. expediciones
  let corredores = s.corredores.slice();
  for (let i = 0; i < corredores.length; i++) {
    const r = moverCorredor(s, corredores[i]);
    s = r.s; corredores[i] = r.c;
  }
  // 3. raciones
  corredores = corredores.map((c) => {
    if (c.estado !== "fuera") return c;
    const raciones = c.raciones - 1;
    if (raciones <= 0) {
      s = log(s, `${c.nombre} se queda sin raciones en ${coord(c)}. Se pierde en el laberinto.`);
      return { ...c, raciones: 0, estado: "perdido", destino: null };
    }
    return { ...c, raciones };
  });
  s = { ...s, corredores };
  // 4. ciclo
  if (s.turno % CICLO === 0) {
    const mapa = desplazarMapa(s.mapa);
    corredores = s.corredores.map((c) => {
      if (c.estado !== "fuera") return c;
      const p = desplazarCoord(c.x, c.y);
      return { ...c, x: p.x, y: p.y };
    });
    s = log({ ...s, mapa, corredores }, "El laberinto gira. Las filas marcadas se desplazan una celda.");
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
  s = { ...s, turno: s.turno + 1 };
  const faltan = CICLO - ((s.turno - 1) % CICLO);
  return log(s, `Turno ${s.turno}. ${faltan === 1 ? "El laberinto gira al final de este turno." : `Faltan ${faltan} turnos para el próximo giro.`}`);
}

export function puntos(s) {
  return s.materiales + s.conocimiento + (s.salidaAlcanzada ? PUNTOS_SALIDA : 0);
}
