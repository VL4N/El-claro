# Bitácora

Registro ordenado de lo que se hizo y lo que se decidió, sesión por sesión. Es la fuente de verdad del avance: si algo no está aquí, no se decidió.

Cada entrada tiene tres partes: **hecho**, **decidido** y **siguiente**. Las decisiones llevan el motivo, porque dentro de tres meses nadie se va a acordar.

Seguimiento vivo en GitHub: [issues por fase](../../issues?q=label%3Aseguimiento) y el [diario de desarrollo](../../issues/8).

---

## 2026-10-22 · Sesión 13: dificultad según la partida

**Hecho**

- El patrón de cada partida se elige por nivel de dificultad, 1 a 5. En automático, el nivel es 1 más el número de victorias con las reglas actuales, hasta 5; en el nivel 5 se mezclan los dos niveles más altos. Se puede fijar a mano en la pestaña Ayuda.
- Al terminar la partida se revela el nombre y la dificultad del patrón, y si la próxima sube de nivel.
- Los registros de partida llevan versión de reglas, dificultad y nombre del patrón.

**Decidido**

- **Sube un nivel por victoria, nunca baja.** Motivo: una derrota ya castiga; bajar el nivel haría sentir que el juego se rinde por el jugador. Quien quiera repetir un nivel lo fija a mano.
- **Solo cuentan las victorias con las reglas actuales.** Los registros llevan un número de versión; las partidas anteriores a la biblioteca de patrones no suben el nivel. Motivo: el autor ya tiene diez victorias de versiones viejas y empezaría en 5 sin haber visto un patrón fácil.
- **El nombre del patrón se revela al final, nunca durante.** Motivo: es la recompensa de la deducción y además enseña el vocabulario para la próxima partida.

**Siguiente**

- Sala de mapas por hipótesis y pruebas con personas nuevas. Y la puerta de la fase 2, que la responde el autor.

---

## 2026-10-22 · Sesión 12: historial de giros y marcas que hablan

**Hecho**

- Historial completo de giros en la pestaña Mapas: un registro por giro con el mapa conocido de antes y las celdas que cambiaron a la vista. Flechas para recorrerlo. Al producirse un giro nuevo, vuelve al último.
- Las marcas dicen algo al leerse. La primera, la idea general del patrón ("aquí lo que se mueve son columnas, no filas"). Las siguientes, una línea que se mueve, sin decir hacia dónde, y con una señal si el ritmo es raro ("no siempre hacia el mismo lado", "no en todos los giros"). Lo leído se acumula en "Lo que dicen las marcas".
- Pruebas: orden y contenido de las pistas, lectura al pisar una marca, y un registro de historial por giro.

**Decidido**

- **Las marcas dan pistas parciales, no respuestas.** Nombran la línea pero no la dirección; la sala de mapas la confirma gastando conocimiento. Motivo: una marca que diera la respuesta completa dejaría sin sentido a la sala de mapas y al historial. Así cada herramienta aporta una parte: la marca dice dónde mirar, el historial muestra qué pasó, la sala confirma.
- **El orden de las pistas es por semilla, con la idea general siempre primero.** Motivo: la primera marca tiene que orientar; después da igual el orden.
- **El historial guarda solo lo que el jugador conocía**, no el mapa real. Motivo: igual que la niebla; la memoria del jugador es el material del misterio.

**Siguiente**

- Que el autor juegue con todo esto y responda la puerta de la fase 2: ¿descubre al menos una regla por su cuenta?
- Dificultad del patrón según la partida y pruebas con personas nuevas.

---

## 2026-10-22 · Sesión 11: biblioteca de reglas y pestañas

**Hecho**

- Biblioteca de doce patrones de giro, de dificultad 1 a 5, documentada en `docs/03-biblioteca-de-reglas.md`. Cada partida elige uno según la semilla.
- El motor ya no tiene la regla fija: un patrón es una lista de líneas (filas o columnas) con sentido y ritmo (fijo, alterna, cada dos). Pruebas para los doce: la ciudad nunca se mueve, el mapa no se rompe, los corredores siguen a su celda, y se genera un mapa válido con cada uno.
- La sala de mapas ahora pregunta por filas y columnas, y describe ritmos: "va y vuelve", "solo en giros pares".
- Interfaz en pestañas (Ciudad, Mapas, Registro, Ayuda) debajo de las órdenes. Tablero, corredores y órdenes caben en una pantalla de celular.

**Decidido**

- **Un patrón por partida, elegido al azar entre los doce.** Motivo: es lo más simple que hace que cada partida sea distinta. La ruta hablaba de componer 3 a 5 reglas; se deja para cuando se vea cómo se aprenden los patrones de a uno.
- **Las columnas también pueden moverse.** Motivo: amplía mucho el espacio de patrones sin agregar conceptos: la misma idea, en el otro eje.
- **Tres ritmos: fijo, alterna y cada dos.** Motivo: son los que se pueden descubrir comparando dos o tres giros seguidos. Ritmos más largos exigirían el historial de varios giros, que todavía no existe.
- **Lo que no está a la vista no se mueve de lugar en el mapa conocido.** Sigue igual que antes: la memoria del jugador no se actualiza sola. Motivo: si el mapa conocido siguiera el patrón, el juego estaría resolviendo el misterio por el jugador.
- **Pestañas en vez de una página larga.** Pedido del autor: "no me da la pantalla para subir y bajar mientras el tiempo corre". Motivo: en tiempo real, lo que se necesita para decidir tiene que estar a la vista sin scroll. Construcción, mapas, registro y ayuda se abren solo cuando se necesitan.

