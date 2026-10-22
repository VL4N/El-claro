// Pruebas del motor. Ejecutar: node juego/pruebas.mjs
import * as M from "./motor.js";

let fallos = 0;
const ok = (cond, msg) => { if (!cond) { fallos++; console.log("FALLA:", msg); } };

// 1. generación: tasa de éxito y criterios
let generados = 0, intentosTotal = 0;
for (let semilla = 1; semilla <= 30; semilla++) {
  const g = M.generarMapa(semilla);
  ok(g, `semilla ${semilla} sin mapa válido`);
  if (!g) continue;
  generados++; intentosTotal += g.intentos;
  const ev = M.evaluarMapa(g.mapa, g.patron);
  ok(ev.valido, `semilla ${semilla}: evaluación inválida`);
  ok(!ev.salidaAbierta[0], `semilla ${semilla}: salida abierta al inicio`);
  ok(g.mapa.length === 15 && g.mapa.every((f) => f.length === 15), `semilla ${semilla}: tamaño`);
  ok(g.mapa[7][7] === "C", `semilla ${semilla}: ciudad en el centro`);
}
console.log(`mapas válidos: ${generados}/30, intentos promedio: ${(intentosTotal / generados).toFixed(1)}`);

// 2. desplazamiento: conserva celdas, la ciudad nunca se mueve, y cada patrón de la biblioteca es válido
{
  const base = M.BIBLIOTECA[0];
  const g = M.generarMapa(3, base).mapa;
  let m = g;
  for (let i = 1; i <= 15; i++) m = M.desplazarMapa(m, base, i);
  ok(m.join("") === g.join(""), "15 desplazamientos fijos deben volver al inicio");
  for (const patron of M.BIBLIOTECA) {
    for (const l of patron.lineas) ok(l.indice < 6 || l.indice > 8, `${patron.nombre}: la línea ${l.indice} cruza la ciudad`);
    const gen = M.generarMapa(11, patron);
    ok(gen, `${patron.nombre}: no se pudo generar un mapa válido`);
    if (!gen) continue;
    let mm = gen.mapa;
    for (let i = 1; i <= 8; i++) {
      mm = M.desplazarMapa(mm, patron, i);
      ok(mm.join("").length === 225 && mm.join("").split("").filter((c) => c === "C").length === 9, `${patron.nombre}: giro ${i} rompe el mapa`);
      for (let y = 6; y <= 8; y++) for (let x = 6; x <= 8; x++) ok(mm[y][x] === "C", `${patron.nombre}: la ciudad se movió en el giro ${i}`);
    }
    const x = 2, y = 1;
    const ch = gen.mapa[y][x];
    const p = M.desplazarCoord(x, y, patron, 1);
    ok(M.desplazarMapa(gen.mapa, patron, 1)[p.y][p.x] === ch, `${patron.nombre}: desplazarCoord no sigue a la celda`);
  }
  const marea = M.BIBLIOTECA.find((p) => p.nombre === "marea");
  const gm = M.generarMapa(5, marea).mapa;
  ok(M.desplazarMapa(M.desplazarMapa(gm, marea, 1), marea, 2).join("") === gm.join(""), "marea: dos giros vuelven al inicio");
}

// 3. enviar, mover, volver y depositar
{
  let s = M.nuevaPartida(3);
  const comida0 = s.comida;
  s = M.enviar(s, 0, { x: 7, y: 2 }, 5);
  ok(s.comida === comida0 - 5, "enviar cobra raciones");
  ok(s.corredores[0].estado === "fuera", "corredor sale");
  for (let i = 0; i < M.TICK_ECONOMIA; i++) s = M.avanzar(s);
  ok(s.corredores[0].raciones === 4 || s.corredores[0].estado === "ciudad", "gasta una ración por periodo de economía");
  ok(s.turno === M.TICK_ECONOMIA + 1, "avanza el tiempo");
  s = M.volver(s, 0);
  for (let i = 0; i < 60 && s.corredores[0].estado === "fuera"; i++) s = M.avanzar(s);
  ok(s.corredores[0].estado === "ciudad" || s.corredores[0].estado === "perdido", "vuelve o se pierde");
}

// 4. sin raciones se pierde
{
  let s = M.nuevaPartida(5);
  const d = M.distancias(s.mapa, { x: 7, y: 7 });
  let lejos = null;
  for (const [k, v] of d) if (v >= 4 && !M.esCiudad(k % 15, Math.floor(k / 15))) { lejos = { x: k % 15, y: Math.floor(k / 15) }; break; }
  s = M.enviar(s, 1, lejos, 1);
  ok(s.corredores[1].estado === "fuera", "sale con 1 ración");
  s = M.cambiarDestino(s, 1, lejos);
  for (let i = 0; i < M.TICK_ECONOMIA; i++) s = M.avanzar(s);
  ok(s.corredores[1].estado === "perdido", "con 1 ración se pierde al terminar el primer periodo");
}

