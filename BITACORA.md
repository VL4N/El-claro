# Bitácora

Registro ordenado de lo que se hizo y lo que se decidió, sesión por sesión. Es la fuente de verdad del avance: si algo no está aquí, no se decidió.

Cada entrada tiene tres partes: **hecho**, **decidido** y **siguiente**. Las decisiones llevan el motivo, porque dentro de tres meses nadie se va a acordar.

Seguimiento vivo en GitHub: [issues por fase](../../issues?q=label%3Aseguimiento) y el [diario de desarrollo](../../issues/8).

---

## 2026-10-22 · Sesión 7: la fase 1 no pasa su puerta, y se sabe por qué

**Hecho**

- El autor respondió la puerta de la fase 1 tras ocho partidas: **no jugaría 20 minutos seguidos, se vuelve repetitivo**. La única duda real vino de las flechas del borde, que no entendió. Lo obvio: esperar a que la salida tuviera ruta.
- Sus dos propuestas: ir descubriendo el mapa, y que la salida no aparezca hasta tener todas las pistas. Son el contenido de la fase 2.
- Implementado en el motor y la interfaz: niebla de guerra, regla del giro oculta y salida invisible hasta leer 4 marcas.

**Decidido**

- **La fase 1 se cierra como "no pasa, causa identificada".** La causa es información completa: con el mapa y la regla a la vista, la partida se resuelve mirando. No se arregla con números; se arregla con descubrimiento. Por eso se pasa a la fase 2 sin más ajustes de balance.
- **Niebla de guerra.** Al inicio solo se conoce el entorno de la ciudad. Cada corredor destapa un radio de una celda a su paso. Lo visto se recuerda. Motivo: cada partida se vuelve distinta y mandar un corredor a lo desconocido es una decisión con riesgo real.
- **Las rutas se planifican con lo que se sabe, suponiendo transitable lo desconocido.** Si el corredor se topa con una pared real, se detiene, la destapa y replanifica al segundo siguiente. Si el destino resulta ser pared, se queda esperando órdenes. Motivo: el corredor no puede saber más que el jugador; si usara el mapa real, filtraría información.
- **La regla del giro es oculta.** Se quitaron las flechas y el sombreado de filas. El reloj sigue diciendo cuándo gira; cuáles filas y hacia dónde se descubre observando. Lo visto antes del último giro se dibuja apagado porque puede haber cambiado. Motivo: es el pilar "el laberinto se aprende", y además elimina la confusión de las flechas.
- **La salida es invisible hasta leer 4 marcas.** Al leer la cuarta, el registro dice dónde está y aparece en el mapa. Motivo: propuesta directa del autor; reemplaza el "sello" de la sesión 6 con algo más claro.
- **Las pruebas con información completa usan `revelarTodo`.** Motivo: la verificación de "la salida es alcanzable" sigue valiendo, pero el bot debe ver el mapa real para hacerla.

**Siguiente**

- Que el autor juegue con niebla y responda de nuevo la puerta: ¿jugaría 20 minutos seguidos?
- Fase 2 propiamente dicha: historial de giros y biblioteca de reglas de patrón, cuando la niebla esté validada.

---

## 2026-10-22 · Sesión 6: seis partidas del autor y la salida sellada

**Hecho**

- El autor jugó seis partidas y pegó el registro (guardado en `fase-1/partidas/2026-10-22-autor.json`). Resultado: una derrota por comida con la economía vieja y cinco victorias, cuatro de ellas antes del tick 90, es decir, en el primer giro.
- Lectura: la estrategia dominante era esperar el primer giro y mandar un corredor directo a la salida. Materiales, huerto y taller casi no importaban. El juego era fácil y corto.
- También preguntó para qué sirve el taller, porque no notaba el cambio. El mensaje del registro decía "3 celdas por turno", una frase vieja de la versión por turnos.

**Decidido**

