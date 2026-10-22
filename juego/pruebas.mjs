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
  const ev = M.evaluarMapa(g.mapa);
  ok(ev.valido, `semilla ${semilla}: evaluación inválida`);
  ok(!ev.salidaAbierta[0], `semilla ${semilla}: salida abierta al inicio`);
  ok(g.mapa.length === 15 && g.mapa.every((f) => f.length === 15), `semilla ${semilla}: tamaño`);
  ok(g.mapa[7][7] === "C", `semilla ${semilla}: ciudad en el centro`);
}
console.log(`mapas válidos: ${generados}/30, intentos promedio: ${(intentosTotal / generados).toFixed(1)}`);

// 2. desplazamiento conserva celdas y es inverso en 15 pasos
{
  const g = M.generarMapa(3).mapa;
  let m = g;
  for (let i = 0; i < 15; i++) m = M.desplazarMapa(m);
  ok(m.join("") === g.join(""), "15 desplazamientos deben volver al inicio");
  ok(M.desplazarMapa(g)[7] === g[7], "la fila de la ciudad no se mueve");
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
  let s = { ...M.nuevaPartida(3), conocimiento: 2 };
  s = M.consultarFila(s, 1);
  ok(s.filasConocidas[1] === "derecha" && s.conocimiento === 1, "consultar una fila móvil del norte");
  s = M.consultarFila(s, 7);
  ok(s.filasConocidas[7] === "quieta" && s.conocimiento === 0, "la fila de la ciudad está quieta");
  s = M.consultarFila(s, 13);
  ok(s.filasConocidas[13] === undefined, "sin conocimiento no se consulta");
  s = M.consultarFila({ ...s, conocimiento: 1 }, 7);
  ok(s.conocimiento === 1, "una fila ya conocida no se cobra");
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