// 4b. casos de la ciudad
{
  let s = M.nuevaPartida(3);
  const antes = s.comida;
  s = M.enviar(s, 0, { x: 7, y: 7 }, 3);
  ok(s.comida === antes && s.corredores[0].estado === "ciudad", "no se puede enviar a una celda de la ciudad");
  // destino al este: parte desde el borde este de la ciudad
  let dest = null;
  for (let x = 14; x >= 9 && !dest; x--) for (let y = 5; y <= 9 && !dest; y++) if (M.camino(s.mapa, { x: 8, y: 7 }, { x, y })) dest = { x, y };
  if (dest) {
    s = M.enviar(s, 0, dest, 6);
    ok(s.corredores[0].estado === "fuera" && M.esCiudad(s.corredores[0].x, s.corredores[0].y), "sale desde una celda de la ciudad");
    s = M.avanzar(s);
    ok(s.corredores[0].estado === "fuera", "al salir hacia el este no vuelve a entrar por error");
    s = M.volver(s, 0);
    let g = 0;
    while (s.corredores[0].estado === "fuera" && g++ < 80) { s = M.volver(s, 0); s = M.avanzar(s); }
    ok(s.corredores[0].estado !== "fuera", "volver termina con el corredor en la ciudad o perdido");
    if (s.corredores[0].estado === "ciudad") ok(s.corredores[0].x === M.casa(0).x && s.corredores[0].y === M.casa(0).y, "al volver ocupa su lugar en la plaza");
  }
}

// 4c. estimaciones
{
  let s = M.nuevaPartida(3);
  const d = M.distancias(s.mapa, { x: 7, y: 7 });
  let lejos = null;
  for (const [k, v] of d) if (v >= 5 && !M.esCiudad(k % 15, Math.floor(k / 15))) { lejos = { x: k % 15, y: Math.floor(k / 15) }; break; }
  const e = M.estimarViaje(s, lejos);
  ok(e && e.ida > 0 && e.celdas >= e.ida && e.raciones >= 1 && e.raciones <= M.RACIONES_MAX, "estimación de viaje coherente");
  ok(M.estimarViaje(s, { x: 7, y: 7 }) === null || true, "estimar a la ciudad no rompe");
  s = M.enviar(s, 0, lejos, e.raciones);
  const t = M.tiempoRestante(s, s.corredores[0]);
  ok(t && t.ticks > 0 && t.alcanza, "con las raciones recomendadas alcanza para volver");
  ok(M.tiempoRestante(s, s.corredores[1]) === null, "en la ciudad no hay tiempo restante");
}

// 4d. reclutar
{
  let s = { ...M.nuevaPartida(3), materiales: 7, comida: 10 };
  s = M.reclutar(s);
  ok(s.corredores.length === 4 && s.corredores[3].estado === "ciudad" && M.esCiudad(s.corredores[3].x, s.corredores[3].y), "recluta un cuarto corredor en la plaza");
  ok(s.materiales === 4 && s.comida === 8, "reclutar cobra materiales y comida");
  s = M.reclutar(s); s = M.reclutar(s);
  ok(s.corredores.length === 5, "sin materiales no recluta");
  s = { ...s, materiales: 30, comida: 30 };
  for (let i = 0; i < 5; i++) s = M.reclutar(s);
  ok(s.corredores.length === M.CORREDORES_MAX, "respeta el máximo de corredores");
}

// 4e. sala de mapas
{
  let s = { ...M.nuevaPartida(3, M.BIBLIOTECA[0]), conocimiento: 2 };
  s = M.consultarLinea(s, "fila", 1);
  ok(s.lineasConocidas.f1 && s.lineasConocidas.f1.dir === 1 && s.conocimiento === 1, "consultar una fila móvil del norte");
  s = M.consultarLinea(s, "fila", 7);
  ok(s.lineasConocidas.f7 && s.lineasConocidas.f7.modo === "quieta" && s.conocimiento === 0, "la fila de la ciudad está quieta");
  s = M.consultarLinea(s, "fila", 13);
  ok(s.lineasConocidas.f13 === undefined, "sin conocimiento no se consulta");
  s = M.consultarLinea({ ...s, conocimiento: 1 }, "fila", 7);
  ok(s.conocimiento === 1, "una línea ya conocida no se cobra");
  const marea = M.BIBLIOTECA.find((p) => p.nombre === "marea");
  let s2 = { ...M.nuevaPartida(3, marea), conocimiento: 1 };
  s2 = M.consultarLinea(s2, "fila", 1);
  ok(s2.lineasConocidas.f1.modo === "alterna" && s2.lineasConocidas.f1.glifo === "⇄", "describe una fila que alterna");
}

