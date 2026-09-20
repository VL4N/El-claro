# Bitácora

Registro ordenado de lo que se hizo y lo que se decidió, sesión por sesión. Es la fuente de verdad del avance: si algo no está aquí, no se decidió.

Cada entrada tiene tres partes: **hecho**, **decidido** y **siguiente**. Las decisiones llevan el motivo, porque dentro de tres meses nadie se va a acordar.

Seguimiento vivo en GitHub: [issues por fase](../../issues?q=label%3Aseguimiento) y el [diario de desarrollo](../../issues/8).

---

## 2026-09-19 · Sesión 1: de la idea al prototipo de papel

**Hecho**

- Se discutió la idea inicial: juego de estrategia estilo Maze Runner, laberinto con una ciudad adentro.
- Se escribió el mapeo del juego (`docs/01-mapeo-del-juego.md`) y la ruta por fases (`docs/02-ruta-de-desarrollo.md`).
- Se creó este repositorio, separado del mod de Project Zomboid donde nació la conversación.
- Se preparó todo el material de la fase 0: reglas en una página, tablero imprimible en cinco estados, plantilla de registro y scripts de verificación.
- Se montó el seguimiento en GitHub: una issue por fase con entregables y puerta de decisión, sub-issues por partida para la fase 0, y la issue de diario.
- Se intentó marcar hitos con etiquetas de git, pero el entorno de trabajo no permite subirlas. Los hitos quedan registrados como issues de fase cerradas.

**Decidido**

- **Nombre provisional: El Claro** (la ciudad) y **El Muro** (el laberinto). Motivo: nombres neutros que no remiten a Maze Runner y se pueden cambiar sin costo.
- **Cuatro pilares** como filtro de ideas: el laberinto se aprende, cada persona cuenta, adentro y afuera se afectan, la presión viene del reloj. Motivo: evitar que el proyecto sea dos juegos pegados.
- **Distancia explícita de Maze Runner.** Se toma solo la mecánica del laberinto cambiante. Motivo: identidad propia y menos riesgo de parecer un fan game.
- **Solo tres recursos** (comida, materiales, conocimiento) y **materiales solo del laberinto**. Motivo: obligar a salir; es la dependencia que sostiene el bucle.
- **Fase 0 en papel antes de programar.** Motivo: validar el dilema "mando ahora o espero" cuesta una semana en papel y un mes en código.
- **Regla de cambio de la fase 0:** las filas pares se desplazan una celda a la derecha cada tres turnos. Motivo: es la regla más simple que produce rutas que aparecen y desaparecen y que un jugador puede predecir.
- **Diseño del tablero por búsqueda con script**, no a mano. Motivo: garantizar que la salida esté cerrada al inicio (turnos 1 a 3), abierta en los turnos 4 a 9 y 13 a 15, y cerrada en 10 a 12, con la ciudad nunca aislada.
- **Los corredores en filas pares se mueven con la fila.** Motivo: el cambio nunca mata directamente; el riesgo real es quedarse sin raciones lejos de la ciudad. Eso mantiene el foco en la decisión, no en la suerte.
- **Autor de los commits: DIAF.** Motivo: es el proyecto del autor, no del asistente. Los dos primeros commits quedan con el nombre "claude" porque reescribirlos requiere un push forzado que se dejó en manos del autor.
- **Motor: sin decidir.** Se decide en la fase 1. Recomendación en pie: Godot 4, con HTML y JavaScript como alternativa.

**Siguiente**

- Imprimir el tablero y jugar cinco partidas (issues #9 a #13).
- Subir un registro por partida a `fase-0/partidas/`.
- Revisar la puerta de decisión (issue #14) y cerrar la fase 0 (issue #1).