- **La salida está sellada hasta leer 4 marcas.** Un corredor que llega a la S sin las marcas se queda ahí y el registro lo explica. Un aviso sobre el tablero muestra "Salida sellada: 2 de 4 marcas" y la S se pinta gris hasta que se abre. Motivo: obliga a explorar antes de salir, hace que los viajes cuesten raciones y que el huerto y el taller tengan sentido. Es la versión simple de la regla de la fase 2 (salir exige conocer el patrón), adelantada porque el juego la necesita ya.
- **El taller se explica donde se usa.** El botón dice "velocidad ×2", el registro dice que los viajes duran la mitad y la estimación de raciones ya lo refleja. El movimiento de dos celdas por segundo ahora se interpola y se ve fluido.
- **La comida muestra su ritmo** ("+1 cada 6 s") al lado del número, para que se entienda que esperar también produce.
- **Los registros de partida van al repositorio**, en `fase-1/partidas/`, una tanda por archivo, con una lectura corta en el README de la carpeta. Motivo: son la evidencia de cada ajuste de balance.

**Siguiente**

- Que el autor juegue de nuevo con la salida sellada. Preguntas: ¿cuántas partidas gana?, ¿cuánto duran?, ¿el huerto y el taller ahora pesan?

---

## 2026-10-22 · Sesión 5: primer ajuste con partidas reales

**Hecho**

- GitHub Pages activado por el autor y publicación funcionando. El juego vive en https://vl4n.github.io/El-claro/ y se instala como aplicación.
- Primer comentario del autor tras jugar: "hay muy poca comida para conseguir materiales, y no sé cuántas raciones darle para que no se pierda".
- Corrección en dos frentes: información y economía.

**Decidido**

- **El juego recomienda las raciones.** Al elegir destino muestra celdas de ida, de vuelta, segundos totales y las raciones recomendadas (ida y vuelta más una de margen por si gira el laberinto), y preselecciona ese número. Motivo: la decisión "mando ahora o espero" solo es interesante si el jugador sabe cuánto cuesta el viaje. Antes era adivinar.
- **Cada corredor fuera muestra cuánto tiempo le queda y avisa en rojo si no le alcanza para volver.** Motivo: perder un corredor tiene que ser una decisión que se vio venir, no una sorpresa.
- **Economía: comida inicial 14, la ciudad produce 3 y consume 2** (antes 10, 2 y 2). Motivo: con producción neta cero, la comida inicial era el único presupuesto y se agotaba en dos viajes. Ahora crece 1 cada 6 segundos: esperar tiene valor real, y el huerto sigue siendo la mejora importante. Máximo de raciones por viaje: 10.
- **Se mantiene que el corredor sin raciones se pierde.** Motivo: es el costo que da peso a la decisión. Se revisa si en las siguientes partidas sigue sintiéndose injusto aun con la información nueva.

**Siguiente**

- Que el autor vuelva a jugar con estos cambios y diga si la comida sigue sintiéndose corta.

---

## 2026-10-21 · Sesión 4: aplicación instalable

**Hecho**

- El juego se instala como aplicación en el celular: manifiesto web, iconos y un trabajador de servicio que lo guarda para abrirlo sin conexión y busca la versión nueva cuando hay red.
- Tema oscuro: la interfaz y el tablero siguen el tema del sistema.
- Empaquetador a un solo archivo HTML con el motor incrustado, para compartir sin servidor o publicarlo como página privada en claude.ai.

**Decidido**

- **La base del juego es web y lo será hasta el final.** Lo que cambia por plataforma es el envoltorio: aplicación web instalable ahora, Capacitor para las tiendas y Tauri o Electron para PC en la fase 6. Motivo: una sola base de código, probada automáticamente, publicada sin costo. Godot solo si en la fase 5 hiciera falta algo que el navegador no da.
- **GitHub Pages necesita que el repositorio sea público** en el plan gratuito. Queda en manos del autor: hacerlo público, o jugar desde la página privada en claude.ai que mantiene el asistente.
- **Los minutos de GitHub Actions no son un problema:** el flujo corre solo cuando cambia la carpeta del juego y dura uno o dos minutos, contra 2.000 al mes del plan gratuito.

**Siguiente**

- Decidir visibilidad del repositorio. Jugar 10 partidas. Responder la puerta de la fase 1.

---

## 2026-10-21 · Sesión 3: tiempo real

**Hecho**

- El motor avanza en ticks de un segundo: economía y raciones cada 6, giro cada 36, partida de 6 minutos. Las pruebas se adaptaron y pasan.
- La interfaz corre sola con botón de Jugar/Pausa, velocidad ×1 o ×2, barra espaciadora para pausar y movimiento interpolado de los corredores.
- Mapeo y ruta actualizados al nuevo bucle.

**Decidido**