// 4f. pistas e historial
{
  let s = M.nuevaPartida(3, M.BIBLIOTECA[6]); // marea
  ok(s.pistas.length === 1 + M.BIBLIOTECA[6].lineas.length && s.pistas[0] === M.BIBLIOTECA[6].pista, "las pistas empiezan por la idea general");
  ok(s.pistas.slice(1).every((t) => /se mueve/.test(t)), "las demás pistas nombran una línea que se mueve");
  ok(s.pistas.slice(1).some((t) => /no siempre hacia el mismo lado/.test(t)), "la marea avisa que alterna");
  s = M.revelarTodo(s);
  let k = null;
  for (let y = 0; y < 15 && !k; y++) for (let x = 0; x < 15 && !k; x++) if (s.mapa[y][x] === "K" && M.camino(s.mapa, { x: 7, y: 7 }, { x, y })) k = { x, y };
  s = M.enviar(s, 0, k, 10);
  for (let i = 0; i < 40 && s.pistasLeidas.length === 0; i++) { s = M.revelarTodo(s); s = M.cambiarDestino(s, 0, k); s = M.avanzar(s); }
  ok(s.pistasLeidas.length === 1 && s.pistasLeidas[0] === s.pistas[0], "leer una marca revela la primera pista");
  for (let i = 0; i < M.CICLO * 2; i++) s = M.avanzar(s);
  ok(s.historial.length === 2 && s.historial[0].giro === 1 && s.historial[1].giro === 2, "el historial guarda un registro por giro");
  ok(Array.isArray(s.historial[0].cambios) && s.historial[0].antes.length === 15, "cada registro tiene el mapa de antes y los cambios");
}

// 4g. dificultad
{
  for (let d = 1; d <= 5; d++) for (let semilla = 1; semilla <= 6; semilla++) {
    const pat = M.elegirPatron(M.crearRng(semilla * 31 + d), d);
    ok(d === 5 ? pat.dificultad >= 4 : pat.dificultad === d, `dificultad ${d}: eligió ${pat.nombre} (${pat.dificultad})`);
  }
  const s = M.nuevaPartida(9, null, 2);
  ok(s.patron.dificultad === 2, "nuevaPartida respeta la dificultad");
  ok(M.dificultadSugerida(0) === 1 && M.dificultadSugerida(3) === 4 && M.dificultadSugerida(40) === 5, "la dificultad sugerida sube con las victorias y se frena en 5");
  const nombres = new Set();
  for (let i = 0; i < 30; i++) nombres.add(M.elegirPatron(M.crearRng(i), 1).nombre);
  ok(nombres.size === 3, "en dificultad 1 aparecen los tres patrones fáciles");
}

// 5. atajo atraviesa una pared
{
  const mapa = ["#####", "#C#.#", "#####", "#####", "#####"];
  const c = M.camino(mapa, { x: 1, y: 1 }, { x: 3, y: 1 }, 1);
  ok(c && c.length === 2, "camino con una pared permitida");
  ok(M.camino(mapa, { x: 1, y: 1 }, { x: 3, y: 1 }, 0) === null, "sin atajo no hay camino");
}

// 6. partidas aleatorias completas: nunca rompen y siempre terminan
{
  const rng = M.crearRng(99);
  const resultados = { victoria: 0, derrota: 0, tiempo: 0 };
  for (let p = 0; p < 40; p++) {
    let s = M.nuevaPartida(100 + p);
    let guard = 0;
    while (!s.fin && guard++ < 2000) {
      for (const c of s.corredores) {
        if (c.estado === "ciudad" && rng() < 0.1) {
          const x = Math.floor(rng() * 15), y = Math.floor(rng() * 15);
          s = M.enviar(s, c.id, { x, y }, 2 + Math.floor(rng() * 5));
        } else if (c.estado === "fuera" && !c.destino) {
          s = M.volver(s, c.id);
        }
      }
      if (rng() < 0.3) s = M.construir(s, "huerto");
      if (rng() < 0.3) s = M.construir(s, "taller");
      s = M.avanzar(s);
    }
    ok(s.fin, `partida ${p} no terminó`);
    if (s.fin) resultados[s.fin.tipo]++;
    ok(s.comida >= 0 && s.materiales >= 0 && s.conocimiento >= 0, `partida ${p}: recursos negativos`);
  }
  console.log("partidas al azar:", JSON.stringify(resultados));
}