**Siguiente**

- Que el autor juegue partidas con patrones distintos y diga si llega a identificar alguno.
- Historial de varios giros y pistas en palabras en las marcas.

---

## 2026-10-22 · Sesión 10: giros cada minuto

**Decidido**

- **El laberinto gira cada 60 segundos** (antes 36). Pedido del autor: "suceden a cada rato". Motivo: para aprender un patrón hay que poder observar un estado, planear con él y ver el siguiente. Con 8 minutos de partida quedan 8 giros, suficientes para que el patrón se repita y se note.

---

## 2026-10-22 · Sesión 9: comparar sin tapar, y la sala de mapas

**Hecho**

- El autor probó "Antes del giro": le sirvió para ver qué había descubierto, pero no para entender los giros, porque la vista tapaba la partida.
- Reemplazado por un mapa pequeño permanente debajo del tablero con el laberinto como se conocía antes del último giro, con las celdas cambiadas marcadas en los dos mapas y una nota que dice en qué filas.
- Sala de mapas: se elige una fila y se gasta 1 conocimiento para saber si se mueve a la derecha, a la izquierda o no se mueve. Lo confirmado queda marcado en los bordes del tablero.
- Una partida más del autor con niebla: victoria al tick 166, con taller y un perdido.

**Decidido**

- **Comparar, no reemplazar.** Dos mapas a la vez, el grande presente y el chico pasado. Motivo: aprender un patrón es comparar, y no se puede comparar lo que no se ve junto.
- **La sala de mapas responde preguntas directas por fila, a 1 conocimiento cada una.** Motivo: el conocimiento viene de las marcas, que son seis por mapa y cuatro hacen falta para la salida, así que cada pregunta compite con el atajo y hay que elegir qué filas importan. Es la versión mínima de "confirmar hipótesis"; si funciona, en la biblioteca de reglas las preguntas serán sobre reglas y no sobre filas.
- **El panel de órdenes vuelve a estar pegado a las tarjetas de corredores.** Motivo: con los paneles nuevos había quedado lejos del tablero.

**Siguiente**

- Preguntarle al autor si con el mapa chico y la sala de mapas entiende los giros.
- Biblioteca de reglas de patrón para que cada partida sea distinta.

---

## 2026-10-22 · Sesión 8: la puerta de la fase 1 pasa con niebla; los giros se sienten aleatorios

**Hecho**

- El autor jugó tres partidas con niebla: tiempo agotado, victoria al final y derrota rápida. Por primera vez los resultados varían.
- Respondió la puerta: **ahora sí jugaría 20 minutos**, porque "tengo que ir aprendiendo poco a poco cuánto gasto o no". Los giros, en cambio, **se sintieron aleatorios**.
- Aplicado lo que pidió: partida de 8 minutos y reclutar corredores. Además, margen de raciones por zona sin explorar, y dos herramientas para que los giros se puedan aprender: las celdas a la vista que cambiaron se marcan unos segundos y el registro dice en qué filas, y un botón "Antes del giro" muestra el mapa como se conocía antes del último giro.

**Decidido**

- **La puerta de la fase 1 se da por superada con la niebla.** El bucle base es divertido cuando hay algo que descubrir. Se deja constancia en la issue #2, que queda cerrada.
- **Partida de 8 minutos** (480 ticks). Motivo: explorar a oscuras necesita tiempo; con 6 minutos una partida se agotó sin encontrar la salida.
- **Reclutar corredores: 3 materiales y 2 comida, hasta 6 vivos.** Motivo: perder a los tres terminaba la partida de golpe. El costo en materiales compite con el huerto y el taller, así que sigue doliendo.
- **Margen de raciones por niebla: una ración más por cada 4 celdas sin explorar en la ida.** Motivo: la ruta supone transitable lo desconocido; sin margen, las paredes escondidas mataban corredores sin aviso.
- **Primer paso del "historial de giros" de la fase 2:** comparar antes y después del último giro, solo con lo que estaba a la vista. Motivo: aprender una regla exige ver qué cambió. Se marcan las celdas y se nombran las filas, pero no la dirección: eso lo deduce el jugador.
- **Los corredores ocupan la plaza de tres en tres.** Motivo: con reclutas, la fila única no alcanzaba.

**Siguiente**

- Que el autor juegue y diga si con "Antes del giro" logra descubrir el patrón. Si no, el siguiente paso es un historial de varios giros y la sala de mapas para confirmar hipótesis.
- Biblioteca de reglas de patrón, para que cada partida tenga una regla distinta.

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