- **Tiempo real con pausa, un solo jugador.** Es la idea original del autor: "que pase todo a la vez, como Age of Empires, pero en el laberinto". Motivo para la pausa: la habilidad que se quiere premiar es decidir, no reaccionar. La pausa deja pensar y la presión sigue viniendo del reloj del giro y de las raciones.
- **El motor sigue siendo discreto.** Un tick por segundo, como función pura. Motivo: se prueba sin navegador, la pausa es trivial y la velocidad ×2 es solo cambiar el reloj.
- **Sobre el aspecto visual "tipo Age of Empires":** se separó en tres cosas. La vista isométrica la hace el asistente con arte por código, como fase 1b opcional. El arte con acabado profesional queda para la fase 5 y requiere arte generado (con créditos del autor) o una persona que dibuje. El tiempo real ya está resuelto.
- **Un prototipo es simple a propósito.** Motivo: se construye lo mínimo para responder una sola pregunta (¿es divertido el dilema central?) antes de invertir en arte, ciudad grande o narrativa. Todo lo demás viene en las fases siguientes, una capa por fase.

**Siguiente**

- Activar GitHub Pages (lo hace el autor) y jugar 10 partidas.
- Si la puerta pasa: fase 1b, vista isométrica.

---

## 2026-10-21 · Sesión 2: el prototipo pasa a código

**Hecho**

- Motor del juego como lógica pura en `juego/motor.js`: generación de mapas verificada, giro del laberinto, caminos, expediciones, raciones, hallazgos, construcción, atajo y fin de partida.
- Pruebas automáticas en `juego/pruebas.mjs`: generación, giro, salida alcanzable, casos de la ciudad y 40 partidas al azar sin errores.
- Interfaz para celular en `juego/index.html`, probada con Playwright en un viewport de 390 píxeles.
- Flujo de GitHub Actions que corre las pruebas y publica `juego/` en GitHub Pages.
- Registro automático de partidas en el navegador (resultado, turno, duración, puntos) con botón para copiarlo.

**Decidido**

- **Motor: web (HTML, JavaScript y canvas), sin frameworks.** Motivo: el autor juega desde el celular, el asistente puede probarlo con un navegador automatizado, y GitHub Pages lo publica gratis. Godot queda como opción para la fase 5 si hace falta.
- **La fase 0 en papel deja de ser obligatoria.** Motivo: un prototipo digital que se corrige en horas vale más que uno en papel. La puerta de decisión sigue en pie, pero se responde jugando el prototipo.
- **Reparto de trabajo: el asistente programa, prueba y documenta; el autor juega, decide y provee lo que el asistente no puede hacer** (jugar con personas, criterio de diversión, arte final).
- **Tamaño 15x15, ciudad 3x3 en el centro, 24 turnos, giro cada 4.** Motivo: es el alcance de la fase 1 en la ruta. Se incluyó la salida como victoria aunque la ruta decía "sin victoria todavía", porque es el ancla de la tensión y cuesta casi nada.
- **Giro en dos sentidos.** Las filas pares del norte van a la derecha y las del sur a la izquierda, y las tres filas de la ciudad no se mueven. Motivo: con una sola dirección la ciudad quedaba en una fila móvil. Además, "el laberinto gira alrededor de la ciudad" se entiende de un vistazo.
- **Economía: comida 10, la ciudad produce 2 y consume 2.** Las raciones son el único gasto y el huerto el único ingreso extra. Derrota si la ciudad pasa dos turnos seguidos en cero. Motivo: con consumo mayor a producción las partidas morían de hambre antes de que la salida se abriera; con esto, la comida es un presupuesto finito que el jugador decide cómo gastar.
- **Los corredores parten desde la celda de la ciudad más cercana al destino y no se pueden enviar a la ciudad.** Motivo: corrige un error donde un corredor "volvía" sin haber salido.
- **El generador de mapas rechaza mapas malos:** salida cerrada al inicio, abierta entre 2 y 4 de los 6 giros, a entre 10 y 16 pasos, ciudad nunca aislada, hallazgos alcanzables. Motivo: la misma lógica que en el tablero de papel, ahora automática.

**Siguiente**

- Activar GitHub Pages en el repositorio (Settings, Pages, Source: GitHub Actions). Lo hace el autor.
- Jugar al menos 10 partidas y copiar el registro a la issue de la fase 1.
- Responder la pregunta de la fase 1: ¿jugarías 20 minutos seguidos sin obligación?

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