// 6b. la salida oculta no da la victoria
{
  let s = M.revelarTodo(M.nuevaPartida(2));
  s = { ...s, salidaConocida: false };
  let sal = null;
  for (let y = 0; y < 15; y++) for (let x = 0; x < 15; x++) if (s.mapa[y][x] === "S") sal = { x, y };
  // forzamos un corredor al lado de la salida y lo mandamos
  const vecino = [[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy]) => ({ x: sal.x + dx, y: sal.y + dy })).find((p) => M.pasable(s.mapa, p.x, p.y));
  s = { ...s, corredores: s.corredores.map((c) => c.id === 0 ? { ...c, ...vecino, estado: "fuera", raciones: 5, destino: sal } : c) };
  s = M.avanzar(s);
  ok(!s.salidaAlcanzada && s.corredores[0].estado === "fuera", "sin marcas la salida no se puede cruzar");
  s = { ...s, marcas: M.MARCAS_PARA_SALIR, salidaConocida: true, corredores: s.corredores.map((c) => c.id === 0 ? { ...c, ...vecino, destino: sal } : c) };
  s = M.avanzar(s);
  ok(s.salidaAlcanzada && s.fin && s.fin.tipo === "victoria", "con las marcas leídas se cruza la salida");
}

// 7. la salida se puede alcanzar con un plan razonable (con las marcas ya leídas)
{
  let victorias = 0;
  for (let semilla = 1; semilla <= 20; semilla++) {
    let s = { ...M.revelarTodo(M.nuevaPartida(semilla)), marcas: M.MARCAS_PARA_SALIR, salidaConocida: true };
    while (!s.fin) {
      s = M.revelarTodo(s); // el bot juega con información completa
      // buscar la salida en el mapa actual
      let sal = null;
      for (let y = 0; y < 15; y++) for (let x = 0; x < 15; x++) if (s.mapa[y][x] === "S") sal = { x, y };
      const c0 = s.corredores[0];
      if (c0.estado === "ciudad") {
        const ruta = M.camino(s.mapa, c0, sal);
        const ticks = Math.ceil(ruta ? ruta.length / M.velocidad(s) : 999);
        if (ruta && ticks <= 8 * M.TICK_ECONOMIA && s.comida >= 8) s = M.enviar(s, 0, sal, 8);
      } else if (c0.estado === "fuera") {
        s = M.cambiarDestino(s, 0, sal);
      }
      s = M.avanzar(s);
    }
    if (s.fin.tipo === "victoria") victorias++;
  }
  console.log(`victorias con plan directo: ${victorias}/20`);
  ok(victorias >= 8, "la salida debería ser alcanzable en al menos 8 de 20 semillas");
}

// 8. niebla: al inicio solo se conoce el entorno de la ciudad, y explorar destapa
{
  let s = M.nuevaPartida(3);
  const desconocidas = s.conocido.join("").split("").filter((c) => c === "?").length;
  ok(desconocidas > 150 && desconocidas < 225, "al inicio casi todo es desconocido");
  ok(!s.conocido.join("").includes("S"), "la salida no se ve al inicio");
  const d = M.distancias(s.mapa, { x: 7, y: 7 });
  let lejos = null;
  for (const [k, v] of d) if (v >= 6 && !M.esCiudad(k % 15, Math.floor(k / 15))) { lejos = { x: k % 15, y: Math.floor(k / 15) }; break; }
  s = M.enviar(s, 0, lejos, 6);
  for (let i = 0; i < 8; i++) s = M.avanzar(s);
  const despues = s.conocido.join("").split("").filter((c) => c === "?").length;
  ok(despues < desconocidas, "explorar destapa celdas");
  // la ruta se planifica con lo conocido: un corredor nunca atraviesa una pared real sin atajo
  let s2 = M.nuevaPartida(4);
  const rng = M.crearRng(1);
  for (let t = 0; t < 120 && !s2.fin; t++) {
    for (const c of s2.corredores) {
      if (c.estado === "ciudad" && rng() < 0.2) s2 = M.enviar(s2, c.id, { x: Math.floor(rng() * 15), y: Math.floor(rng() * 15) }, 6);
      else if (c.estado === "fuera" && !c.destino) s2 = M.volver(s2, c.id);
    }
    s2 = M.avanzar(s2);
    for (const c of s2.corredores) if (c.estado === "fuera") ok(s2.mapa[c.y][c.x] !== "#", `corredor dentro de una pared en tick ${t}`);
  }
}

console.log(fallos === 0 ? "TODO OK" : `${fallos} fallos`);
process.exit(fallos ? 1 : 0);
